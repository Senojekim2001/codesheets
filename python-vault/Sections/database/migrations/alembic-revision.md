---
type: "entry"
domain: "python"
file: "database"
section: "migrations"
id: "alembic-revision"
title: "Alembic revision — write a safe online migration"
category: "Migrations"
subtitle: "op.add_column, op.alter_column, server_default, op.execute, batch_alter_table, op.create_index(postgresql_concurrently=True)"
signature_short: "def upgrade(): op.add_column(\"events\", sa.Column(\"tenant_id\", sa.Integer, nullable=True))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Alembic revision — write a safe online migration"
  - "alembic-revision"
tags:
  - "python"
  - "python/database"
  - "python/database/migrations"
  - "category/migrations"
  - "tier/tiered"
---

# Alembic revision — write a safe online migration

> op.add_column, op.alter_column, server_default, op.execute, batch_alter_table, op.create_index(postgresql_concurrently=True)

## Overview

A migration is just two functions — `upgrade()` and `downgrade()` — composed of `op.`-prefixed primitives. The hard part isn't the API; it's rolling out a schema change to a production table without taking it offline. The canonical case: adding a NOT NULL column. Done naively in one revision, this acquires an `ACCESS EXCLUSIVE` lock and rewrites the table. Done correctly, it's three small revisions: add nullable, backfill, enforce. The three examples solve the SAME task at three depths: one-shot revision → split into three migrations → split + chunked backfill + lock-timeout-safe ALTER.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Add a NOT NULL events.tenant_id column with a default of 1.
- **Junior** — SAME: add NOT NULL events.tenant_id — but online-safe.
- **Senior** — SAME: add NOT NULL events.tenant_id on a 10M-row Postgres table.

## Signature

```python
def upgrade(): op.add_column("events", sa.Column("tenant_id", sa.Integer, nullable=True))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Add a NOT NULL events.tenant_id column with a default of 1.
# APPROACH  - One revision; add the column with NOT NULL + server_default.
# STRENGTHS - Smallest correct migration; works on small tables.
# WEAKNESSES- Postgres + a large table = ACCESS EXCLUSIVE lock for the
#             duration of the table rewrite. Will be felt by users.

# alembic/versions/2026_05_01_0001_add_tenant_id.py
"""add tenant_id to events

Revision ID: 0001_add_tenant_id
Revises: 0000_init
Create Date: 2026-05-01 12:00:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_add_tenant_id"
down_revision = "0000_init"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column(
        "events",
        sa.Column(
            "tenant_id", sa.Integer,
            nullable=False,
            server_default="1",                     # required so existing rows have a value
        ),
    )

def downgrade() -> None:
    op.drop_column("events", "tenant_id")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME: add NOT NULL events.tenant_id — but online-safe.
# APPROACH  - Three revisions: add nullable, backfill, enforce NOT NULL.
#             Each migration is short; brief lock per step; rollout is
#             "deploy migration 1, wait, deploy migration 2, wait, ..."
# STRENGTHS - Works on real-sized tables; downgrade path is clear.
# WEAKNESSES- A backfill via a single UPDATE on 10M rows still takes
#             one big transaction (see senior tier for the chunked form).

# Migration 1 — add the column as nullable. Fast; no rewrite.
# alembic/versions/2026_05_01_0001_add_tenant_id_nullable.py
from alembic import op
import sqlalchemy as sa

revision = "0001_add_tenant_id_nullable"
down_revision = "0000_init"

def upgrade() -> None:
    op.add_column("events", sa.Column("tenant_id", sa.Integer, nullable=True))

def downgrade() -> None:
    op.drop_column("events", "tenant_id")

# Migration 2 — backfill. Uses op.execute for raw SQL.
# alembic/versions/2026_05_01_0002_backfill_tenant_id.py
from alembic import op

revision = "0002_backfill_tenant_id"
down_revision = "0001_add_tenant_id_nullable"

def upgrade() -> None:
    # Set every existing row to tenant_id = users.tenant_id via the user_id FK.
    op.execute("""
        UPDATE events
           SET tenant_id = u.tenant_id
          FROM users u
         WHERE events.user_id = u.id
           AND events.tenant_id IS NULL
    """)

def downgrade() -> None:
    op.execute("UPDATE events SET tenant_id = NULL")

# Migration 3 — enforce NOT NULL. Fast; quick metadata-only ALTER on PG.
# alembic/versions/2026_05_01_0003_tenant_id_not_null.py
from alembic import op

revision = "0003_tenant_id_not_null"
down_revision = "0002_backfill_tenant_id"

def upgrade() -> None:
    op.alter_column("events", "tenant_id", nullable=False)

def downgrade() -> None:
    op.alter_column("events", "tenant_id", nullable=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME: add NOT NULL events.tenant_id on a 10M-row Postgres table.
# APPROACH  - Three revisions, but: chunked backfill that doesn't touch
#             10M rows in one transaction; lock_timeout on the NOT NULL
#             ALTER so the deploy fails fast instead of locking the world;
#             concurrent index creation outside Alembic's transaction.
# STRENGTHS - Predictable lock windows; survivable rollback at any step;
#             readable in the SQL log of a DBA who'll review it pre-deploy.
# WEAKNESSES- Three deploys instead of one; backfill is the long pole and
#             must be scheduled (run via a batch job, not the migration step).
from alembic import op
import sqlalchemy as sa

# ---- Migration 1: add nullable column + supporting index ---------------------
revision = "0001_add_tenant_id_nullable"
down_revision = "0000_init"

def upgrade() -> None:
    # Adding a nullable column on PG is fast — metadata only, no rewrite.
    op.add_column("events", sa.Column("tenant_id", sa.Integer, nullable=True))

    # Create the index CONCURRENTLY (not inside a transaction).
    # Alembic wraps each upgrade() in a transaction; we explicitly leave it.
    with op.get_context().autocommit_block():
        op.create_index(
            "ix_events_tenant_id",
            "events",
            ["tenant_id"],
            postgresql_concurrently=True,           # no AccessExclusiveLock
            if_not_exists=True,
        )

def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index("ix_events_tenant_id", postgresql_concurrently=True, if_exists=True)
    op.drop_column("events", "tenant_id")

# ---- Migration 2: chunked backfill -------------------------------------------
# This migration is intentionally a NO-OP. The backfill runs as a separate
# script (see data-migrations entry) so it can be paused, resumed, and
# monitored — none of which Alembic does well.
revision = "0002_tenant_id_backfill_marker"
down_revision = "0001_add_tenant_id_nullable"

def upgrade() -> None:
    # Marker only: the operator runs scripts/backfill_tenant_id.py before
    # advancing past this revision. The CI gate is below.
    bind = op.get_bind()
    remaining = bind.execute(sa.text(
        "SELECT count(*) FROM events WHERE tenant_id IS NULL"
    )).scalar_one()
    if remaining:
        raise RuntimeError(
            f"{remaining} events rows still have NULL tenant_id; "
            "run scripts/backfill_tenant_id.py before applying this migration."
        )

def downgrade() -> None:
    pass

# ---- Migration 3: enforce NOT NULL with a strict lock_timeout ----------------
revision = "0003_tenant_id_not_null"
down_revision = "0002_tenant_id_backfill_marker"

def upgrade() -> None:
    # SET NOT NULL on PG <12 rewrites the table. PG >=12 only checks once,
    # which is fast — but we still defend against accidental deploys against
    # a long-running query holding a row lock.
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.execute("SET LOCAL statement_timeout = '60s'")
    op.alter_column("events", "tenant_id", nullable=False)
    # Optional: drop the server_default if you only used it for the backfill.

def downgrade() -> None:
    op.alter_column("events", "tenant_id", nullable=True)

# Decision rule:
#   small table (<100k rows)        -> one revision, NOT NULL + server_default is fine
#   large table on Postgres         -> THREE revisions: add nullable, backfill, enforce
#   backfill > 1M rows              -> chunked script OUTSIDE alembic; marker migration with assert
#   indexes on a hot table          -> postgresql_concurrently=True inside autocommit_block()
#   migration that holds AccessExclusive -> set lock_timeout; fail fast over making users wait
#   SQLite ALTER COLUMN             -> render_as_batch=True (env.py); rebuilds the table
#   need DBA review before deploy   -> alembic upgrade head --sql > deploy.sql; PR-attach it
#   migrations as Python (rare)     -> use op.execute(sa.text(...)) — keep dialect awareness
#
# Anti-pattern: a single migration that does add_column(NOT NULL) + UPDATE +
# ALTER all in one transaction on a 10M-row table. PG holds an
# AccessExclusiveLock for the whole rewrite + index-rebuild + UPDATE; readers
# AND writers stall; the deploy times out at the load balancer; the
# transaction rolls back; you've taken downtime AND made no progress. Split
# the work; cap each step's blast radius.
```

## Decision Rule

```text
small table (<100k rows)        -> one revision, NOT NULL + server_default is fine
large table on Postgres         -> THREE revisions: add nullable, backfill, enforce
backfill > 1M rows              -> chunked script OUTSIDE alembic; marker migration with assert
indexes on a hot table          -> postgresql_concurrently=True inside autocommit_block()
migration that holds AccessExclusive -> set lock_timeout; fail fast over making users wait
SQLite ALTER COLUMN             -> render_as_batch=True (env.py); rebuilds the table
need DBA review before deploy   -> alembic upgrade head --sql > deploy.sql; PR-attach it
migrations as Python (rare)     -> use op.execute(sa.text(...)) — keep dialect awareness
```

## Anti-Pattern

> [!warning] Anti-pattern
> a single migration that does add_column(NOT NULL) + UPDATE +
> ALTER all in one transaction on a 10M-row table. PG holds an
> AccessExclusiveLock for the whole rewrite + index-rebuild + UPDATE; readers
> AND writers stall; the deploy times out at the load balancer; the
> transaction rolls back; you've taken downtime AND made no progress. Split
> the work; cap each step's blast radius.

## Tips

- Adding a nullable column on Postgres is a metadata-only operation. Adding a NOT NULL column on a large table rewrites it. Always: add nullable → backfill → enforce, in three deploys.
- Wrap concurrent index creation in `with op.get_context().autocommit_block():` — Alembic's default per-migration transaction blocks `CREATE INDEX CONCURRENTLY`.
- Set `SET LOCAL lock_timeout` and `statement_timeout` at the top of each upgrade() that takes a strong lock. Failing in 5 seconds beats blocking writers for 5 minutes.
- For SQLite, wrap ALTER operations in `with op.batch_alter_table("t") as b:` — most ALTER COLUMN forms aren't supported, batch mode rebuilds the table.
- Use `op.execute(sa.text("...").bindparams(...))` for parameterized raw SQL — never f-strings, even in migrations. Migration files are reviewed less and run as superuser; the cost of a tooling slip is high.
- Backfills on >1M rows belong in a separate, resumable script — not in a migration. Keep the migration step short and have it ASSERT the backfill ran (count NULLs).

## Common Mistake

> [!warning] Adding a NOT NULL column with a backfilling UPDATE in a single migration on a large table. Postgres holds an AccessExclusiveLock for the entire rewrite; readers and writers stall; the deploy times out at the load balancer; the transaction rolls back. Always: add nullable → backfill (separately) → enforce NOT NULL, each in its own short migration.

## Shorthand (Junior → Senior)

**Junior:**
```python
# All-in-one — locks the table for the rewrite duration
op.add_column("events", sa.Column("tenant_id", sa.Integer,
    nullable=False, server_default="1"))
```

**Senior:**
```python
# Three small migrations — bounded lock window per step
# 1) op.add_column(... nullable=True)
# 2) chunked UPDATE in a separate job
# 3) op.alter_column(... nullable=False)
```

## See Also

- [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/_Index|Databases & SQLAlchemy → Schema Migrations — Alembic]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

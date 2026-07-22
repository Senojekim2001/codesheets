---
type: "entry"
domain: "python"
file: "database"
section: "migrations"
id: "data-migrations"
title: "Data migrations — chunked, idempotent backfill"
category: "Migrations"
subtitle: "chunked UPDATE WHERE id BETWEEN, savepoint per chunk, progress table, resumable cursor, op.execute"
signature_short: "while batch := next_batch(): UPDATE events SET tenant_id=... WHERE id BETWEEN :lo AND :hi"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Data migrations — chunked, idempotent backfill"
  - "data-migrations"
tags:
  - "python"
  - "python/database"
  - "python/database/migrations"
  - "category/migrations"
  - "tier/tiered"
---

# Data migrations — chunked, idempotent backfill

> chunked UPDATE WHERE id BETWEEN, savepoint per chunk, progress table, resumable cursor, op.execute

## Overview

A "data migration" is any change to data that schema migrations don't handle: backfilling a new column, splitting a column, moving rows between tables, recoding values. The mistake is putting them inside Alembic — Alembic wraps each migration in a transaction, isn't resumable, can't pause, and locks every reviewer's deploy until the slow UPDATE finishes. The right place is a separate Python script that runs alongside Alembic, paged in chunks, idempotent so you can re-run it. The three examples solve the SAME task — backfill events.tenant_id from users.tenant_id for 10M rows — at three depths: one big UPDATE → chunked UPDATE → chunked + resumable + monitored.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Backfill events.tenant_id from users.tenant_id (one-shot UPDATE).
- **Junior** — SAME backfill — but in chunks so each transaction is bounded.
- **Senior** — SAME backfill at production scale: chunked + resumable + idempotent + monitored. Re-run is a no-op once complete.

## Signature

```python
while batch := next_batch(): UPDATE events SET tenant_id=... WHERE id BETWEEN :lo AND :hi
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Backfill events.tenant_id from users.tenant_id (one-shot UPDATE).
# APPROACH  - One UPDATE; trust the DB to handle it.
# STRENGTHS - Trivial; correct on small tables (<100k rows).
# WEAKNESSES- One transaction on a 10M-row table holds locks long enough to
#             timeout the load balancer, fill WAL, or trip alerts. Don't ship.
import os
from sqlalchemy import create_engine, text

engine = create_engine(os.environ["DATABASE_URL"])

with engine.begin() as conn:
    conn.execute(text("""
        UPDATE events
           SET tenant_id = u.tenant_id
          FROM users u
         WHERE events.user_id = u.id
           AND events.tenant_id IS NULL
    """))
print("done")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME backfill — but in chunks so each transaction is bounded.
# APPROACH  - Range-scan id BETWEEN :lo AND :hi; commit per chunk;
#             log progress; sleep briefly to give the DB headroom.
# STRENGTHS - Bounded lock per chunk; replication doesn't lag; restartable
#             from the last printed lo if interrupted.
# WEAKNESSES- "Restart from the last lo" requires reading logs; not great
#             for unattended re-runs (see senior tier for a progress table).
import os, time, logging
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
log = logging.getLogger("backfill")

engine = create_engine(os.environ["DATABASE_URL"])
CHUNK = 10_000

with engine.begin() as conn:
    max_id = conn.execute(text("SELECT coalesce(max(id), 0) FROM events")).scalar_one()
log.info(f"max events.id = {max_id}; chunk = {CHUNK}")

lo = 0
while lo <= max_id:
    hi = lo + CHUNK - 1
    with engine.begin() as conn:                       # one transaction per chunk
        n = conn.execute(text("""
            UPDATE events
               SET tenant_id = u.tenant_id
              FROM users u
             WHERE events.user_id = u.id
               AND events.tenant_id IS NULL
               AND events.id BETWEEN :lo AND :hi
        """), {"lo": lo, "hi": hi}).rowcount
    log.info(f"updated {n} rows in [{lo}, {hi}]")
    lo += CHUNK
    time.sleep(0.05)                                    # tiny breath; gives replication a chance
log.info("done")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME backfill at production scale: chunked + resumable +
#             idempotent + monitored. Re-run is a no-op once complete.
# APPROACH  - Persist progress in a backfill_state table; advance a cursor;
#             exit cleanly on SIGTERM; report rate + ETA; safe to run twice.
# STRENGTHS - Operator can stop/start at any time; observability is built in;
#             rerunning after a partial failure picks up where it left off.
# WEAKNESSES- More code. Worth it the second time you do this.
import os, signal, time, logging
from contextlib import contextmanager
from dataclasses import dataclass
from sqlalchemy import create_engine, text

log = logging.getLogger("backfill")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
CHUNK = 10_000
JOB = "events.tenant_id.v1"                              # version this — re-run with v2 on schema change

# Progress table — created on first run, idempotent.
DDL = """
CREATE TABLE IF NOT EXISTS backfill_state (
    job        text PRIMARY KEY,
    cursor_id  bigint NOT NULL DEFAULT 0,
    completed  boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);
"""

@dataclass
class State:
    cursor_id: int
    completed: bool

def init() -> State:
    with engine.begin() as conn:
        conn.execute(text(DDL))
        conn.execute(text(
            "INSERT INTO backfill_state (job) VALUES (:j) ON CONFLICT DO NOTHING"
        ), {"j": JOB})
        row = conn.execute(text(
            "SELECT cursor_id, completed FROM backfill_state WHERE job = :j FOR UPDATE"
        ), {"j": JOB}).one()
    return State(cursor_id=row.cursor_id, completed=row.completed)

def advance(cursor_id: int, *, completed: bool = False) -> None:
    with engine.begin() as conn:
        conn.execute(text("""
            UPDATE backfill_state
               SET cursor_id = :c, completed = :done, updated_at = now()
             WHERE job = :j
        """), {"c": cursor_id, "done": completed, "j": JOB})

# Graceful shutdown — finish the current chunk, then exit.
_stop = False
def _on_sig(*_):
    global _stop
    _stop = True
    log.warning("signal received; stopping after current chunk")
signal.signal(signal.SIGTERM, _on_sig)
signal.signal(signal.SIGINT,  _on_sig)

def run() -> int:
    state = init()
    if state.completed:
        log.info("job already marked complete; nothing to do")
        return 0

    with engine.begin() as conn:
        max_id = conn.execute(text("SELECT coalesce(max(id), 0) FROM events")).scalar_one()
    log.info(f"resuming from cursor_id={state.cursor_id}, max_id={max_id}")

    lo = state.cursor_id
    total = 0
    started = time.monotonic()
    while lo <= max_id and not _stop:
        hi = lo + CHUNK - 1
        with engine.begin() as conn:
            n = conn.execute(text("""
                UPDATE events
                   SET tenant_id = u.tenant_id
                  FROM users u
                 WHERE events.user_id = u.id
                   AND events.tenant_id IS NULL
                   AND events.id BETWEEN :lo AND :hi
            """), {"lo": lo, "hi": hi}).rowcount
        total += n
        lo = hi + 1
        advance(lo)
        elapsed = time.monotonic() - started
        rate = total / max(elapsed, 1e-3)
        log.info(f"chunk done: {n} rows | cursor={lo} | total={total} | rate={rate:.0f}/s")

    if not _stop:
        advance(lo, completed=True)
        log.info(f"COMPLETE: {total} rows updated in {time.monotonic() - started:.1f}s")
    return total

if __name__ == "__main__":
    run()

# Decision rule:
#   <100k rows                       -> one UPDATE in a tiny script is fine
#   100k-10M rows                    -> chunked UPDATE; one transaction per chunk
#   >10M rows or replicated DB       -> add: progress table, SIGTERM handler, rate logging
#   needs to run during business hrs -> sleep between chunks; throttle to <50% of normal write rate
#   data depends on app-side logic   -> Python script with engine, NOT op.execute in a migration
#   irreversible (column rename)     -> dual-write from the app FIRST; backfill; cut over; remove old
#   re-running after partial failure -> idempotent WHERE clause + persisted cursor; no log-spelunking
#   migration must NOT run forever   -> Alembic step asserts COMPLETE; raises if backfill incomplete
#
# Anti-pattern: putting the backfill inside an Alembic migration. Alembic
# wraps the migration in a transaction; the lock holds until done; the
# deployment hangs; rollback either does nothing or rewinds the work. Worse:
# CI tooling and operators can't observe progress, can't pause, can't resume.
# Backfills are jobs, not migrations. Schema migrations stay short.
```

## Decision Rule

```text
<100k rows                       -> one UPDATE in a tiny script is fine
100k-10M rows                    -> chunked UPDATE; one transaction per chunk
>10M rows or replicated DB       -> add: progress table, SIGTERM handler, rate logging
needs to run during business hrs -> sleep between chunks; throttle to <50% of normal write rate
data depends on app-side logic   -> Python script with engine, NOT op.execute in a migration
irreversible (column rename)     -> dual-write from the app FIRST; backfill; cut over; remove old
re-running after partial failure -> idempotent WHERE clause + persisted cursor; no log-spelunking
migration must NOT run forever   -> Alembic step asserts COMPLETE; raises if backfill incomplete
```

## Anti-Pattern

> [!warning] Anti-pattern
> putting the backfill inside an Alembic migration. Alembic
> wraps the migration in a transaction; the lock holds until done; the
> deployment hangs; rollback either does nothing or rewinds the work. Worse:
> CI tooling and operators can't observe progress, can't pause, can't resume.
> Backfills are jobs, not migrations. Schema migrations stay short.

## Tips

- Backfills do NOT belong inside Alembic migrations. Alembic's per-migration transaction defeats every property a backfill needs: bounded locks, progress, resumability, observability.
- Chunk by primary key range (`id BETWEEN :lo AND :hi`), not by `LIMIT/OFFSET` — OFFSET scans skipped rows, getting slower with each chunk.
- Make every chunk's WHERE clause idempotent (`AND tenant_id IS NULL`) so re-running the script is a no-op. Operators WILL re-run it.
- Persist progress in a `backfill_state` table keyed by job name. Stdin/stdout logging is fine for a 5-minute job; not for a 6-hour one.
- Trap SIGTERM and finish the current chunk before exiting — Kubernetes pod evictions are routine; "stop mid-chunk" causes ragged data.
- Pair the data-migration job with an Alembic "marker" migration that asserts `SELECT count(*) FROM ... WHERE col IS NULL` is zero. CI/CD won't advance past it until backfill is complete.

## Common Mistake

> [!warning] Putting the backfill inside an Alembic migration. The migration's transaction wraps the entire UPDATE; locks held for hours; deploy timeouts; rollback either no-ops or rewinds; nothing is observable. Backfills are JOBS — separate scripts with their own progress, monitoring, and signal handling. Migrations should run in seconds.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Backfill inside a migration — locks for hours
def upgrade():
    op.execute("UPDATE events SET tenant_id = u.tenant_id FROM users u ...")
```

**Senior:**
```python
# Backfill in a separate, resumable script
# scripts/backfill_tenant_id.py — chunked, cursor-state, SIGTERM-aware
```

## See Also

- [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/_Index|Databases & SQLAlchemy → Schema Migrations — Alembic]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-core"
id: "core-vs-orm-decision"
title: "Core vs ORM — when to use which"
category: "Core Setup"
subtitle: "declarative ORM vs Core, identity map, unit of work, bulk operations, mixing ORM + Core"
signature_short: "ORM: session.scalars(select(User)).all()  |  Core: conn.execute(select(users))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Core vs ORM — when to use which"
  - "core-vs-orm-decision"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-core"
  - "category/core-setup"
  - "tier/tiered"
---

# Core vs ORM — when to use which

> declarative ORM vs Core, identity map, unit of work, bulk operations, mixing ORM + Core

## Overview

ORM gives you objects with state, change tracking, identity dedup, and relationship navigation — at the cost of per-row Python object construction. Core gives you the SQL expression API without the object layer — faster for bulk operations and ad-hoc queries, with less ergonomics. Both share the same MetaData and execution layer; mixing them in one app is normal and supported.

## Signature

```python
ORM: session.scalars(select(User)).all()  |  Core: conn.execute(select(users))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ORM for app domain logic; Core for bulk / ad-hoc / SQL-only operations.
# STRENGTHS - Pick the right tool for each query; no need to choose globally.
# WEAKNESSES- Mixing styles in the same module is fine, but be consistent within a function.
from sqlalchemy import select, insert
from sqlalchemy.orm import Session

# ORM — get a User OBJECT, mutate, save.
with Session(engine) as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"

# Core — same query, but returns a Row tuple, faster, no object overhead.
with engine.connect() as conn:
    row = conn.execute(
        select(users.c.id, users.c.name).where(users.c.id == 1)
    ).one()
    print(row.id, row.name)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - ORM for the 95% (CRUD with relationships); Core for bulk inserts/updates and reporting queries.
# STRENGTHS - Bulk via Core is 10-100x faster than the equivalent ORM session.add() loop.
# WEAKNESSES- Bulk Core operations bypass ORM cascades, defaults, and event listeners — know what you're skipping.
from sqlalchemy import insert, update, delete

# Bulk insert — Core, ~50x faster than ORM session.add() in a loop.
with engine.begin() as conn:
    conn.execute(
        insert(users),
        [{"name": f"user{i}", "email": f"u{i}@example.com"} for i in range(10000)],
    )

# Bulk UPDATE — ORM has session.execute(update(...)) but Core form is identical.
with engine.begin() as conn:
    conn.execute(
        update(users).where(users.c.created_at < cutoff).values(active=False)
    )

# Reporting query — read-heavy, no objects needed.
with engine.connect() as conn:
    rows = conn.execute(
        select(
            users.c.country,
            func.count(users.c.id).label("n"),
        ).group_by(users.c.country)
    ).all()
    for country, n in rows:
        print(country, n)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - ORM for transactional domain code; Core for bulk + reporting; share the same Engine + MetaData; commit boundaries unified.
# STRENGTHS - One transaction can mix ORM mutations and bulk Core ops; one app, two abstractions, zero ceremony.
# WEAKNESSES- Bulk Core operations DON'T trigger ORM events — if you have audit hooks on session events, bulk skips them.
from __future__ import annotations
from sqlalchemy import select, insert, update, delete, func
from sqlalchemy.orm import Session

def archive_old_users(session: Session, cutoff_days: int) -> int:
    """ORM domain logic + Core bulk operation in one transaction."""
    with session.begin():
        # Domain logic via ORM — get one specific user, mutate.
        admin = session.scalars(
            select(User).where(User.role == "admin")
        ).one()
        admin.last_archive_run = func.now()

        # Bulk archive via Core — ORM's session.execute(update(...)) works the same.
        result = session.execute(
            update(User)
                .where(User.last_seen < text("now() - interval ':n days'"))
                .values(archived=True)
                .execution_options(synchronize_session=False)   # bulk-safe
        )
        return result.rowcount

# Decision rule:
#   single rows / domain logic                -> ORM (Session, models, .scalars())
#   bulk insert / update / delete (>1000 rows)-> Core insert()/update()/delete()
#   reporting / aggregations (no objects)     -> Core select() with conn.execute()
#   ad-hoc DDL / vendor SQL                   -> Core text() or raw SQL
#   migration scripts (Alembic)               -> Core — Alembic context exposes Core API
#   data shovels / ETL                        -> Core — no point materializing objects
#   ORM with bulk update inside the session   -> session.execute(update(...).execution_options(synchronize_session=False))
#   high-throughput web endpoint              -> profile both; ORM often loses to Core by 5-10x
#
# Anti-pattern: writing ORM code that does session.add() in a loop for bulk
# inserts. Each call hits the unit-of-work, identity map, and event system —
# 10,000 inserts can take minutes. Switch to Core insert(table) with a list
# of dicts: same data, ~50x faster, single round-trip if your driver supports
# executemany. Keep ORM for the cases where its features (identity, change
# tracking, cascades) actually pay for themselves.
```

## Decision Rule

```text
single rows / domain logic                -> ORM (Session, models, .scalars())
bulk insert / update / delete (>1000 rows)-> Core insert()/update()/delete()
reporting / aggregations (no objects)     -> Core select() with conn.execute()
ad-hoc DDL / vendor SQL                   -> Core text() or raw SQL
migration scripts (Alembic)               -> Core — Alembic context exposes Core API
data shovels / ETL                        -> Core — no point materializing objects
ORM with bulk update inside the session   -> session.execute(update(...).execution_options(synchronize_session=False))
high-throughput web endpoint              -> profile both; ORM often loses to Core by 5-10x
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing ORM code that does session.add() in a loop for bulk
> inserts. Each call hits the unit-of-work, identity map, and event system —
> 10,000 inserts can take minutes. Switch to Core insert(table) with a list
> of dicts: same data, ~50x faster, single round-trip if your driver supports
> executemany. Keep ORM for the cases where its features (identity, change
> tracking, cascades) actually pay for themselves.

## Tips

- Bulk insert via Core (`conn.execute(insert(table), [...])`) is typically 10-50x faster than `session.add()` in a loop — the ORM is paying for features you don't need at scale.
- When using `session.execute(update(...))` for bulk update inside the ORM, pass `execution_options(synchronize_session=False)` — otherwise SQLAlchemy tries to update in-memory ORM objects to match, which is slow.
- ORM and Core share the same `Engine` and `MetaData` — there's no overhead to using both in the same app, just match the right tool to the workload.
- Bulk Core operations bypass ORM cascades, validators, and event listeners. If you depend on those (e.g., audit trail via SQLAlchemy events), do bulk in raw SQL with explicit audit-log inserts, not via Core skipping the ORM.
- For RETURNING-aware bulk inserts (Postgres / SQLite 3.35+), Core gets you generated keys efficiently; the ORM equivalent (`session.scalars(insert(...).returning(User))`) works but is newer (2.0+).

## Common Mistake

> [!warning] Forcing the ORM on bulk operations. `for row in csv_file: session.add(User(...)); session.commit()` for 100k rows will take many minutes — every row hits the unit-of-work, identity map, autoflush, and constraint resolution. Use `conn.execute(insert(users), list_of_dicts)` for bulk; reserve the ORM for transactional domain logic.

## Shorthand (Junior → Senior)

**Junior:**
```python
# ORM in a loop — ~30 seconds for 10k rows
with Session() as session, session.begin():
    for row in rows:
        session.add(User(name=row["name"], email=row["email"]))
```

**Senior:**
```python
# Core bulk insert — ~0.5 seconds for the same 10k rows
with engine.begin() as conn:
    conn.execute(insert(users_table), rows)
```

## See Also

- [[Sections/database/sqlalchemy-core/connection-pool|Connection Pool — QueuePool, NullPool, StaticPool, sizing (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-core/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — Core]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

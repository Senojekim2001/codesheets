---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-transactions"
title: "Transactions — begin, commit, rollback, savepoints, isolation"
category: "ORM Transactions"
subtitle: "session.begin, begin_nested, commit, rollback, isolation_level, autobegin, autoflush, two-phase commit"
signature_short: "with Session() as s, s.begin(): ...      |  with s.begin_nested(): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Transactions — begin, commit, rollback, savepoints, isolation"
  - "sqlalchemy-transactions"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-transactions"
  - "tier/tiered"
---

# Transactions — begin, commit, rollback, savepoints, isolation

> session.begin, begin_nested, commit, rollback, isolation_level, autobegin, autoflush, two-phase commit

## Overview

A transaction is the unit of atomicity: either every change in it succeeds or none do. SQLAlchemy 2.0 transactions are explicit — `s.begin()` returns a context manager that commits on clean exit, rolls back on exception. Savepoints (`begin_nested`) let you partially roll back without losing the outer transaction. Isolation level controls how concurrent transactions see each other.

## Signature

```python
with Session() as s, s.begin(): ...      |  with s.begin_nested(): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - with Session() as s, s.begin(): ...   commits or rolls back automatically.
# STRENGTHS - No manual try/except/commit/rollback dance — context manager owns it.
# WEAKNESSES- If you raise inside the block, the rollback is silent; log before re-raising.
with Session() as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"
    # commit on clean exit
    # rollback on any exception leaving the block
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Use savepoints (begin_nested) for "I want to try this risky thing inside the bigger transaction."
# STRENGTHS - Inner failure rolls back to the savepoint; outer transaction continues.
# WEAKNESSES- Savepoint support varies by DB engine; SQLite supports them since 3.6, MySQL InnoDB only.
with Session() as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"

    # Savepoint — try a risky operation; failure doesn't kill the outer transaction.
    try:
        with session.begin_nested():               # SAVEPOINT sp1
            risky_thing(user)                       # may raise
    except RiskyThingFailed:
        # rolled back to sp1; user.name is still "Ada"
        log.warning("risky thing failed; continuing")

    # The outer transaction commits with user.name = "Ada"

# Manually-driven transaction (rarely needed; prefer the context-manager form).
session = Session()
session.begin()
try:
    user = session.get(User, 1)
    user.name = "Ada"
    session.commit()
except Exception:
    session.rollback()
    raise
finally:
    session.close()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Explicit isolation levels per workload; SERIALIZABLE retry loop for write-heavy code; FOR UPDATE for queue patterns; never share transactions across sessions.
# STRENGTHS - Predictable behavior under contention; controlled retry on serialization failures; clear ownership of state.
# WEAKNESSES- SERIALIZABLE retries cost throughput on contended hot rows; consider advisory locks for known hotspots.
from __future__ import annotations
from sqlalchemy import select, update
from sqlalchemy.exc import OperationalError, DBAPIError
from sqlalchemy.orm import Session
import time, random

# 1) Per-transaction isolation level — money / inventory want SERIALIZABLE.
def transfer(session: Session, src_id: int, dst_id: int, amount: int) -> None:
    with session.begin():
        # Set isolation for THIS transaction.
        session.connection(execution_options={"isolation_level": "SERIALIZABLE"})
        src = session.get(Account, src_id)
        dst = session.get(Account, dst_id)
        if src.balance < amount:
            raise InsufficientFunds()
        src.balance -= amount
        dst.balance += amount

# 2) Serialization-failure retry loop (Postgres throws "could not serialize access").
def with_retry(fn, *, attempts: int = 5):
    for i in range(attempts):
        try:
            return fn()
        except OperationalError as e:
            if "could not serialize" not in str(e).lower():
                raise                              # not a retry-able error
            wait = (2 ** i) * 0.05 + random.random() * 0.05
            time.sleep(wait)
    raise RuntimeError("serialization retries exhausted")

# 3) FOR UPDATE — claim a row exclusively (worker queue pattern).
def claim_next_job(session: Session) -> Job | None:
    with session.begin():
        return session.scalars(
            select(Job)
              .where(Job.status == "pending")
              .order_by(Job.id)
              .limit(1)
              .with_for_update(skip_locked=True)   # PG: skip rows other workers locked
        ).one_or_none()

# 4) Bulk update bypasses ORM session state — issue raw UPDATE.
def mark_done(session: Session, ids: list[int]) -> int:
    with session.begin():
        result = session.execute(
            update(Job).where(Job.id.in_(ids)).values(status="done")
        )
        return result.rowcount

# 5) Two-phase commit (rare — distributed transactions across DBs).
# session.begin_twophase()  -- coordinates XA across engines; needs DB support.

# Decision rule:
#   typical web request                  -> READ_COMMITTED (default), s.begin() context manager
#   money / inventory invariants          -> SERIALIZABLE + retry loop on serialization errors
#   "claim and process" worker            -> with_for_update(skip_locked=True), one row at a time
#   "try this risky step, recover on fail"-> with session.begin_nested() — savepoint
#   bulk update / delete                  -> session.execute(update(...)) — bypasses ORM state
#   need DB-side timeout                  -> SET LOCAL statement_timeout = 30000 in begin block
#   long-running read                     -> READ_COMMITTED + chunked SELECTs (don't hold one big tx)
#   distributed across DBs                -> two-phase commit (rare; usually use sagas instead)
#
# Anti-pattern: catching exceptions inside the with-begin block and "continuing"
# without re-raising. The transaction is poisoned after any error — the next
# query in it raises InvalidRequestError. Either use savepoints (begin_nested)
# to isolate the failure, or let the exception propagate so the outer block
# rolls back cleanly.
```

## Decision Rule

```text
typical web request                  -> READ_COMMITTED (default), s.begin() context manager
money / inventory invariants          -> SERIALIZABLE + retry loop on serialization errors
"claim and process" worker            -> with_for_update(skip_locked=True), one row at a time
"try this risky step, recover on fail"-> with session.begin_nested() — savepoint
bulk update / delete                  -> session.execute(update(...)) — bypasses ORM state
need DB-side timeout                  -> SET LOCAL statement_timeout = 30000 in begin block
long-running read                     -> READ_COMMITTED + chunked SELECTs (don't hold one big tx)
distributed across DBs                -> two-phase commit (rare; usually use sagas instead)
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching exceptions inside the with-begin block and "continuing"
> without re-raising. The transaction is poisoned after any error — the next
> query in it raises InvalidRequestError. Either use savepoints (begin_nested)
> to isolate the failure, or let the exception propagate so the outer block
> rolls back cleanly.

## Tips

- Wrap `s.begin()` in a `with` block — that single change replaces the entire try/except/commit/rollback boilerplate.
- For SERIALIZABLE write paths, ALWAYS retry on serialization failures — Postgres throws `OperationalError("could not serialize access")`, and that error is retry-able by design.
- `with_for_update(skip_locked=True)` makes worker queues trivial on Postgres — each worker grabs the next unlocked row, no Redis, no Celery.
- Bulk `update()` / `delete()` at the Core level bypasses the ORM's identity map and unit-of-work tracking — fast, but the in-memory objects in the session are out of sync. Either commit + close, or `session.expire_all()`.
- Set `isolation_level` per-transaction via `session.connection(execution_options=...)` rather than at the engine — different code paths have different needs.

## Common Mistake

> [!warning] Catching an exception inside a `with session.begin():` block and continuing as if nothing happened. Once an error fires, the transaction is poisoned — the next query raises `InvalidRequestError`. Either let the exception propagate (the context manager rolls back cleanly), or use `session.begin_nested()` to isolate the risky operation in a savepoint.

## Shorthand (Junior → Senior)

**Junior:**
```python
session = Session()
try:
    session.begin()
    user = session.get(User, 1)
    user.name = "Ada"
    session.commit()
except Exception:
    session.rollback()
    raise
finally:
    session.close()
```

**Senior:**
```python
with Session() as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"
```

## See Also

- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

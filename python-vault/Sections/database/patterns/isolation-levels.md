---
type: "entry"
domain: "python"
file: "database"
section: "patterns"
id: "isolation-levels"
title: "Isolation levels — preventing the inventory oversell"
category: "Concurrency"
subtitle: "READ COMMITTED, REPEATABLE READ, SERIALIZABLE, with_for_update, SerializationFailure retry, advisory_lock, isolation_level=..."
signature_short: "session = Session(engine.execution_options(isolation_level=\"SERIALIZABLE\"))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Isolation levels — preventing the inventory oversell"
  - "isolation-levels"
tags:
  - "python"
  - "python/database"
  - "python/database/patterns"
  - "category/concurrency"
  - "tier/tiered"
---

# Isolation levels — preventing the inventory oversell

> READ COMMITTED, REPEATABLE READ, SERIALIZABLE, with_for_update, SerializationFailure retry, advisory_lock, isolation_level=...

## Overview

Postgres defaults to READ COMMITTED — every statement sees a fresh snapshot, but two concurrent transactions can both read "stock=10", both compute "10-1=9", both commit, and you have oversold by one. The fixes: take a row lock (`SELECT ... FOR UPDATE`) so the second transaction waits; or use SERIALIZABLE isolation and retry on `SerializationFailure`. Each has costs. The three examples solve the SAME task — two requests concurrently reserve inventory; never oversell — at three depths: default isolation (broken) → `with_for_update()` row lock → SERIALIZABLE with retry loop and the decision matrix.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Two concurrent calls reserve inventory; total stock must not go below zero.
- **Junior** — SAME — but the second request waits for the first to finish.
- **Senior** — SAME — at production scale; minimize lock contention; choose the right level per workload.

## Signature

```python
session = Session(engine.execution_options(isolation_level="SERIALIZABLE"))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Two concurrent calls reserve inventory; total stock must not
#             go below zero.
# APPROACH  - Default isolation (READ COMMITTED on Postgres). Read stock,
#             check, write. No locking.
# STRENGTHS - Smallest correct-LOOKING code. Reads pre-existing rows just fine.
# WEAKNESSES- BROKEN under concurrency. Two threads both read 10, both
#             write 9, you sold 2 of the same item. The defect is invisible
#             in single-threaded tests.
from sqlalchemy.orm import Session
from myapp.models import Product

def reserve(session: Session, product_id: int, qty: int) -> bool:
    product = session.get(Product, product_id)        # default: no lock
    if product is None or product.stock < qty:
        return False
    product.stock -= qty                              # race: another tx already decremented
    session.commit()
    return True

# Two coroutines, both reserve(qty=1) on the same row at stock=1:
#  T1: SELECT -> stock=1
#  T2: SELECT -> stock=1                              # both see the same snapshot
#  T1: UPDATE stock=0; COMMIT
#  T2: UPDATE stock=0; COMMIT                         # oversold; row went 1 -> 0 twice
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but the second request waits for the first to finish.
# APPROACH  - SELECT ... FOR UPDATE: pessimistic row lock. The second tx
#             blocks at the SELECT until the first commits.
# STRENGTHS- Simple to reason about; works with default isolation level;
#             no retry loop needed.
# WEAKNESSES- Holds a row lock for the duration of the transaction; long
#             txns hurt; deadlocks possible if locks acquired in different
#             orders across handlers.
from sqlalchemy import select
from sqlalchemy.orm import Session
from myapp.models import Product

def reserve(session: Session, product_id: int, qty: int) -> bool:
    # with_for_update() == "SELECT ... FOR UPDATE" — locks the row.
    product = session.execute(
        select(Product).where(Product.id == product_id).with_for_update()
    ).scalar_one_or_none()

    if product is None or product.stock < qty:
        return False
    product.stock -= qty
    session.commit()                                  # releases the lock
    return True

# Two coroutines, both reserve(qty=1):
#   T1: SELECT FOR UPDATE -> locks row, sees stock=1
#   T2: SELECT FOR UPDATE -> waits for T1
#   T1: UPDATE stock=0; COMMIT  (lock released)
#   T2: SELECT returns stock=0 -> not enough; returns False

# Skip the lock if you're willing to fail fast.
#   .with_for_update(skip_locked=True)   # don't wait — try the next row
#   .with_for_update(nowait=True)        # raise immediately if locked
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — at production scale; minimize lock contention; choose
#             the right level per workload.
# APPROACH  - SERIALIZABLE isolation with explicit retry on SerializationFailure
#             for the high-contention path; FOR UPDATE for predictable hot
#             rows; advisory locks for "exactly one process" semantics.
# STRENGTHS - Locks are scoped to the actual contention; system-wide
#             throughput stays high; the rare conflicts retry transparently.
# WEAKNESSES- More code; misuse of SERIALIZABLE on non-conflicting work
#             still costs in retry overhead. Pick per-handler.
import time, random, logging
from sqlalchemy import select, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import OperationalError, IntegrityError
from psycopg.errors import SerializationFailure
from myapp.models import Product

log = logging.getLogger(__name__)

# 1) Per-session isolation level via execution_options.
SerializableSession = sessionmaker(
    bind=engine.execution_options(isolation_level="SERIALIZABLE")
)

def with_serializable_retry(fn, *, max_retries: int = 3):
    """Decorate a callable so SerializationFailure -> exponential backoff retry."""
    def wrapped(*args, **kwargs):
        for attempt in range(max_retries + 1):
            try:
                return fn(*args, **kwargs)
            except OperationalError as exc:
                if not isinstance(exc.orig, SerializationFailure):
                    raise
                if attempt == max_retries:
                    log.warning("retry budget exhausted for %s", fn.__name__)
                    raise
                # Postgres SQLSTATE 40001; jittered backoff.
                time.sleep((2 ** attempt) * 0.01 + random.random() * 0.005)
        return None  # unreachable
    return wrapped

# 2) High-contention path: SERIALIZABLE + retry.
@with_serializable_retry
def reserve(product_id: int, qty: int) -> bool:
    with SerializableSession() as s:
        product = s.execute(
            select(Product).where(Product.id == product_id)
        ).scalar_one_or_none()
        if product is None or product.stock < qty:
            return False
        product.stock -= qty
        s.commit()
        return True

# 3) Predictable hot row: FOR UPDATE is simpler than SERIALIZABLE.
def reserve_with_lock(session: Session, product_id: int, qty: int) -> bool:
    product = session.execute(
        select(Product).where(Product.id == product_id).with_for_update()
    ).scalar_one_or_none()
    if product is None or product.stock < qty:
        return False
    product.stock -= qty
    session.commit()
    return True

# 4) Advisory lock — "exactly one process runs this scheduled job".
def run_billing_for_month(session: Session, month: str) -> None:
    key = abs(hash(("billing", month))) % (2**31)
    locked = session.execute(
        text("SELECT pg_try_advisory_lock(:k)"), {"k": key}
    ).scalar_one()
    if not locked:
        log.info("billing for %s already running elsewhere; skipping", month)
        return
    try:
        ...                                            # do the work
    finally:
        session.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": key})

# Decision rule:
#   typical OLTP request               -> READ COMMITTED (default); fine for reads
#   contention on a hot row            -> with_for_update(); pessimistic lock
#   "report consistency across reads"  -> REPEATABLE READ — same snapshot per stmt
#   write-heavy with rare conflicts    -> SERIALIZABLE + retry; throughput stays high
#   "this can never run twice"         -> pg_try_advisory_lock; cluster-wide singleton
#   long-running read for a report     -> set deferrable + read-only on a SERIALIZABLE
#                                          tx; gets a snapshot, no write conflicts
#   batch ETL                          -> SERIALIZABLE with retry; commit per batch
#   every 5s scheduler tick            -> advisory lock; multiple instances co-exist safely
#   detected serialization failure     -> retry the WHOLE transaction (3-5 attempts, jittered)
#
# Anti-pattern: catching SerializationFailure and continuing without a retry.
# A serialization failure means Postgres aborted the txn because committing
# would violate serializability — the fix is to re-run the txn from the
# beginning, not to swallow it. Catch + retry; do not catch + ignore.
```

## Decision Rule

```text
typical OLTP request               -> READ COMMITTED (default); fine for reads
contention on a hot row            -> with_for_update(); pessimistic lock
"report consistency across reads"  -> REPEATABLE READ — same snapshot per stmt
write-heavy with rare conflicts    -> SERIALIZABLE + retry; throughput stays high
"this can never run twice"         -> pg_try_advisory_lock; cluster-wide singleton
long-running read for a report     -> set deferrable + read-only on a SERIALIZABLE
                                       tx; gets a snapshot, no write conflicts
batch ETL                          -> SERIALIZABLE with retry; commit per batch
every 5s scheduler tick            -> advisory lock; multiple instances co-exist safely
detected serialization failure     -> retry the WHOLE transaction (3-5 attempts, jittered)
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching SerializationFailure and continuing without a retry.
> A serialization failure means Postgres aborted the txn because committing
> would violate serializability — the fix is to re-run the txn from the
> beginning, not to swallow it. Catch + retry; do not catch + ignore.

## Tips

- Postgres defaults to READ COMMITTED — every STATEMENT sees a fresh snapshot. Reads inside the same transaction can see different data. This is wrong for "compute totals from multiple queries" workloads.
- `with_for_update()` adds `FOR UPDATE` to the SELECT; the row lock releases on commit. Pair with `skip_locked=True` for queue-style dispatch ("give me the next available job, don't block").
- SERIALIZABLE in Postgres uses Serializable Snapshot Isolation (SSI) — fast in the common case, aborts conflicting writers with SQLSTATE 40001 (`SerializationFailure`). Always retry; never swallow.
- For read-only reports that need consistency, `SET TRANSACTION READ ONLY DEFERRABLE` on a SERIALIZABLE transaction gets a stable snapshot WITHOUT the abort risk.
- Advisory locks (`pg_try_advisory_lock`) are cluster-wide and survive across sessions — use them for "this scheduler should only run on one node" without coordinating Redis or Zookeeper.
- Set the isolation level on the engine via `engine.execution_options(isolation_level="SERIALIZABLE")`, then use the resulting engine to bind a separate sessionmaker. Don't mix isolation levels on one Session.

## Common Mistake

> [!warning] Catching `SerializationFailure` (or generic `OperationalError`) and continuing without a retry. A serialization failure means Postgres aborted the transaction because committing would violate serializability — the only correct response is to re-run the transaction. Catching and continuing leaves the work undone; the caller thinks it succeeded.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Catch + ignore — work silently undone
try:
    do_work_in_serializable_tx()
except SerializationFailure:
    pass
```

**Senior:**
```python
# Catch + retry — the only correct response
@with_serializable_retry
def do_work_in_serializable_tx():
    ...
```

## See Also

- [[Sections/database/patterns/_Index|Databases & SQLAlchemy → Database Patterns — Architecture & Concurrency]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

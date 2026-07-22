---
type: "entry"
domain: "python"
file: "database"
section: "patterns"
id: "unit-of-work"
title: "Unit of Work — atomic, repository-aware transactions"
category: "Architecture"
subtitle: "class UnitOfWork: __enter__/__exit__/commit/rollback, sessionmaker, FastAPI Depends, savepoints via begin_nested, transactional outbox"
signature_short: "with UnitOfWork() as uow: uow.orders.add(o); uow.inventory.decrement(p); uow.commit()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Unit of Work — atomic, repository-aware transactions"
  - "unit-of-work"
tags:
  - "python"
  - "python/database"
  - "python/database/patterns"
  - "category/architecture"
  - "tier/tiered"
---

# Unit of Work — atomic, repository-aware transactions

> class UnitOfWork: __enter__/__exit__/commit/rollback, sessionmaker, FastAPI Depends, savepoints via begin_nested, transactional outbox

## Overview

A Unit of Work (UoW) is the transaction-shape sibling of the Repository. The Repository says "where data lives"; the UoW says "what gets persisted together". In SQLAlchemy, the Session IS a UoW — but exposing Session to handlers leaks the persistence story. A handler should know "this either all commits or all rolls back"; it should not know there's a Session, nor that there's a Postgres. The three examples solve the SAME task — save an order and decrement inventory atomically — at three depths: one Session inline → explicit UoW class with repos as attributes → UoW with savepoints, FastAPI integration, and a transactional outbox.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Save an order; decrement inventory; commit-or-rollback both.
- **Junior** — SAME atomic place-order — handlers depend on a UoW, not Session.
- **Senior** — SAME atomic place-order at production scale: savepoints for partial work, FastAPI integration, transactional outbox so "send confirmation email" goes ONLY if the order committed.

## Signature

```python
with UnitOfWork() as uow: uow.orders.add(o); uow.inventory.decrement(p); uow.commit()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Save an order; decrement inventory; commit-or-rollback both.
# APPROACH  - One Session, both writes, commit at end. Session IS the UoW.
# STRENGTHS - Smallest correct implementation; the Session already does it.
# WEAKNESSES- Handler knows about Session — Session becomes a leaked dependency.
from sqlalchemy.orm import Session
from myapp.models import Order, Product

def place_order(session: Session, user_id: int, product_id: int, qty: int) -> int:
    product = session.get(Product, product_id, with_for_update=True)
    if product is None or product.stock < qty:
        raise ValueError("out of stock")

    order = Order(user_id=user_id, product_id=product_id, qty=qty,
                  total=product.price * qty)
    session.add(order)
    product.stock -= qty
    session.commit()                              # both writes go together
    return order.id

# Caller wires up the Session.
# with Session(engine) as session:
#     try:
#         place_order(session, user_id=1, product_id=42, qty=2)
#     except Exception:
#         session.rollback()
#         raise
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME atomic place-order — handlers depend on a UoW, not Session.
# APPROACH  - UnitOfWork class wraps a Session; exposes repos; ctx-managed.
#             Commit/rollback is explicit; handler never imports SQLAlchemy.
# STRENGTHS - Tests pass a fake UoW with in-memory repos; commit/rollback
#             semantics live in one place; clean dependency direction.
# WEAKNESSES- One commit point per UoW; for partial-success workflows you
#             want savepoints (see senior tier).
from __future__ import annotations
from typing import Protocol
from sqlalchemy.orm import Session, sessionmaker
from myapp.models import Order, Product

class OrderRepoProto(Protocol):
    def add(self, order: Order) -> None: ...

class ProductRepoProto(Protocol):
    def get_for_update(self, product_id: int) -> Product | None: ...

class UnitOfWork:
    """Wraps a SQLAlchemy Session; exposes repos; commits or rolls back atomically."""
    orders: OrderRepoProto
    products: ProductRepoProto

    def __init__(self, session_factory: sessionmaker):
        self._session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self._session: Session = self._session_factory()
        self.orders = SqlOrderRepo(self._session)        # see repository entry
        self.products = SqlProductRepo(self._session)
        return self

    def __exit__(self, exc_type, *_):
        if exc_type is None:
            self._session.rollback()                      # safety: didn't call commit()
        else:
            self._session.rollback()
        self._session.close()

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()

# Repos (sketch).
class SqlOrderRepo:
    def __init__(self, session: Session): self._s = session
    def add(self, order: Order) -> None: self._s.add(order)

class SqlProductRepo:
    def __init__(self, session: Session): self._s = session
    def get_for_update(self, pid: int) -> Product | None:
        return self._s.get(Product, pid, with_for_update=True)

# Handler — knows nothing about Session, transactions, or SQL.
def place_order(uow: UnitOfWork, user_id: int, product_id: int, qty: int) -> int:
    with uow:
        product = uow.products.get_for_update(product_id)
        if product is None or product.stock < qty:
            raise ValueError("out of stock")
        order = Order(user_id=user_id, product_id=product_id, qty=qty,
                      total=product.price * qty)
        uow.orders.add(order)
        product.stock -= qty
        uow.commit()
        return order.id
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME atomic place-order at production scale: savepoints for
#             partial work, FastAPI integration, transactional outbox so
#             "send confirmation email" goes ONLY if the order committed.
# APPROACH  - UoW yields nested savepoints via begin_nested(); pending events
#             buffered in-memory and flushed AFTER commit (or written to
#             outbox table inside the same txn for replay).
# STRENGTHS - Reliable cross-aggregate atomicity; events never fire on a
#             rollback; tests run against in-memory repos with no DB.
# WEAKNESSES- More wiring; over-engineered for one-handler scripts.
from __future__ import annotations
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Iterator, Protocol, Any
from sqlalchemy.orm import Session, sessionmaker
from myapp.models import Order, Product, OutboxEvent
from fastapi import Depends

# --- Domain events -----------------------------------------------------------
@dataclass
class OrderPlaced:
    order_id: int
    user_id: int

# --- UoW with savepoints + outbox -------------------------------------------
class UnitOfWork:
    def __init__(self, session_factory: sessionmaker):
        self._session_factory = session_factory
        self._pending_events: list[Any] = []

    def __enter__(self) -> "UnitOfWork":
        self._session: Session = self._session_factory()
        self.orders = SqlOrderRepo(self._session)
        self.products = SqlProductRepo(self._session)
        return self

    def __exit__(self, exc_type, *_):
        # Auto-rollback on uncaught exception OR if commit() wasn't called.
        if not getattr(self, "_committed", False):
            self._session.rollback()
        self._session.close()

    @contextmanager
    def savepoint(self) -> Iterator[None]:
        """Nested transaction; rollback affects only this block."""
        with self._session.begin_nested():
            yield

    def add_event(self, event: Any) -> None:
        # Two strategies:
        #  (a) Buffer in memory; flush after commit (at-most-once delivery).
        #  (b) Write to OUTBOX table inside the same txn; a worker dispatches.
        # We use (b) because it survives crash between commit and flush.
        self._session.add(OutboxEvent(
            type=type(event).__name__,
            payload=event.__dict__,
        ))
        self._pending_events.append(event)

    def commit(self) -> None:
        self._session.commit()
        self._committed = True
        # In-process subscribers (e.g. metrics) — outbox handles cross-process.
        for evt in self._pending_events:
            _dispatch_in_process(evt)
        self._pending_events.clear()


def _dispatch_in_process(event: Any) -> None:
    """In-process listeners — fast; metrics, cache invalidation, etc."""
    ...

# --- Handler — composes savepoints if needed -------------------------------
def place_order(uow: UnitOfWork, user_id: int, product_id: int, qty: int) -> int:
    with uow:
        with uow.savepoint():                          # speculative reservation
            product = uow.products.get_for_update(product_id)
            if product is None or product.stock < qty:
                raise ValueError("out of stock")
            product.stock -= qty
        order = Order(user_id=user_id, product_id=product_id, qty=qty,
                      total=product.price * qty)
        uow.orders.add(order)
        uow.commit()
        uow.add_event(OrderPlaced(order_id=order.id, user_id=user_id))
        return order.id

# --- FastAPI integration ----------------------------------------------------
def get_uow() -> Iterator[UnitOfWork]:
    SessionFactory = sessionmaker(bind=app_engine)
    with UnitOfWork(SessionFactory) as uow:
        yield uow

# @app.post("/orders")
# def create_order(req: PlaceOrderReq, uow: UnitOfWork = Depends(get_uow)) -> OrderOut:
#     order_id = place_order(uow, req.user_id, req.product_id, req.qty)
#     return OrderOut(id=order_id)

# Decision rule:
#   1 handler, 1 transaction         -> Session directly; UoW is overhead
#   2+ aggregates per handler        -> UoW; the atomicity contract is the value
#   need partial commits             -> begin_nested() savepoints; fail-and-continue
#   cross-process events              -> transactional outbox + worker — never call
#                                        external APIs from inside a DB txn
#   tests slow because of the DB     -> in-memory UoW with in-memory repos
#   complex saga across services     -> orchestrator + outbox; UoW per step, not whole saga
#   commit-by-default web framework  -> wrap each request in UoW via Depends/middleware
#   long-running operation           -> UoW per step; do NOT hold one open across
#                                        I/O or user input
#
# Anti-pattern: calling external APIs (email, payment, webhook) inside the
# UoW's transaction. The transaction blocks while the API responds; if the
# DB commits and the API succeeds — fine. If DB commits and API fails — you
# can't roll back. If API succeeds and DB rolls back — duplicate side
# effect. Either: (a) call the API BEFORE commit and rely on idempotency,
# or (b) write an OutboxEvent inside the txn and let a worker dispatch.
```

## Decision Rule

```text
1 handler, 1 transaction         -> Session directly; UoW is overhead
2+ aggregates per handler        -> UoW; the atomicity contract is the value
need partial commits             -> begin_nested() savepoints; fail-and-continue
cross-process events              -> transactional outbox + worker — never call
                                     external APIs from inside a DB txn
tests slow because of the DB     -> in-memory UoW with in-memory repos
complex saga across services     -> orchestrator + outbox; UoW per step, not whole saga
commit-by-default web framework  -> wrap each request in UoW via Depends/middleware
long-running operation           -> UoW per step; do NOT hold one open across
                                     I/O or user input
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling external APIs (email, payment, webhook) inside the
> UoW's transaction. The transaction blocks while the API responds; if the
> DB commits and the API succeeds — fine. If DB commits and API fails — you
> can't roll back. If API succeeds and DB rolls back — duplicate side
> effect. Either: (a) call the API BEFORE commit and rely on idempotency,
> or (b) write an OutboxEvent inside the txn and let a worker dispatch.

## Tips

- In SQLAlchemy, the Session IS a Unit of Work — adding a UoW class on top is about CONTROL: who sees Session, where commits happen, how repos are exposed.
- The UoW's `__exit__` should default to rollback — only an explicit `commit()` call persists. Forgetting commit should be a no-op, not "your work was saved by accident".
- `session.begin_nested()` is your savepoint primitive. Use it when one part of a workflow can fail without aborting the whole transaction (e.g., trying multiple inventory pools).
- Never call an external API inside a UoW's transaction. The transaction holds locks while the API is slow; if the API fails, you can't un-send the email. Use a transactional OUTBOX table + worker.
- For FastAPI, expose UoW via `Depends(get_uow)` with a generator that opens on entry and closes/rolls back on exit. The handler stays clean.
- In tests, a FakeUnitOfWork with in-memory repos lets you assert `uow.committed` and `uow.events` without a database. This is the pattern from cosmicpython.com.

## Common Mistake

> [!warning] Calling external APIs (email, payment, webhook) inside the UoW transaction. The transaction holds locks while the API responds; if the DB commits and the API fails, you can't un-send; if the DB rolls back and the API already succeeded, you have a phantom side effect. Use a transactional outbox: write an OutboxEvent row inside the txn, dispatch from a worker.

## Shorthand (Junior → Senior)

**Junior:**
```python
# External call inside the txn — locks held while API runs
with uow:
    uow.orders.add(order)
    email_service.send(order.user.email, "thanks!")   # blocks the txn
    uow.commit()
```

**Senior:**
```python
# Outbox: write the intent inside the txn; worker dispatches
with uow:
    uow.orders.add(order)
    uow.add_event(OrderPlaced(order_id=order.id))     # writes to outbox
    uow.commit()
```

## See Also

- [[Sections/database/patterns/repository-pattern|Repository pattern — abstract the persistence layer (Databases & SQLAlchemy)]]
- [[Sections/database/patterns/_Index|Databases & SQLAlchemy → Database Patterns — Architecture & Concurrency]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

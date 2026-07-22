---
type: "entry"
domain: "python"
file: "database"
section: "patterns"
id: "repository-pattern"
title: "Repository pattern — abstract the persistence layer"
category: "Architecture"
subtitle: "Protocol[OrderRepo], get / add / find_by_*, in-memory test double, Specification objects, when NOT to use it"
signature_short: "class OrderRepo(Protocol): def get(self, id: int) -> Order | None: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Repository pattern — abstract the persistence layer"
  - "repository-pattern"
tags:
  - "python"
  - "python/database"
  - "python/database/patterns"
  - "category/architecture"
  - "tier/tiered"
---

# Repository pattern — abstract the persistence layer

> Protocol[OrderRepo], get / add / find_by_*, in-memory test double, Specification objects, when NOT to use it

## Overview

The repository pattern hides "how data is stored" behind a stable interface ("get me an order by id"). Business logic depends on the interface, not on SQLAlchemy or any database. The win is testability — you can swap the SQL repo for an in-memory dict in unit tests — and a single chokepoint for query logic. The cost is layers; for small CRUD apps the indirection is overhead. The three examples solve the SAME task — fetch an order with its line items, find recent orders by user — at three depths: SQLAlchemy directly → Repository class with an in-memory test double → Protocol-based with Specifications and a swappable backend.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Fetch an order with its items; find recent orders for a user.
- **Junior** — SAME — but business code depends on a Repository, not Session.
- **Senior** — SAME — Protocol-typed repository; Specifications for complex queries; concrete implementations for SQL + in-memory.

## Signature

```python
class OrderRepo(Protocol): def get(self, id: int) -> Order | None: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Fetch an order with its items; find recent orders for a user.
# APPROACH  - Plain functions that take a Session; SQLAlchemy in business code.
# STRENGTHS - Smallest correct implementation; no abstractions to learn.
# WEAKNESSES- Tests need a real DB or a Session mock; query logic scattered.
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from myapp.models import Order

def get_order_with_items(session: Session, order_id: int) -> Order | None:
    return session.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    ).scalar_one_or_none()

def recent_orders_for_user(session: Session, user_id: int, limit: int = 20) -> list[Order]:
    return list(session.execute(
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .limit(limit)
    ).scalars().all())

# Use it in a handler.
def show_recent_orders(session: Session, user_id: int) -> list[dict]:
    orders = recent_orders_for_user(session, user_id)
    return [{"id": o.id, "total": o.total, "items": len(o.items)} for o in orders]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but business code depends on a Repository, not Session.
# APPROACH  - One class wrapping Session; in-memory double for unit tests.
# STRENGTHS - Tests don't need a DB; query logic centralized; clear seam.
# WEAKNESSES- One concrete class; harder to swap if the second backend
#             diverges (in-memory list won't honor SQL semantics exactly).
from dataclasses import dataclass, field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from myapp.models import Order

class OrderRepository:
    """SQL-backed repository — owns ALL Order queries."""
    def __init__(self, session: Session):
        self._session = session

    def get(self, order_id: int) -> Order | None:
        return self._session.execute(
            select(Order).where(Order.id == order_id)
                         .options(selectinload(Order.items))
        ).scalar_one_or_none()

    def add(self, order: Order) -> None:
        self._session.add(order)

    def recent_for_user(self, user_id: int, *, limit: int = 20) -> list[Order]:
        return list(self._session.execute(
            select(Order).where(Order.user_id == user_id)
                         .order_by(Order.created_at.desc()).limit(limit)
        ).scalars().all())


@dataclass
class InMemoryOrderRepository:
    """Test double — same shape, no Session. Ships with the test suite."""
    _by_id: dict[int, Order] = field(default_factory=dict)
    _next_id: int = 1

    def get(self, order_id: int) -> Order | None:
        return self._by_id.get(order_id)

    def add(self, order: Order) -> None:
        if order.id is None:
            order.id = self._next_id
            self._next_id += 1
        self._by_id[order.id] = order

    def recent_for_user(self, user_id: int, *, limit: int = 20) -> list[Order]:
        rows = [o for o in self._by_id.values() if o.user_id == user_id]
        rows.sort(key=lambda o: o.created_at, reverse=True)
        return rows[:limit]

# Handler depends on a Repository, not a Session. In tests, pass the in-memory.
def show_recent_orders(repo, user_id: int) -> list[dict]:
    return [{"id": o.id, "total": o.total, "items": len(o.items)}
            for o in repo.recent_for_user(user_id)]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Protocol-typed repository; Specifications for complex
#             queries; concrete implementations for SQL + in-memory.
# APPROACH  - typing.Protocol defines the interface; @dataclass Specs
#             encapsulate filter+sort+limit; backends translate to SQL or
#             list comprehension.
# STRENGTHS- Mypy enforces the contract; complex query logic stays
#             database-agnostic; trivial to add a third backend (Redis,
#             HTTP) for the rare case where one team needs it.
# WEAKNESSES- More code than a small CRUD app needs. Specifications shine
#             when queries are reused across handlers; if every query is
#             one-off, prefer the junior tier.
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol, runtime_checkable
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from myapp.models import Order

# 1) The contract — what handlers actually depend on.
@runtime_checkable
class OrderRepo(Protocol):
    def get(self, order_id: int) -> Order | None: ...
    def add(self, order: Order) -> None: ...
    def find(self, spec: "OrderSpec") -> list[Order]: ...

# 2) Specification — query criteria as a value object.
@dataclass(frozen=True)
class OrderSpec:
    user_id: int | None = None
    status: str | None = None
    since: "datetime | None" = None
    limit: int = 50
    sort_desc: bool = True

# 3) SQL backend — translates Spec to a SQL query.
class SqlOrderRepo:
    def __init__(self, session: Session):
        self._s = session

    def get(self, order_id: int) -> Order | None:
        return self._s.execute(
            select(Order).where(Order.id == order_id)
                         .options(selectinload(Order.items))
        ).scalar_one_or_none()

    def add(self, order: Order) -> None:
        self._s.add(order)

    def find(self, spec: OrderSpec) -> list[Order]:
        q = select(Order)
        if spec.user_id is not None:  q = q.where(Order.user_id == spec.user_id)
        if spec.status   is not None: q = q.where(Order.status == spec.status)
        if spec.since    is not None: q = q.where(Order.created_at >= spec.since)
        q = q.order_by(Order.created_at.desc() if spec.sort_desc else Order.created_at).limit(spec.limit)
        return list(self._s.execute(q).scalars().all())

# 4) In-memory backend — translates Spec to a list comprehension.
class InMemoryOrderRepo:
    def __init__(self):
        self._by_id: dict[int, Order] = {}
        self._next = 1

    def get(self, order_id: int) -> Order | None:
        return self._by_id.get(order_id)

    def add(self, order: Order) -> None:
        if order.id is None:
            order.id = self._next; self._next += 1
        self._by_id[order.id] = order

    def find(self, spec: OrderSpec) -> list[Order]:
        rows = list(self._by_id.values())
        if spec.user_id is not None: rows = [o for o in rows if o.user_id == spec.user_id]
        if spec.status   is not None: rows = [o for o in rows if o.status == spec.status]
        if spec.since    is not None: rows = [o for o in rows if o.created_at >= spec.since]
        rows.sort(key=lambda o: o.created_at, reverse=spec.sort_desc)
        return rows[:spec.limit]

# 5) Handler types its dependency by Protocol — substitution is type-safe.
def show_recent_paid_orders(repo: OrderRepo, user_id: int) -> list[dict]:
    spec = OrderSpec(user_id=user_id, status="paid", limit=20)
    return [{"id": o.id, "total": o.total} for o in repo.find(spec)]

# Decision rule:
#   small CRUD app                   -> SQLAlchemy direct (intro tier); repo is overhead
#   tests slow because of the DB     -> Repository + in-memory double (junior tier)
#   2+ backends OR rich query reuse  -> Protocol + Specifications (senior tier)
#   queries that fight the ORM       -> drop to repo.execute_raw_sql; don't model in Spec
#   need transactions across repos   -> Unit of Work (see unit-of-work entry)
#   audit/logging on every read       -> repo is the chokepoint for cross-cutting concerns
#   "I want to swap Postgres for X"  -> NO — repository hides Session not SQL dialects;
#                                       cross-DB portability lives below the repo
#
# Anti-pattern: a Repository that exposes one method per query — get_by_id,
# get_by_email, get_active_by_email, get_active_by_email_with_orders... a
# Specification object collapses the combinatorial explosion into one find()
# method that takes filter criteria. If your repo class has 30 get_X
# methods, refactor toward Specifications.
```

## Decision Rule

```text
small CRUD app                   -> SQLAlchemy direct (intro tier); repo is overhead
tests slow because of the DB     -> Repository + in-memory double (junior tier)
2+ backends OR rich query reuse  -> Protocol + Specifications (senior tier)
queries that fight the ORM       -> drop to repo.execute_raw_sql; don't model in Spec
need transactions across repos   -> Unit of Work (see unit-of-work entry)
audit/logging on every read       -> repo is the chokepoint for cross-cutting concerns
"I want to swap Postgres for X"  -> NO — repository hides Session not SQL dialects;
                                    cross-DB portability lives below the repo
```

## Anti-Pattern

> [!warning] Anti-pattern
> a Repository that exposes one method per query — get_by_id,
> get_by_email, get_active_by_email, get_active_by_email_with_orders... a
> Specification object collapses the combinatorial explosion into one find()
> method that takes filter criteria. If your repo class has 30 get_X
> methods, refactor toward Specifications.

## Tips

- Repositories abstract the Session, not the database. Switching from Postgres to MongoDB still requires rewriting the queries — the repository just gives you ONE place to do it.
- For unit tests, the in-memory double is the payoff. Make sure it honors the same INVARIANTS as the SQL repo (e.g., "add() with duplicate id raises") or your tests will pass when prod fails.
- Use `typing.Protocol` rather than abstract base classes. The duck-typing is more Pythonic, mypy enforces the contract, and you don't couple the test double to an inheritance chain.
- Specifications kill the combinatorial explosion of repo methods. `find(spec)` with a frozen dataclass scales; `get_active_by_email_in_region_since(...)` does not.
- Don't apply this pattern to small CRUD apps. The 100-line app with 3 routes does not need a Repository, a Spec, and a Protocol. Earn the layer first.
- Repositories are the right place for read-only caching, audit logging, soft-delete filters, and tenant scoping — cross-cutting concerns that you want enforced consistently.

## Common Mistake

> [!warning] A Repository that exposes one method per query (`get_by_id`, `get_by_email`, `get_active_by_email`, `get_active_by_email_with_orders`...). The class grows linearly with the number of distinct queries; new endpoints add new methods; tests double up. Use a Specification object — `find(OrderSpec(user_id=..., status=...))` — that collapses the combinations into one method.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Method explosion — every new query = new method
class OrderRepo:
    def get_by_user(self, uid): ...
    def get_active_by_user(self, uid): ...
    def get_active_by_user_since(self, uid, since): ...
```

**Senior:**
```python
# One find() + a Specification value object
class OrderRepo:
    def find(self, spec: OrderSpec) -> list[Order]: ...
```

## See Also

- [[Sections/database/patterns/unit-of-work|Unit of Work — atomic, repository-aware transactions (Databases & SQLAlchemy)]]
- [[Sections/database/patterns/_Index|Databases & SQLAlchemy → Database Patterns — Architecture & Concurrency]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

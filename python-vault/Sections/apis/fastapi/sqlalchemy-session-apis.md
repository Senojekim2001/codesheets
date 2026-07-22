---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "sqlalchemy-session-apis"
title: "SQLAlchemy session"
category: "FastAPI"
subtitle: "Session manages transactions — always use as context manager"
signature_short: "with Session(engine) as db: db.add(obj); db.commit()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SQLAlchemy session"
  - "sqlalchemy-session-apis"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# SQLAlchemy session

> Session manages transactions — always use as context manager

## Overview

The Session is the unit of work — it tracks objects and flushes changes to the database on commit. Always use a context manager to guarantee cleanup. Refresh after commit to reload server-generated values like auto-increment IDs.

## Signature

```python
with Session(engine) as db: db.add(obj); db.commit()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Session, add + commit + refresh
# STRENGTHS - Smallest valid CRUD: write a row, see its ID
# WEAKNESSES- No error handling, no query
#
from sqlalchemy.orm import Session

with Session(engine) as db:                           # auto-rollback on exception
    emp = Employee(name="Alice", email="alice@x.com")
    db.add(emp)
    db.commit()                                       # row written
    db.refresh(emp)                                   # reload server-generated id
    print(emp.id)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - 2.0-style select(), get() for PK, query composition, update + delete
# STRENGTHS - The four query patterns that handle most CRUD
# WEAKNESSES- No N+1 prevention discussion, no async session
#
from sqlalchemy import select
from sqlalchemy.orm import Session

with Session(engine) as db:
    # READ — primary key (cheap; uses identity map)
    emp = db.get(Employee, 1)

    # READ — single row by predicate
    alice = db.scalars(
        select(Employee).where(Employee.name == "Alice")
    ).one_or_none()                                   # 0 or 1; .one() raises on miss

    # READ — composed query: join + filter + order + limit
    rows = db.scalars(
        select(Employee)
          .join(Department)
          .where(Department.name == "Engineering",
                 Employee.salary > 80_000)
          .order_by(Employee.salary.desc())
          .limit(10)
    ).all()

    # UPDATE — mutate the tracked instance, then commit
    if alice:
        alice.salary = 95_000
        db.commit()

    # DELETE
    db.delete(alice)
    db.commit()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - N+1 prevention, bulk operations, locking, async sessions, error contracts
# STRENGTHS - The patterns that turn a slow ORM into a fast one
# WEAKNESSES- N/A
#
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy.exc import IntegrityError

# 1) N+1 prevention — declare loader strategy at QUERY time, not just on the relationship
with Session(engine) as db:
    # selectinload: separate IN(...) query per relationship — scales to many parents
    depts = db.scalars(
        select(Department).options(selectinload(Department.employees))
    ).all()
    for d in depts:
        for e in d.employees:                         # no extra queries
            ...

    # joinedload: single SQL JOIN — best for one-to-one or single parent fetch
    alice = db.scalar(
        select(Employee).options(joinedload(Employee.dept))
                        .where(Employee.id == 1)
    )

# 2) Bulk operations — orders of magnitude faster than per-row .save()
with Session(engine) as db:
    # bulk INSERT
    db.execute(Employee.__table__.insert(), [
        {"name": "Bob", "email": "b@x.com"},
        {"name": "Carol", "email": "c@x.com"},
    ])
    # bulk UPDATE
    db.execute(update(Employee).where(Employee.salary < 50_000).values(salary=50_000))
    # bulk DELETE
    db.execute(delete(Employee).where(Employee.dept_id.is_(None)))
    db.commit()

# 3) SELECT FOR UPDATE — row-level lock for read-modify-write safety
with Session(engine) as db:
    e = db.scalar(
        select(Employee).where(Employee.id == 1).with_for_update()
    )
    e.salary += 1000                                  # other transactions wait
    db.commit()

# 4) Stable error contract — wrap commits, rollback ALWAYS, re-raise typed
def safe_commit(db: Session):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise                                         # let caller translate to 409 etc.

# 5) Async session (SQLAlchemy 2.0 + async driver: postgres+asyncpg)
# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
# async with AsyncSession(async_engine) as db:
#     emp = (await db.scalars(select(Employee))).all()

# Decision rule:
#   single PK lookup                          -> db.get(Model, pk)
#   single row by predicate                    -> .one() / .one_or_none() / .scalar()
#   list query                                  -> .scalars(...).all()
#   parent + many children                     -> selectinload (one extra IN query)
#   single parent + child                       -> joinedload (single JOIN)
#   bulk INSERT/UPDATE/DELETE                  -> Core .execute(), not loops + .save()
#   read-modify-write across processes         -> .with_for_update() inside a transaction
#   FastAPI                                     -> session per request via Depends(get_db)
#
# Anti-pattern: keeping a Session open across requests
#   Identity map fills with stale objects; later commits leak data from one
#   request into another. Always: ONE session per unit of work, opened on the
#   way in, closed (and rolled back) on the way out.

class Department: pass
class Employee:
    __table__ = None
def engine(): pass
```

## Decision Rule

```text
single PK lookup                          -> db.get(Model, pk)
single row by predicate                    -> .one() / .one_or_none() / .scalar()
list query                                  -> .scalars(...).all()
parent + many children                     -> selectinload (one extra IN query)
single parent + child                       -> joinedload (single JOIN)
bulk INSERT/UPDATE/DELETE                  -> Core .execute(), not loops + .save()
read-modify-write across processes         -> .with_for_update() inside a transaction
FastAPI                                     -> session per request via Depends(get_db)
```

## Anti-Pattern

> [!warning] Anti-pattern
> keeping a Session open across requests
>   Identity map fills with stale objects; later commits leak data from one
>   request into another. Always: ONE session per unit of work, opened on the
>   way in, closed (and rolled back) on the way out.

## Tips

- `db.refresh(obj)` after commit reloads server-generated fields — without it, `obj.id` may be None
- `db.scalars(select(Model))` is the SQLAlchemy 2.0 query style — cleaner than legacy `db.query(Model)`
- The `with Session(engine) as db:` context manager automatically rolls back on exception
- `db.get(Model, pk)` is faster than a full query for primary key lookups
- For read-modify-write across processes use `select(...).with_for_update()` inside a transaction — it acquires a row lock so concurrent updates do not lose writes
- Bulk INSERT/UPDATE/DELETE: Core `.execute(insert(Model), [...])` is orders of magnitude faster than a loop of `db.add` + `commit`
- In FastAPI, open ONE session per request via `Depends(get_db)` — keeping a session across requests pollutes the identity map and leaks data between callers

## Common Mistake

> [!warning] Not calling `db.refresh(obj)` after `db.commit()`. The in-memory object's server-generated fields (id, timestamps) are stale until refreshed.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sqlalchemy.orm import Session
from sqlalchemy import select
with Session(engine) as db:
# Create:
```

**Senior:**
```python
db.commit()
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

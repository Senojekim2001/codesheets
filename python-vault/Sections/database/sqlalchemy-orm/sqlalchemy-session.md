---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-session"
title: "Session — Unit of Work and Identity Map"
category: "ORM Setup"
subtitle: "sessionmaker, Session, scoped_session, async_sessionmaker, with-blocks, commit/rollback discipline"
signature_short: "Session = sessionmaker(engine)  |  with Session() as s, s.begin(): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Session — Unit of Work and Identity Map"
  - "sqlalchemy-session"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-setup"
  - "tier/tiered"
---

# Session — Unit of Work and Identity Map

> sessionmaker, Session, scoped_session, async_sessionmaker, with-blocks, commit/rollback discipline

## Overview

A Session is a workspace for ORM objects: it stages changes, deduplicates by primary key (identity map), and flushes them as one transaction on commit. Modern SQLAlchemy 2.0 uses context-manager + s.begin() for automatic commit/rollback. One Session per request/job, never shared across threads. async_sessionmaker for async applications.

## Signature

```python
Session = sessionmaker(engine)  |  with Session() as s, s.begin(): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sessionmaker(engine) returns a factory; with-block scopes one transaction.
# STRENGTHS - Auto-commit on clean exit, auto-rollback on exception.
# WEAKNESSES- Session is NOT thread-safe; one per thread/request.
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(ENGINE)

with Session() as session:                       # begins a transaction
    user = session.get(User, 1)                  # SELECT
    user.name = "Ada"                             # staged in identity map
# session is closed; transaction committed
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Use s.begin() for explicit commit semantics; expire_on_commit=False keeps objects usable after commit; one Session per logical unit of work.
# STRENGTHS - Clear transaction boundaries; objects don't trigger SELECTs after commit.
# WEAKNESSES- expire_on_commit=False means object state can lag the DB after commit — re-query if you need fresh data.
from sqlalchemy.orm import sessionmaker, Session as OrmSession

Session = sessionmaker(ENGINE, expire_on_commit=False)

# Pattern 1: explicit transaction block.
with Session() as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"
    # commit on clean exit; rollback on exception

# Pattern 2: nested savepoints (sub-transactions).
with Session() as session, session.begin():
    user = session.get(User, 1)
    with session.begin_nested():                 # SAVEPOINT
        try:
            risky_thing(user)
        except Exception:
            pass                                  # outer transaction continues

# Pattern 3: factory function for dependency injection.
def get_session():
    with Session() as s, s.begin():
        yield s
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - One Session per request (web), per job (worker), per test. Hand it to handlers via DI; never module-global.
# STRENGTHS - Predictable transaction boundaries; testable (swap with in-memory session); no leaks across requests.
# WEAKNESSES- Long-running Sessions accumulate identity-map memory; for large batch jobs, .expunge_all() periodically or process in chunks.
from __future__ import annotations
from contextlib import contextmanager
from typing import Iterator
from sqlalchemy.orm import sessionmaker, Session as OrmSession

SessionFactory = sessionmaker(ENGINE, expire_on_commit=False)

@contextmanager
def session_scope() -> Iterator[OrmSession]:
    """Provide a transactional scope around a series of operations."""
    session = SessionFactory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# FastAPI/Flask request handler — DI gives ONE session per request.
def get_db() -> Iterator[OrmSession]:
    with session_scope() as s:
        yield s

# Worker batch job — chunked to avoid identity-map bloat.
def reindex_users(batch_size: int = 1000):
    with SessionFactory() as session:
        offset = 0
        while True:
            with session.begin():
                rows = session.scalars(
                    select(User).order_by(User.id).offset(offset).limit(batch_size)
                ).all()
                if not rows: break
                for u in rows:
                    u.search_blob = build_blob(u)
            session.expunge_all()                 # release identity map between batches
            offset += batch_size

# Decision rule:
#   web request                           -> one Session per request via DI
#   background job / cron                 -> one Session per job, with periodic expunge_all
#   batch ETL                             -> Session per chunk; commit per chunk; expunge between
#   tests                                 -> Session per test, with rollback in fixture teardown
#   threading                             -> Session per THREAD; never share; or use scoped_session
#   long-lived script / REPL              -> reset() periodically or detach unneeded objects
#   need fresh data after commit          -> expire_on_commit=True (default), or .refresh(obj)
#   need objects usable after commit      -> expire_on_commit=False (modern preference)
#
# Anti-pattern: a module-level Session() shared across requests/threads. Each
# request lands in the same identity map, mutations leak between users, and
# concurrent commits race. Session is request-scoped; ENGINE is process-scoped.
```

## Decision Rule

```text
web request                           -> one Session per request via DI
background job / cron                 -> one Session per job, with periodic expunge_all
batch ETL                             -> Session per chunk; commit per chunk; expunge between
tests                                 -> Session per test, with rollback in fixture teardown
threading                             -> Session per THREAD; never share; or use scoped_session
long-lived script / REPL              -> reset() periodically or detach unneeded objects
need fresh data after commit          -> expire_on_commit=True (default), or .refresh(obj)
need objects usable after commit      -> expire_on_commit=False (modern preference)
```

## Anti-Pattern

> [!warning] Anti-pattern
> a module-level Session() shared across requests/threads. Each
> request lands in the same identity map, mutations leak between users, and
> concurrent commits race. Session is request-scoped; ENGINE is process-scoped.

## Tips

- Modern 2.0 idiom: `with Session() as s, s.begin():` — that single line gives you commit-on-success, rollback-on-exception, and close-on-exit.
- expire_on_commit=False is the modern default for web apps — it keeps loaded objects usable after commit. The traditional default (True) was designed for SQL-only refreshes.
- session.flush() pushes pending changes to the DB without committing — useful when you need an autogenerated primary key before committing.
- session.merge(obj) is for "upsert from a detached object" — cleaner than session.add(obj) when obj already has a primary key.
- Don't catch DB exceptions inside the session.begin() block to "continue" — once an error fires, the transaction is poisoned. Catch outside, then start a new transaction.

## Common Mistake

> [!warning] Sharing a Session across threads or requests. The identity map is not thread-safe and the transaction boundaries blur, leading to lost updates and stale-read bugs. One Session per logical unit of work — request, job, or test.

## Shorthand (Junior → Senior)

**Junior:**
```python
session = Session()
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

**Senior:**
```python
with Session() as session, session.begin():
    user = session.get(User, 1)
    user.name = "Ada"
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T] (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-scoped-session"
title: "scoped_session — Thread / Request-Scoped Session Management"
category: "ORM Setup"
subtitle: "scoped_session, scopefunc, async_scoped_session, session.remove(), Flask-style request scoping"
signature_short: "Session = scoped_session(sessionmaker(engine), scopefunc=get_request_id)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scoped_session — Thread / Request-Scoped Session Management"
  - "sqlalchemy-scoped-session"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-setup"
  - "tier/tiered"
---

# scoped_session — Thread / Request-Scoped Session Management

> scoped_session, scopefunc, async_scoped_session, session.remove(), Flask-style request scoping

## Overview

scoped_session wraps a sessionmaker so calling `Session()` returns the SAME session for the current scope (thread by default, customizable via scopefunc). It's the classic Flask-SQLAlchemy pattern. Modern apps often skip it in favor of explicit DI (passing the Session through), which is more testable. Use scoped_session when integrating with frameworks that don't support DI cleanly.

## Signature

```python
Session = scoped_session(sessionmaker(engine), scopefunc=get_request_id)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scoped_session returns the same Session per thread; call .remove() at request end.
# STRENGTHS - Implicit access from any module without passing a Session around.
# WEAKNESSES- Implicit state is hard to test and debug; modern code prefers explicit injection.
from sqlalchemy.orm import scoped_session, sessionmaker

SessionFactory = sessionmaker(ENGINE)
Session = scoped_session(SessionFactory)             # thread-local by default

# Anywhere in the codebase, calling Session() returns the SAME instance per thread.
def get_user(user_id: int):
    return Session().get(User, user_id)

# At the end of every request:
Session.remove()                                     # close + return to pool
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Custom scopefunc to scope per-request; teardown hooks ensure remove() always fires.
# STRENGTHS - One Session per request, automatic cleanup, no explicit threading.
# WEAKNESSES- Forgetting to call remove() leaks connections; hook into framework teardown signals.
from contextvars import ContextVar
from sqlalchemy.orm import scoped_session, sessionmaker

# Per-request scope using ContextVar (works for sync AND async with effort).
_request_id: ContextVar[str] = ContextVar("request_id", default="default")

def get_request_id() -> str:
    return _request_id.get()

SessionFactory = sessionmaker(ENGINE)
Session = scoped_session(SessionFactory, scopefunc=get_request_id)

# Flask integration — register teardown hook.
from flask import Flask
app = Flask(__name__)

@app.before_request
def open_request():
    import uuid
    _request_id.set(uuid.uuid4().hex)

@app.teardown_request
def close_request(exc):
    Session.remove()                                # always fires, even on exception

# Inside any view:
@app.route("/users/<int:uid>")
def show_user(uid):
    user = Session().get(User, uid)                 # same Session for this request
    return {"name": user.name}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Prefer dependency injection over scoped_session in new code. Use scoped_session ONLY when integrating with frameworks that resist DI.
# STRENGTHS - Explicit Session passing is testable, debuggable, and forces transaction boundaries to be visible.
# WEAKNESSES- DI requires a framework hook (FastAPI Depends, Pyramid request methods); scoped_session is the fallback when those aren't available.
from __future__ import annotations
from contextlib import contextmanager
from typing import Iterator
from sqlalchemy.ext.asyncio import async_scoped_session, async_sessionmaker
from sqlalchemy.orm import Session, scoped_session, sessionmaker
from asyncio import current_task

# === RECOMMENDED for new code: explicit DI ===

SessionFactory = sessionmaker(ENGINE, expire_on_commit=False)

def get_db() -> Iterator[Session]:
    """FastAPI / framework DI hook — ONE session per request, explicit."""
    with SessionFactory() as session:
        yield session

# In your endpoints:
# @app.get("/users/{user_id}")
# def show_user(user_id: int, db: Session = Depends(get_db)):
#     return db.get(User, user_id)


# === FALLBACK: scoped_session for legacy / non-DI frameworks ===

ScopedSession = scoped_session(SessionFactory)

@contextmanager
def request_scope():
    """Bracket a logical scope; ensures remove() always fires."""
    try:
        yield ScopedSession()
    finally:
        ScopedSession.remove()


# === ASYNC: async_scoped_session ===
# scopefunc must return a hashable id per task — current_task is the canonical choice.

AsyncSessionFactory = async_sessionmaker(ASYNC_ENGINE, expire_on_commit=False)
AsyncScopedSession = async_scoped_session(
    AsyncSessionFactory, scopefunc=current_task
)

async def async_handler():
    async with AsyncScopedSession() as session:
        user = await session.get(User, 1)
    await AsyncScopedSession.remove()              # NOTE: await; release per-task

# Decision rule:
#   FastAPI / framework with DI            -> Depends(get_db); explicit, testable
#   Flask classic                           -> scoped_session + teardown_request hook
#   threaded background workers             -> scoped_session (default thread scopefunc) OR per-job Session
#   asyncio                                 -> async_scoped_session(scopefunc=current_task)
#   testing                                 -> override the dependency / replace the factory; never hit a global
#   long-running script / one-off job       -> plain Session() in a with-block; no scoping needed
#   you find yourself globally importing
#     a Session and using it from random
#     modules                                -> stop. Pass it as an argument; future-you will thank present-you.
#
# Anti-pattern: scoped_session without remove(). Each request opens a Session;
# without remove(), connections accumulate in the pool and never return. Tests
# pass (small N); production OOMs after a day. Always pair scoped_session with
# a teardown hook that calls .remove() — every framework has one.
```

## Decision Rule

```text
FastAPI / framework with DI            -> Depends(get_db); explicit, testable
Flask classic                           -> scoped_session + teardown_request hook
threaded background workers             -> scoped_session (default thread scopefunc) OR per-job Session
asyncio                                 -> async_scoped_session(scopefunc=current_task)
testing                                 -> override the dependency / replace the factory; never hit a global
long-running script / one-off job       -> plain Session() in a with-block; no scoping needed
you find yourself globally importing
  a Session and using it from random
  modules                                -> stop. Pass it as an argument; future-you will thank present-you.
```

## Anti-Pattern

> [!warning] Anti-pattern
> scoped_session without remove(). Each request opens a Session;
> without remove(), connections accumulate in the pool and never return. Tests
> pass (small N); production OOMs after a day. Always pair scoped_session with
> a teardown hook that calls .remove() — every framework has one.

## Tips

- For new code, prefer explicit Session injection (FastAPI `Depends(get_db)`, function parameters). It's testable, traceable, and forces transaction boundaries to be visible at every call site.
- If you must use scoped_session, ALWAYS register a teardown hook (`app.teardown_request` in Flask, signal handlers elsewhere) that calls `Session.remove()`. Forgetting this leaks connections forever.
- `async_scoped_session` exists for asyncio — use `scopefunc=current_task` so each coroutine gets its own session even when many run concurrently.
- In tests, replace the scope or override the DI factory rather than mutating the global session — global mutation in tests is the #1 source of "passes locally, fails in CI" bugs.
- scoped_session's `__call__` returns the underlying Session — `Session()` and `Session.scalars(...)` both work because of the proxy. Don't mistake the scope object for an instance.

## Common Mistake

> [!warning] Using a module-level scoped_session and forgetting to call `.remove()` at request end. Each request creates a new bound session that never gets returned to the pool. Pool exhausts; subsequent requests hang waiting for a connection. Pair scoped_session with a teardown hook every time, or skip scoped_session entirely in favor of DI.

## Shorthand (Junior → Senior)

**Junior:**
```python
# scoped_session without teardown — connection leak
Session = scoped_session(sessionmaker(ENGINE))
def view(request):
    return Session().get(User, 1)
# (no Session.remove() ever fires)
```

**Senior:**
```python
# DI pattern — explicit session per request
def get_db():
    with SessionFactory() as session:
        yield session

@app.get("/user/{id}")
def view(id: int, db: Session = Depends(get_db)):
    return db.get(User, id)
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T] (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

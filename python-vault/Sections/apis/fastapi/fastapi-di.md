---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "fastapi-di"
title: "FastAPI dependency injection"
category: "FastAPI"
subtitle: "Depends() injects shared resources — composable and testable"
signature_short: "def route(dep=Depends(get_dep)): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "FastAPI dependency injection"
  - "fastapi-di"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# FastAPI dependency injection

> Depends() injects shared resources — composable and testable

## Overview

FastAPI's Depends() system injects dependencies (DB sessions, auth tokens, config) into route functions. Dependencies can depend on other dependencies (composition). Yield dependencies handle setup and teardown.

## Signature

```python
def route(dep=Depends(get_dep)): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Depends() that returns a value — pagination params
# STRENGTHS - Smallest valid use of FastAPI's DI
# WEAKNESSES- No yield/teardown, no composition
#
from fastapi import Depends, FastAPI

app = FastAPI()

def pagination(skip: int = 0, limit: int = 50):
    return {"skip": skip, "limit": min(limit, 100)}

@app.get("/items")
async def list_items(p: dict = Depends(pagination)):
    return {"page": p}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Yield-style resource cleanup, dependency composition, override in tests
# STRENGTHS - DB session + auth = the two dependencies every API has
# WEAKNESSES- No scopes, no class-based dependencies
#
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

# 1) Yield dependency — setup before, teardown after; runs even on errors
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2) Composition — dependencies can depend on other dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme),
                     db = Depends(get_db)):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(401, "invalid token",
                            headers={"WWW-Authenticate": "Bearer"})
    return user

def get_admin(user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(403, "admins only")
    return user

@app.get("/me")
async def me(user = Depends(get_current_user)):
    return {"id": user.id, "name": user.name}

@app.delete("/users/{uid}")
async def delete_user(uid: int,
                      db    = Depends(get_db),
                      _admin = Depends(get_admin)):
    db.query(User).filter(User.id == uid).delete()
    db.commit()
    return {"deleted": uid}

# Tests: app.dependency_overrides[get_db] = lambda: test_db   (clean override)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Class dependencies, sub-dependencies, Annotated for clean type hints, scopes
# STRENGTHS - The patterns that scale DI past hello-world
# WEAKNESSES- N/A
#
from typing import Annotated
from fastapi import Depends, FastAPI, Header, Request, HTTPException

app = FastAPI()

# 1) Annotated[Type, Depends(fn)] — single source of truth, no duplication on every route
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

DBSession = Annotated[Session, Depends(get_db)]    # define the type ONCE, reuse it

@app.get("/users/{uid}")
async def get_user(uid: int, db: DBSession):       # cleaner than db = Depends(get_db) on every route
    return db.get(User, uid)

# 2) Class-based dependency — natural fit for "stateful" deps with multiple inputs
class Pagination:
    def __init__(self, skip: int = 0, limit: int = 50, max_limit: int = 100):
        self.skip = skip
        self.limit = min(limit, max_limit)

@app.get("/items")
async def list_items(p: Annotated[Pagination, Depends()]):
    return {"skip": p.skip, "limit": p.limit}

# 3) Per-request state via dependencies + middleware — request-id propagation
async def get_request_id(request: Request,
                         x_request_id: str | None = Header(default=None)):
    rid = x_request_id or request.headers.get("traceparent") or "anon"
    request.state.request_id = rid
    return rid

@app.get("/work")
async def work(rid: str = Depends(get_request_id)):
    return {"request_id": rid}

# 4) Caching — by default, the SAME dependency is computed once per request.
#    Pass use_cache=False to force recomputation when needed (rare).
def expensive_check(): return "ok"
@app.get("/x")
async def x(c1: str = Depends(expensive_check),
            c2: str = Depends(expensive_check, use_cache=False)):  # called twice
    return c1, c2

# 5) Override in tests — the only sane way to swap the DB
# def fake_db(): yield FakeSession()
# app.dependency_overrides[get_db] = fake_db
# ... TestClient(app) ...
# app.dependency_overrides.clear()

# Decision rule:
#   shared resource per request           -> yield dependency (db, redis, otel span)
#   reused across handlers, no setup       -> plain function dependency
#   bundles multiple inputs                 -> class dependency (Annotated[..., Depends()])
#   cross-cutting policy (auth, RBAC)       -> compose dependencies; declare on the route
#   value derived from headers / cookies    -> dependency that takes Header / Cookie / Request
#   want test isolation                      -> app.dependency_overrides
#
# Anti-pattern: importing a global SessionLocal in handlers
#   The session leaks past the request, isn't closed on errors, and survives in
#   one async task while another resets it. Always go through Depends(get_db).

def verify_token(t, db): return None
def SessionLocal(): return None
class Session: pass
class User: pass
```

## Decision Rule

```text
shared resource per request           -> yield dependency (db, redis, otel span)
reused across handlers, no setup       -> plain function dependency
bundles multiple inputs                 -> class dependency (Annotated[..., Depends()])
cross-cutting policy (auth, RBAC)       -> compose dependencies; declare on the route
value derived from headers / cookies    -> dependency that takes Header / Cookie / Request
want test isolation                      -> app.dependency_overrides
```

## Anti-Pattern

> [!warning] Anti-pattern
> importing a global SessionLocal in handlers
>   The session leaks past the request, isn't closed on errors, and survives in
>   one async task while another resets it. Always go through Depends(get_db).

## Tips

- `yield` in a dependency — code before yield is setup, code after is teardown (always runs)
- Dependencies can depend on other dependencies — compose them like building blocks
- Dependencies are cached per request — `get_db()` is called once even if multiple routes use it
- Override dependencies in tests: `app.dependency_overrides[get_db] = lambda: test_db`

## Common Mistake

> [!warning] Creating a DB session at module level instead of using a dependency. Module-level sessions are not scoped to a request — they accumulate connections and cause leaks.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

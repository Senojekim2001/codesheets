---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "fastapi-routes"
title: "FastAPI routes"
category: "FastAPI"
subtitle: "Path params, query params, request body — all validated via type hints"
signature_short: "@app.get(\"/items/{id}\") async def fn(id: int, q: str = None):"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "FastAPI routes"
  - "fastapi-routes"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# FastAPI routes

> Path params, query params, request body — all validated via type hints

## Overview

FastAPI uses Python type hints for automatic request validation, serialization, and OpenAPI docs generation (available at /docs). Path parameters are in the URL; query parameters are function arguments with defaults; request body comes from Pydantic models.

## Signature

```python
@app.get("/items/{id}") async def fn(id: int, q: str = None):
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One GET, one path param, type hint drives validation
# STRENGTHS - Smallest valid FastAPI app — auto docs at /docs
# WEAKNESSES- No body, no error handling, no response_model
#
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

# $ uvicorn main:app --reload
# Open http://localhost:8000/docs for the auto-generated Swagger UI
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Path/query/body, response_model, status codes, HTTPException
# STRENGTHS - The four pieces every real handler needs
# WEAKNESSES- No DI, no auth, no streaming
#
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Sales API", version="1.0.0")

class UserIn(BaseModel):
    name:  str
    email: str
    age:   int | None = None

class UserOut(BaseModel):
    id:    int
    name:  str
    email: str

# GET with path param (typed) + query param (with default = optional)
@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, verbose: bool = False):
    user = fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user                                   # response_model strips extra fields

# POST returns 201 — never 200 on creation
@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserIn):
    return persist_user(body.model_dump())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - APIRouter, verb decorators, response models per status, OpenAPI tuning
# STRENGTHS - The shape every multi-route service converges on
# WEAKNESSES- N/A
#
from fastapi import FastAPI, APIRouter, HTTPException, status, Path, Query
from pydantic import BaseModel, Field

# 1) APIRouter — split routes into modules, mount with a single line
users_router = APIRouter(prefix="/users", tags=["users"])

class UserOut(BaseModel):
    id:    int
    name:  str
    email: str

class ErrorOut(BaseModel):
    error:   str
    request_id: str | None = None

# 2) responses= documents non-200 status codes in OpenAPI
@users_router.get(
    "/{user_id}",
    response_model=UserOut,
    responses={
        404: {"model": ErrorOut, "description": "User not found"},
        429: {"model": ErrorOut, "description": "Rate limit exceeded"},
    },
)
async def get_user(
    user_id: int = Path(..., gt=0, description="positive integer ID"),
    fields:  list[str] = Query(default=[], max_length=10),
):
    user = fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user

# 3) Verb decorators (FastAPI 0.95+) — clearer than @app.api_route(methods=[...])
@users_router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserOut):                # use a separate UserIn in real code
    return body

# 4) Mount the router on the app — keep app.py tiny
app = FastAPI()
app.include_router(users_router)

# Decision rule:
#   < 5 routes total                    -> @app.get / @app.post on the FastAPI instance
#   feature-grouped routes               -> APIRouter(prefix=..., tags=...) per module
#   document non-2xx responses           -> responses={404: {...}, ...}
#   constrain path / query parameters     -> Path(..., gt=0) / Query(..., max_length=N)
#   shared logic across handlers          -> dependency injection, not helper imports
#   long-running endpoint                  -> StreamingResponse / BackgroundTasks
#
# Anti-pattern: business logic crammed into route bodies
#   Routes are a HTTP layer: validate, authenticate, call a service, shape the
#   response. Push DB / email / payment logic into a service module so it stays
#   testable independently of FastAPI.

def fetch_user(_): return None
def persist_user(d): return {"id": 1, **d}
```

## Decision Rule

```text
< 5 routes total                    -> @app.get / @app.post on the FastAPI instance
feature-grouped routes               -> APIRouter(prefix=..., tags=...) per module
document non-2xx responses           -> responses={404: {...}, ...}
constrain path / query parameters     -> Path(..., gt=0) / Query(..., max_length=N)
shared logic across handlers          -> dependency injection, not helper imports
long-running endpoint                  -> StreamingResponse / BackgroundTasks
```

## Anti-Pattern

> [!warning] Anti-pattern
> business logic crammed into route bodies
>   Routes are a HTTP layer: validate, authenticate, call a service, shape the
>   response. Push DB / email / payment logic into a service module so it stays
>   testable independently of FastAPI.

## Tips

- FastAPI auto-generates `/docs` (Swagger UI) and `/redoc` — browse the API interactively
- `response_model=` strips private fields before returning — prevents leaking internal data
- `raise HTTPException(status_code=404, detail="msg")` is the standard error response
- `status_code=201` on POST routes — 200 is incorrect for creation

## Common Mistake

> [!warning] Putting all logic in route functions. Move DB queries and business logic to service functions — routes should only handle HTTP concerns (parsing, status codes, HTTPException).

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

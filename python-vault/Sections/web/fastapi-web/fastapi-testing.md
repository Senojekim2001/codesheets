---
type: "entry"
domain: "python"
file: "web"
section: "fastapi-web"
id: "fastapi-testing"
title: "TestClient"
category: "FastAPI"
subtitle: "Unit testing, endpoint validation, mocking"
signature_short: "from fastapi.testclient import TestClient  |  client.get(url)  |  assert response.status_code"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "TestClient"
  - "fastapi-testing"
tags:
  - "python"
  - "python/web"
  - "python/web/fastapi-web"
  - "category/fastapi"
  - "tier/tiered"
---

# TestClient

> Unit testing, endpoint validation, mocking

## Overview

FastAPI provides `TestClient` for synchronous testing of endpoints. It wraps `httpx.Client` and simulates HTTP requests without running a server. Use it in pytest to validate routes, status codes, and response bodies.

## Signature

```python
from fastapi.testclient import TestClient  |  client.get(url)  |  assert response.status_code
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Spin up TestClient, hit one endpoint, assert status + body
# STRENGTHS - Smallest pytest-able shape for a FastAPI route
# WEAKNESSES- No fixtures, no JSON body, no failure cases
#
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello"}

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Hello"}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - JSON body posts, query params, error cases, pytest fixtures
# STRENGTHS - The shape a real test_*.py file takes for an HTTP handler
# WEAKNESSES- No DB isolation; no dependency overrides
#
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items", status_code=201)
def create(item: Item):
    if item.price <= 0:
        raise HTTPException(status_code=422, detail="price must be positive")
    return {"id": 1, **item.model_dump()}

@pytest.fixture
def client():
    with TestClient(app) as c:        # context manager runs lifespan startup/shutdown
        yield c

def test_create_item_ok(client):
    r = client.post("/items", json={"name": "Widget", "price": 9.99})
    assert r.status_code == 201
    assert r.json()["id"] == 1

def test_create_item_invalid(client):
    r = client.post("/items", json={"name": "Widget", "price": -1})
    assert r.status_code == 422
    assert "positive" in r.json()["detail"]

def test_query_params(client):
    r = client.get("/items", params={"limit": 5})
    # 404 expected — we didn't define GET /items, just verifying param plumbing
    assert r.status_code == 404
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - dependency_overrides, async tests, DB isolation, factory_boy
# STRENGTHS - The patterns that keep a test suite fast, isolated, and trustworthy
# WEAKNESSES- N/A
#
import pytest, asyncio
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from httpx import AsyncClient

app = FastAPI()

# 1) A dependency that talks to "the real database"
def get_db():
    raise NotImplementedError("override in tests")

@app.get("/users/{uid}")
def get_user(uid: int, db = Depends(get_db)):
    return db.fetch(uid)

# 2) Override the dependency with an in-memory fake — no monkeypatching imports
class FakeDB:
    def fetch(self, uid): return {"id": uid, "name": "alice"}

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = lambda: FakeDB()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()              # ALWAYS reset between tests

def test_get_user(client):
    assert client.get("/users/7").json() == {"id": 7, "name": "alice"}

# 3) Async tests for genuine async behavior — TestClient is sync.
#    Use httpx.AsyncClient with the ASGI transport for end-to-end async testing.
@pytest.mark.asyncio
async def test_async_path():
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/users/1")
    assert r.status_code == 200

# 4) Database isolation — each test gets a transaction that's rolled back at the end
@pytest.fixture
def db_session():
    # session = TestingSessionLocal()
    # transaction = session.begin_nested()
    # try:    yield session
    # finally:
    #     transaction.rollback()
    #     session.close()
    yield "fake-session"

# Decision rule:
#   sync route, simple                 -> TestClient + pytest fixtures
#   async-only behavior to verify       -> httpx.AsyncClient + ASGITransport
#   DB-touching tests                    -> per-test transaction; rollback in fixture
#   external HTTP calls                  -> respx (httpx) or vcrpy to record/replay
#   parametrized data scenarios          -> @pytest.mark.parametrize, not for-loops
#
# Anti-pattern: monkeypatching the global db engine
#   Tests leak into each other; ordering matters; flakes appear. Use
#   app.dependency_overrides — it's per-app, scoped, and trivially reversible.
```

## Decision Rule

```text
sync route, simple                 -> TestClient + pytest fixtures
async-only behavior to verify       -> httpx.AsyncClient + ASGITransport
DB-touching tests                    -> per-test transaction; rollback in fixture
external HTTP calls                  -> respx (httpx) or vcrpy to record/replay
parametrized data scenarios          -> @pytest.mark.parametrize, not for-loops
```

## Anti-Pattern

> [!warning] Anti-pattern
> monkeypatching the global db engine
>   Tests leak into each other; ordering matters; flakes appear. Use
>   app.dependency_overrides — it's per-app, scoped, and trivially reversible.

## Tips

- TestClient is synchronous; use it in pytest with regular functions.
- Pass query params as kwargs: `client.get("/path", params={"key": "value"})`.
- Use `client.post(url, json={...})` for JSON bodies.

## Common Mistake

> [!warning] Using async TestClient for synchronous testing; TestClient handles async routes.

## Shorthand (Junior → Senior)

**Junior:**
```python
client = TestClient(app)
response = client.get("/items/1")
assert response.status_code == 200
data = response.json()
assert data["item_id"] == 1
```

**Senior:**
```python
client = TestClient(app)
assert client.get("/items/1").status_code == 200
assert client.get("/items/1").json()["item_id"] == 1
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/web/fastapi-web/_Index|Web (Flask, Django) → FastAPI]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

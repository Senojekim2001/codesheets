---
type: "entry"
domain: "python"
file: "testing"
section: "fixtures"
id: "integration-tests"
title: "Integration test patterns"
category: "Fixtures"
subtitle: "TestClient for FastAPI, in-memory DB, temp directories"
signature_short: "TestClient(app) | SQLite in-memory | tmp_path fixture"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Integration test patterns"
  - "integration-tests"
tags:
  - "python"
  - "python/testing"
  - "python/testing/fixtures"
  - "category/fixtures"
  - "tier/tiered"
---

# Integration test patterns

> TestClient for FastAPI, in-memory DB, temp directories

## Overview

Integration tests verify that components work together correctly. FastAPI's TestClient makes HTTP requests without starting a server. Use SQLite in-memory for DB tests. pytest's tmp_path fixture provides a temporary directory per test.

## Signature

```python
TestClient(app) | SQLite in-memory | tmp_path fixture
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - FastAPI TestClient hits the app in-process; tmp_path for files
# STRENGTHS - Smallest valid integration test for an HTTP endpoint
# WEAKNESSES- No DB; no dependency override
#
from fastapi.testclient import TestClient
from myapp.main import app

client = TestClient(app)

def test_health_endpoint():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

def test_writes_csv(tmp_path):                  # tmp_path: built-in pytest fixture
    out = tmp_path / "out.csv"
    write_report(out)
    assert out.exists()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - In-memory SQLite + dependency_overrides to swap the real DB
# STRENGTHS - The standard pattern for testing an HTTP+DB stack with no real infra
# WEAKNESSES- StaticPool wiring isn't shown; will be in senior tier
#
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from myapp.main import app, get_db
from myapp.db import Base

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:",
                           connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def client(test_db):
    def _override():
        yield test_db
    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()           # ALWAYS reset after test

def test_create_user_persists(client):
    r = client.post("/users/", json={"name": "Alice", "email": "a@x.com"})
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Alice"
    assert "id" in body
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - StaticPool, transactional rollback, multi-resource ExitStack, parametrized backend
# STRENGTHS - The harness that gives fast AND isolated AND production-shape integration tests
# WEAKNESSES- N/A
#
import contextlib
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from myapp.main import app, get_db
from myapp.db import Base

# 1) Session-scoped engine. StaticPool keeps ONE in-memory SQLite connection so
#    schema changes survive across sessions in the test process.
@pytest.fixture(scope="session")
def engine():
    e = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(e)
    yield e
    e.dispose()

# 2) Function-scoped session — wrap each test in a SAVEPOINT, roll back at end.
#    Tests stay isolated AND avoid recreating the schema 1000 times.
@pytest.fixture
def db(engine):
    connection  = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    nested = connection.begin_nested()             # SAVEPOINT
    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(s, t):
        nonlocal nested
        if t.nested and not t._parent.nested:
            nested = connection.begin_nested()
    yield session
    session.close()
    transaction.rollback()                          # the magic line
    connection.close()

# 3) Override the FastAPI dependency exactly once, in a context that auto-restores
@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# 4) Parametrize the backend — same tests run on SQLite AND on a real Postgres
#    container in CI, with no test code changes.
@pytest.fixture(scope="session", params=[
    pytest.param("sqlite",   id="sqlite"),
    pytest.param("postgres", id="pg", marks=pytest.mark.integration),
])
def db_url(request):
    return {"sqlite":   "sqlite:///:memory:",
            "postgres": "postgresql://test/test"}[request.param]

# Decision rule:
#   pure HTTP endpoint, no DB             -> TestClient(app), no fixture overrides
#   HTTP + DB                              -> in-memory SQLite + dependency_overrides
#   need cross-test isolation, fast        -> session engine + per-test transaction rollback
#   schema migrations matter                -> Postgres in Docker (testcontainers / pytest-docker)
#   files involved                          -> tmp_path; never a hardcoded path
#   external HTTP service                    -> respx / responses mock, never real network
#
# Anti-pattern: TestClient.app calling the production database
#   Tests pollute real data; CI is non-deterministic; running locally is unsafe.
#   Always override get_db (or whatever dependency hits external state).

def write_report(_): pass
```

## Decision Rule

```text
pure HTTP endpoint, no DB             -> TestClient(app), no fixture overrides
HTTP + DB                              -> in-memory SQLite + dependency_overrides
need cross-test isolation, fast        -> session engine + per-test transaction rollback
schema migrations matter                -> Postgres in Docker (testcontainers / pytest-docker)
files involved                          -> tmp_path; never a hardcoded path
external HTTP service                    -> respx / responses mock, never real network
```

## Anti-Pattern

> [!warning] Anti-pattern
> TestClient.app calling the production database
>   Tests pollute real data; CI is non-deterministic; running locally is unsafe.
>   Always override get_db (or whatever dependency hits external state).

## Tips

- TestClient does not start a real server — it calls the ASGI app directly, very fast
- Override dependencies with `app.dependency_overrides[fn] = override` — clear after test
- SQLite in-memory is fast enough for most integration tests and requires no setup
- tmp_path is automatically cleaned up — never use hardcoded paths in tests
- For fast cross-test DB isolation use a session-scoped engine + per-test transaction that rolls back at teardown — much faster than re-creating the schema per test
- When migrations matter, run Postgres in Docker via `testcontainers` or `pytest-docker`; mock outbound HTTP with `respx`/`responses` and never hit the real network in CI

## Common Mistake

> [!warning] Using the production database in tests. Tests must be isolated — use a test database, in-memory SQLite, or transaction rollback so tests do not affect each other or real data.

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

- [[Sections/testing/fixtures/fixture-basic|@pytest.fixture (Testing with pytest)]]
- [[Sections/testing/fixtures/fixture-scope|Fixture scope (Testing with pytest)]]
- [[Sections/testing/fixtures/factory-boy|Factory Boy (Testing with pytest)]]
- [[Sections/testing/fixtures/conftest|conftest.py (Testing with pytest)]]
- [[Sections/testing/fixtures/_Index|Testing with pytest → Fixtures]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

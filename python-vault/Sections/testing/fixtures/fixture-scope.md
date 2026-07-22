---
type: "entry"
domain: "python"
file: "testing"
section: "fixtures"
id: "fixture-scope"
title: "Fixture scope"
category: "Fixtures"
subtitle: "function | class | module | session — match cost to lifetime"
signature_short: "@pytest.fixture(scope=\"session\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Fixture scope"
  - "fixture-scope"
tags:
  - "python"
  - "python/testing"
  - "python/testing/fixtures"
  - "category/fixtures"
  - "tier/tiered"
---

# Fixture scope

> function | class | module | session — match cost to lifetime

## Overview

scope= controls how often a fixture is set up and torn down. The default is "function" — fresh instance per test. Use "session" for expensive resources like database connections or server startup that can be shared safely.

## Signature

```python
@pytest.fixture(scope="session")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Default function scope vs explicit module scope
# STRENGTHS - Smallest demonstration of WHEN setup runs
# WEAKNESSES- No autouse, no scope-ordering rules
#
import pytest

@pytest.fixture                              # default scope = "function"
def fresh_list():
    return []                                # NEW list per test

@pytest.fixture(scope="module")              # one instance shared across the file
def shared_counter():
    return {"calls": 0}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - The five scopes with realistic use cases for each
# STRENGTHS - The lookup table for "which scope do I want?"
# WEAKNESSES- No leakage discussion / transactional rollback yet
#
import pytest

# function (default) — fresh per test, the safe choice
@pytest.fixture
def cart():
    return Cart()

# class — shared across methods of one TestClass
@pytest.fixture(scope="class")
def class_resource():
    res = setup_resource()
    yield res
    teardown_resource(res)

# module — shared across all tests in one file
@pytest.fixture(scope="module")
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

# session — shared across the WHOLE test run
@pytest.fixture(scope="session")
def app():
    return create_app({"TESTING": True})

# autouse — applies to every test in scope without being requested
@pytest.fixture(autouse=True)
def reset_singletons():
    yield
    clear_singletons()                       # post-test cleanup

# Rule: a fixture can only depend on fixtures of EQUAL or BROADER scope.
# function < class < module < session.   Function can use session; not vice versa.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Session DB + per-test transaction rollback for fast, isolated DB tests
# STRENGTHS - Captures the canonical pattern for stateful integration tests
# WEAKNESSES- N/A
#
import pytest

# 1) Session-scoped engine — created ONCE; engine creation is expensive
@pytest.fixture(scope="session")
def engine():
    e = create_engine("postgresql://test/test")    # or sqlite:///:memory:
    Base.metadata.create_all(e)
    yield e
    e.dispose()

# 2) Function-scoped session — wraps every test in a transaction that ROLLS BACK
@pytest.fixture
def db(engine):
    connection  = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()                          # THIS is what gives you isolation
    connection.close()

def test_user_created(db):                          # fast: no schema rebuild per test
    db.add(User(email="a@x.com")); db.flush()
    assert db.query(User).count() == 1

def test_db_is_clean(db):                           # rollback guarantees isolation
    assert db.query(User).count() == 0

# 3) Mixing scopes safely — broader scope is the cache, narrower scope is the rollback
#    session-scoped engine + function-scoped transaction = fast AND isolated.

# 4) Beware autouse + session — runs ONCE for the suite; almost never what you want
#    for state reset. Pair autouse with function scope.

# Decision rule:
#   anything mutated during a test         -> function scope (default)
#   pure compute / read-only resource       -> module or session scope
#   shared across whole suite (DB engine)   -> session scope; pair with function-scope txn
#   reset global state automatically         -> autouse=True at function scope
#   per-test logger / temp dir               -> request.node.name + tmp_path (function)
#
# Anti-pattern: scope="session" on a list / dict the tests mutate
#   The third test in the file fails because the second mutated the shared
#   object. Either switch to function scope or wrap the resource with a
#   per-test reset (autouse fixture that snapshots and restores).

class Cart: pass
def setup_resource(): pass
def teardown_resource(_): pass
def create_connection(): return type("C", (), {"close": lambda s: None})()
def create_app(_): pass
def clear_singletons(): pass
def create_engine(_): return type("E", (), {"connect": lambda s: None, "dispose": lambda s: None})()
class Base:
    metadata = type("M", (), {"create_all": staticmethod(lambda _: None)})()
class Session:
    def __init__(self, bind=None): pass
    def add(self, _): pass
    def flush(self): pass
    def query(self, _): return type("Q", (), {"count": lambda s: 0})()
    def close(self): pass
class User:
    def __init__(self, email=None): self.email = email
```

## Decision Rule

```text
anything mutated during a test         -> function scope (default)
pure compute / read-only resource       -> module or session scope
shared across whole suite (DB engine)   -> session scope; pair with function-scope txn
reset global state automatically         -> autouse=True at function scope
per-test logger / temp dir               -> request.node.name + tmp_path (function)
```

## Anti-Pattern

> [!warning] Anti-pattern
> scope="session" on a list / dict the tests mutate
>   The third test in the file fails because the second mutated the shared
>   object. Either switch to function scope or wrap the resource with a
>   per-test reset (autouse fixture that snapshots and restores).

## Tips

- Use `scope="session"` for expensive setup (DB engine, test server) — runs once for the whole suite
- Use `scope="function"` (default) for anything that mutates state — guarantees isolation
- `autouse=True` applies the fixture to every test in scope — great for resetting global state
- Scoped fixtures can only request fixtures of equal or broader scope: function < class < module < session

## Common Mistake

> [!warning] `scope="session"` with a fixture that mutates shared state. Tests become order-dependent and flaky. Use `scope="function"` with transactions that roll back after each test.

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
- [[Sections/testing/fixtures/factory-boy|Factory Boy (Testing with pytest)]]
- [[Sections/testing/fixtures/conftest|conftest.py (Testing with pytest)]]
- [[Sections/testing/fixtures/integration-tests|Integration test patterns (Testing with pytest)]]
- [[Sections/testing/fixtures/_Index|Testing with pytest → Fixtures]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "testing"
section: "fixtures"
id: "fixture-basic"
title: "@pytest.fixture"
category: "Fixtures"
subtitle: "yield fixtures run setup before the test and teardown after"
signature_short: "@pytest.fixture\\ndef my_fixture(): yield value"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@pytest.fixture"
  - "fixture-basic"
tags:
  - "python"
  - "python/testing"
  - "python/testing/fixtures"
  - "category/fixtures"
  - "tier/tiered"
---

# @pytest.fixture

> yield fixtures run setup before the test and teardown after

## Overview

Fixtures provide reusable setup and teardown. A fixture with yield runs code before the test (setup), yields a value to the test, then runs code after (teardown). Teardown runs even when the test fails.

## Signature

```python
@pytest.fixture\ndef my_fixture(): yield value
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Single fixture returning a value, used by parameter-name injection
# STRENGTHS - The minimal fixture shape; no teardown yet
# WEAKNESSES- No setup/teardown, no scope, no yield
#
import pytest

@pytest.fixture
def sample_user():
    return {"email": "test@example.com", "name": "Test User"}

def test_user_email(sample_user):           # parameter name == fixture name
    assert sample_user["email"].endswith("@example.com")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - yield fixture for setup + teardown, fixtures depending on fixtures
# STRENGTHS - The 80%-case shape: scoped resource lifecycle in one function
# WEAKNESSES- Function scope only; no parametrized fixtures yet
#
import pytest

@pytest.fixture
def db():
    conn = connect_db(":memory:")             # SETUP
    conn.setup_schema()
    yield conn                                # value injected into the test
    conn.close()                              # TEARDOWN — runs even on failure

@pytest.fixture
def sample_user(db):                          # fixtures can depend on fixtures
    user_id = db.create_user("test@example.com", "Test")
    return db.get_user(user_id)

def test_user_round_trip(db, sample_user):
    assert db.count_users() == 1
    assert sample_user.email == "test@example.com"

def test_database_isolated(db):               # gets a FRESH db (function scope)
    assert db.count_users() == 0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - request inspection, multi-resource teardown via ExitStack, autouse for state reset
# STRENGTHS - The patterns that keep big test suites fast and isolated
# WEAKNESSES- N/A
#
import contextlib
import pytest

# 1) request gives access to the calling test's context — log per-test names,
#    parametrize-aware setup, finalizers when yield isn't enough.
@pytest.fixture
def tmp_workspace(request, tmp_path):
    workspace = tmp_path / request.node.name
    workspace.mkdir()
    return workspace

# 2) Multi-resource teardown — ExitStack guarantees cleanup even if one step fails
@pytest.fixture
def integration_env():
    with contextlib.ExitStack() as stack:
        db    = stack.enter_context(temporary_db())
        cache = stack.enter_context(temporary_redis())
        queue = stack.enter_context(temporary_queue())
        yield {"db": db, "cache": cache, "queue": queue}
    # all three close in REVERSE order, even if a test raised

# 3) autouse fixture for state reset — applies to every test in scope without
#    each test having to remember to ask for it.
@pytest.fixture(autouse=True)
def reset_singletons():
    yield
    SingletonRegistry.clear()                  # post-test cleanup

# 4) Factory fixture — let the test ASK for N variants instead of hard-coding one
@pytest.fixture
def make_user(db):
    created = []
    def _factory(**overrides):
        u = db.create_user(**({"email": "x@x.com", "name": "X"} | overrides))
        created.append(u.id)
        return u
    yield _factory
    for uid in created:                        # cleanup all created in this test
        db.delete_user(uid)

def test_two_users(make_user):
    a = make_user(email="a@x.com")
    b = make_user(email="b@x.com")
    assert a.id != b.id

# Decision rule:
#   resource needs cleanup                   -> yield + cleanup-after-yield
#   multiple resources, any can fail          -> contextlib.ExitStack
#   need fresh resource per test               -> default (function scope)
#   N variants per test                        -> factory fixture (yield a callable)
#   reset global state across all tests        -> autouse=True
#   per-test parametrization metadata          -> request.node.name / request.param
#
# Anti-pattern: cleanup in a try/finally inside the test
#   def test_x():
#       db = connect()
#       try: ...
#       finally: db.close()
#   That's a fixture screaming to be born. Move it; you'll reuse it tomorrow.

def connect_db(_): return type("C", (), {"setup_schema": lambda s: None,
                                         "create_user":  lambda s, *a, **k: 1,
                                         "get_user":     lambda s, _: type("U", (), {"email": "test@example.com"})(),
                                         "delete_user":  lambda s, _: None,
                                         "count_users":  lambda s: 0,
                                         "close":        lambda s: None})()
@contextlib.contextmanager
def temporary_db():    yield None
@contextlib.contextmanager
def temporary_redis(): yield None
@contextlib.contextmanager
def temporary_queue(): yield None
class SingletonRegistry:
    @staticmethod
    def clear(): pass
```

## Decision Rule

```text
resource needs cleanup                   -> yield + cleanup-after-yield
multiple resources, any can fail          -> contextlib.ExitStack
need fresh resource per test               -> default (function scope)
N variants per test                        -> factory fixture (yield a callable)
reset global state across all tests        -> autouse=True
per-test parametrization metadata          -> request.node.name / request.param
```

## Anti-Pattern

> [!warning] Anti-pattern
> cleanup in a try/finally inside the test
>   def test_x():
>       db = connect()
>       try: ...
>       finally: db.close()
>   That's a fixture screaming to be born. Move it; you'll reuse it tomorrow.

## Tips

- Always use `yield` fixtures over `request.addfinalizer` — setup and teardown in one function is cleaner
- Teardown after `yield` runs even when the test raises — guaranteed cleanup
- Fixtures are injected by parameter name — the name of the fixture function must match the parameter
- Put shared fixtures in `conftest.py` — pytest discovers them automatically without imports

## Common Mistake

> [!warning] Doing cleanup with `return` instead of `yield`. Code after `return` never runs. Use `yield` to split setup/teardown, or `request.addfinalizer(cleanup_fn)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pytest
@pytest.fixture
def sample_database():
"""Setup: create test DB"""
```

**Senior:**
```python
assert sample_database.count_users() == 1
```

## See Also

- [[Sections/testing/fixtures/fixture-scope|Fixture scope (Testing with pytest)]]
- [[Sections/testing/fixtures/factory-boy|Factory Boy (Testing with pytest)]]
- [[Sections/testing/fixtures/conftest|conftest.py (Testing with pytest)]]
- [[Sections/testing/fixtures/integration-tests|Integration test patterns (Testing with pytest)]]
- [[Sections/testing/fixtures/_Index|Testing with pytest → Fixtures]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

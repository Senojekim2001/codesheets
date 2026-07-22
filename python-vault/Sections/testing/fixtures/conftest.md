---
type: "entry"
domain: "python"
file: "testing"
section: "fixtures"
id: "conftest"
title: "conftest.py"
category: "Fixtures"
subtitle: "pytest discovers conftest.py automatically at each directory level"
signature_short: "# tests/conftest.py — no import needed in test files"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "conftest.py"
  - "conftest"
tags:
  - "python"
  - "python/testing"
  - "python/testing/fixtures"
  - "category/fixtures"
  - "tier/tiered"
---

# conftest.py

> pytest discovers conftest.py automatically at each directory level

## Overview

conftest.py is a special file pytest discovers automatically. Fixtures defined in conftest.py are available to all tests in the same directory and subdirectories — no import required. Use it to share fixtures, register plugins, and configure pytest.

## Signature

```python
# tests/conftest.py — no import needed in test files
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Move one fixture from a test file to conftest.py; tests use it without imports
# STRENGTHS - Smallest demonstration of conftest discovery
# WEAKNESSES- No layered conftests; no hooks
#
# tests/conftest.py
import pytest

@pytest.fixture
def sample_user():
    return {"email": "test@example.com", "name": "Test"}

# tests/test_signup.py
def test_signup_uses_user(sample_user):           # no import — pytest finds it
    assert "@" in sample_user["email"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Layered conftest.py files, shared at top, specific deeper
# STRENGTHS - The shape every real test suite eventually adopts
# WEAKNESSES- No hooks, no markers, no plugin registration yet
#
# Project layout
# myapp/
#   tests/
#     conftest.py            shared fixtures (app, client, db)
#     unit/
#       conftest.py          extra unit-only fixtures
#       test_models.py
#     integration/
#       conftest.py          extra integration-only fixtures
#       test_api.py

# tests/conftest.py
import pytest
from myapp import create_app, db as _db

@pytest.fixture(scope="session")
def app():
    a = create_app({"TESTING": True, "DATABASE_URL": "sqlite:///:memory:"})
    with a.app_context():
        _db.create_all()
        yield a
        _db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db(app):
    yield _db
    _db.session.rollback()

# tests/integration/conftest.py        scope-narrow fixture lives here
@pytest.fixture
def auth_token():
    return "test-token-abc"

# tests/integration/test_api.py — sees BOTH conftests automatically
def test_list_users(client, auth_token):
    r = client.get("/api/users", headers={"Authorization": f"Bearer {auth_token}"})
    assert r.status_code == 200
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Hooks, markers, dynamic test selection, plugin registration in conftest
# STRENGTHS - The conftest-as-pytest-config pattern that scales to large suites
# WEAKNESSES- N/A
#
# tests/conftest.py
import pytest

# 1) Register custom markers — silences PytestUnknownMarkWarning + enables -m
def pytest_configure(config):
    config.addinivalue_line("markers", "slow: takes > 1s; skipped by default")
    config.addinivalue_line("markers", "integration: hits a real DB / network")

# 2) Skip slow tests unless --runslow is passed
def pytest_addoption(parser):
    parser.addoption("--runslow", action="store_true",
                     help="run tests marked @pytest.mark.slow")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--runslow"):
        return
    skip_slow = pytest.mark.skip(reason="need --runslow option to run")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip_slow)

# 3) Per-test setup that the test doesn't have to opt into — autouse + session DB
@pytest.fixture(autouse=True)
def _reset_caches():
    yield
    cache_clear_all()

# 4) Session-scoped expensive resource referenced by name from anywhere
@pytest.fixture(scope="session")
def docker_postgres():
    container = start_postgres_container()
    yield container.url
    container.stop()

# 5) pytest plugin loaded only for these tests
pytest_plugins = ["pytest_asyncio", "pytest_httpx"]

# Use:
#   $ pytest                          # fast tests only
#   $ pytest --runslow                # include @slow tests
#   $ pytest -m integration           # only integration tests
#   $ pytest -m "not integration"     # exclude them

# Decision rule:
#   fixture used by 2+ test files          -> move to conftest.py at the common root
#   fixture used by 1 file                  -> keep it in that file
#   directory has unique fixtures            -> nested conftest.py inside that dir
#   custom markers (slow, integration)        -> register in pytest_configure
#   command-line flag for opt-in tests        -> pytest_addoption + collection_modifyitems
#   plugin needed by these tests only         -> pytest_plugins = [...] in conftest
#
# Anti-pattern: importing fixtures from a test file
#   from tests.test_helpers import db  # works, but pytest can't reason about it
#   Fixtures belong in conftest.py — the discovery is the whole point.

def cache_clear_all(): pass
def start_postgres_container(): return type("C", (), {"url": "x", "stop": lambda s: None})()
```

## Decision Rule

```text
fixture used by 2+ test files          -> move to conftest.py at the common root
fixture used by 1 file                  -> keep it in that file
directory has unique fixtures            -> nested conftest.py inside that dir
custom markers (slow, integration)        -> register in pytest_configure
command-line flag for opt-in tests        -> pytest_addoption + collection_modifyitems
plugin needed by these tests only         -> pytest_plugins = [...] in conftest
```

## Anti-Pattern

> [!warning] Anti-pattern
> importing fixtures from a test file
>   from tests.test_helpers import db  # works, but pytest can't reason about it
>   Fixtures belong in conftest.py — the discovery is the whole point.

## Tips

- Fixtures in `tests/conftest.py` are available to ALL test files in `tests/` and subdirectories
- Layer conftest.py files — shared fixtures at the top level, specific ones in subdirectories
- No import statement needed — pytest injects conftest fixtures automatically by name
- Use conftest.py for pytest plugins, hooks (`pytest_configure`), and custom marks too

## Common Mistake

> [!warning] Defining fixtures inside individual test files and duplicating them. Move shared fixtures to conftest.py — it is discoverable without imports and scoped to the right directory.

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
- [[Sections/testing/fixtures/integration-tests|Integration test patterns (Testing with pytest)]]
- [[Sections/testing/fixtures/_Index|Testing with pytest → Fixtures]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

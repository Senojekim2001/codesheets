---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "patch"
title: "unittest.mock.patch()"
category: "Mocking"
subtitle: "Patch where the name is USED — not where it is defined"
signature_short: "@patch(\"myapp.module.ClassName\") | with patch(...) as mock:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "unittest.mock.patch()"
  - "patch"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# unittest.mock.patch()

> Patch where the name is USED — not where it is defined

## Overview

patch() replaces an object in a module with a MagicMock for the duration of the test, then restores the original. The critical rule: patch the object where it is looked up (the importing module), not where it is defined.

## Signature

```python
@patch("myapp.module.ClassName") | with patch(...) as mock:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - patch as a context manager: replace, then auto-restore
# STRENGTHS - Smallest valid patch, scope-limited
# WEAKNESSES- Doesn't show the where-it's-used rule yet
#
from unittest.mock import patch
import pytest

def test_api_failure_raises():
    with patch("requests.get") as mock_get:
        mock_get.side_effect = ConnectionError("API down")
        with pytest.raises(ConnectionError):
            fetch_user_data(user_id=1)
    # Outside the with-block, requests.get is the real function again
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Patch where the name is USED, not where it lives. Decorator stacking order
# STRENGTHS - The patching rule that determines whether your test works at all
# WEAKNESSES- No spec=, no patch.object yet
#
from unittest.mock import patch

# myapp/service.py
#   from requests import get      # <- 'get' now lives in myapp.service
#
#   def fetch_user(uid):
#       return get(f"/users/{uid}").json()

# WRONG — patches the original module; service.get already imported the real one
@patch("requests.get")
def test_fetch_user_wrong(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}
    # Calls real requests.get because myapp.service.get is the bound name

# RIGHT — patch the name where it's looked up
@patch("myapp.service.get")
def test_fetch_user_right(mock_get):
    mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}
    from myapp.service import fetch_user
    assert fetch_user(1)["name"] == "Alice"
    mock_get.assert_called_once_with("/users/1")

# Stacked decorators: APPLIED bottom-up, INJECTED top-down (reverse-application order)
@patch("myapp.service.get")          # outer (applied last) -> first parameter
@patch("myapp.service.cache")        # inner (applied first) -> second parameter
def test_two_patches(mock_cache, mock_get):
    ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - patch.object, patch.dict, autospec, vs prefer dependency injection
# STRENGTHS - The patching toolkit and when NOT to reach for it
# WEAKNESSES- N/A
#
import os
from unittest.mock import patch, ANY

# 1) patch.object — patch a single method on a class or instance (precise scope)
class S3Client:
    def upload(self, key, body): ...

def test_upload_called():
    with patch.object(S3Client, "upload", return_value="ok") as up:
        S3Client().upload("k", b"x")
        up.assert_called_once_with("k", b"x")

# 2) patch.dict — temporarily set env vars / mutate a dict and restore after
def test_uses_test_database():
    with patch.dict(os.environ, {"DATABASE_URL": "sqlite:///:memory:"}, clear=False):
        from myapp.config import database_url
        assert database_url() == "sqlite:///:memory:"

# 3) autospec=True — the mock matches the REAL signature; typos / wrong arity fail
@patch("myapp.service.send_email", autospec=True)
def test_typed_call(mock_send):
    from myapp.service import notify
    notify("alice@x.com", "Welcome")
    mock_send.assert_called_once_with("alice@x.com", "Welcome")
    # mock_send("a", "b", "c") would raise TypeError — wrong arity

# 4) Prefer DI when you can — patch is a hammer when the dependency is hidden;
#    accept it as an argument and the mock is just a value, no patching needed.
def fetch_user(uid, *, http=None):                  # http is the seam
    http = http or default_http_client()
    return http.get(f"/users/{uid}").json()

def test_fetch_user_di():
    fake = type("F", (), {"get": lambda self, _: type("R", (), {"json": lambda s: {"id": 1}})()})()
    assert fetch_user(1, http=fake)["id"] == 1      # no patch at all

# Decision rule:
#   constructor injection available           -> pass a fake; don't patch
#   third-party lib imported into your module  -> @patch("yourmodule.<imported_name>", autospec=True)
#   method on a class                           -> patch.object(Cls, "method")
#   environment variable / dict-like          -> patch.dict(os.environ, {...})
#   need wide-spread mock for many tests       -> @pytest.fixture(autouse=False) wrapping a patch
#   typo-proof signatures                       -> autospec=True (or spec_set=)
#
# Anti-pattern: patching the place a function is DEFINED instead of USED
#   patch("requests.get") doesn't replace what your code already imported as
#   'get'. Always patch the name in the calling module: "myapp.service.get".

def fetch_user_data(uid): import requests; return requests.get(f"/u/{uid}").json()
def default_http_client(): import requests; return requests
```

## Decision Rule

```text
constructor injection available           -> pass a fake; don't patch
third-party lib imported into your module  -> @patch("yourmodule.<imported_name>", autospec=True)
method on a class                           -> patch.object(Cls, "method")
environment variable / dict-like          -> patch.dict(os.environ, {...})
need wide-spread mock for many tests       -> @pytest.fixture(autouse=False) wrapping a patch
typo-proof signatures                       -> autospec=True (or spec_set=)
```

## Anti-Pattern

> [!warning] Anti-pattern
> patching the place a function is DEFINED instead of USED
>   patch("requests.get") doesn't replace what your code already imported as
>   'get'. Always patch the name in the calling module: "myapp.service.get".

## Tips

- Patch where the name is USED: `patch("myapp.views.requests.get")` not `patch("requests.get")`
- Stacked `@patch` decorators are applied bottom-up but injected top-down into the function args
- Use `patch.object(instance, "method")` to patch a method on a specific object
- Use `patch.dict(os.environ, {"KEY": "value"})` to temporarily set environment variables
- Pass `autospec=True` (or `spec_set=`) so the mock's signature matches the real callable — typos and wrong-arg calls then fail at test time instead of silently passing

## Common Mistake

> [!warning] Patching the wrong location. `from requests import get` in your module means `get` is a local name. You must patch `"myapp.module.get"`, not `"requests.get"`.

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

- [[Sections/testing/mocking/responses|responses (Testing with pytest)]]
- [[Sections/testing/mocking/httpretty|httpretty (Testing with pytest)]]
- [[Sections/testing/mocking/magicmock|MagicMock (Testing with pytest)]]
- [[Sections/testing/mocking/mocker|mocker fixture (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

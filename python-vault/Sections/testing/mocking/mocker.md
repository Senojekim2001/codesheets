---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "mocker"
title: "mocker fixture"
category: "Mocking"
subtitle: "Automatically undone after each test — no context managers needed"
signature_short: "def test_fn(mocker): mock = mocker.patch(\"module.fn\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mocker fixture"
  - "mocker"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# mocker fixture

> Automatically undone after each test — no context managers needed

## Overview

pytest-mock provides the mocker fixture — a thin wrapper around unittest.mock that integrates with pytest's fixture lifecycle. Patches are automatically undone after each test. No decorator or context manager needed.

## Signature

```python
def test_fn(mocker): mock = mocker.patch("module.fn")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mocker.patch in a function-scoped fixture; cleanup is automatic
# STRENGTHS - No decorator stacking, no with-block; cleaner than @patch in pytest
# WEAKNESSES- Doesn't show spy / ANY / object patching
#
# pip install pytest-mock

def test_fetch_user(mocker):
    mock_get = mocker.patch("myapp.service.requests.get")
    mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}

    from myapp.service import fetch_user
    assert fetch_user(1)["name"] == "Alice"
    mock_get.assert_called_once()
# After this test, requests.get is automatically restored — no @patch needed.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - patch.object, spy, ANY, MagicMock — pytest-style
# STRENGTHS - The four mocker primitives that replace most decorator stacks
# WEAKNESSES- No async, no fixture-as-mock pattern yet
#
def test_patch_object(mocker):
    mock = mocker.patch.object(Calculator, "add", return_value=100)
    assert Calculator().add(2, 3) == 100
    mock.assert_called_once()

def test_spy(mocker):
    # spy WRAPS the real function — assertions on calls AND real return value
    spy = mocker.spy(Calculator, "add")
    assert Calculator().add(2, 3) == 5            # real result
    spy.assert_called_once()                       # but we ALSO see the call

def test_any(mocker):
    send = mocker.patch("myapp.send_email")
    trigger_signup("alice@example.com")
    send.assert_called_once_with(mocker.ANY, subject="Welcome!")

def test_make_mock(mocker):
    db = mocker.MagicMock(spec_set=Database)
    db.get_user.return_value = {"id": 1}
    assert fetch_with_db(db)["id"] == 1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - mock fixtures for reuse, mocker.stopall, spy vs patch trade-off
# STRENGTHS - The patterns that turn one mock into a project-wide testing affordance
# WEAKNESSES- N/A
#
import pytest

# 1) Reusable mock fixtures — encapsulate setup the whole suite needs
@pytest.fixture
def stripe(mocker):
    """A typo-proof Stripe client mock with sensible defaults."""
    m = mocker.patch("myapp.payments.stripe_client", autospec=True)
    m.charge.return_value = {"id": "ch_123", "status": "succeeded"}
    return m

def test_purchase_charges_stripe(stripe):
    purchase(amount=100, token="tok_x")
    stripe.charge.assert_called_once_with(100, "tok_x")

# 2) Override per-test — fixture provides defaults, test overrides what matters
def test_handles_card_decline(stripe):
    stripe.charge.side_effect = StripeError("card_declined")
    with pytest.raises(PaymentFailed):
        purchase(amount=100, token="tok_bad")

# 3) Spy vs patch — pick by goal
#    - patch: replace behavior, assert calls
#    - spy:   keep real behavior, ALSO assert calls (use to verify side-effects
#             without breaking the function under test)
def test_cache_hit(mocker):
    spy = mocker.spy(myapp.cache, "get")
    do_lookup("k")
    do_lookup("k")
    assert spy.call_count == 2
    # Real cache still ran; we just confirmed it was hit.

# 4) mocker.resetall / mocker.stopall — needed only when wiring multiple
#    parallel mock contexts inside one test (rare). Normally pytest-mock cleans up.

# Decision rule:
#   pytest project, simple replace          -> mocker.patch (no @patch decorator)
#   precise method on a class                -> mocker.patch.object
#   keep real behavior, observe calls        -> mocker.spy
#   build a typo-safe fake collaborator       -> mocker.MagicMock(spec_set=Real)
#   project-wide mocked client (Stripe, etc.) -> wrap mocker.patch in a fixture
#   need to mock during fixture setup          -> mocker is fixture-friendly; @patch isn't
#
# Anti-pattern: stacking @patch decorators inside pytest tests
#   def test(...):
#     with patch("a"), patch("b"), patch("c"): ...
#   Reaches three indentation levels deep. mocker.patch flattens it: each call
#   is one statement, all auto-cleaned.

class Calculator:
    def add(self, a, b): return a + b
class MyService:
    def __init__(self, c): self.c = c
    def run(self): return self.c.add(40, 60)
class Database: pass
def fetch_with_db(db): return db.get_user(1)
def trigger_signup(_): pass
class StripeError(Exception): pass
class PaymentFailed(Exception): pass
def purchase(amount, token): pass
class _M:
    def get(self, _): return None
class myapp:
    cache = _M()
def do_lookup(_): myapp.cache.get(_)
```

## Decision Rule

```text
pytest project, simple replace          -> mocker.patch (no @patch decorator)
precise method on a class                -> mocker.patch.object
keep real behavior, observe calls        -> mocker.spy
build a typo-safe fake collaborator       -> mocker.MagicMock(spec_set=Real)
project-wide mocked client (Stripe, etc.) -> wrap mocker.patch in a fixture
need to mock during fixture setup          -> mocker is fixture-friendly; @patch isn't
```

## Anti-Pattern

> [!warning] Anti-pattern
> stacking @patch decorators inside pytest tests
>   def test(...):
>     with patch("a"), patch("b"), patch("c"): ...
>   Reaches three indentation levels deep. mocker.patch flattens it: each call
>   is one statement, all auto-cleaned.

## Tips

- `mocker.patch()` is automatically undone after the test — no need for context managers or decorators
- `mocker.spy()` wraps the real function — lets you assert on calls while still running real logic
- `mocker.ANY` matches any value in assert_called_with — useful when you do not care about one argument
- Install with `pip install pytest-mock` — it is the standard pytest mocking plugin

## Common Mistake

> [!warning] Using raw `unittest.mock.patch` as a decorator inside pytest when `mocker` is available. Decorators are not automatically undone — `mocker` handles cleanup via the fixture lifecycle.

## Shorthand (Junior → Senior)

**Junior:**
```python
import requests
def test_fetch_user(mocker):
mock_get = mocker.patch("myapp.service.requests.get")
mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}
```

**Senior:**
```python
)
```

## See Also

- [[Sections/testing/mocking/patch|unittest.mock.patch() (Testing with pytest)]]
- [[Sections/testing/mocking/responses|responses (Testing with pytest)]]
- [[Sections/testing/mocking/httpretty|httpretty (Testing with pytest)]]
- [[Sections/testing/mocking/magicmock|MagicMock (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

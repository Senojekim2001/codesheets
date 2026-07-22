---
type: "entry"
domain: "python"
file: "testing"
section: "pytest-basics"
id: "test-doubles"
title: "Test doubles"
category: "pytest"
subtitle: "Stub / Fake / Spy / Mock — know which to use when"
signature_short: "stub → fixed return | mock → verify calls | spy → wrap real obj"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Test doubles"
  - "test-doubles"
tags:
  - "python"
  - "python/testing"
  - "python/testing/pytest-basics"
  - "category/pytest"
  - "tier/tiered"
---

# Test doubles

> Stub / Fake / Spy / Mock — know which to use when

## Overview

Test doubles are objects that stand in for real dependencies. The terms are often used loosely but have distinct meanings: stubs return fixed values, fakes have working implementations, spies record calls without replacing behavior, mocks verify specific interactions were made.

## Signature

```python
stub → fixed return | mock → verify calls | spy → wrap real obj
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Stub: a hand-rolled class that returns a fixed value
# STRENGTHS - Smallest test double; no library needed
# WEAKNESSES- No call recording, no assertions about how it was used
#
class StubEmailService:
    """Always 'succeeds'; doesn't actually send."""
    def send(self, to, subject, body):
        return True

def test_signup_uses_email_service():
    email = StubEmailService()
    user  = signup("alice@example.com", email_service=email)
    assert user.is_active
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - All four flavors side-by-side, with a real assertion for each
# STRENGTHS - The vocabulary you can actually map onto code
# WEAKNESSES- No discussion of when to mock vs fake at architectural boundaries
#
from unittest.mock import MagicMock

# 1) Stub — fixed return, ignores arguments
class StubEmail:
    def send(self, *args, **kw): return True

# 2) Fake — working implementation, not production-grade
class FakeDB:
    def __init__(self):  self._store = {}
    def get(self, k):    return self._store.get(k)
    def set(self, k, v): self._store[k] = v

def test_fake_db_round_trip():
    db = FakeDB()
    db.set("a", 1)
    assert db.get("a") == 1                         # FakeDB has REAL behavior

# 3) Spy — wraps real object, records calls without changing behavior
class SpyEmail:
    def __init__(self, real):    self._real, self.calls = real, []
    def send(self, to, subject, body):
        self.calls.append((to, subject))
        return self._real.send(to, subject, body)

# 4) Mock — replaces the dependency; you assert HOW it was called
def test_signup_sends_welcome_mail():
    email = MagicMock()
    email.send.return_value = True
    signup("alice@example.com", email_service=email)
    email.send.assert_called_once()                 # just one call
    args, _ = email.send.call_args
    assert args[0] == "alice@example.com"           # to:
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pick the double by what you're verifying; mock only at the boundary
# STRENGTHS - Avoids the "tests broke when I refactored" trap
# WEAKNESSES- N/A
#
from unittest.mock import MagicMock

# 1) Mock at the BOUNDARY — external HTTP, DB, queue. Never internal helpers.
#    Internal helpers don't need to be mocked: refactoring them shouldn't break tests.
class StripeClient:                                  # the real client (boundary)
    def charge(self, amount, token): ...

def test_purchase_charges_stripe_once():
    stripe = MagicMock(spec=StripeClient)            # spec= rejects unknown attrs
    stripe.charge.return_value = {"id": "ch_123"}
    purchase(amount=100, payment_token="tok_x", stripe=stripe)
    stripe.charge.assert_called_once_with(100, "tok_x")

# 2) Prefer FAKES for stateful collaborators (DB, cache, queue) — real behavior,
#    fast, and tests survive internal refactors.
class FakeQueue:
    def __init__(self):       self.items = []
    def push(self, item):     self.items.append(item)
    def pop(self):            return self.items.pop(0) if self.items else None

def test_worker_processes_each_item():
    q = FakeQueue(); q.push("a"); q.push("b")
    process_all(q)
    assert q.items == []                             # behavior, not call count

# 3) SPY when you want to keep real behavior AND verify a side effect
class SpyLogger:
    def __init__(self, real): self._real, self.entries = real, []
    def info(self, msg, *a, **kw):
        self.entries.append(msg)
        return self._real.info(msg, *a, **kw)

# 4) Specify the contract with spec= or spec_set= so the mock CAN'T grow new
#    attributes silently — production code calling a typo'd method gets caught.
mock = MagicMock(spec_set=StripeClient)
# mock.refund(...)   -> AttributeError immediately; .charge(...) is fine

# Decision rule:
#   external service (HTTP, DB, queue)         -> Mock with spec=Real, assert calls
#   in-process collaborator with state          -> Fake (in-memory)
#   need to verify side-effect AND keep behavior -> Spy (wrap, record, delegate)
#   test the return value, not the interaction   -> Stub (or just MagicMock)
#   private helper / pure function               -> NO double; call it directly
#
# Anti-pattern: mocking the function under test's own dependencies recursively
#   "I mocked save_user, hash_password, send_email — and the test still passes."
#   You're testing the mocks. Mock the OUTERMOST boundary; let the rest of the
#   code run for real, on a fake DB.
```

## Decision Rule

```text
external service (HTTP, DB, queue)         -> Mock with spec=Real, assert calls
in-process collaborator with state          -> Fake (in-memory)
need to verify side-effect AND keep behavior -> Spy (wrap, record, delegate)
test the return value, not the interaction   -> Stub (or just MagicMock)
private helper / pure function               -> NO double; call it directly
```

## Anti-Pattern

> [!warning] Anti-pattern
> mocking the function under test's own dependencies recursively
>   "I mocked save_user, hash_password, send_email — and the test still passes."
>   You're testing the mocks. Mock the OUTERMOST boundary; let the rest of the
>   code run for real, on a fake DB.

## Tips

- Prefer stubs and fakes over mocks — tests with fewer mock assertions are less brittle
- Mocks test implementation details — if you refactor without changing behavior, mocked tests break
- Fakes (in-memory DB, fake Redis) make integration tests fast without a real infrastructure dependency
- The simplest test double is a lambda: `send_email = lambda to, subj, body: None`

## Common Mistake

> [!warning] Over-mocking — replacing every dependency with a mock. Tests become coupled to implementation details and break on refactoring. Mock at the boundary (external HTTP, DB) not internal function calls.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/testing/pytest-basics/assertions|pytest assertions (Testing with pytest)]]
- [[Sections/testing/pytest-basics/raises|pytest.raises() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/approx|pytest.approx() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize (Testing with pytest)]]
- [[Sections/testing/pytest-basics/_Index|Testing with pytest → pytest Basics]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

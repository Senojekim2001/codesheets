---
type: "entry"
domain: "python"
file: "testing"
section: "pytest-basics"
id: "assertions"
title: "pytest assertions"
category: "pytest"
subtitle: "Use assert directly — pytest shows exactly what failed and why"
signature_short: "def test_fn(): assert result == expected"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest assertions"
  - "assertions"
tags:
  - "python"
  - "python/testing"
  - "python/testing/pytest-basics"
  - "category/pytest"
  - "tier/tiered"
---

# pytest assertions

> Use assert directly — pytest shows exactly what failed and why

## Overview

pytest uses plain Python assert statements — no special assertion methods needed. pytest rewrites assert at collection time to produce detailed failure messages showing the actual and expected values. Tests are discovered automatically in files matching test_*.py.

## Signature

```python
def test_fn(): assert result == expected
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One test function, plain assert, descriptive name
# STRENGTHS - The minimum a test needs: name + arrange + act + assert
# WEAKNESSES- One assertion at a time; no edge cases
#
# test_math.py
def add(a, b):
    return a + b

def test_add_positive_numbers():
    assert add(2, 3) == 5

# $ pytest                    # discovers test_*.py automatically
# $ pytest -v                 # show each test name
# $ pytest -k "add"           # only tests with "add" in the name
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Arrange-Act-Assert layout, multiple assertions, helpful failure messages
# STRENGTHS - The shape every real test file converges on
# WEAKNESSES- No fixtures, no parametrize, no edge-case coverage
#
def test_user_registration_creates_active_user():
    # Arrange — set up inputs
    email = "alice@example.com"
    name  = "Alice Smith"

    # Act — call the thing under test
    user = create_user(email, name)

    # Assert — one logical thing per test, but multiple assertions are fine
    assert user.email == email
    assert user.name  == name
    assert user.created_at is not None
    assert user.is_active, "newly created users should be active by default"

def test_email_validator():
    # Plain assert reads better than unittest's assertEqual / assertTrue
    assert validate_email("user@example.com") is True
    assert validate_email("invalid.email")    is False
    assert validate_email("")                 is False

# Useful flags:
# pytest -x                  stop after first failure
# pytest --lf                only re-run last-failed tests
# pytest -s                  don't capture stdout (see print/debug output)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Behavior-focused naming, AAA strict, custom messages, soft asserts where useful
# STRENGTHS - Tests that act as living documentation and survive refactors
# WEAKNESSES- N/A
#
# 1) NAME tests by behavior, not function — "what" + "when" + "expected outcome"
def test_create_user_with_negative_age_raises_value_error():    # crystal-clear failure log
    with pytest.raises(ValueError, match="age must be"):
        create_user("bob@example.com", "Bob", age=-5)

# 2) ONE behavior per test — multiple asserts on the SAME state are fine; resist
#    asserting two unrelated behaviors in one function.
def test_payment_completed_marks_metadata():
    payment = process_payment(amount=99.99, currency="USD")
    assert payment.status         == "completed"
    assert payment.amount         == 99.99
    assert "transaction_id" in payment.metadata
    # Don't tack on: assert refund_payment(payment).status == "refunded"

# 3) Helpful failure messages — the assertion shows values, but custom strings
#    explain INTENT for the engineer reading the failure.
def test_orders_are_strictly_pending():
    orders = get_pending_orders()
    bad = [o for o in orders if o.status != "pending"]
    assert not bad, f"non-pending orders leaked into get_pending_orders(): {bad[:3]}"

# 4) Equality on collections — let pytest's diff do the work
def test_normalize_email_strips_and_lowercases():
    raw = ["  A@X.COM ", "b@y.com\n"]
    assert normalize_emails(raw) == ["a@x.com", "b@y.com"]    # diff is shown on failure

# Decision rule:
#   one logical behavior, multiple aspects   -> multiple assert lines, ONE test function
#   N similar inputs, same behavior          -> @pytest.mark.parametrize, not N copies
#   error path                                 -> pytest.raises with match=
#   floating-point math                        -> pytest.approx, never ==
#   unrelated behavior                         -> separate test function
#
# Anti-pattern: "test_create_user" with 30 asserts spanning every feature
#   When one fails, the rest never run, so each commit gives you ONE bug at a
#   time. Split by behavior — failures in unrelated areas should be visible
#   simultaneously.
```

## Decision Rule

```text
one logical behavior, multiple aspects   -> multiple assert lines, ONE test function
N similar inputs, same behavior          -> @pytest.mark.parametrize, not N copies
error path                                 -> pytest.raises with match=
floating-point math                        -> pytest.approx, never ==
unrelated behavior                         -> separate test function
```

## Anti-Pattern

> [!warning] Anti-pattern
> "test_create_user" with 30 asserts spanning every feature
>   When one fails, the rest never run, so each commit gives you ONE bug at a
>   time. Split by behavior — failures in unrelated areas should be visible
>   simultaneously.

## Tips

- pytest rewrites `assert` — plain `assert a == b` gives better output than unittest's `assertEqual(a, b)`
- Add a message: `assert cond, f"got {val}"` — shown only on failure
- pytest discovers tests in files named `test_*.py` or `*_test.py` automatically
- Run `pytest -v` for verbose output, `pytest -s` to see print() output

## Common Mistake

> [!warning] Using `assert` outside of pytest (e.g., in production code). pytest rewrites assert — outside pytest, a failed assert raises AssertionError with no helpful message.

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

- [[Sections/testing/pytest-basics/test-doubles|Test doubles (Testing with pytest)]]
- [[Sections/testing/pytest-basics/raises|pytest.raises() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/approx|pytest.approx() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize (Testing with pytest)]]
- [[Sections/testing/pytest-basics/_Index|Testing with pytest → pytest Basics]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "testing"
section: "pytest-basics"
id: "raises"
title: "pytest.raises()"
category: "pytest"
subtitle: "Test that the right exception is raised with the right message"
signature_short: "with pytest.raises(ExcType, match=\"regex\"): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest.raises()"
  - "raises"
tags:
  - "python"
  - "python/testing"
  - "python/testing/pytest-basics"
  - "category/pytest"
  - "tier/tiered"
---

# pytest.raises()

> Test that the right exception is raised with the right message

## Overview

pytest.raises() is a context manager that passes only if the wrapped code raises the specified exception. match= checks the exception message with a regex. Access the exception info via the as clause.

## Signature

```python
with pytest.raises(ExcType, match="regex"): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One pytest.raises block to confirm the right exception fires
# STRENGTHS - Smallest valid error-path test
# WEAKNESSES- No message check; no exception introspection
#
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a / b

def test_divide_by_zero_raises():
    with pytest.raises(ValueError):
        divide(1, 0)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - match= for message regex, exc_info for inspection, custom exceptions
# STRENGTHS - The 80%-case toolkit for verifying error paths
# WEAKNESSES- No multi-error / ExceptionGroup handling
#
import pytest

class InsufficientFunds(Exception):
    def __init__(self, amount, balance):
        self.amount, self.balance = amount, balance
        super().__init__(f"need {amount}, have {balance}")

def withdraw(amount, balance):
    if amount > balance:
        raise InsufficientFunds(amount, balance)
    return balance - amount

# match= is re.search — anchor with ^...$ if you want a full match
def test_withdraw_message():
    with pytest.raises(InsufficientFunds, match=r"need 100, have 50"):
        withdraw(100, balance=50)

# Capture the instance to assert on attributes
def test_withdraw_carries_state():
    with pytest.raises(InsufficientFunds) as exc_info:
        withdraw(100, balance=50)
    assert exc_info.value.amount  == 100
    assert exc_info.value.balance == 50
    assert exc_info.type is InsufficientFunds       # exact class, not subclass

# pytest.raises FAILS the test if NO exception is raised — no need to add asserts
def test_withdraw_success():
    assert withdraw(40, balance=50) == 10           # no pytest.raises here
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Narrow exception types, parametrize error cases, validate chained errors
# STRENGTHS - The hardening that keeps error tests from masking real bugs
# WEAKNESSES- N/A
#
import pytest

# 1) NEVER catch the parent class — you'll silence unrelated bugs
def test_too_loose():
    with pytest.raises(Exception):                  # ANTI-PATTERN: hides KeyError, TypeError, ...
        ...

def test_correct():
    with pytest.raises(ValueError, match=r"^age must be positive$"):
        create_user("a@x.com", "A", age=-5)

# 2) Parametrize the error cases — clearer than 5 near-identical test functions
@pytest.mark.parametrize("amount, balance, msg", [
    (100, 50,  r"need 100, have 50"),
    (1,   0,   r"need 1, have 0"),
    (0,   0,   r"^amount must be positive$"),
])
def test_withdraw_errors(amount, balance, msg):
    with pytest.raises((InsufficientFunds, ValueError), match=msg):
        withdraw(amount, balance=balance)

# 3) Chained exceptions — verify the cause, not just the wrapper
def parse_int(s):
    try:
        return int(s)
    except ValueError as e:
        raise RuntimeError("parse failed") from e

def test_chained():
    with pytest.raises(RuntimeError, match="parse failed") as exc_info:
        parse_int("abc")
    assert isinstance(exc_info.value.__cause__, ValueError)

# 4) Multi-error (Python 3.11+ ExceptionGroup) — pytest has a matcher for it
def test_group():
    with pytest.RaisesGroup(ValueError, KeyError):
        raise ExceptionGroup("ouch", [ValueError("a"), KeyError("b")])

# Decision rule:
#   error type matters, message matters    -> raises(Type, match=r"regex")
#   need to inspect the exception object   -> as exc_info; assert on .value / .__cause__
#   N similar error scenarios               -> @parametrize, one test function
#   library wraps a real cause              -> assert exc_info.value.__cause__ is the real one
#   ExceptionGroup (3.11+)                  -> pytest.RaisesGroup
#
# Anti-pattern: assertions INSIDE the with-block
#   with pytest.raises(ValueError):
#       result = thing()
#       assert result == expected      # AssertionError gets eaten by pytest.raises!
#   Always: assert AFTER the block, on exc_info.value if needed.
```

## Decision Rule

```text
error type matters, message matters    -> raises(Type, match=r"regex")
need to inspect the exception object   -> as exc_info; assert on .value / .__cause__
N similar error scenarios               -> @parametrize, one test function
library wraps a real cause              -> assert exc_info.value.__cause__ is the real one
ExceptionGroup (3.11+)                  -> pytest.RaisesGroup
```

## Anti-Pattern

> [!warning] Anti-pattern
> assertions INSIDE the with-block
>   with pytest.raises(ValueError):
>       result = thing()
>       assert result == expected      # AssertionError gets eaten by pytest.raises!
>   Always: assert AFTER the block, on exc_info.value if needed.

## Tips

- `match=` uses `re.search()` — it is a partial match, not full-string. Use `^...$` to anchor
- Access `.value` for the exception instance, `.type` for the class, `.traceback` for the stack
- Test the exact exception type — catching a base class like `Exception` misses bugs
- If the code should raise, the test fails if it does NOT raise — no assertion needed inside the block

## Common Mistake

> [!warning] Putting assertions AFTER the line that raises inside the `pytest.raises` block — execution never reaches them once the expected exception fires, so they silently never run. Put follow-up assertions OUTSIDE the block, against `excinfo.value`.

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

- [[Sections/testing/pytest-basics/assertions|pytest assertions (Testing with pytest)]]
- [[Sections/testing/pytest-basics/test-doubles|Test doubles (Testing with pytest)]]
- [[Sections/testing/pytest-basics/approx|pytest.approx() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize (Testing with pytest)]]
- [[Sections/testing/pytest-basics/_Index|Testing with pytest → pytest Basics]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

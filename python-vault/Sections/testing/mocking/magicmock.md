---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "magicmock"
title: "MagicMock"
category: "Mocking"
subtitle: "Set return values, track calls, assert how a mock was used"
signature_short: "mock.return_value = x | mock.side_effect = [a,b,exc] | mock.assert_called_once_with()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MagicMock"
  - "magicmock"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# MagicMock

> Set return values, track calls, assert how a mock was used

## Overview

MagicMock auto-creates any attribute or method you access on it. Set return_value for what a call should return. Set side_effect to a list (yields each in turn) or an exception class (raises it). spec= constrains the mock to a real class's interface.

## Signature

```python
mock.return_value = x | mock.side_effect = [a,b,exc] | mock.assert_called_once_with()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Make a MagicMock, set return_value, assert it was called
# STRENGTHS - Three lines: configure, use, verify
# WEAKNESSES- No spec, no side_effect, no call inspection
#
from unittest.mock import MagicMock

email = MagicMock()
email.send.return_value = True

send_welcome(email, "alice@example.com")

email.send.assert_called_once_with("alice@example.com")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - return_value vs side_effect, call inspection, AsyncMock
# STRENGTHS - The four MagicMock features that cover 95% of real tests
# WEAKNESSES- No spec= yet
#
from unittest.mock import MagicMock, AsyncMock

# 1) return_value — what calls return
mock = MagicMock()
mock.do_thing.return_value = 42

# 2) side_effect = list — yields one value per call (great for retry tests)
mock.fetch.side_effect = [
    ConnectionError("timeout"),     # 1st call: raises
    ConnectionError("timeout"),     # 2nd call: raises
    {"status": "ok"},                # 3rd call: returns
]

# 3) side_effect = exception — every call raises
mock.parse.side_effect = ValueError("bad input")

# 4) Call inspection
mock(1, 2); mock(3, 4)
print(mock.call_count)               # 2
print(mock.call_args)                # call(3, 4)  — most recent
print(mock.call_args_list)           # [call(1, 2), call(3, 4)]

# 5) AsyncMock for awaitable code paths
afetch = AsyncMock(return_value={"data": [1, 2, 3]})
# in an async test:
# result = await afetch()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - spec_set typo-proofing, ANY for argument flex, configure_mock, reset_mock
# STRENGTHS - The hardening that turns mocks from blunt to precise
# WEAKNESSES- N/A
#
from unittest.mock import MagicMock, AsyncMock, ANY, call

class Database:
    def get_user(self, uid): ...
    def save(self, user):     ...

# 1) spec_set= — strictest. Mock CAN'T grow new attributes; typos die at test time.
mock_db = MagicMock(spec_set=Database)
mock_db.get_user(1)              # OK
# mock_db.get_usr(1)             # AttributeError — caught immediately
# mock_db.new_method(1)          # AttributeError — would silently work without spec_set

# 2) configure_mock — set many attributes/return_values at once
mock_db.configure_mock(**{
    "get_user.return_value": {"id": 1, "name": "Alice"},
    "save.return_value":     None,
})

# 3) ANY — match arguments you don't care to assert exactly
mock_db.save(MagicMock(id=1))
mock_db.save.assert_called_once_with(ANY)        # any object passed -> pass

# 4) Multi-call assertions — call_args_list with the call helper
mock = MagicMock()
mock(1); mock(2); mock(3)
assert mock.call_args_list == [call(1), call(2), call(3)]
mock.assert_has_calls([call(1), call(3)])        # subset, in order
mock.assert_has_calls([call(2), call(1)], any_order=True)

# 5) reset_mock — clear call history WITHOUT clearing return_value/side_effect
mock.reset_mock()
mock.assert_not_called()

# 6) Async — await targets must use AsyncMock; assert_awaited_*  for awaits
afetch = AsyncMock(return_value=42)
# await afetch(7)
afetch.assert_awaited_once_with(7)               # different from assert_called_*

# Decision rule:
#   verify a single call, exact args      -> assert_called_once_with(args)
#   match anything for one arg              -> ANY
#   stub a method                            -> mock.method.return_value = X
#   raise on call                            -> mock.method.side_effect = ExcClass
#   sequence of returns                      -> side_effect = [r1, r2, r3]
#   typo-safe mock                           -> MagicMock(spec_set=RealClass)
#   async function                           -> AsyncMock + assert_awaited*
#
# Anti-pattern: assert_called() instead of assert_called_once_with()
#   assert_called() passes for ANY number of calls with ANY args. The test goes
#   green even when the mocked code is fundamentally broken. Always assert
#   COUNT and ARGS together.

def send_welcome(email, addr): email.send(addr)
```

## Decision Rule

```text
verify a single call, exact args      -> assert_called_once_with(args)
match anything for one arg              -> ANY
stub a method                            -> mock.method.return_value = X
raise on call                            -> mock.method.side_effect = ExcClass
sequence of returns                      -> side_effect = [r1, r2, r3]
typo-safe mock                           -> MagicMock(spec_set=RealClass)
async function                           -> AsyncMock + assert_awaited*
```

## Anti-Pattern

> [!warning] Anti-pattern
> assert_called() instead of assert_called_once_with()
>   assert_called() passes for ANY number of calls with ANY args. The test goes
>   green even when the mocked code is fundamentally broken. Always assert
>   COUNT and ARGS together.

## Tips

- `assert_called_once_with(args)` is stricter than `assert_called_once()` — always prefer it
- `MagicMock(spec=RealClass)` is best practice — catches typos and wrong method names at test time
- `side_effect` list is consumed one per call — useful for testing retry logic
- Use `AsyncMock` for `async def` functions — regular `MagicMock` is not awaitable

## Common Mistake

> [!warning] Using `mock.assert_called()` instead of `mock.assert_called_once_with(expected_args)`. The latter verifies both that it was called exactly once AND with the right arguments.

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

- [[Sections/testing/mocking/patch|unittest.mock.patch() (Testing with pytest)]]
- [[Sections/testing/mocking/responses|responses (Testing with pytest)]]
- [[Sections/testing/mocking/httpretty|httpretty (Testing with pytest)]]
- [[Sections/testing/mocking/mocker|mocker fixture (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

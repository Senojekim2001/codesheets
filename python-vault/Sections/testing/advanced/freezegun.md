---
type: "entry"
domain: "python"
file: "testing"
section: "advanced"
id: "freezegun"
title: "freezegun"
category: "Advanced"
subtitle: "@freeze_time(\"2024-01-15\") — all datetime calls return the frozen time"
signature_short: "@freeze_time(\"2024-01-15\") | with freeze_time(\"2024-01-15\"):"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "freezegun"
tags:
  - "python"
  - "python/testing"
  - "python/testing/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# freezegun

> @freeze_time("2024-01-15") — all datetime calls return the frozen time

## Overview

freezegun patches all datetime and time calls to return a fixed moment. Works transparently — no code changes needed. Use it to test time-dependent logic like expiry, scheduling, age calculation, and token TTL. Install: pip install freezegun.

## Signature

```python
@freeze_time("2024-01-15") | with freeze_time("2024-01-15"):
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @freeze_time("..."): every clock call inside the test returns this moment
# STRENGTHS - Smallest demonstration of deterministic time
# WEAKNESSES- No advance / no time-zone discussion
#
# pip install freezegun
from datetime import datetime
from freezegun import freeze_time

@freeze_time("2024-01-15 12:00:00")
def test_user_age():
    user = make_user(birth_date=datetime(1990, 1, 15))
    assert user.age == 34
    assert datetime.now() == datetime(2024, 1, 15, 12, 0, 0)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Context manager, fixtures, .move_to() and .tick() to advance
# STRENGTHS - The patterns for testing TTLs / expiries / age calculations
# WEAKNESSES- Doesn't yet cover monotonic / perf_counter
#
from datetime import datetime, timedelta
import pytest
from freezegun import freeze_time

# 1) Context manager — freeze for a region of the test
def test_token_expiry():
    with freeze_time("2024-01-15") as frozen:
        token = create_token(ttl=timedelta(hours=1))
        frozen.tick(timedelta(minutes=30))
        assert not is_expired(token)
        frozen.tick(timedelta(minutes=31))            # crosses the hour
        assert is_expired(token)

# 2) Fixture — share the frozen clock across many tests
@pytest.fixture
def frozen_time():
    with freeze_time("2024-06-01") as ft:
        yield ft

def test_jump_in_time(frozen_time):
    assert datetime.now().date().isoformat() == "2024-06-01"
    frozen_time.move_to("2024-06-15")                 # absolute jump
    assert datetime.now().date().isoformat() == "2024-06-15"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - DI-the-clock first; freezegun for legacy code; tick semantics
# STRENGTHS - The architectural lesson + the gotchas that bite teams using freezegun
# WEAKNESSES- N/A
#
from datetime import datetime, timezone, timedelta
from freezegun import freeze_time

# 1) Architectural rule: PASS THE CLOCK IN. Then you don't need freezegun at all.
class Token:
    def __init__(self, ttl, *, now=datetime.utcnow):
        self.created = now()
        self.ttl     = ttl
    def is_expired(self, *, now=datetime.utcnow):
        return now() > self.created + self.ttl

def test_token_expiry_di():
    fake_now = lambda: datetime(2024, 1, 15, 12, 30)        # no freezegun needed
    token = Token(timedelta(hours=1), now=lambda: datetime(2024, 1, 15, 12, 0))
    assert token.is_expired(now=lambda: datetime(2024, 1, 15, 13, 1))

# 2) When you can't refactor — freezegun handles legacy code transparently.
#    BUT note: time.monotonic() and time.perf_counter() are NOT frozen by default.
#    Pass tick=True or use .tick() to advance.
with freeze_time("2024-01-15", tick=True):                  # real time advances; START is frozen
    ...

# 3) Time-zone aware tests — freeze in UTC, convert at the boundary
@freeze_time("2024-01-15 23:00:00")                          # UTC by default
def test_local_midnight_in_tokyo():
    import zoneinfo
    now_jst = datetime.now(timezone.utc).astimezone(zoneinfo.ZoneInfo("Asia/Tokyo"))
    assert now_jst.hour == 8                                  # 2024-01-16 08:00 JST

# 4) Beware: third-party libs that cache time at import time skip freezegun.
#    Apply freeze_time as a SESSION fixture before imports, or use ignore=[...]
#    to skip libraries that misbehave.

# Decision rule:
#   greenfield code                            -> inject the clock; never use freezegun
#   legacy uses datetime.now() / time.time()   -> @freeze_time
#   need to advance time during a test          -> ft.tick(seconds=...) / ft.move_to(...)
#   need monotonic / perf_counter to advance    -> tick=True; or pass a fake monotonic_ns
#   testing across time zones                    -> freeze in UTC, convert on read
#   library caches "now" at import                -> apply freeze BEFORE the import
#
# Anti-pattern: assert datetime.now() == "2024-01-15"
#   On a real clock this is a flaky check that passes for one millisecond. Either
#   freeze, or compare to a captured "now" variable, never the clock itself.

def make_user(birth_date):
    age = (datetime.now() - birth_date).days // 365
    return type("U", (), {"age": age})()
def create_token(ttl): return type("T", (), {"created": datetime.now(), "ttl": ttl})()
def is_expired(t): return datetime.now() > t.created + t.ttl
```

## Decision Rule

```text
greenfield code                            -> inject the clock; never use freezegun
legacy uses datetime.now() / time.time()   -> @freeze_time
need to advance time during a test          -> ft.tick(seconds=...) / ft.move_to(...)
need monotonic / perf_counter to advance    -> tick=True; or pass a fake monotonic_ns
testing across time zones                    -> freeze in UTC, convert on read
library caches "now" at import                -> apply freeze BEFORE the import
```

## Anti-Pattern

> [!warning] Anti-pattern
> assert datetime.now() == "2024-01-15"
>   On a real clock this is a flaky check that passes for one millisecond. Either
>   freeze, or compare to a captured "now" variable, never the clock itself.

## Tips

- freezegun patches all datetime sources — datetime.now(), time.time(), date.today()
- Use .move_to() or .tick() on the frozen_time object to advance time within a test
- Works with third-party libraries too — any code that uses standard datetime is frozen
- For testing across time zones, combine with freeze_time("2024-01-15", tz_offset=-5)

## Common Mistake

> [!warning] Using datetime.now() directly in production code without dependency injection. If you pass now as a parameter, you can test without freezegun at all — but freezegun handles legacy code gracefully.

## Shorthand (Junior → Senior)

**Junior:**
```python
from datetime import datetime, timedelta
from freezegun import freeze_time
from datetime import datetime
import pytest
```

**Senior:**
```python
assert datetime.now().date() == date(2024, 6, 15)
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/testing/advanced/hypothesis|Hypothesis (Testing with pytest)]]
- [[Sections/testing/advanced/_Index|Testing with pytest → Advanced Testing]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "datetime"
title: "datetime module"
category: "Standard Library"
subtitle: "date, time, datetime, timedelta, timezone — parsing and arithmetic"
signature_short: "datetime.now() | datetime.strptime(s, fmt) | dt + timedelta(days=7)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "datetime module"
  - "datetime"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# datetime module

> date, time, datetime, timedelta, timezone — parsing and arithmetic

## Overview

The datetime module provides date and time objects. datetime.now() returns local time; datetime.utcnow() returns UTC. Use strptime() to parse strings and strftime() to format. timedelta represents a duration and supports arithmetic.

## Signature

```python
datetime.now() | datetime.strptime(s, fmt) | dt + timedelta(days=7)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - datetime.now(timezone.utc) for storage; strptime/strftime for I/O; timedelta for arithmetic.
# STRENGTHS - One module covers create, parse, format, math.
# WEAKNESSES- datetime.now() (no arg) returns NAIVE local time — easy to confuse with UTC.
from datetime import datetime, timedelta, timezone

now = datetime.now(timezone.utc)             # tz-aware
print(now.isoformat())                        # 2026-04-30T12:34:56+00:00

dt = datetime.strptime("2026-04-30", "%Y-%m-%d")
print(dt.strftime("%B %d, %Y"))               # April 30, 2026

tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - fromisoformat for ISO-8601 parsing (3.11+ accepts most forms); zoneinfo for IANA tz; explicit tz everywhere.
# STRENGTHS - Stdlib-only timezone handling (no pytz needed since 3.9); strict ISO parsing is fast.
# WEAKNESSES- fromisoformat strictness varies by version: 3.11+ accepts "Z" suffix, 3.10- doesn't.
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo                 # 3.9+ stdlib

# Parse ISO 8601 with offset.
dt = datetime.fromisoformat("2026-04-30T12:00:00+00:00")
# Pre-3.11 workaround for Z suffix:
dt = datetime.fromisoformat("2026-04-30T12:00:00Z".replace("Z", "+00:00"))

# Convert UTC -> local timezone for display.
ny = dt.astimezone(ZoneInfo("America/New_York"))

# Compare aware vs naive raises TypeError -- always carry tzinfo.
def parse_log_ts(s: str) -> datetime:
    d = datetime.fromisoformat(s)
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)

# Duration arithmetic.
elapsed = datetime.now(timezone.utc) - dt
print(elapsed.total_seconds())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - UTC at the boundary, IANA tz for display; calendar libs (python-dateutil) for parsing weird formats; never use datetime.utcnow.
# STRENGTHS - DST-correct math via zoneinfo; safe across server moves; explicit conversion at every boundary.
# WEAKNESSES- DST transitions (fold attribute) bite on 1:30am in fall; if you do scheduling, test around those days.
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Self

UTC = timezone.utc

def now_utc() -> datetime:
    return datetime.now(UTC)                  # tz-aware; ALWAYS over datetime.utcnow()

def to_utc(dt: datetime, *, default_tz: ZoneInfo = ZoneInfo("UTC")) -> datetime:
    return (dt if dt.tzinfo else dt.replace(tzinfo=default_tz)).astimezone(UTC)

def display_local(dt: datetime, tz_name: str = "America/New_York") -> str:
    return dt.astimezone(ZoneInfo(tz_name)).strftime("%Y-%m-%d %H:%M %Z")

# DST-safe deltas: cross-tz, prefer adding seconds in UTC.
def in_n_days(dt: datetime, days: int) -> datetime:
    return dt.astimezone(UTC) + timedelta(days=days)

# Decision rule:
#   storage / serialization              -> UTC, ISO 8601, with offset (+00:00)
#   display to user                      -> astimezone(ZoneInfo("Region/City"))
#   arithmetic across DST                -> compute in UTC, convert at the end
#   parse ISO from external source       -> datetime.fromisoformat (Z handling: 3.11+ free; older replace Z->+00:00)
#   parse free-form text                 -> python-dateutil.parser.parse  (NOT regex + strptime)
#   schedule jobs                        -> store cron in UTC; render in user's tz; test DST boundary
#   "right now"                          -> datetime.now(timezone.utc)  (NOT datetime.utcnow — naive)
#
# Anti-pattern: mixing naive and aware datetimes. Subtraction raises
# TypeError, comparisons raise TypeError, and ORM saves silently lose the
# timezone. Decide ONCE at every boundary: aware in, aware out.
```

## Decision Rule

```text
storage / serialization              -> UTC, ISO 8601, with offset (+00:00)
display to user                      -> astimezone(ZoneInfo("Region/City"))
arithmetic across DST                -> compute in UTC, convert at the end
parse ISO from external source       -> datetime.fromisoformat (Z handling: 3.11+ free; older replace Z->+00:00)
parse free-form text                 -> python-dateutil.parser.parse  (NOT regex + strptime)
schedule jobs                        -> store cron in UTC; render in user's tz; test DST boundary
"right now"                          -> datetime.now(timezone.utc)  (NOT datetime.utcnow — naive)
```

## Anti-Pattern

> [!warning] Anti-pattern
> mixing naive and aware datetimes. Subtraction raises
> TypeError, comparisons raise TypeError, and ORM saves silently lose the
> timezone. Decide ONCE at every boundary: aware in, aware out.

## Tips

- Always store and transmit datetimes in UTC — convert to local time only for display
- `timedelta` supports days, hours, minutes, seconds, weeks — and arithmetic with datetime
- `datetime.fromisoformat("2024-01-15")` (Python 3.7+) is faster than `strptime` for ISO format
- For production date handling (timezones, parsing) use the `dateutil` or `arrow` library

## Common Mistake

> [!warning] Using `datetime.utcnow()` — it returns naive UTC with no timezone info attached, making it easy to confuse with local time. Use `datetime.now(timezone.utc)` for timezone-aware UTC.

## Shorthand (Junior → Senior)

**Junior:**
```python
from datetime import datetime, timedelta
from datetime import datetime, date, time, timedelta, timezone
now   = datetime.now()                    # local time
utcnow = datetime.now(timezone.utc)       # timezone-aware UTC
```

**Senior:**
```python
dt1 == dt2
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/json-module|json module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

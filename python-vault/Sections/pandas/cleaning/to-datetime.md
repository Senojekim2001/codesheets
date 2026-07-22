---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "to-datetime"
title: "pd.to_datetime()"
category: "Cleaning"
subtitle: "Always convert date strings — then use .dt accessor for extraction"
signature_short: "pd.to_datetime(series, format=\"%Y-%m-%d\", errors=\"coerce\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.to_datetime()"
  - "to-datetime"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# pd.to_datetime()

> Always convert date strings — then use .dt accessor for extraction

## Overview

pd.to_datetime() converts strings, integers, or objects to datetime64. Always specify format= on large datasets — auto-detection is slow. Use errors="coerce" to turn unparseable values to NaT. Once converted, the .dt accessor unlocks all datetime operations.

## Signature

```python
pd.to_datetime(series, format="%Y-%m-%d", errors="coerce")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call: parse a date column. Auto-detection works
#             for ISO-formatted strings.
# STRENGTHS - one line moves an object column to a real datetime64
#             dtype; .dt accessor immediately becomes available.
# WEAKNESSES- auto-detection scans every value (slow on big frames);
#             ambiguous formats like "01/02/2024" silently get the
#             wrong interpretation. Junior tier pins the format.
#
import pandas as pd

df["date"] = pd.to_datetime(df["date"])
df["date"].dt.year                           # the .dt accessor unlocks
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday parsing options: pin format= for speed
#             and unambiguity, errors="coerce" for messy data, and
#             unit= for Unix timestamps. Pull components with .dt.
# STRENGTHS - covers what real ETL looks like; pinning format= can
#             be 10-100x faster on large frames; unit= handles the
#             "I have epoch timestamps" case explicitly.
# WEAKNESSES- doesn't address timezone-awareness or the ambiguous
#             dayfirst issue between US and EU formats — senior tier.
#
import pandas as pd

# Pin format — much faster, no ambiguity
df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d")
df["date"] = pd.to_datetime(df["date"], format="%d/%m/%Y")
df["date"] = pd.to_datetime(df["date"], format="ISO8601")    # 3.7+

# Coerce bad values to NaT instead of crashing
df["date"] = pd.to_datetime(df["date"], errors="coerce")

# Unix timestamps
df["ts_sec"] = pd.to_datetime(df["ts_sec"], unit="s")
df["ts_ms"]  = pd.to_datetime(df["ts_ms"],  unit="ms")

# Component extraction via .dt
df["date"].dt.year
df["date"].dt.month
df["date"].dt.day_of_week                    # 0 = Monday
df["date"].dt.day_name()                     # 'Monday', 'Tuesday'...
df["date"].dt.quarter
(pd.Timestamp.today() - df["date"]).dt.days  # age in days
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production datetime parsing: timezone-aware columns
#             from the start, dayfirst when the source is European,
#             post-parse audit of NaT counts, and the "always set
#             the index for resample/rolling" rule.
# STRENGTHS - tz-aware data prevents the "off by one day" bug at
#             midnight; explicit dayfirst stops US/EU silent
#             misparse; index-as-datetime unlocks resample/asfreq.
# WEAKNESSES- mixing tz-aware and tz-naive columns raises on
#             arithmetic — pick one and stick with it; resample on
#             non-monotonic indexes silently produces nonsense.
#
import pandas as pd

# 1. Timezone-aware parsing from the start
df["created_at"] = pd.to_datetime(df["created_at"], utc=True)         # to UTC
df["created_at_local"] = (df["created_at"]
                            .dt.tz_convert("America/New_York"))

# 2. European format — dayfirst is unambiguous and explicit
df["due"] = pd.to_datetime(df["due"], dayfirst=True, errors="coerce")

# 3. Audit parse failures — known-good dates count
nat_count = df["due"].isna().sum()
nat_pct   = nat_count / len(df) * 100
assert nat_pct < 1.0, f"{nat_pct:.1f}% of dates failed to parse"

# 4. Datetime index unlocks the time-series API
ts = (df.set_index("created_at")
        .sort_index())                           # MUST be sorted

ts["amount"].resample("D").sum()                 # daily totals
ts["amount"].resample("M").mean()                # monthly mean
ts["amount"].rolling("7D").mean()                # rolling 7-day window

# 5. Anti-pattern in production:
#    Storing dates as object/strings and comparing with > / <.
#    Works accidentally for ISO format, breaks for everything else.

# Decision rule:
#   Mixed date strings                          -> pd.to_datetime(s)
#   Known format (5-100x faster)                  -> format="%Y-%m-%d %H:%M:%S"
#   Errors as NaT                                  -> errors="coerce"
#   Always store UTC                                -> utc=True (then localize to display TZ)
#   Excel serial dates                              -> pd.to_datetime(s, unit="D", origin="1899-12-30")
#   Unix timestamps (seconds / ms)                  -> unit="s" or unit="ms"
#   Mixed timezones                                  -> utc=True normalises; without, returns object
#   Speed at scale                                   -> ISO 8601 + format="ISO8601" (3.0+)
#
# Anti-pattern: parsing user-input dates without utc=True
#   Mixed timezones in a single column become object dtype (not datetime64),
#   and any operation that expects datetime64 (resample, .dt.year) silently
#   fails or coerces. Always pd.to_datetime(s, utc=True) on heterogeneous
#   sources; convert to a display TZ only at the presentation layer.
```

## Decision Rule

```text
Mixed date strings                          -> pd.to_datetime(s)
Known format (5-100x faster)                  -> format="%Y-%m-%d %H:%M:%S"
Errors as NaT                                  -> errors="coerce"
Always store UTC                                -> utc=True (then localize to display TZ)
Excel serial dates                              -> pd.to_datetime(s, unit="D", origin="1899-12-30")
Unix timestamps (seconds / ms)                  -> unit="s" or unit="ms"
Mixed timezones                                  -> utc=True normalises; without, returns object
Speed at scale                                   -> ISO 8601 + format="ISO8601" (3.0+)
```

## Anti-Pattern

> [!warning] Anti-pattern
> parsing user-input dates without utc=True
>   Mixed timezones in a single column become object dtype (not datetime64),
>   and any operation that expects datetime64 (resample, .dt.year) silently
>   fails or coerces. Always pd.to_datetime(s, utc=True) on heterogeneous
>   sources; convert to a display TZ only at the presentation layer.

## Tips

- Always specify `format=` on large datasets — auto-detection scans every value and is slow
- `errors="coerce"` converts unparseable values to `NaT` (Not a Time) instead of raising
- After converting, use `df.set_index("date").resample("M").sum()` for time-based aggregation
- Store and compare dates as datetime64 — string comparison is 100x slower and format-dependent

## Common Mistake

> [!warning] Leaving date columns as `object` dtype and doing string comparisons like `df["date"] > "2024-01"`. This works accidentally for ISO format but breaks for any other format.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df['date'] = pd.to_datetime(df['date'])
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')
```

**Senior:**
```python
(pd.Timestamp.today() - df['date']).dt.days  # age in days
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

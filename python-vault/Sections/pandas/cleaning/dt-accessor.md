---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "dt-accessor"
title: ".dt accessor"
category: "Cleaning"
subtitle: "Year, month, day, weekday, quarter — from a datetime64 Series"
signature_short: "df[\"col\"].dt.year | .dt.month | .dt.day_name() | .dt.total_seconds()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".dt accessor"
  - "dt-accessor"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .dt accessor

> Year, month, day, weekday, quarter — from a datetime64 Series

## Overview

The .dt accessor exposes datetime properties and methods on a Series with dtype datetime64. Always convert string dates with pd.to_datetime() first. Supports component extraction, arithmetic, floor/ceil, and resample-friendly operations.

## Signature

```python
df["col"].dt.year | .dt.month | .dt.day_name() | .dt.total_seconds()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - convert to datetime64 first (the only prerequisite),
#             then extract components: year, month, day_of_week.
# STRENGTHS - shows the .dt unlock in three lines; reveals that .dt
#             is the dual of .str — same pattern, different domain.
# WEAKNESSES- doesn't yet show arithmetic, calendar offsets, or
#             period conversion — those are the everyday extras.
#
import pandas as pd

df["date"] = pd.to_datetime(df["date"])      # required first

df["date"].dt.year
df["date"].dt.month
df["date"].dt.day_of_week                    # 0 = Monday
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the day-to-day .dt surface: component extraction,
#             arithmetic with Timedelta, filters by year/range,
#             floor/ceil and Period conversion for grouping.
# STRENGTHS - covers what .dt actually looks like in real code:
#             "age in days", "next 30 days", "filter to 2024",
#             and "group by month period".
# WEAKNESSES- doesn't address timezone-aware operations, business
#             day arithmetic, or DST gotchas — senior tier.
#
import pandas as pd

df["date"] = pd.to_datetime(df["date"])

# Component extraction
df["year"]      = df["date"].dt.year
df["month"]     = df["date"].dt.month
df["weekday"]   = df["date"].dt.day_name()
df["quarter"]   = df["date"].dt.quarter
df["month_end"] = df["date"].dt.is_month_end

# Arithmetic
df["age_days"] = (pd.Timestamp.today() - df["date"]).dt.days
df["end"]      = df["start"] + pd.Timedelta(days=30)
df["hours"]    = (df["end"] - df["start"]).dt.total_seconds() / 3600

# Filters
df[df["date"].dt.year == 2024]
df[df["date"].between("2024-01-01", "2024-06-30")]

# Floor / ceil / period
df["hour_floor"] = df["date"].dt.floor("h")     # 09:34:51 -> 09:00:00
df["month_period"] = df["date"].dt.to_period("M")    # 2024-01 (a Period, not a date)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production datetime work: tz-aware columns end-to-end,
#             business-day offsets via DateOffset, DST-safe rounding,
#             and the "set the index, then resample/rolling" idiom.
# STRENGTHS - tz-aware data prevents the off-by-one bugs at
#             midnight; DateOffset respects calendars (months and
#             quarters aren't fixed-width); resample on a sorted
#             DatetimeIndex unlocks the time-series API.
# WEAKNESSES- mixing tz-aware and tz-naive raises on subtraction;
#             DST transitions create ambiguous/non-existent times
#             that need ambiguous=/nonexistent= flags; rolling on
#             a non-monotonic index produces nonsense silently.
#
import pandas as pd

# 1. Timezone-aware end-to-end
df["created_at"] = pd.to_datetime(df["created_at"], utc=True)
df["created_at_ny"] = df["created_at"].dt.tz_convert("America/New_York")

# 2. Business-day arithmetic — calendar-aware
df["due_business"] = df["start"] + pd.tseries.offsets.BusinessDay(5)
df["due_month"]    = df["start"] + pd.DateOffset(months=1)   # respects month length

# 3. DST-safe rounding — explicit ambiguous/nonexistent handling
hourly = df["created_at_ny"].dt.floor(
    "h",
    ambiguous="NaT",         # ambiguous DST fall-back times -> NaT
    nonexistent="shift_forward",  # spring-forward gap -> next valid time
)

# 4. The time-series unlock — set index, then resample / rolling
ts = (df.set_index("created_at_ny")
        .sort_index())                       # MUST be sorted

ts["amount"].resample("D").sum()             # daily totals
ts["amount"].rolling("7D").mean()            # rolling 7-day window
ts["amount"].asfreq("h").ffill()             # snap to hourly grid

# 5. Anti-pattern in production:
#    df["date"] = df["date"].dt.tz_localize("US/Eastern")
#    after the column is already tz-aware -> raises. Use tz_convert,
#    or strip tz first with .dt.tz_localize(None).

# Decision rule:
#   Year/month/day extraction                   -> s.dt.year / .month / .day
#   Day-of-week                                  -> .dt.dayofweek (0=Mon) or .day_name()
#   Hour/minute/second                            -> .dt.hour / .minute / .second
#   Floor / ceil to bucket                        -> .dt.floor("h") / .ceil("D")
#   Convert TZ                                   -> .dt.tz_convert("America/New_York")
#   Localize naive UTC                            -> .dt.tz_localize("UTC")
#   Timedelta math                                -> col_a - col_b returns Timedelta
#   ISO calendar                                   -> .dt.isocalendar() returns (year, week, day)
#
# Anti-pattern: applying string methods to a datetime column
#   s.str.startswith("2024") fails because the dtype is datetime64, not string.
#   Use .dt accessor instead: s.dt.year == 2024. If you genuinely need string
#   formatting, do it via s.dt.strftime("%Y-%m") then string ops on the result.
```

## Decision Rule

```text
Year/month/day extraction                   -> s.dt.year / .month / .day
Day-of-week                                  -> .dt.dayofweek (0=Mon) or .day_name()
Hour/minute/second                            -> .dt.hour / .minute / .second
Floor / ceil to bucket                        -> .dt.floor("h") / .ceil("D")
Convert TZ                                   -> .dt.tz_convert("America/New_York")
Localize naive UTC                            -> .dt.tz_localize("UTC")
Timedelta math                                -> col_a - col_b returns Timedelta
ISO calendar                                   -> .dt.isocalendar() returns (year, week, day)
```

## Anti-Pattern

> [!warning] Anti-pattern
> applying string methods to a datetime column
>   s.str.startswith("2024") fails because the dtype is datetime64, not string.
>   Use .dt accessor instead: s.dt.year == 2024. If you genuinely need string
>   formatting, do it via s.dt.strftime("%Y-%m") then string ops on the result.

## Tips

- `.dt.day_of_week` returns 0=Monday — use `.dt.day_name()` for readable labels
- `pd.Timedelta` is a fixed duration; `pd.DateOffset` respects calendar (useful for months/quarters)
- String comparison `df["date"] >= "2024-01-01"` works once the column is datetime64
- `resample()` requires the datetime column to be the index — `df.set_index("date").resample("M")`

## Common Mistake

> [!warning] Doing date comparisons on an `object` column. It works for ISO format strings but is 100x slower and silently fails for any other format. Always convert with `pd.to_datetime()` first.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df['date'] = pd.to_datetime(df['date'])
df['date'].dt.year
df['date'].dt.month
```

**Senior:**
```python
df['date'].dt.to_period('M') # 2024-01 period
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

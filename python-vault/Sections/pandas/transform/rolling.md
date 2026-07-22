---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "rolling"
title: ".rolling()"
category: "Transform"
subtitle: "Moving average, rolling std, rolling max — for time series"
signature_short: "df[\"col\"].rolling(window, min_periods=1).mean()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".rolling()"
  - "rolling"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .rolling()

> Moving average, rolling std, rolling max — for time series

## Overview

rolling() computes statistics over a sliding window of fixed size. By default produces NaN for the first n-1 rows — use min_periods=1 to get values from the start. Always sort by date before applying.

## Signature

```python
df["col"].rolling(window, min_periods=1).mean()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sort first, then take a rolling mean over a fixed
#             window. The first n-1 rows come back as NaN.
# STRENGTHS - simplest possible smoothing; the sort-first habit
#             is what makes rolling correct.
# WEAKNESSES- doesn't yet show min_periods, time-aware windows,
#             or the group-aware variant that prevents leakage
#             across products.
#
import pandas as pd

df = df.sort_values("date")
df["ma7"] = df["sales"].rolling(7).mean()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday rolling toolbox: min_periods to fill
#             the warm-up, center=True for symmetric windows,
#             multiple aggregators (mean / std / sum / max), the
#             ewm alternative for recency-weighting, and group-
#             aware rolling via groupby + transform.
# STRENGTHS - covers what rolling actually does in real code:
#             smooth a series, compute volatility, weight recent
#             observations, and respect group boundaries.
# WEAKNESSES- doesn't yet show TIME-aware windows ("7D" instead
#             of integer 7) which require a DatetimeIndex —
#             senior tier.
#
import pandas as pd

df = df.sort_values("date")

# Multiple stats over the same window
df["ma7"]   = df["sales"].rolling(7, min_periods=1).mean()
df["std7"]  = df["sales"].rolling(7, min_periods=1).std()
df["max7"]  = df["sales"].rolling(7, min_periods=1).max()

# Centered window — uses past AND future, careful with leakage
df["ma7c"]  = df["sales"].rolling(7, center=True).mean()

# Recency-weighted alternative — exponential moving average
df["ema7"]  = df["sales"].ewm(span=7).mean()

# Group-aware: rolling within each product, not across boundaries
df["prod_ma7"] = (df.groupby("product")["sales"]
                    .transform(lambda s: s.rolling(7, min_periods=1).mean()))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rolling: time-aware windows ("7D") on a
#             DatetimeIndex when timestamps are irregular, fast-
#             path string aggregators (no lambda) inside groupby
#             rolling, closed= for "right edge open" windows that
#             prevent forward-looking leakage in features.
# STRENGTHS - time-aware windows handle gaps correctly (a "7-day"
#             window doesn't include rows from 30 days ago just
#             because they happen to be the previous 7 entries);
#             string aggregators hit the C path; closed="left"
#             excludes the current row — critical for ML features.
# WEAKNESSES- time-aware rolling requires a sorted DatetimeIndex,
#             which costs a one-time sort; closed= semantics are
#             easy to misread; ewm has its own closed= conventions.
#
import pandas as pd

# 1. Time-aware rolling — handles irregular spacing correctly
ts = (df.set_index("date")
        .sort_index())
ts["ma_7d"]    = ts["sales"].rolling("7D").mean()       # last 7 calendar days
ts["sum_30d"]  = ts["sales"].rolling("30D").sum()

# 2. Group-aware rolling on the FAST PATH (no lambda)
df = df.sort_values(["product", "date"])
df["roll_7"] = (df.groupby("product", observed=True)["sales"]
                  .rolling(7, min_periods=1)
                  .mean()
                  .reset_index(level=0, drop=True))

# 3. Anti-leakage in ML features — exclude the current row
ts["lag_avg_7"] = (ts["sales"]
                     .rolling(7, closed="left")          # window ENDS BEFORE row
                     .mean())                            # safe to use as a feature

# 4. Custom aggregator (when no built-in fits) via raw=True for speed
import numpy as np
ts["range_7"] = (ts["sales"]
                   .rolling(7)
                   .apply(lambda a: a.max() - a.min(), raw=True))

# Anti-pattern: rolling on unsorted data
#   df["sales"].rolling(7).mean()    # nonsense if df isn't sorted
# Always sort first; assert ts.index.is_monotonic_increasing in pipelines.

# Decision rule:
#   Fixed-size window                            -> df.rolling(window=N).mean()
#   Time-based window                             -> rolling("7D") (needs DatetimeIndex)
#   Expanding (cumulative)                         -> .expanding() (window grows)
#   Per-group rolling                              -> df.groupby(g).rolling(N)
#   Custom function                                -> .apply(fn, raw=True) (raw=True passes ndarray, faster)
#   Min periods to bypass leading NaN              -> min_periods=1
#   Centered window                                -> center=True (causes lookahead — be careful)
#   Multi-column reduction                          -> .agg({"a":"mean","b":"sum"}) on rolling
```

## Decision Rule

```text
Fixed-size window                            -> df.rolling(window=N).mean()
Time-based window                             -> rolling("7D") (needs DatetimeIndex)
Expanding (cumulative)                         -> .expanding() (window grows)
Per-group rolling                              -> df.groupby(g).rolling(N)
Custom function                                -> .apply(fn, raw=True) (raw=True passes ndarray, faster)
Min periods to bypass leading NaN              -> min_periods=1
Centered window                                -> center=True (causes lookahead — be careful)
Multi-column reduction                          -> .agg({"a":"mean","b":"sum"}) on rolling
```

## Anti-Pattern

> [!warning] Anti-pattern
> rolling on unsorted data
>   df["sales"].rolling(7).mean()    # nonsense if df isn't sorted
> Always sort first; assert ts.index.is_monotonic_increasing in pipelines.

## Tips

- Always `sort_values("date")` before rolling — unsorted data gives meaningless results
- `min_periods=1` fills the warm-up period at the start instead of producing NaN
- `ewm(span=n).mean()` gives more weight to recent observations — better than SMA for volatile series
- Group-aware rolling via `groupby().transform(lambda x: x.rolling(n).mean())`

## Common Mistake

> [!warning] Applying `.rolling()` before sorting by date. Rolling operates on physical row order — if rows are unsorted, the window contains the wrong observations.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df = df.sort_values('date')
df['ma7']  = df['sales'].rolling(7).mean()
df['ma30'] = df['sales'].rolling(30).mean()
```

**Senior:**
```python
df['ema7'] = df['sales'].ewm(span=7).mean()
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

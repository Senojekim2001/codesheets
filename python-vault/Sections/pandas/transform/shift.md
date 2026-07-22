---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "shift"
title: ".shift()"
category: "Transform"
subtitle: "Create lag and lead features for time series and ML"
signature_short: "df[\"col\"].shift(1) | .shift(-1) | .diff() | .pct_change()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".shift()"
  - "shift"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .shift()

> Create lag and lead features for time series and ML

## Overview

shift() moves values forward (positive n) or backward (negative n) by n positions, filling edges with NaN. Essential for creating lag features in time series models and for computing period-over-period changes.

## Signature

```python
df["col"].shift(1) | .shift(-1) | .diff() | .pct_change()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sort first, then create a single lag column.
#             shift(1) gives "yesterday's value" for every row.
# STRENGTHS - shows the core idea — "look one row back" — in
#             two lines.
# WEAKNESSES- doesn't yet show diff / pct_change (the natural
#             companions), multi-lag generation, or the group-
#             aware shift that prevents cross-boundary leakage.
#
import pandas as pd

df = df.sort_values("date")
df["lag1"] = df["sales"].shift(1)             # yesterday's sales
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday lag toolbox: multiple lags via a
#             loop, period-over-period change with diff() and
#             pct_change(), and the group-aware version that
#             keeps lags inside each product/customer.
# STRENGTHS - covers the patterns ML feature engineers reach for
#             daily; the group-aware groupby+shift is THE rule
#             for multi-entity time-series data.
# WEAKNESSES- doesn't address freq= for time-aware shifts on a
#             DatetimeIndex (shift by "1D" instead of "1 row") —
#             senior tier covers it.
#
import pandas as pd

df = df.sort_values(["product", "date"])

# Multiple lags at once — feature batch
for n in (1, 7, 14, 30):
    df[f"lag_{n}"] = df.groupby("product")["sales"].shift(n)

# Period-over-period change
df["daily_change"] = df["sales"].diff(1)
df["wow_change"]   = df["sales"].diff(7)
df["daily_growth"] = df["sales"].pct_change()
df["wow_growth"]   = df["sales"].pct_change(7)

# Lead (future) — useful for labeling, dangerous as a feature
df["next"] = df["sales"].shift(-1)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade lag features: time-aware shifts
#             on a DatetimeIndex (shift by "1D" instead of one
#             row, so gaps don't fake an adjacent period), an
#             explicit "lead is leakage" rule, and a fill_value=
#             choice that documents the warm-up policy.
# STRENGTHS - time-aware shift is correct under irregular
#             timestamps; explicit fill_value gives a deliberate
#             warm-up; "no shift(-N) in features" is the simplest
#             rule for preventing label leakage.
# WEAKNESSES- freq= shift requires a DatetimeIndex (and a sort);
#             fill_value sometimes needs to be a sentinel
#             rather than 0 (NaN is often correct); group-aware
#             time-aware shift requires the index to align with
#             the group sort.
#
import pandas as pd

# 1. Time-aware shift — correct under irregular spacing
ts = (df.set_index("date").sort_index())
ts["lag_1d"] = ts["sales"].shift(freq="1D")          # shift by 1 calendar day
ts["lag_7d"] = ts["sales"].shift(freq="7D")

# 2. Per-group lag features with explicit warm-up policy
def add_lags(df: pd.DataFrame, col: str, lags=(1, 7, 14, 30)) -> pd.DataFrame:
    g = df.sort_values(["product", "date"]).groupby("product", observed=True)
    for n in lags:
        df[f"{col}_lag_{n}"] = g[col].shift(n)        # NaN warm-up by default
    return df

df = add_lags(df, "sales")

# 3. Anti-leakage rules for ML features
#    Use only PAST data (shift > 0) for features.
#    shift(-1) is fine for LABELS ("did sales go up tomorrow?")
#    NEVER as an X column.

# 4. Fill-value choice — be deliberate
#    NaN     - honest about missingness; tree models handle it
#    0       - only if 0 is semantically valid
#    sentinel ("WARM_UP")  - for category-shaped features

# Anti-pattern: cross-group shift
#   df["lag1"] = df["sales"].shift(1)
#   when the data has multiple products -> lag1 of product B's first
#   row is product A's last row. ALWAYS groupby-shift for multi-entity data.

# Decision rule:
#   Lag (look back N rows)                      -> s.shift(N) (positive lag)
#   Lead (look forward)                           -> s.shift(-N)
#   Per-group lag                                  -> df.groupby(g)["x"].shift(1)
#   Time-based shift                               -> .shift(freq="1D") (needs DatetimeIndex)
#   Difference between current and prior           -> s - s.shift(1)  (or s.diff())
#   Percent change                                  -> s.pct_change() (= s/s.shift()-1)
#   Filling the leading NaN                         -> .shift().fillna(0)
#   Predicting next value                            -> .shift(-1) (target column)
```

## Decision Rule

```text
Lag (look back N rows)                      -> s.shift(N) (positive lag)
Lead (look forward)                           -> s.shift(-N)
Per-group lag                                  -> df.groupby(g)["x"].shift(1)
Time-based shift                               -> .shift(freq="1D") (needs DatetimeIndex)
Difference between current and prior           -> s - s.shift(1)  (or s.diff())
Percent change                                  -> s.pct_change() (= s/s.shift()-1)
Filling the leading NaN                         -> .shift().fillna(0)
Predicting next value                            -> .shift(-1) (target column)
```

## Anti-Pattern

> [!warning] Anti-pattern
> cross-group shift
>   df["lag1"] = df["sales"].shift(1)
>   when the data has multiple products -> lag1 of product B's first
>   row is product A's last row. ALWAYS groupby-shift for multi-entity data.

## Tips

- `shift(1)` creates a lag — essential for preventing data leakage in time series ML models
- Use `groupby().shift()` for group-aware lags — otherwise you lag across group boundaries
- `pct_change()` is equivalent to `(shift(0) - shift(1)) / shift(1)` — computed efficiently
- The first `n` rows after a `shift(n)` are NaN — handle them before feeding into a model

## Common Mistake

> [!warning] Using `df["sales"].shift(1)` without groupby when data has multiple products. This creates lags across product boundaries — the lag for the first row of product B is the last row of product A.

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

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "fillna"
title: ".fillna()"
category: "Cleaning"
subtitle: "Replace NaN with a value, mean/median, or ffill/bfill"
signature_short: "df.fillna(value) | df[\"col\"].fillna(df[\"col\"].mean())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".fillna()"
  - "fillna"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .fillna()

> Replace NaN with a value, mean/median, or ffill/bfill

## Overview

fillna() replaces NaN values. Use a scalar, a dict (per column), or a fill method. ffill() propagates the last valid value forward — essential in time series. bfill() propagates backward.

## Signature

```python
df.fillna(value) | df["col"].fillna(df["col"].mean())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fill NaN with a constant. One value for everything.
# STRENGTHS - simplest possible imputation; demonstrates the pattern
#             in two lines.
# WEAKNESSES- 0 is rarely a good default for numerics — it changes
#             mean/sum/aggregations and biases models. Junior tier
#             covers per-column fills.
#
import pandas as pd

df = df.fillna(0)              # numeric default — usually wrong
df = df.fillna("Unknown")      # string default — usually fine
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - per-column fill values (the right shape for a real
#             frame), column-statistic imputation (median for skewed
#             data), forward/backward fill for time series, and
#             interpolate for numeric gaps.
# STRENGTHS - covers the daily-use options; the dict-form fillna
#             is the cleanest way to express "different policy per
#             column" in one call.
# WEAKNESSES- still leaks future information when used naively in
#             ML training (mean/median uses the WHOLE column,
#             including test rows). Senior tier addresses that.
#
import pandas as pd

# Per-column fills — one call, explicit policy
df = df.fillna({
    "age":   df["age"].median(),
    "city":  "Unknown",
    "score": df["score"].median(),
})

# Forward / backward fill — the time-series tools
df["price"] = df["price"].ffill()             # carry last known forward
df["price"] = df["price"].ffill().bfill()     # fill both directions

# Linear / time-aware interpolation between known values
df["price"] = df["price"].interpolate(method="linear")
df["price"] = df["price"].interpolate(method="time")

# Convert sentinel values to NaN before fillna
df = df.replace(-999, pd.NA)
df = df.replace(r"^\s*$", pd.NA, regex=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade imputation: fit statistics on training
#             data only and apply to test (no leakage), use sklearn's
#             SimpleImputer for pipeline integrity, and add a flag
#             column so models can learn from "was missing".
# STRENGTHS - prevents data leakage in ML pipelines; SimpleImputer
#             + ColumnTransformer is reproducible and serializable;
#             missing-flag features sometimes outperform the imputed
#             value itself.
# WEAKNESSES- adds sklearn as a dep and pipeline-shaped code; the
#             missing-flag pattern doubles the column count for the
#             affected fields.
#
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

# 1. Add missing-flag features BEFORE imputing
for col in ["age", "income"]:
    df[f"{col}_was_missing"] = df[col].isna().astype("int8")

# 2. Fit imputers on TRAIN only — never the full dataset
train, test = ...  # split first
num_imputer = SimpleImputer(strategy="median")
cat_imputer = SimpleImputer(strategy="most_frequent")

ct = ColumnTransformer([
    ("num", num_imputer, ["age", "income"]),
    ("cat", cat_imputer, ["city", "status"]),
], remainder="passthrough")

ct.fit(train)
train_imp = ct.transform(train)
test_imp  = ct.transform(test)        # uses TRAIN's medians/modes

# 3. Time-series fillna with explicit limit — never propagate
#    beyond a horizon you trust
df["price"] = df["price"].ffill(limit=3)     # at most 3 forward steps

# 4. Group-aware imputation — fill within a customer/product, not
#    across the whole dataset
df["amount"] = (df.groupby("customer_id")["amount"]
                  .transform(lambda s: s.fillna(s.median())))

# Anti-pattern in ML pipelines:
#   df["age"] = df["age"].fillna(df["age"].mean())   # leaks test values
# Use SimpleImputer (above) so the statistic is fit on train only.

# Decision rule:
#   Constant fill                                -> df.fillna(0) / df.fillna("Unknown")
#   Per-column constants                          -> df.fillna({"a": 0, "b": "?"})
#   Forward fill (LOCF)                           -> df.fillna(method="ffill")
#   Backward fill                                 -> .fillna(method="bfill")
#   Linear interpolation (numeric)                -> df.interpolate()
#   Group-aware fill                              -> df.groupby(g).ffill()
#   Median for skewed / mean for symmetric        -> domain choice; never blanket "0"
#   ML pipeline                                   -> sklearn.impute.SimpleImputer (fit on train)
#
# Anti-pattern: fillna(0) on a column that should have stayed null
#   Zero is a value, missing is the absence of one. Filling counts/IDs/log-values
#   with 0 corrupts every downstream sum and average. Default to keeping nulls
#   and only fill when the imputation rule is justified (constant for category,
#   median for skewed numeric, ffill for time-series gaps).
```

## Decision Rule

```text
Constant fill                                -> df.fillna(0) / df.fillna("Unknown")
Per-column constants                          -> df.fillna({"a": 0, "b": "?"})
Forward fill (LOCF)                           -> df.fillna(method="ffill")
Backward fill                                 -> .fillna(method="bfill")
Linear interpolation (numeric)                -> df.interpolate()
Group-aware fill                              -> df.groupby(g).ffill()
Median for skewed / mean for symmetric        -> domain choice; never blanket "0"
ML pipeline                                   -> sklearn.impute.SimpleImputer (fit on train)
```

## Anti-Pattern

> [!warning] Anti-pattern
> fillna(0) on a column that should have stayed null
>   Zero is a value, missing is the absence of one. Filling counts/IDs/log-values
>   with 0 corrupts every downstream sum and average. Default to keeping nulls
>   and only fill when the imputation rule is justified (constant for category,
>   median for skewed numeric, ffill for time-series gaps).

## Tips

- `ffill()` is essential in time series — carries the last known value forward through gaps
- `pd.NA` is the modern null for all dtypes; `np.nan` is float-only
- Filling with the mean changes distributional properties — use median for skewed data
- `df.replace(r"^\s*$", pd.NA, regex=True)` catches empty-string nulls that `isna()` misses

## Common Mistake

> [!warning] Filling numeric NaN with 0 by default. 0 is a valid data value — it changes mean, sum, and all aggregations. Fill with `mean()` or `median()` unless 0 is semantically correct.

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

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/astype|.astype() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

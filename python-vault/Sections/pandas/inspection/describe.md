---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "describe"
title: ".describe()"
category: "Inspection"
subtitle: "Count, mean, std, min, quartiles, max — at a glance"
signature_short: "df.describe(percentiles=[.25,.5,.75], include=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".describe()"
  - "describe"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .describe()

> Count, mean, std, min, quartiles, max — at a glance

## Overview

describe() computes descriptive statistics for all numeric columns by default. Use include="all" for categoricals too. Custom percentiles reveal distribution tails and outliers.

## Signature

```python
df.describe(percentiles=[.25,.5,.75], include=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - call describe() with no args. Read the count/mean/std/
#             min/quartile/max table for every numeric column.
# STRENGTHS - smallest-effort overview of distributions; the gap
#             between min and 25% (and 75% and max) is a free
#             outlier hint.
# WEAKNESSES- numeric only by default; doesn't surface skew / outliers
#             explicitly; categorical columns are silently skipped.
#
import pandas as pd

df.describe()
#         amount    score
# count   1000.00  1000.00
# mean      45.23    72.40
# std       12.11    15.33
# min        0.00    10.00
# 25%       37.50    62.00
# 50%       45.00    73.00
# 75%       53.00    84.00
# max      100.00   100.00
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - describe everything (include="all"), narrow to a single
#             column, and add custom percentiles to surface tails.
#             Pair with skew/kurtosis for a quick distribution sanity
#             check.
# STRENGTHS - covers the everyday inspection workflow; categorical
#             columns get top/freq stats; tail percentiles reveal the
#             outliers default quartiles hide.
# WEAKNESSES- still descriptive, not diagnostic — for a real outlier
#             story you need IQR rules / z-score thresholds (senior tier).
#
import pandas as pd

df.describe()                                # numeric only
df.describe(include="all")                   # numeric + categorical
df.describe(include="object")                # string-only summary

# Tail percentiles surface the outliers
df.describe(percentiles=[0.01, 0.05, 0.25, 0.75, 0.95, 0.99])

# Single column drill-down
df["amount"].describe()
df["amount"].skew()                          # > 1 -> right-skewed
df["amount"].kurtosis()                      # > 3 -> heavier tails than normal
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - turn describe into a diagnostic pipeline: flag outliers
#             with the IQR rule, segment numeric distributions by a
#             group column with groupby().describe(), and persist a
#             baseline so future drift can be checked against it.
# STRENGTHS - moves describe from "look at output" to "act on it":
#             outlier flags become column transforms, segmented stats
#             reveal subgroup effects, baseline files anchor CI checks.
# WEAKNESSES- IQR is not robust to tiny groups; baselines drift in
#             real systems and need maintenance; over-segmenting
#             (groupby on 5 columns) explodes the output.
#
import pandas as pd

# 1. IQR-based outlier flag — turn describe quartiles into a mask
def outlier_mask(s: pd.Series, k: float = 1.5) -> pd.Series:
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = q3 - q1
    return (s < q1 - k * iqr) | (s > q3 + k * iqr)

df["amount_outlier"] = outlier_mask(df["amount"])
df["amount_outlier"].sum()                   # how many

# 2. Segmented summaries — describe per group
df.groupby("region", observed=True)[["amount", "score"]].describe()

# 3. Persist a baseline for drift checks
baseline = df.describe(include="all")
# baseline.to_parquet("snapshots/2026-04.parquet")
# later: pd.testing.assert_frame_equal(baseline, current, atol=...)

# 4. Quick visual gut-check — keep this in EDA notebooks
# df["amount"].hist(bins=50)

# Decision rule:
#   Default numeric summary                     -> df.describe()
#   Include object/string columns               -> df.describe(include="all")
#   Only categoricals                            -> df.describe(include="category")
#   Custom percentiles                            -> percentiles=[.05, .5, .95]
#   Robust to outliers                            -> use .quantile([.01, .99]) explicitly
#   Time series (datetime)                        -> describe(datetime_is_numeric=True)
#   Group-wise summary                            -> df.groupby(g).describe()
#   Profile a whole dataset                       -> ydata-profiling / sweetviz, not describe
#
# Anti-pattern: trusting describe() output as a normality / quality check
#   describe() reports mean and std even for skewed or bimodal data — meaningless
#   for income, file sizes, latencies. Pair with .skew() / .kurt() and a histogram
#   before drawing conclusions. For categorical data, describe() shows top/freq
#   but hides distribution; use .value_counts(normalize=True).
```

## Decision Rule

```text
Default numeric summary                     -> df.describe()
Include object/string columns               -> df.describe(include="all")
Only categoricals                            -> df.describe(include="category")
Custom percentiles                            -> percentiles=[.05, .5, .95]
Robust to outliers                            -> use .quantile([.01, .99]) explicitly
Time series (datetime)                        -> describe(datetime_is_numeric=True)
Group-wise summary                            -> df.groupby(g).describe()
Profile a whole dataset                       -> ydata-profiling / sweetviz, not describe
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting describe() output as a normality / quality check
>   describe() reports mean and std even for skewed or bimodal data — meaningless
>   for income, file sizes, latencies. Pair with .skew() / .kurt() and a histogram
>   before drawing conclusions. For categorical data, describe() shows top/freq
>   but hides distribution; use .value_counts(normalize=True).

## Tips

- Compare min/max to 25th/75th percentiles — large gaps indicate outliers
- `include="all"` shows top/freq for categoricals alongside numeric stats
- A mean much larger than the median signals right-skewed data with outliers
- Custom percentiles like `.01` and `.99` reveal extreme values hidden by default quartiles

## Common Mistake

> [!warning] Trusting describe() without checking for outliers — a max of 999999 when everything else is below 100 will skew mean/std without being obvious at a glance.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
df.describe()
df.describe(include='all')
df.describe(include='object')   # string columns only
```

**Senior:**
```python
df['amount'].hist(bins=50)   # visual check
```

## See Also

- [[Sections/pandas/inspection/info|.info() (Pandas)]]
- [[Sections/pandas/inspection/value-counts|.value_counts() (Pandas)]]
- [[Sections/pandas/inspection/head-tail|.head() / .tail() (Pandas)]]
- [[Sections/pandas/inspection/sample|.sample() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

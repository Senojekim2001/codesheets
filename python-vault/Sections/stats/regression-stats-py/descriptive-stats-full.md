---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "descriptive-stats-full"
title: "pandas.describe(), groupby stats"
category: "Data Summaries"
subtitle: "Full summary statistics by group"
signature_short: "df.describe(), df.groupby().agg()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pandas.describe(), groupby stats"
  - "descriptive-stats-full"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/data-summaries"
  - "tier/tiered"
---

# pandas.describe(), groupby stats

> Full summary statistics by group

## Overview

pandas describe() provides count, mean, std, min, quartiles, max. groupby enables statistics by group. agg() applies multiple functions.

## Signature

```python
df.describe(), df.groupby().agg()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - df.describe() and df.groupby('g').describe()
# STRENGTHS - The two one-liners that summarize 80% of EDA
# WEAKNESSES- No custom aggregations, no per-group correlations
#
import pandas as pd

df = pd.DataFrame({
    "group":  list("AAABBBCCC"),
    "age":    [25, 30, 35, 28, 33, 40, 45, 50, 55],
    "income": [40, 50, 55, 45, 60, 70, 80, 90, 100],
})

print(df.describe())                                  # numeric columns only
print(df.groupby("group")[["age", "income"]].describe())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Named aggregations (no MultiIndex columns), per-group quantiles, observed=True
# STRENGTHS - The 80%-case shape that produces clean, ungappy outputs
# WEAKNESSES- No window functions, no robust spread metrics
#
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
df = pd.DataFrame({
    "group":  rng.choice(list("ABC"), 200),
    "age":    rng.normal(35, 10, 200),
    "income": rng.normal(60_000, 15_000, 200),
})

# Named aggregations -> flat columns, easy to merge / plot afterwards
summary = df.groupby("group", observed=True).agg(
    n          =("age",    "size"),
    age_mean   =("age",    "mean"),
    age_std    =("age",    "std"),
    inc_median =("income", "median"),
    inc_iqr    =("income", lambda s: s.quantile(0.75) - s.quantile(0.25)),
)
print(summary)

# Quantiles per group (long form)
print(df.groupby("group", observed=True)
        [["age", "income"]]
        .quantile([0.25, 0.5, 0.75])
        .unstack(level=-1))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Robust summaries, missing-aware counts, leakage-safe rolling stats, schema check
# STRENGTHS - The patterns that prevent EDA from misleading the analysis
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(0)
df = pd.DataFrame({
    "group":  rng.choice(list("ABC"), 500),
    "age":    rng.normal(35, 10, 500),
    "income": rng.lognormal(11, 0.4, 500),                        # right-skewed
})
df.loc[df.sample(50, random_state=0).index, "income"] = np.nan    # 10% missing

# 1) Always count non-null vs total — describe() hides which columns have missing data
print(df.agg(["count", "size", lambda s: s.isna().sum()])
        .rename(index={"<lambda>": "n_missing"}))

# 2) Robust spread that survives outliers
def robust_summary(s):
    s = s.dropna()
    return pd.Series({
        "n":      len(s),
        "median": s.median(),
        "iqr":    s.quantile(0.75) - s.quantile(0.25),
        "mad":    stats.median_abs_deviation(s, scale="normal"),
    })
print(df.groupby("group", observed=True)["income"].apply(robust_summary).unstack())

# 3) Leakage-safe rolling stats for time-series-style data — closed='left' or shift(1)
ts = df.assign(t=range(len(df))).sort_values("t")
ts["income_rolling_mean_lag"] = (ts["income"]
                                   .shift(1)                       # don't include current row
                                   .rolling(20, min_periods=5)
                                   .mean())

# 4) Schema check before any analysis — catches dtype regressions cheaply
expected = {"group": "object", "age": "float64", "income": "float64"}
got      = {c: str(t) for c, t in df.dtypes.items()}
assert got == expected, (got, expected)

# Decision rule:
#   quick EDA                              -> df.describe() + groupby().describe()
#   structured report / dashboard           -> named aggregations into a flat frame
#   skewed / heavy-tailed columns           -> median + IQR + MAD, not mean + std
#   missing-data audit                       -> count vs size; never trust mean if count drops
#   time-series-like rolling stats           -> shift(1) or closed='left' to prevent leakage
#   categorical groupby                      -> observed=True (ignore unused categories)
#
# Anti-pattern: reporting df.mean() and df.std() on long-tailed financial data
#   Means and SDs lie about typical values when the distribution is skewed.
#   Report median + IQR (or MAD) for income, prices, sizes, latencies — anything
#   that cant go negative and has a long tail.
```

## Decision Rule

```text
quick EDA                              -> df.describe() + groupby().describe()
structured report / dashboard           -> named aggregations into a flat frame
skewed / heavy-tailed columns           -> median + IQR + MAD, not mean + std
missing-data audit                       -> count vs size; never trust mean if count drops
time-series-like rolling stats           -> shift(1) or closed='left' to prevent leakage
categorical groupby                      -> observed=True (ignore unused categories)
```

## Anti-Pattern

> [!warning] Anti-pattern
> reporting df.mean() and df.std() on long-tailed financial data
>   Means and SDs lie about typical values when the distribution is skewed.
>   Report median + IQR (or MAD) for income, prices, sizes, latencies — anything
>   that cant go negative and has a long tail.

## Tips

- describe() includes count (non-null), so reveals missing values
- groupby().agg() flexible; pass dict for group-specific aggregations
- Use lambda functions for custom aggregations not in standard library

## Common Mistake

> [!warning] Not checking data types before aggregation; cast properly first.

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

- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

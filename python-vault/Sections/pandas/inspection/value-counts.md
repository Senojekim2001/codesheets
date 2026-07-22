---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "value-counts"
title: ".value_counts()"
category: "Inspection"
subtitle: "Frequency table for categorical columns"
signature_short: "df[\"col\"].value_counts(normalize=False, dropna=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".value_counts()"
  - "value-counts"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .value_counts()

> Frequency table for categorical columns

## Overview

value_counts() returns a Series of value frequencies, sorted descending. normalize=True gives proportions. dropna=False includes NaN. Use it to understand cardinality and spot data quality issues.

## Signature

```python
df["col"].value_counts(normalize=False, dropna=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest call: counts per unique value, sorted
#             descending. Run it on any categorical-looking column.
# STRENGTHS - one line gives a frequency table that .unique() can't —
#             both the distinct values and their counts in one go.
# WEAKNESSES- silently drops NaN by default (you may not realize you
#             have nulls); doesn't show proportions or two-variable
#             relationships.
#
import pandas as pd

df["city"].value_counts()
# New York    450
# Chicago     280
# Houston     150
# Name: city, dtype: int64
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: normalize=True for proportions,
#             dropna=False to surface nulls, head(N) for the top-N
#             pattern, and pd.crosstab for two-variable frequencies.
# STRENGTHS - matches the day-to-day EDA workflow; dropna=False is the
#             single most useful option people forget; crosstab is
#             the natural step up to two variables.
# WEAKNESSES- doesn't handle binned numeric counts, weighted counts,
#             or grouped value_counts within categories — those are
#             senior-tier needs.
#
import pandas as pd

# Counts and percentages
df["city"].value_counts()
df["city"].value_counts(normalize=True).mul(100).round(1)

# Always surface nulls — easy to miss otherwise
df["city"].value_counts(dropna=False)

# Top-N pattern
df["city"].value_counts().head(10)

# Two variables — crosstab
pd.crosstab(df["city"], df["status"])
pd.crosstab(df["city"], df["status"], normalize="index")    # row %

# Cardinality sweep before any modeling
df.nunique()
(df.nunique() / len(df) < 0.5).sum()        # category-dtype candidates
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - tier-strength patterns: bin numeric columns then count,
#             value_counts inside groupby for nested distributions,
#             and weighted counts via groupby.sum() for "frequency
#             weighted by amount" questions.
# STRENGTHS - extends value_counts beyond categorical strings to
#             continuous data via cut/qcut; per-group distributions
#             reveal segment-specific patterns; weighted counts are
#             the right answer to "what fraction of revenue / risk /
#             impact each value represents".
# WEAKNESSES- pd.cut bins are inclusive on the right (off-by-one
#             surprises); groupby+value_counts() can be slow on huge
#             frames — pre-aggregate when you can.
#
import pandas as pd

# 1. Binned counts of a numeric column
bins = pd.cut(df["age"], bins=[0, 18, 30, 50, 80])
bins.value_counts().sort_index()

# 2. Per-group distributions — value_counts inside groupby
df.groupby("region", observed=True)["status"].value_counts(normalize=True)
# region   status
# WEST     active     0.62
#          churned    0.30
#          pending    0.08
# EAST     ...

# 3. Weighted counts — "by revenue", not "by row"
weighted = (df.groupby("city", observed=True)["amount"]
              .sum()
              .sort_values(ascending=False))
weighted_pct = weighted / weighted.sum()

# 4. Top-N + collapse the tail into "Other" — common for plotting
top = df["city"].value_counts().nlargest(10).index
df["city_top"] = df["city"].where(df["city"].isin(top), other="Other")

# Decision rule:
#   Frequency table, descending                 -> s.value_counts()
#   Proportions instead of counts                -> normalize=True
#   Include NaN counts                            -> dropna=False
#   Bucketed numeric column                       -> bins=N (auto pd.cut equivalent)
#   Sort by index instead of count                -> .value_counts().sort_index()
#   Top-N only                                    -> .value_counts().head(N)
#   Multi-column combos                           -> df.value_counts(["a","b"]) (pandas 1.1+)
#   Group-aware                                   -> df.groupby(g)[col].value_counts()
#
# Anti-pattern: value_counts() with dropna default on data you suspect has NaNs
#   value_counts(dropna=True) (the default) silently hides null rows — your "100%
#   coverage" claim ignores them. Always check df[col].isna().sum() alongside
#   value_counts, or pass dropna=False when reporting frequencies.
```

## Decision Rule

```text
Frequency table, descending                 -> s.value_counts()
Proportions instead of counts                -> normalize=True
Include NaN counts                            -> dropna=False
Bucketed numeric column                       -> bins=N (auto pd.cut equivalent)
Sort by index instead of count                -> .value_counts().sort_index()
Top-N only                                    -> .value_counts().head(N)
Multi-column combos                           -> df.value_counts(["a","b"]) (pandas 1.1+)
Group-aware                                   -> df.groupby(g)[col].value_counts()
```

## Anti-Pattern

> [!warning] Anti-pattern
> value_counts() with dropna default on data you suspect has NaNs
>   value_counts(dropna=True) (the default) silently hides null rows — your "100%
>   coverage" claim ignores them. Always check df[col].isna().sum() alongside
>   value_counts, or pass dropna=False when reporting frequencies.

## Tips

- `dropna=False` is important — easy to miss nulls in categorical columns otherwise
- `normalize=True` then `.mul(100).round(1)` gives clean percentages
- `df.nunique()` gives cardinality for all columns at once — use before deciding which to convert to `category`
- Pair with `pd.crosstab(df.a, df.b)` for two-variable frequency tables

## Common Mistake

> [!warning] Using `df["col"].unique()` to count categories — that returns the values, not counts. Use `df["col"].value_counts()` for counted frequencies.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df['city'].value_counts()
df['city'].value_counts(normalize=True).mul(100).round(1)
df['city'].value_counts(dropna=False)
```

**Senior:**
```python
(df.nunique() / len(df) < 0.5).sum()  # columns good for 'category' dtype
```

## See Also

- [[Sections/pandas/inspection/info|.info() (Pandas)]]
- [[Sections/pandas/inspection/describe|.describe() (Pandas)]]
- [[Sections/pandas/inspection/head-tail|.head() / .tail() (Pandas)]]
- [[Sections/pandas/inspection/sample|.sample() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

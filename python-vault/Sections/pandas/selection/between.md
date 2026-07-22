---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "between"
title: ".between()"
category: "Selection"
subtitle: "Inclusive range check — cleaner than >= and <= combined"
signature_short: "df[df[\"col\"].between(left, right, inclusive=\"both\")]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".between()"
  - "between"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/selection"
  - "tier/tiered"
---

# .between()

> Inclusive range check — cleaner than >= and <= combined

## Overview

.between() checks if values fall within [left, right] inclusive by default. Much cleaner than writing `(df["col"] >= lo) & (df["col"] <= hi)`. Works on numeric, datetime, and string columns.

## Signature

```python
df[df["col"].between(left, right, inclusive="both")]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - "value in a range" as one method call instead of two
#             chained comparisons.
# STRENGTHS - reads more like English than (col >= a) & (col <= b);
#             defaults to inclusive on both ends, matching most user
#             expectations.
# WEAKNESSES- doesn't yet make the inclusive-by-default behavior
#             explicit (the most common surprise) or show datetime
#             ranges.
#
import pandas as pd

df[df["age"].between(18, 65)]            # 18 <= age <= 65 (inclusive)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: control inclusivity at each end,
#             apply between to datetime columns, assign a boolean flag,
#             combine with isin via &.
# STRENGTHS - covers the patterns you reach for daily; the inclusive=
#             argument is the single most useful option to know.
# WEAKNESSES- still skips edge cases (NaN, mismatched dtypes, sorting
#             order that affects datetime parsing) — senior tier.
#
import pandas as pd

# Inclusivity per end
df[df["score"].between(80, 100, inclusive="both")]      # [80, 100]
df[df["score"].between(80, 100, inclusive="left")]      # [80, 100)
df[df["score"].between(80, 100, inclusive="right")]     # (80, 100]
df[df["score"].between(80, 100, inclusive="neither")]   # (80, 100)

# Datetime range — strings or Timestamps both work
df[df["date"].between("2024-01-01", "2024-06-30")]

# Flag column
df["is_adult"] = df["age"].between(18, 65)

# Combine with isin
df[df["age"].between(25, 45) & df["city"].isin(["NYC", "LA"])]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade range filtering: ensure dtypes are
#             aligned (datetime/Timestamp ambiguity bites otherwise),
#             handle NaN explicitly (between on NaN returns False),
#             and consider pd.cut when the same buckets are reused
#             across the pipeline.
# STRENGTHS - prevents the "date column was object, between silently
#             did string compare" failure mode; explicit NaN handling
#             keeps row counts honest; pd.cut centralizes the bin
#             definitions.
# WEAKNESSES- pd.cut shifts the mental model from filter to label;
#             timezone-aware datetime columns need both bounds to be
#             tz-aware (or both naive); inclusive= can't differ per
#             row, so dynamic bounds need a manual mask.
#
import pandas as pd

# 1. Align dtypes first — between on object-dtype "dates" silently
#    falls back to lexicographic string comparison
df["date"] = pd.to_datetime(df["date"])
mask = df["date"].between(pd.Timestamp("2024-01-01"),
                          pd.Timestamp("2024-06-30"))
df[mask]

# 2. NaN handling — between(NaN) is False, so rows with null bounds
#    drop out silently
nan_mask = df["score"].isna()
in_range = df["score"].between(80, 100)
keep = in_range | nan_mask                 # decide explicitly

# 3. Reusable buckets via pd.cut — when the same edges power filters,
#    aggregations, and plots
edges  = [0, 18, 30, 50, 80]
labels = ["minor", "young_adult", "adult", "senior"]
df["age_band"] = pd.cut(df["age"], bins=edges, labels=labels, right=True)
df.groupby("age_band", observed=True)["score"].mean()

# 4. Dynamic per-row bounds — between only takes scalars, so use & directly
df[(df["score"] >= df["min_score"]) & (df["score"] <= df["max_score"])]

# Decision rule:
#   Inclusive range                             -> s.between(lo, hi) (both ends)
#   Half-open                                   -> s.between(lo, hi, inclusive="left") (3.0+ form)
#   Exclusive range                              -> s.between(lo, hi, inclusive="neither")
#   Datetime range                               -> works directly on datetime Series
#   With NaN handling                             -> NaN is excluded automatically
#   Negate                                       -> ~s.between(...)
#   Need a multi-column range                     -> chain two between() with &
#   Looking for "outside" range                   -> ~s.between() is clearer than (s<lo)|(s>hi)
#
# Anti-pattern: (s >= lo) & (s <= hi) when between() exists
#   Functionally equivalent for closed ranges, but between() reads better and
#   exposes the inclusive= parameter for half-open ranges (important for
#   percentile cuts where the boundary semantic matters). Use between().
```

## Decision Rule

```text
Inclusive range                             -> s.between(lo, hi) (both ends)
Half-open                                   -> s.between(lo, hi, inclusive="left") (3.0+ form)
Exclusive range                              -> s.between(lo, hi, inclusive="neither")
Datetime range                               -> works directly on datetime Series
With NaN handling                             -> NaN is excluded automatically
Negate                                       -> ~s.between(...)
Need a multi-column range                     -> chain two between() with &
Looking for "outside" range                   -> ~s.between() is clearer than (s<lo)|(s>hi)
```

## Anti-Pattern

> [!warning] Anti-pattern
> (s >= lo) & (s <= hi) when between() exists
>   Functionally equivalent for closed ranges, but between() reads better and
>   exposes the inclusive= parameter for half-open ranges (important for
>   percentile cuts where the boundary semantic matters). Use between().

## Tips

- `between()` is inclusive on both ends by default — use `inclusive=` to control endpoints
- Works on datetime columns — pass ISO strings or Timestamps directly
- Cleaner than two separate comparison conditions chained with `&`
- For `pd.cut()` binning based on the same ranges, the boundaries match when `right=True` (default)

## Common Mistake

> [!warning] Forgetting that `between()` is inclusive by default. `df["score"].between(0, 60)` includes both 0 and 60. Use `inclusive="neither"` or `inclusive="left"` if you need exclusive endpoints.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df[df['age'].between(18, 65)]
df[df['score'].between(80, 100)]
df[df['score'].between(80, 100, inclusive='left')]   # [80, 100)
```

**Senior:**
```python
df[df['age'].between(25, 45) & df['city'].isin(['NYC', 'LA'])]
```

## See Also

- [[Sections/pandas/selection/loc|.loc[] (Pandas)]]
- [[Sections/pandas/selection/iloc|.iloc[] (Pandas)]]
- [[Sections/pandas/selection/query|.query() (Pandas)]]
- [[Sections/pandas/selection/isin|.isin() (Pandas)]]
- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

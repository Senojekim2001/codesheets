---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "transform"
title: ".transform()"
category: "Transform"
subtitle: "Add group statistics back to every row — same shape as input"
signature_short: "df.groupby(\"col\")[\"val\"].transform(\"mean\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".transform()"
  - "transform"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .transform()

> Add group statistics back to every row — same shape as input

## Overview

transform() computes a per-group statistic but returns a Series with the same index as the original DataFrame — so you can add it back as a new column. Unlike agg(), it does not collapse rows.

## Signature

```python
df.groupby("col")["val"].transform("mean")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - add a group statistic back to every row. The
#             return is the same shape as the original column.
# STRENGTHS - the smallest possible "feature engineering inside
#             a group" — every row now knows its dept's average.
# WEAKNESSES- doesn't yet contrast transform with agg (different
#             output shapes) or show the higher-value patterns
#             (z-score, cumulative, normalize-by-total).
#
import pandas as pd

df["dept_avg"] = df.groupby("dept")["salary"].transform("mean")
# every row in the same dept gets the same dept_avg
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday transform recipes: percentile rank,
#             z-score, cumulative sums, normalize-by-total. End
#             with the agg-vs-transform shape comparison so the
#             distinction sticks.
# STRENGTHS - covers the patterns transform was designed for —
#             feature engineering against a group-level baseline
#             without a join.
# WEAKNESSES- doesn't address the "string aggregator is faster
#             than lambda" rule or the include_groups=False habit
#             that's becoming the default — senior tier covers both.
#
import pandas as pd

g = df.groupby("dept")["salary"]

# Percentile rank within group
df["rank"]    = g.transform("rank", pct=True)

# Z-score within group (lambda — see senior tier for the fast form)
df["z"]       = g.transform(lambda s: (s - s.mean()) / s.std())

# Cumulative sum within group (sales by product over time)
df["cum_sales"] = (df.sort_values(["product", "date"])
                     .groupby("product")["sales"]
                     .transform("cumsum"))

# Normalize by group total
df["pct_of_dept"] = df["salary"] / df.groupby("dept")["salary"].transform("sum")

# Shape contrast — agg collapses, transform broadcasts back
df.groupby("dept")["salary"].agg("mean")        # one row per dept
df.groupby("dept")["salary"].transform("mean")  # one row per ORIGINAL row
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production transform: prefer string aggregators for
#             10-100x speedup on large frames, use the GroupBy
#             accessors (g.cumsum, g.rolling) directly when
#             available, and treat group-relative features as
#             pipeline-shaped (sort first, document the "within
#             group, ordered by time" assumption).
# STRENGTHS - string aggregators hit the Cython fast path; direct
#             GroupBy accessors avoid lambda overhead entirely;
#             explicit sort + transform makes time-aware features
#             reproducible.
# WEAKNESSES- direct accessors don't exist for every operation
#             (custom percentiles still need a lambda); transform
#             with a lambda that returns a Series can be subtly
#             slower than groupby + reindex; sort-then-transform
#             has to be repeated whenever group ordering matters.
#
import pandas as pd

# 1. String aggregators >> lambda for built-ins
df["g_mean"] = df.groupby("dept")["salary"].transform("mean")     # fast
# Lambda equivalent (slower):
df["g_mean_slow"] = df.groupby("dept")["salary"].transform(lambda s: s.mean())

# 2. Direct GroupBy accessors are the fast path for cumulative / rolling
df = df.sort_values(["product", "date"])
g = df.groupby("product")["sales"]
df["cumsum"]    = g.cumsum()
df["roll_7"]    = g.rolling(7, min_periods=1).mean().reset_index(level=0, drop=True)
df["pct_chg"]   = g.pct_change()

# 3. Z-score within group — fast path uses two transforms
gs = df.groupby("dept")["salary"]
df["z"] = (df["salary"] - gs.transform("mean")) / gs.transform("std")

# 4. include_groups=False (pandas 2.2+) — modern groupby.apply default
top = (df.groupby("dept")
         .apply(lambda gr: gr.assign(rk=gr["salary"].rank(ascending=False)),
                include_groups=False))

# Decision rule:
#   Per-group statistic broadcast back to rows  -> df.groupby(g)["x"].transform("mean")
#   Returns SAME shape as input                  -> agg returns N rows; transform returns len(df)
#   Multiple transforms                          -> transform(["mean","std"]) -> wide result
#   Standardization within group                  -> transform(lambda x: (x - x.mean()) / x.std())
#   Cumulative                                  -> .transform("cumsum") (per-group cumsum)
#   Filling NaN by group mean                    -> transform("mean") then fillna
#   Counts per group                             -> .transform("size") or "count"
#   Lag/lead per group                            -> groupby(g)["x"].shift()
#
# Anti-pattern: groupby + apply when transform fits
#   apply returns groups assembled however the function returns them — easy to
#   end up with a MultiIndex you didn't want. transform always returns the
#   same shape and index as the input — the right tool for "broadcast group
#   stat back to rows" cases (z-scoring, group-mean fillna, % of group total).
```

## Decision Rule

```text
Per-group statistic broadcast back to rows  -> df.groupby(g)["x"].transform("mean")
Returns SAME shape as input                  -> agg returns N rows; transform returns len(df)
Multiple transforms                          -> transform(["mean","std"]) -> wide result
Standardization within group                  -> transform(lambda x: (x - x.mean()) / x.std())
Cumulative                                  -> .transform("cumsum") (per-group cumsum)
Filling NaN by group mean                    -> transform("mean") then fillna
Counts per group                             -> .transform("size") or "count"
Lag/lead per group                            -> groupby(g)["x"].shift()
```

## Anti-Pattern

> [!warning] Anti-pattern
> groupby + apply when transform fits
>   apply returns groups assembled however the function returns them — easy to
>   end up with a MultiIndex you didn't want. transform always returns the
>   same shape and index as the input — the right tool for "broadcast group
>   stat back to rows" cases (z-scoring, group-mean fillna, % of group total).

## Tips

- transform() is the key pattern for adding group stats back to the original DataFrame
- The result is always aligned with the original index — safe to assign directly as a column
- Use transform for feature engineering in ML: group mean, rank, z-score, cumsum
- If the lambda returns a scalar, transform broadcasts it to every row in the group

## Common Mistake

> [!warning] Using `.agg()` when you need the result aligned with the original DataFrame. agg() collapses to one row per group. transform() keeps the original shape.

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

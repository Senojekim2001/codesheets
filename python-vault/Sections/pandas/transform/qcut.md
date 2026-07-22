---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "qcut"
title: "pd.qcut()"
category: "Transform"
subtitle: "Each bin gets the same number of observations"
signature_short: "pd.qcut(series, q=4, labels=[\"Q1\",\"Q2\",\"Q3\",\"Q4\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.qcut()"
  - "qcut"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# pd.qcut()

> Each bin gets the same number of observations

## Overview

pd.qcut() bins by quantile — each bin contains approximately the same number of observations. Use it for percentile-based grouping, decile scoring, and rankings. Unlike pd.cut(), the bin edges are determined by the data distribution.

## Signature

```python
pd.qcut(series, q=4, labels=["Q1","Q2","Q3","Q4"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - bin into N equal-frequency buckets. Each bucket
#             gets the same number of observations.
# STRENGTHS - the right tool for "split into quartiles" or
#             "decile-rank" tasks; one call.
# WEAKNESSES- doesn't yet address ties, retbins, or the cut-vs-
#             qcut decision rule.
#
import pandas as pd

df["quartile"] = pd.qcut(df["score"], q=4, labels=["Q1", "Q2", "Q3", "Q4"])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday qcut surface: deciles, raw percentile
#             intervals, duplicates="drop" for tied values, and
#             retbins to surface the actual quantile boundaries.
# STRENGTHS - deciles are the core qcut use case; duplicates="drop"
#             is the fix for the most common qcut error (too many
#             ties on a boundary).
# WEAKNESSES- doesn't yet contrast qcut with rank(pct=True) (a
#             continuous percentile rank with no binning) or
#             address the "fit on train, apply to test" production
#             pattern — senior tier.
#
import pandas as pd

# Deciles
df["decile"] = pd.qcut(df["score"], q=10,
                        labels=[f"D{i}" for i in range(1, 11)])

# Raw percentile intervals (no labels) — useful for diagnostics
df["pct_bin"] = pd.qcut(df["score"], q=100)

# Tied values land on a bin edge -> qcut can fail. duplicates="drop"
# silently merges adjacent edges to make it work.
df["q"] = pd.qcut(df["score"], q=4, duplicates="drop")

# Recover the actual quantile boundaries qcut chose
_, edges = pd.qcut(df["score"], q=4, retbins=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production qcut: fit edges on training data and
#             apply to test (consistent buckets across data
#             splits), prefer rank(pct=True) when you want a
#             continuous percentile rather than discrete bins,
#             and use the cut-vs-qcut rule deliberately.
# STRENGTHS - persisted edges keep "top 10%" stable as new data
#             flows in; rank(pct=True) avoids tie-edge headaches
#             entirely; the decision rule clarifies which tool
#             belongs to each problem.
# WEAKNESSES- "fit on train, apply to test" requires saving the
#             edges (artifact infrastructure); rank() returns a
#             continuous value, not a categorical bucket;
#             duplicates="drop" produces FEWER bins than asked
#             for, which can surprise downstream code.
#
import pandas as pd
import numpy as np
import json

# 1. Fit qcut edges on TRAIN, apply to TEST with pd.cut
_, train_edges = pd.qcut(train["score"], q=10, retbins=True, duplicates="drop")
labels = [f"D{i}" for i in range(1, len(train_edges))]

with open("artifacts/score_deciles.json", "w") as f:
    json.dump({"edges": train_edges.tolist(), "labels": labels}, f)

# At inference / on test data — use cut() with the saved edges
spec = json.load(open("artifacts/score_deciles.json"))
test["decile"] = pd.cut(test["score"],
                         bins=spec["edges"],
                         labels=spec["labels"],
                         include_lowest=True)

# 2. Continuous percentile rank — sometimes better than discrete bins
df["pct_rank"] = df["score"].rank(pct=True)            # in [0, 1]
df["top_decile"] = df["pct_rank"] >= 0.9

# 3. Ties and duplicates — pick the right strategy
#    duplicates="raise" - default; explodes on tie-heavy data
#    duplicates="drop"  - silently merges -> fewer than q bins
#    Better: rank-then-bin
df["score_dense"] = df["score"].rank(method="first")   # break ties by row order
df["q4"] = pd.qcut(df["score_dense"], q=4,
                    labels=["Q1", "Q2", "Q3", "Q4"])

# Decision rule:
#   need DISCRETE buckets, equal counts per bin    -> qcut(q=)
#   need DISCRETE buckets, equal width per bin     -> cut(bins=)
#   need CONTINUOUS percentile / rank score        -> rank(pct=True)
#   need stable buckets across data splits         -> qcut on train,
#                                                     persist edges,
#                                                     cut on test

# Anti-pattern: pd.qcut on a column with many ties at the boundary
#   qcut tries to make equal-count bins, but ties cluster and can throw
#   "Bin edges must be unique". Pass duplicates="drop" to merge collapsed bins,
#   or rank the data first (s.rank(method="first")). Choose deliberately —
#   "drop" silently reduces the number of returned categories.
```

## Decision Rule

```text
need DISCRETE buckets, equal counts per bin    -> qcut(q=)
need DISCRETE buckets, equal width per bin     -> cut(bins=)
need CONTINUOUS percentile / rank score        -> rank(pct=True)
need stable buckets across data splits         -> qcut on train,
                                                  persist edges,
                                                  cut on test
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.qcut on a column with many ties at the boundary
>   qcut tries to make equal-count bins, but ties cluster and can throw
>   "Bin edges must be unique". Pass duplicates="drop" to merge collapsed bins,
>   or rank the data first (s.rank(method="first")). Choose deliberately —
>   "drop" silently reduces the number of returned categories.

## Tips

- `pd.qcut()` is correct for percentile-based scoring — `pd.cut()` can leave bins nearly empty
- `duplicates="drop"` handles datasets where many values are identical (common in integer scores)
- The bin labels do not indicate how many obs are in each bin — use `value_counts()` to check
- For a running percentile rank without binning: `df["score"].rank(pct=True)`
- For stable buckets across train/test splits, qcut on train, persist the returned `retbins=` edges, then pd.cut on test — re-fitting per split silently re-grades observations

## Common Mistake

> [!warning] Using `pd.qcut()` on a column with many duplicate values. If too many values fall on the same quantile boundary, qcut raises ValueError. Use `duplicates="drop"` to handle this.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

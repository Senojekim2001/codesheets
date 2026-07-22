---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "cut"
title: "pd.cut()"
category: "Transform"
subtitle: "You define the bin edges — equal-width buckets"
signature_short: "pd.cut(series, bins=[0,18,65,100], labels=[\"youth\",\"adult\",\"senior\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.cut()"
  - "cut"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# pd.cut()

> You define the bin edges — equal-width buckets

## Overview

pd.cut() bins values into intervals you define. The intervals are equal-width only if you pass an integer for bins — for custom boundaries, pass a list. Returns a Categorical Series.

## Signature

```python
pd.cut(series, bins=[0,18,65,100], labels=["youth","adult","senior"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - bin a numeric column with custom edges and named
#             labels. The result is a Categorical Series.
# STRENGTHS - reads exactly like the spec — "0-18 is youth,
#             18-35 is young adult, ...".
# WEAKNESSES- doesn't yet show right=True semantics, retbins,
#             ordered categoricals, or auto-edge binning.
#
import pandas as pd

df["age_group"] = pd.cut(
    df["age"],
    bins=[0, 18, 35, 60, 100],
    labels=["youth", "young_adult", "adult", "senior"],
)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday cut surface: right= for endpoint
#             choice, retbins to recover the actual edges, auto
#             N equal-width bins, ordered categorical for
#             comparison, observed=True in groupby.
# STRENGTHS - covers what cut looks like in real code: grading
#             scales, age groups, deciding whether the upper
#             edge is inclusive (test scores) or exclusive
#             (numeric ranges).
# WEAKNESSES- doesn't surface the cut-vs-qcut decision rule or
#             the production "save the edges to apply to a new
#             dataset" pattern — senior tier.
#
import pandas as pd
from pandas.api.types import CategoricalDtype

# Right-inclusive intervals (default): (a, b]
df["grade"] = pd.cut(
    df["score"],
    bins   = [0, 60, 70, 80, 90, 100],
    labels = ["F", "D", "C", "B", "A"],
    right  = True,                              # 90 -> B (not A)
)

# Auto N equal-width bins; retbins gives you the edges
df["bucket"], edges = pd.cut(df["score"], bins=5, retbins=True)

# Ordered categorical -> comparison and sort order
order = CategoricalDtype(["F", "D", "C", "B", "A"], ordered=True)
df["grade"] = df["grade"].astype(order)
df[df["grade"] >= "B"]

# Use the binned column in groupby
df.groupby("grade", observed=True)["salary"].mean()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production binning: persist the cut edges from
#             training so the same bins can be applied to test /
#             new data, choose right= deliberately based on the
#             metric semantics (scores vs ranges), and pick
#             cut vs qcut on purpose.
# STRENGTHS - persisted edges prevent the "different bins on
#             prod data" bug; explicit right= documents the
#             boundary policy; the cut-vs-qcut decision rule
#             stops the most common "my buckets are nearly empty"
#             complaint.
# WEAKNESSES- saving edges adds infra (a tiny JSON / pickle next
#             to the model); right=False feels backward in some
#             domains (age "under 18" vs "exactly 18"); cut-vs-
#             qcut is a real choice that depends on whether you
#             care about width or about count.
#
import pandas as pd
import json

# 1. Fit edges on training data, persist, reuse at inference
edges = [0, 60, 70, 80, 90, 100]
labels = ["F", "D", "C", "B", "A"]

with open("artifacts/grade_bins.json", "w") as f:
    json.dump({"edges": edges, "labels": labels}, f)

# At inference time, load and apply the SAME bins
spec = json.load(open("artifacts/grade_bins.json"))
df["grade"] = pd.cut(df["score"], bins=spec["edges"], labels=spec["labels"])

# 2. Endpoint policy — make right= a deliberate choice
# Test scores: right=True -> 90 is a B (boundary belongs to lower bin)
df["grade"] = pd.cut(df["score"], bins=edges, labels=labels, right=True)
# Numeric ranges where the upper edge means "less than": right=False
df["bucket"] = pd.cut([0, 17, 18, 64, 65],
                       bins=[0, 18, 65, 120],
                       labels=["minor", "adult", "senior"],
                       right=False)              # 18 -> "adult", 65 -> "senior"

# 3. Decision rule — cut vs qcut
#    cut(bins=...)   - WIDTH is meaningful (age ranges, score grades)
#    qcut(q=...)     - COUNT is meaningful (deciles, percentile scoring)
#    Symptom of wrong choice: cut leaves bins nearly empty when
#    distribution is skewed; qcut struggles when many values tie.

# 4. Anti-pattern: redefine bins per dataset
#    Means today's "B" student would be tomorrow's "C" if the score
#    distribution shifts. Persist the edges with the model.

# Decision rule:
#   Bin numeric column into N equal-width bins  -> pd.cut(s, bins=N)
#   Custom bin edges                              -> bins=[0, 18, 65, np.inf]
#   Custom labels                                 -> labels=["minor","adult","senior"]
#   Right-open vs right-closed                     -> right=True (default; intervals like (a,b])
#   Need EQUAL-COUNT bins (deciles)                -> pd.qcut, NOT cut
#   Get just the bin edges                         -> retbins=True
#   Treat as categorical                            -> result is Categorical (preserves order)
#   Out-of-range values                              -> become NaN (use include_lowest if first edge matters)
#
# Anti-pattern: pd.cut without watching include_lowest on the boundary
#   By default cut excludes the LOWER edge of the first bin: pd.cut([0,1,2], bins=[0,1,2])
#   gives [NaN, (0,1], (1,2]]. Use include_lowest=True if 0 should fall in the
#   first bin, or set the leftmost edge to -inf for safety.
```

## Decision Rule

```text
Bin numeric column into N equal-width bins  -> pd.cut(s, bins=N)
Custom bin edges                              -> bins=[0, 18, 65, np.inf]
Custom labels                                 -> labels=["minor","adult","senior"]
Right-open vs right-closed                     -> right=True (default; intervals like (a,b])
Need EQUAL-COUNT bins (deciles)                -> pd.qcut, NOT cut
Get just the bin edges                         -> retbins=True
Treat as categorical                            -> result is Categorical (preserves order)
Out-of-range values                              -> become NaN (use include_lowest if first edge matters)
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.cut without watching include_lowest on the boundary
>   By default cut excludes the LOWER edge of the first bin: pd.cut([0,1,2], bins=[0,1,2])
>   gives [NaN, (0,1], (1,2]]. Use include_lowest=True if 0 should fall in the
>   first bin, or set the leftmost edge to -inf for safety.

## Tips

- `right=True` (default) means intervals are `(left, right]` — a score of exactly 90 falls in the 80-90 bin
- `retbins=True` returns the actual bin edges — useful when you let pandas choose them
- Convert to ordered categorical for correct sorting and comparison operators
- `observed=True` in `groupby()` skips empty bin combinations
- Persist the bin edges alongside the model — redefining bins per dataset silently regrades the same observation across splits

## Common Mistake

> [!warning] Using `pd.cut()` when you want equal population per bin. `pd.cut()` gives equal-width intervals — some bins may be nearly empty. Use `pd.qcut()` for equal-frequency bins.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df['age_group'] = pd.cut(
df['age'],
bins   = [0, 18, 35, 60, 100],
```

**Senior:**
```python
df.groupby('grade', observed=True)['salary'].mean()
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

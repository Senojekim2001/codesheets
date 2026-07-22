---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "sort-values"
title: ".sort_values()"
category: "Transform"
subtitle: "Sort rows by column — ascending, descending, or multi-key"
signature_short: "df.sort_values(\"col\", ascending=True, na_position=\"last\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".sort_values()"
  - "sort-values"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .sort_values()

> Sort rows by column — ascending, descending, or multi-key

## Overview

sort_values() sorts rows by the values in one or more columns. Returns a new DataFrame — does not modify in place unless inplace=True. Multi-column sort uses a list of column names and a matching list of ascending flags.

## Signature

```python
df.sort_values("col", ascending=True, na_position="last")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sort by one column, ascending or descending. Always
#             reassign — sort_values returns a new frame.
# STRENGTHS - one line, immediately useful. Reads top-down.
# WEAKNESSES- doesn't yet show multi-column sort, NaN handling, or
#             the "use nlargest for top-N" performance tip.
#
import pandas as pd

df = df.sort_values("age")                       # ascending
df = df.sort_values("age", ascending=False)      # descending
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: multi-column sort with per-key
#             ascending list, NaN positioning, and reset_index after
#             sort to get a clean 0-based index. Note that
#             "top-N by column" deserves nlargest, not sort + head.
# STRENGTHS - covers what sort actually looks like in real code:
#             a primary and a secondary key, NaN handled deliberately,
#             clean index for downstream code that uses .iloc.
# WEAKNESSES- doesn't address case-insensitive sorts via key=, or
#             the "stable sort matters when ties are common" rule —
#             senior tier.
#
import pandas as pd

# Multi-column with per-key direction
df = df.sort_values(
    ["dept", "salary"],
    ascending=[True, False],                     # dept ASC, salary DESC
)

# NaN positioning
df = df.sort_values("score", na_position="first")   # NaN at top
df = df.sort_values("score", na_position="last")    # default

# Clean integer index after the sort
df = df.sort_values("age").reset_index(drop=True)

# For "top N by column", prefer nlargest over sort + head
top10 = df.nlargest(10, "salary")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production sort: stable algorithm so original order
#             breaks ties predictably, key= for case-insensitive or
#             custom-key sorting, and an "is the index actually
#             sorted?" check before any range slicing or merge_asof.
# STRENGTHS - stable sort + tie-aware ordering is what real-world
#             ranking code needs; key= avoids the "lower() in a
#             helper column" pattern; verifying monotonicity catches
#             a class of subtle correctness bugs early.
# WEAKNESSES- key= applies the function to every row, so it costs
#             the same as creating a transient column; stable sort
#             is slightly slower than the default for huge frames;
#             monotonic checks add a pass over the index.
#
import pandas as pd

# 1. Stable sort — equal keys keep their previous order
#    Useful when "primary key, then preserve insertion order"
df = df.sort_values("dept", kind="stable")

# 2. Custom comparison via key= — case-insensitive, locale-aware
df = df.sort_values("name", key=lambda s: s.str.lower())

# 3. Verify monotonicity before relying on it
df = df.sort_values("date").reset_index(drop=True)
assert df["date"].is_monotonic_increasing, "date column is not sorted"

# 4. Multi-stage: sort by group, rank within group, then re-sort
df["rank"] = (df.groupby("dept")["salary"]
                .rank(method="dense", ascending=False))
top_per_dept = (df[df["rank"] <= 3]
                  .sort_values(["dept", "rank"])
                  .reset_index(drop=True))

# 5. Anti-pattern: sort_values then iterate by .iloc without
#    reset_index — .iloc is positional but the original index now
#    lives at arbitrary positions, leading to confusing bugs.

# Decision rule:
#   Single column ascending                     -> df.sort_values("x")
#   Single column descending                     -> ascending=False
#   Multi-column with mixed direction             -> by=["a","b"], ascending=[True,False]
#   Stable sort (ties preserve order)             -> kind="mergesort" (stable)
#   In-place                                      -> inplace=True (rare; chains break)
#   Top N efficiently                              -> .nlargest(N, "x") (avoids full sort)
#   Sort by index instead                         -> df.sort_index()
#   Need a custom key function                     -> key=lambda s: s.str.lower()
#
# Anti-pattern: df.sort_values(...).iloc[0] when you want the min
#   You just paid O(n log n) to take one row. df.loc[df.x.idxmin()] is O(n).
#   Same for "top 10": prefer .nlargest(10, col) over sort+head — both are
#   correct, but nlargest uses a heap (O(n log k) vs O(n log n)) and is faster
#   for k << n.
```

## Decision Rule

```text
Single column ascending                     -> df.sort_values("x")
Single column descending                     -> ascending=False
Multi-column with mixed direction             -> by=["a","b"], ascending=[True,False]
Stable sort (ties preserve order)             -> kind="mergesort" (stable)
In-place                                      -> inplace=True (rare; chains break)
Top N efficiently                              -> .nlargest(N, "x") (avoids full sort)
Sort by index instead                         -> df.sort_index()
Need a custom key function                     -> key=lambda s: s.str.lower()
```

## Anti-Pattern

> [!warning] Anti-pattern
> df.sort_values(...).iloc[0] when you want the min
>   You just paid O(n log n) to take one row. df.loc[df.x.idxmin()] is O(n).
>   Same for "top 10": prefer .nlargest(10, col) over sort+head — both are
>   correct, but nlargest uses a heap (O(n log k) vs O(n log n)) and is faster
>   for k << n.

## Tips

- `sort_values()` returns a new DataFrame — the original is unchanged unless `inplace=True`
- After sorting, call `reset_index(drop=True)` if you want a clean 0-based index
- `df.nlargest(n, "col")` is faster than sort + head for getting the top N rows
- Multiple column sort: `ascending=[True, False]` — list must match length of `by=` list

## Common Mistake

> [!warning] Sorting and then iterating by integer position without resetting the index. After sorting, `df.iloc[0]` is still the row with the original index 0, not the smallest sorted value.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.sort_values('age')                        # ascending (default)
df.sort_values('age', ascending=False)       # descending
df.sort_values('name', key=str.lower)        # case-insensitive
```

**Senior:**
```python
df.sort_values('age', inplace=True)
```

## See Also

- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "pivot-table"
title: ".pivot_table()"
category: "Transform"
subtitle: "Long → wide — like an Excel pivot table with aggfunc"
signature_short: "df.pivot_table(values, index, columns, aggfunc=\"mean\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".pivot_table()"
  - "pivot-table"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .pivot_table()

> Long → wide — like an Excel pivot table with aggfunc

## Overview

pivot_table() reshapes data from long to wide format. Rows become the index, unique values of a column become new column headers, and cells are aggregated. fill_value= replaces NaN in the result.

## Signature

```python
df.pivot_table(values, index, columns, aggfunc="mean")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest pivot: one numeric column summed across
#             two categorical axes. Reads exactly like an Excel
#             pivot.
# STRENGTHS - one call goes from long form (one row per
#             observation) to wide cross-tab.
# WEAKNESSES- doesn't yet show fill_value, margins, multiple
#             aggregations, or the pivot vs pivot_table distinction.
#
import pandas as pd

df.pivot_table(values="sales", index="product", columns="region",
               aggfunc="sum")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: fill_value to replace empty
#             cells, margins=True for grand totals, multiple
#             aggfuncs at once, multiple value columns. Note the
#             pivot vs pivot_table difference (duplicates).
# STRENGTHS - covers the patterns you write weekly: a clean
#             cross-tab with row/column totals, several stats in
#             one call, and the "use pivot_table by default" rule.
# WEAKNESSES- doesn't surface the MultiIndex column trap or how
#             to flatten it for downstream code — senior tier.
#
import pandas as pd

# Standard cross-tab with totals and clean zeros
sales_pivot = df.pivot_table(
    values     = "sales",
    index      = "product",
    columns    = "region",
    aggfunc    = "sum",
    fill_value = 0,
    margins    = True,
)

# Multiple stats in one call
multi = df.pivot_table(
    values  = "sales",
    index   = "product",
    aggfunc = ["sum", "mean", "count"],
)

# Multiple value columns — independent pivots merged
both = df.pivot_table(
    values  = ["sales", "units"],
    index   = "product",
    columns = "region",
    aggfunc = "sum",
)

# pivot vs pivot_table:
#   pivot()       - requires unique (index, columns) pairs; raises otherwise
#   pivot_table() - aggregates duplicates with aggfunc=
df.pivot(index="date", columns="product", values="price")    # only if unique
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production pivots: flatten the MultiIndex columns
#             that multi-aggfunc/multi-values produce, set
#             observed=True on categorical pivots, name aggregations
#             with a function dict for self-documenting output, and
#             use crosstab when you only want counts.
# STRENGTHS - flat columns are downstream-friendly (joins, exports,
#             plotting); observed=True prevents the all-categories
#             grid blowup; pd.crosstab is the right tool for pure
#             frequency tables.
# WEAKNESSES- flattening MultiIndex columns loses some structure
#             (joining the levels with "_" is conventional but
#             not universal); observed=True changes the output
#             shape vs older code that relied on every category
#             showing up.
#
import pandas as pd

# 1. Flatten MultiIndex columns produced by multi-aggfunc
multi = df.pivot_table(
    values  = "sales",
    index   = "product",
    columns = "region",
    aggfunc = ["sum", "mean", "count"],
).pipe(lambda p: p.set_axis(
    [f"{stat}_{region}" for stat, region in p.columns], axis=1
))

# 2. observed=True with categorical index/columns
df["region"] = df["region"].astype("category")
clean = df.pivot_table(
    values  = "sales",
    index   = "product",
    columns = "region",
    aggfunc = "sum",
    observed = True,                    # avoid empty all-categories grid
    fill_value = 0,
)

# 3. Pure frequency cross-tab — pd.crosstab is the right hammer
freq = pd.crosstab(df["product"], df["region"], margins=True, normalize="index")

# 4. Decision rule:
#    - one stat, one value column        -> pivot_table is fine
#    - frequency / proportions only      -> pd.crosstab
#    - already aggregated, just reshape  -> pivot()
#    - need long->wide AND aggregation   -> pivot_table()
#    - downstream code wants flat columns-> set_axis() to flatten

# Decision rule:
#   Group-aggregate to wide form                -> df.pivot_table(values, index, columns, aggfunc)
#   Multiple aggregations                         -> aggfunc=["sum","mean"] (multi-col result)
#   Multiple values columns                       -> values=["a","b"] (multi-col result)
#   Fill missing combinations                     -> fill_value=0
#   Want raw reshape (no agg)                      -> df.pivot (errors on duplicates)
#   Add row/col totals                             -> margins=True, margins_name="Total"
#   Speed-sensitive                                -> groupby(...).agg(...).unstack() can be faster
#   Need long form back                            -> .melt() inverses pivot
#
# Anti-pattern: pivot_table without specifying aggfunc when duplicates exist
#   pandas defaults to mean, silently averaging values you might have wanted
#   summed (or counted). Always pass aggfunc explicitly: aggfunc="sum" / "count" /
#   "first" — choose deliberately, document intent.
```

## Decision Rule

```text
Group-aggregate to wide form                -> df.pivot_table(values, index, columns, aggfunc)
Multiple aggregations                         -> aggfunc=["sum","mean"] (multi-col result)
Multiple values columns                       -> values=["a","b"] (multi-col result)
Fill missing combinations                     -> fill_value=0
Want raw reshape (no agg)                      -> df.pivot (errors on duplicates)
Add row/col totals                             -> margins=True, margins_name="Total"
Speed-sensitive                                -> groupby(...).agg(...).unstack() can be faster
Need long form back                            -> .melt() inverses pivot
```

## Anti-Pattern

> [!warning] Anti-pattern
> pivot_table without specifying aggfunc when duplicates exist
>   pandas defaults to mean, silently averaging values you might have wanted
>   summed (or counted). Always pass aggfunc explicitly: aggfunc="sum" / "count" /
>   "first" — choose deliberately, document intent.

## Tips

- `fill_value=0` fills NaN in the result — usually correct for sales/count pivots
- `margins=True` adds "All" row and column totals
- `pivot()` raises if duplicates exist; `pivot_table()` aggregates them — prefer pivot_table by default
- The result has a MultiIndex for columns when multiple values or aggfuncs are used — call `.droplevel(0, axis=1)` to flatten
- For pure frequency / proportion tables, reach for `pd.crosstab` — it is purpose-built and reads more clearly than pivot_table with `aggfunc="count"`

## Common Mistake

> [!warning] Using `df.pivot()` when there are duplicate (index, column) combinations. It raises ValueError. Use `df.pivot_table()` which handles duplicates by aggregating.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.pivot_table(
values    = 'sales',
index     = 'product',
```

**Senior:**
```python
df.pivot(index='date', columns='product', values='price')
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

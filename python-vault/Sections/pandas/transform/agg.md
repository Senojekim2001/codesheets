---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "agg"
title: ".agg()"
category: "Transform"
subtitle: "Named aggregations give clean column names in one call"
signature_short: "df.groupby(\"col\").agg(name=(\"col\", \"func\"))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".agg()"
  - "agg"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .agg()

> Named aggregations give clean column names in one call

## Overview

agg() computes summary statistics for each group. Named aggregations (pandas 0.25+) give the output column its name in one step — no need to rename afterward. Pass a list for multiple stats per column.

## Signature

```python
df.groupby("col").agg(name=("col", "func"))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one statistic per group: groupby a column, take a
#             single named aggregator on a numeric column.
# STRENGTHS - the smallest possible split-apply-combine; reads
#             like a SQL SELECT AVG ... GROUP BY ...
# WEAKNESSES- doesn't yet show multiple stats, named aggregations,
#             or the difference between agg(list) and named
#             aggregations.
#
import pandas as pd

df.groupby("dept")["salary"].mean()
df.groupby("dept")["salary"].sum()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - named aggregations (the modern, recommended form):
#             agg(name=("col", "func")). Multiple stats per call,
#             different stats per column, multi-key groupby with
#             reset_index for flat output.
# STRENGTHS - named aggregations give clean column names in one
#             pass — no rename step, no MultiIndex columns. This
#             is the form to memorize.
# WEAKNESSES- doesn't address custom-function speed (lambdas in
#             agg are slow), or the "agg returns one row per
#             group, transform keeps shape" distinction — those
#             come up in transform's own entry.
#
import pandas as pd

# Named aggregations — clean column names in ONE call
summary = df.groupby("dept").agg(
    avg_salary = ("salary", "mean"),
    max_salary = ("salary", "max"),
    headcount  = ("salary", "count"),
    p90        = ("salary", lambda s: s.quantile(0.9)),
)

# Multi-key groupby + reset_index for a flat result
flat = (df.groupby(["dept", "level"])
          .agg(avg=("salary", "mean"), n=("id", "count"))
          .reset_index())

# Different stats from different columns
mix = df.groupby("dept").agg(
    total_days = ("days", "sum"),
    city_count = ("city", "nunique"),
    last_seen  = ("date", "max"),
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production agg: prefer built-in aggregator strings
#             ("mean", "sum", "nunique") over lambdas (Cython vs
#             Python loop), use weighted aggregations explicitly,
#             and add observed=True + a non-default fill where
#             empty groups would otherwise drop out.
# STRENGTHS - built-in strings unlock the C-level fast path —
#             the difference is 10-100x on large frames; weighted
#             stats are the right answer to "average rating
#             weighted by votes" or "weighted price"; observed=True
#             prevents categorical-product blowup.
# WEAKNESSES- writing your own weighted stats is small but
#             repetitive — wrap it in a helper; observed=True
#             changes output shape vs older code that relied on
#             the all-categories grid; lambdas are sometimes the
#             only way for genuinely custom logic.
#
import pandas as pd
import numpy as np

g = df.groupby("dept", observed=True)

# 1. Built-in strings hit the C fast path — much faster than lambdas
fast = g.agg(
    n        = ("id",     "count"),
    avg_sal  = ("salary", "mean"),
    p50      = ("salary", "median"),
    distinct = ("city",   "nunique"),
)

# 2. Weighted aggregation — express it as a closed form
def weighted_mean(values: pd.Series, weights: pd.Series) -> float:
    return np.average(values, weights=weights)

weighted = (df.groupby("product", observed=True)
              .apply(lambda gr: weighted_mean(gr["price"], gr["units"]),
                     include_groups=False)
              .rename("weighted_avg_price"))

# 3. Multiple stats with different column dtypes — keep types clean
report = g.agg(
    revenue   = ("amount", "sum"),
    avg_age   = ("age",    "mean"),
    last_seen = ("date",   "max"),
).convert_dtypes()                          # nullable types preserved

# 4. Anti-pattern: dict-form agg with list values
#    Old:    df.groupby("dept").agg({"salary": ["mean", "std"]})
#    Result: MultiIndex columns ('salary', 'mean') / ('salary', 'std')
#    New:    df.groupby("dept").agg(
#                mean=("salary", "mean"),
#                std =("salary", "std"),
#            )                              # flat columns

# Decision rule:
#   Single function                              -> .agg("mean") or .agg(np.mean)
#   Multiple functions                            -> .agg(["mean","std","count"])
#   Per-column functions                          -> .agg({"a":"mean","b":"sum"})
#   Custom output names                            -> .agg(out_a=("a","mean"), out_b=("b","sum"))
#   User function                                  -> .agg(lambda x: x.iloc[-1] - x.iloc[0])
#   Many funcs across many cols                    -> .agg(["mean","std","min","max"])
#   Need to build column names cleanly             -> named-aggregation form (out_x=(...))
#   Want side-effects per group                    -> use .apply, NOT .agg
#
# Anti-pattern: .agg with a lambda when a built-in shorthand exists
#   .agg(lambda x: x.mean()) — slow Python callable per group. Use the string
#   shorthand .agg("mean") which dispatches to the C path — orders of magnitude
#   faster on millions of groups.
```

## Decision Rule

```text
Single function                              -> .agg("mean") or .agg(np.mean)
Multiple functions                            -> .agg(["mean","std","count"])
Per-column functions                          -> .agg({"a":"mean","b":"sum"})
Custom output names                            -> .agg(out_a=("a","mean"), out_b=("b","sum"))
User function                                  -> .agg(lambda x: x.iloc[-1] - x.iloc[0])
Many funcs across many cols                    -> .agg(["mean","std","min","max"])
Need to build column names cleanly             -> named-aggregation form (out_x=(...))
Want side-effects per group                    -> use .apply, NOT .agg
```

## Anti-Pattern

> [!warning] Anti-pattern
> .agg with a lambda when a built-in shorthand exists
>   .agg(lambda x: x.mean()) — slow Python callable per group. Use the string
>   shorthand .agg("mean") which dispatches to the C path — orders of magnitude
>   faster on millions of groups.

## Tips

- Named aggregations `agg(name=("col", "func"))` give clean column names — no renaming needed
- Use `"nunique"` to count distinct values per group — great for cardinality analysis
- Chain `.reset_index()` after agg to convert the group index back to columns
- Custom lambda functions in agg are slower than built-in aggregators — use built-ins when possible

## Common Mistake

> [!warning] Using `.agg({"col": ["mean", "std"]})` which creates MultiIndex column names. Use named aggregations instead — `agg(mean=("col","mean"), std=("col","std"))` for flat column names.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.groupby('dept')['salary'].mean()
df.groupby('dept')['salary'].agg(['mean', 'min', 'max', 'count'])
summary = df.groupby('dept').agg(
```

**Senior:**
```python
)
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "stack"
title: ".stack()"
category: "Transform"
subtitle: "Columns → rows (stack) and rows → columns (unstack)"
signature_short: "df.stack() | df.unstack(level=-1)"
has_decision_rule: true
has_anti_pattern: false
tier_count: 3
aliases:
  - ".stack()"
  - "stack"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .stack()

> Columns → rows (stack) and rows → columns (unstack)

## Overview

stack() pivots the innermost column level into the row index, creating a longer DataFrame. unstack() does the inverse — moves a row index level into columns. Most useful when working with MultiIndex DataFrames.

## Signature

```python
df.stack() | df.unstack(level=-1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - move the columns down into the index, producing a
#             MultiIndex Series. unstack does the reverse.
# STRENGTHS - shows in three lines what stack/unstack actually
#             do — they're the dual of each other.
# WEAKNESSES- doesn't yet contrast stack with melt (when to pick
#             which) or show the level= argument that determines
#             which axis level is moved.
#
import pandas as pd

df = pd.DataFrame({"q1": [100, 200], "q2": [150, 180]},
                  index=["Alice", "Bob"])

stacked = df.stack()
# Alice  q1    100
#        q2    150
# Bob    q1    200
#        q2    180
back = stacked.unstack()                     # original DataFrame
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday stack/unstack moves: pick a level=
#             with unstack to choose which axis goes wide; reset
#             the resulting MultiIndex when you need plain columns;
#             know the stack vs melt decision (column structure
#             vs explicit value_vars).
# STRENGTHS - covers what stack does in real code: post-pivot
#             cleanup, MultiIndex manipulation, round-tripping a
#             groupby result.
# WEAKNESSES- doesn't address future_stack=True (the new pandas
#             default) or the dropna behavior — senior tier.
#
import pandas as pd

# Stack/unstack pair on a MultiIndex Series
arrays = [["bar", "bar", "baz"], ["one", "two", "one"]]
s = pd.Series([1, 2, 3], index=pd.MultiIndex.from_arrays(arrays))

s.unstack()                                   # 2nd level -> columns
s.unstack(level=0)                            # 1st level -> columns

# Round trip after stacking
stacked = df.stack()
flat    = stacked.reset_index()
flat.columns = ["name", "quarter", "sales"]   # name the new cols

# stack vs melt
#   stack() - operates on the column index structure (esp. MultiIndex)
#   melt()  - explicit value_vars=, more readable for plain wide frames
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reshape: prefer melt when the column
#             names are the variable, prefer stack/unstack when
#             you're already working with a MultiIndex (post-
#             groupby/pivot). Adopt future_stack=True to align
#             with the new dropna semantics.
# STRENGTHS - aligns code with the modern pandas behavior; melt
#             is more diff-friendly than stack for simple wide
#             frames; stack is the right tool for "I just got a
#             MultiIndex Series back from groupby and want a
#             frame".
# WEAKNESSES- future_stack=True is API-stable in 2.1+ but old
#             code may rely on the legacy NaN-dropping; readers
#             unfamiliar with MultiIndex will struggle either way;
#             the resulting MultiIndex may need explicit naming
#             (rename_axis) before reset_index for clean columns.
#
import pandas as pd

# 1. Modern stack — preserve NaN explicitly
df.stack(future_stack=True)                   # don't silently drop NaN

# 2. Post-groupby Series -> tidy frame via unstack + reset
counts = (df.groupby(["region", "status"], observed=True)
            .size()
            .unstack(fill_value=0))           # status -> columns
# counts is now a frame; rows = region, columns = status

# 3. From a MultiIndex frame back to long form
multi = df.groupby(["region", "month"], observed=True)["sales"].agg(["mean", "sum"])
long = (multi.stack(future_stack=True)
              .rename_axis(["region", "month", "stat"])
              .reset_index(name="value"))

# Decision rule:
#   wide frame, columns are the variable        -> melt(...)
#   already have MultiIndex (post-groupby/pivot) -> stack/unstack
#   need to keep NaN slots                       -> future_stack=True
#   want flat columns at the end                 -> rename_axis() + reset_index()
```

## Decision Rule

```text
wide frame, columns are the variable        -> melt(...)
already have MultiIndex (post-groupby/pivot) -> stack/unstack
need to keep NaN slots                       -> future_stack=True
want flat columns at the end                 -> rename_axis() + reset_index()
```

## Tips

- For simple wide→long transforms, `melt()` is more readable than `stack()`
- `stack()` creates a MultiIndex on the row — use `.reset_index()` to flatten it back to columns
- `unstack(level=0)` pivots the outer index level; `unstack(level=-1)` pivots the inner
- stack/unstack are most useful when working with MultiIndex DataFrames from pivot operations
- On pandas 2.x, pass `future_stack=True` (or set `dropna=False`) to keep NaN slots — the default silently drops them

## Common Mistake

> [!warning] Using stack() on a DataFrame with NaN values without `dropna=False`. By default, stack() drops rows where the stacked value is NaN.

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
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index() (Pandas)]]
- [[Sections/pandas/transform/nlargest-nsmallest|.nlargest() / .nsmallest() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

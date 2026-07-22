---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "melt"
title: ".melt()"
category: "Transform"
subtitle: "Wide → long — the inverse of pivot_table"
signature_short: "pd.melt(df, id_vars=[], value_vars=[], var_name=\"\", value_name=\"\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".melt()"
  - "melt"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .melt()

> Wide → long — the inverse of pivot_table

## Overview

melt() converts wide-format data to long (tidy) format. id_vars= are the columns to keep fixed. value_vars= are the columns to unpivot. The result has one row per measurement. Most visualization libraries expect long format.

## Signature

```python
pd.melt(df, id_vars=[], value_vars=[], var_name="", value_name="")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest melt: pick id columns to keep, name the
#             new variable / value columns, get a long-form frame.
# STRENGTHS - shows the wide -> long transformation in three
#             lines; the result is the format every plotting lib
#             prefers.
# WEAKNESSES- doesn't yet show melt-then-pivot round trips,
#             multiple value blocks, or wide_to_long for
#             structured column names.
#
import pandas as pd

wide = pd.DataFrame({
    "name": ["Alice", "Bob"],
    "q1":   [100, 200],
    "q2":   [150, 180],
    "q3":   [120, 220],
})

long = wide.melt(id_vars=["name"], var_name="quarter", value_name="sales")
#    name quarter  sales
# 0 Alice      q1    100
# 1   Bob      q1    200
# 2 Alice      q2    150
# 3   Bob      q2    180
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday melt patterns: explicit value_vars=
#             when only some columns should unpivot, the round-
#             trip via pivot_table to invert, and method-form vs
#             function-form (both equivalent).
# STRENGTHS - covers what melt actually looks like in real code:
#             prep for seaborn/plotly, normalize a wide schema,
#             then pivot back if needed.
# WEAKNESSES- doesn't address the wide_to_long case where column
#             names follow a pattern (e.g. "q1_sales", "q2_sales") —
#             senior tier.
#
import pandas as pd

# Explicit value_vars — leave other columns alone
long = wide.melt(
    id_vars    = ["name"],
    value_vars = ["q1", "q2", "q3"],
    var_name   = "quarter",
    value_name = "sales",
)

# Round trip: long -> wide via pivot_table
back = long.pivot_table(
    values  = "sales",
    index   = "name",
    columns = "quarter",
    aggfunc = "sum",
)

# Function form is equivalent
long2 = pd.melt(wide, id_vars=["name"],
                var_name="quarter", value_name="sales")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reshape: pd.wide_to_long when columns
#             follow a stub_pattern (e.g. "sales_q1", "sales_q2"),
#             multi-block melt for paired columns (sales + units
#             per quarter), and an explicit dtype check after
#             melt to catch object-fallback.
# STRENGTHS - wide_to_long does the regex-based extraction that
#             plain melt forces you to do manually; multi-block
#             melt produces a clean long form with one row per
#             observation; dtype check catches the silent
#             promotion to object when value columns differ in
#             type.
# WEAKNESSES- wide_to_long has a fiddly stubnames/i/j signature
#             that's easy to get wrong; multi-block melt requires
#             two passes plus a join when the value columns have
#             different units; melted frames are typically larger
#             in memory than wide ones.
#
import pandas as pd

# 1. wide_to_long — column names follow a stub pattern
wide = pd.DataFrame({
    "name": ["Alice", "Bob"],
    "sales_q1": [100, 200], "sales_q2": [150, 180],
    "units_q1": [10,  20],  "units_q2": [15,  18],
})
long = pd.wide_to_long(
    wide,
    stubnames=["sales", "units"],     # one stub per measurement
    i="name",                          # row identifier(s)
    j="quarter",                       # name for the new "varying" axis
    sep="_",
    suffix=r"q\d+",
).reset_index()
# columns: name, quarter, sales, units

# 2. Multi-block melt by hand — when the pattern is irregular
sales_long = wide.melt(id_vars=["name"], value_vars=["sales_q1","sales_q2"],
                        var_name="quarter", value_name="sales")
units_long = wide.melt(id_vars=["name"], value_vars=["units_q1","units_q2"],
                        var_name="quarter", value_name="units")
sales_long["quarter"] = sales_long["quarter"].str.replace("sales_", "")
units_long["quarter"] = units_long["quarter"].str.replace("units_", "")
combined = sales_long.merge(units_long, on=["name", "quarter"])

# 3. Dtype audit after melt — catches silent object fallback
assert long["sales"].dtype != object, "value column promoted to object"

# Decision rule:
#   single block of measurements                -> wide.melt(...)
#   structured stubs ("sales_q1", "sales_q2")   -> pd.wide_to_long(...)
#   multiple measurement blocks, irregular      -> melt each + merge

# Anti-pattern: melt without id_vars / value_vars on wide tables
#   Default melt() folds EVERY column into one — including row id columns you
#   needed to keep. Always specify id_vars=["id","date"] (the keys to preserve)
#   and value_vars=[the wide cols you're unpivoting] for a predictable long form.
```

## Decision Rule

```text
single block of measurements                -> wide.melt(...)
structured stubs ("sales_q1", "sales_q2")   -> pd.wide_to_long(...)
multiple measurement blocks, irregular      -> melt each + merge
```

## Anti-Pattern

> [!warning] Anti-pattern
> melt without id_vars / value_vars on wide tables
>   Default melt() folds EVERY column into one — including row id columns you
>   needed to keep. Always specify id_vars=["id","date"] (the keys to preserve)
>   and value_vars=[the wide cols you're unpivoting] for a predictable long form.

## Tips

- Most visualization libraries (seaborn, plotly) expect long format — `melt()` is the path to get there
- If `value_vars=` is omitted, all columns not in `id_vars=` are melted
- Use `df.melt()` as a method or `pd.melt(df)` as a function — both are equivalent
- `pd.wide_to_long()` is a more powerful version for structured column name patterns

## Common Mistake

> [!warning] Passing column names as `id_vars` that should be melted, or vice versa. `id_vars` are the fixed identifier columns that appear in every row; `value_vars` are the columns being unpivoted.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
wide = pd.DataFrame({
'name': ['Alice', 'Bob'],
'q1':   [100, 200],
```

**Senior:**
```python
columns='quarter', aggfunc='sum')
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

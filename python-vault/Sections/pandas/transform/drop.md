---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "drop"
title: ".drop()"
category: "Transform"
subtitle: "Drop columns with axis=1, rows with axis=0"
signature_short: "df.drop(columns=[\"col1\",\"col2\"]) | df.drop(index=[0,1,2])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".drop()"
  - "drop"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .drop()

> Drop columns with axis=1, rows with axis=0

## Overview

drop() removes rows (axis=0) or columns (axis=1) by label. Using the columns= or index= keyword arguments is clearer than positional axis=. Returns a new DataFrame by default.

## Signature

```python
df.drop(columns=["col1","col2"]) | df.drop(index=[0,1,2])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - drop columns by name with the columns= keyword.
#             Reassign the result.
# STRENGTHS - the keyword form makes the intent ("dropping COLUMNS")
#             unmistakable; safer than the older axis= positional
#             style.
# WEAKNESSES- doesn't yet show row drops, condition-based filter
#             (which is usually a better fit), or errors="ignore"
#             for pipeline robustness.
#
import pandas as pd

df = df.drop(columns=["col1", "col2"])
df = df.drop(columns="single_col")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: drop by index label, prefer
#             boolean filtering for "drop rows where condition",
#             use errors="ignore" in pipelines so missing columns
#             don't crash, and clean up duplicate columns by name.
# STRENGTHS - covers what drop actually looks like in real code;
#             the "filter, don't drop" rule for conditional row
#             removal makes pipelines more readable.
# WEAKNESSES- doesn't address pop()/del or the chain-friendly
#             alternatives — senior tier covers those plus a
#             "drop is not your tool" decision rule.
#
import pandas as pd

# Drop columns / rows by label
df = df.drop(columns=["col1", "col2"])
df = df.drop(index=[0, 1, 2])
df = df.drop(index="row_label")

# Conditional row removal: filter is usually cleaner than drop
df = df[df["score"] >= 0]                     # better than .drop(... .index)

# Pipeline-safe — don't crash if a column isn't there
df = df.drop(columns=["maybe_missing"], errors="ignore")

# Drop duplicate columns by name (rare, but a real cleanup)
df = df.loc[:, ~df.columns.duplicated()]

# Drop columns based on null content (delegate to dropna)
df = df.dropna(axis=1, how="all")             # all-null columns
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - drop is rarely the best tool. Reach for filter()
#             when selecting by pattern, the .pop() trick when you
#             need both the dropped column AND the residual frame,
#             and use a "keep list" instead of a "drop list" for
#             schema clarity.
# STRENGTHS - filter(regex=) handles "drop all Unnamed: columns"
#             elegantly; pop() avoids a separate access; explicit
#             keep-list documents the contract better than "drop
#             everything I don't want".
# WEAKNESSES- pop() mutates in-place — surprises chain-style code;
#             keep-lists need maintenance when the schema evolves;
#             filter() is regex-based and doesn't support negation
#             directly.
#
import pandas as pd

# 1. Drop a class of columns with a regex pattern
df = df.drop(columns=df.filter(regex=r"^Unnamed").columns)
df = df.drop(columns=df.filter(regex=r"_temp$").columns)

# 2. .pop — extract a column AND drop it in one call
y = df.pop("target")              # df no longer has 'target'; y is the Series

# 3. "Keep list" beats "drop list" for evolving schemas
KEEP = ["id", "name", "amount", "date", "region"]
df = df[KEEP]                     # explicit, documents intent

# 4. Drop is the wrong tool when:
#    - filtering rows by condition  -> use boolean indexing
#    - selecting columns by pattern -> use .filter()
#    - removing nulls               -> use .dropna()
#    - removing duplicates          -> use .drop_duplicates()

# 5. Anti-pattern: in-place drop in pipelines
#    Wrong:
#       df.drop(columns=["x"], inplace=True)   # breaks method chains
#    Right:
#       df = df.drop(columns=["x"])

# Decision rule:
#   Drop a column                                -> df.drop(columns=["x"])
#   Drop multiple columns                         -> df.drop(columns=["x","y"])
#   Drop rows by index label                      -> df.drop(index=[5, 7])
#   Drop by boolean filter                         -> df[~mask] (idiomatic; not .drop)
#   Drop NA rows                                   -> df.dropna() (specialised)
#   Drop duplicates                                -> df.drop_duplicates()
#   In a chain                                    -> .drop returns a copy by default
#   Errors on missing label                       -> errors="ignore" to tolerate
#
# Anti-pattern: df.drop("x", axis=1) when columns= is clearer
#   axis=1 / axis=0 is error-prone (which is which?). Use the explicit
#   keyword form: df.drop(columns=...) or df.drop(index=...). Same behavior,
#   self-documenting code.
```

## Decision Rule

```text
Drop a column                                -> df.drop(columns=["x"])
Drop multiple columns                         -> df.drop(columns=["x","y"])
Drop rows by index label                      -> df.drop(index=[5, 7])
Drop by boolean filter                         -> df[~mask] (idiomatic; not .drop)
Drop NA rows                                   -> df.dropna() (specialised)
Drop duplicates                                -> df.drop_duplicates()
In a chain                                    -> .drop returns a copy by default
Errors on missing label                       -> errors="ignore" to tolerate
```

## Anti-Pattern

> [!warning] Anti-pattern
> df.drop("x", axis=1) when columns= is clearer
>   axis=1 / axis=0 is error-prone (which is which?). Use the explicit
>   keyword form: df.drop(columns=...) or df.drop(index=...). Same behavior,
>   self-documenting code.

## Tips

- `drop(columns=[...])` is cleaner than `drop([...], axis=1)` — the intent is explicit
- `errors="ignore"` prevents errors when dropping a column that may not exist — useful in pipelines
- Dropping rows by condition is usually cleaner as a filter: `df[df["col"] >= 0]`
- To drop unnamed index columns (Unnamed: 0 from CSV): `df.drop(columns=df.filter(regex="^Unnamed").columns)`

## Common Mistake

> [!warning] Using `del df["col"]` to drop a column. It works but modifies the DataFrame in place and cannot be chained. Use `df.drop(columns=["col"])` in pipelines.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.drop(columns=['col1', 'col2'])
df.drop(columns='single_col')
df.drop(index=[0, 1, 2])
df.drop(index='row_label')
```

**Senior:**
```python
df.dropna(axis=1, how='any')
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

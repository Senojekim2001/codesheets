---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "explode"
title: ".explode()"
category: "Transform"
subtitle: "Unnest list columns — one row per list element"
signature_short: "df.explode(\"col\") | df.explode([\"col1\", \"col2\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".explode()"
  - "explode"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .explode()

> Unnest list columns — one row per list element

## Overview

explode() unpacks list-like values in a column — each element becomes its own row, with all other column values duplicated. Essential for working with data where a cell contains a list (tags, categories, items). The inverse is groupby + agg with list.

## Signature

```python
df.explode("col") | df.explode(["col1", "col2"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one column of lists, one call. Each element becomes
#             a row; other columns are duplicated.
# STRENGTHS - the cleanest possible "unnest a list column"
#             demonstration; makes the duplicate-other-columns
#             behavior visible.
# WEAKNESSES- doesn't yet show string-split-then-explode, multi-
#             column explode, or the inverse round-trip.
#
import pandas as pd

df = pd.DataFrame({
    "name": ["Alice", "Bob"],
    "tags": [["python", "pandas"], ["sql", "spark", "python"]],
})

df.explode("tags")
#     name     tags
# 0  Alice   python
# 0  Alice   pandas
# 1    Bob      sql
# 1    Bob    spark
# 1    Bob   python
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday explode patterns: split a string column
#             before exploding, reset the index after, do parallel
#             explode of multiple list columns, and round-trip back
#             to lists via groupby + agg(list).
# STRENGTHS - this is what explode looks like in real ETL: tag
#             frequency, parallel feature columns, list <-> long
#             round-trips for export.
# WEAKNESSES- doesn't address NaN behavior (NaN explodes to one
#             NaN row by default; sometimes you want it dropped) —
#             senior tier covers it.
#
import pandas as pd

# Split-then-explode
df["tags"] = df["tags_str"].str.split(",")
df = df.explode("tags").reset_index(drop=True)

# Multi-column explode (lists must be same length per row)
df = df.explode(["col_a", "col_b"]).reset_index(drop=True)

# Tag frequency
df.explode("tags")["tags"].value_counts()

# Inverse round-trip — back to lists
collapsed = (df.explode("tags")
               .groupby("name")["tags"]
               .agg(list)
               .reset_index())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade explode: handle NaN and empty lists
#             explicitly (default behavior surprises people),
#             trim whitespace after string-split, and consider
#             pyarrow list dtypes for very large exploded frames.
# STRENGTHS - explicit NaN/empty handling avoids silent row count
#             changes; whitespace trim removes the most common
#             "duplicate" tag bug; arrow lists preserve schema for
#             round-trip without flattening to object.
# WEAKNESSES- explicit NaN handling adds a few lines that look
#             ceremonial; arrow list dtype requires pandas >= 2.0
#             and isn't supported by every downstream library.
#
import pandas as pd
import numpy as np

# 1. Default behavior — NaN becomes one NaN row, [] becomes one NaN row
s = pd.Series([["a", "b"], [], np.nan])
s.explode()
# 0      a
# 0      b
# 1    NaN     <- empty list -> NaN
# 2    NaN     <- NaN as input -> NaN

# Drop the placeholder rows when you want only real elements:
out = s.explode().dropna()

# 2. Whitespace robustness around string-splitting
df["tags"] = (df["tags_str"].fillna("")
                            .str.split(","))
df = df.explode("tags")
df["tags"] = df["tags"].str.strip()                # trim per-row
df = df[df["tags"].ne("")]                         # drop empty after trim
df = df.reset_index(drop=True)

# 3. Validate parallel-explode invariants before calling
def safe_multi_explode(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    lens = pd.concat([df[c].map(len) for c in cols], axis=1)
    bad = (lens.nunique(axis=1) > 1)
    if bad.any():
        raise ValueError(f"row-length mismatch on {cols}: {bad.sum()} rows")
    return df.explode(cols).reset_index(drop=True)

# 4. Anti-pattern: explode on a string column
#    df.explode("name")          # explodes character-by-character
#    str.split first.

# Decision rule:
#   Column of lists -> rows                     -> df.explode("col")
#   Empty-list rows                              -> result has a NaN row (good signal)
#   Explode multiple columns at once             -> df.explode(["a","b"]) (must be same lengths)
#   Comma-separated string column                 -> .str.split(",") FIRST, then explode
#   Need original index back                      -> reset_index() after explode
#   Want flatter alternative                       -> json_normalize on dict-of-list payloads
#   Counts of items                                -> .str.split().str.len() (no explode)
#   Multi-level nesting                            -> explode then explode again
#
# Anti-pattern: looping with iterrows() to flatten lists into rows
#   df.iterrows() is glacial. df.explode("items") does the same expansion in
#   one C-level call — orders of magnitude faster, and preserves the rest of
#   the row's columns automatically.
```

## Decision Rule

```text
Column of lists -> rows                     -> df.explode("col")
Empty-list rows                              -> result has a NaN row (good signal)
Explode multiple columns at once             -> df.explode(["a","b"]) (must be same lengths)
Comma-separated string column                 -> .str.split(",") FIRST, then explode
Need original index back                      -> reset_index() after explode
Want flatter alternative                       -> json_normalize on dict-of-list payloads
Counts of items                                -> .str.split().str.len() (no explode)
Multi-level nesting                            -> explode then explode again
```

## Anti-Pattern

> [!warning] Anti-pattern
> looping with iterrows() to flatten lists into rows
>   df.iterrows() is glacial. df.explode("items") does the same expansion in
>   one C-level call — orders of magnitude faster, and preserves the rest of
>   the row's columns automatically.

## Tips

- `explode()` preserves the original index — call `reset_index(drop=True)` after for a clean index
- Split a string column before exploding: `df["col"].str.split(",")` then `.explode("col")`
- The inverse of explode is `groupby().agg(list)` — round-trips back to list column
- Multi-column explode requires both list columns to have the same length in each row

## Common Mistake

> [!warning] Calling `explode()` on a string column. It explodes character-by-character. Split the string into a list first with `str.split()`, then explode the resulting list column.

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

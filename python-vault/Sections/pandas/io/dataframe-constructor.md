---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "dataframe-constructor"
title: "pd.DataFrame()"
category: "I/O"
subtitle: "The primary data structure — create from dict, list, or ndarray"
signature_short: "pd.DataFrame(data, index=None, columns=None, dtype=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.DataFrame()"
  - "dataframe-constructor"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.DataFrame()

> The primary data structure — create from dict, list, or ndarray

## Overview

pd.DataFrame() is the constructor for pandas's primary 2D data structure. The most common input is a dict of lists (one key per column). Also accepts lists of dicts, 2D numpy arrays, and other DataFrames.

## Signature

```python
pd.DataFrame(data, index=None, columns=None, dtype=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest constructor: a dict of lists, one key per
#             column. Read .shape and .columns to confirm what came out.
# STRENGTHS - mirrors how most people first build a DataFrame; the
#             whole shape (3 rows, 3 cols) is visible inline.
# WEAKNESSES- doesn't cover other input shapes (list of dicts, ndarray,
#             custom index) or any type/memory considerations.
#
import pandas as pd

df = pd.DataFrame({
    "name":  ["Alice", "Bob", "Carol"],
    "age":   [30, 25, 35],
    "score": [92.5, 88.0, 95.5],
})

df.shape       # (3, 3)
df.columns     # Index(['name', 'age', 'score'], dtype='object')
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the four input shapes you'll meet weekly: dict of lists,
#             list of dicts, numpy array, and a custom index. End by
#             inspecting dtypes/index — the diagnostics that matter
#             after every construction.
# STRENGTHS - covers ~95% of construction calls in real code; sets the
#             habit of inspecting dtypes immediately after building.
# WEAKNESSES- still uses default int64/float64/object dtypes; for big
#             frames that's wasted memory (see senior tier).
#
import pandas as pd
import numpy as np

# 1. Dict of lists — the clearest form, one key per column
df = pd.DataFrame({
    "name":  ["Alice", "Bob", "Carol"],
    "age":   [30, 25, 35],
    "score": [92.5, 88.0, 95.5],
})

# 2. List of dicts — natural when collecting records one at a time
df = pd.DataFrame([
    {"name": "Alice", "age": 30},
    {"name": "Bob",   "age": 25},
])

# 3. Numpy array + explicit columns — for numeric matrices
df = pd.DataFrame(np.random.randn(5, 3), columns=["A", "B", "C"])

# 4. Custom index — labels rows by something meaningful
df = pd.DataFrame({"val": [1, 2, 3]}, index=["a", "b", "c"])

# 5. Empty DataFrame with known structure — useful for accumulation
df = pd.DataFrame(columns=["name", "age", "score"])

# Always inspect after construction:
df.shape, df.dtypes, df.columns, df.index
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - construct with dtypes pinned up front (no inference pass),
#             use nullable extension dtypes ("Int64", "string") so
#             missing values don't silently coerce to float, and prefer
#             pd.from_records or pd.from_dict when the input shape is
#             fixed and large.
# STRENGTHS - skips the dtype-inference scan (faster on big data), keeps
#             integer columns integer when nulls appear, and signals
#             intent to readers; ready for memory-tight pipelines.
# WEAKNESSES- pinning dtypes is verbose; nullable dtypes ("Int64" with
#             capital I) still surprise readers used to numpy ints; some
#             ecosystem libs don't yet round-trip them perfectly.
#
import pandas as pd

# Pin dtypes at construction — no inference cost, no NaN-coercion
df = pd.DataFrame(
    {
        "id":     [1, 2, 3, None],
        "amount": [9.99, 4.50, None, 1.25],
        "city":   ["NYC", "LA", "NYC", "SF"],
    }
).astype({
    "id":     "Int64",       # nullable integer (capital I) — keeps None as <NA>
    "amount": "float32",     # half the memory of float64
    "city":   "category",    # dictionary-encoded for low-cardinality strings
})

df.dtypes
# id        Int64
# amount    float32
# city      category

df.memory_usage(deep=True)   # 'deep=True' counts string content, not pointers

# When the input is a list of records, from_records skips the dict step:
records = [(1, "NYC"), (2, "LA"), (3, "SF")]
df2 = pd.DataFrame.from_records(records, columns=["id", "city"])

# Anti-pattern to avoid:
#   df = pd.DataFrame([[1,2,3],[4,5,6]])
# columns become 0/1/2 — easy to confuse with row indices.

# Decision rule:
#   Wide table, fixed schema                  -> dict of lists or dict of arrays
#   Streaming records (one at a time)         -> list of dicts, then DataFrame(...)
#   Need typed integers with nulls            -> pin dtype="Int64" (capital I, nullable)
#   Low-cardinality string column              -> dtype="category" (10-100x memory win)
#   Tight memory                               -> from_records + .astype({...}) up front
#   Coming from sklearn/numpy                  -> pd.DataFrame(arr, columns=[...])
#   Need known-shape empty frame               -> pd.DataFrame(columns=[...], dtype=...)
#
# Anti-pattern: building a DataFrame by repeated df.append() / pd.concat() in a loop
#   Each append re-allocates the whole frame -> O(n^2). For N rows of streaming
#   data, accumulate in a list of dicts and call pd.DataFrame(records) ONCE at
#   the end. The append() method itself was deprecated in pandas 2.0.
```

## Decision Rule

```text
Wide table, fixed schema                  -> dict of lists or dict of arrays
Streaming records (one at a time)         -> list of dicts, then DataFrame(...)
Need typed integers with nulls            -> pin dtype="Int64" (capital I, nullable)
Low-cardinality string column              -> dtype="category" (10-100x memory win)
Tight memory                               -> from_records + .astype({...}) up front
Coming from sklearn/numpy                  -> pd.DataFrame(arr, columns=[...])
Need known-shape empty frame               -> pd.DataFrame(columns=[...], dtype=...)
```

## Anti-Pattern

> [!warning] Anti-pattern
> building a DataFrame by repeated df.append() / pd.concat() in a loop
>   Each append re-allocates the whole frame -> O(n^2). For N rows of streaming
>   data, accumulate in a list of dicts and call pd.DataFrame(records) ONCE at
>   the end. The append() method itself was deprecated in pandas 2.0.

## Tips

- Dict of lists is the clearest constructor — one key per column, all lists the same length
- List of dicts is natural when you're collecting records one at a time
- `pd.DataFrame(columns=[...])` creates an empty DataFrame with known structure — useful for accumulation
- Always call `df.info()` immediately after construction to verify types and null counts

## Common Mistake

> [!warning] Creating a DataFrame from a list of lists without specifying `columns=`. You get integer column names (0, 1, 2) which are easy to confuse with row indices.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import numpy as np
df = pd.DataFrame({
'name':   ['Alice', 'Bob', 'Carol'],
```

**Senior:**
```python
df.index        # Row index
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

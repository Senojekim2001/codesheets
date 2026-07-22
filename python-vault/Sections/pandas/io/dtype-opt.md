---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "dtype-opt"
title: "dtype optimization"
category: "Performance"
subtitle: "Halve memory with float32, int32, and category dtypes"
signature_short: "pd.to_numeric(s, downcast=\"integer\") | col.astype(\"category\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dtype optimization"
  - "dtype-opt"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/performance"
  - "tier/tiered"
---

# dtype optimization

> Halve memory with float32, int32, and category dtypes

## Overview

The biggest memory wins come from downcasting float64→float32, int64→int32, and converting low-cardinality string columns to category. A well-optimized DataFrame often uses 50-80% less memory than the default.

## Signature

```python
pd.to_numeric(s, downcast="integer") | col.astype("category")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one column at a time: cast a high-cardinality numeric to
#             a smaller dtype, cast a low-cardinality string to category.
#             Measure the before/after with memory_usage(deep=True).
# STRENGTHS - shows the two biggest memory wins in three lines without
#             any helper functions; immediately visible savings.
# WEAKNESSES- per-column casting doesn't scale; for wide frames you
#             want a sweep (junior tier) and ideally pinned dtypes at
#             load time (senior tier).
#
import pandas as pd

before = df.memory_usage(deep=True).sum() / 1e6

df["amount"] = df["amount"].astype("float32")     # 64 -> 32 bits
df["city"]   = df["city"].astype("category")      # dictionary encode

after = df.memory_usage(deep=True).sum() / 1e6
print(f"{before:.1f}MB -> {after:.1f}MB")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - sweep all numeric columns with pd.to_numeric(...,
#             downcast=...) and convert low-cardinality object columns
#             to category. Wrap in a helper so it's reusable.
# STRENGTHS - typically halves memory on real datasets; the cardinality
#             threshold (<50% unique) is a reasonable default for
#             auto-categorizing strings.
# WEAKNESSES- runs over the whole frame in Python — slow on very wide
#             tables; categories created post-hoc cost a full pass.
#             Better to pin dtypes at load time (senior tier).
#
import pandas as pd

def reduce_memory(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes("float").columns:
        df[col] = pd.to_numeric(df[col], downcast="float")
    for col in df.select_dtypes("integer").columns:
        df[col] = pd.to_numeric(df[col], downcast="integer")
    for col in df.select_dtypes("object").columns:
        if df[col].nunique() / len(df) < 0.5:                # <50% unique
            df[col] = df[col].astype("category")
    return df

before = df.memory_usage(deep=True).sum() / 1e6
df = reduce_memory(df)
after  = df.memory_usage(deep=True).sum() / 1e6
print(f"{before:.1f}MB -> {after:.1f}MB ({100*(1-after/before):.0f}% saved)")

# Per-column attribution:
df.memory_usage(deep=True).sort_values(ascending=False).head()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - pin dtypes at load time (skips inference), use nullable
#             extension dtypes so missing values don't promote int -> float,
#             and prefer pyarrow-backed strings for memory + speed.
# STRENGTHS - load-time dtype hints are the cheapest possible win — no
#             Python pass over the data; nullable dtypes preserve int
#             semantics with NA; pyarrow strings can cut object-column
#             memory by 5-10x and speed up groupby/joins.
# WEAKNESSES- nullable Int64 / Float64 / boolean[pyarrow] surprise code
#             that expects numpy primitives; some libs (older sklearn,
#             some plotting paths) don't yet round-trip them; pyarrow
#             string requires pandas 2.0+.
#
import pandas as pd

# 1. Pin types at load time — fastest, no inference pass at all
df = pd.read_csv(
    "data.csv",
    dtype={
        "id":     "Int64",            # nullable int  (capital I)
        "amount": "float32",
        "city":   "category",
        "name":   "string[pyarrow]",  # arrow-backed string
    },
    parse_dates=["date"],
    engine="pyarrow",                 # 2-5x faster CSV parser
)

# 2. Migrate an existing frame to arrow-backed strings (pandas >= 2.0)
df = df.convert_dtypes(dtype_backend="pyarrow")

# 3. Decide BEFORE casting — measurement-driven
mem = df.memory_usage(deep=True).sort_values(ascending=False)
mem.head(10)                           # the top offenders are the targets

# Rule of thumb when picking dtypes:
#   numeric dense, no NA      -> float32 / int32
#   numeric with missing      -> Int64 / Float64 (nullable)
#   strings, low cardinality  -> category
#   strings, high cardinality -> string[pyarrow]

# Decision rule:
#   Object column, < ~50% unique values         -> .astype("category") (often 10-100x smaller)
#   Integer with no nulls, fits in 32 bits      -> downcast to "int32" or "int16"
#   Float that doesn't need 15-digit precision  -> "float32"
#   Integer with nulls                           -> "Int64" (nullable; preserves NaN)
#   String columns                               -> "string" dtype (PyArrow-backed at scale)
#   Booleans with missing                        -> "boolean" (NOT bool)
#   Profiling memory before/after                -> df.memory_usage(deep=True).sum()
#   Final-arrow-of-truth at scale                -> dtype_backend="pyarrow" on read
#
# Anti-pattern: leaving everything as object dtype because "it works"
#   Object columns store Python pointers — 50-100 bytes per row vs 1 byte for category.
#   A 10M-row DataFrame can drop from 4 GB to 200 MB just by tagging low-cardinality
#   strings as category. Always inspect df.dtypes after load and convert before
#   the data fans out across joins/groupbys.
```

## Decision Rule

```text
Object column, < ~50% unique values         -> .astype("category") (often 10-100x smaller)
Integer with no nulls, fits in 32 bits      -> downcast to "int32" or "int16"
Float that doesn't need 15-digit precision  -> "float32"
Integer with nulls                           -> "Int64" (nullable; preserves NaN)
String columns                               -> "string" dtype (PyArrow-backed at scale)
Booleans with missing                        -> "boolean" (NOT bool)
Profiling memory before/after                -> df.memory_usage(deep=True).sum()
Final-arrow-of-truth at scale                -> dtype_backend="pyarrow" on read
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving everything as object dtype because "it works"
>   Object columns store Python pointers — 50-100 bytes per row vs 1 byte for category.
>   A 10M-row DataFrame can drop from 4 GB to 200 MB just by tagging low-cardinality
>   strings as category. Always inspect df.dtypes after load and convert before
>   the data fans out across joins/groupbys.

## Tips

- Converting `object` columns to `"category"` saves the most memory for low-cardinality strings
- `float32` halves storage vs `float64` with minimal precision loss for most data science tasks
- Specifying `dtype=` at load time is faster than converting after — pandas skips the inference pass
- `df.memory_usage(deep=True)` shows true memory including string storage

## Common Mistake

> [!warning] Using `df.memory_usage()` without `deep=True` for string columns. Without it, object columns show only pointer size (~8 bytes per row), not actual string content size.

## Shorthand (Junior → Senior)

**Junior:**
```python
df['amount'] = df['amount'].astype('float32')
df['city'] = df['city'].astype('category')
before = df.memory_usage(deep=True).sum()
```

**Senior:**
```python
df = pd.read_csv('data.csv', dtype={
    'amount': 'float32', 'city': 'category'
})  # Set types at load time (faster)
```

## See Also

- [[Sections/pandas/io/pd-eval|pd.eval() (Pandas)]]
- [[Sections/numpy/operations/np-einsum|np.einsum() (NumPy)]]
- [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading (Databases & SQLAlchemy)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

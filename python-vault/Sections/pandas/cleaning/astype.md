---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "astype"
title: ".astype()"
category: "Cleaning"
subtitle: "Explicit type conversion — raises on bad values"
signature_short: "df[\"col\"].astype(dtype) | df.astype({\"col\": dtype})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".astype()"
  - "astype"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .astype()

> Explicit type conversion — raises on bad values

## Overview

astype() converts a column to a specified dtype. It raises an error if any value cannot be converted. Use pd.to_numeric(errors="coerce") or pd.to_datetime(errors="coerce") for messy data that should produce NaN on failure.

## Signature

```python
df["col"].astype(dtype) | df.astype({"col": dtype})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one column, one cast. No options. No NaN concerns.
# STRENGTHS - the simplest possible type-conversion; reads exactly
#             like the Python builtins (int, float, bool).
# WEAKNESSES- raises ValueError on bad values and on NaN with int —
#             the senior failure modes need to-numeric / nullable
#             dtypes (junior tier).
#
import pandas as pd

df["age"]    = df["age"].astype(int)
df["score"]  = df["score"].astype(float)
df["active"] = df["active"].astype(bool)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday astype patterns: dict form for multiple
#             columns at once, memory-efficient types (int32,
#             float32, category), and the nullable Int64 for
#             integer columns that contain NaN.
# STRENGTHS - one call sets the whole schema; nullable Int64 keeps
#             integers integer in the presence of nulls — the single
#             most common dtype trap solved.
# WEAKNESSES- still raises hard on bad values (e.g. "$12.50" -> int).
#             For messy data, pd.to_numeric(errors="coerce") is the
#             right tool — see the "to-numeric" entry.
#
import pandas as pd

# Multiple columns at once
df = df.astype({
    "age":   "int32",
    "score": "float32",
    "city":  "category",
})

# Memory-efficient numeric types
df["count"] = df["count"].astype("int32")        # vs int64
df["ratio"] = df["ratio"].astype("float32")      # vs float64

# Nullable integer — the fix for "int column with NaN coerced to float"
df["id"] = df["id"].astype("Int64")              # capital I

# Verify
df.dtypes
df.memory_usage(deep=True).sum() / 1e6           # MB
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - schema-driven casting: pin types at load time when
#             possible, fall back to to_numeric / to_datetime with
#             errors="coerce" for messy data, and prefer the nullable
#             extension dtypes (Int64, Float64, boolean, string) so
#             missing values don't promote to the wrong base type.
# STRENGTHS - load-time pinning skips the inference pass; nullable
#             dtypes preserve semantics; convert_dtypes(dtype_backend=
#             "pyarrow") is a one-liner upgrade for new pipelines.
# WEAKNESSES- nullable Int64 / Float64 / boolean still surprise code
#             that expects numpy primitives; some libraries don't yet
#             round-trip pyarrow-backed strings; old pickle files
#             can't read new dtypes.
#
import pandas as pd

# 1. Pin at load time — fastest, no inference pass
df = pd.read_csv("data.csv", dtype={
    "id":     "Int64",
    "amount": "float32",
    "city":   "category",
}, parse_dates=["date"])

# 2. Messy strings -> numeric: astype is the wrong tool
# df["price"].astype(float)               # ValueError on "$12.50"
df["price"] = pd.to_numeric(df["price"], errors="coerce")  # bad -> NaN

# 3. Whole-frame upgrade to nullable / pyarrow-backed dtypes (>= 2.0)
df = df.convert_dtypes(dtype_backend="pyarrow")

# 4. Audit the schema after every load — fail loudly on regressions
expected = pd.Series({
    "id":      "Int64",
    "amount":  "float32",
    "city":    "category",
    "date":    "datetime64[ns]",
})
actual = df.dtypes.astype(str)
mismatch = expected[expected != actual.reindex(expected.index)]
assert mismatch.empty, f"dtype regression: {mismatch.to_dict()}"

# Decision rule:
#   Reliable numeric conversion                 -> df["x"].astype("int32")
#   Numeric with possible bad strings            -> pd.to_numeric(s, errors="coerce")
#   Datetime conversion                          -> pd.to_datetime(s, utc=True)
#   String -> category                           -> .astype("category") (memory win)
#   Multiple columns at once                     -> df.astype({"a":"int32","b":"category"})
#   Nullable integer                             -> "Int64" (capital I)
#   Coerce errors to NaN                         -> pd.to_numeric(..., errors="coerce")
#   Not sure if conversion fits                  -> errors="raise" first, narrow dtypes after
#
# Anti-pattern: astype("int") on a Series that has NaN
#   numpy int can't hold NaN — pandas raises (or worse, silently casts via float).
#   Either fillna first (with a sentinel like -1) or use the nullable "Int64"
#   dtype that natively supports missing values.
```

## Decision Rule

```text
Reliable numeric conversion                 -> df["x"].astype("int32")
Numeric with possible bad strings            -> pd.to_numeric(s, errors="coerce")
Datetime conversion                          -> pd.to_datetime(s, utc=True)
String -> category                           -> .astype("category") (memory win)
Multiple columns at once                     -> df.astype({"a":"int32","b":"category"})
Nullable integer                             -> "Int64" (capital I)
Coerce errors to NaN                         -> pd.to_numeric(..., errors="coerce")
Not sure if conversion fits                  -> errors="raise" first, narrow dtypes after
```

## Anti-Pattern

> [!warning] Anti-pattern
> astype("int") on a Series that has NaN
>   numpy int can't hold NaN — pandas raises (or worse, silently casts via float).
>   Either fillna first (with a sentinel like -1) or use the nullable "Int64"
>   dtype that natively supports missing values.

## Tips

- Converting string columns to `"category"` can reduce memory by **10x** for low-cardinality data
- `"Int64"` (capital I, quoted string) is nullable integer — handles NaN without converting to float
- `astype()` raises on bad values — use `pd.to_numeric(errors="coerce")` for messy data
- Multiple columns at once: `df.astype({"a": int, "b": float})` — one call, no loop

## Common Mistake

> [!warning] `df["col"].astype(int)` on a column containing NaN raises ValueError — NaN is a float. Fill NaN first, or use `astype("Int64")` (capital I = nullable integer).

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

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

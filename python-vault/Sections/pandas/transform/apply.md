---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "apply"
title: ".apply()"
category: "Transform"
subtitle: "Last resort — use only when vectorized operations cannot work"
signature_short: "df.apply(fn, axis=1) | Series.apply(fn)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".apply()"
  - "apply"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .apply()

> Last resort — use only when vectorized operations cannot work

## Overview

apply(axis=1) calls fn on each row as a Series — it is the slowest pandas operation. Use vectorized operations, np.where(), or np.select() first. apply() is only justified when logic genuinely requires multiple column values per row.

## Signature

```python
df.apply(fn, axis=1) | Series.apply(fn)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest apply: a Series.apply with a small
#             function. Useful for one-off transformations.
# STRENGTHS - reads exactly like Python: take this column, run
#             this function on each element.
# WEAKNESSES- this is the slowest tool in the box. For numeric
#             ops, vectorized is 100-1000x faster. The next tier
#             shows when to reach for apply vs alternatives.
#
import pandas as pd

df["grade"] = df["score"].apply(lambda x: "A" if x >= 90 else "B")
# Faster: df["grade"] = np.where(df["score"] >= 90, "A", "B")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - decision-tree thinking around apply: vectorized
#             first, then np.where / np.select for branching, and
#             apply(axis=1) ONLY when the logic genuinely needs
#             multiple columns per row. Column-wise apply
#             (axis=0) is fine — it's the row-wise version that's
#             slow.
# STRENGTHS - codifies the "apply is the last resort" rule; shows
#             np.where and np.select as the right tools 90% of
#             the time.
# WEAKNESSES- doesn't yet show parallelizing the unavoidable
#             slow apply, or how to verify a candidate
#             vectorization gave the same result.
#
import pandas as pd
import numpy as np

# 1. Single condition -> np.where
df["grade"] = np.where(df["score"] >= 90, "A", "B")

# 2. Multiple conditions -> np.select (orders of magnitude faster
#    than apply with if/elif/else)
conditions = [
    (df["age"] > 60) & (df["score"] < 50),
    df["score"] < 70,
]
choices = ["high", "medium"]
df["risk"] = np.select(conditions, choices, default="low")

# 3. Column-wise apply (axis=0) is fine — it runs once per column
ranges = df.apply(lambda col: col.max() - col.min())

# 4. Apply(axis=1) is justified ONLY when no vectorized form exists
#    (e.g. logic that needs many columns AND can't be expressed as
#    arithmetic / np.select)
def risk_score(row):
    if row["age"] > 60 and row["score"] < 50:
        return "high"
    if row["score"] < 70:
        return "medium"
    return "low"
# df["risk"] = df.apply(risk_score, axis=1)   # only if you must
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rules for apply: ALWAYS try a vectorized
#             form first (and verify equivalence on a sample),
#             cache or memoize anything inside the function, and
#             reach for swifter / pandarallel / a Cython UDF only
#             after measurement. apply(axis=1) is a code-review
#             flag, not a habit.
# STRENGTHS - measurement-driven — you keep apply only when the
#             vectorized version actually doesn't exist;
#             parallelization buys real speed when the function
#             is genuinely expensive; cython/numba is the floor
#             when nothing else works.
# WEAKNESSES- swifter/pandarallel add a dep and don't always win;
#             numba requires numeric-only functions; some real
#             problems (free-text classification, external API
#             calls) genuinely don't vectorize and you'll live
#             with apply.
#
import pandas as pd
import numpy as np

# 1. Always look for a vectorized equivalent — and verify
slow = df.apply(lambda r: r["a"] * r["b"] + r["c"], axis=1)
fast = df["a"] * df["b"] + df["c"]
assert slow.equals(fast)            # confirm before deleting the apply

# 2. Memoize expensive per-row work that has small input cardinality
from functools import lru_cache

@lru_cache(maxsize=None)
def expensive(key: str) -> int:
    # imagine this hits a DB or runs a model
    return len(key) * 7

df["x"] = df["key"].map(expensive)   # map > apply for Series; cached call

# 3. Parallelize when the function is truly slow per-row
# pip install swifter
# import swifter
# df["risk"] = df.swifter.apply(risk_score, axis=1)

# 4. Numeric-only hot loop -> numba
# from numba import njit
# @njit
# def kernel(a, b, c): return a * b + c
# df["x"] = kernel(df["a"].to_numpy(), df["b"].to_numpy(), df["c"].to_numpy())

# Decision rule, in order:
#   1. vectorized pandas/numpy expression
#   2. np.where / np.select for branching
#   3. .map(dict) or .map(fn) for element-wise on a Series
#   4. groupby + transform/agg for per-group ops
#   5. apply(axis=1)         <- only when none of the above work
#   6. swifter / numba       <- only after measurement says it helps

# Decision rule:
#   Vectorized op exists                        -> use it; NEVER apply
#   Row-wise function (rare)                     -> df.apply(fn, axis=1) (slow but flexible)
#   Per-column reduction                          -> df.apply(fn, axis=0) (or just .agg)
#   Per-element                                   -> .map (Series) or .applymap (DataFrame)
#   Heavy custom logic                             -> consider .pipe + numpy / numba
#   Need the row as a dict                         -> apply(fn, axis=1) gives a Series per row
#   Group-wise                                    -> df.groupby(g).apply(fn) (still slow)
#   Speed-critical                                -> drop down to numpy or use df["x"].to_numpy()
#
# Anti-pattern: df.apply(lambda row: row.a + row.b, axis=1)
#   row-wise apply is a Python for-loop in disguise — orders of magnitude
#   slower than the vectorized df.a + df.b. Reach for apply ONLY when no
#   vectorized op exists; verify by profiling, not by habit.
```

## Decision Rule

```text
Vectorized op exists                        -> use it; NEVER apply
Row-wise function (rare)                     -> df.apply(fn, axis=1) (slow but flexible)
Per-column reduction                          -> df.apply(fn, axis=0) (or just .agg)
Per-element                                   -> .map (Series) or .applymap (DataFrame)
Heavy custom logic                             -> consider .pipe + numpy / numba
Need the row as a dict                         -> apply(fn, axis=1) gives a Series per row
Group-wise                                    -> df.groupby(g).apply(fn) (still slow)
Speed-critical                                -> drop down to numpy or use df["x"].to_numpy()
```

## Anti-Pattern

> [!warning] Anti-pattern
> df.apply(lambda row: row.a + row.b, axis=1)
>   row-wise apply is a Python for-loop in disguise — orders of magnitude
>   slower than the vectorized df.a + df.b. Reach for apply ONLY when no
>   vectorized op exists; verify by profiling, not by habit.

## Tips

- `np.where(cond, true, false)` replaces most single-condition apply calls
- `np.select(conditions, choices, default)` replaces multi-condition apply — 100x faster
- `df.apply(fn, axis=0)` (column-wise) is fast; `df.apply(fn, axis=1)` (row-wise) is slow
- For unavoidable row-wise apply: `swifter` or `pandarallel` parallelize it

## Common Mistake

> [!warning] `df.apply(lambda row: row["a"] + row["b"], axis=1)` for numeric ops. `df["a"] + df["b"]` is vectorized and ~1000x faster.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "aggregations"
title: "Aggregations"
category: "Operations"
subtitle: "axis=0 collapses rows (per column), axis=1 collapses columns (per row)"
signature_short: "a.sum(axis=0) | a.mean() | np.percentile(a, 75)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Aggregations"
  - "aggregations"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# Aggregations

> axis=0 collapses rows (per column), axis=1 collapses columns (per row)

## Overview

Aggregation functions reduce an array along a specified axis. axis=0 collapses rows — the result has the shape of a single row. axis=1 collapses columns — the result has the shape of a single column. No axis argument aggregates everything.

## Signature

```python
a.sum(axis=0) | a.mean() | np.percentile(a, 75)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - reduce the whole array to a single number with
#             sum/mean/min/max.
# STRENGTHS - the simplest possible aggregation; same call
#             shape for any dim.
# WEAKNESSES- doesn't yet introduce axis= (the most important
#             argument) or the keepdims=True habit.
#
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=float)
a.sum()           # 45
a.mean()          # 5.0
a.min(); a.max()  # 1.0, 9.0
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the axis= argument is the whole game: axis=0
#             collapses ROWS (per-column result), axis=1
#             collapses COLUMNS (per-row result). Use
#             keepdims=True when you need to broadcast the
#             result back. Cumulative ops and argmin/argmax
#             follow the same axis convention.
# STRENGTHS - the axis= mental model is what unlocks
#             vectorized data analysis; keepdims=True is the
#             single most useful flag for "use the reduction
#             as a feature".
# WEAKNESSES- doesn't address NaN-safe variants or the
#             dtype-promotion gotcha — senior tier.
#
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=float)

# axis=0 collapses ROWS -> per-column result
a.sum(axis=0)            # [12, 15, 18]
a.mean(axis=0)           # column means

# axis=1 collapses COLS -> per-row result
a.sum(axis=1)            # [ 6, 15, 24]
a.mean(axis=1)           # row means

# keepdims=True keeps the reduced axis as size-1 for broadcasting
a - a.mean(axis=1, keepdims=True)        # center each row

# Cumulative
a.cumsum()                # flatten, then cumsum
a.cumsum(axis=1)          # running sum along rows

# Index reductions
a.argmin(axis=0)          # row-index of min per column
a.argmax(axis=1)          # col-index of max per row

# Percentiles
np.percentile(a, [25, 50, 75])
np.median(a)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production aggregations: NaN-safe variants
#             (nansum/nanmean) when input quality is unknown;
#             dtype= argument to pin output type and avoid
#             integer overflow on large sums; weighted ops via
#             np.average; tuple-axis reduction for batch ops.
# STRENGTHS - NaN-safe is the right default on real data;
#             dtype= prevents int32 overflow on huge sums;
#             weighted average is the right tool for "average
#             weighted by count"; tuple-axis is essential for
#             batched tensor ops.
# WEAKNESSES- nan-prefixed variants silently drop NaN — log
#             how many were dropped or you'll never notice
#             upstream data issues; dtype= override doesn't
#             prevent precision loss in float32->float64
#             chains.
#
import numpy as np

# 1. NaN-safe aggregations on potentially-dirty data
data = np.array([1.0, 2.0, np.nan, 4.0])
n_dropped = np.isnan(data).sum()
result = np.nanmean(data)
# log_metric("nan_dropped", n_dropped)

# 2. dtype= to prevent int overflow
big = np.full(10**8, 30, dtype=np.int32)
big.sum()                 # may overflow int32 silently
big.sum(dtype=np.int64)   # safe — accumulates as int64

# 3. Weighted aggregation
prices = np.array([10.0, 20.0, 30.0])
counts = np.array([100,  50,   25])
np.average(prices, weights=counts)        # weighted mean

# 4. Tuple-axis reduction — batch tensor ops
batch = np.random.randn(32, 64, 64)       # (B, H, W)
batch.mean(axis=(1, 2))                   # one mean per item, shape (32,)
batch.std(axis=(1, 2), keepdims=True)     # shape (32, 1, 1)

# Decision rule:
#   may contain NaN                              -> nan-prefixed (log dropped count)
#   integer dtype, large sum                     -> .sum(dtype=np.int64) explicitly
#   weighted by another column                   -> np.average(arr, weights=...)
#   batch reduction (B, ...)                     -> axis=tuple(remaining dims)
#   need to broadcast result back                -> keepdims=True
#   want index of min/max, not value             -> argmin / argmax (NOT min/max)
#   percentile or median                         -> np.percentile / np.median
#
# Anti-pattern: int32 .sum() over a large array silently overflowing
#   big = np.full(10**8, 30, dtype=np.int32); big.sum()  # wraps past 2**31
#   The result is a wrong, deterministic-looking integer with no warning.
#   Pin accumulator dtype: big.sum(dtype=np.int64), or upcast first
#   (big.astype(np.int64).sum()). Same applies to float32 * very-long means.
```

## Decision Rule

```text
may contain NaN                              -> nan-prefixed (log dropped count)
integer dtype, large sum                     -> .sum(dtype=np.int64) explicitly
weighted by another column                   -> np.average(arr, weights=...)
batch reduction (B, ...)                     -> axis=tuple(remaining dims)
need to broadcast result back                -> keepdims=True
want index of min/max, not value             -> argmin / argmax (NOT min/max)
percentile or median                         -> np.percentile / np.median
```

## Anti-Pattern

> [!warning] Anti-pattern
> int32 .sum() over a large array silently overflowing
>   big = np.full(10**8, 30, dtype=np.int32); big.sum()  # wraps past 2**31
>   The result is a wrong, deterministic-looking integer with no warning.
>   Pin accumulator dtype: big.sum(dtype=np.int64), or upcast first
>   (big.astype(np.int64).sum()). Same applies to float32 * very-long means.

## Tips

- `axis=0` reduces rows → result shape is the column shape; `axis=1` reduces columns → result shape is the row shape
- `keepdims=True` preserves the reduced axis as size-1 — essential for broadcasting results back
- `argmax()` returns indices, `max()` returns values — they are distinct functions
- `np.nanmean()`, `np.nansum()` etc. ignore NaN — always prefer these over `mean()` when NaN may exist

## Common Mistake

> [!warning] `a.mean(axis=1)` gives shape `(n,)`. Subtracting from `a` of shape `(n,m)` raises a broadcast error. Use `a.mean(axis=1, keepdims=True)` to get shape `(n,1)` which broadcasts correctly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([[1,2,3],[4,5,6],[7,8,9]], dtype=float)
a.sum()      # 45
a.mean()     # 5.0
```

**Senior:**
```python
np.median(a)
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

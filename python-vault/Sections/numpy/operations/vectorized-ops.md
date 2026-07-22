---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "vectorized-ops"
title: "Vectorized operations"
category: "Operations"
subtitle: "Array arithmetic in C — 10-100x faster than Python loops"
signature_short: "a + b | a * b (element-wise) | a @ b (matrix multiply)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Vectorized operations"
  - "vectorized-ops"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# Vectorized operations

> Array arithmetic in C — 10-100x faster than Python loops

## Overview

NumPy vectorized operations apply to every element at C speed without Python loops. Operators (+, -, *, /, **, //, %) are all element-wise. Use @ or np.dot() for matrix multiplication.

## Signature

```python
a + b | a * b (element-wise) | a @ b (matrix multiply)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - element-wise arithmetic with the standard
#             operators. No loops.
# STRENGTHS - shows the core promise of NumPy in three lines:
#             write math, get C speed.
# WEAKNESSES- doesn't yet show ufuncs, the scalar form, or the
#             matrix-multiply confusion (* is element-wise!).
#
import numpy as np

a = np.array([1., 4., 9., 16.])
b = np.array([2., 2., 3., 4.])

a + b              # element-wise
a * b              # element-wise (NOT matrix multiply)
a ** 2             # element-wise power
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday vectorized surface: scalar broadcast,
#             ufuncs (sqrt, exp, log, sin, etc.), comparisons
#             producing boolean masks, and the * vs @ matrix-
#             multiply trap.
# STRENGTHS - covers the math-vocabulary you write daily; the
#             matrix-multiply distinction is the most common
#             source of "wrong shape" bugs.
# WEAKNESSES- doesn't address in-place ops, ufunc out= for
#             memory savings, or the safe-divide pattern —
#             senior tier.
#
import numpy as np

a = np.array([1., 4., 9., 16.])

# Scalar broadcast and comparisons
a + 10                       # add to every element
a > 3                        # [False True True True]

# ufuncs — element-wise math
np.sqrt(a); np.exp(a); np.log(a)
np.sin(a); np.cos(a); np.abs(a - 5)
np.floor(a); np.ceil(a); np.round(a, 2)

# Matrix multiply vs element-wise — DIFFERENT operators
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
A @ B                        # matrix multiply  -> [[19, 22], [43, 50]]
A * B                        # ELEMENT-WISE     -> [[5, 12], [21, 32]]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production vectorization: in-place ops to avoid
#             allocations, ufunc out= for explicit destination
#             buffers, np.errstate for division/log safety, and
#             the rule that np.vectorize is a CONVENIENCE
#             wrapper — it does NOT speed code up.
# STRENGTHS - in-place + out= keeps memory bounded in tight
#             loops; np.errstate prevents NaN/inf from
#             silently propagating; calling out the
#             np.vectorize myth saves people from a common
#             trap.
# WEAKNESSES- in-place ops can surprise callers who didn't
#             expect mutation; out= requires the right shape;
#             np.errstate is a context manager, easy to forget.
#
import numpy as np

a = np.linspace(0.1, 10, 1_000_000, dtype=np.float32)

# 1. In-place arithmetic — no allocation
a += 1                        # write to same memory
a *= 2

# 2. ufunc out= — explicit destination
out = np.empty_like(a)
np.multiply(a, 3.0, out=out)  # write into out

# 3. Safe division / log under known-bad inputs
with np.errstate(divide="ignore", invalid="ignore"):
    ratio = np.where(b != 0, a / b, 0.0)
    log_a = np.where(a > 0, np.log(a), -np.inf)

# 4. np.vectorize is a Python-loop convenience, NOT a speed-up
# slow = np.vectorize(some_python_fn)(arr)     # still a Python loop
# Right: rewrite using ufuncs / np.where / np.select for real speed.

# Decision rule:
#   element-wise math (+, -, *, /, **)           -> direct operators / ufuncs
#   matrix product (rows x cols)                 -> @ or np.matmul (NEVER *)
#   batched matmul over leading axes             -> @ broadcasts; np.einsum for clarity
#   memory-tight inner loop                      -> in-place += / *= or out= kwarg
#   division/log over data that may be 0/neg     -> np.errstate(...) + np.where guard
#   want NaN-aware math                          -> np.nansum / np.nanmean / np.nan_to_num
#   need to call a Python fn over each element   -> rewrite with ufuncs (NOT np.vectorize)
#
# Anti-pattern: np.vectorize(fn) thinking it gives speed
#   np.vectorize is a CONVENIENCE wrapper around a Python for-loop — it does
#   NOT release the GIL or use C code. It is sometimes 100x slower than the
#   equivalent ufunc/np.where formulation. Refactor the function in terms of
#   array ops (np.where, np.select, ufuncs); only fall back to np.vectorize
#   for genuinely scalar-only logic where speed doesn't matter.
```

## Decision Rule

```text
element-wise math (+, -, *, /, **)           -> direct operators / ufuncs
matrix product (rows x cols)                 -> @ or np.matmul (NEVER *)
batched matmul over leading axes             -> @ broadcasts; np.einsum for clarity
memory-tight inner loop                      -> in-place += / *= or out= kwarg
division/log over data that may be 0/neg     -> np.errstate(...) + np.where guard
want NaN-aware math                          -> np.nansum / np.nanmean / np.nan_to_num
need to call a Python fn over each element   -> rewrite with ufuncs (NOT np.vectorize)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.vectorize(fn) thinking it gives speed
>   np.vectorize is a CONVENIENCE wrapper around a Python for-loop — it does
>   NOT release the GIL or use C code. It is sometimes 100x slower than the
>   equivalent ufunc/np.where formulation. Refactor the function in terms of
>   array ops (np.where, np.select, ufuncs); only fall back to np.vectorize
>   for genuinely scalar-only logic where speed doesn't matter.

## Tips

- `a @ b` is matrix multiply; `a * b` is element-wise — confusing them is the #1 NumPy mistake
- Vectorized operations run in C — a loop over 1M elements takes ~1s in Python, ~1ms in NumPy
- `np.clip(a, lo, hi)` is the vectorized clamp — no loop needed
- `np.maximum(a, b)` is element-wise max between two arrays; `np.max(a)` is the max of one array

## Common Mistake

> [!warning] Using `a * b` for matrix multiplication. This is element-wise. Use `a @ b` or `np.dot(a, b)` for matrix multiplication.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([1., 4., 9., 16.])
b = np.array([2., 2., 3., 4.])
a + b               # [3., 6., 12., 20.]
```

**Senior:**
```python
A * B               # [[5,12],[21,32]] — element-wise!
```

## See Also

- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/np-nan|np.nan handling (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

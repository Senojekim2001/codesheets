---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-array"
title: "np.array()"
category: "Creation"
subtitle: "The fundamental constructor — specify dtype= for clarity"
signature_short: "np.array(data, dtype=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.array()"
  - "np-array"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.array()

> The fundamental constructor — specify dtype= for clarity

## Overview

np.array() converts Python lists, tuples, or nested lists into a NumPy ndarray. Arrays are fixed-type and store data in contiguous memory — this is why they are 10-100x faster than lists for numeric operations. Always specify dtype= for clarity.

## Signature

```python
np.array(data, dtype=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest constructor: a Python list becomes a 1D
#             ndarray. Inspect the basic attributes.
# STRENGTHS - introduces the key idea — a NumPy array is "values
#             plus shape plus dtype" — in five lines.
# WEAKNESSES- doesn't yet show 2D construction, dtype pinning,
#             or the copy/view distinction that bites real code.
#
import numpy as np

a = np.array([1, 2, 3, 4, 5])
a.shape       # (5,)
a.dtype       # dtype('int64')
a.size        # 5
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday array surface: 2D from nested lists,
#             explicit dtype= for clarity and memory, the
#             attribute cluster you inspect daily, and the
#             copy-vs-view distinction with .astype always
#             returning a copy.
# STRENGTHS - covers what np.array looks like in real code: a
#             pinned dtype, a known shape, and an explicit
#             decision about whether downstream changes should
#             propagate.
# WEAKNESSES- doesn't address the "ragged array" trap (lists of
#             different lengths quietly produce object dtype)
#             or pyarrow-backed ext dtypes — senior tier.
#
import numpy as np

# 2D from nested lists; pin dtype for memory and clarity
A = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.int32)
A.shape, A.ndim, A.dtype          # ((2, 3), 2, dtype('int32'))

# Float vs bool variants
np.array([1, 2, 3], dtype=np.float64)
np.array([1, 0, 1], dtype=np.bool_)

# Inspect the cluster
A.itemsize, A.nbytes              # (4, 24)  — bytes per elem, total bytes

# Type conversion always returns a NEW array
B = A.astype(np.float32)

# Copy vs view — view shares memory with original
v = A.view()
v[0, 0] = 99
A[0, 0]                            # 99 — view propagates writes
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production array construction: catch ragged-input
#             early (object dtype is almost always a bug), pin
#             dtype + memory layout (C vs Fortran order) on
#             purpose for downstream speed, and use np.ascontiguousarray
#             when crossing into C/Cython/torch.
# STRENGTHS - object-dtype detection prevents silent perf
#             collapse (vectorized ops fall back to Python
#             loops); explicit memory order matters when handing
#             buffers to GPU/Cython code; ascontiguousarray is
#             the canonical "make this array C-friendly" call.
# WEAKNESSES- ragged-input detection adds a runtime check; F-order
#             arrays still confuse code that assumes C-order;
#             ascontiguousarray copies if the source isn't
#             already contiguous — fine, but worth knowing.
#
import numpy as np

# 1. Detect ragged input — np.array silently produces object dtype
def safe_array(data, dtype=None):
    arr = np.asarray(data, dtype=dtype)
    if arr.dtype == object:
        raise TypeError(
            "ragged or non-numeric input -> object dtype; "
            "all rows must share length and a numeric type"
        )
    return arr

# safe_array([[1, 2], [3, 4, 5]])     # raises -> ragged
# safe_array([[1, 2], [3, 4]])        # ok

# 2. Memory order — C (row-major) vs F (column-major)
A = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float64, order="C")
F = np.asfortranarray(A)
A.flags["C_CONTIGUOUS"], F.flags["F_CONTIGUOUS"]   # (True, True)

# 3. Hand a buffer to a C extension / GPU library
buf = np.ascontiguousarray(some_array, dtype=np.float32)   # forced C + dtype

# 4. asarray vs array — avoid an unnecessary copy
src = np.array([1, 2, 3])
np.asarray(src) is src                  # True  — no copy
np.array(src)   is src                  # False — always copies

# Anti-pattern: relying on inferred dtype for numeric pipelines
#   a = np.array([1, 2, 3])          # int64 on Linux/macOS, int32 on Windows
# Always pin: np.array(..., dtype=np.int32)
#
# Decision rule:
#   already an ndarray, want no copy             -> np.asarray(x)
#   need a guaranteed independent copy           -> np.array(x) or x.copy()
#   change dtype only                            -> x.astype(dtype) (always copies)
#   handing buffer to C/Cython/torch/cuda        -> np.ascontiguousarray(x, dtype=...)
#   column-major consumer (LAPACK/Fortran)       -> np.asfortranarray(x)
#   ragged or mixed-type input                   -> reject early; refuse object dtype
#   memory-tight numeric grid                    -> pin dtype=np.float32 / np.int32
```

## Decision Rule

```text
already an ndarray, want no copy             -> np.asarray(x)
need a guaranteed independent copy           -> np.array(x) or x.copy()
change dtype only                            -> x.astype(dtype) (always copies)
handing buffer to C/Cython/torch/cuda        -> np.ascontiguousarray(x, dtype=...)
column-major consumer (LAPACK/Fortran)       -> np.asfortranarray(x)
ragged or mixed-type input                   -> reject early; refuse object dtype
memory-tight numeric grid                    -> pin dtype=np.float32 / np.int32
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on inferred dtype for numeric pipelines
>   a = np.array([1, 2, 3])          # int64 on Linux/macOS, int32 on Windows
> Always pin: np.array(..., dtype=np.int32)

## Tips

- Use `dtype=np.float32` instead of default `float64` when memory matters — halves storage
- NumPy infers dtype from the data — mixed int/float input gives float64
- `a.copy()` makes an independent array; `a.view()` shares memory with the original
- `a.astype(np.float32)` always returns a copy — the dtype is changed

## Common Mistake

> [!warning] Creating a 2D array with rows of different lengths: `np.array([[1,2],[3,4,5]])`. This creates a 1D array of Python lists, not a 2D ndarray. All rows must have the same length.

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

- [[Sections/numpy/creation/np-zeros|np.zeros() (NumPy)]]
- [[Sections/numpy/creation/np-ones|np.ones() (NumPy)]]
- [[Sections/numpy/creation/np-arange|np.arange() (NumPy)]]
- [[Sections/numpy/creation/np-linspace|np.linspace() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

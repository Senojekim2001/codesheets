---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-dtype-perf"
title: "dtype optimization"
category: "Operations"
subtitle: "float32 halves memory; C-contiguous layout is fastest"
signature_short: "a.astype(np.float32) | np.ascontiguousarray(a)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dtype optimization"
  - "np-dtype-perf"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# dtype optimization

> float32 halves memory; C-contiguous layout is fastest

## Overview

NumPy performance depends heavily on dtype and memory layout. float32 uses half the memory of float64. C-contiguous arrays (row-major) are fastest for row operations; Fortran-contiguous (column-major) for column operations.

## Signature

```python
a.astype(np.float32) | np.ascontiguousarray(a)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - pin a smaller dtype at allocation; check size
#             with .nbytes / .itemsize.
# STRENGTHS - the smallest possible memory win — float32
#             halves memory vs the default float64.
# WEAKNESSES- doesn't yet show in-place ops, contiguity, or
#             the np.vectorize trap.
#
import numpy as np

a = np.arange(1_000_000, dtype=np.float32)
a.itemsize, a.nbytes        # (4, 4_000_000)   — half of float64
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday performance levers: dtype pinning,
#             in-place ops to avoid allocations, contiguity
#             checks before C-extension boundaries, and the
#             out= argument for explicit destination buffers.
# STRENGTHS - covers the four levers that matter most: less
#             memory, no copies, contiguous layout, no
#             temporary allocations.
# WEAKNESSES- doesn't address the np.vectorize myth or how
#             to choose between numpy / numba / cython for
#             real bottlenecks — senior tier.
#
import numpy as np

# Memory: pick the smallest correct dtype
# float64 (default) 8B  | float32 4B
# int64             8B  | int32 4B  | int16 2B  | bool 1B
a = np.arange(1e6, dtype=np.float32)

# Convert (always a copy)
a.astype(np.float32)
a.astype(np.int32)

# Check contiguity
a.flags["C_CONTIGUOUS"]
a.flags["F_CONTIGUOUS"]
a = np.ascontiguousarray(a)            # force C-order

# In-place math — no allocation
a += 1
a *= 2

# Explicit output buffer
b = np.random.rand(len(a)).astype(np.float32)
np.add(a, b, out=a)                    # writes into a's memory
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production performance work: profile before
#             optimizing; reach for the right tool by tier
#             (vectorized -> numexpr -> numba -> Cython);
#             pin dtype at the boundary (load time / config),
#             not deep in functions; np.vectorize is NOT a
#             speedup — it's a Python loop in disguise.
# STRENGTHS - the tier of optimization tools is the actual
#             decision tree experts use; calling out the
#             np.vectorize myth saves people from a common
#             trap; boundary-pinning prevents silent
#             precision loss.
# WEAKNESSES- numexpr/numba/cython add dependencies; profiling
#             setup is its own learning curve; some specialized
#             BLAS-friendly ops are already at peak perf with
#             plain numpy.
#
import numpy as np

# 1. Profile FIRST, optimize SECOND
# %timeit fn(arr)             # in Jupyter
# import cProfile; cProfile.run("fn(arr)")
# Identify the actual bottleneck before changing anything.

# 2. Tier of optimization tools
#    a) Pure numpy vectorization — the default; usually enough
#    b) numexpr (out-of-core, multi-thread) for chained float ops
#    c) numba @njit when numpy alone isn't fast enough
#    d) Cython / C extension for the last 2-3x

# import numexpr as ne
# ne.evaluate("a*b + c*d")               # 2-4x faster than chained numpy

# from numba import njit
# @njit
# def kernel(a, b):                       # JIT-compiled to C-level speed
#     out = np.empty_like(a)
#     for i in range(len(a)):
#         out[i] = a[i] * a[i] + b[i]
#     return out

# 3. Pin dtype at the boundary, not in helpers
def load_data(path: str) -> np.ndarray:
    arr = np.load(path).astype(np.float32, copy=False)
    return np.ascontiguousarray(arr)

# 4. Common pitfalls
#    np.vectorize(fn)         # Python loop in disguise — no speedup
#    np.append in a loop      # O(n^2) — collect then concatenate once
#    inv(A) @ b               # numerically unstable — use solve(A, b)
#    repeated reshape/copy    # check .flags first; ascontiguousarray once

# Decision rule:
#   default numeric work                         -> plain numpy + correct dtype
#   memory-tight inner loop                      -> in-place += / *= / out= kwarg
#   chained pure-float ufuncs (a*b + c*d)        -> numexpr.evaluate("...")
#   custom scalar kernel needed                  -> numba @njit (or @vectorize)
#   want last 2-3x for a known hot path          -> Cython / C extension
#   moving to GPU                                -> cupy (numpy-compatible) or torch
#   I/O or Python-dominated time                 -> profile first; numpy won't help
#   half-precision OK (ML inference)             -> dtype=np.float16 (smaller, watch overflow)
#
# Anti-pattern: pre-emptively rewriting numpy code in numba/cython "for speed"
#   The optimization order is: (1) profile to confirm the bottleneck,
#   (2) try plain numpy vectorization (often gets 90%), (3) numexpr or numba
#   only for proven hot paths. Jumping to numba/cython first costs build
#   complexity and dependencies for code that wasn't actually the bottleneck.
```

## Decision Rule

```text
default numeric work                         -> plain numpy + correct dtype
memory-tight inner loop                      -> in-place += / *= / out= kwarg
chained pure-float ufuncs (a*b + c*d)        -> numexpr.evaluate("...")
custom scalar kernel needed                  -> numba @njit (or @vectorize)
want last 2-3x for a known hot path          -> Cython / C extension
moving to GPU                                -> cupy (numpy-compatible) or torch
I/O or Python-dominated time                 -> profile first; numpy won't help
half-precision OK (ML inference)             -> dtype=np.float16 (smaller, watch overflow)
```

## Anti-Pattern

> [!warning] Anti-pattern
> pre-emptively rewriting numpy code in numba/cython "for speed"
>   The optimization order is: (1) profile to confirm the bottleneck,
>   (2) try plain numpy vectorization (often gets 90%), (3) numexpr or numba
>   only for proven hot paths. Jumping to numba/cython first costs build
>   complexity and dependencies for code that wasn't actually the bottleneck.

## Tips

- float32 is acceptable for most ML tasks and halves memory vs float64
- In-place operations (`+=`, `*=`) avoid allocating a new array — critical in memory-bound loops
- `np.add(a, b, out=a)` is the most explicit in-place operation
- Avoid repeated concatenation in a loop — allocate the result array first with `np.empty(final_shape)` and fill it

## Common Mistake

> [!warning] Using `np.vectorize()` thinking it speeds things up. It is a convenience wrapper that loops in Python — same speed as a for loop. Use actual ufuncs or Numba for real speedup.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.arange(1e6, dtype=np.float32)   # 4MB vs 8MB
a.itemsize   # 4
a.nbytes     # 4000000
```

**Senior:**
```python
np.add(a, b, out=a)    # explicit output array
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

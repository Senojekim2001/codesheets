---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-zeros"
title: "np.zeros()"
category: "Creation"
subtitle: "Safe zero-initialized array — use np.empty() only when you will fill every element"
signature_short: "np.zeros(shape, dtype=float)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.zeros()"
  - "np-zeros"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.zeros()

> Safe zero-initialized array — use np.empty() only when you will fill every element

## Overview

np.zeros() creates an array of a given shape filled with 0.0 (float64 by default). np.zeros_like() creates a zero array matching an existing array's shape and dtype. np.empty() is faster but contains uninitialized garbage — only use it when you will write to every element.

## Signature

```python
np.zeros(shape, dtype=float)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - allocate a zero-filled array of a given shape.
#             That's the whole feature.
# STRENGTHS - the simplest pre-allocation pattern in NumPy;
#             reads the same in 1D and 2D.
# WEAKNESSES- doesn't yet show np.zeros_like, dtype options, or
#             the np.full / np.eye family of related allocators.
#
import numpy as np

np.zeros(5)            # [0. 0. 0. 0. 0.]   — 1D
np.zeros((3, 4))       # 3x4 matrix of zeros
np.zeros((2, 3, 4))    # 3D tensor
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday allocator family: zeros / ones / full
#             with explicit dtype, the *_like helpers that match
#             an existing array, and np.eye for identity matrices.
# STRENGTHS - covers what real code does: pre-allocate a buffer,
#             match an upstream shape, build a constant matrix
#             with the right dtype.
# WEAKNESSES- doesn't surface the np.empty trap (uninitialized
#             memory looks like zeros until it doesn't) or the
#             "build by accumulation" anti-pattern — senior tier.
#
import numpy as np

# Typed allocators — pin the dtype on purpose
np.zeros((3, 3), dtype=np.int32)
np.zeros((3, 3), dtype=bool)              # all False

# *_like — match an existing array's shape AND dtype
np.zeros_like(a)
np.zeros_like(a, dtype=np.float32)        # override dtype only

# np.full — any constant fill, clearer than ones * value
np.full((3, 3), 7)
np.full((2, 2), np.inf)
np.full_like(a, fill_value=99)

# np.eye / np.identity — identity matrix
np.eye(4)                                 # 4x4 identity (float)
np.eye(4, dtype=int)
np.eye(4, k=1)                            # ones on superdiagonal
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production allocation: pre-size buffers and write
#             into them rather than appending; reach for np.empty
#             ONLY when every element is overwritten before read;
#             use np.zeros for boolean masks initialized to False;
#             align dtype/order with downstream consumers.
# STRENGTHS - pre-sized writes are 10-100x faster than appending
#             in a loop; np.empty is a real optimization when
#             you'll fill every cell; explicit dtype/order
#             prevents silent copies at boundaries.
# WEAKNESSES- np.empty is unsafe if any cell is read before
#             write; pre-sizing requires knowing the shape up
#             front; F-order arrays surprise C-order consumers.
#
import numpy as np

# 1. Pre-size and fill — never accumulate with np.concatenate in a loop
def squared(xs):
    out = np.empty(len(xs), dtype=np.float32)     # uninitialized -> safe IF
    for i, x in enumerate(xs):                    # we write every cell
        out[i] = x * x
    return out

# 2. Boolean mask — zeros (False) is the safe default
keep = np.zeros(len(arr), dtype=bool)
keep[some_indices] = True
filtered = arr[keep]

# 3. Match an existing array's MEMORY LAYOUT, not just dtype
A = np.asfortranarray(np.random.randn(1000, 100))
B = np.zeros_like(A)                              # also F-contiguous

# 4. When zeros isn't what you want
#    np.zeros          - zero-initialized; safe default
#    np.empty          - uninitialized; faster, only safe if you'll
#                        write every cell before any read
#    np.full(shape, v) - any constant; clearer than zeros + add v
#    np.zeros_like(a)  - matches shape AND dtype AND order

# Anti-pattern: building arrays by appending
#   out = np.array([])
#   for x in xs: out = np.append(out, fn(x))    # O(n^2) — copies every iteration
# Right: pre-size with np.empty / np.zeros, then fill in-place.
#
# Decision rule:
#   need zeros, will read before fill            -> np.zeros(shape, dtype=...)
#   will overwrite every cell before any read    -> np.empty(shape, dtype=...)
#   need a constant value other than 0           -> np.full(shape, value, dtype=...)
#   match an existing array's shape+dtype+order  -> np.zeros_like(a) / np.empty_like(a)
#   identity / diagonal matrix                   -> np.eye / np.identity
#   boolean mask defaulting to False             -> np.zeros(shape, dtype=bool)
#   accumulating results in a loop               -> pre-size + index-write, never np.append
```

## Decision Rule

```text
need zeros, will read before fill            -> np.zeros(shape, dtype=...)
will overwrite every cell before any read    -> np.empty(shape, dtype=...)
need a constant value other than 0           -> np.full(shape, value, dtype=...)
match an existing array's shape+dtype+order  -> np.zeros_like(a) / np.empty_like(a)
identity / diagonal matrix                   -> np.eye / np.identity
boolean mask defaulting to False             -> np.zeros(shape, dtype=bool)
accumulating results in a loop               -> pre-size + index-write, never np.append
```

## Anti-Pattern

> [!warning] Anti-pattern
> building arrays by appending
>   out = np.array([])
>   for x in xs: out = np.append(out, fn(x))    # O(n^2) — copies every iteration
> Right: pre-size with np.empty / np.zeros, then fill in-place.

## Tips

- Default dtype is `float64` — specify `dtype=int` or `dtype=bool` when needed
- `np.zeros_like(a)` is the clearest way to create a zero array with the same shape as an existing one
- `np.empty()` is faster than `np.zeros()` but contains garbage — only safe when every element will be written
- `np.full((n, m), val)` is cleaner than `np.zeros(...) + val` or `np.ones(...) * val`
- Pre-size the result array (`np.empty(n)`/`np.zeros(n)`) and fill in-place — `np.append` in a loop is O(n²) because it copies the whole array each iteration

## Common Mistake

> [!warning] Using `np.empty()` expecting zeros. It returns uninitialized memory — values can be anything. Use `np.zeros()` if you need actual zeros.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
np.zeros(5)                      # [0. 0. 0. 0. 0.]
np.zeros((3, 4))                 # 3×4 matrix of zeros
np.zeros((2, 3, 4))              # 3D — shape (2,3,4)
```

**Senior:**
```python
np.eye(4, k=1)                   # ones on first superdiagonal
```

## See Also

- [[Sections/numpy/creation/np-array|np.array() (NumPy)]]
- [[Sections/numpy/creation/np-ones|np.ones() (NumPy)]]
- [[Sections/numpy/creation/np-arange|np.arange() (NumPy)]]
- [[Sections/numpy/creation/np-linspace|np.linspace() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

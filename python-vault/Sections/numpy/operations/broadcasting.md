---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "broadcasting"
title: "Broadcasting"
category: "Operations"
subtitle: "Align shapes from the right — dimensions must match or be 1"
signature_short: "a[2,3] + b[3] → b broadcast to [2,3]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Broadcasting"
  - "broadcasting"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# Broadcasting

> Align shapes from the right — dimensions must match or be 1

## Overview

Broadcasting allows operations between arrays of different shapes. NumPy automatically expands dimensions of size 1 to match the other array. Shapes are compared from the right — dimensions must be equal or one of them must be 1.

## Signature

```python
a[2,3] + b[3] → b broadcast to [2,3]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - add a 1D row to a 2D matrix. NumPy expands the
#             1D vector along the missing axis automatically.
# STRENGTHS - shows broadcasting in its smallest form: shape
#             (2,3) + shape (3,) just works.
# WEAKNESSES- doesn't yet show the formal rule, column-vector
#             broadcasting, or the keepdims=True trick.
#
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])     # shape (2, 3)
b = np.array([10, 20, 30])                # shape (3,)
a + b                                     # b broadcast to (2, 3)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the broadcasting rules made explicit: align
#             shapes from the right, every dimension must be
#             equal or one of them is 1. Demonstrate column-
#             vector broadcasting and the keepdims=True
#             pattern for "center each row".
# STRENGTHS - the rule + keepdims=True covers ~90% of real
#             broadcasting; outer product via broadcasting is
#             the trick that makes ML code concise.
# WEAKNESSES- doesn't address shape ambiguity errors or the
#             "broadcasting blew up my memory" trap — senior
#             tier.
#
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])     # (2, 3)

# Column vector broadcasts along columns
c = np.array([[100], [200]])             # (2, 1)
a + c                                    # broadcast to (2, 3)

# Outer product via broadcasting
row = np.array([1, 2, 3])                # (3,)
col = np.array([[1], [2], [3]])          # (3, 1)
row * col                                # 3x3 multiplication table

# Center each row — keepdims=True keeps the (n,1) shape so it broadcasts
a - a.mean(axis=1, keepdims=True)

# Scale each column
a / a.std(axis=0)

# Compatibility cheat-sheet (align from the RIGHT):
#   (3, 4) + (4,)   -> OK: (3, 4)
#   (3, 4) + (3, 1) -> OK: (3, 4)
#   (3, 4) + (3,)   -> ERROR  (4 vs 3 don't match)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production broadcasting: prefer it over np.tile
#             (free vs allocates), use np.broadcast_to for an
#             explicit zero-copy expansion, watch out for
#             "broadcasting blew up to (N, M, K)" memory
#             surprises, and sanity-check intermediate shapes
#             with .shape asserts.
# STRENGTHS - broadcast saves dramatic memory; explicit
#             broadcast_to documents intent; shape asserts
#             catch dimension errors at development time
#             instead of at runtime.
# WEAKNESSES- broadcast_to returns a non-writable view;
#             implicit broadcasting can produce huge arrays
#             from small inputs (the (1000, 1, 1000) case);
#             reasoning about 3+ axis broadcasting takes
#             practice.
#
import numpy as np

X = np.random.rand(100, 3)            # (100, 3)
weights = np.array([0.5, 0.3, 0.2])

# 1. Broadcast vs tile — same result, broadcasting is FREE
slow = np.tile(weights, (100, 1)) * X    # allocates (100, 3) copy
fast = weights * X                       # zero-allocation broadcast

# 2. Explicit zero-copy expansion when you need a view shape
W_view = np.broadcast_to(weights, (100, 3))   # read-only view

# 3. Memory blowup trap — small inputs, BIG output
a = np.random.rand(1000, 1)            # (1000, 1)
b = np.random.rand(1, 1000)            # (1, 1000)
# c = a + b                            # OK — (1000, 1000)
# d = a * b * np.ones((1000, 1000))    # 8MB explicit; OK to reason about
# But this stacks:
# a[:, None] + b[None, :, None]        # (1000, 1000, 1000) -> 8GB

# 4. Defensive shape asserts at function boundaries
def normalize_rows(x: np.ndarray) -> np.ndarray:
    assert x.ndim == 2, f"expected 2D, got {x.shape}"
    mu = x.mean(axis=1, keepdims=True)
    sd = x.std(axis=1, keepdims=True)
    return (x - mu) / sd                # all broadcasts cleanly

# Anti-pattern: using axis= without keepdims=True
# bad = a - a.mean(axis=1)              # ValueError — shape mismatch
# right = a - a.mean(axis=1, keepdims=True)
#
# Decision rule:
#   add a row vector to every row                -> rely on broadcasting (1D shape (k,))
#   add a column vector to every column          -> reshape to (n, 1) or use [:, None]
#   center each row / column                     -> reduce with keepdims=True, then subtract
#   need an explicit zero-copy expanded view     -> np.broadcast_to(a, target_shape)
#   need a writable expanded copy                -> np.tile (allocates) — only if you must
#   shape mismatch you can't reason about        -> assert .shape at boundaries
#   axis insertion for broadcasting              -> a[:, None] / a[None, :] (clearer than reshape)
```

## Decision Rule

```text
add a row vector to every row                -> rely on broadcasting (1D shape (k,))
add a column vector to every column          -> reshape to (n, 1) or use [:, None]
center each row / column                     -> reduce with keepdims=True, then subtract
need an explicit zero-copy expanded view     -> np.broadcast_to(a, target_shape)
need a writable expanded copy                -> np.tile (allocates) — only if you must
shape mismatch you can't reason about        -> assert .shape at boundaries
axis insertion for broadcasting              -> a[:, None] / a[None, :] (clearer than reshape)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using axis= without keepdims=True
> bad = a - a.mean(axis=1)              # ValueError — shape mismatch
> right = a - a.mean(axis=1, keepdims=True)

## Tips

- Broadcasting rule: align shapes from the right — each dimension must match or be 1
- `keepdims=True` preserves the reduced axis as size-1, enabling broadcasting back to the original shape
- `a - a.mean(axis=1, keepdims=True)` centers each row — the classic use of keepdims
- If shapes are incompatible, NumPy raises `ValueError: operands could not be broadcast`

## Common Mistake

> [!warning] `a.mean(axis=1)` returns shape `(n,)` — subtracting it from `a` of shape `(n,m)` fails because shapes `m` and `n` do not align. Use `keepdims=True` to get shape `(n,1)` which broadcasts correctly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([[1, 2, 3],
[4, 5, 6]])   # shape (2, 3)
b = np.array([10, 20, 30]) # shape (3,) → broadcast to (2, 3)
```

**Senior:**
```python
a / a.std(axis=0)
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/np-nan|np.nan handling (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

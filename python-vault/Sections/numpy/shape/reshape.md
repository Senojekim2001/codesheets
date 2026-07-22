---
type: "entry"
domain: "python"
file: "numpy"
section: "shape"
id: "reshape"
title: "np.reshape()"
category: "Shape"
subtitle: "Use -1 to infer one dimension — returns a view when possible"
signature_short: "a.reshape(3, 4) | a.reshape(-1, 4) | a.ravel()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.reshape()"
  - "reshape"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/shape"
  - "category/shape"
  - "tier/tiered"
---

# np.reshape()

> Use -1 to infer one dimension — returns a view when possible

## Overview

reshape() changes the dimensions of an array. The total number of elements must remain the same. Use -1 for one dimension and NumPy infers it. reshape() returns a view when possible — modifying it modifies the original.

## Signature

```python
a.reshape(3, 4) | a.reshape(-1, 4) | a.ravel()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - explicit reshape from 1D to 2D. The total
#             element count must stay the same.
# STRENGTHS - shows the core feature in two lines.
# WEAKNESSES- doesn't yet show -1 inference, flatten/ravel
#             distinction, or newaxis for broadcasting.
#
import numpy as np

a = np.arange(12)
a.reshape(3, 4)              # 12 elements -> 3x4 matrix
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday reshape surface: -1 to infer one
#             dim, transpose with .T, add/remove size-1 axes
#             with newaxis/squeeze, and the column-vector
#             trick that makes broadcasting work.
# STRENGTHS - covers the patterns ML/numerical code uses
#             daily; -1 + reshape is the most useful idiom
#             for "I know columns, infer rows".
# WEAKNESSES- doesn't address ravel-vs-flatten (view vs copy)
#             or contiguity issues for downstream consumers
#             — senior tier.
#
import numpy as np

a = np.arange(12)

# -1 = "infer this dimension"
a.reshape(3, -1)             # (3, 4)
a.reshape(-1, 4)             # (3, 4)
a.reshape(-1)                # (12,)  — flatten to 1D

# Transpose — free O(1), returns a view
A = a.reshape(3, 4)
A.T                          # (4, 3) view

# Add / remove size-1 dimensions
v = np.array([1, 2, 3])
v[np.newaxis, :]             # (1, 3)  — row vector
v[:, np.newaxis]             # (3, 1)  — column vector (broadcast-ready)
np.expand_dims(v, axis=0)    # same as v[np.newaxis, :]
np.squeeze(np.array([[[1, 2, 3]]]))   # remove all size-1 dims
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reshape: ravel-vs-flatten (view vs
#             always-copy), check contiguity before passing
#             reshaped arrays to C extensions, prefer
#             np.ascontiguousarray when shape changes leave a
#             non-contiguous result, and use shape assertions
#             at function boundaries.
# STRENGTHS - ravel saves a copy when the data is already
#             contiguous; contiguity checks prevent silent
#             copies at C-extension boundaries; shape asserts
#             catch mistakes early.
# WEAKNESSES- ravel sometimes returns a copy (when the array
#             isn't contiguous), so the "no copy" guarantee
#             is conditional; ascontiguousarray costs a copy
#             when needed; shape asserts add a few lines of
#             ceremony.
#
import numpy as np

a = np.arange(12).reshape(3, 4)

# 1. Flatten vs ravel — view-when-possible vs always-copy
flat_view = a.ravel()                # view if a is contiguous
flat_copy = a.flatten()              # always a new array

# 2. Reshape can return a non-contiguous view — check before
#    handing to C extensions
b = a.T.reshape(2, 6)                # may not be contiguous
b.flags["C_CONTIGUOUS"]              # check
buf = np.ascontiguousarray(b)        # forced contiguous, dtype-preserved

# 3. Shape assertions at function boundaries
def take_batch(x: np.ndarray) -> np.ndarray:
    assert x.ndim == 3 and x.shape[1:] == (64, 64), (
        f"expected (B, 64, 64); got {x.shape}"
    )
    return x.reshape(x.shape[0], -1)         # flatten each sample

# 4. Common ML reshapes
images = np.random.rand(32, 64, 64)          # (B, H, W)
flat   = images.reshape(32, -1)              # (B, 64*64)
chw    = images[:, np.newaxis, :, :]         # (B, 1, H, W)  add channel axis

# Anti-pattern: assuming reshape is free
#   reshape on a non-contiguous strided view -> may COPY silently
# Right: check .flags["C_CONTIGUOUS"] when handing buffers across
# library boundaries (torch.from_numpy, ctypes, cython).
#
# Decision rule:
#   know shape exactly                           -> a.reshape(rows, cols)
#   know one dim, infer other                    -> a.reshape(-1, cols) or a.reshape(rows, -1)
#   flatten to 1D, prefer view                   -> a.ravel()
#   flatten to 1D, want a copy                   -> a.flatten()
#   add a size-1 axis (broadcast prep)           -> a[:, None] or a[np.newaxis, :]
#   remove all size-1 axes                       -> np.squeeze(a)
#   transpose                                    -> a.T (view, free)
#   need contiguous after reshape (for C/torch)  -> np.ascontiguousarray(a.reshape(...))
```

## Decision Rule

```text
know shape exactly                           -> a.reshape(rows, cols)
know one dim, infer other                    -> a.reshape(-1, cols) or a.reshape(rows, -1)
flatten to 1D, prefer view                   -> a.ravel()
flatten to 1D, want a copy                   -> a.flatten()
add a size-1 axis (broadcast prep)           -> a[:, None] or a[np.newaxis, :]
remove all size-1 axes                       -> np.squeeze(a)
transpose                                    -> a.T (view, free)
need contiguous after reshape (for C/torch)  -> np.ascontiguousarray(a.reshape(...))
```

## Anti-Pattern

> [!warning] Anti-pattern
> assuming reshape is free
>   reshape on a non-contiguous strided view -> may COPY silently
> Right: check .flags["C_CONTIGUOUS"] when handing buffers across
> library boundaries (torch.from_numpy, ctypes, cython).

## Tips

- `-1` in reshape means "infer this dimension" — `a.reshape(-1, 4)` always gives 4 columns
- `a.T` is a free O(1) transposition — it is a view, not a copy
- `a.ravel()` returns a view when the array is contiguous; `a.flatten()` always copies
- `np.newaxis` is just `None` — `a[None, :]` works too, but `np.newaxis` is more readable
- reshape is not free on non-contiguous strided views — it may silently copy. Check `a.flags["C_CONTIGUOUS"]` before handing buffers to torch/ctypes/cython

## Common Mistake

> [!warning] Confusing `reshape(-1)` with `flatten()`. `reshape(-1)` returns a view (when possible); `flatten()` always returns a copy.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.arange(12)
a.reshape(3, 4)          # shape (12,) → (3, 4)
a.reshape(2, 2, 3)       # → (2, 2, 3)
```

**Senior:**
```python
v.reshape(-1, 1)         # (3,1) column vector
```

## See Also

- [[Sections/numpy/shape/np-stack|np.stack() (NumPy)]]
- [[Sections/numpy/shape/np-concatenate|np.concatenate() (NumPy)]]
- [[Sections/numpy/shape/np-tile|np.tile() (NumPy)]]
- [[Sections/numpy/shape/np-repeat|np.repeat() (NumPy)]]
- [[Sections/numpy/shape/_Index|NumPy → Shape & Structure]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

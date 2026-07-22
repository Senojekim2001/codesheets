---
type: "entry"
domain: "python"
file: "numpy"
section: "indexing"
id: "array-slicing"
title: "Array slicing"
category: "Indexing"
subtitle: "Slices return views — modifying them modifies the original"
signature_short: "a[start:stop:step, ...]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Array slicing"
  - "array-slicing"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/indexing"
  - "category/indexing"
  - "tier/tiered"
---

# Array slicing

> Slices return views — modifying them modifies the original

## Overview

NumPy slices return views — they share memory with the original array. Modifying a slice modifies the original. Use .copy() when you need an independent copy. Slicing is O(1) because no data is copied.

## Signature

```python
a[start:stop:step, ...]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basic 1D slicing: pick rows by integer position,
#             slice ranges with start:stop. Reads like Python
#             list slicing.
# STRENGTHS - shows the API in three lines; instantly familiar
#             from list slicing.
# WEAKNESSES- doesn't yet show 2D [row, col], strides, or the
#             critical view-vs-copy distinction.
#
import numpy as np

a = np.array([10, 20, 30, 40, 50])
a[0]        # 10
a[-1]       # 50
a[1:4]      # array([20, 30, 40])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday slicing surface: 2D [row, col]
#             notation, strided slices for "every other row",
#             reversal with [::-1], and the critical rule that
#             slices are VIEWS — modifying them modifies the
#             source array.
# STRENGTHS - the view rule is the most important thing to
#             know about NumPy slicing; shows the canonical
#             [::, ::] strided form.
# WEAKNESSES- doesn't yet show np.s_ for stored slice objects
#             or the contiguity considerations — senior tier.
#
import numpy as np

# Sales: 4 stores x 6 quarters
sales = np.array([
    [120, 145, 180, 210, 195, 230],
    [98,  110, 130, 150, 165, 180],
    [210, 220, 240, 260, 280, 310],
    [150, 160, 175, 190, 200, 215],
])

# 2D indexing: [row, col]
sales[0, 0]              # 120     — Store A, Q1
sales[-1, -1]            # 215     — last store, last quarter
sales[1:3, 2:5]          # 2x3 sub-block, stores B-C, Q3-Q5
sales[::2, ::2]          # every other store AND quarter
sales[:, ::-1]           # all quarters reversed

# CRITICAL: slices are VIEWS — modifying propagates to source
q1 = sales[:, 0]
q1[0] = 999
sales[0, 0]              # 999 — view propagated the write
q1.base is sales         # True — q1 shares memory with sales

# Use .copy() when you need independence
q1_copy = sales[:, 0].copy()
q1_copy[0] = 0
sales[0, 0]              # still 999 — copy is independent
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production slicing: store slices in np.s_ for
#             reuse, check contiguity (.flags) before handing
#             arrays to C extensions, and make the view-vs-copy
#             choice deliberate at function boundaries.
# STRENGTHS - np.s_ keeps complex slice patterns named and
#             reusable; .flags exposes hidden non-contiguity
#             that breaks zero-copy interop with C/Cython/torch;
#             explicit copy at boundaries documents intent.
# WEAKNESSES- np.s_ syntax is one more thing to learn; checking
#             flags adds boilerplate; over-aggressive .copy()
#             defeats the point of zero-copy slicing.
#
import numpy as np

# 1. Reusable slice patterns
roi = np.s_[10:50, 20:80]              # named slice — apply to many arrays
img_roi  = image[roi]
mask_roi = mask[roi]

# 2. Check contiguity — slices can be non-contiguous
A = np.arange(60).reshape(6, 10)
strided = A[:, ::2]                    # every other column
strided.flags["C_CONTIGUOUS"]          # False
np.ascontiguousarray(strided)          # forces a contiguous copy

# 3. View at the boundary — make the choice explicit
def normalize_in_place(buf: np.ndarray) -> None:
    """Mutates the underlying array — caller must understand."""
    buf -= buf.mean()
    buf /= buf.std()

def normalize(arr: np.ndarray) -> np.ndarray:
    """Returns a NEW array — safe across function boundaries."""
    out = arr.astype(np.float32, copy=True)
    normalize_in_place(out)
    return out

# 4. Tell view from copy explicitly
sub = A[1:3]
sub.base is A                          # True  -> view
A[1:3].copy().base is None             # True  -> independent

# Anti-pattern: passing a non-contiguous slice to a C extension
#   torch.from_numpy(A[:, ::2])        # non-contiguous; may copy or fail
# Right: torch.from_numpy(np.ascontiguousarray(A[:, ::2]))
#
# Decision rule:
#   contiguous range, share memory               -> a[start:stop] (view, free)
#   need independent buffer for caller           -> a[start:stop].copy()
#   non-contiguous selection (specific indices)  -> fancy indexing a[[i, j, k]]
#   filter by condition                          -> boolean mask a[mask]
#   reusable slice pattern across many arrays    -> roi = np.s_[10:50, :]
#   reverse axis                                 -> a[::-1]   or a[:, ::-1]
#   handing buffer to C/Cython/torch             -> np.ascontiguousarray(slice)
```

## Decision Rule

```text
contiguous range, share memory               -> a[start:stop] (view, free)
need independent buffer for caller           -> a[start:stop].copy()
non-contiguous selection (specific indices)  -> fancy indexing a[[i, j, k]]
filter by condition                          -> boolean mask a[mask]
reusable slice pattern across many arrays    -> roi = np.s_[10:50, :]
reverse axis                                 -> a[::-1]   or a[:, ::-1]
handing buffer to C/Cython/torch             -> np.ascontiguousarray(slice)
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing a non-contiguous slice to a C extension
>   torch.from_numpy(A[:, ::2])        # non-contiguous; may copy or fail
> Right: torch.from_numpy(np.ascontiguousarray(A[:, ::2]))

## Tips

- Slices are views — free O(1) operation, but modifications propagate to the original
- Use `.copy()` when you need to modify a slice without affecting the source array
- `a.base is None` checks if an array owns its data (True = owns, None = owns, not None = view)
- `a[::-1]` reverses a 1D array; `a[:, ::-1]` reverses columns of a 2D array
- Strided slices like `A[:, ::2]` are not C-contiguous — wrap with `np.ascontiguousarray()` before handing to torch/ctypes/cython, otherwise the binding may copy or fail

## Common Mistake

> [!warning] Assuming `b = a[1:3]` creates an independent copy. It is a view — `b[0] = 99` also changes `a[1]`. Use `b = a[1:3].copy()` for independence.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
sales = np.array([
[120, 145, 180, 210, 195, 230],  # Store A
[98, 110, 130, 150, 165, 180],   # Store B
```

**Senior:**
```python
q1_copy.base is None  # True — owns data
```

## See Also

- [[Sections/numpy/indexing/boolean-masking|Boolean masking (NumPy)]]
- [[Sections/numpy/indexing/fancy-indexing|Fancy indexing (NumPy)]]
- [[Sections/numpy/indexing/np-unique|np.unique() (NumPy)]]
- [[Sections/numpy/indexing/np-where|np.where() (NumPy)]]
- [[Sections/numpy/indexing/_Index|NumPy → Indexing & Slicing]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

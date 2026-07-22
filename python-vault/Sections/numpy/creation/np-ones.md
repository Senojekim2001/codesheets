---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-ones"
title: "np.ones()"
category: "Creation"
subtitle: "One-initialized array — useful for masks, weights, and initialization"
signature_short: "np.ones(shape, dtype=float)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.ones()"
  - "np-ones"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.ones()

> One-initialized array — useful for masks, weights, and initialization

## Overview

np.ones() creates an array filled with 1.0. Commonly used for weight arrays, boolean masks (all True), and as a starting point for multiplicative operations. np.ones_like() creates a ones array matching an existing array.

## Signature

```python
np.ones(shape, dtype=float)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one-filled array of a given shape. Same call shape
#             as np.zeros.
# STRENGTHS - the smallest possible alternative to np.zeros;
#             instantly familiar.
# WEAKNESSES- doesn't yet show the practical patterns (uniform
#             weights, all-True masks, homogeneous coordinates).
#
import numpy as np

np.ones(5)               # [1. 1. 1. 1. 1.]
np.ones((3, 3))          # 3x3 matrix of ones
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday np.ones use cases: uniform weights
#             that sum to 1, all-True boolean masks you then
#             clear selectively, and the homogeneous-coordinates
#             trick (append a column of 1s for affine transforms).
# STRENGTHS - covers what np.ones actually does for you in
#             real numerical code; the use cases stick because
#             they're patterns you'll meet weekly.
# WEAKNESSES- doesn't address "ones * value" being inferior to
#             np.full(...) — that's the senior decision rule.
#
import numpy as np

# Typed and shaped variants
np.ones((3, 3), dtype=np.int32)
np.ones((3, 3), dtype=bool)        # True everywhere

# *_like — match an existing array
np.ones_like(a)

# Uniform weights — n weights that sum to 1
n = 10
weights = np.ones(n) / n           # 1/n each, sums to 1.0

# All-True mask, then carve out exclusions
mask = np.ones(arr.shape, dtype=bool)
mask[bad_indices] = False
clean = arr[mask]

# Homogeneous coordinates — add a column of 1s (affine transforms)
X = np.random.randn(100, 3)
X_h = np.hstack([X, np.ones((100, 1))])      # shape (100, 4)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - decision rules around constant arrays: prefer
#             np.full(shape, v) over np.ones * v (clearer
#             intent, one allocation), use np.ones_like to
#             carry shape AND dtype AND order, and watch out
#             for "ones-then-multiply" patterns hiding broadcast
#             bugs.
# STRENGTHS - one allocation beats two; explicit np.full
#             communicates intent at the call site; *_like
#             prevents the dtype-mismatch class of bugs at
#             buffer boundaries.
# WEAKNESSES- np.full requires knowing the value at allocation
#             time (rare problem); ones-then-multiply still
#             reads naturally to many people, so this is more
#             of a code-review preference than a correctness rule.
#
import numpy as np

# 1. np.full beats ones * value — one allocation, explicit intent
bad  = np.ones((1000, 1000)) * 5.0     # alloc, then full pass to multiply
good = np.full((1000, 1000), 5.0,      # one alloc, value baked in
                dtype=np.float32)

# 2. *_like inherits shape AND dtype AND order — usually what you want
A = np.asfortranarray(np.random.randn(100, 50))
B = np.ones_like(A)                    # F-order, float64, shape (100, 50)

# 3. Avoid "ones-then-broadcast" silent bugs
# Wrong:
#   weights = np.ones(n_features) * scale
#   X * weights[:, None]              # easy to forget the [:, None]
# Right (clearer intent and dimensional safety):
W = np.full((1, n_features), scale)    # explicit row vector
result = X * W                         # broadcasting is unambiguous

# 4. When np.ones IS the right tool
#    - uniform weights that sum to 1 -> ones(n) / n  (clearer than full(n, 1/n))
#    - all-True boolean mask         -> ones(shape, bool)
#    - constant column for affine    -> hstack with ones((m, 1))
#
# Decision rule:
#   need ones (literal 1.0)                      -> np.ones(shape, dtype=...)
#   need any other constant value                -> np.full(shape, value)
#   uniform weights that sum to 1                -> np.ones(n) / n
#   all-True boolean mask, then carve exclusions -> np.ones(shape, dtype=bool)
#   match existing array's shape+dtype+order     -> np.ones_like(a)
#   homogeneous coords / affine 1-column         -> np.hstack([X, np.ones((m, 1))])
#   identity matrix                              -> np.eye, NOT np.ones (diff thing)
#
# Anti-pattern: np.ones(shape) * value to fake a constant array
#   Two passes (allocate + multiply), obscures intent, can promote dtype
#   silently (ones is float64; * int gives float64 again). Use
#   np.full(shape, value, dtype=...) — one allocation, explicit value, no dtype drift.
```

## Decision Rule

```text
need ones (literal 1.0)                      -> np.ones(shape, dtype=...)
need any other constant value                -> np.full(shape, value)
uniform weights that sum to 1                -> np.ones(n) / n
all-True boolean mask, then carve exclusions -> np.ones(shape, dtype=bool)
match existing array's shape+dtype+order     -> np.ones_like(a)
homogeneous coords / affine 1-column         -> np.hstack([X, np.ones((m, 1))])
identity matrix                              -> np.eye, NOT np.ones (diff thing)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.ones(shape) * value to fake a constant array
>   Two passes (allocate + multiply), obscures intent, can promote dtype
>   silently (ones is float64; * int gives float64 again). Use
>   np.full(shape, value, dtype=...) — one allocation, explicit value, no dtype drift.

## Tips

- `np.ones((n, 1))` creates a column vector — useful for homogeneous coordinates and broadcasting
- `np.ones(n, dtype=bool)` creates an all-True mask — then set specific elements to False
- `np.ones_like(a)` copies shape and dtype — safer than hardcoding the shape
- For non-1 fill values, use `np.full(shape, value)` — more explicit than `np.ones(...) * value`

## Common Mistake

> [!warning] Using `np.ones((n,)) * val` to create an array of a constant value. `np.full((n,), val)` is clearer and communicates intent directly.

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

- [[Sections/numpy/creation/np-array|np.array() (NumPy)]]
- [[Sections/numpy/creation/np-zeros|np.zeros() (NumPy)]]
- [[Sections/numpy/creation/np-arange|np.arange() (NumPy)]]
- [[Sections/numpy/creation/np-linspace|np.linspace() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

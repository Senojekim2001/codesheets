---
type: "entry"
domain: "python"
file: "numpy"
section: "shape"
id: "np-tile"
title: "np.tile()"
category: "Shape"
subtitle: "Copies the whole array along new axes — useful for broadcasting"
signature_short: "np.tile(a, reps)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.tile()"
  - "np-tile"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/shape"
  - "category/shape"
  - "tier/tiered"
---

# np.tile()

> Copies the whole array along new axes — useful for broadcasting

## Overview

np.tile() repeats the entire array a specified number of times. Unlike repeat, which duplicates individual elements, tile copies the whole array structure. Use for broadcasting setup, creating test data, and expanding arrays for element-wise operations.

## Signature

```python
np.tile(a, reps)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - copy the entire array N times. Mental model:
#             tile = "copy the tape".
# STRENGTHS - smallest possible introduction; instantly
#             distinguishes tile from repeat.
# WEAKNESSES- doesn't yet show 2D tiling, broadcasting
#             alternatives, or the memory cost of materializing
#             a tiled array.
#
import numpy as np

a = np.array([1, 2, 3])
np.tile(a, 3)            # [1, 2, 3, 1, 2, 3, 1, 2, 3]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday tile patterns: 2D tiling with
#             (rows, cols), expanding a 1D weight vector to 2D
#             so it can multiply a 2D matrix, and the
#             tile-vs-repeat distinction.
# STRENGTHS - the most common real use is "broadcast-prep" —
#             though broadcasting itself usually wins (senior).
# WEAKNESSES- materializing a tiled copy is wasteful when
#             broadcasting would have done the same job for
#             free — senior tier covers this.
#
import numpy as np

a = np.array([1, 2, 3])

# 2D tiling — (rows, cols)
np.tile(a, (2, 3))                       # 2 rows, each = a tiled 3x

# Expand 1D weights to 2D
weights = np.array([0.5, 0.3, 0.2])
np.tile(weights, (100, 1))               # (100, 3)  — same weights per row

# tile copies the WHOLE array; repeat duplicates each ELEMENT
np.tile([1, 2, 3], 2)                    # [1, 2, 3, 1, 2, 3]
np.repeat([1, 2, 3], 2)                  # [1, 1, 2, 2, 3, 3]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: prefer broadcasting over
#             np.tile whenever possible. Tiling materializes
#             the array (real memory cost); broadcasting is
#             free (zero-allocation virtual repeat). Reach for
#             tile only when an actual contiguous, repeated
#             buffer is needed (interfacing with C, exporting
#             a CSV, etc.).
# STRENGTHS - broadcasting saves dramatic memory on big
#             frames; explicit np.broadcast_to documents
#             intent; sticking to tile only when materialization
#             is required keeps memory bounded.
# WEAKNESSES- broadcast_to returns a non-writable view; tiling
#             is sometimes the only option (some libraries
#             reject broadcast views); reasoning about
#             broadcasting requires understanding shape rules.
#
import numpy as np

X = np.random.rand(100, 3)               # 100 samples, 3 features
weights = np.array([0.5, 0.3, 0.2])

# Tile materializes a copy — wasteful for plain element-wise math
W_tile = np.tile(weights, (100, 1))      # allocates 100*3 floats
out_tile = X * W_tile

# Broadcasting — same result, zero extra memory
out_bcast = X * weights                  # weights virtually broadcast to (100, 3)

# When you NEED an explicit broadcast view (read-only, no copy)
W_view = np.broadcast_to(weights, (100, 3))   # zero-alloc, read-only

# When tile is actually the right tool
#   - exporting a repeated row to CSV (need a real buffer)
#   - feeding a C extension that demands contiguous memory
#   - pre-padding before in-place writes
buffer = np.tile([0.0, 0.0], (10000, 1))      # real (10000, 2) buffer

# Decision rule:
#   element-wise math against a 1D vector        -> broadcast (free, no allocation)
#   need a real, writable buffer                 -> np.tile(a, reps)
#   need a read-only virtual view                -> np.broadcast_to(a, shape)
#   repeat each element (NOT the array)          -> np.repeat(a, n)
#   need to expand for cross-product math        -> [:, None] / [None, :] (broadcast)
#   exporting repeated rows for CSV/C buffer     -> np.tile (must materialize)
#   building a constant-filled array             -> np.full (NOT tile of [val])
#
# Anti-pattern: np.tile(weights, (N, 1)) just to multiply a (N, k) matrix
#   X * np.tile(weights, (N, 1))   # allocates an N*k copy of weights
#   Broadcasting does the same math for free: X * weights — NumPy virtually
#   expands the 1D vector along the leading axis with zero allocation. Only
#   reach for tile when a downstream consumer (C code, CSV writer, in-place
#   sink) genuinely needs a contiguous repeated buffer.
```

## Decision Rule

```text
element-wise math against a 1D vector        -> broadcast (free, no allocation)
need a real, writable buffer                 -> np.tile(a, reps)
need a read-only virtual view                -> np.broadcast_to(a, shape)
repeat each element (NOT the array)          -> np.repeat(a, n)
need to expand for cross-product math        -> [:, None] / [None, :] (broadcast)
exporting repeated rows for CSV/C buffer     -> np.tile (must materialize)
building a constant-filled array             -> np.full (NOT tile of [val])
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.tile(weights, (N, 1)) just to multiply a (N, k) matrix
>   X * np.tile(weights, (N, 1))   # allocates an N*k copy of weights
>   Broadcasting does the same math for free: X * weights — NumPy virtually
>   expands the 1D vector along the leading axis with zero allocation. Only
>   reach for tile when a downstream consumer (C code, CSV writer, in-place
>   sink) genuinely needs a contiguous repeated buffer.

## Tips

- `np.tile(a, (rows, cols))` is the standard way to expand a 1D array to 2D for broadcasting
- tile repeats the entire array structure — use repeat() to duplicate individual elements
- For memory efficiency, use broadcasting instead of tile when possible — tile creates a copy
- Mnemonic: tile = "copy the whole tape"; repeat = "stutter each element"
- When you need a read-only virtual view (no allocation), reach for `np.broadcast_to` — tile only when you need a real writable buffer

## Common Mistake

> [!warning] Confusing tile and repeat. `np.tile([1,2,3], 2)` gives [1,2,3,1,2,3]. `np.repeat([1,2,3], 2)` gives [1,1,2,2,3,3]. They are opposite operations.

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

- [[Sections/numpy/shape/reshape|np.reshape() (NumPy)]]
- [[Sections/numpy/shape/np-stack|np.stack() (NumPy)]]
- [[Sections/numpy/shape/np-concatenate|np.concatenate() (NumPy)]]
- [[Sections/numpy/shape/np-repeat|np.repeat() (NumPy)]]
- [[Sections/numpy/shape/_Index|NumPy → Shape & Structure]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

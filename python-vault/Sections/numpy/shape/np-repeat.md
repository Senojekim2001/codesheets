---
type: "entry"
domain: "python"
file: "numpy"
section: "shape"
id: "np-repeat"
title: "np.repeat()"
category: "Shape"
subtitle: "Duplicates each element — not the whole array"
signature_short: "np.repeat(a, repeats, axis=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.repeat()"
  - "np-repeat"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/shape"
  - "category/shape"
  - "tier/tiered"
---

# np.repeat()

> Duplicates each element — not the whole array

## Overview

np.repeat() repeats each individual element of an array a specified number of times. Unlike tile, which copies the whole array, repeat duplicates individual elements. You can specify different repeat counts for each element or apply repetition along a specific axis.

## Signature

```python
np.repeat(a, repeats, axis=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - duplicate each ELEMENT N times. Mental model:
#             repeat = "stutter each element".
# STRENGTHS - smallest possible example; the contrast with
#             tile is immediate.
# WEAKNESSES- doesn't yet show variable per-element counts or
#             the axis= argument for 2D arrays.
#
import numpy as np

a = np.array([1, 2, 3])
np.repeat(a, 3)              # [1, 1, 1, 2, 2, 2, 3, 3, 3]
np.repeat(a, 2)              # [1, 1, 2, 2, 3, 3]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday repeat surface: per-element repeat
#             counts (different N per element), axis-aware
#             repeat for 2D arrays (rows or columns), and the
#             default axis=None which flattens-then-repeats.
# STRENGTHS - covers what real code uses repeat for: upsample
#             a label vector, expand groups, "explode"
#             group-counts.
# WEAKNESSES- doesn't surface the np.repeat-vs-pandas-explode
#             trade-off or the broadcasting alternative —
#             senior tier.
#
import numpy as np

a = np.array([1, 2, 3])

# Variable counts — duplicate each element a different N times
np.repeat(a, [1, 2, 3])              # [1, 2, 2, 3, 3, 3]

# 2D — pick the axis
A = np.array([[1, 2], [3, 4]])
np.repeat(A, 2, axis=0)              # repeat each ROW twice
# [[1, 2], [1, 2], [3, 4], [3, 4]]
np.repeat(A, 2, axis=1)              # repeat each COL twice
# [[1, 1, 2, 2], [3, 3, 4, 4]]

# axis=None (default) flattens first
np.repeat(A, 2)                      # [1, 1, 2, 2, 3, 3, 4, 4]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production patterns for repeat: expanding a
#             group-counts column to a full label vector,
#             building a "row index" alongside group sizes,
#             and the tile-vs-repeat decision rule. For
#             pandas-shaped data, prefer pd.DataFrame.explode
#             over manual repeat.
# STRENGTHS - the "expand group counts" pattern is exactly
#             how repeat shows up in real ETL; combining
#             repeat with arange yields the canonical row-id
#             vector for ungrouped reconstruction.
# WEAKNESSES- repeat materializes the full expanded array;
#             for huge expansions consider streaming or
#             sparse representations; pandas explode handles
#             missing/empty groups more gracefully.
#
import numpy as np

# 1. Expand group counts to a full label vector
groups = np.array(["A", "B", "C"])
sizes  = np.array([2, 3, 1])
labels = np.repeat(groups, sizes)        # ['A', 'A', 'B', 'B', 'B', 'C']

# 2. Reconstruct group-id alongside the labels
group_ids = np.repeat(np.arange(len(sizes)), sizes)
# [0, 0, 1, 1, 1, 2]

# 3. Quick guide
#    duplicate each ELEMENT             -> np.repeat
#    duplicate the WHOLE array          -> np.tile
#    expand a list-column in pandas     -> df.explode("col")
#    just want broadcasting             -> nothing — let numpy do it

# 4. Mnemonic
#    repeat([1,2,3], 2) -> [1, 1, 2, 2, 3, 3]    "stutter each"
#    tile  ([1,2,3], 2) -> [1, 2, 3, 1, 2, 3]    "copy the tape"

# Anti-pattern (legacy): using repeat where broadcasting would do
# big = np.repeat(weights[None, :], n_rows, axis=0)    # materializes copy
# Right (zero-alloc):
# X * weights   # numpy broadcasts weights to match X automatically
#
# Decision rule:
#   stutter each element a fixed N times         -> np.repeat(a, n)
#   stutter each element a DIFFERENT N times     -> np.repeat(a, [n0, n1, n2, ...])
#   repeat each row of a 2D array                -> np.repeat(A, n, axis=0)
#   repeat the WHOLE array                       -> np.tile(a, reps)
#   expand group-counts to a label vector        -> np.repeat(groups, sizes)
#   build a row-id alongside groups              -> np.repeat(np.arange(k), sizes)
#   pandas list-column                           -> df.explode("col")
#   just need element-wise alignment             -> broadcasting (no allocation)
#
# Anti-pattern: np.repeat(weights[None, :], n_rows, axis=0) to broadcast-prep
#   Materializes a real (n_rows, k) copy of weights just to multiply against
#   X of the same shape. NumPy already broadcasts the 1D weights for free —
#   X * weights does the same math with zero extra allocation. Only use
#   np.repeat when you genuinely need the expanded values stored (e.g. as a
#   label vector aligned with another array).
```

## Decision Rule

```text
stutter each element a fixed N times         -> np.repeat(a, n)
stutter each element a DIFFERENT N times     -> np.repeat(a, [n0, n1, n2, ...])
repeat each row of a 2D array                -> np.repeat(A, n, axis=0)
repeat the WHOLE array                       -> np.tile(a, reps)
expand group-counts to a label vector        -> np.repeat(groups, sizes)
build a row-id alongside groups              -> np.repeat(np.arange(k), sizes)
pandas list-column                           -> df.explode("col")
just need element-wise alignment             -> broadcasting (no allocation)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.repeat(weights[None, :], n_rows, axis=0) to broadcast-prep
>   Materializes a real (n_rows, k) copy of weights just to multiply against
>   X of the same shape. NumPy already broadcasts the 1D weights for free —
>   X * weights does the same math with zero extra allocation. Only use
>   np.repeat when you genuinely need the expanded values stored (e.g. as a
>   label vector aligned with another array).

## Tips

- `np.repeat(a, counts)` with a list repeats each element a different number of times
- repeat() with axis duplicates along that axis; axis=None flattens first
- Use repeat() to upsample data or expand labels for broadcasting
- Mnemonic: repeat = "stutter each element"; tile = "copy the whole tape"
- If you only need element-wise alignment for arithmetic, broadcast directly (`X * weights`) — `np.repeat` allocates a real materialized copy

## Common Mistake

> [!warning] Confusing repeat and tile. `np.repeat([1,2,3], 2)` gives [1,1,2,2,3,3]. `np.tile([1,2,3], 2)` gives [1,2,3,1,2,3]. They duplicate different things.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([1, 2, 3])
np.repeat(a, 3)       # [1,1,1,2,2,2,3,3,3]
np.repeat(a, 2)       # [1,1,2,2,3,3]
```

**Senior:**
```python
np.repeat(A, 2)  # [1,1,2,2,3,3,4,4]
```

## See Also

- [[Sections/numpy/shape/reshape|np.reshape() (NumPy)]]
- [[Sections/numpy/shape/np-stack|np.stack() (NumPy)]]
- [[Sections/numpy/shape/np-concatenate|np.concatenate() (NumPy)]]
- [[Sections/numpy/shape/np-tile|np.tile() (NumPy)]]
- [[Sections/numpy/shape/_Index|NumPy → Shape & Structure]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

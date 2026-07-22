---
type: "entry"
domain: "python"
file: "numpy"
section: "shape"
id: "np-concatenate"
title: "np.concatenate()"
category: "Shape"
subtitle: "Shapes must match on all axes except the concatenation axis"
signature_short: "np.concatenate([a, b], axis=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.concatenate()"
  - "np-concatenate"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/shape"
  - "category/shape"
  - "tier/tiered"
---

# np.concatenate()

> Shapes must match on all axes except the concatenation axis

## Overview

np.concatenate() joins arrays along an existing axis. Input shapes must match on every axis except the one being concatenated. No new dimensions are created. np.vstack, hstack, dstack, and column_stack are convenience wrappers.

## Signature

```python
np.concatenate([a, b], axis=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - join arrays along an existing axis. No new
#             dimension is added. Shapes must match on every
#             axis except the one being concatenated.
# STRENGTHS - simplest "extend my array" pattern; reads as
#             "put these next to each other".
# WEAKNESSES- doesn't yet show the 2D axis= choice or the
#             split() inverse — junior tier.
#
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

np.concatenate([a, b])         # [1, 2, 3, 4, 5, 6]
np.concatenate([a, b, a])      # [1, 2, 3, 4, 5, 6, 1, 2, 3]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday concatenate surface: 2D row vs
#             column joins via axis=, the vstack/hstack/
#             column_stack/dstack convenience family, and
#             np.split as the inverse.
# STRENGTHS - covers what concatenate does in real code:
#             stack rows, stack columns, build a feature
#             matrix from 1D arrays, split a result back into
#             chunks.
# WEAKNESSES- doesn't address the "concatenate in a loop is
#             O(n^2)" anti-pattern or the dtype-promotion
#             trap — senior tier.
#
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Row-wise (axis=0) and column-wise (axis=1)
np.concatenate([A, B], axis=0)         # (4, 2)
np.concatenate([A, B], axis=1)         # (2, 4)

# Convenience wrappers
np.vstack([A, B])                      # axis=0 for 2D+
np.hstack([A, B])                      # axis=1 for 2D+
np.column_stack([np.array([1, 2, 3]),  # 1D arrays as columns
                  np.array([4, 5, 6])]) # -> (3, 2)
np.dstack([A, B])                       # axis=2 (depth)

# Inverse: split
np.split(np.arange(12), 3)             # 3 equal parts
np.split(np.arange(12), [3, 7])        # split at indices 3 and 7
np.array_split(np.arange(11), 3)       # allow unequal splits
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production concatenate: never call concatenate
#             repeatedly in a loop (O(n^2)); pre-allocate or
#             collect-then-concatenate; align dtypes before
#             joining (silent promotion to object kills
#             performance); pick concatenate vs stack vs r_/c_
#             on purpose.
# STRENGTHS - the list-then-concatenate pattern is the only
#             scalable approach; explicit dtype alignment
#             prevents object-dtype fallback; r_/c_ are
#             concise alternatives for ad-hoc joins.
# WEAKNESSES- list-then-concat still allocates the final big
#             array (no avoiding it); dtype alignment adds a
#             pre-flight check; r_/c_ syntax is dense.
#
import numpy as np

# 1. Anti-pattern: O(n^2) concat in a loop
# out = np.array([])
# for chunk in chunks:
#     out = np.concatenate([out, chunk])      # copies whole array each step

# 2. Right: collect, concatenate once
parts = []
for chunk in chunks:
    parts.append(process(chunk))
big = np.concatenate(parts)                    # one allocation

# 3. Even better when shapes/dtypes are known: pre-allocate
total_len = sum(len(c) for c in chunks)
big = np.empty(total_len, dtype=np.float32)
i = 0
for c in chunks:
    big[i:i + len(c)] = c
    i += len(c)

# 4. Dtype alignment — avoid silent object fallback
A = np.array([1, 2, 3], dtype=np.int32)
B = np.array([4.0, 5.0, 6.0], dtype=np.float64)
np.concatenate([A, B]).dtype                   # promotes to float64 — OK
# But mixing object with numeric collapses to object — performance dies:
# np.concatenate([np.array([1, 2]), np.array(["a"])])  -> object dtype

# 5. r_ / c_ — concise alternatives for inline use
np.r_[1:5, 0, 0, [10, 20, 30]]                 # 1D row-wise concat
np.c_[np.array([1, 2, 3]), np.array([4, 5, 6])] # 1D arrays as columns -> (3,2)

# Decision rule:
#   extend existing axis (more rows / cols)      -> np.concatenate(arrays, axis=k)
#   create a NEW axis (build a batch)            -> np.stack(arrays, axis=k)
#   1D arrays as columns of a 2D matrix          -> np.column_stack or np.c_
#   inline ad-hoc 1D joins                       -> np.r_[a, b, [10, 20]]
#   stack RGB channels into (H, W, 3)            -> np.dstack or np.stack(axis=-1)
#   need to flatten then concat                  -> np.concatenate([...], axis=None)
#   inverse — split a big array                  -> np.split / np.array_split
#
# Anti-pattern: out = np.array([]); for c in chunks: out = np.concatenate([out, c])
#   Each iteration allocates a NEW array of the cumulative size and copies
#   everything seen so far — total O(n^2) work and O(n) peak memory churn.
#   Fix: append to a Python list and call np.concatenate(parts) ONCE at the
#   end, or pre-allocate np.empty(total_len) and slice-assign each chunk.
```

## Decision Rule

```text
extend existing axis (more rows / cols)      -> np.concatenate(arrays, axis=k)
create a NEW axis (build a batch)            -> np.stack(arrays, axis=k)
1D arrays as columns of a 2D matrix          -> np.column_stack or np.c_
inline ad-hoc 1D joins                       -> np.r_[a, b, [10, 20]]
stack RGB channels into (H, W, 3)            -> np.dstack or np.stack(axis=-1)
need to flatten then concat                  -> np.concatenate([...], axis=None)
inverse — split a big array                  -> np.split / np.array_split
```

## Anti-Pattern

> [!warning] Anti-pattern
> out = np.array([]); for c in chunks: out = np.concatenate([out, c])
>   Each iteration allocates a NEW array of the cumulative size and copies
>   everything seen so far — total O(n^2) work and O(n) peak memory churn.
>   Fix: append to a Python list and call np.concatenate(parts) ONCE at the
>   end, or pre-allocate np.empty(total_len) and slice-assign each chunk.

## Tips

- All shapes must match **except** on the concatenation axis
- `np.column_stack([a, b])` treats 1D arrays as columns — handy for building feature matrices
- Avoid repeated concatenation in a loop — it is O(n²). Collect in a list then concatenate once
- `axis=None` first flattens all arrays then concatenates — same as `np.concatenate([a.ravel(), b.ravel()])`

## Common Mistake

> [!warning] Concatenating in a loop: `result = np.concatenate([result, new_row])` on each iteration is O(n²). Append to a Python list, then call `np.concatenate(list)` once at the end.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import numpy as np
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
```

**Senior:**
```python
np.array_split(a, 5)             # allow unequal splits
```

## See Also

- [[Sections/numpy/shape/reshape|np.reshape() (NumPy)]]
- [[Sections/numpy/shape/np-stack|np.stack() (NumPy)]]
- [[Sections/numpy/shape/np-tile|np.tile() (NumPy)]]
- [[Sections/numpy/shape/np-repeat|np.repeat() (NumPy)]]
- [[Sections/numpy/shape/_Index|NumPy → Shape & Structure]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

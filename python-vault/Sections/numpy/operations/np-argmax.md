---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-argmax"
title: "np.argmax() / np.argmin()"
category: "Operations"
subtitle: "Index not value — use along axis= for per-row or per-column"
signature_short: "np.argmax(a, axis=None) | np.argmin(a, axis=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.argmax() / np.argmin()"
  - "np-argmax"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.argmax() / np.argmin()

> Index not value — use along axis= for per-row or per-column

## Overview

argmax() returns the index of the maximum value, argmin() the minimum. Without axis= they operate on the flattened array. With axis= they return the index along that axis — one index per row or column. Use with fancy indexing to extract the max/min values themselves.

## Signature

```python
np.argmax(a, axis=None) | np.argmin(a, axis=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - argmax/argmin return the INDEX of the max/min,
#             not the value. Use the index to fetch the value.
# STRENGTHS - shows the core idea — "where is the max?" — and
#             distinguishes it from np.max ("what is the max?").
# WEAKNESSES- doesn't yet show axis= or the unravel_index
#             trick for 2D flat indices.
#
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
np.argmax(a)              # 5  — index of 9
a[np.argmax(a)]           # 9  — value at that index
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday argmax/argmin surface: 2D with
#             axis=, unravel_index for converting a flat index
#             back to (row, col), and the canonical "fetch
#             the row's max value" pattern with arange.
# STRENGTHS - covers what argmax does in real code: predicted-
#             class extraction, finding the brightest pixel,
#             ranking.
# WEAKNESSES- doesn't address tie-breaking (argmax returns
#             FIRST occurrence), all-positions retrieval, or
#             argpartition for top-K — senior tier.
#
import numpy as np

A = np.array([[3, 1, 4],
              [1, 5, 9],
              [2, 6, 2]])

# axis= — index per column or per row
np.argmax(A, axis=0)              # max per COLUMN
np.argmax(A, axis=1)              # max per ROW

# Flat index back to 2D coords
idx = np.argmax(A)                # single flat index
np.unravel_index(idx, A.shape)    # (1, 2)

# Fetch the row's max value using fancy indexing
A[np.arange(A.shape[0]), np.argmax(A, axis=1)]   # [4, 9, 6]

# argsort — indices that WOULD sort the array
order = np.argsort(a)
a[order]                          # sorted ascending
a[np.argsort(a)[::-1]]            # sorted descending
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production arg-ops: argpartition for top-K
#             (O(n) vs O(n log n) for full sort), use
#             np.flatnonzero(a == a.max()) when ties matter,
#             and reach for the canonical "predicted class
#             from logits" pattern in ML code.
# STRENGTHS - argpartition is dramatically faster than
#             argsort when you only need top-K; tie-aware
#             retrieval is the right answer when the FIRST
#             max is misleading; the ML predicted-class
#             pattern is the canonical use of argmax in
#             practice.
# WEAKNESSES- argpartition's "k smallest at front" semantics
#             are subtle (the rest is unordered); ties are
#             actually-rare on float arrays so people forget
#             until production data hits.
#
import numpy as np

# 1. Top-K via argpartition — O(n), much faster than full sort
arr = np.random.rand(1_000_000)
k = 10
top_k_idx = np.argpartition(arr, -k)[-k:]    # K largest, unordered
top_k_idx = top_k_idx[np.argsort(arr[top_k_idx])[::-1]]   # then sort the K
top_k = arr[top_k_idx]

# 2. ALL positions of the max (ties matter)
a = np.array([1, 5, 3, 5, 5])
np.argmax(a)                                  # 1   — first only
np.flatnonzero(a == a.max())                  # [1, 3, 4]  — all maxima

# 3. ML pattern — predicted class from logits / probabilities
logits = np.random.randn(32, 10)              # (B, num_classes)
preds  = logits.argmax(axis=1)                # (B,)  predicted class

# 4. Combined with broadcasting — find the column of the row max
# for each row in batch
A = np.random.rand(8, 5)
col_of_max = A.argmax(axis=1)                 # (8,)
row_max    = A[np.arange(len(A)), col_of_max] # (8,)

# Decision rule:
#   single global index of max                   -> np.argmax(a)
#   index along an axis                          -> np.argmax(a, axis=N)
#   2D max position back to (row, col)           -> np.unravel_index(np.argmax(A), A.shape)
#   top-K (small k vs n)                         -> np.argpartition(a, -k)[-k:]
#   all positions where max occurs (ties)        -> np.flatnonzero(a == a.max())
#   sorted indices (full ordering)               -> np.argsort(a)  (O(n log n))
#   ML predicted class from logits/probs         -> logits.argmax(axis=-1)
#
# Anti-pattern: np.argmax(A) on a 2D array expecting per-row indices
#   Without axis=, argmax returns a single FLAT index over the whole array,
#   which is almost never what the caller wanted. For per-row max use
#   A.argmax(axis=1); for per-column use axis=0; if you really did want a
#   global 2D position, pair argmax with np.unravel_index(idx, A.shape).
```

## Decision Rule

```text
single global index of max                   -> np.argmax(a)
index along an axis                          -> np.argmax(a, axis=N)
2D max position back to (row, col)           -> np.unravel_index(np.argmax(A), A.shape)
top-K (small k vs n)                         -> np.argpartition(a, -k)[-k:]
all positions where max occurs (ties)        -> np.flatnonzero(a == a.max())
sorted indices (full ordering)               -> np.argsort(a)  (O(n log n))
ML predicted class from logits/probs         -> logits.argmax(axis=-1)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.argmax(A) on a 2D array expecting per-row indices
>   Without axis=, argmax returns a single FLAT index over the whole array,
>   which is almost never what the caller wanted. For per-row max use
>   A.argmax(axis=1); for per-column use axis=0; if you really did want a
>   global 2D position, pair argmax with np.unravel_index(idx, A.shape).

## Tips

- `np.unravel_index(np.argmax(A), A.shape)` converts a flat index to (row, col)
- `a[np.argmax(a)]` is equivalent to `np.max(a)` — but argmax gives you the position
- `np.argsort(a)` returns indices that would sort the array — use for indirect sorting
- For multiple max values (ties), argmax returns only the first — use `np.where(a == a.max())` for all

## Common Mistake

> [!warning] Using `np.argmax(A)` on a 2D array expecting row-wise results. Without axis=, it returns the flat index. Use `np.argmax(A, axis=1)` for per-row max index.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
np.argmax(a)      # 5 — index of 9
np.argmin(a)      # 1 — index of first 1
```

**Senior:**
```python
np.argsort(a)[::-1]      # descending sort indices
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

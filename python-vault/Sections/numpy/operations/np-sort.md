---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-sort"
title: "np.sort() / np.argsort()"
category: "Operations"
subtitle: "np.sort returns a copy; a.sort() sorts in-place; argsort for indirect sort"
signature_short: "np.sort(a, axis=-1) | a.sort() | np.argsort(a)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.sort() / np.argsort()"
  - "np-sort"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.sort() / np.argsort()

> np.sort returns a copy; a.sort() sorts in-place; argsort for indirect sort

## Overview

np.sort() returns a sorted copy; the .sort() method sorts in-place. argsort() returns the indices that would sort the array — useful for sorting multiple arrays by the same order or getting rank. axis= controls which dimension is sorted.

## Signature

```python
np.sort(a, axis=-1) | a.sort() | np.argsort(a)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - np.sort returns a sorted COPY; the .sort()
#             method sorts IN-PLACE. Pick deliberately.
# STRENGTHS - shows the copy-vs-in-place distinction in two
#             lines.
# WEAKNESSES- doesn't yet show axis-aware sort or descending
#             sort.
#
import numpy as np

a = np.array([3, 1, 4, 1, 5])
np.sort(a)               # [1 1 3 4 5]  — copy, a unchanged
a.sort()                 # in-place — a is now sorted
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday sort surface: descending via
#             [::-1], 2D axis=1 (per row) vs axis=0 (per
#             col), argsort for indirect sort across multiple
#             arrays, and rank via double argsort.
# STRENGTHS - covers what sort actually does in analysis
#             code: rank rows, sort multiple arrays
#             together, descending top-N.
# WEAKNESSES- doesn't address kind="stable" for tie
#             preservation or the "sort by multiple keys"
#             pattern via lexsort — senior tier.
#
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# Descending — reverse the result
np.sort(a)[::-1]

# 2D — pick the axis
A = np.array([[3, 1, 4], [1, 5, 9]])
np.sort(A, axis=1)        # sort each row
np.sort(A, axis=0)        # sort each column

# argsort — indices that sort
order = np.argsort(a)
a[order]                  # sorted

# Indirect: sort multiple arrays by one key
names  = np.array(["Bob", "Alice", "Carol"])
scores = np.array([85, 92, 78])
order  = np.argsort(scores)[::-1]      # descending by score
names[order]; scores[order]

# Rank (0-based)
np.argsort(np.argsort(scores))         # [1, 2, 0]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production sort: kind="stable" when ties must
#             preserve insertion order; np.lexsort for
#             multi-key sorts (last key is primary); reach
#             for argpartition when only the top-K matters
#             (faster than full sort).
# STRENGTHS - stable sort is correctness-critical for
#             tie-aware ranking; lexsort is THE way to sort
#             by (col1 ASC, col2 DESC) without converting to
#             pandas; argpartition cuts O(n log n) to O(n)
#             for top-K.
# WEAKNESSES- lexsort's "last key is primary" convention is
#             counter-intuitive (read carefully); stable sort
#             is slightly slower than the default; argpartition
#             ordering inside the partition is unspecified.
#
import numpy as np

# 1. Stable sort — preserve original order on ties
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
order = np.argsort(a, kind="stable")
# ties (the two 1s) keep their original positional order

# 2. Multi-key sort with np.lexsort (LAST KEY IS PRIMARY)
names = np.array(["Bob", "Alice", "Carol", "Alice"])
ages  = np.array([30,    25,      30,      35])
# Sort by name ASC, then age ASC within each name
order = np.lexsort((ages, names))      # ages secondary, names primary
names[order]; ages[order]

# 3. Top-K without full sort — np.argpartition is O(n)
arr = np.random.rand(1_000_000)
k = 10
top_k_idx = np.argpartition(arr, -k)[-k:]            # K largest, unordered
top_k_idx = top_k_idx[np.argsort(arr[top_k_idx])[::-1]]
top_k = arr[top_k_idx]

# Decision rule:
#   small array OR full ordering needed          -> np.sort(a)
#   in-place sort (no extra copy)                -> a.sort()
#   ties must preserve original order            -> np.sort(a, kind="stable")
#   sort by multiple columns                     -> np.lexsort((secondary, primary))
#   only top-K matters                           -> np.argpartition + small final sort
#   indices that would sort (indirect sort)      -> np.argsort(a)
#   descending                                   -> np.sort(a)[::-1] (no ascending= kwarg)
#
# Anti-pattern: sorted(arr.tolist()) on a NumPy array
#   Round-trips through Python objects: O(n) box/unbox, loses dtype
#   (int64 -> Python int), allocates a Python list, then forces a back-copy
#   if you need an ndarray. np.sort(arr) is dtype-preserving, vectorized,
#   and 5-50x faster on numeric arrays. Same for np.argsort over sorted(...).
```

## Decision Rule

```text
small array OR full ordering needed          -> np.sort(a)
in-place sort (no extra copy)                -> a.sort()
ties must preserve original order            -> np.sort(a, kind="stable")
sort by multiple columns                     -> np.lexsort((secondary, primary))
only top-K matters                           -> np.argpartition + small final sort
indices that would sort (indirect sort)      -> np.argsort(a)
descending                                   -> np.sort(a)[::-1] (no ascending= kwarg)
```

## Anti-Pattern

> [!warning] Anti-pattern
> sorted(arr.tolist()) on a NumPy array
>   Round-trips through Python objects: O(n) box/unbox, loses dtype
>   (int64 -> Python int), allocates a Python list, then forces a back-copy
>   if you need an ndarray. np.sort(arr) is dtype-preserving, vectorized,
>   and 5-50x faster on numeric arrays. Same for np.argsort over sorted(...).

## Tips

- `np.sort(a)` returns a copy; `a.sort()` is in-place — be explicit about which you want
- `np.sort(a)[::-1]` for descending — there is no ascending=False argument in NumPy
- `argsort` is the key to sorting multiple arrays by the same criterion
- `np.argsort(np.argsort(a))` gives the rank of each element (0-based)

## Common Mistake

> [!warning] Using `sorted(a.tolist())` to sort a NumPy array. This converts to Python list, loses dtype, and is much slower. Use `np.sort(a)` directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
np.sort(a)            # [1, 1, 2, 3, 4, 5, 6, 9]
a                     # unchanged
```

**Senior:**
```python
np.argsort(np.argsort(scores))   # [1, 2, 0] (0-based rank)
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

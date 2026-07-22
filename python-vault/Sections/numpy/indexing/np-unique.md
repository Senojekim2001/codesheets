---
type: "entry"
domain: "python"
file: "numpy"
section: "indexing"
id: "np-unique"
title: "np.unique()"
category: "Indexing"
subtitle: "Deduplicate and count — return_counts=True for frequency"
signature_short: "np.unique(a, return_counts=False, return_inverse=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.unique()"
  - "np-unique"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/indexing"
  - "category/indexing"
  - "tier/tiered"
---

# np.unique()

> Deduplicate and count — return_counts=True for frequency

## Overview

np.unique() returns the sorted unique elements of an array. With return_counts=True it also returns how many times each unique value appears. With return_inverse=True it returns the indices that reconstruct the original array from the unique values.

## Signature

```python
np.unique(a, return_counts=False, return_inverse=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - return the sorted unique values of an array.
#             That's the whole feature.
# STRENGTHS - one call replaces "convert to set, sort, convert
#             back" — and it's vectorized.
# WEAKNESSES- doesn't yet show return_counts, return_inverse,
#             or the 2D axis= variant.
#
import numpy as np

ids = np.array([101, 105, 101, 103, 105, 101])
np.unique(ids)              # array([101, 103, 105])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday np.unique flags: return_counts for
#             frequency, return_inverse for "rebuild original
#             from unique values" (factorization), and axis=0
#             for unique rows of a 2D array.
# STRENGTHS - covers the use cases real code reaches for:
#             frequency tables, integer-encoding categorical
#             data, deduplicating rows.
# WEAKNESSES- doesn't address pandas' faster pd.unique for
#             non-sorted output or the SORTING cost of np.unique
#             on huge arrays — senior tier.
#
import numpy as np

ids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])

# Frequency table — sorted unique values plus their counts
unique, counts = np.unique(ids, return_counts=True)
# unique: [101 102 103 105]
# counts: [3 1 2 3]

# Factorize — encode each value as an integer code
unique, codes = np.unique(ids, return_inverse=True)
# codes is the same length as ids; ids == unique[codes]

# First-occurrence index for each unique value
unique, first_idx = np.unique(ids, return_index=True)

# Unique rows of a 2D array
orders = np.array([
    [101, 100],
    [105,  50],
    [101, 100],            # duplicate row
    [105,  75],
])
np.unique(orders, axis=0)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production unique: choose between np.unique
#             (sorted, slower) and pd.unique (insertion-order,
#             faster) based on what you actually need; reach
#             for return_inverse to encode large categorical
#             columns; bin big counts via np.bincount when the
#             values are small non-negative ints.
# STRENGTHS - sort cost matters at scale (100M+ rows); pd.unique
#             returns insertion order which is sometimes the
#             right answer; np.bincount is the fastest path
#             for "count occurrences of small ints".
# WEAKNESSES- pd.unique adds a pandas dependency for code that
#             might be pure NumPy; np.bincount only works for
#             non-negative int values; return_inverse on huge
#             arrays still has to sort to find unique values.
#
import numpy as np

ids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])

# 1. Categorical encoding via return_inverse
unique, codes = np.unique(ids, return_inverse=True)
# codes is now an int array suitable as model input or DB key

# 2. Fast counting for small non-negative ints
small = np.array([0, 1, 1, 2, 2, 2, 3])
np.bincount(small)              # array([1, 2, 3, 1])  — index = value, val = count
# Much faster than np.unique(..., return_counts=True) for this case

# 3. Need insertion order, not sorted? -> pandas
# import pandas as pd
# pd.unique(ids)                # preserves first-seen order

# 4. Unique rows of a structured frame
A = np.array([[1, "a"], [2, "b"], [1, "a"]])
# np.unique struggles with mixed dtypes; structured arrays or
# pandas DataFrame.drop_duplicates() are the right tools.

# Decision rule:
#   sorted unique values, generic dtype          -> np.unique(a)
#   insertion-order, mixed dtype                 -> pd.unique(a)
#   counts of small non-negative ints            -> np.bincount(a) (fastest)
#   unique rows of 2D numeric array              -> np.unique(A, axis=0)
#   unique rows of mixed-dtype frame             -> df.drop_duplicates()
#   need integer-encoding of a categorical col   -> np.unique(a, return_inverse=True)
#   need first-occurrence positions              -> np.unique(a, return_index=True)
#
# Anti-pattern: list(set(arr.tolist())) to deduplicate a NumPy array
#   Round-trips through Python objects (slow + extra memory), loses sort
#   order, and breaks dtype (everything becomes Python int/float). Use
#   np.unique(arr) — vectorized, dtype-preserving, sorted.
```

## Decision Rule

```text
sorted unique values, generic dtype          -> np.unique(a)
insertion-order, mixed dtype                 -> pd.unique(a)
counts of small non-negative ints            -> np.bincount(a) (fastest)
unique rows of 2D numeric array              -> np.unique(A, axis=0)
unique rows of mixed-dtype frame             -> df.drop_duplicates()
need integer-encoding of a categorical col   -> np.unique(a, return_inverse=True)
need first-occurrence positions              -> np.unique(a, return_index=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> list(set(arr.tolist())) to deduplicate a NumPy array
>   Round-trips through Python objects (slow + extra memory), loses sort
>   order, and breaks dtype (everything becomes Python int/float). Use
>   np.unique(arr) — vectorized, dtype-preserving, sorted.

## Tips

- `np.unique()` always returns sorted values — if you need unsorted unique values use `dict.fromkeys()` or `pd.unique()`
- `return_counts=True` is the numpy equivalent of `value_counts()` in pandas
- `return_inverse=True` lets you reconstruct the original array: `vals[inverse]`
- For 2D unique rows: `np.unique(A, axis=0)` — each row treated as one element
- For counts of small non-negative integers, `np.bincount(a)` is dramatically faster than `np.unique(a, return_counts=True)`

## Common Mistake

> [!warning] Using `set(a.tolist())` to get unique values from a NumPy array. It converts to Python, loses dtype, and is slower. Use `np.unique(a)` directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
product_ids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])
unique = np.unique(product_ids)  # [101 102 103 105]
unique, counts = np.unique(product_ids, return_counts=True)
```

**Senior:**
```python
np.unique(orders, axis=0)  # Unique rows
```

## See Also

- [[Sections/numpy/indexing/array-slicing|Array slicing (NumPy)]]
- [[Sections/numpy/indexing/boolean-masking|Boolean masking (NumPy)]]
- [[Sections/numpy/indexing/fancy-indexing|Fancy indexing (NumPy)]]
- [[Sections/numpy/indexing/np-where|np.where() (NumPy)]]
- [[Sections/numpy/indexing/_Index|NumPy → Indexing & Slicing]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

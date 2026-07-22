---
type: "entry"
domain: "python"
file: "numpy"
section: "indexing"
id: "fancy-indexing"
title: "Fancy indexing"
category: "Indexing"
subtitle: "Always returns a copy — enables non-contiguous selection"
signature_short: "a[[0, 2, 4]] | a[[rows], [cols]]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Fancy indexing"
  - "fancy-indexing"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/indexing"
  - "category/indexing"
  - "tier/tiered"
---

# Fancy indexing

> Always returns a copy — enables non-contiguous selection

## Overview

Fancy indexing selects elements by passing an array of indices. It always returns a copy (never a view). Useful for selecting non-contiguous rows/columns or reordering elements.

## Signature

```python
a[[0, 2, 4]] | a[[rows], [cols]]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - select elements by passing a list of integer
#             indices. Order and duplicates are honored.
# STRENGTHS - the simplest "pick these specific elements"
#             pattern; reads as "give me indices 4, 1, 2 in
#             that order".
# WEAKNESSES- doesn't yet show 2D fancy indexing (rows + cols
#             together) or the COPY rule that distinguishes it
#             from slicing.
#
import numpy as np

a = np.array([10, 20, 30, 40, 50])
a[[4, 1, 2]]            # array([50, 20, 30])
a[[0, 0, 1, 1]]         # array([10, 10, 20, 20]) — repeats allowed
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday fancy-indexing surface: 2D row/col
#             selection, parallel index arrays for picking
#             specific cells, and the rule that fancy indexing
#             ALWAYS returns a copy (vs slices, which return
#             views).
# STRENGTHS - covers the patterns that matter: pick a subset of
#             rows, reorder rows, extract diagonal-style cells
#             via parallel indices.
# WEAKNESSES- doesn't yet show np.ix_ for cartesian-product
#             indexing or the in-place assignment idiom —
#             senior tier.
#
import numpy as np

sales = np.array([
    [1200, 1450, 1800],     # Widget
    [ 980, 1100, 1300],     # Gadget
    [2100, 2200, 2400],     # Doohickey
    [1500, 1600, 1750],     # Gizmo
])

# Row selection
sales[[0, 2]]                                # Widget + Doohickey
sales[[3, 0, 2, 1]]                          # reordered rows

# Column selection
sales[:, [0, 2]]                             # cols 0 and 2

# Specific (row, col) cells via parallel index arrays
rows = np.array([0, 1, 2, 3])
cols = np.array([0, 1, 2, 0])
sales[rows, cols]                            # one cell per (row, col) pair

# Fancy indexing returns a COPY — modifying it doesn't touch source
subset = sales[[1, 3]]
subset[0, 0] = 0
sales[1, 0]                                  # still 980 — subset is independent
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production fancy indexing: np.ix_ for cartesian
#             cross-products of rows and columns (clearer than
#             nested indexing), in-place assignment via fancy
#             indices, and np.argsort + fancy indexing as the
#             standard "co-sort multiple arrays" pattern.
# STRENGTHS - np.ix_ is the cleanest way to pull "these rows
#             AND these columns"; in-place fancy assignment is
#             how you scatter values into specific positions;
#             argsort-then-index is the canonical co-sort.
# WEAKNESSES- np.ix_ is one more name to learn; in-place
#             fancy assignment with repeated indices can have
#             surprising last-write-wins semantics; co-sort
#             requires the same length on every related array.
#
import numpy as np

A = np.arange(20).reshape(4, 5)

# 1. np.ix_ — cartesian "rows AND cols" cross-product
rows = [0, 2, 3]
cols = [1, 4]
A[np.ix_(rows, cols)]                  # shape (3, 2) — every combo

# 2. In-place assignment scatters values into specific positions
out = np.zeros((5, 5))
rows = np.array([0, 1, 2, 3])
cols = np.array([0, 1, 2, 3])
out[rows, cols] = [10, 20, 30, 40]     # writes to (0,0), (1,1), (2,2), (3,3)

# 3. Co-sort multiple arrays — argsort + fancy indexing
amounts = np.array([300, 100, 200, 50])
labels  = np.array(["a", "b", "c", "d"])
order   = np.argsort(amounts)                # ascending
amounts_sorted = amounts[order]              # [50, 100, 200, 300]
labels_sorted  = labels[order]               # ['d', 'b', 'c', 'a']

# 4. take and put — clearer alternatives in some contexts
np.take(A, [0, 2, 3], axis=0)                # like A[[0,2,3], :]
buf = np.zeros(10)
np.put(buf, [1, 3, 5], [100, 200, 300])      # scatter values

# Anti-pattern: nested fancy indexing without np.ix_
#   A[[0, 2, 3]][:, [1, 4]]               # creates an intermediate copy
# Right:
#   A[np.ix_([0, 2, 3], [1, 4])]          # one selection, no intermediate
#
# Decision rule:
#   pick rows in given order                     -> A[row_indices]
#   pick cols in given order                     -> A[:, col_indices]
#   parallel pick of (row, col) cells            -> A[rows, cols] (zipped)
#   cartesian rows x cols                        -> A[np.ix_(rows, cols)]
#   reorder by another array's sort key          -> A[np.argsort(key)]
#   scatter values into specific positions       -> A[rows, cols] = values
#   alternative API in some codebases            -> np.take / np.put
```

## Decision Rule

```text
pick rows in given order                     -> A[row_indices]
pick cols in given order                     -> A[:, col_indices]
parallel pick of (row, col) cells            -> A[rows, cols] (zipped)
cartesian rows x cols                        -> A[np.ix_(rows, cols)]
reorder by another array's sort key          -> A[np.argsort(key)]
scatter values into specific positions       -> A[rows, cols] = values
alternative API in some codebases            -> np.take / np.put
```

## Anti-Pattern

> [!warning] Anti-pattern
> nested fancy indexing without np.ix_
>   A[[0, 2, 3]][:, [1, 4]]               # creates an intermediate copy
> Right:
>   A[np.ix_([0, 2, 3], [1, 4])]          # one selection, no intermediate

## Tips

- Fancy indexing always returns a **copy** — unlike slicing which returns a view
- You can repeat indices: `a[[0, 0, 1]]` returns `[a[0], a[0], a[1]]`
- `a[np.argsort(a)]` sorts by value using fancy indexing — useful for sorting multiple arrays together
- Fancy indexing is slower than slicing — slicing is O(1), fancy indexing is O(k) where k is indices

## Common Mistake

> [!warning] Trying to set values with fancy indexing through a temporary: `b = a[[0,2]]; b[0] = 99`. Since it is a copy, `a` is unchanged. Use `a[[0,2]] = 99` directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
revenue = np.array([1200, 3400, 2100, 950, 5600, 1800])
top_customers = revenue[[4, 1, 2]]  # [5600, 3400, 2100]
duplicates = revenue[[0, 0, 1, 1]]  # [1200, 1200, 3400, 3400]
```

**Senior:**
```python
print(revenue[1])  # still 3400 — subset is independent
```

## See Also

- [[Sections/numpy/indexing/array-slicing|Array slicing (NumPy)]]
- [[Sections/numpy/indexing/boolean-masking|Boolean masking (NumPy)]]
- [[Sections/numpy/indexing/np-unique|np.unique() (NumPy)]]
- [[Sections/numpy/indexing/np-where|np.where() (NumPy)]]
- [[Sections/numpy/indexing/_Index|NumPy → Indexing & Slicing]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

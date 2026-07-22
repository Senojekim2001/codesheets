---
type: "entry"
domain: "python"
file: "numpy"
section: "indexing"
id: "np-where"
title: "np.where()"
category: "Indexing"
subtitle: "Replace if/else loops over arrays"
signature_short: "np.where(condition, x, y) | np.where(condition)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.where()"
  - "np-where"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/indexing"
  - "category/indexing"
  - "tier/tiered"
---

# np.where()

> Replace if/else loops over arrays

## Overview

np.where(cond, x, y) returns x where cond is True, y elsewhere — the vectorized ternary. With one argument, np.where(cond) returns the indices where cond is True (same as np.nonzero).

## Signature

```python
np.where(condition, x, y) | np.where(condition)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - vectorized ternary: where(cond, x, y) returns
#             x where cond is True, y elsewhere.
# STRENGTHS - replaces a Python "if/else over an array" loop
#             with a single C-speed call.
# WEAKNESSES- doesn't yet show the one-arg form (np.where(cond)
#             returns indices) or how to handle 3+ branches.
#
import numpy as np

sales = np.array([1200, 950, 2100, 1500, 800, 2300])
adjusted = np.where(sales >= 1500, sales * 1.10, sales * 0.90)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday np.where surface: scalar-or-array
#             branches, the one-arg form for "give me indices
#             where the condition is true", and works
#             unchanged on 2D arrays.
# STRENGTHS - covers what np.where does in real code: derive
#             a feature column conditionally, find positions
#             matching a condition, transform a 2D array.
# WEAKNESSES- nested np.where for 3+ branches gets unreadable
#             fast — np.select is the right tool there
#             (senior tier).
#
import numpy as np

sales = np.array([1200, 950, 2100, 1500, 800, 2300])

# Scalar branches -> a string column
status = np.where(sales >= 1500, "Exceeded", "Below target")

# Mixed branches -> mathematical adjustment
improved = np.where(sales >= 1500, sales, sales * 1.15)

# One-arg form returns indices of True (per axis as a tuple)
above_idx = np.where(sales >= 1500)[0]   # 1D array of positions

# Works the same on 2D
regions = np.array([
    [1200, 1450, 1800],
    [ 950, 1100, 1300],
    [2100, 2200, 2400],
])
np.where(regions >= 1500, "Good", "Needs Work")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production np.where decisions: prefer np.select
#             over nested np.where for 3+ branches (readable
#             and faster), use np.where(cond) to get indices
#             when you actually want positions, and reach for
#             np.clip when the logic is "clamp to range".
# STRENGTHS - np.select scales to 5+ branches without
#             unreadable nesting; np.where(cond) is the
#             vectorized indexOf; np.clip is the simplest
#             clamp.
# WEAKNESSES- np.select still evaluates every branch (no
#             short-circuit), so guard heavy computations;
#             np.where(cond) returns a tuple — easy to forget
#             the [0] for 1D arrays.
#
import numpy as np

sales = np.array([1200, 950, 2100, 1500, 800, 2300])

# 1. Multi-branch — np.select beats nested np.where
rating = np.select(
    [sales < 1000, sales < 1500, sales >= 2000],
    ["poor",       "fair",       "excellent"],
    default="good",
)

# 2. Indices of matching positions
mask = sales >= 1500
idx  = np.where(mask)[0]                # array of positions
# np.flatnonzero(mask) is equivalent, slightly clearer for 1D

# 3. Clamping is simpler with np.clip than np.where
clipped = np.clip(sales, 1000, 2000)    # floor 1000, ceil 2000

# 4. Watch for double-evaluation in np.where branches
# Wrong (computes BOTH every time):
#   out = np.where(cond, expensive_a(x), expensive_b(x))
# Right: compute and select
a = expensive_a(x)
b = expensive_b(x)
out = np.where(cond, a, b)
# Or pre-mask if branches are conditional on data quality:
out = np.empty_like(x)
out[ cond] = expensive_a(x[ cond])
out[~cond] = expensive_b(x[~cond])
#
# Decision rule:
#   binary if/else over arrays                   -> np.where(cond, x, y)
#   3+ branches                                  -> np.select([conds], [vals], default)
#   floor/ceiling clamp only                     -> np.clip(a, lo, hi)
#   need indices where cond is True              -> np.flatnonzero(cond) or np.where(cond)[0]
#   apply expensive fn only to True/False rows   -> pre-mask: out[cond] = f(x[cond])
#   piecewise polynomial (closed-form ranges)    -> np.piecewise(x, conds, funcs)
#   bool input, just want True positions         -> np.argwhere(cond) for (i,j) tuples
#
# Anti-pattern: np.where(cond, expensive_a(x), expensive_b(x))
#   np.where is NOT short-circuiting — both branches are fully computed for
#   every element, then combined. If a branch is expensive or has side
#   effects (warnings, divide-by-zero), pre-compute via masked indexing
#   instead: out = np.empty_like(x); out[cond] = a(x[cond]); out[~cond] = b(...).
```

## Decision Rule

```text
binary if/else over arrays                   -> np.where(cond, x, y)
3+ branches                                  -> np.select([conds], [vals], default)
floor/ceiling clamp only                     -> np.clip(a, lo, hi)
need indices where cond is True              -> np.flatnonzero(cond) or np.where(cond)[0]
apply expensive fn only to True/False rows   -> pre-mask: out[cond] = f(x[cond])
piecewise polynomial (closed-form ranges)    -> np.piecewise(x, conds, funcs)
bool input, just want True positions         -> np.argwhere(cond) for (i,j) tuples
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.where(cond, expensive_a(x), expensive_b(x))
>   np.where is NOT short-circuiting — both branches are fully computed for
>   every element, then combined. If a branch is expensive or has side
>   effects (warnings, divide-by-zero), pre-compute via masked indexing
>   instead: out = np.empty_like(x); out[cond] = a(x[cond]); out[~cond] = b(...).

## Tips

- `np.where(cond, x, y)` — x and y can be scalars, arrays, or mixed
- For 3+ conditions use `np.select(conditions, choices, default)` instead of nested `np.where`
- `np.where(cond)` (one argument) returns a tuple of index arrays — one per dimension
- np.where is computed for all elements — there is no short-circuit, unlike Python if/else

## Common Mistake

> [!warning] Using nested np.where for 3+ conditions. It becomes unreadable fast. Use `np.select([cond1, cond2, cond3], [val1, val2, val3], default=val4)` instead.

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

- [[Sections/numpy/indexing/array-slicing|Array slicing (NumPy)]]
- [[Sections/numpy/indexing/boolean-masking|Boolean masking (NumPy)]]
- [[Sections/numpy/indexing/fancy-indexing|Fancy indexing (NumPy)]]
- [[Sections/numpy/indexing/np-unique|np.unique() (NumPy)]]
- [[Sections/numpy/indexing/_Index|NumPy → Indexing & Slicing]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

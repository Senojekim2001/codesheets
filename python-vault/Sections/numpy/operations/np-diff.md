---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-diff"
title: "np.diff()"
category: "Operations"
subtitle: "First difference, nth order, along any axis"
signature_short: "np.diff(a, n=1, axis=-1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.diff()"
  - "np-diff"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.diff()

> First difference, nth order, along any axis

## Overview

np.diff() computes the discrete difference between consecutive elements: out[i] = a[i+1] - a[i]. The result has one fewer element than the input. n= controls the order (apply diff n times). Useful for detecting changes, derivatives, and checking if an array is sorted.

## Signature

```python
np.diff(a, n=1, axis=-1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - consecutive differences: out[i] = a[i+1] - a[i].
#             Result has one fewer element.
# STRENGTHS - the smallest possible introduction to "discrete
#             derivative".
# WEAKNESSES- doesn't yet show n=2 (second derivative),
#             axis=, or prepend/append for length preservation.
#
import numpy as np

a = np.array([1, 3, 6, 10, 15])
np.diff(a)               # [2, 3, 4, 5]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday diff toolkit: nth-order diff,
#             axis-aware diff for 2D, prepend/append to keep
#             length, and the canonical use cases (is-sorted
#             check, percent change, detecting category
#             changes).
# STRENGTHS - covers what diff does in real time-series and
#             signal code; the prepend/append trick is the
#             single most-asked numpy question on this topic.
# WEAKNESSES- doesn't address pandas .diff alignment with
#             NaN or higher-order signal-processing diffs —
#             senior tier.
#
import numpy as np

a = np.array([1, 3, 6, 10, 15])

# nth-order
np.diff(a, n=2)          # [1, 1, 1] — second difference

# 2D — choose the axis
A = np.array([[1, 3, 6], [2, 5, 9]])
np.diff(A, axis=0)        # row differences (collapses rows by 1)
np.diff(A, axis=1)        # column differences

# Is the array sorted?
np.all(np.diff(a) >= 0)   # True == non-decreasing
np.all(np.diff(a) > 0)    # True == strictly increasing

# Keep the same length with prepend/append
np.diff(a, prepend=0)     # [1, 2, 3, 4, 5]
np.diff(a, append=20)     # [2, 3, 4, 5, 5]

# Percent change
np.diff(a) / a[:-1] * 100

# Detect where a categorical-like array changes value
x = np.array([1, 1, 2, 2, 3, 1])
np.where(np.diff(x) != 0)[0] + 1     # change-point indices
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production diff: pair with cumsum for "diff is
#             the inverse of cumsum"; reach for np.gradient
#             when you want a centered (more accurate) finite
#             difference; on time-series, prefer pandas
#             .diff() because it preserves index alignment
#             and handles NaN.
# STRENGTHS - the diff/cumsum invariant powers many
#             algorithms; np.gradient is the right tool for
#             physics-style derivatives; pandas .diff handles
#             irregular timestamps cleanly.
# WEAKNESSES- np.gradient assumes evenly-spaced samples
#             (passes-pass spacing= for non-uniform); pandas
#             alignment is per-row (slower than vectorized
#             numpy diff for plain arrays).
#
import numpy as np

a = np.array([1, 3, 6, 10, 15])

# 1. Diff and cumsum are inverses (up to the missing first element)
d = np.diff(a)
np.concatenate(([a[0]], a[0] + np.cumsum(d)))    # reconstructs a

# 2. np.gradient — centered finite difference (better near boundaries)
xs = np.linspace(0, 2 * np.pi, 100)
ys = np.sin(xs)
dy_dx = np.gradient(ys, xs)                      # ~ cos(xs)

# 3. Non-uniform spacing
t = np.array([0.0, 0.1, 0.3, 0.6, 1.0])           # irregular
y = np.array([0.0, 1.0, 4.0, 9.0, 16.0])
np.gradient(y, t)                                 # adapts to spacing

# 4. Time-series in pandas — index-aware, NaN-safe
# import pandas as pd
# s.diff()                # day-over-day
# s.diff(periods=7)       # week-over-week
# s.pct_change()          # relative change

# Decision rule:
#   plain consecutive deltas                     -> np.diff(a)
#   need same length as input                    -> np.diff(a, prepend=a[0])
#   nth-order (e.g. discrete acceleration)       -> np.diff(a, n=2)
#   centered / boundary-accurate                 -> np.gradient(y, x)
#   non-uniform spacing                          -> np.gradient(y, t)  (NOT np.diff/dt)
#   pandas time-series, NaN-safe                 -> Series.diff() / .pct_change()
#   reconstruct values from diffs                -> a[0] + np.cumsum(d)
#
# Anti-pattern: forgetting np.diff shrinks the array, then misaligning indices
#   diffs = np.diff(prices); pct = diffs / prices  # ValueError or wrong:
#   diffs has length N-1, prices has length N. The pct change is
#   diffs / prices[:-1] (or [1:] depending on convention). When in doubt
#   use prepend= to keep the original length, or step up to pandas .pct_change().
```

## Decision Rule

```text
plain consecutive deltas                     -> np.diff(a)
need same length as input                    -> np.diff(a, prepend=a[0])
nth-order (e.g. discrete acceleration)       -> np.diff(a, n=2)
centered / boundary-accurate                 -> np.gradient(y, x)
non-uniform spacing                          -> np.gradient(y, t)  (NOT np.diff/dt)
pandas time-series, NaN-safe                 -> Series.diff() / .pct_change()
reconstruct values from diffs                -> a[0] + np.cumsum(d)
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting np.diff shrinks the array, then misaligning indices
>   diffs = np.diff(prices); pct = diffs / prices  # ValueError or wrong:
>   diffs has length N-1, prices has length N. The pct change is
>   diffs / prices[:-1] (or [1:] depending on convention). When in doubt
>   use prepend= to keep the original length, or step up to pandas .pct_change().

## Tips

- Result has `len(a) - 1` elements — use `prepend=` or `append=` to preserve length
- `np.all(np.diff(a) >= 0)` is the fastest way to check if an array is non-decreasing
- `np.diff(a, n=2)` is the discrete second derivative — useful in signal processing
- For pandas, `.diff()` is the equivalent and handles NaN correctly

## Common Mistake

> [!warning] Expecting np.diff() to return the same length array. It always returns n fewer elements. Use `prepend=a[0]` to get the same length with 0 as the first difference.

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

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

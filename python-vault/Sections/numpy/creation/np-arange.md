---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-arange"
title: "np.arange()"
category: "Creation"
subtitle: "Like Python range() but returns an array — avoid float steps"
signature_short: "np.arange(start, stop, step)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.arange()"
  - "np-arange"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.arange()

> Like Python range() but returns an array — avoid float steps

## Overview

np.arange() generates values from start up to (not including) stop with a given step — like Python range() but returns an ndarray. For float steps, use np.linspace() instead — floating-point rounding can give ±1 element with arange.

## Signature

```python
np.arange(start, stop, step)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - integer sequences, like Python range() but
#             returns an ndarray. Stop is exclusive.
# STRENGTHS - smallest possible introduction; reads exactly like
#             range() so the call shape is instantly familiar.
# WEAKNESSES- doesn't surface the floating-point trap (arange
#             with a float step is unreliable) — junior tier.
#
import numpy as np

np.arange(5)            # [0 1 2 3 4]
np.arange(2, 8)         # [2 3 4 5 6 7]
np.arange(0, 10, 2)     # [0 2 4 6 8]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday arange surface: countdowns with
#             negative step, dtype overrides, common-use
#             idioms (index into arr by length, generate x for
#             a plot). End with the cardinal rule: NEVER use
#             arange with a float step — use linspace instead.
# STRENGTHS - covers what arange looks like in real numeric
#             code; the float-step warning is the single most
#             important thing to know about arange.
# WEAKNESSES- doesn't address very large arange allocations or
#             the "lazy alternative" — senior tier.
#
import numpy as np

# Countdown
np.arange(10, 0, -1)               # [10 9 8 ... 1]

# Force dtype
np.arange(5, dtype=float)          # [0. 1. 2. 3. 4.]

# Common pattern — indices for a known array
indices = np.arange(len(arr))

# Common pattern — x-values for a numeric plot
x = np.arange(0, 100)
y = x ** 2

# CARDINAL RULE: do not use a float step
# np.arange(0.0, 1.0, 0.1)        # may give 10 OR 11 elements
# Use linspace when you need an exact count of float points:
np.linspace(0.0, 1.0, 11)          # exactly 11 elements
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rules for arange: integer-only, prefer
#             linspace for any float spacing, watch large
#             allocations (use a generator or iter_batches for
#             huge ranges), and align dtype with downstream
#             consumers.
# STRENGTHS - integer-only avoids the float drift entirely;
#             linspace is correct under all spacing requests;
#             dtype hygiene at the call site prevents silent
#             promotion later.
# WEAKNESSES- linspace requires knowing the count; iter-style
#             approaches give up vectorization; dtype= is one
#             more thing to remember on every allocation.
#
import numpy as np

# 1. Integer-only — pin the dtype, especially on Windows
idx = np.arange(n_rows, dtype=np.int64)

# 2. Float spacing -> linspace, not arange
xs = np.linspace(0.0, 1.0, num=101)        # exactly 101 points

# 3. Huge ranges — don't materialize 100M ints if you can iterate
def index_chunks(n, batch=1_000_000):
    for start in range(0, n, batch):
        yield np.arange(start, min(start + batch, n), dtype=np.int64)

# 4. Quick guide
#    integer step, integer values   -> np.arange
#    float spacing                  -> np.linspace
#    log spacing                    -> np.geomspace (linspace on log scale)
#    just need to iterate           -> Python range() (no allocation)

# Anti-pattern: float arange in production
#   np.arange(0.0, 1.0, 0.1)        # off-by-one is implementation-defined
# Use np.linspace(0, 1, 11) and trust the count.
#
# Decision rule:
#   integer start/stop/step                      -> np.arange(start, stop, step)
#   need exactly N float points                  -> np.linspace(start, stop, N)
#   log-spaced points (e.g. learning rates)      -> np.geomspace(start, stop, N)
#   only iterating, no array needed              -> Python range() (no allocation)
#   indices into an existing array               -> np.arange(len(arr), dtype=np.int64)
#   countdown                                    -> np.arange(stop, 0, -1)
#   huge range, can't fit in memory              -> chunk via generator + np.arange per batch
```

## Decision Rule

```text
integer start/stop/step                      -> np.arange(start, stop, step)
need exactly N float points                  -> np.linspace(start, stop, N)
log-spaced points (e.g. learning rates)      -> np.geomspace(start, stop, N)
only iterating, no array needed              -> Python range() (no allocation)
indices into an existing array               -> np.arange(len(arr), dtype=np.int64)
countdown                                    -> np.arange(stop, 0, -1)
huge range, can't fit in memory              -> chunk via generator + np.arange per batch
```

## Anti-Pattern

> [!warning] Anti-pattern
> float arange in production
>   np.arange(0.0, 1.0, 0.1)        # off-by-one is implementation-defined
> Use np.linspace(0, 1, 11) and trust the count.

## Tips

- For integer sequences `np.arange` is safe; for float steps use `np.linspace` — no rounding surprises
- `np.arange(n)` is equivalent to `np.array(range(n))` but much faster
- Stop is **exclusive** — same as Python `range()`: `np.arange(0, 5)` gives `[0,1,2,3,4]`
- When you need a specific number of points between two values, use `np.linspace` instead

## Common Mistake

> [!warning] `np.arange(0, 1, 0.1)` may return 10 or 11 points depending on floating-point rounding. Use `np.linspace(0, 1, 11)` when you need a guaranteed exact count.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
np.arange(5)              # [0 1 2 3 4]
np.arange(2, 8)           # [2 3 4 5 6 7]
np.arange(0, 10, 2)       # [0 2 4 6 8]   — step of 2
```

**Senior:**
```python
y = x ** 2
```

## See Also

- [[Sections/numpy/creation/np-array|np.array() (NumPy)]]
- [[Sections/numpy/creation/np-zeros|np.zeros() (NumPy)]]
- [[Sections/numpy/creation/np-ones|np.ones() (NumPy)]]
- [[Sections/numpy/creation/np-linspace|np.linspace() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

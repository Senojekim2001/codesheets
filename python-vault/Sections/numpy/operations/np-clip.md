---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-clip"
title: "np.clip()"
category: "Operations"
subtitle: "Values below min become min, above max become max"
signature_short: "np.clip(a, a_min, a_max)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.clip()"
  - "np-clip"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.clip()

> Values below min become min, above max become max

## Overview

np.clip() restricts every element to the range [a_min, a_max]. Values below a_min become a_min; values above a_max become a_max. Vectorized and fast — no loops needed. Also available as a.clip(min, max).

## Signature

```python
np.clip(a, a_min, a_max)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - clamp every element into [lo, hi]. Vectorized,
#             one call.
# STRENGTHS - replaces np.minimum(np.maximum(...)) with a
#             clearer, faster single call.
# WEAKNESSES- doesn't yet show one-sided clamps, in-place
#             clipping, or the per-element-bounds form.
#
import numpy as np

a = np.array([-3, -1, 0, 2, 5, 8, 12])
np.clip(a, 0, 10)            # [0, 0, 0, 2, 5, 8, 10]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday clip surface: one-sided clamps via
#             None, the method form, and the practical use
#             cases (pixel normalization, log safety,
#             gradient clipping in ML).
# STRENGTHS - covers what clip is actually for in real code —
#             the patterns repeat across image processing,
#             numerical stability, and ML training loops.
# WEAKNESSES- doesn't show in-place clipping or the
#             per-element bounds form — senior tier.
#
import numpy as np

a = np.array([-3, -1, 0, 2, 5, 8, 12])

# One-sided — None means "no bound"
np.clip(a, 0, None)          # floor at 0, no ceiling
np.clip(a, None, 5)          # ceiling at 5, no floor

# Method form
a.clip(0, 10)

# Pixel normalization
pixels = np.random.randint(-10, 300, (100, 100))
valid  = np.clip(pixels, 0, 255)

# Log safety — avoid log(0)
logits = np.array([0.0001, 0.5, 0.9999])
safe = np.clip(logits, 1e-7, 1 - 1e-7)

# Gradient clipping in ML
# gradients = np.clip(gradients, -1.0, 1.0)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production clip: per-element bounds (different
#             min/max per row), in-place clipping with out=,
#             and picking np.clip vs np.minimum/maximum vs
#             mask assignment based on the actual shape of
#             the bound.
# STRENGTHS - per-element bounds handle "bound by category"
#             cases without a Python loop; out= avoids
#             allocation; clear decision rule across the four
#             clamp idioms.
# WEAKNESSES- per-element bounds need broadcastable shapes;
#             out= requires the right dtype; np.clip is
#             dtype-strict (clipping a float into an int array
#             can silently truncate).
#
import numpy as np

# 1. Per-element bounds — different floor/ceiling per index
vals = np.array([3, 0, 8, 12])
lo   = np.array([0, 1, 2, 0])
hi   = np.array([5, 5, 5, 10])
np.clip(vals, lo, hi)              # [3, 1, 5, 10]

# 2. In-place to avoid allocation
big = np.random.randn(10_000_000).astype(np.float32)
np.clip(big, -3.0, 3.0, out=big)   # same memory, no copy

# 3. Quick guide
#    bound by [lo, hi] both sides     -> np.clip(a, lo, hi)
#    element-wise max of TWO arrays   -> np.maximum(a, b)
#    element-wise min of TWO arrays   -> np.minimum(a, b)
#    set values WHERE mask is true    -> a[mask] = value

# 4. Watch dtype on int targets
ints = np.array([-3, 5, 12], dtype=np.int8)
np.clip(ints, -2, 10)              # works
# np.clip(ints, -200, 200)         # silently saturates inside int8 range
#
# Decision rule:
#   clamp to [lo, hi] both sides                 -> np.clip(a, lo, hi)
#   one-sided clamp (floor only, ceiling only)   -> np.clip(a, lo, None) / np.clip(a, None, hi)
#   per-element bounds                           -> np.clip(a, lo_arr, hi_arr) (broadcastable)
#   element-wise max of two arrays               -> np.maximum(a, b)
#   element-wise min of two arrays               -> np.minimum(a, b)
#   in-place clipping for huge arrays            -> np.clip(a, lo, hi, out=a)
#   ML gradient clipping by global norm          -> rescale, NOT element-wise clip
#
# Anti-pattern: np.minimum(np.maximum(a, lo), hi) instead of np.clip
#   Two passes, two temporaries, less readable, and slightly slower than the
#   single np.clip call. Worse, it's easy to get the order wrong (max/min
#   swapped) — the bug is silent. Use np.clip(a, lo, hi) as the primary clamp.
```

## Decision Rule

```text
clamp to [lo, hi] both sides                 -> np.clip(a, lo, hi)
one-sided clamp (floor only, ceiling only)   -> np.clip(a, lo, None) / np.clip(a, None, hi)
per-element bounds                           -> np.clip(a, lo_arr, hi_arr) (broadcastable)
element-wise max of two arrays               -> np.maximum(a, b)
element-wise min of two arrays               -> np.minimum(a, b)
in-place clipping for huge arrays            -> np.clip(a, lo, hi, out=a)
ML gradient clipping by global norm          -> rescale, NOT element-wise clip
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.minimum(np.maximum(a, lo), hi) instead of np.clip
>   Two passes, two temporaries, less readable, and slightly slower than the
>   single np.clip call. Worse, it's easy to get the order wrong (max/min
>   swapped) — the bug is silent. Use np.clip(a, lo, hi) as the primary clamp.

## Tips

- `np.clip(a, 0, None)` clips only the lower bound — `None` means no bound on that side
- Gradient clipping in neural networks: `np.clip(grads, -max_norm, max_norm)`
- Clip probabilities before log: `np.clip(p, 1e-7, 1-1e-7)` prevents `log(0) = -inf`
- `a.clip(lo, hi, out=a)` clips in-place with no copy — saves memory for large arrays

## Common Mistake

> [!warning] Using `np.minimum(np.maximum(a, lo), hi)` for clamping. `np.clip(a, lo, hi)` is shorter, clearer, and slightly faster.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([-3, -1, 0, 2, 5, 8, 12])
np.clip(a, 0, 10)     # [0, 0, 0, 2, 5, 8, 10]
np.clip(a, 0, None)   # [0, 0, 0, 2, 5, 8, 12] — clip only below
```

**Senior:**
```python
np.clip(np.array([3, 0, 8]), lo, hi)   # [3, 1, 5]
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/np-nan|np.nan handling (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-linspace"
title: "np.linspace()"
category: "Creation"
subtitle: "Count-based spacing — stop is inclusive, exact number guaranteed"
signature_short: "np.linspace(start, stop, num=50, endpoint=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.linspace()"
  - "np-linspace"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.linspace()

> Count-based spacing — stop is inclusive, exact number guaranteed

## Overview

np.linspace() generates exactly num values evenly spaced between start and stop (inclusive by default). Unlike arange(), the count is guaranteed regardless of floating-point rounding. Use it for plotting and numerical analysis.

## Signature

```python
np.linspace(start, stop, num=50, endpoint=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - generate exactly N evenly-spaced floats between
#             two values, endpoint included.
# STRENGTHS - the N is GUARANTEED — unlike arange with a float
#             step, you always get the count you asked for.
# WEAKNESSES- doesn't yet show endpoint=False, retstep=, or the
#             log-spaced alternatives — junior tier.
#
import numpy as np

np.linspace(0, 1, 11)            # [0.0  0.1  0.2  ...  1.0]
np.linspace(0, 100, 101)         # exactly 101 points, 0..100
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday linspace options: endpoint=False for
#             periodic signals, retstep=True to recover the
#             actual step, and the log-spaced cousins
#             (geomspace, logspace) for log-axis plots and
#             scaling sweeps.
# STRENGTHS - covers what linspace does in real numeric code:
#             plot grids, FFT input grids, hyperparameter sweeps.
# WEAKNESSES- doesn't address the dtype= override or the
#             "linspace vs arange vs range" decision rule —
#             senior tier.
#
import numpy as np

# Periodic signal — exclude endpoint to avoid duplicating 0 == 2*pi
x = np.linspace(0, 2 * np.pi, 100, endpoint=False)
y = np.sin(x)

# Get the step size too
values, step = np.linspace(0, 1, 11, retstep=True)   # step == 0.1

# Log-spaced sweeps for hyperparameter search / log axes
np.logspace(0, 3, 4)             # [1, 10, 100, 1000]   (base 10)
np.geomspace(1, 1000, 4)         # [1, 10, 100, 1000]   (linspace on log scale)

# Common plot grid
xs = np.linspace(-3, 3, 200)
ys = np.exp(-xs ** 2)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production linspace usage: pin dtype= when the
#             default float64 is wasteful, prefer geomspace over
#             logspace (more intuitive args), and pick
#             linspace vs arange vs Python range deliberately.
# STRENGTHS - dtype= cuts memory in half on big grids; geomspace
#             reads more naturally than logspace; the decision
#             rule eliminates a class of "off by one element"
#             bugs.
# WEAKNESSES- dtype=float32 has visibly less precision near
#             the endpoints for very long arrays; geomspace
#             requires both endpoints positive and same sign.
#
import numpy as np

# 1. Memory-tight grid — pin dtype
x = np.linspace(0.0, 1.0, num=10_000_001, dtype=np.float32)

# 2. Hyperparameter sweep — geomspace > logspace for intuitive args
lrs = np.geomspace(1e-5, 1e-1, num=9)        # 9 learning rates, log-spaced

# 3. Plot grid that excludes a singularity
eps = 1e-9
xs = np.linspace(eps, np.pi - eps, 1000)     # avoid 0 and pi exactly

# 4. Spacing quick guide
#    need exactly N float points         -> np.linspace(start, stop, N)
#    need integer-step sequence          -> np.arange(start, stop, step)
#    need log-spaced points              -> np.geomspace(start, stop, N)
#    just need to iterate (no array)     -> Python range() — no allocation

# 5. retstep= when the step matters downstream
xs, dx = np.linspace(0, T, num=N, retstep=True)
# Numerical integration: integral ~= (ys.sum() - 0.5*(ys[0]+ys[-1])) * dx
#
# Decision rule:
#   need exactly N points incl endpoints         -> np.linspace(a, b, N)
#   periodic signal (avoid duplicate at 2*pi)    -> np.linspace(0, 2*pi, N, endpoint=False)
#   numerical integration / step needed          -> np.linspace(..., retstep=True)
#   log-spaced (intuitive args)                  -> np.geomspace(a, b, N)
#   log-spaced via exponent (legacy)             -> np.logspace(start_exp, stop_exp, N)
#   integer indices                              -> np.arange(N), NOT np.linspace(0, N-1, N)
#   memory-tight grid (>1M points)               -> np.linspace(..., dtype=np.float32)
#
# Anti-pattern: np.linspace(0, n-1, n) to get integer indices
#   Returns float64, costs 8N bytes, and you'll lose precision past 2**53.
#   Use np.arange(n) — int dtype, half the memory, exact, and faster.
```

## Decision Rule

```text
need exactly N points incl endpoints         -> np.linspace(a, b, N)
periodic signal (avoid duplicate at 2*pi)    -> np.linspace(0, 2*pi, N, endpoint=False)
numerical integration / step needed          -> np.linspace(..., retstep=True)
log-spaced (intuitive args)                  -> np.geomspace(a, b, N)
log-spaced via exponent (legacy)             -> np.logspace(start_exp, stop_exp, N)
integer indices                              -> np.arange(N), NOT np.linspace(0, N-1, N)
memory-tight grid (>1M points)               -> np.linspace(..., dtype=np.float32)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.linspace(0, n-1, n) to get integer indices
>   Returns float64, costs 8N bytes, and you'll lose precision past 2**53.
>   Use np.arange(n) — int dtype, half the memory, exact, and faster.

## Tips

- Use `linspace` for plotting — you control exactly how many points you get
- `endpoint=False` is equivalent to `np.arange` behavior — useful for periodic signals
- `retstep=True` also returns the step size — handy to verify spacing
- `np.geomspace(a, b, n)` is linspace on a log scale — better than `np.logspace` for intuitive use

## Common Mistake

> [!warning] Using `np.linspace(0, n-1, n)` to get integer indices. Just use `np.arange(n)` — it is clearer and faster.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
np.linspace(0, 1, 11)         # [0.0  0.1  0.2  ...  1.0] — 11 points
np.linspace(0, 1, 5)          # [0.    0.25  0.5  0.75  1. ] — 5 points
np.linspace(0, 100, 101)      # 0 to 100 inclusive
```

**Senior:**
```python
np.geomspace(1, 1000, 4)      # [1, 10, 100, 1000] — geometric
```

## See Also

- [[Sections/numpy/creation/np-array|np.array() (NumPy)]]
- [[Sections/numpy/creation/np-zeros|np.zeros() (NumPy)]]
- [[Sections/numpy/creation/np-ones|np.ones() (NumPy)]]
- [[Sections/numpy/creation/np-arange|np.arange() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

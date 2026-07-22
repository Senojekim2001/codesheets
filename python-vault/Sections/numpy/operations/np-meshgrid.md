---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-meshgrid"
title: "np.meshgrid()"
category: "Operations"
subtitle: "Generate (X, Y) grids for 2D function evaluation and plotting"
signature_short: "X, Y = np.meshgrid(x, y)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.meshgrid()"
  - "np-meshgrid"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.meshgrid()

> Generate (X, Y) grids for 2D function evaluation and plotting

## Overview

np.meshgrid() takes N 1D arrays and returns N coordinate matrices. Used for evaluating 2D functions over a grid, creating contour plots, and generating all combinations of two arrays. indexing="ij" uses matrix indexing (row, col); indexing="xy" (default) uses Cartesian (x, y).

## Signature

```python
X, Y = np.meshgrid(x, y)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - turn two 1D coordinate vectors into 2D
#             coordinate matrices. Evaluate a function over
#             the resulting grid.
# STRENGTHS - shows the canonical use in three lines: x, y
#             vectors -> Z = f(X, Y) over the whole grid.
# WEAKNESSES- doesn't yet show sparse=True (memory savings),
#             indexing="ij" vs "xy", or the "all combinations"
#             use case.
#
import numpy as np

x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)             # both shape (100, 100)
Z = np.sin(X) * np.cos(Y)             # f over the grid
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday meshgrid uses: contour plotting,
#             "all combinations of two arrays" (cartesian
#             product), and the sparse=True flag for memory
#             efficiency on large grids.
# STRENGTHS - covers what meshgrid does in real plotting/
#             modeling code; sparse=True is the single most
#             useful option once grids get large.
# WEAKNESSES- doesn't address indexing="ij" vs "xy" axis
#             conventions or the np.mgrid alternative —
#             senior tier.
#
import numpy as np

# Contour-ready grid
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.exp(-(X**2 + Y**2) / 2)        # 2D Gaussian
# plt.contourf(X, Y, Z)

# All (x, y) combinations — cartesian product
x_pts = np.array([1, 2, 3])
y_pts = np.array([10, 20])
X, Y = np.meshgrid(x_pts, y_pts)
pairs = np.column_stack([X.ravel(), Y.ravel()])
# [[1,10],[2,10],[3,10],[1,20],[2,20],[3,20]]

# Memory-efficient alternative — sparse=True returns broadcast-ready arrays
Xs, Ys = np.meshgrid(x, y, sparse=True)
# Xs.shape == (1, 100), Ys.shape == (100, 1)
Zs = np.sin(Xs) * np.cos(Ys)          # broadcasts to (100, 100)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production meshgrid: prefer sparse=True or
#             implicit broadcasting (xs[:, None], ys[None, :])
#             over dense materialized grids; pick indexing=
#             ("xy" cartesian for plotting, "ij" matrix for
#             tensor work) deliberately; for huge grids,
#             stream computation instead of materializing.
# STRENGTHS - sparse/broadcast forms save dramatic memory on
#             big grids; explicit indexing= avoids the "rows
#             vs cols flipped" plotting bug; streaming keeps
#             memory bounded for very large evaluations.
# WEAKNESSES- broadcasting requires comfort with [:, None]
#             syntax; indexing= conventions are subtle and
#             often only matter at integration boundaries
#             (matplotlib expects xy; tensor libs often ij).
#
import numpy as np

x = np.linspace(-3, 3, 1000)
y = np.linspace(-3, 3, 1000)

# 1. Skip meshgrid entirely — broadcast is free
Z = np.sin(x[None, :]) * np.cos(y[:, None])    # shape (1000, 1000)

# 2. Indexing convention — pick on purpose
X, Y = np.meshgrid(x, y, indexing="xy")        # default; matplotlib-friendly
# X is row-major; X[i, j] = x[j], Y[i, j] = y[i]
Xij, Yij = np.meshgrid(x, y, indexing="ij")    # tensor-style
# Xij[i, j] = x[i], Yij[i, j] = y[j]

# 3. Stream rows for huge grids that don't fit in memory
def integrate_2d(f, x, y):
    total = 0.0
    for yi in y:
        total += np.sum(f(x, yi))               # one row at a time
    return total

# 4. np.mgrid — alternative compact syntax (returns dense by default)
X, Y = np.mgrid[-3:3:100j, -3:3:100j]           # complex step = "include endpoint"
# Open form (sparse-equivalent): np.ogrid[-3:3:100j, -3:3:100j]

# Decision rule:
#   plotting on a small grid                     -> np.meshgrid(x, y)  (default xy)
#   tensor / matrix-indexed math                 -> np.meshgrid(x, y, indexing="ij")
#   memory-tight large grid                      -> sparse=True OR broadcast x[None,:] * y[:,None]
#   compact slice-syntax form                    -> np.mgrid[-3:3:100j, -3:3:100j]
#   open / sparse slice-syntax form              -> np.ogrid[-3:3:100j, -3:3:100j]
#   very large grid you can't materialize        -> stream a row at a time
#   need (x, y) pair list, not 2 grids           -> np.column_stack([X.ravel(), Y.ravel()])
#
# Anti-pattern: dense np.meshgrid for a 1000x1000 grid you only sum over
#   meshgrid(x, y) without sparse=True allocates two N*M float64 arrays
#   (16 MB each at 1000x1000, gigabytes at 10000x10000). For element-wise
#   evaluation of f(x, y), use sparse=True or skip meshgrid entirely:
#   Z = f(x[None, :], y[:, None]) broadcasts with no extra allocation.
```

## Decision Rule

```text
plotting on a small grid                     -> np.meshgrid(x, y)  (default xy)
tensor / matrix-indexed math                 -> np.meshgrid(x, y, indexing="ij")
memory-tight large grid                      -> sparse=True OR broadcast x[None,:] * y[:,None]
compact slice-syntax form                    -> np.mgrid[-3:3:100j, -3:3:100j]
open / sparse slice-syntax form              -> np.ogrid[-3:3:100j, -3:3:100j]
very large grid you can't materialize        -> stream a row at a time
need (x, y) pair list, not 2 grids           -> np.column_stack([X.ravel(), Y.ravel()])
```

## Anti-Pattern

> [!warning] Anti-pattern
> dense np.meshgrid for a 1000x1000 grid you only sum over
>   meshgrid(x, y) without sparse=True allocates two N*M float64 arrays
>   (16 MB each at 1000x1000, gigabytes at 10000x10000). For element-wise
>   evaluation of f(x, y), use sparse=True or skip meshgrid entirely:
>   Z = f(x[None, :], y[:, None]) broadcasts with no extra allocation.

## Tips

- `sparse=True` returns shape (1,n) and (m,1) arrays that broadcast — saves memory for large grids
- Z.shape is (len(y), len(x)) — rows correspond to y values, columns to x values
- For 3D grids: `X, Y, Z = np.meshgrid(x, y, z)` — each output is 3D
- np.mgrid is an alternative: `X, Y = np.mgrid[-3:3:100j, -3:3:100j]`

## Common Mistake

> [!warning] Forgetting that Z has shape (len(y), len(x)) not (len(x), len(y)). Passing X and Z with swapped axes to a plotting function produces a transposed plot.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
```

**Senior:**
```python
X, Y = np.meshgrid(x, y, sparse=True)
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-nan|np.nan handling (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

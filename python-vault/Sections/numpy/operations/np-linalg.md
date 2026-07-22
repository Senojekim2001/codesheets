---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-linalg"
title: "np.linalg"
category: "Operations"
subtitle: "solve() for linear systems, eig() for eigenvalues, svd() for decomposition"
signature_short: "np.linalg.solve(A, b) | np.linalg.eig(A) | np.linalg.svd(A)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.linalg"
  - "np-linalg"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.linalg

> solve() for linear systems, eig() for eigenvalues, svd() for decomposition

## Overview

np.linalg provides standard linear algebra routines. solve() solves Ax=b more stably than computing the inverse. eig() returns eigenvalues and eigenvectors. svd() decomposes a matrix for PCA and dimensionality reduction.

## Signature

```python
np.linalg.solve(A, b) | np.linalg.eig(A) | np.linalg.svd(A)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - solve Ax = b. Verify with A @ x == b.
# STRENGTHS - the most common linear algebra task in three
#             lines.
# WEAKNESSES- doesn't yet show why solve > inv (numerical
#             stability) or the broader linalg toolkit.
#
import numpy as np

A = np.array([[2, 1], [-1, 3]], dtype=float)
b = np.array([5, 10], dtype=float)

x = np.linalg.solve(A, b)
np.allclose(A @ x, b)            # True
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday linalg surface: determinants and
#             rank for invertibility checks, norms (vector L2,
#             matrix Frobenius), eigendecomposition for
#             characteristic analysis, SVD as the foundation
#             of PCA, and lstsq for overdetermined systems.
# STRENGTHS - covers what you actually do with linalg in real
#             numerical / ML code.
# WEAKNESSES- doesn't address numerical stability deeply
#             (condition number, ill-conditioned systems) or
#             batched matrix ops — senior tier.
#
import numpy as np

A = np.array([[2, 1], [-1, 3]], dtype=float)

# Solve Ax = b — preferred over inv (better numerics)
b = np.array([5, 10], dtype=float)
x = np.linalg.solve(A, b)

# Properties
np.linalg.det(A)
np.linalg.matrix_rank(A)
np.linalg.norm(b)                # L2 vector norm
np.linalg.norm(A, "fro")         # Frobenius matrix norm

# Eigendecomposition
eigvals, eigvecs = np.linalg.eig(A)

# SVD — basis for PCA
U, s, Vt = np.linalg.svd(A)

# Least squares for overdetermined Ax ~ b
A_tall = np.random.randn(100, 3)
b_vec  = np.random.randn(100)
x_ls, residuals, rank, sv = np.linalg.lstsq(A_tall, b_vec, rcond=None)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production linear algebra: NEVER inv (use
#             solve), check condition number for stability,
#             prefer scipy.linalg for advanced decompositions
#             and batch-aware routines, and use np.linalg
#             broadcasting for batches of small matrices.
# STRENGTHS - solve over inv is the single most-cited
#             numerical hygiene rule; cond() flags
#             ill-conditioned problems before they explode;
#             batched broadcasting is how you do "1000
#             3x3 inversions" without a Python loop.
# WEAKNESSES- scipy adds a dependency for what numpy almost
#             covers; condition checks add a small cost; batch
#             linalg breaks if any matrix in the batch is
#             singular.
#
import numpy as np

# 1. Numerical hygiene — check before solve
A = np.array([[1.0, 2.0], [2.0, 4.0001]])
np.linalg.cond(A)                       # very large -> near-singular
# Use np.linalg.lstsq for ill-conditioned systems instead of solve

# 2. Batched matrix operations — broadcasting along leading axes
batch_A = np.random.randn(1000, 3, 3)
batch_b = np.random.randn(1000, 3)
batch_x = np.linalg.solve(batch_A, batch_b)        # vectorized over batch

# 3. PCA via SVD on a centered data matrix
X = np.random.randn(1000, 50)
Xc = X - X.mean(axis=0, keepdims=True)
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)
explained_var = s ** 2 / (len(X) - 1)
X_2d = Xc @ Vt.T[:, :2]                            # project to 2 components

# 4. When numpy isn't enough — scipy.linalg has more decompositions,
#    explicit triangular solvers, sparse routines, etc.
# from scipy.linalg import lu, qr, cholesky

# Standing rule:
#   inv(A) @ b   -> never
#   solve(A, b)  -> always (well-conditioned)
#   lstsq(A, b)  -> always (ill-conditioned or rectangular)
#
# Decision rule:
#   square, well-conditioned Ax=b                -> np.linalg.solve(A, b)
#   rectangular or ill-conditioned Ax~b          -> np.linalg.lstsq(A, b, rcond=None)
#   need explicit determinant                    -> np.linalg.det(A) (rare in practice)
#   eigen-decomposition (symmetric matrix)       -> np.linalg.eigh (faster, real eigvals)
#   eigen-decomposition (general matrix)         -> np.linalg.eig
#   PCA / dimensionality reduction               -> np.linalg.svd(X_centered, full_matrices=False)
#   batched operations on small matrices         -> stack -> np.linalg.solve broadcasts
#   advanced (LU, QR, Cholesky, sparse)          -> scipy.linalg / scipy.sparse.linalg
#
# Anti-pattern: x = np.linalg.inv(A) @ b
#   Computing the explicit inverse is both slower (forms a full matrix) AND
#   numerically less stable (amplifies ill-conditioning) than np.linalg.solve.
#   It only ever wins if you reuse inv(A) against many b vectors at once —
#   even then, factorize once with scipy.linalg.lu_factor and reuse the LU.
```

## Decision Rule

```text
square, well-conditioned Ax=b                -> np.linalg.solve(A, b)
rectangular or ill-conditioned Ax~b          -> np.linalg.lstsq(A, b, rcond=None)
need explicit determinant                    -> np.linalg.det(A) (rare in practice)
eigen-decomposition (symmetric matrix)       -> np.linalg.eigh (faster, real eigvals)
eigen-decomposition (general matrix)         -> np.linalg.eig
PCA / dimensionality reduction               -> np.linalg.svd(X_centered, full_matrices=False)
batched operations on small matrices         -> stack -> np.linalg.solve broadcasts
advanced (LU, QR, Cholesky, sparse)          -> scipy.linalg / scipy.sparse.linalg
```

## Anti-Pattern

> [!warning] Anti-pattern
> x = np.linalg.inv(A) @ b
>   Computing the explicit inverse is both slower (forms a full matrix) AND
>   numerically less stable (amplifies ill-conditioning) than np.linalg.solve.
>   It only ever wins if you reuse inv(A) against many b vectors at once —
>   even then, factorize once with scipy.linalg.lu_factor and reuse the LU.

## Tips

- `np.linalg.solve(A, b)` is more numerically stable than `np.linalg.inv(A) @ b` — always prefer solve
- Check `np.linalg.cond(A)` before solving — a large condition number means the system is ill-conditioned
- SVD is the foundation of PCA — the columns of U are the principal components
- For batch matrix operations, numpy broadcasts along the first axes: `np.linalg.solve(batch_A, batch_b)`

## Common Mistake

> [!warning] Using `np.linalg.inv(A) @ b` to solve a linear system. This is less numerically stable and slower than `np.linalg.solve(A, b)`. Always use solve().

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

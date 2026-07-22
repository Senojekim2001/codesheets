---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-einsum"
title: "np.einsum()"
category: "Performance"
subtitle: "Concise, fast tensor contractions — beats explicit loops"
signature_short: "np.einsum(\"ij,jk->ik\", A, B)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.einsum()"
  - "np-einsum"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/performance"
  - "tier/tiered"
---

# np.einsum()

> Concise, fast tensor contractions — beats explicit loops

## Overview

np.einsum() expresses tensor operations using Einstein summation notation. Repeated indices are summed over. It can express matrix multiply, dot products, outer products, traces, and batch operations concisely and efficiently.

## Signature

```python
np.einsum("ij,jk->ik", A, B)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - matrix multiply written as Einstein summation:
#             "ij,jk->ik" reads as "shared index j gets
#             summed; (i, k) survive in the output".
# STRENGTHS - introduces the notation in one line of working
#             code; reading it once explains the rule.
# WEAKNESSES- doesn't yet show the broader vocabulary
#             (transpose, trace, batch, element-wise) — those
#             are where einsum earns its keep.
#
import numpy as np

A = np.random.randn(100, 50)
B = np.random.randn(50, 30)
np.einsum("ij,jk->ik", A, B)        # matrix multiply, same as A @ B
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday einsum vocabulary: dot, outer
#             product, element-wise multiply, axis sums,
#             trace, transpose, and batched matrix multiply.
#             Each as a one-line einsum.
# STRENGTHS - shows that einsum is a SINGLE notation that
#             expresses most contraction patterns clearly.
# WEAKNESSES- doesn't address optimize=True for big
#             multi-tensor contractions or the "@ is
#             usually faster for simple cases" rule —
#             senior tier.
#
import numpy as np

A = np.random.randn(100, 50)
v = np.random.randn(100)
w = np.random.randn(100)

# Dot product
np.einsum("i,i->", v, w)                   # scalar

# Outer product
np.einsum("i,j->ij", v[:5], w[:5])         # (5, 5)

# Element-wise multiply
np.einsum("i,i->i", v, w)

# Axis sums
np.einsum("ij->j", A)                      # column sums  (== A.sum(axis=0))
np.einsum("ij->i", A)                      # row sums

# Trace
np.einsum("ii->", A[:50, :50])             # == np.trace

# Transpose
np.einsum("ij->ji", A)                     # == A.T

# Batched matrix multiply — b is the batch axis
batch_A = np.random.randn(10, 4, 3)
batch_B = np.random.randn(10, 3, 5)
np.einsum("bij,bjk->bik", batch_A, batch_B)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production einsum: use optimize=True for
#             multi-tensor contractions (numpy picks the best
#             contraction order), prefer @ / matmul / np.dot
#             for simple matmul (often faster), and reach for
#             einsum when the contraction is genuinely
#             complex (attention, tensor train, multi-axis
#             sum).
# STRENGTHS - optimize=True can be 10-100x faster on chained
#             contractions; explicit decision rule prevents
#             einsum overuse; complex tensor ops are far more
#             readable in einsum than chained reshape/matmul.
# WEAKNESSES- optimize="optimal" can be slow at planning time
#             for long expressions; einsum loses some perf vs
#             specialized BLAS for large simple matmul; the
#             notation is dense.
#
import numpy as np

# 1. Multi-tensor contraction with optimize=True
A = np.random.randn(100, 50)
B = np.random.randn(50, 30)
C = np.random.randn(30, 20)
out = np.einsum("ij,jk,kl->il", A, B, C, optimize=True)
# Internally numpy picks the best parenthesization

# 2. Attention pattern — Q (B, H, T, D) @ K^T (B, H, D, T)
B, H, T, D = 8, 12, 64, 64
Q = np.random.randn(B, H, T, D).astype(np.float32)
K = np.random.randn(B, H, T, D).astype(np.float32)
scores = np.einsum("bhtd,bhsd->bhts", Q, K)        # (B, H, T, T)

# 3. Quick guide
#   simple matmul (2D)              -> A @ B   (fastest, clearest)
#   batch matmul (B, M, N) @ (B, N, K) -> A @ B  (broadcasts) or einsum
#   tensor contraction over many axes  -> einsum (often the only readable option)
#   chained 3+ tensor contraction      -> einsum(..., optimize=True)

# 4. Mnemonic for reading einsum:
#   "indices that appear in BOTH inputs and NOT in output -> summed"
#   "indices that appear in only one input AND in output -> kept"
#
# Decision rule:
#   simple 2D matmul                             -> A @ B (faster than einsum)
#   batch matmul (..., M, N) @ (..., N, K)       -> A @ B (broadcasts cleanly)
#   simple dot product / vector-matrix           -> np.dot / @ (clearer than einsum)
#   transpose                                    -> A.T (NOT einsum("ij->ji", A))
#   axis sum / column sum                        -> A.sum(axis=...) (NOT einsum)
#   contraction over many axes (attention, etc.) -> einsum (most readable)
#   chained 3+ tensor contraction                -> einsum(..., optimize=True)
#
# Anti-pattern: reaching for einsum for ops that have a simpler builtin
#   np.einsum("i,i->", v, w)         # use np.dot(v, w)
#   np.einsum("ij->ji", A)           # use A.T
#   np.einsum("ij->j", A)            # use A.sum(axis=0)
#   einsum is slower for these (no BLAS dispatch in the simple case) and
#   harder to read at a glance. Save einsum for genuinely multi-axis ops.
```

## Decision Rule

```text
simple 2D matmul                             -> A @ B (faster than einsum)
batch matmul (..., M, N) @ (..., N, K)       -> A @ B (broadcasts cleanly)
simple dot product / vector-matrix           -> np.dot / @ (clearer than einsum)
transpose                                    -> A.T (NOT einsum("ij->ji", A))
axis sum / column sum                        -> A.sum(axis=...) (NOT einsum)
contraction over many axes (attention, etc.) -> einsum (most readable)
chained 3+ tensor contraction                -> einsum(..., optimize=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> reaching for einsum for ops that have a simpler builtin
>   np.einsum("i,i->", v, w)         # use np.dot(v, w)
>   np.einsum("ij->ji", A)           # use A.T
>   np.einsum("ij->j", A)            # use A.sum(axis=0)
>   einsum is slower for these (no BLAS dispatch in the simple case) and
>   harder to read at a glance. Save einsum for genuinely multi-axis ops.

## Tips

- Subscripts: `ij,jk->ik` means contract over `j` — the shared index
- Any omitted output index is summed over: `ij->i` sums along j (row sums)
- einsum with `optimize=True` finds the most efficient contraction order
- For simple matrix ops, `@` and `np.dot` are often faster — use einsum for complex contractions

## Common Mistake

> [!warning] Writing einsum without the output subscript for operations that should not sum. `np.einsum("ij,ij", A, B)` sums everything; `np.einsum("ij,ij->ij", A, B)` is element-wise multiply.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
A = np.random.randn(100, 50)
B = np.random.randn(50, 30)
v = np.random.randn(100)
```

**Senior:**
```python
np.einsum('ij->ji', A)    # same as A.T
```

## See Also

- [[Sections/pandas/io/dtype-opt|dtype optimization (Pandas)]]
- [[Sections/pandas/io/pd-eval|pd.eval() (Pandas)]]
- [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading (Databases & SQLAlchemy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

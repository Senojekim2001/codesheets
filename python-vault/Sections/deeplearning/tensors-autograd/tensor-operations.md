---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "tensor-operations"
title: "Tensor Operations"
category: "Tensor Ops"
subtitle: "Add, multiply, matmul tensors"
signature_short: "tensor1 + tensor2 | tensor1 @ tensor2 | torch.matmul()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Tensor Operations"
  - "tensor-operations"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/tensor-ops"
  - "tier/tiered"
---

# Tensor Operations

> Add, multiply, matmul tensors

## Overview

PyTorch supports standard mathematical operations: element-wise operations, matrix multiplication via @ operator, and broadcasting. These form the backbone of neural network computations.

## Signature

```python
tensor1 + tensor2 | tensor1 @ tensor2 | torch.matmul()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - element-wise operators, matmul via @.
#             Pure-numpy mental model.
# STRENGTHS - same operator vocabulary as numpy.
# WEAKNESSES- doesn't yet show batched matmul or
#             broadcasting patterns specific to NN.
#
import torch
a = torch.tensor([[1., 2.], [3., 4.]])
b = torch.tensor([[5., 6.], [7., 8.]])
a + b
a * b           # element-wise
a @ b           # matrix multiply
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday tensor-op surface:
#             broadcasting (just like numpy), batched
#             matmul (the leading dims are batches),
#             in-place ops (suffix _ saves memory but
#             breaks autograd graph), reductions
#             with axis= AND keepdim=.
# STRENGTHS - covers what NN forward passes actually
#             do: batch matmul, broadcast bias, sum
#             along an axis with keepdim.
# WEAKNESSES- doesn't address torch.einsum or fused
#             ops — senior tier.
#
import torch

# Batched matmul: leading dims are batch
# (B, M, K) @ (B, K, N) -> (B, M, N)
A = torch.randn(32, 4, 3)
B = torch.randn(32, 3, 5)
out = A @ B                                # shape (32, 4, 5)

# Broadcasting (same rules as numpy)
x = torch.randn(32, 10)                     # (B, features)
bias = torch.randn(10)                      # (features,)
y = x + bias                                # broadcasts to (32, 10)

# In-place — saves memory but breaks autograd if needed downstream
x.add_(1.0)                                 # x += 1
x.mul_(0.5)

# Reductions with keepdim=True for broadcasting back
mu = x.mean(dim=1, keepdim=True)            # (32, 1)
x_centered = x - mu                          # broadcasts cleanly
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production tensor ops: torch.einsum
#             for arbitrary contractions (attention,
#             tensor train), fused matmul+bias via
#             torch.addmm (faster than +), bmm for
#             explicit batched matmul, contiguity
#             checks before reshape/view.
# STRENGTHS - einsum is the industry vocabulary for
#             attention; addmm fuses one allocation
#             out; the contiguity check prevents
#             silent copies.
# WEAKNESSES- einsum is dense to read; addmm is
#             niche-but-real; contiguity checks add
#             ceremony.
#
import torch

# 1. Einsum — arbitrary contractions
# Q (B, H, T, D) attended to K (B, H, T, D) -> (B, H, T, T)
B, H, T, D = 8, 12, 64, 64
Q = torch.randn(B, H, T, D)
K = torch.randn(B, H, T, D)
scores = torch.einsum("bhtd,bhsd->bhts", Q, K) / D ** 0.5

# 2. Fused matmul + bias add
out = torch.addmm(bias, x, weight.T)       # equivalent to x @ weight.T + bias

# 3. Batched matmul explicit
out = torch.bmm(A, B)                       # both (B, M, K) and (B, K, N)

# 4. Check contiguity before view (avoid silent copies)
y = x.transpose(0, 1)
if not y.is_contiguous():
    y = y.contiguous()                      # explicit copy
y_flat = y.view(-1)                         # safe to view now

# Decision rule:
#   simple matmul                       -> @
#   batched matmul, leading dim batch    -> @ (broadcasting handles it)
#   batched matmul, explicit              -> torch.bmm
#   matmul + bias                         -> torch.addmm (one alloc)
#   non-trivial tensor contraction         -> torch.einsum
#
# Anti-pattern: using in-place ops (x.add_, x.mul_) on tensors that still
# need to flow gradients
#   The original tensor is overwritten, so autograd cannot reconstruct
#   the saved activation and backward() either errors or silently
#   computes wrong grads. Use the out-of-place form (x = x + y) inside
#   any forward path that requires_grad; reserve in-place for buffers
#   and explicit no_grad regions.
```

## Decision Rule

```text
simple matmul                       -> @
batched matmul, leading dim batch    -> @ (broadcasting handles it)
batched matmul, explicit              -> torch.bmm
matmul + bias                         -> torch.addmm (one alloc)
non-trivial tensor contraction         -> torch.einsum
```

## Anti-Pattern

> [!warning] Anti-pattern
> using in-place ops (x.add_, x.mul_) on tensors that still
> need to flow gradients
>   The original tensor is overwritten, so autograd cannot reconstruct
>   the saved activation and backward() either errors or silently
>   computes wrong grads. Use the out-of-place form (x = x + y) inside
>   any forward path that requires_grad; reserve in-place for buffers
>   and explicit no_grad regions.

## Tips

- Use @ for matrix multiplication, * for element-wise
- In-place ops (ending with _) save memory but break computation graph
- Broadcasting automatically expands shapes to match dimensions

## Common Mistake

> [!warning] Confusing * (element-wise) with @ (matrix multiplication) causes incorrect network outputs.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
a = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
b = torch.tensor([[5.0, 6.0], [7.0, 8.0]])
add_result = a + b
```

**Senior:**
```python
print(f"In-place addition:\n{a}")
```

## See Also

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

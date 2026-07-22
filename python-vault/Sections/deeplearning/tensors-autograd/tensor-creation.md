---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "tensor-creation"
title: "torch.tensor"
category: "Tensor Creation"
subtitle: "Initialize tensors from lists"
signature_short: "torch.tensor(data, dtype=None, device=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "torch.tensor"
  - "tensor-creation"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/tensor-creation"
  - "tier/tiered"
---

# torch.tensor

> Initialize tensors from lists

## Overview

Create a PyTorch tensor from Python lists, arrays, or scalars. The fundamental building block of all PyTorch operations. Automatically infers data type unless specified.

## Signature

```python
torch.tensor(data, dtype=None, device=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - torch.tensor from a list. Inspect
#             shape and dtype.
# STRENGTHS - the simplest tensor constructor.
# WEAKNESSES- doesn't yet show dtype= pinning or
#             device= placement.
#
import torch
t = torch.tensor([1.0, 2.0, 3.0])
t.shape, t.dtype, t.device
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: pin dtype=
#             torch.float32 (NN default), device=,
#             specialized constructors (zeros/ones/
#             randn/arange).
# STRENGTHS - pinning dtype prevents the int64 trap
#             (torch.tensor of ints defaults to int64
#             which mismatches float32 model weights).
# WEAKNESSES- doesn't address torch.from_numpy zero-
#             copy or pinned memory — senior tier.
#
import torch

# Constructors — always pin dtype for NN code
torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
torch.zeros(3, 4, dtype=torch.float32)
torch.ones((3, 4), dtype=torch.float32)
torch.randn(3, 4)                              # standard normal
torch.arange(0, 10, dtype=torch.float32)

# Place on a device
device = "cuda" if torch.cuda.is_available() else "cpu"
x = torch.randn(32, 10, device=device, dtype=torch.float32)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production tensor creation: zero-copy
#             from numpy via torch.from_numpy, pinned
#             memory for fast async H2D transfer,
#             empty tensors for in-place writes,
#             *_like for shape+dtype matching.
# STRENGTHS - from_numpy avoids a copy when
#             interfacing with pandas/numpy
#             pipelines; pinned memory + non_blocking
#             transfer overlaps GPU compute with data
#             prep; *_like keeps shape contracts
#             implicit.
# WEAKNESSES- from_numpy shares memory — modifying
#             one mutates the other; pinned memory
#             is page-locked (fixed RAM cost).
#
import numpy as np, torch

# 1. Zero-copy from numpy (memory shared)
arr = np.random.randn(1000, 100).astype(np.float32)
t = torch.from_numpy(arr)
# t and arr share memory — mutate one, see the other

# 2. Pinned host memory + async H2D
x_pinned = torch.empty(1024, 1024, pin_memory=True)
x_pinned.copy_(torch.randn(1024, 1024))
x_gpu = x_pinned.to("cuda", non_blocking=True)        # overlaps with compute

# 3. *_like — match shape AND dtype AND device
mask = torch.ones_like(t, dtype=torch.bool)           # same shape, bool dtype

# 4. Empty for pre-allocated buffers in hot loops
buf = torch.empty(batch, 256, device="cuda")
for batch_data in loader:
    buf.copy_(batch_data, non_blocking=True)          # fill in place

# Decision rule:
#   from numpy / pandas             -> torch.from_numpy (zero-copy)
#   GPU staging buffer                -> empty(..., pin_memory=True)
#   match an existing tensor          -> *_like(reference)
#   constants                         -> tensor / zeros / ones with dtype=
#
# Anti-pattern: torch.tensor([...]) of integer Python lists for NN input
#   The default dtype becomes int64, then the first matmul against a
#   float32 weight blows up with "expected scalar type Float but got
#   Long". Always pin dtype=torch.float32 (or use torch.from_numpy of an
#   already-float32 array) at construction — not after the fact.
```

## Decision Rule

```text
from numpy / pandas             -> torch.from_numpy (zero-copy)
GPU staging buffer                -> empty(..., pin_memory=True)
match an existing tensor          -> *_like(reference)
constants                         -> tensor / zeros / ones with dtype=
```

## Anti-Pattern

> [!warning] Anti-pattern
> torch.tensor([...]) of integer Python lists for NN input
>   The default dtype becomes int64, then the first matmul against a
>   float32 weight blows up with "expected scalar type Float but got
>   Long". Always pin dtype=torch.float32 (or use torch.from_numpy of an
>   already-float32 array) at construction — not after the fact.

## Tips

- Use dtype=torch.float32 for neural network computations
- torch.tensor() copies data; use torch.as_tensor() for zero-copy
- Always check shape with .shape and dtype with .dtype

## Common Mistake

> [!warning] Creating tensors without specifying dtype leads to int64 by default, causing type mismatches in networks expecting float32.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
t1 = torch.tensor([1.0, 2.0, 3.0])
print(f"1D tensor: {t1}")
t2 = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
```

**Senior:**
```python
print(f"Shape: {t1.shape}, Device: {t1.device}, Dtype: {t1.dtype}")
```

## See Also

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

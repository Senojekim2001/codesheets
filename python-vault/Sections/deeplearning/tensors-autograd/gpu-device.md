---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "gpu-device"
title: ".to(device)"
category: "Device Management"
subtitle: "CPU to GPU or GPU to CPU"
signature_short: "tensor.to(device) | tensor.cuda() | tensor.cpu()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".to(device)"
  - "gpu-device"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/device-management"
  - "tier/tiered"
---

# .to(device)

> CPU to GPU or GPU to CPU

## Overview

Move tensors and models to different devices (CPU/GPU) for computation. PyTorch requires all tensors in an operation to be on same device. Use .to() for flexibility or .cuda()/.cpu() for explicit device choice.

## Signature

```python
tensor.to(device) | tensor.cuda() | tensor.cpu()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - pick device, move model and input to
#             the same one before forward.
# STRENGTHS - the simplest CPU/GPU pattern.
# WEAKNESSES- doesn't yet show non_blocking, MPS
#             (Apple Silicon), or device-portable
#             code.
#
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
x = x.to(device)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - device-portable code: pick device once
#             at top, move model + every batch in
#             the loop, support MPS for Apple
#             Silicon, use non_blocking=True with
#             pinned memory for async H2D.
# STRENGTHS - the device-portable pattern works on
#             every machine; non_blocking transfer
#             overlaps with compute.
# WEAKNESSES- doesn't address multi-GPU or mixed-
#             precision — senior tier.
#
import torch

# Device-portable pick (CUDA / MPS / CPU)
device = (
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)
model = model.to(device)

for x, y in dataloader:
    x = x.to(device, non_blocking=True)         # async if pinned
    y = y.to(device, non_blocking=True)
    pred = model(x)
    loss = criterion(pred, y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production GPU usage: torch.cuda.amp
#             for mixed precision (2-4x speedup,
#             half memory); DataLoader pin_memory=
#             True + non_blocking for async transfer;
#             torch.cuda.synchronize() ONLY for
#             timing; multi-GPU via
#             DistributedDataParallel.
# STRENGTHS - AMP is free speedup on modern GPUs
#             (Ampere+); pin_memory + non_blocking
#             eliminates H2D bottlenecks; sync rules
#             prevent silently wrong timings.
# WEAKNESSES- AMP can cause numerical issues with
#             specific layers (LayerNorm, certain
#             losses); DDP requires multi-process
#             setup.
#
import torch
from torch.cuda.amp import autocast, GradScaler

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
scaler = GradScaler()                            # for mixed precision

for x, y in dataloader:                          # pin_memory=True in DataLoader
    x = x.to(device, non_blocking=True)
    y = y.to(device, non_blocking=True)

    optimizer.zero_grad(set_to_none=True)

    with autocast():                             # forward in fp16
        pred = model(x)
        loss = criterion(pred, y)

    scaler.scale(loss).backward()                 # scaled to avoid fp16 underflow
    scaler.step(optimizer)
    scaler.update()

# Timing only — sync to wait for GPU work
# torch.cuda.synchronize()
# t0 = time.time()
# ... gpu work ...
# torch.cuda.synchronize()
# elapsed = time.time() - t0

# Decision rule:
#   single GPU, modern hardware        -> autocast + GradScaler
#   small model, CPU is fine            -> skip GPU entirely
#   multiple GPUs                        -> torch.nn.parallel.DistributedDataParallel
#   Apple Silicon                        -> device="mps"
#
# Anti-pattern: constructing tensors on CPU and then .to("cuda")-ing
# them every iteration of the training loop
#   torch.zeros(B, D).to(device) inside the loop allocates host memory,
#   does a sync H2D copy, and ignores pin_memory entirely. Allocate
#   GPU-resident buffers once with torch.zeros(..., device=device),
#   reuse via .copy_(non_blocking=True), and rely on DataLoader
#   pin_memory + non_blocking for input batches.
```

## Decision Rule

```text
single GPU, modern hardware        -> autocast + GradScaler
small model, CPU is fine            -> skip GPU entirely
multiple GPUs                        -> torch.nn.parallel.DistributedDataParallel
Apple Silicon                        -> device="mps"
```

## Anti-Pattern

> [!warning] Anti-pattern
> constructing tensors on CPU and then .to("cuda")-ing
> them every iteration of the training loop
>   torch.zeros(B, D).to(device) inside the loop allocates host memory,
>   does a sync H2D copy, and ignores pin_memory entirely. Allocate
>   GPU-resident buffers once with torch.zeros(..., device=device),
>   reuse via .copy_(non_blocking=True), and rely on DataLoader
>   pin_memory + non_blocking for input batches.

## Tips

- Always move both model and data to same device before forward pass
- Use device variable for code that works on CPU or GPU
- Moving tensors is non-blocking; use torch.cuda.synchronize() if timing
- On modern GPUs, wrap the forward in `torch.autocast` and scale gradients with `torch.cuda.amp.GradScaler` — mixed-precision typically gives 2-3x throughput at no accuracy cost
- For multi-GPU prefer `torch.nn.parallel.DistributedDataParallel`; on Apple Silicon use `device="mps"`

## Common Mistake

> [!warning] Mixing tensors on CPU and GPU causes "expected ... to be the same device" error.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

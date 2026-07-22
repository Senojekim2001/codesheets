---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "tensor-reshaping"
title: "Reshape & View"
category: "Shape Manipulation"
subtitle: "reshape(), view(), squeeze(), unsqueeze()"
signature_short: "tensor.reshape(shape) | tensor.view(shape) | tensor.squeeze() | tensor.unsqueeze(dim)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Reshape & View"
  - "tensor-reshaping"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/shape-manipulation"
  - "tier/tiered"
---

# Reshape & View

> reshape(), view(), squeeze(), unsqueeze()

## Overview

Reshape tensors to different dimensions: view() creates a view (same memory), reshape() may copy, squeeze() removes size-1 dims, unsqueeze() adds size-1 dims. Essential for feeding data to networks.

## Signature

```python
tensor.reshape(shape) | tensor.view(shape) | tensor.squeeze() | tensor.unsqueeze(dim)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - reshape with explicit dims; -1 to infer
#             one dim. Same total element count.
# STRENGTHS - the basic API in three lines.
# WEAKNESSES- doesn't yet show view vs reshape or
#             squeeze/unsqueeze.
#
import torch
t = torch.arange(24)
t.reshape(2, 3, 4).shape                   # (2, 3, 4)
t.reshape(-1, 4).shape                     # (6, 4)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday reshape surface: view
#             (zero-copy if contiguous) vs reshape
#             (copies if needed); squeeze/unsqueeze
#             for adding/removing batch dims;
#             flatten for collapse.
# STRENGTHS - the squeeze/unsqueeze pair is the
#             standard "add a batch dim" or "drop a
#             singleton dim" idiom.
# WEAKNESSES- doesn't address transpose+contiguous
#             gotcha — senior tier.
#
import torch

t = torch.arange(24)

# view — zero-copy when contiguous
v = t.view(2, 3, 4)

# reshape — copies if needed (safer default)
r = t.reshape(2, 3, 4)

# Add batch dim (B=1)
single = torch.randn(3, 32, 32)
batched = single.unsqueeze(0)              # (1, 3, 32, 32)

# Remove all size-1 dims OR a specific dim
out = torch.randn(1, 10, 1)
out.squeeze().shape                         # (10,)
out.squeeze(0).shape                        # (10, 1)

# Flatten everything past dim 1 — common after a CNN
features = torch.randn(32, 128, 7, 7)
flat = features.flatten(1)                  # (32, 128*7*7)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reshaping: transpose +
#             contiguous before view (transpose
#             returns non-contiguous, view fails);
#             permute for arbitrary axis reorder
#             (channel-first vs channel-last);
#             einops for readable rearrangements at
#             scale.
# STRENGTHS - the transpose+contiguous trap is the
#             single most common reshape error;
#             einops syntax (rearrange) is far more
#             readable than chained reshape/permute.
# WEAKNESSES- einops is a separate dependency;
#             contiguous() forces a copy.
#
import torch

# 1. transpose returns non-contiguous; view fails
y = torch.randn(2, 3, 4)
y_t = y.transpose(0, 1)                     # (3, 2, 4) but NOT contiguous
# y_t.view(-1)                              # RuntimeError
y_t = y_t.contiguous()
y_t.view(-1).shape                          # (24,) — works now

# 2. permute — arbitrary axis reorder
img = torch.randn(32, 3, 224, 224)          # (B, C, H, W)
img_hwc = img.permute(0, 2, 3, 1)           # (B, H, W, C) for plotting

# 3. einops — readable rearrangements
# pip install einops
# from einops import rearrange, reduce, repeat
# q = rearrange(x, "b t (h d) -> b h t d", h=num_heads)   # split heads
# y = reduce(x, "b c h w -> b c", "mean")                  # global pool
# r = repeat(x, "b c -> b c h w", h=H, w=W)                # broadcast

# Decision rule:
#   simple shape change                  -> reshape
#   guaranteed zero-copy                  -> view (after contiguous)
#   axis reorder                          -> permute (then contiguous if needed)
#   adding/removing batch dim             -> unsqueeze / squeeze
#   complex multi-axis rearrangement      -> einops.rearrange
#
# Anti-pattern: chaining .view(...) directly after .transpose / .permute
#   Transpose/permute return a non-contiguous view; .view() then raises
#   "view size is not compatible with input tensor's size and stride".
#   People "fix" it by switching to .reshape(), which silently copies in
#   the hot path. Insert an explicit .contiguous() so the copy (and its
#   memory cost) is visible, or use einops.rearrange which handles it.
```

## Decision Rule

```text
simple shape change                  -> reshape
guaranteed zero-copy                  -> view (after contiguous)
axis reorder                          -> permute (then contiguous if needed)
adding/removing batch dim             -> unsqueeze / squeeze
complex multi-axis rearrangement      -> einops.rearrange
```

## Anti-Pattern

> [!warning] Anti-pattern
> chaining .view(...) directly after .transpose / .permute
>   Transpose/permute return a non-contiguous view; .view() then raises
>   "view size is not compatible with input tensor's size and stride".
>   People "fix" it by switching to .reshape(), which silently copies in
>   the hot path. Insert an explicit .contiguous() so the copy (and its
>   memory cost) is visible, or use einops.rearrange which handles it.

## Tips

- Use -1 in reshape to auto-infer one dimension
- view() is faster when possible but requires contiguous tensors
- squeeze/unsqueeze are batch dimension helpers

## Common Mistake

> [!warning] Using view() on non-contiguous tensors causes errors; use reshape() or contiguous() first.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
t = torch.arange(24)  # [0, 1, 2, ..., 23]
print(f"Original shape: {t.shape}")
reshaped = t.reshape(2, 3, 4)
```

**Senior:**
```python
print(f"Unsqueezed shape: {unsqueezed.shape}")
```

## See Also

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "maxpool2d"
title: "nn.MaxPool2d"
category: "Pooling"
subtitle: "Downsample feature maps"
signature_short: "nn.MaxPool2d(kernel_size, stride, padding)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.MaxPool2d"
  - "maxpool2d"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/pooling"
  - "tier/tiered"
---

# nn.MaxPool2d

> Downsample feature maps

## Overview

Takes maximum value in local window. Reduces spatial dimensions (height/width) while preserving important features. Stride often equals kernel_size for non-overlapping windows.

## Signature

```python
nn.MaxPool2d(kernel_size, stride, padding)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One MaxPool2d call halving spatial dims
# STRENGTHS - Clearest demo of the (B, C, H/2, W/2) shape change
# WEAKNESSES- Doesn't show the math or alternatives
#
import torch
import torch.nn as nn

x = torch.randn(1, 3, 8, 8)               # (B, C, H, W)
pool = nn.MaxPool2d(kernel_size=2)        # default stride = kernel_size
print(pool(x).shape)                      # torch.Size([1, 3, 4, 4])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Compare MaxPool, AvgPool, AdaptiveAvgPool, and the stride knob
# STRENGTHS - Shows the three pooling tools you'll actually pick between
# WEAKNESSES- No discussion of receptive field or stride-vs-pool tradeoff
#
import torch
import torch.nn as nn

x = torch.randn(2, 3, 8, 8)

# Non-overlapping (stride=kernel_size, the standard)
print(nn.MaxPool2d(2)(x).shape)              # (2, 3, 4, 4)
# Overlapping windows preserve more spatial info
print(nn.MaxPool2d(kernel_size=2, stride=1)(x).shape)   # (2, 3, 7, 7)
# Average pooling — smoother, weaker for sharp features
print(nn.AvgPool2d(2)(x).shape)              # (2, 3, 4, 4)
# Adaptive: pick the OUTPUT size, kernel/stride solved for you
print(nn.AdaptiveAvgPool2d((1, 1))(x).shape) # (2, 3, 1, 1) — the GAP head trick

# Visualize the max op
small = torch.tensor([[[[1., 2., 3., 4.],
                        [5., 6., 7., 8.],
                        [9., 10., 11., 12.],
                        [13., 14., 15., 16.]]]])
print(nn.MaxPool2d(2)(small)[0, 0])  # tensor([[6, 8], [14, 16]])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pooling-vs-stride decision rule and the modern CNN preference
# STRENGTHS - Captures the design choice modern architectures actually make
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn

# Spatial output for any pooling/conv:
#   out = floor((in + 2p - k) / s) + 1
def out_dim(in_dim, k, s, p=0):
    return (in_dim + 2*p - k) // s + 1

print(out_dim(32, 2, 2))   # 16  — MaxPool2d(2)
print(out_dim(32, 3, 2, 1))# 16  — strided conv same effect

# Modern CNNs (ResNet, ConvNeXt) prefer strided conv to MaxPool:
#   stride=2 in the conv learns its own downsampling
#   MaxPool is a fixed op — sometimes too lossy for small features
strided_conv = nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1)
maxpool      = nn.MaxPool2d(2)

# Global Average Pooling head — replaces flatten + huge Linear
class CNNHead(nn.Module):
    def __init__(self, c, n_classes):
        super().__init__()
        self.gap  = nn.AdaptiveAvgPool2d(1)
        self.head = nn.Linear(c, n_classes)
    def forward(self, x):
        return self.head(self.gap(x).flatten(1))

# Decision rule:
#   classic / small-data CNN          -> MaxPool2d(2) between conv blocks
#   modern ResNet-style               -> strided Conv2d, no separate pool
#   need fixed-size head from any HW  -> AdaptiveAvgPool2d(1) + Linear
#   detection / segmentation upsample -> avoid pooling — use stride + skip connections
#
# Anti-pattern: pooling on tiny feature maps
#   nn.MaxPool2d(2) on a 4x4 map -> 2x2; another pool -> 1x1 with no signal left.
#   Switch to AdaptiveAvgPool2d(1) once spatial dims are small.
```

## Decision Rule

```text
classic / small-data CNN          -> MaxPool2d(2) between conv blocks
modern ResNet-style               -> strided Conv2d, no separate pool
need fixed-size head from any HW  -> AdaptiveAvgPool2d(1) + Linear
detection / segmentation upsample -> avoid pooling — use stride + skip connections
```

## Anti-Pattern

> [!warning] Anti-pattern
> pooling on tiny feature maps
>   nn.MaxPool2d(2) on a 4x4 map -> 2x2; another pool -> 1x1 with no signal left.
>   Switch to AdaptiveAvgPool2d(1) once spatial dims are small.

## Tips

- MaxPool2d(2, 2) is standard: 2x2 kernel, stride 2
- Reduces computation and parameters in following layers
- No learnable parameters; purely spatial reduction

## Common Mistake

> [!warning] Using stride=kernel_size unnecessarily; stride < kernel_size is valid.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
import torch.nn as nn
x = torch.randn(1, 3, 8, 8)  # batch=1, channels=3, h=8, w=8
print(f"Input shape: {x.shape}")
```

**Senior:**
```python
print(f"After AvgPool2d(2):\n{avg_pooled[0, 0]}")
```

## See Also

- [[Sections/deeplearning/cnns-vision/_Index|Deep Learning → CNNs & Vision]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

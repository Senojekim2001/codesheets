---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "nn-conv2d"
title: "nn.Conv2d"
category: "Convolutional Layers"
subtitle: "Image processing with learned filters"
signature_short: "nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Conv2d"
  - "nn-conv2d"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/convolutional-layers"
  - "tier/tiered"
---

# nn.Conv2d

> Image processing with learned filters

## Overview

Applies 2D convolution with learnable kernels. Detects local patterns (edges, textures) via sliding window. Essential for image processing. Output size: (input - kernel_size + 2*padding) / stride + 1

## Signature

```python
nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - in_channels, out_channels, kernel_size.
#             padding=1 with kernel_size=3 keeps
#             spatial dims.
# STRENGTHS - the smallest possible 2D conv layer.
# WEAKNESSES- doesn't yet show stride / dilation /
#             groups or output-shape arithmetic.
#
import torch
import torch.nn as nn

conv = nn.Conv2d(3, 16, kernel_size=3, padding=1)
x = torch.randn(2, 3, 32, 32)                # (B, C, H, W)
y = conv(x)                                   # (2, 16, 32, 32)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Conv2d surface: stride
#             for downsampling, padding="same" for
#             stable spatial dims, AdaptiveAvgPool2d
#             at the end so any input size flows
#             into a fixed-size head.
# STRENGTHS - AdaptiveAvgPool2d((1,1)) is the modern
#             "fully convolutional + global pool"
#             pattern that handles variable input
#             sizes.
# WEAKNESSES- doesn't address depthwise / grouped
#             convolutions or ConvTranspose2d —
#             senior tier.
#
import torch.nn as nn

cnn = nn.Sequential(
    nn.Conv2d(3, 32, kernel_size=3, padding=1),
    nn.ReLU(inplace=True),
    nn.MaxPool2d(2),                         # halve spatial dims

    nn.Conv2d(32, 64, kernel_size=3, padding=1),
    nn.ReLU(inplace=True),
    nn.MaxPool2d(2),

    nn.Conv2d(64, 128, kernel_size=3, padding=1),
    nn.ReLU(inplace=True),

    nn.AdaptiveAvgPool2d((1, 1)),            # global avg pool
    nn.Flatten(),
    nn.Linear(128, 10),
)

# Output spatial dim formula:
# H_out = floor((H_in + 2*padding - kernel) / stride) + 1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production conv patterns: depthwise-
#             separable conv (efficient, MobileNet-
#             style); grouped convolutions (parallel
#             branches via groups=); ConvTranspose2d
#             for upsampling (with checkerboard
#             artifact warning); always pair conv
#             with BatchNorm and bias=False.
# STRENGTHS - depthwise-separable cuts parameters
#             ~10x; bias=False with BN is a real
#             memory + speed win; ConvTranspose
#             checkerboard is a real artifact source
#             — most modern architectures use
#             interpolation + conv instead.
# WEAKNESSES- depthwise-separable can underperform
#             standard conv at small scales; groups=
#             requires divisible channel counts;
#             upsampling alternatives (PixelShuffle,
#             interpolation) have their own tradeoffs.
#
import torch.nn as nn

# 1. Depthwise-separable conv (MobileNet-style)
class DSConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.depthwise = nn.Conv2d(in_ch, in_ch, kernel_size=3,
                                     padding=1, groups=in_ch,    # one filter per input channel
                                     bias=False)
        self.pointwise = nn.Conv2d(in_ch, out_ch, kernel_size=1, bias=False)
        self.bn = nn.BatchNorm2d(out_ch)
        self.act = nn.ReLU6(inplace=True)
    def forward(self, x):
        return self.act(self.bn(self.pointwise(self.depthwise(x))))

# 2. Conv + BN block — bias=False because BN absorbs it
def conv_bn(in_ch, out_ch):
    return nn.Sequential(
        nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
        nn.BatchNorm2d(out_ch),
        nn.ReLU(inplace=True),
    )

# 3. Upsampling — PREFER interpolate + conv over ConvTranspose2d
#    (avoids checkerboard artifacts)
upsample = nn.Sequential(
    nn.Upsample(scale_factor=2, mode="bilinear", align_corners=False),
    nn.Conv2d(in_ch, out_ch, 3, padding=1),
)

# Decision rule:
#   standard conv block               -> Conv2d + BatchNorm + ReLU (bias=False)
#   parameter-efficient                -> DepthwiseSeparable (groups=in_ch + 1x1)
#   parallel branches                   -> groups= > 1
#   upsampling                          -> Upsample(bilinear) + Conv2d
#
# Anti-pattern: leaving bias=True (default) on a Conv2d that is
# immediately followed by BatchNorm2d
#   BN re-centers the activations with its own learnable beta term, so
#   the conv bias is mathematically redundant — it just wastes a
#   parameter per output channel and a small allocation. Set bias=False
#   on every conv that feeds straight into a norm layer (BN/GN/LN). Only
#   keep bias=True on convs whose output goes directly into a non-norm
#   layer (e.g., the final 1x1 prediction head).
```

## Decision Rule

```text
standard conv block               -> Conv2d + BatchNorm + ReLU (bias=False)
parameter-efficient                -> DepthwiseSeparable (groups=in_ch + 1x1)
parallel branches                   -> groups= > 1
upsampling                          -> Upsample(bilinear) + Conv2d
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving bias=True (default) on a Conv2d that is
> immediately followed by BatchNorm2d
>   BN re-centers the activations with its own learnable beta term, so
>   the conv bias is mathematically redundant — it just wastes a
>   parameter per output channel and a small allocation. Set bias=False
>   on every conv that feeds straight into a norm layer (BN/GN/LN). Only
>   keep bias=True on convs whose output goes directly into a non-norm
>   layer (e.g., the final 1x1 prediction head).

## Tips

- padding=1 preserves spatial dimensions for 3x3 kernels
- Stride>1 reduces spatial dimensions (useful for downsampling)
- Weight shape: (out_channels, in_channels, kernel_h, kernel_w)
- When immediately followed by BatchNorm, set `bias=False` — the BN affine term subsumes the conv bias and saves a small allocation
- For parameter-efficient blocks use depthwise-separable convolutions (`groups=in_channels` followed by 1x1 conv) — MobileNet/EfficientNet pattern

## Common Mistake

> [!warning] Forgetting padding for early conv layers shrinks spatial dimensions too quickly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
import torch.nn as nn
conv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)
x = torch.randn(2, 3, 32, 32)  # 2 images, RGB, 32x32
```

**Senior:**
```python
print(f"CNN output: {output.shape}")
```

## See Also

- [[Sections/deeplearning/building-networks/_Index|Deep Learning → Building Networks]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

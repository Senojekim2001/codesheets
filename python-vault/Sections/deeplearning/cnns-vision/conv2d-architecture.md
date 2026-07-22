---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "conv2d-architecture"
title: "CNN Architecture"
category: "CNN Design"
subtitle: "Conv + Pool + Flatten pattern"
signature_short: "Conv2d → ReLU → MaxPool2d → ... → Flatten → Linear"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "CNN Architecture"
  - "conv2d-architecture"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/cnn-design"
  - "tier/tiered"
---

# CNN Architecture

> Conv + Pool + Flatten pattern

## Overview

Typical CNN: convolutional layers extract features, pooling reduces spatial dims, flatten converts to vector, fully connected layers classify. Spatial dimensions shrink with stride/pooling; channels increase with depth.

## Signature

```python
Conv2d → ReLU → MaxPool2d → ... → Flatten → Linear
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One conv block + linear head, the smallest valid CNN
# STRENGTHS - Shows the (conv -> activation -> pool) repeat unit
# WEAKNESSES- No batchnorm, no global pool, hard-coded flatten size
#
import torch
import torch.nn as nn

cnn = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1),  # (B, 3, 32, 32) -> (B, 16, 32, 32)
    nn.ReLU(),
    nn.MaxPool2d(2),                              # (B, 16, 16, 16)
    nn.Flatten(),
    nn.Linear(16 * 16 * 16, 10),
)

x = torch.randn(4, 3, 32, 32)
print(cnn(x).shape)   # torch.Size([4, 10])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two-block CNN with BatchNorm and AdaptiveAvgPool, written as nn.Module
# STRENGTHS - The 80%-case pattern: conv-bn-relu blocks, GAP for input-size flexibility
# WEAKNESSES- No residuals, no Dropout in head, no augmentation pairing
#
import torch
import torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2),                                     # 32 -> 16
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2),                                     # 16 -> 8
        )
        self.gap = nn.AdaptiveAvgPool2d(1)        # any HxW -> 1x1
        self.head = nn.Linear(64, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = self.gap(x).flatten(1)                # (B, 64, 1, 1) -> (B, 64)
        return self.head(x)

model = SmallCNN()
print(model(torch.randn(4, 3, 32, 32)).shape)    # torch.Size([4, 10])
print(sum(p.numel() for p in model.parameters()))  # parameter count
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production CNN: residual blocks, GAP head, channels-last memory layout
# STRENGTHS - Captures the modern conv-net design rules and shape arithmetic
# WEAKNESSES- Heavier; reach for once you've internalized the junior pattern
#
import torch
import torch.nn as nn
import torch.nn.functional as F

class ResBlock(nn.Module):
    def __init__(self, c_in, c_out, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(c_in, c_out, 3, stride=stride, padding=1, bias=False)
        self.bn1   = nn.BatchNorm2d(c_out)
        self.conv2 = nn.Conv2d(c_out, c_out, 3, padding=1, bias=False)
        self.bn2   = nn.BatchNorm2d(c_out)
        # 1x1 projection if shape changes — never identity over a shape mismatch
        self.proj = (nn.Sequential(nn.Conv2d(c_in, c_out, 1, stride=stride, bias=False),
                                   nn.BatchNorm2d(c_out))
                     if stride != 1 or c_in != c_out else nn.Identity())

    def forward(self, x):
        y = F.relu(self.bn1(self.conv1(x)), inplace=True)
        y = self.bn2(self.conv2(y))
        return F.relu(y + self.proj(x), inplace=True)

class ResNet8(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.stem  = nn.Sequential(nn.Conv2d(3, 32, 3, padding=1, bias=False),
                                   nn.BatchNorm2d(32), nn.ReLU(inplace=True))
        self.stage1 = ResBlock(32, 64, stride=2)
        self.stage2 = ResBlock(64, 128, stride=2)
        self.gap    = nn.AdaptiveAvgPool2d(1)
        self.head   = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.stage2(self.stage1(self.stem(x)))
        return self.head(self.gap(x).flatten(1))

model = ResNet8()

# Spatial arithmetic — memorize: out = floor((in + 2p - k)/s) + 1
#   3x3 / pad=1 / stride=1  -> same shape
#   3x3 / pad=1 / stride=2  -> halves H and W
#   1x1                     -> changes channels only

# Memory layout for GPU: channels-last gives ~30% speedup on Ampere+
model = model.to(memory_format=torch.channels_last)
x = torch.randn(8, 3, 32, 32).to(memory_format=torch.channels_last)
print(model(x).shape)

# Decision rule:
#   tiny dataset / quick baseline    -> SmallCNN above
#   ImageNet-scale or transfer-ready -> torchvision.models (ResNet, ConvNeXt)
#   need any-input-size head         -> AdaptiveAvgPool, NEVER hardcoded Flatten
#   fixed-input MLP head             -> Flatten + Linear is fine
#
# Anti-pattern: hardcoded view(-1, 64*8*8) in forward()
#   Breaks the moment input size changes. Use AdaptiveAvgPool2d(1) + flatten(1).
```

## Decision Rule

```text
tiny dataset / quick baseline    -> SmallCNN above
ImageNet-scale or transfer-ready -> torchvision.models (ResNet, ConvNeXt)
need any-input-size head         -> AdaptiveAvgPool, NEVER hardcoded Flatten
fixed-input MLP head             -> Flatten + Linear is fine
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoded view(-1, 64*8*8) in forward()
>   Breaks the moment input size changes. Use AdaptiveAvgPool2d(1) + flatten(1).

## Tips

- padding=1 preserves spatial dims for 3x3 kernels
- MaxPool2d(2) halves spatial dimensions
- AdaptiveAvgPool2d((1,1)) pools to single value regardless of input size
- Use `AdaptiveAvgPool2d(1)` + `flatten(1)` before the classifier head — hardcoded `view(-1, 64*8*8)` breaks the moment the input resolution changes

## Common Mistake

> [!warning] Not using padding in early layers causes spatial dimensions to shrink too fast.

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

- [[Sections/deeplearning/cnns-vision/_Index|Deep Learning → CNNs & Vision]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "nn-linear"
title: "nn.Linear"
category: "Layer Types"
subtitle: "Dense/affine transformation"
signature_short: "nn.Linear(in_features, out_features, bias=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Linear"
  - "nn-linear"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/layer-types"
  - "tier/tiered"
---

# nn.Linear

> Dense/affine transformation

## Overview

Applies linear transformation: y = xW^T + b. in_features is input dimension, out_features is output dimension. Contains learnable weight matrix and bias vector. Fundamental building block of neural networks.

## Signature

```python
nn.Linear(in_features, out_features, bias=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - y = xW^T + b. in_features and out_
#             features set the shape.
# STRENGTHS - one layer, the foundation of every
#             MLP.
# WEAKNESSES- doesn't yet show shape conventions
#             or no-bias use case.
#
import torch
import torch.nn as nn

linear = nn.Linear(10, 5)
x = torch.randn(32, 10)
y = linear(x)                                # (32, 5)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Linear surface: input
#             shape (B, in_features), bias=False
#             when followed by BatchNorm/LayerNorm,
#             stack into an MLP via Sequential.
# STRENGTHS - the bias=False rule with norm layers
#             is a real production optimization (the
#             norm zeros out the constant anyway).
# WEAKNESSES- doesn't address weight inspection
#             or custom init — senior tier.
#
import torch.nn as nn

# Stack into an MLP
mlp = nn.Sequential(
    nn.Linear(10, 128),
    nn.ReLU(),
    nn.Linear(128, 64),
    nn.ReLU(),
    nn.Linear(64, 5),
)

# bias=False when followed by a norm layer
# (norm absorbs the constant, bias is redundant)
block = nn.Sequential(
    nn.Linear(64, 64, bias=False),
    nn.LayerNorm(64),
    nn.ReLU(),
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production Linear: weight shape is
#             (out, in) — transposed from the math
#             expression; init schemes matter (Kaiming
#             for ReLU, Xavier for tanh, smaller for
#             output heads); LazyLinear when the
#             input shape is unknown until forward.
# STRENGTHS - the (out, in) shape rule prevents
#             confused matmul transposes; init choice
#             prevents dead ReLUs / vanishing
#             gradients; LazyLinear avoids
#             pre-computing flatten size in a CNN.
# WEAKNESSES- LazyLinear delays initialization
#             until first forward — breaks
#             state_dict loading patterns.
#
import torch
import torch.nn as nn

# Weight shape is (out_features, in_features) — transposed from y = xW
linear = nn.Linear(10, 5)
linear.weight.shape                          # (5, 10)
linear.bias.shape                            # (5,)

# Custom initialization
nn.init.kaiming_normal_(linear.weight, nonlinearity="relu")
nn.init.zeros_(linear.bias)

# LazyLinear — input shape inferred at first forward
class CNN(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.LazyLinear(128),                  # in_features inferred
            nn.ReLU(),
            nn.Linear(128, n_classes),
        )
    def forward(self, x):
        return self.head(self.features(x))

# Decision rule:
#   fixed input shape, simple MLP        -> nn.Linear(in, out)
#   followed by BatchNorm / LayerNorm     -> nn.Linear(in, out, bias=False)
#   input shape unknown until forward     -> nn.LazyLinear(out)
#   ReLU/GELU activation on output         -> kaiming_normal_ init
#   tanh / sigmoid activation              -> xavier_normal_ init
#   final classifier / regression head     -> small init (e.g. std=0.02)
#   need quantization later                 -> avoid LazyLinear (no shape)
#
# Anti-pattern: feeding a 3D/4D tensor straight into nn.Linear that
# was sized for the flat feature count (e.g. Linear(C*H*W, ...) on
# an unflattened CNN output)
#   nn.Linear broadcasts over leading dims, so it silently runs but
#   produces (B, C, H, out) with the wrong semantics — only the last
#   dim is contracted. Always insert nn.Flatten() (or .view(B, -1) /
#   einops.rearrange) before the head, or use LazyLinear so the
#   in_features is inferred from the actual flattened size.
```

## Decision Rule

```text
fixed input shape, simple MLP        -> nn.Linear(in, out)
followed by BatchNorm / LayerNorm     -> nn.Linear(in, out, bias=False)
input shape unknown until forward     -> nn.LazyLinear(out)
ReLU/GELU activation on output         -> kaiming_normal_ init
tanh / sigmoid activation              -> xavier_normal_ init
final classifier / regression head     -> small init (e.g. std=0.02)
need quantization later                 -> avoid LazyLinear (no shape)
```

## Anti-Pattern

> [!warning] Anti-pattern
> feeding a 3D/4D tensor straight into nn.Linear that
> was sized for the flat feature count (e.g. Linear(C*H*W, ...) on
> an unflattened CNN output)
>   nn.Linear broadcasts over leading dims, so it silently runs but
>   produces (B, C, H, out) with the wrong semantics — only the last
>   dim is contracted. Always insert nn.Flatten() (or .view(B, -1) /
>   einops.rearrange) before the head, or use LazyLinear so the
>   in_features is inferred from the actual flattened size.

## Tips

- Input shape: (batch_size, in_features), output: (batch_size, out_features)
- Weight transposed internally; weight.shape is (out_features, in_features)
- Use bias=False for specific architectures or to reduce parameters

## Common Mistake

> [!warning] Confusing Linear(10, 5) input expectation: needs (batch, 10) not (batch, 10, 1).

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

- [[Sections/deeplearning/building-networks/_Index|Deep Learning → Building Networks]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

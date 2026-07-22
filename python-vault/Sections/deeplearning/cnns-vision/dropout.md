---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "dropout"
title: "nn.Dropout"
category: "Regularization"
subtitle: "Prevent overfitting"
signature_short: "nn.Dropout(p=0.5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Dropout"
  - "dropout"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/regularization"
  - "tier/tiered"
---

# nn.Dropout

> Prevent overfitting

## Overview

Randomly zeros activations during training (probability p). Reduces co-adaptation of neurons. Disabled during evaluation. Simple but effective regularization. Often 0.5 for fully connected, 0.2-0.3 for conv.

## Signature

```python
nn.Dropout(p=0.5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Dropout layer between two Linears
# STRENGTHS - Smallest valid use of regularization in an MLP
# WEAKNESSES- Doesn't show the train/eval behavioral split
#
import torch
import torch.nn as nn

mlp = nn.Sequential(
    nn.Linear(100, 64),
    nn.ReLU(),
    nn.Dropout(0.5),       # zero half the activations during training
    nn.Linear(64, 10),
)

x = torch.randn(32, 100)
print(mlp(x).shape)        # torch.Size([32, 10])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Show the train vs eval difference Dropout creates
# STRENGTHS - Demonstrates why model.eval() is mandatory at inference
# WEAKNESSES- Doesn't cover spatial Dropout for conv layers
#
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(100, 200), nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(200, 100), nn.ReLU(),
    nn.Dropout(0.3),       # smaller p in deeper layers is common
    nn.Linear(100, 10),
)

x = torch.randn(32, 100)

model.train()
print("train: outputs differ?", not torch.allclose(model(x), model(x)))   # True

model.eval()
with torch.no_grad():
    print("eval:  outputs match?", torch.allclose(model(x), model(x)))    # True

# Inverted Dropout: PyTorch scales by 1/(1-p) at TRAIN time, so eval needs no scaling.
# That's why you don't multiply by anything when switching to eval.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Variant pickers and modern guidance
# STRENGTHS - Captures when Dropout helps, when it hurts, what to use instead
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn

# 1) Standard Dropout zeros INDEPENDENT activations — wrong for conv feature maps,
#    where neighboring pixels are correlated. Use Dropout2d to zero whole channels.
fc_dropout    = nn.Dropout(0.5)        # MLP / transformer feed-forward
conv_dropout  = nn.Dropout2d(0.2)      # zero entire channels for conv layers

# 2) Tuned defaults that work in production
DROPOUT_MLP_HIDDEN     = 0.5
DROPOUT_MLP_NEAR_OUT   = 0.2
DROPOUT_TRANSFORMER    = 0.1            # standard for attention + FFN
DROPOUT_CONV           = 0.0            # most modern CNNs skip it
DROPOUT_LAST_LINEAR    = 0.0            # never drop into the logits

# 3) BatchNorm + Dropout interaction — pick one.
#    BN already regularizes via batch-statistic noise. Stacking Dropout
#    after BN introduces variance that BN tries to remove on the next pass.
#    Modern CNN: BN only. Transformer / MLP without BN: Dropout.

# 4) Functional dropout for custom training loops (no Module needed)
import torch.nn.functional as F
def forward_with_runtime_p(x, p):
    return F.dropout(x, p=p, training=True)   # explicit flag — be careful

# Decision rule:
#   MLP / transformer FFN              -> nn.Dropout(0.1 - 0.5)
#   conv feature maps                  -> nn.Dropout2d (rare; usually unneeded)
#   model with BatchNorm everywhere    -> usually no Dropout
#   small dataset, big model           -> raise Dropout p before adding L2
#   right before the final Linear      -> p = 0 (don't corrupt logits)
#
# Anti-pattern: forgetting model.eval() at inference
#   Dropout stays active -> randomized predictions, looks like model is broken.
#   Always: model.eval() + torch.no_grad() (or @torch.inference_mode()).
```

## Decision Rule

```text
MLP / transformer FFN              -> nn.Dropout(0.1 - 0.5)
conv feature maps                  -> nn.Dropout2d (rare; usually unneeded)
model with BatchNorm everywhere    -> usually no Dropout
small dataset, big model           -> raise Dropout p before adding L2
right before the final Linear      -> p = 0 (don't corrupt logits)
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting model.eval() at inference
>   Dropout stays active -> randomized predictions, looks like model is broken.
>   Always: model.eval() + torch.no_grad() (or @torch.inference_mode()).

## Tips

- Typical p=0.5 for FC layers, p=0.2-0.3 for conv
- Always disable in eval mode (model.eval() handles this)
- Alternative: use weight decay (L2 regularization) instead of/with Dropout

## Common Mistake

> [!warning] Forgetting model.eval() before validation causes Dropout to remain active.

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

---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "transfer-learning"
title: "Transfer Learning"
category: "Pretrained Models"
subtitle: "Fine-tune or freeze backbone"
signature_short: "torchvision.models.resnet50(pretrained=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Transfer Learning"
  - "transfer-learning"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/pretrained-models"
  - "tier/tiered"
---

# Transfer Learning

> Fine-tune or freeze backbone

## Overview

Load pretrained model (ImageNet weights), replace classification head, fine-tune. Leverages learned features, reduces training time, improves performance on small datasets.

## Signature

```python
torchvision.models.resnet50(pretrained=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Load a pretrained ResNet, swap the head, classify
# STRENGTHS - The two-line transfer-learning shape: load + replace head
# WEAKNESSES- No freezing, no LR strategy, no modern weights API
#
import torch
import torch.nn as nn
from torchvision import models

model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)  # ImageNet pretrained
model.fc = nn.Linear(model.fc.in_features, 10)                    # 1000 -> 10 classes

x = torch.randn(2, 3, 224, 224)
print(model(x).shape)        # torch.Size([2, 10])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Freeze backbone, train head only — the small-dataset pattern
# STRENGTHS - Faster, less overfitting on tiny data, fewer params to tune
# WEAKNESSES- No discriminative LR; no plan for unfreezing later
#
import torch
import torch.nn as nn
from torchvision import models

weights = models.ResNet50_Weights.DEFAULT
model = models.resnet50(weights=weights)

# 1) Freeze all backbone params
for p in model.parameters():
    p.requires_grad = False

# 2) Replace head — new params start with requires_grad=True
model.fc = nn.Linear(model.fc.in_features, 10)

# 3) Optimize ONLY the trainable params
optim = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()),
                         lr=1e-3)

# 4) Use the exact preprocessing the weights were trained with
preprocess = weights.transforms()      # gives the right resize / normalize

# Quick check: how many params will actually update?
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total     = sum(p.numel() for p in model.parameters())
print(f"trainable: {trainable:,} / {total:,}")    # ~20K / ~25M
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Discriminative LRs, gradual unfreezing, modern weights API
# STRENGTHS - The pattern that wins on real datasets — head fast, body slow
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn
from torchvision import models

weights = models.ResNet50_Weights.IMAGENET1K_V2          # always pin a specific version
model = models.resnet50(weights=weights)
model.fc = nn.Linear(model.fc.in_features, 10)

# 1) Discriminative learning rates — small for early layers, large for the head.
#    Early conv layers learn generic edges; don't disturb them much.
def param_groups(model, head_lr, body_lr):
    head_params, body_params = [], []
    for name, p in model.named_parameters():
        (head_params if name.startswith("fc.") else body_params).append(p)
    return [
        {"params": body_params, "lr": body_lr},
        {"params": head_params, "lr": head_lr},
    ]

optim = torch.optim.AdamW(param_groups(model, head_lr=1e-3, body_lr=1e-5),
                          weight_decay=1e-2)

# 2) Two-phase fine-tuning:
#    Phase A — freeze body, train head only for a few epochs (warm up the head)
for n, p in model.named_parameters():
    p.requires_grad = n.startswith("fc.")
# ... train a few epochs on the head only ...

#    Phase B — unfreeze everything, continue with discriminative LRs above
for p in model.parameters():
    p.requires_grad = True

# 3) Always reuse the original preprocessing pipeline
preprocess = weights.transforms()                # avoids stat-mismatch headaches

# Decision rule:
#   tiny dataset (< 1k images)         -> freeze body, train head only
#   medium dataset, similar domain     -> discriminative LRs, body 10-100x slower
#   large dataset, different domain    -> full fine-tune, normal LR
#   need <1ms inference                -> mobilenet_v3 / efficientnet, not resnet50
#
# Anti-pattern: pretrained=True with full unfreeze and LR 1e-3
#   Catastrophically forgets ImageNet features in one epoch. Either freeze, or
#   use a much smaller LR (1e-4 to 1e-5) on the body.
```

## Decision Rule

```text
tiny dataset (< 1k images)         -> freeze body, train head only
medium dataset, similar domain     -> discriminative LRs, body 10-100x slower
large dataset, different domain    -> full fine-tune, normal LR
need <1ms inference                -> mobilenet_v3 / efficientnet, not resnet50
```

## Anti-Pattern

> [!warning] Anti-pattern
> pretrained=True with full unfreeze and LR 1e-3
>   Catastrophically forgets ImageNet features in one epoch. Either freeze, or
>   use a much smaller LR (1e-4 to 1e-5) on the body.

## Tips

- Use lower learning rate (0.0001 vs 0.001) when fine-tuning
- Freeze backbone for small datasets, fine-tune for large datasets
- Always use ImageNet normalization when loading ImageNet pretrained
- For medium datasets in a similar domain, use discriminative learning rates — set the backbone parameter group 10-100x slower than the new head; full unfreeze + 1e-3 LR catastrophically forgets ImageNet features in one epoch

## Common Mistake

> [!warning] Using high learning rate when fine-tuning pretrained model overwrites learned features.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/deeplearning/cnns-vision/_Index|Deep Learning → CNNs & Vision]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

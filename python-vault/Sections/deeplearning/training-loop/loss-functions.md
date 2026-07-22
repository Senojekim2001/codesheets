---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "loss-functions"
title: "Loss Functions"
category: "Loss Computation"
subtitle: "Measure model error"
signature_short: "nn.CrossEntropyLoss() | nn.MSELoss() | nn.BCELoss()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Loss Functions"
  - "loss-functions"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/loss-computation"
  - "tier/tiered"
---

# Loss Functions

> Measure model error

## Overview

Loss functions quantify prediction error. CrossEntropyLoss for multi-class classification, MSELoss for regression, BCELoss for binary classification. Output of network fed to loss function for training.

## Signature

```python
nn.CrossEntropyLoss() | nn.MSELoss() | nn.BCELoss()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - pick by task: CrossEntropyLoss for
#             multiclass, MSELoss for regression,
#             BCEWithLogitsLoss for binary.
# STRENGTHS - the three losses cover ~90% of tasks.
# WEAKNESSES- doesn't yet show class weighting or
#             label smoothing.
#
import torch.nn as nn
nn.CrossEntropyLoss()                        # multiclass: raw logits
nn.MSELoss()                                  # regression
nn.BCEWithLogitsLoss()                        # binary / multilabel
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday loss surface:
#             CrossEntropy expects RAW LOGITS +
#             integer class indices (NOT one-hot);
#             BCEWithLogits takes raw logits + float
#             targets; class weights for imbalance,
#             ignore_index for padding.
# STRENGTHS - the "raw logits" rule prevents the
#             #1 loss bug (double-applied softmax).
# WEAKNESSES- doesn't address focal loss / label
#             smoothing / multi-task — senior tier.
#
import torch
import torch.nn as nn

# Multiclass — raw logits, integer targets (not one-hot)
ce = nn.CrossEntropyLoss(
    weight=torch.tensor([1.0, 2.0, 1.0]),    # per-class (imbalance)
    ignore_index=-100,                        # NLP padding
)

# Binary / multilabel — raw logits, float targets
bce = nn.BCEWithLogitsLoss(
    pos_weight=torch.tensor([5.0]),          # weight on positive class
)

# Regression
nn.MSELoss()
nn.L1Loss()                                   # robust to outliers
nn.SmoothL1Loss()                             # Huber-style
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production losses: label_smoothing
#             (CE) for calibration; focal loss for
#             severe imbalance; combined multi-task
#             losses with explicit weights;
#             reduction="none" for per-sample
#             manipulation.
# STRENGTHS - label smoothing is the standard
#             classifier upgrade; focal is the
#             default for object detection;
#             reduction="none" unlocks weighted
#             losses.
# WEAKNESSES- label smoothing reduces top-1
#             slightly; focal sensitive to gamma;
#             custom losses need testing.
#
import torch
import torch.nn as nn
import torch.nn.functional as F

# Label smoothing — standard prod default for classifiers
ce_ls = nn.CrossEntropyLoss(label_smoothing=0.1)

# Focal loss — severe imbalance / object detection
class FocalLoss(nn.Module):
    def __init__(self, alpha=0.25, gamma=2.0):
        super().__init__()
        self.alpha, self.gamma = alpha, gamma
    def forward(self, logits, targets):
        ce = F.cross_entropy(logits, targets, reduction="none")
        p_t = torch.exp(-ce)
        return (self.alpha * (1 - p_t) ** self.gamma * ce).mean()

# Multi-task — combine cls + regression with weights
class CombinedLoss(nn.Module):
    def __init__(self, cls_w=1.0, reg_w=0.5):
        super().__init__()
        self.cls = nn.CrossEntropyLoss()
        self.reg = nn.SmoothL1Loss()
        self.cw, self.rw = cls_w, reg_w
    def forward(self, cls_l, cls_t, reg_p, reg_t):
        return self.cw * self.cls(cls_l, cls_t) + self.rw * self.reg(reg_p, reg_t)

# Decision rule:
#   multiclass classification           -> CE (label_smoothing=0.1 in prod)
#   imbalanced multiclass                -> CE(weight=) or Focal
#   binary / multilabel                   -> BCEWithLogitsLoss(pos_weight=)
#   regression, normal noise              -> MSELoss
#   regression, outliers                   -> SmoothL1Loss / L1Loss
#   sequence with padding                  -> CE(ignore_index=PAD_ID)
#
# Anti-pattern: passing one-hot encoded targets to nn.CrossEntropyLoss
# instead of integer class indices
#   CE in modern PyTorch accepts class indices of shape (B,) (long
#   dtype) — feeding (B, C) one-hot floats either errors or silently
#   computes a soft-label loss with completely different magnitude.
#   Symptom: loss starts at log(C) but plateaus much higher than
#   expected. Use targets = torch.argmax(one_hot, dim=-1) once at the
#   data-loading step, or pass float soft-labels intentionally for
#   distillation (and document it).
```

## Decision Rule

```text
multiclass classification           -> CE (label_smoothing=0.1 in prod)
imbalanced multiclass                -> CE(weight=) or Focal
binary / multilabel                   -> BCEWithLogitsLoss(pos_weight=)
regression, normal noise              -> MSELoss
regression, outliers                   -> SmoothL1Loss / L1Loss
sequence with padding                  -> CE(ignore_index=PAD_ID)
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing one-hot encoded targets to nn.CrossEntropyLoss
> instead of integer class indices
>   CE in modern PyTorch accepts class indices of shape (B,) (long
>   dtype) — feeding (B, C) one-hot floats either errors or silently
>   computes a soft-label loss with completely different magnitude.
>   Symptom: loss starts at log(C) but plateaus much higher than
>   expected. Use targets = torch.argmax(one_hot, dim=-1) once at the
>   data-loading step, or pass float soft-labels intentionally for
>   distillation (and document it).

## Tips

- CrossEntropyLoss includes Softmax; don't apply Softmax before
- MSELoss for continuous outputs, CrossEntropyLoss for classification
- BCEWithLogitsLoss combines Sigmoid + BCE for numerical stability
- Production multiclass: pass `label_smoothing=0.1` to CE; for class imbalance use `weight=` or Focal loss
- Sequence models with PAD tokens: `CE(ignore_index=PAD_ID)` so padded positions do not contribute to the loss
- Regression with outliers: `SmoothL1Loss` (Huber) or `L1Loss` is more robust than MSE

## Common Mistake

> [!warning] Applying Softmax before CrossEntropyLoss double-applies it, breaking training.

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

- [[Sections/deeplearning/training-loop/_Index|Deep Learning → Training Loop]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "model-train-eval"
title: "model.train() vs model.eval()"
category: "Model Modes"
subtitle: "Different behavior for training/testing"
signature_short: "model.train() | model.eval()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "model.train() vs model.eval()"
  - "model-train-eval"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/model-modes"
  - "tier/tiered"
---

# model.train() vs model.eval()

> Different behavior for training/testing

## Overview

Training mode: Dropout active, BatchNorm uses running stats. Eval mode: Dropout inactive, BatchNorm uses accumulated stats. Critical for correct validation/test evaluation.

## Signature

```python
model.train() | model.eval()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Toggle the two modes and see they exist
# STRENGTHS - Smallest mental model: train = learning, eval = inference
# WEAKNESSES- Doesn't yet show what visibly changes between modes
#
import torch.nn as nn

model = nn.Linear(10, 2)

model.train()                # default state after construction
print("training:", model.training)   # True

model.eval()                 # call before validation / inference
print("training:", model.training)   # False
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Show observable difference: Dropout output changes between modes
# STRENGTHS - Demonstrates WHY eval() matters with the layers most affected
# WEAKNESSES- Doesn't cover BatchNorm running stats vs batch stats subtleties
#
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(20, 64),
    nn.BatchNorm1d(64),
    nn.ReLU(),
    nn.Dropout(0.5),       # randomness only in train()
    nn.Linear(64, 10),
)
x = torch.randn(32, 20)

model.train()
out1, out2 = model(x), model(x)
print("train: different runs?", not torch.allclose(out1, out2))   # True

model.eval()
with torch.no_grad():
    out1, out2 = model(x), model(x)
print("eval:  different runs?", not torch.allclose(out1, out2))   # False

# Note: model.eval() ≠ torch.no_grad(). eval() flips layer behavior;
# no_grad() disables autograd. You almost always want both for inference.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production rules: eval-leaky layers, BN running stats, tiny eval batches
# STRENGTHS - Surfaces the failure modes that silently corrupt validation metrics
# WEAKNESSES- N/A — this is the level you live at once you ship
#
import torch
import torch.nn as nn

# 1) Layers that change behavior with .train()/.eval()
LEAKY = (nn.Dropout, nn.Dropout1d, nn.Dropout2d, nn.Dropout3d,
         nn.BatchNorm1d, nn.BatchNorm2d, nn.BatchNorm3d,
         nn.SyncBatchNorm, nn.InstanceNorm1d, nn.InstanceNorm2d)

def audit_modes(model):
    return [(n, type(m).__name__, m.training)
            for n, m in model.named_modules() if isinstance(m, LEAKY)]

# 2) BatchNorm running-stats trap.
#    eval() uses running_mean/running_var accumulated during training.
#    If you fine-tune with tiny batches and forget to set BN to eval(),
#    its running stats drift from the original distribution.
def freeze_bn(model):
    for m in model.modules():
        if isinstance(m, (nn.BatchNorm1d, nn.BatchNorm2d, nn.BatchNorm3d)):
            m.eval()                          # use frozen running stats
            for p in m.parameters():
                p.requires_grad = False       # freeze gamma/beta too

# 3) Inference idiom: eval() + no_grad() (or inference_mode for speed)
@torch.inference_mode()                       # stronger than no_grad
def predict(model, x):
    was_training = model.training
    model.eval()
    try:
        return model(x)
    finally:
        if was_training:
            model.train()                     # restore prior mode

# Decision rule:
#   any validation / test pass        -> model.eval() + torch.no_grad()
#   single-sample API inference       -> @torch.inference_mode()
#   fine-tuning a pretrained backbone -> freeze BN with .eval() per module
#   batch size 1 with BatchNorm       -> switch to GroupNorm or LayerNorm
#
# Anti-pattern: validating in train() mode
#   Dropout still drops -> noisier metrics that look worse than the model is.
#   Same trap with BatchNorm: a 1-sample batch in train() divides by zero variance.
```

## Decision Rule

```text
any validation / test pass        -> model.eval() + torch.no_grad()
single-sample API inference       -> @torch.inference_mode()
fine-tuning a pretrained backbone -> freeze BN with .eval() per module
batch size 1 with BatchNorm       -> switch to GroupNorm or LayerNorm
```

## Anti-Pattern

> [!warning] Anti-pattern
> validating in train() mode
>   Dropout still drops -> noisier metrics that look worse than the model is.
>   Same trap with BatchNorm: a 1-sample batch in train() divides by zero variance.

## Tips

- Always call model.eval() before validation/testing
- Dropout disabled in eval; BatchNorm uses running stats
- Forgetting eval() causes valid metrics to look worse than actual

## Common Mistake

> [!warning] Running validation with model.train() applies Dropout, causing metrics to be noisy.

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

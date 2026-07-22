---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "optimizers"
title: "Optimizers (SGD, Adam)"
category: "Optimization"
subtitle: "SGD, Adam, AdamW, RMSprop"
signature_short: "optim.SGD(params, lr) | optim.Adam(params, lr) | optim.AdamW(params, lr)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Optimizers (SGD, Adam)"
  - "optimizers"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/optimization"
  - "tier/tiered"
---

# Optimizers (SGD, Adam)

> SGD, Adam, AdamW, RMSprop

## Overview

Optimizers update model parameters using gradients. SGD: simple stochastic gradient descent. Adam: adaptive learning rates (momentum + RMSprop). Learning rate controls step size of updates.

## Signature

```python
optim.SGD(params, lr) | optim.Adam(params, lr) | optim.AdamW(params, lr)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Adam at lr=1e-3 is the safe default.
#             Loop: zero -> forward -> backward ->
#             step.
# STRENGTHS - the 80% case: Adam with default lr.
# WEAKNESSES- doesn't yet show AdamW (proper weight
#             decay) or LR schedulers.
#
import torch.optim as optim

opt = optim.Adam(model.parameters(), lr=1e-3)
opt.zero_grad()
loss.backward()
opt.step()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - AdamW for weight decay (proper
#             decoupled L2); SGD+momentum for image
#             models; learning-rate scheduler in
#             addition to the optimizer; per-param-
#             group lr (e.g. lower lr for backbone,
#             higher for head).
# STRENGTHS - AdamW > Adam for any model that needs
#             regularization; per-param-group lr is
#             essential for fine-tuning.
# WEAKNESSES- doesn't address gradient clipping or
#             warmup — senior tier.
#
import torch.optim as optim

# AdamW — DECOUPLED weight decay (preferred over Adam)
opt = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)

# SGD with momentum — still strong for image models
opt = optim.SGD(model.parameters(), lr=0.1, momentum=0.9,
                 weight_decay=1e-4, nesterov=True)

# Per-param-group lr (fine-tuning)
opt = optim.AdamW([
    {"params": model.backbone.parameters(), "lr": 1e-5},   # frozen-ish
    {"params": model.head.parameters(),     "lr": 1e-3},   # fresh
], weight_decay=1e-2)

# LR scheduling
sched = optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
for epoch in range(epochs):
    train_one_epoch(model, opt)
    sched.step()                              # step AFTER each epoch
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production training: warmup+cosine LR
#             schedule (the modern transformer
#             default); OneCycleLR for fast
#             convergence; AdamW for transformers
#             and most modern arch; gradient
#             accumulation for effective batch
#             scaling.
# STRENGTHS - warmup prevents early-training
#             instability; cosine is the empirically
#             best schedule shape; OneCycle is the
#             "fast.ai" recipe.
# WEAKNESSES- warmup tuning adds another
#             hyperparameter; OneCycle expects
#             total_steps known in advance.
#
import torch
import torch.optim as optim
from torch.optim.lr_scheduler import (
    LambdaLR, CosineAnnealingLR, OneCycleLR)

opt = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)

# Warmup + cosine (transformer default)
total_steps = epochs * len(train_loader)
warmup_steps = total_steps // 10

def lr_lambda(step):
    if step < warmup_steps:
        return step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return 0.5 * (1 + math.cos(math.pi * progress))

sched = LambdaLR(opt, lr_lambda)
# Step the scheduler EVERY BATCH (not every epoch) for warmup

# Decision rule:
#   transformer / NLP / modern arch       -> AdamW (lr ~1e-3 to 1e-4)
#   image models from scratch              -> SGD + momentum (lr ~0.1)
#   fine-tuning                            -> AdamW with per-group lr
#   fast convergence                        -> OneCycleLR
#   transformer training                    -> warmup + cosine schedule
#   training unstable                       -> add gradient clipping + warmup
#
# Anti-pattern: using optim.Adam with a non-zero weight_decay and
# expecting L2 regularization
#   In Adam, weight_decay is folded INTO the gradient before the
#   adaptive scaling, so its effective strength depends on the
#   gradient's running variance — large parameters with small
#   gradients are barely regularized. Use optim.AdamW (decoupled weight
#   decay applied after the adaptive update) for any model where
#   regularization matters: transformers, large MLPs, fine-tuning.
#   Same lr and weight_decay numbers, very different generalization.
```

## Decision Rule

```text
transformer / NLP / modern arch       -> AdamW (lr ~1e-3 to 1e-4)
image models from scratch              -> SGD + momentum (lr ~0.1)
fine-tuning                            -> AdamW with per-group lr
fast convergence                        -> OneCycleLR
transformer training                    -> warmup + cosine schedule
training unstable                       -> add gradient clipping + warmup
```

## Anti-Pattern

> [!warning] Anti-pattern
> using optim.Adam with a non-zero weight_decay and
> expecting L2 regularization
>   In Adam, weight_decay is folded INTO the gradient before the
>   adaptive scaling, so its effective strength depends on the
>   gradient's running variance — large parameters with small
>   gradients are barely regularized. Use optim.AdamW (decoupled weight
>   decay applied after the adaptive update) for any model where
>   regularization matters: transformers, large MLPs, fine-tuning.
>   Same lr and weight_decay numbers, very different generalization.

## Tips

- Adam best for most deep learning tasks; SGD with momentum for vision
- Lower learning rate (0.001-0.0001) for Adam, higher (0.01-0.1) for SGD
- Always zero_grad() before backward() to avoid accumulation
- For transformers / NLP / modern architectures use `AdamW` (decoupled weight decay) over Adam
- For one-shot fast convergence wrap with `OneCycleLR`; for transformer training use a warmup + cosine schedule and add gradient clipping if loss spikes

## Common Mistake

> [!warning] Using same learning rate for SGD and Adam causes poor convergence.

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

- [[Sections/deeplearning/training-loop/_Index|Deep Learning → Training Loop]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

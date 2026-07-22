---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "gradient-zeroing"
title: "zero_grad()"
category: "Training Setup"
subtitle: "Reset gradients before backprop"
signature_short: "optimizer.zero_grad() | tensor.grad.zero_()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "zero_grad()"
  - "gradient-zeroing"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/training-setup"
  - "tier/tiered"
---

# zero_grad()

> Reset gradients before backprop

## Overview

PyTorch accumulates gradients by default. Must zero gradients at start of each training step to avoid accumulation. Essential in training loops before backward() calls.

## Signature

```python
optimizer.zero_grad() | tensor.grad.zero_()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - call zero_grad before each backward.
#             Otherwise gradients accumulate.
# STRENGTHS - the canonical training-loop reflex.
# WEAKNESSES- doesn't yet show set_to_none=True or
#             gradient accumulation patterns.
#
optimizer.zero_grad()
loss.backward()
optimizer.step()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the canonical loop order: zero ->
#             forward -> backward -> step. Use
#             set_to_none=True (default in 1.7+) for
#             a small speedup.
# STRENGTHS - the four-step rhythm prevents the most
#             common training bug (forgotten
#             zero_grad).
# WEAKNESSES- doesn't address gradient accumulation
#             (which is INTENTIONAL skipping of
#             zero_grad) — senior tier.
#
import torch
import torch.optim as optim

model = torch.nn.Linear(5, 1)
optimizer = optim.SGD(model.parameters(), lr=0.01)

for x, y in dataloader:
    optimizer.zero_grad(set_to_none=True)        # 0.zero
    pred = model(x)                              # 1.forward
    loss = criterion(pred, y)
    loss.backward()                              # 2.backward
    optimizer.step()                             # 3.step
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production gradient management:
#             gradient accumulation (skip zero_grad
#             across N micro-batches to simulate a
#             larger batch); gradient clipping before
#             optimizer.step (prevents exploding
#             gradients in RNNs/transformers); set_to_
#             none=True saves a kernel launch per
#             param.
# STRENGTHS - accumulation lets you train with a
#             bigger effective batch on small GPUs;
#             clipping is the standard defense against
#             unstable training.
# WEAKNESSES- accumulation requires scaling the loss
#             by 1/accum_steps; clipping changes the
#             effective learning rate (tune lr after
#             enabling).
#
import torch
import torch.nn.utils as utils

ACCUM_STEPS = 4
optimizer.zero_grad(set_to_none=True)

for i, (x, y) in enumerate(dataloader):
    pred = model(x)
    loss = criterion(pred, y) / ACCUM_STEPS         # scale for accumulation
    loss.backward()                                  # accumulates

    if (i + 1) % ACCUM_STEPS == 0:
        # Clip BEFORE step — prevents exploding gradients
        utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)        # zero only every N steps

# Decision rule:
#   default training                       -> zero_grad every step
#   GPU memory-constrained, want big batch  -> gradient accumulation
#   training unstable / RNN / transformer    -> add clip_grad_norm_
#   never                                    -> forget zero_grad without intent
#
# Anti-pattern: clipping gradients AFTER optimizer.step() instead of before
#   utils.clip_grad_norm_ mutates .grad in place, so calling it after
#   step() does nothing for the update that just happened — the spike
#   already moved the weights. Always order: backward() -> clip ->
#   step() -> zero_grad(). Same trap with gradient accumulation:
#   clip after the LAST micro-batch backward, before the step.
```

## Decision Rule

```text
default training                       -> zero_grad every step
GPU memory-constrained, want big batch  -> gradient accumulation
training unstable / RNN / transformer    -> add clip_grad_norm_
never                                    -> forget zero_grad without intent
```

## Anti-Pattern

> [!warning] Anti-pattern
> clipping gradients AFTER optimizer.step() instead of before
>   utils.clip_grad_norm_ mutates .grad in place, so calling it after
>   step() does nothing for the update that just happened — the spike
>   already moved the weights. Always order: backward() -> clip ->
>   step() -> zero_grad(). Same trap with gradient accumulation:
>   clip after the LAST micro-batch backward, before the step.

## Tips

- Always zero_grad() at start of loop: zero → forward → backward
- Alternatively: gradient accumulation is intentional for multi-batch updates
- Manual grad zeroing: tensor.grad.zero_() (in-place)
- When training is unstable (RNNs, transformers, large LR) add `torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)` between `backward()` and `optimizer.step()`

## Common Mistake

> [!warning] Forgetting zero_grad() in training loop causes gradients to accumulate, breaking learning.

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

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

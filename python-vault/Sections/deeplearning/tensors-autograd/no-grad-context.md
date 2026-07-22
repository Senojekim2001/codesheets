---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "no-grad-context"
title: "torch.no_grad()"
category: "Inference"
subtitle: "Speed up inference, save memory"
signature_short: "with torch.no_grad(): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "torch.no_grad()"
  - "no-grad-context"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/inference"
  - "tier/tiered"
---

# torch.no_grad()

> Speed up inference, save memory

## Overview

Context manager that disables autograd during inference or validation. Reduces memory usage and speeds up computation since gradients are not tracked. Use in validation/test loops.

## Signature

```python
with torch.no_grad(): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - wrap inference in torch.no_grad() to
#             skip the autograd graph.
# STRENGTHS - faster, less memory, mandatory for
#             eval/test loops.
# WEAKNESSES- doesn't yet contrast with
#             inference_mode() or @torch.no_grad
#             decorator.
#
import torch
with torch.no_grad():
    preds = model(x)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday eval pattern: model.eval()
#             switches Dropout/BatchNorm to inference
#             mode; torch.no_grad() skips graph
#             building. Both are needed.
# STRENGTHS - the "eval + no_grad" pair is
#             non-negotiable for validation.
# WEAKNESSES- doesn't address inference_mode (newer,
#             slightly faster) or context-vs-decorator
#             — senior tier.
#
import torch

# Validation loop pattern
model.eval()                                 # Dropout/BN to inference
with torch.no_grad():                        # no autograd graph
    total_loss, n = 0.0, 0
    for x, y in val_loader:
        x, y = x.to(device), y.to(device)
        pred = model(x)
        total_loss += criterion(pred, y).item() * len(y)
        n += len(y)
val_loss = total_loss / n

model.train()                                # back to training mode
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production inference: prefer
#             torch.inference_mode() over no_grad()
#             (faster, drops version counter); use
#             @torch.inference_mode() decorator on
#             prediction functions; remember
#             model.eval() and model.train() bracket
#             every validation pass.
# STRENGTHS - inference_mode is the modern default
#             (PyTorch 1.9+); decorator form keeps
#             prediction functions clean; the eval/
#             train bracket prevents leaking inference
#             mode into next training step.
# WEAKNESSES- inference_mode tensors can't be used
#             in autograd later (need .clone()); easy
#             to forget model.train() after a call.
#
import torch

@torch.inference_mode()                       # decorator — cleaner than with-block
def predict(model, x):
    model.eval()
    return model(x)

# Validation pass — explicit bracket
def validate(model, loader, criterion, device):
    model.eval()
    total = 0.0
    with torch.inference_mode():              # faster than no_grad
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            pred = model(x)
            total += criterion(pred, y).item() * len(y)
    model.train()                              # restore for next epoch
    return total / len(loader.dataset)

# Decision rule:
#   PyTorch 1.9+, simple inference        -> torch.inference_mode()
#   need to use the output in autograd     -> torch.no_grad() + .clone()
#   prediction function as an API           -> @torch.inference_mode() decorator
#   never                                    -> validation without model.eval()
#
# Anti-pattern: using torch.no_grad() but forgetting model.eval()
# (or vice versa)
#   no_grad only stops graph building; Dropout still drops, BatchNorm
#   still updates running stats from the validation batch — your val
#   loss looks noisy and your BN stats drift. Both are mandatory:
#   model.eval() switches layer modes, no_grad / inference_mode skips
#   the graph. Restore model.train() before the next training epoch.
```

## Decision Rule

```text
PyTorch 1.9+, simple inference        -> torch.inference_mode()
need to use the output in autograd     -> torch.no_grad() + .clone()
prediction function as an API           -> @torch.inference_mode() decorator
never                                    -> validation without model.eval()
```

## Anti-Pattern

> [!warning] Anti-pattern
> using torch.no_grad() but forgetting model.eval()
> (or vice versa)
>   no_grad only stops graph building; Dropout still drops, BatchNorm
>   still updates running stats from the validation batch — your val
>   loss looks noisy and your BN stats drift. Both are mandatory:
>   model.eval() switches layer modes, no_grad / inference_mode skips
>   the graph. Restore model.train() before the next training epoch.

## Tips

- Always use no_grad() in validation/test loops to save memory
- Also saves computation time since gradient graph not maintained
- Use torch.enable_grad() to force gradients inside no_grad context
- On PyTorch 1.9+, prefer `torch.inference_mode()` over `no_grad()` — it is stricter (returned tensors cannot be used in autograd) and slightly faster; use the `@torch.inference_mode()` decorator for prediction APIs

## Common Mistake

> [!warning] Computing validation loss inside training loop without no_grad() wastes memory and slows training.

## Shorthand (Junior → Senior)

**Junior:**
```python
import torch
import torch.nn as nn
model = nn.Linear(10, 1)
x = torch.randn(100, 10)
```

**Senior:**
```python
print(f"With grad: {time_with_grad:.4f}s, Without grad: {time_no_grad:.4f}s")
```

## See Also

- [[Sections/deeplearning/tensors-autograd/_Index|Deep Learning → Tensors & Autograd]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "activation-functions"
title: "Activation Functions"
category: "Activations"
subtitle: "ReLU, Sigmoid, Tanh, Softmax"
signature_short: "nn.ReLU() | nn.Sigmoid() | nn.Tanh() | F.softmax()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Activation Functions"
  - "activation-functions"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/activations"
  - "tier/tiered"
---

# Activation Functions

> ReLU, Sigmoid, Tanh, Softmax

## Overview

Activation functions introduce non-linearity, enabling networks to learn complex patterns. ReLU most common in hidden layers, Sigmoid/Tanh for bounded outputs, Softmax for multi-class probabilities.

## Signature

```python
nn.ReLU() | nn.Sigmoid() | nn.Tanh() | F.softmax()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ReLU on hidden layers. That's the
#             default and almost always right.
# STRENGTHS - one rule covers most networks.
# WEAKNESSES- doesn't yet show modern alternatives
#             (GELU/SiLU) or output-layer choices.
#
import torch.nn as nn
nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 5),
)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday choice: ReLU for hidden
#             layers, Sigmoid for binary output,
#             Tanh for bounded [-1, 1], Softmax for
#             multiclass — but DON'T explicitly add
#             Softmax before CrossEntropyLoss (it's
#             included).
# STRENGTHS - the "no Softmax before CrossEntropy"
#             rule is the single most common
#             beginner bug.
# WEAKNESSES- doesn't address GELU / SiLU /
#             LeakyReLU / inplace= — senior tier.
#
import torch.nn as nn

# Hidden layers — ReLU (cheap, effective)
nn.ReLU()

# Output layers — depends on the task
nn.Sigmoid()                                 # binary {0, 1}
nn.Tanh()                                    # bounded [-1, 1]
# For multiclass: leave logits raw, let CrossEntropyLoss apply log-softmax

# Classification model — NO explicit Softmax in the model
classifier = nn.Sequential(
    nn.Linear(10, 64), nn.ReLU(),
    nn.Linear(64, 5),                        # raw logits — DO NOT add Softmax
)
loss_fn = nn.CrossEntropyLoss()              # applies log-softmax internally
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production activations: GELU or SiLU
#             (Swish) for transformers / modern
#             architectures; LeakyReLU when ReLU
#             dies; inplace=True for memory savings;
#             only apply final activation when the
#             LOSS doesn't already include it.
# STRENGTHS - GELU/SiLU is the modern default in
#             transformers; inplace=True saves a
#             buffer; the loss-pairing rule prevents
#             double-applied softmax.
# WEAKNESSES- inplace=True breaks autograd if the
#             input is needed elsewhere; LeakyReLU
#             rarely beats ReLU for image models.
#
import torch.nn as nn

# Modern hidden activations (transformers / diffusion)
nn.GELU()                                    # transformer default
nn.SiLU()                                    # aka Swish; common in Stable Diffusion

# When ReLU dies (gradient stuck at 0)
nn.LeakyReLU(0.01)                            # small negative slope
nn.ELU()                                     # exponential, smooth

# In-place — saves activation memory
nn.ReLU(inplace=True)                         # x is overwritten in place

# Loss-pairing rule (DO NOT double-apply):
# Model returns LOGITS                  loss
# - raw logits                           CrossEntropyLoss (multiclass)
# - raw logits                           BCEWithLogitsLoss (binary, multilabel)
# - sigmoid output                       BCELoss (only if you really need probs)
# - log-softmax output                   NLLLoss

# Decision rule:
#   hidden default                  -> nn.ReLU
#   transformer / modern arch        -> nn.GELU or nn.SiLU
#   ReLU dying                       -> nn.LeakyReLU
#   binary classifier output         -> raw logits + BCEWithLogitsLoss
#   multiclass output                 -> raw logits + CrossEntropyLoss
#   probability needed in production  -> apply sigmoid/softmax AFTER predict
#
# Anti-pattern: appending nn.Softmax (or nn.Sigmoid) as the model's
# final layer and then training with nn.CrossEntropyLoss
# (or nn.BCELoss)
#   CE/BCE-with-logits already include log-softmax / log-sigmoid
#   internally for numerical stability; doing it twice flattens
#   gradients (log of probabilities saturating near 0/1) and training
#   either crawls or NaNs. Output RAW LOGITS from the model and let
#   CrossEntropyLoss / BCEWithLogitsLoss handle the activation; only
#   apply softmax/sigmoid at predict() time when you need probabilities.
```

## Decision Rule

```text
hidden default                  -> nn.ReLU
transformer / modern arch        -> nn.GELU or nn.SiLU
ReLU dying                       -> nn.LeakyReLU
binary classifier output         -> raw logits + BCEWithLogitsLoss
multiclass output                 -> raw logits + CrossEntropyLoss
probability needed in production  -> apply sigmoid/softmax AFTER predict
```

## Anti-Pattern

> [!warning] Anti-pattern
> appending nn.Softmax (or nn.Sigmoid) as the model's
> final layer and then training with nn.CrossEntropyLoss
> (or nn.BCELoss)
>   CE/BCE-with-logits already include log-softmax / log-sigmoid
>   internally for numerical stability; doing it twice flattens
>   gradients (log of probabilities saturating near 0/1) and training
>   either crawls or NaNs. Output RAW LOGITS from the model and let
>   CrossEntropyLoss / BCEWithLogitsLoss handle the activation; only
>   apply softmax/sigmoid at predict() time when you need probabilities.

## Tips

- ReLU is default for hidden layers; fast and effective
- Softmax always applied to classification logits before loss
- Don't apply Softmax explicitly; CrossEntropyLoss includes it
- Modern transformers / ConvNeXt-style models use `nn.GELU` or `nn.SiLU` over ReLU; if ReLUs are dying (zero gradient), switch to `nn.LeakyReLU`
- Binary classifiers should output raw logits + `BCEWithLogitsLoss` (numerically stable); only apply `sigmoid`/`softmax` after `predict()` if a probability is needed downstream

## Common Mistake

> [!warning] Applying Softmax before CrossEntropyLoss applies it twice, causing wrong gradients.

## Shorthand (Junior → Senior)

**Junior:**
```python
model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 10),
    nn.Softmax(dim=1)  # Wrong with CrossEntropyLoss
)
```

**Senior:**
```python
model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 10)  # No Softmax
)
loss = nn.CrossEntropyLoss()  # Includes Softmax
```

## See Also

- [[Sections/deeplearning/building-networks/_Index|Deep Learning → Building Networks]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

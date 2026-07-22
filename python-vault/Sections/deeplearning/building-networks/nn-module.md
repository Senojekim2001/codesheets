---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "nn-module"
title: "nn.Module"
category: "Model Definition"
subtitle: "Extend nn.Module to define custom networks"
signature_short: "class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
    def forward(self, x):"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Module"
  - "nn-module"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/model-definition"
  - "tier/tiered"
---

# nn.Module

> Extend nn.Module to define custom networks

## Overview

nn.Module is the base class for all PyTorch models. Define layers in __init__ and forward pass logic in forward(). Automatically handles parameter registration and training/eval modes.

## Signature

```python
class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
    def forward(self, x):
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - subclass nn.Module, define layers in
#             __init__, define forward(). Call model
#             via model(x), not model.forward(x).
# STRENGTHS - the canonical PyTorch model definition.
# WEAKNESSES- doesn't yet show ModuleList, parameter
#             access, or initialization.
#
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(10, 64)
        self.fc2 = nn.Linear(64, 5)
    def forward(self, x):
        return self.fc2(nn.functional.relu(self.fc1(x)))

model = Net()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Module surface: layers as
#             attributes (so PyTorch tracks them),
#             ModuleList for dynamic depth,
#             parameter inspection via
#             named_parameters / state_dict.
# STRENGTHS - covers what real model definitions look
#             like; ModuleList is essential for
#             configurable depth.
# WEAKNESSES- doesn't address weight init or
#             custom forward hooks — senior tier.
#
import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, dims, dropout=0.1):
        super().__init__()
        # ModuleList for dynamic depth
        layers = []
        for i in range(len(dims) - 2):
            layers += [nn.Linear(dims[i], dims[i+1]),
                       nn.ReLU(),
                       nn.Dropout(dropout)]
        layers.append(nn.Linear(dims[-2], dims[-1]))
        self.net = nn.Sequential(*layers)
    def forward(self, x):
        return self.net(x)

model = MLP([10, 64, 32, 5])

# Inspect parameters
for name, p in model.named_parameters():
    print(f"{name:30s} {tuple(p.shape)}")
sum(p.numel() for p in model.parameters() if p.requires_grad)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production Module patterns: explicit
#             weight initialization (kaiming for
#             ReLU, xavier for tanh); register
#             buffers (non-trainable persistent
#             state) instead of attributes; use
#             ModuleDict for named branches; type-
#             hint forward signatures.
# STRENGTHS - explicit init makes training stable
#             across runs; buffers participate in
#             state_dict but not gradients;
#             ModuleDict is the cleanest way to
#             express branching architectures.
# WEAKNESSES- manual init is more code than
#             defaults; buffers vs parameters
#             distinction trips people up.
#
import torch
import torch.nn as nn

class Net(nn.Module):
    def __init__(self, in_dim: int, n_classes: int):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(in_dim, 256),
            nn.ReLU(),
        )
        # Multiple heads via ModuleDict
        self.heads = nn.ModuleDict({
            "cls": nn.Linear(256, n_classes),
            "reg": nn.Linear(256, 1),
        })
        # Persistent state, NOT a parameter
        self.register_buffer("running_count", torch.zeros(1))
        # Explicit initialization
        self._init_weights()

    def _init_weights(self) -> None:
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor, task: str = "cls") -> torch.Tensor:
        h = self.encoder(x)
        self.running_count += x.size(0)        # buffer mutates with batches
        return self.heads[task](h)

# Decision rule:
#   simple stack of layers           -> nn.Sequential
#   custom forward / branching        -> nn.Module subclass
#   list of same-shape sublayers      -> nn.ModuleList
#   named branches / multi-task        -> nn.ModuleDict
#   non-trainable persistent state     -> register_buffer (not attribute)
#
# Anti-pattern: storing sublayers in a plain Python list or dict
# (self.layers = [nn.Linear(...), ...]) instead of nn.ModuleList /
# nn.ModuleDict
#   Plain containers hide the parameters from model.parameters(), so
#   the optimizer never sees them, .to(device) never moves them, and
#   state_dict() never serializes them. The model "trains" but those
#   layers are frozen at init. Wrap any sublayer collection in
#   nn.ModuleList / nn.ModuleDict; same applies to register_buffer
#   for tensors that must follow .to() but are not parameters.
```

## Decision Rule

```text
simple stack of layers           -> nn.Sequential
custom forward / branching        -> nn.Module subclass
list of same-shape sublayers      -> nn.ModuleList
named branches / multi-task        -> nn.ModuleDict
non-trainable persistent state     -> register_buffer (not attribute)
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing sublayers in a plain Python list or dict
> (self.layers = [nn.Linear(...), ...]) instead of nn.ModuleList /
> nn.ModuleDict
>   Plain containers hide the parameters from model.parameters(), so
>   the optimizer never sees them, .to(device) never moves them, and
>   state_dict() never serializes them. The model "trains" but those
>   layers are frozen at init. Wrap any sublayer collection in
>   nn.ModuleList / nn.ModuleDict; same applies to register_buffer
>   for tensors that must follow .to() but are not parameters.

## Tips

- Always call super().__init__() first in __init__
- Define layers as class attributes (self.layer) not local variables
- forward() method defines computation; call model(x) not model.forward(x)
- For non-trainable persistent state (positional encodings, running stats, masks) use `self.register_buffer(name, tensor)` — it follows `.to(device)` and `state_dict()` like a parameter without being trained
- Use `nn.ModuleList` / `nn.ModuleDict` to hold sublayers in a list/dict — plain Python containers hide parameters from the optimizer

## Common Mistake

> [!warning] Defining layers as local variables (x = Linear(10, 5)) prevents parameter registration.

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

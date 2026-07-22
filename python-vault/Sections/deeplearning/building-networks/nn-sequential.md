---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "nn-sequential"
title: "nn.Sequential"
category: "Model Composition"
subtitle: "Compose layers in order"
signature_short: "nn.Sequential(layer1, layer2, ...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Sequential"
  - "nn-sequential"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/model-composition"
  - "tier/tiered"
---

# nn.Sequential

> Compose layers in order

## Overview

Container module that chains layers in sequence. Input of each layer fed to next. Simplifies model definition when layers are purely sequential (no branching/skip connections).

## Signature

```python
nn.Sequential(layer1, layer2, ...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chain layers in order. Output of one
#             feeds the next.
# STRENGTHS - smallest possible model definition; no
#             custom forward needed.
# WEAKNESSES- doesn't yet show OrderedDict naming or
#             when to switch to nn.Module.
#
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(20, 64),
    nn.ReLU(),
    nn.Linear(64, 10),
)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Sequential surface:
#             OrderedDict for named layers, indexed
#             access (model[0]), nesting via *list.
# STRENGTHS - named layers improve debuggability;
#             *list lets you build dynamically-sized
#             stacks.
# WEAKNESSES- doesn't address branching / skip
#             connections — those NEED nn.Module
#             subclass (senior tier).
#
import torch.nn as nn
from collections import OrderedDict

# Named layers via OrderedDict
model = nn.Sequential(OrderedDict([
    ("fc1",   nn.Linear(20, 128)),
    ("relu1", nn.ReLU()),
    ("drop",  nn.Dropout(0.5)),
    ("fc2",   nn.Linear(128, 10)),
]))

# Access by index OR name
model[0]
model.fc1

# Build dynamically — *list unpacks
hidden = [64, 32, 16]
layers = []
prev = 100
for h in hidden:
    layers += [nn.Linear(prev, h), nn.ReLU()]
    prev = h
layers.append(nn.Linear(prev, 10))
model = nn.Sequential(*layers)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: Sequential is for
#             STRICTLY linear architectures. The
#             moment you need a residual / skip /
#             multi-output, switch to nn.Module
#             subclass. Sequential models can still
#             be COMPONENTS within a larger Module.
# STRENGTHS - explicit decision rule prevents
#             contortions trying to express ResNet-
#             style architectures via Sequential.
# WEAKNESSES- there's no clean way to do residuals
#             in Sequential — switching to subclass
#             is the right answer.
#
import torch
import torch.nn as nn

# Sequential as a SUB-component of a Module subclass
class ResBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        # Sequential is fine for the inner forward
        self.body = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
        )
        self.relu = nn.ReLU(inplace=True)
    def forward(self, x):
        return self.relu(x + self.body(x))         # SKIP — needs subclass

# Anti-pattern: trying to do residuals in Sequential
# nn.Sequential(...) cannot express x + body(x).

# Decision rule:
#   strictly linear stack            -> nn.Sequential
#   skip / residual / multi-output    -> nn.Module subclass
#   variable depth                     -> nn.Sequential(*list) OR ModuleList
#   want named-layer access            -> Sequential(OrderedDict([...]))
```

## Decision Rule

```text
strictly linear stack            -> nn.Sequential
skip / residual / multi-output    -> nn.Module subclass
variable depth                     -> nn.Sequential(*list) OR ModuleList
want named-layer access            -> Sequential(OrderedDict([...]))
```

## Anti-Pattern

> [!warning] Anti-pattern
> trying to do residuals in Sequential
> nn.Sequential(...) cannot express x + body(x).

## Tips

- Sequential works for linear/sequential architectures only
- For complex models with branches, use nn.Module instead
- Can mix indexed and named access in Sequential

## Common Mistake

> [!warning] Using Sequential for models with skip connections or multiple paths fails.

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

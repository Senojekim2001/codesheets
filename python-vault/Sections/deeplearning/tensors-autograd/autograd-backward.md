---
type: "entry"
domain: "python"
file: "deeplearning"
section: "tensors-autograd"
id: "autograd-backward"
title: "Autograd & backward()"
category: "Gradients"
subtitle: "Backpropagation through computation graph"
signature_short: "tensor.backward() | tensor.grad"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Autograd & backward()"
  - "autograd-backward"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/tensors-autograd"
  - "category/gradients"
  - "tier/tiered"
---

# Autograd & backward()

> Backpropagation through computation graph

## Overview

PyTorch autograd automatically computes gradients via backpropagation. Tensors with requires_grad=True track operations for gradient computation. Call backward() to compute gradients, access via .grad attribute.

## Signature

```python
tensor.backward() | tensor.grad
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - requires_grad=True tracks ops; call
#             backward on a SCALAR; gradients land in
#             .grad.
# STRENGTHS - smallest demonstration of autograd.
# WEAKNESSES- doesn't yet show the "scalar only" rule
#             or .detach for breaking the graph.
#
import torch
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = (x ** 2).sum()                          # scalar
y.backward()
x.grad                                      # [4.0, 6.0]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday autograd surface:
#             gradients accumulate (zero them between
#             passes); .detach to break the graph;
#             .item() for a scalar value; only LEAF
#             tensors (the ones you created) get
#             .grad by default.
# STRENGTHS - the accumulation rule is the single
#             most common autograd bug; .detach is
#             the standard "use this value but don't
#             flow gradients through it".
# WEAKNESSES- doesn't address vector backward via
#             grad_outputs= or higher-order derivs
#             — senior tier.
#
import torch

x = torch.tensor([2.0, 3.0], requires_grad=True)

# Multiple backward calls accumulate
(x ** 2).sum().backward()
(x ** 2).sum().backward()
x.grad                                      # [8.0, 12.0] — DOUBLED
x.grad.zero_()                              # reset before next pass

# Detach — value used but no gradient flows back
y = x ** 2
y_const = y.detach()                        # tensor copy, no graph
loss = (x * y_const).sum()                  # treats y_const as a constant

# Get a scalar
loss.item()                                 # plain Python float
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production autograd: call backward on
#             a scalar (sum the loss across batch);
#             use retain_graph=True only when needed
#             (e.g. multi-task losses sharing the
#             same graph); higher-order gradients
#             via create_graph=True; explicit
#             gradient checkpointing for memory.
# STRENGTHS - calling out the "must be scalar" rule
#             prevents the most common backward
#             error; gradient checkpointing is the
#             standard memory-saving technique for
#             deep nets.
# WEAKNESSES- retain_graph=True doubles memory cost;
#             checkpointing trades compute for memory
#             (~33% slower, much less memory).
#
import torch
import torch.utils.checkpoint as ckpt

# 1. backward must be on a scalar — sum reduces a vector
out = model(x)                               # (B, num_classes)
loss = criterion(out, y)                     # scalar already
loss.backward()

# 2. Multi-task losses sharing the graph
shared = encoder(x)
loss_a = head_a(shared).sum()
loss_b = head_b(shared).sum()
total = loss_a + loss_b                      # combine into one scalar
total.backward()                             # one pass — no retain_graph

# 3. Memory savings with gradient checkpointing
def block(x):
    return some_expensive_layers(x)

x = ckpt.checkpoint(block, x, use_reentrant=False)
# Recomputes activations during backward — saves memory

# Decision rule:
#   standard single-loss training       -> loss.backward() (scalar, no flags)
#   multi-task losses sharing graph     -> sum into one scalar, backward once
#   need to backward twice on same graph -> retain_graph=True (rare; doubles mem)
#   higher-order gradients (meta, R1)    -> create_graph=True
#   memory-bound deep network            -> torch.utils.checkpoint
#   want a value but no grad flow         -> .detach() (NOT .data)
#   loop-only sanity readout              -> .item() AFTER backward
#
# Anti-pattern: calling .backward() on a non-scalar tensor by passing
# torch.ones_like(loss) instead of reducing first
#   loss = (pred - target) ** 2 ; loss.backward(torch.ones_like(loss))
#   "works" but silently sums the per-element gradients with weight 1,
#   making the effective loss scale depend on batch and feature size.
#   Always reduce to a scalar (.mean() or .sum()) before backward so
#   the loss magnitude — and thus the learning rate — is well defined.
```

## Decision Rule

```text
standard single-loss training       -> loss.backward() (scalar, no flags)
multi-task losses sharing graph     -> sum into one scalar, backward once
need to backward twice on same graph -> retain_graph=True (rare; doubles mem)
higher-order gradients (meta, R1)    -> create_graph=True
memory-bound deep network            -> torch.utils.checkpoint
want a value but no grad flow         -> .detach() (NOT .data)
loop-only sanity readout              -> .item() AFTER backward
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling .backward() on a non-scalar tensor by passing
> torch.ones_like(loss) instead of reducing first
>   loss = (pred - target) ** 2 ; loss.backward(torch.ones_like(loss))
>   "works" but silently sums the per-element gradients with weight 1,
>   making the effective loss scale depend on batch and feature size.
>   Always reduce to a scalar (.mean() or .sum()) before backward so
>   the loss magnitude — and thus the learning rate — is well defined.

## Tips

- Only leaf tensors have .grad; intermediate tensors lose gradients by default
- Call .backward() only on scalar losses
- Zero gradients with optimizer.zero_grad() before each training step

## Common Mistake

> [!warning] Calling backward() multiple times accumulates gradients instead of replacing them.

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

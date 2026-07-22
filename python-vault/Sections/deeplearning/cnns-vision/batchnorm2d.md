---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "batchnorm2d"
title: "nn.BatchNorm2d"
category: "Normalization"
subtitle: "Normalize across batch dimension"
signature_short: "nn.BatchNorm2d(num_features, momentum=0.1, eps=1e-05)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.BatchNorm2d"
  - "batchnorm2d"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/normalization"
  - "tier/tiered"
---

# nn.BatchNorm2d

> Normalize across batch dimension

## Overview

Normalizes activations per channel. During training: normalizes by batch statistics. During eval: uses running mean/var. Accelerates training, allows higher learning rates, reduces internal covariate shift.

## Signature

```python
nn.BatchNorm2d(num_features, momentum=0.1, eps=1e-05)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Single BatchNorm2d call after a conv layer
# STRENGTHS - Smallest possible Conv -> BN -> ReLU block
# WEAKNESSES- No discussion of train/eval differences or running stats
#
import torch
import torch.nn as nn

block = nn.Sequential(
    nn.Conv2d(3, 32, kernel_size=3, padding=1),
    nn.BatchNorm2d(32),                       # one BN per conv output channel count
    nn.ReLU(),
)

print(block(torch.randn(8, 3, 28, 28)).shape)   # torch.Size([8, 32, 28, 28])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Show the train/eval split: batch stats vs running stats
# STRENGTHS - Demonstrates why model.eval() matters for BN
# WEAKNESSES- Doesn't cover small-batch failure modes
#
import torch
import torch.nn as nn

bn = nn.BatchNorm2d(32)
x = torch.randn(16, 32, 28, 28)

bn.train()
y = bn(x)                                  # uses BATCH mean/var, updates running stats
print("running_mean[:3]:", bn.running_mean[:3])

bn.eval()
y_eval = bn(x)                             # uses ACCUMULATED running_mean/running_var
# Same input, different normalization -> different outputs is expected.

# Conv -> BN -> ReLU is the canonical block (BN before activation).
# In a Conv2d feeding BatchNorm2d, set bias=False — BN's beta replaces it.
block = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1, bias=False),
    nn.BatchNorm2d(32),
    nn.ReLU(inplace=True),
)
print(block(torch.randn(4, 3, 32, 32)).shape)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production rules: bias=False, batch-size traps, alternatives, freezing
# STRENGTHS - Captures the failure modes BN actually causes in real systems
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn

# 1) Conv2d feeding BatchNorm should NOT have a bias.
#    BN subtracts the mean immediately after — a bias term is wasted parameters.
nn.Conv2d(3, 64, 3, padding=1, bias=False)

# 2) Batch-size pathology. BatchNorm needs > 1 sample per channel during train.
#    BN with batch_size=1 in train mode -> variance=0 -> NaN gradients.
#    Validation in train() with bs=1 hits the same trap.
def safe_norm(c, batch_size_hint):
    if batch_size_hint < 8:
        return nn.GroupNorm(num_groups=8, num_channels=c)   # batch-size invariant
    return nn.BatchNorm2d(c)

# 3) Freezing BN during fine-tuning of a pretrained backbone.
def freeze_bn(model):
    for m in model.modules():
        if isinstance(m, nn.BatchNorm2d):
            m.eval()                       # use frozen running stats
            for p in m.parameters():
                p.requires_grad = False    # don't update gamma/beta

# 4) Multi-GPU: replace BN with SyncBatchNorm for true cross-device statistics
#    model = nn.SyncBatchNorm.convert_sync_batchnorm(model)

# Decision rule:
#   batch_size >= 16, single GPU         -> BatchNorm2d
#   batch_size 1-8 (detection, 3D, RNNs) -> GroupNorm or LayerNorm
#   distributed / multi-GPU              -> SyncBatchNorm
#   transformers / per-token features    -> LayerNorm, never BN
#   fine-tuning a pretrained CNN         -> freeze BN with .eval() per module
#
# Anti-pattern: BatchNorm + Dropout in the same block, in that order.
#   BN normalizes; Dropout zeros random units; the next BN sees a corrupted
#   mean/var. Pick one (modern CNNs use BN only).
```

## Decision Rule

```text
batch_size >= 16, single GPU         -> BatchNorm2d
batch_size 1-8 (detection, 3D, RNNs) -> GroupNorm or LayerNorm
distributed / multi-GPU              -> SyncBatchNorm
transformers / per-token features    -> LayerNorm, never BN
fine-tuning a pretrained CNN         -> freeze BN with .eval() per module
```

## Anti-Pattern

> [!warning] Anti-pattern
> BatchNorm + Dropout in the same block, in that order.
>   BN normalizes; Dropout zeros random units; the next BN sees a corrupted
>   mean/var. Pick one (modern CNNs use BN only).

## Tips

- Place BN after Conv, before ReLU for best results
- BN momentum: typically 0.1 (running_stat = momentum * stat + (1-momentum) * new)
- In eval mode, BN uses accumulated running statistics, not batch stats
- Small batch sizes (1-8: detection, 3D, RNN, transformer) make BN unstable — use `GroupNorm` or `LayerNorm` instead; for multi-GPU use `SyncBatchNorm`
- When fine-tuning a pretrained CNN, freeze the BN layers (call `.eval()` on each) so the small fine-tune batches do not corrupt the running stats

## Common Mistake

> [!warning] Using BN without proper train/eval modes causes validation metrics to be incorrect.

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

- [[Sections/deeplearning/cnns-vision/_Index|Deep Learning → CNNs & Vision]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]

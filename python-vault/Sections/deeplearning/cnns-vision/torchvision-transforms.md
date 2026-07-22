---
type: "entry"
domain: "python"
file: "deeplearning"
section: "cnns-vision"
id: "torchvision-transforms"
title: "torchvision Transforms"
category: "Data Augmentation"
subtitle: "Normalize, crop, rotate, flip images"
signature_short: "transforms.Compose([...]) | transforms.ToTensor() | transforms.Normalize()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "torchvision Transforms"
  - "torchvision-transforms"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/cnns-vision"
  - "category/data-augmentation"
  - "tier/tiered"
---

# torchvision Transforms

> Normalize, crop, rotate, flip images

## Overview

torchvision.transforms provides composable image transformations. ToTensor converts PIL images to tensors. Normalize with ImageNet statistics. Augmentation (rotate, flip, crop) during training improves robustness.

## Signature

```python
transforms.Compose([...]) | transforms.ToTensor() | transforms.Normalize()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The minimum: PIL -> Tensor -> Normalize
# STRENGTHS - Works with any pretrained model expecting [0,1] floats
# WEAKNESSES- No augmentation, no resize, hard-coded means/stds
#
from torchvision import transforms
from PIL import Image

t = transforms.Compose([
    transforms.ToTensor(),                     # PIL [0..255] -> float [0..1]
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std =[0.229, 0.224, 0.225]),  # ImageNet stats
])

img = Image.new("RGB", (224, 224))
print(t(img).shape)                            # torch.Size([3, 224, 224])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Distinct train and val pipelines — augment train only
# STRENGTHS - Shows the asymmetry that defines real image training
# WEAKNESSES- Old PIL-based API; modern code uses transforms.v2 + tensors
#
from torchvision import transforms

# Training: aggressive augmentation
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224),         # crop + resize in one step
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

# Validation: deterministic only — never randomize evaluation
val_tf = transforms.Compose([
    transforms.Resize(256),                    # resize short side to 256
    transforms.CenterCrop(224),                # then center-crop to 224
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

# Wire into a Dataset:
# train_ds = datasets.ImageFolder("data/train", transform=train_tf)
# val_ds   = datasets.ImageFolder("data/val",   transform=val_tf)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Modern v2 API on tensors, GPU-side transforms, custom stats
# STRENGTHS - The pipeline you ship: faster, type-safe, cleanly composes with masks/bboxes
# WEAKNESSES- N/A
#
import torch
from torchvision.transforms import v2

# 1) Use transforms.v2 — it operates on tensors, not just PIL, and supports
#    detection / segmentation targets in the same Compose.
train_tf = v2.Compose([
    v2.PILToTensor(),                          # uint8 tensor, no scaling
    v2.RandomResizedCrop(224, antialias=True),
    v2.RandomHorizontalFlip(),
    v2.TrivialAugmentWide(),                   # strong, parameter-free augmenter
    v2.ToDtype(torch.float32, scale=True),     # uint8 -> float in [0,1]
    v2.Normalize(mean=[0.485, 0.456, 0.406],
                 std =[0.229, 0.224, 0.225]),
])

# 2) Compute YOUR dataset's mean/std once — don't blindly reuse ImageNet.
def dataset_stats(loader):
    n, mean, sq = 0, 0., 0.
    for x, _ in loader:                        # x: (B, C, H, W) in [0, 1]
        b = x.size(0) * x.size(2) * x.size(3)
        n   += b
        mean += x.sum(dim=[0, 2, 3])
        sq   += (x ** 2).sum(dim=[0, 2, 3])
    mean /= n
    std = (sq / n - mean ** 2).sqrt()
    return mean, std

# 3) GPU-side augmentation for I/O-bound pipelines: keep ToTensor+Resize on CPU,
#    move flips / colorjitter to the GPU after the batch is collated.

# Decision rule:
#   transfer learning from ImageNet      -> ImageNet mean/std, RandomResizedCrop+HFlip
#   training from scratch on own data    -> compute dataset_stats() above
#   strong baseline with one knob        -> TrivialAugmentWide or RandAugment
#   detection / segmentation             -> v2 with bbox/mask-aware transforms
#   small dataset, big model             -> heavier augmentation (Mixup, CutMix)
#
# Anti-pattern: applying augmentation to validation
#   val_tf with RandomCrop -> different metric every run; you can't compare epochs.
#   Validation must be deterministic: Resize -> CenterCrop -> Normalize, full stop.
```

## Decision Rule

```text
transfer learning from ImageNet      -> ImageNet mean/std, RandomResizedCrop+HFlip
training from scratch on own data    -> compute dataset_stats() above
strong baseline with one knob        -> TrivialAugmentWide or RandAugment
detection / segmentation             -> v2 with bbox/mask-aware transforms
small dataset, big model             -> heavier augmentation (Mixup, CutMix)
```

## Anti-Pattern

> [!warning] Anti-pattern
> applying augmentation to validation
>   val_tf with RandomCrop -> different metric every run; you can't compare epochs.
>   Validation must be deterministic: Resize -> CenterCrop -> Normalize, full stop.

## Tips

- Use ImageNet mean/std when transferring from ImageNet pretrained models
- Heavy augmentation (flip, rotate, crop) only for training
- CenterCrop + no augmentation for validation/test

## Common Mistake

> [!warning] Applying augmentation to validation data invalidates generalization evaluation.

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

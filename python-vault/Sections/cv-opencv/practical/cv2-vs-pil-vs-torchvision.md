---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "practical"
id: "cv2-vs-pil-vs-torchvision"
title: "cv2 vs PIL vs torchvision — pick the right tool"
category: "patterns"
subtitle: "cv2 (algorithms: filters, transforms, detection, video) vs PIL (load/save/resize/EXIF) vs torchvision.transforms / kornia (ML augmentation), conversion glue (cv2.cvtColor, np.array(pil_img), Image.fromarray)"
signature_short: "# cv2 reads BGR; PIL reads RGB; torchvision expects RGB tensor (C,H,W) float32 / 255"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2 vs PIL vs torchvision — pick the right tool"
  - "cv2-vs-pil-vs-torchvision"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/practical"
  - "category/patterns"
  - "tier/tiered"
---

# cv2 vs PIL vs torchvision — pick the right tool

> cv2 (algorithms: filters, transforms, detection, video) vs PIL (load/save/resize/EXIF) vs torchvision.transforms / kornia (ML augmentation), conversion glue (cv2.cvtColor, np.array(pil_img), Image.fromarray)

## Overview

cv2 is the C++ workhorse — fast filters, transforms, detection, video, calibration. PIL/Pillow is the friendliest for "load this PNG, paste a watermark, save". torchvision/kornia is purpose-built for ML augmentation pipelines. The libraries interop well — the only friction is BGR vs RGB. Three depths solve the SAME task — load 100 images, resize and augment for training a CNN — at depths: pure cv2 (BGR pitfalls everywhere) → cv2 for I/O + torchvision for transforms (correct boundary conversion) → cv2.cuda or kornia GPU pipelines for high-throughput training.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load 100 images, resize to 224, return as a (N, 3, 224, 224) float tensor for CNN training.
- **Junior** — SAME — 100 images for CNN training — proper Dataset with cv2 for I/O and torchvision.transforms for augmentation.
- **Senior** — SAME — 100 images for CNN training — production: kornia GPU augmentation, no PIL detour, batched on the GPU.

## Signature

```python
# cv2 reads BGR; PIL reads RGB; torchvision expects RGB tensor (C,H,W) float32 / 255
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load 100 images, resize to 224, return as a (N, 3, 224, 224)
#             float tensor for CNN training.
# APPROACH  - Pure cv2.
# STRENGTHS - One library; fast disk I/O.
# WEAKNESSES- BGR ordering must be remembered; manual normalization;
#             no augmentation primitives.
import cv2
import numpy as np
from pathlib import Path

paths = sorted(Path('train/').glob('*.jpg'))[:100]

batch = []
for p in paths:
    img = cv2.imread(str(p))                          # BGR uint8 (H, W, 3)
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)        # match RGB convention
    img = img.astype(np.float32) / 255.0
    img = img.transpose(2, 0, 1)                       # HWC -> CHW
    batch.append(img)

tensor = np.stack(batch)                              # (100, 3, 224, 224)
print(tensor.shape, tensor.dtype, tensor.min(), tensor.max())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — 100 images for CNN training — proper Dataset with
#             cv2 for I/O and torchvision.transforms for augmentation.
# APPROACH  - cv2.imread (fast) -> RGB -> torchvision pipeline.
# STRENGTHS - Right tool per stage; standard PyTorch idioms.
# WEAKNESSES- Two libraries to coordinate; PIL conversion in middle.
import cv2
import torch
from PIL import Image
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms


class FastImageDataset(Dataset):
    """cv2 reads from disk; transforms run on PIL/tensor."""
    def __init__(self, paths: list[Path], train: bool = True):
        self.paths = paths
        self.tx = transforms.Compose([
            transforms.Resize(256),
            transforms.RandomCrop(224) if train else transforms.CenterCrop(224),
            transforms.RandomHorizontalFlip() if train else transforms.Lambda(lambda x: x),
            transforms.ToTensor(),                    # PIL -> (C,H,W) float [0,1]
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std =[0.229, 0.224, 0.225]),
        ])

    def __len__(self): return len(self.paths)

    def __getitem__(self, i):
        # cv2 imread is ~2x faster than PIL.Image.open(file).convert('RGB')
        bgr = cv2.imread(str(self.paths[i]))
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        # Bridge to PIL so torchvision transforms work.
        return self.tx(Image.fromarray(rgb))


paths = sorted(Path('train/').glob('*.jpg'))[:100]
ds = FastImageDataset(paths, train=True)
loader = DataLoader(ds, batch_size=32, num_workers=4)
for batch in loader:
    print(batch.shape)                                # torch.Size([32, 3, 224, 224])
    break
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — 100 images for CNN training — production: kornia
#             GPU augmentation, no PIL detour, batched on the GPU.
# APPROACH  - cv2 for I/O -> tensor on GPU -> kornia transforms.
# STRENGTHS - GPU-resident augmentation; no per-sample CPU overhead;
#             batched ops (much faster for large batches).
# WEAKNESSES- Need kornia + a GPU; transforms are tensor-only (no PIL fallback).
from __future__ import annotations
import cv2
import torch
import kornia.augmentation as K
from pathlib import Path
from torch.utils.data import Dataset, DataLoader


class CV2RawDataset(Dataset):
    """Returns raw uint8 RGB tensors; augmentation happens later on GPU."""
    def __init__(self, paths: list[Path]):
        self.paths = paths

    def __len__(self): return len(self.paths)

    def __getitem__(self, i):
        bgr = cv2.imread(str(self.paths[i]))
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)    # (H,W,3) uint8
        rgb = cv2.resize(rgb, (256, 256))
        return torch.from_numpy(rgb).permute(2, 0, 1) # (3,256,256) uint8


class GPUTransform(torch.nn.Module):
    """Run on the GPU after collation - one batched op, no Python loop."""
    def __init__(self):
        super().__init__()
        self.tx = torch.nn.Sequential(
            K.RandomCrop((224, 224)),
            K.RandomHorizontalFlip(p=0.5),
            K.ColorJitter(0.2, 0.2, 0.2, 0.1, p=0.8),
            K.Normalize(mean=torch.tensor([0.485, 0.456, 0.406]),
                        std =torch.tensor([0.229, 0.224, 0.225])),
        )

    @torch.no_grad()
    def forward(self, batch_uint8):                   # (B,3,H,W) uint8
        return self.tx(batch_uint8.float() / 255.0)


paths = sorted(Path('train/').glob('*.jpg'))[:100]
ds = CV2RawDataset(paths)
loader = DataLoader(ds, batch_size=32, num_workers=4, pin_memory=True)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
gpu_tx = GPUTransform().to(device)

for batch in loader:
    batch = batch.to(device, non_blocking=True)       # (32, 3, 256, 256) uint8
    augmented = gpu_tx(batch)                         # (32, 3, 224, 224) float32
    # ... feed to model.forward(augmented)
    print(augmented.shape, augmented.dtype)
    break

# Decision rule:
#   Image I/O + simple ops (paste, watermark, web)   -> Pillow.
#   Filters, transforms, detection, video            -> cv2 (BGR-aware).
#   Train CNN, augmentation pipeline (CPU)           -> torchvision.transforms.
#   Train CNN, augmentation pipeline (GPU, batched)  -> kornia.augmentation.
#   Need numpy interop                               -> cv2 / numpy / Pillow all interop;
#                                                       just remember BGR <-> RGB.
#   Reading EXIF / metadata                          -> Pillow (cv2 strips most EXIF).
#   Camera calibration / homography / SLAM           -> cv2 only.

# Anti-pattern:
#   img = cv2.imread(p)
#   loss = model(transforms.ToTensor()(img))   # ToTensor expects PIL or HWC RGB
# cv2.imread gives BGR HWC uint8. ToTensor expects RGB. Either:
#   transforms.ToTensor()(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
# or skip torchvision entirely and just normalize the array yourself.
```

## Decision Rule

```text
Image I/O + simple ops (paste, watermark, web)   -> Pillow.
Filters, transforms, detection, video            -> cv2 (BGR-aware).
Train CNN, augmentation pipeline (CPU)           -> torchvision.transforms.
Train CNN, augmentation pipeline (GPU, batched)  -> kornia.augmentation.
Need numpy interop                               -> cv2 / numpy / Pillow all interop;
                                                    just remember BGR <-> RGB.
Reading EXIF / metadata                          -> Pillow (cv2 strips most EXIF).
Camera calibration / homography / SLAM           -> cv2 only.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   img = cv2.imread(p)
>   loss = model(transforms.ToTensor()(img))   # ToTensor expects PIL or HWC RGB
> cv2.imread gives BGR HWC uint8. ToTensor expects RGB. Either:
>   transforms.ToTensor()(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
> or skip torchvision entirely and just normalize the array yourself.

## Tips

- cv2.imread is ~2x faster than `PIL.Image.open(p).convert('RGB')` — use cv2 for the file load even in PIL/torchvision pipelines.
- Convert at the boundary: `cv2.cvtColor(img, COLOR_BGR2RGB)` or `Image.fromarray(rgb_array)`.
- PIL keeps EXIF metadata; cv2 strips it. Use PIL when EXIF orientation matters.
- kornia gives GPU-batched augmentation — much faster than per-sample CPU torchvision when batches are large.
- For pure ML preprocessing, prefer torchvision/kornia idioms; reach into cv2 for camera-vision algorithms (homography, SLAM, calibration).

## Common Mistake

> [!warning] Mixing cv2 (BGR) with torchvision/PIL (RGB) without converting — colors silently swap and a CNN trained on RGB drops 5-15% accuracy.

## See Also

- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework (Quantum)]]
- [[Sections/cv-opencv/practical/_Index|OpenCV (cv2) → When to reach for cv2]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

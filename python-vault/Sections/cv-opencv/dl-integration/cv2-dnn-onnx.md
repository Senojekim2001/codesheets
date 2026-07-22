---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "dl-integration"
id: "cv2-dnn-onnx"
title: "cv2.dnn.readNetFromONNX — run a model without PyTorch/TF"
category: "dl-integration"
subtitle: "cv2.dnn.readNetFromONNX, cv2.dnn.blobFromImage (NCHW, mean subtraction, swapRB BGR->RGB), setInput, forward, output decoding (YOLO, classification, segmentation), DNN_BACKEND_OPENCV / DNN_TARGET_CPU/CUDA"
signature_short: "net = cv2.dnn.readNetFromONNX(path); net.setInput(blob); out = net.forward()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.dnn.readNetFromONNX — run a model without PyTorch/TF"
  - "cv2-dnn-onnx"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/dl-integration"
  - "category/dl-integration"
  - "tier/tiered"
---

# cv2.dnn.readNetFromONNX — run a model without PyTorch/TF

> cv2.dnn.readNetFromONNX, cv2.dnn.blobFromImage (NCHW, mean subtraction, swapRB BGR->RGB), setInput, forward, output decoding (YOLO, classification, segmentation), DNN_BACKEND_OPENCV / DNN_TARGET_CPU/CUDA

## Overview

The cv2.dnn module is a stripped-down inference engine — no PyTorch, no ONNXRuntime, just opencv. Workflow: `blobFromImage` to convert HWC BGR uint8 → NCHW float32 (with mean subtraction and BGR→RGB toggle) → `setInput` → `forward()`. Three depths solve the SAME task — classify a single image with a pretrained ResNet50 — at depths: minimal load+forward → proper preprocessing (size, mean, std, swapRB) and softmax → switch backend to CUDA, batch images, decode top-k.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Classify a single image with ResNet50 (ONNX export).
- **Junior** — SAME — classify with ResNet50 — proper preprocessing.
- **Senior** — SAME — classify with ResNet50 — production: batched inference, CUDA backend if available, label decoding, top-k.

## Signature

```python
net = cv2.dnn.readNetFromONNX(path); net.setInput(blob); out = net.forward()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Classify a single image with ResNet50 (ONNX export).
# APPROACH  - Load ONNX, blobFromImage, forward, argmax.
# STRENGTHS - Demonstrates the full pipeline.
# WEAKNESSES- Skips proper mean/std normalization; CPU only.
import cv2
import numpy as np

net = cv2.dnn.readNetFromONNX('resnet50.onnx')
img = cv2.imread('cat.jpg')

# blobFromImage: HWC BGR uint8 -> NCHW float32; resize to 224x224.
blob = cv2.dnn.blobFromImage(img, scalefactor=1/255.0, size=(224, 224), swapRB=True)

net.setInput(blob)
out = net.forward()                                   # (1, 1000)

cls = int(np.argmax(out))
print(f"class index: {cls}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — classify with ResNet50 — proper preprocessing.
# APPROACH  - ImageNet mean/std; softmax over logits; top-5.
# STRENGTHS - Matches torchvision preprocessing; meaningful confidences.
# WEAKNESSES- Single image; CPU only; mean is per-channel via blobFromImage.
import cv2
import numpy as np


def softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max())
    return e / e.sum()


net = cv2.dnn.readNetFromONNX('resnet50.onnx')

img = cv2.imread('cat.jpg')

# ImageNet preprocessing (matching torchvision):
#   mean = [0.485, 0.456, 0.406]  (RGB!)
#   std  = [0.229, 0.224, 0.225]
# blobFromImage subtracts mean and divides by 255*std (when scalefactor=1/255).
mean_rgb = (0.485*255, 0.456*255, 0.406*255)          # in 0..255

blob = cv2.dnn.blobFromImage(
    img, scalefactor=1/255.0, size=(224, 224),
    mean=mean_rgb, swapRB=True, crop=False,
)
# Note: blobFromImage doesn't divide by std - apply manually if you need it.
std_rgb = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)
blob = blob / std_rgb

net.setInput(blob)
logits = net.forward()[0]                             # (1000,)
probs  = softmax(logits)
top5   = np.argsort(probs)[-5:][::-1]

print("top-5:")
for idx in top5:
    print(f"  class {idx}: {probs[idx]:.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — classify with ResNet50 — production: batched inference,
#             CUDA backend if available, label decoding, top-k.
# APPROACH  - Detect CUDA, build batch blob, forward once, postprocess.
# STRENGTHS - High throughput; one forward per N images; readable labels.
# WEAKNESSES- cv2.dnn CUDA needs OpenCV built with CUDA (not the pip wheel).
from __future__ import annotations
import cv2
import json
import numpy as np
from pathlib import Path


def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


def build_net(onnx_path: Path, *, prefer_cuda: bool = True) -> cv2.dnn_Net:
    net = cv2.dnn.readNetFromONNX(str(onnx_path))
    if prefer_cuda and cv2.cuda.getCudaEnabledDeviceCount() > 0:
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA_FP16)
    else:
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
    return net


def classify(net: cv2.dnn_Net, images: list[np.ndarray], *,
             input_size: int = 224, top_k: int = 5,
             labels: list[str] | None = None) -> list[list[tuple[str | int, float]]]:
    """Return per-image list of (label_or_index, prob) pairs (top_k)."""
    mean = (0.485*255, 0.456*255, 0.406*255)

    blob = cv2.dnn.blobFromImages(
        images, scalefactor=1/255.0, size=(input_size, input_size),
        mean=mean, swapRB=True, crop=False,
    )
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)
    blob = blob / std

    net.setInput(blob)
    logits = net.forward()                            # (N, 1000)
    probs  = softmax(logits, axis=1)

    out = []
    for row in probs:
        idxs = np.argsort(row)[-top_k:][::-1]
        out.append([
            (labels[i] if labels else int(i), float(row[i]))
            for i in idxs
        ])
    return out


# Usage:
labels = json.loads(Path('imagenet_classes.json').read_text())
net = build_net(Path('resnet50.onnx'))

imgs = [cv2.imread(p) for p in ['cat.jpg', 'dog.jpg', 'car.jpg']]
results = classify(net, imgs, labels=labels, top_k=3)

for path, top in zip(['cat.jpg', 'dog.jpg', 'car.jpg'], results):
    print(path, top)

# Decision rule:
#   Want simple inference, no extra deps   -> cv2.dnn.readNetFromONNX.
#   Want best CPU latency                  -> ONNXRuntime (onnxruntime).
#   Want best GPU throughput               -> ONNXRuntime + CUDA EP, or TensorRT.
#   Need training or finetuning            -> not cv2 - use PyTorch / TF.
#   Need >1 image at a time                -> blobFromImages (plural) and batch.
#   Need to mix with PyTorch tensors       -> stay in PyTorch; cv2 just reads frames.

# Anti-pattern:
#   blob = cv2.dnn.blobFromImage(img, swapRB=False)   # then feed to a model
#                                                       # trained on RGB
# Half of all "model works in PyTorch but garbage with cv2" bugs are
# swapRB=False when the model expects RGB. Default torchvision = RGB,
# default cv2 = BGR. Set swapRB=True almost always.
```

## Decision Rule

```text
Want simple inference, no extra deps   -> cv2.dnn.readNetFromONNX.
Want best CPU latency                  -> ONNXRuntime (onnxruntime).
Want best GPU throughput               -> ONNXRuntime + CUDA EP, or TensorRT.
Need training or finetuning            -> not cv2 - use PyTorch / TF.
Need >1 image at a time                -> blobFromImages (plural) and batch.
Need to mix with PyTorch tensors       -> stay in PyTorch; cv2 just reads frames.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   blob = cv2.dnn.blobFromImage(img, swapRB=False)   # then feed to a model
>                                                       # trained on RGB
> Half of all "model works in PyTorch but garbage with cv2" bugs are
> swapRB=False when the model expects RGB. Default torchvision = RGB,
> default cv2 = BGR. Set swapRB=True almost always.

## Tips

- `blobFromImage` does the resize + mean subtract + BGR→RGB swap + HWC→NCHW in one call.
- It does NOT divide by std — divide manually if your model expects normalized inputs.
- cv2.dnn CUDA backend only works if OpenCV was compiled with CUDA — the pip wheels are CPU-only.
- For best CPU latency, ONNXRuntime usually beats cv2.dnn by 2-5x.
- cv2.dnn is great for drop-in inference inside an existing OpenCV pipeline (frame in, prediction out, no extra deps).

## Common Mistake

> [!warning] Forgetting `swapRB=True` when the model was trained on RGB — colors are silently swapped, accuracy collapses.

## See Also

- [[Sections/cv-opencv/dl-integration/_Index|OpenCV (cv2) → DNN inference and DL bridges]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

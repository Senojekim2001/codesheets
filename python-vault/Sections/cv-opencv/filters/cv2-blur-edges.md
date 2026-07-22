---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "filters"
id: "cv2-blur-edges"
title: "cv2.GaussianBlur / cv2.Canny — smoothing and edge detection"
category: "filters"
subtitle: "GaussianBlur (odd ksize, sigmaX), medianBlur (salt-and-pepper noise), bilateralFilter (preserves edges), Canny (lo/hi hysteresis), Sobel/Laplacian (gradient operators), auto-threshold via image median"
signature_short: "cv2.GaussianBlur(src, ksize=(k,k), sigmaX=); cv2.Canny(src, threshold1=, threshold2=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.GaussianBlur / cv2.Canny — smoothing and edge detection"
  - "cv2-blur-edges"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/filters"
  - "category/filters"
  - "tier/tiered"
---

# cv2.GaussianBlur / cv2.Canny — smoothing and edge detection

> GaussianBlur (odd ksize, sigmaX), medianBlur (salt-and-pepper noise), bilateralFilter (preserves edges), Canny (lo/hi hysteresis), Sobel/Laplacian (gradient operators), auto-threshold via image median

## Overview

GaussianBlur with odd kernel size is the standard smoother; medianBlur is the right choice for salt-and-pepper noise; bilateralFilter smooths while keeping edges crisp (slower). Canny applies Sobel-derived gradients then double-thresholds: pixels above hi are edges, pixels above lo connected to hi are kept (hysteresis). Three depths solve the SAME task — find edges in a noisy photo — at depths: blur+Canny with hardcoded thresholds → auto-thresholds from image median → bilateralFilter + Canny + dilate-close to clean broken edges.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find edges in a noisy photo.
- **Junior** — SAME — edges in noisy photo — auto-threshold by image median.
- **Senior** — SAME — edges in noisy photo — production: bilateral filter to denoise without losing edges, auto-Canny, morphology to close gaps so contours close cleanly.

## Signature

```python
cv2.GaussianBlur(src, ksize=(k,k), sigmaX=); cv2.Canny(src, threshold1=, threshold2=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find edges in a noisy photo.
# APPROACH  - GaussianBlur to denoise, Canny with fixed thresholds.
# STRENGTHS - Two-line edge detector.
# WEAKNESSES- Thresholds 100/200 won't work for every image.
import cv2

img = cv2.imread('photo.jpg', cv2.IMREAD_GRAYSCALE)

blur = cv2.GaussianBlur(img, ksize=(5, 5), sigmaX=1.0)
edges = cv2.Canny(blur, threshold1=100, threshold2=200)

cv2.imwrite('edges.jpg', edges)

# Kernel size MUST be odd and positive. (3,3) (5,5) (7,7) typical.
# sigmaX=0 -> auto from kernel size; explicit sigma gives more control.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — edges in noisy photo — auto-threshold by image median.
# APPROACH  - Otsu-style: pick lo/hi from the image's median pixel value.
# STRENGTHS - Adapts to bright vs dark images; no magic numbers.
# WEAKNESSES- Single image; doesn't preserve fine textures.
import cv2
import numpy as np


def auto_canny(gray: np.ndarray, sigma: float = 0.33) -> np.ndarray:
    """Canny with thresholds derived from the image median."""
    v = np.median(gray)
    lo = int(max(0,   (1.0 - sigma) * v))
    hi = int(min(255, (1.0 + sigma) * v))
    return cv2.Canny(gray, lo, hi)


img = cv2.imread('photo.jpg', cv2.IMREAD_GRAYSCALE)
blur = cv2.GaussianBlur(img, (5, 5), 1.0)
edges = auto_canny(blur)

cv2.imwrite('edges.jpg', edges)

# Why median-based? Bright images need higher thresholds, dark images lower.
# sigma=0.33 is a popular default (Adrian Rosebrock's "auto Canny").
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — edges in noisy photo — production: bilateral filter
#             to denoise without losing edges, auto-Canny, morphology to
#             close gaps so contours close cleanly.
# APPROACH  - bilateralFilter -> auto-Canny -> dilate -> close.
# STRENGTHS - Edges stay sharp through smoothing; broken edges connect.
# WEAKNESSES- bilateralFilter is ~10x slower than GaussianBlur.
from __future__ import annotations
import cv2
import numpy as np


def auto_canny(gray: np.ndarray, sigma: float = 0.33) -> np.ndarray:
    v = float(np.median(gray))
    return cv2.Canny(gray,
                     int(max(0,   (1 - sigma) * v)),
                     int(min(255, (1 + sigma) * v)))


def edges_for_contours(img_bgr: np.ndarray) -> np.ndarray:
    """Edge map suitable for findContours - closed, single-pixel-wide."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # bilateralFilter: smooth color but preserve sharp edges.
    #   d = neighborhood diameter (5 fast, 9 slow-but-pretty)
    #   sigmaColor / sigmaSpace - larger = more aggressive smoothing
    smooth = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

    edges = auto_canny(smooth, sigma=0.33)

    # Morphology to close 1-2 pixel gaps so contour finding doesn't leak.
    kernel = np.ones((3, 3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

    return edges


img = cv2.imread('photo.jpg')
edges = edges_for_contours(img)
cv2.imwrite('edges.jpg', edges)

# Decision rule:
#   General Gaussian noise           -> GaussianBlur(ksize=(5,5)).
#   Salt-and-pepper noise            -> medianBlur(ksize=5).
#   Need to keep edges sharp         -> bilateralFilter.
#   Need fast denoise + edges        -> GaussianBlur(3,3) -> Canny.
#   Going to findContours next       -> close edges with dilate+CLOSE.
#   Need oriented gradients (HOG)    -> Sobel(dx=1,dy=0) and Sobel(dx=0,dy=1).
#   Single threshold doesn't fit all -> auto_canny via image median.

# Anti-pattern:
#   cv2.Canny(img, 100, 100)           # lo == hi defeats hysteresis
# Canny needs lo < hi (typically lo = 0.5*hi). Equal thresholds = single
# threshold = noisy or missed edges depending on the image.
```

## Decision Rule

```text
General Gaussian noise           -> GaussianBlur(ksize=(5,5)).
Salt-and-pepper noise            -> medianBlur(ksize=5).
Need to keep edges sharp         -> bilateralFilter.
Need fast denoise + edges        -> GaussianBlur(3,3) -> Canny.
Going to findContours next       -> close edges with dilate+CLOSE.
Need oriented gradients (HOG)    -> Sobel(dx=1,dy=0) and Sobel(dx=0,dy=1).
Single threshold doesn't fit all -> auto_canny via image median.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   cv2.Canny(img, 100, 100)           # lo == hi defeats hysteresis
> Canny needs lo < hi (typically lo = 0.5*hi). Equal thresholds = single
> threshold = noisy or missed edges depending on the image.

## Tips

- GaussianBlur kernel must be odd and positive; sigma=0 auto-derives from ksize.
- medianBlur is the right answer for salt-and-pepper noise — Gaussian smears it.
- bilateralFilter preserves edges but is ~10x slower than Gaussian.
- Canny needs two thresholds (hysteresis); the lo:hi ratio of 1:2 or 1:3 is standard.
- auto_canny via image median adapts to image brightness without retuning.

## Common Mistake

> [!warning] Calling Canny on a noisy unblurred image — every pixel of noise becomes an edge. Always blur first.

## See Also

- [[Sections/cv-opencv/filters/cv2-morphology-thresholding|cv2.threshold / cv2.morphologyEx — binarize and clean masks (OpenCV (cv2))]]
- [[Sections/cv-opencv/filters/_Index|OpenCV (cv2) → Blur, edges, morphology, thresholding]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

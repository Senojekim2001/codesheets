---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "filters"
id: "cv2-morphology-thresholding"
title: "cv2.threshold / cv2.morphologyEx — binarize and clean masks"
category: "filters"
subtitle: "cv2.threshold (THRESH_BINARY + THRESH_OTSU), adaptiveThreshold (uneven lighting), getStructuringElement (RECT/ELLIPSE/CROSS), morphologyEx (OPEN/CLOSE/GRADIENT/TOPHAT), kernel size effects"
signature_short: "cv2.threshold(src, thresh, maxval, type) -> (T, dst); cv2.morphologyEx(src, op, kernel)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.threshold / cv2.morphologyEx — binarize and clean masks"
  - "cv2-morphology-thresholding"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/filters"
  - "category/filters"
  - "tier/tiered"
---

# cv2.threshold / cv2.morphologyEx — binarize and clean masks

> cv2.threshold (THRESH_BINARY + THRESH_OTSU), adaptiveThreshold (uneven lighting), getStructuringElement (RECT/ELLIPSE/CROSS), morphologyEx (OPEN/CLOSE/GRADIENT/TOPHAT), kernel size effects

## Overview

Thresholding is the bridge from grayscale to binary masks. Otsu finds the optimal threshold automatically; adaptive thresholding handles uneven lighting (per-pixel local threshold). Morphology operates on a binary image with a structuring element ("kernel"). Open = erode then dilate (kills small white specks). Close = dilate then erode (fills small black holes). Three depths solve the SAME task — clean a thresholded license-plate image — at depths: fixed threshold + open → Otsu + open + close → adaptive threshold + size-filtered components.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Threshold a license plate photo and clean speckle.
- **Junior** — SAME — clean license plate — Otsu auto-threshold + close holes.
- **Senior** — SAME — clean license plate — production: adaptive threshold for uneven lighting, area-filtered components, bounding boxes.

## Signature

```python
cv2.threshold(src, thresh, maxval, type) -> (T, dst); cv2.morphologyEx(src, op, kernel)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Threshold a license plate photo and clean speckle.
# APPROACH  - Fixed threshold + MORPH_OPEN to kill specks.
# STRENGTHS - Fast and direct.
# WEAKNESSES- Fixed threshold breaks under different lighting.
import cv2
import numpy as np

gray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)

# Fixed threshold: pixels >= 127 -> 255, else 0.
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

# OPEN = erode + dilate. Kills isolated white pixels.
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
clean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

cv2.imwrite('plate_clean.png', clean)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — clean license plate — Otsu auto-threshold + close holes.
# APPROACH  - Otsu picks threshold; open then close cleans both directions.
# STRENGTHS - Adapts to image lighting; full mask cleanup.
# WEAKNESSES- Otsu fails when foreground/background histograms overlap.
import cv2
import numpy as np

gray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)

# Otsu auto-picks the best global threshold. Use 0 as the threshold value.
T, binary = cv2.threshold(gray, 0, 255,
                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print(f"Otsu chose threshold = {T}")

# Morphology pipeline:
#   OPEN  removes small white noise   (erode -> dilate)
#   CLOSE fills small black holes      (dilate -> erode)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
clean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
clean = cv2.morphologyEx(clean,  cv2.MORPH_CLOSE, kernel)

cv2.imwrite('plate_clean.png', clean)

# If text is dark on a bright plate, you may want THRESH_BINARY_INV
# so the foreground (text) becomes white = 255.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — clean license plate — production: adaptive threshold
#             for uneven lighting, area-filtered components, bounding boxes.
# APPROACH  - adaptiveThreshold -> open -> connectedComponentsWithStats ->
#             keep only character-shaped blobs.
# STRENGTHS - Robust to glare/shadow; only character glyphs survive.
# WEAKNESSES- More tuning knobs; adaptive params depend on image scale.
from __future__ import annotations
import cv2
import numpy as np


def clean_plate(gray: np.ndarray, *,
                min_area: int = 100,
                max_area: int = 5_000,
                aspect_min: float = 0.2,
                aspect_max: float = 1.0) -> tuple[np.ndarray, list[tuple]]:
    """Clean a plate image and return (binary_mask, list_of_glyph_bboxes)."""

    # Adaptive threshold: per-pixel threshold from a local window.
    # Better than Otsu when lighting varies across the image.
    binary = cv2.adaptiveThreshold(
        gray,
        maxValue=255,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        thresholdType=cv2.THRESH_BINARY_INV,           # text becomes white
        blockSize=21,                                  # must be odd
        C=10,                                          # subtracted from mean
    )

    # Open to kill speckle.
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

    # Connected components with stats - drop blobs by area + aspect.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)

    keep_mask = np.zeros_like(binary)
    bboxes: list[tuple] = []
    for i in range(1, n):                              # 0 is background
        x, y, w, h, area = stats[i]
        aspect = w / max(h, 1)
        if min_area <= area <= max_area and aspect_min <= aspect <= aspect_max:
            keep_mask[labels == i] = 255
            bboxes.append((x, y, w, h))

    return keep_mask, bboxes


gray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)
mask, glyphs = clean_plate(gray)
cv2.imwrite('plate_clean.png', mask)
print(f"found {len(glyphs)} glyph candidates")

# Decision rule:
#   Even lighting + bimodal histogram   -> THRESH_BINARY + THRESH_OTSU.
#   Uneven lighting (shadow, glare)     -> adaptiveThreshold (Gaussian C).
#   Need multi-class (>2 levels)        -> Otsu by levels (Yen) or k-means.
#   Remove small white noise            -> MORPH_OPEN.
#   Fill small black holes              -> MORPH_CLOSE.
#   Both                                 -> OPEN then CLOSE (this order matters).
#   Skeleton / one-pixel-wide           -> ximgproc.thinning (contrib module).

# Anti-pattern:
#   kernel = np.ones((3, 3))           # float64 by default
#   cv2.dilate(img, kernel)             # expects uint8 0/1 - works but
# correct form is np.ones((3,3), np.uint8) or use getStructuringElement.
```

## Decision Rule

```text
Even lighting + bimodal histogram   -> THRESH_BINARY + THRESH_OTSU.
Uneven lighting (shadow, glare)     -> adaptiveThreshold (Gaussian C).
Need multi-class (>2 levels)        -> Otsu by levels (Yen) or k-means.
Remove small white noise            -> MORPH_OPEN.
Fill small black holes              -> MORPH_CLOSE.
Both                                 -> OPEN then CLOSE (this order matters).
Skeleton / one-pixel-wide           -> ximgproc.thinning (contrib module).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   kernel = np.ones((3, 3))           # float64 by default
>   cv2.dilate(img, kernel)             # expects uint8 0/1 - works but
> correct form is np.ones((3,3), np.uint8) or use getStructuringElement.

## Tips

- Otsu auto-thresholds — pass 0 as the manual threshold and OR `THRESH_OTSU` into the type.
- adaptiveThreshold has `blockSize` (odd, controls locality) and `C` (offset from mean) — both need tuning.
- OPEN before CLOSE if you want to denoise then fill; the order matters.
- `connectedComponentsWithStats` is the fast way to filter blobs by area / bbox — don't loop contours.
- MORPH_TOPHAT extracts bright details smaller than the kernel; MORPH_BLACKHAT does the opposite.

## Common Mistake

> [!warning] Using a fixed threshold across an image with uneven lighting. Use `adaptiveThreshold` instead — it computes a local threshold per pixel.

## See Also

- [[Sections/cv-opencv/filters/cv2-blur-edges|cv2.GaussianBlur / cv2.Canny — smoothing and edge detection (OpenCV (cv2))]]
- [[Sections/cv-opencv/filters/_Index|OpenCV (cv2) → Blur, edges, morphology, thresholding]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

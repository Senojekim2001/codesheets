---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "basics"
id: "cv2-color-spaces"
title: "cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)"
category: "cv2 basics"
subtitle: "COLOR_BGR2RGB, COLOR_BGR2GRAY, COLOR_BGR2HSV (H: 0..179, S/V: 0..255 for uint8), COLOR_BGR2LAB, in-range masking for color, hue wrap-around for red"
signature_short: "cv2.cvtColor(src, code) -> dst; cv2.inRange(src, lo, hi) -> mask"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)"
  - "cv2-color-spaces"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/basics"
  - "category/cv2-basics"
  - "tier/tiered"
---

# cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)

> COLOR_BGR2RGB, COLOR_BGR2GRAY, COLOR_BGR2HSV (H: 0..179, S/V: 0..255 for uint8), COLOR_BGR2LAB, in-range masking for color, hue wrap-around for red

## Overview

cvtColor maps between color spaces using flags like `COLOR_BGR2HSV`. HSV is the practical choice for color filtering because hue is one channel — but cv2 packs H into 0..179 (so it fits in uint8), not 0..360. LAB is perceptually uniform — useful for color difference. The three depths solve the SAME task — pick out red pixels from an image — at increasing depths: naive RGB threshold → HSV with inRange → LAB ΔE distance with morphology cleanup.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Pick out red pixels in an image (mask = white where red).
- **Junior** — SAME — mask red pixels — using HSV (the right tool).
- **Senior** — SAME — mask red pixels — production: LAB ΔE distance, morphology cleanup, contour-area filter.

## Signature

```python
cv2.cvtColor(src, code) -> dst; cv2.inRange(src, lo, hi) -> mask
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Pick out red pixels in an image (mask = white where red).
# APPROACH  - Threshold each BGR channel separately.
# STRENGTHS - No color theory needed.
# WEAKNESSES- Brittle: any lighting/shadow change kills it; no hue concept.
import cv2
import numpy as np

img = cv2.imread('apples.jpg')                    # BGR
b, g, r = cv2.split(img)                          # three (H, W) uint8 arrays

# Naive: red is high R, low G, low B.
mask = (r > 150) & (g < 80) & (b < 80)
mask = mask.astype(np.uint8) * 255

cv2.imwrite('red_mask.png', mask)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — mask red pixels — using HSV (the right tool).
# APPROACH  - cvtColor BGR->HSV; inRange around the red hue band.
# STRENGTHS - Lighting-independent; one parameter (hue) per color.
# WEAKNESSES- Red wraps around 0/180 in HSV; need TWO ranges and OR them.
import cv2
import numpy as np

img = cv2.imread('apples.jpg')
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)        # H: 0..179, S/V: 0..255

# Red hue is at 0 AND 180 (wrap-around). Need two inRange calls.
lo1, hi1 = np.array([  0, 100, 50]), np.array([ 10, 255, 255])
lo2, hi2 = np.array([170, 100, 50]), np.array([179, 255, 255])

mask = cv2.inRange(hsv, lo1, hi1) | cv2.inRange(hsv, lo2, hi2)

cv2.imwrite('red_mask_hsv.png', mask)

# Why H ranges to 179 not 359? cv2 stores H/2 to fit in uint8.
# So "60 degrees" on a normal color wheel is 30 in cv2.
# Saturation > 100 filters out grays; Value > 50 filters near-black.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — mask red pixels — production: LAB ΔE distance,
#             morphology cleanup, contour-area filter.
# APPROACH  - LAB color distance from a reference red; clean noise.
# STRENGTHS - Perceptually uniform; single threshold works across lighting;
#             noise is gone after morphology.
# WEAKNESSES- LAB conversion is ~3x slower than HSV; need a reference color.
from __future__ import annotations
import cv2
import numpy as np


def red_mask_lab(img_bgr: np.ndarray, *, delta_e: float = 25.0,
                 min_area: int = 50) -> np.ndarray:
    """Mask red regions using LAB perceptual distance."""
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)

    # Reference "red" in LAB: pure red (255,0,0) -> LAB ~ (54, 81, 70)
    ref = np.array([54.0, 81.0, 70.0], dtype=np.float32)

    # Per-pixel Euclidean distance in LAB space (~ Delta E 76).
    diff = lab - ref
    dist = np.linalg.norm(diff, axis=2)               # (H, W) float32

    mask = (dist < delta_e).astype(np.uint8) * 255

    # Morphology: kill speckle, fill holes.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Drop blobs smaller than min_area.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    keep = np.zeros_like(mask)
    for i in range(1, n):                             # 0 is background
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            keep[labels == i] = 255
    return keep

# Decision rule:
#   Threshold colors                     -> HSV + inRange.
#   Red specifically                     -> HSV with TWO ranges (wrap).
#   Match perceived color across lights  -> LAB + Delta E distance.
#   Need exact RGB equality (UI assets)  -> stay in BGR; np.all(img == c, -1).

# Anti-pattern:
#   img_rgb = cv2.imread(p)            # cv2.imread is BGR not RGB
#   plt.imshow(img_rgb)                # red/blue swapped on screen
# Always cvtColor BGR2RGB before plt.imshow / Pillow.fromarray / PyTorch.
```

## Decision Rule

```text
Threshold colors                     -> HSV + inRange.
Red specifically                     -> HSV with TWO ranges (wrap).
Match perceived color across lights  -> LAB + Delta E distance.
Need exact RGB equality (UI assets)  -> stay in BGR; np.all(img == c, -1).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   img_rgb = cv2.imread(p)            # cv2.imread is BGR not RGB
>   plt.imshow(img_rgb)                # red/blue swapped on screen
> Always cvtColor BGR2RGB before plt.imshow / Pillow.fromarray / PyTorch.

## Tips

- cv2 hue range is 0..179 (H/2), saturation and value 0..255 — different from PIL/HTML 0..360.
- Red wraps hue 0/180 — use two inRange calls and OR the masks.
- LAB distance (Delta E) is the gold standard for "looks the same color" across lighting.
- cv2.split/merge are cheap views, but slicing `img[:,:,0]` is identical and zero-copy.
- Always cvtColor BGR→RGB before passing to matplotlib, PIL, or torchvision transforms.

## Common Mistake

> [!warning] Using RGB hue ranges (0..360) with cv2 — cv2 hue is 0..179. Halve any hue value taken from a Photoshop/CSS color picker.

## See Also

- [[Sections/cv-opencv/basics/cv2-imread-imwrite|cv2.imread / cv2.imwrite — load and save images (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/cv2-pixel-access-roi|Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2] (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/_Index|OpenCV (cv2) → I/O, color spaces, pixel access]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

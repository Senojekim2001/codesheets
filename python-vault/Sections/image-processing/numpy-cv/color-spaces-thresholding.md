---
type: "entry"
domain: "python"
file: "image-processing"
section: "numpy-cv"
id: "color-spaces-thresholding"
title: "Color spaces & thresholding — RGB / HSV / LAB, masks"
category: "NumPy + OpenCV"
subtitle: "cv2.cvtColor BGR ↔ HSV ↔ LAB, cv2.inRange, Otsu cv2.THRESH_OTSU, adaptive thresholding, morphological ops, cv2.bitwise_and"
signature_short: "hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); mask = cv2.inRange(hsv, (0, 100, 100), (10, 255, 255))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Color spaces & thresholding — RGB / HSV / LAB, masks"
  - "color-spaces-thresholding"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/numpy-cv"
  - "category/numpy-opencv"
  - "tier/tiered"
---

# Color spaces & thresholding — RGB / HSV / LAB, masks

> cv2.cvtColor BGR ↔ HSV ↔ LAB, cv2.inRange, Otsu cv2.THRESH_OTSU, adaptive thresholding, morphological ops, cv2.bitwise_and

## Overview

RGB is bad for color filtering — "red" varies wildly with lighting. HSV (Hue, Saturation, Value) separates color from brightness; you can say "hue between 0-10 = red" regardless of how bright. LAB (Luminance, A=green-red, B=blue-yellow) is even more perceptually uniform but less commonly needed. After thresholding, masks always have noise; morphological operations (`open` to remove specks, `close` to fill gaps) clean them up. The three examples solve the SAME concrete task — extract red regions from an image — at three depths: basic HSV inRange → wraparound handling + morphology → LAB color space + lighting-invariant thresholds + when ML segmentation wins.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Extract red regions from an image.
- **Junior** — SAME — but handle the red wrap and clean noise.
- **Senior** — SAME — production: LAB color space (lighting-invariant), when classical color thresholding fails, hybrid with ML.

## Signature

```python
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); mask = cv2.inRange(hsv, (0, 100, 100), (10, 255, 255))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Extract red regions from an image.
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# HSV ranges in OpenCV:
#   H: 0-179 (NOT 0-360! halved to fit in uint8)
#   S: 0-255
#   V: 0-255

# Red wraps around at H=0 — pure red is at H=0 AND H=179.
# This intro version misses the wrap; junior fixes it.
lower_red = np.array([0,   100, 100])                  # H=0-10, S>100, V>100
upper_red = np.array([10,  255, 255])
mask = cv2.inRange(hsv, lower_red, upper_red)

# Apply mask: keep red pixels, black out the rest.
red_only = cv2.bitwise_and(img, img, mask=mask)
cv2.imwrite("red.jpg", red_only)
cv2.imwrite("red_mask.jpg", mask)

# Common HSV ranges (OpenCV uint8 scale):
#   Red:    H 0-10  AND  H 170-179 (wraps)
#   Orange: H 11-25
#   Yellow: H 26-34
#   Green:  H 35-77
#   Blue:   H 100-130
#   Purple: H 131-155
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but handle the red wrap and clean noise.
import cv2
import numpy as np

def red_mask(img: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Red wraps; need TWO ranges and union.
    lower1 = np.array([0,   100, 80])
    upper1 = np.array([10,  255, 255])
    lower2 = np.array([170, 100, 80])
    upper2 = np.array([179, 255, 255])
    mask = cv2.inRange(hsv, lower1, upper1) | cv2.inRange(hsv, lower2, upper2)

    # Morphology: open removes small noise, close fills small gaps.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    return mask

# Find connected components in the cleaned mask.
img = cv2.imread("photo.jpg")
mask = red_mask(img)
n_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)

# stats = [[x, y, w, h, area], ...]; label 0 is background.
for i in range(1, n_labels):
    x, y, w, h, area = stats[i]
    if area < 100: continue                            # ignore tiny specks
    cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
cv2.imwrite("red_detected.jpg", img)

# === Otsu's auto-threshold (for grayscale) ===
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# threshold=0 means "let Otsu pick"; THRESH_OTSU activates the algorithm.
_, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

# === Adaptive thresholding for uneven lighting ===
# Each pixel's threshold = mean of nearby pixels (block_size).
adaptive = cv2.adaptiveThreshold(
    gray, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY,
    blockSize=11,                                       # neighborhood size (odd)
    C=2,                                                # constant subtracted from mean
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: LAB color space (lighting-invariant),
#             when classical color thresholding fails, hybrid with ML.
import cv2
import numpy as np

# === LAB color space ===
# L = Luminance (lightness), A = green-red, B = blue-yellow.
# Threshold on AB (not L) for lighting-invariant color matching.
def red_mask_lab(img: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, A, B = cv2.split(lab)
    # Red has high A (green-red toward red) and roughly neutral B.
    # OpenCV LAB scales: L 0-255, A 0-255 (128 = neutral), B 0-255 (128 = neutral).
    mask = (A > 150) & (np.abs(B.astype(int) - 128) < 30) & (L > 50)
    mask = mask.astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return mask

# === Color histogram for "is this image mostly red?" ===
def dominant_color_score(img: np.ndarray, target_h: int, range_h: int = 10) -> float:
    """Returns fraction of high-saturation pixels with hue near target_h."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sat_mask = hsv[..., 1] > 100                       # only count vivid pixels
    hue = hsv[..., 0]
    target_mask = (np.abs(hue.astype(int) - target_h) < range_h) | \
                  (np.abs(hue.astype(int) - (180 + target_h)) < range_h)  # wrap
    if not sat_mask.any():
        return 0.0
    return float((sat_mask & target_mask).sum()) / float(sat_mask.sum())

# Decision rule:
# Classical color thresholding wins:
#   - Controlled lighting (studio, indoor)
#   - Clear color separation (red apple on green grass)
#   - Real-time / resource-constrained (no GPU)
#   - Interpretable / debuggable
#
# ML segmentation (SAM, DeepLab, U-Net) wins:
#   - Variable / unpredictable lighting
#   - Subtle color differences (pinks vs salmons)
#   - Need semantic understanding (what is a "person", not "skin tone")
#   - Cross-class segmentation (multiple object types)
#
# Hybrid: classical first-pass to filter candidates → ML for hard cases.

# Decision rule:
# Operation / use case                  Tool / approach
# -----------------------------------------------------
# Color-based mask                       HSV inRange (consider wrap)
# Color-based, lighting-invariant        LAB color space
# Brightness threshold                    Otsu (auto) or fixed
# Threshold under uneven lighting         adaptiveThreshold
# Mask cleanup                           morphological open + close
# Find blobs                             connectedComponentsWithStats
# Find shapes / outlines                 findContours
# Pixel-perfect masks                     ML segmentation (SAM, U-Net)
# Background subtraction (video)         cv2.createBackgroundSubtractorMOG2
# Skin tone detection                    YCbCr space + range; OR ML
# Document scan (binary)                 adaptiveThreshold + invert
# Salient object                          cv2.saliency or ML model
# White balance                           cv2.xphoto.createSimpleWB
#
# Anti-pattern: thresholding directly on RGB channels and expecting
# robust color filtering. Lighting changes (sun, shade, indoor)
# move the same physical color across a huge range of RGB values.
# Convert to HSV (or better, LAB) so hue/saturation can be filtered
# independently of brightness.
```

## Decision Rule

```text
Classical color thresholding wins:
  - Controlled lighting (studio, indoor)
  - Clear color separation (red apple on green grass)
  - Real-time / resource-constrained (no GPU)
  - Interpretable / debuggable

ML segmentation (SAM, DeepLab, U-Net) wins:
  - Variable / unpredictable lighting
  - Subtle color differences (pinks vs salmons)
  - Need semantic understanding (what is a "person", not "skin tone")
  - Cross-class segmentation (multiple object types)

Hybrid: classical first-pass to filter candidates → ML for hard cases.
```

## Anti-Pattern

> [!warning] Anti-pattern
> thresholding directly on RGB channels and expecting
> robust color filtering. Lighting changes (sun, shade, indoor)
> move the same physical color across a huge range of RGB values.
> Convert to HSV (or better, LAB) so hue/saturation can be filtered
> independently of brightness.

## Tips

- OpenCV HSV: H is 0-179 (halved from 360 to fit uint8), S and V are 0-255. Cheat sheet ranges in the intro example.
- Red wraps at H=0/179. Always use TWO `inRange` calls and `|` (or) the masks together.
- LAB color space is more perceptually uniform than HSV — better for subtle color differences and skin tones.
- Always follow `inRange` thresholding with morphological `open` (remove noise) + `close` (fill gaps). Raw masks are speckled.
- `Otsu` works when the image has bimodal histogram (clear foreground/background); fails on cluttered scenes.
- `adaptiveThreshold` with `blockSize=11, C=2` is the document-scan recipe — local thresholding survives uneven lighting.

## Common Mistake

> [!warning] Thresholding RGB channels directly for color filtering. Lighting changes move the "same" color across a huge RGB range; your "red detector" works in the studio and fails outdoors. Convert to HSV (or LAB for lighting invariance), then threshold.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Brittle: RGB threshold breaks on any lighting change
mask = (img[..., 2] > 150) & (img[..., 1] < 80) & (img[..., 0] < 80)
```

**Senior:**
```python
# Robust: HSV separates color from brightness
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
mask = cv2.inRange(hsv, (0, 100, 80), (10, 255, 255)) | cv2.inRange(hsv, (170, 100, 80), (179, 255, 255))
```

## See Also

- [[Sections/image-processing/numpy-cv/numpy-image-ops|NumPy image ops — array view, channels, broadcasting (Image Processing)]]
- [[Sections/image-processing/numpy-cv/opencv-basics|OpenCV basics — imread, cvtColor, resize, edges (Image Processing)]]
- [[Sections/image-processing/numpy-cv/_Index|Image Processing → NumPy + OpenCV — pixel ops, color spaces]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

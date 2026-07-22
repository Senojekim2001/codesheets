---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "basics"
id: "cv2-pixel-access-roi"
title: "Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]"
category: "cv2 basics"
subtitle: "img[y, x] -> BGR pixel (3,), img[y1:y2, x1:x2] = ROI view, .copy() for independence, np.ndarray indexing semantics, vectorized region edits"
signature_short: "pixel = img[y, x]; roi = img[y1:y2, x1:x2]; img[mask] = color"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]"
  - "cv2-pixel-access-roi"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/basics"
  - "category/cv2-basics"
  - "tier/tiered"
---

# Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]

> img[y, x] -> BGR pixel (3,), img[y1:y2, x1:x2] = ROI view, .copy() for independence, np.ndarray indexing semantics, vectorized region edits

## Overview

OpenCV images are just NumPy arrays — all NumPy indexing applies. Critical gotcha: indexing is `[row, col]` = `[y, x]` (vertical first), the opposite of mathematical `(x, y)` and the opposite of how cv2 functions (which take `(x, y)` tuples). Slicing returns a view — `roi[:] = 0` zeroes the original. Three depths solve the SAME task — blank out a rectangle and stamp a copy of the top-left corner — at depths: scalar pixel writes → ROI assignment → vectorized boolean mask with bounds check.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Black out a 100x100 rectangle at (x=50, y=30); copy the top-left 100x100 onto position (x=200, y=200).
- **Junior** — SAME — but using NumPy slicing (the right way).
- **Senior** — SAME — robust ROI utilities: bounds-clip, copy or view, paste with alpha blending, mask-based edits.

## Signature

```python
pixel = img[y, x]; roi = img[y1:y2, x1:x2]; img[mask] = color
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Black out a 100x100 rectangle at (x=50, y=30); copy the
#             top-left 100x100 onto position (x=200, y=200).
# APPROACH  - Loop over pixels.
# STRENGTHS - Shows what's happening at the pixel level.
# WEAKNESSES- Glacial in Python; should never do this in real code.
import cv2

img = cv2.imread('photo.jpg')

# Black out 100x100 rectangle starting at (x=50, y=30).
for y in range(30, 130):
    for x in range(50, 150):
        img[y, x] = (0, 0, 0)                         # BGR pixel = black

# Copy top-left 100x100 to (x=200, y=200).
for y in range(100):
    for x in range(100):
        img[200 + y, 200 + x] = img[y, x]

cv2.imwrite('out.jpg', img)
# This works but is ~1000x slower than the slice version below.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but using NumPy slicing (the right way).
# APPROACH  - ROI assignment with [y1:y2, x1:x2].
# STRENGTHS - Vectorized, ~1000x faster, two lines.
# WEAKNESSES- Easy to mistake [y, x] for [x, y]; no bounds checking.
import cv2

img = cv2.imread('photo.jpg')

# Black out 100x100 rectangle at (x=50, y=30).
img[30:130, 50:150] = 0                               # broadcast scalar to all 3 ch

# Copy top-left 100x100 to (x=200, y=200).
# IMPORTANT: .copy() because the slices overlap if dest is inside src.
src_roi = img[0:100, 0:100].copy()
img[200:300, 200:300] = src_roi

cv2.imwrite('out.jpg', img)

# Two slice axes:
#   img.shape == (H, W, C) so img[y, x, c] - row first.
# Two cv2 conventions:
#   cv2.rectangle, cv2.circle, cv2.line - take (x, y) tuples.
#   img[y, x]                            - takes (y, x).
# Forgetting which mode you're in is the #1 cv2 bug. Memorize:
#     "NumPy is row-major (y first); cv2 functions are point-style (x first)."
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — robust ROI utilities: bounds-clip, copy or view,
#             paste with alpha blending, mask-based edits.
# APPROACH  - Helper functions with explicit clipping; broadcast over masks.
# STRENGTHS - Won't crash on out-of-bounds; supports alpha; clear API.
# WEAKNESSES- More LOC; have to think in (y1, x1, y2, x2) consistently.
from __future__ import annotations
import cv2
import numpy as np


def clip_roi(img: np.ndarray, y: int, x: int, h: int, w: int) -> tuple[int, int, int, int]:
    """Clamp (y, x, h, w) so the ROI stays inside img.shape[:2]."""
    H, W = img.shape[:2]
    y0 = max(0, y);          x0 = max(0, x)
    y1 = min(H, y + h);      x1 = min(W, x + w)
    if y0 >= y1 or x0 >= x1:
        raise ValueError(f"ROI ({y},{x},{h},{w}) is outside image {H}x{W}")
    return y0, x0, y1, x1


def fill_rect(img: np.ndarray, y: int, x: int, h: int, w: int,
              color: tuple[int, int, int] = (0, 0, 0)) -> None:
    y0, x0, y1, x1 = clip_roi(img, y, x, h, w)
    img[y0:y1, x0:x1] = color


def paste(dst: np.ndarray, src: np.ndarray, y: int, x: int,
          alpha: np.ndarray | float = 1.0) -> None:
    """Paste src into dst at (y, x). Optional per-pixel alpha (H,W) in [0..1]."""
    h, w = src.shape[:2]
    y0, x0, y1, x1 = clip_roi(dst, y, x, h, w)
    sy0, sx0 = y0 - y, x0 - x
    sy1, sx1 = sy0 + (y1 - y0), sx0 + (x1 - x0)
    src_clip = src[sy0:sy1, sx0:sx1]
    if isinstance(alpha, float) and alpha == 1.0:
        dst[y0:y1, x0:x1] = src_clip
        return
    a = alpha[sy0:sy1, sx0:sx1, None] if isinstance(alpha, np.ndarray) else alpha
    blended = (a * src_clip + (1 - a) * dst[y0:y1, x0:x1]).astype(dst.dtype)
    dst[y0:y1, x0:x1] = blended


def edit_by_mask(img: np.ndarray, mask: np.ndarray,
                 color: tuple[int, int, int]) -> None:
    """Set every pixel where mask>0 to color. Mask is (H,W) uint8."""
    img[mask.astype(bool)] = color

# Decision rule:
#   Single pixel read/write    -> img[y, x] (scalar) - O(1).
#   Rectangular region edit    -> img[y1:y2, x1:x2] = value - vectorized.
#   Arbitrary-shape edit       -> boolean mask: img[mask] = value.
#   Need to keep original safe -> .copy() the slice before mutating.
#   Coords from cv2 functions  -> (x, y);   coords for indexing -> [y, x].

# Anti-pattern:
#   for y in range(H):              # Python loop on pixels
#       for x in range(W):
#           if img[y, x, 0] > 200:
#               img[y, x] = (0,0,0)
# 1000x slower than:
#   img[img[..., 0] > 200] = (0, 0, 0)
# If you find yourself looping over pixels, you're missing a vectorization.
```

## Decision Rule

```text
Single pixel read/write    -> img[y, x] (scalar) - O(1).
Rectangular region edit    -> img[y1:y2, x1:x2] = value - vectorized.
Arbitrary-shape edit       -> boolean mask: img[mask] = value.
Need to keep original safe -> .copy() the slice before mutating.
Coords from cv2 functions  -> (x, y);   coords for indexing -> [y, x].
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for y in range(H):              # Python loop on pixels
>       for x in range(W):
>           if img[y, x, 0] > 200:
>               img[y, x] = (0,0,0)
> 1000x slower than:
>   img[img[..., 0] > 200] = (0, 0, 0)
> If you find yourself looping over pixels, you're missing a vectorization.

## Tips

- Indexing is `[y, x]` (row, col); cv2 drawing functions take `(x, y)` — opposite order. Memorize it.
- Slices are views — `roi[:] = 0` mutates the original. Use `.copy()` when you need independence.
- `img[mask]` where mask is `(H, W)` boolean is the idiom for arbitrary-shape edits.
- For per-pixel work, vectorize with NumPy or call cv2 — Python loops are 100-1000x slower.
- Always clip ROI bounds before slicing — out-of-bounds slices silently truncate (not what you want for paste).

## Common Mistake

> [!warning] Swapping x and y. NumPy indexing is `[y, x]`; cv2 point arguments are `(x, y)`. Mixing them silently flips the operation along the diagonal.

## See Also

- [[Sections/cv-opencv/basics/cv2-imread-imwrite|cv2.imread / cv2.imwrite — load and save images (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/cv2-color-spaces|cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB) (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/_Index|OpenCV (cv2) → I/O, color spaces, pixel access]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

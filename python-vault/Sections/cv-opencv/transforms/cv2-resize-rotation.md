---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "transforms"
id: "cv2-resize-rotation"
title: "cv2.resize / cv2.warpAffine — resize and rotate"
category: "transforms"
subtitle: "cv2.resize ((w,h) order!), INTER_AREA (downscale), INTER_CUBIC/INTER_LANCZOS4 (upscale), getRotationMatrix2D, warpAffine, borderMode (CONSTANT/REFLECT/REPLICATE), bounding-box-aware rotation"
signature_short: "cv2.resize(src, dsize=(w,h), fx=, fy=, interpolation=); cv2.warpAffine(src, M, dsize)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.resize / cv2.warpAffine — resize and rotate"
  - "cv2-resize-rotation"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/transforms"
  - "category/transforms"
  - "tier/tiered"
---

# cv2.resize / cv2.warpAffine — resize and rotate

> cv2.resize ((w,h) order!), INTER_AREA (downscale), INTER_CUBIC/INTER_LANCZOS4 (upscale), getRotationMatrix2D, warpAffine, borderMode (CONSTANT/REFLECT/REPLICATE), bounding-box-aware rotation

## Overview

cv2.resize takes `(width, height)` — the OPPOSITE of every other shape API in cv2/NumPy. Pass `None` for dsize and use `fx`/`fy` for fractional scaling. Interpolation matters: INTER_AREA is the right downscaler (anti-aliased), INTER_CUBIC and INTER_LANCZOS4 are sharper for upscale. Rotation = build a 2x3 affine matrix with `getRotationMatrix2D((cx, cy), angle, scale)` then `warpAffine`. Three depths solve the SAME task — resize to 800px and rotate 30° — at depths: naive resize+rotate (corners clipped) → correct interpolation per direction → bounding-box-aware rotation that grows the canvas to fit.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Resize to 800px wide, then rotate 30 degrees.
- **Junior** — SAME — resize to 800px, rotate 30 deg — with correct interpolation and a sane border fill.
- **Senior** — SAME — resize to 800px, rotate 30 deg — production: canvas grows to fit the rotated bounding box, no clipping, no waste.

## Signature

```python
cv2.resize(src, dsize=(w,h), fx=, fy=, interpolation=); cv2.warpAffine(src, M, dsize)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Resize to 800px wide, then rotate 30 degrees.
# APPROACH  - cv2.resize then warpAffine with default args.
# STRENGTHS - Two lines.
# WEAKNESSES- Default INTER_LINEAR is fine for upscale, BAD for downscale;
#             rotation clips corners (canvas stays the same size).
import cv2

img = cv2.imread('photo.jpg')
h, w = img.shape[:2]

# Resize to width=800, keep aspect.
new_w = 800
new_h = int(h * (new_w / w))
img = cv2.resize(img, (new_w, new_h))                 # (w, h) order!

# Rotate 30 degrees about center.
(cx, cy) = (new_w // 2, new_h // 2)
M = cv2.getRotationMatrix2D((cx, cy), angle=30, scale=1.0)
img = cv2.warpAffine(img, M, (new_w, new_h))          # (w, h) again

cv2.imwrite('out.jpg', img)
# Corners get cut off because the canvas size didn't grow.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — resize to 800px, rotate 30 deg — with correct
#             interpolation and a sane border fill.
# APPROACH  - INTER_AREA for downscale; BORDER_REFLECT to avoid black edges.
# STRENGTHS - No aliasing on downscale; smooth rotated edges.
# WEAKNESSES- Canvas still doesn't grow; corners still clipped.
import cv2

img = cv2.imread('photo.jpg')
h, w = img.shape[:2]

# Pick interpolation by direction:
#   downscale (new < old) -> INTER_AREA  (anti-aliased)
#   upscale   (new > old) -> INTER_CUBIC or INTER_LANCZOS4
new_w = 800
scale = new_w / w
interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)

new_h = img.shape[0]
M = cv2.getRotationMatrix2D((new_w / 2, new_h / 2), 30, 1.0)
img = cv2.warpAffine(
    img, M, (new_w, new_h),
    flags=cv2.INTER_LINEAR,
    borderMode=cv2.BORDER_REFLECT,                    # avoid black wedges
)

cv2.imwrite('out.jpg', img)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — resize to 800px, rotate 30 deg — production: canvas
#             grows to fit the rotated bounding box, no clipping, no waste.
# APPROACH  - Compute new bbox from rotated corners; translate matrix to
#             new origin; warpAffine into the bigger canvas.
# STRENGTHS - Lossless rotation (no clipping); minimal canvas size.
# WEAKNESSES- More math; need to remember the matrix is 2x3 not 3x3.
from __future__ import annotations
import cv2
import numpy as np


def smart_resize(img: np.ndarray, max_side: int) -> np.ndarray:
    h, w = img.shape[:2]
    if max(h, w) <= max_side:
        return img
    scale = max_side / max(h, w)
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LANCZOS4
    return cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)


def rotate_no_clip(img: np.ndarray, angle: float,
                   border: int = cv2.BORDER_REFLECT) -> np.ndarray:
    """Rotate so the full image fits in the output (canvas grows)."""
    h, w = img.shape[:2]
    cx, cy = w / 2.0, h / 2.0

    # Affine rotation matrix.
    M = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)

    # Compute the new bounding box dimensions.
    cos = abs(M[0, 0])
    sin = abs(M[0, 1])
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)

    # Translate the matrix so the rotated image is centered in the new canvas.
    M[0, 2] += (new_w / 2.0) - cx
    M[1, 2] += (new_h / 2.0) - cy

    return cv2.warpAffine(img, M, (new_w, new_h),
                          flags=cv2.INTER_LINEAR, borderMode=border)


img = cv2.imread('photo.jpg')
img = smart_resize(img, 800)
img = rotate_no_clip(img, 30)
cv2.imwrite('out.jpg', img)

# Decision rule:
#   Downscale            -> INTER_AREA.
#   Upscale (real photo) -> INTER_CUBIC (fast) or INTER_LANCZOS4 (sharp).
#   Upscale (line art)   -> INTER_NEAREST (preserves hard edges).
#   Rotation tiny angle  -> warpAffine into same canvas is fine.
#   Rotation big angle   -> grow canvas (above) or use rotate() if 90/180/270.
#   Pure 90/180/270      -> cv2.rotate(img, ROTATE_90_CLOCKWISE) - faster, no interp.

# Anti-pattern:
#   cv2.resize(img, (h, w))      # passing (height, width) instead of (w, h)
# Image comes back transposed-looking - aspect ratio destroyed. cv2.resize
# is the ONE place in cv2 where "size" is (w, h), not (h, w).
```

## Decision Rule

```text
Downscale            -> INTER_AREA.
Upscale (real photo) -> INTER_CUBIC (fast) or INTER_LANCZOS4 (sharp).
Upscale (line art)   -> INTER_NEAREST (preserves hard edges).
Rotation tiny angle  -> warpAffine into same canvas is fine.
Rotation big angle   -> grow canvas (above) or use rotate() if 90/180/270.
Pure 90/180/270      -> cv2.rotate(img, ROTATE_90_CLOCKWISE) - faster, no interp.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   cv2.resize(img, (h, w))      # passing (height, width) instead of (w, h)
> Image comes back transposed-looking - aspect ratio destroyed. cv2.resize
> is the ONE place in cv2 where "size" is (w, h), not (h, w).

## Tips

- cv2.resize takes `(width, height)` — opposite of `img.shape` which is `(height, width, channels)`.
- INTER_AREA is the only correct downscaler — INTER_LINEAR aliases on shrink.
- 90°/180°/270° rotations should use `cv2.rotate` (no interpolation, faster).
- For lossless rotation, grow the canvas based on cos/sin of the angle.
- Use `cv2.warpAffine` for any 2x3 transform; `cv2.warpPerspective` for 3x3 homographies.

## Common Mistake

> [!warning] Using INTER_LINEAR to downscale — produces aliasing. Use INTER_AREA when shrinking.

## See Also

- [[Sections/cv-opencv/transforms/cv2-perspective-warp|cv2.getPerspectiveTransform / warpPerspective — deskew documents (OpenCV (cv2))]]
- [[Sections/cv-opencv/transforms/_Index|OpenCV (cv2) → Geometric transforms — resize, rotate, warp]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

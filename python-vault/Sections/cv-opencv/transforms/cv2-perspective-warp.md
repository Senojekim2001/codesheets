---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "transforms"
id: "cv2-perspective-warp"
title: "cv2.getPerspectiveTransform / warpPerspective — deskew documents"
category: "transforms"
subtitle: "getPerspectiveTransform (4 src + 4 dst points), warpPerspective (3x3 matrix vs 2x3 affine), corner ordering convention (TL, TR, BR, BL), document deskew pipeline"
signature_short: "M = cv2.getPerspectiveTransform(src_pts, dst_pts); cv2.warpPerspective(img, M, (w, h))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.getPerspectiveTransform / warpPerspective — deskew documents"
  - "cv2-perspective-warp"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/transforms"
  - "category/transforms"
  - "tier/tiered"
---

# cv2.getPerspectiveTransform / warpPerspective — deskew documents

> getPerspectiveTransform (4 src + 4 dst points), warpPerspective (3x3 matrix vs 2x3 affine), corner ordering convention (TL, TR, BR, BL), document deskew pipeline

## Overview

Perspective warp maps any quadrilateral to any other quadrilateral via a 3x3 homography. The classic use is "scan a photo of a document": detect the 4 corners of the page in the photo, map them to a clean rectangle. Three depths solve the SAME task — deskew a 4-corner document — at increasing depths: hardcoded corner points → user-clicked corners with sorting → automatic corner detection via contour finding + corner sorting.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Deskew a document photo when you already know the 4 corners.
- **Junior** — SAME — deskew a document — but accept user-clicked corners in any order and sort them automatically.
- **Senior** — SAME — deskew a document — production: auto-detect the page edges with contours, choose the largest 4-corner contour, warp to corrected aspect.

## Signature

```python
M = cv2.getPerspectiveTransform(src_pts, dst_pts); cv2.warpPerspective(img, M, (w, h))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Deskew a document photo when you already know the 4 corners.
# APPROACH  - getPerspectiveTransform + warpPerspective.
# STRENGTHS - Direct; teaches the 4-point pattern.
# WEAKNESSES- Hardcoded points; assumes you know corner order.
import cv2
import numpy as np

img = cv2.imread('document.jpg')

# 4 source points in the photo (TL, TR, BR, BL order).
src = np.float32([[110, 95], [610, 80], [640, 880], [80, 870]])

# 4 destination points - a clean A4-ish rectangle.
W, H = 600, 800
dst = np.float32([[0, 0], [W, 0], [W, H], [0, H]])

M = cv2.getPerspectiveTransform(src, dst)
flat = cv2.warpPerspective(img, M, (W, H))

cv2.imwrite('document_flat.jpg', flat)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — deskew a document — but accept user-clicked corners
#             in any order and sort them automatically.
# APPROACH  - Sort 4 points to (TL, TR, BR, BL); auto-size output by edge length.
# STRENGTHS - Robust to click order; output keeps document aspect.
# WEAKNESSES- Still need user clicks; no auto-detect.
import cv2
import numpy as np


def order_corners(pts: np.ndarray) -> np.ndarray:
    """Sort 4 (x,y) points into (TL, TR, BR, BL) order."""
    pts = pts.reshape(4, 2)
    s = pts.sum(axis=1)                               # x + y
    d = np.diff(pts, axis=1).flatten()                # y - x
    return np.float32([
        pts[np.argmin(s)],                            # TL = min sum
        pts[np.argmin(d)],                            # TR = min diff
        pts[np.argmax(s)],                            # BR = max sum
        pts[np.argmax(d)],                            # BL = max diff
    ])


def four_point_warp(img: np.ndarray, pts: np.ndarray) -> np.ndarray:
    src = order_corners(pts)
    (tl, tr, br, bl) = src

    # Output size = average of opposite edges (preserves document aspect).
    width  = int(max(np.linalg.norm(br - bl), np.linalg.norm(tr - tl)))
    height = int(max(np.linalg.norm(tr - br), np.linalg.norm(tl - bl)))

    dst = np.float32([[0, 0], [width - 1, 0],
                      [width - 1, height - 1], [0, height - 1]])

    M = cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(img, M, (width, height))


img = cv2.imread('document.jpg')
clicks = np.array([[610, 80], [80, 870], [110, 95], [640, 880]])  # any order
flat = four_point_warp(img, clicks)
cv2.imwrite('document_flat.jpg', flat)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — deskew a document — production: auto-detect the page
#             edges with contours, choose the largest 4-corner contour,
#             warp to corrected aspect.
# APPROACH  - Edge detection -> largest contour -> approxPolyDP to 4 pts -> warp.
# STRENGTHS - Zero user input; works for any rectangular document on contrast.
# WEAKNESSES- Fails if document edges blend into background; need fallback.
from __future__ import annotations
import cv2
import numpy as np


def order_corners(pts: np.ndarray) -> np.ndarray:
    pts = pts.reshape(4, 2)
    s, d = pts.sum(1), np.diff(pts, axis=1).flatten()
    return np.float32([pts[np.argmin(s)], pts[np.argmin(d)],
                       pts[np.argmax(s)], pts[np.argmax(d)]])


def find_document_corners(img: np.ndarray) -> np.ndarray | None:
    """Find the largest 4-corner contour. None if not found."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150)

    # Dilate so broken edges connect.
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4 and cv2.contourArea(c) > 0.1 * img.size:
            return approx
    return None


def deskew(img: np.ndarray) -> np.ndarray:
    corners = find_document_corners(img)
    if corners is None:
        return img                                    # fallback: original

    src = order_corners(corners)
    (tl, tr, br, bl) = src
    W = int(max(np.linalg.norm(br - bl), np.linalg.norm(tr - tl)))
    H = int(max(np.linalg.norm(tr - br), np.linalg.norm(tl - bl)))
    dst = np.float32([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]])
    M = cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(img, M, (W, H))

# Decision rule:
#   Map 2D plane -> 2D plane (rotate/scale/skew, no perspective)
#       -> warpAffine (2x3 matrix).
#   Need to flatten a quadrilateral to a rectangle (perspective)
#       -> getPerspectiveTransform + warpPerspective (3x3).
#   Stitch panoramas / match scenes
#       -> findHomography(RANSAC) instead of getPerspectiveTransform.
#   Need to undo lens distortion BEFORE deskew
#       -> cv2.undistort with calibration matrix first.

# Anti-pattern:
#   warpAffine with a homography matrix       # silently drops the perspective row
# warpAffine takes 2x3, warpPerspective takes 3x3. Using affine when the
# transform has any depth distortion gives a wrong-but-plausible result.
```

## Decision Rule

```text
Map 2D plane -> 2D plane (rotate/scale/skew, no perspective)
    -> warpAffine (2x3 matrix).
Need to flatten a quadrilateral to a rectangle (perspective)
    -> getPerspectiveTransform + warpPerspective (3x3).
Stitch panoramas / match scenes
    -> findHomography(RANSAC) instead of getPerspectiveTransform.
Need to undo lens distortion BEFORE deskew
    -> cv2.undistort with calibration matrix first.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   warpAffine with a homography matrix       # silently drops the perspective row
> warpAffine takes 2x3, warpPerspective takes 3x3. Using affine when the
> transform has any depth distortion gives a wrong-but-plausible result.

## Tips

- getPerspectiveTransform needs exactly 4 src and 4 dst points in matching order.
- Order corners as (TL, TR, BR, BL) — the standard convention.
- For panorama/scene matching where points are noisy, use `findHomography(RANSAC)` instead of `getPerspectiveTransform`.
- Output size should match the longest edges to preserve document aspect.
- `approxPolyDP` collapses a contour to a polygon — if you get exactly 4 vertices, you found a quadrilateral.

## Common Mistake

> [!warning] Passing a 3x3 homography to `warpAffine` (which only reads the top 2 rows). Use `warpPerspective` for any non-affine transform.

## See Also

- [[Sections/cv-opencv/transforms/cv2-resize-rotation|cv2.resize / cv2.warpAffine — resize and rotate (OpenCV (cv2))]]
- [[Sections/cv-opencv/transforms/_Index|OpenCV (cv2) → Geometric transforms — resize, rotate, warp]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

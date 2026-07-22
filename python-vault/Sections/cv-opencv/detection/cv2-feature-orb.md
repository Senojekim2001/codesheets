---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "detection"
id: "cv2-feature-orb"
title: "cv2.ORB / cv2.BFMatcher — keypoint matching for scenes"
category: "detection"
subtitle: "ORB.create(nfeatures=), detectAndCompute, BFMatcher(NORM_HAMMING, crossCheck=False), knnMatch + Lowe ratio (m.distance < 0.75 * n.distance), findHomography(RANSAC), perspectiveTransform for box mapping"
signature_short: "orb = cv2.ORB_create(); kp, des = orb.detectAndCompute(gray, None); BFMatcher.knnMatch(des1, des2, k=2)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.ORB / cv2.BFMatcher — keypoint matching for scenes"
  - "cv2-feature-orb"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/detection"
  - "category/detection"
  - "tier/tiered"
---

# cv2.ORB / cv2.BFMatcher — keypoint matching for scenes

> ORB.create(nfeatures=), detectAndCompute, BFMatcher(NORM_HAMMING, crossCheck=False), knnMatch + Lowe ratio (m.distance < 0.75 * n.distance), findHomography(RANSAC), perspectiveTransform for box mapping

## Overview

ORB (Oriented FAST + Rotated BRIEF) is patent-free and fast. Pipeline: detect+describe both images → BFMatcher with Hamming distance → knnMatch k=2 → Lowe ratio test (keep matches where best is ≪ second-best) → findHomography(RANSAC) to get a robust geometric mapping. Three depths solve the SAME task — find a logo in a scene photo and outline it — at depths: brute-force matching with crossCheck → Lowe ratio test for quality → RANSAC homography to draw the outline of the matched object.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find a logo in a scene photo and visualize the matches.
- **Junior** — SAME — match logo in scene — Lowe ratio test for quality.
- **Senior** — SAME — match logo in scene — production: ratio test + RANSAC homography + draw the outline of the logo onto the scene.

## Signature

```python
orb = cv2.ORB_create(); kp, des = orb.detectAndCompute(gray, None); BFMatcher.knnMatch(des1, des2, k=2)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find a logo in a scene photo and visualize the matches.
# APPROACH  - ORB keypoints + BFMatcher with crossCheck.
# STRENGTHS - Two-image matching with one matcher; ~30 lines.
# WEAKNESSES- crossCheck alone leaves bad matches; no geometric verification.
import cv2

logo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)
scene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)

orb = cv2.ORB_create(nfeatures=1000)
kp1, des1 = orb.detectAndCompute(logo,  None)
kp2, des2 = orb.detectAndCompute(scene, None)

# Hamming distance for binary descriptors (ORB/BRISK).
matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
matches = matcher.match(des1, des2)
matches = sorted(matches, key=lambda m: m.distance)[:30]

vis = cv2.drawMatches(logo, kp1, scene, kp2, matches, None,
                      flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv2.imwrite('matches.jpg', vis)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — match logo in scene — Lowe ratio test for quality.
# APPROACH  - knnMatch k=2; keep m where m.distance < 0.75 * n.distance.
# STRENGTHS - Filters out ambiguous matches; cleaner correspondences.
# WEAKNESSES- Doesn't verify geometric consistency.
import cv2

logo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)
scene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)

orb = cv2.ORB_create(nfeatures=2000, scaleFactor=1.2)
kp1, des1 = orb.detectAndCompute(logo,  None)
kp2, des2 = orb.detectAndCompute(scene, None)

# crossCheck=False because we'll do Lowe's ratio test instead.
matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
knn = matcher.knnMatch(des1, des2, k=2)

# Lowe's ratio test: keep matches where the best is much better than 2nd-best.
good = [m for m, n in knn if m.distance < 0.75 * n.distance]
print(f"{len(good)} good matches out of {len(knn)} candidates")

vis = cv2.drawMatches(logo, kp1, scene, kp2, good, None,
                      flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
cv2.imwrite('matches.jpg', vis)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — match logo in scene — production: ratio test + RANSAC
#             homography + draw the outline of the logo onto the scene.
# APPROACH  - Lowe ratio -> findHomography(RANSAC) -> perspectiveTransform
#             on the logo's corner box.
# STRENGTHS - Robust to outliers; outputs the warped logo region.
# WEAKNESSES- Needs >= 4 inlier correspondences after RANSAC.
from __future__ import annotations
import cv2
import numpy as np


def find_object(
    template: np.ndarray, scene: np.ndarray, *,
    nfeatures: int = 2000,
    ratio: float = 0.75,
    min_inliers: int = 10,
) -> tuple[np.ndarray | None, int]:
    """Return (4x2 corner array of template in scene, num_inliers) or (None, 0)."""
    orb = cv2.ORB_create(nfeatures=nfeatures, scaleFactor=1.2)
    kp1, des1 = orb.detectAndCompute(template, None)
    kp2, des2 = orb.detectAndCompute(scene,    None)
    if des1 is None or des2 is None:
        return None, 0

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    knn = bf.knnMatch(des1, des2, k=2)
    good = [m for m, n in knn if m.distance < ratio * n.distance]
    if len(good) < min_inliers:
        return None, 0

    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    if H is None:
        return None, 0
    inliers = int(mask.sum())
    if inliers < min_inliers:
        return None, inliers

    h, w = template.shape[:2]
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
    warped = cv2.perspectiveTransform(corners, H).reshape(-1, 2)
    return warped, inliers


logo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)
scene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)

box, n = find_object(logo, scene)
out = cv2.cvtColor(scene, cv2.COLOR_GRAY2BGR)
if box is not None:
    cv2.polylines(out, [np.int32(box)], True, (0, 255, 0), 3)
    cv2.putText(out, f"inliers={n}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
cv2.imwrite('found.jpg', out)

# Decision rule:
#   Same scene, no rotation, fixed scale          -> matchTemplate.
#   Different angles, mild occlusion              -> ORB + ratio test.
#   Need geometric outline of the matched object  -> add findHomography(RANSAC).
#   Stitch panoramas                              -> SIFT (now patent-free) or AKAZE.
#   Real-time on a Raspberry Pi                   -> ORB (binary descriptors are fast).
#   Detect categories not specific instances      -> use a DNN, not features.

# Anti-pattern:
#   crossCheck=True AND knnMatch              # mutually exclusive
# crossCheck only makes sense for .match() (1-NN). With knnMatch you do
# the ratio test instead. Pick one or the other - never both.
```

## Decision Rule

```text
Same scene, no rotation, fixed scale          -> matchTemplate.
Different angles, mild occlusion              -> ORB + ratio test.
Need geometric outline of the matched object  -> add findHomography(RANSAC).
Stitch panoramas                              -> SIFT (now patent-free) or AKAZE.
Real-time on a Raspberry Pi                   -> ORB (binary descriptors are fast).
Detect categories not specific instances      -> use a DNN, not features.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   crossCheck=True AND knnMatch              # mutually exclusive
> crossCheck only makes sense for .match() (1-NN). With knnMatch you do
> the ratio test instead. Pick one or the other - never both.

## Tips

- ORB descriptors are binary — match with `NORM_HAMMING`, not `NORM_L2`.
- Lowe's ratio test (0.7-0.8) filters ambiguous matches. Without it, half the matches are noise.
- crossCheck=True works with `.match()` (one-NN). Use crossCheck=False with `knnMatch` + ratio test.
- After ratio filtering, run `findHomography(RANSAC)` — it discards geometric outliers.
- For panorama stitching, SIFT (patent-free since 2020) or AKAZE generally beat ORB.

## Common Mistake

> [!warning] Skipping the ratio test or RANSAC. Raw ORB matches contain ~50% noise; without filtering, the homography is garbage.

## See Also

- [[Sections/cv-opencv/detection/cv2-template-matching|cv2.matchTemplate — find a known image inside another (OpenCV (cv2))]]
- [[Sections/cv-opencv/detection/_Index|OpenCV (cv2) → Template, feature, and contour detection]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

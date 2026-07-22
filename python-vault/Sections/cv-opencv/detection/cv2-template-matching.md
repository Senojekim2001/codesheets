---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "detection"
id: "cv2-template-matching"
title: "cv2.matchTemplate — find a known image inside another"
category: "detection"
subtitle: "matchTemplate (TM_CCOEFF_NORMED), minMaxLoc, multi-match thresholding (np.where), non-max suppression, scale invariance via image pyramids"
signature_short: "cv2.matchTemplate(image, templ, method) -> result; cv2.minMaxLoc(result)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.matchTemplate — find a known image inside another"
  - "cv2-template-matching"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/detection"
  - "category/detection"
  - "tier/tiered"
---

# cv2.matchTemplate — find a known image inside another

> matchTemplate (TM_CCOEFF_NORMED), minMaxLoc, multi-match thresholding (np.where), non-max suppression, scale invariance via image pyramids

## Overview

Template matching computes a similarity score at every position of the template within the image. TM_CCOEFF_NORMED is the right method (normalized correlation, range -1 to +1). For a single best match, `minMaxLoc` finds the peak; for multiple, threshold the score map and apply non-max suppression. Three depths solve the SAME task — find every appearance of an icon — at depths: single best with minMaxLoc → all above threshold (no NMS, gets duplicates) → thresholded + NMS + multi-scale via image pyramid for robustness.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find a single best match of an icon inside a screenshot.
- **Junior** — SAME — find every appearance of an icon — multi-match.
- **Senior** — SAME — find every instance of an icon — production: multi-scale (image pyramid) + non-max suppression + score-ranked.

## Signature

```python
cv2.matchTemplate(image, templ, method) -> result; cv2.minMaxLoc(result)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find a single best match of an icon inside a screenshot.
# APPROACH  - matchTemplate + minMaxLoc.
# STRENGTHS - One match, three lines.
# WEAKNESSES- Only finds ONE; no scale invariance.
import cv2

screen = cv2.imread('screen.png',  cv2.IMREAD_GRAYSCALE)
icon   = cv2.imread('icon.png',    cv2.IMREAD_GRAYSCALE)
h, w = icon.shape

result = cv2.matchTemplate(screen, icon, cv2.TM_CCOEFF_NORMED)
_, max_val, _, max_loc = cv2.minMaxLoc(result)        # max for CCOEFF_NORMED

print(f"best match: score={max_val:.2f} at {max_loc}")
x, y = max_loc
cv2.rectangle(screen, (x, y), (x + w, y + h), 255, 2)
cv2.imwrite('found.png', screen)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — find every appearance of an icon — multi-match.
# APPROACH  - matchTemplate -> threshold the score map -> np.where for coords.
# STRENGTHS - Finds all instances above similarity threshold.
# WEAKNESSES- Adjacent matches show up as clusters of duplicates (no NMS).
import cv2
import numpy as np

screen = cv2.imread('screen.png', cv2.IMREAD_GRAYSCALE)
icon   = cv2.imread('icon.png',   cv2.IMREAD_GRAYSCALE)
h, w = icon.shape

result = cv2.matchTemplate(screen, icon, cv2.TM_CCOEFF_NORMED)

THRESH = 0.85
ys, xs = np.where(result >= THRESH)
points = list(zip(xs, ys))                            # (x, y) pairs
print(f"found {len(points)} candidate matches above {THRESH}")

# Note: matches near each other are duplicates of the same instance.
# A 50x50 icon with no NMS will produce ~10 hits per real instance.
out = cv2.cvtColor(screen, cv2.COLOR_GRAY2BGR)
for x, y in points:
    cv2.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
cv2.imwrite('found.png', out)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — find every instance of an icon — production:
#             multi-scale (image pyramid) + non-max suppression + score-ranked.
# APPROACH  - For each scale, matchTemplate; collect (x,y,w,h,score); NMS.
# STRENGTHS - Robust to mild scale changes; one rectangle per real instance.
# WEAKNESSES- Slower (one matchTemplate per scale); no rotation invariance.
from __future__ import annotations
import cv2
import numpy as np


def nms(boxes: np.ndarray, scores: np.ndarray, iou_thresh: float = 0.4) -> list[int]:
    """Greedy NMS on (N,4) xywh boxes. Returns kept indices."""
    x1, y1 = boxes[:, 0], boxes[:, 1]
    x2, y2 = x1 + boxes[:, 2], y1 + boxes[:, 3]
    areas = boxes[:, 2] * boxes[:, 3]

    order = scores.argsort()[::-1]                    # high score first
    keep = []
    while order.size:
        i = order[0]; keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]]); yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]]); yy2 = np.minimum(y2[i], y2[order[1:]])
        inter = np.maximum(0, xx2 - xx1) * np.maximum(0, yy2 - yy1)
        iou = inter / (areas[i] + areas[order[1:]] - inter)
        order = order[1:][iou < iou_thresh]
    return keep


def find_template_multiscale(
    screen: np.ndarray, template: np.ndarray, *,
    scales: tuple[float, ...] = (0.75, 0.85, 1.0, 1.15, 1.3),
    score_thresh: float = 0.85,
    iou_thresh: float = 0.4,
) -> list[tuple[int, int, int, int, float]]:
    """Return list of (x, y, w, h, score) after multi-scale NMS."""
    boxes, scores = [], []

    for s in scales:
        tw, th = max(1, int(template.shape[1] * s)), max(1, int(template.shape[0] * s))
        if tw >= screen.shape[1] or th >= screen.shape[0]:
            continue
        templ = cv2.resize(template, (tw, th), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
        result = cv2.matchTemplate(screen, templ, cv2.TM_CCOEFF_NORMED)
        ys, xs = np.where(result >= score_thresh)
        for x, y in zip(xs, ys):
            boxes.append((x, y, tw, th))
            scores.append(float(result[y, x]))

    if not boxes:
        return []
    boxes_arr = np.asarray(boxes, dtype=np.float32)
    scores_arr = np.asarray(scores, dtype=np.float32)
    keep = nms(boxes_arr, scores_arr, iou_thresh)
    return [(*boxes[i], scores[i]) for i in keep]


screen = cv2.imread('screen.png', cv2.IMREAD_GRAYSCALE)
icon   = cv2.imread('icon.png',   cv2.IMREAD_GRAYSCALE)
hits = find_template_multiscale(screen, icon, score_thresh=0.85)

out = cv2.cvtColor(screen, cv2.COLOR_GRAY2BGR)
for (x, y, w, h, s) in hits:
    cv2.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(out, f"{s:.2f}", (x, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
cv2.imwrite('found.png', out)

# Decision rule:
#   Single instance, fixed scale, fixed orientation -> matchTemplate + minMaxLoc.
#   Multiple instances, fixed scale                 -> threshold + NMS.
#   Mild scale variance                             -> image pyramid + NMS.
#   Rotation or large scale variance                -> feature-based (ORB/SIFT) or DNN.
#   Real-world objects (cats, cars, faces)          -> use a pretrained DNN, not matchTemplate.

# Anti-pattern:
#   matchTemplate + minMaxLoc when multiple matches exist
# Returns ONLY the global max - the other 9 instances are silently dropped.
# Always np.where + NMS for multi-instance cases.
```

## Decision Rule

```text
Single instance, fixed scale, fixed orientation -> matchTemplate + minMaxLoc.
Multiple instances, fixed scale                 -> threshold + NMS.
Mild scale variance                             -> image pyramid + NMS.
Rotation or large scale variance                -> feature-based (ORB/SIFT) or DNN.
Real-world objects (cats, cars, faces)          -> use a pretrained DNN, not matchTemplate.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   matchTemplate + minMaxLoc when multiple matches exist
> Returns ONLY the global max - the other 9 instances are silently dropped.
> Always np.where + NMS for multi-instance cases.

## Tips

- TM_CCOEFF_NORMED is the right method — invariant to mean brightness, range [-1, +1].
- For multi-match, threshold the result map and apply non-max suppression — minMaxLoc only returns the single best.
- Template matching has zero scale or rotation invariance — use an image pyramid for ±20% scale tolerance.
- For rotation, real scale variance, or texture variation, switch to feature matching (ORB/SIFT) or a DNN detector.
- Score thresholds are scene-dependent — start at 0.85, tune from there.

## Common Mistake

> [!warning] Using `minMaxLoc` when there are multiple instances — it returns only the single best, silently dropping the rest.

## See Also

- [[Sections/cv-opencv/detection/cv2-feature-orb|cv2.ORB / cv2.BFMatcher — keypoint matching for scenes (OpenCV (cv2))]]
- [[Sections/cv-opencv/detection/_Index|OpenCV (cv2) → Template, feature, and contour detection]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

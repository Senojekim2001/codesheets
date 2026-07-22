---
type: "entry"
domain: "python"
file: "image-processing"
section: "numpy-cv"
id: "opencv-basics"
title: "OpenCV basics — imread, cvtColor, resize, edges"
category: "NumPy + OpenCV"
subtitle: "cv2.imread, cv2.imwrite, BGR ↔ RGB via cvtColor, cv2.resize INTER_AREA, cv2.GaussianBlur, cv2.Canny, headless opencv-python-headless"
signature_short: "img = cv2.imread(\"in.jpg\"); edges = cv2.Canny(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 100, 200)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OpenCV basics — imread, cvtColor, resize, edges"
  - "opencv-basics"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/numpy-cv"
  - "category/numpy-opencv"
  - "tier/tiered"
---

# OpenCV basics — imread, cvtColor, resize, edges

> cv2.imread, cv2.imwrite, BGR ↔ RGB via cvtColor, cv2.resize INTER_AREA, cv2.GaussianBlur, cv2.Canny, headless opencv-python-headless

## Overview

OpenCV is the production toolkit for "real" computer vision: edge detection, contours, optical flow, feature matching, video. Two install variants: `opencv-python` (with GUI/highgui — for desktop) and `opencv-python-headless` (no GUI deps — for servers/Docker; what you usually want). Default channel order is BGR (legacy), so converting to RGB before display or saving with PIL is required. The three examples solve the SAME concrete task — load, detect edges, save — at three depths: basic Canny pipeline → tuned blur+threshold → production with parameter sweep, video frames, GPU optional.

## Signature

```python
img = cv2.imread("in.jpg"); edges = cv2.Canny(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 100, 200)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# pip install opencv-python-headless    (NOT opencv-python on servers)
import cv2

img = cv2.imread("input.jpg")                          # (H, W, 3) BGR uint8
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, threshold1=100, threshold2=200)
cv2.imwrite("edges.jpg", edges)

# imread quirks:
#   imread("missing.jpg") returns None — no exception. CHECK.
#   if img is None: raise FileNotFoundError("can't read")
#
#   imread("photo.heic") fails on some platforms; HEIC needs extra deps.

# Convert to RGB for matplotlib / PIL:
import matplotlib.pyplot as plt
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.show()

# Common ops (one-liners):
blurred  = cv2.GaussianBlur(img, (5, 5), 0)            # kernel (5, 5), sigma=0 (auto)
resized  = cv2.resize(img, (640, 480), interpolation=cv2.INTER_AREA)
flipped  = cv2.flip(img, 1)                            # 0 vertical, 1 horizontal, -1 both
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with proper preprocessing for clean edges.
import cv2
import numpy as np

def detect_edges(in_path: str, out_path: str,
                 *, low: int = 50, high: int = 150) -> None:
    img = cv2.imread(in_path)
    if img is None:
        raise FileNotFoundError(in_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)      # smooth before edges; reduces noise
    edges = cv2.Canny(blurred, low, high)
    cv2.imwrite(out_path, edges)

detect_edges("photo.jpg", "edges.jpg")

# === Auto-tune Canny thresholds ===
def auto_canny(img_gray: np.ndarray, sigma: float = 0.33) -> np.ndarray:
    """Use median to set thresholds — works across lighting conditions."""
    v = np.median(img_gray)
    low  = int(max(0, (1 - sigma) * v))
    high = int(min(255, (1 + sigma) * v))
    return cv2.Canny(img_gray, low, high)

# === Find contours from edges ===
def find_shapes(img_path: str) -> list:
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)
    edges = cv2.Canny(blurred, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return contours

# Draw contours on original:
contours = find_shapes("doc.jpg")
img = cv2.imread("doc.jpg")
cv2.drawContours(img, contours, -1, (0, 255, 0), 2)
cv2.imwrite("annotated.jpg", img)

# === Resize: pick the right interpolation ===
# Downscale: cv2.INTER_AREA (best for shrinking)
# Upscale:   cv2.INTER_CUBIC (good) or cv2.INTER_LANCZOS4 (best, slower)
# Default:   INTER_LINEAR (fast, mediocre)
small = cv2.resize(img, (640, 480), interpolation=cv2.INTER_AREA)
big   = cv2.resize(img, (3840, 2160), interpolation=cv2.INTER_CUBIC)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: video frame loop, headless install,
#             when GPU helps.
import cv2
from pathlib import Path

# === Process every frame of a video ===
def edges_in_video(in_path: str, out_path: str) -> int:
    cap = cv2.VideoCapture(in_path)
    if not cap.isOpened():
        raise FileNotFoundError(in_path)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    writer = cv2.VideoWriter(out_path, fourcc, fps, (w, h), isColor=False)

    n = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)
        edges = cv2.Canny(blurred, 50, 150)
        writer.write(edges)
        n += 1

    cap.release()
    writer.release()
    return n

# === GPU acceleration (if you have CUDA + cv2 built with CUDA) ===
def has_cuda() -> bool:
    try:
        return cv2.cuda.getCudaEnabledDeviceCount() > 0
    except Exception:
        return False

def gpu_canny(img_path: str, out_path: str) -> None:
    """Faster Canny on big images / many images. Most cv2 wheels lack CUDA;
    you have to build from source for it."""
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if has_cuda():
        gpu_mat = cv2.cuda_GpuMat()
        gpu_mat.upload(gray)
        canny = cv2.cuda.createCannyEdgeDetector(50, 150)
        edges_gpu = canny.detect(gpu_mat)
        edges = edges_gpu.download()
    else:
        edges = cv2.Canny(gray, 50, 150)
    cv2.imwrite(out_path, edges)

# Decision rule:
# Operation                          PIL/numpy      cv2           Best for
# -----------------------------------------------------------------------
# Load/save                          Pillow          cv2.imread     PIL: more formats; cv2: faster on big files
# Resize (downscale)                  PIL.LANCZOS     INTER_AREA     cv2 ~2-3x faster
# Gaussian blur                       scipy.ndimage   GaussianBlur   cv2 ~5-10x faster
# Edge detection                      np.gradient     Canny          cv2 — Canny is the standard
# Contour finding                     scipy           findContours   cv2 — better, well-tested
# Video frames                         not supported   VideoCapture   cv2 only
# GUI display                          not built-in    imshow         cv2 (or matplotlib)
# Color space conversion               manual          cvtColor       cv2 — many built-in spaces
# Affine warp                          PIL.transform   warpAffine     cv2 — much faster
# Real-time / video                    no              yes            cv2
# Easier API for one-off transforms   PIL             cv2            PIL — more pythonic
#
#   server / Docker                     -> opencv-python-headless (no Qt/GTK deps)
#   desktop with display                -> opencv-python
#   GPU                                  -> source-build cv2 with CUDA; or use specialized libs
#   image-only ops                       -> PIL is often simpler
#   video                                 -> cv2 always
#   need contours / features              -> cv2
#   need feature detectors (SIFT, ORB)    -> cv2.SIFT_create / cv2.ORB_create
#
# Anti-pattern: installing opencv-python on a headless server. Pulls
# in Qt/GTK/X11 deps you don't need; image is 100MB+ larger; can fail
# at import time when the display environment is missing. Use
# opencv-python-headless on servers, Docker, Lambda, CI.
```

## Decision Rule

```text
Operation                          PIL/numpy      cv2           Best for
-----------------------------------------------------------------------
Load/save                          Pillow          cv2.imread     PIL: more formats; cv2: faster on big files
Resize (downscale)                  PIL.LANCZOS     INTER_AREA     cv2 ~2-3x faster
Gaussian blur                       scipy.ndimage   GaussianBlur   cv2 ~5-10x faster
Edge detection                      np.gradient     Canny          cv2 — Canny is the standard
Contour finding                     scipy           findContours   cv2 — better, well-tested
Video frames                         not supported   VideoCapture   cv2 only
GUI display                          not built-in    imshow         cv2 (or matplotlib)
Color space conversion               manual          cvtColor       cv2 — many built-in spaces
Affine warp                          PIL.transform   warpAffine     cv2 — much faster
Real-time / video                    no              yes            cv2
Easier API for one-off transforms   PIL             cv2            PIL — more pythonic

  server / Docker                     -> opencv-python-headless (no Qt/GTK deps)
  desktop with display                -> opencv-python
  GPU                                  -> source-build cv2 with CUDA; or use specialized libs
  image-only ops                       -> PIL is often simpler
  video                                 -> cv2 always
  need contours / features              -> cv2
  need feature detectors (SIFT, ORB)    -> cv2.SIFT_create / cv2.ORB_create
```

## Anti-Pattern

> [!warning] Anti-pattern
> installing opencv-python on a headless server. Pulls
> in Qt/GTK/X11 deps you don't need; image is 100MB+ larger; can fail
> at import time when the display environment is missing. Use
> opencv-python-headless on servers, Docker, Lambda, CI.

## Tips

- Install `opencv-python-headless` on servers/Docker (no Qt/GTK deps; ~100MB smaller). Use `opencv-python` only on desktops where you need `cv2.imshow`.
- OpenCV uses BGR by default. Convert before display/save with PIL or matplotlib: `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)`.
- `cv2.imread()` returns `None` (not an exception) when the file is missing or unreadable. Always check `if img is None`.
- For resize: `INTER_AREA` is best for downscaling, `INTER_CUBIC` or `INTER_LANCZOS4` for upscaling, `INTER_LINEAR` is the fast default.
- Canny edge thresholds depend on image content. `auto_canny` (median-based) adapts across lighting; manual tuning is for fixed-domain workflows.
- For SIFT, SURF, ORB feature detection use `cv2.SIFT_create()`, `cv2.ORB_create()`. SIFT was patented but the patent expired in 2020.

## Common Mistake

> [!warning] Installing `opencv-python` on a headless server. It pulls in Qt/GTK/X11 dependencies you don't need (~100MB extra), can fail at import time when there's no display, and bloats Docker images. Use `opencv-python-headless` on servers, Docker, Lambda, CI.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Heavy install with GUI deps; can fail in headless containers
pip install opencv-python
```

**Senior:**
```python
# Headless variant — same API, no GUI deps
pip install opencv-python-headless
```

## See Also

- [[Sections/image-processing/numpy-cv/numpy-image-ops|NumPy image ops — array view, channels, broadcasting (Image Processing)]]
- [[Sections/image-processing/numpy-cv/color-spaces-thresholding|Color spaces & thresholding — RGB / HSV / LAB, masks (Image Processing)]]
- [[Sections/image-processing/numpy-cv/_Index|Image Processing → NumPy + OpenCV — pixel ops, color spaces]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

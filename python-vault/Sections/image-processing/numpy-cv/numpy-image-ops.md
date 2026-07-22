---
type: "entry"
domain: "python"
file: "image-processing"
section: "numpy-cv"
id: "numpy-image-ops"
title: "NumPy image ops — array view, channels, broadcasting"
category: "NumPy + OpenCV"
subtitle: "np.array(img), Image.fromarray, dtype=uint8 vs float, channel order, slicing, broadcasting, np.clip"
signature_short: "arr = np.array(img); arr[..., 0] = 0   # zero out red channel"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "NumPy image ops — array view, channels, broadcasting"
  - "numpy-image-ops"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/numpy-cv"
  - "category/numpy-opencv"
  - "tier/tiered"
---

# NumPy image ops — array view, channels, broadcasting

> np.array(img), Image.fromarray, dtype=uint8 vs float, channel order, slicing, broadcasting, np.clip

## Overview

For pixel-level arithmetic — channel manipulation, blending, custom filters — Pillow images convert to/from numpy arrays with `np.array(img)` and `Image.fromarray(arr)`. Shape is `(H, W)` for grayscale or `(H, W, 3)`/`(H, W, 4)` for color. Critical: dtype is `uint8` (0-255); arithmetic that overflows wraps. Always cast to `int16` or `float32` before computing, then clip back to `uint8`. The three examples solve the SAME concrete task — blend two images at 50% opacity AND threshold a grayscale image — at three depths: basic array ops → dtype handling + per-channel ops → vectorized batch with memory-efficient streaming.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Blend two images at 50%; threshold a grayscale.
- **Junior** — SAME — but proper dtype handling + per-channel ops + clipping.
- **Senior** — SAME — production: vectorized batch processing, memory estimate, comparison with cv2 for the same op.

## Signature

```python
arr = np.array(img); arr[..., 0] = 0   # zero out red channel
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Blend two images at 50%; threshold a grayscale.
import numpy as np
from PIL import Image

a = np.array(Image.open("a.jpg"))                     # (H, W, 3) uint8
b = np.array(Image.open("b.jpg").resize((a.shape[1], a.shape[0])))

# Blend (BUG: integer overflow if values > 255 mid-calculation)
# blend = (a + b) // 2                                 # WRONG — uint8 wraps; cast first
blend = ((a.astype(np.int16) + b.astype(np.int16)) // 2).astype(np.uint8)
Image.fromarray(blend).save("blend.jpg")

# Threshold a grayscale image:
gray = np.array(Image.open("photo.jpg").convert("L"))  # (H, W) uint8
binary = (gray > 128).astype(np.uint8) * 255           # 0 or 255
Image.fromarray(binary).save("binary.jpg")

# === Channel manipulation ===
img = np.array(Image.open("photo.jpg"))               # (H, W, 3) RGB
# Zero out the red channel:
img[..., 0] = 0
# Swap red and blue:
img = img[..., [2, 1, 0]]                              # but cv2.cvtColor is faster

# Common shape gotchas:
#   (H, W, 3) RGB        - PIL default; matplotlib expects this
#   (H, W, 3) BGR        - OpenCV default; cv2.cvtColor to convert
#   (H, W)               - grayscale
#   (H, W, 4) RGBA       - PNG with alpha
#   (3, H, W)            - PyTorch convention; transpose with .transpose(2, 0, 1)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but proper dtype handling + per-channel ops + clipping.
import numpy as np
from PIL import Image

def blend(a_path: str, b_path: str, alpha: float = 0.5) -> Image.Image:
    """Blend a + b with given alpha (0-1)."""
    a = np.array(Image.open(a_path).convert("RGB")).astype(np.float32)
    b = np.array(Image.open(b_path).convert("RGB").resize(
        (a.shape[1], a.shape[0]))).astype(np.float32)
    out = a * alpha + b * (1 - alpha)
    out = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(out)

# Per-channel saturation boost (HSV-style, in RGB space):
def boost_saturation(img: Image.Image, factor: float = 1.3) -> Image.Image:
    arr = np.array(img.convert("RGB")).astype(np.float32)
    # Mean across channels = grayscale equivalent.
    gray = arr.mean(axis=2, keepdims=True)
    # Pull channels away from gray by 'factor'.
    arr = gray + (arr - gray) * factor
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

# Channel-wise threshold (e.g., extract red regions):
def red_mask(img: Image.Image) -> np.ndarray:
    arr = np.array(img.convert("RGB"))
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    # Red = high R, low G, low B.
    return (r > 150) & (g < 100) & (b < 100)           # (H, W) bool

mask = red_mask(Image.open("photo.jpg"))
print(f"Red pixels: {mask.sum()} / {mask.size}")

# === Memory-efficient: process in tiles for huge images ===
def downscale_tiled(img: Image.Image, scale: int = 2) -> Image.Image:
    """For very large images, downscale one tile at a time."""
    w, h = img.size
    out = Image.new(img.mode, (w // scale, h // scale))
    tile = 512                                          # process 512x512 chunks
    for y in range(0, h, tile * scale):
        for x in range(0, w, tile * scale):
            box = (x, y, min(x + tile * scale, w), min(y + tile * scale, h))
            crop = img.crop(box)
            crop.thumbnail((tile, tile), Image.LANCZOS)
            out.paste(crop, (x // scale, y // scale))
    return out
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: vectorized batch processing, memory
#             estimate, comparison with cv2 for the same op.
import numpy as np
from PIL import Image
from pathlib import Path

# === Batch blend N images against a reference ===
def batch_blend_vs_reference(
    image_paths: list[Path],
    reference_path: Path,
    alpha: float = 0.5,
    out_dir: Path = Path("blended"),
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    ref = np.array(Image.open(reference_path).convert("RGB")).astype(np.float32)
    H, W, _ = ref.shape

    for p in image_paths:
        img = Image.open(p).convert("RGB").resize((W, H))
        arr = np.array(img).astype(np.float32)
        out = np.clip(arr * alpha + ref * (1 - alpha), 0, 255).astype(np.uint8)
        Image.fromarray(out).save(out_dir / p.name, "JPEG", quality=88)

# === Memory math ===
# A (H, W, 3) uint8 array uses H * W * 3 bytes.
#   1080p:    ~6 MB
#   4K:       ~24 MB
#   12 MP:    ~36 MB
# Float32 is 4x larger:
#   12 MP float32: ~144 MB (single image during processing)
# Estimate before allocating; for huge images, work in tiles.

# === When to reach for cv2 instead ===
# Operation                  numpy + PIL    cv2          Notes
# ---------------------------------------------------------------
# Channel arithmetic         fast            fast         numpy is fine
# Resize                      LANCZOS          INTER_AREA    cv2 INTER_AREA is best for downscale
# Gaussian blur               scipy.ndimage    cv2.GaussianBlur  cv2 is 5-10x faster
# Edge detection              numpy.gradient   cv2.Canny    cv2 is the standard
# Affine transforms           PIL              cv2.warpAffine    cv2 is faster
# Video frames                NOT applicable   cv2.VideoCapture  PIL doesn't do video
# Connected components        scipy            cv2.connectedComponents  cv2 is faster
#
# Decision rule:
#   per-pixel arithmetic                  -> numpy on (H, W, C) arrays
#   integer overflow risk                  -> cast to int16 or float32 before math
#   final output                           -> clip to 0-255, cast back to uint8
#   PyTorch / TF input                      -> transpose to (C, H, W); normalize to [0, 1]
#   large image, OOM risk                  -> tile-based processing
#   need a fast filter (blur, edge)         -> cv2 (next entry)
#   need resize for ML preprocessing        -> cv2.resize INTER_AREA for downscale
#   batch processing                         -> stack into (N, H, W, C) array; vectorize
#   color space conversion                   -> cv2.cvtColor (next entry); faster than manual
#   want PIL operations on a numpy array    -> Image.fromarray; add overhead but cleaner
#
# Anti-pattern: doing arithmetic on uint8 arrays without casting.
#   blend = (a + b) // 2
# uint8 + uint8 wraps modulo 256; (200 + 100) becomes 44, not 300/2.
# Cast to int16 or float32 before any arithmetic that could exceed 255.
```

## Decision Rule

```text
per-pixel arithmetic                  -> numpy on (H, W, C) arrays
integer overflow risk                  -> cast to int16 or float32 before math
final output                           -> clip to 0-255, cast back to uint8
PyTorch / TF input                      -> transpose to (C, H, W); normalize to [0, 1]
large image, OOM risk                  -> tile-based processing
need a fast filter (blur, edge)         -> cv2 (next entry)
need resize for ML preprocessing        -> cv2.resize INTER_AREA for downscale
batch processing                         -> stack into (N, H, W, C) array; vectorize
color space conversion                   -> cv2.cvtColor (next entry); faster than manual
want PIL operations on a numpy array    -> Image.fromarray; add overhead but cleaner
```

## Anti-Pattern

> [!warning] Anti-pattern
> doing arithmetic on uint8 arrays without casting.
>   blend = (a + b) // 2
> uint8 + uint8 wraps modulo 256; (200 + 100) becomes 44, not 300/2.
> Cast to int16 or float32 before any arithmetic that could exceed 255.

## Tips

- `np.array(img)` returns a copy (Pillow → numpy); `Image.fromarray(arr)` does the reverse. Round-trip overhead is small (no decode/encode).
- uint8 arithmetic WRAPS (modulo 256). Cast to int16 or float32 BEFORE any add/multiply, then `np.clip(arr, 0, 255).astype(np.uint8)` at the end.
- PIL is RGB; OpenCV is BGR. Convert with `cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)` or `arr[..., ::-1]` (slower but stdlib).
- For PyTorch input, transpose `(H, W, C) → (C, H, W)` with `arr.transpose(2, 0, 1)` and normalize to `[0, 1]`.
- Memory: a 4K RGB image is 24 MB as uint8, 96 MB as float32. For 12 MP photos, work in float16 or tiles to avoid OOM.
- For ML preprocessing pipelines (resize, normalize, channel-shuffle), `albumentations` or `torchvision.transforms.v2` is faster than hand-rolled numpy.

## Common Mistake

> [!warning] Arithmetic on uint8 arrays without casting: `(a + b) // 2`. uint8 wraps modulo 256, so `200 + 100` becomes `44` (not `300`), and the average comes out wrong. Cast to int16 or float32 first; clip and cast back at the end.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Wraps; produces garbled output
blend = (a + b) // 2
```

**Senior:**
```python
# Cast → math → clip → cast back
blend = ((a.astype(np.int16) + b.astype(np.int16)) // 2).astype(np.uint8)
```

## See Also

- [[Sections/image-processing/numpy-cv/opencv-basics|OpenCV basics — imread, cvtColor, resize, edges (Image Processing)]]
- [[Sections/image-processing/numpy-cv/color-spaces-thresholding|Color spaces & thresholding — RGB / HSV / LAB, masks (Image Processing)]]
- [[Sections/image-processing/numpy-cv/_Index|Image Processing → NumPy + OpenCV — pixel ops, color spaces]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

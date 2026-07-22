---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "basics"
id: "cv2-imread-imwrite"
title: "cv2.imread / cv2.imwrite — load and save images"
category: "cv2 basics"
subtitle: "cv2.imread (flags: IMREAD_COLOR/GRAYSCALE/UNCHANGED), shape (H,W,3), BGR vs RGB, cv2.imwrite (encodes by extension: .jpg/.png/.webp), JPEG quality, PNG compression, Unicode paths via np.fromfile + cv2.imdecode"
signature_short: "cv2.imread(path, flags=cv2.IMREAD_COLOR) -> np.ndarray | None; cv2.imwrite(path, img, params)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.imread / cv2.imwrite — load and save images"
  - "cv2-imread-imwrite"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/basics"
  - "category/cv2-basics"
  - "tier/tiered"
---

# cv2.imread / cv2.imwrite — load and save images

> cv2.imread (flags: IMREAD_COLOR/GRAYSCALE/UNCHANGED), shape (H,W,3), BGR vs RGB, cv2.imwrite (encodes by extension: .jpg/.png/.webp), JPEG quality, PNG compression, Unicode paths via np.fromfile + cv2.imdecode

## Overview

cv2.imread is the entry point: returns a `(H, W, 3)` uint8 ndarray in **BGR** order (legacy from the C++ days when BGR matched Windows bitmaps). Returns `None` for missing/corrupt files — never raises. cv2.imwrite picks encoder from extension. Three depths solve the SAME task — load image, convert to grayscale, save — at increasing depths: minimal imread/imwrite → robust None-check + IMREAD_UNCHANGED for alpha → batched processing with Unicode paths via np.fromfile/imdecode and quality params.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load an image, convert to grayscale, save it.
- **Junior** — SAME — load, grayscale, save — with proper error handling and JPEG quality control.
- **Senior** — SAME — load, grayscale, save — production: Unicode paths, 16-bit depth preserved, batched, atomic writes.

## Signature

```python
cv2.imread(path, flags=cv2.IMREAD_COLOR) -> np.ndarray | None; cv2.imwrite(path, img, params)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load an image, convert to grayscale, save it.
# APPROACH  - imread with default BGR -> cvtColor -> imwrite.
# STRENGTHS - Two function calls.
# WEAKNESSES- No error handling; assumes path exists; assumes ASCII path.
import cv2

img = cv2.imread('photo.jpg')                    # shape (H, W, 3), BGR uint8
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)     # shape (H, W),    uint8

cv2.imwrite('photo_gray.jpg', gray)

print(img.shape, img.dtype)                       # (H, W, 3) uint8
print(gray.shape, gray.dtype)                     # (H, W)    uint8

# imread returns BGR (NOT RGB). If you display with matplotlib:
#     plt.imshow(img)  ->  colors look wrong (red/blue swapped)
# Convert first:
#     plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — load, grayscale, save — with proper error handling
#             and JPEG quality control.
# APPROACH  - Check None, choose flag, set encode params.
# STRENGTHS - Catches missing/corrupt files; respects alpha; tunes quality.
# WEAKNESSES- Still ASCII-only path; no batching.
import cv2
from pathlib import Path

src = Path('photo.jpg')

# Read with explicit flag:
#   IMREAD_COLOR     (default) - drop alpha, force 3-channel BGR
#   IMREAD_GRAYSCALE          - decode straight to single channel
#   IMREAD_UNCHANGED          - keep alpha (4 channels) and 16-bit depth
img = cv2.imread(str(src), cv2.IMREAD_COLOR)

if img is None:
    raise FileNotFoundError(f"cv2 could not read {src!r} (missing or unsupported format)")

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Encode params per format:
#   JPEG: cv2.IMWRITE_JPEG_QUALITY  (0..100, default 95)
#   PNG : cv2.IMWRITE_PNG_COMPRESSION (0..9, default 3)
#   WEBP: cv2.IMWRITE_WEBP_QUALITY (1..101, lossless at 101)
ok = cv2.imwrite(
    'photo_gray.jpg',
    gray,
    [cv2.IMWRITE_JPEG_QUALITY, 90],
)
if not ok:
    raise RuntimeError("cv2.imwrite failed (bad path or encoder)")

# Tip: imread can also load straight to grayscale in one call -
#       cv2.imread(src, cv2.IMREAD_GRAYSCALE)
# That avoids decoding 3 channels just to throw 2 away.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — load, grayscale, save — production: Unicode paths,
#             16-bit depth preserved, batched, atomic writes.
# APPROACH  - np.fromfile + imdecode (Unicode-safe) ; imencode + tobytes.
# STRENGTHS - Handles non-ASCII paths (Windows!); preserves bit depth;
#             atomic via tmp+rename; batchable with map().
# WEAKNESSES- More code; need to know the byte-buffer pattern.
from __future__ import annotations
import cv2
import numpy as np
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor


def imread_unicode(path: Path, flags: int = cv2.IMREAD_UNCHANGED) -> np.ndarray:
    """Unicode-safe read - cv2.imread on Windows mangles non-ASCII paths."""
    data = np.fromfile(str(path), dtype=np.uint8)
    img = cv2.imdecode(data, flags)
    if img is None:
        raise RuntimeError(f"decode failed for {path!r}")
    return img


def imwrite_unicode(path: Path, img: np.ndarray, params: list[int] | None = None) -> None:
    """Unicode-safe + atomic write."""
    ext = path.suffix or '.png'
    ok, buf = cv2.imencode(ext, img, params or [])
    if not ok:
        raise RuntimeError(f"encode failed for {path!r}")
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_bytes(buf.tobytes())
    tmp.replace(path)                                  # atomic on POSIX & NTFS


def to_gray_preserve_depth(img: np.ndarray) -> np.ndarray:
    """cvtColor handles uint8 / uint16 / float32 - keeps dtype."""
    if img.ndim == 2:
        return img
    if img.shape[2] == 4:                              # BGRA
        return cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)


def process_one(src: Path, dst_dir: Path) -> Path:
    img = imread_unicode(src)                          # may be 8-bit or 16-bit
    gray = to_gray_preserve_depth(img)
    out = dst_dir / f"{src.stem}_gray{src.suffix}"
    params = [cv2.IMWRITE_JPEG_QUALITY, 92] if src.suffix.lower() in {'.jpg', '.jpeg'} else []
    imwrite_unicode(out, gray, params)
    return out


def batch(srcs: list[Path], dst_dir: Path, workers: int = 4) -> list[Path]:
    dst_dir.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        return list(ex.map(lambda p: process_one(p, dst_dir), srcs))

# Decision rule:
#   ASCII paths + uint8 only       -> cv2.imread / cv2.imwrite are fine.
#   Unicode paths (Windows, i18n)  -> np.fromfile + cv2.imdecode (above).
#   16-bit medical/RAW/HDR         -> IMREAD_UNCHANGED + don't cvtColor to uint8.
#   Need atomic guarantees         -> imencode -> tmp -> rename.

# Anti-pattern:
#   if cv2.imread(path):  ...   # WRONG - returns ndarray; truthiness on
#                                 ndarray raises ValueError. Use 'is None'.
```

## Decision Rule

```text
ASCII paths + uint8 only       -> cv2.imread / cv2.imwrite are fine.
Unicode paths (Windows, i18n)  -> np.fromfile + cv2.imdecode (above).
16-bit medical/RAW/HDR         -> IMREAD_UNCHANGED + don't cvtColor to uint8.
Need atomic guarantees         -> imencode -> tmp -> rename.
```

## Anti-Pattern

> [!warning] Anti-pattern
> if cv2.imread(path):  ...   # WRONG - returns ndarray; truthiness on
>                               ndarray raises ValueError. Use 'is None'.

## Tips

- cv2.imread returns BGR; convert to RGB before passing to matplotlib, Pillow, or PyTorch transforms.
- imread returns None on failure — never raises. Always check `if img is None`.
- np.fromfile + cv2.imdecode is the Unicode-safe replacement on Windows.
- IMREAD_UNCHANGED preserves alpha (4ch) and 16-bit depth — use it for medical/HDR/PNG with transparency.
- cv2.imwrite picks the codec from the extension; pass params via `[FLAG, value, FLAG, value]` flat list.

## Common Mistake

> [!warning] Treating cv2 arrays as RGB. They are BGR. Pass through `cv2.COLOR_BGR2RGB` before any non-cv2 library.

## See Also

- [[Sections/cv-opencv/basics/cv2-color-spaces|cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB) (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/cv2-pixel-access-roi|Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2] (OpenCV (cv2))]]
- [[Sections/cv-opencv/basics/_Index|OpenCV (cv2) → I/O, color spaces, pixel access]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

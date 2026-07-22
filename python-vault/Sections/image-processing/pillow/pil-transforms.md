---
type: "entry"
domain: "python"
file: "image-processing"
section: "pillow"
id: "pil-transforms"
title: "Pillow transforms — rotate, crop, fit, autocontrast"
category: "Pillow"
subtitle: "rotate(expand=True), crop, ImageOps.fit, ImageOps.contain, ImageOps.autocontrast, transpose, paste with alpha mask"
signature_short: "img = ImageOps.fit(img, (W, H), method=Image.LANCZOS, centering=(0.5, 0.5))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pillow transforms — rotate, crop, fit, autocontrast"
  - "pil-transforms"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/pillow"
  - "category/pillow"
  - "tier/tiered"
---

# Pillow transforms — rotate, crop, fit, autocontrast

> rotate(expand=True), crop, ImageOps.fit, ImageOps.contain, ImageOps.autocontrast, transpose, paste with alpha mask

## Overview

Beyond resize, you usually need: rotate (with `expand=True` so the canvas grows), crop-to-aspect (square thumbnails from arbitrary ratios), tone correction (autocontrast). `ImageOps` collects the high-level helpers; `Image` has the lower-level methods. The three examples solve the SAME concrete task — produce a 600×400 hero image from any input (any aspect, any orientation) — at three depths: rotate + resize → ImageOps.fit for crop-to-aspect → production with autocontrast + tone mapping + content-aware crop.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Produce a 600x400 hero from an arbitrary input.
- **Junior** — SAME — but crop-to-aspect (cover semantics) so we don't stretch.
- **Senior** — SAME — production: autocontrast for consistent tone, content-aware horizontal crop centering, batch helper.

## Signature

```python
img = ImageOps.fit(img, (W, H), method=Image.LANCZOS, centering=(0.5, 0.5))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Produce a 600x400 hero from an arbitrary input.
from PIL import Image

img = Image.open("input.jpg")
img = img.rotate(-90, expand=True)                    # rotate 90° clockwise; canvas grows
img = img.resize((600, 400), Image.LANCZOS)           # exact size; STRETCHES if aspect differs
img.save("hero.jpg", quality=85)

# Problems:
#   resize((600, 400)) stretches non-4:3 inputs into 4:3. A square
#   selfie becomes squashed. Junior tier uses ImageOps.fit for
#   crop-to-aspect.

# rotate(angle, expand=True/False):
#   expand=False (default): canvas size unchanged; corners may clip
#   expand=True: canvas grows to fit rotated image (with empty fill)
# Most rotations want expand=True.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but crop-to-aspect (cover semantics) so we don't stretch.
from PIL import Image, ImageOps

def make_hero(in_path: str, out_path: str, size: tuple[int, int] = (600, 400)) -> None:
    img = Image.open(in_path)
    img = ImageOps.exif_transpose(img)                # fix phone orientation
    if img.mode != "RGB":
        img = img.convert("RGB")

    # ImageOps.fit = "cover": crop to aspect, then resize to exact size.
    # centering=(0.5, 0.5) is centered; (0.5, 0.0) crops bottom (hero often has subject at top).
    img = ImageOps.fit(img, size, method=Image.LANCZOS, centering=(0.5, 0.5))

    img.save(out_path, "JPEG", quality=85, optimize=True)

make_hero("portrait.jpg", "hero.jpg")

# Comparison:
#   img.resize((600, 400))             - stretches (aspect ratios mismatch)
#   ImageOps.contain(img, (600, 400))  - "contain": fits inside; pads or leaves whitespace
#   ImageOps.fit(img, (600, 400))      - "cover": crops to fill; no whitespace
#   ImageOps.pad(img, (600, 400))      - explicit pad; control color via color= kwarg

# Common rotations:
#   img.transpose(Image.FLIP_LEFT_RIGHT)
#   img.transpose(Image.FLIP_TOP_BOTTOM)
#   img.transpose(Image.ROTATE_90)        # 90° counterclockwise; faster than rotate()
#   img.transpose(Image.ROTATE_180)
#   img.transpose(Image.ROTATE_270)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: autocontrast for consistent tone,
#             content-aware horizontal crop centering, batch helper.
from PIL import Image, ImageOps, ImageStat
from pathlib import Path
from typing import Literal

def make_hero(
    in_path: str,
    out_path: str,
    *,
    size: tuple[int, int] = (600, 400),
    auto_tone: bool = True,
    centering: Literal["center", "rule_of_thirds_top", "salient"] = "center",
) -> None:
    img = Image.open(in_path)
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Content-aware vertical centering: heroes often have subject in upper third.
    cy = {"center": 0.5, "rule_of_thirds_top": 0.33, "salient": 0.5}[centering]
    cx = 0.5

    if centering == "salient":
        cx, cy = _saliency_center(img)                # see below

    img = ImageOps.fit(img, size, method=Image.LANCZOS, centering=(cx, cy))

    if auto_tone:
        # Stretch histogram so darkest pixel is black, brightest is white.
        # cutoff=2 ignores extreme 2% of pixels (avoids over-correcting on dust).
        img = ImageOps.autocontrast(img, cutoff=2)

    img.save(out_path, "JPEG", quality=85, optimize=True, progressive=True)

def _saliency_center(img: Image.Image) -> tuple[float, float]:
    """Cheap saliency: find brightest region; assume subject is there.
    Better: use opencv saliency or a pretrained model (vision-modern entry)."""
    gray = img.convert("L")
    small = gray.resize((32, 32))
    pixels = list(small.getdata())
    w, h = small.size
    total = sum(pixels)
    if total == 0:
        return 0.5, 0.5
    cx_acc = sum(pixels[i] * (i % w) for i in range(w * h)) / total
    cy_acc = sum(pixels[i] * (i // w) for i in range(w * h)) / total
    return cx_acc / w, cy_acc / h

# === Batch helper ===
def batch_heroes(input_dir: Path, output_dir: Path, *, size=(600, 400)) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    n = 0
    for p in input_dir.rglob("*.jpg"):
        try:
            make_hero(str(p), str(output_dir / p.name), size=size)
            n += 1
        except Exception as e:
            print(f"FAIL {p.name}: {e}")
    return n

# Decision rule:
#   exact size with stretch OK            -> img.resize((W, H), Image.LANCZOS)
#   exact size, crop to fill              -> ImageOps.fit(img, (W, H), method=LANCZOS)
#   fit inside, allow whitespace          -> ImageOps.contain(img, (W, H))
#   fit inside, pad to exact size         -> ImageOps.pad(img, (W, H), color=(0,0,0))
#   rotate by angle                        -> img.rotate(deg, expand=True)
#   90/180/270 only                        -> img.transpose(Image.ROTATE_90) — much faster
#   tonal correction                        -> ImageOps.autocontrast(img, cutoff=2)
#   grayscale                              -> ImageOps.grayscale(img) OR img.convert("L")
#   invert                                  -> ImageOps.invert(img.convert("RGB"))
#   high-quality content-aware crop         -> use ML saliency or face detection (next entries)
#
# Anti-pattern: rotate(deg) without expand=True for non-90° angles.
# Default expand=False keeps the original canvas size, so corners
# get clipped. The user wonders why "the rotated image got cropped".
# Always pass expand=True unless you specifically want the original
# bounding box.
```

## Decision Rule

```text
exact size with stretch OK            -> img.resize((W, H), Image.LANCZOS)
exact size, crop to fill              -> ImageOps.fit(img, (W, H), method=LANCZOS)
fit inside, allow whitespace          -> ImageOps.contain(img, (W, H))
fit inside, pad to exact size         -> ImageOps.pad(img, (W, H), color=(0,0,0))
rotate by angle                        -> img.rotate(deg, expand=True)
90/180/270 only                        -> img.transpose(Image.ROTATE_90) — much faster
tonal correction                        -> ImageOps.autocontrast(img, cutoff=2)
grayscale                              -> ImageOps.grayscale(img) OR img.convert("L")
invert                                  -> ImageOps.invert(img.convert("RGB"))
high-quality content-aware crop         -> use ML saliency or face detection (next entries)
```

## Anti-Pattern

> [!warning] Anti-pattern
> rotate(deg) without expand=True for non-90° angles.
> Default expand=False keeps the original canvas size, so corners
> get clipped. The user wonders why "the rotated image got cropped".
> Always pass expand=True unless you specifically want the original
> bounding box.

## Tips

- `ImageOps.fit` is "cover" semantics — crops to aspect, fills the box. `ImageOps.contain` is "contain" — fits inside with possible padding/whitespace.
- `img.transpose(Image.ROTATE_90)` is 5-10× faster than `img.rotate(90)` for 90/180/270 degree rotations.
- Always pass `expand=True` to `rotate()` unless you specifically want the original canvas. Default crops corners.
- `ImageOps.autocontrast(img, cutoff=2)` stretches the histogram while ignoring extreme 2% — avoids overcorrecting dust spots and reflections.
- For heroes/banners, `centering=(0.5, 0.33)` (rule-of-thirds top) often produces better composition than centered crops.
- For real saliency-based crop, use OpenCV's `cv2.saliency.StaticSaliencyFineGrained_create()` or a vision model (see vision-modern entry).

## Common Mistake

> [!warning] `rotate(deg)` without `expand=True` for non-orthogonal angles. Default behavior keeps the canvas size, so a 45° rotation clips all four corners. The user reports "image got cropped after rotation"; the fix is one keyword arg.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Default expand=False — corners clipped after rotation
img = img.rotate(45)
```

**Senior:**
```python
# Canvas grows to fit the rotated image
img = img.rotate(45, expand=True)
```

## See Also

- [[Sections/image-processing/pillow/pil-basics|Pillow basics — open, resize, save with quality (Image Processing)]]
- [[Sections/image-processing/pillow/pil-drawing|Pillow drawing — text, shapes, watermarks (Image Processing)]]
- [[Sections/image-processing/pillow/_Index|Image Processing → Pillow — load, resize, draw]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

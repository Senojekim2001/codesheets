---
type: "entry"
domain: "python"
file: "image-processing"
section: "pillow"
id: "pil-basics"
title: "Pillow basics — open, resize, save with quality"
category: "Pillow"
subtitle: "Image.open, .save, thumbnail, resize, modes (RGB/RGBA/L), JPEG quality, format detection, EXIF orientation"
signature_short: "img = Image.open(\"in.jpg\"); img.thumbnail((800, 800)); img.save(\"out.jpg\", quality=85)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pillow basics — open, resize, save with quality"
  - "pil-basics"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/pillow"
  - "category/pillow"
  - "tier/tiered"
---

# Pillow basics — open, resize, save with quality

> Image.open, .save, thumbnail, resize, modes (RGB/RGBA/L), JPEG quality, format detection, EXIF orientation

## Overview

Pillow is the default Python imaging library — fast enough for most workloads, simple API, broad format support. Three traps to avoid: (1) JPEG cannot store alpha (RGBA) — convert to RGB first or save as PNG; (2) `Image.open` is lazy — call `.load()` or any pixel access to actually decode; (3) EXIF orientation isn't applied by default — your iPhone uploads come in sideways. The three examples solve the SAME concrete task — resize an upload to 800px max and save as JPEG quality 85 — at three depths: minimal load+thumbnail+save → mode/orientation handling + error cases → production validation pipeline (size limits, MIME sniffing, metadata stripping).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Resize an image to 800px max; save as JPEG q=85.
- **Junior** — SAME — but handle RGBA→RGB, EXIF orientation, errors.
- **Senior** — SAME — production: validate uploads (size, MIME, dimensions), strip metadata, security limits.

## Signature

```python
img = Image.open("in.jpg"); img.thumbnail((800, 800)); img.save("out.jpg", quality=85)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Resize an image to 800px max; save as JPEG q=85.
from PIL import Image

img = Image.open("input.jpg")
img.thumbnail((800, 800))                              # in-place; preserves aspect ratio
img.save("output.jpg", quality=85, optimize=True)

# thumbnail() vs resize():
#   thumbnail((W, H))  - in-place; preserves aspect; never enlarges; max dimensions
#   resize((W, H))      - returns new Image; exact dimensions; can stretch
#   resize uses NEAREST by default (fast/blocky); pass Image.LANCZOS for quality

# Modes (img.mode):
#   "RGB"   - 3 channels, 8 bit each (typical photos)
#   "RGBA"  - 4 channels with alpha (PNG with transparency)
#   "L"     - 8-bit grayscale
#   "P"     - 8-bit palette (GIF, indexed PNG)
#   "1"     - 1-bit black/white

# WARNING: saving an RGBA image as JPEG raises:
#   OSError: cannot write mode RGBA as JPEG
# Convert first (junior tier handles this).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but handle RGBA→RGB, EXIF orientation, errors.
from PIL import Image, ImageOps, UnidentifiedImageError
from pathlib import Path

def make_thumbnail(in_path: str, out_path: str,
                   *, max_size: int = 800, quality: int = 85) -> None:
    try:
        img = Image.open(in_path)
    except UnidentifiedImageError:
        raise ValueError(f"not a valid image: {in_path}")

    # 1) Apply EXIF rotation (iPhone, Android cameras encode orientation in EXIF)
    img = ImageOps.exif_transpose(img)

    # 2) Convert mode for JPEG (no alpha, no palette)
    if img.mode in ("RGBA", "LA", "P"):
        # Composite over white background; preserves visual quality.
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P": img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # 3) Resize with high-quality resampling
    img.thumbnail((max_size, max_size), Image.LANCZOS)

    # 4) Save with optimization
    img.save(out_path, "JPEG", quality=quality, optimize=True, progressive=True)

# Usage:
make_thumbnail("upload.heic", "thumb.jpg", max_size=800)

# Common errors caught:
#   - Truncated files: pass ImageFile.LOAD_TRUNCATED_IMAGES = True
#     to allow partial files (or fail explicitly — your call)
#   - Decompression bombs: Pillow refuses huge images by default
#     (PIL.Image.MAX_IMAGE_PIXELS); good. Don't disable.

# === Resampling filters (quality vs speed) ===
#   NEAREST  - fastest; pixelated; only for icons / palette images
#   BILINEAR - decent; ~2x NEAREST; OK for previews
#   BICUBIC  - good quality; ~3x NEAREST
#   LANCZOS  - best quality; ~5x NEAREST; default for downscaling
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: validate uploads (size, MIME, dimensions),
#             strip metadata, security limits.
from PIL import Image, ImageOps, ImageFile
from pathlib import Path
from io import BytesIO

# Allow truncated files? Default False (rejects partial/corrupt). Decide explicitly.
ImageFile.LOAD_TRUNCATED_IMAGES = False

# Decompression-bomb protection (Pillow's default is 89,478,485 px ≈ 9000x9000).
# DO NOT raise this without thinking — it's the only thing protecting against
# 1MB JPEG that decodes to 8GB RAM. Lower for hostile uploads:
Image.MAX_IMAGE_PIXELS = 25_000_000                    # 5000x5000 — adjust per use case

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}        # whitelist, not blacklist
MAX_INPUT_BYTES = 20 * 1024 * 1024                      # 20 MB

class ImageValidationError(ValueError): pass

def validate_and_thumbnail(
    raw_bytes: bytes,
    *,
    max_size: int = 800,
    quality: int = 85,
    strip_metadata: bool = True,
) -> bytes:
    """Validate an upload + return JPEG-encoded thumbnail bytes."""
    if len(raw_bytes) > MAX_INPUT_BYTES:
        raise ImageValidationError(f"upload exceeds {MAX_INPUT_BYTES} bytes")

    buf = BytesIO(raw_bytes)
    try:
        img = Image.open(buf)
        img.verify()                                    # parse headers; cheap; raises on garbage
    except Exception as e:
        raise ImageValidationError(f"not a valid image: {e}")

    # verify() consumes the file; reopen for actual processing.
    img = Image.open(BytesIO(raw_bytes))
    if img.format not in ALLOWED_FORMATS:
        raise ImageValidationError(f"format {img.format} not allowed")

    # EXIF rotation BEFORE we read dimensions (orientation may swap W/H semantically).
    img = ImageOps.exif_transpose(img)

    # Mode normalization for JPEG output.
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P": img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.thumbnail((max_size, max_size), Image.LANCZOS)

    out = BytesIO()
    save_kwargs = {"format": "JPEG", "quality": quality,
                   "optimize": True, "progressive": True}
    if strip_metadata:
        # NOT passing 'exif=' or 'icc_profile=' strips them — they're not in the
        # output unless explicitly written.
        pass
    else:
        if img.info.get("icc_profile"):
            save_kwargs["icc_profile"] = img.info["icc_profile"]
    img.save(out, **save_kwargs)
    return out.getvalue()

# Decision rule:
#   web upload thumbnail                 -> validate_and_thumbnail above
#   in-memory processing                  -> BytesIO; never touch disk
#   batch on disk                          -> Path-based wrapper
#   keep transparency                     -> output PNG/WebP, not JPEG
#   need orientation correct               -> ImageOps.exif_transpose(img) FIRST
#   user uploads (untrusted)               -> set MAX_IMAGE_PIXELS; whitelist formats
#   want metadata preserved                -> save with exif= and icc_profile=
#   need progressive JPEG                  -> progressive=True (smaller; better mobile UX)
#   tiny images                            -> NEAREST is fine; LANCZOS overkill
#   downscaling                            -> Image.LANCZOS
#   upscaling                              -> Image.BICUBIC; OR don't (lossy)
#
# Anti-pattern: saving RGBA as JPEG without conversion. Pillow raises
# "cannot write mode RGBA as JPEG"; your upload pipeline crashes on
# every PNG with transparency. ALWAYS convert mode before save.
```

## Decision Rule

```text
web upload thumbnail                 -> validate_and_thumbnail above
in-memory processing                  -> BytesIO; never touch disk
batch on disk                          -> Path-based wrapper
keep transparency                     -> output PNG/WebP, not JPEG
need orientation correct               -> ImageOps.exif_transpose(img) FIRST
user uploads (untrusted)               -> set MAX_IMAGE_PIXELS; whitelist formats
want metadata preserved                -> save with exif= and icc_profile=
need progressive JPEG                  -> progressive=True (smaller; better mobile UX)
tiny images                            -> NEAREST is fine; LANCZOS overkill
downscaling                            -> Image.LANCZOS
upscaling                              -> Image.BICUBIC; OR don't (lossy)
```

## Anti-Pattern

> [!warning] Anti-pattern
> saving RGBA as JPEG without conversion. Pillow raises
> "cannot write mode RGBA as JPEG"; your upload pipeline crashes on
> every PNG with transparency. ALWAYS convert mode before save.

## Tips

- Always run `ImageOps.exif_transpose(img)` before measuring dimensions or saving — phone uploads are often sideways without it.
- Convert RGBA → RGB before saving as JPEG; JPEG has no alpha channel and Pillow raises if you skip the conversion.
- Use `Image.LANCZOS` for quality downscaling, `Image.BICUBIC` for moderate, `Image.NEAREST` only for icons. Default is NEAREST — too blocky for photos.
- `thumbnail(size)` is in-place AND preserves aspect ratio; `resize(size)` returns a new image and stretches. Almost always you want `thumbnail`.
- `Image.MAX_IMAGE_PIXELS` is your only line of defense against decompression-bomb attacks. Don't raise it without a hard reason.
- Use `BytesIO` for in-memory processing — avoid disk round-trips in serverless/Lambda contexts.

## Common Mistake

> [!warning] Saving an RGBA image directly as JPEG. Pillow raises `cannot write mode RGBA as JPEG`; the upload pipeline crashes on every PNG with transparency. Convert mode first: composite over a background (white or app-specific) for predictable visual output.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Crashes on PNGs with transparency
img = Image.open("upload.png")
img.save("out.jpg")    # OSError: cannot write mode RGBA as JPEG
```

**Senior:**
```python
# Convert before save
if img.mode != "RGB":
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
    img = bg
img.save("out.jpg")
```

## See Also

- [[Sections/image-processing/pillow/pil-transforms|Pillow transforms — rotate, crop, fit, autocontrast (Image Processing)]]
- [[Sections/image-processing/pillow/pil-drawing|Pillow drawing — text, shapes, watermarks (Image Processing)]]
- [[Sections/image-processing/pillow/_Index|Image Processing → Pillow — load, resize, draw]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

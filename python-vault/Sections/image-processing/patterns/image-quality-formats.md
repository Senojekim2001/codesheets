---
type: "entry"
domain: "python"
file: "image-processing"
section: "patterns"
id: "image-quality-formats"
title: "Image formats & quality — JPEG, WebP, AVIF, content-aware choice"
category: "Patterns"
subtitle: "JPEG quality, progressive, optimize, WebP, AVIF, PNG levels, content type → format, SSIM perceptual quality, EXIF stripping"
signature_short: "img.save(\"out.webp\", \"WEBP\", quality=80, method=6)   # method 0-6, higher = slower/smaller"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Image formats & quality — JPEG, WebP, AVIF, content-aware choice"
  - "image-quality-formats"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Image formats & quality — JPEG, WebP, AVIF, content-aware choice

> JPEG quality, progressive, optimize, WebP, AVIF, PNG levels, content type → format, SSIM perceptual quality, EXIF stripping

## Overview

JPEG dominated for 25 years; WebP (Google, 2010) and AVIF (AOMedia, 2019) compress better at the same perceptual quality but require modern browsers. The decision is content-aware: photos compress well as JPEG/WebP/AVIF; flat-color graphics need PNG (lossless) or WebP-lossless. Quality settings: JPEG 85 is the sweet spot, WebP 80, AVIF 70 — newer formats achieve same perceptual quality at lower numeric values. The three examples solve the SAME concrete task — pick a format and quality for smallest file at acceptable quality — at three depths: JPEG q=85 → format-by-content + WebP/AVIF → SSIM-driven quality optimization + responsive image sets.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Save a photo at smallest size + acceptable quality.
- **Junior** — SAME — but pick the format based on content; try WebP.
- **Senior** — SAME — production: SSIM-driven quality, multi-format responsive sets, EXIF stripping.

## Signature

```python
img.save("out.webp", "WEBP", quality=80, method=6)   # method 0-6, higher = slower/smaller
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Save a photo at smallest size + acceptable quality.
from PIL import Image

img = Image.open("photo.jpg")
img.save("out.jpg", "JPEG", quality=85, optimize=True, progressive=True)

# JPEG quality cheat sheet:
#   100  - lossless-ish; huge file; rarely needed
#   90   - excellent; ~30% larger than 85 with negligible quality gain
#   85   - sweet spot for most photos
#   75   - acceptable; visible artifacts in flat regions
#   60   - thumbnails / previews; visible artifacts
#
# optimize=True: ~5-10% smaller via Huffman optimization; ~2x slower
# progressive=True: image renders top-to-bottom in chunks; better mobile UX,
#                    same/slightly smaller file
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but pick the format based on content; try WebP.
from PIL import Image
import io

def has_alpha(img: Image.Image) -> bool:
    return img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)

def is_photo(img: Image.Image) -> bool:
    """Cheap heuristic: photos have many unique colors; graphics have few."""
    small = img.resize((64, 64))
    try:
        n_colors = len(small.convert("RGB").getcolors(maxcolors=64*64))
        return n_colors > 1000
    except TypeError:
        return True                                     # too many colors to enumerate

def smart_save(img: Image.Image, base_path: str) -> tuple[str, int]:
    """Save with the format best suited to the content. Returns (path, bytes)."""
    if has_alpha(img):
        # Transparency → PNG (lossless) or WebP (better compression).
        out_path = base_path + ".webp"
        img.save(out_path, "WEBP", lossless=False, quality=85, method=6)
    elif is_photo(img):
        out_path = base_path + ".jpg"
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(out_path, "JPEG", quality=85, optimize=True, progressive=True)
    else:
        # Flat graphic — PNG with high compression.
        out_path = base_path + ".png"
        img.save(out_path, "PNG", optimize=True, compress_level=9)
    return out_path, _file_size(out_path)

def _file_size(path: str) -> int:
    import os
    return os.path.getsize(path)

# === Format comparison on a typical 1080p photo ===
# Format    Quality    Size      Notes
# ---------------------------------------------------
# JPEG      85         ~250KB    universal browser support
# WebP      80         ~180KB    ~30% smaller than JPEG; modern browsers
# AVIF      70         ~140KB    ~45% smaller than JPEG; very modern only
# PNG       lossless   ~3MB      huge for photos; right for graphics
# JPEG XL    lossy      ~120KB    excellent; not yet widely deployed
#
# The "save in multiple formats and let the browser pick" is the
# <picture> + srcset pattern (senior tier).

# === WebP encoding tunables ===
# method (0-6): higher = slower encoder, smaller output
# quality (0-100): same as JPEG roughly
# lossless=True: WebP-lossless (good for graphics; larger than lossy)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: SSIM-driven quality, multi-format
#             responsive sets, EXIF stripping.
from PIL import Image, ImageCms
import io
import numpy as np

# === Perceptual-quality measurement ===
# pip install scikit-image
from skimage.metrics import structural_similarity as ssim

def jpeg_at_quality(img: Image.Image, quality: int) -> bytes:
    if img.mode != "RGB":
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return buf.getvalue()

def find_min_quality(img: Image.Image, *, target_ssim: float = 0.95,
                     min_q: int = 50, max_q: int = 95) -> tuple[int, bytes]:
    """Binary-search the lowest quality that meets target SSIM."""
    if img.mode != "RGB":
        img = img.convert("RGB")
    orig = np.array(img)
    lo, hi = min_q, max_q
    best_q, best_bytes = max_q, jpeg_at_quality(img, max_q)
    while lo <= hi:
        mid = (lo + hi) // 2
        encoded = jpeg_at_quality(img, mid)
        decoded = np.array(Image.open(io.BytesIO(encoded)))
        score = ssim(orig, decoded, channel_axis=2, data_range=255)
        if score >= target_ssim:
            best_q, best_bytes = mid, encoded
            hi = mid - 1                                # try lower
        else:
            lo = mid + 1
    return best_q, best_bytes

# === Responsive image set: <picture> + srcset ===
def generate_responsive_set(img: Image.Image, base: str,
                            widths: list[int] = [320, 640, 1024, 1920]) -> dict:
    """Generate JPEG, WebP, AVIF at multiple widths."""
    if img.mode != "RGB":
        img = img.convert("RGB")
    out = {"jpeg": [], "webp": [], "avif": []}
    for w in widths:
        if img.width <= w:
            sized = img
        else:
            ratio = w / img.width
            sized = img.resize((w, int(img.height * ratio)), Image.LANCZOS)

        # JPEG.
        jpg = f"{base}-{w}.jpg"
        sized.save(jpg, "JPEG", quality=85, optimize=True, progressive=True)
        out["jpeg"].append((jpg, w))

        # WebP.
        webp = f"{base}-{w}.webp"
        sized.save(webp, "WEBP", quality=80, method=6)
        out["webp"].append((webp, w))

        # AVIF (Pillow 11+).
        try:
            avif = f"{base}-{w}.avif"
            sized.save(avif, "AVIF", quality=70, speed=4)
            out["avif"].append((avif, w))
        except KeyError:
            pass                                         # AVIF not available
    return out

# HTML output:
# <picture>
#   <source type="image/avif" srcset="hero-320.avif 320w, hero-640.avif 640w, ...">
#   <source type="image/webp" srcset="hero-320.webp 320w, hero-640.webp 640w, ...">
#   <img src="hero-1024.jpg" srcset="hero-320.jpg 320w, hero-640.jpg 640w, ..."
#        sizes="(max-width: 600px) 100vw, 50vw" alt="...">
# </picture>

# Decision rule:
# Format selection by content:
#   Photo (web)                          JPEG 85  → WebP 80 → AVIF 70
#   Photo (lossless / archival)          PNG (huge); or AVIF lossless
#   Graphic / diagram                    PNG (lossless)
#   Logo with sharp edges                PNG; SVG if vector
#   Animation                             GIF (limited) → WebP-animated → AVIF-animated
#   Transparent overlay                   PNG → WebP
# Quality selection:
#   Visual evaluator says "good"          q=85 JPEG; 80 WebP; 70 AVIF
#   Need exact target                      SSIM binary search; threshold 0.95
#   Mobile / bandwidth-constrained        save multiple sizes; let CDN pick
#   Responsive HTML                        <picture> + srcset; AVIF→WebP→JPEG fallback
# Other:
#   Strip EXIF / metadata                  re-save without exif= kwarg
#   Preserve color profile                 save with icc_profile= kwarg
#   Optimize file size                     optimize=True; method=6 for WebP
#   Progressive load                       progressive=True for JPEG
#
# Anti-pattern: serving 4K JPEGs at quality 100 to a phone. The phone's
# screen is 1080p; the user's data plan is metered. Use responsive
# srcset so each device gets a size appropriate to its viewport.
# A 320px-wide phone doesn't need a 4000px-wide image.
```

## Decision Rule

```text
Format selection by content:
  Photo (web)                          JPEG 85  → WebP 80 → AVIF 70
  Photo (lossless / archival)          PNG (huge); or AVIF lossless
  Graphic / diagram                    PNG (lossless)
  Logo with sharp edges                PNG; SVG if vector
  Animation                             GIF (limited) → WebP-animated → AVIF-animated
  Transparent overlay                   PNG → WebP
Quality selection:
  Visual evaluator says "good"          q=85 JPEG; 80 WebP; 70 AVIF
  Need exact target                      SSIM binary search; threshold 0.95
  Mobile / bandwidth-constrained        save multiple sizes; let CDN pick
  Responsive HTML                        <picture> + srcset; AVIF→WebP→JPEG fallback
Other:
  Strip EXIF / metadata                  re-save without exif= kwarg
  Preserve color profile                 save with icc_profile= kwarg
  Optimize file size                     optimize=True; method=6 for WebP
  Progressive load                       progressive=True for JPEG
```

## Anti-Pattern

> [!warning] Anti-pattern
> serving 4K JPEGs at quality 100 to a phone. The phone's
> screen is 1080p; the user's data plan is metered. Use responsive
> srcset so each device gets a size appropriate to its viewport.
> A 320px-wide phone doesn't need a 4000px-wide image.

## Tips

- JPEG 85 is the universal sweet spot — visible artifacts start below 75; gains above 90 are negligible.
- WebP 80 ≈ JPEG 85 in perceptual quality at ~30% smaller file. AVIF 70 ≈ JPEG 85 at ~45% smaller.
- Use `<picture>` + `srcset` to serve AVIF to modern browsers, WebP as fallback, JPEG as last resort. The browser picks the first format it supports.
- For "what quality is good enough?", use SSIM (`scikit-image.metrics.structural_similarity`) — target 0.95 for "indistinguishable to most viewers".
- Strip EXIF by default unless you have a reason to preserve it. Pillow doesn't write EXIF unless you pass `exif=` — so default behavior already strips it.
- For responsive images, generate at 4-5 widths (320, 640, 1024, 1920, original). Each width × 3 formats = 12-15 files; CDN handles the rest.

## Common Mistake

> [!warning] Serving full-resolution photos to every device. A 4K JPEG sent to a phone wastes bandwidth (8× larger than needed), kills LCP (Largest Contentful Paint), and burns the user's data plan. Generate responsive sizes; use `srcset` so each device picks an appropriate width.

## Shorthand (Junior → Senior)

**Junior:**
```python
# One huge image for everyone
img.save("hero.jpg", "JPEG", quality=95)
# 4K resolution served to phone with 320px viewport
```

**Senior:**
```python
# Responsive set: each device picks the right width and format
generate_responsive_set(img, "hero", widths=[320, 640, 1024, 1920])
# <picture> + srcset in HTML serves the right one
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/image-processing/patterns/_Index|Image Processing → Patterns — batch pipeline, formats, classical-vs-ML]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

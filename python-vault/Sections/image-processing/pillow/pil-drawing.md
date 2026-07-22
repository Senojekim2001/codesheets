---
type: "entry"
domain: "python"
file: "image-processing"
section: "pillow"
id: "pil-drawing"
title: "Pillow drawing — text, shapes, watermarks"
category: "Pillow"
subtitle: "ImageDraw.Draw, draw.text / rectangle / line, ImageFont.truetype, alpha_composite, ImageFilter, scaled type for consistent sizing"
signature_short: "draw = ImageDraw.Draw(img); font = ImageFont.truetype(\"Arial.ttf\", 24); draw.text((10, 10), \"watermark\", fill=\"white\", font=font)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pillow drawing — text, shapes, watermarks"
  - "pil-drawing"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/pillow"
  - "category/pillow"
  - "tier/tiered"
---

# Pillow drawing — text, shapes, watermarks

> ImageDraw.Draw, draw.text / rectangle / line, ImageFont.truetype, alpha_composite, ImageFilter, scaled type for consistent sizing

## Overview

For overlays, watermarks, bounding boxes on detection output, etc., `ImageDraw` provides primitives; `ImageFont` loads TrueType fonts; `Image.alpha_composite` overlays a transparent layer cleanly. The catch: default font is bitmap-only (8pt) — use `ImageFont.truetype` with a real font file for any production text. Type sizes need scaling with image dimensions, otherwise watermarks look 5pt on a 4K image. The three examples solve the SAME concrete task — add a "Confidential" watermark to an image — at three depths: basic draw.text → TrueType + transparent overlay → production with size-scaled type, multi-line, anti-aliasing.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Draw "CONFIDENTIAL" on an image.
- **Junior** — SAME — but with TrueType, transparent overlay, multi-line text.
- **Senior** — SAME — production: type size scales with image dimensions, pluggable theming, batch annotation helper.

## Signature

```python
draw = ImageDraw.Draw(img); font = ImageFont.truetype("Arial.ttf", 24); draw.text((10, 10), "watermark", fill="white", font=font)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Draw "CONFIDENTIAL" on an image.
from PIL import Image, ImageDraw

img = Image.open("doc.jpg").copy()
draw = ImageDraw.Draw(img)
draw.text((20, 20), "CONFIDENTIAL", fill="red")
img.save("watermarked.jpg")

# Default font is a tiny built-in bitmap (8pt-ish; ugly).
# Real apps need ImageFont.truetype — junior tier.

# Other primitives:
draw.rectangle([10, 10, 100, 50], outline="black", width=2)
draw.line([10, 10, 100, 50], fill="blue", width=3)
draw.ellipse([10, 10, 100, 100], fill="red", outline="black")
draw.polygon([(0, 0), (100, 0), (50, 100)], fill="green")

# Bounding box on detection output:
draw.rectangle((x1, y1, x2, y2), outline="lime", width=3)
draw.text((x1, y1 - 20), f"cat 0.92", fill="lime")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with TrueType, transparent overlay,
#             multi-line text.
from PIL import Image, ImageDraw, ImageFont

def watermark(in_path: str, out_path: str, text: str = "CONFIDENTIAL") -> None:
    img = Image.open(in_path).convert("RGBA")          # need alpha for compositing

    # Transparent overlay — same size as base.
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Real font; ship one with your app or use a system path.
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
    except OSError:
        font = ImageFont.load_default()

    # textbbox returns (x0, y0, x1, y1).
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    # Centered.
    x = (img.width - tw) // 2
    y = (img.height - th) // 2

    # Translucent red — alpha=128 = 50%.
    draw.text((x, y), text, fill=(255, 0, 0, 128), font=font)

    # Composite overlay onto base.
    out = Image.alpha_composite(img, overlay).convert("RGB")
    out.save(out_path, "JPEG", quality=85)

watermark("doc.jpg", "wm.jpg")

# Multi-line text:
draw.multiline_text((x, y), "Line 1\nLine 2", fill="black", font=font, spacing=4)

# Stroke (outlined text — readable on any background):
draw.text((x, y), text, fill="white", stroke_width=2, stroke_fill="black", font=font)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: type size scales with image dimensions,
#             pluggable theming, batch annotation helper.
from PIL import Image, ImageDraw, ImageFont
from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class WatermarkStyle:
    text: str = "CONFIDENTIAL"
    font_path: str = "DejaVuSans-Bold.ttf"
    font_size_ratio: float = 0.05            # font height = 5% of image height
    color: tuple[int, int, int] = (255, 0, 0)
    opacity: int = 128                        # 0-255
    stroke_color: tuple[int, int, int] = (0, 0, 0)
    stroke_ratio: float = 0.05               # stroke = 5% of font height
    rotation_deg: float = -30.0
    diagonal: bool = True                     # tile across whole image diagonally

def add_watermark(img: Image.Image, style: WatermarkStyle = WatermarkStyle()) -> Image.Image:
    base = img.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))

    # Scale font with image; minimum size for readability.
    font_size = max(int(base.height * style.font_size_ratio), 14)
    try:
        font = ImageFont.truetype(style.font_path, font_size)
    except OSError:
        font = ImageFont.load_default()

    stroke = max(1, int(font_size * style.stroke_ratio))

    if style.diagonal:
        # Render text on a separate canvas, rotate, then tile across overlay.
        text_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        td = ImageDraw.Draw(text_layer)
        bbox = td.textbbox((0, 0), style.text, font=font, stroke_width=stroke)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

        # Tile diagonally — repeated text across the canvas.
        spacing_y = int(th * 4)
        spacing_x = int(tw * 1.5)
        for y in range(-base.height, base.height * 2, spacing_y):
            for x in range(-base.width, base.width * 2, spacing_x):
                td.text((x, y), style.text,
                        fill=(*style.color, style.opacity),
                        font=font,
                        stroke_width=stroke,
                        stroke_fill=(*style.stroke_color, style.opacity))

        text_layer = text_layer.rotate(style.rotation_deg,
                                        resample=Image.BICUBIC,
                                        expand=False)
        overlay = Image.alpha_composite(overlay, text_layer)
    else:
        d = ImageDraw.Draw(overlay)
        bbox = d.textbbox((0, 0), style.text, font=font, stroke_width=stroke)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x, y = (base.width - tw) // 2, (base.height - th) // 2
        d.text((x, y), style.text,
               fill=(*style.color, style.opacity),
               font=font, stroke_width=stroke,
               stroke_fill=(*style.stroke_color, style.opacity))

    return Image.alpha_composite(base, overlay).convert("RGB")

def batch_watermark(in_dir: Path, out_dir: Path, style: WatermarkStyle = WatermarkStyle()):
    out_dir.mkdir(parents=True, exist_ok=True)
    for p in in_dir.glob("*.jpg"):
        img = Image.open(p)
        out = add_watermark(img, style)
        out.save(out_dir / p.name, "JPEG", quality=85, optimize=True)

# Decision rule:
#   simple text label                     -> draw.text with truetype font
#   transparent overlay                    -> separate RGBA layer + alpha_composite
#   readable on any background            -> stroke_width + contrasting stroke_fill
#   font scales with image                 -> font_size = ratio * img.height
#   diagonal repeated watermark            -> tile + rotate(expand=False)
#   bounding boxes (detection)            -> rectangle(outline=, width=) + text label
#   anti-aliasing                          -> Pillow's text drawing is anti-aliased by default
#   custom font                             -> ship .ttf with the app or load from /usr/share/fonts
#   need vector output                      -> NOT Pillow; use cairosvg or matplotlib
#   complex typography                      -> NOT Pillow; use HTML→PDF or skia-python
#
# Anti-pattern: hardcoding font_size=24 for all images. On a 200×200
# thumbnail it dominates; on a 4000×4000 photo it's invisible. Always
# scale type size with image height (or width for landscape-heavy
# content). One ratio = consistent visual weight across sizes.
```

## Decision Rule

```text
simple text label                     -> draw.text with truetype font
transparent overlay                    -> separate RGBA layer + alpha_composite
readable on any background            -> stroke_width + contrasting stroke_fill
font scales with image                 -> font_size = ratio * img.height
diagonal repeated watermark            -> tile + rotate(expand=False)
bounding boxes (detection)            -> rectangle(outline=, width=) + text label
anti-aliasing                          -> Pillow's text drawing is anti-aliased by default
custom font                             -> ship .ttf with the app or load from /usr/share/fonts
need vector output                      -> NOT Pillow; use cairosvg or matplotlib
complex typography                      -> NOT Pillow; use HTML→PDF or skia-python
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding font_size=24 for all images. On a 200×200
> thumbnail it dominates; on a 4000×4000 photo it's invisible. Always
> scale type size with image height (or width for landscape-heavy
> content). One ratio = consistent visual weight across sizes.

## Tips

- `ImageFont.load_default()` is a tiny bitmap — only useful for tests. Always load a TrueType font for any user-visible text.
- Use `stroke_width` + `stroke_fill` for text readable on any background. White text + black 2px stroke is the universal "readable everywhere".
- Scale font size with image dimensions: `font_size = max(14, int(height * 0.04))`. Hardcoded sizes look broken at scale.
- For transparent overlays, work in `RGBA` mode, draw on a separate overlay layer, then `Image.alpha_composite` onto the base.
- `textbbox()` (PIL 9+) replaces the deprecated `textsize()` — returns the bounding box including font metrics for accurate centering.
- For diagonal watermarks (anti-piracy), tile the text on a separate layer and rotate that layer with `expand=False`.

## Common Mistake

> [!warning] Hardcoding `font_size=24` for all images. At 200×200 it covers half the image; at 4000×4000 it's invisible. Always scale font size with image dimensions (typically `height * 0.04` for body text, `0.06+` for headlines).

## Shorthand (Junior → Senior)

**Junior:**
```python
# Fixed size — looks wrong at every scale except one
font = ImageFont.truetype("Arial.ttf", 24)
```

**Senior:**
```python
# Scaled font — consistent visual weight
font_size = max(14, int(img.height * 0.04))
font = ImageFont.truetype("Arial.ttf", font_size)
```

## See Also

- [[Sections/image-processing/pillow/pil-basics|Pillow basics — open, resize, save with quality (Image Processing)]]
- [[Sections/image-processing/pillow/pil-transforms|Pillow transforms — rotate, crop, fit, autocontrast (Image Processing)]]
- [[Sections/image-processing/pillow/_Index|Image Processing → Pillow — load, resize, draw]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

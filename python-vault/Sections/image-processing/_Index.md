---
type: "file-index"
domain: "python"
file: "image-processing"
title: "Image Processing"
tags:
  - "python"
  - "python/image-processing"
  - "index"
---

# Image Processing

> 9 entries across 3 sections.

## Pillow — load, resize, draw · 3

- [[Sections/image-processing/pillow/pil-basics|Pillow basics — open, resize, save with quality]] — Load an image, resize to a max dimension, save as JPEG. The 90% case for thumbnail/upload pipelines.
- [[Sections/image-processing/pillow/pil-transforms|Pillow transforms — rotate, crop, fit, autocontrast]] — Geometric and tonal transforms: rotate with expand, crop to aspect, ImageOps.fit for "cover" semantics, autocontrast for tone-stretched output. The toolkit beyond resize.
- [[Sections/image-processing/pillow/pil-drawing|Pillow drawing — text, shapes, watermarks]] — Draw text and shapes on images: ImageDraw + ImageFont for type, alpha-composite for transparent overlays, scale type-size to image dimensions for consistency. The watermarking + annotation toolkit.

## NumPy + OpenCV — pixel ops, color spaces · 3

- [[Sections/image-processing/numpy-cv/numpy-image-ops|NumPy image ops — array view, channels, broadcasting]] — Convert PIL ↔ numpy; treat images as `(H, W, C)` arrays; do per-pixel arithmetic with broadcasting. The escape hatch when Pillow doesn't have a built-in.
- [[Sections/image-processing/numpy-cv/opencv-basics|OpenCV basics — imread, cvtColor, resize, edges]] — OpenCV (`cv2`) is the standard for real CV — fast filters, edge detection, contours, video. The catch: BGR by default, headless install for servers, type conventions differ from Pillow.
- [[Sections/image-processing/numpy-cv/color-spaces-thresholding|Color spaces & thresholding — RGB / HSV / LAB, masks]] — For color-based segmentation (extract red regions, detect skin tones), HSV separates hue from brightness; LAB separates luminance from color. Pair with adaptive thresholding + morphology for clean masks.

## Patterns — batch pipeline, formats, classical-vs-ML · 3

- [[Sections/image-processing/patterns/batch-image-pipeline|Batch image pipeline — parallel, resilient, observable]] — Process N thousand images: thumbnail + watermark + write. Parallelize via `ProcessPoolExecutor`; track progress; log failures without crashing the batch.
- [[Sections/image-processing/patterns/image-quality-formats|Image formats & quality — JPEG, WebP, AVIF, content-aware choice]] — Pick the right format and quality for the smallest file at acceptable quality. JPEG for photos, PNG for diagrams, WebP / AVIF for modern browsers, perceptual quality (SSIM) for tuning.
- [[Sections/image-processing/patterns/classical-vs-ml-vision|Classical vs ML — when each wins]] — Classical CV (cv2 + numpy) is fast, deterministic, interpretable. ML (CLIP, SAM, vision transformers) is flexible and zero-shot. The hybrid pipeline pays for itself once you have measured both.

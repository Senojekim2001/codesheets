---
type: "entry"
domain: "python"
file: "image-processing"
section: "patterns"
id: "classical-vs-ml-vision"
title: "Classical vs ML — when each wins"
category: "Patterns"
subtitle: "classical features (Canny, contours, color hist), CLIP for zero-shot, segmentation models, latency / cost / interpretability tradeoffs"
signature_short: "classical wins: < 20ms, < $0.001/img, deterministic; ML wins: zero-shot, semantic, cross-domain"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Classical vs ML — when each wins"
  - "classical-vs-ml-vision"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Classical vs ML — when each wins

> classical features (Canny, contours, color hist), CLIP for zero-shot, segmentation models, latency / cost / interpretability tradeoffs

## Overview

For "is this image dark?" or "find the rectangle in the document scan" — classical CV (cv2 + numpy) does it in milliseconds, deterministically, with code you can audit. For "is this image safe for work?" or "what objects are in this image?" — pretrained vision models (CLIP, SAM, BLIP) are zero-shot and far more accurate than rule-based pipelines. The hybrid: fast classical filter + ML for hard cases. The three examples solve the SAME concrete task — detect "image contains text" — at three depths: classical edge density → CLIP zero-shot → hybrid (classical fast path + CLIP fallback).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Detect "image contains text" cheaply.
- **Junior** — SAME — but use CLIP for zero-shot accuracy. pip install open_clip_torch torch
- **Senior** — SAME — production: classical fast path; CLIP fallback for borderline cases; cost-aware routing.

## Signature

```python
classical wins: < 20ms, < $0.001/img, deterministic; ML wins: zero-shot, semantic, cross-domain
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Detect "image contains text" cheaply.
import cv2
import numpy as np

def has_text_classical(img_path: str, *, edge_density_threshold: float = 0.06) -> bool:
    """Heuristic: text regions have high edge density."""
    img = cv2.imread(img_path)
    if img is None:
        return False
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    density = edges.mean() / 255.0                     # fraction of edge pixels
    return density > edge_density_threshold

# Profile:
#   Latency:  ~5-15ms per image (depends on size)
#   Cost:     $0 (just CPU)
#   Accuracy: ~75% — busy patterns also have high edge density
#   Wins:     fast filter; zero infrastructure
#   Loses:    busy non-text images, pure-text (handwriting low-edge)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use CLIP for zero-shot accuracy.
# pip install open_clip_torch torch
import torch, open_clip
from PIL import Image

# Load once at module level (~500MB, several seconds).
_clip_model, _, _clip_preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k"
)
_clip_tokenizer = open_clip.get_tokenizer("ViT-B-32")
_clip_model.eval()

LABELS = ["text on a screen", "handwritten text", "no text — pure photo"]

def has_text_clip(img_path: str) -> tuple[bool, dict]:
    """Returns (has_text, scores)."""
    img = Image.open(img_path)
    img_t = _clip_preprocess(img).unsqueeze(0)
    text_t = _clip_tokenizer(LABELS)

    with torch.no_grad(), torch.amp.autocast("cuda" if torch.cuda.is_available() else "cpu"):
        img_features = _clip_model.encode_image(img_t)
        text_features = _clip_model.encode_text(text_t)
        img_features = img_features / img_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        logits = (100.0 * img_features @ text_features.T)
        probs = logits.softmax(dim=-1).cpu().numpy()[0]

    scores = {l: float(p) for l, p in zip(LABELS, probs)}
    has_text = scores["text on a screen"] + scores["handwritten text"] > 0.5
    return has_text, scores

# Profile:
#   Latency:  ~50-200ms CPU; ~10-30ms GPU
#   Cost:     $0 self-hosted; ~$0.0005/req on managed inference
#   Accuracy: ~92% (zero-shot)
#   Wins:     accuracy, no labeled data needed, semantic understanding
#   Loses:    latency, model size (~500MB), GPU helps a lot
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: classical fast path; CLIP fallback for
#             borderline cases; cost-aware routing.
import cv2, torch, open_clip
from PIL import Image

_clip_model, _, _clip_preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k")
_clip_tokenizer = open_clip.get_tokenizer("ViT-B-32")
_clip_model.eval()

LABELS = ["text on a screen", "handwritten text", "no text — pure photo"]

def edge_density(img_path: str) -> float:
    img = cv2.imread(img_path)
    if img is None: return 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(gray, 100, 200).mean() / 255.0

def clip_score(img_path: str) -> float:
    img = Image.open(img_path)
    img_t = _clip_preprocess(img).unsqueeze(0)
    text_t = _clip_tokenizer(LABELS)
    with torch.no_grad():
        f_img = _clip_model.encode_image(img_t); f_img /= f_img.norm(dim=-1, keepdim=True)
        f_txt = _clip_model.encode_text(text_t); f_txt /= f_txt.norm(dim=-1, keepdim=True)
        probs = (100.0 * f_img @ f_txt.T).softmax(dim=-1).cpu().numpy()[0]
    return float(probs[0] + probs[1])                  # text labels

# Confidence bands:
#   density < 0.03                -> definitely no text (classical)
#   0.03 <= density < 0.10        -> uncertain — call CLIP
#   density >= 0.10               -> probably text (classical, but verify with CLIP if cost allows)

def has_text_hybrid(img_path: str, *, low: float = 0.03, high: float = 0.10) -> dict:
    density = edge_density(img_path)
    if density < low:
        return {"has_text": False, "tier": "classical", "density": density}
    if density >= high and density < 0.25:             # 0.25+ = noisy; use CLIP
        return {"has_text": True, "tier": "classical", "density": density}
    score = clip_score(img_path)
    return {"has_text": score > 0.5, "tier": "clip",
            "density": density, "clip_score": score}

# === Track tier mix in production ===
# tier="classical" should handle ~70-85% of traffic
# tier="clip" should handle the rest
# If tier="clip" > 30%, classical thresholds need re-tuning

# Decision rule:
#   simple geometric query (size, color, edges)         -> classical (cv2 + numpy)
#   semantic query (objects, text, NSFW)                  -> ML (CLIP, BLIP)
#   need < 50ms p99                                       -> classical or hybrid
#   need < $0.001/img cost                                -> classical first; ML for hard cases
#   need bounding boxes                                    -> ML detection (YOLO, DETR)
#   need pixel-perfect masks                               -> ML segmentation (SAM)
#   labeled data available                                 -> fine-tune ResNet/EfficientNet
#   labeled data scarce                                    -> CLIP zero-shot
#   need explainability                                    -> classical (rules are auditable)
#   adversarial inputs                                     -> classical (deterministic)
#   high volume + low budget                              -> hybrid; tune the bands
#
# Anti-pattern: replacing a working classical pipeline with a vision
# transformer because "ML is more accurate". For "is this image
# blurry?" or "find the dominant color", classical gets 95% accuracy
# at 1ms; CLIP gets 96% at 100ms and $0.001/req. The "improvement" is
# not worth 100x cost. Measure both; pick by accuracy × latency × cost.
```

## Decision Rule

```text
simple geometric query (size, color, edges)         -> classical (cv2 + numpy)
semantic query (objects, text, NSFW)                  -> ML (CLIP, BLIP)
need < 50ms p99                                       -> classical or hybrid
need < $0.001/img cost                                -> classical first; ML for hard cases
need bounding boxes                                    -> ML detection (YOLO, DETR)
need pixel-perfect masks                               -> ML segmentation (SAM)
labeled data available                                 -> fine-tune ResNet/EfficientNet
labeled data scarce                                    -> CLIP zero-shot
need explainability                                    -> classical (rules are auditable)
adversarial inputs                                     -> classical (deterministic)
high volume + low budget                              -> hybrid; tune the bands
```

## Anti-Pattern

> [!warning] Anti-pattern
> replacing a working classical pipeline with a vision
> transformer because "ML is more accurate". For "is this image
> blurry?" or "find the dominant color", classical gets 95% accuracy
> at 1ms; CLIP gets 96% at 100ms and $0.001/req. The "improvement" is
> not worth 100x cost. Measure both; pick by accuracy × latency × cost.

## Tips

- Run classical first — it's 100× cheaper than ML and handles 70%+ of cases. Use ML only when classical confidence is low.
- CLIP is the zero-shot workhorse for semantic image queries — "is this an X?" without training data.
- For pixel-perfect segmentation use SAM (Segment Anything); for detection use YOLO or DETR; for classification with labels, fine-tune ResNet/EfficientNet.
- Track tier mix in production. If ML-tier handles >30%, the classical thresholds drifted and need retuning.
- For adversarial input handling (uploads from users), prefer classical — deterministic and auditable.
- CLIP, SAM, YOLO are all CPU-runnable but far faster on GPU (~10× speedup). Budget for GPU if you serve >10 RPS.

## Common Mistake

> [!warning] Replacing a working classical pipeline with a vision transformer because "ML is better". For "is this image blurry?" or "find the dominant color", classical gets 95% accuracy at 1ms; CLIP gets 96% at 100ms and $0.001/req — 100× cost for 1% gain. Measure both; pick by accuracy × latency × cost.

## Shorthand (Junior → Senior)

**Junior:**
```python
# CLIP for what cv2 already solves
def is_blurry(img_path):
    return clip_zero_shot(img_path, ["blurry", "sharp"]) == "blurry"
# 100ms, $0.001/req
```

**Senior:**
```python
# Classical: Laplacian variance — blur detector
def is_blurry(img_path, threshold=100.0):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    return cv2.Laplacian(img, cv2.CV_64F).var() < threshold
# 1ms, $0
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/image-processing/patterns/_Index|Image Processing → Patterns — batch pipeline, formats, classical-vs-ML]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

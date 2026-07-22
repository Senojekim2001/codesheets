---
type: "entry"
domain: "python"
file: "image-processing"
section: "patterns"
id: "batch-image-pipeline"
title: "Batch image pipeline — parallel, resilient, observable"
category: "Patterns"
subtitle: "concurrent.futures.ProcessPoolExecutor, tqdm progress, per-file try/except, output deduplication, before/after size telemetry"
signature_short: "with ProcessPoolExecutor() as ex: list(tqdm(ex.map(process_one, paths), total=len(paths)))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Batch image pipeline — parallel, resilient, observable"
  - "batch-image-pipeline"
tags:
  - "python"
  - "python/image-processing"
  - "python/image-processing/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Batch image pipeline — parallel, resilient, observable

> concurrent.futures.ProcessPoolExecutor, tqdm progress, per-file try/except, output deduplication, before/after size telemetry

## Overview

Image processing is CPU-bound — `ProcessPoolExecutor` (not `ThreadPoolExecutor`) gives real parallelism. The discipline: per-file try/except so one bad file doesn't crash the run; resumability via output-existence check; observability via `tqdm` and structured failure log. The three examples solve the SAME concrete task — process 10k JPEGs into thumbnails — at three depths: serial loop → ProcessPoolExecutor with progress → production with resumability, telemetry, and DLQ for failures.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Thumbnail 10k images.
- **Junior** — SAME — but parallelized + progress + resilient. pip install tqdm
- **Senior** — SAME — production: resumable (skip already-done), telemetry (size before/after), structured failure log.

## Signature

```python
with ProcessPoolExecutor() as ex: list(tqdm(ex.map(process_one, paths), total=len(paths)))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Thumbnail 10k images.
from PIL import Image, ImageOps
from pathlib import Path

def process_one(in_path: Path, out_dir: Path, size: int = 800) -> None:
    out = out_dir / in_path.name
    img = Image.open(in_path)
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB": img = img.convert("RGB")
    img.thumbnail((size, size), Image.LANCZOS)
    img.save(out, "JPEG", quality=85, optimize=True)

in_dir, out_dir = Path("input"), Path("output")
out_dir.mkdir(exist_ok=True)
for p in in_dir.glob("*.jpg"):
    process_one(p, out_dir)

# Serial loop on 10k images = ~5-30 minutes on a single core.
# Junior tier parallelizes.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but parallelized + progress + resilient.
# pip install tqdm
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from PIL import Image, ImageOps
from tqdm import tqdm

def process_one(in_path: Path, out_dir: Path, size: int = 800) -> tuple[Path, str | None]:
    """Returns (path, error_message_or_None). Caught at boundaries."""
    try:
        out = out_dir / in_path.name
        img = Image.open(in_path)
        img = ImageOps.exif_transpose(img)
        if img.mode != "RGB": img = img.convert("RGB")
        img.thumbnail((size, size), Image.LANCZOS)
        img.save(out, "JPEG", quality=85, optimize=True)
        return in_path, None
    except Exception as e:
        return in_path, f"{type(e).__name__}: {e}"

def batch_thumbnails(in_dir: Path, out_dir: Path,
                     *, size: int = 800, workers: int = None) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = list(in_dir.rglob("*.jpg"))
    successes, failures = 0, []

    with ProcessPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(process_one, p, out_dir, size): p for p in paths}
        for fut in tqdm(as_completed(futures), total=len(paths), desc="thumbnails"):
            path, err = fut.result()
            if err: failures.append((path, err))
            else: successes += 1

    return {"total": len(paths), "ok": successes, "failed": len(failures),
            "failures": failures}

result = batch_thumbnails(Path("input"), Path("output"), workers=8)
print(f"Done: {result['ok']}/{result['total']}; {result['failed']} failed")
for path, err in result["failures"][:10]:
    print(f"  {path}: {err}")

# Notes:
#   - ProcessPoolExecutor is required (Pillow releases GIL but workloads
#     are still CPU-bound; threads don't parallelize on CPU).
#   - workers=None defaults to os.cpu_count(); for I/O-bound workloads
#     2-4x cores can help, but image processing rarely benefits.
#   - Each worker imports modules from scratch — keep process_one simple.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: resumable (skip already-done),
#             telemetry (size before/after), structured failure log.
import json, time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from PIL import Image, ImageOps
from tqdm import tqdm

def process_one(in_path: Path, out_dir: Path, *,
                size: int = 800, quality: int = 85,
                skip_existing: bool = True) -> dict:
    """Returns telemetry dict; never raises."""
    rec = {"in_path": str(in_path), "ok": False, "skipped": False,
           "size_in_bytes": 0, "size_out_bytes": 0, "elapsed_ms": 0,
           "error": None}
    started = time.monotonic()
    out = out_dir / in_path.name
    try:
        if skip_existing and out.exists():
            rec["skipped"] = True
            rec["ok"] = True
            return rec
        rec["size_in_bytes"] = in_path.stat().st_size
        img = Image.open(in_path)
        img = ImageOps.exif_transpose(img)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.thumbnail((size, size), Image.LANCZOS)
        img.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
        rec["size_out_bytes"] = out.stat().st_size
        rec["ok"] = True
    except Exception as e:
        rec["error"] = f"{type(e).__name__}: {e}"
    finally:
        rec["elapsed_ms"] = int((time.monotonic() - started) * 1000)
    return rec

def batch(in_dir: Path, out_dir: Path, *, workers: int = None,
          size: int = 800, quality: int = 85,
          report_path: Path = Path("batch_report.jsonl")) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = sorted(in_dir.rglob("*.jpg"))

    successes = skipped = 0
    failures: list[dict] = []
    bytes_in = bytes_out = 0

    with report_path.open("w") as report, ProcessPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(process_one, p, out_dir,
                            size=size, quality=quality): p for p in paths}
        for fut in tqdm(as_completed(futures), total=len(paths), desc="batch"):
            rec = fut.result()
            report.write(json.dumps(rec) + "\n")
            if rec["ok"]:
                if rec["skipped"]: skipped += 1
                else:               successes += 1
                bytes_in  += rec["size_in_bytes"]
                bytes_out += rec["size_out_bytes"]
            else:
                failures.append(rec)

    return {"total": len(paths),
            "ok": successes, "skipped": skipped, "failed": len(failures),
            "bytes_in": bytes_in, "bytes_out": bytes_out,
            "compression_ratio": (bytes_out / max(bytes_in, 1)),
            "first_failures": failures[:20]}

# Decision rule:
#   <100 images, ad-hoc                    -> serial loop; not worth the parallelism setup
#   1k-100k images, batch                   -> ProcessPoolExecutor + tqdm
#   millions of images                       -> distribute (Celery/Dask) or stream from S3
#   I/O-bound (S3 GET dominates)             -> ThreadPoolExecutor 2-4x cores
#   CPU-bound (resize, encode)              -> ProcessPoolExecutor == cpu_count
#   need to resume after crash               -> skip_existing=True; idempotent step
#   need progress visible                    -> tqdm
#   want failure DLQ                         -> append failures to JSONL; replay later
#   want metrics                             -> compute compression ratio, p50/p99 elapsed
#   GPU available                            -> consider torch / OpenCV CUDA for big images
#
# Anti-pattern: catching errors silently per-file but never reporting
# them. The batch "succeeds" but 30% of images quietly failed; the
# downstream system sees missing files and breaks. ALWAYS aggregate
# failures into a structured log AND surface a summary at the end.
```

## Decision Rule

```text
<100 images, ad-hoc                    -> serial loop; not worth the parallelism setup
1k-100k images, batch                   -> ProcessPoolExecutor + tqdm
millions of images                       -> distribute (Celery/Dask) or stream from S3
I/O-bound (S3 GET dominates)             -> ThreadPoolExecutor 2-4x cores
CPU-bound (resize, encode)              -> ProcessPoolExecutor == cpu_count
need to resume after crash               -> skip_existing=True; idempotent step
need progress visible                    -> tqdm
want failure DLQ                         -> append failures to JSONL; replay later
want metrics                             -> compute compression ratio, p50/p99 elapsed
GPU available                            -> consider torch / OpenCV CUDA for big images
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching errors silently per-file but never reporting
> them. The batch "succeeds" but 30% of images quietly failed; the
> downstream system sees missing files and breaks. ALWAYS aggregate
> failures into a structured log AND surface a summary at the end.

## Tips

- Image processing is CPU-bound — use `ProcessPoolExecutor`, not `ThreadPoolExecutor`. Threads don't parallelize CPU work in Python.
- `skip_existing` makes the batch resumable. Crashed midway? Re-run; only the unfinished files are processed.
- Use `tqdm(as_completed(futures), total=N)` for live progress. Without it, large batches feel hung.
- Append per-file results to JSONL — both successes (with telemetry) and failures (with error). Easy to grep, easy to compute aggregate metrics.
- For S3 reads (I/O-bound), `ThreadPoolExecutor` with 2-4× cores can help; for the actual image work, fall back to processes.
- Track `compression_ratio = bytes_out / bytes_in`. If it's near 1.0, your quality setting is too high; if too low, you're losing visible quality.

## Common Mistake

> [!warning] Catching errors per-file but never aggregating or surfacing them. The batch reports "success" but 30% of images quietly failed; the downstream pipeline sees missing files and breaks days later. Always emit a structured failure log AND print a summary at the end.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Silent failures
for p in paths:
    try: process(p)
    except: pass
```

**Senior:**
```python
# Aggregated failure log + summary
results = list(executor.map(process, paths))
failures = [r for r in results if r["error"]]
print(f"OK: {len(results) - len(failures)}; failed: {len(failures)}")
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/image-processing/patterns/_Index|Image Processing → Patterns — batch pipeline, formats, classical-vs-ML]]
- [[Sections/image-processing/_Index|Image Processing index]]
- [[_Index|Vault index]]

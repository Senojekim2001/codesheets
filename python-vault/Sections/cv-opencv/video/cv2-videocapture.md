---
type: "entry"
domain: "python"
file: "cv-opencv"
section: "video"
id: "cv2-videocapture"
title: "cv2.VideoCapture / cv2.VideoWriter — read and write video"
category: "video"
subtitle: "cv2.VideoCapture (file or 0 for webcam), CAP_PROP_FPS / FRAME_COUNT / FRAME_WIDTH / HEIGHT, cv2.VideoWriter (FOURCC: mp4v / avc1 / XVID), context-manager wrapper, frame-skip via CAP_PROP_POS_FRAMES"
signature_short: "cap = cv2.VideoCapture(src); ok, frame = cap.read(); writer = cv2.VideoWriter(path, fourcc, fps, (w,h))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cv2.VideoCapture / cv2.VideoWriter — read and write video"
  - "cv2-videocapture"
tags:
  - "python"
  - "python/cv-opencv"
  - "python/cv-opencv/video"
  - "category/video"
  - "tier/tiered"
---

# cv2.VideoCapture / cv2.VideoWriter — read and write video

> cv2.VideoCapture (file or 0 for webcam), CAP_PROP_FPS / FRAME_COUNT / FRAME_WIDTH / HEIGHT, cv2.VideoWriter (FOURCC: mp4v / avc1 / XVID), context-manager wrapper, frame-skip via CAP_PROP_POS_FRAMES

## Overview

VideoCapture handles files, RTSP streams, and webcams (`0` is the default camera). Iterate with `while True: ok, frame = cap.read()` until `ok` is False. VideoWriter needs a four-character codec hint and the EXACT frame size — frames of any other size are silently dropped. Three depths solve the SAME task — read a video, run grayscale on each frame, save as a new video — at depths: minimal loop with hardcoded codec → property-based output sizing + progress → context-manager wrapper, codec fallback chain, async-frame-drop counter.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read a video, grayscale every frame, save as a new video.
- **Junior** — SAME — read video, grayscale, save — derive size + fps from input.
- **Senior** — SAME — read video, grayscale, save — production: context-manager wrapper, codec fallback, dropped-frame counter, mid-loop seek.

## Signature

```python
cap = cv2.VideoCapture(src); ok, frame = cap.read(); writer = cv2.VideoWriter(path, fourcc, fps, (w,h))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read a video, grayscale every frame, save as a new video.
# APPROACH  - VideoCapture loop + VideoWriter.
# STRENGTHS - Fewest lines.
# WEAKNESSES- Hardcoded size; no error checks; no release on exception.
import cv2

cap = cv2.VideoCapture('input.mp4')

fourcc = cv2.VideoWriter_fourcc(*'mp4v')              # codec hint
out = cv2.VideoWriter('output.mp4', fourcc, fps=30, frameSize=(1280, 720),
                      isColor=False)                  # grayscale output

while True:
    ok, frame = cap.read()
    if not ok:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    out.write(gray)

cap.release()
out.release()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — read video, grayscale, save — derive size + fps from input.
# APPROACH  - Read CAP_PROP_* properties so output matches input.
# STRENGTHS - Output dimensions stay correct for any input.
# WEAKNESSES- Still no codec fallback; no progress reporting.
import cv2

cap = cv2.VideoCapture('input.mp4')
if not cap.isOpened():
    raise RuntimeError("could not open input.mp4")

fps    = cap.get(cv2.CAP_PROP_FPS)                    # frames per second
W      = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H      = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
n_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

out = cv2.VideoWriter(
    'output.mp4',
    cv2.VideoWriter_fourcc(*'mp4v'),
    fps,
    (W, H),
    isColor=False,
)

i = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    out.write(gray)
    i += 1
    if i % 100 == 0:
        print(f"  {i}/{n_frames} frames")

cap.release()
out.release()
print(f"wrote {i} frames @ {fps:.1f} fps")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — read video, grayscale, save — production: context-manager
#             wrapper, codec fallback, dropped-frame counter, mid-loop seek.
# APPROACH  - Class with __enter__/__exit__; try codecs in order; track drops.
# STRENGTHS - Always releases; survives codec mismatch; observable.
# WEAKNESSES- More code; codec fallback adds startup time.
from __future__ import annotations
import cv2
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def video_reader(src: str | int):
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise RuntimeError(f"VideoCapture failed for {src!r}")
    try:
        yield cap
    finally:
        cap.release()


def open_writer(path: Path, fps: float, size: tuple[int, int],
                color: bool = True) -> cv2.VideoWriter:
    """Try preferred codecs in order; fall back if writer fails to open."""
    for fourcc_str in ('avc1', 'mp4v', 'XVID', 'MJPG'):
        fourcc = cv2.VideoWriter_fourcc(*fourcc_str)
        w = cv2.VideoWriter(str(path), fourcc, fps, size, isColor=color)
        if w.isOpened():
            print(f"using codec {fourcc_str}")
            return w
        w.release()
    raise RuntimeError(f"no codec produced an opened writer for {path}")


def grayscale_video(src: Path, dst: Path) -> dict:
    with video_reader(str(src)) as cap:
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        W   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        H   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        writer = open_writer(dst, fps, (W, H), color=False)
        try:
            read = written = dropped = 0
            while True:
                ok, frame = cap.read()
                if not ok:
                    break
                read += 1
                if frame.shape[1] != W or frame.shape[0] != H:
                    dropped += 1                       # size mismatch -> writer would silently drop
                    continue
                writer.write(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))
                written += 1
        finally:
            writer.release()

    return {"read": read, "written": written, "dropped": dropped, "fps": fps}


stats = grayscale_video(Path('input.mp4'), Path('output.mp4'))
print(stats)

# Decision rule:
#   Local mp4 file               -> mp4v or avc1 (avc1 = H.264, smaller files).
#   Cross-platform compatibility -> mp4v inside .mp4.
#   Open-source codec only       -> XVID inside .avi.
#   Lossless / debugging         -> MJPG (large but every frame is a JPEG).
#   Webcam capture               -> VideoCapture(0); set CAP_PROP_FRAME_WIDTH/HEIGHT BEFORE first read.
#   RTSP / IP camera             -> VideoCapture('rtsp://...'); add CAP_FFMPEG backend.
#   Need frame-accurate seeking  -> use CAP_PROP_POS_FRAMES; some codecs only seek to keyframes.

# Anti-pattern:
#   writer = cv2.VideoWriter(...)   # never check isOpened()
# If FOURCC is unsupported (no codec installed), the writer silently
# returns False to .write() forever. Always check writer.isOpened() and
# fall back to another codec if False.
```

## Decision Rule

```text
Local mp4 file               -> mp4v or avc1 (avc1 = H.264, smaller files).
Cross-platform compatibility -> mp4v inside .mp4.
Open-source codec only       -> XVID inside .avi.
Lossless / debugging         -> MJPG (large but every frame is a JPEG).
Webcam capture               -> VideoCapture(0); set CAP_PROP_FRAME_WIDTH/HEIGHT BEFORE first read.
RTSP / IP camera             -> VideoCapture('rtsp://...'); add CAP_FFMPEG backend.
Need frame-accurate seeking  -> use CAP_PROP_POS_FRAMES; some codecs only seek to keyframes.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   writer = cv2.VideoWriter(...)   # never check isOpened()
> If FOURCC is unsupported (no codec installed), the writer silently
> returns False to .write() forever. Always check writer.isOpened() and
> fall back to another codec if False.

## Tips

- `cv2.VideoCapture(0)` opens the default webcam; `1` is the second camera, etc.
- Always check `cap.isOpened()` and `writer.isOpened()` — both fail silently otherwise.
- Frame size in `VideoWriter` must EXACTLY match the frame you write — mismatched frames are silently dropped.
- `CAP_PROP_POS_FRAMES` lets you seek by frame index; some codecs round to the nearest keyframe.
- `mp4v` works everywhere but produces larger files than `avc1` (H.264). Try `avc1` first, fall back to `mp4v`.

## Common Mistake

> [!warning] Forgetting `cap.release()` / `writer.release()` — leaves OS handles open and on Windows the file stays locked. Use a context-manager wrapper or `try/finally`.

## See Also

- [[Sections/cv-opencv/video/_Index|OpenCV (cv2) → Video I/O]]
- [[Sections/cv-opencv/_Index|OpenCV (cv2) index]]
- [[_Index|Vault index]]

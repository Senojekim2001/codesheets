---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "librosa"
id: "librosa-load-resample"
title: "librosa.load / resample — load any audio file, force a sample rate"
category: "librosa"
subtitle: "librosa.load (sr=None for native, mono=False for stereo, offset, duration), float32 in [-1, 1] convention, librosa.resample (default kaiser_best is slow), output shape (n,) mono vs (2, n) stereo (channels-first), sr precedence (file vs requested vs None)"
signature_short: "y, sr = librosa.load(path, sr=None, mono=False, offset=0.0, duration=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "librosa.load / resample — load any audio file, force a sample rate"
  - "librosa-load-resample"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/librosa"
  - "category/librosa"
  - "tier/tiered"
---

# librosa.load / resample — load any audio file, force a sample rate

> librosa.load (sr=None for native, mono=False for stereo, offset, duration), float32 in [-1, 1] convention, librosa.resample (default kaiser_best is slow), output shape (n,) mono vs (2, n) stereo (channels-first), sr precedence (file vs requested vs None)

## Overview

librosa.load is the friendliest reader. The two parameters that matter most are `sr` (None to preserve native, an int to force-resample) and `mono` (True downmixes to a single channel). Returns `(y, sr)` where `y` is float32 in [-1, 1]. Stereo shape is `(2, n)` — channels-first — different from soundfile's `(n, 2)`. Three depths solve the SAME task — load a stereo MP3 and resample to 16 kHz mono — at depths: minimal `librosa.load(path)` accepting whatever defaults → explicit `sr=16000, mono=True` with offset/duration → preserve native, then resample explicitly with `kaiser_fast` and downmix manually for control.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load an audio file and inspect its shape and rate.
- **Junior** — SAME — load a stereo MP3 — but at 16 kHz mono for ASR.
- **Senior** — SAME — stereo MP3 -> 16 kHz mono — production: preserve native rate on read; resample with the explicit fast kernel; downmix with control over channel weights; clip-safe.

## Signature

```python
y, sr = librosa.load(path, sr=None, mono=False, offset=0.0, duration=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load an audio file and inspect its shape and rate.
# APPROACH  - librosa.load with default args.
# STRENGTHS - One line.
# WEAKNESSES- Default sr=22050 silently resamples; default mono=True
#             throws away the second channel. Surprising defaults.
import librosa

y, sr = librosa.load("song.mp3")                      # downmixed mono @ 22050 Hz
print(y.shape, y.dtype, sr)                           # e.g. (4567232,) float32 22050
print(y.min(), y.max())                               # in [-1, 1]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — load a stereo MP3 — but at 16 kHz mono for ASR.
# APPROACH  - sr=16000, mono=True, slice with offset/duration.
# STRENGTHS - One call gives you exactly the input most ASR models want.
# WEAKNESSES- Default kaiser_best resampler is high-quality but slow.
import librosa

y, sr = librosa.load(
    "song.mp3",
    sr=16000,                                         # force resample to 16 kHz
    mono=True,                                        # downmix L+R -> mean
    offset=10.0,                                      # start 10 seconds in
    duration=30.0,                                    # take 30 seconds
)
print(y.shape, sr)                                    # (480000,) 16000

# Tip: librosa.load uses soundfile for WAV/FLAC/OGG; it falls back to
# audioread (which uses ffmpeg) for MP3/M4A. Make sure ffmpeg is on PATH
# for compressed formats.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — stereo MP3 -> 16 kHz mono — production: preserve native
#             rate on read; resample with the explicit fast kernel; downmix
#             with control over channel weights; clip-safe.
# APPROACH  - sr=None + mono=False on read; manual resample + downmix.
# STRENGTHS - Faster, predictable; lets you keep stereo for some pipelines
#             and mono for others without re-decoding.
# WEAKNESSES- More steps; have to know librosa's resample kernels.
from __future__ import annotations
import numpy as np
import librosa


def load_for_asr(path: str, target_sr: int = 16000) -> np.ndarray:
    """Load any file as 16 kHz mono float32 in [-1, 1], no surprises."""
    # 1) Read at NATIVE rate, keep all channels.
    y, sr = librosa.load(path, sr=None, mono=False)

    # 2) Downmix to mono. y is shape (n,) for already-mono files,
    #    (2, n) for stereo. Average channels-axis-aware.
    if y.ndim == 2:
        y = y.mean(axis=0)                            # equal-weight L/R

    # 3) Resample with the FAST kernel (kaiser_fast is ~5x faster than the
    #    default kaiser_best with negligible perceptual loss).
    if sr != target_sr:
        y = librosa.resample(y, orig_sr=sr, target_sr=target_sr,
                             res_type="kaiser_fast")

    # 4) Defensive clip - resampling can introduce tiny overshoots.
    y = np.clip(y, -1.0, 1.0).astype(np.float32, copy=False)
    return y


def load_stereo(path: str, target_sr: int = 44100) -> np.ndarray:
    """Same idea but keep stereo (2, n) for music pipelines."""
    y, sr = librosa.load(path, sr=None, mono=False)
    if y.ndim == 1:
        y = np.stack([y, y])                          # mono -> fake stereo
    if sr != target_sr:
        y = np.stack([
            librosa.resample(y[c], orig_sr=sr, target_sr=target_sr,
                             res_type="kaiser_fast")
            for c in range(y.shape[0])
        ])
    return np.clip(y, -1.0, 1.0).astype(np.float32, copy=False)


asr_input = load_for_asr("song.mp3")
print(asr_input.shape, asr_input.dtype)

# Decision rule:
#   Want a quick look at any audio file              -> librosa.load(path) (defaults are fine).
#   Need a SPECIFIC sample rate (ASR / model)        -> librosa.load(path, sr=N, mono=True).
#   Need precision over resampling                   -> sr=None on read; explicit resample.
#   Need only a slice                                -> offset= + duration= (saves decode work).
#   Stereo audio (music)                             -> mono=False; expect (2, n) shape.
#   Many short reads (training)                      -> res_type="kaiser_fast" everywhere.
#   Lossless / 24-bit / float32 file                 -> use soundfile.read directly to keep dtype.
#   File is 8-bit / mu-law / a-law (telephony)       -> soundfile handles those; librosa doesn't.

# Anti-pattern:
#   y, sr = librosa.load(path)               # then assume sr matches the file
# librosa silently resamples to 22050 by default. If you needed the file's
# native rate (e.g. you want to write back at the same sr), you have to
# pass sr=None. The most common librosa bug.
```

## Decision Rule

```text
Want a quick look at any audio file              -> librosa.load(path) (defaults are fine).
Need a SPECIFIC sample rate (ASR / model)        -> librosa.load(path, sr=N, mono=True).
Need precision over resampling                   -> sr=None on read; explicit resample.
Need only a slice                                -> offset= + duration= (saves decode work).
Stereo audio (music)                             -> mono=False; expect (2, n) shape.
Many short reads (training)                      -> res_type="kaiser_fast" everywhere.
Lossless / 24-bit / float32 file                 -> use soundfile.read directly to keep dtype.
File is 8-bit / mu-law / a-law (telephony)       -> soundfile handles those; librosa doesn't.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   y, sr = librosa.load(path)               # then assume sr matches the file
> librosa silently resamples to 22050 by default. If you needed the file's
> native rate (e.g. you want to write back at the same sr), you have to
> pass sr=None. The most common librosa bug.

## Tips

- `sr=None` keeps the file's native rate — use it whenever you don't want resampling.
- Default `sr=22050` and `mono=True` are convenient for ML but wrong for music/production.
- librosa stereo shape is `(2, n)` (channels-first) — different from soundfile's `(n, 2)`.
- For loading speed, `res_type='kaiser_fast'` is ~5x faster than the default `kaiser_best` with imperceptible quality loss.
- For lossless or telephony formats (mu-law/a-law/24-bit), use `soundfile` directly — librosa only returns float32.

## Common Mistake

> [!warning] Assuming `librosa.load(path)` returns the file's native rate. It defaults to 22050 Hz and silently resamples. Pass `sr=None` to disable.

## See Also

- [[Sections/audio-dsp/librosa/librosa-stft-spectrogram|librosa.stft / display.specshow — spectrograms (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/librosa-mfcc-features|librosa.feature.mfcc — features for classical audio ML (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/_Index|Audio & DSP → librosa — analysis and feature extraction]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

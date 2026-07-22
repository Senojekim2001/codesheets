---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "scipy-signal"
id: "scipy-signal-filters"
title: "scipy.signal — IIR/FIR filters, convolution"
category: "scipy-signal"
subtitle: "butter (IIR design, output='sos' for stability), firwin (FIR design), sosfiltfilt (zero-phase, offline) vs sosfilt (causal, streaming), filtfilt (transfer-fn form, less stable than sos), Nyquist normalization, scipy.signal.fftconvolve for long impulse responses"
signature_short: "sos = butter(N=4, Wn=cutoff_hz, btype='low', fs=sr, output='sos'); y = sosfiltfilt(sos, x)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.signal — IIR/FIR filters, convolution"
  - "scipy-signal-filters"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/scipy-signal"
  - "category/scipy-signal"
  - "tier/tiered"
---

# scipy.signal — IIR/FIR filters, convolution

> butter (IIR design, output='sos' for stability), firwin (FIR design), sosfiltfilt (zero-phase, offline) vs sosfilt (causal, streaming), filtfilt (transfer-fn form, less stable than sos), Nyquist normalization, scipy.signal.fftconvolve for long impulse responses

## Overview

For an IIR filter, `butter(N, Wn, btype, fs=, output='sos')` returns second-order sections — the numerically stable form. Apply with `sosfiltfilt` for zero-phase (forward-backward — only valid offline) or `sosfilt` for streaming/causal. For FIR, use `firwin` to design taps; FIRs are always stable but need many more taps for the same rolloff. `fftconvolve` is the fast convolution for long impulse responses (e.g., reverb). Three depths solve the SAME task — high-pass at 80 Hz to remove rumble — at depths: bare `butter` + `lfilter` (phase shift), `butter(output='sos')` + `sosfiltfilt` (zero-phase), production helper that handles edge effects with `padlen` and chained band-pass.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — High-pass at 80 Hz to kill low rumble.
- **Junior** — SAME — high-pass at 80 Hz — zero-phase, numerically stable.
- **Senior** — SAME — high-pass at 80 Hz — production: band-pass via chained low + high pass; padlen for short signals; dispatch causal vs zero-phase based on streaming flag; FIR fallback.

## Signature

```python
sos = butter(N=4, Wn=cutoff_hz, btype='low', fs=sr, output='sos'); y = sosfiltfilt(sos, x)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - High-pass at 80 Hz to kill low rumble.
# APPROACH  - butter + lfilter with default scipy idiom.
# STRENGTHS - Two lines.
# WEAKNESSES- transfer-function form is numerically unstable for high-order
#             filters; lfilter is causal so it shifts phase by ~filter order.
import numpy as np
from scipy.signal import butter, lfilter

SR = 48000
b, a = butter(N=4, Wn=80 / (SR / 2), btype="high")    # Wn in 0..1 (Nyquist=1)
y = lfilter(b, a, x)                                   # x = your audio array
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — high-pass at 80 Hz — zero-phase, numerically stable.
# APPROACH  - butter(output='sos') + sosfiltfilt; pass fs= so cutoff is in Hz.
# STRENGTHS - No phase distortion; stable for high-order filters.
# WEAKNESSES- Forward-backward filtering is offline only (cannot be streamed).
import numpy as np
from scipy.signal import butter, sosfiltfilt

SR = 48000


def high_pass(x: np.ndarray, sr: int, cutoff_hz: float, order: int = 4) -> np.ndarray:
    sos = butter(order, cutoff_hz, btype="high", fs=sr, output="sos")
    return sosfiltfilt(sos, x)                        # zero-phase


# x = stereo: shape (n,) or (n, channels). sosfiltfilt handles both.
y = high_pass(x, SR, 80.0)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — high-pass at 80 Hz — production: band-pass via chained
#             low + high pass; padlen for short signals; dispatch causal
#             vs zero-phase based on streaming flag; FIR fallback.
# APPROACH  - Helper functions for IIR + FIR; explicit padlen; SOS form.
# STRENGTHS - Robust on short clips; streaming-aware; testable.
# WEAKNESSES- More plumbing; FIR taps for sharp rolloff are heavy.
from __future__ import annotations
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt, firwin, lfilter


def design_butter(cutoff: float | tuple[float, float], sr: int,
                  *, btype: str = "low", order: int = 4) -> np.ndarray:
    """Return SOS for a Butterworth filter; cutoff in Hz."""
    return butter(order, cutoff, btype=btype, fs=sr, output="sos")


def apply_iir(x: np.ndarray, sos: np.ndarray, *,
              streaming: bool = False) -> np.ndarray:
    """sosfiltfilt for offline (zero-phase); sosfilt for streaming/causal."""
    if streaming:
        return sosfilt(sos, x, axis=0)
    # padlen prevents 'edge effects' on short signals.
    padlen = min(3 * sos.shape[0], len(x) - 1)
    return sosfiltfilt(sos, x, padlen=padlen, axis=0)


def design_fir_lowpass(cutoff_hz: float, sr: int,
                       n_taps: int = 257, window: str = "hamming") -> np.ndarray:
    """Linear-phase FIR; n_taps odd recommended."""
    return firwin(n_taps, cutoff_hz, fs=sr, window=window)


def apply_fir(x: np.ndarray, h: np.ndarray) -> np.ndarray:
    return lfilter(h, [1.0], x, axis=0)


# --- Use cases ---
SR = 48000

# 1) Voice band-pass: 80 Hz - 8 kHz (chain HP + LP via single SOS).
sos_voice = butter(4, [80, 8000], btype="band", fs=SR, output="sos")
y = apply_iir(x, sos_voice, streaming=False)

# 2) Real-time high-pass for streaming: causal sosfilt + state.
sos_rumble = design_butter(80.0, SR, btype="high", order=4)
def rumble_filter_state(zi=None):
    return zi if zi is not None else np.zeros(
        (sos_rumble.shape[0], 2)
    )
# In a callback: y_block, zi = sosfilt(sos_rumble, x_block, zi=zi)

# 3) Sharp anti-alias: linear-phase FIR with many taps.
h = design_fir_lowpass(cutoff_hz=8000, sr=SR, n_taps=513)
y_aa = apply_fir(x, h)

# Decision rule:
#   Offline analysis, want no phase distortion       -> sosfiltfilt (forward-backward).
#   Streaming / real-time                            -> sosfilt with zi state across blocks.
#   Need exact linear phase (e.g. EQ)                -> FIR via firwin + lfilter.
#   Short impulse response, low order               -> butter or cheby1.
#   Long convolution (reverb, room IR)               -> scipy.signal.fftconvolve.
#   Need to remove a single frequency                -> iirnotch (designs a notch SOS).
#   Computing transfer-function poles/zeros          -> design with output='ba' for analysis,
#                                                       NEVER for application (use SOS).

# Anti-pattern:
#   b, a = butter(8, ...); y = lfilter(b, a, x)
# 8th-order BA-form filter on 32-bit floats blows up numerically. Always
# request output='sos' for IIR design and use sosfilt / sosfiltfilt.
```

## Decision Rule

```text
Offline analysis, want no phase distortion       -> sosfiltfilt (forward-backward).
Streaming / real-time                            -> sosfilt with zi state across blocks.
Need exact linear phase (e.g. EQ)                -> FIR via firwin + lfilter.
Short impulse response, low order               -> butter or cheby1.
Long convolution (reverb, room IR)               -> scipy.signal.fftconvolve.
Need to remove a single frequency                -> iirnotch (designs a notch SOS).
Computing transfer-function poles/zeros          -> design with output='ba' for analysis,
                                                    NEVER for application (use SOS).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   b, a = butter(8, ...); y = lfilter(b, a, x)
> 8th-order BA-form filter on 32-bit floats blows up numerically. Always
> request output='sos' for IIR design and use sosfilt / sosfiltfilt.

## Tips

- Use `output='sos'` for any IIR filter of order > ~4 — second-order sections are numerically stable.
- `sosfiltfilt` (zero-phase) is offline-only — it filters forward then backward.
- For streaming, pass `zi=` filter state through `sosfilt` to keep continuity across blocks.
- FIR (linear phase) requires many taps for sharp rolloff — `firwin` + `lfilter` is the path.
- `fftconvolve` beats `convolve` once kernel length exceeds ~50; always benchmark before committing.

## Common Mistake

> [!warning] Designing a high-order IIR with `output='ba'` (default) and applying with `lfilter`. Numerical errors balloon and the filter goes unstable. Always use SOS.

## See Also

- [[Sections/audio-dsp/scipy-signal/scipy-signal-windows|scipy.signal.windows / spectral leakage (Audio & DSP)]]
- [[Sections/audio-dsp/scipy-signal/_Index|Audio & DSP → scipy.signal — DSP primitives]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

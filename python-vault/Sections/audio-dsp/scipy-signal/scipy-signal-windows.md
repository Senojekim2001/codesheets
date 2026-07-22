---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "scipy-signal"
id: "scipy-signal-windows"
title: "scipy.signal.windows / spectral leakage"
category: "scipy-signal"
subtitle: "scipy.signal.windows.hann / hamming / blackman / kaiser / flattop, Welch averaging (scipy.signal.welch), main-lobe width vs sidelobe rejection trade-off, COLA condition for OLA reconstruction, Parseval/normalization gotchas"
signature_short: "w = scipy.signal.windows.hann(N); X = np.fft.rfft(x * w); f, P = scipy.signal.welch(x, fs=sr, nperseg=, window=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.signal.windows / spectral leakage"
  - "scipy-signal-windows"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/scipy-signal"
  - "category/scipy-signal"
  - "tier/tiered"
---

# scipy.signal.windows / spectral leakage

> scipy.signal.windows.hann / hamming / blackman / kaiser / flattop, Welch averaging (scipy.signal.welch), main-lobe width vs sidelobe rejection trade-off, COLA condition for OLA reconstruction, Parseval/normalization gotchas

## Overview

Multiplying a signal by a Hann window before FFT trades narrower main lobe for much lower sidelobes — much better frequency localization. Welch's method goes further: split into overlapping windows, FFT each, average the squared magnitudes. The result is a smooth power spectral density (PSD). Three depths solve the SAME task — estimate the PSD of a noisy signal — at depths: bare `np.fft.rfft` of the whole signal (leakage + noisy), `welch` with a single window choice, `welch` with explicit `nperseg`/`noverlap`/`window` chosen for the application plus units (V²/Hz).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Estimate the power spectrum of a noisy signal.
- **Junior** — SAME — PSD of noisy signal — using Welch's method (right way).
- **Senior** — SAME — PSD with Welch — production: choose nperseg from a bandwidth-resolution target, allow custom window, return results with proper dB units.

## Signature

```python
w = scipy.signal.windows.hann(N); X = np.fft.rfft(x * w); f, P = scipy.signal.welch(x, fs=sr, nperseg=, window=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Estimate the power spectrum of a noisy signal.
# APPROACH  - Single FFT of the whole signal, take magnitude squared.
# STRENGTHS - Direct.
# WEAKNESSES- Spectral leakage from the implicit rectangular window;
#             single-realization noise; no PSD normalization.
import numpy as np

x = np.random.randn(48000) + np.sin(2 * np.pi * 1000 * np.arange(48000) / 48000)
SR = 48000

X = np.fft.rfft(x)
freqs = np.fft.rfftfreq(len(x), 1 / SR)
power = np.abs(X) ** 2
print(freqs[np.argmax(power)])                       # ~1000.0 Hz
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — PSD of noisy signal — using Welch's method (right way).
# APPROACH  - scipy.signal.welch with a Hann window.
# STRENGTHS - Averaged across overlapping segments; lower variance;
#             returns a proper PSD in V**2/Hz.
# WEAKNESSES- Defaults (nperseg=256, hann) may not match your bandwidth needs.
import numpy as np
from scipy.signal import welch

SR = 48000
x = np.random.randn(48000) + np.sin(2 * np.pi * 1000 * np.arange(48000) / SR)

freqs, psd = welch(x, fs=SR, nperseg=2048, window="hann")
print(freqs.shape, psd.shape)                        # (1025,) (1025,)
print(freqs[np.argmax(psd)])                          # ~1000.0 Hz
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — PSD with Welch — production: choose nperseg from a
#             bandwidth-resolution target, allow custom window, return
#             results with proper dB units.
# APPROACH  - Helper that derives nperseg from desired Hz resolution;
#             returns dict with freqs, PSD (linear), PSD_dB.
# STRENGTHS - Tunable resolution; consistent units.
# WEAKNESSES- Resolution / variance trade-off is fundamental - you can't
#             beat 1/T uncertainty with longer N alone.
from __future__ import annotations
import numpy as np
from scipy.signal import welch
from scipy.signal.windows import get_window


def estimate_psd(
    x: np.ndarray, sr: int, *,
    bandwidth_hz: float = 5.0,
    overlap: float = 0.5,
    window: str = "hann",
    detrend: str | bool = "constant",
) -> dict:
    """
    PSD via Welch with nperseg derived from desired bandwidth.
    bandwidth_hz: roughly 1.5 * (sr / nperseg) for hann.
    """
    nperseg = int(round(1.5 * sr / bandwidth_hz))
    nperseg = min(nperseg, len(x))
    noverlap = int(round(overlap * nperseg))

    f, psd = welch(
        x, fs=sr, nperseg=nperseg, noverlap=noverlap,
        window=window, detrend=detrend, scaling="density",
    )
    return {
        "freqs":  f,                                  # Hz
        "psd":    psd,                                # V**2/Hz
        "psd_db": 10.0 * np.log10(np.maximum(psd, 1e-20)),
    }


# Demonstrate window choice trade-off.
def show_window_tradeoffs(N: int = 1024) -> None:
    for name in ("boxcar", "hann", "hamming", "blackman", "flattop", ("kaiser", 8.6)):
        w = get_window(name, N)
        # Spectrum of the window itself reveals main-lobe width and sidelobe level.
        W = np.abs(np.fft.fftshift(np.fft.fft(w / w.sum(), 8 * N))) ** 2
        # main-lobe width at -3 dB (samples) - quick proxy.
        peak = W.max()
        m3 = np.where(W > peak * 0.5)[0]
        width = m3[-1] - m3[0]
        max_side = 10 * np.log10(W[W < W.max() * 0.99].max() / peak + 1e-12)
        print(f"{str(name):<18} width≈{width:4d}  max sidelobe ≈ {max_side:6.1f} dB")


SR = 48000
x = np.random.randn(int(2 * SR)) + np.sin(2 * np.pi * 1000 * np.arange(int(2 * SR)) / SR)
result = estimate_psd(x, SR, bandwidth_hz=2.0, window="hann")
print(result["freqs"][np.argmax(result["psd"])])     # ~1000

# Decision rule:
#   General-purpose spectrum               -> hann (good leakage suppression, moderate main lobe).
#   Tightest main lobe, max leakage        -> rectangular ('boxcar'); rarely a good choice.
#   Need accurate amplitude reading        -> flattop (very wide main lobe, very flat).
#   Need to maximize SNR for a tone        -> blackman or kaiser (beta>=8).
#   Lowest variance PSD                    -> Welch with many overlapping segments.
#   Stationary signal, want one PSD        -> nperseg = N, noverlap=0 (Bartlett).
#   Rapidly changing spectrum              -> short nperseg + spectrogram.
#   Need invertible STFT (resynth)         -> hann with 50% or 75% overlap (COLA).

# Anti-pattern:
#   X = np.fft.rfft(x)                          # rectangular window
#   psd = np.abs(X) ** 2                         # not normalized
# Two bugs: (1) leakage smears narrowband peaks across many bins; (2)
# magnitude-squared is not a PSD - need /sr/N and a window normalization
# correction. Use scipy.signal.welch when you want a real PSD.
```

## Decision Rule

```text
General-purpose spectrum               -> hann (good leakage suppression, moderate main lobe).
Tightest main lobe, max leakage        -> rectangular ('boxcar'); rarely a good choice.
Need accurate amplitude reading        -> flattop (very wide main lobe, very flat).
Need to maximize SNR for a tone        -> blackman or kaiser (beta>=8).
Lowest variance PSD                    -> Welch with many overlapping segments.
Stationary signal, want one PSD        -> nperseg = N, noverlap=0 (Bartlett).
Rapidly changing spectrum              -> short nperseg + spectrogram.
Need invertible STFT (resynth)         -> hann with 50% or 75% overlap (COLA).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   X = np.fft.rfft(x)                          # rectangular window
>   psd = np.abs(X) ** 2                         # not normalized
> Two bugs: (1) leakage smears narrowband peaks across many bins; (2)
> magnitude-squared is not a PSD - need /sr/N and a window normalization
> correction. Use scipy.signal.welch when you want a real PSD.

## Tips

- A rectangular window (no window) gives narrow main lobe but huge sidelobes — bad leakage.
- Hann is the all-purpose default: good leakage suppression, moderate main-lobe width.
- Use `flattop` when amplitude accuracy matters (calibration); use `blackman`/`kaiser` for max SNR.
- Welch's method = split + window + FFT + average — much lower variance than a single FFT.
- For invertible STFT (e.g., spectral subtraction → reconstruct), use Hann with 50%/75% overlap (COLA condition).

## Common Mistake

> [!warning] Reporting `np.abs(np.fft.rfft(x))**2` as a "spectrum" — it's leakage-corrupted and not a proper PSD. Use `scipy.signal.welch` with a window.

## See Also

- [[Sections/audio-dsp/scipy-signal/scipy-signal-filters|scipy.signal — IIR/FIR filters, convolution (Audio & DSP)]]
- [[Sections/audio-dsp/scipy-signal/_Index|Audio & DSP → scipy.signal — DSP primitives]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "librosa"
id: "librosa-stft-spectrogram"
title: "librosa.stft / display.specshow — spectrograms"
category: "librosa"
subtitle: "librosa.stft (n_fft=2048, hop_length=512, win_length, window='hann'), abs() for magnitude, amplitude_to_db (ref=np.max), librosa.display.specshow (y_axis='log', x_axis='time'), mel-scale alternative (librosa.feature.melspectrogram), power vs amplitude"
signature_short: "D = librosa.stft(y, n_fft=2048, hop_length=512); S = np.abs(D); S_db = librosa.amplitude_to_db(S, ref=np.max)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "librosa.stft / display.specshow — spectrograms"
  - "librosa-stft-spectrogram"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/librosa"
  - "category/librosa"
  - "tier/tiered"
---

# librosa.stft / display.specshow — spectrograms

> librosa.stft (n_fft=2048, hop_length=512, win_length, window='hann'), abs() for magnitude, amplitude_to_db (ref=np.max), librosa.display.specshow (y_axis='log', x_axis='time'), mel-scale alternative (librosa.feature.melspectrogram), power vs amplitude

## Overview

STFT is the workhorse spectral representation. `n_fft` controls frequency bins (more = finer freq, less time); `hop_length` controls overlap (smaller = smoother, more frames). Convert magnitude to dB with `amplitude_to_db(ref=np.max)` so the loudest peak is 0 dB. For ML, prefer mel spectrograms (`librosa.feature.melspectrogram`) — log-frequency bins matched to human hearing. Three depths solve the SAME task — show a magnitude spectrogram of an audio clip — at depths: stft + abs + matplotlib.imshow → librosa.display.specshow with proper axes → mel-spectrogram with dB scaling and explicit window/hop chosen for the application.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Display a magnitude spectrogram of an audio clip.
- **Junior** — SAME — spectrogram — properly labeled axes, dB scale.
- **Senior** — SAME — spectrogram — production: mel scale (matches hearing), dB-scaled, choice of n_fft/hop matched to use case.

## Signature

```python
D = librosa.stft(y, n_fft=2048, hop_length=512); S = np.abs(D); S_db = librosa.amplitude_to_db(S, ref=np.max)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Display a magnitude spectrogram of an audio clip.
# APPROACH  - stft, abs, plt.imshow.
# STRENGTHS - Demonstrates the math.
# WEAKNESSES- Axes are bin indices, not Hz/seconds; linear amplitude
#             washes out detail.
import librosa
import numpy as np
import matplotlib.pyplot as plt

y, sr = librosa.load(librosa.example("trumpet"), sr=None)

D = librosa.stft(y, n_fft=2048, hop_length=512)       # complex (1025, n_frames)
S = np.abs(D)                                         # magnitude

plt.imshow(S, origin="lower", aspect="auto")
plt.title("magnitude spectrogram (linear)")
plt.savefig("spec.png")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — spectrogram — properly labeled axes, dB scale.
# APPROACH  - amplitude_to_db + librosa.display.specshow.
# STRENGTHS - Real frequency / time axes; dB reveals quiet detail.
# WEAKNESSES- Linear-frequency axis still dwarfs everything < 1 kHz.
import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt

y, sr = librosa.load(librosa.example("trumpet"), sr=None)

D = librosa.stft(y, n_fft=2048, hop_length=512)
S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max) # 0 dB = peak

fig, ax = plt.subplots()
img = librosa.display.specshow(
    S_db, sr=sr, hop_length=512,
    x_axis="time", y_axis="hz", ax=ax,
)
fig.colorbar(img, ax=ax, format="%+2.0f dB")
ax.set_title("STFT magnitude (dB)")
plt.savefig("spec.png")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — spectrogram — production: mel scale (matches hearing),
#             dB-scaled, choice of n_fft/hop matched to use case.
# APPROACH  - librosa.feature.melspectrogram + power_to_db; document the
#             trade-offs of n_fft / hop_length / n_mels.
# STRENGTHS - The standard input for most audio ML models; readable to humans.
# WEAKNESSES- Mel parameters are application-dependent; no single right answer.
from __future__ import annotations
import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt


def mel_db(y: np.ndarray, sr: int, *,
           n_fft: int = 2048,
           hop_length: int = 512,
           n_mels: int = 128,
           fmin: float = 20.0,
           fmax: float | None = None) -> np.ndarray:
    """Return a (n_mels, n_frames) log-mel spectrogram in dB."""
    fmax = fmax or sr / 2
    # Power mel spectrogram (squared magnitude weighted by mel filters).
    M = librosa.feature.melspectrogram(
        y=y, sr=sr,
        n_fft=n_fft, hop_length=hop_length,
        n_mels=n_mels, fmin=fmin, fmax=fmax, power=2.0,
    )
    # 10*log10 with peak as 0 dB. (For amplitude spectrograms, use
    # amplitude_to_db; for power, use power_to_db.)
    return librosa.power_to_db(M, ref=np.max)


y, sr = librosa.load(librosa.example("trumpet"), sr=None)
S_mel_db = mel_db(y, sr, n_fft=2048, hop_length=512, n_mels=128)

fig, ax = plt.subplots()
img = librosa.display.specshow(
    S_mel_db, sr=sr, hop_length=512,
    x_axis="time", y_axis="mel", ax=ax,
)
fig.colorbar(img, ax=ax, format="%+2.0f dB")
ax.set_title("Mel spectrogram (dB)")
plt.savefig("mel.png")

# Decision rule:
#   Just want to look at sound                 -> stft + amplitude_to_db + specshow.
#   Speech / general audio ML                  -> mel spectrogram (n_mels=80 or 128).
#   Music analysis (chords, harmonics)         -> stft on log-frequency or constant-Q (cqt).
#   Need fine pitch detection                  -> n_fft >= 4096; smaller hop.
#   Need fine onset detection                  -> small hop_length (128 or 256).
#   Need real-time low latency                 -> n_fft = hop_length = 512 or smaller.
#   Need invertible (resynthesize)             -> stft with center=True; istft to invert.
#   Want comparable across files                -> ref='max' is per-file; for global use ref=1.0.

# Anti-pattern:
#   plt.imshow(np.abs(D), origin='lower')   # linear amplitude
# Linear scale crushes everything but the loudest bin. Always go to dB
# (amplitude_to_db / power_to_db) for visualization.
```

## Decision Rule

```text
Just want to look at sound                 -> stft + amplitude_to_db + specshow.
Speech / general audio ML                  -> mel spectrogram (n_mels=80 or 128).
Music analysis (chords, harmonics)         -> stft on log-frequency or constant-Q (cqt).
Need fine pitch detection                  -> n_fft >= 4096; smaller hop.
Need fine onset detection                  -> small hop_length (128 or 256).
Need real-time low latency                 -> n_fft = hop_length = 512 or smaller.
Need invertible (resynthesize)             -> stft with center=True; istft to invert.
Want comparable across files                -> ref='max' is per-file; for global use ref=1.0.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   plt.imshow(np.abs(D), origin='lower')   # linear amplitude
> Linear scale crushes everything but the loudest bin. Always go to dB
> (amplitude_to_db / power_to_db) for visualization.

## Tips

- Default `n_fft=2048, hop_length=512` (= 75% overlap) is the standard starting point.
- Larger `n_fft` = better frequency resolution but worse time resolution; halve `hop_length` to compensate.
- For ML, mel spectrograms (`librosa.feature.melspectrogram`) compress to perceptually meaningful bins.
- Use `power_to_db` for power (squared) spectrograms and `amplitude_to_db` for magnitude — they're different (factor of 2).
- librosa.display.specshow expects `hop_length=` so the time axis is correct; forgetting it gives bogus seconds.

## Common Mistake

> [!warning] Plotting `np.abs(stft(y))` linearly with `imshow` — most of the dynamic range is invisible. Convert to dB first.

## See Also

- [[Sections/audio-dsp/librosa/librosa-load-resample|librosa.load / resample — load any audio file, force a sample rate (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/librosa-mfcc-features|librosa.feature.mfcc — features for classical audio ML (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/_Index|Audio & DSP → librosa — analysis and feature extraction]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

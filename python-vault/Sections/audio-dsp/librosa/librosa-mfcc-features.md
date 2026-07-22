---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "librosa"
id: "librosa-mfcc-features"
title: "librosa.feature.mfcc — features for classical audio ML"
category: "librosa"
subtitle: "librosa.feature.mfcc (n_mfcc=13 typical), delta + delta-delta features (librosa.feature.delta), cepstral mean+variance normalization (CMVN), comparison with mel spectrogram, integration with sklearn classifiers"
signature_short: "mfcc = librosa.feature.mfcc(y=, sr=, n_mfcc=13, n_fft=2048, hop_length=512); deltas = librosa.feature.delta(mfcc, order=1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "librosa.feature.mfcc — features for classical audio ML"
  - "librosa-mfcc-features"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/librosa"
  - "category/librosa"
  - "tier/tiered"
---

# librosa.feature.mfcc — features for classical audio ML

> librosa.feature.mfcc (n_mfcc=13 typical), delta + delta-delta features (librosa.feature.delta), cepstral mean+variance normalization (CMVN), comparison with mel spectrogram, integration with sklearn classifiers

## Overview

MFCC pipeline: signal → STFT → mel filterbank → log → DCT → keep first N coefficients. The first coefficient is overall loudness; coefficients 1-12 capture spectral shape. Adding delta (1st derivative) and delta-delta (2nd derivative) captures temporal context — the classic 39-dim feature vector. Three depths solve the SAME task — extract features from a clip and feed an SVM — at depths: raw mfcc.mean(axis=1) → MFCC + delta + delta-delta stacked → CMVN-normalized 39-dim features with a sklearn pipeline.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Extract MFCC features and reduce to a single per-clip vector.
- **Junior** — SAME — clip-level features — but the classic 39-dim MFCC + delta + delta-delta vector.
- **Senior** — SAME — feature-extraction pipeline for sklearn classifier — production: CMVN normalization, sklearn-compatible Transformer, stable across train/test.

## Signature

```python
mfcc = librosa.feature.mfcc(y=, sr=, n_mfcc=13, n_fft=2048, hop_length=512); deltas = librosa.feature.delta(mfcc, order=1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Extract MFCC features and reduce to a single per-clip vector.
# APPROACH  - librosa.feature.mfcc -> mean across time.
# STRENGTHS - One line per clip; works as a baseline.
# WEAKNESSES- Throws away all temporal structure; missing energy / deltas.
import librosa

y, sr = librosa.load(librosa.example("libri1"), sr=16000)

mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
print(mfcc.shape)                                     # (13, n_frames)

clip_vec = mfcc.mean(axis=1)                          # (13,) per clip
print(clip_vec.shape)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — clip-level features — but the classic 39-dim
#             MFCC + delta + delta-delta vector.
# APPROACH  - Stack mfcc, delta, delta2; mean across time.
# STRENGTHS - Standard speech/audio features; captures velocity + accel.
# WEAKNESSES- Per-clip mean still ignores order; for sequence models,
#             keep the time axis instead.
import librosa
import numpy as np

y, sr = librosa.load(librosa.example("libri1"), sr=16000)

mfcc   = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)            # (13, T)
delta  = librosa.feature.delta(mfcc, order=1)                   # 1st derivative
delta2 = librosa.feature.delta(mfcc, order=2)                   # 2nd derivative

features = np.vstack([mfcc, delta, delta2])                     # (39, T)

# Per-clip aggregation: mean and std across time -> 78-dim summary.
clip_vec = np.concatenate([features.mean(axis=1), features.std(axis=1)])
print(features.shape, clip_vec.shape)                           # (39, T) (78,)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — feature-extraction pipeline for sklearn classifier —
#             production: CMVN normalization, sklearn-compatible Transformer,
#             stable across train/test.
# APPROACH  - Custom sklearn TransformerMixin; CMVN at clip level; pipeline.
# STRENGTHS - Drop into make_pipeline(...); same transform train + infer.
# WEAKNESSES- Per-clip CMVN is a quick fix; speaker-aware normalization
#             is a research topic.
from __future__ import annotations
import librosa
import numpy as np
from pathlib import Path
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC


class MFCCSummary(BaseEstimator, TransformerMixin):
    """Extract MFCC + delta + delta2, CMVN, then per-clip mean+std."""

    def __init__(self, sr: int = 16000, n_mfcc: int = 13,
                 n_fft: int = 2048, hop_length: int = 512) -> None:
        self.sr = sr
        self.n_mfcc = n_mfcc
        self.n_fft = n_fft
        self.hop_length = hop_length

    def fit(self, X, y=None):
        return self                                   # nothing to fit

    def _features_for(self, path: Path) -> np.ndarray:
        y, _ = librosa.load(path, sr=self.sr, mono=True)
        m = librosa.feature.mfcc(
            y=y, sr=self.sr,
            n_mfcc=self.n_mfcc,
            n_fft=self.n_fft, hop_length=self.hop_length,
        )
        d1 = librosa.feature.delta(m, order=1)
        d2 = librosa.feature.delta(m, order=2)
        feats = np.vstack([m, d1, d2])                # (3*n_mfcc, T)

        # CMVN: subtract per-coefficient mean, divide by std.
        feats = (feats - feats.mean(axis=1, keepdims=True)) / (feats.std(axis=1, keepdims=True) + 1e-8)

        # Per-clip summary.
        return np.concatenate([feats.mean(axis=1), feats.std(axis=1)])

    def transform(self, paths) -> np.ndarray:
        return np.stack([self._features_for(Path(p)) for p in paths])


# --- Usage in a real pipeline ---
paths_train = ["a.wav", "b.wav", "c.wav"]            # placeholder
y_train     = [0, 1, 0]

clf = make_pipeline(
    MFCCSummary(sr=16000, n_mfcc=13),
    StandardScaler(),
    LinearSVC(),
)
# clf.fit(paths_train, y_train)
# clf.predict(["d.wav"])

# Decision rule:
#   Small dataset (< ~10k clips), classical ML       -> MFCC + delta + delta2.
#   Want a single per-clip vector                    -> mean (and std) across time.
#   Want a sequence for an HMM / CRNN                -> keep (n_features, n_frames).
#   Deep learning end-to-end                         -> use mel spectrogram instead;
#                                                       the DCT in MFCC discards info.
#   Speaker-id / emotion                             -> add chroma + spectral_contrast features.
#   Want lighter features                            -> n_mfcc=13 is the canonical default.
#   Music genre / instrument                         -> spectral_contrast + chroma + tempogram.

# Anti-pattern:
#   features = librosa.feature.mfcc(y=y, sr=sr).flatten()
#   model.predict(features.reshape(1, -1))
# .flatten() makes a per-clip vector whose length depends on duration.
# Models can't accept variable-length inputs. Aggregate across time
# (mean / std) or pad to a fixed T.
```

## Decision Rule

```text
Small dataset (< ~10k clips), classical ML       -> MFCC + delta + delta2.
Want a single per-clip vector                    -> mean (and std) across time.
Want a sequence for an HMM / CRNN                -> keep (n_features, n_frames).
Deep learning end-to-end                         -> use mel spectrogram instead;
                                                    the DCT in MFCC discards info.
Speaker-id / emotion                             -> add chroma + spectral_contrast features.
Want lighter features                            -> n_mfcc=13 is the canonical default.
Music genre / instrument                         -> spectral_contrast + chroma + tempogram.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   features = librosa.feature.mfcc(y=y, sr=sr).flatten()
>   model.predict(features.reshape(1, -1))
> .flatten() makes a per-clip vector whose length depends on duration.
> Models can't accept variable-length inputs. Aggregate across time
> (mean / std) or pad to a fixed T.

## Tips

- 13 MFCCs is the canonical count; the 0th coefficient is broadband energy (sometimes dropped).
- Add delta and delta-delta for the classic 39-dim speech feature vector.
- CMVN (cepstral mean/variance normalization) per clip removes channel and recording effects.
- For deep learning, prefer mel spectrograms — the DCT in MFCC discards information networks can use.
- `librosa.feature.delta(mfcc, order=1)` runs a Savitzky-Golay-like filter; default `width=9` is robust.

## Common Mistake

> [!warning] Flattening MFCC to a per-clip vector — length depends on clip duration, so models reject variable-length inputs. Aggregate (mean/std) or pad to a fixed time axis.

## See Also

- [[Sections/audio-dsp/librosa/librosa-load-resample|librosa.load / resample — load any audio file, force a sample rate (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/librosa-stft-spectrogram|librosa.stft / display.specshow — spectrograms (Audio & DSP)]]
- [[Sections/audio-dsp/librosa/_Index|Audio & DSP → librosa — analysis and feature extraction]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

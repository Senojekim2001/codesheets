---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "patterns"
id: "audio-librosa-vs-torchaudio"
title: "librosa vs torchaudio vs essentia — pick the audio stack"
category: "patterns"
subtitle: "librosa (CPU/NumPy, analysis, sklearn-compatible features), torchaudio (GPU, differentiable, tensor in/out, augmentations + transforms), essentia (music IR algorithms, pretrained models like classifiers + key/tempo), pydub (high-level edit + convert), interop (np.array <-> torch.Tensor)"
signature_short: "# librosa: y, sr = librosa.load(...); mfcc = librosa.feature.mfcc(...)\\n# torchaudio: wav, sr = torchaudio.load(...); mel = torchaudio.transforms.MelSpectrogram(sr)(wav)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "librosa vs torchaudio vs essentia — pick the audio stack"
  - "audio-librosa-vs-torchaudio"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# librosa vs torchaudio vs essentia — pick the audio stack

> librosa (CPU/NumPy, analysis, sklearn-compatible features), torchaudio (GPU, differentiable, tensor in/out, augmentations + transforms), essentia (music IR algorithms, pretrained models like classifiers + key/tempo), pydub (high-level edit + convert), interop (np.array <-> torch.Tensor)

## Overview

Three libraries, three contexts: librosa is the swiss-army CPU toolkit (fast iteration, NumPy-native, sklearn pipelines); torchaudio mirrors the same primitives as differentiable Tensor ops, runs on GPU, integrates with PyTorch training; essentia is the music-IR specialist with pretrained algorithms for key/tempo/genre/mood. Three depths solve the SAME task — extract a mel spectrogram from a clip — at depths: librosa for analysis → torchaudio with the same parameters → torchaudio batched on GPU as part of a PyTorch DataLoader pipeline.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Compute a mel spectrogram of one audio clip.
- **Junior** — SAME — mel spectrogram — but as a torchaudio op so it can run on GPU and backprop through.
- **Senior** — SAME — mel spectrogram — production: GPU-batched torchaudio pipeline inside a Dataset, ready for a PyTorch DataLoader.

## Signature

```python
# librosa: y, sr = librosa.load(...); mfcc = librosa.feature.mfcc(...)\n# torchaudio: wav, sr = torchaudio.load(...); mel = torchaudio.transforms.MelSpectrogram(sr)(wav)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Compute a mel spectrogram of one audio clip.
# APPROACH  - librosa - shortest path on CPU.
# STRENGTHS - Iterative; readable; sklearn-friendly.
# WEAKNESSES- Pure CPU; no batching; copies if you later move to GPU.
import librosa

y, sr = librosa.load("song.wav", sr=16000)
mel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=1024,
                                     hop_length=256, n_mels=80)
print(mel.shape)                                      # (80, n_frames) numpy
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — mel spectrogram — but as a torchaudio op so it can
#             run on GPU and backprop through.
# APPROACH  - torchaudio.load + transforms.MelSpectrogram.
# STRENGTHS - Tensor in / tensor out; GPU-able; differentiable.
# WEAKNESSES- Needs PyTorch; param naming differs slightly from librosa.
import torch
import torchaudio
import torchaudio.transforms as T

waveform, sr = torchaudio.load("song.wav")            # (channels, n_samples)
if sr != 16000:
    waveform = T.Resample(sr, 16000)(waveform); sr = 16000

mel_op = T.MelSpectrogram(
    sample_rate=sr, n_fft=1024, hop_length=256, n_mels=80,
)
mel = mel_op(waveform)                                # tensor (channels, 80, T)

# Send to GPU for free:
device = "cuda" if torch.cuda.is_available() else "cpu"
mel = mel_op.to(device)(waveform.to(device))
print(mel.shape, mel.device)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — mel spectrogram — production: GPU-batched torchaudio
#             pipeline inside a Dataset, ready for a PyTorch DataLoader.
# APPROACH  - Lazy load + on-GPU transform; mixed CPU loading + GPU compute.
# STRENGTHS - Saturates the GPU; one transform per batch; standard PyTorch.
# WEAKNESSES- Need to manage device explicitly; resampling on GPU has
#             quality trade-offs (use sox_io_backend if quality matters).
from __future__ import annotations
import torch
import torchaudio
import torchaudio.transforms as T
from torch.utils.data import Dataset, DataLoader
from pathlib import Path


SR = 16000


class AudioDataset(Dataset):
    """Returns raw waveform tensors of fixed length."""

    def __init__(self, paths: list[Path], target_seconds: float = 5.0):
        self.paths = paths
        self.n_samples = int(target_seconds * SR)

    def __len__(self): return len(self.paths)

    def __getitem__(self, i: int) -> torch.Tensor:
        wav, sr = torchaudio.load(self.paths[i])
        if sr != SR:
            wav = T.Resample(sr, SR)(wav)
        if wav.shape[0] > 1:
            wav = wav.mean(dim=0, keepdim=True)       # downmix
        # Pad / crop to fixed length.
        if wav.shape[1] < self.n_samples:
            wav = torch.nn.functional.pad(wav, (0, self.n_samples - wav.shape[1]))
        else:
            wav = wav[:, :self.n_samples]
        return wav.squeeze(0)                          # (n_samples,)


class GPUMelTransform(torch.nn.Module):
    """Run mel + log + standardize on the GPU as part of forward()."""

    def __init__(self, n_mels: int = 80) -> None:
        super().__init__()
        self.mel = T.MelSpectrogram(
            sample_rate=SR, n_fft=1024, hop_length=256,
            n_mels=n_mels, power=2.0,
        )
        self.amp_to_db = T.AmplitudeToDB(stype="power", top_db=80)

    @torch.no_grad()
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, n_samples) on GPU
        m = self.mel(x)                                # (B, n_mels, T)
        m = self.amp_to_db(m)
        # Per-sample standardize.
        mean = m.mean(dim=(1, 2), keepdim=True)
        std  = m.std(dim=(1, 2), keepdim=True) + 1e-8
        return (m - mean) / std


paths = sorted(Path("data/").glob("*.wav"))[:64]
ds = AudioDataset(paths)
loader = DataLoader(ds, batch_size=16, num_workers=4, pin_memory=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
gpu_tx = GPUMelTransform(n_mels=80).to(device)

for batch in loader:
    batch = batch.to(device, non_blocking=True)
    mel = gpu_tx(batch)
    print(mel.shape)                                   # (16, 80, T)
    break

# Decision rule:
#   Quick analysis / prototyping             -> librosa (NumPy, CPU).
#   Train a model end-to-end                  -> torchaudio (GPU, batched, differentiable).
#   Music IR (key, tempo, genre)              -> essentia (lots of pretrained algorithms).
#   Edit files (concat, fade, format convert) -> pydub.
#   Real-time effects                          -> sounddevice + scipy.signal callbacks.
#   Need ASR                                   -> faster-whisper / wav2vec2 + torchaudio loading.
#   Want consistent train+infer mel            -> torchaudio (matches what the model trained on).
#   Want consistent feature versions           -> librosa pinned + cache to disk.

# Anti-pattern:
#   features = librosa.feature.melspectrogram(...)  # CPU per item
#   x = torch.from_numpy(features).cuda()            # then send to GPU
# Per-clip CPU mel + numpy<->torch copy is the bottleneck. If you train
# on GPU, do the mel on GPU with torchaudio - one batched call vs
# thousands of single-item ones.
```

## Decision Rule

```text
Quick analysis / prototyping             -> librosa (NumPy, CPU).
Train a model end-to-end                  -> torchaudio (GPU, batched, differentiable).
Music IR (key, tempo, genre)              -> essentia (lots of pretrained algorithms).
Edit files (concat, fade, format convert) -> pydub.
Real-time effects                          -> sounddevice + scipy.signal callbacks.
Need ASR                                   -> faster-whisper / wav2vec2 + torchaudio loading.
Want consistent train+infer mel            -> torchaudio (matches what the model trained on).
Want consistent feature versions           -> librosa pinned + cache to disk.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   features = librosa.feature.melspectrogram(...)  # CPU per item
>   x = torch.from_numpy(features).cuda()            # then send to GPU
> Per-clip CPU mel + numpy<->torch copy is the bottleneck. If you train
> on GPU, do the mel on GPU with torchaudio - one batched call vs
> thousands of single-item ones.

## Tips

- librosa is NumPy/CPU first — best for iteration, sklearn pipelines, and feature exports to disk.
- torchaudio mirrors librosa's primitives as differentiable tensor ops — best inside a training loop on GPU.
- essentia ships pretrained algorithms (key, tempo, genre, mood) — best for music IR without training your own.
- pydub is for editing/converting (concat, fade, export) — not analysis.
- For real-time effects, drop down to `sounddevice` + `scipy.signal` and stream blocks.

## Common Mistake

> [!warning] Computing features in librosa during a PyTorch training loop — the NumPy↔Tensor copy and CPU compute become the bottleneck. Use torchaudio on GPU.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework (Quantum)]]
- [[Sections/audio-dsp/patterns/_Index|Audio & DSP → When to reach for which audio tool]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

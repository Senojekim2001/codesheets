---
type: "file-index"
domain: "python"
file: "audio-dsp"
title: "Audio & DSP"
tags:
  - "python"
  - "python/audio-dsp"
  - "index"
---

# Audio & DSP

> 9 entries across 5 sections.

## librosa — analysis and feature extraction · 3

- [[Sections/audio-dsp/librosa/librosa-load-resample|librosa.load / resample — load any audio file, force a sample rate]] — librosa.load reads any format ffmpeg/soundfile can decode and returns float32 samples in [-1, 1]. By default it **resamples to 22050 Hz and downmixes to mono** — fine for ML, wrong for production audio. Pass `sr=None` to keep the file's native rate, `mono=False` to keep stereo.
- [[Sections/audio-dsp/librosa/librosa-stft-spectrogram|librosa.stft / display.specshow — spectrograms]] — STFT slices audio into overlapping windows and FFTs each one. Output: a complex matrix `(n_fft//2 + 1, n_frames)`. Use `np.abs(D)` for the magnitude spectrogram, `librosa.amplitude_to_db` to turn it into dB. The first parameter to think about is `n_fft` (frequency resolution); `hop_length` is the second (time resolution).
- [[Sections/audio-dsp/librosa/librosa-mfcc-features|librosa.feature.mfcc — features for classical audio ML]] — MFCCs are the textbook audio features: log-mel spectrogram → DCT → keep first ~13 coefficients. Cepstral coefficients (slowly-varying spectral envelope) suit speech and instrument timbre. Modern deep learning prefers mel spectrograms directly, but MFCC is still strong for small datasets and classical pipelines.

## sounddevice — playback, recording, streams · 2

- [[Sections/audio-dsp/sounddevice/sounddevice-play-record|sd.play / sd.rec — synchronous playback and recording]] — sounddevice is the cross-platform PortAudio wrapper. `sd.play(y, sr)` plays a NumPy array; `sd.rec(frames, sr, channels)` records into one. `sd.wait()` blocks until done. Float32 in [-1, 1] is the safe dtype.
- [[Sections/audio-dsp/sounddevice/sounddevice-stream-callback|sd.InputStream / OutputStream — real-time audio]] — For real-time pipelines (live FX, transcription, VAD): create a `Stream`, give it a callback that runs on the audio thread, and process buffers as they arrive. Block size and sample rate set the latency budget; the callback must finish in less than `blocksize/sr` seconds — every time, no exceptions.

## scipy.signal — DSP primitives · 2

- [[Sections/audio-dsp/scipy-signal/scipy-signal-filters|scipy.signal — IIR/FIR filters, convolution]] — `scipy.signal` covers the DSP basics: design filters with `butter`/`firwin`, apply them with `sosfiltfilt` (zero-phase) or `lfilter` (causal). Use `sosfiltfilt` for offline analysis (no phase distortion), `lfilter`/`sosfilt` for real-time (causal but introduces phase delay).
- [[Sections/audio-dsp/scipy-signal/scipy-signal-windows|scipy.signal.windows / spectral leakage]] — When you take an FFT of a finite signal, you implicitly multiply by a rectangular window — this causes spectral leakage. Apply a tapered window (Hann, Hamming, Blackman, Kaiser) before FFT to suppress sidelobes. The choice trades main-lobe width vs sidelobe height.

## File I/O — soundfile, pydub, wave · 1

- [[Sections/audio-dsp/formats/audio-file-formats|soundfile / pydub / wave — picking a file I/O library]] — Three libraries, three roles: `soundfile` (read/write WAV/FLAC/OGG with full bit depth), `pydub` (high-level edit + convert via ffmpeg), `wave` (stdlib, only PCM WAV). Use `soundfile` 90% of the time; `pydub` for "concat MP3s and trim silence"; `wave` only when stdlib-only matters.

## When to reach for which audio tool · 1

- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack]] — librosa = analysis and feature extraction (CPU, NumPy). torchaudio = same primitives as differentiable PyTorch ops, GPU-friendly, training-ready. essentia = music-specific (key/tempo/genre, lots of pretrained algorithms). Pick by where the work runs and what comes after.

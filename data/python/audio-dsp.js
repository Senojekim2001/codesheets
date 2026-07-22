export const meta = {
  "id": "audio-dsp",
  "label": "Audio & DSP",
  "icon": "🔊",
  "description": "Audio in Python: librosa for analysis (load, resample, STFT, MFCC), sounddevice for live capture/playback, scipy.signal for filters and DSP primitives, soundfile/pydub for file I/O. Sample rate (sr), mono vs stereo channels, and float32 in [-1, 1] are the three things you keep getting wrong; nail those and the rest is signal processing."
}

export const sections = [

  // ── Section 1: librosa — analysis and feature extraction ─────────────────────────────────────────
  {
    id: "librosa",
    title: "librosa — analysis and feature extraction",
    entries: [
      {
        id: "librosa-load-resample",
        fn: "librosa.load / resample — load any audio file, force a sample rate",
        desc: "librosa.load reads any format ffmpeg/soundfile can decode and returns float32 samples in [-1, 1]. By default it **resamples to 22050 Hz and downmixes to mono** — fine for ML, wrong for production audio. Pass `sr=None` to keep the file's native rate, `mono=False` to keep stereo.",
        category: "librosa",
        subtitle: "librosa.load (sr=None for native, mono=False for stereo, offset, duration), float32 in [-1, 1] convention, librosa.resample (default kaiser_best is slow), output shape (n,) mono vs (2, n) stereo (channels-first), sr precedence (file vs requested vs None)",
        signature: "y, sr = librosa.load(path, sr=None, mono=False, offset=0.0, duration=None)",
        descLong: "librosa.load is the friendliest reader. The two parameters that matter most are `sr` (None to preserve native, an int to force-resample) and `mono` (True downmixes to a single channel). Returns `(y, sr)` where `y` is float32 in [-1, 1]. Stereo shape is `(2, n)` — channels-first — different from soundfile's `(n, 2)`. Three depths solve the SAME task — load a stereo MP3 and resample to 16 kHz mono — at depths: minimal `librosa.load(path)` accepting whatever defaults → explicit `sr=16000, mono=True` with offset/duration → preserve native, then resample explicitly with `kaiser_fast` and downmix manually for control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Load an audio file and inspect its shape and rate.\n# APPROACH  - librosa.load with default args.\n# STRENGTHS - One line.\n# WEAKNESSES- Default sr=22050 silently resamples; default mono=True\n#             throws away the second channel. Surprising defaults.\nimport librosa\n\ny, sr = librosa.load(\"song.mp3\")                      # downmixed mono @ 22050 Hz\nprint(y.shape, y.dtype, sr)                           # e.g. (4567232,) float32 22050\nprint(y.min(), y.max())                               # in [-1, 1]\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — load a stereo MP3 — but at 16 kHz mono for ASR.\n# APPROACH  - sr=16000, mono=True, slice with offset/duration.\n# STRENGTHS - One call gives you exactly the input most ASR models want.\n# WEAKNESSES- Default kaiser_best resampler is high-quality but slow.\nimport librosa\n\ny, sr = librosa.load(\n    \"song.mp3\",\n    sr=16000,                                         # force resample to 16 kHz\n    mono=True,                                        # downmix L+R -> mean\n    offset=10.0,                                      # start 10 seconds in\n    duration=30.0,                                    # take 30 seconds\n)\nprint(y.shape, sr)                                    # (480000,) 16000\n\n# Tip: librosa.load uses soundfile for WAV/FLAC/OGG; it falls back to\n# audioread (which uses ffmpeg) for MP3/M4A. Make sure ffmpeg is on PATH\n# for compressed formats.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — stereo MP3 -> 16 kHz mono — production: preserve native\n#             rate on read; resample with the explicit fast kernel; downmix\n#             with control over channel weights; clip-safe.\n# APPROACH  - sr=None + mono=False on read; manual resample + downmix.\n# STRENGTHS - Faster, predictable; lets you keep stereo for some pipelines\n#             and mono for others without re-decoding.\n# WEAKNESSES- More steps; have to know librosa's resample kernels.\nfrom __future__ import annotations\nimport numpy as np\nimport librosa\n\n\ndef load_for_asr(path: str, target_sr: int = 16000) -> np.ndarray:\n    \"\"\"Load any file as 16 kHz mono float32 in [-1, 1], no surprises.\"\"\"\n    # 1) Read at NATIVE rate, keep all channels.\n    y, sr = librosa.load(path, sr=None, mono=False)\n\n    # 2) Downmix to mono. y is shape (n,) for already-mono files,\n    #    (2, n) for stereo. Average channels-axis-aware.\n    if y.ndim == 2:\n        y = y.mean(axis=0)                            # equal-weight L/R\n\n    # 3) Resample with the FAST kernel (kaiser_fast is ~5x faster than the\n    #    default kaiser_best with negligible perceptual loss).\n    if sr != target_sr:\n        y = librosa.resample(y, orig_sr=sr, target_sr=target_sr,\n                             res_type=\"kaiser_fast\")\n\n    # 4) Defensive clip - resampling can introduce tiny overshoots.\n    y = np.clip(y, -1.0, 1.0).astype(np.float32, copy=False)\n    return y\n\n\ndef load_stereo(path: str, target_sr: int = 44100) -> np.ndarray:\n    \"\"\"Same idea but keep stereo (2, n) for music pipelines.\"\"\"\n    y, sr = librosa.load(path, sr=None, mono=False)\n    if y.ndim == 1:\n        y = np.stack([y, y])                          # mono -> fake stereo\n    if sr != target_sr:\n        y = np.stack([\n            librosa.resample(y[c], orig_sr=sr, target_sr=target_sr,\n                             res_type=\"kaiser_fast\")\n            for c in range(y.shape[0])\n        ])\n    return np.clip(y, -1.0, 1.0).astype(np.float32, copy=False)\n\n\nasr_input = load_for_asr(\"song.mp3\")\nprint(asr_input.shape, asr_input.dtype)\n\n# Decision rule:\n#   Want a quick look at any audio file              -> librosa.load(path) (defaults are fine).\n#   Need a SPECIFIC sample rate (ASR / model)        -> librosa.load(path, sr=N, mono=True).\n#   Need precision over resampling                   -> sr=None on read; explicit resample.\n#   Need only a slice                                -> offset= + duration= (saves decode work).\n#   Stereo audio (music)                             -> mono=False; expect (2, n) shape.\n#   Many short reads (training)                      -> res_type=\"kaiser_fast\" everywhere.\n#   Lossless / 24-bit / float32 file                 -> use soundfile.read directly to keep dtype.\n#   File is 8-bit / mu-law / a-law (telephony)       -> soundfile handles those; librosa doesn't.\n\n# Anti-pattern:\n#   y, sr = librosa.load(path)               # then assume sr matches the file\n# librosa silently resamples to 22050 by default. If you needed the file's\n# native rate (e.g. you want to write back at the same sr), you have to\n# pass sr=None. The most common librosa bug.\n"
                  }
        ],
        tips: [
                  "`sr=None` keeps the file's native rate — use it whenever you don't want resampling.",
                  "Default `sr=22050` and `mono=True` are convenient for ML but wrong for music/production.",
                  "librosa stereo shape is `(2, n)` (channels-first) — different from soundfile's `(n, 2)`.",
                  "For loading speed, `res_type='kaiser_fast'` is ~5x faster than the default `kaiser_best` with imperceptible quality loss.",
                  "For lossless or telephony formats (mu-law/a-law/24-bit), use `soundfile` directly — librosa only returns float32."
        ],
        mistake: "Assuming `librosa.load(path)` returns the file's native rate. It defaults to 22050 Hz and silently resamples. Pass `sr=None` to disable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "librosa-stft-spectrogram",
        fn: "librosa.stft / display.specshow — spectrograms",
        desc: "STFT slices audio into overlapping windows and FFTs each one. Output: a complex matrix `(n_fft//2 + 1, n_frames)`. Use `np.abs(D)` for the magnitude spectrogram, `librosa.amplitude_to_db` to turn it into dB. The first parameter to think about is `n_fft` (frequency resolution); `hop_length` is the second (time resolution).",
        category: "librosa",
        subtitle: "librosa.stft (n_fft=2048, hop_length=512, win_length, window='hann'), abs() for magnitude, amplitude_to_db (ref=np.max), librosa.display.specshow (y_axis='log', x_axis='time'), mel-scale alternative (librosa.feature.melspectrogram), power vs amplitude",
        signature: "D = librosa.stft(y, n_fft=2048, hop_length=512); S = np.abs(D); S_db = librosa.amplitude_to_db(S, ref=np.max)",
        descLong: "STFT is the workhorse spectral representation. `n_fft` controls frequency bins (more = finer freq, less time); `hop_length` controls overlap (smaller = smoother, more frames). Convert magnitude to dB with `amplitude_to_db(ref=np.max)` so the loudest peak is 0 dB. For ML, prefer mel spectrograms (`librosa.feature.melspectrogram`) — log-frequency bins matched to human hearing. Three depths solve the SAME task — show a magnitude spectrogram of an audio clip — at depths: stft + abs + matplotlib.imshow → librosa.display.specshow with proper axes → mel-spectrogram with dB scaling and explicit window/hop chosen for the application.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Display a magnitude spectrogram of an audio clip.\n# APPROACH  - stft, abs, plt.imshow.\n# STRENGTHS - Demonstrates the math.\n# WEAKNESSES- Axes are bin indices, not Hz/seconds; linear amplitude\n#             washes out detail.\nimport librosa\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ny, sr = librosa.load(librosa.example(\"trumpet\"), sr=None)\n\nD = librosa.stft(y, n_fft=2048, hop_length=512)       # complex (1025, n_frames)\nS = np.abs(D)                                         # magnitude\n\nplt.imshow(S, origin=\"lower\", aspect=\"auto\")\nplt.title(\"magnitude spectrogram (linear)\")\nplt.savefig(\"spec.png\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — spectrogram — properly labeled axes, dB scale.\n# APPROACH  - amplitude_to_db + librosa.display.specshow.\n# STRENGTHS - Real frequency / time axes; dB reveals quiet detail.\n# WEAKNESSES- Linear-frequency axis still dwarfs everything < 1 kHz.\nimport librosa\nimport librosa.display\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ny, sr = librosa.load(librosa.example(\"trumpet\"), sr=None)\n\nD = librosa.stft(y, n_fft=2048, hop_length=512)\nS_db = librosa.amplitude_to_db(np.abs(D), ref=np.max) # 0 dB = peak\n\nfig, ax = plt.subplots()\nimg = librosa.display.specshow(\n    S_db, sr=sr, hop_length=512,\n    x_axis=\"time\", y_axis=\"hz\", ax=ax,\n)\nfig.colorbar(img, ax=ax, format=\"%+2.0f dB\")\nax.set_title(\"STFT magnitude (dB)\")\nplt.savefig(\"spec.png\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — spectrogram — production: mel scale (matches hearing),\n#             dB-scaled, choice of n_fft/hop matched to use case.\n# APPROACH  - librosa.feature.melspectrogram + power_to_db; document the\n#             trade-offs of n_fft / hop_length / n_mels.\n# STRENGTHS - The standard input for most audio ML models; readable to humans.\n# WEAKNESSES- Mel parameters are application-dependent; no single right answer.\nfrom __future__ import annotations\nimport librosa\nimport librosa.display\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n\ndef mel_db(y: np.ndarray, sr: int, *,\n           n_fft: int = 2048,\n           hop_length: int = 512,\n           n_mels: int = 128,\n           fmin: float = 20.0,\n           fmax: float | None = None) -> np.ndarray:\n    \"\"\"Return a (n_mels, n_frames) log-mel spectrogram in dB.\"\"\"\n    fmax = fmax or sr / 2\n    # Power mel spectrogram (squared magnitude weighted by mel filters).\n    M = librosa.feature.melspectrogram(\n        y=y, sr=sr,\n        n_fft=n_fft, hop_length=hop_length,\n        n_mels=n_mels, fmin=fmin, fmax=fmax, power=2.0,\n    )\n    # 10*log10 with peak as 0 dB. (For amplitude spectrograms, use\n    # amplitude_to_db; for power, use power_to_db.)\n    return librosa.power_to_db(M, ref=np.max)\n\n\ny, sr = librosa.load(librosa.example(\"trumpet\"), sr=None)\nS_mel_db = mel_db(y, sr, n_fft=2048, hop_length=512, n_mels=128)\n\nfig, ax = plt.subplots()\nimg = librosa.display.specshow(\n    S_mel_db, sr=sr, hop_length=512,\n    x_axis=\"time\", y_axis=\"mel\", ax=ax,\n)\nfig.colorbar(img, ax=ax, format=\"%+2.0f dB\")\nax.set_title(\"Mel spectrogram (dB)\")\nplt.savefig(\"mel.png\")\n\n# Decision rule:\n#   Just want to look at sound                 -> stft + amplitude_to_db + specshow.\n#   Speech / general audio ML                  -> mel spectrogram (n_mels=80 or 128).\n#   Music analysis (chords, harmonics)         -> stft on log-frequency or constant-Q (cqt).\n#   Need fine pitch detection                  -> n_fft >= 4096; smaller hop.\n#   Need fine onset detection                  -> small hop_length (128 or 256).\n#   Need real-time low latency                 -> n_fft = hop_length = 512 or smaller.\n#   Need invertible (resynthesize)             -> stft with center=True; istft to invert.\n#   Want comparable across files                -> ref='max' is per-file; for global use ref=1.0.\n\n# Anti-pattern:\n#   plt.imshow(np.abs(D), origin='lower')   # linear amplitude\n# Linear scale crushes everything but the loudest bin. Always go to dB\n# (amplitude_to_db / power_to_db) for visualization.\n"
                  }
        ],
        tips: [
                  "Default `n_fft=2048, hop_length=512` (= 75% overlap) is the standard starting point.",
                  "Larger `n_fft` = better frequency resolution but worse time resolution; halve `hop_length` to compensate.",
                  "For ML, mel spectrograms (`librosa.feature.melspectrogram`) compress to perceptually meaningful bins.",
                  "Use `power_to_db` for power (squared) spectrograms and `amplitude_to_db` for magnitude — they're different (factor of 2).",
                  "librosa.display.specshow expects `hop_length=` so the time axis is correct; forgetting it gives bogus seconds."
        ],
        mistake: "Plotting `np.abs(stft(y))` linearly with `imshow` — most of the dynamic range is invisible. Convert to dB first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "librosa-mfcc-features",
        fn: "librosa.feature.mfcc — features for classical audio ML",
        desc: "MFCCs are the textbook audio features: log-mel spectrogram → DCT → keep first ~13 coefficients. Cepstral coefficients (slowly-varying spectral envelope) suit speech and instrument timbre. Modern deep learning prefers mel spectrograms directly, but MFCC is still strong for small datasets and classical pipelines.",
        category: "librosa",
        subtitle: "librosa.feature.mfcc (n_mfcc=13 typical), delta + delta-delta features (librosa.feature.delta), cepstral mean+variance normalization (CMVN), comparison with mel spectrogram, integration with sklearn classifiers",
        signature: "mfcc = librosa.feature.mfcc(y=, sr=, n_mfcc=13, n_fft=2048, hop_length=512); deltas = librosa.feature.delta(mfcc, order=1)",
        descLong: "MFCC pipeline: signal → STFT → mel filterbank → log → DCT → keep first N coefficients. The first coefficient is overall loudness; coefficients 1-12 capture spectral shape. Adding delta (1st derivative) and delta-delta (2nd derivative) captures temporal context — the classic 39-dim feature vector. Three depths solve the SAME task — extract features from a clip and feed an SVM — at depths: raw mfcc.mean(axis=1) → MFCC + delta + delta-delta stacked → CMVN-normalized 39-dim features with a sklearn pipeline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Extract MFCC features and reduce to a single per-clip vector.\n# APPROACH  - librosa.feature.mfcc -> mean across time.\n# STRENGTHS - One line per clip; works as a baseline.\n# WEAKNESSES- Throws away all temporal structure; missing energy / deltas.\nimport librosa\n\ny, sr = librosa.load(librosa.example(\"libri1\"), sr=16000)\n\nmfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)\nprint(mfcc.shape)                                     # (13, n_frames)\n\nclip_vec = mfcc.mean(axis=1)                          # (13,) per clip\nprint(clip_vec.shape)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — clip-level features — but the classic 39-dim\n#             MFCC + delta + delta-delta vector.\n# APPROACH  - Stack mfcc, delta, delta2; mean across time.\n# STRENGTHS - Standard speech/audio features; captures velocity + accel.\n# WEAKNESSES- Per-clip mean still ignores order; for sequence models,\n#             keep the time axis instead.\nimport librosa\nimport numpy as np\n\ny, sr = librosa.load(librosa.example(\"libri1\"), sr=16000)\n\nmfcc   = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)            # (13, T)\ndelta  = librosa.feature.delta(mfcc, order=1)                   # 1st derivative\ndelta2 = librosa.feature.delta(mfcc, order=2)                   # 2nd derivative\n\nfeatures = np.vstack([mfcc, delta, delta2])                     # (39, T)\n\n# Per-clip aggregation: mean and std across time -> 78-dim summary.\nclip_vec = np.concatenate([features.mean(axis=1), features.std(axis=1)])\nprint(features.shape, clip_vec.shape)                           # (39, T) (78,)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — feature-extraction pipeline for sklearn classifier —\n#             production: CMVN normalization, sklearn-compatible Transformer,\n#             stable across train/test.\n# APPROACH  - Custom sklearn TransformerMixin; CMVN at clip level; pipeline.\n# STRENGTHS - Drop into make_pipeline(...); same transform train + infer.\n# WEAKNESSES- Per-clip CMVN is a quick fix; speaker-aware normalization\n#             is a research topic.\nfrom __future__ import annotations\nimport librosa\nimport numpy as np\nfrom pathlib import Path\nfrom sklearn.base import BaseEstimator, TransformerMixin\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import LinearSVC\n\n\nclass MFCCSummary(BaseEstimator, TransformerMixin):\n    \"\"\"Extract MFCC + delta + delta2, CMVN, then per-clip mean+std.\"\"\"\n\n    def __init__(self, sr: int = 16000, n_mfcc: int = 13,\n                 n_fft: int = 2048, hop_length: int = 512) -> None:\n        self.sr = sr\n        self.n_mfcc = n_mfcc\n        self.n_fft = n_fft\n        self.hop_length = hop_length\n\n    def fit(self, X, y=None):\n        return self                                   # nothing to fit\n\n    def _features_for(self, path: Path) -> np.ndarray:\n        y, _ = librosa.load(path, sr=self.sr, mono=True)\n        m = librosa.feature.mfcc(\n            y=y, sr=self.sr,\n            n_mfcc=self.n_mfcc,\n            n_fft=self.n_fft, hop_length=self.hop_length,\n        )\n        d1 = librosa.feature.delta(m, order=1)\n        d2 = librosa.feature.delta(m, order=2)\n        feats = np.vstack([m, d1, d2])                # (3*n_mfcc, T)\n\n        # CMVN: subtract per-coefficient mean, divide by std.\n        feats = (feats - feats.mean(axis=1, keepdims=True)) / (feats.std(axis=1, keepdims=True) + 1e-8)\n\n        # Per-clip summary.\n        return np.concatenate([feats.mean(axis=1), feats.std(axis=1)])\n\n    def transform(self, paths) -> np.ndarray:\n        return np.stack([self._features_for(Path(p)) for p in paths])\n\n\n# --- Usage in a real pipeline ---\npaths_train = [\"a.wav\", \"b.wav\", \"c.wav\"]            # placeholder\ny_train     = [0, 1, 0]\n\nclf = make_pipeline(\n    MFCCSummary(sr=16000, n_mfcc=13),\n    StandardScaler(),\n    LinearSVC(),\n)\n# clf.fit(paths_train, y_train)\n# clf.predict([\"d.wav\"])\n\n# Decision rule:\n#   Small dataset (< ~10k clips), classical ML       -> MFCC + delta + delta2.\n#   Want a single per-clip vector                    -> mean (and std) across time.\n#   Want a sequence for an HMM / CRNN                -> keep (n_features, n_frames).\n#   Deep learning end-to-end                         -> use mel spectrogram instead;\n#                                                       the DCT in MFCC discards info.\n#   Speaker-id / emotion                             -> add chroma + spectral_contrast features.\n#   Want lighter features                            -> n_mfcc=13 is the canonical default.\n#   Music genre / instrument                         -> spectral_contrast + chroma + tempogram.\n\n# Anti-pattern:\n#   features = librosa.feature.mfcc(y=y, sr=sr).flatten()\n#   model.predict(features.reshape(1, -1))\n# .flatten() makes a per-clip vector whose length depends on duration.\n# Models can't accept variable-length inputs. Aggregate across time\n# (mean / std) or pad to a fixed T.\n"
                  }
        ],
        tips: [
                  "13 MFCCs is the canonical count; the 0th coefficient is broadband energy (sometimes dropped).",
                  "Add delta and delta-delta for the classic 39-dim speech feature vector.",
                  "CMVN (cepstral mean/variance normalization) per clip removes channel and recording effects.",
                  "For deep learning, prefer mel spectrograms — the DCT in MFCC discards information networks can use.",
                  "`librosa.feature.delta(mfcc, order=1)` runs a Savitzky-Golay-like filter; default `width=9` is robust."
        ],
        mistake: "Flattening MFCC to a per-clip vector — length depends on clip duration, so models reject variable-length inputs. Aggregate (mean/std) or pad to a fixed time axis.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: sounddevice — playback, recording, streams ─────────────────────────────────────────
  {
    id: "sounddevice",
    title: "sounddevice — playback, recording, streams",
    entries: [
      {
        id: "sounddevice-play-record",
        fn: "sd.play / sd.rec — synchronous playback and recording",
        desc: "sounddevice is the cross-platform PortAudio wrapper. `sd.play(y, sr)` plays a NumPy array; `sd.rec(frames, sr, channels)` records into one. `sd.wait()` blocks until done. Float32 in [-1, 1] is the safe dtype.",
        category: "sounddevice",
        subtitle: "sd.play (blocking via sd.wait), sd.rec (returns array, fills async), sd.playrec, sd.query_devices, sd.default.device / samplerate / channels, blocking=True kwarg, sd.stop, default dtype float32",
        signature: "sd.play(y, sr); sd.wait(); rec = sd.rec(frames, sr, channels); sd.wait()",
        descLong: "sounddevice exposes PortAudio: enumerate devices with `sd.query_devices()`, set defaults via `sd.default.*`, then `play`/`rec`/`playrec`. By default `play` and `rec` start asynchronously and return immediately — you call `sd.wait()` to block until done. Three depths solve the SAME task — record 5 seconds of audio at 16 kHz mono and play it back — at depths: hardcoded `sd.rec` and `sd.play` → device discovery + dtype/channel settings → record-while-monitoring with input/output device split and a callback-based stop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Record 5 seconds, then play it back.\n# APPROACH  - sd.rec + sd.wait + sd.play.\n# STRENGTHS - Three calls.\n# WEAKNESSES- Uses default device; no error if input is wrong; assumes\n#             the system default sample rate is 16000 (often it isn't).\nimport sounddevice as sd\n\nSR = 16000\nDURATION = 5\nprint(\"recording...\")\nrec = sd.rec(int(SR * DURATION), samplerate=SR, channels=1)\nsd.wait()                                              # block until done\nprint(\"playing back...\")\nsd.play(rec, samplerate=SR)\nsd.wait()\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — record + playback — discover devices, validate the rate.\n# APPROACH  - sd.query_devices + sd.default.* + explicit dtype.\n# STRENGTHS - Picks a real input/output device; correct float32; handles\n#             a system whose default sr isn't 16000.\n# WEAKNESSES- Still synchronous; no monitoring; user has to wait silently.\nimport sounddevice as sd\nimport numpy as np\n\n# Show available devices and their default rates.\nprint(sd.query_devices())\ndefault_in  = sd.query_devices(kind=\"input\")\ndefault_out = sd.query_devices(kind=\"output\")\nprint(\"input:\",  default_in[\"name\"],  \"@\", default_in[\"default_samplerate\"])\nprint(\"output:\", default_out[\"name\"], \"@\", default_out[\"default_samplerate\"])\n\nSR = 16000\nsd.default.samplerate = SR\nsd.default.channels = 1\nsd.default.dtype = \"float32\"\n\nprint(\"recording 5s...\")\nrec = sd.rec(int(SR * 5))                             # uses defaults set above\nsd.wait()\nprint(\"min/max:\", rec.min(), rec.max())               # should be in [-1, 1]\n\n# Detect silence (super-low RMS).\nrms = float(np.sqrt(np.mean(rec ** 2)))\nif rms < 1e-3:\n    print(f\"WARNING: very quiet recording (rms={rms:.5f}); check input device.\")\n\nprint(\"playing back...\")\nsd.play(rec)\nsd.wait()\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — record + play — production: choose specific devices by\n#             name substring, monitor RMS in real-time, stop early on silence\n#             or on user keypress.\n# APPROACH  - sd.InputStream with a callback; threading.Event for stop;\n#             append blocks to a list, concatenate at the end.\n# STRENGTHS - Real-time monitoring; early stop; named-device selection.\n# WEAKNESSES- Callback runs in a real-time audio thread - keep it cheap;\n#             never call print() or do file I/O from inside the callback\n#             in production (this example does, only for the demo).\nfrom __future__ import annotations\nimport sys\nimport threading\nimport numpy as np\nimport sounddevice as sd\n\n\ndef find_device(name_contains: str, kind: str) -> int:\n    \"\"\"Return device index whose name contains the given string.\"\"\"\n    devs = sd.query_devices()\n    for i, d in enumerate(devs):\n        if name_contains.lower() in d[\"name\"].lower():\n            if (kind == \"input\"  and d[\"max_input_channels\"]  > 0) or \\\n               (kind == \"output\" and d[\"max_output_channels\"] > 0):\n                return i\n    raise LookupError(f\"no {kind} device matching {name_contains!r}\")\n\n\ndef record_with_monitor(seconds: float = 30,\n                        sr: int = 16000,\n                        device_in: int | None = None,\n                        silence_threshold: float = 1e-3,\n                        silence_window_s: float = 2.0) -> np.ndarray:\n    \"\"\"Record up to seconds total; stop early after silence_window_s of silence.\"\"\"\n    blocks: list[np.ndarray] = []\n    stop = threading.Event()\n    silent_since: list[float] = [0.0]                  # mutable ref\n\n    def callback(indata, frames, time_info, status):\n        if status:\n            print(f\"status: {status}\", file=sys.stderr)\n        # Copy because indata is a view into a shared buffer.\n        blocks.append(indata.copy())\n\n        rms = float(np.sqrt(np.mean(indata ** 2)))\n        # Real-time monitor (never do this in production - print is slow).\n        bar = \"#\" * min(40, int(rms * 200))\n        print(f\"\\rrms={rms:.3f} {bar:<40}\", end=\"\", flush=True)\n\n        if rms < silence_threshold:\n            silent_since[0] += frames / sr\n        else:\n            silent_since[0] = 0.0\n        if silent_since[0] >= silence_window_s:\n            stop.set()\n\n    with sd.InputStream(\n        samplerate=sr, channels=1, dtype=\"float32\",\n        device=device_in, callback=callback, blocksize=1024,\n    ):\n        stop.wait(timeout=seconds)\n\n    print()\n    return np.concatenate(blocks, axis=0).flatten()\n\n\n# Use it\ntry:\n    in_idx = find_device(\"MacBook\", kind=\"input\")\nexcept LookupError:\n    in_idx = None\ny = record_with_monitor(seconds=30, sr=16000, device_in=in_idx,\n                        silence_threshold=2e-3, silence_window_s=1.5)\n\nprint(f\"captured {len(y) / 16000:.1f}s\")\nsd.play(y, samplerate=16000); sd.wait()\n\n# Decision rule:\n#   Quick demo / scripts                       -> sd.play / sd.rec (blocking).\n#   Real-time monitoring or processing         -> sd.InputStream with callback.\n#   Both record AND play simultaneously        -> sd.playrec or InputStream + OutputStream.\n#   Need lowest latency                         -> set blocksize small (256 or 512); use ASIO.\n#   Long recordings                             -> InputStream + write to soundfile incrementally\n#                                                   (don't keep the whole buffer in RAM).\n#   Multiple devices / multi-channel            -> set device=, channels=N, mapping=[1,2,3].\n#   Cross-platform packaging                    -> sounddevice bundles PortAudio - works\n#                                                   without installing anything else.\n\n# Anti-pattern:\n#   def callback(indata, frames, ti, status):\n#       all_data.append(indata)               # appends the buffer view!\n# indata is a NumPy view backed by a buffer that PortAudio reuses.\n# After the callback returns, the buffer's contents change underneath\n# you. ALWAYS .copy() the indata in the callback if you want to keep it.\n"
                  }
        ],
        tips: [
                  "Set `sd.default.samplerate / channels / dtype` once at startup, then `sd.play/rec` use them.",
                  "Use `sd.query_devices()` to find devices; index or name substring works for `device=`.",
                  "Always `sd.wait()` after `sd.play/rec` if you need synchronous behavior — they default to async.",
                  "In an `InputStream` callback, **always `.copy()`** the `indata` — it's a view that gets reused.",
                  "Keep callbacks cheap — they run on the audio thread. No file I/O, no print, no GIL-heavy work."
        ],
        mistake: "Forgetting to `.copy()` `indata` inside an InputStream callback. PortAudio reuses the buffer; your saved data gets overwritten before the next callback.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "sounddevice-stream-callback",
        fn: "sd.InputStream / OutputStream — real-time audio",
        desc: "For real-time pipelines (live FX, transcription, VAD): create a `Stream`, give it a callback that runs on the audio thread, and process buffers as they arrive. Block size and sample rate set the latency budget; the callback must finish in less than `blocksize/sr` seconds — every time, no exceptions.",
        category: "sounddevice",
        subtitle: "sd.InputStream(callback) for capture, sd.OutputStream for playback, sd.Stream for full-duplex, blocksize vs latency, callback runs on audio thread (no GIL-blocking work), queue.Queue handoff, dropped-frame status flags",
        signature: "with sd.InputStream(samplerate=, channels=, callback=cb, blocksize=512): time.sleep(seconds)",
        descLong: "Streams give you a continuous audio path with a callback for each block. Block size determines latency: at 48 kHz, blocksize=512 is ~10.7 ms. The callback runs in a real-time priority thread — anything that yields the GIL or does I/O risks underruns (audible clicks/dropouts). Hand work off to a worker thread via `queue.Queue`. Three depths solve the SAME task — capture audio and compute live RMS — at depths: synchronous polling loop with `sd.rec` (gaps between captures) → `InputStream` with callback that prints RMS → callback pushes blocks onto a queue, a worker thread does the analysis off the audio thread.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Show live input level for ~5 seconds.\n# APPROACH  - Loop calling sd.rec for 100 ms blocks.\n# STRENGTHS - Trivial; no callback math.\n# WEAKNESSES- Tiny gaps between blocks; not real-time. Don't ship this.\nimport sounddevice as sd\nimport numpy as np\nimport time\n\nSR = 48000\nBLOCK = int(0.1 * SR)                                # 100 ms\n\nt0 = time.time()\nwhile time.time() - t0 < 5:\n    block = sd.rec(BLOCK, samplerate=SR, channels=1, blocking=True)\n    rms = float(np.sqrt(np.mean(block ** 2)))\n    print(f\"{rms:.3f}\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — live RMS — using sd.InputStream + callback.\n# APPROACH  - Open a stream; callback computes RMS each block.\n# STRENGTHS - Continuous (no gaps); ~10ms latency at blocksize=512.\n# WEAKNESSES- print() inside the callback: occasionally blocks for I/O,\n#             causes audible glitches in real apps.\nimport sounddevice as sd\nimport numpy as np\nimport time\n\nSR = 48000\nBLOCKSIZE = 512                                      # ~10.7 ms at 48 kHz\n\ndef callback(indata, frames, time_info, status):\n    if status:\n        print(\"status:\", status)                     # underrun/overflow flags\n    rms = float(np.sqrt(np.mean(indata ** 2)))\n    print(f\"{rms:.3f}\")                              # blocks - bad in production\n\nwith sd.InputStream(\n    samplerate=SR, channels=1, blocksize=BLOCKSIZE,\n    dtype=\"float32\", callback=callback,\n):\n    time.sleep(5)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — live RMS display — production: callback only copies\n#             into a queue, worker thread does analysis and prints.\n# APPROACH  - queue.Queue handoff; non-blocking put_nowait; drop-on-full\n#             (audio thread never waits).\n# STRENGTHS - No glitches from slow consumers; clean shutdown; observable.\n# WEAKNESSES- Up-to-block-size latency for the analysis side.\nfrom __future__ import annotations\nimport threading\nimport queue\nimport time\nimport numpy as np\nimport sounddevice as sd\n\n\nSR = 48000\nBLOCKSIZE = 512\n\n\nclass LiveAnalyzer:\n    def __init__(self) -> None:\n        self.q: queue.Queue[np.ndarray] = queue.Queue(maxsize=64)\n        self._stop = threading.Event()\n        self.dropped = 0\n\n    def audio_callback(self, indata, frames, time_info, status):\n        # Audio-thread side: be FAST. Just copy and enqueue.\n        if status:\n            # Don't print; it can block. Just count.\n            self.dropped += 1\n        try:\n            self.q.put_nowait(indata.copy())\n        except queue.Full:\n            self.dropped += 1                         # consumer behind; drop block\n\n    def consumer(self) -> None:\n        # Off the audio thread - free to print, plot, file-write, etc.\n        while not self._stop.is_set():\n            try:\n                block = self.q.get(timeout=0.1)\n            except queue.Empty:\n                continue\n            rms = float(np.sqrt(np.mean(block ** 2)))\n            bar = \"#\" * min(40, int(rms * 200))\n            print(f\"\\rrms={rms:.3f} {bar:<40}  dropped={self.dropped}\",\n                  end=\"\", flush=True)\n\n    def run(self, seconds: float = 5) -> None:\n        worker = threading.Thread(target=self.consumer, daemon=True)\n        worker.start()\n        with sd.InputStream(\n            samplerate=SR, channels=1, blocksize=BLOCKSIZE,\n            dtype=\"float32\", callback=self.audio_callback,\n        ):\n            time.sleep(seconds)\n        self._stop.set()\n        worker.join(timeout=1)\n        print()\n\n\nif __name__ == \"__main__\":\n    LiveAnalyzer().run(seconds=5)\n\n# Decision rule:\n#   Real-time pipeline (live FX, VAD, transcription)   -> InputStream + callback + queue.\n#   Want simultaneous playback + capture                -> sd.Stream (full-duplex) or\n#                                                          InputStream + OutputStream.\n#   Latency budget < 10 ms                               -> blocksize <= 256 + low-latency host API.\n#   Latency tolerable, throughput matters                -> blocksize 1024-2048.\n#   Multi-channel mics (e.g. 4-mic array)                -> channels=4, indata shape (frames, 4).\n#   Need to write to disk live                            -> queue + soundfile.SoundFile in worker.\n#   Dropped blocks acceptable (UI meter)                 -> drop-on-full like above.\n#   Dropped blocks NOT acceptable (recording)            -> queue.Queue with NO maxsize + size monitor.\n\n# Anti-pattern:\n#   def cb(indata, frames, ti, status):\n#       result = run_inference(indata)              # NN forward pass\n# A 10ms callback budget with a 50ms NN pass = constant underruns and\n# audible clicks. Always hand the buffer to a worker; never block the\n# audio thread on heavy work.\n"
                  }
        ],
        tips: [
                  "Block size sets latency: `latency_ms = blocksize / sr * 1000`. 512 @ 48 kHz ≈ 10.7 ms.",
                  "Callbacks run in a real-time-priority thread — keep them tight (no print, no I/O, no GIL-heavy work).",
                  "Hand off to workers via `queue.Queue.put_nowait` — drop on full rather than block.",
                  "Stream `status` flags carry underrun/overflow info — count them, don't ignore them.",
                  "For full-duplex (live effects), use `sd.Stream` — input and output share a clock."
        ],
        mistake: "Doing slow work (file write, NN inference, print) inside the audio callback. Audio thread misses its deadline → underruns → clicks/pops.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: scipy.signal — DSP primitives ─────────────────────────────────────────
  {
    id: "scipy-signal",
    title: "scipy.signal — DSP primitives",
    entries: [
      {
        id: "scipy-signal-filters",
        fn: "scipy.signal — IIR/FIR filters, convolution",
        desc: "`scipy.signal` covers the DSP basics: design filters with `butter`/`firwin`, apply them with `sosfiltfilt` (zero-phase) or `lfilter` (causal). Use `sosfiltfilt` for offline analysis (no phase distortion), `lfilter`/`sosfilt` for real-time (causal but introduces phase delay).",
        category: "scipy-signal",
        subtitle: "butter (IIR design, output='sos' for stability), firwin (FIR design), sosfiltfilt (zero-phase, offline) vs sosfilt (causal, streaming), filtfilt (transfer-fn form, less stable than sos), Nyquist normalization, scipy.signal.fftconvolve for long impulse responses",
        signature: "sos = butter(N=4, Wn=cutoff_hz, btype='low', fs=sr, output='sos'); y = sosfiltfilt(sos, x)",
        descLong: "For an IIR filter, `butter(N, Wn, btype, fs=, output='sos')` returns second-order sections — the numerically stable form. Apply with `sosfiltfilt` for zero-phase (forward-backward — only valid offline) or `sosfilt` for streaming/causal. For FIR, use `firwin` to design taps; FIRs are always stable but need many more taps for the same rolloff. `fftconvolve` is the fast convolution for long impulse responses (e.g., reverb). Three depths solve the SAME task — high-pass at 80 Hz to remove rumble — at depths: bare `butter` + `lfilter` (phase shift), `butter(output='sos')` + `sosfiltfilt` (zero-phase), production helper that handles edge effects with `padlen` and chained band-pass.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - High-pass at 80 Hz to kill low rumble.\n# APPROACH  - butter + lfilter with default scipy idiom.\n# STRENGTHS - Two lines.\n# WEAKNESSES- transfer-function form is numerically unstable for high-order\n#             filters; lfilter is causal so it shifts phase by ~filter order.\nimport numpy as np\nfrom scipy.signal import butter, lfilter\n\nSR = 48000\nb, a = butter(N=4, Wn=80 / (SR / 2), btype=\"high\")    # Wn in 0..1 (Nyquist=1)\ny = lfilter(b, a, x)                                   # x = your audio array\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — high-pass at 80 Hz — zero-phase, numerically stable.\n# APPROACH  - butter(output='sos') + sosfiltfilt; pass fs= so cutoff is in Hz.\n# STRENGTHS - No phase distortion; stable for high-order filters.\n# WEAKNESSES- Forward-backward filtering is offline only (cannot be streamed).\nimport numpy as np\nfrom scipy.signal import butter, sosfiltfilt\n\nSR = 48000\n\n\ndef high_pass(x: np.ndarray, sr: int, cutoff_hz: float, order: int = 4) -> np.ndarray:\n    sos = butter(order, cutoff_hz, btype=\"high\", fs=sr, output=\"sos\")\n    return sosfiltfilt(sos, x)                        # zero-phase\n\n\n# x = stereo: shape (n,) or (n, channels). sosfiltfilt handles both.\ny = high_pass(x, SR, 80.0)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — high-pass at 80 Hz — production: band-pass via chained\n#             low + high pass; padlen for short signals; dispatch causal\n#             vs zero-phase based on streaming flag; FIR fallback.\n# APPROACH  - Helper functions for IIR + FIR; explicit padlen; SOS form.\n# STRENGTHS - Robust on short clips; streaming-aware; testable.\n# WEAKNESSES- More plumbing; FIR taps for sharp rolloff are heavy.\nfrom __future__ import annotations\nimport numpy as np\nfrom scipy.signal import butter, sosfilt, sosfiltfilt, firwin, lfilter\n\n\ndef design_butter(cutoff: float | tuple[float, float], sr: int,\n                  *, btype: str = \"low\", order: int = 4) -> np.ndarray:\n    \"\"\"Return SOS for a Butterworth filter; cutoff in Hz.\"\"\"\n    return butter(order, cutoff, btype=btype, fs=sr, output=\"sos\")\n\n\ndef apply_iir(x: np.ndarray, sos: np.ndarray, *,\n              streaming: bool = False) -> np.ndarray:\n    \"\"\"sosfiltfilt for offline (zero-phase); sosfilt for streaming/causal.\"\"\"\n    if streaming:\n        return sosfilt(sos, x, axis=0)\n    # padlen prevents 'edge effects' on short signals.\n    padlen = min(3 * sos.shape[0], len(x) - 1)\n    return sosfiltfilt(sos, x, padlen=padlen, axis=0)\n\n\ndef design_fir_lowpass(cutoff_hz: float, sr: int,\n                       n_taps: int = 257, window: str = \"hamming\") -> np.ndarray:\n    \"\"\"Linear-phase FIR; n_taps odd recommended.\"\"\"\n    return firwin(n_taps, cutoff_hz, fs=sr, window=window)\n\n\ndef apply_fir(x: np.ndarray, h: np.ndarray) -> np.ndarray:\n    return lfilter(h, [1.0], x, axis=0)\n\n\n# --- Use cases ---\nSR = 48000\n\n# 1) Voice band-pass: 80 Hz - 8 kHz (chain HP + LP via single SOS).\nsos_voice = butter(4, [80, 8000], btype=\"band\", fs=SR, output=\"sos\")\ny = apply_iir(x, sos_voice, streaming=False)\n\n# 2) Real-time high-pass for streaming: causal sosfilt + state.\nsos_rumble = design_butter(80.0, SR, btype=\"high\", order=4)\ndef rumble_filter_state(zi=None):\n    return zi if zi is not None else np.zeros(\n        (sos_rumble.shape[0], 2)\n    )\n# In a callback: y_block, zi = sosfilt(sos_rumble, x_block, zi=zi)\n\n# 3) Sharp anti-alias: linear-phase FIR with many taps.\nh = design_fir_lowpass(cutoff_hz=8000, sr=SR, n_taps=513)\ny_aa = apply_fir(x, h)\n\n# Decision rule:\n#   Offline analysis, want no phase distortion       -> sosfiltfilt (forward-backward).\n#   Streaming / real-time                            -> sosfilt with zi state across blocks.\n#   Need exact linear phase (e.g. EQ)                -> FIR via firwin + lfilter.\n#   Short impulse response, low order               -> butter or cheby1.\n#   Long convolution (reverb, room IR)               -> scipy.signal.fftconvolve.\n#   Need to remove a single frequency                -> iirnotch (designs a notch SOS).\n#   Computing transfer-function poles/zeros          -> design with output='ba' for analysis,\n#                                                       NEVER for application (use SOS).\n\n# Anti-pattern:\n#   b, a = butter(8, ...); y = lfilter(b, a, x)\n# 8th-order BA-form filter on 32-bit floats blows up numerically. Always\n# request output='sos' for IIR design and use sosfilt / sosfiltfilt.\n"
                  }
        ],
        tips: [
                  "Use `output='sos'` for any IIR filter of order > ~4 — second-order sections are numerically stable.",
                  "`sosfiltfilt` (zero-phase) is offline-only — it filters forward then backward.",
                  "For streaming, pass `zi=` filter state through `sosfilt` to keep continuity across blocks.",
                  "FIR (linear phase) requires many taps for sharp rolloff — `firwin` + `lfilter` is the path.",
                  "`fftconvolve` beats `convolve` once kernel length exceeds ~50; always benchmark before committing."
        ],
        mistake: "Designing a high-order IIR with `output='ba'` (default) and applying with `lfilter`. Numerical errors balloon and the filter goes unstable. Always use SOS.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "scipy-signal-windows",
        fn: "scipy.signal.windows / spectral leakage",
        desc: "When you take an FFT of a finite signal, you implicitly multiply by a rectangular window — this causes spectral leakage. Apply a tapered window (Hann, Hamming, Blackman, Kaiser) before FFT to suppress sidelobes. The choice trades main-lobe width vs sidelobe height.",
        category: "scipy-signal",
        subtitle: "scipy.signal.windows.hann / hamming / blackman / kaiser / flattop, Welch averaging (scipy.signal.welch), main-lobe width vs sidelobe rejection trade-off, COLA condition for OLA reconstruction, Parseval/normalization gotchas",
        signature: "w = scipy.signal.windows.hann(N); X = np.fft.rfft(x * w); f, P = scipy.signal.welch(x, fs=sr, nperseg=, window=)",
        descLong: "Multiplying a signal by a Hann window before FFT trades narrower main lobe for much lower sidelobes — much better frequency localization. Welch's method goes further: split into overlapping windows, FFT each, average the squared magnitudes. The result is a smooth power spectral density (PSD). Three depths solve the SAME task — estimate the PSD of a noisy signal — at depths: bare `np.fft.rfft` of the whole signal (leakage + noisy), `welch` with a single window choice, `welch` with explicit `nperseg`/`noverlap`/`window` chosen for the application plus units (V²/Hz).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Estimate the power spectrum of a noisy signal.\n# APPROACH  - Single FFT of the whole signal, take magnitude squared.\n# STRENGTHS - Direct.\n# WEAKNESSES- Spectral leakage from the implicit rectangular window;\n#             single-realization noise; no PSD normalization.\nimport numpy as np\n\nx = np.random.randn(48000) + np.sin(2 * np.pi * 1000 * np.arange(48000) / 48000)\nSR = 48000\n\nX = np.fft.rfft(x)\nfreqs = np.fft.rfftfreq(len(x), 1 / SR)\npower = np.abs(X) ** 2\nprint(freqs[np.argmax(power)])                       # ~1000.0 Hz\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — PSD of noisy signal — using Welch's method (right way).\n# APPROACH  - scipy.signal.welch with a Hann window.\n# STRENGTHS - Averaged across overlapping segments; lower variance;\n#             returns a proper PSD in V**2/Hz.\n# WEAKNESSES- Defaults (nperseg=256, hann) may not match your bandwidth needs.\nimport numpy as np\nfrom scipy.signal import welch\n\nSR = 48000\nx = np.random.randn(48000) + np.sin(2 * np.pi * 1000 * np.arange(48000) / SR)\n\nfreqs, psd = welch(x, fs=SR, nperseg=2048, window=\"hann\")\nprint(freqs.shape, psd.shape)                        # (1025,) (1025,)\nprint(freqs[np.argmax(psd)])                          # ~1000.0 Hz\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — PSD with Welch — production: choose nperseg from a\n#             bandwidth-resolution target, allow custom window, return\n#             results with proper dB units.\n# APPROACH  - Helper that derives nperseg from desired Hz resolution;\n#             returns dict with freqs, PSD (linear), PSD_dB.\n# STRENGTHS - Tunable resolution; consistent units.\n# WEAKNESSES- Resolution / variance trade-off is fundamental - you can't\n#             beat 1/T uncertainty with longer N alone.\nfrom __future__ import annotations\nimport numpy as np\nfrom scipy.signal import welch\nfrom scipy.signal.windows import get_window\n\n\ndef estimate_psd(\n    x: np.ndarray, sr: int, *,\n    bandwidth_hz: float = 5.0,\n    overlap: float = 0.5,\n    window: str = \"hann\",\n    detrend: str | bool = \"constant\",\n) -> dict:\n    \"\"\"\n    PSD via Welch with nperseg derived from desired bandwidth.\n    bandwidth_hz: roughly 1.5 * (sr / nperseg) for hann.\n    \"\"\"\n    nperseg = int(round(1.5 * sr / bandwidth_hz))\n    nperseg = min(nperseg, len(x))\n    noverlap = int(round(overlap * nperseg))\n\n    f, psd = welch(\n        x, fs=sr, nperseg=nperseg, noverlap=noverlap,\n        window=window, detrend=detrend, scaling=\"density\",\n    )\n    return {\n        \"freqs\":  f,                                  # Hz\n        \"psd\":    psd,                                # V**2/Hz\n        \"psd_db\": 10.0 * np.log10(np.maximum(psd, 1e-20)),\n    }\n\n\n# Demonstrate window choice trade-off.\ndef show_window_tradeoffs(N: int = 1024) -> None:\n    for name in (\"boxcar\", \"hann\", \"hamming\", \"blackman\", \"flattop\", (\"kaiser\", 8.6)):\n        w = get_window(name, N)\n        # Spectrum of the window itself reveals main-lobe width and sidelobe level.\n        W = np.abs(np.fft.fftshift(np.fft.fft(w / w.sum(), 8 * N))) ** 2\n        # main-lobe width at -3 dB (samples) - quick proxy.\n        peak = W.max()\n        m3 = np.where(W > peak * 0.5)[0]\n        width = m3[-1] - m3[0]\n        max_side = 10 * np.log10(W[W < W.max() * 0.99].max() / peak + 1e-12)\n        print(f\"{str(name):<18} width≈{width:4d}  max sidelobe ≈ {max_side:6.1f} dB\")\n\n\nSR = 48000\nx = np.random.randn(int(2 * SR)) + np.sin(2 * np.pi * 1000 * np.arange(int(2 * SR)) / SR)\nresult = estimate_psd(x, SR, bandwidth_hz=2.0, window=\"hann\")\nprint(result[\"freqs\"][np.argmax(result[\"psd\"])])     # ~1000\n\n# Decision rule:\n#   General-purpose spectrum               -> hann (good leakage suppression, moderate main lobe).\n#   Tightest main lobe, max leakage        -> rectangular ('boxcar'); rarely a good choice.\n#   Need accurate amplitude reading        -> flattop (very wide main lobe, very flat).\n#   Need to maximize SNR for a tone        -> blackman or kaiser (beta>=8).\n#   Lowest variance PSD                    -> Welch with many overlapping segments.\n#   Stationary signal, want one PSD        -> nperseg = N, noverlap=0 (Bartlett).\n#   Rapidly changing spectrum              -> short nperseg + spectrogram.\n#   Need invertible STFT (resynth)         -> hann with 50% or 75% overlap (COLA).\n\n# Anti-pattern:\n#   X = np.fft.rfft(x)                          # rectangular window\n#   psd = np.abs(X) ** 2                         # not normalized\n# Two bugs: (1) leakage smears narrowband peaks across many bins; (2)\n# magnitude-squared is not a PSD - need /sr/N and a window normalization\n# correction. Use scipy.signal.welch when you want a real PSD.\n"
                  }
        ],
        tips: [
                  "A rectangular window (no window) gives narrow main lobe but huge sidelobes — bad leakage.",
                  "Hann is the all-purpose default: good leakage suppression, moderate main-lobe width.",
                  "Use `flattop` when amplitude accuracy matters (calibration); use `blackman`/`kaiser` for max SNR.",
                  "Welch's method = split + window + FFT + average — much lower variance than a single FFT.",
                  "For invertible STFT (e.g., spectral subtraction → reconstruct), use Hann with 50%/75% overlap (COLA condition)."
        ],
        mistake: "Reporting `np.abs(np.fft.rfft(x))**2` as a \"spectrum\" — it's leakage-corrupted and not a proper PSD. Use `scipy.signal.welch` with a window.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: File I/O — soundfile, pydub, wave ─────────────────────────────────────────
  {
    id: "formats",
    title: "File I/O — soundfile, pydub, wave",
    entries: [
      {
        id: "audio-file-formats",
        fn: "soundfile / pydub / wave — picking a file I/O library",
        desc: "Three libraries, three roles: `soundfile` (read/write WAV/FLAC/OGG with full bit depth), `pydub` (high-level edit + convert via ffmpeg), `wave` (stdlib, only PCM WAV). Use `soundfile` 90% of the time; `pydub` for \"concat MP3s and trim silence\"; `wave` only when stdlib-only matters.",
        category: "formats",
        subtitle: "soundfile.read / write (subtype, dtype, samplerate; (n,) or (n, channels)), soundfile.SoundFile for streaming, pydub.AudioSegment (slicing in ms; needs ffmpeg), wave.open (stdlib, PCM-only), MP3 / M4A / OPUS via ffmpeg, normalization vs peak-clipping",
        signature: "sf.read(path) -> (data, sr); sf.write(path, data, sr, subtype=); AudioSegment.from_file(path)[:5000]",
        descLong: "soundfile is the high-quality I/O layer — preserves bit depth (PCM_16, PCM_24, FLOAT), reads/writes WAV/FLAC/OGG/RAW. pydub gives a millisecond-indexed AudioSegment with a friendly API for slicing and exporting (`segment[:5000]`, `segment.export()`); it shells out to ffmpeg for compressed formats. The stdlib `wave` only handles PCM WAV — useful when you can't add a dependency. Three depths solve the SAME task — load an audio file, trim the first second, save as 16-bit WAV — at depths: pydub one-liners → soundfile read/slice/write with explicit dtype + subtype → soundfile streaming for files too big for RAM.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Trim the first second off a file and save as WAV.\n# APPROACH  - pydub - millisecond slicing, one-line export.\n# STRENGTHS - Trivial; works for MP3/M4A out of the box (with ffmpeg).\n# WEAKNESSES- pydub uses int16 internally - lossy if you need higher\n#             bit depth; ffmpeg required for compressed formats.\nfrom pydub import AudioSegment\n\naudio = AudioSegment.from_file(\"song.mp3\")            # any format ffmpeg supports\ntrimmed = audio[1000:]                                # millisecond indexing\ntrimmed.export(\"trimmed.wav\", format=\"wav\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — trim first second, save WAV — using soundfile.\n# APPROACH  - sf.read whole file as float32, slice samples, sf.write.\n# STRENGTHS - Preserves bit depth (PCM_16/24/32 or FLOAT); honest dtype.\n# WEAKNESSES- Loads whole file into memory; bad for hour-long recordings.\nimport soundfile as sf\nimport numpy as np\n\ndata, sr = sf.read(\"song.flac\", dtype=\"float32\")     # (n,) or (n, channels)\nprint(data.shape, sr, data.dtype)\n\n# Trim first second.\ndata = data[sr:]\n\n# Save as 16-bit PCM WAV.\nsf.write(\"trimmed.wav\", data, sr, subtype=\"PCM_16\")\n\n# Available subtypes:\n#   PCM_16, PCM_24, PCM_32 - integer\n#   FLOAT, DOUBLE          - float WAV\n#   VORBIS                 - inside .ogg\n#   FLAC                   - inside .flac (lossless)\n# soundfile DOESN'T do MP3 - use pydub for that.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — trim + save — production: stream the file (no full\n#             read), preserve original subtype, normalize peak if asked.\n# APPROACH  - sf.SoundFile context manager; read/write blocks; explicit\n#             channels + format propagation.\n# STRENGTHS - Constant memory; preserves dtype; handles any size; observable.\n# WEAKNESSES- More setup; need to know about subtype/channels/format trio.\nfrom __future__ import annotations\nfrom pathlib import Path\nimport numpy as np\nimport soundfile as sf\n\n\ndef trim_and_save(\n    src: str | Path,\n    dst: str | Path,\n    *,\n    head_seconds: float = 0.0,\n    tail_seconds: float | None = None,\n    target_subtype: str | None = None,             # e.g. 'PCM_16'; None = same as source\n    normalize: bool = False,\n    block_seconds: float = 1.0,\n) -> dict:\n    \"\"\"Trim and re-save without holding the whole file in RAM.\"\"\"\n    src = Path(src); dst = Path(dst)\n    with sf.SoundFile(src, \"r\") as fin:\n        sr = fin.samplerate\n        channels = fin.channels\n        subtype = target_subtype or fin.subtype\n        block = int(block_seconds * sr)\n        start = int(head_seconds * sr)\n        stop  = int(tail_seconds * sr) if tail_seconds is not None else fin.frames\n\n        # Position to the start.\n        fin.seek(start)\n        n_to_read = stop - start\n\n        # First pass: peak (only if normalizing).\n        peak = 0.0\n        if normalize:\n            cur = start\n            while cur < stop:\n                buf = fin.read(min(block, stop - cur), dtype=\"float32\", always_2d=True)\n                if buf.size == 0:\n                    break\n                peak = max(peak, float(np.abs(buf).max()))\n                cur += len(buf)\n            fin.seek(start)\n            scale = (1.0 / peak) if peak > 0 else 1.0\n        else:\n            scale = 1.0\n\n        # Second pass: write.\n        with sf.SoundFile(dst, \"w\", samplerate=sr, channels=channels, subtype=subtype) as fout:\n            cur = start\n            while cur < stop:\n                buf = fin.read(min(block, stop - cur), dtype=\"float32\", always_2d=True)\n                if buf.size == 0:\n                    break\n                if scale != 1.0:\n                    buf = (buf * scale).astype(np.float32, copy=False)\n                fout.write(buf)\n                cur += len(buf)\n\n    return {\"src\": str(src), \"dst\": str(dst), \"sr\": sr, \"subtype\": subtype,\n            \"channels\": channels, \"peak\": peak if normalize else None}\n\n\ninfo = trim_and_save(\"recording.flac\", \"edit.wav\",\n                     head_seconds=1.0, target_subtype=\"PCM_24\", normalize=True)\nprint(info)\n\n# Decision rule:\n#   Just need to read/write WAV/FLAC/OGG       -> soundfile (preserves bit depth).\n#   Need MP3/M4A/OPUS or \"concat 50 clips\"     -> pydub (uses ffmpeg).\n#   Stdlib only, PCM WAV is enough             -> wave module.\n#   Files too big for RAM                      -> soundfile.SoundFile + read(block).\n#   Need to preserve original subtype          -> read source.subtype, pass to write.\n#   Need lossless float audio                  -> subtype='FLOAT' (32-bit float WAV).\n#   Need smallest size, lossy OK               -> export through pydub to MP3/OPUS.\n#   Want to convert formats                    -> pydub.AudioSegment.export(format=).\n\n# Anti-pattern:\n#   data, sr = sf.read('song.wav')             # reads as float64 (default)\n#   sf.write('out.wav', data, sr)               # writes as float64 -> WAV FLOAT\n# You silently changed PCM_16 source to a 32-bit FLOAT WAV (4x size).\n# Either pass dtype='int16' on read or subtype='PCM_16' on write to keep\n# the original encoding.\n"
                  }
        ],
        tips: [
                  "`soundfile.read(path)` returns `(data, sr)`; data is `(n,)` mono or `(n, channels)` — opposite of librosa's `(channels, n)`.",
                  "Pass `dtype='float32'`/`'int16'` to `sf.read` to control in-memory dtype; pass `subtype=` to `sf.write` to control file encoding.",
                  "pydub uses ffmpeg under the hood — install it (`brew install ffmpeg` / `apt install ffmpeg`) for MP3/M4A/OPUS.",
                  "For files larger than RAM, use `sf.SoundFile(path)` as a context manager and `read(block_size)` in a loop.",
                  "When converting formats, choose the destination `subtype` deliberately — silent dtype upgrades can quadruple file size."
        ],
        mistake: "Reading a PCM_16 WAV with `sf.read(path)` (default float64) and writing it back without a `subtype` — the output is now a 32-bit FLOAT WAV, 2-4× larger. Always pass `subtype=` when writing.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 5: When to reach for which audio tool ─────────────────────────────────────────
  {
    id: "patterns",
    title: "When to reach for which audio tool",
    entries: [
      {
        id: "audio-librosa-vs-torchaudio",
        fn: "librosa vs torchaudio vs essentia — pick the audio stack",
        desc: "librosa = analysis and feature extraction (CPU, NumPy). torchaudio = same primitives as differentiable PyTorch ops, GPU-friendly, training-ready. essentia = music-specific (key/tempo/genre, lots of pretrained algorithms). Pick by where the work runs and what comes after.",
        category: "patterns",
        subtitle: "librosa (CPU/NumPy, analysis, sklearn-compatible features), torchaudio (GPU, differentiable, tensor in/out, augmentations + transforms), essentia (music IR algorithms, pretrained models like classifiers + key/tempo), pydub (high-level edit + convert), interop (np.array <-> torch.Tensor)",
        signature: "# librosa: y, sr = librosa.load(...); mfcc = librosa.feature.mfcc(...)\\n# torchaudio: wav, sr = torchaudio.load(...); mel = torchaudio.transforms.MelSpectrogram(sr)(wav)",
        descLong: "Three libraries, three contexts: librosa is the swiss-army CPU toolkit (fast iteration, NumPy-native, sklearn pipelines); torchaudio mirrors the same primitives as differentiable Tensor ops, runs on GPU, integrates with PyTorch training; essentia is the music-IR specialist with pretrained algorithms for key/tempo/genre/mood. Three depths solve the SAME task — extract a mel spectrogram from a clip — at depths: librosa for analysis → torchaudio with the same parameters → torchaudio batched on GPU as part of a PyTorch DataLoader pipeline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Compute a mel spectrogram of one audio clip.\n# APPROACH  - librosa - shortest path on CPU.\n# STRENGTHS - Iterative; readable; sklearn-friendly.\n# WEAKNESSES- Pure CPU; no batching; copies if you later move to GPU.\nimport librosa\n\ny, sr = librosa.load(\"song.wav\", sr=16000)\nmel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=1024,\n                                     hop_length=256, n_mels=80)\nprint(mel.shape)                                      # (80, n_frames) numpy\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — mel spectrogram — but as a torchaudio op so it can\n#             run on GPU and backprop through.\n# APPROACH  - torchaudio.load + transforms.MelSpectrogram.\n# STRENGTHS - Tensor in / tensor out; GPU-able; differentiable.\n# WEAKNESSES- Needs PyTorch; param naming differs slightly from librosa.\nimport torch\nimport torchaudio\nimport torchaudio.transforms as T\n\nwaveform, sr = torchaudio.load(\"song.wav\")            # (channels, n_samples)\nif sr != 16000:\n    waveform = T.Resample(sr, 16000)(waveform); sr = 16000\n\nmel_op = T.MelSpectrogram(\n    sample_rate=sr, n_fft=1024, hop_length=256, n_mels=80,\n)\nmel = mel_op(waveform)                                # tensor (channels, 80, T)\n\n# Send to GPU for free:\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nmel = mel_op.to(device)(waveform.to(device))\nprint(mel.shape, mel.device)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — mel spectrogram — production: GPU-batched torchaudio\n#             pipeline inside a Dataset, ready for a PyTorch DataLoader.\n# APPROACH  - Lazy load + on-GPU transform; mixed CPU loading + GPU compute.\n# STRENGTHS - Saturates the GPU; one transform per batch; standard PyTorch.\n# WEAKNESSES- Need to manage device explicitly; resampling on GPU has\n#             quality trade-offs (use sox_io_backend if quality matters).\nfrom __future__ import annotations\nimport torch\nimport torchaudio\nimport torchaudio.transforms as T\nfrom torch.utils.data import Dataset, DataLoader\nfrom pathlib import Path\n\n\nSR = 16000\n\n\nclass AudioDataset(Dataset):\n    \"\"\"Returns raw waveform tensors of fixed length.\"\"\"\n\n    def __init__(self, paths: list[Path], target_seconds: float = 5.0):\n        self.paths = paths\n        self.n_samples = int(target_seconds * SR)\n\n    def __len__(self): return len(self.paths)\n\n    def __getitem__(self, i: int) -> torch.Tensor:\n        wav, sr = torchaudio.load(self.paths[i])\n        if sr != SR:\n            wav = T.Resample(sr, SR)(wav)\n        if wav.shape[0] > 1:\n            wav = wav.mean(dim=0, keepdim=True)       # downmix\n        # Pad / crop to fixed length.\n        if wav.shape[1] < self.n_samples:\n            wav = torch.nn.functional.pad(wav, (0, self.n_samples - wav.shape[1]))\n        else:\n            wav = wav[:, :self.n_samples]\n        return wav.squeeze(0)                          # (n_samples,)\n\n\nclass GPUMelTransform(torch.nn.Module):\n    \"\"\"Run mel + log + standardize on the GPU as part of forward().\"\"\"\n\n    def __init__(self, n_mels: int = 80) -> None:\n        super().__init__()\n        self.mel = T.MelSpectrogram(\n            sample_rate=SR, n_fft=1024, hop_length=256,\n            n_mels=n_mels, power=2.0,\n        )\n        self.amp_to_db = T.AmplitudeToDB(stype=\"power\", top_db=80)\n\n    @torch.no_grad()\n    def forward(self, x: torch.Tensor) -> torch.Tensor:\n        # x: (B, n_samples) on GPU\n        m = self.mel(x)                                # (B, n_mels, T)\n        m = self.amp_to_db(m)\n        # Per-sample standardize.\n        mean = m.mean(dim=(1, 2), keepdim=True)\n        std  = m.std(dim=(1, 2), keepdim=True) + 1e-8\n        return (m - mean) / std\n\n\npaths = sorted(Path(\"data/\").glob(\"*.wav\"))[:64]\nds = AudioDataset(paths)\nloader = DataLoader(ds, batch_size=16, num_workers=4, pin_memory=True)\n\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\ngpu_tx = GPUMelTransform(n_mels=80).to(device)\n\nfor batch in loader:\n    batch = batch.to(device, non_blocking=True)\n    mel = gpu_tx(batch)\n    print(mel.shape)                                   # (16, 80, T)\n    break\n\n# Decision rule:\n#   Quick analysis / prototyping             -> librosa (NumPy, CPU).\n#   Train a model end-to-end                  -> torchaudio (GPU, batched, differentiable).\n#   Music IR (key, tempo, genre)              -> essentia (lots of pretrained algorithms).\n#   Edit files (concat, fade, format convert) -> pydub.\n#   Real-time effects                          -> sounddevice + scipy.signal callbacks.\n#   Need ASR                                   -> faster-whisper / wav2vec2 + torchaudio loading.\n#   Want consistent train+infer mel            -> torchaudio (matches what the model trained on).\n#   Want consistent feature versions           -> librosa pinned + cache to disk.\n\n# Anti-pattern:\n#   features = librosa.feature.melspectrogram(...)  # CPU per item\n#   x = torch.from_numpy(features).cuda()            # then send to GPU\n# Per-clip CPU mel + numpy<->torch copy is the bottleneck. If you train\n# on GPU, do the mel on GPU with torchaudio - one batched call vs\n# thousands of single-item ones.\n"
                  }
        ],
        tips: [
                  "librosa is NumPy/CPU first — best for iteration, sklearn pipelines, and feature exports to disk.",
                  "torchaudio mirrors librosa's primitives as differentiable tensor ops — best inside a training loop on GPU.",
                  "essentia ships pretrained algorithms (key, tempo, genre, mood) — best for music IR without training your own.",
                  "pydub is for editing/converting (concat, fade, export) — not analysis.",
                  "For real-time effects, drop down to `sounddevice` + `scipy.signal` and stream blocks."
        ],
        mistake: "Computing features in librosa during a PyTorch training loop — the NumPy↔Tensor copy and CPU compute become the bottleneck. Use torchaudio on GPU.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }

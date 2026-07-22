---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "formats"
id: "audio-file-formats"
title: "soundfile / pydub / wave — picking a file I/O library"
category: "formats"
subtitle: "soundfile.read / write (subtype, dtype, samplerate; (n,) or (n, channels)), soundfile.SoundFile for streaming, pydub.AudioSegment (slicing in ms; needs ffmpeg), wave.open (stdlib, PCM-only), MP3 / M4A / OPUS via ffmpeg, normalization vs peak-clipping"
signature_short: "sf.read(path) -> (data, sr); sf.write(path, data, sr, subtype=); AudioSegment.from_file(path)[:5000]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "soundfile / pydub / wave — picking a file I/O library"
  - "audio-file-formats"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/formats"
  - "category/formats"
  - "tier/tiered"
---

# soundfile / pydub / wave — picking a file I/O library

> soundfile.read / write (subtype, dtype, samplerate; (n,) or (n, channels)), soundfile.SoundFile for streaming, pydub.AudioSegment (slicing in ms; needs ffmpeg), wave.open (stdlib, PCM-only), MP3 / M4A / OPUS via ffmpeg, normalization vs peak-clipping

## Overview

soundfile is the high-quality I/O layer — preserves bit depth (PCM_16, PCM_24, FLOAT), reads/writes WAV/FLAC/OGG/RAW. pydub gives a millisecond-indexed AudioSegment with a friendly API for slicing and exporting (`segment[:5000]`, `segment.export()`); it shells out to ffmpeg for compressed formats. The stdlib `wave` only handles PCM WAV — useful when you can't add a dependency. Three depths solve the SAME task — load an audio file, trim the first second, save as 16-bit WAV — at depths: pydub one-liners → soundfile read/slice/write with explicit dtype + subtype → soundfile streaming for files too big for RAM.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Trim the first second off a file and save as WAV.
- **Junior** — SAME — trim first second, save WAV — using soundfile.
- **Senior** — SAME — trim + save — production: stream the file (no full read), preserve original subtype, normalize peak if asked.

## Signature

```python
sf.read(path) -> (data, sr); sf.write(path, data, sr, subtype=); AudioSegment.from_file(path)[:5000]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Trim the first second off a file and save as WAV.
# APPROACH  - pydub - millisecond slicing, one-line export.
# STRENGTHS - Trivial; works for MP3/M4A out of the box (with ffmpeg).
# WEAKNESSES- pydub uses int16 internally - lossy if you need higher
#             bit depth; ffmpeg required for compressed formats.
from pydub import AudioSegment

audio = AudioSegment.from_file("song.mp3")            # any format ffmpeg supports
trimmed = audio[1000:]                                # millisecond indexing
trimmed.export("trimmed.wav", format="wav")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — trim first second, save WAV — using soundfile.
# APPROACH  - sf.read whole file as float32, slice samples, sf.write.
# STRENGTHS - Preserves bit depth (PCM_16/24/32 or FLOAT); honest dtype.
# WEAKNESSES- Loads whole file into memory; bad for hour-long recordings.
import soundfile as sf
import numpy as np

data, sr = sf.read("song.flac", dtype="float32")     # (n,) or (n, channels)
print(data.shape, sr, data.dtype)

# Trim first second.
data = data[sr:]

# Save as 16-bit PCM WAV.
sf.write("trimmed.wav", data, sr, subtype="PCM_16")

# Available subtypes:
#   PCM_16, PCM_24, PCM_32 - integer
#   FLOAT, DOUBLE          - float WAV
#   VORBIS                 - inside .ogg
#   FLAC                   - inside .flac (lossless)
# soundfile DOESN'T do MP3 - use pydub for that.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — trim + save — production: stream the file (no full
#             read), preserve original subtype, normalize peak if asked.
# APPROACH  - sf.SoundFile context manager; read/write blocks; explicit
#             channels + format propagation.
# STRENGTHS - Constant memory; preserves dtype; handles any size; observable.
# WEAKNESSES- More setup; need to know about subtype/channels/format trio.
from __future__ import annotations
from pathlib import Path
import numpy as np
import soundfile as sf


def trim_and_save(
    src: str | Path,
    dst: str | Path,
    *,
    head_seconds: float = 0.0,
    tail_seconds: float | None = None,
    target_subtype: str | None = None,             # e.g. 'PCM_16'; None = same as source
    normalize: bool = False,
    block_seconds: float = 1.0,
) -> dict:
    """Trim and re-save without holding the whole file in RAM."""
    src = Path(src); dst = Path(dst)
    with sf.SoundFile(src, "r") as fin:
        sr = fin.samplerate
        channels = fin.channels
        subtype = target_subtype or fin.subtype
        block = int(block_seconds * sr)
        start = int(head_seconds * sr)
        stop  = int(tail_seconds * sr) if tail_seconds is not None else fin.frames

        # Position to the start.
        fin.seek(start)
        n_to_read = stop - start

        # First pass: peak (only if normalizing).
        peak = 0.0
        if normalize:
            cur = start
            while cur < stop:
                buf = fin.read(min(block, stop - cur), dtype="float32", always_2d=True)
                if buf.size == 0:
                    break
                peak = max(peak, float(np.abs(buf).max()))
                cur += len(buf)
            fin.seek(start)
            scale = (1.0 / peak) if peak > 0 else 1.0
        else:
            scale = 1.0

        # Second pass: write.
        with sf.SoundFile(dst, "w", samplerate=sr, channels=channels, subtype=subtype) as fout:
            cur = start
            while cur < stop:
                buf = fin.read(min(block, stop - cur), dtype="float32", always_2d=True)
                if buf.size == 0:
                    break
                if scale != 1.0:
                    buf = (buf * scale).astype(np.float32, copy=False)
                fout.write(buf)
                cur += len(buf)

    return {"src": str(src), "dst": str(dst), "sr": sr, "subtype": subtype,
            "channels": channels, "peak": peak if normalize else None}


info = trim_and_save("recording.flac", "edit.wav",
                     head_seconds=1.0, target_subtype="PCM_24", normalize=True)
print(info)

# Decision rule:
#   Just need to read/write WAV/FLAC/OGG       -> soundfile (preserves bit depth).
#   Need MP3/M4A/OPUS or "concat 50 clips"     -> pydub (uses ffmpeg).
#   Stdlib only, PCM WAV is enough             -> wave module.
#   Files too big for RAM                      -> soundfile.SoundFile + read(block).
#   Need to preserve original subtype          -> read source.subtype, pass to write.
#   Need lossless float audio                  -> subtype='FLOAT' (32-bit float WAV).
#   Need smallest size, lossy OK               -> export through pydub to MP3/OPUS.
#   Want to convert formats                    -> pydub.AudioSegment.export(format=).

# Anti-pattern:
#   data, sr = sf.read('song.wav')             # reads as float64 (default)
#   sf.write('out.wav', data, sr)               # writes as float64 -> WAV FLOAT
# You silently changed PCM_16 source to a 32-bit FLOAT WAV (4x size).
# Either pass dtype='int16' on read or subtype='PCM_16' on write to keep
# the original encoding.
```

## Decision Rule

```text
Just need to read/write WAV/FLAC/OGG       -> soundfile (preserves bit depth).
Need MP3/M4A/OPUS or "concat 50 clips"     -> pydub (uses ffmpeg).
Stdlib only, PCM WAV is enough             -> wave module.
Files too big for RAM                      -> soundfile.SoundFile + read(block).
Need to preserve original subtype          -> read source.subtype, pass to write.
Need lossless float audio                  -> subtype='FLOAT' (32-bit float WAV).
Need smallest size, lossy OK               -> export through pydub to MP3/OPUS.
Want to convert formats                    -> pydub.AudioSegment.export(format=).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   data, sr = sf.read('song.wav')             # reads as float64 (default)
>   sf.write('out.wav', data, sr)               # writes as float64 -> WAV FLOAT
> You silently changed PCM_16 source to a 32-bit FLOAT WAV (4x size).
> Either pass dtype='int16' on read or subtype='PCM_16' on write to keep
> the original encoding.

## Tips

- `soundfile.read(path)` returns `(data, sr)`; data is `(n,)` mono or `(n, channels)` — opposite of librosa's `(channels, n)`.
- Pass `dtype='float32'`/`'int16'` to `sf.read` to control in-memory dtype; pass `subtype=` to `sf.write` to control file encoding.
- pydub uses ffmpeg under the hood — install it (`brew install ffmpeg` / `apt install ffmpeg`) for MP3/M4A/OPUS.
- For files larger than RAM, use `sf.SoundFile(path)` as a context manager and `read(block_size)` in a loop.
- When converting formats, choose the destination `subtype` deliberately — silent dtype upgrades can quadruple file size.

## Common Mistake

> [!warning] Reading a PCM_16 WAV with `sf.read(path)` (default float64) and writing it back without a `subtype` — the output is now a 32-bit FLOAT WAV, 2-4× larger. Always pass `subtype=` when writing.

## See Also

- [[Sections/audio-dsp/formats/_Index|Audio & DSP → File I/O — soundfile, pydub, wave]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

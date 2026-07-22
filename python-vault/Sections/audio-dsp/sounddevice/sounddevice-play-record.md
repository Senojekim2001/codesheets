---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "sounddevice"
id: "sounddevice-play-record"
title: "sd.play / sd.rec — synchronous playback and recording"
category: "sounddevice"
subtitle: "sd.play (blocking via sd.wait), sd.rec (returns array, fills async), sd.playrec, sd.query_devices, sd.default.device / samplerate / channels, blocking=True kwarg, sd.stop, default dtype float32"
signature_short: "sd.play(y, sr); sd.wait(); rec = sd.rec(frames, sr, channels); sd.wait()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sd.play / sd.rec — synchronous playback and recording"
  - "sounddevice-play-record"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/sounddevice"
  - "category/sounddevice"
  - "tier/tiered"
---

# sd.play / sd.rec — synchronous playback and recording

> sd.play (blocking via sd.wait), sd.rec (returns array, fills async), sd.playrec, sd.query_devices, sd.default.device / samplerate / channels, blocking=True kwarg, sd.stop, default dtype float32

## Overview

sounddevice exposes PortAudio: enumerate devices with `sd.query_devices()`, set defaults via `sd.default.*`, then `play`/`rec`/`playrec`. By default `play` and `rec` start asynchronously and return immediately — you call `sd.wait()` to block until done. Three depths solve the SAME task — record 5 seconds of audio at 16 kHz mono and play it back — at depths: hardcoded `sd.rec` and `sd.play` → device discovery + dtype/channel settings → record-while-monitoring with input/output device split and a callback-based stop.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Record 5 seconds, then play it back.
- **Junior** — SAME — record + playback — discover devices, validate the rate.
- **Senior** — SAME — record + play — production: choose specific devices by name substring, monitor RMS in real-time, stop early on silence or on user keypress.

## Signature

```python
sd.play(y, sr); sd.wait(); rec = sd.rec(frames, sr, channels); sd.wait()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Record 5 seconds, then play it back.
# APPROACH  - sd.rec + sd.wait + sd.play.
# STRENGTHS - Three calls.
# WEAKNESSES- Uses default device; no error if input is wrong; assumes
#             the system default sample rate is 16000 (often it isn't).
import sounddevice as sd

SR = 16000
DURATION = 5
print("recording...")
rec = sd.rec(int(SR * DURATION), samplerate=SR, channels=1)
sd.wait()                                              # block until done
print("playing back...")
sd.play(rec, samplerate=SR)
sd.wait()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — record + playback — discover devices, validate the rate.
# APPROACH  - sd.query_devices + sd.default.* + explicit dtype.
# STRENGTHS - Picks a real input/output device; correct float32; handles
#             a system whose default sr isn't 16000.
# WEAKNESSES- Still synchronous; no monitoring; user has to wait silently.
import sounddevice as sd
import numpy as np

# Show available devices and their default rates.
print(sd.query_devices())
default_in  = sd.query_devices(kind="input")
default_out = sd.query_devices(kind="output")
print("input:",  default_in["name"],  "@", default_in["default_samplerate"])
print("output:", default_out["name"], "@", default_out["default_samplerate"])

SR = 16000
sd.default.samplerate = SR
sd.default.channels = 1
sd.default.dtype = "float32"

print("recording 5s...")
rec = sd.rec(int(SR * 5))                             # uses defaults set above
sd.wait()
print("min/max:", rec.min(), rec.max())               # should be in [-1, 1]

# Detect silence (super-low RMS).
rms = float(np.sqrt(np.mean(rec ** 2)))
if rms < 1e-3:
    print(f"WARNING: very quiet recording (rms={rms:.5f}); check input device.")

print("playing back...")
sd.play(rec)
sd.wait()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — record + play — production: choose specific devices by
#             name substring, monitor RMS in real-time, stop early on silence
#             or on user keypress.
# APPROACH  - sd.InputStream with a callback; threading.Event for stop;
#             append blocks to a list, concatenate at the end.
# STRENGTHS - Real-time monitoring; early stop; named-device selection.
# WEAKNESSES- Callback runs in a real-time audio thread - keep it cheap;
#             never call print() or do file I/O from inside the callback
#             in production (this example does, only for the demo).
from __future__ import annotations
import sys
import threading
import numpy as np
import sounddevice as sd


def find_device(name_contains: str, kind: str) -> int:
    """Return device index whose name contains the given string."""
    devs = sd.query_devices()
    for i, d in enumerate(devs):
        if name_contains.lower() in d["name"].lower():
            if (kind == "input"  and d["max_input_channels"]  > 0) or \
               (kind == "output" and d["max_output_channels"] > 0):
                return i
    raise LookupError(f"no {kind} device matching {name_contains!r}")


def record_with_monitor(seconds: float = 30,
                        sr: int = 16000,
                        device_in: int | None = None,
                        silence_threshold: float = 1e-3,
                        silence_window_s: float = 2.0) -> np.ndarray:
    """Record up to seconds total; stop early after silence_window_s of silence."""
    blocks: list[np.ndarray] = []
    stop = threading.Event()
    silent_since: list[float] = [0.0]                  # mutable ref

    def callback(indata, frames, time_info, status):
        if status:
            print(f"status: {status}", file=sys.stderr)
        # Copy because indata is a view into a shared buffer.
        blocks.append(indata.copy())

        rms = float(np.sqrt(np.mean(indata ** 2)))
        # Real-time monitor (never do this in production - print is slow).
        bar = "#" * min(40, int(rms * 200))
        print(f"\rrms={rms:.3f} {bar:<40}", end="", flush=True)

        if rms < silence_threshold:
            silent_since[0] += frames / sr
        else:
            silent_since[0] = 0.0
        if silent_since[0] >= silence_window_s:
            stop.set()

    with sd.InputStream(
        samplerate=sr, channels=1, dtype="float32",
        device=device_in, callback=callback, blocksize=1024,
    ):
        stop.wait(timeout=seconds)

    print()
    return np.concatenate(blocks, axis=0).flatten()


# Use it
try:
    in_idx = find_device("MacBook", kind="input")
except LookupError:
    in_idx = None
y = record_with_monitor(seconds=30, sr=16000, device_in=in_idx,
                        silence_threshold=2e-3, silence_window_s=1.5)

print(f"captured {len(y) / 16000:.1f}s")
sd.play(y, samplerate=16000); sd.wait()

# Decision rule:
#   Quick demo / scripts                       -> sd.play / sd.rec (blocking).
#   Real-time monitoring or processing         -> sd.InputStream with callback.
#   Both record AND play simultaneously        -> sd.playrec or InputStream + OutputStream.
#   Need lowest latency                         -> set blocksize small (256 or 512); use ASIO.
#   Long recordings                             -> InputStream + write to soundfile incrementally
#                                                   (don't keep the whole buffer in RAM).
#   Multiple devices / multi-channel            -> set device=, channels=N, mapping=[1,2,3].
#   Cross-platform packaging                    -> sounddevice bundles PortAudio - works
#                                                   without installing anything else.

# Anti-pattern:
#   def callback(indata, frames, ti, status):
#       all_data.append(indata)               # appends the buffer view!
# indata is a NumPy view backed by a buffer that PortAudio reuses.
# After the callback returns, the buffer's contents change underneath
# you. ALWAYS .copy() the indata in the callback if you want to keep it.
```

## Decision Rule

```text
Quick demo / scripts                       -> sd.play / sd.rec (blocking).
Real-time monitoring or processing         -> sd.InputStream with callback.
Both record AND play simultaneously        -> sd.playrec or InputStream + OutputStream.
Need lowest latency                         -> set blocksize small (256 or 512); use ASIO.
Long recordings                             -> InputStream + write to soundfile incrementally
                                                (don't keep the whole buffer in RAM).
Multiple devices / multi-channel            -> set device=, channels=N, mapping=[1,2,3].
Cross-platform packaging                    -> sounddevice bundles PortAudio - works
                                                without installing anything else.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   def callback(indata, frames, ti, status):
>       all_data.append(indata)               # appends the buffer view!
> indata is a NumPy view backed by a buffer that PortAudio reuses.
> After the callback returns, the buffer's contents change underneath
> you. ALWAYS .copy() the indata in the callback if you want to keep it.

## Tips

- Set `sd.default.samplerate / channels / dtype` once at startup, then `sd.play/rec` use them.
- Use `sd.query_devices()` to find devices; index or name substring works for `device=`.
- Always `sd.wait()` after `sd.play/rec` if you need synchronous behavior — they default to async.
- In an `InputStream` callback, **always `.copy()`** the `indata` — it's a view that gets reused.
- Keep callbacks cheap — they run on the audio thread. No file I/O, no print, no GIL-heavy work.

## Common Mistake

> [!warning] Forgetting to `.copy()` `indata` inside an InputStream callback. PortAudio reuses the buffer; your saved data gets overwritten before the next callback.

## See Also

- [[Sections/audio-dsp/sounddevice/sounddevice-stream-callback|sd.InputStream / OutputStream — real-time audio (Audio & DSP)]]
- [[Sections/audio-dsp/sounddevice/_Index|Audio & DSP → sounddevice — playback, recording, streams]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "audio-dsp"
section: "sounddevice"
id: "sounddevice-stream-callback"
title: "sd.InputStream / OutputStream — real-time audio"
category: "sounddevice"
subtitle: "sd.InputStream(callback) for capture, sd.OutputStream for playback, sd.Stream for full-duplex, blocksize vs latency, callback runs on audio thread (no GIL-blocking work), queue.Queue handoff, dropped-frame status flags"
signature_short: "with sd.InputStream(samplerate=, channels=, callback=cb, blocksize=512): time.sleep(seconds)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sd.InputStream / OutputStream — real-time audio"
  - "sounddevice-stream-callback"
tags:
  - "python"
  - "python/audio-dsp"
  - "python/audio-dsp/sounddevice"
  - "category/sounddevice"
  - "tier/tiered"
---

# sd.InputStream / OutputStream — real-time audio

> sd.InputStream(callback) for capture, sd.OutputStream for playback, sd.Stream for full-duplex, blocksize vs latency, callback runs on audio thread (no GIL-blocking work), queue.Queue handoff, dropped-frame status flags

## Overview

Streams give you a continuous audio path with a callback for each block. Block size determines latency: at 48 kHz, blocksize=512 is ~10.7 ms. The callback runs in a real-time priority thread — anything that yields the GIL or does I/O risks underruns (audible clicks/dropouts). Hand work off to a worker thread via `queue.Queue`. Three depths solve the SAME task — capture audio and compute live RMS — at depths: synchronous polling loop with `sd.rec` (gaps between captures) → `InputStream` with callback that prints RMS → callback pushes blocks onto a queue, a worker thread does the analysis off the audio thread.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show live input level for ~5 seconds.
- **Junior** — SAME — live RMS — using sd.InputStream + callback.
- **Senior** — SAME — live RMS display — production: callback only copies into a queue, worker thread does analysis and prints.

## Signature

```python
with sd.InputStream(samplerate=, channels=, callback=cb, blocksize=512): time.sleep(seconds)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show live input level for ~5 seconds.
# APPROACH  - Loop calling sd.rec for 100 ms blocks.
# STRENGTHS - Trivial; no callback math.
# WEAKNESSES- Tiny gaps between blocks; not real-time. Don't ship this.
import sounddevice as sd
import numpy as np
import time

SR = 48000
BLOCK = int(0.1 * SR)                                # 100 ms

t0 = time.time()
while time.time() - t0 < 5:
    block = sd.rec(BLOCK, samplerate=SR, channels=1, blocking=True)
    rms = float(np.sqrt(np.mean(block ** 2)))
    print(f"{rms:.3f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — live RMS — using sd.InputStream + callback.
# APPROACH  - Open a stream; callback computes RMS each block.
# STRENGTHS - Continuous (no gaps); ~10ms latency at blocksize=512.
# WEAKNESSES- print() inside the callback: occasionally blocks for I/O,
#             causes audible glitches in real apps.
import sounddevice as sd
import numpy as np
import time

SR = 48000
BLOCKSIZE = 512                                      # ~10.7 ms at 48 kHz

def callback(indata, frames, time_info, status):
    if status:
        print("status:", status)                     # underrun/overflow flags
    rms = float(np.sqrt(np.mean(indata ** 2)))
    print(f"{rms:.3f}")                              # blocks - bad in production

with sd.InputStream(
    samplerate=SR, channels=1, blocksize=BLOCKSIZE,
    dtype="float32", callback=callback,
):
    time.sleep(5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — live RMS display — production: callback only copies
#             into a queue, worker thread does analysis and prints.
# APPROACH  - queue.Queue handoff; non-blocking put_nowait; drop-on-full
#             (audio thread never waits).
# STRENGTHS - No glitches from slow consumers; clean shutdown; observable.
# WEAKNESSES- Up-to-block-size latency for the analysis side.
from __future__ import annotations
import threading
import queue
import time
import numpy as np
import sounddevice as sd


SR = 48000
BLOCKSIZE = 512


class LiveAnalyzer:
    def __init__(self) -> None:
        self.q: queue.Queue[np.ndarray] = queue.Queue(maxsize=64)
        self._stop = threading.Event()
        self.dropped = 0

    def audio_callback(self, indata, frames, time_info, status):
        # Audio-thread side: be FAST. Just copy and enqueue.
        if status:
            # Don't print; it can block. Just count.
            self.dropped += 1
        try:
            self.q.put_nowait(indata.copy())
        except queue.Full:
            self.dropped += 1                         # consumer behind; drop block

    def consumer(self) -> None:
        # Off the audio thread - free to print, plot, file-write, etc.
        while not self._stop.is_set():
            try:
                block = self.q.get(timeout=0.1)
            except queue.Empty:
                continue
            rms = float(np.sqrt(np.mean(block ** 2)))
            bar = "#" * min(40, int(rms * 200))
            print(f"\rrms={rms:.3f} {bar:<40}  dropped={self.dropped}",
                  end="", flush=True)

    def run(self, seconds: float = 5) -> None:
        worker = threading.Thread(target=self.consumer, daemon=True)
        worker.start()
        with sd.InputStream(
            samplerate=SR, channels=1, blocksize=BLOCKSIZE,
            dtype="float32", callback=self.audio_callback,
        ):
            time.sleep(seconds)
        self._stop.set()
        worker.join(timeout=1)
        print()


if __name__ == "__main__":
    LiveAnalyzer().run(seconds=5)

# Decision rule:
#   Real-time pipeline (live FX, VAD, transcription)   -> InputStream + callback + queue.
#   Want simultaneous playback + capture                -> sd.Stream (full-duplex) or
#                                                          InputStream + OutputStream.
#   Latency budget < 10 ms                               -> blocksize <= 256 + low-latency host API.
#   Latency tolerable, throughput matters                -> blocksize 1024-2048.
#   Multi-channel mics (e.g. 4-mic array)                -> channels=4, indata shape (frames, 4).
#   Need to write to disk live                            -> queue + soundfile.SoundFile in worker.
#   Dropped blocks acceptable (UI meter)                 -> drop-on-full like above.
#   Dropped blocks NOT acceptable (recording)            -> queue.Queue with NO maxsize + size monitor.

# Anti-pattern:
#   def cb(indata, frames, ti, status):
#       result = run_inference(indata)              # NN forward pass
# A 10ms callback budget with a 50ms NN pass = constant underruns and
# audible clicks. Always hand the buffer to a worker; never block the
# audio thread on heavy work.
```

## Decision Rule

```text
Real-time pipeline (live FX, VAD, transcription)   -> InputStream + callback + queue.
Want simultaneous playback + capture                -> sd.Stream (full-duplex) or
                                                       InputStream + OutputStream.
Latency budget < 10 ms                               -> blocksize <= 256 + low-latency host API.
Latency tolerable, throughput matters                -> blocksize 1024-2048.
Multi-channel mics (e.g. 4-mic array)                -> channels=4, indata shape (frames, 4).
Need to write to disk live                            -> queue + soundfile.SoundFile in worker.
Dropped blocks acceptable (UI meter)                 -> drop-on-full like above.
Dropped blocks NOT acceptable (recording)            -> queue.Queue with NO maxsize + size monitor.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   def cb(indata, frames, ti, status):
>       result = run_inference(indata)              # NN forward pass
> A 10ms callback budget with a 50ms NN pass = constant underruns and
> audible clicks. Always hand the buffer to a worker; never block the
> audio thread on heavy work.

## Tips

- Block size sets latency: `latency_ms = blocksize / sr * 1000`. 512 @ 48 kHz ≈ 10.7 ms.
- Callbacks run in a real-time-priority thread — keep them tight (no print, no I/O, no GIL-heavy work).
- Hand off to workers via `queue.Queue.put_nowait` — drop on full rather than block.
- Stream `status` flags carry underrun/overflow info — count them, don't ignore them.
- For full-duplex (live effects), use `sd.Stream` — input and output share a clock.

## Common Mistake

> [!warning] Doing slow work (file write, NN inference, print) inside the audio callback. Audio thread misses its deadline → underruns → clicks/pops.

## See Also

- [[Sections/audio-dsp/sounddevice/sounddevice-play-record|sd.play / sd.rec — synchronous playback and recording (Audio & DSP)]]
- [[Sections/audio-dsp/sounddevice/_Index|Audio & DSP → sounddevice — playback, recording, streams]]
- [[Sections/audio-dsp/_Index|Audio & DSP index]]
- [[_Index|Vault index]]

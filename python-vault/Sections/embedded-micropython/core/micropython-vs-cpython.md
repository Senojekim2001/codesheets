---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "core"
id: "micropython-vs-cpython"
title: "gc / memory / async — what to do differently"
category: "core"
subtitle: "gc.mem_free / mem_alloc / collect, micropython.const for compile-time constants, bytearray pre-allocation, uasyncio (smaller event loop), float = 32-bit (most ports), no Decimal / fractions / multiprocessing, time vs utime (alias on most ports), print() over USB/UART vs binary"
signature_short: "import gc; gc.collect(); gc.mem_free(); from micropython import const; PIN = const(2); buf = bytearray(64)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gc / memory / async — what to do differently"
  - "micropython-vs-cpython"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/core"
  - "category/core"
  - "tier/tiered"
---

# gc / memory / async — what to do differently

> gc.mem_free / mem_alloc / collect, micropython.const for compile-time constants, bytearray pre-allocation, uasyncio (smaller event loop), float = 32-bit (most ports), no Decimal / fractions / multiprocessing, time vs utime (alias on most ports), print() over USB/UART vs binary

## Overview

The big differences: small RAM (typically 256 KB on ESP32, 264 KB on RP2040), 32-bit floats (no `float64`), no `multiprocessing` / `threading.Thread` on most boards (RP2040 has two cores via `_thread`), `uasyncio` instead of `asyncio` (same API, smaller). Use `micropython.const()` so the value gets inlined at compile time (no global-table lookup). Preallocate `bytearray(N)` instead of growing strings. Three depths solve the SAME task — read a sensor every 100 ms and average over 1 s — at depths: naive list-append + sum (heap churn) → preallocated bytearray + manual ring index → uasyncio task with bytearray + const + explicit gc.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read an ADC value every 100 ms and average over the last 10 reads.
- **Junior** — SAME — averaged ADC — but with a preallocated buffer + ring index so no heap allocation in the hot loop.
- **Senior** — SAME — averaged ADC — production: uasyncio task, periodic gc.collect, exposes the latest average via a shared module attribute that other tasks can read without copying.

## Signature

```python
import gc; gc.collect(); gc.mem_free(); from micropython import const; PIN = const(2); buf = bytearray(64)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read an ADC value every 100 ms and average over the last 10 reads.
# APPROACH  - Append to a list; sum / len.
# STRENGTHS - Reads like CPython.
# WEAKNESSES- list.append + slicing churns the heap; gc runs constantly,
#             pauses your loop unpredictably.
import time
from machine import ADC, Pin

adc = ADC(Pin(34))                                    # ESP32 ADC pin
window = []

while True:
    window.append(adc.read())                          # 0..4095
    if len(window) > 10:
        window = window[-10:]                          # !! reallocates list
    print("avg =", sum(window) / len(window))
    time.sleep_ms(100)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — averaged ADC — but with a preallocated buffer + ring
#             index so no heap allocation in the hot loop.
# APPROACH  - bytearray-style fixed buffer + manual index; const for size.
# STRENGTHS - Steady RAM use; no GC pauses inside the loop.
# WEAKNESSES- Synchronous; blocks on time.sleep.
import time
import gc
from machine import ADC, Pin
from micropython import const

WIN = const(10)                                        # inlined at compile

adc = ADC(Pin(34))
buf = [0] * WIN                                        # preallocated
i   = 0
filled = 0

while True:
    buf[i] = adc.read()
    i = (i + 1) % WIN
    if filled < WIN:
        filled += 1
    avg = sum(buf[:filled]) // filled                  # avoid float division if you can
    print("avg =", avg, "free =", gc.mem_free())
    time.sleep_ms(100)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — averaged ADC — production: uasyncio task, periodic
#             gc.collect, exposes the latest average via a shared module
#             attribute that other tasks can read without copying.
# APPROACH  - uasyncio.create_task; explicit gc; bytearray with manual sum
#             across the ring; no float division.
# STRENGTHS - Multiple async tasks (sensor + WiFi + display) in 256 KB.
# WEAKNESSES- Need to internalize uasyncio idioms; no preemption.
import uasyncio as asyncio
import gc
from machine import ADC, Pin
from micropython import const

WIN          = const(20)
PERIOD_MS    = const(100)
GC_EVERY_MS  = const(2000)


class RollingMean:
    __slots__ = ("buf", "i", "filled", "_sum")

    def __init__(self, n: int) -> None:
        self.buf    = [0] * n
        self.i      = 0
        self.filled = 0
        self._sum   = 0

    def push(self, v: int) -> None:
        # Keep a running sum -> O(1) update.
        old = self.buf[self.i]
        self._sum += v - old
        self.buf[self.i] = v
        self.i = (self.i + 1) % len(self.buf)
        if self.filled < len(self.buf):
            self.filled += 1
            self._sum += old                          # we subtracted a "fake" zero

    @property
    def value(self) -> int:
        return self._sum // max(1, self.filled)


SENSOR_AVG = RollingMean(WIN)


async def sensor_task(pin: int) -> None:
    adc = ADC(Pin(pin))
    while True:
        SENSOR_AVG.push(adc.read())
        await asyncio.sleep_ms(PERIOD_MS)


async def gc_task() -> None:
    while True:
        await asyncio.sleep_ms(GC_EVERY_MS)
        gc.collect()                                  # bound peak RAM


async def reporter_task() -> None:
    while True:
        print("avg =", SENSOR_AVG.value, "free =", gc.mem_free())
        await asyncio.sleep_ms(1000)


async def main() -> None:
    asyncio.create_task(sensor_task(34))
    asyncio.create_task(gc_task())
    await reporter_task()


asyncio.run(main())

# Decision rule:
#   Stable hot loop                     -> preallocate (bytearray / list of fixed size).
#   Constants the compiler can inline    -> from micropython import const.
#   Multiple I/O tasks                   -> uasyncio (NOT threading on most boards).
#   Need pause-free hot loop             -> avoid heap allocation inside it; gc.collect()
#                                            on a separate periodic task.
#   Need <1ms response                   -> machine.Timer.PERIODIC (hardware timer)
#                                            with a tiny ISR; do NOT allocate in ISR.
#   Need to dump telemetry                -> use struct.pack into a bytearray; print()
#                                            of a string of digits is slow + GC-heavy.
#   Two cores (RP2040)                    -> _thread.start_new_thread for the second core;
#                                            communicate via _thread.allocate_lock.

# Anti-pattern:
#   def isr(pin):
#       data.append(adc.read())            # heap allocation INSIDE an interrupt
# Heap allocation in an ISR is FORBIDDEN in MicroPython - you'll get
# MemoryError or a board reset. Use micropython.schedule(callback, arg)
# inside the ISR; the callback runs on the main thread where allocation
# is safe.
```

## Decision Rule

```text
Stable hot loop                     -> preallocate (bytearray / list of fixed size).
Constants the compiler can inline    -> from micropython import const.
Multiple I/O tasks                   -> uasyncio (NOT threading on most boards).
Need pause-free hot loop             -> avoid heap allocation inside it; gc.collect()
                                         on a separate periodic task.
Need <1ms response                   -> machine.Timer.PERIODIC (hardware timer)
                                         with a tiny ISR; do NOT allocate in ISR.
Need to dump telemetry                -> use struct.pack into a bytearray; print()
                                         of a string of digits is slow + GC-heavy.
Two cores (RP2040)                    -> _thread.start_new_thread for the second core;
                                         communicate via _thread.allocate_lock.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   def isr(pin):
>       data.append(adc.read())            # heap allocation INSIDE an interrupt
> Heap allocation in an ISR is FORBIDDEN in MicroPython - you'll get
> MemoryError or a board reset. Use micropython.schedule(callback, arg)
> inside the ISR; the callback runs on the main thread where allocation
> is safe.

## Tips

- RAM is the constraint — preallocate `bytearray(N)` / `list_of_n_zeros` and reuse them in hot loops.
- `from micropython import const` makes `const(VALUE)` a compile-time constant — saves a global-table lookup per access.
- Use `uasyncio` (the MicroPython port of asyncio) for cooperative multitasking — `_thread` is only on RP2040.
- No allocation inside interrupt handlers — schedule a Python callback with `micropython.schedule(cb, arg)`.
- Most ports use 32-bit floats — precision past ~7 decimal digits is gone. Use integers when possible.

## Common Mistake

> [!warning] Allocating inside an interrupt handler (`buf.append(...)`) — MicroPython forbids it and you'll see `MemoryError` or a hard reset. Defer work via `micropython.schedule(cb, arg)`.

## See Also

- [[Sections/embedded-micropython/core/_Index|MicroPython / Embedded → MicroPython vs CPython — what's different]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

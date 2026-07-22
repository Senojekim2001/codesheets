---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "platforms"
id: "micropython-rp2040-pico"
title: "rp2 / Pico — second core, PIO, asyncio"
category: "platforms"
subtitle: "_thread.start_new_thread (Pico has 2 cores; ESP32 doesn't support _thread well), rp2.PIO + @asm_pio decorator (state-machine assembler, 32 instructions max), StateMachine.put / get for FIFO, common PIO uses (WS2812 RGB strip, software UART, quadrature decoder), Pico W: + WiFi via cyw43439, Pico 2 (RP2350): RISC-V or ARM cores"
signature_short: "_thread.start_new_thread(worker, ()); @rp2.asm_pio(...) def prog(): nop(); sm = rp2.StateMachine(0, prog, freq=1_000_000, set_base=Pin(15)); sm.active(1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "rp2 / Pico — second core, PIO, asyncio"
  - "micropython-rp2040-pico"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/platforms"
  - "category/platforms"
  - "tier/tiered"
---

# rp2 / Pico — second core, PIO, asyncio

> _thread.start_new_thread (Pico has 2 cores; ESP32 doesn't support _thread well), rp2.PIO + @asm_pio decorator (state-machine assembler, 32 instructions max), StateMachine.put / get for FIFO, common PIO uses (WS2812 RGB strip, software UART, quadrature decoder), Pico W: + WiFi via cyw43439, Pico 2 (RP2350): RISC-V or ARM cores

## Overview

The Pico's two killer features: dual-core and PIO. `_thread.start_new_thread(target, args)` launches `target` on core 1 — communicate via shared globals + `_thread.allocate_lock()`. PIO is a tiny 32-instruction assembler that runs independently of the CPU at up to 133 MHz — perfect for WS2812 timing, software UART, quadrature encoders. Three depths solve the SAME task — drive a strip of WS2812 RGB LEDs — at depths: bit-banging in Python (works for 8 LEDs at low refresh) → PIO state machine driving the LED strip at full clock → uasyncio task on core 0 doing animation while PIO on core 1 handles the data line.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Light up 8 WS2812 RGB LEDs in a rainbow.
- **Junior** — SAME — drive a WS2812 strip — but with a PIO state machine so timing is deterministic at any LED count.
- **Senior** — SAME — WS2812 strip — production: PIO drives data, uasyncio on core 0 runs the animation, core 1 reads buttons over _thread for input concurrency.

## Signature

```python
_thread.start_new_thread(worker, ()); @rp2.asm_pio(...) def prog(): nop(); sm = rp2.StateMachine(0, prog, freq=1_000_000, set_base=Pin(15)); sm.active(1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Light up 8 WS2812 RGB LEDs in a rainbow.
# APPROACH  - Bit-bang the data line manually.
# STRENGTHS - Works without any extra setup.
# WEAKNESSES- WS2812 needs sub-microsecond timing; pure-Python bit-bang
#             on Pico can do it for 8 LEDs at ~10 Hz refresh, but breaks
#             at higher counts.
import time
from machine import Pin

# WS2812 protocol: each bit is a pulse; bit timing is on the order of 400 ns.
# Pure Python is too slow for >~8 LEDs - use PIO (junior tier).

PIN = 15
NUM = 8
pin = Pin(PIN, Pin.OUT)


def send_color(r, g, b):
    # WS2812 wants GRB order, MSB first.
    grb = (g << 16) | (r << 8) | b
    for i in range(23, -1, -1):
        bit = (grb >> i) & 1
        # Crude: not actually fast enough for real WS2812 timing.
        pin.value(1)
        if bit: pin.value(1)
        else:   pin.value(0)
        pin.value(0)


while True:
    for hue in range(NUM):
        r = (hue * 30) % 256
        send_color(r, 32, 255 - r)
    time.sleep_ms(100)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — drive a WS2812 strip — but with a PIO state machine
#             so timing is deterministic at any LED count.
# APPROACH  - rp2.asm_pio program implementing the 800 kHz protocol; feed
#             RGB colors via the StateMachine FIFO.
# STRENGTHS - Real-world correct timing for 100s of LEDs.
# WEAKNESSES- PIO assembler has a learning curve; 32-instruction limit.
import array, time
import rp2
from machine import Pin

NUM = 30
PIN = 15

# Standard WS2812 PIO program: shifts 24 bits MSB-first; tuned for 8 MHz
# clock per bit-time-third (so total bit window = 1.25 us).
@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW,
             out_shiftdir=rp2.PIO.SHIFT_LEFT,
             autopull=True, pull_thresh=24)
def ws2812():
    T1 = 2; T2 = 5; T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1)               .side(0)    [T3 - 1]
    jmp(not_x, "do_zero")   .side(1)    [T1 - 1]
    jmp("bitloop")          .side(1)    [T2 - 1]
    label("do_zero")
    nop()                   .side(0)    [T2 - 1]
    wrap()


sm = rp2.StateMachine(0, ws2812, freq=8_000_000, sideset_base=Pin(PIN))
sm.active(1)

buf = array.array("I", [0] * NUM)                     # 32-bit per LED, top 8 bits unused

def show():
    sm.put(buf, 8)                                    # left-shift by 8 to align top 24 bits


while True:
    for hue in range(NUM):
        r = (hue * 8) & 0xFF
        # WS2812 wants GRB order; pack as 0x00GGRRBB shifted left 8.
        buf[hue] = (r << 16) | (32 << 24) | ((255 - r) << 8)
    show()
    time.sleep_ms(50)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — WS2812 strip — production: PIO drives data, uasyncio
#             on core 0 runs the animation, core 1 reads buttons over
#             _thread for input concurrency.
# APPROACH  - PIO + uasyncio + _thread; lock guards the shared color buffer.
# STRENGTHS - Smooth animation; UI button input doesn't drop frames;
#             scales to 200+ LEDs.
# WEAKNESSES- _thread on RP2040 is preemptive between cores - need locks
#             around shared state.
import _thread, time, array, rp2, uasyncio as asyncio
from machine import Pin


NUM = 60
DATA_PIN = 15
BUTTON_PIN = 14


@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW,
             out_shiftdir=rp2.PIO.SHIFT_LEFT,
             autopull=True, pull_thresh=24)
def ws2812():
    T1 = 2; T2 = 5; T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1)               .side(0)    [T3 - 1]
    jmp(not_x, "do_zero")   .side(1)    [T1 - 1]
    jmp("bitloop")          .side(1)    [T2 - 1]
    label("do_zero")
    nop()                   .side(0)    [T2 - 1]
    wrap()


sm = rp2.StateMachine(0, ws2812, freq=8_000_000, sideset_base=Pin(DATA_PIN))
sm.active(1)

buf = array.array("I", [0] * NUM)
buf_lock = _thread.allocate_lock()
mode = 0                                               # 0=rainbow, 1=fire


def grb(r, g, b):
    return (g << 24) | (r << 16) | (b << 8)


def core1_buttons():
    global mode
    btn = Pin(BUTTON_PIN, Pin.IN, Pin.PULL_UP)
    last = 1
    while True:
        v = btn.value()
        if last == 1 and v == 0:                       # falling edge
            mode = (mode + 1) % 2
        last = v
        time.sleep_ms(10)


_thread.start_new_thread(core1_buttons, ())            # core 1


async def animator():
    t = 0
    while True:
        with buf_lock:
            for i in range(NUM):
                if mode == 0:
                    h = (t + i * 8) & 0xFF
                    buf[i] = grb(h, 32, 255 - h)
                else:
                    flicker = ((t * 7 + i * 23) & 0x3F)
                    buf[i] = grb(180 + flicker, 40 + (flicker >> 1), 0)
        sm.put(buf, 8)
        t = (t + 4) & 0xFF
        await asyncio.sleep_ms(33)                     # ~30 FPS


async def main():
    await animator()


asyncio.run(main())

# Decision rule:
#   Need 2 cores (RP2040 / RP2350)             -> _thread.start_new_thread + lock.
#   Need sub-microsecond timing (WS2812, etc.)  -> rp2.PIO program.
#   Need 5+ peripherals on one MCU              -> PIO can implement extra UARTs/SPIs.
#   Need WiFi on Pico                           -> Pico W (cyw43439) - same _thread/PIO,
#                                                 + network.WLAN.
#   Need >2 cores or NEON                       -> not Pico; reach for ESP32-S3 or
#                                                 a Cortex-A SBC (Linux land).
#   Need C-level perf in MicroPython            -> @micropython.viper / @micropython.native
#                                                 decorators on small functions.

# Anti-pattern:
#   shared = []
#   _thread.start_new_thread(producer, ())
#   _thread.start_new_thread(consumer, ())   # both touching shared without lock
# Two cores writing to the same Python list is a recipe for corruption
# or hangs. Always _thread.allocate_lock() and 'with lock:'.
```

## Decision Rule

```text
Need 2 cores (RP2040 / RP2350)             -> _thread.start_new_thread + lock.
Need sub-microsecond timing (WS2812, etc.)  -> rp2.PIO program.
Need 5+ peripherals on one MCU              -> PIO can implement extra UARTs/SPIs.
Need WiFi on Pico                           -> Pico W (cyw43439) - same _thread/PIO,
                                              + network.WLAN.
Need >2 cores or NEON                       -> not Pico; reach for ESP32-S3 or
                                              a Cortex-A SBC (Linux land).
Need C-level perf in MicroPython            -> @micropython.viper / @micropython.native
                                              decorators on small functions.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   shared = []
>   _thread.start_new_thread(producer, ())
>   _thread.start_new_thread(consumer, ())   # both touching shared without lock
> Two cores writing to the same Python list is a recipe for corruption
> or hangs. Always _thread.allocate_lock() and 'with lock:'.

## Tips

- RP2040 / RP2350 have two cores — `_thread.start_new_thread(target, args)` runs `target` on core 1.
- PIO state machines can do sub-microsecond timing the CPU can't — WS2812, software UART, quadrature decoder.
- For WiFi on Pico, use **Pico W** (cyw43439 chip) — same MicroPython API as ESP32 (`network.WLAN`).
- `@micropython.viper` and `@micropython.native` decorators give near-C performance on tight functions — use sparingly.
- Locks are mandatory between cores — `_thread.allocate_lock()`, then `with lock:` around shared-state mutations.

## Common Mistake

> [!warning] Two cores writing to a shared Python list without a lock — corruption or hangs. Always `_thread.allocate_lock()` and `with lock:` around mutations.

## See Also

- [[Sections/embedded-micropython/platforms/micropython-esp32-wifi|esp32 / network.WLAN — WiFi + HTTPS + MQTT (MicroPython / Embedded)]]
- [[Sections/embedded-micropython/platforms/_Index|MicroPython / Embedded → Platforms — ESP32, RP2040 (Pico), CircuitPython]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "patterns"
id: "micropython-vs-circuitpython"
title: "MicroPython vs CircuitPython vs C/Rust — pick the toolchain"
category: "patterns"
subtitle: "MicroPython (community-driven, every major MCU, uasyncio, _thread on RP2040, viper/native decorators) vs CircuitPython (Adafruit; CIRCUITPY USB drive, simpler stdlib mapping, no asyncio in older releases) vs Arduino C++ (universal but verbose) vs Rust embedded (memory-safe, async via embassy, no GC) vs ESP-IDF (C, official Espressif framework with FreeRTOS), Zephyr RTOS (cross-MCU C)"
signature_short: "# MicroPython: import machine; machine.Pin(2, machine.Pin.OUT)\\n# CircuitPython: import board, digitalio; led = digitalio.DigitalInOut(board.D13)\\n# Rust embassy: let mut led = Output::new(p.PIN_25, Level::Low, Speed::Low);"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MicroPython vs CircuitPython vs C/Rust — pick the toolchain"
  - "micropython-vs-circuitpython"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# MicroPython vs CircuitPython vs C/Rust — pick the toolchain

> MicroPython (community-driven, every major MCU, uasyncio, _thread on RP2040, viper/native decorators) vs CircuitPython (Adafruit; CIRCUITPY USB drive, simpler stdlib mapping, no asyncio in older releases) vs Arduino C++ (universal but verbose) vs Rust embedded (memory-safe, async via embassy, no GC) vs ESP-IDF (C, official Espressif framework with FreeRTOS), Zephyr RTOS (cross-MCU C)

## Overview

MicroPython covers ESP32 / RP2040 / STM32 / nRF / many others; same code runs across them with light pin-name changes. CircuitPython is Adafruit's fork: friendlier API (`board.D13` instead of pin numbers), the board mounts as a USB drive (`CIRCUITPY/`), and it ships drivers for hundreds of Adafruit sensors. Trade-off: slower, slightly less RAM-efficient, smaller chip support. Reach for **C / C++** (Arduino or ESP-IDF) when you need 100+ µs precision, peripheral access MicroPython doesn't expose, or sleep currents below 10 µA. Reach for **Rust + embassy** for memory-safety + async on bare metal — modern, fast, growing fast in 2026. Three depths solve the SAME task — blink an LED at 1 Hz — at depths: MicroPython 5-line script → CircuitPython equivalent showing the API differences → Rust embassy version showing what "no GC, real-time" looks like.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Blink the onboard LED at 1 Hz. (MicroPython)
- **Junior** — SAME — blink LED at 1 Hz — in CircuitPython on the same board.
- **Senior** — SAME — blink LED at 1 Hz — Rust + embassy on RP2040 (no GC, real-time async, fits in 32 KB flash).

## Signature

```python
# MicroPython: import machine; machine.Pin(2, machine.Pin.OUT)\n# CircuitPython: import board, digitalio; led = digitalio.DigitalInOut(board.D13)\n# Rust embassy: let mut led = Output::new(p.PIN_25, Level::Low, Speed::Low);
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Blink the onboard LED at 1 Hz. (MicroPython)
# APPROACH  - machine.Pin + sleep.
# STRENGTHS - Five lines.
# WEAKNESSES- Synchronous; blocks the whole interpreter.
import time
from machine import Pin

led = Pin(2, Pin.OUT)
while True:
    led.toggle()
    time.sleep(0.5)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — blink LED at 1 Hz — in CircuitPython on the same board.
# APPROACH  - import board + digitalio.
# STRENGTHS - Friendlier names (board.D13 instead of pin numbers); board
#             auto-mounts as CIRCUITPY drive - drag-and-drop main.py.
# WEAKNESSES- Older releases lacked asyncio; smaller chip family.
"""
# code.py on a CIRCUITPY drive (Adafruit's main script entry point):
import board
import digitalio
import time

led = digitalio.DigitalInOut(board.LED)              # board.LED is portable
led.direction = digitalio.Direction.OUTPUT

while True:
    led.value = not led.value
    time.sleep(0.5)
"""
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — blink LED at 1 Hz — Rust + embassy on RP2040 (no GC,
#             real-time async, fits in 32 KB flash).
# APPROACH  - embassy executor; Output pin; Timer::after for sleep.
# STRENGTHS - Memory-safe, deterministic timing, microamp sleep currents,
#             zero-cost async.
# WEAKNESSES- Rust learning curve; longer build; cross-compile setup.
"""
# Cargo.toml dependencies:
#   embassy-executor = { version = "0.6", features = ["arch-cortex-m", "executor-thread"] }
#   embassy-rp       = { version = "0.2",  features = ["rp2040", "time-driver"] }
#   embassy-time     = { version = "0.3" }

#![no_std]
#![no_main]

use embassy_executor::Spawner;
use embassy_rp::gpio::{Level, Output};
use embassy_time::{Duration, Timer};
use {defmt_rtt as _, panic_probe as _};

#[embassy_executor::main]
async fn main(_spawner: Spawner) {
    let p = embassy_rp::init(Default::default());
    let mut led = Output::new(p.PIN_25, Level::Low);

    loop {
        led.toggle();
        Timer::after(Duration::from_millis(500)).await;
    }
}

# Build:
#   $ cargo build --release --target thumbv6m-none-eabi
# Flash (RP2040 in BOOTSEL):
#   $ probe-rs run --chip RP2040 target/thumbv6m-none-eabi/release/blink
"""

# Decision rule:
#   Quick prototype, beginner                  -> CircuitPython.
#   Production embedded, Python everywhere     -> MicroPython.
#   Need uasyncio / _thread / viper             -> MicroPython.
#   Need every microsecond of timing            -> C / C++ (ESP-IDF / Arduino) or Rust.
#   Need <10 uA deepsleep                        -> C with FreeRTOS / ESP-IDF; MicroPython
#                                                 does ~10 uA on ESP32 deepsleep but app
#                                                 wake-up is heavier.
#   Memory safety + async on bare metal         -> Rust + embassy.
#   Safety-critical (medical, avionics)         -> not Python; certified C (MISRA), Ada,
#                                                 or Rust with formal subsets.
#   Audio DSP at MHz rates                       -> C/C++ with SIMD or Rust + nostd.
#   Cross-vendor portability                    -> Zephyr RTOS (C) for the maximum reach.

# Anti-pattern:
#   "I'll just rewrite the firmware in Python because I know Python"
# When the existing C firmware works, RAM is tight, real-time is critical,
# and the team is C-only - keep C. MicroPython is for greenfield embedded
# where productivity > the last 20% of perf, and team is Python-fluent.
"""
```

## Decision Rule

```text
Quick prototype, beginner                  -> CircuitPython.
Production embedded, Python everywhere     -> MicroPython.
Need uasyncio / _thread / viper             -> MicroPython.
Need every microsecond of timing            -> C / C++ (ESP-IDF / Arduino) or Rust.
Need <10 uA deepsleep                        -> C with FreeRTOS / ESP-IDF; MicroPython
                                              does ~10 uA on ESP32 deepsleep but app
                                              wake-up is heavier.
Memory safety + async on bare metal         -> Rust + embassy.
Safety-critical (medical, avionics)         -> not Python; certified C (MISRA), Ada,
                                              or Rust with formal subsets.
Audio DSP at MHz rates                       -> C/C++ with SIMD or Rust + nostd.
Cross-vendor portability                    -> Zephyr RTOS (C) for the maximum reach.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   "I'll just rewrite the firmware in Python because I know Python"
> When the existing C firmware works, RAM is tight, real-time is critical,
> and the team is C-only - keep C. MicroPython is for greenfield embedded
> where productivity > the last 20% of perf, and team is Python-fluent.

## Tips

- MicroPython for serious embedded (perf + ecosystem); CircuitPython for friendly first projects.
- CircuitPython auto-mounts as `CIRCUITPY` USB drive — drag-and-drop `code.py` to deploy. No `mpremote` needed.
- For sub-µs timing or sleep currents <10 µA, drop to **C** (ESP-IDF / Arduino) or **Rust embassy**.
- Rust + embassy is the modern bare-metal-async path — memory-safe, zero-cost async, growing fast in 2026.
- For cross-vendor portability across MCU brands, **Zephyr RTOS** (C) reaches the most chips — but it's a C codebase.

## Common Mistake

> [!warning] Rewriting working C firmware in MicroPython because "I know Python" — when RAM is tight and real-time is critical, the rewrite usually loses. MicroPython shines on greenfield projects where productivity > the last 20% of perf.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/embedded-micropython/patterns/_Index|MicroPython / Embedded → Pick the right embedded Python flavor]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

---
type: "file-index"
domain: "python"
file: "embedded-micropython"
title: "MicroPython / Embedded"
tags:
  - "python"
  - "python/embedded-micropython"
  - "index"
---

# MicroPython / Embedded

> 7 entries across 5 sections.

## MicroPython vs CPython — what's different · 1

- [[Sections/embedded-micropython/core/micropython-vs-cpython|gc / memory / async — what to do differently]] — MicroPython is ~95% Python-the-language with a stripped-down stdlib. Floats are 32-bit; integers can be small-ints (no allocation) or arbitrary-precision (heap). RAM is the bottleneck — preallocate buffers, watch `gc.mem_free()`, and use `const()` for compile-time constants. `uasyncio` exists and is lighter than CPython's `asyncio`.

## Hardware peripherals — GPIO, PWM, ADC, I2C, SPI · 2

- [[Sections/embedded-micropython/hardware/micropython-gpio-pwm-adc|machine.Pin / PWM / ADC — digital + analog I/O]] — The `machine` module is the hardware abstraction: `Pin(num, Pin.IN/OUT, Pin.PULL_UP)` for digital I/O, `PWM(Pin)` for analog-out, `ADC(Pin)` for analog-in. Pin numbering is **board-specific** — ESP32 GPIO numbers, Pico GPxx numbers, STM32 letter+number combinations.
- [[Sections/embedded-micropython/hardware/micropython-i2c-spi|machine.I2C / SPI — talk to sensors and displays]] — I2C is the right bus for low-speed sensors (BME280, MPU6050, OLED screens) — two wires (SDA/SCL), addresses up to 127 devices. SPI is faster (MHz) — used for SD cards, big displays, ADCs. Both are exposed via `machine.I2C` / `machine.SPI` with `readfrom_mem`/`write` helpers.

## Platforms — ESP32, RP2040 (Pico), CircuitPython · 2

- [[Sections/embedded-micropython/platforms/micropython-esp32-wifi|esp32 / network.WLAN — WiFi + HTTPS + MQTT]] — ESP32 has built-in WiFi + Bluetooth. `network.WLAN(network.STA_IF)` is the station-mode interface; connect with `.connect(ssid, pwd)`, poll `.isconnected()`. Once online, `urequests` for HTTP(S), `umqtt.simple` for MQTT, sockets via `usocket`. Memory: an HTTPS request is ~30 KB of RAM peak — trim other allocations first.
- [[Sections/embedded-micropython/platforms/micropython-rp2040-pico|rp2 / Pico — second core, PIO, asyncio]] — The RP2040 (Raspberry Pi Pico) has two ARM Cortex-M0+ cores and **PIO** — a Programmable I/O subsystem that runs tiny state-machine programs at clock speed. Use the second core via `_thread`; use PIO when bit-banging would be too slow (WS2812 LEDs, custom UART/SPI variants).

## Tooling and dev workflow · 1

- [[Sections/embedded-micropython/tooling/micropython-mpremote|mpremote / mip / WebREPL — flash, deploy, debug]] — The modern MicroPython workflow: `mpremote` (one tool replaces ampy/rshell). `mpremote connect /dev/ttyACM0 fs cp main.py :main.py` deploys a file. `mpremote mip install <pkg>` installs a community package. WebREPL is the in-browser fallback for ESP32 over WiFi.

## Pick the right embedded Python flavor · 1

- [[Sections/embedded-micropython/patterns/micropython-vs-circuitpython|MicroPython vs CircuitPython vs C/Rust — pick the toolchain]] — MicroPython for serious embedded — performance, async, every chip, open community. CircuitPython (Adafruit fork) for beginners and quick projects — friendlier API, USB drive shows up, hardware learning ramp. C / Rust when you need every microsecond, or for sleep currents <10 µA, or for safety-critical work.

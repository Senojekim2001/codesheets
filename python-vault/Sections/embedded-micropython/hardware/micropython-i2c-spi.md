---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "hardware"
id: "micropython-i2c-spi"
title: "machine.I2C / SPI — talk to sensors and displays"
category: "hardware"
subtitle: "machine.I2C (id=, scl=, sda=, freq=400000), i2c.scan() to enumerate addresses, i2c.readfrom_mem(addr, reg, n) / writeto_mem(addr, reg, bytes), machine.SPI (baudrate=, polarity=, phase=, sck=, mosi=, miso=), CS pin manual, struct for binary unpacking, ssd1306 / bme280 driver libs"
signature_short: "i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400_000); i2c.scan(); i2c.readfrom_mem(0x76, 0xD0, 1); spi = SPI(1, baudrate=10_000_000, polarity=0, phase=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "machine.I2C / SPI — talk to sensors and displays"
  - "micropython-i2c-spi"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/hardware"
  - "category/hardware"
  - "tier/tiered"
---

# machine.I2C / SPI — talk to sensors and displays

> machine.I2C (id=, scl=, sda=, freq=400000), i2c.scan() to enumerate addresses, i2c.readfrom_mem(addr, reg, n) / writeto_mem(addr, reg, bytes), machine.SPI (baudrate=, polarity=, phase=, sck=, mosi=, miso=), CS pin manual, struct for binary unpacking, ssd1306 / bme280 driver libs

## Overview

I2C: pick a peripheral id (0 or 1 typically), set `scl` and `sda` pins, optionally `freq=400_000` for fast-mode. `i2c.scan()` returns a list of responding 7-bit addresses. `readfrom_mem(addr, reg, nbytes)` reads `nbytes` from a register (the standard sensor protocol). SPI is more setup: `baudrate=`, `polarity=`/`phase=` (SPI mode 0-3), explicit `sck`/`mosi`/`miso` pins, and you toggle the chip-select pin yourself. Three depths solve the SAME task — read a BME280 temperature sensor — at depths: raw I2C registers + struct → drop in a community driver (`bme280.py`) → robust wrapper that auto-detects the address, retries on bus errors, exposes `read_async()`.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read raw temperature register from a BME280 over I2C.
- **Junior** — SAME — BME280 temperature in degrees C — using a community driver instead of hand-coding the calibration math.
- **Senior** — SAME — BME280 readings — production: address auto-detect, OSError retry with backoff, uasyncio task that publishes the latest reading for other tasks (display, MQTT).

## Signature

```python
i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400_000); i2c.scan(); i2c.readfrom_mem(0x76, 0xD0, 1); spi = SPI(1, baudrate=10_000_000, polarity=0, phase=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read raw temperature register from a BME280 over I2C.
# APPROACH  - i2c.scan() to find it; read 3 bytes at the temp register.
# STRENGTHS - No external library needed.
# WEAKNESSES- Doesn't apply calibration; raw value isn't degrees C.
from machine import I2C, Pin

i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400_000)  # ESP32: I2C0 default pins
print("devices:", [hex(a) for a in i2c.scan()])       # expect 0x76 or 0x77

addr = 0x76                                           # BME280 default I2C address
chip_id = i2c.readfrom_mem(addr, 0xD0, 1)[0]
print("chip id =", hex(chip_id))                      # 0x60 = BME280

# Wake up the sensor: write 0x27 to ctrl_meas (temp/press oversampling x1, normal mode).
i2c.writeto_mem(addr, 0xF4, b"\x27")

# Read 3-byte raw temperature (registers 0xFA-0xFC, big-endian 20-bit value).
data = i2c.readfrom_mem(addr, 0xFA, 3)
raw_temp = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
print("raw temp:", raw_temp)                          # NOT in degrees yet
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — BME280 temperature in degrees C — using a community
#             driver instead of hand-coding the calibration math.
# APPROACH  - upip / mip install bme280; driver handles registers + cal.
# STRENGTHS - Real degrees C; one line per reading.
# WEAKNESSES- Bus errors (sensor unplugged, EMI) raise OSError; need
#             handling in production.
# Install on board:  $ mpremote mip install github:robert-hh/BME280
import time
from machine import I2C, Pin
import bme280

i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400_000)
sensor = bme280.BME280(i2c=i2c, address=0x76)

while True:
    t, p, h = sensor.read_compensated_data()
    print(f"T={t/100:.2f} C  P={p/256/100:.1f} hPa  H={h/1024:.1f} %")
    time.sleep(2)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — BME280 readings — production: address auto-detect,
#             OSError retry with backoff, uasyncio task that publishes
#             the latest reading for other tasks (display, MQTT).
# APPROACH  - Wrapper class; address sniff via i2c.scan(); exponential
#             backoff on bus errors; shared snapshot updated atomically.
# STRENGTHS - Survives flaky wiring; multi-task friendly; no alloc in
#             the hot loop.
# WEAKNESSES- Driver lib must already be on the board (mpremote mip).
import uasyncio as asyncio
import time
import bme280
from machine import I2C, Pin
from micropython import const


PERIOD_MS    = const(2000)
MAX_BACKOFF  = const(30_000)
ADDRESSES    = (0x76, 0x77)


class BMEReader:
    __slots__ = ("i2c", "sensor", "snapshot", "last_error")

    def __init__(self, i2c: I2C):
        self.i2c    = i2c
        self.sensor = self._connect()
        self.snapshot  = (None, None, None, 0)         # (T, P, H, ts_ms)
        self.last_error = None

    def _connect(self):
        for addr in ADDRESSES:
            if addr in self.i2c.scan():
                return bme280.BME280(i2c=self.i2c, address=addr)
        raise OSError("BME280 not found on bus")

    async def task(self):
        backoff = 500
        while True:
            try:
                t, p, h = self.sensor.read_compensated_data()
                self.snapshot = (t / 100, p / 25600, h / 1024, time.ticks_ms())
                self.last_error = None
                backoff = 500
                await asyncio.sleep_ms(PERIOD_MS)
            except OSError as e:
                self.last_error = str(e)
                # Try to reconnect; back off so we don't spin.
                await asyncio.sleep_ms(backoff)
                backoff = min(backoff * 2, MAX_BACKOFF)
                try:
                    self.sensor = self._connect()
                except OSError:
                    pass


async def reporter(reader: BMEReader):
    while True:
        t, p, h, ts = reader.snapshot
        if t is not None:
            print(f"[{ts}] T={t:.2f}  P={p:.2f} hPa  H={h:.1f} %")
        else:
            print("waiting for sensor:", reader.last_error)
        await asyncio.sleep_ms(2000)


async def main():
    i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400_000)
    reader = BMEReader(i2c)
    asyncio.create_task(reader.task())
    await reporter(reader)


asyncio.run(main())

# Decision rule:
#   Sensor with kHz updates                  -> I2C is fine (up to 1 MHz fast-mode-plus).
#   Big display / SD card / fast ADC          -> SPI (MHz baud rate).
#   New sensor model                          -> i2c.scan() first; check it shows up.
#   Multiple devices same bus                 -> different addresses (I2C) or
#                                                 separate CS pins (SPI).
#   3.3V vs 5V mismatch                        -> level shifter; many sensors are 3.3V only.
#   Sporadic OSError                          -> bus contention or pull-up missing
#                                                 (4.7k typical on SDA/SCL).
#   Need to swap pins on ESP32                  -> ESP32 I2C is software-routable; just pass
#                                                 different scl=/sda=.
#   Need lots of I/O                            -> I2C/SPI multiplexers (TCA9548A) instead
#                                                 of more peripheral instances.

# Anti-pattern:
#   i2c = I2C(0)  # default pins on this board
#   i2c.readfrom_mem(0x76, 0xD0, 1)   # without 4.7k pull-ups on SDA/SCL
# Most dev boards lack onboard pull-ups for the I2C bus. Without them,
# you'll see intermittent OSError(ETIMEDOUT). Add 4.7k from each line
# to 3.3V or use a board with pull-ups already wired.
```

## Decision Rule

```text
Sensor with kHz updates                  -> I2C is fine (up to 1 MHz fast-mode-plus).
Big display / SD card / fast ADC          -> SPI (MHz baud rate).
New sensor model                          -> i2c.scan() first; check it shows up.
Multiple devices same bus                 -> different addresses (I2C) or
                                              separate CS pins (SPI).
3.3V vs 5V mismatch                        -> level shifter; many sensors are 3.3V only.
Sporadic OSError                          -> bus contention or pull-up missing
                                              (4.7k typical on SDA/SCL).
Need to swap pins on ESP32                  -> ESP32 I2C is software-routable; just pass
                                              different scl=/sda=.
Need lots of I/O                            -> I2C/SPI multiplexers (TCA9548A) instead
                                              of more peripheral instances.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   i2c = I2C(0)  # default pins on this board
>   i2c.readfrom_mem(0x76, 0xD0, 1)   # without 4.7k pull-ups on SDA/SCL
> Most dev boards lack onboard pull-ups for the I2C bus. Without them,
> you'll see intermittent OSError(ETIMEDOUT). Add 4.7k from each line
> to 3.3V or use a board with pull-ups already wired.

## Tips

- `i2c.scan()` returns the list of responding addresses — your first sanity check after wiring up a new sensor.
- I2C bus needs **4.7 kΩ pull-ups** from SDA and SCL to 3.3 V — most dev boards don't include them, hence intermittent `OSError`.
- Use community drivers (`bme280.py`, `ssd1306.py`, `mpu9250.py`) — install via `mpremote mip install <pkg>` rather than reading raw registers.
- For SPI, you toggle CS yourself before/after each transaction — peripherals don't do it for you.
- For binary register parsing, `struct.unpack` works on MicroPython — `struct.unpack(">h", buf)` for big-endian int16, etc.

## Common Mistake

> [!warning] Wiring up an I2C sensor without external 4.7 kΩ pull-ups on SDA/SCL — intermittent `OSError(ETIMEDOUT)` that looks like a sensor bug. Add pull-ups (or use a board that has them).

## See Also

- [[Sections/embedded-micropython/hardware/micropython-gpio-pwm-adc|machine.Pin / PWM / ADC — digital + analog I/O (MicroPython / Embedded)]]
- [[Sections/embedded-micropython/hardware/_Index|MicroPython / Embedded → Hardware peripherals — GPIO, PWM, ADC, I2C, SPI]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

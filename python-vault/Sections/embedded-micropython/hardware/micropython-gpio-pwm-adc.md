---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "hardware"
id: "micropython-gpio-pwm-adc"
title: "machine.Pin / PWM / ADC — digital + analog I/O"
category: "hardware"
subtitle: "machine.Pin (Pin.IN, Pin.OUT, Pin.PULL_UP, Pin.PULL_DOWN), .value() / .on() / .off() / .toggle(), Pin.irq(trigger=Pin.IRQ_FALLING, handler=) for input edges, machine.PWM(pin, freq=, duty_u16=), machine.ADC(pin) returns 0..65535 (16-bit normalized) on most modern ports, board pin labels (ESP32 GPIO34 = ADC1_6)"
signature_short: "p = Pin(2, Pin.OUT); p.on(); p = Pin(0, Pin.IN, Pin.PULL_UP); p.irq(handler=cb, trigger=Pin.IRQ_FALLING); pwm = PWM(Pin(15), freq=1000, duty_u16=32768)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "machine.Pin / PWM / ADC — digital + analog I/O"
  - "micropython-gpio-pwm-adc"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/hardware"
  - "category/hardware"
  - "tier/tiered"
---

# machine.Pin / PWM / ADC — digital + analog I/O

> machine.Pin (Pin.IN, Pin.OUT, Pin.PULL_UP, Pin.PULL_DOWN), .value() / .on() / .off() / .toggle(), Pin.irq(trigger=Pin.IRQ_FALLING, handler=) for input edges, machine.PWM(pin, freq=, duty_u16=), machine.ADC(pin) returns 0..65535 (16-bit normalized) on most modern ports, board pin labels (ESP32 GPIO34 = ADC1_6)

## Overview

Digital I/O is `Pin(num, mode, pull)` — `IN`, `OUT`, optional pull-up/down. Read with `.value()` (0/1), write with `.on()` / `.off()` / `.value(0|1)`. Inputs can attach an interrupt handler with `.irq(handler=cb, trigger=Pin.IRQ_RISING|Pin.IRQ_FALLING)`. PWM ramps a digital pin into an analog-looking signal — use `freq=` (Hz) and `duty_u16=` (0..65535). ADC reads analog voltage; modern ports normalize to 0..65535 via `.read_u16()`. Three depths solve the SAME task — read a button (debounced) and dim an LED with a potentiometer — at depths: bare poll loop → IRQ-driven button + EMA-smoothed ADC → debounced IRQ + uasyncio brightness ramp.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Button toggles LED; potentiometer sets LED brightness.
- **Junior** — SAME — button + potentiometer — but IRQ-driven button (no missed presses) + exponential-moving-average smoothing on ADC.
- **Senior** — SAME — button + potentiometer — production: hardware-timer debounced button via IRQ + 30 ms guard, uasyncio task that ramps brightness toward target rather than stepping.

## Signature

```python
p = Pin(2, Pin.OUT); p.on(); p = Pin(0, Pin.IN, Pin.PULL_UP); p.irq(handler=cb, trigger=Pin.IRQ_FALLING); pwm = PWM(Pin(15), freq=1000, duty_u16=32768)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Button toggles LED; potentiometer sets LED brightness.
# APPROACH  - Polling loop reads pin + ADC every 50 ms.
# STRENGTHS - 10 lines.
# WEAKNESSES- Button bounces (multiple reads per press); no smoothing on ADC;
#             can miss short presses if loop is busy.
import time
from machine import Pin, PWM, ADC

led_pwm = PWM(Pin(2), freq=1000, duty_u16=0)         # ESP32: GPIO2 onboard LED
button  = Pin(0, Pin.IN, Pin.PULL_UP)                # active-low
pot     = ADC(Pin(34))                                # ADC1 channel 6 on ESP32

led_on = False
prev_btn = 1                                          # PULL_UP idle = 1

while True:
    btn = button.value()
    if prev_btn == 1 and btn == 0:                    # falling edge
        led_on = not led_on
    prev_btn = btn

    raw = pot.read_u16()                              # 0..65535
    led_pwm.duty_u16(raw if led_on else 0)

    time.sleep_ms(50)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — button + potentiometer — but IRQ-driven button (no
#             missed presses) + exponential-moving-average smoothing on ADC.
# APPROACH  - Pin.irq(trigger=FALLING) sets a flag; main loop services it.
# STRENGTHS - Catches every press; smoother brightness; cheap CPU.
# WEAKNESSES- Bounce still bites if you press fast (use senior debounce).
import time
from machine import Pin, PWM, ADC


class App:
    def __init__(self):
        self.led_pwm = PWM(Pin(2), freq=1000, duty_u16=0)
        self.button  = Pin(0, Pin.IN, Pin.PULL_UP)
        self.pot     = ADC(Pin(34))
        self.led_on  = False
        self.flag    = False
        self.smoothed = 0
        self.button.irq(handler=self._on_press, trigger=Pin.IRQ_FALLING)

    def _on_press(self, pin):                          # runs in IRQ context
        # Just set a flag - no allocation, no slow work.
        self.flag = True

    def loop(self):
        ALPHA = 0.2                                    # EMA factor
        while True:
            if self.flag:
                self.flag = False
                self.led_on = not self.led_on

            raw = self.pot.read_u16()
            self.smoothed = int((1 - ALPHA) * self.smoothed + ALPHA * raw)
            self.led_pwm.duty_u16(self.smoothed if self.led_on else 0)
            time.sleep_ms(20)


App().loop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — button + potentiometer — production: hardware-timer
#             debounced button via IRQ + 30 ms guard, uasyncio task that
#             ramps brightness toward target rather than stepping.
# APPROACH  - IRQ sets pending; uasyncio task validates after debounce
#             window and ramps led_pwm smoothly.
# STRENGTHS - Bounce-proof; smooth brightness; multiple tasks possible.
# WEAKNESSES- Most boards have ~256 KB RAM - keep imports lean.
import uasyncio as asyncio
import time
from machine import Pin, PWM, ADC
from micropython import const

DEBOUNCE_MS  = const(30)
RAMP_STEP    = const(800)                              # duty_u16 per tick
TICK_MS      = const(20)


class App:
    def __init__(self):
        self.led_pwm = PWM(Pin(2), freq=1000, duty_u16=0)
        self.button  = Pin(0, Pin.IN, Pin.PULL_UP)
        self.pot     = ADC(Pin(34))
        self.led_on  = False
        self._press_pending_ms = 0
        self.button.irq(handler=self._on_irq, trigger=Pin.IRQ_FALLING)
        self._target = 0
        self._current = 0

    def _on_irq(self, pin):
        # Capture timestamp; debounce verifies in the async task.
        self._press_pending_ms = time.ticks_ms()

    async def debounce_task(self):
        last = 0
        while True:
            t = self._press_pending_ms
            if t and time.ticks_diff(time.ticks_ms(), t) >= DEBOUNCE_MS:
                self._press_pending_ms = 0
                if self.button.value() == 0:           # still pressed -> real press
                    if time.ticks_diff(time.ticks_ms(), last) >= DEBOUNCE_MS:
                        self.led_on = not self.led_on
                        last = time.ticks_ms()
            await asyncio.sleep_ms(5)

    async def adc_task(self):
        while True:
            raw = self.pot.read_u16()
            self._target = raw if self.led_on else 0
            await asyncio.sleep_ms(20)

    async def ramp_task(self):
        while True:
            if self._current < self._target:
                self._current = min(self._target, self._current + RAMP_STEP)
            elif self._current > self._target:
                self._current = max(self._target, self._current - RAMP_STEP)
            self.led_pwm.duty_u16(self._current)
            await asyncio.sleep_ms(TICK_MS)

    async def main(self):
        asyncio.create_task(self.debounce_task())
        asyncio.create_task(self.adc_task())
        await self.ramp_task()


asyncio.run(App().main())

# Decision rule:
#   Read a stable input                       -> Pin.value() poll.
#   Need every edge                           -> Pin.irq(trigger=...).
#   Bouncy switch                              -> hardware RC + IRQ + software debounce window.
#   Drive an LED brightness                    -> PWM.duty_u16 (0..65535).
#   Drive a servo                              -> PWM(freq=50, duty_u16 around 5%-10%).
#   Read analog voltage                        -> ADC(pin).read_u16().
#   Multiple sensors / timed loops             -> uasyncio tasks; one task per sensor.
#   Sub-millisecond response                   -> machine.Timer (hardware) with a tiny ISR.
#   Need to ALLOCATE in an interrupt           -> you can't; micropython.schedule(cb, arg).

# Anti-pattern:
#   pin.irq(handler=lambda p: print("pressed"))
# print() inside an ISR allocates and writes to UART - both slow and
# allocation-prone. Set a flag in the ISR; print from the main thread.
```

## Decision Rule

```text
Read a stable input                       -> Pin.value() poll.
Need every edge                           -> Pin.irq(trigger=...).
Bouncy switch                              -> hardware RC + IRQ + software debounce window.
Drive an LED brightness                    -> PWM.duty_u16 (0..65535).
Drive a servo                              -> PWM(freq=50, duty_u16 around 5%-10%).
Read analog voltage                        -> ADC(pin).read_u16().
Multiple sensors / timed loops             -> uasyncio tasks; one task per sensor.
Sub-millisecond response                   -> machine.Timer (hardware) with a tiny ISR.
Need to ALLOCATE in an interrupt           -> you can't; micropython.schedule(cb, arg).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   pin.irq(handler=lambda p: print("pressed"))
> print() inside an ISR allocates and writes to UART - both slow and
> allocation-prone. Set a flag in the ISR; print from the main thread.

## Tips

- Pin numbers are board-specific — `Pin(2)` is the onboard LED on ESP32 dev boards but a different pin on other boards.
- `Pin.irq(trigger=Pin.IRQ_FALLING|Pin.IRQ_RISING, handler=cb)` runs `cb` on edges — keep `cb` tiny (no allocation, no print).
- `PWM(pin, freq=, duty_u16=)` — `duty_u16` is 0..65535; for servos use `freq=50` and ~5%-10% duty.
- ADC: modern ports return 0..65535 via `.read_u16()`; older ESP32 firmware uses `.read()` returning 0..4095.
- Need <1 ms response? Use `machine.Timer.PERIODIC` — hardware timer fires an ISR independent of the main loop.

## Common Mistake

> [!warning] `print()` inside an interrupt handler — allocates and blocks on UART. Always set a flag in the ISR; do work on the main thread.

## See Also

- [[Sections/embedded-micropython/hardware/micropython-i2c-spi|machine.I2C / SPI — talk to sensors and displays (MicroPython / Embedded)]]
- [[Sections/embedded-micropython/hardware/_Index|MicroPython / Embedded → Hardware peripherals — GPIO, PWM, ADC, I2C, SPI]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

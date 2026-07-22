---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "platforms"
id: "micropython-esp32-wifi"
title: "esp32 / network.WLAN — WiFi + HTTPS + MQTT"
category: "platforms"
subtitle: "network.WLAN(STA_IF) (station) vs AP_IF (access point), .active(True) -> .connect(ssid, pwd) -> .isconnected, .ifconfig() returns (ip, mask, gw, dns), urequests.get/post (TLS works on ESP32 if firmware has SSL), umqtt.simple MQTTClient (publish/subscribe), socket reuse to avoid TLS handshake cost, deepsleep for battery operation"
signature_short: "wlan = network.WLAN(network.STA_IF); wlan.active(True); wlan.connect(SSID, PWD); while not wlan.isconnected(): time.sleep_ms(100)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "esp32 / network.WLAN — WiFi + HTTPS + MQTT"
  - "micropython-esp32-wifi"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/platforms"
  - "category/platforms"
  - "tier/tiered"
---

# esp32 / network.WLAN — WiFi + HTTPS + MQTT

> network.WLAN(STA_IF) (station) vs AP_IF (access point), .active(True) -> .connect(ssid, pwd) -> .isconnected, .ifconfig() returns (ip, mask, gw, dns), urequests.get/post (TLS works on ESP32 if firmware has SSL), umqtt.simple MQTTClient (publish/subscribe), socket reuse to avoid TLS handshake cost, deepsleep for battery operation

## Overview

WiFi setup: enable station mode, connect, wait for `isconnected()`. Once up, `urequests.get(url)` does HTTP/HTTPS (with TLS if your firmware ships SSL). MQTT via `umqtt.simple.MQTTClient(client_id, broker, ...)` — `connect()`, `publish(topic, msg)`, `subscribe(topic)`, `check_msg()` to poll. For battery-powered devices, `machine.deepsleep(ms)` cuts power to ~10 µA; the chip reboots on wake, so your code starts from `boot.py` again. Three depths solve the SAME task — POST a sensor reading to a server every minute — at depths: blocking connect + urequests.post → reuse one MQTT connection across many publishes → deepsleep cycle: connect, post, deepsleep 60 s.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Connect to WiFi; POST a sensor reading once.
- **Junior** — SAME — periodic sensor POST — but reuse one MQTT connection across many publishes (much cheaper than HTTPS each time).
- **Senior** — SAME — periodic POST — production: deepsleep cycle for battery operation (target <100 uA between reads), retries with bounded attempts, persisted state across resets.

## Signature

```python
wlan = network.WLAN(network.STA_IF); wlan.active(True); wlan.connect(SSID, PWD); while not wlan.isconnected(): time.sleep_ms(100)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Connect to WiFi; POST a sensor reading once.
# APPROACH  - WLAN.connect + urequests.post.
# STRENGTHS - One file; demonstrates the basics.
# WEAKNESSES- Blocks while connecting; no retry; no auth.
import network
import time
import urequests as requests

SSID, PWD = "my-net", "secret"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PWD)
while not wlan.isconnected():
    time.sleep_ms(200)
print("ip:", wlan.ifconfig()[0])

r = requests.post("https://example.com/api/sensor",
                  json={"temp": 23.5, "humidity": 41.0})
print("status:", r.status_code, r.text)
r.close()                                              # IMPORTANT: free socket
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — periodic sensor POST — but reuse one MQTT connection
#             across many publishes (much cheaper than HTTPS each time).
# APPROACH  - umqtt.simple; reconnect on broker errors.
# STRENGTHS - ~5x lower power than HTTPS-per-publish; persistent connection.
# WEAKNESSES- MQTT broker assumed to exist; no QoS 2 in umqtt.simple.
import network, time, gc, json
from umqtt.simple import MQTTClient

SSID, PWD = "my-net", "secret"
BROKER, TOPIC = "broker.example.com", b"sensors/lab1/temp"

def wifi_up():
    w = network.WLAN(network.STA_IF); w.active(True)
    if not w.isconnected():
        w.connect(SSID, PWD)
        for _ in range(50):
            if w.isconnected(): break
            time.sleep_ms(200)
    return w

def mqtt_connect():
    c = MQTTClient(client_id=b"esp32-lab1", server=BROKER, keepalive=60)
    c.connect()
    return c


wifi_up()
client = mqtt_connect()

while True:
    payload = json.dumps({"t": 22.7, "h": 39.4, "ts": time.time()})
    try:
        client.publish(TOPIC, payload.encode(), retain=False, qos=0)
    except OSError:
        try:
            client.disconnect()
        except OSError:
            pass
        client = mqtt_connect()
        client.publish(TOPIC, payload.encode())
    gc.collect()
    time.sleep(60)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — periodic POST — production: deepsleep cycle for
#             battery operation (target <100 uA between reads), retries
#             with bounded attempts, persisted state across resets.
# APPROACH  - WiFi connect with bounded retry; MQTT publish; machine.RTC
#             memory to count failed cycles; deepsleep for the period.
# STRENGTHS - Real long-life battery design; survives transient outages.
# WEAKNESSES- deepsleep loses Python state; everything resumes from boot.py;
#             RTC memory is small (8 bytes on ESP32 for fast-RTC).
import gc
import json
import time
import machine
import network
from umqtt.simple import MQTTClient
from machine import RTC

SSID, PWD = "my-net", "secret"
BROKER, TOPIC = "broker.example.com", b"sensors/lab1/temp"

PERIOD_S        = 60
MAX_WIFI_TRIES  = 60          # ~12 s at 200 ms
MAX_MQTT_TRIES  = 3
RTC_MEM_KEY     = 0           # byte index of "consecutive failures" counter


def read_sensor() -> dict:
    # Replace with a real sensor read.
    return {"t": 22.7, "h": 39.4}


def wifi_up() -> network.WLAN | None:
    w = network.WLAN(network.STA_IF); w.active(True)
    if not w.isconnected():
        w.connect(SSID, PWD)
        for _ in range(MAX_WIFI_TRIES):
            if w.isconnected(): return w
            time.sleep_ms(200)
        return None
    return w


def publish_once(payload: bytes) -> bool:
    for attempt in range(MAX_MQTT_TRIES):
        try:
            c = MQTTClient(client_id=b"esp32-lab1", server=BROKER,
                           keepalive=30, ssl=False)
            c.connect()
            c.publish(TOPIC, payload, qos=0)
            c.disconnect()
            return True
        except OSError:
            time.sleep_ms(500 * (attempt + 1))
    return False


def get_failure_counter() -> int:
    rtc = RTC()
    mem = rtc.memory()
    return mem[RTC_MEM_KEY] if mem else 0


def set_failure_counter(n: int) -> None:
    rtc = RTC()
    mem = bytearray(rtc.memory() or b"\x00" * 8)
    mem[RTC_MEM_KEY] = n
    rtc.memory(bytes(mem))


def main_cycle() -> None:
    failures = get_failure_counter()

    wlan = wifi_up()
    if wlan is None:
        set_failure_counter(min(failures + 1, 255))
        machine.deepsleep(PERIOD_S * 1000)              # try again later

    payload = json.dumps(read_sensor()).encode()
    ok = publish_once(payload)
    set_failure_counter(0 if ok else min(failures + 1, 255))

    # Always sleep, even on failure - prevents power-eating spin.
    wlan.disconnect(); wlan.active(False)
    gc.collect()
    machine.deepsleep(PERIOD_S * 1000)


main_cycle()                                            # runs once per wake; never returns

# Decision rule:
#   Always-on, mains powered                 -> persistent MQTT (junior tier).
#   Battery, occasional updates              -> deepsleep cycle (senior tier).
#   Need to reach 8+ months on AAA batteries -> deepsleep + LoRa instead of WiFi.
#   Need OTA firmware updates                 -> esp32.Partition + ota_set_boot_partition.
#   Need TLS                                  -> standard MicroPython firmware on ESP32 has SSL;
#                                                certs go in flash via mpremote.
#   Need NTP time after boot                  -> ntptime.settime() once after WiFi up.
#   Many devices behind one MQTT topic        -> client_id includes machine.unique_id().hex().

# Anti-pattern:
#   for _ in range(N):
#       requests.post(...)
#       time.sleep(60)
# Sleeping while WiFi is up wastes ~80 mA continuously - kills batteries.
# Either keep MQTT alive (small constant draw) OR deepsleep between
# publishes (huge savings).
```

## Decision Rule

```text
Always-on, mains powered                 -> persistent MQTT (junior tier).
Battery, occasional updates              -> deepsleep cycle (senior tier).
Need to reach 8+ months on AAA batteries -> deepsleep + LoRa instead of WiFi.
Need OTA firmware updates                 -> esp32.Partition + ota_set_boot_partition.
Need TLS                                  -> standard MicroPython firmware on ESP32 has SSL;
                                             certs go in flash via mpremote.
Need NTP time after boot                  -> ntptime.settime() once after WiFi up.
Many devices behind one MQTT topic        -> client_id includes machine.unique_id().hex().
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for _ in range(N):
>       requests.post(...)
>       time.sleep(60)
> Sleeping while WiFi is up wastes ~80 mA continuously - kills batteries.
> Either keep MQTT alive (small constant draw) OR deepsleep between
> publishes (huge savings).

## Tips

- WiFi connect: `WLAN(STA_IF).active(True).connect(ssid, pwd)`, then poll `isconnected()` with a short sleep.
- Always `r.close()` after `urequests.get/post` — sockets leak otherwise and you'll OOM after ~10 requests.
- For periodic publishes, MQTT-keepalive is ~5× cheaper power than HTTPS-per-publish.
- `machine.deepsleep(ms)` brings ESP32 to ~10 µA — the chip reboots on wake, so persist state in `RTC().memory()`.
- For TLS, your firmware needs SSL compiled in — the standard MicroPython ESP32 build does, but minimal builds may not.

## Common Mistake

> [!warning] Polling-loop sleep with WiFi active for low-power use cases — WiFi at idle still draws ~80 mA. Either keep MQTT for steady ops or deepsleep between events.

## See Also

- [[Sections/embedded-micropython/platforms/micropython-rp2040-pico|rp2 / Pico — second core, PIO, asyncio (MicroPython / Embedded)]]
- [[Sections/embedded-micropython/platforms/_Index|MicroPython / Embedded → Platforms — ESP32, RP2040 (Pico), CircuitPython]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]

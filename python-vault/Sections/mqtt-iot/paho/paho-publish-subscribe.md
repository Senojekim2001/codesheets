---
type: "entry"
domain: "python"
file: "mqtt-iot"
section: "paho"
id: "paho-publish-subscribe"
title: "paho.Client / connect / publish / subscribe / loop"
category: "paho"
subtitle: "mqtt.Client(client_id=, clean_session=, protocol=mqtt.MQTTv5), on_connect / on_message / on_disconnect callbacks, loop_start (thread) vs loop_forever (block) vs loop() (manual), publish (qos=0/1/2, retain=), subscribe (single topic or list of (topic, qos)), MQTTMessage (.topic, .payload, .qos, .retain), reason_code on connect"
signature_short: "c = mqtt.Client(client_id=\"dev1\"); c.on_message = on_msg; c.connect(\"broker\", 1883); c.subscribe(\"sensors/#\", qos=1); c.loop_start(); c.publish(\"sensors/temp\", b\"22.5\", qos=1, retain=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "paho.Client / connect / publish / subscribe / loop"
  - "paho-publish-subscribe"
tags:
  - "python"
  - "python/mqtt-iot"
  - "python/mqtt-iot/paho"
  - "category/paho"
  - "tier/tiered"
---

# paho.Client / connect / publish / subscribe / loop

> mqtt.Client(client_id=, clean_session=, protocol=mqtt.MQTTv5), on_connect / on_message / on_disconnect callbacks, loop_start (thread) vs loop_forever (block) vs loop() (manual), publish (qos=0/1/2, retain=), subscribe (single topic or list of (topic, qos)), MQTTMessage (.topic, .payload, .qos, .retain), reason_code on connect

## Overview

paho is the reference MQTT client. The threaded model: `loop_start()` spins a background reader/writer thread; callbacks fire on it. `loop_forever()` blocks the calling thread instead — fine for single-purpose scripts. **Always set a unique `client_id`** (broker disconnects duplicates). Default `clean_session=True` (or `clean_start=True` in MQTTv5) means subscriptions are lost on reconnect — set it to `False` for persistent sessions. Three depths solve the SAME task — subscribe to `sensors/#` and publish a temperature reading every 5 s — at depths: minimal callback + loop_start + sleep loop → reconnect handler with exponential backoff + on_connect re-subscribe → MQTTv5 client with persistent session, properties, will-message, TLS.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Subscribe to sensors/#; publish a fake temp every 5 s.
- **Junior** — SAME — sub + periodic publish — with stable client_id, reconnect handling, and QoS 1 (at-least-once).
- **Senior** — SAME — telemetry publisher — production: persistent session (subscriptions survive reconnect), MQTTv5, last-will, retained "online" status, TLS.

## Signature

```python
c = mqtt.Client(client_id="dev1"); c.on_message = on_msg; c.connect("broker", 1883); c.subscribe("sensors/#", qos=1); c.loop_start(); c.publish("sensors/temp", b"22.5", qos=1, retain=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Subscribe to sensors/#; publish a fake temp every 5 s.
# APPROACH  - paho.Client + on_message + loop_start + time.sleep loop.
# STRENGTHS - Smallest pub/sub demo.
# WEAKNESSES- No reconnect handling; client_id auto-generated (collisions);
#             QoS 0 (fire and forget; messages can be lost).
import paho.mqtt.client as mqtt
import time

def on_connect(client, userdata, flags, rc, properties=None):
    print("connected, rc =", rc)
    client.subscribe("sensors/#")                      # QoS 0 by default

def on_message(client, userdata, msg):
    print(f"<- {msg.topic} ({len(msg.payload)} B): {msg.payload!r}")

c = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
c.on_connect = on_connect
c.on_message = on_message

c.connect("broker.hivemq.com", 1883, keepalive=60)
c.loop_start()                                         # background thread

try:
    while True:
        c.publish("sensors/lab1/temp", b"22.5", qos=0)
        time.sleep(5)
except KeyboardInterrupt:
    c.loop_stop(); c.disconnect()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sub + periodic publish — with stable client_id,
#             reconnect handling, and QoS 1 (at-least-once).
# APPROACH  - Set client_id; reconnect_delay_set; resubscribe in on_connect
#             (subscriptions are lost on every reconnect with default
#             clean_session=True).
# STRENGTHS - Survives broker restarts and short network drops.
# WEAKNESSES- QoS 1 = at-least-once -> handlers must be idempotent (a
#             message can arrive twice).
import paho.mqtt.client as mqtt
import time, uuid

CLIENT_ID = f"lab1-publisher-{uuid.uuid4().hex[:6]}"


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("connected")
        # Resubscribe EVERY time we reconnect.
        client.subscribe([("sensors/#", 1), ("control/+/cmd", 1)])
    else:
        print(f"connect failed rc={rc}")


def on_message(client, userdata, msg):
    print(f"<- {msg.topic} qos={msg.qos} retain={msg.retain}: {msg.payload!r}")


def on_disconnect(client, userdata, rc, properties=None, reason=None):
    print("disconnected rc =", rc)


c = mqtt.Client(client_id=CLIENT_ID, clean_session=True,
                callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
c.on_connect    = on_connect
c.on_message    = on_message
c.on_disconnect = on_disconnect

# Auto-reconnect with exponential backoff (paho built-in).
c.reconnect_delay_set(min_delay=1, max_delay=60)

c.connect_async("broker.hivemq.com", 1883, keepalive=60)
c.loop_start()

try:
    while True:
        info = c.publish("sensors/lab1/temp", b"22.5", qos=1, retain=False)
        info.wait_for_publish(timeout=2)               # block until broker ack
        time.sleep(5)
except KeyboardInterrupt:
    c.loop_stop(); c.disconnect()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — telemetry publisher — production: persistent session
#             (subscriptions survive reconnect), MQTTv5, last-will,
#             retained "online" status, TLS.
# APPROACH  - protocol=MQTTv5 + clean_start=False; will_set; tls_set;
#             retained status published on connect, will fires on crash.
# STRENGTHS - Survives broker restarts; downstream sees online/offline;
#             encrypted in flight; per-message properties (MQTTv5).
# WEAKNESSES- Persistent sessions can pile up undelivered messages on the
#             broker if the device is offline for hours - choose carefully.
from __future__ import annotations
import paho.mqtt.client as mqtt
from paho.mqtt.properties import Properties
from paho.mqtt.packettypes import PacketTypes
import time, json, ssl, uuid


CLIENT_ID  = f"lab1-{uuid.uuid4().hex[:6]}"
HOST, PORT = "broker.example.com", 8883                 # 8883 = MQTT over TLS

STATUS_TOPIC = f"devices/{CLIENT_ID}/status"
TELEMETRY    = f"devices/{CLIENT_ID}/telemetry"


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("connected, session_present =", flags.session_present if hasattr(flags, 'session_present') else flags.get("session present"))
        # Mark online (retained so subscribers see it without a publish race).
        client.publish(STATUS_TOPIC, json.dumps({"online": True}).encode(),
                       qos=1, retain=True)
        # Resubscribe ONLY if we don't have a session.
        client.subscribe(f"control/{CLIENT_ID}/+", qos=1)
    else:
        print("connect failed:", rc)


def on_message(client, userdata, msg):
    print(f"cmd <- {msg.topic}: {msg.payload!r}")


def make_client() -> mqtt.Client:
    c = mqtt.Client(
        client_id=CLIENT_ID,
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        protocol=mqtt.MQTTv5,
    )
    c.on_connect    = on_connect
    c.on_message    = on_message
    c.reconnect_delay_set(min_delay=1, max_delay=120)

    # Last-will: broker publishes this if the client drops without a clean
    # disconnect (network loss, kill -9, etc.).
    c.will_set(STATUS_TOPIC,
               payload=json.dumps({"online": False}).encode(),
               qos=1, retain=True)

    # TLS - load CA + client cert.
    c.tls_set(
        ca_certs="/etc/ssl/certs/ca-certificates.crt",
        # certfile="/etc/mqtt/dev-cert.pem",
        # keyfile="/etc/mqtt/dev-key.pem",
        tls_version=ssl.PROTOCOL_TLSv1_2,
    )
    # c.tls_insecure_set(True)                          # only for self-signed dev brokers

    # Optional credentials.
    # c.username_pw_set("dev-user", "secret")

    return c


def publish_telemetry(c: mqtt.Client, payload: dict) -> None:
    # MQTTv5 properties: e.g. message expiry to drop stale telemetry.
    props = Properties(PacketTypes.PUBLISH)
    props.MessageExpiryInterval = 60                   # seconds
    info = c.publish(
        TELEMETRY, json.dumps(payload).encode(),
        qos=1, retain=False, properties=props,
    )
    info.wait_for_publish(timeout=2)


def main() -> None:
    c = make_client()
    # MQTTv5 persistent session: clean_start=False AND session_expiry > 0.
    connect_props = Properties(PacketTypes.CONNECT)
    connect_props.SessionExpiryInterval = 24 * 3600
    c.connect(HOST, PORT, keepalive=30,
              clean_start=False, properties=connect_props)
    c.loop_start()

    try:
        while True:
            publish_telemetry(c, {"temp": 22.5, "humidity": 41.0,
                                  "ts": int(time.time())})
            time.sleep(5)
    finally:
        # Clean disconnect = the will message will NOT fire (we said "online: False"
        # ourselves through the same retained topic).
        c.publish(STATUS_TOPIC, json.dumps({"online": False}).encode(),
                  qos=1, retain=True).wait_for_publish(2)
        c.loop_stop(); c.disconnect()


if __name__ == "__main__":
    main()

# Decision rule:
#   Quick prototype                          -> default Client + loop_start.
#   Need reconnect resilience                 -> reconnect_delay_set + resubscribe in on_connect.
#   Need at-least-once delivery               -> qos=1; handlers must be idempotent.
#   Need exactly-once delivery                -> qos=2 (slow; rarely needed in IoT).
#   Need broker to remember subscriptions     -> clean_session=False (MQTTv3) or
#                                                clean_start=False + SessionExpiryInterval (v5).
#   Need device "is online" status            -> last-will + retained STATUS_TOPIC.
#   Need encrypted transport                  -> tls_set + port 8883.
#   Multi-tenant brokers                      -> ACLs + per-device certs (mutual TLS).
#   Need to detect offline downstream         -> retained status + monitor it.
#   Want the subscriber to immediately see the latest reading -> retain=True on publish.

# Anti-pattern:
#   c = mqtt.Client()                       # auto-generated client_id
#   c.connect(...); c.disconnect(); c.connect(...)
# Each connect picks a new random client_id, so the broker thinks each
# is a different device. Subscriptions / sessions don't persist.
# ALWAYS set a stable client_id (e.g. mac address + role).
```

## Decision Rule

```text
Quick prototype                          -> default Client + loop_start.
Need reconnect resilience                 -> reconnect_delay_set + resubscribe in on_connect.
Need at-least-once delivery               -> qos=1; handlers must be idempotent.
Need exactly-once delivery                -> qos=2 (slow; rarely needed in IoT).
Need broker to remember subscriptions     -> clean_session=False (MQTTv3) or
                                             clean_start=False + SessionExpiryInterval (v5).
Need device "is online" status            -> last-will + retained STATUS_TOPIC.
Need encrypted transport                  -> tls_set + port 8883.
Multi-tenant brokers                      -> ACLs + per-device certs (mutual TLS).
Need to detect offline downstream         -> retained status + monitor it.
Want the subscriber to immediately see the latest reading -> retain=True on publish.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   c = mqtt.Client()                       # auto-generated client_id
>   c.connect(...); c.disconnect(); c.connect(...)
> Each connect picks a new random client_id, so the broker thinks each
> is a different device. Subscriptions / sessions don't persist.
> ALWAYS set a stable client_id (e.g. mac address + role).

## Tips

- Always pass a stable `client_id` — broker disconnects duplicates and per-device sessions are keyed on it.
- Resubscribe inside `on_connect` — by default, subscriptions are lost on reconnect (`clean_session=True`).
- QoS 0 = at-most-once (fire-and-forget); QoS 1 = at-least-once (handlers must be idempotent); QoS 2 = exactly-once (slow, rarely needed).
- Use `client.will_set(topic, payload, qos, retain=True)` so subscribers see when the device goes offline ungracefully.
- For MQTTv5 + persistent sessions, `clean_start=False` AND set `SessionExpiryInterval` properties on `CONNECT`.

## Common Mistake

> [!warning] Letting paho auto-generate `client_id`. Each reconnect looks like a new device — sessions, subscriptions, and last-will state never persist. Always set a stable `client_id`.

## See Also

- [[Sections/mqtt-iot/paho/paho-retained-lwt-topic-design|retain / LWT / topic structure — patterns that scale (MQTT / IoT)]]
- [[Sections/mqtt-iot/paho/_Index|MQTT / IoT → paho-mqtt — the workhorse client]]
- [[Sections/mqtt-iot/_Index|MQTT / IoT index]]
- [[_Index|Vault index]]

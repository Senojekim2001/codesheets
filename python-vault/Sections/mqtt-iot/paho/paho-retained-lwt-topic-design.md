---
type: "entry"
domain: "python"
file: "mqtt-iot"
section: "paho"
id: "paho-retained-lwt-topic-design"
title: "retain / LWT / topic structure — patterns that scale"
category: "paho"
subtitle: "retain=True publishes the LAST message persistently; new subscribers get it immediately, will_set(topic, payload, qos, retain) declared at CONNECT time, topic wildcards (+ = one level, # = rest, only at end), topic naming conventions (org/site/device/measurement), avoid leading \"/\", avoid encoding values in topic names"
signature_short: "c.publish(\"status/dev1\", b\"online\", retain=True); c.will_set(\"status/dev1\", b\"offline\", qos=1, retain=True); c.subscribe(\"sensors/+/temp\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "retain / LWT / topic structure — patterns that scale"
  - "paho-retained-lwt-topic-design"
tags:
  - "python"
  - "python/mqtt-iot"
  - "python/mqtt-iot/paho"
  - "category/paho"
  - "tier/tiered"
---

# retain / LWT / topic structure — patterns that scale

> retain=True publishes the LAST message persistently; new subscribers get it immediately, will_set(topic, payload, qos, retain) declared at CONNECT time, topic wildcards (+ = one level, # = rest, only at end), topic naming conventions (org/site/device/measurement), avoid leading "/", avoid encoding values in topic names

## Overview

Retained messages: a *single* retained message per topic — `retain=True` overwrites; publishing an empty payload with `retain=True` deletes it. New subscribers get the retained message immediately on subscribe. LWT: the broker publishes a message on your behalf when it detects you dropped (no PINGRESP within keepalive × 1.5). Topic design: hierarchical paths (`org/site/device/measurement`), wildcards `+` (single level, anywhere) and `#` (multi-level, only at end). Three depths solve the SAME task — show the device's online/offline state to subscribers without polling — at depths: poll-based "is my device alive" → retained status + LWT (the right way) → multi-tenant topic tree with retained presence and per-device shared subscriptions for load balancing.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show subscribers whether device dev1 is online.
- **Junior** — SAME — device online/offline visibility — using RETAINED status + LWT (broker publishes "offline" on crash).
- **Senior** — SAME — fleet visibility — production: hierarchical topic tree (org/site/device), retained presence + LWT per device, shared subscriptions on the consumer side for horizontal scale.

## Signature

```python
c.publish("status/dev1", b"online", retain=True); c.will_set("status/dev1", b"offline", qos=1, retain=True); c.subscribe("sensors/+/temp")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show subscribers whether device dev1 is online.
# APPROACH  - Publish "online" / "offline" yourself; subscribers poll.
# STRENGTHS - No special MQTT features.
# WEAKNESSES- Subscribers that connect AFTER your "online" message have
#             no idea you exist. If you crash, no "offline" is sent.
import paho.mqtt.client as mqtt
import time, atexit

c = mqtt.Client("dev1", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
c.connect("broker.hivemq.com", 1883)
c.loop_start()

c.publish("status/dev1", b"online")                   # not retained!

def shutdown():
    c.publish("status/dev1", b"offline").wait_for_publish(2)
    c.disconnect()

atexit.register(shutdown)

while True:
    time.sleep(60)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — device online/offline visibility — using RETAINED
#             status + LWT (broker publishes "offline" on crash).
# APPROACH  - retain=True publishes; will_set BEFORE connect.
# STRENGTHS - Subscribers see status immediately; broker handles crash case.
# WEAKNESSES- Single device; no topic-tree discipline.
import paho.mqtt.client as mqtt
import time

CLIENT = "dev1"
STATUS = f"status/{CLIENT}"

c = mqtt.Client(CLIENT, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

# LWT MUST be set BEFORE connect.
c.will_set(STATUS, b"offline", qos=1, retain=True)

c.connect("broker.hivemq.com", 1883, keepalive=30)
c.loop_start()

# Mark online with retain=True so any future subscriber sees it instantly.
c.publish(STATUS, b"online", qos=1, retain=True).wait_for_publish(2)

try:
    while True:
        time.sleep(60)
finally:
    # Clean disconnect: publish "offline" ourselves so the LWT doesn't.
    c.publish(STATUS, b"offline", qos=1, retain=True).wait_for_publish(2)
    c.loop_stop(); c.disconnect()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — fleet visibility — production: hierarchical topic tree
#             (org/site/device), retained presence + LWT per device, shared
#             subscriptions on the consumer side for horizontal scale.
# APPROACH  - acme/site-a/dev1/{status,telemetry}; consumers use $share/g1/.
# STRENGTHS - One subscription pattern matches every device; consumers
#             load-balance via shared subscriptions (MQTTv5 / EMQX / Mosquitto 2.x).
# WEAKNESSES- Topic naming is forever - migrating breaks everyone.
from __future__ import annotations
import paho.mqtt.client as mqtt
import time, json, uuid


ORG  = "acme"
SITE = "site-a"


class FleetDevice:
    """One device's MQTT presence + telemetry publisher."""

    def __init__(self, device_id: str, host: str, port: int = 1883):
        self.device_id = device_id
        self.host, self.port = host, port

        self.STATUS    = f"{ORG}/{SITE}/{device_id}/status"
        self.TELEMETRY = f"{ORG}/{SITE}/{device_id}/telemetry"
        self.CONTROL   = f"{ORG}/{SITE}/{device_id}/control"

        self.c = mqtt.Client(client_id=device_id, clean_session=False,
                             callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        self.c.on_connect = self._on_connect
        self.c.on_message = self._on_message

        # LWT BEFORE connect.
        self.c.will_set(
            self.STATUS,
            json.dumps({"online": False, "ts": int(time.time())}).encode(),
            qos=1, retain=True,
        )
        self.c.reconnect_delay_set(min_delay=1, max_delay=120)

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc != 0:
            print("connect failed:", rc); return
        # Mark online (retained for new subscribers).
        client.publish(
            self.STATUS,
            json.dumps({"online": True, "ts": int(time.time())}).encode(),
            qos=1, retain=True,
        )
        client.subscribe(self.CONTROL, qos=1)

    def _on_message(self, client, userdata, msg):
        print(f"control <- {msg.topic}: {msg.payload!r}")

    def start(self):
        self.c.connect(self.host, self.port, keepalive=30)
        self.c.loop_start()

    def publish_telemetry(self, data: dict):
        self.c.publish(
            self.TELEMETRY, json.dumps(data).encode(),
            qos=1, retain=False,
        )

    def stop(self):
        self.c.publish(
            self.STATUS,
            json.dumps({"online": False, "ts": int(time.time())}).encode(),
            qos=1, retain=True,
        ).wait_for_publish(2)
        self.c.loop_stop(); self.c.disconnect()


# --- Consumer side: shared subscription for horizontal scale ---
def consumer():
    c = mqtt.Client(client_id=f"consumer-{uuid.uuid4().hex[:6]}",
                    callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

    def on_connect(client, userdata, flags, rc, properties=None):
        # $share/<group>/<topic> = MQTT 5 shared subscription.
        # Multiple consumers in the same group split the messages between them.
        client.subscribe(f"$share/telemetry/{ORG}/+/+/telemetry", qos=1)
        client.subscribe(f"{ORG}/+/+/status", qos=1)               # presence: every consumer sees

    def on_message(client, userdata, msg):
        # msg.topic example: 'acme/site-a/dev1/telemetry'
        parts = msg.topic.split("/")
        if parts[-1] == "telemetry":
            print(f"telem from {parts[2]}: {msg.payload[:60]!r}")
        elif parts[-1] == "status":
            print(f"status of {parts[2]}: {msg.payload!r} retain={msg.retain}")

    c.on_connect = on_connect
    c.on_message = on_message
    c.connect("broker.example.com", 1883, keepalive=60)
    c.loop_forever()


# --- Use it ---
# d = FleetDevice("dev1", "broker.example.com")
# d.start()
# while True: d.publish_telemetry({"t": 22.7, "h": 39}); time.sleep(5)

# Decision rule:
#   Want subscribers to see "current value" on subscribe   -> publish with retain=True.
#   Want broker to announce a crash                         -> client.will_set(...).
#   Want presence (online/offline) for a fleet              -> retained STATUS topic + LWT
#                                                              (above).
#   Multi-tenant                                             -> include org / tenant in
#                                                              the topic prefix.
#   Need to load-balance consumers                           -> $share/group/topic
#                                                              (MQTT 5 shared subscriptions).
#   Need fan-out                                              -> standard subscribe (every
#                                                              subscriber gets every msg).
#   Need to delete a retained message                         -> publish empty payload with
#                                                              retain=True to that topic.
#   Topic includes a value that changes                       -> NO; values go in the payload,
#                                                              not the topic.

# Anti-pattern:
#   c.subscribe("sensors/#/temp")          # # only allowed at the END
# # is multi-level wildcard but ONLY at the tail of the topic. For
# "any device, temp metric" use 'sensors/+/temp' (single-level wildcard).
```

## Decision Rule

```text
Want subscribers to see "current value" on subscribe   -> publish with retain=True.
Want broker to announce a crash                         -> client.will_set(...).
Want presence (online/offline) for a fleet              -> retained STATUS topic + LWT
                                                           (above).
Multi-tenant                                             -> include org / tenant in
                                                           the topic prefix.
Need to load-balance consumers                           -> $share/group/topic
                                                           (MQTT 5 shared subscriptions).
Need fan-out                                              -> standard subscribe (every
                                                           subscriber gets every msg).
Need to delete a retained message                         -> publish empty payload with
                                                           retain=True to that topic.
Topic includes a value that changes                       -> NO; values go in the payload,
                                                           not the topic.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   c.subscribe("sensors/#/temp")          # # only allowed at the END
> # is multi-level wildcard but ONLY at the tail of the topic. For
> "any device, temp metric" use 'sensors/+/temp' (single-level wildcard).

## Tips

- `retain=True` makes the broker keep ONE message per topic; new subscribers receive it immediately.
- `will_set(...)` MUST be called before `connect()` — the broker stores the will at CONNECT time.
- Topic wildcards: `+` matches **one** level; `#` matches the rest and **only** at the tail.
- Topic structure: hierarchical, slash-separated, never start with `/`. Don't encode values in topic names — use the payload.
- For consumer scale-out, MQTT 5 shared subscriptions (`$share/<group>/<topic>`) round-robin between subscribers in the group.

## Common Mistake

> [!warning] Putting `#` mid-topic (`sensors/#/temp`). `#` is allowed **only** at the end. For "any device, temp metric" use `sensors/+/temp`.

## See Also

- [[Sections/mqtt-iot/paho/paho-publish-subscribe|paho.Client / connect / publish / subscribe / loop (MQTT / IoT)]]
- [[Sections/mqtt-iot/paho/_Index|MQTT / IoT → paho-mqtt — the workhorse client]]
- [[Sections/mqtt-iot/_Index|MQTT / IoT index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "mqtt-iot"
section: "aiomqtt"
id: "aiomqtt-async-client"
title: "aiomqtt.Client — async/await around paho"
category: "aiomqtt"
subtitle: "aiomqtt.Client (async context manager), await client.subscribe / publish, async for message in client.messages, client.will, identifier= for client_id, asyncio.TaskGroup for concurrent publish + consume, MqttError exceptions for reconnect handling"
signature_short: "async with aiomqtt.Client(\"broker\") as c: await c.subscribe(\"sensors/#\"); async for m in c.messages: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "aiomqtt.Client — async/await around paho"
  - "aiomqtt-async-client"
tags:
  - "python"
  - "python/mqtt-iot"
  - "python/mqtt-iot/aiomqtt"
  - "category/aiomqtt"
  - "tier/tiered"
---

# aiomqtt.Client — async/await around paho

> aiomqtt.Client (async context manager), await client.subscribe / publish, async for message in client.messages, client.will, identifier= for client_id, asyncio.TaskGroup for concurrent publish + consume, MqttError exceptions for reconnect handling

## Overview

`aiomqtt` is the modern async MQTT client. Connection is via `async with`; subscribe with `await client.subscribe(topic, qos=)`; iterate inbound messages with `async for message in client.messages`. To publish + consume concurrently, use `asyncio.TaskGroup` (Python 3.11+) so a failure in either task cancels the other. Reconnect is on you — wrap the connect/iterate cycle in a `try/except aiomqtt.MqttError` with backoff. Three depths solve the SAME task — async telemetry pipeline that consumes commands and publishes responses — at depths: bare client + sequential consume → TaskGroup with concurrent publish + consume → reconnect-loop wrapper with TLS, will-message, and bounded backoff.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Subscribe to control/+; print every message that arrives.
- **Junior** — SAME — control consumer — but ALSO publish telemetry every 5s from a concurrent task.
- **Senior** — SAME — async telemetry + control — production: reconnect loop with exponential backoff, retained presence + LWT, TLS.

## Signature

```python
async with aiomqtt.Client("broker") as c: await c.subscribe("sensors/#"); async for m in c.messages: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Subscribe to control/+; print every message that arrives.
# APPROACH  - aiomqtt.Client + async for.
# STRENGTHS - Six lines.
# WEAKNESSES- No publish; if the broker drops, the program ends.
import asyncio
import aiomqtt


async def main():
    async with aiomqtt.Client("broker.hivemq.com") as client:
        await client.subscribe("control/+")
        async for message in client.messages:
            print(f"{message.topic}: {message.payload!r}")


asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — control consumer — but ALSO publish telemetry every 5s
#             from a concurrent task.
# APPROACH  - asyncio.TaskGroup with consume + publish coroutines.
# STRENGTHS - True concurrency (consume and publish at once); structured
#             error propagation - if either task fails, the other is
#             cancelled.
# WEAKNESSES- Still no reconnect; one network blip ends the program.
import asyncio
import aiomqtt


async def consume(client: aiomqtt.Client):
    await client.subscribe("control/+", qos=1)
    async for message in client.messages:
        print(f"<- {message.topic}: {message.payload!r}")


async def publish(client: aiomqtt.Client):
    n = 0
    while True:
        await client.publish("sensors/lab1/temp", f"22.{n}".encode(), qos=1)
        n = (n + 1) % 10
        await asyncio.sleep(5)


async def main():
    async with aiomqtt.Client(
        hostname="broker.hivemq.com",
        identifier="lab1-async",
        keepalive=30,
    ) as client:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(consume(client))
            tg.create_task(publish(client))


asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — async telemetry + control — production: reconnect loop
#             with exponential backoff, retained presence + LWT, TLS.
# APPROACH  - while True wrapping connect-and-stream, catching MqttError;
#             aiomqtt.Will for last-will; aiomqtt.TLSParameters for TLS.
# STRENGTHS - Survives broker restarts; presence visible to subscribers;
#             encrypted in transit.
# WEAKNESSES- Reconnect resets in-flight QoS 1 inflight queue - design
#             handlers idempotent.
from __future__ import annotations
import asyncio
import json
import ssl
import time
import aiomqtt


CLIENT_ID = "lab1-async"
STATUS    = f"devices/{CLIENT_ID}/status"
TELEMETRY = f"devices/{CLIENT_ID}/telemetry"
CONTROL   = f"control/{CLIENT_ID}/+"


will = aiomqtt.Will(
    topic=STATUS,
    payload=json.dumps({"online": False, "ts": int(time.time())}).encode(),
    qos=1, retain=True,
)


async def consume(client: aiomqtt.Client):
    await client.subscribe(CONTROL, qos=1)
    async for message in client.messages:
        print(f"control <- {message.topic}: {message.payload!r}")


async def publish_loop(client: aiomqtt.Client):
    # Mark online (retained).
    await client.publish(
        STATUS,
        json.dumps({"online": True, "ts": int(time.time())}).encode(),
        qos=1, retain=True,
    )
    while True:
        payload = json.dumps({"t": 22.7, "h": 39.4, "ts": int(time.time())}).encode()
        await client.publish(TELEMETRY, payload, qos=1)
        await asyncio.sleep(5)


async def session():
    tls = aiomqtt.TLSParameters(
        ca_certs="/etc/ssl/certs/ca-certificates.crt",
        tls_version=ssl.PROTOCOL_TLSv1_2,
    )
    async with aiomqtt.Client(
        hostname="broker.example.com",
        port=8883,
        identifier=CLIENT_ID,
        keepalive=30,
        will=will,
        tls_params=tls,
        # username="dev", password="secret",
    ) as client:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(consume(client))
            tg.create_task(publish_loop(client))


async def main():
    backoff = 1
    while True:
        try:
            await session()
            backoff = 1                                # reset on success
        except aiomqtt.MqttError as e:
            print(f"mqtt error: {e!r}; reconnecting in {backoff}s")
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 60)
        except* asyncio.CancelledError:
            raise


asyncio.run(main())

# Decision rule:
#   App is asyncio (FastAPI / websockets / asyncpg)   -> aiomqtt.
#   App is sync                                        -> paho directly.
#   Need cross-thread bridging                         -> paho.loop_start in thread; queue
#                                                         to async via run_in_executor.
#   Need to consume + publish concurrently              -> asyncio.TaskGroup (Python 3.11+).
#   Need reconnect resilience                           -> outer while True + MqttError catch
#                                                         with exponential backoff (above).
#   Need TLS                                            -> aiomqtt.TLSParameters.
#   Need MQTT 5 properties                               -> aiomqtt 2.x supports MQTT 5
#                                                         via paho's MQTTv5 protocol.
#   Need shared subscriptions ($share)                   -> just subscribe to the
#                                                         "$share/<group>/<topic>" string.

# Anti-pattern:
#   async for message in client.messages:
#       await slow_db_write(message)        # blocks the iteration
# A slow handler causes back-pressure on the broker (eventually drops you).
# Either fan messages out to a worker pool (asyncio.Queue + worker tasks)
# or process in a TaskGroup so one slow message doesn't block the next.
```

## Decision Rule

```text
App is asyncio (FastAPI / websockets / asyncpg)   -> aiomqtt.
App is sync                                        -> paho directly.
Need cross-thread bridging                         -> paho.loop_start in thread; queue
                                                      to async via run_in_executor.
Need to consume + publish concurrently              -> asyncio.TaskGroup (Python 3.11+).
Need reconnect resilience                           -> outer while True + MqttError catch
                                                      with exponential backoff (above).
Need TLS                                            -> aiomqtt.TLSParameters.
Need MQTT 5 properties                               -> aiomqtt 2.x supports MQTT 5
                                                      via paho's MQTTv5 protocol.
Need shared subscriptions ($share)                   -> just subscribe to the
                                                      "$share/<group>/<topic>" string.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   async for message in client.messages:
>       await slow_db_write(message)        # blocks the iteration
> A slow handler causes back-pressure on the broker (eventually drops you).
> Either fan messages out to a worker pool (asyncio.Queue + worker tasks)
> or process in a TaskGroup so one slow message doesn't block the next.

## Tips

- `aiomqtt.Client` is an async context manager — `async with Client(host) as c:` connects/disconnects.
- Iterate inbound messages with `async for message in client.messages` — handles flow control internally.
- For concurrent publish + consume, use `asyncio.TaskGroup` (Python 3.11+) — structured cancellation if either side fails.
- `aiomqtt.MqttError` is the catch-all for connection failures — wrap your session in a `while True` with backoff.
- For shared subscriptions, just subscribe to `"$share/<group>/<topic>"` — aiomqtt passes the string straight through.

## Common Mistake

> [!warning] Doing slow synchronous work inside `async for message in client.messages` — blocks the iteration, causes broker back-pressure, eventual disconnect. Fan messages to a worker pool via `asyncio.Queue`.

## See Also

- [[Sections/mqtt-iot/aiomqtt/_Index|MQTT / IoT → aiomqtt — async client]]
- [[Sections/mqtt-iot/_Index|MQTT / IoT index]]
- [[_Index|Vault index]]

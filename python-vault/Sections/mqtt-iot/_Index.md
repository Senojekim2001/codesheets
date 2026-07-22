---
type: "file-index"
domain: "python"
file: "mqtt-iot"
title: "MQTT / IoT"
tags:
  - "python"
  - "python/mqtt-iot"
  - "index"
---

# MQTT / IoT

> 4 entries across 3 sections.

## paho-mqtt — the workhorse client · 2

- [[Sections/mqtt-iot/paho/paho-publish-subscribe|paho.Client / connect / publish / subscribe / loop]] — `mqtt.Client(client_id=...)` is the paho client. Set `on_connect` / `on_message` callbacks, `connect(host, port)`, then either `loop_start()` (background thread) or `loop_forever()` (blocking). Publish with `client.publish(topic, payload, qos=, retain=)`; subscribe with `client.subscribe(topic, qos=)`.
- [[Sections/mqtt-iot/paho/paho-retained-lwt-topic-design|retain / LWT / topic structure — patterns that scale]] — Three under-used MQTT features that change everything: **retained messages** (broker stores the last on the topic; new subscribers get it immediately), **last-will-and-testament** (LWT — broker publishes on your behalf when you drop ungracefully), and **topic-tree design** (hierarchical, no slashes-as-data; wildcards `+` and `#` only work this way).

## aiomqtt — async client · 1

- [[Sections/mqtt-iot/aiomqtt/aiomqtt-async-client|aiomqtt.Client — async/await around paho]] — `aiomqtt` (formerly asyncio-mqtt) wraps paho behind a clean asyncio API: `async with Client(host) as client` connects, `await client.publish(...)`, `async for message in client.messages` consumes. Best when your app is already asyncio (FastAPI, websockets, async DB drivers).

## When to reach for which messaging tool · 1

- [[Sections/mqtt-iot/patterns/mqtt-vs-kafka-amqp|MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol]] — MQTT is the right protocol for **fleet IoT**: small clients, lossy networks, presence semantics, low overhead. Kafka for **high-volume event streams** with replay. AMQP (RabbitMQ) for **enterprise message routing**. HTTP webhooks for **simple cloud-to-cloud** notifications. Pick by who the producers are, what guarantees you need, and how big the messages are.

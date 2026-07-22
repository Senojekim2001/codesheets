---
type: "entry"
domain: "python"
file: "mqtt-iot"
section: "patterns"
id: "mqtt-vs-kafka-amqp"
title: "MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol"
category: "patterns"
subtitle: "MQTT (small payloads, mass clients, retained, LWT, QoS 0/1/2) vs Kafka (high-throughput, partitioned log, replay, larger ops cost) vs AMQP/RabbitMQ (rich routing: exchanges + queues + bindings) vs HTTP webhooks (simple, request-response, no broker), MQTT broker choices: Mosquitto (simple), EMQX (cluster + ACL), HiveMQ (commercial), AWS IoT Core (managed), Azure IoT Hub"
signature_short: "# MQTT: paho/aiomqtt -> broker (Mosquitto / EMQX)\\n# Kafka: confluent-kafka -> Kafka cluster\\n# AMQP: aio-pika -> RabbitMQ\\n# HTTP: httpx.post(webhook_url, json=...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol"
  - "mqtt-vs-kafka-amqp"
tags:
  - "python"
  - "python/mqtt-iot"
  - "python/mqtt-iot/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol

> MQTT (small payloads, mass clients, retained, LWT, QoS 0/1/2) vs Kafka (high-throughput, partitioned log, replay, larger ops cost) vs AMQP/RabbitMQ (rich routing: exchanges + queues + bindings) vs HTTP webhooks (simple, request-response, no broker), MQTT broker choices: Mosquitto (simple), EMQX (cluster + ACL), HiveMQ (commercial), AWS IoT Core (managed), Azure IoT Hub

## Overview

Four protocols with different sweet spots. **MQTT**: small messages (~bytes-KB), lots of clients (millions), unreliable networks, presence semantics (LWT + retained), low broker overhead — built for IoT. **Kafka**: huge throughput (millions msg/s), partitioned log with replay, larger ops footprint — built for event streaming. **AMQP / RabbitMQ**: complex routing (exchanges + queues + bindings), per-message routing keys, dead-letter queues — enterprise messaging. **HTTP webhooks**: cloud-to-cloud, simplest possible, no broker at all — but no presence, no fan-out without an explicit registry. Three depths solve the SAME task — collect telemetry from 10k devices and stream into analytics — at depths: pure MQTT (right for the device side) → MQTT → Kafka bridge (right for the analytics side) → MQTT (devices) + Kafka (analytics) + cloud IoT broker (managed presence + auth + bridging).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — 10k IoT devices send telemetry; you read it.
- **Junior** — SAME — 10k devices -> analytics — but bridge MQTT into Kafka so analytics get replay + windowed aggregations.
- **Senior** — SAME — fleet IoT to analytics — production: managed broker (AWS IoT Core), MQTT 5 with shared subs, Kafka downstream.

## Signature

```python
# MQTT: paho/aiomqtt -> broker (Mosquitto / EMQX)\n# Kafka: confluent-kafka -> Kafka cluster\n# AMQP: aio-pika -> RabbitMQ\n# HTTP: httpx.post(webhook_url, json=...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - 10k IoT devices send telemetry; you read it.
# APPROACH  - MQTT only.
# STRENGTHS - Right protocol for the device side; one Mosquitto handles
#             10k clients fine on a single VM.
# WEAKNESSES- No replay; consumers must be online to receive (unless
#             persistent session); analytics joins / time-windows are
#             not MQTT's job.
# devices: paho.mqtt.client.Client.publish(...)
# consumer:
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload!r}")

c = mqtt.Client("analytics-consumer",
                callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
c.on_message = on_message
c.connect("broker.example.com", 1883)
c.subscribe("acme/+/+/telemetry")
c.loop_forever()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — 10k devices -> analytics — but bridge MQTT into
#             Kafka so analytics get replay + windowed aggregations.
# APPROACH  - paho subscribes; producer pushes to Kafka.
# STRENGTHS - Devices stay on lightweight MQTT; analytics get Kafka's
#             replay, partitioning, and late-arriving handling.
# WEAKNESSES- Two systems to operate; bridge is a SPOF unless redundant.
import paho.mqtt.client as mqtt
from confluent_kafka import Producer
import json

producer = Producer({"bootstrap.servers": "kafka:9092",
                     "client.id":         "mqtt-bridge"})


def on_message(client, userdata, msg):
    # MQTT topic: acme/site-a/dev1/telemetry
    parts = msg.topic.split("/")
    org, site, dev = parts[0], parts[1], parts[2]
    producer.produce(
        topic=f"telemetry.{org}",                      # Kafka topic
        key=dev.encode(),                              # partition key
        value=msg.payload,                              # bytes through
        headers=[("mqtt.topic", msg.topic.encode()),
                 ("site", site.encode())],
    )
    producer.poll(0)


c = mqtt.Client("mqtt-kafka-bridge",
                callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
c.on_message = on_message
c.connect("broker.example.com", 1883, keepalive=30)
c.subscribe("acme/+/+/telemetry", qos=1)
c.loop_forever()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — fleet IoT to analytics — production: managed broker
#             (AWS IoT Core), MQTT 5 with shared subs, Kafka downstream.
# APPROACH  - Devices auth with X.509 to AWS IoT Core; rule engine bridges
#             MQTT topics to Kinesis / MSK; consumers read Kafka.
# STRENGTHS - Managed scale (millions of devices), per-device cert auth,
#             zero broker ops; Kafka downstream has full replay/windowing.
# WEAKNESSES- Vendor lock; cost scales with messages.
"""
# 1) Device side - paho with mutual TLS:
import paho.mqtt.client as mqtt, ssl, json, time

c = mqtt.Client(client_id="dev-001",
                callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
                protocol=mqtt.MQTTv5)
c.tls_set(
    ca_certs="AmazonRootCA1.pem",
    certfile="dev-001.cert.pem",
    keyfile="dev-001.private.key",
    tls_version=ssl.PROTOCOL_TLSv1_2,
)
c.connect("a3xxx-ats.iot.us-east-1.amazonaws.com", 8883, keepalive=30)
c.loop_start()

while True:
    c.publish("acme/site-a/dev-001/telemetry",
              json.dumps({"t": 22.7}).encode(), qos=1)
    time.sleep(5)
"""

# 2) AWS IoT Rule (Kinesis sink, defined in CDK / Terraform):
#    SQL: SELECT *, topic() AS mqtt_topic FROM 'acme/+/+/telemetry'
#    Action: kinesis put-record into stream "iot-telemetry"
#
# 3) Analytics consumer reads from Kinesis (or MSK / Kafka):
from confluent_kafka import Consumer

c = Consumer({
    "bootstrap.servers": "kafka:9092",
    "group.id":          "telemetry-aggregator",
    "auto.offset.reset": "earliest",
})
c.subscribe(["telemetry.acme"])
while True:
    msg = c.poll(1.0)
    if msg is None or msg.error():
        continue
    print(msg.topic(), msg.key(), msg.value()[:80])

# Decision rule:
#   Mass IoT clients, small messages, lossy net          -> MQTT.
#   High-volume analytics, replay, partitioned log        -> Kafka.
#   Enterprise routing (exchanges, dead letters)          -> AMQP / RabbitMQ.
#   Cloud-to-cloud notification, no broker                 -> HTTP webhook.
#   Need both device fleet + analytics replay              -> MQTT -> Kafka bridge.
#   Need managed everything                                 -> AWS IoT Core / Azure IoT Hub /
#                                                              Google Cloud IoT (sunset 2023 -
#                                                              switch to Pub/Sub).
#   Need on-premise + open-source                          -> Mosquitto (simple) or
#                                                              EMQX (clustered, ACL, bridges).
#   Need durable IoT queue                                  -> EMQX / VerneMQ persistent sessions.

# Anti-pattern:
#   "Use MQTT for our analytics pipeline because it's fast"
# MQTT brokers are not partitioned logs - no replay, no compaction, weak
# ordering across consumers. Use MQTT at the edge, Kafka at the core.
```

## Decision Rule

```text
Mass IoT clients, small messages, lossy net          -> MQTT.
High-volume analytics, replay, partitioned log        -> Kafka.
Enterprise routing (exchanges, dead letters)          -> AMQP / RabbitMQ.
Cloud-to-cloud notification, no broker                 -> HTTP webhook.
Need both device fleet + analytics replay              -> MQTT -> Kafka bridge.
Need managed everything                                 -> AWS IoT Core / Azure IoT Hub /
                                                           Google Cloud IoT (sunset 2023 -
                                                           switch to Pub/Sub).
Need on-premise + open-source                          -> Mosquitto (simple) or
                                                           EMQX (clustered, ACL, bridges).
Need durable IoT queue                                  -> EMQX / VerneMQ persistent sessions.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   "Use MQTT for our analytics pipeline because it's fast"
> MQTT brokers are not partitioned logs - no replay, no compaction, weak
> ordering across consumers. Use MQTT at the edge, Kafka at the core.

## Tips

- **MQTT**: tiny payloads, millions of clients, presence semantics, lossy networks — built for IoT.
- **Kafka**: high-throughput partitioned log with replay — analytics, event sourcing.
- **AMQP / RabbitMQ**: rich routing (exchanges + bindings + DLQ) — enterprise messaging.
- **HTTP webhooks**: cloud-to-cloud, no broker, simplest — but no presence, no fan-out without registry.
- Common production pattern: MQTT at the edge, bridged to Kafka or a managed cloud bus for analytics.

## Common Mistake

> [!warning] Trying to use MQTT as an analytics backplane (no replay, no partitioned ordering) or Kafka on tiny IoT devices (clients are heavy, broker ops cost is high). Use MQTT at the edge, Kafka at the core.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/mqtt-iot/patterns/_Index|MQTT / IoT → When to reach for which messaging tool]]
- [[Sections/mqtt-iot/_Index|MQTT / IoT index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "streams"
id: "kafka-py"
title: "confluent-kafka-python — Kafka producer / consumer with delivery guarantees"
category: "Streams"
subtitle: "confluent_kafka.Producer / Consumer, consumer groups, manual offset commit, Avro / JSON Schema, partitioning by key, dead-letter topic, aiokafka for async"
signature_short: "consumer = Consumer({\"bootstrap.servers\": ..., \"group.id\": \"myapp\", \"enable.auto.commit\": False})
for msg in consumer: ...; consumer.commit(msg)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "confluent-kafka-python — Kafka producer / consumer with delivery guarantees"
  - "kafka-py"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/streams"
  - "category/streams"
  - "tier/tiered"
---

# confluent-kafka-python — Kafka producer / consumer with delivery guarantees

> confluent_kafka.Producer / Consumer, consumer groups, manual offset commit, Avro / JSON Schema, partitioning by key, dead-letter topic, aiokafka for async

## Overview

Kafka is the distributed log for high-throughput event streaming: messages are appended to partitioned topics, retained for days, consumed by named consumer groups that can scale by adding more consumers. Versus Celery (previous entries): Kafka guarantees ordering within a partition, retains messages even after consumption (other groups can re-read), and scales to millions of messages per second. The Python landscape: `confluent-kafka-python` (C-backed, fast) is the recommended client; `kafka-python` (pure Python) is older and slower; `aiokafka` is the asyncio variant. The three examples solve the SAME concrete task — consume an `order_placed` topic; process each event; commit our position so a restart resumes correctly — at three depths: minimal poll loop with auto-commit → consumer group + manual commit AFTER processing + Schema Registry validation → production with exactly-once semantics, dead-letter topic, OTel propagation, rebalance handlers.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Consume order_placed events; process each; the broker tracks our position so restart resumes.
- **Junior** — SAME — but at-least-once delivery via manual offset commit AFTER processing; Schema Registry for typed payloads; key-based partitioning for ordering by order_id.
- **Senior** — SAME — production: exactly-once via Kafka transactions OR idempotent downstream writes; dead-letter topic on processing failure; OTel trace propagation; rebalance handler for graceful partition reassignment.

## Signature

```python
consumer = Consumer({"bootstrap.servers": ..., "group.id": "myapp", "enable.auto.commit": False})
for msg in consumer: ...; consumer.commit(msg)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Consume order_placed events; process each; the broker
#             tracks our position so restart resumes.
# APPROACH  - confluent-kafka Consumer; auto-commit on (default);
#             poll() in a loop.
# STRENGTHS - Smallest correct setup; works for one consumer.
# WEAKNESSES- Auto-commit means message is "consumed" before it's
#             actually processed. Crash mid-processing = lost message.
#             Junior tier moves to manual commit.

# pip install confluent-kafka
from confluent_kafka import Consumer, Producer, KafkaError

# === Producer (publish events to the topic) ===
producer = Producer({"bootstrap.servers": "localhost:9092"})

def publish_order(order_id: int, payload: dict) -> None:
    import json
    producer.produce(
        topic="order_placed",
        key=str(order_id).encode(),                    # key controls partition (ordering by order_id)
        value=json.dumps(payload).encode(),
    )
    producer.poll(0)                                    # serve delivery callbacks

# Block until all queued messages are sent (call before exit).
producer.flush()

# === Consumer (consume + process) ===
consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id":          "myapp-orders",               # consumer group
    "auto.offset.reset": "earliest",                    # start from beginning if no offset
})
consumer.subscribe(["order_placed"])

try:
    while True:
        msg = consumer.poll(timeout=1.0)               # 1s blocking poll
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue                                # normal: no more messages
            print(f"error: {msg.error()}")
            continue

        # Process the message.
        import json
        payload = json.loads(msg.value())
        print(f"processing order {msg.key().decode()}: {payload}")

        # Auto-commit (default) marks the offset committed periodically.
        # After commit, this message won't be re-delivered to this group.
finally:
    consumer.close()

# Why auto-commit is dangerous:
#   1. consumer.poll() returns msg
#   2. auto-commit ticks (every 5s by default) -> offset committed
#   3. processing crashes / pod killed
#   4. on restart: offset is past the unprocessed message
#   5. message LOST.
#
# Junior tier: manual commit AFTER successful processing.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but at-least-once delivery via manual offset
#             commit AFTER processing; Schema Registry for typed
#             payloads; key-based partitioning for ordering by order_id.
# APPROACH  - enable.auto.commit=False; consumer.commit(msg) after
#             successful processing; AvroSerializer / JSONSchemaSerializer
#             for typed messages.
# STRENGTHS- Crash mid-processing = message redelivered (at-least-once);
#             ordering preserved within an order_id (same key -> same partition);
#             schema validation at producer + consumer.
# WEAKNESSES- At-least-once means duplicates possible — make consumers
#             idempotent OR move to exactly-once (senior tier).
import json, signal
from confluent_kafka import Consumer, Producer, KafkaException
from confluent_kafka.serialization import StringSerializer
import structlog

log = structlog.get_logger()

# === Schema Registry (typed messages) ===
# pip install confluent-kafka[avro]  (or [json] for JSON Schema)
# from confluent_kafka.schema_registry import SchemaRegistryClient
# from confluent_kafka.schema_registry.json_schema import JSONSerializer, JSONDeserializer

# === Producer ===
producer = Producer({
    "bootstrap.servers": "localhost:9092",
    "acks":              "all",                         # wait for full ISR ack
    "enable.idempotence": True,                          # producer-side dedup
    "linger.ms":         5,                              # batch up to 5ms
    "compression.type":  "lz4",
})

def _delivery_callback(err, msg):
    if err:
        log.error("kafka_delivery_failed", error=str(err))
    # On success, no-op; metrics elsewhere.

def publish_order(order_id: int, payload: dict) -> None:
    producer.produce(
        topic="order_placed",
        key=str(order_id).encode(),                    # same key -> same partition (ordering)
        value=json.dumps(payload).encode(),
        on_delivery=_delivery_callback,
    )
    producer.poll(0)

# === Consumer with manual commit ===
consumer = Consumer({
    "bootstrap.servers":   "localhost:9092",
    "group.id":            "myapp-orders",
    "auto.offset.reset":   "earliest",
    "enable.auto.commit":  False,                      # we commit manually
    "max.poll.interval.ms": 300_000,                    # 5 min — must complete a message before this
})
consumer.subscribe(["order_placed"])

# Graceful shutdown.
_shutdown = False
def _on_signal(*_):
    global _shutdown
    _shutdown = True
signal.signal(signal.SIGTERM, _on_signal)
signal.signal(signal.SIGINT, _on_signal)

try:
    while not _shutdown:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            log.error("kafka_consumer_error", error=str(msg.error()))
            continue

        try:
            payload = json.loads(msg.value())
            _process_order(payload)
        except Exception as exc:
            log.error("processing_failed", error=str(exc),
                      key=msg.key(), offset=msg.offset())
            # Don't commit; message redelivered on next poll.
            # In production: route to DLT after N attempts (senior tier).
            continue

        # Commit AFTER successful processing.
        consumer.commit(message=msg, asynchronous=False)
        log.info("message_processed",
                 key=msg.key().decode() if msg.key() else None,
                 offset=msg.offset())

finally:
    consumer.close()

def _process_order(payload: dict) -> None: ...

# === Consumer group semantics ===
# group.id="myapp-orders":
#   - All consumers with the same group.id share the partitions of the topic.
#   - 4 partitions + 4 consumers = each gets 1 partition.
#   - 4 partitions + 8 consumers = 4 consumers get 1 partition, 4 idle.
#   - 4 partitions + 2 consumers = each gets 2 partitions.
#
# Different group.ids:
#   - Each gets its own offset cursor; both see every message.
#   - Common pattern: "myapp-orders" for the email service,
#     "analytics-orders" for the data pipeline; same topic, two consumers.

# === Key-based partitioning preserves ordering ===
# All messages with key=order_id "42" go to the same partition;
# they're consumed in order by the consumer assigned to that partition.
# Critical when ordering matters (e.g., status changes for one order).
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: exactly-once via Kafka transactions OR
#             idempotent downstream writes; dead-letter topic on
#             processing failure; OTel trace propagation; rebalance
#             handler for graceful partition reassignment.
# APPROACH  - Either (a) use Kafka transactions (consumer reads + producer
#             writes in one transaction; consumer-offset commit happens
#             with the produces), or (b) at-least-once + idempotent
#             writes (cheaper, more flexible). Most teams pick (b).
# STRENGTHS - Crash-safe; duplicates filtered by downstream idempotency;
#             dead-letter for poison messages; partition rebalance
#             doesn't lose work; trace_id propagates.
# WEAKNESSES- Exactly-once via Kafka transactions has performance cost;
#             at-least-once + idempotency is usually the right pattern.
import json, hashlib, signal, time
from confluent_kafka import Consumer, Producer, KafkaException, TopicPartition
from opentelemetry import trace as otel_trace
from opentelemetry.propagate import inject, extract
import structlog
import redis as redis_lib

log = structlog.get_logger()
tracer = otel_trace.get_tracer(__name__)

# === Producer with idempotence + acks=all ===
producer = Producer({
    "bootstrap.servers":  "localhost:9092",
    "acks":               "all",
    "enable.idempotence": True,                         # producer dedup on retries
    "linger.ms":          5,
    "compression.type":   "lz4",
    "max.in.flight.requests.per.connection": 5,
})

# === Consumer ===
consumer = Consumer({
    "bootstrap.servers":   "localhost:9092",
    "group.id":            "myapp-orders",
    "auto.offset.reset":   "earliest",
    "enable.auto.commit":  False,
    "isolation.level":     "read_committed",            # only see committed messages
    "max.poll.interval.ms": 300_000,
    "session.timeout.ms":  10_000,
})

# === Rebalance handlers — commit before partitions are revoked ===
def on_assign(consumer, partitions):
    log.info("partitions_assigned",
             partitions=[(p.topic, p.partition) for p in partitions])

def on_revoke(consumer, partitions):
    """Commit any pending offsets BEFORE losing the partition."""
    log.info("partitions_revoked",
             partitions=[(p.topic, p.partition) for p in partitions])
    try:
        consumer.commit(asynchronous=False)
    except KafkaException as e:
        log.warning("commit_on_revoke_failed", error=str(e))

consumer.subscribe(["order_placed"], on_assign=on_assign, on_revoke=on_revoke)

# === Idempotency via Redis SETNX (handles at-least-once duplicates) ===
r = redis_lib.Redis.from_url("redis://localhost:6379/2")
IDEMP_TTL_S = 7 * 24 * 3600

def _idempotency_key(msg) -> str:
    """Construct a stable key per (topic, partition, offset) — message-unique."""
    return f"kafka:idemp:{msg.topic()}:{msg.partition()}:{msg.offset()}"

# === Dead-letter topic ===
DLT_TOPIC = "order_placed.dlt"

def _send_to_dlt(msg, error: str) -> None:
    headers = (msg.headers() or []) + [
        ("dlt.error", error.encode()),
        ("dlt.original_topic", msg.topic().encode()),
        ("dlt.original_partition", str(msg.partition()).encode()),
        ("dlt.original_offset", str(msg.offset()).encode()),
        ("dlt.timestamp", str(int(time.time())).encode()),
    ]
    producer.produce(
        topic=DLT_TOPIC,
        key=msg.key(),
        value=msg.value(),
        headers=headers,
    )
    producer.poll(0)

# === Process loop with OTel + idempotency + DLT ===
_shutdown = False
def _on_signal(*_):
    global _shutdown
    _shutdown = True
signal.signal(signal.SIGTERM, _on_signal)
signal.signal(signal.SIGINT, _on_signal)

try:
    while not _shutdown:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            log.error("consumer_error", error=str(msg.error()))
            continue

        # Extract trace context from message headers (set by producer).
        carrier = {k: v.decode() for k, v in (msg.headers() or [])}
        ctx = extract(carrier)

        with tracer.start_as_current_span(
            f"consume {msg.topic()}",
            context=ctx,
            attributes={
                "messaging.system": "kafka",
                "messaging.destination": msg.topic(),
                "messaging.kafka.partition": msg.partition(),
                "messaging.kafka.offset": msg.offset(),
            },
        ):
            ck = _idempotency_key(msg)
            if not r.set(ck, "1", nx=True, ex=IDEMP_TTL_S):
                log.info("duplicate_skipped", offset=msg.offset())
                consumer.commit(message=msg, asynchronous=False)
                continue

            try:
                payload = json.loads(msg.value())
                _process_order(payload)
            except Exception as exc:
                log.error("processing_failed",
                          error=str(exc),
                          offset=msg.offset())
                # Release idempotency claim so DLT consumer can process it.
                r.delete(ck)
                _send_to_dlt(msg, str(exc))

            # Commit offset (whether successful processing or DLT — we're done).
            consumer.commit(message=msg, asynchronous=False)

finally:
    producer.flush(timeout=10.0)
    consumer.close()

def _process_order(payload: dict) -> None: ...

# === Producer with trace context propagation ===
def publish_order_with_trace(order_id: int, payload: dict) -> None:
    with tracer.start_as_current_span(
        "produce order_placed",
        attributes={"messaging.system": "kafka",
                    "messaging.destination": "order_placed"},
    ):
        carrier: dict[str, str] = {}
        inject(carrier)
        headers = [(k, v.encode()) for k, v in carrier.items()]
        producer.produce(
            topic="order_placed",
            key=str(order_id).encode(),
            value=json.dumps(payload).encode(),
            headers=headers,
        )
        producer.poll(0)

# Decision rule:
#   high throughput, ordered, replayable     -> Kafka
#   simpler queueing, single-Redis dep       -> Redis Streams (next entry)
#   AMQP semantics (RabbitMQ)                -> aio-pika (next entry)
#   point-to-point background tasks          -> Celery (previous entries)
#   exactly-once delivery                    -> Kafka transactions OR at-least-once + idempotency
#                                                (idempotency is usually simpler)
#   ordering by entity (order_id)            -> partition by entity key; same key -> same partition
#   sync vs async client                     -> confluent-kafka (sync, fast) OR aiokafka (async)
#   schema enforcement                        -> Confluent Schema Registry + Avro/JSON Schema
#   crash-safe consumer                       -> manual commit AFTER processing
#   rebalance handling                        -> on_revoke handler that commits pending offsets
#   poison message                            -> DLT (dead-letter topic) + ops review
#   trace propagation                         -> headers via inject/extract; OTel auto-instr
#   replay history                            -> seek to earliest; new consumer group; replay
#   want compaction (latest-only-per-key)    -> log compaction; topic config cleanup.policy=compact
#
# Anti-pattern: enable.auto.commit=True (default) with at-least-once
# expectations. Auto-commit ticks every 5s independent of processing
# success; a crash mid-processing leaves the offset committed for
# unprocessed messages -> messages LOST silently. For any production
# consumer that does real work, set enable.auto.commit=False and
# commit AFTER processing returns successfully.
```

## Decision Rule

```text
high throughput, ordered, replayable     -> Kafka
simpler queueing, single-Redis dep       -> Redis Streams (next entry)
AMQP semantics (RabbitMQ)                -> aio-pika (next entry)
point-to-point background tasks          -> Celery (previous entries)
exactly-once delivery                    -> Kafka transactions OR at-least-once + idempotency
                                             (idempotency is usually simpler)
ordering by entity (order_id)            -> partition by entity key; same key -> same partition
sync vs async client                     -> confluent-kafka (sync, fast) OR aiokafka (async)
schema enforcement                        -> Confluent Schema Registry + Avro/JSON Schema
crash-safe consumer                       -> manual commit AFTER processing
rebalance handling                        -> on_revoke handler that commits pending offsets
poison message                            -> DLT (dead-letter topic) + ops review
trace propagation                         -> headers via inject/extract; OTel auto-instr
replay history                            -> seek to earliest; new consumer group; replay
want compaction (latest-only-per-key)    -> log compaction; topic config cleanup.policy=compact
```

## Anti-Pattern

> [!warning] Anti-pattern
> enable.auto.commit=True (default) with at-least-once
> expectations. Auto-commit ticks every 5s independent of processing
> success; a crash mid-processing leaves the offset committed for
> unprocessed messages -> messages LOST silently. For any production
> consumer that does real work, set enable.auto.commit=False and
> commit AFTER processing returns successfully.

## Tips

- Use `confluent-kafka-python` (C-backed, fast) over `kafka-python` (pure Python, older). The performance difference is 10-100×; both have similar APIs.
- For at-least-once delivery, set `enable.auto.commit=False` and commit AFTER successful processing. Auto-commit + processing crash = lost message.
- Same key → same partition. Use the entity ID (order_id, user_id) as the message key when you need ordered processing of events for one entity.
- Set `enable.idempotence=True` on the producer + `acks=all`. The producer adds a sequence number; broker dedupes retries. Eliminates duplicate publishes from network blips.
- Implement an `on_revoke` rebalance handler that commits pending offsets. Without it, partitions reassigned mid-processing means re-delivery of in-flight messages.
- For exactly-once semantics, the right answer is usually at-least-once delivery + idempotent downstream writes (Redis SETNX claim per-message-id). Kafka transactions work but cost throughput.

## Common Mistake

> [!warning] `enable.auto.commit=True` (the default) with at-least-once expectations. Auto-commit ticks every 5s independent of processing success; a crash mid-processing leaves the offset committed for unprocessed messages — messages LOST silently. For any production consumer doing real work, set `enable.auto.commit=False` and commit AFTER processing.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Auto-commit — message ack'd before processing; crash = data loss
consumer = Consumer({"bootstrap.servers": ..., "group.id": "..."})
for msg in consumer:
    process(msg)
```

**Senior:**
```python
# Manual commit AFTER processing succeeds
consumer = Consumer({..., "enable.auto.commit": False})
for msg in consumer:
    process(msg)
    consumer.commit(message=msg, asynchronous=False)
```

## See Also

- [[Sections/messaging-queues/streams/redis-streams|Redis Streams — XADD / XREADGROUP, lighter than Kafka (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/aio-pika-amqp|aio-pika — async RabbitMQ / AMQP with DLX and acks (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/_Index|Messaging & Queues → Streams & Brokers — Kafka, Redis Streams, RabbitMQ]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]

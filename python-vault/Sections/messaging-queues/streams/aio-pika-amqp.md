---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "streams"
id: "aio-pika-amqp"
title: "aio-pika — async RabbitMQ / AMQP with DLX and acks"
category: "Streams"
subtitle: "aio_pika.connect_robust, exchanges (direct/topic/fanout), bindings, manual ack/nack/reject, DLX, prefetch QoS, publisher confirms"
signature_short: "conn = await aio_pika.connect_robust(\"amqp://...\")
ch = await conn.channel()
q = await ch.declare_queue(\"orders\", durable=True)
async for msg in q: ...; await msg.ack()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "aio-pika — async RabbitMQ / AMQP with DLX and acks"
  - "aio-pika-amqp"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/streams"
  - "category/streams"
  - "tier/tiered"
---

# aio-pika — async RabbitMQ / AMQP with DLX and acks

> aio_pika.connect_robust, exchanges (direct/topic/fanout), bindings, manual ack/nack/reject, DLX, prefetch QoS, publisher confirms

## Overview

AMQP (RabbitMQ) is the long-running standard for queue-based message routing — exchanges + bindings give you fan-out, topic routing, and dead-letter routing in one model. `aio-pika` is the production async client. Versus Kafka: AMQP queues consume messages (delete after ack); Kafka topics retain. Versus Celery: Celery is a task-execution layer, often built on AMQP — aio-pika is the message-protocol layer underneath. Right choice when: you need topic-routing fan-out, the team already runs RabbitMQ, or your throughput suits RabbitMQ's ~50k msgs/s ceiling. The three examples solve the SAME concrete task — consume an `orders` queue; ack after processing; route failed messages to a dead-letter exchange — at three depths: simple consume + ack → topic exchange + bindings + manual ack with prefetch QoS → production with DLX, publisher confirms, graceful shutdown, reconnection logic.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Consume an 'orders' queue from RabbitMQ; ack each message after processing.
- **Junior** — SAME — but with a topic exchange so we can route "orders.placed" vs "orders.shipped" vs "orders.cancelled" to different consumer queues; manual ack after success.
- **Senior** — SAME — production: dead-letter exchange (DLX) for poison messages, publisher confirms for at-least-once publish, graceful shutdown, max-retries via x-death header.

## Signature

```python
conn = await aio_pika.connect_robust("amqp://...")
ch = await conn.channel()
q = await ch.declare_queue("orders", durable=True)
async for msg in q: ...; await msg.ack()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Consume an 'orders' queue from RabbitMQ; ack each
#             message after processing.
# APPROACH  - aio_pika.connect_robust + declare durable queue +
#             async iterate.
# STRENGTHS - connect_robust auto-reconnects on connection drop;
#             one queue, one consumer.
# WEAKNESSES- No exchange/routing yet; no DLX; junior tier adds them.

# pip install aio-pika
import asyncio, json
import aio_pika

async def consume():
    conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
    async with conn:
        channel = await conn.channel()
        # Durable queue survives broker restart.
        queue = await channel.declare_queue("orders", durable=True)

        async with queue.iterator() as q:
            async for message in q:
                async with message.process():           # auto-acks on context exit
                    payload = json.loads(message.body)
                    print(f"processing: {payload}")

asyncio.run(consume())

# === Producer ===
async def publish_order(payload: dict) -> None:
    conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
    async with conn:
        channel = await conn.channel()
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(payload).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,  # survive broker restart
            ),
            routing_key="orders",                       # default exchange routes by name
        )

# === message.process() vs manual ack ===
# message.process() is a context manager:
#   - on success: ack
#   - on exception: nack with requeue=True (redelivers)
# For more control (manual ack/nack/reject), see junior tier.

# When to use:
#  - Background processing of slow tasks (similar to Celery)
#  - Topic-style fan-out (one publish, multiple consumers per type)
#  - When you need RabbitMQ's mature routing (TTL, priority, etc.)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with a topic exchange so we can route
#             "orders.placed" vs "orders.shipped" vs "orders.cancelled"
#             to different consumer queues; manual ack after success.
# APPROACH  - declare_exchange("orders", TOPIC); queues bind with
#             routing_key patterns ("orders.placed", "orders.*");
#             prefetch QoS for fair dispatch.
# STRENGTHS- Pub/sub style with selective consumption; one consumer
#             can handle "all order events" via "orders.*" wildcard.
# WEAKNESSES- Still no DLX; permanently failing messages re-queue
#             forever. Senior tier fixes that.
import asyncio, json, signal
import aio_pika
from aio_pika import ExchangeType, DeliveryMode
import structlog

log = structlog.get_logger()

async def setup_topology(channel: aio_pika.Channel) -> tuple[aio_pika.Exchange, aio_pika.Queue]:
    """Declare exchange + queue + binding. Idempotent."""
    # Topic exchange: routing keys can include wildcards.
    exchange = await channel.declare_exchange(
        "orders", ExchangeType.TOPIC, durable=True,
    )
    queue = await channel.declare_queue(
        "orders.placed.email",                          # queue name
        durable=True,                                    # survive broker restart
    )
    # Bind: this queue receives messages with routing_key matching pattern.
    await queue.bind(exchange, routing_key="orders.placed")
    # For "all order events": routing_key="orders.*"
    return exchange, queue

# === Producer ===
async def publish_order_event(event_type: str, payload: dict) -> None:
    """event_type: 'orders.placed' | 'orders.shipped' | 'orders.cancelled'"""
    conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
    async with conn:
        channel = await conn.channel()
        exchange = await channel.declare_exchange("orders", ExchangeType.TOPIC, durable=True)
        await exchange.publish(
            aio_pika.Message(
                body=json.dumps(payload).encode(),
                delivery_mode=DeliveryMode.PERSISTENT,
                content_type="application/json",
            ),
            routing_key=event_type,                     # topic routing: "orders.placed"
        )

# === Consumer with manual ack + QoS prefetch ===
async def consume():
    conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
    async with conn:
        channel = await conn.channel()
        # Prefetch: how many unacked messages this consumer can hold.
        # 10 = grab up to 10 ahead; good for fast tasks. For slow tasks,
        # set to 1 so messages spread evenly across consumers.
        await channel.set_qos(prefetch_count=10)

        _, queue = await setup_topology(channel)

        async with queue.iterator() as q:
            async for message in q:
                try:
                    payload = json.loads(message.body)
                    await _process_order(payload)
                except Exception as exc:
                    log.error("processing_failed", error=str(exc),
                              delivery_tag=message.delivery_tag)
                    # nack(requeue=False) -> drop OR DLX (senior tier)
                    # nack(requeue=True)  -> redeliver (could loop forever on poison)
                    await message.nack(requeue=False)
                    continue

                # Success — ack.
                await message.ack()

async def _process_order(payload: dict) -> None: ...

# === Wildcard subscription pattern ===
# A second consumer wants ALL order events for analytics:
async def setup_analytics_consumer(channel: aio_pika.Channel):
    exchange = await channel.declare_exchange("orders", ExchangeType.TOPIC, durable=True)
    queue = await channel.declare_queue("orders.all.analytics", durable=True)
    await queue.bind(exchange, routing_key="orders.*")  # matches ALL orders.* events
    return queue
# Now this consumer receives orders.placed, orders.shipped, orders.cancelled
# WITHOUT taking them from the email consumer's queue (different queue!).
# AMQP routes the message to EVERY queue whose binding matches.

# Run:
asyncio.run(consume())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: dead-letter exchange (DLX) for
#             poison messages, publisher confirms for at-least-once
#             publish, graceful shutdown, max-retries via x-death header.
# APPROACH  - Queue declared with x-dead-letter-exchange argument;
#             nack(requeue=False) on permanent failure routes to DLX;
#             publisher_confirms on the channel guarantees broker ack;
#             SIGTERM stops the iterator cleanly.
# STRENGTHS - Poison messages don't loop forever; publish is acked;
#             reconnection + recovery is automatic via connect_robust.
# WEAKNESSES- More configuration; document the topology (exchanges,
#             queues, bindings, DLX) in a single source of truth.
import asyncio, json, signal, os, time
import aio_pika
from aio_pika import ExchangeType, DeliveryMode
from opentelemetry import trace as otel_trace
from opentelemetry.propagate import inject, extract
import structlog

log = structlog.get_logger()
tracer = otel_trace.get_tracer(__name__)

# === Topology — declare once at startup ===
async def declare_topology(channel: aio_pika.Channel):
    """Declare exchanges, queues, bindings, DLX. Idempotent."""

    # Main exchange.
    main = await channel.declare_exchange("orders", ExchangeType.TOPIC, durable=True)

    # Dead-letter exchange.
    dlx = await channel.declare_exchange("orders.dlx", ExchangeType.TOPIC, durable=True)

    # Main queue with DLX routing argument.
    main_queue = await channel.declare_queue(
        "orders.placed.email", durable=True,
        arguments={
            "x-dead-letter-exchange": "orders.dlx",
            "x-dead-letter-routing-key": "orders.placed.failed",
            # Optional: drop messages after 1h waiting (keeps queue tidy).
            # "x-message-ttl": 3600 * 1000,
            # Optional: max queue length; oldest dropped to DLX.
            # "x-max-length": 100_000,
            # "x-overflow": "drop-head",
        },
    )
    await main_queue.bind(main, routing_key="orders.placed")

    # Dead-letter queue.
    dlq = await channel.declare_queue("orders.placed.dlq", durable=True)
    await dlq.bind(dlx, routing_key="orders.placed.failed")

    return main, main_queue, dlq

# === Producer with publisher confirms + tracing ===
async def make_publisher_channel(conn: aio_pika.Connection) -> aio_pika.Channel:
    """Channel with publisher confirms enabled."""
    channel = await conn.channel(publisher_confirms=True)
    return channel

async def publish_order_placed(channel: aio_pika.Channel, payload: dict) -> None:
    main = await channel.declare_exchange("orders", ExchangeType.TOPIC, durable=True)
    with tracer.start_as_current_span(
        "publish orders.placed",
        attributes={"messaging.system": "rabbitmq", "messaging.destination": "orders"},
    ):
        carrier: dict[str, str] = {}
        inject(carrier)
        msg = aio_pika.Message(
            body=json.dumps(payload).encode(),
            delivery_mode=DeliveryMode.PERSISTENT,
            content_type="application/json",
            headers=carrier,                           # OTel propagation via headers
            message_id=str(payload.get("id", "")),
            timestamp=int(time.time()),
        )
        # publisher_confirms=True -> awaits broker ack; raises on failure.
        await main.publish(msg, routing_key="orders.placed")

# === Consumer — production-grade ===
MAX_DELIVERIES = 5

async def consume():
    conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
    async with conn:
        channel = await conn.channel()
        await channel.set_qos(prefetch_count=10)

        _, queue, _ = await declare_topology(channel)

        async with queue.iterator(no_ack=False) as q:
            async for message in q:
                # Extract trace context from headers.
                carrier = {k: v for k, v in (message.headers or {}).items()}
                ctx = extract(carrier)

                with tracer.start_as_current_span(
                    "consume orders.placed",
                    context=ctx,
                    attributes={"messaging.system": "rabbitmq",
                                "messaging.destination": "orders",
                                "messaging.message_id": message.message_id or ""},
                ):
                    # Check delivery count via x-death header (set by RabbitMQ on redelivery).
                    deliveries = _delivery_count(message)
                    if deliveries > MAX_DELIVERIES:
                        log.warning("max_deliveries_to_dlx",
                                    deliveries=deliveries,
                                    msg_id=message.message_id)
                        await message.reject(requeue=False)  # -> DLX
                        continue

                    try:
                        payload = json.loads(message.body)
                        await _process_order(payload)
                    except Exception as exc:
                        log.error("processing_failed", error=str(exc))
                        # nack(requeue=False) routes to DLX (we declared the queue with DLX arg).
                        # The next consumer to claim it from DLQ can decide what to do.
                        await message.nack(requeue=False)
                        continue

                    await message.ack()

def _delivery_count(message: aio_pika.IncomingMessage) -> int:
    """RabbitMQ adds x-death header on every redelivery."""
    deaths = (message.headers or {}).get("x-death", [])
    if deaths:
        return deaths[0].get("count", 0)
    return 0

async def _process_order(payload: dict) -> None: ...

# === Graceful shutdown ===
async def main():
    loop = asyncio.get_running_loop()
    stop = asyncio.Event()

    def _on_signal():
        log.info("shutdown_signal_received")
        stop.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, _on_signal)

    consume_task = asyncio.create_task(consume())
    await stop.wait()
    consume_task.cancel()
    try:
        await consume_task
    except asyncio.CancelledError:
        pass
    log.info("shutdown_complete")

# asyncio.run(main())

# Decision rule:
#   topic-routing fan-out                   -> AMQP topic exchange (RabbitMQ + aio-pika)
#   strict ordering by partition           -> Kafka (previous entry)
#   simpler, single-Redis dep               -> Redis Streams (previous entry)
#   point-to-point background tasks        -> Celery (previous entries)
#   need DLX                                 -> queue declare with x-dead-letter-exchange
#   publisher must know broker received     -> publisher_confirms=True on channel
#   crash-safe consume                       -> manual ack AFTER processing; auto on context exit
#   prefetch tuning                          -> set_qos(prefetch_count=N); 1 for slow tasks, 10+ for fast
#   redelivery loop                          -> count via x-death header; reject to DLX after N
#   message TTL                              -> x-message-ttl on queue OR per-message expiration
#   priority queues                          -> x-max-priority on queue; per-message priority
#   broker availability                       -> connect_robust auto-reconnects
#   trace propagation                        -> inject/extract via message headers (built-in dict)
#   schema enforcement                        -> validate at consumer (Pydantic); no native AMQP schemas
#   sync code instead of async               -> pika library (sync); same protocol
#   transactions across operations          -> AMQP TX mode (rare; use idempotency instead)
#
# Anti-pattern: nack(requeue=True) on every error. A poison message
# (one that always raises) gets nacked, requeued, redelivered, nacked,
# requeued, ... in an infinite loop, blocking new messages and
# burning CPU. Use nack(requeue=False) to send it to a DLX (declared
# via x-dead-letter-exchange queue argument), where ops can review
# without blocking the main queue. Or check x-death count and reject
# after N redeliveries.
```

## Decision Rule

```text
topic-routing fan-out                   -> AMQP topic exchange (RabbitMQ + aio-pika)
strict ordering by partition           -> Kafka (previous entry)
simpler, single-Redis dep               -> Redis Streams (previous entry)
point-to-point background tasks        -> Celery (previous entries)
need DLX                                 -> queue declare with x-dead-letter-exchange
publisher must know broker received     -> publisher_confirms=True on channel
crash-safe consume                       -> manual ack AFTER processing; auto on context exit
prefetch tuning                          -> set_qos(prefetch_count=N); 1 for slow tasks, 10+ for fast
redelivery loop                          -> count via x-death header; reject to DLX after N
message TTL                              -> x-message-ttl on queue OR per-message expiration
priority queues                          -> x-max-priority on queue; per-message priority
broker availability                       -> connect_robust auto-reconnects
trace propagation                        -> inject/extract via message headers (built-in dict)
schema enforcement                        -> validate at consumer (Pydantic); no native AMQP schemas
sync code instead of async               -> pika library (sync); same protocol
transactions across operations          -> AMQP TX mode (rare; use idempotency instead)
```

## Anti-Pattern

> [!warning] Anti-pattern
> nack(requeue=True) on every error. A poison message
> (one that always raises) gets nacked, requeued, redelivered, nacked,
> requeued, ... in an infinite loop, blocking new messages and
> burning CPU. Use nack(requeue=False) to send it to a DLX (declared
> via x-dead-letter-exchange queue argument), where ops can review
> without blocking the main queue. Or check x-death count and reject
> after N redeliveries.

## Tips

- Use `aio_pika.connect_robust(...)` (not `connect`) — it auto-reconnects on connection drops, queue redeclarations, and channel errors. Critical for production.
- Set `prefetch_count` via `channel.set_qos`. For slow tasks, prefetch=1 spreads load evenly; for fast tasks, 10-100 reduces broker round-trips.
- Always declare queues with a dead-letter exchange (`x-dead-letter-exchange`). Without it, `nack(requeue=False)` drops the message; with it, the message goes to a DLQ for ops review.
- For at-least-once publishing, open the channel with `publisher_confirms=True`. The publish call awaits a broker ack; failure raises an exception you can handle.
- Check the `x-death` header to count redeliveries; reject to DLX after N attempts to break poison-message loops.
- Pack OTel trace context as message headers — AMQP messages have a `headers` dict. `inject(headers)` on producer; `extract(headers)` on consumer.

## Common Mistake

> [!warning] `nack(requeue=True)` on every processing error. A poison message (one that always raises) gets nacked, requeued, redelivered, nacked, ... infinitely — blocking new messages and burning CPU. Either: (a) declare the queue with a dead-letter exchange and use `nack(requeue=False)` on permanent failures, OR (b) count `x-death` redeliveries and reject after N attempts.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Requeue on error — poison messages loop forever
async with message.process():
    try: process(message.body)
    except: pass     # implicitly re-raises and nacks with requeue=True
```

**Senior:**
```python
# DLX-aware: poison goes to DLQ, real errors retry once
queue = await channel.declare_queue("orders", durable=True,
    arguments={"x-dead-letter-exchange": "orders.dlx"})
await message.nack(requeue=False)   # routes to DLX after final attempt
```

## See Also

- [[Sections/messaging-queues/streams/kafka-py|confluent-kafka-python — Kafka producer / consumer with delivery guarantees (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/redis-streams|Redis Streams — XADD / XREADGROUP, lighter than Kafka (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/_Index|Messaging & Queues → Streams & Brokers — Kafka, Redis Streams, RabbitMQ]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]

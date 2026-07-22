---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "streams"
id: "redis-streams"
title: "Redis Streams — XADD / XREADGROUP, lighter than Kafka"
category: "Streams"
subtitle: "XADD, XREADGROUP, XACK, XPENDING, XCLAIM / XAUTOCLAIM, MAXLEN ~N, consumer groups, dead-letter via separate stream"
signature_short: "r.xadd(\"events\", {\"data\": ...})  ;  msgs = r.xreadgroup(\"g1\", \"c1\", {\"events\": \">\"}, count=10)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Redis Streams — XADD / XREADGROUP, lighter than Kafka"
  - "redis-streams"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/streams"
  - "category/streams"
  - "tier/tiered"
---

# Redis Streams — XADD / XREADGROUP, lighter than Kafka

> XADD, XREADGROUP, XACK, XPENDING, XCLAIM / XAUTOCLAIM, MAXLEN ~N, consumer groups, dead-letter via separate stream

## Overview

Redis Streams (since 5.0) is a persistent log type with consumer groups and acks — Kafka-shaped semantics on Redis. Versus Kafka: one Redis instance vs a multi-broker Kafka cluster (huge ops difference); ~100k msgs/s instead of millions; trim with `MAXLEN ~N` instead of time retention. Versus Celery: stream is replayable + has retention + supports multiple consumer groups (analytics + email both consume the same events). The right choice when you already run Redis and the throughput matches. The three examples solve the SAME concrete task — consume an `events` stream with consumer groups; ack each message after processing; recover from worker crashes — at three depths: XADD/XREAD basic loop → XREADGROUP with consumer group + XACK → XAUTOCLAIM for crashed-consumer recovery + capped streams + DLT.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Append events to a stream; consume them in order.
- **Junior** — SAME — but with consumer groups (parallel workers each get a unique slice) and explicit acks (XACK after successful processing).
- **Senior** — SAME — production: XAUTOCLAIM (Redis 6.2+) recovers messages from dead consumers; dead-letter stream after N delivery attempts; capped streams via MAXLEN; OTel trace propagation through stream entries.

## Signature

```python
r.xadd("events", {"data": ...})  ;  msgs = r.xreadgroup("g1", "c1", {"events": ">"}, count=10)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Append events to a stream; consume them in order.
# APPROACH  - XADD to publish; XREAD with $ to start from "new
#             events only"; loop processing.
# STRENGTHS - Smallest correct stream usage; one Redis dep.
# WEAKNESSES- No consumer groups (only one consumer can effectively
#             read); no acks; restart loses position. Junior tier
#             adds groups + acks.
import redis, json

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# === Producer ===
def publish(stream: str, data: dict) -> str:
    """Returns the stream entry id (e.g., '1731600000000-0')."""
    return r.xadd(stream, {"data": json.dumps(data)})

# === Consumer (without groups — simple but limited) ===
last_id = "$"                                          # "$" = "only new entries"
while True:
    # Block up to 5s waiting for new entries.
    resp = r.xread({"events": last_id}, block=5000, count=10)
    if not resp:
        continue
    # resp = [['events', [(id, {field: value}), ...]]]
    _, entries = resp[0]
    for entry_id, fields in entries:
        data = json.loads(fields["data"])
        print(f"processing {entry_id}: {data}")
        last_id = entry_id                             # advance our cursor

# Limitations of this pattern:
#  - last_id lives in this process; restart starts from $ (skips
#    history) or 0-0 (re-processes everything).
#  - Only one effective consumer per stream — multiple readers all
#    get every message (fan-out, not load-balancing).
#  - No acks — no way to mark a message "processed".
#
# Junior tier: XREADGROUP for proper consumer-group semantics.

# Publish:
publish("events", {"order_id": 42, "type": "placed"})
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with consumer groups (parallel workers each
#             get a unique slice) and explicit acks (XACK after
#             successful processing).
# APPROACH  - XGROUP CREATE for the consumer group; XREADGROUP with
#             a unique consumer name per worker; XACK to mark done.
# STRENGTHS- N workers in the same group share the load; each message
#             goes to ONE consumer; XACK marks "this won't be redelivered".
# WEAKNESSES- A worker that crashes mid-processing leaves messages
#             "pending" — they need recovery. Senior tier handles this.
import os, signal, json, redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

STREAM = "events"
GROUP  = "email-processor"
CONSUMER = f"worker-{os.getpid()}"                     # unique per worker process

# Create the consumer group (idempotent).
try:
    r.xgroup_create(STREAM, GROUP, id="0", mkstream=True)
    # id="0" -> start from beginning of stream
    # id="$" -> start from new messages only
except redis.ResponseError as e:
    if "BUSYGROUP" not in str(e):
        raise

# === Producer ===
def publish(data: dict) -> str:
    return r.xadd(STREAM, {"data": json.dumps(data)})

# === Consumer with group + ack ===
_shutdown = False
def _on_signal(*_):
    global _shutdown; _shutdown = True
signal.signal(signal.SIGTERM, _on_signal)
signal.signal(signal.SIGINT, _on_signal)

while not _shutdown:
    # ">" = "new messages not yet delivered to any consumer in this group"
    resp = r.xreadgroup(
        groupname=GROUP,
        consumername=CONSUMER,
        streams={STREAM: ">"},
        count=10,
        block=5000,                                    # 5s
    )
    if not resp:
        continue

    _, entries = resp[0]
    for entry_id, fields in entries:
        try:
            data = json.loads(fields["data"])
            _process_event(data)
        except Exception as exc:
            print(f"failed to process {entry_id}: {exc}")
            # Don't ack; XPENDING shows it as in-flight.
            # Redelivery: XREADGROUP with id="0" reads PENDING ones.
            continue

        # Mark this entry processed; won't be redelivered.
        r.xack(STREAM, GROUP, entry_id)

def _process_event(data: dict) -> None: ...

# === Reading PENDING (unacked) messages ===
# After a crash, restart and read PENDING for this consumer:
def reclaim_pending() -> list:
    """Read messages this consumer was processing but hadn't ack'd."""
    resp = r.xreadgroup(
        groupname=GROUP,
        consumername=CONSUMER,
        streams={STREAM: "0"},                         # "0" = PENDING for this consumer
        count=10,
    )
    return resp

# === Inspect pending entries (for the whole group) ===
# How many messages are pending across all consumers in the group?
def pending_summary() -> dict:
    """Returns counts of pending messages per consumer in the group."""
    return r.xpending(STREAM, GROUP)

# Pending detail (oldest 100 messages):
#   r.xpending_range(STREAM, GROUP, min="-", max="+", count=100)
# Returns [(id, consumer, idle_ms, delivery_count), ...]

# === Trim the stream so it doesn't grow forever ===
# Approximate trim — fast, may keep slightly more than N.
r.xadd(STREAM, {"data": "..."}, maxlen=10_000, approximate=True)
# Or trim periodically:
r.xtrim(STREAM, maxlen=10_000, approximate=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: XAUTOCLAIM (Redis 6.2+) recovers
#             messages from dead consumers; dead-letter stream after
#             N delivery attempts; capped streams via MAXLEN; OTel
#             trace propagation through stream entries.
# APPROACH  - Periodic XAUTOCLAIM scans the pending list for messages
#             idle > IDLE_MS and reassigns them to the current
#             consumer; delivery_count > MAX_RETRIES routes to a
#             dead-letter stream; trace context flows in stream fields.
# STRENGTHS - Crash recovery without manual orchestration; bounded
#             memory via MAXLEN ~N; poison messages don't block the
#             stream forever; trace_id pivots from event to span.
# WEAKNESSES- XAUTOCLAIM scan adds Redis load; tune the interval and
#             IDLE_MS to your processing time.
import os, signal, json, time, threading, redis
import structlog
from opentelemetry import trace as otel_trace
from opentelemetry.propagate import inject, extract

log = structlog.get_logger()
tracer = otel_trace.get_tracer(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

STREAM       = "events"
DLT_STREAM   = "events.dlt"
GROUP        = "email-processor"
CONSUMER     = f"worker-{os.getpid()}"
IDLE_MS      = 30_000                                  # consider a consumer dead if idle > 30s
MAX_DELIVERY = 5                                       # after 5 delivery attempts, move to DLT
MAX_LEN      = 100_000                                 # cap stream at ~100k entries

# Create group (idempotent).
try:
    r.xgroup_create(STREAM, GROUP, id="0", mkstream=True)
except redis.ResponseError as e:
    if "BUSYGROUP" not in str(e):
        raise

# === Producer with trace context ===
def publish_event(data: dict) -> str:
    with tracer.start_as_current_span(
        f"produce {STREAM}",
        attributes={"messaging.system": "redis_streams",
                    "messaging.destination": STREAM},
    ):
        carrier: dict[str, str] = {}
        inject(carrier)
        # Stream fields are flat strings; pack trace context as fields.
        fields = {"data": json.dumps(data), **{f"_trace.{k}": v for k, v in carrier.items()}}
        return r.xadd(STREAM, fields, maxlen=MAX_LEN, approximate=True)

# === Process one entry — extract trace context, run, ack OR DLT ===
def process_entry(entry_id: str, fields: dict) -> bool:
    """Returns True if successfully processed; False = leave pending for retry/DLT."""
    # Reconstruct propagation carrier from "_trace.<key>" fields.
    carrier = {k.removeprefix("_trace."): v for k, v in fields.items() if k.startswith("_trace.")}
    ctx = extract(carrier)

    with tracer.start_as_current_span(
        f"consume {STREAM}",
        context=ctx,
        attributes={"messaging.system": "redis_streams",
                    "messaging.destination": STREAM,
                    "messaging.message_id": entry_id},
    ):
        try:
            data = json.loads(fields["data"])
            _process_event(data)
            return True
        except Exception as exc:
            log.error("processing_failed", entry_id=entry_id, exc=str(exc))
            return False

# === Move to dead-letter stream ===
def send_to_dlt(entry_id: str, fields: dict, reason: str) -> None:
    dlt_fields = dict(fields)
    dlt_fields["_dlt.original_id"] = entry_id
    dlt_fields["_dlt.reason"] = reason
    dlt_fields["_dlt.timestamp"] = str(int(time.time()))
    r.xadd(DLT_STREAM, dlt_fields, maxlen=MAX_LEN, approximate=True)
    log.warning("entry_sent_to_dlt", entry_id=entry_id, reason=reason)

# === XAUTOCLAIM background — recover from crashed consumers ===
def auto_claim_loop():
    """Periodically reclaim messages whose owner has been idle > IDLE_MS."""
    cursor = "0-0"
    while not _shutdown:
        try:
            # XAUTOCLAIM: claims pending entries idle > IDLE_MS, returns to us.
            cursor, claimed, deleted = r.xautoclaim(
                STREAM, GROUP, CONSUMER, min_idle_time=IDLE_MS,
                start_id=cursor, count=10,
            )
            for entry_id, fields in claimed:
                # Check delivery count via XPENDING.
                pending = r.xpending_range(STREAM, GROUP, min=entry_id, max=entry_id, count=1)
                delivery_count = pending[0]["times_delivered"] if pending else 0
                if delivery_count >= MAX_DELIVERY:
                    send_to_dlt(entry_id, fields, f"max_delivery_exceeded:{delivery_count}")
                    r.xack(STREAM, GROUP, entry_id)
                    continue
                if process_entry(entry_id, fields):
                    r.xack(STREAM, GROUP, entry_id)
            if not claimed:
                cursor = "0-0"                          # restart scan
        except redis.RedisError as e:
            log.error("autoclaim_failed", error=str(e))
        time.sleep(5.0)

# === Main consumer loop ===
_shutdown = False
def _on_signal(*_):
    global _shutdown; _shutdown = True
signal.signal(signal.SIGTERM, _on_signal)
signal.signal(signal.SIGINT, _on_signal)

# Start auto-claim in a background thread.
threading.Thread(target=auto_claim_loop, daemon=True, name="autoclaim").start()

while not _shutdown:
    resp = r.xreadgroup(GROUP, CONSUMER, {STREAM: ">"}, count=10, block=5000)
    if not resp:
        continue
    _, entries = resp[0]
    for entry_id, fields in entries:
        if process_entry(entry_id, fields):
            r.xack(STREAM, GROUP, entry_id)
        # On failure: leave PENDING; XAUTOCLAIM picks it up after IDLE_MS.

def _process_event(data: dict) -> None: ...

# Decision rule:
#   <100k msgs/s, single Redis OK         -> Redis Streams
#   >100k msgs/s, multi-broker, replay days -> Kafka (previous entry)
#   simple AMQP semantics                  -> aio-pika (next entry)
#   already have Redis                      -> Streams; one less dependency
#   need consumer groups                    -> XREADGROUP (NOT XREAD)
#   need acknowledgments                    -> XACK after processing
#   crash recovery                          -> XAUTOCLAIM with idle threshold
#   bounded memory                          -> MAXLEN ~N; XADD with maxlen=
#   compare with Kafka                      -> Streams = simpler ops, less throughput,
#                                                   less retention, single-Redis SPOF
#   need exactly-once                        -> Streams alone gives at-least-once;
#                                                add idempotency downstream
#   replay history                          -> create new consumer group, id="0"
#   poison message                           -> DLT stream + delivery_count check
#   trace propagation                       -> pack trace fields into stream entry
#   schema enforcement                       -> validate at consumer; no native schema reg
#   compaction (latest-only-per-key)        -> NOT supported; use Kafka log compaction
#   Redis Cluster                            -> hash tags ({key}) to keep entries on one shard
#
# Anti-pattern: forgetting MAXLEN on XADD. Streams grow unboundedly
# until Redis runs out of memory; the broker stops accepting writes
# and the producer pipeline stalls. Always XADD with maxlen=N
# (approximate=True is fine — slightly larger than N for performance).
# Or run XTRIM periodically. Without one, the stream is a memory leak
# disguised as a feature.
```

## Decision Rule

```text
<100k msgs/s, single Redis OK         -> Redis Streams
>100k msgs/s, multi-broker, replay days -> Kafka (previous entry)
simple AMQP semantics                  -> aio-pika (next entry)
already have Redis                      -> Streams; one less dependency
need consumer groups                    -> XREADGROUP (NOT XREAD)
need acknowledgments                    -> XACK after processing
crash recovery                          -> XAUTOCLAIM with idle threshold
bounded memory                          -> MAXLEN ~N; XADD with maxlen=
compare with Kafka                      -> Streams = simpler ops, less throughput,
                                                less retention, single-Redis SPOF
need exactly-once                        -> Streams alone gives at-least-once;
                                             add idempotency downstream
replay history                          -> create new consumer group, id="0"
poison message                           -> DLT stream + delivery_count check
trace propagation                       -> pack trace fields into stream entry
schema enforcement                       -> validate at consumer; no native schema reg
compaction (latest-only-per-key)        -> NOT supported; use Kafka log compaction
Redis Cluster                            -> hash tags ({key}) to keep entries on one shard
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting MAXLEN on XADD. Streams grow unboundedly
> until Redis runs out of memory; the broker stops accepting writes
> and the producer pipeline stalls. Always XADD with maxlen=N
> (approximate=True is fine — slightly larger than N for performance).
> Or run XTRIM periodically. Without one, the stream is a memory leak
> disguised as a feature.

## Tips

- Always use `XREADGROUP` (not `XREAD`) for production. Consumer groups give you parallel workers, acks, and pending-message tracking — `XREAD` alone is for simple replay.
- Set `MAXLEN ~N` on every `XADD` (or run periodic `XTRIM`). Without it, the stream grows unbounded until Redis OOMs and the entire pipeline stalls.
- `XAUTOCLAIM` (Redis 6.2+) is the right way to recover from crashed consumers. Run it in a background thread with `min_idle_time` matching your processing-time SLO.
- Use a delivery-count threshold: when `times_delivered >= MAX_DELIVERY`, move the message to a dead-letter stream (`events.dlt`) and ack it. Otherwise poison messages stall forever.
- Pack OTel trace context as `_trace.*` stream fields. Producer `inject(carrier)` + consumer `extract(carrier)` propagates the trace across the queue boundary.
- For Redis Cluster, use `{tag}` hash tags in the stream name (`events:{tenant-42}`) to keep stream entries on one shard. Cross-shard XREADGROUP doesn't work.

## Common Mistake

> [!warning] Calling `XADD` without `MAXLEN`. Streams grow indefinitely; Redis fills memory; broker stops accepting writes; producer pipeline stalls. Always `XADD ... maxlen=N` (approximate=True is fine — slightly larger than N for performance), OR run periodic `XTRIM`. Without one, your "stream" is a memory leak with extra steps.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Unbounded XADD — Redis OOMs eventually
r.xadd("events", {"data": ...})
```

**Senior:**
```python
# Capped at ~100k entries
r.xadd("events", {"data": ...}, maxlen=100_000, approximate=True)
```

## See Also

- [[Sections/messaging-queues/streams/kafka-py|confluent-kafka-python — Kafka producer / consumer with delivery guarantees (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/aio-pika-amqp|aio-pika — async RabbitMQ / AMQP with DLX and acks (Messaging & Queues)]]
- [[Sections/messaging-queues/streams/_Index|Messaging & Queues → Streams & Brokers — Kafka, Redis Streams, RabbitMQ]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]

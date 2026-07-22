---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "patterns"
id: "dead-letter-queues"
title: "Dead-letter queues — quarantine poison messages"
category: "Patterns"
subtitle: "max delivery threshold, DLQ topic / queue / stream, ops triage workflow, replay-after-fix, alert on DLQ growth, common per-broker setups"
signature_short: "if delivery_count >= MAX: send_to_dlq(msg, reason); ack(msg); else: nack/retry"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dead-letter queues — quarantine poison messages"
  - "dead-letter-queues"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Dead-letter queues — quarantine poison messages

> max delivery threshold, DLQ topic / queue / stream, ops triage workflow, replay-after-fix, alert on DLQ growth, common per-broker setups

## Overview

A poison message — one that always raises — without DLQ semantics loops forever (Celery retries 5×, Kafka redelivers, AMQP nack-requeue). Each broker has its own DLQ mechanism: Kafka uses a separate "dead-letter topic", AMQP has explicit Dead-Letter Exchange (DLX), Redis Streams uses a separate stream. The pattern is the same everywhere: track delivery count; after N attempts, route to DLQ; ack the original to free the queue. Ops triages the DLQ (often replay-after-fix). The three examples solve the SAME concrete task — a poison `process_order` message hits an unrecoverable error; instead of looping, it goes to a DLQ where ops can review, fix, replay — at three depths: per-broker DLQ setup → unified handler abstraction across brokers → production with monitoring (DLQ depth alerts), structured replay tooling, automatic re-classification on transient-error spike.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — When a process_order message fails 5 times, send it to a DLQ instead of looping forever.
- **Junior** — SAME — but as a unified abstraction so the consumer code doesn't change per broker, and ops gets a "replay this message after fix" command.
- **Senior** — SAME — production: DLQ depth alerting, replay-after-fix tooling, auto-classification (transient-spike protection), dashboard surfaces.

## Signature

```python
if delivery_count >= MAX: send_to_dlq(msg, reason); ack(msg); else: nack/retry
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - When a process_order message fails 5 times, send it to
#             a DLQ instead of looping forever.
# APPROACH  - Track delivery count via broker headers / message metadata.
# STRENGTHS - Per-broker setup is a few lines once you know the pattern.
# WEAKNESSES- One-off per broker; senior tier abstracts.

# === Kafka — DLT (dead-letter topic) ===
# When processing fails permanently:
#   producer.produce(topic="orders.dlt", key=msg.key(), value=msg.value(),
#                    headers=[("dlt.reason", str(exc).encode()),
#                             ("dlt.attempts", str(attempts).encode())])
#   consumer.commit(message=msg)        # ack the original

# === AMQP — Dead-Letter Exchange ===
# Declare the queue with x-dead-letter-exchange; nack(requeue=False)
# routes to the DLX automatically. (See aio-pika-amqp entry.)
#   queue = await ch.declare_queue("orders", durable=True,
#       arguments={"x-dead-letter-exchange": "orders.dlx"})

# === Redis Streams — separate DLT stream ===
# When processing fails permanently:
#   r.xadd("orders.dlt", {"data": msg["data"], "reason": str(exc)})
#   r.xack("orders", "group_name", msg_id)       # ack the original

# === Celery — DLQ task ===
# Routed to a different queue:
#   @app.task(queue="dlq")
#   def order_dlq(payload, error): log.error(...)
# When max retries exceeded, on_failure handler enqueues to dlq.

# === DLQ consumer (intro version) ===
# A second worker reads the DLQ and logs/stores for review.
import json, redis
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

def dlq_loop():
    while True:
        # XREADGROUP from orders.dlt; same shape as redis-streams entry.
        resp = r.xreadgroup("dlq-readers", "ops-1", {"orders.dlt": ">"},
                            count=10, block=5000)
        if not resp: continue
        for entry_id, fields in resp[0][1]:
            log_to_db(json.loads(fields["data"]), fields.get("reason", ""))
            r.xack("orders.dlt", "dlq-readers", entry_id)

def log_to_db(payload, reason): ...
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but as a unified abstraction so the consumer code
#             doesn't change per broker, and ops gets a "replay this
#             message after fix" command.
# APPROACH  - DLQHandler interface; per-broker implementations; replay
#             reads from DLQ, publishes to main, removes from DLQ.
# STRENGTHS- Consumer code is broker-agnostic; replay tooling is the
#             ops superpower.
# WEAKNESSES- Some semantic differences between brokers leak through
#             (Kafka retains; AMQP doesn't; pick the abstraction
#             carefully).
import abc, json, time
from typing import Any
import structlog

log = structlog.get_logger()

class DLQHandler(abc.ABC):
    """Send to DLQ; replay from DLQ. One per broker."""

    @abc.abstractmethod
    def send_to_dlq(self, *, payload: dict, original_topic: str,
                    delivery_count: int, error: str) -> None: ...

    @abc.abstractmethod
    def replay_from_dlq(self, *, dlq_message_id: str) -> None: ...

# Kafka implementation.
from confluent_kafka import Producer
class KafkaDLQ(DLQHandler):
    def __init__(self, producer: Producer):
        self.producer = producer

    def send_to_dlq(self, *, payload, original_topic, delivery_count, error):
        dlt_topic = f"{original_topic}.dlt"
        self.producer.produce(
            topic=dlt_topic,
            value=json.dumps(payload).encode(),
            headers=[
                ("dlt.original_topic", original_topic.encode()),
                ("dlt.delivery_count", str(delivery_count).encode()),
                ("dlt.reason", error.encode()),
                ("dlt.timestamp", str(int(time.time())).encode()),
            ],
        )
        self.producer.flush(timeout=5.0)
        log.warning("sent_to_dlt", topic=dlt_topic, error=error)

    def replay_from_dlq(self, *, dlq_message_id):
        # In Kafka, "replay" usually means consuming from the DLT and
        # producing to the original topic. Track which messages have
        # been replayed via offset commits.
        ...

# Redis Streams implementation.
import redis as redis_lib
class StreamsDLQ(DLQHandler):
    def __init__(self, r: redis_lib.Redis):
        self.r = r

    def send_to_dlq(self, *, payload, original_topic, delivery_count, error):
        dlt = f"{original_topic}.dlt"
        self.r.xadd(dlt, {
            "data": json.dumps(payload),
            "original": original_topic,
            "delivery_count": str(delivery_count),
            "reason": error,
            "ts": str(int(time.time())),
        }, maxlen=10000, approximate=True)
        log.warning("sent_to_dlt", stream=dlt, error=error)

    def replay_from_dlq(self, *, dlq_message_id):
        ...

# === Consumer using the abstraction ===
MAX_DELIVERIES = 5

def process_with_dlq(message: Any, dlq: DLQHandler, original_topic: str) -> None:
    delivery_count = _delivery_count_of(message)
    if delivery_count >= MAX_DELIVERIES:
        dlq.send_to_dlq(
            payload=_payload_of(message),
            original_topic=original_topic,
            delivery_count=delivery_count,
            error="max_deliveries_exceeded",
        )
        _ack(message)
        return

    try:
        _process(message)
    except _PermanentError as exc:
        dlq.send_to_dlq(
            payload=_payload_of(message),
            original_topic=original_topic,
            delivery_count=delivery_count,
            error=str(exc),
        )
        _ack(message)
        return
    except _TransientError:
        # Don't ack; let broker redeliver.
        return
    _ack(message)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: DLQ depth alerting, replay-after-fix
#             tooling, auto-classification (transient-spike protection),
#             dashboard surfaces.
# APPROACH  - Prometheus gauges for DLQ depth; CLI/script for replay;
#             "if transient errors spike >50% in 5 min, slow consumer
#             concurrency" auto-mitigation; runbook embedded.
# STRENGTHS - Poisoned messages are visible (alert on DLQ depth);
#             replay is one command; transient spikes don't burn DLQ.
# WEAKNESSES- Per-broker work to wire metrics + replay tooling.
import argparse, json, redis as redis_lib
from prometheus_client import Gauge, Counter
import structlog

log = structlog.get_logger()

DLQ_DEPTH    = Gauge("dlq_depth",    "Messages in DLQ", ["topic"])
DLQ_INFLOW   = Counter("dlq_inflow_total", "Messages sent to DLQ", ["topic", "reason"])
DLQ_REPLAYED = Counter("dlq_replayed_total","Messages replayed", ["topic"])

# === Periodic depth scrape (per stream / topic / queue) ===
def scrape_dlq_depth(r: redis_lib.Redis) -> None:
    """For Redis Streams; analogous calls exist for Kafka/AMQP."""
    for stream in ["orders.dlt", "payments.dlt", "emails.dlt"]:
        depth = r.xlen(stream)
        DLQ_DEPTH.labels(topic=stream).set(depth)

# Alert rule:
#   - alert: DLQDepthGrowing
#     expr: rate(dlq_inflow_total[5m]) > 0.1
#     for: 5m
#     labels: { severity: ticket }
#   - alert: DLQBacklogged
#     expr: dlq_depth > 100
#     for: 30m
#     labels: { severity: page }

# === Replay-after-fix tool ===
def replay_dlq(stream: str, *, dry_run: bool = True, limit: int = 100) -> int:
    """Read messages from DLQ stream, publish to original topic, ack DLQ.
    Run after fixing the bug that put them in DLQ."""
    r = redis_lib.Redis.from_url("redis://localhost:6379/0", decode_responses=True)
    original_topic = stream.removesuffix(".dlt")
    GROUP = "dlq-replayer"

    try:
        r.xgroup_create(stream, GROUP, id="0", mkstream=True)
    except redis_lib.ResponseError as e:
        if "BUSYGROUP" not in str(e): raise

    replayed = 0
    while replayed < limit:
        resp = r.xreadgroup(GROUP, "replayer-1", {stream: ">"}, count=10, block=2000)
        if not resp: break
        for entry_id, fields in resp[0][1]:
            payload = json.loads(fields["data"])
            log.info("replaying", stream=stream, entry_id=entry_id,
                     dry_run=dry_run, payload_keys=list(payload.keys()))
            if not dry_run:
                r.xadd(original_topic, {"data": fields["data"]})
                r.xack(stream, GROUP, entry_id)
                DLQ_REPLAYED.labels(topic=original_topic).inc()
            replayed += 1
    return replayed

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--stream",  required=True, help="DLQ stream (e.g. orders.dlt)")
    p.add_argument("--apply",   action="store_true", help="actually replay (default: dry run)")
    p.add_argument("--limit",   type=int, default=100)
    args = p.parse_args()
    n = replay_dlq(args.stream, dry_run=not args.apply, limit=args.limit)
    print(f"{'replayed' if args.apply else 'dry-run'}: {n} messages")

# === Auto-classification: transient-spike protection ===
# When transient errors spike (downstream API outage), we DON'T want
# to burn through retry budget and dump everything into DLQ. Pause
# the consumer for the spike duration instead.
class TransientSpikeDetector:
    """Tracks transient-error rate; pauses consumer if it exceeds threshold."""
    def __init__(self, *, window_s: int = 60, threshold: float = 0.5):
        self.window_s = window_s
        self.threshold = threshold
        self._failures: list[float] = []
        self._successes: list[float] = []

    def record_failure(self) -> None:
        import time
        self._failures.append(time.monotonic())
        self._trim()

    def record_success(self) -> None:
        import time
        self._successes.append(time.monotonic())
        self._trim()

    def should_pause(self) -> bool:
        total = len(self._failures) + len(self._successes)
        if total < 10: return False
        return len(self._failures) / total > self.threshold

    def _trim(self) -> None:
        import time
        cutoff = time.monotonic() - self.window_s
        self._failures   = [t for t in self._failures   if t > cutoff]
        self._successes  = [t for t in self._successes  if t > cutoff]

# === DLQ runbook (embed in repo) ===
# RUNBOOK: DLQ has messages
# 1. Identify the topic: alert tells you
# 2. Inspect: kubectl exec ... redis-cli xrange orders.dlt - + COUNT 10
# 3. Identify the failure pattern (look at "reason" header)
# 4. Fix the bug
# 5. Dry-run replay: python -m dlq_replay --stream orders.dlt
# 6. Apply: python -m dlq_replay --stream orders.dlt --apply --limit 100
# 7. Repeat in batches of 100 until empty
# 8. Confirm: alert resolves; xlen = 0

# Decision rule:
#   any at-least-once consumer            -> DLQ; never loop forever on poison
#   per-broker setup                       -> Kafka DLT, AMQP DLX, Streams .dlt stream, Celery DLQ task
#   max delivery threshold                 -> 3-5 typical; tune per task cost
#   alerting                                -> rate(dlq_inflow) AND dlq_depth gauge
#   replay tooling                          -> CLI + dry-run mode; ops uses post-fix
#   transient-error spike                   -> pause consumer; DON'T fill DLQ
#   permanent vs transient                  -> classify in the consumer (celery-retries entry)
#   business-level "soft" failure           -> may not warrant DLQ; just log
#   compliance / audit                      -> persist DLQ contents to long-term store
#   GDPR concerns                           -> redact payload before DLQ; key only
#
# Anti-pattern: ack immediately on permanent error and discard the
# payload. The bug is then unobservable — ops has no signal that
# anything broke; the message is lost. ALWAYS DLQ permanent failures
# so they show up in dashboards + can be replayed after fix.
```

## Decision Rule

```text
any at-least-once consumer            -> DLQ; never loop forever on poison
per-broker setup                       -> Kafka DLT, AMQP DLX, Streams .dlt stream, Celery DLQ task
max delivery threshold                 -> 3-5 typical; tune per task cost
alerting                                -> rate(dlq_inflow) AND dlq_depth gauge
replay tooling                          -> CLI + dry-run mode; ops uses post-fix
transient-error spike                   -> pause consumer; DON'T fill DLQ
permanent vs transient                  -> classify in the consumer (celery-retries entry)
business-level "soft" failure           -> may not warrant DLQ; just log
compliance / audit                      -> persist DLQ contents to long-term store
GDPR concerns                           -> redact payload before DLQ; key only
```

## Anti-Pattern

> [!warning] Anti-pattern
> ack immediately on permanent error and discard the
> payload. The bug is then unobservable — ops has no signal that
> anything broke; the message is lost. ALWAYS DLQ permanent failures
> so they show up in dashboards + can be replayed after fix.

## Tips

- Every at-least-once consumer needs DLQ semantics. Without them, a poison message loops forever (or fills retry budget) and blocks legitimate work.
- Per-broker patterns: Kafka uses a separate DLT topic; AMQP has explicit DLX (Dead-Letter Exchange); Redis Streams uses a separate `.dlt` stream; Celery routes to a DLQ task on a separate queue.
- Threshold of 3-5 delivery attempts is typical. Higher for cheap operations; lower for expensive ones (each retry burns broker capacity + downstream resources).
- Always alert on DLQ depth (`> 100`) AND inflow rate (`> 0.1/s for 5m`). Depth catches accumulating problems; inflow catches sudden bursts.
- Build a replay-after-fix CLI with `--dry-run` default. After fixing the bug, ops runs `--apply --limit 100` to drain the DLQ in chunks.
- For transient-error spikes (downstream API outage), DETECT the spike and PAUSE the consumer instead of burning through retries into DLQ. Resume when error rate drops.

## Common Mistake

> [!warning] Ack-and-discard on permanent errors: catch the exception, log a warning, ack the message, move on. The bug is unobservable — no signal in dashboards, no replay path, the data is lost. ALWAYS route permanent errors to a DLQ where they show up in monitoring AND can be replayed after the underlying bug is fixed.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Catch + log + ack — no record, no replay
try: process(msg)
except PermanentError as e:
    log.error("failed", error=str(e))
    msg.ack()
```

**Senior:**
```python
# DLQ + ack — observable, replayable
try: process(msg)
except PermanentError as e:
    dlq.send_to_dlq(payload=msg.payload, error=str(e))
    msg.ack()
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/messaging-queues/patterns/_Index|Messaging & Queues → Messaging Patterns — outbox, idempotency, dead-letter]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]

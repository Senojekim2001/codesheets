---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "patterns"
id: "outbox-pattern"
title: "Transactional outbox — publish events atomically with the DB write"
category: "Patterns"
subtitle: "outbox table, INSERT in same tx, separate publisher daemon, idempotent DELETE, debezium / pg-listen, exactly-once at the source"
signature_short: "INSERT INTO orders (...); INSERT INTO outbox (event_type, payload) VALUES (...);  -- same tx"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Transactional outbox — publish events atomically with the DB write"
  - "outbox-pattern"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Transactional outbox — publish events atomically with the DB write

> outbox table, INSERT in same tx, separate publisher daemon, idempotent DELETE, debezium / pg-listen, exactly-once at the source

## Overview

The classic distributed-systems bug: handler writes to DB, then publishes to Kafka. DB commits, broker is unreachable — the event is lost. Or: handler publishes first, DB write fails — the event references a row that doesn't exist. The fix is the **transactional outbox**: write the event to a database table (`outbox`) inside the SAME transaction as the business write. A separate publisher daemon polls or listens to the outbox, publishes to the broker, deletes on success. Atomicity is gained for free — the DB transaction guarantees both writes commit together. The three examples solve the SAME concrete task — when an order is placed, an `order_placed` event MUST reach Kafka if-and-only-if the order row commits — at three depths: outbox table + manual publish loop → publisher with retry/backoff and at-least-once semantics → production with Postgres LISTEN/NOTIFY for low-latency dispatch, Debezium CDC alternative, idempotent consumer pattern.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Order placement writes to DB AND publishes order_placed event atomically — neither happens without the other.
- **Junior** — SAME — but the publisher retries on broker failure, cleans up old published rows, and runs as a managed daemon instead of a polling loop.
- **Senior** — SAME — production: low-latency via Postgres LISTEN/NOTIFY so publisher reacts within ms instead of polling; CDC via Debezium as the alternative; observability + chaos tests.

## Signature

```python
INSERT INTO orders (...); INSERT INTO outbox (event_type, payload) VALUES (...);  -- same tx
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Order placement writes to DB AND publishes order_placed
#             event atomically — neither happens without the other.
# APPROACH  - Outbox table; INSERT inside the same tx; periodic
#             worker reads and publishes to Kafka.
# STRENGTHS - Eliminates "DB committed but message lost"; one DB
#             dependency, no two-phase commit needed.
# WEAKNESSES- Polling has latency (1-5s typical); junior tier adds
#             retry, senior moves to LISTEN/NOTIFY.

# Schema:
# CREATE TABLE outbox (
#   id           BIGSERIAL PRIMARY KEY,
#   event_type   TEXT NOT NULL,
#   payload      JSONB NOT NULL,
#   created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
#   published_at TIMESTAMPTZ
# );
# CREATE INDEX outbox_unpublished ON outbox (id) WHERE published_at IS NULL;

# === Handler — write order + outbox entry in ONE tx ===
from sqlalchemy.orm import Session
from sqlalchemy import text
import json

def place_order(session: Session, *, user_id: int, items: list[dict]) -> int:
    """Atomic: order row + outbox entry, or neither."""
    with session.begin():                              # one transaction
        result = session.execute(
            text("INSERT INTO orders (user_id, items) VALUES (:u, :i) RETURNING id"),
            {"u": user_id, "i": json.dumps(items)},
        )
        order_id = result.scalar_one()
        session.execute(
            text("""INSERT INTO outbox (event_type, payload)
                    VALUES (:t, :p)"""),
            {"t": "order_placed",
             "p": json.dumps({"order_id": order_id, "user_id": user_id, "items": items})},
        )
        return order_id

# === Publisher worker — reads outbox, publishes, marks published ===
import time
from confluent_kafka import Producer

producer = Producer({"bootstrap.servers": "localhost:9092"})

def publish_outbox_loop(session: Session) -> None:
    while True:
        with session.begin():
            rows = session.execute(text("""
                SELECT id, event_type, payload FROM outbox
                WHERE published_at IS NULL
                ORDER BY id
                LIMIT 100
                FOR UPDATE SKIP LOCKED
            """)).all()

            for row in rows:
                producer.produce(
                    topic=row.event_type,
                    value=json.dumps(row.payload).encode(),
                )
            producer.flush(timeout=5.0)

            if rows:
                ids = [r.id for r in rows]
                session.execute(
                    text("UPDATE outbox SET published_at = now() WHERE id = ANY(:ids)"),
                    {"ids": ids},
                )

        time.sleep(1.0)                                # poll every 1s

# Why FOR UPDATE SKIP LOCKED:
#   Multiple publisher workers can run; each grabs a different batch.
#   No double-publish; no contention on the lock.
# Why ORDER BY id:
#   Events publish in roughly the order they were created.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but the publisher retries on broker failure,
#             cleans up old published rows, and runs as a managed
#             daemon instead of a polling loop.
# APPROACH  - delivery callback verifies broker ack before marking
#             published; periodic GC deletes published rows older
#             than N days; structured logging.
# STRENGTHS- At-least-once delivery (broker outage just delays);
#             outbox table doesn't grow forever.
# WEAKNESSES- Still polls; consumers must dedupe (idempotency-keys
#             entry).
import json, time, signal, structlog
from sqlalchemy import text
from sqlalchemy.orm import Session, sessionmaker
from confluent_kafka import Producer

log = structlog.get_logger()

producer = Producer({
    "bootstrap.servers":  "localhost:9092",
    "acks":               "all",
    "enable.idempotence": True,
})

class OutboxPublisher:
    def __init__(self, session_factory: sessionmaker):
        self._sf = session_factory
        self._stop = False

    def stop(self) -> None:
        self._stop = True

    def run(self) -> None:
        signal.signal(signal.SIGTERM, lambda *_: self.stop())
        signal.signal(signal.SIGINT,  lambda *_: self.stop())

        while not self._stop:
            published = self._publish_batch()
            if published == 0:
                time.sleep(1.0)
            else:
                # Run GC every ~1000 published rows.
                if published % 1000 < 100:
                    self._gc_old()

    def _publish_batch(self) -> int:
        delivered_ids: list[int] = []
        with self._sf() as session, session.begin():
            rows = session.execute(text("""
                SELECT id, event_type, payload FROM outbox
                WHERE published_at IS NULL
                ORDER BY id LIMIT 100
                FOR UPDATE SKIP LOCKED
            """)).all()
            if not rows:
                return 0

            for row in rows:
                # Per-message delivery callback tracks success.
                producer.produce(
                    topic=row.event_type,
                    value=json.dumps(row.payload).encode(),
                    on_delivery=self._make_delivery_cb(row.id, delivered_ids),
                )
            producer.flush(timeout=10.0)

            # Mark only successfully-delivered messages.
            if delivered_ids:
                session.execute(
                    text("UPDATE outbox SET published_at = now() WHERE id = ANY(:ids)"),
                    {"ids": delivered_ids},
                )
                log.info("outbox_published", count=len(delivered_ids))
            return len(delivered_ids)

    def _make_delivery_cb(self, row_id: int, delivered_ids: list[int]):
        def _cb(err, msg):
            if err:
                log.error("kafka_publish_failed", row_id=row_id, error=str(err))
            else:
                delivered_ids.append(row_id)
        return _cb

    def _gc_old(self) -> None:
        with self._sf() as session, session.begin():
            n = session.execute(text("""
                DELETE FROM outbox
                WHERE published_at < now() - INTERVAL '7 days'
            """)).rowcount
            if n: log.info("outbox_gc", deleted=n)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: low-latency via Postgres LISTEN/NOTIFY
#             so publisher reacts within ms instead of polling; CDC
#             via Debezium as the alternative; observability + chaos
#             tests.
# APPROACH  - Trigger emits NOTIFY on outbox INSERT; publisher subscribes
#             via psycopg's async LISTEN; falls back to polling if the
#             connection drops.
# STRENGTHS - End-to-end latency in tens of milliseconds (vs poll
#             interval seconds); doesn't load DB during quiet periods.
# WEAKNESSES- LISTEN/NOTIFY isn't durable across the listener's
#             connection drops — combine with periodic poll as backstop.
# === Schema additions ===
# CREATE OR REPLACE FUNCTION outbox_notify() RETURNS trigger AS $$
# BEGIN
#   PERFORM pg_notify('outbox_event', NEW.id::text);
#   RETURN NEW;
# END;
# $$ LANGUAGE plpgsql;
#
# CREATE TRIGGER outbox_notify_trigger
#   AFTER INSERT ON outbox
#   FOR EACH ROW EXECUTE PROCEDURE outbox_notify();

# === Async listener ===
import asyncio, json, signal
import psycopg
from psycopg.rows import dict_row
import structlog
from confluent_kafka import Producer

log = structlog.get_logger()
producer = Producer({"bootstrap.servers": "localhost:9092",
                     "acks": "all", "enable.idempotence": True})

class LiveOutboxPublisher:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self._stop = asyncio.Event()

    async def run(self) -> None:
        # Two concurrent loops: LISTEN for fast path, periodic for safety.
        await asyncio.gather(
            self._listen_loop(),
            self._poll_backstop(),
        )

    async def _listen_loop(self) -> None:
        while not self._stop.is_set():
            try:
                async with await psycopg.AsyncConnection.connect(
                    self.dsn, autocommit=True
                ) as conn:
                    async with conn.cursor() as cur:
                        await cur.execute("LISTEN outbox_event")
                    log.info("listening_for_outbox_events")
                    async for notify in conn.notifies():
                        if self._stop.is_set(): break
                        await self._publish_batch(conn)
            except Exception as e:
                log.error("listen_loop_error", error=str(e))
                await asyncio.sleep(1.0)               # reconnect with backoff

    async def _poll_backstop(self) -> None:
        """Polls every 30s as a backstop in case LISTEN was missed."""
        while not self._stop.is_set():
            await asyncio.sleep(30.0)
            try:
                async with await psycopg.AsyncConnection.connect(self.dsn) as conn:
                    await self._publish_batch(conn)
            except Exception as e:
                log.error("poll_backstop_error", error=str(e))

    async def _publish_batch(self, conn) -> None:
        delivered_ids: list[int] = []
        async with conn.transaction():
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute("""
                    SELECT id, event_type, payload FROM outbox
                    WHERE published_at IS NULL
                    ORDER BY id LIMIT 100
                    FOR UPDATE SKIP LOCKED
                """)
                rows = await cur.fetchall()
                if not rows: return

                for row in rows:
                    producer.produce(
                        topic=row["event_type"],
                        value=json.dumps(row["payload"]).encode(),
                        on_delivery=lambda err, msg, _id=row["id"]:
                            None if err else delivered_ids.append(_id),
                    )
                producer.poll(0)
                producer.flush(timeout=10.0)

                if delivered_ids:
                    await cur.execute(
                        "UPDATE outbox SET published_at = now() WHERE id = ANY(%s)",
                        (delivered_ids,),
                    )
                    log.info("outbox_published", count=len(delivered_ids))

# Decision rule:
#   strict atomicity: DB write + event       -> outbox table; INSERT in same tx
#   DB committed but event lost is OK         -> publish-then-write (rare)
#   broker is the source of truth             -> NOT outbox; use DB CDC (Debezium)
#   Debezium / Maxwell available              -> CDC reads WAL directly; no app code change
#   low latency requirement                    -> LISTEN/NOTIFY + polling backstop
#   high event volume (>10k/s)                 -> CDC; outbox table I/O becomes bottleneck
#   multiple consumers per event              -> consumer groups on the broker; outbox is single-source
#   idempotent consumers                       -> required; outbox is at-least-once (idempotency-keys entry)
#   gc / retention                             -> DELETE WHERE published_at < now() - INTERVAL '7 days'
#   need ordering across events               -> ORDER BY id; one publisher process; OR Kafka partition by entity
#   monitoring                                 -> alert on outbox lag (oldest unpublished_at)
#
# Anti-pattern: try { db.commit(); broker.send() }. The two are not
# atomic; broker outage between them = lost event with no record.
# Outbox makes this a single tx — atomic by construction. The
# alternative (CDC via Debezium reading the DB WAL) is even better
# for high volume but requires more infrastructure.
```

## Decision Rule

```text
strict atomicity: DB write + event       -> outbox table; INSERT in same tx
DB committed but event lost is OK         -> publish-then-write (rare)
broker is the source of truth             -> NOT outbox; use DB CDC (Debezium)
Debezium / Maxwell available              -> CDC reads WAL directly; no app code change
low latency requirement                    -> LISTEN/NOTIFY + polling backstop
high event volume (>10k/s)                 -> CDC; outbox table I/O becomes bottleneck
multiple consumers per event              -> consumer groups on the broker; outbox is single-source
idempotent consumers                       -> required; outbox is at-least-once (idempotency-keys entry)
gc / retention                             -> DELETE WHERE published_at < now() - INTERVAL '7 days'
need ordering across events               -> ORDER BY id; one publisher process; OR Kafka partition by entity
monitoring                                 -> alert on outbox lag (oldest unpublished_at)
```

## Anti-Pattern

> [!warning] Anti-pattern
> try { db.commit(); broker.send() }. The two are not
> atomic; broker outage between them = lost event with no record.
> Outbox makes this a single tx — atomic by construction. The
> alternative (CDC via Debezium reading the DB WAL) is even better
> for high volume but requires more infrastructure.

## Tips

- Outbox INSERT goes inside the SAME transaction as the business write. The DB's atomicity guarantee is what eliminates the "DB committed, broker dead, event lost" race.
- Use `FOR UPDATE SKIP LOCKED` on the outbox SELECT so multiple publisher workers can run in parallel without contending or double-publishing.
- Postgres `LISTEN/NOTIFY` cuts publish latency from poll-interval (1-5s) to ~10ms. Trigger emits `pg_notify` on outbox INSERT; publisher's async connection wakes immediately.
- Always pair LISTEN/NOTIFY with a periodic poll backstop. NOTIFY is delivered only to currently-connected listeners; if the connection drops mid-burst, those notifications are lost.
- For >10k events/s, the outbox table itself becomes a bottleneck. Switch to Debezium CDC — it reads the Postgres WAL directly with no application changes.
- GC published rows: `DELETE FROM outbox WHERE published_at < now() - INTERVAL '7 days'`. Without GC, the table grows forever and queries slow.

## Common Mistake

> [!warning] `db.commit(); broker.send()` (or the reverse). Neither order is atomic — a crash between the two leaves them inconsistent (DB has order, broker doesn't, OR broker has event, DB doesn't). The outbox table makes both writes happen in one DB transaction; a separate process forwards to the broker.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Two non-atomic writes — broker outage = lost event
session.commit()
producer.send("order_placed", payload)
```

**Senior:**
```python
# Atomic via outbox table
with session.begin():
    session.add(order)
    session.add(OutboxEvent(type="order_placed", payload=payload))
# Background publisher reads outbox, sends to Kafka, marks published.
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/messaging-queues/patterns/_Index|Messaging & Queues → Messaging Patterns — outbox, idempotency, dead-letter]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]

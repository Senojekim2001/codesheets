---
type: "file-index"
domain: "python"
file: "messaging-queues"
title: "Messaging & Queues"
tags:
  - "python"
  - "python/messaging-queues"
  - "index"
---

# Messaging & Queues

> 9 entries across 3 sections.

## Celery — task queues, retries, scheduling · 3

- [[Sections/messaging-queues/celery/celery-tasks|Celery tasks — define, enqueue, retrieve results]] — Run work asynchronously: web handler returns immediately; a Celery worker processes the task in the background. The default task queue for Python services.
- [[Sections/messaging-queues/celery/celery-retries|Celery retries — backoff, dead-letter, idempotency]] — Transient failures (mail server down, rate limit) should retry with exponential backoff; permanent failures (bad input, schema error) should NOT retry; max-retries-exceeded should route to a dead-letter queue. The pattern that makes async work resilient.
- [[Sections/messaging-queues/celery/celery-routing-beat|Celery routing & beat — queues, priorities, scheduled tasks]] — Route tasks to dedicated workers via queues; tune per-queue concurrency; schedule recurring tasks via Celery beat. The shape of a multi-queue Celery deployment.

## Streams & Brokers — Kafka, Redis Streams, RabbitMQ · 3

- [[Sections/messaging-queues/streams/kafka-py|confluent-kafka-python — Kafka producer / consumer with delivery guarantees]] — Produce + consume Kafka events from Python via the C-backed confluent-kafka library (the fast, official one). Consumer groups for parallelism; manual offset commits for at-least-once; Schema Registry for typed payloads.
- [[Sections/messaging-queues/streams/redis-streams|Redis Streams — XADD / XREADGROUP, lighter than Kafka]] — Redis Streams (5.0+) gives you persistent log + consumer groups + acknowledgments — Kafka semantics on a single Redis. Right choice when you already have Redis and don't need Kafka's scale.
- [[Sections/messaging-queues/streams/aio-pika-amqp|aio-pika — async RabbitMQ / AMQP with DLX and acks]] — Async AMQP client for RabbitMQ. Topic exchanges for routing-key fan-out, dead-letter exchanges (DLX) for poison messages, manual acks for at-least-once. The right choice when you need full AMQP semantics in async code.

## Messaging Patterns — outbox, idempotency, dead-letter · 3

- [[Sections/messaging-queues/patterns/outbox-pattern|Transactional outbox — publish events atomically with the DB write]] — Write the event to an `outbox` table in the SAME transaction as the business write; a separate process publishes from the outbox to the broker and deletes on success. Eliminates the "DB committed but message lost" failure mode.
- [[Sections/messaging-queues/patterns/idempotency-keys|Idempotency keys — make at-least-once safe to redeliver]] — At-least-once messaging means duplicates. Caller-supplied idempotency_key + Redis SETNX claim ensures the second delivery is a no-op. The pattern that turns "duplicates possible" into "duplicates harmless".
- [[Sections/messaging-queues/patterns/dead-letter-queues|Dead-letter queues — quarantine poison messages]] — After N delivery attempts, a message goes to a DLQ instead of looping forever. Ops triages from the DLQ; a replay-after-fix path returns messages to the main queue. The pattern that keeps poison from clogging the pipeline.

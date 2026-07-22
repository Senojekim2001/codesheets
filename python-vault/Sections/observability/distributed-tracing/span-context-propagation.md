---
type: "entry"
domain: "python"
file: "observability"
section: "distributed-tracing"
id: "span-context-propagation"
title: "Span context propagation — across async, threads, queues"
category: "Distributed Tracing"
subtitle: "TraceContextTextMapPropagator, inject/extract, contextvars (asyncio), context.copy (threads), Celery headers, Kafka message headers, baggage"
signature_short: "inject(carrier=request.headers); ctx = extract(carrier=incoming_headers); with use_context(ctx): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Span context propagation — across async, threads, queues"
  - "span-context-propagation"
tags:
  - "python"
  - "python/observability"
  - "python/observability/distributed-tracing"
  - "category/distributed-tracing"
  - "tier/tiered"
---

# Span context propagation — across async, threads, queues

> TraceContextTextMapPropagator, inject/extract, contextvars (asyncio), context.copy (threads), Celery headers, Kafka message headers, baggage

## Overview

A trace is only useful if it stays connected across the asynchronous and inter-service boundaries that real systems run through. Across asyncio Tasks, OTel propagation is automatic (it rides on contextvars). Across threads, you copy the context explicitly. Across queues (Celery, Kafka, RabbitMQ), you serialize the context into the message headers at the producer and extract it at the consumer. Baggage carries cross-cutting tags (tenant_id, deployment.zone) along with the trace, surviving every hop. The three examples solve the SAME concrete task — a request enters service A, enqueues a Celery task, which calls service B; the trace shows A → task → B as one connected tree — at three depths: extract+inject manually for one hop → propagation across asyncio + thread pools + httpx → Celery + Kafka headers + baggage for cross-cutting tags + the propagation pitfalls (sampling skew, queue retention, unsampled-but-still-propagated traces).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Service A makes an HTTP call to service B; the span tree shows A's request span as the parent of B's request span.
- **Junior** — SAME — but propagate across asyncio Tasks (free) AND thread pools (manual), and verify httpx auto-instrumentation handles outbound for us.
- **Senior** — SAME — production: trace flows across Celery (RabbitMQ), Kafka, and a custom queue. Use baggage to attach cross-cutting tags (tenant_id) that follow the trace through every hop.

## Signature

```python
inject(carrier=request.headers); ctx = extract(carrier=incoming_headers); with use_context(ctx): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Service A makes an HTTP call to service B; the span tree
#             shows A's request span as the parent of B's request span.
# APPROACH  - inject() writes traceparent into outbound headers;
#             extract() reads it on the receiving side; use_context()
#             makes the extracted context current for new spans.
# STRENGTHS - Smallest correct example of cross-service tracing;
#             uses W3C standard (traceparent) — works to any language.
# WEAKNESSES- Manual; HTTPX/requests instrumentations do this for you
#             (see otel-instrumentation entry).
import requests
from opentelemetry import trace, context
from opentelemetry.propagate import inject, extract

tracer = trace.get_tracer(__name__)

# --- Producer (service A) ---
def call_b(widget_id: int) -> dict:
    headers: dict[str, str] = {}
    with tracer.start_as_current_span("call_b") as span:
        span.set_attribute("widget_id", widget_id)
        # Write traceparent (and tracestate) into the outbound headers.
        inject(headers)
        # headers now contains: {"traceparent": "00-<trace_id>-<span_id>-01"}
        return requests.get(f"https://b/widget/{widget_id}", headers=headers).json()

# --- Consumer (service B) ---
def handle_request(incoming_headers: dict[str, str]) -> dict:
    # Extract returns a Context that knows the parent span info.
    ctx = extract(incoming_headers)
    # Use the parent context so our new span becomes its child.
    with tracer.start_as_current_span("get_widget", context=ctx) as span:
        span.set_attribute("widget_id", 42)
        return {"widget_id": 42}

# Result in tracing UI:
#   call_b (service A)
#     └─ get_widget (service B)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but propagate across asyncio Tasks (free) AND
#             thread pools (manual), and verify httpx auto-instrumentation
#             handles outbound for us.
# APPROACH  - asyncio: contextvars carry the current span context to every
#             task spawned from this one — no action needed. Threads:
#             use otel_context.copy_context() to capture; restore with
#             attach() in the worker.
# STRENGTHS- Connected traces across the patterns most services use:
#             async handlers, background tasks, threadpool fan-outs.
# WEAKNESSES- run_in_executor without copying context = orphan spans;
#             wrap your submit() to never forget.
import asyncio
from concurrent.futures import ThreadPoolExecutor
from opentelemetry import trace, context
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
import httpx

tracer = trace.get_tracer(__name__)

# httpx instrumentation handles outbound traceparent injection automatically
# (no manual inject() call needed when this is installed).
HTTPXClientInstrumentor().instrument()

# 1) asyncio — context propagates automatically.
async def fetch_async(url: str) -> str:
    with tracer.start_as_current_span("fetch", attributes={"url": url}):
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)              # outbound traceparent set automatically
            return resp.text

async def main_async():
    with tracer.start_as_current_span("parent"):
        # asyncio.create_task copies the current context; child span is parented correctly.
        results = await asyncio.gather(
            fetch_async("https://a/"),
            fetch_async("https://b/"),
        )

# 2) Thread pool — manual context.copy_context to capture, attach in worker.
executor = ThreadPoolExecutor(max_workers=4)

def in_worker(label: str) -> None:
    # Without context.attach in the wrapping submit, the span here would
    # be orphaned (trace tree breaks).
    with tracer.start_as_current_span(f"work/{label}"):
        pass

def submit_traced(fn, *args, **kwargs):
    """Wraps executor.submit; preserves the calling thread's OTel context."""
    ctx = context.get_current()
    def runner():
        token = context.attach(ctx)
        try:
            return fn(*args, **kwargs)
        finally:
            context.detach(token)
    return executor.submit(runner)

def fan_out():
    with tracer.start_as_current_span("fan_out"):
        futures = [submit_traced(in_worker, f"job-{i}") for i in range(4)]
        for f in futures:
            f.result()

# Trace tree:
#   parent
#     ├─ fetch (https://a/)
#     │   └─ HTTP GET (auto from HTTPXClientInstrumentor)
#     └─ fetch (https://b/)
#         └─ HTTP GET
#   fan_out
#     ├─ work/job-0
#     ├─ work/job-1
#     ├─ work/job-2
#     └─ work/job-3
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: trace flows across Celery (RabbitMQ),
#             Kafka, and a custom queue. Use baggage to attach
#             cross-cutting tags (tenant_id) that follow the trace
#             through every hop.
# APPROACH  - Celery: opentelemetry-instrumentation-celery handles
#             producer + worker. Kafka: serialize headers with
#             TraceContextTextMapPropagator on send; extract on receive.
#             Baggage via opentelemetry.baggage adds key/value pairs
#             that propagate but don't appear on spans by default.
# STRENGTHS- The trace tree stays connected through every queue;
#             tenant_id rides every hop without an arg in every call.
# WEAKNESSES- Queue retention can hold stale span context; a message
#             enqueued 6 hours ago will look like a single 6-hour trace
#             unless you reset at the consumer for messages older than
#             a threshold.
import os
from opentelemetry import trace, baggage, context
from opentelemetry.propagate import inject, extract
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator

tracer = trace.get_tracer(__name__)

# 1) Celery — install + auto-propagation.
#    pip install opentelemetry-instrumentation-celery
from opentelemetry.instrumentation.celery import CeleryInstrumentor
CeleryInstrumentor().instrument()                     # producer + worker spans, traceparent in headers

# Now any task call propagates context:
# from celery import Celery
# app = Celery("...", broker="...")
# @app.task
# def process(uid: int): ...
# def handle_request():
#     with tracer.start_as_current_span("handle_request"):
#         process.delay(uid)                          # producer span; traceparent in message
# # Worker logs trace shows process.delay -> celery.run -> process body all connected.

# 2) Kafka — manual injection on the producer side.
def kafka_send(producer, topic: str, key: bytes, value: bytes) -> None:
    with tracer.start_as_current_span(
        f"kafka.send {topic}",
        attributes={"messaging.system": "kafka", "messaging.destination": topic},
    ):
        # Carry: list of (str_key, bytes_value) for kafka headers.
        carrier: dict[str, str] = {}
        TraceContextTextMapPropagator().inject(carrier)
        W3CBaggagePropagator().inject(carrier)         # also propagate baggage
        headers = [(k, v.encode()) for k, v in carrier.items()]
        producer.send(topic, key=key, value=value, headers=headers)

def kafka_consumer_loop(consumer):
    for msg in consumer:
        # Extract from kafka headers (decode bytes -> str).
        carrier = {k: v.decode() for k, v in (msg.headers or [])}
        ctx = TraceContextTextMapPropagator().extract(carrier)
        ctx = W3CBaggagePropagator().extract(carrier, ctx)
        token = context.attach(ctx)
        try:
            with tracer.start_as_current_span(
                f"kafka.process {msg.topic}",
                attributes={"messaging.system": "kafka",
                            "messaging.destination": msg.topic},
            ):
                handle_message(msg.value)
        finally:
            context.detach(token)

# 3) Baggage — tenant_id rides through every hop.
def with_tenant(tenant_id: str):
    """Set tenant in baggage; propagates across all subsequent spans + hops."""
    return baggage.set_baggage("tenant_id", tenant_id)

def request_handler(req):
    # Producer side — set baggage; subsequent spans + outbound calls carry it.
    ctx = with_tenant(req.headers["x-tenant-id"])
    token = context.attach(ctx)
    try:
        with tracer.start_as_current_span("handle"):
            # Anywhere downstream:
            tid = baggage.get_baggage("tenant_id")     # "acme"
            # Optionally promote to a span attribute for easy querying:
            trace.get_current_span().set_attribute("tenant_id", tid)
            kafka_send(producer, "orders", b"k", b"v")  # baggage propagates
    finally:
        context.detach(token)

def handle_message(payload: bytes) -> None: ...        # placeholder

# 4) Stale-message guard — drop or reset context for old messages.
def fresh_context_or_new(msg, *, max_age_s: int = 300):
    age = time.time() - msg.timestamp
    if age > max_age_s:
        # Don't tie a 6-hour trace to a fresh root; start a new trace,
        # link to the old one for context.
        ctx = TraceContextTextMapPropagator().extract({k: v.decode() for k, v in (msg.headers or [])})
        old_span_ctx = trace.get_current_span(ctx).get_span_context()
        return None, [trace.Link(old_span_ctx)]
    return TraceContextTextMapPropagator().extract({k: v.decode() for k, v in (msg.headers or [])}), []

import time

# Decision rule:
#   asyncio Tasks                   -> automatic (contextvars); no code needed
#   thread pools                    -> wrap submit; context.attach in worker
#   Celery                          -> opentelemetry-instrumentation-celery; auto producer + worker
#   Kafka / RabbitMQ raw            -> inject on send, extract on receive; use TraceContext propagator
#   custom transport                -> inject(carrier) into your wire format; extract on receive
#   tenant_id in every span         -> baggage.set_baggage("tenant_id", id) — rides automatically
#   need value in span attributes    -> baggage.get_baggage(key) + span.set_attribute (baggage isn't auto-tagged)
#   message older than X            -> start NEW trace with trace.Link to the old one
#   propagator format incompat      -> set OTEL_PROPAGATORS=tracecontext,baggage,b3multi (multiple)
#   non-OTel upstream                -> add b3 or jaeger propagator to OTEL_PROPAGATORS list
#   tests across processes           -> InMemorySpanExporter on both sides; assert parent/child ids match
#
# Anti-pattern: assuming queue messages older than the trace TTL still
# belong in the same trace. A message enqueued 6 hours ago, processed
# now, will show as a 6-hour-long parent span — and many tracing UIs
# will refuse to display it. Cap message age (1-5 min); for older
# messages, start a fresh trace with trace.Link pointing at the old
# context. The link preserves the relationship; the trace doesn't pretend
# the work happened all at once.
```

## Decision Rule

```text
asyncio Tasks                   -> automatic (contextvars); no code needed
thread pools                    -> wrap submit; context.attach in worker
Celery                          -> opentelemetry-instrumentation-celery; auto producer + worker
Kafka / RabbitMQ raw            -> inject on send, extract on receive; use TraceContext propagator
custom transport                -> inject(carrier) into your wire format; extract on receive
tenant_id in every span         -> baggage.set_baggage("tenant_id", id) — rides automatically
need value in span attributes    -> baggage.get_baggage(key) + span.set_attribute (baggage isn't auto-tagged)
message older than X            -> start NEW trace with trace.Link to the old one
propagator format incompat      -> set OTEL_PROPAGATORS=tracecontext,baggage,b3multi (multiple)
non-OTel upstream                -> add b3 or jaeger propagator to OTEL_PROPAGATORS list
tests across processes           -> InMemorySpanExporter on both sides; assert parent/child ids match
```

## Anti-Pattern

> [!warning] Anti-pattern
> assuming queue messages older than the trace TTL still
> belong in the same trace. A message enqueued 6 hours ago, processed
> now, will show as a 6-hour-long parent span — and many tracing UIs
> will refuse to display it. Cap message age (1-5 min); for older
> messages, start a fresh trace with trace.Link pointing at the old
> context. The link preserves the relationship; the trace doesn't pretend
> the work happened all at once.

## Tips

- Across asyncio Tasks, OTel context rides on contextvars — propagation is automatic. `asyncio.create_task`, `asyncio.gather`, `asyncio.TaskGroup` all preserve the context.
- For `ThreadPoolExecutor`, capture the current context with `context.get_current()` before submit and `context.attach()` it inside the worker. Without this, spans in workers are orphaned (no trace parent).
- For Celery, install `opentelemetry-instrumentation-celery` — it propagates traceparent through the broker headers automatically. The producer's `task.delay()` becomes a span; the worker's task execution becomes a child span.
- For Kafka/RabbitMQ raw, use `TraceContextTextMapPropagator().inject(carrier)` on the producer side; `extract(carrier)` on the consumer. Carrier is a string-keyed dict; convert to/from bytes for Kafka headers.
- Baggage (`baggage.set_baggage("tenant_id", "acme")`) rides with the trace context through every hop and is queryable downstream — but values are NOT auto-promoted to span attributes. If you want them queryable in the tracing UI, also call `span.set_attribute("tenant_id", baggage.get_baggage("tenant_id"))`.
- For messages older than the trace TTL (>1-5 minutes), start a NEW trace at the consumer with `trace.Link` pointing at the old context. Otherwise the consumer span becomes part of a hours-long trace that most UIs refuse to render.

## Common Mistake

> [!warning] Submitting work to a ThreadPoolExecutor (or any background thread) without copying the OTel context. The worker's spans have no parent; the trace tree breaks; the tracing UI shows orphan spans with no connection to the originating request. Always wrap submit with a helper that captures `context.get_current()` and `context.attach()`-es it inside the worker.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Threadpool work — context lost; trace tree breaks
executor.submit(do_work, arg)
```

**Senior:**
```python
# Threadpool work — context preserved
ctx = context.get_current()
executor.submit(lambda: (context.attach(ctx), do_work(arg)))
```

## See Also

- [[Sections/observability/distributed-tracing/otel-tracing-setup|OpenTelemetry tracing — SDK setup, spans, exporters (Observability)]]
- [[Sections/observability/distributed-tracing/otel-instrumentation|OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis (Observability)]]
- [[Sections/observability/distributed-tracing/_Index|Observability → Distributed Tracing — OpenTelemetry, instrumentation, propagation]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

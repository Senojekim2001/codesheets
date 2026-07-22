---
type: "entry"
domain: "python"
file: "observability"
section: "distributed-tracing"
id: "otel-tracing-setup"
title: "OpenTelemetry tracing — SDK setup, spans, exporters"
category: "Distributed Tracing"
subtitle: "TracerProvider, tracer.start_as_current_span, BatchSpanProcessor, OTLPSpanExporter, Resource (service.name), TraceIdRatioBased, ParentBased"
signature_short: "with tracer.start_as_current_span(\"op\", attributes={\"http.method\": \"GET\"}) as span: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OpenTelemetry tracing — SDK setup, spans, exporters"
  - "otel-tracing-setup"
tags:
  - "python"
  - "python/observability"
  - "python/observability/distributed-tracing"
  - "category/distributed-tracing"
  - "tier/tiered"
---

# OpenTelemetry tracing — SDK setup, spans, exporters

> TracerProvider, tracer.start_as_current_span, BatchSpanProcessor, OTLPSpanExporter, Resource (service.name), TraceIdRatioBased, ParentBased

## Overview

OpenTelemetry is the vendor-neutral standard for distributed tracing — replacing service-specific clients (Jaeger, Zipkin, Datadog APM) with one SDK that exports to any OTLP-compatible collector. The Python SDK splits cleanly: a TracerProvider holds configuration; tracers create spans; a SpanProcessor batches and ships them; an Exporter sends them somewhere (Jaeger, Honeycomb, Tempo, Datadog, or stdout for dev). The three examples solve the SAME concrete task — a service's `/place_order` handler emits a span with metadata so it shows up in the tracing UI — at three depths: Console exporter for local dev → OTLP exporter to a collector with resource attributes and semantic conventions → production-grade with sampling, exception recording, span limits, environment-driven config, and graceful shutdown on SIGTERM.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A handler emits a span so it shows up in the tracing UI with name, duration, and a few attributes.
- **Junior** — SAME — but ship to a real collector (Jaeger/Honeycomb/Tempo), tag with service.name, follow OTel semantic conventions for HTTP attributes.
- **Senior** — SAME — production-grade: head sampling at 10%, parent-based so a sampled upstream forces sampling here, exception recording on spans, graceful shutdown flushes pending spans on SIGTERM, span limits to bound memory.

## Signature

```python
with tracer.start_as_current_span("op", attributes={"http.method": "GET"}) as span: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A handler emits a span so it shows up in the tracing UI
#             with name, duration, and a few attributes.
# APPROACH  - TracerProvider + ConsoleSpanExporter; tracer.start_as_current_span
#             wraps the work; set_attribute records metadata.
# STRENGTHS - Smallest possible setup; visible in stdout immediately;
#             no collector required to verify the SDK is wired up.
# WEAKNESSES- Console output isn't a tracing UI; ship to OTLP for the
#             real flame view (see junior tier).
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor, ConsoleSpanExporter,
)

# 1) Configure once at process startup.
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)

# 2) Get a tracer per logical module/component.
tracer = trace.get_tracer("orders.handler")

# 3) Wrap the work.
def place_order(user_id: int, amount: int) -> str:
    with tracer.start_as_current_span("place_order") as span:
        span.set_attribute("user.id", user_id)
        span.set_attribute("order.amount_cents", amount)
        order_id = "ord_001"                          # do the work
        span.set_attribute("order.id", order_id)
        return order_id

place_order(42, 1999)
# Console output (one block per span):
#   {"name": "place_order", "context": {"trace_id": "...", "span_id": "..."},
#    "attributes": {"user.id": 42, "order.amount_cents": 1999, "order.id": "ord_001"},
#    "start_time": "...", "end_time": "...", "status": {"status_code": "UNSET"}}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but ship to a real collector (Jaeger/Honeycomb/Tempo),
#             tag with service.name, follow OTel semantic conventions
#             for HTTP attributes.
# APPROACH  - OTLPSpanExporter -> grpc/http to a collector; Resource with
#             service.name + version + deployment.environment; semconv
#             attribute names so vendors can interpret the spans.
# STRENGTHS- Spans land in your tracing UI within seconds; resource tags
#             are queryable in every span; semconv keeps you portable
#             across vendors.
# WEAKNESSES- Need a collector running locally or remotely; OTLP exporter
#             will retry but won't queue forever — set OTEL_BSP_*
#             timeouts for slow networks.
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION, DEPLOYMENT_ENVIRONMENT
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
import os

# Resource attributes apply to EVERY span this process emits.
resource = Resource.create({
    SERVICE_NAME: "orders",
    SERVICE_VERSION: os.environ.get("APP_VERSION", "dev"),
    DEPLOYMENT_ENVIRONMENT: os.environ.get("ENV", "dev"),
})

provider = TracerProvider(resource=resource)
provider.add_span_processor(
    BatchSpanProcessor(
        OTLPSpanExporter(
            endpoint=os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT",
                                    "http://localhost:4317"),
            # OTel collector / Jaeger / Honeycomb / Tempo all accept OTLP.
        )
    )
)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

# Use OTel semantic conventions for portable attribute names.
from opentelemetry.semconv.trace import SpanAttributes

def place_order(user_id: int, amount: int) -> str:
    with tracer.start_as_current_span("HTTP POST /orders") as span:
        # Standard HTTP attributes.
        span.set_attribute(SpanAttributes.HTTP_METHOD, "POST")
        span.set_attribute(SpanAttributes.HTTP_ROUTE, "/orders")
        # App-specific attributes — namespace your own.
        span.set_attribute("app.user_id", user_id)
        span.set_attribute("app.order.amount_cents", amount)

        # Nested span — child of the HTTP span.
        with tracer.start_as_current_span("db.insert_order") as db_span:
            db_span.set_attribute(SpanAttributes.DB_SYSTEM, "postgresql")
            db_span.set_attribute(SpanAttributes.DB_OPERATION, "INSERT")
            db_span.set_attribute(SpanAttributes.DB_NAME, "orders")
            order_id = "ord_001"

        span.set_attribute("app.order.id", order_id)
        return order_id

place_order(42, 1999)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: head sampling at 10%, parent-based
#             so a sampled upstream forces sampling here, exception
#             recording on spans, graceful shutdown flushes pending
#             spans on SIGTERM, span limits to bound memory.
# APPROACH  - ParentBased(TraceIdRatioBased(0.1)) sampler; record_exception
#             helper; SpanLimits to cap attribute count/length; atexit
#             + signal handler for force_flush.
# STRENGTHS - Predictable cost (10% of traces); upstream-honoring (full
#             traces aren't broken); exceptions visible without try/except
#             noise in business code; no spans lost on container restart.
# WEAKNESSES- ParentBased honors upstream — if a misbehaving caller flags
#             every trace as sampled, you trace 100%. Pair with
#             rate-limited override at the SDK level for safety.
from __future__ import annotations
import os, signal, atexit, logging
from contextlib import contextmanager
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider, SpanLimits
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import (
    ParentBased, TraceIdRatioBased, ALWAYS_ON, ALWAYS_OFF,
)
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION, DEPLOYMENT_ENVIRONMENT
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.trace import Status, StatusCode

log = logging.getLogger(__name__)

def configure_tracing() -> TracerProvider:
    resource = Resource.create({
        SERVICE_NAME:           os.environ["SERVICE_NAME"],
        SERVICE_VERSION:        os.environ.get("APP_VERSION", "dev"),
        DEPLOYMENT_ENVIRONMENT: os.environ.get("ENV", "dev"),
    })

    # Sampling: 10% of root traces; honor upstream decision otherwise.
    sample_rate = float(os.environ.get("OTEL_TRACES_SAMPLER_ARG", "0.1"))
    sampler = ParentBased(
        root=TraceIdRatioBased(sample_rate),
        # If upstream sampled -> we sample (full trace stays connected).
        # If upstream didn't sample -> we don't sample (consistent decision).
        remote_parent_sampled=ALWAYS_ON,
        remote_parent_not_sampled=ALWAYS_OFF,
    )

    # SpanLimits — cap memory per span (defense against runaway attribute writes).
    limits = SpanLimits(
        max_attributes=128,
        max_events=128,
        max_links=128,
        max_attribute_length=4096,
    )

    provider = TracerProvider(
        resource=resource,
        sampler=sampler,
        span_limits=limits,
    )
    # OTLP exporter; honors OTEL_EXPORTER_OTLP_* env vars.
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(provider)

    # Graceful shutdown — drain pending spans before exit.
    def _flush_on_exit(*_):
        log.info("flushing OTel spans on shutdown")
        provider.force_flush(timeout_millis=5000)
        provider.shutdown()
    atexit.register(_flush_on_exit)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, lambda *_: (_flush_on_exit(), os._exit(0)))

    return provider

configure_tracing()
tracer = trace.get_tracer(__name__)

# Helper: record exceptions and set status without try/except noise.
@contextmanager
def traced(name: str, **attrs):
    with tracer.start_as_current_span(name, attributes=attrs) as span:
        try:
            yield span
        except Exception as e:
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, type(e).__name__))
            raise

def place_order(user_id: int, amount: int) -> str:
    with traced("place_order", **{"app.user_id": user_id, "app.amount_cents": amount}) as span:
        with traced("db.insert", **{"db.system": "postgresql", "db.operation": "INSERT"}):
            order_id = "ord_001"
        span.set_attribute("app.order.id", order_id)
        return order_id

# Decision rule:
#   bootstrap one service                  -> ConsoleSpanExporter to verify; OTLP for real
#   ship to vendor (Honeycomb/Datadog/...) -> OTLP exporter; vendor docs always show endpoint
#   sampling at scale                       -> TraceIdRatioBased(0.05-0.1); ParentBased to honor upstream
#   never lose specific traces              -> set sampling=ALWAYS_ON for a route via tracer hook
#   exception on a span                     -> span.record_exception(e) + set_status(ERROR)
#   container shutdown losing spans         -> SIGTERM handler -> provider.force_flush()
#   want consistent attribute names         -> opentelemetry.semconv.trace.SpanAttributes
#   bounded memory per span                 -> SpanLimits(max_attributes=128, max_attribute_length=4096)
#   testing: assert spans                   -> InMemorySpanExporter as the processor; inspect get_finished_spans()
#   asyncio                                 -> SDK is async-aware; spans inherit via contextvars (free)
#
# Anti-pattern: setting sample rate to 100% in production "for full
# visibility". OTLP traffic, collector capacity, and storage all scale
# with span volume — at 1000 RPS × 10 spans/req × 100% sampling, you're
# shipping 10k spans/s, often hundreds of GB/day. Use 5-10% rate-based
# sampling with parent-based honoring; pair with tail-based sampling at
# the collector for "always sample errors and slow requests" without
# the head-sampling bill.
```

## Decision Rule

```text
bootstrap one service                  -> ConsoleSpanExporter to verify; OTLP for real
ship to vendor (Honeycomb/Datadog/...) -> OTLP exporter; vendor docs always show endpoint
sampling at scale                       -> TraceIdRatioBased(0.05-0.1); ParentBased to honor upstream
never lose specific traces              -> set sampling=ALWAYS_ON for a route via tracer hook
exception on a span                     -> span.record_exception(e) + set_status(ERROR)
container shutdown losing spans         -> SIGTERM handler -> provider.force_flush()
want consistent attribute names         -> opentelemetry.semconv.trace.SpanAttributes
bounded memory per span                 -> SpanLimits(max_attributes=128, max_attribute_length=4096)
testing: assert spans                   -> InMemorySpanExporter as the processor; inspect get_finished_spans()
asyncio                                 -> SDK is async-aware; spans inherit via contextvars (free)
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting sample rate to 100% in production "for full
> visibility". OTLP traffic, collector capacity, and storage all scale
> with span volume — at 1000 RPS × 10 spans/req × 100% sampling, you're
> shipping 10k spans/s, often hundreds of GB/day. Use 5-10% rate-based
> sampling with parent-based honoring; pair with tail-based sampling at
> the collector for "always sample errors and slow requests" without
> the head-sampling bill.

## Tips

- Use the OTLP exporter (`opentelemetry-exporter-otlp-proto-grpc`) for production. Most vendors (Honeycomb, Datadog, Tempo, Jaeger 1.35+) accept OTLP directly — no vendor-specific Python lib needed.
- Set `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` via environment, not in code. The SDK reads them automatically; deploy environments swap them without rebuilds.
- Use `SpanAttributes` constants from `opentelemetry.semconv.trace` for HTTP/DB/messaging attributes. Vendor UIs rely on these names to render properly (e.g., a span with `http.method` shows up in HTTP-centric views).
- `ParentBased(TraceIdRatioBased(N))` is the correct sampling default — random N% of root traces, but if a parent already sampled, we sample too. Without ParentBased, child spans get inconsistent decisions and traces have holes.
- Always implement a SIGTERM/atexit handler that calls `provider.force_flush(timeout_millis=5000)` before exit. BatchSpanProcessor buffers spans; without flush, the last 1-30 seconds of traces vanish on container restart.
- For tests, swap in `InMemorySpanExporter` and assert against `get_finished_spans()`. Way cleaner than parsing OTLP traffic, and runs anywhere.

## Common Mistake

> [!warning] Setting sample rate to 100% "for full visibility" in production. At 1000 RPS × 10 spans/req that's 10k spans/s — hundreds of GB/day of OTLP traffic and storage. Use 5-10% TraceIdRatioBased + ParentBased; let the collector do tail-based sampling to keep all errors and slow requests at 100%.

## Shorthand (Junior → Senior)

**Junior:**
```python
# 100% sampling — collector and storage costs scale linearly
sampler = ALWAYS_ON
```

**Senior:**
```python
# 10% root, parent-honoring — predictable cost
sampler = ParentBased(TraceIdRatioBased(0.1))
```

## See Also

- [[Sections/observability/distributed-tracing/otel-instrumentation|OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis (Observability)]]
- [[Sections/observability/distributed-tracing/span-context-propagation|Span context propagation — across async, threads, queues (Observability)]]
- [[Sections/observability/distributed-tracing/_Index|Observability → Distributed Tracing — OpenTelemetry, instrumentation, propagation]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

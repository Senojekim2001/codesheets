---
type: "entry"
domain: "python"
file: "observability"
section: "errors-alerting"
id: "structured-error-context"
title: "Correlated error context — one ID across logs, traces, Sentry"
category: "Error Tracking"
subtitle: "trace_id propagation, structlog add_trace_context, sentry_sdk.set_tag, OTel SentryPropagator, scope.set_user, request_id alongside trace_id, the click-through workflow"
signature_short: "on every log: trace_id ; on every Sentry event: trace_id ; on every span: trace_id  ALL EQUAL."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Correlated error context — one ID across logs, traces, Sentry"
  - "structured-error-context"
tags:
  - "python"
  - "python/observability"
  - "python/observability/errors-alerting"
  - "category/error-tracking"
  - "tier/tiered"
---

# Correlated error context — one ID across logs, traces, Sentry

> trace_id propagation, structlog add_trace_context, sentry_sdk.set_tag, OTel SentryPropagator, scope.set_user, request_id alongside trace_id, the click-through workflow

## Overview

Three observability planes — logs, traces, errors — only become useful when they share an ID. Without it, an alert fires, you see a stack trace, and you have no way to find the matching trace or the logs that came before. The fix is mechanical: set trace_id (or request_id) once at the request edge; structlog's `add_trace_context` puts it on every log line; Sentry SDK's OTel integration puts it on every event; the OTel SDK puts it on every span. The three examples solve the SAME concrete task — given a Sentry alert, the operator pivots to logs and traces using one shared id — at three depths: manual tagging at each plane → middleware-driven correlation with structlog + sentry scope → production-grade with OTel as the central source of trace_id, plus the documented click-through workflow.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Set the same correlation id on logs and Sentry events so an alert can pivot to the matching log lines.
- **Junior** — SAME — but auto-correlate every log + Sentry event in every handler via middleware. Add OpenTelemetry trace_id so the same id pivots to your tracing UI too.
- **Senior** — SAME — production: OTel as the SOLE trace_id source, Sentry SDK bridged via SentryPropagator so its trace_id matches OTel's, runbook documenting the click-through, test that asserts all three planes carry the same id.

## Signature

```python
on every log: trace_id ; on every Sentry event: trace_id ; on every span: trace_id  ALL EQUAL.
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Set the same correlation id on logs and Sentry events
#             so an alert can pivot to the matching log lines.
# APPROACH  - Generate request_id at the edge; manually attach it to
#             both the structlog logger and the Sentry scope.
# STRENGTHS - Smallest correct setup; no extra libraries; one id everywhere.
# WEAKNESSES- Manual setup in every handler; no traces yet (junior adds OTel).
import uuid
import structlog
import sentry_sdk

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
)

sentry_sdk.init(dsn="https://abc@o0.ingest.sentry.io/0")

def handle_request(req) -> None:
    rid = req.headers.get("x-request-id") or str(uuid.uuid4())
    log = structlog.get_logger().bind(request_id=rid)

    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("request_id", rid)             # appears on every Sentry event in this scope

    log.info("request_received")
    try:
        process(req)
    except Exception:
        log.exception("request_failed")              # captured in log + Sentry; both tagged with rid

def process(req): raise ValueError("simulated")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but auto-correlate every log + Sentry event in
#             every handler via middleware. Add OpenTelemetry trace_id
#             so the same id pivots to your tracing UI too.
# APPROACH  - FastAPI middleware sets request_id + structlog contextvars
#             + Sentry scope tag once per request. structlog processor
#             reads the active OTel span and adds trace_id to every line.
# STRENGTHS - Handlers stop touching the id; logs/Sentry/traces all carry
#             trace_id; the pivot is "copy id -> paste in any tool".
# WEAKNESSES- Coupling structlog to OTel + Sentry in one config — if
#             you swap any of them, this layer needs updating.
import uuid
import contextvars
import structlog
import sentry_sdk
from opentelemetry import trace as otel_trace
from fastapi import FastAPI, Request

request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default="-"
)

# 1) structlog processor that attaches trace_id from the active OTel span.
def add_trace_context(_logger, _method, event_dict):
    span = otel_trace.get_current_span()
    ctx = span.get_span_context() if span else None
    if ctx and ctx.is_valid:
        event_dict["trace_id"] = format(ctx.trace_id, "032x")
        event_dict["span_id"]  = format(ctx.span_id, "016x")
    return event_dict

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        add_trace_context,                              # <-- pulls in OTel trace_id
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
)

sentry_sdk.init(
    dsn="https://abc@o0.ingest.sentry.io/0",
    environment="prod",
)

app = FastAPI()

@app.middleware("http")
async def correlation_middleware(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    request_id_var.set(rid)
    structlog.contextvars.bind_contextvars(request_id=rid)

    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("request_id", rid)
        # Also tag with trace_id once the span is active (FastAPI integration starts it).
        span = otel_trace.get_current_span()
        ctx = span.get_span_context() if span else None
        if ctx and ctx.is_valid:
            scope.set_tag("trace_id", format(ctx.trace_id, "032x"))
        scope.set_user({"id": request.headers.get("x-user-id")})

    try:
        response = await call_next(request)
    finally:
        structlog.contextvars.clear_contextvars()
    response.headers["X-Request-ID"] = rid
    return response

# Now every log line carries trace_id + request_id.
# Every Sentry event has request_id and trace_id as tags.
# Every OTel span (auto-created by FastAPI instrumentation) has the trace_id.
# Pivot: copy trace_id from anywhere -> paste anywhere -> all three connect.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: OTel as the SOLE trace_id source,
#             Sentry SDK bridged via SentryPropagator so its trace_id
#             matches OTel's, runbook documenting the click-through,
#             test that asserts all three planes carry the same id.
# APPROACH  - SentryPropagator + SentrySpanProcessor make Sentry use
#             OTel's trace_id (no parallel id system); structlog reads
#             it via a processor; assert_correlation() in tests.
# STRENGTHS - One canonical id (trace_id) across all three planes;
#             docs convert "alert -> debug" from a 30-min hunt to a
#             3-click pivot; tests prevent regression.
# WEAKNESSES- One library failure (Sentry SDK update) can break the
#             bridge silently; CI test catches it.
import os
import logging
import structlog
import sentry_sdk
from opentelemetry import trace as otel_trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.propagate import set_global_textmap
from sentry_sdk.integrations.opentelemetry import (
    SentryPropagator, SentrySpanProcessor,
)
from sentry_sdk.integrations.fastapi import FastApiIntegration

log = logging.getLogger(__name__)

# 1) OTel TracerProvider with BOTH the OTLP exporter AND the Sentry processor.
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
provider.add_span_processor(SentrySpanProcessor())     # Sentry shares spans + trace_id
otel_trace.set_tracer_provider(provider)
set_global_textmap(SentryPropagator())                  # consistent W3C-compatible propagation

# 2) Sentry init with FastAPI integration.
sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    environment=os.environ.get("ENV", "prod"),
    release=os.environ.get("APP_VERSION", "dev"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
    send_default_pii=False,
)

# 3) structlog processor adds trace_id from the active span.
def add_trace_context(_logger, _method, event_dict):
    span = otel_trace.get_current_span()
    ctx = span.get_span_context() if span else None
    if ctx and ctx.is_valid:
        event_dict["trace_id"] = format(ctx.trace_id, "032x")
    return event_dict

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        add_trace_context,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    cache_logger_on_first_use=True,
)

# 4) Test that asserts all three planes carry the same trace_id.
def test_correlation_in_request():
    """Run inside a unit test with InMemorySpanExporter + sentry_sdk.transport mock."""
    from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
    from sentry_sdk.transport import Transport

    span_exporter = InMemorySpanExporter()
    sentry_events: list[dict] = []

    class CaptureTransport(Transport):
        def capture_event(self, event): sentry_events.append(event)
        def capture_envelope(self, envelope): pass

    sentry_sdk.init(transport=CaptureTransport(), traces_sample_rate=1.0)
    provider.add_span_processor(BatchSpanProcessor(span_exporter))

    # Simulate a request that errors.
    tracer = otel_trace.get_tracer(__name__)
    with tracer.start_as_current_span("test_request"):
        try:
            raise RuntimeError("boom")
        except Exception:
            sentry_sdk.capture_exception()

    provider.force_flush()

    # Assert: span trace_id == sentry event trace_id.
    spans = span_exporter.get_finished_spans()
    span_tid = format(spans[0].get_span_context().trace_id, "032x")
    sentry_tid = sentry_events[0]["contexts"]["trace"]["trace_id"]
    assert span_tid == sentry_tid, f"trace_id mismatch: span={span_tid} sentry={sentry_tid}"

# 5) RUNBOOK — paste in your repo's docs/runbook.
# WORKFLOW: Sentry alert -> root cause in 3 clicks
#   1. Sentry email -> open the issue. Copy the trace_id tag.
#   2. Tracing UI (Tempo/Honeycomb/Datadog APM) -> paste trace_id ->
#      see the full request waterfall (DB queries, outbound HTTP, etc.)
#   3. Logs UI (Loki/Splunk) -> filter by trace_id="..." -> see every log
#      line emitted while handling the request, in order.
# Total time: 30s vs the 30min "grep across services" alternative.

# Decision rule:
#   one id across all 3 planes      -> trace_id (OTel-canonical, W3C-standard)
#   need a human-readable id too    -> request_id alongside; tag both on every plane
#   already running Sentry          -> add SentryPropagator + SentrySpanProcessor; trace_ids align
#   no Sentry, just logs + traces   -> add_trace_context structlog processor is enough
#   testing the correlation        -> InMemorySpanExporter + Sentry transport mock; assert ids match
#   alert pivots to log + trace    -> document in runbook; engineers WILL use it
#   custom error class              -> attach trace_id in the constructor; survives serialization
#   message queue handler          -> propagate trace_id via headers; resume on consumer side
#   batch job (no inbound trace)   -> generate trace_id at job start; propagate to all spawned spans
#
# Anti-pattern: each tool generates its own correlation id. Sentry has its
# own event_id; logs have their own request_id; traces have trace_id;
# none match. When an alert fires, you copy event_id, search logs, get
# nothing. Pick ONE canonical id (trace_id is the right answer) and
# attach it to the others. Without that, the three planes are three
# disconnected silos.
```

## Decision Rule

```text
one id across all 3 planes      -> trace_id (OTel-canonical, W3C-standard)
need a human-readable id too    -> request_id alongside; tag both on every plane
already running Sentry          -> add SentryPropagator + SentrySpanProcessor; trace_ids align
no Sentry, just logs + traces   -> add_trace_context structlog processor is enough
testing the correlation        -> InMemorySpanExporter + Sentry transport mock; assert ids match
alert pivots to log + trace    -> document in runbook; engineers WILL use it
custom error class              -> attach trace_id in the constructor; survives serialization
message queue handler          -> propagate trace_id via headers; resume on consumer side
batch job (no inbound trace)   -> generate trace_id at job start; propagate to all spawned spans
```

## Anti-Pattern

> [!warning] Anti-pattern
> each tool generates its own correlation id. Sentry has its
> own event_id; logs have their own request_id; traces have trace_id;
> none match. When an alert fires, you copy event_id, search logs, get
> nothing. Pick ONE canonical id (trace_id is the right answer) and
> attach it to the others. Without that, the three planes are three
> disconnected silos.

## Tips

- Pick `trace_id` as the canonical correlation id. It's W3C-standard, OTel-native, propagates across services automatically, and most tools index by it. `request_id` works for human readability — keep both, but `trace_id` is the authoritative join key.
- The `sentry-sdk[opentelemetry]` integration (`SentryPropagator` + `SentrySpanProcessor`) makes Sentry use OTel's trace_id natively. Without it, Sentry maintains a parallel id system and the planes don't connect.
- Add a `add_trace_context` processor to structlog that reads the active OTel span. One processor, every log line tagged automatically.
- Always echo `X-Request-ID` (and `traceparent`) back in response headers. Lets clients (and curl) capture the id for the request they just made — invaluable for support tickets.
- Test the correlation in CI. `InMemorySpanExporter` + a Sentry transport mock + a forced exception, then assert the span's trace_id equals the Sentry event's trace_id. Catches SDK upgrade regressions before they reach prod.
- Document the click-through workflow as a 3-step runbook: Sentry alert -> copy trace_id -> Tracing UI -> Logs UI. Engineers WILL use it; without docs they fall back to grep.

## Common Mistake

> [!warning] Letting each tool generate its own correlation id. Sentry has `event_id`, logs have `request_id`, traces have `trace_id` — none match. When an alert fires, you copy one id, search the next tool, get nothing, and waste 30 minutes joining by timestamp. Pick ONE canonical id (trace_id), attach it to everything, document the pivot.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Three tools, three IDs — silos don't join
sentry_event_id = "abc123"  # Sentry's own
log["request_id"] = rid     # mine
span.context.trace_id = ... # OTel's
```

**Senior:**
```python
# trace_id everywhere — copy from any tool, paste in any other
sentry: trace_id tag      = format(span.context.trace_id, "032x")
logs:   trace_id field    = format(span.context.trace_id, "032x")
traces: trace_id (native) = span.context.trace_id
```

## See Also

- [[Sections/observability/errors-alerting/sentry-sdk|Sentry SDK — production exception tracking (Observability)]]
- [[Sections/observability/errors-alerting/_Index|Observability → Error Tracking & Alerting — Sentry, correlation, SLO-based alerts]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

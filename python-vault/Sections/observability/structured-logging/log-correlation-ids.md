---
type: "entry"
domain: "python"
file: "observability"
section: "structured-logging"
id: "log-correlation-ids"
title: "Correlation IDs — propagate request_id across logs and services"
category: "Structured Logging"
subtitle: "contextvars.ContextVar, structlog bind_contextvars, X-Request-ID header, httpx outbound, OpenTelemetry trace_id, FastAPI/Flask middleware"
signature_short: "request_id_var: ContextVar[str] = ContextVar(\"request_id\", default=\"-\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Correlation IDs — propagate request_id across logs and services"
  - "log-correlation-ids"
tags:
  - "python"
  - "python/observability"
  - "python/observability/structured-logging"
  - "category/structured-logging"
  - "tier/tiered"
---

# Correlation IDs — propagate request_id across logs and services

> contextvars.ContextVar, structlog bind_contextvars, X-Request-ID header, httpx outbound, OpenTelemetry trace_id, FastAPI/Flask middleware

## Overview

A correlation ID — request_id, trace_id, or both — is a single token that ties together every log line, span, and metric for one logical request, even as it crosses services. The recipe is the same everywhere: at the edge (load balancer, API gateway, or first request handler), generate a UUID if one doesn't exist; store it in a ContextVar so every coroutine inherits it; bind it to the structured logger so every log line carries it; forward it as an HTTP header (X-Request-ID or W3C traceparent) on outbound service calls. The three examples solve the SAME concrete task — every log line for a request carries the request_id, and downstream services see the same id — at three depths: ContextVar + manual passing → FastAPI middleware that auto-extracts/generates → full distributed tracing with OpenTelemetry trace_id as the canonical correlation token.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Tag every log line in a request with a unique request_id; same id appears in outbound HTTP calls.
- **Junior** — SAME — but auto-inject request_id into every log line and every outbound httpx call without per-call code.
- **Senior** — SAME — but use OpenTelemetry trace_id as the canonical correlation token. trace_id propagates via W3C traceparent header automatically; logs include it; Sentry/Datadog tag with it; you can pivot from a log line to the full trace with one click.

## Signature

```python
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Tag every log line in a request with a unique request_id;
#             same id appears in outbound HTTP calls.
# APPROACH  - contextvars.ContextVar holds it; logger reads it before
#             every emit; outbound httpx call sets the header manually.
# STRENGTHS - Pure stdlib; the cleanest way to thread state through
#             async code (each task gets its own copy).
# WEAKNESSES- Verbose: every log call has to .bind(request_id=...);
#             see junior tier for auto-injection.
import contextvars
import uuid
import structlog
import httpx

request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default="-"
)

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
)

def handle_request(request) -> dict:
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    request_id_var.set(rid)

    log = structlog.get_logger().bind(request_id=rid)
    log.info("request_started", path=request.path)

    # Outbound call — propagate the id.
    response = httpx.get(
        "https://api.example.com/data",
        headers={"X-Request-ID": rid},
    )
    log.info("upstream_responded", status=response.status_code)
    return response.json()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but auto-inject request_id into every log line and
#             every outbound httpx call without per-call code.
# APPROACH  - structlog merge_contextvars processor + bind_contextvars
#             at request entry; httpx Client with an event_hook that
#             pulls the id from the ContextVar and sets the header.
# STRENGTHS- Handlers stop touching the id; only middleware does;
#             refactor-resistant (handlers can move/split without losing
#             the correlation).
# WEAKNESSES- Library coupling — your httpx Client is shared, so every
#             outbound call goes through the hook (intended).
import contextvars, uuid
import structlog
import httpx
from fastapi import FastAPI, Request

request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default="-"
)

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,         # pulls bound ContextVars in
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
)

# Httpx client with an outbound hook that reads the ContextVar.
def attach_request_id(request: httpx.Request) -> None:
    request.headers.setdefault("X-Request-ID", request_id_var.get())

http_client = httpx.AsyncClient(event_hooks={"request": [attach_request_id]})

app = FastAPI()

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    request_id_var.set(rid)
    structlog.contextvars.bind_contextvars(request_id=rid)
    try:
        response = await call_next(request)
    finally:
        # Clear so the next request doesn't inherit.
        structlog.contextvars.clear_contextvars()
    response.headers["X-Request-ID"] = rid                # echo for clients
    return response

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    log = structlog.get_logger()
    log.info("get_widget", widget_id=widget_id)             # request_id auto-included

    # Outbound — header set by event hook, not by hand.
    upstream = await http_client.get(f"https://api.example.com/widgets/{widget_id}")
    log.info("upstream_done", status=upstream.status_code) # also auto-tagged
    return upstream.json()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but use OpenTelemetry trace_id as the canonical
#             correlation token. trace_id propagates via W3C traceparent
#             header automatically; logs include it; Sentry/Datadog tag
#             with it; you can pivot from a log line to the full trace
#             with one click.
# APPROACH  - opentelemetry-instrumentation-fastapi auto-creates spans
#             with trace_ids; a structlog processor reads the active
#             span context and writes trace_id/span_id into every log;
#             httpx instrumentation propagates traceparent automatically.
# STRENGTHS- One token correlates logs + traces + errors; W3C-standard
#             so non-Python downstreams pick it up; no manual passing.
# WEAKNESSES- Adds OTel as a dependency; trace_id is 32 hex chars
#             (long); some tools don't render it cleanly. Keep
#             request_id alongside if your existing tooling needs it.
import structlog
import logging
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

# 1) Bootstrap OTel tracing (entrypoint).
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)

# 2) structlog processor that adds trace_id/span_id from the active span.
def add_trace_context(_logger, _method, event_dict):
    span = trace.get_current_span()
    ctx = span.get_span_context() if span else None
    if ctx and ctx.is_valid:
        event_dict["trace_id"] = format(ctx.trace_id, "032x")
        event_dict["span_id"]  = format(ctx.span_id, "016x")
    return event_dict

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        add_trace_context,                                  # <-- new
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    cache_logger_on_first_use=True,
)

# 3) Auto-instrument FastAPI + httpx. FastAPI extracts incoming
#    traceparent header (or starts a new trace); HTTPXClientInstrumentor
#    injects traceparent on every outbound request — no event_hook needed.
from fastapi import FastAPI
import httpx

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)
HTTPXClientInstrumentor().instrument()

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    log = structlog.get_logger()
    log.info("get_widget", widget_id=widget_id)
    # trace_id and span_id present on this log line automatically.

    async with httpx.AsyncClient() as client:
        # traceparent header injected by HTTPXClientInstrumentor.
        upstream = await client.get(f"https://api.example.com/widgets/{widget_id}")
    log.info("upstream_done", status=upstream.status_code)
    return upstream.json()

# 4) Sentry, Datadog, Honeycomb, Tempo all index by trace_id. From a log
#    line: copy trace_id -> open in tracing UI -> see the full span tree
#    -> click any span -> see logs for that span. The pivot makes
#    distributed debugging tractable.

# Decision rule:
#   single-service, single-process       -> request_id ContextVar is enough
#   multiple Python services              -> propagate via X-Request-ID OR traceparent
#   any non-Python downstream             -> traceparent (W3C standard) — request_id is ad-hoc
#   already running OpenTelemetry         -> trace_id is your correlation id; piggyback
#   want to keep request_id semantics     -> include both (request_id for humans, trace_id for tools)
#   async code                             -> ContextVar (NOT threading.local; bind_contextvars)
#   sync (Flask without async)             -> ContextVar still works; flask uses ContextVar internally
#   message queues (Celery, Kafka)         -> embed traceparent in the message body or headers
#   logs need to pivot to traces           -> add_trace_context structlog processor
#   logs need to pivot to errors           -> Sentry SDK reads trace_id automatically
#
# Anti-pattern: passing request_id as an explicit argument through every
# function. It pollutes signatures, bleeds into every test, and the first
# helper that forgets to forward it breaks the chain. ContextVar is the
# right tool: each request (or asyncio Task spawned from it) gets its
# own copy, no argument plumbing required.
```

## Decision Rule

```text
single-service, single-process       -> request_id ContextVar is enough
multiple Python services              -> propagate via X-Request-ID OR traceparent
any non-Python downstream             -> traceparent (W3C standard) — request_id is ad-hoc
already running OpenTelemetry         -> trace_id is your correlation id; piggyback
want to keep request_id semantics     -> include both (request_id for humans, trace_id for tools)
async code                             -> ContextVar (NOT threading.local; bind_contextvars)
sync (Flask without async)             -> ContextVar still works; flask uses ContextVar internally
message queues (Celery, Kafka)         -> embed traceparent in the message body or headers
logs need to pivot to traces           -> add_trace_context structlog processor
logs need to pivot to errors           -> Sentry SDK reads trace_id automatically
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing request_id as an explicit argument through every
> function. It pollutes signatures, bleeds into every test, and the first
> helper that forgets to forward it breaks the chain. ContextVar is the
> right tool: each request (or asyncio Task spawned from it) gets its
> own copy, no argument plumbing required.

## Tips

- Use `contextvars.ContextVar` for request-scoped state, NOT `threading.local`. ContextVar is asyncio-correct (each Task gets its own copy via copy_context); threading.local is per-OS-thread and breaks under asyncio.
- Bind via `structlog.contextvars.bind_contextvars(request_id=rid)` at request entry and `clear_contextvars()` at exit. The `merge_contextvars` processor pulls them into every log event automatically.
- For outbound HTTP, set the propagation headers via an httpx event_hook OR (better) install OpenTelemetry HTTPXClientInstrumentor — it injects W3C traceparent on every outbound request without per-call code.
- Echo `X-Request-ID` back in the response headers. It costs nothing and lets clients (and curl) see the id for the request they just made — invaluable for support tickets.
- Adopt the W3C `traceparent` header even if you don't run OpenTelemetry yet. It's the standard; most service meshes, gateways, and APMs already understand it; trace_id-as-correlation-id is the long-term direction.
- Generate the request_id at the edge (load balancer or first handler), not deeper. Inner services that miss the header should generate one and warn — the warning surfaces upstream gaps.

## Common Mistake

> [!warning] Passing `request_id` as an explicit argument through every function. It pollutes signatures, every test has to construct one, and the first helper that forgets to forward it breaks the chain — silently. ContextVar is the right tool: each request (and any asyncio Task spawned from it) gets its own copy automatically, with zero argument plumbing.

## Shorthand (Junior → Senior)

**Junior:**
```python
# request_id threaded through every signature
def handle(req, *, request_id): ...
def lookup(uid, *, request_id): ...
def render(rec, *, request_id): ...
```

**Senior:**
```python
# ContextVar — set once, every coroutine inherits
request_id_var.set(rid)
def handle(req): ...     # signatures unchanged
```

## See Also

- [[Sections/observability/structured-logging/structlog-basics|structlog — structured logging with dev + prod renderers (Observability)]]
- [[Sections/observability/structured-logging/log-sampling-budgets|Log sampling — keep signal, drop volume, hit a budget (Observability)]]
- [[Sections/observability/structured-logging/_Index|Observability → Structured Logging — structlog, correlation IDs, sampling]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

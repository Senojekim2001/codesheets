---
type: "entry"
domain: "python"
file: "observability"
section: "distributed-tracing"
id: "otel-instrumentation"
title: "OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis"
category: "Distributed Tracing"
subtitle: "opentelemetry-instrumentation-fastapi, sqlalchemy, httpx, redis, requests; opentelemetry-distro; opentelemetry-bootstrap; OTEL_PYTHON_*; opentelemetry-instrument"
signature_short: "FastAPIInstrumentor.instrument_app(app); SQLAlchemyInstrumentor().instrument(engine=engine)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis"
  - "otel-instrumentation"
tags:
  - "python"
  - "python/observability"
  - "python/observability/distributed-tracing"
  - "category/distributed-tracing"
  - "tier/tiered"
---

# OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis

> opentelemetry-instrumentation-fastapi, sqlalchemy, httpx, redis, requests; opentelemetry-distro; opentelemetry-bootstrap; OTEL_PYTHON_*; opentelemetry-instrument

## Overview

Manual `tracer.start_as_current_span` everywhere is tedious and easy to miss. The instrumentation libraries (`opentelemetry-instrumentation-*`) wrap a framework or client and emit spans automatically — every FastAPI request, every SQLAlchemy query, every httpx call. They follow OTel semantic conventions, so spans render correctly in any vendor UI. Two installation modes: explicit (`Instrumentor().instrument()` in code) or zero-code (`opentelemetry-instrument python myapp.py` agent that monkey-patches at import time). The three examples solve the SAME concrete task — every HTTP request, DB query, and outbound HTTP call in a service produces a span automatically — at three depths: instrument FastAPI alone → full stack (FastAPI + SQLAlchemy + httpx + Redis) with header capture and exclusion lists → zero-code agent via `opentelemetry-distro` and the production tradeoffs.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Every FastAPI request becomes a span automatically — no per-route instrumentation code.
- **Junior** — SAME — full stack: FastAPI + SQLAlchemy + httpx + Redis all auto-instrumented; healthchecks excluded; sensitive headers redacted.
- **Senior** — SAME — but use the zero-code agent (opentelemetry-instrument) so production deploys can add tracing without code changes, AND you can override per-instrumentation settings via config when needed.

## Signature

```python
FastAPIInstrumentor.instrument_app(app); SQLAlchemyInstrumentor().instrument(engine=engine)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Every FastAPI request becomes a span automatically — no
#             per-route instrumentation code.
# APPROACH  - Install opentelemetry-instrumentation-fastapi; one call
#             to FastAPIInstrumentor.instrument_app(app) wraps every
#             route. Each request's span has http.method/route/status.
# STRENGTHS - Single line; works for sync + async routes; spans use
#             OTel semantic conventions out of the box.
# WEAKNESSES- Only covers requests in this process; outbound calls,
#             DB queries, etc. need their own instrumentations.

# Install:
#   pip install opentelemetry-distro \
#               opentelemetry-exporter-otlp \
#               opentelemetry-instrumentation-fastapi

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from fastapi import FastAPI

# (configure_tracing() from the otel-tracing-setup entry runs first)

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)             # <-- one line; every route traced

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    return {"widget_id": widget_id, "name": "thing"}

# Every request now produces a span:
#   name: "GET /widgets/{widget_id}"
#   attributes:
#     http.method = "GET"
#     http.route  = "/widgets/{widget_id}"
#     http.status_code = 200
#     http.scheme = "http"
#     net.peer.ip = "..."
#   duration: actual handler time
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — full stack: FastAPI + SQLAlchemy + httpx + Redis
#             all auto-instrumented; healthchecks excluded; sensitive
#             headers redacted.
# APPROACH  - One Instrumentor per library; OTEL_PYTHON_* env vars
#             control header capture and URL exclusions.
# STRENGTHS- Each downstream call (DB query, HTTP, Redis) becomes a
#             child span — full request waterfall in the tracing UI
#             without any code change in handlers.
# WEAKNESSES- 4-5 instrumentations to install; per-library config; some
#             libraries (asyncpg) need engine-specific wiring.
# Install all the instrumentations you need:
#   pip install opentelemetry-instrumentation-fastapi \
#               opentelemetry-instrumentation-sqlalchemy \
#               opentelemetry-instrumentation-httpx \
#               opentelemetry-instrumentation-redis

import os
from sqlalchemy import create_engine
from fastapi import FastAPI
import httpx, redis

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor

# Env vars (read by FastAPIInstrumentor automatically):
#   OTEL_PYTHON_FASTAPI_EXCLUDED_URLS      -> regex; healthchecks/metrics
#   OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST  -> "x-request-id,x-tenant"
#   OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS -> "authorization,cookie"
os.environ.setdefault("OTEL_PYTHON_FASTAPI_EXCLUDED_URLS", "/healthz,/metrics")
os.environ.setdefault(
    "OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST",
    "x-request-id,x-tenant",
)
os.environ.setdefault(
    "OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS",
    "authorization,cookie,x-api-key",
)

# 1) FastAPI — one call, applies to all routes registered later or earlier.
app = FastAPI()
FastAPIInstrumentor.instrument_app(app)

# 2) SQLAlchemy — bind to your engine specifically (or omit engine=
#    to instrument all engines globally).
engine = create_engine("postgresql+psycopg://app:secret@db/app")
SQLAlchemyInstrumentor().instrument(engine=engine)
# Every query now emits a span: db.system, db.statement, db.operation.

# 3) httpx — outbound HTTP gets its own client span + traceparent header.
HTTPXClientInstrumentor().instrument()
# All AsyncClient/Client instances are now traced; traceparent propagates.

# 4) Redis — every command becomes a span.
RedisInstrumentor().instrument()
r = redis.Redis(host="cache")

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    # 1 span (FastAPI) + N spans (SQLAlchemy queries) + 1 span (Redis GET) +
    # 1 span (httpx outbound) — all parented to the request span automatically.
    cached = r.get(f"widget:{widget_id}")
    if cached:
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://upstream/widget/{widget_id}")
    return resp.json()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but use the zero-code agent (opentelemetry-instrument)
#             so production deploys can add tracing without code changes,
#             AND you can override per-instrumentation settings via
#             config when needed.
# APPROACH  - opentelemetry-distro provides the agent; opentelemetry-bootstrap
#             auto-detects installed libraries and lists their instrumentations;
#             OTEL_PYTHON_DISABLED_INSTRUMENTATIONS skips ones that misbehave;
#             custom request_hook for FastAPI lets you tag spans with
#             request-specific data the auto-instrumentation misses.
# STRENGTHS - Tracing becomes a runtime concern (env vars + agent flag),
#             not a code concern. Adding/removing instrumentations is a
#             deploy-time decision.
# WEAKNESSES- Zero-code mode monkey-patches at import time; some weird
#             import orders fail silently. For prod, pin every
#             instrumentation library version and verify in staging.
# Install via the distro — pulls everything in one shot:
#   pip install opentelemetry-distro opentelemetry-exporter-otlp
#   opentelemetry-bootstrap -a install      # detects installed libs and
#                                           # installs their instrumentations
#
# Run with the agent (zero code change to myapp.py):
#   OTEL_SERVICE_NAME=myapp \
#   OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317 \
#   OTEL_TRACES_SAMPLER=parentbased_traceidratio \
#   OTEL_TRACES_SAMPLER_ARG=0.1 \
#   OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=urllib,urllib3 \
#   opentelemetry-instrument python -m myapp
#
# The agent sets up TracerProvider, exporter, sampler, and every detected
# instrumentation. myapp.py needs ZERO OTel imports.

# When you DO need code-level customization (custom span attributes,
# per-route hooks), keep the agent for the bulk and add explicit hooks:
import os
from fastapi import FastAPI, Request
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI()

def server_request_hook(span, scope):
    """Per-request hook — runs after the auto-created span starts."""
    if span and span.is_recording():
        # ASGI scope dict: extract things the auto-instrumentation skipped.
        tenant = scope.get("headers", [])
        for k, v in tenant:
            if k == b"x-tenant-id":
                span.set_attribute("app.tenant_id", v.decode())
                break
        span.set_attribute("app.deployment", os.environ.get("ENV", "dev"))

# Re-instrument with the hook (idempotent if already done by the agent).
FastAPIInstrumentor.instrument_app(app, server_request_hook=server_request_hook)

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    return {"widget_id": widget_id}

# Also useful in production:
#   - opentelemetry-instrumentation-logging       # injects trace_id into stdlib log records
#   - opentelemetry-instrumentation-system-metrics # CPU, memory, network as metrics
#   - opentelemetry-instrumentation-asgi          # for non-FastAPI ASGI apps (Starlette, Quart)

# Decision rule:
#   bootstrap tracing in dev               -> Instrumentor().instrument() per library
#   uniform instrumentation in prod        -> opentelemetry-distro + opentelemetry-instrument agent
#   exclude noisy routes                   -> OTEL_PYTHON_FASTAPI_EXCLUDED_URLS env var
#   capture custom headers                 -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST
#   redact sensitive headers               -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS
#   library not in distro list             -> manual tracer.start_as_current_span; or write custom Instrumentor
#   one Instrumentor causing issues        -> OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=name,name
#   per-request custom attributes          -> server_request_hook on FastAPI/ASGI Instrumentor
#   trace_id in log records (stdlib)       -> opentelemetry-instrumentation-logging  (sets LogRecord attr)
#   non-FastAPI ASGI (Starlette/Quart)     -> opentelemetry-instrumentation-asgi
#   psycopg2 / psycopg / asyncpg          -> opentelemetry-instrumentation-{psycopg2,psycopg,asyncpg}
#
# Anti-pattern: instrumenting twice — once via opentelemetry-instrument
# agent, then again via Instrumentor().instrument() in code. You get
# duplicate spans for every operation; flame graphs become unreadable.
# Pick ONE mode and document it; the agent for "I want this everywhere
# in prod", explicit instrumentation for "this one component needs a hook".
```

## Decision Rule

```text
bootstrap tracing in dev               -> Instrumentor().instrument() per library
uniform instrumentation in prod        -> opentelemetry-distro + opentelemetry-instrument agent
exclude noisy routes                   -> OTEL_PYTHON_FASTAPI_EXCLUDED_URLS env var
capture custom headers                 -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST
redact sensitive headers               -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS
library not in distro list             -> manual tracer.start_as_current_span; or write custom Instrumentor
one Instrumentor causing issues        -> OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=name,name
per-request custom attributes          -> server_request_hook on FastAPI/ASGI Instrumentor
trace_id in log records (stdlib)       -> opentelemetry-instrumentation-logging  (sets LogRecord attr)
non-FastAPI ASGI (Starlette/Quart)     -> opentelemetry-instrumentation-asgi
psycopg2 / psycopg / asyncpg          -> opentelemetry-instrumentation-{psycopg2,psycopg,asyncpg}
```

## Anti-Pattern

> [!warning] Anti-pattern
> instrumenting twice — once via opentelemetry-instrument
> agent, then again via Instrumentor().instrument() in code. You get
> duplicate spans for every operation; flame graphs become unreadable.
> Pick ONE mode and document it; the agent for "I want this everywhere
> in prod", explicit instrumentation for "this one component needs a hook".

## Tips

- `opentelemetry-distro` is the meta-package: it pulls SDK + OTLP exporter + the most common instrumentations. Pair with `opentelemetry-bootstrap -a install` to detect installed libraries and install their instrumentations.
- The zero-code agent (`opentelemetry-instrument python myapp.py`) is the production sweet spot. Tracing config moves to env vars; code stays clean; rolling out a new instrumentation is a deploy, not a code change.
- `OTEL_PYTHON_FASTAPI_EXCLUDED_URLS=/healthz,/metrics` is essential — without it, healthchecks dominate your trace volume and obscure real traffic. Pattern-match by URL path.
- For sensitive headers, `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS=authorization,cookie,x-api-key` redacts before export. Without this, auth tokens leak into spans.
- SQLAlchemy instrumentation can be applied per-engine (`SQLAlchemyInstrumentor().instrument(engine=engine)`) or globally. Per-engine is safer when you have multiple engines and only want to trace one (e.g., the application DB but not the read-replica).
- Use `server_request_hook` to add request-specific attributes the auto-instrumentation misses (tenant_id from header, user_id from auth context, deployment metadata).

## Common Mistake

> [!warning] Instrumenting twice — once via the `opentelemetry-instrument` agent and again via `Instrumentor().instrument()` in code. Every operation produces duplicate spans; flame graphs become unreadable; storage costs double. Pick ONE mode: the agent for "trace everything in this service", explicit Instrumentor calls for "trace this specific component with custom hooks".

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual tracer call on every operation
with tracer.start_as_current_span("GET /widgets"):
    return await get_widget(...)
```

**Senior:**
```python
# Auto-instrumentation — every route, query, outbound call traced
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument(engine=engine)
HTTPXClientInstrumentor().instrument()
```

## See Also

- [[Sections/observability/distributed-tracing/otel-tracing-setup|OpenTelemetry tracing — SDK setup, spans, exporters (Observability)]]
- [[Sections/observability/distributed-tracing/span-context-propagation|Span context propagation — across async, threads, queues (Observability)]]
- [[Sections/observability/distributed-tracing/_Index|Observability → Distributed Tracing — OpenTelemetry, instrumentation, propagation]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

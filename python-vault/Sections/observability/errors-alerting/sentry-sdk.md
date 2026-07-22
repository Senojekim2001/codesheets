---
type: "entry"
domain: "python"
file: "observability"
section: "errors-alerting"
id: "sentry-sdk"
title: "Sentry SDK — production exception tracking"
category: "Error Tracking"
subtitle: "sentry_sdk.init, FastApiIntegration, SqlalchemyIntegration, before_send, set_user/set_tag/set_context, environment, release, sample_rate, traces_sample_rate"
signature_short: "sentry_sdk.init(dsn=..., environment=\"prod\", release=\"1.4.2\", sample_rate=1.0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sentry SDK — production exception tracking"
  - "sentry-sdk"
tags:
  - "python"
  - "python/observability"
  - "python/observability/errors-alerting"
  - "category/error-tracking"
  - "tier/tiered"
---

# Sentry SDK — production exception tracking

> sentry_sdk.init, FastApiIntegration, SqlalchemyIntegration, before_send, set_user/set_tag/set_context, environment, release, sample_rate, traces_sample_rate

## Overview

Sentry is the dominant managed error-tracking service. The Python SDK auto-captures uncaught exceptions, attaches the active request (FastAPI/Flask integration), and ships a structured event with stack frames and locals. Beyond the basics, the SDK bridges to OpenTelemetry — Sentry events automatically carry the active trace_id, so an issue in Sentry pivots to its trace in Tempo/Honeycomb. The three examples solve the SAME concrete task — every uncaught exception in a FastAPI service lands in Sentry with user_id, request path, deployment metadata, and a click-through to the trace — at three depths: minimal init() → integrations + manual context + before_send redaction → production-grade with sampling, performance monitoring, OTel trace correlation, and PII-aware before_send.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Every uncaught exception lands in Sentry with stack trace.
- **Junior** — SAME — but with FastAPI/SQLAlchemy integrations, per-request context (user_id, request_id), and before_send redaction to keep PII out of Sentry.
- **Senior** — SAME — production: rate-based sampling for high-volume services, performance monitoring (transactions + spans), OTel trace_id correlation so Sentry pivots to your tracing UI, before_send_transaction for dropping noisy spans.

## Signature

```python
sentry_sdk.init(dsn=..., environment="prod", release="1.4.2", sample_rate=1.0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Every uncaught exception lands in Sentry with stack trace.
# APPROACH  - sentry_sdk.init(dsn=...) at startup; the SDK installs
#             a sys.excepthook + asyncio task hook automatically.
# STRENGTHS - One line; immediate value; no per-handler instrumentation.
# WEAKNESSES- No request/user context yet (junior tier adds that);
#             100% sampling — change for high-traffic services.
import sentry_sdk

sentry_sdk.init(
    dsn="https://abc123@o0.ingest.sentry.io/0",       # from Sentry project settings
    environment="prod",
    release="myapp@1.4.2",                            # ties events to a deploy
)

def divide(a: int, b: int) -> float:
    return a / b

divide(10, 0)                                          # ZeroDivisionError captured automatically

# In Sentry UI: stack trace with locals (a=10, b=0), grouped by exception type +
# location, deduplicated across instances, with environment/release filtering.

# Manually capture an exception caught in a try/except block:
try:
    risky()
except Exception:
    sentry_sdk.capture_exception()                    # uses sys.exc_info()

# Capture a non-exception event:
sentry_sdk.capture_message("payment processed slowly", level="warning")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with FastAPI/SQLAlchemy integrations, per-request
#             context (user_id, request_id), and before_send redaction
#             to keep PII out of Sentry.
# APPROACH  - Pass integrations= to init; middleware sets sentry_sdk
#             scope tags from each request; before_send hook strips
#             configured PII keys before send.
# STRENGTHS - Sentry events show user/request automatically; PII never
#             leaves the process; SQLAlchemy errors carry the SQL.
# WEAKNESSES- before_send runs on every event — keep it cheap;
#             complex redaction belongs in a dedicated processor.
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from fastapi import FastAPI, Request

PII_KEYS = {"password", "token", "authorization", "cookie", "ssn", "card_number"}

def before_send(event, hint):
    """Redact PII keys anywhere in the event tree before send."""
    def scrub(d):
        if isinstance(d, dict):
            for k in list(d):
                if any(s in k.lower() for s in PII_KEYS):
                    d[k] = "[Filtered]"
                else:
                    scrub(d[k])
        elif isinstance(d, list):
            for v in d: scrub(v)
    scrub(event)
    return event

sentry_sdk.init(
    dsn="https://abc123@o0.ingest.sentry.io/0",
    environment="prod",
    release="myapp@1.4.2",
    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        StarletteIntegration(),
        SqlalchemyIntegration(),                       # SQL captured on DB errors
        LoggingIntegration(level=None, event_level=None),  # disable auto-from-logs
    ],
    before_send=before_send,
    send_default_pii=False,                            # never send IPs/cookies even without redact
)

app = FastAPI()

@app.middleware("http")
async def sentry_context(request: Request, call_next):
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("route", request.url.path)
        scope.set_tag("method", request.method)
        scope.set_user({
            "id": request.headers.get("x-user-id"),
            # Email/IP omitted because send_default_pii=False.
        })
        scope.set_context("request", {
            "request_id": request.headers.get("x-request-id"),
            "tenant":     request.headers.get("x-tenant-id"),
        })
    return await call_next(request)

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    if widget_id < 0:
        raise ValueError("negative widget_id")        # captured with full context
    return {"widget_id": widget_id}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: rate-based sampling for high-volume
#             services, performance monitoring (transactions + spans),
#             OTel trace_id correlation so Sentry pivots to your tracing
#             UI, before_send_transaction for dropping noisy spans.
# APPROACH  - traces_sample_rate (perf monitoring) + profiles_sample_rate
#             (continuous profiling) + the OTel propagator that maps
#             Sentry trace_id <-> W3C traceparent. before_send_transaction
#             drops health-check spans at the SDK level (free traffic).
# STRENGTHS - Issue in Sentry -> click trace_id -> opens in Honeycomb /
#             Tempo / Datadog; cost predictable; healthchecks/metrics
#             never reach Sentry's $$$ ingest.
# WEAKNESSES- Three sample-rate knobs to tune (errors / traces / profiles);
#             SDK config grows; document the rationale in a comment.
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.opentelemetry import (
    SentryPropagator, SentrySpanProcessor,
)
from opentelemetry import trace as otel_trace
from opentelemetry.propagate import set_global_textmap
from opentelemetry.sdk.trace import TracerProvider

# 1) Wire Sentry as the OTel propagator so trace_ids match across both.
provider = TracerProvider()
provider.add_span_processor(SentrySpanProcessor())
otel_trace.set_tracer_provider(provider)
set_global_textmap(SentryPropagator())

PII_KEYS = {"password", "token", "authorization", "cookie", "ssn"}

def before_send(event, hint):
    """Redact PII recursively. Keep cheap — runs on every event."""
    def scrub(d):
        if isinstance(d, dict):
            for k in list(d):
                if any(s in k.lower() for s in PII_KEYS):
                    d[k] = "[Filtered]"
                else:
                    scrub(d[k])
        elif isinstance(d, list):
            for v in d: scrub(v)
    scrub(event)
    return event

NOISY_TRANSACTIONS = {"GET /healthz", "GET /metrics", "GET /favicon.ico"}

def before_send_transaction(event, hint):
    """Drop health-check transactions before they hit Sentry's bill."""
    if event.get("transaction") in NOISY_TRANSACTIONS:
        return None                                   # drop entirely
    return event

sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    environment=os.environ.get("ENV", "prod"),
    release=os.environ.get("APP_VERSION", "dev"),

    # --- Sampling ---
    sample_rate=1.0,                                  # errors: always sample
    traces_sample_rate=float(os.environ.get(          # transactions (perf monitoring)
        "SENTRY_TRACES_SAMPLE_RATE", "0.1"            # 10% of requests get full perf traces
    )),
    profiles_sample_rate=float(os.environ.get(        # CPU profiles inside sampled traces
        "SENTRY_PROFILES_SAMPLE_RATE", "0.1"
    )),

    # --- Filters ---
    before_send=before_send,
    before_send_transaction=before_send_transaction,
    send_default_pii=False,
    in_app_include=["myapp"],                         # mark these frames as "in-app"
    max_breadcrumbs=50,                               # cap memory per event

    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ],
)

# 2) traces_sampler — function form for per-request sampling decisions.
def traces_sampler(sampling_context: dict) -> float:
    """Sample ALL errored requests; sample 10% of healthy ones."""
    txn = sampling_context.get("transaction_context", {}).get("name", "")
    if txn.endswith("/healthz") or txn.endswith("/metrics"):
        return 0                                       # never sample
    if "error" in sampling_context:                   # forced sample on errors
        return 1.0
    return 0.1

# Replace traces_sample_rate with traces_sampler when you need per-request logic.
# sentry_sdk.init(..., traces_sampler=traces_sampler)

# 3) Manual span / transaction for custom workflows.
def process_payment(amount: int) -> str:
    with sentry_sdk.start_transaction(name="process_payment", op="task") as txn:
        txn.set_data("amount_cents", amount)
        with sentry_sdk.start_span(op="db.charge"):
            ...
        with sentry_sdk.start_span(op="external.api.charge"):
            ...
        return "ok"

# Decision rule:
#   bootstrap a service             -> sentry_sdk.init(dsn, environment, release)
#   ASGI/Flask app                   -> add the framework integration; it sets transaction names
#   high traffic, $$ pressure        -> traces_sample_rate=0.1; before_send_transaction drops healthchecks
#   per-request decision              -> traces_sampler function (always sample errors, 10% otherwise)
#   PII risk                          -> send_default_pii=False + before_send recursive redactor
#   already running OTel              -> SentryPropagator + SentrySpanProcessor; trace_ids align
#   SQL errors with the query         -> SqlalchemyIntegration; SQL appears on DB exceptions
#   custom domain workflows           -> sentry_sdk.start_transaction(name=...) explicit
#   release tracking                  -> set release=APP_VERSION; deploys appear on Sentry timeline
#   user feedback widget              -> sentry-javascript on the frontend; sentry-python only on server
#
# Anti-pattern: leaving traces_sample_rate at 1.0 in production for a
# high-traffic service. Sentry charges per transaction; at 1000 RPS
# 24/7 that's ~2.6B transactions/month. Most plans cap at 10M before
# overage. Use 0.1 (10%) or a traces_sampler that always samples errors
# and 5-10% of healthy traffic. Healthcheck routes should sample 0.
```

## Decision Rule

```text
bootstrap a service             -> sentry_sdk.init(dsn, environment, release)
ASGI/Flask app                   -> add the framework integration; it sets transaction names
high traffic, $$ pressure        -> traces_sample_rate=0.1; before_send_transaction drops healthchecks
per-request decision              -> traces_sampler function (always sample errors, 10% otherwise)
PII risk                          -> send_default_pii=False + before_send recursive redactor
already running OTel              -> SentryPropagator + SentrySpanProcessor; trace_ids align
SQL errors with the query         -> SqlalchemyIntegration; SQL appears on DB exceptions
custom domain workflows           -> sentry_sdk.start_transaction(name=...) explicit
release tracking                  -> set release=APP_VERSION; deploys appear on Sentry timeline
user feedback widget              -> sentry-javascript on the frontend; sentry-python only on server
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving traces_sample_rate at 1.0 in production for a
> high-traffic service. Sentry charges per transaction; at 1000 RPS
> 24/7 that's ~2.6B transactions/month. Most plans cap at 10M before
> overage. Use 0.1 (10%) or a traces_sampler that always samples errors
> and 5-10% of healthy traffic. Healthcheck routes should sample 0.

## Tips

- Set `environment` and `release` on every init. Environment lets you filter dev/staging/prod; release ties errors to deploys (Sentry can show "this regression started at deploy 1.4.2").
- Use `send_default_pii=False` and a `before_send` redactor by default. Sentry captures request bodies and headers — without these, you ship every Authorization header to a third party.
- `traces_sample_rate=0.1` is a sane production default. Tune via `SENTRY_TRACES_SAMPLE_RATE` env var so deploys can adjust without code changes.
- Use a `traces_sampler` function (not a flat rate) when you want "always sample errors, 10% of healthy, 0% of healthchecks". Three lines, big cost savings.
- The `SentryPropagator` + `SentrySpanProcessor` integration with OTel makes Sentry trace_ids match your tracing-UI trace_ids. Click from Sentry to Tempo/Honeycomb is the highest-leverage debugging pivot.
- `in_app_include=["myapp"]` marks YOUR frames in stack traces (Sentry shows them prominently); library frames stay collapsed by default. Without this, every error's primary frame is FastAPI internals.

## Common Mistake

> [!warning] Leaving `traces_sample_rate=1.0` (100%) in production for a high-traffic service. Sentry charges per transaction — 1000 RPS × 24/7 is ~2.6B transactions/month, blowing past most plans' caps. Use `traces_sample_rate=0.1` or a traces_sampler that always samples errors and 5-10% of healthy traffic; healthchecks should sample 0 via `before_send_transaction`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# 100% perf monitoring on a busy service — billing surprise
sentry_sdk.init(dsn=DSN, traces_sample_rate=1.0)
```

**Senior:**
```python
# 10% sampled, errors always; healthchecks dropped
sentry_sdk.init(dsn=DSN, traces_sample_rate=0.1,
                before_send_transaction=drop_healthchecks)
```

## See Also

- [[Sections/observability/errors-alerting/structured-error-context|Correlated error context — one ID across logs, traces, Sentry (Observability)]]
- [[Sections/observability/errors-alerting/_Index|Observability → Error Tracking & Alerting — Sentry, correlation, SLO-based alerts]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

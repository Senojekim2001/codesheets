---
type: "entry"
domain: "python"
file: "observability"
section: "metrics"
id: "prometheus-client"
title: "prometheus_client — Counter / Histogram / Gauge for Prometheus"
category: "Metrics"
subtitle: "Counter / Histogram / Gauge / Summary, labels, start_http_server, generate_latest, multiprocess_mode, CollectorRegistry, ASGI middleware"
signature_short: "requests = Counter(\"requests_total\", \"...\", labelnames=[\"route\", \"method\", \"status\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "prometheus_client — Counter / Histogram / Gauge for Prometheus"
  - "prometheus-client"
tags:
  - "python"
  - "python/observability"
  - "python/observability/metrics"
  - "category/metrics"
  - "tier/tiered"
---

# prometheus_client — Counter / Histogram / Gauge for Prometheus

> Counter / Histogram / Gauge / Summary, labels, start_http_server, generate_latest, multiprocess_mode, CollectorRegistry, ASGI middleware

## Overview

prometheus_client is the canonical metrics library when Prometheus scrapes your service. The model: declare metrics at module load (Counter, Histogram, Gauge, Summary); add labels for dimensions you'll query; increment / observe in handlers; expose `/metrics` for scraping. Multi-process Python (gunicorn pre-fork) needs a shared filesystem registry — easy to get wrong. The three examples solve the SAME concrete task — a web service exposes request count, latency histogram, and error rate per route, scraped by Prometheus — at three depths: globally-registered metrics + manual increments → per-route labels + ASGI middleware that records every request automatically → production-grade with multiprocess registry, exemplars linking to trace_ids, and cardinality protection.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A web service exposes request count, latency, and error rate at /metrics for Prometheus to scrape.
- **Junior** — SAME — but record EVERY request automatically (no manual instrumentation in handlers), with route + method + status, Histogram buckets matching the SLO.
- **Senior** — SAME — production: gunicorn pre-fork workers (multiprocess registry), exemplars linking metric points to trace_ids, cardinality protection on the route label.

## Signature

```python
requests = Counter("requests_total", "...", labelnames=["route", "method", "status"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A web service exposes request count, latency, and error rate
#             at /metrics for Prometheus to scrape.
# APPROACH  - Declare Counter + Histogram + Gauge globally; increment in
#             the handler; start_http_server exposes /metrics on a port.
# STRENGTHS - Smallest correct setup; runs in any sync app.
# WEAKNESSES- Single-process only — gunicorn multi-worker needs the
#             multiprocess registry (senior tier).
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Metrics are registered to the default registry on creation.
REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    labelnames=["method", "status"],
)
LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request duration",
    labelnames=["method"],
)
INFLIGHT = Gauge(
    "http_requests_inflight",
    "Requests currently being handled",
)

def handle(method: str) -> int:
    INFLIGHT.inc()
    start = time.monotonic()
    try:
        # ... do work ...
        time.sleep(0.05)
        status = 200
    finally:
        elapsed = time.monotonic() - start
        REQUESTS.labels(method=method, status=str(status)).inc()
        LATENCY.labels(method=method).observe(elapsed)
        INFLIGHT.dec()
    return status

# Expose /metrics on a separate port (so app traffic and scrape don't share).
start_http_server(9090)

handle("GET")
handle("POST")

# Then in your prometheus.yml scrape config:
# scrape_configs:
#   - job_name: 'myapp'
#     static_configs:
#       - targets: ['localhost:9090']
#
# Test:
#   $ curl http://localhost:9090/metrics
#   # HELP http_requests_total Total HTTP requests
#   # TYPE http_requests_total counter
#   http_requests_total{method="GET",status="200"} 1.0
#   http_requests_total{method="POST",status="200"} 1.0
#   # HELP http_request_duration_seconds ...
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but record EVERY request automatically (no manual
#             instrumentation in handlers), with route + method + status,
#             Histogram buckets matching the SLO.
# APPROACH  - ASGI middleware wraps every request; Histogram with custom
#             buckets that match your latency budget (10ms, 50ms, 100ms,
#             500ms, etc.); served from /metrics on the SAME port as the app.
# STRENGTHS- One middleware, all routes covered; SLO-aligned buckets give
#             accurate p95/p99 (default buckets are too coarse for fast services).
# WEAKNESSES- Still single-process; route label requires care (use template
#             "/widgets/{id}" not raw "/widgets/42" or cardinality explodes).
import time
from prometheus_client import (
    Counter, Histogram, Gauge,
    generate_latest, CONTENT_TYPE_LATEST,
)
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# SLO-aligned buckets — match your latency targets.
LATENCY_BUCKETS = (
    0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0,
)

REQUESTS = Counter(
    "http_requests_total", "Total HTTP requests",
    labelnames=["route", "method", "status"],
)
LATENCY = Histogram(
    "http_request_duration_seconds", "Request duration",
    labelnames=["route", "method"],
    buckets=LATENCY_BUCKETS,
)
INFLIGHT = Gauge(
    "http_requests_inflight", "Requests currently being handled",
    labelnames=["route", "method"],
)
EXCEPTIONS = Counter(
    "http_request_exceptions_total", "Exceptions raised in handlers",
    labelnames=["route", "method", "exc_type"],
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Use the route TEMPLATE, not the literal path. /widgets/{id} not /widgets/42.
        route = request.scope.get("route").path if request.scope.get("route") else request.url.path
        method = request.method

        INFLIGHT.labels(route=route, method=method).inc()
        start = time.monotonic()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        except Exception as e:
            EXCEPTIONS.labels(route=route, method=method, exc_type=type(e).__name__).inc()
            raise
        finally:
            elapsed = time.monotonic() - start
            REQUESTS.labels(route=route, method=method, status=str(status)).inc()
            LATENCY.labels(route=route, method=method).observe(elapsed)
            INFLIGHT.labels(route=route, method=method).dec()

app = FastAPI()
app.add_middleware(PrometheusMiddleware)

# Serve /metrics on the same port as the app (vs start_http_server).
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int):
    return {"widget_id": widget_id}

# Now the scraper sees:
#   http_requests_total{route="/widgets/{widget_id}",method="GET",status="200"} 142
#   http_request_duration_seconds_bucket{route="...",method="GET",le="0.05"} 138
#   http_request_duration_seconds_bucket{route="...",method="GET",le="0.1"}  142
#   ... (one bucket per LATENCY_BUCKETS entry)
#
# Compute p95 in PromQL:
#   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: gunicorn pre-fork workers (multiprocess
#             registry), exemplars linking metric points to trace_ids,
#             cardinality protection on the route label.
# APPROACH  - PROMETHEUS_MULTIPROC_DIR env var + multiprocess.MultiProcessCollector;
#             pass exemplar={"trace_id": ...} on .observe(); guard the
#             route label against unknown templates.
# STRENGTHS- Works under gunicorn -w N (the default Python deploy);
#             clicking a histogram bar in Grafana opens the trace that
#             produced it; route label can't explode if a malformed
#             URL slips through.
# WEAKNESSES- Multiprocess setup requires a shared dir + per-worker
#             cleanup at exit; exemplars require Prometheus 2.30+ AND
#             OpenMetrics format on /metrics.
import os, glob, signal, atexit
from typing import Iterable
from prometheus_client import (
    Counter, Histogram, CollectorRegistry, multiprocess,
    generate_latest, CONTENT_TYPE_LATEST,
    REGISTRY, values,
)
from prometheus_client.exposition import choose_encoder
from opentelemetry import trace as otel_trace
from fastapi import FastAPI, Request, Response

# 1) Multiprocess registry setup.
#    REQUIRED env var pointing at an empty/clean directory:
#       PROMETHEUS_MULTIPROC_DIR=/tmp/prom_metrics
#    Each worker writes per-process .db files there; the scrape endpoint
#    aggregates them via MultiProcessCollector.
MULTI_DIR = os.environ.get("PROMETHEUS_MULTIPROC_DIR")
if MULTI_DIR:
    os.makedirs(MULTI_DIR, exist_ok=True)
    # Wipe stale files from a previous boot — otherwise dead workers haunt the data.
    for f in glob.glob(os.path.join(MULTI_DIR, "*")):
        os.unlink(f)

# Some metrics need explicit multiprocess_mode for correctness across workers.
LATENCY = Histogram(
    "http_request_duration_seconds", "Request duration",
    labelnames=["route", "method"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)
REQUESTS = Counter(
    "http_requests_total", "Total HTTP requests",
    labelnames=["route", "method", "status"],
)

# 2) /metrics handler that aggregates per-worker files when multiprocess.
def metrics_response() -> Response:
    if MULTI_DIR:
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
        body = generate_latest(registry)
    else:
        body = generate_latest(REGISTRY)
    return Response(content=body, media_type=CONTENT_TYPE_LATEST)

# 3) Exemplars — attach trace_id to a histogram observation.
def observe_with_exemplar(histogram, value: float, **labels) -> None:
    span = otel_trace.get_current_span()
    ctx = span.get_span_context() if span else None
    exemplar = None
    if ctx and ctx.is_valid:
        exemplar = {
            "trace_id": format(ctx.trace_id, "032x"),
            "span_id":  format(ctx.span_id,  "016x"),
        }
    histogram.labels(**labels).observe(value, exemplar=exemplar)

# 4) Cardinality-safe route label — only known route templates allowed.
KNOWN_ROUTES: set[str] = set()  # filled at startup from app.routes

def safe_route(scope) -> str:
    route = (scope.get("route").path if scope.get("route") else "")
    return route if route in KNOWN_ROUTES else "<other>"

# 5) Worker-exit cleanup: tell the registry this worker is done.
def _on_exit(*_):
    if MULTI_DIR:
        multiprocess.mark_process_dead(os.getpid())
atexit.register(_on_exit)
signal.signal(signal.SIGTERM, lambda *_: (_on_exit(), os._exit(0)))

# 6) Wire it up.
app = FastAPI()

@app.on_event("startup")
async def populate_route_set():
    for r in app.routes:
        path = getattr(r, "path", None)
        if path:
            KNOWN_ROUTES.add(path)

import time
from starlette.middleware.base import BaseHTTPMiddleware

class PromMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        route = safe_route(request.scope)
        method = request.method
        start = time.monotonic()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            elapsed = time.monotonic() - start
            REQUESTS.labels(route=route, method=method, status=str(status)).inc()
            observe_with_exemplar(LATENCY, elapsed, route=route, method=method)

app.add_middleware(PromMiddleware)

@app.get("/metrics")
async def metrics():
    return metrics_response()

# Decision rule:
#   single-process app (e.g. asyncio)   -> default registry; no multiprocess setup
#   gunicorn / uwsgi multi-worker        -> PROMETHEUS_MULTIPROC_DIR + MultiProcessCollector
#   need to link metric -> trace         -> exemplars; .observe(value, exemplar={"trace_id": ...})
#   want SLO-accurate p95                 -> custom buckets matching your latency budget
#   route label might explode             -> whitelist known templates; bucket unknowns to "<other>"
#   Counter for things that decrease     -> WRONG — Counter only goes up; use Gauge
#   value with running average           -> Summary (computes quantiles client-side; no aggregation across pods)
#   value with global percentile         -> Histogram + histogram_quantile in PromQL
#   metric needs to track an external resource -> custom Collector (def collect(): yield Metric(...))
#   pushgateway "batch job that exits"   -> push_to_gateway(); avoid for long-running services
#
# Anti-pattern: using Summary for latency in a multi-pod deployment.
# Summary computes quantiles inside the process; you cannot aggregate
# Summary quantiles across pods (averaging quantiles is mathematically
# meaningless). Use Histogram instead — it ships counts per bucket;
# Prometheus aggregates with histogram_quantile() correctly across pods.
```

## Decision Rule

```text
single-process app (e.g. asyncio)   -> default registry; no multiprocess setup
gunicorn / uwsgi multi-worker        -> PROMETHEUS_MULTIPROC_DIR + MultiProcessCollector
need to link metric -> trace         -> exemplars; .observe(value, exemplar={"trace_id": ...})
want SLO-accurate p95                 -> custom buckets matching your latency budget
route label might explode             -> whitelist known templates; bucket unknowns to "<other>"
Counter for things that decrease     -> WRONG — Counter only goes up; use Gauge
value with running average           -> Summary (computes quantiles client-side; no aggregation across pods)
value with global percentile         -> Histogram + histogram_quantile in PromQL
metric needs to track an external resource -> custom Collector (def collect(): yield Metric(...))
pushgateway "batch job that exits"   -> push_to_gateway(); avoid for long-running services
```

## Anti-Pattern

> [!warning] Anti-pattern
> using Summary for latency in a multi-pod deployment.
> Summary computes quantiles inside the process; you cannot aggregate
> Summary quantiles across pods (averaging quantiles is mathematically
> meaningless). Use Histogram instead — it ships counts per bucket;
> Prometheus aggregates with histogram_quantile() correctly across pods.

## Tips

- Metrics are global state — declare them at module load, not per-request. Re-creating a metric in a function raises "Duplicated timeseries in CollectorRegistry".
- Use the ROUTE TEMPLATE, not the literal path, as the route label. `/widgets/{widget_id}` is one series; `/widgets/42` + `/widgets/43` + ... is millions.
- Default Histogram buckets (5ms, 10ms, 25ms, ..., 10s) are coarse. Override `buckets=` to match your SLO — without aligned buckets, `histogram_quantile` returns garbage.
- For gunicorn/uwsgi multi-worker, you MUST set `PROMETHEUS_MULTIPROC_DIR` to a writable directory and use `MultiProcessCollector` in your /metrics handler. Without it, only one worker's metrics are scraped.
- On worker shutdown, call `multiprocess.mark_process_dead(os.getpid())` so stale .db files don't haunt later scrapes. Hook to atexit + SIGTERM.
- Exemplars require Prometheus 2.30+ AND requesting OpenMetrics format on the scrape (Prometheus does this automatically when `Accept: application/openmetrics-text`). Without that, exemplars are silently dropped.

## Common Mistake

> [!warning] Using Summary for latency in a multi-pod deployment. Summary computes quantiles INSIDE THE PROCESS — you cannot aggregate Summary quantiles across pods (averaging quantiles is mathematically meaningless; the Prometheus docs warn about this explicitly). Use Histogram, which ships counts per bucket; Prometheus aggregates correctly across pods via `histogram_quantile()`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Summary computes quantiles per-process; can't aggregate
LATENCY = Summary("http_latency_seconds", "...")
LATENCY.observe(elapsed)
```

**Senior:**
```python
# Histogram ships bucket counts; aggregate across pods in PromQL
LATENCY = Histogram("http_latency_seconds", "...", buckets=BUCKETS)
LATENCY.observe(elapsed)
# histogram_quantile(0.95, sum(rate(http_latency_seconds_bucket[5m])) by (le))
```

## See Also

- [[Sections/observability/metrics/otel-metrics|OpenTelemetry metrics — unified pipeline with traces (Observability)]]
- [[Sections/observability/metrics/metric-cardinality|Cardinality discipline — design metrics that don't explode (Observability)]]
- [[Sections/observability/metrics/_Index|Observability → Metrics — Prometheus, OpenTelemetry, cardinality discipline]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

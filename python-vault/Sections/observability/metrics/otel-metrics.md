---
type: "entry"
domain: "python"
file: "observability"
section: "metrics"
id: "otel-metrics"
title: "OpenTelemetry metrics — unified pipeline with traces"
category: "Metrics"
subtitle: "MeterProvider, Meter, Counter / Histogram / UpDownCounter, ObservableGauge, View, Aggregation, OTLPMetricExporter, PeriodicExportingMetricReader"
signature_short: "meter = metrics.get_meter(\"name\"); requests = meter.create_counter(\"http_requests\"); requests.add(1, {...})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OpenTelemetry metrics — unified pipeline with traces"
  - "otel-metrics"
tags:
  - "python"
  - "python/observability"
  - "python/observability/metrics"
  - "category/metrics"
  - "tier/tiered"
---

# OpenTelemetry metrics — unified pipeline with traces

> MeterProvider, Meter, Counter / Histogram / UpDownCounter, ObservableGauge, View, Aggregation, OTLPMetricExporter, PeriodicExportingMetricReader

## Overview

OpenTelemetry metrics is the metric-side counterpart to OTel traces — same SDK shape, same OTLP exporter, same collector pipeline. Versus prometheus_client: less ecosystem maturity in Python (smaller plugin set), more upfront ceremony, but a single observability pipeline (traces + metrics + logs in one OTLP stream) and vendor portability (Honeycomb, Datadog, Tempo all consume OTLP). The decision usually comes down to "are you already running OTel for traces?" If yes, OTel metrics; if you only need metrics for Prometheus, prometheus_client is simpler. The three examples solve the SAME concrete task — a web service exposes request count and latency, exported via OTel — at three depths: Meter + Counter + Histogram with ConsoleExporter → OTLP exporter to a collector + Views to drop high-cardinality attributes → production setup with exemplars, observable callbacks for resource metrics (memory, queue depth), and Prometheus exporter as a drop-in for existing scrapers.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A service emits request count and latency via OTel.
- **Junior** — SAME — but ship to an OTLP collector, drop high-cardinality attributes via Views, and add an observable gauge for "current queue depth".
- **Senior** — SAME — production-grade: exemplars linking metrics to traces, auto-instrumented HTTP/DB metrics, Prometheus exporter as drop-in for existing Prom scrapers, graceful shutdown.

## Signature

```python
meter = metrics.get_meter("name"); requests = meter.create_counter("http_requests"); requests.add(1, {...})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A service emits request count and latency via OTel.
# APPROACH  - MeterProvider + ConsoleMetricExporter + PeriodicReader;
#             create Counter + Histogram instruments; .add() / .record()
#             on each request.
# STRENGTHS - One pipeline alongside OTel traces; minimal setup;
#             OTLP-native (vendor-portable).
# WEAKNESSES- Console output is for verification — ship to OTLP for
#             a real metrics backend.
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    PeriodicExportingMetricReader,
    ConsoleMetricExporter,
)

# 1) Configure the SDK once at startup.
reader = PeriodicExportingMetricReader(
    exporter=ConsoleMetricExporter(),
    export_interval_millis=10_000,                   # export every 10s
)
provider = MeterProvider(metric_readers=[reader])
metrics.set_meter_provider(provider)

# 2) Get a meter; create instruments.
meter = metrics.get_meter("orders.handler")

requests = meter.create_counter(
    "http.server.request.count",
    description="Total HTTP requests",
    unit="{request}",
)
latency = meter.create_histogram(
    "http.server.request.duration",
    description="Request duration",
    unit="s",
)

# 3) Record measurements with attributes (the metric's labels).
import time
def handle(method: str, route: str) -> int:
    start = time.monotonic()
    status = 200
    # ... handle the request ...
    elapsed = time.monotonic() - start
    requests.add(1, {"http.method": method, "http.route": route, "http.status_code": status})
    latency.record(elapsed, {"http.method": method, "http.route": route})
    return status

handle("GET", "/widgets/{id}")

# Console output every 10s shows accumulated metric points.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but ship to an OTLP collector, drop high-cardinality
#             attributes via Views, and add an observable gauge for
#             "current queue depth".
# APPROACH  - OTLPMetricExporter; View with attribute_keys to whitelist
#             dimensions; create_observable_gauge with a callback that
#             samples the value at export time.
# STRENGTHS- Same OTLP pipeline as traces (one collector); Views control
#             cardinality at the SDK level (before export); observable
#             gauges are pull-based (only sampled at export time).
# WEAKNESSES- View configuration is verbose; debug by enabling
#             ConsoleExporter alongside OTLP during dev.
import os, time
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.metrics.view import View, ExplicitBucketHistogramAggregation
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

resource = Resource.create({
    SERVICE_NAME: "orders",
    SERVICE_VERSION: os.environ.get("APP_VERSION", "dev"),
})

# Views shape what the SDK actually exports.
LATENCY_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)

views = [
    # Custom buckets for the latency histogram.
    View(
        instrument_name="http.server.request.duration",
        aggregation=ExplicitBucketHistogramAggregation(boundaries=LATENCY_BUCKETS),
    ),
    # Drop high-cardinality attributes from request count.
    View(
        instrument_name="http.server.request.count",
        attribute_keys={"http.method", "http.route", "http.status_code"},
        # ANY attribute not listed here is DROPPED before export.
    ),
]

reader = PeriodicExportingMetricReader(
    exporter=OTLPMetricExporter(
        endpoint=os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
    ),
    export_interval_millis=10_000,
)
provider = MeterProvider(resource=resource, metric_readers=[reader], views=views)
metrics.set_meter_provider(provider)

meter = metrics.get_meter(__name__)

requests = meter.create_counter("http.server.request.count")
latency = meter.create_histogram("http.server.request.duration")

# Observable gauge — callback sampled at export time, no manual increment.
queue: list = []                                      # the thing we're measuring
def queue_depth_callback(options):
    from opentelemetry.metrics import Observation
    return [Observation(len(queue), {"queue.name": "orders"})]

meter.create_observable_gauge(
    name="queue.depth",
    callbacks=[queue_depth_callback],
    description="Current queue depth",
)

# UpDownCounter — like Counter but goes both ways (in-flight requests).
inflight = meter.create_up_down_counter(
    "http.server.requests.inflight",
    description="Requests currently being handled",
)

def handle(method: str, route: str):
    inflight.add(1, {"http.route": route})
    start = time.monotonic()
    try:
        time.sleep(0.05)
        status = 200
    finally:
        elapsed = time.monotonic() - start
        requests.add(1, {"http.method": method, "http.route": route, "http.status_code": status})
        latency.record(elapsed, {"http.method": method, "http.route": route})
        inflight.add(-1, {"http.route": route})

handle("GET", "/widgets/{id}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: exemplars linking metrics to traces,
#             auto-instrumented HTTP/DB metrics, Prometheus exporter as
#             drop-in for existing Prom scrapers, graceful shutdown.
# APPROACH  - Use FastAPI/SQLAlchemy instrumentations (they emit metrics
#             via the OTel Meter, not just spans); add PrometheusMetricReader
#             for /metrics scrape compatibility; force_flush at shutdown.
# STRENGTHS- One library stack (OTel) for traces + metrics; existing
#             Prometheus scrapers keep working; metric points carry
#             trace_ids so Grafana can pivot from a metric to its trace.
# WEAKNESSES- Some Python instrumentations emit traces only (not metrics
#             yet); prometheus_client is more mature for Python-specific
#             cases like multiprocess gunicorn.
import os, atexit, signal
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.metrics.view import View
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from prometheus_client import start_http_server      # for the Prom-format scrape

# Auto-instrumentations that emit metrics (not just spans).
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
# from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

def configure_metrics() -> MeterProvider:
    resource = Resource.create({SERVICE_NAME: os.environ["SERVICE_NAME"]})

    # Multiple readers — OTLP push to collector AND Prometheus pull.
    otlp_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(),                          # honors OTEL_EXPORTER_OTLP_*
        export_interval_millis=10_000,
    )
    prom_reader = PrometheusMetricReader()

    views = [
        # Drop user_id (high cardinality) from any metric that picks it up.
        View(
            instrument_name="*",
            attribute_keys=set(),                      # whitelist nothing? no — see comment below
        ),
    ]
    # NOTE: an empty whitelist View on instrument_name="*" drops ALL attrs.
    # In practice, prefer SPECIFIC views per instrument with the attrs you want.

    provider = MeterProvider(
        resource=resource,
        metric_readers=[otlp_reader, prom_reader],
        # Don't apply the wildcard above; it's illustrative — use per-instrument views in real config.
    )
    metrics.set_meter_provider(provider)

    # Graceful shutdown — flush both readers.
    def _flush(*_):
        provider.force_flush(timeout_millis=5000)
        provider.shutdown()
    atexit.register(_flush)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, lambda *_: (_flush(), os._exit(0)))

    return provider

# 1) Bootstrap.
configure_metrics()

# Prometheus scrape endpoint on a separate port (PrometheusMetricReader uses the prometheus_client registry).
start_http_server(9090)                                # Prometheus scrapes here

# 2) Auto-instrumentation gives you HTTP server metrics for free.
from fastapi import FastAPI
app = FastAPI()
FastAPIInstrumentor.instrument_app(app)
# Now http.server.duration / http.server.active_requests / etc. are emitted
# automatically. NO manual middleware needed.

# 3) Custom domain metrics, with attributes that cross-link to traces.
meter = metrics.get_meter(__name__)
orders_placed = meter.create_counter("orders.placed.total", description="Orders placed")

@app.post("/orders")
async def place_order(amount: int):
    # The active span's trace_id will be attached as an exemplar by OTel
    # automatically when both metrics + traces are configured.
    orders_placed.add(1, {"order.amount_band": "small" if amount < 100 else "large"})
    return {"id": "ord_001"}

# Decision rule:
#   already running OTel for traces       -> OTel metrics; one pipeline, one collector
#   only need Prometheus                   -> prometheus_client; simpler, more mature in Python
#   need both Prom AND OTLP                -> two readers (PrometheusMetricReader + OTLPMetricExporter)
#   shape what's exported                  -> View per instrument with attribute_keys whitelist
#   custom histogram buckets               -> View with ExplicitBucketHistogramAggregation
#   external resource (queue, cache)       -> create_observable_gauge with callback
#   value can go down (in-flight)          -> create_up_down_counter (NOT counter)
#   gunicorn multi-worker                  -> use prometheus_client multiprocess; OTel Python isn't there yet
#   exemplars linking metric to trace      -> automatic when traces + metrics share the same SDK
#   shutdown losing the last batch         -> provider.force_flush() in atexit + SIGTERM handler
#
# Anti-pattern: using OTel metrics for a Python service that ONLY needs
# Prometheus output and runs under gunicorn with multiple workers. The
# OTel Python metrics SDK doesn't have a multiprocess mode yet (as of
# 2026); each worker exports its own values, which the Prometheus
# exporter doesn't aggregate across workers. prometheus_client with
# PROMETHEUS_MULTIPROC_DIR is the right answer for that case. Use OTel
# metrics when you need OTLP, vendor portability, or unified pipeline
# with traces — not because "it's the new thing".
```

## Decision Rule

```text
already running OTel for traces       -> OTel metrics; one pipeline, one collector
only need Prometheus                   -> prometheus_client; simpler, more mature in Python
need both Prom AND OTLP                -> two readers (PrometheusMetricReader + OTLPMetricExporter)
shape what's exported                  -> View per instrument with attribute_keys whitelist
custom histogram buckets               -> View with ExplicitBucketHistogramAggregation
external resource (queue, cache)       -> create_observable_gauge with callback
value can go down (in-flight)          -> create_up_down_counter (NOT counter)
gunicorn multi-worker                  -> use prometheus_client multiprocess; OTel Python isn't there yet
exemplars linking metric to trace      -> automatic when traces + metrics share the same SDK
shutdown losing the last batch         -> provider.force_flush() in atexit + SIGTERM handler
```

## Anti-Pattern

> [!warning] Anti-pattern
> using OTel metrics for a Python service that ONLY needs
> Prometheus output and runs under gunicorn with multiple workers. The
> OTel Python metrics SDK doesn't have a multiprocess mode yet (as of
> 2026); each worker exports its own values, which the Prometheus
> exporter doesn't aggregate across workers. prometheus_client with
> PROMETHEUS_MULTIPROC_DIR is the right answer for that case. Use OTel
> metrics when you need OTLP, vendor portability, or unified pipeline
> with traces — not because "it's the new thing".

## Tips

- Use `Counter` for monotonically increasing values (request count), `UpDownCounter` for values that can decrease (in-flight requests, queue depth), `Histogram` for distributions, `ObservableGauge` for "sample this value at export time" (memory, cache size).
- Views are how you control what gets exported. `attribute_keys={"http.route", "http.method"}` whitelists those dimensions and drops the rest — your protection against high-cardinality attribute leakage.
- For latency histograms, override the default buckets. The default is generic; use `ExplicitBucketHistogramAggregation(boundaries=...)` with values that match your SLO.
- `PrometheusMetricReader` exposes the OTel-collected metrics in Prometheus exposition format — the cleanest path if you want OTel internally but external scrapers (Prometheus, kube-prometheus-stack) untouched.
- OTel auto-instrumentations (FastAPI, SQLAlchemy, Redis) emit METRICS as well as spans when both SDKs are configured. You get http.server.duration / http.server.active_requests for free.
- For Python under gunicorn multi-worker, prometheus_client with PROMETHEUS_MULTIPROC_DIR is still the right answer. OTel Python metrics SDK doesn't have multiprocess support as of 2026.

## Common Mistake

> [!warning] Using OTel metrics for a Python service that ONLY needs Prometheus output and runs under gunicorn with multiple workers. OTel Python metrics SDK doesn't have a multiprocess mode (as of 2026); each worker exports its own values which Prometheus doesn't aggregate across workers. prometheus_client with PROMETHEUS_MULTIPROC_DIR is correct for that case. Use OTel when you need OTLP, vendor portability, or unified-with-traces — not as a default.

## Shorthand (Junior → Senior)

**Junior:**
```python
# OTel metrics under gunicorn -w 4 — workers don't aggregate
provider = MeterProvider(metric_readers=[OTLPMetricExporter()])
```

**Senior:**
```python
# prometheus_client multiprocess — well-trodden path
os.environ["PROMETHEUS_MULTIPROC_DIR"] = "/tmp/prom"
# /metrics handler aggregates via MultiProcessCollector
```

## See Also

- [[Sections/observability/metrics/prometheus-client|prometheus_client — Counter / Histogram / Gauge for Prometheus (Observability)]]
- [[Sections/observability/metrics/metric-cardinality|Cardinality discipline — design metrics that don't explode (Observability)]]
- [[Sections/observability/metrics/_Index|Observability → Metrics — Prometheus, OpenTelemetry, cardinality discipline]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

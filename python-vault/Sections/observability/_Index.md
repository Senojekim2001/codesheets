---
type: "file-index"
domain: "python"
file: "observability"
title: "Observability"
tags:
  - "python"
  - "python/observability"
  - "index"
---

# Observability

> 12 entries across 4 sections.

## Structured Logging — structlog, correlation IDs, sampling · 3

- [[Sections/observability/structured-logging/structlog-basics|structlog — structured logging with dev + prod renderers]] — Replace stdlib logging with structlog: log lines as key/value events, JSON in production, colorized human-readable in dev. The library every modern Python service ships with.
- [[Sections/observability/structured-logging/log-correlation-ids|Correlation IDs — propagate request_id across logs and services]] — Generate a unique request_id at the edge; thread it through every log line in the request via contextvars; propagate to downstream service calls via headers. The single biggest debuggability win in distributed Python services.
- [[Sections/observability/structured-logging/log-sampling-budgets|Log sampling — keep signal, drop volume, hit a budget]] — When log volume blows the bill (Datadog $0.10/GB, Cloudwatch $0.50/GB ingested), sample. Tiered sampling — 100% errors, 1% healthchecks, force-log on a header — preserves debuggability while cutting volume 80%+.

## Distributed Tracing — OpenTelemetry, instrumentation, propagation · 3

- [[Sections/observability/distributed-tracing/otel-tracing-setup|OpenTelemetry tracing — SDK setup, spans, exporters]] — Bootstrap the OTel Python SDK: TracerProvider, BatchSpanProcessor, OTLP exporter to a collector. The minimum infrastructure that makes every request a span tree.
- [[Sections/observability/distributed-tracing/otel-instrumentation|OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis]] — Drop-in libraries that wrap popular frameworks/clients to emit spans automatically: every request, every query, every outbound call becomes a span without per-call code.
- [[Sections/observability/distributed-tracing/span-context-propagation|Span context propagation — across async, threads, queues]] — A request hits service A → spawns a Celery task → calls service B. The trace must show A → task → B as one tree. Context propagates automatically across asyncio; manually for queues, threads, and custom transports.

## Metrics — Prometheus, OpenTelemetry, cardinality discipline · 3

- [[Sections/observability/metrics/prometheus-client|prometheus_client — Counter / Histogram / Gauge for Prometheus]] — Official Prometheus Python client: register metrics globally, expose /metrics HTTP endpoint, increment in handlers. The default for Python services scraped by Prometheus.
- [[Sections/observability/metrics/otel-metrics|OpenTelemetry metrics — unified pipeline with traces]] — OTel's metrics SDK: same exporter pipeline as traces, OTLP-native, vendor-portable. Pick OTel metrics when you already export traces via OTel and want one collector pipeline.
- [[Sections/observability/metrics/metric-cardinality|Cardinality discipline — design metrics that don't explode]] — A metric with a `user_id` label creates one time-series per user; quickly hits millions of series; Prometheus OOMs and you can't debug because the metrics are gone. Cardinality is the metrics designer's primary constraint.

## Error Tracking & Alerting — Sentry, correlation, SLO-based alerts · 3

- [[Sections/observability/errors-alerting/sentry-sdk|Sentry SDK — production exception tracking]] — Capture every exception with user, request, deployment context and a clickable stack trace; route to Slack/PagerDuty. The default error-tracking install for Python services.
- [[Sections/observability/errors-alerting/structured-error-context|Correlated error context — one ID across logs, traces, Sentry]] — When something fails, the operator should pivot from a Sentry email to its log lines to its full trace with one click. The single ID that ties them together (trace_id) must be set everywhere.
- [[Sections/observability/errors-alerting/alerting-rules|SLO-based alerting — multi-window, multi-burn-rate PromQL]] — Translate a 99.9% availability SLO into Prometheus alerting rules that page when the SLO is at risk and stay silent otherwise. The Google SRE workbook pattern: multi-window multi-burn-rate.

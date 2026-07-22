---
type: "entry"
domain: "python"
file: "containerization"
section: "container-ops"
id: "container-logging"
title: "Container logging — stdout JSON, no log files, trace correlation"
category: "Container Ops"
subtitle: "logging to stdout, structured JSON via structlog, json-file log driver, max-size + max-file, fluent-bit / vector forwarders, multi-line stack traces, trace_id field"
signature_short: "log to stdout as JSON; orchestrator captures; ship via fluent-bit; correlate via trace_id field"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Container logging — stdout JSON, no log files, trace correlation"
  - "container-logging"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/container-ops"
  - "category/container-ops"
  - "tier/tiered"
---

# Container logging — stdout JSON, no log files, trace correlation

> logging to stdout, structured JSON via structlog, json-file log driver, max-size + max-file, fluent-bit / vector forwarders, multi-line stack traces, trace_id field

## Overview

Containers are stateless: logs go to stdout/stderr where the runtime captures them. Writing log files inside the container is wrong on multiple levels — disk fills (no rotation), logs vanish on pod restart, log shippers can't find them. The right architecture: app logs structured JSON to stdout; the container runtime's log driver (json-file, journald, fluentd) captures it; a log forwarder (Fluent Bit, Vector) parses + ships to a backend (Loki, Splunk, Datadog). Correlate with `trace_id` from OTel so a log line links to its trace. The three examples solve the SAME concrete task — application logs reach the central log shipper as structured, queryable, trace-correlated events — at three depths: print to stdout → structlog JSON + log driver size limits → production with Fluent Bit DaemonSet, multi-line stack-trace handling, redaction, cost analysis.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Application logs reach the orchestrator's log capture.
- **Junior** — SAME — but emit STRUCTURED JSON so the log shipper gets parseable fields, and tune the log driver so logs don't fill disk.
- **Senior** — SAME — production: trace_id correlation, Fluent Bit DaemonSet config, redaction at the source, log-volume cost guardrails.

## Signature

```python
log to stdout as JSON; orchestrator captures; ship via fluent-bit; correlate via trace_id field
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Application logs reach the orchestrator's log capture.
# APPROACH  - print() / logging to stdout; the container runtime
#             captures stdout/stderr automatically.
# STRENGTHS - No setup; works in every container runtime.
# WEAKNESSES- Plain text — log shipper can't parse fields. Junior
#             tier switches to JSON.
import logging

# stdlib logging at INFO level to stdout.
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

log.info("user logged in")
log.warning("rate limit close: 95 of 100")

# Or print() works too:
print("starting myapp")
print("error: db connection refused", flush=True)     # flush=True for immediate output

# Why stdout (and not files)?
#  1) Container runtimes (containerd, Docker) capture stdout/stderr
#     to /var/log/containers/POD/CONTAINER.log automatically.
#  2) k8s 'kubectl logs POD' reads that file.
#  3) Log forwarders (Fluent Bit DaemonSet) tail those files and ship
#     them to Loki/Splunk/Datadog.
#  4) Pod restarts don't lose stdout (still in the runtime's log file
#     until rotation).

# Why NOT files inside the container?
#  - No rotation; disk fills, container dies.
#  - Pod restart wipes the writable layer; logs vanish.
#  - Log shippers can't easily find arbitrary file paths inside pods.
#  - Multiple workers writing to the same file = interleaving / loss.

# Set PYTHONUNBUFFERED=1 in the Dockerfile (we did in the
# dockerfile-python-base entry); without it, Python buffers stdout
# and you may lose log lines on crash.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but emit STRUCTURED JSON so the log shipper
#             gets parseable fields, and tune the log driver so logs
#             don't fill disk.
# APPROACH  - structlog JSON renderer (cross-references the
#             observability/structured-logging entry); Docker / k8s
#             log driver size + rotation config.
# STRENGTHS- Log shipper auto-extracts fields (level, request_id,
#             user_id) without regex; bounded disk usage on the host.
# WEAKNESSES- Multi-line tracebacks are tricky; senior tier shows
#             how to keep them as one log event.
import os
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20),  # INFO+
    cache_logger_on_first_use=True,
)

log = structlog.get_logger("myapp")
log.info("user_login", user_id=42, ip="10.0.0.5")
# Output (one JSON object per line):
# {"event":"user_login","user_id":42,"ip":"10.0.0.5","level":"info","timestamp":"2026-..."}

# === Docker log driver tuning ===
# The default 'json-file' driver writes to /var/lib/docker/containers/.../*-json.log
# WITHOUT rotation. On a busy node, that fills disk fast.
#
# Set per-container in docker-compose.yml:
# services:
#   myapp:
#     image: myapp:1.4.2
#     logging:
#       driver: json-file
#       options:
#         max-size: "10m"                       # rotate at 10MB
#         max-file: "3"                          # keep 3 rotated files (30MB total)
#
# Or globally in /etc/docker/daemon.json:
# {
#   "log-driver": "json-file",
#   "log-opts": { "max-size": "10m", "max-file": "3" }
# }

# === k8s log handling ===
# k8s uses the container runtime's log driver; rotation is configured
# on the kubelet:
#   --container-log-max-size=10Mi
#   --container-log-max-files=5
#
# Inspect logs:
#   $ kubectl logs POD                          # current container instance
#   $ kubectl logs POD --previous              # previous (after crash)
#   $ kubectl logs -f POD                       # follow
#   $ kubectl logs POD --since=1h --tail=100   # filter

# === Multi-line stack traces ===
# A Python traceback prints multiple lines via sys.stderr. Log shippers
# treat each line as a separate event by default — bad. structlog's
# format_exc_info processor folds the traceback INTO the JSON event:
try:
    1/0
except ZeroDivisionError:
    log.exception("calculation_failed", input=1)
# Output: ONE line of JSON containing the full traceback under "exception"
# {"event":"calculation_failed","input":1,"level":"error",
#  "exception":"Traceback (most recent call last):\n  File ...","timestamp":"..."}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: trace_id correlation, Fluent Bit
#             DaemonSet config, redaction at the source, log-volume
#             cost guardrails.
# APPROACH  - structlog processor adds trace_id from active OTel span;
#             redaction filter drops PII before render; Fluent Bit
#             parses JSON, decorates with k8s metadata, ships to Loki.
# STRENGTHS - One log line per event; trace_id makes log<->trace pivot
#             one click; PII never leaves the pod; volumes scoped.
# WEAKNESSES- Adds the OTel processor + redaction list overhead
#             (~1-5µs per log call); negligible at typical rates.
import os, structlog
from opentelemetry import trace as otel_trace

# === structlog: trace_id from active OTel span ===
def add_trace_context(_logger, _method, event_dict):
    span = otel_trace.get_current_span()
    ctx = span.get_span_context() if span else None
    if ctx and ctx.is_valid:
        event_dict["trace_id"] = format(ctx.trace_id, "032x")
        event_dict["span_id"]  = format(ctx.span_id, "016x")
    return event_dict

# === structlog: redaction processor ===
SENSITIVE_KEYS = {"password", "token", "authorization", "cookie", "ssn", "card_number"}

def redact_sensitive(_logger, _method, event_dict):
    for k in list(event_dict):
        if any(s in k.lower() for s in SENSITIVE_KEYS):
            event_dict[k] = "[REDACTED]"
    return event_dict

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        add_trace_context,
        redact_sensitive,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.dict_tracebacks,        # structured tb (vs string)
        structlog.processors.JSONRenderer(),
    ],
    cache_logger_on_first_use=True,
)

log = structlog.get_logger("myapp")
log.info("payment_processed", user_id=42, amount=1999, password="hunter2")
# Output (password redacted; trace_id added if a span is active):
# {"event":"payment_processed","user_id":42,"amount":1999,"password":"[REDACTED]",
#  "trace_id":"abc123...","span_id":"def456...","level":"info","timestamp":"..."}

# === Fluent Bit DaemonSet (k8s) — parses JSON + decorates ===
# fluent-bit-config.yaml (excerpt):
# [INPUT]
#     Name              tail
#     Path              /var/log/containers/*.log
#     Parser            cri                                 # containerd's CRI format
#     Tag               kube.*
#     Refresh_Interval  5
#     Mem_Buf_Limit     50MB
#
# [FILTER]
#     Name              kubernetes
#     Match             kube.*
#     Merge_Log         On                                   # parse the JSON in 'log'
#     K8S-Logging.Parser On
#     Annotations       Off
#     Labels            On
#
# [OUTPUT]
#     Name              loki
#     Match             kube.*
#     host              loki.observability.svc
#     labels            namespace=$kubernetes['namespace_name'],
#                       pod=$kubernetes['pod_name'],
#                       app=$kubernetes['labels']['app']
#
# Result in Loki:
#   {namespace="prod",app="myapp"} | json | trace_id="abc..."
#   pivots cleanly to traces in Tempo via the trace_id link.

# === Cost guardrail ===
# Most managed log shippers charge ~$0.50-$2 / GB ingested. A noisy
# service at 100 RPS × 10 logs/req × 500B = ~4 GB / day → ~$120/mo.
# Sample non-error logs (see observability/log-sampling-budgets entry).

# === Multi-line stack traces — the right way ===
# 'dict_tracebacks' processor structures the exception:
try:
    1/0
except ZeroDivisionError:
    log.exception("payment_processed_failed", user_id=42)
# Output: ONE line of JSON; "exception" is a structured dict:
# {
#   "event": "payment_processed_failed",
#   "user_id": 42,
#   "exception": {
#     "exc_type": "ZeroDivisionError",
#     "exc_value": "division by zero",
#     "frames": [...]
#   },
#   "trace_id": "abc...",
#   ...
# }
# Querying in Loki: |= "exc_type" or filter by exc_type="ZeroDivisionError"

# === k8s log resource limits ===
# Set per-pod log volume limits in the kubelet:
#   /var/lib/kubelet/config.yaml:
#     containerLogMaxSize: 10Mi
#     containerLogMaxFiles: 5
# Without these, /var/log/containers fills disk on a noisy pod.

# Decision rule:
#   minimum                                  -> print() / logging to stdout
#   structured fields                         -> structlog with JSONRenderer
#   trace<->log pivot                         -> add_trace_context structlog processor
#   PII protection                            -> redact processor (cross-ref crypto-secrets)
#   multi-line stack traces                   -> dict_tracebacks; ONE event per exception
#   log shipper                               -> Fluent Bit / Vector DaemonSet on each node
#   cost guardrail                            -> sample non-errors (observability entry)
#   need to keep last hour on node            -> kubelet containerLogMaxSize / Files
#   logs vanish on restart                    -> ship to backend BEFORE pod death; not "logs in pod"
#   want to write to a file                   -> NO; stdout. Log driver writes the file.
#   sidecar logging                           -> Fluent Bit/Vector sidecar; rare; DaemonSet preferred
#   audit logs (compliance)                   -> separate sink; never sample audit logs
#   timestamp from stdout vs structlog        -> use structlog's TimeStamper; runtime adds another;
#                                                pick which is "the" timestamp in your shipper
#
# Anti-pattern: writing log files inside the container (e.g.,
# logging.handlers.RotatingFileHandler to /var/log/myapp.log inside
# the pod). The container's writable layer fills; logs vanish on
# restart; log shipper can't reliably find the file; multi-worker
# processes interleave. Always log to stdout/stderr; let the
# orchestrator capture; let the log shipper ship. Files in the
# container are an antipattern that has cost more incident response
# than almost any other Dockerfile mistake.
```

## Decision Rule

```text
minimum                                  -> print() / logging to stdout
structured fields                         -> structlog with JSONRenderer
trace<->log pivot                         -> add_trace_context structlog processor
PII protection                            -> redact processor (cross-ref crypto-secrets)
multi-line stack traces                   -> dict_tracebacks; ONE event per exception
log shipper                               -> Fluent Bit / Vector DaemonSet on each node
cost guardrail                            -> sample non-errors (observability entry)
need to keep last hour on node            -> kubelet containerLogMaxSize / Files
logs vanish on restart                    -> ship to backend BEFORE pod death; not "logs in pod"
want to write to a file                   -> NO; stdout. Log driver writes the file.
sidecar logging                           -> Fluent Bit/Vector sidecar; rare; DaemonSet preferred
audit logs (compliance)                   -> separate sink; never sample audit logs
timestamp from stdout vs structlog        -> use structlog's TimeStamper; runtime adds another;
                                             pick which is "the" timestamp in your shipper
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing log files inside the container (e.g.,
> logging.handlers.RotatingFileHandler to /var/log/myapp.log inside
> the pod). The container's writable layer fills; logs vanish on
> restart; log shipper can't reliably find the file; multi-worker
> processes interleave. Always log to stdout/stderr; let the
> orchestrator capture; let the log shipper ship. Files in the
> container are an antipattern that has cost more incident response
> than almost any other Dockerfile mistake.

## Tips

- Always log to stdout/stderr, NEVER to files inside the container. The runtime captures stdout; logs survive pod restart (until rotation); log shippers tail the runtime's files.
- Structured JSON via `structlog.processors.JSONRenderer()` lets log shippers extract fields without regex. Pair with the `dict_tracebacks` processor so exceptions are ONE event, not multiple lines.
- Add `trace_id` and `span_id` to every log via a structlog processor that reads the active OTel span. Pivot from any log line to its full trace with one click.
- Tune the log driver: Docker default has no rotation (`max-size: "10m"`, `max-file: "3"`); k8s kubelet has `containerLogMaxSize: 10Mi`. Without these, a noisy pod fills the host disk.
- Fluent Bit (or Vector) as a DaemonSet on each k8s node tails `/var/log/containers/*.log`, parses JSON, decorates with k8s metadata, ships to your backend. Don't roll your own.
- Redact sensitive fields IN THE APP via a structlog processor — never trust downstream shippers to filter. Once a secret reaches the log backend, assume it's leaked.

## Common Mistake

> [!warning] Writing log files inside the container (e.g., `RotatingFileHandler` to `/var/log/myapp.log` inside the pod). The writable layer fills; logs vanish on restart; log shippers can't reliably find the file; multi-worker processes interleave. Log to stdout/stderr; let the orchestrator capture; let the shipper ship. "Files in the container" has cost more incident response than almost any other Dockerfile mistake.

## Shorthand (Junior → Senior)

**Junior:**
```python
# RotatingFileHandler in container — disk fills, restarts wipe, shipper misses
logging.handlers.RotatingFileHandler("/var/log/myapp.log", maxBytes=10_000_000)
```

**Senior:**
```python
# stdout JSON; runtime captures; shipper ships
structlog.configure(processors=[..., JSONRenderer()])
log.info("user_login", user_id=42)
```

## See Also

- [[Sections/containerization/container-ops/healthcheck-probes|Health probes — readiness, liveness, startup (Containerization)]]
- [[Sections/containerization/container-ops/secrets-injection|Secrets injection — k8s Secret, env vs file mount, BuildKit (Containerization)]]
- [[Sections/containerization/container-ops/_Index|Containerization → Container Ops — health probes, secrets injection, logging]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "observability"
section: "structured-logging"
id: "log-sampling-budgets"
title: "Log sampling — keep signal, drop volume, hit a budget"
category: "Structured Logging"
subtitle: "random.random() < rate, per-route rate, force-log header, tail-based sampling, structlog filtering processor, 100% errors policy"
signature_short: "def should_log(level, route): return level >= ERROR or random.random() < SAMPLE_RATE[route]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Log sampling — keep signal, drop volume, hit a budget"
  - "log-sampling-budgets"
tags:
  - "python"
  - "python/observability"
  - "python/observability/structured-logging"
  - "category/structured-logging"
  - "tier/tiered"
---

# Log sampling — keep signal, drop volume, hit a budget

> random.random() < rate, per-route rate, force-log header, tail-based sampling, structlog filtering processor, 100% errors policy

## Overview

Log sampling is the unglamorous reality of running a service at scale. A 200 req/s service emitting 5 log lines/request to Datadog at $0.10/GB ingested costs ~$3000/month — entirely on healthcheck and "got request" debug logs. The fix is tiered sampling: 100% of errors and warnings (you cannot lose those), 100% of slow requests, 1-10% of info-level on hot paths, plus a "force-log this request" mechanism for debugging in production. Implemented as a structlog processor it costs almost nothing. The three examples solve the SAME concrete task — cut log volume 80% without losing visibility — at three depths: hard-coded sample rate → per-route rates with force-log header → policy-driven sampling with cost estimation, slow-request capture, and tail-based hooks.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cut log volume by ~90% on a high-traffic service.
- **Junior** — SAME — but per-route sample rates (1% healthchecks, 100% /api/admin), and a "X-Force-Log: 1" header that bypasses the sampler so support engineers can replay and see everything for a specific request.
- **Senior** — SAME — production-grade: capture 100% of slow requests (>p95 latency) and 100% of any request that errors out, even if the early INFO logs were sampled. Plus cost estimation so you can pick rates with eyes open.

## Signature

```python
def should_log(level, route): return level >= ERROR or random.random() < SAMPLE_RATE[route]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cut log volume by ~90% on a high-traffic service.
# APPROACH  - random.random() check inside a structlog processor:
#             always emit WARNING+; only 10% of INFO and DEBUG.
# STRENGTHS - One processor; trivial change; immediate cost cut.
# WEAKNESSES- Doesn't differentiate hot routes from rare ones; no
#             "force-log" escape hatch for debugging.
import logging
import random
import structlog

SAMPLE_RATE = 0.1                                       # keep 10% of INFO/DEBUG

class DropSampler:
    def __call__(self, _logger, _method, event_dict):
        level = event_dict.get("level", "info").lower()
        if level in ("error", "warning", "critical"):
            return event_dict                           # always keep
        if random.random() < SAMPLE_RATE:
            return event_dict                           # kept
        raise structlog.DropEvent                       # drop this event

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        DropSampler(),                                   # <- sample BEFORE rendering
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

log = structlog.get_logger()
log.info("request_received")                             # ~10% emitted
log.error("payment_failed")                              # always emitted
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but per-route sample rates (1% healthchecks, 100%
#             /api/admin), and a "X-Force-Log: 1" header that bypasses
#             the sampler so support engineers can replay and see
#             everything for a specific request.
# APPROACH  - Per-route table; ContextVar holding "force_log" set by
#             middleware; sampler honors both.
# STRENGTHS- Cuts cost where it's pure noise (healthchecks); preserves
#             ability to debug a specific request live.
# WEAKNESSES- Maintaining per-route rates is ongoing; the header has to
#             be authenticated or it's a denial-of-wallet attack.
import contextvars, random
import structlog
from fastapi import FastAPI, Request

force_log_var: contextvars.ContextVar[bool] = contextvars.ContextVar(
    "force_log", default=False
)

# Per-route sample rates. "*" = default for unmatched routes.
RATES: dict[str, float] = {
    "/healthz":      0.01,
    "/metrics":      0.01,
    "/api/admin/*":  1.00,
    "*":             0.10,
}

def rate_for(path: str) -> float:
    for pattern, rate in RATES.items():
        if pattern == path:
            return rate
        if pattern.endswith("/*") and path.startswith(pattern[:-2]):
            return rate
    return RATES["*"]

class TieredSampler:
    def __call__(self, _logger, _method, event_dict):
        level = event_dict.get("level", "info").lower()
        if level in ("error", "warning", "critical"):
            return event_dict
        if force_log_var.get():
            return event_dict
        path = event_dict.get("path", "*")
        if random.random() < rate_for(path):
            return event_dict
        raise structlog.DropEvent

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        TieredSampler(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

app = FastAPI()

@app.middleware("http")
async def setup_log_context(request: Request, call_next):
    # Authenticate this header in real life (it's free $$ otherwise).
    force = request.headers.get("x-force-log") == "1" and request.user.is_admin
    force_log_var.set(force)
    structlog.contextvars.bind_contextvars(path=request.url.path)
    try:
        return await call_next(request)
    finally:
        structlog.contextvars.clear_contextvars()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: capture 100% of slow requests
#             (>p95 latency) and 100% of any request that errors out,
#             even if the early INFO logs were sampled. Plus cost
#             estimation so you can pick rates with eyes open.
# APPROACH  - Buffer log records per-request; flush ALL of them if the
#             request errors or exceeds latency threshold; otherwise
#             apply the tiered sampler. This is "tail-based" sampling
#             (decide AFTER the request completes).
# STRENGTHS- You never lose context on slow/failed requests; cost
#             cut on healthy fast ones; the budget is honored.
# WEAKNESSES- Memory cost: buffer per in-flight request; cap the buffer
#             length so a single huge request can't blow memory.
import contextvars, random, time, json
from typing import Any
import structlog
from fastapi import FastAPI, Request

# Per-request buffer + decision state.
log_buffer_var: contextvars.ContextVar[list[dict[str, Any]] | None] = (
    contextvars.ContextVar("log_buffer", default=None)
)
keep_all_var: contextvars.ContextVar[bool] = contextvars.ContextVar("keep_all", default=False)

MAX_BUFFER = 200                                       # cap records per request

class TailBasedSampler:
    """Buffer events; flush all if request errors/slow, else apply sampling."""
    def __init__(self, default_rate: float):
        self.default_rate = default_rate

    def __call__(self, _logger, _method, event_dict):
        level = event_dict.get("level", "info").lower()
        # Always keep critical levels regardless of buffer state.
        if level in ("error", "critical"):
            keep_all_var.set(True)                      # mark request "keep everything"
            return event_dict

        buf = log_buffer_var.get()
        if buf is not None:
            if len(buf) < MAX_BUFFER:
                buf.append(event_dict)
            raise structlog.DropEvent                   # buffered; will be flushed at request end

        # Outside a request — apply head sampling.
        if random.random() < self.default_rate:
            return event_dict
        raise structlog.DropEvent

# Output sink — ordinarily structlog renders to stdout; here we expose a
# function the middleware can call to emit buffered records on flush.
import logging
out = logging.getLogger("sampled")

def emit(record: dict[str, Any]) -> None:
    out.info(json.dumps(record))                       # whatever your shipper expects

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        TailBasedSampler(default_rate=0.10),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

app = FastAPI()
SLOW_REQUEST_S = 1.0                                   # capture all logs for >1s requests

@app.middleware("http")
async def tail_sampling(request: Request, call_next):
    buffer: list[dict] = []
    log_buffer_var.set(buffer)
    keep_all_var.set(False)
    started = time.monotonic()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        elapsed = time.monotonic() - started
        keep_all = keep_all_var.get() or elapsed > SLOW_REQUEST_S or status >= 500
        if keep_all:
            for rec in buffer:
                emit(rec)                              # flush every buffered log
        else:
            # Apply head sampling to buffered records (10% of INFO survives).
            for rec in buffer:
                if random.random() < 0.10:
                    emit(rec)
        log_buffer_var.set(None)

# Cost estimation — sanity-check your sample rates.
def estimate_monthly_cost(*, qps: float, lines_per_req: int,
                         bytes_per_line: int, sample_rate: float,
                         dollars_per_gb: float) -> float:
    """Quick BotE: monthly $ at the given sample rate."""
    sec_per_month = 30 * 86400
    bytes_per_month = qps * lines_per_req * bytes_per_line * sample_rate * sec_per_month
    gb = bytes_per_month / 1e9
    return gb * dollars_per_gb

# Example: 200 qps × 5 lines × 800B × 10% sample × $0.10/GB
print(f"${estimate_monthly_cost(qps=200, lines_per_req=5, bytes_per_line=800, sample_rate=0.10, dollars_per_gb=0.10):.0f}/mo")

# Decision rule:
#   logs > $1k/mo on a small service       -> sample; you almost certainly can drop 80% with no loss
#   need every log for slow/failed reqs    -> tail-based sampling: buffer + flush on outcome
#   most logs are healthcheck noise        -> per-route rate (RATES['/healthz'] = 0.01)
#   debugging a specific user's request    -> X-Force-Log header (authenticated!)
#   want guaranteed budget cap             -> token bucket per second + drop overflow
#   logging volume is the bug, not cost    -> reduce log calls, don't sample noise harder
#   compliance / audit logs                -> NEVER sample; route to a separate sink
#   error budget for log loss              -> sample <10% only on INFO; keep WARNING+ at 100%
#   per-tenant log isolation               -> sample inside tenant, not across (avoid favoritism)
#   tail sampling memory pressure          -> cap MAX_BUFFER per request; over-cap == drop overflow
#
# Anti-pattern: a global "X-Force-Log" header that's not authenticated.
# Anyone who learns it can flip the sample rate to 100% on every request
# they make and walk your log bill up to whatever they want. ALWAYS gate
# the bypass on auth (admin role, signed token, IP allowlist) — it's a
# denial-of-wallet attack vector if not.
```

## Decision Rule

```text
logs > $1k/mo on a small service       -> sample; you almost certainly can drop 80% with no loss
need every log for slow/failed reqs    -> tail-based sampling: buffer + flush on outcome
most logs are healthcheck noise        -> per-route rate (RATES['/healthz'] = 0.01)
debugging a specific user's request    -> X-Force-Log header (authenticated!)
want guaranteed budget cap             -> token bucket per second + drop overflow
logging volume is the bug, not cost    -> reduce log calls, don't sample noise harder
compliance / audit logs                -> NEVER sample; route to a separate sink
error budget for log loss              -> sample <10% only on INFO; keep WARNING+ at 100%
per-tenant log isolation               -> sample inside tenant, not across (avoid favoritism)
tail sampling memory pressure          -> cap MAX_BUFFER per request; over-cap == drop overflow
```

## Anti-Pattern

> [!warning] Anti-pattern
> a global "X-Force-Log" header that's not authenticated.
> Anyone who learns it can flip the sample rate to 100% on every request
> they make and walk your log bill up to whatever they want. ALWAYS gate
> the bypass on auth (admin role, signed token, IP allowlist) — it's a
> denial-of-wallet attack vector if not.

## Tips

- Sample BELOW the renderer in the structlog processor pipeline. The renderer is the expensive step (JSON encoding); dropping events earlier saves CPU as well as bytes.
- NEVER sample WARNING / ERROR / CRITICAL. The whole point of those levels is "the operator must see this"; sampling them is how you miss outages. 100% always.
- Per-route rates: healthchecks at 1%, hot endpoints at 10%, admin/billing endpoints at 100%. The cost split is usually 80/20 — 80% of volume comes from 20% of routes.
- Tail-based sampling (buffer per request, flush all on error/slow) is the high-value pattern. It costs a small per-request memory budget and gives you full context exactly when you need it.
- A "force-log" header MUST be authenticated. Without auth, it's a denial-of-wallet attack — anyone who finds the header name flips your bill 10×.
- Estimate cost before changing rates: `qps × lines/req × bytes/line × rate × seconds/month × $/GB`. Most teams discover their healthchecks alone cost more than a junior salary.

## Common Mistake

> [!warning] A global "X-Force-Log" header with no authentication. Anyone who learns the header name can flip the sample rate to 100% on every request and walk your log bill up to whatever they want — denial-of-wallet. Authenticate the bypass: admin role, signed token, or IP allowlist. Without that gate, you've added a billing footgun.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Naïve: every log line emitted, billing balloons
log.info("request_received")
log.info("auth_ok")
log.info("db_query_done")
log.info("response_sent")
```

**Senior:**
```python
# Sampler in pipeline: 100% errors + slow, ~10% otherwise
# Cost cut 80%; debuggability preserved on the requests that matter.
```

## See Also

- [[Sections/observability/structured-logging/structlog-basics|structlog — structured logging with dev + prod renderers (Observability)]]
- [[Sections/observability/structured-logging/log-correlation-ids|Correlation IDs — propagate request_id across logs and services (Observability)]]
- [[Sections/observability/structured-logging/_Index|Observability → Structured Logging — structlog, correlation IDs, sampling]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "observability"
section: "structured-logging"
id: "structlog-basics"
title: "structlog — structured logging with dev + prod renderers"
category: "Structured Logging"
subtitle: "structlog.configure, processors, BoundLogger, ConsoleRenderer (dev), JSONRenderer (prod), TimeStamper, add_log_level, format_exc_info"
signature_short: "log = structlog.get_logger(); log.info(\"user_login\", user_id=42, ip=\"...\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "structlog — structured logging with dev + prod renderers"
  - "structlog-basics"
tags:
  - "python"
  - "python/observability"
  - "python/observability/structured-logging"
  - "category/structured-logging"
  - "tier/tiered"
---

# structlog — structured logging with dev + prod renderers

> structlog.configure, processors, BoundLogger, ConsoleRenderer (dev), JSONRenderer (prod), TimeStamper, add_log_level, format_exc_info

## Overview

structlog wraps stdlib logging with a structured-event API: every log call is `event_name + key=value pairs`, not a printf-style format string. Output is configurable via a processor pipeline — JSON in prod (machine-parseable for Loki/Splunk/Datadog), colorized human format in dev. The same code emits both. Versus stdlib logging.info("user %s logged in from %s", uid, ip): no string interpolation footguns, every field is queryable, and exceptions render as structured tracebacks. The three examples solve the SAME concrete task — emit consistent log lines from a web service that read clearly in dev and parse cleanly in prod — at three depths: minimal configure() → dev-vs-prod pipeline branch + contextvars + exception rendering → production-grade setup with stdlib-logging bridge, sensitive-field redaction, and type-safe BoundLogger Protocol.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Emit consistent log lines from a web service: timestamp, level, event name, plus any key=value fields the call passes.
- **Junior** — SAME — but human-readable in dev terminal, JSON in prod; include exception tracebacks as structured fields; bind a request-scoped context (user_id, request_id) once.
- **Senior** — SAME — production-grade: bridge stdlib logging through structlog (so library logs share the same format), redact sensitive fields, type the BoundLogger via Protocol, and handle async contextvars correctly.

## Signature

```python
log = structlog.get_logger(); log.info("user_login", user_id=42, ip="...")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Emit consistent log lines from a web service: timestamp,
#             level, event name, plus any key=value fields the call passes.
# APPROACH  - structlog.configure() with the default processors + JSON
#             renderer; get_logger(); call .info / .warning / .error.
# STRENGTHS - One-time setup; every log line is a parseable JSON object;
#             no printf-style format strings to mis-quote.
# WEAKNESSES- JSON output is hard to read in a dev terminal — see junior
#             tier for the dev-vs-prod renderer split.
import structlog

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

log = structlog.get_logger("myapp")

log.info("user_login", user_id=42, ip="203.0.113.7", method="oauth")
# {"event":"user_login","user_id":42,"ip":"203.0.113.7","method":"oauth",
#  "level":"info","timestamp":"2026-04-30T15:00:00Z"}

log.warning("rate_limited", user_id=42, requests_in_window=120, window_s=60)
log.error("payment_failed", user_id=42, reason="card_declined", amount_cents=1999)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but human-readable in dev terminal, JSON in prod;
#             include exception tracebacks as structured fields; bind a
#             request-scoped context (user_id, request_id) once.
# APPROACH  - Branch the renderer on ENV; format_exc_info processor
#             attaches tracebacks; contextvars-based bind_contextvars
#             threads context through every log call without passing it.
# STRENGTHS- Same code paths in dev + prod; tracebacks are queryable;
#             handlers don't have to remember to pass user_id every time.
# WEAKNESSES- Performance OK (~1µs/log) — for >100k log/s services use
#             cache_logger_on_first_use=True (senior tier).
import os
import structlog
from structlog.contextvars import bind_contextvars, clear_contextvars, merge_contextvars

is_prod = os.environ.get("ENV") == "prod"

shared_processors = [
    merge_contextvars,                                 # pull contextvars into the event dict
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.format_exc_info,              # turns exc_info=True into traceback fields
    structlog.processors.StackInfoRenderer(),
]

if is_prod:
    renderer = structlog.processors.JSONRenderer()
else:
    # ConsoleRenderer formats in color, drops empty fields, emphasizes the event.
    renderer = structlog.dev.ConsoleRenderer(colors=True)

structlog.configure(
    processors=[*shared_processors, renderer],
    wrapper_class=structlog.make_filtering_bound_logger(
        20 if is_prod else 10                           # 20=INFO, 10=DEBUG
    ),
)

log = structlog.get_logger("myapp")

# Bind once per request; every log inside this scope inherits the context.
def handle_request(request):
    clear_contextvars()                                 # reset previous request's context
    bind_contextvars(
        request_id=request.headers.get("x-request-id", "no-id"),
        user_id=request.user.id if request.user else None,
        path=request.path,
    )
    log.info("request_received")                        # already has request_id, user_id, path

    try:
        result = process(request)
        log.info("request_completed", status=200)
        return result
    except Exception:
        log.exception("request_failed")                 # exception traceback included
        raise

def process(request):
    raise ValueError("simulated")                        # for the example
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: bridge stdlib logging through
#             structlog (so library logs share the same format), redact
#             sensitive fields, type the BoundLogger via Protocol, and
#             handle async contextvars correctly.
# APPROACH  - foreign_pre_chain + ProcessorFormatter unifies stdlib logs;
#             custom redact processor strips PII; Protocol type for any
#             code that wants to depend on "a logger with these methods".
# STRENGTHS- Library logs (sqlalchemy, urllib3, openai) emit the same
#             JSON shape your code does; PII never escapes; static type
#             checks catch logger-misuse before runtime.
# WEAKNESSES- ~50 lines of setup code; build it once, import it everywhere.
from __future__ import annotations
import logging, os, sys
from typing import Any, Protocol
import structlog

# 1) Sensitive-field redactor — runs in the processor pipeline.
SENSITIVE_KEYS = {"password", "token", "api_key", "authorization",
                  "cookie", "ssn", "card_number"}

def redact_sensitive(_logger, _method, event_dict):
    for k in list(event_dict):
        if any(s in k.lower() for s in SENSITIVE_KEYS):
            event_dict[k] = "***"
    return event_dict

# 2) Configure structlog AND the stdlib bridge.
def configure_logging(*, env: str) -> None:
    is_prod = env == "prod"

    timestamper = structlog.processors.TimeStamper(fmt="iso")
    pre_chain = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        timestamper,
        redact_sensitive,
    ]

    if is_prod:
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    # structlog config — for direct structlog.get_logger() callers.
    structlog.configure(
        processors=[
            *pre_chain,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.INFO if is_prod else logging.DEBUG
        ),
        cache_logger_on_first_use=True,                # ~10× faster than recreating per-call
    )

    # Bridge stdlib logging -> structlog ProcessorFormatter so library logs
    # (sqlalchemy.engine, urllib3, etc.) get the same JSON shape.
    formatter = structlog.stdlib.ProcessorFormatter(
        processor=renderer,
        foreign_pre_chain=pre_chain,
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO if is_prod else logging.DEBUG)

# 3) Type-safe Logger Protocol — depend on this in handlers.
class Logger(Protocol):
    def debug(self, event: str, **kw: Any) -> None: ...
    def info (self, event: str, **kw: Any) -> None: ...
    def warning(self, event: str, **kw: Any) -> None: ...
    def error(self, event: str, **kw: Any) -> None: ...
    def exception(self, event: str, **kw: Any) -> None: ...
    def bind(self, **kw: Any) -> "Logger": ...

def get_logger(name: str | None = None) -> Logger:
    return structlog.get_logger(name)

# 4) Use it.
configure_logging(env=os.environ.get("ENV", "dev"))
log: Logger = get_logger("myapp")

log.info("startup", version="1.4.2")
log.warning("password_attempt", user_id=42, password="hunter2")
# Output (prod):
# {"event":"password_attempt","user_id":42,"password":"***","level":"warning","timestamp":"..."}

# 5) Async-aware: contextvars work across asyncio.create_task. Use
# structlog.contextvars.bind_contextvars at request entry; every coroutine
# spawned from there inherits the context (this is the asyncio-correct
# behavior for ContextVar — different from threading.local).

# Decision rule:
#   service emits any logs                  -> structlog over stdlib logging
#   dev terminal vs prod log shipper         -> ConsoleRenderer vs JSONRenderer (env branch)
#   need request-scoped fields everywhere    -> bind_contextvars + merge_contextvars processor
#   library logs are noisy / wrong shape    -> ProcessorFormatter as stdlib root handler
#   sensitive fields                         -> custom redact processor in the pipeline
#   asyncio                                  -> contextvars (already done); NOT threading.local
#   need >100k log/s                         -> cache_logger_on_first_use=True; consider sampling
#   write tests against logs                 -> structlog.testing.LogCapture as a fixture
#   want type-checked logger param           -> Logger Protocol; depend on the interface
#   exceptions in async tasks                -> log.exception("event_name") in except blocks
#
# Anti-pattern: f-string formatting INSIDE the log call:
#   log.info(f"user {uid} logged in from {ip}")
# Loses every advantage of structured logging — the message becomes a
# string blob; you can't filter "all events for user 42"; tests have to
# parse the string. Always: log.info("user_login", user_id=uid, ip=ip).
```

## Decision Rule

```text
service emits any logs                  -> structlog over stdlib logging
dev terminal vs prod log shipper         -> ConsoleRenderer vs JSONRenderer (env branch)
need request-scoped fields everywhere    -> bind_contextvars + merge_contextvars processor
library logs are noisy / wrong shape    -> ProcessorFormatter as stdlib root handler
sensitive fields                         -> custom redact processor in the pipeline
asyncio                                  -> contextvars (already done); NOT threading.local
need >100k log/s                         -> cache_logger_on_first_use=True; consider sampling
write tests against logs                 -> structlog.testing.LogCapture as a fixture
want type-checked logger param           -> Logger Protocol; depend on the interface
exceptions in async tasks                -> log.exception("event_name") in except blocks
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string formatting INSIDE the log call:
>   log.info(f"user {uid} logged in from {ip}")
> Loses every advantage of structured logging — the message becomes a
> string blob; you can't filter "all events for user 42"; tests have to
> parse the string. Always: log.info("user_login", user_id=uid, ip=ip).

## Tips

- structlog's "event" is the FIRST positional arg and should be a stable, snake_case identifier (user_login, payment_failed) — NOT an interpolated string. Other fields are kwargs.
- Use ConsoleRenderer in dev (colorized, drops empty fields, emphasizes the event name) and JSONRenderer in prod (machine-parseable). Same processor pipeline up to the renderer.
- `bind_contextvars` plus the `merge_contextvars` processor lets you bind once at request entry and every log line in that request automatically picks up request_id/user_id/etc — no thread-local hacks.
- Bridge stdlib logging through `structlog.stdlib.ProcessorFormatter` as the root handler so library logs (sqlalchemy.engine, urllib3, openai) share the same JSON shape. Without this, half your logs are unparseable.
- Set `cache_logger_on_first_use=True` in production. The first `get_logger()` call builds the logger; subsequent calls return the cached instance — measurably faster on hot paths.
- For testing, `structlog.testing.LogCapture` is a fixture that records every event into a list. Assert against the list rather than parsing stdout.

## Common Mistake

> [!warning] F-string formatting inside the log call: `log.info(f"user {uid} logged in from {ip}")`. The message becomes a string blob — you lose the ability to filter on `user_id == 42`, your log shipper can't index the field, and tests have to regex-parse the message. Always pass values as kwargs: `log.info("user_login", user_id=uid, ip=ip)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# String interpolation — fields lost
log.info(f"user {uid} logged in from {ip}")
```

**Senior:**
```python
# Structured event — every value queryable
log.info("user_login", user_id=uid, ip=ip)
```

## See Also

- [[Sections/observability/structured-logging/log-correlation-ids|Correlation IDs — propagate request_id across logs and services (Observability)]]
- [[Sections/observability/structured-logging/log-sampling-budgets|Log sampling — keep signal, drop volume, hit a budget (Observability)]]
- [[Sections/observability/structured-logging/_Index|Observability → Structured Logging — structlog, correlation IDs, sampling]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]

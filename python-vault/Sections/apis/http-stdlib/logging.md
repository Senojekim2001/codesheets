---
type: "entry"
domain: "python"
file: "apis"
section: "http-stdlib"
id: "logging"
title: "logging"
category: "Standard Library"
subtitle: "Never use print() in production — use logging.getLogger(__name__)"
signature_short: "log = logging.getLogger(__name__) | log.info(\"msg %s\", val)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "logging"
tags:
  - "python"
  - "python/apis"
  - "python/apis/http-stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# logging

> Never use print() in production — use logging.getLogger(__name__)

## Overview

The logging module provides leveled, configurable logging. Always get a named logger per module with `getLogger(__name__)`. Configure at the entry point, not in library code.

## Signature

```python
log = logging.getLogger(__name__) | log.info("msg %s", val)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basicConfig at startup, getLogger(__name__) per module
# STRENGTHS - The minimum: levels, lazy formatting, no print()
# WEAKNESSES- No file routing, no structured fields
#
import logging

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-7s %(name)s  %(message)s")

log = logging.getLogger(__name__)               # one logger per module

log.info("user logged in: %s", user_id)         # lazy %s, not f-string
log.warning("rate limit approaching: %d/min", 90)
log.exception("query failed")                   # use INSIDE except — adds traceback
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dictConfig for full setup, file + console handlers, propagation rules
# STRENGTHS - Configuration that scales past one file
# WEAKNESSES- Still text logs — senior tier covers structured / JSON
#
# logging.yml-equivalent in code (use logging.config.dictConfig in app.py)
import logging.config

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)-7s %(name)s  %(message)s",
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default"},
        "file":    {"class": "logging.handlers.RotatingFileHandler",
                    "filename": "app.log", "maxBytes": 10_000_000, "backupCount": 5,
                    "formatter": "default"},
    },
    "loggers": {
        "myapp":     {"level": "INFO",    "handlers": ["console", "file"]},
        "uvicorn":   {"level": "INFO"},
        "sqlalchemy.engine": {"level": "WARNING"},     # mute noisy libs
    },
    "root": {"level": "WARNING", "handlers": ["console"]},
}
logging.config.dictConfig(LOGGING)

# Library code — only get a logger; NEVER call basicConfig
log = logging.getLogger("myapp.users")

# Add per-call context with the extra= keyword
log.info("created user", extra={"user_id": 42, "email": "a@x.com"})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Structured JSON logs, request-id correlation via Filter, exception logging contract
# STRENGTHS - The pattern that turns logs into queryable telemetry
# WEAKNESSES- N/A
#
import json
import logging
import logging.config
import contextvars

# 1) Per-request correlation — set ONCE in middleware, every log line carries it
request_id_var = contextvars.ContextVar("request_id", default="-")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

# 2) Structured JSON formatter — one line of JSON per log event
class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts":      self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level":   record.levelname,
            "logger":  record.name,
            "msg":     record.getMessage(),
            "rid":     getattr(record, "request_id", "-"),
        }
        # Pick up extras passed via log.info("...", extra={"k": v})
        for k, v in record.__dict__.items():
            if k not in payload and k not in (
                "args","msg","levelname","levelno","pathname","filename",
                "module","exc_info","exc_text","stack_info","lineno","funcName",
                "created","msecs","relativeCreated","thread","threadName",
                "processName","process","name","request_id"):
                payload[k] = v
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)

logging.config.dictConfig({
    "version": 1, "disable_existing_loggers": False,
    "filters":  {"rid":  {"()": RequestIdFilter}},
    "formatters":{"json":{"()": JsonFormatter}},
    "handlers": {"stdout":{"class":"logging.StreamHandler",
                            "filters":["rid"], "formatter":"json"}},
    "root":     {"level":"INFO", "handlers":["stdout"]},
})
log = logging.getLogger("myapp")

# 3) Use it from a FastAPI middleware
# @app.middleware("http")
# async def assign_request_id(request, call_next):
#     token = request_id_var.set(request.headers.get("x-request-id") or new_id())
#     try:    return await call_next(request)
#     finally: request_id_var.reset(token)

# 4) Exception logging contract — log.exception() ONLY inside except blocks
def transfer(amount):
    try:
        do_transfer(amount)
    except Exception:
        log.exception("transfer failed", extra={"amount": amount})
        raise                                          # re-raise so caller decides

# Decision rule:
#   library code                              -> getLogger(__name__); NO basicConfig
#   app entry point                            -> dictConfig once at startup
#   structured logging / search by field        -> JSON formatter + extra={...}
#   correlate logs to one request               -> ContextVar + Filter
#   exception path                              -> log.exception() inside except
#   need to mute a noisy library                 -> per-logger level, e.g. sqlalchemy.engine WARNING
#
# Anti-pattern: logging.basicConfig() inside library code
#   First import wins; every other config is silently ignored. Libraries should
#   only acquire loggers; the application owns configuration.

user_id = None
def do_transfer(_): pass
def new_id(): import uuid; return uuid.uuid4().hex
```

## Decision Rule

```text
library code                              -> getLogger(__name__); NO basicConfig
app entry point                            -> dictConfig once at startup
structured logging / search by field        -> JSON formatter + extra={...}
correlate logs to one request               -> ContextVar + Filter
exception path                              -> log.exception() inside except
need to mute a noisy library                 -> per-logger level, e.g. sqlalchemy.engine WARNING
```

## Anti-Pattern

> [!warning] Anti-pattern
> logging.basicConfig() inside library code
>   First import wins; every other config is silently ignored. Libraries should
>   only acquire loggers; the application owns configuration.

## Tips

- Use `log.info("val: %s", value)` — lazy formatting, string only built if level is active
- `log.exception("msg")` inside an except block automatically includes the full traceback
- Libraries should only add a NullHandler — never call basicConfig()
- Never call `logging.getLogger()` (root logger) in libraries — use `getLogger(__name__)`

## Common Mistake

> [!warning] Using `print()` for logging in production. No levels, no timestamps, no file routing, no way to silence it. Use `logging.getLogger(__name__)` instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/apis/http-stdlib/_Index|APIs & Frameworks → HTTP & Standard Library]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

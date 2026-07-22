---
type: "entry"
domain: "python"
file: "advanced"
section: "pathlib-logging"
id: "logging-config"
title: "logging — Structured Application Logging"
category: "Standard Library"
subtitle: "getLogger, handlers, formatters, structured logging"
signature_short: "logger = logging.getLogger(__name__)  |  logger.info(\"msg\", extra={...})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "logging — Structured Application Logging"
  - "logging-config"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/pathlib-logging"
  - "category/standard-library"
  - "tier/tiered"
---

# logging — Structured Application Logging

> getLogger, handlers, formatters, structured logging

## Overview

The logging module provides leveled, configurable logging. Loggers form a hierarchy (by module name). Handlers direct output (console, file, network). Formatters control output format. Levels: DEBUG < INFO < WARNING < ERROR < CRITICAL. Use getLogger(__name__) per module. Configure once at application startup. For structured logging (JSON), use python-json-logger or structlog.

## Signature

```python
logger = logging.getLogger(__name__)  |  logger.info("msg", extra={...})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basicConfig at startup; getLogger(__name__) per module
# STRENGTHS - The minimum: levels, lazy formatting, no print()
# WEAKNESSES- No file routing, no JSON
#
import logging

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-7s %(name)s  %(message)s")

log = logging.getLogger(__name__)

log.info("user %s logged in", 42)               # lazy %s, NOT f-string
log.exception("query failed")                    # use INSIDE except — adds traceback
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dictConfig with file rotation, console handler, library-level mute
# STRENGTHS - Configuration that scales past one file
# WEAKNESSES- Still text logs; senior tier covers JSON
#
import logging.config

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s %(levelname)-7s %(name)s  %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default"},
        "file": {
            "class":      "logging.handlers.RotatingFileHandler",
            "filename":   "app.log",
            "maxBytes":   10_000_000,
            "backupCount": 5,
            "formatter":  "default",
        },
    },
    "loggers": {
        "myapp":             {"level": "INFO", "handlers": ["console", "file"]},
        "uvicorn":           {"level": "INFO"},
        "sqlalchemy.engine": {"level": "WARNING"},     # mute noisy libs
    },
    "root": {"level": "WARNING", "handlers": ["console"]},
}
logging.config.dictConfig(LOGGING)

log = logging.getLogger("myapp.users")
log.info("created user", extra={"user_id": 42})  # extra={} adds context fields
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Structured JSON logs, request-id correlation via Filter, exception contract
# STRENGTHS - The pattern that turns logs into queryable telemetry
# WEAKNESSES- N/A
#
import contextvars
import json
import logging
import logging.config

# 1) Per-request correlation — set in middleware, every log line carries it
request_id = contextvars.ContextVar("request_id", default="-")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id.get()
        return True

# 2) Structured JSON formatter — one line of JSON per log event
RESERVED = {
    "args","msg","levelname","levelno","pathname","filename","module",
    "exc_info","exc_text","stack_info","lineno","funcName","created","msecs",
    "relativeCreated","thread","threadName","processName","process","name",
    "request_id",
}

class JsonFormatter(logging.Formatter):
    def format(self, record):
        out = {
            "ts":     self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level":  record.levelname,
            "logger": record.name,
            "msg":    record.getMessage(),
            "rid":    getattr(record, "request_id", "-"),
        }
        # Pick up any extra={"k": v} fields the caller passed
        for k, v in record.__dict__.items():
            if k not in out and k not in RESERVED:
                out[k] = v
        if record.exc_info:
            out["exc"] = self.formatException(record.exc_info)
        return json.dumps(out, default=str)

logging.config.dictConfig({
    "version": 1, "disable_existing_loggers": False,
    "filters":   {"rid":  {"()": RequestIdFilter}},
    "formatters":{"json": {"()": JsonFormatter}},
    "handlers":  {"stdout": {"class": "logging.StreamHandler",
                              "filters": ["rid"], "formatter": "json"}},
    "root":      {"level": "INFO", "handlers": ["stdout"]},
})
log = logging.getLogger("myapp")

# 3) Exception logging contract — log.exception ONLY inside except blocks
def transfer(amount):
    try:
        do_transfer(amount)
    except Exception:
        log.exception("transfer failed", extra={"amount": amount})
        raise                                    # re-raise so caller decides

# Decision rule:
#   library code                              -> getLogger(__name__); NO basicConfig
#   app entry point                            -> dictConfig once at startup
#   structured / search by field                -> JSON formatter + extra={...}
#   correlate logs to one request               -> ContextVar + Filter
#   exception path                              -> log.exception() inside except
#   noisy library                                -> per-logger level (e.g. sqlalchemy.engine WARNING)
#
# Anti-pattern: logging.basicConfig() inside library code
#   First import wins; later config is silently ignored. Libraries should
#   only acquire loggers; the application owns configuration.

def do_transfer(_): pass
```

## Decision Rule

```text
library code                              -> getLogger(__name__); NO basicConfig
app entry point                            -> dictConfig once at startup
structured / search by field                -> JSON formatter + extra={...}
correlate logs to one request               -> ContextVar + Filter
exception path                              -> log.exception() inside except
noisy library                                -> per-logger level (e.g. sqlalchemy.engine WARNING)
```

## Anti-Pattern

> [!warning] Anti-pattern
> logging.basicConfig() inside library code
>   First import wins; later config is silently ignored. Libraries should
>   only acquire loggers; the application owns configuration.

## Tips

- Use logger.info("msg %s", var) NOT logger.info(f"msg {var}") — lazy formatting skips string creation if level is filtered.
- getLogger(__name__) per module creates a hierarchy — configure the root logger once at startup. Library code must NEVER call basicConfig (first import wins, later config is silently ignored); only the application owns configuration.
- RotatingFileHandler prevents logs from filling the disk — set maxBytes and backupCount.
- logger.exception() goes inside `except` blocks (it auto-includes the traceback) and should usually be followed by `raise` so the caller decides. For request correlation, set a `contextvars.ContextVar` in middleware and a `logging.Filter` that copies it onto every record (`record.request_id = ...`).

## Common Mistake

> [!warning] Using print() for production logging — it can't be filtered by level, rotated, sent to files, or structured as JSON. Also: calling `logging.basicConfig()` from a library — first call wins and silently overrides the application's config.

## Shorthand (Junior → Senior)

**Junior:**
```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.info("Application started")
```

**Senior:**
```python
import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)
logger.info("Application started")
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/advanced/pathlib-logging/_Index|Advanced Python → Pathlib & Logging]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

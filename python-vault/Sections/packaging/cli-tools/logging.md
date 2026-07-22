---
type: "entry"
domain: "python"
file: "packaging"
section: "cli-tools"
id: "logging"
title: "Logging & Observability — Production Python"
category: "Logging"
subtitle: "logging, structlog, getLogger, handlers, formatters, JSON logging"
signature_short: "logging.getLogger(__name__)  |  logger.info(\"msg\", extra={})  |  structlog.get_logger()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Logging & Observability — Production Python"
  - "logging"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/cli-tools"
  - "category/logging"
  - "tier/tiered"
---

# Logging & Observability — Production Python

> logging, structlog, getLogger, handlers, formatters, JSON logging

## Overview

Python logging provides hierarchical loggers, handlers (console, file, remote), and formatters. In production, use structured logging (JSON) for log aggregation (ELK, Datadog, CloudWatch). structlog adds context binding, processors, and JSON output. Key patterns: one logger per module (getLogger(__name__)), structured context (user_id, request_id), and appropriate log levels (DEBUG for development, INFO for operations, WARNING for recoverable issues, ERROR for failures).

## Signature

```python
logging.getLogger(__name__)  |  logger.info("msg", extra={})  |  structlog.get_logger()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basicConfig once, getLogger(__name__) per module, log levels for severity.
# STRENGTHS - Stdlib only; works in scripts and small services without dependencies.
# WEAKNESSES- print() lookalike output; no structured fields; dies fast under multi-process.
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

log = logging.getLogger(__name__)

log.info("started")
log.warning("near rate limit: %d/%d", 95, 100)     # %-style is lazy
try:
    1 / 0
except ZeroDivisionError:
    log.error("math broke", exc_info=True)         # captures traceback
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dictConfig at startup; named loggers per module; structured 'extra' fields; rotating file handler.
# STRENGTHS - Centralized config, swappable handlers, rotating files prevent disk fills, handlers per env.
# WEAKNESSES- 'extra' dicts collide if a key already exists on LogRecord; structlog avoids that footgun.
import logging
import logging.config

LOG_CFG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {"format": "%(asctime)s %(levelname)-7s %(name)s | %(message)s"},
        "json":    {"()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                    "format": "%(asctime)s %(levelname)s %(name)s %(message)s"},
    },
    "handlers": {
        "stderr": {"class": "logging.StreamHandler",
                   "formatter": "console", "level": "INFO"},
        "file":   {"class": "logging.handlers.RotatingFileHandler",
                   "filename": "app.log", "maxBytes": 10_000_000, "backupCount": 3,
                   "formatter": "json", "level": "DEBUG"},
    },
    "root": {"handlers": ["stderr", "file"], "level": "DEBUG"},
    "loggers": {
        "httpx":  {"level": "WARNING", "propagate": True},   # quiet noisy lib
    },
}
logging.config.dictConfig(LOG_CFG)
log = logging.getLogger(__name__)

log.info("processing_started", extra={"file": "data.csv", "rows": 1000})
# JSON file gets {... "file": "data.csv", "rows": 1000}; console gets the human format.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - structlog for context binding, JSON in prod, human-friendly in dev; redaction processor for PII; correlation IDs; QueueHandler under multiprocess.
# STRENGTHS - Single record format flows from local debug to ELK/Datadog; bound contextvars survive across awaits; safe under workers.
# WEAKNESSES- Log volume cost is real -- sample DEBUG, drop bodies for sensitive fields, never log JWTs/PII.
from __future__ import annotations
import logging
import logging.config
import os
import queue
import sys
import structlog
from logging.handlers import QueueHandler, QueueListener

# 1) Redact sensitive fields BEFORE serialization.
SENSITIVE = {"password", "token", "authorization", "api_key", "ssn", "card"}
def redact(_, __, event_dict: dict) -> dict:
    for k in list(event_dict):
        if k.lower() in SENSITIVE:
            event_dict[k] = "***"
    return event_dict

# 2) Pick processors by environment -- pretty in dev, JSON in prod.
def _renderer():
    if sys.stderr.isatty() and os.environ.get("ENV") != "prod":
        return structlog.dev.ConsoleRenderer(colors=True)
    return structlog.processors.JSONRenderer()

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,            # request_id auto-attach
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        redact,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        _renderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    cache_logger_on_first_use=True,
)

# 3) Per-request correlation ID via contextvars -- works across async boundaries.
import uuid
def with_request_id():
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=str(uuid.uuid4())[:8])

# 4) Multi-process safe: hand records to a single listener via a Queue.
log_queue: queue.Queue = queue.Queue(-1)
file_handler = logging.FileHandler("app.log")
listener = QueueListener(log_queue, file_handler, respect_handler_level=True)
listener.start()
logging.getLogger().addHandler(QueueHandler(log_queue))

log = structlog.get_logger()
with_request_id()
log.info("payment_attempt", amount_cents=9999, currency="USD",
         token="should-be-redacted")        # 'token' -> ***

# Decision rule:
#   stdlib-only script                              -> logging.basicConfig
#   service with multiple modules                   -> dictConfig + getLogger(__name__)
#   structured fields, env-aware rendering          -> structlog (Console in dev, JSON in prod)
#   request correlation across async               -> structlog.contextvars + bind_contextvars
#   multi-process / forking server                  -> QueueHandler + QueueListener (one writer)
#   PII / secrets in payloads                       -> redact processor BEFORE the renderer
#   noisy third-party lib                           -> logging.getLogger("name").setLevel(WARNING)
#   sampling DEBUG in prod                          -> filter on the handler, not the logger
#
# Anti-pattern: building a JSON string by hand inside log.info(...). The log
# aggregator can't index those fields, redaction can't see them, and a misplaced
# quote breaks parsing for the whole line. Pass kwargs; let the renderer serialize.
```

## Decision Rule

```text
stdlib-only script                              -> logging.basicConfig
service with multiple modules                   -> dictConfig + getLogger(__name__)
structured fields, env-aware rendering          -> structlog (Console in dev, JSON in prod)
request correlation across async               -> structlog.contextvars + bind_contextvars
multi-process / forking server                  -> QueueHandler + QueueListener (one writer)
PII / secrets in payloads                       -> redact processor BEFORE the renderer
noisy third-party lib                           -> logging.getLogger("name").setLevel(WARNING)
sampling DEBUG in prod                          -> filter on the handler, not the logger
```

## Anti-Pattern

> [!warning] Anti-pattern
> building a JSON string by hand inside log.info(...). The log
> aggregator can't index those fields, redaction can't see them, and a misplaced
> quote breaks parsing for the whole line. Pass kwargs; let the renderer serialize.

## Tips

- Use getLogger(__name__) per module — it creates a hierarchy (myapp.services.auth) that you can configure independently.
- structlog with bound context (request_id, user_id) makes log correlation trivial — essential for debugging distributed systems.
- Use JSON logging in production — every log aggregation tool (ELK, Datadog, CloudWatch) parses JSON natively.
- Never log sensitive data (passwords, tokens, PII) — wire a redaction processor BEFORE the renderer so the secret is gone before serialization. Under multi-process / forking servers, route records through QueueHandler + QueueListener so a single writer owns the file.

## Common Mistake

> [!warning] Building a JSON string by hand inside log.info(...) — the aggregator can't index those fields, redaction can't see them, and a misplaced quote breaks parsing for the whole line. Pass kwargs and let the renderer serialize. Also: print() instead of logging loses levels, timestamps, structure, and per-module config.

## Shorthand (Junior → Senior)

**Junior:**
```python
print(f"Processing {file} at {datetime.now()}")
print("Error: failed to connect")
```

**Senior:**
```python
logger.info("processing_started", file=file)
logger.error("connection_failed", exc_info=True)
```

## See Also

- [[Sections/packaging/cli-tools/_Index|Packaging, CLI & Tooling → CLI Development & Logging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

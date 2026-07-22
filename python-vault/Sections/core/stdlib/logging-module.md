---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "logging-module"
title: "logging Module"
category: "Debugging"
subtitle: "Replace print() with configurable logging"
signature_short: "import logging
logging.basicConfig(...)
logger.info(...)
logger.error(...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "logging Module"
  - "logging-module"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/debugging"
  - "tier/tiered"
---

# logging Module

> Replace print() with configurable logging

## Overview

logging module provides levels (DEBUG, INFO, WARNING, ERROR, CRITICAL), handlers (file, stream, email), and formatters. More flexible than print() for production code.

## Signature

```python
import logging
logging.basicConfig(...)
logger.info(...)
logger.error(...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basicConfig once at startup; getLogger(__name__) per module; lazy %s formatting.
# STRENGTHS - Replaces print() with levels, timestamps, hierarchy.
# WEAKNESSES- See packaging.js cli-tools/logging for structured/JSON logging in production.
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger(__name__)

log.info("started")
log.warning("near rate limit: %d/%d", 95, 100)   # %-style is LAZY
try:
    1 / 0
except ZeroDivisionError:
    log.exception("math broke")                   # auto-includes traceback
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dictConfig at startup, RotatingFileHandler for disk safety, lazy formatting, log.exception in except blocks.
# STRENGTHS - Centralized config; rotating files prevent disk fills; per-module level control.
# WEAKNESSES- See packaging.js for structlog + JSON + redaction patterns.
import logging
import logging.config

logging.config.dictConfig({
    "version": 1, "disable_existing_loggers": False,
    "formatters": {"std": {"format": "%(asctime)s %(levelname)s %(name)s | %(message)s"}},
    "handlers": {
        "stderr": {"class": "logging.StreamHandler", "formatter": "std", "level": "INFO"},
        "file":   {"class": "logging.handlers.RotatingFileHandler",
                   "filename": "app.log", "maxBytes": 10_000_000, "backupCount": 3,
                   "formatter": "std", "level": "DEBUG"},
    },
    "root": {"handlers": ["stderr", "file"], "level": "DEBUG"},
    "loggers": {"httpx": {"level": "WARNING"}},     # quiet noisy lib
})

log = logging.getLogger(__name__)
log.info("processed", extra={"file": "data.csv", "rows": 1000})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For structured / JSON logging, contextvars correlation IDs, redaction, multi-process QueueHandler — see packaging.js cli-tools/logging senior tier.
# STRENGTHS - That entry covers the production patterns: structlog, env-aware rendering, request_id propagation, signal-safe queue handlers.
# WEAKNESSES- stdlib logging alone scales OK; the structlog/JSON path pays off when a log aggregator is involved.
# Quick reference (full senior tier in packaging.js):
#
#   getLogger(__name__) per module                -> hierarchical config
#   log.exception("msg")                          -> includes traceback automatically
#   lazy % formatting                             -> log.info("x=%s", var)  (skips str() if filtered)
#   "extra={...}" for structured fields           -> JSONFormatter or structlog reads them
#   never log secrets                             -> redact at the formatter / processor stage
#   under multiprocess                            -> QueueHandler + QueueListener (one writer)
#   environment-aware                              -> Console (dev) vs JSONRenderer (prod) via structlog
#
# Decision rule:
#   tiny script                              -> logging.basicConfig
#   service / multi-module                   -> dictConfig + getLogger(__name__)
#   structured fields, JSON sink              -> structlog (see packaging.js)
#   correlation across async                 -> structlog.contextvars + contextvars
#   multi-process forking server              -> QueueHandler/QueueListener
#   PII / tokens in payloads                  -> redaction processor BEFORE the renderer
#
# Anti-pattern: f-string formatting in log calls. log.info(f"x={var}") evaluates
# the f-string EVEN when the level is filtered. Use log.info("x=%s", var) so the
# format is skipped when the message wouldn't be emitted.
```

## Decision Rule

```text
tiny script                              -> logging.basicConfig
service / multi-module                   -> dictConfig + getLogger(__name__)
structured fields, JSON sink              -> structlog (see packaging.js)
correlation across async                 -> structlog.contextvars + contextvars
multi-process forking server              -> QueueHandler/QueueListener
PII / tokens in payloads                  -> redaction processor BEFORE the renderer
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string formatting in log calls. log.info(f"x={var}") evaluates
> the f-string EVEN when the level is filtered. Use log.info("x=%s", var) so the
> format is skipped when the message wouldn't be emitted.

## Tips

- Use logger per module: logger = logging.getLogger(__name__) — hierarchy makes filtering easy
- Avoid logging sensitive data (passwords, tokens) — set level to WARNING in production
- File rotation prevents massive log files — RotatingFileHandler auto-manages backups
- Use lazy formatting: logger.info("x=%s", var) only formats if level enabled

## Common Mistake

> [!warning] Using print() in production code. Replace with logging — allows runtime filtering, file output, and structured logging.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

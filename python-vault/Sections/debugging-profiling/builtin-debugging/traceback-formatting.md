---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "builtin-debugging"
id: "traceback-formatting"
title: "traceback — capture, format, and chain exceptions"
category: "Error Handling"
subtitle: "traceback.format_exc, format_exception, sys.excepthook, raise X from Y, __cause__, rich.traceback.install"
signature_short: "try: ... except Exception: log.exception(\"failure\", extra={\"trace\": traceback.format_exc()})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "traceback — capture, format, and chain exceptions"
  - "traceback-formatting"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/builtin-debugging"
  - "category/error-handling"
  - "tier/tiered"
---

# traceback — capture, format, and chain exceptions

> traceback.format_exc, format_exception, sys.excepthook, raise X from Y, __cause__, rich.traceback.install

## Overview

When something fails in production, you don't have a debugger — you have a log line. The quality of that log line is the difference between a 10-minute fix and a 10-hour incident. The stdlib `traceback` module covers the basics; the polish is structured logging, rich-formatted output for dev, and properly chained exceptions so the original cause survives layers of catch-and-rewrap. The three examples solve the SAME concrete task — a remote operator hits an error in `process_payment` and needs enough information from the log to debug — at three depths: print the traceback → structured fields and chain via `raise from` → rich.traceback in dev, structured logging with locals capture in prod.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — An operator hits an error in process_payment; the log must show enough context to debug remotely.
- **Junior** — SAME — but preserve the cause when re-raising, and emit the traceback as structured fields (not just a string blob).
- **Senior** — SAME — production-grade: rich-formatted local tracebacks, structured JSON in prod with sanitized locals, integration with structlog and a sentry-style global handler, suppressing internal frames so the log focuses on the user's code.

## Signature

```python
try: ... except Exception: log.exception("failure", extra={"trace": traceback.format_exc()})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - An operator hits an error in process_payment; the log must
#             show enough context to debug remotely.
# APPROACH  - traceback.format_exc() inside an except block; log the string.
# STRENGTHS - Smallest correct: full traceback, line numbers, file paths.
# WEAKNESSES- Loses chain when re-raising; no locals; one giant string.
import logging
import traceback

log = logging.getLogger("payments")

def process_payment(amount: int) -> str:
    if amount <= 0:
        raise ValueError(f"amount must be positive, got {amount}")
    return "ok"

try:
    process_payment(-5)
except Exception:
    log.error("process_payment failed:\n%s", traceback.format_exc())

# Output (typical):
#   ValueError: amount must be positive, got -5
#     File "app.py", line 12, in process_payment
#       raise ValueError(f"amount must be positive, got {amount}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but preserve the cause when re-raising, and emit the
#             traceback as structured fields (not just a string blob).
# APPROACH  - raise NewError("...") from original_exc — preserves __cause__;
#             log.exception() includes exc_info automatically; format_list
#             gives one frame per dict for structured sinks.
# STRENGTHS - JSON log sinks (Splunk, Loki, Datadog) get queryable fields;
#             full chain visible: "NewError caused by ValueError caused by KeyError".
# WEAKNESSES- Verbose; if you only want one log call, log.exception() suffices.
import logging
import traceback

log = logging.getLogger("payments")

class PaymentRefused(Exception):
    pass

def process_payment(amount: int) -> str:
    if amount <= 0:
        raise ValueError(f"amount must be positive, got {amount}")
    return "ok"

def charge(user_id: int, amount: int) -> None:
    try:
        process_payment(amount)
    except ValueError as e:
        # Preserve the cause; raise a domain error.
        raise PaymentRefused(f"refused for user {user_id}") from e

try:
    charge(42, -5)
except PaymentRefused:
    # log.exception() == log.error(..., exc_info=True); attaches full traceback.
    log.exception("payment failed", extra={"user_id": 42})

# Or build it yourself for a structured sink:
try:
    charge(42, -5)
except PaymentRefused as e:
    frames = traceback.format_list(traceback.extract_tb(e.__traceback__))
    log.error(
        "payment failed",
        extra={
            "exc_type": type(e).__name__,
            "exc_msg": str(e),
            "cause_type": type(e.__cause__).__name__ if e.__cause__ else None,
            "cause_msg": str(e.__cause__) if e.__cause__ else None,
            "frames": frames,
        },
    )
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: rich-formatted local tracebacks,
#             structured JSON in prod with sanitized locals, integration
#             with structlog and a sentry-style global handler, suppressing
#             internal frames so the log focuses on the user's code.
# APPROACH  - rich.traceback.install for dev; structlog format_exc_info
#             processor for prod JSON; sys.excepthook captures the truly
#             uncaught; tb_walk to redact secrets in locals.
# STRENGTHS - One log line per failure carries everything you need: chain,
#             frames, locals, cause; dev sees colorized output, prod sees
#             searchable JSON; secrets never escape the process.
# WEAKNESSES- More moving parts; the locals-capture path is opt-in because
#             logging full locals on every error fills disks fast.
import logging
import os
import sys
import traceback
from typing import Any

import structlog

# 1) Dev: rich.traceback for highlighted, locals-aware tracebacks.
if os.environ.get("ENV") == "dev":
    import rich.traceback
    rich.traceback.install(show_locals=True, max_frames=20)

# 2) Prod: structlog with format_exc_info processor — exc renders as nested JSON.
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.format_exc_info,        # turns exc_info into traceback fields
        structlog.processors.JSONRenderer(),
    ],
)
log = structlog.get_logger("payments")

# 3) Walk the traceback chain (handles __cause__ and __context__).
def chain_summary(exc: BaseException) -> list[dict[str, Any]]:
    out = []
    cur: BaseException | None = exc
    while cur is not None:
        out.append({
            "type": type(cur).__name__,
            "msg": str(cur),
            "frames": [
                {"file": f.filename, "line": f.lineno, "func": f.name, "code": f.line}
                for f in traceback.extract_tb(cur.__traceback__)
                if "/site-packages/" not in f.filename             # drop library frames
            ],
        })
        # __cause__ wins over __context__ — explicit chain via 'raise X from Y'.
        cur = cur.__cause__ or (cur.__context__ if not cur.__suppress_context__ else None)
    return out

SECRETS_REDACT = {"password", "token", "api_key", "authorization", "cookie"}

def safe_locals(frame_locals: dict) -> dict:
    return {
        k: ("***" if any(s in k.lower() for s in SECRETS_REDACT) else repr(v)[:200])
        for k, v in frame_locals.items()
    }

# 4) Global handler — last resort for uncaught exceptions.
def excepthook(exc_type, exc, tb):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc, tb)
        return
    log.error(
        "uncaught exception",
        chain=chain_summary(exc),
        # Locals are opt-in — they can be huge.
        last_frame_locals=safe_locals(tb.tb_frame.f_locals) if tb else None,
    )
    sys.__excepthook__(exc_type, exc, tb)

sys.excepthook = excepthook
# For threads: threading.excepthook = lambda args: excepthook(args.exc_type, args.exc_value, args.exc_traceback)

# 5) Use it.
class PaymentRefused(Exception): ...

def charge(user_id: int, amount: int) -> None:
    try:
        if amount <= 0:
            raise ValueError(f"amount must be positive, got {amount}")
    except ValueError as e:
        raise PaymentRefused(f"refused for user {user_id}") from e

try:
    charge(42, -5)
except PaymentRefused as e:
    log.exception("payment failed", user_id=42, chain=chain_summary(e))

# Decision rule:
#   one-line log of failure          -> log.exception("...") — exc_info added automatically
#   structured JSON sink             -> structlog + format_exc_info processor
#   need machine-parseable frames    -> traceback.extract_tb -> list of {file,line,func}
#   colorized dev terminal           -> rich.traceback.install(show_locals=True)
#   re-raising as a domain error     -> raise DomainErr("...") from original   (preserves __cause__)
#   uncaught exception in a thread   -> threading.excepthook (Python 3.8+)
#   secrets in locals                -> walk frames + redact keys matching SECRETS_REDACT
#   production stack-trace too noisy -> drop /site-packages/ frames; or set sys.tracebacklimit
#   debugging via APM (Sentry/etc)   -> SDK installs its own excepthook — don't double-install
#
# Anti-pattern: catching an exception, logging only str(exc), and re-raising
# a fresh Exception WITHOUT 'from'. The log loses the line number; the new
# exception has no __cause__ chain; the operator sees "PaymentRefused"
# without knowing it was a ValueError on negative input. Always: 'raise
# DomainError("...") from original' — five extra characters that save hours.
```

## Decision Rule

```text
one-line log of failure          -> log.exception("...") — exc_info added automatically
structured JSON sink             -> structlog + format_exc_info processor
need machine-parseable frames    -> traceback.extract_tb -> list of {file,line,func}
colorized dev terminal           -> rich.traceback.install(show_locals=True)
re-raising as a domain error     -> raise DomainErr("...") from original   (preserves __cause__)
uncaught exception in a thread   -> threading.excepthook (Python 3.8+)
secrets in locals                -> walk frames + redact keys matching SECRETS_REDACT
production stack-trace too noisy -> drop /site-packages/ frames; or set sys.tracebacklimit
debugging via APM (Sentry/etc)   -> SDK installs its own excepthook — don't double-install
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching an exception, logging only str(exc), and re-raising
> a fresh Exception WITHOUT 'from'. The log loses the line number; the new
> exception has no __cause__ chain; the operator sees "PaymentRefused"
> without knowing it was a ValueError on negative input. Always: 'raise
> DomainError("...") from original' — five extra characters that save hours.

## Tips

- `log.exception("msg")` is `log.error("msg", exc_info=True)` — attaches the current exception's traceback. Use it inside `except` blocks; never bare `log.error()`.
- `raise NewError("...") from original` sets `__cause__` and prints "The above exception was the direct cause of the following exception". Without `from`, Python uses `__context__` and prints "During handling..." — confusing for callers.
- For structured logs, `traceback.extract_tb(exc.__traceback__)` returns `FrameSummary` objects you can serialize. Each has `filename`, `lineno`, `name`, `line` — clean dict-friendly fields.
- Walk the chain via `exc.__cause__` (explicit `raise from`) then fall back to `exc.__context__` (implicit) unless `__suppress_context__` is set. The behavior matches Python's built-in formatter.
- `rich.traceback.install(show_locals=True)` in dev produces traceback output with syntax highlighting AND every frame's locals expanded inline — incomparably faster to debug from than a plain stderr dump.
- `sys.tracebacklimit = 5` truncates traceback output to N frames — useful when stack traces are dominated by framework noise. Set in your entrypoint, not deep in a library.

## Common Mistake

> [!warning] Catching an exception, logging `str(exc)` (or worse, just the message), and re-raising a fresh Exception without `from`. The new exception has no `__cause__` chain; logs show a domain error (e.g., `PaymentRefused`) with no line number for the underlying problem. Use `raise DomainError("...") from original` — five characters that preserve the cause and save hours of bisecting.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Loses the cause; log shows DomainError with no underlying frame
try:
    process(...)
except ValueError:
    raise DomainError("rejected")
```

**Senior:**
```python
# Preserves __cause__; full chain in the traceback
try:
    process(...)
except ValueError as e:
    raise DomainError("rejected") from e
```

## See Also

- [[Sections/debugging-profiling/builtin-debugging/faulthandler-segfault|faulthandler — Python traceback on segfault / hang (Debugging & Profiling)]]
- [[Sections/debugging-profiling/builtin-debugging/_Index|Debugging & Profiling → Built-in Debugging — pdb, traceback, faulthandler, inspect]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]

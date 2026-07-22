---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "exceptions"
title: "Exception handling"
category: "Standard Library"
subtitle: "Catch specific exceptions, use else/finally, define custom types"
signature_short: "try: ... except ValueError as e: ... else: ... finally: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Exception handling"
  - "exceptions"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# Exception handling

> Catch specific exceptions, use else/finally, define custom types

## Overview

Always catch specific exceptions — bare except catches everything including SystemExit and KeyboardInterrupt. The else clause runs only when no exception occurred. finally always runs — use it for cleanup. Custom exceptions should inherit from Exception.

## Signature

```python
try: ... except ValueError as e: ... else: ... finally: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - try / except SpecificType / else / finally; raise to signal; never bare except.
# STRENGTHS - Handles specific failures cleanly; carries error messages through traceback.
# WEAKNESSES- See builtin-exceptions for the full hierarchy and category-based catching.
try:
    n = int(input("number? "))
except ValueError:
    print("not a number")
else:
    print(f"got {n}")
finally:
    print("done")

raise ValueError("must be positive")            # signal a problem
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Custom hierarchy (AppError -> ValidationError); raise X from e to chain; multi-catch with tuple.
# STRENGTHS - Callers can catch by category; tracebacks preserve cause; specific errors guide handling.
# WEAKNESSES- Custom exceptions require discipline — keep the hierarchy SHALLOW (3-4 classes max).
class AppError(Exception): ...
class ValidationError(AppError):
    def __init__(self, field: str, msg: str):
        self.field = field
        super().__init__(f"{field}: {msg}")

def parse_age(s: str) -> int:
    try:
        n = int(s)
    except ValueError as e:
        raise ValidationError("age", "not a number") from e   # preserve cause
    if n < 0:
        raise ValidationError("age", "must be >= 0")
    return n

try:
    parse_age("abc")
except ValidationError as e:
    print(f"bad input: {e.field}")
except AppError as e:
    print(f"generic app failure: {e}")
except (KeyError, TypeError):
    pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For ExceptionGroup / except*, retry semantics, structured logging — see advanced.js, concurrency.js senior tiers.
# STRENGTHS - Errors carry diagnostic context; categories drive retry/abort decisions; tracebacks survive boundaries.
# WEAKNESSES- The hierarchy is contagious — every package adding its own root class fragments the catch ladder.
from __future__ import annotations
import logging
log = logging.getLogger(__name__)

class TransientError(Exception):
    """Caller should retry."""
class FatalError(Exception):
    """Caller should abort."""

def with_retry(fn, *, attempts: int = 3):
    last: Exception | None = None
    for i in range(attempts):
        try: return fn()
        except TransientError as e:
            last = e; log.warning("attempt %d/%d: %s", i + 1, attempts, e)
        except FatalError:
            raise                                            # never retry fatal
    raise RuntimeError("retries exhausted") from last

# Decision rule:
#   single failure mode you understand     -> catch the specific exception class
#   "any I/O failure"                       -> except OSError (parent of FNF + Permission + ...)
#   re-raise with cause                    -> raise NewError(...) from e (NOT bare raise NewError)
#   "ignore this specific miss"             -> contextlib.suppress(ExcType) — documents intent
#   fan-out (gather/TaskGroup)              -> ExceptionGroup + except* (3.11+)
#   want callers to retry vs abort         -> separate exception classes (Transient vs Fatal)
#   silence everything                     -> NEVER. except Exception: pass is a bug magnet
#
# Anti-pattern: try/except Exception: log.error(e). The traceback vanishes.
# Use log.exception(...) (auto-includes traceback) or log.error("...",
# exc_info=True). And re-raise unless you actually handled it.
```

## Decision Rule

```text
single failure mode you understand     -> catch the specific exception class
"any I/O failure"                       -> except OSError (parent of FNF + Permission + ...)
re-raise with cause                    -> raise NewError(...) from e (NOT bare raise NewError)
"ignore this specific miss"             -> contextlib.suppress(ExcType) — documents intent
fan-out (gather/TaskGroup)              -> ExceptionGroup + except* (3.11+)
want callers to retry vs abort         -> separate exception classes (Transient vs Fatal)
silence everything                     -> NEVER. except Exception: pass is a bug magnet
```

## Anti-Pattern

> [!warning] Anti-pattern
> try/except Exception: log.error(e). The traceback vanishes.
> Use log.exception(...) (auto-includes traceback) or log.error("...",
> exc_info=True). And re-raise unless you actually handled it.

## Tips

- Never use bare `except:` — it catches `SystemExit`, `KeyboardInterrupt`, and generator exits
- `raise ... from e` preserves the exception chain — critical for debugging
- The `else` clause cleanly separates "code that might fail" from "code that runs on success"
- Define a base `AppError` so callers can catch all app errors with one `except AppError`

## Common Mistake

> [!warning] `except Exception as e: print(e); pass` silently swallows exceptions. At minimum, use `logging.exception("msg")` — it logs the full traceback.

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
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

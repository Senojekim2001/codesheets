---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "builtin-exceptions"
title: "Built-in exceptions"
category: "Standard Library"
subtitle: "Know which exception to catch — never catch Exception blindly"
signature_short: "ValueError | TypeError | KeyError | AttributeError | ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Built-in exceptions"
  - "builtin-exceptions"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# Built-in exceptions

> Know which exception to catch — never catch Exception blindly

## Overview

Python has a rich hierarchy of built-in exceptions. Catching the right exception type makes error handling precise and debuggable. The most common ones to know: ValueError (bad value), TypeError (wrong type), KeyError (missing dict key), AttributeError (missing attribute), IndexError (out of range), FileNotFoundError.

## Signature

```python
ValueError | TypeError | KeyError | AttributeError | ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Catch the SPECIFIC exception you expect; never bare except.
# STRENGTHS - Errors carry meaning: ValueError vs TypeError vs KeyError tell different stories.
# WEAKNESSES- Catching too broadly (except Exception:) silences bugs.
try:
    n = int(user_input)
except ValueError:
    n = 0                                   # bad literal -> default

try:
    val = config["host"]
except KeyError:
    val = "localhost"                       # missing key -> default

try:
    open("missing.txt")
except FileNotFoundError:
    print("file not there")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-catch with tuples; OSError covers FileNotFoundError + PermissionError + ...; raise from for chaining; else/finally clauses.
# STRENGTHS - Precise diagnostics; preserved cause chain; clean cleanup paths.
# WEAKNESSES- KeyboardInterrupt and SystemExit are BaseException, not Exception — bare except catches them, except Exception does not.
try:
    data = open("/etc/secret").read()
except (FileNotFoundError, PermissionError) as e:    # tuple of types
    raise RuntimeError("config unavailable") from e   # preserve cause

# else: runs only if no exception was raised
# finally: runs always (cleanup)
try:
    f = open("data.csv")
except OSError as e:                                  # parent of FileNotFoundError + PermissionError
    print(f"cannot open: {e}"); raise
else:
    rows = f.read().splitlines()                       # parsed only if open() succeeded
finally:
    try: f.close()
    except NameError: pass                             # f never bound
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Custom exception hierarchy; ExceptionGroup + except* for fanout (3.11+); contextlib.suppress for "I really do mean ignore"; never catch BaseException.
# STRENGTHS - Errors that callers can pattern-match; structured handling under TaskGroup; explicit ignore semantics.
# WEAKNESSES- Custom exceptions invite over-design; keep the hierarchy shallow (3-4 classes max per package).
from __future__ import annotations
from contextlib import suppress

# 1) Define a thin domain hierarchy.
class AppError(Exception): ...
class NotFound(AppError): ...
class Forbidden(AppError): ...
class TransientError(AppError): ...                    # OK to retry
class FatalError(AppError): ...                         # do NOT retry

# 2) Re-raise with context — never swallow tracebacks.
def fetch(url: str) -> bytes:
    import urllib.request
    try:
        return urllib.request.urlopen(url).read()
    except urllib.error.HTTPError as e:
        if e.code == 404: raise NotFound(url) from e
        if e.code == 403: raise Forbidden(url) from e
        raise TransientError(url) from e

# 3) ExceptionGroup + except* — handle a fan-out's failures by category.
async def fan_out(urls):
    import asyncio
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(asyncio.to_thread(fetch, u)) for u in urls]
    return [t.result() for t in tasks]

async def safe_fan_out(urls):
    try:
        return await fan_out(urls)
    except* NotFound as eg:
        for e in eg.exceptions: log("missing: %s", e)
    except* TransientError as eg:
        for e in eg.exceptions: log("retry: %s", e)
    return []

# 4) "I really do mean ignore" — contextlib.suppress documents intent.
with suppress(FileNotFoundError):
    Path("/tmp/lock").unlink()                         # ok if absent

# Decision rule:
#   exact failure mode you expect           -> catch the specific class (ValueError, KeyError)
#   any I/O failure                         -> except OSError  (parent of FileNotFoundError + PermissionError + ...)
#   re-raising with cause                   -> raise NewError(...) from e
#   ignore one specific failure             -> contextlib.suppress(ExcType)
#   fan-out (TaskGroup, gather)             -> except* ExcGroup (3.11+)
#   shutdown / interrupt                     -> CATCH KeyboardInterrupt explicitly if you want to act,
#                                              otherwise let it propagate
#   silence everything                       -> NEVER. except Exception: pass is a bug magnet.
#
# Anti-pattern: try / except Exception: pass. Real bugs (NameError, AttributeError,
# OSError) get swallowed; the program "works" but produces garbage. If you must
# catch broadly, log and re-raise.
```

## Decision Rule

```text
exact failure mode you expect           -> catch the specific class (ValueError, KeyError)
any I/O failure                         -> except OSError  (parent of FileNotFoundError + PermissionError + ...)
re-raising with cause                   -> raise NewError(...) from e
ignore one specific failure             -> contextlib.suppress(ExcType)
fan-out (TaskGroup, gather)             -> except* ExcGroup (3.11+)
shutdown / interrupt                     -> CATCH KeyboardInterrupt explicitly if you want to act,
                                           otherwise let it propagate
silence everything                       -> NEVER. except Exception: pass is a bug magnet.
```

## Anti-Pattern

> [!warning] Anti-pattern
> try / except Exception: pass. Real bugs (NameError, AttributeError,
> OSError) get swallowed; the program "works" but produces garbage. If you must
> catch broadly, log and re-raise.

## Tips

- Catch the most specific exception possible — catching Exception hides bugs
- FileNotFoundError, PermissionError are subclasses of OSError — catch OSError for both
- KeyboardInterrupt and SystemExit are NOT subclasses of Exception — bare except: catches them, except Exception: does not
- Use except (TypeError, ValueError) to catch multiple types in one clause

## Common Mistake

> [!warning] Using bare except: or except Exception: to catch everything. This silences real bugs. Always catch the specific exception type you expect.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

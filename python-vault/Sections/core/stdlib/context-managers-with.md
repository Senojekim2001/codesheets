---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "context-managers-with"
title: "Context Managers (with statement)"
category: "Control Flow"
subtitle: "Automatic cleanup of files, locks, connections"
signature_short: "class MyContext:
    def __enter__(self): ...
    def __exit__(self, exc_type, exc, tb): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Context Managers (with statement)"
  - "context-managers-with"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/control-flow"
  - "tier/tiered"
---

# Context Managers (with statement)

> Automatic cleanup of files, locks, connections

## Overview

Context managers (with statement) ensure setup and cleanup code runs. Use for files, database connections, locks, and temporary state changes. Define __enter__ (acquire) and __exit__ (release).

## Signature

```python
class MyContext:
    def __enter__(self): ...
    def __exit__(self, exc_type, exc, tb): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Class with __enter__/__exit__ OR @contextmanager generator; use 'with' to invoke.
# STRENGTHS - Cleanup runs even on exception; one pattern for files, locks, transactions.
# WEAKNESSES- See advanced.js context-manager-patterns for ExitStack and async with.
from contextlib import contextmanager

@contextmanager
def timed(label):
    import time; t0 = time.perf_counter()
    try: yield
    finally: print(f"{label}: {time.perf_counter() - t0:.3f}s")

with timed("load"):
    data = open("big.csv").read()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Class CMs return self from __enter__; __exit__ returns False to propagate; ExitStack for variable counts; suppress for documented ignores.
# STRENGTHS - Class CMs can hold rich state; ExitStack handles N resources discovered at runtime.
# WEAKNESSES- Returning True from __exit__ silently swallows exceptions — almost always wrong.
from contextlib import ExitStack, suppress

class Connection:
    def __init__(self, dsn): self.dsn = dsn
    def __enter__(self):
        print(f"open {self.dsn}"); self.live = True; return self
    def __exit__(self, exc_type, exc, tb):
        print("close"); self.live = False
        return False                                  # propagate exceptions

with Connection("postgres://x") as c:
    print("live:", c.live)

# Variable number of resources via ExitStack.
def merge(paths):
    with ExitStack() as st:
        files = [st.enter_context(open(p)) for p in paths]
        return "".join(f.read() for f in files)

with suppress(FileNotFoundError):
    Path("/tmp/lock").unlink()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For ExitStack callbacks, async with, redirect_stdout/stderr, and the full anti-pattern catalog see advanced.js context-manager-patterns.
# STRENGTHS - One construct unifies file handles, locks, DB transactions, async resources.
# WEAKNESSES- Reusing a single CM instance across multiple with-blocks works only if __enter__ resets state; document re-entry semantics.
from __future__ import annotations
from contextlib import asynccontextmanager, contextmanager, ExitStack

# Async resources need async with + asynccontextmanager.
@asynccontextmanager
async def db_session(pool):
    conn = await pool.acquire()
    try: yield conn
    finally: await pool.release(conn)

# Decision rule:
#   resource that needs cleanup           -> with statement
#   small one-off CM                       -> @contextmanager generator
#   class-shaped CM with state             -> __enter__/__exit__ class
#   variable count of resources            -> contextlib.ExitStack
#   async resource (DB pool, HTTP client)  -> @asynccontextmanager + async with
#   "if it fails, just skip"                -> contextlib.suppress(SpecificExc)
#   capture stdout/stderr                  -> contextlib.redirect_stdout / redirect_stderr
#   nullable CM (sometimes None)           -> contextlib.nullcontext
#
# Anti-pattern: __exit__ returns True. Suppresses ALL exceptions silently —
# including ones you didn't expect. Return False (or omit return); use
# contextlib.suppress with a specific type when you really mean to ignore.
```

## Decision Rule

```text
resource that needs cleanup           -> with statement
small one-off CM                       -> @contextmanager generator
class-shaped CM with state             -> __enter__/__exit__ class
variable count of resources            -> contextlib.ExitStack
async resource (DB pool, HTTP client)  -> @asynccontextmanager + async with
"if it fails, just skip"                -> contextlib.suppress(SpecificExc)
capture stdout/stderr                  -> contextlib.redirect_stdout / redirect_stderr
nullable CM (sometimes None)           -> contextlib.nullcontext
```

## Anti-Pattern

> [!warning] Anti-pattern
> __exit__ returns True. Suppresses ALL exceptions silently —
> including ones you didn't expect. Return False (or omit return); use
> contextlib.suppress with a specific type when you really mean to ignore.

## Tips

- __exit__ receives exception info (type, value, traceback) — return True to suppress
- Use @contextmanager decorator for simple context managers — often cleaner than class
- ExitStack manages multiple resources dynamically — perfect for variable number of files
- finally in context manager always runs — use for guaranteed cleanup

## Common Mistake

> [!warning] Forgetting to use with statement. Always use with for file/connection handling — don't manually call __enter__/__exit__.

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

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

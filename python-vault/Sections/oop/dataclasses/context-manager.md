---
type: "entry"
domain: "python"
file: "oop"
section: "dataclasses"
id: "context-manager"
title: "Context managers"
category: "Modern"
subtitle: "Manage resources safely with the with statement"
signature_short: "def __enter__(self): | def __exit__(self, exc_type, exc_val, tb):"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Context managers"
  - "context-manager"
tags:
  - "python"
  - "python/oop"
  - "python/oop/dataclasses"
  - "category/modern"
  - "tier/tiered"
---

# Context managers

> Manage resources safely with the with statement

## Overview

Context managers guarantee cleanup code runs even if an exception occurs. Implement __enter__ and __exit__ for class-based managers. The @contextmanager decorator makes generator-based managers with yield.

## Signature

```python
def __enter__(self): | def __exit__(self, exc_type, exc_val, tb):
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - tiny class with __enter__ / __exit__. Print on entry and
#             exit so the protocol is unmistakable.
# STRENGTHS - shows the with statement protocol bare — no I/O, no
#             exceptions to reason about.
# WEAKNESSES- doesn't yet handle exception flow or suppression — the
#             real reason context managers exist.
#
class Trace:
    def __enter__(self):
        print("enter")
        return self                 # value for the 'as' target
    def __exit__(self, exc_type, exc_val, tb):
        print("exit")
        # returning None / False means "do NOT suppress exceptions"

with Trace() as t:
    print("inside")
# enter
# inside
# exit
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the two everyday patterns side by side: class-based for
#             stateful resources (DB connections), @contextmanager for
#             quick generator-based wrappers.
# STRENGTHS - covers ~95% of context managers in real code; shows the
#             commit-on-success / rollback-on-error skeleton plus the
#             try/yield/finally idiom.
# WEAKNESSES- still single-resource; doesn't show suppress(), ExitStack
#             for dynamic numbers of resources, or async context.
#
from contextlib import contextmanager

# Class-based: when you have state to hang on the object
class DatabaseConnection:
    def __init__(self, url):
        self.url = url
    def __enter__(self):
        self.conn = connect(self.url)
        return self.conn                  # 'as' target
    def __exit__(self, exc_type, exc_val, tb):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.conn.close()
        return False                      # don't suppress exceptions

with DatabaseConnection("postgresql://...") as conn:
    conn.execute("INSERT ...")

# Generator-based: shorter for stateless setup/teardown
@contextmanager
def managed_file(path):
    f = open(path)
    try:
        yield f                           # 'as' target
    finally:
        f.close()                         # ALWAYS runs

with managed_file("data.txt") as f:
    data = f.read()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production toolkit: contextlib.suppress for known
#             exceptions, ExitStack for a dynamic set of resources,
#             redirect_stdout for testable scripts, and an async
#             context manager for asyncio code.
# STRENGTHS - one place to learn the shape of every contextlib helper
#             you'll actually use; ExitStack is the answer to "how do
#             I open N files at once" without nested with statements.
# WEAKNESSES- async context managers require an asyncio event loop —
#             not a drop-in for sync code; ExitStack discipline matters
#             (cleanup is LIFO and partial-failure aware).
#
from contextlib import contextmanager, suppress, ExitStack, redirect_stdout
import io

# 1. suppress(...) — silently ignore expected exceptions in a block
with suppress(FileNotFoundError):
    open("might-not-exist.txt").read()

# 2. ExitStack — open a dynamic number of resources safely
def merge(paths: list[str]) -> str:
    with ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        return "".join(f.read() for f in files)
    # all files closed, even if one open() raises mid-loop

# 3. redirect_stdout — make stdout captureable in tests
buf = io.StringIO()
with redirect_stdout(buf):
    print("captured, not printed")
buf.getvalue()             # 'captured, not printed\n'

# 4. async context manager for asyncio code:
class AsyncTrace:
    async def __aenter__(self):
        print("aenter"); return self
    async def __aexit__(self, exc_type, exc, tb):
        print("aexit")

# usage:
# async with AsyncTrace() as t:
#     await something()
#
# Decision rule:
#   stateless setup/teardown                          -> @contextmanager generator
#   stateful resource with attrs/methods              -> class with __enter__/__exit__
#   silently ignore a known exception                 -> contextlib.suppress
#   open a dynamic number of resources                -> contextlib.ExitStack
#   capture stdout/stderr in tests                    -> redirect_stdout / redirect_stderr
#   asyncio resource (DB pool, HTTP client)           -> __aenter__ / __aexit__
#   need to nest many context managers                -> ExitStack, not nested with
#   already have a wrapper-style pattern              -> consider closing(), nullcontext()
#
# Anti-pattern: returning True from __exit__ to "be safe"
#   Returning True suppresses ALL exceptions raised inside the with block,
#   which silently swallows real bugs (KeyboardInterrupt, AssertionError,
#   programming errors). Return False (or None — same thing) and only
#   suppress when intentional, narrowing to specific exception types.
```

## Decision Rule

```text
stateless setup/teardown                          -> @contextmanager generator
stateful resource with attrs/methods              -> class with __enter__/__exit__
silently ignore a known exception                 -> contextlib.suppress
open a dynamic number of resources                -> contextlib.ExitStack
capture stdout/stderr in tests                    -> redirect_stdout / redirect_stderr
asyncio resource (DB pool, HTTP client)           -> __aenter__ / __aexit__
need to nest many context managers                -> ExitStack, not nested with
already have a wrapper-style pattern              -> consider closing(), nullcontext()
```

## Anti-Pattern

> [!warning] Anti-pattern
> returning True from __exit__ to "be safe"
>   Returning True suppresses ALL exceptions raised inside the with block,
>   which silently swallows real bugs (KeyboardInterrupt, AssertionError,
>   programming errors). Return False (or None — same thing) and only
>   suppress when intentional, narrowing to specific exception types.

## Tips

- __exit__ returning True suppresses exceptions — almost always return False
- The @contextmanager decorator is easier for simple cases — try/yield/finally
- contextlib.suppress(ExceptionType) creates a simple do-nothing context manager
- contextlib.ExitStack manages a dynamic number of context managers

## Common Mistake

> [!warning] Returning True from __exit__ accidentally. This suppresses ALL exceptions, hiding errors silently. Only return True if suppression is intentional.

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

- [[Sections/oop/dataclasses/dataclass|@dataclass (Object-Oriented Python)]]
- [[Sections/oop/dataclasses/_Index|Object-Oriented Python → Modern Patterns]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

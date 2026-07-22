---
type: "entry"
domain: "python"
file: "advanced"
section: "context-managers"
id: "context-manager-patterns"
title: "Context Managers — Resource Management & State"
category: "Context Managers"
subtitle: "__enter__/__exit__, contextlib.contextmanager, ExitStack"
signature_short: "with resource as r: ...  |  @contextmanager  |  ExitStack()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Context Managers — Resource Management & State"
  - "context-manager-patterns"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/context-managers"
  - "category/context-managers"
  - "tier/tiered"
---

# Context Managers — Resource Management & State

> __enter__/__exit__, contextlib.contextmanager, ExitStack

## Overview

Context managers guarantee cleanup code runs via __enter__ (setup) and __exit__ (teardown). The with statement calls __enter__ on entry and __exit__ on exit (even if exceptions occur). @contextlib.contextmanager creates context managers from generators (yield once). ExitStack manages a dynamic number of context managers. Use for: file handles, locks, DB transactions, temp directories, monkey-patching.

## Signature

```python
with resource as r: ...  |  @contextmanager  |  ExitStack()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @contextmanager turns a generator into a 'with' resource
# STRENGTHS - Smallest valid context manager; setup before yield, cleanup after
# WEAKNESSES- No class form; no exception handling shown
#
from contextlib import contextmanager
import time

@contextmanager
def timer(label="block"):
    t = time.perf_counter()
    yield                                          # body of 'with' runs here
    print(f"{label}: {(time.perf_counter()-t)*1000:.1f}ms")

with timer("compute"):
    sum(i*i for i in range(100_000))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - try/finally INSIDE generator, class-based form, ExitStack
# STRENGTHS - The three shapes most production code uses
# WEAKNESSES- No async context managers; no AbstractContextManager
#
import os
import tempfile
from contextlib import contextmanager, ExitStack
from pathlib import Path

# 1) Generator form — try/finally is MANDATORY for cleanup on exception
@contextmanager
def cwd(path):
    prev = os.getcwd()
    os.chdir(path)
    try:
        yield path
    finally:
        os.chdir(prev)                             # restored even on raise

# 2) Class form — when you need __init__ args or instance state
class Tx:
    def __init__(self, conn): self.conn = conn
    def __enter__(self):
        self.conn.begin(); return self.conn
    def __exit__(self, exc_type, exc, tb):
        if exc_type is None: self.conn.commit()
        else:                self.conn.rollback()
        return False                               # do NOT swallow the exception

# 3) ExitStack — N resources where N isn't known at write time
def read_all(paths):
    with ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        return [f.read() for f in files]

# Use:
with cwd(tempfile.mkdtemp()) as work:
    Path("out.txt").write_text("hi")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Async context managers, suppress / closing / nullcontext, callback registration
# STRENGTHS - The contextlib utilities most code never finds, but should
# WEAKNESSES- N/A
#
import asyncio
from contextlib import (
    AsyncExitStack, asynccontextmanager,
    contextmanager, suppress, closing, nullcontext,
)

# 1) AsyncExitStack — multi-resource async cleanup, even if any raises
@asynccontextmanager
async def open_resources(urls):
    async with AsyncExitStack() as stack:
        clients = [await stack.enter_async_context(http_client(u)) for u in urls]
        yield clients
    # all aclose()'d in reverse order

# 2) suppress — replace try/except: pass with intent
from pathlib import Path
with suppress(FileNotFoundError):
    Path("maybe.txt").unlink()                     # ok if missing

# 3) closing — wrap legacy objects with a .close() method
from contextlib import closing
import urllib.request
with closing(urllib.request.urlopen("https://example.com")) as r:
    data = r.read()

# 4) nullcontext — branch a 'with' statement on a flag
def maybe_lock(use_lock):
    return some_lock if use_lock else nullcontext()

with maybe_lock(use_lock=True):                    # acts as a no-op when False
    do_critical()

# 5) ExitStack.callback — register cleanup that's not itself a CM
from contextlib import ExitStack
with ExitStack() as stack:
    open_handle = open("data.bin")
    stack.callback(open_handle.close)              # plain function, not __exit__
    stack.callback(lambda: print("about to exit"))
    do_work(open_handle)

# 6) DON'T suppress exceptions in __exit__ unless you mean to
#    return True from __exit__ swallows the exception silently.
#    Almost always: return False (or omit the return).

# Decision rule:
#   single resource, simple cleanup        -> @contextmanager
#   instance state / multiple methods       -> class with __enter__/__exit__
#   N resources, count unknown               -> ExitStack
#   async resources                           -> @asynccontextmanager + AsyncExitStack
#   "ignore this specific error"               -> with suppress(SomeExc)
#   conditional 'with' branch                  -> nullcontext
#   wrap legacy .close() object                 -> closing(obj)
#
# Anti-pattern: returning True from __exit__ to silence errors
#   The caller never sees the exception; bugs hide for weeks. Either let it
#   propagate (return False) or catch the SPECIFIC type and log; never blanket.

async def http_client(_): yield None
def do_critical(): pass
def do_work(_): pass
some_lock = None
```

## Decision Rule

```text
single resource, simple cleanup        -> @contextmanager
instance state / multiple methods       -> class with __enter__/__exit__
N resources, count unknown               -> ExitStack
async resources                           -> @asynccontextmanager + AsyncExitStack
"ignore this specific error"               -> with suppress(SomeExc)
conditional 'with' branch                  -> nullcontext
wrap legacy .close() object                 -> closing(obj)
```

## Anti-Pattern

> [!warning] Anti-pattern
> returning True from __exit__ to silence errors
>   The caller never sees the exception; bugs hide for weeks. Either let it
>   propagate (return False) or catch the SPECIFIC type and log; never blanket.

## Tips

- @contextmanager is usually simpler than a class — use yield for the resource and finally for cleanup.
- Return False from __exit__ to propagate exceptions; return True to suppress them (rarely what you want).
- ExitStack handles a dynamic number of context managers — essential when you don't know the count at write time. Use stack.callback(fn) to register cleanup for things that aren't themselves context managers.
- Reach for the contextlib utilities: `suppress(SomeExc)` replaces try/except: pass; `closing(obj)` wraps legacy .close() objects; `nullcontext()` lets you conditionally branch a `with`. For async code, `@asynccontextmanager` and `AsyncExitStack` are the async-shaped equivalents.

## Common Mistake

> [!warning] Suppressing exceptions in __exit__ by returning True accidentally — this silently swallows errors. Always return False (or omit the return) unless you intentionally want to suppress specific exceptions.

## Shorthand (Junior → Senior)

**Junior:**
```python
class DatabaseTransaction:
    def __init__(self, conn):
        self.conn = conn
    def __enter__(self):
        self.conn.begin()
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
```

**Senior:**
```python
@contextmanager
def database(conn):
    conn.begin()
    try:
        yield conn
    except:
        conn.rollback()
        raise
    else:
        conn.commit()
```

## See Also

- [[Sections/advanced/context-managers/_Index|Advanced Python → Context Managers & Generators]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

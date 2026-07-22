---
type: "entry"
domain: "python"
file: "concurrency"
section: "concurrent-futures"
id: "threadpool-executor"
title: "ThreadPoolExecutor — High-Level Thread Pool"
category: "concurrent.futures"
subtitle: "ThreadPoolExecutor, .submit(), .map(), futures, as_completed()"
signature_short: "ThreadPoolExecutor(max_workers=10)  |  executor.submit(fn, *args)  |  executor.map(fn, items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ThreadPoolExecutor — High-Level Thread Pool"
  - "threadpool-executor"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/concurrent-futures"
  - "category/concurrent-futures"
  - "tier/tiered"
---

# ThreadPoolExecutor — High-Level Thread Pool

> ThreadPoolExecutor, .submit(), .map(), futures, as_completed()

## Overview

ThreadPoolExecutor provides a high-level interface for running tasks in a pool of threads. .submit() submits a single task and returns a Future immediately (non-blocking). .map() is like Python's map but runs in parallel. as_completed() yields futures in completion order. Use for: network I/O, file operations, database queries, API calls. Automatically manages worker threads and cleanup with context manager.

## Signature

```python
ThreadPoolExecutor(max_workers=10)  |  executor.submit(fn, *args)  |  executor.map(fn, items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - executor.map for parallel I/O; results in input order
# STRENGTHS - The minimum: a function, an iterable, parallel execution
# WEAKNESSES- Doesn't show submit / Future
#
from concurrent.futures import ThreadPoolExecutor
import requests

def fetch(url): return requests.get(url, timeout=10).status_code

urls = [f"https://httpbin.org/status/200?i={i}" for i in range(20)]

with ThreadPoolExecutor(max_workers=10) as ex:    # context manager auto-shutdown
    print(list(ex.map(fetch, urls)))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - submit + Future, as_completed, per-future error handling
# STRENGTHS - The shape that handles partial failures
# WEAKNESSES- No wait() / cancellation patterns yet
#
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(url):
    import requests
    r = requests.get(url, timeout=10); r.raise_for_status()
    return r.json()

with ThreadPoolExecutor(max_workers=20) as ex:
    # submit returns Futures immediately; map is a convenience wrapper
    futs = {ex.submit(fetch, u): u for u in urls}

    for fut in as_completed(futs):                 # yields fastest first
        url = futs[fut]
        try:
            data = fut.result(timeout=5)           # raises if > 5s OR worker raised
            print(url, "->", len(data))
        except Exception as e:
            print(url, "failed:", e)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - sizing, async bridging, cancellation truth, shutdown semantics
# STRENGTHS - The doctrine that turns ThreadPoolExecutor into reliable infra
# WEAKNESSES- N/A
#
import asyncio
from concurrent.futures import ThreadPoolExecutor, Future

# 1) SIZING — there's no universal answer; profile and size by bottleneck
#    HTTP per host       -> respect upstream concurrency limit (often 10-20)
#    DB pool              -> match DB server max_connections
#    file I/O on SSD      -> 8-32 is often a sweet spot
#    pure-Python CPU      -> threads don't help; use ProcessPoolExecutor

# 2) ASYNC bridging — call BLOCKING code from async without freezing the loop
io_pool = ThreadPoolExecutor(max_workers=64, thread_name_prefix="io")

async def fetch_in_pool(url):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(io_pool, fetch, url)

async def call_blocking(x):                        # 3.9+: simplest form
    return await asyncio.to_thread(blocking_step, x)

# 3) CANCELLATION truth — Future.cancel() ONLY works BEFORE a worker picks it up.
#    Once a thread is running the body, it CANNOT be killed from outside.
#    Implement cooperative cancellation: an Event the worker checks.
import threading
stop = threading.Event()
def cooperative():
    while not stop.is_set():
        do_chunk()

# 4) SHUTDOWN semantics — wait= and cancel_futures= (3.9+) control behavior
ex = ThreadPoolExecutor(max_workers=4)
try:
    f = ex.submit(slow); f.add_done_callback(handle_done)
finally:
    ex.shutdown(wait=True, cancel_futures=True)    # cancel pending, wait for running

# 5) Future.add_done_callback — non-blocking pipelines
def handle_done(f: Future):
    try:    save(f.result())
    except Exception as e: log(e)

# Decision rule:
#   blocking I/O                                  -> ThreadPoolExecutor.map / submit
#   numpy / sklearn (release GIL)                 -> ThreadPoolExecutor is FINE
#   pure-Python CPU                                -> ProcessPoolExecutor
#   ASYNC code path needs blocking call           -> asyncio.to_thread(fn, *args)
#   long-lived service                              -> create ONE executor at startup
#   need progress per task                          -> as_completed
#   need to enforce a deadline                      -> future.result(timeout=...)
#
# Anti-pattern: creating a new ThreadPoolExecutor inside a hot loop
#   Each pool spins up workers and tears them down — kills throughput. Create
#   ONE pool at startup and reuse it for the lifetime of the service.

def blocking_step(x): return x
def fetch(_): pass
def do_chunk(): pass
def slow(): pass
def save(_): pass
def log(_): pass
urls = []
```

## Decision Rule

```text
blocking I/O                                  -> ThreadPoolExecutor.map / submit
numpy / sklearn (release GIL)                 -> ThreadPoolExecutor is FINE
pure-Python CPU                                -> ProcessPoolExecutor
ASYNC code path needs blocking call           -> asyncio.to_thread(fn, *args)
long-lived service                              -> create ONE executor at startup
need progress per task                          -> as_completed
need to enforce a deadline                      -> future.result(timeout=...)
```

## Anti-Pattern

> [!warning] Anti-pattern
> creating a new ThreadPoolExecutor inside a hot loop
>   Each pool spins up workers and tears them down — kills throughput. Create
>   ONE pool at startup and reuse it for the lifetime of the service.

## Tips

- .submit() returns immediately — use .result() or as_completed() to wait for results.
- as_completed() processes results in finish order — faster responses first, perfect for timeouts.
- .cancel() only works on PENDING futures — running tasks can't be killed from outside. For interruptible workers, design cooperative cancellation: an `Event` the worker checks between chunks.
- max_workers should match your bottleneck: ~20 for network I/O, ~2× CPU count for moderate I/O. Create ONE pool at startup and reuse it for the lifetime of the service. From async code, bridge with `await asyncio.to_thread(fn)` (3.9+) or `loop.run_in_executor(pool, fn, *args)`. Shutdown with `ex.shutdown(wait=True, cancel_futures=True)` (3.9+) to drop never-started tasks.

## Common Mistake

> [!warning] Creating a new ThreadPoolExecutor inside a hot loop — each pool spins workers up and tears them down, killing throughput. Create ONE pool at startup. Also: `.cancel()` on a running task does nothing — wire cooperative cancellation through an Event the worker checks.

## Shorthand (Junior → Senior)

**Junior:**
```python
results = []
for url in urls:
    result = fetch(url)
    results.append(result)
```

**Senior:**
```python
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(fetch, urls))
```

## See Also

- [[Sections/concurrency/concurrent-futures/processpool-executor|ProcessPoolExecutor — High-Level Process Pool for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/futures-patterns|Futures Patterns — Wait, Timeout & Cancellation (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/_Index|Concurrency & Parallelism → concurrent.futures — Unified Executor API]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

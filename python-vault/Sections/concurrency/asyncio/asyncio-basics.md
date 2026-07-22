---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio"
id: "asyncio-basics"
title: "asyncio Fundamentals — async/await, Tasks & Gathering"
category: "asyncio"
subtitle: "async def, await, asyncio.gather, asyncio.create_task"
signature_short: "async def main(): ...  |  await asyncio.gather(*coros)  |  asyncio.run(main())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio Fundamentals — async/await, Tasks & Gathering"
  - "asyncio-basics"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio"
  - "category/asyncio"
  - "tier/tiered"
---

# asyncio Fundamentals — async/await, Tasks & Gathering

> async def, await, asyncio.gather, asyncio.create_task

## Overview

asyncio is Python's built-in async framework for concurrent I/O. async def defines a coroutine. await pauses until a result is ready, letting other coroutines run. asyncio.gather() runs multiple coroutines concurrently and collects results. asyncio.create_task() schedules a coroutine to run in the background. asyncio.run() starts the event loop. Use for: HTTP clients, web servers, database queries, file I/O — anything that waits on external systems.

## Signature

```python
async def main(): ...  |  await asyncio.gather(*coros)  |  asyncio.run(main())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One async function, one await, asyncio.run at the top
# STRENGTHS - Smallest valid asyncio program
# WEAKNESSES- Sequential awaits — no concurrency yet
#
import asyncio

async def hello(name: str) -> str:
    await asyncio.sleep(0.1)                    # pretend I/O
    return f"hello, {name}"

print(asyncio.run(hello("Alice")))               # one entry point starts the loop
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - gather for concurrent calls, create_task for background, return_exceptions
# STRENGTHS - The patterns that actually deliver concurrency
# WEAKNESSES- No timeouts, no TaskGroup
#
import asyncio
import httpx

async def fetch(client, url):
    r = await client.get(url, timeout=10)
    r.raise_for_status()
    return r.json()

async def fetch_all(urls):
    async with httpx.AsyncClient() as client:
        # 1) gather — N requests run AT THE SAME TIME (slowest one wins, not sum)
        return await asyncio.gather(
            *(fetch(client, u) for u in urls),
            return_exceptions=True,             # one failure doesn't kill the rest
        )

async def background():
    # 2) create_task — start work NOW, await later
    bg = asyncio.create_task(slow_compute())
    quick = await quick_thing()
    heavy = await bg                            # already in progress while quick ran
    return quick, heavy

print(asyncio.run(fetch_all(["https://httpbin.org/get"] * 5)))

async def slow_compute(): await asyncio.sleep(1); return 42
async def quick_thing(): return 1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - TaskGroup, timeouts, structured-concurrency cancellation, to_thread for blocking
# STRENGTHS - The Python 3.11+ shape that turns asyncio from "fast" to "robust"
# WEAKNESSES- N/A
#
import asyncio
import time

# 1) TaskGroup — STRUCTURED CONCURRENCY: if one task fails, siblings are
#    cancelled and ALL exceptions surface together as ExceptionGroup.
async def parallel_fetch(urls):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(u)) for u in urls]
    return [t.result() for t in tasks]

# Catch the bundle of errors with except*
async def safe(urls):
    try:
        return await parallel_fetch(urls)
    except* httpx.HTTPError as eg:
        for e in eg.exceptions: log(e)
        return []

# 2) Timeouts via async with — applies to the whole block, not just one await
async def fetch_with_budget(url, seconds=2.0):
    async with asyncio.timeout(seconds):        # 3.11+
        return await fetch(url)
    # asyncio.TimeoutError on overrun

# 3) Bridge to BLOCKING code — never call time.sleep / requests.get inside async
def blocking_io():
    time.sleep(1)                                # would freeze the event loop
    return "done"

async def use_blocking():
    return await asyncio.to_thread(blocking_io)  # runs in a worker thread

# 4) Cancellation discipline — clean up in finally; re-raise CancelledError
async def worker(q):
    try:
        while True:
            item = await q.get()
            await process(item)
    except asyncio.CancelledError:
        await close_resource()                   # cleanup
        raise                                    # MUST re-raise to confirm

# Decision rule:
#   N concurrent calls, fail-fast              -> async with TaskGroup() (3.11+)
#   N concurrent calls, tolerate failures       -> asyncio.gather(..., return_exceptions=True)
#   single deadline                              -> async with asyncio.timeout(s)
#   blocking library inside async code           -> asyncio.to_thread / loop.run_in_executor
#   long-lived background worker                 -> create_task; handle CancelledError
#   inside Jupyter / FastAPI                     -> NEVER asyncio.run; just await
#   CPU-bound work                                -> NOT async; ProcessPoolExecutor
#
# Anti-pattern: try/except Exception that swallows CancelledError
#   The task ignores cancel; shutdown hangs. Catch CancelledError separately
#   (or re-raise after cleanup) so the runtime can stop the task.

import httpx
def log(_): pass
async def fetch(_): await asyncio.sleep(0); return {}
async def process(_): pass
async def close_resource(): pass
```

## Decision Rule

```text
N concurrent calls, fail-fast              -> async with TaskGroup() (3.11+)
N concurrent calls, tolerate failures       -> asyncio.gather(..., return_exceptions=True)
single deadline                              -> async with asyncio.timeout(s)
blocking library inside async code           -> asyncio.to_thread / loop.run_in_executor
long-lived background worker                 -> create_task; handle CancelledError
inside Jupyter / FastAPI                     -> NEVER asyncio.run; just await
CPU-bound work                                -> NOT async; ProcessPoolExecutor
```

## Anti-Pattern

> [!warning] Anti-pattern
> try/except Exception that swallows CancelledError
>   The task ignores cancel; shutdown hangs. Catch CancelledError separately
>   (or re-raise after cleanup) so the runtime can stop the task.

## Tips

- asyncio.gather() is the workhorse — run 100 HTTP requests concurrently instead of sequentially. For fail-fast structured concurrency in 3.11+, prefer `async with asyncio.TaskGroup()` — it cancels siblings on first failure and bundles errors into an ExceptionGroup (catch with `except*`).
- Use asyncio.create_task() to start work in the background while you do other things — await it when you need the result.
- return_exceptions=True in gather prevents one failure from canceling everything — handle errors per-task.
- asyncio is for I/O-bound concurrency (network, files), NOT CPU-bound work — use multiprocessing for CPU. For BLOCKING libraries inside async code, wrap with `await asyncio.to_thread(fn)` (3.9+) so the event loop stays responsive. Apply deadlines with `async with asyncio.timeout(s)` (3.11+) over a whole block; `wait_for` is the single-coroutine version.

## Common Mistake

> [!warning] try/except Exception that catches and swallows CancelledError — the task ignores cancel; shutdown hangs; the runtime can't reclaim resources. Catch CancelledError separately, clean up in finally, then RE-RAISE so the runtime can stop the task. Also: using asyncio for CPU-bound work blocks the event loop; reach for ProcessPoolExecutor instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
async def fetch_all(urls):
    results = []
    for url in urls:
        result = await fetch_url(url)
        results.append(result)
    return results
```

**Senior:**
```python
async def fetch_all(urls):
    return await asyncio.gather(*[fetch_url(url) for url in urls])
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/_Index|Concurrency & Parallelism → asyncio — Asynchronous I/O]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

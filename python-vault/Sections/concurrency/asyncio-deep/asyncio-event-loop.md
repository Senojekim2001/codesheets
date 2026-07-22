---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio-deep"
id: "asyncio-event-loop"
title: "Event Loop — Core of asyncio"
category: "asyncio"
subtitle: "asyncio.run(), asyncio.get_running_loop(), create_task(), to_thread() — get_event_loop() is legacy"
signature_short: "asyncio.run(coro)  |  asyncio.get_running_loop()  |  loop.create_task(coro)  (asyncio.get_event_loop() is legacy outside a running loop)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Event Loop — Core of asyncio"
  - "asyncio-event-loop"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio-deep"
  - "category/asyncio"
  - "tier/tiered"
---

# Event Loop — Core of asyncio

> asyncio.run(), asyncio.get_running_loop(), create_task(), to_thread() — get_event_loop() is legacy

## Overview

The event loop is asyncio's heart — it schedules and executes coroutines. asyncio.run() is the modern entry point (3.7+). get_event_loop() accesses the loop directly for advanced control. run_until_complete() runs a coroutine to completion. create_task() schedules a coroutine as a background task. Low-level: loop.call_soon(), loop.call_later() schedule callbacks. Use raw event loop for: testing, REPL scripting, custom scheduling.

## Signature

```python
asyncio.run(coro)  |  asyncio.get_running_loop()  |  loop.create_task(coro)  (asyncio.get_event_loop() is legacy outside a running loop)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - asyncio.run is the modern entry point
# STRENGTHS - One call: creates loop, runs main, closes loop
# WEAKNESSES- Doesn't show direct loop access
#
import asyncio

async def main():
    await asyncio.sleep(0.1)
    return "done"

print(asyncio.run(main()))                       # use this 99% of the time
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - create_task for background work, get_running_loop for executor bridging
# STRENGTHS - The two loop tools you'll actually need beyond asyncio.run
# WEAKNESSES- No call_soon / call_later (rare in app code)
#
import asyncio

async def background():
    for i in range(3):
        print("bg", i); await asyncio.sleep(0.2)

async def main():
    # Schedules the coro on the loop AND starts it immediately
    bg = asyncio.create_task(background())

    # Foreground keeps running concurrently
    for i in range(2):
        print("fg", i); await asyncio.sleep(0.1)

    await bg                                     # MUST await; orphan tasks log warnings

asyncio.run(main())

# Bridge to a blocking function inside async (3.9+):
def blocking(): import time; time.sleep(1); return 42

async def use_blocking():
    return await asyncio.to_thread(blocking)    # offloads to default thread pool
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - One loop per process; loop policies; uvloop; testing; bridging
# STRENGTHS - The mental model that prevents "RuntimeError: event loop is running"
# WEAKNESSES- N/A
#
import asyncio
import concurrent.futures

# 1) ONE loop per thread. asyncio.run() creates and DESTROYS one each call.
#    Inside FastAPI / Jupyter / pytest-asyncio, a loop is ALREADY running:
#       - script:    asyncio.run(main())
#       - notebook:  await main()
#       - fastapi:   await ... inside an endpoint

# 2) Get the RUNNING loop (3.10+ deprecates get_event_loop in non-running ctx)
async def get_loop_safely():
    return asyncio.get_running_loop()           # ALWAYS prefer in async code

# 3) uvloop — drop-in faster loop on Linux/macOS (~2-4x perf for network-heavy work)
try:
    import uvloop
    uvloop.install()                             # call BEFORE asyncio.run()
except ImportError:
    pass

# 4) Custom executor for offloading — rarely needed, but useful for sizing
io_pool = concurrent.futures.ThreadPoolExecutor(max_workers=64, thread_name_prefix="io")

async def call_blocking(fn, *args):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(io_pool, fn, *args)

# 5) Loop debug mode — catches slow callbacks, hot tasks, leaked coroutines
#    Either: asyncio.run(main(), debug=True)
#    Or set env: PYTHONASYNCIODEBUG=1

# 6) call_soon / call_later are LOW-LEVEL — for integrating non-async libraries
async def schedule_demo():
    loop = asyncio.get_running_loop()
    loop.call_later(0.5, print, "delayed callback")    # runs after 0.5s on the loop
    loop.call_soon(print, "next tick")                 # runs ASAP, on next iteration
    await asyncio.sleep(1)

# Decision rule:
#   script entry point                          -> asyncio.run(main())
#   already inside a loop (FastAPI / Jupyter)    -> await directly; NEVER asyncio.run
#   need the loop object inside async            -> asyncio.get_running_loop()
#   need to await a blocking function             -> asyncio.to_thread(fn) (3.9+)
#   network-heavy server, want speed              -> uvloop.install() at startup
#   integrating a callback-style C library        -> loop.call_soon / loop.call_later
#   debugging "task was never awaited"            -> asyncio.run(main(), debug=True)
#
# Anti-pattern: storing the loop in a global at import time
#   The loop doesn't exist until asyncio.run() starts. Globals captured early
#   point at a CLOSED loop after the first run. Always fetch via
#   get_running_loop() inside an async function.
```

## Decision Rule

```text
script entry point                          -> asyncio.run(main())
already inside a loop (FastAPI / Jupyter)    -> await directly; NEVER asyncio.run
need the loop object inside async            -> asyncio.get_running_loop()
need to await a blocking function             -> asyncio.to_thread(fn) (3.9+)
network-heavy server, want speed              -> uvloop.install() at startup
integrating a callback-style C library        -> loop.call_soon / loop.call_later
debugging "task was never awaited"            -> asyncio.run(main(), debug=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing the loop in a global at import time
>   The loop doesn't exist until asyncio.run() starts. Globals captured early
>   point at a CLOSED loop after the first run. Always fetch via
>   get_running_loop() inside an async function.

## Tips

- asyncio.run() is the standard entry point — it creates/closes the loop automatically. NEVER call it inside FastAPI / Jupyter / pytest-asyncio (a loop is already running there); just `await` directly.
- create_task() schedules a coroutine immediately — it runs concurrently, not sequentially.
- gather() is for collecting multiple coroutine results — cleaner than managing tasks manually.
- call_soon/call_later schedule callbacks — useful for integrating non-async code. For network-heavy servers on Linux/macOS, install uvloop (~2-4× perf): `import uvloop; uvloop.install()` BEFORE `asyncio.run()`. Set `debug=True` (or `PYTHONASYNCIODEBUG=1`) to catch slow callbacks, hot tasks, and "task was never awaited" warnings.

## Common Mistake

> [!warning] Storing the loop in a global at import time — the loop doesn't exist until asyncio.run() starts, and globals captured early point at a CLOSED loop after the first run. Always fetch via `asyncio.get_running_loop()` inside an async function.

## Shorthand (Junior → Senior)

**Junior:**
```python
loop = asyncio.get_event_loop()
try:
    result = loop.run_until_complete(main())
finally:
    loop.close()
```

**Senior:**
```python
result = asyncio.run(main())
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/_Index|Concurrency & Parallelism → asyncio Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

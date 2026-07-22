---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "await"
title: "await"
category: "Async"
subtitle: "Yields control to the event loop — resumes when the result is ready"
signature_short: "result = await coroutine | await asyncio.sleep(1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "await"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# await

> Yields control to the event loop — resumes when the result is ready

## Overview

await suspends the current coroutine and yields control to the event loop until the awaitable completes. It can only be used inside an async def function. Awaitables include coroutines, Tasks, and Futures.

## Signature

```python
result = await coroutine | await asyncio.sleep(1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One await on a coroutine, one on asyncio.sleep
# STRENGTHS - Smallest valid use of await
# WEAKNESSES- No concurrency yet; sequential awaits look like blocking code
#
import asyncio

async def main():
    print("start")
    await asyncio.sleep(1)                 # yields to the event loop for 1s
    print("done")

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Sequential await vs concurrent (gather/create_task), the trap to avoid
# STRENGTHS - The single insight beginners miss: await alone isn't concurrency
# WEAKNESSES- No cancellation, no timeouts
#
import asyncio
import time

async def fetch(url, ms=500):
    await asyncio.sleep(ms / 1000)
    return f"body of {url}"

async def sequential():
    t0 = time.perf_counter()
    a = await fetch("a")                       # waits 500 ms
    b = await fetch("b")                       # waits ANOTHER 500 ms (total 1.0 s)
    print("sequential:", time.perf_counter() - t0, "s")

async def concurrent():
    t0 = time.perf_counter()
    # create_task starts running immediately — both inflight at the same time
    ta = asyncio.create_task(fetch("a"))
    tb = asyncio.create_task(fetch("b"))
    a = await ta
    b = await tb                               # total ~0.5 s (both ran concurrently)
    print("concurrent:", time.perf_counter() - t0, "s")

asyncio.run(sequential())
asyncio.run(concurrent())

# Mental model:
#   await PAUSES the current coroutine — but only this one resumes when ready.
#   Concurrency comes from MULTIPLE in-flight tasks, not from the await keyword.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Cancellation, timeouts, shielding, structured concurrency (TaskGroup)
# STRENGTHS - The patterns that turn await from "sleep" into "robust orchestration"
# WEAKNESSES- N/A
#
import asyncio

# 1) timeout — cancel the operation if it takes too long (3.11+ syntax)
async def fetch_with_timeout():
    try:
        async with asyncio.timeout(2.0):           # 2-second budget for everything inside
            return await long_operation()
    except TimeoutError:
        return None

# 2) Cancellation propagation — Tasks get CancelledError; clean up in finally
async def worker(q):
    try:
        while True:
            item = await q.get()
            await process(item)
    except asyncio.CancelledError:
        # cleanup BEFORE the task ends; re-raise to confirm cancellation
        await close_resource()
        raise

# 3) Shield — protect a critical section from outer cancellation
async def critical(work):
    try:
        return await asyncio.shield(work)          # outer cancel won't cancel work
    except asyncio.CancelledError:
        # we were cancelled but 'work' may still complete in the background
        raise

# 4) Structured concurrency with TaskGroup (3.11+): if ANY child fails,
#    siblings are cancelled and ALL exceptions surface as ExceptionGroup.
async def parallel_fetch(urls):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(u)) for u in urls]
    return [t.result() for t in tasks]              # safe: TaskGroup ensures all are done

# 5) wait_for is the older single-coro version of timeout
async def fetch_one(url):
    try:
        return await asyncio.wait_for(fetch(url), timeout=2.0)
    except TimeoutError:
        return None

# Decision rule:
#   one await with a deadline                -> asyncio.timeout(seconds): ...
#   N concurrent awaits, fail-fast             -> async with TaskGroup() (3.11+)
#   N concurrent awaits, tolerate failures     -> asyncio.gather(..., return_exceptions=True)
#   long-lived background worker                -> create_task; handle CancelledError
#   "I don't want this cancelled if my caller is" -> asyncio.shield(coro)
#   wait for FIRST result of N options          -> asyncio.wait(..., return_when=FIRST_COMPLETED)
#
# Anti-pattern: try/except Exception that swallows CancelledError
#   Once CancelledError is suppressed, your task ignores cancellation and the
#   shutdown hangs. Either re-raise it explicitly or catch it as its own clause:
#       except asyncio.CancelledError: cleanup(); raise

async def long_operation(): return 1
async def fetch(_): await asyncio.sleep(0); return {}
async def process(_): pass
async def close_resource(): pass
```

## Decision Rule

```text
one await with a deadline                -> asyncio.timeout(seconds): ...
N concurrent awaits, fail-fast             -> async with TaskGroup() (3.11+)
N concurrent awaits, tolerate failures     -> asyncio.gather(..., return_exceptions=True)
long-lived background worker                -> create_task; handle CancelledError
"I don't want this cancelled if my caller is" -> asyncio.shield(coro)
wait for FIRST result of N options          -> asyncio.wait(..., return_when=FIRST_COMPLETED)
```

## Anti-Pattern

> [!warning] Anti-pattern
> try/except Exception that swallows CancelledError
>   Once CancelledError is suppressed, your task ignores cancellation and the
>   shutdown hangs. Either re-raise it explicitly or catch it as its own clause:
>       except asyncio.CancelledError: cleanup(); raise

## Tips

- `await` can only be used inside `async def` — using it in a regular function is a SyntaxError
- Two sequential `await` calls run one after the other — use `asyncio.gather()` for concurrency
- `asyncio.create_task()` schedules a coroutine to run concurrently without awaiting immediately
- `await asyncio.sleep(0)` yields control to the event loop without sleeping — useful in tight loops
- On Python 3.11+ prefer `async with asyncio.TaskGroup()` for fail-fast structured concurrency; pair with `async with asyncio.timeout(...)` to bound the whole batch
- When you must NOT propagate the caller's cancellation, wrap the inner coro in `asyncio.shield()`; never `except Exception` swallow `CancelledError` — re-raise after cleanup

## Common Mistake

> [!warning] Writing two sequential awaits expecting concurrency: `r1 = await fn1(); r2 = await fn2()`. This is sequential. Use `r1, r2 = await asyncio.gather(fn1(), fn2())`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import asyncio
async def main():
# await a coroutine:
result = await fetch("https://api.example.com")
```

**Senior:**
```python
)
```

## See Also

- [[Sections/apis/async/async-def|async def (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-gather|asyncio.gather() (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-queue|asyncio.Queue() (APIs & Frameworks)]]
- [[Sections/apis/async/thread-pool|ThreadPoolExecutor (APIs & Frameworks)]]
- [[Sections/apis/async/_Index|APIs & Frameworks → Async & Concurrency]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

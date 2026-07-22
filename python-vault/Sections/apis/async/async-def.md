---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "async-def"
title: "async def"
category: "Async"
subtitle: "Calling async def returns a coroutine — it does not execute until awaited"
signature_short: "async def fn() -> type: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "async def"
  - "async-def"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# async def

> Calling async def returns a coroutine — it does not execute until awaited

## Overview

async def creates a coroutine function. Calling it returns a coroutine object — the body does not execute until the coroutine is awaited or scheduled. Use asyncio.run() to enter the event loop from synchronous code.

## Signature

```python
async def fn() -> type: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Define an async function, run it with asyncio.run
# STRENGTHS - Smallest valid sync->async entry point
# WEAKNESSES- No await inside; doesn't show actual concurrency
#
import asyncio

async def hello(name: str) -> str:
    return f"hello, {name}"

print(asyncio.run(hello("Alice")))            # asyncio.run starts the event loop
# IMPORTANT: hello("Alice") alone returns a COROUTINE — it doesn't run until awaited.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - async functions with awaits, async context managers, async generators
# STRENGTHS - The three async constructs you'll meet in real code
# WEAKNESSES- No discussion of where the event loop comes from in frameworks
#
import asyncio
import httpx

# 1) Async function — uses await inside
async def fetch(url: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:        # async ctx manager
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

# 2) Async generator — yields values across awaits
async def paginate(base: str):
    page = 1
    while True:
        items = await fetch(f"{base}?page={page}")
        if not items:
            return                              # generator stops here
        for item in items:
            yield item                          # consumer can use 'async for'
        page += 1

async def main():
    async for it in paginate("https://api.example.com/items"):
        print(it["id"])

asyncio.run(main())                             # ONE call to run() at the top
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Where the loop lives, how to bridge sync<->async, sync vs CPU-bound work
# STRENGTHS - The mental model that prevents "RuntimeError: event loop is running"
# WEAKNESSES- N/A
#
import asyncio
import time

# 1) FRAMEWORKS already run a loop. NEVER call asyncio.run() inside FastAPI / Jupyter.
#    Inside a handler:  result = await my_coro()
#    Top of a script:   asyncio.run(main())

# 2) Bridge from SYNC into async — use asyncio.run() at the boundary
def sync_caller():
    return asyncio.run(my_async_function())

# 3) Bridge from ASYNC into a BLOCKING function — run_in_executor, never call directly
def blocking_io():
    time.sleep(2)                                # blocks the entire event loop if awaited!
    return 42

async def call_blocking():
    loop = asyncio.get_running_loop()
    # to_thread (3.9+) is the modern, no-executor-passing form
    return await asyncio.to_thread(blocking_io)

# 4) Bridge from ASYNC into a CPU-bound function — process pool, NOT thread pool
import concurrent.futures
async def heavy_cpu(x):
    loop = asyncio.get_running_loop()
    with concurrent.futures.ProcessPoolExecutor() as pool:
        return await loop.run_in_executor(pool, _crunch, x)

def _crunch(x): return sum(i*i for i in range(x))

# 5) Async iteration shapes
async def main():
    # async for — async generator / async iterator
    async for v in paginate(...):
        process(v)
    # async with — async context manager (DB session, HTTP client, lock)
    # awaitable expressions in comprehensions:
    results = [await fetch(u) for u in urls]    # SEQUENTIAL — usually wrong
    # for concurrency, use asyncio.gather (next entry)

# Decision rule:
#   pure compute, no I/O                       -> NO async; run sync (or process pool)
#   I/O-bound (HTTP, DB, file)                 -> async/await all the way down
#   stuck calling a blocking lib in async       -> asyncio.to_thread(fn, *args)
#   stuck in CPU-heavy work in async            -> ProcessPoolExecutor + run_in_executor
#   running in Jupyter / FastAPI                 -> NEVER asyncio.run; just await
#   testing async code                            -> pytest-asyncio (asyncio_mode='auto')
#
# Anti-pattern: making EVERYTHING async because "async is faster"
#   Async is ONLY faster for I/O-bound, CONCURRENT work. Synchronous code is
#   simpler, faster for pure compute, and easier to debug. Convert when you
#   need concurrency, not because the keyword exists.

async def my_async_function(): return 1
async def paginate(*_): yield 1
def process(x): pass
urls = []
async def fetch(_): return {}
```

## Decision Rule

```text
pure compute, no I/O                       -> NO async; run sync (or process pool)
I/O-bound (HTTP, DB, file)                 -> async/await all the way down
stuck calling a blocking lib in async       -> asyncio.to_thread(fn, *args)
stuck in CPU-heavy work in async            -> ProcessPoolExecutor + run_in_executor
running in Jupyter / FastAPI                 -> NEVER asyncio.run; just await
testing async code                            -> pytest-asyncio (asyncio_mode='auto')
```

## Anti-Pattern

> [!warning] Anti-pattern
> making EVERYTHING async because "async is faster"
>   Async is ONLY faster for I/O-bound, CONCURRENT work. Synchronous code is
>   simpler, faster for pure compute, and easier to debug. Convert when you
>   need concurrency, not because the keyword exists.

## Tips

- `async def` creates a coroutine function — calling it returns a coroutine object, not the result
- Use `asyncio.run()` once at the top level to enter the event loop from sync code
- Never call `asyncio.run()` inside an already-running event loop — use `await` directly instead
- async/await only helps I/O-bound work — CPU-bound tasks still block the event loop
- Stuck calling a blocking lib in an async function? Wrap with `await asyncio.to_thread(fn, *args)` (or `loop.run_in_executor`) so the event loop keeps moving
- CPU-heavy work in async: `loop.run_in_executor(ProcessPoolExecutor(), fn, ...)` — threads are GIL-locked

## Common Mistake

> [!warning] Calling `asyncio.run()` inside an already-running event loop (Jupyter, FastAPI). Use `await coroutine` directly in those contexts, or `asyncio.create_task()` to schedule it.

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

- [[Sections/apis/async/await|await (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-gather|asyncio.gather() (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-queue|asyncio.Queue() (APIs & Frameworks)]]
- [[Sections/apis/async/thread-pool|ThreadPoolExecutor (APIs & Frameworks)]]
- [[Sections/apis/async/_Index|APIs & Frameworks → Async & Concurrency]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

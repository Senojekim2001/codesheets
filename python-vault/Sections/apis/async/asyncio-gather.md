---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "asyncio-gather"
title: "asyncio.gather()"
category: "Async"
subtitle: "Concurrent I/O — all coroutines run simultaneously"
signature_short: "results = await asyncio.gather(*coroutines, return_exceptions=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio.gather()"
  - "asyncio-gather"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# asyncio.gather()

> Concurrent I/O — all coroutines run simultaneously

## Overview

asyncio.gather() runs all given coroutines concurrently and returns their results in order. return_exceptions=True prevents one failure from cancelling everything — exceptions are returned as values instead of being raised.

## Signature

```python
results = await asyncio.gather(*coroutines, return_exceptions=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - asyncio.gather to run a few coroutines concurrently
# STRENGTHS - The one call that gives you concurrent I/O
# WEAKNESSES- No error handling; no cancellation
#
import asyncio

async def task(name, ms):
    await asyncio.sleep(ms / 1000)
    return name

async def main():
    return await asyncio.gather(task("a", 100), task("b", 200), task("c", 50))

print(asyncio.run(main()))                          # ['a', 'b', 'c'] — order preserved
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - return_exceptions for partial failures, semaphore for rate limiting
# STRENGTHS - The shape that handles real APIs (some succeed, some don't)
# WEAKNESSES- Doesn't show TaskGroup yet
#
import asyncio
import httpx

async def fetch(client, url):
    r = await client.get(url, timeout=10)
    r.raise_for_status()
    return r.json()

# 1) return_exceptions=True — keep what worked, mark what didn't
async def fetch_all(urls):
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            *(fetch(client, u) for u in urls),
            return_exceptions=True,                  # NO single failure aborts the rest
        )
    return [r if not isinstance(r, Exception) else None for r in results]

# 2) Semaphore — bound concurrency so you don't get rate-limited
async def fetch_with_limit(urls, *, concurrency: int = 10):
    sem = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient() as client:
        async def bounded(u):
            async with sem:
                return await fetch(client, u)
        return await asyncio.gather(*(bounded(u) for u in urls))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - TaskGroup (structured concurrency), as_completed for streaming, wait variants
# STRENGTHS - The 3.11+ shapes that replace most gather() uses
# WEAKNESSES- N/A
#
import asyncio

# 1) TaskGroup (3.11+) — STRUCTURED CONCURRENCY
#    - if ONE task fails, siblings are cancelled
#    - all exceptions surface together as ExceptionGroup
#    - context exits only when every task is done
async def parallel_fetch(urls):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(u)) for u in urls]
    return [t.result() for t in tasks]

# Catch the group of errors with the new except* syntax
async def safe_parallel(urls):
    try:
        return await parallel_fetch(urls)
    except* httpx.HTTPError as eg:
        for e in eg.exceptions: log_error(e)
        return []

# 2) as_completed — handle results as they arrive (start downstream work earlier)
async def stream_first_n(urls, n):
    out = []
    coros = [fetch(u) for u in urls]
    for done in asyncio.as_completed(coros):
        out.append(await done)
        if len(out) >= n:
            break                                    # remaining tasks keep running
    return out

# 3) asyncio.wait — finer-grained: FIRST_COMPLETED, ALL_COMPLETED, FIRST_EXCEPTION
async def race(urls):
    tasks = {asyncio.create_task(fetch(u)): u for u in urls}
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for t in pending:
        t.cancel()                                   # cancel the losers
    return done.pop().result()

# 4) Combine semaphore with TaskGroup — bounded concurrency AND structured cleanup
async def fetch_bounded(urls, concurrency=10):
    sem = asyncio.Semaphore(concurrency)
    async def one(u):
        async with sem:
            return await fetch(u)
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(one(u)) for u in urls]
    return [t.result() for t in tasks]

# Decision rule:
#   N coros, all-or-nothing semantics       -> TaskGroup (3.11+); except* on errors
#   N coros, partial failure tolerated       -> asyncio.gather(..., return_exceptions=True)
#   need to react as results arrive          -> asyncio.as_completed
#   "first one wins, cancel the rest"        -> asyncio.wait(return_when=FIRST_COMPLETED)
#   bounded concurrency                       -> asyncio.Semaphore wrapping each call
#   timeout the whole batch                   -> async with asyncio.timeout(...): TaskGroup
#
# Anti-pattern: gather(coros) instead of gather(*coros)
#   gather expects POSITIONAL args. Passing one list silently runs nothing —
#   the coros are never awaited and you get RuntimeWarnings. Always *unpack.

import httpx
async def fetch(_): return {}
def log_error(_): pass
```

## Decision Rule

```text
N coros, all-or-nothing semantics       -> TaskGroup (3.11+); except* on errors
N coros, partial failure tolerated       -> asyncio.gather(..., return_exceptions=True)
need to react as results arrive          -> asyncio.as_completed
"first one wins, cancel the rest"        -> asyncio.wait(return_when=FIRST_COMPLETED)
bounded concurrency                       -> asyncio.Semaphore wrapping each call
timeout the whole batch                   -> async with asyncio.timeout(...): TaskGroup
```

## Anti-Pattern

> [!warning] Anti-pattern
> gather(coros) instead of gather(*coros)
>   gather expects POSITIONAL args. Passing one list silently runs nothing —
>   the coros are never awaited and you get RuntimeWarnings. Always *unpack.

## Tips

- `return_exceptions=True` makes gather never raise — exceptions come back as return values
- `asyncio.Semaphore(n)` rate-limits concurrent requests — prevents overwhelming an API
- `TaskGroup` (3.11+) cancels all sibling tasks on first failure — structured concurrency
- Create all tasks first as a list, then pass to gather — do not `await` each one sequentially

## Common Mistake

> [!warning] Passing a list to `asyncio.gather` without unpacking: `await asyncio.gather([coro1, coro2])` treats the list as a single arg and raises `TypeError`. Either unpack with `*` (`asyncio.gather(*coros)`) or pass coroutines positionally (`asyncio.gather(coro1, coro2)`).

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

- [[Sections/apis/async/async-def|async def (APIs & Frameworks)]]
- [[Sections/apis/async/await|await (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-queue|asyncio.Queue() (APIs & Frameworks)]]
- [[Sections/apis/async/thread-pool|ThreadPoolExecutor (APIs & Frameworks)]]
- [[Sections/apis/async/_Index|APIs & Frameworks → Async & Concurrency]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

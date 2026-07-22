---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio"
id: "asyncio-patterns"
title: "asyncio Patterns — Semaphores, Queues & Streaming"
category: "asyncio"
subtitle: "asyncio.Semaphore, asyncio.Queue, async generators"
signature_short: "async with semaphore: ...  |  await queue.put(item)  |  async for item in stream():"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio Patterns — Semaphores, Queues & Streaming"
  - "asyncio-patterns"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio"
  - "category/asyncio"
  - "tier/tiered"
---

# asyncio Patterns — Semaphores, Queues & Streaming

> asyncio.Semaphore, asyncio.Queue, async generators

## Overview

Advanced asyncio patterns for production use. Semaphores limit concurrent operations (e.g., max 10 simultaneous HTTP connections). Queues implement producer-consumer patterns (crawlers, pipelines). Async generators (async def + yield) produce streaming data. TaskGroups (Python 3.11+) provide structured concurrency with proper error handling and cancellation.

## Signature

```python
async with semaphore: ...  |  await queue.put(item)  |  async for item in stream():
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Semaphore caps concurrency to N inflight at once
# STRENGTHS - Smallest valid rate limit
# WEAKNESSES- No queue, no streaming
#
import asyncio

sem = asyncio.Semaphore(3)                        # at most 3 in flight

async def bounded(i):
    async with sem:                               # waits until a slot is free
        await asyncio.sleep(0.1)
        return i

async def main():
    return await asyncio.gather(*(bounded(i) for i in range(10)))

print(asyncio.run(main()))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Producer/consumer with Queue + maxsize backpressure + sentinel shutdown
# STRENGTHS - The classic crawler/worker shape
# WEAKNESSES- Sentinels work but q.join() (senior) is cleaner
#
import asyncio

N = 5
SENTINEL = None

async def producer(q, items):
    for it in items:
        await q.put(it)                           # blocks if queue full -> backpressure
    for _ in range(N):
        await q.put(SENTINEL)                     # one sentinel per consumer

async def consumer(name, q):
    while True:
        it = await q.get()
        if it is SENTINEL:
            q.task_done()
            return
        try:
            await process(it)
        finally:
            q.task_done()

async def main():
    q = asyncio.Queue(maxsize=10)
    consumers = [asyncio.create_task(consumer(f"w{i}", q)) for i in range(N)]
    await producer(q, range(50))
    await q.join()
    await asyncio.gather(*consumers)

async def process(_): await asyncio.sleep(0.05)

asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Async generators for streaming, TaskGroup-bounded fan-out, job-queue retire pattern
# STRENGTHS - The patterns that scale to long-running async services
# WEAKNESSES- N/A
#
import asyncio

# 1) Async generator — stream items as they arrive (no list materialization)
async def paginate(base: str):
    page = 1
    while True:
        items = await fetch(f"{base}?page={page}")
        if not items:
            return
        for it in items:
            yield it                              # consumer can break early
        page += 1

# Use it
async def consume_pages():
    async for item in paginate("https://api.example.com/items"):
        await handle(item)

# 2) Bounded fan-out — Semaphore + TaskGroup for STRUCTURED concurrency
async def crawl(urls, *, concurrency: int = 10):
    sem = asyncio.Semaphore(concurrency)
    async def one(u):
        async with sem:
            return await fetch(u)
    async with asyncio.TaskGroup() as tg:        # 3.11+
        tasks = [tg.create_task(one(u)) for u in urls]
    return [t.result() for t in tasks]

# 3) Long-running job queue — workers retire on cancel, NOT on sentinels
async def run_workers(producer, n_workers=8):
    q = asyncio.Queue(maxsize=2 * n_workers)     # backpressure tied to worker count
    workers = [asyncio.create_task(_worker(q)) for _ in range(n_workers)]
    await producer(q)
    await q.join()                                # all task_done() received
    for w in workers: w.cancel()                  # tell idle workers to stop
    await asyncio.gather(*workers, return_exceptions=True)

async def _worker(q):
    try:
        while True:
            item = await q.get()
            try:
                await process(item)
            except Exception as e:
                log(e)                            # swallow per-item; one bad item != crash
            finally:
                q.task_done()
    except asyncio.CancelledError:
        return                                    # clean exit at shutdown

# Decision rule:
#   bound concurrency to N                  -> Semaphore(N) inside the async fn
#   N producers, M consumers, queue        -> Queue(maxsize=) for backpressure
#   results need order                       -> gather (results in submit order)
#   N items, all-or-nothing semantics       -> TaskGroup + create_task
#   stream of pages / events                  -> async generator, async for
#   shutdown a long-lived pool                 -> q.join() + cancel workers
#
# Anti-pattern: starting 10_000 tasks with no Semaphore
#   Hits OS file-descriptor limits, gets rate-limited, blows up the upstream.
#   Always cap with Semaphore (or TaskGroup with N parallel workers).

async def fetch(_): await asyncio.sleep(0); return []
async def handle(_): pass
async def process(_): pass
def log(_): pass
```

## Decision Rule

```text
bound concurrency to N                  -> Semaphore(N) inside the async fn
N producers, M consumers, queue        -> Queue(maxsize=) for backpressure
results need order                       -> gather (results in submit order)
N items, all-or-nothing semantics       -> TaskGroup + create_task
stream of pages / events                  -> async generator, async for
shutdown a long-lived pool                 -> q.join() + cancel workers
```

## Anti-Pattern

> [!warning] Anti-pattern
> starting 10_000 tasks with no Semaphore
>   Hits OS file-descriptor limits, gets rate-limited, blows up the upstream.
>   Always cap with Semaphore (or TaskGroup with N parallel workers).

## Tips

- Semaphore(10) prevents overloading APIs — 1000 URLs, but only 10 concurrent requests at any time.
- TaskGroup (3.11+) is safer than gather — if one task fails, all others are cancelled and the error propagates. Combine with a Semaphore for bounded fan-out.
- asyncio.to_thread() wraps blocking code (old libraries, file I/O) for use in async code without blocking the loop.
- Queue with maxsize creates backpressure — producers slow down when consumers can't keep up. For long-lived worker pools, prefer `await q.join()` followed by `worker.cancel()` over per-worker sentinels — workers retire on cancel and shutdown is cleaner. For paginated/streaming sources, write an async generator and `async for` it so the consumer can break early.

## Common Mistake

> [!warning] Starting thousands of tasks with no Semaphore — hits OS file-descriptor limits, gets rate-limited, blows up the upstream. Always cap with Semaphore (or a TaskGroup with N parallel workers).

## Shorthand (Junior → Senior)

**Junior:**
```python
semaphore = Semaphore(10)
async def limited_fetch(url):
    semaphore.acquire()
    try:
        return await fetch_url(url)
    finally:
        semaphore.release()
```

**Senior:**
```python
semaphore = Semaphore(10)
async def limited_fetch(url):
    async with semaphore:
        return await fetch_url(url)
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/_Index|Concurrency & Parallelism → asyncio — Asynchronous I/O]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

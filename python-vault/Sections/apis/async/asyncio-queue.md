---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "asyncio-queue"
title: "asyncio.Queue()"
category: "Async"
subtitle: "Decouple producers from consumers in async workflows"
signature_short: "q = asyncio.Queue(); await q.put(item); item = await q.get()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio.Queue()"
  - "asyncio-queue"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# asyncio.Queue()

> Decouple producers from consumers in async workflows

## Overview

asyncio.Queue provides an async-native FIFO queue for coordinating producers and consumers. put() adds items; get() waits for an item. task_done() signals a task is complete; join() waits for all items to be processed.

## Signature

```python
q = asyncio.Queue(); await q.put(item); item = await q.get()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - put on one side, get on the other
# STRENGTHS - Smallest valid producer/consumer use
# WEAKNESSES- No multiple consumers, no backpressure, no shutdown signal
#
import asyncio

async def main():
    q = asyncio.Queue()
    await q.put("a")
    await q.put("b")
    print(await q.get())                    # "a"
    print(await q.get())                    # "b"

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - One producer, N consumers, sentinel-based shutdown, maxsize backpressure
# STRENGTHS - The classic pattern with everything wired correctly
# WEAKNESSES- Sentinels work but get_nowait + join (senior tier) is cleaner
#
import asyncio

N_CONSUMERS = 3
SENTINEL    = None                          # signals "no more work"

async def producer(q: asyncio.Queue, items):
    for item in items:
        await q.put(item)                   # blocks if queue is full -> backpressure
    for _ in range(N_CONSUMERS):
        await q.put(SENTINEL)               # one sentinel per consumer

async def consumer(name, q: asyncio.Queue):
    while True:
        item = await q.get()
        if item is SENTINEL:
            q.task_done()
            return
        try:
            await process(item)
            print(f"{name} processed {item}")
        finally:
            q.task_done()                   # MUST call once per get(); pairs with q.join()

async def main():
    q = asyncio.Queue(maxsize=10)           # cap memory; producer pauses if full
    consumers = [asyncio.create_task(consumer(f"w{i}", q)) for i in range(N_CONSUMERS)]
    await producer(q, range(20))
    await q.join()                           # wait until ALL items processed
    await asyncio.gather(*consumers)         # consumers exited on sentinel

async def process(_): await asyncio.sleep(0.05)

asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - q.join() + cancel pattern, PriorityQueue, async pipelines, backpressure tuning
# STRENGTHS - The shapes that scale to real workers
# WEAKNESSES- N/A
#
import asyncio

# 1) NO sentinel — use q.join() to wait until done, then cancel consumers cleanly
async def main():
    q = asyncio.Queue(maxsize=100)
    workers = [asyncio.create_task(consumer(q, i)) for i in range(8)]
    for item in range(1000):
        await q.put(item)
    await q.join()                              # block until every task_done() called
    for w in workers:
        w.cancel()                              # tell workers to stop waiting on get()
    await asyncio.gather(*workers, return_exceptions=True)

async def consumer(q: asyncio.Queue, wid: int):
    try:
        while True:
            item = await q.get()
            try:
                await process(item)
            except Exception as e:
                log_error(wid, item, e)         # don't propagate; one bad item ≠ crash
            finally:
                q.task_done()                   # always — even on failure
    except asyncio.CancelledError:
        return                                  # clean exit when main cancels us

# 2) PriorityQueue — for SLA / urgency-driven pipelines
async def priority_demo():
    pq: asyncio.PriorityQueue = asyncio.PriorityQueue()
    await pq.put((10, "low"))                   # (priority, value) — lower = sooner
    await pq.put((1,  "urgent"))
    while not pq.empty():
        prio, item = await pq.get()
        print(prio, item)                       # 1 'urgent', then 10 'low'

# 3) Async pipeline — multiple queues form stages (each worker pool independent)
async def stage(q_in: asyncio.Queue, q_out: asyncio.Queue, fn):
    while True:
        item = await q_in.get()
        try:
            await q_out.put(await fn(item))
        finally:
            q_in.get_nowait                     # placeholder so flake doesn't whine
            q_in.task_done()

# 4) maxsize is your THROUGHPUT KNOB
#    - too low: producer waits, throughput tied to slowest consumer
#    - too high: memory / latency balloon, items sit in flight too long
#    Start small (e.g. 2 * num_consumers) and tune by p50 / p99 latency.

# Decision rule:
#   single producer / consumer                -> Queue() with sentinel
#   N consumers, finite work                   -> Queue(maxsize) + q.join() + cancel
#   urgency-ordered work                        -> PriorityQueue
#   strict order matters                         -> single consumer, OR sequence-numbered items
#   multi-stage pipeline                         -> chain queues; each stage = own pool
#   cross-process / multi-host                   -> NOT asyncio; use Redis Streams / Kafka / SQS
#
# Anti-pattern: forgetting q.task_done() in the failure path
#   q.join() never returns; the program hangs at shutdown waiting for unmatched
#   put()s. Use try/finally so task_done() runs even when process() raises.

async def process(_): await asyncio.sleep(0.01)
def log_error(*_): pass

asyncio.run(main())
```

## Decision Rule

```text
single producer / consumer                -> Queue() with sentinel
N consumers, finite work                   -> Queue(maxsize) + q.join() + cancel
urgency-ordered work                        -> PriorityQueue
strict order matters                         -> single consumer, OR sequence-numbered items
multi-stage pipeline                         -> chain queues; each stage = own pool
cross-process / multi-host                   -> NOT asyncio; use Redis Streams / Kafka / SQS
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting q.task_done() in the failure path
>   q.join() never returns; the program hangs at shutdown waiting for unmatched
>   put()s. Use try/finally so task_done() runs even when process() raises.

## Tips

- `maxsize=n` creates backpressure — producer will wait if the queue is full
- `task_done()` after each `get()` is needed to make `q.join()` work correctly
- Use `None` or a sentinel object to signal consumers to stop
- For CPU-bound work, use `multiprocessing.Queue` — asyncio.Queue is single-threaded

## Common Mistake

> [!warning] Forgetting `task_done()` when using `q.join()`. Without it, `join()` never returns — it waits for all `task_done()` calls to match the number of `put()` calls.

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
- [[Sections/apis/async/asyncio-gather|asyncio.gather() (APIs & Frameworks)]]
- [[Sections/apis/async/thread-pool|ThreadPoolExecutor (APIs & Frameworks)]]
- [[Sections/apis/async/_Index|APIs & Frameworks → Async & Concurrency]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

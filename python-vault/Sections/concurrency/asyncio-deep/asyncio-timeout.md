---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio-deep"
id: "asyncio-timeout"
title: "asyncio Timeouts & Cancellation"
category: "asyncio"
subtitle: "asyncio.wait_for(), asyncio.timeout(), asyncio.shield()"
signature_short: "await asyncio.wait_for(coro, timeout=5.0)  |  async with asyncio.timeout(5):"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio Timeouts & Cancellation"
  - "asyncio-timeout"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio-deep"
  - "category/asyncio"
  - "tier/tiered"
---

# asyncio Timeouts & Cancellation

> asyncio.wait_for(), asyncio.timeout(), asyncio.shield()

## Overview

wait_for() runs a coroutine with a timeout — raises TimeoutError if exceeded. timeout() (3.11+) is a context manager version. shield() protects a task from cancellation. Use for: implement deadlines, cancel slow operations, isolate critical tasks from parent cancellation.

## Signature

```python
await asyncio.wait_for(coro, timeout=5.0)  |  async with asyncio.timeout(5):
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - asyncio.wait_for to put a deadline on one coroutine
# STRENGTHS - Smallest valid timeout
# WEAKNESSES- No multi-await deadlines, no shielding
#
import asyncio

async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    try:
        return await asyncio.wait_for(slow(), timeout=2.0)
    except TimeoutError:
        return "too slow"

print(asyncio.run(main()))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - asyncio.timeout context (3.11+), CancelledError discipline
# STRENGTHS - The 80%-case shape: deadline + clean cleanup
# WEAKNESSES- No shielding; senior tier covers it
#
import asyncio

async def fetch(url):
    await asyncio.sleep(5)
    return url

async def with_deadline():
    try:
        # Applies to the WHOLE block — multiple awaits share one budget
        async with asyncio.timeout(2.0):              # 3.11+
            return await fetch("api.example.com")
    except TimeoutError:
        return None

# Cancellation cleanup — clean up in finally OR catch + RE-RAISE
async def worker(q):
    try:
        while True:
            item = await q.get()
            await process(item)
    except asyncio.CancelledError:
        await close_resource()                        # close handles / save partial progress
        raise                                          # MUST re-raise to confirm cancellation

async def process(_): pass
async def close_resource(): pass

print(asyncio.run(with_deadline()))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - shield, nested timeouts, TaskGroup-wide deadline, cancellation contract
# STRENGTHS - The patterns that survive real load and shutdowns
# WEAKNESSES- N/A
#
import asyncio

# 1) shield — protect a CRITICAL operation from outer cancellation
async def must_finish():
    await asyncio.sleep(3)
    return "saved"

async def outer():
    work = asyncio.shield(must_finish())              # outer cancel won't kill 'work'
    try:
        return await asyncio.wait_for(work, timeout=1.0)
    except TimeoutError:
        return await work                              # still running; just keep waiting

# 2) Nested timeouts — INNER deadline can be tighter than OUTER
async def nested():
    async with asyncio.timeout(5.0):                   # outer budget: 5s
        async with asyncio.timeout(1.0):               # inner: 1s only
            await flaky_call()                         # raises TimeoutError after 1s
        await cleanup()                                 # uses what's left of the outer 5s

# 3) TaskGroup + timeout — apply ONE deadline to a fan-out
async def fan_out_deadline(urls):
    async with asyncio.timeout(10.0):                  # whole batch budget
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(fetch(u)) for u in urls]
    return [t.result() for t in tasks]

# 4) Cancellation CONTRACT — never silently swallow CancelledError
async def good_worker():
    try:
        while True:
            await one_step()
    except asyncio.CancelledError:
        await flush_partial()                          # cleanup
        raise                                          # CONFIRM cancellation
    except Exception as e:
        log(e)                                          # other errors are NOT cancellation

# 5) wait_for vs timeout
#    wait_for(coro, timeout)  -> wraps a single coroutine; raises TimeoutError
#    asyncio.timeout(s)        -> wraps a BLOCK with multiple awaits; cleaner for chains
#    Both ultimately CANCEL the running task to enforce the deadline.

# Decision rule:
#   single coroutine deadline                  -> asyncio.wait_for(coro, t)
#   multi-step block, one budget                -> async with asyncio.timeout(t) (3.11+)
#   protect a critical op from outer cancel     -> asyncio.shield(coro)
#   batch fan-out with deadline                  -> TaskGroup nested in timeout()
#   cleanup on cancel                            -> try/except CancelledError, then RAISE
#   need to NEVER cancel a step                  -> shield + run it to completion
#
# Anti-pattern: swallowing CancelledError without re-raising
#   The task ignores cancellation; shutdown hangs; the runtime can't reclaim
#   resources. ALWAYS re-raise after your finally/cleanup runs.

async def fetch(_): await asyncio.sleep(0); return None
async def flaky_call(): await asyncio.sleep(2)
async def cleanup(): await asyncio.sleep(0)
async def one_step(): await asyncio.sleep(0)
async def flush_partial(): pass
def log(_): pass
```

## Decision Rule

```text
single coroutine deadline                  -> asyncio.wait_for(coro, t)
multi-step block, one budget                -> async with asyncio.timeout(t) (3.11+)
protect a critical op from outer cancel     -> asyncio.shield(coro)
batch fan-out with deadline                  -> TaskGroup nested in timeout()
cleanup on cancel                            -> try/except CancelledError, then RAISE
need to NEVER cancel a step                  -> shield + run it to completion
```

## Anti-Pattern

> [!warning] Anti-pattern
> swallowing CancelledError without re-raising
>   The task ignores cancellation; shutdown hangs; the runtime can't reclaim
>   resources. ALWAYS re-raise after your finally/cleanup runs.

## Tips

- wait_for(coro, t) wraps a SINGLE coroutine; `async with asyncio.timeout(s)` (3.11+) wraps a BLOCK with multiple awaits sharing one budget — cleaner for chains. Both ultimately CANCEL the running task to enforce the deadline.
- Always propagate CancelledError with raise — don't catch it without re-raising.
- shield() prevents cancellation but timeout can still fire — useful for critical work that MUST complete (save / commit). Pair with `await work` after the timeout to keep waiting on the shielded coroutine.
- Timeout from parent propagates to children — nested operations inherit deadline. Combine `async with asyncio.timeout(N)` around an `async with asyncio.TaskGroup()` to put one budget on a fan-out.

## Common Mistake

> [!warning] Catching CancelledError without re-raising — the task ignores cancellation, shutdown hangs, the runtime can't reclaim resources. Catch CancelledError, run cleanup in `finally`, then RE-RAISE so the runtime can stop the task.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = await asyncio.wait_for(operation(), timeout=5)
except asyncio.TimeoutError:
    print("Timeout")
```

**Senior:**
```python
async with asyncio.timeout(5):
    result = await operation()
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/_Index|Concurrency & Parallelism → asyncio Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

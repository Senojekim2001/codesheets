---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio-deep"
id: "asyncio-locks"
title: "asyncio Locks & Synchronization"
category: "asyncio"
subtitle: "asyncio.Lock(), asyncio.Semaphore(), asyncio.Event(), asyncio.Condition()"
signature_short: "async with asyncio.Lock(): ...  |  async with semaphore:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio Locks & Synchronization"
  - "asyncio-locks"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio-deep"
  - "category/asyncio"
  - "tier/tiered"
---

# asyncio Locks & Synchronization

> asyncio.Lock(), asyncio.Semaphore(), asyncio.Event(), asyncio.Condition()

## Overview

asyncio provides async-safe synchronization primitives. Lock ensures mutual exclusion (only one coroutine at a time). Semaphore limits concurrency (N coroutines at a time). Event signals all waiting coroutines. Condition combines mutex + signaling. Unlike threading locks, these never block the event loop — they yield control when waiting.

## Signature

```python
async with asyncio.Lock(): ...  |  async with semaphore:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - asyncio.Lock for mutual exclusion in async code
# STRENGTHS - The minimum: one lock, one critical section
# WEAKNESSES- No semaphore, no event
#
import asyncio

counter = 0
lock = asyncio.Lock()

async def bump():
    global counter
    for _ in range(1000):
        async with lock:                        # one coroutine in here at a time
            counter += 1

async def main():
    await asyncio.gather(bump(), bump())
    print(counter)                              # exactly 2000 (no races)

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Semaphore for concurrency cap, Event for signaling
# STRENGTHS - The two tools you'll reach for daily after Lock
# WEAKNESSES- No Condition / BoundedSemaphore yet
#
import asyncio

# 1) Semaphore — bound concurrency to N
sem = asyncio.Semaphore(3)

async def limited(i):
    async with sem:                             # at most 3 inflight
        await asyncio.sleep(0.5)
        return i

async def fan_out():
    return await asyncio.gather(*(limited(i) for i in range(10)))

# 2) Event — many-to-many signal: "ready, all of you can go"
ready = asyncio.Event()

async def waiter(name):
    await ready.wait()                          # blocks until ready.set()
    print(name, "go")

async def starter():
    await asyncio.sleep(0.2)
    ready.set()                                 # wakes ALL waiters at once

async def main():
    async with asyncio.TaskGroup() as tg:
        for n in ("a", "b", "c"):
            tg.create_task(waiter(n))
        tg.create_task(starter())

asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When you DON'T need a lock; Condition; BoundedSemaphore; mistakes-to-avoid
# STRENGTHS - The decision rules and the threading-vs-asyncio trap
# WEAKNESSES- N/A
#
import asyncio
from collections import deque

# 1) You often DON'T NEED a lock in asyncio. Coroutines run cooperatively;
#    code BETWEEN awaits is atomic from the loop's perspective.
counter = 0
async def bump_no_lock():
    global counter
    counter += 1                                 # SAFE: no await between read and write

async def bump_needs_lock():
    global counter
    val = counter                                # await -> any other coro can run
    await asyncio.sleep(0)
    counter = val + 1                            # NOW we need a lock; race exists

# 2) Condition — lock + "wait until predicate is true"
class WorkQueue:
    def __init__(self):
        self._items = deque()
        self._cond  = asyncio.Condition()

    async def put(self, x):
        async with self._cond:
            self._items.append(x)
            self._cond.notify(1)                 # wake ONE waiter

    async def get(self):
        async with self._cond:
            await self._cond.wait_for(lambda: bool(self._items))   # ALWAYS use wait_for
            return self._items.popleft()

# 3) BoundedSemaphore — defends against release() bugs (raises if over-released)
sem = asyncio.BoundedSemaphore(10)

# 4) ANTI-PATTERN: using threading.Lock in async code
#    threading.Lock blocks the entire event loop while waiting.
#    Always use asyncio.Lock for async code; threading.Lock only across threads.

# 5) Per-key locks — common for caches / API rate limits
class KeyedLocks:
    def __init__(self):
        self._locks: dict[str, asyncio.Lock] = {}
    def for_key(self, k: str) -> asyncio.Lock:
        return self._locks.setdefault(k, asyncio.Lock())

KEY_LOCKS = KeyedLocks()
async def get_or_compute(key, expensive):
    async with KEY_LOCKS.for_key(key):
        return await expensive(key)

# Decision rule:
#   no awaits in critical section          -> NO lock needed (coroutines are cooperative)
#   read-modify-write across awaits         -> asyncio.Lock
#   bound concurrency to N                  -> Semaphore(N) (or BoundedSemaphore for safety)
#   broadcast "ready"                        -> Event (set/clear)
#   wait until predicate                     -> Condition + wait_for(predicate)
#   per-resource exclusion (cache key, etc.) -> dict of asyncio.Locks
#   sync code that calls async               -> NEVER use asyncio.Lock there; use threading.Lock
#
# Anti-pattern: while not items: await condition.wait()
#   Without wait_for(), spurious wakeups (rare but real) can let the loop slip
#   past the predicate. Use cond.wait_for(predicate) — it loops for you.
```

## Decision Rule

```text
no awaits in critical section          -> NO lock needed (coroutines are cooperative)
read-modify-write across awaits         -> asyncio.Lock
bound concurrency to N                  -> Semaphore(N) (or BoundedSemaphore for safety)
broadcast "ready"                        -> Event (set/clear)
wait until predicate                     -> Condition + wait_for(predicate)
per-resource exclusion (cache key, etc.) -> dict of asyncio.Locks
sync code that calls async               -> NEVER use asyncio.Lock there; use threading.Lock
```

## Anti-Pattern

> [!warning] Anti-pattern
> while not items: await condition.wait()
>   Without wait_for(), spurious wakeups (rare but real) can let the loop slip
>   past the predicate. Use cond.wait_for(predicate) — it loops for you.

## Tips

- You often DON'T need a Lock in asyncio: code BETWEEN awaits is atomic from the loop's perspective. Reach for asyncio.Lock only when you have a read-modify-write that spans an `await`. Prefer `BoundedSemaphore` over `Semaphore` — it raises on over-release instead of silently breaking your bound.
- Semaphore(N) allows N concurrent operations — perfect for rate-limiting API calls. For per-resource exclusion (cache key, user id), keep a `dict[key, asyncio.Lock]` so unrelated keys don't block each other.
- asyncio.Event uses set() / clear() / wait() — set() releases ALL waiters; there is no notify(). asyncio.Condition is the one with notify() / notify_all() — and ALWAYS use `cond.wait_for(predicate)` (not bare `wait()`) so spurious wakeups don't slip past the condition.
- Condition is overkill if you only need mutual exclusion — use Lock for that.

## Common Mistake

> [!warning] Using `threading.Lock` in async code — it blocks the entire event loop while waiting (the loop can't schedule any other coroutine). Always use `asyncio.Lock` for async code; reserve `threading.Lock` for cross-thread coordination only. Also: bare `await cond.wait()` without `wait_for(predicate)` lets spurious wakeups pass the predicate.

## Shorthand (Junior → Senior)

**Junior:**
```python
lock = asyncio.Lock()
async with lock:
    counter += 1
```

**Senior:**
```python
async with asyncio.Lock():
    counter += 1
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/_Index|Concurrency & Parallelism → asyncio Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

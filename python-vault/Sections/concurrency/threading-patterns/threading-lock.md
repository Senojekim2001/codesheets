---
type: "entry"
domain: "python"
file: "concurrency"
section: "threading-patterns"
id: "threading-lock"
title: "threading Synchronization — Lock, Condition, Event, Semaphore"
category: "Threading"
subtitle: "threading.Lock(), RLock, Condition, Event, Semaphore"
signature_short: "lock = threading.Lock()  |  with lock: ...  |  event = threading.Event()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "threading Synchronization — Lock, Condition, Event, Semaphore"
  - "threading-lock"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/threading-patterns"
  - "category/threading"
  - "tier/tiered"
---

# threading Synchronization — Lock, Condition, Event, Semaphore

> threading.Lock(), RLock, Condition, Event, Semaphore

## Overview

threading.Lock ensures only one thread accesses critical section. RLock allows same thread to reacquire. Condition combines Lock + signaling (wait/notify). Event allows one thread to signal all others. Semaphore limits N concurrent threads. Use for: protecting shared state, coordinating threads, implementing producer-consumer.

## Signature

```python
lock = threading.Lock()  |  with lock: ...  |  event = threading.Event()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Lock guards a shared counter; no torn updates
# STRENGTHS - Smallest valid threading sync
# WEAKNESSES- No Event / Condition / Semaphore yet
#
import threading

counter = 0
lock = threading.Lock()

def bump():
    global counter
    for _ in range(100_000):
        with lock:                                   # ALWAYS use 'with'; auto-release
            counter += 1

threads = [threading.Thread(target=bump) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)                                       # exactly 400_000
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Event for shutdown, Semaphore for concurrency cap, Condition + wait_for
# STRENGTHS - The four primitives most threaded code actually needs
# WEAKNESSES- No Barrier; no Timer
#
import threading
from collections import deque

# 1) Event — broadcast 'go' or 'stop' to many threads
stop = threading.Event()
def worker():
    while not stop.is_set():
        do_step()
        stop.wait(timeout=1.0)                       # wakes early if stop.set()

# 2) Semaphore — bound concurrent threads
sem = threading.Semaphore(3)
def bounded():
    with sem:                                        # at most 3 inside at a time
        do_io()

# 3) Condition + wait_for — producer/consumer with predicate
cond = threading.Condition()
items: deque[int] = deque()

def producer():
    with cond:
        items.append(42)
        cond.notify(1)

def consumer():
    with cond:
        cond.wait_for(lambda: items)                 # wait UNTIL predicate is true
        return items.popleft()

def do_step(): pass
def do_io(): pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - threading.local, Barrier, queue.Queue beats hand-rolled locks
# STRENGTHS - The doctrine + tools that prevent thread bugs entirely
# WEAKNESSES- N/A
#
import threading
import queue

# 1) threading.local — per-thread "globals" without locks
ctx = threading.local()
def handle(req_id):
    ctx.request_id = req_id                          # invisible to other threads
    log_with_context()

def log_with_context():
    print("rid:", getattr(ctx, "request_id", "-"))

# 2) Barrier — synchronize phases across N threads
N = 4
barrier = threading.Barrier(N)
def phase_worker():
    setup()                                          # phase 1 in parallel
    barrier.wait()                                   # all N must arrive
    phase_two()                                      # phase 2 starts together

# 3) PREFER queue.Queue over hand-rolled Lock + list — it's Lock + Condition + size
q: queue.Queue[int] = queue.Queue(maxsize=100)

def producer():
    for x in range(1000):
        q.put(x)                                     # blocks if full -> backpressure
    for _ in range(N):
        q.put(None)                                  # one sentinel per consumer

def consumer():
    while True:
        item = q.get()
        try:
            if item is None: return
            handle_item(item)
        finally:
            q.task_done()

# 4) Lock-free designs — when you can structure work as message hand-off, only
#    ONE thread owns mutable state and you need NO locks at all.

# 5) Deadlock prevention rules — same as multiprocessing
#    - Always use 'with lock:' (never bare acquire/release)
#    - Acquire multiple locks in a CONSISTENT order across the codebase
#    - Use timeouts in production: lock.acquire(timeout=N)
#    - Hold locks for the SHORTEST possible window; never do I/O under a lock

# Decision rule:
#   shared mutable state                        -> Lock (RLock if recursive)
#   per-thread context (request id, db conn)    -> threading.local()
#   broadcast a one-shot signal                  -> Event
#   bound concurrency to N                        -> Semaphore(N)
#   wait until predicate                          -> Condition + wait_for(...)
#   producer / consumer queue                     -> queue.Queue (don't roll your own)
#   stage parallel pipeline                       -> Barrier(N)
#
# Anti-pattern: try/except that swallows exceptions inside a lock
#   The lock is released, the bug is invisible, and the next thread sees corrupt
#   state. Either fix the bug, or re-raise after cleanup; never silently eat it.

def setup(): pass
def phase_two(): pass
def handle_item(_): pass
```

## Decision Rule

```text
shared mutable state                        -> Lock (RLock if recursive)
per-thread context (request id, db conn)    -> threading.local()
broadcast a one-shot signal                  -> Event
bound concurrency to N                        -> Semaphore(N)
wait until predicate                          -> Condition + wait_for(...)
producer / consumer queue                     -> queue.Queue (don't roll your own)
stage parallel pipeline                       -> Barrier(N)
```

## Anti-Pattern

> [!warning] Anti-pattern
> try/except that swallows exceptions inside a lock
>   The lock is released, the bug is invisible, and the next thread sees corrupt
>   state. Either fix the bug, or re-raise after cleanup; never silently eat it.

## Tips

- Lock for protecting shared state, Condition for signaling, Event for one-shot signals. PREFER `queue.Queue` over hand-rolled Lock + list — it bundles Lock + Condition + maxsize backpressure for free.
- Always use context manager (with lock) — prevents forgetting to release and handles exceptions.
- Condition requires `cond.wait_for(predicate)` (not bare `wait()`) — `wait_for` loops internally so spurious wakeups can't slip past your predicate. Use `threading.local()` for per-thread context (request_id, db connection) — invisible to other threads, no locking needed.
- Semaphore(N) limits concurrent access — useful for rate limiting (max N requests at once). `Barrier(N)` synchronizes phases: all N threads must arrive before any proceeds.

## Common Mistake

> [!warning] Hand-rolling a Lock + list + Condition for a producer/consumer queue — `queue.Queue(maxsize=N)` gives you all of that, tested. Also: try/except that swallows exceptions inside a lock — the lock releases, the bug is invisible, and the next thread sees corrupt state. Re-raise after cleanup.

## Shorthand (Junior → Senior)

**Junior:**
```python
lock.acquire()
try:
    counter += 1
finally:
    lock.release()
```

**Senior:**
```python
with lock:
    counter += 1
```

## See Also

- [[Sections/concurrency/threading/threading-basics|threading — Concurrent I/O with Threads (Concurrency & Parallelism)]]
- [[Sections/concurrency/threading-patterns/_Index|Concurrency & Parallelism → Threading Patterns & Synchronization]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

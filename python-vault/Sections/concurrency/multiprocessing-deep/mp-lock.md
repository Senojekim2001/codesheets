---
type: "entry"
domain: "python"
file: "concurrency"
section: "multiprocessing-deep"
id: "mp-lock"
title: "multiprocessing Synchronization Primitives"
category: "Multiprocessing"
subtitle: "multiprocessing.Lock, RLock, Semaphore, process synchronization"
signature_short: "lock = Lock()  |  with lock: ...  |  semaphore = Semaphore(3)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "multiprocessing Synchronization Primitives"
  - "mp-lock"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/multiprocessing-deep"
  - "category/multiprocessing"
  - "tier/tiered"
---

# multiprocessing Synchronization Primitives

> multiprocessing.Lock, RLock, Semaphore, process synchronization

## Overview

Lock ensures mutual exclusion across processes. RLock (reentrant) allows same process to acquire multiple times. Semaphore limits concurrent processes. Condition combines lock + signaling. Always use context manager (with lock) to prevent deadlock.

## Signature

```python
lock = Lock()  |  with lock: ...  |  semaphore = Semaphore(3)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Lock guards a shared file across processes
# STRENGTHS - Smallest valid use of multiprocessing.Lock
# WEAKNESSES- No timeout, no Semaphore, no Condition
#
from multiprocessing import Lock, Process

def write_line(lock, msg):
    with lock:                                       # only one process at a time
        with open("log.txt", "a") as f:
            f.write(msg + "\n")

if __name__ == "__main__":
    lock = Lock()
    ps = [Process(target=write_line, args=(lock, f"hi {i}")) for i in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Lock with timeout, Semaphore for resource caps, RLock for re-entry
# STRENGTHS - The three primitives that handle most coordination
# WEAKNESSES- No Condition; no Barrier
#
from multiprocessing import Lock, RLock, Semaphore, Process

# 1) Lock.acquire(timeout=) — never block forever in production
def safe_section(lock):
    if lock.acquire(timeout=1.0):
        try:
            do_work()
        finally:
            lock.release()
    else:
        log("could not acquire lock in 1s — skipping")

# 2) Semaphore — N concurrent processes (e.g. only K downloads in flight)
sem = Semaphore(3)
def bounded(i):
    with sem:                                        # at most 3 inside this block
        do_io(i)

# 3) RLock — same process re-acquires; needed when method calls other locked method
rlock = RLock()
def outer():
    with rlock:
        inner()                                      # would deadlock with plain Lock
def inner():
    with rlock:
        do_step()

def do_work(): pass
def do_io(_): pass
def do_step(): pass
def log(_): pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Process-safe counters, Barrier, deadlock prevention rules, fork pitfalls
# STRENGTHS - The patterns + traps that distinguish working code from "works on my laptop"
# WEAKNESSES- N/A
#
from multiprocessing import Lock, Barrier, Process, Value

# 1) Lock IS NEEDED for shared Value updates — Value.value += 1 is not atomic
counter = Value("i", 0)
counter_lock = Lock()
def safe_bump():
    with counter_lock:
        counter.value += 1                           # read-modify-write inside the lock

# 2) Barrier — synchronize a known number of workers before proceeding
N = 4
barrier = Barrier(N)
def phase_worker(i):
    setup(i)                                          # phase 1 (parallel)
    barrier.wait()                                    # all N must arrive
    process_phase2(i)                                 # phase 2 starts together

if __name__ == "__main__":
    for i in range(N):
        Process(target=phase_worker, args=(i,)).start()

# 3) Deadlock prevention — the cardinal rules
#    a) Lock ORDER: if you ever take A then B, NEVER take B then A elsewhere.
#    b) Always use `with lock:`; manual acquire/release leaks on exception.
#    c) Use timeouts; design for "couldn't acquire" as a normal outcome.
#    d) Hold locks for the SHORTEST window possible; do I/O outside.

# 4) Fork + locks footgun (Linux default start method)
#    If a child is forked while a thread in the parent HOLDS a lock, the child
#    inherits a LOCKED lock that nobody will release -> deadlock at first use.
#    Mitigations:
#      - set_start_method("spawn") in production
#      - never fork from inside a thread that holds locks (e.g. logging handler)

# 5) Process-safe counters via the Manager are SLOW (IPC per increment)
#    For hot counters, use Value + Lock (or batch increments locally + Queue).

# Decision rule:
#   guard a critical section across procs    -> Lock (with timeout in production)
#   re-entrant from same process              -> RLock
#   bound concurrent processes to N           -> Semaphore(N)
#   stage a parallel pipeline                 -> Barrier(N)
#   need wait-for-condition                    -> Condition (lock + signal)
#   one-shot start signal                      -> Event
#   lock + Manager dict in hot loop            -> redesign — use Queue messages
#
# Anti-pattern: lock.acquire() with no timeout, no try/finally
#   First exception leaks the lock; every other process hangs. ALWAYS use
#   "with lock:" — it releases even if your code raises.

def setup(_): pass
def process_phase2(_): pass
```

## Decision Rule

```text
guard a critical section across procs    -> Lock (with timeout in production)
re-entrant from same process              -> RLock
bound concurrent processes to N           -> Semaphore(N)
stage a parallel pipeline                 -> Barrier(N)
need wait-for-condition                    -> Condition (lock + signal)
one-shot start signal                      -> Event
lock + Manager dict in hot loop            -> redesign — use Queue messages
```

## Anti-Pattern

> [!warning] Anti-pattern
> lock.acquire() with no timeout, no try/finally
>   First exception leaks the lock; every other process hangs. ALWAYS use
>   "with lock:" — it releases even if your code raises.

## Tips

- Lock.acquire(timeout=T) prevents indefinite blocking — use in production.
- Condition is for process coordination (signaling), Lock for exclusive access; `Barrier(N)` synchronizes a known number of workers before they all proceed to the next phase together.
- Semaphore(N) limits N concurrent processes — useful for resource pooling.
- Always use context manager (with lock) — prevents forgetting to release. Cardinal deadlock-prevention rules: (a) acquire multiple locks in a CONSISTENT order across the codebase, (b) hold locks for the SHORTEST window possible, never do I/O under a lock, (c) use timeouts and treat "couldn't acquire" as a normal outcome. On Linux the fork start method can deadlock if a child is forked while a thread holds a lock — pin `set_start_method("spawn")` in production.

## Common Mistake

> [!warning] `lock.acquire()` with no timeout and no try/finally — the first exception leaks the lock and every other process hangs. ALWAYS use `with lock:` (auto-releases on exception). Also: forking from inside a thread that holds a lock (e.g. logging handler) deadlocks the child at first use — `set_start_method("spawn")` avoids it.

## Shorthand (Junior → Senior)

**Junior:**
```python
lock.acquire()
try:
    # critical section
finally:
    lock.release()
```

**Senior:**
```python
with lock:
    # critical section
```

## See Also

- [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/_Index|Concurrency & Parallelism → Multiprocessing Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

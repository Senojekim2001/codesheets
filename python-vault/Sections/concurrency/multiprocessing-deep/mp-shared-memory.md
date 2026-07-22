---
type: "entry"
domain: "python"
file: "concurrency"
section: "multiprocessing-deep"
id: "mp-shared-memory"
title: "multiprocessing Shared State — Value, Array, Manager"
category: "Multiprocessing"
subtitle: "multiprocessing.Value, Array, Manager, shared state patterns"
signature_short: "val = Value(\"i\", 0)  |  arr = Array(\"d\", [1, 2, 3])  |  manager.list(), manager.dict()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "multiprocessing Shared State — Value, Array, Manager"
  - "mp-shared-memory"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/multiprocessing-deep"
  - "category/multiprocessing"
  - "tier/tiered"
---

# multiprocessing Shared State — Value, Array, Manager

> multiprocessing.Value, Array, Manager, shared state patterns

## Overview

Value wraps a single atomic value (int, float, char). Array is a shared numpy-like array. Manager creates a proxy server for complex types (list, dict, object). Avoid shared state when possible — it's error-prone. Prefer Queue/Pipe. If needed, always use locks to prevent race conditions.

## Signature

```python
val = Value("i", 0)  |  arr = Array("d", [1, 2, 3])  |  manager.list(), manager.dict()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Value('i', 0) for one shared int, Lock for safety
# STRENGTHS - The minimum: shared counter + the lock you MUST use
# WEAKNESSES- Tiny scope; doesn't show Manager / Array
#
from multiprocessing import Value, Lock, Process

def bump(counter, lock):
    for _ in range(1000):
        with lock:
            counter.value += 1                       # NOT atomic; needs the lock

if __name__ == "__main__":
    counter, lock = Value("i", 0), Lock()
    ps = [Process(target=bump, args=(counter, lock)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(counter.value)                              # exactly 4000
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Value, Array, Manager() for dict/list, Namespace for grouped state
# STRENGTHS - The four shared-state primitives and what each is for
# WEAKNESSES- No shared_memory (next entry / advanced)
#
from multiprocessing import Value, Array, Manager, Process, Lock

# 1) Value / Array — fast, ctypes-backed; lock built in (.get_lock())
counter = Value("i", 0)
floats  = Array("d", [1.0, 2.0, 3.0])

# 2) Manager — proxy server for COMPLEX types; slower but supports dict/list/Namespace
def fill(d, k, v): d[k] = v

if __name__ == "__main__":
    with Manager() as mgr:
        shared_dict = mgr.dict()
        shared_list = mgr.list()
        ns          = mgr.Namespace()
        ns.status   = "init"

        ps = [Process(target=fill, args=(shared_dict, k, v))
              for k, v in [("a", 1), ("b", 2), ("c", 3)]]
        for p in ps: p.start()
        for p in ps: p.join()

        print(dict(shared_dict))                      # {'a':1, 'b':2, 'c':3}
        print(ns.status)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - shared_memory for huge arrays, Manager cost truth, prefer-Queue heuristic
# STRENGTHS - The patterns that turn shared state from "scary" to "right tool"
# WEAKNESSES- N/A
#
from multiprocessing import Value, Array, Manager, shared_memory, Process, Lock
import numpy as np

# 1) shared_memory (3.8+) — zero-copy, no proxy server, no pickling per access
arr = np.arange(10_000_000, dtype=np.float64)
shm = shared_memory.SharedMemory(create=True, size=arr.nbytes)
np.ndarray(arr.shape, dtype=arr.dtype, buffer=shm.buf)[:] = arr

def worker(shm_name, shape, dtype, sl):
    s = shared_memory.SharedMemory(name=shm_name)
    a = np.ndarray(shape, dtype=dtype, buffer=s.buf)
    return a[sl].sum()                               # zero-copy READ

# 2) Manager has REAL cost — every attribute access is an IPC call to the server
#    For hot loops over a managed dict / list, performance falls off a cliff.
#    Use Manager for: low-frequency coordination, status, config, results dict.

# 3) Value's built-in lock is convenient but slower than an external Lock when
#    you do many tight increments — group with one Lock + a regular int instead.

# 4) Heuristic: PASS MESSAGES, don't share state.
#    Cleaner pattern: workers compute, Queue carries results, ONE process aggregates.
#    Reach for Value/Array/shared_memory only for hot, large, numeric data.

# 5) Cleanup is YOUR job — shared_memory leaks memory across runs if you forget
try:
    pass                                              # ... use shm ...
finally:
    shm.close()                                       # this process detaches
    shm.unlink()                                      # creator REMOVES the segment

# Decision rule:
#   one int counter / latch                  -> Value (with explicit Lock if hot)
#   small fixed-size numeric array            -> Array
#   shared dict / list / Namespace             -> Manager (low-frequency only)
#   huge numpy / image data, hot loop          -> shared_memory + np.ndarray
#   coordinating completion / status            -> Queue or Event, not shared dict
#   anything you can model as messages          -> Queue / Pipe; avoid shared state
#
# Anti-pattern: hot-path Manager().dict updates
#   Each m.dict[key] = value is a round-trip to the manager process; throughput
#   collapses. Aggregate locally in each worker, Queue.put() once at the end.
```

## Decision Rule

```text
one int counter / latch                  -> Value (with explicit Lock if hot)
small fixed-size numeric array            -> Array
shared dict / list / Namespace             -> Manager (low-frequency only)
huge numpy / image data, hot loop          -> shared_memory + np.ndarray
coordinating completion / status            -> Queue or Event, not shared dict
anything you can model as messages          -> Queue / Pipe; avoid shared state
```

## Anti-Pattern

> [!warning] Anti-pattern
> hot-path Manager().dict updates
>   Each m.dict[key] = value is a round-trip to the manager process; throughput
>   collapses. Aggregate locally in each worker, Queue.put() once at the end.

## Tips

- Avoid shared state — use Queue/Pipe instead. The default heuristic is PASS MESSAGES, don't share state: workers compute, Queue carries results, ONE process aggregates.
- Always protect shared state with Lock — `Value.value += 1` is NOT atomic. Race conditions are silent and subtle.
- Value is for single variables, Array for bulk data, Manager for complex types — but Manager has REAL cost: every attribute access is an IPC round-trip to the manager process. Reserve it for low-frequency coordination (status, config, results dict).
- For huge hot numeric data, use `shared_memory` (3.8+) + `np.ndarray(..., buffer=shm.buf)` for zero-copy access — and remember `shm.close()` (this process detaches) AND `shm.unlink()` (creator removes the segment) or you leak across runs.

## Common Mistake

> [!warning] Hot-path Manager().dict updates — each `m_dict[k] = v` is a round-trip to the manager process and throughput collapses. Aggregate locally in each worker, then `Queue.put()` once at the end. Also: shared state without a Lock corrupts data silently (Value.value += 1 is not atomic).

## Shorthand (Junior → Senior)

**Junior:**
```python
counter = Value('i', 0)
lock = Lock()
with lock:
    counter.value += 1
```

**Senior:**
```python
queue.put(1)
# Aggregate results via Queue
```

## See Also

- [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/_Index|Concurrency & Parallelism → Multiprocessing Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

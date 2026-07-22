---
type: "entry"
domain: "python"
file: "concurrency"
section: "multiprocessing-deep"
id: "mp-pool"
title: "multiprocessing.Pool — Process Pool API"
category: "Multiprocessing"
subtitle: "multiprocessing.Pool, .map(), .starmap(), .apply_async(), context manager"
signature_short: "with Pool(4) as pool: pool.map(fn, items)  |  pool.apply_async(fn, (args,))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "multiprocessing.Pool — Process Pool API"
  - "mp-pool"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/multiprocessing-deep"
  - "category/multiprocessing"
  - "tier/tiered"
---

# multiprocessing.Pool — Process Pool API

> multiprocessing.Pool, .map(), .starmap(), .apply_async(), context manager

## Overview

multiprocessing.Pool provides a high-level API for distributing work across processes. .map() is like Python's map but parallel. .apply_async() submits a single task and returns ApplyResult (non-blocking). .starmap() unpacks arguments. .imap_unordered() yields results as they finish (unordered). Pool initializes workers once, reducing startup cost. Always use context manager for proper cleanup.

## Signature

```python
with Pool(4) as pool: pool.map(fn, items)  |  pool.apply_async(fn, (args,))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Pool().map under a context manager
# STRENGTHS - Smallest valid parallel CPU work
# WEAKNESSES- No starmap, no imap_unordered, no error handling
#
from multiprocessing import Pool, cpu_count

def heavy(n): return sum(i * i for i in range(n))

if __name__ == "__main__":                          # required on Windows / spawn-style
    with Pool(cpu_count()) as pool:
        print(pool.map(heavy, [10**6] * 8))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - starmap, apply_async, imap_unordered + chunksize, initializer
# STRENGTHS - The four Pool calls that cover most workloads
# WEAKNESSES- No JoinableQueue / Pipe yet
#
from multiprocessing import Pool, cpu_count

def heavy(n): return sum(i * i for i in range(n))
def add(a, b): return a + b

# 1) starmap — unpack each tuple as args (no need for lambda x: f(*x))
with Pool() as p:
    print(p.starmap(add, [(1, 2), (3, 4), (5, 6)]))   # [3, 7, 11]

# 2) apply_async — submit ONE task, get a result object back
with Pool(4) as p:
    r = p.apply_async(heavy, (10**6,))
    print(r.get(timeout=10))

# 3) imap_unordered + chunksize — stream results as they finish
with Pool() as p:
    for v in p.imap_unordered(heavy, [10**5] * 100, chunksize=10):
        save(v)

# 4) initializer — per-process setup paid ONCE per worker
_model = None
def _init(path):
    global _model; _model = load_model(path)
def _predict(x):
    return _model.predict(x)

with Pool(initializer=_init, initargs=("models/v1.pkl",)) as p:
    preds = p.map(_predict, batches, chunksize=8)

def save(_): pass
def load_model(_): return None
batches = []
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Error contract, clean shutdown, picklability discipline, Pool vs ProcessPoolExecutor
# STRENGTHS - The patterns that prevent zombie workers and stuck pools
# WEAKNESSES- N/A
#
from multiprocessing import Pool, TimeoutError

def heavy(n):
    if n == 0:
        raise ValueError("n cannot be 0")
    return sum(i * i for i in range(n))

# 1) Error CONTRACT — workers raise; the parent must check
with Pool() as pool:
    async_r = pool.map_async(heavy, [10**5, 0, 10**6])
    try:
        values = async_r.get(timeout=10)             # re-raises the worker exception
    except ValueError as e:
        print("worker raised:", e)
    except TimeoutError:
        print("a task exceeded 10s")

# 2) Shutdown semantics
#    pool.close() -> stop accepting new tasks; existing finish
#    pool.join()  -> wait for in-flight to drain
#    pool.terminate() -> KILL workers (SIGTERM); pending results lost
#    Context manager calls close()+join() automatically — prefer it.

# 3) Picklability — top-level functions / dataclasses only
#    NOT picklable: lambdas, closures, locally-defined classes
#    Workaround: cloudpickle (via joblib / dask) when refactoring isn't an option

# 4) Pool vs ProcessPoolExecutor — pick by ergonomics, not capability
#    Pool                       -> .map / .imap_unordered / .apply_async, mature
#    ProcessPoolExecutor        -> Future-based, same shape as ThreadPoolExecutor
#    Both spawn the SAME workers; switch freely.

# 5) Start methods (multiprocessing.set_start_method)
#    fork  (Linux default)      -> fast; can deadlock with threads + locks held at fork
#    spawn (Windows/macOS def)  -> safer; slower; REQUIRES if __name__ == "__main__":
#    forkserver                 -> compromise: fast spawning of clean child processes
#    Pin one explicitly in production startup:
#      from multiprocessing import set_start_method
#      set_start_method("spawn", force=True)

# Decision rule:
#   pure-Python CPU, > 100 ms per task        -> Pool.map / Pool.imap_unordered
#   numeric heavy lifting (numpy/sklearn)      -> threads often beat processes
#   need a Future-style API                     -> ProcessPoolExecutor
#   want streaming results (any order)          -> imap_unordered + chunksize
#   per-worker heavy resource                   -> initializer + module global
#   long-running service                          -> set_start_method("spawn") for stability
#
# Anti-pattern: pool.terminate() in normal flow
#   Workers die mid-task; partial state on disk; resources leak. Reserve
#   terminate() for "the orchestrator is dying anyway"; otherwise close + join.
```

## Decision Rule

```text
pure-Python CPU, > 100 ms per task        -> Pool.map / Pool.imap_unordered
numeric heavy lifting (numpy/sklearn)      -> threads often beat processes
need a Future-style API                     -> ProcessPoolExecutor
want streaming results (any order)          -> imap_unordered + chunksize
per-worker heavy resource                   -> initializer + module global
long-running service                          -> set_start_method("spawn") for stability
```

## Anti-Pattern

> [!warning] Anti-pattern
> pool.terminate() in normal flow
>   Workers die mid-task; partial state on disk; resources leak. Reserve
>   terminate() for "the orchestrator is dying anyway"; otherwise close + join.

## Tips

- context manager (with Pool) handles cleanup automatically — always use it. `pool.close()` + `pool.join()` is the graceful path; reserve `pool.terminate()` for "the orchestrator is dying anyway" (workers die mid-task and partial state leaks).
- initializer runs once per worker — expensive setup (model loading) happens once, not per task.
- imap_unordered is faster than map when order doesn't matter — results as they arrive.
- chunksize affects performance — larger chunks reduce pickling overhead but use more memory. For long-running services pin the start method explicitly: `multiprocessing.set_start_method("spawn", force=True)` — fork is fast but can deadlock when forked while a thread holds locks (e.g. logging).

## Common Mistake

> [!warning] pool.terminate() in normal flow — workers die mid-task, partial state hits disk, resources leak. Use the context manager (close+join). Also: relying on the platform default start method — explicitly `set_start_method("spawn")` in production to avoid the fork+threads+locks deadlock footgun.

## Shorthand (Junior → Senior)

**Junior:**
```python
pool = Pool(4)
results = pool.map(fn, items)
pool.close()
pool.join()
```

**Senior:**
```python
with Pool(4) as pool:
    results = pool.map(fn, items)
```

## See Also

- [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/_Index|Concurrency & Parallelism → Multiprocessing Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

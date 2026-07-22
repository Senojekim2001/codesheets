---
type: "entry"
domain: "python"
file: "concurrency"
section: "concurrent-futures"
id: "processpool-executor"
title: "ProcessPoolExecutor — High-Level Process Pool for CPU Work"
category: "concurrent.futures"
subtitle: "ProcessPoolExecutor, CPU-bound work, max_workers, chunksize"
signature_short: "ProcessPoolExecutor(max_workers=4)  |  executor.map(fn, items, chunksize=10)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ProcessPoolExecutor — High-Level Process Pool for CPU Work"
  - "processpool-executor"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/concurrent-futures"
  - "category/concurrent-futures"
  - "tier/tiered"
---

# ProcessPoolExecutor — High-Level Process Pool for CPU Work

> ProcessPoolExecutor, CPU-bound work, max_workers, chunksize

## Overview

ProcessPoolExecutor is identical to ThreadPoolExecutor but uses separate processes instead of threads. Each process has its own Python interpreter and GIL — true parallel execution on multi-core CPUs. Data is serialized between processes (pickled), so keep payloads small. chunksize batches items for better performance on large datasets. Use for: data processing, ML inference, image manipulation, scientific computing. max_workers defaults to min(32, cpu_count() + 4).

## Signature

```python
ProcessPoolExecutor(max_workers=4)  |  executor.map(fn, items, chunksize=10)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ProcessPoolExecutor.map for parallel CPU work
# STRENGTHS - True parallelism on multiple cores; bypasses the GIL
# WEAKNESSES- No chunksize, no shared state
#
import os
from concurrent.futures import ProcessPoolExecutor

def heavy(n: int) -> int:                       # MUST be top-level (picklable)
    return sum(i * i for i in range(n))

with ProcessPoolExecutor(max_workers=os.cpu_count()) as ex:
    print(list(ex.map(heavy, [10**6] * 8)))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - chunksize for many small tasks, initializer for per-worker setup
# STRENGTHS - The two knobs that move throughput on real workloads
# WEAKNESSES- No shared memory; no error contract
#
import os
from concurrent.futures import ProcessPoolExecutor

def heavy(n): return sum(i * i for i in range(n))

# 1) chunksize — amortize IPC cost over many short tasks (huge win)
with ProcessPoolExecutor() as ex:
    out = list(ex.map(heavy, [50_000] * 1000, chunksize=50))

# 2) initializer — load big read-only state ONCE per worker
_model = None
def _init(model_path: str):
    global _model
    _model = load_model(model_path)

def _predict(x):                                 # uses module-global _model
    return _model.predict(x)

with ProcessPoolExecutor(
    max_workers=4, initializer=_init, initargs=("models/v1.pkl",),
) as ex:
    preds = list(ex.map(_predict, batches, chunksize=8))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Picklability rules, error contract, when NOT to use processes
# STRENGTHS - The decision rules that prevent costly process-pool detours
# WEAKNESSES- N/A
#
import os
from concurrent.futures import ProcessPoolExecutor, as_completed

# 1) Picklability — the #1 source of "Can't pickle" errors
#    OK: top-level functions, dataclasses, primitives, numpy arrays
#    NOT OK: lambdas, closures, locally-defined classes, open file handles
#    Workaround for closures: cloudpickle (via joblib / dask)

# 2) Error contract — workers crash; don't let the main process hang
def heavy(n):
    if n == 0: raise ValueError("bad input")
    return sum(i * i for i in range(n))

with ProcessPoolExecutor(max_workers=4) as ex:
    futs = {ex.submit(heavy, n): n for n in (10**5, 0, 10**6)}
    for f in as_completed(futs):
        n = futs[f]
        try:
            print(n, "->", f.result(timeout=30))
        except Exception as e:
            print(n, "failed:", type(e).__name__, e)

# 3) When to AVOID processes
#    - I/O-bound work                            -> threads or async
#    - tasks < ~1 ms                              -> sequential beats both; or batch them
#    - numpy / sklearn (release GIL)              -> threads OFTEN match processes
#    - cross-machine                               -> Dask / Ray, not local processes
#    - Windows + Jupyter                          -> spawn-only; "if __name__ == '__main__':" required

# 4) Process startup cost is REAL
#    First task in each worker: ~50-200 ms overhead.
#    Don't use processes for thousands of <1 ms tasks; batch into chunks.

# 5) max_workers ≈ os.cpu_count() for CPU-bound; oversubscription rarely helps.

# Decision rule:
#   pure-Python CPU work, > ~100 ms per task   -> ProcessPoolExecutor + chunksize
#   I/O-bound                                    -> ThreadPoolExecutor or asyncio
#   numpy / scientific libs                      -> ThreadPoolExecutor (releases GIL)
#   ML inference per request                      -> initializer to load model once per worker
#   need shared state                              -> initializer + module global; or shared_memory
#   distributed compute                            -> Dask / Ray
#
# Anti-pattern: ProcessPoolExecutor inside a request handler
#   Process startup blows the request budget. Pre-create one pool at startup
#   and submit work into it; don't construct a fresh pool per request.

def load_model(_): return None
batches = []
```

## Decision Rule

```text
pure-Python CPU work, > ~100 ms per task   -> ProcessPoolExecutor + chunksize
I/O-bound                                    -> ThreadPoolExecutor or asyncio
numpy / scientific libs                      -> ThreadPoolExecutor (releases GIL)
ML inference per request                      -> initializer to load model once per worker
need shared state                              -> initializer + module global; or shared_memory
distributed compute                            -> Dask / Ray
```

## Anti-Pattern

> [!warning] Anti-pattern
> ProcessPoolExecutor inside a request handler
>   Process startup blows the request budget. Pre-create one pool at startup
>   and submit work into it; don't construct a fresh pool per request.

## Tips

- ProcessPoolExecutor has identical API to ThreadPoolExecutor — swap them to test I/O vs CPU bottleneck.
- chunksize matters on large datasets — larger chunks reduce pickling overhead but use more memory. Process startup is ~50-200ms per worker; don't use processes for thousands of <1ms tasks (batch them).
- max_workers should equal cpu_count() for CPU-bound work — more workers = more context switching overhead. For numpy/sklearn (which release the GIL), threads OFTEN match processes with no IPC cost.
- Keep task payloads small — serialization to/from processes is expensive. Pass indices, not full data. Pre-create ONE pool at startup; ProcessPoolExecutor inside a request handler eats the per-request budget on worker startup. Workers must be top-level (no lambdas/closures); Windows + Jupyter use spawn-only and require `if __name__ == "__main__":`.

## Common Mistake

> [!warning] ProcessPoolExecutor inside a request handler — process startup blows the request budget. Pre-create one pool at startup and submit work into it; never construct a fresh pool per request. Also: I/O-bound work doesn't benefit from processes — threads or asyncio are lighter.

## Shorthand (Junior → Senior)

**Junior:**
```python
results = []
for n in numbers:
    result = cpu_task(n)
    results.append(result)
```

**Senior:**
```python
with ProcessPoolExecutor() as executor:
    results = list(executor.map(cpu_task, numbers))
```

## See Also

- [[Sections/concurrency/concurrent-futures/threadpool-executor|ThreadPoolExecutor — High-Level Thread Pool (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/futures-patterns|Futures Patterns — Wait, Timeout & Cancellation (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/_Index|Concurrency & Parallelism → concurrent.futures — Unified Executor API]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

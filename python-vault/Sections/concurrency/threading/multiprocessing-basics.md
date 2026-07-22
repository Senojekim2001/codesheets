---
type: "entry"
domain: "python"
file: "concurrency"
section: "threading"
id: "multiprocessing-basics"
title: "multiprocessing — True Parallelism for CPU Work"
category: "Multiprocessing"
subtitle: "ProcessPoolExecutor, Pool, shared memory, Manager"
signature_short: "ProcessPoolExecutor(max_workers=4)  |  Pool(4).map(fn, items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "multiprocessing — True Parallelism for CPU Work"
  - "multiprocessing-basics"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/threading"
  - "category/multiprocessing"
  - "tier/tiered"
---

# multiprocessing — True Parallelism for CPU Work

> ProcessPoolExecutor, Pool, shared memory, Manager

## Overview

multiprocessing creates separate Python processes, each with its own GIL — true parallelism on multi-core CPUs. ProcessPoolExecutor is the modern high-level API (same interface as ThreadPoolExecutor). Pool.map() distributes work across cores. Data is serialized (pickled) between processes — keep payloads small. shared_memory (3.8+) allows zero-copy sharing of large arrays. Use for: data processing, image manipulation, scientific computing, ML inference.

## Signature

```python
ProcessPoolExecutor(max_workers=4)  |  Pool(4).map(fn, items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ProcessPoolExecutor.map for parallel CPU work
# STRENGTHS - True parallelism on multiple cores; bypasses the GIL
# WEAKNESSES- No initializer, no chunking, no shared memory
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
# STRENGTHS - The two knobs that actually move throughput
# WEAKNESSES- No shared memory; no error contract
#
import os
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import Pool

def heavy(n): return sum(i * i for i in range(n))

# 1) chunksize — amortize IPC cost over many tasks (huge win for short jobs)
with ProcessPoolExecutor() as ex:
    out = list(ex.map(heavy, [50_000] * 1000, chunksize=50))

# 2) Pool initializer — load big read-only state ONCE per worker (model, lookup)
_model = None
def _init(model_path):
    global _model
    _model = load_model(model_path)             # paid once per process

def _predict(x):                                 # uses module-global _model
    return _model.predict(x)

with Pool(initializer=_init, initargs=("models/v1.pkl",)) as pool:
    preds = pool.map(_predict, batches)

# 3) imap_unordered — process results AS THEY ARRIVE (no waiting for slow ones)
with Pool() as pool:
    for result in pool.imap_unordered(heavy, [10**5] * 100, chunksize=10):
        save(result)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - shared_memory for huge arrays, picklability rules, when NOT to use processes
# STRENGTHS - The patterns that close the gap with native parallel libs
# WEAKNESSES- N/A
#
import os
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import shared_memory
import numpy as np

# 1) shared_memory — avoid pickling huge arrays per task (copy ONCE)
def make_shm(arr: np.ndarray):
    shm = shared_memory.SharedMemory(create=True, size=arr.nbytes)
    np.ndarray(arr.shape, dtype=arr.dtype, buffer=shm.buf)[:] = arr
    return shm

def worker(shm_name, shape, dtype, sl):
    shm = shared_memory.SharedMemory(name=shm_name)
    a = np.ndarray(shape, dtype=dtype, buffer=shm.buf)
    return a[sl].sum()                          # zero-copy READ

big = np.random.rand(10_000_000)
shm = make_shm(big)
try:
    chunks = [(shm.name, big.shape, big.dtype, slice(i, i + 1_000_000))
              for i in range(0, big.size, 1_000_000)]
    with ProcessPoolExecutor() as ex:
        partials = list(ex.map(_call, chunks))
    print(sum(partials))
finally:
    shm.close()
    shm.unlink()                                 # MUST unlink in the creator

def _call(args): return worker(*args)

# 2) Picklability — the #1 source of "Can't pickle" errors
#    Top-level functions / classes:  picklable
#    lambdas, closures, nested defs:  NOT picklable -> use cloudpickle (joblib/dask)
#    Open file handles, locks:        NOT picklable -> create them inside the worker

# 3) When to AVOID processes
#    - I/O-bound work                  -> use threads or async
#    - tasks < ~1 ms                    -> sequential beats both; or batch them
#    - NumPy vector ops on small arrays -> released GIL means threads suffice
#    - cross-machine                     -> Dask / Ray, not local processes

# Decision rule:
#   pure-Python CPU, > ~100 ms per task     -> ProcessPoolExecutor
#   numpy / sklearn (release GIL)            -> threads OFTEN beat processes
#   I/O-bound                                 -> threads or async
#   need shared state                          -> initializer + module global, OR shared_memory
#   need cross-host parallelism                -> Dask / Ray
#   thousands of tiny tasks                    -> chunksize=N to amortize IPC
#
# Anti-pattern: passing a 5 GB numpy array to ex.submit(fn, arr)
#   It's pickled and copied to the worker on every call. Use shared_memory or
#   memory-map the file inside the worker.

def load_model(_): return None
batches = []
def save(_): pass
```

## Decision Rule

```text
pure-Python CPU, > ~100 ms per task     -> ProcessPoolExecutor
numpy / sklearn (release GIL)            -> threads OFTEN beat processes
I/O-bound                                 -> threads or async
need shared state                          -> initializer + module global, OR shared_memory
need cross-host parallelism                -> Dask / Ray
thousands of tiny tasks                    -> chunksize=N to amortize IPC
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing a 5 GB numpy array to ex.submit(fn, arr)
>   It's pickled and copied to the worker on every call. Use shared_memory or
>   memory-map the file inside the worker.

## Tips

- ProcessPoolExecutor has the same API as ThreadPoolExecutor — swap them to switch between I/O and CPU concurrency.
- Use Pool initializer for expensive per-worker setup (model loading, DB connections) — called once per process.
- imap_unordered is faster than map when order doesn't matter — results come as they finish.
- shared_memory avoids pickling large arrays — processes read the same memory directly (zero copy). Workers MUST be top-level functions: lambdas, closures, and locally-defined classes are NOT picklable (use cloudpickle via joblib/dask if you can't refactor). On Windows / macOS spawn, always guard the entry point with `if __name__ == "__main__":` — without it the children re-import the module and re-launch themselves recursively.

## Common Mistake

> [!warning] Passing a 5GB numpy array to ex.submit(fn, arr) — it's pickled and copied to the worker on every call. Use `shared_memory` or memory-map the file inside the worker. Workers must be top-level functions (lambdas/closures aren't picklable). On Windows/macOS the script must be guarded by `if __name__ == "__main__":`.

## Shorthand (Junior → Senior)

**Junior:**
```python
results = []
for n in numbers:
    result = cpu_intensive(n)
    results.append(result)
```

**Senior:**
```python
with ProcessPoolExecutor(max_workers=cpu_count()) as executor:
    results = list(executor.map(cpu_intensive, numbers))
```

## See Also

- [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives (Concurrency & Parallelism)]]
- [[Sections/concurrency/threading/_Index|Concurrency & Parallelism → Threading & Multiprocessing]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

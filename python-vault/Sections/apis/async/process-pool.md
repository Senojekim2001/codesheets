---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "process-pool"
title: "ProcessPoolExecutor"
category: "Async"
subtitle: "True parallelism for CPU-bound work — bypasses the GIL"
signature_short: "with ProcessPoolExecutor(max_workers=4) as ex: results = ex.map(fn, items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ProcessPoolExecutor"
  - "process-pool"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# ProcessPoolExecutor

> True parallelism for CPU-bound work — bypasses the GIL

## Overview

ProcessPoolExecutor runs functions in separate processes — each has its own Python interpreter and memory. This bypasses the GIL, enabling true parallelism for CPU-bound work. Objects must be picklable to be passed between processes.

## Signature

```python
with ProcessPoolExecutor(max_workers=4) as ex: results = ex.map(fn, items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ProcessPoolExecutor.map for parallel CPU work
# STRENGTHS - True parallelism on multiple cores; bypasses the GIL
# WEAKNESSES- No chunking, no submit/as_completed
#
import os
from concurrent.futures import ProcessPoolExecutor

def square(n: int) -> int:                  # MUST be a top-level (picklable) function
    return n * n

with ProcessPoolExecutor(max_workers=os.cpu_count()) as ex:
    out = list(ex.map(square, range(20)))
print(out)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - submit + as_completed, chunksize for many small tasks, picklability rule
# STRENGTHS - The shape that handles real work and shows progress
# WEAKNESSES- No shared state; senior tier covers it
#
import os
from concurrent.futures import ProcessPoolExecutor, as_completed

def heavy(n: int) -> int:                   # top-level function — REQUIRED for pickling
    return sum(i * i for i in range(n))

# 1) Chunked map — for many small tasks, chunksize amortizes IPC overhead
with ProcessPoolExecutor() as ex:
    out = list(ex.map(heavy, [50_000] * 1000, chunksize=50))

# 2) submit + as_completed for streaming results
with ProcessPoolExecutor(max_workers=os.cpu_count()) as ex:
    futures = {ex.submit(heavy, n): n for n in (10**5, 10**6, 10**7)}
    for fut in as_completed(futures):
        n = futures[fut]
        try:
            print(n, "->", fut.result())
        except Exception as e:
            print(n, "failed:", e)

# Picklability rules (the #1 source of ProcessPoolExecutor errors):
# - lambdas: NOT picklable
# - closures over local state: NOT picklable
# - methods on local classes: NOT picklable
# - top-level functions, primitives, dataclasses: PICKLABLE
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Initializer for per-worker setup, shared memory, when NOT to use processes
# STRENGTHS - The patterns that turn process pools into a real compute platform
# WEAKNESSES- N/A
#
import os
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import shared_memory
import numpy as np

# 1) initializer — load big read-only state ONCE per worker (model, lookup table)
_model = None
def _init_worker(model_path: str):
    global _model
    _model = load_model(model_path)             # heavy; pays back across N tasks

def _predict(x):
    return _model.predict(x)

with ProcessPoolExecutor(
    max_workers=os.cpu_count(),
    initializer=_init_worker,
    initargs=("models/v1.pkl",),
) as ex:
    preds = list(ex.map(_predict, batches))

# 2) Shared memory — avoid serializing huge numpy arrays per task
def _make_shm(arr: np.ndarray):
    shm = shared_memory.SharedMemory(create=True, size=arr.nbytes)
    np.ndarray(arr.shape, dtype=arr.dtype, buffer=shm.buf)[:] = arr
    return shm

def _job(shm_name, shape, dtype, slice_):
    shm = shared_memory.SharedMemory(name=shm_name)
    a = np.ndarray(shape, dtype=dtype, buffer=shm.buf)
    return a[slice_].sum()

# 3) When to use processes vs alternatives
#    - pure Python CPU work, multi-core           -> ProcessPoolExecutor
#    - numpy / scikit-learn / numba (release GIL) -> threads are often FINE and faster
#    - I/O-bound work                              -> async I/O or threads, NOT processes
#    - distributed across machines                  -> Dask / Ray, not local processes

# 4) Startup cost is REAL — don't use processes for thousands of <1 ms tasks.
#    Batch into chunks of 100-1000 work items per task to amortize.

# Decision rule:
#   pure-Python, CPU-bound, > 100 ms per task   -> ProcessPoolExecutor
#   numpy-heavy work                              -> ThreadPoolExecutor (numpy releases GIL)
#   I/O-bound                                     -> async / threads, NOT processes
#   need shared state                              -> initializer + module globals; shared_memory for arrays
#   work scattered across many machines             -> Dask / Ray, not local processes
#   tasks < 1 ms                                    -> sequential beats both, or batch them
#
# Anti-pattern: pickling lambdas / locally-defined functions
#   "AttributeError: Can't pickle local object" — the worker tries to import
#   the function by name and fails. Define them at module level (or use cloudpickle
#   via dask/joblib if you can't refactor).

def load_model(_): return None
batches = []
```

## Decision Rule

```text
pure-Python, CPU-bound, > 100 ms per task   -> ProcessPoolExecutor
numpy-heavy work                              -> ThreadPoolExecutor (numpy releases GIL)
I/O-bound                                     -> async / threads, NOT processes
need shared state                              -> initializer + module globals; shared_memory for arrays
work scattered across many machines             -> Dask / Ray, not local processes
tasks < 1 ms                                    -> sequential beats both, or batch them
```

## Anti-Pattern

> [!warning] Anti-pattern
> pickling lambdas / locally-defined functions
>   "AttributeError: Can't pickle local object" — the worker tries to import
>   the function by name and fails. Define them at module level (or use cloudpickle
>   via dask/joblib if you can't refactor).

## Tips

- Arguments and return values must be picklable — lambdas and closures often are not
- `max_workers=os.cpu_count()` uses all available cores — typically optimal for CPU-bound work
- Process startup has overhead — only worth it for tasks that take > ~100ms each
- `multiprocessing.Pool` and `ProcessPoolExecutor` are equivalent — `ProcessPoolExecutor` is the modern API

## Common Mistake

> [!warning] Passing lambda functions to ProcessPoolExecutor. Lambdas are not picklable. Define named functions at module level instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/apis/async/async-def|async def (APIs & Frameworks)]]
- [[Sections/apis/async/await|await (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-gather|asyncio.gather() (APIs & Frameworks)]]
- [[Sections/apis/async/asyncio-queue|asyncio.Queue() (APIs & Frameworks)]]
- [[Sections/apis/async/_Index|APIs & Frameworks → Async & Concurrency]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

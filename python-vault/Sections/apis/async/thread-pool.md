---
type: "entry"
domain: "python"
file: "apis"
section: "async"
id: "thread-pool"
title: "ThreadPoolExecutor"
category: "Async"
subtitle: "Parallel I/O — use for blocking libraries (requests, psycopg2)"
signature_short: "with ThreadPoolExecutor(max_workers=10) as ex: futures = ex.map(fn, items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ThreadPoolExecutor"
  - "thread-pool"
tags:
  - "python"
  - "python/apis"
  - "python/apis/async"
  - "category/async"
  - "tier/tiered"
---

# ThreadPoolExecutor

> Parallel I/O — use for blocking libraries (requests, psycopg2)

## Overview

ThreadPoolExecutor runs functions in worker threads — useful for I/O-bound blocking code (file I/O, `requests`, database calls). Threads share memory but are limited by the GIL for CPU-bound work.

## Signature

```python
with ThreadPoolExecutor(max_workers=10) as ex: futures = ex.map(fn, items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ThreadPoolExecutor.map for parallel I/O
# STRENGTHS - The minimum: a function, a list of inputs, parallel execution
# WEAKNESSES- No error handling; no per-task progress
#
from concurrent.futures import ThreadPoolExecutor
import requests

def fetch(url: str) -> int:
    return requests.get(url, timeout=10).status_code

with ThreadPoolExecutor(max_workers=10) as ex:
    codes = list(ex.map(fetch, urls))      # results in input order
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - submit + as_completed for streaming results, exception handling
# STRENGTHS - The shape that handles partial failures and shows progress
# WEAKNESSES- No bridge to async; senior tier covers run_in_executor / to_thread
#
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

def fetch(url: str) -> dict:
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return r.json()

results = {}
with ThreadPoolExecutor(max_workers=10) as ex:
    futures = {ex.submit(fetch, u): u for u in urls}
    for fut in as_completed(futures):              # yields fastest first
        url = futures[fut]
        try:
            results[url] = fut.result()
        except Exception as e:
            results[url] = None
            print(f"{url}: {e}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - GIL implications, async bridging, sizing, cancellation truth
# STRENGTHS - The doctrine that decides when to reach for threads vs processes vs async
# WEAKNESSES- N/A
#
import asyncio
from concurrent.futures import ThreadPoolExecutor

# 1) THREADS RELEASE THE GIL during I/O — they help requests, file I/O, sockets.
#    They DO NOT help CPU-bound code (numpy / sklearn release the GIL too —
#    those ARE OK in threads).
#    Pure Python loops over numbers? Use ProcessPoolExecutor.

# 2) Bridge from ASYNC -> blocking: asyncio.to_thread (3.9+)
def slow_blocking_call(x):                          # e.g. legacy psycopg2 query
    import time; time.sleep(0.5); return x * 2

async def use_blocking_in_async():
    return await asyncio.to_thread(slow_blocking_call, 21)

# 3) Custom executor (e.g. larger pool dedicated to I/O)
io_pool = ThreadPoolExecutor(max_workers=64, thread_name_prefix="io")
async def fetch_in_pool(url):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(io_pool, fetch, url)

# 4) Sizing rules of thumb
#    I/O-bound, light work       -> 10-50 threads (start at 2 * cpu_count, raise on need)
#    DB pool                      -> match thread pool size to DB max_connections
#    HTTP client (requests)       -> threads ~= permitted concurrent calls per host
#    CPU-bound                    -> ProcessPoolExecutor(max_workers=os.cpu_count())

# 5) Cancellation truth — submitted futures CAN'T be killed mid-execution.
#    fut.cancel() only works BEFORE the thread picks up the work.
#    Implement cancellation cooperatively: have the worker check a flag.
import threading
stop = threading.Event()
def worker():
    while not stop.is_set():
        do_chunk()

# Decision rule:
#   blocking I/O (requests, psycopg2)      -> ThreadPoolExecutor
#   numpy / pandas / sklearn (releases GIL) -> ThreadPoolExecutor is fine
#   pure-Python CPU work                    -> ProcessPoolExecutor
#   ASYNC code path needs blocking call     -> asyncio.to_thread / run_in_executor
#   tens of thousands of small tasks         -> async I/O (httpx) instead of threads
#   tasks that may never finish              -> cooperative stop flag, NOT future.cancel()
#
# Anti-pattern: ThreadPoolExecutor for CPU-bound pure-Python work
#   The GIL serializes execution; you'll see ~1 core utilized regardless of
#   max_workers. Switch to ProcessPoolExecutor (or rewrite the hot loop in
#   numpy/cython/numba which release the GIL).

def fetch(url): import requests; return requests.get(url, timeout=10).json()
def do_chunk(): pass
urls = []
```

## Decision Rule

```text
blocking I/O (requests, psycopg2)      -> ThreadPoolExecutor
numpy / pandas / sklearn (releases GIL) -> ThreadPoolExecutor is fine
pure-Python CPU work                    -> ProcessPoolExecutor
ASYNC code path needs blocking call     -> asyncio.to_thread / run_in_executor
tens of thousands of small tasks         -> async I/O (httpx) instead of threads
tasks that may never finish              -> cooperative stop flag, NOT future.cancel()
```

## Anti-Pattern

> [!warning] Anti-pattern
> ThreadPoolExecutor for CPU-bound pure-Python work
>   The GIL serializes execution; you'll see ~1 core utilized regardless of
>   max_workers. Switch to ProcessPoolExecutor (or rewrite the hot loop in
>   numpy/cython/numba which release the GIL).

## Tips

- `as_completed()` yields futures as they finish — best UX for large batches
- `loop.run_in_executor(None, fn, *args)` runs blocking code in a thread from async context
- The GIL prevents true parallelism in threads for CPU-bound code — use ProcessPoolExecutor instead
- `max_workers` for I/O-bound: 10-50; for CPU-bound with processes: `os.cpu_count()`

## Common Mistake

> [!warning] Using ThreadPoolExecutor for CPU-bound work like number crunching. The GIL means threads do not run in parallel for CPU work. Use ProcessPoolExecutor instead.

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

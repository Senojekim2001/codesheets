---
type: "entry"
domain: "python"
file: "concurrency"
section: "concurrent-futures"
id: "futures-patterns"
title: "Futures Patterns — Wait, Timeout & Cancellation"
category: "concurrent.futures"
subtitle: "wait(), as_completed(), timeout, cancellation, exception handling"
signature_short: "concurrent.futures.wait(futures, timeout=None, return_when=FIRST_COMPLETED)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Futures Patterns — Wait, Timeout & Cancellation"
  - "futures-patterns"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/concurrent-futures"
  - "category/concurrent-futures"
  - "tier/tiered"
---

# Futures Patterns — Wait, Timeout & Cancellation

> wait(), as_completed(), timeout, cancellation, exception handling

## Overview

concurrent.futures.wait() waits for futures with fine-grained control — return_when={FIRST_COMPLETED, FIRST_EXCEPTION, ALL_COMPLETED}. Perfect for: fail-fast on first error, process results as they arrive, implement custom timeout logic. Always check future.exception() to catch worker errors. Combine .cancel() for graceful shutdown with timeout.

## Signature

```python
concurrent.futures.wait(futures, timeout=None, return_when=FIRST_COMPLETED)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - future.result(timeout=N) for a per-task deadline
# STRENGTHS - Smallest valid timeout pattern
# WEAKNESSES- No wait() return_when; no cancellation
#
from concurrent.futures import ThreadPoolExecutor

def slow():
    import time; time.sleep(5); return "ok"

with ThreadPoolExecutor() as ex:
    f = ex.submit(slow)
    try:
        print(f.result(timeout=2))               # raises TimeoutError after 2s
    except TimeoutError:
        print("too slow")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - wait() with return_when, FIRST_EXCEPTION fail-fast, cancel pending
# STRENGTHS - The shape that handles partial failure with fine-grained control
# WEAKNESSES- No add_done_callback streaming; no graceful shutdown
#
from concurrent.futures import (
    ThreadPoolExecutor, wait, FIRST_COMPLETED, FIRST_EXCEPTION,
)

def task(n, delay):
    import time; time.sleep(delay)
    if n == 3: raise ValueError("intentional")
    return n

with ThreadPoolExecutor(max_workers=4) as ex:
    futures = [ex.submit(task, i, 0.5 * i) for i in range(5)]

    # 1) FIRST_COMPLETED — react to whichever finishes first
    done, pending = wait(futures, return_when=FIRST_COMPLETED, timeout=1)
    print("first done:", len(done), "still pending:", len(pending))

    # 2) FIRST_EXCEPTION — stop on the first failure, cancel the rest
    done, pending = wait(futures, return_when=FIRST_EXCEPTION)
    for f in pending:
        f.cancel()                                # only effective on PENDING futures
    for f in done:
        if (e := f.exception()) is not None:
            print("error:", e)
        else:
            print("ok:", f.result())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - add_done_callback streaming, cancel_futures shutdown, retries with backoff
# STRENGTHS - The patterns that turn futures into a resilient pipeline
# WEAKNESSES- N/A
#
import time
from concurrent.futures import ThreadPoolExecutor, Future, wait

# 1) add_done_callback — fire downstream work as soon as a future completes
ex = ThreadPoolExecutor(max_workers=8)
results, errors = [], []

def on_done(f: Future):
    try:    results.append(f.result())
    except Exception as e: errors.append(e)

for i in range(20):
    f = ex.submit(task, i, 0.1)
    f.add_done_callback(on_done)                  # NO blocking; pipelined

# 2) Graceful shutdown — let in-flight tasks finish, cancel the queue
ex.shutdown(wait=True, cancel_futures=True)       # 3.9+: drops never-started tasks

# 3) Retries — futures don't retry; you do
def submit_with_retry(ex, fn, *args, attempts=3, base_delay=0.5):
    last = None
    for i in range(attempts):
        f = ex.submit(fn, *args)
        try:
            return f.result()
        except Exception as e:
            last = e
            time.sleep(base_delay * 2**i)         # exponential backoff
    raise last

# 4) Bounded global timeout for a BATCH — finish what you can, drop the rest
def run_with_budget(fn, items, budget_s, workers=8):
    out = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(fn, x): x for x in items}
        done, pending = wait(futs, timeout=budget_s)
        for f in pending: f.cancel()
        for f in done:
            try:    out.append(f.result())
            except Exception as e: print("failed:", e)
    return out

# 5) Cancellation truth — Future.cancel() ONLY works BEFORE pickup.
#    For RUNNING tasks, the body has to check a flag. Wrap your worker:
import threading
stop = threading.Event()
def cancellable_work(items):
    for it in items:
        if stop.is_set(): return
        process(it)

# Decision rule:
#   one task with a deadline                 -> future.result(timeout=N)
#   N tasks, react to FIRST done              -> wait(..., return_when=FIRST_COMPLETED)
#   N tasks, fail fast on any error            -> wait(..., return_when=FIRST_EXCEPTION) + cancel pending
#   stream results to downstream consumer      -> add_done_callback (no thread blocked waiting)
#   service shutdown                            -> ex.shutdown(wait=True, cancel_futures=True)
#   transient failures expected                 -> retry with exponential backoff in caller
#   need to interrupt a RUNNING task            -> cooperative Event flag, not future.cancel()
#
# Anti-pattern: NOT calling future.exception() / .result() on background tasks
#   Exceptions vanish silently. The task "succeeded" from the pool's view.
#   Always: call .result(), use as_completed, or attach a done callback that
#   inspects exception().

def task(n, delay): import time; time.sleep(delay); return n
def process(_): pass
```

## Decision Rule

```text
one task with a deadline                 -> future.result(timeout=N)
N tasks, react to FIRST done              -> wait(..., return_when=FIRST_COMPLETED)
N tasks, fail fast on any error            -> wait(..., return_when=FIRST_EXCEPTION) + cancel pending
stream results to downstream consumer      -> add_done_callback (no thread blocked waiting)
service shutdown                            -> ex.shutdown(wait=True, cancel_futures=True)
transient failures expected                 -> retry with exponential backoff in caller
need to interrupt a RUNNING task            -> cooperative Event flag, not future.cancel()
```

## Anti-Pattern

> [!warning] Anti-pattern
> NOT calling future.exception() / .result() on background tasks
>   Exceptions vanish silently. The task "succeeded" from the pool's view.
>   Always: call .result(), use as_completed, or attach a done callback that
>   inspects exception().

## Tips

- wait() with FIRST_EXCEPTION enables fail-fast — stop processing as soon as an error occurs.
- .cancel() only works on pending futures — running ones can't be interrupted. For interrupting RUNNING tasks, the body must check a cooperative `threading.Event` between chunks.
- Always use timeout on .result() for defensive programming — prevents hanging forever.
- FIRST_COMPLETED is useful for real-time response — process results as they arrive, not in order. For non-blocking pipelines, attach `future.add_done_callback(fn)` so the next stage fires the moment a task completes (no thread waits idle). Futures don't retry; wrap submission in your own exponential-backoff loop.

## Common Mistake

> [!warning] NOT calling future.exception() / .result() on background tasks — exceptions vanish silently and the task "succeeded" from the pool's view. Always call .result(), use as_completed, or attach a done callback that inspects exception(). For graceful shutdown use `ex.shutdown(wait=True, cancel_futures=True)` (3.9+).

## Shorthand (Junior → Senior)

**Junior:**
```python
done, pending = wait(futures, timeout=5)
for f in done:
    try:
        print(f.result())
    except Exception as e:
        print(f"Error: {e}")
```

**Senior:**
```python
for f in as_completed(futures, timeout=5):
    print(f.result())
```

## See Also

- [[Sections/concurrency/concurrent-futures/threadpool-executor|ThreadPoolExecutor — High-Level Thread Pool (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/processpool-executor|ProcessPoolExecutor — High-Level Process Pool for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/concurrent-futures/_Index|Concurrency & Parallelism → concurrent.futures — Unified Executor API]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

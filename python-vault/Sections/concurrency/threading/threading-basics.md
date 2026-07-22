---
type: "entry"
domain: "python"
file: "concurrency"
section: "threading"
id: "threading-basics"
title: "threading — Concurrent I/O with Threads"
category: "Threading"
subtitle: "Thread, Lock, Event, concurrent.futures.ThreadPoolExecutor"
signature_short: "ThreadPoolExecutor(max_workers=10)  |  executor.map(fn, items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "threading — Concurrent I/O with Threads"
  - "threading-basics"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/threading"
  - "category/threading"
  - "tier/tiered"
---

# threading — Concurrent I/O with Threads

> Thread, Lock, Event, concurrent.futures.ThreadPoolExecutor

## Overview

Python threads run concurrently for I/O operations but are limited by the GIL (Global Interpreter Lock) for CPU work — only one thread executes Python bytecode at a time. ThreadPoolExecutor is the modern high-level API. Use threads for: HTTP requests, file I/O, database queries, subprocess calls. Use Lock/RLock for shared state. Event for signaling between threads. Threading is simpler than asyncio but uses more memory (one OS thread per task).

## Signature

```python
ThreadPoolExecutor(max_workers=10)  |  executor.map(fn, items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ThreadPoolExecutor.map for parallel I/O
# STRENGTHS - The minimum: function + list -> parallel execution
# WEAKNESSES- No locking, no error handling, no graceful shutdown
#
from concurrent.futures import ThreadPoolExecutor
import requests

def fetch(url):
    return requests.get(url, timeout=10).status_code

urls = [f"https://httpbin.org/status/200?i={i}" for i in range(20)]

with ThreadPoolExecutor(max_workers=10) as ex:
    print(list(ex.map(fetch, urls)))            # results in input order
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - submit + as_completed, Lock for shared state, Event for shutdown
# STRENGTHS - The four threading primitives most code actually uses
# WEAKNESSES- No timeouts, no condition variables
#
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# 1) submit + as_completed — results as they finish (fastest first)
def fetch(url):
    import requests
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return r.json()

with ThreadPoolExecutor(max_workers=20) as ex:
    futs = {ex.submit(fetch, u): u for u in urls}
    for f in as_completed(futs):
        url = futs[f]
        try:
            data = f.result()
        except Exception as e:
            print(url, "failed:", e)

# 2) Lock — protect shared mutable state from concurrent writes
counter = 0
lock = threading.Lock()
def bump():
    global counter
    for _ in range(100_000):
        with lock:                              # auto-release on exception
            counter += 1                        # without lock: races, lost updates

# 3) Event — signal between threads (e.g. shutdown)
stop = threading.Event()
def worker():
    while not stop.is_set():
        do_work()
        stop.wait(timeout=1)                    # check every second
# stop.set()  # main thread later — workers see it on next loop
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - GIL truth, RLock vs Lock, thread-local state, daemon vs non-daemon, sizing
# STRENGTHS - The doctrine that decides when threading is right
# WEAKNESSES- N/A
#
import threading

# 1) GIL: threads RELEASE the GIL during I/O and inside C-extensions (numpy,
#    sklearn, lxml). Pure-Python CPU loops stay serial — use ProcessPoolExecutor.
#    Test the assumption: profile, don't guess.

# 2) RLock — needed when the SAME thread must re-acquire (recursive code paths)
class Cache:
    def __init__(self):
        self._lock = threading.RLock()          # NOT Lock, or self.refresh()->self.refresh() deadlocks
        self._data = {}
    def get(self, k):
        with self._lock:
            if k not in self._data:
                self.refresh(k)                  # RE-enters the lock; RLock allows it
            return self._data[k]
    def refresh(self, k):
        with self._lock:
            self._data[k] = load(k)

# 3) Thread-local state — per-thread "globals" without locks
ctx = threading.local()
def handle(req_id):
    ctx.request_id = req_id                     # invisible to other threads
    log_with_context()

def log_with_context():
    print("rid:", getattr(ctx, "request_id", "-"))

# 4) Daemon vs non-daemon threads
#    daemon=True   -> killed when the program exits (good for background workers)
#    daemon=False  -> blocks shutdown until .join() (good for must-complete work)
t = threading.Thread(target=worker, daemon=True)

# 5) Sizing rules of thumb
#    I/O bound, light                -> 10-50 (start at 2 * cpu_count)
#    DB pool                          -> match max_workers to DB max_connections
#    HTTP per host                    -> respect upstream concurrency limit
#    CPU bound (pure Python)          -> NOT threads; ProcessPoolExecutor

# 6) Cancellation truth — Future.cancel() ONLY works BEFORE a worker picks it up.
#    Once running, you need cooperative cancellation (an Event the worker checks).

# Decision rule:
#   I/O concurrency, simple                  -> ThreadPoolExecutor.map
#   need progress / error per task            -> submit + as_completed
#   shared mutable state                       -> Lock; RLock for re-entrant code
#   per-thread context (request id, db conn)   -> threading.local()
#   coordinate shutdown across threads          -> threading.Event
#   pure-Python CPU work                        -> ProcessPoolExecutor instead
#   tens of thousands of small tasks            -> async I/O instead of threads
#
# Anti-pattern: locking everywhere "to be safe"
#   Each lock is a serialization point. Wrong one acquires order across two
#   locks -> deadlock. Minimize lock scope; consider queue-based hand-off so
#   only one thread owns mutable state at a time.

def do_work(): pass
def load(_): return None
urls = []
def worker(): pass
```

## Decision Rule

```text
I/O concurrency, simple                  -> ThreadPoolExecutor.map
need progress / error per task            -> submit + as_completed
shared mutable state                       -> Lock; RLock for re-entrant code
per-thread context (request id, db conn)   -> threading.local()
coordinate shutdown across threads          -> threading.Event
pure-Python CPU work                        -> ProcessPoolExecutor instead
tens of thousands of small tasks            -> async I/O instead of threads
```

## Anti-Pattern

> [!warning] Anti-pattern
> locking everywhere "to be safe"
>   Each lock is a serialization point. Wrong one acquires order across two
>   locks -> deadlock. Minimize lock scope; consider queue-based hand-off so
>   only one thread owns mutable state at a time.

## Tips

- ThreadPoolExecutor is almost always better than raw Thread — it handles pool sizing, error handling, and cleanup.
- as_completed() processes results in finish order — faster responses come first, no waiting for slow ones.
- Use `with lock:` instead of lock.acquire()/release(); reach for `RLock` when the SAME thread re-acquires (recursive code paths) or you'll deadlock against yourself. Use `threading.local()` for per-thread context (request_id, db connection) — invisible to other threads, no locking needed.
- Threads are best for I/O-bound work; for numpy/sklearn (which release the GIL during C calls) threads often beat processes too. For pure-Python CPU loops, ProcessPoolExecutor. Daemon threads (`daemon=True`) die when the program exits — good for background workers; non-daemon must `.join()` before shutdown.

## Common Mistake

> [!warning] Locking everywhere "to be safe" — each lock is a serialization point, and the wrong acquisition order across two locks gives you a deadlock. Minimize lock scope; consider queue-based hand-off so only one thread owns mutable state at a time. Also: threads for pure-Python CPU work hit the GIL — use ProcessPoolExecutor.

## Shorthand (Junior → Senior)

**Junior:**
```python
results = []
for url in urls:
    response = requests.get(url)
    results.append(response.json())
```

**Senior:**
```python
with ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(fetch, urls))
```

## See Also

- [[Sections/concurrency/threading-patterns/threading-lock|threading Synchronization — Lock, Condition, Event, Semaphore (Concurrency & Parallelism)]]
- [[Sections/concurrency/threading/_Index|Concurrency & Parallelism → Threading & Multiprocessing]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

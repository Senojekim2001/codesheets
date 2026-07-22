---
type: "entry"
domain: "python"
file: "concurrency"
section: "multiprocessing-deep"
id: "mp-queue-pipe"
title: "multiprocessing Queue & Pipe — Inter-Process Communication"
category: "Multiprocessing"
subtitle: "multiprocessing.Queue, Pipe, inter-process communication"
signature_short: "queue = Queue()  |  queue.put(item)  |  item = queue.get()  |  conn1, conn2 = Pipe()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "multiprocessing Queue & Pipe — Inter-Process Communication"
  - "mp-queue-pipe"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/multiprocessing-deep"
  - "category/multiprocessing"
  - "tier/tiered"
---

# multiprocessing Queue & Pipe — Inter-Process Communication

> multiprocessing.Queue, Pipe, inter-process communication

## Overview

Queue is thread-safe and process-safe FIFO. Multiple producers/consumers. Pipe is bidirectional communication between exactly 2 processes. Queue is easier for many-to-many; Pipe for 1-to-1. Both handle pickling automatically. Use for: work distribution (queue), request-response patterns (pipe), progress reporting.

## Signature

```python
queue = Queue()  |  queue.put(item)  |  item = queue.get()  |  conn1, conn2 = Pipe()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Queue, one producer process, get() in the parent
# STRENGTHS - Smallest cross-process message pass
# WEAKNESSES- No multi-consumer, no shutdown
#
from multiprocessing import Queue, Process

def producer(q):
    for i in range(5):
        q.put(i)

if __name__ == "__main__":
    q = Queue()
    Process(target=producer, args=(q,)).start()
    for _ in range(5):
        print(q.get())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - JoinableQueue + sentinels for clean shutdown; Pipe for 1-to-1
# STRENGTHS - The two IPC patterns most code actually needs
# WEAKNESSES- No EOFError discipline, no select-like polling
#
from multiprocessing import JoinableQueue, Pipe, Process

SENTINEL = None

def worker(q, wid):
    while True:
        item = q.get()
        if item is SENTINEL:
            q.task_done(); return
        try:
            process(item)
        finally:
            q.task_done()                            # ALWAYS, even on failure

def producer(q, n_workers, items):
    for it in items:
        q.put(it)
    for _ in range(n_workers):
        q.put(SENTINEL)

if __name__ == "__main__":
    q = JoinableQueue()
    workers = [Process(target=worker, args=(q, i)) for i in range(3)]
    for w in workers: w.start()
    producer(q, 3, range(20))
    q.join()                                         # wait for ALL task_done()
    for w in workers: w.join()

# Pipe — strictly bidirectional, exactly two endpoints
parent, child = Pipe()
def echo(c):
    while True:
        try:
            msg = c.recv()
        except EOFError:                             # peer closed
            return
        c.send(msg.upper())

def process(_): pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Picklability rules, EOF discipline, polling, queue size limits
# STRENGTHS - The patterns that prevent silent IPC hangs
# WEAKNESSES- N/A
#
from multiprocessing import Queue, Pipe, Process
from queue import Empty, Full
import time

# 1) Object pickled cost is REAL — the per-message overhead bounds throughput.
#    Pass tiny refs (path, key) and have the worker open / load on its side.
#    For huge numpy arrays: shared_memory, NOT Queue.put.

# 2) qsize() is NOT reliable — only use it as a HINT
#    Use Empty / Full exceptions with timeouts for correctness.
def consume(q):
    while True:
        try:
            item = q.get(timeout=1.0)                # blocks then raises Empty
        except Empty:
            if shutting_down(): return
            continue
        process(item)

# 3) Bounded queue — backpressure on the producer
q = Queue(maxsize=100)
def slow_producer(q):
    for x in stream_source():
        try:
            q.put(x, timeout=5)                      # raises Full after 5s
        except Full:
            log("downstream stalled")

# 4) Pipe EOF discipline — peer .close() raises EOFError on .recv()
def reader(conn):
    try:
        while True:
            msg = conn.recv()
            handle(msg)
    except EOFError:
        return                                       # clean exit; do NOT log as error
    finally:
        conn.close()

# 5) Polling multiple connections — connection.wait() handles N at once
from multiprocessing.connection import wait
def multiplex(conns, deadline=10.0):
    end = time.monotonic() + deadline
    while conns:
        ready = wait(conns, timeout=end - time.monotonic())
        if not ready: break                          # timeout
        for c in ready:
            try:    handle(c.recv())
            except EOFError: conns.remove(c)

# Decision rule:
#   one-to-many work distribution         -> Queue (or JoinableQueue if waiting on completion)
#   strictly two endpoints, request/reply  -> Pipe
#   need bounded backpressure              -> Queue(maxsize=N)
#   wait for ALL items processed           -> JoinableQueue + q.join()
#   poll multiple connections               -> multiprocessing.connection.wait
#   shipping huge arrays                     -> shared_memory, NOT Queue.put
#
# Anti-pattern: forgetting q.task_done() in the failure path
#   q.join() blocks forever; the orchestrator hangs on shutdown. Always
#   try/finally so task_done() is called even when process(item) raises.

def shutting_down(): return False
def stream_source(): return []
def handle(_): pass
def log(_): pass
```

## Decision Rule

```text
one-to-many work distribution         -> Queue (or JoinableQueue if waiting on completion)
strictly two endpoints, request/reply  -> Pipe
need bounded backpressure              -> Queue(maxsize=N)
wait for ALL items processed           -> JoinableQueue + q.join()
poll multiple connections               -> multiprocessing.connection.wait
shipping huge arrays                     -> shared_memory, NOT Queue.put
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting q.task_done() in the failure path
>   q.join() blocks forever; the orchestrator hangs on shutdown. Always
>   try/finally so task_done() is called even when process(item) raises.

## Tips

- Queue for many-to-many communication, Pipe for 1-to-1 request-response. For polling MULTIPLE Pipe connections, use `multiprocessing.connection.wait(conns, timeout=)`.
- Put None to signal workers to stop — common pattern in producer-consumer.
- queue.qsize() is not reliable — use it only as a hint, not for correctness. Use `Empty` / `Full` exceptions with timeouts instead. Pickled cost is real: pass tiny refs (path, key) and have the worker open / load on its side; for huge numpy arrays use `shared_memory`, NOT `Queue.put`.
- JoinableQueue tracks task_done() — use when you need to wait for batch completion. ALWAYS call `task_done()` in a `finally` so a failure in the worker body doesn't leave `q.join()` hanging forever.

## Common Mistake

> [!warning] Forgetting `q.task_done()` in the failure path — `q.join()` blocks forever and the orchestrator hangs on shutdown. Always wrap the consumer body in `try/finally: q.task_done()`. For Pipes, the peer's `.close()` raises `EOFError` on `.recv()` — handle it as a clean exit, not an error.

## Shorthand (Junior → Senior)

**Junior:**
```python
queue = Queue()
queue.put(item)
received = queue.get()
```

**Senior:**
```python
conn1, conn2 = Pipe()
conn1.send(item)
received = conn2.recv()
```

## See Also

- [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives (Concurrency & Parallelism)]]
- [[Sections/concurrency/multiprocessing-deep/_Index|Concurrency & Parallelism → Multiprocessing Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

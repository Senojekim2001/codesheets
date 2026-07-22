---
type: "file-index"
domain: "python"
file: "concurrency"
title: "Concurrency & Parallelism"
tags:
  - "python"
  - "python/concurrency"
  - "index"
---

# Concurrency & Parallelism

> 17 entries across 7 sections.

## asyncio — Asynchronous I/O · 2

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering]] — Write concurrent I/O-bound code with async/await — HTTP requests, file I/O, database queries running concurrently.
- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming]] — Rate limiting with semaphores, producer-consumer with queues, and async generators for streaming data.

## Threading & Multiprocessing · 2

- [[Sections/concurrency/threading/threading-basics|threading — Concurrent I/O with Threads]] — Run I/O-bound tasks concurrently using threads — limited by the GIL for CPU work but excellent for I/O.
- [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work]] — Bypass the GIL with separate processes — actual parallel execution on multiple CPU cores.

## Subprocess & Process Management · 1

- [[Sections/concurrency/subprocess/subprocess-run|subprocess — Running External Commands]] — Run shell commands, capture output, handle errors, and pipe between processes safely.

## concurrent.futures — Unified Executor API · 3

- [[Sections/concurrency/concurrent-futures/threadpool-executor|ThreadPoolExecutor — High-Level Thread Pool]] — Run I/O-bound tasks in a thread pool with .submit() and .map() — modern alternative to raw threading.
- [[Sections/concurrency/concurrent-futures/processpool-executor|ProcessPoolExecutor — High-Level Process Pool for CPU Work]] — True parallelism for CPU-intensive tasks — same executor API as threads but bypasses the GIL.
- [[Sections/concurrency/concurrent-futures/futures-patterns|Futures Patterns — Wait, Timeout & Cancellation]] — Advanced patterns: wait() for custom logic, timeout handling, cancellation, and exception propagation.

## asyncio Deep Dive — Advanced Patterns · 4

- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio]] — Control the event loop directly: run_until_complete(), create_task(), and advanced scheduling.
- [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP]] — Async network I/O with StreamReader and StreamWriter — TCP clients and servers.
- [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization]] — Thread-safe primitives for async: Lock, Semaphore, Event, Condition.
- [[Sections/concurrency/asyncio-deep/asyncio-timeout|asyncio Timeouts & Cancellation]] — Handle timeouts, cancellation, and shielding with wait_for(), timeout(), and shield().

## Multiprocessing Deep Dive — Advanced Patterns · 4

- [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API]] — High-level process pool: .map(), .apply_async(), context manager, and chunking.
- [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication]] — Pass data between processes: Queue (multiple consumers), Pipe (two endpoints).
- [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager]] — Share state between processes: Value (single), Array (bulk), Manager (complex).
- [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives]] — Process-safe locks: Lock, RLock, Semaphore for process coordination.

## Threading Patterns & Synchronization · 1

- [[Sections/concurrency/threading-patterns/threading-lock|threading Synchronization — Lock, Condition, Event, Semaphore]] — Thread-safe primitives: Lock (mutual exclusion), Condition (signaling), Event (one-shot signal), Semaphore (counting).

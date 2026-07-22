---
type: "entry"
domain: "python"
file: "containerization"
section: "process-model"
id: "gunicorn-uvicorn-config"
title: "gunicorn + uvicorn — production process configuration"
category: "Process Model"
subtitle: "gunicorn -k uvicorn.workers.UvicornWorker, --workers, --timeout, --graceful-timeout, --max-requests, --preload, uvloop, httptools"
signature_short: "gunicorn myapp:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 30 --graceful-timeout 30"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gunicorn + uvicorn — production process configuration"
  - "gunicorn-uvicorn-config"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/process-model"
  - "category/process-model"
  - "tier/tiered"
---

# gunicorn + uvicorn — production process configuration

> gunicorn -k uvicorn.workers.UvicornWorker, --workers, --timeout, --graceful-timeout, --max-requests, --preload, uvloop, httptools

## Overview

In containers, the process you run as PID 1 must be a real server, not just `uvicorn` (which is fine for dev but lacks production lifecycle management). Two production options: (a) `gunicorn` with `uvicorn.workers.UvicornWorker` — gunicorn manages N processes, each running uvicorn; (b) `uvicorn --workers N` with the new built-in process manager (3.0+). Both work; gunicorn has more knobs (`--preload`, `--max-requests`, signal handling that's been battle-tested). Worker-count formula: for async workers, 1 per CPU; for sync workers, `(2 × CPU) + 1`. The three examples solve the SAME concrete task — run a FastAPI service in a container, surviving load and recycling cleanly — at three depths: bare `uvicorn` → gunicorn + UvicornWorker + tuned worker count and timeouts → production with `--preload`, `--max-requests` for memory bounding, lifespan hooks, uvloop + httptools.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Run a FastAPI app in a container, listening on :8000.
- **Junior** — SAME — but multi-worker, with sane timeouts and graceful shutdown for k8s.
- **Senior** — SAME — production: --preload for lower per-worker memory + faster startup, --max-requests to bound worker memory leaks, FastAPI lifespan for startup/shutdown hooks, uvloop + httptools for performance.

## Signature

```python
gunicorn myapp:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 30 --graceful-timeout 30
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Run a FastAPI app in a container, listening on :8000.
# APPROACH  - uvicorn directly; one process; fine for dev or a tiny
#             service.
# STRENGTHS - One command; no extra dependency.
# WEAKNESSES- Single process can't use more than one CPU core for
#             CPU-bound work. No worker recycling; no graceful timeout.

# Dockerfile (CMD line):
# CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# What --host 0.0.0.0 means:
#   - 0.0.0.0 listens on every interface (so the container's port
#     mapping reaches it). 127.0.0.1 listens only on loopback —
#     the container would be unreachable from outside.

# Default uvicorn settings:
#   - 1 worker (single process)
#   - keep-alive: 5s
#   - timeout: graceful (no kill on long requests)
#   - signal handling: SIGTERM -> graceful shutdown

# When this is enough:
#  - Dev / staging
#  - Single-CPU containers (cgroup limit = 1 CPU)
#  - Async-heavy workload that doesn't benefit from more workers

# When you need gunicorn (junior tier):
#  - Multi-CPU containers — utilize cores via worker processes
#  - Long-running services that may have memory drift — auto-recycle
#  - More mature signal handling and lifecycle management

# Modern uvicorn alternative (uvicorn 0.30+):
# CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000",
#      "--workers", "4"]
# Built-in multi-worker mode; same effect as gunicorn for many cases.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but multi-worker, with sane timeouts and graceful
#             shutdown for k8s.
# APPROACH  - gunicorn with UvicornWorker class; --workers tuned to
#             container CPU; --timeout for stuck workers;
#             --graceful-timeout for shutdown drain.
# STRENGTHS- Battle-tested process manager; per-worker recycling on
#             timeout; clear signal handling.
# WEAKNESSES- Worker-count formula needs review when CPU shape changes.

# Dockerfile (CMD):
# CMD ["gunicorn", "myapp:app", \
#      "-k", "uvicorn.workers.UvicornWorker", \
#      "--workers", "4", \
#      "--bind", "0.0.0.0:8000", \
#      "--timeout", "30", \
#      "--graceful-timeout", "30", \
#      "--keep-alive", "5", \
#      "--access-logfile", "-", \
#      "--error-logfile", "-"]

# Worker-count formula:
#   ASYNC workers (UvicornWorker, AsyncioWorker):
#     workers = N_CPU                              (one per core)
#     Each worker handles many concurrent requests via asyncio.
#
#   SYNC workers (gthread, sync):
#     workers = (2 * N_CPU) + 1                    (the gunicorn rule of thumb)
#     Each worker handles one request at a time.
#
#   For containers with cpuLimits set:
#     N_CPU = the LIMIT (not the host's CPUs).
#     In Python: import os; os.cpu_count() may return the host count
#     (depending on Linux version). Read /sys/fs/cgroup/cpu.max for
#     the actual limit, or use the env var $WEB_CONCURRENCY.

# Important flags explained:
#   -k uvicorn.workers.UvicornWorker
#       Use uvicorn (ASGI) inside each gunicorn worker. Don't use
#       gunicorn's default sync worker for FastAPI — it doesn't speak ASGI.
#
#   --workers N
#       Number of worker processes. Each is a separate Python interpreter.
#
#   --timeout 30
#       Kill a worker that hasn't responded to its parent in 30s.
#       For async workers this is "the worker stopped pinging the
#       parent process" — usually means the event loop is blocked
#       (sync code in an async handler). Tune to your slowest legit op.
#
#   --graceful-timeout 30
#       On SIGTERM, give each worker 30s to finish in-flight requests
#       before SIGKILL. Match k8s terminationGracePeriodSeconds.
#
#   --keep-alive 5
#       How long to keep a connection open for HTTP/1.1 keep-alive.
#       Behind an LB, longer keepalive improves throughput.
#
#   --access-logfile - / --error-logfile -
#       Log to stdout/stderr (NOT files). Containers log to stdout;
#       the orchestrator picks it up.

# Reading WEB_CONCURRENCY in the entrypoint (12-factor convention):
# CMD ["sh", "-c", "gunicorn myapp:app \
#      -k uvicorn.workers.UvicornWorker \
#      --workers ${WEB_CONCURRENCY:-4} \
#      --bind 0.0.0.0:8000 \
#      --timeout 30 --graceful-timeout 30 \
#      --access-logfile - --error-logfile -"]
# Then in the Deployment manifest:
#   env:
#     - name: WEB_CONCURRENCY
#       value: "4"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: --preload for lower per-worker memory
#             + faster startup, --max-requests to bound worker memory
#             leaks, FastAPI lifespan for startup/shutdown hooks,
#             uvloop + httptools for performance.
# APPROACH  - --preload imports the app once in the master process;
#             workers fork from it, sharing memory pages (CoW). Pair
#             with --max-requests to recycle workers periodically so
#             any memory drift is bounded.
# STRENGTHS - 30-50% lower per-worker memory via shared pages;
#             worker-recycling protects against gradual leaks; lifespan
#             hooks run startup ONCE in the master.
# WEAKNESSES- --preload requires app code to be import-safe (no DB
#             connection at import time). lifespan startup hooks run
#             in the master with --preload, then re-run in each
#             worker — design accordingly.

# Dockerfile (production CMD):
# CMD ["gunicorn", "myapp:app", \
#      "-k", "uvicorn.workers.UvicornWorker", \
#      "--workers", "$WEB_CONCURRENCY", \
#      "--bind", "0.0.0.0:8000", \
#      "--timeout", "30", \
#      "--graceful-timeout", "30", \
#      "--keep-alive", "5", \
#      "--max-requests", "10000", \
#      "--max-requests-jitter", "1000", \
#      "--preload", \
#      "--access-logfile", "-", "--error-logfile", "-", \
#      "--access-logformat", "%(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s %(D)sus"]

# Critical flags:
#   --preload
#       Import the app in the master before forking. Workers share
#       read-only memory pages (Linux CoW). Cuts per-worker memory
#       30-50% for big imports (torch, numpy, sqlalchemy with many models).
#       Tradeoffs:
#       - app code MUST be import-safe (no DB connection in module-level code)
#       - hot reload doesn't work with --preload (irrelevant in prod)
#       - workers can't see master's state changes after fork
#
#   --max-requests 10000
#       Recycle each worker after 10k requests. Hedge against memory
#       leaks (Python's allocator + 3rd party C extensions can drift
#       over millions of requests).
#
#   --max-requests-jitter 1000
#       Add up to 1000-request jitter to --max-requests so workers
#       don't all recycle simultaneously (which would cause a
#       capacity dip).

# uvloop + httptools — native event loop and HTTP parser.
# pip install uvloop httptools
# These are auto-detected by uvicorn when installed; no config needed.
# Speedup: 30-100% RPS for I/O-bound workloads on Linux/macOS.
# (Not available on Windows; uvicorn falls back to asyncio's default loop.)

# FastAPI lifespan — startup/shutdown hooks (replaces deprecated on_event).
# myapp/__init__.py
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: runs ONCE in each worker.
    db_pool = await create_db_pool()
    redis_pool = await create_redis_pool()
    app.state.db = db_pool
    app.state.redis = redis_pool
    print(f"worker started; db pool size = {db_pool.size}")

    yield                                              # serving traffic

    # Shutdown: runs on graceful shutdown (SIGTERM).
    await db_pool.close()
    await redis_pool.aclose()
    # Force-flush OTel / metrics / logs.
    print("worker shutting down")

app = FastAPI(lifespan=lifespan)

# Async DB / Redis pool helpers.
async def create_db_pool(): ...
async def create_redis_pool(): ...

# Decision rule:
#   dev / a single core / async-heavy   -> uvicorn directly (no gunicorn)
#   multi-core, sync handlers          -> gunicorn -k sync, workers=(2*N)+1
#   multi-core, async (FastAPI/Starlette) -> gunicorn -k UvicornWorker, workers=N
#   need full uvicorn perf, modern lib -> uvicorn 0.30+ with --workers (built-in mgmt)
#   memory pressure                     -> --preload + reduce worker count
#   gradual memory leak                 -> --max-requests N --max-requests-jitter
#   need fastest event loop             -> pip install uvloop httptools (auto-detected)
#   long-running requests (uploads etc) -> raise --timeout to >max request time
#   stuck workers (sync code in async)  -> --timeout catches them; fix the code
#   k8s graceful drain                  -> --graceful-timeout matches terminationGracePeriodSeconds
#   logging                              -> --access-logfile - --error-logfile - (stdout)
#   prefer Hypercorn (HTTP/2)           -> hypercorn -k UvloopWorker; same shape
#   Trio-based async                     -> hypercorn TrioWorker; uvicorn doesn't speak Trio
#
# Anti-pattern: setting --workers high (8+) on a 1-CPU container
# because "more is better". Each worker is a Python interpreter
# with its own memory; 8 workers on 1 CPU means 8× memory cost,
# CPU contention, and they all wait for the same single core. Match
# workers to CPU LIMITS (not host CPU count); for I/O-bound async
# work, 1-2 workers per CPU is plenty. Read cgroup limits, not
# os.cpu_count().
```

## Decision Rule

```text
dev / a single core / async-heavy   -> uvicorn directly (no gunicorn)
multi-core, sync handlers          -> gunicorn -k sync, workers=(2*N)+1
multi-core, async (FastAPI/Starlette) -> gunicorn -k UvicornWorker, workers=N
need full uvicorn perf, modern lib -> uvicorn 0.30+ with --workers (built-in mgmt)
memory pressure                     -> --preload + reduce worker count
gradual memory leak                 -> --max-requests N --max-requests-jitter
need fastest event loop             -> pip install uvloop httptools (auto-detected)
long-running requests (uploads etc) -> raise --timeout to >max request time
stuck workers (sync code in async)  -> --timeout catches them; fix the code
k8s graceful drain                  -> --graceful-timeout matches terminationGracePeriodSeconds
logging                              -> --access-logfile - --error-logfile - (stdout)
prefer Hypercorn (HTTP/2)           -> hypercorn -k UvloopWorker; same shape
Trio-based async                     -> hypercorn TrioWorker; uvicorn doesn't speak Trio
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting --workers high (8+) on a 1-CPU container
> because "more is better". Each worker is a Python interpreter
> with its own memory; 8 workers on 1 CPU means 8× memory cost,
> CPU contention, and they all wait for the same single core. Match
> workers to CPU LIMITS (not host CPU count); for I/O-bound async
> work, 1-2 workers per CPU is plenty. Read cgroup limits, not
> os.cpu_count().

## Tips

- Use `gunicorn -k uvicorn.workers.UvicornWorker` for production. uvicorn alone is fine for dev; gunicorn adds worker recycling, signal handling, and a more battle-tested process manager.
- Worker count formula: for async (UvicornWorker), `workers = N_CPU`. For sync, `workers = (2 * N_CPU) + 1`. Read cgroup limits — `os.cpu_count()` may return the host count in containers.
- `--preload` imports the app in the master before forking. Workers share read-only memory pages (Linux CoW), saving 30-50% memory for big imports. Requires app code to be import-safe.
- `--max-requests N` recycles workers periodically to bound memory leaks. Pair with `--max-requests-jitter` so workers don't all recycle simultaneously.
- Install `uvloop` and `httptools` (Linux/macOS) — uvicorn auto-detects them. Speedup is 30-100% RPS for I/O-bound workloads.
- Match `--graceful-timeout` to k8s `terminationGracePeriodSeconds`. The signal-handling-shutdown entry has the full coordinated drain sequence.

## Common Mistake

> [!warning] Setting `--workers 8` on a 1-CPU container because "more workers = more throughput". Each worker is a Python interpreter; 8 workers on 1 CPU means 8× memory cost, CPU contention, and all workers wait for the same single core. Match workers to CPU LIMITS (cgroup), not the host CPU count. For async, 1-2 workers per CPU is plenty.

## Shorthand (Junior → Senior)

**Junior:**
```python
# 8 workers on 1-CPU container — memory waste, CPU thrash
gunicorn myapp:app -k UvicornWorker -w 8 --bind 0.0.0.0:8000
```

**Senior:**
```python
# Workers tied to actual CPU limit; env-driven for tuning
gunicorn myapp:app -k UvicornWorker -w ${WEB_CONCURRENCY:-4} --bind 0.0.0.0:8000
```

## See Also

- [[Sections/containerization/process-model/signal-handling-shutdown|Graceful shutdown — SIGTERM, drain, lifespan hooks (Containerization)]]
- [[Sections/containerization/process-model/non-root-user|Non-root user — drop privileges, integrate with k8s securityContext (Containerization)]]
- [[Sections/containerization/process-model/_Index|Containerization → Process Model — gunicorn/uvicorn, shutdown, non-root]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

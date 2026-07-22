---
type: "entry"
domain: "python"
file: "web"
section: "web-deployment"
id: "gunicorn"
title: "gunicorn"
category: "Deployment"
subtitle: "Worker management, binding, reloading"
signature_short: "gunicorn app:app  |  gunicorn -w 4 -b 0.0.0.0:8000"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gunicorn"
tags:
  - "python"
  - "python/web"
  - "python/web/web-deployment"
  - "category/deployment"
  - "tier/tiered"
---

# gunicorn

> Worker management, binding, reloading

## Overview

Gunicorn is a WSGI HTTP server that runs Python web applications in production. Specify the number of workers, binding address, and other options. Load balancing across workers handles concurrent requests.

## Signature

```python
gunicorn app:app  |  gunicorn -w 4 -b 0.0.0.0:8000
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Run a Flask/Django WSGI app under Gunicorn with sane defaults
# STRENGTHS - Smallest valid prod-ish command line
# WEAKNESSES- Hardcoded worker count; no logging or timeouts
#
# app.py
# from flask import Flask
# app = Flask(__name__)

# $ pip install gunicorn
# $ gunicorn app:app                              # 1 worker, port 8000
# $ gunicorn -w 4 -b 0.0.0.0:8000 app:app         # 4 workers, all interfaces
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Config file with worker math, timeouts, structured logging
# STRENGTHS - The shape every real Gunicorn deployment uses
# WEAKNESSES- Sync workers only; no graceful shutdown / reload tuning
#
# gunicorn_config.py
import multiprocessing

bind         = "0.0.0.0:8000"
workers      = multiprocessing.cpu_count() * 2 + 1   # CPU-bound rule of thumb
timeout      = 30                                    # kill a worker stuck this long
graceful_timeout = 30                                # finish in-flight requests on reload
keepalive    = 5
accesslog    = "-"                                   # stdout — container friendly
errorlog     = "-"
loglevel     = "info"
preload_app  = True                                  # parent imports app; workers fork it (less RAM)

# $ gunicorn -c gunicorn_config.py app:app

# Django
# $ gunicorn -c gunicorn_config.py myproject.wsgi:application
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Worker-class selection, signal hygiene, behind-a-proxy headers, monitoring
# STRENGTHS - The hardening that keeps Gunicorn boring under traffic
# WEAKNESSES- N/A
#
# gunicorn_config.py
import multiprocessing, os

# 1) Worker class — match your workload
#    sync (default)  -> CPU-bound, simple Flask/Django views
#    gthread          -> moderate I/O, threads share interpreter (--threads 4)
#    gevent / eventlet -> high-concurrency I/O (greenlet-based)
#    uvicorn.workers.UvicornWorker -> ASGI app under Gunicorn
worker_class = os.getenv("GUNICORN_WORKER", "gthread")
threads      = int(os.getenv("GUNICORN_THREADS", 4))

# 2) Worker count: respect container CPU limit, not the host's
def cpu_count() -> int:
    try:                                             # cgroups v2 quota
        with open("/sys/fs/cgroup/cpu.max") as f:
            quota, period = f.read().split()
        if quota != "max":
            return max(1, int(int(quota) / int(period)))
    except Exception:
        pass
    return multiprocessing.cpu_count()

bind         = "0.0.0.0:8000"
workers      = int(os.getenv("WEB_CONCURRENCY", cpu_count() * 2 + 1))
timeout      = 30
graceful_timeout = 30
keepalive    = 5

# 3) Behind a load balancer with TLS termination -> trust the X-Forwarded-* headers.
#    For Flask/Starlette: use ProxyFix in app code. For Gunicorn-only:
forwarded_allow_ips = "*"                            # only use behind a TRUSTED proxy

# 4) Probes
#    Liveness  -> hit /healthz on a route that returns fast
#    Readiness -> route that checks DB + cache; fail until ready
# 5) Recycle workers to bound memory leaks from third-party libs
max_requests        = 1000
max_requests_jitter = 50

# Decision rule:
#   sync, CPU-bound (pandas, ML)        -> sync workers, CPU+1 count
#   I/O-bound, mostly DB                -> gthread, --threads 4-8, fewer workers
#   high-concurrency websockets / SSE   -> gevent or move to Uvicorn (ASGI)
#   ASGI app (FastAPI / Starlette)      -> Uvicorn directly, OR gunicorn -k uvicorn.workers.UvicornWorker
#   memory leaks accumulating           -> max_requests with jitter
#
# Anti-pattern: gunicorn --reload in production
#   File-watcher restart adds latency, fights graceful shutdown, and is a
#   debugging-only feature. Reload is a deploy concern, not a server flag.
```

## Decision Rule

```text
sync, CPU-bound (pandas, ML)        -> sync workers, CPU+1 count
I/O-bound, mostly DB                -> gthread, --threads 4-8, fewer workers
high-concurrency websockets / SSE   -> gevent or move to Uvicorn (ASGI)
ASGI app (FastAPI / Starlette)      -> Uvicorn directly, OR gunicorn -k uvicorn.workers.UvicornWorker
memory leaks accumulating           -> max_requests with jitter
```

## Anti-Pattern

> [!warning] Anti-pattern
> gunicorn --reload in production
>   File-watcher restart adds latency, fights graceful shutdown, and is a
>   debugging-only feature. Reload is a deploy concern, not a server flag.

## Tips

- Set `workers = cpu_count * 2 + 1` for CPU-bound tasks; reduce for I/O tasks.
- Use `--timeout` to prevent slow requests from hanging (default 30s).
- Log to stdout (`-`) for container-friendly logging.

## Common Mistake

> [!warning] Running with `workers=1` in production; use multiple workers for concurrency.

## Shorthand (Junior → Senior)

**Junior:**
```python
# gunicorn_config.py
bind = "0.0.0.0:8000"
workers = 4
timeout = 30
accesslog = "-"

# Run
gunicorn -c gunicorn_config.py app:app
```

**Senior:**
```python
gunicorn -w 4 -b 0.0.0.0:8000 --timeout 30 app:app
```

## See Also

- [[Sections/web/web-deployment/uvicorn|uvicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient (Web (Flask, Django))]]
- [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access (Data Apps)]]
- [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions (Data Apps)]]
- [[Sections/web/web-deployment/_Index|Web (Flask, Django) → WSGI/ASGI & Deployment]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

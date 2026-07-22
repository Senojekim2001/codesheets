---
type: "entry"
domain: "python"
file: "web"
section: "web-deployment"
id: "uvicorn"
title: "uvicorn"
category: "Deployment"
subtitle: "Async server, worker processes, reloading"
signature_short: "uvicorn app:app  |  uvicorn -w 4 -h 0.0.0.0 -p 8000"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "uvicorn"
tags:
  - "python"
  - "python/web"
  - "python/web/web-deployment"
  - "category/deployment"
  - "tier/tiered"
---

# uvicorn

> Async server, worker processes, reloading

## Overview

Uvicorn is an ASGI HTTP server for async Python frameworks. It handles async/await routes natively. Configure workers for production, and use `--reload` during development.

## Signature

```python
uvicorn app:app  |  uvicorn -w 4 -h 0.0.0.0 -p 8000
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Run a FastAPI app under Uvicorn for development
# STRENGTHS - Smallest valid ASGI server invocation
# WEAKNESSES- Single worker, --reload — never for production
#
# app.py
# from fastapi import FastAPI
# app = FastAPI()

# $ pip install "uvicorn[standard]"
# $ uvicorn app:app --reload                       # dev: auto-reloads on file change
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-worker prod command + programmatic launch
# STRENGTHS - Covers both CLI and uvicorn.run() entry points
# WEAKNESSES- No proxy headers, no logging config beyond defaults
#
# CLI (preferred for prod)
# $ uvicorn app:app \
#       --host 0.0.0.0 --port 8000 \
#       --workers 4 \
#       --timeout-keep-alive 5 \
#       --log-level info \
#       --proxy-headers --forwarded-allow-ips="*"   # behind a load balancer

# Programmatic (only for dev / debugging — multi-worker via CLI is the norm)
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,                                # NEVER True in prod
        log_level="info",
    )
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Uvicorn-under-Gunicorn for graceful restarts; HTTP/2 vs h11; tuning
# STRENGTHS - The combo most production FastAPI deployments actually run
# WEAKNESSES- N/A
#
# 1) The conventional production stack:
#       Gunicorn (process supervisor + graceful reload)
#         └── Uvicorn workers (ASGI runtime)
#                └── FastAPI app
#
#    $ gunicorn app:app \
#         -k uvicorn.workers.UvicornWorker \
#         -w 4 -b 0.0.0.0:8000 \
#         --timeout 30 --graceful-timeout 30 \
#         --max-requests 1000 --max-requests-jitter 50 \
#         --access-logfile - --error-logfile -
#
#    Why: Uvicorn alone restarts hard. Gunicorn supervises workers, drains
#    connections on reload, and handles SIGHUP / SIGTERM cleanly.

# 2) Behind a TLS-terminating proxy (nginx, ELB, Cloudflare):
#       --proxy-headers makes Uvicorn trust X-Forwarded-Proto / X-Forwarded-For
#       --forwarded-allow-ips="<lb-cidrs>"  — pin to your load balancer
#    Skip this if Uvicorn faces the public internet directly (it shouldn't).

# 3) HTTP parser choice:
#       h11        -> default, pure Python, fine for most loads
#       httptools  -> C-backed, slightly faster (uvicorn[standard] picks this)
#    Always install uvicorn[standard] in production; it pulls httptools + uvloop.

# 4) Worker count for ASGI is NOT the same heuristic as WSGI. Async I/O lets one
#    worker handle thousands of in-flight requests. Start with 2-4, scale on
#    measured CPU saturation, not 2*CPU+1 (that rule is for sync workers).

# Decision rule:
#   FastAPI / Starlette / async         -> Uvicorn (with httptools + uvloop)
#   need supervisor + graceful reload    -> Gunicorn -k UvicornWorker
#   websockets / long-lived connections   -> Uvicorn directly (Gunicorn timeouts hurt)
#   single-binary deploy                  -> Hypercorn or Granian as alternatives
#   Windows host                           -> Uvicorn directly; Gunicorn doesn't run on Win
#
# Anti-pattern: --workers + --reload together
#   Reload mode forks a single watcher; --workers is silently ignored. The
#   server you end up with is single-process. Pick one or the other.
```

## Decision Rule

```text
FastAPI / Starlette / async         -> Uvicorn (with httptools + uvloop)
need supervisor + graceful reload    -> Gunicorn -k UvicornWorker
websockets / long-lived connections   -> Uvicorn directly (Gunicorn timeouts hurt)
single-binary deploy                  -> Hypercorn or Granian as alternatives
Windows host                           -> Uvicorn directly; Gunicorn doesn't run on Win
```

## Anti-Pattern

> [!warning] Anti-pattern
> --workers + --reload together
>   Reload mode forks a single watcher; --workers is silently ignored. The
>   server you end up with is single-process. Pick one or the other.

## Tips

- Use `--reload` only in development; it watches for file changes.
- Set `workers` for production; defaults to 1.
- `--timeout-keep-alive` controls idle connection timeout.

## Common Mistake

> [!warning] Using `--reload` in production (performance impact).

## Shorthand (Junior → Senior)

**Junior:**
```python
# Development
uvicorn app:app --reload

# Production
uvicorn app:app --workers 4 --host 0.0.0.0 --port 8000
```

**Senior:**
```python
uvicorn app:app --reload  # dev
uvicorn app:app -w 4 -h 0.0.0.0 -p 8000  # prod
```

## See Also

- [[Sections/web/web-deployment/gunicorn|gunicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient (Web (Flask, Django))]]
- [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access (Data Apps)]]
- [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions (Data Apps)]]
- [[Sections/web/web-deployment/_Index|Web (Flask, Django) → WSGI/ASGI & Deployment]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

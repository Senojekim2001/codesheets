---
type: "entry"
domain: "python"
file: "containerization"
section: "process-model"
id: "signal-handling-shutdown"
title: "Graceful shutdown — SIGTERM, drain, lifespan hooks"
category: "Process Model"
subtitle: "SIGTERM -> graceful drain, FastAPI lifespan, k8s preStop, terminationGracePeriodSeconds, OTel force_flush, asyncio task cancellation, force-kill backstop"
signature_short: "@asynccontextmanager async def lifespan(app): yield; await db.close(); provider.force_flush()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Graceful shutdown — SIGTERM, drain, lifespan hooks"
  - "signal-handling-shutdown"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/process-model"
  - "category/process-model"
  - "tier/tiered"
---

# Graceful shutdown — SIGTERM, drain, lifespan hooks

> SIGTERM -> graceful drain, FastAPI lifespan, k8s preStop, terminationGracePeriodSeconds, OTel force_flush, asyncio task cancellation, force-kill backstop

## Overview

Shutdown is when most production bugs hit. SIGTERM arrives; in-flight requests must finish; new requests must stop coming; DB pools / Redis / OTel exporters / log buffers must flush; the process must exit before the orchestrator force-kills (`SIGKILL` after `terminationGracePeriodSeconds`). The coordination order matters: deregister from the load balancer FIRST (k8s `preStop` hook) so no new traffic arrives, THEN start the graceful drain. The three examples solve the SAME concrete task — on SIGTERM, finish in-flight requests, close pools, flush exporters, exit cleanly within 30s — at three depths: gunicorn defaults handle SIGTERM → FastAPI lifespan + preStop hook + tuned terminationGracePeriodSeconds → coordinated production sequence (LB drain → stop accepting → drain in-flight → close pools → flush OTel/logs → exit) with force-kill backstop.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — On pod SIGTERM, finish in-flight requests instead of dropping connections.
- **Junior** — SAME — but coordinate with k8s: preStop hook removes pod from the LB before SIGTERM; FastAPI lifespan closes app resources cleanly.
- **Senior** — SAME — production: explicit shutdown sequence (drain -> pools -> exporters -> exit), force-kill backstop if a coroutine hangs, OTel + log flush, signal-driven debug dump for stuck shutdowns.

## Signature

```python
@asynccontextmanager async def lifespan(app): yield; await db.close(); provider.force_flush()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - On pod SIGTERM, finish in-flight requests instead of
#             dropping connections.
# APPROACH  - gunicorn handles SIGTERM by default: stop accepting new
#             connections, wait for active workers to finish, exit.
#             Tune --graceful-timeout to your worst-case request time.
# STRENGTHS - Built-in; no app code needed.
# WEAKNESSES- App-level resources (DB pool, OTel) aren't flushed by
#             gunicorn — junior tier adds lifespan hooks.

# gunicorn signal handling (default behavior):
#   SIGTERM:  graceful shutdown — stop new connections, drain workers
#   SIGINT:   same as SIGTERM
#   SIGQUIT:  fast shutdown — force kill workers immediately
#   SIGHUP:   reload config (re-read --workers, --timeout)
#   SIGUSR1:  reopen log files (after rotation)
#   SIGUSR2:  upgrade to a new gunicorn binary (zero-downtime restart)

# Dockerfile (intact from previous entries):
# CMD ["gunicorn", "myapp:app", \
#      "-k", "uvicorn.workers.UvicornWorker", \
#      "--workers", "4", \
#      "--graceful-timeout", "30", \          # <-- 30s drain budget
#      "--bind", "0.0.0.0:8000"]

# k8s pod manifest (excerpt):
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     spec:
#       terminationGracePeriodSeconds: 30      # match --graceful-timeout
#       containers:
#         - name: myapp
#           image: myapp:1.4.2

# Default flow when k8s deletes the pod:
#   T+0:  k8s sends SIGTERM to PID 1
#   T+0:  gunicorn master stops accepting new conns, signals workers
#   T+0..30: workers finish in-flight requests, exit one by one
#   T+30: if any worker still alive, k8s sends SIGKILL (drops conns)
#
# What's NOT yet handled:
#   - app-level cleanup (close DB pool, flush OTel)
#   - removing pod from LB BEFORE drain (so no new conns arrive)
# These need lifespan hooks + a preStop hook (junior tier).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but coordinate with k8s: preStop hook removes pod
#             from the LB before SIGTERM; FastAPI lifespan closes app
#             resources cleanly.
# APPROACH  - preStop runs BEFORE SIGTERM with a sleep so the LB has
#             time to deregister; lifespan's after-yield block handles
#             cleanup.
# STRENGTHS- Zero dropped requests during deploys; clean DB pool /
#             Redis / OTel shutdown.
# WEAKNESSES- preStop adds 5-10s to every pod-deletion — terminationGrace
#             must accommodate it.
import asyncio, signal, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

log = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # === Startup ===
    log.info("startup_begin")
    app.state.db_pool = await make_db_pool()
    app.state.redis  = await make_redis_pool()
    log.info("startup_complete")

    yield                                              # === serving ===

    # === Shutdown — runs on graceful exit ===
    log.info("shutdown_begin")
    try:
        await app.state.db_pool.close()
        log.info("db_pool_closed")
    except Exception as e:
        log.error("db_pool_close_failed", extra={"err": str(e)})
    try:
        await app.state.redis.aclose()
        log.info("redis_closed")
    except Exception as e:
        log.error("redis_close_failed", extra={"err": str(e)})
    log.info("shutdown_complete")

app = FastAPI(lifespan=lifespan)

# Helpers (sketch).
async def make_db_pool(): ...
async def make_redis_pool(): ...

# === k8s manifest (excerpt) ===
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     spec:
#       terminationGracePeriodSeconds: 60       # 5s preStop + 30s drain + headroom
#       containers:
#         - name: myapp
#           image: myapp:1.4.2
#           lifecycle:
#             preStop:
#               # Give k8s time to remove this pod from the Service's
#               # endpoints (so the LB stops sending traffic) BEFORE
#               # SIGTERM is sent.
#               exec:
#                 command: ["sh", "-c", "sleep 5"]
#           # readiness probe + the preStop sleep give the LB the
#           # window it needs to deregister this pod.
#           readinessProbe:
#             httpGet: { path: /healthz, port: 8000 }
#             periodSeconds: 5

# Sequence during deploy:
#   T+0:   pod marked for termination
#   T+0:   readiness probe transition (k8s removes from endpoints)
#   T+0:   preStop hook runs: sleep 5
#   T+5:   SIGTERM sent to PID 1
#   T+5..35: gunicorn graceful drain (--graceful-timeout 30)
#   T+5:   FastAPI lifespan shutdown begins (db/redis close)
#   T+35:  if any worker alive, k8s SIGKILL
#   T+60:  hard timeout — k8s force-removes pod

# Why preStop matters:
#  - Without it: SIGTERM arrives instantly; gunicorn stops accepting,
#    BUT the LB still has the pod in its pool and sends NEW requests
#    that get RST. Failed requests during every deploy.
#  - With it: the 5-second sleep gives k8s time to propagate the
#    "endpoint removed" event to all kube-proxy / ingress controllers.
#    By the time SIGTERM hits, no new traffic arrives.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: explicit shutdown sequence (drain ->
#             pools -> exporters -> exit), force-kill backstop if a
#             coroutine hangs, OTel + log flush, signal-driven debug
#             dump for stuck shutdowns.
# APPROACH  - Lifespan shutdown phases the cleanup; faulthandler
#             registered on SIGUSR1 dumps every thread if shutdown
#             stalls; asyncio.wait_for caps each step.
# STRENGTHS - Bounded shutdown duration; observable progress; no
#             silent loss of metrics/traces; debugging hooks for the
#             rare stuck shutdown.
# WEAKNESSES- Larger shutdown code; document the sequence so on-call
#             knows what "stuck at db_pool.close" actually means.
import asyncio, faulthandler, signal, sys, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

log = logging.getLogger(__name__)

# Per-step timeout — sum < terminationGracePeriodSeconds - graceful_timeout.
DB_CLOSE_TIMEOUT_S      = 10
REDIS_CLOSE_TIMEOUT_S   = 5
OTEL_FLUSH_TIMEOUT_S    = 5
LOG_FLUSH_TIMEOUT_S     = 2

@asynccontextmanager
async def lifespan(app: FastAPI):
    # === Startup ===
    log.info("lifespan_startup")
    install_debug_signal()                             # SIGUSR1 -> all-thread stack dump
    app.state.db    = await make_db_pool()
    app.state.redis = await make_redis_pool()
    yield

    # === Shutdown — coordinated phases ===
    log.info("lifespan_shutdown_begin")

    # Phase 1: cancel any background asyncio tasks (per-app discipline).
    cancelled = 0
    for task in asyncio.all_tasks():
        if task is asyncio.current_task(): continue
        if task.get_name().startswith("background:"):
            task.cancel(); cancelled += 1
    log.info("background_tasks_cancelled", extra={"n": cancelled})

    # Phase 2: close DB pool (drain in-flight queries first).
    await _bounded("db_pool_close", DB_CLOSE_TIMEOUT_S, app.state.db.close())

    # Phase 3: close Redis.
    await _bounded("redis_close", REDIS_CLOSE_TIMEOUT_S, app.state.redis.aclose())

    # Phase 4: force-flush OTel exporters (traces + metrics).
    await _bounded("otel_flush", OTEL_FLUSH_TIMEOUT_S,
                   asyncio.to_thread(_flush_otel))

    # Phase 5: flush logging handlers.
    await _bounded("log_flush", LOG_FLUSH_TIMEOUT_S,
                   asyncio.to_thread(_flush_logging))

    log.info("lifespan_shutdown_complete")

async def _bounded(name: str, timeout_s: float, awaitable):
    """Run an awaitable; log if it exceeds budget; never block forever."""
    try:
        await asyncio.wait_for(awaitable, timeout=timeout_s)
        log.info("shutdown_step_complete", extra={"step": name})
    except asyncio.TimeoutError:
        log.error("shutdown_step_timeout", extra={"step": name, "timeout_s": timeout_s})
    except Exception as e:
        log.error("shutdown_step_failed", extra={"step": name, "err": str(e)})

def _flush_otel():
    from opentelemetry import trace, metrics
    try: trace.get_tracer_provider().force_flush(timeout_millis=4000)
    except Exception: pass
    try: metrics.get_meter_provider().force_flush(timeout_millis=4000)
    except Exception: pass

def _flush_logging():
    for h in logging.getLogger().handlers:
        try: h.flush()
        except Exception: pass

# Debug hook: SIGUSR1 dumps every thread's traceback to a known file.
# Use 'kubectl exec POD -- kill -USR1 1' if shutdown hangs.
def install_debug_signal():
    if not hasattr(signal, "SIGUSR1"):
        return
    out = open("/tmp/shutdown-stacks.log", "a", buffering=1)
    faulthandler.register(signal.SIGUSR1, file=out, all_threads=True)

# Helpers.
async def make_db_pool(): ...
async def make_redis_pool(): ...

app = FastAPI(lifespan=lifespan)

# === k8s manifest tuning ===
# spec:
#   terminationGracePeriodSeconds: 60       # preStop 5 + drain 30 + cleanup 25 + headroom
#   containers:
#     - lifecycle:
#         preStop:
#           exec: { command: ["sh", "-c", "sleep 5"] }
#       readinessProbe:
#         httpGet: { path: /healthz, port: 8000 }
#         periodSeconds: 5
#         failureThreshold: 1                 # remove from endpoints fast on shutdown
#       livenessProbe:
#         httpGet: { path: /healthz, port: 8000 }
#         periodSeconds: 30
#         timeoutSeconds: 5
#         initialDelaySeconds: 30             # don't kill during slow startup

# Decision rule:
#   default for production                  -> preStop sleep + lifespan + tuned timeouts
#   long-running batch handlers              -> raise --graceful-timeout AND grace period
#   websockets / streaming                   -> handle disconnects in your handler;
#                                                send close frames before exit
#   stuck shutdown debugging                -> SIGUSR1 -> faulthandler.dump_traceback
#   need sub-second drain                    -> shorten readiness probe period (1s);
#                                                preStop sleep 1; tight timeouts
#   uses background tasks                    -> name them "background:..." and cancel in lifespan
#   exporters (OTel, sentry, datadog)        -> force_flush in lifespan; never lose the last batch
#   process is PID 1 in container            -> handle SIGTERM at the entrypoint OR use tini
#   shell-form CMD doesn't get SIGTERM       -> use exec form; OR ENTRYPOINT ["tini", "--"]
#   SIGKILL during normal shutdown           -> grace period too short; raise it
#   pre-warm on startup                      -> startup phase of lifespan; readiness gates traffic
#
# Anti-pattern: shell-form CMD (CMD gunicorn ...). Shell form runs as
# /bin/sh -c "gunicorn ..." — gunicorn becomes a CHILD of sh, and
# SIGTERM goes to sh which doesn't propagate to gunicorn. Result:
# gunicorn never gets SIGTERM, drops to SIGKILL after the grace period,
# in-flight requests die. Use exec form (CMD ["gunicorn", ...]) so
# gunicorn is PID 1 directly. Or use 'tini' as ENTRYPOINT to handle
# signals + reap zombies.
```

## Decision Rule

```text
default for production                  -> preStop sleep + lifespan + tuned timeouts
long-running batch handlers              -> raise --graceful-timeout AND grace period
websockets / streaming                   -> handle disconnects in your handler;
                                             send close frames before exit
stuck shutdown debugging                -> SIGUSR1 -> faulthandler.dump_traceback
need sub-second drain                    -> shorten readiness probe period (1s);
                                             preStop sleep 1; tight timeouts
uses background tasks                    -> name them "background:..." and cancel in lifespan
exporters (OTel, sentry, datadog)        -> force_flush in lifespan; never lose the last batch
process is PID 1 in container            -> handle SIGTERM at the entrypoint OR use tini
shell-form CMD doesn't get SIGTERM       -> use exec form; OR ENTRYPOINT ["tini", "--"]
SIGKILL during normal shutdown           -> grace period too short; raise it
pre-warm on startup                      -> startup phase of lifespan; readiness gates traffic
```

## Anti-Pattern

> [!warning] Anti-pattern
> shell-form CMD (CMD gunicorn ...). Shell form runs as
> /bin/sh -c "gunicorn ..." — gunicorn becomes a CHILD of sh, and
> SIGTERM goes to sh which doesn't propagate to gunicorn. Result:
> gunicorn never gets SIGTERM, drops to SIGKILL after the grace period,
> in-flight requests die. Use exec form (CMD ["gunicorn", ...]) so
> gunicorn is PID 1 directly. Or use 'tini' as ENTRYPOINT to handle
> signals + reap zombies.

## Tips

- k8s `preStop` sleep is essential. Without it, SIGTERM arrives instantly but the LB still has the pod registered — new requests arrive AFTER gunicorn stops accepting, hitting RST. The 5-second sleep gives kube-proxy time to deregister.
- `terminationGracePeriodSeconds` must equal `preStop duration + --graceful-timeout + cleanup buffer`. Common values: 60s for typical services; 120s for long-running handlers.
- Use FastAPI `lifespan` (not deprecated `on_event`) for resource setup/cleanup. Each phase of cleanup should have a bounded `asyncio.wait_for` timeout — better to lose one pool's flush than block exit forever.
- Force-flush OTel exporters in the shutdown path: `provider.force_flush(timeout_millis=4000)`. Without this, the BatchSpanProcessor's pending spans vanish on exit.
- Use `CMD ["gunicorn", ...]` (exec form), NEVER `CMD gunicorn ...` (shell form). Shell form makes `/bin/sh` PID 1; SIGTERM goes to `sh` which doesn't propagate to gunicorn. Or use `tini` as ENTRYPOINT.
- Install `faulthandler.register(signal.SIGUSR1)` so a hung shutdown can be diagnosed via `kubectl exec POD -- kill -USR1 1` — dumps every thread's stack to a file.

## Common Mistake

> [!warning] `CMD gunicorn ...` (shell form) instead of `CMD ["gunicorn", ...]` (exec form). Shell form runs `/bin/sh -c "gunicorn ..."` — gunicorn is a CHILD of sh; SIGTERM goes to sh which doesn't propagate. gunicorn never sees SIGTERM, gets SIGKILLed after the grace period, in-flight requests die. Always use exec form, OR `tini` as ENTRYPOINT to handle signals.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Shell form — sh is PID 1; SIGTERM doesn't reach gunicorn
CMD gunicorn myapp:app --bind 0.0.0.0:8000
```

**Senior:**
```python
# Exec form — gunicorn is PID 1; SIGTERM works
CMD ["gunicorn", "myapp:app", "--bind", "0.0.0.0:8000"]
```

## See Also

- [[Sections/containerization/process-model/gunicorn-uvicorn-config|gunicorn + uvicorn — production process configuration (Containerization)]]
- [[Sections/containerization/process-model/non-root-user|Non-root user — drop privileges, integrate with k8s securityContext (Containerization)]]
- [[Sections/containerization/process-model/_Index|Containerization → Process Model — gunicorn/uvicorn, shutdown, non-root]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

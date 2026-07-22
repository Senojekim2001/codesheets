---
type: "entry"
domain: "python"
file: "containerization"
section: "container-ops"
id: "healthcheck-probes"
title: "Health probes — readiness, liveness, startup"
category: "Container Ops"
subtitle: "/healthz/live vs /healthz/ready vs /healthz/startup, livenessProbe / readinessProbe / startupProbe, periodSeconds, failureThreshold, dependency-aware ready, graceful drain"
signature_short: "GET /healthz/live → 200 (process is up)   ;   GET /healthz/ready → 200 (deps reachable)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Health probes — readiness, liveness, startup"
  - "healthcheck-probes"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/container-ops"
  - "category/container-ops"
  - "tier/tiered"
---

# Health probes — readiness, liveness, startup

> /healthz/live vs /healthz/ready vs /healthz/startup, livenessProbe / readinessProbe / startupProbe, periodSeconds, failureThreshold, dependency-aware ready, graceful drain

## Overview

Kubernetes uses three probes to manage pod lifecycle: STARTUP (am I done booting?), READINESS (am I ready for traffic?), LIVENESS (am I still alive?). Common mistake: collapsing them into one `/healthz`. The right design separates concerns — `/healthz/live` returns 200 if the process is responsive (no DB check); `/healthz/ready` returns 200 if deps are reachable AND the process isn't in graceful-shutdown drain; `/healthz/startup` returns 200 once boot completes (use only if startup is slow). Mixing them up causes cascading outages: a brief Redis blip fails liveness, k8s kills every pod, the cluster has zero capacity. The three examples solve the SAME concrete task — k8s knows when the FastAPI service is starting, ready for traffic, and still alive — at three depths: a single `/healthz` → split endpoints + correctly-tuned probe intervals → production patterns (dep-aware readiness with bounded timeouts, graceful-shutdown signals, circuit breaker integration).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — k8s knows when the pod is "up" via /healthz returning 200.
- **Junior** — SAME — but split into /healthz/live (process), /healthz/ready (deps), and /healthz/startup (boot complete) so k8s probes match their semantic.
- **Senior** — SAME — production: timeout-bounded dep checks, circuit breaker integration so a degraded backend doesn't make us throw away every pod, observability for probe results.

## Signature

```python
GET /healthz/live → 200 (process is up)   ;   GET /healthz/ready → 200 (deps reachable)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - k8s knows when the pod is "up" via /healthz returning 200.
# APPROACH  - Single endpoint that returns 200 if the process is alive.
# STRENGTHS - Trivial; works for one-pod toys.
# WEAKNESSES- Conflates "alive" with "ready". A blip on Redis fails
#             the probe; k8s kills the pod; deps come back; pod restarts;
#             repeat until cluster is empty. Junior tier separates them.
from fastapi import FastAPI

app = FastAPI()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# k8s manifest:
# spec:
#   containers:
#     - name: myapp
#       livenessProbe:
#         httpGet: { path: /healthz, port: 8000 }
#         initialDelaySeconds: 30
#         periodSeconds: 10
#         failureThreshold: 3
#
# Behavior:
#  - 30s after start, k8s starts probing.
#  - Every 10s, it does GET /healthz.
#  - 3 consecutive failures (~30s) → pod killed and restarted.
#
# Why this is wrong for production:
#  - "Alive" should be CHEAP — process responsive, nothing more.
#  - "Ready" should check DEPS — DB, Redis, downstream service.
#  - Conflating them means a 30-second Redis outage triggers pod
#    RESTARTS (slow, blank cache, etc.) instead of just temporarily
#    removing pods from the LB.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but split into /healthz/live (process), /healthz/ready
#             (deps), and /healthz/startup (boot complete) so k8s probes
#             match their semantic.
# APPROACH  - Three endpoints; live is cheap, ready checks deps with a
#             short timeout, startup is one-shot until "loaded".
# STRENGTHS- Brief Redis outages remove pods from LB without restarting
#             them; slow boot doesn't trigger spurious liveness fails.
# WEAKNESSES- Three endpoints to maintain; document what each checks.
import asyncio
from typing import Any
from fastapi import FastAPI, status, Response
import redis.asyncio as aredis
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy import text

app = FastAPI()

# State that probes consult.
_state: dict[str, Any] = {
    "boot_complete": False,
    "draining": False,
}

@app.on_event("startup")
async def _startup():
    # Heavy init lives here; ready/live stay fast.
    app.state.db_engine = create_async_engine("postgresql+asyncpg://app:secret@db/app")
    app.state.redis = aredis.Redis.from_url("redis://cache:6379/0")
    # Optionally pre-warm caches, build indexes, etc.
    _state["boot_complete"] = True

@app.on_event("shutdown")
async def _shutdown():
    _state["draining"] = True
    # See signal-handling-shutdown entry for the full sequence.

# === /healthz/live — process responsive; no deps ===
@app.get("/healthz/live")
async def live():
    return {"status": "ok"}                           # cheap; just proves event loop runs

# === /healthz/ready — deps reachable AND not draining ===
@app.get("/healthz/ready")
async def ready(response: Response):
    if _state["draining"]:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "draining"}

    # Each dep check has a short timeout; budget < probe period.
    checks: dict[str, str] = {}
    try:
        async with asyncio.timeout(1.0):
            async with app.state.db_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as e:
        checks["db"] = f"fail: {type(e).__name__}"
    try:
        async with asyncio.timeout(0.5):
            await app.state.redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"fail: {type(e).__name__}"

    if any(v.startswith("fail") for v in checks.values()):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready", "checks": checks}
    return {"status": "ready", "checks": checks}

# === /healthz/startup — boot complete? ===
@app.get("/healthz/startup")
async def startup_probe(response: Response):
    if _state["boot_complete"]:
        return {"status": "ok"}
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "starting"}

# === k8s manifest ===
# spec:
#   containers:
#     - name: myapp
#       startupProbe:
#         httpGet: { path: /healthz/startup, port: 8000 }
#         periodSeconds: 5
#         failureThreshold: 60                # up to 5 minutes for slow starts
#       livenessProbe:
#         httpGet: { path: /healthz/live, port: 8000 }
#         periodSeconds: 30                   # NOT aggressive
#         timeoutSeconds: 5
#         failureThreshold: 3                 # ~90s before kill
#       readinessProbe:
#         httpGet: { path: /healthz/ready, port: 8000 }
#         periodSeconds: 5                    # tight; LB reacts fast
#         timeoutSeconds: 2
#         failureThreshold: 1                 # one fail removes from LB

# Why these settings:
#   - startupProbe with periodSeconds=5, failureThreshold=60 = 5min budget.
#     Once it succeeds ONCE, k8s switches to liveness/readiness.
#   - livenessProbe period 30s + threshold 3 = 90s tolerance. Liveness
#     killing the pod is destructive; don't be aggressive.
#   - readinessProbe period 5s + threshold 1 = ~5s to remove from LB.
#     Tight because temporary unreadiness should drain traffic fast.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: timeout-bounded dep checks, circuit
#             breaker integration so a degraded backend doesn't make
#             us throw away every pod, observability for probe results.
# APPROACH  - Each dep check has a short timeout; failure increments
#             a circuit; readiness consults the circuit (not raw checks)
#             so we don't probe the DB on every readiness ping.
# STRENGTHS - Predictable probe latency; bounded probe-induced load
#             on deps; metrics show probe success rate per dep.
# WEAKNESSES- More state; document the circuit semantics so on-call
#             knows what "circuit open" means.
import asyncio, time, logging
from typing import Any, Awaitable, Callable
from contextlib import asynccontextmanager
from fastapi import FastAPI, status, Response
from prometheus_client import Counter, Gauge

log = logging.getLogger(__name__)

PROBE_RESULTS = Counter("healthz_results_total", "Probe results", ["probe", "status"])
DEP_STATE     = Gauge("healthz_dep_state",       "Dependency state (1=up,0=down)", ["dep"])

class DepCircuit:
    """Bounded circuit breaker: after N consecutive fails, open for cooldown.
    While open, ready returns 503 for this dep WITHOUT actually probing it."""
    def __init__(self, name: str, *, fail_threshold: int = 3, cooldown_s: float = 30.0):
        self.name = name
        self._fail_threshold = fail_threshold
        self._cooldown_s = cooldown_s
        self._failures = 0
        self._opened_at = 0.0
        self._lock = asyncio.Lock()

    @property
    def is_open(self) -> bool:
        return self._opened_at > 0 and (time.monotonic() - self._opened_at) < self._cooldown_s

    async def check(self, probe: Callable[[], Awaitable[None]], *, timeout_s: float) -> tuple[bool, str]:
        """Returns (ok, msg). On open circuit, fails fast without probing."""
        if self.is_open:
            return (False, "circuit_open")
        async with self._lock:
            try:
                async with asyncio.timeout(timeout_s):
                    await probe()
            except (asyncio.TimeoutError, Exception) as e:
                self._failures += 1
                if self._failures >= self._fail_threshold:
                    self._opened_at = time.monotonic()
                    log.warning("dep_circuit_opened", extra={"dep": self.name})
                DEP_STATE.labels(dep=self.name).set(0)
                return (False, f"{type(e).__name__}: {e}")
            self._failures = 0
            self._opened_at = 0.0
            DEP_STATE.labels(dep=self.name).set(1)
            return (True, "ok")

# === Lifespan with proper init/teardown ===
_state: dict[str, Any] = {"boot_complete": False, "draining": False}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Init (see signal-handling-shutdown for the full pattern).
    app.state.db_engine = await make_db_engine()
    app.state.redis     = await make_redis()
    app.state.db_circuit    = DepCircuit("db",    fail_threshold=3, cooldown_s=10.0)
    app.state.redis_circuit = DepCircuit("redis", fail_threshold=3, cooldown_s=5.0)
    _state["boot_complete"] = True
    yield
    _state["draining"] = True
    await app.state.db_engine.dispose()
    await app.state.redis.aclose()

app = FastAPI(lifespan=lifespan)

# === Endpoints ===
@app.get("/healthz/live")
async def live():
    PROBE_RESULTS.labels(probe="live", status="ok").inc()
    return {"status": "ok"}

@app.get("/healthz/ready")
async def ready(response: Response):
    if _state["draining"]:
        PROBE_RESULTS.labels(probe="ready", status="draining").inc()
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "draining"}

    checks: dict[str, str] = {}
    db_ok, db_msg = await app.state.db_circuit.check(
        lambda: _ping_db(app.state.db_engine), timeout_s=1.0,
    )
    redis_ok, redis_msg = await app.state.redis_circuit.check(
        lambda: app.state.redis.ping(), timeout_s=0.5,
    )
    checks["db"] = db_msg
    checks["redis"] = redis_msg

    if db_ok and redis_ok:
        PROBE_RESULTS.labels(probe="ready", status="ok").inc()
        return {"status": "ready", "checks": checks}

    PROBE_RESULTS.labels(probe="ready", status="degraded").inc()
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "not_ready", "checks": checks}

@app.get("/healthz/startup")
async def startup_probe(response: Response):
    if _state["boot_complete"]:
        return {"status": "ok"}
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "starting"}

async def _ping_db(engine) -> None:
    from sqlalchemy import text
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))

async def make_db_engine(): ...
async def make_redis(): ...

# Decision rule:
#   single endpoint /healthz                -> intro tier; toys only
#   real production                          -> /live (cheap) + /ready (deps) + /startup (boot)
#   liveness probe                            -> CHEAP, in-process check; period 30s, threshold 3
#   readiness probe                           -> dep checks with short timeouts; period 5s, threshold 1
#   slow-boot service (>30s)                 -> startupProbe; period 5s, threshold 60
#   dep blip kills pod                       -> liveness probably checking deps; FIX
#   thundering probe load on DB              -> circuit breaker pattern; ready consults state
#   draining state                            -> readiness 503 during shutdown; liveness still 200
#   tcpSocket probe instead of HTTP          -> coarser; works for non-HTTP services (Redis, etc.)
#   exec probe (kubectl exec)                -> distroless has no shell; use httpGet
#   want a degraded "still serving" mode    -> readiness can return 200 even if Redis down,
#                                                if cache miss is acceptable
#   compliance probe (auth required)         -> use TCP probe + dedicated /healthz on different port
#
# Anti-pattern: liveness probe that calls the database. The probe runs
# every periodSeconds, multiplied by the number of pods. A 100-pod
# deployment with a 5s liveness probe = 1200 DB pings/min just from
# probing. Worse: a brief DB outage causes EVERY pod's liveness to
# fail, k8s restarts every pod, the cluster goes empty, and when the
# DB recovers there's no warm pool. Liveness should be CHEAP and
# in-process; deps go in readiness.
```

## Decision Rule

```text
single endpoint /healthz                -> intro tier; toys only
real production                          -> /live (cheap) + /ready (deps) + /startup (boot)
liveness probe                            -> CHEAP, in-process check; period 30s, threshold 3
readiness probe                           -> dep checks with short timeouts; period 5s, threshold 1
slow-boot service (>30s)                 -> startupProbe; period 5s, threshold 60
dep blip kills pod                       -> liveness probably checking deps; FIX
thundering probe load on DB              -> circuit breaker pattern; ready consults state
draining state                            -> readiness 503 during shutdown; liveness still 200
tcpSocket probe instead of HTTP          -> coarser; works for non-HTTP services (Redis, etc.)
exec probe (kubectl exec)                -> distroless has no shell; use httpGet
want a degraded "still serving" mode    -> readiness can return 200 even if Redis down,
                                             if cache miss is acceptable
compliance probe (auth required)         -> use TCP probe + dedicated /healthz on different port
```

## Anti-Pattern

> [!warning] Anti-pattern
> liveness probe that calls the database. The probe runs
> every periodSeconds, multiplied by the number of pods. A 100-pod
> deployment with a 5s liveness probe = 1200 DB pings/min just from
> probing. Worse: a brief DB outage causes EVERY pod's liveness to
> fail, k8s restarts every pod, the cluster goes empty, and when the
> DB recovers there's no warm pool. Liveness should be CHEAP and
> in-process; deps go in readiness.

## Tips

- Three probes, three semantics. Liveness = "is the process responsive?" (cheap, no deps). Readiness = "should I get traffic?" (deps + drain state). Startup = "is boot done?" (one-shot for slow starts).
- NEVER make liveness check the database. Liveness failure causes pod restart; transient dep blips would restart every pod. Put dep checks in readiness — readiness failure just removes from LB.
- Set readiness probe to `failureThreshold: 1, periodSeconds: 5` so degraded pods leave the LB fast. Set liveness to `failureThreshold: 3, periodSeconds: 30` — restart is destructive, be conservative.
- For services with slow startup (> 30s), use `startupProbe` with high `failureThreshold` (e.g., 60 × 5s = 5min budget). Until startupProbe succeeds, liveness/readiness are SUSPENDED.
- On graceful shutdown, set the readiness endpoint to 503 EARLY so the LB drains traffic before SIGTERM's drain timer starts. Liveness should still return 200 during drain.
- Use a circuit-breaker pattern for dep checks at scale: 100 pods × 5s probe = 1200 dep pings/min. Cache the result; only re-probe after a cooldown.

## Common Mistake

> [!warning] Liveness probe that pings the database. With 100 pods × 5s liveness probe, the DB sees 1200 pings/minute purely from probes. Worse: a brief DB outage fails every pod's liveness, k8s restarts everything, the cluster goes EMPTY just as the DB recovers (no warm pools, cold cache stampedes). Liveness must be CHEAP + in-process; deps belong in readiness.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Liveness probe checks the database — cluster wipes on DB blip
async def healthz():
    await db.execute("SELECT 1")
    return {"status": "ok"}
```

**Senior:**
```python
# Liveness is cheap; deps go in readiness
@app.get("/healthz/live")
async def live(): return {"status": "ok"}      # process responsive

@app.get("/healthz/ready")
async def ready():                              # deps + drain state
    return await check_deps_with_circuit(...)
```

## See Also

- [[Sections/containerization/container-ops/secrets-injection|Secrets injection — k8s Secret, env vs file mount, BuildKit (Containerization)]]
- [[Sections/containerization/container-ops/container-logging|Container logging — stdout JSON, no log files, trace correlation (Containerization)]]
- [[Sections/containerization/container-ops/_Index|Containerization → Container Ops — health probes, secrets injection, logging]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

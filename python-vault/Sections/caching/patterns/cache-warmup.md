---
type: "entry"
domain: "python"
file: "caching"
section: "patterns"
id: "cache-warmup"
title: "Cache warmup — pre-populate after deploy / restart"
category: "Patterns"
subtitle: "access-log replay, top-N hot keys, parallel warmup with bounded concurrency, RDB/AOF persistence, graceful drain, shadow-traffic warmup"
signature_short: "await asyncio.gather(*(warmup(key) for key in top_n_keys), return_exceptions=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cache warmup — pre-populate after deploy / restart"
  - "cache-warmup"
tags:
  - "python"
  - "python/caching"
  - "python/caching/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Cache warmup — pre-populate after deploy / restart

> access-log replay, top-N hot keys, parallel warmup with bounded concurrency, RDB/AOF persistence, graceful drain, shadow-traffic warmup

## Overview

A cache that's been flushed (deploy with shape change, restart of an ephemeral cache, replica promotion) is COLD: every request is a miss, the source absorbs the full traffic. For a 100 RPS service with 5ms hits and 50ms source calls, the cold period is when latency spikes 10× and the source CPU triples. Warmup is the cheap fix: pre-populate the hot keys before the cache goes live. Inputs are usually access logs (top-N keys by request count last hour). Strategies range from a manual script run after deploy, to graceful traffic-mirroring during a staged rollout, to RDB-persisted caches that survive restarts. The three examples solve the SAME concrete task — after a deploy invalidates all entries, populate the cache with the top-100 hot keys before traffic resumes — at three depths: manual script with serial fetches → log-driven hot-key extraction + bounded-parallel warmup → production with RDB persistence + graceful drain + shadow-traffic warmup.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — After a deploy, populate the cache with the most-accessed user profiles before traffic resumes.
- **Junior** — SAME — but extract hot keys from yesterday's access logs (so the warmup tracks actual traffic) and run with bounded parallelism.
- **Senior** — SAME — production: cache survives Redis restart via RDB persistence; graceful drain on shutdown; shadow-traffic warmup mirrors live traffic to a new instance before cutover; observability shows warmup progress and source load during it.

## Signature

```python
await asyncio.gather(*(warmup(key) for key in top_n_keys), return_exceptions=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - After a deploy, populate the cache with the most-accessed
#             user profiles before traffic resumes.
# APPROACH  - A simple script: list known hot user IDs, fetch each
#             through the cached function, exit when done.
# STRENGTHS - Trivial; works as a CI/CD post-deploy hook.
# WEAKNESSES- Serial — 100 keys × 50ms source = 5 seconds; no observability
#             of progress; hardcoded list goes stale.
import asyncio
from app.cache import get_user                       # the cache-aside function

# Hand-curated list — fine for a starting point; doesn't track shifts in traffic.
HOT_USERS = [42, 101, 102, 103, 104, 105, 200, 201, 202]

async def warmup() -> None:
    for uid in HOT_USERS:
        try:
            await get_user(uid)                       # populates cache via cache-aside
        except Exception as e:
            print(f"warmup failed for {uid}: {e}")
    print(f"warmed up {len(HOT_USERS)} users")

if __name__ == "__main__":
    asyncio.run(warmup())

# Run after deploy:
# Dockerfile / k8s post-start hook:
#   lifecycle:
#     postStart:
#       exec:
#         command: ["python", "-m", "scripts.warmup"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but extract hot keys from yesterday's access logs
#             (so the warmup tracks actual traffic) and run with bounded
#             parallelism.
# APPROACH  - Read access log, count GET requests per key, pick top-N.
#             Warm up with asyncio.Semaphore-bounded concurrency.
# STRENGTHS- Always-current hot list; warms 100 keys in ~1s with 20-way
#             parallelism instead of 5s serial.
# WEAKNESSES- Access logs must be available (S3 ship, Loki query); no
#             persistence (cache lost on Redis restart — see senior tier).
import asyncio, re
from collections import Counter
from app.cache import get_user

ACCESS_LOG_PATH = "/var/log/myapp/access.log"
TOP_N = 100
PARALLEL = 20

# 1) Parse access logs to find hot keys.
LOG_RE = re.compile(r"GET /users/(\d+)")

def hot_users_from_logs(path: str, top_n: int) -> list[int]:
    counts: Counter[int] = Counter()
    with open(path) as f:
        for line in f:
            if (m := LOG_RE.search(line)):
                counts[int(m.group(1))] += 1
    return [uid for uid, _ in counts.most_common(top_n)]

# 2) Bounded-parallel warmup.
async def warmup(top_n: int = TOP_N, parallel: int = PARALLEL) -> dict:
    uids = hot_users_from_logs(ACCESS_LOG_PATH, top_n)
    sem = asyncio.Semaphore(parallel)
    succeeded = failed = 0

    async def _one(uid: int):
        nonlocal succeeded, failed
        async with sem:
            try:
                await get_user(uid)
                succeeded += 1
            except Exception as e:
                failed += 1
                print(f"warmup miss {uid}: {e}")

    await asyncio.gather(*(_one(u) for u in uids), return_exceptions=False)
    return {"warmed": succeeded, "failed": failed, "total": len(uids)}

if __name__ == "__main__":
    print(asyncio.run(warmup()))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: cache survives Redis restart via RDB
#             persistence; graceful drain on shutdown; shadow-traffic
#             warmup mirrors live traffic to a new instance before
#             cutover; observability shows warmup progress and source
#             load during it.
# APPROACH  - Redis with RDB+AOF (cache survives most restarts; no
#             warmup needed). For total-flush deploys: shadow traffic
#             replay; structured progress logging; circuit breaker
#             that fires when warmup is overloading the source.
# STRENGTHS - Most restarts skip warmup entirely (RDB has the data);
#             when warmup IS needed, it's controlled, observable,
#             and source-load aware.
# WEAKNESSES- RDB has cost (background SAVE I/O); AOF has cost
#             (every write is logged). Pick the persistence level
#             that matches "tolerable cache loss".
import asyncio, time, logging, json, signal
import redis.asyncio as aredis
from prometheus_client import Counter, Histogram, Gauge
from app.cache import get_user, redis_client

log = logging.getLogger(__name__)

# 1) Redis persistence — config in redis.conf or via CONFIG SET at startup.
# RDB: snapshot every 5 min if >100 changes (default 'save 300 100').
# AOF: append-only log of every write; replay on startup. Higher durability.
#   redis.conf:
#     save 300 100
#     appendonly yes
#     appendfsync everysec     # fsync once per second; 1s data-loss window
# For caches, AOF is overkill (cache loss is just slow first request).
# RDB is usually the right level: cache survives planned restarts, ~5min
# old on crash recovery.

# 2) Warmup metrics.
WARMUP_DURATION = Histogram("cache_warmup_duration_seconds", "Warmup duration", ["service"])
WARMUP_SUCCESS  = Counter("cache_warmup_success_total",  "Warmup successes",  ["service"])
WARMUP_FAILURE  = Counter("cache_warmup_failure_total",  "Warmup failures",   ["service"])
WARMUP_PROGRESS = Gauge("cache_warmup_progress",         "Fraction complete", ["service"])

# 3) Source-load aware warmup — back off if source latency rises.
class WarmupController:
    def __init__(self, *, parallel: int = 20, latency_p95_threshold_ms: int = 200):
        self.parallel = parallel
        self.threshold = latency_p95_threshold_ms
        self._latencies: list[float] = []
        self._sem = asyncio.Semaphore(parallel)
        self._stop = asyncio.Event()

    def request_stop(self):
        self._stop.set()

    def _p95(self) -> float:
        if not self._latencies: return 0.0
        sorted_l = sorted(self._latencies)
        return sorted_l[int(len(sorted_l) * 0.95)] * 1000

    async def warmup_one(self, uid: int) -> bool:
        if self._stop.is_set(): return False
        async with self._sem:
            start = time.monotonic()
            try:
                await get_user(uid)
                self._latencies.append(time.monotonic() - start)
                if len(self._latencies) > 200: self._latencies.pop(0)
                WARMUP_SUCCESS.labels(service="myapp").inc()
                # Throttle if source latency is climbing.
                if self._p95() > self.threshold:
                    log.warning("warmup throttling; p95=%.1fms", self._p95())
                    await asyncio.sleep(0.5)
                return True
            except Exception as e:
                WARMUP_FAILURE.labels(service="myapp").inc()
                log.warning("warmup failed for uid=%d: %s", uid, e)
                return False

    async def run(self, uids: list[int]) -> dict:
        with WARMUP_DURATION.labels(service="myapp").time():
            for i, uid in enumerate(uids):
                await self.warmup_one(uid)
                WARMUP_PROGRESS.labels(service="myapp").set(i / max(len(uids), 1))
            WARMUP_PROGRESS.labels(service="myapp").set(1.0)
        return {"total": len(uids), "p95_ms": self._p95()}

# 4) Shadow-traffic warmup — for a NEW Redis replica or staged rollout.
#    Live traffic to the OLD cache is mirrored to the NEW one (read +
#    write). No user-visible impact; the new cache fills naturally. Cut
#    over when hit ratio on new is >90% of old.
async def shadow_traffic_warmup(*,
    primary_url: str = "redis://primary:6379",
    shadow_url: str  = "redis://shadow:6379",
):
    """Mirror reads/writes from primary to shadow until hit ratio matches."""
    primary = aredis.Redis.from_url(primary_url, decode_responses=True)
    shadow  = aredis.Redis.from_url(shadow_url,  decode_responses=True)
    # Implementation sketch: a sidecar reads the application's cache calls
    # via Redis MONITOR (debug only) or a tap in the client and replays
    # them on the shadow. In practice, use a managed feature (Redis
    # Enterprise Active-Active, AWS ElastiCache replica) over rolling your
    # own.

# 5) Graceful drain — on SIGTERM, write a final RDB snapshot before exit.
def install_drain_hook(redis: aredis.Redis):
    def _on_term(*_):
        log.info("received SIGTERM; saving RDB snapshot before exit")
        try:
            asyncio.run(redis.bgsave())
        except Exception as e:
            log.warning("bgsave failed: %s", e)
    signal.signal(signal.SIGTERM, _on_term)

# Decision rule:
#   short cold-cache window OK              -> skip warmup; rely on cache-aside
#   cold latency unacceptable                -> warmup with hot-keys-from-logs
#   cache loss is unacceptable               -> Redis RDB (every 5 min) or AOF (every write)
#   warming may overload source             -> WarmupController with p95 throttle
#   new Redis replica / staged rollout      -> shadow traffic mirroring; cut over when ready
#   restart is rare, traffic high           -> RDB persistence > warmup script
#   restart is frequent (CI / preview env)  -> warmup script; RDB overkill
#   warmup observability                    -> Prometheus progress gauge + duration histogram
#   warmup must finish before serving       -> postStart hook in k8s; readinessProbe waits
#   only top 1% of keys are hot             -> warm only those; long tail can MISS without harm
#
# Anti-pattern: hammering the source with 1000-way parallel warmup.
# An eager script that fires every hot-user fetch concurrently will slam
# the DB harder than steady-state traffic, possibly tripping circuit
# breakers and timing out replicating peers. Bound concurrency
# (Semaphore) AND watch source latency; throttle if p95 climbs above
# steady-state. Warmup should be invisible to other services.
```

## Decision Rule

```text
short cold-cache window OK              -> skip warmup; rely on cache-aside
cold latency unacceptable                -> warmup with hot-keys-from-logs
cache loss is unacceptable               -> Redis RDB (every 5 min) or AOF (every write)
warming may overload source             -> WarmupController with p95 throttle
new Redis replica / staged rollout      -> shadow traffic mirroring; cut over when ready
restart is rare, traffic high           -> RDB persistence > warmup script
restart is frequent (CI / preview env)  -> warmup script; RDB overkill
warmup observability                    -> Prometheus progress gauge + duration histogram
warmup must finish before serving       -> postStart hook in k8s; readinessProbe waits
only top 1% of keys are hot             -> warm only those; long tail can MISS without harm
```

## Anti-Pattern

> [!warning] Anti-pattern
> hammering the source with 1000-way parallel warmup.
> An eager script that fires every hot-user fetch concurrently will slam
> the DB harder than steady-state traffic, possibly tripping circuit
> breakers and timing out replicating peers. Bound concurrency
> (Semaphore) AND watch source latency; throttle if p95 climbs above
> steady-state. Warmup should be invisible to other services.

## Tips

- Pull the hot-key list from access logs, not a hardcoded list. Traffic shifts; a list from 6 months ago warms the wrong keys.
- Bounded parallelism via `asyncio.Semaphore(20-50)` is the sweet spot — enough to finish quickly, not so much you DOS the source.
- For most caches, Redis RDB persistence (snapshot every 5 min) is the right level. The cache survives planned restarts and most crashes; warmup runs only after total-flush deploys.
- Pair warmup with source-load monitoring. If p95 latency climbs above steady-state during warmup, throttle — your warmup is hurting more than it helps.
- For staged rollouts of a new cache instance, shadow traffic (mirror live reads/writes to the new instance) is the production technique. The new cache fills naturally; cut over when its hit ratio matches.
- In Kubernetes, run warmup as a `postStart` hook OR have your `readinessProbe` block until warmup completes. Either way, no user traffic should hit a cold pod.

## Common Mistake

> [!warning] Hammering the source with high-parallelism warmup. A 1000-way concurrent fetch of the hot-key list slams the DB harder than steady-state traffic, tripping circuit breakers, timing out other services, possibly making the cold-cache symptoms worse than no warmup at all. Bound concurrency (`Semaphore`) AND monitor source latency; throttle when p95 climbs above baseline.

## Shorthand (Junior → Senior)

**Junior:**
```python
# 1000-way parallel — DOSes the source
await asyncio.gather(*(get_user(u) for u in HOT_USERS))
```

**Senior:**
```python
# Bounded + load-aware
controller = WarmupController(parallel=20, latency_p95_threshold_ms=200)
await controller.run(HOT_USERS)
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/_Index|Caching → Cache Patterns — stampede, keys, warmup, multi-tier]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

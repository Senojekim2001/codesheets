---
type: "entry"
domain: "python"
file: "caching"
section: "redis"
id: "redis-py-basics"
title: "redis-py — connect, get/set, pipelines, async, pools"
category: "Redis"
subtitle: "redis.Redis, from_url, decode_responses, set ex= / px=, pipeline, redis.asyncio, ConnectionPool, Retry, Sentinel, Cluster"
signature_short: "r = redis.Redis.from_url(\"redis://host:6379/0\", decode_responses=True); r.set(\"k\", \"v\", ex=60)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "redis-py — connect, get/set, pipelines, async, pools"
  - "redis-py-basics"
tags:
  - "python"
  - "python/caching"
  - "python/caching/redis"
  - "category/redis"
  - "tier/tiered"
---

# redis-py — connect, get/set, pipelines, async, pools

> redis.Redis, from_url, decode_responses, set ex= / px=, pipeline, redis.asyncio, ConnectionPool, Retry, Sentinel, Cluster

## Overview

redis-py is the official Python client. The model: a Client (sync `redis.Redis` or async `redis.asyncio.Redis`) wraps a connection pool; you call methods that mirror Redis commands; bytes come back unless `decode_responses=True`. Production deployments need a connection pool (don't open per-request), a retry policy (transient network errors are normal), and TLS for non-loopback connections. The three examples solve the SAME concrete task — a service caches user profiles in Redis with 60s TTL, batched on multi-key reads, with graceful degradation when Redis is offline — at three depths: literal `r.set`/`r.get` → connection pool + pipelines + async client → production with Sentinel HA, retry policy, prefix isolation, and circuit-breaker fallback.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cache user profiles in Redis with 60s TTL; get/set/delete.
- **Junior** — SAME — but with a connection pool, pipeline batched multi-key gets/sets, and an async client for an async web service.
- **Senior** — SAME — production: Sentinel HA (master+replica failover), retry policy on transient errors, key-prefix isolation per service, circuit-breaker fallback when Redis is offline.

## Signature

```python
r = redis.Redis.from_url("redis://host:6379/0", decode_responses=True); r.set("k", "v", ex=60)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cache user profiles in Redis with 60s TTL; get/set/delete.
# APPROACH  - redis.Redis.from_url() to connect; set with ex=60; get
#             returns the value or None on miss.
# STRENGTHS - Smallest correct example; one URL, no auth ceremony.
# WEAKNESSES- Single connection per call (no pool); bytes back unless
#             decode_responses=True.
import redis
import json

# Connect. decode_responses=True turns bytes into str on read.
r = redis.Redis.from_url(
    "redis://localhost:6379/0",
    decode_responses=True,
)

def cache_set_user(user_id: int, profile: dict) -> None:
    # set with ex= (seconds) sets a TTL; without it, key persists forever.
    r.set(f"user:{user_id}", json.dumps(profile), ex=60)

def cache_get_user(user_id: int) -> dict | None:
    raw = r.get(f"user:{user_id}")                    # None if missing
    return json.loads(raw) if raw else None

def cache_invalidate_user(user_id: int) -> None:
    r.delete(f"user:{user_id}")

# Use it.
cache_set_user(42, {"name": "Alice", "plan": "pro"})
print(cache_get_user(42))                              # {'name': 'Alice', ...}
print(cache_get_user(99))                              # None
cache_invalidate_user(42)
print(cache_get_user(42))                              # None

# Common gotcha: 'EX 0' would set a 0-second TTL — Redis errors instead.
# Always validate ttl > 0 before passing.

# Health check at startup.
try:
    r.ping()                                           # PONG
except redis.ConnectionError as e:
    print(f"redis offline: {e}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with a connection pool, pipeline batched
#             multi-key gets/sets, and an async client for an async
#             web service.
# APPROACH  - Module-level Redis client (one pool for the whole process);
#             pipeline() for batched ops; redis.asyncio for coroutines.
# STRENGTHS - Pool reuse → 100x lower latency than open-per-call;
#             pipeline cuts N round-trips to 1; async client is the same
#             API with await.
# WEAKNESSES- Pipeline silently coalesces errors — check for exceptions
#             in the result list.
import redis
import redis.asyncio as aredis
import json
from typing import Any

# 1) Sync pool — initialized once at import.
SYNC_POOL = redis.ConnectionPool.from_url(
    "redis://localhost:6379/0",
    decode_responses=True,
    max_connections=50,                               # cap on concurrent conns
)
r = redis.Redis(connection_pool=SYNC_POOL)

# 2) Pipeline: batch many commands in one round-trip.
def cache_set_users(users: dict[int, dict]) -> None:
    """Bulk-set N user profiles in ONE Redis round-trip."""
    pipe = r.pipeline(transaction=False)              # transaction=False: no MULTI/EXEC overhead
    for uid, profile in users.items():
        pipe.set(f"user:{uid}", json.dumps(profile), ex=60)
    pipe.execute()                                    # one network call

def cache_get_users(user_ids: list[int]) -> dict[int, dict | None]:
    """Bulk-get N user profiles. Use MGET for the simplest path."""
    keys = [f"user:{uid}" for uid in user_ids]
    raws = r.mget(keys)                               # one round-trip; returns list aligned with keys
    return {
        uid: (json.loads(raw) if raw else None)
        for uid, raw in zip(user_ids, raws)
    }

# 3) Async client — same API, different module.
ASYNC_POOL = aredis.ConnectionPool.from_url(
    "redis://localhost:6379/0",
    decode_responses=True,
    max_connections=50,
)
ar = aredis.Redis(connection_pool=ASYNC_POOL)

async def async_cache_get_user(user_id: int) -> dict | None:
    raw = await ar.get(f"user:{user_id}")
    return json.loads(raw) if raw else None

async def async_cache_set_user(user_id: int, profile: dict) -> None:
    await ar.set(f"user:{user_id}", json.dumps(profile), ex=60)

# 4) Hash type — store a profile as fields rather than a JSON blob.
def cache_set_user_hash(user_id: int, profile: dict) -> None:
    """HSET stores per-field; useful when you want to read one field
    without deserializing the whole blob (HGET) and update one field
    without rewriting (HSET key field value)."""
    r.hset(f"user:{user_id}:h", mapping=profile)
    r.expire(f"user:{user_id}:h", 60)                # TTL applies to whole hash

def cache_get_user_field(user_id: int, field: str) -> str | None:
    return r.hget(f"user:{user_id}:h", field)

# 5) Pipeline error handling — pipeline returns list[result | Exception]
#    when raise_on_error=False; default raises on first error.
def safe_bulk_set(values: dict[str, str]) -> int:
    pipe = r.pipeline(transaction=False)
    for k, v in values.items():
        pipe.set(k, v, ex=60)
    results = pipe.execute(raise_on_error=False)
    return sum(1 for r in results if not isinstance(r, Exception))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: Sentinel HA (master+replica failover),
#             retry policy on transient errors, key-prefix isolation
#             per service, circuit-breaker fallback when Redis is offline.
# APPROACH  - Sentinel discovers the current master automatically; retry
#             with exponential backoff on connection errors; namespace
#             keys ("svc:user:42"); a degrade() helper returns None on
#             unavailability so callers fall through to the source.
# STRENGTHS - Survives master failover transparently; transient blips
#             retry instead of erroring; service-level isolation; cache
#             outage doesn't take down the service.
# WEAKNESSES- Sentinel has its own network protocol; Cluster (sharded)
#             is a different topology with its own client config.
import os, time, logging
from typing import Any
import redis
from redis.sentinel import Sentinel
from redis.retry import Retry
from redis.backoff import ExponentialBackoff
from redis.exceptions import ConnectionError, TimeoutError, RedisError

log = logging.getLogger(__name__)

KEY_PREFIX = os.environ.get("CACHE_PREFIX", "svc:")

# 1) Sentinel-discovered master client.
def make_sentinel_client() -> redis.Redis:
    sentinels = [(host, 26379) for host in os.environ["SENTINEL_HOSTS"].split(",")]
    sentinel = Sentinel(
        sentinels,
        sentinel_kwargs={"socket_timeout": 2.0},
        socket_timeout=2.0,
        socket_connect_timeout=2.0,
    )
    master = sentinel.master_for(
        os.environ["SENTINEL_MASTER_NAME"],            # e.g. "mymaster"
        decode_responses=True,
        retry=Retry(ExponentialBackoff(base=0.1, cap=2.0), retries=3),
        retry_on_error=[ConnectionError, TimeoutError],
    )
    return master

# 2) Single client; injected at startup.
r = make_sentinel_client()

def k(suffix: str) -> str:
    return f"{KEY_PREFIX}{suffix}"

# 3) Circuit-breaker style — degrade gracefully when Redis is down.
class CacheUnavailable(Exception): ...

import threading
class CacheBreaker:
    """Trip after N consecutive errors; reset after RESET_AFTER seconds."""
    THRESHOLD = 5
    RESET_AFTER = 30.0

    def __init__(self):
        self._lock = threading.Lock()
        self._failures = 0
        self._tripped_until = 0.0

    def is_tripped(self) -> bool:
        with self._lock:
            return self._tripped_until > time.monotonic()

    def record_success(self) -> None:
        with self._lock:
            self._failures = 0

    def record_failure(self) -> None:
        with self._lock:
            self._failures += 1
            if self._failures >= self.THRESHOLD:
                self._tripped_until = time.monotonic() + self.RESET_AFTER
                log.warning("cache breaker TRIPPED for %ss", self.RESET_AFTER)

breaker = CacheBreaker()

def safe_get(key: str) -> Any:
    if breaker.is_tripped():
        return None
    try:
        v = r.get(k(key))
        breaker.record_success()
        return v
    except RedisError as e:
        breaker.record_failure()
        log.warning("cache get failed: %s", e)
        return None                                   # caller falls through to source

def safe_set(key: str, value: str, *, ex: int) -> None:
    if breaker.is_tripped():
        return
    try:
        r.set(k(key), value, ex=ex)
        breaker.record_success()
    except RedisError as e:
        breaker.record_failure()
        log.warning("cache set failed: %s", e)

# 4) Cluster client — different code path; sharded by key hash.
#    Use only if the data set exceeds a single node's RAM.
# from redis.cluster import RedisCluster
# rc = RedisCluster(
#     startup_nodes=[ClusterNode("node1", 6379), ClusterNode("node2", 6379)],
#     decode_responses=True,
#     read_from_replicas=True,                        # send reads to replicas
# )

# 5) TLS — production should always TLS to non-loopback Redis.
# r = redis.Redis(
#     host="redis.example.com", port=6380, ssl=True,
#     ssl_cert_reqs="required", ssl_ca_certs="/etc/ssl/redis-ca.pem",
#     username="cache-user", password=os.environ["REDIS_PASSWORD"],  # ACL since 6.0
# )

# Decision rule:
#   single Redis instance              -> redis.Redis.from_url; pool via ConnectionPool
#   need HA / failover                 -> Sentinel (Sentinel.master_for) — auto-discovers master
#   data exceeds one node              -> Cluster (RedisCluster); sharded; mind cross-slot ops
#   batched set/get                    -> pipeline(transaction=False); 100× round-trip cut
#   atomic multi-step                  -> pipeline().multi() ... .execute() (MULTI/EXEC)
#   async service                      -> redis.asyncio.Redis — same API
#   cache offline must NOT down svc    -> circuit breaker; safe_get returns None on errors
#   transient network errors           -> Retry(ExponentialBackoff(...)) on the client
#   service isolation                  -> KEY_PREFIX namespace per service
#   TLS                                 -> ssl=True + ssl_ca_certs; required for non-loopback
#   ACL / IAM                           -> username= + password= (Redis 6.0+); rotate via env
#   need streams / pubsub              -> r.pubsub() / r.xadd; different command surface
#
# Anti-pattern: opening a fresh Redis connection per request (e.g.,
# redis.Redis(host=...) inside a handler). Each one performs a TCP
# handshake (~1ms loopback, 1-10ms remote); under load you saturate
# Redis's accept queue. Always use a module-level client backed by a
# ConnectionPool — one pool per process, sized to your concurrency.
```

## Decision Rule

```text
single Redis instance              -> redis.Redis.from_url; pool via ConnectionPool
need HA / failover                 -> Sentinel (Sentinel.master_for) — auto-discovers master
data exceeds one node              -> Cluster (RedisCluster); sharded; mind cross-slot ops
batched set/get                    -> pipeline(transaction=False); 100× round-trip cut
atomic multi-step                  -> pipeline().multi() ... .execute() (MULTI/EXEC)
async service                      -> redis.asyncio.Redis — same API
cache offline must NOT down svc    -> circuit breaker; safe_get returns None on errors
transient network errors           -> Retry(ExponentialBackoff(...)) on the client
service isolation                  -> KEY_PREFIX namespace per service
TLS                                 -> ssl=True + ssl_ca_certs; required for non-loopback
ACL / IAM                           -> username= + password= (Redis 6.0+); rotate via env
need streams / pubsub              -> r.pubsub() / r.xadd; different command surface
```

## Anti-Pattern

> [!warning] Anti-pattern
> opening a fresh Redis connection per request (e.g.,
> redis.Redis(host=...) inside a handler). Each one performs a TCP
> handshake (~1ms loopback, 1-10ms remote); under load you saturate
> Redis's accept queue. Always use a module-level client backed by a
> ConnectionPool — one pool per process, sized to your concurrency.

## Tips

- Always use a connection pool — `redis.Redis.from_url` builds one by default. Per-call connections destroy throughput because each one performs a TCP+AUTH handshake.
- `decode_responses=True` returns `str` instead of `bytes`. Pick one and stick with it; mixing makes serialization bugs subtle.
- For multi-key reads use `r.mget(keys)` — one round-trip, results aligned with the input list. For mixed commands use `r.pipeline(transaction=False).execute()`.
- `pipeline(transaction=False)` skips MULTI/EXEC — fine for "batch these commands"; `transaction=True` for "all-or-nothing atomicity". Default is True; explicitly set False for caching workloads.
- For HA, use Sentinel-discovered clients (`Sentinel.master_for`) — failover is transparent. For sharded data sets, use `RedisCluster`; mind cross-slot pipelines (force them onto the same shard with `{tag}` hash tags).
- Wrap client calls in a circuit breaker that returns None on errors. A cache outage that crashes your service is a worse failure mode than running uncached.

## Common Mistake

> [!warning] Opening a fresh `redis.Redis(host=...)` per request inside a handler. Each one performs a TCP+AUTH handshake (~1ms loopback, 1-10ms remote); under load you saturate Redis's accept queue, hit `MaxClientsReached`, and your service starts erroring. Use a module-level client backed by a ConnectionPool — one pool per process, sized to your concurrency.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-call client — handshake + AUTH every time
def get_user(uid):
    r = redis.Redis(host="redis", port=6379)
    return r.get(f"user:{uid}")
```

**Senior:**
```python
# Module-level client; pool reused across calls
r = redis.Redis.from_url(URL, decode_responses=True, max_connections=50)
def get_user(uid):
    return r.get(f"user:{uid}")
```

## See Also

- [[Sections/caching/redis/cache-aside-pattern|Cache-aside — read-through with fallback to source (Caching)]]
- [[Sections/caching/redis/cache-invalidation|Cache invalidation — delete, version, tag, pub/sub fanout (Caching)]]
- [[Sections/caching/redis/_Index|Caching → Redis — distributed cache, patterns, invalidation]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

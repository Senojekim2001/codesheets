---
type: "entry"
domain: "python"
file: "caching"
section: "redis"
id: "cache-aside-pattern"
title: "Cache-aside — read-through with fallback to source"
category: "Redis"
subtitle: "try cache → miss → source → set; SETNX single-flight lock; XFETCH probabilistic early refresh; negative caching; cache version prefix"
signature_short: "@cache_aside(ttl=60, key_fn=lambda uid: f\"user:{uid}\") def get_user(uid: int) -> dict: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cache-aside — read-through with fallback to source"
  - "cache-aside-pattern"
tags:
  - "python"
  - "python/caching"
  - "python/caching/redis"
  - "category/redis"
  - "tier/tiered"
---

# Cache-aside — read-through with fallback to source

> try cache → miss → source → set; SETNX single-flight lock; XFETCH probabilistic early refresh; negative caching; cache version prefix

## Overview

Cache-aside (also called "lazy loading") is the cache pattern most services use: callers ask the cache first; if it's missing, the application fetches from the source, populates the cache, and returns. Versus write-through ("write goes to cache + source together"), cache-aside is simpler and tolerates cache outages — the worst case is a slow request, not a wrong one. The hard parts are STAMPEDE PROTECTION (when a hot key expires, every concurrent request races to recompute) and PROBABILISTIC EARLY REFRESH (a single background refresh prevents the synchronized expiration). The three examples solve the SAME concrete task — `get_user(uid)` checks cache, falls back to DB on miss, populates cache for next time — at three depths: inline pattern → decorator with TTL + key function + observability → production with single-flight SETNX lock for stampede prevention + XFETCH probabilistic early refresh + negative caching + version prefix.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — get_user(uid): try cache → if miss, fetch from DB → populate cache → return.
- **Junior** — SAME — but a reusable @cache_aside decorator with custom key function, TTL, hit/miss logging, and graceful fallback when Redis is offline.
- **Senior** — SAME — production: prevent cache stampedes via SETNX single-flight lock, probabilistic early refresh (XFETCH), cache the "not-found" result (negative caching), atomic deploy via cache version prefix.

## Signature

```python
@cache_aside(ttl=60, key_fn=lambda uid: f"user:{uid}") def get_user(uid: int) -> dict: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - get_user(uid): try cache → if miss, fetch from DB →
#             populate cache → return.
# APPROACH  - Linear if/then; one explicit set after the source call.
# STRENGTHS - Minimal correct cache-aside; you can read it top-to-bottom.
# WEAKNESSES- Cache-stampede risk on hot keys (see senior tier);
#             no TTL jitter; no observability.
import json
import redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

def db_fetch_user(user_id: int) -> dict:
    print(f"[DB] fetching user {user_id}")
    return {"id": user_id, "name": f"u{user_id}"}     # the expensive call

def get_user(user_id: int) -> dict:
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)                     # cache HIT
    user = db_fetch_user(user_id)                     # MISS -> fall through to source
    r.set(key, json.dumps(user), ex=60)               # populate cache
    return user

# Use it.
get_user(42)                                           # MISS, prints [DB]
get_user(42)                                           # HIT, no print
# 60s later: MISS again.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but a reusable @cache_aside decorator with custom
#             key function, TTL, hit/miss logging, and graceful fallback
#             when Redis is offline.
# APPROACH  - Decorator factory; key_fn maps args to a cache key;
#             ConnectionError caught so callers always get a result.
# STRENGTHS - One decorator covers every cached function in the codebase;
#             logs are structured for observability; cache outage
#             degrades to "slow", not "down".
# WEAKNESSES- Still no stampede protection; concurrent calls on a hot
#             missing key all hit the DB simultaneously.
import json
import logging
import functools
from typing import Callable, Any
import redis

log = logging.getLogger(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

def cache_aside(*, ttl: int, key_fn: Callable[..., str]):
    """Decorate a function with cache-aside semantics."""
    def deco(fn: Callable[..., Any]):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            try:
                cached = r.get(key)
                if cached is not None:
                    log.debug("cache_hit", extra={"key": key})
                    return json.loads(cached)
            except redis.ConnectionError as e:
                log.warning("cache_get_failed", extra={"key": key, "err": str(e)})
                # Fall through — return source value, don't fail.

            value = fn(*args, **kwargs)               # source call
            try:
                r.set(key, json.dumps(value), ex=ttl)
                log.debug("cache_set", extra={"key": key, "ttl": ttl})
            except redis.ConnectionError as e:
                log.warning("cache_set_failed", extra={"key": key, "err": str(e)})
            return value
        return wrapper
    return deco

# Use it.
@cache_aside(ttl=60, key_fn=lambda uid: f"user:{uid}")
def get_user(user_id: int) -> dict:
    print(f"[DB] fetching user {user_id}")
    return {"id": user_id, "name": f"u{user_id}"}

# Multiple cached functions sharing the same Redis client.
@cache_aside(ttl=300, key_fn=lambda key: f"settings:{key}")
def get_settings(key: str) -> dict:
    print(f"[DB] settings {key}")
    return {"key": key, "value": "..."}

# Force-invalidate one key — useful after writes.
def invalidate_user(user_id: int) -> None:
    r.delete(f"user:{user_id}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: prevent cache stampedes via SETNX
#             single-flight lock, probabilistic early refresh (XFETCH),
#             cache the "not-found" result (negative caching), atomic
#             deploy via cache version prefix.
# APPROACH  - On miss, try SETNX a lock key; if you got the lock,
#             recompute and write; if not, briefly wait and retry.
#             XFETCH refreshes a small fraction of accesses BEFORE
#             expiry, decoupling the spike. Negative cache uses a
#             sentinel value with shorter TTL.
# STRENGTHS - Hot keys don't trigger N concurrent DB queries on expire;
#             refresh load is spread continuously; "not found" doesn't
#             slam the DB on every access.
# WEAKNESSES- More moving parts; for cold/rare keys the simpler junior
#             tier is enough.
import json, time, math, random, hashlib
import functools, logging
from typing import Callable, Any
import redis

log = logging.getLogger(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

CACHE_VERSION = "v3"                                  # bump to invalidate ALL keys at deploy
NEG_CACHE_SENTINEL = "__NEG__"
NEG_CACHE_TTL = 10                                    # short — neg results may become positive

def _versioned_key(key: str) -> str:
    return f"{CACHE_VERSION}:{key}"

# 1) Single-flight: only one concurrent caller does the work.
def _try_acquire_lock(lock_key: str, *, ttl_ms: int = 5000) -> bool:
    """SET NX PX — sets only if not exists, with millisecond TTL."""
    return bool(r.set(lock_key, "1", nx=True, px=ttl_ms))

def _release_lock(lock_key: str) -> None:
    r.delete(lock_key)

# 2) XFetch probabilistic early refresh.
#    Idea: store value with delta (time it took to compute). On read,
#    compute fresh = now - delta * beta * ln(rand()). If fresh > expiry,
#    THIS request triggers a refresh — but ONE request, not the wave
#    that hits when the key actually expires.
def _xfetch_should_refresh(delta_s: float, expiry_unix: float, *, beta: float = 1.0) -> bool:
    now = time.time()
    if expiry_unix - now < 0:
        return True                                   # actually expired
    rand = random.random()
    if rand <= 0:
        return True
    fresh = -delta_s * beta * math.log(rand)
    return now + fresh >= expiry_unix

def cache_aside_robust(*, ttl: int, key_fn: Callable[..., str], beta: float = 1.0):
    def deco(fn: Callable[..., Any]):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = _versioned_key(key_fn(*args, **kwargs))
            lock_key = f"{key}:lock"
            try:
                cached = r.get(key)
                if cached is not None:
                    payload = json.loads(cached)
                    if payload == NEG_CACHE_SENTINEL:
                        return None                   # negative cache hit
                    # Probabilistic refresh check.
                    if not _xfetch_should_refresh(
                        delta_s=payload["delta"],
                        expiry_unix=payload["expiry"],
                        beta=beta,
                    ):
                        return payload["value"]       # use cached value, no refresh

                # MISS or early-refresh path — try single-flight.
                if _try_acquire_lock(lock_key):
                    try:
                        return _compute_and_set(fn, args, kwargs, key, ttl)
                    finally:
                        _release_lock(lock_key)
                else:
                    # Another caller is computing; wait briefly + retry cache.
                    for _ in range(5):
                        time.sleep(0.05)
                        cached = r.get(key)
                        if cached is not None:
                            payload = json.loads(cached)
                            if payload == NEG_CACHE_SENTINEL:
                                return None
                            return payload["value"]
                    # Lock holder didn't finish; fall back to direct call.
                    return _compute_and_set(fn, args, kwargs, key, ttl)
            except redis.RedisError as e:
                log.warning("cache_error_falling_through", extra={"err": str(e)})
                return fn(*args, **kwargs)            # graceful degrade
        return wrapper
    return deco

def _compute_and_set(fn, args, kwargs, key: str, ttl: int):
    started = time.time()
    try:
        value = fn(*args, **kwargs)
    except KeyError:                                   # not found in source
        # Negative cache.
        r.set(key, json.dumps(NEG_CACHE_SENTINEL), ex=NEG_CACHE_TTL)
        return None
    delta = time.time() - started
    payload = {"value": value, "delta": delta, "expiry": time.time() + ttl}
    r.set(key, json.dumps(payload), ex=ttl)
    return value

# 3) Use it on a hot path.
@cache_aside_robust(ttl=60, key_fn=lambda uid: f"user:{uid}", beta=1.0)
def get_user(user_id: int) -> dict:
    if user_id == 999:
        raise KeyError(user_id)                       # triggers negative cache
    return {"id": user_id, "name": f"u{user_id}"}

# Decision rule:
#   simple cache, no contention          -> intro/junior pattern; SETNX is overkill
#   hot key (>10 req/s on miss)          -> single-flight SETNX lock
#   want zero stampede risk              -> XFETCH probabilistic refresh + SETNX
#   "not found" hits source repeatedly  -> negative cache (short TTL on a sentinel)
#   need to invalidate everything at deploy -> CACHE_VERSION prefix; bump on deploy
#   cache outage must NOT 500            -> wrap in try/except RedisError; fall to source
#   stampede protection at scale         -> XFETCH (preventive) > SETNX (reactive)
#   cache write order matters            -> NOT cache-aside; use write-through or pub/sub invalidation
#   strict consistency with source       -> NOT cache-aside; cache is eventually consistent
#   need cross-process coordination      -> use a real lock (RedLock); SETNX is basic
#
# Anti-pattern: cache-aside without stampede protection on a hot key.
# When the key expires, EVERY request that misses fires a DB query at
# the same time. A 100 RPS hot endpoint at 60s TTL produces ~1-3 second
# DB CPU spikes every minute as 100 concurrent queries pile on. SETNX
# single-flight lock or XFETCH early refresh costs ~5 lines; pays for
# itself the first time the DB starts erroring under cache-expiry
# bursts.
```

## Decision Rule

```text
simple cache, no contention          -> intro/junior pattern; SETNX is overkill
hot key (>10 req/s on miss)          -> single-flight SETNX lock
want zero stampede risk              -> XFETCH probabilistic refresh + SETNX
"not found" hits source repeatedly  -> negative cache (short TTL on a sentinel)
need to invalidate everything at deploy -> CACHE_VERSION prefix; bump on deploy
cache outage must NOT 500            -> wrap in try/except RedisError; fall to source
stampede protection at scale         -> XFETCH (preventive) > SETNX (reactive)
cache write order matters            -> NOT cache-aside; use write-through or pub/sub invalidation
strict consistency with source       -> NOT cache-aside; cache is eventually consistent
need cross-process coordination      -> use a real lock (RedLock); SETNX is basic
```

## Anti-Pattern

> [!warning] Anti-pattern
> cache-aside without stampede protection on a hot key.
> When the key expires, EVERY request that misses fires a DB query at
> the same time. A 100 RPS hot endpoint at 60s TTL produces ~1-3 second
> DB CPU spikes every minute as 100 concurrent queries pile on. SETNX
> single-flight lock or XFETCH early refresh costs ~5 lines; pays for
> itself the first time the DB starts erroring under cache-expiry
> bursts.

## Tips

- For most call sites, the junior-tier `@cache_aside` decorator is the right level. Reach for SETNX/XFETCH only when you have a hot key the cache stampede actually hurts.
- Always wrap cache calls in `try/except RedisError`. The whole point of cache-aside is that the source still works when the cache is offline; let it.
- A `CACHE_VERSION` prefix (`v3:user:42`) is the cheapest "invalidate everything" mechanism. Bump on deploys that change the cached object's shape.
- Negative caching prevents "not found" lookups from hitting the source on every access. Use a sentinel value and a SHORTER TTL than positive entries — neg results may become positive when data appears.
- XFETCH (probabilistic early refresh) is the production stampede prevention pattern. A tiny fraction of accesses just before TTL expire trigger a refresh; the actual expiry never bursts. Read the original "XFetch" paper for the math.
- Add hit/miss/error counters per cached function. The hit ratio tells you whether the TTL is right; error rate tells you when Redis is unhappy.

## Common Mistake

> [!warning] Cache-aside on a hot key without stampede protection. When a key with 100 RPS expires at 60s TTL, every concurrent request misses and hits the DB simultaneously — ~100 concurrent queries, repeating every minute. SETNX single-flight or XFETCH early refresh costs five lines; pays for itself the first time the DB starts erroring under cache-expiry bursts.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Hot-key stampede — 100 concurrent DB queries every minute
def get_user(uid):
    if (v := r.get(f"user:{uid}")):
        return json.loads(v)
    user = db_fetch(uid)            # 100 callers all here at expiry
    r.set(f"user:{uid}", json.dumps(user), ex=60)
    return user
```

**Senior:**
```python
# SETNX lock — only ONE caller computes; rest wait briefly + retry
@cache_aside_robust(ttl=60, key_fn=lambda u: f"user:{u}")
def get_user(uid): ...
```

## See Also

- [[Sections/caching/redis/redis-py-basics|redis-py — connect, get/set, pipelines, async, pools (Caching)]]
- [[Sections/caching/redis/cache-invalidation|Cache invalidation — delete, version, tag, pub/sub fanout (Caching)]]
- [[Sections/caching/redis/_Index|Caching → Redis — distributed cache, patterns, invalidation]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

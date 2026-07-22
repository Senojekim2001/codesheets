---
type: "entry"
domain: "python"
file: "caching"
section: "patterns"
id: "cache-stampede"
title: "Cache stampede — single-flight, XFETCH, request coalescing"
category: "Patterns"
subtitle: "thundering herd, SETNX with PX, lock TTL + jitter, XFETCH probabilistic early refresh, asyncio.Lock per key, soft-TTL + background refresh"
signature_short: "if r.set(lock_key, \"1\", nx=True, px=5000): compute_and_set() else: wait_then_retry()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cache stampede — single-flight, XFETCH, request coalescing"
  - "cache-stampede"
tags:
  - "python"
  - "python/caching"
  - "python/caching/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Cache stampede — single-flight, XFETCH, request coalescing

> thundering herd, SETNX with PX, lock TTL + jitter, XFETCH probabilistic early refresh, asyncio.Lock per key, soft-TTL + background refresh

## Overview

Cache stampede (a.k.a. thundering herd, dog-piling) is the failure mode where a hot cache key expires and every concurrent request misses + recomputes simultaneously. A 100 RPS endpoint at 60s TTL produces ~100 concurrent source queries every minute at expiry. Three mitigations, in increasing strength: SETNX single-flight (one caller wins the lock, the rest briefly wait then retry), XFETCH probabilistic early refresh (a small fraction of accesses pre-expire trigger refresh, decoupling the spike), asyncio.Lock per-key coalescing (in-process: 1000 concurrent calls become one source call). The three examples solve the SAME concrete task — `get_user(uid)` is the hot path; prevent the stampede when its cached value expires — at three depths: demonstrate the bug → SETNX single-flight with timeout/jitter → XFETCH probabilistic refresh + per-key asyncio.Lock + soft-TTL background refresh.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Demonstrate the cache-stampede problem before fixing it.
- **Junior** — SAME hot path — but only ONE caller computes; the rest briefly wait + retry the cache.
- **Senior** — SAME — production-grade: XFETCH probabilistic early refresh eliminates the expiry spike entirely; in-process asyncio.Lock coalesces requests within the same process before they reach Redis at all.

## Signature

```python
if r.set(lock_key, "1", nx=True, px=5000): compute_and_set() else: wait_then_retry()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Demonstrate the cache-stampede problem before fixing it.
# APPROACH  - Plain cache-aside; observe N concurrent calls all hit DB
#             when the key is missing.
# STRENGTHS - Reproducible test that shows the bug clearly.
# WEAKNESSES- Don't ship this; junior tier has the SETNX fix.
import asyncio, json, time
import redis.asyncio as aredis

r = aredis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# Simulated DB call — slow + counts how often we hit it.
db_calls = 0
async def db_fetch_user(uid: int) -> dict:
    global db_calls
    db_calls += 1
    await asyncio.sleep(0.5)                          # 500ms — the cost we're trying to avoid
    return {"id": uid, "name": f"u{uid}"}

# Plain cache-aside — vulnerable.
async def get_user(uid: int) -> dict:
    key = f"user:{uid}"
    cached = await r.get(key)
    if cached:
        return json.loads(cached)
    user = await db_fetch_user(uid)                   # 100 concurrent callers all here
    await r.set(key, json.dumps(user), ex=60)
    return user

# Reproduce: 100 concurrent calls on a missing key.
async def stampede_demo():
    global db_calls
    db_calls = 0
    await r.delete("user:42")                         # ensure miss
    started = time.monotonic()
    results = await asyncio.gather(*(get_user(42) for _ in range(100)))
    elapsed = time.monotonic() - started
    print(f"db_calls={db_calls}, elapsed={elapsed:.2f}s, results all equal: {len(set(json.dumps(r) for r in results))==1}")

# asyncio.run(stampede_demo())
# Output:
#   db_calls=100, elapsed=0.51s, results all equal: True
#
# 100 DB queries when 1 would have sufficed. At 500ms/query, the DB CPU
# spikes; under real load, the DB starts erroring; backpressure cascades
# to other endpoints; the cache miss takes the whole service down.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME hot path — but only ONE caller computes; the rest
#             briefly wait + retry the cache.
# APPROACH  - SETNX (Redis: SET key value NX PX ttl) acquires a short-
#             lived lock for the key. Lock holder computes + sets the
#             cache. Losers poll the cache for the result.
# STRENGTHS - The classic single-flight pattern. Works distributed
#             (locks are in Redis, every process sees them).
# WEAKNESSES- Lock-holder dies -> losers poll until lock TTL expires
#             (5s here). Add jitter to the polling so all losers don't
#             retry simultaneously.
import asyncio, json, random, time
import redis.asyncio as aredis

r = aredis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

db_calls = 0
async def db_fetch_user(uid: int) -> dict:
    global db_calls
    db_calls += 1
    await asyncio.sleep(0.5)
    return {"id": uid, "name": f"u{uid}"}

LOCK_TTL_MS = 5_000                                   # max time we expect the source call to take
POLL_BUDGET_S = 6.0                                   # how long losers wait before giving up

async def get_user(uid: int) -> dict:
    key = f"user:{uid}"
    lock_key = f"{key}:lock"

    # Fast path: cache HIT.
    if (cached := await r.get(key)):
        return json.loads(cached)

    # Try to acquire the lock.
    got_lock = await r.set(lock_key, "1", nx=True, px=LOCK_TTL_MS)
    if got_lock:
        try:
            user = await db_fetch_user(uid)
            await r.set(key, json.dumps(user), ex=60)
            return user
        finally:
            await r.delete(lock_key)
    else:
        # We didn't get the lock — another caller is computing.
        # Poll the cache with jittered backoff.
        deadline = time.monotonic() + POLL_BUDGET_S
        while time.monotonic() < deadline:
            await asyncio.sleep(0.02 + random.uniform(0, 0.03))   # 20-50ms with jitter
            if (cached := await r.get(key)):
                return json.loads(cached)
        # Lock holder may have died; fall back to a direct call.
        # (Risk: if many losers reach this branch, we have a smaller stampede.)
        return await db_fetch_user(uid)

# Reproduce: 100 concurrent calls.
async def reduced_stampede_demo():
    global db_calls
    db_calls = 0
    await r.delete("user:42")
    started = time.monotonic()
    await asyncio.gather(*(get_user(42) for _ in range(100)))
    elapsed = time.monotonic() - started
    print(f"db_calls={db_calls}, elapsed={elapsed:.2f}s")
    # Expected: db_calls=1, elapsed≈0.55s (the source call + a bit of polling)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: XFETCH probabilistic early refresh
#             eliminates the expiry spike entirely; in-process asyncio.Lock
#             coalesces requests within the same process before they
#             reach Redis at all.
# APPROACH  - XFETCH stores delta (compute time) with the value; reads
#             check whether to refresh BEFORE expiry. asyncio.Lock per
#             key collapses concurrent in-process calls to one. SETNX
#             remains as the cross-process backstop.
# STRENGTHS - Three layers: in-process Lock → XFETCH (preventive) →
#             SETNX (reactive). The TTL expiry burst NEVER hits the
#             source.
# WEAKNESSES- More machinery; for cold/rare keys, junior tier is fine.
import asyncio, json, math, random, time
import redis.asyncio as aredis

r = aredis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# 1) In-process per-key locks (collapse concurrent calls in this process).
_inflight: dict[str, asyncio.Future] = {}

async def coalesced_call(key: str, fn):
    """If another coroutine is already computing for this key, await its future."""
    if key in _inflight:
        return await _inflight[key]
    fut = asyncio.get_running_loop().create_future()
    _inflight[key] = fut
    try:
        result = await fn()
        fut.set_result(result)
        return result
    except BaseException as e:
        fut.set_exception(e)
        raise
    finally:
        _inflight.pop(key, None)

# 2) XFETCH probabilistic early refresh.
def xfetch_should_refresh(*, delta_s: float, expiry_unix: float, beta: float = 1.0) -> bool:
    now = time.time()
    if expiry_unix - now < 0:
        return True
    rand = random.random()
    if rand <= 0:
        return True
    fresh = -delta_s * beta * math.log(rand)
    return now + fresh >= expiry_unix

# 3) Simulated DB.
db_calls = 0
async def db_fetch_user(uid: int) -> dict:
    global db_calls
    db_calls += 1
    await asyncio.sleep(0.5)
    return {"id": uid, "name": f"u{uid}"}

LOCK_TTL_MS = 5_000
TTL_S = 60

async def get_user(uid: int) -> dict:
    key = f"user:{uid}"
    return await coalesced_call(key, lambda: _get_user_uncoalesced(uid, key))

async def _get_user_uncoalesced(uid: int, key: str) -> dict:
    # Read cached payload (value + delta + expiry).
    cached = await r.get(key)
    if cached:
        payload = json.loads(cached)
        if not xfetch_should_refresh(delta_s=payload["delta"], expiry_unix=payload["expiry"]):
            return payload["value"]                   # use cached, no refresh

    # Refresh path — try cross-process single-flight via SETNX.
    lock_key = f"{key}:lock"
    if await r.set(lock_key, "1", nx=True, px=LOCK_TTL_MS):
        try:
            return await _compute_and_set(uid, key)
        finally:
            await r.delete(lock_key)

    # Another caller is refreshing; if we have ANY cached value, return it
    # (XFETCH guarantees the still-cached value isn't expired).
    if cached:
        return json.loads(cached)["value"]

    # No cached value and we lost the lock — wait briefly + retry.
    for _ in range(15):
        await asyncio.sleep(0.05 + random.uniform(0, 0.05))
        if (c := await r.get(key)):
            return json.loads(c)["value"]
    # Lock holder died; direct call.
    return await _compute_and_set(uid, key)

async def _compute_and_set(uid: int, key: str) -> dict:
    started = time.time()
    value = await db_fetch_user(uid)
    delta = time.time() - started
    payload = {"value": value, "delta": delta, "expiry": time.time() + TTL_S}
    await r.set(key, json.dumps(payload), ex=TTL_S)
    return value

# 4) Soft-TTL + background refresh — alternative for very hot keys.
#    Idea: serve the cached value (even if "soft-expired"); a background
#    task refreshes asynchronously. The user NEVER waits; the source
#    sees only background refresh load.
SOFT_TTL_S, HARD_TTL_S = 30, 60
async def get_user_softttl(uid: int) -> dict:
    key = f"user:{uid}"
    if (cached := await r.get(key)):
        payload = json.loads(cached)
        if time.time() > payload["soft_expiry"] and key not in _inflight:
            asyncio.create_task(coalesced_call(key, lambda: _refresh_softttl(uid, key)))
        return payload["value"]                       # always return immediately
    # No cached value at all — fall back to coalesced fetch.
    return await get_user(uid)

async def _refresh_softttl(uid: int, key: str) -> dict:
    value = await db_fetch_user(uid)
    payload = {"value": value, "soft_expiry": time.time() + SOFT_TTL_S}
    await r.set(key, json.dumps(payload), ex=HARD_TTL_S)
    return value

# Decision rule:
#   cold/rare key                       -> plain cache-aside; no protection needed
#   warm/hot key (>10 RPS on miss)      -> SETNX single-flight (junior tier)
#   very hot key (>100 RPS)             -> XFETCH + SETNX + in-process coalesce
#   never-block-the-user latency-critical -> soft-TTL + background refresh
#   single-process service              -> asyncio.Lock per key is enough
#   multi-process / multi-host          -> SETNX (locks live in Redis; everyone sees them)
#   lock-holder dies mid-refresh        -> short LOCK_TTL_MS; losers re-attempt after expiry
#   thundering herd of timeouts         -> add jitter to the loser-poll backoff
#   simple expiry, low traffic          -> XFETCH overkill; junior tier is right
#   need to know "is this hot?"          -> tracking + auto-promote: simple keys → SETNX → XFETCH
#
# Anti-pattern: holding a per-key asyncio.Lock for the WHOLE compute,
# including external IO, while not setting any timeout. If the source
# call hangs, every caller for that key hangs forever. Always pair
# in-process Locks with asyncio.wait_for(...) timeouts; pair Redis
# SETNX locks with PX TTL (auto-expire) so a dead lock holder can't
# deadlock the cluster.
```

## Decision Rule

```text
cold/rare key                       -> plain cache-aside; no protection needed
warm/hot key (>10 RPS on miss)      -> SETNX single-flight (junior tier)
very hot key (>100 RPS)             -> XFETCH + SETNX + in-process coalesce
never-block-the-user latency-critical -> soft-TTL + background refresh
single-process service              -> asyncio.Lock per key is enough
multi-process / multi-host          -> SETNX (locks live in Redis; everyone sees them)
lock-holder dies mid-refresh        -> short LOCK_TTL_MS; losers re-attempt after expiry
thundering herd of timeouts         -> add jitter to the loser-poll backoff
simple expiry, low traffic          -> XFETCH overkill; junior tier is right
need to know "is this hot?"          -> tracking + auto-promote: simple keys → SETNX → XFETCH
```

## Anti-Pattern

> [!warning] Anti-pattern
> holding a per-key asyncio.Lock for the WHOLE compute,
> including external IO, while not setting any timeout. If the source
> call hangs, every caller for that key hangs forever. Always pair
> in-process Locks with asyncio.wait_for(...) timeouts; pair Redis
> SETNX locks with PX TTL (auto-expire) so a dead lock holder can't
> deadlock the cluster.

## Tips

- Cold keys (rare access) don't stampede; the simple cache-aside is fine. Reach for SETNX/XFETCH only for keys that are demonstrably hot. Adding stampede protection to every key is over-engineering.
- SETNX lock TTL must be longer than your worst-case source call but short enough to recover from a dead lock holder. 5-30 seconds is typical; pair with operation-level timeouts.
- XFETCH (probabilistic early refresh) is the modern preventive pattern. The math: small fraction of accesses just before TTL trigger refresh, distributing the work in time and never producing a wave at expiry.
- In-process `asyncio.Lock` per key (or a shared `_inflight: dict` of futures) collapses concurrent in-process callers to one source call BEFORE they hit Redis. Free first-line defense.
- Soft-TTL + background refresh is the right pattern for "the user must never wait". The cached value is always served; a background task refreshes asynchronously. Source sees only background load; users see consistent latency.
- Always add JITTER to wait/poll loops — without it, every loser retries simultaneously and you create a smaller stampede on the lock retry.

## Common Mistake

> [!warning] Holding a per-key `asyncio.Lock` for the WHOLE compute including external IO without a timeout. If the source call hangs, every concurrent caller for that key hangs forever — your service stops responding for that key. Always pair in-process Locks with `asyncio.wait_for(timeout=...)`; pair Redis SETNX locks with PX TTL (auto-expire) so a dead lock holder can't deadlock the cluster.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Lock without timeout — one slow source call = service freeze
async with key_lock:
    return await db_fetch(key)
```

**Senior:**
```python
# Lock with timeout + Redis SETNX with PX TTL
async with key_lock:
    return await asyncio.wait_for(db_fetch(key), timeout=5.0)
# Cross-process: SET key NX PX 5000  (auto-expires)
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/_Index|Caching → Cache Patterns — stampede, keys, warmup, multi-tier]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

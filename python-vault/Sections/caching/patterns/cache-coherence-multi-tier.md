---
type: "entry"
domain: "python"
file: "caching"
section: "patterns"
id: "cache-coherence-multi-tier"
title: "Multi-tier cache — L1 (in-process) + L2 (Redis) coherence"
category: "Patterns"
subtitle: "L1 TTLCache 5s + L2 Redis 60s + DB; cascade reads, propagated invalidation, refresh-after-write, per-tier TTL discipline, fault isolation"
signature_short: "L1 (5s) -> L2 Redis (60s) -> DB ;  read cascades down ; write invalidates L1+L2 + pubsub fanout"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Multi-tier cache — L1 (in-process) + L2 (Redis) coherence"
  - "cache-coherence-multi-tier"
tags:
  - "python"
  - "python/caching"
  - "python/caching/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Multi-tier cache — L1 (in-process) + L2 (Redis) coherence

> L1 TTLCache 5s + L2 Redis 60s + DB; cascade reads, propagated invalidation, refresh-after-write, per-tier TTL discipline, fault isolation

## Overview

Multi-tier caching is the production answer to "the network round-trip to Redis is now the bottleneck". L1 (in-process `TTLCache`, 5-second TTL) absorbs the vast majority of repeated reads; L2 (Redis, 60s) catches the rest; the DB serves only what neither has. The discipline is staleness budget and write order: a write must invalidate L1 in this process AND fan out to L1 in every other process via Redis pub/sub, while also clearing L2 — in the right order, atomically. The three examples solve the SAME concrete task — `get_user(uid)` cascades L1 → L2 → DB; `update_user` invalidates both tiers across all instances within ~10ms — at three depths: simple wrapper class with read cascade and write invalidation → bus invalidation via Redis pub/sub for fleet-wide L1 clear → production with refresh-after-write semantics, fault isolation, per-tier observability, and the staleness-budget calculation.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — get_user(uid) cascades L1 -> L2 (Redis) -> DB; update clears both tiers in this process.
- **Junior** — SAME — but propagate L1 invalidation across all processes via Redis pub/sub. A write in process A clears L1 in every process within ~10ms.
- **Senior** — SAME — production: refresh-after-write semantics, per-tier observability, fault isolation (L1 alive when L2 down, L2 alive when DB slow), staleness-budget calculation.

## Signature

```python
L1 (5s) -> L2 Redis (60s) -> DB ;  read cascades down ; write invalidates L1+L2 + pubsub fanout
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - get_user(uid) cascades L1 -> L2 (Redis) -> DB; update
#             clears both tiers in this process.
# APPROACH  - In-process TTLCache (5s) as L1; Redis (60s) as L2; on
#             write, clear L1 + delete L2 key + DB write.
# STRENGTHS - L1 cuts ~99% of repeated reads at zero network cost.
# WEAKNESSES- Doesn't propagate L1 invalidation across processes;
#             user A's write only clears L1 in their process; other
#             processes serve stale L1 for up to L1's TTL (5s).
import json, threading
from cachetools import TTLCache
import redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# L1: per-process; small + short TTL; no network.
L1: TTLCache = TTLCache(maxsize=10_000, ttl=5)
L1_LOCK = threading.Lock()

def db_fetch_user(uid: int) -> dict:
    print(f"[DB] {uid}")
    return {"id": uid, "name": f"u{uid}"}

def get_user(uid: int) -> dict:
    key = f"user:{uid}"
    # L1 read.
    with L1_LOCK:
        if (v := L1.get(key)) is not None:
            return v
    # L2 read.
    if (raw := r.get(key)):
        v = json.loads(raw)
        with L1_LOCK:
            L1[key] = v
        return v
    # Miss both — fetch from DB.
    v = db_fetch_user(uid)
    r.set(key, json.dumps(v), ex=60)
    with L1_LOCK:
        L1[key] = v
    return v

def update_user(uid: int, **fields) -> None:
    # ... DB UPDATE ...
    key = f"user:{uid}"
    r.delete(key)                                     # L2
    with L1_LOCK:
        L1.pop(key, None)                             # L1 (this process only)

# Demo:
get_user(42)                                           # MISS, MISS, [DB]
get_user(42)                                           # L1 HIT
# 5s later: L1 expired, but L2 still has it -> L2 HIT, repopulate L1.
# Other processes: L1 untouched by update_user — they see stale data
# for up to 5s. See junior tier for the fanout fix.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but propagate L1 invalidation across all processes
#             via Redis pub/sub. A write in process A clears L1 in
#             every process within ~10ms.
# APPROACH  - On update: delete L2, then publish "invalidate <key>"
#             on a channel. Every process runs a background subscriber
#             that pops the key from its L1.
# STRENGTHS - Fleet-wide consistency within Redis pub/sub latency
#             (~10ms); the L1 staleness window goes from L1.ttl to
#             pub/sub latency.
# WEAKNESSES- Two-tier failure modes: pub/sub message lost (rare; means
#             a process serves stale until L1's own TTL) -> short L1
#             TTL bounds the worst case.
import json, threading, asyncio, logging
from cachetools import TTLCache
import redis

log = logging.getLogger(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

L1: TTLCache = TTLCache(maxsize=10_000, ttl=5)
L1_LOCK = threading.Lock()
INVALIDATION_CHANNEL = "cache:invalidate"

def l1_pop(key: str) -> None:
    with L1_LOCK:
        L1.pop(key, None)

def get_user(uid: int) -> dict:
    key = f"user:{uid}"
    with L1_LOCK:
        if (v := L1.get(key)) is not None: return v
    if (raw := r.get(key)):
        v = json.loads(raw)
        with L1_LOCK: L1[key] = v
        return v
    v = db_fetch_user(uid)
    pipe = r.pipeline(transaction=True)
    pipe.set(key, json.dumps(v), ex=60)
    pipe.execute()
    with L1_LOCK: L1[key] = v
    return v

def db_fetch_user(uid: int) -> dict:
    return {"id": uid, "name": f"u{uid}"}

# Atomic L2-delete + publish.
def update_user(uid: int, **fields) -> None:
    # ... DB UPDATE ...
    key = f"user:{uid}"
    pipe = r.pipeline(transaction=True)
    pipe.delete(key)                                  # L2
    pipe.publish(INVALIDATION_CHANNEL, key)           # fanout
    pipe.execute()
    l1_pop(key)                                        # local L1 (publish doesn't deliver to self)

# Background subscriber — runs in every process.
def _subscriber_loop():
    pubsub = r.pubsub()
    pubsub.subscribe(INVALIDATION_CHANNEL)
    for msg in pubsub.listen():
        if msg["type"] != "message": continue
        key = msg["data"]
        l1_pop(key)
        log.debug("L1 invalidated by pubsub: %s", key)

def start_invalidation_subscriber() -> None:
    t = threading.Thread(target=_subscriber_loop, daemon=True, name="cache-invalidate-sub")
    t.start()

# Call this once at process startup.
start_invalidation_subscriber()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: refresh-after-write semantics, per-tier
#             observability, fault isolation (L1 alive when L2 down,
#             L2 alive when DB slow), staleness-budget calculation.
# APPROACH  - On miss-and-fetch, write L2 BEFORE writing L1 (so other
#             processes find it in L2 even if our L1 cleanup races).
#             Wrap each tier in try/except for fault isolation.
#             Stats per tier: hit/miss/error counts; staleness budget
#             documented.
# STRENGTHS - Cache works as a degradation gradient: DB slow -> L2 takes
#             over; Redis offline -> L1 still serves; both offline -> DB
#             with stampede protection. Worst-case latency is bounded.
# WEAKNESSES- Setup is ~80 lines; for simple services, junior tier is
#             enough. Reach for this when you've measured a real need.
import json, threading, time, logging
from cachetools import TTLCache
from prometheus_client import Counter, Histogram
import redis

log = logging.getLogger(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# Staleness budget calculation (document in the code):
#   L1 TTL: 5s    -> after a write, this process's L1 holds stale data for up to 5s
#   pub/sub latency: ~10ms typical -> remote L1s clear within 10ms of publish
#   L2 TTL: 60s   -> if pub/sub message lost, L2 still serves OLD until 60s expiry
#   L1 TTL is the WORST CASE staleness across the fleet; pub/sub keeps
#   the typical case at ~10ms. Pick L1 TTL = max acceptable staleness.

L1: TTLCache = TTLCache(maxsize=10_000, ttl=5)
L1_LOCK = threading.Lock()
INVALIDATION_CHANNEL = "cache:invalidate"

# Per-tier metrics.
HITS  = Counter("cache_hits_total",   "Cache hits",   ["tier"])
MISSES= Counter("cache_misses_total", "Cache misses", ["tier"])
ERRS  = Counter("cache_errors_total", "Cache errors", ["tier", "op"])
LAT   = Histogram("cache_lookup_duration_seconds", "Lookup duration", ["tier"])

def _l1_get(key: str):
    with L1_LOCK:
        return L1.get(key)

def _l1_set(key: str, value):
    with L1_LOCK:
        L1[key] = value

def _l2_get(key: str):
    try:
        with LAT.labels("l2").time():
            return r.get(key)
    except redis.RedisError as e:
        ERRS.labels(tier="l2", op="get").inc()
        log.warning("L2 read failed: %s", e)
        return None                                   # fall through; do NOT raise

def _l2_set(key: str, raw: str, *, ex: int):
    try:
        r.set(key, raw, ex=ex)
    except redis.RedisError as e:
        ERRS.labels(tier="l2", op="set").inc()
        log.warning("L2 write failed: %s", e)

def get_user(uid: int) -> dict:
    key = f"user:{uid}"

    # L1.
    with LAT.labels("l1").time():
        v = _l1_get(key)
    if v is not None:
        HITS.labels(tier="l1").inc()
        return v
    MISSES.labels(tier="l1").inc()

    # L2 (fault-tolerant).
    if (raw := _l2_get(key)) is not None:
        HITS.labels(tier="l2").inc()
        v = json.loads(raw)
        _l1_set(key, v)
        return v
    MISSES.labels(tier="l2").inc()

    # Source.
    v = db_fetch_user(uid)
    raw = json.dumps(v)
    # Order: L2 first (so other processes can see it), then L1.
    _l2_set(key, raw, ex=60)
    _l1_set(key, v)
    return v

def db_fetch_user(uid: int) -> dict:
    return {"id": uid, "name": f"u{uid}"}

def update_user(uid: int, **fields) -> None:
    # ... DB UPDATE ...
    key = f"user:{uid}"
    # Order: invalidate L2, publish, then L1.
    # L2 first so concurrent readers don't repopulate L1 from stale L2.
    try:
        pipe = r.pipeline(transaction=True)
        pipe.delete(key)
        pipe.publish(INVALIDATION_CHANNEL, key)
        pipe.execute()
    except redis.RedisError as e:
        ERRS.labels(tier="l2", op="del").inc()
        log.warning("L2 invalidate failed: %s", e)
    finally:
        with L1_LOCK:
            L1.pop(key, None)

# Refresh-after-write — Caffeine-style: when L2 returns a "soon-to-expire"
# value, return it AND kick off a background refresh. Smooths latency.
def get_user_refresh_after_write(uid: int) -> dict:
    key = f"user:{uid}"
    if (v := _l1_get(key)): return v
    raw = _l2_get(key)
    if raw:
        v = json.loads(raw)
        _l1_set(key, v)
        # Optional: check ttl; if low, async refresh.
        # threading.Thread(target=_refresh_async, args=(uid,)).start()
        return v
    return get_user(uid)

# Decision rule:
#   single-process service              -> L1 only; Redis is overhead
#   multi-process, network is fast      -> L2 only; L1 doesn't pay
#   multi-process + Redis network slow  -> L1 + L2; the typical answer
#   strict consistency required         -> NOT multi-tier; serve from source with stampede protection
#   write rate ~= read rate             -> single tier; multi-tier wastes CPU on invalidation
#   staleness budget < 100ms            -> short L1 TTL + pub/sub fanout (junior tier)
#   staleness budget < 1s                -> normal L1 TTL + pub/sub
#   staleness budget = minutes          -> simple cache-aside; no fanout needed
#   L2 outage must NOT bring service down -> wrap _l2_get in try/except; fall to source
#   need request-scoped (per-request)   -> additional layer above L1 (request_scoped_cache entry)
#   GraphQL or rich joins              -> DataLoader (request_scoped_cache entry) + L1/L2
#
# Anti-pattern: writing to L1 BEFORE L2. A concurrent reader between
# "write L1" and "write L2" finds L1 hit -> returns the new value;
# meanwhile, a different process reads L2 (still empty) -> falls
# through to DB -> writes OLD L2 (race with our pending L2 write) ->
# overwrites. Always L2-first on writes; L1-first is for reads only.
```

## Decision Rule

```text
single-process service              -> L1 only; Redis is overhead
multi-process, network is fast      -> L2 only; L1 doesn't pay
multi-process + Redis network slow  -> L1 + L2; the typical answer
strict consistency required         -> NOT multi-tier; serve from source with stampede protection
write rate ~= read rate             -> single tier; multi-tier wastes CPU on invalidation
staleness budget < 100ms            -> short L1 TTL + pub/sub fanout (junior tier)
staleness budget < 1s                -> normal L1 TTL + pub/sub
staleness budget = minutes          -> simple cache-aside; no fanout needed
L2 outage must NOT bring service down -> wrap _l2_get in try/except; fall to source
need request-scoped (per-request)   -> additional layer above L1 (request_scoped_cache entry)
GraphQL or rich joins              -> DataLoader (request_scoped_cache entry) + L1/L2
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing to L1 BEFORE L2. A concurrent reader between
> "write L1" and "write L2" finds L1 hit -> returns the new value;
> meanwhile, a different process reads L2 (still empty) -> falls
> through to DB -> writes OLD L2 (race with our pending L2 write) ->
> overwrites. Always L2-first on writes; L1-first is for reads only.

## Tips

- L1 TTL = WORST-CASE staleness across the fleet (if pub/sub messages are lost). Pick L1 TTL to match your acceptable staleness budget; pub/sub latency is the typical-case staleness (~10ms).
- Order matters on writes: invalidate L2 FIRST (delete + publish in a pipeline), then L1 in this process. L1-first creates a race where another reader can re-populate stale L1 from L2 before L2 is cleared.
- Wrap L2 calls in try/except for fault isolation. The whole point of multi-tier is graceful degradation: if Redis is down, L1 + source still serve users; if source is slow, L1 + L2 absorb the spike.
- Per-tier hit ratios are the diagnostic: L1 hit ratio low → expand L1; L2 hit ratio low → tune L2 TTL; both low → stampede or cold-cache problem (see cache-stampede / cache-warmup entries).
- Refresh-after-write (Caffeine-style): when L2 returns a value with little TTL left, return it AND kick off a background refresh. Smooths latency at the cost of one extra background fetch.
- For simple multi-tier, write L2 before L1 on misses too — so concurrent readers in other processes find L2 even if our L1 update completes first.

## Common Mistake

> [!warning] Writing to L1 BEFORE L2. A concurrent reader can hit L1, get the new value, then look at L2 (still empty), fall through to DB, write OLD L2 — a race where the cache contains stale data with no event to fix it. Always: write L2 first, THEN L1. L1-first ordering is for reads only.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Wrong write order: L1 before L2
def get_user(uid):
    v = db_fetch(uid)
    L1[key] = v       # other readers find new L1 here
    r.set(key, ...)   # other process found L2 empty, wrote OLD value
```

**Senior:**
```python
# Right: L2 first, then L1
def get_user(uid):
    v = db_fetch(uid)
    r.set(key, json.dumps(v), ex=60)   # L2 first
    L1[key] = v                         # then L1
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/_Index|Caching → Cache Patterns — stampede, keys, warmup, multi-tier]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

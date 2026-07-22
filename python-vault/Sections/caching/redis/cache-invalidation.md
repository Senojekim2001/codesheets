---
type: "entry"
domain: "python"
file: "caching"
section: "redis"
id: "cache-invalidation"
title: "Cache invalidation — delete, version, tag, pub/sub fanout"
category: "Redis"
subtitle: "r.delete on write, key versioning (v3:user:42), version stamp from updated_at, SADD tag:profile, pub/sub channel for fanout, write-around vs write-through"
signature_short: "on_user_update(uid): r.delete(f\"v3:user:{uid}\")     # OR: f\"user:{uid}:v{updated_at}\" never invalidates"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cache invalidation — delete, version, tag, pub/sub fanout"
  - "cache-invalidation"
tags:
  - "python"
  - "python/caching"
  - "python/caching/redis"
  - "category/redis"
  - "tier/tiered"
---

# Cache invalidation — delete, version, tag, pub/sub fanout

> r.delete on write, key versioning (v3:user:42), version stamp from updated_at, SADD tag:profile, pub/sub channel for fanout, write-around vs write-through

## Overview

There are only two hard things in computer science: cache invalidation and naming things. The strategies, in order of increasing strength: (1) **delete-on-write** — write to source, delete cache key; race-prone but simple. (2) **version-stamped keys** — embed the source's `updated_at` in the key, so old data ages out via TTL and writers don't need explicit invalidation. (3) **tag-based** — keep a Redis SET of all keys for "user 42's profile-related data"; invalidate the tag, group-delete the keys. (4) **pub/sub fanout** — for multi-process L1 caches that mirror a Redis L2, broadcast invalidations on a channel. The three examples solve the SAME concrete task — when a user updates their profile, the cache must reflect it across all servers within a second — at three depths: delete-after-write → version-stamped keys + SETEX → tag-based group invalidation + pub/sub fanout for L1 caches.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — When a user updates their profile, invalidate the cached profile so the next read sees fresh data.
- **Junior** — SAME — but use version-stamped keys derived from the user's updated_at so writers don't need explicit invalidation. Old keys age out via TTL.
- **Senior** — SAME — production: multi-process L1 caches (in-process dict for 1s) backed by Redis L2; pub/sub fanout invalidates every L1 across the fleet within ~10ms; tag invalidation via Redis Streams for ordered, replay-able events.

## Signature

```python
on_user_update(uid): r.delete(f"v3:user:{uid}")     # OR: f"user:{uid}:v{updated_at}" never invalidates
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - When a user updates their profile, invalidate the cached
#             profile so the next read sees fresh data.
# APPROACH  - Write to DB; delete the cache key. Subsequent get fetches
#             fresh from DB (cache-aside), repopulates cache.
# STRENGTHS - Simple; one extra Redis op per write.
# WEAKNESSES- Race: a concurrent reader between "write to DB" and
#             "delete cache" can populate the cache with the OLD value.
#             "Delete twice" (once before, once after) helps, but the
#             real fix is a TTL short enough to mask the gap.
import json
import redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

def db_update_user(user_id: int, **fields) -> None:
    print(f"[DB] update user {user_id}: {fields}")
    # ... real DB UPDATE ...

def update_user(user_id: int, **fields) -> None:
    db_update_user(user_id, **fields)
    r.delete(f"user:{user_id}")                      # invalidate

def get_user(user_id: int) -> dict:
    cached = r.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    user = {"id": user_id, "name": "Alice", **{}}     # imagine DB fetch
    r.set(f"user:{user_id}", json.dumps(user), ex=60)
    return user

# Race we live with:
# T1: get_user(42) -> reads DB, gets old value (call it v1)
# T2: update_user(42, name="A2") -> DB now has v2, delete cache
# T1: SET cache user:42 = v1 (the old value)
# Result: cache has v1, DB has v2 — until 60s TTL.
#
# Mitigations:
#  - Short TTL (60s) bounds the staleness window.
#  - "Delete twice" (delete cache BEFORE the write, then again after)
#    closes some windows but not all.
#  - Version-stamped keys (junior tier) eliminate the race entirely.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use version-stamped keys derived from the
#             user's updated_at so writers don't need explicit
#             invalidation. Old keys age out via TTL.
# APPROACH  - Cache key includes updated_at; readers compute the same
#             key; writers update updated_at, so readers naturally miss
#             the old key and populate a fresh one.
# STRENGTHS - Race-free: there's no "delete-then-set" window.
#             Old data simply ages out via TTL.
# WEAKNESSES- Cache fills up with stale-versioned keys until TTL expires;
#             pick TTL = expected re-read window.
import json
import redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

def db_get_user(user_id: int) -> tuple[dict, int]:
    print(f"[DB] fetch user {user_id}")
    return ({"id": user_id, "name": "Alice"}, 1735689600)  # (data, updated_at_unix)

def db_update_user(user_id: int, **fields) -> None:
    print(f"[DB] update user {user_id}: {fields}")
    # ... DB UPDATE that bumps updated_at ...

def _versioned_key(user_id: int, updated_at: int) -> str:
    return f"user:{user_id}:v{updated_at}"

def get_user(user_id: int) -> dict:
    # Step 1: a quick lookup table for the current version (cheap).
    version_key = f"user:{user_id}:cur"
    updated_at_str = r.get(version_key)
    if updated_at_str:
        ck = _versioned_key(user_id, int(updated_at_str))
        cached = r.get(ck)
        if cached:
            return json.loads(cached)

    # Cache miss — fetch from DB.
    user, updated_at = db_get_user(user_id)

    # Populate both: the version pointer and the versioned data.
    pipe = r.pipeline(transaction=True)
    pipe.set(version_key, str(updated_at), ex=600)    # 10 min — readers locate version
    pipe.set(_versioned_key(user_id, updated_at), json.dumps(user), ex=600)
    pipe.execute()
    return user

def update_user(user_id: int, **fields) -> None:
    db_update_user(user_id, **fields)                  # bumps updated_at
    # No explicit invalidation — readers will compute a new version
    # pointer on next read. The OLD versioned key just ages out.
    r.delete(f"user:{user_id}:cur")                   # only the pointer; safer than nothing

# Tag-based group invalidation — when "all profile-related data for user 42"
# must invalidate together. Keep a SET of keys per logical group.
TAG_PREFIX = "tag:"

def cache_set_tagged(key: str, value: str, *, ex: int, tags: list[str]) -> None:
    pipe = r.pipeline(transaction=False)
    pipe.set(key, value, ex=ex)
    for t in tags:
        pipe.sadd(f"{TAG_PREFIX}{t}", key)            # add this key to each tag's set
        pipe.expire(f"{TAG_PREFIX}{t}", ex + 60)      # tag set lives slightly longer than entries
    pipe.execute()

def invalidate_tag(tag: str) -> int:
    """Delete every key associated with the tag, plus the tag set itself."""
    tag_key = f"{TAG_PREFIX}{tag}"
    keys = r.smembers(tag_key)
    if not keys:
        return 0
    pipe = r.pipeline(transaction=False)
    for k in keys:
        pipe.delete(k)
    pipe.delete(tag_key)
    pipe.execute()
    return len(keys)

# Use case: invalidate everything related to user 42's profile across
# multiple cached projections (profile, avatar URL, settings).
cache_set_tagged("user:42:profile", '{"name":"A"}',  ex=60, tags=["user:42"])
cache_set_tagged("user:42:avatar",  '{"url":"..."}', ex=60, tags=["user:42"])
invalidate_tag("user:42")                              # both keys gone in one call
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: multi-process L1 caches (in-process
#             dict for 1s) backed by Redis L2; pub/sub fanout invalidates
#             every L1 across the fleet within ~10ms; tag invalidation
#             via Redis Streams for ordered, replay-able events.
# APPROACH  - L1 cachetools.TTLCache; on read, L1 → L2 → source. On
#             write, delete L2 and PUBLISH "invalidate <key>" — every
#             process subscribes and clears its L1.
# STRENGTHS - L1 absorbs >99% of reads at zero network cost; L2 catches
#             everything else; invalidation propagates fleet-wide in
#             single-digit ms. Far better latency than L2-only.
# WEAKNESSES- Two layers + pub/sub = more failure modes; the L1's brief
#             staleness window (between Redis publish and subscriber
#             receive) is the price.
import json, threading, asyncio, logging
from cachetools import TTLCache
import redis

log = logging.getLogger(__name__)
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# 1) L1 cache — in-process, very short TTL.
L1: TTLCache = TTLCache(maxsize=100_000, ttl=5)
L1_LOCK = threading.Lock()

def l1_get(key: str):
    with L1_LOCK:
        return L1.get(key)

def l1_set(key: str, value):
    with L1_LOCK:
        L1[key] = value

def l1_invalidate(key: str):
    with L1_LOCK:
        L1.pop(key, None)

# 2) Read path: L1 -> L2 -> source.
def db_fetch_user(uid: int) -> dict:
    print(f"[DB] {uid}")
    return {"id": uid, "name": f"u{uid}"}

def get_user(user_id: int) -> dict:
    key = f"user:{user_id}"
    if (v := l1_get(key)) is not None:
        return v
    if (raw := r.get(key)):
        v = json.loads(raw)
        l1_set(key, v)
        return v
    v = db_fetch_user(user_id)
    pipe = r.pipeline(transaction=False)
    pipe.set(key, json.dumps(v), ex=60)
    pipe.execute()
    l1_set(key, v)
    return v

# 3) Write path: invalidate L2, then PUBLISH so every process clears L1.
INVALIDATION_CHANNEL = "cache:invalidate"

def update_user(user_id: int, **fields) -> None:
    # ... DB UPDATE ...
    key = f"user:{user_id}"
    pipe = r.pipeline(transaction=True)
    pipe.delete(key)
    pipe.publish(INVALIDATION_CHANNEL, key)            # fanout
    pipe.execute()
    l1_invalidate(key)                                 # local immediately

# 4) Background subscriber thread — runs in every process.
def _subscriber_loop():
    pubsub = r.pubsub()
    pubsub.subscribe(INVALIDATION_CHANNEL)
    for msg in pubsub.listen():
        if msg["type"] != "message":
            continue
        key = msg["data"]
        l1_invalidate(key)
        log.debug("L1 invalidated by pubsub: %s", key)

def start_invalidation_subscriber() -> None:
    t = threading.Thread(target=_subscriber_loop, daemon=True, name="cache-invalidate-sub")
    t.start()

# 5) Streams-based ordered invalidation — when you need replay or audit.
#    XADD key * key user:42 reason "profile_update"
#    Consumers track their last position; XREAD blocks; restarts replay.
def publish_invalidation_stream(key: str, reason: str) -> None:
    r.xadd("cache:invalidations", {"key": key, "reason": reason}, maxlen=10_000)

# Decision rule:
#   single-process service              -> delete-on-write is enough; race window is tiny
#   multi-process, single host          -> Redis L2 is enough; no pub/sub needed
#   multi-host fleet                    -> Redis pub/sub for L1 fanout
#   need ordered invalidation log       -> Redis Streams (XADD/XREAD); replay-able
#   data shape changes at deploy        -> CACHE_VERSION prefix; flush by bumping
#   "all data for user 42"              -> tag-based (SADD tag:user:42 <key>)
#   strict consistency required         -> NOT cache; or write-through with quorum
#   updated_at available on the row     -> version-stamped keys; race-free
#   immediate fleet-wide invalidate     -> Redis pub/sub PUBLISH (~10ms latency)
#   cache layer is L1 only (no Redis)   -> use Memcached-style consistent hashing OR move to Redis
#   transactional invalidation          -> MULTI/EXEC pipeline: delete + publish atomically
#
# Anti-pattern: invalidating the cache BEFORE writing to the source.
# The (cache, then DB) order produces a small race window where a
# concurrent reader misses cache, fetches OLD data from DB (the write
# hasn't happened yet), and re-populates the cache with the old value.
# After the DB write completes, the cache contains stale data with no
# remaining invalidation event. The right order is: write DB first;
# THEN delete cache; THEN publish invalidation. Pair with version-stamped
# keys to eliminate the race entirely.
```

## Decision Rule

```text
single-process service              -> delete-on-write is enough; race window is tiny
multi-process, single host          -> Redis L2 is enough; no pub/sub needed
multi-host fleet                    -> Redis pub/sub for L1 fanout
need ordered invalidation log       -> Redis Streams (XADD/XREAD); replay-able
data shape changes at deploy        -> CACHE_VERSION prefix; flush by bumping
"all data for user 42"              -> tag-based (SADD tag:user:42 <key>)
strict consistency required         -> NOT cache; or write-through with quorum
updated_at available on the row     -> version-stamped keys; race-free
immediate fleet-wide invalidate     -> Redis pub/sub PUBLISH (~10ms latency)
cache layer is L1 only (no Redis)   -> use Memcached-style consistent hashing OR move to Redis
transactional invalidation          -> MULTI/EXEC pipeline: delete + publish atomically
```

## Anti-Pattern

> [!warning] Anti-pattern
> invalidating the cache BEFORE writing to the source.
> The (cache, then DB) order produces a small race window where a
> concurrent reader misses cache, fetches OLD data from DB (the write
> hasn't happened yet), and re-populates the cache with the old value.
> After the DB write completes, the cache contains stale data with no
> remaining invalidation event. The right order is: write DB first;
> THEN delete cache; THEN publish invalidation. Pair with version-stamped
> keys to eliminate the race entirely.

## Tips

- Order matters: write source FIRST, then invalidate cache. Reverse order leaves a race window where a concurrent reader can repopulate the cache with stale data.
- Version-stamped keys (`user:42:v{updated_at}`) make invalidation race-free — old versions just age out via TTL, no explicit delete needed. Pair with a short-TTL "current version" pointer.
- `CACHE_VERSION` prefix (`v3:user:42`) is the deploy-time invalidation hammer. When the cached shape changes, bump the version; old entries become unreachable and age out.
- For "invalidate all data tagged X", maintain a Redis SET (`SADD tag:user:42 <key>`); on invalidation, iterate members and delete each. The tag set itself lives slightly longer than its members.
- For multi-process L1 caches, Redis pub/sub is the standard fanout — `PUBLISH cache:invalidate user:42` triggers every subscribed process to clear its L1. Latency is single-digit ms.
- Wrap delete-and-publish in a pipeline transaction (`MULTI/EXEC`) so they happen atomically. A delete without a publish leaves L1 caches stale.

## Common Mistake

> [!warning] Invalidating cache BEFORE writing to source. A concurrent reader between "delete cache" and "write source" sees a cache miss, fetches OLD data from source (the write hasn't happened), and repopulates cache with stale data. After your write completes, cache has stale data and there's no invalidation event left. Always: write source FIRST, then delete cache, then publish — and pair with version-stamped keys for race-freedom.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Wrong order: cache invalidated before source write
r.delete(f"user:{uid}")               # cache empty
db_update(uid, name="new")            # window: reader misses, repopulates with OLD
# After: cache has OLD, DB has NEW. No event left to fix it.
```

**Senior:**
```python
# Right: write source first, invalidate after
db_update(uid, name="new")
r.pipeline().delete(f"user:{uid}").publish("cache:invalidate", f"user:{uid}").execute()
```

## See Also

- [[Sections/caching/redis/redis-py-basics|redis-py — connect, get/set, pipelines, async, pools (Caching)]]
- [[Sections/caching/redis/cache-aside-pattern|Cache-aside — read-through with fallback to source (Caching)]]
- [[Sections/caching/redis/_Index|Caching → Redis — distributed cache, patterns, invalidation]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

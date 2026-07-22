---
type: "entry"
domain: "python"
file: "caching"
section: "in-memory"
id: "cachetools-policies"
title: "cachetools — TTL, LFU, LRU policies + thread-safe wrappers"
category: "In-Memory Caching"
subtitle: "TTLCache, LRUCache, LFUCache, TLRUCache, @cached(key=hashkey), Lock for thread-safety, getsizeof for byte-bounded caches, asyncache for async"
signature_short: "cache = TTLCache(maxsize=1000, ttl=60); @cached(cache, lock=Lock())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cachetools — TTL, LFU, LRU policies + thread-safe wrappers"
  - "cachetools-policies"
tags:
  - "python"
  - "python/caching"
  - "python/caching/in-memory"
  - "category/in-memory-caching"
  - "tier/tiered"
---

# cachetools — TTL, LFU, LRU policies + thread-safe wrappers

> TTLCache, LRUCache, LFUCache, TLRUCache, @cached(key=hashkey), Lock for thread-safety, getsizeof for byte-bounded caches, asyncache for async

## Overview

`cachetools` is the dict-shaped caching library. You instantiate a cache (LRU, LFU, TTL, or TLRU), then either use it as a dict (`cache[key] = value`) or wrap a function with `@cached(cache=...)`. Versus `functools.lru_cache`: TTL semantics (entries expire after N seconds), byte-size bounds (`getsizeof=`), pluggable eviction (LFU drops least-frequently-used; useful when access patterns are very skewed), and manual invalidation (`del cache[key]`). The three examples solve the SAME concrete task — cache `lookup(token)` results for 60 seconds, drop least-used at 1000 entries, thread-safe — at three depths: TTLCache + dict access → `@cached` decorator + custom key function + `Lock` → production with byte-size bound + Prometheus instrumentation + asyncache for async.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cache lookup(token) results: TTL 60s, max 1000 entries.
- **Junior** — SAME — but as a decorator (cleaner call sites), with a custom key function for non-trivial args, and thread-safe for shared use across requests.
- **Senior** — SAME — production: byte-bounded cache (max ~50MB), async via asyncache, hit/miss/eviction Prometheus metrics, custom Cache subclass for instrumentation.

## Signature

```python
cache = TTLCache(maxsize=1000, ttl=60); @cached(cache, lock=Lock())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cache lookup(token) results: TTL 60s, max 1000 entries.
# APPROACH  - cachetools.TTLCache: dict-like, expires entries after ttl.
# STRENGTHS - Drop-in for any "memoize with expiration" need; the
#             policy lru_cache lacks.
# WEAKNESSES- Not thread-safe by default; wrap with Lock for shared use
#             (junior tier shows the pattern).
from cachetools import TTLCache

cache = TTLCache(maxsize=1000, ttl=60)               # 60s TTL, max 1000 entries

def lookup(token: str) -> dict | None:
    if token in cache:
        return cache[token]                           # HIT
    result = expensive_db_lookup(token)               # MISS
    cache[token] = result
    return result

def expensive_db_lookup(token: str) -> dict:
    # ... a real DB call ...
    return {"token": token, "user_id": 42}

# Use it.
lookup("abc")                                          # MISS
lookup("abc")                                          # HIT (within 60s)
# 60s later -> expired; next call MISS again.

# Inspect.
print(len(cache))                                      # currsize
print(cache.currsize, cache.maxsize)
cache.clear()                                          # wipe everything

# Other policies in the same package:
#   LRUCache(maxsize=N)        — pure LRU, no time; like lru_cache
#   LFUCache(maxsize=N)        — least-frequently-used eviction
#   TLRUCache(maxsize, ttu)    — time-aware LRU with per-key expiry
#   FIFOCache(maxsize)         — FIFO eviction, simple
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but as a decorator (cleaner call sites), with
#             a custom key function for non-trivial args, and
#             thread-safe for shared use across requests.
# APPROACH  - @cached(cache=TTLCache(...), key=hashkey, lock=Lock()).
#             hashkey is the default; pass a custom key= to ignore
#             irrelevant args (e.g., a debug flag).
# STRENGTHS- Decorator form scales; thread-safe via lock=; custom key
#             lets you cache on a SUBSET of arguments.
# WEAKNESSES- The decorator form's API is less obvious than lru_cache's;
#             remember the lock= when shared across threads.
from threading import Lock
from cachetools import TTLCache, cached
from cachetools.keys import hashkey

LOOKUP_CACHE = TTLCache(maxsize=1000, ttl=60)
LOOKUP_LOCK  = Lock()

# Custom key: ignore the 'verbose' debug flag.
def by_token(token: str, verbose: bool = False):
    return hashkey(token)                             # only token participates in cache key

@cached(cache=LOOKUP_CACHE, key=by_token, lock=LOOKUP_LOCK)
def lookup(token: str, verbose: bool = False) -> dict:
    if verbose:
        print(f"computing for {token}")
    return {"token": token, "user_id": 42}

lookup("abc")                                          # MISS, prints
lookup("abc", verbose=True)                            # HIT, doesn't print (cached entry returned)
lookup("xyz")                                          # MISS

# Manual invalidation by key — the win over lru_cache.
with LOOKUP_LOCK:
    LOOKUP_CACHE.pop(hashkey("abc"), None)            # invalidate one entry
# Or a partial wipe:
with LOOKUP_LOCK:
    for k in list(LOOKUP_CACHE):
        LOOKUP_CACHE.pop(k)

# LFU: keep heavily-accessed entries when memory is tight.
from cachetools import LFUCache
HOT_CACHE = LFUCache(maxsize=500)                     # least-frequently-used eviction
HOT_CACHE["popular"] = "data"

# TTLCache + LFU: less common; build via a custom subclass if you really need it.

# cachetools.func module — drop-in decorators for the common cases.
from cachetools.func import ttl_cache, lru_cache as cachetools_lru_cache

@ttl_cache(maxsize=1000, ttl=60)                      # like lru_cache + TTL
def quick_lookup(token: str) -> dict:
    return {"token": token}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: byte-bounded cache (max ~50MB), async
#             via asyncache, hit/miss/eviction Prometheus metrics, custom
#             Cache subclass for instrumentation.
# APPROACH  - TTLCache(maxsize=BYTES, getsizeof=sys.getsizeof) bounds
#             memory not entry-count; subclass __setitem__ + __getitem__
#             for instrumentation; asyncache.cached for coroutines.
# STRENGTHS - Predictable memory footprint; observable cache health;
#             same patterns work for sync + async code.
# WEAKNESSES- getsizeof on Python objects is approximate (recursive
#             only with sys.getsizeof + walking refs).
import sys, asyncio
from threading import Lock
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
from prometheus_client import Counter, Gauge

# 1) Instrumented Cache subclass — count hits/misses/evictions.
class InstrumentedTTLCache(TTLCache):
    def __init__(self, name: str, *a, **kw):
        super().__init__(*a, **kw)
        self.name = name
        self._hits   = Counter("cache_hits_total",   "Cache hits",   ["cache"]).labels(name)
        self._misses = Counter("cache_misses_total", "Cache misses", ["cache"]).labels(name)
        self._size   = Gauge("cache_size_bytes",     "Cache size",   ["cache"]).labels(name)
        self._evicts = Counter("cache_evicts_total", "Cache evictions", ["cache"]).labels(name)

    def __getitem__(self, key, *, default_get=False):
        try:
            v = super().__getitem__(key)
            self._hits.inc()
            return v
        except KeyError:
            self._misses.inc()
            raise

    def __setitem__(self, key, value):
        # Evictions happen inside __setitem__ when over maxsize.
        before = len(self)
        super().__setitem__(key, value)
        after = len(self)
        # If size dropped from before+1 to after, an eviction happened.
        if after < before + 1:
            self._evicts.inc(before + 1 - after)
        self._size.set(self.currsize)

# 2) Byte-bounded cache — maxsize counts BYTES not entries.
def estimate_size(obj) -> int:
    """A cheap proxy for object size. For deep accuracy use pympler.asizeof."""
    return sys.getsizeof(obj)

USER_CACHE = InstrumentedTTLCache(
    name="users",
    maxsize=50 * 1024 * 1024,                          # 50 MB total
    ttl=300,                                            # 5 min
    getsizeof=estimate_size,
)
USER_LOCK = Lock()

@cached(cache=USER_CACHE, key=lambda uid: hashkey(uid), lock=USER_LOCK)
def get_user(user_id: int) -> dict:
    return {"id": user_id, "data": "x" * 1024}        # ~1 KB per entry

# 3) Async equivalent — asyncache wraps cachetools for coroutines.
#    pip install asyncache
from asyncache import cached as async_cached

ASYNC_CACHE = TTLCache(maxsize=1000, ttl=60)

@async_cached(ASYNC_CACHE)
async def fetch_user_async(user_id: int) -> dict:
    await asyncio.sleep(0.01)
    return {"id": user_id, "remote": True}

# 4) Custom key for compound args.
def hash_user_session(user_id: int, session_token: str, *_, **__):
    """Cache key ignores extra args; only user_id + session_token participate."""
    return hashkey(user_id, session_token)

# 5) Test pattern — assert hit ratio in tests.
def test_cache_works():
    USER_CACHE.clear()
    get_user(1)                                        # MISS
    get_user(1)                                        # HIT
    get_user(2)                                        # MISS
    # Diff against the counters — Prometheus Counter has no public read,
    # so we test via the underlying _value (private but stable).
    assert USER_CACHE._hits._value.get() == 1
    assert USER_CACHE._misses._value.get() == 2

# Decision rule:
#   need TTL                          -> TTLCache (or @ttl_cache)
#   need LRU                           -> LRUCache (cachetools or stdlib lru_cache)
#   need LFU                           -> LFUCache — for "keep popular, drop tail"
#   memory-bounded                     -> getsizeof= sums bytes; cap maxsize as bytes
#   thread-safe                        -> wrap with Lock OR pass lock= to @cached
#   need explicit invalidation         -> cachetools (dict-like); lru_cache is all-or-nothing
#   async function                     -> asyncache.cached(TTLCache(...))
#   per-call observability             -> subclass and instrument __getitem__/__setitem__
#   shared across processes            -> NOT in-memory; use Redis (see redis-py-basics)
#   simple, no TTL                     -> functools.lru_cache (stdlib, faster path)
#   need a custom eviction policy      -> subclass Cache and override popitem()
#
# Anti-pattern: building a memory-bounded cache without getsizeof. The
# default counts ENTRIES, not bytes. A cache of 10,000 large blobs (say,
# 1MB each) at maxsize=10,000 holds ~10GB; you wanted "50MB cap" and got
# OOM. Pass getsizeof=sys.getsizeof (or pympler.asizeof for accuracy)
# AND set maxsize in bytes. Only then does the cache bound memory.
```

## Decision Rule

```text
need TTL                          -> TTLCache (or @ttl_cache)
need LRU                           -> LRUCache (cachetools or stdlib lru_cache)
need LFU                           -> LFUCache — for "keep popular, drop tail"
memory-bounded                     -> getsizeof= sums bytes; cap maxsize as bytes
thread-safe                        -> wrap with Lock OR pass lock= to @cached
need explicit invalidation         -> cachetools (dict-like); lru_cache is all-or-nothing
async function                     -> asyncache.cached(TTLCache(...))
per-call observability             -> subclass and instrument __getitem__/__setitem__
shared across processes            -> NOT in-memory; use Redis (see redis-py-basics)
simple, no TTL                     -> functools.lru_cache (stdlib, faster path)
need a custom eviction policy      -> subclass Cache and override popitem()
```

## Anti-Pattern

> [!warning] Anti-pattern
> building a memory-bounded cache without getsizeof. The
> default counts ENTRIES, not bytes. A cache of 10,000 large blobs (say,
> 1MB each) at maxsize=10,000 holds ~10GB; you wanted "50MB cap" and got
> OOM. Pass getsizeof=sys.getsizeof (or pympler.asizeof for accuracy)
> AND set maxsize in bytes. Only then does the cache bound memory.

## Tips

- `TTLCache(maxsize=N, ttl=SEC)` is the "TTL + entry bound" workhorse. Entries expire on access (lazy); set a periodic `cache.expire()` if you need eager cleanup for memory.
- Always pass `lock=Lock()` to `@cached` when the cache is shared across threads. Without it, two concurrent callers can both miss + both set, racing the eviction logic.
- `cachetools.keys.hashkey` is the default key function. Custom `key=lambda *a, **kw: hashkey(...)` lets you cache on a subset of args (ignore debug flags, normalize whitespace, etc).
- For memory-bounded caches, pass `getsizeof=sys.getsizeof` AND set `maxsize` in BYTES. Without `getsizeof`, `maxsize` counts entries — a cache of huge blobs at `maxsize=10_000` can be tens of GB.
- Subclass the cache for per-key instrumentation. Override `__getitem__` (count hits/misses) and `__setitem__` (track evictions); export to Prometheus.
- Use `cachetools.func` (`@ttl_cache`, `@lru_cache`) for the simplest decorator form when you don't need the underlying cache object.

## Common Mistake

> [!warning] Building a memory-bounded cache without `getsizeof=`. The default `maxsize` counts ENTRIES, not bytes. A cache of 10,000 large blobs (1 MB each) at `maxsize=10000` holds ~10 GB; you wanted "50 MB cap" and got OOM. Pass `getsizeof=sys.getsizeof` AND set `maxsize` in bytes — only then does the cache bound MEMORY.

## Shorthand (Junior → Senior)

**Junior:**
```python
# maxsize counts ENTRIES — large blobs blow memory
cache = TTLCache(maxsize=10_000, ttl=60)
```

**Senior:**
```python
# maxsize in bytes — actual memory bound
cache = TTLCache(maxsize=50*1024*1024, ttl=60, getsizeof=sys.getsizeof)
```

## See Also

- [[Sections/caching/in-memory/functools-lru-cache|functools.lru_cache / cache — memoize pure functions (Caching)]]
- [[Sections/caching/in-memory/request-scoped-cache|Request-scoped cache — DataLoader pattern, contextvars (Caching)]]
- [[Sections/caching/in-memory/_Index|Caching → In-Memory Caching — lru_cache, cachetools, request-scoped]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

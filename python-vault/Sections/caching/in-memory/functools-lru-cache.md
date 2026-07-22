---
type: "entry"
domain: "python"
file: "caching"
section: "in-memory"
id: "functools-lru-cache"
title: "functools.lru_cache / cache — memoize pure functions"
category: "In-Memory Caching"
subtitle: "@lru_cache(maxsize=128), @cache, typed=, cache_info, cache_clear, methodtools.lru_cache for instance methods, async equivalents"
signature_short: "@lru_cache(maxsize=128) def compute_score(user_id: int, snapshot_ts: int) -> float: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "functools.lru_cache / cache — memoize pure functions"
  - "functools-lru-cache"
tags:
  - "python"
  - "python/caching"
  - "python/caching/in-memory"
  - "category/in-memory-caching"
  - "tier/tiered"
---

# functools.lru_cache / cache — memoize pure functions

> @lru_cache(maxsize=128), @cache, typed=, cache_info, cache_clear, methodtools.lru_cache for instance methods, async equivalents

## Overview

`functools.lru_cache` (since 3.2) and `functools.cache` (since 3.9; unbounded) wrap a function and cache return values by argument tuple. Hits return in microseconds; misses run the function and store the result. Constraints: arguments must be hashable; the function must be pure (same args → same result, no side effects); cached entries hold strong references (memory leak risk on instance methods). The three examples solve the SAME concrete task — a pure `compute_score(user_id, snapshot_ts)` is called repeatedly with the same args; cache it so we don't recompute — at three depths: literal `@lru_cache` decorator → tuned `maxsize` + `typed` + `cache_info()` diagnostics → production patterns (instance method caching without `self` leaks, async-safe equivalents, when NOT to use lru_cache).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A pure function compute_score(user_id, snapshot_ts) is called repeatedly with the same args; cache it.
- **Junior** — SAME — but tune the cache size, distinguish 1 vs 1.0 in keys, verify hit ratio in tests, clear on demand.
- **Senior** — SAME — production: cache an instance method without leaking instances, async equivalents for coroutines, expose cache stats as Prometheus metrics.

## Signature

```python
@lru_cache(maxsize=128) def compute_score(user_id: int, snapshot_ts: int) -> float: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A pure function compute_score(user_id, snapshot_ts) is
#             called repeatedly with the same args; cache it.
# APPROACH  - @lru_cache decorator from functools; first call computes,
#             repeats hit the cache.
# STRENGTHS - Stdlib; one decorator; thread-safe; near-zero overhead.
# WEAKNESSES- Unbounded with @cache (3.9+) can grow forever; bounded
#             with @lru_cache(maxsize=N) — pick N for your traffic.
from functools import lru_cache, cache

@lru_cache(maxsize=128)                              # 128-entry LRU cache
def compute_score(user_id: int, snapshot_ts: int) -> float:
    # Imagine an expensive computation here.
    return float(user_id * snapshot_ts)

# First call computes; second returns cached value.
compute_score(42, 100)                               # MISS -> computes
compute_score(42, 100)                               # HIT  -> ~50ns
compute_score(43, 100)                               # MISS -> different args
compute_score(42, 100)                               # HIT

# 3.9+: @cache is the unbounded variant (== @lru_cache(maxsize=None)).
@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

fib(30)                                               # 31 cache entries; instant
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tune the cache size, distinguish 1 vs 1.0 in
#             keys, verify hit ratio in tests, clear on demand.
# APPROACH  - maxsize sized to your distinct-input estimate; typed=True
#             treats int/float/bool as different keys; cache_info()
#             returns CacheInfo(hits, misses, maxsize, currsize); cache_clear()
#             wipes between tests.
# STRENGTHS- Hit ratio you can measure (and assert in tests);
#             type-correct keys; clear-on-demand for invalidation.
# WEAKNESSES- typed=True doubles cache entries when the same key is
#             passed as int and float interchangeably (rarely intended).
from functools import lru_cache

# typed=True: 1 (int) and 1.0 (float) are SEPARATE cache entries.
@lru_cache(maxsize=10_000, typed=True)
def compute_score(user_id: int, snapshot_ts: int) -> float:
    return float(user_id * snapshot_ts)

# Diagnostics — verify cache is actually helping.
for ts in (100, 100, 100, 200, 200):
    for uid in (42, 43, 42):
        compute_score(uid, ts)

print(compute_score.cache_info())
# CacheInfo(hits=10, misses=5, maxsize=10000, currsize=5)
# hit_ratio = hits / (hits + misses)

# Clear for tests / forced invalidation.
compute_score.cache_clear()

# Test the cache is being used (pytest):
def test_compute_score_caches():
    compute_score.cache_clear()
    compute_score(1, 100)
    compute_score(1, 100)
    info = compute_score.cache_info()
    assert info.hits == 1, f"expected 1 hit, got {info.hits}"

# WARNING — lru_cache with mutable args fails:
@lru_cache
def bad(items):                                       # list is unhashable
    return sum(items)
# bad([1, 2, 3])                                      # TypeError: unhashable type: 'list'

# Fix: convert at the boundary.
@lru_cache
def good(items_tuple: tuple) -> int:
    return sum(items_tuple)

good(tuple([1, 2, 3]))                                # OK
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: cache an instance method without
#             leaking instances, async equivalents for coroutines,
#             expose cache stats as Prometheus metrics.
# APPROACH  - methodtools.lru_cache for bound methods (caches keyed
#             per-instance via weakref); asyncache.cachedmethod for
#             async; export cache_info() into Counter/Gauge for monitoring.
# STRENGTHS - Methods cache without keeping garbage instances alive;
#             async functions get the same memoization story; ops can
#             see hit ratio per cache.
# WEAKNESSES- Extra deps (methodtools, asyncache); functools alone
#             can't do per-instance method caching safely.
from functools import lru_cache, cached_property
import weakref
from typing import Any

# 1) Pitfall: lru_cache on a method holds 'self' strongly forever.
class Bad:
    @lru_cache(maxsize=100)
    def lookup(self, key: str) -> str:                # 'self' is part of the key
        return key.upper()
# Each Bad() instance accumulates a cache entry; the cache strong-refs
# self; the instance never gets garbage-collected. Memory leak in long-running
# services that create many short-lived objects.

# 2) Right way for instance methods: methodtools.lru_cache
#    (pip install methodtools)
from methodtools import lru_cache as method_lru_cache

class Good:
    def __init__(self, db):
        self.db = db

    @method_lru_cache(maxsize=128)                    # cache is per-instance, weak-ref
    def lookup(self, key: str) -> str:
        return self.db.fetch(key)

# When a Good instance is collected, its cache vanishes too.

# 3) Right way #2: cached_property for "compute once, store on the instance".
class Aggregator:
    def __init__(self, items: list[int]):
        self.items = items

    @cached_property                                  # stdlib
    def total(self) -> int:
        return sum(self.items)                        # computed once per instance

a = Aggregator([1, 2, 3])
a.total                                                # computes
a.total                                                # cached on the instance

# 4) Async cache — functools.lru_cache does NOT work on coroutines
#    (it caches the coroutine OBJECT, not its awaited result).
import asyncio
from asyncache import cached
from cachetools import TTLCache

@cached(TTLCache(maxsize=1000, ttl=60))               # async-aware
async def fetch_user(user_id: int) -> dict:
    await asyncio.sleep(0.01)                          # simulate IO
    return {"id": user_id, "name": "Alice"}

# 5) Expose stats — Prometheus.
from prometheus_client import Counter, Gauge

CACHE_HITS   = Counter("cache_hits_total",   "Cache hits",   ["cache"])
CACHE_MISSES = Counter("cache_misses_total", "Cache misses", ["cache"])
CACHE_SIZE   = Gauge("cache_currsize",       "Current size", ["cache"])

@lru_cache(maxsize=10_000)
def compute_score(user_id: int, ts: int) -> float:
    return float(user_id * ts)

def export_score_cache_metrics() -> None:
    """Call from a background loop or at scrape time."""
    info = compute_score.cache_info()
    # Note: lru_cache doesn't expose hits/misses incrementally — diff against last poll.
    CACHE_SIZE.labels(cache="compute_score").set(info.currsize)

# Decision rule:
#   pure function, hashable args        -> @lru_cache or @cache
#   instance method                     -> methodtools.lru_cache (NOT functools, leaks self)
#   compute-once-per-instance attr      -> @cached_property (stdlib)
#   args include lists/dicts            -> convert to tuple/frozenset; or use cachetools with key=
#   async function                      -> asyncache.cached(TTLCache(...))
#   need TTL                            -> cachetools (lru_cache is FIFO/LRU only, no time)
#   bounded by total memory             -> cachetools.LRUCache(maxsize, getsizeof=sys.getsizeof)
#   need invalidation by key            -> cachetools (dict-like); lru_cache is all-or-nothing
#   distributed / multi-process         -> Redis (see redis-py-basics entry)
#   need cache stats in Prometheus      -> wrap and instrument; lru_cache stats are diff-only
#
# Anti-pattern: @lru_cache on async functions. The decorator caches the
# coroutine OBJECT (the awaitable), not its awaited result. The first
# call returns a coroutine; you await it. The second call returns the
# SAME coroutine — already-awaited, raising RuntimeError("cannot reuse
# already awaited coroutine"). Use asyncache.cached or roll your own
# with asyncio.Lock + dict.
```

## Decision Rule

```text
pure function, hashable args        -> @lru_cache or @cache
instance method                     -> methodtools.lru_cache (NOT functools, leaks self)
compute-once-per-instance attr      -> @cached_property (stdlib)
args include lists/dicts            -> convert to tuple/frozenset; or use cachetools with key=
async function                      -> asyncache.cached(TTLCache(...))
need TTL                            -> cachetools (lru_cache is FIFO/LRU only, no time)
bounded by total memory             -> cachetools.LRUCache(maxsize, getsizeof=sys.getsizeof)
need invalidation by key            -> cachetools (dict-like); lru_cache is all-or-nothing
distributed / multi-process         -> Redis (see redis-py-basics entry)
need cache stats in Prometheus      -> wrap and instrument; lru_cache stats are diff-only
```

## Anti-Pattern

> [!warning] Anti-pattern
> @lru_cache on async functions. The decorator caches the
> coroutine OBJECT (the awaitable), not its awaited result. The first
> call returns a coroutine; you await it. The second call returns the
> SAME coroutine — already-awaited, raising RuntimeError("cannot reuse
> already awaited coroutine"). Use asyncache.cached or roll your own
> with asyncio.Lock + dict.

## Tips

- Prefer `@lru_cache(maxsize=N)` over the unbounded `@cache` for any function called with potentially-unbounded distinct args (anything user-input-derived). A leaking cache is a slow OOM.
- `typed=True` makes `1` and `1.0` separate keys. Useful when the function returns different results for different types; otherwise it just doubles your cache entries.
- `fn.cache_info()` returns `CacheInfo(hits, misses, maxsize, currsize)`. Use it in tests to assert the cache is being hit; use it in production to monitor hit ratio (diff against last poll).
- NEVER use `functools.lru_cache` on instance methods — `self` is part of the key; the cache strong-refs every instance you ever cached for; instances never get GC'd. Use `methodtools.lru_cache` for per-instance caching with weak refs.
- `functools.lru_cache` does NOT work on async functions — it caches the coroutine object, not the awaited result. Use `asyncache.cached(TTLCache(...))` for async memoization.
- For "compute once per instance, never expire" semantics, use `functools.cached_property` (stdlib). It stores the value on the instance itself, so it gets cleaned up with the instance.

## Common Mistake

> [!warning] Decorating an async function with `@lru_cache`. The decorator caches the COROUTINE object — the first call returns a coroutine, you await it; the second call returns the SAME (already-awaited) coroutine, raising `RuntimeError: cannot reuse already awaited coroutine`. Use `asyncache.cached(TTLCache(...))` for async; or roll your own with `asyncio.Lock` + `dict`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# @lru_cache on async — caches the coroutine, not the result
@lru_cache(maxsize=100)
async def fetch_user(uid): ...
```

**Senior:**
```python
# Async memoization
from asyncache import cached
from cachetools import TTLCache
@cached(TTLCache(maxsize=100, ttl=60))
async def fetch_user(uid): ...
```

## See Also

- [[Sections/caching/in-memory/cachetools-policies|cachetools — TTL, LFU, LRU policies + thread-safe wrappers (Caching)]]
- [[Sections/caching/in-memory/request-scoped-cache|Request-scoped cache — DataLoader pattern, contextvars (Caching)]]
- [[Sections/caching/in-memory/_Index|Caching → In-Memory Caching — lru_cache, cachetools, request-scoped]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

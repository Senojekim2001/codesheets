---
type: "file-index"
domain: "python"
file: "caching"
title: "Caching"
tags:
  - "python"
  - "python/caching"
  - "index"
---

# Caching

> 12 entries across 4 sections.

## In-Memory Caching — lru_cache, cachetools, request-scoped · 3

- [[Sections/caching/in-memory/functools-lru-cache|functools.lru_cache / cache — memoize pure functions]] — Stdlib decorator that caches a function's return value keyed on its arguments. Zero install, thread-safe, near-instant lookup — the right answer when the function is pure and the args are hashable.
- [[Sections/caching/in-memory/cachetools-policies|cachetools — TTL, LFU, LRU policies + thread-safe wrappers]] — When `lru_cache` isn't enough — TTL expiry, LFU eviction, byte-size limits, manual invalidation — `cachetools` gives you dict-like caches with eviction policies and a `@cached` decorator with custom key functions.
- [[Sections/caching/in-memory/request-scoped-cache|Request-scoped cache — DataLoader pattern, contextvars]] — Within ONE HTTP request, multiple handlers fetch the same resource — but caching across requests would hide stale data. Per-request cache + DataLoader batching is the right shape.

## Redis — distributed cache, patterns, invalidation · 3

- [[Sections/caching/redis/redis-py-basics|redis-py — connect, get/set, pipelines, async, pools]] — The official Redis client: connect via URL, get/set with TTL, batch with pipelines, async via redis.asyncio, connection pooling for production. The default Redis library for Python.
- [[Sections/caching/redis/cache-aside-pattern|Cache-aside — read-through with fallback to source]] — The most common cache pattern: try the cache; on miss, fetch from source, populate cache, return. Wrap as a decorator; add stampede protection and probabilistic refresh in production.
- [[Sections/caching/redis/cache-invalidation|Cache invalidation — delete, version, tag, pub/sub fanout]] — When data changes, the cache must reflect it. Strategies in increasing strength: delete-on-write, version-stamped keys (no explicit invalidation), tag-based group invalidation, pub/sub fanout for multi-process coordination.

## HTTP & CDN Caching — headers, conditional GETs, edge invalidation · 2

- [[Sections/caching/http-cdn/http-caching-headers|HTTP cache headers — Cache-Control, ETag, conditional GETs]] — Configure response headers so browsers, CDNs, and httpx clients cache correctly: Cache-Control directives, ETag for conditional GETs (304 Not Modified), Vary for content negotiation. Free latency win when shipped right.
- [[Sections/caching/http-cdn/cdn-edge-caching|CDN edge caching — surrogate keys, purge, hit-rate debugging]] — Configure the CDN (Cloudflare, Fastly, CloudFront) to cache responses at the edge, invalidate by surrogate key after content changes, and debug hit/miss via cache-status headers.

## Cache Patterns — stampede, keys, warmup, multi-tier · 4

- [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing]] — A hot key expires; 200 concurrent requests all miss simultaneously and slam the source. Stampede protection: SETNX single-flight, XFETCH probabilistic refresh, asyncio.Lock per-key coalescing.
- [[Sections/caching/patterns/cache-key-design|Cache key design — namespace, version, tenant, hash safely]] — Cache keys are public API in disguise. Get the design wrong and rename means cache flush, hash collisions cause data leakage, hot keys break Redis Cluster. The discipline is a one-pager you write once.
- [[Sections/caching/patterns/cache-warmup|Cache warmup — pre-populate after deploy / restart]] — After a deploy that flushed the cache, the first 30 minutes of traffic hammer the source while the cache fills. Pre-warm it: replay top-N keys from access logs, run after deploy, observe fill rate.
- [[Sections/caching/patterns/cache-coherence-multi-tier|Multi-tier cache — L1 (in-process) + L2 (Redis) coherence]] — L1 in-process TTLCache absorbs >99% of reads at zero network cost; L2 Redis catches the rest. Get the coherence right: write order, invalidation propagation, staleness budget per tier, fault-isolation when one tier is slow.

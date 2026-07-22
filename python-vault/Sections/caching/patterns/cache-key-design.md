---
type: "entry"
domain: "python"
file: "caching"
section: "patterns"
id: "cache-key-design"
title: "Cache key design — namespace, version, tenant, hash safely"
category: "Patterns"
subtitle: "namespace prefix, version segment, tenant scoping, normalize input, hash via sha256, key length limits, hot-key avoidance, content-hash for immutability"
signature_short: "k = f\"svc:cache:v3:tenant:{tid}:user:{uid}\"   # service:cache:version:tenant:entity:id"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cache key design — namespace, version, tenant, hash safely"
  - "cache-key-design"
tags:
  - "python"
  - "python/caching"
  - "python/caching/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Cache key design — namespace, version, tenant, hash safely

> namespace prefix, version segment, tenant scoping, normalize input, hash via sha256, key length limits, hot-key avoidance, content-hash for immutability

## Overview

Cache keys are not strings — they're a contract between code that writes and code that reads, often across services and deploys. Get them wrong and bad things happen: a rename invalidates everything; a collision serves user A's data to user B; a hot key concentrates load on one Redis shard. The discipline: a stable hierarchy (`svc:cache:v3:tenant:42:user:101`), normalized inputs (lowercase, strip), bounded length, content-hash for immutable payloads, and a written inventory so renames are atomic. The three examples solve the SAME concrete task — design cache keys for a multi-tenant service that survives renames, prevents collisions, and avoids hot keys — at three depths: f-string keys → namespace + version + tenant + input normalization → production with a `CacheKey` builder, content-hash for immutability, hot-key sharding via key tags, written key inventory.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cache user profiles. Keys must uniquely identify a user and be easy to read in the Redis CLI.
- **Junior** — SAME — but namespaced per service, versioned for atomic deploys, tenant-scoped, with normalized + bounded user input.
- **Senior** — SAME — production: a CacheKey builder type that's the single source of truth for keys; content-hash keys for immutable payloads; hash tags for hot-key sharding in Redis Cluster; consistency between L1 + L2 keys.

## Signature

```python
k = f"svc:cache:v3:tenant:{tid}:user:{uid}"   # service:cache:version:tenant:entity:id
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cache user profiles. Keys must uniquely identify a user
#             and be easy to read in the Redis CLI.
# APPROACH  - Simple f-string with a colon-separated hierarchy.
# STRENGTHS - Trivial; readable in 'redis-cli KEYS user:*'; works for
#             a single-service, single-tenant app.
# WEAKNESSES- No namespace (collides with another service on the same
#             Redis); no version (deploy that changes shape needs flush);
#             no tenant (multi-tenant services serve cross-tenant data).

def user_key(uid: int) -> str:
    return f"user:{uid}"

# Use:
key = user_key(42)                                     # "user:42"

# Problems waiting to bite:
#  1) Another service writes to "user:42" with a different shape.
#  2) Deploy changes the cached object's fields; old cached values
#     can't be safely deserialized; need to flush or version.
#  3) Multi-tenant: tenant A's user 42 and tenant B's user 42 collide.
#  4) User input in the key (e.g. f"search:{query}") allows injection
#     ('search:*' wildcards, control chars).
#
# All fixed in the junior tier.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but namespaced per service, versioned for atomic
#             deploys, tenant-scoped, with normalized + bounded user
#             input.
# APPROACH  - Convention: SVC:CACHE:vN:tenant:T:entity:ID. Normalize
#             string inputs (lowercase, strip), bound length, hash any
#             user-controllable string with sha256.
# STRENGTHS- Renames are deploy-safe (bump version); cross-tenant
#             leakage impossible; collision-resistant on user input.
# WEAKNESSES- Verbose keys; document the convention in code so new
#             routes follow it.
import hashlib, re

CACHE_NS = "svc:cache"                                 # namespace per service
CACHE_VERSION = "v3"                                   # bump on shape change
MAX_KEY_LEN = 200                                       # Redis allows up to 512MB but keep it sane

def _normalize_string(s: str, *, max_len: int = 64) -> str:
    """Lowercase, strip, sha256 if too long or contains noise."""
    s = s.strip().lower()
    if not s or len(s) > max_len or re.search(r"[^a-z0-9._-]", s):
        return "h_" + hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]
    return s

def user_key(*, tenant_id: int, user_id: int) -> str:
    return f"{CACHE_NS}:{CACHE_VERSION}:tenant:{tenant_id}:user:{user_id}"

def search_key(*, tenant_id: int, query: str) -> str:
    q = _normalize_string(query, max_len=80)
    return f"{CACHE_NS}:{CACHE_VERSION}:tenant:{tenant_id}:search:{q}"

# Length guard — every key passes through this on construction.
def make_key(parts: list[str | int]) -> str:
    key = ":".join(str(p) for p in parts)
    if len(key) > MAX_KEY_LEN:
        # Hash the tail so the prefix stays readable in monitoring.
        head, tail = key[:MAX_KEY_LEN-20], key[MAX_KEY_LEN-20:]
        key = f"{head}:hh_{hashlib.sha256(tail.encode()).hexdigest()[:12]}"
    return key

# Use.
print(user_key(tenant_id=42, user_id=101))
# svc:cache:v3:tenant:42:user:101

print(search_key(tenant_id=42, query="  Café 🚀 "))
# svc:cache:v3:tenant:42:search:h_a3b4c5...   (long/noisy → hashed)

# Atomic deploy invalidation — bump CACHE_VERSION; old keys age out.
# CACHE_VERSION = "v4"   <- one-line PR; effective on rollout
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: a CacheKey builder type that's the
#             single source of truth for keys; content-hash keys for
#             immutable payloads; hash tags for hot-key sharding in
#             Redis Cluster; consistency between L1 + L2 keys.
# APPROACH  - CacheKey class enforces the schema; KEYS module is the
#             only place keys are constructed; content-addressed keys
#             never need invalidation; {tag} forces all related keys
#             to one Cluster shard for atomic ops.
# STRENGTHS- Renames mean editing one file; mypy catches new sites;
#             content keys eliminate invalidation bugs; cluster-safe
#             for groups that need MULTI/EXEC.
# WEAKNESSES- Higher upfront ceremony; pays for itself the first time
#             a deploy renames a cached entity.
from __future__ import annotations
import hashlib, json
from dataclasses import dataclass
from typing import Any

CACHE_NS = "svc:cache"
CACHE_VERSION = "v3"

@dataclass(frozen=True)
class CacheKey:
    """The single way to construct a cache key in this service."""
    parts: tuple[str | int, ...]

    def __str__(self) -> str:
        return ":".join(str(p) for p in self.parts)

    def with_tag(self, tag: str) -> "CacheKey":
        """Wrap a part in {tag} for Redis Cluster hash-tag co-location.
        All keys with the same {tag} hash to the same shard, so MULTI/EXEC
        and pipelines that touch them work."""
        return CacheKey(self.parts + (f"{{{tag}}}",))

# 1) KEYS module — every cached entity has one constructor here. ALL
#    cache reads + writes import from this module. Renames are atomic.
class KEYS:
    @staticmethod
    def user(*, tenant_id: int, user_id: int) -> CacheKey:
        return CacheKey((CACHE_NS, CACHE_VERSION, f"{{t-{tenant_id}}}", "user", user_id))

    @staticmethod
    def user_orders_list(*, tenant_id: int, user_id: int) -> CacheKey:
        # Same {t-N} tag => same Redis shard as KEYS.user; pipelines work.
        return CacheKey((CACHE_NS, CACHE_VERSION, f"{{t-{tenant_id}}}", "user", user_id, "orders"))

    @staticmethod
    def search(*, tenant_id: int, query: str) -> CacheKey:
        norm = _safe_norm(query)
        return CacheKey((CACHE_NS, CACHE_VERSION, f"{{t-{tenant_id}}}", "search", norm))

    @staticmethod
    def render_html(*, content_hash: str) -> CacheKey:
        """Content-addressed: key includes the hash; entry NEVER needs invalidation."""
        return CacheKey((CACHE_NS, "render", content_hash))

def _safe_norm(s: str, max_len: int = 64) -> str:
    s = s.strip().lower()
    if not s or len(s) > max_len or any(c in s for c in ":\n\r\0"):
        return "h_" + hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]
    return s

# 2) Content-hash keys — for serialized output that's expensive to render
#    but identical for identical inputs (rendered HTML, generated thumbnails).
def render_html(template: str, ctx: dict) -> str:
    """Cache rendered output by content hash; same input -> same hash -> same key."""
    payload = json.dumps({"t": template, "c": ctx}, sort_keys=True).encode()
    chash = hashlib.sha256(payload).hexdigest()[:32]
    key = str(KEYS.render_html(content_hash=chash))
    # Read; cache HIT? return cached. MISS? render and store. Forever.
    cached = redis_client.get(key)
    if cached:
        return cached
    rendered = expensive_render(template, ctx)
    redis_client.set(key, rendered, ex=86400 * 30)    # 30 days; old entries age out
    return rendered

def expensive_render(template: str, ctx: dict) -> str: ...
class redis_client:                                    # placeholder
    @staticmethod
    def get(k): return None
    @staticmethod
    def set(k, v, ex=None): pass

# 3) Hot-key avoidance — a single key handling 10k RPS lands on one
#    Cluster shard and saturates it. Spread across N shards by adding
#    a salt to the key.
def hot_counter_key(metric: str, *, shard_count: int = 16) -> CacheKey:
    """
    Increment 1 of N keys per call (random shard); aggregate at read time.
    Removes the per-key bottleneck on a hot counter.
    """
    import random
    shard = random.randint(0, shard_count - 1)
    return CacheKey((CACHE_NS, "counter", metric, f"shard{shard}"))

# Read aggregates over all shards — pipeline for one round-trip.
def hot_counter_value(metric: str, *, shard_count: int = 16) -> int:
    pipe = redis_client.pipeline()
    for shard in range(shard_count):
        pipe.get(str(CacheKey((CACHE_NS, "counter", metric, f"shard{shard}"))))
    return sum(int(v or 0) for v in pipe.execute())

# 4) Tests assert key shape — catch typos early.
def test_user_key_shape():
    k = KEYS.user(tenant_id=42, user_id=101)
    assert str(k) == "svc:cache:v3:{t-42}:user:101"
    # Same tenant => same hash tag => same Redis Cluster shard.
    o = KEYS.user_orders_list(tenant_id=42, user_id=101)
    assert "{t-42}" in str(o)

# Decision rule:
#   single-service, single-tenant       -> simple f"entity:{id}"; revisit if you grow
#   multi-service on shared Redis       -> namespace prefix per service ("svc:cache:")
#   shape changes on deploy             -> version segment ("v3"); bump on incompatible change
#   multi-tenant                        -> tenant in the key path; never trust caller scoping
#   user-input as key part              -> normalize + sha256 if long/noisy; bound length
#   immutable payload (rendered HTML)   -> content-hash key; never invalidate, age out by TTL
#   hot single key on Redis Cluster     -> shard via random salt + aggregate at read
#   need MULTI/EXEC across keys         -> {hash-tag} co-locates them on one shard
#   key length matters                  -> hash the tail; keep prefix readable
#   key inventory in code               -> centralize in a KEYS module; renames in one file
#   external services share keys        -> document the schema; treat as a stability contract
#
# Anti-pattern: scattering f-string keys across the codebase. f"user:{uid}"
# in handler.py, f"user:{user_id}" in cache.py, f"u:{uid}" in someone's
# personal helper. A rename means grepping every file and hoping;
# typos in obscure routes serve random data; "we'll just flush" becomes
# the only safe deploy. ALL keys go through ONE module (here, KEYS).
# That module is the cache schema; treat it as carefully as your DB
# migrations.
```

## Decision Rule

```text
single-service, single-tenant       -> simple f"entity:{id}"; revisit if you grow
multi-service on shared Redis       -> namespace prefix per service ("svc:cache:")
shape changes on deploy             -> version segment ("v3"); bump on incompatible change
multi-tenant                        -> tenant in the key path; never trust caller scoping
user-input as key part              -> normalize + sha256 if long/noisy; bound length
immutable payload (rendered HTML)   -> content-hash key; never invalidate, age out by TTL
hot single key on Redis Cluster     -> shard via random salt + aggregate at read
need MULTI/EXEC across keys         -> {hash-tag} co-locates them on one shard
key length matters                  -> hash the tail; keep prefix readable
key inventory in code               -> centralize in a KEYS module; renames in one file
external services share keys        -> document the schema; treat as a stability contract
```

## Anti-Pattern

> [!warning] Anti-pattern
> scattering f-string keys across the codebase. f"user:{uid}"
> in handler.py, f"user:{user_id}" in cache.py, f"u:{uid}" in someone's
> personal helper. A rename means grepping every file and hoping;
> typos in obscure routes serve random data; "we'll just flush" becomes
> the only safe deploy. ALL keys go through ONE module (here, KEYS).
> That module is the cache schema; treat it as carefully as your DB
> migrations.

## Tips

- Centralize EVERY cache key constructor in one module (here, `KEYS`). Scattered f-strings make renames terrifying; one module makes them a code edit.
- Always include a version segment (`v3`). When you change the cached object's shape, bump it; old keys become unreachable and age out via TTL — atomic invalidation.
- For multi-tenant services, tenant ID belongs in the key path BEFORE the entity. `svc:cache:v3:tenant:42:user:101` is correct; `svc:cache:v3:user:101` is a cross-tenant leak waiting to happen.
- For Redis Cluster, wrap the part you want to colocate in `{tag}` (`{t-42}` for "all tenant 42's keys"). Hash tags force keys to the same shard so MULTI/EXEC and pipelines work.
- Content-hash keys (key includes a SHA of the input) are immutable by design — same input always hashes to the same key, so you NEVER need to invalidate. Age out via long TTL.
- For hot keys (10k+ RPS), shard across N salted keys (`metric:shard0..15`); read by pipelining all N. Avoids single-shard saturation in Redis Cluster.

## Common Mistake

> [!warning] Scattering f-string cache keys across the codebase — `f"user:{uid}"` in one file, `f"user:{user_id}"` in another, `f"u:{uid}"` in a helper. Renames require grepping every file and hoping; typos in obscure routes serve random data. ALL key construction goes through ONE module; that module is your cache schema, treat it as carefully as DB migrations.

## Shorthand (Junior → Senior)

**Junior:**
```python
# f-strings everywhere — rename = panic
# handler.py
key = f"user:{uid}"
# cache.py
key = f"user:{user_id}"
# someone_helper.py
key = f"u:{uid}"
```

**Senior:**
```python
# All keys come from KEYS module — rename = one file
key = str(KEYS.user(tenant_id=tid, user_id=uid))
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/_Index|Caching → Cache Patterns — stampede, keys, warmup, multi-tier]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

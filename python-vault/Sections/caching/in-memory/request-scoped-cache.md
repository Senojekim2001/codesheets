---
type: "entry"
domain: "python"
file: "caching"
section: "in-memory"
id: "request-scoped-cache"
title: "Request-scoped cache — DataLoader pattern, contextvars"
category: "In-Memory Caching"
subtitle: "request.state.cache (FastAPI), flask.g, contextvars.ContextVar, DataLoader (batched fetch + identity map), graphene-dataloader, async batched coalescing"
signature_short: "cache: dict = request.state.cache  # lifetime = one request; reset between"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Request-scoped cache — DataLoader pattern, contextvars"
  - "request-scoped-cache"
tags:
  - "python"
  - "python/caching"
  - "python/caching/in-memory"
  - "category/in-memory-caching"
  - "tier/tiered"
---

# Request-scoped cache — DataLoader pattern, contextvars

> request.state.cache (FastAPI), flask.g, contextvars.ContextVar, DataLoader (batched fetch + identity map), graphene-dataloader, async batched coalescing

## Overview

Some caching belongs to one request, not the process. A handler queries a user, then a deeper helper queries the same user, then a serializer queries it again — three round-trips for the same row. Process-level cache risks stale data; request-level cache (a dict on `request.state` or a `ContextVar`) is exactly right: shared within the request, freshly empty on the next. The DataLoader pattern (Facebook, 2014) extends this with BATCHING — multiple `load(id)` calls in the same event-loop tick coalesce into one `mget(ids)` round-trip. The three examples solve the SAME concrete task — within one request, multiple handlers need `get_user(id)`; the function should run once per id per request — at three depths: `request.state.cache: dict` → ContextVar-scoped cache for deep helpers → async DataLoader with batched per-tick fetch and identity map.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Within one request, get_user(uid) should run at most once per uid; calls in deeper helpers reuse the cached result.
- **Junior** — SAME — but deep helpers shouldn't need a 'request' arg. Use ContextVar so any code in the request scope can hit the cache without plumbing.
- **Senior** — SAME — production: DataLoader batches multiple load(id) calls in the same event-loop tick into ONE mget(ids); the classic fix for ORM N+1 in async services and GraphQL.

## Signature

```python
cache: dict = request.state.cache  # lifetime = one request; reset between
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Within one request, get_user(uid) should run at most once
#             per uid; calls in deeper helpers reuse the cached result.
# APPROACH  - Stash a dict on request.state in middleware; helpers
#             pass the request and read/write that dict.
# STRENGTHS - Trivially correct; lifetime exactly one request; impossible
#             to leak state into the next request.
# WEAKNESSES- Helpers need access to request — couples the call chain
#             to the framework. ContextVar fixes this (junior tier).
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def attach_cache(request: Request, call_next):
    request.state.cache = {}                          # fresh dict per request
    return await call_next(request)

def get_user(request: Request, user_id: int) -> dict:
    cache = request.state.cache
    if user_id in cache:
        return cache[user_id]
    user = db_fetch_user(user_id)                     # the expensive call
    cache[user_id] = user
    return user

def db_fetch_user(uid: int) -> dict:
    print(f"[DB] fetching user {uid}")                # one print per uid per request
    return {"id": uid, "name": f"u{uid}"}

@app.get("/dashboard/{user_id}")
async def dashboard(user_id: int, request: Request):
    user = get_user(request, user_id)                 # MISS -> DB
    friends = [get_user(request, fid) for fid in [user_id, user_id, user_id+1]]
    # 2 distinct uids, 4 calls -> 2 DB queries (not 4).
    return {"user": user, "friends_count": len(friends)}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but deep helpers shouldn't need a 'request' arg.
#             Use ContextVar so any code in the request scope can hit
#             the cache without plumbing.
# APPROACH  - ContextVar holds a per-request dict; middleware sets it
#             at request entry; helpers read it directly.
# STRENGTHS- No 'request' parameter pollution; helpers can be tested
#             without a Request object; works for asyncio (each Task
#             inherits the contextvar).
# WEAKNESSES- ContextVar is per-task (asyncio) / per-thread; CAN leak
#             between requests if you forget to reset (clear at request end).
import contextvars
from typing import Any
from fastapi import FastAPI, Request

# Per-request store. Default to an empty dict — but each request must
# replace this default with its own dict, otherwise multiple requests
# share state.
_cache_var: contextvars.ContextVar[dict[Any, Any]] = contextvars.ContextVar(
    "request_cache",
)

def get_request_cache() -> dict:
    return _cache_var.get()                           # raises LookupError if not set

app = FastAPI()

@app.middleware("http")
async def attach_cache(request: Request, call_next):
    token = _cache_var.set({})
    try:
        return await call_next(request)
    finally:
        _cache_var.reset(token)                       # MUST reset; ContextVar persists per-task

# Helpers — no Request arg needed.
def get_user(user_id: int) -> dict:
    cache = get_request_cache()
    if user_id in cache:
        return cache[user_id]
    user = db_fetch_user(user_id)
    cache[user_id] = user
    return user

def db_fetch_user(uid: int) -> dict:
    print(f"[DB] fetching user {uid}")
    return {"id": uid, "name": f"u{uid}"}

# Even DEEP helpers see the cache without arg-plumbing.
def render_username(uid: int) -> str:
    return get_user(uid)["name"]                      # cached after first call

@app.get("/dashboard/{user_id}")
async def dashboard(user_id: int):
    return {
        "name": render_username(user_id),             # MISS -> DB
        "name_again": render_username(user_id),       # HIT
    }
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: DataLoader batches multiple load(id)
#             calls in the same event-loop tick into ONE mget(ids); the
#             classic fix for ORM N+1 in async services and GraphQL.
# APPROACH  - Per-request DataLoader with a pending-keys queue;
#             scheduled callback at next event-loop tick resolves the
#             batch; per-id futures resolve from the batch result.
# STRENGTHS - 100 concurrent get_user(id) calls in one request -> 1 DB
#             round-trip; identity map (same id -> same object) preserved.
# WEAKNESSES- More machinery; for read-heavy endpoints worth it.
#             For write-heavy or non-async, intro/junior patterns suffice.
import asyncio
import contextvars
from collections import defaultdict
from typing import Any, Awaitable, Callable, Generic, TypeVar
from fastapi import FastAPI, Request

T = TypeVar("T")

class DataLoader(Generic[T]):
    """
    Batches concurrent .load(key) calls in the same event-loop tick into
    one batch_load_fn(keys) call. Identity-map: same key -> same future.
    """
    def __init__(self, batch_load_fn: Callable[[list[Any]], Awaitable[list[T]]]):
        self._batch_load_fn = batch_load_fn
        self._cache: dict[Any, asyncio.Future[T]] = {}
        self._pending: list[Any] = []
        self._dispatch_scheduled = False

    def load(self, key: Any) -> asyncio.Future[T]:
        if key in self._cache:
            return self._cache[key]
        loop = asyncio.get_event_loop()
        fut: asyncio.Future[T] = loop.create_future()
        self._cache[key] = fut
        self._pending.append(key)
        if not self._dispatch_scheduled:
            self._dispatch_scheduled = True
            loop.call_soon(self._dispatch)
        return fut

    def _dispatch(self) -> None:
        keys = self._pending
        self._pending = []
        self._dispatch_scheduled = False
        asyncio.create_task(self._run_batch(keys))

    async def _run_batch(self, keys: list[Any]) -> None:
        try:
            results = await self._batch_load_fn(keys)
            assert len(results) == len(keys), \
                "batch_load_fn must return one result per key, in order"
            for k, v in zip(keys, results):
                self._cache[k].set_result(v)
        except Exception as e:
            for k in keys:
                if not self._cache[k].done():
                    self._cache[k].set_exception(e)

# 1) Per-request DataLoader, set in middleware.
class RequestLoaders:
    def __init__(self):
        self.users = DataLoader(self._batch_users)

    async def _batch_users(self, ids: list[int]) -> list[dict]:
        print(f"[DB] mget users {ids}")               # ONE call for the whole batch
        # SELECT * FROM users WHERE id = ANY(:ids)
        rows_by_id = {uid: {"id": uid, "name": f"u{uid}"} for uid in ids}
        return [rows_by_id[uid] for uid in ids]

_loaders_var: contextvars.ContextVar[RequestLoaders] = contextvars.ContextVar("loaders")

def loaders() -> RequestLoaders:
    return _loaders_var.get()

app = FastAPI()

@app.middleware("http")
async def attach_loaders(request: Request, call_next):
    token = _loaders_var.set(RequestLoaders())
    try:
        return await call_next(request)
    finally:
        _loaders_var.reset(token)

# 2) Helpers — call .load(); they all batch automatically.
async def get_user(uid: int) -> dict:
    return await loaders().users.load(uid)

@app.get("/dashboard/{user_id}")
async def dashboard(user_id: int):
    # 5 concurrent loads -> 1 mget round-trip.
    user, *friends = await asyncio.gather(
        get_user(user_id),
        get_user(101),
        get_user(102),
        get_user(103),
        get_user(101),                                 # repeat -> identity-map hit
    )
    return {"user": user, "friend_count": len(set(f["id"] for f in friends))}

# Decision rule:
#   share state within one request           -> request.state.cache or ContextVar
#   helpers can't reach 'request'            -> ContextVar pattern
#   N+1 on a relationship                    -> DataLoader (batches in one tick)
#   GraphQL resolver                          -> DataLoader is the canonical answer
#   share across requests                    -> NOT request-scoped; lru_cache or Redis
#   read fresh data per request              -> request-scoped; never process-scoped
#   need to clear at request end             -> reset() on the ContextVar in finally
#   long-running task (background job)       -> separate scope; create a fresh cache for it
#   per-tenant request isolation              -> include tenant in the cache key
#   DataLoader vs eager-loading (ORM)        -> eager-loading wins when shape is known;
#                                               DataLoader wins for dynamic loads (GraphQL)
#
# Anti-pattern: a module-level dict used as a request-scoped cache.
# The dict is shared across every request the process serves. User A's
# data lands in the dict; user B's request reads it; you've shipped a
# data-leak bug. Request-scoped means request-LIFETIME — a fresh dict
# per request, attached to request.state or a ContextVar reset in
# the request middleware.
```

## Decision Rule

```text
share state within one request           -> request.state.cache or ContextVar
helpers can't reach 'request'            -> ContextVar pattern
N+1 on a relationship                    -> DataLoader (batches in one tick)
GraphQL resolver                          -> DataLoader is the canonical answer
share across requests                    -> NOT request-scoped; lru_cache or Redis
read fresh data per request              -> request-scoped; never process-scoped
need to clear at request end             -> reset() on the ContextVar in finally
long-running task (background job)       -> separate scope; create a fresh cache for it
per-tenant request isolation              -> include tenant in the cache key
DataLoader vs eager-loading (ORM)        -> eager-loading wins when shape is known;
                                            DataLoader wins for dynamic loads (GraphQL)
```

## Anti-Pattern

> [!warning] Anti-pattern
> a module-level dict used as a request-scoped cache.
> The dict is shared across every request the process serves. User A's
> data lands in the dict; user B's request reads it; you've shipped a
> data-leak bug. Request-scoped means request-LIFETIME — a fresh dict
> per request, attached to request.state or a ContextVar reset in
> the request middleware.

## Tips

- Set the ContextVar in middleware AT REQUEST ENTRY; reset it in `finally` AT REQUEST EXIT. Without reset, the cache persists into the next request handled by the same task — a subtle data-leak bug.
- For FastAPI/Starlette, `request.state` is purpose-built for request-scoped state. For deep helpers that don't have a `request` reference, a `ContextVar` is the right tool.
- DataLoader is the answer to "N+1 in an async service or GraphQL resolver". `loaders().users.load(uid)` from anywhere; concurrent calls in the same tick coalesce into one batch.
- The DataLoader's `batch_load_fn` MUST return results in the SAME ORDER as the keys it received. The contract is positional; mismatch silently scrambles results.
- For non-GraphQL services, the simpler `request.state.cache: dict` pattern is usually enough. Reach for DataLoader when you have many parallel async fetches that hit the same datastore.
- NEVER use a module-level dict as a "request cache". It's shared across requests and you ship cross-request data leaks. Request-scoped means request-LIFETIME: fresh per request.

## Common Mistake

> [!warning] Using a module-level dict as a "request-scoped cache". The dict is shared across every request the process serves; user A's data lands in it; user B's next request reads it. That's a cross-request data leak. Use `request.state` or a `ContextVar` reset in middleware — the cache lifetime must equal the request lifetime.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Module-level dict — shared across all requests
_user_cache: dict = {}
def get_user(uid):
    if uid not in _user_cache:
        _user_cache[uid] = db_fetch_user(uid)
    return _user_cache[uid]
```

**Senior:**
```python
# ContextVar dict — fresh per request, reset in middleware
_cache_var: ContextVar[dict] = ContextVar("rcache")
def get_user(uid):
    cache = _cache_var.get()
    if uid not in cache: cache[uid] = db_fetch_user(uid)
    return cache[uid]
```

## See Also

- [[Sections/caching/in-memory/functools-lru-cache|functools.lru_cache / cache — memoize pure functions (Caching)]]
- [[Sections/caching/in-memory/cachetools-policies|cachetools — TTL, LFU, LRU policies + thread-safe wrappers (Caching)]]
- [[Sections/caching/in-memory/_Index|Caching → In-Memory Caching — lru_cache, cachetools, request-scoped]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

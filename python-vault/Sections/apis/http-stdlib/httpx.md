---
type: "entry"
domain: "python"
file: "apis"
section: "http-stdlib"
id: "httpx"
title: "httpx"
category: "HTTP"
subtitle: "Same API as requests but supports async/await"
signature_short: "async with httpx.AsyncClient() as client: r = await client.get(url)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "httpx"
tags:
  - "python"
  - "python/apis"
  - "python/apis/http-stdlib"
  - "category/http"
  - "tier/tiered"
---

# httpx

> Same API as requests but supports async/await

## Overview

httpx has the same API as requests but also supports async with AsyncClient. Use httpx when you need concurrent HTTP requests — with asyncio.gather() you can fetch hundreds of URLs concurrently.

## Signature

```python
async with httpx.AsyncClient() as client: r = await client.get(url)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Sync httpx.get — same shape as requests
# STRENGTHS - Smallest valid usage; identical mental model to requests
# WEAKNESSES- No async; no client reuse
#
import httpx

r = httpx.get("https://api.example.com/users/1", timeout=10)
r.raise_for_status()
print(r.json())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - AsyncClient with gather for concurrent fetches
# STRENGTHS - The whole reason to pick httpx over requests
# WEAKNESSES- Creates a new client per call site; senior tier reuses one
#
import asyncio
import httpx

TIMEOUT = httpx.Timeout(10.0, connect=5.0)

async def fetch_one(client: httpx.AsyncClient, url: str) -> dict:
    r = await client.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

async def fetch_all(urls: list[str]) -> list[dict | None]:
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            *(fetch_one(client, u) for u in urls),
            return_exceptions=True,                  # one failure doesn't kill the rest
        )
    return [r if not isinstance(r, Exception) else None for r in results]

print(asyncio.run(fetch_all([
    "https://api.example.com/users/1",
    "https://api.example.com/users/2",
])))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Process-wide AsyncClient via FastAPI lifespan; pool limits; retries; HTTP/2
# STRENGTHS - The pattern that turns httpx from "fast" to "production-grade"
# WEAKNESSES- N/A
#
import asyncio
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI, Request

# 1) ONE AsyncClient per process — connection pool is shared across all requests
LIMITS    = httpx.Limits(max_connections=100, max_keepalive_connections=20)
TIMEOUT   = httpx.Timeout(10.0, connect=5.0)
TRANSPORT = httpx.AsyncHTTPTransport(retries=3)            # connect-error retries

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(
        base_url="https://api.upstream.com",
        timeout=TIMEOUT,
        limits=LIMITS,
        transport=TRANSPORT,
        headers={"User-Agent": "myapp/1.0"},
        http2=True,                                        # multiplex; fewer TCP conns
    )
    try:
        yield
    finally:
        await app.state.http.aclose()                      # MUST close on shutdown

app = FastAPI(lifespan=lifespan)

@app.get("/users/{uid}")
async def get_user(uid: int, request: Request):
    client: httpx.AsyncClient = request.app.state.http
    r = await client.get(f"/users/{uid}")
    r.raise_for_status()
    return r.json()

# 2) Status-code retry with exponential backoff (httpx doesn't ship one for 5xx)
async def get_with_retry(client, url, attempts=3):
    delay = 0.5
    for i in range(attempts):
        try:
            r = await client.get(url)
            if r.status_code < 500:
                return r
        except httpx.RequestError:
            if i == attempts - 1: raise
        await asyncio.sleep(delay); delay *= 2
    return r

# 3) Streaming for large bodies — chunk-by-chunk; don't materialize 5 GB in RAM
async def download(client, url, path):
    async with client.stream("GET", url) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            async for chunk in r.aiter_bytes(chunk_size=1024 * 1024):
                f.write(chunk)

# Decision rule:
#   sync code path                            -> httpx.get / Client (drop-in for requests)
#   async server (FastAPI, Starlette)         -> ONE AsyncClient on app.state, lifespan-managed
#   one-off async script                       -> async with httpx.AsyncClient(): ...
#   N concurrent fetches                       -> asyncio.gather + return_exceptions=True
#   large download                              -> client.stream("GET", url) + aiter_bytes
#   need recordable mocks for tests             -> respx (httpx-native), not vcrpy
#   tons of concurrent connections to one host  -> http2=True (multiplex)
#
# Anti-pattern: instantiating AsyncClient per request handler
#   ~30 ms TLS handshake every request; FD count climbs; throughput collapses.
#   Create the client ONCE at startup (lifespan) and inject via request.app.state.

asyncio = asyncio
```

## Decision Rule

```text
sync code path                            -> httpx.get / Client (drop-in for requests)
async server (FastAPI, Starlette)         -> ONE AsyncClient on app.state, lifespan-managed
one-off async script                       -> async with httpx.AsyncClient(): ...
N concurrent fetches                       -> asyncio.gather + return_exceptions=True
large download                              -> client.stream("GET", url) + aiter_bytes
need recordable mocks for tests             -> respx (httpx-native), not vcrpy
tons of concurrent connections to one host  -> http2=True (multiplex)
```

## Anti-Pattern

> [!warning] Anti-pattern
> instantiating AsyncClient per request handler
>   ~30 ms TLS handshake every request; FD count climbs; throughput collapses.
>   Create the client ONCE at startup (lifespan) and inject via request.app.state.

## Tips

- `asyncio.gather(*tasks)` fetches all URLs concurrently — much faster than sequential requests
- `return_exceptions=True` in gather prevents one failure from crashing everything else
- `base_url=` in AsyncClient — set it once and use relative paths in each call
- `httpx.Timeout(connect=5, read=30)` sets separate connect and read timeouts

## Common Mistake

> [!warning] Creating a new `AsyncClient` for every request in a loop — this defeats connection pooling. Create one client and reuse it for all requests in the same session.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/apis/http-stdlib/requests|requests (APIs & Frameworks)]]
- [[Sections/apis/http-stdlib/_Index|APIs & Frameworks → HTTP & Standard Library]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

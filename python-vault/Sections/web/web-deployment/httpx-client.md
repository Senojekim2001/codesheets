---
type: "entry"
domain: "python"
file: "web"
section: "web-deployment"
id: "httpx-client"
title: "httpx.AsyncClient"
category: "Deployment"
subtitle: "Async HTTP client, request/response, streaming"
signature_short: "async with httpx.AsyncClient() as client:  |  await client.get(url)  |  await client.post()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "httpx.AsyncClient"
  - "httpx-client"
tags:
  - "python"
  - "python/web"
  - "python/web/web-deployment"
  - "category/deployment"
  - "tier/tiered"
---

# httpx.AsyncClient

> Async HTTP client, request/response, streaming

## Overview

httpx is a modern HTTP client with both sync and async APIs. Use `AsyncClient` in async contexts for non-blocking I/O. It supports all HTTP methods, timeouts, authentication, and streaming.

## Signature

```python
async with httpx.AsyncClient() as client:  |  await client.get(url)  |  await client.post()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One async GET with the context-managed client
# STRENGTHS - The minimum: import, AsyncClient, await client.get
# WEAKNESSES- New client per request; no timeout / retry
#
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://httpbin.org/get")
        r.raise_for_status()                       # raise on 4xx/5xx
        print(r.json())

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Concurrent fetches, JSON POST, explicit timeouts, streaming
# STRENGTHS - The four async I/O shapes you'll actually use
# WEAKNESSES- Still creates a client per call site; no retry policy
#
import asyncio
import httpx

TIMEOUT = httpx.Timeout(connect=5.0, read=10.0, write=5.0, pool=5.0)

async def fetch_one(client: httpx.AsyncClient, url: str):
    r = await client.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

async def fan_out(urls: list[str]):
    async with httpx.AsyncClient() as client:
        # gather runs the coroutines concurrently — total time ~ slowest, not sum
        return await asyncio.gather(*(fetch_one(client, u) for u in urls))

async def post_payload():
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.post("https://httpbin.org/post",
                              json={"key": "value"},
                              headers={"Authorization": "Bearer ..."})
        return r.status_code

async def stream_to_disk(url: str, path: str):
    async with httpx.AsyncClient() as client:
        async with client.stream("GET", url) as r:
            with open(path, "wb") as f:
                async for chunk in r.aiter_bytes():
                    f.write(chunk)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Reused client with connection pool, retries, lifespan in FastAPI
# STRENGTHS - The pattern that wins on throughput AND survives flaky upstreams
# WEAKNESSES- N/A
#
import asyncio, httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request

# 1) ONE client per process — shares its connection pool across all requests.
#    Creating a new AsyncClient per call burns ~30ms on TLS handshake every time.
LIMITS  = httpx.Limits(max_connections=100, max_keepalive_connections=20)
TIMEOUT = httpx.Timeout(10.0, connect=5.0)

# 2) Built-in retry transport — exponential backoff on connect/read errors.
#    For status-code retries (502/503/504), wrap in your own loop.
TRANSPORT = httpx.AsyncHTTPTransport(retries=3)

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(
        base_url="https://api.upstream.com",
        timeout=TIMEOUT,
        limits=LIMITS,
        transport=TRANSPORT,
        headers={"User-Agent": "myservice/1.0"},
        http2=True,                              # multiplex over fewer TCP conns
    )
    try:
        yield
    finally:
        await app.state.http.aclose()            # MUST close on shutdown

app = FastAPI(lifespan=lifespan)

# 3) Use the shared client; never instantiate AsyncClient inside a handler
@app.get("/fetch/{key}")
async def fetch(key: str, request: Request):
    client: httpx.AsyncClient = request.app.state.http
    r = await client.get(f"/items/{key}")
    if r.status_code == 404:
        return {"item": None}
    r.raise_for_status()
    return r.json()

# 4) Status-code retry with backoff (httpx doesn't ship one for 5xx)
async def get_with_5xx_retry(client, url, attempts=3):
    delay = 0.5
    for i in range(attempts):
        try:
            r = await client.get(url)
            if r.status_code < 500:
                return r
        except httpx.RequestError:
            if i == attempts - 1: raise
        await asyncio.sleep(delay)
        delay *= 2
    return r

# Decision rule:
#   one-off script, < 10 calls            -> async with httpx.AsyncClient(): ...
#   service that calls other services      -> ONE long-lived client at app startup
#   sync code path / Django view           -> httpx.Client (sync) — don't mix loops
#   need recording for tests                -> respx (httpx) for mocking, vcrpy for replay
#   gRPC / streaming-heavy                  -> grpc.aio or httpx.AsyncClient with stream()
#
# Anti-pattern: forgetting client.aclose()
#   Connections leak; the OS file-descriptor table fills; new connects start
#   timing out under load. Use lifespan or async with — never bare instantiation.
```

## Decision Rule

```text
one-off script, < 10 calls            -> async with httpx.AsyncClient(): ...
service that calls other services      -> ONE long-lived client at app startup
sync code path / Django view           -> httpx.Client (sync) — don't mix loops
need recording for tests                -> respx (httpx) for mocking, vcrpy for replay
gRPC / streaming-heavy                  -> grpc.aio or httpx.AsyncClient with stream()
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting client.aclose()
>   Connections leak; the OS file-descriptor table fills; new connects start
>   timing out under load. Use lifespan or async with — never bare instantiation.

## Tips

- Always use `async with` to ensure connections are closed.
- Set `timeout=` to prevent hanging on slow APIs.
- Reuse `AsyncClient` connections within the same context for efficiency.

## Common Mistake

> [!warning] Creating a new AsyncClient for each request (inefficient).

## Shorthand (Junior → Senior)

**Junior:**
```python
async def get_data(url: str):
    client = httpx.AsyncClient()
    try:
        response = await client.get(url)
        return response.json()
    finally:
        await client.aclose()
```

**Senior:**
```python
async def get_data(url: str):
    async with httpx.AsyncClient() as client:
        return (await client.get(url)).json()
```

## See Also

- [[Sections/web/web-deployment/gunicorn|gunicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/uvicorn|uvicorn (Web (Flask, Django))]]
- [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access (Data Apps)]]
- [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions (Data Apps)]]
- [[Sections/web/web-deployment/_Index|Web (Flask, Django) → WSGI/ASGI & Deployment]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

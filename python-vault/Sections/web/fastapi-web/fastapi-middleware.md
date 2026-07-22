---
type: "entry"
domain: "python"
file: "web"
section: "fastapi-web"
id: "fastapi-middleware"
title: "@app.middleware, CORSMiddleware"
category: "FastAPI"
subtitle: "CORS configuration, custom middleware, logging"
signature_short: "@app.middleware(\"http\")  |  app.add_middleware(CORSMiddleware)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@app.middleware, CORSMiddleware"
  - "fastapi-middleware"
tags:
  - "python"
  - "python/web"
  - "python/web/fastapi-web"
  - "category/fastapi"
  - "tier/tiered"
---

# @app.middleware, CORSMiddleware

> CORS configuration, custom middleware, logging

## Overview

FastAPI middleware intercepts requests and responses in a Starlette-compatible way. Use `CORSMiddleware` for cross-origin access, or create custom middleware with `@app.middleware("http")` to log, modify headers, or validate requests.

## Signature

```python
@app.middleware("http")  |  app.add_middleware(CORSMiddleware)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One CORS middleware so a browser can hit the API
# STRENGTHS - Smallest valid CORS setup for local dev
# WEAKNESSES- Wide-open origins; not safe to ship
#
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # be explicit even in dev
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello"}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - CORS plus a custom HTTP middleware that times every request
# STRENGTHS - Shows the @app.middleware shape and the call_next baton-pass
# WEAKNESSES- No GZip, no error handling around call_next
#
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS — pin specific origins in real apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def add_timing(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)            # MUST await; never block the loop
    response.headers["X-Process-Time"] = f"{(time.perf_counter()-t0)*1000:.1f}ms"
    return response

@app.get("/")
async def root():
    return {"ok": True}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Layered middleware: trust proxy, GZip, request-ID, CORS, error wrap
# STRENGTHS - The hardening real FastAPI services ship: ordering, security, observability
# WEAKNESSES- N/A
#
import os, time, uuid, logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

log = logging.getLogger("app")
app = FastAPI()

# 1) Order matters — middleware runs in REVERSE registration order on the response.
#    Add the outer-most concerns FIRST so they wrap everything below.
app.add_middleware(TrustedHostMiddleware,
                   allowed_hosts=["api.example.com", "*.example.com"])
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(CORSMiddleware,
                   allow_origins=os.getenv("CORS_ORIGINS", "").split(",") or [],
                   allow_credentials=True,
                   allow_methods=["GET", "POST", "PUT", "DELETE"],
                   allow_headers=["Authorization", "Content-Type"])

# 2) Class-based middleware is easier to test and parameterize than @app.middleware
class RequestContext(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex
        request.state.request_id = rid
        t0 = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            log.exception("unhandled", extra={"rid": rid, "path": request.url.path})
            raise
        response.headers["X-Request-Id"] = rid
        log.info("req", extra={"rid": rid, "path": request.url.path,
                               "status": response.status_code,
                               "ms": (time.perf_counter()-t0)*1000})
        return response

app.add_middleware(RequestContext)

# Decision rule:
#   browser frontend hits the API         -> CORSMiddleware, pin origins explicitly
#   behind a load balancer / proxy        -> TrustedHostMiddleware + ProxyHeadersMiddleware
#   responses > 500 bytes                 -> GZipMiddleware
#   per-request correlation               -> class-based middleware writing to request.state
#   auth / rate limit                      -> dependencies, NOT middleware (better DI surface)
#
# Anti-pattern: allow_origins=["*"] WITH allow_credentials=True
#   The browser refuses to send cookies; auth silently breaks. Either pin origins
#   OR drop credentials — never both wide open at once.
```

## Decision Rule

```text
browser frontend hits the API         -> CORSMiddleware, pin origins explicitly
behind a load balancer / proxy        -> TrustedHostMiddleware + ProxyHeadersMiddleware
responses > 500 bytes                 -> GZipMiddleware
per-request correlation               -> class-based middleware writing to request.state
auth / rate limit                      -> dependencies, NOT middleware (better DI surface)
```

## Anti-Pattern

> [!warning] Anti-pattern
> allow_origins=["*"] WITH allow_credentials=True
>   The browser refuses to send cookies; auth silently breaks. Either pin origins
>   OR drop credentials — never both wide open at once.

## Tips

- Set `allow_origins=["https://example.com"]` to restrict CORS in production.
- Custom middleware must be async and call `call_next(request)` to continue.
- Middleware order matters; add them before route definitions.
- Auth and rate limiting belong in `Depends()` dependencies, not middleware — better DI surface, per-route opt-in, and trivial to mock in tests
- Behind a load balancer / proxy add `TrustedHostMiddleware` + `ProxyHeadersMiddleware`; for responses >500 bytes add `GZipMiddleware`

## Common Mistake

> [!warning] Using `allow_origins=["*"]` with `allow_credentials=True` (security risk).

## Shorthand (Junior → Senior)

**Junior:**
```python
from fastapi.middleware.cors import CORSMiddleware
cors_config = {
    "allow_origins": ["https://example.com"],
    "allow_credentials": True,
    "allow_methods": ["GET", "POST"],
    "allow_headers": ["*"],
}
app.add_middleware(CORSMiddleware, **cors_config)
```

**Senior:**
```python
app.add_middleware(CORSMiddleware, allow_origins=["https://example.com"], allow_credentials=True)
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/web/fastapi-web/_Index|Web (Flask, Django) → FastAPI]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

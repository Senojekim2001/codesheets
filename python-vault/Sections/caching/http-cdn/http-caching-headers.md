---
type: "entry"
domain: "python"
file: "caching"
section: "http-cdn"
id: "http-caching-headers"
title: "HTTP cache headers — Cache-Control, ETag, conditional GETs"
category: "HTTP / CDN Caching"
subtitle: "Cache-Control: public/private/max-age/s-maxage/stale-while-revalidate, ETag, If-None-Match, Last-Modified, Vary, FastAPI/Flask response headers, immutable for hashed assets"
signature_short: "response.headers[\"Cache-Control\"] = \"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400\""
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "HTTP cache headers — Cache-Control, ETag, conditional GETs"
  - "http-caching-headers"
tags:
  - "python"
  - "python/caching"
  - "python/caching/http-cdn"
  - "category/http-cdn-caching"
  - "tier/tiered"
---

# HTTP cache headers — Cache-Control, ETag, conditional GETs

> Cache-Control: public/private/max-age/s-maxage/stale-while-revalidate, ETag, If-None-Match, Last-Modified, Vary, FastAPI/Flask response headers, immutable for hashed assets

## Overview

Cache headers tell every cache (browsers, ISP caches, CDNs, reverse proxies, httpx clients) what to do with your response. The free latency wins live here — without `Cache-Control`, browsers and CDNs apply heuristic rules that often DO cache but at inconsistent durations, leading to stale data with no clear cause. The protocol-correct path: declare freshness with `Cache-Control`, give a validator (`ETag` or `Last-Modified`) so caches can do conditional GETs (revalidate cheaply with 304 Not Modified), and set `Vary` for any header your response varies on (Accept-Encoding, Authorization, etc.). The three examples solve the SAME concrete task — `GET /widgets/{id}` returns a JSON widget; we want browsers and CDNs to cache for 60s/1h, do conditional revalidation, and never serve user A's data to user B — at three depths: literal `Cache-Control: public, max-age=60` → ETag + If-None-Match handling for 304 responses + `Vary` correctness → production with multi-tier directives (`max-age` browser / `s-maxage` CDN / `stale-while-revalidate` graceful), `immutable` for hashed assets, FastAPI dependency wiring.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — GET /widgets/{id} returns JSON; browsers and CDN should cache the response for 60s.
- **Junior** — SAME — but with conditional revalidation (304 Not Modified when the cached copy is still valid) and correct Vary so the CDN doesn't mix encodings or serve another user's data.
- **Senior** — SAME — production: multi-tier directives (browser short, CDN long, stale-while-revalidate for graceful refresh), immutable for hashed asset URLs, FastAPI dependency encapsulating the policy.

## Signature

```python
response.headers["Cache-Control"] = "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - GET /widgets/{id} returns JSON; browsers and CDN should
#             cache the response for 60s.
# APPROACH  - Set Cache-Control: public, max-age=60 on the response.
# STRENGTHS - One header; immediate caching by every well-behaved client.
# WEAKNESSES- No revalidation (the cached copy is fresh for 60s, then
#             a full re-fetch); no per-user privacy control.
from fastapi import FastAPI, Response

app = FastAPI()

WIDGETS = {1: {"id": 1, "name": "thing"}, 2: {"id": 2, "name": "stuff"}}

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int, response: Response):
    widget = WIDGETS[widget_id]
    response.headers["Cache-Control"] = "public, max-age=60"
    return widget

# Effects:
#  - Browser: caches the response for 60s; a second tab loads instantly.
#  - CDN: caches and serves to all users for 60s.
#  - httpx with caching layer (e.g., hishel): same.
#  - After 60s: full request to origin again.

# Cache-Control directives in this example:
#   public      - any cache may store it (browser, CDN, ISP)
#   max-age=60  - fresh for 60 seconds
#
# What's MISSING (for a real API):
#  - No ETag / Last-Modified -> no conditional revalidation; 60s from now
#    everyone re-downloads even if nothing changed.
#  - No Vary -> if the response changes by Accept-Encoding or Authorization,
#    caches will serve the WRONG variant.
#  - 'public' on user-specific data is a privacy bug — see junior tier.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with conditional revalidation (304 Not Modified
#             when the cached copy is still valid) and correct Vary
#             so the CDN doesn't mix encodings or serve another user's data.
# APPROACH  - Compute an ETag from a hash of the response body or a
#             version field on the row; check If-None-Match on the
#             request and return 304 if matches; set Vary appropriately.
# STRENGTHS - Conditional GETs are nearly free (~50 byte 304 vs full body);
#             Vary prevents wrong-variant cache hits; private prevents
#             CDN from leaking user data.
# WEAKNESSES- ETag computation must be cheap — compute from a version
#             field, not by hashing the rendered body every request.
import hashlib, json
from fastapi import FastAPI, Request, Response, status

app = FastAPI()

WIDGETS = {1: {"id": 1, "name": "thing", "version": 7}}

def widget_etag(widget: dict) -> str:
    """Cheap, stable ETag from version + id. Quote per RFC."""
    return f'W/"w-{widget["id"]}-{widget["version"]}"'    # W/ = weak ETag (semantic equality OK)

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int, request: Request, response: Response):
    widget = WIDGETS[widget_id]
    etag = widget_etag(widget)

    # If-None-Match: client asks "is your ETag still <X>? If so, just say so."
    if request.headers.get("if-none-match") == etag:
        response.status_code = status.HTTP_304_NOT_MODIFIED
        response.headers["ETag"] = etag
        response.headers["Cache-Control"] = "public, max-age=60"
        return Response(status_code=304, headers=dict(response.headers))

    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60"
    response.headers["Vary"] = "Accept-Encoding"          # gzip vs br vs identity are different responses
    return widget

# User-specific endpoint: NEVER 'public' (CDN would serve user A's
# response to user B).
@app.get("/me/profile")
async def get_my_profile(request: Request, response: Response):
    user_id = request.headers["x-user-id"]                # from auth
    profile = {"id": user_id, "name": "Alice"}
    response.headers["Cache-Control"] = "private, max-age=300, must-revalidate"
    # 'private' = ONLY the end-user's browser may cache; CDN must not.
    response.headers["Vary"] = "Authorization"            # different auth -> different response
    return profile

# Last-Modified is the alternative validator (use ETag if you have it).
@app.get("/posts/{post_id}")
async def get_post(post_id: int, request: Request, response: Response):
    post = {"id": post_id, "updated_at_iso": "2026-01-15T10:00:00Z"}
    last_modified = post["updated_at_iso"]                # RFC 7232 §2.2
    if request.headers.get("if-modified-since") == last_modified:
        return Response(status_code=304, headers={
            "Last-Modified": last_modified,
            "Cache-Control": "public, max-age=60",
        })
    response.headers["Last-Modified"] = last_modified
    response.headers["Cache-Control"] = "public, max-age=60"
    return post
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: multi-tier directives (browser short,
#             CDN long, stale-while-revalidate for graceful refresh),
#             immutable for hashed asset URLs, FastAPI dependency
#             encapsulating the policy.
# APPROACH  - Per-route cache policy via a Depends() that builds the
#             Cache-Control string; ETag wraps any handler; explicit
#             "no-cache" for sensitive routes; tests assert headers.
# STRENGTHS - Cache policy lives in one place; routes opt in;
#             stale-while-revalidate keeps CDN responsive even when
#             origin is slow; immutable assets are cached forever.
# WEAKNESSES- More machinery; for a 5-route service the junior tier is
#             the right amount.
import hashlib, json
from dataclasses import dataclass
from typing import Annotated, Callable
from fastapi import FastAPI, Request, Response, status, Depends, HTTPException

app = FastAPI()

# 1) Cache policy as a value object.
@dataclass(frozen=True)
class CachePolicy:
    visibility: str = "public"              # public / private / no-store / no-cache
    max_age: int | None = None              # browser TTL
    s_maxage: int | None = None             # shared (CDN) TTL — overrides max_age for shared caches
    stale_while_revalidate: int | None = None
    stale_if_error: int | None = None
    immutable: bool = False                  # for hashed assets that never change
    must_revalidate: bool = False
    vary: tuple[str, ...] = ()

    def to_header(self) -> str:
        parts: list[str] = [self.visibility]
        if self.max_age is not None:                  parts.append(f"max-age={self.max_age}")
        if self.s_maxage is not None:                 parts.append(f"s-maxage={self.s_maxage}")
        if self.stale_while_revalidate is not None:   parts.append(f"stale-while-revalidate={self.stale_while_revalidate}")
        if self.stale_if_error is not None:           parts.append(f"stale-if-error={self.stale_if_error}")
        if self.immutable:                            parts.append("immutable")
        if self.must_revalidate:                      parts.append("must-revalidate")
        return ", ".join(parts)

# Common policies — name them, reuse them.
POLICIES = {
    "short_public":    CachePolicy(max_age=60, s_maxage=3600,
                                   stale_while_revalidate=86400, stale_if_error=86400,
                                   vary=("Accept-Encoding",)),
    "long_public":     CachePolicy(max_age=300, s_maxage=86400,
                                   stale_while_revalidate=86400),
    "user_private":    CachePolicy(visibility="private", max_age=300,
                                   must_revalidate=True, vary=("Authorization",)),
    "no_cache":        CachePolicy(visibility="no-store"),
    "asset_immutable": CachePolicy(max_age=31_536_000, immutable=True),  # 1 year, hashed URLs
}

# 2) Dependency that applies the policy + sets Vary.
def apply_cache(policy_name: str) -> Callable:
    def dep(response: Response) -> CachePolicy:
        policy = POLICIES[policy_name]
        response.headers["Cache-Control"] = policy.to_header()
        if policy.vary:
            response.headers["Vary"] = ", ".join(policy.vary)
        return policy
    return dep

# 3) ETag helper — handles the conditional-GET dance.
def maybe_304(request: Request, etag: str) -> Response | None:
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})
    return None

# 4) Routes — declarative cache policy + ETag.
WIDGETS = {1: {"id": 1, "name": "thing", "version": 7}}

@app.get("/widgets/{widget_id}")
async def get_widget(
    widget_id: int,
    request: Request,
    response: Response,
    _policy: Annotated[CachePolicy, Depends(apply_cache("short_public"))],
):
    widget = WIDGETS[widget_id]
    etag = f'W/"w-{widget["id"]}-{widget["version"]}"'
    if (resp := maybe_304(request, etag)):
        return resp
    response.headers["ETag"] = etag
    return widget

@app.get("/me/profile")
async def get_my_profile(
    request: Request,
    _policy: Annotated[CachePolicy, Depends(apply_cache("user_private"))],
):
    return {"id": request.headers.get("x-user-id"), "name": "Alice"}

# Hashed asset (e.g., /static/app.abc123.js) — cache forever.
@app.get("/static/app.{content_hash}.js")
async def asset(
    content_hash: str,
    _policy: Annotated[CachePolicy, Depends(apply_cache("asset_immutable"))],
):
    return Response(content="// js", media_type="application/javascript")

# 5) Test the headers.
def test_widget_cache_headers():
    from fastapi.testclient import TestClient
    client = TestClient(app)
    res = client.get("/widgets/1")
    assert res.headers["cache-control"] == (
        "public, max-age=60, s-maxage=3600, "
        "stale-while-revalidate=86400, stale-if-error=86400"
    )
    assert res.headers["vary"] == "Accept-Encoding"
    assert "etag" in res.headers
    # Conditional revalidation returns 304.
    res2 = client.get("/widgets/1", headers={"If-None-Match": res.headers["etag"]})
    assert res2.status_code == 304

# Decision rule:
#   public read API                       -> public, max-age=N (browser), s-maxage=M (CDN)
#   slow origin acceptable but not slow UX -> stale-while-revalidate=N (serves stale, refresh in background)
#   origin failure should not error users -> stale-if-error=N (serve stale on origin 5xx)
#   hashed asset URL (...abc123.js)       -> max-age=31536000, immutable
#   user-specific data                    -> private, must-revalidate; NEVER public
#   auth-gated response                   -> Vary: Authorization (or private)
#   varying by encoding                   -> Vary: Accept-Encoding
#   sensitive (no caching at all)         -> no-store (NOT no-cache; that means revalidate, still stored)
#   conditional revalidation              -> ETag (preferred) or Last-Modified
#   ETag from rendered body               -> EXPENSIVE — derive from version/updated_at instead
#   admin / write endpoint                -> Cache-Control: no-store; Vary doesn't help
#   GraphQL POST / writeable endpoints    -> no-store; cache only successful idempotent GETs
#
# Anti-pattern: Cache-Control: public on a user-specific response.
# CDNs and shared proxies will serve user A's response to every other
# user. The classic incident: someone caches /me/profile or /api/orders
# as 'public, max-age=60'; minutes later, support tickets flood in
# about seeing strangers' data. ALWAYS 'private' for any response that
# varies by user, OR set Vary: Authorization (CDN keys per auth header)
# AND audit Vary actually does what you think.
```

## Decision Rule

```text
public read API                       -> public, max-age=N (browser), s-maxage=M (CDN)
slow origin acceptable but not slow UX -> stale-while-revalidate=N (serves stale, refresh in background)
origin failure should not error users -> stale-if-error=N (serve stale on origin 5xx)
hashed asset URL (...abc123.js)       -> max-age=31536000, immutable
user-specific data                    -> private, must-revalidate; NEVER public
auth-gated response                   -> Vary: Authorization (or private)
varying by encoding                   -> Vary: Accept-Encoding
sensitive (no caching at all)         -> no-store (NOT no-cache; that means revalidate, still stored)
conditional revalidation              -> ETag (preferred) or Last-Modified
ETag from rendered body               -> EXPENSIVE — derive from version/updated_at instead
admin / write endpoint                -> Cache-Control: no-store; Vary doesn't help
GraphQL POST / writeable endpoints    -> no-store; cache only successful idempotent GETs
```

## Anti-Pattern

> [!warning] Anti-pattern
> Cache-Control: public on a user-specific response.
> CDNs and shared proxies will serve user A's response to every other
> user. The classic incident: someone caches /me/profile or /api/orders
> as 'public, max-age=60'; minutes later, support tickets flood in
> about seeing strangers' data. ALWAYS 'private' for any response that
> varies by user, OR set Vary: Authorization (CDN keys per auth header)
> AND audit Vary actually does what you think.

## Tips

- Without `Cache-Control`, browsers and CDNs apply heuristic freshness rules — they often DO cache, but at unpredictable durations. Always set an explicit policy, even `no-store` for "absolutely no caching".
- `max-age` is for browsers and end-user caches; `s-maxage` is for shared caches (CDNs). Use both — typically `max-age=60, s-maxage=3600` so browsers re-validate quickly while CDN holds longer.
- `stale-while-revalidate=N` lets the CDN serve a stale response immediately while refreshing in the background — eliminates origin-load spikes on TTL expiry. The single biggest CDN performance win.
- `stale-if-error=N` keeps stale responses available when the origin returns 5xx. Pair with stale-while-revalidate so origin outages don't break the user-facing site.
- `Vary: Accept-Encoding` is almost always required (gzip vs br vs identity). `Vary: Authorization` is required for any auth-conditional response. Without `Vary`, the CDN may serve the wrong variant.
- For hashed asset URLs (`app.abc123.js`), use `max-age=31536000, immutable` — the URL changes when the content changes, so it can be cached forever. The `immutable` directive tells browsers to skip even revalidation.

## Common Mistake

> [!warning] `Cache-Control: public` on a user-specific response. CDNs and shared proxies will serve user A's response to every other user — a classic data-leak incident. Use `private` for anything that varies per user, OR `Vary: Authorization` so the CDN keys per auth header (and audit that Vary actually does what you think).

## Shorthand (Junior → Senior)

**Junior:**
```python
# Public on a user response — CDN serves it to every other user
@app.get("/me/profile")
async def get_my_profile(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60"
    return current_user_profile()
```

**Senior:**
```python
# Private + Vary: Authorization — only the auth'd user gets it
response.headers["Cache-Control"] = "private, max-age=300, must-revalidate"
response.headers["Vary"] = "Authorization"
```

## See Also

- [[Sections/caching/http-cdn/cdn-edge-caching|CDN edge caching — surrogate keys, purge, hit-rate debugging (Caching)]]
- [[Sections/caching/http-cdn/_Index|Caching → HTTP & CDN Caching — headers, conditional GETs, edge invalidation]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

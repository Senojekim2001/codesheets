---
type: "entry"
domain: "python"
file: "caching"
section: "http-cdn"
id: "cdn-edge-caching"
title: "CDN edge caching — surrogate keys, purge, hit-rate debugging"
category: "HTTP / CDN Caching"
subtitle: "Surrogate-Key (Fastly), Cache-Tag (Cloudflare), purge API, soft purge, cf-cache-status, x-cache, multi-tier (browser→CDN→origin), stale-on-error"
signature_short: "response.headers[\"Surrogate-Key\"] = f\"widget-{id} widget-list\"; cdn.purge_by_key(\"widget-42\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "CDN edge caching — surrogate keys, purge, hit-rate debugging"
  - "cdn-edge-caching"
tags:
  - "python"
  - "python/caching"
  - "python/caching/http-cdn"
  - "category/http-cdn-caching"
  - "tier/tiered"
---

# CDN edge caching — surrogate keys, purge, hit-rate debugging

> Surrogate-Key (Fastly), Cache-Tag (Cloudflare), purge API, soft purge, cf-cache-status, x-cache, multi-tier (browser→CDN→origin), stale-on-error

## Overview

Once your origin sends correct `Cache-Control` headers, the CDN does most of the work. The remaining decisions are at the edge: tagging responses with surrogate keys for targeted invalidation, choosing soft vs hard purges, debugging hit/miss via cache-status headers, and configuring stale-on-error fallback. Fastly's `Surrogate-Key` and Cloudflare's `Cache-Tag` (Enterprise) give you "delete every cached response associated with this entity" — the only sane invalidation pattern at scale. The three examples solve the SAME concrete task — a CDN caches `GET /widgets/:id` responses for 1h; on widget update, invalidate just that widget's cached responses, fleet-wide, in seconds — at three depths: rely on TTL expiry → surrogate-key tagging + purge API on update → multi-tier strategy with stale-while-revalidate at edge, purge-on-deploy webhook, hit-rate alerting.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — CDN caches GET /widgets/:id responses for 1h.
- **Junior** — SAME — but tag responses with surrogate keys; on widget update, invalidate ONLY responses tagged for that widget.
- **Senior** — SAME — production: multi-tier (browser → CDN → origin) with stale-while-revalidate at every tier; purge-on-deploy via webhook so a deploy clears API responses; hit-rate alerting; cost-aware origin shielding.

## Signature

```python
response.headers["Surrogate-Key"] = f"widget-{id} widget-list"; cdn.purge_by_key("widget-42")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - CDN caches GET /widgets/:id responses for 1h.
# APPROACH  - Origin sends 'Cache-Control: public, s-maxage=3600';
#             CDN respects it; on update, wait or purge via dashboard.
# STRENGTHS - Almost no work — the headers from http-caching-headers
#             entry are enough.
# WEAKNESSES- No targeted invalidation; either wait 1h or purge ALL
#             cached widgets.
from fastapi import FastAPI, Response

app = FastAPI()

WIDGETS = {1: {"id": 1, "name": "thing", "version": 7}}

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int, response: Response):
    widget = WIDGETS[widget_id]
    response.headers["Cache-Control"] = "public, max-age=60, s-maxage=3600"
    response.headers["ETag"] = f'W/"w-{widget["id"]}-{widget["version"]}"'
    return widget

# CDN behavior (Cloudflare/Fastly/CloudFront all similar):
#   - First request: MISS, fetched from origin, cached at edge.
#   - Second request (within 1h): HIT, served from edge in ~10ms.
#   - 1h later: MISS again, refresh from origin.
#
# To invalidate after editing a widget:
#   $ cloudflared cache purge --everything                    # nuclear
# Or via dashboard: Cache → Purge cache → "Purge by URL"
#   https://api.example.com/widgets/42
#
# Problem: nuking all widget caches because one changed wastes 99% of
# the cache. Targeted invalidation (junior tier) fixes that.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tag responses with surrogate keys; on widget
#             update, invalidate ONLY responses tagged for that widget.
# APPROACH  - Origin sets Surrogate-Key (Fastly) / Cache-Tag (Cloudflare)
#             header listing the entities this response includes; on
#             update, call the CDN's purge-by-tag API.
# STRENGTHS - Surgical invalidation; one widget update purges only that
#             widget's responses (plus the lists that include it).
# WEAKNESSES- Surrogate keys: Fastly is built-in; Cloudflare requires
#             Enterprise plan; CloudFront uses ETag-based but no
#             tag-purge. Pick a CDN with this capability if you need it.
import os, json
import httpx
from fastapi import FastAPI, Response

app = FastAPI()

WIDGETS = {1: {"id": 1, "name": "thing", "version": 7}}

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int, response: Response):
    widget = WIDGETS[widget_id]
    response.headers["Cache-Control"] = "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
    response.headers["ETag"] = f'W/"w-{widget["id"]}-{widget["version"]}"'
    # Surrogate keys = tags. Two here: per-widget + the "widget list" group.
    response.headers["Surrogate-Key"] = f"widget-{widget_id} widget-list"
    return widget

@app.get("/widgets")
async def list_widgets(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60, s-maxage=3600"
    response.headers["Surrogate-Key"] = "widget-list"
    return list(WIDGETS.values())

# Purge by tag — Fastly API.
async def fastly_purge_keys(keys: list[str]) -> None:
    """Purge every cached response tagged with any of these keys."""
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.fastly.com/service/{os.environ['FASTLY_SERVICE_ID']}/purge",
            headers={
                "Fastly-Key": os.environ["FASTLY_API_KEY"],
                "Surrogate-Key": " ".join(keys),
                "Accept": "application/json",
            },
        )

# Purge by tag — Cloudflare API (Enterprise plan).
async def cloudflare_purge_tags(tags: list[str]) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.cloudflare.com/client/v4/zones/{os.environ['CF_ZONE_ID']}/purge_cache",
            headers={
                "Authorization": f"Bearer {os.environ['CF_API_TOKEN']}",
                "Content-Type": "application/json",
            },
            json={"tags": tags},
        )

# In your update handler, fire-and-forget the purge.
async def update_widget(widget_id: int, **fields) -> None:
    # ... DB UPDATE that bumps widget version ...
    # Targeted: invalidate this widget's responses + any list containing it.
    await fastly_purge_keys([f"widget-{widget_id}", "widget-list"])

# Debugging hit/miss — CDN sets a header on every response.
# Cloudflare:  cf-cache-status: HIT | MISS | EXPIRED | DYNAMIC | BYPASS | REVALIDATED
# Fastly:      x-cache: HIT, MISS, HIT-WAIT, ...   (also x-cache-hits count)
# CloudFront:  x-cache: Hit from cloudfront / Miss from cloudfront
#
#   $ curl -I https://api.example.com/widgets/1
#   cf-cache-status: HIT
#
# If you get DYNAMIC or BYPASS when expecting HIT, check:
#  - Is Cache-Control set with public + s-maxage > 0?
#  - Is the request method GET (not POST/PUT)?
#  - Are you sending Authorization or cookies that disable caching?
#  - Is the response status 200, 301, or 404 (most CDNs only cache these)?
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: multi-tier (browser → CDN → origin)
#             with stale-while-revalidate at every tier; purge-on-deploy
#             via webhook so a deploy clears API responses; hit-rate
#             alerting; cost-aware origin shielding.
# APPROACH  - Browser: short max-age (30s). CDN: long s-maxage (1h)
#             with SWR (24h). Origin: real freshness. Purge-on-deploy
#             webhook clears specific tags. Datadog/Grafana alert on
#             cache hit ratio dropping below 90%.
# STRENGTHS - Origin sees 1-2% of traffic; CDN absorbs the rest;
#             deploys safely invalidate; user sees instant responses
#             even during origin failures (stale-if-error).
# WEAKNESSES- Operational complexity; surrogate-key strategy must be
#             documented or new endpoints don't get tagged correctly.
import os, time
import httpx
from fastapi import FastAPI, Response, BackgroundTasks
from typing import Iterable

app = FastAPI()

# 1) Origin response policy — multi-tier directives.
def cache_policy(*, public: bool = True, browser_s: int = 30, edge_s: int = 3600,
                 swr_s: int = 86400, sie_s: int = 86400) -> str:
    visibility = "public" if public else "private"
    return (
        f"{visibility}, max-age={browser_s}, s-maxage={edge_s}, "
        f"stale-while-revalidate={swr_s}, stale-if-error={sie_s}"
    )

# 2) Surrogate-key strategy — name the keys consistently.
#    Convention: <entity-type>-<id>; collection keys for lists.
def widget_keys(widget_id: int) -> list[str]:
    return [f"widget-{widget_id}", "widget-list", "deploy-rev"]

@app.get("/widgets/{widget_id}")
async def get_widget(widget_id: int, response: Response):
    widget = {"id": widget_id, "version": 7}
    response.headers["Cache-Control"] = cache_policy()
    response.headers["Surrogate-Key"] = " ".join(widget_keys(widget_id))
    response.headers["ETag"] = f'W/"w-{widget["id"]}-{widget["version"]}"'
    return widget

# 3) Purge — abstracted across providers; fire-and-forget via BackgroundTasks.
class CDNPurger:
    async def purge_keys(self, keys: Iterable[str]) -> None: raise NotImplementedError
    async def purge_url(self, url: str) -> None: raise NotImplementedError

class FastlyPurger(CDNPurger):
    def __init__(self):
        self.svc = os.environ["FASTLY_SERVICE_ID"]
        self.key = os.environ["FASTLY_API_KEY"]

    async def purge_keys(self, keys: Iterable[str]) -> None:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"https://api.fastly.com/service/{self.svc}/purge",
                headers={
                    "Fastly-Key": self.key,
                    "Surrogate-Key": " ".join(keys),
                    # Soft purge keeps the cached entry but marks it stale —
                    # SWR can still serve it during the next refresh.
                    "Fastly-Soft-Purge": "1",
                },
            )
            res.raise_for_status()

PURGER: CDNPurger = FastlyPurger()

# 4) Update endpoint — purge after the source write.
@app.put("/widgets/{widget_id}")
async def update_widget(widget_id: int, body: dict, bg: BackgroundTasks):
    # ... DB UPDATE ...
    bg.add_task(PURGER.purge_keys, widget_keys(widget_id))
    return {"id": widget_id, "updated": True}

# 5) Purge-on-deploy webhook — invalidate every API response when the
#    backend deploys (e.g., the JSON shape changed).
@app.post("/_internal/deploy-hook")
async def on_deploy(deploy_rev: str):
    # 'deploy-rev' is on every cached response's Surrogate-Key.
    # Bumping it purges everything; new responses will tag with the new rev.
    await PURGER.purge_keys(["deploy-rev"])
    return {"ok": True}

# 6) Hit-ratio observability — read CDN logs OR origin's Pull from CDN.
#    Fastly real-time stats API (every minute):
async def get_fastly_hit_ratio() -> float:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://rt.fastly.com/v1/channel/{os.environ['FASTLY_SERVICE_ID']}/ts/h",
            headers={"Fastly-Key": os.environ["FASTLY_API_KEY"]},
        )
        data = res.json()
    rec = data["Data"][0]                              # most recent record
    return rec["hits"] / max(rec["hits"] + rec["miss"], 1)

# Alert: hit ratio < 0.90 -> investigation. Common causes:
#  - Vary header includes too many headers (cache fragmentation)
#  - Cookies on the request bypass cache (configure CDN to ignore noisy cookies)
#  - Authorization on requests that should be public (audit endpoints)
#  - max-age too low for actual freshness
#  - Surrogate-key purges firing too aggressively

# 7) Cost analysis — egress is where the money is.
#    CDN egress is typically 5-10× cheaper than origin egress.
#    Hit ratio of 0.95 = origin sees 5% of traffic.
#    For a 1Gbps/24h service:
#      origin-only:    10TB egress × $0.09/GB = $900/month
#      CDN with 95%:   10TB at edge × $0.02/GB + 0.5TB origin × $0.09/GB = $245/month
#    The CDN bill itself is usually trivial relative to the origin savings.

# Decision rule:
#   public read API                       -> CDN with s-maxage; surrogate keys for invalidation
#   need targeted invalidation            -> Surrogate-Key (Fastly) / Cache-Tag (Cloudflare Enterprise)
#   simple plan, no enterprise tag        -> per-URL purge; live with coarse invalidation
#   user-specific data                    -> private; bypass CDN entirely (or Vary: Authorization)
#   slow origin acceptable                -> stale-while-revalidate=N at edge
#   origin failure must not error users  -> stale-if-error=N at edge
#   hashed asset URLs                     -> immutable + max-age=31536000; never invalidate
#   hot path on a deploy                 -> purge-on-deploy webhook bumping deploy-rev tag
#   hit ratio < 90%                       -> audit Vary, cookies, Authorization, low max-age
#   cost-sensitive                        -> origin shielding (CDN-to-CDN before origin); hit ratio matters
#   GDPR / PII                            -> never cache user-specific responses at edge; private only
#   websockets / SSE                      -> not cacheable; pass through directly to origin
#
# Anti-pattern: fire-and-forget purge AFTER the response goes out.
# Sequence: PUT /widget/42 → 200 OK → background task purges CDN. The
# user that triggered the PUT can see the OLD response on their next
# GET (CDN still has it; they're inside max-age). Two fixes: (a) issue
# the purge BEFORE returning the success response, or (b) use soft
# purge + stale-while-revalidate (the entry is marked stale; the next
# read fetches fresh from origin while the user gets last-known-good
# instantly).
```

## Decision Rule

```text
public read API                       -> CDN with s-maxage; surrogate keys for invalidation
need targeted invalidation            -> Surrogate-Key (Fastly) / Cache-Tag (Cloudflare Enterprise)
simple plan, no enterprise tag        -> per-URL purge; live with coarse invalidation
user-specific data                    -> private; bypass CDN entirely (or Vary: Authorization)
slow origin acceptable                -> stale-while-revalidate=N at edge
origin failure must not error users  -> stale-if-error=N at edge
hashed asset URLs                     -> immutable + max-age=31536000; never invalidate
hot path on a deploy                 -> purge-on-deploy webhook bumping deploy-rev tag
hit ratio < 90%                       -> audit Vary, cookies, Authorization, low max-age
cost-sensitive                        -> origin shielding (CDN-to-CDN before origin); hit ratio matters
GDPR / PII                            -> never cache user-specific responses at edge; private only
websockets / SSE                      -> not cacheable; pass through directly to origin
```

## Anti-Pattern

> [!warning] Anti-pattern
> fire-and-forget purge AFTER the response goes out.
> Sequence: PUT /widget/42 → 200 OK → background task purges CDN. The
> user that triggered the PUT can see the OLD response on their next
> GET (CDN still has it; they're inside max-age). Two fixes: (a) issue
> the purge BEFORE returning the success response, or (b) use soft
> purge + stale-while-revalidate (the entry is marked stale; the next
> read fetches fresh from origin while the user gets last-known-good
> instantly).

## Tips

- Surrogate keys (Fastly built-in; Cloudflare Cache-Tag on Enterprise) are the right invalidation primitive at scale. Tag every response with `<entity-type>-<id>` plus collection tags; purge by tag on update.
- Use `Fastly-Soft-Purge: 1` (or equivalent) — soft purges mark the entry stale rather than deleting it, so `stale-while-revalidate` can still serve it while refresh runs. Hard purges create cache stampedes at the edge.
- Always include a `deploy-rev` surrogate key on every cached response. On deploy, purge by `deploy-rev` to invalidate everything; new responses tag with the new rev. The hammer that's never wrong.
- Debug HIT/MISS via the cache-status header: Cloudflare uses `cf-cache-status`; Fastly uses `x-cache` + `x-cache-hits`; CloudFront uses `x-cache`. If you expected HIT and got DYNAMIC/BYPASS, audit Cache-Control + Vary + cookies on the request.
- Hit ratio is the headline metric. Below 90% means cache fragmentation — usually too-broad Vary, noisy cookies bypassing cache, or unnecessarily-private responses. CDN-side log analysis tells you which.
- Multi-tier directives: short `max-age` for browsers (30s), long `s-maxage` for CDN (1h), generous `stale-while-revalidate` (24h), `stale-if-error` (24h). Browsers re-validate quickly; the edge absorbs the bulk; users see instant responses even during origin issues.

## Common Mistake

> [!warning] Fire-and-forget CDN purge AFTER returning the success response. Sequence: `PUT /widget/42` → 200 OK → background task purges CDN. The user that triggered the PUT then sees the OLD response on their next GET because the CDN still has it. Fix: either (a) issue the purge BEFORE returning success, or (b) use soft purge + stale-while-revalidate so the entry is marked stale and the next read fetches fresh while the user gets last-known-good.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Background purge — user sees stale data after their own PUT
@app.put("/widgets/{wid}")
async def update_widget(wid, body, bg: BackgroundTasks):
    db_update(wid, **body)
    bg.add_task(purge_keys, [f"widget-{wid}"])
    return {"ok": True}                  # CDN still has OLD widget
```

**Senior:**
```python
# Purge synchronously before returning, OR use soft purge + SWR
async def update_widget(wid, body):
    db_update(wid, **body)
    await PURGER.purge_keys([f"widget-{wid}"])     # synchronous OR soft purge
    return {"ok": True}
```

## See Also

- [[Sections/caching/http-cdn/http-caching-headers|HTTP cache headers — Cache-Control, ETag, conditional GETs (Caching)]]
- [[Sections/caching/http-cdn/_Index|Caching → HTTP & CDN Caching — headers, conditional GETs, edge invalidation]]
- [[Sections/caching/_Index|Caching index]]
- [[_Index|Vault index]]

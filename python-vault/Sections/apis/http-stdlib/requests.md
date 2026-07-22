---
type: "entry"
domain: "python"
file: "apis"
section: "http-stdlib"
id: "requests"
title: "requests"
category: "HTTP"
subtitle: "GET, POST, auth, sessions, error handling — always set timeout="
signature_short: "requests.get(url, params={}, headers={}, timeout=10)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "requests"
tags:
  - "python"
  - "python/apis"
  - "python/apis/http-stdlib"
  - "category/http"
  - "tier/tiered"
---

# requests

> GET, POST, auth, sessions, error handling — always set timeout=

## Overview

requests is the standard sync HTTP library. Always set timeout= — without it, a hung server blocks your program forever. Use Session to reuse TCP connections across multiple requests to the same host.

## Signature

```python
requests.get(url, params={}, headers={}, timeout=10)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - GET with timeout, raise_for_status, .json()
# STRENGTHS - The four lines every API call needs
# WEAKNESSES- No session, no error handling, no auth
#
import requests

r = requests.get("https://api.example.com/users/1", timeout=10)
r.raise_for_status()                          # raise on 4xx/5xx
print(r.json())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Session for connection reuse, params/headers/json, typed exception handling
# STRENGTHS - The shape every real client function takes
# WEAKNESSES- No retry/backoff, no streaming, no auth flows
#
import requests

# Session reuses TCP + base headers — ~3x faster for many calls to the same host
session = requests.Session()
session.headers.update({"Authorization": "Bearer token", "User-Agent": "myapp/1.0"})

def list_users(page: int = 1) -> list[dict]:
    try:
        r = session.get(
            "https://api.example.com/users",
            params={"page": page, "limit": 50},
            timeout=10,                       # MANDATORY — without this, hangs forever
        )
        r.raise_for_status()
        return r.json()
    except requests.HTTPError as e:           # 4xx/5xx
        raise RuntimeError(f"http {e.response.status_code}: {e.response.text[:200]}")
    except requests.Timeout:
        raise RuntimeError("upstream timeout")
    except requests.ConnectionError:
        raise RuntimeError("network error")

def create_user(payload: dict) -> dict:
    r = session.post("https://api.example.com/users", json=payload, timeout=10)
    r.raise_for_status()
    return r.json()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Retry/backoff via HTTPAdapter, streaming, separate connect/read timeouts
# STRENGTHS - The hardening that makes a sync HTTP client production-grade
# WEAKNESSES- N/A
#
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

# 1) Retry with exponential backoff — only for safe / idempotent statuses + methods
def make_session(*, total: int = 5, backoff: float = 0.5) -> requests.Session:
    s = requests.Session()
    s.mount("https://", HTTPAdapter(max_retries=Retry(
        total=total,
        backoff_factor=backoff,                                   # 0.5, 1, 2, 4, 8 s
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=frozenset(["GET", "PUT", "DELETE", "OPTIONS", "HEAD"]),
        respect_retry_after_header=True,
    )))
    s.mount("http://", HTTPAdapter(max_retries=Retry(total=2)))
    return s

# 2) Separate connect / read timeouts — you usually want short connect, long read
TIMEOUT = (5, 30)                                                # (connect, read)

session = make_session()
session.headers.update({"User-Agent": "myapp/1.0"})

# 3) Streaming download — never load a 5 GB body into memory
def download(url: str, path: str):
    with session.get(url, stream=True, timeout=TIMEOUT) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)

# 4) Streaming JSON / NDJSON — process line-by-line
def stream_events(url: str):
    with session.get(url, stream=True, timeout=TIMEOUT) as r:
        r.raise_for_status()
        for line in r.iter_lines(decode_unicode=True):
            if line:
                yield line                                       # caller json.loads()

# 5) Verify TLS in production. Never disable for "convenience."
session.verify = True                                            # default; never set False in prod

# Decision rule:
#   one-off script, no concurrency           -> requests.get/post with timeout
#   many calls, same host                     -> Session()
#   transient 5xx / 429 expected              -> Session + Retry(status_forcelist=...)
#   downloads / large bodies                  -> stream=True + iter_content
#   per-line streaming JSON                    -> stream=True + iter_lines
#   need async (>10s of concurrent calls)     -> switch to httpx.AsyncClient
#
# Anti-pattern: requests.get(url) with NO timeout
#   The default is None — wait forever. One misbehaving upstream wedges the
#   whole process. Always pass timeout= (a tuple is even better).
```

## Decision Rule

```text
one-off script, no concurrency           -> requests.get/post with timeout
many calls, same host                     -> Session()
transient 5xx / 429 expected              -> Session + Retry(status_forcelist=...)
downloads / large bodies                  -> stream=True + iter_content
per-line streaming JSON                    -> stream=True + iter_lines
need async (>10s of concurrent calls)     -> switch to httpx.AsyncClient
```

## Anti-Pattern

> [!warning] Anti-pattern
> requests.get(url) with NO timeout
>   The default is None — wait forever. One misbehaving upstream wedges the
>   whole process. Always pass timeout= (a tuple is even better).

## Tips

- Always set `timeout=` — without it, requests can hang forever
- `r.raise_for_status()` is one line to raise on any 4xx/5xx — always call before `r.json()`
- `Session` reuses TCP connections — ~3x faster for multiple requests to the same host
- `requests.get(..., verify=False)` disables SSL verification — never in production
- For transient 5xx / 429 responses, mount a `urllib3.util.Retry(status_forcelist=[429,500,502,503,504], backoff_factor=...)` on the Session — never hand-roll a retry loop
- Large bodies / downloads: use `stream=True` + `iter_content` (or `iter_lines` for line-delimited JSON) so memory does not balloon to the response size

## Common Mistake

> [!warning] Not setting `timeout=`. A single hung server request will block your entire program indefinitely. Always pass `timeout=10` (or higher for slow APIs).

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/apis/http-stdlib/httpx|httpx (APIs & Frameworks)]]
- [[Sections/apis/http-stdlib/_Index|APIs & Frameworks → HTTP & Standard Library]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

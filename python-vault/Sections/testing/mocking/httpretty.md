---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "httpretty"
title: "httpretty"
category: "Mocking"
subtitle: "Socket-level interception — library-agnostic HTTP mocking"
signature_short: "@httpretty.activate | httpretty.register_uri(GET, url, body=...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "httpretty"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# httpretty

> Socket-level interception — library-agnostic HTTP mocking

## Overview

httpretty mocks HTTP requests at the socket level, intercepting all HTTP libraries (requests, urllib, httpx, etc.). More flexible than responses but slightly heavier. Use when you need to mock multiple HTTP libraries or have unusual HTTP scenarios.

## Signature

```python
@httpretty.activate | httpretty.register_uri(GET, url, body=...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @httpretty.activate + register_uri for one GET
# STRENGTHS - Smallest socket-level mock; works with ANY HTTP library
# WEAKNESSES- Slower than responses; no library-specific matchers
#
import httpretty, requests

@httpretty.activate
def test_get_user():
    httpretty.register_uri(
        httpretty.GET,
        "https://api.example.com/users/1",
        body='{"id": 1, "name": "Alice"}',
        status=200,
    )
    r = requests.get("https://api.example.com/users/1")
    assert r.json()["name"] == "Alice"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-library, headers, latest_request inspection, context-manager form
# STRENGTHS - The features that justify reaching for httpretty over responses
# WEAKNESSES- Slower; some libraries (httpx) bypass socket layer
#
import httpretty
import urllib.request           # works with urllib too — that's the point
import requests

def test_works_for_two_libraries():
    with httpretty.enabled():
        httpretty.register_uri(
            httpretty.GET,
            "https://api.example.com/data",
            body='[1, 2, 3]',
            status=200,
            adding_headers={"X-RateLimit-Remaining": "42"},
        )
        # requests library
        r = requests.get("https://api.example.com/data")
        assert r.headers["X-RateLimit-Remaining"] == "42"

        # urllib also intercepted at socket layer
        with urllib.request.urlopen("https://api.example.com/data") as r2:
            body = r2.read()
        assert body == b"[1, 2, 3]"

        # Inspect the LAST request httpretty saw
        last = httpretty.last_request()
        assert last.method == "GET"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pick the right tool: httpretty vs responses vs respx; gotchas
# STRENGTHS - Stops you reaching for the wrong HTTP-mock library
# WEAKNESSES- N/A
#
import httpretty

# 1) httpretty operates at the SOCKET level. It mocks anything that goes through
#    Python's socket module — requests, urllib, urllib3.
#    It does NOT mock httpx (uses its own transport) or aiohttp (asyncio sockets).
#    For those: respx (httpx) and aioresponses (aiohttp).

# 2) Streaming responses — httpretty handles chunked bodies via a callback
def stream_body(request, uri, response_headers):
    return [200, response_headers, "chunk1\nchunk2\nchunk3"]

with httpretty.enabled():
    httpretty.register_uri(
        httpretty.GET, "https://api.example.com/stream",
        body=stream_body,
    )

# 3) Inspect ALL requests made during a test (debug a failing assertion)
with httpretty.enabled(allow_net_connect=False):       # block real network
    # ... run code under test ...
    for req in httpretty.latest_requests():
        print(req.method, req.url, dict(req.querystring))

# 4) Don't mix httpretty with another HTTP mocker (responses, respx) in the same
#    test process — interceptor stacking is undefined and breaks intermittently.

# Decision rule:
#   code uses requests / urllib                -> responses (lighter, faster, type-safe)
#   code uses httpx                             -> respx (httpx-native transport)
#   code uses aiohttp                            -> aioresponses
#   code uses MULTIPLE HTTP libraries             -> httpretty (socket-level catches all)
#   need to inspect raw bytes / headers           -> httpretty's last_request / latest_requests
#   need to BLOCK real network during tests       -> allow_net_connect=False (httpretty) or
#                                                    pytest-socket plugin
#
# Anti-pattern: assuming httpretty mocks httpx or aiohttp
#   Both bypass the socket layer for performance. The mock seems to install but
#   no requests are intercepted. Use respx / aioresponses for those clients.
```

## Decision Rule

```text
code uses requests / urllib                -> responses (lighter, faster, type-safe)
code uses httpx                             -> respx (httpx-native transport)
code uses aiohttp                            -> aioresponses
code uses MULTIPLE HTTP libraries             -> httpretty (socket-level catches all)
need to inspect raw bytes / headers           -> httpretty's last_request / latest_requests
need to BLOCK real network during tests       -> allow_net_connect=False (httpretty) or
                                                 pytest-socket plugin
```

## Anti-Pattern

> [!warning] Anti-pattern
> assuming httpretty mocks httpx or aiohttp
>   Both bypass the socket layer for performance. The mock seems to install but
>   no requests are intercepted. Use respx / aioresponses for those clients.

## Tips

- httpretty works with any HTTP library (requests, urllib, httpx) — responses is requests-only
- httpretty.last_request() accesses details of the last mocked request
- Use body= for string responses or responses= for httpretty.Response objects
- httpretty.reset() clears all registered URIs — useful between tests

## Common Mistake

> [!warning] Mixing httpretty with responses in the same test — they can conflict. Choose one and stick with it for each test.

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

- [[Sections/testing/mocking/patch|unittest.mock.patch() (Testing with pytest)]]
- [[Sections/testing/mocking/responses|responses (Testing with pytest)]]
- [[Sections/testing/mocking/magicmock|MagicMock (Testing with pytest)]]
- [[Sections/testing/mocking/mocker|mocker fixture (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

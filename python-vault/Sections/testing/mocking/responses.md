---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "responses"
title: "responses"
category: "Mocking"
subtitle: "Intercept requests library calls — no code changes needed"
signature_short: "@responses.activate | responses.add(GET, url, json={...})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "responses"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# responses

> Intercept requests library calls — no code changes needed

## Overview

The responses library intercepts HTTP calls made by the requests library and returns fake responses without hitting real servers. No changes to application code required. Use for unit testing code that makes HTTP calls — cleaner and more reliable than manual mocking.

## Signature

```python
@responses.activate | responses.add(GET, url, json={...})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @responses.activate + responses.add for a single GET
# STRENGTHS - Smallest valid HTTP mock for the requests library
# WEAKNESSES- No verification beyond status; no body matching
#
import responses
import requests

@responses.activate
def test_get_user():
    responses.add(
        responses.GET,
        "https://api.example.com/users/1",
        json={"id": 1, "name": "Alice"},
        status=200,
    )
    r = requests.get("https://api.example.com/users/1")
    assert r.json()["name"] == "Alice"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Fixture form, body matchers, asserting calls and request payloads
# STRENGTHS - The shape that scales: fixture per test, matchers, call inspection
# WEAKNESSES- Still requests-only; httpx needs respx
#
import json
import pytest
import responses
from responses import matchers

@pytest.fixture
def http():
    with responses.RequestsMock(assert_all_requests_are_fired=True) as rsps:
        yield rsps                                          # auto-cleans + verifies

def test_creates_user_with_payload(http):
    http.add(
        responses.POST,
        "https://api.example.com/users",
        json={"id": 99, "name": "Bob"},
        status=201,
        match=[matchers.json_params_matcher({"name": "Bob"})],   # only fires for matching body
    )
    import requests
    r = requests.post("https://api.example.com/users", json={"name": "Bob"})
    assert r.status_code == 201
    assert len(http.calls) == 1
    # Inspect the request that was sent
    sent = json.loads(http.calls[0].request.body)
    assert sent == {"name": "Bob"}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Multiple endpoints, sequencing, network blocking, library choice
# STRENGTHS - The patterns that catch real integration bugs without flaky network
# WEAKNESSES- N/A
#
import responses
from responses import matchers

@responses.activate
def test_retries_then_succeeds():
    # Same URL added twice — first call gets the first registration, etc.
    responses.add(responses.GET, "https://api.example.com/x", status=503)   # call 1
    responses.add(responses.GET, "https://api.example.com/x",               # call 2
                  json={"ok": True}, status=200)
    import requests
    r1 = requests.get("https://api.example.com/x"); assert r1.status_code == 503
    r2 = requests.get("https://api.example.com/x"); assert r2.json() == {"ok": True}

# 1) Block ALL unexpected requests — fail-loud rather than hit real network
@responses.activate(assert_all_requests_are_fired=True)
def test_no_unexpected_calls():
    responses.add(responses.GET, "https://api.example.com/v1/health",
                  json={"ok": True})
    import requests
    requests.get("https://api.example.com/v1/health")
    # Any other URL hit -> ConnectionError("not registered")

# 2) Header / query-string matching for endpoints that vary by params
responses.add(
    responses.GET, "https://api.example.com/search",
    json={"results": []},
    match=[matchers.query_param_matcher({"q": "py", "page": "1"})],
)

# 3) Library choice — library MUST match the HTTP client your code uses
#    requests       -> responses
#    httpx (sync)    -> respx
#    httpx (async)   -> respx (pytest-httpx is an alternative)
#    aiohttp          -> aioresponses
#    socket-level all -> httpretty (heavier, slower)

# Decision rule:
#   code uses requests, you control it    -> responses
#   code uses httpx                        -> respx
#   need to assert request body / headers   -> responses.matchers.* (or respx equivalents)
#   code calls multiple HTTP libs           -> httpretty (socket-level)
#   third-party lib makes HTTP calls         -> mock at THEIR boundary (their client object)
#
# Anti-pattern: not failing on unexpected URLs
#   Without assert_all_requests_are_fired (or pytest-socket blocking), a test
#   silently calls the real internet, passes locally, and breaks in CI behind a
#   proxy. Block real network access in your CI test config.
```

## Decision Rule

```text
code uses requests, you control it    -> responses
code uses httpx                        -> respx
need to assert request body / headers   -> responses.matchers.* (or respx equivalents)
code calls multiple HTTP libs           -> httpretty (socket-level)
third-party lib makes HTTP calls         -> mock at THEIR boundary (their client object)
```

## Anti-Pattern

> [!warning] Anti-pattern
> not failing on unexpected URLs
>   Without assert_all_requests_are_fired (or pytest-socket blocking), a test
>   silently calls the real internet, passes locally, and breaks in CI behind a
>   proxy. Block real network access in your CI test config.

## Tips

- responses only works with the requests library — use respx for httpx
- Check `len(responses.calls)` to verify the right number of HTTP calls were made
- Use `responses.add(match_querystring=True)` to match specific query parameters
- responses.add() can take match= with matchers like responses.matchers.json_params_matcher()
- Pair the mock with `assert_all_requests_are_fired` (or `pytest-socket` to block real connections) — otherwise an unexpected URL silently calls the real internet, passes locally, and breaks in CI behind a proxy

## Common Mistake

> [!warning] Using unittest.mock.patch to mock requests.get directly. It requires knowing the internal call path and breaks if the library is refactored. Use responses — it intercepts at a higher level.

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

- [[Sections/testing/mocking/patch|unittest.mock.patch() (Testing with pytest)]]
- [[Sections/testing/mocking/httpretty|httpretty (Testing with pytest)]]
- [[Sections/testing/mocking/magicmock|MagicMock (Testing with pytest)]]
- [[Sections/testing/mocking/mocker|mocker fixture (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

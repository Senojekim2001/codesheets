---
type: "entry"
domain: "python"
file: "testing"
section: "mocking"
id: "pytest-asyncio"
title: "pytest-asyncio"
category: "Mocking"
subtitle: "@pytest.mark.asyncio or asyncio_mode=\"auto\" in pytest.ini"
signature_short: "@pytest.mark.asyncio async def test_fn(): await ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest-asyncio"
tags:
  - "python"
  - "python/testing"
  - "python/testing/mocking"
  - "category/mocking"
  - "tier/tiered"
---

# pytest-asyncio

> @pytest.mark.asyncio or asyncio_mode="auto" in pytest.ini

## Overview

pytest-asyncio allows pytest to run async test functions. Either mark each test with @pytest.mark.asyncio or set asyncio_mode="auto" in pytest.ini to apply globally. Also provides async fixtures. Install: pip install pytest-asyncio.

## Signature

```python
@pytest.mark.asyncio async def test_fn(): await ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One async test with @pytest.mark.asyncio
# STRENGTHS - Smallest valid async-test shape
# WEAKNESSES- No async fixtures, no mock
#
# pip install pytest-asyncio
import pytest

async def fetch_user(uid):
    return {"id": uid, "name": "Alice"}

@pytest.mark.asyncio
async def test_fetch_user():
    result = await fetch_user(1)
    assert result["name"] == "Alice"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - asyncio_mode=auto, async fixture, AsyncMock for awaitables
# STRENGTHS - The shape every async test file converges on
# WEAKNESSES- No event_loop scope tweaking, no asyncio.gather flow
#
# pyproject.toml — apply mark to every async test automatically
# [tool.pytest.ini_options]
# asyncio_mode = "auto"

import pytest
import pytest_asyncio
import httpx
from unittest.mock import AsyncMock
from myapp.main import app

# Async fixtures use the async-aware decorator
@pytest_asyncio.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

async def test_get_user(client):                      # no @pytest.mark.asyncio (auto mode)
    r = await client.get("/users/1")
    assert r.status_code == 200

async def test_raises_async():
    with pytest.raises(ValueError):
        await failing_async_function()

# Mock async functions with AsyncMock — NOT MagicMock
async def test_async_mock(mocker):
    mocker.patch("myapp.service.fetch_data",
                 new=AsyncMock(return_value={"id": 1}))
    from myapp.service import wrapper
    assert (await wrapper())["id"] == 1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Event-loop scope, ASGITransport for FastAPI, fakeredis-async, deadlines
# STRENGTHS - The patterns that make async tests fast, isolated, and deterministic
# WEAKNESSES- N/A
#
# pyproject.toml
# [tool.pytest.ini_options]
# asyncio_mode = "auto"
# asyncio_default_fixture_loop_scope = "session"     # one loop for all tests in a session

import asyncio
import pytest
import pytest_asyncio
import httpx

# 1) FastAPI without spinning up a real server: ASGITransport drives the app in-process
@pytest_asyncio.fixture(scope="session")
async def async_client():
    from myapp.main import app
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

# 2) Async fakes for stateful collaborators (Redis, queues) — keep tests fast + offline
@pytest_asyncio.fixture
async def redis():
    import fakeredis.aioredis
    r = fakeredis.aioredis.FakeRedis()
    yield r
    await r.aclose()

# 3) Deadline / timeout pattern — async hangs are silent in unit tests
async def test_request_completes(async_client):
    async with asyncio.timeout(2.0):                  # 3.11+; pytest-asyncio also has @pytest.mark.timeout
        r = await async_client.get("/slow")
        assert r.status_code == 200

# 4) Concurrent assertions — gather lets you exercise concurrency in tests
async def test_concurrent_creates(async_client):
    tasks = [async_client.post("/users", json={"i": i}) for i in range(10)]
    responses = await asyncio.gather(*tasks)
    assert all(r.status_code == 201 for r in responses)

# 5) Mocking awaitable methods on a class — AsyncMock everywhere
async def test_async_method_mock(mocker):
    mock_db = mocker.MagicMock()
    mock_db.get_user = mocker.AsyncMock(return_value={"id": 1})
    user = await mock_db.get_user(1)
    mock_db.get_user.assert_awaited_once_with(1)      # NOT assert_called_*

# Decision rule:
#   testing async function                    -> @pytest.mark.asyncio (or asyncio_mode=auto)
#   FastAPI app                                -> httpx.AsyncClient + ASGITransport(app=app)
#   third-party async client (redis, kafka)    -> async fakes (fakeredis.aioredis, etc.)
#   need to test concurrency                    -> asyncio.gather inside the test
#   tests hanging / flaky                       -> asyncio.timeout or @pytest.mark.timeout
#   mocking an async function                    -> AsyncMock; assert_awaited_* not assert_called_*
#
# Anti-pattern: MagicMock for an async function
#   mock = MagicMock()
#   await mock()    # TypeError: object MagicMock can't be used in 'await' expression
#   Always AsyncMock for code paths that await.

async def failing_async_function():
    raise ValueError("bad")
```

## Decision Rule

```text
testing async function                    -> @pytest.mark.asyncio (or asyncio_mode=auto)
FastAPI app                                -> httpx.AsyncClient + ASGITransport(app=app)
third-party async client (redis, kafka)    -> async fakes (fakeredis.aioredis, etc.)
need to test concurrency                    -> asyncio.gather inside the test
tests hanging / flaky                       -> asyncio.timeout or @pytest.mark.timeout
mocking an async function                    -> AsyncMock; assert_awaited_* not assert_called_*
```

## Anti-Pattern

> [!warning] Anti-pattern
> MagicMock for an async function
>   mock = MagicMock()
>   await mock()    # TypeError: object MagicMock can't be used in 'await' expression
>   Always AsyncMock for code paths that await.

## Tips

- Set asyncio_mode = "auto" in pytest.ini to avoid @pytest.mark.asyncio on every test
- Use AsyncMock not MagicMock when mocking async functions — MagicMock does not support await
- httpx.AsyncClient with app= lets you test FastAPI without starting a real server
- Async fixtures must use @pytest_asyncio.fixture, not @pytest.fixture

## Common Mistake

> [!warning] Using MagicMock for an async function. `mock = MagicMock(); await mock()` raises TypeError. Use `AsyncMock` for anything that will be awaited.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/testing/mocking/patch|unittest.mock.patch() (Testing with pytest)]]
- [[Sections/testing/mocking/responses|responses (Testing with pytest)]]
- [[Sections/testing/mocking/httpretty|httpretty (Testing with pytest)]]
- [[Sections/testing/mocking/magicmock|MagicMock (Testing with pytest)]]
- [[Sections/testing/mocking/_Index|Testing with pytest → Mocking]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

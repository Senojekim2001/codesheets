---
type: "entry"
domain: "python"
file: "web"
section: "fastapi-web"
id: "fastapi-websockets"
title: "@app.websocket()"
category: "FastAPI"
subtitle: "WebSocket endpoint, client connections, messaging"
signature_short: "@app.websocket(\"/ws\")  |  await websocket.accept()  |  await websocket.send_json()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@app.websocket()"
  - "fastapi-websockets"
tags:
  - "python"
  - "python/web"
  - "python/web/fastapi-web"
  - "category/fastapi"
  - "tier/tiered"
---

# @app.websocket()

> WebSocket endpoint, client connections, messaging

## Overview

WebSocket endpoints enable real-time communication between client and server. Use `@app.websocket()` to define an endpoint, `await websocket.accept()` to establish the connection, and `await websocket.receive_text()/send_json()` for messaging.

## Signature

```python
@app.websocket("/ws")  |  await websocket.accept()  |  await websocket.send_json()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One echo WebSocket: accept, receive, send, repeat
# STRENGTHS - Smallest valid endpoint with the accept/receive/send loop
# WEAKNESSES- No disconnect handling; no JSON; no broadcast
#
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def echo(ws: WebSocket):
    await ws.accept()                          # always first
    while True:
        msg = await ws.receive_text()
        await ws.send_text(f"echo: {msg}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Disconnect handling, JSON messages, per-connection state
# STRENGTHS - Real-world idioms: WebSocketDisconnect, send_json, query params
# WEAKNESSES- Still single-connection; no broadcast / connection manager
#
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/chat")
async def chat(ws: WebSocket, user: str = "anon"):    # query params work in WS too
    await ws.accept()
    try:
        await ws.send_json({"system": f"hi {user}"})
        while True:
            data = await ws.receive_json()             # {"text": "..."}
            await ws.send_json({"user": user, "text": data["text"]})
    except WebSocketDisconnect:
        # Client closed the socket. NEVER call ws.close() again here.
        print(f"{user} disconnected")
    except Exception:
        # Any other error: close with a code so the client knows why.
        await ws.close(code=1011)
        raise
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Connection manager for broadcast, auth-on-handshake, ping/pong
# STRENGTHS - The patterns that turn /ws from a demo into a chat / live-update service
# WEAKNESSES- N/A
#
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
import asyncio

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.active.add(ws)

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            self.active.discard(ws)

    async def broadcast(self, payload: dict):
        # Snapshot to avoid mutation during iteration
        async with self._lock:
            sockets = list(self.active)
        # send_json is per-socket; gather with return_exceptions so one bad
        # client doesn't poison the whole broadcast
        await asyncio.gather(*(ws.send_json(payload) for ws in sockets),
                             return_exceptions=True)

manager = ConnectionManager()

# 1) Auth on the WebSocket handshake — close with a code if it fails.
#    Browsers can't read the body of a 401 over WS; close codes are the signal.
def authenticate(token: str | None) -> str | None:
    return "alice" if token == "secret" else None

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, token: str | None = Query(default=None)):
    user = authenticate(token)
    if not user:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(ws)
    try:
        await manager.broadcast({"system": f"{user} joined"})
        while True:
            msg = await ws.receive_json()
            await manager.broadcast({"user": user, "text": msg.get("text", "")})
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(ws)
        await manager.broadcast({"system": f"{user} left"})

# Decision rule:
#   one-off echo / debug                   -> intro shape, no error wrapping
#   single-client live updates              -> junior shape with WebSocketDisconnect
#   N clients seeing the same stream        -> ConnectionManager + broadcast
#   need cross-process pub/sub              -> Redis pub/sub or NATS — not in-memory set
#   browsers behind proxies                  -> ping/pong every 30s (proxy idle timeouts)
#
# Anti-pattern: try/except Exception that swallows WebSocketDisconnect
#   You'll keep the dead socket in the manager forever. Catch WebSocketDisconnect
#   FIRST and unregister; only then catch Exception for the unexpected.
```

## Decision Rule

```text
one-off echo / debug                   -> intro shape, no error wrapping
single-client live updates              -> junior shape with WebSocketDisconnect
N clients seeing the same stream        -> ConnectionManager + broadcast
need cross-process pub/sub              -> Redis pub/sub or NATS — not in-memory set
browsers behind proxies                  -> ping/pong every 30s (proxy idle timeouts)
```

## Anti-Pattern

> [!warning] Anti-pattern
> try/except Exception that swallows WebSocketDisconnect
>   You'll keep the dead socket in the manager forever. Catch WebSocketDisconnect
>   FIRST and unregister; only then catch Exception for the unexpected.

## Tips

- Always wrap WebSocket handling in try/except to catch disconnections.
- Use `receive_json()` and `send_json()` for structured data.
- Call `await websocket.accept()` before sending/receiving.
- Catch `WebSocketDisconnect` FIRST and unregister the socket — a bare `except Exception` swallows it and leaves dead sockets in your ConnectionManager forever
- Cross-process broadcast belongs in Redis pub/sub or NATS — an in-memory `set` only works in single-process dev mode

## Common Mistake

> [!warning] Forgetting to await async WebSocket methods (accept, send, receive).

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            message = await websocket.receive_text()
            response = f"Echo: {message}"
            await websocket.send_text(response)
        except:
            break
```

**Senior:**
```python
@app.websocket("/ws")
async def ws(ws: WebSocket):
    await ws.accept()
    async for msg in ws.iter_text(): await ws.send_text(f"Echo: {msg}")
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/web/fastapi-web/_Index|Web (Flask, Django) → FastAPI]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "network-protocols"
section: "protocols"
id: "websockets-server-client"
title: "websockets — async WS server + client"
category: "protocols"
subtitle: "websockets.serve(handler, host, port) (handler is async fn taking the connection), websockets.connect(url) for clients, async for message in ws (text or bytes), ws.send / ws.recv, ConnectionClosed exception, ping_interval / ping_timeout (keepalive), max_size, websockets.broadcast for fan-out"
signature_short: "async def handle(ws): async for msg in ws: await ws.send(msg.upper())\\nasync with websockets.serve(handle, \"0.0.0.0\", 8765) as srv: await asyncio.Future()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "websockets — async WS server + client"
  - "websockets-server-client"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/protocols"
  - "category/protocols"
  - "tier/tiered"
---

# websockets — async WS server + client

> websockets.serve(handler, host, port) (handler is async fn taking the connection), websockets.connect(url) for clients, async for message in ws (text or bytes), ws.send / ws.recv, ConnectionClosed exception, ping_interval / ping_timeout (keepalive), max_size, websockets.broadcast for fan-out

## Overview

**Server**: `websockets.serve(handler, host, port)` returns a context manager; the handler runs once per connection and lives until the client disconnects. **Client**: `websockets.connect(url)` is also an async context manager. Messages are `str` or `bytes`; the library frames them for you (no length-prefix needed). Use `websockets.broadcast(connections, message)` for one-to-many fan-out (chat rooms, live dashboards). Three depths solve the SAME task — uppercase echo server — at depths: minimal echo → broadcast chat (track all connections, fan out) → authenticated chat with per-client subscriptions, structured JSON messages, graceful shutdown.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — WebSocket echo server: receive a message, send it back uppercased.
- **Junior** — SAME — but a chat room: every client's message goes to all other clients.
- **Senior** — SAME — chat — production: rooms via subscribe message, per-client auth via token query param, structured JSON messages, graceful shutdown.

## Signature

```python
async def handle(ws): async for msg in ws: await ws.send(msg.upper())\nasync with websockets.serve(handle, "0.0.0.0", 8765) as srv: await asyncio.Future()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - WebSocket echo server: receive a message, send it back uppercased.
# APPROACH  - websockets.serve with an async handler.
# STRENGTHS - 10 lines.
# WEAKNESSES- Single client logic; no broadcast; no auth.
import asyncio
import websockets


async def echo(websocket):
    async for message in websocket:
        await websocket.send(message.upper())


async def main():
    async with websockets.serve(echo, "0.0.0.0", 8765):
        print("ws://localhost:8765")
        await asyncio.Future()                         # run forever


asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but a chat room: every client's message goes to all
#             other clients.
# APPROACH  - Track connections in a set; websockets.broadcast for fan-out.
# STRENGTHS - One-to-many in two lines; back-pressure handled per client.
# WEAKNESSES- No auth; no message history for late-joiners; no rooms.
import asyncio
import websockets


CLIENTS: set[websockets.WebSocketServerProtocol] = set()


async def chat(ws):
    CLIENTS.add(ws)
    try:
        await ws.send(f"welcome - {len(CLIENTS)} online")
        async for message in ws:
            # broadcast skips closed connections automatically.
            websockets.broadcast(CLIENTS, f"<{ws.remote_address[0]}> {message}")
    finally:
        CLIENTS.discard(ws)


async def main():
    async with websockets.serve(chat, "0.0.0.0", 8765,
                                ping_interval=20, ping_timeout=10):
        print("chat on ws://localhost:8765")
        await asyncio.Future()


asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — chat — production: rooms via subscribe message,
#             per-client auth via token query param, structured JSON
#             messages, graceful shutdown.
# APPROACH  - dict[room, set[ws]]; first message must be {auth: ...};
#             SIGTERM closes all connections cleanly.
# STRENGTHS - Real chat semantics; auth at handshake; clean shutdown.
# WEAKNESSES- In-process state -> needs Redis / NATS to scale to N processes.
from __future__ import annotations
import asyncio
import json
import signal
import websockets
from collections import defaultdict


VALID_TOKENS = {"alice": "tok_a", "bob": "tok_b"}     # demo only - real auth is more
ROOMS: dict[str, set[websockets.WebSocketServerProtocol]] = defaultdict(set)


async def authenticate(ws) -> str | None:
    """Expect first message {kind: 'auth', user, token}. Return user or None."""
    try:
        first = await asyncio.wait_for(ws.recv(), timeout=5)
        msg = json.loads(first)
    except (asyncio.TimeoutError, json.JSONDecodeError):
        return None
    if msg.get("kind") != "auth": return None
    user = msg.get("user"); token = msg.get("token")
    if VALID_TOKENS.get(user) != token: return None
    return user


async def handler(ws):
    user = await authenticate(ws)
    if not user:
        await ws.close(code=4001, reason="auth required")
        return

    user_rooms: set[str] = set()

    async def join(room: str):
        if room not in user_rooms:
            user_rooms.add(room)
            ROOMS[room].add(ws)
            websockets.broadcast(ROOMS[room],
                                 json.dumps({"kind": "joined", "user": user, "room": room}))

    async def leave(room: str):
        if room in user_rooms:
            user_rooms.remove(room)
            ROOMS[room].discard(ws)

    try:
        await ws.send(json.dumps({"kind": "auth_ok", "user": user}))
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            kind = msg.get("kind")
            if kind == "join":
                await join(msg["room"])
            elif kind == "leave":
                await leave(msg["room"])
            elif kind == "say":
                room = msg.get("room")
                if room in user_rooms:
                    websockets.broadcast(
                        ROOMS[room],
                        json.dumps({"kind": "say", "user": user,
                                    "room": room, "text": msg.get("text", "")})
                    )
    finally:
        for r in list(user_rooms):
            await leave(r)


async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, stop.set)

    async with websockets.serve(
        handler, "0.0.0.0", 8765,
        ping_interval=20, ping_timeout=10, max_size=64 * 1024,
    ):
        print("chat on ws://localhost:8765")
        await stop.wait()
        print("draining...")
        await asyncio.gather(*[ws.close(code=1001, reason="server shutdown")
                               for room in ROOMS.values() for ws in room],
                              return_exceptions=True)


asyncio.run(main())

# Decision rule:
#   Asyncio app, native websockets             -> websockets library.
#   Sync app, want to add WS                   -> use websockets.sync.client / .server
#                                                  (built-in sync wrappers since v12).
#   FastAPI / Starlette app                     -> Starlette's @app.websocket("/ws") wraps
#                                                  websockets internally.
#   Need scale across processes / nodes         -> Redis pub/sub or NATS for cross-node fan-out.
#   Need binary frames                           -> websockets handles bytes natively;
#                                                  send/recv accepts both str + bytes.
#   Need keepalive over flaky networks           -> ping_interval=20 + ping_timeout=10.
#   Browser client                               -> standard JS WebSocket() in the browser;
#                                                  no Python on the client side.
#   Need lower-level WS                          -> wsproto for protocol-only without IO.

# Anti-pattern:
#   while True: msg = await ws.recv()
#                 await slow_db_write(msg)
# Sequential await blocks the next recv. For high-throughput per-connection
# work, fan messages out to a worker pool via asyncio.Queue.
```

## Decision Rule

```text
Asyncio app, native websockets             -> websockets library.
Sync app, want to add WS                   -> use websockets.sync.client / .server
                                               (built-in sync wrappers since v12).
FastAPI / Starlette app                     -> Starlette's @app.websocket("/ws") wraps
                                               websockets internally.
Need scale across processes / nodes         -> Redis pub/sub or NATS for cross-node fan-out.
Need binary frames                           -> websockets handles bytes natively;
                                               send/recv accepts both str + bytes.
Need keepalive over flaky networks           -> ping_interval=20 + ping_timeout=10.
Browser client                               -> standard JS WebSocket() in the browser;
                                               no Python on the client side.
Need lower-level WS                          -> wsproto for protocol-only without IO.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   while True: msg = await ws.recv()
>                 await slow_db_write(msg)
> Sequential await blocks the next recv. For high-throughput per-connection
> work, fan messages out to a worker pool via asyncio.Queue.

## Tips

- `websockets.serve(handler, host, port)` is async-only — `handler(ws)` runs once per connection and lives until close.
- `websockets.broadcast(connections, message)` is the right primitive for fan-out — handles back-pressure and closed connections.
- Keep alives via `ping_interval=20, ping_timeout=10` — drops dead connections quickly across NATs/proxies.
- Cap message size with `max_size=` — default 1 MB; lower it for hostile clients.
- For multi-process scale, fan messages through Redis pub/sub or NATS — process-local state doesn't share.

## Common Mistake

> [!warning] Doing slow synchronous-looking work after `await ws.recv()` — blocks the next `recv` and the connection stalls. Fan messages to a worker pool via `asyncio.Queue`.

## See Also

- [[Sections/network-protocols/protocols/grpc-python|grpcio + protobuf — typed RPC services (Network Protocols)]]
- [[Sections/network-protocols/protocols/_Index|Network Protocols → WebSockets and gRPC]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]

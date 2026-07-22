---
type: "entry"
domain: "python"
file: "network-protocols"
section: "patterns"
id: "network-stack-decision"
title: "sockets vs WebSockets vs gRPC vs HTTP — pick the right tool"
category: "patterns"
subtitle: "sockets (custom protocol, lowest overhead), WebSockets (browser-friendly bidi), gRPC (typed schema, codegen, HTTP/2), REST/HTTP-JSON (universal, debuggable), HTTP/3 + QUIC (UDP-based, lossy networks, multiple streams without HoL blocking), tools: httpx for clients, FastAPI for servers, Starlette for raw ASGI"
signature_short: "# raw socket: socket.socket + frame yourself\\n# ws:        websockets.serve(handler, host, port)\\n# grpc:      grpc.aio.server() + protobuf service\\n# REST:      FastAPI app w/ Pydantic models"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sockets vs WebSockets vs gRPC vs HTTP — pick the right tool"
  - "network-stack-decision"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# sockets vs WebSockets vs gRPC vs HTTP — pick the right tool

> sockets (custom protocol, lowest overhead), WebSockets (browser-friendly bidi), gRPC (typed schema, codegen, HTTP/2), REST/HTTP-JSON (universal, debuggable), HTTP/3 + QUIC (UDP-based, lossy networks, multiple streams without HoL blocking), tools: httpx for clients, FastAPI for servers, Starlette for raw ASGI

## Overview

Five tiers. **Raw sockets**: custom binary protocols, embedded devices, legacy systems. **WebSockets**: any time a browser needs bidi (chat, dashboards, multiplayer). **gRPC**: internal services with known boundaries; typed schemas; streaming free. **REST / HTTP-JSON**: public APIs, anything that needs to be debuggable from `curl`. **HTTP/3 + QUIC**: emerging; helps for many parallel streams (CDNs, mobile networks, gaming). Three depths solve the SAME task — telemetry from devices to a server, reads from browser dashboards — at depths: pure sockets (devices) + WebSockets (browser) → gRPC for devices + WebSockets for browser → MQTT (devices) + REST/HTTP for queries + WebSockets for live UI updates, all behind FastAPI.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Devices send telemetry; browser sees it live.
- **Junior** — SAME — devices -> server -> browser — but devices use gRPC (typed schema) and browsers use WebSockets.
- **Senior** — SAME — devices + browser — production-shaped: MQTT for devices (right protocol for fleet IoT), REST for queries, WebSockets for live UI; FastAPI + aiomqtt + Redis fan-out.

## Signature

```python
# raw socket: socket.socket + frame yourself\n# ws:        websockets.serve(handler, host, port)\n# grpc:      grpc.aio.server() + protobuf service\n# REST:      FastAPI app w/ Pydantic models
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Devices send telemetry; browser sees it live.
# APPROACH  - Raw TCP socket from device; WebSocket from browser.
# STRENGTHS - Both ends in pure Python; no schema lock-in.
# WEAKNESSES- Custom framing on the socket side; no auth; no replay.

# device.py - line-delimited JSON over TCP
import socket, json, time
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("server", 9001))
while True:
    s.sendall((json.dumps({"t": 22.7}) + "\n").encode())
    time.sleep(5)

# server.py - bridge socket to WebSocket
import asyncio, json, websockets

CLIENTS = set()


async def feed_browser(reader, _writer):
    while True:
        line = await reader.readline()
        if not line: break
        websockets.broadcast(CLIENTS, line.decode().rstrip())


async def browser_handler(ws):
    CLIENTS.add(ws)
    try: await ws.wait_closed()
    finally: CLIENTS.discard(ws)


async def main():
    await asyncio.gather(
        asyncio.start_server(feed_browser, "0.0.0.0", 9001).__aenter__(),
        websockets.serve(browser_handler, "0.0.0.0", 8765).__aenter__(),
        asyncio.Future(),
    )

# asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — devices -> server -> browser — but devices use gRPC
#             (typed schema) and browsers use WebSockets.
# APPROACH  - Define telemetry.proto; gRPC server pushes into a broadcast;
#             FastAPI/WebSocket endpoint streams to browsers.
# STRENGTHS - Typed device API; codegen across languages; browser-friendly.
# WEAKNESSES- Two transports to operate; gRPC isn't trivially debuggable
#             from curl.

# telemetry.proto:
"""
service Telemetry {
    rpc Stream (stream Sample) returns (Ack);
}
message Sample { string device = 1; double t = 2; int64 ts = 3; }
message Ack    { int32 received = 1; }
"""

# server.py
import asyncio, json
import grpc
from grpc import aio
from fastapi import FastAPI, WebSocket
import telemetry_pb2 as pb
import telemetry_pb2_grpc as pb_grpc


CLIENTS: set[WebSocket] = set()


class Telemetry(pb_grpc.TelemetryServicer):
    async def Stream(self, request_iterator, context):
        n = 0
        async for s in request_iterator:
            payload = json.dumps({"device": s.device, "t": s.t, "ts": s.ts})
            for ws in list(CLIENTS):
                try:
                    await ws.send_text(payload)
                except Exception:
                    CLIENTS.discard(ws)
            n += 1
        return pb.Ack(received=n)


app = FastAPI()


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    CLIENTS.add(ws)
    try:
        while True:
            await ws.receive_text()                    # keep alive
    finally:
        CLIENTS.discard(ws)


async def serve_grpc():
    server = aio.server()
    pb_grpc.add_TelemetryServicer_to_server(Telemetry(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    await server.wait_for_termination()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — devices + browser — production-shaped: MQTT for devices
#             (right protocol for fleet IoT), REST for queries, WebSockets
#             for live UI; FastAPI + aiomqtt + Redis fan-out.
# APPROACH  - Devices publish via MQTT; aiomqtt subscriber writes to
#             Postgres + fans to Redis pub/sub; FastAPI exposes REST + WS.
# STRENGTHS - Right tool per layer; horizontal scale via Redis; managed
#             persistence; debuggable via REST.
# WEAKNESSES- More moving parts; cost of three subsystems (broker, DB,
#             cache) is real.
# bridge.py
import asyncio, json
import aiomqtt
import asyncpg
import redis.asyncio as redis


async def main():
    pg = await asyncpg.create_pool("postgresql://...")
    r  = redis.from_url("redis://...")

    async def handle(client, msg):
        try:
            data = json.loads(msg.payload)
        except Exception:
            return
        # Persist
        async with pg.acquire() as conn:
            await conn.execute(
                "INSERT INTO telemetry(device, t, ts) VALUES($1, $2, $3)",
                data["device"], data["t"], data["ts"],
            )
        # Fan out to live websockets in any process subscribed to this channel.
        await r.publish("telemetry", msg.payload)

    async with aiomqtt.Client("broker.example.com") as client:
        await client.subscribe("acme/+/+/telemetry", qos=1)
        async for message in client.messages:
            await handle(client, message)


# api.py - FastAPI exposes both REST + WS, fed from Redis pub/sub.
from fastapi import FastAPI, WebSocket
import redis.asyncio as redis
import asyncpg

app = FastAPI()


@app.on_event("startup")
async def startup():
    app.state.pg = await asyncpg.create_pool("postgresql://...")
    app.state.redis = redis.from_url("redis://...")


@app.get("/devices/{device}/recent")
async def recent(device: str, limit: int = 100):
    async with app.state.pg.acquire() as conn:
        rows = await conn.fetch(
            "SELECT t, ts FROM telemetry WHERE device=$1 "
            "ORDER BY ts DESC LIMIT $2",
            device, limit,
        )
    return [dict(r) for r in rows]


@app.websocket("/ws/telemetry")
async def stream(ws: WebSocket):
    await ws.accept()
    pubsub = app.state.redis.pubsub()
    await pubsub.subscribe("telemetry")
    try:
        async for msg in pubsub.listen():
            if msg["type"] == "message":
                await ws.send_bytes(msg["data"])
    finally:
        await pubsub.unsubscribe("telemetry")
        await pubsub.close()

# Decision rule:
#   Browser client                                  -> WebSockets (or fetch + SSE).
#   Internal microservice with typed contract        -> gRPC.
#   Public-internet API                              -> REST/HTTP-JSON.
#   IoT fleet                                        -> MQTT.
#   Custom binary protocol on embedded device        -> raw TCP/UDP.
#   Want server -> client push without WS            -> Server-Sent Events (text/event-stream).
#   Want low latency over lossy networks             -> QUIC / HTTP/3 (aioquic).
#   Want async pipelines + persistence + live UI      -> MQTT in, Postgres + Redis pub/sub
#                                                       backing FastAPI for queries + WS.
#   Can't decide                                      -> REST + WS is the minimum-regret default;
#                                                       optimize later.

# Anti-pattern:
#   "We'll use raw sockets - it's faster"
# It's not faster - it's lower-level. You'll spend weeks reimplementing
# framing, retries, auth, schema. Pick gRPC / MQTT / REST first; only go
# to raw sockets when an existing protocol literally can't fit.
"""
```

## Decision Rule

```text
Browser client                                  -> WebSockets (or fetch + SSE).
Internal microservice with typed contract        -> gRPC.
Public-internet API                              -> REST/HTTP-JSON.
IoT fleet                                        -> MQTT.
Custom binary protocol on embedded device        -> raw TCP/UDP.
Want server -> client push without WS            -> Server-Sent Events (text/event-stream).
Want low latency over lossy networks             -> QUIC / HTTP/3 (aioquic).
Want async pipelines + persistence + live UI      -> MQTT in, Postgres + Redis pub/sub
                                                    backing FastAPI for queries + WS.
Can't decide                                      -> REST + WS is the minimum-regret default;
                                                    optimize later.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   "We'll use raw sockets - it's faster"
> It's not faster - it's lower-level. You'll spend weeks reimplementing
> framing, retries, auth, schema. Pick gRPC / MQTT / REST first; only go
> to raw sockets when an existing protocol literally can't fit.

## Tips

- Browser bidi → **WebSockets**. Browser one-way push → **Server-Sent Events** (text/event-stream).
- Internal typed services → **gRPC**. Public/debuggable APIs → **REST/HTTP-JSON**.
- IoT fleet → **MQTT**. Custom embedded protocols → **raw sockets**, but justify it before you reach for them.
- For low latency over lossy networks (mobile, gaming, CDN edge), **HTTP/3 + QUIC** (aioquic) avoids head-of-line blocking.
- Common production shape: MQTT (devices) → bridge (Python) → Postgres (history) + Redis pub/sub (live) → FastAPI (REST + WS) — covers most IoT/dashboard apps.

## Common Mistake

> [!warning] Reaching for raw sockets "for performance". You'll re-implement framing, retries, auth, and schemas. Use gRPC or MQTT or REST first; raw sockets only when nothing else fits.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/network-protocols/patterns/_Index|Network Protocols → Choosing a network stack]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]

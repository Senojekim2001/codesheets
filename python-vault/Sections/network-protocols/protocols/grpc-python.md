---
type: "entry"
domain: "python"
file: "network-protocols"
section: "protocols"
id: "grpc-python"
title: "grpcio + protobuf — typed RPC services"
category: "protocols"
subtitle: "protobuf .proto schema (message + service definitions), python -m grpc_tools.protoc generates *_pb2.py / *_pb2_grpc.py, grpc.server (sync) or grpc.aio.server (async), insecure_channel vs secure_channel + ssl_channel_credentials, streaming RPCs (4 kinds), grpc.aio for asyncio integration, status codes via context.set_code, deadlines via metadata"
signature_short: "protoc --python_out=. --grpc_python_out=. svc.proto; class SvcServicer(svc_pb2_grpc.SvcServicer): def Method(self, request, ctx): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "grpcio + protobuf — typed RPC services"
  - "grpc-python"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/protocols"
  - "category/protocols"
  - "tier/tiered"
---

# grpcio + protobuf — typed RPC services

> protobuf .proto schema (message + service definitions), python -m grpc_tools.protoc generates *_pb2.py / *_pb2_grpc.py, grpc.server (sync) or grpc.aio.server (async), insecure_channel vs secure_channel + ssl_channel_credentials, streaming RPCs (4 kinds), grpc.aio for asyncio integration, status codes via context.set_code, deadlines via metadata

## Overview

gRPC is HTTP/2 with binary protobuf payloads and code-gen stubs. Workflow: write `.proto`, generate `*_pb2.py` (messages) and `*_pb2_grpc.py` (stubs + servicers), implement the servicer, run a `grpc.server` (sync, thread pool) or `grpc.aio.server` (asyncio). Four RPC types: unary-unary (RPC), server-streaming (subscribe), client-streaming (upload), bidi-streaming (chat). Three depths solve the SAME task — Greeter service with `SayHello` and a server-streaming `SubscribeNews` — at depths: sync unary `SayHello` → sync server-streaming → async server with deadlines, status codes, and a bidi-streaming chat method.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Greeter service with SayHello(name) -> "Hello, name".
- **Junior** — SAME — Greeter service — but add a server-streaming SubscribeNews method that pushes updates to the client.
- **Senior** — SAME — gRPC service — production: async server (grpc.aio), deadlines, status codes for errors, bidi-streaming Chat, TLS via grpc.ssl_server_credentials.

## Signature

```python
protoc --python_out=. --grpc_python_out=. svc.proto; class SvcServicer(svc_pb2_grpc.SvcServicer): def Method(self, request, ctx): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Greeter service with SayHello(name) -> "Hello, name".
# APPROACH  - Define .proto; generate stubs; sync server.
# STRENGTHS - The canonical "hello world" gRPC.
# WEAKNESSES- Sync only; no streaming; thread pool.
# greeter.proto:
"""
syntax = "proto3";
package greet;

service Greeter {
    rpc SayHello (HelloRequest) returns (HelloReply);
}
message HelloRequest { string name = 1; }
message HelloReply   { string message = 1; }
"""

# Generate:
# python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. greeter.proto

# server.py:
import grpc
from concurrent import futures
import greeter_pb2
import greeter_pb2_grpc


class Greeter(greeter_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return greeter_pb2.HelloReply(message=f"Hello, {request.name}")


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    greeter_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    server.wait_for_termination()


# client.py:
def call():
    channel = grpc.insecure_channel("localhost:50051")
    stub = greeter_pb2_grpc.GreeterStub(channel)
    resp = stub.SayHello(greeter_pb2.HelloRequest(name="World"))
    print(resp.message)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Greeter service — but add a server-streaming
#             SubscribeNews method that pushes updates to the client.
# APPROACH  - Server-side rpc returns an iterator; client iterates.
# STRENGTHS - Real-time pushes without WebSockets; typed schema.
# WEAKNESSES- Still sync server (thread per stream).
# greeter.proto (extended):
"""
service Greeter {
    rpc SayHello (HelloRequest) returns (HelloReply);
    rpc SubscribeNews (NewsRequest) returns (stream NewsItem);
}
message HelloRequest  { string name = 1; }
message HelloReply    { string message = 1; }
message NewsRequest   { string topic = 1; }
message NewsItem      { string headline = 1; int64 ts = 2; }
"""

# server.py:
import time
import grpc
from concurrent import futures
import greeter_pb2 as pb
import greeter_pb2_grpc as pb_grpc


class Greeter(pb_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return pb.HelloReply(message=f"Hello, {request.name}")

    def SubscribeNews(self, request, context):
        # Stream 5 items with 1s spacing, then EOF.
        for i in range(5):
            if context.is_active() is False:           # client cancelled
                return
            yield pb.NewsItem(headline=f"{request.topic}: item {i}",
                              ts=int(time.time()))
            time.sleep(1)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port("[::]:50051")
    server.start(); server.wait_for_termination()


# client.py:
def subscribe():
    channel = grpc.insecure_channel("localhost:50051")
    stub = pb_grpc.GreeterStub(channel)
    for item in stub.SubscribeNews(pb.NewsRequest(topic="ai")):
        print(f"{item.ts}: {item.headline}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — gRPC service — production: async server (grpc.aio),
#             deadlines, status codes for errors, bidi-streaming Chat,
#             TLS via grpc.ssl_server_credentials.
# APPROACH  - grpc.aio.server; context.set_code/set_details for errors;
#             async streams in/out for Chat.
# STRENGTHS - Asyncio-native; deadline + cancellation aware; TLS;
#             bidi-streaming over the same connection.
# WEAKNESSES- aio API is similar but not identical to sync - older
#             tutorials don't apply.
# greeter.proto (final):
"""
syntax = "proto3";
package greet;

service Greeter {
    rpc SayHello (HelloRequest) returns (HelloReply);
    rpc SubscribeNews (NewsRequest) returns (stream NewsItem);
    rpc Chat (stream ChatMsg) returns (stream ChatMsg);
}
message HelloRequest { string name = 1; }
message HelloReply   { string message = 1; }
message NewsRequest  { string topic = 1; }
message NewsItem     { string headline = 1; int64 ts = 2; }
message ChatMsg      { string user = 1; string text = 2; int64 ts = 3; }
"""

# server.py:
import asyncio
import time
import grpc
from grpc import aio
import greeter_pb2 as pb
import greeter_pb2_grpc as pb_grpc


CONNECTED: set[asyncio.Queue] = set()                  # in-process broadcast


class Greeter(pb_grpc.GreeterServicer):
    async def SayHello(self, request, context: aio.ServicerContext):
        if not request.name:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "name required")
        return pb.HelloReply(message=f"Hello, {request.name}")

    async def SubscribeNews(self, request, context: aio.ServicerContext):
        deadline = context.time_remaining()
        end_at = time.time() + (deadline if deadline else 30.0)
        i = 0
        while time.time() < end_at:
            if context.cancelled():
                return
            yield pb.NewsItem(headline=f"{request.topic}: item {i}",
                              ts=int(time.time()))
            i += 1
            await asyncio.sleep(1)

    async def Chat(self, request_iterator, context: aio.ServicerContext):
        outbound: asyncio.Queue = asyncio.Queue(maxsize=64)
        CONNECTED.add(outbound)
        consumer_task = asyncio.create_task(self._consume(request_iterator))
        try:
            while not context.cancelled():
                try:
                    msg = await asyncio.wait_for(outbound.get(), timeout=1.0)
                except asyncio.TimeoutError:
                    continue
                yield msg
        finally:
            consumer_task.cancel()
            CONNECTED.discard(outbound)

    async def _consume(self, request_iterator):
        async for msg in request_iterator:
            stamped = pb.ChatMsg(user=msg.user, text=msg.text, ts=int(time.time()))
            for q in list(CONNECTED):
                try:
                    q.put_nowait(stamped)
                except asyncio.QueueFull:
                    pass


async def serve():
    server = aio.server()
    pb_grpc.add_GreeterServicer_to_server(Greeter(), server)

    # TLS path - self-signed for dev:
    # creds = grpc.ssl_server_credentials([(open("server.key","rb").read(),
    #                                       open("server.crt","rb").read())])
    # server.add_secure_port("[::]:50051", creds)
    server.add_insecure_port("[::]:50051")
    await server.start()
    await server.wait_for_termination()


asyncio.run(serve())

# Decision rule:
#   Internal microservice with typed schema   -> gRPC.
#   Public-internet API for any client        -> REST/HTTP-JSON or GraphQL.
#   Real-time push from server                 -> gRPC server-streaming or WebSockets.
#   Bidirectional streaming                    -> gRPC bidi (above) or WebSockets.
#   Async Python service                        -> grpc.aio.server.
#   Sync Python service                         -> grpc.server + ThreadPoolExecutor.
#   Need browser support                         -> grpc-web (proxy via Envoy or grpc-web shim).
#   Need API gateway / mesh                      -> Envoy + grpc -> grpc-json transcoding.
#   Need REST + gRPC from one schema             -> grpc-gateway (Go) or buf.

# Anti-pattern:
#   def Method(self, request, context):
#       result = blocking_db_call()             # in grpc.aio servicer
# grpc.aio servicers MUST be async. A sync blocking call in an async
# servicer freezes the entire event loop. Use async DB drivers or
# loop.run_in_executor for legacy sync code.
"""
```

## Decision Rule

```text
Internal microservice with typed schema   -> gRPC.
Public-internet API for any client        -> REST/HTTP-JSON or GraphQL.
Real-time push from server                 -> gRPC server-streaming or WebSockets.
Bidirectional streaming                    -> gRPC bidi (above) or WebSockets.
Async Python service                        -> grpc.aio.server.
Sync Python service                         -> grpc.server + ThreadPoolExecutor.
Need browser support                         -> grpc-web (proxy via Envoy or grpc-web shim).
Need API gateway / mesh                      -> Envoy + grpc -> grpc-json transcoding.
Need REST + gRPC from one schema             -> grpc-gateway (Go) or buf.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   def Method(self, request, context):
>       result = blocking_db_call()             # in grpc.aio servicer
> grpc.aio servicers MUST be async. A sync blocking call in an async
> servicer freezes the entire event loop. Use async DB drivers or
> loop.run_in_executor for legacy sync code.

## Tips

- Generate stubs once: `python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. svc.proto` — commit the generated files.
- Four RPC types: unary-unary, server-streaming, client-streaming, bidi-streaming — they cover most needs.
- `grpc.aio.server()` is the asyncio path; servicers must be `async def`. `grpc.server()` is sync with a thread pool.
- Use `context.set_code(grpc.StatusCode.NOT_FOUND)` + `set_details(...)` to return typed errors.
- For browser clients, you need **grpc-web** + a proxy (Envoy or grpc-web standalone) — raw gRPC isn't browser-supported.

## Common Mistake

> [!warning] Calling a blocking function inside a `grpc.aio` async servicer. Freezes the entire event loop. Use async DB drivers or `loop.run_in_executor` for legacy sync code.

## See Also

- [[Sections/network-protocols/protocols/websockets-server-client|websockets — async WS server + client (Network Protocols)]]
- [[Sections/network-protocols/protocols/_Index|Network Protocols → WebSockets and gRPC]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]

---
type: "file-index"
domain: "python"
file: "network-protocols"
title: "Network Protocols"
tags:
  - "python"
  - "python/network-protocols"
  - "index"
---

# Network Protocols

> 6 entries across 4 sections.

## Sockets — TCP, UDP, asyncio streams · 2

- [[Sections/network-protocols/sockets/sockets-tcp-server|socket / asyncio.start_server — TCP servers]] — For one client at a time, a `socket.socket(AF_INET, SOCK_STREAM)` + `bind/listen/accept` loop is fine. For real concurrency use `asyncio.start_server(handler, host, port)` — handler receives a `(reader, writer)` pair and you await reads/writes. **TCP is a byte stream, not a message stream** — frame your messages with length prefixes or delimiters.
- [[Sections/network-protocols/sockets/sockets-udp-multicast|UDP / multicast / asyncio.DatagramTransport]] — UDP is fire-and-forget datagrams: no connection, no reliability, no ordering. Ideal for service discovery (mDNS), real-time media (video, voice, games), and metrics fan-out (StatsD, multicast SNMP). Use `socket.SOCK_DGRAM`; for asyncio, `asyncio.DatagramProtocol` + `loop.create_datagram_endpoint`.

## WebSockets and gRPC · 2

- [[Sections/network-protocols/protocols/websockets-server-client|websockets — async WS server + client]] — `websockets` is the async-only Python WebSocket library. `websockets.serve(handler, host, port)` for the server side; `websockets.connect(url)` for the client. Each handler receives a `WebSocketServerProtocol`; `async for message in ws` consumes incoming messages. Built on asyncio; no Flask/Django integration needed.
- [[Sections/network-protocols/protocols/grpc-python|grpcio + protobuf — typed RPC services]] — gRPC = HTTP/2 + Protocol Buffers + a code generator. Define a service in `.proto`, run `python -m grpc_tools.protoc` to generate stubs, implement the server, call from clients. Streams (server-streaming, client-streaming, bidi) come for free. Use when you have known service boundaries and care about typed schemas; skip it for public-internet APIs (REST is friendlier).

## Packet capture and crafting · 1

- [[Sections/network-protocols/low-level/scapy-sniff-craft|scapy.sniff / send / packet crafting]] — scapy is a packet manipulation library — capture, dissect, modify, replay. `sniff(iface=, filter=BPF, prn=)` for capture; `IP()/TCP()/Raw()` for crafting; `send()` / `sendp()` for layer-3 / layer-2 transmission. **Requires root / `CAP_NET_RAW`** to open raw sockets.

## Choosing a network stack · 1

- [[Sections/network-protocols/patterns/network-stack-decision|sockets vs WebSockets vs gRPC vs HTTP — pick the right tool]] — Raw sockets for custom or legacy protocols. WebSockets for browser-friendly bidirectional streams. gRPC for typed internal microservices. HTTP/JSON or HTTP/2 for public APIs and most cloud-to-cloud. QUIC / HTTP/3 emerging for lossy networks and head-of-line-blocking-sensitive workloads.

---
type: "entry"
domain: "python"
file: "network-protocols"
section: "sockets"
id: "sockets-udp-multicast"
title: "UDP / multicast / asyncio.DatagramTransport"
category: "sockets"
subtitle: "socket.SOCK_DGRAM (UDP), no listen/accept; sendto / recvfrom, multicast (IP_ADD_MEMBERSHIP, MULTICAST_TTL), broadcast (SO_BROADCAST), asyncio DatagramProtocol (datagram_received, error_received), no built-in ordering or reliability, MTU ~1500 (don't exceed unless you accept fragmentation), use cases (mDNS, games, video, StatsD)"
signature_short: "sock = socket.socket(AF_INET, SOCK_DGRAM); sock.bind((host, port)); data, addr = sock.recvfrom(65536); sock.sendto(payload, (host, port))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "UDP / multicast / asyncio.DatagramTransport"
  - "sockets-udp-multicast"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/sockets"
  - "category/sockets"
  - "tier/tiered"
---

# UDP / multicast / asyncio.DatagramTransport

> socket.SOCK_DGRAM (UDP), no listen/accept; sendto / recvfrom, multicast (IP_ADD_MEMBERSHIP, MULTICAST_TTL), broadcast (SO_BROADCAST), asyncio DatagramProtocol (datagram_received, error_received), no built-in ordering or reliability, MTU ~1500 (don't exceed unless you accept fragmentation), use cases (mDNS, games, video, StatsD)

## Overview

No accept loop — bind a UDP socket and `recvfrom(buffer_size)` returns `(data, sender_addr)`. To send, `sendto(payload, (host, port))`. **Multicast**: pick an address in `224.0.0.0/4`, set `IP_MULTICAST_TTL`, optionally `IP_ADD_MEMBERSHIP` to receive. **Broadcast**: set `SO_BROADCAST` and send to `255.255.255.255`. Three depths solve the SAME task — discover devices on a LAN — at depths: send broadcast → receive replies (sync) → asyncio multicast subscriber + responder → mDNS-style hierarchy with retransmission timing and TTL-aware caching.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Discover devices: broadcast a "WHO?" packet, collect replies.
- **Junior** — SAME — LAN device discovery — but on a multicast group (only members receive, no LAN-wide spam).
- **Senior** — SAME — LAN device discovery — production: asyncio DatagramProtocol that responds to discovery queries AND listens for replies; cache discovered peers with TTL.

## Signature

```python
sock = socket.socket(AF_INET, SOCK_DGRAM); sock.bind((host, port)); data, addr = sock.recvfrom(65536); sock.sendto(payload, (host, port))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Discover devices: broadcast a "WHO?" packet, collect replies.
# APPROACH  - SO_BROADCAST + recvfrom with a timeout.
# STRENGTHS - Demonstrates fire-and-forget UDP.
# WEAKNESSES- Broadcasts spam every host on the LAN; multicast (junior tier)
#             is more polite.
import socket

PORT = 9999

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
s.settimeout(2.0)

s.sendto(b"WHO?", ("255.255.255.255", PORT))           # LAN-wide broadcast

# Collect replies for ~2 seconds.
print("replies:")
while True:
    try:
        data, addr = s.recvfrom(4096)
    except socket.timeout:
        break
    print(f"  {addr}: {data!r}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — LAN device discovery — but on a multicast group
#             (only members receive, no LAN-wide spam).
# APPROACH  - 224.0.0.251 + IP_ADD_MEMBERSHIP + IP_MULTICAST_TTL.
# STRENGTHS - Polite to non-members; routers can drop multicast at the
#             subnet boundary if you want.
# WEAKNESSES- Some hostile networks (cafe wifi) block multicast entirely.
import socket
import struct

GROUP = "224.0.0.251"                                  # link-local multicast
PORT  = 9999


def make_multicast_listener(group: str, port: int) -> socket.socket:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    if hasattr(socket, "SO_REUSEPORT"):
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    s.bind(("", port))                                # wildcard - receive on all NICs
    # Join the group on the default interface (INADDR_ANY).
    mreq = struct.pack("4s4s", socket.inet_aton(group), socket.inet_aton("0.0.0.0"))
    s.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    return s


def make_multicast_sender() -> socket.socket:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    s.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)   # link-local only
    return s


# Sender side - announce.
sender = make_multicast_sender()
sender.sendto(b"WHO?", (GROUP, PORT))

# Receiver side - listen for replies.
listener = make_multicast_listener(GROUP, PORT)
listener.settimeout(2.0)
while True:
    try:
        data, addr = listener.recvfrom(65536)
        print(f"{addr}: {data!r}")
    except socket.timeout:
        break
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — LAN device discovery — production: asyncio
#             DatagramProtocol that responds to discovery queries AND
#             listens for replies; cache discovered peers with TTL.
# APPROACH  - loop.create_datagram_endpoint with a Protocol class;
#             schedule periodic re-queries; per-peer TTL eviction.
# STRENGTHS - Single asyncio loop handles both directions; passes through
#             retransmission deadlines; works on any thread/event-loop app.
# WEAKNESSES- Multicast routing is fragile across complex networks - test
#             through your actual environment before relying on it.
from __future__ import annotations
import asyncio
import socket
import struct
import time
import json


GROUP = "224.0.0.251"
PORT  = 9999
TTL_S = 30
ANNOUNCE_INTERVAL_S = 5


def setup_multicast_socket(group: str, port: int) -> socket.socket:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    if hasattr(socket, "SO_REUSEPORT"):
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    s.bind(("", port))
    mreq = struct.pack("4s4s", socket.inet_aton(group), socket.inet_aton("0.0.0.0"))
    s.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    s.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)
    return s


class Discovery(asyncio.DatagramProtocol):
    def __init__(self, my_id: str):
        self.my_id   = my_id
        self.peers: dict[str, tuple[float, str]] = {}    # peer_id -> (last_seen, addr)
        self.transport: asyncio.DatagramTransport | None = None

    def connection_made(self, transport):
        self.transport = transport

    def datagram_received(self, data: bytes, addr: tuple[str, int]):
        try:
            msg = json.loads(data)
        except Exception:
            return
        kind = msg.get("kind")
        peer = msg.get("id")
        if not peer or peer == self.my_id:
            return
        if kind == "WHO":
            self.transport.sendto(
                json.dumps({"kind": "I-AM", "id": self.my_id}).encode(),
                addr,
            )
        if kind in ("WHO", "I-AM"):
            self.peers[peer] = (time.time(), f"{addr[0]}:{addr[1]}")

    def error_received(self, exc):
        print("err:", exc)

    def announce(self):
        self.transport.sendto(
            json.dumps({"kind": "WHO", "id": self.my_id}).encode(),
            (GROUP, PORT),
        )

    def evict_old(self):
        cutoff = time.time() - TTL_S
        self.peers = {p: (t, a) for p, (t, a) in self.peers.items() if t >= cutoff}


async def main(my_id: str):
    sock = setup_multicast_socket(GROUP, PORT)
    loop = asyncio.get_running_loop()

    transport, proto = await loop.create_datagram_endpoint(
        lambda: Discovery(my_id), sock=sock,
    )

    try:
        while True:
            proto.announce()
            await asyncio.sleep(ANNOUNCE_INTERVAL_S)
            proto.evict_old()
            print(f"peers: {dict(proto.peers)}")
    finally:
        transport.close()


asyncio.run(main(my_id="lab1-mac"))

# Decision rule:
#   Service discovery on LAN                        -> multicast (224.0.0.0/4) + JSON
#                                                       (or reuse mDNS via zeroconf lib).
#   Real-time media (video, voice, games)            -> raw UDP + your own
#                                                       sequence numbers.
#   Telemetry fan-out                                -> StatsD (UDP) for fire-and-forget;
#                                                       OTLP (TCP) when you need delivery.
#   Need reliability over UDP                        -> QUIC (HTTP/3) or aioquic; or rely on
#                                                       app-level ack/retransmit.
#   Need very large UDP messages                     -> reduce to <1500 bytes (MTU) or
#                                                       fragment yourself.
#   Need to receive on a specific NIC                -> bind to that NIC's IP; mreq with
#                                                       interface address.
#   Need to test multicast in CI                     -> docker network host-mode + lo
#                                                       multicast often broken; use a TCP
#                                                       loopback fallback for tests.

# Anti-pattern:
#   sock.sendto(huge_blob, addr)            # > MTU
# IP layer fragments. ANY dropped fragment loses the whole datagram. Keep
# UDP messages under 1450 bytes for reliable cross-network delivery.
```

## Decision Rule

```text
Service discovery on LAN                        -> multicast (224.0.0.0/4) + JSON
                                                    (or reuse mDNS via zeroconf lib).
Real-time media (video, voice, games)            -> raw UDP + your own
                                                    sequence numbers.
Telemetry fan-out                                -> StatsD (UDP) for fire-and-forget;
                                                    OTLP (TCP) when you need delivery.
Need reliability over UDP                        -> QUIC (HTTP/3) or aioquic; or rely on
                                                    app-level ack/retransmit.
Need very large UDP messages                     -> reduce to <1500 bytes (MTU) or
                                                    fragment yourself.
Need to receive on a specific NIC                -> bind to that NIC's IP; mreq with
                                                    interface address.
Need to test multicast in CI                     -> docker network host-mode + lo
                                                    multicast often broken; use a TCP
                                                    loopback fallback for tests.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   sock.sendto(huge_blob, addr)            # > MTU
> IP layer fragments. ANY dropped fragment loses the whole datagram. Keep
> UDP messages under 1450 bytes for reliable cross-network delivery.

## Tips

- UDP has no ordering, no reliability, no flow control — every guarantee is your job.
- Multicast addresses live in `224.0.0.0/4`; `224.0.0.0/24` is link-local (TTL 1, never routed).
- Set `IP_MULTICAST_TTL=1` for link-local only; bigger TTL = more network hops.
- Keep UDP payloads under ~1450 bytes (LAN MTU minus headers) to avoid IP fragmentation.
- For service discovery, prefer the **zeroconf** library (mDNS / Bonjour) over rolling your own — it handles edge cases.

## Common Mistake

> [!warning] Sending a UDP datagram larger than the path MTU (~1500 bytes). The IP layer fragments; any dropped fragment loses the whole datagram. Keep payloads ≤ 1450 bytes.

## See Also

- [[Sections/network-protocols/sockets/sockets-tcp-server|socket / asyncio.start_server — TCP servers (Network Protocols)]]
- [[Sections/network-protocols/sockets/_Index|Network Protocols → Sockets — TCP, UDP, asyncio streams]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]

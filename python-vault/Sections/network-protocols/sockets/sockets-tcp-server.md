---
type: "entry"
domain: "python"
file: "network-protocols"
section: "sockets"
id: "sockets-tcp-server"
title: "socket / asyncio.start_server — TCP servers"
category: "sockets"
subtitle: "socket.socket (AF_INET / AF_INET6, SOCK_STREAM = TCP, SOCK_DGRAM = UDP), bind / listen / accept loop, SO_REUSEADDR (allow re-bind right after kill) vs SO_REUSEPORT (multiple processes share the port; OS load-balances), TCP_NODELAY (disable Nagle), asyncio.start_server (handler(reader, writer)), readuntil / readexactly, message framing (4-byte big-endian length prefix, or newline-delimited JSON)"
signature_short: "srv = socket.socket(AF_INET, SOCK_STREAM); srv.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1); srv.bind((host, port)); srv.listen(); conn, addr = srv.accept(); asyncio.start_server(handle, host, port)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "socket / asyncio.start_server — TCP servers"
  - "sockets-tcp-server"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/sockets"
  - "category/sockets"
  - "tier/tiered"
---

# socket / asyncio.start_server — TCP servers

> socket.socket (AF_INET / AF_INET6, SOCK_STREAM = TCP, SOCK_DGRAM = UDP), bind / listen / accept loop, SO_REUSEADDR (allow re-bind right after kill) vs SO_REUSEPORT (multiple processes share the port; OS load-balances), TCP_NODELAY (disable Nagle), asyncio.start_server (handler(reader, writer)), readuntil / readexactly, message framing (4-byte big-endian length prefix, or newline-delimited JSON)

## Overview

Two paths. **Sync sockets**: `accept()` returns a connected socket; you `recv(n)` and `send(bytes)`. Each `recv` returns up to N bytes, possibly a partial message — read until you have the full frame. **Asyncio streams**: `asyncio.start_server(handle, host, port)` spawns one coroutine per connection; `await reader.readuntil(b"\n")` and `writer.write(...)` + `await writer.drain()`. Always frame your messages — the canonical pattern is a 4-byte big-endian length prefix followed by the payload. Three depths solve the SAME task — line-based echo server — at depths: blocking single-client socket → asyncio echo server, one task per connection → asyncio length-prefixed binary protocol with graceful shutdown and request/response framing.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Echo server: accept one connection, read lines, echo them back.
- **Junior** — SAME — echo server — but multi-client via asyncio streams.
- **Senior** — SAME — TCP server — production: 4-byte length-prefixed binary protocol, graceful shutdown on SIGTERM, structured logging, SO_REUSEPORT so multiple processes can share the port.

## Signature

```python
srv = socket.socket(AF_INET, SOCK_STREAM); srv.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1); srv.bind((host, port)); srv.listen(); conn, addr = srv.accept(); asyncio.start_server(handle, host, port)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Echo server: accept one connection, read lines, echo them back.
# APPROACH  - Single-threaded blocking socket.
# STRENGTHS - Demonstrates the lifecycle.
# WEAKNESSES- One client at a time; recv() may return partial reads.
import socket

HOST, PORT = "0.0.0.0", 9001

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
    # SO_REUSEADDR lets you re-bind right after killing the server in dev.
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((HOST, PORT))
    srv.listen(5)
    print(f"listening on {HOST}:{PORT}")

    conn, addr = srv.accept()
    with conn:
        print(f"connected: {addr}")
        buf = b""
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break                                  # client closed
            buf += chunk
            while b"\n" in buf:
                line, buf = buf.split(b"\n", 1)
                conn.sendall(line + b"\n")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — echo server — but multi-client via asyncio streams.
# APPROACH  - asyncio.start_server with one coroutine per connection;
#             await reader.readline() handles framing.
# STRENGTHS - Thousands of concurrent clients on one thread.
# WEAKNESSES- readline() is line-delimited; binary protocols need
#             different framing.
import asyncio


async def handle(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    addr = writer.get_extra_info("peername")
    print(f"+ {addr}")
    try:
        while not reader.at_eof():
            try:
                line = await reader.readline()
            except asyncio.IncompleteReadError:
                break
            if not line:
                break
            writer.write(line)
            await writer.drain()                       # flush; back-pressure aware
    finally:
        print(f"- {addr}")
        writer.close()
        await writer.wait_closed()


async def main():
    server = await asyncio.start_server(handle, "0.0.0.0", 9001)
    addrs = ", ".join(str(s.getsockname()) for s in server.sockets)
    print(f"listening on {addrs}")
    async with server:
        await server.serve_forever()


asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — TCP server — production: 4-byte length-prefixed binary
#             protocol, graceful shutdown on SIGTERM, structured logging,
#             SO_REUSEPORT so multiple processes can share the port.
# APPROACH  - readexactly(4) + readexactly(n); writer.drain() back-pressure;
#             signal handlers cancel serve_forever.
# STRENGTHS - Real binary protocol; multi-process scale; clean shutdown.
# WEAKNESSES- More machinery; binary framing has zero forgiveness for
#             desynchronization (always close on partial read).
from __future__ import annotations
import asyncio
import socket
import signal
import struct
import logging


logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("net")


async def read_frame(reader: asyncio.StreamReader) -> bytes | None:
    """Read a length-prefixed frame: <uint32 big-endian length><payload>."""
    try:
        header = await reader.readexactly(4)
    except asyncio.IncompleteReadError:
        return None
    (n,) = struct.unpack(">I", header)
    if n > 16 * 1024 * 1024:                          # 16 MB sanity cap
        raise ValueError(f"frame too large: {n}")
    return await reader.readexactly(n)


def write_frame(writer: asyncio.StreamWriter, payload: bytes) -> None:
    writer.write(struct.pack(">I", len(payload)) + payload)


async def handle(reader, writer):
    peer = writer.get_extra_info("peername")
    log.info("connect %s", peer)
    try:
        while True:
            frame = await read_frame(reader)
            if frame is None:
                break
            write_frame(writer, b"echo:" + frame)
            await writer.drain()
    except (ValueError, asyncio.IncompleteReadError) as e:
        log.warning("framing error from %s: %s", peer, e)
    finally:
        writer.close()
        await writer.wait_closed()
        log.info("disconnect %s", peer)


def make_reuseport_socket(host: str, port: int) -> socket.socket:
    """SO_REUSEPORT lets multiple processes share the same listening port."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    if hasattr(socket, "SO_REUSEPORT"):
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    s.bind((host, port))
    s.listen(128)
    s.setblocking(False)
    return s


async def main():
    sock = make_reuseport_socket("0.0.0.0", 9001)
    server = await asyncio.start_server(handle, sock=sock)

    loop = asyncio.get_running_loop()
    stop = asyncio.Event()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, stop.set)

    log.info("listening on %s", sock.getsockname())
    try:
        async with server:
            serve_task = asyncio.create_task(server.serve_forever())
            await stop.wait()                         # wait for SIGTERM/SIGINT
            log.info("shutting down")
            server.close()
            await server.wait_closed()
            serve_task.cancel()
    except asyncio.CancelledError:
        pass


if __name__ == "__main__":
    asyncio.run(main())

# Decision rule:
#   One-client tool                              -> blocking socket.
#   Many concurrent clients                       -> asyncio.start_server (above).
#   Need horizontal scale on one host             -> SO_REUSEPORT + N processes.
#   Line-delimited text                           -> reader.readline / readuntil(b"\n").
#   Binary protocol                               -> length-prefixed (uint32 big-endian).
#   Need backpressure                              -> writer.drain() after every write.
#   Latency-sensitive (game / trading)             -> setsockopt(IPPROTO_TCP, TCP_NODELAY, 1).
#   Need TLS                                       -> ssl.SSLContext + start_server(ssl=ctx).
#   IPv6                                           -> AF_INET6 + bind to "::"; dual-stack via
#                                                     IPV6_V6ONLY=0.

# Anti-pattern:
#   data = reader.read(4096)
#   message = data.decode("utf-8")
# read returns up to 4096 bytes - might be 200, might be split mid-UTF-8
# character. Always frame messages and only decode complete ones.
```

## Decision Rule

```text
One-client tool                              -> blocking socket.
Many concurrent clients                       -> asyncio.start_server (above).
Need horizontal scale on one host             -> SO_REUSEPORT + N processes.
Line-delimited text                           -> reader.readline / readuntil(b"\n").
Binary protocol                               -> length-prefixed (uint32 big-endian).
Need backpressure                              -> writer.drain() after every write.
Latency-sensitive (game / trading)             -> setsockopt(IPPROTO_TCP, TCP_NODELAY, 1).
Need TLS                                       -> ssl.SSLContext + start_server(ssl=ctx).
IPv6                                           -> AF_INET6 + bind to "::"; dual-stack via
                                                  IPV6_V6ONLY=0.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   data = reader.read(4096)
>   message = data.decode("utf-8")
> read returns up to 4096 bytes - might be 200, might be split mid-UTF-8
> character. Always frame messages and only decode complete ones.

## Tips

- TCP is a byte stream, not a message stream — frame messages with a length prefix (uint32 BE) or delimiter.
- `SO_REUSEADDR` allows re-binding right after a kill; `SO_REUSEPORT` lets multiple processes share the port (OS load-balances).
- For low-latency apps, set `TCP_NODELAY=1` to disable Nagle's algorithm — otherwise small writes get coalesced for ~40 ms.
- Always `await writer.drain()` after `writer.write()` — that's how asyncio applies back-pressure.
- For TLS, build an `ssl.SSLContext` and pass it to `asyncio.start_server(ssl=ctx)`.

## Common Mistake

> [!warning] Calling `socket.recv(n)` and assuming you got a full message. `recv` returns up to N bytes — the application protocol must frame messages explicitly (length prefix or delimiter).

## See Also

- [[Sections/network-protocols/sockets/sockets-udp-multicast|UDP / multicast / asyncio.DatagramTransport (Network Protocols)]]
- [[Sections/network-protocols/sockets/_Index|Network Protocols → Sockets — TCP, UDP, asyncio streams]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]

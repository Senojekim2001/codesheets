---
type: "entry"
domain: "python"
file: "concurrency"
section: "asyncio-deep"
id: "asyncio-streams"
title: "asyncio Streams — Async TCP/IP"
category: "asyncio"
subtitle: "asyncio.open_connection(), StreamReader/StreamWriter, async TCP"
signature_short: "reader, writer = await asyncio.open_connection(host, port)  |  await reader.readline()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio Streams — Async TCP/IP"
  - "asyncio-streams"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/asyncio-deep"
  - "category/asyncio"
  - "tier/tiered"
---

# asyncio Streams — Async TCP/IP

> asyncio.open_connection(), StreamReader/StreamWriter, async TCP

## Overview

asyncio streams provide async wrappers around sockets. open_connection() connects to a server, returning (reader, writer) tuple. StreamReader has .read(), .readline(), .readuntil(). StreamWriter has .write(), .writelines(), .close(). start_server() creates an async server that accepts connections. Use for: async HTTP clients (when aiohttp isn't available), custom protocols, real-time bidirectional communication.

## Signature

```python
reader, writer = await asyncio.open_connection(host, port)  |  await reader.readline()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Connect, write, drain, read one line, close
# STRENGTHS - The minimum: shows the (reader, writer) tuple shape
# WEAKNESSES- No length-prefixed framing; no error handling
#
import asyncio

async def echo_once(host: str, port: int, msg: str) -> str:
    reader, writer = await asyncio.open_connection(host, port)
    writer.write(msg.encode() + b"\n")
    await writer.drain()                        # actually flush the buffer
    line = await reader.readline()
    writer.close(); await writer.wait_closed()
    return line.decode().rstrip()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - start_server with per-connection coroutine, readline echo
# STRENGTHS - One coroutine per client; concurrent by default
# WEAKNESSES- No timeouts, no graceful shutdown
#
import asyncio

async def handle(reader, writer):
    try:
        while True:
            line = await reader.readline()      # b"" on EOF
            if not line:
                return
            writer.write(line)                  # echo back
            await writer.drain()
    finally:
        writer.close()
        await writer.wait_closed()

async def main():
    server = await asyncio.start_server(handle, "127.0.0.1", 8888)
    async with server:
        await server.serve_forever()

# asyncio.run(main())                            # Ctrl-C to stop
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Length-prefixed framing, per-connection timeouts, graceful shutdown
# STRENGTHS - The patterns that make a real TCP service robust
# WEAKNESSES- N/A
#
import asyncio
import struct

# 1) FRAMING — TCP is a byte stream, not a message stream. Length-prefix every msg.
async def read_msg(reader: asyncio.StreamReader) -> bytes:
    hdr = await reader.readexactly(4)            # raises IncompleteReadError on EOF
    (n,) = struct.unpack("!I", hdr)              # network-order uint32
    return await reader.readexactly(n)

async def write_msg(writer: asyncio.StreamWriter, data: bytes):
    writer.write(struct.pack("!I", len(data)) + data)
    await writer.drain()

# 2) Per-connection deadline + clean teardown
async def handle(reader, writer):
    addr = writer.get_extra_info("peername")
    try:
        async with asyncio.timeout(30):          # whole-conversation budget
            while True:
                try:
                    msg = await read_msg(reader)
                except asyncio.IncompleteReadError:
                    return                       # peer closed
                await write_msg(writer, msg.upper())
    except (TimeoutError, ConnectionError) as e:
        print("conn closed:", addr, e)
    finally:
        writer.close()
        try: await writer.wait_closed()
        except Exception: pass

# 3) Graceful shutdown — drain pending connections, then close
class Server:
    def __init__(self):
        self._server = None

    async def start(self, host="127.0.0.1", port=8888):
        self._server = await asyncio.start_server(handle, host, port)
        return self

    async def serve(self):
        async with self._server:
            await self._server.serve_forever()

    async def shutdown(self):
        self._server.close()                      # stop accepting NEW connections
        await self._server.wait_closed()          # waits for in-flight to finish

# 4) Cancellation discipline — propagate, don't swallow
async def safe_handle(reader, writer):
    try:
        await handle(reader, writer)
    except asyncio.CancelledError:
        # finally above already closed writer; just re-raise
        raise

# Decision rule:
#   simple text protocol                   -> readline() with newline framing
#   binary or variable-length messages      -> length-prefix (struct + readexactly)
#   per-connection deadline                  -> async with asyncio.timeout(s) (3.11+)
#   service shutdown                          -> server.close() + wait_closed()
#   keep-alive / many connections             -> set tcp_keepalive on the underlying socket
#   need TLS                                   -> pass ssl=ssl_context to start_server
#
# Anti-pattern: write() without await drain()
#   Data sits in the buffer; under back-pressure it never gets flushed and the
#   writer reports "full". Always: writer.write(...); await writer.drain().
```

## Decision Rule

```text
simple text protocol                   -> readline() with newline framing
binary or variable-length messages      -> length-prefix (struct + readexactly)
per-connection deadline                  -> async with asyncio.timeout(s) (3.11+)
service shutdown                          -> server.close() + wait_closed()
keep-alive / many connections             -> set tcp_keepalive on the underlying socket
need TLS                                   -> pass ssl=ssl_context to start_server
```

## Anti-Pattern

> [!warning] Anti-pattern
> write() without await drain()
>   Data sits in the buffer; under back-pressure it never gets flushed and the
>   writer reports "full". Always: writer.write(...); await writer.drain().

## Tips

- Always await writer.drain() after write() — flushes buffer and allows other tasks to run.
- Always close and wait_closed() in a finally block — prevents hanging connections. Apply per-connection budgets with `async with asyncio.timeout(s):` (3.11+) and shut down gracefully via `server.close()` + `await server.wait_closed()` so in-flight clients finish.
- readline() reads until \n, readexactly() reads exact bytes, readuntil() reads until custom delimiter. TCP is a BYTE STREAM, not a message stream — for binary or variable-length messages, length-prefix every message (`struct.pack("!I", len(data)) + data`) and read with `readexactly(4)` then `readexactly(n)`.
- start_server() handles multiple clients concurrently — each gets its own handle_client coroutine. Pass `ssl=ssl_context` to start_server for TLS termination.

## Common Mistake

> [!warning] write() without await drain() — data sits in the buffer; under back-pressure it never gets flushed and the writer reports "full". Also: framing TCP as if it were a message protocol — length-prefix or use a delimiter, otherwise readers see partial / merged messages on the wire.

## Shorthand (Junior → Senior)

**Junior:**
```python
reader, writer = await asyncio.open_connection(host, port)
writer.write(msg.encode())
await writer.drain()
response = await reader.readline()
writer.close()
await writer.wait_closed()
```

**Senior:**
```python
reader, writer = await asyncio.open_connection(host, port)
writer.write(msg.encode())
await writer.drain()
response = await reader.readline()
```

## See Also

- [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization (Concurrency & Parallelism)]]
- [[Sections/concurrency/asyncio-deep/_Index|Concurrency & Parallelism → asyncio Deep Dive — Advanced Patterns]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]

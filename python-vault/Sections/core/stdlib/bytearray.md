---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "bytearray"
title: "bytearray"
category: "Standard Library"
subtitle: "Modify bytes in place — append, extend, slice assignment"
signature_short: "bytearray(size) | bytearray(b\"hello\") | s.encode(...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "bytearray"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# bytearray

> Modify bytes in place — append, extend, slice assignment

## Overview

bytearray is like bytes but mutable — you can modify individual elements, append, extend, and slice-assign. Essential for building binary data incrementally without the O(n²) overhead of bytes concatenation. Convert to bytes when done.

## Signature

```python
bytearray(size) | bytearray(b"hello") | s.encode(...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Like bytes, but mutable: index-assign, append, extend, slice-assign.
# STRENGTHS - Build binary in O(n) via append/extend; convert to bytes when frozen.
# WEAKNESSES- Indexing returns INTS; assignment expects INT (0-255), not bytes.
ba = bytearray(b"hello")
ba[0] = 72                                  # 'H'  (must be 0-255 int)
ba.append(33)                               # b'!'
ba.extend(b" world")                        # bytearray(b'Hello! world')

# Convert to immutable when done.
final = bytes(ba)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Slice-assign for splice ops; pre-allocate with bytearray(N) for fixed buffers; .clear() / del to free.
# STRENGTHS - O(1) append/extend; slice assignment can change length; ideal for protocol framing buffers.
# WEAKNESSES- Each instance is a separate allocation -- DO NOT use as a Python "string builder" idiom.
# Slice replacement -- can grow or shrink.
ba = bytearray(b"hello")
ba[1:3] = b"XX"                              # bytearray(b'hXXlo')   (length 5)
ba[0:2] = b"ABC"                             # bytearray(b'ABCXlo')  (length 6, grew)

# Pre-allocate then fill (e.g., received frame).
buf = bytearray(1024)
n = sock.recv_into(buf)                      # writes into buf, no copy
record = bytes(buf[:n])

# Build framed output.
out = bytearray()
out.extend(b"GET / HTTP/1.1\r\n")
out.extend(b"Host: example.com\r\n\r\n")
sock.sendall(out)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - bytearray + memoryview + recv_into for zero-copy network/file I/O; release memoryview before mutating.
# STRENGTHS - One allocation per buffer; no copies on slicing; matches the C-API mental model.
# WEAKNESSES- A live memoryview locks the bytearray against resize -- always release before .extend / slice-assign.
import socket, struct

def read_frames(sock: socket.socket):
    """Read [u32 len][payload] frames; one bytearray, no per-frame allocation."""
    buf = bytearray()
    while True:
        chunk = sock.recv(4096)
        if not chunk: return
        buf.extend(chunk)
        # Drain whole frames; memoryview gives cheap views into buf.
        while len(buf) >= 4:
            (n,) = struct.unpack_from(">I", memoryview(buf), 0)
            if len(buf) < 4 + n: break
            yield bytes(buf[4:4+n])
            del buf[:4+n]                        # free in place

# Decision rule:
#   immutable wire data                 -> bytes
#   build binary in chunks               -> bytearray + extend (NOT b += chunk)
#   pre-sized scratch                    -> bytearray(N); recv_into / readinto
#   parse without copies                 -> memoryview over bytearray; release before mutate
#   file -> binary munging               -> mmap (read-only) or bytearray + readinto (writable)
#   "string builder" for text            -> WRONG tool; use list+"".join or io.StringIO
#
# Anti-pattern: while live_memoryview: ba.extend(...). The bytearray cannot
# resize while a memoryview holds a reference; you'll get BufferError. Release
# the view (set to None or exit the with-block) before mutating the buffer.
```

## Decision Rule

```text
immutable wire data                 -> bytes
build binary in chunks               -> bytearray + extend (NOT b += chunk)
pre-sized scratch                    -> bytearray(N); recv_into / readinto
parse without copies                 -> memoryview over bytearray; release before mutate
file -> binary munging               -> mmap (read-only) or bytearray + readinto (writable)
"string builder" for text            -> WRONG tool; use list+"".join or io.StringIO
```

## Anti-Pattern

> [!warning] Anti-pattern
> while live_memoryview: ba.extend(...). The bytearray cannot
> resize while a memoryview holds a reference; you'll get BufferError. Release
> the view (set to None or exit the with-block) before mutating the buffer.

## Tips

- Use `bytearray` to build binary data incrementally — avoids O(n²) copying from bytes concatenation
- When appending a single byte, pass an int (0-255), not a byte: `ba.append(65)` not `ba.append(b"A")`
- Convert to `bytes` when done mutating: `b = bytes(ba)` — bytes is more memory-efficient
- Slice assignment can change length: `ba[1:3] = b"XXXXX"` replaces 2 bytes with 5

## Common Mistake

> [!warning] Building binary data with bytes concatenation: `b += chunk` in a loop. This is O(n²). Use `bytearray`, append, then convert: `ba = bytearray(); ba.extend(chunks); b = bytes(ba)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
        import numpy as np
ba = bytearray(5)          # 5 zero bytes, mutable
ba = bytearray(b"hello")   # from bytes
ba = bytearray("hello", "utf-8")  # from string
ba = bytearray(b"hello")
```

**Senior:**
```python
final = bytes(ba)          # immutable bytes object
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "bytes"
title: "bytes"
category: "Standard Library"
subtitle: "Binary data — files, network, encoding/decoding"
signature_short: "b\"hello\" | bytes(size) | s.encode(\"utf-8\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "bytes"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# bytes

> Binary data — files, network, encoding/decoding

## Overview

bytes is an immutable sequence of integers 0-255. Create with byte literals (b"..."), the bytes() constructor, or by encoding strings. Use bytes for binary file I/O, network protocols, and any place you need immutable binary data. Access individual bytes as integers, not characters.

## Signature

```python
b"hello" | bytes(size) | s.encode("utf-8")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - b"..." literals; .encode/.decode to/from str; "rb"/"wb" for binary file I/O.
# STRENGTHS - Bytes are how files, sockets, and protocols look at the wire.
# WEAKNESSES- Indexing returns INTS not str: b"hi"[0] is 104, not "h".
b = b"hello"
print(len(b), b[0])                     # 5 104
print(b.decode("utf-8"))                # 'hello'
print("café".encode("utf-8"))           # b'caf\xc3\xa9'

with open("image.png", "rb") as f:
    data = f.read()                      # bytes
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Always specify encoding; bytes.fromhex / .hex(); errors= for tolerant decode; struct for fixed-width records.
# STRENGTHS - Robust against bad input; predictable wire-format I/O.
# WEAKNESSES- "ascii" encoding rejects non-ASCII — use utf-8 unless protocol forbids.
import struct

# Hex round-trip — for protocols, hashes, debugging.
b = bytes.fromhex("48656c6c6f")          # b'Hello'
b.hex()                                   # '48656c6c6f'

# Tolerant decode: keep partially-corrupted text alive.
b"caf\xc3\xa9 \xff".decode("utf-8", errors="replace")   # 'café \ufffd'
b"caf\xc3\xa9 \xff".decode("utf-8", errors="ignore")    # 'café '

# struct: pack/unpack fixed-width binary records.
header = struct.pack(">IH", 42, 7)        # big-endian uint32 + uint16
n, ver = struct.unpack(">IH", header)     # (42, 7)

# Combine bytes efficiently.
parts = [b"a", b"b", b"c"]
joined = b"".join(parts)                  # NOT b += part in a loop
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - memoryview for zero-copy slicing, struct for fixed records, BytesIO for in-memory streams, base64/hex at boundaries only.
# STRENGTHS - Constant memory over large payloads; protocol-correct framing; cheap parsing.
# WEAKNESSES- memoryview locks the underlying buffer — releasing matters for short-lived bytearrays.
from __future__ import annotations
import io
import struct

def parse_records(data: bytes) -> list[tuple[int, str]]:
    """Parse [u32 len][utf-8 bytes] records without copying."""
    out, mv, i = [], memoryview(data), 0
    while i < len(mv):
        (n,) = struct.unpack_from(">I", mv, i); i += 4
        out.append((n, bytes(mv[i:i+n]).decode("utf-8"))); i += n
    return out

def emit_records(rs: list[tuple[int, str]]) -> bytes:
    buf = io.BytesIO()                              # avoid quadratic concat
    for _, s in rs:
        b = s.encode("utf-8")
        buf.write(struct.pack(">I", len(b)) + b)
    return buf.getvalue()

# Decision rule:
#   small fixed-size record               -> struct.pack / unpack
#   variable-length records on a stream    -> length prefix + struct + memoryview slicing
#   building bytes in a loop              -> io.BytesIO  (NOT b += part)
#   "transmit binary as text" (JSON/email)-> base64.b64encode / b64decode
#   parse hex strings                     -> bytes.fromhex (and .hex() to emit)
#   tolerate decode errors                -> errors="replace" for logs, "strict" for data
#   need to mutate                        -> bytearray (see next entry)
#   parsing many records, performance      -> memoryview + struct.unpack_from (no copies)
#
# Anti-pattern: b"" + chunk in a loop. Each concatenation allocates a new
# bytes object — O(n^2). Use bytearray.extend or io.BytesIO instead.
```

## Decision Rule

```text
small fixed-size record               -> struct.pack / unpack
variable-length records on a stream    -> length prefix + struct + memoryview slicing
building bytes in a loop              -> io.BytesIO  (NOT b += part)
"transmit binary as text" (JSON/email)-> base64.b64encode / b64decode
parse hex strings                     -> bytes.fromhex (and .hex() to emit)
tolerate decode errors                -> errors="replace" for logs, "strict" for data
need to mutate                        -> bytearray (see next entry)
parsing many records, performance      -> memoryview + struct.unpack_from (no copies)
```

## Anti-Pattern

> [!warning] Anti-pattern
> b"" + chunk in a loop. Each concatenation allocates a new
> bytes object — O(n^2). Use bytearray.extend or io.BytesIO instead.

## Tips

- Always specify encoding explicitly: `s.encode("utf-8")` — never rely on platform default
- Open binary files with "rb" or "wb" mode — missing the b causes silent corruption on Windows
- Indexing bytes returns an int (0-255), not a character: `b"hi"[0]` is 104, not "h"
- `bytes` is immutable — use `bytearray` if you need to modify individual bytes

## Common Mistake

> [!warning] Opening a binary file in text mode: `open("image.png", "r")`. Python decodes bytes as text and corrupts binary data. Always use "rb" for binary read.

## Shorthand (Junior → Senior)

**Junior:**
```python
b = b"hello"               # literal — immutable
b = bytes(5)               # 5 zero bytes: b'\x00\x00\x00\x00\x00'
b = bytes([72, 101, 108])  # from iterable of ints: b'Hel'
b = bytes.fromhex('48656c6c6f')  # from hex string: b'hello'
```

**Senior:**
```python
list(b)                    # [65, 66, 67] — list of ints
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

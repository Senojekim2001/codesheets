---
type: "entry"
domain: "python"
file: "filesystem"
section: "file-io"
id: "file-read-methods"
title: ".read(), .readline(), .readlines(), iteration"
category: "Reading Data"
subtitle: "Read file contents"
signature_short: ".read() → str, .readline() → str, .readlines() → list[str], for line in f: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".read(), .readline(), .readlines(), iteration"
  - "file-read-methods"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/file-io"
  - "category/reading-data"
  - "tier/tiered"
---

# .read(), .readline(), .readlines(), iteration

> Read file contents

## Overview

.read() returns entire file; .readline() one line; .readlines() all lines as list. Iterate directly over file object for memory-efficient streaming.

## Signature

```python
.read() → str, .readline() → str, .readlines() → list[str], for line in f: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The four ways to read; pick by file size
# STRENGTHS - Smallest valid demonstration of each
# WEAKNESSES- No streaming guidance
#
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()                            # entire file -> one str

with open("file.txt", "r", encoding="utf-8") as f:
    first = f.readline()                          # ONE line (includes "\n")

with open("file.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()                         # list of all lines

with open("file.txt", "r", encoding="utf-8") as f:
    for line in f:                                # streaming — best for big files
        print(line.rstrip())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Iterate for streaming; chunked binary reads; tell/seek for navigation
# STRENGTHS - The shape that handles arbitrarily large files
# WEAKNESSES- No mmap; no decode-stream policy
#
# 1) STREAM TEXT line-by-line — constant memory regardless of size
def grep(path: str, needle: str):
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if needle in line:
                yield i, line.rstrip()

# 2) READ in CHUNKS for binary — never read() a 5 GB file
def chunks(path: str, size: int = 1 << 20):       # 1 MB blocks
    with open(path, "rb") as f:
        while data := f.read(size):
            yield data

# 3) TELL / SEEK — navigate within a file (binary mode is sane; text has caveats)
with open("data.bin", "rb") as f:
    pos = f.tell()                                # current byte offset
    f.seek(0, 2)                                  # 2 = SEEK_END -> EOF
    size = f.tell()
    f.seek(pos)                                   # back to start

# 4) PEEK without consuming — useful for header sniffing
with open("file.bin", "rb") as f:
    head = f.read(4)
    f.seek(0)                                     # rewind so the body still reads
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - mmap for random access, partial reads, decode policy on streams, head/tail tricks
# STRENGTHS - The patterns that turn "load and process" into "process anywhere"
# WEAKNESSES- N/A
#
import io
import mmap
from collections import deque

# 1) mmap — treat a file like a bytes-array; OS pages it in lazily
def find_first(path: str, needle: bytes) -> int:
    with open(path, "rb") as f:
        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m:
            return m.find(needle)                  # OS-backed search; no full read

# 2) HEAD — first N lines without reading the whole file
def head(path: str, n: int = 10):
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= n: break
            yield line.rstrip()

# 3) TAIL — last N lines using a deque(maxlen=N), constant memory
def tail(path: str, n: int = 10):
    with open(path, "r", encoding="utf-8") as f:
        return list(deque(f, maxlen=n))           # deque drops oldest as it fills

# 4) SEEK on TEXT files — DANGEROUS; only seek to positions returned by tell()
#    Multi-byte UTF-8 chars mean random offsets can land mid-codepoint and crash.
with open("text.txt", "rb") as f:                 # binary mode if you need real seek
    f.seek(-100, 2)                                # last 100 bytes
    last_chunk = f.read().decode("utf-8", errors="replace")

# 5) Decode a binary stream incrementally — for files larger than memory with
#    multi-byte codecs that won't split cleanly on chunk boundaries.
import codecs
def decode_lines(path: str, encoding: str = "utf-8"):
    decoder = codecs.getincrementaldecoder(encoding)(errors="replace")
    buf = ""
    with open(path, "rb") as f:
        while data := f.read(1 << 16):
            buf += decoder.decode(data)
            *complete, buf = buf.split("\n")     # keep the trailing partial line
            yield from complete
        buf += decoder.decode(b"", final=True)
        if buf: yield buf

# 6) read(n) vs readline() — read(n) is N BYTES on binary, N CHARS on text;
#    readline() respects newline= translation. Pick based on what you need.

# Decision rule:
#   small text file                            -> read() or readlines()
#   large file, line-oriented                   -> for line in f (streaming)
#   large file, binary processing                -> read(chunk_size) loop
#   random access (search, index)                -> mmap (read-only, lazy paging)
#   first N lines                                 -> islice / break-after-N
#   last N lines                                  -> deque(maxlen=N)
#   seek on text                                  -> open in binary mode and decode chunks
#
# Anti-pattern: f.read() on a 5 GB log file
#   Loads the whole thing into memory; OOMs the process. Stream line-by-line
#   or chunk-by-chunk; only materialize the result you actually need.
```

## Decision Rule

```text
small text file                            -> read() or readlines()
large file, line-oriented                   -> for line in f (streaming)
large file, binary processing                -> read(chunk_size) loop
random access (search, index)                -> mmap (read-only, lazy paging)
first N lines                                 -> islice / break-after-N
last N lines                                  -> deque(maxlen=N)
seek on text                                  -> open in binary mode and decode chunks
```

## Anti-Pattern

> [!warning] Anti-pattern
> f.read() on a 5 GB log file
>   Loads the whole thing into memory; OOMs the process. Stream line-by-line
>   or chunk-by-chunk; only materialize the result you actually need.

## Tips

- Iterate directly over file object for large files; more efficient than .readlines()
- .readline() and iteration include newline characters; use .strip() to remove them
- .readlines() loads entire file into memory; avoid for large files

## Common Mistake

> [!warning] Using .readlines() and storing result for processing large files causes memory issues

## Shorthand (Junior → Senior)

**Junior:**
```python
with open('file.txt', 'r') as f:
    lines = f.readlines()
for line in lines:
    process(line.strip())
```

**Senior:**
```python
with open('file.txt', 'r') as f:
    for line in f:
        process(line.strip())
```

## See Also

- [[Sections/filesystem/file-io/_Index|Filesystem & Paths → File I/O — Reading & Writing]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

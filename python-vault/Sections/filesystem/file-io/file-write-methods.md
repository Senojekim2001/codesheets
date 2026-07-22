---
type: "entry"
domain: "python"
file: "filesystem"
section: "file-io"
id: "file-write-methods"
title: ".write(), .writelines(), flushing, buffering"
category: "Writing Data"
subtitle: "Write file contents"
signature_short: ".write(str) → int, .writelines(list), .flush(), open(buffering=...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".write(), .writelines(), flushing, buffering"
  - "file-write-methods"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/file-io"
  - "category/writing-data"
  - "tier/tiered"
---

# .write(), .writelines(), flushing, buffering

> Write file contents

## Overview

.write() takes a single string; .writelines() takes an iterable (no newlines added). .flush() forces buffer to disk. buffering parameter controls buffering behavior.

## Signature

```python
.write(str) → int, .writelines(list), .flush(), open(buffering=...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - .write for one string at a time
# STRENGTHS - Smallest valid write
# WEAKNESSES- No writelines; no flush
#
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Line 1\n")
    f.write("Line 2\n")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - writelines (no auto-newline!), generator-friendly write, flush vs close
# STRENGTHS - The two-line idioms most write code uses
# WEAKNESSES- No atomic-write pattern; no fsync
#
# 1) writelines — the name LIES: it does NOT add newlines for you
items = ["alpha", "beta", "gamma"]
with open("out.txt", "w", encoding="utf-8") as f:
    f.writelines(line + "\n" for line in items)   # add newline yourself

# 2) Streaming a generator — constant memory regardless of size
def yield_records():
    for i in range(1_000_000):
        yield f"row {i}\n"

with open("big.txt", "w", encoding="utf-8") as f:
    f.writelines(yield_records())                 # writes lazily

# 3) flush vs close
#    flush()  pushes the BUFFER to the OS — visible to other readers
#    close()  also flushes; with-statement does this for you
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("ready\n")
    f.flush()                                     # other process can see it now
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Atomic writes, durability (fsync), append-only logs, bulk writes
# STRENGTHS - The patterns that prevent half-written files and silent data loss
# WEAKNESSES- N/A
#
import os
import tempfile
from pathlib import Path

# 1) ATOMIC WRITE — never let a reader see a half-written file
def atomic_write(path: Path, text: str, encoding: str = "utf-8"):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".tmp-", suffix=path.suffix)
    try:
        with os.fdopen(fd, "w", encoding=encoding) as f:
            f.write(text)
            f.flush()
            os.fsync(f.fileno())                  # actually on disk
        os.replace(tmp, path)                     # atomic rename
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise

# 2) APPEND-ONLY log — many writers; line buffering = visible at line boundaries
with open("audit.log", "a", encoding="utf-8", buffering=1) as f:
    f.write("event\n")                            # flushed at every newline

# 3) BULK write — write once, not in a hot loop
#    Each f.write() is a syscall; batching dramatically improves throughput.
def write_bulk(path: Path, lines):
    body = "".join(line + "\n" for line in lines)  # build in memory
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)                              # one syscall

# 4) BINARY writes — bytes only; great for io.BytesIO interop
import io
def to_bytes(parts: list[bytes]) -> bytes:
    buf = io.BytesIO()
    for p in parts:
        buf.write(p)
    return buf.getvalue()

# 5) CONCURRENT writers — DON'T expect "atomic write" without fsync + replace
#    POSIX guarantees a single write() of <= PIPE_BUF bytes is atomic, but a
#    crash mid-write leaves whatever was last flushed. Use atomic_write above.

# 6) Newline handling — text mode TRANSLATES "\n" -> os.linesep on Windows
#    Mostly fine, but for byte-exact files (CSV, network protocols) use newline=""
import csv
with open("data.csv", "w", encoding="utf-8", newline="") as f:
    csv.writer(f).writerow(["a", "b"])

# Decision rule:
#   small one-shot write                       -> write_text(s) or with open(... "w")
#   write that must survive a crash             -> tempfile + os.replace + fsync
#   append events / logs                         -> mode="a" + buffering=1
#   millions of small writes                     -> batch in memory, ONE write()
#   binary streams                                -> write_bytes / open("wb")
#   strict byte-exact text (CSV, HTTP)            -> newline="" + encoding="utf-8"
#
# Anti-pattern: f.writelines(items) expecting newlines added
#   The name implies "lines" but it's just iterable-of-strings concatenation.
#   Append "\n" to each item yourself, OR use print(item, file=f) which does.
```

## Decision Rule

```text
small one-shot write                       -> write_text(s) or with open(... "w")
write that must survive a crash             -> tempfile + os.replace + fsync
append events / logs                         -> mode="a" + buffering=1
millions of small writes                     -> batch in memory, ONE write()
binary streams                                -> write_bytes / open("wb")
strict byte-exact text (CSV, HTTP)            -> newline="" + encoding="utf-8"
```

## Anti-Pattern

> [!warning] Anti-pattern
> f.writelines(items) expecting newlines added
>   The name implies "lines" but it's just iterable-of-strings concatenation.
>   Append "\n" to each item yourself, OR use print(item, file=f) which does.

## Tips

- .writelines() does NOT add newlines; include them in strings if needed
- .flush() is rarely needed; with statement auto-flushes on exit
- Line buffering (buffering=1) useful for interactive output

## Common Mistake

> [!warning] Expecting .writelines() to add newlines automatically; it doesn't

## Shorthand (Junior → Senior)

**Junior:**
```python
with open('output.txt', 'w') as f:
    for item in items:
        f.write(str(item) + '\n')
```

**Senior:**
```python
with open('output.txt', 'w') as f:
    f.writelines(f'{item}\n' for item in items)
```

## See Also

- [[Sections/filesystem/file-io/_Index|Filesystem & Paths → File I/O — Reading & Writing]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

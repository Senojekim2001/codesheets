---
type: "entry"
domain: "python"
file: "filesystem"
section: "pathlib"
id: "path-read-write"
title: "Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()"
category: "File I/O"
subtitle: "Simple text/binary I/O"
signature_short: ".read_text(encoding=\"utf-8\") → str, .write_text(text, encoding=\"utf-8\"), .read_bytes() → bytes, .write_bytes(data)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()"
  - "path-read-write"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/pathlib"
  - "category/file-i-o"
  - "tier/tiered"
---

# Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()

> Simple text/binary I/O

## Overview

Convenient methods to read/write entire files without manual file handling. read_text/write_text handle encoding; read_bytes/write_bytes for binary data.

## Signature

```python
.read_text(encoding="utf-8") → str, .write_text(text, encoding="utf-8"), .read_bytes() → bytes, .write_bytes(data)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One call to read or write the whole file
# STRENGTHS - The smallest possible text/binary I/O
# WEAKNESSES- Loads the entire file into memory; no encoding discussion
#
from pathlib import Path

Path("message.txt").write_text("Hello, World!", encoding="utf-8")
print(Path("message.txt").read_text(encoding="utf-8"))

Path("data.bin").write_bytes(b"\x00\x01\x02")
print(Path("data.bin").read_bytes())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - ALWAYS specify encoding; .open() for streaming; line-by-line iteration
# STRENGTHS - The three idioms that handle 99% of file work
# WEAKNESSES- No atomic-write pattern; no JSON / CSV
#
from pathlib import Path

# 1) NEVER omit encoding — "utf-8" is the right default everywhere
Path("note.txt").write_text("héllo", encoding="utf-8")
text = Path("note.txt").read_text(encoding="utf-8")

# 2) Stream large files line-by-line (constant memory)
def grep(path: Path, needle: str):
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            if needle in line:
                yield line_no, line.rstrip()

# 3) Append vs overwrite — Path doesn't have append_text, drop to .open
def append_line(path: Path, line: str):
    with path.open("a", encoding="utf-8") as f:
        f.write(line + "\n")

# 4) Binary writes — bytes only, no encoding argument
Path("logo.png").write_bytes(downloaded_bytes())

def downloaded_bytes(): return b""
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Atomic writes, encoding errors, BOMs, large-file streaming, fsync semantics
# STRENGTHS - The patterns that prevent silent data corruption
# WEAKNESSES- N/A
#
import os
import tempfile
from pathlib import Path

# 1) ATOMIC WRITE — never leave half-written files visible to readers
def atomic_write_text(target: Path, text: str, encoding: str = "utf-8"):
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=target.parent, prefix=".tmp-", suffix=target.suffix)
    try:
        with os.fdopen(fd, "w", encoding=encoding) as f:
            f.write(text)
            f.flush(); os.fsync(f.fileno())       # force OS to commit
        os.replace(tmp, target)                   # atomic rename
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise

# 2) ENCODING ERRORS — pick the right error policy
#    strict      raise UnicodeDecodeError on bad bytes (default; usually right)
#    ignore       drop bad bytes silently
#    replace      replace bad bytes with U+FFFD
#    backslashreplace      represent as \xNN escape (preserves info)
#    surrogateescape       smuggle bytes through; round-trips on rewrite
text = Path("legacy.csv").read_text(encoding="utf-8", errors="replace")

# 3) BOMs — Windows tools emit utf-8-sig with a BOM; reading as "utf-8"
#    leaves a stray '\ufeff' on the first character. Use "utf-8-sig" to strip.
text = Path("excel_export.csv").read_text(encoding="utf-8-sig")

# 4) STREAMING reads for huge files — never read_text() a 5 GB log
def head(path: Path, n_lines: int = 10):
    with path.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= n_lines: break
            yield line.rstrip()

# 5) Large WRITES — flush in chunks, fsync if durability matters
def write_in_chunks(path: Path, data_iter, chunk_size: int = 1 << 20):
    with path.open("wb") as f:
        for chunk in data_iter:                    # iterable of bytes
            f.write(chunk)
        f.flush(); os.fsync(f.fileno())

# Decision rule:
#   small file (< MB)                         -> read_text / write_text with encoding=
#   large file                                  -> .open() + iterate lines / chunks
#   write must survive a crash                  -> tempfile + os.replace + fsync
#   files from Excel / Windows                   -> encoding="utf-8-sig" to skip BOM
#   logs with mojibake / mixed encodings         -> errors="replace" or "backslashreplace"
#   binary content                                -> read_bytes / write_bytes (NO encoding)
#   round-trip arbitrary bytes through str        -> errors="surrogateescape"
#
# Anti-pattern: open(path) without encoding=
#   Default encoding depends on the LOCALE (latin-1 on some servers, cp1252 on
#   Windows). The same code reads different bytes on different machines. Always
#   pass encoding="utf-8" explicitly.
```

## Decision Rule

```text
small file (< MB)                         -> read_text / write_text with encoding=
large file                                  -> .open() + iterate lines / chunks
write must survive a crash                  -> tempfile + os.replace + fsync
files from Excel / Windows                   -> encoding="utf-8-sig" to skip BOM
logs with mojibake / mixed encodings         -> errors="replace" or "backslashreplace"
binary content                                -> read_bytes / write_bytes (NO encoding)
round-trip arbitrary bytes through str        -> errors="surrogateescape"
```

## Anti-Pattern

> [!warning] Anti-pattern
> open(path) without encoding=
>   Default encoding depends on the LOCALE (latin-1 on some servers, cp1252 on
>   Windows). The same code reads different bytes on different machines. Always
>   pass encoding="utf-8" explicitly.

## Tips

- These methods open, read/write, and close in one call; no context manager needed
- Default encoding is UTF-8; specify encoding for other formats
- Large files are loaded entirely into memory; use .open() for streaming

## Common Mistake

> [!warning] Using these methods for large files causes memory issues; use streaming instead

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
with open('message.txt', 'r', encoding='utf-8') as f:
    content = f.read()
with open('message.txt', 'w', encoding='utf-8') as f:
    f.write('Hello, World!')
```

**Senior:**
```python
from pathlib import Path
Path('message.txt').write_text('Hello, World!')
content = Path('message.txt').read_text()
```

## See Also

- [[Sections/filesystem/pathlib/_Index|Filesystem & Paths → pathlib — Modern Path Handling]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

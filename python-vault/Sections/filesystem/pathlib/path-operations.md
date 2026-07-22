---
type: "entry"
domain: "python"
file: "filesystem"
section: "pathlib"
id: "path-operations"
title: ".exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()"
category: "Path Operations"
subtitle: "Modify filesystem"
signature_short: ".exists() → bool, .is_file() → bool, .is_dir() → bool, .mkdir(parents=False, exist_ok=False), .rename(target), .unlink(missing_ok=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()"
  - "path-operations"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/pathlib"
  - "category/path-operations"
  - "tier/tiered"
---

# .exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()

> Modify filesystem

## Overview

Path methods handle filesystem operations: check if path exists, test type (file vs directory), create directories, rename paths, and delete files. Use exist_ok=True to avoid errors if directory already exists.

## Signature

```python
.exists() → bool, .is_file() → bool, .is_dir() → bool, .mkdir(parents=False, exist_ok=False), .rename(target), .unlink(missing_ok=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Check existence, create dir, delete file
# STRENGTHS - Smallest valid lifecycle: exists -> create -> rename -> unlink
# WEAKNESSES- No race-condition discussion
#
from pathlib import Path

d = Path("workdir")
d.mkdir(parents=True, exist_ok=True)             # mkdir -p
print(d.is_dir())                                 # True

p = d / "data.txt"
p.write_text("hello")
print(p.exists(), p.is_file())                    # True True

p.unlink()                                        # delete the file
d.rmdir()                                         # remove EMPTY dir
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - exist_ok / missing_ok flags, stat(), iterate dir contents
# STRENGTHS - The robust idioms: no race conditions, no surprise errors
# WEAKNESSES- No recursive delete (covered in shutil entry)
#
from pathlib import Path

# 1) Make sure a path exists or doesn't, IDEMPOTENTLY (no race)
Path("logs/2024").mkdir(parents=True, exist_ok=True)   # create -p, ignore if exists
Path("old.log").unlink(missing_ok=True)                # delete, ignore if missing (3.8+)

# 2) stat() — size, mtime, mode in one call
p = Path("data.bin")
if p.exists():
    info = p.stat()
    print(info.st_size, info.st_mtime)            # bytes, epoch seconds

# 3) iterdir() — list a directory (NOT recursive); returns Path objects
for child in Path(".").iterdir():
    kind = "DIR " if child.is_dir() else "FILE"
    print(kind, child.name)

# 4) Rename / move within a filesystem
src = Path("draft.txt"); dst = Path("final.txt")
if src.exists():
    src.rename(dst)                               # atomic on same filesystem
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Atomic writes, TOCTOU (time-of-check to time-of-use), permissions
# STRENGTHS - The patterns that prevent half-written files and race-condition bugs
# WEAKNESSES- N/A
#
import os
import tempfile
from pathlib import Path

# 1) ATOMIC WRITE — write to a sibling temp file, then os.replace() (atomic rename)
def atomic_write_text(target: Path, text: str, encoding: str = "utf-8"):
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=target.parent, prefix=".tmp-", suffix=target.suffix)
    try:
        with os.fdopen(fd, "w", encoding=encoding) as f:
            f.write(text)
            f.flush(); os.fsync(f.fileno())       # crash-safe on POSIX
        os.replace(tmp, target)                   # atomic on same filesystem
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise

# 2) TOCTOU — never "if not exists: create"; the gap is a race
#    BAD:
#      if not p.exists(): p.mkdir()
#    GOOD:
#      p.mkdir(exist_ok=True)
#    BAD:
#      if p.exists(): p.unlink()
#    GOOD:
#      p.unlink(missing_ok=True)        # 3.8+

# 3) Replace vs rename — semantics differ across filesystems / OSes
#    os.replace(src, dst) — atomic, OVERWRITES dst (cross-platform)
#    src.rename(dst)      — fails on Windows if dst exists; on POSIX it overwrites
#    For "I want to overwrite", prefer os.replace.

# 4) Permissions — chmod with explicit mode bits
secret = Path("token.txt")
secret.write_text("...", encoding="utf-8")
secret.chmod(0o600)                                # rw for owner only

# 5) hardlink_to / symlink_to — explicit linking
target = Path("data.txt"); link = Path("latest.txt")
if link.exists() or link.is_symlink():
    link.unlink()
link.symlink_to(target)                            # symbolic link

# 6) Walk a tree safely — Path.walk is in 3.12+; otherwise use rglob or os.walk
# for root, dirs, files in Path("/var/log").walk():
#     ...

# Decision rule:
#   "make sure dir exists"                    -> mkdir(parents=True, exist_ok=True)
#   "delete if exists"                          -> unlink(missing_ok=True)
#   write that must survive crash               -> tempfile + os.replace (atomic)
#   atomic rename across same filesystem        -> os.replace, NOT path.rename on Windows
#   one-shot read of metadata                    -> .stat() once, not exists+is_file+stat
#   recursive delete                              -> shutil.rmtree(p, ignore_errors=False)
#   permissions on secrets                        -> chmod(0o600) explicitly
#
# Anti-pattern: "if exists, then create" / "if exists, then delete"
#   Two threads / processes can race in the gap and either both create the dir
#   (causing FileExistsError on the second) or both try to delete and one fails.
#   Use the missing_ok / exist_ok flags so the operation is idempotent.
```

## Decision Rule

```text
"make sure dir exists"                    -> mkdir(parents=True, exist_ok=True)
"delete if exists"                          -> unlink(missing_ok=True)
write that must survive crash               -> tempfile + os.replace (atomic)
atomic rename across same filesystem        -> os.replace, NOT path.rename on Windows
one-shot read of metadata                    -> .stat() once, not exists+is_file+stat
recursive delete                              -> shutil.rmtree(p, ignore_errors=False)
permissions on secrets                        -> chmod(0o600) explicitly
```

## Anti-Pattern

> [!warning] Anti-pattern
> "if exists, then create" / "if exists, then delete"
>   Two threads / processes can race in the gap and either both create the dir
>   (causing FileExistsError on the second) or both try to delete and one fails.
>   Use the missing_ok / exist_ok flags so the operation is idempotent.

## Tips

- Use parents=True to create intermediate directories
- exist_ok=True prevents FileExistsError
- .unlink() only works on files; use shutil.rmtree() for directories

## Common Mistake

> [!warning] Checking .exists() before .mkdir() creates race conditions; use exist_ok=True instead

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
path = 'data.txt'
if not os.path.exists(path):
    os.mkdir(path)
if os.path.exists(path) and os.path.isfile(path):
    os.remove(path)
```

**Senior:**
```python
from pathlib import Path
Path('data.txt').mkdir(parents=True, exist_ok=True)
Path('data.txt').unlink(missing_ok=True)
```

## See Also

- [[Sections/filesystem/pathlib/_Index|Filesystem & Paths → pathlib — Modern Path Handling]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

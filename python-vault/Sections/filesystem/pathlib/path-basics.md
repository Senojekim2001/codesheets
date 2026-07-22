---
type: "entry"
domain: "python"
file: "filesystem"
section: "pathlib"
id: "path-basics"
title: "Path()"
category: "Path Decomposition"
subtitle: "Access path components"
signature_short: "Path.name, .stem, .suffix, .parent, .parts"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Path()"
  - "path-basics"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/pathlib"
  - "category/path-decomposition"
  - "tier/tiered"
---

# Path()

> Access path components

## Overview

Path objects let you extract individual components: .name (filename), .stem (filename without extension), .suffix (extension), .parent (parent directory), .parts (tuple of all components).

## Signature

```python
Path.name, .stem, .suffix, .parent, .parts
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The four components every path has: name, stem, suffix, parent
# STRENGTHS - Smallest valid use; one Path object, four properties
# WEAKNESSES- No multi-suffix; no parts tuple
#
from pathlib import Path

p = Path("/home/user/documents/report.pdf")
print(p.name)        # 'report.pdf'
print(p.stem)        # 'report'
print(p.suffix)      # '.pdf'
print(p.parent)      # PosixPath('/home/user/documents')
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - parts/parents/anchor, multi-suffix files, with_* mutations
# STRENGTHS - The full decomposition + the methods that derive new paths
# WEAKNESSES- No symlink/resolve discussion
#
from pathlib import Path

p = Path("/home/user/code/data/archive.tar.gz")

print(p.parts)        # ('/', 'home', 'user', 'code', 'data', 'archive.tar.gz')
print(p.parents[0])   # PosixPath('/home/user/code/data')   parent
print(p.parents[2])   # PosixPath('/home/user')              grandparent's parent
print(p.anchor)       # '/'                                   root marker

# 1) Multi-suffix files — .suffix is only the LAST extension
print(p.suffix)       # '.gz'
print(p.suffixes)     # ['.tar', '.gz']
print(p.stem)         # 'archive.tar'   <-- still has '.tar'!

# 2) Derive new paths without re-typing
print(p.with_suffix(".zip"))    # archive.tar.zip
print(p.with_stem("backup"))    # /home/user/code/data/backup.gz   (3.9+)
print(p.with_name("other.bin")) # /home/user/code/data/other.bin

# 3) Path is HASHABLE — usable as dict key, set member
seen: set[Path] = set()
seen.add(p)
print(p in seen)      # True
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - resolve vs absolute, symlink trap, PurePath for portability, comparison rules
# STRENGTHS - The doctrine that prevents path-related security and correctness bugs
# WEAKNESSES- N/A
#
from pathlib import Path, PurePath, PurePosixPath, PureWindowsPath

# 1) absolute vs resolve
#    .absolute()   -> joins with cwd, NO filesystem access, doesn't follow symlinks
#    .resolve()    -> follows symlinks, validates path; raises (or strict=True only)
p = Path("./data/../config.json")
print(p.absolute())                              # /cwd/data/../config.json (lexical)
print(p.resolve())                                # /cwd/config.json (canonical)
print(p.resolve(strict=True))                     # raises if path doesn't exist (3.6+)

# 2) Multi-extension stripping — peel off ALL suffixes
def strip_all_suffixes(p: Path) -> Path:
    while p.suffix:
        p = p.with_suffix("")
    return p
print(strip_all_suffixes(Path("a.tar.gz")))       # PosixPath('a')

# 3) PurePath family — pure path manipulation WITHOUT filesystem access.
#    Useful when you're parsing paths from data (logs, S3 keys) on the wrong OS.
print(PurePosixPath("/home/user").name)           # works on Windows
print(PureWindowsPath(r"C:\Users\Alice").name)  # works on Linux
# PurePath also lets you check inheritance: isinstance(p, PurePath)

# 4) Equality and hashing — STRING comparison after normalization
#    Path("a/b") == Path("a/b")                        # True
#    Path("a/b") == Path("./a/b")                       # False  (strings differ)
#    Use .resolve() on both sides for SAME-FILE checks  (or .samefile())
Path(__file__).samefile(Path(__file__).resolve())  # True; follows symlinks

# 5) Path-traversal SAFETY — reject ".." escapes
def safe_under(base: Path, candidate: Path) -> bool:
    try:
        candidate.resolve().relative_to(base.resolve())
        return True
    except ValueError:
        return False                              # candidate escapes base

# Decision rule:
#   one-line filename / extension manipulation       -> .name / .stem / .suffix
#   multi-suffix file ("file.tar.gz")                 -> .suffixes / loop with_suffix("")
#   modify part of a path                              -> with_name / with_stem / with_suffix
#   parsing a foreign-OS path (Windows on Linux)      -> PureWindowsPath / PurePosixPath
#   need filesystem-aware absolute path                -> .resolve(strict=True)
#   need lexical-only absolute path                    -> .absolute()
#   "is this path inside that base"                    -> resolve + relative_to in try/except
#
# Anti-pattern: comparing Path objects with str on either side
#   Path("a") == "a"  -> False (different types). Use Path("a") == Path("a"),
#   or coerce with str(p) when interfacing with non-Path APIs.
```

## Decision Rule

```text
one-line filename / extension manipulation       -> .name / .stem / .suffix
multi-suffix file ("file.tar.gz")                 -> .suffixes / loop with_suffix("")
modify part of a path                              -> with_name / with_stem / with_suffix
parsing a foreign-OS path (Windows on Linux)      -> PureWindowsPath / PurePosixPath
need filesystem-aware absolute path                -> .resolve(strict=True)
need lexical-only absolute path                    -> .absolute()
"is this path inside that base"                    -> resolve + relative_to in try/except
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing Path objects with str on either side
>   Path("a") == "a"  -> False (different types). Use Path("a") == Path("a"),
>   or coerce with str(p) when interfacing with non-Path APIs.

## Tips

- .stem removes only the last suffix; use .suffixes for multiple extensions
- .parent is equivalent to str(p)[:-len(p.name)] but cleaner
- .parts returns a tuple; iterate safely without string splits

## Common Mistake

> [!warning] Mixing str operations with Path objects loses benefits; always use Path methods

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
path_str = '/home/user/documents/report.pdf'
name = os.path.basename(path_str)
stem = os.path.splitext(name)[0]
suffix = os.path.splitext(path_str)[1]
parent = os.path.dirname(path_str)
```

**Senior:**
```python
from pathlib import Path
p = Path('/home/user/documents/report.pdf')
name, stem, suffix, parent = p.name, p.stem, p.suffix, p.parent
```

## See Also

- [[Sections/filesystem/pathlib/_Index|Filesystem & Paths → pathlib — Modern Path Handling]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

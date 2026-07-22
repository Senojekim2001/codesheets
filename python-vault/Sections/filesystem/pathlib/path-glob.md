---
type: "entry"
domain: "python"
file: "filesystem"
section: "pathlib"
id: "path-glob"
title: ".glob(), .rglob()"
category: "Pattern Matching"
subtitle: "Search with patterns"
signature_short: ".glob(pattern) → generator, .rglob(pattern) → generator"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".glob(), .rglob()"
  - "path-glob"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/pathlib"
  - "category/pattern-matching"
  - "tier/tiered"
---

# .glob(), .rglob()

> Search with patterns

## Overview

.glob() finds files matching a pattern (e.g., "*.txt"). Use ** for recursive search. .rglob(pattern) is shorthand for .glob("**/" + pattern).

## Signature

```python
.glob(pattern) → generator, .rglob(pattern) → generator
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - .glob for one level, .rglob for any depth
# STRENGTHS - Smallest valid pattern search
# WEAKNESSES- No filtering; no exclusion patterns
#
from pathlib import Path

# All .txt files at the TOP level only
txts = list(Path(".").glob("*.txt"))

# All .py files at ANY depth (recursive)
pys = list(Path("src").rglob("*.py"))

print(len(txts), "txt files;", len(pys), "py files")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - case sensitivity, ** vs *, lazy iteration, sorting
# STRENGTHS - The four rules that prevent surprise glob results
# WEAKNESSES- No fnmatch translation; no symlink loop discussion
#
from pathlib import Path

# 1) glob is CASE-SENSITIVE on POSIX, INSENSITIVE on Windows
#    "*.PY" won't match "main.py" on Linux/macOS. Either be deterministic:
list(Path(".").glob("*.[Pp][Yy]"))                # explicit char classes

# 2) ** matches MULTIPLE directories; * matches ONE level only
list(Path(".").glob("*.py"))                       # only ./*.py
list(Path(".").glob("*/*.py"))                     # ./dir/*.py
list(Path(".").glob("**/*.py"))                    # ANY depth (rglob shorthand)

# 3) glob returns a LAZY ITERATOR — convert when you need len/sort
gen = Path(".").rglob("*.log")                    # not yet executed
files = sorted(gen, key=lambda p: p.stat().st_mtime, reverse=True)   # newest first

# 4) Filter by metadata after the glob — pathlib doesn't filter on size/age
big_logs = [p for p in Path(".").rglob("*.log") if p.stat().st_size > 1_000_000]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Symlink loops, hidden files, exclusions, walk vs rglob, performance
# STRENGTHS - The patterns that turn a one-line glob into safe, fast traversal
# WEAKNESSES- N/A
#
import os
from pathlib import Path

# 1) DOTFILES are NOT matched by * — explicit ".*" or [.]* needed
list(Path(".").glob("*"))                          # excludes .git, .env, .venv ...
list(Path(".").glob(".*"))                         # only dotfiles
list(Path(".").glob("[!.]*"))                      # everything except dotfiles

# 2) SYMLINK LOOPS — rglob can loop forever on a self-referential symlink.
#    pathlib.Path.walk (3.12+) has follow_symlinks=False by default; rglob does NOT.
#    Pre-3.12 safe walk:
def safe_rglob(root: Path, pattern: str):
    seen: set[Path] = set()
    for p in root.rglob(pattern):
        try:
            real = p.resolve()
        except OSError:
            continue
        if real in seen: continue
        seen.add(real)
        yield p

# 3) EXCLUDE noise (node_modules, __pycache__, .git, build/)
EXCLUDES = {".git", ".venv", "node_modules", "__pycache__", "dist", "build"}
def project_files(root: Path):
    for p in root.rglob("*"):
        if any(part in EXCLUDES for part in p.parts):
            continue
        if p.is_file():
            yield p

# 4) Path.walk (3.12+) — like os.walk, but Path-typed, gives prune control
def walk_with_prune(root: Path):
    for parent, dirs, files in root.walk():        # 3.12+
        # prune in place — modifying dirs[:] skips traversal
        dirs[:] = [d for d in dirs if d not in EXCLUDES]
        for f in files:
            yield parent / f

# 5) Performance — rglob is fine for thousands of files, but for MILLIONS:
#    - prefer os.scandir (returns DirEntry; is_file/is_dir don't re-stat)
#    - or use OS tools (find / fd / rg) and parse stdout

# 6) Cross-platform pattern handling — rglob uses fnmatch under the hood
#    On Windows, "*.py" also matches "*.PY" because the FS is case-insensitive
#    For deterministic case behavior, use explicit character classes.

# Decision rule:
#   one-shot dir scan                        -> Path.glob("*")
#   recursive search                          -> Path.rglob(pattern) or Path.walk (3.12+)
#   need to PRUNE subtrees                    -> Path.walk + dirs[:] = filtered
#   need DirEntry speed (millions of files)   -> os.scandir, not pathlib
#   case-sensitive on every OS                -> explicit char classes "*.[Pp][Yy]"
#   include dotfiles                            -> add a separate ".*" glob (or "*" UNION ".*")
#
# Anti-pattern: list(rglob("*")) on a tree containing node_modules / .venv
#   Pulls millions of irrelevant files into memory. Always exclude noise dirs
#   in the iteration, or use Path.walk + prune.
```

## Decision Rule

```text
one-shot dir scan                        -> Path.glob("*")
recursive search                          -> Path.rglob(pattern) or Path.walk (3.12+)
need to PRUNE subtrees                    -> Path.walk + dirs[:] = filtered
need DirEntry speed (millions of files)   -> os.scandir, not pathlib
case-sensitive on every OS                -> explicit char classes "*.[Pp][Yy]"
include dotfiles                            -> add a separate ".*" glob (or "*" UNION ".*")
```

## Anti-Pattern

> [!warning] Anti-pattern
> list(rglob("*")) on a tree containing node_modules / .venv
>   Pulls millions of irrelevant files into memory. Always exclude noise dirs
>   in the iteration, or use Path.walk + prune.

## Tips

- .glob() returns a generator; convert to list if you need to reuse results
- ** matches zero or more directories; use cautiously on large filesystems
- .rglob(pattern) is cleaner than .glob("**/" + pattern)

## Common Mistake

> [!warning] Expecting .glob() to return a sorted list; always sort results if order matters

## Shorthand (Junior → Senior)

**Junior:**
```python
import glob
import os
txt_files = glob.glob('*.txt')
py_files = glob.glob('**/*.py', recursive=True)
```

**Senior:**
```python
from pathlib import Path
txt_files = list(Path('.').glob('*.txt'))
py_files = list(Path('.').rglob('*.py'))
```

## See Also

- [[Sections/filesystem/os-shutil/glob-fnmatch|glob.glob(), glob.iglob(), fnmatch.fnmatch() (Filesystem & Paths)]]
- [[Sections/filesystem/pathlib/_Index|Filesystem & Paths → pathlib — Modern Path Handling]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

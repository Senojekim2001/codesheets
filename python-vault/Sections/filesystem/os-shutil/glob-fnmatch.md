---
type: "entry"
domain: "python"
file: "filesystem"
section: "os-shutil"
id: "glob-fnmatch"
title: "glob.glob(), glob.iglob(), fnmatch.fnmatch()"
category: "Pattern Matching"
subtitle: "Find files by pattern"
signature_short: "glob.glob(pathname) → list, glob.iglob(pathname) → generator, fnmatch.fnmatch(name, pattern) → bool"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "glob.glob(), glob.iglob(), fnmatch.fnmatch()"
  - "glob-fnmatch"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/os-shutil"
  - "category/pattern-matching"
  - "tier/tiered"
---

# glob.glob(), glob.iglob(), fnmatch.fnmatch()

> Find files by pattern

## Overview

glob.glob() expands pathname patterns with *, ?, [seq]. iglob() returns generator. fnmatch.fnmatch() tests if string matches pattern.

## Signature

```python
glob.glob(pathname) → list, glob.iglob(pathname) → generator, fnmatch.fnmatch(name, pattern) → bool
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - glob for shell-style file lookups; fnmatch for "does this name match a pattern?".
# STRENGTHS - Familiar wildcard syntax; no regex needed.
# WEAKNESSES- glob returns unsorted lists; ** needs recursive=True or it does nothing.
import fnmatch
import glob

# All .txt files in CWD.
print(glob.glob('*.txt'))

# Recursive: must pass recursive=True for ** to mean "any depth".
print(glob.glob('**/*.py', recursive=True))

# Does this name match this pattern?
print(fnmatch.fnmatch('test.py', '*.py'))     # True
print(fnmatch.fnmatch('data.csv', 'test_*'))  # False
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pathlib.rglob is the modern pick; iglob/iterdir for memory; fnmatch.translate to regex.
# STRENGTHS - Path objects, lazy iteration, case-insensitive matching, hidden-file control.
# WEAKNESSES- Hidden files (leading dot) are excluded by default -- explicit '.' patterns needed.
import fnmatch
import re
from pathlib import Path

# Pathlib equivalent -- yields Path objects you can chain .stat(), .read_text(), etc.
for p in sorted(Path('.').rglob('*.py')):
    print(p, p.stat().st_size)

# Case-insensitive (fnmatch is case-sensitive on POSIX).
def imatch(name: str, pattern: str) -> bool:
    return fnmatch.fnmatch(name.lower(), pattern.lower())

# Hidden files -- glob skips them by default.
print(glob.glob('*'))            # excludes .git, .env
print(glob.glob('.*'))            # only hidden
print(glob.glob('*', include_hidden=True))   # 3.11+: both

# Compile fnmatch patterns to a regex once, reuse in tight loops.
patterns = ['*.log', 'core.*', '*.tmp']
regex = re.compile('|'.join(fnmatch.translate(p) for p in patterns))
junk = [name for name in os.listdir('.') if regex.match(name)]
import os  # (kept here so the snippet stands alone)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Compiled regex from fnmatch.translate, scandir-based walker, gitignore-style negation.
# STRENGTHS - O(N) over the tree, single stat per entry, predictable memory.
# WEAKNESSES- glob's "everything in memory" model breaks on million-file trees; this trades clarity for scale.
import fnmatch
import os
import re
from pathlib import Path
from typing import Iterator

def compile_patterns(patterns: list[str]) -> re.Pattern:
    """fnmatch.translate -> single anchored regex covering all patterns."""
    if not patterns:
        return re.compile(r'(?!.*)')          # matches nothing
    return re.compile('|'.join(fnmatch.translate(p) for p in patterns))

def walk_filtered(root: Path,
                  include: list[str] | None = None,
                  exclude: list[str] | None = None,
                  follow_symlinks: bool = False) -> Iterator[Path]:
    """
    Streaming walker:
      - scandir-based (cheap), no realpath on every entry
      - prunes excluded directories (don't descend into node_modules)
      - returns Path objects in deterministic order
    """
    inc = compile_patterns(include or ['*'])
    exc = compile_patterns(exclude or [])

    def _walk(d: Path) -> Iterator[Path]:
        try:
            entries = sorted(os.scandir(d), key=lambda e: e.name)
        except (PermissionError, FileNotFoundError):
            return
        for e in entries:
            if exc.match(e.name):
                continue                                   # prune at this level
            if e.is_dir(follow_symlinks=follow_symlinks):
                yield from _walk(Path(e.path))
            elif e.is_file(follow_symlinks=follow_symlinks):
                if inc.match(e.name):
                    yield Path(e.path)
    yield from _walk(root)

# Usage: gitignore-flavored sweep.
hits = list(walk_filtered(
    Path('.'),
    include=['*.py', '*.pyx'],
    exclude=['__pycache__', '.git', '.venv', 'build', 'dist', '*.egg-info'],
))
print(f'{len(hits)} source files')

# Decision rule:
#   one-shot script, small tree         -> glob.glob / Path.rglob
#   need lazy iteration                 -> glob.iglob / Path.rglob (it's a generator)
#   million-file tree, prune dirs early -> os.scandir recursion (the walker above)
#   match a name against many patterns  -> compile fnmatch.translate joined with '|'
#   gitignore semantics required        -> use pathspec library (correct negation rules)
#
# Anti-pattern: glob.glob('**/*.py') without recursive=True. It returns []
# silently and you spend an hour wondering why your linter sees no files.
```

## Decision Rule

```text
one-shot script, small tree         -> glob.glob / Path.rglob
need lazy iteration                 -> glob.iglob / Path.rglob (it's a generator)
million-file tree, prune dirs early -> os.scandir recursion (the walker above)
match a name against many patterns  -> compile fnmatch.translate joined with '|'
gitignore semantics required        -> use pathspec library (correct negation rules)
```

## Anti-Pattern

> [!warning] Anti-pattern
> glob.glob('**/*.py') without recursive=True. It returns []
> silently and you spend an hour wondering why your linter sees no files.

## Tips

- glob.glob() returns unsorted list; sort if order matters
- Use recursive=True for ** patterns; can be slow on large trees
- fnmatch.fnmatch() is case-sensitive on Unix; use .lower() for case-insensitive match

## Common Mistake

> [!warning] Using ** without recursive=True; it won't match recursively

## Shorthand (Junior → Senior)

**Junior:**
```python
import glob
files = glob.glob('**/*.py', recursive=True)
if len(files) > 0:
    for f in files:
        print(f)
```

**Senior:**
```python
from pathlib import Path
for f in Path('.').rglob('*.py'):
    print(f)
```

## See Also

- [[Sections/filesystem/pathlib/path-glob|.glob(), .rglob() (Filesystem & Paths)]]
- [[Sections/filesystem/os-shutil/_Index|Filesystem & Paths → OS & shutil — System Operations]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

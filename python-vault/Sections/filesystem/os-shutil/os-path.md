---
type: "entry"
domain: "python"
file: "filesystem"
section: "os-shutil"
id: "os-path"
title: "os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ"
category: "OS Utilities"
subtitle: "Cross-platform operations"
signature_short: "os.path.join(*parts), os.path.exists(path) → bool, os.getcwd() → str, os.listdir(path) → list, os.environ → dict"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ"
  - "os-path"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/os-shutil"
  - "category/os-utilities"
  - "tier/tiered"
---

# os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ

> Cross-platform operations

## Overview

os module provides cross-platform operations. os.path methods work but pathlib is preferred. listdir() returns immediate children only; use glob for patterns.

## Signature

```python
os.path.join(*parts), os.path.exists(path) → bool, os.getcwd() → str, os.listdir(path) → list, os.environ → dict
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - First reach: stitch a path, see if it exists, list a folder.
# STRENGTHS - Stdlib, no install; works on every Python.
# WEAKNESSES- String paths are brittle; pathlib reads better for new code.
import os

# Join paths the cross-platform way (don't use '+').
full_path = os.path.join('/home/user', 'projects', 'data.txt')

# Check existence and current dir.
print(os.path.exists(full_path))
print(os.getcwd())

# List immediate children of a directory.
for name in os.listdir('.'):
    print(name)

# Read an environment variable with a default.
debug = os.environ.get('DEBUG', 'false')
print(debug)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - os.scandir for fast metadata, splitext for extensions, expanduser for ~
# STRENGTHS - scandir avoids extra stat() calls; ~5x faster than listdir+stat loop.
# WEAKNESSES- Still string-based; mixing os.path and pathlib in one codebase confuses readers.
import os

# Expand ~ to home dir, then split extension.
config = os.path.expanduser('~/.config/app.toml')
stem, ext = os.path.splitext(config)
print(stem, ext)  # /home/user/.config/app .toml

# scandir() yields DirEntry objects with cached stat info -- prefer over listdir().
total = 0
with os.scandir('.') as it:
    for entry in it:
        if entry.is_file():           # no extra syscall
            total += entry.stat().st_size
print(f'total bytes: {total}')

# Walk a tree, prune hidden dirs in place.
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        print(os.path.join(root, f))

# Read env with type coercion.
port = int(os.environ.get('PORT', '8080'))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pathlib by default; drop to os only for fileno/scandir/chdir contexts.
# STRENGTHS - Cross-platform, type-safe, composable; scandir + DirEntry for hot paths.
# WEAKNESSES- pathlib.Path objects allocate; in tight loops keep string paths.
import os
from contextlib import contextmanager
from pathlib import Path

@contextmanager
def pushd(target):
    """chdir into target, restore even on exception. os.chdir has no scope."""
    prev = os.getcwd()
    os.chdir(target)
    try:
        yield Path(target).resolve()
    finally:
        os.chdir(prev)

def fast_du(root):
    """Fast disk usage: scandir + recursion, single stat per entry."""
    total = 0
    with os.scandir(root) as it:
        for e in it:
            try:
                if e.is_file(follow_symlinks=False):
                    total += e.stat(follow_symlinks=False).st_size
                elif e.is_dir(follow_symlinks=False):
                    total += fast_du(e.path)
            except (PermissionError, FileNotFoundError):
                continue   # races and locked dirs are normal
    return total

# Required env vars: fail loudly at startup, not deep in a request.
def require_env(*names):
    missing = [n for n in names if n not in os.environ]
    if missing:
        raise SystemExit(f'missing required env: {missing}')
    return {n: os.environ[n] for n in names}

# Decision rule:
#   new code, paths as data            -> pathlib.Path
#   hot loop scanning many entries     -> os.scandir + DirEntry (cached stat)
#   need fileno / fork / chdir         -> os module
#   reading config from environment    -> os.environ.get with explicit defaults
#
# Anti-pattern: a + '/' + b for paths -- breaks on Windows, double-slashes on Unix,
# and silently allows '/etc/passwd' if b is user-controlled.
```

## Decision Rule

```text
new code, paths as data            -> pathlib.Path
hot loop scanning many entries     -> os.scandir + DirEntry (cached stat)
need fileno / fork / chdir         -> os module
reading config from environment    -> os.environ.get with explicit defaults
```

## Anti-Pattern

> [!warning] Anti-pattern
> a + '/' + b for paths -- breaks on Windows, double-slashes on Unix,
> and silently allows '/etc/passwd' if b is user-controlled.

## Tips

- Prefer pathlib.Path over os.path for new code
- .listdir() returns immediate children only; use pathlib.glob() for patterns
- os.environ is a dict-like object; use .get() with defaults to handle missing vars

## Common Mistake

> [!warning] Using string concatenation instead of os.path.join() or pathlib /

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
path = os.path.join(os.getcwd(), 'data', 'file.txt')
if os.path.exists(path):
    entries = os.listdir(os.path.dirname(path))
```

**Senior:**
```python
from pathlib import Path
path = Path.cwd() / 'data' / 'file.txt'
if path.exists():
    entries = list(path.parent.iterdir())
```

## See Also

- [[Sections/filesystem/os-shutil/_Index|Filesystem & Paths → OS & shutil — System Operations]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

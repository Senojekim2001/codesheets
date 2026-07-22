---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "pathlib-module"
title: "pathlib (Path Objects)"
category: "File System"
subtitle: "Cross-platform path manipulation without os.path"
signature_short: "from pathlib import Path
path = Path(\"/home/user/file.txt\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pathlib (Path Objects)"
  - "pathlib-module"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/file-system"
  - "tier/tiered"
---

# pathlib (Path Objects)

> Cross-platform path manipulation without os.path

## Overview

pathlib provides Path objects for filesystem operations — cleaner than os.path strings. Methods like .exists(), .read_text(), .glob() work directly on Path objects. Handles cross-platform paths automatically (/ vs \\).

## Signature

```python
from pathlib import Path
path = Path("/home/user/file.txt")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Path / "name" composes; .read_text/.write_text/.glob handle most ops.
# STRENGTHS - Object-oriented, cross-platform; replaces os.path entirely.
# WEAKNESSES- See filesystem.js for atomic writes, sandbox guards, traversal walking.
from pathlib import Path

p = Path.home() / "data" / "report.csv"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("name,value\n", encoding="utf-8")
print(p.exists(), p.stat().st_size)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - PurePosixPath / PureWindowsPath when parsing foreign-OS paths; rglob for recursion; resolve() for canonical paths.
# STRENGTHS - Foreign-OS path parsing without trying to open the file; symlink-aware canonicalization.
# WEAKNESSES- match() globs against the WHOLE path; for "ends with extension", check .suffix instead.
from pathlib import Path, PurePosixPath, PureWindowsPath

# Parse a Windows path on Linux for analysis (no FS access).
PureWindowsPath(r"C:\Users\alice\file.txt").drive          # 'C:'
PurePosixPath("/etc/hosts").parts                              # ('/', 'etc', 'hosts')

# Recursive walk + filter via rglob.
for py in Path("./src").rglob("*.py"):
    if "test_" not in py.name:
        print(py.relative_to("./src"))

# resolve() vs absolute(): resolve walks symlinks, absolute() doesn't.
Path("./data/../data/x.csv").resolve()          # canonical, symlinks resolved
Path("./data/x.csv").absolute()                  # absolute, no symlink resolution

# Compare suffix vs match.
p = Path("/var/log/app.tar.gz")
p.suffix                                         # '.gz'
p.suffixes                                       # ['.tar', '.gz']
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For atomic write, sandbox traversal guard, walking with prune, importlib.resources for package data — see filesystem.js.
# STRENGTHS - PurePath family enables foreign-OS analysis; resolve(strict=False) computes paths without touching disk.
# WEAKNESSES- Path objects allocate; in tight loops keep paths as strings or use os.scandir + DirEntry.
from pathlib import Path, PurePosixPath

def safe_join(base: Path, rel: str) -> Path:
    """Reject path traversal: rel cannot escape base via .. or absolute."""
    target = (base / rel).resolve()
    base_r = base.resolve()
    if base_r != target and base_r not in target.parents:
        raise ValueError(f"escapes sandbox: {target}")
    return target

# Decision rule:
#   one-off path manipulation              -> pathlib (avoid os.path)
#   parsing path strings from another OS    -> PurePosixPath / PureWindowsPath
#   walk a tree                            -> Path.rglob (or os.scandir for speed)
#   atomic write / fsync / sandbox          -> see filesystem.js senior tiers
#   per-package data files                  -> importlib.resources (NOT __file__-relative)
#   tight loop scanning many files          -> os.scandir + DirEntry (no Path allocations)
#
# Anti-pattern: Path(user_input) without traversal validation. ".." segments
# escape; absolute paths bypass the base entirely. Always safe_join into a
# known sandbox before opening.
```

## Decision Rule

```text
one-off path manipulation              -> pathlib (avoid os.path)
parsing path strings from another OS    -> PurePosixPath / PureWindowsPath
walk a tree                            -> Path.rglob (or os.scandir for speed)
atomic write / fsync / sandbox          -> see filesystem.js senior tiers
per-package data files                  -> importlib.resources (NOT __file__-relative)
tight loop scanning many files          -> os.scandir + DirEntry (no Path allocations)
```

## Anti-Pattern

> [!warning] Anti-pattern
> Path(user_input) without traversal validation. ".." segments
> escape; absolute paths bypass the base entirely. Always safe_join into a
> known sandbox before opening.

## Tips

- Use Path / operator instead of os.path.join() — much cleaner syntax
- Path.home(), Path.cwd() get common directories without os module
- glob() and rglob() replace os.walk() for finding files by pattern
- .read_text() and .write_text() eliminate open/close boilerplate

## Common Mistake

> [!warning] Mixing string paths with Path objects. Convert early: path = Path(string_path), then use Path methods throughout.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

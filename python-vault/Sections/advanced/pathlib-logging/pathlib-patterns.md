---
type: "entry"
domain: "python"
file: "advanced"
section: "pathlib-logging"
id: "pathlib-patterns"
title: "pathlib — Modern File Path Handling"
category: "Standard Library"
subtitle: "Path(), read_text, write_text, glob, mkdir, stat"
signature_short: "Path(\"dir\") / \"file.txt\"  |  path.read_text()  |  path.glob(\"**/*.py\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pathlib — Modern File Path Handling"
  - "pathlib-patterns"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/pathlib-logging"
  - "category/standard-library"
  - "tier/tiered"
---

# pathlib — Modern File Path Handling

> Path(), read_text, write_text, glob, mkdir, stat

## Overview

pathlib.Path replaces os.path with an object-oriented API. Paths compose with / operator. Methods for reading (read_text, read_bytes), writing (write_text, write_bytes), globbing (glob, rglob), and metadata (stat, exists, is_file, is_dir). Path objects are immutable and hashable. Available since Python 3.4, it's the recommended way to handle filesystem paths.

## Signature

```python
Path("dir") / "file.txt"  |  path.read_text()  |  path.glob("**/*.py")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Compose with /, read/write text in one call
# STRENGTHS - The minimum-shape pathlib usage
# WEAKNESSES- No globbing, no metadata, no edge cases
#
from pathlib import Path

p = Path("data") / "config.json"                  # cross-platform composition

# Read / write — no with statement needed
text = p.read_text(encoding="utf-8")
Path("out.txt").write_text("hello", encoding="utf-8")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Components, globbing, mkdir -p, atomic operations
# STRENGTHS - The five things you'll do constantly
# WEAKNESSES- No symlink / permission edge cases
#
from pathlib import Path

p = Path("/home/user/project/src/main.py")
p.name           # "main.py"
p.stem           # "main"
p.suffix         # ".py"
p.parent         # Path('/home/user/project/src')
p.with_suffix(".pyi")                              # Path('.../main.pyi')
p.with_stem("app")                                 # Path('.../app.py')   (3.9+)

# 1) Make sure a directory tree exists (mkdir -p)
out_dir = Path("out/reports/2024")
out_dir.mkdir(parents=True, exist_ok=True)

# 2) Globbing — pick by extension, recurse with rglob
for py in Path("src").rglob("*.py"):              # recursive
    print(py)

# 3) Directory listing
for item in Path(".").iterdir():
    kind = "DIR " if item.is_dir() else "FILE"
    print(kind, item.name)

# 4) Robust delete / rename
Path("old.log").unlink(missing_ok=True)            # 3.8+; ok if absent
Path("a.txt").rename("b.txt")                      # rename / move

# 5) File metadata
size = Path("big.bin").stat().st_size              # bytes
mtime = Path("big.bin").stat().st_mtime            # epoch seconds
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Atomic writes, resolve vs absolute, symlink safety, walk_up, large reads
# STRENGTHS - The patterns that prevent half-written files and path-traversal bugs
# WEAKNESSES- N/A
#
import os
import tempfile
from pathlib import Path

# 1) ATOMIC write — write to a sibling temp file, then rename. Avoids half-files.
def atomic_write(path: Path, data: str, encoding="utf-8"):
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".tmp-", suffix=path.suffix)
    try:
        with os.fdopen(fd, "w", encoding=encoding) as f:
            f.write(data)
            f.flush(); os.fsync(f.fileno())        # crash-safe on POSIX
        os.replace(tmp, path)                      # atomic rename
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise

# 2) RESOLVE vs ABSOLUTE — resolve() follows symlinks; .absolute() doesn't
p = Path("./relative/file.txt")
p.absolute()                                       # joins with cwd; may not exist
p.resolve(strict=True)                             # raises if missing OR unresolvable

# 3) Path-traversal safety — confine to a sandbox
def safe_join(base: Path, user_part: str) -> Path:
    base = base.resolve()
    candidate = (base / user_part).resolve()
    if base not in candidate.parents and candidate != base:
        raise ValueError("escapes sandbox")
    return candidate

# 4) Stream large files — never read_text() a 5 GB log
def grep(path: Path, needle: str):
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for i, line in enumerate(f, 1):
            if needle in line:
                yield i, line.rstrip()

# 5) walk_up=True (3.12+) — relative paths that may need to go up
Path("/a/b/c").relative_to("/a/b/d", walk_up=True)  # ../c

# 6) Glob caveats — rglob is RECURSIVE; '*' does NOT cross dir boundaries
list(Path("src").glob("*.py"))                     # only top-level .py
list(Path("src").rglob("*.py"))                    # ALL .py at any depth

# 7) Comparison — Path equality is STRING based after normalization;
#    use .samefile() for "is this the same inode?" (handles symlinks).
Path("a.txt").samefile("b.txt") if Path("a.txt").exists() else False

# Decision rule:
#   compose paths                              -> Path / "subdir" / "file"
#   read small file                              -> .read_text(encoding="utf-8")
#   read huge file                                -> .open() + iterate; never read_text
#   make sure dir exists                           -> mkdir(parents=True, exist_ok=True)
#   write that must survive crash                  -> tempfile + os.replace (atomic)
#   user-supplied path component                    -> resolve + sandbox check
#   recursive search                                -> rglob, NOT walk in modern code
#
# Anti-pattern: f-string path joins
#   path = f"{base}/{name}.txt"
#   Backslash on Windows; trailing-slash sensitivity; no validation. Always
#   Path(base) / f"{name}.txt".
```

## Decision Rule

```text
compose paths                              -> Path / "subdir" / "file"
read small file                              -> .read_text(encoding="utf-8")
read huge file                                -> .open() + iterate; never read_text
make sure dir exists                           -> mkdir(parents=True, exist_ok=True)
write that must survive crash                  -> tempfile + os.replace (atomic)
user-supplied path component                    -> resolve + sandbox check
recursive search                                -> rglob, NOT walk in modern code
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string path joins
>   path = f"{base}/{name}.txt"
>   Backslash on Windows; trailing-slash sensitivity; no validation. Always
>   Path(base) / f"{name}.txt".

## Tips

- Use / operator for path composition: Path("dir") / "subdir" / "file.txt" — cleaner than os.path.join.
- read_text() and write_text() are one-liners that handle open/close — no with statement needed. NEVER read_text() a multi-GB log; open and iterate line by line, or use mmap for binary scans.
- rglob("**/*.py") is recursive glob — much simpler than os.walk() + fnmatch.
- mkdir(parents=True, exist_ok=True) is the equivalent of mkdir -p — creates all parents, no error if exists.
- For writes that must survive a crash, do an ATOMIC write: tempfile.mkstemp in the same directory, write + fsync, then `os.replace(tmp, path)`. For user-supplied path components, `(base / user_part).resolve()` and check `base in candidate.parents` to prevent path traversal.

## Common Mistake

> [!warning] F-string path joins (`f"{base}/{name}.txt"`) — backslash on Windows, trailing-slash sensitivity, no validation. Use `Path(base) / f"{name}.txt"`. Also: writing in place to a path you care about — half-written files survive crashes; use atomic write + os.replace.

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
path = os.path.join("/home/user", "project", "config.json")
with open(path) as f:
    text = f.read()
```

**Senior:**
```python
text = (Path("/home/user") / "project" / "config.json").read_text()
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/advanced/pathlib-logging/_Index|Advanced Python → Pathlib & Logging]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

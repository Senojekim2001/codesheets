---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "pathlib"
title: "pathlib.Path"
category: "Standard Library"
subtitle: "Cross-platform paths — / operator, read_text, glob, mkdir"
signature_short: "Path(\"dir\") / \"file.txt\" | path.read_text() | path.glob(\"*.csv\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pathlib.Path"
  - "pathlib"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# pathlib.Path

> Cross-platform paths — / operator, read_text, glob, mkdir

## Overview

pathlib.Path is the modern replacement for os.path. It is object-oriented, cross-platform (handles / vs \ automatically), and far more readable. Use it for all file system operations — file reading, directory creation, globbing.

## Signature

```python
Path("dir") / "file.txt" | path.read_text() | path.glob("*.csv")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - / operator builds paths; read_text/write_text/glob handle most I/O; mkdir(exist_ok=True) is idempotent.
# STRENGTHS - One module replaces os.path + os + glob; cross-platform.
# WEAKNESSES- See filesystem.js for the deep dive (atomic writes, symlink safety, etc.).
from pathlib import Path

p = Path.home() / "Documents" / "data.csv"
print(p.name, p.stem, p.suffix, p.parent)

if p.exists():
    text = p.read_text(encoding="utf-8")

Path("./out").mkdir(parents=True, exist_ok=True)
list(Path(".").rglob("*.py"))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - resolve() to canonicalize; with_suffix() / with_name() for safe renames; .iterdir() for one-level scan.
# STRENGTHS - Methods chain cleanly; no string surgery for path manipulation.
# WEAKNESSES- resolve(strict=True) raises if the path doesn't exist — pass strict=False for "compute, don't check".
from pathlib import Path

p = Path("./data/input.csv").resolve()                  # absolute, symlinks resolved
target = p.with_suffix(".parquet")                      # data/input.parquet
backup = p.with_name(p.stem + ".bak" + p.suffix)        # data/input.bak.csv

# One-level listing with metadata.
for entry in Path("./logs").iterdir():
    if entry.is_file() and entry.suffix == ".log":
        print(entry, entry.stat().st_size)

# Idempotent + safe deletes.
Path("./tmp/out.txt").unlink(missing_ok=True)           # 3.8+: no error if absent

# Path comparison via parts (cross-platform safe):
Path("a/b/c").relative_to("a")                          # PosixPath('b/c')
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For deep filesystem patterns (atomic writes, sandbox guards, symlink loops) see filesystem.js. Here: the canonical "safe path" recipe.
# STRENGTHS - Path objects compose; resolve() catches symlink escapes; importlib.resources for in-package data.
# WEAKNESSES- Path is a value object — comparing across operating systems requires str(p) normalization.
from __future__ import annotations
from pathlib import Path
import importlib.resources as resources

def safe_join(base: Path, user_segment: str) -> Path:
    """Reject path traversal: user_segment cannot escape base."""
    target = (base / user_segment).resolve()
    if base.resolve() not in target.parents and target != base.resolve():
        raise ValueError(f"path escapes sandbox: {target}")
    return target

def package_data(filename: str) -> str:
    # Read a file shipped with your package — works in zipped wheels too.
    return resources.files("my_package.data").joinpath(filename).read_text("utf-8")

# Decision rule:
#   any new code involving paths               -> pathlib.Path
#   atomic file writes / symlink safety        -> see filesystem.js senior tiers
#   file shipped with your package             -> importlib.resources (NOT __file__-relative)
#   filtering many entries                      -> os.scandir for speed; pathlib for readability
#   reject path traversal                       -> resolve() + check ancestor relationship
#   cross-platform path display                 -> str(p) (forward slashes on Windows: use as_posix())
#
# Anti-pattern: Path concatenation via str(p) + "/" + name. Defeats the whole
# point — you lose Windows handling AND the safety of path operations. Always
# use the / operator.
```

## Decision Rule

```text
any new code involving paths               -> pathlib.Path
atomic file writes / symlink safety        -> see filesystem.js senior tiers
file shipped with your package             -> importlib.resources (NOT __file__-relative)
filtering many entries                      -> os.scandir for speed; pathlib for readability
reject path traversal                       -> resolve() + check ancestor relationship
cross-platform path display                 -> str(p) (forward slashes on Windows: use as_posix())
```

## Anti-Pattern

> [!warning] Anti-pattern
> Path concatenation via str(p) + "/" + name. Defeats the whole
> point — you lose Windows handling AND the safety of path operations. Always
> use the / operator.

## Tips

- `Path.home() / "docs" / "file.txt"` is cross-platform — no hardcoded `/` or `\\`
- `path.read_text()` / `write_text()` for simple files; `open()` context manager for streaming
- `path.rglob("*.csv")` recursively finds all CSVs — replaces `os.walk()` for most cases
- `exist_ok=True` in `mkdir()` is idempotent — create if absent, no error if present

## Common Mistake

> [!warning] String concatenation for paths: `path = dir + "/" + filename`. Breaks on Windows where the separator is `\\`. Use `Path(dir) / filename`.

## Shorthand (Junior → Senior)

**Junior:**
```python
from pathlib import Path
p = Path("data") / "input.csv"
p = Path.home() / "Documents" / "report.pdf"
p = Path.cwd() / "output"
```

**Senior:**
```python
sorted(Path("data").glob("**/*.json"))
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

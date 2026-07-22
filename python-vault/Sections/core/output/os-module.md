---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "os-module"
title: "os module"
category: "I/O"
subtitle: "os.getcwd, os.listdir, os.makedirs, os.environ, os.path"
signature_short: "import os | os.getcwd() | os.path.join(a, b)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "os module"
  - "os-module"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# os module

> os.getcwd, os.listdir, os.makedirs, os.environ, os.path

## Overview

The os module provides a portable interface to operating system functionality. For file paths, prefer pathlib.Path — but os.environ, os.getcwd(), os.makedirs(), and os.listdir() are still widely used. os.path functions are largely replaced by pathlib but appear in legacy code.

## Signature

```python
import os | os.getcwd() | os.path.join(a, b)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
import os

# GOAL: inspect and navigate the filesystem
os.getcwd()          # → '/home/user/project'  (current directory)
os.listdir('.')      # → ['main.py', 'data', 'README.md']  (contents)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
import os

# GOAL: create directories and read environment variables safely
# WHY: exist_ok=True means no error if the directory already exists — safe to call repeatedly
os.makedirs("output/reports", exist_ok=True)

# WHY: .get() returns a default instead of raising KeyError on missing vars
debug = os.environ.get("DEBUG", "false")
db_url = os.environ.get("DATABASE_URL", "sqlite:///local.db")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
import os

# GOAL: walk an entire directory tree and collect all file paths
# WHY: os.walk yields (root, dirs, files) for every folder in the tree
all_files = []
for root, dirs, files in os.walk("src"):
    for f in files:
        all_files.append(os.path.join(root, f))

# NOTE: for new code, prefer pathlib — Path("src").rglob("*") is more readable
# os.path.join is still valuable when working with legacy code or string-based APIs
#
# Decision rule:
#   any path manipulation in new code         -> pathlib.Path
#   read env var with default                 -> os.environ.get("KEY", default)
#   recursive directory walk                  -> Path.rglob("*") (or os.walk for control)
#   create dirs idempotently                  -> os.makedirs(p, exist_ok=True) / Path.mkdir(parents=True, exist_ok=True)
#   spawn subprocess                          -> subprocess.run (NOT os.system)
#   atomic file replace                       -> os.replace(src, dst)
#   temp dir / file                           -> tempfile module
#   string-based legacy API needs str path    -> os.path.join / os.fspath(path)
#
# Anti-pattern: building paths with f-strings or "+" string concatenation.
#   `f"{dir}/{file}"` breaks on Windows backslashes, double slashes, and missing separators;
#   it also mixes user input with code in a way that's brittle. Use Path(dir) / file (or
#   os.path.join) — handles separators, normalizes empties, works cross-platform.
```

## Decision Rule

```text
any path manipulation in new code         -> pathlib.Path
read env var with default                 -> os.environ.get("KEY", default)
recursive directory walk                  -> Path.rglob("*") (or os.walk for control)
create dirs idempotently                  -> os.makedirs(p, exist_ok=True) / Path.mkdir(parents=True, exist_ok=True)
spawn subprocess                          -> subprocess.run (NOT os.system)
atomic file replace                       -> os.replace(src, dst)
temp dir / file                           -> tempfile module
string-based legacy API needs str path    -> os.path.join / os.fspath(path)
```

## Anti-Pattern

> [!warning] Anti-pattern
> building paths with f-strings or "+" string concatenation.
>   `f"{dir}/{file}"` breaks on Windows backslashes, double slashes, and missing separators;
>   it also mixes user input with code in a way that's brittle. Use Path(dir) / file (or
>   os.path.join) — handles separators, normalizes empties, works cross-platform.

## Tips

- Use `pathlib.Path` for new code — `os.path` functions are largely superseded
- `os.makedirs(path, exist_ok=True)` is idempotent — safe to call even if directory exists
- `os.environ.get("KEY", "default")` is safer than `os.environ["KEY"]` — no KeyError on missing
- `os.walk()` is the classic recursive directory traversal — `Path.rglob()` is the modern equivalent

## Common Mistake

> [!warning] String concatenation for paths: `dir + "/" + file`. Use `os.path.join(dir, file)` or `Path(dir) / file` — handles Windows backslashes correctly.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

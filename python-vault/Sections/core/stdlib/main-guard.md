---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "main-guard"
title: "__name__ == \"__main__\""
category: "Standard Library"
subtitle: "Separates runnable script from importable module"
signature_short: "if __name__ == \"__main__\": main()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "__name__ == \"__main__\""
  - "main-guard"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# __name__ == "__main__"

> Separates runnable script from importable module

## Overview

When Python runs a file directly, it sets __name__ to "__main__". When the file is imported as a module, __name__ is set to the module name. The guard ensures that script code (like calling main()) only runs when the file is executed directly, not when it is imported.

## Signature

```python
if __name__ == "__main__": main()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Guard your script's entry point so importers don't accidentally run it.
# STRENGTHS - Same file works as both library and CLI.
# WEAKNESSES- Easy to forget; without it any import has side effects.
def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(3, 4))                       # only runs on 'python file.py'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Wrap script logic in main(); guard calls main(); package entry point lives in __main__.py.
# STRENGTHS - main() is testable; unit tests don't trigger CLI side effects; 'python -m mypkg' just works.
# WEAKNESSES- Forgetting the guard re-introduces import-time side effects.
def parse_args(argv: list[str] | None = None):
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("input")
    return p.parse_args(argv)

def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    print(f"processing {args.input}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())                # propagates exit code

# In a package:  mypkg/__main__.py
# from mypkg.cli import main
# raise SystemExit(main())
# Then: python -m mypkg ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - main(argv: list[str] | None) -> int as the contract; entry-point in pyproject; package shim in __main__.py.
# STRENGTHS - Tests drive the CLI directly; pyproject [project.scripts] makes 'mycli' a real binary; -m mypkg is the universal fallback.
# WEAKNESSES- Multiple entry points mean docs must say which one is canonical — "mycli" or "python -m mypkg".
from __future__ import annotations
import sys

def main(argv: list[str] | None = None) -> int:
    """argv=None reads sys.argv[1:]; pass a list in tests."""
    if argv is None: argv = sys.argv[1:]
    # ... parsing + dispatch ...
    return 0

# pyproject.toml:
# [project.scripts]
# mycli = "mypkg.cli:main"
#
# mypkg/__main__.py (so 'python -m mypkg' works the same):
# from mypkg.cli import main
# raise SystemExit(main())

# Tests:
# def test_cli_ok():
#     assert main(["--input", "x.csv"]) == 0
#
# def test_cli_bad_input():
#     assert main(["--bad"]) == 2

# Decision rule:
#   any script that may also be imported    -> if __name__ == "__main__": guard, ALWAYS
#   reusable + testable script               -> wrap in main(argv=None) -> int
#   ship as a binary                          -> pyproject [project.scripts] entry point
#   "python -m mypkg" support                -> mypkg/__main__.py that imports + calls main
#   error exit code                          -> raise SystemExit(main())
#
# Anti-pattern: putting top-level side effects (DB connections, file reads,
# argparse) outside the guard. Any 'import mymod' triggers them — surprising
# everyone, breaking test discovery, slowing imports.
```

## Decision Rule

```text
any script that may also be imported    -> if __name__ == "__main__": guard, ALWAYS
reusable + testable script               -> wrap in main(argv=None) -> int
ship as a binary                          -> pyproject [project.scripts] entry point
"python -m mypkg" support                -> mypkg/__main__.py that imports + calls main
error exit code                          -> raise SystemExit(main())
```

## Anti-Pattern

> [!warning] Anti-pattern
> putting top-level side effects (DB connections, file reads,
> argparse) outside the guard. Any 'import mymod' triggers them — surprising
> everyone, breaking test discovery, slowing imports.

## Tips

- Always wrap your script logic in `main()` and call it from the guard — makes it testable
- Without the guard, `import mymodule` would run all top-level code including side effects
- Put `if __name__ == "__main__": main()` at the very end of every script
- `__main__.py` in a package lets you run it with `python -m mypackage`

## Common Mistake

> [!warning] Putting import-time side effects (file reads, DB connections, print statements) at module top level without a guard. Any file that imports your module will trigger those side effects.

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

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

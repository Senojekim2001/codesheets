---
type: "entry"
domain: "python"
file: "cli"
section: "argparse"
id: "argparse-types"
title: "type=, choices=, nargs=, action=, default=, required="
category: "Configuration"
subtitle: "Type conversion, validation, and defaults"
signature_short: "add_argument(..., type=int, choices=[...], nargs=\"*\", action=\"store_true\", default=X, required=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "type=, choices=, nargs=, action=, default=, required="
  - "argparse-types"
tags:
  - "python"
  - "python/cli"
  - "python/cli/argparse"
  - "category/configuration"
  - "tier/tiered"
---

# type=, choices=, nargs=, action=, default=, required=

> Type conversion, validation, and defaults

## Overview

type= converts arguments (int, float, str). choices= restricts to allowed values. nargs="*" collects multiple arguments into a list. action="store_true" treats flag as boolean. default= provides fallback. required=True forces the argument.

## Signature

```python
add_argument(..., type=int, choices=[...], nargs="*", action="store_true", default=X, required=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - type= for conversion, choices= for enums, nargs= for lists, action= for flags.
# STRENGTHS - Validation happens in argparse before your code runs.
# WEAKNESSES- type= functions raise => "invalid value" error; nargs="+" needs at least one.
import argparse

p = argparse.ArgumentParser()
p.add_argument("--count", type=int, default=1)
p.add_argument("--level", choices=["low", "medium", "high"], required=True)
p.add_argument("--files", nargs="*", default=[])
p.add_argument("--verbose", action="store_true")

args = p.parse_args()
print(args.count, args.level, args.verbose, args.files)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - pathlib for paths, action="count" for repeated flags (-vvv), append/extend for lists, custom type=fn for validation.
# STRENGTHS - Type-driven errors with clear messages; Path makes downstream code Path-aware.
# WEAKNESSES- type= fires on EACH value; if you build a heavy object, you pay per arg.
import argparse
from pathlib import Path

def positive_int(s: str) -> int:
    n = int(s)
    if n < 1:
        raise argparse.ArgumentTypeError("must be >= 1")
    return n

p = argparse.ArgumentParser()
p.add_argument("input", type=Path)                            # Path object, not str
p.add_argument("-o", "--output", type=Path, default=Path("out.json"))
p.add_argument("-n", "--workers", type=positive_int, default=4)
p.add_argument("-v", "--verbose", action="count", default=0)  # -v -> 1, -vv -> 2
p.add_argument("--tag", action="append", default=[])           # repeatable: --tag a --tag b
p.add_argument("--include", nargs="+")                          # one or more
p.add_argument("--dry-run", action=argparse.BooleanOptionalAction)  # gives --dry-run / --no-dry-run

args = p.parse_args()
if args.dry_run:
    print("dry run")
print(args.input.resolve())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Custom Action subclass for cross-arg invariants; Enum-backed choices; environment defaults; typed extras.
# STRENGTHS - Validation code lives next to the parser; one-shot conversion to typed records; env vars merge cleanly.
# WEAKNESSES- Custom Action classes hide logic from --help; document them or you'll surprise the next reader.
from __future__ import annotations
import argparse
import os
from enum import StrEnum
from pathlib import Path

class Level(StrEnum):
    LOW = "low"; MED = "medium"; HIGH = "high"

# 1) Environment-variable defaults: CLI flag wins, env is the fallback, code default is last.
def env_default(name: str, fallback: str | None = None) -> str | None:
    return os.environ.get(name, fallback)

# 2) Custom Action to enforce "if --strict, --include is required".
class StrictAction(argparse.Action):
    def __call__(self, parser, ns, values, option_string=None):
        setattr(ns, self.dest, values)
        if values and not getattr(ns, "include", None):
            parser.error("--strict requires --include")

# 3) Path with EXISTENCE check at parse time -- fail fast, before any work.
def existing_path(s: str) -> Path:
    p = Path(s).expanduser().resolve()
    if not p.exists():
        raise argparse.ArgumentTypeError(f"path does not exist: {p}")
    return p

p = argparse.ArgumentParser()
p.add_argument("input", type=existing_path)
p.add_argument("--level",   choices=list(Level), type=Level,
               default=Level(env_default("APP_LEVEL", "low")))
p.add_argument("--api-key", default=env_default("APP_API_KEY"),
               required=env_default("APP_API_KEY") is None,
               help="defaults to $APP_API_KEY")
p.add_argument("--include", nargs="+", default=[])
p.add_argument("--strict",  action=StrictAction, nargs=0,
               default=False, help="enable strict mode (requires --include)")
# Boolean tri-state: --feature / --no-feature / (default).
p.add_argument("--feature", action=argparse.BooleanOptionalAction, default=None)

# 4) Pass-through extras for nested tools ('mycli -- pytest -k test_x'):
known, passthrough = p.parse_known_args()
print(known, passthrough)

# Decision rule:
#   integer with bounds                 -> custom type=fn that raises ArgumentTypeError
#   path that must exist                -> existing_path type fn (raises before main)
#   one of N strings                    -> StrEnum + choices=list(Enum) + type=Enum
#   repeatable flag                     -> action="append" (preserves order; new list per run)
#   counter (-v / -vv / -vvv)           -> action="count"
#   --feature / --no-feature             -> argparse.BooleanOptionalAction (3.9+)
#   "if A, then B is required"          -> custom Action subclass; fail in __call__
#   environment fallback                -> os.environ.get(...) as default; required=missing
#   passthrough to a subprocess         -> parse_known_args(); pass the rest
#
# Anti-pattern: type=lambda s: open(s) (or similar resource-acquiring lambdas).
# A failed parse leaks an open file because argparse doesn't manage cleanup of
# converted values. Convert names; open files inside main().
```

## Decision Rule

```text
integer with bounds                 -> custom type=fn that raises ArgumentTypeError
path that must exist                -> existing_path type fn (raises before main)
one of N strings                    -> StrEnum + choices=list(Enum) + type=Enum
repeatable flag                     -> action="append" (preserves order; new list per run)
counter (-v / -vv / -vvv)           -> action="count"
--feature / --no-feature             -> argparse.BooleanOptionalAction (3.9+)
"if A, then B is required"          -> custom Action subclass; fail in __call__
environment fallback                -> os.environ.get(...) as default; required=missing
passthrough to a subprocess         -> parse_known_args(); pass the rest
```

## Anti-Pattern

> [!warning] Anti-pattern
> type=lambda s: open(s) (or similar resource-acquiring lambdas).
> A failed parse leaks an open file because argparse doesn't manage cleanup of
> converted values. Convert names; open files inside main().

## Tips

- nargs="+" requires at least one arg; nargs="?" is optional
- action="count" increments for each flag use (-vvv)
- type= runs conversion; fails with error if invalid (use a custom function that raises argparse.ArgumentTypeError for clear messages)
- Use `argparse.BooleanOptionalAction` (3.9+) for tri-state `--feature / --no-feature` flags. For env-var fallbacks, set `default=os.environ.get("APP_X")` and conditionally `required=`. Use `parse_known_args()` when you need to passthrough args to a nested tool (`mycli -- pytest -k test_x`).

## Common Mistake

> [!warning] `type=lambda s: open(s)` (or any resource-acquiring lambda) — a failed parse leaks an open file because argparse doesn't manage cleanup of converted values. Convert names; open files inside main(). Also: `action="store_true"` with `type=` conflicts.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
count = int(sys.argv[sys.argv.index('--count') + 1]) if '--count' in sys.argv else 1
level = 'low'
for i, arg in enumerate(sys.argv):
    if arg == '--level':
        level = sys.argv[i+1]
        break
verbose = '--verbose' in sys.argv
```

**Senior:**
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--count', type=int, default=1)
parser.add_argument('--level', choices=['low', 'medium', 'high'], required=True)
parser.add_argument('--verbose', action='store_true')
args = parser.parse_args()
```

## See Also

- [[Sections/cli/click/click-types|type=click.Path(), click.Choice(), click.IntRange(), click.File() (CLI Tools)]]
- [[Sections/cli/argparse/_Index|CLI Tools → argparse]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]

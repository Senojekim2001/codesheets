---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "argparse-cli"
title: "argparse (Command-Line Arguments)"
category: "I/O"
subtitle: "Professional CLI with argument validation"
signature_short: "import argparse
parser = ArgumentParser()
parser.add_argument(...)
args = parser.parse_args()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "argparse (Command-Line Arguments)"
  - "argparse-cli"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/i-o"
  - "tier/tiered"
---

# argparse (Command-Line Arguments)

> Professional CLI with argument validation

## Overview

argparse provides CLI argument parsing with automatic help, type conversion, and validation. Better than sys.argv parsing manually.

## Signature

```python
import argparse
parser = ArgumentParser()
parser.add_argument(...)
args = parser.parse_args()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ArgumentParser + add_argument + parse_args; positional vs --flag.
# STRENGTHS - Stdlib; auto --help; type conversion + validation built in.
# WEAKNESSES- See cli.js for the deep dive (typed Args dataclass, sysexits, subcommands, registry).
import argparse

p = argparse.ArgumentParser(description="Process a file")
p.add_argument("input")                                  # positional, required
p.add_argument("--format", "-f", choices=["json", "csv"], default="json")
p.add_argument("--verbose", "-v", action="store_true")
args = p.parse_args()

print(args.input, args.format, args.verbose)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Custom type for validation; mutex groups for "exactly one"; subcommands via add_subparsers; main(argv) for testability.
# STRENGTHS - Self-validating CLI; subcommand dispatch via set_defaults(func=...).
# WEAKNESSES- See cli.js senior tier for typed dataclass at the seam, sysexits codes, registry pattern.
import argparse
import sys

def positive_int(s: str) -> int:
    n = int(s)
    if n <= 0: raise argparse.ArgumentTypeError("must be > 0")
    return n

def build():
    p = argparse.ArgumentParser(prog="mycli")
    p.add_argument("-v", "--verbose", action="count", default=0)   # -v, -vv, -vvv
    sp = p.add_subparsers(dest="cmd", required=True)

    init = sp.add_parser("init")
    init.add_argument("--workers", type=positive_int, default=4)
    init.set_defaults(func=lambda a: print(f"init w={a.workers}"))

    run = sp.add_parser("run")
    run.add_argument("path")
    run.set_defaults(func=lambda a: print(f"run {a.path}"))
    return p

def main(argv: list[str] | None = None) -> int:
    args = build().parse_args(argv)
    args.func(args)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For typed Args dataclass at the parser seam, sysexits-aligned exit codes, BooleanOptionalAction, parents= for shared flags, custom Action subclasses, and the registry pattern — see cli.js senior tier.
# STRENGTHS - That entry shows main(argv: list[str] | None) -> int as the contract for testable CLIs.
# WEAKNESSES- argparse error messages aren't customizable per-error; for richer UX reach for click/typer.
# Quick reference (full senior tier in cli.js):
#
#   testable main(argv=None) -> int     -> argparse parses argv, returns int exit code
#   typed config object                  -> dataclass adapter at the parser seam
#   sysexits codes                        -> EX_USAGE=64, EX_DATAERR=65, EX_NOINPUT=66, EX_SOFTWARE=70
#   "if A then B is required"             -> validate(args) post-parse + parser.error(msg)
#   --feature / --no-feature              -> argparse.BooleanOptionalAction (3.9+)
#   shared flags across subcommands       -> parents=[common_parser]
#   ambiguous prefix (--ver vs --verify)  -> allow_abbrev=False
#   environment fallback                  -> default=os.environ.get("APP_X"); required if absent
#
# Decision rule:
#   stdlib-only tool                      -> argparse
#   typed surface, decorator style         -> Typer (see cli.js)
#   plug-in registry / entry_points        -> Click (see cli.js)
#   completions, REPL, complex UX          -> Click / Typer ship them; argparse needs argcomplete
#
# Anti-pattern: reading sys.argv directly inside main() and never returning an
# exit code. Tests can't drive the function with a custom argv, and shells
# can't tell success from failure. main(argv=None) -> int is the contract.
```

## Decision Rule

```text
stdlib-only tool                      -> argparse
typed surface, decorator style         -> Typer (see cli.js)
plug-in registry / entry_points        -> Click (see cli.js)
completions, REPL, complex UX          -> Click / Typer ship them; argparse needs argcomplete
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading sys.argv directly inside main() and never returning an
> exit code. Tests can't drive the function with a custom argv, and shells
> can't tell success from failure. main(argv=None) -> int is the contract.

## Tips

- nargs="+" for at least one, "*" for zero or more, "?" for optional argument
- action="store_true" for boolean flags (no value needed)
- required=True on add_argument for mandatory options
- Custom type functions validate inputs (e.g., positive_int)

## Common Mistake

> [!warning] Using sys.argv directly instead of argparse. argparse provides validation, help, and better defaults.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

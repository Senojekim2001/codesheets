---
type: "entry"
domain: "python"
file: "cli"
section: "argparse"
id: "argparse-basics"
title: "ArgumentParser, add_argument(), parse_args()"
category: "Fundamentals"
subtitle: "Define CLI arguments and parse from sys.argv"
signature_short: "ArgumentParser(description=\"...\"); add_argument(\"name\", help=\"...\"); parse_args()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ArgumentParser, add_argument(), parse_args()"
  - "argparse-basics"
tags:
  - "python"
  - "python/cli"
  - "python/cli/argparse"
  - "category/fundamentals"
  - "tier/tiered"
---

# ArgumentParser, add_argument(), parse_args()

> Define CLI arguments and parse from sys.argv

## Overview

ArgumentParser creates a parser object. add_argument() registers arguments (positional require order, optional use -- prefix). parse_args() reads sys.argv and returns a Namespace with argument values.

## Signature

```python
ArgumentParser(description="..."); add_argument("name", help="..."); parse_args()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One ArgumentParser, add_argument for each flag/positional, call parse_args() once.
# STRENGTHS - Stdlib (no install); auto-generates --help and -h.
# WEAKNESSES- Verbose for many args; subcommand support gets clunky as the surface grows.
import argparse

p = argparse.ArgumentParser(description="Greet a user")
p.add_argument("name", help="user name")                 # positional, required
p.add_argument("--greeting", default="Hello")            # optional, with default
args = p.parse_args()

print(f"{args.greeting}, {args.name}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Wrap parsing in build_parser(); main(argv) takes a list so it's testable; explicit return code.
# STRENGTHS - Unit tests can call main(["greet", "alice"]) without monkey-patching sys.argv.
# WEAKNESSES- argparse mutates sys.argv-equivalent globally if you skip argv= -- always pass it through.
import argparse
import sys

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="hello", description="Greet a user")
    p.add_argument("name")
    p.add_argument("--greeting", "-g", default="Hello", help="greeting word")
    p.add_argument("--count", "-n", type=int, default=1)
    p.add_argument("--version", action="version", version="hello 1.2.0")
    return p

def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)            # argv=None reads sys.argv[1:]
    for _ in range(args.count):
        print(f"{args.greeting}, {args.name}!")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())                          # propagate the int as exit code

# Test:
#   from mycli import main
#   assert main(["alice", "--count", "2"]) == 0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - argparse for stdlib-only tools; typed Namespace via dataclass; explicit exit codes; defer side effects until after parsing succeeds.
# STRENGTHS - No third-party deps; types flow into mypy via dataclass; hooks for log setup, signal handling, traceback control.
# WEAKNESSES- argparse's Namespace is dynamically typed -- cast to a dataclass at the boundary or every downstream call sees Any.
from __future__ import annotations
import argparse
import logging
import signal
import sys
from dataclasses import dataclass

# Standard UNIX exit codes (sysexits.h).
EX_OK, EX_USAGE, EX_DATAERR, EX_NOINPUT, EX_SOFTWARE = 0, 64, 65, 66, 70

@dataclass(frozen=True, slots=True)
class Args:
    name: str
    greeting: str
    count: int
    verbose: int

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="hello",
        description="Greet a user.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="examples:\n  hello alice -n 3 -g Hi",
        allow_abbrev=False,                        # don't accept --gre as --greeting
    )
    p.add_argument("name")
    p.add_argument("-g", "--greeting", default="Hello")
    p.add_argument("-n", "--count", type=int, default=1)
    p.add_argument("-v", "--verbose", action="count", default=0,
                   help="-v info, -vv debug")
    p.add_argument("--version", action="version", version="hello 1.2.0")
    return p

def parse(argv: list[str] | None = None) -> Args:
    ns = build_parser().parse_args(argv)
    if ns.count < 1:
        build_parser().error("--count must be >= 1")  # exits with code 2
    return Args(name=ns.name, greeting=ns.greeting,
                count=ns.count, verbose=ns.verbose)

def setup_logging(level: int) -> None:
    levels = {0: logging.WARNING, 1: logging.INFO}
    logging.basicConfig(level=levels.get(level, logging.DEBUG),
                        format="%(levelname)s %(name)s: %(message)s")

def main(argv: list[str] | None = None) -> int:
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)    # allow 'mycli ... | head' to exit cleanly
    try:
        args = parse(argv)                             # SystemExit on bad usage
    except SystemExit as e:
        return e.code if isinstance(e.code, int) else EX_USAGE

    setup_logging(args.verbose)
    log = logging.getLogger("hello")

    try:
        for _ in range(args.count):
            print(f"{args.greeting}, {args.name}!")
    except BrokenPipeError:
        return EX_OK                                   # downstream closed early
    except OSError as e:
        log.error("io error: %s", e); return EX_SOFTWARE
    return EX_OK

if __name__ == "__main__":
    raise SystemExit(main())

# Decision rule:
#   stdlib-only tool                            -> argparse, factor build_parser() out
#   needs typed config object downstream         -> map Namespace -> dataclass at the seam
#   shell pipelines (| head)                    -> reset SIGPIPE; convert BrokenPipeError to EX_OK
#   parsing failure                             -> argparse exits with 2 already; let SystemExit propagate
#   ambiguous prefix (--ver vs --verify)        -> allow_abbrev=False
#   "show defaults in --help"                   -> ArgumentDefaultsHelpFormatter
#   tests on argv                                -> main(argv: list[str] | None = None); return int
#
# Anti-pattern: reading sys.argv directly inside main() and never returning an
# exit code. Tests can't drive the function with a custom argv, and shells can't
# tell success from failure. main(argv=None) -> int is the contract.
```

## Decision Rule

```text
stdlib-only tool                            -> argparse, factor build_parser() out
needs typed config object downstream         -> map Namespace -> dataclass at the seam
shell pipelines (| head)                    -> reset SIGPIPE; convert BrokenPipeError to EX_OK
parsing failure                             -> argparse exits with 2 already; let SystemExit propagate
ambiguous prefix (--ver vs --verify)        -> allow_abbrev=False
"show defaults in --help"                   -> ArgumentDefaultsHelpFormatter
tests on argv                                -> main(argv: list[str] | None = None); return int
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading sys.argv directly inside main() and never returning an
> exit code. Tests can't drive the function with a custom argv, and shells can't
> tell success from failure. main(argv=None) -> int is the contract.

## Tips

- Positional args have no -- prefix and are required
- Optional args use -- prefix and are optional by default
- help= text appears in --help output
- Wrap the entry as `main(argv: list[str] | None = None) -> int` and `raise SystemExit(main())` — tests can call main(["alice", "--count", "2"]) without monkey-patching sys.argv. For pipeline tools, reset SIGPIPE (`signal.signal(SIGPIPE, SIG_DFL)`) and convert BrokenPipeError to exit 0 so `mycli ... | head` exits cleanly. Pass `allow_abbrev=False` to ArgumentParser if you don't want `--ver` accepted as `--verify`.

## Common Mistake

> [!warning] Reading sys.argv directly inside main() and never returning an exit code — tests can't drive the function with a custom argv, and shells can't tell success from failure. The contract is `main(argv: list[str] | None = None) -> int`; let `argparse.error(...)` exit with 2 and let SystemExit propagate.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
if len(sys.argv) < 2:
    print("Usage: script.py <name>")
    sys.exit(1)
name = sys.argv[1]
greeting = sys.argv[3] if len(sys.argv) > 3 else 'Hello'
print(f"{greeting}, {name}")
```

**Senior:**
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('name')
parser.add_argument('--greeting', default='Hello')
args = parser.parse_args()
print(f"{args.greeting}, {args.name}")
```

## See Also

- [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo() (CLI Tools)]]
- [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument() (CLI Tools)]]
- [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr (CLI Tools)]]
- [[Sections/cli/argparse/_Index|CLI Tools → argparse]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]

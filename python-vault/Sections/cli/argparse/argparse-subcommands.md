---
type: "entry"
domain: "python"
file: "cli"
section: "argparse"
id: "argparse-subcommands"
title: "add_subparsers(), set_defaults()"
category: "Advanced"
subtitle: "Sub-commands with independent argument sets"
signature_short: "add_subparsers(dest=\"cmd\"); subparsers.add_parser(\"cmd\"); set_defaults(func=handler)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "add_subparsers(), set_defaults()"
  - "argparse-subcommands"
tags:
  - "python"
  - "python/cli"
  - "python/cli/argparse"
  - "category/advanced"
  - "tier/tiered"
---

# add_subparsers(), set_defaults()

> Sub-commands with independent argument sets

## Overview

add_subparsers() creates a sub-parser container. add_parser() registers each sub-command. set_defaults(func=...) binds a handler. In main, call args.func(args) to invoke the right handler.

## Signature

```python
add_subparsers(dest="cmd"); subparsers.add_parser("cmd"); set_defaults(func=handler)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - subparsers.add_parser('cmd') gives each command its own argument set; set_defaults binds a handler.
# STRENGTHS - One CLI, many verbs (git-style); each verb has its own --help.
# WEAKNESSES- Without 'required=True' on add_subparsers, running with no command falls through silently.
import argparse

p = argparse.ArgumentParser()
sp = p.add_subparsers(dest="cmd", required=True)

c = sp.add_parser("commit")
c.add_argument("-m", "--message", required=True)
c.set_defaults(func=lambda a: print(f"commit: {a.message}"))

push = sp.add_parser("push")
push.add_argument("--branch", default="main")
push.set_defaults(func=lambda a: print(f"push to {a.branch}"))

args = p.parse_args()
args.func(args)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - One handler function per command; set_defaults(func=...) wires it; parents= shares common flags.
# STRENGTHS - Adding a new command is one helper + one add_parser; common --verbose/--quiet not duplicated.
# WEAKNESSES- Handlers receive a Namespace; cast to a typed record at the boundary if downstream code expects it.
import argparse
import sys

def cmd_commit(args: argparse.Namespace) -> int:
    print(f"commit -m {args.message!r}")
    return 0

def cmd_push(args: argparse.Namespace) -> int:
    print(f"push -> {args.branch}")
    return 0

# Shared flags for ALL commands.
common = argparse.ArgumentParser(add_help=False)
common.add_argument("-v", "--verbose", action="count", default=0)

def build() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="vcs", parents=[common])
    sp = p.add_subparsers(dest="cmd", required=True)

    c = sp.add_parser("commit", parents=[common], help="commit staged changes")
    c.add_argument("-m", "--message", required=True)
    c.set_defaults(func=cmd_commit)

    s = sp.add_parser("push", parents=[common], help="push to remote")
    s.add_argument("--branch", default="main")
    s.set_defaults(func=cmd_push)
    return p

def main(argv: list[str] | None = None) -> int:
    return build().parse_args(argv).func(...)        # see senior tier for cleaner pattern

if __name__ == "__main__":
    sys.exit(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Subcommand registry pattern: each command is a callable returning int; auto-registered via decorator; help text from docstring.
# STRENGTHS - Adding a command is ONE function + ONE decorator; tests target the function directly; no parsing in handlers.
# WEAKNESSES- Decorator-driven registration relies on import-time side effects -- be careful with lazy imports for fast --help.
from __future__ import annotations
import argparse
import inspect
import sys
from collections.abc import Callable
from typing import TypeAlias

# Each subcommand: configures its own parser, returns an int from main.
Configure: TypeAlias = Callable[[argparse.ArgumentParser], None]
Run:       TypeAlias = Callable[[argparse.Namespace], int]

_REGISTRY: dict[str, tuple[Configure, Run, str]] = {}

def command(name: str) -> Callable[[Run], Run]:
    """Decorator: register a function as the 'run' for subcommand <name>.

    The function may declare a sibling 'configure_<name>' for its parser.
    """
    def deco(run: Run) -> Run:
        configure_name = f"configure_{run.__name__}"
        configure = inspect.getmodule(run).__dict__.get(configure_name,
                                                        lambda p: None)
        help_text = (run.__doc__ or "").strip().splitlines()[0] if run.__doc__ else ""
        _REGISTRY[name] = (configure, run, help_text)
        return run
    return deco

# --- subcommands -----------------------------------------------------------
def configure_run_commit(p: argparse.ArgumentParser) -> None:
    p.add_argument("-m", "--message", required=True)
    p.add_argument("--amend", action="store_true")

@command("commit")
def run_commit(args: argparse.Namespace) -> int:
    """Commit staged changes."""
    if args.amend: print("amending HEAD")
    print(f"commit: {args.message}")
    return 0

def configure_run_push(p: argparse.ArgumentParser) -> None:
    p.add_argument("--branch", default="main")
    p.add_argument("--force",  action="store_true")

@command("push")
def run_push(args: argparse.Namespace) -> int:
    """Push to the remote."""
    print(f"push{' --force' if args.force else ''} -> {args.branch}")
    return 0

# --- top-level parser + main ----------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("-v", "--verbose", action="count", default=0)

    p = argparse.ArgumentParser(prog="vcs", parents=[common])
    sp = p.add_subparsers(dest="cmd", required=True)
    for name, (configure, run, help_text) in sorted(_REGISTRY.items()):
        sub = sp.add_parser(name, parents=[common], help=help_text)
        configure(sub)
        sub.set_defaults(_run=run)
    return p

def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args._run(args)
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr); return 130
    except Exception as e:                                        # last-resort handler
        print(f"error: {e}", file=sys.stderr); return 1

if __name__ == "__main__":
    raise SystemExit(main())

# Decision rule:
#   2-3 commands, ad hoc                       -> set_defaults(func=...) inline lambdas
#   stable command set                         -> separate run_<cmd> functions, manual wiring
#   growing command set / plug-ins             -> registry decorator + configure_<cmd> sibling
#   shared flags (--verbose, --quiet, --json)  -> parents=[common]
#   nested subcommands ('mycli db migrate')    -> add_subparsers on the inner parser too
#   3rd-party plug-in commands                 -> click + entry_points (argparse has no plug-in API)
#   "no subcommand prints help"                -> required=True on add_subparsers; argparse exits 2
#
# Anti-pattern: a 200-line if/elif chain matching args.cmd. Each new command
# means editing the dispatcher AND the parser AND probably the imports.
# Decorator + registry keeps add/remove to one file each.
```

## Decision Rule

```text
2-3 commands, ad hoc                       -> set_defaults(func=...) inline lambdas
stable command set                         -> separate run_<cmd> functions, manual wiring
growing command set / plug-ins             -> registry decorator + configure_<cmd> sibling
shared flags (--verbose, --quiet, --json)  -> parents=[common]
nested subcommands ('mycli db migrate')    -> add_subparsers on the inner parser too
3rd-party plug-in commands                 -> click + entry_points (argparse has no plug-in API)
"no subcommand prints help"                -> required=True on add_subparsers; argparse exits 2
```

## Anti-Pattern

> [!warning] Anti-pattern
> a 200-line if/elif chain matching args.cmd. Each new command
> means editing the dispatcher AND the parser AND probably the imports.
> Decorator + registry keeps add/remove to one file each.

## Tips

- dest="command" stores which subcommand was called; pass `required=True` to add_subparsers so running with no command exits with an error rather than falling through silently
- Share common flags (--verbose, --quiet) across all subcommands by defining them on a parent parser with `add_help=False` and passing `parents=[common]` to each add_parser
- Use set_defaults(func=handler) to avoid big if/elif chains; for a growing command set, register handlers via a decorator + module-level registry so adding a command is one function + one decorator. Wrap the dispatch in `try/except KeyboardInterrupt: return 130` for clean Ctrl-C.

## Common Mistake

> [!warning] A 200-line `if/elif args.cmd == ...` chain — every new command means editing the dispatcher AND the parser AND the imports. Use `set_defaults(func=handler)` (or a registry decorator) so add/remove is one file each.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
if len(sys.argv) < 2:
    print("Usage: cmd [commit|push] [options]")
elif sys.argv[1] == 'commit':
    msg_idx = sys.argv.index('-m') + 1 if '-m' in sys.argv else None
    message = sys.argv[msg_idx] if msg_idx else 'No message'
    print(f"Commit: {message}")
elif sys.argv[1] == 'push':
    print("Push to main")
```

**Senior:**
```python
import argparse
parser = argparse.ArgumentParser()
subs = parser.add_subparsers(dest='cmd')
commit = subs.add_parser('commit')
commit.add_argument('-m', required=True)
commit.set_defaults(func=lambda a: print(f"Commit: {a.m}"))
args = parser.parse_args()
args.func(args) if hasattr(args, 'func') else parser.print_help()
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/cli/argparse/_Index|CLI Tools → argparse]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]

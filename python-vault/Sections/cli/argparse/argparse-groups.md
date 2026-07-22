---
type: "entry"
domain: "python"
file: "cli"
section: "argparse"
id: "argparse-groups"
title: "add_argument_group(), add_mutually_exclusive_group()"
category: "Organization"
subtitle: "Group arguments in help output and enforce constraints"
signature_short: "add_argument_group(\"title\"); add_mutually_exclusive_group()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "add_argument_group(), add_mutually_exclusive_group()"
  - "argparse-groups"
tags:
  - "python"
  - "python/cli"
  - "python/cli/argparse"
  - "category/organization"
  - "tier/tiered"
---

# add_argument_group(), add_mutually_exclusive_group()

> Group arguments in help output and enforce constraints

## Overview

add_argument_group() organizes arguments in --help under titled sections for readability. add_mutually_exclusive_group() enforces that only one argument in the group can be used at a time.

## Signature

```python
add_argument_group("title"); add_mutually_exclusive_group()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Group related flags so --help reads cleanly; mutually-exclusive groups reject "--verbose --quiet" automatically.
# STRENGTHS - Better help; argparse enforces "pick one" without your code checking.
# WEAKNESSES- Group titles are pure cosmetics; mutually-exclusive enforcement is the only real gate.
import argparse

p = argparse.ArgumentParser()

ig = p.add_argument_group("input options")
ig.add_argument("--file")
ig.add_argument("--text")

og = p.add_argument_group("output options")
og.add_argument("--format", choices=["json", "csv"], default="json")

mode = p.add_mutually_exclusive_group()
mode.add_argument("--verbose", action="store_true")
mode.add_argument("--quiet",   action="store_true")

args = p.parse_args()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - required=True on the mutex group when ONE of the alternatives must be chosen; group descriptions for context; nested groups for readability.
# STRENGTHS - --help reads like documentation; argparse handles the "exactly one" constraint at parse time.
# WEAKNESSES- Mutex groups can't be nested; complex constraints (A xor B, but C requires A) need custom validation.
import argparse

p = argparse.ArgumentParser()

# Title + description + dest grouping.
input_g = p.add_argument_group("inputs", description="Provide exactly one source")
src = input_g.add_mutually_exclusive_group(required=True)        # must pick one
src.add_argument("--file", type=open)                             # opens file at parse time
src.add_argument("--text")
src.add_argument("--stdin", action="store_true")

# Cross-cutting flags.
out = p.add_argument_group("output")
out.add_argument("--format", choices=["json", "csv"], default="json")
out.add_argument("--output", "-o")

# Verbosity is independent.
verb = p.add_mutually_exclusive_group()
verb.add_argument("-v", "--verbose", action="count", default=0)
verb.add_argument("-q", "--quiet",   action="store_true")

args = p.parse_args()
src_data = (args.file.read() if args.file else
            args.text         if args.text else
            __import__("sys").stdin.read())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Mutex + custom validators in a single post-parse pass; argparse for the simple "exactly one" cases, code for "if A then B" rules; --help that mirrors the docs.
# STRENGTHS - Constraint logic lives in one function; tests cover the rules without subprocess invocation.
# WEAKNESSES- argparse's mutex enforcement happens BEFORE your validate() runs; a bad combination of types + groups still raises with argparse's wording.
from __future__ import annotations
import argparse
import sys
from typing import NoReturn

def _die(parser: argparse.ArgumentParser, msg: str) -> NoReturn:
    parser.error(msg)                                # exits with code 2

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="ingest",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,   # show defaults
        description="Ingest data from a single source.",
    )

    # 1) Source: exactly one of --file / --url / --stdin (the simple case).
    src = p.add_argument_group("source").add_mutually_exclusive_group(required=True)
    src.add_argument("--file")
    src.add_argument("--url")
    src.add_argument("--stdin", action="store_true")

    # 2) Auth: optional, but if --auth-token then --auth-realm is required.
    #    argparse can't express that; validate post-parse.
    auth = p.add_argument_group("auth")
    auth.add_argument("--auth-token")
    auth.add_argument("--auth-realm")

    # 3) Mode: --dry-run / --apply, mutually exclusive AND optional.
    mode = p.add_argument_group("mode").add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply",   action="store_true")

    # 4) Verbosity: -v -vv, OR --quiet (mutex).
    verb = p.add_mutually_exclusive_group()
    verb.add_argument("-v", "--verbose", action="count", default=0)
    verb.add_argument("-q", "--quiet",   action="store_true")
    return p

def validate(p: argparse.ArgumentParser, args: argparse.Namespace) -> None:
    if args.auth_token and not args.auth_realm:
        _die(p, "--auth-token requires --auth-realm")
    if args.url and args.url.startswith("file://"):
        _die(p, "use --file instead of --url file://...")
    if args.apply and args.quiet:
        _die(p, "--apply must not be silent; remove --quiet")
    if args.dry_run is False and args.apply is False:
        # neither set -> default to dry-run for safety
        args.dry_run = True

def main(argv: list[str] | None = None) -> int:
    p = build_parser()
    args = p.parse_args(argv)
    validate(p, args)                                # all argparse.error() exits with 2
    print(f"mode={'dry-run' if args.dry_run else 'apply'} src=" +
          ("stdin" if args.stdin else (args.file or args.url)))
    return 0

if __name__ == "__main__":
    sys.exit(main())

# Decision rule:
#   "exactly one of A/B/C"                 -> mutex group with required=True
#   "at most one of A/B/C"                 -> mutex group (no required=True)
#   "if A then B is required"              -> validate(args) post-parse, parser.error()
#   "all of A/B/C OR none"                 -> validate(args) post-parse
#   logical relation between groups        -> validate(args) -- argparse can't express it
#   per-group help text                    -> add_argument_group(title, description=...)
#   show defaults inline in --help         -> formatter_class=ArgumentDefaultsHelpFormatter
#   safe-default behavior                  -> set in validate(args) AFTER mutex check
#
# Anti-pattern: stuffing every constraint into nested argparse calls. Mutex
# groups are not nestable, and 'required=True' on a parent group doesn't
# imply anything about children. When the rule isn't "exactly one of N
# flags", write it in validate(args) and call parser.error() to keep the
# UX consistent with argparse's other diagnostics.
```

## Decision Rule

```text
"exactly one of A/B/C"                 -> mutex group with required=True
"at most one of A/B/C"                 -> mutex group (no required=True)
"if A then B is required"              -> validate(args) post-parse, parser.error()
"all of A/B/C OR none"                 -> validate(args) post-parse
logical relation between groups        -> validate(args) -- argparse can't express it
per-group help text                    -> add_argument_group(title, description=...)
show defaults inline in --help         -> formatter_class=ArgumentDefaultsHelpFormatter
safe-default behavior                  -> set in validate(args) AFTER mutex check
```

## Anti-Pattern

> [!warning] Anti-pattern
> stuffing every constraint into nested argparse calls. Mutex
> groups are not nestable, and 'required=True' on a parent group doesn't
> imply anything about children. When the rule isn't "exactly one of N
> flags", write it in validate(args) and call parser.error() to keep the
> UX consistent with argparse's other diagnostics.

## Tips

- Mutually exclusive groups automatically error if both used; add `required=True` to the group when one of N alternatives MUST be chosen
- Groups improve --help readability for complex CLIs; pass `formatter_class=argparse.ArgumentDefaultsHelpFormatter` to show defaults inline
- For "if A then B" rules (which mutex groups can't express), do a `validate(parser, args)` pass after parse_args and call `parser.error(msg)` so the error message matches argparse's style and exits with code 2.

## Common Mistake

> [!warning] Stuffing every constraint into nested argparse calls — mutex groups are not nestable, and `required=True` on a parent group implies nothing about children. When the rule isn't "exactly one of N flags", write it in a `validate(args)` function and call `parser.error()` to keep the UX consistent with argparse's diagnostics.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
input_args = [a for a in sys.argv if a.startswith('--file') or a.startswith('--text')]
if len(input_args) == 0:
    print("Need --file or --text")
    sys.exit(1)
```

**Senior:**
```python
import argparse
parser = argparse.ArgumentParser()
ig = parser.add_argument_group('inputs')
ig.add_argument('--file')
ig.add_argument('--text')
mg = parser.add_mutually_exclusive_group()
mg.add_argument('--verbose', action='store_true')
mg.add_argument('--quiet', action='store_true')
args = parser.parse_args()
```

## See Also

- [[Sections/cli/argparse/_Index|CLI Tools → argparse]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]

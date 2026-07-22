---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "sys-module"
title: "sys module"
category: "I/O"
subtitle: "sys.argv, sys.exit, sys.path, sys.stdin/stdout/stderr"
signature_short: "import sys | sys.argv | sys.exit(code)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sys module"
  - "sys-module"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# sys module

> sys.argv, sys.exit, sys.path, sys.stdin/stdout/stderr

## Overview

The sys module provides access to Python interpreter internals — command-line arguments, the module search path, stdin/stdout/stderr streams, and the ability to exit the program. Essential for CLI scripts.

## Signature

```python
import sys | sys.argv | sys.exit(code)
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
import sys

# GOAL: read command-line arguments passed to the script
# Running:  python script.py hello world
sys.argv        # → ['script.py', 'hello', 'world']
sys.argv[0]     # → 'script.py'  (script name — not an arg)
sys.argv[1:]    # → ['hello', 'world']  (the actual arguments)
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
import sys

# GOAL: exit the program and check the Python version
sys.exit(0)         # clean exit — 0 means success
sys.exit(1)         # exit with an error code

# WHY: non-zero exit codes signal failure to the shell or CI system
if len(sys.argv) < 2:
    print("Usage: script.py <filename>", file=sys.stderr)
    sys.exit(1)

# WHY: version_info lets you guard against running on the wrong Python version
if sys.version_info < (3, 10):
    sys.exit("Requires Python 3.10+")
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
import sys

# GOAL: read from stdin and write errors to stderr without mixing with stdout
# WHY: piped data comes through sys.stdin — useful for Unix-style pipelines
for line in sys.stdin:
    print(line.strip().upper())   # reads lines from pipe

# WHY: sys.stderr keeps error messages out of stdout — important when stdout is piped
print("Missing file", file=sys.stderr)

# NOTE: never call sys.exit() inside a library — it kills the whole process
# Raise an exception instead and let the calling script decide whether to exit
#
# Decision rule:
#   trivial argv access in 5-line script      -> sys.argv[1:]
#   real CLI with flags, help, types          -> argparse / click / typer
#   end script after fatal error               -> sys.exit(1) (top-level scripts only)
#   stop a library function                   -> raise Exception (NEVER sys.exit)
#   read piped data                           -> sys.stdin
#   write progress / errors                   -> sys.stderr (keep stdout machine-readable)
#   guard for python version                  -> sys.version_info >= (3, 11)
#   tweak import path at runtime              -> sys.path.insert(0, ...) (last resort; prefer pkg install)
#
# Anti-pattern: calling sys.exit() inside library code.
#   sys.exit() raises SystemExit which terminates the whole interpreter unless something
#   catches it. Library callers expect exceptions or return codes — killing their process is
#   surprising. Raise a custom exception (or ValueError); let __main__ scripts decide whether
#   to translate it into an exit code.
```

## Decision Rule

```text
trivial argv access in 5-line script      -> sys.argv[1:]
real CLI with flags, help, types          -> argparse / click / typer
end script after fatal error               -> sys.exit(1) (top-level scripts only)
stop a library function                   -> raise Exception (NEVER sys.exit)
read piped data                           -> sys.stdin
write progress / errors                   -> sys.stderr (keep stdout machine-readable)
guard for python version                  -> sys.version_info >= (3, 11)
tweak import path at runtime              -> sys.path.insert(0, ...) (last resort; prefer pkg install)
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling sys.exit() inside library code.
>   sys.exit() raises SystemExit which terminates the whole interpreter unless something
>   catches it. Library callers expect exceptions or return codes — killing their process is
>   surprising. Raise a custom exception (or ValueError); let __main__ scripts decide whether
>   to translate it into an exit code.

## Tips

- `sys.argv[0]` is always the script name — your arguments start at `sys.argv[1]`
- `sys.exit(0)` is clean exit; any non-zero code signals an error to the calling process
- `print("error msg", file=sys.stderr)` writes to stderr — does not pollute stdout output
- For proper CLI argument parsing, use `argparse` — `sys.argv` is only for simple scripts

## Common Mistake

> [!warning] Using `sys.exit()` inside a library function. It terminates the entire Python process — not just your function. Raise an exception instead and let the caller decide.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

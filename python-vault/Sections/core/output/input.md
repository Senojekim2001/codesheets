---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "input"
title: "input()"
category: "I/O"
subtitle: "Prompt user for input — must cast the result"
signature_short: "input(prompt=\"\") -> str"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "input()"
  - "input"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# input()

> Prompt user for input — must cast the result

## Overview

input() displays an optional prompt and waits for the user to type a line and press Enter. It always returns a string — you must cast to int, float, etc. if you need a number.

## Signature

```python
input(prompt="") -> str
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
# GOAL: read text from the user
name = input("Enter your name: ")  # → always a str
print(f"Hello, {name}!")
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
# GOAL: cast the result and read multiple values on one line
# WHY: input() always returns str — forgetting to cast is the #1 beginner bug
age = int(input("Enter your age: "))
x   = float(input("Enter x: "))

# WHY: split() splits on whitespace — lets the user type two values at once
a, b = input("Enter two numbers: ").split()
a, b = int(a), int(b)
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
# GOAL: validate input with a retry loop
# WHY: wrapping in while True + try/except keeps prompting until valid input is given
while True:
    raw = input("Enter a positive number: ")
    try:
        n = float(raw)
        if n > 0:
            break
        print("Must be positive")
    except ValueError:
        print("Not a number, try again")

# NOTE: in scripts that read piped data, use sys.stdin instead of input()
#
# Decision rule:
#   single line from interactive user         -> input(prompt)
#   masked password                           -> getpass.getpass()
#   piped stdin / batch script                -> sys.stdin.read() or for line in sys.stdin
#   line-by-line streaming input              -> for line in sys.stdin: line.rstrip("\n")
#   structured CLI args / flags               -> argparse / click / typer
#   rich TUI (menus, autocomplete)            -> prompt_toolkit or questionary
#   reading a file path                       -> open(path) — never input() for filenames in scripts
#
# Anti-pattern: trusting input() to give you the right type without casting or validation.
#   input() always returns a str. Beginners write `age + 1` and get TypeError, or skip the
#   try/except and crash on bad input. Cast inside try/except in a retry loop — and for
#   non-interactive scripts, accept stdin or argv instead so tests and pipelines work.
```

## Decision Rule

```text
single line from interactive user         -> input(prompt)
masked password                           -> getpass.getpass()
piped stdin / batch script                -> sys.stdin.read() or for line in sys.stdin
line-by-line streaming input              -> for line in sys.stdin: line.rstrip("\n")
structured CLI args / flags               -> argparse / click / typer
rich TUI (menus, autocomplete)            -> prompt_toolkit or questionary
reading a file path                       -> open(path) — never input() for filenames in scripts
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting input() to give you the right type without casting or validation.
>   input() always returns a str. Beginners write `age + 1` and get TypeError, or skip the
>   try/except and crash on bad input. Cast inside try/except in a retry loop — and for
>   non-interactive scripts, accept stdin or argv instead so tests and pipelines work.

## Tips

- `input()` always returns `str` — forgetting to cast is the #1 beginner bug
- `a, b = input().split()` reads two space-separated tokens in one line
- Wrap `input()` in a loop with try/except for robust user input validation
- In scripts, `sys.stdin` lets you pipe input instead of typing interactively

## Common Mistake

> [!warning] `age = input("Age: ") + 5` raises TypeError because input() returns a string. Always cast: `age = int(input("Age: "))`.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/hasattr|hasattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

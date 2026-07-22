---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "match-case"
title: "match statement"
category: "Control Flow"
subtitle: "Match shapes, values, types, and structures"
signature_short: "match subject: case pattern: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "match statement"
  - "match-case"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# match statement

> Match shapes, values, types, and structures

## Overview

match/case (Python 3.10+) is structural pattern matching — far more powerful than a C-style switch. It can match values, sequences, dicts, class instances, and wildcard patterns. The match expression is evaluated once; the first matching case runs.

## Signature

```python
match subject: case pattern: ...
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
# GOAL: branch on a value using match — cleaner than many if/elif chains
command = "help"

match command:
    case "quit" | "exit":
        print("Goodbye")
    case "help":
        print("Showing help...")
    case _:               # _ is the wildcard — always matches
        print(f"Unknown: {command}")
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
# GOAL: match on the shape of a tuple (sequence pattern)
point = (3, 0)

# WHY: patterns can bind variables — x and y are available in the case body
match point:
    case (0, 0):
        print("origin")
    case (x, 0):
        print(f"on x-axis at {x}")   # → on x-axis at 3
    case (0, y):
        print(f"on y-axis at {y}")
    case (x, y):
        print(f"at ({x}, {y})")
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
# GOAL: match on dict shape and add guard clauses for extra conditions
event = {"action": "buy", "ticker": "AAPL", "qty": 10}

# WHY: dict patterns only require the named keys — extra keys in the dict are ignored
match event:
    case {"action": "buy", "ticker": ticker, "qty": qty} if qty > 0:
        print(f"Buying {qty} of {ticker}")    # → Buying 10 of AAPL
    case {"action": "sell", "ticker": ticker}:
        print(f"Selling {ticker}")
    case _:
        print("Unknown event")

# NOTE: match shines for structured data (dicts, tuples, dataclasses)
# For simple equality checks, if/elif is still more readable
#
# Decision rule:
#   structural decomposition (tuple/dict shape) -> match / case
#   parsing AST / network messages / events    -> match / case (designed for this)
#   class-based dispatch with attribute capture -> match Class(attr=val) syntax
#   simple value lookup / dispatch             -> dict {value: handler} (faster, simpler)
#   2-3 equality branches                      -> if / elif (less ceremony)
#   want exhaustive enum match w/ checker      -> match on Enum (mypy can warn missing cases)
#   need fall-through (C switch behaviour)     -> NOT match — Python has no fall-through
#   pre-3.10 codebase                          -> stuck with if / elif
#
# Anti-pattern: porting if/elif equality chains to match without a structural reason.
#   match on a single int value with 5 cases is just a wordy if/elif. The win arrives when you
#   bind variables (`case Point(x=0, y=y):`) or destructure JSON-like payloads. If every case
#   is `case <const>:`, a dict {const: handler} or if/elif is shorter and equally readable.
```

## Decision Rule

```text
structural decomposition (tuple/dict shape) -> match / case
parsing AST / network messages / events    -> match / case (designed for this)
class-based dispatch with attribute capture -> match Class(attr=val) syntax
simple value lookup / dispatch             -> dict {value: handler} (faster, simpler)
2-3 equality branches                      -> if / elif (less ceremony)
want exhaustive enum match w/ checker      -> match on Enum (mypy can warn missing cases)
need fall-through (C switch behaviour)     -> NOT match — Python has no fall-through
pre-3.10 codebase                          -> stuck with if / elif
```

## Anti-Pattern

> [!warning] Anti-pattern
> porting if/elif equality chains to match without a structural reason.
>   match on a single int value with 5 cases is just a wordy if/elif. The win arrives when you
>   bind variables (`case Point(x=0, y=y):`) or destructure JSON-like payloads. If every case
>   is `case <const>:`, a dict {const: handler} or if/elif is shorter and equally readable.

## Tips

- Match evaluates the subject once — unlike if/elif which re-evaluates the subject each time
- Patterns can bind variables: `case (x, y):` binds `x` and `y` for use in the case body
- Guard clauses `case pattern if condition:` add extra constraints after structural matching
- `case _:` is the wildcard (always matches) — equivalent to `else` in if/elif

## Common Mistake

> [!warning] Using `match` as a drop-in for simple `if/elif` equality checks. Match shines for structured data (dicts, sequences, dataclasses). For simple value checks, `if/elif` is more readable.

## See Also

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

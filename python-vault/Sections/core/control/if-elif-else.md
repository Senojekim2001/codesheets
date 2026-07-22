---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "if-elif-else"
title: "if statement"
category: "Control Flow"
subtitle: "Evaluate conditions in order, execute the first matching branch"
signature_short: "if condition: ... elif condition: ... else: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "if statement"
  - "if-elif-else"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# if statement

> Evaluate conditions in order, execute the first matching branch

## Overview

Python conditionals are straightforward. elif chains are evaluated top to bottom — only the first matching branch runs. Truthiness: empty sequences/dicts/strings/0/None are falsy; everything else is truthy.

## Signature

```python
if condition: ... elif condition: ... else: ...
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
# GOAL: branch on a condition
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "F"
# → grade = "B"
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
# GOAL: use Python truthiness and identity checks correctly
lst = [1, 2, 3]

# WHY: empty collections are falsy — no need for len() check
if lst:
    print("has items")

# WHY: None is a singleton — always use 'is', never '== None'
value = None
if value is None:
    print("not set")

# WHY: chained comparisons are more readable than two separate conditions
score = 85
if 0 < score <= 100:
    print("valid score")
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
# GOAL: use short-circuit evaluation as a concise fallback
user_input = ""
name = user_input or "Anonymous"   # → "Anonymous"  (user_input is falsy)

# WHY: 'and' / 'or' return operand values, not just True/False
config = loaded_config or default_config

# NOTE: 'val or default' triggers the default for ANY falsy value — 0, "", []
# Use a real ternary when 0 or "" is a valid value you want to keep:
count = 0
display = count if count is not None else "N/A"  # → 0, not "N/A"
#
# Decision rule:
#   2 branches, simple values                  -> ternary x if cond else y
#   3+ branches, simple value table            -> dict lookup table.get(key, default)
#   3+ branches with logic per branch          -> if / elif / else
#   pattern match on shape (3.10+)             -> match / case
#   short-circuit "x or default"               -> only when 0/""/[] should also default
#   None-safe default                          -> x if x is not None else default
#   range check                                -> chained comparison: low <= x <= high
#   complex predicate reused 5+ places         -> def is_valid(x): ... (function, not nested ifs)
#
# Anti-pattern: `if x == None:` and `if x == True:`.
#   None / True / False are singletons; use identity (`is None`, `is True`, `is False`). The
#   == versions can be hijacked by overloaded __eq__ on custom or pandas types and are slower.
#   Linters (ruff E711, E712) flag this for a reason — keep your falsy / None / bool checks
#   identity-based.
```

## Decision Rule

```text
2 branches, simple values                  -> ternary x if cond else y
3+ branches, simple value table            -> dict lookup table.get(key, default)
3+ branches with logic per branch          -> if / elif / else
pattern match on shape (3.10+)             -> match / case
short-circuit "x or default"               -> only when 0/""/[] should also default
None-safe default                          -> x if x is not None else default
range check                                -> chained comparison: low <= x <= high
complex predicate reused 5+ places         -> def is_valid(x): ... (function, not nested ifs)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `if x == None:` and `if x == True:`.
>   None / True / False are singletons; use identity (`is None`, `is True`, `is False`). The
>   == versions can be hijacked by overloaded __eq__ on custom or pandas types and are slower.
>   Linters (ruff E711, E712) flag this for a reason — keep your falsy / None / bool checks
>   identity-based.

## Tips

- Python supports chained comparisons: `0 < x < 100` — cleaner than `x > 0 and x < 100`
- Test for emptiness with `if lst:` not `if len(lst) > 0:` — more Pythonic and works for all sequences
- Always use `is` to compare to `None`, `True`, `False` — never `== None`
- `and`/`or` short-circuit and return one of their operands: `x = val or default` sets a fallback

## Common Mistake

> [!warning] Using `== None` instead of `is None`. `None` is a singleton — identity check `is None` is correct and slightly faster.

## See Also

- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/while-loop|while loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

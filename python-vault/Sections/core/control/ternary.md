---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "ternary"
title: "Ternary expression"
category: "Control Flow"
subtitle: "Single-line conditional value selection"
signature_short: "value_if_true if condition else value_if_false"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Ternary expression"
  - "ternary"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# Ternary expression

> Single-line conditional value selection

## Overview

The ternary expression evaluates to one of two values based on a condition. It is an expression (returns a value), not a statement — so it can appear inside other expressions, assignments, list comprehensions, and function calls.

## Signature

```python
value_if_true if condition else value_if_false
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
# GOAL: pick one of two values based on a condition
score = 75
label = "pass" if score >= 60 else "fail"
# → "pass"
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
# GOAL: use the ternary inside expressions and list comprehensions
n = -5

# WHY: ternary is an expression — it can live inside f-strings, comprehensions, calls
print(f"{'even' if n % 2 == 0 else 'odd'}")  # → odd

# WHY: useful inside a comprehension to transform conditionally
nums   = [-3, 1, -2, 4]
result = [x if x >= 0 else 0 for x in nums]  # → [0, 1, 0, 4]
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
# GOAL: know when NOT to use a ternary
points = 750

# WHY: one level of nesting is readable — more than one gets confusing fast
tier = "gold" if points > 1000 else "silver" if points > 500 else "bronze"
# → "silver"  (works, but pushing the limit)

# NOTE: when branches have side effects or are complex, use a full if/else block
# ternary is for selecting VALUES — not for controlling flow
if points > 1000:
    send_reward_email()
    tier = "gold"
else:
    tier = "bronze"
#
# Decision rule:
#   simple value selection                     -> x if cond else y
#   inside f-string / comprehension            -> ternary (the only option)
#   need to call functions with side effects   -> if / else statement (not ternary)
#   2+ levels of nesting tempting              -> dict lookup or refactor to function
#   default for None                           -> x if x is not None else default
#   default for "any falsy"                    -> x or default
#   3-way decision                             -> if / elif / else, NOT chained ternary
#   value depends on type/shape                -> match / case (3.10+)
#
# Anti-pattern: chaining ternaries to emulate elif.
#   `a if c1 else b if c2 else c if c3 else d` is right-associative and reads like a riddle in
#   review. Use an if/elif/else statement (or a dict lookup if all branches are pure values),
#   not a 4-deep ternary tower. The ternary is for two-way value selection — beyond that,
#   readability beats brevity.
```

## Decision Rule

```text
simple value selection                     -> x if cond else y
inside f-string / comprehension            -> ternary (the only option)
need to call functions with side effects   -> if / else statement (not ternary)
2+ levels of nesting tempting              -> dict lookup or refactor to function
default for None                           -> x if x is not None else default
default for "any falsy"                    -> x or default
3-way decision                             -> if / elif / else, NOT chained ternary
value depends on type/shape                -> match / case (3.10+)
```

## Anti-Pattern

> [!warning] Anti-pattern
> chaining ternaries to emulate elif.
>   `a if c1 else b if c2 else c if c3 else d` is right-associative and reads like a riddle in
>   review. Use an if/elif/else statement (or a dict lookup if all branches are pure values),
>   not a 4-deep ternary tower. The ternary is for two-way value selection — beyond that,
>   readability beats brevity.

## Tips

- The ternary is an *expression* — it has a value and can be used anywhere an expression is allowed
- Keep ternaries to one level — nested ternaries become unreadable fast
- `x = val or default` is a common pattern but falsy values (0, "") will trigger the default — use a real ternary when 0 or "" is valid
- Use an if/else block when either branch has side effects

## Common Mistake

> [!warning] Deep nesting: `a if c1 else b if c2 else c if c3 else d`. This is hard to read. Use a dict, a function, or an if/elif chain instead.

## See Also

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/while-loop|while loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

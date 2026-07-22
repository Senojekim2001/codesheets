---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "any-all"
title: "any() / all()"
category: "Builtins"
subtitle: "Short-circuiting boolean reduction over iterables"
signature_short: "any(iterable) -> bool | all(iterable) -> bool"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "any() / all()"
  - "any-all"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# any() / all()

> Short-circuiting boolean reduction over iterables

## Overview

any() returns True if at least one element is truthy; all() returns True if every element is truthy. Both short-circuit — they stop as soon as the result is determined. Use with generator expressions to avoid building intermediate lists.

## Signature

```python
any(iterable) -> bool | all(iterable) -> bool
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
# GOAL: test whether any or all values in a list pass a condition
nums = [1, -2, 3, -4, 5]

any(x > 0 for x in nums)   # → True   (1 passes — stops immediately)
all(x > 0 for x in nums)   # → False  (-2 fails — stops immediately)
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
# GOAL: validate a form — all fields must be filled
name, email, phone = "Alice", "alice@example.com", ""

# WHY: all() short-circuits — stops at the first empty field
all_filled = all(len(f) > 0 for f in [name, email, phone])
# → False  (phone is empty)

# WHY: any() as a readable "does this exist" check
users = [{"role": "editor"}, {"role": "admin"}]
has_admin = any(u["role"] == "admin" for u in users)
# → True
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
# GOAL: use generator expressions — NOT list comprehensions — to keep short-circuit benefit
nums = [1, -2, 3, -4, 5]

# WHY: a list comprehension builds the whole list first, then checks — no short-circuit
any([x > 0 for x in nums])  # evaluates all 5 items even though 1 passes immediately

# WHY: a generator expression only evaluates until the answer is known
any(x > 0 for x in nums)    # stops after the first truthy value

# NOTE: all([]) is True (vacuous truth) and any([]) is False — guard with .length if needed
#
# Decision rule:
#   "at least one passes"                     -> any(cond(x) for x in it)
#   "every one passes"                        -> all(cond(x) for x in it)
#   need the matching item, not just bool     -> next((x for x in it if cond), default)
#   short-circuit on huge iterable            -> any/all with GENERATOR (not list comp!)
#   combine multiple conditions on one item   -> all([c1, c2, c3]) on already-eval'd values
#   bool-array reduction in NumPy             -> arr.any() / arr.all() (vectorized)
#   "no item passes"                          -> not any(cond(x) for x in it)
#
# Anti-pattern: passing a list comprehension to any/all instead of a generator.
#   `any([is_valid(x) for x in items])` evaluates is_valid for every item and builds a list,
#   killing the short-circuit benefit. Drop the brackets: `any(is_valid(x) for x in items)`
#   stops at the first True. The same applies to all(), max(), min(), and sorted-key callbacks
#   when the iterable is large or expensive to compute.
```

## Decision Rule

```text
"at least one passes"                     -> any(cond(x) for x in it)
"every one passes"                        -> all(cond(x) for x in it)
need the matching item, not just bool     -> next((x for x in it if cond), default)
short-circuit on huge iterable            -> any/all with GENERATOR (not list comp!)
combine multiple conditions on one item   -> all([c1, c2, c3]) on already-eval'd values
bool-array reduction in NumPy             -> arr.any() / arr.all() (vectorized)
"no item passes"                          -> not any(cond(x) for x in it)
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing a list comprehension to any/all instead of a generator.
>   `any([is_valid(x) for x in items])` evaluates is_valid for every item and builds a list,
>   killing the short-circuit benefit. Drop the brackets: `any(is_valid(x) for x in items)`
>   stops at the first True. The same applies to all(), max(), min(), and sorted-key callbacks
>   when the iterable is large or expensive to compute.

## Tips

- Both `any()` and `all()` short-circuit — use generator expressions, not list comprehensions, to get that benefit
- `all([])` is `True` (vacuous truth) and `any([])` is `False` — important edge cases
- Combine with `map()`: `all(map(str.isdigit, chars))` — but generators are more readable
- For "find first match", use `next((x for x in it if cond), default)` instead of `any()`

## Common Mistake

> [!warning] Writing `any([x > 0 for x in nums])` with a list comprehension. This builds the full list before checking. Use `any(x > 0 for x in nums)` with a generator — it stops at the first True.

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/enumerate|enumerate() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

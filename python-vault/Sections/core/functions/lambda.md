---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "lambda"
title: "lambda"
category: "Functions"
subtitle: "Single-expression anonymous function for sort keys and callbacks"
signature_short: "lambda args: expression"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "lambda"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# lambda

> Single-expression anonymous function for sort keys and callbacks

## Overview

lambda creates an anonymous function limited to a single expression. It is most useful as a sort key, callback, or argument to higher-order functions. For anything more complex — multiple statements, conditionals, loops — use def instead.

## Signature

```python
lambda args: expression
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
# GOAL: write a small throwaway function in one line
double = lambda x: x * 2
double(5)   # → 10

# Most common use — sort key
people = [("Alice", 30), ("Bob", 25), ("Carol", 35)]
sorted(people, key=lambda p: p[1])  # → sort by age
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
# GOAL: sort by multiple fields using a tuple key
people = [("Alice", 30), ("Bob", 25), ("Carol", 30)]

# WHY: tuple key sorts by first element, then uses second as tiebreaker
sorted(people, key=lambda p: (p[1], p[0]))
# → [('Bob', 25), ('Alice', 30), ('Carol', 30)]  — age then name
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
# GOAL: watch out for the loop-closure bug with lambda
# WHY: lambda captures 'i' by reference — all lambdas see i's final value (2)
fns = [lambda: i for i in range(3)]
fns[0]()   # → 2  (not 0!)

# WHY: default arg is evaluated at definition time — captures current value of i
fns = [lambda i=i: i for i in range(3)]
fns[0]()   # → 0  correct

# NOTE: if a lambda needs a name, use def instead — it's more readable and debuggable
#
# Decision rule:
#   sort key / max key / min key               -> lambda x: x.attr (or itemgetter / attrgetter)
#   one-shot callback to map / filter          -> lambda (or skip map and use list comp)
#   GUI button / event handler one-liner       -> lambda
#   pandas .apply on a single column           -> lambda row: row.x + row.y (vectorize if possible)
#   needs a docstring / multiple statements    -> def named function
#   you're tempted to assign `f = lambda ...`  -> use def f(...) instead
#   simple attribute / index getter            -> operator.attrgetter / itemgetter (faster)
#
# Anti-pattern: building a closure with lambda inside a loop and being surprised by late binding.
#   `fns = [lambda: i for i in range(3)]; fns[0]()` returns 2, not 0 — every lambda captures the
#   same variable, not its value at the time of creation. Bind the value with a default:
#   `lambda i=i: i` (default args are evaluated at def-time). Or use functools.partial. The
#   bug looks like a closure problem; it's actually how Python scoping works.
```

## Decision Rule

```text
sort key / max key / min key               -> lambda x: x.attr (or itemgetter / attrgetter)
one-shot callback to map / filter          -> lambda (or skip map and use list comp)
GUI button / event handler one-liner       -> lambda
pandas .apply on a single column           -> lambda row: row.x + row.y (vectorize if possible)
needs a docstring / multiple statements    -> def named function
you're tempted to assign `f = lambda ...`  -> use def f(...) instead
simple attribute / index getter            -> operator.attrgetter / itemgetter (faster)
```

## Anti-Pattern

> [!warning] Anti-pattern
> building a closure with lambda inside a loop and being surprised by late binding.
>   `fns = [lambda: i for i in range(3)]; fns[0]()` returns 2, not 0 — every lambda captures the
>   same variable, not its value at the time of creation. Bind the value with a default:
>   `lambda i=i: i` (default args are evaluated at def-time). Or use functools.partial. The
>   bug looks like a closure problem; it's actually how Python scoping works.

## Tips

- If a lambda needs a name, a conditional, or more than one expression — use `def`
- `operator.itemgetter(0)` and `operator.attrgetter("name")` are faster than equivalent lambdas for simple access
- The loop-closure bug is classic: `lambda: i` captures `i` by reference, not by value at creation
- Fix with default arg: `lambda i=i: i` — default args are evaluated at definition time

## Common Mistake

> [!warning] Assigning a lambda to a name: `square = lambda x: x**2`. If you're naming it, use `def square(x): return x**2` — it's more readable, debuggable, and gets proper docstring support.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/decorators|Decorators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

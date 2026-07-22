---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "closures"
title: "Closures"
category: "Functions"
subtitle: "Closures capture by reference — nonlocal assigns to enclosing scope"
signature_short: "def outer(): x=1; def inner(): nonlocal x; x+=1"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Closures"
  - "closures"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# Closures

> Closures capture by reference — nonlocal assigns to enclosing scope

## Overview

A closure is a function that remembers variables from its enclosing scope even after the outer function has returned. The nonlocal keyword allows the inner function to reassign (not just read) an enclosing variable. global does the same for module-level variables.

## Signature

```python
def outer(): x=1; def inner(): nonlocal x; x+=1
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
# GOAL: return a function that remembers a value from its creation context
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # 'factor' is captured from the outer scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
double(5)   # → 10
triple(5)   # → 15
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
# GOAL: build a stateful counter using nonlocal
def counter(start=0):
    count = start

    def increment(by=1):
        nonlocal count   # WHY: without this, 'count += by' creates a new local and raises UnboundLocalError
        count += by
        return count

    return increment

c = counter()
c()    # → 1
c()    # → 2
c(5)   # → 7
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
# GOAL: avoid the loop-closure bug — closures capture by reference, not value
fns = [lambda: i for i in range(3)]
fns[0]()   # → 2  (all three lambdas see i = 2 — the final value)

# WHY: default arguments are evaluated at definition time, capturing the current value
fns = [lambda i=i: i for i in range(3)]
fns[0]()   # → 0  correct

# NOTE: prefer nonlocal over global — global state is hard to test and reason about
# If you reach for global often, consider using a class to encapsulate the state
#
# Decision rule:
#   factory function returning specialized fn  -> closure (def make_X(cfg): def f(...))
#   stateful counter / accumulator             -> closure with nonlocal (or class)
#   memoization                                -> @functools.lru_cache (cleaner than manual closure)
#   callback that needs config                 -> closure (or functools.partial)
#   multiple methods + state                   -> class (NOT a closure)
#   capturing loop variable into lambda         -> closure with default arg `lambda x=x: x`
#   need to reassign captured var               -> nonlocal x
#   capturing module-level var to mutate       -> global x (rare; usually refactor)
#
# Anti-pattern: forgetting the nonlocal declaration when assigning to an enclosing variable.
#   `def inner(): count += 1` — Python sees the assignment and creates a fresh local `count`
#   that is uninitialized, raising UnboundLocalError on the read part of +=. Add
#   `nonlocal count` (or refactor to a class). Reading-only doesn't need nonlocal — only
#   rebinding does.
```

## Decision Rule

```text
factory function returning specialized fn  -> closure (def make_X(cfg): def f(...))
stateful counter / accumulator             -> closure with nonlocal (or class)
memoization                                -> @functools.lru_cache (cleaner than manual closure)
callback that needs config                 -> closure (or functools.partial)
multiple methods + state                   -> class (NOT a closure)
capturing loop variable into lambda         -> closure with default arg `lambda x=x: x`
need to reassign captured var               -> nonlocal x
capturing module-level var to mutate       -> global x (rare; usually refactor)
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting the nonlocal declaration when assigning to an enclosing variable.
>   `def inner(): count += 1` — Python sees the assignment and creates a fresh local `count`
>   that is uninitialized, raising UnboundLocalError on the read part of +=. Add
>   `nonlocal count` (or refactor to a class). Reading-only doesn't need nonlocal — only
>   rebinding does.

## Tips

- Closures capture variables by *reference* — the variable itself, not its current value
- `nonlocal` is needed to *assign* to an enclosing variable; reading it works without `nonlocal`
- The loop-closure bug is one of the most common Python pitfalls — fix with `lambda i=i: i`
- Prefer `nonlocal` over `global` — global state is hard to test and reason about

## Common Mistake

> [!warning] Writing `def inner(): count += 1` without `nonlocal count`. Python sees the assignment and treats `count` as a local variable — reading it before assignment raises `UnboundLocalError`.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

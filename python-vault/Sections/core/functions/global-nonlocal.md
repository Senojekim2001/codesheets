---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "global-nonlocal"
title: "global / nonlocal"
category: "Functions"
subtitle: "nonlocal for enclosing function scope, global for module scope"
signature_short: "global x | nonlocal x"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "global / nonlocal"
  - "global-nonlocal"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# global / nonlocal

> nonlocal for enclosing function scope, global for module scope

## Overview

Without global or nonlocal, any assignment inside a function creates a new local variable. global declares that the name refers to the module-level variable. nonlocal declares it refers to the nearest enclosing function scope (not global).

## Signature

```python
global x | nonlocal x
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
# GOAL: understand that assignment creates a local variable by default
count = 0

def increment():
    count = 1      # creates a NEW local variable — does NOT touch outer count

increment()
print(count)       # → 0  (unchanged)
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
# GOAL: use global to modify a module-level variable
count = 0

def increment():
    global count   # WHY: without this, 'count += 1' raises UnboundLocalError
    count += 1

increment()
increment()
print(count)   # → 2

# NOTE: reading an outer variable works without global — only assignment needs it
x = 10
def read_x():
    print(x)   # fine — no assignment, no global needed
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
# GOAL: use nonlocal for enclosing scope (not module level)
def make_counter():
    n = 0
    def increment():
        nonlocal n   # WHY: refers to 'n' in make_counter's scope, not the module
        n += 1
        return n
    return increment

c = make_counter()
c()   # → 1
c()   # → 2

# NOTE: prefer nonlocal over global — global state is shared across the entire module
# If you use global heavily, refactor to a class — it's easier to test and reason about
#
# Decision rule:
#   reassign module-level variable             -> global (rare; consider a class first)
#   reassign enclosing function's variable     -> nonlocal
#   only READING outer variable                -> no declaration needed
#   storing config / singleton at module level -> module-level constant + accessor function
#   shared mutable state                       -> class instance (NOT global)
#   caching across calls                       -> functools.lru_cache (NOT a global dict)
#   recursive function w/ accumulator           -> pass param down (NOT global / nonlocal)
#   need to expose for tests to reset           -> module attr accessed via module.X = ...
#
# Anti-pattern: using global as the default solution for "I need to share state".
#   Global mutable state defeats testability (tests share state and order matters), prevents
#   parallelism, and hides data flow. Refactor to: pass the value as a parameter, return new
#   state from functions, or wrap state in a class with explicit methods. Reach for `global`
#   only for true module-level constants, lazy initialization, or when working inside a
#   tightly-scoped script.
```

## Decision Rule

```text
reassign module-level variable             -> global (rare; consider a class first)
reassign enclosing function's variable     -> nonlocal
only READING outer variable                -> no declaration needed
storing config / singleton at module level -> module-level constant + accessor function
shared mutable state                       -> class instance (NOT global)
caching across calls                       -> functools.lru_cache (NOT a global dict)
recursive function w/ accumulator           -> pass param down (NOT global / nonlocal)
need to expose for tests to reset           -> module attr accessed via module.X = ...
```

## Anti-Pattern

> [!warning] Anti-pattern
> using global as the default solution for "I need to share state".
>   Global mutable state defeats testability (tests share state and order matters), prevents
>   parallelism, and hides data flow. Refactor to: pass the value as a parameter, return new
>   state from functions, or wrap state in a class with explicit methods. Reach for `global`
>   only for true module-level constants, lazy initialization, or when working inside a
>   tightly-scoped script.

## Tips

- You can READ an outer variable without global/nonlocal — only WRITING to it requires the declaration
- Prefer nonlocal over global — global state is hard to test and reason about
- If you find yourself using global frequently, consider a class to encapsulate state instead
- global/nonlocal must appear before the first use of the variable name in that function

## Common Mistake

> [!warning] Writing `x += 1` inside a function without `global x` and expecting it to modify the outer variable. Python sees the assignment and creates a local variable — then the `+= 1` fails with UnboundLocalError because the local has no value yet.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

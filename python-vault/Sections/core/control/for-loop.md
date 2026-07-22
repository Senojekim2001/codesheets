---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "for-loop"
title: "for loop"
category: "Control Flow"
subtitle: "Python for is for-each — always iterates over items"
signature_short: "for item in iterable: ... else: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "for loop"
  - "for-loop"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# for loop

> Python for is for-each — always iterates over items

## Overview

Python's for loop iterates over any iterable object. It has no index by default — use enumerate() for that. The optional else clause runs only when the loop completes without hitting a break.

## Signature

```python
for item in iterable: ... else: ...
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
# GOAL: iterate directly over items — no index needed
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)

# Dicts iterate over keys by default
d = {"a": 1, "b": 2}
for key, val in d.items():
    print(key, val)
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
# GOAL: use break, continue, and the for/else clause
# WHY: continue skips to the next iteration without exiting the loop
for n in range(10):
    if n % 2 == 0:
        continue       # skip even numbers
    print(n)           # → 1 3 5 7 9

# WHY: for/else — the else block runs only if the loop finished without a break
for item in ["apple", "banana", "cherry"]:
    if item == "mango":
        print("found mango")
        break
else:
    print("mango not found")  # → runs because no break occurred
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
# GOAL: avoid mutating a list while iterating it — iterate a copy instead
items = [1, 2, 3, 4, 5]

# WHY: modifying 'items' mid-loop skips elements silently — hard to debug
# BAD: for item in items: if item % 2 == 0: items.remove(item)

# WHY: iterating a copy is safe — the original can be modified freely
for item in items[:]:
    if item % 2 == 0:
        items.remove(item)
# → items is now [1, 3, 5]

# NOTE: a list comprehension is cleaner for filtering: items = [x for x in items if x % 2 != 0]
#
# Decision rule:
#   iterate items of any iterable              -> for x in iterable
#   need index too                             -> for i, x in enumerate(iterable)
#   parallel iteration                         -> for a, b in zip(A, B)
#   build a list                                -> [f(x) for x in it] (comprehension)
#   build a dict                                -> {k: v for k, v in pairs}
#   accumulate / reduce                         -> sum, max, min, functools.reduce
#   loop until success / search                -> use for/else; else runs when no break
#   modify collection during loop               -> iterate over copy: lst[:] (or rebuild)
#   numerical work over large array             -> NumPy vectorized op (NOT for-loop)
#
# Anti-pattern: mutating the list you are iterating over (`lst.remove` / `del lst[i]` inside loop).
#   The iterator's internal index drifts and items get skipped silently. Either iterate over a
#   shallow copy (`for x in lst[:]`), build a new list with a comprehension
#   (`[x for x in lst if keep(x)]`), or collect indices to delete and apply after the loop.
```

## Decision Rule

```text
iterate items of any iterable              -> for x in iterable
need index too                             -> for i, x in enumerate(iterable)
parallel iteration                         -> for a, b in zip(A, B)
build a list                                -> [f(x) for x in it] (comprehension)
build a dict                                -> {k: v for k, v in pairs}
accumulate / reduce                         -> sum, max, min, functools.reduce
loop until success / search                -> use for/else; else runs when no break
modify collection during loop               -> iterate over copy: lst[:] (or rebuild)
numerical work over large array             -> NumPy vectorized op (NOT for-loop)
```

## Anti-Pattern

> [!warning] Anti-pattern
> mutating the list you are iterating over (`lst.remove` / `del lst[i]` inside loop).
>   The iterator's internal index drifts and items get skipped silently. Either iterate over a
>   shallow copy (`for x in lst[:]`), build a new list with a comprehension
>   (`[x for x in lst if keep(x)]`), or collect indices to delete and apply after the loop.

## Tips

- The `for/else` pattern is underused — `else` runs only when the loop completes without `break`
- Never use `for i in range(len(lst))` when you want items — use `for item in lst:` directly
- Modify a copy when iterating: `for item in lst[:]:` — modifying `lst` while iterating causes bugs
- `_` as the loop variable signals you don't use the value: `for _ in range(3): do_thing()`

## Common Mistake

> [!warning] Modifying a list while iterating over it. Skips items silently. Iterate over a copy (`lst[:]`) or build a new list with a comprehension.

## See Also

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/while-loop|while loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

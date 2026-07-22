---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "enumerate"
title: "enumerate()"
category: "Builtins"
subtitle: "The correct way to loop with an index"
signature_short: "enumerate(iterable, start=0) -> (index, item) pairs"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "enumerate()"
  - "enumerate"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# enumerate()

> The correct way to loop with an index

## Overview

enumerate() wraps any iterable and yields (index, item) tuples. It is the idiomatic way to loop when you need both the index and the value — always prefer it over range(len(lst)).

## Signature

```python
enumerate(iterable, start=0) -> (index, item) pairs
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
# GOAL: loop with both position and value at the same time
fruits = ["apple", "banana", "cherry"]

for i, fruit in enumerate(fruits):
    print(i, fruit)
# → 0 apple
# → 1 banana
# → 2 cherry
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
# GOAL: produce 1-based numbering for display
fruits = ["apple", "banana", "cherry"]

# WHY: start=1 offsets the index — no need for i+1 inside the loop
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")
# → 1. apple
# → 2. banana
# → 3. cherry
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
# GOAL: build a reverse-lookup dict and find an index without a loop
fruits = ["apple", "banana", "cherry"]

# WHY: dict comprehension from enumerate gives O(1) lookup by value
index_map = {val: i for i, val in enumerate(fruits)}
# → {'apple': 0, 'banana': 1, 'cherry': 2}

# WHY: next() with a generator finds the first match without scanning the whole list
idx = next((i for i, x in enumerate(fruits) if x == "banana"), -1)
# → 1  (-1 if not found)

# NOTE: always prefer enumerate over range(len(lst)) — it works on any iterable, not just lists
#
# Decision rule:
#   need index AND value of an iterable       -> enumerate(it) (NOT range(len))
#   1-based numbering for display             -> enumerate(it, start=1)
#   need value only                            -> for x in it (no enumerate)
#   need index only                            -> for i in range(len(lst)) (rare; usually enumerate)
#   pair items between two lists               -> zip(a, b) (not enumerate of indices)
#   reverse-lookup dict                       -> {v: i for i, v in enumerate(lst)}
#   first index satisfying predicate           -> next((i for i, x in enumerate(it) if pred(x)), -1)
#
# Anti-pattern: `for i in range(len(lst)): print(i, lst[i])`.
#   Verbose, slower (extra subscript per iteration), breaks on non-list iterables (sets, gens),
#   and obscures intent. `enumerate(lst)` is one token shorter, works on any iterable, and
#   communicates "I need the index" plainly. The same applies to `range(0, len(lst))` — also
#   redundant.
```

## Decision Rule

```text
need index AND value of an iterable       -> enumerate(it) (NOT range(len))
1-based numbering for display             -> enumerate(it, start=1)
need value only                            -> for x in it (no enumerate)
need index only                            -> for i in range(len(lst)) (rare; usually enumerate)
pair items between two lists               -> zip(a, b) (not enumerate of indices)
reverse-lookup dict                       -> {v: i for i, v in enumerate(lst)}
first index satisfying predicate           -> next((i for i, x in enumerate(it) if pred(x)), -1)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `for i in range(len(lst)): print(i, lst[i])`.
>   Verbose, slower (extra subscript per iteration), breaks on non-list iterables (sets, gens),
>   and obscures intent. `enumerate(lst)` is one token shorter, works on any iterable, and
>   communicates "I need the index" plainly. The same applies to `range(0, len(lst))` — also
>   redundant.

## Tips

- `enumerate(lst, start=1)` is the cleanest way to produce 1-based numbering
- Unpack directly in the for clause: `for i, val in enumerate(lst):` — cleaner than `enumerate(lst)[0]`
- Build a reverse lookup dict in one line: `{val: i for i, val in enumerate(lst)}`
- `enumerate()` works on any iterable — strings, generators, files, not just lists

## Common Mistake

> [!warning] `for i in range(len(lst)): x = lst[i]`. This is the C-style loop. Python idiom: `for i, x in enumerate(lst):`. Cleaner, faster, and works on any iterable.

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

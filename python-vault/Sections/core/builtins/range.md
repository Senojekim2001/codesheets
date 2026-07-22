---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "range"
title: "range()"
category: "Builtins"
subtitle: "Immutable sequence — O(1) memory regardless of size"
signature_short: "range(start, stop, step) -> range object"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "range()"
  - "range"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# range()

> Immutable sequence — O(1) memory regardless of size

## Overview

range() generates a lazy sequence of integers without creating a list. It supports start, stop, and step arguments. Supports O(1) indexing and membership testing. Always prefer range() over building a list with a loop.

## Signature

```python
range(start, stop, step) -> range object
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
# GOAL: generate a sequence of integers for looping
for i in range(5):        # → 0 1 2 3 4  (stop is exclusive)
    print(i)

list(range(2, 8))         # → [2, 3, 4, 5, 6, 7]
list(range(0, 10, 2))     # → [0, 2, 4, 6, 8]  (step=2)
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
# GOAL: count down and test membership efficiently
# WHY: negative step lets you iterate in reverse without reversing the list
for i in range(5, -1, -1):
    print(i)              # → 5 4 3 2 1 0

# WHY: membership test on range is O(1) — no iteration needed
50 in range(0, 100, 5)    # → True  (instantly, no loop)
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
# GOAL: understand range's lazy O(1) behaviour
r = range(10**9)           # 1 billion "elements" — uses almost no memory
len(r)                     # → 1000000000  (O(1))
r[999_999_999]             # → 999999999   (O(1) indexing)

# WHY: range is a view, not a list — safe to create enormous ranges
# NOTE: use enumerate(lst) instead of range(len(lst)) when you need both index and value
for i, val in enumerate(["a", "b", "c"]):
    print(i, val)          # cleaner than range(len(...))
#
# Decision rule:
#   "do this N times" loop                    -> for _ in range(N):
#   need integer indices 0..N-1               -> for i in range(N):
#   need index AND value of a list            -> for i, x in enumerate(lst): (NOT range(len(lst)))
#   counting down                              -> range(n, -1, -1) or reversed(range(n+1))
#   numeric ranges with floats                 -> numpy.arange / numpy.linspace (range is int-only)
#   build a list of integers                  -> list(range(n))
#   testing membership in arithmetic seq      -> x in range(...) (O(1))
#
# Anti-pattern: writing `for i in range(len(lst)): item = lst[i]`.
#   This is the C-style index loop in Python — verbose, off-by-one prone, and slower than
#   `for item in lst:`. If you need both, use `for i, item in enumerate(lst):`. The only
#   legitimate `range(len(...))` cases are when you must mutate by index or zip multiple
#   sequences by position (and even then, zip(a, b) handles most of those).
```

## Decision Rule

```text
"do this N times" loop                    -> for _ in range(N):
need integer indices 0..N-1               -> for i in range(N):
need index AND value of a list            -> for i, x in enumerate(lst): (NOT range(len(lst)))
counting down                              -> range(n, -1, -1) or reversed(range(n+1))
numeric ranges with floats                 -> numpy.arange / numpy.linspace (range is int-only)
build a list of integers                  -> list(range(n))
testing membership in arithmetic seq      -> x in range(...) (O(1))
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing `for i in range(len(lst)): item = lst[i]`.
>   This is the C-style index loop in Python — verbose, off-by-one prone, and slower than
>   `for item in lst:`. If you need both, use `for i, item in enumerate(lst):`. The only
>   legitimate `range(len(...))` cases are when you must mutate by index or zip multiple
>   sequences by position (and even then, zip(a, b) handles most of those).

## Tips

- `range()` is lazy — `range(10**9)` uses constant memory, never allocates a list
- `range` supports O(1) indexing: `range(0, 100)[50]` returns 50 instantly
- Use `enumerate(lst)` instead of `range(len(lst))` when you need both index and value
- `for _ in range(n):` uses `_` as a throwaway variable when the count is all you need

## Common Mistake

> [!warning] Using `range(len(lst))` in a for loop when you need the item: `for i in range(len(lst)): print(lst[i])`. Use `for item in lst:` or `for i, item in enumerate(lst):`.

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/enumerate|enumerate() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

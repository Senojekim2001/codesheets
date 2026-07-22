---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "map-filter-sorted"
title: "sorted()"
category: "Builtins"
subtitle: "Functional-style operations — prefer comprehensions for readability"
signature_short: "map(fn, it) | filter(fn, it) | sorted(it, key=fn, reverse=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sorted()"
  - "map-filter-sorted"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# sorted()

> Functional-style operations — prefer comprehensions for readability

## Overview

map() applies a function to every item; filter() selects items where the function returns truthy. Both return lazy iterators. sorted() always returns a new list, accepts a key= function, and is stable. List comprehensions are usually preferred over map()/filter() for readability.

## Signature

```python
map(fn, it) | filter(fn, it) | sorted(it, key=fn, reverse=True)
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
# GOAL: sort a list — sorted() returns a new list, .sort() mutates in place
nums  = [3, 1, 4, 1, 5]
words = ["banana", "apple", "cherry"]

sorted(nums)               # → [1, 1, 3, 4, 5]
sorted(nums, reverse=True) # → [5, 4, 3, 1, 1]
sorted(words)              # → ['apple', 'banana', 'cherry']
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
# GOAL: sort objects by a property using key=
users = [
    {"name": "Carol", "score": 88},
    {"name": "Alice", "score": 92},
    {"name": "Bob",   "score": 65},
]

# WHY: key= tells sorted() what to compare — the lambda extracts the field
by_score = sorted(users, key=lambda u: u["score"], reverse=True)
# → [Alice 92, Carol 88, Bob 65]

# WHY: map() applies a function to every item lazily
names_upper = list(map(str.upper, ["alice", "bob"]))
# → ['ALICE', 'BOB']
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
# GOAL: sort by multiple criteria and understand sort stability
users = [
    {"name": "Bob",   "score": 88},
    {"name": "Alice", "score": 92},
    {"name": "Carol", "score": 88},
]

# WHY: tuple key sorts by score descending, then name ascending as a tiebreaker
ranked = sorted(users, key=lambda u: (-u["score"], u["name"]))
# → [Alice 92, Bob 88, Carol 88]  (Bob before Carol alphabetically)

# NOTE: sorted() is stable — equal items keep their original order from the input
# NOTE: lst = lst.sort() assigns None — .sort() returns None, not the sorted list
#
# Decision rule:
#   transform every item                       -> [f(x) for x in it] (list comp, not map)
#   filter items by predicate                  -> [x for x in it if pred(x)]
#   transform + filter combined                -> [f(x) for x in it if pred(x)]
#   sort, return new list                      -> sorted(it, key=...)
#   sort in place (mutate)                     -> lst.sort(key=...)
#   need top-k items only                      -> heapq.nlargest(k, it, key=...) (faster than sort)
#   already-callable as key (e.g. attr/index) -> operator.itemgetter / attrgetter (faster than lambda)
#   sorting numeric arrays                     -> NumPy np.sort / np.argsort (vectorized)
#
# Anti-pattern: `lst = lst.sort()` — assigning the result of in-place sort.
#   list.sort() returns None to signal mutation; you've just clobbered your list with None.
#   Pick one model: in-place `lst.sort()` (no assignment) OR functional `new = sorted(lst)`.
#   The same trap exists for list.reverse() / list.append() / dict.update() — all return None
#   on purpose.
```

## Decision Rule

```text
transform every item                       -> [f(x) for x in it] (list comp, not map)
filter items by predicate                  -> [x for x in it if pred(x)]
transform + filter combined                -> [f(x) for x in it if pred(x)]
sort, return new list                      -> sorted(it, key=...)
sort in place (mutate)                     -> lst.sort(key=...)
need top-k items only                      -> heapq.nlargest(k, it, key=...) (faster than sort)
already-callable as key (e.g. attr/index) -> operator.itemgetter / attrgetter (faster than lambda)
sorting numeric arrays                     -> NumPy np.sort / np.argsort (vectorized)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `lst = lst.sort()` — assigning the result of in-place sort.
>   list.sort() returns None to signal mutation; you've just clobbered your list with None.
>   Pick one model: in-place `lst.sort()` (no assignment) OR functional `new = sorted(lst)`.
>   The same trap exists for list.reverse() / list.append() / dict.update() — all return None
>   on purpose.

## Tips

- `sorted()` returns a new list; `list.sort()` is in-place and returns `None` — easy to mix up
- `operator.itemgetter(0)` is faster than `lambda x: x[0]` for simple key functions
- `sorted()` is stable — equal items keep their original relative order
- For top-k, `heapq.nlargest(k, data, key=fn)` is faster than `sorted()[-k:]` when k is small

## Common Mistake

> [!warning] `lst = lst.sort()` assigns `None` to `lst`. `list.sort()` returns `None` — it sorts in place. Use `lst.sort()` (no assignment) or `new = sorted(lst)`.

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

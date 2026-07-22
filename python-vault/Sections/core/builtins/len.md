---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "len"
title: "len()"
category: "Builtins"
subtitle: "Get the length of any iterable"
signature_short: "len(obj) -> int"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "len()"
  - "len"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# len()

> Get the length of any iterable

## Overview

len() returns the number of items in any sequence, collection, or object with a __len__() method. Works on strings, lists, tuples, sets, dicts, and custom objects. Time complexity is O(1) for built-in types.

## Signature

```python
len(obj) -> int
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
# GOAL: count items in common data structures
len("hello")          # → 5
len([1, 2, 3])        # → 3
len({"a": 1, "b": 2}) # → 2  (counts keys)
len(range(10))        # → 10  (O(1) — no iteration)
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
# GOAL: use len() in guards and conditions
items = [1, 2, 3]

# WHY: check length before accessing index to avoid IndexError
if len(items) >= 2:
    print(items[1])   # → 2

# WHY: len() on a range is O(1) — range doesn't expand into a list
print(len(range(0, 100, 5)))  # → 20
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
# GOAL: support len() on a custom class by implementing __len__
class Playlist:
    def __init__(self, tracks):
        self.tracks = tracks
    def __len__(self):
        return len(self.tracks)

p = Playlist(["Song A", "Song B", "Song C"])
len(p)   # → 3

# NOTE: if an iterable has no __len__ (e.g. a generator), use sum(1 for _ in it) to count
# but be aware that exhausts the generator
#
# Decision rule:
#   list / tuple / str / set / dict           -> len(x) (O(1))
#   range / NumPy array / pandas Series        -> len(x) (still O(1))
#   generator / file iterator                  -> sum(1 for _ in it) (CONSUMES the iterator)
#   one-shot iterator you'll need later        -> list(it) first, then len()
#   custom class                               -> implement __len__
#   "is it empty?"                             -> if not container: (NOT len(c) == 0)
#   "more than N items?"                       -> any(True for _, _ in zip(it, range(N+1)))
#
# Anti-pattern: writing `if len(lst) > 0:` or `if len(lst) == 0:`.
#   Empty containers are falsy, non-empty are truthy. Write `if lst:` or `if not lst:` — it's
#   shorter, idiomatic, and works for any container type. The len() check also fails on
#   generators (TypeError) where truthiness checking via `if it:` would also fail — for
#   generators use `first = next(it, None)` to peek.
```

## Decision Rule

```text
list / tuple / str / set / dict           -> len(x) (O(1))
range / NumPy array / pandas Series        -> len(x) (still O(1))
generator / file iterator                  -> sum(1 for _ in it) (CONSUMES the iterator)
one-shot iterator you'll need later        -> list(it) first, then len()
custom class                               -> implement __len__
"is it empty?"                             -> if not container: (NOT len(c) == 0)
"more than N items?"                       -> any(True for _, _ in zip(it, range(N+1)))
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing `if len(lst) > 0:` or `if len(lst) == 0:`.
>   Empty containers are falsy, non-empty are truthy. Write `if lst:` or `if not lst:` — it's
>   shorter, idiomatic, and works for any container type. The len() check also fails on
>   generators (TypeError) where truthiness checking via `if it:` would also fail — for
>   generators use `first = next(it, None)` to peek.

## Tips

- `len()` works on any object with a `__len__()` method — lists, tuples, sets, dicts, strings, ranges
- For iterables without `__len__()` (generators, file objects), use `sum(1 for _ in it)` if you need the count
- On strings and sequences, `len()` is always O(1) — it does not iterate
- `len() > 0` is more Pythonic than checking `if not empty:`

## Common Mistake

> [!warning] Checking `len(lst) > 0` before iterating. Just write `for item in lst:` — it works correctly on empty sequences.

## See Also

- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/enumerate|enumerate() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

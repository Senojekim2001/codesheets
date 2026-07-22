---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "set-comprehension"
title: "Set comprehension"
category: "Data Types"
subtitle: "{expr for item in iterable if condition}"
signature_short: "{expr for x in iterable} | {x for x in lst if condition}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Set comprehension"
  - "set-comprehension"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# Set comprehension

> {expr for item in iterable if condition}

## Overview

Set comprehensions build a set inline — duplicates are automatically removed. Syntactically identical to list comprehensions but with curly braces. Useful for deduplication and extracting unique values.

## Signature

```python
{expr for x in iterable} | {x for x in lst if condition}
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
# GOAL: Unique squares from a range
squares = {x**2 for x in range(6)}
# → {0, 1, 4, 9, 16, 25}  (unordered, unique)

# GOAL: Deduplicate with a transformation
words = ['Hello', 'world', 'hello', 'WORLD']
lower_unique = {w.lower() for w in words}
# → {'hello', 'world'}
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
# GOAL: Extract unique values from a column of records
records = [{'city': 'NYC'}, {'city': 'LA'}, {'city': 'NYC'}]
cities = {r['city'] for r in records}
# → {'NYC', 'LA'}

# GOAL: With condition — only even numbers
evens = {x for x in range(20) if x % 2 == 0}

# GOAL: Find elements in one list but not another
a = [1, 2, 3, 4, 5]
b = [3, 4, 5, 6, 7]
only_in_a = {x for x in a} - {x for x in b}
# simpler: set(a) - set(b)  → {1, 2}
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
# GOAL: Flatten and deduplicate in one expression
matrix = [[1,2,3],[2,3,4],[3,4,5]]
all_vals = {v for row in matrix for v in row}
# → {1, 2, 3, 4, 5}

# WHY: Use set() directly for simple deduplicate — comprehension only needed with transforms
unique_ids     = set(record['id'] for record in records)   # generator expression
unique_lowered = {tag.lower() for tag in tags}             # comprehension with transform

# NOTE: All elements must be hashable — set comprehension fails on lists or dicts as elements
# {[1,2] for ...}  → TypeError: unhashable type: 'list'
# Use tuples instead: {tuple(row) for row in matrix}
#
# Decision rule:
#   simple dedupe of an iterable                  -> set(iterable) (no comprehension needed)
#   dedupe + transform                            -> {f(x) for x in it}
#   dedupe + filter                               -> {x for x in it if cond}
#   flatten + dedupe                              -> {v for row in m for v in row}
#   need to preserve insertion order              -> list(dict.fromkeys(iterable))
#   elements are unhashable (lists, dicts)        -> convert to tuple first
#   building dict, not set                        -> {k: v for ...} (dict comp, not set comp)
#   piping into another aggregation               -> generator expression (no braces)
#
# Anti-pattern: `{x for x in lst}` when you just want `set(lst)`.
#   The comprehension form adds noise without value when there's no transform or filter.
#   Reserve set/dict/list comprehensions for cases that actually map or filter; for plain
#   conversion, use the constructor (`set(it)`, `list(it)`, `dict(pairs)`). Equally common:
#   forgetting that {} is a dict, so `empty = {}` does NOT give you an empty set — use `set()`.
```

## Decision Rule

```text
simple dedupe of an iterable                  -> set(iterable) (no comprehension needed)
dedupe + transform                            -> {f(x) for x in it}
dedupe + filter                               -> {x for x in it if cond}
flatten + dedupe                              -> {v for row in m for v in row}
need to preserve insertion order              -> list(dict.fromkeys(iterable))
elements are unhashable (lists, dicts)        -> convert to tuple first
building dict, not set                        -> {k: v for ...} (dict comp, not set comp)
piping into another aggregation               -> generator expression (no braces)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `{x for x in lst}` when you just want `set(lst)`.
>   The comprehension form adds noise without value when there's no transform or filter.
>   Reserve set/dict/list comprehensions for cases that actually map or filter; for plain
>   conversion, use the constructor (`set(it)`, `list(it)`, `dict(pairs)`). Equally common:
>   forgetting that {} is a dict, so `empty = {}` does NOT give you an empty set — use `set()`.

## Tips

- For simple deduplication, `set(lst)` is cleaner than `{x for x in lst}`
- Set comprehension is faster than building a list then converting: `{expr}` vs `set([expr])`
- All elements must be hashable — use tuples instead of lists as set elements

## Common Mistake

> [!warning] Using `{}` to create an empty set. `{}` creates an empty dict. Use `set()` for an empty set.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "set"
title: "set"
category: "Data Types"
subtitle: "O(1) membership and set algebra: & | - ^"
signature_short: "s = {1,2,3} | a & b | a | b | a - b | a ^ b"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "set"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# set

> O(1) membership and set algebra: & | - ^

## Overview

Sets store unique items in hash-based storage — O(1) average for add, remove, and membership. Use sets to deduplicate sequences, to check membership in a loop, and for set algebra (union, intersection, difference). frozenset is the immutable, hashable variant.

## Signature

```python
s = {1,2,3} | a & b | a | b | a - b | a ^ b
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
# GOAL: Create a set and test membership
s = {1, 2, 3, 4}
3 in s          # → True   (O(1) — instant)
3 in [1,2,3,4]  # → True   (O(n) — scans the list)

# GOAL: Deduplicate a list
unique = list(set([1, 2, 2, 3, 3, 3]))
# → [1, 2, 3]  (order not guaranteed)
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
# GOAL: Set algebra operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a & b   # → {3, 4}        intersection
a | b   # → {1,2,3,4,5,6} union
a - b   # → {1, 2}        in a but not b
b - a   # → {5, 6}        in b but not a
a ^ b   # → {1,2,5,6}     in exactly one set (symmetric difference)

# GOAL: Mutation
s = {1, 2, 3}
s.add(4)         # add element
s.discard(10)    # remove if present — no error if missing
s.remove(1)      # remove — KeyError if missing
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
# GOAL: Convert list to set for fast membership checks in a loop
# WHY: O(1) per lookup vs O(n) — critical for large datasets
blocklist = set(load_blocked_ids())   # convert once
valid = [u for u in users if u.id not in blocklist]

# GOAL: Deduplicate preserving order (set doesn't preserve order)
seen = set()
ordered_unique = [x for x in lst if not (x in seen or seen.add(x))]
# WHY: seen.add() returns None (falsy) so the short-circuit works

# GOAL: frozenset — immutable, hashable, usable as dict key
fs = frozenset({1, 2, 3})
cache = {frozenset(query_params): result}

# NOTE: {} creates an empty dict, NOT an empty set
empty_set  = set()    # correct
empty_dict = {}       # this is a dict
#
# Decision rule:
#   deduplicate items                            -> set(iterable)
#   fast membership check in a loop              -> set (O(1) vs list O(n))
#   set algebra: union/intersection/diff         -> {a} | {b}, {a} & {b}, {a} - {b}
#   need ordered + unique                        -> dict.fromkeys(iter) (preserves order)
#   need hashable / immutable set                 -> frozenset
#   counting items                                -> collections.Counter (NOT set)
#   key-to-value mapping                          -> dict (NOT set of tuples)
#   numeric data with set ops                     -> NumPy / pandas (vectorized)
#
# Anti-pattern: using `if x in big_list` repeatedly inside a loop.
#   Each membership test is O(n), so an outer loop becomes O(n*m). Convert the haystack to a
#   set ONCE: `block = set(big_list); for x in items: if x in block: ...`. Each lookup is now
#   O(1). The conversion costs O(n), then every `in` is constant. Equally classic gotcha:
#   `{} ` does not create a set; use `set()`.
```

## Decision Rule

```text
deduplicate items                            -> set(iterable)
fast membership check in a loop              -> set (O(1) vs list O(n))
set algebra: union/intersection/diff         -> {a} | {b}, {a} & {b}, {a} - {b}
need ordered + unique                        -> dict.fromkeys(iter) (preserves order)
need hashable / immutable set                 -> frozenset
counting items                                -> collections.Counter (NOT set)
key-to-value mapping                          -> dict (NOT set of tuples)
numeric data with set ops                     -> NumPy / pandas (vectorized)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using `if x in big_list` repeatedly inside a loop.
>   Each membership test is O(n), so an outer loop becomes O(n*m). Convert the haystack to a
>   set ONCE: `block = set(big_list); for x in items: if x in block: ...`. Each lookup is now
>   O(1). The conversion costs O(n), then every `in` is constant. Equally classic gotcha:
>   `{} ` does not create a set; use `set()`.

## Tips

- Convert a list to `set` once before a membership-check loop — O(1) vs O(n) per lookup
- `s.discard(x)` is safer than `s.remove(x)` — no KeyError when the element is absent
- `{}` is an empty dict — use `set()` for an empty set

## Common Mistake

> [!warning] Using a list for membership testing in a loop: `if x in large_list`. Convert once: `lookup = set(large_list)`, then every `if x in lookup` is O(1) instead of O(n).

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

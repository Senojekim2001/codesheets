---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "dict-comprehension"
title: "Dict comprehension"
category: "Data Types"
subtitle: "{key: value for item in iterable if condition}"
signature_short: "{k: v for k, v in pairs} | {k: fn(k) for k in iterable if cond}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dict comprehension"
  - "dict-comprehension"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# Dict comprehension

> {key: value for item in iterable if condition}

## Overview

Dict comprehensions build a dictionary inline — one key-value pair per iteration. More concise than a for loop with dict[key] = value. Also useful for inverting dicts, filtering, and transforming.

## Signature

```python
{k: v for k, v in pairs} | {k: fn(k) for k in iterable if cond}
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
# GOAL: Build a dict from a list of pairs
pairs  = [('a', 1), ('b', 2), ('c', 3)]
result = {k: v for k, v in pairs}
# → {'a': 1, 'b': 2, 'c': 3}

# GOAL: Square numbers keyed by the number
squares = {x: x**2 for x in range(5)}
# → {0:0, 1:1, 2:4, 3:9, 4:16}
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
# GOAL: Filter a dict — keep only high scores
scores = {'Alice': 92, 'Bob': 65, 'Carol': 88, 'Dave': 55}
passing = {name: s for name, s in scores.items() if s >= 80}
# → {'Alice': 92, 'Carol': 88}

# GOAL: Invert a dict — swap keys and values
perms = {'read': 1, 'write': 2, 'exec': 4}
by_val = {v: k for k, v in perms.items()}
# → {1: 'read', 2: 'write', 4: 'exec'}

# GOAL: Build a fast lookup dict from a list of objects
users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
by_id = {u['id']: u for u in users}   # O(1) lookup by id
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
# GOAL: Transform and normalise config from environment
import os
env_keys = ['PORT', 'WORKERS', 'DEBUG']
config = {
    k.lower(): os.environ.get(k, '')
    for k in env_keys
}

# WHY: Nested dict comprehension — transpose a matrix
matrix = {'a': {'x': 1, 'y': 2}, 'b': {'x': 3, 'y': 4}}
transposed = {
    inner_k: {outer_k: outer_v[inner_k] for outer_k, outer_v in matrix.items()}
    for inner_k in next(iter(matrix.values()))
}
# → {'x': {'a':1,'b':3}, 'y': {'a':2,'b':4}}

# NOTE: Keep nesting shallow — 2 levels max before readability suffers
#
# Decision rule:
#   build dict from iterable of pairs           -> {k: v for k, v in pairs} or dict(pairs)
#   transform values, keep keys                 -> {k: f(v) for k, v in d.items()}
#   filter dict by predicate                    -> {k: v for k, v in d.items() if cond}
#   invert dict (values must be unique)         -> {v: k for k, v in d.items()}
#   group items by computed key                 -> defaultdict(list) loop (NOT a comp)
#   simple two-list zip                         -> dict(zip(keys, values))
#   merge two dicts                              -> d1 | d2 (3.9+) or {**d1, **d2}
#   build O(1) lookup index                     -> {item.id: item for item in items}
#
# Anti-pattern: inverting a dict that has duplicate values via comprehension.
#   `{v: k for k, v in d.items()}` keeps only the LAST key for each repeated value, silently
#   dropping data. Either de-dupe values first, or invert into a list-of-keys dict:
#   defaultdict(list); for k, v in d.items(): inv[v].append(k). Always assert
#   `len(set(d.values())) == len(d)` before single-key inversion.
```

## Decision Rule

```text
build dict from iterable of pairs           -> {k: v for k, v in pairs} or dict(pairs)
transform values, keep keys                 -> {k: f(v) for k, v in d.items()}
filter dict by predicate                    -> {k: v for k, v in d.items() if cond}
invert dict (values must be unique)         -> {v: k for k, v in d.items()}
group items by computed key                 -> defaultdict(list) loop (NOT a comp)
simple two-list zip                         -> dict(zip(keys, values))
merge two dicts                              -> d1 | d2 (3.9+) or {**d1, **d2}
build O(1) lookup index                     -> {item.id: item for item in items}
```

## Anti-Pattern

> [!warning] Anti-pattern
> inverting a dict that has duplicate values via comprehension.
>   `{v: k for k, v in d.items()}` keeps only the LAST key for each repeated value, silently
>   dropping data. Either de-dupe values first, or invert into a list-of-keys dict:
>   defaultdict(list); for k, v in d.items(): inv[v].append(k). Always assert
>   `len(set(d.values())) == len(d)` before single-key inversion.

## Tips

- Inverting a dict with duplicate values silently drops all but the last — check uniqueness first
- For complex logic (multiple statements, side effects) use a regular for loop instead
- Dict comprehensions are O(n) — same as a loop, but more readable for simple transforms

## Common Mistake

> [!warning] Inverting a dict with duplicate values. `{v: k for k, v in d.items()}` silently keeps only the last key per value. Check `len(d) == len(set(d.values()))` before inverting.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/tuple|tuple (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

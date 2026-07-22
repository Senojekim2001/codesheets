---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "dict"
title: "dict"
category: "Data Types"
subtitle: "get, update, setdefault, items, merge"
signature_short: "d = {} | d.get(key, default) | d.setdefault(key, []) | {**d1, **d2}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dict"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# dict

> get, update, setdefault, items, merge

## Overview

Python dicts are hash maps with O(1) average case for get/set/delete. Since Python 3.7 they maintain insertion order. The collections module's defaultdict and Counter extend dict for common patterns.

## Signature

```python
d = {} | d.get(key, default) | d.setdefault(key, []) | {**d1, **d2}
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
# GOAL: Create and access a dict
d = {'a': 1, 'b': 2, 'c': 3}
d['a']            # → 1  (KeyError if missing)
d.get('z')        # → None  (safe)
d.get('z', 0)     # → 0  (with default)

# GOAL: Add, update, delete
d['d'] = 4        # add or update
del d['a']        # delete (KeyError if missing)
d.pop('b')        # remove + return value
d.pop('x', None)  # safe pop — returns None if missing
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
# GOAL: Iterate over keys, values, and both
d = {'x': 10, 'y': 20, 'z': 30}
for k in d:              # keys
    print(k)
for v in d.values():     # values
    print(v)
for k, v in d.items():   # both
    print(k, v)

# GOAL: setdefault — initialize a key only if absent
groups = {}
for item in ['cat', 'cow', 'dog', 'deer']:
    groups.setdefault(item[0], []).append(item)
# → {'c': ['cat','cow'], 'd': ['dog','deer']}
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
# GOAL: Merge dicts — Python 3.9+ union operator
d1 = {'a': 1}
d2 = {'b': 2}
merged  = d1 | d2    # → new dict  (3.9+)
d1     |= d2         # in-place    (3.9+)
merged  = {**d1, **d2}  # works in 3.5+

# WHY: Use defaultdict to avoid setdefault boilerplate
from collections import defaultdict
groups = defaultdict(list)
for item in ['cat', 'cow', 'dog', 'deer']:
    groups[item[0]].append(item)

# GOAL: dict as a dispatch table — replaces long if/elif chains
handlers = {
    'start': lambda: print('starting'),
    'stop':  lambda: print('stopping'),
}
handlers.get(command, lambda: print('unknown'))()
# NOTE: d.get(key) two-lookup vs d[key] with try/except — use get() for expected misses
#
# Decision rule:
#   key-value lookup, generic data              -> dict
#   key MUST be present (else bug)              -> d[key] (raises KeyError = good)
#   key MAY be missing, want default            -> d.get(key, default)
#   group-by pattern (key -> list)              -> collections.defaultdict(list)
#   counting occurrences                        -> collections.Counter
#   ordered insertion + LRU semantics            -> collections.OrderedDict (or LRUCache)
#   typed record with fixed schema              -> @dataclass / TypedDict / Pydantic
#   string keys at module scope (config)        -> dict OK; constants in CapsConst
#   immutable / hashable mapping                 -> types.MappingProxyType / frozendict
#
# Anti-pattern: `if key in d: value = d[key]` — two lookups for the price of one.
#   This hashes `key` twice (once for `in`, once for `[]`). Use `value = d.get(key)` plus a
#   None check, or `d.get(key, default)`. For "fetch and create if missing" use
#   d.setdefault(key, []) or, cleaner, defaultdict. Same anti-pattern: del d[k] inside an
#   iteration over d — collect keys first or rebuild via dict comprehension.
```

## Decision Rule

```text
key-value lookup, generic data              -> dict
key MUST be present (else bug)              -> d[key] (raises KeyError = good)
key MAY be missing, want default            -> d.get(key, default)
group-by pattern (key -> list)              -> collections.defaultdict(list)
counting occurrences                        -> collections.Counter
ordered insertion + LRU semantics            -> collections.OrderedDict (or LRUCache)
typed record with fixed schema              -> @dataclass / TypedDict / Pydantic
string keys at module scope (config)        -> dict OK; constants in CapsConst
immutable / hashable mapping                 -> types.MappingProxyType / frozendict
```

## Anti-Pattern

> [!warning] Anti-pattern
> `if key in d: value = d[key]` — two lookups for the price of one.
>   This hashes `key` twice (once for `in`, once for `[]`). Use `value = d.get(key)` plus a
>   None check, or `d.get(key, default)`. For "fetch and create if missing" use
>   d.setdefault(key, []) or, cleaner, defaultdict. Same anti-pattern: del d[k] inside an
>   iteration over d — collect keys first or rebuild via dict comprehension.

## Tips

- `d.get(key, default)` is one lookup — prefer over `if key in d: d[key]` which is two
- `d.setdefault(key, []).append(val)` initialises a list key on first access — one-line groupby
- Use `defaultdict(list)` from collections for grouping patterns — cleaner than setdefault

## Common Mistake

> [!warning] Mutating a dict while iterating it. `for k in d: del d[k]` raises RuntimeError. Iterate `list(d.keys())` or use a dict comprehension to build a new dict.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/tuple|tuple (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

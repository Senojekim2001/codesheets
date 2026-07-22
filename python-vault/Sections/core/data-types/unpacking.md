---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "unpacking"
title: "Unpacking"
category: "Data Types"
subtitle: "a, *rest = lst | swap | fn(*args, **kwargs)"
signature_short: "a, b, c = iterable | first, *rest = lst | *init, last = lst"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Unpacking"
  - "unpacking"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# Unpacking

> a, *rest = lst | swap | fn(*args, **kwargs)

## Overview

Python unpacking assigns iterable elements to variables in one expression. The starred expression (*rest) captures any number of remaining elements as a list. Works in assignments, for loops, and function calls. ** unpacks dicts into keyword arguments.

## Signature

```python
a, b, c = iterable | first, *rest = lst | *init, last = lst
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
# GOAL: Assign multiple variables from a sequence in one line
a, b, c = [1, 2, 3]
x, y    = (10, 20)

# GOAL: Swap values without a temp variable
a, b = b, a

# GOAL: Starred expression captures the remainder
first, *rest  = [1, 2, 3, 4, 5]   # rest = [2,3,4,5]
*init, last   = [1, 2, 3, 4, 5]   # last = 5
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
# GOAL: Unpack in a for loop — cleaner than indexing
pairs = [(1, 'a'), (2, 'b'), (3, 'c')]
for num, letter in pairs:
    print(num, letter)

# GOAL: Middle capture — skip known positions with _
a, *middle, z = [1, 2, 3, 4, 5]  # middle = [2,3,4]
_, second, *_ = [1, 2, 3, 4]     # keep only second

# GOAL: Spread args into a function call
args   = [1, 2, 3]
kwargs = {'sep': ', '}
print(*args, **kwargs)   # → 1, 2, 3
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
# GOAL: Merge dicts with ** (Python 3.9+ also supports d1 | d2)
d1 = {'a': 1, 'b': 2}
d2 = {'b': 99, 'c': 3}
merged = {**d1, **d2}   # → {'a':1,'b':99,'c':3}  (d2 wins on 'b')

# GOAL: Unpack nested structures in one expression
# WHY: Avoids multiple index lookups — readable and concise
data = [('Alice', (90, 85, 92)), ('Bob', (78, 88, 76))]
for name, (score1, score2, score3) in data:
    avg = (score1 + score2 + score3) / 3
    print(f"{name}: {avg:.1f}")

# NOTE: Only one starred expression allowed per assignment
# a, *b, *c = lst  →  SyntaxError
#
# Decision rule:
#   destructure tuple / list of known shape    -> a, b, c = items
#   capture trailing items                      -> first, *rest = items
#   capture leading items                       -> *init, last = items
#   capture middle, ignore ends                 -> _, *middle, _ = items
#   iterate (idx, val) pairs                    -> for i, v in enumerate(...)
#   forward args to wrapped function            -> f(*args, **kwargs)
#   merge dicts (3.5+)                          -> {**d1, **d2}
#   merge dicts (3.9+)                          -> d1 | d2 (newer, cleaner)
#
# Anti-pattern: indexing into a tuple repeatedly when destructuring would be obvious.
#   `name = pair[0]; value = pair[1]` is noisy and error-prone next to `name, value = pair`.
#   Same for return values: write `mean, stdev = stats(x)` instead of `r = stats(x); m = r[0]`.
#   When tuples grow beyond 3 fields, consider a dataclass or NamedTuple — destructuring N
#   fields by position becomes brittle as the tuple's shape evolves.
```

## Decision Rule

```text
destructure tuple / list of known shape    -> a, b, c = items
capture trailing items                      -> first, *rest = items
capture leading items                       -> *init, last = items
capture middle, ignore ends                 -> _, *middle, _ = items
iterate (idx, val) pairs                    -> for i, v in enumerate(...)
forward args to wrapped function            -> f(*args, **kwargs)
merge dicts (3.5+)                          -> {**d1, **d2}
merge dicts (3.9+)                          -> d1 | d2 (newer, cleaner)
```

## Anti-Pattern

> [!warning] Anti-pattern
> indexing into a tuple repeatedly when destructuring would be obvious.
>   `name = pair[0]; value = pair[1]` is noisy and error-prone next to `name, value = pair`.
>   Same for return values: write `mean, stdev = stats(x)` instead of `r = stats(x); m = r[0]`.
>   When tuples grow beyond 3 fields, consider a dataclass or NamedTuple — destructuring N
>   fields by position becomes brittle as the tuple's shape evolves.

## Tips

- `first, *rest = lst` is cleaner than `first = lst[0]; rest = lst[1:]`
- `a, b = b, a` swaps in one line — Python evaluates the right side fully before assigning
- `{**d1, **d2}` merges dicts — right dict wins on duplicate keys

## Common Mistake

> [!warning] Using more than one starred expression in an unpacking. `a, *b, *c = lst` is a SyntaxError — only one `*` is allowed per assignment.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/tuple|tuple (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

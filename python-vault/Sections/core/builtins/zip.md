---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "zip"
title: "zip()"
category: "Builtins"
subtitle: "Iterate over multiple sequences in parallel"
signature_short: "zip(*iterables, strict=False) | zip_longest(*its, fillvalue=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "zip()"
  - "zip"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# zip()

> Iterate over multiple sequences in parallel

## Overview

zip() yields tuples pairing the nth element of each iterable. It stops at the shortest iterable by default. Use strict=True (Python 3.10+) to raise if lengths differ. itertools.zip_longest fills in a default value for the shorter side.

## Signature

```python
zip(*iterables, strict=False) | zip_longest(*its, fillvalue=None)
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
# GOAL: loop over two lists in parallel
names  = ["Alice", "Bob", "Carol"]
scores = [92, 88, 95]

for name, score in zip(names, scores):
    print(name, score)
# → Alice 92  Bob 88  Carol 95
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
# GOAL: build a dict from two lists and unzip pairs
names  = ["Alice", "Bob", "Carol"]
scores = [92, 88, 95]

# WHY: dict(zip(...)) is the idiomatic one-liner for this pattern
d = dict(zip(names, scores))
# → {'Alice': 92, 'Bob': 88, 'Carol': 95}

# WHY: zip(*pairs) transposes — swaps rows and columns
pairs = [(1, "a"), (2, "b"), (3, "c")]
nums, letters = zip(*pairs)
# → (1, 2, 3)  ('a', 'b', 'c')
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
from itertools import zip_longest

# GOAL: handle lists of unequal length safely
names  = ["Alice", "Bob", "Carol"]
scores = [92, 88]            # one score missing

# WHY: plain zip silently drops 'Carol' — no warning
list(zip(names, scores))     # → [('Alice',92), ('Bob',88)]

# WHY: strict=True raises ValueError if lengths differ — catches bugs early
list(zip(names, scores, strict=True))  # → ValueError

# WHY: zip_longest fills the short side instead of truncating
list(zip_longest(names, scores, fillvalue=0))
# → [('Alice',92), ('Bob',88), ('Carol',0)]
#
# Decision rule:
#   parallel iteration over equal-length seqs -> zip(a, b)
#   want to fail fast if lengths differ        -> zip(a, b, strict=True) (3.10+)
#   pad shorter side with default              -> itertools.zip_longest(a, b, fillvalue=...)
#   build dict from keys, values lists         -> dict(zip(keys, vals))
#   transpose rows<->cols                     -> zip(*rows)
#   need only one element from each iterable  -> next(zip(it1, it2, ...))
#   numeric vectorization                      -> NumPy / pandas, NOT zip in a Python loop
#
# Anti-pattern: relying on zip's silent truncation as a feature.
#   When two lists should be the same length but aren't, plain zip drops the tail of the longer
#   one with no warning, hiding data bugs (e.g. you load 100 names but only 99 emails). In
#   3.10+, default to zip(..., strict=True) anywhere lengths are supposed to match — it raises
#   ValueError and surfaces the mismatch immediately.
```

## Decision Rule

```text
parallel iteration over equal-length seqs -> zip(a, b)
want to fail fast if lengths differ        -> zip(a, b, strict=True) (3.10+)
pad shorter side with default              -> itertools.zip_longest(a, b, fillvalue=...)
build dict from keys, values lists         -> dict(zip(keys, vals))
transpose rows<->cols                     -> zip(*rows)
need only one element from each iterable  -> next(zip(it1, it2, ...))
numeric vectorization                      -> NumPy / pandas, NOT zip in a Python loop
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on zip's silent truncation as a feature.
>   When two lists should be the same length but aren't, plain zip drops the tail of the longer
>   one with no warning, hiding data bugs (e.g. you load 100 names but only 99 emails). In
>   3.10+, default to zip(..., strict=True) anywhere lengths are supposed to match — it raises
>   ValueError and surfaces the mismatch immediately.

## Tips

- `dict(zip(keys, values))` is the cleanest one-liner for building a dict from two lists
- `zip(*list_of_lists)` transposes a 2D structure — a classic Python idiom
- `zip(..., strict=True)` (Python 3.10+) is a safety net — raises if the lists have different lengths
- `zip()` is lazy — it does not build a list. Wrap in `list()` when you need to inspect or reuse

## Common Mistake

> [!warning] Forgetting that `zip()` silently truncates to the shortest iterable. If `names` has 10 items and `scores` has 9, you silently lose one pairing. Use `strict=True` to catch this.

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/sum-min-max|Numeric built-ins (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "itertools"
title: "itertools"
category: "Standard Library"
subtitle: "chain, product, combinations, permutations, groupby, islice"
signature_short: "chain(*its) | product(*its) | groupby(it, key=fn) | islice(it, n)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "itertools"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# itertools

> chain, product, combinations, permutations, groupby, islice

## Overview

itertools provides memory-efficient iterators for combinatorial and sequence operations. All functions are lazy — they generate values on demand. groupby() only groups consecutive equal elements — sort by key first for full grouping.

## Signature

```python
chain(*its) | product(*its) | groupby(it, key=fn) | islice(it, n)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chain joins iterables; islice slices any iterable; product/combinations/permutations build the standard combinatorics.
# STRENGTHS - Lazy by default; works on generators, files, infinite streams.
# WEAKNESSES- Calling list() on an infinite iterator hangs forever.
import itertools as it

list(it.chain([1, 2], [3, 4]))          # [1, 2, 3, 4]
list(it.islice(range(1000), 5))         # [0, 1, 2, 3, 4]

list(it.product("AB", repeat=2))        # [('A','A'),('A','B'),('B','A'),('B','B')]
list(it.combinations("ABCD", 2))        # ('A','B'),('A','C')... ORDER doesn't matter
list(it.permutations("ABC", 2))         # ORDER matters
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - groupby needs sorted input; chain.from_iterable flattens; accumulate for running totals; cycle/count for infinite loops.
# STRENGTHS - One-line replacements for hand-rolled loops; constant memory over huge inputs.
# WEAKNESSES- groupby on unsorted data silently produces wrong groups.
import itertools as it

# Flatten one level — without intermediate list.
flat = list(it.chain.from_iterable([[1, 2], [3, 4], [5]]))   # [1,2,3,4,5]

# groupby ONLY groups consecutive equal keys -- always sort first.
data = [("a", 1), ("b", 3), ("a", 2), ("a", 4)]
for key, grp in it.groupby(sorted(data, key=lambda x: x[0]), key=lambda x: x[0]):
    print(key, list(grp))

# Running computation.
list(it.accumulate([1, 2, 3, 4]))             # [1, 3, 6, 10] — running sum
list(it.accumulate([3, 1, 2, 5], max))        # [3, 3, 3, 5] — running max

# Infinite iterators — ALWAYS bound with islice.
list(it.islice(it.cycle("ABC"), 7))           # ['A','B','C','A','B','C','A']
list(it.islice(it.count(10, 2), 5))           # [10, 12, 14, 16, 18]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - itertools recipes for sliding windows, batching, chunked I/O; pairwise (3.10+); tee for branching streams.
# STRENGTHS - Pipelined data processing in constant memory; no pandas needed for many "stream the data" tasks.
# WEAKNESSES- tee() buffers if branches advance at different rates; can blow memory if one branch lags.
from __future__ import annotations
import itertools as it
from collections.abc import Iterable, Iterator

def pairwise[T](xs: Iterable[T]) -> Iterator[tuple[T, T]]:
    """Adjacent pairs. Stdlib has it.pairwise on 3.10+."""
    return it.pairwise(xs)

def chunked[T](xs: Iterable[T], n: int) -> Iterator[list[T]]:
    """Fixed-size chunks; useful for batched API calls."""
    it_ = iter(xs)
    while batch := list(it.islice(it_, n)):
        yield batch

def windowed[T](xs: Iterable[T], n: int) -> Iterator[tuple[T, ...]]:
    """Sliding window of size n."""
    it_ = iter(xs)
    window = tuple(it.islice(it_, n))
    if len(window) == n: yield window
    for x in it_:
        window = window[1:] + (x,)
        yield window

# Decision rule:
#   "joined sequences"             -> it.chain / chain.from_iterable
#   "first N / slice"              -> it.islice (works on ANY iterable; not just lists)
#   "all unordered subsets"        -> it.combinations
#   "all ordered subsets"          -> it.permutations
#   "all assignments to N slots"   -> it.product (with repeat=)
#   "running sum / running max"    -> it.accumulate
#   "consecutive duplicates"       -> it.groupby (sort first if you want all matches)
#   "batch into pages"             -> chunked recipe above
#   "branch one stream"            -> it.tee (watch memory; bounded by lag)
#
# Anti-pattern: list(it.cycle("ABC")) — hangs forever. ALWAYS bound infinite
# iterators (count / cycle / repeat) with islice or break out of the loop.
```

## Decision Rule

```text
"joined sequences"             -> it.chain / chain.from_iterable
"first N / slice"              -> it.islice (works on ANY iterable; not just lists)
"all unordered subsets"        -> it.combinations
"all ordered subsets"          -> it.permutations
"all assignments to N slots"   -> it.product (with repeat=)
"running sum / running max"    -> it.accumulate
"consecutive duplicates"       -> it.groupby (sort first if you want all matches)
"batch into pages"             -> chunked recipe above
"branch one stream"            -> it.tee (watch memory; bounded by lag)
```

## Anti-Pattern

> [!warning] Anti-pattern
> list(it.cycle("ABC")) — hangs forever. ALWAYS bound infinite
> iterators (count / cycle / repeat) with islice or break out of the loop.

## Tips

- `itertools.groupby()` groups only *consecutive* equal elements — always sort by key first
- `chain.from_iterable()` flattens one level without building intermediate lists
- `product(range(10), repeat=3)` generates all 1000 3-digit combinations for grid search
- Wrap in `list()` only when you need all results — itertools iterators are lazy by design

## Common Mistake

> [!warning] Using `itertools.groupby()` on unsorted data expecting all matching items grouped. It only groups *consecutive* matches. Sort by the key first: `sorted(data, key=fn)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/json-module|json module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "itertools-module"
title: "itertools (Combinations, Permutations, Chain)"
category: "Iteration"
subtitle: "Lazy sequences without creating full lists"
signature_short: "from itertools import combinations, permutations, chain, groupby, islice"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "itertools (Combinations, Permutations, Chain)"
  - "itertools-module"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/iteration"
  - "tier/tiered"
---

# itertools (Combinations, Permutations, Chain)

> Lazy sequences without creating full lists

## Overview

itertools provides lazy iterators for combinations, permutations, chaining, grouping, and slicing. Memory-efficient because they generate values on-the-fly, not all at once.

## Signature

```python
from itertools import combinations, permutations, chain, groupby, islice
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chain joins iterables; combinations/permutations/product cover combinatorics; islice slices any iterable.
# STRENGTHS - Lazy by default; works on infinite streams.
# WEAKNESSES- See the earlier 'itertools' entry for the deep dive (sliding window, batching, recipes).
from itertools import chain, combinations, islice

list(chain([1, 2], [3, 4]))                  # [1, 2, 3, 4]
list(combinations("ABCD", 2))                 # all 2-element unordered subsets
list(islice(range(1000), 5))                  # [0, 1, 2, 3, 4]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - chain.from_iterable flattens; product for cartesian; groupby for consecutive duplicates (sort first); pairwise (3.10+) for adjacent pairs.
# STRENGTHS - One-line replacements for common nested loops.
# WEAKNESSES- groupby on UNSORTED data silently produces wrong groups.
from itertools import chain, product, groupby, pairwise

# Flatten lists of lists.
flat = list(chain.from_iterable([[1, 2], [3, 4]]))      # [1, 2, 3, 4]

# Cartesian product replaces nested loops.
for color, size in product(["red", "blue"], ["S", "M", "L"]):
    pass

# Adjacent pairs (Python 3.10+).
for a, b in pairwise([1, 2, 3, 4]):
    print(a, b)                                          # (1,2) (2,3) (3,4)

# groupby — must sort first.
data = [("a", 1), ("b", 2), ("a", 3)]
for k, g in groupby(sorted(data, key=lambda x: x[0]), key=lambda x: x[0]):
    print(k, list(g))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For sliding-window, batched, tee, accumulate recipes — see the earlier 'itertools' entry's senior tier.
# STRENGTHS - itertools is the stdlib's stream-processing library; constant memory over huge inputs.
# WEAKNESSES- For complex stream pipelines reach for more-itertools (third-party, but well-maintained).
from itertools import islice, tee
from collections.abc import Iterable, Iterator

def chunked[T](xs: Iterable[T], n: int) -> Iterator[list[T]]:
    it = iter(xs)
    while batch := list(islice(it, n)):
        yield batch

# Decision rule:
#   join sequences                        -> chain / chain.from_iterable
#   slice any iterable                    -> islice
#   all unordered subsets                 -> combinations
#   all ordered subsets                   -> permutations
#   nested loops over multiple ranges     -> product (with repeat= for grid search)
#   running sum / running max             -> accumulate
#   consecutive duplicates                -> groupby (sort first if you want all matches)
#   adjacent pairs                        -> pairwise (3.10+)
#   batch / chunk                         -> islice in a while loop OR more_itertools.chunked
#   branch one stream                     -> tee (watch memory if branches advance unevenly)
#
# Anti-pattern: list(itertools.cycle(xs)) — hangs forever. ALWAYS bound infinite
# iterators (count / cycle / repeat) with islice or break out of the loop.
```

## Decision Rule

```text
join sequences                        -> chain / chain.from_iterable
slice any iterable                    -> islice
all unordered subsets                 -> combinations
all ordered subsets                   -> permutations
nested loops over multiple ranges     -> product (with repeat= for grid search)
running sum / running max             -> accumulate
consecutive duplicates                -> groupby (sort first if you want all matches)
adjacent pairs                        -> pairwise (3.10+)
batch / chunk                         -> islice in a while loop OR more_itertools.chunked
branch one stream                     -> tee (watch memory if branches advance unevenly)
```

## Anti-Pattern

> [!warning] Anti-pattern
> list(itertools.cycle(xs)) — hangs forever. ALWAYS bound infinite
> iterators (count / cycle / repeat) with islice or break out of the loop.

## Tips

- combinations/permutations return iterators (lazy) — don't convert to list unless needed
- chain.from_iterable() flattens nested iterables without creating intermediate lists
- groupby requires data sorted by key — sort first if needed
- islice + repeat/cycle create infinite lazy sequences — process with islice or list comprehension

## Common Mistake

> [!warning] Calling list() immediately on itertools results for large datasets. Use iterators directly in loops when possible to save memory.

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

- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

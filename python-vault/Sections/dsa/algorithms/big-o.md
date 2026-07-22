---
type: "entry"
domain: "python"
file: "dsa"
section: "algorithms"
id: "big-o"
title: "Big-O Reference"
category: "Complexity"
subtitle: "O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ)"
signature_short: "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Big-O Reference"
  - "big-o"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/algorithms"
  - "category/complexity"
  - "tier/tiered"
---

# Big-O Reference

> O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ)

## Overview

Big-O describes how runtime or memory grows with input size n. Focus on the dominant term and drop constants. Knowing Python built-in complexities lets you write efficient code without profiling first.

## Signature

```python
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The growth scale; remember the ladder
# STRENGTHS - Smallest valid mental model
# WEAKNESSES- No Python-specific costs; senior tier covers them
#
# Big-O ladder:
#   O(1)         constant      — d[k], s.add(x)
#   O(log n)     logarithmic    — bisect, heappush, heappop
#   O(n)         linear         — for x in arr, x in list, sum(arr)
#   O(n log n)   linearithmic   — sorted(arr), arr.sort()
#   O(n^2)       quadratic      — nested for-for over the same array
#   O(2^n)       exponential    — all subsets, naive Fibonacci recursion
#
# Drop constants: O(2n + 5) = O(n).  Keep dominant term: O(n^2 + n) = O(n^2).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Python built-in costs you actually need to memorize
# STRENGTHS - The cheat sheet that prevents most accidental quadratic code
# WEAKNESSES- No amortization explanation
#
# list (dynamic array)
#   lst[i]               O(1)
#   lst.append(x)        O(1) amortized   <- doubling under the hood
#   lst.pop()            O(1)              <- pops from the END
#   lst.pop(0)           O(n)              <- shifts every other element!
#   lst.insert(i, x)     O(n)
#   x in lst             O(n)              <- linear scan
#   lst.sort()           O(n log n)        <- Timsort, stable
#
# dict / set (hash tables)
#   d[k] / s.add(x)      O(1) average
#   k in d / x in s      O(1) average
#   iteration            O(n)
#
# collections.deque (doubly linked list)
#   appendleft / popleft O(1)
#   d[i]                 O(n)              <- middle access is slow!
#
# heapq (binary heap on list)
#   heappush / heappop   O(log n)
#   heapify(lst)         O(n)              <- not O(n log n)!
#   nlargest / nsmallest O(n log k)        <- beats sorted()[:k] when k << n
#
# bisect (binary search on sorted list)
#   bisect_left/right    O(log n) for the search; insort is O(n) total because of shift

print("memorize this list")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Spot the bottleneck; pick the right swap; understand amortization
# STRENGTHS - The doctrine that prevents accidental quadratic code in real systems
# WEAKNESSES- N/A
#
# 1) MOST common upgrades
#    O(n^2) repeated "x in big_list" -> precompute set: O(n) once, then O(1) per query
big = list(range(1_000_000))
quick = set(big)                                  # one O(n) build...
def is_member(x): return x in quick               # ...turns each lookup O(1)

#    O(n) "list.pop(0) in a loop"   -> deque.popleft() (O(1))
#    O(n^2) "build string with +="  -> "".join(parts)
#    O(n log n) "sorted(arr)[:k]"   -> heapq.nlargest / nsmallest (O(n log k))

# 2) AMORTIZATION
#    list.append is "amortized O(1)" — most appends are O(1), occasional resize
#    is O(n), but averaged out it's constant. Don't over-optimize for the resize.

# 3) Average vs worst case
#    dict / set are O(1) AVERAGE; worst-case is O(n) when many keys hash-collide.
#    For adversarial input, use sorted structures or salt the hash (str hashes
#    are randomized by default with PYTHONHASHSEED).

# 4) SPACE complexity bites too
#    Recursive O(2^n) algorithms also use O(n) STACK space (recursion depth).
#    DP with a 2D table is O(n*m) memory; a rolling array can drop it to O(m).

# 5) Profile before optimizing
import cProfile
def hot_path():
    return sum(i*i for i in range(10_000))
# cProfile.run("hot_path()")   # surfaces actual hotspots, not assumed ones

# 6) Common Python-specific traps
#    - Repeated string concatenation in a loop: O(n^2) (strings are immutable)
#    - "for x in dict.keys()" then "if x in dict": double lookup
#    - sorted([...])[:1] when min(...) suffices: O(n log n) vs O(n)
#    - Building a list with [:] copies, repeatedly: O(n) per copy

# 7) Big-O hides constants — but constants matter
#    O(n) numpy on a million floats beats O(n) Python loop by 50-100x.
#    O(n log n) Timsort on near-sorted data approaches O(n) in practice.

# Decision rule:
#   x in lst inside a loop                -> set lookup
#   list.pop(0) inside a loop              -> deque.popleft()
#   string += in a loop                     -> "".join(...)
#   sorted(...)[:k] for small k             -> heapq.nlargest
#   recursion explodes                      -> @lru_cache
#   nested for-for over same data            -> hash map / two-pointer / sort
#   slicing huge lists in a loop             -> indices, NOT slices
#
# Anti-pattern: micro-optimizing past readability before profiling
#   The 5% you guess at is rarely the 50% you'd find by measuring. Use cProfile
#   or pytest-benchmark to find the real hot spot, then choose the right Big-O.
```

## Decision Rule

```text
x in lst inside a loop                -> set lookup
list.pop(0) inside a loop              -> deque.popleft()
string += in a loop                     -> "".join(...)
sorted(...)[:k] for small k             -> heapq.nlargest
recursion explodes                      -> @lru_cache
nested for-for over same data            -> hash map / two-pointer / sort
slicing huge lists in a loop             -> indices, NOT slices
```

## Anti-Pattern

> [!warning] Anti-pattern
> micro-optimizing past readability before profiling
>   The 5% you guess at is rarely the 50% you'd find by measuring. Use cProfile
>   or pytest-benchmark to find the real hot spot, then choose the right Big-O.

## Tips

- dict/set lookups are O(1) — convert lists to sets when doing repeated membership tests
- `list.pop(0)` is O(n) — use `deque.popleft()` for O(1) queue operations
- Nested loops → look for a hash map to reduce O(n²) to O(n)
- Sorted array → think binary search to reduce O(n) search to O(log n)

## Common Mistake

> [!warning] `if x in large_list` inside a loop: O(n) per check → O(n²) total. Convert to set once: `lookup = set(large_list)`, then `if x in lookup` is O(1) per check.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/dsa/algorithms/_Index|Data Structures & Algos → Algorithm Patterns & Complexity]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "binary-search"
title: "Binary search"
category: "Search"
subtitle: "Use bisect module — or implement with lo/hi/mid pattern"
signature_short: "bisect.bisect_left(a, x) | bisect.bisect_right(a, x)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Binary search"
  - "binary-search"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/search"
  - "tier/tiered"
---

# Binary search

> Use bisect module — or implement with lo/hi/mid pattern

## Overview

Binary search finds a value in O(log n) by halving the search space each step. Python's bisect module provides production-ready binary search. Implement manually only to understand the lo/hi/mid pattern.

## Signature

```python
bisect.bisect_left(a, x) | bisect.bisect_right(a, x)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Use the bisect module; don't reinvent
# STRENGTHS - Smallest valid binary search; production-grade
# WEAKNESSES- No bisect_left vs bisect_right discussion
#
import bisect

a = [1, 3, 5, 7, 9]

i = bisect.bisect_left(a, 5)                      # 2 — index of first 5
print(i, a[i] if i < len(a) and a[i] == 5 else "missing")

bisect.insort(a, 4)                                # keeps array sorted
print(a)                                           # [1, 3, 4, 5, 7, 9]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - bisect_left vs bisect_right; manual lo/hi/mid template
# STRENGTHS - The two bisect functions and the canonical loop shape
# WEAKNESSES- No "binary search on the answer"
#
import bisect

a = [1, 3, 5, 5, 5, 7, 9]

print(bisect.bisect_left(a, 5))                   # 2 — FIRST index of 5
print(bisect.bisect_right(a, 5))                  # 5 — index AFTER last 5
# count in range [lo, hi] inclusive: bisect_right(hi) - bisect_left(lo)
def count_in_range(arr, lo, hi):
    return bisect.bisect_right(arr, hi) - bisect.bisect_left(arr, lo)
print(count_in_range(a, 3, 5))                    # 4

# Manual binary search — exact match
def bsearch(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi:                               # closed interval [lo, hi]
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        if arr[mid] < target:  lo = mid + 1
        else:                  hi = mid - 1
    return -1                                      # not found

print(bsearch(a, 7))                              # 5
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - bisect with key= (3.10+), binary search on the answer, off-by-one rules
# STRENGTHS - The patterns that turn binary search from a search trick into an algorithm tool
# WEAKNESSES- N/A
#
import bisect

# 1) bisect with key= (3.10+) — search on a derived key WITHOUT building a parallel array
people = [{"age": 20}, {"age": 30}, {"age": 40}]
i = bisect.bisect_left(people, 35, key=lambda p: p["age"])
# i = 2 -> insert position to keep sorted by age

# 2) BINARY SEARCH ON THE ANSWER — search space is a range of VALUES, not an array.
#    Use when the predicate "can we do it in T?" is monotonic (false then true).
def min_days_to_bloom(flowers: list[int], k: int) -> int:
    def can_bloom(days: int) -> bool:
        bouquets = run = 0
        for d in flowers:
            run = run + 1 if d <= days else 0
            if run == k:
                bouquets += 1
                run = 0
        return bouquets >= 1
    lo, hi = min(flowers), max(flowers)
    while lo < hi:                                # half-open [lo, hi)
        mid = (lo + hi) // 2
        if can_bloom(mid):                        # works at mid; try smaller
            hi = mid
        else:                                     # need more time
            lo = mid + 1
    return lo

# 3) FIND-FIRST-TRUE pattern — generalize "binary search on the answer"
def first_true(lo: int, hi: int, predicate) -> int:
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid): hi = mid               # mid works -> may also at smaller
        else:              lo = mid + 1            # mid doesn't -> must go bigger
    return lo                                      # smallest x where predicate is True

# 4) Off-by-one survival kit
#    - "<= hi" with hi = len-1   <-> closed interval; mid = (lo+hi)//2
#    - "<  hi" with hi = len     <-> half-open; same loop body, lo<hi
#    Pick ONE convention and stick to it. Most bugs come from mixing them.

# 5) Rotated array, peak finding, search 2D matrix — all bsearch variants.
#    Pattern: find a monotonic INVARIANT that lets you discard half each step.

# Decision rule:
#   look up in a sorted ARRAY                 -> bisect_left / bisect_right
#   keep an array sorted while inserting       -> bisect.insort
#   "minimum capacity / max threshold" Q&A     -> binary search on the answer
#   need to search by a derived key             -> bisect(..., key=...) (3.10+)
#   need exact match index                       -> bisect_left then verify a[i]==x
#   range count between lo and hi inclusive    -> bisect_right(hi) - bisect_left(lo)
#
# Anti-pattern: rolling your own "find first occurrence" with mid+/-1 boundaries
#   It's bisect_left in two characters. Avoid the off-by-one trap by reaching
#   for the stdlib first; only hand-roll when you're searching on the ANSWER.
```

## Decision Rule

```text
look up in a sorted ARRAY                 -> bisect_left / bisect_right
keep an array sorted while inserting       -> bisect.insort
"minimum capacity / max threshold" Q&A     -> binary search on the answer
need to search by a derived key             -> bisect(..., key=...) (3.10+)
need exact match index                       -> bisect_left then verify a[i]==x
range count between lo and hi inclusive    -> bisect_right(hi) - bisect_left(lo)
```

## Anti-Pattern

> [!warning] Anti-pattern
> rolling your own "find first occurrence" with mid+/-1 boundaries
>   It's bisect_left in two characters. Avoid the off-by-one trap by reaching
>   for the stdlib first; only hand-roll when you're searching on the ANSWER.

## Tips

- Use `bisect` module in production — no need to implement binary search from scratch
- `bisect_left` gives the index of the first occurrence; `bisect_right` gives one past the last
- "Binary search on the answer" — when the search space is a range of values, not an array
- `lo + (hi - lo) // 2` avoids integer overflow in other languages — fine in Python but good habit

## Common Mistake

> [!warning] Using `lo <= hi` with `mid = (lo + hi) // 2` but not handling the termination correctly. For "find first/last occurrence" the boundary conditions differ — use bisect_left/right instead.

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

- [[Sections/dsa/structures/sorting-patterns|Sorting patterns (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

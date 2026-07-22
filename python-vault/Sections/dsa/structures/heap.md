---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "heap"
title: "Heap"
category: "Structures"
subtitle: "Min-heap via heapq — negate values for max-heap"
signature_short: "heapq.heappush(h, x) | heapq.heappop(h) | h[0] to peek"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Heap"
  - "heap"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Heap

> Min-heap via heapq — negate values for max-heap

## Overview

Python's heapq module implements a min-heap. The smallest element is always at h[0]. For a max-heap, negate values. For complex objects, store (priority, item) tuples — they compare lexicographically.

## Signature

```python
heapq.heappush(h, x) | heapq.heappop(h) | h[0] to peek
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - heappush/heappop maintain a MIN-heap; h[0] is always smallest
# STRENGTHS - The minimum: O(log n) push/pop, O(1) peek
# WEAKNESSES- No max-heap, no nlargest, no key=
#
import heapq

h: list[int] = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
print(h[0])                                   # 1 — peek the min
print(heapq.heappop(h))                       # 1 — pop the min
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - heapify + nsmallest/nlargest, max-heap via negation, merge
# STRENGTHS - The four operations that solve 80% of heap problems
# WEAKNESSES- No tie-breaking; no priority-queue specifics
#
import heapq

# 1) heapify in O(n) — turns any list into a heap in place
nums = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.heapify(nums)
print(heapq.heappop(nums))                    # 1

# 2) Max-heap — Python only ships a min-heap, so NEGATE values
max_h: list[int] = []
for n in [3, 1, 4, 1, 5]:
    heapq.heappush(max_h, -n)
print(-heapq.heappop(max_h))                  # 5 (the actual max)

# 3) Top-k WITHOUT sorting — O(n log k), beats sorted() when k is small
heapq.nlargest(3, nums)                       # [9, 6, 5]
heapq.nsmallest(3, nums, key=abs)             # k closest to 0

# 4) k-way merge of sorted iterables — streaming, O(N log k)
list(heapq.merge([1, 4, 7], [2, 5, 8], [3, 6, 9]))
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# K closest points to origin
def k_closest(points: list[tuple[float, float]], k: int):
    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Tie-break with counters, heappushpop / heapreplace, "running median"
# STRENGTHS - The patterns that turn heaps into real-time analytics
# WEAKNESSES- N/A
#
import heapq
import itertools

# 1) Tie-breaking — items with equal priority should NOT be compared by value
#    Add a monotonic counter so the heap is fully deterministic.
counter = itertools.count()
pq: list[tuple[int, int, dict]] = []
def push_task(priority: int, task: dict):
    heapq.heappush(pq, (priority, next(counter), task))    # counter breaks ties
def pop_task():
    return heapq.heappop(pq)[2]

# 2) heappushpop / heapreplace — push and pop in ONE step (cheaper than two)
#    Use to maintain a "top-k" heap of size k:
def top_k_streaming(stream, k: int) -> list[int]:
    heap: list[int] = []
    for x in stream:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:                          # only swap if it can knock out smallest
            heapq.heapreplace(heap, x)             # ONE call: pop AND push
    return sorted(heap, reverse=True)

# 3) Running median — two heaps (max on the left, min on the right)
class RunningMedian:
    def __init__(self):
        self.lo: list[int] = []                    # max-heap (negated)
        self.hi: list[int] = []                    # min-heap
    def add(self, x: int):
        heapq.heappush(self.lo, -heapq.heappushpop(self.hi, x))
        if len(self.lo) > len(self.hi) + 1:
            heapq.heappush(self.hi, -heapq.heappop(self.lo))
    def median(self) -> float:
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2

# 4) heap is NOT sorted past index 0
#    The only guaranteed order is the partial-order property: each parent <= children.
#    Don't iterate h to read in sorted order; pop one at a time, or sorted(h).

# 5) For COMPLEX comparisons, store (key, tiebreak, payload) tuples — NOT a class
#    with __lt__, unless you're sure objects of equal priority should never tie.

# Decision rule:
#   ordered processing of a stream         -> heapq with (priority, counter, item)
#   bounded "top-k" memory                  -> push/replace into a size-k min-heap
#   merge sorted streams                     -> heapq.merge (lazy, doesn't load all)
#   running median / percentile (low N)     -> two heaps (max-left, min-right)
#   need to remove an arbitrary item          -> heap-with-tombstones (lazy delete)
#   thread-safe priority queue                -> queue.PriorityQueue
#
# Anti-pattern: scanning past h[0] thinking it's "the second smallest"
#   The heap's index layout is partial; h[1] is "smaller than its descendants",
#   not "second-smallest overall." Always pop or use nsmallest to get order.
```

## Decision Rule

```text
ordered processing of a stream         -> heapq with (priority, counter, item)
bounded "top-k" memory                  -> push/replace into a size-k min-heap
merge sorted streams                     -> heapq.merge (lazy, doesn't load all)
running median / percentile (low N)     -> two heaps (max-left, min-right)
need to remove an arbitrary item          -> heap-with-tombstones (lazy delete)
thread-safe priority queue                -> queue.PriorityQueue
```

## Anti-Pattern

> [!warning] Anti-pattern
> scanning past h[0] thinking it's "the second smallest"
>   The heap's index layout is partial; h[1] is "smaller than its descendants",
>   not "second-smallest overall." Always pop or use nsmallest to get order.

## Tips

- Python heapq is a MIN-heap — smallest element is always at index 0
- For max-heap, negate values: `heappush(h, -val)`, then `-heappop(h)` to get the true max
- `heapq.nlargest(k, data, key=fn)` is O(n log k) — faster than `sorted()` when k is small
- `heapq.merge(*sorted_lists)` merges k sorted iterables in O(n log k) without loading all into memory

## Common Mistake

> [!warning] Indexing heap for second-smallest: `h[1]`. A heap only guarantees `h[0]` is minimum — other positions are not sorted.

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

- [[Sections/dsa/structures/stack|Stack (Data Structures & Algos)]]
- [[Sections/dsa/structures/queue|Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/deque|Deque (Data Structures & Algos)]]
- [[Sections/dsa/structures/priority-queue|Priority Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "priority-queue"
title: "Priority Queue"
category: "Structures"
subtitle: "Store (priority, item) tuples — lowest priority number first"
signature_short: "heapq.heappush(h, (priority, item)) | heapq.heappop(h)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Priority Queue"
  - "priority-queue"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Priority Queue

> Store (priority, item) tuples — lowest priority number first

## Overview

A priority queue processes the highest-priority item first. In Python, implement with heapq using (priority, item) tuples. Lowest number = highest priority (min-heap). For equal priorities, add a tie-breaking counter to avoid comparing items.

## Signature

```python
heapq.heappush(h, (priority, item)) | heapq.heappop(h)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Push (priority, item) tuples; lowest priority pops first
# STRENGTHS - Smallest valid PQ; tuple comparison gives ordering for free
# WEAKNESSES- Breaks when items aren't comparable; senior tier fixes that
#
import heapq

tasks: list[tuple[int, str]] = []
heapq.heappush(tasks, (1, "low priority"))
heapq.heappush(tasks, (0, "urgent"))
heapq.heappush(tasks, (2, "optional"))

print(heapq.heappop(tasks))                     # (0, 'urgent')
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Tie-breaking counter, max-priority via negation, Dijkstra usage
# STRENGTHS - The shape that survives non-comparable items
# WEAKNESSES- No decrease-key handling
#
import heapq
import itertools

# 1) Tie-break — counter as MIDDLE element so items are NEVER compared
class PriorityQueue:
    def __init__(self):
        self._h: list[tuple[int, int, object]] = []
        self._tie = itertools.count()             # monotonically increasing
    def push(self, priority: int, item):
        heapq.heappush(self._h, (priority, next(self._tie), item))
    def pop(self):
        priority, _, item = heapq.heappop(self._h)
        return priority, item

pq = PriorityQueue()
pq.push(1, {"id": 1})
pq.push(1, {"id": 2})                            # SAME priority — counter breaks tie
pq.push(0, {"id": 3})
print(pq.pop())                                   # (0, {'id': 3})

# 2) Max-priority queue — negate the priority
high_first: list[tuple[int, str]] = []
heapq.heappush(high_first, (-5, "VIP"))
heapq.heappush(high_first, (-1, "normal"))
prio, item = heapq.heappop(high_first); print(-prio, item)   # 5 VIP

# 3) Dijkstra — priority queue is the engine
def dijkstra(graph, src):
    dist = {src: 0}
    pq   = [(0, src)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):     # stale entry; skip
            continue
        for nbr, w in graph[node]:
            nd = d + w
            if nd < dist.get(nbr, float("inf")):
                dist[nbr] = nd
                heapq.heappush(pq, (nd, nbr))
    return dist
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Stale-entry pattern, lazy decrease-key, thread-safe variant
# STRENGTHS - The patterns that fix heapq's missing operations
# WEAKNESSES- N/A
#
import heapq
import itertools
from queue import PriorityQueue as ThreadSafePQ

# 1) heapq has NO decrease-key — use the "stale entry" trick:
#    push the new (lower) priority; when you pop, check if it matches the
#    CURRENT distance/cost and skip stale entries.
def dijkstra_stale(graph, src):
    dist = {src: 0}
    pq   = [(0, src)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):     # ignored stale entry
            continue
        for nbr, w in graph[node]:
            nd = d + w
            if nd < dist.get(nbr, float("inf")):
                dist[nbr] = nd
                heapq.heappush(pq, (nd, nbr))    # leaves OLD entry in heap (stale)
    return dist

# 2) Lazy delete — for "remove arbitrary item" without rebuilding the heap
#    Mark a token as deleted; skip it on pop.
class CancelableQueue:
    REMOVED = object()
    def __init__(self):
        self._h: list[list] = []                  # entries are MUTABLE lists
        self._index: dict[object, list] = {}
        self._tie = itertools.count()
    def push(self, priority, item):
        entry = [priority, next(self._tie), item]
        self._index[id(item)] = entry
        heapq.heappush(self._h, entry)
    def cancel(self, item):
        entry = self._index.pop(id(item), None)
        if entry is not None:
            entry[-1] = self.REMOVED              # mark; the heap stays valid
    def pop(self):
        while self._h:
            _, _, item = heapq.heappop(self._h)
            if item is not self.REMOVED:
                self._index.pop(id(item), None)
                return item
        raise IndexError("empty")

# 3) Thread-safe priority queue — for producer/consumer code
tq = ThreadSafePQ()
tq.put((1, "task A"))
tq.put((0, "task B"))
print(tq.get())                                   # (0, 'task B')   — blocks if empty

# 4) When NOT to roll your own
#    - Need fast decrease-key on huge graphs    -> Fibonacci/pairing heap (rare in Python)
#    - Need a real priority queue across procs  -> Redis sorted set (ZADD/ZPOPMIN)
#    - Need TTL / scheduled jobs                 -> APScheduler / Celery, NOT heapq

# Decision rule:
#   simple in-process priority order        -> heapq with (priority, counter, item)
#   max-priority                              -> negate the priority
#   thread-safe                                -> queue.PriorityQueue
#   need to cancel queued items                -> lazy-delete with sentinel
#   need to lower a key after insert            -> stale-entry pattern (re-push)
#   distributed                                  -> Redis ZSET, not heapq
#
# Anti-pattern: pushing (priority, item) where item is non-comparable
#   When two priorities tie, Python compares the items — and if they don't
#   define __lt__ you get TypeError mid-run. ALWAYS use (priority, counter, item).
```

## Decision Rule

```text
simple in-process priority order        -> heapq with (priority, counter, item)
max-priority                              -> negate the priority
thread-safe                                -> queue.PriorityQueue
need to cancel queued items                -> lazy-delete with sentinel
need to lower a key after insert            -> stale-entry pattern (re-push)
distributed                                  -> Redis ZSET, not heapq
```

## Anti-Pattern

> [!warning] Anti-pattern
> pushing (priority, item) where item is non-comparable
>   When two priorities tie, Python compares the items — and if they don't
>   define __lt__ you get TypeError mid-run. ALWAYS use (priority, counter, item).

## Tips

- Always add a tie-breaking counter as the middle element: `(priority, counter, item)` — prevents errors when items are not comparable
- For max-priority-queue (highest number first), negate the priority: `heappush(h, (-priority, item))`
- Mark stale entries with a tombstone or check `d > dist[node]` rather than removing — heapq has no efficient decrease-key
- Use `queue.PriorityQueue` for thread-safe priority queues in concurrent code

## Common Mistake

> [!warning] Storing `(priority, item)` where item is a non-comparable object (like a custom class without `__lt__`). When two priorities are equal, Python tries to compare the items and raises TypeError. Always add a unique counter as the tiebreaker.

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
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "deque"
title: "Deque"
category: "Structures"
subtitle: "Sliding window buffer, undo/redo, BFS, and more"
signature_short: "deque(maxlen=n) | appendleft() | popleft() | rotate()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Deque"
  - "deque"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Deque

> Sliding window buffer, undo/redo, BFS, and more

## Overview

collections.deque is a doubly linked list with O(1) access at both ends. maxlen= creates a fixed-size circular buffer — old items drop off the other end automatically. rotate() shifts all elements.

## Signature

```python
deque(maxlen=n) | appendleft() | popleft() | rotate()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - O(1) appends and pops at BOTH ends
# STRENGTHS - Smallest valid double-ended use
# WEAKNESSES- No maxlen, no rotate
#
from collections import deque

d = deque([1, 2, 3])
d.appendleft(0)                                  # [0, 1, 2, 3]
d.append(4)                                       # [0, 1, 2, 3, 4]
print(d.popleft())                                # 0
print(d.pop())                                    # 4
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - maxlen ring buffer, rotate, sliding-window-MAX with index deque
# STRENGTHS - The two real-world patterns deque enables in O(n)
# WEAKNESSES- No discussion of indexed access cost
#
from collections import deque

# 1) maxlen — ring buffer; old items auto-drop
last3 = deque(maxlen=3)
for x in [1, 2, 3, 4, 5]:
    last3.append(x)
print(list(last3))                                # [3, 4, 5]

# 2) rotate — shift all elements (positive: right; negative: left)
d = deque([1, 2, 3, 4, 5])
d.rotate(2);   print(d)                            # deque([4, 5, 1, 2, 3])
d.rotate(-1);  print(d)                            # deque([5, 1, 2, 3, 4])

# 3) Sliding-window MAXIMUM in O(n) — store INDICES of "useful" elements
def max_window(nums: list[int], k: int) -> list[int]:
    q: deque[int] = deque()                       # indices; values are decreasing
    out = []
    for i, x in enumerate(nums):
        while q and nums[q[-1]] < x:
            q.pop()                               # newcomers can only beat older smaller ones
        q.append(i)
        if q[0] <= i - k:
            q.popleft()                           # window slid past head
        if i >= k - 1:
            out.append(nums[q[0]])                # head is always the max in [i-k+1, i]
    return out

print(max_window([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3, 3, 5, 5, 6, 7]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Performance trade-offs, monotonic deque pattern, when list wins
# STRENGTHS - The mental model that picks deque vs list correctly
# WEAKNESSES- N/A
#
from collections import deque

# 1) Performance — deque is O(1) at the ends, O(n) IN THE MIDDLE
#    list is O(1) for indexed read d[i] and O(n) at the front (pop(0))
#    Pick by where you mutate / read most.
deque_d = deque([1, 2, 3, 4])                     # NOT random-access friendly
list_l  = [1, 2, 3, 4]                            # great for d[i]

# 2) Monotonic deque — generalizes "max of last k" to many sliding-window problems
#    - max:    pop right while smaller
#    - min:    pop right while larger
#    - same family solves: shortest subarray with sum >= K, jump-game, etc.
def min_window(nums, k):
    q: deque[int] = deque()
    out = []
    for i, x in enumerate(nums):
        while q and nums[q[-1]] > x:               # FLIP comparison for min
            q.pop()
        q.append(i)
        if q[0] <= i - k: q.popleft()
        if i >= k - 1: out.append(nums[q[0]])
    return out

# 3) Iterative DFS with deque used as a STACK (no extra import needed)
def dfs_iter(graph, start):
    seen, stack = set(), deque([start])
    while stack:
        node = stack.pop()                         # right-end pop -> LIFO
        if node in seen: continue
        seen.add(node)
        stack.extend(reversed(graph.get(node, ())))
    return seen

# 4) Don't use deque if you need INDEX SLICING — list is O(k) for d[i:j], deque isn't.
#    Convert at the boundary: list(d) is O(n).

# Decision rule:
#   FIFO with O(1) at both ends           -> deque
#   ring buffer "last N items"             -> deque(maxlen=N)
#   sliding-window min/max in O(n)         -> monotonic deque of INDICES
#   random index reads (d[i] often)         -> list
#   thread-safe                              -> queue.Queue (NOT deque)
#   thread-safe rotate / cycle               -> use a Lock around deque
#
# Anti-pattern: deque[i] in a hot loop
#   Each access is O(n) — much slower than list[i]. If you need both ends-fast
#   AND indexed reads, materialize the deque to a list when reads dominate.
```

## Decision Rule

```text
FIFO with O(1) at both ends           -> deque
ring buffer "last N items"             -> deque(maxlen=N)
sliding-window min/max in O(n)         -> monotonic deque of INDICES
random index reads (d[i] often)         -> list
thread-safe                              -> queue.Queue (NOT deque)
thread-safe rotate / cycle               -> use a Lock around deque
```

## Anti-Pattern

> [!warning] Anti-pattern
> deque[i] in a hot loop
>   Each access is O(n) — much slower than list[i]. If you need both ends-fast
>   AND indexed reads, materialize the deque to a list when reads dominate.

## Tips

- `deque(maxlen=n)` is the cleanest fixed-size sliding window — old items auto-drop
- `rotate(n)` rotates right for positive n, left for negative — in O(n) time
- Deque is O(n) for random access by index — use list if you need frequent middle access
- Works as both stack and queue — call the right end for the right behavior

## Common Mistake

> [!warning] Using deque for random index access: `d[i]`. Unlike lists, deque is O(n) for middle access. If you need frequent indexed access, use a list instead.

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
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/priority-queue|Priority Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "queue"
title: "Queue"
category: "Structures"
subtitle: "Use collections.deque — never list.pop(0)"
signature_short: "from collections import deque; q.append(x); q.popleft()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Queue"
  - "queue"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Queue

> Use collections.deque — never list.pop(0)

## Overview

Use collections.deque for queues — it has O(1) append and popleft from both ends. A plain list has O(n) pop(0) because it shifts every element. For thread-safe producer/consumer patterns use queue.Queue.

## Signature

```python
from collections import deque; q.append(x); q.popleft()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - deque.append + deque.popleft = O(1) FIFO
# STRENGTHS - Smallest valid queue; the right primitive
# WEAKNESSES- No BFS, no thread-safe variant
#
from collections import deque

q = deque()
q.append(1); q.append(2); q.append(3)            # enqueue at the right
print(q.popleft())                                # 1 — FIFO dequeue
print(q[0])                                       # peek without removing
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - BFS using a queue, level-by-level
# STRENGTHS - The canonical use case for FIFO
# WEAKNESSES- No thread-safe queue; no async queue
#
from collections import deque

def bfs(graph: dict[int, list[int]], start: int) -> list[int]:
    visited = {start}
    q       = deque([start])
    order   = []
    while q:
        node = q.popleft()                        # FIFO -> visits by distance
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                q.append(nxt)
    return order

graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
print(bfs(graph, 0))                              # [0, 1, 2, 3]

# Shortest path in an UNWEIGHTED graph — track parents during BFS
def shortest_path(graph, src, dst):
    parent: dict[int, int | None] = {src: None}
    q = deque([src])
    while q:
        n = q.popleft()
        if n == dst:
            path = []
            while n is not None:
                path.append(n); n = parent[n]
            return list(reversed(path))
        for nxt in graph[n]:
            if nxt not in parent:
                parent[nxt] = n
                q.append(nxt)
    return None
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pick the right queue: deque vs queue.Queue vs asyncio.Queue
# STRENGTHS - The decision matrix that prevents the wrong primitive
# WEAKNESSES- N/A
#
from collections import deque

# 1) collections.deque — FAST, in one thread, no synchronization
#    O(1) at both ends; constant-factor faster than queue.Queue
q = deque(maxlen=1000)                            # bounded ring buffer

# 2) queue.Queue — THREAD-safe FIFO; producers / consumers across threads
from queue import Queue, Empty
tq: Queue[int] = Queue(maxsize=100)
def producer():
    tq.put(42, timeout=5)                         # blocks if full -> backpressure
def consumer():
    try:    item = tq.get(timeout=5)              # blocks until item available
    except Empty: return None
    finally: tq.task_done()                       # pair every get() with task_done()

# 3) asyncio.Queue — async-aware; works with await; NOT thread-safe by itself
import asyncio
async def aworker(q: asyncio.Queue):
    while True:
        item = await q.get()                       # cooperative, non-blocking
        try:    await handle(item)
        finally: q.task_done()

# 4) multiprocessing.Queue — across processes; serializes via pickle
from multiprocessing import Queue as MPQueue
mq = MPQueue()                                     # IPC-safe; pickled hop per put/get

# 5) PriorityQueue — when you need ordering, not arrival
from queue import PriorityQueue
pq = PriorityQueue()
pq.put((1, "urgent"))
pq.put((10, "low"))
print(pq.get())                                    # (1, 'urgent')

# Decision rule:
#   single-threaded FIFO                  -> collections.deque (fastest)
#   producer/consumer across threads       -> queue.Queue
#   producer/consumer across coroutines    -> asyncio.Queue
#   producer/consumer across processes     -> multiprocessing.Queue
#   ordered processing (urgency)            -> queue.PriorityQueue / heapq
#   bounded ring buffer (last N)            -> deque(maxlen=N)
#
# Anti-pattern: list.pop(0) for a queue
#   O(n) — every dequeue physically shifts the rest. Even on tiny inputs the
#   overhead is unnecessary. deque.popleft() is O(1) and safer.

async def handle(_): pass
```

## Decision Rule

```text
single-threaded FIFO                  -> collections.deque (fastest)
producer/consumer across threads       -> queue.Queue
producer/consumer across coroutines    -> asyncio.Queue
producer/consumer across processes     -> multiprocessing.Queue
ordered processing (urgency)            -> queue.PriorityQueue / heapq
bounded ring buffer (last N)            -> deque(maxlen=N)
```

## Anti-Pattern

> [!warning] Anti-pattern
> list.pop(0) for a queue
>   O(n) — every dequeue physically shifts the rest. Even on tiny inputs the
>   overhead is unnecessary. deque.popleft() is O(1) and safer.

## Tips

- `deque.popleft()` is O(1); `list.pop(0)` is O(n) — always use deque for queues
- `queue.Queue` is thread-safe; `collections.deque` is not — use the right one for your context
- Deque supports both ends: `appendleft` / `popleft` on the left, `append` / `pop` on the right
- BFS always uses a queue; DFS always uses a stack (or recursion)

## Common Mistake

> [!warning] Using `list.pop(0)` for a queue. This is O(n) — it physically shifts every remaining element. Use `deque.popleft()` for O(1).

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
- [[Sections/dsa/structures/deque|Deque (Data Structures & Algos)]]
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/priority-queue|Priority Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "collections-deque"
title: "collections.deque"
category: "Standard Library"
subtitle: "Use instead of list when you need O(1) ops at both ends"
signature_short: "from collections import deque | deque(maxlen=n)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "collections.deque"
  - "collections-deque"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# collections.deque

> Use instead of list when you need O(1) ops at both ends

## Overview

collections.deque provides O(1) append and pop from both ends — unlike list which is O(n) for operations at the front. Essential for queues, sliding windows, and BFS. maxlen= creates a fixed-size circular buffer.

## Signature

```python
from collections import deque | deque(maxlen=n)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - deque gives O(1) append AND popleft; list.pop(0) is O(n).
# STRENGTHS - The right data structure for queues and BFS; one-line FIFO.
# WEAKNESSES- Random access (d[i]) is O(n) — use list when index access dominates.
from collections import deque

q = deque()
q.append(1); q.append(2)
q.popleft()              # 1   (O(1))
q.pop()                  # 2   (O(1) on the right end too)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - maxlen= for circular buffers (sliding window, last-N log); rotate for ring patterns; extendleft pushes reversed.
# STRENGTHS - O(1) both ends; bounded memory with maxlen; ideal for streaming data.
# WEAKNESSES- maxlen silently drops items when full -- log this if you care.
from collections import deque

# Rolling N-sized window over a stream.
window = deque(maxlen=3)
for x in [1, 2, 3, 4, 5]:
    window.append(x)
    # window holds the LAST 3: [1], [1,2], [1,2,3], [2,3,4], [3,4,5]

# extendleft reverses the input order (each item is appendlefted in turn).
d = deque([1, 2, 3])
d.extendleft([0, -1])    # deque([-1, 0, 1, 2, 3])

# rotate(n)  -> rotates n steps to the right (use negative for left).
r = deque([1, 2, 3, 4, 5])
r.rotate(2)              # deque([4, 5, 1, 2, 3])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - deque for BFS, sliding-window stats, and bounded log buffers; never as a list substitute for indexed access.
# STRENGTHS - O(1) ends, fixed-memory windows, thread-safe append/popleft (atomic in CPython).
# WEAKNESSES- Locking still required for multi-step operations; len()+pop is two ops.
from __future__ import annotations
from collections import deque
from collections.abc import Iterable, Iterator

def bfs[T](start: T, neighbors) -> Iterator[T]:
    seen, q = {start}, deque([start])
    while q:
        node = q.popleft()                 # O(1) — required for BFS to be linear
        yield node
        for n in neighbors(node):
            if n not in seen:
                seen.add(n); q.append(n)

def tail_lines(path: str, n: int = 100) -> list[str]:
    """Last N lines without reading the whole file into memory."""
    with open(path) as f:
        return list(deque(f, maxlen=n))    # deque consumes the iterator; keeps last n

# Decision rule:
#   queue / BFS                    -> deque (popleft = O(1); list = O(n))
#   sliding window of size N       -> deque(maxlen=N)
#   "last N items" (logs, errors)  -> deque(maxlen=N) feeding from a stream
#   stack only                     -> list (append/pop are both O(1))
#   index lookups d[i]             -> list (deque is O(n) at the middle)
#   thread-safe FIFO               -> queue.Queue (deque ops are atomic but compound steps aren't)
#
# Anti-pattern: while items: x = items.pop(0) for queue semantics. Each pop(0)
# is O(n); the loop is O(n^2). Use deque.popleft() — that's the whole reason
# the type exists.
```

## Decision Rule

```text
queue / BFS                    -> deque (popleft = O(1); list = O(n))
sliding window of size N       -> deque(maxlen=N)
"last N items" (logs, errors)  -> deque(maxlen=N) feeding from a stream
stack only                     -> list (append/pop are both O(1))
index lookups d[i]             -> list (deque is O(n) at the middle)
thread-safe FIFO               -> queue.Queue (deque ops are atomic but compound steps aren't)
```

## Anti-Pattern

> [!warning] Anti-pattern
> while items: x = items.pop(0) for queue semantics. Each pop(0)
> is O(n); the loop is O(n^2). Use deque.popleft() — that's the whole reason
> the type exists.

## Tips

- Use deque when you need O(1) popleft — list.pop(0) is O(n) and causes performance issues in loops
- maxlen=n creates a circular buffer — old items drop off automatically
- BFS always uses a deque — O(1) popleft is critical for performance
- deque is O(n) for random index access — use list if you need d[i] frequently

## Common Mistake

> [!warning] Using list.pop(0) in a loop to simulate a queue. This is O(n) per operation, O(n²) total. Use deque.popleft() for O(1).

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

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/json-module|json module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

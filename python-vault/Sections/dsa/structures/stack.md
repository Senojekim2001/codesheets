---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "stack"
title: "Stack"
category: "Structures"
subtitle: "Use a list — append() pushes, pop() pops from the top"
signature_short: "stack.append(x) | stack.pop() | stack[-1]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Stack"
  - "stack"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Stack

> Use a list — append() pushes, pop() pops from the top

## Overview

A stack follows LIFO order. Python lists work perfectly as stacks — append() pushes, pop() removes from the top. For thread safety use queue.LifoQueue.

## Signature

```python
stack.append(x) | stack.pop() | stack[-1]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - A list IS a stack: append() pushes, pop() pops
# STRENGTHS - Smallest valid stack; O(1) amortized for both
# WEAKNESSES- No real-world use case; no peek discussion
#
stack = []
stack.append(1)            # push
stack.append(2)
stack.append(3)

print(stack[-1])           # 3 — peek (no removal)
print(stack.pop())         # 3 — pop from top
print(stack)               # [1, 2]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two classic uses: balanced parens, postfix eval
# STRENGTHS - Shows the LIFO mental model on real problems
# WEAKNESSES- No monotonic stack patterns yet
#
def is_balanced(s: str) -> bool:
    pair = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif c in ")]}":
            if not stack or stack.pop() != pair[c]:
                return False
    return not stack                            # empty == fully matched

print(is_balanced("([{}])"))                    # True
print(is_balanced("([)]"))                      # False

def eval_postfix(expr: str) -> int:
    """Evaluate Reverse Polish Notation: '2 3 + 4 *' -> 20."""
    stack: list[int] = []
    OPS = {"+": int.__add__, "-": int.__sub__, "*": int.__mul__, "/": int.__floordiv__}
    for tok in expr.split():
        if tok in OPS:
            b, a = stack.pop(), stack.pop()       # second pop is FIRST operand
            stack.append(OPS[tok](a, b))
        else:
            stack.append(int(tok))
    return stack[0]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Monotonic stack pattern; iterative DFS that beats recursion
# STRENGTHS - The patterns that turn "use a stack" into a real interview tool
# WEAKNESSES- N/A
#
# 1) MONOTONIC STACK — "next greater element" in O(n)
#    Maintain a stack whose values are STRICTLY decreasing from bottom to top.
#    When a bigger value arrives, pop everything smaller and resolve their answers.
def next_greater(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [-1] * n
    stack: list[int] = []                        # holds INDICES, not values
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            out[stack.pop()] = x
        stack.append(i)
    return out
# next_greater([2, 1, 2, 4, 3])  -> [4, 2, 4, -1, -1]

# 2) ITERATIVE DFS — avoid Python's ~1000 recursion limit
def dfs(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()                       # pop from TOP -> LIFO -> DFS
        if node in visited: continue
        visited.add(node)
        # reverse so neighbors are visited in declared order
        stack.extend(reversed(graph.get(node, ())))
    return visited

# 3) Thread-safe stack — queue.LifoQueue in producer/consumer code
# from queue import LifoQueue
# q = LifoQueue(); q.put(1); q.get()           # blocks until item available

# Decision rule:
#   simple LIFO                        -> list with append/pop
#   thread-safe LIFO                   -> queue.LifoQueue
#   "next greater / smaller" problem    -> monotonic stack of INDICES
#   tree/graph DFS, deep input          -> iterative stack, NOT recursion
#   parsing nested structure            -> stack of "open" markers
#
# Anti-pattern: stack.pop(0)
#   That removes from the FRONT and is O(n) — it shifts every other element.
#   pop() (no args) removes from the TOP and is O(1). They are not interchangeable.
```

## Decision Rule

```text
simple LIFO                        -> list with append/pop
thread-safe LIFO                   -> queue.LifoQueue
"next greater / smaller" problem    -> monotonic stack of INDICES
tree/graph DFS, deep input          -> iterative stack, NOT recursion
parsing nested structure            -> stack of "open" markers
```

## Anti-Pattern

> [!warning] Anti-pattern
> stack.pop(0)
>   That removes from the FRONT and is O(n) — it shifts every other element.
>   pop() (no args) removes from the TOP and is O(1). They are not interchangeable.

## Tips

- Python list as stack is O(1) amortized for both append and pop
- `stack[-1]` peeks the top without removing — no separate peek method needed
- For thread-safe stacks use `queue.LifoQueue`
- Stacks power: function call frames, undo operations, DFS, expression parsing

## Common Mistake

> [!warning] Using `list.pop(0)` thinking it pops from the "top". `pop(0)` is O(n) and removes from the front (bottom). A stack pops from the back (top): `list.pop()`.

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

- [[Sections/dsa/structures/queue|Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/deque|Deque (Data Structures & Algos)]]
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/priority-queue|Priority Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

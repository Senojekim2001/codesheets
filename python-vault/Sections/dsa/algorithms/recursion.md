---
type: "entry"
domain: "python"
file: "dsa"
section: "algorithms"
id: "recursion"
title: "Recursion"
category: "Patterns"
subtitle: "Base case + recursive case — watch stack depth and memoization"
signature_short: "def fn(n): if base_case: return val; return fn(n-1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Recursion"
  - "recursion"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/algorithms"
  - "category/patterns"
  - "tier/tiered"
---

# Recursion

> Base case + recursive case — watch stack depth and memoization

## Overview

Recursion breaks a problem into a base case (trivially solved) and a recursive case (reduces toward the base). Python's default recursion limit is 1000 — use sys.setrecursionlimit() or convert to iteration for deep recursion.

## Signature

```python
def fn(n): if base_case: return val; return fn(n-1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Base case + recursive case = ALL recursion has these two parts
# STRENGTHS - Smallest valid recursive function
# WEAKNESSES- No memoization; no iterative comparison
#
def factorial(n: int) -> int:
    if n <= 1:                                    # BASE CASE — exit condition
        return 1
    return n * factorial(n - 1)                   # RECURSIVE CASE — toward base

print(factorial(5))                                # 120
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Tree traversal, backtracking (subsets/permutations), iterative conversion
# STRENGTHS - The three patterns where recursion shines
# WEAKNESSES- No tail-call discussion (Python doesn't optimize them anyway)
#
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

# 1) Tree traversal — naturally recursive
def inorder(node) -> list:
    if not node: return []
    return inorder(node.left) + [node.val] + inorder(node.right)

def max_depth(node) -> int:
    if not node: return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

# 2) Backtracking — build/explore choices, undo on backtrack
def subsets(nums: list[int]) -> list[list[int]]:
    out, cur = [], []
    def backtrack(i: int):
        if i == len(nums):
            out.append(cur.copy())                # SNAPSHOT — cur is mutated below
            return
        # exclude nums[i]
        backtrack(i + 1)
        # include nums[i]
        cur.append(nums[i])
        backtrack(i + 1)
        cur.pop()                                  # undo on backtrack
    backtrack(0)
    return out

print(subsets([1, 2, 3]))                          # 8 subsets

# 3) Convert to iteration with explicit stack — for big inputs
def inorder_iter(root):
    stack, out = [], []
    cur = root
    while cur or stack:
        while cur:                                # go left
            stack.append(cur); cur = cur.left
        cur = stack.pop()                         # process
        out.append(cur.val)
        cur = cur.right                           # go right
    return out
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Memoization, recursion limit, tail-recursion-as-iteration, divide & conquer
# STRENGTHS - The patterns that turn recursion from "elegant" to "scalable"
# WEAKNESSES- N/A
#
import sys
from functools import lru_cache

# 1) MEMOIZATION — turns exponential recursion into linear
@lru_cache(maxsize=None)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
# fib(100) without lru_cache: ~10^20 calls. With it: 100 calls.

# 2) RECURSION LIMIT — Python's default is ~1000. Raise it OR convert to iteration.
sys.setrecursionlimit(10_000)                     # use SPARINGLY
# Better: rewrite as iteration when you know the depth is data-dependent.

# 3) Python has NO tail-call optimization — tail recursion blows the stack.
#    Convert to a loop manually:
def factorial_tail(n, acc=1):                      # TAIL recursion (looks elegant)
    return acc if n <= 1 else factorial_tail(n - 1, n * acc)
def factorial_iter(n):                             # but this is what you SHIP
    acc = 1
    for i in range(2, n + 1): acc *= i
    return acc

# 4) DIVIDE & CONQUER — recursion shines when problem halves
def merge_sort(a: list[int]) -> list[int]:
    if len(a) <= 1: return a
    mid = len(a) // 2
    left  = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: out.append(left[i]);  i += 1
        else:                    out.append(right[j]); j += 1
    out.extend(left[i:]); out.extend(right[j:])
    return out

# 5) MUTUAL recursion / co-recursion — two functions calling each other.
#    Trampolining (loop + state machine) is how to make this iterative if depth is huge.

# 6) When DP recursion uses a list/dict in the args -> NOT cacheable (unhashable)
#    Convert lists to tuples at the boundary, or use bottom-up tabulation.

# Decision rule:
#   tree / DAG traversal                       -> recursion
#   "all subsets / permutations / combos"      -> recursion + backtracking
#   overlapping subproblems                      -> recursion + @lru_cache
#   depth could exceed ~1000                    -> iterate, OR setrecursionlimit
#   tail-recursive shape                          -> rewrite as a loop (no TCO in Python)
#   divide-and-conquer                           -> recursion (merge sort, quickselect)
#   data-shaped LIKE a recursion problem        -> consider iterative DP or BFS instead
#
# Anti-pattern: missing OR weaker base case
#   Infinite recursion -> RecursionError. Always write the base case FIRST and
#   verify that every recursive call moves strictly toward it.
```

## Decision Rule

```text
tree / DAG traversal                       -> recursion
"all subsets / permutations / combos"      -> recursion + backtracking
overlapping subproblems                      -> recursion + @lru_cache
depth could exceed ~1000                    -> iterate, OR setrecursionlimit
tail-recursive shape                          -> rewrite as a loop (no TCO in Python)
divide-and-conquer                           -> recursion (merge sort, quickselect)
data-shaped LIKE a recursion problem        -> consider iterative DP or BFS instead
```

## Anti-Pattern

> [!warning] Anti-pattern
> missing OR weaker base case
>   Infinite recursion -> RecursionError. Always write the base case FIRST and
>   verify that every recursive call moves strictly toward it.

## Tips

- Always define the base case first — it is the exit condition that prevents infinite recursion
- Python default recursion limit is 1000 — convert to iteration for depth > 1000
- Tree problems are naturally recursive — the base case is usually `if not node: return`
- Add `@lru_cache(None)` to any recursive function with overlapping subproblems

## Common Mistake

> [!warning] Forgetting the base case or writing it wrong, causing infinite recursion and `RecursionError`. Write the base case first, test it separately, then write the recursive case.

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

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing (Caching)]]
- [[Sections/dsa/algorithms/_Index|Data Structures & Algos → Algorithm Patterns & Complexity]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

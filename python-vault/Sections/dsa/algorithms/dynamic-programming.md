---
type: "entry"
domain: "python"
file: "dsa"
section: "algorithms"
id: "dynamic-programming"
title: "Dynamic Programming"
category: "Patterns"
subtitle: "Cache results — @lru_cache for top-down, dp[] for bottom-up"
signature_short: "@lru_cache(None) def dp(n): ... | dp = [0] * n"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dynamic Programming"
  - "dynamic-programming"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/algorithms"
  - "category/patterns"
  - "tier/tiered"
---

# Dynamic Programming

> Cache results — @lru_cache for top-down, dp[] for bottom-up

## Overview

Dynamic programming caches results of overlapping subproblems. Top-down (memoization) uses recursion + cache. Bottom-up (tabulation) builds a table iteratively. Start with top-down to get correctness, then optimize with bottom-up if needed.

## Signature

```python
@lru_cache(None) def dp(n): ... | dp = [0] * n
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Top-down memoization with @lru_cache
# STRENGTHS - Smallest valid DP — write the recursion, add the cache
# WEAKNESSES- No tabulation; no space optimization
#
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2: return n                            # base case
    return fib(n - 1) + fib(n - 2)                # without lru_cache: O(2^n)

print(fib(50))                                     # instant; without cache, hours
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Tabulation, space optimization, the canonical 1D DP problem
# STRENGTHS - The progression: top-down -> bottom-up -> O(1) space
# WEAKNESSES- No 2D DP yet
#
# 1) BOTTOM-UP tabulation — same logic, no recursion
def fib_tab(n: int) -> int:
    if n < 2: return n
    dp = [0] * (n + 1); dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# 2) SPACE-OPTIMIZED — keep only the rows you actually use
def fib_o1(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

# 3) Coin change — minimum coins for an amount (unbounded knapsack)
def coin_change(coins: list[int], amount: int) -> int:
    INF = amount + 1                              # sentinel: "more than possible"
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x:
                dp[x] = min(dp[x], dp[x - c] + 1)
    return -1 if dp[amount] == INF else dp[amount]

print(coin_change([1, 2, 5], 11))                  # 3 (5+5+1)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - State design, 2D DP, rolling-array space, top-down vs bottom-up tradeoffs
# STRENGTHS - The mental model that turns a problem into a DP recurrence
# WEAKNESSES- N/A
#
from functools import lru_cache

# 1) DP STATE DESIGN — what changes between recursive calls?
#    state = the args of your recursion. Cache key = the state.
#    Examples:
#       fib(n)                     -> state = n          -> 1D dp
#       knapsack(i, capacity)      -> state = (i, cap)   -> 2D dp
#       edit_distance(i, j)        -> state = (i, j)     -> 2D dp

# 2) 2D DP — Longest Common Subsequence
def lcs(a: str, b: str) -> int:
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n):
        for j in range(m):
            if a[i] == b[j]:
                dp[i + 1][j + 1] = dp[i][j] + 1
            else:
                dp[i + 1][j + 1] = max(dp[i + 1][j], dp[i][j + 1])
    return dp[n][m]

# 3) ROLLING ARRAY — only previous row needed -> O(m) space instead of O(n*m)
def lcs_optim(a: str, b: str) -> int:
    prev = [0] * (len(b) + 1)
    for i, ca in enumerate(a):
        cur = [0] * (len(b) + 1)
        for j, cb in enumerate(b):
            cur[j + 1] = prev[j] + 1 if ca == cb else max(cur[j], prev[j + 1])
        prev = cur
    return prev[-1]

# 4) Longest Increasing Subsequence — O(n log n) with patience sorting
import bisect
def lis(nums: list[int]) -> int:
    tails: list[int] = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails): tails.append(x)
        else:               tails[i] = x          # replace; tails stays sorted
    return len(tails)

# 5) TOP-DOWN vs BOTTOM-UP — pick by the shape of the state graph
#    Top-down (@lru_cache): cleaner, easy to write, only computes REACHED states
#    Bottom-up (table):     usually 2-5x faster, allows space optimization, no recursion limit
#    Start top-down for correctness; convert to bottom-up if you need speed/memory.

# 6) When you can convert to ITERATION with O(1) space
#    If dp[i] depends only on dp[i-1] and dp[i-2] (or a fixed window), keep
#    only those values, not the whole array.

# Decision rule:
#   "looks recursive but exponential"          -> @lru_cache(maxsize=None)
#   need speed / no recursion                  -> bottom-up tabulation
#   only previous row matters                  -> rolling array (O(m) not O(n*m))
#   can derive a closed form                    -> use it; DP is overkill
#   LIS / longest increasing                    -> bisect-based O(n log n)
#   problem doesn't have overlapping subproblems -> NOT DP; greedy or D&C
#
# Anti-pattern: re-running the recursion in TESTS without cache_clear()
#   The cache persists across tests. Either decorate locally inside the function
#   under test, or call fn.cache_clear() in test setup.
```

## Decision Rule

```text
"looks recursive but exponential"          -> @lru_cache(maxsize=None)
need speed / no recursion                  -> bottom-up tabulation
only previous row matters                  -> rolling array (O(m) not O(n*m))
can derive a closed form                    -> use it; DP is overkill
LIS / longest increasing                    -> bisect-based O(n log n)
problem doesn't have overlapping subproblems -> NOT DP; greedy or D&C
```

## Anti-Pattern

> [!warning] Anti-pattern
> re-running the recursion in TESTS without cache_clear()
>   The cache persists across tests. Either decorate locally inside the function
>   under test, or call fn.cache_clear() in test setup.

## Tips

- Start with `@lru_cache` top-down — get it correct first, optimize later if needed
- Identify the DP state: what changes between recursive calls? That is your table dimension
- Space optimize by keeping only the rows you need (often just current + previous)
- DP = recursion + memoization. If you can write the recursion, adding `@lru_cache` gives you DP

## Common Mistake

> [!warning] Plain recursion on overlapping subproblems — `fib(50)` without memoization makes 2^50 calls. Add `@lru_cache(None)` or convert to tabulation.

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
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing (Caching)]]
- [[Sections/dsa/algorithms/_Index|Data Structures & Algos → Algorithm Patterns & Complexity]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

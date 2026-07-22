---
type: "entry"
domain: "python"
file: "dsa"
section: "algorithms"
id: "sliding-window"
title: "Sliding Window"
category: "Patterns"
subtitle: "Expand right, shrink left — maintain a running state"
signature_short: "left = 0; for right in range(len(arr)): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sliding Window"
  - "sliding-window"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/algorithms"
  - "category/patterns"
  - "tier/tiered"
---

# Sliding Window

> Expand right, shrink left — maintain a running state

## Overview

Sliding window solves subarray/substring problems in O(n) by maintaining a window of elements. Expand the right pointer to include more; shrink the left pointer when the window violates a constraint. Maintain a running state rather than recomputing from scratch each step.

## Signature

```python
left = 0; for right in range(len(arr)): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Fixed-size window: slide and update incrementally
# STRENGTHS - The minimum: O(n) instead of O(n*k) by reusing the running sum
# WEAKNESSES- No variable-size window
#
def max_sum_k(nums: list[int], k: int) -> int:
    window = sum(nums[:k])                        # initial window
    best   = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]            # add new, drop old: O(1) per step
        best    = max(best, window)
    return best

print(max_sum_k([2, 1, 5, 1, 3, 2], 3))           # 9 (5+1+3)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Variable window with constraint shrinking from the LEFT
# STRENGTHS - The pattern that powers most subarray/substring problems
# WEAKNESSES- No multi-state window
#
def longest_no_repeat(s: str) -> int:
    last: dict[str, int] = {}                     # char -> last index seen
    left = best = 0
    for right, ch in enumerate(s):
        # If the char was seen INSIDE the current window, shrink from the left
        if ch in last and last[ch] >= left:
            left = last[ch] + 1                   # jump past the prior occurrence
        last[ch] = right
        best = max(best, right - left + 1)
    return best

print(longest_no_repeat("abcabcbb"))              # 3 ("abc")
print(longest_no_repeat("pwwkew"))                # 3 ("wke")

# At-most-K-distinct chars — same expand/shrink shape, different invariant
from collections import Counter
def at_most_k(s: str, k: int) -> int:
    cnt: Counter[str] = Counter()
    left = best = 0
    for right, ch in enumerate(s):
        cnt[ch] += 1
        while len(cnt) > k:                       # invariant: at most k distinct
            cnt[s[left]] -= 1
            if cnt[s[left]] == 0: del cnt[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Min-window covering, monotonic deque for window max, "exactly k" trick
# STRENGTHS - The patterns that solve the hardest sliding-window problems
# WEAKNESSES- N/A
#
from collections import Counter, deque

# 1) MIN WINDOW SUBSTRING — smallest window containing all chars of t
def min_window(s: str, t: str) -> str:
    need = Counter(t)
    missing = len(t)
    lo = best_lo = best_hi = 0
    for hi, ch in enumerate(s, 1):
        if need[ch] > 0: missing -= 1             # only count if still needed
        need[ch] -= 1
        if missing == 0:
            # SHRINK left while still valid
            while need[s[lo]] < 0:
                need[s[lo]] += 1
                lo += 1
            if best_hi == 0 or hi - lo < best_hi - best_lo:
                best_lo, best_hi = lo, hi
            # Move left past one needed char to invalidate, continue search
            need[s[lo]] += 1
            missing += 1
            lo += 1
    return s[best_lo:best_hi]

# 2) WINDOW MAXIMUM — monotonic deque (covered in deque entry; recap here)
def max_in_window(nums: list[int], k: int) -> list[int]:
    q: deque[int] = deque()                       # indices, values DECREASING
    out = []
    for i, x in enumerate(nums):
        while q and nums[q[-1]] < x: q.pop()
        q.append(i)
        if q[0] <= i - k: q.popleft()
        if i >= k - 1: out.append(nums[q[0]])
    return out

# 3) "EXACTLY K" trick — count(exactly k) = count(at most k) - count(at most k-1)
#    A common tactic when "exactly K distinct" is hard but "at most K" is easy.
def subarrays_with_k_distinct(nums: list[int], k: int) -> int:
    def at_most(k):
        cnt: Counter = Counter()
        left = total = 0
        for right, x in enumerate(nums):
            cnt[x] += 1
            while len(cnt) > k:
                cnt[nums[left]] -= 1
                if cnt[nums[left]] == 0: del cnt[nums[left]]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)

# Decision rule:
#   sum / max / min over fixed window         -> O(1) per step incremental update
#   "longest / shortest valid window"          -> variable window; expand right, shrink left
#   window MAX/MIN in O(n)                      -> monotonic deque of indices
#   "exactly K distinct"                          -> at_most(K) - at_most(K-1)
#   needs to UNDO partial work on shrink         -> Counter/dict, decrement on left++
#
# Anti-pattern: recomputing the window from scratch each step
#   That makes it O(n*k) and defeats the entire point. Maintain a running sum,
#   counter, or deque so each shift is O(1) amortized.
```

## Decision Rule

```text
sum / max / min over fixed window         -> O(1) per step incremental update
"longest / shortest valid window"          -> variable window; expand right, shrink left
window MAX/MIN in O(n)                      -> monotonic deque of indices
"exactly K distinct"                          -> at_most(K) - at_most(K-1)
needs to UNDO partial work on shrink         -> Counter/dict, decrement on left++
```

## Anti-Pattern

> [!warning] Anti-pattern
> recomputing the window from scratch each step
>   That makes it O(n*k) and defeats the entire point. Maintain a running sum,
>   counter, or deque so each shift is O(1) amortized.

## Tips

- Fixed window: slide by adding the new right element and removing the outgoing left element
- Variable window: expand until the constraint is violated, then shrink left until it is satisfied again
- Track a running counter or sum — never recompute the window from scratch on each step
- Common constraints: at most k distinct chars, sum equals target, all chars of t present

## Common Mistake

> [!warning] Recomputing the window result from scratch each step — O(n·k) instead of O(n). Track a running total and update incrementally: `window += nums[right] - nums[right-k]`.

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
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing (Caching)]]
- [[Sections/dsa/algorithms/_Index|Data Structures & Algos → Algorithm Patterns & Complexity]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

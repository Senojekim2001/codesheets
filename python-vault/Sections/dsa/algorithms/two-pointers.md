---
type: "entry"
domain: "python"
file: "dsa"
section: "algorithms"
id: "two-pointers"
title: "Two Pointers"
category: "Patterns"
subtitle: "Start at both ends and move inward — requires sorted input"
signature_short: "lo, hi = 0, len(arr)-1; while lo < hi: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Two Pointers"
  - "two-pointers"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/algorithms"
  - "category/patterns"
  - "tier/tiered"
---

# Two Pointers

> Start at both ends and move inward — requires sorted input

## Overview

Two pointers solve many array problems in O(n) instead of O(n²). One pointer starts at each end and they move toward each other based on the comparison. Requires sorted input for pair-sum problems.

## Signature

```python
lo, hi = 0, len(arr)-1; while lo < hi: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Two indexes from opposite ends; converge on a sum
# STRENGTHS - Smallest valid two-pointer; needs sorted input
# WEAKNESSES- No fast/slow variant; no in-place patterns
#
def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target: return [lo, hi]
        if s < target:  lo += 1                   # need bigger sum -> move LO up
        else:           hi -= 1                   # need smaller   -> move HI down
    return []

print(two_sum_sorted([1, 3, 4, 5, 7, 11], 9))     # [1, 4]  (3 + 7)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Same-direction (slow/fast) for in-place dedup; opposite-end for palindrome
# STRENGTHS - The two flavors of two-pointer that solve most problems
# WEAKNESSES- No three-sum / four-sum extension yet
#
# 1) SAME DIRECTION — slow/fast partitioning (in-place dedup of sorted array)
def dedup_sorted(nums: list[int]) -> int:
    if not nums: return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1                               # length of unique prefix

a = [1, 1, 2, 3, 3, 4]
n = dedup_sorted(a); print(a[:n])                  # [1, 2, 3, 4]

# 2) OPPOSITE ENDS — palindrome / reverse / sum-target
def is_palindrome(s: str) -> bool:
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if s[lo] != s[hi]: return False
        lo += 1; hi -= 1
    return True

# 3) FAST/SLOW on linked list — cycle detect (Floyd's)
class Node:
    def __init__(self, val, nxt=None): self.val, self.next = val, nxt
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast: return True
    return False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - 3-sum, partition, "Dutch flag" — generalize the pattern
# STRENGTHS - The harder problems where two-pointer beats sort+hash
# WEAKNESSES- N/A
#
# 1) 3-SUM — sort, fix one element, two-pointer the rest. O(n^2) total.
def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    out, n = [], len(nums)
    for i in range(n - 2):
        if i and nums[i] == nums[i - 1]:           # skip duplicate fixed values
            continue
        if nums[i] > 0:                            # since sorted, no triplet sums to 0
            break
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1; hi -= 1
                while lo < hi and nums[lo] == nums[lo - 1]: lo += 1   # dedup
                while lo < hi and nums[hi] == nums[hi + 1]: hi -= 1
            elif s < 0: lo += 1
            else:       hi -= 1
    return out

# 2) DUTCH NATIONAL FLAG — partition into < pivot, == pivot, > pivot in O(n)
def sort_colors(nums: list[int]) -> None:          # values are 0, 1, or 2
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1; mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1                                # don't advance mid; new mid not yet checked
        else:
            mid += 1

# 3) Container with most water — opposite-end with greedy shrink
def max_area(height: list[int]) -> int:
    lo, hi, best = 0, len(height) - 1, 0
    while lo < hi:
        best = max(best, (hi - lo) * min(height[lo], height[hi]))
        if height[lo] < height[hi]: lo += 1        # always move the SHORTER side
        else:                       hi -= 1
    return best

# Decision rule:
#   pair-sum on SORTED array               -> opposite ends, converge
#   pair-sum on UNSORTED array             -> hash map (two-sum O(n))
#   in-place dedup / partition              -> same-direction (slow/fast)
#   palindrome / reverse                    -> opposite ends
#   linked-list middle / cycle              -> fast/slow pointers
#   3-sum / 4-sum                            -> sort + fix + two-pointer
#   3-way partition (Dutch flag)             -> three pointers
#
# Anti-pattern: two-pointer on UNSORTED data for pair-sum
#   The technique relies on monotonic movement — it doesn't work without sorted
#   input. Either sort first (O(n log n)) or switch to a hash map (O(n)).
```

## Decision Rule

```text
pair-sum on SORTED array               -> opposite ends, converge
pair-sum on UNSORTED array             -> hash map (two-sum O(n))
in-place dedup / partition              -> same-direction (slow/fast)
palindrome / reverse                    -> opposite ends
linked-list middle / cycle              -> fast/slow pointers
3-sum / 4-sum                            -> sort + fix + two-pointer
3-way partition (Dutch flag)             -> three pointers
```

## Anti-Pattern

> [!warning] Anti-pattern
> two-pointer on UNSORTED data for pair-sum
>   The technique relies on monotonic movement — it doesn't work without sorted
>   input. Either sort first (O(n log n)) or switch to a hash map (O(n)).

## Tips

- Two pointers require sorted input (or at least structured/partitioned data)
- Fast/slow pointers detect cycles and find midpoints in O(1) extra space
- Sliding window is a variant where both pointers move in the same direction
- For three-sum: sort first, then fix one element and use two pointers for the remaining pair

## Common Mistake

> [!warning] Applying two-pointer directly to an unsorted array for pair-sum problems. Sort first (O(n log n)), then two-pointer (O(n)), giving O(n log n) total.

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

- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing (Caching)]]
- [[Sections/dsa/algorithms/_Index|Data Structures & Algos → Algorithm Patterns & Complexity]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

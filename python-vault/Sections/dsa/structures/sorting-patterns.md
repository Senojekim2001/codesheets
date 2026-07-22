---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "sorting-patterns"
title: "Sorting patterns"
category: "Search"
subtitle: "key=, reverse=, stability, and when to use heapq instead"
signature_short: "sorted(it, key=fn, reverse=True) | heapq.nlargest(k, data)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sorting patterns"
  - "sorting-patterns"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/search"
  - "tier/tiered"
---

# Sorting patterns

> key=, reverse=, stability, and when to use heapq instead

## Overview

Python's sort is Timsort — O(n log n), stable, and highly optimized. Use key= for custom ordering. Stability means equal-key elements preserve their original order — this enables multi-key sorts with multiple sort passes.

## Signature

```python
sorted(it, key=fn, reverse=True) | heapq.nlargest(k, data)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sorted() with key=; list.sort() in place
# STRENGTHS - The two functions plus the key= argument
# WEAKNESSES- No reverse, no multi-key
#
nums = [3, 1, 4, 1, 5, 9, 2]
print(sorted(nums))                               # [1, 1, 2, 3, 4, 5, 9]   new list

words = ["banana", "fig", "apple"]
words.sort(key=len)                                # in place, returns None
print(words)                                       # ['fig', 'apple', 'banana']
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-key sort via tuple, attrgetter/itemgetter, stable multi-pass
# STRENGTHS - The four idioms that cover most sorting needs
# WEAKNESSES- No top-k beat-out; no cmp_to_key
#
from operator import attrgetter, itemgetter

# 1) MULTI-KEY via tuple — earlier components dominate; '-' for descending on numbers
students = [("Alice", 90), ("Bob", 85), ("Carol", 90)]
students.sort(key=lambda s: (-s[1], s[0]))         # score desc, then name asc
print(students)                                    # [('Alice', 90), ('Carol', 90), ('Bob', 85)]

# 2) attrgetter / itemgetter — faster than lambda; cleaner intent
people = [{"age": 30, "name": "A"}, {"age": 25, "name": "B"}]
people.sort(key=itemgetter("age"))                 # like lambda x: x["age"]

class Emp:
    def __init__(self, salary, name): self.salary, self.name = salary, name
emps = [Emp(80, "A"), Emp(50, "B")]
emps.sort(key=attrgetter("salary"))                # like lambda e: e.salary

# 3) STABLE multi-pass — sort secondary first, then primary
data = [{"dept": "eng", "name": "Bob"},
        {"dept": "sales", "name": "Alice"},
        {"dept": "eng", "name": "Alice"}]
data.sort(key=itemgetter("name"))                  # secondary first
data.sort(key=itemgetter("dept"))                  # primary; name order preserved within dept

# 4) reverse=True — descending without negating the key
print(sorted([3, 1, 4, 1, 5], reverse=True))       # [5, 4, 3, 1, 1]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - cmp_to_key, top-k via heap, "Schwartzian transform" performance, when not to sort
# STRENGTHS - The patterns that turn sorting into an algorithmic primitive
# WEAKNESSES- N/A
#
import functools
import heapq

# 1) cmp_to_key — when the order can't be expressed as a single key
#    Classic example: largest concatenated number ([10, 2] -> "210", not "102")
def cmp(a: str, b: str) -> int:
    return -1 if a + b > b + a else (1 if a + b < b + a else 0)

nums = ["10", "2", "3", "30", "34"]
print("".join(sorted(nums, key=functools.cmp_to_key(cmp))))   # '34330210' (largest)

# 2) TOP-K — heapq.nlargest beats sorted()[:k] when k << n
#    sorted()[:k]  is O(n log n)
#    heapq.nlargest is O(n log k)
big = list(range(1_000_000))
top_5 = heapq.nlargest(5, big, key=lambda x: -x)              # five SMALLEST via key trick

# 3) "Schwartzian transform" — precompute the key when it's expensive
#    Without: key fn called O(n log n) times -> N expensive calls
#    With:    key called once per item; sort works on cached pairs
def slow_key(item): return expensive(item)
items = [...]
decorated = [(slow_key(it), it) for it in items]               # one call per item
decorated.sort()                                                # sort the (key, item) pairs
items_sorted = [it for _, it in decorated]
# Equivalent shortcut: sorted(items, key=slow_key) — Python actually CACHES keys this way

# 4) sorted() vs list.sort() — pick by mutation
#    sorted(lst)        returns NEW list, original unchanged
#    lst.sort()          mutates IN PLACE, returns None
#    NEVER assign the return: lst = lst.sort()  -> lst becomes None

# 5) WHEN NOT TO SORT
#    "Top k items"          -> heapq.nlargest / nsmallest (no full sort)
#    "Median"                -> selection algorithm (statistics.median, or quickselect)
#    "Streaming data"        -> running heaps; sort assumes whole data fits
#    "Sort by hash bucket"   -> bucket / counting sort if range is small

# 6) Custom-typed sort — implement __lt__ once instead of passing key= everywhere
class Version:
    def __init__(self, major, minor): self.major, self.minor = major, minor
    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

# Decision rule:
#   simple sorted output                       -> sorted(seq) or seq.sort()
#   sort by one field                            -> key=itemgetter / attrgetter
#   sort by multiple fields                      -> key returns a TUPLE
#   key is expensive to compute                  -> Python already caches; just write key=
#   ordering can't be expressed as a single key  -> cmp_to_key
#   need ONLY top-k                              -> heapq.nlargest / nsmallest
#   need a median / quantile                      -> statistics.median or quickselect
#
# Anti-pattern: lst = lst.sort()
#   list.sort() returns None; lst becomes None and your next line crashes.
#   Use lst.sort() (no assignment) or new = sorted(lst).

def expensive(x): return x
```

## Decision Rule

```text
simple sorted output                       -> sorted(seq) or seq.sort()
sort by one field                            -> key=itemgetter / attrgetter
sort by multiple fields                      -> key returns a TUPLE
key is expensive to compute                  -> Python already caches; just write key=
ordering can't be expressed as a single key  -> cmp_to_key
need ONLY top-k                              -> heapq.nlargest / nsmallest
need a median / quantile                      -> statistics.median or quickselect
```

## Anti-Pattern

> [!warning] Anti-pattern
> lst = lst.sort()
>   list.sort() returns None; lst becomes None and your next line crashes.
>   Use lst.sort() (no assignment) or new = sorted(lst).

## Tips

- Python sort is stable — equal elements keep their original relative order
- Multi-key sort with two passes works because of stability: sort secondary first, then primary
- `operator.itemgetter` is faster than `lambda x: x[i]` for dict/tuple access
- For top-k: `heapq.nlargest(k, data)` beats `sorted()[-k:]` when k is much smaller than n

## Common Mistake

> [!warning] `lst = lst.sort()` assigns `None` to `lst`. `list.sort()` sorts in-place and returns `None`. Use `lst.sort()` without assignment, or `new = sorted(lst)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
students = [("Alice",90), ("Bob",85), ("Carol",90)]
students.sort(key=lambda s: (-s[1], s[0]))
from operator import attrgetter, itemgetter
```

**Senior:**
```python
lst.sort(key=len)                # in-place, returns None
```

## See Also

- [[Sections/dsa/structures/binary-search|Binary search (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]

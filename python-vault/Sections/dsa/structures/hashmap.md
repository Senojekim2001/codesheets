---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "hashmap"
title: "HashMap"
category: "Structures"
subtitle: "dict, defaultdict, Counter — all backed by hash tables"
signature_short: "d.get(key, default) | defaultdict(list) | Counter(iterable)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "HashMap"
  - "hashmap"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# HashMap

> dict, defaultdict, Counter — all backed by hash tables

## Overview

Python dict is a hash map with O(1) average case for get/set/delete. Common patterns: frequency counting with Counter, grouping with defaultdict, two-sum style index lookup, and memoization.

## Signature

```python
d.get(key, default) | defaultdict(list) | Counter(iterable)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - dict for O(1) lookup; .get() with a default avoids KeyError
# STRENGTHS - The minimum-shape hash map use
# WEAKNESSES- No Counter, no defaultdict
#
d = {"alice": 1, "bob": 2}
print(d.get("alice"))                             # 1
print(d.get("carol", 0))                          # 0  — no KeyError
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Counter, defaultdict(list), two-sum index pattern
# STRENGTHS - The three patterns most map-based problems reduce to
# WEAKNESSES- No memoization yet
#
from collections import Counter, defaultdict

# 1) Frequency count — Counter never KeyErrors and supports most_common
words = "the quick brown fox the fox".split()
c = Counter(words)
print(c.most_common(2))                            # [('the', 2), ('fox', 2)]
print(c["missing"])                                # 0 (not KeyError)

# 2) Group-by — one-liner with defaultdict(list)
items = [{"k": "a", "v": 1}, {"k": "a", "v": 2}, {"k": "b", "v": 3}]
groups: defaultdict[str, list] = defaultdict(list)
for it in items:
    groups[it["k"]].append(it["v"])
print(dict(groups))                                # {'a': [1, 2], 'b': [3]}

# 3) Two-sum — store seen values in a dict, look up complement in O(1)
def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}                      # value -> index
    for i, n in enumerate(nums):
        if (target - n) in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []

print(two_sum([2, 7, 11, 15], 9))                  # [0, 1]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lru_cache memoization, hashable-key gotchas, OrderedDict for LRU
# STRENGTHS - The patterns that turn dicts into algorithmic infrastructure
# WEAKNESSES- N/A
#
from collections import OrderedDict
from functools import lru_cache

# 1) lru_cache — memoization without rolling your own dict
@lru_cache(maxsize=None)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# Reset between tests:
# fib.cache_clear()

# 2) Hashable KEYS — list / dict / set are NOT hashable; convert at the boundary
@lru_cache
def count_unique(items: tuple[int, ...]) -> int:    # tuple, not list
    return len(set(items))

# 3) Default-factory pitfall — defaultdict CREATES entries on missing-key access
from collections import defaultdict
g: defaultdict[str, list] = defaultdict(list)
_ = g["new_key"]                                    # creates an empty list!
print(dict(g))                                      # {'new_key': []}
# To check without creation, use:  "new_key" in g  or  g.get("new_key")

# 4) Build an LRU cache from scratch — useful when you can't import functools
class LRU:
    def __init__(self, capacity: int):
        self._cap = capacity
        self._d: OrderedDict[object, object] = OrderedDict()
    def get(self, key):
        if key not in self._d: return None
        self._d.move_to_end(key)                    # mark as most-recent
        return self._d[key]
    def put(self, key, value):
        if key in self._d:
            self._d.move_to_end(key)
        self._d[key] = value
        if len(self._d) > self._cap:
            self._d.popitem(last=False)             # evict OLDEST

# 5) When dict ISN'T enough
#    - need ordered keys with min/max         -> sorted list / SortedDict (sortedcontainers)
#    - need "any item" without picking key     -> dict has popitem() (returns LAST inserted)
#    - thread-safe counters                     -> threading.Lock around updates

# Decision rule:
#   O(1) lookup, simple                       -> dict
#   counts / frequencies                       -> Counter
#   group-by / accumulate                      -> defaultdict(list / int / set)
#   memoize a pure function                    -> @lru_cache(maxsize=None)
#   need keys ORDERED                          -> dict in modern Python keeps insertion order
#                                                (use sortedcontainers.SortedDict for sorted keys)
#   bounded cache                                -> LRU via OrderedDict + move_to_end
#
# Anti-pattern: "if key in d: d[key]" then "else: d[key] = default"
#   Two lookups when one suffices. Use d.get(key, default) (read-only) or
#   d.setdefault(key, default) (writes default if missing) — single lookup.
```

## Decision Rule

```text
O(1) lookup, simple                       -> dict
counts / frequencies                       -> Counter
group-by / accumulate                      -> defaultdict(list / int / set)
memoize a pure function                    -> @lru_cache(maxsize=None)
need keys ORDERED                          -> dict in modern Python keeps insertion order
                                             (use sortedcontainers.SortedDict for sorted keys)
bounded cache                                -> LRU via OrderedDict + move_to_end
```

## Anti-Pattern

> [!warning] Anti-pattern
> "if key in d: d[key]" then "else: d[key] = default"
>   Two lookups when one suffices. Use d.get(key, default) (read-only) or
>   d.setdefault(key, default) (writes default if missing) — single lookup.

## Tips

- dict is the most versatile data structure — frequency counting, grouping, memoization, index lookup
- `Counter` never raises KeyError for missing keys — returns 0
- `defaultdict(list)` is the cleanest groupby pattern — no need to check if key exists before appending
- Check `if key in d` before `d[key]`, or use `d.get(key, default)` — never rely on KeyError for control flow

## Common Mistake

> [!warning] Checking `if key in d` then accessing `d[key]` separately — two lookups. Use `d.get(key, default)` for one lookup, or `try/except KeyError`.

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

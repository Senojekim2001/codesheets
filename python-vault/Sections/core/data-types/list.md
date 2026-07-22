---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "list"
title: "list"
category: "Data Types"
subtitle: "Append, slice, sort, comprehend"
signature_short: "lst = [] | lst.append(x) | lst[start:stop:step] | [expr for x in it if cond]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "list"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# list

> Append, slice, sort, comprehend

## Overview

Lists are ordered, mutable sequences of any mix of types. Most mutation methods return None. Slices always return a new list. Comprehensions are faster than equivalent for-loops and more readable than map/filter.

## Signature

```python
lst = [] | lst.append(x) | lst[start:stop:step] | [expr for x in it if cond]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
# GOAL: Create and access list elements
nums = [3, 1, 4, 1, 5, 9]

# GOAL: Indexing and slicing
nums[0]        # → 3   (first)
nums[-1]       # → 9   (last)
nums[1:4]      # → [1, 4, 1]   (start:stop, stop excluded)
nums[::2]      # → [3, 4, 5]   (every other)

# GOAL: Basic mutation
nums.append(2)        # add to end  → [3,1,4,1,5,9,2]
nums.remove(1)        # remove first 1
popped = nums.pop()   # remove+return last  → 2
len(nums)             # → 5
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
# GOAL: Sorting, searching, and combining lists
scores = [85, 92, 78, 95, 88]

# WHY: sorted() returns new list; .sort() mutates in place
ranked = sorted(scores, reverse=True)   # → [95, 92, 88, 85, 78]
scores.sort()                           # mutates scores

# GOAL: List comprehension — filter and transform in one line
passing = [s for s in scores if s >= 80]   # → [85, 88, 92, 95]
squared = [x**2 for x in range(5)]         # → [0, 1, 4, 9, 16]

# GOAL: Combining lists
a = [1, 2, 3]
b = [4, 5, 6]
combined = a + b              # → [1, 2, 3, 4, 5, 6]  (new list)
a.extend(b)                   # mutates a in place
print(85 in scores)           # → True  (O(n) membership check)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
# GOAL: Idiomatic patterns — zip, enumerate, nested comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# WHY: zip(*matrix) transposes without numpy
transposed = [list(row) for row in zip(*matrix)]
# → [[1,4,7],[2,5,8],[3,6,9]]

# NOTE: enumerate avoids manual index tracking
for i, val in enumerate(['a', 'b', 'c'], start=1):
    print(f"{i}: {val}")   # → 1: a  2: b  3: c

# GOAL: Flatten one level with list comprehension
nested = [[1, 2], [3, 4], [5]]
flat = [x for sub in nested for x in sub]   # → [1,2,3,4,5]

# WHY: Use deque for O(1) left-append/pop instead of list
from collections import deque
q = deque([1, 2, 3])
q.appendleft(0)    # O(1)  vs  list.insert(0, x) which is O(n)
#
# Decision rule:
#   ordered, mutable, mixed types               -> list
#   ordered, immutable record                   -> tuple / NamedTuple
#   homogeneous numeric data                    -> array.array / NumPy ndarray
#   queue / stack with O(1) ends               -> collections.deque
#   unique items only                           -> set
#   key-value lookups                           -> dict
#   fixed schema records                        -> @dataclass / TypedDict
#   build by appending in a loop                -> list (then convert if needed)
#   filter / transform pattern                  -> [expr for x in it if cond] (NOT loop+append)
#
# Anti-pattern: `grid = [[0] * cols] * rows` to make a 2-D matrix.
#   The outer multiplication produces `rows` references to the SAME inner list, so writing
#   `grid[0][0] = 1` updates every "row" simultaneously. Use a comprehension instead:
#   `grid = [[0] * cols for _ in range(rows)]` so each row is a fresh list. The same trap
#   occurs with `[set()] * n` and any other mutable element.
```

## Decision Rule

```text
ordered, mutable, mixed types               -> list
ordered, immutable record                   -> tuple / NamedTuple
homogeneous numeric data                    -> array.array / NumPy ndarray
queue / stack with O(1) ends               -> collections.deque
unique items only                           -> set
key-value lookups                           -> dict
fixed schema records                        -> @dataclass / TypedDict
build by appending in a loop                -> list (then convert if needed)
filter / transform pattern                  -> [expr for x in it if cond] (NOT loop+append)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `grid = [[0] * cols] * rows` to make a 2-D matrix.
>   The outer multiplication produces `rows` references to the SAME inner list, so writing
>   `grid[0][0] = 1` updates every "row" simultaneously. Use a comprehension instead:
>   `grid = [[0] * cols for _ in range(rows)]` so each row is a fresh list. The same trap
>   occurs with `[set()] * n` and any other mutable element.

## Tips

- Mutation methods (`append`, `sort`, `reverse`) return `None` — never do `lst = lst.sort()`
- `a[:]` creates a shallow copy — use `copy.deepcopy(a)` for nested lists
- List comprehensions are ~30% faster than equivalent `for` + `append` loops

## Common Mistake

> [!warning] Using `list * n` to create independent sub-lists. `[[0]*3]*3` creates 3 references to the same inner list — mutate one row and all change. Use `[[0]*3 for _ in range(3)]` instead.

## See Also

- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/tuple|tuple (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

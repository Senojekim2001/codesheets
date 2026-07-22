---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "tuple"
title: "tuple"
category: "Data Types"
subtitle: "Like a list but immutable — use for fixed records and dict keys"
signature_short: "t = (1, 2, 3) | t = 1, 2, 3 | t = (value,)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tuple"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# tuple

> Like a list but immutable — use for fixed records and dict keys

## Overview

Tuples are immutable ordered sequences. They are faster than lists, use less memory, and can be used as dict keys or set members when all elements are hashable. The comma makes the tuple — not the parentheses.

## Signature

```python
t = (1, 2, 3) | t = 1, 2, 3 | t = (value,)
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
# GOAL: Create tuples — comma makes the tuple, not parens
t = (1, 2, 3)
t = 1, 2, 3       # same thing — parens optional
t = (42,)         # single-element — trailing comma required
t = ()            # empty tuple

# GOAL: Access elements like a list
t[0]              # → 1
t[-1]             # → 3
t[1:3]            # → (2, 3)
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
# GOAL: Use tuple as a dict key — lists can't be keys (not hashable)
grid = {}
grid[(0, 0)] = 'origin'
grid[(1, 0)] = 'right'

# GOAL: Return multiple values from a function
def min_max(nums):
    return min(nums), max(nums)   # returns a tuple

lo, hi = min_max([3, 1, 4, 1, 5])  # unpack on return
# → lo=1, hi=5

# GOAL: Tuple unpacking in loops
pairs = [(1, 'a'), (2, 'b')]
for num, letter in pairs:
    print(num, letter)
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
# GOAL: Named tuple for readable field access without a class
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
p.x, p.y          # → 3, 4
p._asdict()       # → {'x': 3, 'y': 4}
p._replace(x=10)  # → Point(x=10, y=4)  new instance

# WHY: Modern alternative — typing.NamedTuple with type hints
from typing import NamedTuple
class Employee(NamedTuple):
    name:   str
    dept:   str
    salary: float = 0.0

e = Employee('Alice', 'Eng', 95000)
e.name    # → 'Alice'

# NOTE: Tuples of mutable objects are not truly immutable
t = ([1, 2], [3, 4])
t[0].append(99)   # t is now ([1,2,99],[3,4]) — the list inside mutated
#
# Decision rule:
#   fixed-size record with known meaning         -> tuple (or NamedTuple if 3+ fields)
#   need to use as dict key / set member         -> tuple (lists not hashable)
#   returning multiple values                    -> tuple (Python's idiom)
#   permanent immutable collection               -> tuple
#   collection that may grow / be edited         -> list
#   typed record with field names                 -> typing.NamedTuple / @dataclass
#   numeric vector                                -> NumPy ndarray
#   single value "for now"                       -> just the value, NOT (value,)
#
# Anti-pattern: writing `t = (item)` thinking you have a 1-tuple.
#   `(item)` is a parenthesized expression equal to `item`; the comma is what creates a tuple.
#   Use `t = (item,)` or `t = item,`. Equally common: assuming tuples are deeply immutable —
#   they aren't; they freeze the references but a contained list is still mutable. For real
#   immutability of nested data, use frozen @dataclass(frozen=True) plus tuple of tuples.
```

## Decision Rule

```text
fixed-size record with known meaning         -> tuple (or NamedTuple if 3+ fields)
need to use as dict key / set member         -> tuple (lists not hashable)
returning multiple values                    -> tuple (Python's idiom)
permanent immutable collection               -> tuple
collection that may grow / be edited         -> list
typed record with field names                 -> typing.NamedTuple / @dataclass
numeric vector                                -> NumPy ndarray
single value "for now"                       -> just the value, NOT (value,)
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing `t = (item)` thinking you have a 1-tuple.
>   `(item)` is a parenthesized expression equal to `item`; the comma is what creates a tuple.
>   Use `t = (item,)` or `t = item,`. Equally common: assuming tuples are deeply immutable —
>   they aren't; they freeze the references but a contained list is still mutable. For real
>   immutability of nested data, use frozen @dataclass(frozen=True) plus tuple of tuples.

## Tips

- A single-element tuple needs a trailing comma: `(1,)` — `(1)` is just an integer in parentheses
- Tuples can be dict keys or set members; lists cannot — use tuples when hashability matters
- Tuples are ~20% faster than lists for iteration and use less memory — prefer for fixed data

## Common Mistake

> [!warning] `t = (1)` is the integer `1`, not a tuple. The comma makes the tuple: `t = (1,)` or just `t = 1,`.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

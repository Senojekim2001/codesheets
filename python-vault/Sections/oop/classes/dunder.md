---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "dunder"
title: "Dunder methods"
category: "Classes"
subtitle: "Implement Python protocols with __dunder__ methods"
signature_short: "__len__ | __getitem__ | __add__ | __eq__ | __iter__"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dunder methods"
  - "dunder"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Dunder methods

> Implement Python protocols with __dunder__ methods

## Overview

Dunder (double-underscore) methods let your objects integrate with Python's built-in syntax and functions. Implement __len__ for len(), __add__ for +, __iter__ for for loops, and more.

## Signature

```python
__len__ | __getitem__ | __add__ | __eq__ | __iter__
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - just define __repr__. Nothing else. Make print() and the
#             REPL show something useful for your object.
# STRENGTHS - smallest possible win — every class benefits from a
#             debuggable repr immediately.
# WEAKNESSES- doesn't yet integrate with operators, len(), iteration —
#             so the protocol nature of dunder methods isn't visible.
#
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(1, 2)
p             # Point(1, 2)        — REPL uses __repr__
print(p)      # Point(1, 2)        — print falls back to __repr__
[p, p]        # [Point(1, 2), Point(1, 2)]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - implement the operator and protocol dunders for a value
#             type: arithmetic (+, *, scalar-on-left), equality, len(),
#             abs(), iteration / unpacking.
# STRENGTHS - shows how dunders are protocols Python calls into — your
#             object plugs into existing syntax instead of inventing new.
# WEAKNESSES- doesn't pair __eq__ with __hash__, so v1 isn't usable in
#             sets or as a dict key (silently). The senior tier closes
#             that gap.
#
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
    def __rmul__(self, scalar):           # scalar * vector
        return self.__mul__(scalar)
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __len__(self):
        return 2
    def __abs__(self):
        return (self.x**2 + self.y**2) ** 0.5
    def __iter__(self):                   # makes it unpackable
        yield self.x
        yield self.y

v1, v2 = Vector(1, 2), Vector(3, 4)
v1 + v2           # Vector(4, 6)
v1 * 3            # Vector(3, 6)
3 * v1            # Vector(3, 6)  via __rmul__
abs(v1)           # 2.2360679...
x, y = v1         # unpacking via __iter__
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - honor the contracts: pair __eq__ with __hash__, use
#             functools.total_ordering for comparisons, and slot the
#             value type for memory. Treat the object as a hashable,
#             ordered, iterable value.
# STRENGTHS - safe in sets and dict keys; sortable; cheap; type-checked.
# WEAKNESSES- more boilerplate; total_ordering generates ops at runtime
#             (small import-time cost); slots forbids new attrs and
#             needs care with inheritance.
#
from functools import total_ordering

@total_ordering
class Vec2:
    __slots__ = ("x", "y")
    def __init__(self, x: float, y: float):
        self.x, self.y = x, y
    def __repr__(self) -> str:
        return f"Vec2({self.x}, {self.y})"
    def __iter__(self):
        yield from (self.x, self.y)
    def __abs__(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5
    # __eq__ + __hash__ go together, both based on the same tuple of fields:
    def _key(self):
        return (self.x, self.y)
    def __eq__(self, other) -> bool:
        return isinstance(other, Vec2) and self._key() == other._key()
    def __hash__(self) -> int:
        return hash(self._key())
    # @total_ordering generates !=, <=, >, >= from __eq__ + __lt__:
    def __lt__(self, other: "Vec2") -> bool:
        return abs(self) < abs(other)

vs = {Vec2(1, 2), Vec2(1, 2), Vec2(3, 4)}   # works — Vec2 is hashable
sorted([Vec2(3, 4), Vec2(0, 1)])             # ordered by magnitude
#
# Decision rule:
#   make print()/REPL useful                          -> __repr__
#   value semantics (sets, dict keys, ==)             -> __eq__ + __hash__ together
#   sortable type                                     -> @total_ordering + __lt__
#   container-like ("len(x)", "x[i]", "for ...")     -> __len__, __getitem__, __iter__
#   resource owns cleanup (with x: ...)              -> __enter__ + __exit__
#   numeric-like (+, *, scalar*x)                    -> __add__, __mul__, __rmul__
#   format-spec aware (f"{x:usd}")                   -> __format__
#   mostly data fields, no special protocol           -> @dataclass — gets __repr__/__eq__ free
#
# Anti-pattern: defining __eq__ without __hash__
#   When you override __eq__, Python silently sets __hash__ = None, making
#   instances unhashable — sets and dicts now raise TypeError. Always pair:
#   compute hash from the same key tuple as __eq__, or use @dataclass(frozen=True)
#   which generates both correctly.
```

## Decision Rule

```text
make print()/REPL useful                          -> __repr__
value semantics (sets, dict keys, ==)             -> __eq__ + __hash__ together
sortable type                                     -> @total_ordering + __lt__
container-like ("len(x)", "x[i]", "for ...")     -> __len__, __getitem__, __iter__
resource owns cleanup (with x: ...)              -> __enter__ + __exit__
numeric-like (+, *, scalar*x)                    -> __add__, __mul__, __rmul__
format-spec aware (f"{x:usd}")                   -> __format__
mostly data fields, no special protocol           -> @dataclass — gets __repr__/__eq__ free
```

## Anti-Pattern

> [!warning] Anti-pattern
> defining __eq__ without __hash__
>   When you override __eq__, Python silently sets __hash__ = None, making
>   instances unhashable — sets and dicts now raise TypeError. Always pair:
>   compute hash from the same key tuple as __eq__, or use @dataclass(frozen=True)
>   which generates both correctly.

## Tips

- Define __repr__ first — it is used in debugging and logging automatically
- __eq__ should also define __hash__ if objects will be used in sets/dicts
- __enter__ and __exit__ make objects work as context managers (with statement)
- If you define __eq__, Python sets __hash__ to None — define it explicitly if needed

## Common Mistake

> [!warning] Defining __eq__ without __hash__. Python sets __hash__ = None, making instances unhashable (cannot be put in sets or used as dict keys).

## Shorthand (Junior → Senior)

**Junior:**
```python
class Vector:
def __init__(self, x, y):
self.x, self.y = x, y
def __repr__(self):
```

**Senior:**
```python
x, y = v1         # unpacking via __iter__
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "advanced"
section: "metaprogramming"
id: "slots-advanced"
title: "__slots__ — Memory Optimization"
category: "Metaprogramming"
subtitle: "__slots__, memory savings, prevents dynamic attributes"
signature_short: "__slots__ = (\"x\", \"y\", \"z\")  # read-only tuple of attribute names"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "__slots__ — Memory Optimization"
  - "slots-advanced"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/metaprogramming"
  - "category/metaprogramming"
  - "tier/tiered"
---

# __slots__ — Memory Optimization

> __slots__, memory savings, prevents dynamic attributes

## Overview

__slots__ defines the exact attributes a class instances can have. Eliminates the instance __dict__ to save memory (~40-50% savings per instance). Instances can't have dynamic attributes added. Useful for large collections of small objects. Trade-off: less flexible, inheritance is tricky, no __dict__ for introspection.

## Signature

```python
__slots__ = ("x", "y", "z")  # read-only tuple of attribute names
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Declare __slots__ to ban __dict__ and shave bytes
# STRENGTHS - Smallest valid use; locks the attribute set
# WEAKNESSES- No memory measurement; no inheritance discussion
#
class Point:
    __slots__ = ("x", "y")            # no __dict__ on instances
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
# p.z = 3   # AttributeError — z isn't in __slots__
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Memory savings, inheritance rule, dataclass(slots=True)
# STRENGTHS - The shape that matters when you create millions of instances
# WEAKNESSES- No weakref subtlety; no pickle gotchas
#
import sys
from dataclasses import dataclass

# 1) With vs without slots — sizeof tells the story on big collections
class A:
    def __init__(self, x, y): self.x, self.y = x, y
class B:
    __slots__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

print(sys.getsizeof(A(1, 2)) + sys.getsizeof(A(1, 2).__dict__))   # ~ 360 B
print(sys.getsizeof(B(1, 2)))                                       # ~ 56 B

# 2) Inheritance — every level must declare its own __slots__; otherwise
#    Python adds __dict__ back and the savings vanish.
class Base:
    __slots__ = ("a",)
class Child(Base):
    __slots__ = ("b",)               # OK; Child instances have a, b — no __dict__
class Loose(Base):
    pass                              # adds __dict__ implicitly — slots WASTED

# 3) dataclasses with slots — easiest path in modern Python (3.10+)
@dataclass(slots=True, frozen=True)
class Vec2:
    x: float
    y: float
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When slots wins, when it loses, multiple inheritance + weakref + pickle
# STRENGTHS - The trade-offs that decide whether slots is worth the constraint
# WEAKNESSES- N/A
#
# 1) WHEN slots actually pays off
#    - millions of small instances (graph nodes, ML record objects, parsed tokens)
#    - tight memory budget on embedded / serverless workloads
#    - code that benchmarks faster attribute access (small constant factor)
#    NOT for: general business objects, config classes, anything you instantiate < 100 times.

# 2) Multiple inheritance — slots conflict if two parents both define non-empty __slots__
class A: __slots__ = ("x",)
class B: __slots__ = ("y",)
# class C(A, B): __slots__ = ()    # TypeError if both parents have non-empty slots
# Workaround: have at most ONE parent with non-empty slots, OR use empty slots + __dict__

# 3) weakref — slots break weakref unless you opt in
import weakref
class N: __slots__ = ("v",)
# weakref.ref(N())                 # TypeError: cannot create weak reference
class Nw: __slots__ = ("v", "__weakref__")
weakref.ref(Nw())                  # OK now

# 4) pickle works with slots BUT only if you don't need __dict__-style state
#    Custom __getstate__ / __setstate__ if you do anything fancy.

# 5) Slot inheritance trick — keep __dict__ on a subclass for "configurable" tail
class Strict: __slots__ = ("a", "b")
class Loose(Strict):
    __slots__ = ("__dict__",)        # subclass can have arbitrary attrs
                                     # parent stays compact

# 6) Don't add SAME name to slots and class attributes — the descriptor wins
#    silently and the class attribute becomes inaccessible:
class Bug:
    __slots__ = ("x",)
    x = 5                            # BAD: only the slot survives at runtime

# Decision rule:
#   < 1000 instances expected             -> NO slots (complexity not worth it)
#   millions of small instances            -> __slots__ (or @dataclass(slots=True))
#   need dynamic attributes "sometimes"     -> __slots__ + ("__dict__",)
#   need weakref to slotted instances       -> __slots__ + ("__weakref__",)
#   modern Python                            -> @dataclass(slots=True)  (3.10+)
#   multiple inheritance with slots         -> at most ONE parent with non-empty slots
#
# Anti-pattern: __slots__ on a base class WITHOUT __slots__ in every subclass
#   The first un-slotted subclass adds __dict__ back to ALL instances of that
#   subclass and downstream — your memory savings vanish without warning.
#   Either commit fully OR don't use slots.
```

## Decision Rule

```text
< 1000 instances expected             -> NO slots (complexity not worth it)
millions of small instances            -> __slots__ (or @dataclass(slots=True))
need dynamic attributes "sometimes"     -> __slots__ + ("__dict__",)
need weakref to slotted instances       -> __slots__ + ("__weakref__",)
modern Python                            -> @dataclass(slots=True)  (3.10+)
multiple inheritance with slots         -> at most ONE parent with non-empty slots
```

## Anti-Pattern

> [!warning] Anti-pattern
> __slots__ on a base class WITHOUT __slots__ in every subclass
>   The first un-slotted subclass adds __dict__ back to ALL instances of that
>   subclass and downstream — your memory savings vanish without warning.
>   Either commit fully OR don't use slots.

## Tips

- __slots__ saves ~40-50% per instance when you have thousands of small objects.
- Include "__dict__" in __slots__ if you want to allow some dynamic attributes alongside slots; include "__weakref__" if you need `weakref.ref(instance)` to work (slotted classes can't be weak-referenced by default).
- Inheritance: define __slots__ in each class; the union of parent and child slots is used. Multiple inheritance allows AT MOST ONE parent with non-empty slots, or you'll get a layout TypeError.
- __slots__ disables `__dict__` (no ad-hoc attribute assignment), complicates multiple inheritance, and changes how dynamic attribute access works — keep it for hot, instance-heavy classes only. Modern CPython pickles and deepcopies slot classes correctly out of the box.

## Common Mistake

> [!warning] __slots__ on a base class without __slots__ in EVERY subclass — the first un-slotted subclass adds __dict__ back to all its instances and downstream, and your memory savings vanish without warning. Either commit fully or don't use slots. Also: never name the same identifier as both a slot and a class attribute (the slot wins silently).

## Shorthand (Junior → Senior)

**Junior:**
```python
class Point:
    __slots__ = ('x', 'y')

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

**Senior:**
```python
@dataclass(slots=True)  # Python 3.10+
class Point:
    x: float
    y: float
```

## See Also

- [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation (Advanced Python)]]
- [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes (Advanced Python)]]
- [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement (Advanced Python)]]
- [[Sections/advanced/metaprogramming/_Index|Advanced Python → Metaprogramming]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "oop"
section: "dataclasses"
id: "slots"
title: "__slots__"
category: "Classes"
subtitle: "Faster access, lower memory — replaces __dict__ with fixed slots"
signature_short: "class Foo:
    __slots__ = [\"x\", \"y\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "__slots__"
  - "slots"
tags:
  - "python"
  - "python/oop"
  - "python/oop/dataclasses"
  - "category/classes"
  - "tier/tiered"
---

# __slots__

> Faster access, lower memory — replaces __dict__ with fixed slots

## Overview

By default Python objects store instance attributes in a __dict__. __slots__ replaces this with fixed slots — lower memory, faster attribute access, and prevents adding undeclared attributes. Most valuable when creating millions of small instances.

## Signature

```python
class Foo:
    __slots__ = ["x", "y"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - declare __slots__ with the only attribute names allowed.
#             Show that adding a new attribute now raises.
# STRENGTHS - introduces the rule ("no __dict__, only listed names")
#             without distractions about memory or inheritance.
# WEAKNESSES- doesn't show the actual win (memory) or the inheritance
#             gotcha — those need the next tiers.
#
class PointFast:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = PointFast(1, 2)
p.x, p.y      # (1, 2) — works
# p.z = 3     # AttributeError — 'z' not declared in __slots__
# p.__dict__  # AttributeError — slotted classes have no __dict__
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - put a slotted and an unslotted class side by side and
#             measure with sys.getsizeof(). Add a small inheritance
#             example that respects slots.
# STRENGTHS - the measurement step makes the memory claim concrete; the
#             inheritance pattern (only declare NEW names) is the bit
#             that trips people up most.
# WEAKNESSES- micro-benchmark with one instance — real wins show at
#             millions of objects; hides interactions with weakref and
#             pickling.
#
import sys

class Point:                            # default — has __dict__
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointFast:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

sys.getsizeof(Point(1, 2))      # larger — pays for __dict__
sys.getsizeof(PointFast(1, 2))  # smaller — slot storage only

# Inheritance: only declare the NEW slots in the child:
class Point3D(PointFast):
    __slots__ = ("z",)
    def __init__(self, x, y, z):
        super().__init__(x, y)
        self.z = z

p3 = Point3D(1, 2, 3)
p3.x, p3.y, p3.z              # (1, 2, 3)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production gotchas: any link in the chain that omits
#             __slots__ brings __dict__ back; weakref needs an explicit
#             slot; pickling needs help; @dataclass(slots=True) is the
#             modern shortcut.
# STRENGTHS - prevents the silent regression where a subclass undoes the
#             memory savings; covers the two compatibility footguns
#             (weakref, pickle) most teams hit only once it's in prod.
# WEAKNESSES- adds enough rules that for most code the gain isn't worth
#             it — only reach for slots when you have measured the
#             memory cost or are creating millions of small instances.
#
from dataclasses import dataclass

# 1. Modern shortcut — Python 3.10+ generates __slots__ from the fields:
@dataclass(slots=True)
class Coord:
    x: float
    y: float

# 2. Subclass without __slots__ silently re-introduces __dict__:
class PointFast:
    __slots__ = ("x", "y")

class Loose(PointFast):
    pass                          # no __slots__ — instances get __dict__ back

l = Loose()
l.__dict__                        # {} — defeats the purpose of the parent's slots

# 3. weakref needs an explicit slot when slots are used:
import weakref
class Cacheable:
    __slots__ = ("value", "__weakref__")    # opt in
    def __init__(self, v): self.value = v

c = Cacheable(1)
ref = weakref.ref(c)              # OK; would fail without "__weakref__" in slots

# 4. Pickling: slotted instances need __getstate__/__setstate__ or
#    __slots__ with no __dict__/no parent dict — define them if pickling.

# Rule of thumb:
#   - few instances or readability matters more   -> skip __slots__
#   - millions of small instances                 -> @dataclass(slots=True) is the win
#
# Decision rule:
#   millions of small fixed-shape instances           -> __slots__ (or dataclass slots=True)
#   handful of long-lived objects                     -> skip slots, keep __dict__
#   modern Python 3.10+, want minimal boilerplate     -> @dataclass(slots=True)
#   need weakref to instances                         -> add "__weakref__" to slots
#   need to pickle slotted objects                    -> define __getstate__/__setstate__
#   subclass extends a slotted parent                 -> declare ONLY new slots in child
#   need to add attrs dynamically (monkey-patching)   -> don't use slots
#   readability/refactor flexibility matters most     -> skip slots
#
# Anti-pattern: adding __slots__ to a child while the parent has none
#   __slots__ saves memory only if every class in the MRO declares it.
#   A single ancestor without __slots__ keeps __dict__ on every instance,
#   so the child's slots add restrictions without saving a single byte.
#   Either slot the whole hierarchy or skip it — half-measures are pure cost.
```

## Decision Rule

```text
millions of small fixed-shape instances           -> __slots__ (or dataclass slots=True)
handful of long-lived objects                     -> skip slots, keep __dict__
modern Python 3.10+, want minimal boilerplate     -> @dataclass(slots=True)
need weakref to instances                         -> add "__weakref__" to slots
need to pickle slotted objects                    -> define __getstate__/__setstate__
subclass extends a slotted parent                 -> declare ONLY new slots in child
need to add attrs dynamically (monkey-patching)   -> don't use slots
readability/refactor flexibility matters most     -> skip slots
```

## Anti-Pattern

> [!warning] Anti-pattern
> adding __slots__ to a child while the parent has none
>   __slots__ saves memory only if every class in the MRO declares it.
>   A single ancestor without __slots__ keeps __dict__ on every instance,
>   so the child's slots add restrictions without saving a single byte.
>   Either slot the whole hierarchy or skip it — half-measures are pure cost.

## Tips

- __slots__ saves the most memory when creating millions of small instances
- Every class in an inheritance chain must define __slots__ — any omission brings __dict__ back
- Cannot pickle slotted objects by default without adding __getstate__/__setstate__
- Benchmark before adding __slots__ — the savings may be negligible for most code

## Common Mistake

> [!warning] Adding __slots__ to a subclass while the parent has none. The parent still has __dict__, so no memory is saved — all instances still have __dict__ from the parent.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Point:
def __init__(self, x, y):
self.x = x
self.y = y
```

**Senior:**
```python
pass              # no __slots__ → __dict__ is back
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/dataclasses/_Index|Object-Oriented Python → Modern Patterns]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

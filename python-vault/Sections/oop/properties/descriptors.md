---
type: "entry"
domain: "python"
file: "oop"
section: "properties"
id: "descriptors"
title: "Descriptors"
category: "Properties"
subtitle: "The mechanism behind @property, @classmethod, and @staticmethod"
signature_short: "class Validator:
    def __get__(self, obj, cls): ...
    def __set__(self, obj, val): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Descriptors"
  - "descriptors"
tags:
  - "python"
  - "python/oop"
  - "python/oop/properties"
  - "category/properties"
  - "tier/tiered"
---

# Descriptors

> The mechanism behind @property, @classmethod, and @staticmethod

## Overview

A descriptor is any object that defines __get__, __set__, or __delete__. When assigned as a class attribute, Python calls these methods on attribute access. @property, @classmethod, and @staticmethod are all built-in descriptors. Custom descriptors enable reusable validation across classes.

## Signature

```python
class Validator:
    def __get__(self, obj, cls): ...
    def __set__(self, obj, val): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the smallest descriptor: a class with __get__ that returns
#             a fixed value. Show that putting it as a class attribute
#             routes attribute access through the descriptor.
# STRENGTHS - reveals what a descriptor IS in 5 lines — an object whose
#             __get__ runs on attribute access.
# WEAKNESSES- no __set__, no per-instance state, so the real value
#             (validation, caching) isn't visible yet.
#
class AlwaysFortyTwo:
    def __get__(self, obj, objtype=None):
        return 42

class Foo:
    answer = AlwaysFortyTwo()

Foo().answer       # 42
Foo.answer         # 42 — also works on the class
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - reusable validation descriptor. __set_name__ captures the
#             attribute name automatically; __get__/__set__ store the
#             value in the instance's __dict__ keyed by that name.
# STRENGTHS - one Positive() definition validates radius, x, y, and any
#             other attribute it's assigned to — no boilerplate per field.
# WEAKNESSES- still requires the host class to have a __dict__ (no
#             __slots__); doesn't show the lazy/cached pattern.
#
class Positive:
    def __set_name__(self, owner, name):
        self.name = name                           # captured at class creation
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self                            # access on the class itself
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} must be positive, got {value}")
        obj.__dict__[self.name] = value

class Circle:
    radius = Positive()
    x      = Positive()
    y      = Positive()
    def __init__(self, radius, x, y):
        self.radius = radius                       # calls Positive.__set__
        self.x = x
        self.y = y

c = Circle(5, 1, 2)
# c.radius = -1   # ValueError: radius must be positive
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lazy descriptor that computes once per instance and then
#             overwrites itself in obj.__dict__ so subsequent reads bypass
#             the descriptor entirely. This is the "non-data descriptor"
#             trick — equivalent to functools.cached_property.
# STRENGTHS - zero overhead after first access (no __set__ means the
#             instance dict shadows the descriptor); pattern works in
#             any framework that needs lazy attributes.
# WEAKNESSES- subtle priority rule (data vs non-data descriptors) is
#             easy to get wrong; doesn't compose with __slots__ unless
#             a slot is reserved for the cache name.
#
class LazyProperty:
    """Compute once on first access; cache result on the instance."""
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        obj.__dict__[self.name] = value     # next read skips the descriptor
        return value

class Dataset:
    @LazyProperty
    def data(self):
        print("loading expensive data...")
        return list(range(1000))

d = Dataset()
d.data       # "loading expensive data..." then [0..999]
d.data       # cached — no print, returned from instance __dict__

# Note: stdlib has functools.cached_property for exactly this pattern —
# write your own only when you need extra behavior (e.g. invalidation
# hooks, async loading).
#
# Decision rule:
#   one attribute, one getter/setter                  -> @property
#   one attribute, compute-once cache                 -> @cached_property
#   same validation across many attrs/classes         -> custom data descriptor
#   lazy attribute that should disappear after read   -> non-data descriptor (no __set__)
#   building an ORM Field / form Field abstraction    -> custom descriptor
#   need __set_name__ to capture attribute name       -> custom descriptor
#   simple computed view, no reuse                    -> @property — don't over-engineer
#
# Anti-pattern: storing the per-instance value on self (the descriptor)
#   The descriptor is one object on the class, shared by every instance.
#   Writing self.value = value inside __set__ overwrites that one shared
#   slot, so all instances see the same data. Always store via
#   obj.__dict__[self.name] = value (or use __set_name__ + a private key).
```

## Decision Rule

```text
one attribute, one getter/setter                  -> @property
one attribute, compute-once cache                 -> @cached_property
same validation across many attrs/classes         -> custom data descriptor
lazy attribute that should disappear after read   -> non-data descriptor (no __set__)
building an ORM Field / form Field abstraction    -> custom descriptor
need __set_name__ to capture attribute name       -> custom descriptor
simple computed view, no reuse                    -> @property — don't over-engineer
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing the per-instance value on self (the descriptor)
>   The descriptor is one object on the class, shared by every instance.
>   Writing self.value = value inside __set__ overwrites that one shared
>   slot, so all instances see the same data. Always store via
>   obj.__dict__[self.name] = value (or use __set_name__ + a private key).

## Tips

- __set_name__ is called at class creation time — gives the descriptor its attribute name automatically
- Always check if obj is None in __get__ — this handles access through the class (not instance)
- Store values in obj.__dict__[self.name] to bypass the descriptor on future reads
- Data descriptor (has __set__) takes priority over instance __dict__; non-data descriptor (only __get__) does not

## Common Mistake

> [!warning] Storing the value on self (the descriptor) instead of obj. The descriptor is a class attribute shared by all instances — all would share the same value.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/oop/properties/property|@property (Object-Oriented Python)]]
- [[Sections/oop/properties/classmethod|@classmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/staticmethod|@staticmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/protocol-oop|Protocol (Object-Oriented Python)]]
- [[Sections/oop/properties/_Index|Object-Oriented Python → Properties & Descriptors]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

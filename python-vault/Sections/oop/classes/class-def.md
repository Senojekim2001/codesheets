---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "class-def"
title: "class definition"
category: "Classes"
subtitle: "Blueprint for creating objects"
signature_short: "class ClassName:\\n    def __init__(self, ...): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "class definition"
  - "class-def"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# class definition

> Blueprint for creating objects

## Overview

A class is a blueprint for creating objects. __init__ is the constructor — it runs when an instance is created. self refers to the current instance. Instance variables are set on self; class variables are shared across all instances.

## Signature

```python
class ClassName:\n    def __init__(self, ...): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest possible class: __init__ stores one attribute,
#             one method uses it. No class vars, no dunders.
# STRENGTHS - mirrors how you'd think about a class the first time;
#             whole shape is visible in five lines.
# WEAKNESSES- print(obj) shows the unhelpful default repr; no shared
#             constants; no obvious place for cross-instance state.
#
class Dog:
    def __init__(self, name):
        self.name = name           # instance attribute set on this object
    def bark(self):
        return f"{self.name} says Woof!"

rex = Dog("Rex")
rex.bark()    # "Rex says Woof!"
rex.name      # "Rex"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the parts you meet daily: a class variable for
#             shared constants, instance variables in __init__, and
#             __repr__/__str__ so prints look right.
# STRENGTHS - covers ~80% of hand-written classes you'll read in a code
#             review; debuggable thanks to __repr__; clearly separates
#             shared from per-instance state.
# WEAKNESSES- still hand-rolling boilerplate (init/repr); no type hints
#             so tooling can't help; nothing prevents bad inputs.
#
class Dog:
    # Class variable — shared by all instances
    species = "Canis lupus familiaris"
    def __init__(self, name, age):
        # Instance variables — unique per object
        self.name = name
        self.age = age
    def bark(self):
        return f"{self.name} says Woof!"
    def __repr__(self):
        return f"Dog(name={self.name!r}, age={self.age})"
    def __str__(self):
        return f"{self.name}, age {self.age}"

rex = Dog("Rex", 3)
buddy = Dog("Buddy", 5)
rex.bark()           # "Rex says Woof!"
rex.name             # "Rex"
Dog.species          # "Canis lupus familiaris"
rex.species          # "Canis lupus familiaris" (found on class)
print(rex)           # Rex, age 3  (uses __str__)
repr(rex)            # Dog(name='Rex', age=3)  (uses __repr__)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - reach for @dataclass for the structural boilerplate
#             (__init__/__repr__/__eq__), add type hints for tooling,
#             slots=True for memory, __post_init__ for invariants.
# STRENGTHS - generated methods are correct and consistent; type checker
#             can verify call sites; slots saves memory at scale;
#             clearly signals "this is a value object" to readers.
# WEAKNESSES- requires Python 3.10+ for slots=; decorator magic is harder
#             to step through in a debugger; overkill when the class
#             carries heavy behavior or owns external resources.
#
from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class Dog:
    name: str
    age: int
    species: str = "Canis lupus familiaris"   # default at field level

    def bark(self) -> str:
        return f"{self.name} says Woof!"

    def __post_init__(self) -> None:
        # Runs after generated __init__ — perfect spot for invariants
        if self.age < 0:
            raise ValueError(f"age must be >= 0, got {self.age}")

rex = Dog("Rex", 3)
rex.bark()                       # "Rex says Woof!"
print(rex)                       # Dog(name='Rex', age=3, species='Canis lupus familiaris')
# rex.age = 4                    # FrozenInstanceError — frozen=True
hash(rex)                        # works — frozen dataclasses are hashable
#
# Decision rule:
#   pure data with 2+ fields, no heavy behavior     -> @dataclass
#   need immutability + hashable value type         -> @dataclass(frozen=True)
#   millions of instances, memory matters           -> @dataclass(slots=True)
#   call sites confuse arg order (e.g. lat/lon)     -> @dataclass(kw_only=True)
#   need runtime validation/coercion of inputs      -> Pydantic BaseModel
#   ORM-mapped row                                  -> SQLAlchemy / Django model
#   class owns external resources (sockets, locks)  -> hand-written class
#
# Anti-pattern: hand-rolling __init__/__repr__/__eq__ for every value class
#   People write 30 lines of boilerplate to set self.x = x for five fields,
#   then forget __eq__ so equality compares identity. @dataclass generates
#   all three correctly from type hints. Reach for it whenever the class is
#   mostly "data + a couple of methods".
```

## Decision Rule

```text
pure data with 2+ fields, no heavy behavior     -> @dataclass
need immutability + hashable value type         -> @dataclass(frozen=True)
millions of instances, memory matters           -> @dataclass(slots=True)
call sites confuse arg order (e.g. lat/lon)     -> @dataclass(kw_only=True)
need runtime validation/coercion of inputs      -> Pydantic BaseModel
ORM-mapped row                                  -> SQLAlchemy / Django model
class owns external resources (sockets, locks)  -> hand-written class
```

## Anti-Pattern

> [!warning] Anti-pattern
> hand-rolling __init__/__repr__/__eq__ for every value class
>   People write 30 lines of boilerplate to set self.x = x for five fields,
>   then forget __eq__ so equality compares identity. @dataclass generates
>   all three correctly from type hints. Reach for it whenever the class is
>   mostly "data + a couple of methods".

## Tips

- Always define __repr__ — it makes debugging much easier
- __str__ is for end users; __repr__ is for developers — when in doubt, define __repr__
- Class variables are shared across all instances — mutating them affects every instance
- Instance variables shadow class variables: rex.species = "wolf" only changes rex

## Common Mistake

> [!warning] Using a mutable class variable like class_list = []. All instances share the same list. Define mutable defaults in __init__: self.items = [].

## Shorthand (Junior → Senior)

**Junior:**
```python
class Dog:
# Class variable — shared by all instances
species = "Canis lupus familiaris"
def __init__(self, name, age):
```

**Senior:**
```python
repr(rex)            # Dog(name='Rex', age=3)  (uses __repr__)
```

## See Also

- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/mro|Multiple inheritance / MRO (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

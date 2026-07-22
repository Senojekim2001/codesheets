---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "super"
title: "super()"
category: "Classes"
subtitle: "Call parent methods without hardcoding the class name"
signature_short: "super().__init__() | super().method()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "super()"
  - "super"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# super()

> Call parent methods without hardcoding the class name

## Overview

super() returns a proxy that delegates method calls to the parent class in the MRO (Method Resolution Order). Always use super() instead of ParentClass.method(self) — it handles multiple inheritance correctly and does not hardcode the class name.

## Signature

```python
super().__init__() | super().method()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - call super().__init__() in the child to initialize parent
#             state. Nothing else.
# STRENGTHS - one of the most common bugs in Python OOP is forgetting this
#             call; this example burns it into muscle memory.
# WEAKNESSES- doesn't yet show calling parent methods other than __init__;
#             single-inheritance only, so MRO subtleties are invisible.
#
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)     # initialize parent state first
        self.breed = breed

rex = Dog("Rex", "Labrador")
rex.name, rex.breed     # ("Rex", "Labrador")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - super() also calls overridden methods, not just __init__.
#             Type the methods, return-augment the parent's value, and
#             show the chain through repr() output.
# STRENGTHS - clarifies that super() is for any method, not a magic
#             constructor; teaches the "extend, don't replace" pattern.
# WEAKNESSES- still single-inheritance; cooperative super() is the real
#             reason super() exists, and that needs MI to demonstrate.
#
class Animal:
    def __init__(self, name: str) -> None:
        self.name = name
    def speak(self) -> str:
        return f"{self.name} makes a sound"

class Dog(Animal):
    def __init__(self, name: str, breed: str) -> None:
        super().__init__(name)               # delegate to Animal.__init__
        self.breed = breed
    def speak(self) -> str:
        base = super().speak()               # call parent's version first
        return f"{base}; Woof!"

d = Dog("Rex", "Labrador")
d.speak()    # "Rex makes a sound; Woof!"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - cooperative multiple inheritance: every greet() calls
#             super().greet(), and Python's MRO threads them in C3 order.
#             This is the whole reason super() exists instead of
#             ParentClass.method(self).
# STRENGTHS - one rule ("always super()") works in single, multiple, and
#             diamond hierarchies; lets mixins compose without naming
#             each other.
# WEAKNESSES- requires every class in the hierarchy to play along — one
#             missed super() breaks the chain silently; reading the MRO
#             takes practice.
#
class A:
    def greet(self):
        return "A"

class B(A):
    def greet(self):
        return "B -> " + super().greet()

class C(A):
    def greet(self):
        return "C -> " + super().greet()

class D(B, C):
    def greet(self):
        return "D -> " + super().greet()

D().greet()        # "D -> B -> C -> A"
print(D.__mro__)   # (D, B, C, A, object)
# Hardcoding A.greet(self) inside B would skip C entirely — super() does not.
#
# Decision rule:
#   call parent __init__ from subclass               -> super().__init__(...)
#   extend a parent method with extra behavior       -> super().method() + own code
#   skip a level deliberately (rare, smelly)         -> Grandparent.method(self)
#   multiple inheritance / mixin chain               -> super() everywhere, **kwargs pass-through
#   need to call sibling explicitly (almost never)   -> reconsider design
#   Python 2 compat / ancient code                   -> super(ClassName, self)
#   modern Python 3 single or multi inheritance      -> bare super()
#
# Anti-pattern: writing ParentClass.__init__(self, ...) instead of super()
#   Hardcoding the parent name skips C3 linearization, so under multiple
#   inheritance one parent's __init__ silently never runs. Worse, renaming
#   the parent breaks every child. Always use super() — it threads the MRO
#   correctly even when callers rearrange bases.
```

## Decision Rule

```text
call parent __init__ from subclass               -> super().__init__(...)
extend a parent method with extra behavior       -> super().method() + own code
skip a level deliberately (rare, smelly)         -> Grandparent.method(self)
multiple inheritance / mixin chain               -> super() everywhere, **kwargs pass-through
need to call sibling explicitly (almost never)   -> reconsider design
Python 2 compat / ancient code                   -> super(ClassName, self)
modern Python 3 single or multi inheritance      -> bare super()
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing ParentClass.__init__(self, ...) instead of super()
>   Hardcoding the parent name skips C3 linearization, so under multiple
>   inheritance one parent's __init__ silently never runs. Worse, renaming
>   the parent breaks every child. Always use super() — it threads the MRO
>   correctly even when callers rearrange bases.

## Tips

- super().__init__() without arguments works in Python 3 — prefer over super(ClassName, self)
- super() follows the MRO — in multiple inheritance it calls the next class in line, not just the direct parent
- Always call super().__init__() first in __init__ — parent initializes state that subclass may depend on
- super() works correctly even in diamond inheritance scenarios — hardcoding ParentClass.method() does not

## Common Mistake

> [!warning] Using ParentClass.__init__(self, ...) instead of super().__init__(...). This breaks in multiple inheritance because it bypasses MRO and calls only one parent directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Animal:
def __init__(self, name: str):
self.name = name
def speak(self) -> str:
```

**Senior:**
```python
print(D.__mro__)
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/mro|Multiple inheritance / MRO (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

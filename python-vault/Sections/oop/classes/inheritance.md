---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "inheritance"
title: "Inheritance"
category: "Classes"
subtitle: "Extend and specialize existing classes"
signature_short: "class Child(Parent):\\n    def __init__(self): super().__init__()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Inheritance"
  - "inheritance"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Inheritance

> Extend and specialize existing classes

## Overview

Inheritance lets a subclass reuse and extend a parent class. Call super().__init__() to initialize the parent. Override methods to customize behavior. Python supports multiple inheritance.

## Signature

```python
class Child(Parent):\n    def __init__(self): super().__init__()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the smallest possible parent/child: child reuses parent's
#             __init__ via super() and adds nothing else.
# STRENGTHS - shows the call-super-from-child reflex without any other
#             concepts in the way.
# WEAKNESSES- doesn't override anything yet, so the value of inheritance
#             isn't obvious; no abstract methods, no polymorphism.
#
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):                 # Dog "is-a" Animal
    pass                           # inherits __init__ unchanged

rex = Dog("Rex")
rex.name                  # "Rex" — inherited from Animal
isinstance(rex, Dog)      # True
isinstance(rex, Animal)   # True — subclasses count
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - parent defines a method subclasses override; subclasses
#             extend __init__ via super() and add their own attributes.
#             Iterate a heterogenous list to demonstrate polymorphism.
# STRENGTHS - covers the everyday inheritance shape: override a method,
#             add an attribute, call super(); the polymorphism loop is the
#             whole reason inheritance exists.
# WEAKNESSES- nothing forces Dog/Cat to actually implement speak(); a
#             buggy subclass would only fail at call time.
#
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        raise NotImplementedError("subclass must implement speak()")
    def __str__(self):
        return f"{type(self).__name__}({self.name!r})"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def __init__(self, name, indoor=True):
        super().__init__(name)              # call parent __init__
        self.indoor = indoor
    def speak(self):
        return f"{self.name} says Meow!"

# Polymorphism — each call dispatches to the right speak()
animals = [Dog("Rex"), Cat("Whiskers"), Dog("Buddy")]
for a in animals:
    print(a.speak())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lock the contract with abc.ABC and @abstractmethod, type
#             everything, and let the abstract base reject incomplete
#             subclasses at instantiation time.
# STRENGTHS - "subclass must implement speak()" is enforced at class-load
#             time, not at the first runtime call; tooling sees the
#             contract; the type signature documents intent.
# WEAKNESSES- adds an import and a decorator; can feel ceremonial for a
#             two-method hierarchy; ABC objects can't be mixed cleanly
#             with Protocol-only typing.
#
from abc import ABC, abstractmethod
from typing import Iterable

class Animal(ABC):
    def __init__(self, name: str) -> None:
        self.name = name
    @abstractmethod
    def speak(self) -> str: ...
    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.name!r})"

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name} says Meow!"

# Animal()        # TypeError — can't instantiate abstract class
# class Mute(Animal): pass
# Mute("x")       # TypeError — Mute didn't implement speak()

def chorus(animals: Iterable[Animal]) -> list[str]:
    return [a.speak() for a in animals]

chorus([Dog("Rex"), Cat("Whiskers")])
# ['Rex says Woof!', 'Whiskers says Meow!']
#
# Decision rule:
#   share implementation across types                -> regular inheritance
#   need to ENFORCE subclass implements method       -> abc.ABC + @abstractmethod
#   only need a structural shape for type checking   -> typing.Protocol
#   compose orthogonal behaviors (logging, JSON)     -> mixins, not parent
#   "is-a" relationship feels forced                 -> composition, not inheritance
#   third-party class needs extension                -> wrap or subclass thinly
#   cross-cutting concern (auth, logging)            -> decorator, not subclass
#
# Anti-pattern: deep inheritance hierarchies for code reuse
#   When Dog -> Mammal -> Animal -> LivingThing exists only so each level
#   contributes one helper, the hierarchy becomes a maze that subclasses
#   can't override safely. Prefer composition: hold a helper as an
#   attribute, or pull the shared logic into a small mixin.
```

## Decision Rule

```text
share implementation across types                -> regular inheritance
need to ENFORCE subclass implements method       -> abc.ABC + @abstractmethod
only need a structural shape for type checking   -> typing.Protocol
compose orthogonal behaviors (logging, JSON)     -> mixins, not parent
"is-a" relationship feels forced                 -> composition, not inheritance
third-party class needs extension                -> wrap or subclass thinly
cross-cutting concern (auth, logging)            -> decorator, not subclass
```

## Anti-Pattern

> [!warning] Anti-pattern
> deep inheritance hierarchies for code reuse
>   When Dog -> Mammal -> Animal -> LivingThing exists only so each level
>   contributes one helper, the hierarchy becomes a maze that subclasses
>   can't override safely. Prefer composition: hold a helper as an
>   attribute, or pull the shared logic into a small mixin.

## Tips

- Always call super().__init__() in child __init__ to initialize parent state
- super() without arguments works in Python 3 — prefer it over super(ClassName, self)
- Use ABC (abstract base classes) to enforce method implementation in subclasses
- isinstance(obj, ParentClass) is True for instances of subclasses — use this for type checks

## Common Mistake

> [!warning] Forgetting super().__init__() in a subclass __init__. The parent's initialization code never runs, leaving the object in a broken state.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/mro|Multiple inheritance / MRO (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

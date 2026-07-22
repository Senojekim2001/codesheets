---
type: "entry"
domain: "python"
file: "oop"
section: "dataclasses"
id: "dataclasses"
title: "dataclasses (Data Classes)"
category: "OOP"
subtitle: "Less boilerplate than namedtuple or hand-written classes"
signature_short: "from dataclasses import dataclass, field
@dataclass
class Person: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dataclasses (Data Classes)"
  - "dataclasses"
tags:
  - "python"
  - "python/oop"
  - "python/oop/dataclasses"
  - "category/oop"
  - "tier/tiered"
---

# dataclasses (Data Classes)

> Less boilerplate than namedtuple or hand-written classes

## Overview

Dataclasses reduce boilerplate by auto-generating common methods. Define a class with type hints, and @dataclass adds __init__, __repr__, __eq__ automatically. Supports defaults, factories, and frozen (immutable) classes.

## Signature

```python
from dataclasses import dataclass, field
@dataclass
class Person: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - smallest dataclass: just type-annotated fields. The
#             decorator generates __init__, __repr__, __eq__.
# STRENGTHS - immediate boilerplate win — no hand-written constructor,
#             no hand-written equality.
# WEAKNESSES- skips defaults, methods, validation, conversion — the
#             whole reason to keep using dataclasses past this point.
#
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int
    email: str

p = Person("Alice", 30, "alice@example.com")
print(p)                                # Person(name='Alice', age=30, email='alice@example.com')
p == Person("Alice", 30, "alice@example.com")   # True
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the common toolkit: defaults, mutable defaults via
#             field(default_factory=...), Optional fields, methods on
#             the class, and __post_init__ for derived/validated state.
# STRENGTHS - covers what 80% of dataclass code in real projects looks
#             like; the field(default_factory=...) line is the single
#             rule that prevents the most common dataclass bug.
# WEAKNESSES- doesn't yet show inheritance ordering rules or asdict/
#             astuple — those are the senior-tier finishing touches.
#
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

# Defaults — non-defaults must come first
@dataclass
class Config:
    host: str
    port: int = 8080
    debug: bool = False
    timeout: int = 30

# Mutable defaults — ALWAYS via default_factory
@dataclass
class Team:
    name: str
    members: List[str] = field(default_factory=list)
    created: datetime = field(default_factory=datetime.now)

# Methods + Optional fields + __post_init__ for derived/validated state
@dataclass
class Product:
    name: str
    price: float
    quantity: int = 1
    description: Optional[str] = None

    def __post_init__(self):
        if self.price < 0:
            raise ValueError("price cannot be negative")
        self.total = self.price * self.quantity   # derived field

    def discount(self, pct: float) -> float:
        return self.total * (1 - pct)

p = Product("Laptop", 999.99, 2)
p.total                                  # 1999.98
p.discount(0.10)                         # 1799.982
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - the production angles dataclasses are best at: inheritance
#             (with the "no defaults before non-defaults" rule), asdict /
#             astuple for serialization, and order=True for sortable
#             value objects. Note when to step up to attrs / Pydantic.
# STRENGTHS - complete value-object story: build, validate, sort,
#             serialize — without a single hand-written method.
# WEAKNESSES- inheritance with mixed defaults/non-defaults requires
#             kw_only=True (3.10+) or careful field ordering;
#             asdict() converts deeply but isn't customizable per-type
#             without extra work.
#
from dataclasses import dataclass, field, asdict, astuple

# Inheritance: subclass fields appended; with defaults in the parent,
# either keep all subclass fields defaulted OR use kw_only=True.
@dataclass
class Animal:
    name: str
    age: int

@dataclass
class Dog(Animal):
    breed: str = "mutt"               # defaulted to satisfy ordering rule

dog = Dog("Max", 5, "Golden Retriever")
print(dog)        # Dog(name='Max', age=5, breed='Golden Retriever')

# Sortable, comparable value type
@dataclass(order=True, frozen=True)
class Version:
    major: int
    minor: int
    patch: int = 0

v1, v2, v3 = Version(1, 0, 0), Version(1, 0, 0), Version(1, 1, 0)
v1 == v2                              # True
sorted([v3, v1])                      # [Version(1,0,0), Version(1,1,0)]

# Conversion for APIs / DBs / CSVs
@dataclass
class Person:
    name: str
    age: int
    email: str

p = Person("Charlie", 28, "charlie@example.com")
asdict(p)        # {'name': 'Charlie', 'age': 28, 'email': 'charlie@example.com'}
astuple(p)       # ('Charlie', 28, 'charlie@example.com')

# When to leave @dataclass behind:
#   - need real input validation / coercion?     -> Pydantic
#   - need converters and richer field options?  -> attrs
#   - mapping to DB rows?                        -> SQLAlchemy / Django models
#
# Decision rule:
#   plain data + auto __init__/__repr__/__eq__         -> @dataclass
#   immutable hashable value type                      -> @dataclass(frozen=True)
#   sortable value type                                -> @dataclass(order=True)
#   memory-tight, millions of instances                -> @dataclass(slots=True)
#   inheritance with mixed defaults                    -> @dataclass(kw_only=True)
#   need DB / API serialization round-trip             -> asdict / astuple
#   real input validation needed                       -> Pydantic, not @dataclass
#   tiny tuple-like pair                               -> NamedTuple
#
# Anti-pattern: defaulted parent fields blocking non-default child fields
#   Inheriting from @dataclass class A: x: int = 0 and adding @dataclass
#   class B(A): y: int raises "non-default argument follows default" because
#   the generated __init__ would put y after x. Fix by giving y a default,
#   moving x's default off, or using kw_only=True (3.10+) which sidesteps
#   ordering entirely.
```

## Decision Rule

```text
plain data + auto __init__/__repr__/__eq__         -> @dataclass
immutable hashable value type                      -> @dataclass(frozen=True)
sortable value type                                -> @dataclass(order=True)
memory-tight, millions of instances                -> @dataclass(slots=True)
inheritance with mixed defaults                    -> @dataclass(kw_only=True)
need DB / API serialization round-trip             -> asdict / astuple
real input validation needed                       -> Pydantic, not @dataclass
tiny tuple-like pair                               -> NamedTuple
```

## Anti-Pattern

> [!warning] Anti-pattern
> defaulted parent fields blocking non-default child fields
>   Inheriting from @dataclass class A: x: int = 0 and adding @dataclass
>   class B(A): y: int raises "non-default argument follows default" because
>   the generated __init__ would put y after x. Fix by giving y a default,
>   moving x's default off, or using kw_only=True (3.10+) which sidesteps
>   ordering entirely.

## Tips

- Use field(default_factory=list) for mutable defaults — never use mutable as default= directly
- @dataclass(frozen=True) creates immutable classes similar to namedtuple
- __post_init__() runs after __init__ for computed fields or validation
- asdict() and astuple() convert instances to dict/tuple for serialization

## Common Mistake

> [!warning] Using mutable default in @dataclass: age: List[int] = [] shares the list across instances. Use field(default_factory=list) instead.

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

- [[Sections/oop/dataclasses/_Index|Object-Oriented Python → Modern Patterns]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

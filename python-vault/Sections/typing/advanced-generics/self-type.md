---
type: "entry"
domain: "python"
file: "typing"
section: "advanced-generics"
id: "self-type"
title: "Self Type — Methods Returning the Current Class"
category: "Advanced Generics"
subtitle: "Self, fluent interfaces, method chaining, copy, clone, builder pattern"
signature_short: "from typing import Self  |  def clone(self) -> Self: ...  |  def set_name(self, name: str) -> Self: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Self Type — Methods Returning the Current Class"
  - "self-type"
tags:
  - "python"
  - "python/typing"
  - "python/typing/advanced-generics"
  - "category/advanced-generics"
  - "tier/tiered"
---

# Self Type — Methods Returning the Current Class

> Self, fluent interfaces, method chaining, copy, clone, builder pattern

## Overview

Self type (Python 3.11+, via typing_extensions) represents the class of the current instance. Use it in methods that return self (fluent/builder APIs) or create copies (clone, copy). Without Self, you'd need to hardcode return types or use generics awkwardly. Essential for method chaining and factory patterns.

## Signature

```python
from typing import Self  |  def clone(self) -> Self: ...  |  def set_name(self, name: str) -> Self: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Annotate methods that return self with -> Self; chaining keeps the right type even in subclasses.
# STRENGTHS - Fluent APIs (Builder pattern) compose without losing the subclass type.
# WEAKNESSES- Self requires Python 3.11+; older code uses typing_extensions or a TypeVar bound to the class.
from typing import Self

class QueryBuilder:
    def __init__(self) -> None:
        self._sel: list[str] = []
        self._where: list[str] = []

    def select(self, *cols: str) -> Self:
        self._sel.extend(cols);  return self

    def where(self, cond: str) -> Self:
        self._where.append(cond);  return self

    def build(self) -> str:
        s = ", ".join(self._sel) or "*"
        w = " AND ".join(self._where)
        return f"SELECT {s}" + (f" WHERE {w}" if w else "")

# Chained calls keep the exact class type:
sql = QueryBuilder().select("id", "name").where("age > 18").build()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Self in copy/clone/with_* methods; rely on self.__class__ at runtime so subclasses are preserved.
# STRENGTHS - Immutable updates that are subclass-safe; no need to override copy() in every subclass.
# WEAKNESSES- self.__class__(*args) requires that ALL subclasses share the parent's __init__ signature.
from dataclasses import dataclass, replace
from typing import Self

class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x, self.y = x, y
    def copy(self) -> Self:
        return self.__class__(self.x, self.y)
    def shift(self, dx: float, dy: float) -> Self:
        return self.__class__(self.x + dx, self.y + dy)

class Point3D(Point):
    def __init__(self, x: float, y: float, z: float = 0.0) -> None:
        super().__init__(x, y); self.z = z

p3 = Point3D(1, 2, 3)
q3 = p3.shift(10, 10)         # mypy: Point3D, NOT Point
# (but z is 0 because Point.shift didn't know about z -- see senior pattern)

# Dataclass + Self: dataclasses.replace plays nicely.
@dataclass
class Config:
    host: str
    port: int
    debug: bool = False
    def with_debug(self, on: bool = True) -> Self:
        return replace(self, debug=on)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Self for chaining APIs; classmethod returning Self for typed factories; replace() for immutable structs.
# STRENGTHS - Fluent builders, parsers, ORMs -- subclass returns are preserved without manual overrides.
# WEAKNESSES- Self breaks if subclasses change __init__ shape; design the parent's constructor with subclassing in mind, or use replace().
from __future__ import annotations
from dataclasses import dataclass, replace
from typing import Self, TypeVar

T = TypeVar("T")

# 1) Typed factory: classmethod with -> Self gives subclass-aware constructors.
@dataclass
class HTTPRequest:
    method: str
    url: str
    headers: dict[str, str]

    @classmethod
    def get(cls, url: str) -> Self:
        return cls(method="GET", url=url, headers={})

class JSONRequest(HTTPRequest):
    pass

req: JSONRequest = JSONRequest.get("https://x.example")   # mypy: JSONRequest

# 2) Immutable update WITHOUT depending on __init__ signature compatibility:
#    dataclasses.replace handles arbitrary subclass fields.
@dataclass(frozen=True)
class Person:
    name: str
    age: int
    def older(self, by: int = 1) -> Self:
        return replace(self, age=self.age + by)

@dataclass(frozen=True)
class Employee(Person):
    title: str
    def older(self, by: int = 1) -> Self:
        return replace(self, age=self.age + by)        # title preserved!

emp = Employee("Ada", 30, "Eng").older()              # mypy: Employee, title intact

# 3) Fluent builder where the subclass adds methods -- Self lets you chain across hierarchies.
class Stmt:
    def select(self, *cols: str) -> Self: ...
class Joinable(Stmt):
    def join(self, t: str, on: str) -> Self: ...

q = Joinable().select("id").join("orders", "id=order_id").select("total")
# mypy: q is Joinable through every step.

# Decision rule:
#   method returns the same instance / a same-class clone   -> -> Self
#   factory classmethod that builds the subclass            -> @classmethod def make(cls, ...) -> Self
#   subclass adds fields, parent does immutable updates     -> dataclasses.replace + Self (NOT cls(*args))
#   need to bind to a sibling class (NOT self's class)       -> TypeVar bound=Parent, NOT Self
#   pre-3.11 codebase                                       -> from typing_extensions import Self
#
# Anti-pattern: hardcoding the parent class as a return type ('-> Builder' on a
# parent's method). Subclasses inherit the method but mypy reports the parent
# type at the call site -- chained calls then can't see subclass methods.
```

## Decision Rule

```text
method returns the same instance / a same-class clone   -> -> Self
factory classmethod that builds the subclass            -> @classmethod def make(cls, ...) -> Self
subclass adds fields, parent does immutable updates     -> dataclasses.replace + Self (NOT cls(*args))
need to bind to a sibling class (NOT self's class)       -> TypeVar bound=Parent, NOT Self
pre-3.11 codebase                                       -> from typing_extensions import Self
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding the parent class as a return type ('-> Builder' on a
> parent's method). Subclasses inherit the method but mypy reports the parent
> type at the call site -- chained calls then can't see subclass methods.

## Tips

- Self works best with builder/fluent patterns — enables method chaining while preserving the actual class type.
- Self in subclasses returns the subclass, not the parent class — this is Self's superpower.
- Use Self with copy() methods to preserve the actual type through inheritance hierarchies.
- Self is Python 3.11+ only (or typing_extensions for older versions).

## Common Mistake

> [!warning] Using class name instead of Self in methods that return self — hard-coding "def copy(self) -> QueryBuilder" breaks in subclasses. Use Self instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Naive: works on parent, breaks once a subclass adds fields
@dataclass(frozen=True)
class Person:
    name: str
    age: int
    def older(self, by: int = 1) -> "Person":          # hardcoded parent
        return self.__class__(self.name, self.age + by)

@dataclass(frozen=True)
class Employee(Person):
    title: str                                          # extra field
# Employee(...).older() now calls Person(self.name, self.age + by) — drops title!
```

**Senior:**
```python
# Self + dataclasses.replace handles subclass fields automatically
from dataclasses import dataclass, replace
from typing import Self

@dataclass(frozen=True)
class Person:
    name: str; age: int
    def older(self, by: int = 1) -> Self:
        return replace(self, age=self.age + by)         # preserves all fields

@dataclass(frozen=True)
class Employee(Person):
    title: str
# Employee("Ada", 30, "Eng").older() -> Employee(..., title="Eng")  ✓
```

## See Also

- [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/_Index|Type Hints & mypy → Advanced Generics]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

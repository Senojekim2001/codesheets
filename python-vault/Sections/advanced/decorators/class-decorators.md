---
type: "entry"
domain: "python"
file: "advanced"
section: "decorators"
id: "class-decorators"
title: "Class Decorators & Descriptor Protocol"
category: "Decorators"
subtitle: "@dataclass, custom class decorators, __get__/__set__"
signature_short: "def decorator(cls): ... return cls  |  __get__(self, obj, objtype)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Class Decorators & Descriptor Protocol"
  - "class-decorators"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/decorators"
  - "category/decorators"
  - "tier/tiered"
---

# Class Decorators & Descriptor Protocol

> @dataclass, custom class decorators, __get__/__set__

## Overview

Class decorators receive a class and return a modified class — used for adding methods, registering classes, or enforcing invariants. @dataclass is the most common class decorator. The descriptor protocol (__get__, __set__, __delete__) creates reusable attribute behaviors: validation, lazy computation, type checking. Properties are built on descriptors.

## Signature

```python
def decorator(cls): ... return cls  |  __get__(self, obj, objtype)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - A class decorator that adds __repr__
# STRENGTHS - Smallest valid class decorator: take a class, return modified class
# WEAKNESSES- No registry, no descriptors, no __init_subclass__
#
def add_repr(cls):
    def __repr__(self):
        return f"{cls.__name__}({self.__dict__})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

print(Point(3, 4))                              # Point({'x': 3, 'y': 4})
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Registry-pattern decorator + a custom descriptor for validation
# STRENGTHS - Two patterns you'll meet often in real code
# WEAKNESSES- No __init_subclass__ (the modern alternative)
#
# 1) Registry — auto-collect plugin classes for lookup by name
PARSERS = {}
def register(cls):
    PARSERS[cls.name] = cls
    return cls

@register
class JSON: name = "json"
@register
class XML:  name = "xml"

parser = PARSERS["json"]()                      # factory by name

# 2) Descriptor — reusable validated attribute (the engine behind @property)
class Validated:
    def __set_name__(self, owner, name):        # auto-receives attr name (3.6+)
        self._private = f"_{name}"
        self._name    = name
    def __get__(self, obj, objtype=None):
        if obj is None: return self              # accessed on the CLASS
        return getattr(obj, self._private, None)
    def __set__(self, obj, value):
        if not isinstance(value, int) or value < 0:
            raise ValueError(f"{self._name} must be a non-negative int")
        setattr(obj, self._private, value)

class Order:
    qty = Validated()
    price = Validated()
    def __init__(self, qty, price):
        self.qty, self.price = qty, price       # triggers __set__

Order(qty=2, price=100)                          # OK
# Order(qty=-1, price=100)  -> ValueError
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - __init_subclass__, type-safe descriptors, prefer-class-decorator-over-metaclass
# STRENGTHS - The modern alternatives that beat metaclasses in clarity
# WEAKNESSES- N/A
#
from typing import Any

# 1) __init_subclass__ — modern alternative to "class decorator + registry".
#    The base class hooks subclass creation; no decorator needed on each subclass.
PARSERS: dict[str, type] = {}

class Parser:
    def __init_subclass__(cls, *, name: str | None = None, **kw):
        super().__init_subclass__(**kw)          # MUST call super
        if name:
            PARSERS[name] = cls

class JsonParser(Parser, name="json"):  pass
class YamlParser(Parser, name="yaml"):  pass
print(PARSERS)                                   # {'json': ..., 'yaml': ...}

# 2) Type-safe descriptor with __set_name__ + generic-style typing
from typing import Generic, TypeVar, overload, Type
T = TypeVar("T")

class Field(Generic[T]):
    def __init__(self, default: T, *, validator=lambda v: True):
        self.default, self.validator = default, validator
    def __set_name__(self, owner, name):
        self.attr = f"_{name}"; self.public = name
    @overload
    def __get__(self, obj: None, objtype: Type[Any]) -> "Field[T]": ...
    @overload
    def __get__(self, obj: Any,  objtype: Type[Any]) -> T: ...
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self.attr, self.default)
    def __set__(self, obj, value: T):
        if not self.validator(value):
            raise ValueError(f"{self.public}: invalid {value!r}")
        setattr(obj, self.attr, value)

class Account:
    balance: int = Field(0, validator=lambda v: isinstance(v, int) and v >= 0)

# 3) Class decorator vs metaclass — pick the SIMPLER tool
#    Class decorator:  composes freely; one or many can stack
#    __init_subclass__: hook EVERY subclass; no per-subclass decorator
#    Metaclass:         one per hierarchy; reserve for true metaprogramming
#                       (e.g., framework-defining APIs like ABCMeta)

# Decision rule:
#   add a method / behavior to one class    -> class decorator
#   collect EVERY subclass into a registry   -> __init_subclass__ on the base
#   reusable validated/computed attribute      -> descriptor (__set_name__ + __get__/__set__)
#   need to control HOW the class is created    -> metaclass (rare; last resort)
#   modern Python                                -> dataclasses + Protocols beat hand-rolled metaprogramming
#
# Anti-pattern: a metaclass when a class decorator suffices
#   Metaclasses are sticky (only one per hierarchy), break with multiple
#   inheritance, and confuse type checkers. Reach for class decorator or
#   __init_subclass__ first; metaclass only when those genuinely cannot.
```

## Decision Rule

```text
add a method / behavior to one class    -> class decorator
collect EVERY subclass into a registry   -> __init_subclass__ on the base
reusable validated/computed attribute      -> descriptor (__set_name__ + __get__/__set__)
need to control HOW the class is created    -> metaclass (rare; last resort)
modern Python                                -> dataclasses + Protocols beat hand-rolled metaprogramming
```

## Anti-Pattern

> [!warning] Anti-pattern
> a metaclass when a class decorator suffices
>   Metaclasses are sticky (only one per hierarchy), break with multiple
>   inheritance, and confuse type checkers. Reach for class decorator or
>   __init_subclass__ first; metaclass only when those genuinely cannot.

## Tips

- __set_name__ (Python 3.6+) automatically receives the attribute name — no need to pass it manually.
- Descriptors are how @property, @staticmethod, and @classmethod work internally.
- Class decorators are simpler than metaclasses for most use cases — for an "every subclass" hook, prefer __init_subclass__ on the base (no per-subclass decorator needed).
- The registry pattern with decorators is perfect for plugin systems — but `__init_subclass__(cls, *, name=None)` plus `class Sub(Base, name="x")` is the modern, decorator-free version.

## Common Mistake

> [!warning] Reaching for a metaclass when a class decorator or __init_subclass__ would suffice — metaclasses are sticky (one per hierarchy), break with multiple inheritance, and confuse type checkers. Class decorators compose freely; __init_subclass__ hooks every subclass without modifying it.

## Shorthand (Junior → Senior)

**Junior:**
```python
def register(cls):
    _plugins[cls.__name__.lower()] = cls
    return cls

@register
class JSONParser:
    pass
```

**Senior:**
```python
def register(cls):
    return _plugins.setdefault(cls.__name__.lower(), cls) or cls
```

## See Also

- [[Sections/advanced/decorators/function-decorators|Function Decorators — Wrapping & Enhancing Functions (Advanced Python)]]
- [[Sections/advanced/decorators/_Index|Advanced Python → Decorators]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

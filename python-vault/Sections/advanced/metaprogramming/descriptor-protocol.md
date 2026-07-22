---
type: "entry"
domain: "python"
file: "advanced"
section: "metaprogramming"
id: "descriptor-protocol"
title: "Descriptor Protocol — Custom Attributes"
category: "Metaprogramming"
subtitle: "__get__, __set__, __delete__, __set_name__, cached_property"
signature_short: "def __get__(self, obj, objtype): ...  |  def __set__(self, obj, value): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Descriptor Protocol — Custom Attributes"
  - "descriptor-protocol"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/metaprogramming"
  - "category/metaprogramming"
  - "tier/tiered"
---

# Descriptor Protocol — Custom Attributes

> __get__, __set__, __delete__, __set_name__, cached_property

## Overview

Descriptors intercept attribute access via __get__ (read), __set__ (write), __delete__ (delete). They're the mechanism behind @property, @staticmethod, @classmethod, and @cached_property. __set_name__ (Python 3.6+) auto-receives the attribute name. Data descriptors (define __set__) override instance __dict__; non-data descriptors don't. Use for: validation, lazy computation, computed fields, type checking.

## Signature

```python
def __get__(self, obj, objtype): ...  |  def __set__(self, obj, value): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @property — the descriptor you already use without realizing
# STRENGTHS - The minimum-shape descriptor; built into the language
# WEAKNESSES- Not reusable across classes; senior tier covers custom descriptors
#
class Temperature:
    def __init__(self, celsius):
        self._c = celsius

    @property                             # __get__
    def celsius(self):
        return self._c

    @celsius.setter                       # __set__
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._c = value

t = Temperature(25)
t.celsius = 30                            # uses setter
# t.celsius = -300  -> ValueError
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Custom descriptor for reusable validation; cached_property for memoization
# STRENGTHS - The two patterns where rolling your own descriptor pays off
# WEAKNESSES- No data vs non-data distinction yet
#
from functools import cached_property
import time

# 1) Reusable validated attribute — write the rule ONCE, use on many fields
class Range:
    def __init__(self, min_=None, max_=None):
        self.min, self.max = min_, max_
    def __set_name__(self, owner, name):                # 3.6+: auto-receives name
        self._name = name
        self._private = f"_{name}"
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self._private)
    def __set__(self, obj, value):
        if self.min is not None and value < self.min: raise ValueError(self._name)
        if self.max is not None and value > self.max: raise ValueError(self._name)
        setattr(obj, self._private, value)

class Order:
    qty   = Range(min_=1, max_=999)
    price = Range(min_=0)
    def __init__(self, qty, price):
        self.qty, self.price = qty, price             # triggers Range.__set__

# 2) cached_property — expensive compute, paid once per instance
class Report:
    def __init__(self, rows):
        self.rows = rows
    @cached_property
    def summary(self):
        time.sleep(0.5)                                # pretend expensive
        return {"n": len(self.rows), "total": sum(self.rows)}

r = Report([1, 2, 3])
r.summary                                              # computes
r.summary                                              # instant — cached in __dict__
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Data vs non-data, generic typed descriptor, performance trade-off
# STRENGTHS - The mechanics behind every framework that uses class attributes
# WEAKNESSES- N/A
#
from typing import Generic, TypeVar, Any, Type, overload

T = TypeVar("T")

# 1) DATA descriptor (defines __set__) WINS over instance __dict__.
#    NON-DATA descriptor (only __get__) LOSES — instance __dict__ shadows it.
#    cached_property is non-data on purpose: first call writes to __dict__,
#    later access skips the descriptor entirely.

class CachedComputation:
    def __init__(self, fn):
        self.fn = fn
    def __set_name__(self, owner, name):
        self.attr = name
    def __get__(self, obj, objtype=None):              # NO __set__ -> non-data
        if obj is None: return self
        value = self.fn(obj)
        obj.__dict__[self.attr] = value                # next access skips us
        return value

# 2) Generic, type-safe descriptor — IDE / mypy preserve T
class Field(Generic[T]):
    def __init__(self, default: T):
        self.default = default
    def __set_name__(self, owner, name):
        self.attr = f"_{name}"
    @overload
    def __get__(self, obj: None, objtype: Type[Any]) -> "Field[T]": ...
    @overload
    def __get__(self, obj: Any,  objtype: Type[Any]) -> T: ...
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self.attr, self.default)
    def __set__(self, obj, value: T):
        setattr(obj, self.attr, value)

class Account:
    balance: int = Field(0)

# 3) When a method is accessed via the class, you get a function;
#    via an instance, the descriptor protocol returns a bound method.
class C:
    def m(self): pass
C.m                                                    # function
C().m                                                  # bound method (descriptor at work)

# 4) Performance — descriptor access has overhead; for HOT paths, cache
#    in __dict__ (cached_property) so subsequent reads are dict lookups.

# Decision rule:
#   one validated/computed attribute, single class -> @property / @setter
#   reusable rule across many fields                -> custom data descriptor
#   expensive pure computation, cache forever        -> @cached_property (non-data)
#   need to store private state                      -> __set_name__ + _<name> attr
#   precise types for users                            -> Generic[T] + @overload on __get__
#   read-heavy hot path                                -> cache in instance __dict__
#
# Anti-pattern: descriptor that stores state on SELF instead of obj
#   class Bad:
#       def __set__(self, obj, value): self._value = value   # SHARED across all instances
#   Use setattr(obj, self._private, value) so each instance gets its own value.
```

## Decision Rule

```text
one validated/computed attribute, single class -> @property / @setter
reusable rule across many fields                -> custom data descriptor
expensive pure computation, cache forever        -> @cached_property (non-data)
need to store private state                      -> __set_name__ + _<name> attr
precise types for users                            -> Generic[T] + @overload on __get__
read-heavy hot path                                -> cache in instance __dict__
```

## Anti-Pattern

> [!warning] Anti-pattern
> descriptor that stores state on SELF instead of obj
>   class Bad:
>       def __set__(self, obj, value): self._value = value   # SHARED across all instances
>   Use setattr(obj, self._private, value) so each instance gets its own value.

## Tips

- __set_name__ (Python 3.6+) eliminates manual name passing — the descriptor automatically knows its attribute name.
- Descriptors are how @property, @classmethod, @staticmethod work internally — they're just objects with __get__, __set__, __delete__.
- @cached_property is perfect for expensive one-time computations — and it's deliberately a NON-DATA descriptor so the first call writes the result into instance __dict__ and later accesses skip the descriptor entirely.
- Data descriptors (define __set__) take precedence over instance __dict__; non-data descriptors (only __get__) lose to it. Always store per-instance state via `setattr(obj, self._private, value)`, never on `self`, or every instance shares the same value.

## Common Mistake

> [!warning] A descriptor that stores state on `self` instead of on `obj` — every instance ends up sharing the same value silently. Use `__set_name__` to capture the attribute name and `setattr(obj, self._private, ...)` so each instance owns its own state.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Descriptor:
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)

    def __set__(self, obj, value):
        setattr(obj, self.private_name, value)
```

**Senior:**
```python
@cached_property
def expensive_value(self):
    return sum(expensive_computation())
```

## See Also

- [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation (Advanced Python)]]
- [[Sections/advanced/metaprogramming/slots-advanced|__slots__ — Memory Optimization (Advanced Python)]]
- [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement (Advanced Python)]]
- [[Sections/advanced/metaprogramming/_Index|Advanced Python → Metaprogramming]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

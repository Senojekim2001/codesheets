---
type: "entry"
domain: "python"
file: "oop"
section: "properties"
id: "property"
title: "@property"
category: "Properties"
subtitle: "Control attribute access with computed properties"
signature_short: "@property def name(self): return self._name"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@property"
  - "property"
tags:
  - "python"
  - "python/oop"
  - "python/oop/properties"
  - "category/properties"
  - "tier/tiered"
---

# @property

> Control attribute access with computed properties

## Overview

@property creates a method that is accessed like an attribute. Use @name.setter to validate or transform on assignment. This is Pythonic encapsulation — start with plain attributes and add properties only when you need logic.

## Signature

```python
@property def name(self): return self._name
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest @property: a method that reads like an
#             attribute and computes a value on access. No setter.
# STRENGTHS - introduces "computed attribute" without any of the
#             validation/deleter/caching machinery.
# WEAKNESSES- no setter, no validation, so the real motivation
#             (controlling assignment) isn't visible yet.
#
class Circle:
    def __init__(self, radius):
        self.radius = radius
    @property
    def area(self):                    # accessed as c.area, not c.area()
        return 3.14159 * self.radius ** 2

c = Circle(5)
c.area      # 78.5398...   — looks like an attribute, runs the method
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - getter + setter pair so assignment can validate. Pair a
#             "primary" property with a derived one whose setter writes
#             back through the primary.
# STRENGTHS - this is the everyday use of @property: validate on write,
#             keep one source of truth (_celsius), expose multiple
#             views without storing duplicates.
# WEAKNESSES- still recomputes on every read; if the computation is
#             expensive, each access pays the cost. See @cached_property
#             in the senior tier.
#
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius            # leading _ = "private by convention"

    @property
    def celsius(self):
        return self._celsius
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError(f"Temperature below absolute zero: {value}")
        self._celsius = value

    @property
    def fahrenheit(self):                  # derived view of _celsius
        return self._celsius * 9 / 5 + 32
    @fahrenheit.setter
    def fahrenheit(self, value):
        self.celsius = (value - 32) * 5 / 9   # routes through validation

t = Temperature(25)
t.celsius              # 25     — looks like attribute, runs getter
t.celsius = 100        # runs setter with validation
t.fahrenheit           # 212.0  — computed on access
# t.celsius = -300     # ValueError
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - @cached_property for expensive one-shot computation;
#             explicit deleter; abstract @property in an ABC so the
#             interface is enforced; type hints throughout.
# STRENGTHS - cache pays the cost once per instance; deleter clears it
#             when inputs change; ABC lets call sites rely on a stable
#             contract without inheritance brittleness.
# WEAKNESSES- @cached_property requires __dict__ (no slots) or an
#             explicit __slots__ slot for the cached name; ABC adds an
#             import and a small class-creation cost.
#
from abc import ABC, abstractmethod
from functools import cached_property

class Dataset(ABC):
    @property
    @abstractmethod
    def source(self) -> str: ...

class CSVDataset(Dataset):
    def __init__(self, path: str):
        self._path = path
    @property
    def source(self) -> str:
        return self._path
    @source.setter
    def source(self, value: str) -> None:
        if not value.endswith(".csv"):
            raise ValueError("source must be a .csv path")
        self._path = value
        # invalidate any cached derived data when source changes:
        self.__dict__.pop("rows", None)
    @cached_property
    def rows(self) -> list[str]:
        # imagine this is slow — runs once per instance
        print(f"loading {self._path} ...")
        return ["row1", "row2"]

ds = CSVDataset("data.csv")
ds.rows         # prints "loading ..." then ['row1', 'row2']
ds.rows         # cached — no print
ds.source = "other.csv"   # invalidates cache via the setter
ds.rows         # prints "loading ..." again
#
# Decision rule:
#   plain attribute, no logic                         -> just self.x = ...
#   compute on access, cheap                          -> @property
#   compute once, cache on instance                   -> @cached_property
#   validate on assignment                            -> @property + @x.setter
#   read-only public field                            -> @property without setter
#   same validation across many fields                -> custom descriptor
#   abstract attribute in a base class                -> @property + @abstractmethod
#   need to invalidate cache when inputs change       -> setter that pops cached key
#
# Anti-pattern: Java-style get_x()/set_x() methods or @property on every field
#   New Python users wrap every attribute in @property "for safety", which
#   adds boilerplate without adding behavior. Start with plain attributes;
#   promote to @property only when you need validation, computation, or
#   want to preserve a public API while changing internal storage.
```

## Decision Rule

```text
plain attribute, no logic                         -> just self.x = ...
compute on access, cheap                          -> @property
compute once, cache on instance                   -> @cached_property
validate on assignment                            -> @property + @x.setter
read-only public field                            -> @property without setter
same validation across many fields                -> custom descriptor
abstract attribute in a base class                -> @property + @abstractmethod
need to invalidate cache when inputs change       -> setter that pops cached key
```

## Anti-Pattern

> [!warning] Anti-pattern
> Java-style get_x()/set_x() methods or @property on every field
>   New Python users wrap every attribute in @property "for safety", which
>   adds boilerplate without adding behavior. Start with plain attributes;
>   promote to @property only when you need validation, computation, or
>   want to preserve a public API while changing internal storage.

## Tips

- Start with plain attributes — add @property only when you need getter/setter logic
- Use _name convention for "private" attributes (Python has no true private)
- Read-only properties: define @property but no setter
- @cached_property (Python 3.8+) computes once and caches the result

## Common Mistake

> [!warning] Adding @property getters and setters for all attributes by default. This is Java-style over-engineering. Use plain attributes until you need validation or computation.

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

- [[Sections/oop/properties/descriptors|Descriptors (Object-Oriented Python)]]
- [[Sections/oop/properties/classmethod|@classmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/staticmethod|@staticmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/protocol-oop|Protocol (Object-Oriented Python)]]
- [[Sections/oop/properties/_Index|Object-Oriented Python → Properties & Descriptors]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

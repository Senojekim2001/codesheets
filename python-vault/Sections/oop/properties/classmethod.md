---
type: "entry"
domain: "python"
file: "oop"
section: "properties"
id: "classmethod"
title: "@classmethod"
category: "Properties"
subtitle: "Alternative constructors that work correctly with subclasses"
signature_short: "@classmethod\\n    def from_x(cls, ...): return cls(...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@classmethod"
  - "classmethod"
tags:
  - "python"
  - "python/oop"
  - "python/oop/properties"
  - "category/properties"
  - "tier/tiered"
---

# @classmethod

> Alternative constructors that work correctly with subclasses

## Overview

@classmethod receives cls (the class itself) instead of self. This enables factory methods and alternative constructors. Always use cls() not ClassName() inside — ensures subclasses get the right type back.

## Signature

```python
@classmethod\n    def from_x(cls, ...): return cls(...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one alternative constructor that parses a string. The
#             classmethod receives cls and uses cls(...) to build the
#             instance.
# STRENGTHS - shows the canonical use: a from_X() factory that lives
#             on the class, called as Date.from_string("...").
# WEAKNESSES- only one factory; the value of using cls() over
#             ClassName() doesn't show until a subclass exists.
#
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):              # cls is the class, not an instance
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)               # cls() will work in subclasses

Date.from_string("2024-03-15").year      # 2024
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - several alternative constructors plus a @staticmethod for
#             stateless validation, all grouped on the class. Contrast
#             classmethod (gets cls) with staticmethod (gets nothing).
# STRENGTHS - mirrors the most common pattern in real codebases:
#             Foo.from_dict / .from_string / .today, with a small
#             validation utility next to them.
# WEAKNESSES- no type hints; doesn't yet show how cls() preserves the
#             subclass type — that's the point of the senior tier.
#
import datetime as _dt

class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)

    @classmethod
    def today(cls):
        d = _dt.date.today()
        return cls(d.year, d.month, d.day)

    @staticmethod
    def is_valid(year, month, day):
        return 1 <= month <= 12 and 1 <= day <= 31

Date.from_string("2024-03-15")
Date.today()
Date.is_valid(2024, 13, 1)            # False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - type hints with typing.Self so the factory's return type
#             tracks the actual subclass. Demonstrate that cls() (not
#             ClassName()) is what makes inheritance work correctly.
# STRENGTHS - subclasses get the right type back from from_string()
#             without overriding it; mypy/pyright understand the return.
# WEAKNESSES- typing.Self requires Python 3.11+; for older versions use
#             "Date" string-typed return + TypeVar.
#
from typing import Self
import datetime as _dt

class Date:
    def __init__(self, year: int, month: int, day: int) -> None:
        self.year, self.month, self.day = year, month, day
    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.year}, {self.month}, {self.day})"

    @classmethod
    def from_string(cls, s: str) -> Self:
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)        # cls preserves the subclass identity

    @classmethod
    def today(cls) -> Self:
        d = _dt.date.today()
        return cls(d.year, d.month, d.day)

class FiscalDate(Date):
    """Same shape, but it's now a fiscal date."""

FiscalDate.from_string("2024-03-15")   # FiscalDate(2024, 3, 15)  ✓
FiscalDate.today()                     # FiscalDate(...) — not a Date

# Anti-pattern to avoid:
#   return Date(y, m, d)    <-- always returns the base class, breaks subclasses
#
# Decision rule:
#   alternative constructor (from_string, from_dict)  -> @classmethod
#   needs the class but not an instance               -> @classmethod
#   stateless utility, no class state needed          -> @staticmethod
#   subclasses should get instances of themselves     -> @classmethod with cls()
#   factory that picks among subclasses (registry)    -> @classmethod on base
#   utility totally unrelated to class state          -> module-level function
#   need to access class variables (config, registry) -> @classmethod
#
# Anti-pattern: hardcoding ClassName(...) inside a classmethod
#   When a subclass calls Date.from_string("..."), they expect a Date
#   instance back. If the body says return Date(y, m, d) instead of
#   cls(y, m, d), every subclass silently downgrades to the base class.
#   Always use cls() — that's the entire reason classmethod exists.
```

## Decision Rule

```text
alternative constructor (from_string, from_dict)  -> @classmethod
needs the class but not an instance               -> @classmethod
stateless utility, no class state needed          -> @staticmethod
subclasses should get instances of themselves     -> @classmethod with cls()
factory that picks among subclasses (registry)    -> @classmethod on base
utility totally unrelated to class state          -> module-level function
need to access class variables (config, registry) -> @classmethod
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding ClassName(...) inside a classmethod
>   When a subclass calls Date.from_string("..."), they expect a Date
>   instance back. If the body says return Date(y, m, d) instead of
>   cls(y, m, d), every subclass silently downgrades to the base class.
>   Always use cls() — that's the entire reason classmethod exists.

## Tips

- Always use cls() not ClassName() inside a classmethod — ensures subclasses get the right type
- First argument is cls by convention — any name works but cls is universal
- Call on the class: Date.today() or on an instance — both receive the class
- classmethod is the standard pattern for alternative constructors like from_string(), from_dict()

## Common Mistake

> [!warning] Using ClassName() directly inside a classmethod instead of cls(). If someone subclasses, cls() returns the subclass instance; ClassName() always returns the base class.

## Shorthand (Junior → Senior)

**Junior:**
```python
from datetime import datetime, timedelta
class Date:
def __init__(self, year, month, day):
self.year, self.month, self.day = year, month, day
```

**Senior:**
```python
Date.is_valid(2024, 13, 1)           # False
```

## See Also

- [[Sections/oop/properties/property|@property (Object-Oriented Python)]]
- [[Sections/oop/properties/descriptors|Descriptors (Object-Oriented Python)]]
- [[Sections/oop/properties/staticmethod|@staticmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/protocol-oop|Protocol (Object-Oriented Python)]]
- [[Sections/oop/properties/_Index|Object-Oriented Python → Properties & Descriptors]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

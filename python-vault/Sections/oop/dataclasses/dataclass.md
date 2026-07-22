---
type: "entry"
domain: "python"
file: "oop"
section: "dataclasses"
id: "dataclass"
title: "@dataclass"
category: "Modern"
subtitle: "Boilerplate-free data containers"
signature_short: "from dataclasses import dataclass\\n@dataclass\\nclass Foo:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@dataclass"
  - "dataclass"
tags:
  - "python"
  - "python/oop"
  - "python/oop/dataclasses"
  - "category/modern"
  - "tier/tiered"
---

# @dataclass

> Boilerplate-free data containers

## Overview

@dataclass (Python 3.7+) auto-generates __init__, __repr__, and __eq__ from class variable annotations. Use field() for defaults and configuration. frozen=True makes instances immutable and hashable.

## Signature

```python
from dataclasses import dataclass\n@dataclass\nclass Foo:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest @dataclass: just type-annotated fields. The
#             decorator generates __init__, __repr__, and __eq__.
# STRENGTHS - shows the immediate win — three magic methods for free —
#             without any options or edge cases.
# WEAKNESSES- skips mutable defaults (the #1 trap), frozen, post-init.
#
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
p.x                       # 1.0
repr(p)                   # 'Point(x=1.0, y=2.0)'  ← generated
p == Point(1.0, 2.0)      # True                   ← generated
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the day-to-day toolbox: field(default_factory=...) for
#             mutable defaults, frozen=True for hashable value objects,
#             __post_init__ for invariants, order=True for sortability.
# STRENGTHS - hits the four features people reach for every week;
#             documents the "never use [] as a default" rule in code.
# WEAKNESSES- doesn't yet show slots/kw_only/asdict — those are the
#             senior-tier sharpening tools.
#
from dataclasses import dataclass, field
from typing import List

# Defaults and mutable factories
@dataclass
class Employee:
    name: str
    department: str
    salary: float = 50000.0
    tags: List[str] = field(default_factory=list)   # NEVER use = []

# Immutable (and therefore hashable)
@dataclass(frozen=True)
class Coordinate:
    lat: float
    lon: float

# Post-init validation
@dataclass
class Circle:
    radius: float
    def __post_init__(self):
        if self.radius < 0:
            raise ValueError(f"Radius must be non-negative: {self.radius}")

# Sortable, but ignore the name in comparisons
@dataclass(order=True)
class Score:
    value: int
    name: str = field(compare=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - reach for the production options: slots=True for memory,
#             kw_only=True to lock call sites, asdict/astuple for
#             serialization, and __post_init__ for derived fields. Also
#             consider attrs / Pydantic when you need real validation.
# STRENGTHS - tight memory; safer call sites (kw_only prevents arg
#             swaps); easy round-trip with dict-based serializers.
# WEAKNESSES- slots=True (3.10+) makes inheritance and weakref slightly
#             trickier; kw_only is more verbose at call sites; asdict
#             is recursive but not customizable per-type without work.
#
from dataclasses import dataclass, field, asdict, astuple
from typing import Optional

@dataclass(slots=True, kw_only=True, order=True)
class User:
    id: int
    name: str
    email: Optional[str] = None
    tags: list[str] = field(default_factory=list, compare=False)
    full: str = field(init=False, repr=False)        # derived field

    def __post_init__(self) -> None:
        self.full = f"{self.name} <{self.email or 'no-email'}>"

# kw_only=True: positional args are forbidden — call sites are explicit
u = User(id=1, name="Alice", email="a@example.com")
v = User(id=2, name="Bob")

asdict(u)       # nested dicts — handy for JSON / API responses
astuple(u)      # for CSV rows or DB params

sorted([u, v])  # works thanks to order=True; tags excluded by compare=False

# When @dataclass isn't enough:
#   - need real input validation (types, ranges)? -> Pydantic
#   - need __slots__ + converters + validators?    -> attrs
#   - need ORM-mapped fields?                      -> SQLAlchemy / Django models
#
# Decision rule:
#   plain data container with 2+ fields              -> @dataclass
#   immutable / hashable / safe in sets              -> @dataclass(frozen=True)
#   millions of small instances, memory matters      -> @dataclass(slots=True)
#   call sites with many similar args (lat/lon)      -> @dataclass(kw_only=True)
#   need real input validation / coercion            -> Pydantic BaseModel
#   need converters + rich field options             -> attrs.define
#   maps to a DB row / ORM entity                    -> SQLAlchemy / Django model
#   tiny pair of values, want tuple semantics        -> NamedTuple
#
# Anti-pattern: using = [] or = {} as a default
#   @dataclass class C: items: list = [] raises ValueError at class
#   creation because every instance would share the same list. Use
#   field(default_factory=list) instead — Python will call list() per
#   instance. Same for dict, set, and any other mutable default.
```

## Decision Rule

```text
plain data container with 2+ fields              -> @dataclass
immutable / hashable / safe in sets              -> @dataclass(frozen=True)
millions of small instances, memory matters      -> @dataclass(slots=True)
call sites with many similar args (lat/lon)      -> @dataclass(kw_only=True)
need real input validation / coercion            -> Pydantic BaseModel
need converters + rich field options             -> attrs.define
maps to a DB row / ORM entity                    -> SQLAlchemy / Django model
tiny pair of values, want tuple semantics        -> NamedTuple
```

## Anti-Pattern

> [!warning] Anti-pattern
> using = [] or = {} as a default
>   @dataclass class C: items: list = [] raises ValueError at class
>   creation because every instance would share the same list. Use
>   field(default_factory=list) instead — Python will call list() per
>   instance. Same for dict, set, and any other mutable default.

## Tips

- Use field(default_factory=list) for mutable defaults — never default=[]
- frozen=True makes the dataclass hashable and immutable
- __post_init__ runs after __init__ — use it for validation and derived fields
- For complex cases, consider attrs or Pydantic (adds validation and serialization)

## Common Mistake

> [!warning] Using a mutable default: @dataclass class C: items: list = []. Python raises TypeError. Use field(default_factory=list) instead.

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

- [[Sections/oop/dataclasses/context-manager|Context managers (Object-Oriented Python)]]
- [[Sections/oop/dataclasses/_Index|Object-Oriented Python → Modern Patterns]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

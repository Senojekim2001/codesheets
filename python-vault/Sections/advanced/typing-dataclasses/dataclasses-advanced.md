---
type: "entry"
domain: "python"
file: "advanced"
section: "typing-dataclasses"
id: "dataclasses-advanced"
title: "Dataclasses — Advanced Patterns"
category: "Dataclasses"
subtitle: "@dataclass(frozen=True, slots=True), field(default_factory=), __post_init__, KW_ONLY divider"
signature_short: "@dataclass(frozen=True, slots=True)  |  field(default_factory=list)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dataclasses — Advanced Patterns"
  - "dataclasses-advanced"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/typing-dataclasses"
  - "category/dataclasses"
  - "tier/tiered"
---

# Dataclasses — Advanced Patterns

> @dataclass(frozen=True, slots=True), field(default_factory=), __post_init__, KW_ONLY divider

## Overview

Dataclasses (Python 3.7+) auto-generate __init__, __repr__, __eq__, and optionally __hash__, __order__. Advanced features: frozen=True for immutable instances, slots=True (3.10+) for memory savings, field() for defaults and metadata, __post_init__ for validation, KW_ONLY (3.10+) for keyword-only fields. For validation at runtime, use Pydantic or attrs instead.

## Signature

```python
@dataclass(frozen=True, slots=True)  |  field(default_factory=list)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @dataclass auto-generates __init__ / __repr__ / __eq__
# STRENGTHS - The minimum-shape dataclass; no boilerplate
# WEAKNESSES- No frozen, no factories, no __post_init__
#
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(3, 4)
print(p)                                          # Point(x=3, y=4)  (auto-repr)
print(p == Point(3, 4))                           # True             (auto-eq)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - frozen, default_factory, __post_init__, ClassVar, asdict / replace
# STRENGTHS - The five features you'll use in real dataclasses
# WEAKNESSES- No KW_ONLY, no slots
#
import time
from dataclasses import dataclass, field, asdict, replace
from typing import ClassVar

@dataclass(frozen=True)                           # immutable -> hashable
class Config:
    name:        str
    tags:        list[str] = field(default_factory=list)   # MUTABLE default — MUST factory
    created_at:  float     = field(default_factory=time.time, repr=False)
    MAX_TAGS:    ClassVar[int] = 10                # class-var, NOT a field

    def __post_init__(self):
        if not self.name:
            raise ValueError("name required")
        if len(self.tags) > self.MAX_TAGS:
            raise ValueError("too many tags")

c = Config(name="myapp", tags=["web"])
# c.name = "x"   # raises FrozenInstanceError
c2 = replace(c, name="otherapp")                   # immutable copy with override
asdict(c)                                          # plain dict serialization
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - slots, KW_ONLY, sortable order, inheritance rules, vs Pydantic
# STRENGTHS - The patterns that turn dataclasses from "nice" to "production"
# WEAKNESSES- N/A
#
from dataclasses import dataclass, field, KW_ONLY

# 1) slots=True (3.10+) — no __dict__, smaller / faster instances
@dataclass(frozen=True, slots=True)               # immutable + memory-efficient
class Vec2:
    x: float
    y: float
    def add(self, other: "Vec2") -> "Vec2":
        return Vec2(self.x + other.x, self.y + other.y)

# 2) KW_ONLY (3.10+) — force keyword args after this point; safer evolution
@dataclass
class Request:
    url:     str
    method:  str = "GET"
    _:       KW_ONLY                              # marker; everything below is kw-only
    headers: dict[str, str] = field(default_factory=dict)
    timeout: float = 30.0

Request("https://x", "POST", headers={"X": "1"}, timeout=5)

# 3) order=True — generate __lt__/__le__/... ; pre-compute a sort_index in __post_init__
@dataclass(order=True)
class Version:
    sort_index: tuple = field(init=False, repr=False)
    major: int
    minor: int
    patch: int
    def __post_init__(self):
        # __setattr__ on a non-frozen dataclass works directly
        self.sort_index = (self.major, self.minor, self.patch)

# 4) Inheritance rule — fields with defaults can't precede fields without
@dataclass
class Animal:
    name: str
    sound: str = "..."

@dataclass
class Dog(Animal):
    breed: str                                     # OK only because Animal.sound has a default
    sound: str = "woof"                             # override the default

# 5) Dataclass vs Pydantic vs attrs
#    @dataclass                          stdlib; minimal; no runtime validation
#    pydantic.BaseModel                  runtime validation, JSON schema, parsers
#    attrs                               more powerful (converters, validators) than stdlib

# 6) Common bugs and rules
#    - Mutable default: field(default_factory=list); never list = []
#    - Frozen + slots: hashable; perfect for dict keys / sets
#    - Don't use eq=False with order=True (won't compile)
#    - For runtime VALIDATION (API payloads), reach for Pydantic, not __post_init__

# Decision rule:
#   simple value object                       -> @dataclass
#   immutable / hashable                       -> @dataclass(frozen=True, slots=True)
#   memory-critical, many instances             -> slots=True
#   need to sort                                  -> @dataclass(order=True)
#   API payload / runtime validation             -> Pydantic BaseModel
#   converters, hooks, more declarative           -> attrs library
#   mutable default                                -> field(default_factory=list)
#
# Anti-pattern: items: list = []
#   Every instance shares the SAME list. Use field(default_factory=list).
```

## Decision Rule

```text
simple value object                       -> @dataclass
immutable / hashable                       -> @dataclass(frozen=True, slots=True)
memory-critical, many instances             -> slots=True
need to sort                                  -> @dataclass(order=True)
API payload / runtime validation             -> Pydantic BaseModel
converters, hooks, more declarative           -> attrs library
mutable default                                -> field(default_factory=list)
```

## Anti-Pattern

> [!warning] Anti-pattern
> items: list = []
>   Every instance shares the SAME list. Use field(default_factory=list).

## Tips

- frozen=True + slots=True is the most efficient immutable container — less memory and hashable.
- Use field(default_factory=list) for mutable defaults — field(default=[]) is a shared mutable bug.
- __post_init__ runs after __init__ — use it for validation, computed fields, and normalization. For runtime VALIDATION of API payloads, reach for Pydantic, not __post_init__.
- replace() creates a shallow copy with modifications — like a spread operator for dataclasses. KW_ONLY (3.10+) marks every field after it as keyword-only, which keeps subclass field ordering safe as the schema evolves.

## Common Mistake

> [!warning] Using a mutable default directly: `@dataclass class C: items: list = []` — all instances share the SAME list. Use `field(default_factory=list)`. Library choice: stdlib @dataclass for value objects, Pydantic for API payloads with runtime validation, attrs for converters/hooks, msgspec for the encoding/decoding hot path.

## Shorthand (Junior → Senior)

**Junior:**
```python
@dataclass
class Config:
    name: str
    tags: list[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
```

**Senior:**
```python
@dataclass(frozen=True, slots=True)
class Config:
    name: str
    tags: list[str] = field(default_factory=list)
```

## See Also

- [[Sections/advanced/advanced-patterns-py/dataclass-advanced|Dataclasses Advanced — Frozen, Post Init, Inheritance (Advanced Python)]]
- [[Sections/advanced/typing-dataclasses/_Index|Advanced Python → Typing & Dataclasses]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

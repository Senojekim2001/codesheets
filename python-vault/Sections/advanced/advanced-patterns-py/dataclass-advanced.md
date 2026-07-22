---
type: "entry"
domain: "python"
file: "advanced"
section: "advanced-patterns-py"
id: "dataclass-advanced"
title: "Dataclasses Advanced — Frozen, Post Init, Inheritance"
category: "Dataclasses"
subtitle: "@dataclass(frozen=True, slots=True), __post_init__, field(default_factory=), InitVar, KW_ONLY divider"
signature_short: "@dataclass(frozen=True)  |  def __post_init__(self): ...  |  field(default_factory=...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dataclasses Advanced — Frozen, Post Init, Inheritance"
  - "dataclass-advanced"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/advanced-patterns-py"
  - "category/dataclasses"
  - "tier/tiered"
---

# Dataclasses Advanced — Frozen, Post Init, Inheritance

> @dataclass(frozen=True, slots=True), __post_init__, field(default_factory=), InitVar, KW_ONLY divider

## Overview

Advanced @dataclass features: frozen=True creates immutable instances, __post_init__ runs after __init__ for validation, field(default_factory=...) for mutable defaults, KW_ONLY for keyword-only parameters, inheritance with field ordering. Frozen dataclasses are hashable and safe for use as dict keys. Use __post_init__ for computed fields or validation.

## Signature

```python
@dataclass(frozen=True)  |  def __post_init__(self): ...  |  field(default_factory=...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - frozen=True for immutability + hashability
# STRENGTHS - The minimum-shape immutable dataclass — usable as dict key
# WEAKNESSES- No __post_init__; no factories
#
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(3, 4)
# p.x = 5   # FrozenInstanceError
{p: "origin"}                                      # hashable, OK as dict key
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - __post_init__ validation, default_factory, KW_ONLY, replace, asdict
# STRENGTHS - The five features you'll reach for in real dataclasses
# WEAKNESSES- No InitVar; no inheritance ordering deep dive
#
import time
from dataclasses import dataclass, field, asdict, replace, KW_ONLY

@dataclass
class User:
    name:  str
    email: str
    tags:  list[str] = field(default_factory=list)        # MUTABLE default — must factory
    created_at: float = field(default_factory=time.time, repr=False)
    _:     KW_ONLY                                          # everything below is kw-only
    is_admin: bool = False

    def __post_init__(self):                                # runs after __init__
        if not self.name.strip():
            raise ValueError("name required")
        if "@" not in self.email:
            raise ValueError("invalid email")
        self.email = self.email.lower()                     # normalize in place

u = User("Alice", "ALICE@x.com", is_admin=True)
print(u.email)                                              # 'alice@x.com'
asdict(u)                                                    # plain dict
replace(u, is_admin=False)                                   # immutable-style copy with override
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - InitVar, inheritance pitfalls, field ordering, dataclass vs Pydantic vs attrs
# STRENGTHS - The deep tradeoffs that decide which library to reach for
# WEAKNESSES- N/A
#
from dataclasses import dataclass, field, InitVar

# 1) InitVar — accept a constructor arg that ISN'T stored as a field
@dataclass
class Article:
    title:    str
    body:     str
    word_count: int = field(init=False)                     # filled in __post_init__
    raw:      InitVar[str | None] = None                    # NOT a field

    def __post_init__(self, raw):
        if raw and not self.body:
            self.body = raw.strip()
        self.word_count = len(self.body.split())

a = Article(title="Hello", body="", raw="hi there world")
print(a.word_count)                                          # 3

# 2) INHERITANCE pitfall — fields with defaults can't precede fields without
@dataclass
class Base:
    a: int
    b: int = 0
@dataclass
class Sub(Base):
    c: int                                                   # OK only because Base.b has a default
    d: int = 0

# 3) field(init=False) — derived field excluded from __init__ AND from order=
@dataclass(order=True)
class Version:
    sort_index: tuple = field(init=False, repr=False)
    major: int
    minor: int
    patch: int
    def __post_init__(self):
        # Frozen=False -> direct assignment OK; for frozen, use object.__setattr__
        self.sort_index = (self.major, self.minor, self.patch)

# 4) FROZEN dataclasses — assignment in __post_init__ needs object.__setattr__
@dataclass(frozen=True)
class Hashed:
    value: str
    _hash: int = field(init=False, repr=False)
    def __post_init__(self):
        object.__setattr__(self, "_hash", hash(self.value))  # bypasses frozen guard

# 5) Library choice — pick by the kind of validation you need
#    @dataclass            stdlib; types are HINTS only; runtime ignores them
#    pydantic.BaseModel    runtime validation, JSON schema, parsers; FastAPI default
#    attrs (attr.s)        most powerful (converters, validators); pre-dataclasses king
#    msgspec.Struct        fastest; struct-like, schema-aware, no Pydantic dependency

# 6) Common bugs and their fixes
#    - items: list = []                 -> field(default_factory=list)
#    - frozen + computed field           -> object.__setattr__ in __post_init__
#    - InitVar fields appear in repr     -> they don't (good); also not in asdict
#    - inheritance with defaults         -> reorder so all "no-default" fields come first

# Decision rule:
#   simple value object                       -> @dataclass
#   immutable / hashable / dict key            -> @dataclass(frozen=True)
#   API payload, JSON in, JSON out             -> Pydantic BaseModel
#   converters / pre-process arguments          -> attrs (or @dataclass + InitVar)
#   raw speed (encoding/decoding hot path)      -> msgspec.Struct
#   computed-only field, not in __init__        -> field(init=False) + __post_init__
#
# Anti-pattern: validation logic in __init__ via custom subclass of @dataclass
#   You've recreated half of Pydantic poorly. If validation is non-trivial,
#   adopt Pydantic / attrs — they handle dependencies, error aggregation, and
#   serialization properly.
```

## Decision Rule

```text
simple value object                       -> @dataclass
immutable / hashable / dict key            -> @dataclass(frozen=True)
API payload, JSON in, JSON out             -> Pydantic BaseModel
converters / pre-process arguments          -> attrs (or @dataclass + InitVar)
raw speed (encoding/decoding hot path)      -> msgspec.Struct
computed-only field, not in __init__        -> field(init=False) + __post_init__
```

## Anti-Pattern

> [!warning] Anti-pattern
> validation logic in __init__ via custom subclass of @dataclass
>   You've recreated half of Pydantic poorly. If validation is non-trivial,
>   adopt Pydantic / attrs — they handle dependencies, error aggregation, and
>   serialization properly.

## Tips

- frozen=True + dataclass creates an immutable, hashable object perfect for dict keys.
- __post_init__ is perfect for validation — raise exceptions before the object is used. For non-trivial validation (API payloads, error aggregation, JSON in/out), reach for Pydantic / attrs instead of recreating them inside __post_init__.
- Use field(init=False) to exclude computed fields from __init__ — they're initialized in __post_init__. On a `frozen=True` class, you can't do `self.x = ...`; use `object.__setattr__(self, "x", value)` to bypass the frozen guard.
- replace() creates a shallow copy with overrides — immutable dataclasses need this for "updates". Use `InitVar[T]` to accept a constructor-only argument that's not stored as a field (it's passed into `__post_init__`).

## Common Mistake

> [!warning] Using mutable defaults without field(default_factory=) — `@dataclass class C: items: list = []` is a shared mutable bug. Also: inheritance with default-bearing fields ahead of no-default fields is a TypeError; reorder so all required fields come first, or move them after `_: KW_ONLY`.

## Shorthand (Junior → Senior)

**Junior:**
```python
@dataclass
class User:
    name: str
    age: int

    def __post_init__(self):
        if not self.name:
            raise ValueError("name required")
        if self.age < 0:
            raise ValueError("age invalid")
```

**Senior:**
```python
@dataclass(frozen=True)
class User:
    name: str
    age: int = field(gt=0)  # requires pydantic
```

## See Also

- [[Sections/advanced/typing-dataclasses/dataclasses-advanced|Dataclasses — Advanced Patterns (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/_Index|Advanced Python → Advanced Patterns]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

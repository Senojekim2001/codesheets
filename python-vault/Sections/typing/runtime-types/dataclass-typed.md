---
type: "entry"
domain: "python"
file: "typing"
section: "runtime-types"
id: "dataclass-typed"
title: "Typed Dataclasses — Type Hints + Data Structures"
category: "Runtime"
subtitle: "@dataclass, frozen=True, slots=True, kw_only=True, field(default_factory=), __post_init__, replace()"
signature_short: "@dataclass(frozen=True, slots=True, kw_only=True)  |  field(default_factory=list)  |  dataclasses.replace(obj, x=1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Typed Dataclasses — Type Hints + Data Structures"
  - "dataclass-typed"
tags:
  - "python"
  - "python/typing"
  - "python/typing/runtime-types"
  - "category/runtime"
  - "tier/tiered"
---

# Typed Dataclasses — Type Hints + Data Structures

> @dataclass, frozen=True, slots=True, kw_only=True, field(default_factory=), __post_init__, replace()

## Overview

@dataclass generates __init__/__repr__/__eq__ from annotations. The production recipe is @dataclass(frozen=True, slots=True, kw_only=True): hashable + cache-key-safe (frozen), ~30-40% memory savings (slots), and explicit construction sites (kw_only). field(default_factory=...) avoids the shared-mutable-default footgun. __post_init__ runs after __init__ for validation/coercion. Reach for Pydantic / msgspec / attrs only when you need runtime type validation — dataclasses are for SHAPE.

## Signature

```python
@dataclass(frozen=True, slots=True, kw_only=True)  |  field(default_factory=list)  |  dataclasses.replace(obj, x=1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @dataclass auto-generates __init__/__repr__/__eq__ from annotations.
# STRENGTHS - Eliminates boilerplate; type hints become real fields with one decorator.
# WEAKNESSES- No runtime type validation -- annotations are not enforced unless you write a check.
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: str = "unknown@example.com"

u = User(name="Alice", age=30)
print(u)        # User(name='Alice', age=30, email='unknown@example.com')
print(u == User("Alice", 30))   # True -- __eq__ generated
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - field(default_factory=...) for mutable defaults; __post_init__ for validation; KW_ONLY for safety; ClassVar to opt out.
# STRENGTHS - Avoids the "mutable default shared between instances" footgun; keyword-only args prevent positional confusion.
# WEAKNESSES- __post_init__ runs after every constructor; expensive validation in a hot constructor adds up.
from dataclasses import dataclass, field, KW_ONLY
from typing import ClassVar

# Mutable defaults: ALWAYS via default_factory.
@dataclass
class Team:
    name: str
    members: list[str] = field(default_factory=list)        # NOT default=[]
    tags: dict[str, str] = field(default_factory=dict)

a = Team("A"); b = Team("B")
a.members.append("alice")
assert b.members == []      # not shared

# Validation hook.
@dataclass
class Product:
    sku: str
    price: float
    def __post_init__(self) -> None:
        if self.price < 0:
            raise ValueError("price must be >= 0")

# KW_ONLY divider -- everything after is keyword-only.
@dataclass
class Connection:
    host: str
    port: int
    _: KW_ONLY
    timeout: float = 5.0
    tls: bool = True

# Connection("h", 80, 5.0, True)         # TypeError: takes 3 positionals
Connection("h", 80, timeout=2.0)

# ClassVar is not a field; doesn't appear in __init__.
@dataclass
class Counter:
    name: str
    total: ClassVar[int] = 0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - frozen=True for value semantics, slots=True for memory, kw_only=True at the decorator, replace() for updates.
# STRENGTHS - Hashable / cache-key safe / forgery-safe data; lower memory footprint at scale; explicit construction sites.
# WEAKNESSES- frozen instances disallow assignment in __post_init__ -- use object.__setattr__; slots breaks pickling of certain class hierarchies.
from __future__ import annotations
from dataclasses import dataclass, field, replace, KW_ONLY, asdict
from datetime import datetime
from typing import ClassVar, Self

# 1) Production-grade record: frozen, slots, kw-only, validated.
@dataclass(frozen=True, slots=True, kw_only=True)
class APIRequest:
    endpoint: str
    method: str = "GET"
    params:  dict[str, str] = field(default_factory=dict)
    headers: dict[str, str] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

    _ALLOWED: ClassVar[frozenset[str]] = frozenset({"GET", "POST", "PUT", "DELETE", "PATCH"})

    def __post_init__(self) -> None:
        if self.method not in self._ALLOWED:
            raise ValueError(f"unknown method: {self.method}")
        # frozen=True: must use object.__setattr__ if you need to coerce a field.
        object.__setattr__(self, "method", self.method.upper())

    def with_header(self, key: str, value: str) -> Self:
        new_hdr = {**self.headers, key: value}
        return replace(self, headers=new_hdr)

# 2) Comparable but not orderable -- order=False (default) keeps __lt__ undefined.
@dataclass(frozen=True, slots=True)
class Money:
    amount_cents: int
    currency: str
    def __post_init__(self) -> None:
        if not self.currency.isupper() or len(self.currency) != 3:
            raise ValueError("currency must be ISO-4217 uppercase")

# 3) Serialization seam -- asdict() for plain dicts; dataclasses_json / msgspec
#    if you need round-trip from JSON.
def to_payload(req: APIRequest) -> dict:
    d = asdict(req)
    d["timestamp"] = req.timestamp.isoformat()
    return d

# Decision rule:
#   plain record, mutable fine                    -> @dataclass
#   used as dict key / cache key / set element     -> @dataclass(frozen=True)
#   millions of instances or hot loop              -> @dataclass(slots=True)  (~30-40% memory)
#   constructor with many fields, easy to confuse  -> kw_only=True (or KW_ONLY divider)
#   need runtime validation / coercion             -> Pydantic / msgspec / attrs.validators
#                                                    (dataclasses don't enforce types)
#   need ordering                                  -> order=True (only fields in declaration order;
#                                                    pick the field set carefully)
#   inheritance with default-then-required fields  -> kw_only=True; otherwise it's a TypeError
#
# Anti-pattern: default=[] / default={} / default=set(). All instances will
# SHARE the same list/dict/set. Use field(default_factory=list) every time.
# This bug ships in tutorials regularly; reviewers should grep for these.
```

## Decision Rule

```text
plain record, mutable fine                    -> @dataclass
used as dict key / cache key / set element     -> @dataclass(frozen=True)
millions of instances or hot loop              -> @dataclass(slots=True)  (~30-40% memory)
constructor with many fields, easy to confuse  -> kw_only=True (or KW_ONLY divider)
need runtime validation / coercion             -> Pydantic / msgspec / attrs.validators
                                                 (dataclasses don't enforce types)
need ordering                                  -> order=True (only fields in declaration order;
                                                 pick the field set carefully)
inheritance with default-then-required fields  -> kw_only=True; otherwise it's a TypeError
```

## Anti-Pattern

> [!warning] Anti-pattern
> default=[] / default={} / default=set(). All instances will
> SHARE the same list/dict/set. Use field(default_factory=list) every time.
> This bug ships in tutorials regularly; reviewers should grep for these.

## Tips

- @dataclass auto-generates __init__, __repr__, __eq__ — saves boilerplate and keeps types clear.
- Use field(default_factory=...) for mutable defaults — plain default=[] is a classic Python trap.
- KW_ONLY forces keyword arguments — prevents positional confusion in dataclasses with many fields.
- slots=True saves memory for many instances — useful for large data structures.

## Common Mistake

> [!warning] Using default=[] or default={} in @dataclass — mutable defaults are shared across all instances. Always use field(default_factory=list) or field(default_factory=dict).

## Shorthand (Junior → Senior)

**Junior:**
```python
class User:
    def __init__(self, name: str, age: int, email: str = "unknown"):
        self.name = name
        self.age = age
        self.email = email
    def __repr__(self):
        return f"User(name={self.name}, age={self.age}, email={self.email})"
    def __eq__(self, other):
        return (self.name == other.name and
                self.age == other.age and
                self.email == other.email)
```

**Senior:**
```python
@dataclass
class User:
    name: str
    age: int
    email: str = "unknown@example.com"
```

## See Also

- [[Sections/typing/runtime-types/get-type-hints|get_type_hints & Type Introspection — Reflection at Runtime (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/runtime-checkable|@runtime_checkable Protocol — isinstance() Type Checking (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/_Index|Type Hints & mypy → Runtime Type Checking]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

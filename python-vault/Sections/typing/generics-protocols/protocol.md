---
type: "entry"
domain: "python"
file: "typing"
section: "generics-protocols"
id: "protocol"
title: "Protocol — Structural Typing (Duck Typing with Types)"
category: "Protocols"
subtitle: "Protocol, runtime_checkable, structural subtyping, duck typing"
signature_short: "class Printable(Protocol): def __str__(self) -> str: ...  |  @runtime_checkable"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Protocol — Structural Typing (Duck Typing with Types)"
  - "protocol"
tags:
  - "python"
  - "python/typing"
  - "python/typing/generics-protocols"
  - "category/protocols"
  - "tier/tiered"
---

# Protocol — Structural Typing (Duck Typing with Types)

> Protocol, runtime_checkable, structural subtyping, duck typing

## Overview

Protocol enables structural typing ("duck typing") — a class satisfies a Protocol if it has the right methods, without explicit inheritance. This is Python's answer to Go interfaces and TypeScript structural types. Unlike ABCs, classes don't need to inherit from or register with a Protocol. @runtime_checkable enables isinstance() checks. Protocols are ideal for defining interfaces in libraries, dependency injection, and testing (mock objects automatically satisfy protocols if they have the right methods).

## Signature

```python
class Printable(Protocol): def __str__(self) -> str: ...  |  @runtime_checkable
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Define a Protocol; any class that has the methods satisfies it -- no inheritance.
# STRENGTHS - Decouples APIs from implementations; mocks satisfy Protocols for free in tests.
# WEAKNESSES- Static-only by default; isinstance() doesn't work without @runtime_checkable.
from typing import Protocol

class Serializable(Protocol):
    def to_json(self) -> str: ...

class User:
    def __init__(self, name: str): self.name = name
    def to_json(self) -> str:
        import json
        return json.dumps({"name": self.name})

def save(obj: Serializable) -> None:
    # Accepts anything with to_json() -> str. No "User implements Serializable" needed.
    print(obj.to_json())

save(User("Alice"))    # OK
# save(42)             # mypy error: int has no to_json
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - __call__ Protocol for typed callbacks, generic Protocol[T] for repositories, runtime_checkable when needed.
# STRENGTHS - Domain-shaped interfaces; cleaner than Callable[[...], ...] aliases for non-trivial signatures.
# WEAKNESSES- runtime_checkable only checks attribute names exist -- it does NOT validate signatures.
from typing import Protocol, TypeVar, runtime_checkable

# 1) Callable Protocol -- more precise than Callable[[str], bool] when you need named params.
class Validator(Protocol):
    def __call__(self, value: str, *, strict: bool = False) -> bool: ...

def check_all(value: str, vs: list[Validator]) -> bool:
    return all(v(value, strict=True) for v in vs)

# 2) Generic Protocol -- typed Repository pattern.
T = TypeVar("T")
class Repository(Protocol[T]):
    def get(self, id: int) -> T | None: ...
    def save(self, entity: T) -> None: ...

class UserRepo:                                # NO inheritance from Repository
    def get(self, id: int) -> "User | None": ...
    def save(self, entity: "User") -> None: ...

def fetch(repo: Repository["User"]) -> None:
    repo.get(1)

# 3) runtime_checkable -- enables isinstance(). Cheap, but checks names only.
@runtime_checkable
class HasLength(Protocol):
    def __len__(self) -> int: ...

assert isinstance([1, 2, 3], HasLength)
assert not isinstance(42, HasLength)

class User: pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Protocols at module/package boundaries; concrete classes inside modules; ABC only when registry/inheritance is needed.
# STRENGTHS - True dependency inversion: callers depend on shape, not class hierarchy. Tests trivially fake collaborators.
# WEAKNESSES- Variance traps: Protocol[T] is invariant by default; for "producer" Protocols mark T covariant or callers can't pass subtypes.
from __future__ import annotations
from collections.abc import Iterable
from typing import Protocol, TypeVar, runtime_checkable

# 1) Variance + Protocol: covariant for read-only producers.
T_co = TypeVar("T_co", covariant=True)

class Reader(Protocol[T_co]):
    def read_all(self) -> Iterable[T_co]: ...

# Reader[Order] is assignable to Reader[Record] when Order <: Record.

# 2) Hash/eq Protocols capture invariants the type system normally elides.
class Hashable(Protocol):
    def __hash__(self) -> int: ...

# 3) Layered Protocols compose: small ones merged at the use site.
class _HasId(Protocol):
    @property
    def id(self) -> int: ...
class _HasName(Protocol):
    @property
    def name(self) -> str: ...

class Identifiable(_HasId, _HasName, Protocol): ...

def index(items: list[Identifiable]) -> dict[int, str]:
    return {x.id: x.name for x in items}

# 4) runtime_checkable: ALWAYS pair with a structural test on first call -- the
#    isinstance() hook only checks attribute names exist. A class that raises
#    NotImplementedError still passes. Use sparingly, or write a stronger guard.
@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

def safe_close(x: object) -> None:
    if isinstance(x, Closeable):
        try: x.close()                           # name exists, but may raise
        except (AttributeError, NotImplementedError): pass

# 5) Protocol with default methods -- yes, allowed; subclasses inherit them
#    even though they don't inherit from the Protocol.
class JSONable(Protocol):
    def to_json(self) -> str: ...
    def to_pretty(self) -> str:                   # default impl
        import json; return json.dumps(json.loads(self.to_json()), indent=2)

# Decision rule:
#   public API expecting "shape, not class"     -> Protocol
#   library plug-in registration / metaclass    -> ABC + register() (gives runtime hierarchy)
#   read-only container Protocol                -> covariant TypeVar (T_co)
#   need isinstance() in production logic       -> @runtime_checkable + structural sanity check
#   single method, simple signature             -> Callable[[...], ...] beats a one-method Protocol
#
# Anti-pattern: making a Protocol method body anything but '...'. A Protocol's
# methods are signatures. Putting a real body makes it half-ABC, half-Protocol;
# subclasses won't reliably inherit it across versions and mypy treats it as both.
```

## Decision Rule

```text
public API expecting "shape, not class"     -> Protocol
library plug-in registration / metaclass    -> ABC + register() (gives runtime hierarchy)
read-only container Protocol                -> covariant TypeVar (T_co)
need isinstance() in production logic       -> @runtime_checkable + structural sanity check
single method, simple signature             -> Callable[[...], ...] beats a one-method Protocol
```

## Anti-Pattern

> [!warning] Anti-pattern
> making a Protocol method body anything but '...'. A Protocol's
> methods are signatures. Putting a real body makes it half-ABC, half-Protocol;
> subclasses won't reliably inherit it across versions and mypy treats it as both.

## Tips

- Protocol is Python's duck typing made type-safe — classes satisfy protocols by having the right methods, no inheritance needed.
- Use Protocol over ABC when you want structural typing — callers don't need to know about or import your base class.
- @runtime_checkable has limitations: it only checks method existence, not signatures. Use it for simple checks only.
- Generic Protocol[T] enables typed Repository[User], Cache[Config] patterns — the backbone of clean dependency injection.

## Common Mistake

> [!warning] Making every Protocol @runtime_checkable — runtime checks only verify method names exist, not parameter types or return types. Use it sparingly; static checking with mypy is more reliable.

## Shorthand (Junior → Senior)

**Junior:**
```python
class User:
    def to_json(self): pass
class Product:
    def to_json(self): pass

# Manually pass the right types
```

**Senior:**
```python
class Serializable(Protocol):
    def to_json(self) -> str: ...

def save(obj: Serializable) -> None:
    print(obj.to_json())
```

## See Also

- [[Sections/typing/generics-protocols/_Index|Type Hints & mypy → Generics & Protocols]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

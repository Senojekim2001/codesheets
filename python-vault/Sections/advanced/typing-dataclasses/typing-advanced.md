---
type: "entry"
domain: "python"
file: "advanced"
section: "typing-dataclasses"
id: "typing-advanced"
title: "Advanced Type Hints — Protocols, TypeVar, Overload"
category: "Typing"
subtitle: "Protocol, TypeVar, overload, TypeAlias, TypeGuard"
signature_short: "class Readable(Protocol): def read(self) -> str: ...  |  T = TypeVar(\"T\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Advanced Type Hints — Protocols, TypeVar, Overload"
  - "typing-advanced"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/typing-dataclasses"
  - "category/typing"
  - "tier/tiered"
---

# Advanced Type Hints — Protocols, TypeVar, Overload

> Protocol, TypeVar, overload, TypeAlias, TypeGuard

## Overview

Python's type system supports structural typing (Protocol — duck typing made explicit), generics (TypeVar — "this function returns the same type it receives"), overloaded signatures (@overload — different return types based on input), type aliases (TypeAlias), and type guards (TypeGuard — narrow types in if branches). These enable precise types for complex APIs without runtime overhead.

## Signature

```python
class Readable(Protocol): def read(self) -> str: ...  |  T = TypeVar("T")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - TypeVar to keep input/output types in sync
# STRENGTHS - The minimum-shape generic function; mypy keeps the result type
# WEAKNESSES- No bounds, no Protocol, no overloads
#
from typing import TypeVar
from collections.abc import Sequence

T = TypeVar("T")

def first(items: Sequence[T]) -> T:           # input -> SAME T -> output
    return items[0]

x = first([1, 2, 3])                           # type checker: int
y = first(["a", "b", "c"])                     # type checker: str
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Protocol for duck typing, bounded TypeVar, TypeAlias for clarity
# STRENGTHS - The patterns most type-hinted code uses
# WEAKNESSES- No overload, no TypeGuard
#
from typing import Protocol, TypeVar, TypeAlias
from collections.abc import Sequence

# 1) Protocol — structural typing; ANY object with the methods qualifies
class Readable(Protocol):
    def read(self) -> str: ...

def head(source: Readable, n: int = 80) -> str:
    return source.read()[:n]

# Works on file objects, io.StringIO, anything with .read() -> str
# No inheritance required — duck typing made checkable

# 2) Bounded TypeVar — restrict to specific types
from typing import TypeVar
Number = TypeVar("Number", int, float)         # only int OR float
def double(x: Number) -> Number:
    return x * 2

# 3) TypeAlias — name complex types so signatures stay readable
UserID:    TypeAlias = int
Headers:   TypeAlias = dict[str, str]
JSON:      TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

def fetch(uid: UserID, headers: Headers) -> JSON: ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - overload, TypeGuard, ParamSpec, runtime_checkable, PEP 695 type
# STRENGTHS - The expressive corners that distinguish "typed" from "well-typed"
# WEAKNESSES- N/A
#
from typing import (
    overload, Protocol, TypeVar, TypeGuard, ParamSpec, Callable,
    runtime_checkable,
)
from collections.abc import Iterable

# 1) @overload — different RETURN types per input shape; impl handles all
@overload
def parse(data: str)   -> dict: ...
@overload
def parse(data: bytes) -> list: ...
def parse(data):                                  # one impl, untyped sig
    if isinstance(data, str):
        import json; return json.loads(data)
    return list(data)

# 2) TypeGuard — narrow a type inside an if branch
def is_str_list(xs: list) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in xs)

def join(xs: list) -> str:
    if is_str_list(xs):
        return ", ".join(xs)                      # mypy: xs is list[str] here
    raise TypeError("expected list[str]")

# 3) ParamSpec — preserve a function's full signature through a wrapper
P = ParamSpec("P"); R = TypeVar("R")

def timed(fn: Callable[P, R]) -> Callable[P, R]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        return fn(*args, **kwargs)
    return wrapper

# 4) runtime_checkable Protocol — isinstance() works at runtime (use sparingly)
@runtime_checkable
class HasName(Protocol):
    name: str

def label(obj: HasName) -> str:
    return obj.name
isinstance(object(), HasName)                      # works thanks to @runtime_checkable

# 5) PEP 695 (3.12+) — concise generic syntax
# def first[T](items: Sequence[T]) -> T:
#     return items[0]
# class Box[T]:
#     def __init__(self, x: T): self.x = x

# Decision rule:
#   "any object with these methods"            -> Protocol (NOT inheritance)
#   keep input/output types in sync             -> TypeVar
#   restrict TypeVar to a fixed set             -> TypeVar(..., int, float) (constraints)
#                                                  or bound= for a base class
#   different return types per input             -> @overload
#   narrow type inside an if                     -> TypeGuard
#   wrap a function and keep its signature       -> ParamSpec + TypeVar
#   isinstance() check on a Protocol             -> @runtime_checkable
#
# Anti-pattern: ABC with @abstractmethod for "this just needs a .read()"
#   You're forcing inheritance for what is structural typing. Protocol gives
#   you the same check at type-check time without the inheritance burden.
```

## Decision Rule

```text
"any object with these methods"            -> Protocol (NOT inheritance)
keep input/output types in sync             -> TypeVar
restrict TypeVar to a fixed set             -> TypeVar(..., int, float) (constraints)
                                               or bound= for a base class
different return types per input             -> @overload
narrow type inside an if                     -> TypeGuard
wrap a function and keep its signature       -> ParamSpec + TypeVar
isinstance() check on a Protocol             -> @runtime_checkable
```

## Anti-Pattern

> [!warning] Anti-pattern
> ABC with @abstractmethod for "this just needs a .read()"
>   You're forcing inheritance for what is structural typing. Protocol gives
>   you the same check at type-check time without the inheritance burden.

## Tips

- Protocol enables duck typing with static checking — any object matching the shape satisfies the type. Add `@runtime_checkable` if you need `isinstance(obj, MyProtocol)` to work.
- TypeVar preserves type relationships: first(list[int]) → int, first(list[str]) → str.
- @overload is for type checkers only — the actual implementation must handle all cases.
- Use TypeAlias for complex types — JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | ... is much clearer.
- Reach for `TypeGuard` (or `TypeIs` in 3.13+) when a predicate narrows a type inside an `if` branch; use `ParamSpec` + `TypeVar` to preserve a wrapped function's full signature through a decorator. PEP 695 (3.12+) gives concise generic syntax: `def first[T](items: Sequence[T]) -> T:`.

## Common Mistake

> [!warning] Using ABC (abstract base class) when Protocol would suffice — ABC requires inheritance, Protocol uses structural typing. Prefer Protocol for "this object just needs a .read() method" patterns.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Animal(ABC):
    @abstractmethod
    def speak(self): pass

class Dog(Animal):
    def speak(self):
        return "Woof"
```

**Senior:**
```python
class Speakable(Protocol):
    def speak(self) -> str: ...
```

## See Also

- [[Sections/packaging/dev-tools/mypy-config-packaging|mypy — Type Checking Configuration (Packaging, CLI & Tooling)]]
- [[Sections/advanced/typing-dataclasses/_Index|Advanced Python → Typing & Dataclasses]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

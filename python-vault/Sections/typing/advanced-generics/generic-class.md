---
type: "entry"
domain: "python"
file: "typing"
section: "advanced-generics"
id: "generic-class"
title: "Generic Classes — Typed Containers & Covariance/Contravariance"
category: "Advanced Generics"
subtitle: "Generic, covariance, contravariance, invariance, __class_getitem__"
signature_short: "class Box(Generic[T]): ...  |  class Producer(Generic[T_co]): ...  |  T_co = TypeVar(\"T_co\", covariant=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Generic Classes — Typed Containers & Covariance/Contravariance"
  - "generic-class"
tags:
  - "python"
  - "python/typing"
  - "python/typing/advanced-generics"
  - "category/advanced-generics"
  - "tier/tiered"
---

# Generic Classes — Typed Containers & Covariance/Contravariance

> Generic, covariance, contravariance, invariance, __class_getitem__

## Overview

Generic classes parameterize on one or more types. TypeVar with covariant=True (T_co) allows Box[Dog] to be a Box[Animal] (safe for reading). Contravariant types (T_contra) flip the hierarchy (safe for writing). Invariant (default) requires exact type match. __class_getitem__ enables custom generic syntax. Understanding variance prevents type errors in complex hierarchies.

## Signature

```python
class Box(Generic[T]): ...  |  class Producer(Generic[T_co]): ...  |  T_co = TypeVar("T_co", covariant=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Inherit from Generic[T] and use T in methods; the class is now parameterized.
# STRENGTHS - Box[int] vs Box[str] are different types; mypy keeps the element type all the way through.
# WEAKNESSES- Default invariance is correct but strict: Box[Dog] is NOT assignable to Box[Animal].
from typing import Generic, TypeVar

T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T) -> None:
        self.value = value
    def get(self) -> T:
        return self.value
    def set(self, value: T) -> None:
        self.value = value

bi: Box[int] = Box(42)
bs: Box[str] = Box("hi")
n: int = bi.get()       # mypy: int
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multiple type params for Pair[K,V]; PEP 695 inline generics on 3.12+; default values via type alias.
# STRENGTHS - Cleaner declaration, better docs; default-typed containers (Cache, Result, Either).
# WEAKNESSES- PEP 695 inline syntax is not back-portable -- if you support 3.11 or older, keep TypeVar.
from typing import Generic, TypeVar

K = TypeVar("K")
V = TypeVar("V")

class Pair(Generic[K, V]):
    def __init__(self, k: K, v: V) -> None:
        self.k, self.v = k, v
    def swap(self) -> "Pair[V, K]":
        return Pair(self.v, self.k)

p: Pair[str, int] = Pair("age", 30)
q: Pair[int, str] = p.swap()

# PEP 695 syntax (Python 3.12+):
class Result[V]:
    def __init__(self, value: V | None = None, error: str | None = None) -> None:
        self._v, self._e = value, error
    def unwrap(self) -> V:
        if self._e is not None:
            raise RuntimeError(self._e)
        assert self._v is not None
        return self._v

class Either[L, R]:
    def __init__(self, *, left: L | None = None, right: R | None = None) -> None:
        self.left, self.right = left, right
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pick variance per-class deliberately; covariant for read-mostly, contravariant for sinks, invariant for mutable.
# STRENGTHS - Subtype substitution works the way callers expect; no surprise mypy errors at the boundary.
# WEAKNESSES- Variance is famously confusing. Wrong choice doesn't always fail loudly -- it widens silently.
from __future__ import annotations
from collections.abc import Iterable, Iterator
from typing import Generic, Protocol, TypeVar, overload

T_co = TypeVar("T_co", covariant=True)
T_ct = TypeVar("T_ct", contravariant=True)
T    = TypeVar("T")

# 1) Producer (covariant): yields T but never accepts T from outside.
#    Stream[Dog] is assignable wherever Stream[Animal] is expected.
class Stream(Generic[T_co]):
    def __init__(self, source: Iterable[T_co]) -> None:
        self._it: Iterator[T_co] = iter(source)
    def __iter__(self) -> Iterator[T_co]:
        return self._it

# 2) Sink (contravariant): accepts T but never returns it.
#    Sink[Animal] is assignable wherever Sink[Dog] is expected.
class Sink(Generic[T_ct]):
    def write(self, item: T_ct) -> None: ...

# 3) Cache (invariant): both reads AND writes -- variance must be invariant
#    or you can sneak a Cat into a Cache[Dog] via a "narrower" reference.
class Cache(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def add(self, x: T) -> None:
        self._items.append(x)
    def all(self) -> list[T]:
        return list(self._items)

# 4) Method-level overload to give a generic class richer return types.
class Maybe(Generic[T]):
    def __init__(self, value: T | None) -> None:
        self._v = value
    @overload
    def or_else(self, default: T) -> T: ...
    @overload
    def or_else(self, default: None = None) -> T | None: ...
    def or_else(self, default=None):
        return self._v if self._v is not None else default

# 5) Generic Protocol pulls "duck typing + types" together for plug-in design.
class Comparable(Protocol[T_ct]):
    def __lt__(self, other: T_ct) -> bool: ...

def sort_in_place(xs: list[T], *, _: type[Comparable[T]] | None = None) -> None:
    xs.sort()

# Decision rule:
#   class only PRODUCES T (read-only)             -> covariant TypeVar   (T_co)
#   class only CONSUMES T (write-only)            -> contravariant TypeVar (T_ct)
#   class both reads and writes T                  -> invariant TypeVar   (default)
#   need element-type DEFAULT (e.g. dict[str, str])-> PEP 696 type defaults (3.13+) or alias
#   "supports comparison/key" capability           -> bound=Protocol, NOT a constraints TypeVar
#   exposing typed containers across a package      -> Generic[T] beats Any-typed dicts every time
#
# Anti-pattern: marking a TypeVar covariant on a class that ALSO has a setter.
# It type-checks today, then a caller passes a narrower type, the setter writes
# a wider value, and the next reader gets the wrong concrete type at runtime.
```

## Decision Rule

```text
class only PRODUCES T (read-only)             -> covariant TypeVar   (T_co)
class only CONSUMES T (write-only)            -> contravariant TypeVar (T_ct)
class both reads and writes T                  -> invariant TypeVar   (default)
need element-type DEFAULT (e.g. dict[str, str])-> PEP 696 type defaults (3.13+) or alias
"supports comparison/key" capability           -> bound=Protocol, NOT a constraints TypeVar
exposing typed containers across a package      -> Generic[T] beats Any-typed dicts every time
```

## Anti-Pattern

> [!warning] Anti-pattern
> marking a TypeVar covariant on a class that ALSO has a setter.
> It type-checks today, then a caller passes a narrower type, the setter writes
> a wider value, and the next reader gets the wrong concrete type at runtime.

## Tips

- Covariance works for producers (methods that return T) — use TypeVar(..., covariant=True).
- Contravariance works for consumers (methods that accept T) — use TypeVar(..., contravariant=True).
- Invariance is the default and safest — only use variance when you understand the implications.
- Generic[T, U] is the foundation for typed containers, Results, Options, and dependency injection.

## Common Mistake

> [!warning] Marking a TypeVar covariant on a class that also has a setter — invariance is the right choice for any container that both reads AND writes T. Reaching for covariant just because reads outnumber writes lets callers smuggle in narrower types.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Box:
    def __init__(self, value):
        self.value = value
    def get(self):
        return self.value
```

**Senior:**
```python
T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T): self.value = value
    def get(self) -> T: return self.value

box: Box[int] = Box(42)
x: int = box.get()
```

## See Also

- [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/_Index|Type Hints & mypy → Advanced Generics]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "typing"
section: "generics-protocols"
id: "typevar-generics"
title: "TypeVar & Generics — Parameterized Types"
category: "Generics"
subtitle: "TypeVar, Generic, ParamSpec, bound, constraints, PEP 695"
signature_short: "T = TypeVar(\"T\")  |  def first(items: list[T]) -> T  |  class Box(Generic[T])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "TypeVar & Generics — Parameterized Types"
  - "typevar-generics"
tags:
  - "python"
  - "python/typing"
  - "python/typing/generics-protocols"
  - "category/generics"
  - "tier/tiered"
---

# TypeVar & Generics — Parameterized Types

> TypeVar, Generic, ParamSpec, bound, constraints, PEP 695

## Overview

Generics enable writing type-safe code that works with multiple types. TypeVar defines type variables that are inferred from usage. Use bound= for capability constraints (TypeVar("T", bound=Sized) means "any subtype that supports len()") — this is what you want 95% of the time. The constraints form (TypeVar("T", int, str)) PICKS ONE of the listed types per call site, NOT "any subtype of these" — rarely the right tool. ParamSpec preserves function signatures in decorators. Python 3.12 introduces cleaner syntax: def first[T](items: list[T]) -> T. Generic classes use class MyClass(Generic[T]).

## Signature

```python
T = TypeVar("T")  |  def first(items: list[T]) -> T  |  class Box(Generic[T])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One TypeVar T, use it on parameter and return type so mypy links them.
# STRENGTHS - Type-preserving helpers (first, last, identity) without losing the element type.
# WEAKNESSES- TypeVar must live at module scope; can't redefine it per-function.
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

x: int = first([1, 2, 3])       # T inferred -> int
y: str = first(["a", "b", "c"]) # T inferred -> str

def identity(value: T) -> T:
    return value
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - bound= for capability constraints, Generic[T] for typed containers, PEP 695 syntax on 3.12+.
# STRENGTHS - Reusable Result[T] / Page[T] / Cache[T] patterns; bound= keeps callers within capability limits.
# WEAKNESSES- bound is structural-via-Protocol or nominal-via-class; TypeVar with constraints (T = TypeVar("T", int, str)) is more restrictive than bound and rarely what you want.
from typing import Generic, TypeVar
from collections.abc import Sized

# bound= -- "T must support len()"
S = TypeVar("S", bound=Sized)

def biggest(items: list[S]) -> S:
    return max(items, key=len)

biggest(["abc", "de"])              # OK
# biggest([1, 2])                   # mypy error: int has no __len__

# Generic class -- container that carries its element type.
V = TypeVar("V")

class Result(Generic[V]):
    def __init__(self, value: V | None = None, error: str | None = None):
        self._v, self._e = value, error
    def unwrap(self) -> V:
        if self._e is not None:
            raise RuntimeError(self._e)
        assert self._v is not None
        return self._v

ok: Result[int] = Result(value=42)
n: int = ok.unwrap()                # mypy: int

# PEP 695 (Python 3.12+) -- no module-level TypeVar.
# def first[T](items: list[T]) -> T: return items[0]
# class Page[T]: ...
# type Pair[T] = tuple[T, T]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - PEP 695 inline generics, variance via TypeVar(covariant/contravariant), ParamSpec for decorators.
# STRENGTHS - APIs that compose: Reader[T] (covariant), Sink[T] (contravariant), decorators that don't lie about signatures.
# WEAKNESSES- Variance + bounds together is famously confusing; review-time concept. Get it wrong and the type system silently widens to Any.
from __future__ import annotations
from collections.abc import Callable, Iterable
from typing import ParamSpec, Protocol, TypeVar
import functools

# 1) Variance: covariant for "I produce T" (read-only), contravariant for "I consume T".
T_co = TypeVar("T_co", covariant=True)        # producer
T_ct = TypeVar("T_ct", contravariant=True)    # consumer

class Reader(Protocol[T_co]):
    def read(self) -> T_co: ...
class Sink(Protocol[T_ct]):
    def write(self, value: T_ct) -> None: ...

# Reader[Cat] is assignable where Reader[Animal] is expected -- like list[Cat] is NOT.
# Sink[Animal] is assignable where Sink[Cat] is expected -- the opposite direction.

# 2) ParamSpec preserves the wrapped function's signature THROUGH a decorator.
P = ParamSpec("P")
R = TypeVar("R")

def timed(fn: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def w(*args: P.args, **kwargs: P.kwargs) -> R:
        import time; t0 = time.perf_counter()
        try:    return fn(*args, **kwargs)
        finally: print(fn.__name__, time.perf_counter() - t0)
    return w

@timed
def fetch(url: str, retries: int = 3) -> bytes: ...
# fetch keeps its (url: str, retries: int = 3) -> bytes signature -- not (*args, **kwargs).

# 3) PEP 695 inline syntax (3.12+): one decl, scope is the function/class.
def unique[T](items: Iterable[T]) -> list[T]:
    seen: set[T] = set(); out: list[T] = []
    for x in items:
        if x not in seen:
            seen.add(x); out.append(x)
    return out

class Cache[K, V]:
    def __init__(self) -> None: self._d: dict[K, V] = {}
    def get(self, k: K) -> V | None: return self._d.get(k)
    def set(self, k: K, v: V) -> None: self._d[k] = v

# Decision rule:
#   one type param, function-local           -> def fn[T](...)            (3.12+) or TypeVar
#   container that PRODUCES T, never accepts -> covariant TypeVar (T_co)  -> Reader, Iterator, frozenset (logically)
#   container that CONSUMES T, never returns -> contravariant TypeVar     -> Sink, EventHandler
#   read AND write of T (mutable)            -> invariant TypeVar (default) -> list, dict
#   decorator that must not erase signature  -> ParamSpec + TypeVar return
#   "T must support .name / len() / +"        -> bound=Protocol  (capability), not constraints
#
# Anti-pattern: TypeVar("T", int, str) (constraints) when you really wanted
# bound=SupportsXxx. Constraints PICK ONE of the listed types per call site,
# they do NOT mean "any subtype of these"; bound is the right tool 95% of the time.
```

## Decision Rule

```text
one type param, function-local           -> def fn[T](...)            (3.12+) or TypeVar
container that PRODUCES T, never accepts -> covariant TypeVar (T_co)  -> Reader, Iterator, frozenset (logically)
container that CONSUMES T, never returns -> contravariant TypeVar     -> Sink, EventHandler
read AND write of T (mutable)            -> invariant TypeVar (default) -> list, dict
decorator that must not erase signature  -> ParamSpec + TypeVar return
"T must support .name / len() / +"        -> bound=Protocol  (capability), not constraints
```

## Anti-Pattern

> [!warning] Anti-pattern
> TypeVar("T", int, str) (constraints) when you really wanted
> bound=SupportsXxx. Constraints PICK ONE of the listed types per call site,
> they do NOT mean "any subtype of these"; bound is the right tool 95% of the time.

## Tips

- ParamSpec preserves decorated function signatures — without it, decorators erase parameter types and mypy shows (*args, **kwargs).
- Python 3.12 syntax (def f[T](...)) is much cleaner — use it if your minimum Python version is 3.12+.
- Use bound= to restrict TypeVar to types that support specific operations — bound=SupportsFloat, bound=Comparable, etc.
- Generic classes work great for Result[T], Page[T], Response[T] — typed wrappers that carry their content type through.

## Common Mistake

> [!warning] Creating a new TypeVar inside a function — TypeVar("T") should be defined at module level and reused. Creating it inside a function makes mypy treat each call as a different type variable.

## Shorthand (Junior → Senior)

**Junior:**
```python
def first(items):
    return items[0]

result = first([1, 2])  # mypy doesn't know if int or str
```

**Senior:**
```python
T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

result: int = first([1, 2])  # mypy knows this is int
```

## See Also

- [[Sections/typing/generics-protocols/_Index|Type Hints & mypy → Generics & Protocols]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

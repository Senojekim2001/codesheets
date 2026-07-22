---
type: "entry"
domain: "python"
file: "oop"
section: "properties"
id: "protocol-oop"
title: "Protocol"
category: "Properties"
subtitle: "Any class with the right methods satisfies Protocol — no inheritance needed"
signature_short: "from typing import Protocol
class Drawable(Protocol): def draw(self): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Protocol"
  - "protocol-oop"
tags:
  - "python"
  - "python/oop"
  - "python/oop/properties"
  - "category/properties"
  - "tier/tiered"
---

# Protocol

> Any class with the right methods satisfies Protocol — no inheritance needed

## Overview

Protocol (Python 3.8+) defines a structural interface — any class that has the required methods satisfies it without explicit inheritance. Duck typing made visible to type checkers. Unlike ABCs, there is no runtime enforcement unless @runtime_checkable is used.

## Signature

```python
from typing import Protocol
class Drawable(Protocol): def draw(self): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - declare a Protocol with one method, then write a function
#             that takes anything matching it. No inheritance involved.
# STRENGTHS - reveals the core idea — "structural typing": shape is
#             enough — without any extra machinery.
# WEAKNESSES- only mypy/pyright actually checks; at runtime this is
#             still pure duck typing, so a wrong type passes silently.
#
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:                         # no inheritance from Drawable
    def draw(self) -> None:
        print("Drawing circle")

def render(item: Drawable) -> None:    # accepts anything with draw()
    item.draw()

render(Circle())     # type checker is happy; runs at runtime
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - introduce @runtime_checkable so isinstance() works against
#             the Protocol; show that any class with the right shape
#             satisfies it without inheritance.
# STRENGTHS - covers the everyday Protocol use cases: type hints for
#             callable APIs, plus a runtime check for plugin-style code.
# WEAKNESSES- runtime_checkable only verifies method existence, not
#             signatures — a wrong-arity method still passes isinstance().
#
from typing import Protocol, runtime_checkable
import io

@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None: print("Drawing circle")

class Square:
    def draw(self) -> None: print("Drawing square")

def render(item: Drawable) -> None:
    item.draw()

render(Circle())                      # works
render(Square())                      # works — no inheritance needed

isinstance(io.StringIO(), Closeable)  # True — has .close()
isinstance(42, Closeable)             # False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - generic protocols (TypeVar) for type-safe containers,
#             protocols with default method implementations, and the
#             choice between Protocol (structural) and ABC (nominal).
# STRENGTHS - the structural-typing toolkit at full strength: callers
#             pass any compatible type; library can offer defaults
#             without forcing inheritance.
# WEAKNESSES- generic Protocol syntax is dense; defaults inside Protocol
#             classes only run when a class explicitly inherits — they
#             don't get applied via duck typing.
#
from typing import Protocol, runtime_checkable, TypeVar, Iterable

T_co = TypeVar("T_co", covariant=True)

class Sized(Protocol):
    def __len__(self) -> int: ...

class Reader(Protocol[T_co]):
    """Generic protocol — readers of any element type."""
    def read(self) -> T_co: ...

@runtime_checkable
class Greeter(Protocol):
    name: str
    def greet(self) -> str:
        return f"hello, {self.name}"   # default impl available on inheritance

def first_n(items: Iterable[T_co], n: int) -> list[T_co]:
    return [x for _, x in zip(range(n), items)]

# Protocol vs ABC quick guide:
#   - ABC     : nominal — caller must subclass; enforced at instantiation.
#   - Protocol: structural — caller's class just needs the right shape;
#               checked by mypy/pyright; isinstance only with @runtime_checkable.
# Reach for ABC when you need ENFORCEMENT; Protocol when you want OPTIONAL conformance.
#
# Decision rule:
#   typing third-party objects you don't control       -> Protocol
#   need runtime isinstance() check                    -> @runtime_checkable Protocol
#   strict enforcement at class instantiation          -> abc.ABC + @abstractmethod
#   type a callback parameter (any def with shape)     -> Protocol with __call__
#   express "iterable of T", "supports __len__"        -> Protocol (or typing.Sized)
#   library wants users to opt in by subclassing       -> ABC
#   library should accept duck-typed objects           -> Protocol
#   value-type contract with default impls             -> ABC; defaults run only on subclasses
#
# Anti-pattern: expecting Protocol to validate at runtime
#   Without @runtime_checkable, Protocol is invisible at runtime — your
#   function happily accepts anything and crashes only when the missing
#   method is called. Even with @runtime_checkable, isinstance() only
#   checks method NAMES, not signatures or attribute types. Treat Protocol
#   as static documentation, and add explicit checks where it matters.
```

## Decision Rule

```text
typing third-party objects you don't control       -> Protocol
need runtime isinstance() check                    -> @runtime_checkable Protocol
strict enforcement at class instantiation          -> abc.ABC + @abstractmethod
type a callback parameter (any def with shape)     -> Protocol with __call__
express "iterable of T", "supports __len__"        -> Protocol (or typing.Sized)
library wants users to opt in by subclassing       -> ABC
library should accept duck-typed objects           -> Protocol
value-type contract with default impls             -> ABC; defaults run only on subclasses
```

## Anti-Pattern

> [!warning] Anti-pattern
> expecting Protocol to validate at runtime
>   Without @runtime_checkable, Protocol is invisible at runtime — your
>   function happily accepts anything and crashes only when the missing
>   method is called. Even with @runtime_checkable, isinstance() only
>   checks method NAMES, not signatures or attribute types. Treat Protocol
>   as static documentation, and add explicit checks where it matters.

## Tips

- Protocol expresses "anything with these methods" — the correct type for duck-typed code
- @runtime_checkable enables isinstance() — plain Protocol does not support it
- Protocol is enforced only by type checkers (mypy, pyright) — no runtime enforcement
- For runtime enforcement, use ABC — for type-checker-only interfaces, use Protocol

## Common Mistake

> [!warning] Expecting Protocol to raise errors at runtime. Without @runtime_checkable and isinstance(), Protocol is purely type-checker documentation — it does not enforce anything when your code runs.

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

- [[Sections/oop/properties/property|@property (Object-Oriented Python)]]
- [[Sections/oop/properties/descriptors|Descriptors (Object-Oriented Python)]]
- [[Sections/oop/properties/classmethod|@classmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/staticmethod|@staticmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/_Index|Object-Oriented Python → Properties & Descriptors]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

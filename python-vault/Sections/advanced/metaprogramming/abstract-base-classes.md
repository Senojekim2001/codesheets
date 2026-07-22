---
type: "entry"
domain: "python"
file: "advanced"
section: "metaprogramming"
id: "abstract-base-classes"
title: "Abstract Base Classes — Contracts & Enforcement"
category: "Metaprogramming"
subtitle: "abc.ABC, @abstractmethod, @abstractproperty, ABCMeta"
signature_short: "class Base(ABC): @abstractmethod def method(self): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Abstract Base Classes — Contracts & Enforcement"
  - "abstract-base-classes"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/metaprogramming"
  - "category/metaprogramming"
  - "tier/tiered"
---

# Abstract Base Classes — Contracts & Enforcement

> abc.ABC, @abstractmethod, @abstractproperty, ABCMeta

## Overview

The abc module (abstract base classes) enables defining interfaces — classes that can't be instantiated directly. Subclasses must implement all @abstractmethod methods or they can't be instantiated. @abstractproperty (deprecated, use @property + @abstractmethod) enforces properties. ABCMeta is the metaclass powering ABC. Use for: plugin interfaces, defining contracts, enforcing method implementation.

## Signature

```python
class Base(ABC): @abstractmethod def method(self): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Inherit ABC, mark required methods with @abstractmethod
# STRENGTHS - Smallest valid abstract interface; can't be instantiated directly
# WEAKNESSES- No abstract properties; no register()
#
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self) -> str: ...

class Dog(Animal):
    def speak(self) -> str: return "woof"

# Animal()  -> TypeError: Can't instantiate abstract class Animal
print(Dog().speak())                              # "woof"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Abstract properties, default impls via super(), virtual subclasses
# STRENGTHS - The features that turn ABC from "barrier" into "contract"
# WEAKNESSES- No metaclass details; no Generic ABC
#
from abc import ABC, abstractmethod

class Shape(ABC):
    @property
    @abstractmethod                              # order matters: @property OUTSIDE
    def area(self) -> float: ...

    def describe(self) -> str:                   # default (concrete) method
        return f"shape area={self.area:.2f}"

class Circle(Shape):
    def __init__(self, r): self.r = r
    @property
    def area(self) -> float:
        import math; return math.pi * self.r ** 2

# register() — claim that an UNRELATED class satisfies the interface
class DataStore(ABC):
    @abstractmethod
    def get(self, key): ...
    @abstractmethod
    def set(self, key, value): ...

# dict already has these methods — register so isinstance works
DataStore.register(dict)
isinstance({}, DataStore)                        # True (without inheriting)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - ABC vs Protocol, generic ABC, collections.abc reuse, __subclasshook__
# STRENGTHS - The decision rule + the standard-library ABCs you should reach for first
# WEAKNESSES- N/A
#
from abc import ABC, abstractmethod
from collections.abc import Iterable, Sized, Container, Mapping
from typing import Protocol, runtime_checkable

# 1) ABC vs Protocol — pick by whether you OWN the type tree
#    ABC:     callers MUST inherit; explicit hierarchy
#    Protocol: structural; ANY object with the methods works (duck typing)
#    Use Protocol for "anything with .read()", ABC for "all DataStores in OUR system"

@runtime_checkable
class Reader(Protocol):
    def read(self, n: int = -1) -> str: ...

# 2) collections.abc gives you tested ABCs for free — DON'T re-invent
#    Iterable, Iterator, Container, Sized, Sequence, Mapping, Set, Hashable, Callable
class MyList(Sized, Iterable):
    def __init__(self, items): self._items = list(items)
    def __len__(self):  return len(self._items)
    def __iter__(self): return iter(self._items)
# isinstance(MyList([]), Sized) -> True
# isinstance(MyList([]), Iterable) -> True

# 3) Generic ABC — typed interfaces (3.12+ syntax)
from typing import Generic, TypeVar
K = TypeVar("K"); V = TypeVar("V")

class Cache(ABC, Generic[K, V]):
    @abstractmethod
    def get(self, key: K) -> V | None: ...
    @abstractmethod
    def set(self, key: K, value: V) -> None: ...

class MemCache(Cache[str, int]):
    def __init__(self): self._d: dict[str, int] = {}
    def get(self, key):           return self._d.get(key)
    def set(self, key, value):    self._d[key] = value

# 4) __subclasshook__ — make isinstance check based on shape, not inheritance.
#    Powerful but rarely needed; Protocol covers most cases now.
class Closable(ABC):
    @classmethod
    def __subclasshook__(cls, sub):
        return any("close" in B.__dict__ for B in sub.__mro__) or NotImplemented
class FileLike:
    def close(self): pass
issubclass(FileLike, Closable)                    # True

# 5) Common mistake — putting validation logic in __init__ instead of as
#    abstract methods. Subclasses can SKIP your __init__; abstract methods
#    enforce the contract at INSTANTIATION TIME.

# Decision rule:
#   "anything with .read()", any caller       -> Protocol (structural)
#   strict family of types YOU control          -> ABC + @abstractmethod
#   need a sequence / mapping / set              -> inherit from collections.abc
#   need typed interface                          -> Generic ABC (or Protocol[T])
#   isinstance check on duck-typed shape         -> @runtime_checkable Protocol
#   "this third-party class implements my IF"    -> ABC.register(ThatClass)
#
# Anti-pattern: ABC for an interface that has only ONE implementation
#   You added a level of indirection that buys nothing. Drop the ABC; if the
#   second implementation appears later, refactor THEN.
```

## Decision Rule

```text
"anything with .read()", any caller       -> Protocol (structural)
strict family of types YOU control          -> ABC + @abstractmethod
need a sequence / mapping / set              -> inherit from collections.abc
need typed interface                          -> Generic ABC (or Protocol[T])
isinstance check on duck-typed shape         -> @runtime_checkable Protocol
"this third-party class implements my IF"    -> ABC.register(ThatClass)
```

## Anti-Pattern

> [!warning] Anti-pattern
> ABC for an interface that has only ONE implementation
>   You added a level of indirection that buys nothing. Drop the ABC; if the
>   second implementation appears later, refactor THEN.

## Tips

- ABC classes can't be instantiated — they're contracts. Subclasses must implement all @abstractmethod methods.
- @abstractmethod can have a default implementation using super() — subclasses can extend it. For abstract properties, stack `@property` OUTSIDE `@abstractmethod` (order matters).
- ABC.register() lets you register unrelated classes as implementing the interface (without inheritance). For typed interfaces use Generic ABC: `class Cache(ABC, Generic[K, V])`.
- Use collections.abc for built-in abstract types (Sized, Iterable, Container, Sequence, Mapping, Set, Hashable, Callable) — DON'T re-invent these; they're tested and integrate with isinstance().

## Common Mistake

> [!warning] Defining an ABC for an interface that has only ONE implementation — you've added indirection that buys nothing. Drop the ABC; if a second implementation appears later, refactor THEN. For "anything with .read()" use Protocol; reserve ABC for strict families of types you control.

## Shorthand (Junior → Senior)

**Junior:**
```python
class DataStore(ABC):
    @abstractmethod
    def get(self, key: str):
        pass

    @abstractmethod
    def set(self, key: str, value):
        pass
```

**Senior:**
```python
class DataStore(Protocol):
    def get(self, key: str) -> Any: ...
    def set(self, key: str, value: Any) -> None: ...
```

## See Also

- [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation (Advanced Python)]]
- [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes (Advanced Python)]]
- [[Sections/advanced/metaprogramming/slots-advanced|__slots__ — Memory Optimization (Advanced Python)]]
- [[Sections/advanced/metaprogramming/_Index|Advanced Python → Metaprogramming]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

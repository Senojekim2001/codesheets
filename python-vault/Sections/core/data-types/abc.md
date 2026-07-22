---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "abc"
title: "Abstract Base Classes"
category: "Type System"
subtitle: "ABC + @abstractmethod enforces method implementation"
signature_short: "from abc import ABC, abstractmethod"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Abstract Base Classes"
  - "abc"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/type-system"
  - "tier/tiered"
---

# Abstract Base Classes

> ABC + @abstractmethod enforces method implementation

## Overview

Abstract Base Classes define interfaces — they specify what methods a subclass must implement without providing the implementation. Attempting to instantiate a class with unimplemented abstract methods raises TypeError. collections.abc provides ABCs for isinstance checks.

## Signature

```python
from abc import ABC, abstractmethod
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
# GOAL: Define a base class that enforces method implementation
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...   # subclass MUST implement this

    def describe(self):            # concrete — shared by all subclasses
        return f"area={self.area():.2f}"

# Shape()  →  TypeError: Can't instantiate abstract class
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
# GOAL: Implement the abstract class
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Circle(Shape):
    def __init__(self, r: float): self.r = r
    def area(self) -> float: return 3.14159 * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w: float, h: float): self.w, self.h = w, h
    def area(self) -> float: return self.w * self.h

c = Circle(5)
c.area()      # → 78.54

# GOAL: Abstract property
class Config(ABC):
    @property
    @abstractmethod
    def db_url(self) -> str: ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
# GOAL: collections.abc — ABCs for isinstance checks
from collections.abc import Iterable, Mapping, Sequence, Callable

isinstance([1,2,3], Iterable)   # → True
isinstance({}, Mapping)          # → True
isinstance('abc', Sequence)      # → True
isinstance(len, Callable)        # → True

# WHY: Check for the interface, not the concrete type
def process(data):
    if isinstance(data, Mapping):
        return list(data.values())
    if isinstance(data, Iterable):
        return list(data)

# GOAL: ABC vs Protocol
# ABC:      enforces via inheritance — subclass must explicitly extend ABC
# Protocol: enforces structurally — any class with right methods qualifies (no inheritance)
# Use ABC when you want explicit opt-in; Protocol for duck-typing with type safety
#
# Decision rule:
#   define a contract you control + enforce      -> ABC + @abstractmethod
#   define a contract for code you DON'T own     -> typing.Protocol (structural, duck-typed)
#   need shared concrete behavior in base         -> ABC (mixed concrete/abstract methods)
#   isinstance check on duck-typed protocol      -> collections.abc (Iterable, Mapping, ...)
#   want abstract property                        -> @property + @abstractmethod
#   simple "must implement X"                     -> ABC, but consider Protocol first
#   need exhaustive type checking                  -> Protocol with @runtime_checkable
#   plugin / driver pattern                        -> ABC if registry-based, Protocol if duck
#
# Anti-pattern: forgetting @abstractmethod on the base method.
#   Without the decorator, the empty `def area(self): pass` is a CONCRETE method that returns
#   None. Subclasses are not forced to override it; instantiation succeeds; bugs surface at
#   call time as silent None returns. Always pair the abstract intent with @abstractmethod
#   (and `...` for the body), and inherit from ABC so the metaclass blocks instantiation
#   when implementations are missing.
```

## Decision Rule

```text
define a contract you control + enforce      -> ABC + @abstractmethod
define a contract for code you DON'T own     -> typing.Protocol (structural, duck-typed)
need shared concrete behavior in base         -> ABC (mixed concrete/abstract methods)
isinstance check on duck-typed protocol      -> collections.abc (Iterable, Mapping, ...)
want abstract property                        -> @property + @abstractmethod
simple "must implement X"                     -> ABC, but consider Protocol first
need exhaustive type checking                  -> Protocol with @runtime_checkable
plugin / driver pattern                        -> ABC if registry-based, Protocol if duck
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting @abstractmethod on the base method.
>   Without the decorator, the empty `def area(self): pass` is a CONCRETE method that returns
>   None. Subclasses are not forced to override it; instantiation succeeds; bugs surface at
>   call time as silent None returns. Always pair the abstract intent with @abstractmethod
>   (and `...` for the body), and inherit from ABC so the metaclass blocks instantiation
>   when implementations are missing.

## Tips

- ABCs raise TypeError at instantiation if abstract methods are missing — catches mistakes early
- Use `...` (Ellipsis) as abstract method body — cleaner than `pass` or `raise NotImplementedError`
- Prefer `Protocol` over ABC when you don't control the implementing classes (structural typing)

## Common Mistake

> [!warning] Forgetting `@abstractmethod` and leaving the method body with `pass`. Without the decorator, the method is concrete — subclasses can skip it with no error raised.

## See Also

- [[Sections/core/data-types/type-hints|Type hints (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/typing-module-hints|typing Module (Type Hints) (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

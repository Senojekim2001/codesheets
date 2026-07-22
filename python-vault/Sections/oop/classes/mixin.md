---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "mixin"
title: "Mixin pattern"
category: "Classes"
subtitle: "Compose behavior without deep inheritance hierarchies"
signature_short: "class MyClass(FeatureMixin, AnotherMixin, Base): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Mixin pattern"
  - "mixin"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Mixin pattern

> Compose behavior without deep inheritance hierarchies

## Overview

A Mixin is a class designed to be mixed in via multiple inheritance. Mixins add specific behavior without being a standalone class. They typically have no __init__, inherit only from object, and do not depend on subclass state beyond what they define themselves.

## Signature

```python
class MyClass(FeatureMixin, AnotherMixin, Base): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one tiny mixin with one method, no __init__. Glue it onto
#             a regular class to add behavior.
# STRENGTHS - shows the core idea in the smallest space: a class designed
#             to be added, not instantiated alone.
# WEAKNESSES- a single mixin doesn't show the real win of composition —
#             that needs at least two.
#
class GreetMixin:
    def greet(self):                     # no __init__, no parent
        return f"hello, I am {self.name}"

class User(GreetMixin):
    def __init__(self, name):
        self.name = name

User("Alice").greet()    # "hello, I am Alice"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - compose three single-purpose mixins (JSON, timestamp,
#             validate) into a User. Each mixin reads attributes off
#             self.__dict__ but defines no state of its own.
# STRENGTHS - each mixin is testable on its own; new capabilities are
#             added by listing one more name in the bases.
# WEAKNESSES- every mixin assumes attributes already exist on self, so
#             instantiation order matters; nothing yet documents that
#             contract for readers.
#
import json
from datetime import datetime

class JSONMixin:
    def to_json(self) -> str:
        return json.dumps(self.__dict__, default=str)

class TimestampMixin:
    def touch(self) -> None:
        self.updated_at = datetime.now()

class ValidateMixin:
    def validate(self) -> bool:
        for field, value in self.__dict__.items():
            if value is None:
                raise ValueError(f"{field} cannot be None")
        return True

class User(JSONMixin, TimestampMixin, ValidateMixin):
    def __init__(self, name: str, email: str):
        self.name  = name
        self.email = email

u = User("Alice", "alice@example.com")
u.to_json()       # '{"name": "Alice", "email": "alice@example.com"}'
u.validate()      # True
u.touch()         # sets updated_at
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - declare the contract a mixin needs (Protocol / abstract
#             attributes), keep mixins __init__-free, and pin ordering:
#             feature mixins before the base, base last so it absorbs
#             super() at the end of the chain.
# STRENGTHS - tooling can verify each mixin is applied to a compatible
#             host class; the chain composes cleanly because every mixin
#             cooperates via super(); ordering is no longer folklore.
# WEAKNESSES- more ceremony for what is structurally simple; Protocol-
#             based contracts are checked by mypy/pyright, not at runtime.
#
from typing import Protocol, runtime_checkable

@runtime_checkable
class HasDict(Protocol):
    __dict__: dict

class CacheMixin:
    """Adds a one-shot cache. Requires a __dict__-bearing host."""
    def cached(self: HasDict, key: str, fn):
        if key not in self.__dict__:
            self.__dict__[key] = fn()
        return self.__dict__[key]

class LogMixin:
    def log(self, msg: str) -> None:
        print(f"[{type(self).__name__}] {msg}")

class Base:
    def __init__(self, **kwargs):
        # absorb leftover kwargs at the end of the MRO chain
        if kwargs:
            raise TypeError(f"unexpected kwargs: {list(kwargs)}")

class Service(LogMixin, CacheMixin, Base):
    # MRO: Service -> LogMixin -> CacheMixin -> Base -> object
    def __init__(self, name: str, **kwargs):
        super().__init__(**kwargs)
        self.name = name

s = Service("billing")
s.log("starting")               # [Service] starting
s.cached("answer", lambda: 42)  # 42 (computed once, then cached)
#
# Decision rule:
#   stateless cross-cutting behavior (logging, JSON) -> mixin
#   need shared state across users of the behavior   -> regular base class
#   only one host class will use the behavior        -> module function
#   behavior must be enabled per-instance            -> composition (attribute)
#   contract is "implements method X"                -> Protocol, not mixin
#   need to enforce overrides                        -> ABC, not mixin
#   behavior depends on host fields                  -> document via Protocol type
#
# Anti-pattern: giving mixins their own __init__
#   Mixins with __init__ break cooperative super() chains: depending on
#   MRO, the mixin's __init__ may swallow kwargs, skip the real base, or
#   never run at all. Keep mixins __init__-free; let the final class own
#   construction and let mixins read attributes that already exist on self.
```

## Decision Rule

```text
stateless cross-cutting behavior (logging, JSON) -> mixin
need shared state across users of the behavior   -> regular base class
only one host class will use the behavior        -> module function
behavior must be enabled per-instance            -> composition (attribute)
contract is "implements method X"                -> Protocol, not mixin
need to enforce overrides                        -> ABC, not mixin
behavior depends on host fields                  -> document via Protocol type
```

## Anti-Pattern

> [!warning] Anti-pattern
> giving mixins their own __init__
>   Mixins with __init__ break cooperative super() chains: depending on
>   MRO, the mixin's __init__ may swallow kwargs, skip the real base, or
>   never run at all. Keep mixins __init__-free; let the final class own
>   construction and let mixins read attributes that already exist on self.

## Tips

- Mixins should have no __init__ — rely on the final class to initialize all state
- Keep mixins single-purpose — one concern per mixin (LogMixin, CacheMixin, etc.)
- Name mixins with "Mixin" suffix — communicates intent clearly to other developers
- List mixins before the base class — methods resolve left to right in MRO

## Common Mistake

> [!warning] Creating a Mixin that calls super().__init__(). If mixed into a class with a different parent, super() may route to an unexpected class. Mixins should not have __init__.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

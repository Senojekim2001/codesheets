---
type: "entry"
domain: "python"
file: "typing"
section: "runtime-types"
id: "runtime-checkable"
title: "@runtime_checkable Protocol — isinstance() Type Checking"
category: "Runtime"
subtitle: "@runtime_checkable, isinstance, Protocol at runtime, structural checks"
signature_short: "@runtime_checkable  |  class Drawable(Protocol): def draw(self) -> None: ...  |  isinstance(obj, Drawable)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@runtime_checkable Protocol — isinstance() Type Checking"
  - "runtime-checkable"
tags:
  - "python"
  - "python/typing"
  - "python/typing/runtime-types"
  - "category/runtime"
  - "tier/tiered"
---

# @runtime_checkable Protocol — isinstance() Type Checking

> @runtime_checkable, isinstance, Protocol at runtime, structural checks

## Overview

@runtime_checkable protocols enable isinstance() checks for duck typing. Unlike ABC, protocols use structural typing — a class satisfies a protocol if it has the right methods, without inheritance. Limited to method existence checks (not signatures). Useful for type coercion, serialization dispatch, and dependency injection.

## Signature

```python
@runtime_checkable  |  class Drawable(Protocol): def draw(self) -> None: ...  |  isinstance(obj, Drawable)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Decorate a Protocol with @runtime_checkable so isinstance() can check shape at runtime.
# STRENGTHS - Quick duck-typing dispatch; no inheritance, no registration.
# WEAKNESSES- Only checks attribute names exist -- not their signatures or types.
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None: print("o")
class Line:
    pass

print(isinstance(Circle(), Drawable))   # True
print(isinstance(Line(), Drawable))     # False
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Dispatch on protocol membership; combine with collections.abc Iterable/Sized for built-in shape checks.
# STRENGTHS - Replaces hasattr / try-except dispatch with a single, intent-named check.
# WEAKNESSES- isinstance against runtime_checkable protocols walks every attribute -- noticeably slow in hot loops; cache the check.
from collections.abc import Iterable, Sized
from typing import Any, Protocol, runtime_checkable

@runtime_checkable
class JSONable(Protocol):
    def to_json(self) -> str: ...

class User:
    def __init__(self, name: str): self.name = name
    def to_json(self) -> str:
        import json; return json.dumps({"name": self.name})

def write(obj: Any, path: str) -> None:
    if isinstance(obj, JSONable):
        with open(path, "w") as f:
            f.write(obj.to_json())
    else:
        raise TypeError(f"{type(obj).__name__} is not JSONable")

# Built-in protocols (collections.abc) are runtime_checkable.
assert isinstance([1, 2, 3], Iterable)
assert isinstance("abc", Sized)
assert not isinstance(42, Iterable)

# Cache to avoid the per-call cost on hot paths:
import functools
@functools.lru_cache(maxsize=None)
def is_jsonable(cls: type) -> bool:
    return isinstance(cls.__call__ if False else cls(), JSONable)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - runtime_checkable for cheap dispatch; layer a structural sanity check on top; cache by class.
# STRENGTHS - Type-aware plug-in registries that don't lock you into ABCs; survives third-party objects.
# WEAKNESSES- runtime_checkable does NOT validate signatures -- a class with handle(self, x: str)
#             matches a Protocol that wants handle(self, x: int). Static mypy catches; runtime does not.
from __future__ import annotations
import functools
import inspect
from collections.abc import Callable
from typing import Any, Protocol, runtime_checkable

# 1) Pure structural Protocol -- isinstance is cheap-ish but NOT free.
@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

# 2) Add a signature sanity check ONCE per class to harden the runtime check.
def _matches_close(cls: type) -> bool:
    f = getattr(cls, "close", None)
    if not callable(f): return False
    sig = inspect.signature(f)
    # exclude self -- expect zero positional args
    return len([p for p in sig.parameters.values()
                if p.name != "self" and p.default is inspect.Parameter.empty]) == 0

@functools.lru_cache(maxsize=None)
def is_strict_closeable(cls: type) -> bool:
    return isinstance(cls, type) and issubclass(cls, object) and _matches_close(cls)

def safe_close(x: Any) -> None:
    if isinstance(x, Closeable) and is_strict_closeable(type(x)):
        try: x.close()
        except Exception: pass

# 3) Plug-in registry pattern -- collect classes that implement a Protocol.
class Plugin(Protocol):
    name: str
    def run(self, payload: dict[str, Any]) -> int: ...

@runtime_checkable
class _PluginRT(Plugin, Protocol): ...     # runtime version; static stays Plugin

PLUGINS: dict[str, type[Plugin]] = {}
def register(cls: type) -> type:
    if isinstance(cls(), _PluginRT):
        PLUGINS[cls.name] = cls
    else:
        raise TypeError(f"{cls.__name__} does not satisfy Plugin")
    return cls

# Decision rule:
#   pure static type check                          -> Protocol (NO @runtime_checkable)
#   need isinstance() at runtime                    -> @runtime_checkable Protocol
#   plug-in registration / dispatch table           -> @runtime_checkable + signature sanity check + cache
#   library is performance-sensitive                -> ABC + register() (faster than structural isinstance)
#   want to validate "this conforms to my schema"   -> Pydantic / msgspec, NOT a Protocol
#
# Anti-pattern: scattering @runtime_checkable on every Protocol you write.
# Each one adds a runtime cost AND lulls callers into believing the check is
# strong. Reserve it for protocols you actually dispatch on, and harden those
# with a one-time signature audit (the lru_cache version above).
```

## Decision Rule

```text
pure static type check                          -> Protocol (NO @runtime_checkable)
need isinstance() at runtime                    -> @runtime_checkable Protocol
plug-in registration / dispatch table           -> @runtime_checkable + signature sanity check + cache
library is performance-sensitive                -> ABC + register() (faster than structural isinstance)
want to validate "this conforms to my schema"   -> Pydantic / msgspec, NOT a Protocol
```

## Anti-Pattern

> [!warning] Anti-pattern
> scattering @runtime_checkable on every Protocol you write.
> Each one adds a runtime cost AND lulls callers into believing the check is
> strong. Reserve it for protocols you actually dispatch on, and harden those
> with a one-time signature audit (the lru_cache version above).

## Tips

- @runtime_checkable only checks method names exist — it doesn't verify parameter or return types. Use for simple existence checks only.
- Structural typing (protocols) is more flexible than ABCs — classes satisfy protocols without explicit inheritance.
- Use isinstance(obj, Protocol) to dispatch code based on interface, not concrete type.
- Two different jobs: @runtime_checkable Protocol answers "does this object have these attribute names?" — Pydantic / msgspec answer "does this object match this schema (with types and constraints)?" Don't conflate them; reach for the right one.

## Common Mistake

> [!warning] Assuming @runtime_checkable verifies signatures — it only checks that methods exist, not their types. Signature mismatches slip through at runtime.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual duck-typing checks
def draw_shape(shape):
    if hasattr(shape, "draw") and callable(getattr(shape, "draw")):
        shape.draw()
    else:
        raise TypeError("Shape must have draw method")
```

**Senior:**
```python
@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...

def draw_shape(shape: Any) -> None:
    if isinstance(shape, Drawable):
        shape.draw()
    else:
        raise TypeError(f"{type(shape)} not Drawable")
```

## See Also

- [[Sections/typing/runtime-types/get-type-hints|get_type_hints & Type Introspection — Reflection at Runtime (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/dataclass-typed|Typed Dataclasses — Type Hints + Data Structures (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/_Index|Type Hints & mypy → Runtime Type Checking]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

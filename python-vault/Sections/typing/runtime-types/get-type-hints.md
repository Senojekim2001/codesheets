---
type: "entry"
domain: "python"
file: "typing"
section: "runtime-types"
id: "get-type-hints"
title: "get_type_hints & Type Introspection — Reflection at Runtime"
category: "Runtime"
subtitle: "get_type_hints, get_origin, get_args, __annotations__, introspection"
signature_short: "get_type_hints(func)  |  get_origin(list[int])  |  get_args(dict[str, int])  |  func.__annotations__"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "get_type_hints & Type Introspection — Reflection at Runtime"
  - "get-type-hints"
tags:
  - "python"
  - "python/typing"
  - "python/typing/runtime-types"
  - "category/runtime"
  - "tier/tiered"
---

# get_type_hints & Type Introspection — Reflection at Runtime

> get_type_hints, get_origin, get_args, __annotations__, introspection

## Overview

Python type hints are metadata — get_type_hints() extracts them at runtime, resolving forward refs and string annotations. Pass include_extras=True to keep Annotated[...] wrappers (validators, FastAPI Depends). get_origin() and get_args() decompose generic types (list[int] → list, (int,)). To detect unions across versions, check both: `get_origin(t) in (typing.Union, types.UnionType)` (PEP 604 X | Y lands as types.UnionType). __annotations__ is the raw dict — under `from __future__ import annotations` it contains STRINGS, not types. Always use get_type_hints() for runtime use.

## Signature

```python
get_type_hints(func)  |  get_origin(list[int])  |  get_args(dict[str, int])  |  func.__annotations__
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - get_type_hints() resolves annotations to real types; works for functions and classes.
# STRENGTHS - Reads forward refs and 'from __future__ import annotations'; what __annotations__ alone cannot.
# WEAKNESSES- It IMPORTS the modules referenced in annotations; circular references can re-trigger imports.
from typing import get_type_hints

def greet(name: str, age: int = 30) -> str:
    return f"Hi {name}, {age}"

print(get_type_hints(greet))
# {'name': <class 'str'>, 'age': <class 'int'>, 'return': <class 'str'>}

class User:
    name: str
    age: int
    active: bool = True

print(get_type_hints(User))
# {'name': str, 'age': int, 'active': bool}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - get_origin / get_args decompose generics; useful for schema, validation, dispatch.
# STRENGTHS - Walk an annotation tree without parsing strings; works for list[T], dict[K,V], unions.
# WEAKNESSES- Unions land as types.UnionType (PEP 604) OR typing.Union depending on syntax; check both.
from typing import Union, get_args, get_origin, get_type_hints
import types

def describe(t: object) -> str:
    origin = get_origin(t)
    args = get_args(t)
    if origin is None:
        return getattr(t, "__name__", str(t))
    if origin in (Union, types.UnionType):
        return " | ".join(describe(a) for a in args)
    name = getattr(origin, "__name__", str(origin))
    return f"{name}[{', '.join(describe(a) for a in args)}]"

class Product:
    name: str
    price: float
    tags: list[str]
    owner: str | None

for k, v in get_type_hints(Product).items():
    print(f"{k}: {describe(v)}")
# name: str
# price: float
# tags: list[str]
# owner: str | None

# Pull validators out of Annotated metadata.
from typing import Annotated, Annotated as A
def positive(n: int) -> bool: return n > 0
Score = A[int, positive]
hints = get_type_hints(lambda x: x, include_extras=True)  # need include_extras for Annotated
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - get_type_hints(include_extras=True) for Annotated; resolve in the right module's globals; cache results.
# STRENGTHS - Build serializers, validators, and dependency injectors from annotations -- the basis of FastAPI & Pydantic.
# WEAKNESSES- Annotation strings are evaluated in the OWNER module's namespace; passing a class to a different module without globals/locals breaks resolution.
from __future__ import annotations
import functools
import sys
import types
from collections.abc import Callable
from typing import Annotated, Any, get_args, get_origin, get_type_hints

# 1) Cache hints -- resolution is not free, especially with forward refs.
@functools.lru_cache(maxsize=None)
def cached_hints(obj: Any) -> dict[str, Any]:
    # include_extras=True keeps Annotated[...] wrappers (validators, FastAPI Depends).
    return get_type_hints(obj, include_extras=True)

# 2) Robust origin check that handles PEP 604 (X | Y) and typing.Union both.
def is_union(t: Any) -> bool:
    return get_origin(t) in (types.UnionType, getattr(__import__("typing"), "Union"))

# 3) Build a runtime validator from annotations -- no third-party libs.
def make_validator(fn: Callable[..., Any]) -> Callable[..., None]:
    hints = cached_hints(fn)
    hints.pop("return", None)
    def validate(**kwargs: Any) -> None:
        for name, t in hints.items():
            if name not in kwargs:           # default present, skip
                continue
            v = kwargs[name]
            origin = get_origin(t) or t
            # primitive / class
            if isinstance(origin, type):
                if not isinstance(v, origin):
                    raise TypeError(f"{name}: expected {origin.__name__}, got {type(v).__name__}")
            # Annotated -> first arg is the real type
            if get_origin(t) is Annotated.__class__ or hasattr(t, "__metadata__"):
                inner, *meta = get_args(t)
                if not isinstance(v, inner if isinstance(inner, type) else type(v)):
                    raise TypeError(f"{name}: expected {inner}")
                for m in meta:
                    if callable(m) and not m(v):
                        raise ValueError(f"{name}: failed predicate {m.__name__}")
    return validate

# 4) Resolve forward refs that come from a DIFFERENT module:
#    pass owners' globals so 'from __future__ import annotations' works.
def hints_for_external(obj: Any, module_name: str) -> dict[str, Any]:
    g = vars(sys.modules[module_name])
    return get_type_hints(obj, globalns=g, localns=None, include_extras=True)

# Decision rule:
#   need real types (not strings) from annotations    -> get_type_hints (NOT __annotations__)
#   need decorator metadata from Annotated[...]       -> get_type_hints(..., include_extras=True)
#   need to test "is this a Union/Optional?"          -> get_origin in (Union, types.UnionType)
#   need to walk a nested annotation                  -> recurse on get_args after each get_origin
#   target lives in another module / forward refs     -> pass globalns=vars(sys.modules[mod]) explicitly
#
# Anti-pattern: reading cls.__annotations__ directly. With
# 'from __future__ import annotations' you get STRINGS, not types. Every
# downstream isinstance() check then fails silently; runtime libraries
# (Pydantic, dataclasses) call get_type_hints precisely to avoid that trap.
```

## Decision Rule

```text
need real types (not strings) from annotations    -> get_type_hints (NOT __annotations__)
need decorator metadata from Annotated[...]       -> get_type_hints(..., include_extras=True)
need to test "is this a Union/Optional?"          -> get_origin in (Union, types.UnionType)
need to walk a nested annotation                  -> recurse on get_args after each get_origin
target lives in another module / forward refs     -> pass globalns=vars(sys.modules[mod]) explicitly
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading cls.__annotations__ directly. With
> 'from __future__ import annotations' you get STRINGS, not types. Every
> downstream isinstance() check then fails silently; runtime libraries
> (Pydantic, dataclasses) call get_type_hints precisely to avoid that trap.

## Tips

- get_type_hints() resolves string annotations — handles forward references and from __future__ import annotations.
- get_origin() returns the generic base (list, dict, Union) — use it to dispatch on container type.
- get_args() unpacks generic arguments — useful for iterating over union variants or nested types.
- Type introspection powers Pydantic, FastAPI, and serialization frameworks — understanding it helps debug schema generation.

## Common Mistake

> [!warning] Using __annotations__ directly instead of get_type_hints() — annotations may contain strings (forward references) and won't resolve them. Always use get_type_hints().

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual validation without hints
def process(obj):
    if not hasattr(obj, '__dict__'):
        return False
    # No type info available
```

**Senior:**
```python
# Type-driven validation with get_type_hints
from typing import get_type_hints

def validate(cls: type, obj: Any) -> bool:
    hints = get_type_hints(cls)
    for name, type_hint in hints.items():
        if not isinstance(getattr(obj, name), type_hint):
            return False
    return True
```

## See Also

- [[Sections/typing/runtime-types/runtime-checkable|@runtime_checkable Protocol — isinstance() Type Checking (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/dataclass-typed|Typed Dataclasses — Type Hints + Data Structures (Type Hints & mypy)]]
- [[Sections/typing/runtime-types/_Index|Type Hints & mypy → Runtime Type Checking]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

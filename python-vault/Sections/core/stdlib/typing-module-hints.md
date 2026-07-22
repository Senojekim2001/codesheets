---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "typing-module-hints"
title: "typing Module (Type Hints)"
category: "Type System"
subtitle: "Optional runtime type hints for clarity and tooling"
signature_short: "from typing import List, Dict, Optional, Callable, Union
def func(x: int) -> str: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "typing Module (Type Hints)"
  - "typing-module-hints"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/type-system"
  - "tier/tiered"
---

# typing Module (Type Hints)

> Optional runtime type hints for clarity and tooling

## Overview

Type hints document expected types and enable IDE autocompletion and static checkers (mypy). Python enforces at runtime but hints help tooling and developers.

## Signature

```python
from typing import List, Dict, Optional, Callable, Union
def func(x: int) -> str: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Annotate parameters and returns; use built-in generics (list[T], dict[K,V]).
# STRENGTHS - IDE autocomplete + mypy/pyright catch bugs at edit time.
# WEAKNESSES- See typing.js for the deep dive: Protocol, NewType, ParamSpec, variance, dataclasses.
def greet(name: str) -> str:
    return f"hi {name}"

def process(items: list[str]) -> dict[str, int]:
    return {x: len(x) for x in items}

age: int | None = None                       # 3.10+ X | Y syntax
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - X | None over Optional; built-ins over typing.List; TypedDict for JSON shapes; @dataclass for typed records.
# STRENGTHS - Modern syntax (3.10+); deprecated typing.List replaced by list[T].
# WEAKNESSES- See typing.js for Required/NotRequired/ReadOnly TypedDict, Protocol, NewType.
from dataclasses import dataclass
from typing import TypedDict, Literal

# JSON shape (wire format).
class UserResponse(TypedDict):
    id: int
    name: str
    role: Literal["admin", "user", "viewer"]

# Typed record (for behavior + validation).
@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float

# Forward references — quote the class name OR use 'from __future__ import annotations'.
class Node:
    def __init__(self, val: int, nxt: "Node | None" = None):
        self.val, self.nxt = val, nxt
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For Protocol, NewType, ParamSpec, TypeIs, variance, Self, dataclass+slots+kw_only — see typing.js senior tiers.
# STRENGTHS - typing.js covers the production decisions: Sequence/Iterable for inputs, NewType for ID safety, bound=Protocol for capability.
# WEAKNESSES- Type hints are ZERO runtime — mypy (or pyright) needs to actually run in CI to catch anything.
# Quick reference (full senior tier in typing.js):
#
#   public function inputs               -> Sequence/Iterable/Mapping (covariant)
#   public function outputs              -> concrete list/dict/set
#   "I accept anything"                  -> object, NOT Any
#   ID branding (UserId vs OrderId)      -> NewType
#   structural interfaces                -> Protocol
#   capability bound                     -> bound=Protocol (NOT constraints)
#   decorator-preserve                   -> ParamSpec + TypeVar
#   narrow on True AND False              -> TypeIs (3.13+); fall back to TypeGuard
#   sortable / hashable / immutable record -> @dataclass(frozen=True, slots=True, kw_only=True)
#
# Decision rule:
#   greenfield code                      -> 'from __future__ import annotations' + X | Y syntax + built-in generics
#   gradual typing on legacy code         -> per-module mypy overrides; tighten one module at a time
#   runtime validation                   -> Pydantic / msgspec / dataclasses-json; type hints alone don't enforce
#   structural duck typing               -> Protocol (NOT ABC unless you need register())
#   type-driven dispatch                 -> @functools.singledispatch
#
# Anti-pattern: Any everywhere "to make mypy happy". Any DISABLES all type
# checking for that value — it doesn't make the bug go away, it hides it.
# Either type it correctly, or use 'object' so callers must narrow before use.
```

## Decision Rule

```text
greenfield code                      -> 'from __future__ import annotations' + X | Y syntax + built-in generics
gradual typing on legacy code         -> per-module mypy overrides; tighten one module at a time
runtime validation                   -> Pydantic / msgspec / dataclasses-json; type hints alone don't enforce
structural duck typing               -> Protocol (NOT ABC unless you need register())
type-driven dispatch                 -> @functools.singledispatch
```

## Anti-Pattern

> [!warning] Anti-pattern
> Any everywhere "to make mypy happy". Any DISABLES all type
> checking for that value — it doesn't make the bug go away, it hides it.
> Either type it correctly, or use 'object' so callers must narrow before use.

## Tips

- Type hints don't enforce at runtime — use mypy (static checker) for validation
- Optional[T] is equivalent to Union[T, None]
- TypeVar for generic functions — type must be consistent within function
- IDE uses hints for autocompletion — huge productivity boost

## Common Mistake

> [!warning] Thinking type hints enforce runtime constraints. They don't — they're for tooling. Use isinstance() checks for runtime validation.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/data-types/type-hints|Type hints (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/abc|Abstract Base Classes (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

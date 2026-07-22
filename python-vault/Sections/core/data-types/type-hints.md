---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "type-hints"
title: "Type hints"
category: "Type System"
subtitle: "list[int], dict[str,int], X | None, TypeVar, Protocol"
signature_short: "def fn(x: int) -> str | None: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Type hints"
  - "type-hints"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/type-system"
  - "tier/tiered"
---

# Type hints

> list[int], dict[str,int], X | None, TypeVar, Protocol

## Overview

Type hints make code self-documenting and enable static analysis with mypy or pyright. Python does not enforce them at runtime. Since 3.10+, use `X | Y` instead of `Union[X,Y]`. Since 3.9+, use built-in `list[int]` and `dict[str,int]` directly.

## Signature

```python
def fn(x: int) -> str | None: ...
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
# GOAL: Annotate variables and function signatures
x: int = 42
name: str = 'Alice'
items: list[str] = []

def greet(name: str, times: int = 1) -> str:
    return (name + ' ') * times

# GOAL: Optional — value or None (use X | None in 3.10+)
def find(lst: list[int], val: int) -> int | None:
    try: return lst.index(val)
    except ValueError: return None
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
# GOAL: Union, Callable, and collection types
from typing import Callable

def process(val: int | str | float) -> str:
    return str(val).upper()

def apply(fn: Callable[[int], str], n: int) -> str:
    return fn(n)

apply(str, 42)   # → '42'

# GOAL: TypeVar for generic functions — type consistent across call
from typing import TypeVar
T = TypeVar('T')
def first(lst: list[T]) -> T:
    return lst[0]

first([1, 2, 3])    # → 1  (inferred as int)
first(['a', 'b'])   # → 'a' (inferred as str)
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
# GOAL: Protocol — structural typing (duck typing with type safety)
# WHY: Any class with the right methods satisfies it — no inheritance needed
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print('Drawing circle')

def render(item: Drawable) -> None:
    item.draw()

render(Circle())   # ✓ — Circle satisfies Drawable structurally

# GOAL: TypedDict for dicts with known shape
from typing import TypedDict
class UserDict(TypedDict):
    name: str
    age:  int

def greet_user(user: UserDict) -> str:
    return f"Hello {user['name']}"

# NOTE: Type hints are documentation and tooling only — not enforced at runtime
# Run mypy script.py or pyright for static checking
#
# Decision rule:
#   any new Python code                          -> add type hints from day one
#   list / dict / tuple / set                    -> built-in generics list[int] (3.9+)
#   "either X or Y"                              -> X | Y (3.10+) (NOT Union)
#   "X or None"                                  -> X | None (NOT Optional[X])
#   structural duck typing                        -> typing.Protocol
#   dict with known keys + types                  -> typing.TypedDict
#   generic function                              -> def f[T](x: T) -> T (3.12+) or TypeVar
#   forward references / circular import          -> "from __future__ import annotations" + quoted strings
#   need runtime enforcement                      -> Pydantic / attrs (NOT type hints alone)
#   throwaway script, prototype                   -> hints optional but recommended
#
# Anti-pattern: relying on type hints to validate runtime data.
#   `def f(x: int)` does not stop someone passing a str — Python ignores the annotation. For
#   hard validation use Pydantic, beartype, attrs.validators, or assert isinstance() at the
#   boundary. Inversely: importing typing.List/Dict/Tuple/Set in 3.9+ code is dead weight;
#   use lower-case built-ins.
```

## Decision Rule

```text
any new Python code                          -> add type hints from day one
list / dict / tuple / set                    -> built-in generics list[int] (3.9+)
"either X or Y"                              -> X | Y (3.10+) (NOT Union)
"X or None"                                  -> X | None (NOT Optional[X])
structural duck typing                        -> typing.Protocol
dict with known keys + types                  -> typing.TypedDict
generic function                              -> def f[T](x: T) -> T (3.12+) or TypeVar
forward references / circular import          -> "from __future__ import annotations" + quoted strings
need runtime enforcement                      -> Pydantic / attrs (NOT type hints alone)
throwaway script, prototype                   -> hints optional but recommended
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on type hints to validate runtime data.
>   `def f(x: int)` does not stop someone passing a str — Python ignores the annotation. For
>   hard validation use Pydantic, beartype, attrs.validators, or assert isinstance() at the
>   boundary. Inversely: importing typing.List/Dict/Tuple/Set in 3.9+ code is dead weight;
>   use lower-case built-ins.

## Tips

- Python 3.10+: use `X | Y` and `X | None` — cleaner than `Union[X,Y]` and `Optional[X]`
- Python 3.9+: use `list[int]`, `dict[str,int]` — no need to import from `typing`
- `Protocol` is structural subtyping — any class with the right methods qualifies, no inheritance required

## Common Mistake

> [!warning] Using `List[int]` (capital L, from `typing`) in Python 3.9+. Use built-in `list[int]` directly. The typing module versions still work but are deprecated.

## See Also

- [[Sections/core/data-types/abc|Abstract Base Classes (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/typing-module-hints|typing Module (Type Hints) (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

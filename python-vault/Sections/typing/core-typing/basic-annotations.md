---
type: "entry"
domain: "python"
file: "typing"
section: "core-typing"
id: "basic-annotations"
title: "Type Annotations — Variables, Functions & Collections"
category: "Basics"
subtitle: "int, str, list[T], dict[K,V], X | Y, X | None, tuple, NewType, Final, Never (Optional/Union still work but `|` is preferred)"
signature_short: "def fn(x: int, y: str = \"a\") -> bool:  |  x: list[int] = []  |  name: str | None"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Type Annotations — Variables, Functions & Collections"
  - "basic-annotations"
tags:
  - "python"
  - "python/typing"
  - "python/typing/core-typing"
  - "category/basics"
  - "tier/tiered"
---

# Type Annotations — Variables, Functions & Collections

> int, str, list[T], dict[K,V], X | Y, X | None, tuple, NewType, Final, Never (Optional/Union still work but `|` is preferred)

## Overview

Type hints document expected types and enable static analysis with mypy, pyright, or IDE tooling. Since Python 3.10+, use built-in types directly (list[int] instead of List[int]). Use X | None instead of Optional[X]. Annotate function parameters, return types, and variables. Type hints have zero runtime cost — they are metadata only. Use from __future__ import annotations to defer evaluation (strings) for forward references and performance.

## Signature

```python
def fn(x: int, y: str = "a") -> bool:  |  x: list[int] = []  |  name: str | None
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Annotate variables and function signatures with built-in types.
# STRENGTHS - Catches typos at edit time; enables IDE autocomplete and refactor.
# WEAKNESSES- Hints are metadata only -- no runtime enforcement.
def greet(name: str, loud: bool = False) -> str:
    msg = f"Hello, {name}!"
    return msg.upper() if loud else msg

def word_lengths(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# Common building blocks.
names: list[str] = ["Alice", "Bob"]
scores: dict[str, float] = {"Alice": 98.5}
coords: tuple[float, float] = (1.0, 2.0)

# X | None replaces Optional[X] (Python 3.10+).
def find(user_id: int) -> str | None:
    return None
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Defer annotations, use Callable/aliases, mark constants Final, prefer X | Y unions.
# STRENGTHS - Cleaner imports, faster startup, expressive function types, immutable constants.
# WEAKNESSES- 'from __future__ import annotations' makes runtime introspection (FastAPI, dataclass) require get_type_hints().
from __future__ import annotations
from collections.abc import Callable
from typing import Final

# Type aliases (PEP 695, Python 3.12+); on older Python use plain assignment.
type Matrix = list[list[float]]
type Handler = Callable[[str], None]

# Final = "do not reassign". mypy enforces; runtime ignores.
MAX_RETRIES: Final = 3
API_URL: Final[str] = "https://api.example.com"

# Callable signature: arg types -> return type.
def apply(fn: Callable[[int, int], int], a: int, b: int) -> int:
    return fn(a, b)

# Variadic tuple vs fixed.
fixed: tuple[float, float] = (1.0, 2.0)
varlen: tuple[int, ...] = (1, 2, 3, 4)

# Union return -- callers must narrow.
def parse_age(s: str) -> int | None:
    try:
        return int(s)
    except ValueError:
        return None
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - object over Any, NewType for domain identity, Final for constants, Self/Never for intent.
# STRENGTHS - Catches the bugs Any hides; ID-confusion classes of bugs disappear at type-check time.
# WEAKNESSES- Stricter types raise the bar on contributors; team must agree on the policy before turning the screws.
from __future__ import annotations
from collections.abc import Callable, Iterable, Mapping, Sequence
from typing import Final, NewType, Never

# 1) Domain identity: prevent passing a UserId where an OrderId is expected.
UserId = NewType("UserId", int)
OrderId = NewType("OrderId", int)

def cancel(order_id: OrderId) -> None: ...
# cancel(UserId(7))   # mypy error -- different brands

# 2) Prefer Sequence/Iterable/Mapping in PUBLIC signatures (covariant inputs);
#    use list/dict/set in IMPLEMENTATIONS (you control the mutation).
def summarize(rows: Sequence[Mapping[str, object]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for r in rows:
        for k in r:
            counts[k] = counts.get(k, 0) + 1
    return counts

# 3) Use 'object' instead of 'Any' for "I accept anything but won't trust it":
#    object still requires isinstance() before .attr access -- Any silently allows everything.
def to_repr(x: object) -> str:
    return repr(x)

# 4) Final for module constants -- catches accidental reassignment that would break invariants.
DEFAULT_TIMEOUT: Final[float] = 5.0

# 5) Never marks unreachable branches and signals "this terminates the process".
def die(msg: str) -> Never:
    raise SystemExit(msg)

# 6) Callable types name themselves in errors when aliased -- aliases > inline.
type ErrorHandler = Callable[[BaseException], None]

def run(jobs: Iterable[Callable[[], int]], on_error: ErrorHandler) -> list[int]:
    out: list[int] = []
    for j in jobs:
        try:
            out.append(j())
        except Exception as e:
            on_error(e)
    return out

# Decision rule:
#   public function input         -> Sequence/Iterable/Mapping (accept more, demand less)
#   public function output        -> concrete list/dict/set (callers know what they got)
#   "I accept any object"         -> object, NOT Any
#   "I don't care about this"     -> Any (last resort, document why)
#   IDs that share repr (int)     -> NewType to make them mutually un-assignable
#   never-returns / unreachable   -> Never (tighter than NoReturn for narrowing)
#
# Anti-pattern: typing everything as Any "to make mypy quiet". Any disables ALL
# checks for that value -- it doesn't make the bug go away, it hides it. Either
# fix the type or, if you must, use 'object' so you're forced to narrow.
```

## Decision Rule

```text
public function input         -> Sequence/Iterable/Mapping (accept more, demand less)
public function output        -> concrete list/dict/set (callers know what they got)
"I accept any object"         -> object, NOT Any
"I don't care about this"     -> Any (last resort, document why)
IDs that share repr (int)     -> NewType to make them mutually un-assignable
never-returns / unreachable   -> Never (tighter than NoReturn for narrowing)
```

## Anti-Pattern

> [!warning] Anti-pattern
> typing everything as Any "to make mypy quiet". Any disables ALL
> checks for that value -- it doesn't make the bug go away, it hides it. Either
> fix the type or, if you must, use 'object' so you're forced to narrow.

## Tips

- Use from __future__ import annotations at the top of every file — it enables modern X | Y syntax on Python 3.9+ and speeds up import.
- Prefer built-in types (list, dict, tuple, set) over typing.List, typing.Dict etc. — the typing versions are deprecated since 3.9.
- In public function inputs, prefer Sequence/Iterable/Mapping over list/dict — accept more, demand less. Use the concrete type only in your own implementations.
- Use NewType to brand IDs that share a runtime type: UserId = NewType("UserId", int). Prevents passing a UserId where an OrderId is expected.
- Annotate return types even for simple functions — it catches bugs when callers assume the wrong type.
- Use type aliases (type X = ...) for complex types — Matrix = list[list[float]] is clearer than repeating the full type.

## Common Mistake

> [!warning] Using Any everywhere to "make mypy happy" — Any disables all type checking for that value. It should be a last resort. Use object (accepts anything but still type-safe) or proper generics instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
def process(items):
    return {item: len(item) for item in items}
```

**Senior:**
```python
def process(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}
```

## See Also

- [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/subplots|plt.subplots() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI (Matplotlib)]]
- [[Sections/typing/core-typing/_Index|Type Hints & mypy → Core Type Hints & Annotations]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

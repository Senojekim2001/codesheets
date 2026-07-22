---
type: "entry"
domain: "python"
file: "typing"
section: "type-narrowing"
id: "isinstance-narrowing"
title: "isinstance & issubclass Narrowing — Union Type Refinement"
category: "Type Guards"
subtitle: "isinstance, issubclass, Union narrowing, type narrowing"
signature_short: "if isinstance(x, str): ...  |  if isinstance(x, (str, int)): ...  |  isinstance(x, class)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "isinstance & issubclass Narrowing — Union Type Refinement"
  - "isinstance-narrowing"
tags:
  - "python"
  - "python/typing"
  - "python/typing/type-narrowing"
  - "category/type-guards"
  - "tier/tiered"
---

# isinstance & issubclass Narrowing — Union Type Refinement

> isinstance, issubclass, Union narrowing, type narrowing

## Overview

Type narrowing is TypeScript-style type refinement for Python. Inside an if isinstance(x, str) block, mypy narrows x from union to str. This works with multiple types: isinstance(x, (str, int)). issubclass() narrows class types. For 3+ shapes, prefer match/case with a Literal-tagged union and assert_never in the default branch — mypy enforces exhaustiveness. Caveat: parametrized generics are erased at runtime, so isinstance(x, list[str]) raises TypeError; isinstance(x, list) works, then validate elements separately.

## Signature

```python
if isinstance(x, str): ...  |  if isinstance(x, (str, int)): ...  |  isinstance(x, class)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Inside an isinstance() branch, mypy treats the value as the narrower type.
# STRENGTHS - Free type safety; works for unions, None checks, and class hierarchies.
# WEAKNESSES- Only narrows on isinstance/is/is not -- dotted attribute checks don't narrow.
def process(value: str | int) -> None:
    if isinstance(value, str):
        print(value.upper())     # mypy knows: str
    else:
        print(value + 1)         # mypy knows: int

# None-narrowing: 'is None' / 'is not None'.
def length_or_zero(s: str | None) -> int:
    if s is not None:
        return len(s)            # mypy knows: str
    return 0

# Class hierarchies narrow too.
class Animal: pass
class Dog(Animal): pass
class Cat(Animal): pass

def sound(a: Animal) -> str:
    if isinstance(a, Dog):
        return "woof"
    if isinstance(a, Cat):
        return "meow"
    return "?"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Tuple checks for many types, attribute discrimination, walrus + isinstance for narrowing in expressions.
# STRENGTHS - Compact code; mypy narrows after early-return as well as inside the branch.
# WEAKNESSES- isinstance against parametrized generics (list[str]) is a runtime error -- only base types work.
from typing import Any

# Multiple types in one isinstance call (must be a TUPLE, not list).
def to_int(x: str | int | float | None) -> int:
    if x is None:
        return 0
    if isinstance(x, (int, float)):
        return int(x)              # narrowed to int | float
    return int(x.strip())          # remaining: str

# Early-return narrowing -- after the guard, mypy keeps the narrowed type.
def must_be_int(x: int | str) -> int:
    if not isinstance(x, int):
        raise TypeError("expected int")
    return x + 1                   # mypy: int

# Walrus + isinstance: narrow inside an expression.
items: list[Any] = [1, "two", 3.0]
ints = [n for it in items if isinstance((n := it), int)]

# Discriminated union via a literal field.
from typing import Literal, TypedDict
class Cat(TypedDict): kind: Literal["cat"]; lives: int
class Dog(TypedDict): kind: Literal["dog"]; bark: str

def describe(p: Cat | Dog) -> str:
    if p["kind"] == "cat":
        return f"{p['lives']} lives"     # narrowed to Cat
    return p["bark"]                      # narrowed to Dog

# Runtime gotcha: isinstance(x, list[str]) raises TypeError at runtime.
# Use isinstance(x, list) and then validate elements separately.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Narrow at the boundary; carry concrete types through internals; use match/case for tagged unions on 3.10+.
# STRENGTHS - One validation site converts unknown -> typed; rest of the system is mypy-strict from there on.
# WEAKNESSES- isinstance loses type-parameter info (list[X] -> list[Any]); always re-validate elements after isinstance(list).
from __future__ import annotations
from collections.abc import Mapping, Sequence
from typing import TypeIs, Any, assert_never

# 1) TypeIs (3.13+): narrowing predicate that mypy trusts on True AND False.
#    TypeGuard only narrows on True -- TypeIs is symmetric and supersedes it.
def is_str_seq(x: object) -> TypeIs[Sequence[str]]:
    return (isinstance(x, Sequence)
            and not isinstance(x, (str, bytes))         # str is a Sequence[str]!
            and all(isinstance(v, str) for v in x))

def join(x: object) -> str:
    if is_str_seq(x):
        return ", ".join(x)                             # narrowed
    raise TypeError(type(x).__name__)

# 2) match/case on a Literal-tagged union -- exhaustive narrowing.
from typing import Literal, TypedDict
class _A(TypedDict): kind: Literal["a"]; x: int
class _B(TypedDict): kind: Literal["b"]; y: str
Tagged = _A | _B

def handle(t: Tagged) -> int:
    match t:
        case {"kind": "a", "x": x}:   return x
        case {"kind": "b", "y": y}:   return len(y)
        case _:                       assert_never(t)   # mypy errors if a case is missing

# 3) Boundary validator: any -> typed, ONCE, at ingress.
def coerce_user(raw: object) -> dict[str, str]:
    if not (isinstance(raw, Mapping)
            and all(isinstance(k, str) and isinstance(v, str) for k, v in raw.items())):
        raise ValueError("user payload must be Mapping[str, str]")
    return dict(raw)                                    # mypy: dict[str, str]

# 4) issubclass narrows class objects, not instances -- use bound TypeVar.
from typing import TypeVar
TC = TypeVar("TC", bound=type)
def make(cls: TC, *args: Any) -> Any:
    if issubclass(cls, Exception):
        # cls narrowed to type[Exception]
        raise cls(*args)
    return cls(*args)

# Decision rule:
#   single union, two cases             -> isinstance + else
#   union with 3+ shapes                -> match/case + assert_never
#   "predicate over a value"            -> TypeIs (3.13+); fall back to TypeGuard on older Python
#   coercing JSON / external data       -> Pydantic / msgspec / dataclasses-json (NOT a tower of isinstance)
#   parametrized generics (list[Foo])   -> isinstance(list) then validate elements; structural type isn't checkable
#
# Anti-pattern: trusting isinstance(x, list[Foo]). Generic parameters are erased
# at runtime. The expression raises TypeError; even if it didn't, the [Foo]
# part would be ignored. Validate the container, then validate the elements.
```

## Decision Rule

```text
single union, two cases             -> isinstance + else
union with 3+ shapes                -> match/case + assert_never
"predicate over a value"            -> TypeIs (3.13+); fall back to TypeGuard on older Python
coercing JSON / external data       -> Pydantic / msgspec / dataclasses-json (NOT a tower of isinstance)
parametrized generics (list[Foo])   -> isinstance(list) then validate elements; structural type isn't checkable
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting isinstance(x, list[Foo]). Generic parameters are erased
> at runtime. The expression raises TypeError; even if it didn't, the [Foo]
> part would be ignored. Validate the container, then validate the elements.

## Tips

- isinstance() is the primary type narrowing tool — mypy understands it better than any other pattern.
- Negation (if x is not None) also narrows — mypy understands both if x is None and if x is not None blocks.
- Use isinstance with tuples (isinstance(x, (str, int))) to narrow to multiple types at once.
- Type guards are more expressive than isinstance for complex logic — see TypeGuard entry for custom narrowing.

## Common Mistake

> [!warning] Forgetting to check the negative branch — if isinstance(x, str) narrows x to str in the if block, but x is str | int in the else block. Don't assume the else branch narrows to something specific unless you've checked all cases.

## Shorthand (Junior → Senior)

**Junior:**
```python
value = get_user_input()
if type(value).__name__ == "str":
    print(value.upper())
else:
    print(value + 1)
```

**Senior:**
```python
value: str | int = get_user_input()
if isinstance(value, str):
    print(value.upper())
else:
    print(value + 1)
```

## See Also

- [[Sections/typing/type-narrowing/typeguard|TypeGuard & TypeIs — Custom Type Narrowing Functions (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/assert-never|assert_never & Never — Exhaustive Type Checking (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/_Index|Type Hints & mypy → Type Narrowing & Guards]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

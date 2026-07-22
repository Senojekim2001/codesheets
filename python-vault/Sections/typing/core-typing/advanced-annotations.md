---
type: "entry"
domain: "python"
file: "typing"
section: "core-typing"
id: "advanced-annotations"
title: "Advanced Types — Literal, TypedDict, Annotated & Overload"
category: "Advanced"
subtitle: "Literal, TypedDict, Annotated, overload, TypeGuard, NotRequired"
signature_short: "Literal[\"a\", \"b\"]  |  class Config(TypedDict):  |  Annotated[int, Gt(0)]  |  @overload"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Advanced Types — Literal, TypedDict, Annotated & Overload"
  - "advanced-annotations"
tags:
  - "python"
  - "python/typing"
  - "python/typing/core-typing"
  - "category/advanced"
  - "tier/tiered"
---

# Advanced Types — Literal, TypedDict, Annotated & Overload

> Literal, TypedDict, Annotated, overload, TypeGuard, NotRequired

## Overview

Advanced type constructs enable precise typing for real-world Python. Literal constrains values to specific constants. TypedDict types dictionary shapes (common for JSON/API responses). Annotated attaches metadata (used by Pydantic, FastAPI). @overload defines multiple signatures for a single function. TypeGuard narrows types in if-statements. NotRequired marks optional TypedDict keys. These features make mypy catch bugs that basic types miss.

## Signature

```python
Literal["a", "b"]  |  class Config(TypedDict):  |  Annotated[int, Gt(0)]  |  @overload
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Literal pins values, TypedDict pins dict shape -- both pay off in API code.
# STRENGTHS - mypy catches typos in string flags and missing JSON keys before runtime.
# WEAKNESSES- TypedDict is type-only; at runtime it is a plain dict.
from typing import Literal, TypedDict

# Literal -- only these strings are allowed.
def set_status(s: Literal["active", "inactive", "pending"]) -> None:
    print(s)

set_status("active")
# set_status("deleted")   # mypy error: not in the Literal set

# TypedDict -- type a dict's keys.
class UserResponse(TypedDict):
    id: int
    name: str
    email: str

def show(u: UserResponse) -> str:
    return u["name"]        # mypy: str
    # return u["age"]       # mypy error: not a key
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - NotRequired keys, Annotated for validator metadata, @overload for return-type-by-input.
# STRENGTHS - Models real-world JSON; lets Pydantic/FastAPI read constraints from the type.
# WEAKNESSES- @overload bodies are a tax: you write each shape twice (stubs + impl).
from typing import Any, Annotated, Literal, NotRequired, TypedDict, overload

# Optional-per-key TypedDict -- bio may be missing.
class UserResponse(TypedDict):
    id: int
    name: str
    bio: NotRequired[str]

# Annotated[T, ...] attaches metadata that validators read.
# (annotated_types provides Gt/MinLen; Pydantic v2 reads them natively.)
from annotated_types import Gt, MinLen
UserId = Annotated[int, Gt(0)]
Username = Annotated[str, MinLen(3)]

# @overload: return type depends on a Literal flag.
@overload
def parse(raw: str, as_list: Literal[False] = False) -> dict[str, Any]: ...
@overload
def parse(raw: str, as_list: Literal[True]) -> list[dict[str, Any]]: ...

def parse(raw: str, as_list: bool = False):
    import json
    data = json.loads(raw)
    return [data] if (as_list and isinstance(data, dict)) else data

a: dict[str, Any]       = parse('{"k":1}')         # mypy picks first overload
b: list[dict[str, Any]] = parse('{"k":1}', True)   # mypy picks second
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - TypedDict for wire shape, Annotated for invariants, overload for variant returns, total=False vs NotRequired.
# STRENGTHS - Library APIs that document themselves; mypy catches breakage at the boundary.
# WEAKNESSES- TypedDict is read-mostly; mutating keys defeats the static guarantee. Reach for dataclass/Pydantic when you need behavior.
from __future__ import annotations
from typing import (
    Annotated, Any, Final, Literal, NotRequired, ReadOnly, Required,
    TypedDict, overload,
)

# 1) TypedDict: explicit Required vs NotRequired beats total=False (mixed shapes).
class APIResponse(TypedDict):
    status: Required[Literal["ok", "error"]]
    data:   NotRequired[dict[str, Any]]
    error:  NotRequired[str]

# ReadOnly (PEP 705, 3.13+) -- caller may not assign back.
class Config(TypedDict):
    version: ReadOnly[int]
    host:    ReadOnly[str]

# 2) Discriminated unions via Literal -- mypy narrows on the tag.
class _Click(TypedDict):
    type: Literal["click"]; x: int; y: int
class _Key(TypedDict):
    type: Literal["key"];   key: str
Event = _Click | _Key

def handle(e: Event) -> None:
    if e["type"] == "click":
        print(e["x"], e["y"])      # narrowed to _Click
    else:
        print(e["key"])            # narrowed to _Key

# 3) @overload for honest signatures + ONE implementation that satisfies all.
@overload
def get(key: str)               -> str: ...
@overload
def get(key: str, default: None)-> str | None: ...
@overload
def get[T](key: str, default: T)-> str | T: ...
def get(key, default="__sentinel__"):
    val = _store.get(key, default)
    if val == "__sentinel__":
        raise KeyError(key)
    return val

_store: dict[str, str] = {"a": "1"}

# 4) Annotated metadata is structured -- runtime libraries (Pydantic, FastAPI,
#    msgspec) read tuple[1:] and apply validators; mypy keeps the bare type.
from annotated_types import Gt, Le, MinLen
Port      = Annotated[int, Gt(0), Le(65535)]
NonEmpty  = Annotated[str, MinLen(1)]

# Decision rule:
#   wire-format dict from JSON          -> TypedDict (Required/NotRequired/ReadOnly)
#   one-of variants in JSON             -> TypedDict union with Literal tag, narrow on tag
#   "string flag" parameter             -> Literal[...] (catches typos, IDE autocomplete)
#   return type depends on input flag   -> @overload, single implementation
#   numeric/string invariants           -> Annotated[T, Gt(...)] for runtime libs
#   need behavior + validation          -> dataclass / Pydantic / msgspec, NOT TypedDict
#
# Anti-pattern: TypedDict with total=False AND no NotRequired markers, then
# treating every field as required in business logic. mypy stays quiet because
# the dict accepts missing keys; KeyError shows up only at 3am in production.
```

## Decision Rule

```text
wire-format dict from JSON          -> TypedDict (Required/NotRequired/ReadOnly)
one-of variants in JSON             -> TypedDict union with Literal tag, narrow on tag
"string flag" parameter             -> Literal[...] (catches typos, IDE autocomplete)
return type depends on input flag   -> @overload, single implementation
numeric/string invariants           -> Annotated[T, Gt(...)] for runtime libs
need behavior + validation          -> dataclass / Pydantic / msgspec, NOT TypedDict
```

## Anti-Pattern

> [!warning] Anti-pattern
> TypedDict with total=False AND no NotRequired markers, then
> treating every field as required in business logic. mypy stays quiet because
> the dict accepts missing keys; KeyError shows up only at 3am in production.

## Tips

- TypedDict is ideal for JSON API responses — it gives you autocompletion and type checking on dictionary keys.
- For one-of variants in JSON, build a discriminated union: a TypedDict per variant with a Literal["kind"] field, then narrow on event["kind"]. mypy tracks each branch.
- @overload is purely for type checkers — only the implementation function runs. Use it when return type depends on input type.
- Annotated[int, Gt(0)] carries metadata that Pydantic/FastAPI use for validation while mypy sees just "int".
- Required (3.11+) and ReadOnly (PEP 705, 3.13+) let you mix required + optional and write-protected keys in one TypedDict — clearer than juggling total=False.

## Common Mistake

> [!warning] Defining TypedDict with class syntax but forgetting total=False for partially optional dicts — by default all keys are required. Use NotRequired per-key (Python 3.11+) or total=False for all-optional.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual dictionary typing (no IDE hints)
def process(user):
    name = user["name"]
    age = user["age"]
```

**Senior:**
```python
# TypedDict with IDE hints
class User(TypedDict):
    name: str
    age: int

def process(user: User) -> str:
    return user["name"]
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/typing/core-typing/_Index|Type Hints & mypy → Core Type Hints & Annotations]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

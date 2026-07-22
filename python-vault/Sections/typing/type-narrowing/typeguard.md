---
type: "entry"
domain: "python"
file: "typing"
section: "type-narrowing"
id: "typeguard"
title: "TypeGuard & TypeIs — Custom Type Narrowing Functions"
category: "Type Guards"
subtitle: "TypeGuard, TypeIs, custom narrowing, predicates"
signature_short: "def is_list(val: Any) -> TypeGuard[list]: ...  |  def is_positive(val: int) -> TypeIs[int]: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "TypeGuard & TypeIs — Custom Type Narrowing Functions"
  - "typeguard"
tags:
  - "python"
  - "python/typing"
  - "python/typing/type-narrowing"
  - "category/type-guards"
  - "tier/tiered"
---

# TypeGuard & TypeIs — Custom Type Narrowing Functions

> TypeGuard, TypeIs, custom narrowing, predicates

## Overview

TypeGuard[T] enables custom type-narrowing predicates. Inside a function that returns TypeGuard[list[str]], mypy narrows the argument to list[str] in the True branch only — the False branch keeps the original type. TypeIs[T] (Python 3.13+) is the symmetric form: True narrows to T AND False narrows to NOT T. Reach for TypeIs whenever it's available; fall back to TypeGuard on older Python. Both are essential for domain validation, parsing, and invariants mypy can't infer statically.

## Signature

```python
def is_list(val: Any) -> TypeGuard[list]: ...  |  def is_positive(val: int) -> TypeIs[int]: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Write a predicate that returns TypeGuard[T]; mypy narrows the argument to T inside an if branch.
# STRENGTHS - Domain-aware narrowing that isinstance can't express on its own.
# WEAKNESSES- TypeGuard narrows ONLY on True; in the else branch the type is unchanged.
from typing import Any, TypeGuard

def is_string_list(val: list[Any]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def join(items: list[Any]) -> str:
    if is_string_list(items):
        return ", ".join(items)        # mypy: list[str]
    return "invalid"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Compose TypeGuards; one for shape, one for invariants; chain at the call site.
# STRENGTHS - Each predicate is independently testable; mypy narrows step by step.
# WEAKNESSES- The function body must actually validate; mypy trusts your True without verifying it.
from typing import Any, TypeGuard

def is_dict(val: Any) -> TypeGuard[dict[str, Any]]:
    return isinstance(val, dict) and all(isinstance(k, str) for k in val)

def is_config(val: Any) -> TypeGuard[dict[str, Any]]:
    return is_dict(val) and "version" in val and isinstance(val["version"], int)

# Use:
def load(raw: Any) -> int:
    if not is_config(raw):
        raise ValueError("not a config")
    return raw["version"]              # mypy: dict[str, Any] -> int (after raw["version"])

# TypeGuard on tuples / parametrized containers:
def is_int_pair(t: tuple[Any, ...]) -> TypeGuard[tuple[int, int]]:
    return len(t) == 2 and all(isinstance(x, int) for x in t)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Prefer TypeIs (3.13+) for symmetric narrowing; reach for Pydantic/msgspec at IO boundaries.
# STRENGTHS - TypeIs narrows BOTH branches; library-grade validators handle nested structures faster than handwritten guards.
# WEAKNESSES- A wrong-but-True predicate corrupts every downstream type. Test the predicate as carefully as the consumer.
from __future__ import annotations
from typing import Any, TypeGuard, TypeIs       # TypeIs requires Python 3.13+

# 1) TypeIs vs TypeGuard:
#    TypeGuard[T] -- narrows only on True. False branch keeps original type.
#    TypeIs[T]    -- narrows both branches (True -> T, False -> NOT T).
def is_str(x: object) -> TypeIs[str]:
    return isinstance(x, str)

def example(x: str | int) -> int:
    if is_str(x):
        return len(x)            # TypeIs: narrowed to str
    return x + 1                 # TypeIs: narrowed to int (TypeGuard would keep str|int here)

# 2) Predicate-as-API: the predicate IS the validator. Return errors via raises,
#    not via False, when caller will treat False as a hard error.
def is_email_addr(x: object) -> TypeIs[str]:
    if not isinstance(x, str):
        return False
    if "@" not in x or x.startswith(" ") or x.endswith(" "):
        return False
    return True

# 3) Bridge to runtime validators -- TypeIs predicate that delegates to Pydantic.
#    Now mypy AND Pydantic agree about the type.
try:
    from pydantic import BaseModel, ValidationError
    class Job(BaseModel):
        id: int
        name: str

    def is_job(x: object) -> TypeIs[Job]:
        if isinstance(x, Job):
            return True
        try: Job.model_validate(x); return False  # Pydantic returns a NEW instance; we'd
        except ValidationError: return False        # need to capture it -- see decision rule.
except ImportError:
    pass

# Decision rule:
#   "this value satisfies a constraint AND I want narrowing"      -> TypeIs (3.13+)
#   stuck on Python 3.12-                                          -> TypeGuard, accept asymmetric narrowing
#   nested JSON / wire types                                       -> Pydantic / msgspec / dataclasses-json
#                                                                    (don't reinvent recursive validation)
#   small leaf check (is_email, is_uuid, is_iso_date)              -> TypeIs predicate
#   need narrowing AND a parsed object                             -> validator that RETURNS the typed value;
#                                                                    TypeIs only narrows the input
#
# Anti-pattern: TypeGuard predicate whose body says 'return True' unconditionally.
# mypy will obediently narrow. Production will deserialize garbage as your type
# and the bug surfaces three layers downstream where the trail is cold.
```

## Decision Rule

```text
"this value satisfies a constraint AND I want narrowing"      -> TypeIs (3.13+)
stuck on Python 3.12-                                          -> TypeGuard, accept asymmetric narrowing
nested JSON / wire types                                       -> Pydantic / msgspec / dataclasses-json
                                                                 (don't reinvent recursive validation)
small leaf check (is_email, is_uuid, is_iso_date)              -> TypeIs predicate
need narrowing AND a parsed object                             -> validator that RETURNS the typed value;
                                                                 TypeIs only narrows the input
```

## Anti-Pattern

> [!warning] Anti-pattern
> TypeGuard predicate whose body says 'return True' unconditionally.
> mypy will obediently narrow. Production will deserialize garbage as your type
> and the bug surfaces three layers downstream where the trail is cold.

## Tips

- TypeGuard enables custom domain checks — use for parsing, validation, and invariants mypy can't infer.
- TypeGuard requires a return value of True — the function must return bool and the type checker trusts it on True.
- TypeIs (Python 3.13+) supersedes TypeGuard for most uses — it narrows BOTH the True and False branches, so the else branch sees `NOT T` instead of the original type. Prefer it where available.
- Combine TypeGuard with isinstance for powerful, self-documenting type refinement.

## Common Mistake

> [!warning] Assuming TypeGuard works without isinstance checks inside — TypeGuard only narrows on True returns. The function body must actually validate the type constraint.

## Shorthand (Junior → Senior)

**Junior:**
```python
def validate(items):
    if not all(isinstance(x, str) for x in items):
        return None
    # items is list[str] here (no type hint though)
    return ", ".join(items)
```

**Senior:**
```python
def is_string_list(val: list[Any]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def validate(items: list[Any]) -> str | None:
    if is_string_list(items):
        return ", ".join(items)
    return None
```

## See Also

- [[Sections/typing/type-narrowing/isinstance-narrowing|isinstance & issubclass Narrowing — Union Type Refinement (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/assert-never|assert_never & Never — Exhaustive Type Checking (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/_Index|Type Hints & mypy → Type Narrowing & Guards]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

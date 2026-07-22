---
type: "entry"
domain: "python"
file: "typing"
section: "advanced-generics"
id: "paramspec"
title: "ParamSpec & Concatenate — Typing Higher-Order Functions"
category: "Advanced Generics"
subtitle: "ParamSpec, Concatenate, P.args, P.kwargs, preserve signatures"
signature_short: "P = ParamSpec(\"P\")  |  def decorate[P, R](f: Callable[P, R]) -> Callable[P, R]  |  Concatenate[int, P]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ParamSpec & Concatenate — Typing Higher-Order Functions"
  - "paramspec"
tags:
  - "python"
  - "python/typing"
  - "python/typing/advanced-generics"
  - "category/advanced-generics"
  - "tier/tiered"
---

# ParamSpec & Concatenate — Typing Higher-Order Functions

> ParamSpec, Concatenate, P.args, P.kwargs, preserve signatures

## Overview

ParamSpec preserves function signatures through decorators and higher-order functions. Without it, decorators erase parameter types (become *args, **kwargs). P.args and P.kwargs unpack the signature. Concatenate prepends additional parameters. Essential for typed decorators, logging wrappers, and middleware.

## Signature

```python
P = ParamSpec("P")  |  def decorate[P, R](f: Callable[P, R]) -> Callable[P, R]  |  Concatenate[int, P]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ParamSpec captures the wrapped function's whole signature so the decorator does not erase it.
# STRENGTHS - Wrapped functions still autocomplete and type-check with their real parameters.
# WEAKNESSES- Without ParamSpec, the decorator returns Callable[..., R] and you lose all typing downstream.
from collections.abc import Callable
from typing import ParamSpec, TypeVar
import functools

P = ParamSpec("P")
R = TypeVar("R")

def log_calls(fn: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"call {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@log_calls
def add(a: int, b: int) -> int:
    return a + b

n: int = add(1, 2)        # mypy: still (int, int) -> int
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Concatenate prepends parameters; pair with ParamSpec to strip OR add args while typing the result.
# STRENGTHS - Inject context (db session, request, user) as first arg without poisoning callers' signatures.
# WEAKNESSES- Concatenate consumes positional args only; **kwargs-style injection can't be expressed this way.
from collections.abc import Callable
from typing import ParamSpec, TypeVar, Concatenate
import functools

P = ParamSpec("P")
R = TypeVar("R")

# Strip the first param from the visible signature -- inject it inside the wrapper.
def with_db(fn: Callable[Concatenate[str, P], R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        db = "postgres://..."           # acquire from context
        return fn(db, *args, **kwargs)
    return wrapper

@with_db
def fetch(db: str, user_id: int) -> str:
    return f"{db}:user:{user_id}"

# Caller no longer passes db -- mypy sees fetch(user_id: int) -> str
print(fetch(42))

# Add a parameter the inner function never sees:
def with_attempt(fn: Callable[P, R]) -> Callable[Concatenate[int, P], R]:
    @functools.wraps(fn)
    def wrapper(attempt: int, *args: P.args, **kwargs: P.kwargs) -> R:
        print(f"attempt {attempt}")
        return fn(*args, **kwargs)
    return wrapper
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - ParamSpec for sync+async pairs, Concatenate for context injection, overloads for sync-vs-async branching.
# STRENGTHS - Decorators that survive type-strict CI; lossless wrappers for retries, tracing, request middleware.
# WEAKNESSES- ParamSpec cannot describe "added a NEW kwarg"; if the wrapper grows kwargs the inner can't see, you must overload.
from __future__ import annotations
import asyncio
import functools
import inspect
from collections.abc import Awaitable, Callable
from typing import ParamSpec, TypeVar, Concatenate, overload, cast

P = ParamSpec("P")
R = TypeVar("R")

# 1) Retry that accepts BOTH sync and async; type stays exact via overloads.
@overload
def retry(fn: Callable[P, Awaitable[R]]) -> Callable[P, Awaitable[R]]: ...
@overload
def retry(fn: Callable[P, R])             -> Callable[P, R]: ...
def retry(fn):
    if inspect.iscoroutinefunction(fn):
        @functools.wraps(fn)
        async def aw(*args, **kwargs):
            for i in range(3):
                try: return await fn(*args, **kwargs)
                except Exception:
                    if i == 2: raise
                    await asyncio.sleep(2 ** i)
        return aw
    @functools.wraps(fn)
    def sw(*args, **kwargs):
        for i in range(3):
            try: return fn(*args, **kwargs)
            except Exception:
                if i == 2: raise
        raise RuntimeError("unreachable")
    return sw

# 2) Strict middleware that injects a request context. The OUTER signature is
#    P (no ctx). The INNER is Concatenate[Ctx, P]. Both are honored by mypy.
class Ctx:
    user: str
    request_id: str

def with_ctx(fn: Callable[Concatenate[Ctx, P], R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        ctx = Ctx()
        return fn(ctx, *args, **kwargs)
    return wrapper

@retry
@with_ctx
def handle(ctx: Ctx, payload: dict[str, str]) -> int:
    return len(payload)

# Decision rule:
#   decorator that doesn't change signature      -> ParamSpec + TypeVar (the canonical pair)
#   decorator that injects/strips a positional   -> Concatenate[X, P]
#   decorator that adds a NEW keyword            -> @overload to expose the wrapper's true signature
#   sync + async behind one decorator            -> @overload + iscoroutinefunction dispatch
#   factory decorator (decorator with options)   -> wrap the whole thing in a Callable[..., Callable[P, R]]
#                                                    return type; ParamSpec scopes per inner function
#
# Anti-pattern: typing a decorator as Callable[..., R] -> Callable[..., R].
# Both '...' are independent Anys -- mypy stops checking the wrapped function
# entirely, autocomplete dies, and bugs sneak in through kwargs typos.
```

## Decision Rule

```text
decorator that doesn't change signature      -> ParamSpec + TypeVar (the canonical pair)
decorator that injects/strips a positional   -> Concatenate[X, P]
decorator that adds a NEW keyword            -> @overload to expose the wrapper's true signature
sync + async behind one decorator            -> @overload + iscoroutinefunction dispatch
factory decorator (decorator with options)   -> wrap the whole thing in a Callable[..., Callable[P, R]]
                                                 return type; ParamSpec scopes per inner function
```

## Anti-Pattern

> [!warning] Anti-pattern
> typing a decorator as Callable[..., R] -> Callable[..., R].
> Both '...' are independent Anys -- mypy stops checking the wrapped function
> entirely, autocomplete dies, and bugs sneak in through kwargs typos.

## Tips

- ParamSpec is critical for typed decorators — without it, mypy loses all parameter and return type information.
- Always use @functools.wraps in decorators — it preserves the original function's metadata.
- Modern mypy/pyright infer the wrapper type without a final `cast(Callable[P, R], wrapper)` — leave it out unless your type checker actually complains.
- Concatenate prepends to ParamSpec — useful for dependency injection and context wrappers.

## Common Mistake

> [!warning] Using Callable[..., R] in decorators instead of ParamSpec — [...] loses type information. Use ParamSpec to preserve the exact signature.

## Shorthand (Junior → Senior)

**Junior:**
```python
def with_logging(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
```

**Senior:**
```python
P = ParamSpec("P")
R = TypeVar("R")

def with_logging(func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return cast(Callable[P, R], wrapper)
```

## See Also

- [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/_Index|Type Hints & mypy → Advanced Generics]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

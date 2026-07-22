---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "builtin-debugging"
id: "inspect-introspection"
title: "inspect — programmatic signature introspection"
category: "Introspection"
subtitle: "inspect.signature, Parameter.kind, Signature.bind, get_type_hints, Annotated, getsource, currentframe"
signature_short: "sig = inspect.signature(fn); for p in sig.parameters.values(): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "inspect — programmatic signature introspection"
  - "inspect-introspection"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/builtin-debugging"
  - "category/introspection"
  - "tier/tiered"
---

# inspect — programmatic signature introspection

> inspect.signature, Parameter.kind, Signature.bind, get_type_hints, Annotated, getsource, currentframe

## Overview

When you need to know "what does this function take and return?" at runtime, `inspect.signature()` is the tool. It powers Typer/Click decorators that read your function and build the CLI, dependency-injection containers that resolve parameters by type, validation libraries that bind arguments, and any decorator that needs to forward calls correctly. The three examples solve the SAME concrete task — given a target function, build a small wrapper that prints its parameters and validates a call — at three depths: read parameters → handle all four `Parameter.kind` cases + `bind()` → resolve `Annotated` metadata + `get_type_hints()` for the kind of code Typer/FastAPI/Pydantic generate from.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Given a function, print its parameter names and validate a call.
- **Junior** — SAME — but handle ALL parameter kinds and produce a useful usage string (positional-only, varargs, keyword-only, **kwargs).
- **Senior** — SAME — build the kind of introspection layer Typer/FastAPI use: resolve PEP 604 / 695 / 612 type hints, read Annotated metadata, support classes (introspect __init__), and emit a validation that converts strings to typed values.

## Signature

```python
sig = inspect.signature(fn); for p in sig.parameters.values(): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Given a function, print its parameter names and validate a call.
# APPROACH  - inspect.signature(fn).parameters is an OrderedDict of name->Parameter.
# STRENGTHS- Reads what's actually defined, not what was documented.
# WEAKNESSES- Ignores parameter kinds (positional-only, *args, **kwargs).
import inspect

def greet(name: str, age: int = 18, formal: bool = False) -> str:
    return f"{'Mr.' if formal else 'Hi'} {name}, {age}"

sig = inspect.signature(greet)
print(sig)                                            # (name: str, age: int = 18, formal: bool = False) -> str

for name, param in sig.parameters.items():
    print(f"  {name}: type={param.annotation}, default={param.default}")

# Validate: would this call succeed?
try:
    sig.bind("Alice", age=30)                         # raises TypeError if invalid
    print("call is valid")
except TypeError as e:
    print(f"invalid: {e}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but handle ALL parameter kinds and produce a useful
#             usage string (positional-only, varargs, keyword-only, **kwargs).
# APPROACH  - Walk param.kind through the four enum cases; format each
#             differently. bind_partial lets you check optional args.
# STRENGTHS- Works on every signature, including weird ones (positional-only
#             after the / divider, keyword-only after *).
# WEAKNESSES- Annotations come back as strings on PEP 563 (from __future__
#             import annotations); use get_type_hints() to resolve them.
import inspect
from inspect import Parameter

def odd(a, b, /, c, d=10, *args, e, f=20, **kwargs) -> int:
    return 0

KIND_FORMAT = {
    Parameter.POSITIONAL_ONLY:        "{name}",                # before / divider
    Parameter.POSITIONAL_OR_KEYWORD:  "{name}",
    Parameter.VAR_POSITIONAL:         "*{name}",
    Parameter.KEYWORD_ONLY:           "{name}",                 # after * divider
    Parameter.VAR_KEYWORD:            "**{name}",
}

def usage(fn) -> str:
    sig = inspect.signature(fn)
    parts = []
    seen_var_pos = False
    for p in sig.parameters.values():
        s = KIND_FORMAT[p.kind].format(name=p.name)
        if p.default is not Parameter.empty:
            s = f"[{s}={p.default!r}]"
        if p.kind == Parameter.KEYWORD_ONLY and not seen_var_pos:
            parts.append("*")                          # the divider
            seen_var_pos = True
        if p.kind == Parameter.VAR_POSITIONAL:
            seen_var_pos = True
        parts.append(s)
    return f"{fn.__name__}({', '.join(parts)})"

print(usage(odd))                                     # odd(a, b, c, [d=10], *args, e, [f=20], **kwargs)

# Validation that respects partial calls (some args coming later).
def validate(fn, *args, **kwargs):
    sig = inspect.signature(fn)
    try:
        bound = sig.bind_partial(*args, **kwargs)
        bound.apply_defaults()
        return bound.arguments
    except TypeError as e:
        raise ValueError(f"{fn.__name__}: {e}")

print(validate(odd, 1, 2, 3, e=99))                   # {'a':1,'b':2,'c':3,'d':10,'e':99,'f':20}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — build the kind of introspection layer Typer/FastAPI
#             use: resolve PEP 604 / 695 / 612 type hints, read Annotated
#             metadata, support classes (introspect __init__), and emit
#             a validation that converts strings to typed values.
# APPROACH  - typing.get_type_hints(include_extras=True) resolves stringified
#             annotations and keeps Annotated[T, ...] metadata intact.
#             For classes, signature(cls) reads __init__ automatically.
#             For Annotated, walk __metadata__ for validators/converters.
# STRENGTHS- Same shape as production frameworks; integrates with Pydantic,
#             dataclasses, attrs; resolves forward references.
# WEAKNESSES- typing module shifts each release; review behavior on Python
#             upgrades. PEP 695 generics need 3.12+.
from __future__ import annotations
import inspect
from dataclasses import dataclass
from typing import Annotated, get_type_hints, get_args, get_origin
from typing import Any, Callable

# 1) Annotated-aware metadata: validators piggy-back on the type hint.
@dataclass
class Range:
    lo: int
    hi: int
    def check(self, v: int) -> int:
        if not (self.lo <= v <= self.hi):
            raise ValueError(f"{v} not in [{self.lo},{self.hi}]")
        return v

# 2) The function under introspection.
def schedule(
    user_id: int,
    delay: Annotated[int, Range(0, 3600)] = 60,
    tag: str | None = None,
) -> str:
    return f"scheduled {user_id} in {delay}s as {tag}"

# 3) Build a typed wrapper that converts strings (e.g., from a CLI) and
#    runs Annotated validators.
def make_typed_caller(fn: Callable) -> Callable[[dict[str, str]], Any]:
    sig = inspect.signature(fn)
    hints = get_type_hints(fn, include_extras=True)   # keep Annotated metadata

    def call_with_strings(raw: dict[str, str]) -> Any:
        kwargs: dict[str, Any] = {}
        for name, param in sig.parameters.items():
            if name not in raw and param.default is inspect.Parameter.empty:
                raise TypeError(f"missing required arg {name!r}")
            if name not in raw:
                continue
            hint = hints.get(name, param.annotation)
            value: Any = raw[name]
            origin, args = get_origin(hint), get_args(hint)
            # Annotated[T, *meta] -> unwrap the inner type, collect validators.
            validators = []
            if origin is Annotated.__origin__ if hasattr(Annotated, "__origin__") else False:
                pass
            if get_origin(hint) is None and hasattr(hint, "__metadata__"):
                inner_type = hint.__origin__
                validators = list(hint.__metadata__)
                hint = inner_type
            # Convert string to int/float/bool if needed.
            if hint is int:    value = int(value)
            elif hint is float: value = float(value)
            elif hint is bool:  value = value.lower() in ("1", "true", "yes")
            # Run Annotated validators.
            for v in validators:
                if hasattr(v, "check"):
                    value = v.check(value)
            kwargs[name] = value
        bound = sig.bind(**kwargs)
        bound.apply_defaults()
        return fn(*bound.args, **bound.kwargs)

    return call_with_strings

call = make_typed_caller(schedule)
print(call({"user_id": "42", "delay": "120", "tag": "promo"}))
# call({"user_id": "42", "delay": "9999"})            # raises Range check

# 4) Same machinery on a class — signature(cls) reads __init__.
class Job:
    def __init__(self, name: str, retries: int = 3) -> None: ...

print(inspect.signature(Job))                         # (name: str, retries: int = 3)

# Decision rule:
#   read function args at runtime         -> inspect.signature(fn).parameters
#   need resolved type hints              -> typing.get_type_hints(fn) — handles 'from __future__'
#   need Annotated metadata               -> get_type_hints(fn, include_extras=True)
#   read class constructor                -> inspect.signature(cls) — proxies __init__
#   forward calls in a decorator          -> sig.bind(*a, **kw) + apply_defaults
#   build a CLI from a function           -> walk Parameter.kind + use Annotated for help
#   need source code                      -> inspect.getsource(fn) — needs file on disk
#   walk caller's locals                  -> inspect.currentframe().f_back.f_locals  (debug only)
#   asyncio: is this a coroutine?          -> inspect.iscoroutinefunction(fn)
#   is this a method on a class?           -> inspect.ismethod / isfunction / ismethoddescriptor
#
# Anti-pattern: reading __annotations__ directly instead of using
# get_type_hints(). Under 'from __future__ import annotations' or PEP 695
# generics, __annotations__ contains string names — you'll think the type
# is the string "int" instead of the int class. get_type_hints() resolves
# the names against the function's globals and locals; that's the only
# correct way to read modern type hints.
```

## Decision Rule

```text
read function args at runtime         -> inspect.signature(fn).parameters
need resolved type hints              -> typing.get_type_hints(fn) — handles 'from __future__'
need Annotated metadata               -> get_type_hints(fn, include_extras=True)
read class constructor                -> inspect.signature(cls) — proxies __init__
forward calls in a decorator          -> sig.bind(*a, **kw) + apply_defaults
build a CLI from a function           -> walk Parameter.kind + use Annotated for help
need source code                      -> inspect.getsource(fn) — needs file on disk
walk caller's locals                  -> inspect.currentframe().f_back.f_locals  (debug only)
asyncio: is this a coroutine?          -> inspect.iscoroutinefunction(fn)
is this a method on a class?           -> inspect.ismethod / isfunction / ismethoddescriptor
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading __annotations__ directly instead of using
> get_type_hints(). Under 'from __future__ import annotations' or PEP 695
> generics, __annotations__ contains string names — you'll think the type
> is the string "int" instead of the int class. get_type_hints() resolves
> the names against the function's globals and locals; that's the only
> correct way to read modern type hints.

## Tips

- `inspect.signature()` works on functions, methods, classes (proxies `__init__`), and most callables. Always start there before reaching for `__annotations__` directly.
- `Parameter.kind` enumerates the four positions: `POSITIONAL_ONLY` (before `/`), `POSITIONAL_OR_KEYWORD` (default), `VAR_POSITIONAL` (`*args`), `KEYWORD_ONLY` (after `*`), `VAR_KEYWORD` (`**kwargs`). Walk it to handle weird signatures.
- Use `typing.get_type_hints(fn)` rather than `fn.__annotations__` — it resolves stringified annotations under PEP 563 (`from __future__ import annotations`) into actual classes.
- `get_type_hints(fn, include_extras=True)` keeps `Annotated[T, *metadata]` metadata. Without it, `Annotated[int, Range(0,10)]` is reduced to `int` and your validators vanish.
- `Signature.bind()` raises `TypeError` if the call would fail — perfect for "validate before queueing this work". `bind_partial()` allows missing args (pair with `apply_defaults()`).
- For decorator factories, prefer `functools.wraps` to copy metadata; if you need to MODIFY the signature (add/remove an arg), use `inspect.signature(fn).replace(parameters=...)` and assign to `wrapper.__signature__`.

## Common Mistake

> [!warning] Reading `fn.__annotations__` directly to get type info. Under `from __future__ import annotations` (default in many modern projects) and PEP 695 generics, `__annotations__` contains strings, not classes — so `__annotations__["x"] == "int"`, not `int`. Use `typing.get_type_hints(fn)` which resolves strings against the function's globals/locals.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Wrong on PEP 563 / 695 — annotation may be the string "int"
hints = fn.__annotations__
```

**Senior:**
```python
# Always-correct: resolves strings to real classes
from typing import get_type_hints
hints = get_type_hints(fn, include_extras=True)
```

## See Also

- [[Sections/debugging-profiling/builtin-debugging/_Index|Debugging & Profiling → Built-in Debugging — pdb, traceback, faulthandler, inspect]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]

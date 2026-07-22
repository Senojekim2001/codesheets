---
type: "entry"
domain: "python"
file: "advanced"
section: "decorators"
id: "function-decorators"
title: "Function Decorators — Wrapping & Enhancing Functions"
category: "Decorators"
subtitle: "@decorator syntax, functools.wraps, parameterized decorators"
signature_short: "@decorator  |  @decorator(args)  |  functools.wraps(fn)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Function Decorators — Wrapping & Enhancing Functions"
  - "function-decorators"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/decorators"
  - "category/decorators"
  - "tier/tiered"
---

# Function Decorators — Wrapping & Enhancing Functions

> @decorator syntax, functools.wraps, parameterized decorators

## Overview

Decorators wrap functions to add behavior: logging, caching, access control, retry logic, input validation. A decorator is a function that takes a function and returns a new function. @functools.wraps preserves the original function's name and docstring. Parameterized decorators (decorators with arguments) require an extra nesting level. Stack multiple decorators — they apply bottom-up.

## Signature

```python
@decorator  |  @decorator(args)  |  functools.wraps(fn)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Wrap a function to add behavior; preserve metadata with @wraps
# STRENGTHS - The minimum-shape decorator with the ONE thing you mustn't forget
# WEAKNESSES- No parameters, no class form, no stacking
#
import functools

def shout(fn):
    @functools.wraps(fn)                           # preserves __name__, __doc__
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()
    return wrapper

@shout
def greet(name): return f"hello, {name}"

print(greet("alice"))                              # "HELLO, ALICE"
print(greet.__name__)                              # "greet"  (not "wrapper")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Parameterized decorators, lru_cache, decorator stacking
# STRENGTHS - The 80%-case patterns: timing, retry, memoization
# WEAKNESSES- No class-based decorator; no async
#
import functools
import time

# 1) Parameterized decorator — three nested layers (args -> decorator -> wrapper)
def retry(max_attempts: int = 3, delay: float = 0.5):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if attempt == max_attempts:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

# 2) Built-in memoization — pure functions only
@functools.lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# 3) Stacking — applied BOTTOM-UP (closest to def runs first)
def timer(fn):
    @functools.wraps(fn)
    def w(*a, **kw):
        t = time.perf_counter()
        try:    return fn(*a, **kw)
        finally: print(f"{fn.__name__}: {(time.perf_counter()-t)*1000:.1f}ms")
    return w

@timer                       # timer wraps the (already-retried) function
@retry(max_attempts=3)       # retry wraps fetch first
def fetch(url): return {}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Class decorators for state, async-aware decorators, type preservation
# STRENGTHS - The patterns that scale beyond toy examples
# WEAKNESSES- N/A
#
import asyncio
import functools
import inspect
import time
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

# 1) Type-preserving generic decorator — IDE / mypy keep the signature
def timed(fn: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        t = time.perf_counter()
        try:    return fn(*args, **kwargs)
        finally: print(f"{fn.__name__}: {(time.perf_counter()-t)*1000:.1f}ms")
    return wrapper

# 2) Class decorator — state across calls (counter, registry, throttle)
class CountCalls:
    def __init__(self, fn):
        functools.update_wrapper(self, fn)         # MUST: copies __name__ etc onto self
        self.fn, self.count = fn, 0
    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.fn(*args, **kwargs)

@CountCalls
def hit(): return 1
hit(); hit(); print(hit.count)                      # 3

# 3) Async-aware decorator — handle BOTH sync and async transparently
def log_calls(fn):
    if inspect.iscoroutinefunction(fn):
        @functools.wraps(fn)
        async def aw(*a, **kw):
            print(f"-> {fn.__name__}")
            try:    return await fn(*a, **kw)
            finally: print(f"<- {fn.__name__}")
        return aw
    @functools.wraps(fn)
    def w(*a, **kw):
        print(f"-> {fn.__name__}")
        try:    return fn(*a, **kw)
        finally: print(f"<- {fn.__name__}")
    return w

# 4) Decorator that ACCEPTS BOTH @dec and @dec(arg) forms
def flexible(arg=None):
    if callable(arg):                               # used as @flexible (no args)
        return _impl(arg)
    def actual(fn): return _impl(fn, arg)           # @flexible(arg)
    return actual

def _impl(fn, arg=None):
    @functools.wraps(fn)
    def w(*a, **kw):
        # use arg if set, otherwise default behavior
        return fn(*a, **kw)
    return w

# Decision rule:
#   add cross-cutting behavior to N functions -> simple @wraps decorator
#   need to share state across calls            -> class decorator (__call__)
#   need configuration                            -> parameterized (3-level nest)
#   keep precise types for users                  -> ParamSpec + TypeVar (3.10+)
#   wrapping ASYNC functions                       -> branch on inspect.iscoroutinefunction
#   memoization                                    -> functools.lru_cache, NOT hand-rolled
#
# Anti-pattern: forgetting @functools.wraps
#   Tracebacks point at "wrapper", introspection breaks (Sphinx docs, pydantic
#   schemas, FastAPI routes lose their identity). ALWAYS @functools.wraps(fn).
```

## Decision Rule

```text
add cross-cutting behavior to N functions -> simple @wraps decorator
need to share state across calls            -> class decorator (__call__)
need configuration                            -> parameterized (3-level nest)
keep precise types for users                  -> ParamSpec + TypeVar (3.10+)
wrapping ASYNC functions                       -> branch on inspect.iscoroutinefunction
memoization                                    -> functools.lru_cache, NOT hand-rolled
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting @functools.wraps
>   Tracebacks point at "wrapper", introspection breaks (Sphinx docs, pydantic
>   schemas, FastAPI routes lose their identity). ALWAYS @functools.wraps(fn).

## Tips

- Always use @functools.wraps — without it, the wrapped function loses its __name__, __doc__, and __module__.
- @functools.lru_cache is a built-in memoization decorator — use it for expensive pure functions.
- Stacked decorators apply bottom-up: @A @B @C def f → A(B(C(f))). The bottom one wraps first.
- Use ParamSpec + TypeVar (3.10+) so the wrapper preserves the wrapped function's signature for IDEs and mypy. For decorators that wrap both sync and async functions, branch on `inspect.iscoroutinefunction(fn)` and return the matching wrapper.

## Common Mistake

> [!warning] Forgetting @functools.wraps — debugging becomes a nightmare because stack traces show "wrapper" instead of the actual function name. Always wrap.

## Shorthand (Junior → Senior)

**Junior:**
```python
def timer(fn):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{fn.__name__} took {elapsed:.4f}s")
        return result
    return wrapper
```

**Senior:**
```python
@functools.wraps(fn)
def timer(fn: Callable) -> Callable:
    def wrapper(*args, **kwargs):
        start, result = time.perf_counter(), fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper
```

## See Also

- [[Sections/advanced/decorators/class-decorators|Class Decorators & Descriptor Protocol (Advanced Python)]]
- [[Sections/advanced/decorators/_Index|Advanced Python → Decorators]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "decorators"
title: "Decorators"
category: "Functions"
subtitle: "@syntax wraps a function — always use @functools.wraps inside"
signature_short: "@decorator | def outer(fn): def wrapper(*a,**kw): return fn(*a,**kw)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Decorators"
  - "decorators"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# Decorators

> @syntax wraps a function — always use @functools.wraps inside

## Overview

A decorator is a function that takes a function and returns a function. The @ syntax is shorthand for fn = decorator(fn). Always use @functools.wraps(fn) inside your wrapper to preserve the original function's __name__ and __doc__.

## Signature

```python
@decorator | def outer(fn): def wrapper(*a,**kw): return fn(*a,**kw)
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
import functools

# GOAL: add behaviour before/after a function without changing its body
def shout(fn):
    @functools.wraps(fn)          # WHY: preserves fn.__name__ and fn.__doc__
    def wrapper(*args, **kwargs):
        print("Before!")
        result = fn(*args, **kwargs)
        print("After!")
        return result
    return wrapper

@shout
def greet(name):
    print(f"Hello, {name}")

greet("Alice")
# → Before!  Hello, Alice  After!
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
import functools, time

# GOAL: time any function with a reusable decorator
def timer(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = fn(*args, **kwargs)
        # WHY: fn.__name__ works here because of @functools.wraps above
        print(f"{fn.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_task():
    time.sleep(0.1)

slow_task()  # → slow_task took 0.1001s
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
import functools

# GOAL: decorator with arguments — needs an extra nesting layer
def retry(times=3, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt == times - 1:
                        raise          # re-raise after final attempt
        return wrapper
    return decorator

@retry(times=5, exceptions=(ConnectionError,))
def fetch_data():
    return "ok"

# NOTE: stacked decorators apply bottom-up
# @timer @retry(3) def fn — retry is applied first, then timer wraps the result
#
# Decision rule:
#   cross-cutting concern (logging/timing/auth) -> decorator
#   need state across calls (counter, cache)    -> class-based decorator OR functools.lru_cache
#   need parameters at decoration time          -> 3-level nested factory(args)(fn)(...)
#   memoize pure function                       -> @functools.lru_cache / @cache (3.9+)
#   register handler with framework             -> framework decorator (@app.route, @pytest.fixture)
#   add behavior to a class                     -> @classmethod / @staticmethod / @property / class decorator
#   one-off temporary wrapping                   -> just call fn explicitly (no decorator)
#   need to preserve sig + docstring            -> @functools.wraps(fn) inside wrapper (always)
#
# Anti-pattern: writing a decorator without @functools.wraps(fn).
#   The wrapped callable now reports the wrapper's __name__, __doc__, and signature; help(),
#   pytest fixtures, FastAPI/Click that introspect signatures, and stack traces all degrade.
#   Always add `@functools.wraps(fn)` on the inner wrapper. For decorators that need to
#   modify the signature, use functools.wraps + inspect.signature manipulation.
```

## Decision Rule

```text
cross-cutting concern (logging/timing/auth) -> decorator
need state across calls (counter, cache)    -> class-based decorator OR functools.lru_cache
need parameters at decoration time          -> 3-level nested factory(args)(fn)(...)
memoize pure function                       -> @functools.lru_cache / @cache (3.9+)
register handler with framework             -> framework decorator (@app.route, @pytest.fixture)
add behavior to a class                     -> @classmethod / @staticmethod / @property / class decorator
one-off temporary wrapping                   -> just call fn explicitly (no decorator)
need to preserve sig + docstring            -> @functools.wraps(fn) inside wrapper (always)
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing a decorator without @functools.wraps(fn).
>   The wrapped callable now reports the wrapper's __name__, __doc__, and signature; help(),
>   pytest fixtures, FastAPI/Click that introspect signatures, and stack traces all degrade.
>   Always add `@functools.wraps(fn)` on the inner wrapper. For decorators that need to
>   modify the signature, use functools.wraps + inspect.signature manipulation.

## Tips

- Always `@functools.wraps(fn)` inside your decorator — without it `fn.__name__` and `fn.__doc__` are replaced
- Decorators with arguments need three levels: outer factory → decorator → wrapper
- Stack order matters: `@a @b def fn` applies `b` first, then `a` — bottom-up
- Class-based decorators (implementing `__call__`) work well when the decorator needs state

## Common Mistake

> [!warning] Forgetting `@functools.wraps(fn)`. Without it, `help()`, `inspect`, and debugging tools show the wrapper's metadata instead of the original function's.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

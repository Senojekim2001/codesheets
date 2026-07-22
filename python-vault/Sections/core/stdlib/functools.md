---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "functools"
title: "functools"
category: "Standard Library"
subtitle: "lru_cache, partial, reduce, wraps, total_ordering"
signature_short: "@lru_cache(maxsize=128) | partial(fn, *args) | reduce(fn, it)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "functools"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# functools

> lru_cache, partial, reduce, wraps, total_ordering

## Overview

functools provides tools for working with higher-order functions. lru_cache memoizes results — one of the easiest performance wins in Python. partial() fixes arguments. total_ordering generates comparison methods from just two.

## Signature

```python
@lru_cache(maxsize=128) | partial(fn, *args) | reduce(fn, it)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @cache to memoize, partial to fix args, reduce to fold.
# STRENGTHS - One decorator turns recursive code from "slow" to "instant".
# WEAKNESSES- @cache holds references forever — wrong tool for instance methods.
import functools

@functools.cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

fib(100)                                       # instant
print(fib.cache_info())                        # hits / misses

square = functools.partial(pow, exp=2)         # exp arg fixed
square(5)                                      # 25

functools.reduce(lambda a, b: a + b, [1, 2, 3, 4])   # 10
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - @lru_cache(maxsize=N) to bound memory, @cached_property for one-shot instance work, total_ordering for sortable classes, @wraps in every decorator.
# STRENGTHS - Memory-bounded memoization; instance-level caching that GC can collect.
# WEAKNESSES- @lru_cache on a method with self keeps every instance alive — leaks memory in long-running programs.
import functools

@functools.lru_cache(maxsize=256)              # bounded; LRU eviction
def expensive(x: int) -> int:
    return sum(i * i for i in range(x))

class User:
    def __init__(self, name: str): self.name = name
    @functools.cached_property                  # cached on the INSTANCE; GC-safe
    def signature(self) -> str:
        import hashlib
        return hashlib.sha256(self.name.encode()).hexdigest()

@functools.total_ordering                       # __eq__ + one of __lt__/__gt__ -> all 6
class Version:
    def __init__(self, major, minor):
        self.major, self.minor = major, minor
    def __eq__(self, o): return (self.major, self.minor) == (o.major, o.minor)
    def __lt__(self, o): return (self.major, self.minor) <  (o.major, o.minor)

# Decorator hygiene -- ALWAYS @wraps:
def trace(fn):
    @functools.wraps(fn)
    def wrapper(*a, **kw): return fn(*a, **kw)
    return wrapper
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - functools.singledispatch for type-based polymorphism; reduce sparingly (sum/min/max/| | exist); cmp_to_key for legacy comparators; partialmethod for class-bound partials.
# STRENGTHS - Pythonic alternative to isinstance ladders; clean fallback to a generic implementation.
# WEAKNESSES- singledispatch dispatches on the FIRST argument's runtime type only — multi-arg dispatch needs a third-party lib (multipledispatch) or manual.
from __future__ import annotations
import functools
from collections.abc import Iterable

@functools.singledispatch
def render(value, /) -> str:
    return repr(value)                         # generic fallback

@render.register
def _(value: list) -> str:
    return "[" + ", ".join(render(x) for x in value) + "]"

@render.register
def _(value: dict) -> str:
    return "{" + ", ".join(f"{k}: {render(v)}" for k, v in value.items()) + "}"

# functools.reduce — only when no built-in does it. Python idioms first:
sum([1, 2, 3])                                  # NOT reduce(operator.add, ...)
max([3, 1, 4, 1, 5])                            # NOT reduce(max, ...)
# Legitimate reduce: combine many sets/dicts:
import operator
union = functools.reduce(operator.or_, [{1, 2}, {2, 3}, {3, 4}], set())

# cmp_to_key — bridge legacy compare-functions to sorted(key=...).
def by_version(a: str, b: str) -> int:
    return -1 if tuple(map(int, a.split("."))) < tuple(map(int, b.split("."))) else 1
sorted(["1.10", "1.2", "1.9"], key=functools.cmp_to_key(by_version))

# Decision rule:
#   memoize a pure function                  -> @functools.cache (or @lru_cache(maxsize=N) to bound memory)
#   memoize on the instance (one-shot)        -> @functools.cached_property
#   memoize an instance method                -> NOT @lru_cache (keeps self alive). Roll your own with WeakValueDictionary OR put state on the instance.
#   "this class needs all comparison ops"     -> @functools.total_ordering + __eq__ + __lt__
#   type-based dispatch                       -> @functools.singledispatch / singledispatchmethod
#   bind some args of a function              -> functools.partial (functools.partialmethod for classes)
#   write a decorator                         -> @functools.wraps(fn) on the wrapper, ALWAYS
#   bridge a 3-way compare(a,b)              -> functools.cmp_to_key
#
# Anti-pattern: @functools.lru_cache on an instance method. The cache key
# includes self, so every cached call holds a strong reference to the
# instance — the instance can never be GC'd while the cache lives. Use
# @cached_property for instance-scoped caches; reserve lru_cache for module-
# level functions.
```

## Decision Rule

```text
memoize a pure function                  -> @functools.cache (or @lru_cache(maxsize=N) to bound memory)
memoize on the instance (one-shot)        -> @functools.cached_property
memoize an instance method                -> NOT @lru_cache (keeps self alive). Roll your own with WeakValueDictionary OR put state on the instance.
"this class needs all comparison ops"     -> @functools.total_ordering + __eq__ + __lt__
type-based dispatch                       -> @functools.singledispatch / singledispatchmethod
bind some args of a function              -> functools.partial (functools.partialmethod for classes)
write a decorator                         -> @functools.wraps(fn) on the wrapper, ALWAYS
bridge a 3-way compare(a,b)              -> functools.cmp_to_key
```

## Anti-Pattern

> [!warning] Anti-pattern
> @functools.lru_cache on an instance method. The cache key
> includes self, so every cached call holds a strong reference to the
> instance — the instance can never be GC'd while the cache lives. Use
> @cached_property for instance-scoped caches; reserve lru_cache for module-
> level functions.

## Tips

- `@functools.cache` (3.9+) is the simplest memoization — no `maxsize` argument needed
- `partial()` is cleaner than a lambda for simple argument fixing when you need a name
- `@total_ordering` requires `__eq__` + one comparison method — generates the other three
- `@lru_cache` on a method with `self` caches the instance — use `@cached_property` for instance-level caching instead

## Common Mistake

> [!warning] `@lru_cache` on an instance method caches all calls including `self`, which prevents garbage collection of the instance. Cache only module-level functions, or use `@cached_property`.

## Shorthand (Junior → Senior)

**Junior:**
```python
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)
fib(100)  # Slow without cache
```

**Senior:**
```python
@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
fib(100)  # Instant with caching
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/json-module|json module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

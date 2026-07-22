---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "functools-partial-cache"
title: "functools (partial, lru_cache, reduce)"
category: "Functions"
subtitle: "Partial application, memoization, and functional composition"
signature_short: "from functools import partial, lru_cache, reduce, wraps"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "functools (partial, lru_cache, reduce)"
  - "functools-partial-cache"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/functions"
  - "tier/tiered"
---

# functools (partial, lru_cache, reduce)

> Partial application, memoization, and functional composition

## Overview

functools provides higher-order functions for composition and optimization. partial pre-fills function arguments, lru_cache memoizes results, reduce folds a function over an iterable, wraps preserves function metadata in decorators.

## Signature

```python
from functools import partial, lru_cache, reduce, wraps
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - partial fixes args; @cache memoizes; reduce folds; @wraps in decorators.
# STRENGTHS - Functional toolkit covers caching, currying, decorating in stdlib.
# WEAKNESSES- See the earlier 'functools' entry (and advanced.js decorators) for the deep dive.
from functools import cache, partial, reduce, wraps

double = partial(lambda a, b: a * b, 2)
print(double(5))                         # 10

@cache
def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)
print(fib(50))                           # instant via memo

reduce(lambda a, b: a + b, [1, 2, 3, 4])  # 10
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - lru_cache(maxsize=N) for bounded; @wraps in every decorator; cmp_to_key bridges legacy comparators.
# STRENGTHS - Memory-bounded memoization; preserved function metadata; sortable with old-style cmp.
# WEAKNESSES- @lru_cache on instance methods leaks instance refs — use @cached_property instead.
from functools import lru_cache, wraps, cmp_to_key

@lru_cache(maxsize=256)
def expensive(x: int) -> int:
    return sum(i * i for i in range(x))

def trace(fn):
    @wraps(fn)                              # ALWAYS @wraps
    def w(*a, **kw):
        print(f"-> {fn.__name__}")
        return fn(*a, **kw)
    return w

# Bridge legacy 3-way compare to sorted(key=...).
def cmp_versions(a, b):
    av, bv = tuple(map(int, a.split("."))), tuple(map(int, b.split(".")))
    return (av > bv) - (av < bv)

sorted(["1.10", "1.2", "1.9"], key=cmp_to_key(cmp_versions))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For singledispatch, cached_property, partialmethod, and the full decision rule, see the earlier 'functools' entry's senior tier and advanced.js decorators.
# STRENGTHS - Pythonic alternatives to isinstance ladders; instance-safe caching.
# WEAKNESSES- functools.reduce is rarely the right tool — sum/min/max/| | exist; reach for reduce only when no built-in fits.
from functools import singledispatch, cached_property, reduce
import operator

@singledispatch
def render(value, /) -> str:
    return repr(value)

@render.register
def _(value: list) -> str:
    return "[" + ", ".join(render(x) for x in value) + "]"

class Doc:
    def __init__(self, body: str): self.body = body
    @cached_property                                # GC-safe instance cache
    def hash(self) -> str:
        import hashlib
        return hashlib.sha256(self.body.encode()).hexdigest()

# Legitimate reduce: combine many sets/dicts.
union = reduce(operator.or_, [{1, 2}, {2, 3}, {3, 4}], set())

# Decision rule:
#   memoize a pure function           -> @cache (or @lru_cache(maxsize=N) to bound memory)
#   memoize on the instance           -> @cached_property  (NOT @lru_cache; leaks self refs)
#   type-based dispatch                -> @singledispatch / singledispatchmethod
#   bind some args                    -> functools.partial (partialmethod for classes)
#   write a decorator                 -> @functools.wraps(fn) on the wrapper, ALWAYS
#   bridge a 3-way compare(a,b)       -> functools.cmp_to_key
#
# Anti-pattern: reduce(operator.add, xs) — built-in sum(xs) is the same and
# faster. Reserve reduce for combiners with no built-in (set union, dict
# merge, custom monoid).
```

## Decision Rule

```text
memoize a pure function           -> @cache (or @lru_cache(maxsize=N) to bound memory)
memoize on the instance           -> @cached_property  (NOT @lru_cache; leaks self refs)
type-based dispatch                -> @singledispatch / singledispatchmethod
bind some args                    -> functools.partial (partialmethod for classes)
write a decorator                 -> @functools.wraps(fn) on the wrapper, ALWAYS
bridge a 3-way compare(a,b)       -> functools.cmp_to_key
```

## Anti-Pattern

> [!warning] Anti-pattern
> reduce(operator.add, xs) — built-in sum(xs) is the same and
> faster. Reserve reduce for combiners with no built-in (set union, dict
> merge, custom monoid).

## Tips

- partial(func, arg1) creates a new function with arg1 pre-filled — useful for callbacks
- lru_cache requires hashable arguments (no lists/dicts). Convert to tuple if needed
- reduce(func, iterable, init) accumulates: result = func(func(func(init, x0), x1), ...)
- @wraps in decorators preserves __name__, __doc__ — helps with debugging and documentation

## Common Mistake

> [!warning] Using @lru_cache with unhashable arguments (lists, dicts). Convert to hashable: @lru_cache works with tuples, strings, frozensets.

## Shorthand (Junior → Senior)

**Junior:**
```python
from functools import partial, lru_cache, reduce, wraps
from operator import mul, add
def multiply(a, b):
return a * b
```

**Senior:**
```python
slow_operation()  # Prints timing info
```

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

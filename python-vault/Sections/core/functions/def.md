---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "def"
title: "def"
category: "Functions"
subtitle: "Function definition with parameters and return values"
signature_short: "def name(params) -> return_type: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "def"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# def

> Function definition with parameters and return values

## Overview

def creates a function object and binds it to a name. Functions are first-class objects — they can be passed as arguments, stored in variables, and returned from other functions. Parameters with defaults are optional; those without are required.

## Signature

```python
def name(params) -> return_type: ...
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
# GOAL: define and call a simple function
def greet(name):
    return f"Hello, {name}!"

greet("Alice")  # → "Hello, Alice!"
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
# GOAL: use default arguments, keyword calls, and multiple return values
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")                      # → "Hello, Alice!"
greet("Bob", "Hi")                  # → "Hi, Bob!"
greet(greeting="Hey", name="Carol") # → "Hey, Carol!"

# WHY: returning multiple values produces a tuple — unpack at the call site
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 4, 1, 5])  # → lo=1, hi=5
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
# GOAL: avoid the mutable default argument trap
# WHY: default values are created ONCE when def executes — not on each call
# BAD: def append_to(item, lst=[]) — all calls share the same list!

def append_to(item, lst=None):
    if lst is None:
        lst = []           # WHY: fresh list created on each call
    lst.append(item)
    return lst

# Type hints are documentation — Python does not enforce them at runtime
def add(a: int, b: int) -> int:
    return a + b

# NOTE: functions are first-class objects — store them in dicts, pass as args
ops = {"add": lambda a, b: a + b, "mul": lambda a, b: a * b}
ops["add"](3, 4)  # → 7
#
# Decision rule:
#   3+ lines of logic, reused                  -> def function (named, testable)
#   one expression, used once inline           -> lambda
#   group state + behavior                     -> class
#   pure data record, no behavior              -> @dataclass / NamedTuple
#   immutable record + validation              -> @dataclass(frozen=True) or Pydantic
#   need polymorphic behavior                  -> ABC / Protocol
#   parameter-less factory / builder           -> def make_X() -> X
#   async I/O                                  -> async def
#
# Anti-pattern: `def f(items=[]):` — mutable default argument.
#   The default `[]` is created once at def-time and reused across every call that omits the
#   arg. The "list grows mysteriously" bug is the most-cited Python gotcha. Always use
#   `def f(items=None):` then `if items is None: items = []` inside the body. The same applies
#   to dicts, sets, and any mutable container or instance.
```

## Decision Rule

```text
3+ lines of logic, reused                  -> def function (named, testable)
one expression, used once inline           -> lambda
group state + behavior                     -> class
pure data record, no behavior              -> @dataclass / NamedTuple
immutable record + validation              -> @dataclass(frozen=True) or Pydantic
need polymorphic behavior                  -> ABC / Protocol
parameter-less factory / builder           -> def make_X() -> X
async I/O                                  -> async def
```

## Anti-Pattern

> [!warning] Anti-pattern
> `def f(items=[]):` — mutable default argument.
>   The default `[]` is created once at def-time and reused across every call that omits the
>   arg. The "list grows mysteriously" bug is the most-cited Python gotcha. Always use
>   `def f(items=None):` then `if items is None: items = []` inside the body. The same applies
>   to dicts, sets, and any mutable container or instance.

## Tips

- Never use mutable objects (lists, dicts) as default parameter values — they are created once and shared
- Use `None` as the default and create the mutable object inside the function body
- Type hints (`->`) are documentation — Python does not enforce them at runtime
- Functions are objects — assign them to variables, put them in dicts, pass them as arguments

## Common Mistake

> [!warning] `def fn(items=[])` — the default list is created once when `def` executes, not on each call. Every call that triggers the default shares the same list. Use `def fn(items=None): items = items or []`.

## See Also

- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/decorators|Decorators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

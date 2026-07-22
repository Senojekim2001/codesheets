---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "isinstance"
title: "isinstance()"
category: "I/O"
subtitle: "isinstance() for type checks — type() for exact type"
signature_short: "isinstance(obj, type_or_tuple) -> bool"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "isinstance()"
  - "isinstance"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# isinstance()

> isinstance() for type checks — type() for exact type

## Overview

isinstance() returns True if the object is an instance of the type or any of its subclasses. type() returns the exact type object. Use isinstance() for type checking — it works correctly with inheritance.

## Signature

```python
isinstance(obj, type_or_tuple) -> bool
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
# GOAL: check what type a value is at runtime
isinstance(42, int)        # → True
isinstance("hi", str)      # → True
isinstance(3.14, float)    # → True
isinstance(42, str)        # → False
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
# GOAL: check against multiple types in one call
# WHY: passing a tuple avoids chained or-conditions
isinstance(42, (int, float))     # → True
isinstance([], (list, tuple))    # → True

# WHY: isinstance respects inheritance — True is a bool, which is a subclass of int
isinstance(True, int)            # → True
type(True) is int                # → False  (type() is exact, no inheritance)
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
from collections.abc import Iterable, Mapping, Sequence

# GOAL: check structural type (duck typing) rather than concrete class
# WHY: these ABCs match any object that behaves like the protocol — not just built-ins
isinstance([1, 2, 3], Iterable)  # → True   (list is iterable)
isinstance({}, Mapping)          # → True   (dict is a mapping)
isinstance("abc", Sequence)      # → True   (str is a sequence)

# NOTE: prefer isinstance(x, Iterable) over type(x) == list — it works with custom classes too
#
# Decision rule:
#   "is this exactly type X?"                 -> type(x) is X (rare, usually wrong)
#   "is this X or a subclass?"                -> isinstance(x, X)
#   "any of several types"                    -> isinstance(x, (int, float))
#   "behaves like a sequence/mapping"          -> isinstance(x, collections.abc.Sequence)
#   static type narrowing for type checker    -> match-case or typing.TypeGuard
#   protocol / structural typing              -> typing.Protocol + isinstance with @runtime_checkable
#   need to dispatch on type                  -> functools.singledispatch (cleaner than chain of isinstance)
#
# Anti-pattern: using type(x) == SomeClass for type checks.
#   This rejects subclasses (including bool, which is an int subclass) and breaks duck typing.
#   It also fails for proxies, mocks, and ORM models. Use isinstance(x, X) so legitimate
#   subclasses are accepted; reach for ABCs (Iterable, Mapping) when you mean "anything that
#   behaves like one" rather than "the concrete list/dict class".
```

## Decision Rule

```text
"is this exactly type X?"                 -> type(x) is X (rare, usually wrong)
"is this X or a subclass?"                -> isinstance(x, X)
"any of several types"                    -> isinstance(x, (int, float))
"behaves like a sequence/mapping"          -> isinstance(x, collections.abc.Sequence)
static type narrowing for type checker    -> match-case or typing.TypeGuard
protocol / structural typing              -> typing.Protocol + isinstance with @runtime_checkable
need to dispatch on type                  -> functools.singledispatch (cleaner than chain of isinstance)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using type(x) == SomeClass for type checks.
>   This rejects subclasses (including bool, which is an int subclass) and breaks duck typing.
>   It also fails for proxies, mocks, and ORM models. Use isinstance(x, X) so legitimate
>   subclasses are accepted; reach for ABCs (Iterable, Mapping) when you mean "anything that
>   behaves like one" rather than "the concrete list/dict class".

## Tips

- Always prefer `isinstance()` over `type(x) ==` — it works with subclasses
- `isinstance(x, (int, float))` checks multiple types in one call
- `isinstance(x, Iterable)` from `collections.abc` is the correct way to check duck-typed protocols
- `type(True) is int` is False — bool subclasses int, but `type()` is exact

## Common Mistake

> [!warning] Using `type(x) == int` to check for numeric input. This rejects `bool` (which is a subclass of `int`) and custom numeric types. Use `isinstance(x, int)` instead.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/hasattr|hasattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "vars"
title: "vars()"
category: "I/O"
subtitle: "Inspect instance namespace as a dictionary"
signature_short: "vars(obj) -> dict | vars() -> dict (locals)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "vars()"
  - "vars"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# vars()

> Inspect instance namespace as a dictionary

## Overview

vars() returns the __dict__ of an object, which is a dictionary of instance attributes. On a module, returns its namespace. With no argument, vars() is equivalent to locals() and returns the current local scope. Use vars() to inspect instance state; use dir() to discover all available attributes.

## Signature

```python
vars(obj) -> dict | vars() -> dict (locals)
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
# GOAL: see an object's instance attributes as a plain dict
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age  = age

d = Dog("Rex", 3)
vars(d)      # → {'name': 'Rex', 'age': 3}
d.__dict__   # → same thing — vars() is just a cleaner way to call it
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
# GOAL: understand the difference between vars() and dir()
class Dog:
    species = "Canis lupus"       # class attribute
    def __init__(self, name):
        self.name = name          # instance attribute
    def bark(self): return "Woof"

d = Dog("Rex")

# WHY: vars() only shows instance attributes — not class attrs or methods
vars(d)         # → {'name': 'Rex'}

# WHY: dir() shows everything — class attrs, methods, inherited dunders
"species" in vars(d)  # → False  (it's a class attribute)
"species" in dir(d)   # → True
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
import json

# GOAL: serialize a simple object to JSON using vars()
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age  = age

p    = Person("Alice", 30)
data = vars(p)           # → {'name': 'Alice', 'age': 30}
json.dumps(data)         # → '{"name": "Alice", "age": 30}'

# NOTE: vars() only works on objects with a __dict__ — won't work on slots or built-in types
# Use dataclasses.asdict() for dataclasses, which handles nested objects too
#
# Decision rule:
#   inspect a regular instance's attrs        -> vars(obj) (returns __dict__)
#   serialize a dataclass                     -> dataclasses.asdict(obj) (recursive, types ok)
#   serialize a Pydantic model                -> model.model_dump()
#   need methods + class attrs too            -> dir(obj) (not vars)
#   namespace inside current function         -> vars() / locals()
#   module's globals                          -> vars(module) / module.__dict__
#   __slots__ class                           -> getattr per name (no __dict__ exists)
#
# Anti-pattern: using vars() to "see all attributes" of an object.
#   vars() only returns instance __dict__ — class attributes, inherited attributes, methods,
#   and slot fields are absent. Beginners then "lose" attributes they know exist on the class.
#   Use dir() for the full attribute surface; use vars() only when you specifically want the
#   per-instance state dict (e.g. for serialization or copying).
```

## Decision Rule

```text
inspect a regular instance's attrs        -> vars(obj) (returns __dict__)
serialize a dataclass                     -> dataclasses.asdict(obj) (recursive, types ok)
serialize a Pydantic model                -> model.model_dump()
need methods + class attrs too            -> dir(obj) (not vars)
namespace inside current function         -> vars() / locals()
module's globals                          -> vars(module) / module.__dict__
__slots__ class                           -> getattr per name (no __dict__ exists)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using vars() to "see all attributes" of an object.
>   vars() only returns instance __dict__ — class attributes, inherited attributes, methods,
>   and slot fields are absent. Beginners then "lose" attributes they know exist on the class.
>   Use dir() for the full attribute surface; use vars() only when you specifically want the
>   per-instance state dict (e.g. for serialization or copying).

## Tips

- `vars(obj)` is equivalent to `obj.__dict__` — only shows instance attributes, not class or inherited
- `vars()` with no argument returns the current local scope — same as `locals()`; at module level, same as `globals()`
- Use `vars()` to serialize an object to a dict: `json.dumps(vars(obj))` for simple data classes
- Class attributes do not appear in `vars(instance)` — use `dir()` to see inherited and class attributes

## Common Mistake

> [!warning] Using `vars(obj)` expecting to see class methods or inherited attributes. `vars()` only shows instance attributes. Use `dir(obj)` to discover all attributes.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "hasattr"
title: "hasattr()"
category: "I/O"
subtitle: "Boolean test for attribute existence"
signature_short: "hasattr(obj, \"attr\") -> bool"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "hasattr()"
  - "hasattr"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# hasattr()

> Boolean test for attribute existence

## Overview

hasattr() returns True if the object has the named attribute, False otherwise. It is implemented as a try/except wrapper around getattr(). Use hasattr() to conditionally access attributes, but prefer getattr() with a default for single operations.

## Signature

```python
hasattr(obj, "attr") -> bool
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
# GOAL: check whether an attribute exists before using it
class Dog:
    def __init__(self, name):
        self.name = name

d = Dog("Rex")
hasattr(d, "name")   # → True
hasattr(d, "color")  # → False
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
# GOAL: conditionally call a method only if the object supports it
class Dog:
    def bark(self): return "Woof!"

d = Dog("Rex")

# WHY: hasattr lets us safely branch without a try/except
if hasattr(d, "bark"):
    print(d.bark())   # → Woof!
else:
    print("This dog can't bark")

# WHY: useful for checking all required fields before processing
required = ["name", "breed", "age"]
missing  = [f for f in required if not hasattr(d, f)]
# → ['breed', 'age']
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
# GOAL: prefer getattr with a default over hasattr + getattr
class Dog:
    def bark(self): return "Woof!"

d = Dog("Rex")

# WHY: hasattr + getattr does two attribute lookups — getattr with None does one
# Avoid this pattern:
# if hasattr(d, "bark"):
#     getattr(d, "bark")()

# Prefer this — one lookup, same result:
method = getattr(d, "bark", None)
if method:
    method()

# NOTE: hasattr is still useful for readable boolean checks where you don't need the value
#
# Decision rule:
#   only need a yes/no answer                 -> hasattr(obj, name)
#   need the value too                        -> getattr(obj, name, sentinel) + check
#   checking duck-typed protocol              -> isinstance(obj, SomeProtocol) (clearer intent)
#   __getattr__ / property may have side fx   -> avoid hasattr; use try/except on real call
#   dataclass / Pydantic model field check    -> "name" in fields(obj) / model.model_fields
#   working with C extensions / mocks          -> getattr with default (hasattr can lie via __getattr__)
#   testing optional duck-typed callable       -> getattr(o, "close", None); if close: close()
#
# Anti-pattern: hasattr on objects that define __getattr__ or descriptors with side effects.
#   hasattr swallows ALL exceptions in older Python (and AttributeError in 3.x), so a getter
#   that raises during DB lookup will silently report "attribute missing". Either guarantee the
#   attribute exists at construction time, or wrap the actual operation in try/except so you
#   see the real error.
```

## Decision Rule

```text
only need a yes/no answer                 -> hasattr(obj, name)
need the value too                        -> getattr(obj, name, sentinel) + check
checking duck-typed protocol              -> isinstance(obj, SomeProtocol) (clearer intent)
__getattr__ / property may have side fx   -> avoid hasattr; use try/except on real call
dataclass / Pydantic model field check    -> "name" in fields(obj) / model.model_fields
working with C extensions / mocks          -> getattr with default (hasattr can lie via __getattr__)
testing optional duck-typed callable       -> getattr(o, "close", None); if close: close()
```

## Anti-Pattern

> [!warning] Anti-pattern
> hasattr on objects that define __getattr__ or descriptors with side effects.
>   hasattr swallows ALL exceptions in older Python (and AttributeError in 3.x), so a getter
>   that raises during DB lookup will silently report "attribute missing". Either guarantee the
>   attribute exists at construction time, or wrap the actual operation in try/except so you
>   see the real error.

## Tips

- `hasattr(x, "y")` is equivalent to a try/except with getattr — use hasattr for clarity
- Prefer `getattr(obj, "attr", default)` over `hasattr()` + `getattr()` — avoids two attribute lookups
- In practice, use hasattr() for conditionals; use getattr() for single operations with defaults
- Never use hasattr() on methods without a clear reason — it may trigger side effects if __getattr__ is defined

## Common Mistake

> [!warning] Checking `hasattr(d, "bark")` then separately calling `getattr(d, "bark")()` — two attribute lookups. Use `getattr(d, "bark", None)` and call directly if not None.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

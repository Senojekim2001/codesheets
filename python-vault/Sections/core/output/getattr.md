---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "getattr"
title: "getattr()"
category: "I/O"
subtitle: "Dynamic attribute access — safer than dot notation"
signature_short: "getattr(obj, \"attr\", default=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "getattr()"
  - "getattr"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# getattr()

> Dynamic attribute access — safer than dot notation

## Overview

getattr() retrieves an attribute by its string name. If the attribute exists, return it; if not, return the default value (or raise AttributeError if no default). Essential for dynamic attribute access in frameworks, plugins, and serialization.

## Signature

```python
getattr(obj, "attr", default=None)
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
# GOAL: access an attribute using its name as a string
class Dog:
    def __init__(self, name):
        self.name = name

d = Dog("Rex")
getattr(d, "name")           # → "Rex"  (same as d.name)
getattr(d, "color", "brown") # → "brown"  (default — attr doesn't exist)
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
# GOAL: safely read a list of attributes with a fallback for missing ones
class Dog:
    def __init__(self, name, breed):
        self.name  = name
        self.breed = breed

d = Dog("Rex", "Labrador")

# WHY: getattr with a default avoids AttributeError when the attr may not exist
for attr in ["name", "breed", "age", "color"]:
    value = getattr(d, attr, "N/A")
    print(f"{attr}: {value}")
# → name: Rex  breed: Labrador  age: N/A  color: N/A
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
# GOAL: dynamic dispatch — call a method by name at runtime
class Dog:
    def bark(self):  return "Woof!"
    def sit(self):   return "Sitting."

d = Dog()

# WHY: getattr turns a string into a callable — the core of plugin/command dispatcher patterns
command = "bark"
method  = getattr(d, command, None)

if callable(method):
    print(method())  # → Woof!
else:
    print(f"Unknown command: {command}")

# NOTE: prefer getattr(obj, name, None) over hasattr() + getattr() — one lookup instead of two
#
# Decision rule:
#   attribute name known at write time        -> obj.attr (faster, type-checkable)
#   attribute name in a string variable       -> getattr(obj, name)
#   want safe lookup with fallback            -> getattr(obj, name, default)
#   need to test existence only               -> hasattr(obj, name) (sugar over getattr)
#   plugin / command dispatcher                -> getattr(self, command, None)
#   walking serialized data into objects      -> getattr + setattr in a loop
#   you find yourself typing many getattrs    -> reach for dataclass / __slots__ / Pydantic
#
# Anti-pattern: combining hasattr + getattr (or try/except AttributeError) for a single lookup.
#   hasattr is implemented as getattr-in-a-try, so `if hasattr(o, "x"): getattr(o, "x")` does the
#   work twice. Use `v = getattr(o, "x", default)` and branch on `v is default` (or use a sentinel).
#   This is faster, race-free, and one line shorter.
```

## Decision Rule

```text
attribute name known at write time        -> obj.attr (faster, type-checkable)
attribute name in a string variable       -> getattr(obj, name)
want safe lookup with fallback            -> getattr(obj, name, default)
need to test existence only               -> hasattr(obj, name) (sugar over getattr)
plugin / command dispatcher                -> getattr(self, command, None)
walking serialized data into objects      -> getattr + setattr in a loop
you find yourself typing many getattrs    -> reach for dataclass / __slots__ / Pydantic
```

## Anti-Pattern

> [!warning] Anti-pattern
> combining hasattr + getattr (or try/except AttributeError) for a single lookup.
>   hasattr is implemented as getattr-in-a-try, so `if hasattr(o, "x"): getattr(o, "x")` does the
>   work twice. Use `v = getattr(o, "x", default)` and branch on `v is default` (or use a sentinel).
>   This is faster, race-free, and one line shorter.

## Tips

- `getattr(obj, "attr", default)` is safer than `obj.attr` — returns default instead of raising AttributeError
- Dynamic dispatch with `getattr(obj, method_name)()` is the core pattern for plugin systems and CLI dispatchers
- `getattr(module, "name")` dynamically imports functions from modules at runtime
- Avoid `getattr(obj, "attr")` without a default; always provide a fallback to handle missing attributes gracefully

## Common Mistake

> [!warning] Using `getattr(obj, "attr")` without a default, then wrapping in try/except. Always provide a default: `getattr(obj, "attr", default_value)` — cleaner and faster.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/hasattr|hasattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

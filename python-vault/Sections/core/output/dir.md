---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "dir"
title: "dir()"
category: "I/O"
subtitle: "Discovery tool — find what an object can do"
signature_short: "dir(obj) -> list[str]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dir()"
  - "dir"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# dir()

> Discovery tool — find what an object can do

## Overview

dir() returns a sorted list of all attribute names available on an object, including instance attributes, class attributes, inherited attributes, and methods. Includes dunder (magic) methods. Use dir() to explore unfamiliar objects and discover available methods.

## Signature

```python
dir(obj) -> list[str]
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
# GOAL: see everything an object has — attributes, methods, and inherited dunders
import math

dir(math)         # → long list of functions: 'acos', 'asin', 'ceil', 'pi', ...
"pi" in dir(math) # → True
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
# GOAL: explore an unfamiliar object and filter out the noise
class Dog:
    def __init__(self, name): self.name = name
    def bark(self): return "Woof"

d = Dog("Rex")

# WHY: raw dir() includes dozens of dunder methods — filter them out to see what matters
public = [a for a in dir(d) if not a.startswith("_")]
# → ['bark', 'name']
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
# GOAL: list only callable methods (not data attributes)
class Dog:
    species = "Canis lupus"
    def __init__(self, name): self.name = name
    def bark(self): return "Woof"

d = Dog("Rex")

# WHY: callable() filters out plain data attributes, leaving only methods
methods = [m for m in dir(d) if callable(getattr(d, m)) and not m.startswith("_")]
# → ['bark']

# NOTE: dir() is for exploration and debugging — don't rely on its output in production logic
#
# Decision rule:
#   exploring an unfamiliar object in REPL    -> dir(obj)
#   programmatically discover methods         -> inspect.getmembers(obj, callable)
#   only public API                            -> [a for a in dir(obj) if not a.startswith("_")]
#   only this instance's attrs                -> vars(obj)
#   "what type is this?"                      -> type(obj) / isinstance(obj, X)
#   help on a function                         -> help(obj) / obj.__doc__
#   listing module exports                    -> module.__all__ (curated) > dir(module)
#
# Anti-pattern: using dir() output as the source of truth for an object's API.
#   dir() includes private dunders, inherited helpers, and IDE/debugger-injected attributes;
#   it is a discovery aid, not a contract. Production code should target documented attributes
#   or use inspect.signature / typing.Protocol / hasattr to test specific things, never iterate
#   over dir() and call everything that "looks public".
```

## Decision Rule

```text
exploring an unfamiliar object in REPL    -> dir(obj)
programmatically discover methods         -> inspect.getmembers(obj, callable)
only public API                            -> [a for a in dir(obj) if not a.startswith("_")]
only this instance's attrs                -> vars(obj)
"what type is this?"                      -> type(obj) / isinstance(obj, X)
help on a function                         -> help(obj) / obj.__doc__
listing module exports                    -> module.__all__ (curated) > dir(module)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using dir() output as the source of truth for an object's API.
>   dir() includes private dunders, inherited helpers, and IDE/debugger-injected attributes;
>   it is a discovery aid, not a contract. Production code should target documented attributes
>   or use inspect.signature / typing.Protocol / hasattr to test specific things, never iterate
>   over dir() and call everything that "looks public".

## Tips

- `dir(obj)` shows everything — use to discover available methods when exploring an unknown object
- `[a for a in dir(obj) if not a.startswith("_")]` filters out dunder methods for cleaner exploration
- `dir()` with no argument returns the current local scope — useful in interactive debugging
- Combine with `callable()` to list methods only: `[m for m in dir(obj) if callable(getattr(obj, m))]`

## Common Mistake

> [!warning] Using `dir(obj)` and being confused by dunder methods. Most dunder methods are internal. Filter with `if not name.startswith("_")` to see public attributes only.

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

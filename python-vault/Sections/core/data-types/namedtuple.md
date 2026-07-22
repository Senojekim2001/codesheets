---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "namedtuple"
title: "namedtuple"
category: "Data Types"
subtitle: "Tuple with attribute access — prefer typing.NamedTuple in new code"
signature_short: "Point = namedtuple(\"Point\", [\"x\",\"y\"]) | class P(NamedTuple): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "namedtuple"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/data-types"
  - "tier/tiered"
---

# namedtuple

> Tuple with attribute access — prefer typing.NamedTuple in new code

## Overview

collections.namedtuple creates a tuple subclass with named fields. Lighter than a dataclass, more readable than a plain tuple. The modern alternative is typing.NamedTuple which supports type hints and default values.

## Signature

```python
Point = namedtuple("Point", ["x","y"]) | class P(NamedTuple): ...
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
# GOAL: Create a namedtuple type and use it
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)

p.x          # → 3   (attribute access)
p.y          # → 4
p[0]         # → 3   (still works as a tuple)
len(p)       # → 2
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
# GOAL: Key namedtuple operations
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)

p._asdict()       # → {'x': 3, 'y': 4}
p._replace(x=10)  # → Point(x=10, y=4)  (new instance — immutable)
x, y = p          # unpack like a regular tuple

# GOAL: Use as a dict key (hashable)
distances = {Point(0,0): 0.0, Point(1,0): 1.0}

# GOAL: Default values (Python 3.6.1+)
Point3D = namedtuple('Point3D', ['x','y','z'], defaults=[0])
Point3D(1, 2)   # → Point3D(x=1, y=2, z=0)
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
# GOAL: typing.NamedTuple — preferred for new code
# WHY: Supports type hints, defaults, and methods in one clean class
from typing import NamedTuple

class Metric(NamedTuple):
    name:  str
    value: float
    unit:  str = 'ms'

    def formatted(self) -> str:
        return f"{self.name}: {self.value:.1f}{self.unit}"

m = Metric('latency', 42.5)
m.formatted()    # → 'latency: 42.5ms'
m._asdict()      # → {'name':'latency','value':42.5,'unit':'ms'}

# NOTE: namedtuple vs dataclass
# namedtuple: immutable, tuple-compatible, hashable, lightweight
# dataclass:  mutable by default, supports methods, post_init, more Pythonic for complex types
#
# Decision rule:
#   immutable record, no methods, want type hints -> typing.NamedTuple (modern)
#   immutable record, no type hints, legacy code  -> collections.namedtuple
#   need mutation / post-init / __slots__         -> @dataclass
#   need validation + serialization               -> Pydantic BaseModel
#   ad-hoc 2-3 fields, never reused              -> plain tuple
#   needs hashable + comparable for set/dict       -> NamedTuple or @dataclass(frozen=True)
#   inheritance hierarchy                          -> regular class (NamedTuple inheritance is awkward)
#   purely structural, never instantiated          -> TypedDict / Protocol
#
# Anti-pattern: reaching for a regular class (with __init__, __eq__, __repr__, ...) for what
#   is actually a record. You re-implement five dunder methods that NamedTuple/@dataclass
#   generate for free, and they are easy to get wrong (e.g. forgetting to update __eq__ when
#   adding a field). For value types with no behavior, prefer NamedTuple/@dataclass and only
#   add a real class when you need substantial methods.
```

## Decision Rule

```text
immutable record, no methods, want type hints -> typing.NamedTuple (modern)
immutable record, no type hints, legacy code  -> collections.namedtuple
need mutation / post-init / __slots__         -> @dataclass
need validation + serialization               -> Pydantic BaseModel
ad-hoc 2-3 fields, never reused              -> plain tuple
needs hashable + comparable for set/dict       -> NamedTuple or @dataclass(frozen=True)
inheritance hierarchy                          -> regular class (NamedTuple inheritance is awkward)
purely structural, never instantiated          -> TypedDict / Protocol
```

## Anti-Pattern

> [!warning] Anti-pattern
> reaching for a regular class (with __init__, __eq__, __repr__, ...) for what
>   is actually a record. You re-implement five dunder methods that NamedTuple/@dataclass
>   generate for free, and they are easy to get wrong (e.g. forgetting to update __eq__ when
>   adding a field). For value types with no behavior, prefer NamedTuple/@dataclass and only
>   add a real class when you need substantial methods.

## Tips

- Use `typing.NamedTuple` class syntax for new code — supports type hints, defaults, and methods
- namedtuple is immutable — use `_replace()` to create a modified copy
- Lighter than a dataclass when you only need field access and no mutation

## Common Mistake

> [!warning] Using a plain tuple `(x, y)` where namedtuple would be clearer. `point[0]` is cryptic; `point.x` is self-documenting with negligible overhead.

## See Also

- [[Sections/core/data-types/list|list (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/unpacking|Unpacking (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict|dict (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/dict-comprehension|Dict comprehension (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

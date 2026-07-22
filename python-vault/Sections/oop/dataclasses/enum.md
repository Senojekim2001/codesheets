---
type: "entry"
domain: "python"
file: "oop"
section: "dataclasses"
id: "enum"
title: "Enum"
category: "Classes"
subtitle: "Named constants with identity comparison and iteration"
signature_short: "from enum import Enum, auto
class Color(Enum): RED = 1"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Enum"
  - "enum"
tags:
  - "python"
  - "python/oop"
  - "python/oop/dataclasses"
  - "category/classes"
  - "tier/tiered"
---

# Enum

> Named constants with identity comparison and iteration

## Overview

Enum creates a class where each member is a named constant. Members have both a name and value, support identity comparison with is, can be iterated, and prevent accidental duplicate values. auto() assigns sequential values automatically.

## Signature

```python
from enum import Enum, auto
class Color(Enum): RED = 1
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest Enum: three named constants. Show name,
#             value, and lookup-by-name / lookup-by-value.
# STRENGTHS - replaces magic numbers with self-documenting names; one
#             import, one class, instantly clearer code.
# WEAKNESSES- doesn't yet cover auto(), IntEnum (when you need int
#             compatibility), or Flag (bitmasks).
#
from enum import Enum

class Color(Enum):
    RED   = 1
    GREEN = 2
    BLUE  = 3

Color.RED            # <Color.RED: 1>
Color.RED.name       # 'RED'
Color.RED.value      # 1
Color['RED']         # lookup by name
Color(1)             # lookup by value
list(Color)          # [<Color.RED: 1>, <Color.GREEN: 2>, <Color.BLUE: 3>]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - day-to-day enum toolkit: auto() for "value doesn't matter",
#             IntEnum for legacy code that compares to integers, and
#             Flag for bitmask-style permissions.
# STRENGTHS - covers the three subclasses you'll actually reach for in
#             real code; shows the right tool for each shape of constant.
# WEAKNESSES- doesn't cover @unique enforcement, custom methods on
#             enum members, or conversion-from-string patterns.
#
from enum import Enum, IntEnum, Flag, auto

# auto() — sequential values when the actual numbers don't matter:
class Direction(Enum):
    NORTH = auto()      # 1
    SOUTH = auto()      # 2
    EAST  = auto()      # 3
    WEST  = auto()      # 4

# IntEnum — members compare equal to ints (useful for DB status codes etc.):
class Status(IntEnum):
    ACTIVE   = 1
    INACTIVE = 0

Status.ACTIVE == 1     # True (Enum would be False)

# Flag — bitwise OR, AND, IN for permission masks:
class Permission(Flag):
    READ    = auto()    # 1
    WRITE   = auto()    # 2
    EXECUTE = auto()    # 4

perm = Permission.READ | Permission.WRITE
Permission.READ in perm     # True
Permission.EXECUTE in perm  # False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production extras: @unique to forbid duplicate values,
#             StrEnum (3.11+) for string-y constants, custom methods
#             and properties on members, and a robust from_string
#             helper that handles unknown inputs.
# STRENGTHS - enums become full first-class types — they own their
#             validation, parsing, and behavior; downstream code never
#             needs to switch on raw strings.
# WEAKNESSES- StrEnum requires Python 3.11+; per-member methods can
#             confuse readers used to "enums are just constants";
#             adding behavior makes refactors slightly riskier.
#
from enum import Enum, unique

@unique                              # raises at class-creation if two members share a value
class Priority(Enum):
    LOW    = 1
    MEDIUM = 2
    HIGH   = 3

    @classmethod
    def from_string(cls, s: str) -> "Priority":
        try:
            return cls[s.strip().upper()]
        except KeyError as e:
            valid = ", ".join(p.name for p in cls)
            raise ValueError(f"unknown priority {s!r}; expected one of {valid}") from e

    @property
    def is_urgent(self) -> bool:
        return self is Priority.HIGH

Priority.from_string("medium").is_urgent     # False
Priority.from_string("HIGH").is_urgent       # True
# Priority.from_string("CRITICAL")           # ValueError with helpful message

# StrEnum (3.11+) — like IntEnum but for strings; great for API enums:
# from enum import StrEnum
# class Mode(StrEnum):
#     READ  = "read"
#     WRITE = "write"
# Mode.READ == "read"          # True
# json.dumps(Mode.READ)        # '"read"'
#
# Decision rule:
#   small fixed set of named constants                -> Enum
#   members must compare equal to ints (DB codes)     -> IntEnum
#   members must compare equal to strings (API)       -> StrEnum (3.11+)
#   bitmask permissions / flag combinations           -> Flag / IntFlag
#   value doesn't matter, just the name               -> auto()
#   want guaranteed unique values                     -> @unique decorator
#   constants live in config / vary at runtime        -> dict / Literal type, not Enum
#   need parsing from user input with helpful errors  -> classmethod from_string()
#
# Anti-pattern: using strings or ints as "enum" values
#   status = "active" sprinkled across a codebase invites typos ("activ"),
#   silent comparison failures, and zero IDE support. An Enum gives you
#   completion, refactoring, and exhaustiveness checking. If you need to
#   serialize, use StrEnum/IntEnum so the wire format stays a primitive
#   while the in-memory type stays a real Enum.
```

## Decision Rule

```text
small fixed set of named constants                -> Enum
members must compare equal to ints (DB codes)     -> IntEnum
members must compare equal to strings (API)       -> StrEnum (3.11+)
bitmask permissions / flag combinations           -> Flag / IntFlag
value doesn't matter, just the name               -> auto()
want guaranteed unique values                     -> @unique decorator
constants live in config / vary at runtime        -> dict / Literal type, not Enum
need parsing from user input with helpful errors  -> classmethod from_string()
```

## Anti-Pattern

> [!warning] Anti-pattern
> using strings or ints as "enum" values
>   status = "active" sprinkled across a codebase invites typos ("activ"),
>   silent comparison failures, and zero IDE support. An Enum gives you
>   completion, refactoring, and exhaustiveness checking. If you need to
>   serialize, use StrEnum/IntEnum so the wire format stays a primitive
>   while the in-memory type stays a real Enum.

## Tips

- Enums prevent magic numbers — Status.ACTIVE is clearer than checking status == 1
- auto() assigns sequential values — use when the actual value does not matter
- Use IntEnum when members must compare equal to integers (e.g. database status codes)
- Use Flag for bitmask permissions — supports |, &, ~ operations naturally

## Common Mistake

> [!warning] Comparing enum members with == to raw integers: Color.RED == 1 is False with regular Enum. Use IntEnum if you need integer comparison, or compare .value: Color.RED.value == 1.

## Shorthand (Junior → Senior)

**Junior:**
```python
from enum import Enum, auto, IntEnum, Flag
class Color(Enum):
RED   = 1
GREEN = 2
```

**Senior:**
```python
Permission.READ in perm   # True
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/dataclasses/_Index|Object-Oriented Python → Modern Patterns]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

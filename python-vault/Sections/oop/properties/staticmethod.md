---
type: "entry"
domain: "python"
file: "oop"
section: "properties"
id: "staticmethod"
title: "@staticmethod"
category: "Properties"
subtitle: "Utility functions grouped with a class but needing no class or instance state"
signature_short: "@staticmethod\\n    def util_fn(args): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@staticmethod"
  - "staticmethod"
tags:
  - "python"
  - "python/oop"
  - "python/oop/properties"
  - "category/properties"
  - "tier/tiered"
---

# @staticmethod

> Utility functions grouped with a class but needing no class or instance state

## Overview

@staticmethod receives neither cls nor self. It is a regular function that lives in the class namespace for organizational purposes. Use it when the logic is related to the class but does not need access to the class or any instance.

## Signature

```python
@staticmethod\n    def util_fn(args): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the smallest @staticmethod: a function that lives on a
#             class, takes neither self nor cls, called via the class.
# STRENGTHS - communicates "this is logic that belongs with the class
#             but doesn't need its state" in the tiniest form.
# WEAKNESSES- with one method the value of grouping isn't obvious;
#             also doesn't yet contrast static / class / instance.
#
class Math:
    @staticmethod
    def square(x):
        return x * x

Math.square(5)        # 25 — call without an instance
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - several stateless helpers grouped on a Validator class.
#             Demonstrates calling on the class and on an instance, and
#             the @staticmethod / @classmethod / regular method contrast.
# STRENGTHS - this is how staticmethod actually shows up in real code:
#             a namespace for related stateless utilities.
# WEAKNESSES- a plain module of functions would do the same job; the
#             senior tier covers when to pick which.
#
class Validator:
    @staticmethod
    def is_valid_email(email: str) -> bool:
        return "@" in email and "." in email.split("@")[-1]

    @staticmethod
    def is_valid_age(age: int) -> bool:
        return 0 <= age <= 150

    @staticmethod
    def slugify(text: str) -> str:
        return text.lower().replace(" ", "-")

# Call on the class — no instance needed:
Validator.is_valid_email("alice@example.com")   # True
Validator.is_valid_age(25)                      # True

# Also works on an instance, but conveys nothing extra:
v = Validator()
v.slugify("Hello World")                        # "hello-world"

# Static / class / instance side by side:
class MyClass:
    @staticmethod
    def static_fn():     return "static"        # no self, no cls
    @classmethod
    def class_fn(cls):   return cls()           # cls, not self
    def instance_fn(self): return self          # self
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - decision rules in code: prefer @staticmethod when the
#             logic is conceptually tied to the class but stateless;
#             use @classmethod if subclasses might override; reach for
#             a module-level function when neither applies.
# STRENGTHS - makes the choice explicit instead of folklore; subclass
#             behavior is preserved where you want it (factories) and
#             not where you don't (pure utilities).
# WEAKNESSES- the line between staticmethod and module function is
#             genuinely fuzzy — sometimes the only honest answer is
#             "where will readers look for this?".
#
from typing import Self

class Color:
    def __init__(self, r: int, g: int, b: int):
        self.r, self.g, self.b = r, g, b

    # Pure utility — no class state, no subclass-specific behavior.
    # @staticmethod is the right hammer.
    @staticmethod
    def clamp(v: int, lo: int = 0, hi: int = 255) -> int:
        return max(lo, min(hi, v))

    # Builds a Color (or subclass) — must use cls(...) to preserve type.
    # @classmethod is the right hammer.
    @classmethod
    def from_hex(cls, code: str) -> Self:
        code = code.lstrip("#")
        r, g, b = int(code[0:2], 16), int(code[2:4], 16), int(code[4:6], 16)
        return cls(cls.clamp(r), cls.clamp(g), cls.clamp(b))

class BrandColor(Color):
    """Subclass — from_hex() returns BrandColor thanks to cls()."""

BrandColor.from_hex("#1A2B3C")   # BrandColor instance, not Color

# Module-level alternative:
def parse_hex(code: str) -> tuple[int, int, int]:
    """Use this when callers don't want to think about Color at all."""
    code = code.lstrip("#")
    return int(code[0:2], 16), int(code[2:4], 16), int(code[4:6], 16)
#
# Decision rule:
#   utility logically tied to class, no self/cls       -> @staticmethod
#   callers should discover it via the class namespace -> @staticmethod
#   factory or alternative constructor                 -> @classmethod
#   needs class config / registry / subclass behavior  -> @classmethod
#   completely independent of the class                -> module-level def
#   used only inside one method                        -> nested def, not @staticmethod
#   needs to be overridable in subclass                -> @classmethod (or regular method)
#
# Anti-pattern: making everything @staticmethod for "purity"
#   Once a helper turns into @staticmethod, subclasses can override it but
#   callers still go through ClassName.helper(), bypassing dispatch.
#   If a method might ever need cls or self, leave it as a regular method
#   or @classmethod. If it really has no relation to the class, prefer a
#   module-level function — readers expect class methods to use the class.
```

## Decision Rule

```text
utility logically tied to class, no self/cls       -> @staticmethod
callers should discover it via the class namespace -> @staticmethod
factory or alternative constructor                 -> @classmethod
needs class config / registry / subclass behavior  -> @classmethod
completely independent of the class                -> module-level def
used only inside one method                        -> nested def, not @staticmethod
needs to be overridable in subclass                -> @classmethod (or regular method)
```

## Anti-Pattern

> [!warning] Anti-pattern
> making everything @staticmethod for "purity"
>   Once a helper turns into @staticmethod, subclasses can override it but
>   callers still go through ClassName.helper(), bypassing dispatch.
>   If a method might ever need cls or self, leave it as a regular method
>   or @classmethod. If it really has no relation to the class, prefer a
>   module-level function — readers expect class methods to use the class.

## Tips

- If a method does not use self or cls — make it @staticmethod to signal that clearly
- @staticmethod is slightly faster than a regular method (no self/cls argument passed)
- Consider a module-level function instead if the utility is not conceptually tied to the class
- @staticmethod cannot be overridden meaningfully by subclasses — use @classmethod if subclass behavior might differ

## Common Mistake

> [!warning] Making every helper @staticmethod. If a method might later need cls for configuration or subclass support, leave it as a regular method or @classmethod.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Validator:
@staticmethod
def is_valid_email(email: str) -> bool:
return "@" in email and "." in email.split("@")[-1]
```

**Senior:**
```python
return self
```

## See Also

- [[Sections/oop/properties/property|@property (Object-Oriented Python)]]
- [[Sections/oop/properties/descriptors|Descriptors (Object-Oriented Python)]]
- [[Sections/oop/properties/classmethod|@classmethod (Object-Oriented Python)]]
- [[Sections/oop/properties/protocol-oop|Protocol (Object-Oriented Python)]]
- [[Sections/oop/properties/_Index|Object-Oriented Python → Properties & Descriptors]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

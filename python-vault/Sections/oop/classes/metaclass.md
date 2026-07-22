---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "metaclass"
title: "Metaclasses"
category: "Classes"
subtitle: "type is the default metaclass — custom metaclasses modify class creation"
signature_short: "class Meta(type): def __new__(mcs, name, bases, ns): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Metaclasses"
  - "metaclass"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Metaclasses

> type is the default metaclass — custom metaclasses modify class creation

## Overview

A metaclass is the class of a class — it controls how classes are created. type is the default metaclass. Custom metaclasses intercept class creation to add validation, auto-register subclasses, or modify class attributes. __init_subclass__ is the modern, simpler alternative for most use cases.

## Signature

```python
class Meta(type): def __new__(mcs, name, bases, ns): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - establish the mental model: every class is itself an
#             instance of type. type can also be called to build a class
#             dynamically, like a factory.
# STRENGTHS - reveals the "classes are objects too" idea without yet
#             writing a custom metaclass.
# WEAKNESSES- doesn't actually customize class creation — that's the
#             whole point of metaclasses, which the next tier shows.
#
type(int)         # <class 'type'>     — int is an instance of type
type(list)        # <class 'type'>

# Build a class dynamically (rare but illuminating):
MyClass = type('MyClass', (object,), {
    'x': 1,
    'greet': lambda self: 'hello',
})
MyClass().greet()   # 'hello'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - subclass type and override __new__ to enforce a rule at
#             class-creation time (here: every subclass needs a docstring).
# STRENGTHS - validation fires when the class is loaded, not when an
#             instance is built — a forgotten contract is caught early.
# WEAKNESSES- metaclasses don't compose: two metaclasses in the same
#             hierarchy collide. For most cases __init_subclass__ (next
#             tier) is simpler and preferred.
#
class RequireDocstring(type):
    def __new__(mcs, name, bases, namespace):
        if bases and not namespace.get('__doc__'):
            raise TypeError(f"{name} must have a docstring")
        return super().__new__(mcs, name, bases, namespace)

class Documented(metaclass=RequireDocstring):
    """root class is OK because bases is empty"""

class Good(Documented):
    """has a docstring — accepted"""

# class Bad(Documented):     # raises TypeError at class-load time
#     pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - prefer __init_subclass__ for the 90% of cases people reach
#             for metaclasses (auto-registration, validation). When a
#             true metaclass is needed, keep it tiny and document why.
# STRENGTHS - __init_subclass__ composes (no metaclass conflicts),
#             reads like a normal method, and supports keyword args at
#             class definition; same plugin pattern, far less surface.
# WEAKNESSES- still subtle — runs once per subclass, easy to forget the
#             super() call; debugging registration order requires
#             walking the import order of modules.
#
# Plugin registry without a metaclass:
class Plugin:
    registry: dict[str, type["Plugin"]] = {}

    def __init_subclass__(cls, *, name: str | None = None, **kwargs):
        super().__init_subclass__(**kwargs)        # cooperate
        Plugin.registry[name or cls.__name__] = cls

class CSVPlugin(Plugin, name="csv"):
    def process(self): return "csv"

class JSONPlugin(Plugin, name="json"):
    def process(self): return "json"

Plugin.registry
# {'csv': <class 'CSVPlugin'>, 'json': <class 'JSONPlugin'>}

# When you DO need a real metaclass, keep it small and named for intent.
# The Django ORM, SQLAlchemy declarative, and ABCMeta are real-world examples.
#
# Decision rule:
#   auto-register subclasses in a registry            -> __init_subclass__
#   validate subclass shape at class-creation time    -> __init_subclass__
#   inject attrs/methods based on class body          -> class decorator
#   enforce abstract methods                          -> abc.ABC (already a metaclass)
#   class needs a different metaclass than its bases  -> avoid; redesign
#   building an ORM / DSL with magic class bodies     -> custom metaclass
#   "I read about metaclasses and want to try them"   -> don't; use simpler tool
#
# Anti-pattern: reaching for a metaclass when __init_subclass__ would do
#   Custom metaclasses don't compose: any subclass that uses a different
#   metaclass triggers a "metaclass conflict" at class creation, and users
#   of your library suddenly can't combine your base with abc.ABC.
#   __init_subclass__ achieves 90% of the use cases (registries, validation)
#   without the conflict, and reads like a normal classmethod.
```

## Decision Rule

```text
auto-register subclasses in a registry            -> __init_subclass__
validate subclass shape at class-creation time    -> __init_subclass__
inject attrs/methods based on class body          -> class decorator
enforce abstract methods                          -> abc.ABC (already a metaclass)
class needs a different metaclass than its bases  -> avoid; redesign
building an ORM / DSL with magic class bodies     -> custom metaclass
"I read about metaclasses and want to try them"   -> don't; use simpler tool
```

## Anti-Pattern

> [!warning] Anti-pattern
> reaching for a metaclass when __init_subclass__ would do
>   Custom metaclasses don't compose: any subclass that uses a different
>   metaclass triggers a "metaclass conflict" at class creation, and users
>   of your library suddenly can't combine your base with abc.ABC.
>   __init_subclass__ achieves 90% of the use cases (registries, validation)
>   without the conflict, and reads like a normal classmethod.

## Tips

- Most metaclass use cases are solved more simply with __init_subclass__ or class decorators
- __init_subclass__ is called on the base class whenever a subclass is created — no metaclass needed
- Metaclasses compose poorly — two metaclasses in the same hierarchy cause a conflict
- Frameworks use metaclasses (Django ORM, SQLAlchemy) — understanding them helps when debugging those

## Common Mistake

> [!warning] Reaching for a metaclass when __init_subclass__ would work. __init_subclass__ handles 90% of metaclass use cases with far less complexity.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

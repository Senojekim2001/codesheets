---
type: "entry"
domain: "python"
file: "advanced"
section: "metaprogramming"
id: "metaclass"
title: "Metaclasses — Customizing Class Creation"
category: "Metaprogramming"
subtitle: "type(), __new__, __init__, metaclass= kwarg, use cases"
signature_short: "class Meta(type): def __new__(mcs, name, bases, dct): ...  |  class MyClass(metaclass=Meta): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Metaclasses — Customizing Class Creation"
  - "metaclass"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/metaprogramming"
  - "category/metaprogramming"
  - "tier/tiered"
---

# Metaclasses — Customizing Class Creation

> type(), __new__, __init__, metaclass= kwarg, use cases

## Overview

A metaclass is a class whose instances are classes. The type() function is the default metaclass. Custom metaclasses override __new__ (class creation) and __init__ (class initialization) to modify how classes are constructed. Metaclasses enable: enforcing attribute patterns, auto-registering subclasses, validating definitions, modifying methods. Rarely needed — prefer class decorators, __init_subclass__, or descriptors. Rule: metaclasses are one per inheritance hierarchy.

## Signature

```python
class Meta(type): def __new__(mcs, name, bases, dct): ...  |  class MyClass(metaclass=Meta): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One metaclass that records every class created
# STRENGTHS - Smallest valid metaclass; shows __new__ / namespace shape
# WEAKNESSES- A class decorator or __init_subclass__ would do the same job
#
class Tracker(type):
    created = []
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        mcs.created.append(name)
        return cls

class Base(metaclass=Tracker):           # all subclasses go through Tracker
    pass

class Foo(Base): pass
class Bar(Base): pass

print(Tracker.created)                    # ['Base', 'Foo', 'Bar']
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Validation metaclass + singleton metaclass — two classic uses
# STRENGTHS - The shapes you see in tutorials; ALSO the shapes most people misuse
# WEAKNESSES- Both use cases have simpler modern alternatives (next tier)
#
# 1) Validate every subclass at definition time
class StrictMeta(type):
    def __new__(mcs, name, bases, namespace):
        for k, v in namespace.items():
            if callable(v) and not k.startswith("_"):
                if not v.__doc__:
                    raise TypeError(f"{name}.{k} missing docstring")
        return super().__new__(mcs, name, bases, namespace)

class Strict(metaclass=StrictMeta): pass

class Good(Strict):
    def go(self):
        """do the thing"""
        return 1

# class Bad(Strict):
#     def go(self): return 1   # TypeError at class-creation time

# 2) Singleton via metaclass — only ONE instance ever
class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Logger(metaclass=SingletonMeta):
    def log(self, msg): print(msg)

assert Logger() is Logger()              # same object, every call
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When NOT to use a metaclass; multi-metaclass conflict; use cases that demand one
# STRENGTHS - The doctrine that keeps your codebase metaclass-free until it really needs one
# WEAKNESSES- N/A
#
# 1) Modern alternative — __init_subclass__ replaces 90% of "subclass registry" metaclasses
PARSERS: dict[str, type] = {}
class Parser:
    def __init_subclass__(cls, *, name: str | None = None, **kw):
        super().__init_subclass__(**kw)        # MUST call super
        if name: PARSERS[name] = cls

class JsonParser(Parser, name="json"): pass
class YamlParser(Parser, name="yaml"): pass
print(PARSERS)                                  # registered without any metaclass

# 2) Modern alternative — class decorators replace "modify the class" metaclasses
def add_repr(cls):
    cls.__repr__ = lambda self: f"{cls.__name__}({self.__dict__})"
    return cls

# 3) Singleton via metaclass is overkill — module is already a singleton
# logger.py
# log = _Logger()                          # importable as logger.log; one per process

# 4) When you GENUINELY need a metaclass
#    a) Framework that needs to control class CREATION (e.g. ABCMeta from abc)
#    b) Need a class to BEHAVE differently when used (e.g. Enum, Django Model)
#    c) Need to inspect / modify the namespace before __init_subclass__ fires
#       (rare; only when you must intercept BEFORE bases are evaluated)

# 5) Multi-metaclass conflict — only ONE metaclass per class hierarchy
class MetaA(type): pass
class MetaB(type): pass
# class C(metaclass=MetaA): pass
# class D(C, metaclass=MetaB): pass
#   TypeError: metaclass conflict — solution: a NEW metaclass that subclasses both
class MetaAB(MetaA, MetaB): pass
class D(metaclass=MetaAB): pass

# 6) Diamond rule — your custom metaclass should subclass type (or another metaclass)
#    NEVER reach for Python's "C-level" type machinery directly.

# Decision rule:
#   collect every subclass into a registry      -> __init_subclass__ on the base
#   add behavior to one class                    -> class decorator
#   reusable validated/computed attribute         -> descriptor (__set_name__ + __get__/__set__)
#   need ABC / Enum / Django-Model behavior       -> the existing metaclass (don't roll your own)
#   need to ENFORCE a contract on every subclass  -> __init_subclass__, then metaclass last
#   want a singleton                                -> module-level instance, NOT SingletonMeta
#
# Anti-pattern: metaclass when a class decorator suffices
#   Metaclasses are sticky (one per hierarchy), break with multiple inheritance,
#   and confuse type checkers. Reach for __init_subclass__ or a class decorator
#   first; metaclass is a LAST resort.
```

## Decision Rule

```text
collect every subclass into a registry      -> __init_subclass__ on the base
add behavior to one class                    -> class decorator
reusable validated/computed attribute         -> descriptor (__set_name__ + __get__/__set__)
need ABC / Enum / Django-Model behavior       -> the existing metaclass (don't roll your own)
need to ENFORCE a contract on every subclass  -> __init_subclass__, then metaclass last
want a singleton                                -> module-level instance, NOT SingletonMeta
```

## Anti-Pattern

> [!warning] Anti-pattern
> metaclass when a class decorator suffices
>   Metaclasses are sticky (one per hierarchy), break with multiple inheritance,
>   and confuse type checkers. Reach for __init_subclass__ or a class decorator
>   first; metaclass is a LAST resort.

## Tips

- Only one metaclass per class hierarchy — when two metaclass-using bases mix, you get a "metaclass conflict" TypeError. Resolve it by defining a NEW metaclass that subclasses both: `class MetaAB(MetaA, MetaB): pass`.
- Metaclasses are typically replaced by class decorators (__init_subclass__, or descriptors) — use them only when you must control class creation itself. Existing metaclasses you should USE, not replicate: ABCMeta, EnumMeta, Django's ModelBase.
- __new__ receives the class name, bases, and namespace dict — modify it before calling super().__new__().
- Singleton pattern via metaclass is overkill — prefer a factory function or module-level instance instead.

## Common Mistake

> [!warning] Reaching for a metaclass when a class decorator or __init_subclass__ would suffice — metaclasses are sticky (one per hierarchy), break with multiple inheritance, and confuse type checkers. Prefer __init_subclass__ for "every subclass" hooks; reserve metaclasses for framework-defining APIs.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Meta(type):
    def __new__(mcs, name, bases, namespace):
        namespace['_created_by_meta'] = True
        return super().__new__(mcs, name, bases, namespace)

class MyClass(metaclass=Meta):
    pass
```

**Senior:**
```python
class Meta(type):
    def __new__(mcs, name, bases, namespace):
        namespace['_created_by_meta'] = True
        return super().__new__(mcs, name, bases, namespace)
```

## See Also

- [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes (Advanced Python)]]
- [[Sections/advanced/metaprogramming/slots|__slots__ — Memory Optimization (Advanced Python)]]
- [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement (Advanced Python)]]
- [[Sections/advanced/metaprogramming/_Index|Advanced Python → Metaprogramming]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

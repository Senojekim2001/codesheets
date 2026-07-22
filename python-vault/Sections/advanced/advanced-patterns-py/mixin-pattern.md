---
type: "entry"
domain: "python"
file: "advanced"
section: "advanced-patterns-py"
id: "mixin-pattern"
title: "Mixin Pattern — Composable Behaviors"
category: "Design Patterns"
subtitle: "Mixin classes, multiple inheritance, MRO (Method Resolution Order)"
signature_short: "class MyClass(MixinA, MixinB, BaseClass): ...  |  super().__init_subclass__()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Mixin Pattern — Composable Behaviors"
  - "mixin-pattern"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/advanced-patterns-py"
  - "category/design-patterns"
  - "tier/tiered"
---

# Mixin Pattern — Composable Behaviors

> Mixin classes, multiple inheritance, MRO (Method Resolution Order)

## Overview

Mixins are classes that add specific behaviors without being main base classes. Multiple inheritance enables composing behaviors. Method Resolution Order (MRO) determines which method runs — left-to-right in class definitions. Use super() for cooperative inheritance. Mixins are perfect for: timestamping, serialization, caching, logging, validation. Avoid deep hierarchies; use mixins to flatten complexity.

## Signature

```python
class MyClass(MixinA, MixinB, BaseClass): ...  |  super().__init_subclass__()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One mixin adds a method to whatever it's mixed into
# STRENGTHS - Smallest valid mixin: a class with a method, no __init__
# WEAKNESSES- No MRO, no super() cooperation
#
class JsonMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

class User(JsonMixin):                            # mixin FIRST in the bases
    def __init__(self, name): self.name = name

print(User("Alice").to_json())                    # '{"name": "Alice"}'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multiple mixins composed via MRO; super() chains init
# STRENGTHS - The shape that lets behaviors stack without deep hierarchies
# WEAKNESSES- No abstract methods; no slots interaction
#
from datetime import datetime
import json

class TimestampMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)         # MUST call super for cooperative init
        self.created_at = datetime.utcnow()

class JsonMixin:
    def to_json(self) -> str:
        return json.dumps(self.__dict__, default=str)

class ReprMixin:
    def __repr__(self) -> str:
        kvs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{type(self).__name__}({kvs})"

# Mixins go FIRST so their behavior takes precedence in MRO
class User(TimestampMixin, JsonMixin, ReprMixin):
    def __init__(self, name, email):
        self.name, self.email = name, email
        super().__init__()                        # invokes TimestampMixin -> object

u = User("Alice", "a@x.com")
print(u)                                          # ReprMixin's __repr__
print(u.to_json())                                # JsonMixin
print(u.created_at)                               # TimestampMixin

# MRO inspection — left-to-right, then up
print(User.__mro__)
# (User, TimestampMixin, JsonMixin, ReprMixin, object)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - C3 MRO + super() cooperation, ABCMixin pattern, mixin vs composition
# STRENGTHS - The doctrine that prevents mixin spaghetti
# WEAKNESSES- N/A
#
from abc import ABC, abstractmethod

# 1) C3 LINEARIZATION — Python's MRO algorithm. super() walks it cooperatively.
class A:
    def hello(self): return ["A"]
class B(A):
    def hello(self): return ["B"] + super().hello()
class C(A):
    def hello(self): return ["C"] + super().hello()
class D(B, C):                                     # diamond
    def hello(self): return ["D"] + super().hello()

print(D().hello())                                 # ['D', 'B', 'C', 'A']
print(D.__mro__)                                   # D -> B -> C -> A -> object
# C3 rules: subclass first, parents in declared order, monotonic (no cycles).

# 2) Cooperative __init__ — mixins MUST accept *args/**kwargs and call super
class Loggable:
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.log = []
    def log_event(self, e): self.log.append(e)

class Auditable:
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.audit = []

class Service(Loggable, Auditable):
    def __init__(self, name):
        super().__init__()                         # both mixins init cleanly
        self.name = name

# 3) ABCMixin — mixin that REQUIRES the host class to implement methods
class Cacheable(ABC):
    @abstractmethod
    def cache_key(self) -> str: ...
    def cached_value(self):
        return _CACHE.get(self.cache_key())        # uses subclass's cache_key

# 4) When MIXINS hurt — over-inheritance smell
#    Hard to read: "where does this method come from?"
#    Hard to test: each mixin's behavior is hidden inside an MRO order
#    Composition (object holds a JsonSerializer) is often clearer

class JsonSerializer:                              # composition example
    def to_json(self, obj): import json; return json.dumps(obj.__dict__)

class User2:
    def __init__(self, name): self.name = name
    json = JsonSerializer()                         # delegate, don't inherit
# user.json.to_json(user)   # explicit; no MRO surprises

# 5) Mixin ORDERING rule — mixins LEFT, base class RIGHT
# class C(MixinA, MixinB, BaseClass):  CORRECT
# class C(BaseClass, MixinA, MixinB):  WRONG (mixins lose precedence)

# 6) Don't add state in mixins unless you can guarantee uniqueness
#    Two mixins both setting self.id collide silently — there's no warning.
#    Prefix mixin attrs (self._timestamp_created_at) to reduce collisions.

# Decision rule:
#   add ONE behavior to many classes          -> mixin
#   add behavior that needs subclass HOOK     -> ABC + mixin
#   "subclass needs a JSON serializer"          -> composition (delegate object), NOT inheritance
#   diamond inheritance                         -> super() everywhere; trust C3
#   mixin needs init args                        -> *args, **kwargs; pass via super()
#   mixin shares a name with another             -> rename or use composition
#
# Anti-pattern: 5+ mixins on one class
#   "Where does .save() come from?" becomes a 5-minute scavenger hunt.
#   Refactor into composition or a few clear base classes.

_CACHE = {}
```

## Decision Rule

```text
add ONE behavior to many classes          -> mixin
add behavior that needs subclass HOOK     -> ABC + mixin
"subclass needs a JSON serializer"          -> composition (delegate object), NOT inheritance
diamond inheritance                         -> super() everywhere; trust C3
mixin needs init args                        -> *args, **kwargs; pass via super()
mixin shares a name with another             -> rename or use composition
```

## Anti-Pattern

> [!warning] Anti-pattern
> 5+ mixins on one class
>   "Where does .save() come from?" becomes a 5-minute scavenger hunt.
>   Refactor into composition or a few clear base classes.

## Tips

- MRO (Method Resolution Order) follows C3 linearization (subclass first, parents in declared order, monotonic) — `D.__mro__` shows the path super() walks.
- Always use super() in mixins for cooperative multiple inheritance — it respects MRO and enables chaining.
- Mixins that need __init__ MUST accept *args, **kwargs and call super().__init__(*a, **kw) — otherwise the cooperative chain breaks for any class further down the MRO.
- Use abstract methods in mixins to enforce required methods in concrete subclasses. When a mixin chain hits 5+ entries and "where does .save() come from?" turns into a scavenger hunt, refactor to composition (delegate to a serializer/logger object) — it's often clearer than inheritance.

## Common Mistake

> [!warning] Mixing mixin order badly — put mixins LEFT (first), base class RIGHT (last). `class C(MixinA, MixinB, BaseClass)` is correct; `class C(BaseClass, MixinA, MixinB)` puts the base ahead in MRO and the mixins lose precedence.

## Shorthand (Junior → Senior)

**Junior:**
```python
class TimestampMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.created_at = datetime.now()

class User(TimestampMixin, JSONMixin):
    def __init__(self, name):
        self.name = name
        super().__init__()
```

**Senior:**
```python
@dataclass(frozen=True)
class User(TimestampMixin, JSONMixin):
    name: str
    created_at: datetime = field(default_factory=datetime.now)
```

## See Also

- [[Sections/advanced/advanced-patterns-py/singleton-pattern|Singleton Pattern — Global Unique Instance (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/observer-pattern|Observer Pattern — Event System & Pub/Sub (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/_Index|Advanced Python → Advanced Patterns]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "mro"
title: "Multiple inheritance / MRO"
category: "Classes"
subtitle: "C3 linearization determines which parent method gets called"
signature_short: "class C(A, B): ... | C.__mro__ | isinstance(c, A)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Multiple inheritance / MRO"
  - "mro"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Multiple inheritance / MRO

> C3 linearization determines which parent method gets called

## Overview

Python supports multiple inheritance. When a method is called, Python uses the C3 linearization algorithm (MRO) to determine which class to look in first. __mro__ shows the lookup order. Mixins are small classes designed specifically for multiple inheritance.

## Signature

```python
class C(A, B): ... | C.__mro__ | isinstance(c, A)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - two unrelated parents, one child that inherits from both.
#             No overlapping methods, no diamond — just "pick up two
#             behaviors at once".
# STRENGTHS - shows multiple inheritance in its simplest, least
#             confusing form.
# WEAKNESSES- doesn't expose MRO at all; with no overlap, lookup order
#             never matters.
#
class Flyable:
    def fly(self): return "flying"

class Swimmable:
    def swim(self): return "swimming"

class Duck(Flyable, Swimmable):
    def quack(self): return "quack"

d = Duck()
d.fly()       # "flying"
d.swim()      # "swimming"
d.quack()     # "quack"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - construct the diamond on purpose so MRO matters: B and C
#             both override A, D inherits from both, super() routes.
#             Inspect __mro__ to make the lookup order concrete.
# STRENGTHS - the moment readers print __mro__ and trace through a
#             call, MRO stops being magical.
# WEAKNESSES- still one method per class — real systems have many; the
#             cooperative super() story (next tier) is what actually
#             pays off.
#
class A:
    def hello(self): return "A"

class B(A):
    def hello(self): return "B -> " + super().hello()

class C(A):
    def hello(self): return "C -> " + super().hello()

class D(B, C):                 # left-to-right, depth-first w/ C3
    def hello(self): return "D -> " + super().hello()

D().hello()        # "D -> B -> C -> A"
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - cooperative mixin pattern: each mixin forwards via
#             super().__init__(**kwargs) so any composition works. The
#             final class only has to list the right ingredients in the
#             right order.
# STRENGTHS - new behavior is added by writing one small mixin; classes
#             compose like Lego; works correctly even in diamond shapes.
# WEAKNESSES- every link in the chain must use **kwargs and call super()
#             — one mixin that forgets breaks the entire hierarchy
#             silently; harder to debug than single inheritance.
#
import json

class JSONMixin:
    def to_json(self) -> str:
        return json.dumps(self.__dict__, default=str)

class LogMixin:
    def log(self, msg: str) -> None:
        print(f"[{type(self).__name__}] {msg}")

class User(JSONMixin, LogMixin):
    def __init__(self, name: str, **kwargs):
        super().__init__(**kwargs)        # cooperate with any further mixins
        self.name = name

u = User("Alice")
u.to_json()        # '{"name": "Alice"}'
u.log("created")   # [User] created
print(User.__mro__)
# (<class 'User'>, <class 'JSONMixin'>, <class 'LogMixin'>, <class 'object'>)
#
# Decision rule:
#   debugging unexpected method dispatch             -> print(Cls.__mro__)
#   composing orthogonal behaviors                   -> mixins listed leftmost
#   diamond shape with shared base                   -> cooperative super() everywhere
#   want to enforce ordering for invariants          -> check Cls.__mro__ in tests
#   Python raises "MRO conflict" at class creation   -> reorder bases (specific first)
#   need single inheritance for clarity              -> avoid MI, prefer composition
#   one base is the "real" parent, others are mixins -> mixins first, base last
#
# Anti-pattern: relying on left-to-right depth-first ordering folklore
#   Python uses C3 linearization, not naive DFS. People assume class D(B, C)
#   means "all of B before any of C", but C3 reorders to keep monotonic
#   precedence. Always verify with __mro__ rather than guessing. If MRO
#   gets confusing, that's a signal to flatten the hierarchy.
```

## Decision Rule

```text
debugging unexpected method dispatch             -> print(Cls.__mro__)
composing orthogonal behaviors                   -> mixins listed leftmost
diamond shape with shared base                   -> cooperative super() everywhere
want to enforce ordering for invariants          -> check Cls.__mro__ in tests
Python raises "MRO conflict" at class creation   -> reorder bases (specific first)
need single inheritance for clarity              -> avoid MI, prefer composition
one base is the "real" parent, others are mixins -> mixins first, base last
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on left-to-right depth-first ordering folklore
>   Python uses C3 linearization, not naive DFS. People assume class D(B, C)
>   means "all of B before any of C", but C3 reorders to keep monotonic
>   precedence. Always verify with __mro__ rather than guessing. If MRO
>   gets confusing, that's a signal to flatten the hierarchy.

## Tips

- Left-to-right, depth-first: `class D(B, C)` checks B before C
- `ClassName.__mro__` shows the exact lookup order — check it when behavior is unexpected
- Mixins should not have __init__ and should not inherit from anything except object
- super() in multiple inheritance follows the MRO — this is why you must always use super(), not hardcoded parent calls

## Common Mistake

> [!warning] Creating a class that inherits from two classes that both define __init__ without calling super(). The second parent's __init__ never runs. Use cooperative multiple inheritance with super() in every class in the chain.

## Shorthand (Junior → Senior)

**Junior:**
```python
import json
class Flyable:
def fly(self): return "flying"
class Swimmable:
```

**Senior:**
```python
u.log("created")   # [User] created
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

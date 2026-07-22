---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "class-instance-vars"
title: "Class vs instance variables"
category: "Classes"
subtitle: "Shared state vs per-object state — easy to confuse"
signature_short: "class Foo: class_var = 0 | self.instance_var = val"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Class vs instance variables"
  - "class-instance-vars"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# Class vs instance variables

> Shared state vs per-object state — easy to confuse

## Overview

Class variables are defined at class level and shared by all instances. Instance variables are defined in __init__ with self and belong to each object. Assigning to an instance attribute with the same name as a class variable creates a new instance attribute that shadows the class variable.

## Signature

```python
class Foo: class_var = 0 | self.instance_var = val
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the bare distinction: a value defined at class level is
#             shared; a value assigned in __init__ via self belongs to one
#             instance only.
# STRENGTHS - drives home the difference in the smallest possible class;
#             nothing else competing for attention.
# WEAKNESSES- skips the gotchas (shadowing, mutable defaults) that bite
#             real code; no advice on which to choose when.
#
class Pet:
    species = "dog"            # class variable — same for every Pet
    def __init__(self, name):
        self.name = name       # instance variable — unique per Pet

a = Pet("Rex")
b = Pet("Buddy")
a.species, b.species           # ("dog", "dog")  — shared
a.name, b.name                 # ("Rex", "Buddy") — independent
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - use a class variable as a counter, then demonstrate shadowing
#             so the reader sees what assignment to self.x actually does.
# STRENGTHS - matches a pattern people reach for (auto-incrementing IDs);
#             the shadowing trace makes lookup rules concrete.
# WEAKNESSES- still ignores mutable class vars and threading; counter is
#             not thread-safe.
#
class Counter:
    count = 0                       # class variable — shared
    def __init__(self, name):
        Counter.count += 1          # mutate via class, not self
        self.name = name            # instance variable — per object
        self.id   = Counter.count

c1 = Counter("first")
c2 = Counter("second")
Counter.count   # 2 — shared by all instances
c1.count        # 2 — read falls through to class variable
c2.count        # 2

# Shadowing: assigning via self creates an INSTANCE variable that hides the class one
c1.count = 99   # creates c1.count on the instance only
Counter.count   # still 2 — class var untouched
c2.count        # still 2 — c2 still reads the class var
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - call out the classic mutable-class-variable bug, give the
#             correct per-instance fix, and note thread-safety for shared
#             counters.
# STRENGTHS - prevents the most common OOP bug in Python; the threading
#             aside saves real production incidents.
# WEAKNESSES- denser than junior; assumes the reader already understands
#             the basic class/instance split.
#
import threading

# BUG — mutable class variable shared across all instances:
class Bad:
    items = []                      # one list, shared by every Bad()
    def add(self, item):
        self.items.append(item)     # mutates the class-level list

b1, b2 = Bad(), Bad()
b1.add(1)
b2.items        # [1] — surprise! b1 and b2 share state

# FIX — initialize mutable state in __init__ so each instance gets its own:
class Good:
    def __init__(self):
        self.items = []             # per-instance list

g1, g2 = Good(), Good()
g1.items.append(1)
g2.items        # [] — independent

# Thread-safety: the Counter pattern in the junior tier races under threads.
# Use self.__class__ for subclass-correctness, and a Lock for atomicity:
class SafeCounter:
    _count = 0
    _lock = threading.Lock()
    def __init__(self):
        with SafeCounter._lock:
            SafeCounter._count += 1
            self.id = SafeCounter._count
#
# Decision rule:
#   immutable constant shared by all instances      -> class variable
#   per-instance mutable state (lists, dicts)       -> set on self in __init__
#   counter / registry shared across instances      -> class var + Lock
#   subclasses should each get their own counter    -> self.__class__.x
#   value depends on subclass (e.g. default config) -> @classmethod factory
#   shared cache that may grow                      -> module-level dict
#   per-process singleton resource                  -> module global, not class var
#
# Anti-pattern: mutable class variable used as a per-instance default
#   Writing class Foo: items = [] feels harmless until two instances share
#   the same list and one append() leaks into the other. Initialize mutable
#   state on self inside __init__, and reserve class variables for true
#   constants and explicitly-shared registries.
```

## Decision Rule

```text
immutable constant shared by all instances      -> class variable
per-instance mutable state (lists, dicts)       -> set on self in __init__
counter / registry shared across instances      -> class var + Lock
subclasses should each get their own counter    -> self.__class__.x
value depends on subclass (e.g. default config) -> @classmethod factory
shared cache that may grow                      -> module-level dict
per-process singleton resource                  -> module global, not class var
```

## Anti-Pattern

> [!warning] Anti-pattern
> mutable class variable used as a per-instance default
>   Writing class Foo: items = [] feels harmless until two instances share
>   the same list and one append() leaks into the other. Initialize mutable
>   state on self inside __init__, and reserve class variables for true
>   constants and explicitly-shared registries.

## Tips

- Class variables are ideal for constants and counters shared across all instances
- Never use a mutable class variable (list, dict) as a default — it is shared by all instances
- Modify class variables via `ClassName.var = val`, not `self.var = val` — assignment to self creates an instance variable
- `self.__class__.count` is safer than `ClassName.count` in subclasses — uses the actual class

## Common Mistake

> [!warning] Using a mutable class variable as a per-instance default: `class Foo: items = []`. Every instance shares the same list — appending in one instance affects all others. Initialize in __init__ instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
from collections import Counter, defaultdict, deque, namedtuple
class Counter:
count = 0              # class variable — shared
def __init__(self, name):
```

**Senior:**
```python
self.items = []          # per-instance list
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/mro|Multiple inheritance / MRO (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

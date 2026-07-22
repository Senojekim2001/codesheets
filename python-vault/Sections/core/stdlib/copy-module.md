---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "copy-module"
title: "copy module"
category: "Standard Library"
subtitle: "copy() for shallow, deepcopy() for fully independent copies"
signature_short: "copy.copy(obj) | copy.deepcopy(obj)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "copy module"
  - "copy-module"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# copy module

> copy() for shallow, deepcopy() for fully independent copies

## Overview

Assignment in Python copies a reference, not the object. copy.copy() creates a shallow copy — a new object but with references to the same inner objects. copy.deepcopy() recursively copies everything — fully independent.

## Signature

```python
copy.copy(obj) | copy.deepcopy(obj)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - = is a reference; copy.copy is shallow; copy.deepcopy is fully independent.
# STRENGTHS - Two functions cover every "how do I duplicate this" case.
# WEAKNESSES- Shallow copy is the source of "I changed b but a changed too" bugs.
import copy

a = [1, [2, 3], 4]
b = copy.copy(a)              # outer is new; inner list [2, 3] is SHARED
b[0] = 99                     # a unchanged
b[1].append(99)               # a[1] is now [2, 3, 99] — same list!

c = copy.deepcopy(a)
c[1].append(99)               # a unaffected (fully independent tree)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - list[:] / list(x) / dict.copy() are all shallow; deepcopy for nested mutables; dataclasses.replace for immutable updates.
# STRENGTHS - Pick the right tool: shallow when contents are immutable, deep otherwise.
# WEAKNESSES- deepcopy is slow on large objects and crashes on objects with __reduce__ / file handles / locks.
import copy
from dataclasses import dataclass, replace

# Shallow forms — equivalent to copy.copy:
list(xs); xs[:]                    # list shallow copy
dict(d);  d.copy()                  # dict shallow copy
{*s};     s.copy()                  # set shallow copy

# Deep when nested mutables exist:
config = {"db": {"host": "x"}, "tags": ["a", "b"]}
new_cfg = copy.deepcopy(config)
new_cfg["db"]["host"] = "y"        # config unaffected

# For immutable / dataclass: replace() is faster and clearer than deepcopy.
@dataclass(frozen=True)
class Point: x: int; y: int
p = Point(1, 2)
q = replace(p, x=99)               # new Point(99, 2); p untouched
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Prefer immutability over copying; deepcopy is the last resort; __copy__ / __deepcopy__ for custom objects.
# STRENGTHS - No copying needed if data is immutable; explicit copy hooks for resource-holding classes.
# WEAKNESSES- deepcopy can recurse forever on cyclic graphs without proper __deepcopy__ support.
from __future__ import annotations
import copy
from dataclasses import dataclass, field, replace

# 1) Custom hooks: control what gets copied.
class Connection:
    def __init__(self, dsn: str, sock=None):
        self.dsn, self.sock = dsn, sock
    def __copy__(self):
        # Shallow: share the socket.
        return type(self)(self.dsn, self.sock)
    def __deepcopy__(self, memo):
        # Deep: drop the live socket; new instance reconnects on use.
        return type(self)(self.dsn, sock=None)

# 2) Cyclic structures: deepcopy uses memo dict; respect it.
class Node:
    def __init__(self, val): self.val, self.next = val, None
    def __deepcopy__(self, memo):
        new = type(self)(copy.deepcopy(self.val, memo))
        memo[id(self)] = new
        new.next = copy.deepcopy(self.next, memo)
        return new

# Decision rule:
#   never mutate the input                  -> NO copy needed (preferred)
#   shallow update of dict/list             -> {**d, "k": v}  /  [*xs, new]
#   immutable record update                 -> dataclasses.replace(obj, x=...)
#   nested mutables, brief copy             -> copy.deepcopy
#   resource-holding object                 -> implement __copy__ / __deepcopy__
#   pickle-able structure, hot path         -> pickle.loads(pickle.dumps(x)) is faster than deepcopy on numeric / dataclass trees
#   cyclic graph                            -> __deepcopy__ with memo[id(self)] = new
#
# Anti-pattern: copy.deepcopy on objects with file handles, sockets, locks, or
# threading primitives. The copied resource is invalid. Implement __deepcopy__
# to drop the resource, OR refactor to a value type with no resources.
```

## Decision Rule

```text
never mutate the input                  -> NO copy needed (preferred)
shallow update of dict/list             -> {**d, "k": v}  /  [*xs, new]
immutable record update                 -> dataclasses.replace(obj, x=...)
nested mutables, brief copy             -> copy.deepcopy
resource-holding object                 -> implement __copy__ / __deepcopy__
pickle-able structure, hot path         -> pickle.loads(pickle.dumps(x)) is faster than deepcopy on numeric / dataclass trees
cyclic graph                            -> __deepcopy__ with memo[id(self)] = new
```

## Anti-Pattern

> [!warning] Anti-pattern
> copy.deepcopy on objects with file handles, sockets, locks, or
> threading primitives. The copied resource is invalid. Implement __deepcopy__
> to drop the resource, OR refactor to a value type with no resources.

## Tips

- `lst[:]` and `list(lst)` are shallow copies — same as `copy.copy(lst)` for lists
- `dict.copy()` is also shallow — nested lists/dicts are still shared
- Use `deepcopy` when passing complex objects to functions that might modify them
- `deepcopy` can be slow on large or circular structures — profile before using in hot paths

## Common Mistake

> [!warning] Assuming `b = a.copy()` (or `b = a[:]`) gives a fully independent copy. These are *shallow* copies — nested mutable objects (like a list inside a list) are still shared.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    result.append(x * 2)
```

**Senior:**
```python
result = [x * 2 for x in items]
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]

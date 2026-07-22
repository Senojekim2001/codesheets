---
type: "entry"
domain: "python"
file: "oop"
section: "classes"
id: "repr-str"
title: "__repr__ vs __str__"
category: "Classes"
subtitle: "__repr__ for developers, __str__ for end users"
signature_short: "def __repr__(self) -> str: | def __str__(self) -> str:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "__repr__ vs __str__"
  - "repr-str"
tags:
  - "python"
  - "python/oop"
  - "python/oop/classes"
  - "category/classes"
  - "tier/tiered"
---

# __repr__ vs __str__

> __repr__ for developers, __str__ for end users

## Overview

__repr__ is the developer representation — shown in the REPL and used by repr(). It should ideally be a string that could recreate the object. __str__ is the user-facing string — used by print() and str(). If only __repr__ is defined, it is used as a fallback for __str__.

## Signature

```python
def __repr__(self) -> str: | def __str__(self) -> str:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - define only __repr__. It serves both repr() and (as a
#             fallback) print(), so one method covers most cases.
# STRENGTHS - immediately fixes the unhelpful default <object at 0x...>
#             output everywhere — REPL, logs, exception messages.
# WEAKNESSES- prints look exactly like the developer view; no separate
#             user-friendly format.
#
class Simple:
    def __init__(self, label):
        self.label = label
    def __repr__(self):
        return f"Simple({self.label!r})"

s = Simple("hi")
s             # Simple('hi')   — REPL uses __repr__
print(s)      # Simple('hi')   — falls back to __repr__
[s]           # [Simple('hi')] — containers use __repr__
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - define both: __repr__ for developers (round-trippable),
#             __str__ for end users (clean, readable). Show how Python
#             picks between them.
# STRENGTHS - covers the everyday case; the dual definition documents
#             intent (debug vs display) right in the class.
# WEAKNESSES- doesn't yet handle f-string format specs (e.g. f"{m:usd}")
#             — that needs __format__, shown next tier.
#
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        # developer-facing — should look like a constructor call
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        # user-facing — concise, no class name
        return f"({self.x}, {self.y})"

p = Point(3, 4)
repr(p)     # "Point(3, 4)"  — __repr__
str(p)      # "(3, 4)"       — __str__
print(p)    # (3, 4)         — __str__
f"{p}"      # "(3, 4)"       — __str__
f"{p!r}"    # "Point(3, 4)"  — !r forces __repr__
[p]         # [Point(3, 4)]  — containers always use __repr__
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - implement __format__ to participate in f-string format
#             specs, and use reprlib.recursive_repr() to keep __repr__
#             safe against cycles.
# STRENGTHS - lets the type integrate with formatting like a builtin
#             (f"{price:usd}"); cycle-safe repr prevents accidental
#             infinite recursion in logs.
# WEAKNESSES- __format__ contract is easy to get wrong (must return str,
#             must respect or reject the spec); only worth the cost on
#             types that flow into many format strings.
#
import reprlib

class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount, self.currency = amount, currency
    def __repr__(self) -> str:
        return f"Money({self.amount!r}, {self.currency!r})"
    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"
    def __format__(self, spec: str) -> str:
        if spec == "":      return str(self)
        if spec == "usd":   return f"${self.amount:,.2f}"
        if spec == "long":  return f"{self.amount:,.2f} {self.currency}"
        # delegate numeric specs (".4f", ",", etc.) to the underlying float
        return format(self.amount, spec)

m = Money(1234.5)
f"{m}"          # "1234.50 USD"
f"{m:usd}"      # "$1,234.50"
f"{m:long}"     # "1,234.50 USD"
f"{m:,.0f}"     # "1,234"   — float format spec passed through

class Tree:
    def __init__(self): self.children = [self]   # cycle on purpose
    @reprlib.recursive_repr()
    def __repr__(self):
        return f"Tree({self.children!r})"

repr(Tree())    # 'Tree([...])' — recursion guarded by reprlib
#
# Decision rule:
#   only have time for one method                    -> __repr__ (covers print() too)
#   debugging output / logs / error messages         -> __repr__ — round-trippable
#   end-user display (print, str(), CLI output)      -> __str__
#   participate in f-string format specs             -> __format__
#   container with cycles (graphs, trees)            -> @reprlib.recursive_repr()
#   value type with many fields                      -> @dataclass — generates __repr__
#   force developer view inside an f-string          -> f"{obj!r}"
#
# Anti-pattern: defining only __str__ for "pretty" output
#   Containers (lists, dicts, sets) and the REPL call __repr__, not __str__.
#   So your nicely formatted __str__ never shows up in [obj] or
#   {"key": obj}, and exception tracebacks display the unhelpful default
#   <Class object at 0x...>. Always define __repr__ first; add __str__ only
#   when end-user output differs from the developer view.
```

## Decision Rule

```text
only have time for one method                    -> __repr__ (covers print() too)
debugging output / logs / error messages         -> __repr__ — round-trippable
end-user display (print, str(), CLI output)      -> __str__
participate in f-string format specs             -> __format__
container with cycles (graphs, trees)            -> @reprlib.recursive_repr()
value type with many fields                      -> @dataclass — generates __repr__
force developer view inside an f-string          -> f"{obj!r}"
```

## Anti-Pattern

> [!warning] Anti-pattern
> defining only __str__ for "pretty" output
>   Containers (lists, dicts, sets) and the REPL call __repr__, not __str__.
>   So your nicely formatted __str__ never shows up in [obj] or
>   {"key": obj}, and exception tracebacks display the unhelpful default
>   <Class object at 0x...>. Always define __repr__ first; add __str__ only
>   when end-user output differs from the developer view.

## Tips

- Always define __repr__ — it is used in the REPL, logging, and debugging
- __repr__ should produce a string that looks like a constructor call when possible: `ClassName(arg1, arg2)`
- If you only have time to define one, define __repr__ — it serves as the fallback for __str__
- Use !r in f-strings to force __repr__: `f"{obj!r}"` — useful in __repr__ to quote string fields

## Common Mistake

> [!warning] Only defining __str__ and forgetting __repr__. When objects appear in lists, dicts, or the REPL, Python uses __repr__ — you will see the unhelpful default <__main__.ClassName object at 0x...>.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/oop/classes/class-def|class definition (Object-Oriented Python)]]
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables (Object-Oriented Python)]]
- [[Sections/oop/classes/inheritance|Inheritance (Object-Oriented Python)]]
- [[Sections/oop/classes/super|super() (Object-Oriented Python)]]
- [[Sections/oop/classes/_Index|Object-Oriented Python → Classes & Instances]]
- [[Sections/oop/_Index|Object-Oriented Python index]]
- [[_Index|Vault index]]

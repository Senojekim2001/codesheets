---
type: "entry"
domain: "python"
file: "typing"
section: "type-narrowing"
id: "assert-never"
title: "assert_never & Never — Exhaustive Type Checking"
category: "Type Guards"
subtitle: "Never, assert_never, exhaustive matching, unreachable code (NoReturn is now an alias for Never since 3.11)"
signature_short: "from typing import Never  |  assert_never(x)  |  def impossible() -> Never: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "assert_never & Never — Exhaustive Type Checking"
  - "assert-never"
tags:
  - "python"
  - "python/typing"
  - "python/typing/type-narrowing"
  - "category/type-guards"
  - "tier/tiered"
---

# assert_never & Never — Exhaustive Type Checking

> Never, assert_never, exhaustive matching, unreachable code (NoReturn is now an alias for Never since 3.11)

## Overview

Never is a type with no values — a function returning Never never returns (or raises). assert_never(x) asserts that x can never be reached. Use both for exhaustive matching: if you handle all union variants, the final else case has type Never. This catches bugs where new union members are added but not handled. Essential for state machines and event handlers.

## Signature

```python
from typing import Never  |  assert_never(x)  |  def impossible() -> Never: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Use Literal for the closed set, branch on each value, end with assert_never to catch missed cases.
# STRENGTHS - Adding a new status anywhere triggers a compile-time error in every handler.
# WEAKNESSES- assert_never raises at runtime if you actually hit it -- treat as "this should be unreachable".
from typing import Literal, assert_never

Status = Literal["pending", "running", "done", "error"]

def label(s: Status) -> str:
    if s == "pending":   return "Waiting"
    if s == "running":   return "Working"
    if s == "done":      return "OK"
    if s == "error":     return "Failed"
    assert_never(s)      # mypy error if a Status variant is missed
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Never marks "this returns nowhere"; pair with assert_never on subclass / TypedDict unions.
# STRENGTHS - Helper functions that raise (raise_error) make business logic linear; mypy keeps narrowing through them.
# WEAKNESSES- Never IS NOT None; functions returning None still need a body that returns. Don't confuse the two.
from typing import Literal, Never, TypedDict, assert_never

# A helper that always raises is typed as -> Never.
def die(msg: str) -> Never:
    raise RuntimeError(msg)

def must_exist(value: str | None) -> str:
    if value is None:
        die("missing value")     # mypy: this branch can't fall through
    return value                 # narrowed: str

# Exhaustive subclass union.
class Click:
    def __init__(self, x: int, y: int): self.x, self.y = x, y
class Key:
    def __init__(self, k: str): self.k = k
Event = Click | Key

def render(e: Event) -> str:
    if isinstance(e, Click): return f"({e.x},{e.y})"
    if isinstance(e, Key):   return e.k
    assert_never(e)

# Tagged TypedDict union.
class _Sub(TypedDict): kind: Literal["sub"]; user: str
class _Pub(TypedDict): kind: Literal["pub"]; topic: str
Msg = _Sub | _Pub

def route(m: Msg) -> str:
    if m["kind"] == "sub": return m["user"]
    if m["kind"] == "pub": return m["topic"]
    assert_never(m)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - match/case + assert_never for state machines; Never propagates through helpers; never put logic in the assert_never branch.
# STRENGTHS - Compiler-enforced exhaustiveness across whole-program changes; refactors that add a state never silently miss a handler.
# WEAKNESSES- Older Python (< 3.11) imports assert_never from typing_extensions; check your minimum.
from __future__ import annotations
from dataclasses import dataclass
from typing import Literal, Never, assert_never

# 1) State machine with sealed union -- adding a state breaks every dispatch.
@dataclass(frozen=True, slots=True)
class Idle:    kind: Literal["idle"]    = "idle"
@dataclass(frozen=True, slots=True)
class Running: kind: Literal["running"] = "running"; pid: int = 0
@dataclass(frozen=True, slots=True)
class Failed:  kind: Literal["failed"]  = "failed";  err: str = ""
State = Idle | Running | Failed

def step(s: State) -> State:
    match s:
        case Idle():               return Running(pid=42)
        case Running(pid=p):       return Idle() if p == 0 else Failed(err="oom")
        case Failed(err=_):        return Idle()
        case _:                    assert_never(s)        # static guarantee

# 2) Never composes with narrowing helpers.
def fatal(msg: str, *, code: int = 1) -> Never:
    import sys; sys.stderr.write(msg + "\n"); sys.exit(code)

def open_required(path: str) -> bytes:
    try:
        with open(path, "rb") as f: return f.read()
    except FileNotFoundError:
        fatal(f"missing: {path}")     # mypy: rest of function unreachable on this path

# 3) Anti-bypass guard: if you find yourself adding a 'default' case that DOES
#    something other than assert_never, your union is wrong. Add the variant
#    explicitly or split the function.

# Decision rule:
#   closed set of strings / ints     -> Literal[...] union, branch + assert_never
#   sealed object hierarchy          -> dataclass / frozen classes + Literal tag, match/case
#   helper that always raises/exits  -> -> Never (lets caller continue narrowed)
#   "should never get here, but..."  -> assert_never with the variable as arg (mypy reports type)
#                                       NOT raise NotImplementedError (no compile-time check)
#   open hierarchy (3rd-party adds)  -> don't claim exhaustiveness; handle default sanely
#
# Anti-pattern: 'else: pass' or 'else: raise NotImplementedError' on a closed
# union. mypy will not warn when a new variant is added. assert_never is the
# ONLY else-branch that turns "missing a case" into a build-break.
```

## Decision Rule

```text
closed set of strings / ints     -> Literal[...] union, branch + assert_never
sealed object hierarchy          -> dataclass / frozen classes + Literal tag, match/case
helper that always raises/exits  -> -> Never (lets caller continue narrowed)
"should never get here, but..."  -> assert_never with the variable as arg (mypy reports type)
                                    NOT raise NotImplementedError (no compile-time check)
open hierarchy (3rd-party adds)  -> don't claim exhaustiveness; handle default sanely
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'else: pass' or 'else: raise NotImplementedError' on a closed
> union. mypy will not warn when a new variant is added. assert_never is the
> ONLY else-branch that turns "missing a case" into a build-break.

## Tips

- assert_never is a debugging tool and code documentation — it explicitly says "all cases should be handled above".
- Use Literal unions (not regular Enum) for the clearest exhaustive checking — mypy tracks Literal variants precisely.
- Never type is rarely used directly — it's useful for marking functions that never return (infinite loops, exits, exceptions).
- Exhaustive matching catches bugs when adding new union variants — forces you to update all handlers.

## Common Mistake

> [!warning] Forgetting to handle a union case — mypy won't always catch it unless you use assert_never. The safer pattern is Literal unions with explicit case handling.

## Shorthand (Junior → Senior)

**Junior:**
```python
Status = Union["pending", "running", "done"]

def handle(s: Status):
    if s == "pending": ...
    elif s == "running": ...
    # Missing "done" case — no type error!
```

**Senior:**
```python
Status = Literal["pending", "running", "done"]

def handle(s: Status):
    if s == "pending": ...
    elif s == "running": ...
    elif s == "done": ...
    else:
        assert_never(s)  # mypy error if case missing
```

## See Also

- [[Sections/typing/type-narrowing/isinstance-narrowing|isinstance & issubclass Narrowing — Union Type Refinement (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/typeguard|TypeGuard & TypeIs — Custom Type Narrowing Functions (Type Hints & mypy)]]
- [[Sections/typing/type-narrowing/_Index|Type Hints & mypy → Type Narrowing & Guards]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

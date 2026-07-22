---
type: "entry"
domain: "python"
file: "typing"
section: "advanced-generics"
id: "typevaruple"
title: "TypeVarTuple & Unpack — Variadic Generics"
category: "Advanced Generics"
subtitle: "TypeVarTuple, Unpack, *args, variadic generics, tuple unpacking"
signature_short: "Ts = TypeVarTuple(\"Ts\")  |  def func(*args: *Ts) -> tuple[*Ts]  |  Unpack[Ts]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "TypeVarTuple & Unpack — Variadic Generics"
  - "typevaruple"
tags:
  - "python"
  - "python/typing"
  - "python/typing/advanced-generics"
  - "category/advanced-generics"
  - "tier/tiered"
---

# TypeVarTuple & Unpack — Variadic Generics

> TypeVarTuple, Unpack, *args, variadic generics, tuple unpacking

## Overview

TypeVarTuple and Unpack enable typing variable-length type sequences. Use Ts = TypeVarTuple("Ts") to capture *args types. Unpack[Ts] unpacks them in tuples and function signatures. Essential for typed *args, concatenate tuples with different types, and generic variadic functions. Python 3.11+ feature.

## Signature

```python
Ts = TypeVarTuple("Ts")  |  def func(*args: *Ts) -> tuple[*Ts]  |  Unpack[Ts]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - TypeVarTuple captures a sequence of types; Unpack/* spreads it in tuples and signatures.
# STRENGTHS - Variadic functions stay typed: tuple-of-mixed types preserved end to end.
# WEAKNESSES- Python 3.11+ only; older versions need typing_extensions.
from typing import TypeVarTuple

Ts = TypeVarTuple("Ts")

def make_tuple(*args: *Ts) -> tuple[*Ts]:
    return args

a: tuple[int, str]               = make_tuple(1, "hello")
b: tuple[int, float, str]        = make_tuple(1, 2.0, "x")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Mix concrete types with *Ts to model "head + variadic tail" patterns (drop first dim, prepend axis, etc.).
# STRENGTHS - NumPy/JAX-style shape arithmetic without Any; Array[int, int, int] -> Array[int, int].
# WEAKNESSES- Real shape libraries also need integer LITERALs in types -- TypeVarTuple alone doesn't give you static dimensions.
from typing import TypeVarTuple

Shape = TypeVarTuple("Shape")

# Drop leading axis: tuple[int, *Shape] -> tuple[*Shape]
def squeeze(arr: tuple[int, *Shape]) -> tuple[*Shape]:
    return arr[1:]

s3: tuple[int, int, int] = (2, 3, 4)
s2: tuple[int, int]      = squeeze(s3)

# Prepend an axis.
def add_axis(arr: tuple[*Shape]) -> tuple[int, *Shape]:
    return (1, *arr)

# Generic class with variadic shape.
class Array(tuple[*Shape]):
    pass

m: Array[int, int]      = Array((2, 3))         # rank-2
v: Array[int]           = Array((5,))            # rank-1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Reach for TypeVarTuple at array-shape boundaries; for everything else, stick with TypeVar/Generic.
# STRENGTHS - Eliminates Any in tensor / batched-API libraries; documents shape contracts in signatures.
# WEAKNESSES- The type checker support is younger than ParamSpec/TypeVar; complex shape arithmetic still surprises tools.
from __future__ import annotations
from typing import Generic, TypeVar, TypeVarTuple

# 1) Pair TypeVar with TypeVarTuple to type "dtype + shape" together.
DType = TypeVar("DType")
Shape = TypeVarTuple("Shape")

class NDArray(Generic[DType, *Shape]):
    """Tensor-like with explicit dtype and rank in its type."""
    def __init__(self, data: object, shape: tuple[*Shape]) -> None:
        self.data = data
        self.shape = shape

    def transpose_2d(self: NDArray[DType, int, int]) -> NDArray[DType, int, int]:
        # Method available ONLY on rank-2 arrays. mypy refuses for other ranks.
        ...
        return self

    def squeeze0(self: NDArray[DType, int, *Shape]) -> NDArray[DType, *Shape]:
        return NDArray(self.data, self.shape[1:])

# 2) Variadic Concat -- preserve all inputs' types.
def concat(*xs: *Shape) -> tuple[*Shape]:
    return xs

a, b = concat(1, "x")            # mypy: tuple[int, str]

# 3) Common pitfall: only ONE TypeVarTuple per generic. Need two? Use TypeVar.
#    e.g., (Inputs, Outputs) for a function type -> use Callable, not two *Ts.

# Decision rule:
#   typed *args of mixed types          -> TypeVarTuple
#   shape-aware tensor wrappers          -> NDArray[DType, *Shape] pattern
#   one type repeated N times            -> tuple[T, ...] (variadic of single T) -- NOT TypeVarTuple
#   "function takes a record's fields"   -> dataclass + Self / TypedDict, not TypeVarTuple
#
# Anti-pattern: TypeVarTuple where tuple[T, ...] would do. tuple[int, ...]
# already encodes "any length, all int"; reaching for TypeVarTuple here only
# hides that fact and slows the type checker.
```

## Decision Rule

```text
typed *args of mixed types          -> TypeVarTuple
shape-aware tensor wrappers          -> NDArray[DType, *Shape] pattern
one type repeated N times            -> tuple[T, ...] (variadic of single T) -- NOT TypeVarTuple
"function takes a record's fields"   -> dataclass + Self / TypedDict, not TypeVarTuple
```

## Anti-Pattern

> [!warning] Anti-pattern
> TypeVarTuple where tuple[T, ...] would do. tuple[int, ...]
> already encodes "any length, all int"; reaching for TypeVarTuple here only
> hides that fact and slows the type checker.

## Tips

- TypeVarTuple is advanced — most code doesn't need it. Use for generic *args functions and shape-preserving libraries.
- Older syntax is `Unpack[Ts]`; the `*Ts` shorthand is the 3.11+ form. Prefer `*Ts` when your minimum Python supports it.
- TypeVarTuple preserves tuple structure through operations — essential for NumPy-like libraries.

## Common Mistake

> [!warning] Using regular TypeVar for *args — TypeVar[T] doesn't capture variable sequences. Use TypeVarTuple[Ts] instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
def concat(a, b):
    # Can't type this properly without TypeVarTuple
    return a + b
```

**Senior:**
```python
Ts = TypeVarTuple("Ts")

def concat(a: tuple[*Ts], b: tuple[*Ts]) -> tuple[*Ts, *Ts]:
    return a + b
```

## See Also

- [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class (Type Hints & mypy)]]
- [[Sections/typing/advanced-generics/_Index|Type Hints & mypy → Advanced Generics]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

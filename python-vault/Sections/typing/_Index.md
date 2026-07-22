---
type: "file-index"
domain: "python"
file: "typing"
title: "Type Hints & mypy"
tags:
  - "python"
  - "python/typing"
  - "index"
---

# Type Hints & mypy

> 15 entries across 6 sections.

## Core Type Hints & Annotations · 2

- [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections]] — Annotate Python code with types: basic types, collections, unions, Optional, and function signatures.
- [[Sections/typing/core-typing/advanced-annotations|Advanced Types — Literal, TypedDict, Annotated & Overload]] — Precise typing with Literal values, TypedDict for dictionaries, Annotated for metadata, and overloaded function signatures.

## Generics & Protocols · 2

- [[Sections/typing/generics-protocols/typevar-generics|TypeVar & Generics — Parameterized Types]] — Write generic functions and classes: TypeVar, ParamSpec, bound constraints, and Python 3.12 syntax.
- [[Sections/typing/generics-protocols/protocol|Protocol — Structural Typing (Duck Typing with Types)]] — Define interfaces via structural typing: Protocol classes, runtime_checkable, and replacing ABCs.

## mypy Configuration & Patterns · 1

- [[Sections/typing/mypy/mypy-config|mypy — Configuration, Strict Mode & Common Patterns]] — Configure and run mypy effectively: strict mode, per-module overrides, ignoring errors, and CI integration.

## Type Narrowing & Guards · 3

- [[Sections/typing/type-narrowing/isinstance-narrowing|isinstance & issubclass Narrowing — Union Type Refinement]] — Use isinstance() and issubclass() to narrow Union types and guide mypy type inference.
- [[Sections/typing/type-narrowing/typeguard|TypeGuard & TypeIs — Custom Type Narrowing Functions]] — Write custom type-narrowing functions with TypeGuard and TypeIs for domain-specific type refinement.
- [[Sections/typing/type-narrowing/assert-never|assert_never & Never — Exhaustive Type Checking]] — Ensure all union cases are handled: Never type and assert_never() for exhaustive matching.

## Advanced Generics · 4

- [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions]] — Preserve function signatures in decorators and callbacks: ParamSpec and Concatenate.
- [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics]] — Type variable-length type sequences: TypeVarTuple and Unpack for *args and tuple unpacking.
- [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance]] — Define generic class hierarchies: Generic[T, U], covariance, contravariance, and __class_getitem__.
- [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class]] — Use Self type for methods that return the current instance: fluent APIs, copy constructors, and factory methods.

## Runtime Type Checking · 3

- [[Sections/typing/runtime-types/get-type-hints|get_type_hints & Type Introspection — Reflection at Runtime]] — Extract and inspect type annotations at runtime: get_type_hints, get_origin, get_args, and __annotations__.
- [[Sections/typing/runtime-types/runtime-checkable|@runtime_checkable Protocol — isinstance() Type Checking]] — Check Protocol compliance at runtime: @runtime_checkable enables isinstance() on structural types.
- [[Sections/typing/runtime-types/dataclass-typed|Typed Dataclasses — Type Hints + Data Structures]] — Use @dataclass with type hints for automatic __init__, repr, comparison, and slots.

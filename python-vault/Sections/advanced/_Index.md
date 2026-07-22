---
type: "file-index"
domain: "python"
file: "advanced"
title: "Advanced Python"
tags:
  - "python"
  - "python/advanced"
  - "index"
---

# Advanced Python

> 16 entries across 6 sections.

## Decorators · 2

- [[Sections/advanced/decorators/function-decorators|Function Decorators — Wrapping & Enhancing Functions]] — Add behavior to functions without modifying them — logging, caching, authentication, retry, and timing.
- [[Sections/advanced/decorators/class-decorators|Class Decorators & Descriptor Protocol]] — Decorate classes to add methods, enforce contracts, or register classes — plus the descriptor protocol for custom attributes.

## Context Managers & Generators · 2

- [[Sections/advanced/context-managers/context-manager-patterns|Context Managers — Resource Management & State]] — Ensure cleanup with with statements — files, locks, database connections, temporary state changes.
- [[Sections/advanced/context-managers/generators-advanced|Advanced Generators & Itertools]] — Lazy evaluation, generator pipelines, itertools recipes, and memory-efficient data processing.

## Pathlib & Logging · 2

- [[Sections/advanced/pathlib-logging/pathlib-patterns|pathlib — Modern File Path Handling]] — Object-oriented filesystem paths — reading, writing, globbing, and path manipulation without os.path.
- [[Sections/advanced/pathlib-logging/logging-config|logging — Structured Application Logging]] — Production logging with levels, formatters, handlers, and structured output — replaces print() debugging.

## Typing & Dataclasses · 2

- [[Sections/advanced/typing-dataclasses/typing-advanced|Advanced Type Hints — Protocols, TypeVar, Overload]] — Structural typing with Protocol, generic functions with TypeVar, and precise overloads for complex APIs.
- [[Sections/advanced/typing-dataclasses/dataclasses-advanced|Dataclasses — Advanced Patterns]] — Beyond basic @dataclass — frozen classes, field factories, post_init, slots, and Pydantic comparison.

## Metaprogramming · 4

- [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation]] — Control how classes are created using type() and custom metaclasses — advanced class modification at definition time.
- [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes]] — Implement __get__, __set__, __delete__ to create reusable attribute behaviors — properties, validators, lazy attributes.
- [[Sections/advanced/metaprogramming/slots-advanced|__slots__ — Memory Optimization]] — Prevent dynamic attributes and reduce memory with __slots__ — trades flexibility for efficiency.
- [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement]] — Define interfaces with abc.ABC and @abstractmethod — enforce that subclasses implement required methods.

## Advanced Patterns · 4

- [[Sections/advanced/advanced-patterns-py/singleton-pattern|Singleton Pattern — Global Unique Instance]] — Ensure a class has only one instance — via metaclass, module-level, or __new__ override.
- [[Sections/advanced/advanced-patterns-py/observer-pattern|Observer Pattern — Event System & Pub/Sub]] — Notify multiple observers of state changes — simple pub/sub with callbacks and weakref.
- [[Sections/advanced/advanced-patterns-py/mixin-pattern|Mixin Pattern — Composable Behaviors]] — Use mixin classes to compose reusable behaviors via multiple inheritance — cleaner than deep hierarchies.
- [[Sections/advanced/advanced-patterns-py/dataclass-advanced|Dataclasses Advanced — Frozen, Post Init, Inheritance]] — @dataclass(frozen=True) for immutability, __post_init__ for validation, field() for flexibility.

---
type: "file-index"
domain: "python"
file: "oop"
title: "Object-Oriented Python"
tags:
  - "python"
  - "python/oop"
  - "index"
---

# Object-Oriented Python

> 19 entries across 3 sections.

## Classes & Instances · 9

- [[Sections/oop/classes/class-def|class definition]] — Define a class with __init__ and methods.
- [[Sections/oop/classes/class-instance-vars|Class vs instance variables]] — Class variables are shared across instances; instance variables belong to each object.
- [[Sections/oop/classes/inheritance|Inheritance]] — Create subclasses that extend parent classes.
- [[Sections/oop/classes/super|super()]] — Delegate method calls to the parent class.
- [[Sections/oop/classes/mro|Multiple inheritance / MRO]] — Inherit from multiple parents — Method Resolution Order determines lookup.
- [[Sections/oop/classes/mixin|Mixin pattern]] — Small reusable classes that add behavior via multiple inheritance.
- [[Sections/oop/classes/metaclass|Metaclasses]] — Classes that control how other classes are created.
- [[Sections/oop/classes/dunder|Dunder methods]] — Magic methods for operator overloading and protocols.
- [[Sections/oop/classes/repr-str|__repr__ vs __str__]] — Control how objects are displayed in the shell, print(), and format strings.

## Properties & Descriptors · 5

- [[Sections/oop/properties/property|@property]] — Managed attributes with getters and setters.
- [[Sections/oop/properties/descriptors|Descriptors]] — Reusable attribute access logic via __get__, __set__, __delete__.
- [[Sections/oop/properties/classmethod|@classmethod]] — Method that receives the class as its first argument — used for factory methods.
- [[Sections/oop/properties/staticmethod|@staticmethod]] — Method that receives neither self nor cls — a plain function in the class namespace.
- [[Sections/oop/properties/protocol-oop|Protocol]] — Define structural interfaces — duck typing with static type checking.

## Modern Patterns · 5

- [[Sections/oop/dataclasses/dataclass|@dataclass]] — Auto-generate __init__, __repr__, __eq__ from fields.
- [[Sections/oop/dataclasses/slots|__slots__]] — Restrict instance attributes and reduce memory usage.
- [[Sections/oop/dataclasses/enum|Enum]] — Define a set of named, immutable constants.
- [[Sections/oop/dataclasses/context-manager|Context managers]] — Custom with-statement support using __enter__ / __exit__.
- [[Sections/oop/dataclasses/dataclasses|dataclasses (Data Classes)]] — Auto-generate __init__, __repr__, __eq__ for data containers.

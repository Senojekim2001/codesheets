---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "sqlalchemy-models"
title: "SQLAlchemy models"
category: "FastAPI"
subtitle: "DeclarativeBase + mapped_column — SQLAlchemy 2.0 style"
signature_short: "class User(Base): id: Mapped[int] = mapped_column(primary_key=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SQLAlchemy models"
  - "sqlalchemy-models"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# SQLAlchemy models

> DeclarativeBase + mapped_column — SQLAlchemy 2.0 style

## Overview

SQLAlchemy ORM maps Python classes to database tables. The modern (2.0+) API uses DeclarativeBase and Mapped[type] annotations. Relationships link models and enable lazy/eager loading of related objects.

## Signature

```python
class User(Base): id: Mapped[int] = mapped_column(primary_key=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - DeclarativeBase + Mapped[] + mapped_column — SQLAlchemy 2.0 style
# STRENGTHS - Smallest valid model file
# WEAKNESSES- No relationships, no indexes
#
from sqlalchemy import String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True)

engine = create_engine("sqlite:///app.db")
Base.metadata.create_all(engine)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two related models with bidirectional relationship + selectin loading
# STRENGTHS - The shape every real ORM file converges on
# WEAKNESSES- No constraints / indexes; no Alembic migration
#
from sqlalchemy import String, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Department(Base):
    __tablename__ = "departments"
    id:   Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    # selectin avoids the N+1 trap when iterating dept.employees
    employees: Mapped[list["Employee"]] = relationship(
        back_populates="dept", lazy="selectin",
    )

class Employee(Base):
    __tablename__ = "employees"
    id:      Mapped[int]              = mapped_column(primary_key=True)
    name:    Mapped[str]              = mapped_column(String(200))
    email:   Mapped[str]              = mapped_column(String(200), unique=True)
    salary:  Mapped[int]              = mapped_column(default=0)
    dept_id: Mapped[int | None]       = mapped_column(ForeignKey("departments.id"))
    dept:    Mapped["Department | None"] = relationship(back_populates="employees")

engine = create_engine("postgresql+psycopg://user:pw@host/db")
Base.metadata.create_all(engine)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Constraints, indexes, server defaults, mixins, type maps, Alembic
# STRENGTHS - The patterns that make schemas correct AND fast
# WEAKNESSES- N/A
#
from datetime import datetime
from sqlalchemy import (
    String, ForeignKey, Index, UniqueConstraint, CheckConstraint,
    func, text, create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, declared_attr,
)

# 1) Mixin — every table gets created/updated/deleted_at without copy-paste
class TimestampedMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), server_onupdate=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(default=None)

class Base(DeclarativeBase):
    # 2) Map Python types to SQL types in ONE place
    type_annotation_map = {str: String(255)}             # all str cols become varchar(255)

class Department(TimestampedMixin, Base):
    __tablename__ = "departments"
    id:   Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    employees: Mapped[list["Employee"]] = relationship(
        back_populates="dept", lazy="selectin", cascade="all, delete-orphan",
    )

class Employee(TimestampedMixin, Base):
    __tablename__ = "employees"
    id:      Mapped[int]            = mapped_column(primary_key=True)
    name:    Mapped[str]
    email:   Mapped[str]
    salary:  Mapped[int]
    # PROTECT prevents deleting a dept that still has employees
    dept_id: Mapped[int | None]     = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"),
    )
    dept:    Mapped["Department | None"] = relationship(back_populates="employees")

    # 3) Composite index + constraints at the table level
    __table_args__ = (
        UniqueConstraint("email", name="uq_employees_email"),
        Index("ix_employees_dept_salary", "dept_id", "salary"),
        CheckConstraint("salary >= 0", name="ck_employees_salary_nonneg"),
    )

# 4) Migrations live in Alembic, not Base.metadata.create_all in production
#    $ alembic init migrations
#    $ alembic revision --autogenerate -m "add employees.salary check"
#    $ alembic upgrade head

# Decision rule:
#   shared timestamp / soft-delete columns       -> mixin class
#   one Python type -> one SQL type project-wide  -> type_annotation_map on Base
#   parent without parent column                   -> ondelete="RESTRICT" / "PROTECT" semantics
#   queries always filter by (a, b)                -> composite Index in __table_args__
#   any invariant the DB must enforce              -> CheckConstraint / UniqueConstraint
#   schema changes after first deploy              -> Alembic, not create_all
#
# Anti-pattern: Base.metadata.create_all(engine) in app startup
#   It's idempotent for adds but NEVER drops or migrates columns. The schema
#   silently drifts from the code. Use Alembic from day one.
```

## Decision Rule

```text
shared timestamp / soft-delete columns       -> mixin class
one Python type -> one SQL type project-wide  -> type_annotation_map on Base
parent without parent column                   -> ondelete="RESTRICT" / "PROTECT" semantics
queries always filter by (a, b)                -> composite Index in __table_args__
any invariant the DB must enforce              -> CheckConstraint / UniqueConstraint
schema changes after first deploy              -> Alembic, not create_all
```

## Anti-Pattern

> [!warning] Anti-pattern
> Base.metadata.create_all(engine) in app startup
>   It's idempotent for adds but NEVER drops or migrates columns. The schema
>   silently drifts from the code. Use Alembic from day one.

## Tips

- `Mapped[int | None]` is a nullable column — `Mapped[int]` is NOT NULL
- `relationship(back_populates="...")` creates the bidirectional link between models
- `relationship(lazy="selectin")` avoids N+1 queries — loads related objects in one extra query
- Always call `Base.metadata.create_all(engine)` to create tables before using the app

## Common Mistake

> [!warning] Using `relationship(lazy="select")` (the default) with nested loops. For every parent object, SQLAlchemy executes a separate query for children — N+1 problem. Use `lazy="selectin"` or `eager` loading.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sqlalchemy import create_engine, String, ForeignKey
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column,
relationship, sessionmaker)
engine     = create_engine("postgresql://user:pass@host/db")
```

**Senior:**
```python
Base.metadata.create_all(engine)
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

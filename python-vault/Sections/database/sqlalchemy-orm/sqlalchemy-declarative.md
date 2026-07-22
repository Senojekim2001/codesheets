---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-declarative"
title: "Declarative Models — DeclarativeBase + Mapped[T]"
category: "ORM Setup"
subtitle: "DeclarativeBase, Mapped[T], mapped_column, primary_key, relationship, table args"
signature_short: "class User(Base): id: Mapped[int] = mapped_column(primary_key=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Declarative Models — DeclarativeBase + Mapped[T]"
  - "sqlalchemy-declarative"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-setup"
  - "tier/tiered"
---

# Declarative Models — DeclarativeBase + Mapped[T]

> DeclarativeBase, Mapped[T], mapped_column, primary_key, relationship, table args

## Overview

SQLAlchemy 2.0 introduced type-driven model declarations: subclass DeclarativeBase, annotate columns as Mapped[T], use mapped_column() for column metadata. The annotations drive both the schema and mypy/pyright. Far cleaner than the legacy Column() syntax. Optional[T] / T | None makes columns nullable; default makes them have a Python-side default.

## Signature

```python
class User(Base): id: Mapped[int] = mapped_column(primary_key=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Subclass DeclarativeBase; annotate columns with Mapped[T].
# STRENGTHS - One source of truth: types drive both DB schema AND IDE autocomplete.
# WEAKNESSES- Pre-2.0 docs use Column(...) syntax; mixing styles confuses readers.
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str]
    email: Mapped[str | None]                    # nullable from typing alone

Base.metadata.create_all(ENGINE)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Add server defaults, indexes, unique constraints, server timestamps.
# STRENGTHS - The DB enforces correctness; Python defaults are a fallback.
# WEAKNESSES- server_default is a SQL string; Python-side default values do NOT propagate to the DB.
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, func, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id:    Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name:  Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id:        Mapped[int] = mapped_column(primary_key=True)
    title:     Mapped[str] = mapped_column(String(200))
    body:      Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    author:    Mapped["User"] = relationship(back_populates="posts")

    __table_args__ = (Index("ix_posts_author_created", "author_id", "id"),)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Annotated types for repeated patterns; mixin classes for shared columns; AbstractConcrete for inheritance; UUID PKs for distributed systems.
# STRENGTHS - Type-driven schema with zero repetition; mixins compose; UUIDs survive merges and shards.
# WEAKNESSES- TypeAlias-style annotated types require Python 3.9+; pre-3.9 use the long form.
from __future__ import annotations
from datetime import datetime
from typing import Annotated
from uuid import UUID, uuid4
from sqlalchemy import String, ForeignKey, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Reusable column types -- declare once, use everywhere.
intpk = Annotated[int, mapped_column(primary_key=True)]
uuidpk = Annotated[UUID, mapped_column(primary_key=True, default=uuid4)]
str_short = Annotated[str, mapped_column(String(80))]
str_long = Annotated[str, mapped_column(String(2000))]
created = Annotated[datetime, mapped_column(server_default=func.now())]
updated = Annotated[datetime, mapped_column(
    server_default=func.now(), onupdate=func.now()
)]

class Base(DeclarativeBase):
    pass

# Mixin shared by every entity with audit timestamps.
class TimestampMixin:
    created_at: Mapped[created]
    updated_at: Mapped[updated]

# Mixin for soft-delete pattern.
class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(default=None, index=True)

class Account(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "accounts"

    id:    Mapped[uuidpk]                              # UUID PK across regions
    email: Mapped[str_short] = mapped_column(unique=True, index=True)
    name:  Mapped[str_short]
    plan:  Mapped[str_short] = mapped_column(server_default=text("'free'"))
    api_key_hash: Mapped[str_long]                      # never store the raw key

    # Active-only query helper.
    @classmethod
    def active(cls):
        return cls.deleted_at.is_(None)

# Decision rule:
#   primary key for distributed systems   -> UUID v7 (time-sortable) or UUID v4
#   primary key for monolith              -> bigint autoincrement (smaller, faster joins)
#   timestamps                            -> server_default=func.now() — DB clock, not Python clock
#   nullable column                        -> Mapped[T | None]; lets typing drive nullability
#   shared columns across many models     -> mixin classes; not abstract base classes
#   soft delete                           -> deleted_at: datetime | None + index + helper
#   string length                         -> ALWAYS specify; "VARCHAR" alone defaults to TEXT in PG, MEDIUMTEXT in MySQL
#   enums                                 -> SQLAlchemy Enum with native_enum=False (portable + alembic-friendly)
#   JSON columns                          -> Mapped[dict] with mapped_column(JSON); typed via TypedDict for clarity
#
# Anti-pattern: per-row created_at written from Python (default=datetime.now)
# rather than the database (server_default=func.now()). Clock drift between
# app servers means rows that arrived seconds apart can be timestamped out of
# order. Always let the DB stamp time.
```

## Decision Rule

```text
primary key for distributed systems   -> UUID v7 (time-sortable) or UUID v4
primary key for monolith              -> bigint autoincrement (smaller, faster joins)
timestamps                            -> server_default=func.now() — DB clock, not Python clock
nullable column                        -> Mapped[T | None]; lets typing drive nullability
shared columns across many models     -> mixin classes; not abstract base classes
soft delete                           -> deleted_at: datetime | None + index + helper
string length                         -> ALWAYS specify; "VARCHAR" alone defaults to TEXT in PG, MEDIUMTEXT in MySQL
enums                                 -> SQLAlchemy Enum with native_enum=False (portable + alembic-friendly)
JSON columns                          -> Mapped[dict] with mapped_column(JSON); typed via TypedDict for clarity
```

## Anti-Pattern

> [!warning] Anti-pattern
> per-row created_at written from Python (default=datetime.now)
> rather than the database (server_default=func.now()). Clock drift between
> app servers means rows that arrived seconds apart can be timestamped out of
> order. Always let the DB stamp time.

## Tips

- Use `Annotated[type, mapped_column(...)]` aliases for columns you repeat (PKs, timestamps, audit fields). DRY columns, type-driven schemas.
- Mixin classes (TimestampMixin, SoftDeleteMixin) compose better than abstract base classes — multiple mixins, no MRO surprises.
- String columns without an explicit length default to unbounded TEXT/CLOB on most engines. Always pass `String(N)` or accept the consequences.
- For Postgres-specific types (JSONB, ARRAY), import from `sqlalchemy.dialects.postgresql` rather than the portable `JSON` type — gets you indexable JSONB.
- `__table_args__` with composite indexes is how you tune query performance; declare them at model-definition time, not in Alembic afterthoughts.

## Common Mistake

> [!warning] Declaring nullable columns implicitly via `default=None` instead of through the type. `Mapped[str]` says "NOT NULL"; `Mapped[str | None]` says "NULL allowed". Mixing them up generates schemas that disagree with the type hints.

## Shorthand (Junior → Senior)

**Junior:**
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    email = Column(String(255), nullable=True)
```

**Senior:**
```python
class User(Base):
    __tablename__ = "users"
    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str] = mapped_column(String(80))
    email: Mapped[str | None] = mapped_column(String(255))
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

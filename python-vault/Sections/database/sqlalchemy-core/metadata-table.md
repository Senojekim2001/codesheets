---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-core"
id: "metadata-table"
title: "MetaData & Table — SQLAlchemy Core schema"
category: "Core Schema"
subtitle: "MetaData, Table, Column, ForeignKey, PrimaryKeyConstraint, UniqueConstraint, Index"
signature_short: "meta = MetaData()
users = Table(\"users\", meta, Column(\"id\", Integer, primary_key=True))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MetaData & Table — SQLAlchemy Core schema"
  - "metadata-table"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-core"
  - "category/core-schema"
  - "tier/tiered"
---

# MetaData & Table — SQLAlchemy Core schema

> MetaData, Table, Column, ForeignKey, PrimaryKeyConstraint, UniqueConstraint, Index

## Overview

Core is SQLAlchemy's lower-level layer: schemas as data, queries as SQL expression trees, no objects-with-state. Useful when you don't need the ORM's identity map and unit of work — ad-hoc data movers, ETL scripts, reflection-based tools, and the SQL bits inside Alembic migrations all live here. ORM models are built ON TOP of Core; you can mix them.

## Signature

```python
meta = MetaData()
users = Table("users", meta, Column("id", Integer, primary_key=True))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - MetaData() container; Table() declares columns; create_all() emits DDL.
# STRENGTHS - No ORM ceremony; tables are values you can build, inspect, ship.
# WEAKNESSES- No object-relational mapping — you work with Row tuples, not domain objects.
from sqlalchemy import MetaData, Table, Column, Integer, String, create_engine

engine = create_engine("sqlite:///app.db")
meta = MetaData()

users = Table(
    "users", meta,
    Column("id", Integer, primary_key=True),
    Column("name", String(80), nullable=False),
    Column("email", String(255), unique=True),
)

meta.create_all(engine)                         # CREATE TABLE users (...)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Composite constraints, named indexes, foreign keys with ON DELETE; reflect existing tables.
# STRENGTHS - The DDL you need for real schemas; reflection lets you query DBs you didn't define.
# WEAKNESSES- Reflected tables don't carry your application semantics — annotate them or wrap in Core helpers.
from sqlalchemy import (
    MetaData, Table, Column, Integer, String, ForeignKey,
    UniqueConstraint, Index, CheckConstraint, DateTime, func,
)

meta = MetaData()

users = Table(
    "users", meta,
    Column("id", Integer, primary_key=True),
    Column("email", String(255), nullable=False),
    Column("name", String(80), nullable=False),
    Column("created_at", DateTime, server_default=func.now()),
    UniqueConstraint("email", name="uq_users_email"),
    Index("ix_users_name_lower", func.lower(Column("name"))),     # functional index
)

posts = Table(
    "posts", meta,
    Column("id", Integer, primary_key=True),
    Column("title", String(200), nullable=False),
    Column("body", String),
    Column("author_id", Integer,
           ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("views", Integer, server_default="0"),
    CheckConstraint("views >= 0", name="ck_posts_views_nonneg"),
    Index("ix_posts_author", "author_id"),
)

# Reflect an existing schema without writing models.
existing = MetaData()
existing.reflect(bind=engine)
print(existing.tables.keys())                    # all tables in the DB
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Naming convention for constraint auto-naming (Alembic-friendly); schema modules per bounded context; mix Core schemas with ORM mappings via mapper_registry.
# STRENGTHS - Predictable, repeatable migrations; schemas you can ship as values; ORM and Core share one MetaData.
# WEAKNESSES- Naming convention has to be set BEFORE any constraints are declared; retrofitting renames every implicit constraint, generates churn migrations.
from __future__ import annotations
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

# 1) Naming convention — Alembic generates predictable migration names.
NAMING_CONVENTION = {
    "ix":  "ix_%(column_0_label)s",
    "uq":  "uq_%(table_name)s_%(column_0_name)s",
    "ck":  "ck_%(table_name)s_%(constraint_name)s",
    "fk":  "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk":  "pk_%(table_name)s",
}
meta = MetaData(naming_convention=NAMING_CONVENTION)

# 2) Multi-tenant via schema= argument (Postgres / SQL Server).
audit = Table(
    "events", meta,
    Column("id", Integer, primary_key=True),
    Column("payload", String),
    schema="audit",                                # writes audit.events
)

# 3) Reusable column factories.
def pk_col() -> Column:
    return Column("id", Integer, primary_key=True)

def fk_col(target: str, **kw) -> Column:
    name = target.split(".", 1)[0] + "_id"
    return Column(name, Integer, ForeignKey(target, ondelete="CASCADE"), **kw)

# 4) Mix Core + ORM via the same MetaData. Modern way: registry.
from sqlalchemy.orm import registry

mapper_registry = registry(metadata=meta)

# Now declarative models AND raw Tables share one MetaData;
# create_all/drop_all/Alembic see everything.

# Decision rule:
#   greenfield app, you own the schema     -> ORM declarative_base; ergonomics > control
#   ETL / migration / DDL utility           -> Core MetaData + Table — no model objects needed
#   Alembic-friendly migrations             -> set naming_convention BEFORE first deploy
#   wrapping an existing DB you don't own   -> meta.reflect(bind=engine) + Core queries
#   multi-tenant via schemas                -> Table(..., schema="tenant_x") or schema_translate_map
#   constraint indexed on expression         -> Index("ix_lower_email", func.lower(table.c.email))
#   bulk inserts / data shovels              -> Core insert() + executemany; the ORM is overkill
#
# Anti-pattern: mixing ad-hoc Table() definitions in different MetaData
# instances within the same app. drop_all / create_all only sees one
# MetaData; you'll forget which one owns which table and end up with
# orphan schemas. ONE MetaData per app, used by both Core and ORM.
```

## Decision Rule

```text
greenfield app, you own the schema     -> ORM declarative_base; ergonomics > control
ETL / migration / DDL utility           -> Core MetaData + Table — no model objects needed
Alembic-friendly migrations             -> set naming_convention BEFORE first deploy
wrapping an existing DB you don't own   -> meta.reflect(bind=engine) + Core queries
multi-tenant via schemas                -> Table(..., schema="tenant_x") or schema_translate_map
constraint indexed on expression         -> Index("ix_lower_email", func.lower(table.c.email))
bulk inserts / data shovels              -> Core insert() + executemany; the ORM is overkill
```

## Anti-Pattern

> [!warning] Anti-pattern
> mixing ad-hoc Table() definitions in different MetaData
> instances within the same app. drop_all / create_all only sees one
> MetaData; you'll forget which one owns which table and end up with
> orphan schemas. ONE MetaData per app, used by both Core and ORM.

## Tips

- Set `naming_convention` on `MetaData()` BEFORE any tables are declared — Alembic uses it to generate stable migration names that survive Postgres / MySQL / SQLite differences.
- For multi-tenant per-schema layouts (Postgres), use `Table(..., schema="tenant_x")` — but consider `schema_translate_map` for runtime tenant switching.
- `meta.reflect(bind=engine)` builds Tables from an existing database — invaluable when you inherit a schema you don't want to declare manually.
- In ORM apps, the declarative `Base.metadata` IS a MetaData — you can declare ad-hoc Tables on the same instance and Core + ORM will share schema.
- `Column("name", String, comment="What this means")` survives into DDL and shows up in Postgres `\d+` — invest in column comments for self-documenting schemas.

## Common Mistake

> [!warning] Defining different Tables on different MetaData instances throughout an app. `meta.create_all` / `drop_all` / Alembic's autogenerate only sees the MetaData passed to them. The orphan tables silently drift out of sync. Use ONE MetaData per app; if you need to group tables, use schema= or just naming conventions.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Core Table for ad-hoc DDL
users = Table("users", MetaData(),
    Column("id", Integer, primary_key=True),
    Column("name", String(80)))
users.create(engine)
```

**Senior:**
```python
# ORM declarative — same DDL, plus identity-map + relationships
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
```

## See Also

- [[Sections/database/sqlalchemy-core/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — Core]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "database"
section: "migrations"
id: "alembic-init"
title: "Alembic init — bootstrap migrations on an existing project"
category: "Migrations"
subtitle: "alembic init, env.py target_metadata, sqlalchemy.url, naming_convention, render_as_batch, autogenerate"
signature_short: "alembic init alembic && alembic revision --autogenerate -m \"init\" && alembic upgrade head"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Alembic init — bootstrap migrations on an existing project"
  - "alembic-init"
tags:
  - "python"
  - "python/database"
  - "python/database/migrations"
  - "category/migrations"
  - "tier/tiered"
---

# Alembic init — bootstrap migrations on an existing project

> alembic init, env.py target_metadata, sqlalchemy.url, naming_convention, render_as_batch, autogenerate

## Overview

Alembic is the migration tool for SQLAlchemy. The setup story is short — `alembic init`, point env.py at your declarative `metadata`, run `revision --autogenerate` — but the polish that prevents pain later (naming conventions, env-driven URLs, SQLite batch mode, CI gates) is what separates "demo" from "production". The three examples solve the SAME task — bootstrap Alembic on an app with existing models and produce the first migration — at increasing depths: minimal setup → multi-env config + naming conventions → programmatic API + tests that verify reversibility.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Bootstrap Alembic in an existing SQLAlchemy project; produce the first migration.
- **Junior** — SAME bootstrap — but production-shaped: env-driven URL, naming convention so autogenerate produces stable constraint names, SQLite batch mode for ALTER, .gitignore the DB-local URL.
- **Senior** — SAME bootstrap — programmatic API + reversibility test in CI.

## Signature

```python
alembic init alembic && alembic revision --autogenerate -m "init" && alembic upgrade head
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Bootstrap Alembic in an existing SQLAlchemy project; produce the first migration.
# APPROACH  - alembic init, edit env.py target_metadata, autogenerate, upgrade.
# STRENGTHS - The shortest path that works; matches every Alembic tutorial.
# WEAKNESSES- Hardcoded DB URL; no naming convention; SQLite ALTER will hurt later.

# 1) Lay out the project (already in place):
#    myapp/
#      models.py          <- Declarative models live here
#      alembic.ini        <- created by 'alembic init alembic'
#      alembic/
#        env.py
#        versions/        <- migration files land here

# 2) Initialize Alembic.
#    $ alembic init alembic

# 3) In alembic.ini, set the URL (or hardcode for now).
# alembic.ini
sqlalchemy.url = postgresql+psycopg://app:secret@localhost/app

# 4) In alembic/env.py, point target_metadata at your declarative metadata.
# env.py
from myapp.models import Base
target_metadata = Base.metadata

# 5) Generate the first revision from existing tables (or empty DB).
#    $ alembic revision --autogenerate -m "initial schema"

# 6) Apply it.
#    $ alembic upgrade head

# 7) Sanity-check what's pending.
#    $ alembic current        # shows the revision the DB is at
#    $ alembic heads          # shows latest revision in versions/
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME bootstrap — but production-shaped: env-driven URL, naming
#             convention so autogenerate produces stable constraint names,
#             SQLite batch mode for ALTER, .gitignore the DB-local URL.
# APPROACH  - Read URL from env; attach naming_convention to MetaData;
#             render_as_batch=True for SQLite; clean alembic.ini.
# STRENGTHS - Autogenerate produces deterministic, diff-friendly migrations.
# WEAKNESSES- Still single-DB; no CI gate; no reversibility test.

# myapp/models.py — naming convention on the MetaData.
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Alembic + autogenerate works WAY better when constraints are named.
# These templates produce names like 'uq_users_email', 'fk_orders_user_id_users'.
NAMING_CONVENTION = {
    "ix":  "ix_%(column_0_label)s",
    "uq":  "uq_%(table_name)s_%(column_0_name)s",
    "ck":  "ck_%(table_name)s_%(constraint_name)s",
    "fk":  "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk":  "pk_%(table_name)s",
}

class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)

# alembic/env.py — env-driven URL, target_metadata, batch mode for SQLite.
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from myapp.models import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from environment so alembic.ini doesn't carry secrets.
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
target_metadata = Base.metadata

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,                          # one-shot — don't keep a pool around
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=connection.dialect.name == "sqlite",   # SQLite needs batch ops for ALTER
            compare_type=True,                            # detect column type changes
            compare_server_default=True,                  # detect server default changes
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    # Offline = emit SQL to stdout/file, no DB connection. Useful for review.
    context.configure(url=os.environ["DATABASE_URL"], target_metadata=target_metadata,
                      literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()
else:
    run_migrations_online()

# Generate + run.
#    $ DATABASE_URL=postgresql+psycopg://... alembic revision --autogenerate -m "init"
#    $ DATABASE_URL=postgresql+psycopg://... alembic upgrade head
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME bootstrap — programmatic API + reversibility test in CI.
# APPROACH  - Drive Alembic from Python (no shelling out); pytest fixture
#             that creates a temp DB, upgrades to head, downgrades to base,
#             upgrades to head again, asserts schema diff is clean.
# STRENGTHS - Catches non-reversible migrations BEFORE they reach prod;
#             integrates with CI; supports multi-tenant or per-feature DBs.
# WEAKNESSES- More code to maintain; the test takes a few seconds per migration.
import os
from pathlib import Path
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, MetaData

ALEMBIC_INI = Path("alembic.ini")

def make_alembic_config(url: str, *, script_location: str = "alembic") -> Config:
    """Build an Alembic Config without reading from CWD/argv — safe in tests + scripts."""
    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("script_location", script_location)
    cfg.set_main_option("sqlalchemy.url", url)
    return cfg

def upgrade_to_head(url: str) -> None:
    command.upgrade(make_alembic_config(url), "head")

def downgrade_to_base(url: str) -> None:
    command.downgrade(make_alembic_config(url), "base")

def stamp_head(url: str) -> None:
    """Mark the DB as 'at head' WITHOUT running migrations.
    Use after manually creating the schema (e.g., from a fresh seed)."""
    command.stamp(make_alembic_config(url), "head")

# pytest test that verifies every migration is reversible.
import pytest
from sqlalchemy_utils import create_database, drop_database          # pip install sqlalchemy-utils

@pytest.fixture
def temp_db(tmp_path):
    url = f"sqlite:///{tmp_path / 'test.db'}"
    create_database(url)
    try:
        yield url
    finally:
        drop_database(url)

def test_migrations_are_reversible(temp_db):
    """Round-trip: upgrade head -> downgrade base -> upgrade head -> schemas match."""
    from myapp.models import Base

    upgrade_to_head(temp_db)
    eng = create_engine(temp_db)
    schema_after_first = MetaData(); schema_after_first.reflect(eng)

    downgrade_to_base(temp_db)
    schema_at_base = MetaData(); schema_at_base.reflect(eng)
    assert not schema_at_base.tables, "downgrade base must leave the DB empty"

    upgrade_to_head(temp_db)
    schema_after_second = MetaData(); schema_after_second.reflect(eng)
    assert set(schema_after_first.tables) == set(schema_after_second.tables)
    # Compare against the declarative source of truth too.
    assert set(Base.metadata.tables) == set(schema_after_second.tables)

# Decision rule:
#   new project, single DB         -> alembic init + naming_convention + env-driven URL
#   monorepo, multiple services    -> one alembic dir per service; share NAMING_CONVENTION
#   SQLite in dev / sqlite in prod -> render_as_batch=True; ALTER COLUMN unsupported otherwise
#   need offline review            -> alembic upgrade head --sql > review.sql; DBA approval
#   per-tenant schemas             -> include_schemas=True + version_table_schema=...
#   hot path: CI gates             -> reversibility test (this snippet) on every PR
#   secrets in URL                 -> NEVER commit alembic.ini with the URL; env-only
#   programmatic apply              -> alembic.command API > shelling out from Python
#
# Anti-pattern: not setting a naming_convention on MetaData. Autogenerate will
# produce constraint names like 'uq_users_email_001' on one machine and
# 'uq_users_email' on another (depending on driver, dialect, and luck). Diffs
# become noise; CI flaps. Set the convention BEFORE generating the first
# migration — backporting it later requires editing every existing migration.
```

## Decision Rule

```text
new project, single DB         -> alembic init + naming_convention + env-driven URL
monorepo, multiple services    -> one alembic dir per service; share NAMING_CONVENTION
SQLite in dev / sqlite in prod -> render_as_batch=True; ALTER COLUMN unsupported otherwise
need offline review            -> alembic upgrade head --sql > review.sql; DBA approval
per-tenant schemas             -> include_schemas=True + version_table_schema=...
hot path: CI gates             -> reversibility test (this snippet) on every PR
secrets in URL                 -> NEVER commit alembic.ini with the URL; env-only
programmatic apply              -> alembic.command API > shelling out from Python
```

## Anti-Pattern

> [!warning] Anti-pattern
> not setting a naming_convention on MetaData. Autogenerate will
> produce constraint names like 'uq_users_email_001' on one machine and
> 'uq_users_email' on another (depending on driver, dialect, and luck). Diffs
> become noise; CI flaps. Set the convention BEFORE generating the first
> migration — backporting it later requires editing every existing migration.

## Tips

- Always set a `naming_convention` on `MetaData` BEFORE generating the first migration. Without it, autogenerate produces non-deterministic constraint names and your diffs flap.
- Read `sqlalchemy.url` from an environment variable in env.py — never commit it to alembic.ini. Production URLs leak via git history more often than you'd guess.
- Set `render_as_batch=True` for SQLite. Most ALTER TABLE operations don't exist on SQLite; batch mode rewrites them by copying the table.
- Use `compare_type=True` and `compare_server_default=True` in env.py to catch column-type and default changes during autogenerate. Off by default.
- Drive Alembic programmatically via `alembic.command` in tests and scripts — `subprocess` works but loses error context and can't share Python config.
- Add a CI test that round-trips upgrade → downgrade → upgrade and asserts the schema matches `Base.metadata`. Catches non-reversible migrations before they ship.

## Common Mistake

> [!warning] Skipping the `naming_convention` step on MetaData. Autogenerate produces constraint names like `uq_users_email_001` (Postgres internal name) on one machine and `uq_users_email` on another. Your diffs are non-deterministic, autogenerate creates phantom DROP/ADD pairs on every run, and CI starts flapping. Fix BEFORE the first revision; backporting requires editing every existing migration.

## Shorthand (Junior → Senior)

**Junior:**
```python
# No naming convention — autogenerate produces inconsistent names
class Base(DeclarativeBase):
    pass
```

**Senior:**
```python
# Stable, Alembic-friendly constraint names everywhere
class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
```

## See Also

- [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/_Index|Databases & SQLAlchemy → Schema Migrations — Alembic]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

---
type: "file-index"
domain: "python"
file: "database"
title: "Databases & SQLAlchemy"
tags:
  - "python"
  - "python/database"
  - "index"
---

# Databases & SQLAlchemy

> 24 entries across 5 sections.

## SQLAlchemy 2.0 — ORM · 8

- [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine]] — Construct the SQLAlchemy Engine and configure pooling, echo, and connection string options.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map]] — The Session manages the unit of work: tracks ORM objects, flushes changes to the DB, and owns transactions.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T]]] — Define ORM models with type-hint-driven column declarations using SQLAlchemy 2.0 syntax.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-select|select() — Modern Query API]] — Build queries with SQLAlchemy 2.0's unified select() API; execute via session.scalars() or session.execute().
- [[Sections/database/sqlalchemy-orm/sqlalchemy-relationships|relationship() — Eager vs Lazy Loading]] — Define ORM relationships and pick the loader strategy: lazy (default), joinedload, selectinload, or raise on access.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-loading-strategies|Loading Strategies — joinedload, selectinload, raiseload, contains_eager]] — Pick the right loader for each relationship: joinedload for *-to-one, selectinload for *-to-many, raiseload to fail loud on accidental access.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-transactions|Transactions — begin, commit, rollback, savepoints, isolation]] — Control transaction boundaries explicitly: with-block commits, savepoints (begin_nested), isolation levels, and rollback discipline.
- [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management]] — Bind a Session to a thread or request without passing it explicitly. Use sparingly — explicit injection is usually cleaner.

## SQLAlchemy 2.0 — Core · 4

- [[Sections/database/sqlalchemy-core/metadata-table|MetaData & Table — SQLAlchemy Core schema]] — Build SQL schemas without the ORM: MetaData groups Tables; Table declares columns and constraints; useful for ad-hoc scripts, migrations, and bulk operations.
- [[Sections/database/sqlalchemy-core/raw-sql-execute|text() & raw SQL — parameterized execution]] — Drop to raw SQL via text() with safe parameter binding when the ORM and select() expressions don't fit.
- [[Sections/database/sqlalchemy-core/core-vs-orm-decision|Core vs ORM — when to use which]] — SQLAlchemy is two libraries: ORM (objects, identity map, change tracking) and Core (SQL expressions, no objects). Pick deliberately, mix when justified.
- [[Sections/database/sqlalchemy-core/connection-pool|Connection Pool — QueuePool, NullPool, StaticPool, sizing]] — Pick and tune the connection pool for your deployment shape: QueuePool (default for servers), NullPool (serverless / forking), StaticPool (in-memory tests).

## DB-API Drivers — Postgres & SQLite · 4

- [[Sections/database/drivers/psycopg3|psycopg 3 — modern PostgreSQL driver]] — Third-generation psycopg: sync + async in one library, server-side parameter binding, real COPY support, named cursors, and a clean connection-pool module. The current Postgres driver for new Python code.
- [[Sections/database/drivers/asyncpg|asyncpg — high-performance async Postgres driver]] — A from-scratch async-only Postgres driver: speaks the binary protocol directly, prepares statements transparently, and benchmarks ~3× faster than psycopg async on simple selects. No DBAPI compatibility.
- [[Sections/database/drivers/sqlite3-stdlib|sqlite3 — Python stdlib SQLite driver]] — Battery-included SQLite driver; ideal for caches, tests, embedded data, and config files. Defaults are conservative — flip three PRAGMAs and it is production-grade for single-writer workloads.
- [[Sections/database/drivers/aiosqlite|aiosqlite — async wrapper around sqlite3]] — A thin asyncio wrapper that runs sqlite3 calls on a background thread per connection; same SQL, same PRAGMAs, async/await ergonomics. Useful inside async frameworks but does NOT make SQLite faster.

## Schema Migrations — Alembic · 4

- [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project]] — Wire Alembic into a SQLAlchemy project: project layout, env.py target_metadata, naming conventions for autogenerate, and the first migration.
- [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration]] — Add a NOT NULL column with a default to a large table without locking it: split the change into add-nullable, backfill, then enforce NOT NULL — the three-step pattern that survives at scale.
- [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill]] — Backfill millions of rows safely: chunked UPDATEs, progress checkpointing, idempotency, resumability — and why this work belongs OUTSIDE Alembic, not inside it.
- [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions]] — When two PRs both create migrations off the same head, you get two heads. Resolve via `alembic merge`; prevent recurrence via CI gates; run intentional branches per-tenant or per-feature with branch labels.

## Database Patterns — Architecture & Concurrency · 4

- [[Sections/database/patterns/repository-pattern|Repository pattern — abstract the persistence layer]] — Wrap database access behind an interface so business logic depends on a Repository, not a Session. Pays for itself in tests; can be over-applied — be deliberate.
- [[Sections/database/patterns/unit-of-work|Unit of Work — atomic, repository-aware transactions]] — A Unit of Work groups repository operations into one transaction; commit-or-rollback is explicit; handlers receive a UoW factory and never see Session. Pairs with the Repository pattern.
- [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading]] — Iterating a relationship inside a loop fires one extra query per row. Spot it via SQL log; fix with selectinload / joinedload; prevent recurrence with lazy="raise".
- [[Sections/database/patterns/isolation-levels|Isolation levels — preventing the inventory oversell]] — Two concurrent decrements of the same inventory row at READ COMMITTED both succeed and oversell. Fix with row locks (FOR UPDATE) or SERIALIZABLE + retry — pick deliberately.

---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-core"
id: "raw-sql-execute"
title: "text() & raw SQL — parameterized execution"
category: "Core Queries"
subtitle: "text(), :param binding, bindparam, exec_driver_sql, execute_options, no f-strings"
signature_short: "session.execute(text(\"SELECT * FROM users WHERE id = :id\"), {\"id\": 1})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "text() & raw SQL — parameterized execution"
  - "raw-sql-execute"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-core"
  - "category/core-queries"
  - "tier/tiered"
---

# text() & raw SQL — parameterized execution

> text(), :param binding, bindparam, exec_driver_sql, execute_options, no f-strings

## Overview

text() wraps a literal SQL string with safe parameter binding via :name placeholders. The driver substitutes values; SQL injection becomes structurally impossible. Reach for text() for vendor-specific syntax (CTEs in non-standard form, EXPLAIN, custom DDL) — never f-string user input into a query, ever.

## Signature

```python
session.execute(text("SELECT * FROM users WHERE id = :id"), {"id": 1})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - text("...:param...") + dict; the driver binds parameters safely.
# STRENGTHS - Same protection as ORM queries; SQL injection structurally impossible.
# WEAKNESSES- Vendor-specific SQL is portable to ONE engine only; check before deploying elsewhere.
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(
        text("SELECT id, name FROM users WHERE email = :email"),
        {"email": "alice@example.com"},
    )
    for row in result:
        print(row.id, row.name)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - bindparam() for typed parameters; executemany via list-of-dicts; .scalars() / .scalar_one() for single values.
# STRENGTHS - Type coercion at the binding layer (avoids "string '5' compared to int" surprises).
# WEAKNESSES- f-string interpolation of identifiers (table/column names) is sometimes unavoidable; quote() and validate against an allowlist.
from sqlalchemy import text, bindparam, Integer

# Typed bind parameter — driver coerces "5" to int 5.
stmt = text(
    "SELECT * FROM posts WHERE author_id = :author AND views > :min_views"
).bindparams(
    bindparam("author", type_=Integer),
    bindparam("min_views", type_=Integer),
)

with engine.connect() as conn:
    rows = conn.execute(stmt, {"author": 1, "min_views": 100}).all()

    # executemany — one query, many parameter sets.
    conn.execute(
        text("INSERT INTO logs (level, msg) VALUES (:level, :msg)"),
        [
            {"level": "INFO", "msg": "started"},
            {"level": "WARN", "msg": "slow"},
            {"level": "ERROR", "msg": "boom"},
        ],
    )

    # Single-value extractor.
    count = conn.execute(text("SELECT count(*) FROM users")).scalar_one()

# DDL via text() — useful in Alembic data-migrations.
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN nickname VARCHAR(80)"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - text() for vendor-specific syntax; quote dynamic identifiers via the dialect; never trust user input as identifiers; use exec_driver_sql for the rare driver-only escape hatch.
# STRENGTHS - Safe SQL injection protection AND the full power of the underlying engine when needed.
# WEAKNESSES- text() params can't substitute identifiers (table/column names) — those need the dialect's quoting AND an allowlist.
from __future__ import annotations
from sqlalchemy import text, bindparam, Integer
from sqlalchemy.engine import Engine

# 1) Postgres advisory lock — vendor-specific, no ORM equivalent.
def with_advisory_lock(conn, key: int):
    conn.execute(text("SELECT pg_advisory_lock(:key)"), {"key": key})
    try:
        yield
    finally:
        conn.execute(text("SELECT pg_advisory_unlock(:key)"), {"key": key})

# 2) Dynamic ORDER BY column — params can't substitute identifiers; allowlist + quote.
ALLOWED_SORT_COLS = {"id", "name", "created_at"}

def list_users(conn, sort_by: str, descending: bool = False):
    if sort_by not in ALLOWED_SORT_COLS:           # MUST allowlist
        raise ValueError(f"unsupported sort column: {sort_by}")
    direction = "DESC" if descending else "ASC"
    # Use the dialect to quote — handles reserved words, quoting style.
    quoted = conn.dialect.identifier_preparer.quote(sort_by)
    stmt = text(f"SELECT id, name FROM users ORDER BY {quoted} {direction} LIMIT :n")
    return conn.execute(stmt, {"n": 100}).all()

# 3) IN clause with expanding bind — handles list of any size.
stmt = text("SELECT * FROM users WHERE id IN :ids").bindparams(
    bindparam("ids", expanding=True)
)
ids = [1, 2, 3, 4, 5]
rows = conn.execute(stmt, {"ids": ids}).all()       # safe; no SQL string concat

# 4) RETURNING (Postgres / SQLite 3.35+) — fetch generated keys in one round-trip.
new_ids = conn.execute(
    text("INSERT INTO users (name) VALUES (:n) RETURNING id"),
    [{"n": "Alice"}, {"n": "Bob"}],
).scalars().all()

# 5) exec_driver_sql — no parameter parsing, dialect-specific; for the rare cases
#    where SQLAlchemy's :name parsing breaks (PostgreSQL JSON ?? operator).
conn.exec_driver_sql(
    "SELECT data FROM events WHERE data ?? %s", ("user_id",)
)

# Decision rule:
#   parameterized SQL                     -> text("... :param ...") + dict — ALWAYS
#   typed bind                            -> .bindparams(bindparam("p", type_=Integer))
#   IN (list of unknown size)             -> bindparam("ids", expanding=True)
#   single value back                     -> .scalar_one() / .scalar_one_or_none()
#   bulk insert                           -> conn.execute(text("INSERT..."), [{...}, {...}])
#   identifiers from user (rare!)          -> allowlist + dialect.identifier_preparer.quote()
#   driver pass-through (?? in PG)         -> exec_driver_sql with %s positional
#   want types in result                  -> use ORM session.execute(stmt) when you have models
#
# Anti-pattern: f-string interpolation of values into SQL — `f"WHERE id = {user_id}"`.
# That's classic SQL injection. ALWAYS bind values as parameters. The exception
# (identifiers like table/column names) requires an allowlist plus dialect quoting,
# never raw user input.
```

## Decision Rule

```text
parameterized SQL                     -> text("... :param ...") + dict — ALWAYS
typed bind                            -> .bindparams(bindparam("p", type_=Integer))
IN (list of unknown size)             -> bindparam("ids", expanding=True)
single value back                     -> .scalar_one() / .scalar_one_or_none()
bulk insert                           -> conn.execute(text("INSERT..."), [{...}, {...}])
identifiers from user (rare!)          -> allowlist + dialect.identifier_preparer.quote()
driver pass-through (?? in PG)         -> exec_driver_sql with %s positional
want types in result                  -> use ORM session.execute(stmt) when you have models
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string interpolation of values into SQL — `f"WHERE id = {user_id}"`.
> That's classic SQL injection. ALWAYS bind values as parameters. The exception
> (identifiers like table/column names) requires an allowlist plus dialect quoting,
> never raw user input.

## Tips

- `text()` parameter binding (`:name`) is structurally injection-safe — the value never enters the SQL string, the driver substitutes it.
- Use `bindparam("ids", expanding=True)` for `IN (?)` clauses — SQLAlchemy expands the list at execution time so you don't have to build a comma-separated string.
- `scalar_one()` raises `NoResultFound` / `MultipleResultsFound` — perfect for "must return exactly one row" cases (counts, single-record fetches).
- For dynamic identifiers (table/column names), use `conn.dialect.identifier_preparer.quote(name)` AFTER allowlisting — the quote alone is not protection; the allowlist is.
- `session.execute(text(...))` works inside the ORM too — drop to raw SQL when needed without losing the unit-of-work transaction.

## Common Mistake

> [!warning] F-string interpolation of any value into a SQL string. `text(f"SELECT * FROM users WHERE id = {user_id}")` is SQL injection waiting to happen — the value is dropped into the SQL stream raw. Always use `:name` placeholders and pass parameters via the dict argument; the driver handles binding safely.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Unsafe — SQL injection
sql = f"SELECT * FROM users WHERE id = {user_input}"
conn.execute(text(sql))

# Or naive concatenation
conn.execute(text("SELECT * FROM users WHERE id = " + str(user_input)))
```

**Senior:**
```python
# Safe — parameter binding
conn.execute(
    text("SELECT * FROM users WHERE id = :id"),
    {"id": user_input},
)
```

## See Also

- [[Sections/database/sqlalchemy-core/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — Core]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

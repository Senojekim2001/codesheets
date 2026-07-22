---
type: "entry"
domain: "python"
file: "database"
section: "drivers"
id: "psycopg3"
title: "psycopg 3 — modern PostgreSQL driver"
category: "Postgres Drivers"
subtitle: "psycopg.connect, psycopg_pool.ConnectionPool, copy(), prepared statements, %s placeholders"
signature_short: "with psycopg.connect(dsn) as conn, conn.cursor() as cur: cur.execute(\"SELECT %s\", (1,))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "psycopg 3 — modern PostgreSQL driver"
  - "psycopg3"
tags:
  - "python"
  - "python/database"
  - "python/database/drivers"
  - "category/postgres-drivers"
  - "tier/tiered"
---

# psycopg 3 — modern PostgreSQL driver

> psycopg.connect, psycopg_pool.ConnectionPool, copy(), prepared statements, %s placeholders

## Overview

psycopg 3 (released 2021, package name `psycopg` — NOT `psycopg2`) is the current Postgres driver. Versus psycopg2: native async, server-side prepared statements, COPY ergonomics, and a first-class pool. Use it directly for ETL/streaming, or as the DBAPI under SQLAlchemy 2.x via `postgresql+psycopg://...`. The three examples below all solve the same task — ingest events into a table and read the recent ones — at increasing levels of sophistication: connect-and-execute → transactional batch → pooled bulk-via-COPY with retries.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Insert events into an events table; read the most recent 5.
- **Junior** — SAME: ingest events, read recent — but now for a batch.
- **Senior** — SAME: ingest events (now high-volume) and read recent.

## Signature

```python
with psycopg.connect(dsn) as conn, conn.cursor() as cur: cur.execute("SELECT %s", (1,))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Insert events into an events table; read the most recent 5.
# APPROACH  - One connection, one cursor, %s placeholders, fetch into tuples.
# STRENGTHS - Smallest correct program; SQL injection-safe by construction.
# WEAKNESSES- One row at a time; no transaction control; tuples not dicts.
import psycopg

DSN = "postgresql://app:secret@localhost/app"

with psycopg.connect(DSN) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                payload    JSONB,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """)
        cur.execute(
            "INSERT INTO events (name, payload) VALUES (%s, %s)",
            ("signup", '{"plan": "pro"}'),
        )
        cur.execute(
            "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
        )
        for row in cur:
            print(row)                                # tuples by default
# Clean exit -> COMMIT; exception inside the with-block -> ROLLBACK.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME: ingest events, read recent — but now for a batch.
# APPROACH  - dict_row for dict access; named parameters; ONE explicit
#             transaction wrapping executemany; clear error handling.
# STRENGTHS - Production-shaped patterns; ergonomic; rollback on failure.
# WEAKNESSES- Still single connection; executemany still issues N statements.
import psycopg
from psycopg.rows import dict_row
from psycopg.errors import IntegrityError

DSN = "postgresql://app:secret@localhost/app"

events = [
    {"name": "signup", "payload": '{"plan": "pro"}'},
    {"name": "login",  "payload": '{"ok": true}'},
    {"name": "logout", "payload": None},
]

with psycopg.connect(DSN, row_factory=dict_row) as conn:
    try:
        with conn.transaction():                      # BEGIN ... COMMIT (or ROLLBACK on raise)
            conn.cursor().executemany(
                "INSERT INTO events (name, payload) VALUES (%(name)s, %(payload)s)",
                events,
            )
    except IntegrityError as e:
        print(f"insert rejected: {e.diag.message_primary}")
        raise

    rows = conn.execute(
        "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
    ).fetchall()
    for r in rows:
        print(r["id"], r["name"], r["created_at"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME: ingest events (now high-volume) and read recent.
# APPROACH  - Pool-managed conn; COPY for the bulk path (10-100× faster
#             than executemany); prepare=True caches the read plan;
#             retry once on transient OperationalError + pool.check().
# STRENGTHS - Bounded resources; fastest insert path; cached plan;
#             survives DB restart blips and load-balancer idle-kills.
# WEAKNESSES- More moving parts; reach for ORM if relationships dominate.
import json
from typing import Iterable
import psycopg
from psycopg.rows import dict_row
from psycopg.errors import OperationalError
from psycopg_pool import ConnectionPool

DSN = "postgresql://app:secret@db/app"

pool = ConnectionPool(
    DSN,
    min_size=4, max_size=20,                          # ≤ 80% of DB max_connections / workers
    kwargs={"row_factory": dict_row},
    open=True,
)

def ingest_events(rows: Iterable[tuple[str, dict | None]]) -> int:
    """Bulk-load via COPY — single round-trip, no per-row protocol cost."""
    n = 0
    with pool.connection() as conn, conn.cursor() as cur:
        with cur.copy("COPY events (name, payload) FROM STDIN") as copy:
            for name, payload in rows:
                copy.write_row((name, json.dumps(payload) if payload else None))
                n += 1
    return n

def recent_events(limit: int = 5, *, retries: int = 1) -> list[dict]:
    """Prepared statement on the hot path; one retry on transient blip."""
    sql = "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT %s"
    for attempt in range(retries + 1):
        try:
            with pool.connection() as conn:
                return conn.execute(sql, (limit,), prepare=True).fetchall()
        except OperationalError:
            if attempt == retries:
                raise
            pool.check()                              # invalidate dead conns

# Use it.
n = ingest_events(((f"evt-{i}", {"i": i}) for i in range(100_000)))
print(f"ingested {n}")
print(recent_events())

# Decision rule:
#   <100 rows                  -> executemany inside one transaction is fine
#   >1000 rows                 -> COPY; rewrites N inserts as one streamed payload
#   per-row commits in a loop  -> NEVER; ~100 inserts/sec instead of 100k
#   server up but slow query   -> SET LOCAL statement_timeout, catch QueryCanceled
#   transient connection loss  -> retry once + pool.check(); not a generic backoff
#   serverless / Lambda        -> NullPool — pooled conns die during freezes
#   forking server             -> engine.dispose(close=False) in post-fork hook
#   pgbouncer transaction-mode -> avoid prepare=True OR use psycopg's named statements
#
# Anti-pattern: executemany on a 100k-row batch when COPY is available.
# executemany still issues one INSERT per row over the wire (with bound
# parameters); COPY streams the whole batch as one payload. A 100k-row insert
# is ~30s with executemany and ~0.5s with COPY. If the batch is large, COPY.
```

## Decision Rule

```text
<100 rows                  -> executemany inside one transaction is fine
>1000 rows                 -> COPY; rewrites N inserts as one streamed payload
per-row commits in a loop  -> NEVER; ~100 inserts/sec instead of 100k
server up but slow query   -> SET LOCAL statement_timeout, catch QueryCanceled
transient connection loss  -> retry once + pool.check(); not a generic backoff
serverless / Lambda        -> NullPool — pooled conns die during freezes
forking server             -> engine.dispose(close=False) in post-fork hook
pgbouncer transaction-mode -> avoid prepare=True OR use psycopg's named statements
```

## Anti-Pattern

> [!warning] Anti-pattern
> executemany on a 100k-row batch when COPY is available.
> executemany still issues one INSERT per row over the wire (with bound
> parameters); COPY streams the whole batch as one payload. A 100k-row insert
> is ~30s with executemany and ~0.5s with COPY. If the batch is large, COPY.

## Tips

- Install `psycopg[binary]` for development (bundles libpq) or `psycopg[c]` in production (compiles against system libpq for smaller image, fewer surprises).
- For SQLAlchemy 2.x the URL is `postgresql+psycopg://...` (NOT `postgresql+psycopg2://...`). The plain `postgresql://...` URL still defaults to psycopg2 for back-compat — be explicit.
- Use `prepare=True` on hot queries to cache the plan on the connection. Skip it on one-shot queries — preparation overhead isn't free.
- COPY is THE bulk-load primitive. `cur.copy()` returns a context manager that accepts `write_row(tuple)` or `write(bytes)`. Do not loop `executemany` for >10k rows.
- Server-side cursors require `name="..."` and a transaction (autocommit must be off). Set `cur.itersize` to control rows fetched per round-trip — 1000-10000 is typical.
- Pool tuning: `min_size` warm at boot, `max_size` ≤ `db.max_connections × 0.8 ÷ workers`, `max_idle` shorter than your load balancer's idle timeout.

## Common Mistake

> [!warning] Building SQL with f-strings/% formatting instead of using `%s` parameter markers — defeats psycopg's server-side parameter binding and re-introduces SQL injection. The `%s` is a parameter MARKER, not a Python format spec.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Vulnerable to injection — never do this
cur.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

**Senior:**
```python
# Server-side parameter binding — safe
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
```

## See Also

- [[Sections/database/drivers/asyncpg|asyncpg — high-performance async Postgres driver (Databases & SQLAlchemy)]]
- [[Sections/database/drivers/_Index|Databases & SQLAlchemy → DB-API Drivers — Postgres & SQLite]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

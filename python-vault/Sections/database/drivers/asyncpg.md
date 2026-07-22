---
type: "entry"
domain: "python"
file: "database"
section: "drivers"
id: "asyncpg"
title: "asyncpg — high-performance async Postgres driver"
category: "Postgres Drivers"
subtitle: "asyncpg.connect / create_pool, $1 placeholders, fetch / fetchrow / fetchval, prepared statements, custom codecs, COPY"
signature_short: "pool = await asyncpg.create_pool(dsn); rows = await pool.fetch(\"SELECT $1::int\", 1)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncpg — high-performance async Postgres driver"
  - "asyncpg"
tags:
  - "python"
  - "python/database"
  - "python/database/drivers"
  - "category/postgres-drivers"
  - "tier/tiered"
---

# asyncpg — high-performance async Postgres driver

> asyncpg.connect / create_pool, $1 placeholders, fetch / fetchrow / fetchval, prepared statements, custom codecs, COPY

## Overview

asyncpg is the speed-first async Postgres driver. It bypasses libpq, uses prepared statements implicitly, and returns Record objects (immutable, tuple-and-dict-like). Tradeoffs: it is NOT a DBAPI driver, so SQLAlchemy 2.x supports it only via `postgresql+asyncpg://...` (with caveats around prepared-statement caching when behind pgbouncer). The three examples below solve the same task at three depths: connect-and-execute → pooled transactional batch → pool with codec hook + COPY + prepared read.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Insert events into an events table; read the most recent 5.
- **Junior** — SAME: ingest events, read recent — but now for a batch.
- **Senior** — SAME: bulk-ingest events and query recent — at production scale.

## Signature

```python
pool = await asyncpg.create_pool(dsn); rows = await pool.fetch("SELECT $1::int", 1)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Insert events into an events table; read the most recent 5.
# APPROACH  - asyncpg.connect, await execute / fetch, $1 placeholders.
# STRENGTHS - Smallest correct async program; binary protocol = fast.
# WEAKNESSES- One connection; one row at a time; close() must be awaited.
import asyncio
import asyncpg

DSN = "postgresql://app:secret@localhost/app"

async def main():
    conn = await asyncpg.connect(DSN)
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                payload    JSONB,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """)
        await conn.execute(
            "INSERT INTO events (name, payload) VALUES ($1, $2)",
            "signup", '{"plan": "pro"}',                # $1, $2 — libpq placeholders
        )
        rows = await conn.fetch(
            "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
        )
        for r in rows:                                  # Record: tuple AND dict
            print(r["id"], r["name"], r["created_at"])
    finally:
        await conn.close()

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME: ingest events, read recent — but now for a batch.
# APPROACH  - Pool, transaction, executemany; payload as JSON string.
# STRENGTHS- Async-shaped patterns; cheap pool acquisition; safe rollback.
# WEAKNESSES- executemany still sends N statements over the wire.
import asyncio
import json
import asyncpg

DSN = "postgresql://app:secret@db/app"

events = [
    ("signup", json.dumps({"plan": "pro"})),
    ("login",  json.dumps({"ok": True})),
    ("logout", None),
]

async def main():
    pool = await asyncpg.create_pool(DSN, min_size=2, max_size=10)
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():               # BEGIN ... COMMIT/ROLLBACK
                await conn.executemany(
                    "INSERT INTO events (name, payload) VALUES ($1, $2)",
                    events,
                )
            rows = await conn.fetch(
                "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
            )
            for r in rows:
                print(r["id"], r["name"], r["created_at"])
    finally:
        await pool.close()

asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME: bulk-ingest events and query recent — at production scale.
# APPROACH  - Pool with init= codec hook; copy_records_to_table for bulk;
#             prepared statement for the read; pgbouncer-safe defaults.
# STRENGTHS - ~3× psycopg async on selects; COPY rewrites bulk; codec once.
# WEAKNESSES- Async-only; behind pgbouncer transaction-mode you MUST disable
#             the statement cache or queries fail intermittently.
import asyncio
import json
from typing import AsyncIterable
import asyncpg

DSN = "postgresql://app:secret@db/app"

async def init_conn(conn: asyncpg.Connection) -> None:
    """Register codec once per connection — Python dicts <-> jsonb."""
    await conn.set_type_codec(
        "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog",
    )

async def make_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(
        DSN,
        min_size=4, max_size=20,
        max_inactive_connection_lifetime=300,           # < LB idle timeout
        statement_cache_size=0,                          # MUST be 0 behind pgbouncer txn-mode
        init=init_conn,
        command_timeout=15,
    )

async def ingest_events(pool: asyncpg.Pool,
                        rows: AsyncIterable[tuple[str, dict | None]]) -> int:
    """Bulk-load via COPY; single round-trip; codec turns dicts into jsonb."""
    async with pool.acquire() as conn:
        result = await conn.copy_records_to_table(
            "events",
            records=rows,                                # async iterator yielding (name, payload)
            columns=["name", "payload"],
        )
        return int(result.split()[-1])                   # 'COPY 12345' -> 12345

async def recent_events(pool: asyncpg.Pool, limit: int = 5) -> list[asyncpg.Record]:
    """Prepared statement keeps the plan cached on this connection."""
    async with pool.acquire() as conn:
        stmt = await conn.prepare(
            "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT $1"
        )
        return await stmt.fetch(limit)

async def main():
    pool = await make_pool()
    try:
        async def gen():
            for i in range(100_000):
                yield (f"evt-{i}", {"i": i})
        n = await ingest_events(pool, gen())
        print(f"ingested {n}")
        for r in await recent_events(pool):
            print(r["id"], r["name"], r["created_at"])
    finally:
        await pool.close()

asyncio.run(main())

# Decision rule:
#   pure-async high-throughput PG  -> asyncpg directly; ~3× psycopg async on selects
#   SQLAlchemy 2.x async + PG       -> postgresql+asyncpg://, statement_cache_size=0 if pgbouncer
#   need DBAPI / sync interop       -> psycopg 3 instead — asyncpg is async-only
#   pgbouncer transaction pooling   -> statement_cache_size=0 OR session-mode bouncer
#   bulk load                       -> copy_records_to_table — accepts lists & async iterators
#   custom row decoding             -> set_type_codec inside init= (every pool conn gets it)
#   pub/sub between services        -> LISTEN/NOTIFY via add_listener — replaces a broker
#   query timeouts                  -> command_timeout AND server-side statement_timeout
#
# Anti-pattern: leaving statement_cache_size at the default behind pgbouncer
# in transaction mode. asyncpg prepares statements on the backend connection
# it sees; pgbouncer reassigns connections per transaction; the next call
# gets 'prepared statement does not exist'. Fix: statement_cache_size=0, or
# session-mode bouncer, or talk straight to Postgres.
```

## Decision Rule

```text
pure-async high-throughput PG  -> asyncpg directly; ~3× psycopg async on selects
SQLAlchemy 2.x async + PG       -> postgresql+asyncpg://, statement_cache_size=0 if pgbouncer
need DBAPI / sync interop       -> psycopg 3 instead — asyncpg is async-only
pgbouncer transaction pooling   -> statement_cache_size=0 OR session-mode bouncer
bulk load                       -> copy_records_to_table — accepts lists & async iterators
custom row decoding             -> set_type_codec inside init= (every pool conn gets it)
pub/sub between services        -> LISTEN/NOTIFY via add_listener — replaces a broker
query timeouts                  -> command_timeout AND server-side statement_timeout
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving statement_cache_size at the default behind pgbouncer
> in transaction mode. asyncpg prepares statements on the backend connection
> it sees; pgbouncer reassigns connections per transaction; the next call
> gets 'prepared statement does not exist'. Fix: statement_cache_size=0, or
> session-mode bouncer, or talk straight to Postgres.

## Tips

- asyncpg uses libpq-style `$1`, `$2` placeholders — NOT `%s` like psycopg/DBAPI. Mixing them is a common porting bug.
- Records are tuples AND dicts: `row[0]` and `row["id"]` both work. They're immutable; convert via `dict(row)` if you need to mutate.
- Set `statement_cache_size=0` when going through pgbouncer in transaction mode — otherwise prepared statements get orphaned and queries fail with "prepared statement does not exist".
- COPY (`copy_records_to_table`, `copy_to_table`) is the bulk-load primitive. It accepts lists, async iterators, and files — pick what your data source already produces.
- Use `init=callback` on `create_pool` to register custom type codecs (UUID, JSONB, domain types) once per connection — much cheaper than per-query.
- For SQLAlchemy 2.x async, the URL is `postgresql+asyncpg://...`. Pair it with `pool_pre_ping=True` and pass `prepared_statement_cache_size=0` via `connect_args` when behind pgbouncer.

## Common Mistake

> [!warning] Leaving `statement_cache_size` at its default behind pgbouncer in transaction mode. asyncpg prepares statements per-connection; pgbouncer hands you a different backend connection on each transaction; the prepared statement is gone, and queries fail with "prepared statement \"_pg0\" does not exist". Set `statement_cache_size=0` or move pgbouncer to session mode.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Behind pgbouncer transaction-mode — broken
pool = await asyncpg.create_pool(DSN)
# default statement_cache_size=100
```

**Senior:**
```python
# Behind pgbouncer transaction-mode — fixed
pool = await asyncpg.create_pool(DSN, statement_cache_size=0)
```

## See Also

- [[Sections/database/drivers/psycopg3|psycopg 3 — modern PostgreSQL driver (Databases & SQLAlchemy)]]
- [[Sections/database/drivers/_Index|Databases & SQLAlchemy → DB-API Drivers — Postgres & SQLite]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

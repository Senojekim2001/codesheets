---
type: "entry"
domain: "python"
file: "database"
section: "drivers"
id: "aiosqlite"
title: "aiosqlite — async wrapper around sqlite3"
category: "SQLite Drivers"
subtitle: "aiosqlite.connect, async cursor / fetch / executemany, run_in_executor under the hood, asyncio.to_thread alternative"
signature_short: "async with aiosqlite.connect(\"app.db\") as db: async for row in db.execute(sql): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "aiosqlite — async wrapper around sqlite3"
  - "aiosqlite"
tags:
  - "python"
  - "python/database"
  - "python/database/drivers"
  - "category/sqlite-drivers"
  - "tier/tiered"
---

# aiosqlite — async wrapper around sqlite3

> aiosqlite.connect, async cursor / fetch / executemany, run_in_executor under the hood, asyncio.to_thread alternative

## Overview

aiosqlite wraps stdlib sqlite3 by spawning ONE background thread per connection and posting each call onto it. The async API is real; the parallelism is the same as sync sqlite3 — SQLite still serializes writes. The point is integration: call SQLite from FastAPI/aiohttp without blocking the event loop. The three examples below solve the same task at three depths: bare async connect → PRAGMAs + transactional batch → split read/write conns + asyncio.Lock + escape-hatch via asyncio.to_thread.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Insert events into an events table; read the most recent 5.
- **Junior** — SAME: ingest events, read recent — for a batch.
- **Senior** — SAME: bulk-ingest events, read recent — under FastAPI/aiohttp.

## Signature

```python
async with aiosqlite.connect("app.db") as db: async for row in db.execute(sql): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Insert events into an events table; read the most recent 5.
# APPROACH  - async with aiosqlite.connect; await execute; async for row.
# STRENGTHS - Doesn't block the event loop; same SQL as stdlib sqlite3.
# WEAKNESSES- Not faster than sqlite3 — just non-blocking.
import asyncio
import aiosqlite

async def main():
    async with aiosqlite.connect("app.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id         INTEGER PRIMARY KEY,
                name       TEXT NOT NULL,
                payload    TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.execute(
            "INSERT INTO events (name, payload) VALUES (?, ?)",
            ("signup", '{"plan": "pro"}'),
        )
        await db.commit()

        async with db.execute(
            "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
        ) as cur:
            async for row in cur:
                print(row)

asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME: ingest events, read recent — for a batch.
# APPROACH  - Row factory; PRAGMAs at startup; explicit BEGIN IMMEDIATE
#             wrapping executemany; commit/rollback in try/except.
# STRENGTHS- Async-shaped patterns; safe writes; readable.
# WEAKNESSES- aiosqlite has NO pool; one conn per call is wasteful at scale.
import asyncio
import aiosqlite

DB = "app.db"

events = [
    ("signup", '{"plan": "pro"}'),
    ("login",  '{"ok": true}'),
    ("logout", None),
]

async def open_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB, timeout=30.0)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode = WAL")
    await db.execute("PRAGMA foreign_keys = ON")
    await db.execute("PRAGMA synchronous = NORMAL")
    return db

async def main():
    db = await open_db()
    try:
        await db.execute("BEGIN IMMEDIATE")
        try:
            await db.executemany(
                "INSERT INTO events (name, payload) VALUES (?, ?)", events,
            )
            await db.commit()
        except BaseException:
            await db.rollback()
            raise

        async with db.execute(
            "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
        ) as cur:
            async for row in cur:
                print(row["id"], row["name"], row["created_at"])
    finally:
        await db.close()

asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME: bulk-ingest events, read recent — under FastAPI/aiohttp.
# APPROACH  - Long-lived read + write conns; asyncio.Lock serializes writes;
#             asyncio.to_thread() for the bulk path (one hop, not N).
# STRENGTHS - Production-shaped; matches SQLite's one-writer guarantee;
#             escapes aiosqlite's per-call thread-hop on bulk inserts.
# WEAKNESSES- If you need parallel writers, you've outgrown SQLite.
import asyncio
import sqlite3
import aiosqlite
from contextlib import asynccontextmanager
from pathlib import Path

DB_PATH = Path("app.db")

class DB:
    def __init__(self, path: Path):
        self.path = path
        self._read: aiosqlite.Connection | None = None
        self._write: aiosqlite.Connection | None = None
        self._lock = asyncio.Lock()                    # SQLite is one-writer; serialize coros

    async def open(self) -> None:
        async def make(*, ro: bool):
            db = await aiosqlite.connect(
                f"file:{self.path}?mode={'ro' if ro else 'rwc'}",
                uri=True, timeout=30.0,
            )
            db.row_factory = aiosqlite.Row
            if not ro:
                await db.executescript("""
                    PRAGMA journal_mode = WAL;
                    PRAGMA synchronous  = NORMAL;
                    PRAGMA foreign_keys = ON;
                    PRAGMA busy_timeout = 30000;
                """)
            return db
        self._read = await make(ro=True)
        self._write = await make(ro=False)

    async def close(self) -> None:
        if self._read:  await self._read.close()
        if self._write: await self._write.close()

    @asynccontextmanager
    async def write(self):
        assert self._write
        async with self._lock:                          # one in-flight writer at a time
            await self._write.execute("BEGIN IMMEDIATE")
            try:
                yield self._write
                await self._write.commit()
            except BaseException:
                await self._write.rollback()
                raise

    async def read(self, sql: str, params: tuple = ()) -> list[aiosqlite.Row]:
        assert self._read
        async with self._read.execute(sql, params) as cur:
            return await cur.fetchall()

# Bulk path: ONE thread hop (sync sqlite3) instead of N (per-call aiosqlite).
def _bulk_insert_sync(path: str, rows: list[tuple]) -> int:
    con = sqlite3.connect(path, timeout=30.0)
    try:
        con.execute("PRAGMA journal_mode=WAL")
        with con:
            con.executemany("INSERT INTO events (name, payload) VALUES (?, ?)", rows)
        return len(rows)
    finally:
        con.close()

async def ingest_events(rows) -> int:
    return await asyncio.to_thread(_bulk_insert_sync, str(DB_PATH), list(rows))

async def recent_events(db: DB, limit: int = 5):
    return await db.read(
        "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT ?",
        (limit,),
    )

async def main():
    db = DB(DB_PATH); await db.open()
    try:
        n = await ingest_events(((f"evt-{i}", f'{{"i":{i}}}') for i in range(100_000)))
        print(f"ingested {n}")
        for r in await recent_events(db):
            print(r["id"], r["name"], r["created_at"])
    finally:
        await db.close()

asyncio.run(main())

# Decision rule:
#   FastAPI/aiohttp + sqlite          -> aiosqlite for queries; to_thread for bulk
#   bulk insert / large transaction   -> asyncio.to_thread(sync_bulk) — far less overhead
#   tight inner loop over a result    -> to_thread on a sync function — avoid N hops
#   write coroutines that race        -> one asyncio.Lock around writes; you weren't
#                                        getting parallel writes from SQLite anyway
#   reads + writes from same proc     -> separate read-only and read-write conns
#   tests                              -> aiosqlite + ":memory:" or file:t?mode=memory&cache=shared
#   scaling beyond one process         -> stop — switch to Postgres/MySQL
#
# Anti-pattern: launching N concurrent write coroutines on aiosqlite expecting
# parallel throughput. SQLite serializes writes at the file lock; without a
# coordinating asyncio.Lock you'll see cascading "database is locked" errors
# after busy_timeout expires. If you need parallel writes, switch DB.
```

## Decision Rule

```text
FastAPI/aiohttp + sqlite          -> aiosqlite for queries; to_thread for bulk
bulk insert / large transaction   -> asyncio.to_thread(sync_bulk) — far less overhead
tight inner loop over a result    -> to_thread on a sync function — avoid N hops
write coroutines that race        -> one asyncio.Lock around writes; you weren't
                                     getting parallel writes from SQLite anyway
reads + writes from same proc     -> separate read-only and read-write conns
tests                              -> aiosqlite + ":memory:" or file:t?mode=memory&cache=shared
scaling beyond one process         -> stop — switch to Postgres/MySQL
```

## Anti-Pattern

> [!warning] Anti-pattern
> launching N concurrent write coroutines on aiosqlite expecting
> parallel throughput. SQLite serializes writes at the file lock; without a
> coordinating asyncio.Lock you'll see cascading "database is locked" errors
> after busy_timeout expires. If you need parallel writes, switch DB.

## Tips

- aiosqlite is sqlite3 + a background thread per connection. It does NOT make SQLite faster — it just keeps your event loop unblocked. If you don't have an event loop, you don't need it.
- Use aiosqlite when async ergonomics matter (FastAPI, aiohttp); use stdlib sqlite3 + `asyncio.to_thread()` when you have a chunky synchronous block — fewer thread hops.
- There is NO connection pool. Each `aiosqlite.connect()` spawns a worker thread. Open a small fixed number of long-lived connections rather than one per request.
- Serialize writes with an `asyncio.Lock`. SQLite gives you exactly one writer at a time; without a lock, racing coroutines hit `busy_timeout` and fail noisily.
- For SQLAlchemy 2.x async + SQLite, the URL is `sqlite+aiosqlite:///app.db`. Set the same WAL/foreign_keys PRAGMAs via an `event.listen` on `connect`.
- `async with db.execute(...) as cur` properly closes the cursor. Direct `await db.execute(...)` is fine for INSERT/UPDATE/DELETE where you don't iterate.

## Common Mistake

> [!warning] Spawning many concurrent write coroutines on aiosqlite expecting parallel throughput. SQLite is single-writer; the writes serialize at the file lock; the contention manifests as cascading "database is locked" errors after `busy_timeout` expires. Use one `asyncio.Lock` around writes — you're not losing parallelism you ever had.

## Shorthand (Junior → Senior)

**Junior:**
```python
# 50 concurrent writers — locks cascade
await asyncio.gather(*(write_one(db, r) for r in rows))
```

**Senior:**
```python
# Serialized writes — predictable, no lock errors
async with write_lock:
    await db.executemany("INSERT INTO t VALUES (?, ?)", rows)
    await db.commit()
```

## See Also

- [[Sections/database/drivers/sqlite3-stdlib|sqlite3 — Python stdlib SQLite driver (Databases & SQLAlchemy)]]
- [[Sections/database/drivers/_Index|Databases & SQLAlchemy → DB-API Drivers — Postgres & SQLite]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

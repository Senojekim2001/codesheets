---
type: "entry"
domain: "python"
file: "database"
section: "drivers"
id: "sqlite3-stdlib"
title: "sqlite3 — Python stdlib SQLite driver"
category: "SQLite Drivers"
subtitle: "sqlite3.connect, row_factory, executemany, PRAGMA journal_mode=WAL, foreign_keys=ON, isolation_level"
signature_short: "with sqlite3.connect(\"app.db\") as con: con.execute(\"INSERT INTO t VALUES (?, ?)\", (1, \"x\"))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sqlite3 — Python stdlib SQLite driver"
  - "sqlite3-stdlib"
tags:
  - "python"
  - "python/database"
  - "python/database/drivers"
  - "category/sqlite-drivers"
  - "tier/tiered"
---

# sqlite3 — Python stdlib SQLite driver

> sqlite3.connect, row_factory, executemany, PRAGMA journal_mode=WAL, foreign_keys=ON, isolation_level

## Overview

sqlite3 ships with Python — no install — and is wildly underused. SQLite is a serverless library; the database is one file; concurrent writes serialize but reads scale. Three PRAGMAs unlock 90% of its real performance: WAL, foreign_keys, busy_timeout. Use it for: app config, test fixtures, ETL staging, single-machine analytics. The three examples below solve the same task — ingest events into a table and read the recent ones — at increasing depths: bare connect → tuned PRAGMAs + transactional batch → custom codec + per-thread conns + tuned write transaction.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Insert events into an events table; read the most recent 5.
- **Junior** — SAME: ingest events, read recent — for a batch.
- **Senior** — SAME: bulk-ingest events and read recent — production-grade.

## Signature

```python
with sqlite3.connect("app.db") as con: con.execute("INSERT INTO t VALUES (?, ?)", (1, "x"))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Insert events into an events table; read the most recent 5.
# APPROACH  - sqlite3.connect, ? placeholders, fetchall, explicit commit.
# STRENGTHS - Zero install; one file = one database; injection-safe.
# WEAKNESSES- Defaults are conservative — slow writes, FKs OFF.
import sqlite3

con = sqlite3.connect("app.db")
con.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id         INTEGER PRIMARY KEY,
        name       TEXT NOT NULL,
        payload    TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )
""")
con.execute(
    "INSERT INTO events (name, payload) VALUES (?, ?)",
    ("signup", '{"plan": "pro"}'),
)
con.commit()                                          # explicit; default isolation_level commits per stmt

for row in con.execute(
    "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
):
    print(row)                                        # tuples
con.close()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME: ingest events, read recent — for a batch.
# APPROACH  - Row factory for dicts; the three "wake-up" PRAGMAs at startup;
#             executemany inside ONE transaction (`with con:`).
# STRENGTHS - ~100× faster than per-row commits; FKs actually enforced;
#             readers don't block writers under WAL.
# WEAKNESSES- Single-process only; cross-thread requires per-thread conn.
import sqlite3

def open_db(path: str) -> sqlite3.Connection:
    con = sqlite3.connect(path, timeout=30.0)         # block, don't error, on 'database is locked'
    con.row_factory = sqlite3.Row                      # row[0] AND row["col"]
    con.execute("PRAGMA journal_mode = WAL")           # readers don't block writers
    con.execute("PRAGMA foreign_keys = ON")            # default is OFF — silent FK violations otherwise
    con.execute("PRAGMA synchronous = NORMAL")         # fsync less; safe under WAL
    return con

events = [
    ("signup", '{"plan": "pro"}'),
    ("login",  '{"ok": true}'),
    ("logout", None),
]

con = open_db("app.db")
with con:                                              # ONE transaction: commits / rolls back atomically
    con.executemany(
        "INSERT INTO events (name, payload) VALUES (?, ?)",
        events,
    )

rows = con.execute(
    "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT 5"
).fetchall()
for r in rows:
    print(r["id"], r["name"], r["created_at"])
con.close()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME: bulk-ingest events and read recent — production-grade.
# APPROACH  - Custom dict<->JSON codec; manual BEGIN IMMEDIATE write txn;
#             mmap_size for read perf; per-thread connections.
# STRENGTHS - Embedded DB ready for single-machine deploy; survives crashes;
#             ~100k inserts/sec on commodity disk.
# WEAKNESSES- Still single-writer at any instant; not Postgres at multi-host.
import sqlite3
import json
import threading
from contextlib import contextmanager

# Codec — Python dicts in, Python dicts out.
sqlite3.register_adapter(dict, json.dumps)
sqlite3.register_converter("JSON", json.loads)

_local = threading.local()

def thread_conn(path: str) -> sqlite3.Connection:
    """One connection per thread (threading.local). check_same_thread alone is NOT enough."""
    if not hasattr(_local, "conn"):
        con = sqlite3.connect(
            path, timeout=30.0,
            detect_types=sqlite3.PARSE_DECLTYPES,      # turns on the JSON converter
            isolation_level=None,                       # MANUAL transactions; we own BEGIN/COMMIT
        )
        con.row_factory = sqlite3.Row
        con.executescript("""
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous  = NORMAL;
            PRAGMA foreign_keys = ON;
            PRAGMA busy_timeout = 30000;          -- ms
            PRAGMA mmap_size    = 268435456;       -- 256MB read mmap
        """)
        _local.conn = con
    return _local.conn

@contextmanager
def write_txn(con: sqlite3.Connection):
    """Acquires the write lock IMMEDIATELY; rolls back on raise."""
    con.execute("BEGIN IMMEDIATE")                     # fail-fast vs deferred BEGIN
    try:
        yield
        con.commit()
    except BaseException:
        con.rollback()
        raise

def ingest_events(con: sqlite3.Connection, rows) -> int:
    """One transaction, one executemany — ~100k inserts/sec on SSD."""
    rows = list(rows)
    with write_txn(con):
        con.executemany("INSERT INTO events (name, payload) VALUES (?, ?)", rows)
    return len(rows)

def recent_events(con: sqlite3.Connection, limit: int = 5):
    return con.execute(
        "SELECT id, name, created_at FROM events ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()

con = thread_conn("app.db")
n = ingest_events(con, ((f"evt-{i}", json.dumps({"i": i})) for i in range(100_000)))
print(f"ingested {n}")
for r in recent_events(con):
    print(r["id"], r["name"], r["created_at"])

# Decision rule:
#   single-process app                 -> stdlib sqlite3 + WAL + foreign_keys ON
#   web app, single instance           -> sqlite3 + immediate write txns; ~10k req/s OK
#   web app, multi-host or NFS         -> NOT sqlite3 — switch to Postgres/MySQL
#   tests                              -> file:test?mode=memory&cache=shared (multi-conn)
#   bulk load                          -> ONE txn wrapping executemany — ~100k/sec
#   per-row commit in a loop           -> NEVER; ~100/sec — fsync per row
#   threads in one process             -> one connection per thread (threading.local)
#   live backup                         -> con.backup(dst) — incremental, no app downtime
#
# Anti-pattern: per-row commits in a tight loop. The default isolation_level
# wraps every statement in an implicit transaction; each commit fsyncs the
# journal. 100,000 inserts -> ~1000s with per-row commits, ~1s wrapped in one
# txn. `with con:` or `BEGIN IMMEDIATE` is the difference between toy and
# production throughput.
```

## Decision Rule

```text
single-process app                 -> stdlib sqlite3 + WAL + foreign_keys ON
web app, single instance           -> sqlite3 + immediate write txns; ~10k req/s OK
web app, multi-host or NFS         -> NOT sqlite3 — switch to Postgres/MySQL
tests                              -> file:test?mode=memory&cache=shared (multi-conn)
bulk load                          -> ONE txn wrapping executemany — ~100k/sec
per-row commit in a loop           -> NEVER; ~100/sec — fsync per row
threads in one process             -> one connection per thread (threading.local)
live backup                         -> con.backup(dst) — incremental, no app downtime
```

## Anti-Pattern

> [!warning] Anti-pattern
> per-row commits in a tight loop. The default isolation_level
> wraps every statement in an implicit transaction; each commit fsyncs the
> journal. 100,000 inserts -> ~1000s with per-row commits, ~1s wrapped in one
> txn. `with con:` or `BEGIN IMMEDIATE` is the difference between toy and
> production throughput.

## Tips

- PRAGMAs that matter: `journal_mode=WAL` (readers don't block writers), `foreign_keys=ON` (default OFF — silent constraint violations), `busy_timeout=30000` (block instead of "database is locked"), `synchronous=NORMAL` (faster, still durable under WAL).
- `?` is THE positional placeholder; `:name` for keyword. NEVER use f-strings or `.format()` — those are SQL-injection holes.
- One connection per thread. `check_same_thread=False` lets you share a connection across threads but doesn't serialize them — concurrent writes will corrupt or raise.
- Use `BEGIN IMMEDIATE` for write transactions you intend to complete; deferred transactions can fail at COMMIT with "database is locked" instead of fast-failing at BEGIN.
- For tests, prefer `file:testdb?mode=memory&cache=shared` over `:memory:` — the latter is per-connection, so a session and a fixture see different empty databases.
- Online backup via `con.backup(dst)` is incremental and doesn't lock the source — far better than copying the file while writers are active.

## Common Mistake

> [!warning] Defaults plus a per-row commit loop = ~100 inserts/sec instead of ~100k. The default isolation level wraps each statement in its own implicit transaction; each commit fsyncs the journal. Wrap the bulk insert in a single transaction (`with con:` or explicit `BEGIN IMMEDIATE`/`COMMIT`) and use `executemany`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-row commits — ~100 inserts/sec
for row in rows:
    con.execute("INSERT INTO t VALUES (?, ?)", row)
    con.commit()
```

**Senior:**
```python
# One transaction + executemany — ~100k inserts/sec
with con:
    con.executemany("INSERT INTO t VALUES (?, ?)", rows)
```

## See Also

- [[Sections/database/drivers/aiosqlite|aiosqlite — async wrapper around sqlite3 (Databases & SQLAlchemy)]]
- [[Sections/database/drivers/_Index|Databases & SQLAlchemy → DB-API Drivers — Postgres & SQLite]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

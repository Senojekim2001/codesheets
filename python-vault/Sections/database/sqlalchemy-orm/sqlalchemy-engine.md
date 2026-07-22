---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-engine"
title: "create_engine() — Connection Pool & Engine"
category: "ORM Setup"
subtitle: "create_engine, pool_size, max_overflow, echo, future=True (default in 2.x), connection URL"
signature_short: "engine = create_engine(url, pool_size=5, max_overflow=10, echo=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "create_engine() — Connection Pool & Engine"
  - "sqlalchemy-engine"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-setup"
  - "tier/tiered"
---

# create_engine() — Connection Pool & Engine

> create_engine, pool_size, max_overflow, echo, future=True (default in 2.x), connection URL

## Overview

create_engine() builds a lazy connection pool — connections are not opened until first query. The Engine is the canonical entry point: instantiate once at startup, share across the process. Pool defaults (5 + 10 overflow) are conservative; tune for your workload. echo=True logs every SQL statement — invaluable for debugging, expensive in production.

## Signature

```python
engine = create_engine(url, pool_size=5, max_overflow=10, echo=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Engine per process; connection string declares everything.
# STRENGTHS - Lazy pool — no connections opened until first query.
# WEAKNESSES- echo=True is noisy; turn off in production.
from sqlalchemy import create_engine

engine = create_engine("sqlite:///app.db", echo=True)

with engine.connect() as conn:
    result = conn.execute("SELECT 1")
    print(result.scalar())                  # 1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Tune pool for the real workload; pre_ping for stale connections; pool_recycle for long-lived processes.
# STRENGTHS - Survives DB restarts, network blips, and idle-connection drops by load balancers.
# WEAKNESSES- pool_pre_ping adds one round-trip per checkout; for ultra-hot paths, prefer pool_recycle alone.
from sqlalchemy import create_engine

# Postgres production engine.
engine = create_engine(
    "postgresql+psycopg://user:pass@db.example.com/app",
    pool_size=10,                            # steady-state connections
    max_overflow=20,                         # burst capacity
    pool_pre_ping=True,                      # verify connection on checkout
    pool_recycle=3600,                       # close + reopen connections every hour
    connect_args={"connect_timeout": 5},     # don't hang forever on dead host
    echo=False,
)

# Inspect the pool live.
print(engine.pool.status())                  # Pool size: 10 ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Engine per process (NEVER per request); secret-aware URL building; pool sizing tied to worker count; observability hooks.
# STRENGTHS - One config that survives restarts, scales horizontally, and emits telemetry to existing pipelines.
# WEAKNESSES- Async drivers (asyncpg) need create_async_engine — the sync API works for most apps; switch only when you have async I/O elsewhere.
from __future__ import annotations
import logging, os
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool

log = logging.getLogger(__name__)

def build_engine() -> Engine:
    """One canonical Engine, built at startup."""
    url = (
        f"postgresql+psycopg://"
        f"{os.environ['DB_USER']}:{os.environ['DB_PASS']}"
        f"@{os.environ['DB_HOST']}:{os.environ.get('DB_PORT', '5432')}"
        f"/{os.environ['DB_NAME']}"
    )
    # Workers x pool_size = total connection budget. With 4 workers x pool_size=5
    # = 20 baseline + 40 overflow = 60 max. Match this to Postgres max_connections.
    engine = create_engine(
        url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_timeout=30,                          # raise rather than block forever
        connect_args={
            "connect_timeout": 5,
            "options": "-c statement_timeout=30000",  # 30s server-side query timeout
            "application_name": "myapp-prod",          # shows in pg_stat_activity
        },
        execution_options={
            "isolation_level": "READ_COMMITTED",      # be explicit
        },
    )

    # Observability: log slow queries.
    @event.listens_for(engine, "before_cursor_execute")
    def _before(conn, cursor, statement, parameters, context, executemany):
        context._query_start = __import__("time").perf_counter()

    @event.listens_for(engine, "after_cursor_execute")
    def _after(conn, cursor, statement, parameters, context, executemany):
        elapsed = __import__("time").perf_counter() - context._query_start
        if elapsed > 0.5:
            log.warning("slow query (%.2fs): %s", elapsed, statement[:200])
    return engine

ENGINE = build_engine()

# Decision rule:
#   sync ORM, web app                    -> create_engine + QueuePool (default)
#   async (FastAPI/aiohttp)              -> create_async_engine + AsyncSession
#   serverless / Lambda                  -> NullPool (no pooling — function may freeze)
#   long-running job / cron              -> NullPool or pool_recycle tied to job duration
#   unit tests                           -> StaticPool with sqlite:///:memory:
#   pool sizing                           -> workers * pool_size <= db.max_connections * 0.8
#   isolation level                       -> READ_COMMITTED default; SERIALIZABLE for money/inventory
#   query timeout                         -> server-side (statement_timeout) NOT client-side; client times out leave rogue queries running on the DB
#
# Anti-pattern: creating a fresh Engine per request. Each one builds a new
# pool, opens 5+ connections, and dies after one query — exhausting the
# database's connection limit in seconds. Engine is a SINGLETON per process.
```

## Decision Rule

```text
sync ORM, web app                    -> create_engine + QueuePool (default)
async (FastAPI/aiohttp)              -> create_async_engine + AsyncSession
serverless / Lambda                  -> NullPool (no pooling — function may freeze)
long-running job / cron              -> NullPool or pool_recycle tied to job duration
unit tests                           -> StaticPool with sqlite:///:memory:
pool sizing                           -> workers * pool_size <= db.max_connections * 0.8
isolation level                       -> READ_COMMITTED default; SERIALIZABLE for money/inventory
query timeout                         -> server-side (statement_timeout) NOT client-side; client times out leave rogue queries running on the DB
```

## Anti-Pattern

> [!warning] Anti-pattern
> creating a fresh Engine per request. Each one builds a new
> pool, opens 5+ connections, and dies after one query — exhausting the
> database's connection limit in seconds. Engine is a SINGLETON per process.

## Tips

- create_engine is lazy — use engine.connect() in a startup health check to fail fast on bad credentials.
- pool_pre_ping costs one extra round-trip per checkout but saves you from "connection closed by peer" errors after DB restarts or load-balancer idle timeouts.
- For Postgres, set connect_args={"options": "-c statement_timeout=30000"} so runaway queries die at the database, not just the client.
- application_name in connect_args makes engine instances identifiable in pg_stat_activity — invaluable when debugging which service is holding connections.
- In tests, use create_engine("sqlite:///:memory:", poolclass=StaticPool, connect_args={"check_same_thread": False}) so all sessions share one in-memory DB.

## Common Mistake

> [!warning] Creating a new Engine per request or per session. Engines own connection pools — duplicating them duplicates pool overhead and exhausts the database's connection limit. Build ONE engine at startup, share it.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-request engine (ANTI-PATTERN)
def handler(req):
    engine = create_engine("postgresql://...")     # new pool every call!
    with engine.connect() as conn:
        return conn.execute(...).all()
```

**Senior:**
```python
# Module-level engine, shared across requests
ENGINE = create_engine("postgresql://...", pool_size=10, pool_pre_ping=True)
def handler(req):
    with ENGINE.connect() as conn:
        return conn.execute(...).all()
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T] (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

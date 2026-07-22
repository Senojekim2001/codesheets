---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-core"
id: "connection-pool"
title: "Connection Pool — QueuePool, NullPool, StaticPool, sizing"
category: "Core Setup"
subtitle: "QueuePool, NullPool, StaticPool, AssertionPool, pool_size, max_overflow, pool_recycle, pool_pre_ping, pool_timeout"
signature_short: "create_engine(url, pool_size=10, max_overflow=20, pool_pre_ping=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Connection Pool — QueuePool, NullPool, StaticPool, sizing"
  - "connection-pool"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-core"
  - "category/core-setup"
  - "tier/tiered"
---

# Connection Pool — QueuePool, NullPool, StaticPool, sizing

> QueuePool, NullPool, StaticPool, AssertionPool, pool_size, max_overflow, pool_recycle, pool_pre_ping, pool_timeout

## Overview

A connection pool keeps a set of open connections ready to reuse, avoiding the cost of opening one per query. QueuePool is the default for long-running servers — pool_size connections kept open, max_overflow burst capacity. NullPool opens-and-closes per checkout (correct for forking servers and serverless). StaticPool keeps one connection forever (correct for in-memory SQLite tests). Wrong pool = subtle bugs (forked file descriptors), wrong sizing = exhausted DB connections.

## Signature

```python
create_engine(url, pool_size=10, max_overflow=20, pool_pre_ping=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - QueuePool defaults work for most apps; tune pool_size and max_overflow.
# STRENGTHS - Connections persist across requests; no open-on-each-query cost.
# WEAKNESSES- Default pool_size=5 is small for production; one app server can hit it under modest load.
from sqlalchemy import create_engine

# Default pool — 5 base connections, 10 overflow, 30s checkout timeout.
engine = create_engine(
    "postgresql+psycopg://user:pw@host/db",
    pool_size=10,                            # steady connections
    max_overflow=20,                         # burst capacity
    pool_timeout=30,                         # raise rather than block forever
)

print(engine.pool.status())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - pool_pre_ping for stale connection detection; pool_recycle for forced rotation; NullPool for serverless / forking workers.
# STRENGTHS - Survives DB restarts, network blips, and idle-connection timeouts.
# WEAKNESSES- pre_ping costs one extra round-trip per checkout; in ultra-hot paths, pool_recycle alone is enough.
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool, QueuePool

# Long-running server — QueuePool with health checking.
server_engine = create_engine(
    "postgresql+psycopg://...",
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,                      # validate before checkout
    pool_recycle=1800,                       # rotate every 30 min
)

# Serverless / Lambda — NullPool. Lambda freezes between invocations; pooled
# connections die during the freeze. NullPool opens fresh per checkout.
lambda_engine = create_engine(
    "postgresql+psycopg://...",
    poolclass=NullPool,
)

# Forking process model (gunicorn pre-fork, multiprocessing) — NullPool, OR
# call engine.dispose() in each child after fork.
import os
def post_fork(server, worker):
    server_engine.dispose(close=False)       # children get fresh pool, parent keeps its FDs
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pool sized to (workers × pool_size ≤ 80% of DB max_connections); StaticPool for in-memory tests; observability hooks; per-engine application_name.
# STRENGTHS - Predictable connection budget across the whole fleet; pool exhaustion impossible by construction.
# WEAKNESSES- Postgres max_connections is a hard cap; budget for monitoring + standby + admin connections too.
from __future__ import annotations
import os
from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool, NullPool, StaticPool

# 1) Production engine — connection budget calculated from worker count.
WORKERS = int(os.environ.get("WEB_CONCURRENCY", "4"))
POOL_SIZE = 5
MAX_OVERFLOW = 10
# Budget: 4 workers × (5 + 10) = 60 connections
# Postgres max_connections must be >= 60 + standby buffer (typically + 20)

engine = create_engine(
    os.environ["DATABASE_URL"],
    poolclass=QueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=30,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={
        "connect_timeout": 5,
        "options": "-c statement_timeout=30000",
        "application_name": f"myapp-{os.environ.get('SERVICE_NAME', 'web')}",
    },
)

# 2) Observability — log pool waits, expose stats.
@event.listens_for(engine, "checkout")
def on_checkout(dbapi_conn, conn_record, conn_proxy):
    pool = engine.pool
    if pool.checkedout() > pool.size() * 0.8:
        log.warning("pool near saturation: %s", pool.status())

# 3) In-memory SQLite for tests — must use StaticPool, NOT QueuePool.
test_engine = create_engine(
    "sqlite:///:memory:",
    poolclass=StaticPool,                   # one connection, shared across threads
    connect_args={"check_same_thread": False},
)

# 4) Forking workers — engine.dispose() in post-fork hook.
# gunicorn config:
def post_fork(server, worker):
    engine.dispose(close=False)             # don't close parent's; child resets its pool

# Decision rule:
#   long-running web/api server          -> QueuePool (default), pool_size tied to workers
#   serverless / Lambda / FaaS            -> NullPool — invocations freeze; pooled conns die
#   gunicorn pre-fork / multiprocessing   -> QueuePool + post_fork hook calling engine.dispose(close=False)
#   in-memory SQLite tests                -> StaticPool + check_same_thread=False
#   batch script / one-shot CLI           -> NullPool — pool overhead pointless for one query
#   ORM debug session / unit test         -> AssertionPool — fails loudly if connection escapes
#   pool sizing                            -> workers × (pool_size + max_overflow) ≤ db_max * 0.8
#   stale connections (DB restart)         -> pool_pre_ping=True (cheap insurance)
#   idle-killer load balancers             -> pool_recycle < idle_timeout
#
# Anti-pattern: QueuePool with a forking server and no engine.dispose() after
# fork. Children inherit the parent's open file descriptors (the connections);
# both the parent and children try to use the same socket; the database sees
# protocol errors and closes them all. Either NullPool or post_fork dispose
# — pick one.
```

## Decision Rule

```text
long-running web/api server          -> QueuePool (default), pool_size tied to workers
serverless / Lambda / FaaS            -> NullPool — invocations freeze; pooled conns die
gunicorn pre-fork / multiprocessing   -> QueuePool + post_fork hook calling engine.dispose(close=False)
in-memory SQLite tests                -> StaticPool + check_same_thread=False
batch script / one-shot CLI           -> NullPool — pool overhead pointless for one query
ORM debug session / unit test         -> AssertionPool — fails loudly if connection escapes
pool sizing                            -> workers × (pool_size + max_overflow) ≤ db_max * 0.8
stale connections (DB restart)         -> pool_pre_ping=True (cheap insurance)
idle-killer load balancers             -> pool_recycle < idle_timeout
```

## Anti-Pattern

> [!warning] Anti-pattern
> QueuePool with a forking server and no engine.dispose() after
> fork. Children inherit the parent's open file descriptors (the connections);
> both the parent and children try to use the same socket; the database sees
> protocol errors and closes them all. Either NullPool or post_fork dispose
> — pick one.

## Tips

- Pool sizing rule of thumb: `workers × (pool_size + max_overflow) ≤ 80% of database max_connections`. Leave headroom for admin, monitoring, and standby connections.
- For Lambda / Cloud Functions / Cloud Run with cold-starts and freezes, use `NullPool`. Pooled connections die during the freeze and the next invocation gets confusing protocol errors.
- For gunicorn / uwsgi pre-fork workers, register a post-fork hook that calls `engine.dispose(close=False)` — child workers must NOT inherit the parent's connection FDs.
- `pool_pre_ping=True` adds one round-trip per checkout but eliminates "connection closed by peer" errors after DB restarts or load-balancer idle timeouts. Cheap insurance.
- For in-memory SQLite tests, you MUST use `StaticPool` + `check_same_thread=False` — otherwise each session opens a fresh `:memory:` database (an empty one) and your tests see no data.

## Common Mistake

> [!warning] Using the default QueuePool with a forking server and no post-fork dispose. The child processes inherit the parent's open connection file descriptors; multiple processes trying to use the same socket trigger protocol errors and connection drops. Either switch to NullPool or call `engine.dispose(close=False)` in your worker post-fork hook.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Forking server — broken: child inherits parent's connection FDs
engine = create_engine(url, pool_size=10)
# (no post_fork dispose)
```

**Senior:**
```python
# Forking server — fixed: each worker gets its own pool
engine = create_engine(url, pool_size=10)
def post_fork(server, worker):
    engine.dispose(close=False)
```

## See Also

- [[Sections/database/sqlalchemy-core/core-vs-orm-decision|Core vs ORM — when to use which (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-core/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — Core]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

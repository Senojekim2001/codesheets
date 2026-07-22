---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "read-sql"
title: "pd.read_sql()"
category: "I/O"
subtitle: "Query any SQLAlchemy-supported database directly into pandas"
signature_short: "pd.read_sql(query, con=engine, params=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.read_sql()"
  - "read-sql"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.read_sql()

> Query any SQLAlchemy-supported database directly into pandas

## Overview

read_sql() executes a SQL query against a database connection and returns the result as a DataFrame. Use SQLAlchemy to create the engine. For writing back, use df.to_sql().

## Signature

```python
pd.read_sql(query, con=engine, params=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one engine, one literal SELECT, one DataFrame back.
# STRENGTHS - shortest path from "I have a query" to "I have a frame";
#             ideal for a notebook or one-off script.
# WEAKNESSES- inline literal values invite SQL injection; no chunking,
#             so a wide query loads everything into memory at once.
#
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("sqlite:///local.db")
df = pd.read_sql("SELECT id, name, amount FROM sales", engine)
df.head()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - parameterized queries (never f-strings), pd.read_sql_table
#             when you want a whole table, and to_sql for write-back
#             with explicit if_exists semantics.
# STRENGTHS - matches the everyday ETL shape; parameter binding closes
#             the SQL-injection hole; if_exists makes write intent
#             explicit (replace vs append).
# WEAKNESSES- still loads the whole result set; default to_sql is
#             row-by-row INSERT — slow for big writes (senior tier).
#
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("postgresql://user:pass@host/db")

# Parameterized — values bound by the driver, not interpolated
df = pd.read_sql(
    "SELECT * FROM sales WHERE year = :year AND region = :region",
    engine,
    params={"year": 2024, "region": "WEST"},
)

# Whole-table read
df = pd.read_sql_table("sales", engine)

# Write — be explicit about replace vs append
df.to_sql("sales_snapshot", engine, if_exists="replace", index=False)
df.to_sql("sales_audit",    engine, if_exists="append",  index=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - chunked reads for large queries, dtype hints to skip
#             pandas' inference pass, server-side cursor for true
#             streaming, fast bulk insert via method="multi" /
#             chunksize, and dispose() on shutdown.
# STRENGTHS - bounded memory regardless of result size; bulk INSERT is
#             10-100x faster than row-by-row; transactional context
#             keeps writes atomic across multiple to_sql calls.
# WEAKNESSES- chunked aggregation logic is awkward to debug; some
#             dialects (older MySQL, Oracle) don't accept the same
#             insert hints; method="multi" can hit max-packet limits
#             on huge frames — tune chunksize.
#
from sqlalchemy import create_engine, text
import pandas as pd

engine = create_engine("postgresql://user:pass@host/db", future=True)

# 1. Chunked, aggregating read — bounded memory
running = []
for chunk in pd.read_sql(
    text("SELECT region, amount FROM events WHERE year = :y"),
    engine,
    params={"y": 2024},
    chunksize=50_000,
    dtype={"amount": "float32"},          # skip inference pass per chunk
):
    running.append(chunk.groupby("region", observed=True)["amount"].sum())

totals = pd.concat(running).groupby(level=0).sum()

# 2. Bulk write with multi-row INSERT — much faster than default
df.to_sql(
    "events_rollup", engine,
    if_exists="append", index=False,
    method="multi", chunksize=10_000,
)

# 3. Multi-statement atomicity
with engine.begin() as conn:
    df.to_sql("staging", conn, if_exists="replace", index=False)
    conn.execute(text("INSERT INTO final SELECT * FROM staging"))

# 4. Always release pooled connections at process exit
engine.dispose()

# Decision rule:
#   Quick SELECT                                -> pd.read_sql(sql, conn)
#   Whole table                                  -> pd.read_sql_table(name, engine)
#   Big result set                                -> chunksize=10000 + concatenate (or stream)
#   Pinned dtypes                                 -> dtype={...} on read or .astype after
#   Parameterized query                           -> params={"id": 7} (NEVER f-string)
#   Speed at scale                                -> connectorx (pip install) — 5-10x faster
#   Want a DataFrame, want SQLAlchemy 2.0         -> session.execute(stmt) + .df() helpers
#   Already have polars/duckdb in the stack      -> read directly there; faster + saner
#
# Anti-pattern: f-string SQL building -> pd.read_sql(f"SELECT * FROM users WHERE id={uid}", conn)
#   Classic SQL injection. Use parameter substitution: pd.read_sql(
#       "SELECT * FROM users WHERE id = :uid", conn, params={"uid": uid})
#   The DBAPI handles quoting and types; you stay safe and your query plan is cacheable.
```

## Decision Rule

```text
Quick SELECT                                -> pd.read_sql(sql, conn)
Whole table                                  -> pd.read_sql_table(name, engine)
Big result set                                -> chunksize=10000 + concatenate (or stream)
Pinned dtypes                                 -> dtype={...} on read or .astype after
Parameterized query                           -> params={"id": 7} (NEVER f-string)
Speed at scale                                -> connectorx (pip install) — 5-10x faster
Want a DataFrame, want SQLAlchemy 2.0         -> session.execute(stmt) + .df() helpers
Already have polars/duckdb in the stack      -> read directly there; faster + saner
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string SQL building -> pd.read_sql(f"SELECT * FROM users WHERE id={uid}", conn)
>   Classic SQL injection. Use parameter substitution: pd.read_sql(
>       "SELECT * FROM users WHERE id = :uid", conn, params={"uid": uid})
>   The DBAPI handles quoting and types; you stay safe and your query plan is cacheable.

## Tips

- Use parameterized queries (`:param`) — never f-string user input into SQL
- `if_exists="replace"` drops and recreates the table; `"append"` adds rows
- `chunksize=` in both read and write — essential for large tables
- Close the engine when done: `engine.dispose()`

## Common Mistake

> [!warning] Using string formatting to inject values into SQL: `f"WHERE year = {year}"`. This is a SQL injection vulnerability. Use `params={"year": year}` instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

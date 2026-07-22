---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "chunked-processing"
title: "Chunked processing"
category: "I/O"
subtitle: "chunksize= in read_csv/read_sql to avoid loading everything at once"
signature_short: "for chunk in pd.read_csv(path, chunksize=100_000): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Chunked processing"
  - "chunked-processing"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# Chunked processing

> chunksize= in read_csv/read_sql to avoid loading everything at once

## Overview

For files or queries too large to fit in memory, chunksize= returns an iterator of DataFrames. Process and aggregate each chunk, then combine results. Parquet with column selection avoids this pattern entirely.

## Signature

```python
for chunk in pd.read_csv(path, chunksize=100_000): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chunksize= turns read_csv into an iterator of DataFrames.
#             Iterate, do something per chunk.
# STRENGTHS - shows the core mechanic in three lines: never load the
#             whole file at once.
# WEAKNESSES- a bare loop without aggregation just shifts the problem —
#             if you append every chunk to a list, you're back to
#             loading everything. The pattern needs a per-chunk reduction.
#
import pandas as pd

for chunk in pd.read_csv("huge.csv", chunksize=100_000):
    print(chunk.shape)        # process one chunk at a time
    # ... do work, then drop the chunk before the next iteration
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the canonical pattern: filter -> partial aggregate ->
#             append a tiny result -> concat + final aggregate at the
#             end. Bounded memory, correct totals.
# STRENGTHS - this is THE chunked-aggregation idiom; the running list
#             only holds reductions, not raw chunks.
# WEAKNESSES- still single-process; for true scale you want Dask /
#             Polars / DuckDB; pure-counting jobs are simpler with
#             collections.Counter (also shown).
#
import pandas as pd
from collections import Counter

# 1. Sum per region across a huge CSV
results = []
for chunk in pd.read_csv(
    "huge.csv",
    chunksize=100_000,
    usecols=["region", "amount"],
    dtype={"region": "category", "amount": "float32"},
):
    agg = (chunk
        .query("amount > 0")
        .groupby("region", observed=True)["amount"]
        .sum())
    results.append(agg)

totals = pd.concat(results).groupby(level=0).sum()

# 2. Counting unique values — Counter is even simpler
counts = Counter()
for chunk in pd.read_csv("huge.csv", chunksize=50_000, usecols=["city"]):
    counts.update(chunk["city"].value_counts().to_dict())

# 3. Same idea against a large SQL result
# for chunk in pd.read_sql("SELECT * FROM events", engine, chunksize=10_000):
#     process(chunk)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - the right tool per scale: Parquet + columns= eliminates
#             chunking for many problems; Dask / Polars / DuckDB scale
#             out to many cores or machines without rewriting in
#             pandas-flavoured chunked Python.
# STRENGTHS - Parquet skips the chunking ceremony entirely for column
#             projections; Dask parallelizes; Polars is faster
#             single-machine; DuckDB lets you SQL over Parquet without
#             loading anything.
# WEAKNESSES- adds a dependency and a new mental model; not worth it
#             for a one-off script. Switch when chunk-and-aggregate is
#             becoming the dominant shape of your code.
#
import pandas as pd

# 1. Skip chunking when columns= solves the problem
df = pd.read_parquet("events.parquet", columns=["region", "amount"])
totals = df.groupby("region", observed=True)["amount"].sum()

# 2. Dask — same pandas API, but parallel and out-of-core
# import dask.dataframe as dd
# ddf = dd.read_csv("huge_*.csv", dtype={"amount": "float32"})
# totals = (ddf.query("amount > 0")
#              .groupby("region")["amount"].sum()
#              .compute())                  # single trigger to materialize

# 3. Polars — faster on a single machine, lazy by default
# import polars as pl
# (pl.scan_csv("huge.csv")
#    .filter(pl.col("amount") > 0)
#    .group_by("region")
#    .agg(pl.col("amount").sum())
#    .collect())

# 4. DuckDB — SQL straight over Parquet, zero loading
# import duckdb
# duckdb.sql('''
#   SELECT region, SUM(amount) AS total
#   FROM 'events/*.parquet'
#   WHERE amount > 0
#   GROUP BY region
# ''').df()

# Anti-pattern: chunks = list(pd.read_csv(f, chunksize=n))
# That materializes the entire file — defeats the purpose.

# Decision rule:
#   File fits in RAM with headroom              -> read once, process whole frame
#   File is 1-10x your RAM                       -> chunksize= + accumulate stats
#   File >> RAM                                  -> dask.dataframe or polars LazyFrame
#   Need to write back chunked results          -> chunksize on read + append parquet partitions
#   Per-chunk aggregation                        -> reduce in the loop, never materialize full df
#   Need joins across chunks                     -> step up to duckdb (read_csv_auto) or polars
#   Bottleneck is parsing                        -> engine="pyarrow" first, chunked second
#   File is JSON / nested                        -> pd.read_json(lines=True, chunksize=N)
```

## Decision Rule

```text
File fits in RAM with headroom              -> read once, process whole frame
File is 1-10x your RAM                       -> chunksize= + accumulate stats
File >> RAM                                  -> dask.dataframe or polars LazyFrame
Need to write back chunked results          -> chunksize on read + append parquet partitions
Per-chunk aggregation                        -> reduce in the loop, never materialize full df
Need joins across chunks                     -> step up to duckdb (read_csv_auto) or polars
Bottleneck is parsing                        -> engine="pyarrow" first, chunked second
File is JSON / nested                        -> pd.read_json(lines=True, chunksize=N)
```

## Anti-Pattern

> [!warning] Anti-pattern
> chunks = list(pd.read_csv(f, chunksize=n))
> That materializes the entire file — defeats the purpose.

## Tips

- Parquet with `columns=` avoids chunked reading for most large-file problems
- The aggregation pattern: chunk → partial agg → concat → final agg
- `chunksize=` returns a `TextFileReader` iterator — do not call `len()` on it
- For truly large data, consider Dask, Polars, or DuckDB instead of chunked pandas

## Common Mistake

> [!warning] Trying to collect all chunks into a list then concatenating. `chunks = list(pd.read_csv(f, chunksize=n))` loads the whole file — defeats the purpose. Aggregate each chunk before appending.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    result.append(x * 2)
```

**Senior:**
```python
result = [x * 2 for x in items]
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

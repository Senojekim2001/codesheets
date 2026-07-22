---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "read-parquet"
title: "pd.read_parquet()"
category: "I/O"
subtitle: "Typed, compressed, column-selective — 10x faster than CSV"
signature_short: "pd.read_parquet(path, columns=None, engine=\"pyarrow\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.read_parquet()"
  - "read-parquet"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.read_parquet()

> Typed, compressed, column-selective — 10x faster than CSV

## Overview

Parquet is a columnar binary format that preserves dtypes, compresses well, and supports column-selective reads. Reading only the columns you need from a large Parquet file is O(columns) not O(all_columns) — a massive win for wide datasets. Always use Parquet for intermediate storage between pipeline steps.

## Signature

```python
pd.read_parquet(path, columns=None, engine="pyarrow")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest round-trip: write a DataFrame to .parquet, read
#             it back. Dtypes survive without any extra ceremony.
# STRENGTHS - shows the immediate win over CSV in three lines: types
#             round-trip, no parse_dates needed, no na_values needed.
# WEAKNESSES- doesn't yet show the real wins (column-selective reads,
#             predicate pushdown, partitioning) — those are the senior
#             reasons to choose Parquet at all.
#
import pandas as pd

df.to_parquet("data.parquet")
df2 = pd.read_parquet("data.parquet")
df2.dtypes        # identical to df.dtypes — types preserved
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: pick a compression codec, restrict
#             columns at read time (huge speedup), and read a directory
#             of partitioned files as one frame.
# STRENGTHS - column-selective reads are the single biggest practical
#             reason to use Parquet over CSV; compression choice is
#             usually a one-liner with measurable size impact.
# WEAKNESSES- doesn't cover row-level predicate pushdown (filters=)
#             which is the next-level optimization for huge files.
#
import pandas as pd

# Write — pick compression based on use case
df.to_parquet("data.parquet")                                # snappy default
df.to_parquet("data_small.parquet", compression="zstd")      # best ratio
df.to_parquet("data_compat.parquet", compression="gzip")     # broadest support

# Read only the columns you need — skips the rest at the file level
df = pd.read_parquet("data.parquet", columns=["id", "date", "amount"])

# Partitioned datasets (directory of files written by Spark/Dask) read
# as one logical DataFrame
df = pd.read_parquet("events/")                              # all partitions
df = pd.read_parquet("events/", columns=["region", "amount"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - row-level predicate pushdown via pyarrow filters,
#             partition pruning when writing, and a streaming read for
#             frames that would still OOM all-at-once.
# STRENGTHS - reads only the row groups whose statistics match the
#             filter — orders of magnitude less I/O on big datasets;
#             partition_cols turns "WHERE year=2024" into "open one
#             folder" without any DB; pyarrow's RecordBatchReader
#             gives bounded-memory streaming.
# WEAKNESSES- predicate pushdown only helps when the file's row-group
#             statistics actually discriminate (sorted/clustered data);
#             over-partitioning produces too many small files and hurts
#             read perf — pick partition columns with care.
#
import pandas as pd
import pyarrow.parquet as pq

# 1. Partitioned write — Hive-style folder layout
df.to_parquet(
    "events/",
    partition_cols=["year", "region"],
    compression="zstd",
    index=False,
)
# events/year=2024/region=WEST/<file>.parquet  (etc.)

# 2. Row-level filter (predicate pushdown) — far less I/O than read-then-filter
table = pq.read_table(
    "events/",
    columns=["id", "amount"],
    filters=[("year", "=", 2024), ("region", "in", ["WEST", "EAST"])],
)
df = table.to_pandas()

# 3. Streaming — bounded memory regardless of file size
pf = pq.ParquetFile("huge.parquet")
running = []
for batch in pf.iter_batches(batch_size=100_000, columns=["region", "amount"]):
    chunk = batch.to_pandas()
    running.append(chunk.groupby("region", observed=True)["amount"].sum())
totals = pd.concat(running).groupby(level=0).sum()

# Standing rule: CSV for human inspection / sharing,
#                Parquet for any intermediate file in a pipeline.

# Decision rule:
#   Modern columnar store                       -> parquet over CSV every time
#   Need only some columns                      -> columns=[...] (zero IO for the rest)
#   Partitioned dataset                         -> pd.read_parquet(dir/, filters=[...])
#   Speed-critical                               -> engine="pyarrow" (default) over fastparquet
#   Need to roundtrip categorical dtypes        -> parquet preserves them; CSV doesn't
#   Cloud (S3 / GCS)                             -> pd.read_parquet("s3://...") (uses fsspec)
#   Cross-process pipeline                       -> parquet is the canonical handoff format
#   Need row-by-row streaming                    -> use pyarrow.dataset directly, not pandas
#
# Anti-pattern: round-tripping data through CSV instead of parquet
#   CSV strips dtypes, doesn't preserve nulls vs empty strings, can't store
#   categoricals or datetimes natively. Every read pays the inference tax.
#   Parquet is 5-20x smaller, 10-50x faster to read, and lossless on dtypes.
#   Treat CSV as ingestion-only; parquet for everything internal.
```

## Decision Rule

```text
Modern columnar store                       -> parquet over CSV every time
Need only some columns                      -> columns=[...] (zero IO for the rest)
Partitioned dataset                         -> pd.read_parquet(dir/, filters=[...])
Speed-critical                               -> engine="pyarrow" (default) over fastparquet
Need to roundtrip categorical dtypes        -> parquet preserves them; CSV doesn't
Cloud (S3 / GCS)                             -> pd.read_parquet("s3://...") (uses fsspec)
Cross-process pipeline                       -> parquet is the canonical handoff format
Need row-by-row streaming                    -> use pyarrow.dataset directly, not pandas
```

## Anti-Pattern

> [!warning] Anti-pattern
> round-tripping data through CSV instead of parquet
>   CSV strips dtypes, doesn't preserve nulls vs empty strings, can't store
>   categoricals or datetimes natively. Every read pays the inference tax.
>   Parquet is 5-20x smaller, 10-50x faster to read, and lossless on dtypes.
>   Treat CSV as ingestion-only; parquet for everything internal.

## Tips

- Install: `pip install pyarrow` — required for read/write parquet
- `columns=["a","b"]` at read time only loads those columns — skips the rest entirely
- Parquet preserves all pandas dtypes including category, datetime, and nullable int
- Use Parquet for any intermediate file in a pipeline — never CSV between steps

## Common Mistake

> [!warning] Using CSV for intermediate storage between pipeline steps. CSV loses dtypes (forces re-inference on every load), is uncompressed, and is 10x slower to read. Use to_parquet() / read_parquet() instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

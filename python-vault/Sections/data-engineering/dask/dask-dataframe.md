---
type: "entry"
domain: "python"
file: "data-engineering"
section: "dask"
id: "dask-dataframe"
title: "Dask DataFrames — Lazy Distributed Data"
category: "Distributed"
subtitle: "dask.dataframe, dd.read_csv(), lazy computation, partitions, .compute()"
signature_short: "dd.read_csv(path)  |  ddf.compute()  |  ddf.persist()  |  partitions"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dask DataFrames — Lazy Distributed Data"
  - "dask-dataframe"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/dask"
  - "category/distributed"
  - "tier/tiered"
---

# Dask DataFrames — Lazy Distributed Data

> dask.dataframe, dd.read_csv(), lazy computation, partitions, .compute()

## Overview

Dask scales Pandas-like operations to datasets larger than RAM by breaking them into partitions (chunks). Each partition is a Pandas DataFrame. Operations are lazy (not executed until .compute()). ddf = dd.read_csv("*.csv") reads multiple files in parallel, one per partition. .compute() triggers execution. Use Dask for multi-file processing, out-of-core analytics, and workflows that don't fit in memory.

## Signature

```python
dd.read_csv(path)  |  ddf.compute()  |  ddf.persist()  |  partitions
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Read many CSVs as one logical DataFrame; .compute() to materialize
# STRENGTHS - Smallest valid Dask pipeline that scales beyond RAM
# WEAKNESSES- No persistence, no partition tuning
#
import dask.dataframe as dd

ddf = dd.read_csv("data/sales_*.csv")          # one DataFrame, many files

print(ddf.npartitions)                          # one partition per file by default
total = ddf["amount"].sum().compute()           # ONE pass triggers everything
print(total)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Filter / groupby / aggregate, persist for reuse, Parquet I/O
# STRENGTHS - The 80%-case pipeline shape; treats Dask like big-data Pandas
# WEAKNESSES- No map_partitions for custom Pandas logic
#
import dask.dataframe as dd

ddf = dd.read_parquet("s3://lake/sales/")       # Parquet > CSV for Dask

# Build the lazy plan
hot = (ddf[ddf["amount"] > 100]
         .groupby("region")
         .agg({"amount": "sum", "order_id": "count"}))

# .persist() materializes ONCE and keeps in worker memory — reuse downstream
hot = hot.persist()

# Now multiple computes are fast (data already loaded)
print(hot.compute())
top_5 = hot.nlargest(5, "amount").compute()

# Write back to Parquet — many small files, one per partition
ddf.to_parquet("out/sales_clean/", write_index=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Partition tuning, map_partitions for custom logic, divisions for fast joins/lookups
# STRENGTHS - The patterns that close the gap with native Spark/Polars
# WEAKNESSES- N/A
#
import dask.dataframe as dd
import pandas as pd

# 1) Partition tuning — too many tiny partitions = scheduler overhead.
#    Aim for ~100-500 MB per partition.
ddf = dd.read_csv("data/sales-*.csv", blocksize="128MB")
print(ddf.memory_usage_per_partition().compute())     # diagnose

# 2) map_partitions — operate on each Pandas DataFrame chunk natively.
#    Use this when an operation isn't built into Dask but IS in Pandas.
def normalize_partition(pdf: pd.DataFrame) -> pd.DataFrame:
    pdf = pdf.copy()
    pdf["region"] = pdf["region"].str.upper().str.strip()
    pdf["amount"] = pdf["amount"].clip(lower=0)
    return pdf

ddf = ddf.map_partitions(normalize_partition,
                         meta={"order_id": str, "region": str, "amount": float})

# 3) set_index with KNOWN divisions — turns slow shuffles into fast lookups
#    Most expensive once, fast forever after — write back to Parquet.
ddf_indexed = ddf.set_index("customer_id", sorted=False)        # one expensive shuffle
ddf_indexed.to_parquet("out/sales_by_customer/", overwrite=True)

# Reading the partitioned, sorted output gives FREE divisions for joins
fast = dd.read_parquet("out/sales_by_customer/", calculate_divisions=True)
print(fast.divisions)                                   # (cust_id_min, ..., cust_id_max)

# 4) Memory + result-size guard — never compute without bounding the result
preview = ddf.head(1000)                                # safe sample, returns Pandas
ddf_small_result = ddf.groupby("region")["amount"].sum().compute()  # SMALL — OK
# DON'T:  ddf.compute()    # tries to fit all data into the driver

# Decision rule:
#   data fits in RAM                       -> stay on Pandas / Polars
#   1 GB - 1 TB on one machine             -> dask.dataframe (out-of-core)
#   > 1 TB or multi-node                    -> Spark (Dask works too but Spark dominates)
#   reads MANY small files                  -> dd.read_*("path/*.csv", blocksize=...)
#   custom Pandas op not in Dask API        -> map_partitions with explicit meta=
#   repeatedly reusing same intermediate    -> .persist() ONCE, then compute repeatedly
#   need fast joins/lookups                  -> set_index, write Parquet, read with divisions
#
# Anti-pattern: ddf.compute() on a multi-GB frame, hoping it fits
#   Driver OOMs, or spills to disk and is slower than the lazy chain. Always
#   compute the AGGREGATED / FILTERED result, not the raw frame.
```

## Decision Rule

```text
data fits in RAM                       -> stay on Pandas / Polars
1 GB - 1 TB on one machine             -> dask.dataframe (out-of-core)
> 1 TB or multi-node                    -> Spark (Dask works too but Spark dominates)
reads MANY small files                  -> dd.read_*("path/*.csv", blocksize=...)
custom Pandas op not in Dask API        -> map_partitions with explicit meta=
repeatedly reusing same intermediate    -> .persist() ONCE, then compute repeatedly
need fast joins/lookups                  -> set_index, write Parquet, read with divisions
```

## Anti-Pattern

> [!warning] Anti-pattern
> ddf.compute() on a multi-GB frame, hoping it fits
>   Driver OOMs, or spills to disk and is slower than the lazy chain. Always
>   compute the AGGREGATED / FILTERED result, not the raw frame.

## Tips

- Use .compute() only at the end — keep intermediate steps lazy for optimization.
- .persist() loads data into memory once — reuse it for multiple operations on same data.
- Parquet is much faster than CSV for Dask reads/writes — use Parquet when possible.
- Set blocksize (e.g., "64MB") to control partition size — more partitions = more parallelism but more overhead.

## Common Mistake

> [!warning] Calling .compute() after every operation instead of building lazy chain — defeats parallelization and optimization.

## Shorthand (Junior → Senior)

**Junior:**
```python
import dask.dataframe as dd
ddf = dd.read_csv("data/sales_*.csv")
filtered = ddf[ddf["amount"] > 100]
summary = filtered.groupby("region").agg({"amount": "sum"})
result = summary.compute()
```

**Senior:**
```python
ddf = dd.read_csv("data/sales_*.csv")
ddf[ddf["amount"] > 100].groupby("region").amount.sum().compute()
```

## See Also

- [[Sections/data-engineering/dask/dask-delayed|Dask Delayed — Task Graphs for Custom Logic (Data Engineering)]]
- [[Sections/data-engineering/dask/dask-distributed|Dask Distributed — Multi-Machine Execution (Data Engineering)]]
- [[Sections/data-engineering/dask/_Index|Data Engineering → Dask — Distributed Computing]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

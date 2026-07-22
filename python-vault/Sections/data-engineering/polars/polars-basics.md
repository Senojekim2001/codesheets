---
type: "entry"
domain: "python"
file: "data-engineering"
section: "polars"
id: "polars-basics"
title: "Polars Basics — DataFrames & I/O"
category: "DataFrames"
subtitle: "pl.DataFrame, pl.read_csv(), .select(), .filter(), .with_columns()"
signature_short: "pl.read_csv(path)  |  df.select(col)  |  df.filter(condition)  |  df.with_columns(expr)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Polars Basics — DataFrames & I/O"
  - "polars-basics"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/polars"
  - "category/dataframes"
  - "tier/tiered"
---

# Polars Basics — DataFrames & I/O

> pl.DataFrame, pl.read_csv(), .select(), .filter(), .with_columns()

## Overview

Polars is a modern Rust-backed DataFrame library — much faster than Pandas for large data. API is similar to Pandas but uses expressions (pl.col(), pl.lit()) instead of string column names. Eager by default (like Pandas), but supports lazy evaluation for optimization. pl.read_csv() infers schema automatically. Great for local data processing (not distributed like Spark).

## Signature

```python
pl.read_csv(path)  |  df.select(col)  |  df.filter(condition)  |  df.with_columns(expr)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - read_csv, select, filter, write_parquet
# STRENGTHS - Smallest valid Polars pipeline
# WEAKNESSES- Eager mode; no expression composition shown
#
import polars as pl

df = pl.read_csv("data/sales.csv")

(df.filter(pl.col("amount") > 100)
   .select(["order_id", "amount", "region"])
   .write_parquet("out/high_value.parquet"))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - The full transform/group/sort pipeline with expressions
# STRENGTHS - The shape every Polars script converges on
# WEAKNESSES- Still eager; senior tier covers .lazy()
#
import polars as pl

df = pl.DataFrame({
    "order_id":    ["A1", "A2", "A3", "A4"],
    "customer_id": [1, 2, 1, 3],
    "amount":      [99.99, 149.50, 75.00, 200.00],
    "region":      ["US", "EU", "US", "APAC"],
})

# .select / .filter / .with_columns operate on EXPRESSIONS, not strings
result = (df
    .filter(pl.col("amount") > 50)
    .with_columns([
        (pl.col("amount") * 1.1).alias("with_tax"),
        pl.when(pl.col("amount") > 150).then(pl.lit("high"))
          .when(pl.col("amount") > 75).then(pl.lit("medium"))
          .otherwise(pl.lit("low")).alias("tier"),
    ])
    .sort("amount", descending=True))

# Group + aggregate — pl.col(...).agg_fn() inside .agg([...])
summary = (df.group_by("region")
             .agg([
                 pl.col("amount").sum().alias("total"),
                 pl.col("order_id").count().alias("orders"),
                 pl.col("amount").mean().alias("avg"),
             ])
             .sort("total", descending=True))

# I/O — Parquet for storage, CSV for sharing
summary.write_parquet("out/summary.parquet")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - LazyFrames + scan_*, streaming for big data, schema control, dtype hygiene
# STRENGTHS - The patterns that turn Polars into a production replacement for Pandas
# WEAKNESSES- N/A
#
import polars as pl

# 1) scan_* returns a LazyFrame — no rows materialized until .collect()
lf = pl.scan_parquet("data/sales/*.parquet")              # globbing built in

# 2) Build the full plan; Polars OPTIMIZES (predicate + projection pushdown) before running
plan = (lf
        .filter(pl.col("region") == "US")                  # pushed into the parquet reader
        .with_columns((pl.col("amount") * 1.1).alias("with_tax"))
        .group_by("customer_id")
        .agg(pl.col("with_tax").sum().alias("total"))
        .sort("total", descending=True)
        .head(100))

print(plan.explain())                                       # see the optimized plan
top_100 = plan.collect()                                    # ONE pass

# 3) Streaming engine — for data that doesn't fit in memory
top_100 = plan.collect(streaming=True)                      # processes chunks

# 4) Pin types at construction — never trust inference for dollars / IDs
df = pl.read_csv(
    "data/sales.csv",
    schema_overrides={
        "customer_id": pl.UInt64,
        "amount":      pl.Float64,
        "order_date":  pl.Date,
    },
)

# 5) Pandas interop — only at the boundary, never as a habit
import pandas as pd
pdf = df.to_pandas(use_pyarrow_extension_array=True)        # zero-copy via Arrow
df2 = pl.from_pandas(pdf)

# Decision rule:
#   exploration on small data            -> df = pl.read_*; eager is fine
#   pipeline / production                  -> pl.scan_* + LazyFrame + .collect()
#   data > RAM                             -> .collect(streaming=True)
#   numeric or date column                  -> schema_overrides=, never inference
#   need a sklearn / matplotlib API         -> .to_pandas() at the boundary, then continue
#   reading 1000+ files                      -> pl.scan_parquet("path/*.parquet")
#
# Anti-pattern: calling .collect() between every step
#   df.collect().filter(...).collect().group_by(...).collect()
#   Each .collect() materializes; the optimizer sees nothing. Build the entire
#   chain on a LazyFrame, then ONE .collect() at the end.
```

## Decision Rule

```text
exploration on small data            -> df = pl.read_*; eager is fine
pipeline / production                  -> pl.scan_* + LazyFrame + .collect()
data > RAM                             -> .collect(streaming=True)
numeric or date column                  -> schema_overrides=, never inference
need a sklearn / matplotlib API         -> .to_pandas() at the boundary, then continue
reading 1000+ files                      -> pl.scan_parquet("path/*.parquet")
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling .collect() between every step
>   df.collect().filter(...).collect().group_by(...).collect()
>   Each .collect() materializes; the optimizer sees nothing. Build the entire
>   chain on a LazyFrame, then ONE .collect() at the end.

## Tips

- Use pl.col() for all column references — enables type safety and IDE autocomplete. Never use string column names.
- Polars is single-threaded by default — use POLARS_VERBOSE=1 to see parallelization.
- Use .lazy() for complex pipelines — Polars optimizes the entire plan before execution.
- pl.col().cast() for type conversion, .fillna() for null handling, .str for string operations.
- For pipelines, prefer `pl.scan_*` (returns a LazyFrame) over `pl.read_*` — predicate / projection pushdown happens inside the parquet reader, not after the load
- Data larger than RAM: add `.collect(streaming=True)` — Polars chunks the plan instead of materializing the whole frame
- Pin types with `schema_overrides=` at read time — never rely on inference for IDs or money columns

## Common Mistake

> [!warning] Using Pandas syntax with Polars (df["col"], df.loc[]) — Polars uses expressions (pl.col("col")). Mixing causes errors.

## Shorthand (Junior → Senior)

**Junior:**
```python
import polars as pl
df = pl.read_csv("data.csv")
filtered = df.filter(pl.col("amount") > 100)
selected = filtered.select(["order_id", "amount"])
selected.show()
```

**Senior:**
```python
df = pl.read_csv("data.csv").filter(pl.col("amount") > 100).select(["order_id", "amount"])
```

## See Also

- [[Sections/data-engineering/polars/polars-expressions|Polars Expressions — Expression API & Lazy Evaluation (Data Engineering)]]
- [[Sections/data-engineering/polars/polars-vs-pandas|Polars vs Pandas — When & How to Migrate (Data Engineering)]]
- [[Sections/data-engineering/polars/_Index|Data Engineering → Polars — Fast DataFrames]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

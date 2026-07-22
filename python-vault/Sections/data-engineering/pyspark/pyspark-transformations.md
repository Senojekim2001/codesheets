---
type: "entry"
domain: "python"
file: "data-engineering"
section: "pyspark"
id: "pyspark-transformations"
title: "PySpark Transformations — select, filter, withColumn, groupBy"
category: "Spark"
subtitle: ".select(), .filter(), .withColumn(), .groupBy().agg(), .join()"
signature_short: "df.select(col)  |  df.filter(condition)  |  df.withColumn(name, expr)  |  df.groupBy().agg()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PySpark Transformations — select, filter, withColumn, groupBy"
  - "pyspark-transformations"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/pyspark"
  - "category/spark"
  - "tier/tiered"
---

# PySpark Transformations — select, filter, withColumn, groupBy

> .select(), .filter(), .withColumn(), .groupBy().agg(), .join()

## Overview

Transformations reshape data without materializing to memory. .select() projects columns (and renames/transforms them). .filter() keeps rows matching a condition. .withColumn() adds or replaces columns with computed values. .groupBy().agg() groups rows and applies aggregate functions (sum, count, avg, max). .join() merges DataFrames. All are lazy — executed only when an action (.show(), .collect(), .write) is called.

## Signature

```python
df.select(col)  |  df.filter(condition)  |  df.withColumn(name, expr)  |  df.groupBy().agg()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - select, filter, withColumn — the three you'll use most
# STRENGTHS - Smallest valid transformation chain
# WEAKNESSES- No groupBy, no join
#
from pyspark.sql import functions as F

# df has columns: order_id, customer_id, amount, region
result = (df
          .filter(F.col("amount") > 100)
          .withColumn("amount_with_tax", F.col("amount") * 1.1)
          .select("order_id", "amount_with_tax"))
result.show()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - groupBy + agg, when/otherwise, join, fluent chain
# STRENGTHS - The five operators that cover ~80% of pipeline work
# WEAKNESSES- No window functions, no broadcast hint
#
from pyspark.sql import functions as F

# Bucket rows with when/otherwise (the SQL CASE WHEN of PySpark)
df_cat = df.withColumn(
    "tier",
    F.when(F.col("amount") > 150, "high")
     .when(F.col("amount") > 75,  "medium")
     .otherwise("low"),
)

# groupBy + agg with multiple aggregations and aliases
summary = (df.groupBy("region")
             .agg(F.sum("amount").alias("total"),
                  F.count("order_id").alias("orders"),
                  F.avg("amount").alias("avg_amount")))

# Join — match by single column shared name -> use on=
enriched = df.join(customers, on="customer_id", how="left")

# Chained pipeline — read top-to-bottom, push filters EARLY
result = (df
          .filter((F.col("amount") > 50) & (F.col("region") == "US"))   # filter first -> less data
          .withColumn("amount_dollars", (F.col("amount") / 100).cast("double"))
          .select("order_id", "customer_id", "amount_dollars")
          .orderBy(F.col("amount_dollars").desc()))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Window functions, broadcast joins, skew salting, partition control
# STRENGTHS - The patterns that win the difference between 5 min and 5 hour runs
# WEAKNESSES- N/A
#
from pyspark.sql import Window, functions as F

# 1) Window functions — running totals, rank, lag/lead
w = Window.partitionBy("customer_id").orderBy("order_date")
ranked = (df
    .withColumn("nth_order",      F.row_number().over(w))
    .withColumn("running_total",  F.sum("amount").over(w))
    .withColumn("days_since_last", F.datediff("order_date",
                                              F.lag("order_date").over(w))))

# 2) Broadcast join — when one side is small (< ~10 MB), avoid the shuffle entirely
small_dim = spark.read.parquet("dim/regions/")
fact      = spark.read.parquet("fact/sales/")
joined    = fact.join(F.broadcast(small_dim), on="region", how="left")

# 3) Skew salting — when one key has 100x the rows, distribute artificially
def salted_join(big, small, key, n_salts=10):
    salts = F.array([F.lit(i) for i in range(n_salts)])
    big_salted   = big.withColumn("__salt", F.explode(salts))     # multiplies big by n
    small_salted = (small
                    .withColumn("__salt", F.explode(salts))         # also multiplied
                    .repartition(n_salts, "__salt"))
    return (big_salted.join(small_salted, on=[key, "__salt"], how="inner")
                      .drop("__salt"))

# 4) Partition control — match write partitioning to read query patterns
out = (df.repartition("region", "order_date")            # before write: balance partitions
         .write
         .partitionBy("region", "order_date")             # at write time: physical layout
         .mode("overwrite")
         .parquet("s3://lake/sales/"))

# 5) Read the plan to verify the optimizer did what you expected
ranked.explain(mode="formatted")                          # look for: BroadcastHashJoin, no Exchange near filters

# Decision rule:
#   per-row computation                  -> withColumn + when/otherwise (or pyspark.sql.functions)
#   row-relative-to-group                 -> Window (rank, sum, lag, lead)
#   small + big DataFrame join            -> F.broadcast(small_df)
#   one key dominates joins                -> skew salting
#   downstream queries filter by date     -> .partitionBy("date") on write
#   collect_list / collect_set is huge    -> aggregate THEN limit; never collect_list on big groups
#
# Anti-pattern: groupBy + agg(F.collect_list("col"))
#   Materializes ALL rows per group into a single record. Memory and shuffle
#   blow up. Aggregate to scalars (sum, max, count_distinct) or use windows.

spark = None
df = customers = None
```

## Decision Rule

```text
per-row computation                  -> withColumn + when/otherwise (or pyspark.sql.functions)
row-relative-to-group                 -> Window (rank, sum, lag, lead)
small + big DataFrame join            -> F.broadcast(small_df)
one key dominates joins                -> skew salting
downstream queries filter by date     -> .partitionBy("date") on write
collect_list / collect_set is huge    -> aggregate THEN limit; never collect_list on big groups
```

## Anti-Pattern

> [!warning] Anti-pattern
> groupBy + agg(F.collect_list("col"))
>   Materializes ALL rows per group into a single record. Memory and shuffle
>   blow up. Aggregate to scalars (sum, max, count_distinct) or use windows.

## Tips

- Filter early and often — push filters down the DAG to reduce data volume before expensive operations.
- Use col() for column references — enables type hints and IDE autocomplete. Avoid string literals for column names in transformations.
- withColumn() is for adding 1–2 columns; for many columns, use select() with all transformations at once.
- Aggregations without groupBy() (e.g., df.agg(sum("amount"))) compute global aggregates — returns 1 row.
- Joining a small lookup against a large fact table? Wrap the small one in `F.broadcast(small_df)` — Spark sends it to every executor and skips the shuffle entirely
- Per-row "relative to its group" stats (rank, lag, running totals) need a `Window`, not `groupBy` — `groupBy` collapses the rows you wanted to keep
- Avoid `groupBy + collect_list` on big groups — it materializes every row per key into one record and OOMs the executor. Aggregate to scalars instead

## Common Mistake

> [!warning] Using .rdd.map() for simple transformations — stay in DataFrame API. RDD is slower and loses optimization. Only use RDD for unstructured data.

## Shorthand (Junior → Senior)

**Junior:**
```python
filtered = df.filter((col("amount") > 100) & (col("region") == "US"))
with_tax = filtered.withColumn("tax", col("amount") * 0.1)
by_region = with_tax.groupBy("region").agg(sum("amount").alias("total"))
result = by_region.select("region", "total").orderBy("total")
```

**Senior:**
```python
df.filter((col("amount") > 100) & (col("region") == "US")) \
    .withColumn("tax", col("amount") * 0.1) \
    .groupBy("region").agg(sum("amount").alias("total")) \
    .show()
```

## See Also

- [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data (Data Engineering)]]
- [[Sections/data-engineering/pyspark/_Index|Data Engineering → Apache Spark / PySpark]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

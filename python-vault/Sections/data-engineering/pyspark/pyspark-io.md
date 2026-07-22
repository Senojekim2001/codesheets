---
type: "entry"
domain: "python"
file: "data-engineering"
section: "pyspark"
id: "pyspark-io"
title: "PySpark I/O — Reading & Writing Data"
category: "Spark"
subtitle: "read.parquet(), write.parquet(), Delta Lake, partitioning, save modes"
signature_short: "df.read.parquet(path)  |  df.write.parquet(path)  |  df.write.mode(\"overwrite\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PySpark I/O — Reading & Writing Data"
  - "pyspark-io"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/pyspark"
  - "category/spark"
  - "tier/tiered"
---

# PySpark I/O — Reading & Writing Data

> read.parquet(), write.parquet(), Delta Lake, partitioning, save modes

## Overview

I/O patterns determine pipeline performance. Parquet is the standard — columnar, compressed, preserves types. Delta Lake adds ACID transactions, time travel, and schema enforcement. .write.mode() controls overwrite behavior: "overwrite" (replace), "append" (add rows), "ignore" (skip if exists), "error" (fail if exists). Partitioning by date/region allows incremental reads and parallel writes. Bucketing pre-sorts data for joins.

## Signature

```python
df.read.parquet(path)  |  df.write.parquet(path)  |  df.write.mode("overwrite")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Write Parquet, read Parquet — the default file format
# STRENGTHS - Compressed, columnar, preserves types, fast
# WEAKNESSES- No partitioning; no save mode discussion
#
df.write.mode("overwrite").parquet("data/sales.parquet")

df_again = spark.read.parquet("data/sales.parquet")
df_again.show()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Save modes, partitioning, append for incremental loads
# STRENGTHS - The four knobs every batch pipeline configures
# WEAKNESSES- No Delta, no schema evolution
#
# 1) Save modes — pick deliberately
# overwrite  -> replace path entirely (DELETES files first)
# append     -> add new rows; safest for incremental loads
# ignore     -> skip if path exists; quiet idempotency
# error      -> default; fail if path exists

# 2) Partitioning — pick LOW-cardinality columns the queries filter on
(df.write
   .mode("overwrite")
   .partitionBy("region", "order_date")             # creates region=US/order_date=2024-01-01/...
   .parquet("s3://lake/sales/"))

# 3) Reading partitioned data — Spark prunes partitions automatically
recent_us = (spark.read.parquet("s3://lake/sales/")
                  .where("region = 'US' AND order_date >= '2024-06-01'"))

# 4) Incremental append (new daily batch arrives)
new_batch.write.mode("append").parquet("s3://lake/sales/")

# 5) CSV / JSON ONLY for sharing with non-Spark systems
(df.write.mode("overwrite")
    .option("header", "true")
    .csv("data/export.csv"))                          # one file per partition
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Delta Lake for ACID, partition + bucket layout, schema evolution, file size tuning
# STRENGTHS - The patterns that turn a folder of files into a dependable warehouse
# WEAKNESSES- N/A
#
# 1) Delta Lake — atomic writes, time travel, schema evolution
#    pip install delta-spark   AND   spark = SparkSession.builder
#                                              .config("spark.sql.extensions",
#                                                      "io.delta.sql.DeltaSparkSessionExtension")
#                                              .config("spark.sql.catalog.spark_catalog",
#                                                      "org.apache.spark.sql.delta.catalog.DeltaCatalog")
(df.write.format("delta")
       .mode("overwrite")
       .partitionBy("region")
       .option("overwriteSchema", "true")             # explicit schema replacement
       .save("s3://lake/sales_delta/"))

# Time travel — read a past snapshot
old = (spark.read.format("delta")
            .option("versionAsOf", 12)               # or "timestampAsOf"
            .load("s3://lake/sales_delta/"))

# Atomic UPSERT (MERGE) — Delta only
from delta.tables import DeltaTable
target = DeltaTable.forPath(spark, "s3://lake/sales_delta/")
(target.alias("t")
       .merge(updates.alias("s"), "t.order_id = s.order_id")
       .whenMatchedUpdateAll()
       .whenNotMatchedInsertAll()
       .execute())

# 2) PARTITION key choice — low cardinality (date, region). NEVER user_id, order_id.
#    Too many partitions = small-file problem; too few = no pruning.

# 3) BUCKETING — pre-sort by a high-cardinality key for fast joins
(df.write.mode("overwrite")
    .bucketBy(64, "customer_id")                      # power of 2; > # of executors
    .sortBy("customer_id")
    .saveAsTable("warehouse.sales_bucketed"))

# 4) Target file size — too many small files kill performance
#    Aim for 128-512 MB per Parquet file.
(df.repartition("region")                             # combine within partition
   .sortWithinPartitions("order_date")                # better compression
   .write.mode("overwrite").parquet("s3://lake/sales/"))

#    OR Delta auto-compaction:
#    spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
#    spark.sql("OPTIMIZE delta.`s3://...`")

# Decision rule:
#   data lake on S3 / GCS / ADLS         -> Delta Lake or Iceberg (ACID + time travel)
#   one-shot output for a downstream tool -> Parquet
#   sharing with non-Spark teams           -> CSV or JSON (small data only)
#   queries always filter by date          -> partition by date
#   joins always on customer_id              -> bucket by customer_id (Hive-compatible tables)
#   incremental UPSERT                       -> Delta MERGE; never overwrite-and-rewrite
#
# Anti-pattern: partitionBy("user_id") on millions of users
#   Creates millions of tiny directories; metadata listing dominates query time.
#   Use bucketBy() for high-cardinality keys, partitionBy() only for low-card.

updates = None
```

## Decision Rule

```text
data lake on S3 / GCS / ADLS         -> Delta Lake or Iceberg (ACID + time travel)
one-shot output for a downstream tool -> Parquet
sharing with non-Spark teams           -> CSV or JSON (small data only)
queries always filter by date          -> partition by date
joins always on customer_id              -> bucket by customer_id (Hive-compatible tables)
incremental UPSERT                       -> Delta MERGE; never overwrite-and-rewrite
```

## Anti-Pattern

> [!warning] Anti-pattern
> partitionBy("user_id") on millions of users
>   Creates millions of tiny directories; metadata listing dominates query time.
>   Use bucketBy() for high-cardinality keys, partitionBy() only for low-card.

## Tips

- Use Parquet over CSV/JSON — Parquet is compressed, columnar, and preserves types. CSV is slow and loses schema info.
- Partition by date or region — enables partition pruning. Avoid high-cardinality columns (user_id, order_id) as partition keys.
- Delta Lake adds ACID guarantees and time travel — ideal for production data lakes. Minimal overhead over Parquet.
- Write modes: Use "overwrite" for full rebuilds, "append" for incremental data, "ignore" to skip if exists.

## Common Mistake

> [!warning] Writing CSV files from large DataFrames — CSV is uncompressed, has no schema, and is slow to read back. Use Parquet or Delta Lake.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.write.mode("overwrite").parquet("data/sales.parquet")
df_read = spark.read.parquet("data/sales.parquet")
df.write.mode("overwrite").partitionBy("region").parquet("data/sales_partitioned/")
```

**Senior:**
```python
df.write.parquet("data/sales.parquet")
spark.read.parquet("data/sales.parquet").show()
```

## See Also

- [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions (Data Engineering)]]
- [[Sections/data-engineering/pyspark/_Index|Data Engineering → Apache Spark / PySpark]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

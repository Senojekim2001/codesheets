---
type: "entry"
domain: "python"
file: "data-engineering"
section: "pyspark"
id: "pyspark-basics"
title: "PySpark Basics — SparkSession & DataFrames"
category: "Spark"
subtitle: "SparkSession, spark.read.csv(), DataFrame, .show(), .printSchema()"
signature_short: "spark.read.csv(path)  |  df.show()  |  df.printSchema()  |  df.count()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PySpark Basics — SparkSession & DataFrames"
  - "pyspark-basics"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/pyspark"
  - "category/spark"
  - "tier/tiered"
---

# PySpark Basics — SparkSession & DataFrames

> SparkSession, spark.read.csv(), DataFrame, .show(), .printSchema()

## Overview

PySpark is Python API for Apache Spark — a distributed computing engine for big data. SparkSession is the entry point (like Pandas DataFrame but distributed). spark.read() loads data from CSV, JSON, Parquet, databases. DataFrames are immutable distributed collections of rows. .show() displays first 20 rows (safe for large datasets), .printSchema() shows column types, .count() triggers computation.

## Signature

```python
spark.read.csv(path)  |  df.show()  |  df.printSchema()  |  df.count()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - SparkSession + spark.read.csv + show/printSchema
# STRENGTHS - Smallest valid PySpark file
# WEAKNESSES- inferSchema (slow); no explicit dtypes
#
from pyspark.sql import SparkSession

spark = (SparkSession.builder
         .appName("hello-spark")
         .master("local[*]")           # all CPU cores; YARN/k8s in prod
         .getOrCreate())

df = (spark.read
      .option("header", "true")
      .option("inferSchema", "true")    # OK for exploration only
      .csv("data/sales.csv"))

df.printSchema()
df.show(5)
print("rows:", df.count())             # action — triggers a full pass
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Explicit schema, parquet + csv, builder config, createDataFrame
# STRENGTHS - The shape every production read takes
# WEAKNESSES- No partition pruning, no predicate pushdown discussion yet
#
from pyspark.sql import SparkSession
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType, DoubleType, DateType,
)

spark = (SparkSession.builder
         .appName("etl")
         .config("spark.sql.shuffle.partitions", 200)        # default 200; tune to data
         .config("spark.sql.adaptive.enabled", "true")        # AQE: auto re-partitioning
         .getOrCreate())

# Explicit schema is faster (no scan) AND safer (no surprise types)
schema = StructType([
    StructField("order_id",    StringType(),  nullable=False),
    StructField("customer_id", IntegerType(), nullable=False),
    StructField("amount",      DoubleType(),  nullable=False),
    StructField("region",      StringType()),
    StructField("order_date",  DateType()),
])

df_csv = (spark.read.schema(schema)
          .option("header", "true")
          .csv("s3://bucket/sales/2024-*.csv"))

# Parquet is the standard in lakes — keeps types, smaller, faster
df_parquet = spark.read.parquet("s3://bucket/sales/parquet/")

# Tiny in-memory frames for testing
df_test = spark.createDataFrame(
    [("A1", 1, 99.99, "US"), ("A2", 2, 149.50, "EU")],
    schema="order_id string, customer_id int, amount double, region string",
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Cluster config, partitioning, lazy vs action mental model, caching
# STRENGTHS - The mental model that turns Spark from slow to fast
# WEAKNESSES- N/A
#
from pyspark.sql import SparkSession
from pyspark import StorageLevel

# 1) Builder config the way clusters actually run
spark = (SparkSession.builder
         .appName("warehouse-load")
         .config("spark.sql.adaptive.enabled", "true")               # AQE
         .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
         .config("spark.sql.shuffle.partitions", 800)                # 200 default is too low for big shuffles
         .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
         .getOrCreate())

# 2) Predicate / column pushdown — Spark only reads what it needs from Parquet
df = (spark.read.parquet("s3://lake/sales/")
      .where("region = 'US' AND order_date >= '2024-01-01'")
      .select("order_id", "amount"))                                  # only 2 columns read

# 3) Lazy vs action — every transformation builds the plan; nothing runs until an action
#    Transformations: select, filter, withColumn, groupBy, join, ...
#    Actions:         show, count, collect, write, take, toPandas
#    Calling .count() in dev to "see what's happening" can re-execute the plan.

# 4) Cache the right thing — only DataFrames you'll re-use
hot = (df.groupBy("customer_id").count()
         .persist(StorageLevel.MEMORY_AND_DISK))     # spills to disk if RAM tight
hot.count()                                           # FORCE the cache — first action materializes

# 5) Inspect partitioning before expensive shuffles
print("partitions:", df.rdd.getNumPartitions())
df.explain(mode="formatted")                          # read the physical plan; look for Exchange (shuffle)

# Decision rule:
#   one-shot exploration                 -> inferSchema, .show(), .toPandas()
#   pipeline read                          -> explicit schema; never inferSchema in prod
#   reading from S3 / GCS                  -> Parquet, partitioned by date / tenant
#   re-using a derived frame > 1 time     -> .persist() then trigger an action
#   small final result, drive Python downstream -> .toPandas() at the END
#   massive shuffle producing skew         -> raise spark.sql.shuffle.partitions; consider salting
#
# Anti-pattern: .toPandas() on a 50 GB DataFrame
#   Pulls everything to the driver and OOMs. Filter / aggregate first; convert
#   only the FINAL small result to Pandas.
```

## Decision Rule

```text
one-shot exploration                 -> inferSchema, .show(), .toPandas()
pipeline read                          -> explicit schema; never inferSchema in prod
reading from S3 / GCS                  -> Parquet, partitioned by date / tenant
re-using a derived frame > 1 time     -> .persist() then trigger an action
small final result, drive Python downstream -> .toPandas() at the END
massive shuffle producing skew         -> raise spark.sql.shuffle.partitions; consider salting
```

## Anti-Pattern

> [!warning] Anti-pattern
> .toPandas() on a 50 GB DataFrame
>   Pulls everything to the driver and OOMs. Filter / aggregate first; convert
>   only the FINAL small result to Pandas.

## Tips

- Always use inferSchema=True only for exploration — in production, define explicit schemas for type safety.
- .show() and .count() are actions that trigger computation — transformations like .select() are lazy until an action is called.
- Use .rdd.getNumPartitions() to check partition count — more partitions = more parallelism but more overhead.
- Spark runs in local mode by default (master="local[*]") — use local for development, change to YARN/Kubernetes for production.

## Common Mistake

> [!warning] Calling .show() or .count() repeatedly on the same large DataFrame without caching — cache() holds the result in memory after first compute.

## Shorthand (Junior → Senior)

**Junior:**
```python
from pyspark.sql import SparkSession
spark = SparkSession.builder.appName("app").master("local[*]").getOrCreate()
df = spark.read.option("header", "true").option("inferSchema", "true").csv("data.csv")
print(f"Schema: {df.printSchema()}")
print(f"Row count: {df.count()}")
df.show(10)
```

**Senior:**
```python
spark = SparkSession.builder.appName("app").getOrCreate()
df = spark.read.csv("data.csv", header=True, inferSchema=True)
df.show()
```

## See Also

- [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data (Data Engineering)]]
- [[Sections/data-engineering/pyspark/_Index|Data Engineering → Apache Spark / PySpark]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

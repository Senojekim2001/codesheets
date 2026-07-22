---
type: "entry"
domain: "python"
file: "data-engineering"
section: "pyspark"
id: "pyspark-sql"
title: "PySpark SQL — SQL Queries on DataFrames"
category: "Spark"
subtitle: "spark.sql(), createOrReplaceTempView(), temporary/global views, SQL on DataFrames"
signature_short: "df.createOrReplaceTempView(\"table_name\")  |  spark.sql(\"SELECT ... FROM table\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PySpark SQL — SQL Queries on DataFrames"
  - "pyspark-sql"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/pyspark"
  - "category/spark"
  - "tier/tiered"
---

# PySpark SQL — SQL Queries on DataFrames

> spark.sql(), createOrReplaceTempView(), temporary/global views, SQL on DataFrames

## Overview

PySpark lets you write SQL queries against DataFrames. createOrReplaceTempView() registers a DataFrame as a temporary view (valid for the session). spark.sql() executes SQL and returns a new DataFrame. Use SQL when it's more readable than DataFrame API, or for complex joins/window functions. createGlobalTempView() persists across sessions (rare). SQL queries are optimized by Catalyst optimizer — same performance as DataFrame API.

## Signature

```python
df.createOrReplaceTempView("table_name")  |  spark.sql("SELECT ... FROM table")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Register a temp view, run a SELECT
# STRENGTHS - Smallest path from DataFrame to spark.sql
# WEAKNESSES- No CTE, no joins, no parameterization
#
df.createOrReplaceTempView("sales")

result = spark.sql("""
    SELECT region, COUNT(*) AS n, SUM(amount) AS total
    FROM sales
    GROUP BY region
""")
result.show()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - CTEs, joins across views, mix SQL and DataFrame API
# STRENGTHS - The patterns that handle most analytics work
# WEAKNESSES- No window functions, no parameter substitution
#
df.createOrReplaceTempView("sales")
df_customers.createOrReplaceTempView("customers")

# CTEs (WITH ...) make complex queries readable
hv = spark.sql("""
    WITH high_value AS (
        SELECT * FROM sales WHERE amount > 100
    )
    SELECT
        order_id,
        customer_id,
        ROUND(amount * 1.1, 2) AS amount_with_tax
    FROM high_value
    ORDER BY amount_with_tax DESC
""")

# Join across views — Catalyst optimizes the same as DataFrame API
enriched = spark.sql("""
    SELECT s.order_id, c.name, s.amount, s.region
    FROM sales s
    LEFT JOIN customers c USING (customer_id)
""")

# SQL <-> DataFrame is symmetric; freely chain
from pyspark.sql import functions as F
us_only = (spark.sql("SELECT * FROM sales WHERE region = 'US'")
                .withColumn("amount_dollars", F.col("amount") / 100))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Parameter substitution, window SQL, view scoping, EXPLAIN
# STRENGTHS - Production-shape SQL: parameterized, optimizable, debuggable
# WEAKNESSES- N/A
#
# 1) PARAMETERIZED queries — never f-string user input into Spark SQL
#    (Spark 3.4+ supports {param} substitution — the safe path)
result = spark.sql(
    "SELECT * FROM sales WHERE region = {r} AND amount > {min_amt}",
    args={"r": "US", "min_amt": 100},
)

# 2) Window functions read better in SQL than in DataFrame chains
top_per_customer = spark.sql("""
    SELECT *
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY customer_id
                 ORDER BY amount DESC
               ) AS rn
        FROM sales
    )
    WHERE rn = 1
""")

# 3) View scope — pick the right kind
#    createOrReplaceTempView         -> session-scoped (same SparkSession)
#    createOrReplaceGlobalTempView   -> cross-session, lives in 'global_temp' DB
#                                       reference as 'global_temp.sales'
#    saveAsTable                       -> persisted in the metastore (Hive / Unity)
df.write.mode("overwrite").saveAsTable("warehouse.sales")        # truly persistent

# 4) Read the plan when something is slow
spark.sql("SELECT region, SUM(amount) FROM sales GROUP BY region").explain("formatted")
# Look for:
#   Exchange     -> a shuffle (expensive)
#   Filter       -> ideally pushed down to the data source
#   BroadcastHashJoin -> good when one side is small

# 5) AQE (adaptive query execution) re-optimizes at runtime — turn it on
#    spark.conf.set("spark.sql.adaptive.enabled", "true")
#    spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# Decision rule:
#   complex multi-table query             -> SQL with CTEs, joins, windows
#   chain of small transforms              -> DataFrame API with .withColumn / .filter
#   user-supplied filter values             -> args={...} parameter substitution
#   shared across notebooks / sessions     -> saveAsTable (Hive / Unity Catalog)
#   ad-hoc within ONE session               -> createOrReplaceTempView
#   slow query                              -> .explain() FIRST, then act on the plan
#
# Anti-pattern: f-string interpolation into spark.sql
#   spark.sql(f"SELECT * FROM sales WHERE region = '{user_input}'")
#   That's a SQL-injection-shape bug. Use {param} args= substitution instead.
```

## Decision Rule

```text
complex multi-table query             -> SQL with CTEs, joins, windows
chain of small transforms              -> DataFrame API with .withColumn / .filter
user-supplied filter values             -> args={...} parameter substitution
shared across notebooks / sessions     -> saveAsTable (Hive / Unity Catalog)
ad-hoc within ONE session               -> createOrReplaceTempView
slow query                              -> .explain() FIRST, then act on the plan
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string interpolation into spark.sql
>   spark.sql(f"SELECT * FROM sales WHERE region = '{user_input}'")
>   That's a SQL-injection-shape bug. Use {param} args= substitution instead.

## Tips

- Use createOrReplaceTempView() for session-scoped tables, createGlobalTempView() for cross-session (rare).
- SQL and DataFrame API are interchangeable — mix and match. SQL for complex logic, DataFrame for transformations.
- CTEs (WITH) in Spark SQL work like subqueries — useful for breaking complex queries into readable steps.
- ROUND(), CAST(), CASE WHEN work in Spark SQL just like SQL — leverage SQL functions you know.

## Common Mistake

> [!warning] Forgetting that createOrReplaceTempView() is session-scoped — if you restart the session, the view vanishes. For persistent views, use createOrReplaceGlobalTempView() (creates global_temp.view_name).

## Shorthand (Junior → Senior)

**Junior:**
```python
df.createOrReplaceTempView("sales")
high_value = spark.sql("""
    SELECT order_id, amount
    FROM sales
    WHERE amount > 100
    ORDER BY amount DESC
""")
high_value.show()
```

**Senior:**
```python
df.createOrReplaceTempView("sales")
spark.sql("SELECT * FROM sales WHERE amount > 100").show()
```

## See Also

- [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data (Data Engineering)]]
- [[Sections/data-engineering/pyspark/_Index|Data Engineering → Apache Spark / PySpark]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "data-engineering"
section: "pyspark"
id: "pyspark-udf"
title: "PySpark UDFs — User-Defined Functions"
category: "Spark"
subtitle: "udf(), @pandas_udf, vectorized functions, return types, performance tradeoffs"
signature_short: "@udf(returnType=StringType())  |  @pandas_udf(returnType=DoubleType())  |  F.pandas_udf()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PySpark UDFs — User-Defined Functions"
  - "pyspark-udf"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/pyspark"
  - "category/spark"
  - "tier/tiered"
---

# PySpark UDFs — User-Defined Functions

> udf(), @pandas_udf, vectorized functions, return types, performance tradeoffs

## Overview

UDFs let you apply custom Python logic to Spark columns. Python UDFs (udf()) are slow because they serialize Python, send to workers, execute, deserialize — one row at a time. Pandas UDFs (@pandas_udf) are vectorized — they process batches (Series) and are 3–100x faster. Use Pandas UDFs whenever possible. Both require explicit return types (StructType, IntegerType, StringType, etc.).

## Signature

```python
@udf(returnType=StringType())  |  @pandas_udf(returnType=DoubleType())  |  F.pandas_udf()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Wrap a Python function with udf() and a return type
# STRENGTHS - Smallest valid UDF
# WEAKNESSES- Row-at-a-time serialization — slow; use Pandas UDF in real code
#
from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

@udf(returnType=StringType())
def tier(amount):
    if amount > 150: return "high"
    if amount > 75:  return "medium"
    return "low"

df.withColumn("tier", tier("amount")).show()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pandas UDF (vectorized) for Series -> Series and Series -> struct
# STRENGTHS - 10-100x faster than @udf; built-in for batch transforms
# WEAKNESSES- Requires explicit return type and Series-style code
#
import pandas as pd
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import StringType, DoubleType, StructType, StructField

# 1) Series -> Series: classic vectorized transform
@pandas_udf(DoubleType())
def discount(amounts: pd.Series) -> pd.Series:
    return amounts * 0.9                              # NumPy-fast

df = df.withColumn("amount_disc", discount("amount"))

# 2) Series -> Series: with categorization
@pandas_udf(StringType())
def tier(amounts: pd.Series) -> pd.Series:
    return pd.cut(amounts, bins=[0, 75, 150, float("inf")],
                  labels=["low", "medium", "high"]).astype(str)

df = df.withColumn("tier", tier("amount"))

# 3) Multi-column INPUT and STRUCT output — one UDF, two columns out
schema = StructType([
    StructField("tier", StringType()),
    StructField("tax",  DoubleType()),
])

@pandas_udf(schema)
def tier_and_tax(amounts: pd.Series, region: pd.Series) -> pd.DataFrame:
    return pd.DataFrame({
        "tier": pd.cut(amounts, bins=[0, 75, 150, float("inf")],
                       labels=["low", "medium", "high"]).astype(str),
        "tax":  amounts * 0.1,
    })

df = (df.withColumn("d", tier_and_tax("amount", "region"))
        .select("*", "d.*").drop("d"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Built-ins beat UDFs; grouped Pandas UDFs; ML model serving; performance pitfalls
# STRENGTHS - The decision rules that make UDFs the LAST resort, not the first
# WEAKNESSES- N/A
#
from pyspark.sql import functions as F
from pyspark.sql.types import StringType, DoubleType
import pandas as pd

# 1) FIRST: try Spark built-ins. They run inside the JVM, no serialization tax.
#    BAD:    @udf for "is amount > 100" — kills Catalyst optimization.
#    GOOD:   F.col("amount") > 100 — gets pushed down to the data source.
df_good = df.withColumn(
    "tier",
    F.when(F.col("amount") > 150, "high")
     .when(F.col("amount") > 75,  "medium")
     .otherwise("low"),
)

# 2) When you NEED a UDF: prefer Pandas UDFs (Arrow-backed, batch).
#    Type the function with pd.Series / pd.DataFrame; declare returnType.

# 3) Grouped Pandas UDF — apply a per-group function (e.g., per-customer model)
@F.pandas_udf("customer_id long, amount double, score double")
def per_group_score(g: pd.DataFrame) -> pd.DataFrame:
    g = g.copy()
    g["score"] = (g["amount"] - g["amount"].mean()) / g["amount"].std()
    return g

scored = df.groupBy("customer_id").applyInPandas(per_group_score, schema=per_group_score.returnType)

# 4) Serving an ML model — load ONCE per worker, use module-level state
import sklearn.linear_model as sk
_model = None
def _get_model():
    global _model
    if _model is None:
        _model = load_model("s3://models/v1.pkl")     # heavy: only on first call per executor
    return _model

@F.pandas_udf(DoubleType())
def predict(features: pd.Series) -> pd.Series:
    X = pd.DataFrame(features.tolist())
    return pd.Series(_get_model().predict(X))

# 5) Avoid Python UDFs in JOIN keys, GROUP BY keys, or filter conditions —
#    Spark can't push them down; it materializes the full row first.

# Decision rule:
#   logic exists in F.* / Spark SQL       -> use built-ins, NOT a UDF
#   batch numeric / string transform       -> @pandas_udf (Series -> Series)
#   per-group computation                   -> applyInPandas (DataFrame -> DataFrame)
#   ML inference                              -> Pandas UDF + module-level model load
#   only legacy reason for Python UDF        -> @udf, but profile and budget the cost
#   need to JOIN on derived value             -> precompute the column FIRST, never UDF in join
#
# Anti-pattern: @udf returning Python objects (datetime, dict, list) without spec
#   Spark serializes per row using pickle — orders of magnitude slower than Arrow.
#   Switch to @pandas_udf with explicit return types; the gain is usually 50-100x.

def load_model(_): return None
```

## Decision Rule

```text
logic exists in F.* / Spark SQL       -> use built-ins, NOT a UDF
batch numeric / string transform       -> @pandas_udf (Series -> Series)
per-group computation                   -> applyInPandas (DataFrame -> DataFrame)
ML inference                              -> Pandas UDF + module-level model load
only legacy reason for Python UDF        -> @udf, but profile and budget the cost
need to JOIN on derived value             -> precompute the column FIRST, never UDF in join
```

## Anti-Pattern

> [!warning] Anti-pattern
> @udf returning Python objects (datetime, dict, list) without spec
>   Spark serializes per row using pickle — orders of magnitude slower than Arrow.
>   Switch to @pandas_udf with explicit return types; the gain is usually 50-100x.

## Tips

- Always use @pandas_udf over @udf — Pandas UDFs are 10–100x faster because they process batches with NumPy/Pandas.
- Explicitly type hint the function signature — pd.Series in, pd.Series/DataFrame out, returnType parameter.
- For complex logic (ML models, custom algorithms), Pandas UDFs let you call sklearn, TensorFlow, etc. efficiently.
- UDFs break Catalyst optimization — use built-in Spark functions when possible. Only use UDFs for logic Spark can't express.
- Per-group computation: use `applyInPandas` (DataFrame-in, DataFrame-out) instead of stuffing groupBy logic into a UDF
- ML inference: load the model ONCE at module level (or via a broadcast variable), then call it from a Pandas UDF — re-loading per row is the #1 perf killer

## Common Mistake

> [!warning] Using Python UDFs in production — they serialize Python, run in separate processes, and are 50–100x slower than Pandas UDFs. Always use @pandas_udf or F.pandas_udf().

## Shorthand (Junior → Senior)

**Junior:**
```python
def categorize(amount):
    if amount > 150:
        return "high"
    return "low"

categorize_udf = udf(categorize, StringType())
df.withColumn("category", categorize_udf(col("amount"))).show()
```

**Senior:**
```python
@pandas_udf(StringType())
def categorize(amounts):
    return pd.cut(amounts, bins=[0, 150, float("inf")], labels=["low", "high"])

df.withColumn("category", categorize(col("amount"))).show()
```

## See Also

- [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames (Data Engineering)]]
- [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data (Data Engineering)]]
- [[Sections/data-engineering/pyspark/_Index|Data Engineering → Apache Spark / PySpark]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

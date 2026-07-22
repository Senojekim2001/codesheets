---
type: "entry"
domain: "python"
file: "data-engineering"
section: "polars"
id: "polars-expressions"
title: "Polars Expressions — Expression API & Lazy Evaluation"
category: "DataFrames"
subtitle: "pl.col(), pl.lit(), pl.when().then().otherwise(), .lazy(), .collect()"
signature_short: "pl.col(\"name\")  |  pl.lit(value)  |  pl.when(cond).then(x).otherwise(y)  |  df.lazy().collect()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Polars Expressions — Expression API & Lazy Evaluation"
  - "polars-expressions"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/polars"
  - "category/dataframes"
  - "tier/tiered"
---

# Polars Expressions — Expression API & Lazy Evaluation

> pl.col(), pl.lit(), pl.when().then().otherwise(), .lazy(), .collect()

## Overview

Polars expressions are the core API — they compose transformations without executing immediately (lazy). pl.col() references columns, pl.lit() creates scalar values. pl.when().then().otherwise() is conditional logic. .lazy() defers computation, allowing Polars to optimize the full plan before .collect() executes. Use lazy for complex pipelines.

## Signature

```python
pl.col("name")  |  pl.lit(value)  |  pl.when(cond).then(x).otherwise(y)  |  df.lazy().collect()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - pl.col() and pl.lit() inside select / with_columns
# STRENGTHS - The two building blocks of every Polars expression
# WEAKNESSES- No when/then, no .lazy()
#
import polars as pl

df = pl.DataFrame({"amount": [100, 200, 50]})

# pl.col("name")  references a column
# pl.lit(value)   wraps a Python scalar so it can compose with column expressions
df.with_columns([
    (pl.col("amount") * 1.1).alias("with_tax"),
    pl.lit(0).alias("zero"),
])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - when/then, .str / .dt namespaces, .over() windows, .lazy() basics
# STRENGTHS - The expression toolkit you'll reach for repeatedly
# WEAKNESSES- No struct columns, no list namespace
#
import polars as pl

df = pl.DataFrame({
    "order_id": ["A1", "A2", "A3"],
    "amount":   [99.99, 149.50, 75.00],
    "region":   ["us", "EU", "us"],
    "date":     ["2024-01-01", "2024-02-01", "2024-02-15"],
})

# 1) Conditional logic — when/then/otherwise
df = df.with_columns(
    pl.when(pl.col("amount") > 150).then(pl.lit("high"))
      .when(pl.col("amount") > 75).then(pl.lit("medium"))
      .otherwise(pl.lit("low")).alias("tier"),
)

# 2) Namespaces — .str on string cols, .dt on date/datetime cols
df = df.with_columns([
    pl.col("region").str.to_uppercase().alias("region_uc"),
    pl.col("date").str.to_date().alias("date_parsed"),
])

# 3) .over() — window-style aggregate per group, KEEPING original rows
df = df.with_columns(
    pl.col("amount").mean().over("region").alias("region_avg"),
)

# 4) .lazy() / .collect() — build optimized plans
out = (df.lazy()
         .filter(pl.col("amount") > 80)
         .group_by("region")
         .agg(pl.col("amount").sum().alias("total"))
         .sort("total", descending=True)
         .collect())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Expression composition, structs, list ops, custom UDF (last resort)
# STRENGTHS - The vocabulary that replaces messy apply()-style Pandas code
# WEAKNESSES- N/A
#
import polars as pl

df = pl.DataFrame({
    "order_id": ["A1", "A2", "A3"],
    "items":    [["pen", "ink"], ["book"], ["pen", "book", "tape"]],
    "tags":     ["alpha;beta", "alpha", "beta;gamma"],
    "amount":   [99.99, 149.50, 75.00],
})

# 1) Reusable expression — assign to a variable, plug it in repeatedly
amt_with_tax = (pl.col("amount") * 1.1).alias("amt_tax")
df = df.with_columns(amt_with_tax)
totals = df.lazy().group_by("order_id").agg(amt_with_tax.sum().alias("g_total")).collect()

# 2) List namespace — operate on list columns natively (no explode + group_by)
df = df.with_columns([
    pl.col("items").list.len().alias("n_items"),
    pl.col("items").list.contains("book").alias("has_book"),
])

# 3) Split a string into a list, then operate
df = df.with_columns(
    pl.col("tags").str.split(";").alias("tag_list"),
)
exploded = df.explode("tag_list")                         # one row per tag

# 4) Struct columns — multiple outputs from one expression
df = df.with_columns(
    pl.struct([
        pl.col("amount"),
        (pl.col("amount") * 0.1).alias("tax"),
    ]).alias("billing"),
)
df = df.unnest("billing")                                  # back to flat columns

# 5) map_elements — Python UDF, the LAST resort. Loses parallelism + optimization.
df = df.with_columns(
    pl.col("amount").map_elements(lambda x: f"${x:.2f}", return_dtype=pl.Utf8).alias("display"),
)

# Decision rule:
#   numeric / string / date transform     -> built-in expressions; never map_elements
#   conditional bucket                     -> when/then/otherwise (chain freely)
#   per-group aggregate, keep rows         -> .over(group_col)
#   per-group aggregate, collapse rows     -> .group_by().agg()
#   list / array column                     -> .list.* namespace (len, contains, eval)
#   need multiple outputs from one func     -> pl.struct(...) + .unnest()
#   genuinely needs Python                  -> map_elements with return_dtype= (slow but typed)
#
# Anti-pattern: chains of .apply(lambda ...) translated 1:1 from Pandas
#   You've thrown away Polars' speed advantage. Rewrite the lambda using
#   pl.col / when/then / .str / .dt — only fall back to map_elements when no
#   built-in covers the case.
```

## Decision Rule

```text
numeric / string / date transform     -> built-in expressions; never map_elements
conditional bucket                     -> when/then/otherwise (chain freely)
per-group aggregate, keep rows         -> .over(group_col)
per-group aggregate, collapse rows     -> .group_by().agg()
list / array column                     -> .list.* namespace (len, contains, eval)
need multiple outputs from one func     -> pl.struct(...) + .unnest()
genuinely needs Python                  -> map_elements with return_dtype= (slow but typed)
```

## Anti-Pattern

> [!warning] Anti-pattern
> chains of .apply(lambda ...) translated 1:1 from Pandas
>   You've thrown away Polars' speed advantage. Rewrite the lambda using
>   pl.col / when/then / .str / .dt — only fall back to map_elements when no
>   built-in covers the case.

## Tips

- Always use .lazy() for multi-step pipelines — Polars optimizes the entire query plan before execution.
- pl.col() creates a symbolic reference — it's not a Python object, it's optimized by Polars during execution.
- .over() for window functions — compute aggregates within groups without grouping (keeps original rows).
- Chain expressions: pl.col("x").cast(pl.Int32).fill_null(0) — all in one expression.

## Common Mistake

> [!warning] Calling .collect() at every step instead of .lazy() — defeats the optimization. Build the full plan, then .collect() once.

## Shorthand (Junior → Senior)

**Junior:**
```python
lazy = df.lazy() \
    .filter(pl.col("amount") > 100) \
    .with_columns((pl.col("amount") * 1.1).alias("tax")) \
    .groupby("region").agg(pl.col("tax").sum().alias("total"))
result = lazy.collect()
```

**Senior:**
```python
df.lazy().filter(pl.col("amount") > 100).groupby("region").agg(pl.col("amount").sum()).collect()
```

## See Also

- [[Sections/data-engineering/polars/polars-basics|Polars Basics — DataFrames & I/O (Data Engineering)]]
- [[Sections/data-engineering/polars/polars-vs-pandas|Polars vs Pandas — When & How to Migrate (Data Engineering)]]
- [[Sections/data-engineering/polars/_Index|Data Engineering → Polars — Fast DataFrames]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

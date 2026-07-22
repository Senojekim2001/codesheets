---
type: "entry"
domain: "python"
file: "data-engineering"
section: "etl-patterns"
id: "etl-load"
title: "ETL: Load — Writing to Warehouse & Cloud"
category: "ETL"
subtitle: "to_sql(), BigQuery, S3, Snowflake, upsert, if_exists, transactions"
signature_short: "df.to_sql(table, engine)  |  df.to_gbq()  |  to_parquet(s3://path)  |  MERGE INTO"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ETL: Load — Writing to Warehouse & Cloud"
  - "etl-load"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/etl-patterns"
  - "category/etl"
  - "tier/tiered"
---

# ETL: Load — Writing to Warehouse & Cloud

> to_sql(), BigQuery, S3, Snowflake, upsert, if_exists, transactions

## Overview

Load writes transformed data to target systems. Batch loading: df.to_sql() appends/replaces entire table. Upsert (merge) updates existing rows, inserts new — important for idempotent pipelines. Cloud data warehouses (BigQuery, Snowflake, Redshift) use native MERGE. Always use transactions or staging tables to ensure atomicity — partial failures corrupt data.

## Signature

```python
df.to_sql(table, engine)  |  df.to_gbq()  |  to_parquet(s3://path)  |  MERGE INTO
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - df.to_sql with if_exists='append'
# STRENGTHS - One line; works for any SQL DB SQLAlchemy supports
# WEAKNESSES- Slow for large frames; no atomicity; no upsert
#
import pandas as pd
import sqlalchemy as sa

engine = sa.create_engine("postgresql://user:pass@host/db")
df.to_sql("sales", engine, if_exists="append", index=False)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Transactions, staging-table MERGE for upserts, bulk write modes
# STRENGTHS - The atomic + idempotent shape every batch loader needs
# WEAKNESSES- No COPY-from-S3 / Parquet upload; no BigQuery/Snowflake variants
#
import pandas as pd
import sqlalchemy as sa

engine = sa.create_engine("postgresql://user:pass@host/db")

# 1) Atomic write — engine.begin() rolls back on ANY exception
with engine.begin() as conn:
    df.to_sql("sales", conn,
              if_exists="append",
              index=False,
              method="multi",                     # batch INSERTs (faster)
              chunksize=10_000)                   # per-chunk transaction

# 2) Idempotent UPSERT — load to staging, MERGE, drop. Re-runs are safe.
def upsert(df, engine, table, key):
    staging = f"{table}_staging"
    with engine.begin() as conn:
        df.to_sql(staging, conn, if_exists="replace", index=False)
        conn.execute(sa.text(f"""
            INSERT INTO {table} SELECT * FROM {staging}
            ON CONFLICT ({key}) DO UPDATE SET
              customer_id = EXCLUDED.customer_id,
              amount      = EXCLUDED.amount
        """))                                      # Postgres syntax; MERGE on Snowflake/BQ
        conn.execute(sa.text(f"DROP TABLE {staging}"))

upsert(df, engine, "sales", "order_id")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Bulk-load via cloud storage (COPY), partitioned writes, schema evolution, idempotency
# STRENGTHS - The patterns big-table loads actually use in 2024
# WEAKNESSES- N/A
#
import io
import boto3
import pandas as pd
from google.cloud import bigquery

# 1) BigQuery / Snowflake / Redshift LOAD pattern — never INSERT row by row
#    Step A: write Parquet to cloud storage
#    Step B: COPY / LOAD JOB from that path
buf = io.BytesIO()
df.to_parquet(buf, index=False, compression="snappy")
buf.seek(0)
boto3.client("s3").put_object(Bucket="lake", Key="staging/sales.parquet", Body=buf.getvalue())

# Snowflake: COPY INTO sales FROM @stage_lake/sales.parquet FILE_FORMAT = (TYPE = PARQUET);
# Redshift: COPY sales FROM 's3://lake/staging/sales.parquet' IAM_ROLE 'arn:...' FORMAT AS PARQUET;
# BigQuery: LoadJob from GCS object, write_disposition=WRITE_APPEND, source_format=PARQUET

# 2) BigQuery direct DataFrame load with explicit schema
bq = bigquery.Client(project="my-project")
job = bq.load_table_from_dataframe(
    df,
    "my-project.warehouse.sales",
    job_config=bigquery.LoadJobConfig(
        write_disposition="WRITE_APPEND",          # NEVER WRITE_TRUNCATE in prod
        schema=[
            bigquery.SchemaField("order_id",    "STRING",    "REQUIRED"),
            bigquery.SchemaField("customer_id", "INT64",     "REQUIRED"),
            bigquery.SchemaField("amount",      "NUMERIC",   "REQUIRED"),
            bigquery.SchemaField("order_date",  "TIMESTAMP", "REQUIRED"),
        ],
        time_partitioning=bigquery.TimePartitioning(field="order_date"),
        clustering_fields=["region"],
    ),
)
job.result()                                       # raises on failure

# 3) Idempotent partition replacement — overwrite ONE day, keep others
#    INSERT OVERWRITE `sales` PARTITION (date='{run_date}') ...
#    or, in BigQuery: WRITE_TRUNCATE on a single partition's table-decorator

# 4) Lake-house pattern (Delta / Iceberg) — atomic UPSERT without staging table dance
# from delta.tables import DeltaTable
# (DeltaTable.forPath(spark, "s3://lake/sales/")
#    .alias("t")
#    .merge(spark_df.alias("s"), "t.order_id = s.order_id")
#    .whenMatchedUpdateAll()
#    .whenNotMatchedInsertAll()
#    .execute())

# Decision rule:
#   small DataFrame (< 100k rows)        -> df.to_sql with engine.begin()
#   medium / nightly batch                -> staging table + INSERT ... ON CONFLICT
#   warehouse load (BQ / Snowflake)       -> Parquet to cloud storage + COPY/LOAD job
#   re-runs MUST be safe                   -> partition replace OR upsert; never blind append
#   data lake (Delta / Iceberg)            -> MERGE INTO; gives you ACID + time travel
#   schema evolves                          -> column-add via ALTER (BQ allows nullable adds)
#
# Anti-pattern: if_exists="replace" in production
#   Drops the table, recreates it, loses indexes / grants / partitions, and any
#   parallel reader sees zero rows mid-deploy. Use append + UPSERT, or
#   partition-overwrite for re-runnable loads.

df = None
```

## Decision Rule

```text
small DataFrame (< 100k rows)        -> df.to_sql with engine.begin()
medium / nightly batch                -> staging table + INSERT ... ON CONFLICT
warehouse load (BQ / Snowflake)       -> Parquet to cloud storage + COPY/LOAD job
re-runs MUST be safe                   -> partition replace OR upsert; never blind append
data lake (Delta / Iceberg)            -> MERGE INTO; gives you ACID + time travel
schema evolves                          -> column-add via ALTER (BQ allows nullable adds)
```

## Anti-Pattern

> [!warning] Anti-pattern
> if_exists="replace" in production
>   Drops the table, recreates it, loses indexes / grants / partitions, and any
>   parallel reader sees zero rows mid-deploy. Use append + UPSERT, or
>   partition-overwrite for re-runnable loads.

## Tips

- Use upsert (MERGE) for idempotent pipelines — safe to re-run without duplicating data.
- Always use if_exists="append" for production — "replace" deletes existing data, data loss risk.
- Use transactions (engine.begin()) or staging tables for atomicity — never partially commit.
- Test writes on a dev/staging table first — production writes have no undo.

## Common Mistake

> [!warning] Using to_sql(..., if_exists="replace") in production — accidentally deletes entire table. Use "append" + upsert logic.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.to_sql("table_staging", engine, if_exists="replace", index=False)
with engine.connect() as conn:
    conn.execute(sa.text("MERGE INTO sales USING table_staging ..."))
    conn.commit()
```

**Senior:**
```python
df.to_sql("sales", engine, if_exists="append", index=False)
```

## See Also

- [[Sections/data-engineering/etl-patterns/etl-extract|ETL: Extract — Reading from Multiple Sources (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/etl-transform|ETL: Transform — Cleaning & Standardizing Data (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/_Index|Data Engineering → ETL & Pipeline Patterns]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

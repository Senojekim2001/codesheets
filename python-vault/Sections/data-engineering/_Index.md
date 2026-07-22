---
type: "file-index"
domain: "python"
file: "data-engineering"
title: "Data Engineering"
tags:
  - "python"
  - "python/data-engineering"
  - "index"
---

# Data Engineering

> 18 entries across 7 sections.

## Apache Airflow · 1

- [[Sections/data-engineering/airflow/airflow-dags|Airflow DAGs — Orchestrating Data Pipelines]] — Define, schedule, and monitor data pipelines with Airflow: DAGs, tasks, operators, sensors, and TaskFlow API.

## dbt (Data Build Tool) · 1

- [[Sections/data-engineering/dbt/dbt-models|dbt — SQL Transformations as Code]] — Transform data in your warehouse with dbt: models, refs, sources, tests, macros, and incremental materialization.

## Data Validation & Quality · 1

- [[Sections/data-engineering/data-validation/pydantic-pandera|Pydantic & Pandera — Data Validation at Scale]] — Validate data with Pydantic (API/record-level) and Pandera (DataFrame-level): schemas, custom validators, and pipeline integration.

## Apache Spark / PySpark · 5

- [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames]] — Initialize SparkSession, read data into DataFrames, and explore schema with .show() and .printSchema().
- [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy]] — Core DataFrame transformations: projecting columns, filtering rows, adding computed columns, and aggregating by groups.
- [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames]] — Register DataFrames as tables and query with SQL using spark.sql() — familiar SQL syntax on distributed data.
- [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions]] — Create custom Python functions for Spark: Python UDFs, Pandas UDFs (@pandas_udf), and type hints.
- [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data]] — Read and write data in Parquet, CSV, JSON formats; Delta Lake for ACID transactions; partitioning for performance.

## Polars — Fast DataFrames · 3

- [[Sections/data-engineering/polars/polars-basics|Polars Basics — DataFrames & I/O]] — Polars is a fast in-memory DataFrame library: pl.DataFrame, pl.read_csv(), expressions, filtering, and selection.
- [[Sections/data-engineering/polars/polars-expressions|Polars Expressions — Expression API & Lazy Evaluation]] — Master Polars expression syntax: pl.col(), pl.lit(), pl.when(), and lazy evaluation with .lazy() / .collect().
- [[Sections/data-engineering/polars/polars-vs-pandas|Polars vs Pandas — When & How to Migrate]] — Compare Polars and Pandas: performance, API differences, and patterns for migrating Pandas code.

## Dask — Distributed Computing · 3

- [[Sections/data-engineering/dask/dask-dataframe|Dask DataFrames — Lazy Distributed Data]] — Use Dask for out-of-core DataFrames: dd.read_csv(), lazy evaluation, partitions, and .compute() execution.
- [[Sections/data-engineering/dask/dask-delayed|Dask Delayed — Task Graphs for Custom Logic]] — Use @dask.delayed for custom Python functions: building task graphs, DAGs, and executing computations.
- [[Sections/data-engineering/dask/dask-distributed|Dask Distributed — Multi-Machine Execution]] — Scale Dask across a cluster: Client connection, distributed schedulers, futures, and worker management.

## ETL & Pipeline Patterns · 4

- [[Sections/data-engineering/etl-patterns/etl-extract|ETL: Extract — Reading from Multiple Sources]] — Extract data from CSV, JSON, Parquet, SQL databases, APIs, and cloud storage in a pipeline.
- [[Sections/data-engineering/etl-patterns/etl-transform|ETL: Transform — Cleaning & Standardizing Data]] — Data cleaning: deduplication, type casting, null handling, normalization, and standardization.
- [[Sections/data-engineering/etl-patterns/etl-load|ETL: Load — Writing to Warehouse & Cloud]] — Load transformed data into Postgres, BigQuery, S3, Snowflake: batch writes, upserts, transactions.
- [[Sections/data-engineering/etl-patterns/prefect-basics|Prefect — Modern Python Orchestration]] — Orchestrate data pipelines with Prefect: @flow, @task, parameters, retries, and error handling.

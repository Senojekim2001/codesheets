---
type: "entry"
domain: "python"
file: "data-engineering"
section: "dbt"
id: "dbt-models"
title: "dbt — SQL Transformations as Code"
category: "dbt"
subtitle: "dbt run, models, ref(), source(), tests, incremental, snapshots"
signature_short: "SELECT ... FROM {{ ref(\"model\") }}  |  dbt run  |  dbt test  |  {{ source() }}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "dbt — SQL Transformations as Code"
  - "dbt-models"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/dbt"
  - "category/dbt"
  - "tier/tiered"
---

# dbt — SQL Transformations as Code

> dbt run, models, ref(), source(), tests, incremental, snapshots

## Overview

dbt (data build tool) transforms data inside your warehouse using SQL SELECT statements. Models are .sql files that define transformations. ref() creates dependencies between models. source() references raw tables. Materializations control how models are built: view (default), table, incremental (append new rows), ephemeral (CTE). Tests validate data quality (not_null, unique, accepted_values, relationships). Macros are reusable Jinja SQL snippets. dbt generates documentation and a DAG automatically from refs.

## Signature

```python
SELECT ... FROM {{ ref("model") }}  |  dbt run  |  dbt test  |  {{ source() }}
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One model that selects from a staging model via ref()
# STRENGTHS - The core dbt loop: SELECT, ref(), dbt run
# WEAKNESSES- No materialization config, no tests, no sources
#
# models/marts/customers.sql
# SELECT
#     customer_id,
#     name,
#     email
# FROM {{ ref('stg_customers') }}     -- ref() builds the DAG automatically

# Build it:
#   $ dbt run --select customers
#   $ dbt test
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - config block, sources, schema tests, layered staging -> mart pattern
# STRENGTHS - The 80%-case shape: typed, tested, documented, with materialization
# WEAKNESSES- No incremental, no snapshots, no macros
#
# models/staging/_sources.yml
# version: 2
# sources:
#   - name: raw
#     schema: raw_data
#     tables:
#       - name: customers
#         loaded_at_field: _etl_loaded_at
#         freshness:
#           warn_after:  {count: 12, period: hour}
#           error_after: {count: 24, period: hour}

# models/staging/stg_customers.sql
# SELECT
#     customer_id,
#     LOWER(email) AS email,
#     name,
#     created_at
# FROM {{ source('raw', 'customers') }}     -- source(), not ref(), for raw tables

# models/marts/dim_customers.sql
# {{ config(materialized='table', schema='marts') }}
#
# SELECT
#     c.customer_id,
#     c.name,
#     c.email,
#     COALESCE(o.total_orders, 0) AS total_orders,
#     COALESCE(o.lifetime_value, 0) AS lifetime_value
# FROM {{ ref('stg_customers') }} c
# LEFT JOIN {{ ref('stg_orders_summary') }} o USING (customer_id)

# models/marts/_schema.yml
# version: 2
# models:
#   - name: dim_customers
#     description: One row per customer with order summary
#     columns:
#       - name: customer_id
#         tests: [unique, not_null]
#       - name: email
#         tests: [unique, not_null]

# Commands you'll actually use:
#   $ dbt run                              build all models
#   $ dbt run --select dim_customers+      build this + downstream
#   $ dbt test                             run all tests
#   $ dbt build                            run + test in DAG order
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Incremental models, snapshots, macros, contracts; CI-friendly layout
# STRENGTHS - The patterns that turn dbt from a SQL runner into a tested data platform
# WEAKNESSES- N/A
#
# models/marts/fct_events.sql            INCREMENTAL: only process NEW rows
# {{ config(
#     materialized='incremental',
#     unique_key='event_id',
#     on_schema_change='append_new_columns',
#     incremental_strategy='merge',     -- delete+insert / merge / insert_overwrite
# ) }}
#
# SELECT *
# FROM {{ ref('stg_events') }}
# {% if is_incremental() %}
#   -- only rows newer than the latest in this table
#   WHERE event_time > (SELECT COALESCE(MAX(event_time), '1900-01-01') FROM {{ this }})
# {% endif %}

# snapshots/customer_history.sql        SLOWLY-CHANGING-DIMENSION (Type 2)
# {% snapshot customer_history %}
# {{ config(
#     target_schema='snapshots',
#     unique_key='customer_id',
#     strategy='check',
#     check_cols=['email', 'segment'],
# ) }}
# SELECT * FROM {{ source('raw', 'customers') }}
# {% endsnapshot %}

# macros/cents_to_dollars.sql           DRY SQL via Jinja macros
# {% macro cents_to_dollars(column_name, precision=2) %}
#   ROUND({{ column_name }} / 100.0, {{ precision }})
# {% endmacro %}
#
# Usage in a model:
#   SELECT order_id, {{ cents_to_dollars('amount_cents') }} AS amount FROM ...

# models/marts/_schema.yml — model contracts (dbt 1.5+)
# models:
#   - name: dim_customers
#     config:
#       contract: {enforced: true}        # enforce types AND column set on build
#     columns:
#       - name: customer_id
#         data_type: bigint
#         constraints: [{type: not_null}, {type: unique}]
#       - name: status
#         data_type: varchar
#         tests:
#           - accepted_values:
#               values: ['active', 'lapsed', 'churned']

# Selectors and slim CI
#   $ dbt build --select state:modified+ --state ./prod-manifest
#     ^ only build models changed since prod, plus their descendants
#
# Decision rule:
#   small / medium dim or aggregation     -> materialized='table'
#   massive event / log table               -> materialized='incremental' + unique_key
#   tracking changes over time              -> snapshot (SCD Type 2)
#   one-shot CTE-style helper                -> materialized='ephemeral'
#   want strict schema enforcement          -> contract: {enforced: true}
#   reusable SQL fragment                    -> macro
#
# Anti-pattern: SELECT * inside a mart model
#   When the upstream adds a column you didn't expect, downstream BI breaks
#   and lineage tools can't track which columns are used. Always enumerate
#   columns; rely on contracts to catch surprises.
```

## Decision Rule

```text
small / medium dim or aggregation     -> materialized='table'
massive event / log table               -> materialized='incremental' + unique_key
tracking changes over time              -> snapshot (SCD Type 2)
one-shot CTE-style helper                -> materialized='ephemeral'
want strict schema enforcement          -> contract: {enforced: true}
reusable SQL fragment                    -> macro
```

## Anti-Pattern

> [!warning] Anti-pattern
> SELECT * inside a mart model
>   When the upstream adds a column you didn't expect, downstream BI breaks
>   and lineage tools can't track which columns are used. Always enumerate
>   columns; rely on contracts to catch surprises.

## Tips

- Use the staging → intermediate → marts layering pattern: stg_ (clean raw), int_ (business logic), dim_/fct_ (final tables).
- Incremental models with is_incremental() process only new rows — essential for large event/log tables that grow daily.
- dbt test catches data quality issues before downstream consumers see bad data — run tests in CI on every PR.
- ref() creates automatic dependencies — dbt builds the DAG from refs and runs models in the correct order.

## Common Mistake

> [!warning] Writing dbt models that SELECT * — always explicitly list columns. SELECT * breaks when source columns change and makes it impossible to track column lineage.

## Shorthand (Junior → Senior)

**Junior:**
```python
SELECT
    customer_id,
    name,
    email,
    created_at,
    updated_at
FROM {{ ref("stg_customers") }}
```

**Senior:**
```python
SELECT * FROM {{ ref("stg_customers") }}
```

## See Also

- [[Sections/data-engineering/dbt/_Index|Data Engineering → dbt (Data Build Tool)]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

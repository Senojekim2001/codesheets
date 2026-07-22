---
type: "entry"
domain: "python"
file: "data-engineering"
section: "airflow"
id: "airflow-dags"
title: "Airflow DAGs — Orchestrating Data Pipelines"
category: "Orchestration"
subtitle: "@dag, @task, TaskFlow, BashOperator, PythonOperator, sensors, XCom"
signature_short: "@dag(schedule=\"0 6 * * *\")  |  @task  |  task1 >> task2  |  XCom"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Airflow DAGs — Orchestrating Data Pipelines"
  - "airflow-dags"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/airflow"
  - "category/orchestration"
  - "tier/tiered"
---

# Airflow DAGs — Orchestrating Data Pipelines

> @dag, @task, TaskFlow, BashOperator, PythonOperator, sensors, XCom

## Overview

Apache Airflow is the standard orchestration platform for data pipelines. DAGs (Directed Acyclic Graphs) define task dependencies and schedules. The TaskFlow API (@dag, @task decorators) is the modern Pythonic way to write DAGs. Operators execute specific actions: PythonOperator (run Python), BashOperator (shell commands), and provider-specific operators (S3, BigQuery, Snowflake). Sensors wait for external conditions (file exists, API available). XCom passes data between tasks. Connections store credentials securely.

## Signature

```python
@dag(schedule="0 6 * * *")  |  @task  |  task1 >> task2  |  XCom
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One @dag, one @task, daily schedule
# STRENGTHS - The minimum DAG that actually runs
# WEAKNESSES- No dependencies between tasks, no error handling
#
from datetime import datetime
from airflow.decorators import dag, task

@dag(
    dag_id="hello_dag",
    schedule="@daily",
    start_date=datetime(2024, 1, 1),
    catchup=False,                          # don't backfill on deploy
)
def hello_dag():
    @task
    def say_hello():
        print("hello from airflow")

    say_hello()

hello_dag()                                  # MUST be called at module level
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - TaskFlow extract -> transform -> load with auto-wired XCom
# STRENGTHS - The shape every Airflow tutorial converges on
# WEAKNESSES- No retries tuned per task, no provider operators, no sensor
#
from datetime import datetime, timedelta
from airflow.decorators import dag, task

@dag(
    dag_id="etl_sales",
    schedule="0 6 * * *",                    # daily at 06:00 UTC
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args={
        "owner": "data-team",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    tags=["etl", "sales"],
)
def etl_sales():
    @task
    def extract() -> str:
        path = "/tmp/sales.parquet"
        # ... pull from source, write to path ...
        return path                          # value flows via XCom automatically

    @task
    def transform(path: str) -> str:
        out = "/tmp/sales_summary.parquet"
        # ... read, clean, aggregate, write ...
        return out

    @task
    def load(path: str) -> int:
        # ... write to warehouse ...
        return 42

    # Dependencies are inferred from the return-value flow
    load(transform(extract()))

etl_sales()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Sensors, branching, dynamic task mapping, datasets, idempotent execution_date
# STRENGTHS - The patterns that make Airflow scale beyond a hello-world DAG
# WEAKNESSES- N/A
#
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.datasets import Dataset
from airflow.operators.python import BranchPythonOperator
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor

raw_sales_ds   = Dataset("s3://lake/raw/sales/")
clean_sales_ds = Dataset("s3://lake/clean/sales/")

@dag(
    dag_id="sales_v2",
    schedule=[raw_sales_ds],                  # data-aware: run when this dataset is updated
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,                        # never run two copies in parallel
    default_args={"retries": 3, "retry_delay": timedelta(minutes=10),
                  "execution_timeout": timedelta(hours=1)},
)
def sales_v2():

    # 1) SENSOR — wait for external file before running anything
    wait_for_raw = S3KeySensor(
        task_id="wait_for_raw",
        bucket_key="raw/sales/{{ ds }}/done",   # idempotent: ds = execution date
        timeout=60 * 60, mode="reschedule",     # release worker slot while waiting
    )

    # 2) DYNAMIC TASK MAPPING — fan out a task per region
    @task
    def list_regions() -> list[str]:
        return ["us-east", "us-west", "eu"]

    @task(retries=5)                            # per-task retry override
    def process_region(region: str) -> dict:
        return {"region": region, "rows": 42}

    # 3) BRANCHING — load to prod or staging based on a param
    @task.branch
    def choose_target(**ctx) -> str:
        return "load_prod" if ctx["params"]["env"] == "prod" else "load_staging"

    @task(outlets=[clean_sales_ds])             # publishing this dataset triggers downstream DAGs
    def load_prod(_): ...
    @task
    def load_staging(_): ...

    regions = list_regions()
    summaries = process_region.expand(region=regions)   # fan-out

    branch = choose_target()
    branch >> [load_prod(summaries), load_staging(summaries)]
    wait_for_raw >> regions

sales_v2()

# Decision rule:
#   simple cron-driven DAG                  -> schedule="@daily" / "0 6 * * *"
#   triggered by upstream data writing       -> Dataset-driven schedule (data-aware)
#   waiting on external state (file, API)    -> Sensor in mode="reschedule"
#   N similar work items at runtime          -> dynamic task mapping (.expand)
#   conditional branches                      -> @task.branch / BranchPythonOperator
#   heavy compute                              -> trigger Spark / dbt; don't compute in workers
#
# Anti-pattern: heavy data processing inside @task functions
#   Airflow workers are ORCHESTRATORS, not a compute engine. Pandas DataFrames
#   on the worker box bottleneck on memory and don't scale. Trigger Spark / dbt
#   / cloud functions; keep @task bodies thin.
```

## Decision Rule

```text
simple cron-driven DAG                  -> schedule="@daily" / "0 6 * * *"
triggered by upstream data writing       -> Dataset-driven schedule (data-aware)
waiting on external state (file, API)    -> Sensor in mode="reschedule"
N similar work items at runtime          -> dynamic task mapping (.expand)
conditional branches                      -> @task.branch / BranchPythonOperator
heavy compute                              -> trigger Spark / dbt; don't compute in workers
```

## Anti-Pattern

> [!warning] Anti-pattern
> heavy data processing inside @task functions
>   Airflow workers are ORCHESTRATORS, not a compute engine. Pandas DataFrames
>   on the worker box bottleneck on memory and don't scale. Trigger Spark / dbt
>   / cloud functions; keep @task bodies thin.

## Tips

- TaskFlow API (@dag, @task) is the modern standard — it auto-handles XCom and makes DAGs readable as plain Python.
- Set catchup=False unless you specifically need to backfill — otherwise Airflow runs every missed schedule on deploy.
- Use Connections (Admin → Connections) for all credentials — never hardcode secrets in DAG files.
- Test DAGs locally with: airflow dags test <dag_id> <execution_date> before deploying.

## Common Mistake

> [!warning] Doing heavy data processing inside Airflow workers — Airflow is an orchestrator, not a compute engine. Use it to trigger Spark jobs, dbt runs, or cloud functions. Keep task code lightweight.

## Shorthand (Junior → Senior)

**Junior:**
```python
def extract():
    import pandas as pd
    df = pd.read_sql("SELECT * FROM raw", conn)
    df.to_parquet("/tmp/raw.parquet")
    return "/tmp/raw.parquet"

extract_task = PythonOperator(task_id="extract", python_callable=extract)
```

**Senior:**
```python
@task
def extract() -> str:
    return pd.read_sql("SELECT * FROM raw", conn).to_parquet("/tmp/raw.parquet")

extract_task = extract()
```

## See Also

- [[Sections/data-engineering/etl-patterns/prefect-basics|Prefect — Modern Python Orchestration (Data Engineering)]]
- [[Sections/data-engineering/airflow/_Index|Data Engineering → Apache Airflow]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

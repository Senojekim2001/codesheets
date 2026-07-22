---
type: "entry"
domain: "python"
file: "data-engineering"
section: "etl-patterns"
id: "prefect-basics"
title: "Prefect — Modern Python Orchestration"
category: "Orchestration"
subtitle: "@flow, @task, prefect.run(), parameters, retry, caching, logging"
signature_short: "@flow  |  @task  |  flow(arg)  |  flow.serve()  |  parameters"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Prefect — Modern Python Orchestration"
  - "prefect-basics"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/etl-patterns"
  - "category/orchestration"
  - "tier/tiered"
---

# Prefect — Modern Python Orchestration

> @flow, @task, prefect.run(), parameters, retry, caching, logging

## Overview

Prefect is a modern orchestration framework for Python — simpler than Airflow, great for data pipelines. @flow wraps the main pipeline function, @task wraps individual steps. Parameters are inputs (CLI or API). Retry and timeout policies are declarative. Built-in logging and observability. Deploy with flow.serve() for continuous execution. CloudOps provides cloud-hosted scheduler.

## Signature

```python
@flow  |  @task  |  flow(arg)  |  flow.serve()  |  parameters
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One @flow, one @task; running locally is just calling the function
# STRENGTHS - Smallest valid Prefect flow
# WEAKNESSES- No retries, no logging, no parameters
#
from prefect import flow, task

@task
def extract():
    return [1, 2, 3]

@flow
def my_flow():
    return sum(extract())

print(my_flow())                                 # runs the flow locally
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-task flow with retries, logging, parameters
# STRENGTHS - The shape every real pipeline starts from
# WEAKNESSES- No deployments, no caching, no concurrency tags
#
from prefect import flow, task, get_run_logger
import pandas as pd

@task(retries=3, retry_delay_seconds=10)         # auto-retry on transient errors
def extract(source: str) -> pd.DataFrame:
    log = get_run_logger()
    log.info("reading %s", source)
    return pd.read_csv(source)

@task
def transform(df: pd.DataFrame) -> pd.DataFrame:
    return (df.dropna()
              .assign(region=df["region"].str.upper())
              .query("0 <= amount <= 10000"))

@task
def load(df: pd.DataFrame, out: str):
    df.to_parquet(out, index=False)

@flow(name="etl-sales", log_prints=True)
def etl(source: str = "data/sales.csv",
        out:    str = "out/sales.parquet",
        env:    str = "dev"):
    df = extract(source)
    cleaned = transform(df)
    load(cleaned, out)

if __name__ == "__main__":
    etl()                                          # also: $ python etl.py
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Caching, concurrency limits, deployments, mapping, conditional flow control
# STRENGTHS - The patterns that turn Prefect from hello-world to a real platform
# WEAKNESSES- N/A
#
from datetime import timedelta
from prefect import flow, task, get_run_logger
from prefect.tasks import task_input_hash
from prefect.task_runners import ConcurrentTaskRunner

# 1) Caching — skip work when inputs haven't changed (idempotent re-runs are free)
@task(cache_key_fn=task_input_hash,
      cache_expiration=timedelta(hours=6),
      retries=3, retry_delay_seconds=15)
def fetch_partition(date: str):
    return load_partition_from_s3(date)

# 2) Concurrent / mapped execution — fan out cleanly
@flow(task_runner=ConcurrentTaskRunner())
def daily_loads(dates: list[str]):
    fetched = fetch_partition.map(dates)           # one task per date, parallel
    return [process(f) for f in fetched]           # downstream auto-DAGs from returns

# 3) Conditional logic — Prefect 2/3 uses normal Python if/else inside flows
@flow
def gated_pipeline(src: str):
    df = extract(src)
    log = get_run_logger()
    null_rate = df["amount"].isna().mean()
    if len(df) == 0:
        log.warning("empty data; skipping load")
        return
    if null_rate > 0.10:
        raise ValueError(f"too many nulls: {null_rate:.0%}")
    load(transform(df), "out/clean.parquet")

# 4) State hooks — alert on failure without writing logging code in every task
def alert_pagerduty(flow_run, state):
    pass

@flow(on_failure=[alert_pagerduty])
def critical_pipeline():
    ...

# 5) Deploy — schedule, parameters, infra. CLI:
#    $ prefect deploy etl.py:etl
#      --name daily \
#      --cron "0 6 * * *" \
#      --param env=prod
#    $ prefect worker start --pool default-pool

# Decision rule:
#   simple Python pipeline                  -> Prefect; lighter than Airflow
#   complex multi-team DAG                   -> Airflow (richer operators / connectors)
#   data-quality gates / branching            -> normal if/else inside the flow
#   N similar tasks at runtime                -> task.map(...)
#   transient API failures                     -> @task(retries=N, retry_delay_seconds=...)
#   re-runnable backfills                      -> task_input_hash caching
#   alerting on failures                       -> @flow(on_failure=[hook])
#
# Anti-pattern: heavy data work directly inside @flow body
#   The flow body is ORCHESTRATION code; tasks are the unit of retry, caching,
#   and observability. Wrap real work in @task — even tiny helpers — so that
#   failures show up in the right place in the Prefect UI.

def load_partition_from_s3(_): pass
def extract(_): import pandas as pd; return pd.DataFrame()
def transform(df): return df
def load(df, p): pass
def process(x): return x
```

## Decision Rule

```text
simple Python pipeline                  -> Prefect; lighter than Airflow
complex multi-team DAG                   -> Airflow (richer operators / connectors)
data-quality gates / branching            -> normal if/else inside the flow
N similar tasks at runtime                -> task.map(...)
transient API failures                     -> @task(retries=N, retry_delay_seconds=...)
re-runnable backfills                      -> task_input_hash caching
alerting on failures                       -> @flow(on_failure=[hook])
```

## Anti-Pattern

> [!warning] Anti-pattern
> heavy data work directly inside @flow body
>   The flow body is ORCHESTRATION code; tasks are the unit of retry, caching,
>   and observability. Wrap real work in @task — even tiny helpers — so that
>   failures show up in the right place in the Prefect UI.

## Tips

- Use @task for atomic units of work — makes logs, retries, and monitoring cleaner.
- Prefect tasks auto-create a DAG from return values — no explicit dependencies like Airflow.
- @flow is the entry point — wrap the full pipeline to enable scheduling and monitoring.
- Log with get_run_logger() — shows up in Prefect Cloud UI and useful for debugging.

## Common Mistake

> [!warning] Putting heavy processing inside @flow instead of @task — tasks are independently retryable. Heavy logic goes in @task.

## Shorthand (Junior → Senior)

**Junior:**
```python
@flow
def pipeline():
    @task
    def extract():
        return pd.read_csv("data.csv")

    @task
    def transform(df):
        return df.dropna()

    df = extract()
    df_clean = transform(df)
    return df_clean

pipeline()
```

**Senior:**
```python
@flow
def pipeline():
    @task
    def extract(): return pd.read_csv("data.csv")
    return transform(extract())

pipeline()
```

## See Also

- [[Sections/data-engineering/airflow/airflow-dags|Airflow DAGs — Orchestrating Data Pipelines (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/_Index|Data Engineering → ETL & Pipeline Patterns]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

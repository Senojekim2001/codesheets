---
type: "entry"
domain: "python"
file: "notebooks"
section: "workflow"
id: "nbformat-papermill"
title: "papermill — parameterized notebook execution"
category: "Workflow"
subtitle: "papermill execute, parameters tag, -p key=value, output notebook with results, scrapbook for outputs, integration with Airflow / Dagster"
signature_short: "papermill report.ipynb out_2024-12.ipynb -p month 2024-12 -p threshold 0.5"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "papermill — parameterized notebook execution"
  - "nbformat-papermill"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/workflow"
  - "category/workflow"
  - "tier/tiered"
---

# papermill — parameterized notebook execution

> papermill execute, parameters tag, -p key=value, output notebook with results, scrapbook for outputs, integration with Airflow / Dagster

## Overview

A notebook with a "parameters" cell tagged in nbformat metadata becomes a parameterizable pipeline. `papermill execute notebook.ipynb out.ipynb -p key value` injects parameters, runs the notebook, captures outputs into a result notebook. Good for scheduled reports (run weekly with last week's date), parameter sweeps (one notebook, N parameter sets), CI-tested analyses (run in CI; verify outputs). The three examples solve the SAME concrete task — generate a monthly sales report from a parameterized notebook — at three depths: tag a parameters cell + papermill CLI → programmatic execution + scrapbook for structured outputs → production with Airflow scheduling, S3 storage, error handling.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Make a notebook parameterizable; run with custom values.
- **Junior** — SAME — but capture structured outputs (not just notebook cell outputs) for downstream pipelines. pip install papermill scrapbook
- **Senior** — SAME — production: scheduled in Airflow, outputs to S3, alerts on failure. pip install papermill scrapbook boto3

## Signature

```python
papermill report.ipynb out_2024-12.ipynb -p month 2024-12 -p threshold 0.5
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Make a notebook parameterizable; run with custom values.

# === Step 1: tag a parameters cell in your notebook ===
# In the cell containing default parameters, add the "parameters" tag
# via JupyterLab: View → Cell Toolbar → Tags → add "parameters".
#
# The cell itself looks like:
#   month = "2024-11"
#   threshold = 0.5
#   region = "us"

# === Step 2: install papermill ===
# pip install papermill

# === Step 3: execute with overrides from CLI ===
# $ papermill input.ipynb output_2024-12.ipynb \
#     -p month "2024-12" \
#     -p threshold 0.7 \
#     -p region "eu"
#
# papermill:
#   1. Loads input.ipynb
#   2. Injects a NEW cell after the "parameters" cell with the
#      override values (month = "2024-12", threshold = 0.7, ...)
#   3. Executes every cell top-to-bottom
#   4. Saves the executed notebook (with all outputs) to output_*.ipynb
#
# If any cell raises, papermill stops and writes the partial output
# notebook with the error visible.

# === Programmatic execution ===
import papermill as pm

pm.execute_notebook(
    "report.ipynb",
    "report_executed.ipynb",
    parameters={"month": "2024-12", "threshold": 0.7, "region": "eu"},
)

# parameters dict:
#   - keys must match variable names in the parameters cell
#   - values become Python literals via repr() — strings, numbers, lists, dicts OK
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but capture structured outputs (not just notebook
#             cell outputs) for downstream pipelines.
# pip install papermill scrapbook
import papermill as pm
import scrapbook as sb

# === Inside the notebook, glue values to capture ===
# Cell:
#   import scrapbook as sb
#   total_revenue = df["amount"].sum()
#   sb.glue("total_revenue", float(total_revenue))
#   sb.glue("by_region", df.groupby("region")["amount"].sum().to_dict())
#
#   # Glue a plot:
#   import matplotlib.pyplot as plt
#   fig, ax = plt.subplots()
#   ax.bar(by_region.keys(), by_region.values())
#   sb.glue("revenue_chart", fig, encoder="display")

# === Run + read scraps from outside ===
pm.execute_notebook(
    "report.ipynb", "report_2024-12.ipynb",
    parameters={"month": "2024-12"},
)

nb = sb.read_notebook("report_2024-12.ipynb")
revenue = nb.scraps["total_revenue"].data                # 1234567.89
by_region = nb.scraps["by_region"].data                  # {"us": 800000, ...}
print(f"Total: ${revenue:,.0f}")

# === Bulk read across many runs ===
import pathlib
runs = sb.read_notebooks(pathlib.Path("./reports"))
df = runs.scraps_report()
print(df)                                                 # one row per (notebook, scrap) combo

# === Common patterns ===
# 1. Parameter sweep: run the same notebook with N parameter sets.
months = ["2024-09", "2024-10", "2024-11", "2024-12"]
for m in months:
    pm.execute_notebook(
        "report.ipynb", f"out/report_{m}.ipynb",
        parameters={"month": m},
    )

# 2. Error handling — papermill raises if a cell fails.
try:
    pm.execute_notebook("report.ipynb", "out.ipynb", parameters={"bad": "input"})
except pm.PapermillExecutionError as e:
    print(f"failed at cell {e.exec_count}: {e.evalue}")
    # The output notebook still exists with the error visible.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: scheduled in Airflow, outputs to S3,
#             alerts on failure.
# pip install papermill scrapbook boto3
import papermill as pm
import scrapbook as sb
from datetime import datetime, timedelta
from pathlib import Path
import boto3, json

# === Airflow DAG (pseudocode) ===
# from airflow import DAG
# from airflow.operators.python import PythonOperator
#
# dag = DAG("monthly_report", schedule_interval="0 8 1 * *",
#           default_args={"retries": 2})
#
# def run_report(execution_date, **_ctx):
#     month = execution_date.strftime("%Y-%m")
#     ...

def run_monthly_report(month: str, *, output_bucket: str = "reports") -> dict:
    """Run notebook for given month; ship to S3; return summary scraps."""
    out_local = Path(f"/tmp/report_{month}.ipynb")
    try:
        pm.execute_notebook(
            "/opt/notebooks/report.ipynb",
            str(out_local),
            parameters={"month": month, "production_mode": True},
            kernel_name="myproject",
            log_output=True,                          # stream cell outputs to stdout
            progress_bar=False,
        )
    except pm.PapermillExecutionError as e:
        # Write FAILED status; ship anyway for debugging.
        s3 = boto3.client("s3")
        s3.upload_file(str(out_local), output_bucket,
                       f"failed/{month}/report.ipynb")
        raise

    # Read scraps for downstream consumers.
    nb = sb.read_notebook(str(out_local))
    summary = {
        k: v.data for k, v in nb.scraps.items()
        if v.data_type in ("application/json", "text/plain")
    }

    # Ship the executed notebook to S3 for archival.
    s3 = boto3.client("s3")
    s3.upload_file(str(out_local), output_bucket, f"{month}/report.ipynb")
    s3.put_object(Bucket=output_bucket, Key=f"{month}/summary.json",
                   Body=json.dumps(summary).encode())

    return summary

# === Render to HTML for stakeholders ===
# subprocess.run([
#     "jupyter", "nbconvert", "--to", "html", "--no-input",
#     str(out_local), "--output", f"report_{month}.html",
# ])

# Decision rule:
#   ad-hoc parameter run                  -> papermill CLI
#   programmatic / pipeline                -> papermill Python API
#   need structured outputs                 -> scrapbook glue + read
#   parameter sweep                          -> for-loop over execute_notebook
#   scheduled report                          -> Airflow / Dagster + papermill
#   notebook is the deliverable               -> nbconvert to HTML; ship
#   error tolerance                            -> wrap in try/except PapermillExecutionError
#   stream cell output to logs                -> log_output=True
#   need to test outputs                       -> nbval (next entry); OR scrapbook + assertions
#   long-running notebook                     -> --execution-timeout=N (seconds)
#   uses GPU                                   -> kernel that points to GPU env
#   stop on first cell failure                 -> default behavior; raises PapermillExecutionError
#
# Anti-pattern: hardcoding values in a notebook intended to be run
# scheduled. Each time the report runs you have to manually edit the
# date cell. Tag a 'parameters' cell with sane defaults, then use
# papermill -p to override at runtime. Same notebook, infinite parameters.
```

## Decision Rule

```text
ad-hoc parameter run                  -> papermill CLI
programmatic / pipeline                -> papermill Python API
need structured outputs                 -> scrapbook glue + read
parameter sweep                          -> for-loop over execute_notebook
scheduled report                          -> Airflow / Dagster + papermill
notebook is the deliverable               -> nbconvert to HTML; ship
error tolerance                            -> wrap in try/except PapermillExecutionError
stream cell output to logs                -> log_output=True
need to test outputs                       -> nbval (next entry); OR scrapbook + assertions
long-running notebook                     -> --execution-timeout=N (seconds)
uses GPU                                   -> kernel that points to GPU env
stop on first cell failure                 -> default behavior; raises PapermillExecutionError
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding values in a notebook intended to be run
> scheduled. Each time the report runs you have to manually edit the
> date cell. Tag a 'parameters' cell with sane defaults, then use
> papermill -p to override at runtime. Same notebook, infinite parameters.

## Tips

- Tag a "parameters" cell via JupyterLab: View → Cell Toolbar → Tags → add `parameters`. Papermill injects overrides AFTER this cell.
- Use sane defaults in the parameters cell — same notebook should work both interactively (run as-is) and via papermill (with overrides).
- `scrapbook.glue("name", value)` captures structured outputs. Read across many runs with `scrapbook.read_notebooks(directory)` — returns a DataFrame.
- `papermill.execute_notebook(..., log_output=True)` streams cell stdout/stderr to your logs — critical for debugging long-running scheduled jobs.
- When a cell fails, papermill writes the OUTPUT notebook anyway with the error visible. Always upload it to S3/etc. — invaluable for debugging scheduled failures.
- For Airflow, the `PapermillOperator` from `airflow-providers-papermill` wraps execute_notebook with proper task semantics.

## Common Mistake

> [!warning] Hardcoding values in a notebook that runs on a schedule. Every run requires manually editing the date cell; the schedule fails when nobody remembers; reproducing a past month's report requires version-control archaeology. Tag a `parameters` cell and use papermill -p; same notebook, infinite parameter sets.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Hardcoded date — requires manual edit per run
month = "2024-11"
df = load_data(month)
```

**Senior:**
```python
# Tagged parameters cell — papermill -p month 2024-12 overrides
# (cell with tag "parameters")
month = "2024-11"        # default
threshold = 0.5
df = load_data(month)
```

## See Also

- [[Sections/ml/preprocessing/pipeline|Pipeline (Machine Learning)]]
- [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs (Notebooks)]]
- [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides (Notebooks)]]
- [[Sections/notebooks/workflow/_Index|Notebooks → Workflow — papermill, jupytext, nbconvert]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

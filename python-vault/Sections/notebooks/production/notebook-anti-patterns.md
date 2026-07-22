---
type: "entry"
domain: "python"
file: "notebooks"
section: "production"
id: "notebook-anti-patterns"
title: "Notebook anti-patterns — when to graduate to .py"
category: "Production"
subtitle: "cell-order dependency, hidden mutable state, \"Restart and Run All\" test, refactoring functions into modules, when to leave Jupyter, the \"module + thin notebook\" pattern"
signature_short: "rule: if Restart-and-Run-All breaks, the notebook has hidden state"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Notebook anti-patterns — when to graduate to .py"
  - "notebook-anti-patterns"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/production"
  - "category/production"
  - "tier/tiered"
---

# Notebook anti-patterns — when to graduate to .py

> cell-order dependency, hidden mutable state, "Restart and Run All" test, refactoring functions into modules, when to leave Jupyter, the "module + thin notebook" pattern

## Overview

Notebooks are interactive — you run cells out of order, retry with mutations, leave dead code. That's fine for exploration; it's a disaster when shipping. Three traps: (1) **cell-order dependency** — only works in the order you happened to run them; "Restart and Run All" breaks; (2) **hidden mutable state** — earlier cells mutate variables you forgot about; (3) **copy-paste reuse** — the same function exists in 5 notebooks, each with subtle differences. The discipline: extract reusable code into a `src/` module, install it (`pip install -e .`), import in notebooks for analysis. The three examples solve the SAME concrete task — turn a working exploratory notebook into reproducible code — at three depths: identify the smells → extract functions to a module → production with thin notebook + tested module.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Identify the smells in an exploratory notebook.
- **Junior** — SAME — refactor the smells out. Project layout: myproj/ pyproject.toml src/myproj/ __init__.py data.py          <- functions extracted from notebook analysis.py tests/ test_data.py notebooks/ exploration.ipynb   <- thin; imports from myproj monthly_report.ipynb
- **Senior** — SAME — the production discipline + when to leave Jupyter entirely.

## Signature

```python
rule: if Restart-and-Run-All breaks, the notebook has hidden state
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Identify the smells in an exploratory notebook.

# Smell 1: cell-order dependency.
#   Cell 1: df = pd.read_csv("data.csv")
#   Cell 2: df["clean_amount"] = df["amount"].str.replace("$", "").astype(float)
#   Cell 3: <... more analysis ...>
#   Cell 4: df = df[df["clean_amount"] > 100]                # MUTATES df
#   Cell 5: <re-running cell 2 now FAILS — clean_amount is float, not str>
# Test: Kernel → Restart and Run All. If that breaks, you have order dependency.

# Smell 2: hidden state in mutable globals.
#   Cell 1: df = load_data()
#   Cell 10 (3 days later): df.dropna(inplace=True)         # changes 'df' globally
#   Cell 11: <results that look fine but used the dropna'd df>
# Reader of cell 11 has no idea df was mutated.

# Smell 3: copy-paste reuse.
#   notebook_a.ipynb:  def parse_log(line): ...             # version 1
#   notebook_b.ipynb:  def parse_log(line): ...             # version 1.1, slightly different
#   notebook_c.ipynb:  def parse_log(line): ...             # version 2
# Three subtly different implementations; bug fixed in C never reaches A and B.

# Smell 4: secrets in cells.
#   Cell 3: API_KEY = "sk-abc123..."                         # committed to git
# nbstripout doesn't help with code cells; only outputs.
# Use os.environ + .env file (or notebook env via kernelspec).

# Smell 5: ad-hoc tests in cells.
#   Cell 7: assert df["amount"].min() > 0                    # passes today
#   Cell 12 (next week): df gets new rows; assertion fails silently
#                         (notebook still runs but assertion in middle never fires)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — refactor the smells out.
# Project layout:
#   myproj/
#     pyproject.toml
#     src/myproj/
#       __init__.py
#       data.py          <- functions extracted from notebook
#       analysis.py
#     tests/
#       test_data.py
#     notebooks/
#       exploration.ipynb   <- thin; imports from myproj
#       monthly_report.ipynb

# === src/myproj/data.py ===
# import pandas as pd
# from pathlib import Path
#
# def load_sales(path: Path) -> pd.DataFrame:
#     """Read sales CSV; clean amount column."""
#     df = pd.read_csv(path)
#     df["clean_amount"] = df["amount"].str.replace("$", "", regex=False).astype(float)
#     return df
#
# def filter_by_threshold(df: pd.DataFrame, *, min_amount: float) -> pd.DataFrame:
#     """Filter; returns NEW DataFrame (no mutation)."""
#     return df[df["clean_amount"] >= min_amount].copy()

# === tests/test_data.py ===
# from myproj.data import load_sales, filter_by_threshold
#
# def test_filter_returns_new_frame(tmp_path):
#     # ... create test CSV ...
#     df = load_sales(tmp_path / "test.csv")
#     filtered = filter_by_threshold(df, min_amount=100)
#     assert len(filtered) <= len(df)
#     assert df.equals(load_sales(tmp_path / "test.csv"))    # original unchanged

# === Install in editable mode ===
# $ pip install -e .
# Now from any notebook:

# === notebooks/exploration.ipynb ===
# import pandas as pd
# from myproj.data import load_sales, filter_by_threshold
#
# df = load_sales("data/sales.csv")
# filtered = filter_by_threshold(df, min_amount=100)
# filtered.head()
#
# # Notebook is now THIN: just imports, calls, and visualization.
# # Refactor and test happens in src/, not in the notebook.

# === Rule: write FUNCTIONS, not script-style cells ===
# BAD:
#   df = pd.read_csv("data.csv")
#   df["clean"] = df["amount"].str.replace("$", "")
#   df = df[df["clean"] > 100]                              # mutate
#
# GOOD:
#   def clean_and_filter(path, *, min_amount):
#       df = pd.read_csv(path)
#       df["clean"] = df["amount"].str.replace("$", "")
#       return df[df["clean"] > min_amount]
#   filtered = clean_and_filter("data.csv", min_amount=100)
# Functions are testable, importable, and don't mutate globals.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — the production discipline + when to leave Jupyter entirely.

# === The "thin notebook" pattern ===
# Goal: notebooks are 80% imports + visualization, 20% one-off exploration.
# All reusable code lives in src/ with tests.

# === Notebook structure ===
# notebooks/sales_report.ipynb:
#
# # %% [markdown]
# # # Sales Report — Q4 2024
# # *Generated: <timestamp>*
#
# # %%
# # parameters cell (papermill-tagged)
# month = "2024-12"
# threshold = 100
#
# # %%
# from myproj.data import load_sales, filter_by_threshold
# from myproj.analysis import summarize_by_region, plot_revenue_trend
# import scrapbook as sb
#
# # %%
# df = load_sales(f"data/sales_{month}.csv")
# filtered = filter_by_threshold(df, min_amount=threshold)
#
# # %%
# summary = summarize_by_region(filtered)
# summary
#
# # %%
# plot_revenue_trend(filtered)
#
# # %%
# # Glue summary for downstream pipelines (papermill).
# sb.glue("revenue_total", float(summary["amount"].sum()))
# sb.glue("by_region",      summary.set_index("region")["amount"].to_dict())

# === The graduate-to-.py decision ===
#
# Stay in notebook when:
#   - Output IS the deliverable (analysis, report, viz)
#   - Iterating on visualization / EDA
#   - Audience is humans reading top-to-bottom
#   - Computation is the explanation
#
# Leave for .py when:
#   - Code is reused in 3+ places (extract to module)
#   - Code is run unattended (script + scheduler)
#   - You have unit tests (notebooks aren't great test hosts)
#   - It's a service / API / pipeline (notebooks aren't long-running)
#   - State management matters (notebooks have hidden state)
#   - Multiple developers contribute (.py + git is much better)
#
# Hybrid:
#   - Module (.py) holds reusable functions; notebook (.ipynb) drives + visualizes
#   - papermill executes the notebook as a pipeline step
#   - jupytext keeps a .py companion for git/code review
#   - nbval/papermill+scrapbook test outputs in CI

# Decision rule:
#   exploration / EDA                       -> notebook
#   analysis report (one-time)               -> notebook + nbconvert HTML
#   recurring report                          -> notebook + papermill scheduled
#   reusable code                              -> .py module; import from notebooks
#   long-running job                            -> .py script; not a notebook
#   service / API                              -> .py; FastAPI or similar
#   ML training pipeline                       -> .py orchestrator + notebook for analysis
#   shared library                             -> .py with tests; never a notebook
#   prototype to production                    -> notebook → extract to .py incrementally
#   stuck in cell-order hell                  -> "Restart and Run All"; if breaks, refactor
#   hidden state bug                            -> use copy() not inplace; immutable patterns
#
# Anti-pattern: shipping a notebook AS the production code. Notebook
# scheduled with papermill, fine. Notebook IS the API server, not
# fine — Jupyter wasn't built for that. The discipline: notebook is
# DEVELOPMENT FLOW; .py module is PRODUCTION CODE; papermill bridges
# the two when "scheduled notebook output" is the deliverable.
```

## Decision Rule

```text
exploration / EDA                       -> notebook
analysis report (one-time)               -> notebook + nbconvert HTML
recurring report                          -> notebook + papermill scheduled
reusable code                              -> .py module; import from notebooks
long-running job                            -> .py script; not a notebook
service / API                              -> .py; FastAPI or similar
ML training pipeline                       -> .py orchestrator + notebook for analysis
shared library                             -> .py with tests; never a notebook
prototype to production                    -> notebook → extract to .py incrementally
stuck in cell-order hell                  -> "Restart and Run All"; if breaks, refactor
hidden state bug                            -> use copy() not inplace; immutable patterns
```

## Anti-Pattern

> [!warning] Anti-pattern
> shipping a notebook AS the production code. Notebook
> scheduled with papermill, fine. Notebook IS the API server, not
> fine — Jupyter wasn't built for that. The discipline: notebook is
> DEVELOPMENT FLOW; .py module is PRODUCTION CODE; papermill bridges
> the two when "scheduled notebook output" is the deliverable.

## Tips

- The "Restart and Run All" test is the single best smell detector. If a notebook only works in the order you happened to run it, refactor.
- Extract any function used twice into a `.py` module under `src/`. `pip install -e .` makes it importable from notebooks.
- Avoid `df.x.inplace = True` and `df.method(inplace=True)`. Returning new DataFrames is the same memory cost in modern pandas and removes hidden mutation.
- For monthly/scheduled reports, the right pattern is a thin notebook (imports + viz) + a tested `.py` module + papermill for scheduling.
- Use `jupytext` paired notebooks so the `.py` companion is the git-tracked source. Notebook for run/preview; `.py` for review.
- Notebook is for INTERACTIVE EXPLORATION and ONE-TIME REPORTS. For services, APIs, batch jobs, scheduled work — write `.py`.

## Common Mistake

> [!warning] Shipping a notebook AS production code (web service, batch job, recurring pipeline). Notebooks have hidden state, no tests, fragile cell-order dependencies, and no proper concurrency story. The right pattern: tested `.py` module for the logic; thin notebook for analysis + viz; papermill for scheduling notebooks that produce reports.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Notebook IS the recurring job — fragile + un-debuggable
# notebook.ipynb scheduled directly via cron, runs all 50 cells
# Some cell mutates global state; next run sees stale data
```

**Senior:**
```python
# Module + thin notebook + papermill
# src/myproj/report.py — tested business logic
# notebooks/report.ipynb — calls the module, glues outputs
# Airflow papermill task: pm.execute_notebook(report.ipynb, ...)
```

## See Also

- [[Sections/notebooks/production/notebook-ci-testing|Notebook CI testing — nbval, pytest-notebook, papermill assertions (Notebooks)]]
- [[Sections/notebooks/production/jupyterhub-deployment|JupyterHub — multi-user notebook server with auth, resources (Notebooks)]]
- [[Sections/notebooks/production/_Index|Notebooks → Production — CI testing, JupyterHub, anti-patterns]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

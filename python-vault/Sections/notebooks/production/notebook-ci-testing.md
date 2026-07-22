---
type: "entry"
domain: "python"
file: "notebooks"
section: "production"
id: "notebook-ci-testing"
title: "Notebook CI testing — nbval, pytest-notebook, papermill assertions"
category: "Production"
subtitle: "nbval --nbval-lax, pytest-notebook, papermill execute + scrapbook scraps, fixtures via tmp_path, kernel selection in CI"
signature_short: "pytest --nbval notebooks/   # validates each cell's outputs match the saved version"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Notebook CI testing — nbval, pytest-notebook, papermill assertions"
  - "notebook-ci-testing"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/production"
  - "category/production"
  - "tier/tiered"
---

# Notebook CI testing — nbval, pytest-notebook, papermill assertions

> nbval --nbval-lax, pytest-notebook, papermill execute + scrapbook scraps, fixtures via tmp_path, kernel selection in CI

## Overview

Notebooks rot — a pandas update changes a column name, your data source moves, the model retrains. CI catches these. Three patterns: **nbval** runs each cell and verifies the new output matches the saved output (good for analyses where output should be stable); **pytest-notebook** lets you write pytest tests that assert on notebook outputs; **papermill + scrapbook** runs the notebook and asserts on glued values. The three examples solve the SAME concrete task — verify the monthly report notebook still produces correct outputs — at three depths: nbval validation → papermill + scrapbook + pytest assertions → production with fixture-based test data, multi-version matrix, alert on drift.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Run a notebook in CI; fail if any cell errors. pip install pytest nbval
- **Junior** — SAME — but assert specific values via papermill + scrapbook. pip install pytest papermill scrapbook
- **Senior** — SAME — production: fixture-based test data, multi-version matrix, alert on output drift.

## Signature

```python
pytest --nbval notebooks/   # validates each cell's outputs match the saved version
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Run a notebook in CI; fail if any cell errors.
# pip install pytest nbval

# === nbval: pytest plugin ===
# Runs every cell of every notebook in the directory; FAILS if a cell
# raises OR if the output differs from the saved version.

# Run all notebooks:
# $ pytest --nbval notebooks/
# pass = cells run cleanly AND outputs match
# fail = cell raises OR output differs from what's saved

# === Lax mode: only check that cells DON'T error ===
# Useful when outputs vary (random seeds, timestamps, IDs).
# $ pytest --nbval-lax notebooks/

# === Skip cells where output is volatile ===
# Tag a cell with "nbval-ignore-output" to skip output comparison.
# (View → Cell Toolbar → Tags → add nbval-ignore-output)
# Cell still executes; just doesn't have to match saved output.

# === pytest config: only nbval certain notebooks ===
# pytest.ini
# [pytest]
# addopts = --nbval-lax
# testpaths = notebooks/

# Or run a specific subset:
# $ pytest --nbval-lax notebooks/critical/ -v
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but assert specific values via papermill + scrapbook.
# pip install pytest papermill scrapbook
import pytest, papermill as pm, scrapbook as sb
from pathlib import Path

# === Run the notebook in a test; assert on scraps ===
def test_monthly_report(tmp_path: Path):
    """Run the monthly report; assert key outputs are sane."""
    out = tmp_path / "result.ipynb"

    # Execute with test parameters.
    pm.execute_notebook(
        "notebooks/monthly_report.ipynb",
        str(out),
        parameters={
            "month": "2024-11",
            "test_mode": True,             # use a small CSV instead of full DB
        },
    )

    # Read scraps and assert.
    nb = sb.read_notebook(str(out))
    revenue = nb.scraps["total_revenue"].data
    by_region = nb.scraps["by_region"].data

    assert revenue > 0,                       "revenue must be positive"
    assert revenue < 10_000_000,               "revenue suspiciously large"
    assert "us" in by_region,                  "missing US data"
    assert sum(by_region.values()) == pytest.approx(revenue, rel=0.01)

# === Test multiple parameter sets ===
@pytest.mark.parametrize("month", ["2024-09", "2024-10", "2024-11"])
def test_report_for_each_month(tmp_path: Path, month: str):
    out = tmp_path / f"out_{month}.ipynb"
    pm.execute_notebook(
        "notebooks/monthly_report.ipynb", str(out),
        parameters={"month": month, "test_mode": True},
    )
    nb = sb.read_notebook(str(out))
    assert nb.scraps["total_revenue"].data > 0

# === Run nbval and papermill in same CI ===
# .github/workflows/test-notebooks.yml
# - run: pytest --nbval-lax notebooks/exploratory/
# - run: pytest tests/test_reports.py     # papermill-based tests
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: fixture-based test data,
#             multi-version matrix, alert on output drift.
import pytest
import papermill as pm
import scrapbook as sb
import pandas as pd
import json
from pathlib import Path

# === Fixture: test data fixture seeds the DB / S3 / CSV ===
@pytest.fixture(scope="session")
def test_data_dir(tmp_path_factory):
    """Set up test fixtures once; reuse across tests."""
    d = tmp_path_factory.mktemp("test_data")
    pd.DataFrame({
        "month": ["2024-11", "2024-11", "2024-11"],
        "region": ["us", "eu", "apac"],
        "amount": [1000, 800, 500],
    }).to_csv(d / "sales.csv", index=False)
    return d

# === Snapshot test: outputs match a baseline ===
@pytest.fixture(scope="session")
def snapshot_dir() -> Path:
    return Path("tests/snapshots")

def test_report_against_snapshot(test_data_dir, tmp_path, snapshot_dir):
    """Run the notebook; compare scraps to saved snapshot."""
    out = tmp_path / "result.ipynb"
    pm.execute_notebook(
        "notebooks/monthly_report.ipynb",
        str(out),
        parameters={"data_dir": str(test_data_dir), "month": "2024-11"},
    )
    nb = sb.read_notebook(str(out))
    actual = {k: v.data for k, v in nb.scraps.items()}

    snapshot_path = snapshot_dir / "monthly_2024-11.json"
    if not snapshot_path.exists():
        # First run: save the snapshot.
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        snapshot_path.write_text(json.dumps(actual, sort_keys=True, indent=2))
        pytest.skip("snapshot created; rerun to compare")

    expected = json.loads(snapshot_path.read_text())
    assert actual == expected, f"output drift detected; review {snapshot_path}"

# To regenerate snapshots after a deliberate change:
# $ rm tests/snapshots/*.json && pytest tests/test_reports.py

# === Multi-version matrix in CI ===
# .github/workflows/notebooks.yml
# strategy:
#   matrix:
#     python-version: ["3.11", "3.12"]
#     pandas-version: ["1.5", "2.2"]
# steps:
#   - uses: actions/setup-python@v5
#     with:
#       python-version: ${{ matrix.python-version }}
#   - run: |
#       pip install pandas==${{ matrix.pandas-version }} \
#                   pytest papermill scrapbook nbval
#   - run: pytest tests/test_reports.py

# === Alert on cell-execution time regression ===
def test_notebook_runtime(test_data_dir, tmp_path):
    """Notebook should execute within budget."""
    import time
    started = time.monotonic()
    pm.execute_notebook(
        "notebooks/monthly_report.ipynb",
        str(tmp_path / "out.ipynb"),
        parameters={"data_dir": str(test_data_dir)},
    )
    elapsed = time.monotonic() - started
    assert elapsed < 60.0, f"notebook took {elapsed:.1f}s (budget: 60s)"

# Decision rule:
#   exploratory notebook                  -> nbval-lax (only check it runs)
#   stable analysis with known outputs    -> nbval (full output match)
#   programmatic outputs                    -> papermill + scrapbook + asserts
#   snapshot test against baseline          -> snapshot file + diff in CI
#   multi-version compatibility            -> matrix in CI; varied pandas/python versions
#   long-running notebook                   -> tag for nightly only; not on every PR
#   GPU-required                              -> separate job with GPU runner
#   notebook in deployed pipeline           -> CI is the regression test; PR-gated
#   parameter sweeps                          -> pytest.mark.parametrize for known params
#   data drift detection                      -> fixture mocks data; assert on summary stats
#
# Anti-pattern: never running notebooks in CI. Notebooks rot silently
# — pandas changes, data formats shift, libraries deprecate. Six
# months later you reopen "the report notebook" and 40% of cells
# error. CI catches these the day they break, not when you next look
# at the notebook.
```

## Decision Rule

```text
exploratory notebook                  -> nbval-lax (only check it runs)
stable analysis with known outputs    -> nbval (full output match)
programmatic outputs                    -> papermill + scrapbook + asserts
snapshot test against baseline          -> snapshot file + diff in CI
multi-version compatibility            -> matrix in CI; varied pandas/python versions
long-running notebook                   -> tag for nightly only; not on every PR
GPU-required                              -> separate job with GPU runner
notebook in deployed pipeline           -> CI is the regression test; PR-gated
parameter sweeps                          -> pytest.mark.parametrize for known params
data drift detection                      -> fixture mocks data; assert on summary stats
```

## Anti-Pattern

> [!warning] Anti-pattern
> never running notebooks in CI. Notebooks rot silently
> — pandas changes, data formats shift, libraries deprecate. Six
> months later you reopen "the report notebook" and 40% of cells
> error. CI catches these the day they break, not when you next look
> at the notebook.

## Tips

- `pytest --nbval-lax notebooks/` is the "minimum viable" notebook CI — only checks cells run without errors. Add explicit value asserts for stronger checks.
- Tag volatile cells (timestamps, random seeds, generated IDs) with `nbval-ignore-output` so the full match doesn't break on irrelevant changes.
- For programmatic outputs, papermill + scrapbook is the right tool. Glue values; assert on them in pytest. Better than parsing notebook JSON.
- Snapshot tests (`expected.json`) + JSON diff catch subtle output drift. Regenerate via `rm snapshots/*.json && pytest`.
- For long-running notebooks (>1 min), tag them as `@pytest.mark.slow` and run nightly only. PR builds run the fast subset.
- For multi-environment tests (Python versions, library versions), use GitHub Actions matrix. Catches "works on my machine" issues.

## Common Mistake

> [!warning] Never running notebooks in CI. Six months later you open "the monthly report" and half the cells error — pandas changed, the data source moved, a library was deprecated. CI catches these the day they break. nbval-lax + papermill + scrapbook covers most needs.

## Shorthand (Junior → Senior)

**Junior:**
```python
# No CI for notebooks
# Six months later: "why did the report break?"
```

**Senior:**
```python
# CI runs notebooks every PR
$ pytest --nbval-lax notebooks/         # cells must execute
$ pytest tests/test_reports.py          # outputs must match expectations
```

## See Also

- [[Sections/notebooks/production/jupyterhub-deployment|JupyterHub — multi-user notebook server with auth, resources (Notebooks)]]
- [[Sections/notebooks/production/notebook-anti-patterns|Notebook anti-patterns — when to graduate to .py (Notebooks)]]
- [[Sections/notebooks/production/_Index|Notebooks → Production — CI testing, JupyterHub, anti-patterns]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

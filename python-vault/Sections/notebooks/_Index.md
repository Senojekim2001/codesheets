---
type: "file-index"
domain: "python"
file: "notebooks"
title: "Notebooks"
tags:
  - "python"
  - "python/notebooks"
  - "index"
---

# Notebooks

> 9 entries across 3 sections.

## Jupyter basics — magics, display, kernels · 3

- [[Sections/notebooks/jupyter-basics/jupyter-magic-commands|IPython magic commands — %time, %autoreload, %%writefile]] — Magic commands extend Python with REPL-friendly verbs: time/profile a cell, edit-and-reload modules, write a cell to disk. The "make notebooks not annoying" toolkit.
- [[Sections/notebooks/jupyter-basics/ipython-display-widgets|IPython.display & ipywidgets — rich output and interactivity]] — Render Markdown, HTML, images, audio, video inline; bind sliders, dropdowns, and buttons to functions via `ipywidgets`. The interactivity that makes notebooks feel alive.
- [[Sections/notebooks/jupyter-basics/jupyter-kernel-management|Kernels & environments — per-project Python, JupyterLab vs notebook]] — Each project gets its own kernel pointing at its own venv. Multiple kernels in one Jupyter; switch via kernelspec. JupyterLab is the modern UI; notebook (nbclassic) and Lab differ in features and extensions.

## Workflow — papermill, jupytext, nbconvert · 3

- [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution]] — Run a notebook with injected parameters from the command line; capture outputs; suitable for scheduled reports and CI. The "treat a notebook as a data pipeline" tool.
- [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs]] — Keep `notebook.ipynb` paired with `notebook.py`; both stay in sync; commit only the `.py` for sane diffs. Combined with `nbstripout`, your git history stays readable.
- [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides]] — Convert `.ipynb` to HTML, PDF, Markdown, or RevealJS slides via `jupyter nbconvert`. Voila renders a notebook as a live web app for non-developers.

## Production — CI testing, JupyterHub, anti-patterns · 3

- [[Sections/notebooks/production/notebook-ci-testing|Notebook CI testing — nbval, pytest-notebook, papermill assertions]] — Run notebooks in CI to catch regressions; assert outputs match expectations; ensure reproducibility. Three approaches: `nbval` validates outputs match, `pytest-notebook` allows pytest-style asserts, papermill + scrapbook for output checking.
- [[Sections/notebooks/production/jupyterhub-deployment|JupyterHub — multi-user notebook server with auth, resources]] — JupyterHub spawns a per-user notebook server (process or container or pod). OAuth via OIDC; resource limits per user; GPU profiles. The team-deployment story for Jupyter.
- [[Sections/notebooks/production/notebook-anti-patterns|Notebook anti-patterns — when to graduate to .py]] — Notebooks are great for exploration; bad for production code. The traps: cell-order dependencies, hidden state, no tests, copy-paste reuse. The discipline: refactor reusable code into modules, keep notebooks for analysis + visualization.

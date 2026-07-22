---
type: "entry"
domain: "python"
file: "notebooks"
section: "workflow"
id: "jupytext-version-control"
title: "jupytext — pair .ipynb with .py for clean git diffs"
category: "Workflow"
subtitle: "jupytext --set-formats ipynb,py:percent, .py percent format, --sync, nbstripout, .gitattributes filter, pre-commit hooks"
signature_short: "jupytext --set-formats \"ipynb,py:percent\" notebook.ipynb"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "jupytext — pair .ipynb with .py for clean git diffs"
  - "jupytext-version-control"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/workflow"
  - "category/workflow"
  - "tier/tiered"
---

# jupytext — pair .ipynb with .py for clean git diffs

> jupytext --set-formats ipynb,py:percent, .py percent format, --sync, nbstripout, .gitattributes filter, pre-commit hooks

## Overview

Jupyter notebooks are JSON with embedded outputs and execution counts; `git diff` is unreadable, merge conflicts are nightmares, and PR reviews are slow. Two complementary fixes: (a) **jupytext** pairs each `.ipynb` with a `.py` (or `.md`) representation; both stay in sync; commit only the `.py`. (b) **nbstripout** as a git filter strips outputs from `.ipynb` before commit. The three examples solve the SAME concrete task — make notebook commits readable in PR reviews — at three depths: nbstripout for output-stripping → jupytext pairing with percent format → pre-commit hooks + .gitattributes for the team-wide setup.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Stop committing notebook outputs (huge diffs). pip install nbstripout
- **Junior** — SAME — plus pair the notebook with a .py file for readable line-by-line diffs. pip install jupytext
- **Senior** — SAME — production: pre-commit hooks for the team, .gitattributes for git-side filtering, CI check.

## Signature

```python
jupytext --set-formats "ipynb,py:percent" notebook.ipynb
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Stop committing notebook outputs (huge diffs).
# pip install nbstripout

# Install as a git filter for this repo:
#   $ nbstripout --install
# Now every `git add notebook.ipynb` strips outputs before staging.
# Outputs still display in your local Jupyter; they're just not in git.

# Or as a one-shot:
#   $ nbstripout notebook.ipynb         # in-place
#   $ nbstripout < notebook.ipynb > clean.ipynb

# What gets stripped:
#   - outputs (cell results, plots, error tracebacks)
#   - execution counts (the [123] next to each cell)
#   - metadata.kernelspec (optional; usually keep it)
#
# git diff now shows only the SOURCE changes, not output noise.

# Caveat:
#   nbstripout doesn't help with reordered cells, edited cells inside
#   long notebooks — diff is still mostly JSON. Junior tier adds
#   jupytext for line-by-line .py diffs.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — plus pair the notebook with a .py file for
#             readable line-by-line diffs.
# pip install jupytext

# === Pair an existing notebook ===
# $ jupytext --set-formats "ipynb,py:percent" notebook.ipynb
# This:
#   - Creates notebook.py alongside notebook.ipynb
#   - Records the pairing in the .ipynb metadata
#   - Both files are kept in sync — edit either, save, the other updates

# Format options:
#   py:percent  - cells delimited by '# %%' comments; most popular
#                  Compatible with VS Code, PyCharm cell-mode runners.
#   py:light     - lighter delimiters; less metadata
#   md           - markdown with code blocks; good for tutorials

# Example notebook.py (percent format):
# ---
# # %%
# import pandas as pd
# df = pd.read_csv("data.csv")
#
# # %% [markdown]
# # ## Section header
# # Some prose explaining what this does.
#
# # %%
# df.head()
# ---

# === Sync after editing ===
# If you edit the .py file outside Jupyter (text editor, IDE):
#   $ jupytext --sync notebook.ipynb           # propagates .py changes to .ipynb

# === Commit ONLY the .py ===
# .gitignore:
#   notebook.ipynb           # don't commit the JSON
#   *.ipynb_checkpoints/

# Pull workflow:
#   $ git pull               # gets updated .py
#   $ jupyter lab            # opening the notebook recreates .ipynb from .py
#   (jupytext_serverextension auto-creates the missing .ipynb on open)

# === Hybrid: commit BOTH .ipynb and .py ===
# Some teams want the .ipynb in git so non-developers can preview on
# GitHub. Combine with nbstripout to keep the .ipynb minimal.

# === Convert one-off ===
# $ jupytext --to py notebook.ipynb            # produces notebook.py
# $ jupytext --to ipynb notebook.py            # produces notebook.ipynb
# $ jupytext --to md notebook.ipynb            # produces notebook.md
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: pre-commit hooks for the team,
#             .gitattributes for git-side filtering, CI check.

# === pre-commit configuration ===
# .pre-commit-config.yaml
# repos:
#   - repo: https://github.com/kynan/nbstripout
#     rev: 0.7.1
#     hooks:
#       - id: nbstripout
#
#   - repo: https://github.com/mwouts/jupytext
#     rev: v1.16.4
#     hooks:
#       - id: jupytext
#         args: [--sync]
#
# Install once: $ pre-commit install
# Now every `git commit` runs both hooks; non-jupytext'd notebooks
# get stripped, paired notebooks get synced.

# === .gitattributes for global filter ===
# .gitattributes (committed)
# *.ipynb diff=ipynb merge=ipynb
#
# .gitconfig (per-developer; auto-set by 'nbstripout --install --global'):
# [diff "ipynb"]
#     textconv = jupyter nbconvert --to script --stdout
# [merge "ipynb"]
#     name = Jupyter notebook merge driver
#     driver = jupyter nbformat ...
#
# Result: `git diff notebook.ipynb` shows the script equivalent;
# merge tools handle nbformat correctly.

# === CI check: ensure paired files are in sync ===
# .github/workflows/check-notebooks.yml
# - name: Check jupytext sync
#   run: |
#     pip install jupytext
#     for nb in $(find . -name "*.ipynb" -not -path "*/.ipynb_checkpoints/*"); do
#       py="${nb%.ipynb}.py"
#       if [ -f "$py" ]; then
#         jupytext --diff "$nb" "$py" || \
#           (echo "ERROR: $nb and $py out of sync; run jupytext --sync"; exit 1)
#       fi
#     done

# Decision rule:
#   want clean git history                 -> nbstripout for outputs
#   want readable PR diffs                  -> jupytext pairing
#   prefer python file as canonical          -> commit .py only; .gitignore .ipynb
#   prefer notebook for GitHub preview        -> commit .ipynb (stripped) AND .py
#   tutorials with prose                       -> jupytext --to md (markdown format)
#   collaborate with non-developers           -> commit .ipynb + jupytext both
#   one-shot conversion                        -> jupytext --to py / --to ipynb
#   pre-commit                                  -> nbstripout + jupytext --sync hooks
#   merge conflicts                              -> jupytext + git merge driver via .gitattributes
#   notebook in CI testing                       -> nbval / pytest-notebook (next entry)
#   need full output for diff (rare)            -> turn off nbstripout for that file via attribute
#
# Anti-pattern: committing .ipynb files with full outputs (CSVs
# inlined as base64, plots as embedded PNGs). Repository size balloons,
# git diff is JSON noise, PR reviews require manually opening the
# notebook in Jupyter to see what changed. Either nbstripout (keep
# .ipynb, strip outputs) or jupytext (commit .py companion).
```

## Decision Rule

```text
want clean git history                 -> nbstripout for outputs
want readable PR diffs                  -> jupytext pairing
prefer python file as canonical          -> commit .py only; .gitignore .ipynb
prefer notebook for GitHub preview        -> commit .ipynb (stripped) AND .py
tutorials with prose                       -> jupytext --to md (markdown format)
collaborate with non-developers           -> commit .ipynb + jupytext both
one-shot conversion                        -> jupytext --to py / --to ipynb
pre-commit                                  -> nbstripout + jupytext --sync hooks
merge conflicts                              -> jupytext + git merge driver via .gitattributes
notebook in CI testing                       -> nbval / pytest-notebook (next entry)
need full output for diff (rare)            -> turn off nbstripout for that file via attribute
```

## Anti-Pattern

> [!warning] Anti-pattern
> committing .ipynb files with full outputs (CSVs
> inlined as base64, plots as embedded PNGs). Repository size balloons,
> git diff is JSON noise, PR reviews require manually opening the
> notebook in Jupyter to see what changed. Either nbstripout (keep
> .ipynb, strip outputs) or jupytext (commit .py companion).

## Tips

- `nbstripout --install` registers as a git filter for the current repo. Every `git add` of an `.ipynb` strips outputs before staging.
- Use `py:percent` format for jupytext (cells delimited by `# %%`). VS Code, PyCharm, and other editors recognize it natively for cell-mode running.
- For pure-Python projects, commit only `.py`; `.gitignore` the `.ipynb`. Jupyter regenerates the `.ipynb` on open via the jupytext extension.
- For tutorials and docs, `jupytext --to md` gives Markdown output — readable on GitHub, includes prose, code blocks compile back to a notebook.
- Pair with pre-commit so the team's checkout is consistent. New developers `pre-commit install` once and never think about it.
- For merge conflicts in `.ipynb`, the jupytext `.py` companion makes the conflict tractable — resolve in Python, regenerate the notebook.

## Common Mistake

> [!warning] Committing `.ipynb` files with full outputs (base64 PNGs, inlined CSVs, error tracebacks). Repository size balloons, `git diff` is unreadable JSON, PR reviews require opening the notebook in Jupyter. Either install `nbstripout` (keep `.ipynb`, strip outputs) or use jupytext pairing (commit `.py` companion).

## Shorthand (Junior → Senior)

**Junior:**
```python
# Commit notebooks with all outputs — repo bloat
$ git add analysis.ipynb     # 5 MB of base64 PNG outputs
$ git diff analysis.ipynb    # unreadable JSON
```

**Senior:**
```python
# nbstripout + jupytext pairing
$ nbstripout --install
$ jupytext --set-formats "ipynb,py:percent" analysis.ipynb
$ git diff analysis.py       # readable diff of cells
```

## See Also

- [[Sections/ml/preprocessing/pipeline|Pipeline (Machine Learning)]]
- [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution (Notebooks)]]
- [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides (Notebooks)]]
- [[Sections/notebooks/workflow/_Index|Notebooks → Workflow — papermill, jupytext, nbconvert]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

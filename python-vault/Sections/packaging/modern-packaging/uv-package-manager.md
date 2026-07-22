---
type: "entry"
domain: "python"
file: "packaging"
section: "modern-packaging"
id: "uv-package-manager"
title: "uv — The Ultrafast Package Manager"
category: "Packaging"
subtitle: "uv init, uv add, uv run, uv sync, uv venv, uv.lock"
signature_short: "uv init project  |  uv add package  |  uv run pytest  |  uv sync"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "uv — The Ultrafast Package Manager"
  - "uv-package-manager"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/modern-packaging"
  - "category/packaging"
  - "tier/tiered"
---

# uv — The Ultrafast Package Manager

> uv init, uv add, uv run, uv sync, uv venv, uv.lock

## Overview

uv is a new package manager written in Rust, 10-100x faster than pip. It replaces pip, pip-tools, virtualenv, and pyenv. Single tool for: creating projects, managing dependencies, managing environments, running commands, installing CLI tools. uv.lock is a deterministic lockfile (like Cargo.lock) ensuring reproducible builds. Perfect for new projects and CI/CD.

## Signature

```python
uv init project  |  uv add package  |  uv run pytest  |  uv sync
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Init a project, add deps, run commands -- uv handles the venv for you.
# STRENGTHS - One install, one binary; replaces pip + pip-tools + virtualenv + pyenv.
# WEAKNESSES- Newer than pip; some private indexes still need extra configuration.
# Install:  curl -LsSf https://astral.sh/uv/install.sh | sh

# Daily commands:
uv init my-app                      # creates pyproject.toml + .python-version + src/
cd my-app
uv add httpx pydantic               # adds deps + updates uv.lock
uv add --dev pytest ruff            # dev-only
uv run python -m my_app             # runs in the project env (no activate needed)
uv run pytest                       # runs tests
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pin Python version, sync from a frozen lock in CI, install standalone tools globally.
# STRENGTHS - Reproducible builds, ~10-100x faster than pip, single CLI for env+deps+tools.
# WEAKNESSES- uv.lock format is uv-specific; readers without uv must regenerate or use pip-compile equivalents.
# Lock & sync:
uv lock                             # regenerate uv.lock from pyproject
uv sync                             # install deps EXACTLY as locked
uv sync --frozen                    # error if pyproject changed without re-locking (use in CI)
uv sync --extra dev                 # include optional-dependency group 'dev'
uv sync --group test                # include PEP 735 dependency-group 'test'

# Pin Python version per project (creates .python-version):
uv python pin 3.12
uv python install 3.12              # download/install if missing
uv venv --python 3.12               # explicit venv with specific interpreter

# Standalone CLIs (each gets its own isolated env):
uv tool install ruff
uv tool install --upgrade ruff
uvx ruff check .                    # ad-hoc, no install (cached)

# Updating one transitive dep:
uv lock --upgrade-package httpx
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - uv as the universal Python toolchain in CI/CD: cached wheel store, frozen sync, multi-Python matrix, private indexes.
# STRENGTHS - Reproducible across dev/CI/prod; cache hits dominate; matrix-test against 3.11/3.12/3.13 trivially.
# WEAKNESSES- Cache invalidation is its own problem -- prefer hashed restore keys to "latest" cache.
# pyproject.toml ─────────────────────────────────────
# [tool.uv]
# resolution = "highest"          # or "lowest-direct" to test floors
# python-preference = "managed"   # uv-managed Pythons, not system
#
# # Private corp index, fall back to PyPI:
# [[tool.uv.index]]
# name    = "internal"
# url     = "https://pypi.internal.example/simple"
# default = false
#
# # Constraints across the workspace (pin shared lib floors):
# constraint-dependencies = ["urllib3>=2.0,<3"]

# CI matrix (.github/workflows/ci.yml) ───────────────
# strategy:
#   matrix:
#     py: ["3.11", "3.12", "3.13"]
# steps:
#   - uses: actions/checkout@v4
#   - uses: astral-sh/setup-uv@v3
#     with:
#       enable-cache: true
#       cache-dependency-glob: "uv.lock"
#   - run: uv python install ${{ matrix.py }}
#   - run: uv sync --frozen --all-extras
#   - run: uv run pytest -q
#   - run: uv run mypy src
#   - run: uv run ruff check .

# Hermetic builds (Docker):
# FROM python:3.12-slim
# COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /usr/local/bin/uv
# WORKDIR /app
# COPY pyproject.toml uv.lock ./
# RUN uv sync --frozen --no-dev          # production deps only
# COPY src ./src
# CMD ["uv", "run", "--no-dev", "python", "-m", "my_app"]

# Decision rule:
#   greenfield project                   -> uv from day one, COMMIT uv.lock
#   sticking with pip but want a lock    -> pip-compile (pip-tools) -> requirements.txt
#   poetry codebase, no migration budget -> keep poetry, defer migration
#   conda-only ML stack                  -> conda + pip; uv replaces pip step but leaves conda
#   global CLI tool                      -> uv tool install / uvx
#   multi-Python matrix                  -> uv python install + uv venv --python X.Y
#   monorepo                             -> [tool.uv.workspace] members = ["packages/*"]
#   private package index                -> [[tool.uv.index]] block (NEVER inline auth in URLs;
#                                            use UV_INDEX_<NAME>_USERNAME / _PASSWORD env vars)
#
# Anti-pattern: 'uv sync' in CI without --frozen. A drifted pyproject silently
# resolves new versions; the lockfile no longer reflects what shipped. Always
# 'uv sync --frozen' on protected branches and treat lock changes as PRs.
```

## Decision Rule

```text
greenfield project                   -> uv from day one, COMMIT uv.lock
sticking with pip but want a lock    -> pip-compile (pip-tools) -> requirements.txt
poetry codebase, no migration budget -> keep poetry, defer migration
conda-only ML stack                  -> conda + pip; uv replaces pip step but leaves conda
global CLI tool                      -> uv tool install / uvx
multi-Python matrix                  -> uv python install + uv venv --python X.Y
monorepo                             -> [tool.uv.workspace] members = ["packages/*"]
private package index                -> [[tool.uv.index]] block (NEVER inline auth in URLs;
                                         use UV_INDEX_<NAME>_USERNAME / _PASSWORD env vars)
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'uv sync' in CI without --frozen. A drifted pyproject silently
> resolves new versions; the lockfile no longer reflects what shipped. Always
> 'uv sync --frozen' on protected branches and treat lock changes as PRs.

## Tips

- uv is 10-100x faster than pip and handles environments, too — adopt it now for new projects.
- uv.lock is deterministic — commit it to git for reproducible CI/CD builds.
- uv run PROJECT executes in the project environment — no manual "source .venv/bin/activate".
- uv tool install makes standalone CLI tools (uvx for ad-hoc, no install) — no poetry/pipx needed.
- Always run `uv sync --frozen` on protected branches — a drifted pyproject silently resolves new versions otherwise. For private indexes, use [[tool.uv.index]] and pass auth via UV_INDEX_<NAME>_USERNAME / _PASSWORD env vars; never inline credentials in the URL.

## Common Mistake

> [!warning] `uv sync` in CI without --frozen — a drifted pyproject silently resolves new versions and the lockfile no longer reflects what shipped. Always treat lock changes as PRs; use --frozen on protected branches.

## Shorthand (Junior → Senior)

**Junior:**
```python
python -m venv .venv
source .venv/bin/activate
pip install httpx pydantic
pip install pytest ruff             # no native --dev flag in pip; track dev deps in requirements-dev.txt or [project.optional-dependencies]
pip freeze > requirements.txt
```

**Senior:**
```python
uv init
uv add httpx pydantic
uv add --dev pytest ruff
uv run pytest
```

## See Also

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/_Index|Packaging, CLI & Tooling → Modern Packaging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "packaging"
section: "modern-packaging"
id: "poetry"
title: "Poetry — Dependency Management & Publishing"
category: "Packaging"
subtitle: "poetry init, add, install, build, publish, lock, poetry.lock"
signature_short: "poetry new project  |  poetry add package  |  poetry build  |  poetry publish"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Poetry — Dependency Management & Publishing"
  - "poetry"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/modern-packaging"
  - "category/packaging"
  - "tier/tiered"
---

# Poetry — Dependency Management & Publishing

> poetry init, add, install, build, publish, lock, poetry.lock

## Overview

Poetry is a high-level package manager and build tool. It manages pyproject.toml, creates lockfiles (poetry.lock), handles dependencies, builds wheels/sdists, and publishes to PyPI. Poetry is feature-rich but slower than uv. Good for: projects with complex dependency management, existing Poetry projects, teams preferring Poetry workflows. For new projects, uv is faster; for existing Poetry projects, keep using Poetry.

## Signature

```python
poetry new project  |  poetry add package  |  poetry build  |  poetry publish
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - poetry new -> add deps -> install -> run; poetry handles the venv and lockfile.
# STRENGTHS - Single tool for env+deps+build+publish; widely adopted.
# WEAKNESSES- Slower than uv; older [tool.poetry] config schema differs from PEP 621.
# Install:  curl -sSL https://install.python-poetry.org | python3 -

poetry new my-project              # scaffolds my-project/
cd my-project
poetry add httpx pydantic
poetry add --group dev pytest ruff
poetry install                     # creates venv, installs all deps, writes poetry.lock
poetry run pytest                  # run a command in the project env
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Group dev/test/docs deps; commit poetry.lock; build + publish via poetry.
# STRENGTHS - Deterministic builds; nice resolver for complex graphs; ergonomic group syntax.
# WEAKNESSES- ^X.Y caret means '<next-major>' which surprises folks expecting strict equality.
# pyproject.toml ─────────────────────────────────────
# [tool.poetry]
# name = "my-package"
# version = "1.0.0"
# description = "..."
# authors = ["Alice <alice@example.com>"]
# readme = "README.md"
# packages = [{include = "my_package", from = "src"}]
#
# [tool.poetry.dependencies]
# python = "^3.11"
# httpx  = "^0.25"
# pydantic = "^2"
#
# [tool.poetry.group.dev.dependencies]
# pytest = "^8"
# ruff   = "^0.5"
# mypy   = "^1.10"
#
# [tool.poetry.group.docs.dependencies]
# mkdocs-material = "^9"
#
# [tool.poetry.scripts]
# my-cli = "my_package.cli:main"
#
# [build-system]
# requires = ["poetry-core>=1.9"]
# build-backend = "poetry.core.masonry.api"

# Daily commands:
poetry install --with dev,docs              # include both groups
poetry update httpx                          # bump one dep within constraint
poetry lock --no-update                      # rewrite lock without resolving fresh
poetry run pytest -q
poetry build                                 # dist/*.whl + *.tar.gz
poetry publish -r testpypi                   # uploads to TestPyPI first
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - poetry-dynamic-versioning, trusted publishing, in-CI 'install --no-root --sync', PEP 621 migration plan.
# STRENGTHS - Repeatable releases; lock + sync ensures CI matches dev; OIDC publishing avoids leaked tokens.
# WEAKNESSES- Poetry's velocity is slower than uv's; PEP 621 migration is awkward (mixed [tool.poetry] + [project]).
# Version derived from VCS (poetry-dynamic-versioning):
# [tool.poetry]
# version = "0.0.0"          # placeholder; real value comes from git tag at build time
#
# [tool.poetry-dynamic-versioning]
# enable = true
# vcs = "git"
# style = "pep440"
#
# [tool.poetry.requires-plugins]
# poetry-dynamic-versioning = ">=1.4"

# CI invariants (.github/workflows/release.yml):
#   permissions:
#     id-token: write             # OIDC for trusted publishing
#     contents: read
#   - run: pipx install poetry==1.8.3
#   - run: poetry install --no-root --sync         # remove unlisted, install exact lock
#   - run: poetry run pytest -q
#   - run: poetry build
#   - uses: pypa/gh-action-pypi-publish@release/v1 # NO PYPI_TOKEN secret needed

# Migration to uv (when ready):
#  1) poetry export --without-hashes -f requirements.txt --with dev > /tmp/req.txt
#  2) Rewrite [tool.poetry.*] -> PEP 621 [project] + [project.optional-dependencies]
#  3) Replace [build-system] with hatchling or keep poetry-core
#  4) uv lock; verify uv.lock resolves the same set; delete poetry.lock + tool.poetry blocks

# Decision rule:
#   already on poetry, no migration budget         -> stay; tighten install --sync in CI
#   need OIDC trusted publishing                   -> any tool works; secret-free is the rule
#   complex resolver edge cases (yanked, prereleases) -> poetry; uv is closing the gap fast
#   want PEP 621 native                            -> uv (hatchling) or pdm
#   plug-in ecosystem (poetry plugins)             -> stay on poetry only if you USE them
#   need 'pre-release allowed by default'          -> poetry add 'pkg --allow-prereleases'
#                                                    or uv with resolution = "lowest-direct" + pre-releases
#
# Anti-pattern: 'poetry install' in CI without --sync. Stale local installs of
# REMOVED packages remain in the venv; tests pass locally and fail in prod.
# Always 'poetry install --no-root --sync' so the env mirrors poetry.lock.
```

## Decision Rule

```text
already on poetry, no migration budget         -> stay; tighten install --sync in CI
need OIDC trusted publishing                   -> any tool works; secret-free is the rule
complex resolver edge cases (yanked, prereleases) -> poetry; uv is closing the gap fast
want PEP 621 native                            -> uv (hatchling) or pdm
plug-in ecosystem (poetry plugins)             -> stay on poetry only if you USE them
need 'pre-release allowed by default'          -> poetry add 'pkg --allow-prereleases'
                                                 or uv with resolution = "lowest-direct" + pre-releases
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'poetry install' in CI without --sync. Stale local installs of
> REMOVED packages remain in the venv; tests pass locally and fail in prod.
> Always 'poetry install --no-root --sync' so the env mirrors poetry.lock.

## Tips

- poetry.lock is deterministic — commit to git for reproducible installs.
- poetry.add automatically updates pyproject.toml — no separate requirements files needed.
- poetry publish requires PyPI token (not password) — better, use Trusted Publishing (OIDC) so no token lives in CI at all.
- poetry is slower than uv but handles complex dependency resolution well; in CI always run `poetry install --no-root --sync` so the env mirrors poetry.lock and orphan packages are removed.

## Common Mistake

> [!warning] `poetry install` in CI without --sync — stale local installs of REMOVED packages remain in the venv; tests pass locally and fail in prod. Always `poetry install --no-root --sync` so the env mirrors poetry.lock.

## Shorthand (Junior → Senior)

**Junior:**
```python
poetry new my-package
cd my-package
poetry add httpx pydantic
poetry add --group dev pytest
```

**Senior:**
```python
poetry add httpx pydantic
poetry add --group dev pytest
poetry build && poetry publish
```

## See Also

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/_Index|Packaging, CLI & Tooling → Modern Packaging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

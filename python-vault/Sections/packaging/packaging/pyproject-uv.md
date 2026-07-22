---
type: "entry"
domain: "python"
file: "packaging"
section: "packaging"
id: "pyproject-uv"
title: "pyproject.toml & uv — Modern Python Packaging"
category: "Packaging"
subtitle: "pyproject.toml, uv, venv, pip, setuptools, hatchling, build, twine"
signature_short: "uv init  |  uv add package  |  uv sync  |  python -m build  |  twine upload"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pyproject.toml & uv — Modern Python Packaging"
  - "pyproject-uv"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/packaging"
  - "category/packaging"
  - "tier/tiered"
---

# pyproject.toml & uv — Modern Python Packaging

> pyproject.toml, uv, venv, pip, setuptools, hatchling, build, twine

## Overview

pyproject.toml is the standard Python project configuration file (PEP 621). It replaces setup.py, setup.cfg, and requirements.txt with a single declarative file. uv is the modern ultrafast package manager (10-100x faster than pip) that handles environments, dependencies, and lockfiles. Build backends (hatchling, setuptools, flit) compile your project into distributable wheels. Always use virtual environments to isolate project dependencies.

## Signature

```python
uv init  |  uv add package  |  uv sync  |  python -m build  |  twine upload
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Minimal pyproject.toml + venv + pip; the path every tutorial shows.
# STRENGTHS - Standard, dependency-free; works on any Python 3.11+.
# WEAKNESSES- No lockfile, slow installs, no transitive pins -- "works on my machine" risk.
# pyproject.toml ─────────────────────────────────────
# [project]
# name = "my-package"
# version = "0.1.0"
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.25"]
#
# [build-system]
# requires = ["hatchling"]
# build-backend = "hatchling.build"

# Shell:
# python -m venv .venv
# source .venv/bin/activate
# pip install -e .                # install your package in editable mode
# python -m my_package
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - uv for env+deps+lockfile; pyproject.toml as the SINGLE config; src/ layout for clean imports.
# STRENGTHS - Fast (Rust), reproducible (uv.lock), one tool replaces pip/pip-tools/virtualenv/pyenv.
# WEAKNESSES- Newer ecosystem -- a few corp registries / private indexes still need pip-compatible tweaks.
# Project layout (src/ layout avoids "import works because of cwd" bugs):
#   pyproject.toml
#   src/my_package/__init__.py
#   src/my_package/cli.py
#   tests/test_cli.py
#   uv.lock        <-- COMMIT THIS
#   .venv/         <-- gitignore

# pyproject.toml ─────────────────────────────────────
# [project]
# name = "my-package"
# version = "1.0.0"
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.25", "pydantic>=2.0"]
#
# [project.optional-dependencies]
# dev = ["pytest>=8", "ruff>=0.5", "mypy>=1.10"]
#
# [project.scripts]
# my-cli = "my_package.cli:main"      # entry point installed on the PATH
#
# [build-system]
# requires = ["hatchling"]
# build-backend = "hatchling.build"
#
# [tool.hatch.build.targets.wheel]
# packages = ["src/my_package"]

# Daily commands:
# uv init                                 # scaffold a new project
# uv add httpx 'pydantic>=2'              # add runtime dep, updates pyproject + lock
# uv add --dev pytest ruff mypy           # add dev dep
# uv sync                                 # create .venv + install from lock
# uv run pytest                           # run a command in the project env (no activate)
# uv lock --upgrade-package httpx         # refresh ONE pin
# uv build                                # build dist/*.whl + *.tar.gz
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - uv for dev + CI; hatchling/setuptools for build; uv.lock pinned; trusted-publishing on PyPI; matrix-test multiple Python versions.
# STRENGTHS - Reproducible CI, signed releases, no PyPI tokens in the repo, dynamic version from VCS.
# WEAKNESSES- More moving parts up front; payoff is in supply-chain security and reliable releases.
# pyproject.toml (production) ───────────────────────
# [build-system]
# requires      = ["hatchling", "hatch-vcs"]
# build-backend = "hatchling.build"
#
# [project]
# name        = "my-package"
# dynamic     = ["version"]                  # version from git tag (hatch-vcs)
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.25,<1", "pydantic>=2,<3"]
#
# [project.urls]
# Source  = "https://github.com/me/my-package"
# Issues  = "https://github.com/me/my-package/issues"
#
# [tool.hatch.version]
# source = "vcs"
#
# [tool.hatch.build.targets.wheel]
# packages = ["src/my_package"]
#
# [tool.hatch.build.targets.sdist]
# include = ["src", "README.md", "LICENSE"]
#
# [tool.uv]
# # Resolver options -- prefer pre-built wheels, exclude legacy specifiers.
# resolution = "highest"
# # Workspaces for monorepo:
# # [tool.uv.workspace]
# # members = ["packages/*"]

# CI invariants (.github/workflows/release.yml):
#   permissions:                 # OIDC, no PYPI_TOKEN secret
#     id-token: write
#     contents: read
#   - run: uv sync --frozen      # FAIL if lockfile drifted
#   - run: uv run pytest -q
#   - run: uv build
#   - uses: pypa/gh-action-pypi-publish@release/v1   # trusted publishing

# Decision rule:
#   greenfield project, fast CI, reproducible      -> uv + hatchling, COMMIT uv.lock
#   need plugin-rich extension system               -> setuptools (entry points are first-class)
#   pure-Python single-file project                 -> flit_core (zero config)
#   binary extensions (C/Rust)                      -> setuptools/maturin/scikit-build-core
#   dynamic version from git                        -> hatch-vcs (or setuptools-scm)
#   release to PyPI                                 -> trusted publishing (OIDC), NOT API tokens in CI
#   private corp index                              -> uv with [[tool.uv.index]] entries; pin index URLs
#
# Anti-pattern: setup.py exists in 2026, with manual version bumps on a branch
# nobody can find. Use a build backend that derives version from the git tag,
# trusted-publish from CI, and never edit version strings in source.
```

## Decision Rule

```text
greenfield project, fast CI, reproducible      -> uv + hatchling, COMMIT uv.lock
need plugin-rich extension system               -> setuptools (entry points are first-class)
pure-Python single-file project                 -> flit_core (zero config)
binary extensions (C/Rust)                      -> setuptools/maturin/scikit-build-core
dynamic version from git                        -> hatch-vcs (or setuptools-scm)
release to PyPI                                 -> trusted publishing (OIDC), NOT API tokens in CI
private corp index                              -> uv with [[tool.uv.index]] entries; pin index URLs
```

## Anti-Pattern

> [!warning] Anti-pattern
> setup.py exists in 2026, with manual version bumps on a branch
> nobody can find. Use a build backend that derives version from the git tag,
> trusted-publish from CI, and never edit version strings in source.

## Tips

- uv is 10-100x faster than pip and replaces pip, pip-tools, virtualenv, and pyenv in a single tool — adopt it for new projects.
- pyproject.toml replaces setup.py + setup.cfg + requirements.txt + MANIFEST.in — one file for everything.
- Use [project.scripts] to create CLI entry points: "my-cli = my_package.cli:main" makes my-cli available after install.
- Always test on TestPyPI before publishing to real PyPI — package names are permanent and cannot be reused.
- Derive version from the git tag with hatch-vcs / setuptools-scm (set `dynamic = ["version"]`) — the tag IS the release; never edit version strings in source. Publish via PyPI Trusted Publishing (OIDC) so no PYPI_TOKEN secret lives in CI.

## Common Mistake

> [!warning] Still using setup.py for new projects — setup.py is legacy. pyproject.toml is the standard since PEP 621 and all modern tools (uv, pip, hatch, flit) support it. Migrate existing projects with hatch or flit.

## Shorthand (Junior → Senior)

**Junior:**
```python
from setuptools import setup
setup(
    name="my-package",
    version="1.0.0",
    install_requires=["httpx>=0.25"],
)
```

**Senior:**
```python
# pyproject.toml
[project]
name = "my-package"
version = "1.0.0"
dependencies = ["httpx>=0.25"]
```

## See Also

- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation (Packaging, CLI & Tooling)]]
- [[Sections/packaging/packaging/_Index|Packaging, CLI & Tooling → Packaging & Environments]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

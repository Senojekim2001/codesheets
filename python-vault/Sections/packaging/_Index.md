---
type: "file-index"
domain: "python"
file: "packaging"
title: "Packaging, CLI & Tooling"
tags:
  - "python"
  - "python/packaging"
  - "index"
---

# Packaging, CLI & Tooling

> 15 entries across 5 sections.

## Packaging & Environments · 1

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging]] — Configure Python projects with pyproject.toml, manage environments with uv/venv, and publish to PyPI.

## CLI Development & Logging · 2

- [[Sections/packaging/cli-tools/typer-click|Typer & Click — Building CLI Applications]] — Build production CLI tools: Typer (modern, type-hint based), Click (battle-tested), and argparse (stdlib).
- [[Sections/packaging/cli-tools/logging|Logging & Observability — Production Python]] — Configure structured logging: stdlib logging, structlog, log levels, formatters, and production patterns.

## Modern Packaging · 5

- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard]] — [project], [build-system], tool-specific configs (pytest, ruff, mypy) — the modern single-source project file.
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager]] — uv init, add, run, sync — 10-100x faster than pip, handles environments, dependencies, and lockfiles.
- [[Sections/packaging/modern-packaging/virtual-environments|Virtual Environments — Isolating Dependencies]] — python -m venv, .venv, activation, pip install -r requirements.txt — isolate project dependencies.
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing]] — poetry new, pyproject.toml, poetry add, install, build, publish — all-in-one packaging tool.
- [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation]] — pip-compile, pip-sync, requirements.in → requirements.txt — ensure reproducible dependencies.

## Distribution & Publishing · 4

- [[Sections/packaging/distribution/package-structure|Package Structure — src/ Layout & __init__.py]] — src/ layout, __init__.py, __all__, namespace packages — proper Python package organization.
- [[Sections/packaging/distribution/setup-cfg|setup.cfg & setup.py — Legacy Packaging (For Maintenance)]] — Understand setup.py and setup.cfg for maintaining old packages — but use pyproject.toml for new ones.
- [[Sections/packaging/distribution/publishing-pypi|Publishing to PyPI — Build, Upload, Versioning]] — python -m build, twine upload, TestPyPI, versioning, .pypirc — share your package with the world.
- [[Sections/packaging/distribution/conda-environments|Conda & conda-environments — Mixing conda + pip]] — conda create, environment.yml, conda vs venv — when conda is useful, mixing conda and pip.

## Development Tools · 3

- [[Sections/packaging/dev-tools/ruff-linting|ruff — The Fast Linter & Formatter]] — ruff check, ruff format, pyproject.toml config — 10-100x faster than flake8/black/isort combined.
- [[Sections/packaging/dev-tools/pre-commit|pre-commit — Hooks for Linting, Testing, Type Checking]] — .pre-commit-config.yaml, auto-run hooks on commit — ruff, mypy, pytest, security checks.
- [[Sections/packaging/dev-tools/mypy-config-packaging|mypy — Type Checking Configuration]] — mypy.ini / pyproject.toml [tool.mypy], strict mode, py.typed, inline type: ignore.

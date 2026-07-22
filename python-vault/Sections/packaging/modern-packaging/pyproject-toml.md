---
type: "entry"
domain: "python"
file: "packaging"
section: "modern-packaging"
id: "pyproject-toml"
title: "pyproject.toml — Project Configuration Standard"
category: "Packaging"
subtitle: "[project], [build-system], [tool.pytest], [tool.ruff]"
signature_short: "[project] name, version, dependencies  |  [build-system] requires, build-backend"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pyproject.toml — Project Configuration Standard"
  - "pyproject-toml"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/modern-packaging"
  - "category/packaging"
  - "tier/tiered"
---

# pyproject.toml — Project Configuration Standard

> [project], [build-system], [tool.pytest], [tool.ruff]

## Overview

pyproject.toml is the PEP 621 standard project configuration file. Replaces setup.py, setup.cfg, requirements.txt, and tool-specific config files. Structure: [project] defines package metadata and dependencies, [build-system] specifies the build backend (hatchling, setuptools, flit, pdm), [tool.X] configures tools (pytest, ruff, mypy, black). A single source of truth for your project.

## Signature

```python
[project] name, version, dependencies  |  [build-system] requires, build-backend
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Three required tables: [build-system], [project], one [tool.<backend>].
# STRENGTHS - PEP 621 standard; pip / uv / hatch all read it; no setup.py needed.
# WEAKNESSES- Different backends accept different keys; copy-pasting between projects can drift.
# pyproject.toml ─────────────────────────────────────
[build-system]
requires      = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "0.1.0"
description = "What it does, in one line."
readme = "README.md"
requires-python = ">=3.11"
dependencies = ["httpx>=0.25"]

[tool.hatch.build.targets.wheel]
packages = ["src/my_package"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Add optional-dependencies, scripts, urls; configure pytest/ruff/mypy in [tool.*]; one source of truth.
# STRENGTHS - Replaces setup.py + setup.cfg + requirements.txt + .flake8 + mypy.ini + pytest.ini.
# WEAKNESSES- License field changed (PEP 639) -- new SPDX form vs old {text=...} dict; pinning matters.
# pyproject.toml ─────────────────────────────────────
[build-system]
requires      = ["hatchling"]
build-backend = "hatchling.build"

[project]
name            = "my-package"
version         = "1.0.0"
description     = "Tools for processing X"
readme          = "README.md"
license         = "MIT"                         # PEP 639 SPDX
requires-python = ">=3.11"
authors         = [{name = "Alice", email = "alice@example.com"}]
classifiers     = [
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Operating System :: OS Independent",
]
dependencies = ["httpx>=0.25", "pydantic>=2"]

[project.optional-dependencies]
dev  = ["pytest>=8", "ruff>=0.5", "mypy>=1.10", "coverage[toml]>=7"]
docs = ["mkdocs-material>=9"]

[project.urls]
Homepage = "https://github.com/me/my-package"
Issues   = "https://github.com/me/my-package/issues"

[project.scripts]
my-cli = "my_package.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["src/my_package"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts   = "-q --strict-markers --strict-config"

[tool.ruff]
line-length    = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "PT"]
ignore = ["E501"]                                # rely on formatter

[tool.mypy]
python_version = "3.12"
strict         = true

[tool.coverage.run]
branch = true
source = ["src/my_package"]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - dynamic version (hatch-vcs), dependency groups (PEP 735), uv index pinning, lock-aware CI.
# STRENGTHS - Reproducible builds with uv.lock, version derived from git tags, monorepo-friendly with workspaces.
# WEAKNESSES- PEP 735 dependency-groups are newer than optional-dependencies; tools are still catching up.
# pyproject.toml (production) ────────────────────────
[build-system]
requires      = ["hatchling", "hatch-vcs"]
build-backend = "hatchling.build"

[project]
name            = "my-package"
dynamic         = ["version"]                   # version comes from VCS
description     = "Production-grade widgetry"
readme          = "README.md"
license         = "Apache-2.0"
requires-python = ">=3.11"
dependencies    = ["httpx>=0.25,<1", "pydantic>=2,<3"]
classifiers     = ["Development Status :: 5 - Production/Stable"]

# PEP 735 dependency groups (uv, pip 24.1+, Hatch read these).
[dependency-groups]
test    = ["pytest>=8", "pytest-asyncio>=0.23", "coverage[toml]>=7"]
lint    = ["ruff>=0.5", "mypy>=1.10"]
release = ["build>=1", "twine>=5"]
dev     = [{include-group = "test"}, {include-group = "lint"}]

[tool.hatch.version]
source = "vcs"

[tool.hatch.build.targets.wheel]
packages = ["src/my_package"]

[tool.hatch.build.targets.sdist]
include = ["src", "README.md", "LICENSE"]

# uv: pin index, prefer wheels, optionally workspace.
[tool.uv]
resolution = "highest"
[[tool.uv.index]]
name    = "internal"
url     = "https://pypi.internal.example/simple"
default = false

# [tool.uv.workspace]
# members = ["packages/*"]

[tool.pytest.ini_options]
testpaths   = ["tests"]
addopts     = "-q --strict-markers --strict-config -ra"
markers     = ["slow: marks slow tests (deselect with -m 'not slow')"]
xfail_strict = true

[tool.coverage.run]
branch          = true
source          = ["src/my_package"]
parallel        = true
relative_files  = true

[tool.coverage.report]
fail_under      = 90
exclude_lines   = ["pragma: no cover", "raise NotImplementedError", "if TYPE_CHECKING:"]

# Decision rule:
#   greenfield project                          -> hatchling + uv + uv.lock + dependency-groups
#   need binary wheels (C/Rust/CFFI)            -> setuptools + cibuildwheel  OR  maturin (Rust)
#   pure-Python single-module                   -> flit_core (zero config)
#   plug-in registry                            -> setuptools entry_points (richer than hatch's)
#   monorepo                                    -> uv workspace OR hatch+nox+pdm-workspace
#   reproducible CI                             -> commit uv.lock; CI runs 'uv sync --frozen'
#   tightening dep ranges                       -> upper bounds only after a real break (~~> "<2")
#   gating on coverage                          -> [tool.coverage.report] fail_under = N
#
# Anti-pattern: leaving 'version = "0.0.0"' next to a CI step that bumps it via
# sed. The git history disagrees with PyPI. Use hatch-vcs / setuptools-scm so the
# version IS the tag -- one source of truth, no drift.
```

## Decision Rule

```text
greenfield project                          -> hatchling + uv + uv.lock + dependency-groups
need binary wheels (C/Rust/CFFI)            -> setuptools + cibuildwheel  OR  maturin (Rust)
pure-Python single-module                   -> flit_core (zero config)
plug-in registry                            -> setuptools entry_points (richer than hatch's)
monorepo                                    -> uv workspace OR hatch+nox+pdm-workspace
reproducible CI                             -> commit uv.lock; CI runs 'uv sync --frozen'
tightening dep ranges                       -> upper bounds only after a real break (~~> "<2")
gating on coverage                          -> [tool.coverage.report] fail_under = N
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving 'version = "0.0.0"' next to a CI step that bumps it via
> sed. The git history disagrees with PyPI. Use hatch-vcs / setuptools-scm so the
> version IS the tag -- one source of truth, no drift.

## Tips

- pyproject.toml is declarative — it describes what your project is, not scripts for building it.
- [tool.X] sections are tool-specific — each tool reads its config from here, no separate files needed.
- requires-python = ">=3.11" ensures pip won't install on older Python versions.
- [project.scripts] creates CLI entry points — installed automatically; users run "my-cli" not "python -m my_package.cli".
- Use PEP 735 [dependency-groups] (pip 24.1+, uv, hatch) to share dev/test/lint sets without abusing optional-dependencies; combine with `dynamic = ["version"]` + hatch-vcs so the git tag is the version.

## Common Mistake

> [!warning] Still maintaining setup.py + setup.cfg + requirements.txt + .flake8 + mypy.ini + pytest.ini separately — consolidate everything in pyproject.toml. One file, one format, one source of truth.

## Shorthand (Junior → Senior)

**Junior:**
```python
# setup.py
from setuptools import setup
setup(name="pkg", version="1.0", install_requires=["dep>=1"])

# setup.cfg
[metadata]
name = pkg
version = 1.0
```

**Senior:**
```python
[project]
name = "pkg"
version = "1.0"
dependencies = ["dep>=1"]
```

## See Also

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/_Index|Packaging, CLI & Tooling → Modern Packaging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

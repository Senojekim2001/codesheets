---
type: "entry"
domain: "python"
file: "packaging"
section: "distribution"
id: "setup-cfg"
title: "setup.cfg & setup.py — Legacy Packaging (For Maintenance)"
category: "Packaging"
subtitle: "setup.py, setup.cfg, setuptools, legacy format"
signature_short: "python setup.py install  |  [metadata] name, version in setup.cfg"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "setup.cfg & setup.py — Legacy Packaging (For Maintenance)"
  - "setup-cfg"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/distribution"
  - "category/packaging"
  - "tier/tiered"
---

# setup.cfg & setup.py — Legacy Packaging (For Maintenance)

> setup.py, setup.cfg, setuptools, legacy format

## Overview

setup.py and setup.cfg are the legacy Python packaging format (pre-PEP 517/621). Many existing projects still use them. setup.py is executable Python; setup.cfg is declarative INI. Both are being phased out in favor of pyproject.toml. Learn them for understanding existing projects, but use pyproject.toml for new ones.

## Signature

```python
python setup.py install  |  [metadata] name, version in setup.cfg
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Read setup.py to understand legacy projects; never write a new one.
# STRENGTHS - Familiar to old-Python codebases; many ML notebooks reference this style.
# WEAKNESSES- setup.py is executable Python -- a security risk and not declarative.
# Legacy setup.py (read, don't write):
from setuptools import setup, find_packages

setup(
    name="my-package",
    version="1.0.0",
    packages=find_packages(),
    install_requires=["httpx>=0.25"],
    python_requires=">=3.8",
)

# Equivalent modern pyproject.toml:
# [project]
# name = "my-package"
# version = "1.0.0"
# requires-python = ">=3.8"
# dependencies = ["httpx>=0.25"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - setup.cfg moved everything to declarative INI; setup.py shrunk to 'setup()'. Migrate via hatch new --import or hand.
# STRENGTHS - Known territory for legacy maintainers; many corp wheels still ship in this form.
# WEAKNESSES- Two files (setup.py + setup.cfg) instead of one; entry-point format differs from PEP 621.
# Legacy setup.cfg (declarative):
# [metadata]
# name = my-package
# version = 1.0.0
# author = Alice
# license = MIT
#
# [options]
# packages = find:
# package_dir =
#     = src
# install_requires =
#     httpx>=0.25
#     pydantic>=2.0
# python_requires = >=3.11
#
# [options.packages.find]
# where = src
#
# [options.extras_require]
# dev =
#     pytest>=8
#     ruff
#
# [options.entry_points]
# console_scripts =
#     my-cli = my_package.cli:main

# Minimal setup.py shim still required by older tooling:
from setuptools import setup
setup()

# Migration path:
#   1) Replace setup.cfg [metadata] -> pyproject.toml [project]
#   2) Replace [options] install_requires -> [project] dependencies
#   3) Replace [options.extras_require] -> [project.optional-dependencies]
#   4) Replace [options.entry_points] console_scripts -> [project.scripts]
#   5) Set [build-system] requires = ["setuptools"], build-backend = "setuptools.build_meta"
#   6) Delete setup.py + setup.cfg
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Keep setup.py only for build-time logic that can't be expressed declaratively (C extensions, runtime-detected configs); everything else goes in pyproject.toml.
# STRENGTHS - PEP 517 isolated builds work without setup.py; setuptools still reads pyproject metadata.
# WEAKNESSES- Some C-extension projects still hand-craft setup.py; modern alternatives (scikit-build-core, maturin) are better when feasible.
# 1) Pure-Python project: NO setup.py, NO setup.cfg.
# pyproject.toml:
#   [build-system]
#   requires      = ["setuptools>=68", "setuptools-scm>=8"]
#   build-backend = "setuptools.build_meta"
#
#   [project]
#   name            = "my-package"
#   dynamic         = ["version"]
#   requires-python = ">=3.11"
#   dependencies    = ["httpx>=0.25"]
#
#   [tool.setuptools.packages.find]
#   where = ["src"]
#
#   [tool.setuptools_scm]
#   write_to = "src/my_package/_version.py"

# 2) C extension where setup.py is unavoidable:
# setup.py (build-time logic only):
from setuptools import Extension, setup
import platform, sys

extra_args = ["-O3"]
if platform.system() == "Linux":
    extra_args.append("-flto")
if sys.version_info >= (3, 12):
    extra_args.append("-DPY_312=1")

setup(
    ext_modules=[
        Extension(
            "my_package._fastpath",
            sources=["src/my_package/_fastpath.c"],
            extra_compile_args=extra_args,
        ),
    ],
)
# All metadata stays in pyproject.toml; setup.py only carries the build logic.

# 3) Migration helpers:
#   - 'pyproject-fmt'  -> normalize pyproject.toml
#   - 'hatch new --init' -> scaffold from existing tree
#   - 'pip wheel . -w dist' -> sanity check that PEP 517 build works without setup.py

# Decision rule:
#   pure-Python project, any vintage         -> migrate to pyproject.toml; delete setup.py / setup.cfg
#   C extensions only                        -> minimal setup.py with Extension(), metadata in pyproject.toml
#   Cython / heavy native build              -> scikit-build-core (CMake) or meson-python
#   Rust extensions                          -> maturin (replaces setup.py entirely)
#   reading old codebase                     -> setup.cfg [metadata] = [project]; [options] = build-system + tool.setuptools
#   tool that hard-requires setup.py exists  -> 1-line shim: 'from setuptools import setup; setup()'
#
# Anti-pattern: encoding install logic in setup.py (e.g., calling pip from
# inside setup()). PEP 517 builds run setup.py in an isolated env without
# network or your dev tools. Move the logic to pyproject.toml or a postinstall
# script the user runs themselves.
```

## Decision Rule

```text
pure-Python project, any vintage         -> migrate to pyproject.toml; delete setup.py / setup.cfg
C extensions only                        -> minimal setup.py with Extension(), metadata in pyproject.toml
Cython / heavy native build              -> scikit-build-core (CMake) or meson-python
Rust extensions                          -> maturin (replaces setup.py entirely)
reading old codebase                     -> setup.cfg [metadata] = [project]; [options] = build-system + tool.setuptools
tool that hard-requires setup.py exists  -> 1-line shim: 'from setuptools import setup; setup()'
```

## Anti-Pattern

> [!warning] Anti-pattern
> encoding install logic in setup.py (e.g., calling pip from
> inside setup()). PEP 517 builds run setup.py in an isolated env without
> network or your dev tools. Move the logic to pyproject.toml or a postinstall
> script the user runs themselves.

## Tips

- setup.py/setup.cfg are legacy — for new projects, use pyproject.toml.
- find_packages() auto-discovers packages but can be slow — explicitly list them for large projects.
- Migrating: use hatch or poetry to convert setup.py → pyproject.toml.
- Read setup.py to understand old projects; write pyproject.toml for new ones.

## Common Mistake

> [!warning] Still writing new packages with setup.py — pyproject.toml is simpler, safer, and the industry standard.

## Shorthand (Junior → Senior)

**Junior:**
```python
from setuptools import setup
setup(
    name="pkg",
    version="1.0",
    install_requires=["dep>=1"],
)
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
- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/distribution/_Index|Packaging, CLI & Tooling → Distribution & Publishing]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

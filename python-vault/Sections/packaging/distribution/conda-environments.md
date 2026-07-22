---
type: "entry"
domain: "python"
file: "packaging"
section: "distribution"
id: "conda-environments"
title: "Conda & conda-environments — Mixing conda + pip"
category: "Environments"
subtitle: "conda create, environment.yml, conda-forge, conda vs pip"
signature_short: "conda create -n env python=3.11  |  conda env create -f environment.yml"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Conda & conda-environments — Mixing conda + pip"
  - "conda-environments"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/distribution"
  - "category/environments"
  - "tier/tiered"
---

# Conda & conda-environments — Mixing conda + pip

> conda create, environment.yml, conda-forge, conda vs pip

## Overview

Conda is a package manager for Python and other languages. Stronger than pip for scientific stacks (NumPy, SciPy, PyTorch) and C dependencies. Create environments with conda create, export to environment.yml, manage with conda. Conda can coexist with venv. For pure-Python packages, venv+pip is simpler; for scientific computing, conda saves hours installing C libraries.

## Signature

```python
conda create -n env python=3.11  |  conda env create -f environment.yml
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - conda create + activate + install; conda manages Python AND non-Python deps.
# STRENGTHS - One installer for NumPy/SciPy/PyTorch with their native libs (MKL, CUDA).
# WEAKNESSES- Slow solver; Anaconda's commercial license restrictions on the 'defaults' channel.
conda create -n myenv python=3.11 numpy pandas
conda activate myenv
conda install -c conda-forge scikit-learn        # conda-forge has fresher builds
conda deactivate
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - environment.yml as the source of truth; mamba/micromamba for speed; pip section for pure-Python deps.
# STRENGTHS - Reproducible scientific stacks across teams; mamba is 10x faster than classic conda.
# WEAKNESSES- 'conda env export' captures EVERY transitive package + build hash -- not portable across OS.
# environment.yml ─────────────────────────────────────
# name: my-project
# channels:
#   - conda-forge       # prefer conda-forge over defaults (license + freshness)
#   - nodefaults
# dependencies:
#   - python=3.11
#   - numpy>=1.26
#   - pandas>=2.0
#   - jupyterlab
#   - pip
#   - pip:                         # pure-Python deps via pip in same env
#       - httpx>=0.25
#       - pydantic>=2

# Daily workflow with mamba (drop-in faster solver):
mamba env create -f environment.yml          # build env
mamba env update -f environment.yml --prune  # apply changes; remove dropped deps
mamba activate my-project

# Portable export (drop build hashes, keep top-level pins only):
mamba env export --from-history > environment.yml

# Quick local clone for experiments:
mamba create --name exp --clone my-project
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - micromamba in CI/Docker, conda-forge only, lock files via 'conda-lock', uv inside the conda env for pip-side speed.
# STRENGTHS - Fast container builds, fully reproducible (lock per platform), scientific + Python tooling unified.
# WEAKNESSES- Two ecosystems to maintain (conda + pip); plan how 'pip install -e .' interacts with the conda Python.
# 1) micromamba: 5MB binary, no shell hooks, CI/Docker friendly.
# Dockerfile excerpt:
# FROM mambaorg/micromamba:1.5
# COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml /tmp/
# RUN micromamba install -y -n base -f /tmp/environment.yml && \
#     micromamba clean --all --yes
# ARG MAMBA_DOCKERFILE_ACTIVATE=1
# COPY src ./src
# CMD ["python", "-m", "my_app"]

# 2) conda-lock: generate per-platform lockfiles for true reproducibility.
# pip install conda-lock
# conda-lock --file environment.yml --platform linux-64 --platform osx-arm64
# conda-lock install --name my-project conda-lock.yml

# 3) Hybrid project layout: conda for science stack, uv for pure-Python deps.
# environment.yml:
# name: science
# channels: [conda-forge]
# dependencies:
#   - python=3.12
#   - numpy
#   - scipy
#   - pytorch::pytorch    # specific channel + package
#   - pip
#
# After conda env create, use uv inside the env:
mamba activate science
uv pip install -e ".[dev]"            # uv reads pyproject.toml; installs into the conda env

# 4) GPU / CUDA story:
#   conda's CUDA-aware builds (pytorch-cuda, cupy) handle NVCC + cudnn for you.
#   pip wheels for PyTorch require an explicit --index-url for the right CUDA build.
#   Standardize on one path per project; don't mix conda-forge pytorch with pip pytorch.

# Decision rule:
#   pure-Python project                        -> uv / pip; do NOT add conda
#   scientific stack with native libs          -> conda-forge (NumPy/SciPy/PyTorch/Cupy)
#   GPU-heavy ML                               -> conda for the CUDA stack OR pip with explicit CUDA wheels (pick one)
#   reproducible CI                            -> conda-lock per platform + micromamba install
#   Docker images                              -> micromamba (smaller, no shell hooks)
#   adding pure-Python deps inside a conda env -> use uv pip / pip in the activated env; NOT 'conda install' for them
#   Anaconda 'defaults' channel licensing      -> set 'channels: [conda-forge, nodefaults]' to avoid commercial restrictions
#
# Anti-pattern: 'conda install' followed by 'pip install' followed by another
# 'conda install'. Each conda call tries to "fix" what pip did and may
# downgrade pip-installed packages. Order matters: conda first for the science
# stack, THEN pip/uv for everything else, then never mix back.
```

## Decision Rule

```text
pure-Python project                        -> uv / pip; do NOT add conda
scientific stack with native libs          -> conda-forge (NumPy/SciPy/PyTorch/Cupy)
GPU-heavy ML                               -> conda for the CUDA stack OR pip with explicit CUDA wheels (pick one)
reproducible CI                            -> conda-lock per platform + micromamba install
Docker images                              -> micromamba (smaller, no shell hooks)
adding pure-Python deps inside a conda env -> use uv pip / pip in the activated env; NOT 'conda install' for them
Anaconda 'defaults' channel licensing      -> set 'channels: [conda-forge, nodefaults]' to avoid commercial restrictions
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'conda install' followed by 'pip install' followed by another
> 'conda install'. Each conda call tries to "fix" what pip did and may
> downgrade pip-installed packages. Order matters: conda first for the science
> stack, THEN pip/uv for everything else, then never mix back.

## Tips

- Conda is worth it for scientific computing — installing PyTorch/TensorFlow with conda is 100x easier than pip.
- For pure Python, venv+pip is simpler than conda.
- Commit environment.yml to git AND generate per-platform `conda-lock.yml` for true reproducibility — `conda env export` captures build hashes and is not portable across OS.
- Mamba/micromamba is a faster drop-in for conda — micromamba is a 5MB binary with no shell hooks, ideal for CI/Docker. Set channels to `[conda-forge, nodefaults]` to avoid Anaconda's commercial restrictions on `defaults`.

## Common Mistake

> [!warning] Alternating `conda install` → `pip install` → `conda install` — each conda call tries to "fix" what pip did and may downgrade pip-installed packages. Order matters: conda first for the science stack, THEN pip/uv for everything else, then never mix back.

## Shorthand (Junior → Senior)

**Junior:**
```python
conda create -n env python=3.11 numpy scipy
conda activate env
pip install httpx
```

**Senior:**
```python
conda env create -f environment.yml
conda activate myenv
```

## See Also

- [[Sections/packaging/modern-packaging/virtual-environments|Virtual Environments — Isolating Dependencies (Packaging, CLI & Tooling)]]
- [[Sections/packaging/distribution/_Index|Packaging, CLI & Tooling → Distribution & Publishing]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

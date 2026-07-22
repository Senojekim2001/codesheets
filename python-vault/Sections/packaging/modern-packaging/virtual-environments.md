---
type: "entry"
domain: "python"
file: "packaging"
section: "modern-packaging"
id: "virtual-environments"
title: "Virtual Environments — Isolating Dependencies"
category: "Environments"
subtitle: "venv, activation, pip freeze, requirements.txt, deactivate"
signature_short: "python -m venv .venv  |  source .venv/bin/activate  |  pip install -r requirements.txt"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Virtual Environments — Isolating Dependencies"
  - "virtual-environments"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/modern-packaging"
  - "category/environments"
  - "tier/tiered"
---

# Virtual Environments — Isolating Dependencies

> venv, activation, pip freeze, requirements.txt, deactivate

## Overview

Virtual environments isolate project dependencies from system Python. venv is the stdlib tool (Python 3.3+). Create once per project, activate before developing, and install dependencies in it. pip freeze saves dependencies to requirements.txt for reproducibility. Deactivate to return to system Python. Always use venvs — never pollute system Python.

## Signature

```python
python -m venv .venv  |  source .venv/bin/activate  |  pip install -r requirements.txt
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Create .venv, activate, install deps, deactivate when done.
# STRENGTHS - Stdlib (python -m venv); no extra tools required; isolates per-project deps.
# WEAKNESSES- Manual activate/deactivate; no lockfile; pip install order matters.
# Create + activate (macOS/Linux):
python -m venv .venv
source .venv/bin/activate              # PowerShell: .venv/Scripts/Activate.ps1

which python                            # /path/to/project/.venv/bin/python
pip install -e .                        # install your package, editable
pip install httpx pydantic
deactivate                              # restore system Python
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pin Python via system manager, separate dev extras, freeze for snapshot, gitignore .venv.
# STRENGTHS - Predictable installs across dev machines; one-liner CI bootstrap.
# WEAKNESSES- pip freeze pins INSTALLED versions including Python-version-specific wheels; not ideal cross-platform.
# Choose Python (mise / pyenv / uv python install / brew install python@3.12)
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip wheel       # always upgrade pip first

pip install -e ".[dev]"               # editable + dev extras from pyproject.toml
pip install -r requirements-dev.txt   # pinned set, if you have one

# Reproducible env in CI:
python -m venv .venv && source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[dev]"
pytest -q

# Snapshots (consider lockfiles instead):
pip freeze > requirements.txt          # exact current versions, lossy for cross-OS

# .gitignore essentials:
#   .venv/
#   __pycache__/
#   *.egg-info/
#   build/
#   dist/
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - venv only as a low-level primitive; reach for uv / poetry for daily work; venv-create activation hooks for shells.
# STRENGTHS - Understanding the primitive matters when CI/Docker/build tools sidestep helpers.
# WEAKNESSES- Activation is a per-shell-state hack; long-running daemons that exec subprocesses can lose the env. Prefer running interpreters by absolute path.
# 1) Run python from .venv WITHOUT activating -- safest for scripts/cron/Docker.
.venv/bin/python -m my_app
.venv/bin/pip install --no-deps -e .

# 2) Multiple Pythons side by side without an extra tool:
python3.11 -m venv .venv311
python3.12 -m venv .venv312
.venv312/bin/pytest tests/

# 3) Inheriting system site-packages (rare, but useful when CUDA/Tk/system libs ship via APT/Brew):
python -m venv --system-site-packages .venv
# Caveat: makes builds non-hermetic; use sparingly and document why.

# 4) Hermetic Docker stage:
# FROM python:3.12-slim AS build
# WORKDIR /app
# RUN python -m venv /opt/venv && /opt/venv/bin/pip install --upgrade pip wheel
# COPY pyproject.toml ./
# RUN /opt/venv/bin/pip install -e ".[dev]"
# COPY src ./src
# RUN /opt/venv/bin/pytest -q
#
# FROM python:3.12-slim
# COPY --from=build /opt/venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"          # PATH-based "activation"
# CMD ["python", "-m", "my_app"]

# 5) Direnv pattern (.envrc) -- auto-activates per-directory:
# layout python python3.12

# Decision rule:
#   day-to-day project work               -> uv / poetry / pdm; let them manage the venv
#   one-shot script with stdlib-only deps -> just run system python; no venv
#   CI image                              -> create venv at /opt/venv, prepend to PATH (no 'activate')
#   need binary CUDA/Tk integration       -> --system-site-packages + pinned base image
#   must support Windows + POSIX shells   -> drive everything via 'python -m', never 'activate'
#   long-running daemon spawning workers  -> set VIRTUAL_ENV + PATH explicitly; don't rely on bash activate
#
# Anti-pattern: 'sudo pip install ...' on the system Python. It wedges OS tools
# (apt, dnf, macOS Python links) and breaks the next OS upgrade. Every project
# gets its own .venv, period.
```

## Decision Rule

```text
day-to-day project work               -> uv / poetry / pdm; let them manage the venv
one-shot script with stdlib-only deps -> just run system python; no venv
CI image                              -> create venv at /opt/venv, prepend to PATH (no 'activate')
need binary CUDA/Tk integration       -> --system-site-packages + pinned base image
must support Windows + POSIX shells   -> drive everything via 'python -m', never 'activate'
long-running daemon spawning workers  -> set VIRTUAL_ENV + PATH explicitly; don't rely on bash activate
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'sudo pip install ...' on the system Python. It wedges OS tools
> (apt, dnf, macOS Python links) and breaks the next OS upgrade. Every project
> gets its own .venv, period.

## Tips

- Always create .venv at project root — gitignore it (it's huge and contains system-specific binaries).
- Commit requirements.txt (or better: uv.lock) to git for reproducible builds.
- pip freeze captures exact versions: "pip freeze > requirements.txt" lets others install identical versions.
- Skip "activate" in Docker/cron/long-running daemons — invoke `.venv/bin/python` (or prepend `/opt/venv/bin` to PATH) directly. Activation is a per-shell-state hack that subprocesses can lose.

## Common Mistake

> [!warning] `sudo pip install ...` on the system Python — wedges OS tools (apt, dnf, macOS Python links) and breaks the next OS upgrade. Every project gets its own .venv, and in CI/Docker prefer running .venv/bin/python by absolute path over relying on `source activate`.

## Shorthand (Junior → Senior)

**Junior:**
```python
cd my-project
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
deactivate
```

**Senior:**
```python
uv venv
uv sync
uv run python main.py
```

## See Also

- [[Sections/packaging/distribution/conda-environments|Conda & conda-environments — Mixing conda + pip (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/_Index|Packaging, CLI & Tooling → Modern Packaging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

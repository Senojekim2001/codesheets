---
type: "entry"
domain: "python"
file: "containerization"
section: "dockerfile"
id: "python-deps-cached"
title: "Cached pip / uv installs — fast iterative builds"
category: "Dockerfile"
subtitle: "BuildKit --mount=type=cache, uv (10-100x faster than pip), uv sync --frozen, pyproject.toml + uv.lock, wheel cache across CI runs"
signature_short: "RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt   # OR: uv sync --frozen"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cached pip / uv installs — fast iterative builds"
  - "python-deps-cached"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/dockerfile"
  - "category/dockerfile"
  - "tier/tiered"
---

# Cached pip / uv installs — fast iterative builds

> BuildKit --mount=type=cache, uv (10-100x faster than pip), uv sync --frozen, pyproject.toml + uv.lock, wheel cache across CI runs

## Overview

Iterative Docker builds spend most of their wall-clock on `pip install`. Two orthogonal speedups: (1) BuildKit's cache mounts let pip's wheel cache survive across builds without entering the image; (2) `uv` (Astral, 2024) is a Rust-based package manager that's 10-100× faster than pip and can replace it as the install tool. Pair with a lockfile (`uv.lock` or `requirements.txt` from `pip-compile`) for deterministic builds. The three examples solve the SAME concrete task — make `docker build` redo only what changed; a code-only edit should reuse all dep layers — at three depths: `COPY requirements.txt` before code → BuildKit cache mount → `uv sync --frozen` from `pyproject.toml` + lockfile + private package index via BuildKit secrets.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Make 'docker build' redo only what changed; code edits should not redownload deps.
- **Junior** — SAME — but the pip wheel cache survives across builds so unchanged deps don't re-download.
- **Senior** — SAME — production: uv sync from pyproject.toml + uv.lock for deterministic installs; private wheel index via BuildKit secrets; per-environment dependency groups.

## Signature

```python
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt   # OR: uv sync --frozen
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Make 'docker build' redo only what changed; code edits
#             should not redownload deps.
# APPROACH  - Copy requirements.txt FIRST; pip install; then COPY .
#             Docker caches the pip layer when requirements.txt is
#             byte-identical.
# STRENGTHS - Stdlib of caching; no extra tools.
# WEAKNESSES- pip cache lives inside the image (or is disabled by
#             --no-cache-dir); junior tier uses BuildKit cache mounts.

# Dockerfile
FROM python:3.12-slim
WORKDIR /app

# Step 1: deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 2: code
COPY . .

CMD ["uvicorn", "myapp:app"]

# Layer cache demonstration:
#   First build:    deps installed (~30s) + code copied
#   Edit a .py file: deps layer reused (cache hit) + code copied (~1s)
#   Edit requirements.txt: BOTH layers rebuild
#
# Why --no-cache-dir on pip:
#   pip caches downloaded wheels in /root/.cache/pip by default. That
#   ~50-200MB ends up in the image layer. --no-cache-dir disables it.
#   But: it ALSO disables wheel cache, so the next build re-downloads.
#   Junior tier shows the right fix (BuildKit cache mount).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but the pip wheel cache survives across builds
#             so unchanged deps don't re-download.
# APPROACH  - BuildKit's --mount=type=cache,target=/root/.cache/pip
#             mounts a host-side cache for pip; deps are downloaded
#             once and reused across builds; the cache is NOT baked
#             into the image.
# STRENGTHS- 10-50× faster repeat installs; image stays small;
#             cache survives across image versions / branches.
# WEAKNESSES- Requires BuildKit (default in modern Docker); CI runners
#             need to persist /root/.cache/pip across runs.

# syntax=docker/dockerfile:1.7
# Dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .

# BuildKit cache mount: /root/.cache/pip is persistent across builds,
# never written into a layer.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build with BuildKit (default in Docker Desktop, opt-in elsewhere):
#   $ DOCKER_BUILDKIT=1 docker build -t myapp:1.4.2 .

# Switching from pip to uv — 10-100× faster on repeat installs.
# uv is a drop-in alternative; same requirements.txt format works.
#
# Dockerfile (uv variant):
# FROM python:3.12-slim
# ENV UV_LINK_MODE=copy                     # avoid hardlink warnings in Docker
# ENV UV_COMPILE_BYTECODE=1                 # compile *.pyc at install time (warm)
#
# # uv is a single static binary; copy it from the official image.
# COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /usr/local/bin/uv
#
# WORKDIR /app
# COPY requirements.txt .
# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv pip install --system -r requirements.txt
#
# COPY . .
# CMD ["uvicorn", "myapp:app"]
#
# uv vs pip:
#   pip install -r requirements.txt:        ~30s (cold)  / ~5s (cached)
#   uv pip install -r requirements.txt:     ~2s  (cold)  / ~0.5s (cached)
#
# uv supports drop-in pip replacement (uv pip install) AND its own
# project model (uv sync from pyproject.toml + uv.lock). Senior tier.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: uv sync from pyproject.toml + uv.lock
#             for deterministic installs; private wheel index via
#             BuildKit secrets; per-environment dependency groups.
# APPROACH  - uv.lock pins every transitive dep with hashes; uv sync
#             --frozen installs exactly the lockfile; BuildKit secrets
#             pass private-index credentials without baking them in.
# STRENGTHS - Reproducible builds; lock-driven (no surprise dep upgrades);
#             credentials never enter image layers.
# WEAKNESSES- Lockfile maintenance: 'uv lock' must be re-run on dep
#             changes; CI should fail if the lockfile is stale.

# syntax=docker/dockerfile:1.7
# Dockerfile
ARG PYTHON_VERSION=3.12
ARG UV_VERSION=0.5

# === Build stage ===
FROM python:${PYTHON_VERSION}-slim AS build

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv

# uv binary — single static file from official image.
COPY --from=ghcr.io/astral-sh/uv:${UV_VERSION} /uv /usr/local/bin/uv

WORKDIR /app

# Copy ONLY the dependency manifests first — caches when only code changes.
COPY pyproject.toml uv.lock ./

# Install deps (production only, no dev tools).
# --frozen: fail if uv.lock is out of date relative to pyproject.toml.
# --no-dev: skip [dependency-groups.dev]
# --no-install-project: install dependencies but not the project itself.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=secret,id=pip_index_url,env=UV_INDEX_URL \
    uv sync --frozen --no-dev --no-install-project

# Now copy the project source and install it.
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# === Runtime stage ===
FROM python:${PYTHON_VERSION}-slim AS runtime

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Bring the venv from build.
COPY --from=build /opt/venv /opt/venv

RUN groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --no-create-home app
USER app
WORKDIR /app
COPY --chown=app:app ./myapp ./myapp

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build with private index credentials passed as a BuildKit secret:
#   $ echo "https://user:pass@private-pypi.example.com/simple" > /tmp/index_url
#   $ DOCKER_BUILDKIT=1 docker build \
#       --secret id=pip_index_url,src=/tmp/index_url \
#       -t myapp:1.4.2 .
#
# Or in CI, set the secret from a file:
#   docker buildx build --secret id=pip_index_url,src=$INDEX_FILE ...
#
# The secret is mounted in /run/secrets/pip_index_url at build time but
# NEVER appears in any layer.

# pyproject.toml (snippet showing dep groups for dev/prod split):
# [project]
# dependencies = [
#   "fastapi>=0.115",
#   "uvicorn>=0.32",
#   "sqlalchemy>=2.0",
#   "psycopg[binary]>=3.2",
# ]
#
# [dependency-groups]
# dev = [
#   "pytest>=8",
#   "ruff>=0.7",
#   "mypy>=1.13",
# ]
#
# Generate the lockfile (commit to git):
#   $ uv lock                                   # creates uv.lock
#   $ uv sync                                    # installs into .venv
#
# Update a single dep:
#   $ uv lock --upgrade-package httpx
#
# Audit:
#   $ uv lock --check       # fails if lockfile is stale
#   $ uv pip list --outdated

# CI integration — fail on stale lockfile:
# - name: Verify lockfile
#   run: uv lock --check                         # fail if uv.lock != pyproject.toml derivation

# Decision rule:
#   simple project, requirements.txt        -> COPY requirements.txt + pip install (intro tier)
#   want fast repeat builds                  -> BuildKit cache mount on /root/.cache/pip
#   want fast cold builds                    -> uv (10-100× pip)
#   need deterministic / reproducible        -> uv.lock + uv sync --frozen
#   monorepo with workspace deps             -> uv workspace mode in pyproject.toml
#   private wheel index                      -> BuildKit --mount=type=secret for credentials
#   prod vs dev deps                         -> dependency-groups.dev + uv sync --no-dev
#   need lockfile in CI                      -> uv lock --check; fail PR if stale
#   pip-tools workflow                       -> pip-compile -> requirements.txt; same caching pattern
#   poetry / hatch / pdm                     -> all support BuildKit cache; check their docker docs
#   "should I use uv?"                       -> for new projects, yes; for stable ones, BuildKit cache + pip is fine
#
# Anti-pattern: 'pip install -r requirements.txt && pip install -e .'
# without copying the project source first. The first command needs
# requirements.txt; the second needs the whole project. Common bug:
# COPY . . happens BEFORE the install commands, defeating the layer
# cache. Fix: COPY requirements.txt + install + COPY . . + install
# project. Or use uv sync --frozen --no-install-project then COPY +
# uv sync (split as two layers).
```

## Decision Rule

```text
simple project, requirements.txt        -> COPY requirements.txt + pip install (intro tier)
want fast repeat builds                  -> BuildKit cache mount on /root/.cache/pip
want fast cold builds                    -> uv (10-100× pip)
need deterministic / reproducible        -> uv.lock + uv sync --frozen
monorepo with workspace deps             -> uv workspace mode in pyproject.toml
private wheel index                      -> BuildKit --mount=type=secret for credentials
prod vs dev deps                         -> dependency-groups.dev + uv sync --no-dev
need lockfile in CI                      -> uv lock --check; fail PR if stale
pip-tools workflow                       -> pip-compile -> requirements.txt; same caching pattern
poetry / hatch / pdm                     -> all support BuildKit cache; check their docker docs
"should I use uv?"                       -> for new projects, yes; for stable ones, BuildKit cache + pip is fine
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'pip install -r requirements.txt && pip install -e .'
> without copying the project source first. The first command needs
> requirements.txt; the second needs the whole project. Common bug:
> COPY . . happens BEFORE the install commands, defeating the layer
> cache. Fix: COPY requirements.txt + install + COPY . . + install
> project. Or use uv sync --frozen --no-install-project then COPY +
> uv sync (split as two layers).

## Tips

- BuildKit cache mounts (`--mount=type=cache,target=/root/.cache/pip`) are the single biggest win for iterative Dockerfile builds. The cache survives across builds; nothing gets baked into the image.
- `uv` is 10-100× faster than `pip` on cold and cached installs alike. It's a drop-in replacement (`uv pip install`) AND has its own project model (`uv sync` from `pyproject.toml` + `uv.lock`).
- Use `uv sync --frozen` (or `pip-tools` + `requirements.txt`) for deterministic installs. The lockfile pins every transitive dep + hash; CI should fail if the lockfile is stale.
- Pass private-index credentials via BuildKit secrets: `--mount=type=secret,id=pip_index_url`. Credentials are mounted at build time but NEVER appear in any layer — even in the build cache.
- Order matters: `COPY pyproject.toml uv.lock` (or `requirements.txt`) BEFORE the rest of the source. The dep layer reuses cache when only code changes.
- For private wheels in CI, the secret-mount approach beats env vars (which leak in `docker history`) and beats `--build-arg` (also visible in `docker history`).

## Common Mistake

> [!warning] `COPY . .` BEFORE the dependency-install RUN. Even with the perfect cache-mount setup, every code change invalidates the dep layer because `requirements.txt`/`pyproject.toml` is now in a layer that's newer than its install step. Order is: `COPY requirements.txt` → install → `COPY . .` → optionally install the project itself.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Code copied first — every code change invalidates the dep layer
COPY . .
RUN pip install -r requirements.txt
```

**Senior:**
```python
# Deps first; code last — dep layer reused on code-only changes
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
COPY . .
```

## See Also

- [[Sections/containerization/dockerfile/dockerfile-python-base|Dockerfile — choose the right Python base image (Containerization)]]
- [[Sections/containerization/dockerfile/multi-stage-builds|Multi-stage builds — separate build from runtime (Containerization)]]
- [[Sections/containerization/dockerfile/_Index|Containerization → Dockerfile Basics — base images, multi-stage, dep caching]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

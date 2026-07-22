---
type: "entry"
domain: "python"
file: "containerization"
section: "dockerfile"
id: "dockerfile-python-base"
title: "Dockerfile — choose the right Python base image"
category: "Dockerfile"
subtitle: "FROM python:3.12-slim, WORKDIR, COPY, RUN apt cleanup, PYTHONUNBUFFERED, PYTHONDONTWRITEBYTECODE, choosing slim vs alpine vs distroless"
signature_short: "FROM python:3.12-slim   # workhorse default for Python services"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dockerfile — choose the right Python base image"
  - "dockerfile-python-base"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/dockerfile"
  - "category/dockerfile"
  - "tier/tiered"
---

# Dockerfile — choose the right Python base image

> FROM python:3.12-slim, WORKDIR, COPY, RUN apt cleanup, PYTHONUNBUFFERED, PYTHONDONTWRITEBYTECODE, choosing slim vs alpine vs distroless

## Overview

The base-image choice is the most consequential Dockerfile decision. `python:3.12` (full Debian) is fat (~1GB); `python:3.12-slim` is the right default for ~95% of Python services (Debian-based, glibc, ~150MB); `python:3.12-alpine` has musl-libc which breaks many wheels (numpy, pandas, cryptography rebuilds from source — 10× build time + larger final image, paradoxically); `gcr.io/distroless/python3` has no shell so debugging is painful but it's the security darling. The three examples solve the SAME concrete task — build a working container image for a FastAPI service running on uvicorn — at three depths: minimal Dockerfile → cache-friendly layer ordering + apt cleanup + PYTHON env vars → production with pinned base image SHA, BuildKit syntax, security scanning hooks, distroless runtime.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Build a working container image for a FastAPI service.
- **Junior** — SAME — but with proper layer caching, apt cleanup, and Python env vars that prevent buffering and __pycache__ pollution.
- **Senior** — SAME — production: pinned base image by SHA, BuildKit syntax for cache mounts and secrets, distroless runtime, security scanning hook in CI.

## Signature

```python
FROM python:3.12-slim   # workhorse default for Python services
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Build a working container image for a FastAPI service.
# APPROACH  - python:3.12-slim base + uvicorn entrypoint.
# STRENGTHS - Smallest correct Dockerfile; runs anywhere Docker runs.
# WEAKNESSES- Layer order isn't cache-friendly; junior tier fixes it.

# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build + run:
#   $ docker build -t myapp:dev .
#   $ docker run -p 8000:8000 myapp:dev

# Why python:3.12-slim and not these alternatives:
#   python:3.12          ~1GB; full Debian; useful only for "I need
#                        every system tool while debugging"
#   python:3.12-slim     ~150MB; Debian; glibc compat with all wheels
#                        (numpy, pandas, cryptography, lxml, asyncpg)
#                        ← THE DEFAULT
#   python:3.12-alpine   ~50MB; musl-libc; many wheels rebuild from
#                        source, dramatically slowing builds AND often
#                        producing LARGER final images. AVOID for
#                        Python unless you're sure your deps work.
#   gcr.io/distroless/python3-debian12 ~50MB; no shell, no apt;
#                        smallest secure runtime; debugging needs
#                        kubectl debug or similar. Use for prod
#                        runtime stage in multi-stage builds.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with proper layer caching, apt cleanup, and
#             Python env vars that prevent buffering and __pycache__
#             pollution.
# APPROACH  - Copy requirements.txt FIRST so pip install is cached
#             when only code changes. apt-get + cleanup in ONE RUN
#             so the cache layer doesn't carry the apt index. Set
#             PYTHONUNBUFFERED so logs flush immediately.
# STRENGTHS- Single-line code change rebuilds in ~1s instead of
#             redownloading every dep; final image is smaller because
#             apt cleanup happens in the same layer.
# WEAKNESSES- Still builds and runs in the same image — junior bridges
#             to multi-stage (next entry).

# Dockerfile
FROM python:3.12-slim

# Python settings — set before anything else.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System packages — install + clean up in ONE RUN so the apt index
# isn't baked into the layer.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependencies first — cached when only code changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

# Code last — rebuild when this changes is fast.
COPY . .

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# .dockerignore — keep build context small.
# .git
# .venv
# __pycache__/
# *.pyc
# .env*
# tests/
# docs/
# .pytest_cache/
# .mypy_cache/
# *.md

# Why each ENV var matters:
#   PYTHONUNBUFFERED=1         - stdout/stderr flush immediately;
#                                  without it, logs are bufferred and
#                                  may be lost on crash.
#   PYTHONDONTWRITEBYTECODE=1  - don't write *.pyc files; saves a few
#                                  MB and removes a runtime-write step.
#   PIP_NO_CACHE_DIR=1         - pip doesn't cache wheels in /root/.cache/pip;
#                                  saves ~50-200MB on the image.
#   PIP_DISABLE_PIP_VERSION_CHECK=1 - skip pip's "you should upgrade"
#                                  network call at every install.

# Common gotchas this Dockerfile fixes:
#  - 'apt-get install ... && apt-get clean' on SEPARATE RUN lines
#    bakes the apt cache into a layer, then "deletes" it (the
#    deleted bytes still live in the previous layer).
#  - 'COPY . .' before 'pip install' invalidates the pip cache
#    every time you change a single line of code.
#  - Default Python output buffering hides crash logs in containers.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: pinned base image by SHA, BuildKit
#             syntax for cache mounts and secrets, distroless runtime,
#             security scanning hook in CI.
# APPROACH  - "FROM python:3.12-slim@sha256:..." prevents tag drift
#             (a "python:3.12-slim" pulled today and rebuilt next
#             month may differ); BuildKit's cache mount keeps pip
#             cache without bloating the image; trivy / grype run
#             post-build to flag CVEs.
# STRENGTHS - Reproducible builds (same SHA = byte-identical layers);
#             tiny pip-install layers; supply-chain audit trail.
# WEAKNESSES- Pinning base SHA means you must update the SHA on a
#             schedule — you've taken the security update responsibility.

# syntax=docker/dockerfile:1.7              # enables BuildKit features
# Dockerfile

ARG PYTHON_BASE=python:3.12-slim@sha256:9c1d9ed7593f2552a4ea47362ec0d2ddf5923458a53d0c8e30edf8b398c94a31

# ===== build stage — for compilation, never reaches the final image =====
FROM ${PYTHON_BASE} AS build

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore

WORKDIR /app

# Build deps — only present in the build stage.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# BuildKit cache mount: pip cache survives across builds; never written
# into a final layer. Dramatically faster rebuilds.
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

COPY . /src
RUN pip install --prefix=/install --no-deps /src

# ===== runtime stage — what actually ships =====
FROM ${PYTHON_BASE} AS runtime

# Same env vars in the runtime layer.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Runtime libraries (NO build-essential).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Pull in the install tree from the build stage.
COPY --from=build /install /usr/local

# Non-root user (see non-root-user entry for the security details).
RUN groupadd --system --gid 1001 app \
    && useradd  --system --uid 1001 --gid app --no-create-home app
USER app

WORKDIR /app

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build with BuildKit (default in Docker Desktop, opt-in elsewhere):
#   $ DOCKER_BUILDKIT=1 docker build -t myapp:1.4.2 .

# Build args you may want:
#   --build-arg PYTHON_BASE=python:3.12-slim@sha256:NEWHASH
#   --build-arg ENV=prod                   (toggles dev vs prod features)

# CI integration (GitHub Actions):
# - name: Build image
#   uses: docker/build-push-action@v5
#   with:
#     context: .
#     cache-from: type=gha
#     cache-to:   type=gha,mode=max
#     tags:       myapp:${{ github.sha }}
# - name: Scan image for CVEs
#   uses: aquasecurity/trivy-action@master
#   with:
#     image-ref: myapp:${{ github.sha }}
#     severity:  CRITICAL,HIGH
#     exit-code: 1                          # fail build on CRITICAL/HIGH

# Decision rule:
#   default for Python service                -> python:3.12-slim
#   tiny image needed                          -> distroless runtime in multi-stage
#   wheel-heavy deps (numpy, torch, lxml)      -> NEVER alpine; slim is right
#   pure-Python service, must be small        -> alpine OK if you've verified all wheels work
#   reproducible builds                        -> pin base by @sha256:HASH (not just tag)
#   supply-chain scanning                       -> trivy / grype / docker scout in CI
#   pip install caches across builds           -> BuildKit --mount=type=cache,target=/root/.cache/pip
#   secrets at build time (private wheels)     -> --mount=type=secret (NEVER COPY a credential)
#   build deps stay out of runtime             -> multi-stage (next entry)
#   ARM64 + AMD64 deploys                      -> docker buildx build --platform linux/amd64,linux/arm64
#   layer count optimization                    -> combine RUN commands; fewer layers, faster pull
#   debug a stuck container                     -> kubectl debug ... --image=python:3.12 --share-processes
#
# Anti-pattern: python:3.12-alpine for any service with C-extension
# wheels. Alpine uses musl-libc; PyPI wheels target glibc; pip falls
# back to building from source. numpy build = 5+ minutes of CPU; you
# need build-essential which alpine doesn't ship by default. The
# resulting image is OFTEN LARGER than the slim equivalent because of
# the build chain you had to install. Use slim. The 100MB you "save"
# costs 30 minutes of CI time and produces a buggier image.
```

## Decision Rule

```text
default for Python service                -> python:3.12-slim
tiny image needed                          -> distroless runtime in multi-stage
wheel-heavy deps (numpy, torch, lxml)      -> NEVER alpine; slim is right
pure-Python service, must be small        -> alpine OK if you've verified all wheels work
reproducible builds                        -> pin base by @sha256:HASH (not just tag)
supply-chain scanning                       -> trivy / grype / docker scout in CI
pip install caches across builds           -> BuildKit --mount=type=cache,target=/root/.cache/pip
secrets at build time (private wheels)     -> --mount=type=secret (NEVER COPY a credential)
build deps stay out of runtime             -> multi-stage (next entry)
ARM64 + AMD64 deploys                      -> docker buildx build --platform linux/amd64,linux/arm64
layer count optimization                    -> combine RUN commands; fewer layers, faster pull
debug a stuck container                     -> kubectl debug ... --image=python:3.12 --share-processes
```

## Anti-Pattern

> [!warning] Anti-pattern
> python:3.12-alpine for any service with C-extension
> wheels. Alpine uses musl-libc; PyPI wheels target glibc; pip falls
> back to building from source. numpy build = 5+ minutes of CPU; you
> need build-essential which alpine doesn't ship by default. The
> resulting image is OFTEN LARGER than the slim equivalent because of
> the build chain you had to install. Use slim. The 100MB you "save"
> costs 30 minutes of CI time and produces a buggier image.

## Tips

- `python:3.12-slim` is the right default for ~95% of Python services. Full Debian (~1GB) and Alpine (musl-libc compat issues) are rarely worth it. Distroless is the right RUNTIME for multi-stage builds.
- Set `PYTHONUNBUFFERED=1` and `PYTHONDONTWRITEBYTECODE=1` early in the Dockerfile. The first prevents log loss on crash; the second saves a few MB and a runtime write.
- Order layers so the cheapest-to-rebuild change is LAST: `COPY requirements.txt && pip install` BEFORE `COPY . .`. A code-only change reuses the dep layer.
- Combine `apt-get install` + `apt-get clean` + `rm -rf /var/lib/apt/lists/*` in a single RUN. Separate layers leave the apt index baked in even after "deletion".
- Pin base images by SHA (`python:3.12-slim@sha256:...`) for reproducibility. Tags drift; SHAs don't. Pair with a scheduled job that updates the SHA + reruns CVE scans.
- Use `.dockerignore` to keep the build context small. Without it, your local `.venv` and `.git` get sent to the Docker daemon on every build.

## Common Mistake

> [!warning] `python:3.12-alpine` for any service with C-extension wheels (numpy, pandas, cryptography, lxml, asyncpg). Alpine uses musl-libc; PyPI wheels target glibc; pip falls back to building from source which is 5+ minutes of CPU and needs build-essential. The "smaller" alpine image often ends up LARGER than slim once you add the build chain.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Alpine for a numpy-using service — 5+ minutes building from source
FROM python:3.12-alpine
RUN apk add gcc musl-dev linux-headers
RUN pip install numpy pandas
```

**Senior:**
```python
# Slim — wheels install in seconds; smaller in practice
FROM python:3.12-slim
RUN pip install --no-cache-dir numpy pandas
```

## See Also

- [[Sections/containerization/dockerfile/multi-stage-builds|Multi-stage builds — separate build from runtime (Containerization)]]
- [[Sections/containerization/dockerfile/python-deps-cached|Cached pip / uv installs — fast iterative builds (Containerization)]]
- [[Sections/containerization/dockerfile/_Index|Containerization → Dockerfile Basics — base images, multi-stage, dep caching]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

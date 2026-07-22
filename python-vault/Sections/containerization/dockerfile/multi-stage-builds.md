---
type: "entry"
domain: "python"
file: "containerization"
section: "dockerfile"
id: "multi-stage-builds"
title: "Multi-stage builds — separate build from runtime"
category: "Dockerfile"
subtitle: "FROM ... AS builder, COPY --from=builder, virtualenv-in-builder, distroless runtime, BuildKit cache mounts, build args"
signature_short: "FROM python:3.12-slim AS build  ...  FROM python:3.12-slim AS runtime  COPY --from=build /install /usr/local"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Multi-stage builds — separate build from runtime"
  - "multi-stage-builds"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/dockerfile"
  - "category/dockerfile"
  - "tier/tiered"
---

# Multi-stage builds — separate build from runtime

> FROM ... AS builder, COPY --from=builder, virtualenv-in-builder, distroless runtime, BuildKit cache mounts, build args

## Overview

A single-stage Dockerfile bakes the build toolchain (gcc, dev headers, build tools) into the runtime image. Multi-stage splits this: the BUILD stage compiles wheels, generates assets, runs anything that needs the toolchain; the RUNTIME stage starts fresh and copies only the artifacts it needs. Result: smaller image (no compilers), fewer CVEs (apt-listbugs scans show less), faster CDN pulls. Distroless runtime takes this further — no shell, no apt, no debugger; just Python + your code. The three examples solve the SAME concrete task — ship a runtime image that contains the FastAPI service but NONE of the build toolchain — at three depths: two stages with manual COPY → virtualenv-in-builder pattern + BuildKit cache → distroless runtime + ARG-driven dev/prod variants + supply-chain hooks.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Ship a runtime image without build-essential / libpq-dev.
- **Junior** — SAME — but use a virtualenv in the builder so the runtime stage gets a self-contained Python install tree; cache pip downloads via BuildKit so iteration is fast.
- **Senior** — SAME — production: distroless runtime stage (no shell, no package manager, no debugger), build args for dev/prod variants, hooks for SBOM generation.

## Signature

```python
FROM python:3.12-slim AS build  ...  FROM python:3.12-slim AS runtime  COPY --from=build /install /usr/local
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Ship a runtime image without build-essential / libpq-dev.
# APPROACH  - Two FROM stages; copy the installed packages from
#             builder to runtime.
# STRENGTHS - ~100MB smaller than single-stage; no gcc in runtime.
# WEAKNESSES- Manual --prefix=/install + COPY pattern is awkward;
#             venv pattern (junior tier) is cleaner.

# Dockerfile
FROM python:3.12-slim AS build

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

# Build deps — never reach runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install --prefix=/install --no-cache-dir --no-deps .


# === Runtime stage — minimal ===
FROM python:3.12-slim AS runtime

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

# Runtime libs (libpq5 is the runtime; libpq-dev was the build-time package).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Pull in the installed Python packages from builder.
COPY --from=build /install /usr/local

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build:
#   $ docker build -t myapp:1.4.2 .
# Compare image size:
#   $ docker images myapp
# Single-stage typically: ~400MB.   Multi-stage: ~200MB.
# More importantly: no compilers, no -dev packages, no CVE noise.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use a virtualenv in the builder so the runtime
#             stage gets a self-contained Python install tree; cache
#             pip downloads via BuildKit so iteration is fast.
# APPROACH  - venv at /opt/venv in builder; COPY --from=build /opt/venv;
#             prepend venv/bin to PATH in runtime.
# STRENGTHS- Cleaner boundary (one directory holds all third-party
#             code); BuildKit cache means dep-only changes rebuild in
#             seconds.
# WEAKNESSES- venv adds a small layer of indirection; understanding
#             Python's PYTHONHOME / sys.path matters.

# syntax=docker/dockerfile:1.7
# Dockerfile
ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim AS build

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a venv at /opt/venv. Everything pip installs lives here.
RUN python -m venv /opt/venv

WORKDIR /app
COPY requirements.txt .

# Cache mount: pip wheels are reused across builds; nothing baked in.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .
RUN pip install --no-deps .


# === Runtime stage ===
FROM python:${PYTHON_VERSION}-slim AS runtime

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the venv — single COPY brings everything in.
COPY --from=build /opt/venv /opt/venv

# Non-root user.
RUN groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --no-create-home app
USER app

WORKDIR /app

# Source code for the app — minimal; only what the app reads at runtime.
COPY --chown=app:app ./myapp ./myapp

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Pattern variant: target= for separate dev/prod images.
#   $ docker build --target=runtime -t myapp:1.4.2 .
#   $ docker build --target=build   -t myapp-debug:1.4.2 .   # has compilers; for dev
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: distroless runtime stage (no shell,
#             no package manager, no debugger), build args for dev/prod
#             variants, hooks for SBOM generation.
# APPROACH  - Distroless runtime is just Python + glibc + your venv.
#             Builder stage stays Debian-slim for the toolchain. Build
#             args toggle a "dev" target with shell + debugger access.
# STRENGTHS - ~50MB final image; smallest practical attack surface;
#             SBOM-clean; CVE scanners report only Python deps + glibc.
# WEAKNESSES- Distroless has NO shell — debugging requires kubectl
#             debug or a sidecar with a shell. Plan operations
#             accordingly.

# syntax=docker/dockerfile:1.7
# Dockerfile
ARG PYTHON_VERSION=3.12

# === Build stage ===
FROM python:${PYTHON_VERSION}-slim AS build

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv

WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .
RUN pip install --no-deps .

# Generate SBOM in the build stage (python deps only — glibc-level
# adds in the runtime stage's scan).
RUN pip install cyclonedx-bom \
    && cyclonedx-py environment --output-format json --output-file /tmp/sbom.json /opt/venv

# === Dev runtime stage — debug-friendly; not the default ===
FROM python:${PYTHON_VERSION}-slim AS dev

ENV PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 curl strace \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /opt/venv /opt/venv
COPY --from=build /tmp/sbom.json /var/lib/sbom.json
WORKDIR /app
COPY ./myapp ./myapp
EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# === Prod runtime stage — distroless; default target ===
FROM gcr.io/distroless/python3-debian12:nonroot AS prod

ENV PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"

# Distroless ships an unprivileged user named "nonroot" (uid 65532).
USER nonroot:nonroot

# Just the venv and the application code.
COPY --from=build /opt/venv /opt/venv
COPY --from=build /tmp/sbom.json /var/lib/sbom.json
WORKDIR /app
COPY --chown=nonroot:nonroot ./myapp ./myapp

EXPOSE 8000
# Distroless has no shell, so no shebang form, no entrypoint scripts.
# The Python interpreter is at /usr/bin/python3.
ENTRYPOINT ["/usr/bin/python3", "-m", "uvicorn"]
CMD ["myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Build the prod variant by default; dev on demand:
#   $ docker build -t myapp:1.4.2 .                       # prod
#   $ docker build --target=dev -t myapp-dev:1.4.2 .      # dev with shell

# Comparison after build:
#   $ docker images
#   myapp        1.4.2   <id>   ~50MB         (distroless)
#   myapp-dev    1.4.2   <id>   ~250MB        (slim + tools)
#
#   $ docker scout cves myapp:1.4.2          # near-zero CVEs on distroless
#   $ docker scout cves myapp-dev:1.4.2      # more CVEs from system tools

# CI integration:
# - name: Build prod image
#   uses: docker/build-push-action@v5
#   with:
#     target: prod
#     cache-from: type=gha
#     cache-to:   type=gha,mode=max
#     sbom: true                             # buildx auto-generates SBOM
#     provenance: mode=max                   # build provenance

# Decision rule:
#   any production Python service       -> multi-stage; build vs runtime split
#   smallest final image                 -> distroless runtime; ~50MB
#   need a shell for debugging           -> dev target alongside; never prod
#   compiles native deps                  -> builder needs build-essential + dev libs
#   monorepo with shared deps             -> single requirements.txt copied in builder
#   per-target image variants             -> docker build --target=NAME
#   private wheel index                  -> --mount=type=secret,id=pip-credentials
#   reproducible builds                   -> pin BOTH base SHAs (build + runtime)
#   SBOM required                          -> cyclonedx-py in builder OR buildx sbom: true
#   image signing                          -> see image-signing-sbom entry
#   dev tools in runtime                   -> NO; use multi-stage with dev target instead
#
# Anti-pattern: copying the entire builder /app into the runtime stage.
# That brings tests, .git, build caches, every intermediate file. Only
# COPY --from=build the specific paths you need: the venv, source
# under your package, maybe a config file. Anything else either bloats
# the image OR leaks something (test fixtures with credentials, .env
# files, build artifacts). Be specific.
```

## Decision Rule

```text
any production Python service       -> multi-stage; build vs runtime split
smallest final image                 -> distroless runtime; ~50MB
need a shell for debugging           -> dev target alongside; never prod
compiles native deps                  -> builder needs build-essential + dev libs
monorepo with shared deps             -> single requirements.txt copied in builder
per-target image variants             -> docker build --target=NAME
private wheel index                  -> --mount=type=secret,id=pip-credentials
reproducible builds                   -> pin BOTH base SHAs (build + runtime)
SBOM required                          -> cyclonedx-py in builder OR buildx sbom: true
image signing                          -> see image-signing-sbom entry
dev tools in runtime                   -> NO; use multi-stage with dev target instead
```

## Anti-Pattern

> [!warning] Anti-pattern
> copying the entire builder /app into the runtime stage.
> That brings tests, .git, build caches, every intermediate file. Only
> COPY --from=build the specific paths you need: the venv, source
> under your package, maybe a config file. Anything else either bloats
> the image OR leaks something (test fixtures with credentials, .env
> files, build artifacts). Be specific.

## Tips

- Multi-stage is the production default — it cuts image size by 50-80% and removes the compiler toolchain (and its CVEs) from the runtime.
- The virtualenv-in-builder pattern is cleaner than `pip install --prefix=/install`. The whole venv is one directory; one COPY brings it over; PATH manipulation is the only adjustment.
- Distroless (`gcr.io/distroless/python3-debian12:nonroot`) is the right runtime for production. ~50MB final, no shell, no apt, no curl — minimal attack surface.
- Pair distroless with a `dev` target for debugging. `docker build --target=dev` produces a debuggable image; `--target=prod` (or default) produces the distroless one.
- BuildKit cache mounts (`--mount=type=cache,target=/root/.cache/pip`) make iterative builds fast without bloating the final image. Cache lives outside layers.
- In multi-stage Dockerfiles, only COPY the SPECIFIC paths you need from the builder. `COPY --from=build /app /app` brings everything including .git, tests, fixtures.

## Common Mistake

> [!warning] Copying the entire builder workspace into runtime: `COPY --from=build /app /app`. That brings tests, .git, build caches, intermediate artifacts, and any .env files that slipped past .dockerignore. Only `COPY --from=build` the SPECIFIC paths you need (the venv, your package source, a config file).

## Shorthand (Junior → Senior)

**Junior:**
```python
# Brings everything from builder — bloated + leaky
COPY --from=build /app /app
```

**Senior:**
```python
# Bring only what runtime needs
COPY --from=build /opt/venv /opt/venv
COPY --chown=app:app ./myapp ./myapp
```

## See Also

- [[Sections/containerization/dockerfile/dockerfile-python-base|Dockerfile — choose the right Python base image (Containerization)]]
- [[Sections/containerization/dockerfile/python-deps-cached|Cached pip / uv installs — fast iterative builds (Containerization)]]
- [[Sections/containerization/dockerfile/_Index|Containerization → Dockerfile Basics — base images, multi-stage, dep caching]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

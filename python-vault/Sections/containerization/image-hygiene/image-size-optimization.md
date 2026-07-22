---
type: "entry"
domain: "python"
file: "containerization"
section: "image-hygiene"
id: "image-size-optimization"
title: "Image-size optimization — measure, trim, distroless"
category: "Image Hygiene"
subtitle: "docker history, dive, multi-stage, slim → distroless, .dockerignore, --no-cache-dir, wheel pruning, strip debug symbols, audit per-package contribution"
signature_short: "docker history --no-trunc IMAGE   ;   dive IMAGE   # find what to cut"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Image-size optimization — measure, trim, distroless"
  - "image-size-optimization"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/image-hygiene"
  - "category/image-hygiene"
  - "tier/tiered"
---

# Image-size optimization — measure, trim, distroless

> docker history, dive, multi-stage, slim → distroless, .dockerignore, --no-cache-dir, wheel pruning, strip debug symbols, audit per-package contribution

## Overview

Image size matters for three reasons: (1) cold-start latency on autoscaling — every new pod pulls the image; (2) registry storage cost (large images × many tags × retention); (3) attack surface (more packages = more CVEs to track). The reduction path is mechanical: switch to `python:3.12-slim` (often a 5× cut), use multi-stage to drop build tools (another 2-3×), add `.dockerignore` so build context isn't bloated. For the last 50%, distroless runtime + audited dependencies. Measure with `docker history` (per-layer size) and `dive` (per-file inside layers) — you can't optimize what you don't measure. The three examples solve the SAME concrete task — take a 1.5GB Python image down to <100MB — at three depths: slim base + .dockerignore → multi-stage with build/runtime split → distroless runtime + per-MB audit + wheel pruning.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cut a 1.5GB Python image to ~300MB.
- **Junior** — SAME — but cut to ~150MB by separating build from runtime.
- **Senior** — SAME — production: cut to <100MB via distroless runtime, audit each large package's contribution, strip debug symbols from C extensions.

## Signature

```python
docker history --no-trunc IMAGE   ;   dive IMAGE   # find what to cut
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cut a 1.5GB Python image to ~300MB.
# APPROACH  - Use python:3.12-slim instead of python:3.12; add a
#             .dockerignore so the build context isn't huge.
# STRENGTHS - Two-line change; ~5× reduction on most images.
# WEAKNESSES- Doesn't yet drop build tools from runtime; junior tier
#             adds multi-stage.

# Bad — full Debian (~1GB before app); your /app contains .git, venv,
# tests, etc.
# Dockerfile (BEFORE):
# FROM python:3.12
# COPY . .
# RUN pip install -r requirements.txt

# Better — slim base + dockerignore.
# Dockerfile (AFTER):
# FROM python:3.12-slim
# COPY . .
# RUN pip install --no-cache-dir -r requirements.txt

# .dockerignore — keep build context lean. Without this, your local
# .venv and .git get sent to the daemon on every build.
# .dockerignore:
#   .git/
#   .venv/
#   venv/
#   __pycache__/
#   *.pyc
#   .env*
#   .pytest_cache/
#   .mypy_cache/
#   .ruff_cache/
#   tests/
#   docs/
#   *.md
#   node_modules/                          # if any frontend
#   coverage*
#   .DS_Store
#   .idea/
#   .vscode/

# Measure before + after:
#   $ docker images
#   REPOSITORY  TAG    IMAGE ID  SIZE
#   myapp       full   abc       1.4GB
#   myapp       slim   def       280MB

# Per-layer breakdown:
#   $ docker history --no-trunc myapp:slim
# Look for layers > 50MB; those are the candidates to optimize.

# Bigger savings come next:
#  - multi-stage: drop build-essential / -dev packages (junior tier)
#  - --no-cache-dir on pip: don't bake the wheel cache into the layer
#  - apt cleanup in the same RUN as the install
#  - distroless runtime (senior tier)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but cut to ~150MB by separating build from runtime.
# APPROACH  - Multi-stage build (cross-references multi-stage-builds entry):
#             builder has compilers + dev libs; runtime gets only the
#             venv + libpq5 (runtime libpq, not the dev headers).
# STRENGTHS - Build tools (build-essential, libpq-dev) DO NOT ship in
#             the final image; gcc/g++ are ~250MB alone.
# WEAKNESSES- Still on slim Debian; senior tier moves to distroless
#             for another ~50MB reduction.

# syntax=docker/dockerfile:1.7
ARG PYTHON_VERSION=3.12

# === Build ===
FROM python:${PYTHON_VERSION}-slim AS build

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv

WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .
RUN pip install --no-deps .

# === Runtime — minimal ===
FROM python:${PYTHON_VERSION}-slim AS runtime

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Bring the venv from build; not the apt index, not the build tools.
COPY --from=build /opt/venv /opt/venv

RUN groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --no-create-home app
USER app
WORKDIR /app
COPY --chown=app:app ./myapp ./myapp

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Inspect with 'dive' (better than docker history for big-file finding):
#   $ brew install dive
#   $ dive myapp:1.4.2
# Browse layer-by-layer; see file sizes; identify the 80MB
# numpy / 50MB pandas wheels you might not need.

# Common wins after multi-stage:
#  1) pip --no-cache-dir during install (saves ~50MB if you forgot it)
#  2) apt-get install --no-install-recommends (saves ~50-200MB)
#  3) Remove leftover *.pyc files (PYTHONDONTWRITEBYTECODE handles this)
#  4) Remove tests/ from your pip-installed package (configure in
#     pyproject.toml: [tool.setuptools.packages.find] exclude = ["tests"])
#  5) Skip __pycache__ in pip wheels:
#     - actually wheels are fine; bytecode IS compiled at install time
#     - to disable bytecode compilation: PIP_NO_COMPILE=1 — but slows startup
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: cut to <100MB via distroless runtime,
#             audit each large package's contribution, strip debug
#             symbols from C extensions.
# APPROACH  - distroless python3-debian12:nonroot runtime (~50MB before
#             your venv); pip install --compile=False to skip .pyc;
#             trim test files from packaged wheels; pre-strip debug
#             symbols from .so files.
# STRENGTHS - Final image typically 70-100MB; minimal CVE surface;
#             nothing in the image you didn't put there.
# WEAKNESSES- Distroless lacks shell — debug via kubectl debug (see
#             non-root-user entry).

# syntax=docker/dockerfile:1.7
ARG PYTHON_VERSION=3.12

# === Build ===
FROM python:${PYTHON_VERSION}-slim AS build

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev binutils \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv

WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .
RUN pip install --no-deps .

# Strip debug symbols from C extensions (numpy, pandas, lxml) —
# saves 20-100MB on heavy-deps images.
RUN find /opt/venv -name "*.so" -exec strip --strip-unneeded {} + 2>/dev/null || true

# Remove tests / docs that some packages ship inside their wheels.
RUN find /opt/venv -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
RUN find /opt/venv -type d -name "test"  -exec rm -rf {} + 2>/dev/null || true
RUN find /opt/venv -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# === Runtime: distroless ===
FROM gcr.io/distroless/python3-debian12:nonroot AS runtime

ENV PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"

USER nonroot:nonroot

COPY --from=build --chown=nonroot:nonroot /opt/venv /opt/venv

WORKDIR /app
COPY --chown=nonroot:nonroot ./myapp ./myapp

EXPOSE 8000
ENTRYPOINT ["/usr/bin/python3", "-m", "uvicorn"]
CMD ["myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# === Audit script: per-package size contribution ===
# Run inside the build stage (or a helper container) to find what's
# eating the most space:
# RUN du -sh /opt/venv/lib/python*/site-packages/* | sort -h | tail -20
# Output:
#   8.3M    sqlalchemy
#   12M     fastapi
#   45M     pandas         <- candidate for review
#   78M     numpy          <- ditto
#   140M    torch          <- big lever; do you really need it?
#
# Common heavy deps + alternatives:
#   torch -> torch CPU-only (~700MB) vs full CUDA (~5GB) vs ONNX runtime
#   pandas -> polars (often 5-10× faster + smaller)
#   numpy -> required by many; can't easily remove
#   pyarrow -> pin features to drop unused (parquet without compute)

# === Image size budget table (approximate) ===
# Component                              Slim base    Distroless
# --------------------------------------------------------------------
# Base OS + python interpreter           ~50MB        ~30MB
# libc / system libs                     ~30MB        ~20MB (glibc only)
# pip + setuptools (in venv)             ~20MB        ~20MB
# Your app (FastAPI + sqlalchemy)        ~30MB        ~30MB
# numpy + pandas (if used)               ~125MB       ~125MB
# torch CPU-only                         ~700MB       ~700MB
# torch w/ CUDA                          ~5GB         ~5GB
# --------------------------------------------------------------------
# Typical FastAPI service total          ~150MB       ~80MB
# ML service (CPU-only)                  ~900MB       ~830MB

# === Tools for measuring ===
#  $ docker images                                  # quick total
#  $ docker history --no-trunc IMAGE                # per-layer
#  $ dive IMAGE                                      # per-file inside layers
#  $ docker scout cves IMAGE                         # CVEs (size proxy: more packages = more)
#  $ trivy image IMAGE --light                       # vulnerability summary

# Decision rule:
#   default for a Python service            -> python:3.12-slim + multi-stage
#   smallest practical                       -> distroless :nonroot runtime
#   need shell for debugging                 -> dev target alongside; never in prod runtime
#   heavy ML deps                            -> separate "ml-base" image; pull layer cache
#   torch → really need full CUDA?           -> often torch-cpu OR onnxruntime is enough
#   pandas → can polars replace it?         -> often yes; ~10× smaller AND faster
#   image > 1GB pulled often                 -> autoscaling cold start is your problem; trim
#   image growth blew our budget             -> dive to find the layer; check requirements.txt
#                                                for unused deps via pip-audit / deptry
#   stripping symbols                        -> strip --strip-unneeded; saves 20-100MB on heavy
#   tests in wheels                          -> rm tests/ in build stage; check setuptools config
#   bytecode compilation                     -> PIP_NO_COMPILE=1 saves ~30MB but slows startup
#                                                (each module compiles on first import)
#   .pyc inside containers                   -> PYTHONDONTWRITEBYTECODE=1; covered earlier
#   image scanning per-build                 -> docker scout cves OR trivy OR grype in CI
#   alternative builders                     -> Buildpacks / nix / ko (Go); Buildpacks are nice
#                                                for Python but less control vs Dockerfile
#
# Anti-pattern: optimizing image size by removing files in a LATER
# layer (RUN rm -rf /usr/share/doc). The deleted bytes still live in
# the previous layer; total size doesn't change because layers are
# additive. To actually shrink, EITHER do the install + cleanup in
# ONE RUN, OR use multi-stage and don't ship the intermediate layer.
# A common "I removed 200MB" claim that didn't move the image size at
# all because the RM happened in a separate layer.
```

## Decision Rule

```text
default for a Python service            -> python:3.12-slim + multi-stage
smallest practical                       -> distroless :nonroot runtime
need shell for debugging                 -> dev target alongside; never in prod runtime
heavy ML deps                            -> separate "ml-base" image; pull layer cache
torch → really need full CUDA?           -> often torch-cpu OR onnxruntime is enough
pandas → can polars replace it?         -> often yes; ~10× smaller AND faster
image > 1GB pulled often                 -> autoscaling cold start is your problem; trim
image growth blew our budget             -> dive to find the layer; check requirements.txt
                                             for unused deps via pip-audit / deptry
stripping symbols                        -> strip --strip-unneeded; saves 20-100MB on heavy
tests in wheels                          -> rm tests/ in build stage; check setuptools config
bytecode compilation                     -> PIP_NO_COMPILE=1 saves ~30MB but slows startup
                                             (each module compiles on first import)
.pyc inside containers                   -> PYTHONDONTWRITEBYTECODE=1; covered earlier
image scanning per-build                 -> docker scout cves OR trivy OR grype in CI
alternative builders                     -> Buildpacks / nix / ko (Go); Buildpacks are nice
                                             for Python but less control vs Dockerfile
```

## Anti-Pattern

> [!warning] Anti-pattern
> optimizing image size by removing files in a LATER
> layer (RUN rm -rf /usr/share/doc). The deleted bytes still live in
> the previous layer; total size doesn't change because layers are
> additive. To actually shrink, EITHER do the install + cleanup in
> ONE RUN, OR use multi-stage and don't ship the intermediate layer.
> A common "I removed 200MB" claim that didn't move the image size at
> all because the RM happened in a separate layer.

## Tips

- Measure first: `docker history --no-trunc IMAGE` shows per-layer size; `dive IMAGE` browses files inside layers. You can't optimize what you don't measure.
- The 80% reduction is mechanical: `python:3.12-slim` base + `.dockerignore` + multi-stage + `--no-cache-dir`. Apply all four before reaching for advanced techniques.
- Distroless runtime (`gcr.io/distroless/python3-debian12:nonroot`) takes you the last 50MB. Pair with a `dev` target (slim + tools) for debugging.
- Strip debug symbols from C extensions: `find /opt/venv -name "*.so" -exec strip --strip-unneeded {} +`. Saves 20-100MB on numpy/pandas/lxml-heavy images.
- Audit per-package size: `du -sh /opt/venv/lib/python*/site-packages/* | sort -h`. The top entries are usually the rethink candidates (torch full CUDA → CPU-only, pandas → polars).
- For ML images, separate the heavy ML base layer (torch / transformers) from your app layer. The ML base changes rarely; layer caching pays for itself on every push.

## Common Mistake

> [!warning] Removing files in a LATER layer to "shrink" the image: `RUN rm -rf /usr/share/doc`. Layers are additive — the deleted bytes live in the EARLIER layer; total image size is unchanged. To actually shrink, EITHER do the install + cleanup in the SAME RUN, OR use multi-stage and skip the intermediate layer entirely.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Separate RUN for cleanup — bytes still in the previous layer
RUN apt-get install -y build-essential
COPY ...
RUN apt-get remove -y build-essential && apt-get clean
```

**Senior:**
```python
# Multi-stage — build tools never reach the runtime image
FROM python:3.12-slim AS build
RUN apt-get install -y --no-install-recommends build-essential
# ... compile ...
FROM python:3.12-slim AS runtime
COPY --from=build /opt/venv /opt/venv
```

## See Also

- [[Sections/containerization/image-hygiene/image-signing-sbom|Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations (Containerization)]]
- [[Sections/containerization/image-hygiene/ci-cd-multiarch|Multi-arch CI/CD — buildx, GitHub Actions, image promotion (Containerization)]]
- [[Sections/containerization/image-hygiene/_Index|Containerization → Image Hygiene — size, signing/SBOM, multi-arch CI/CD]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

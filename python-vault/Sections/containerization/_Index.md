---
type: "file-index"
domain: "python"
file: "containerization"
title: "Containerization"
tags:
  - "python"
  - "python/containerization"
  - "index"
---

# Containerization

> 12 entries across 4 sections.

## Dockerfile Basics — base images, multi-stage, dep caching · 3

- [[Sections/containerization/dockerfile/dockerfile-python-base|Dockerfile — choose the right Python base image]] — Build a working Python container image: pick a base, set the workdir, install dependencies, copy code, run the app. Layer order matters; alpine is rarely the right answer for Python; slim is the right default.
- [[Sections/containerization/dockerfile/multi-stage-builds|Multi-stage builds — separate build from runtime]] — Two FROM stages: a builder with compilers and dev libraries, a runtime with only what the app needs. Final image is smaller, has fewer CVEs, and ships less attack surface. The default for production Python images.
- [[Sections/containerization/dockerfile/python-deps-cached|Cached pip / uv installs — fast iterative builds]] — Cache `pip install` across builds via BuildKit cache mounts; switch to `uv` for 10-100× faster installs; pin via lockfile so builds are deterministic. The compounding return on a one-line change.

## Process Model — gunicorn/uvicorn, shutdown, non-root · 3

- [[Sections/containerization/process-model/gunicorn-uvicorn-config|gunicorn + uvicorn — production process configuration]] — Run a FastAPI service with the right worker count, worker class, timeouts, and recycling. uvicorn alone is single-process; gunicorn + uvicorn workers gives you N workers with managed lifecycle.
- [[Sections/containerization/process-model/signal-handling-shutdown|Graceful shutdown — SIGTERM, drain, lifespan hooks]] — On pod termination, drain in-flight requests, close DB/Redis pools, flush logs and OTel spans, exit cleanly within terminationGracePeriodSeconds. The discipline that makes deploys invisible to users.
- [[Sections/containerization/process-model/non-root-user|Non-root user — drop privileges, integrate with k8s securityContext]] — Containers should NOT run as root. Create a non-root user in the Dockerfile; pair with k8s securityContext (runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities). Pod Security Standards "restricted" baseline.

## Container Ops — health probes, secrets injection, logging · 3

- [[Sections/containerization/container-ops/healthcheck-probes|Health probes — readiness, liveness, startup]] — Three k8s probes for three questions: startup (boot complete?), readiness (deps OK, accept traffic?), liveness (process responsive?). Get the semantics wrong and deploys cause outages.
- [[Sections/containerization/container-ops/secrets-injection|Secrets injection — k8s Secret, env vs file mount, BuildKit]] — Get DB passwords and API keys into the container at runtime without baking them into the image. Env vars from k8s Secret for the basics; mounted Secret volumes when rotation matters; BuildKit `--mount=type=secret` for build-time-only credentials.
- [[Sections/containerization/container-ops/container-logging|Container logging — stdout JSON, no log files, trace correlation]] — Containers log to stdout/stderr; the orchestrator captures and ships. Never write log files inside containers. Structured JSON; correlate with trace_id; tune the log driver for size limits.

## Image Hygiene — size, signing/SBOM, multi-arch CI/CD · 3

- [[Sections/containerization/image-hygiene/image-size-optimization|Image-size optimization — measure, trim, distroless]] — Cut a 1.5GB Python image to under 100MB without breaking anything. Multi-stage + slim base + .dockerignore = 80% reduction; distroless runtime + audited deps takes you the rest of the way.
- [[Sections/containerization/image-hygiene/image-signing-sbom|Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations]] — Sign every release image so deployers verify provenance; generate an SBOM listing every dep + version; attach attestations. Sigstore + Cosign is the modern keyless flow. The supply-chain hygiene that defends against typosquats and tampered registries.
- [[Sections/containerization/image-hygiene/ci-cd-multiarch|Multi-arch CI/CD — buildx, GitHub Actions, image promotion]] — Build a single image that runs on amd64 (servers) and arm64 (Apple Silicon dev / Graviton); push from CI with semver + SHA tags; promote across dev → staging → prod by digest. The integrated CI/CD pattern that ties Tier 1 together.

---
type: "entry"
domain: "python"
file: "containerization"
section: "process-model"
id: "non-root-user"
title: "Non-root user — drop privileges, integrate with k8s securityContext"
category: "Process Model"
subtitle: "USER, useradd, COPY --chown, k8s securityContext, runAsNonRoot, readOnlyRootFilesystem, capabilities.drop, distroless nonroot, setcap for low ports"
signature_short: "RUN useradd --uid 1001 app && USER app   ;   securityContext: runAsNonRoot: true, runAsUser: 1001"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Non-root user — drop privileges, integrate with k8s securityContext"
  - "non-root-user"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/process-model"
  - "category/process-model"
  - "tier/tiered"
---

# Non-root user — drop privileges, integrate with k8s securityContext

> USER, useradd, COPY --chown, k8s securityContext, runAsNonRoot, readOnlyRootFilesystem, capabilities.drop, distroless nonroot, setcap for low ports

## Overview

Running as root inside a container is the default — and it's wrong. A container escape (kernel CVE, runtime bug) gives the attacker root on the host. The fix is two layers: (1) Dockerfile creates a non-root user and `USER appuser`; (2) k8s `securityContext` enforces it (`runAsNonRoot: true` rejects images that try to run as root). Pair with `readOnlyRootFilesystem`, drop ALL capabilities, and you've hit the "restricted" Pod Security Standard. The three examples solve the SAME concrete task — run the FastAPI service as an unprivileged user with only the permissions it needs — at three depths: `useradd app && USER app` → numeric UID + `COPY --chown` + tmpfs for writable paths → distroless nonroot user + full restricted PSS securityContext + setcap for binding port 80.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Run the container as a non-root user, not root.
- **Junior** — SAME — but production-ready: numeric UID/GID for k8s policy compatibility, COPY --chown to set file ownership, readOnlyRootFilesystem-friendly (writable paths via tmpfs).
- **Senior** — SAME — production-grade: distroless nonroot user (UID 65532), complete restricted-PSS securityContext, seccomp profile, setcap for binding ports < 1024 if needed.

## Signature

```python
RUN useradd --uid 1001 app && USER app   ;   securityContext: runAsNonRoot: true, runAsUser: 1001
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Run the container as a non-root user, not root.
# APPROACH  - useradd in Dockerfile; USER appuser before CMD.
# STRENGTHS - One-line fix; immediate security improvement.
# WEAKNESSES- Doesn't enforce at the orchestrator level; junior tier
#             adds k8s securityContext.

# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user.
RUN useradd --create-home --shell /bin/bash app

# All subsequent commands AND the running container use 'app'.
USER app

COPY . .

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# Verify:
#   $ docker run --rm -it myapp:dev id
#   uid=1000(app) gid=1000(app) groups=1000(app)

# Note: this gives 'app' a /home/app directory; many production
# Dockerfiles skip the home dir (--no-create-home) for minimalism.
# See junior tier for the production form.

# Privilege escalation note:
#   Even as 'app', a process inside the container CAN'T usually escape
#   to root on the host (modern container runtimes use user namespaces).
#   But running as root inside the container makes a container ESCAPE
#   (kernel CVE, runtime bug) much worse: attacker gets host root
#   without any further privilege step.

# Common gotcha: existing files owned by root.
#   COPY before USER -> files owned by root; 'app' may not be able to
#                       read/write them.
#   COPY after USER  -> files owned by app; works.
#   Or use COPY --chown=app:app . . to fix ownership explicitly.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but production-ready: numeric UID/GID for k8s
#             policy compatibility, COPY --chown to set file ownership,
#             readOnlyRootFilesystem-friendly (writable paths via tmpfs).
# APPROACH  - --system user with explicit numeric UID; --no-create-home
#             since we don't need it; COPY --chown when copying app
#             code; document writable paths.
# STRENGTHS- Compatible with PSS "restricted"; readOnlyRootFilesystem
#             works; numeric UID survives k8s securityContext checks.
# WEAKNESSES- writable paths (e.g. /tmp) require tmpfs volumes in k8s.

# Dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Build deps + cleanup.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create system user with explicit numeric UID/GID.
# --system            - reserved UID range; doesn't get a home by default
# --uid 1001          - explicit numeric UID for k8s policy
# --no-create-home    - we don't need /home/app
# --gid app           - matching primary group
RUN groupadd --system --gid 1001 app && \
    useradd  --system --uid 1001 --gid app --no-create-home app

# Copy code WITH ownership; otherwise files would be root-owned.
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# === k8s pod manifest (matching) ===
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     spec:
#       securityContext:                    # Pod-level
#         runAsNonRoot: true               # k8s rejects images that try to run as root
#         runAsUser: 1001                  # explicit; matches Dockerfile
#         runAsGroup: 1001
#         fsGroup: 1001                    # owns mounted volumes
#       containers:
#         - name: myapp
#           image: myapp:1.4.2
#           securityContext:                # container-level (overrides pod-level)
#             allowPrivilegeEscalation: false
#             readOnlyRootFilesystem: true # filesystem write attempts fail
#             capabilities:
#               drop: ["ALL"]              # drop every Linux capability
#           volumeMounts:
#             - name: tmp
#               mountPath: /tmp            # tmpfs for /tmp (Python tempfile, uv cache)
#             - name: home
#               mountPath: /home/app
#       volumes:
#         - name: tmp
#           emptyDir: { medium: Memory, sizeLimit: 100Mi }
#         - name: home
#           emptyDir: { medium: Memory, sizeLimit: 50Mi }

# Why readOnlyRootFilesystem matters:
#   - Defense-in-depth: even if an attacker gains code execution, they
#     can't write malware to disk.
#   - Forces all writable paths to be explicit (volumes / tmpfs).
#   - Container-escape attacks often write to /tmp; tmpfs limits blast.
#
# What still needs to be writable:
#   - /tmp (Python tempfile, asyncio default, uv cache)
#   - any app log directory (better: log to stdout)
#   - /run if your app uses /run/lock or similar
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: distroless nonroot user (UID 65532),
#             complete restricted-PSS securityContext, seccomp profile,
#             setcap for binding ports < 1024 if needed.
# APPROACH  - Distroless ships an unprivileged 'nonroot' user (UID 65532);
#             pair with seccomp runtime/default; restricted PSS template.
# STRENGTHS - Smallest practical attack surface; PSS-restricted compliance;
#             defense-in-depth (rootless, read-only, no caps, seccomp).
# WEAKNESSES- Distroless has no shell — debug via ephemeral debug
#             container. Binding low ports needs setcap or sidecar.

# Dockerfile (using distroless from multi-stage-builds entry).
# syntax=docker/dockerfile:1.7
ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim AS build
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PATH="/opt/venv/bin:$PATH"
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
COPY . .
RUN pip install --no-deps .

# === Runtime: distroless with built-in nonroot user ===
FROM gcr.io/distroless/python3-debian12:nonroot AS runtime

# Distroless ships a 'nonroot' user (UID 65532) — image runs as this user
# automatically. No USER directive needed; image's metadata sets it.

ENV PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"

# Bring in venv from build stage.
COPY --from=build --chown=nonroot:nonroot /opt/venv /opt/venv

WORKDIR /app
COPY --chown=nonroot:nonroot ./myapp ./myapp

EXPOSE 8000
ENTRYPOINT ["/usr/bin/python3", "-m", "uvicorn"]
CMD ["myapp:app", "--host", "0.0.0.0", "--port", "8000"]

# === k8s: full Pod Security Standard "restricted" template ===
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     metadata:
#       annotations:
#         container.apparmor.security.beta.kubernetes.io/myapp: runtime/default
#     spec:
#       securityContext:
#         runAsNonRoot: true
#         runAsUser: 65532
#         runAsGroup: 65532
#         fsGroup: 65532
#         fsGroupChangePolicy: OnRootMismatch
#         seccompProfile:
#           type: RuntimeDefault
#       containers:
#         - name: myapp
#           image: myregistry/myapp@sha256:...
#           securityContext:
#             allowPrivilegeEscalation: false
#             readOnlyRootFilesystem: true
#             runAsNonRoot: true
#             runAsUser: 65532
#             capabilities:
#               drop: ["ALL"]
#             seccompProfile:
#               type: RuntimeDefault
#           ports:
#             - containerPort: 8000
#           volumeMounts:
#             - { name: tmp, mountPath: /tmp }
#       volumes:
#         - name: tmp
#           emptyDir: { medium: Memory, sizeLimit: 64Mi }
#
# Enforce it cluster-wide:
# apiVersion: v1
# kind: Namespace
# metadata:
#   name: prod
#   labels:
#     pod-security.kubernetes.io/enforce: restricted
#     pod-security.kubernetes.io/enforce-version: latest

# === Binding port < 1024 as non-root ===
# Two options:
#  1) Don't. Bind to 8000+, put a Service / Ingress on port 80/443.
#     This is the right answer 99% of the time.
#  2) setcap CAP_NET_BIND_SERVICE on the python binary:
#     RUN setcap 'cap_net_bind_service=+ep' /usr/bin/python3
#     But this defeats "drop: ALL" — usually not worth it.

# Debugging non-root containers (no shell in distroless):
#   $ kubectl debug -it myapp-pod \
#       --target=myapp \
#       --image=python:3.12 \
#       --share-processes \
#       -- bash
#   # The debug container has root + a shell + Python; can ptrace
#   # PID 1 of the target via shared PID namespace.

# Decision rule:
#   minimum: don't run as root          -> useradd + USER in Dockerfile
#   numeric UID for k8s                  -> useradd --system --uid 1001
#   k8s policy enforcement              -> securityContext.runAsNonRoot: true
#   defense-in-depth                     -> readOnlyRootFilesystem: true + tmpfs /tmp
#   PSS "restricted" compliance         -> drop ALL caps + seccomp + read-only fs + nonroot
#   distroless                           -> use the :nonroot tag (UID 65532)
#   need to bind port 80                 -> NO; use a Service/Ingress; or setcap (rare)
#   writable /tmp                        -> emptyDir tmpfs volume
#   writable app data                    -> PVC with explicit fsGroup
#   debugging without shell             -> kubectl debug --share-processes ephemeral container
#   AppArmor / SELinux profiles         -> annotations + cluster policy
#   custom seccomp profile               -> mount config map; reference in seccompProfile.localhostProfile
#
# Anti-pattern: dropping into 'USER 0' or 'USER root' anywhere in the
# Dockerfile (or omitting USER entirely; default is root). Even
# transiently for "just this RUN" — that command runs as root, and
# subsequent layers inherit. If you need root for an apt install, do
# it in a stage that doesn't ship to runtime (multi-stage build), or
# do all the apt work BEFORE the USER line and ensure USER is the
# LAST line before CMD. The default = root behavior is why so many
# images ship as root despite intent.
```

## Decision Rule

```text
minimum: don't run as root          -> useradd + USER in Dockerfile
numeric UID for k8s                  -> useradd --system --uid 1001
k8s policy enforcement              -> securityContext.runAsNonRoot: true
defense-in-depth                     -> readOnlyRootFilesystem: true + tmpfs /tmp
PSS "restricted" compliance         -> drop ALL caps + seccomp + read-only fs + nonroot
distroless                           -> use the :nonroot tag (UID 65532)
need to bind port 80                 -> NO; use a Service/Ingress; or setcap (rare)
writable /tmp                        -> emptyDir tmpfs volume
writable app data                    -> PVC with explicit fsGroup
debugging without shell             -> kubectl debug --share-processes ephemeral container
AppArmor / SELinux profiles         -> annotations + cluster policy
custom seccomp profile               -> mount config map; reference in seccompProfile.localhostProfile
```

## Anti-Pattern

> [!warning] Anti-pattern
> dropping into 'USER 0' or 'USER root' anywhere in the
> Dockerfile (or omitting USER entirely; default is root). Even
> transiently for "just this RUN" — that command runs as root, and
> subsequent layers inherit. If you need root for an apt install, do
> it in a stage that doesn't ship to runtime (multi-stage build), or
> do all the apt work BEFORE the USER line and ensure USER is the
> LAST line before CMD. The default = root behavior is why so many
> images ship as root despite intent.

## Tips

- Always set `USER` in the Dockerfile. Without it, the container runs as root by default — a kernel CVE or runtime bug becomes a host-root escape.
- Use numeric UIDs (`useradd --uid 1001`) so k8s `securityContext.runAsNonRoot: true` checks pass. Some k8s versions reject named users they can't resolve.
- `COPY --chown=app:app` sets ownership at copy time. Without it, `COPY .` produces root-owned files that the non-root user can't modify.
- Pair Dockerfile `USER` with k8s `securityContext.runAsNonRoot: true`. The Dockerfile sets the default; k8s enforces — defense in depth.
- Pod Security Standard "restricted" requires: `runAsNonRoot`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, `capabilities.drop: ALL`, `seccompProfile: RuntimeDefault`. Set them all.
- For ports < 1024, do NOT use `setcap cap_net_bind_service` — it defeats `drop: ALL`. Bind to 8000+ and put the privileged port on a Service/Ingress. The right answer 99% of the time.

## Common Mistake

> [!warning] Omitting `USER` in the Dockerfile (or worse, transiently switching to root mid-Dockerfile and forgetting to switch back). Default is root; subsequent layers inherit. A kernel CVE or container-runtime bug then becomes an immediate host-root escape. Always end with `USER appuser` (or use distroless `:nonroot`).

## Shorthand (Junior → Senior)

**Junior:**
```python
# No USER directive — runs as root by default
FROM python:3.12-slim
COPY . .
CMD ["python", "-m", "myapp"]
```

**Senior:**
```python
# Non-root by construction
FROM python:3.12-slim
RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app app
COPY --chown=app:app . .
USER app
CMD ["python", "-m", "myapp"]
```

## See Also

- [[Sections/containerization/process-model/gunicorn-uvicorn-config|gunicorn + uvicorn — production process configuration (Containerization)]]
- [[Sections/containerization/process-model/signal-handling-shutdown|Graceful shutdown — SIGTERM, drain, lifespan hooks (Containerization)]]
- [[Sections/containerization/process-model/_Index|Containerization → Process Model — gunicorn/uvicorn, shutdown, non-root]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

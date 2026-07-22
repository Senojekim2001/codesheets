---
type: "entry"
domain: "python"
file: "containerization"
section: "container-ops"
id: "secrets-injection"
title: "Secrets injection — k8s Secret, env vs file mount, BuildKit"
category: "Container Ops"
subtitle: "k8s Secret, envFrom: secretRef, volumeMounts secret, External Secrets Operator, Vault Agent injector, BuildKit --mount=type=secret, never COPY secrets"
signature_short: "envFrom: [{ secretRef: { name: myapp-secrets } }]   # OR: volumeMounts: { name: vault, mountPath: /run/secrets }"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Secrets injection — k8s Secret, env vs file mount, BuildKit"
  - "secrets-injection"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/container-ops"
  - "category/container-ops"
  - "tier/tiered"
---

# Secrets injection — k8s Secret, env vs file mount, BuildKit

> k8s Secret, envFrom: secretRef, volumeMounts secret, External Secrets Operator, Vault Agent injector, BuildKit --mount=type=secret, never COPY secrets

## Overview

A container image is a public artifact. Secrets must arrive at RUNTIME via the orchestrator, NEVER via `COPY` or `ARG` (visible in `docker history`). The standard channels: env vars from a k8s Secret object (`envFrom: secretRef`), file mounts from a Secret volume (better for rotation; the file content changes), Vault Agent injector or External Secrets Operator (production-grade, syncs from a real secrets manager). For BUILD-time secrets (private wheel index, signing keys for SBOMs), use BuildKit's `--mount=type=secret` — never bakes into a layer or `docker history`. The three examples solve the SAME concrete task — get DATABASE_PASSWORD and JWT_SIGNING_KEY into the running pod without any secret in the image — at three depths: docker run `-e` for one-off → k8s Secret + `envFrom` + mounted volumes for rotation → Vault/External Secrets Operator + CSI driver + BuildKit secrets for full lifecycle.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Pass DATABASE_PASSWORD and JWT_SIGNING_KEY to the running container.
- **Junior** — SAME — but in Kubernetes: Secret object holds the values; pod consumes via envFrom (env vars) and/or volume mount (files). Rotation possible via volume mount.
- **Senior** — SAME — production: External Secrets Operator (ESO) syncs from AWS Secrets Manager / Vault into k8s Secrets; Vault Agent injector for sidecar-style file injection; BuildKit secrets for build-time credentials never landing in image history.

## Signature

```python
envFrom: [{ secretRef: { name: myapp-secrets } }]   # OR: volumeMounts: { name: vault, mountPath: /run/secrets }
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Pass DATABASE_PASSWORD and JWT_SIGNING_KEY to the
#             running container.
# APPROACH  - docker run -e flags. The image stays clean; the
#             secret arrives at startup.
# STRENGTHS - One command; no Kubernetes needed.
# WEAKNESSES- Secrets visible in 'docker inspect' / process listing
#             ('ps' shows env vars). Junior tier upgrades to k8s.

# Run with env vars (NEVER bake into the image).
$ docker run \
    -e DATABASE_PASSWORD="$DB_PW" \
    -e JWT_SIGNING_KEY="$(cat ./jwt.key)" \
    -p 8000:8000 \
    myapp:1.4.2

# Or via --env-file (file ON THE HOST, never copied into image).
# .env.runtime (gitignored, host-only)
# DATABASE_PASSWORD=hunter2
# JWT_SIGNING_KEY=eyJhbGciOiJIUzI1NiIs...
$ docker run --env-file=.env.runtime -p 8000:8000 myapp:1.4.2

# In the container, read normally:
import os
DB_PW = os.environ["DATABASE_PASSWORD"]                # raises KeyError if missing

# What NOT to do:
#  - COPY secret.txt .                       # secret in a layer FOREVER
#  - ARG SECRET_KEY                          # visible in 'docker history --no-trunc'
#  - ENV SECRET_KEY=hunter2                  # visible in 'docker inspect'
#  - encrypted secrets baked in              # the decrypt key has to live somewhere
#
# The image is the WRONG place for secrets. Always inject at runtime.

# Visibility:
$ docker inspect <container_id>            # shows ENV
$ ps auxe | grep myapp                     # shows env on Linux
# So even runtime env vars aren't private from the host operator.
# For host-secret isolation, use mounted files (junior tier).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but in Kubernetes: Secret object holds the values;
#             pod consumes via envFrom (env vars) and/or volume mount
#             (files). Rotation possible via volume mount.
# APPROACH  - kubectl create secret generic OR a Secret manifest; the
#             pod references it. Files in a Secret volume update
#             when the Secret changes — no restart needed.
# STRENGTHS- RBAC-controlled; encrypted at rest (with KMS); rotation
#             without rebuild; audit log per access.
# WEAKNESSES- k8s Secret values are base64-encoded but NOT encrypted
#             at rest unless you configure KMS encryption (settings.kubeconfig).

# === 1. Create the Secret ===
# Imperative (good for getting started):
#   $ kubectl create secret generic myapp-secrets \
#       --from-literal=DATABASE_PASSWORD="${DB_PW}" \
#       --from-literal=JWT_SIGNING_KEY="$(cat jwt.key)"
#
# Or declarative — but commit a TEMPLATE, never the populated file:
# secret.yaml.template (committed):
# apiVersion: v1
# kind: Secret
# metadata:
#   name: myapp-secrets
# type: Opaque
# stringData:                                   # plain text; k8s base64-encodes
#   DATABASE_PASSWORD: ${DB_PASSWORD}
#   JWT_SIGNING_KEY: ${JWT_KEY}
#
# Populate at deploy time via envsubst, sealed-secrets, or external-secrets-operator.

# === 2a. Inject as ENV VARS (most common) ===
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     spec:
#       containers:
#         - name: myapp
#           image: myapp:1.4.2
#           envFrom:
#             - secretRef:
#                 name: myapp-secrets         # all keys -> env vars
#           # Or pick specific keys:
#           env:
#             - name: DATABASE_PASSWORD
#               valueFrom:
#                 secretKeyRef:
#                   name: myapp-secrets
#                   key: DATABASE_PASSWORD

# === 2b. Inject as MOUNTED FILES (rotation-friendly) ===
# Mount the Secret as a volume; each key becomes a file.
# spec:
#   template:
#     spec:
#       containers:
#         - name: myapp
#           image: myapp:1.4.2
#           volumeMounts:
#             - name: secrets
#               mountPath: /run/secrets/myapp
#               readOnly: true
#           env:
#             - name: JWT_KEY_FILE
#               value: /run/secrets/myapp/JWT_SIGNING_KEY
#       volumes:
#         - name: secrets
#           secret:
#             secretName: myapp-secrets
#             defaultMode: 0400               # owner-read only

# In the app, read from the file path (and rotate-friendly):
import os, time
def jwt_key() -> bytes:
    """Re-read on every call OR cache with TTL — rotation-friendly."""
    with open(os.environ["JWT_KEY_FILE"], "rb") as f:
        return f.read()

# Why mounted files beat env vars for rotation:
#  - When you 'kubectl edit secret myapp-secrets', the FILES update
#    in the pod (via kubelet sync) without restarting.
#  - Env vars are baked into the process when it starts; updating the
#    Secret has NO effect on running pods until they restart.
#
# When env vars are fine: the secret rarely rotates, OR you're OK with
# a restart on rotation.

# === 3. Encryption at rest ===
# By default, Secrets are base64-encoded but not encrypted in etcd.
# Enable KMS encryption in the cluster:
#   apiVersion: apiserver.config.k8s.io/v1
#   kind: EncryptionConfiguration
#   resources:
#     - resources: [secrets]
#       providers:
#         - kms:
#             name: aws-kms
#             endpoint: unix:///var/run/kmsplugin/socket.sock
#         - identity: {}                       # fallback for legacy secrets

# === Common gotchas ===
# 1) Forgetting to base64-encode in Secret.data:
#    data:
#      DATABASE_PASSWORD: hunter2          # WRONG (yaml: not base64)
#    Use 'stringData' instead, OR base64-encode yourself:
#    data:
#      DATABASE_PASSWORD: aHVudGVyMg==     # OK (echo -n hunter2 | base64)
# 2) Secret in git as a manifest with real values: rotate everything;
#    git history retains forever (see env-var-secrets entry).
# 3) Logging the secret: pydantic SecretStr or structlog redact
#    processor (see crypto-secrets entries).
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: External Secrets Operator (ESO) syncs
#             from AWS Secrets Manager / Vault into k8s Secrets;
#             Vault Agent injector for sidecar-style file injection;
#             BuildKit secrets for build-time credentials never landing
#             in image history.
# APPROACH  - SecretStore + ExternalSecret CRDs declare what to sync
#             and where it comes from. Vault Agent injector annotates
#             pods to inject Vault-rendered files. BuildKit secrets
#             pass private indexes during 'docker build'.
# STRENGTHS - Single source of truth (the secrets manager); audit
#             trail; rotation propagates; build-time creds never leak.
# WEAKNESSES- More CRDs to manage; Vault auth ("secret zero") still
#             needed — see secrets-vault entry.

# === Option 1: External Secrets Operator (ESO) ===
# pip install nothing; this lives in the cluster.
# ESO + AWS Secrets Manager sync:
#
# # SecretStore (cluster-wide credentials for ESO -> AWS):
# apiVersion: external-secrets.io/v1beta1
# kind: SecretStore
# metadata: { name: aws-sm, namespace: prod }
# spec:
#   provider:
#     aws:
#       service: SecretsManager
#       region: us-east-1
#       auth:
#         jwt:                                  # IRSA / k8s ServiceAccount auth
#           serviceAccountRef: { name: external-secrets }
#
# # ExternalSecret (what to sync):
# apiVersion: external-secrets.io/v1beta1
# kind: ExternalSecret
# metadata: { name: myapp-secrets, namespace: prod }
# spec:
#   refreshInterval: 5m                        # poll AWS every 5 min
#   secretStoreRef:
#     name: aws-sm
#     kind: SecretStore
#   target:
#     name: myapp-secrets                       # the k8s Secret to write to
#     creationPolicy: Owner
#   data:
#     - secretKey: DATABASE_PASSWORD
#       remoteRef:
#         key: prod/myapp/db
#         property: password
#     - secretKey: JWT_SIGNING_KEY
#       remoteRef:
#         key: prod/myapp/jwt
#
# Result: a regular k8s Secret named "myapp-secrets" exists; values
# come from AWS; ESO refreshes every 5 min. Pod consumes via envFrom.

# === Option 2: Vault Agent injector ===
# Annotate the pod; the injector adds a sidecar that fetches secrets
# from Vault and writes them as files.
#
# apiVersion: apps/v1
# kind: Deployment
# spec:
#   template:
#     metadata:
#       annotations:
#         vault.hashicorp.com/agent-inject: "true"
#         vault.hashicorp.com/role: "myapp"
#         vault.hashicorp.com/agent-inject-secret-db.json: "database/creds/myapp-rw"
#         vault.hashicorp.com/agent-inject-template-db.json: |
#           {{- with secret "database/creds/myapp-rw" -}}
#           {"username":"{{ .Data.username }}","password":"{{ .Data.password }}"}
#           {{- end }}
#     spec:
#       serviceAccountName: myapp                # bound to a Vault role
#       containers:
#         - name: myapp
#           image: myapp:1.4.2
#           # /vault/secrets/db.json appears here, populated by the agent.
#
# Pair with the FileWatchedSecret pattern in the secrets-vault entry
# for hot-reload on rotation (Vault DYNAMIC secrets give short-lived
# DB credentials that auto-renew).

# === Option 3: BuildKit --mount=type=secret (build-time) ===
# Use case: private wheel index, GPG signing key, NPM token.
# The secret is mounted as a file at build time; nothing enters layers.
#
# # syntax=docker/dockerfile:1.7
# FROM python:3.12-slim AS build
# RUN --mount=type=secret,id=pip_index_url \
#     INDEX=$(cat /run/secrets/pip_index_url) && \
#     pip install --index-url $INDEX -r requirements.txt
#
# Build:
# $ docker build \
#     --secret id=pip_index_url,src=/path/to/index_url.txt \
#     -t myapp:1.4.2 .
#
# In CI:
# - name: Build
#   uses: docker/build-push-action@v5
#   with:
#     context: .
#     secrets: |
#       pip_index_url=${{ secrets.PIP_INDEX_URL }}
#
# Verify NOTHING leaked:
# $ docker history --no-trunc myapp:1.4.2     # no INDEX URL anywhere
# $ docker inspect myapp:1.4.2 | grep -i index # no INDEX URL anywhere

# === Option 4: CSI driver (advanced) ===
# Mount secrets via the Secrets Store CSI Driver — fetches from Vault /
# AWS / Azure Key Vault on pod startup AND on rotation. Bypasses k8s
# Secret object entirely (or syncs to it for env-var compat).

# Decision rule:
#   docker run for one-off                  -> -e flags or --env-file
#   k8s, simple                              -> Secret + envFrom: secretRef
#   k8s, rotation-friendly                   -> Secret as volume + readonly mount + file-watch
#   secrets manager source of truth          -> External Secrets Operator (ESO)
#   Vault dynamic secrets (DB creds)         -> Vault Agent injector
#   build-time only secrets                  -> BuildKit --mount=type=secret
#   private wheel index                      -> BuildKit secret in pip --index-url
#   secret zero (auth to manager)            -> ServiceAccount JWT (k8s) / IRSA (AWS)
#   per-tenant secrets                        -> separate Secret per tenant; namespace by tenant
#   short-lived credentials                   -> Vault dynamic secrets (lease + auto-renew)
#   GitOps with secrets                       -> SealedSecrets / SOPS-encrypted Secret manifests
#   compliance / audit log                    -> ESO + AWS CloudTrail OR Vault audit log
#
# Anti-pattern: COPY secrets.env into the image, then "we'll just
# delete it from the build context next time". Once a layer contains
# a secret, EVERY layer below it does too — and 'docker history --no-trunc'
# shows the layer command including any 'COPY secrets.env'. Even
# 'RUN rm secrets.env' on a later layer DOES NOT REMOVE IT from the
# previous layer. The only fix is to never put the secret in the
# image to begin with: orchestrator inject (env or file mount) for
# runtime; BuildKit --mount=type=secret for build-time.
```

## Decision Rule

```text
docker run for one-off                  -> -e flags or --env-file
k8s, simple                              -> Secret + envFrom: secretRef
k8s, rotation-friendly                   -> Secret as volume + readonly mount + file-watch
secrets manager source of truth          -> External Secrets Operator (ESO)
Vault dynamic secrets (DB creds)         -> Vault Agent injector
build-time only secrets                  -> BuildKit --mount=type=secret
private wheel index                      -> BuildKit secret in pip --index-url
secret zero (auth to manager)            -> ServiceAccount JWT (k8s) / IRSA (AWS)
per-tenant secrets                        -> separate Secret per tenant; namespace by tenant
short-lived credentials                   -> Vault dynamic secrets (lease + auto-renew)
GitOps with secrets                       -> SealedSecrets / SOPS-encrypted Secret manifests
compliance / audit log                    -> ESO + AWS CloudTrail OR Vault audit log
```

## Anti-Pattern

> [!warning] Anti-pattern
> COPY secrets.env into the image, then "we'll just
> delete it from the build context next time". Once a layer contains
> a secret, EVERY layer below it does too — and 'docker history --no-trunc'
> shows the layer command including any 'COPY secrets.env'. Even
> 'RUN rm secrets.env' on a later layer DOES NOT REMOVE IT from the
> previous layer. The only fix is to never put the secret in the
> image to begin with: orchestrator inject (env or file mount) for
> runtime; BuildKit --mount=type=secret for build-time.

## Tips

- Secrets enter the container at RUNTIME via the orchestrator. NEVER `COPY` a secret in, NEVER `ARG`, NEVER `ENV` with the value baked. Once a layer has a secret, `docker history` exposes it forever.
- For k8s, `envFrom: secretRef` is the simplest; mounted Secret volumes are better when rotation matters (the file content updates without pod restart).
- External Secrets Operator (ESO) syncs from AWS Secrets Manager / Vault / GCP Secret Manager into k8s Secret objects — your apps read normal Secrets, ESO handles the upstream sync.
- Vault Agent injector renders Vault secrets to files via pod annotations. Pair with `FileWatchedSecret` (see secrets-vault entry) for hot-reload on rotation.
- For build-time secrets (private wheel indexes, signing keys), use BuildKit `--mount=type=secret`. The secret is a file at build time; `docker history` shows nothing.
- k8s Secret values are base64-encoded but NOT encrypted in etcd by default. Enable KMS encryption (`EncryptionConfiguration`) in the cluster API server config.

## Common Mistake

> [!warning] `COPY secrets.env .` (or any layer that touches a secret), then `RUN rm secrets.env` on a later layer to "delete" it. Layers are immutable — `docker history --no-trunc` shows the original COPY command and the layer's contents. Even if the file is deleted in a later layer, the secret bytes persist in the earlier layer. The fix is to never put the secret in the image.

## Shorthand (Junior → Senior)

**Junior:**
```python
# COPY then RM — secret persists in the COPY layer forever
COPY .env.production .
RUN python build.py
RUN rm .env.production
```

**Senior:**
```python
# Inject at runtime; or BuildKit secret for build-time only
# k8s manifest:
envFrom: [{ secretRef: { name: myapp-secrets } }]
# Build-time:
RUN --mount=type=secret,id=pip_idx pip install --index-url $(cat /run/secrets/pip_idx) ...
```

## See Also

- [[Sections/containerization/container-ops/healthcheck-probes|Health probes — readiness, liveness, startup (Containerization)]]
- [[Sections/containerization/container-ops/container-logging|Container logging — stdout JSON, no log files, trace correlation (Containerization)]]
- [[Sections/containerization/container-ops/_Index|Containerization → Container Ops — health probes, secrets injection, logging]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

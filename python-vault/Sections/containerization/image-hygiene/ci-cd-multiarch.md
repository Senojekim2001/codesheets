---
type: "entry"
domain: "python"
file: "containerization"
section: "image-hygiene"
id: "ci-cd-multiarch"
title: "Multi-arch CI/CD — buildx, GitHub Actions, image promotion"
category: "Image Hygiene"
subtitle: "docker buildx, --platform linux/amd64,linux/arm64, GHA cache, semver + SHA tags, native ARM runners vs QEMU, image promotion by digest, retention policies"
signature_short: "docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/org/app:v1.4.2 ."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Multi-arch CI/CD — buildx, GitHub Actions, image promotion"
  - "ci-cd-multiarch"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/image-hygiene"
  - "category/image-hygiene"
  - "tier/tiered"
---

# Multi-arch CI/CD — buildx, GitHub Actions, image promotion

> docker buildx, --platform linux/amd64,linux/arm64, GHA cache, semver + SHA tags, native ARM runners vs QEMU, image promotion by digest, retention policies

## Overview

Multi-arch images run on both x86 servers and ARM (Apple Silicon dev, AWS Graviton, Ampere Altra) — one tag, two architectures, automatic platform selection at pull time. `docker buildx` with `--platform linux/amd64,linux/arm64` produces a manifest-list image. CI/CD wraps this: tag with both semver (`v1.4.2`) and the git SHA; cache layers via GHA cache (`type=gha`); promote across environments by DIGEST so `staging` and `prod` deploy the byte-identical image. The three examples solve the SAME concrete task — every push to main builds + pushes a multi-arch image with semver and SHA tags; releases get signed; envs deploy by digest — at three depths: single-arch buildx push → multi-arch + GHA cache + tag strategy → production with native ARM runners + signed images + cross-env promotion + retention policies.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Build + push a Docker image from CI (single arch).
- **Junior** — SAME — but multi-arch (amd64 + arm64), with layer cache via GHA, plus semver + SHA tags.
- **Senior** — SAME — production: native ARM runners (no QEMU), signed images via Sigstore, cross-environment promotion by digest, retention policies for old tags.

## Signature

```python
docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/org/app:v1.4.2 .
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Build + push a Docker image from CI (single arch).
# APPROACH  - GitHub Actions with docker/build-push-action.
# STRENGTHS - Standard pattern; works for 90% of services.
# WEAKNESSES- Single-arch (amd64); no caching across runs;
#             tag strategy is just ${{ github.sha }}.

# .github/workflows/build.yml
# name: build
# on:
#   push:
#     branches: [main]
# permissions:
#   contents: read
#   packages: write
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#       - uses: docker/build-push-action@v5
#         with:
#           context: .
#           push: true
#           tags: ghcr.io/myorg/myapp:${{ github.sha }}

# Result:
#   ghcr.io/myorg/myapp:abc123def...
# Pull on amd64 servers; works.
# But on Apple Silicon / Graviton, pull either fails ("no matching
# manifest") or runs under emulation (slow). Junior tier fixes this.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but multi-arch (amd64 + arm64), with layer cache
#             via GHA, plus semver + SHA tags.
# APPROACH  - docker buildx + --platform; QEMU emulation for the
#             non-host arch (slower but works on any runner); cache
#             via type=gha.
# STRENGTHS- One tag, runs everywhere (Mac dev, Graviton prod);
#             cached builds in CI are 10× faster.
# WEAKNESSES- QEMU is slow (~3-5× longer than native). Senior tier
#             uses native ARM runners.

# .github/workflows/build.yml
# name: build
# on:
#   push:
#     branches: [main]
#     tags: ['v*']
# permissions:
#   contents: read
#   packages: write
#   id-token: write
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#
#       # QEMU lets us cross-build for arm64 on amd64 runners.
#       - uses: docker/setup-qemu-action@v3
#         with: { platforms: arm64 }
#
#       - uses: docker/setup-buildx-action@v3
#
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#
#       # Compute tags: latest (main only), semver (on tag), git SHA (always).
#       - name: Tags
#         id: meta
#         uses: docker/metadata-action@v5
#         with:
#           images: ghcr.io/myorg/myapp
#           tags: |
#             type=ref,event=branch                  # main / feature/...
#             type=semver,pattern={{version}}        # v1.4.2 -> 1.4.2
#             type=semver,pattern={{major}}.{{minor}}  # -> 1.4
#             type=semver,pattern={{major}}            # -> 1
#             type=sha,format=long                    # full SHA
#             type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
#
#       - uses: docker/build-push-action@v5
#         with:
#           context: .
#           platforms: linux/amd64,linux/arm64       # multi-arch manifest
#           push: true
#           tags: ${{ steps.meta.outputs.tags }}
#           labels: ${{ steps.meta.outputs.labels }}
#           cache-from: type=gha
#           cache-to:   type=gha,mode=max

# After a push to a v1.4.2 tag, you get tags:
#   ghcr.io/myorg/myapp:1.4.2
#   ghcr.io/myorg/myapp:1.4
#   ghcr.io/myorg/myapp:1
#   ghcr.io/myorg/myapp:latest
#   ghcr.io/myorg/myapp:sha-${SHA}
# All point to the SAME multi-arch manifest containing amd64 + arm64.

# Verify multi-arch:
#   $ docker buildx imagetools inspect ghcr.io/myorg/myapp:1.4.2
#   Manifests:
#     Name: ghcr.io/myorg/myapp:1.4.2@sha256:...
#     MediaType: application/vnd.docker.distribution.manifest.v2+json
#     Platform: linux/amd64
#     ...
#     Platform: linux/arm64

# Pull on a Mac (arm64): docker auto-selects the arm64 image.
# Pull on a Linux server (amd64): docker auto-selects the amd64 image.

# Why GHA cache (type=gha) matters:
#   First build: ~3 minutes
#   Subsequent build (deps unchanged, code-only change): ~30s
# The cache lives in GitHub's storage; survives across runs;
# scoped per-branch.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: native ARM runners (no QEMU), signed
#             images via Sigstore, cross-environment promotion by digest,
#             retention policies for old tags.
# APPROACH  - Build amd64 on ubuntu-latest; build arm64 on the new
#             ubuntu-24.04-arm runners; merge into a manifest list.
#             cosign keyless sign post-build. Promote by digest via a
#             reusable workflow that copies the manifest into staging /
#             prod registries. Retention via OCI registry cleanup APIs.
# STRENGTHS - 3-5× faster builds (no QEMU); image is byte-identical
#             across environments; signed and policy-enforced; old
#             images cleaned up automatically.
# WEAKNESSES- More CI surface area; native ARM runners may have higher
#             concurrency limits / cost. Worth it for any service that
#             ships frequently.

# .github/workflows/build-and-promote.yml
# name: build-and-promote
# on:
#   push:
#     branches: [main]
#     tags: ['v*']
# permissions:
#   contents: read
#   packages: write
#   id-token: write                                  # for cosign keyless
# jobs:
#   build-amd64:
#     runs-on: ubuntu-latest                          # native amd64
#     outputs: { digest: ${{ steps.build.outputs.digest }} }
#     steps:
#       - uses: actions/checkout@v4
#       - uses: docker/setup-buildx-action@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#       - id: build
#         uses: docker/build-push-action@v5
#         with:
#           context: .
#           platforms: linux/amd64
#           push: true
#           outputs: type=image,name=ghcr.io/myorg/myapp,push-by-digest=true,name-canonical=true
#           cache-from: type=gha,scope=amd64
#           cache-to:   type=gha,mode=max,scope=amd64
#
#   build-arm64:
#     runs-on: ubuntu-24.04-arm                       # native arm64 runner
#     outputs: { digest: ${{ steps.build.outputs.digest }} }
#     steps:
#       - uses: actions/checkout@v4
#       - uses: docker/setup-buildx-action@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#       - id: build
#         uses: docker/build-push-action@v5
#         with:
#           context: .
#           platforms: linux/arm64
#           push: true
#           outputs: type=image,name=ghcr.io/myorg/myapp,push-by-digest=true,name-canonical=true
#           cache-from: type=gha,scope=arm64
#           cache-to:   type=gha,mode=max,scope=arm64
#
#   merge:
#     needs: [build-amd64, build-arm64]
#     runs-on: ubuntu-latest
#     outputs: { tags: ${{ steps.meta.outputs.tags }} }
#     steps:
#       - uses: docker/setup-buildx-action@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#       - id: meta
#         uses: docker/metadata-action@v5
#         with:
#           images: ghcr.io/myorg/myapp
#           tags: |
#             type=ref,event=branch
#             type=semver,pattern={{version}}
#             type=sha,format=long
#       - name: Create manifest
#         run: |
#           # Combine the two arch-specific images under each tag.
#           tags=$(echo "${{ steps.meta.outputs.tags }}" | tr '\n' ' ')
#           for tag in $tags; do
#             docker buildx imagetools create -t $tag \
#               ghcr.io/myorg/myapp@${{ needs.build-amd64.outputs.digest }} \
#               ghcr.io/myorg/myapp@${{ needs.build-arm64.outputs.digest }}
#           done
#
#   sign:
#     needs: merge
#     runs-on: ubuntu-latest
#     steps:
#       - uses: sigstore/cosign-installer@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#       - name: Sign manifest list
#         env: { COSIGN_EXPERIMENTAL: "1" }
#         run: |
#           # Sign the manifest-list digest, not a tag.
#           DIGEST=$(docker buildx imagetools inspect ghcr.io/myorg/myapp:${{ github.sha }} --raw | sha256sum | cut -d' ' -f1)
#           # ... (in practice, use docker manifest inspect to get the actual digest)
#           cosign sign --yes ghcr.io/myorg/myapp@sha256:$DIGEST

# === Image promotion across environments ===
# After build, the image lives in ghcr.io/myorg/myapp.
# Staging and prod registries get the SAME digest copied over.
# .github/workflows/promote.yml
# name: promote
# on:
#   workflow_dispatch:
#     inputs:
#       digest:    { required: true }
#       target_env: { required: true, type: choice, options: [staging, prod] }
# jobs:
#   promote:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: imjasonh/setup-crane@v0.1
#       - run: |
#           SOURCE=ghcr.io/myorg/myapp@${{ inputs.digest }}
#           TARGET=registry.${{ inputs.target_env }}.example.com/myapp
#           # Copy by digest — no rebuild; byte-identical across envs.
#           crane copy $SOURCE $TARGET
#           # Re-verify signature in the destination registry (Cosign
#           # supports cross-registry signature copy).

# === Retention policies ===
# GHCR (and most managed registries) support retention via API:
# # GitHub Container Registry: keep last 10 tagged + 30 days untagged
#   - schedule: '0 4 * * *'
#     uses: actions/delete-package-versions@v5
#     with:
#       package-name: myapp
#       package-type: container
#       min-versions-to-keep: 10
#       delete-only-untagged-versions: true
# # AWS ECR: lifecycle policy
#   {
#     "rules": [
#       { "rulePriority": 1, "selection": { "tagStatus": "untagged",
#         "countType": "sinceImagePushed", "countUnit": "days", "countNumber": 30 },
#         "action": { "type": "expire" } }
#     ]
#   }

# Decision rule:
#   single-arch is enough                 -> docker/build-push-action; one platform
#   need amd64 + arm64                    -> buildx --platform linux/amd64,linux/arm64
#   QEMU vs native ARM runner             -> native is 3-5× faster; QEMU works anywhere
#   tag strategy                          -> docker/metadata-action; semver + SHA + branch
#   layer caching                         -> type=gha (GitHub Actions cache); per-arch scope
#   image promotion across envs           -> crane copy SOURCE@digest TARGET; never rebuild
#   reference image in deploy             -> by digest in production manifests
#   reject unsigned at deploy             -> Cosign Policy Controller (image-signing-sbom entry)
#   compliance evidence                   -> SLSA provenance attestation; cosign attest
#   retention                             -> per-registry lifecycle (GHCR / ECR / Artifact Registry)
#   automated promotion                   -> manual workflow_dispatch; OR ArgoCD ApplicationSet
#   build cache cost                      -> type=gha is free up to 10GB / repo
#   one workflow vs reusable              -> reusable workflow (workflow_call) for dev/staging/prod
#   private base image                    -> docker/login-action twice; one per registry
#   ECR / GAR / ACR                       -> respective login-action variants; same shape
#
# Anti-pattern: rebuilding the image for each environment with envvars
# baked in. "Build once for dev, build again for staging with
# STAGING_API_URL set" — now staging and dev have DIFFERENT image
# digests. Promotion guarantees evaporate; signature applies to the
# original digest only; testing dev doesn't validate staging because
# they're not the same artifact. The right pattern: build ONCE; pass
# environment-specific config via env vars / k8s ConfigMap at runtime;
# promote the SAME digest across environments.
```

## Decision Rule

```text
single-arch is enough                 -> docker/build-push-action; one platform
need amd64 + arm64                    -> buildx --platform linux/amd64,linux/arm64
QEMU vs native ARM runner             -> native is 3-5× faster; QEMU works anywhere
tag strategy                          -> docker/metadata-action; semver + SHA + branch
layer caching                         -> type=gha (GitHub Actions cache); per-arch scope
image promotion across envs           -> crane copy SOURCE@digest TARGET; never rebuild
reference image in deploy             -> by digest in production manifests
reject unsigned at deploy             -> Cosign Policy Controller (image-signing-sbom entry)
compliance evidence                   -> SLSA provenance attestation; cosign attest
retention                             -> per-registry lifecycle (GHCR / ECR / Artifact Registry)
automated promotion                   -> manual workflow_dispatch; OR ArgoCD ApplicationSet
build cache cost                      -> type=gha is free up to 10GB / repo
one workflow vs reusable              -> reusable workflow (workflow_call) for dev/staging/prod
private base image                    -> docker/login-action twice; one per registry
ECR / GAR / ACR                       -> respective login-action variants; same shape
```

## Anti-Pattern

> [!warning] Anti-pattern
> rebuilding the image for each environment with envvars
> baked in. "Build once for dev, build again for staging with
> STAGING_API_URL set" — now staging and dev have DIFFERENT image
> digests. Promotion guarantees evaporate; signature applies to the
> original digest only; testing dev doesn't validate staging because
> they're not the same artifact. The right pattern: build ONCE; pass
> environment-specific config via env vars / k8s ConfigMap at runtime;
> promote the SAME digest across environments.

## Tips

- `docker buildx --platform linux/amd64,linux/arm64` produces a multi-arch manifest. Pull picks the right arch automatically. One tag, runs on Macs (Apple Silicon) and Graviton servers.
- Native ARM runners (`ubuntu-24.04-arm`) build arm64 3-5× faster than QEMU emulation. For CI that runs frequently, the time savings dwarf the per-runner cost.
- Use `docker/metadata-action` to compute the right tag set: semver components (`v1.4.2`, `1.4`, `1`), git SHA, branch name, and `latest` (only on main). Each tag points to the same digest.
- Promote across environments BY DIGEST, not by rebuilding. `crane copy SOURCE@digest TARGET` copies byte-identical bits; the signature stays valid; staging and prod run literally the same artifact.
- `type=gha` cache (GitHub Actions native cache) is free up to 10GB per repo. Use `cache-from` + `cache-to: mode=max` and per-arch `scope=` so amd64 and arm64 caches don't clobber each other.
- Reference images in production manifests by DIGEST (`image: ghcr.io/myorg/myapp@sha256:abc...`), not by tag. Tags drift; digests don't. Cosign signatures are per-digest.

## Common Mistake

> [!warning] Rebuilding the image for each environment with env-specific envvars baked in. "Build once for dev with `DEV_API_URL`, build again for staging with `STAGING_API_URL`" — now dev and staging have DIFFERENT digests; promotion guarantees evaporate; signature only applies to the original. Build ONCE; pass environment config via env vars / k8s ConfigMap at runtime; promote the SAME digest across environments.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-env builds — different digests; signature break; testing != prod
docker build -t myapp:dev    --build-arg API_URL=dev    .
docker build -t myapp:prod   --build-arg API_URL=prod   .
```

**Senior:**
```python
# Build once; promote by digest; env config at runtime
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:1.4.2 . --push
crane copy ghcr.io/org/myapp@sha256:abc registry.prod.example.com/myapp
# Each env's k8s ConfigMap supplies API_URL
```

## See Also

- [[Sections/containerization/image-hygiene/image-size-optimization|Image-size optimization — measure, trim, distroless (Containerization)]]
- [[Sections/containerization/image-hygiene/image-signing-sbom|Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations (Containerization)]]
- [[Sections/containerization/image-hygiene/_Index|Containerization → Image Hygiene — size, signing/SBOM, multi-arch CI/CD]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

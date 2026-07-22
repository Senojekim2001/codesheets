---
type: "entry"
domain: "python"
file: "containerization"
section: "image-hygiene"
id: "image-signing-sbom"
title: "Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations"
category: "Image Hygiene"
subtitle: "cosign sign / verify, Sigstore keyless OIDC, syft / cyclonedx-py SBOMs, SLSA provenance, Cosign Policy Controller, Trivy/Grype CVE scan, OCI artifacts"
signature_short: "cosign sign IMAGE   ;   cosign verify --certificate-identity=... IMAGE   ;   syft IMAGE -o spdx-json"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations"
  - "image-signing-sbom"
tags:
  - "python"
  - "python/containerization"
  - "python/containerization/image-hygiene"
  - "category/image-hygiene"
  - "tier/tiered"
---

# Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations

> cosign sign / verify, Sigstore keyless OIDC, syft / cyclonedx-py SBOMs, SLSA provenance, Cosign Policy Controller, Trivy/Grype CVE scan, OCI artifacts

## Overview

Three supply-chain artifacts you ship alongside every image: a SIGNATURE (proves the image was built by your CI), an SBOM (lists every package + version inside), and a PROVENANCE attestation (records what the build did — source ref, build instructions, builder identity). Sigstore + Cosign is the modern toolchain — keyless signing via OIDC means no long-lived signing keys to leak. Cluster-side admission controllers (Cosign Policy Controller, Kyverno) reject images without a valid signature. The three examples solve the SAME concrete task — every release image is signed, has an SBOM, and is verified at deploy — at three depths: `cosign sign` with a key → keyless signing via GitHub OIDC + SBOM via syft attached as attestation → SLSA provenance + Cosign Policy Controller enforcement + CVE scan gate in CI.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Sign a release image so deployers can verify it's genuinely from us.
- **Junior** — SAME — but with KEYLESS signing via Sigstore (no long- lived private key), plus an SBOM listing every package.
- **Senior** — SAME — production: SLSA provenance level 3, admission policy enforces signed images, CVE scan gates the build, air-gapped registry pattern.

## Signature

```python
cosign sign IMAGE   ;   cosign verify --certificate-identity=... IMAGE   ;   syft IMAGE -o spdx-json
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Sign a release image so deployers can verify it's
#             genuinely from us.
# APPROACH  - cosign sign with a generated keypair; cosign verify
#             against the public key.
# STRENGTHS - One tool; widely adopted; OCI-native (signature stored
#             alongside the image in the registry).
# WEAKNESSES- Static keys must be rotated, stored, audited.
#             Junior tier uses keyless OIDC.

# Install once:
#   $ brew install cosign

# Generate a signing keypair (one-time):
#   $ cosign generate-key-pair
#   # cosign.key (private) -> store in secrets manager
#   # cosign.pub (public)  -> commit to repo / publish

# Sign an image after pushing:
#   $ docker push myregistry/myapp:1.4.2
#   $ cosign sign --key cosign.key myregistry/myapp:1.4.2
# The signature is pushed to the registry as an OCI tag like
# myapp:sha256-abc123.sig

# Verify (anyone with the public key):
#   $ cosign verify --key cosign.pub myregistry/myapp:1.4.2

# What the signature attests:
#   - The image digest (sha256:...) was signed by someone with the
#     private key.
#   - It does NOT (yet) attest WHO signed or WHAT the build did.
#   - Junior tier adds keyless signing + SBOM + provenance.

# Why this matters even at intro level:
#   - Defends against tampered registries (someone replaces your image
#     with a malicious one — verify fails).
#   - Defends against typosquats (someone publishes "myapp" at a
#     different registry — verify checks signature against your key).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with KEYLESS signing via Sigstore (no long-
#             lived private key), plus an SBOM listing every package.
# APPROACH  - Cosign keyless mode uses OIDC (GitHub Actions identity);
#             the signature certificate ties the image to a specific
#             workflow + commit. SBOM via 'syft' or 'cyclonedx-py';
#             attached to the image as an attestation.
# STRENGTHS- No private key to rotate / leak; signing identity is
#             cryptographically tied to a CI workflow + commit;
#             SBOM travels with the image.
# WEAKNESSES- Verification needs a network call to the Sigstore
#             transparency log (Rekor). Air-gapped environments need
#             a private Sigstore deployment.

# === GitHub Actions workflow for sign + SBOM ===
# .github/workflows/release.yml
# name: release
# on:
#   push:
#     tags: ['v*']
# permissions:
#   contents: read
#   id-token: write              # REQUIRED for keyless OIDC
#   packages: write              # push to GHCR
#
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: docker/setup-buildx-action@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#
#       - name: Build + push
#         id: build
#         uses: docker/build-push-action@v5
#         with:
#           context: .
#           push: true
#           tags: ghcr.io/myorg/myapp:${{ github.ref_name }}
#           cache-from: type=gha
#           cache-to:   type=gha,mode=max
#           sbom: true             # buildx generates SBOM attestation
#           provenance: mode=max   # buildx generates provenance attestation
#
#       - uses: sigstore/cosign-installer@v3
#       - name: Sign image (keyless)
#         env:
#           COSIGN_EXPERIMENTAL: "1"
#         run: |
#           cosign sign --yes ghcr.io/myorg/myapp@${{ steps.build.outputs.digest }}
#         # Cosign uses GitHub's OIDC token as the signer identity.
#         # The signature certificate records:
#         #   - issuer: https://token.actions.githubusercontent.com
#         #   - identity: https://github.com/myorg/myapp/.github/workflows/release.yml@refs/tags/v1.4.2
#         #   - sha: ${{ github.sha }}

# === Verify (locally or in admission control) ===
# $ cosign verify \
#     --certificate-identity=https://github.com/myorg/myapp/.github/workflows/release.yml@refs/tags/v1.4.2 \
#     --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
#     ghcr.io/myorg/myapp:v1.4.2
# Verification will succeed ONLY if the image was signed by THAT
# specific workflow at THAT specific tag.

# === SBOM generation ===
# buildx with sbom: true (above) generates an SPDX SBOM as an attestation.
# Or generate explicitly with syft:
# $ syft ghcr.io/myorg/myapp:v1.4.2 -o spdx-json > sbom.spdx.json
# $ syft ghcr.io/myorg/myapp:v1.4.2 -o cyclonedx-json > sbom.cyclonedx.json

# Attach SBOM to the image as a Cosign attestation:
# $ cosign attest \
#     --predicate sbom.spdx.json \
#     --type spdxjson \
#     ghcr.io/myorg/myapp@${DIGEST}

# Verify the SBOM later:
# $ cosign verify-attestation \
#     --certificate-identity=... \
#     --type spdxjson \
#     ghcr.io/myorg/myapp:v1.4.2
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: SLSA provenance level 3, admission
#             policy enforces signed images, CVE scan gates the build,
#             air-gapped registry pattern.
# APPROACH  - buildx auto-generates SLSA provenance (mode=max);
#             Trivy/Grype scan the SBOM and fail the build on
#             CRITICAL CVEs; Cosign Policy Controller in the cluster
#             rejects unsigned or stale images.
# STRENGTHS - Compliance-friendly (SLSA L3); compromised image can\'t
#             ship; old known-CVE images can\'t be deployed; full
#             chain of provenance from source -> build -> registry ->
#             cluster.
# WEAKNESSES- More moving parts; Sigstore network dependency unless
#             you run a private instance.

# === CI workflow with all the bells ===
# .github/workflows/release.yml
# name: release
# on:
#   push:
#     tags: ['v*']
# permissions:
#   contents: read
#   id-token: write
#   packages: write
#   security-events: write          # for SARIF upload to GHSA
#
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     outputs:
#       digest: ${{ steps.build.outputs.digest }}
#     steps:
#       - uses: actions/checkout@v4
#       - uses: docker/setup-buildx-action@v3
#       - uses: docker/login-action@v3
#         with:
#           registry: ghcr.io
#           username: ${{ github.actor }}
#           password: ${{ secrets.GITHUB_TOKEN }}
#
#       - name: Build + push (with SBOM + provenance attestations)
#         id: build
#         uses: docker/build-push-action@v5
#         with:
#           context: .
#           push: true
#           tags: |
#             ghcr.io/myorg/myapp:${{ github.ref_name }}
#             ghcr.io/myorg/myapp:${{ github.sha }}
#           cache-from: type=gha
#           cache-to:   type=gha,mode=max
#           sbom:       true
#           provenance: mode=max          # SLSA Level 3 attestation
#
#       - uses: sigstore/cosign-installer@v3
#       - name: Sign image
#         env:
#           COSIGN_EXPERIMENTAL: "1"
#         run: |
#           cosign sign --yes ghcr.io/myorg/myapp@${{ steps.build.outputs.digest }}
#
#       - name: CVE scan
#         uses: aquasecurity/trivy-action@master
#         with:
#           image-ref:   ghcr.io/myorg/myapp@${{ steps.build.outputs.digest }}
#           severity:    CRITICAL,HIGH
#           exit-code:   "1"               # fail build on findings
#           format:      sarif
#           output:      trivy.sarif
#
#       - uses: github/codeql-action/upload-sarif@v3
#         if: always()
#         with: { sarif_file: trivy.sarif }
#
#   verify:                              # double-check before declaring release good
#     needs: build
#     runs-on: ubuntu-latest
#     steps:
#       - uses: sigstore/cosign-installer@v3
#       - run: |
#           cosign verify \
#             --certificate-identity-regexp="^https://github.com/myorg/myapp/" \
#             --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
#             ghcr.io/myorg/myapp@${{ needs.build.outputs.digest }}

# === Cluster-side enforcement: Cosign Policy Controller ===
# Install once per cluster (it's an admission webhook).
#   $ helm install policy-controller sigstore/policy-controller -n cosign-system --create-namespace
#
# Define a ClusterImagePolicy:
# apiVersion: policy.sigstore.dev/v1beta1
# kind: ClusterImagePolicy
# metadata:
#   name: ghcr-myorg-must-be-signed
# spec:
#   images:
#     - glob: "ghcr.io/myorg/*"
#   authorities:
#     - keyless:
#         url: https://fulcio.sigstore.dev
#         identities:
#           - issuer: https://token.actions.githubusercontent.com
#             subjectRegExp: "^https://github.com/myorg/.+\.github/workflows/release\.yml@refs/tags/v.+"
# # Pods using ghcr.io/myorg/* images that aren't signed by THAT
# # workflow get rejected at admission.

# === Verify in production (rollout pipeline) ===
# Before kubectl apply, verify image:
#   cosign verify --certificate-identity=... \
#     ghcr.io/myorg/myapp:${VERSION} || exit 1

# === SBOM-based CVE rescan (continuous) ===
# CVEs change daily; the SBOM doesn't. Run a scheduled job that
# re-scans SBOMs for new CVEs and alerts on hits — this catches
# vulns disclosed AFTER your release without rebuilding.
# - schedule: "0 8 * * *"
# - run: |
#     for tag in $(crane ls ghcr.io/myorg/myapp); do
#       cosign download attestation --type spdxjson \
#         ghcr.io/myorg/myapp:$tag > sbom.json
#       grype sbom:sbom.json --fail-on critical
#     done

# Decision rule:
#   sign every release                   -> Cosign keyless via OIDC
#   private key signing (legacy)          -> Cosign with --key; rotate via cosign keys
#   air-gapped / private Sigstore         -> deploy fulcio + rekor + tuf in cluster
#   SBOM source of truth                   -> buildx sbom: true (SPDX) OR syft (SPDX/CycloneDX)
#   provenance level                       -> buildx provenance: mode=max for SLSA L3
#   CI fails on CVE                        -> trivy --exit-code 1 (severity CRITICAL,HIGH)
#   reject unsigned images at deploy      -> Cosign Policy Controller (admission webhook)
#   continuous CVE rescan                  -> daily job; grype against the stored SBOM
#   image promotion across envs           -> sign once at build; verify on each env's deploy
#   compliance: SLSA L3                    -> hosted GitHub Actions runners + buildx + cosign
#   compliance: SLSA L4                    -> hermetic builds (e.g., Bazel) + reproducible
#   secrets / certs in image (still!)     -> reject before signing; gitleaks / trufflehog scan
#   deployment policies                    -> Kyverno or Cosign Policy Controller; OPA Gatekeeper
#   non-OCI registry                       -> Cosign supports many; check OCI compliance
#
# Anti-pattern: signing only the "latest" tag and assuming it covers
# everything. Tags are MUTABLE — someone can push a new image to
# "latest" and your signature is for the OLD digest. Always sign by
# DIGEST (cosign sign IMAGE@sha256:abc...) and reference images by
# digest in production. Tag-based references are for humans; digest
# references are for security guarantees.
```

## Decision Rule

```text
sign every release                   -> Cosign keyless via OIDC
private key signing (legacy)          -> Cosign with --key; rotate via cosign keys
air-gapped / private Sigstore         -> deploy fulcio + rekor + tuf in cluster
SBOM source of truth                   -> buildx sbom: true (SPDX) OR syft (SPDX/CycloneDX)
provenance level                       -> buildx provenance: mode=max for SLSA L3
CI fails on CVE                        -> trivy --exit-code 1 (severity CRITICAL,HIGH)
reject unsigned images at deploy      -> Cosign Policy Controller (admission webhook)
continuous CVE rescan                  -> daily job; grype against the stored SBOM
image promotion across envs           -> sign once at build; verify on each env's deploy
compliance: SLSA L3                    -> hosted GitHub Actions runners + buildx + cosign
compliance: SLSA L4                    -> hermetic builds (e.g., Bazel) + reproducible
secrets / certs in image (still!)     -> reject before signing; gitleaks / trufflehog scan
deployment policies                    -> Kyverno or Cosign Policy Controller; OPA Gatekeeper
non-OCI registry                       -> Cosign supports many; check OCI compliance
```

## Anti-Pattern

> [!warning] Anti-pattern
> signing only the "latest" tag and assuming it covers
> everything. Tags are MUTABLE — someone can push a new image to
> "latest" and your signature is for the OLD digest. Always sign by
> DIGEST (cosign sign IMAGE@sha256:abc...) and reference images by
> digest in production. Tag-based references are for humans; digest
> references are for security guarantees.

## Tips

- Cosign keyless signing via OIDC (GitHub Actions, GitLab CI, Buildkite) is the modern default — no long-lived private keys to rotate or leak. The signing identity is the CI workflow at a specific commit.
- Always sign by DIGEST (`IMAGE@sha256:...`), not by tag. Tags are mutable; digests are content-addressed. Production deployments should reference images by digest.
- buildx auto-generates SBOM (`sbom: true`) and SLSA provenance (`provenance: mode=max`) as OCI attestations. Free SLSA L3 compliance for hosted-runner builds.
- Use `Cosign Policy Controller` (or Kyverno) to enforce signed-image policies at the cluster admission layer. Without an admission policy, signatures are advisory; with one, unsigned images can't deploy.
- CVEs change daily; the SBOM doesn't. Run a scheduled job that re-scans your SBOMs against the latest CVE database. Catches vulns disclosed AFTER your release without rebuilding.
- For air-gapped environments, you can deploy private Fulcio + Rekor + TUF (the Sigstore stack) on-prem. Same Cosign workflow; different trust roots.

## Common Mistake

> [!warning] Signing the `latest` tag and assuming it covers everything that gets deployed. Tags are MUTABLE — someone (or a CI race condition) can push a new image to `latest`; your signature is for the OLD digest; the new image is unsigned but still gets pulled. ALWAYS sign by digest (`cosign sign IMAGE@sha256:abc...`) and reference images by digest in production manifests.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Signing a tag — tag drifts; new pushes are unsigned
cosign sign myorg/myapp:latest
```

**Senior:**
```python
# Sign by digest; reference by digest in deploy
DIGEST=$(docker inspect myorg/myapp:1.4.2 --format='{{index .RepoDigests 0}}')
cosign sign --yes $DIGEST
# k8s manifest: image: myorg/myapp@sha256:abc...
```

## See Also

- [[Sections/containerization/image-hygiene/image-size-optimization|Image-size optimization — measure, trim, distroless (Containerization)]]
- [[Sections/containerization/image-hygiene/ci-cd-multiarch|Multi-arch CI/CD — buildx, GitHub Actions, image promotion (Containerization)]]
- [[Sections/containerization/image-hygiene/_Index|Containerization → Image Hygiene — size, signing/SBOM, multi-arch CI/CD]]
- [[Sections/containerization/_Index|Containerization index]]
- [[_Index|Vault index]]

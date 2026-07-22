---
type: "entry"
domain: "python"
file: "packaging"
section: "modern-packaging"
id: "pip-tools"
title: "pip-tools — Requirements Pinning & Compilation"
category: "Packaging"
subtitle: "pip-compile, pip-sync, requirements.in, requirements.txt, --resolver"
signature_short: "pip-compile requirements.in  |  pip-sync requirements.txt"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pip-tools — Requirements Pinning & Compilation"
  - "pip-tools"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/modern-packaging"
  - "category/packaging"
  - "tier/tiered"
---

# pip-tools — Requirements Pinning & Compilation

> pip-compile, pip-sync, requirements.in, requirements.txt, --resolver

## Overview

pip-tools pins dependencies to exact versions. Write high-level requirements in requirements.in (like "httpx>=0.25"), run pip-compile to generate requirements.txt with all transitive dependencies pinned to exact versions, then use pip-sync to install exactly what's in the file. This ensures reproducible builds and prevents "works on my machine" problems.

## Signature

```python
pip-compile requirements.in  |  pip-sync requirements.txt
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Write loose pins in requirements.in; pip-compile expands to a fully pinned requirements.txt.
# STRENGTHS - Pure pip + pip-tools; no migration; reproducible installs across machines.
# WEAKNESSES- Two files to maintain; no native build/publish workflow.
pip install pip-tools

# requirements.in (you edit this):
# httpx>=0.25
# pydantic>=2

pip-compile requirements.in           # writes requirements.txt with full pins
pip-sync requirements.txt             # install EXACTLY what's listed; remove the rest
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Layered .in files (base/dev/prod); hashes for security; --upgrade for refresh; tooling friendly.
# STRENGTHS - 'pip install -r requirements.txt --require-hashes' gives supply-chain protection.
# WEAKNESSES- Multiple .in/.txt pairs proliferate; pip-compile is noticeably slower than uv lock.
# requirements/base.in        ────────────────────────
# httpx>=0.25
# pydantic>=2
#
# requirements/dev.in         ────────────────────────
# -c base.txt                  # constrain to versions already locked in base
# pytest>=8
# ruff
# mypy
#
# requirements/prod.in        ────────────────────────
# -r base.in
# gunicorn
# uvicorn[standard]

# Compile each layer:
pip-compile --generate-hashes requirements/base.in  -o requirements/base.txt
pip-compile --generate-hashes requirements/dev.in   -o requirements/dev.txt
pip-compile --generate-hashes requirements/prod.in  -o requirements/prod.txt

# Install with hash verification:
pip install --require-hashes -r requirements/prod.txt
pip-sync requirements/dev.txt           # local dev mirror

# Refresh:
pip-compile --upgrade requirements/base.in           # all bumps within ranges
pip-compile --upgrade-package httpx requirements/base.in   # just one
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - pip-tools as the lockfile in pip-only orgs; constraint files for monorepos; CI verifies hashes; Renovate/Dependabot for refresh PRs.
# STRENGTHS - Works in air-gapped / corp-mirror setups where uv adoption lags; tight supply-chain story.
# WEAKNESSES- pip-compile resolver is slower and less feature-rich than uv/poetry; Python-version drift between compile and install can cause skewed wheels.
# Constraints across multiple services in a monorepo:
#   constraints.txt   <- single source of truth for shared lib floors
#   service-a/requirements.in (uses -c ../constraints.txt)
#   service-b/requirements.in (uses -c ../constraints.txt)
#
# pip-compile --pip-args='--no-color' --strip-extras --resolver=backtracking \
#   --generate-hashes \
#   --output-file requirements/prod.txt \
#   requirements/prod.in

# CI invariants (.github/workflows/ci.yml):
#   - run: pip install pip-tools==7.4.1
#   - run: pip-compile --check requirements/prod.in              # FAIL if drift
#   - run: pip install --require-hashes -r requirements/prod.txt
#   - run: pytest -q

# Renovate config (.github/renovate.json):
# {
#   "extends": ["config:base"],
#   "pip-compile": { "fileMatch": ["(^|/)requirements/.+\\.in$"] },
#   "schedule": ["before 6am on monday"]
# }

# Decision rule:
#   pip-only org with no migration budget       -> pip-tools + --generate-hashes + --require-hashes
#   adopting modern tooling                     -> uv (faster, single tool, deterministic)
#   need fully reproducible CI without uv       -> pip-tools with hashes; pin pip-tools version itself
#   layered service deps in a monorepo          -> -c constraints.txt across services; one source of truth
#   security audit asks for SBOM                -> pip-audit reads requirements.txt; CycloneDX exporters supported
#   cross-platform wheels (Linux + macOS + Win) -> pip-compile per platform OR drop hashes (lossy)
#
# Anti-pattern: editing requirements.txt by hand to "fix" a version. The next
# pip-compile rewrites your edit and the team blames the tool. Edit the .in file,
# recompile, commit BOTH .in and .txt -- never just the .txt.
```

## Decision Rule

```text
pip-only org with no migration budget       -> pip-tools + --generate-hashes + --require-hashes
adopting modern tooling                     -> uv (faster, single tool, deterministic)
need fully reproducible CI without uv       -> pip-tools with hashes; pin pip-tools version itself
layered service deps in a monorepo          -> -c constraints.txt across services; one source of truth
security audit asks for SBOM                -> pip-audit reads requirements.txt; CycloneDX exporters supported
cross-platform wheels (Linux + macOS + Win) -> pip-compile per platform OR drop hashes (lossy)
```

## Anti-Pattern

> [!warning] Anti-pattern
> editing requirements.txt by hand to "fix" a version. The next
> pip-compile rewrites your edit and the team blames the tool. Edit the .in file,
> recompile, commit BOTH .in and .txt -- never just the .txt.

## Tips

- pip-compile locks transitive dependencies — if httpx needs urllib3, both get pinned in requirements.txt.
- Commit requirements.txt to git — it's the single source of truth for reproducible builds.
- pip-sync only installs what's in requirements.txt, removing unlisted packages.
- For CI/CD, use `pip-compile --generate-hashes` and install with `pip install --require-hashes -r requirements.txt` for supply-chain protection; layer .in files (base/dev/prod) with `-c constraints.txt` for monorepos.

## Common Mistake

> [!warning] Editing requirements.txt by hand to "fix" a version — the next pip-compile rewrites your edit and the team blames the tool. Edit the .in file, recompile, commit BOTH .in and .txt.

## Shorthand (Junior → Senior)

**Junior:**
```python
pip install pip-tools
pip-compile requirements.in
pip install -r requirements.txt
```

**Senior:**
```python
pip-compile && pip-sync
```

## See Also

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/_Index|Packaging, CLI & Tooling → Modern Packaging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

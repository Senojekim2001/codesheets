---
type: "entry"
domain: "python"
file: "packaging"
section: "distribution"
id: "publishing-pypi"
title: "Publishing to PyPI — Build, Upload, Versioning"
category: "Publishing"
subtitle: "build, twine, TestPyPI, versioning, .pypirc, tokens"
signature_short: "python -m build  |  twine check dist/*  |  twine upload dist/*"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Publishing to PyPI — Build, Upload, Versioning"
  - "publishing-pypi"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/distribution"
  - "category/publishing"
  - "tier/tiered"
---

# Publishing to PyPI — Build, Upload, Versioning

> build, twine, TestPyPI, versioning, .pypirc, tokens

## Overview

Publishing to PyPI makes your package installable via pip. Workflow: (1) build wheel and sdist, (2) test on TestPyPI, (3) publish to PyPI. Use semantic versioning (MAJOR.MINOR.PATCH). Store credentials in ~/.pypirc or use API tokens (not passwords). Package names on PyPI are permanent — test thoroughly before publishing.

## Signature

```python
python -m build  |  twine check dist/*  |  twine upload dist/*
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Build artifacts with python -m build, validate, upload to TestPyPI first, then PyPI.
# STRENGTHS - Two artifacts (wheel + sdist) cover all installers; TestPyPI catches metadata bugs.
# WEAKNESSES- PyPI names + versions are PERMANENT once uploaded -- no edits, no re-uploads.
pip install --upgrade build twine

# Bump version in pyproject.toml (e.g., 1.0.0 -> 1.1.0).
python -m build                      # writes dist/pkg-1.1.0.tar.gz + pkg-1.1.0-*.whl
twine check dist/*                   # catches missing README, bad classifiers
twine upload -r testpypi dist/*      # upload to TestPyPI first
twine upload dist/*                  # then production PyPI
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - API tokens (not passwords), version derived from VCS, classifiers + URLs for discoverability.
# STRENGTHS - Tokens are scoped and revocable; VCS-driven version eliminates "I forgot to bump" bugs.
# WEAKNESSES- Tokens checked into CI logs leak; prefer trusted publishing on hosted CI.
# Set token via env var (NEVER commit .pypirc with real tokens):
# export TWINE_USERNAME="__token__"
# export TWINE_PASSWORD="pypi-AgEI..."

# pyproject.toml additions for discoverability:
# [project.urls]
# Source        = "https://github.com/me/my-package"
# Issues        = "https://github.com/me/my-package/issues"
# Documentation = "https://my-package.readthedocs.io"
# Changelog     = "https://github.com/me/my-package/blob/main/CHANGELOG.md"
#
# classifiers = [
#     "Development Status :: 5 - Production/Stable",
#     "Programming Language :: Python :: 3.11",
#     "Programming Language :: Python :: 3.12",
#     "License :: OSI Approved :: MIT License",
#     "Operating System :: OS Independent",
# ]

# Version from git tag via hatch-vcs (or setuptools-scm):
# [build-system]
# requires      = ["hatchling", "hatch-vcs"]
# build-backend = "hatchling.build"
#
# [tool.hatch.version]
# source = "vcs"

# Workflow:
git tag -a v1.1.0 -m "Release 1.1.0"
git push --tags
python -m build                       # version comes from the tag
twine check dist/*
twine upload --skip-existing dist/*   # safe re-runs

# Local install verification:
pip install --upgrade my-package==1.1.0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Trusted Publishing (OIDC) from CI, signed releases, SBOM, multi-wheel matrix via cibuildwheel.
# STRENGTHS - No secrets in CI; audit trail; native wheels for every platform and Python version.
# WEAKNESSES- Trusted publishing requires PyPI project pre-registration tied to repo+workflow; first release still uses a token.
# 1) PyPI project setup (one-time, in pypi.org UI):
#    Project -> Publishing -> Add a new publisher
#    Workflow: release.yml; Environment: pypi; Owner/Repo as appropriate.

# 2) .github/workflows/release.yml:
#    on:
#      release:
#        types: [published]
#    jobs:
#      build:
#        runs-on: ubuntu-latest
#        steps:
#          - uses: actions/checkout@v4
#          - uses: astral-sh/setup-uv@v3
#          - run: uv build                          # wheel + sdist
#          - uses: actions/upload-artifact@v4
#            with: { name: dist, path: dist/ }
#
#      publish:
#        needs: build
#        runs-on: ubuntu-latest
#        environment: pypi                          # required for trusted publishing
#        permissions:
#          id-token: write                          # OIDC token issuance
#        steps:
#          - uses: actions/download-artifact@v4
#            with: { name: dist, path: dist/ }
#          - uses: pypa/gh-action-pypi-publish@release/v1
#            # NO username, NO password, NO secrets

# 3) Native wheels with cibuildwheel for C/Rust extensions:
#    [tool.cibuildwheel]
#    build = "cp311-* cp312-* cp313-*"
#    skip  = "*-musllinux_i686 *-win32"
#    test-command = "pytest {project}/tests"
#    test-requires = ["pytest"]
#  CI matrix produces manylinux/macOS/Windows wheels in one workflow.

# 4) Pre-flight checks BEFORE pushing the tag:
twine check dist/*                                    # metadata / README rendering
python -m build --sdist && tar -tzf dist/*.tar.gz     # confirm files included
pip install dist/*.whl && python -c "import my_package; print(my_package.__version__)"

# 5) Yanking is a release of last resort -- 'twine upload' cannot delete:
#    pypi yank my-package==1.1.0 --reason "ships broken metadata"
#    Bump to 1.1.1 with a real fix; 1.1.0 stays installed for those who pinned it.

# Decision rule:
#   first manual release                       -> token in .pypirc, scoped to that one project
#   ongoing CI releases                        -> Trusted Publishing (OIDC), no secrets
#   pure Python                                -> python -m build (or uv build); upload sdist + wheel
#   C / Rust / native                          -> cibuildwheel + maturin; matrix produces all wheels
#   reproducible builds                        -> SOURCE_DATE_EPOCH from git commit; deterministic zip
#   security audit                             -> generate SBOM (cyclonedx-bom or pip-audit), sign artifacts (sigstore)
#   private corp index                         -> twine upload --repository-url + creds via OIDC or vault
#
# Anti-pattern: editing version, building, and uploading from a developer
# laptop. The wheel reflects the dev's environment (debug libs, transient
# patches), and credentials live in shell history. Build and publish from CI
# only; treat 'git tag' as the release trigger.
```

## Decision Rule

```text
first manual release                       -> token in .pypirc, scoped to that one project
ongoing CI releases                        -> Trusted Publishing (OIDC), no secrets
pure Python                                -> python -m build (or uv build); upload sdist + wheel
C / Rust / native                          -> cibuildwheel + maturin; matrix produces all wheels
reproducible builds                        -> SOURCE_DATE_EPOCH from git commit; deterministic zip
security audit                             -> generate SBOM (cyclonedx-bom or pip-audit), sign artifacts (sigstore)
private corp index                         -> twine upload --repository-url + creds via OIDC or vault
```

## Anti-Pattern

> [!warning] Anti-pattern
> editing version, building, and uploading from a developer
> laptop. The wheel reflects the dev's environment (debug libs, transient
> patches), and credentials live in shell history. Build and publish from CI
> only; treat 'git tag' as the release trigger.

## Tips

- Use Trusted Publishing (OIDC) for ongoing CI releases — no PYPI_TOKEN secret in the repo, full audit trail. Tokens are still fine for the first manual release.
- Test on TestPyPI first — you can't delete or re-upload a version on PyPI. Names are permanent. To retract a broken release after the fact, `pypi yank pkg==1.1.0 --reason "..."` keeps it for pinned users but stops new installs; bump and ship 1.1.1.
- python -m build creates both .tar.gz (sdist) and .whl (wheel) — always upload both for compatibility. For C / Rust extensions, use cibuildwheel (or maturin) so CI produces manylinux/macOS/Windows wheels in one workflow.
- Use semantic versioning — it tells users what changed (breaking, feature, bugfix).

## Common Mistake

> [!warning] Editing version, building, and uploading from a developer laptop — the wheel reflects the dev's environment (debug libs, transient patches), and credentials live in shell history. Build and publish from CI only; treat `git tag` as the release trigger.

## Shorthand (Junior → Senior)

**Junior:**
```python
python -m build
twine check dist/*
twine upload -r testpypi dist/*
pip install -i https://test.pypi.org/simple/ my-package==1.0.0
twine upload dist/*
```

**Senior:**
```python
python -m build && twine upload dist/*
```

## See Also

- [[Sections/packaging/distribution/_Index|Packaging, CLI & Tooling → Distribution & Publishing]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

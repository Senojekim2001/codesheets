---
type: "entry"
domain: "python"
file: "packaging"
section: "dev-tools"
id: "pre-commit"
title: "pre-commit — Hooks for Linting, Testing, Type Checking"
category: "Development"
subtitle: "pre-commit, hooks, .pre-commit-config.yaml, auto-fix"
signature_short: "pre-commit install  |  pre-commit run --all-files"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pre-commit — Hooks for Linting, Testing, Type Checking"
  - "pre-commit"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/dev-tools"
  - "category/development"
  - "tier/tiered"
---

# pre-commit — Hooks for Linting, Testing, Type Checking

> pre-commit, hooks, .pre-commit-config.yaml, auto-fix

## Overview

pre-commit is a framework that runs linting, formatting, and testing hooks automatically before commits. Define hooks in .pre-commit-config.yaml, run pre-commit install to set up git hooks, and they run automatically. Prevents committing broken code, style violations, or security issues. Common hooks: ruff, mypy, black, pytest, bandit.

## Signature

```python
pre-commit install  |  pre-commit run --all-files
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Add .pre-commit-config.yaml with ruff + basic hygiene; run 'pre-commit install' once.
# STRENGTHS - Cheap, automated guardrail before every commit; same checks as CI.
# WEAKNESSES- Hooks live in a separate venv; first run is slow while it bootstraps.
# .pre-commit-config.yaml ─────────────────────────
# repos:
#   - repo: https://github.com/astral-sh/ruff-pre-commit
#     rev: v0.6.9
#     hooks:
#       - id: ruff
#         args: [--fix]
#       - id: ruff-format
#
#   - repo: https://github.com/pre-commit/pre-commit-hooks
#     rev: v5.0.0
#     hooks:
#       - id: trailing-whitespace
#       - id: end-of-file-fixer
#       - id: check-yaml
#       - id: check-merge-conflict

# One-time setup:
pip install pre-commit
pre-commit install                  # installs the git hook
pre-commit run --all-files          # run hooks on the whole repo
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-stage hooks: fast on commit, slow checks on push; separate types_or for files; pin every rev.
# STRENGTHS - Same config drives developer machines AND CI (pre-commit ci or 'pre-commit run --all-files' in pipeline).
# WEAKNESSES- 'autoupdate' bumps revs but not their pinned dependencies; review diffs.
# .pre-commit-config.yaml ─────────────────────────
# default_language_version:
#   python: python3.12
# default_stages: [pre-commit]
# fail_fast: false
#
# repos:
#   - repo: https://github.com/astral-sh/ruff-pre-commit
#     rev: v0.6.9
#     hooks:
#       - id: ruff
#         args: [--fix, --exit-non-zero-on-fix]
#       - id: ruff-format
#
#   - repo: https://github.com/pre-commit/mirrors-mypy
#     rev: v1.13.0
#     hooks:
#       - id: mypy
#         additional_dependencies: [pydantic, types-requests, types-PyYAML]
#         args: [--strict, --show-error-codes]
#         stages: [pre-push]            # slow -> only on push
#
#   - repo: https://github.com/pre-commit/pre-commit-hooks
#     rev: v5.0.0
#     hooks:
#       - id: check-added-large-files
#         args: [--maxkb=500]
#       - id: detect-private-key
#       - id: debug-statements          # catches stray pdb.set_trace
#
#   - repo: https://github.com/python-jsonschema/check-jsonschema
#     rev: 0.29.4
#     hooks:
#       - id: check-github-workflows
#
#   - repo: local
#     hooks:
#       - id: pytest-fast
#         name: pytest -m 'not slow'
#         entry: pytest
#         language: system
#         pass_filenames: false
#         args: [-q, -m, "not slow"]
#         stages: [pre-push]

# Daily usage:
pre-commit run --all-files          # run on whole repo
pre-commit autoupdate               # bump rev pins (review diff!)
git commit -m "msg" --no-verify     # bypass hooks ONLY in emergencies
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pre-commit as the "fast lane" of the lint pyramid: format/syntax in commit, types/security in push, full tests in CI; pre-commit.ci for hosted enforcement.
# STRENGTHS - Single source of hooks; pre-commit.ci auto-fixes PRs, CI re-runs the same hooks, dev gets identical results locally.
# WEAKNESSES- Mypy in pre-commit installs deps every cache miss; pin additional_dependencies AND consider running mypy ONLY in CI on big repos.
# Production .pre-commit-config.yaml ─────────────
# ci:                                  # for pre-commit.ci hosted service
#   autofix_commit_msg: "style: pre-commit auto-fixes"
#   autoupdate_schedule: weekly
#   skip: [pytest-fast, mypy]          # skip slow hooks in the hosted runner
#
# default_language_version:
#   python: python3.12
#
# repos:
#   # ── Fast (always-on, runs at commit) ─────────
#   - repo: https://github.com/astral-sh/ruff-pre-commit
#     rev: v0.6.9
#     hooks:
#       - { id: ruff, args: [--fix, --exit-non-zero-on-fix] }
#       - { id: ruff-format }
#
#   - repo: https://github.com/pre-commit/pre-commit-hooks
#     rev: v5.0.0
#     hooks:
#       - { id: trailing-whitespace }
#       - { id: end-of-file-fixer }
#       - { id: check-merge-conflict }
#       - { id: detect-private-key }
#       - { id: check-added-large-files, args: [--maxkb=500] }
#       - { id: check-yaml,  args: [--unsafe] }    # GH actions need !!ref tags
#       - { id: check-toml }
#       - { id: debug-statements }
#
#   # ── Security ─────────────────────────────────
#   - repo: https://github.com/gitleaks/gitleaks
#     rev: v8.18.4
#     hooks:
#       - id: gitleaks
#
#   # ── Types (pre-push to keep commit fast) ─────
#   - repo: https://github.com/pre-commit/mirrors-mypy
#     rev: v1.13.0
#     hooks:
#       - id: mypy
#         additional_dependencies:
#           - pydantic==2.9.2
#           - types-requests==2.32.0.20240914
#         args: [--strict, --show-error-codes, --warn-unused-ignores]
#         stages: [pre-push]
#
#   # ── Local fast tests ─────────────────────────
#   - repo: local
#     hooks:
#       - id: pytest-fast
#         name: pytest -m 'not slow'
#         entry: pytest
#         language: system
#         pass_filenames: false
#         args: [-q, -m, "not slow"]
#         stages: [pre-push]

# Hooks for git operations beyond commit:
#   stages: [commit-msg]    -> conventional-commits validator
#   stages: [post-checkout] -> rebuild .venv if pyproject changed (use sparingly)

# CI mirroring (.github/workflows/ci.yml):
# - uses: actions/checkout@v4
# - uses: actions/setup-python@v5
# - uses: pre-commit/[email protected]    # runs ALL hooks, no skips

# Decision rule:
#   keep commit time < 2s                   -> only formatters / cheap checks at 'pre-commit' stage
#   slow checks (mypy, pytest, bandit)      -> 'pre-push' stage
#   hosted auto-fix on PRs                  -> pre-commit.ci (free for OSS) + 'ci.skip' for slow hooks
#   secret detection                        -> gitleaks hook + GitHub secret scanning, both, belt+braces
#   monorepo / nx-style staged files        -> 'files:' regex + 'types_or:' to scope hooks
#   org-wide enforcement                     -> ship a shared .pre-commit-config.yaml via 'extends:'
#                                             (pre-commit doesn't natively support extends; copy + check-in)
#
# Anti-pattern: routine 'git commit --no-verify'. If the hooks are too slow,
# move them to 'pre-push' or CI. If they're noisy, fix the rule. Bypassing
# becomes the team's habit; the hooks become wallpaper.
```

## Decision Rule

```text
keep commit time < 2s                   -> only formatters / cheap checks at 'pre-commit' stage
slow checks (mypy, pytest, bandit)      -> 'pre-push' stage
hosted auto-fix on PRs                  -> pre-commit.ci (free for OSS) + 'ci.skip' for slow hooks
secret detection                        -> gitleaks hook + GitHub secret scanning, both, belt+braces
monorepo / nx-style staged files        -> 'files:' regex + 'types_or:' to scope hooks
org-wide enforcement                     -> ship a shared .pre-commit-config.yaml via 'extends:'
                                          (pre-commit doesn't natively support extends; copy + check-in)
```

## Anti-Pattern

> [!warning] Anti-pattern
> routine 'git commit --no-verify'. If the hooks are too slow,
> move them to 'pre-push' or CI. If they're noisy, fix the rule. Bypassing
> becomes the team's habit; the hooks become wallpaper.

## Tips

- pre-commit hooks run before commit — catch errors before they go to git.
- args: [--fix] enables auto-fixing — ruff will fix issues automatically.
- pre-commit autoupdate keeps hooks up-to-date with latest versions.
- Use multi-stage hooks: cheap formatters at `pre-commit` to keep commits under 2s, slow checks (mypy, pytest, gitleaks for secrets) at `pre-push`. Hosted pre-commit.ci can auto-fix PRs with the same config.

## Common Mistake

> [!warning] Routine `git commit --no-verify` to bypass slow hooks — it becomes a team habit and the hooks turn into wallpaper. If they're too slow, move them to pre-push or CI; if they're noisy, fix the rule.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual workflow:
flake8 .
black .
mypy src
pytest
# ... all before each commit
```

**Senior:**
```python
# Automatic via pre-commit:
pre-commit install
# Runs linting, formatting, type checks, tests automatically
```

## See Also

- [[Sections/packaging/dev-tools/_Index|Packaging, CLI & Tooling → Development Tools]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

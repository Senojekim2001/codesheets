---
type: "entry"
domain: "python"
file: "packaging"
section: "dev-tools"
id: "ruff-linting"
title: "ruff — The Fast Linter & Formatter"
category: "Linting"
subtitle: "ruff check, ruff format, configuration, rule selection"
signature_short: "ruff check .  |  ruff format .  |  ruff check --fix"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ruff — The Fast Linter & Formatter"
  - "ruff-linting"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/dev-tools"
  - "category/linting"
  - "tier/tiered"
---

# ruff — The Fast Linter & Formatter

> ruff check, ruff format, configuration, rule selection

## Overview

ruff is a Rust-based linter and formatter, 10-100x faster than flake8 + black + isort. Single tool replaces flake8, pylint, black, isort, and more. Configured in pyproject.toml [tool.ruff]. Supports hundreds of linting rules. --fix auto-fixes issues. Perfect for CI/CD and development workflows.

## Signature

```python
ruff check .  |  ruff format .  |  ruff check --fix
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ruff check (lint) + ruff format (formatter); --fix auto-applies safe changes.
# STRENGTHS - One Rust binary replaces flake8 + black + isort; near-instant feedback.
# WEAKNESSES- Default rule set is small; you must opt into the rules you actually want.
pip install ruff

ruff check .             # lint
ruff check --fix .       # auto-fix safe issues
ruff format .            # format (black-compatible)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Curated rule set in pyproject.toml; per-file overrides; --output-format=github for CI annotations.
# STRENGTHS - One source of truth across editor, pre-commit, CI; readable PR diffs.
# WEAKNESSES- New ruff versions add rules; pin the version or pre-commit will surprise you.
# pyproject.toml ─────────────────────────────────────
# [tool.ruff]
# line-length    = 100
# target-version = "py311"
# extend-exclude = [".venv", "build", "dist", "migrations"]
#
# [tool.ruff.lint]
# select = [
#   "E", "F", "W",      # pycodestyle / Pyflakes
#   "I",                # isort
#   "UP",               # pyupgrade (use modern syntax)
#   "B",                # bugbear (likely bugs)
#   "C4",               # comprehensions
#   "PT",               # pytest style
#   "SIM",              # simplifications
#   "RUF",              # ruff-only
# ]
# ignore = ["E501"]     # line length is the formatter's job
#
# [tool.ruff.lint.per-file-ignores]
# "__init__.py"      = ["F401"]    # re-exports
# "tests/**/*.py"    = ["S101"]    # asserts allowed
# "src/scripts/**"   = ["T201"]    # print() OK in scripts
#
# [tool.ruff.format]
# quote-style = "double"

# CI snippet (.github/workflows/ci.yml):
# - run: ruff check --output-format=github .       # GitHub annotations
# - run: ruff format --check .                       # fail if not formatted
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Strict-by-default ruleset, security rules, ratchet-only enforcement, custom plugins via per-rule autofix policy.
# STRENGTHS - One config drives editor / CI / pre-commit; ratchet keeps legacy code from regressing without forcing a big bang fix.
# WEAKNESSES- Some rule families overlap (SIM vs PERF); review the full rule list quarterly to prune overlaps.
# Production pyproject.toml ──────────────────────────
# [tool.ruff]
# line-length    = 100
# target-version = "py312"
# preview        = true
#
# [tool.ruff.lint]
# select = [
#   "E", "F", "W", "I",    # core
#   "B",   "BLE",          # bugbear, blind except
#   "C4",  "C90",           # comprehensions, complexity
#   "DTZ",                  # tz-aware datetimes
#   "G",                    # logging strings
#   "ISC",                  # implicit string concat
#   "PT",  "PTH",           # pytest, pathlib
#   "RUF", "UP", "SIM",
#   "S",                    # bandit-equivalent security
#   "ASYNC",                # asyncio anti-patterns
#   "TID",                  # tidy imports
#   "TRY",                  # exception handling smells
#   "PERF",                 # perf footguns
# ]
# ignore = [
#   "E501",                 # formatter owns line length
#   "TRY003",               # 'raise X("msg")' is fine in libraries
#   "S101",                 # asserts allowed at top level (we config per-file)
# ]
# unfixable = ["B", "F841"] # never auto-fix bugbear / unused vars; humans review
#
# [tool.ruff.lint.flake8-tidy-imports]
# ban-relative-imports = "all"
#
# [tool.ruff.lint.flake8-bandit]
# check-typed-exception = true
#
# [tool.ruff.lint.mccabe]
# max-complexity = 10
#
# [tool.ruff.lint.per-file-ignores]
# "tests/**/*.py" = ["S101", "S105", "PLR2004"]    # asserts, hardcoded creds, magic numbers
# "src/migrations/*.py" = ["E402", "F401"]
# "src/__init__.py"     = ["F401"]
#
# [tool.ruff.format]
# quote-style          = "double"
# docstring-code-format = true     # format code blocks in docstrings too

# Ratchet pattern: lock baseline of existing violations, fail only on regressions.
# 1) ruff check --statistics > .ruff-baseline      (commit; treat as the budget)
# 2) CI runs: ruff check --statistics | diff -u .ruff-baseline -    (fail on additions)
# 3) Periodic cleanup PRs reduce the baseline.

# Pre-commit pinning -- the version is part of the contract:
# - repo: https://github.com/astral-sh/ruff-pre-commit
#   rev: v0.6.9                                     # PIN
#   hooks:
#     - id: ruff
#       args: [--fix, --exit-non-zero-on-fix]
#     - id: ruff-format

# Decision rule:
#   want one tool for lint+format          -> ruff (replace flake8/black/isort/pyupgrade)
#   need fast feedback in editor           -> ruff lsp / ruff-server
#   gating new commits                     -> pre-commit + CI both run 'ruff check' + 'ruff format --check'
#   adopting on a legacy codebase           -> ratchet via baseline diff; do NOT --fix the world in one PR
#   security smells                        -> enable 'S' rules; pair with bandit only if you need its CWE mapping
#   custom org-wide rules                  -> contribute upstream OR maintain a separate linter; ruff has no plugin API yet
#
# Anti-pattern: ruff check --fix on a dirty working tree, in CI, with a stale
# config. The fixer rewrites code; if a rule was wrong, you can't tell what
# came from review and what came from the bot. Run 'ruff check' in CI; run
# '--fix' locally before commit, ideally via pre-commit.
```

## Decision Rule

```text
want one tool for lint+format          -> ruff (replace flake8/black/isort/pyupgrade)
need fast feedback in editor           -> ruff lsp / ruff-server
gating new commits                     -> pre-commit + CI both run 'ruff check' + 'ruff format --check'
adopting on a legacy codebase           -> ratchet via baseline diff; do NOT --fix the world in one PR
security smells                        -> enable 'S' rules; pair with bandit only if you need its CWE mapping
custom org-wide rules                  -> contribute upstream OR maintain a separate linter; ruff has no plugin API yet
```

## Anti-Pattern

> [!warning] Anti-pattern
> ruff check --fix on a dirty working tree, in CI, with a stale
> config. The fixer rewrites code; if a rule was wrong, you can't tell what
> came from review and what came from the bot. Run 'ruff check' in CI; run
> '--fix' locally before commit, ideally via pre-commit.

## Tips

- ruff is 10-100x faster than flake8/black/isort combined — single tool for all linting and formatting.
- ruff format is black-compatible — it produces identical output.
- ruff check --fix auto-fixes most issues — use it in pre-commit hooks LOCALLY, not in CI (CI should run `ruff check` and fail; --fix in CI hides what came from review vs the bot).
- Start with default rules (E, F, W, I) and add more as your team scales. On legacy codebases, adopt via the ratchet pattern: lock today's violations as a baseline and fail only on regressions, not all current issues.

## Common Mistake

> [!warning] `ruff check --fix` in CI on a dirty tree with a stale config — the fixer rewrites code; if a rule is wrong, you can't tell what came from review and what came from the bot. Run check (no fix) in CI; run --fix locally via pre-commit. Mark security/bugbear rules `unfixable` so humans review.

## Shorthand (Junior → Senior)

**Junior:**
```python
flake8 .
black .
isort .
```

**Senior:**
```python
ruff check --fix && ruff format .
```

## See Also

- [[Sections/packaging/dev-tools/_Index|Packaging, CLI & Tooling → Development Tools]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "testing"
section: "advanced"
id: "cov-config"
title: "pytest-cov configuration"
category: "Advanced"
subtitle: ".coveragerc or pyproject.toml — omit, fail_under, report formats"
signature_short: "pytest --cov=myapp --cov-report=html --cov-fail-under=80"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest-cov configuration"
  - "cov-config"
tags:
  - "python"
  - "python/testing"
  - "python/testing/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# pytest-cov configuration

> .coveragerc or pyproject.toml — omit, fail_under, report formats

## Overview

pytest-cov generates coverage reports. Configure via .coveragerc or pyproject.toml to omit test files, migrations, and virtual envs. fail_under= enforces a minimum coverage threshold in CI. HTML reports show exactly which lines are missed.

## Signature

```python
pytest --cov=myapp --cov-report=html --cov-fail-under=80
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The minimum coverage config in pyproject.toml
# STRENGTHS - Three sections; works the same on every dev machine and CI
# WEAKNESSES- No exclusions, no formats beyond terminal
#
# pyproject.toml
# [tool.pytest.ini_options]
# addopts = "--cov=myapp --cov-report=term-missing"
#
# [tool.coverage.run]
# source = ["myapp"]
#
# [tool.coverage.report]
# show_missing = true

# Now: just $ pytest
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Production-ready pyproject config: omit, branch, fail_under, exclusions
# STRENGTHS - The shape every real project converges on
# WEAKNESSES- No xml/html report toggling; no parallel coverage
#
# pyproject.toml
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]
# addopts   = "--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80"
#
# [tool.coverage.run]
# source = ["myapp"]
# branch = true
# omit   = [
#     "*/tests/*",
#     "*/migrations/*",
#     "*/__init__.py",
#     "myapp/_vendor/*",
# ]
#
# [tool.coverage.report]
# show_missing = true
# skip_covered = false
# precision    = 1
# exclude_lines = [
#     "pragma: no cover",
#     "if TYPE_CHECKING:",
#     "raise NotImplementedError",
#     "if __name__ == .__main__.:",
# ]

# Per-line exclusion still works in code
from typing import TYPE_CHECKING
if TYPE_CHECKING:                           # pragma: no cover
    from .types import Heavy
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - HTML+XML reports, parallel coverage, .coveragerc vs pyproject, plugins
# STRENGTHS - The hardening that keeps coverage fast and trustworthy at scale
# WEAKNESSES- N/A
#
# pyproject.toml — full config
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]
# addopts   = "--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80"
# markers   = [
#     "slow: deselected by default",
#     "integration: hits external systems",
# ]
#
# [tool.coverage.run]
# source       = ["myapp"]
# branch       = true
# parallel     = true                       # writes per-process .coverage.* files
# concurrency  = ["thread", "multiprocessing"]
# omit         = ["*/tests/*", "*/migrations/*"]
# plugins      = ["coverage_conditional_plugin"]   # version-gated coverage rules
#
# [tool.coverage.report]
# fail_under   = 80
# show_missing = true
# precision    = 1
# exclude_lines = [
#     "pragma: no cover",
#     "if TYPE_CHECKING:",
#     "raise NotImplementedError",
# ]
#
# [tool.coverage.html]
# directory = "htmlcov"
#
# [tool.coverage.xml]
# output = "coverage.xml"

# CI workflow (GitHub Actions sketch):
#   - run: pytest -n auto --cov-append
#   - run: coverage combine
#   - run: coverage xml
#   - run: coverage report --fail-under=80
#   - uses: codecov/codecov-action@v4

# Decision rule:
#   single-process pytest                  -> default config; one .coverage file
#   xdist / parallel runners                -> parallel = true, then coverage combine
#   want PR diff feedback                   -> coverage xml + diff-cover or codecov
#   conditional code (py 3.11 only path)    -> coverage_conditional_plugin
#   tests in same repo as code              -> always omit tests/ from source
#   pure-Python lib                          -> drop --cov-branch only on perf-critical builds
#
# Anti-pattern: keeping settings in BOTH pyproject.toml AND .coveragerc
#   The two files override each other unpredictably. Pick ONE — pyproject.toml
#   is the modern choice. Migrate everything; delete the other.
```

## Decision Rule

```text
single-process pytest                  -> default config; one .coverage file
xdist / parallel runners                -> parallel = true, then coverage combine
want PR diff feedback                   -> coverage xml + diff-cover or codecov
conditional code (py 3.11 only path)    -> coverage_conditional_plugin
tests in same repo as code              -> always omit tests/ from source
pure-Python lib                          -> drop --cov-branch only on perf-critical builds
```

## Anti-Pattern

> [!warning] Anti-pattern
> keeping settings in BOTH pyproject.toml AND .coveragerc
>   The two files override each other unpredictably. Pick ONE — pyproject.toml
>   is the modern choice. Migrate everything; delete the other.

## Tips

- Add .coveragerc to version control — consistent settings across all developers and CI
- `pragma: no cover` on a line or branch excludes it — use sparingly for truly untestable code
- aim for 80% coverage as a baseline — 100% coverage does not mean no bugs
- HTML report (`--cov-report=html`) shows exactly which lines are not covered — open htmlcov/index.html

## Common Mistake

> [!warning] Chasing 100% coverage at the expense of test quality. Cover the important paths well rather than writing trivial tests just to bump the percentage.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/testing/advanced/hypothesis|Hypothesis (Testing with pytest)]]
- [[Sections/testing/advanced/_Index|Testing with pytest → Advanced Testing]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

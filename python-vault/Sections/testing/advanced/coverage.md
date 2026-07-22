---
type: "entry"
domain: "python"
file: "testing"
section: "advanced"
id: "coverage"
title: "pytest coverage"
category: "Advanced"
subtitle: "pytest-cov — run coverage alongside tests, fail below a threshold"
signature_short: "pytest --cov=myapp --cov-report=term-missing --cov-fail-under=80"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest coverage"
  - "coverage"
tags:
  - "python"
  - "python/testing"
  - "python/testing/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# pytest coverage

> pytest-cov — run coverage alongside tests, fail below a threshold

## Overview

pytest-cov integrates coverage.py with pytest. It measures which lines are executed during tests and reports uncovered lines. Use --cov-fail-under= in CI to prevent coverage regressions.

## Signature

```python
pytest --cov=myapp --cov-report=term-missing --cov-fail-under=80
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One pytest-cov flag, terminal report with missing lines
# STRENGTHS - Smallest valid coverage workflow
# WEAKNESSES- No threshold, no HTML, no branch coverage
#
# pip install pytest-cov

# $ pytest --cov=myapp --cov-report=term-missing
#
# Name              Stmts   Miss  Cover   Missing
# -------------------------------------------------
# myapp/auth.py        45      3   93%    23, 41-42
# myapp/utils.py       18      0  100%
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Branch coverage, HTML report, fail_under in CI, exclude trivial code
# STRENGTHS - The four flags every CI script ends up using
# WEAKNESSES- No multi-package merging, no parallel coverage
#
# Run:
#   $ pytest --cov=myapp --cov-branch --cov-report=html --cov-fail-under=80
#
# --cov-branch        also tracks if/else branch decisions, not just lines
# --cov-report=html   writes htmlcov/index.html — line-by-line view
# --cov-fail-under=80 exits non-zero if total coverage < 80% (CI gate)

# Per-line exclusion
def debug_dump():               # pragma: no cover
    print("dev-only path")

from typing import TYPE_CHECKING
if TYPE_CHECKING:               # pragma: no cover
    from .types import Heavy   # type-checker only — never executed

# Coverage works with parametrize too — each case marks the lines it hit
import pytest
@pytest.mark.parametrize("a,b,expected", [(1, 2, 3), (0, 0, 0)])
def test_add(a, b, expected):
    assert a + b == expected
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Combined parallel coverage, diff coverage on PRs, mutation testing
# STRENGTHS - The advanced workflow that prevents "high coverage, low quality"
# WEAKNESSES- N/A
#
# 1) Parallel test runs — combine partial coverage files at the end
#    $ COVERAGE_PROCESS_START=.coveragerc pytest -n 4 --cov=myapp --cov-append
#    $ coverage combine
#    $ coverage report --fail-under=80

# 2) Diff coverage — only require coverage on lines you JUST changed.
#    Stops the "100% coverage gate" arms race that produces useless tests.
#    $ pip install diff-cover
#    $ pytest --cov=myapp --cov-report=xml
#    $ diff-cover coverage.xml --compare-branch=origin/main --fail-under=90

# 3) Mutation testing — coverage tells you what RAN; mutmut tells you what's
#    actually TESTED. If a mutation survives, your tests don't constrain that line.
#    $ pip install mutmut
#    $ mutmut run --paths-to-mutate=myapp/
#    $ mutmut results

# 4) pyproject.toml — config in source control, not in pytest invocations
# [tool.coverage.run]
# source        = ["myapp"]
# branch        = true
# parallel      = true
# omit          = ["*/migrations/*", "*/tests/*", "*/__init__.py"]
#
# [tool.coverage.report]
# fail_under   = 80
# show_missing = true
# precision    = 1
# exclude_lines = [
#     "pragma: no cover",
#     "raise NotImplementedError",
#     "if TYPE_CHECKING:",
#     "if __name__ == .__main__.:",
# ]
#
# [tool.pytest.ini_options]
# addopts = "--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80"

# Decision rule:
#   small repo, single test runner       -> --cov + --cov-report=term-missing
#   want CI to gate on regressions        -> --cov-fail-under=N
#   want to see if/else paths              -> --cov-branch (always worth it)
#   parallel test runners                  -> --cov-append + coverage combine
#   PRs add code without tests              -> diff-cover with branch comparison
#   "100% coverage but bugs slip through"  -> mutation testing (mutmut / cosmic-ray)
#   browse uncovered lines locally          -> --cov-report=html
#
# Anti-pattern: chasing 100% coverage on getters/setters
#   You hit the number; tests are trivial; bugs still slip through. Branch
#   coverage + diff coverage on changed lines is a better signal than total %.
```

## Decision Rule

```text
small repo, single test runner       -> --cov + --cov-report=term-missing
want CI to gate on regressions        -> --cov-fail-under=N
want to see if/else paths              -> --cov-branch (always worth it)
parallel test runners                  -> --cov-append + coverage combine
PRs add code without tests              -> diff-cover with branch comparison
"100% coverage but bugs slip through"  -> mutation testing (mutmut / cosmic-ray)
browse uncovered lines locally          -> --cov-report=html
```

## Anti-Pattern

> [!warning] Anti-pattern
> chasing 100% coverage on getters/setters
>   You hit the number; tests are trivial; bugs still slip through. Branch
>   coverage + diff coverage on changed lines is a better signal than total %.

## Tips

- Add `--cov-fail-under=80` to CI to create a coverage gate — prevents regressions silently slipping in
- Branch coverage (`--cov-branch`) is more thorough — catches untested if/else paths
- Aim for meaningful coverage — 80% with important paths tested beats 95% with trivial getter/setter tests
- `# pragma: no cover` on a line excludes it from coverage — use for unreachable/legacy code only

## Common Mistake

> [!warning] Chasing 100% coverage by testing trivial getters and setters. Coverage measures lines run, not correctness. Focus on testing behavior, edge cases, and error paths — not line counts.

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

- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/testing/advanced/hypothesis|Hypothesis (Testing with pytest)]]
- [[Sections/testing/advanced/_Index|Testing with pytest → Advanced Testing]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

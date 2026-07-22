---
type: "entry"
domain: "python"
file: "testing"
section: "advanced"
id: "marks-config"
title: "Marks & configuration"
category: "Advanced"
subtitle: "skip, xfail, slow, integration — run subsets without touching test files"
signature_short: "@pytest.mark.slow | pytest -m \"not slow\" | pyproject.toml"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Marks & configuration"
  - "marks-config"
tags:
  - "python"
  - "python/testing"
  - "python/testing/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# Marks & configuration

> skip, xfail, slow, integration — run subsets without touching test files

## Overview

Marks categorize tests so you can run subsets from the command line. Register custom marks in pyproject.toml to avoid warnings. Use skip/xfail for known issues. Configure default options in pyproject.toml so you never have to type long pytest commands.

## Signature

```python
@pytest.mark.slow | pytest -m "not slow" | pyproject.toml
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - skip and skipif on individual tests
# STRENGTHS - Smallest valid use of marks
# WEAKNESSES- No xfail; no custom marks; no config
#
import sys
import pytest

@pytest.mark.skip(reason="not implemented yet")
def test_future_feature():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="unix only")
def test_unix_only():
    ...
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - xfail (known broken), custom marks (slow / integration), select subsets
# STRENGTHS - The mark vocabulary that powers test-suite triage
# WEAKNESSES- No CI-conditional examples
#
import pytest

# xfail — expected failure; test still runs but doesn't break the suite
@pytest.mark.xfail(reason="bug #123, fix in v2")
def test_known_broken():
    assert flaky_thing() == 1

# strict=True — FAIL if it suddenly passes (catches accidental fixes)
@pytest.mark.xfail(strict=True, reason="must remain broken until release")
def test_must_fail():
    assert False

# Custom marks — pytest -m "slow" / -m "not slow"
@pytest.mark.slow
def test_big_computation():
    ...

@pytest.mark.integration
def test_full_api_flow():
    ...

# Selecting subsets at the command line:
#   $ pytest -m slow
#   $ pytest -m "not slow"
#   $ pytest -m "integration and not slow"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Register marks, opt-in flags, conditional fixtures, marker-driven CI
# STRENGTHS - The shape that scales suites past a few hundred tests
# WEAKNESSES- N/A
#
# pyproject.toml — every custom mark must be registered or pytest warns/errors
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]
# addopts   = "-ra --strict-markers --tb=short"
# markers   = [
#     "slow: opt-in via --runslow",
#     "integration: hits real services",
#     "smoke: runs in pre-deploy pipeline",
#     "perf: long-running benchmarks",
# ]

# 1) Custom CLI flag — opt-in for slow tests
# tests/conftest.py
import pytest

def pytest_addoption(parser):
    parser.addoption("--runslow", action="store_true", help="run @slow tests")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--runslow"):
        return
    skip = pytest.mark.skip(reason="needs --runslow")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip)

# 2) Conditional skip — environment-aware
@pytest.mark.skipif("CI" not in os.environ, reason="only meaningful in CI")
def test_only_in_ci(): ...

# 3) Multiple marks compose — AND semantics in -m expressions
@pytest.mark.slow
@pytest.mark.integration
def test_slow_integration(): ...
# $ pytest -m "slow and integration"          only the intersection
# $ pytest -m "slow or integration"           the union

# 4) CI workflow leveraging marks
#   PR checks:    pytest -m "not slow and not integration"   (fast feedback)
#   nightly:      pytest --runslow                            (full suite)
#   pre-deploy:   pytest -m smoke                             (sanity gate)

# Decision rule:
#   permanently disable                 -> @pytest.mark.skip
#   conditionally disable                -> @pytest.mark.skipif(...)
#   tracked-known-broken                  -> @pytest.mark.xfail(strict=True)
#   slow / I/O / external                  -> custom mark + CLI flag to opt in
#   triage layer in CI                      -> multiple marks (smoke / unit / integration)
#   third-party-flaky external test         -> @pytest.mark.flaky from pytest-rerunfailures
#
# Anti-pattern: addopts = "-m 'not slow'" with no way to OPT IN
#   The slow tests never run anywhere — they bit-rot. Pair every "default skip"
#   with a CLI flag or a CI lane that runs them.

import os
def flaky_thing(): return 0
```

## Decision Rule

```text
permanently disable                 -> @pytest.mark.skip
conditionally disable                -> @pytest.mark.skipif(...)
tracked-known-broken                  -> @pytest.mark.xfail(strict=True)
slow / I/O / external                  -> custom mark + CLI flag to opt in
triage layer in CI                      -> multiple marks (smoke / unit / integration)
third-party-flaky external test         -> @pytest.mark.flaky from pytest-rerunfailures
```

## Anti-Pattern

> [!warning] Anti-pattern
> addopts = "-m 'not slow'" with no way to OPT IN
>   The slow tests never run anywhere — they bit-rot. Pair every "default skip"
>   with a CLI flag or a CI lane that runs them.

## Tips

- Register custom marks in `pyproject.toml` — unregistered marks cause `PytestUnknownMarkWarning`
- Use `pytest -m "not slow"` during development for fast feedback — full suite only in CI
- `addopts` in config runs those flags on every `pytest` invocation — no more typing `--tb=short`
- `@pytest.mark.xfail(strict=True)` catches bugs that get silently fixed — forces you to remove the mark

## Common Mistake

> [!warning] Not registering custom marks. Every `@pytest.mark.slow` produces a warning unless the mark is declared in `markers` inside `pyproject.toml` or `pytest.ini`.

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
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/hypothesis|Hypothesis (Testing with pytest)]]
- [[Sections/testing/advanced/_Index|Testing with pytest → Advanced Testing]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

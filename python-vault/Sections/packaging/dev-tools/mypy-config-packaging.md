---
type: "entry"
domain: "python"
file: "packaging"
section: "dev-tools"
id: "mypy-config-packaging"
title: "mypy — Type Checking Configuration"
category: "Typing"
subtitle: "mypy, strict mode, [tool.mypy], py.typed, type: ignore"
signature_short: "mypy src/  |  mypy --strict .  |  py.typed marker"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mypy — Type Checking Configuration"
  - "mypy-config-packaging"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/dev-tools"
  - "category/typing"
  - "tier/tiered"
---

# mypy — Type Checking Configuration

> mypy, strict mode, [tool.mypy], py.typed, type: ignore

## Overview

mypy is the static type checker for Python. Integrates with IDEs for instant feedback. Configure in pyproject.toml [tool.mypy] or mypy.ini. Strict mode enforces comprehensive type annotations (recommended for new projects). py.typed marker signals that your package is type-safe (pip-compatible). Use alongside ruff for complete linting.

## Signature

```python
mypy src/  |  mypy --strict .  |  py.typed marker
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mypy reads [tool.mypy] in pyproject.toml; run on src/; turn on strict mode for new projects.
# STRENGTHS - Catches type errors before they ship; integrates with editors.
# WEAKNESSES- Strict mode raises a lot of errors at first; budget time to fix before turning it on.
pip install mypy

# pyproject.toml ─────────────────────────────────
# [tool.mypy]
# python_version = "3.12"
# strict         = true

# Run:
mypy src/                                # type-check
mypy --show-error-codes src/             # see code names like [arg-type]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Per-module overrides for legacy + third-party; py.typed marker so consumers see your hints; cache for speed.
# STRENGTHS - Gradual adoption; tests don't have to be strictly typed; clean errors in CI.
# WEAKNESSES- Per-module overrides drift -- the legacy carve-out turns permanent if no one revisits.
# pyproject.toml ─────────────────────────────────
# [tool.mypy]
# python_version       = "3.12"
# strict               = true
# warn_unused_ignores  = true
# warn_unreachable     = true
# show_error_codes     = true
# pretty               = true
# files                = ["src", "tests"]
# cache_dir            = ".mypy_cache"
#
# [[tool.mypy.overrides]]
# module = "tests.*"
# disallow_untyped_decorators = false
#
# [[tool.mypy.overrides]]
# module = ["pandas.*", "boto3.*"]
# ignore_missing_imports = true            # 3rd-party without stubs

# Distribute hints (PEP 561):
# Add an EMPTY src/my_package/py.typed file
# Include it in the wheel:
# [tool.hatch.build.targets.wheel.force-include]
# "src/my_package/py.typed" = "my_package/py.typed"

# Targeted suppression (always with the error code):
def parse(raw: str) -> dict:
    import json
    return json.loads(raw)               # type: ignore[no-any-return]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - mypy in CI for the blessed answer, pyright in editor for speed; plugins for ORM/Pydantic; ratchet on legacy modules; ban bare ignores.
# STRENGTHS - Two checkers catch each other's blind spots; plugins type Pydantic/SQLAlchemy correctly; warn_unused_ignores auto-cleans suppressions.
# WEAKNESSES- Plugin versions are coupled to lib versions -- pin both in CI to avoid silent regressions.
# Production [tool.mypy] ────────────────────────
# [tool.mypy]
# python_version       = "3.12"
# strict               = true
# warn_redundant_casts = true
# warn_unreachable     = true
# warn_unused_ignores  = true
# enable_error_code    = ["redundant-expr", "truthy-bool",
#                         "ignore-without-code", "unused-awaitable"]
# disable_error_code   = []                           # be explicit; never []
# show_error_codes     = true
# pretty               = true
# files                = ["src", "tests"]
# plugins              = ["pydantic.mypy", "sqlalchemy.ext.mypy.plugin"]
#
# # Per-module ratchet: legacy modules carry an ISSUE link in the comment.
# [[tool.mypy.overrides]]
# module       = "my_pkg.legacy.*"
# strict       = false
# # TODO(#1234): drop this override by Q3 once tickets close.
#
# [[tool.mypy.overrides]]
# module = ["pandas.*", "redis.*", "celery.*"]
# ignore_missing_imports = true

# Pre-commit / CI invariants:
# - repo: https://github.com/pre-commit/mirrors-mypy
#   rev: v1.13.0                                 # pinned with libs
#   hooks:
#     - id: mypy
#       additional_dependencies:                  # mirror runtime deps
#         - pydantic==2.9.2
#         - sqlalchemy==2.0.36
#         - types-redis==4.6.0.20240903
#       args: [--strict, --show-error-codes, --warn-unused-ignores]

# Editor integration:
#   pyright (built into Pylance) -- fast, instant feedback
#   mypy   (CI)                  -- the source of truth for "did this change pass?"
#   On disagreement: trust mypy if a plugin is involved; investigate if not.

# Decision rule:
#   greenfield project                         -> strict=true from day 1
#   incremental adoption on legacy code        -> per-module overrides + warn_unused_ignores
#   ORM / Pydantic / dataclass-heavy           -> install matching mypy plugin
#   single-line suppression                    -> '# type: ignore[error-code]' (NEVER bare)
#   third-party lib without stubs              -> ignore_missing_imports per-module ONLY
#   "we have 5000 errors, where to start?"     -> enable disallow_untyped_defs first; covers ~70% of bugs
#   need narrowing predicate                   -> TypeIs (3.13+), or TypeGuard on older Python
#
# Anti-pattern: bare '# type: ignore' AND disable_error_code = ["misc", "attr-defined"].
# That's a hide-the-bug machine. Use error-code-scoped ignores; turn on
# warn_unused_ignores so the checker complains when a suppression is no longer
# needed. The suppression list shrinks; the bug count goes with it.
```

## Decision Rule

```text
greenfield project                         -> strict=true from day 1
incremental adoption on legacy code        -> per-module overrides + warn_unused_ignores
ORM / Pydantic / dataclass-heavy           -> install matching mypy plugin
single-line suppression                    -> '# type: ignore[error-code]' (NEVER bare)
third-party lib without stubs              -> ignore_missing_imports per-module ONLY
"we have 5000 errors, where to start?"     -> enable disallow_untyped_defs first; covers ~70% of bugs
need narrowing predicate                   -> TypeIs (3.13+), or TypeGuard on older Python
```

## Anti-Pattern

> [!warning] Anti-pattern
> bare '# type: ignore' AND disable_error_code = ["misc", "attr-defined"].
> That's a hide-the-bug machine. Use error-code-scoped ignores; turn on
> warn_unused_ignores so the checker complains when a suppression is no longer
> needed. The suppression list shrinks; the bug count goes with it.

## Tips

- strict = true enforces comprehensive typing — catch errors at compile time, not runtime.
- py.typed signals type safety to consumers — users of your package get IDE hints.
- Always scope ignores to a specific error code: `# type: ignore[arg-type]`, never bare. Enable `warn_unused_ignores = true` so the checker complains when a suppression is no longer needed.
- mypy + ruff + pytest = complete type checking, linting, and testing. Install matching plugins for ORM/Pydantic-heavy code (`plugins = ["pydantic.mypy", "sqlalchemy.ext.mypy.plugin"]`); pin plugin versions to runtime lib versions in CI.

## Common Mistake

> [!warning] Bare `# type: ignore` plus `disable_error_code = ["misc", "attr-defined"]` — that's a hide-the-bug machine. Use error-code-scoped ignores; turn on warn_unused_ignores so the suppression list shrinks over time. Run mypy in CI as the source of truth and pyright in the editor for speed.

## Shorthand (Junior → Senior)

**Junior:**
```python
[tool.mypy]
python_version = "3.12"
strict = True
```

**Senior:**
```python
mypy --strict src/
```

## See Also

- [[Sections/advanced/typing-dataclasses/typing-advanced|Advanced Type Hints — Protocols, TypeVar, Overload (Advanced Python)]]
- [[Sections/packaging/dev-tools/_Index|Packaging, CLI & Tooling → Development Tools]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]

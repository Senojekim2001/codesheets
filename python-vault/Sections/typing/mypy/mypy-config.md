---
type: "entry"
domain: "python"
file: "typing"
section: "mypy"
id: "mypy-config"
title: "mypy — Configuration, Strict Mode & Common Patterns"
category: "Tooling"
subtitle: "pyproject.toml [tool.mypy], --strict, # type: ignore[code], reveal_type, plugins (mypy.ini is the legacy form)"
signature_short: "mypy src/  |  [mypy]  strict = true  |  # type: ignore[error-code]  |  reveal_type(x)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mypy — Configuration, Strict Mode & Common Patterns"
  - "mypy-config"
tags:
  - "python"
  - "python/typing"
  - "python/typing/mypy"
  - "category/tooling"
  - "tier/tiered"
---

# mypy — Configuration, Strict Mode & Common Patterns

> pyproject.toml [tool.mypy], --strict, # type: ignore[code], reveal_type, plugins (mypy.ini is the legacy form)

## Overview

mypy is the standard Python type checker. Strict mode enables all optional checks (no implicit Any, no untyped defs). Configure in pyproject.toml or mypy.ini. Per-module overrides let you gradually type a codebase. # type: ignore suppresses specific errors (use error codes!). reveal_type() is a debugging tool that shows inferred types. Plugins extend mypy for Django, Pydantic, SQLAlchemy, etc. Run mypy in CI to catch type errors before merge.

## Signature

```python
mypy src/  |  [mypy]  strict = true  |  # type: ignore[error-code]  |  reveal_type(x)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Run mypy on src/, fix the errors, repeat. reveal_type() shows what mypy sees.
# STRENGTHS - Catches type bugs in CI before merge; zero runtime cost.
# WEAKNESSES- Default mode is permissive -- many bugs only surface under --strict.
# Install:    pip install mypy
# Run:        mypy src/

# Debug what mypy infers (remove before commit):
x = [1, 2, 3]
reveal_type(x)   # note: Revealed type is "builtins.list[builtins.int]"

# Suppress a single line you can't easily fix yet -- ALWAYS use the error code.
import some_untyped_lib  # noqa
result = some_untyped_lib.do_thing()  # type: ignore[no-untyped-call]

# Common starter errors:
def bad():        # error: missing return type
    return 42
def good() -> int:
    return 42

items = []                # error: need annotation for empty list
items_typed: list[str] = []
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - pyproject.toml config, per-module overrides for gradual adoption, TYPE_CHECKING for circular imports.
# STRENGTHS - Tighten one module at a time; CI gates only the strict modules.
# WEAKNESSES- Per-module overrides drift -- the legacy carve-out becomes permanent if no one revisits it.
# pyproject.toml ────────────────────────────────────────────────
# [tool.mypy]
# python_version = "3.12"
# strict = true
# warn_unused_configs = true
# warn_unreachable = true
# plugins = ["pydantic.mypy"]
#
# [[tool.mypy.overrides]]
# module = "tests.*"
# disallow_untyped_defs = false      # tests can be looser
#
# [[tool.mypy.overrides]]
# module = "legacy.*"
# ignore_errors = true               # to be removed by Q3
#
# [[tool.mypy.overrides]]
# module = ["pandas.*", "boto3.*"]
# ignore_missing_imports = true      # third-party stubs missing
# ────────────────────────────────────────────────────────────────

# TYPE_CHECKING -- imported only by mypy, not at runtime; breaks import cycles.
from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .heavy import BigModel       # not imported at runtime

def score(model: BigModel) -> float:  # forward ref resolves under typing
    return 0.0

# cast vs assert: cast is silent (mypy-only), assert is enforced at runtime.
from typing import Any, cast
raw: Any = {"k": 1}
typed = cast(dict[str, int], raw)     # mypy: dict[str, int]; runtime: still raw
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - --strict from day one, pyright in editor for speed, mypy in CI for blessed answer, plugins for ORM/DI.
# STRENGTHS - Two checkers catch each other's blind spots; plugins type Pydantic/SQLAlchemy/attrs correctly.
# WEAKNESSES- Plugins are version-coupled -- pin tool versions or releases drift the truth out from under your CI.
# pyproject.toml (production-grade) ──────────────────────────────
# [tool.mypy]
# python_version       = "3.12"
# strict               = true
# warn_unreachable     = true
# warn_redundant_casts = true
# warn_unused_ignores  = true            # forces cleanup of stale suppressions
# enable_error_code    = ["redundant-expr", "truthy-bool",
#                         "ignore-without-code", "unused-awaitable"]
# disable_error_code   = []              # be honest about what you suppress
# show_error_codes     = true
# pretty               = true
# plugins              = ["pydantic.mypy", "sqlalchemy.ext.mypy.plugin"]
# files                = ["src", "tests"]
#
# [[tool.mypy.overrides]]
# module = "tests.*"
# disallow_untyped_decorators = false
#
# # CI invariant: NO file gets quieter than the global. New legacy carve-outs
# # require an issue link in the comment so Reviewdog can flag stale ones.
# ────────────────────────────────────────────────────────────────

# Patterns that survive --strict
import json
from typing import Any, TypeIs, cast

def parse_user(raw: str) -> dict[str, str]:
    data: Any = json.loads(raw)            # json -> Any is honest
    if not _is_str_dict(data):
        raise ValueError("expected JSON object of str -> str")
    return data                            # narrowed by TypeIs

def _is_str_dict(x: object) -> TypeIs[dict[str, str]]:    # 3.13+
    return (isinstance(x, dict)
            and all(isinstance(k, str) and isinstance(v, str) for k, v in x.items()))

# Pre-commit hook (.pre-commit-config.yaml):
# - repo: https://github.com/pre-commit/mirrors-mypy
#   rev: v1.13.0
#   hooks:
#     - id: mypy
#       additional_dependencies: [pydantic, types-requests]
#       args: [--strict, --show-error-codes]

# Decision rule:
#   greenfield project                       -> mypy strict + pyright in editor from day 1
#   legacy import, gradual typing            -> per-module override with explicit owner+date
#   ORM / Pydantic / dataclass-heavy         -> install matching mypy plugin
#   silencing a real bug (cast / Any)        -> add a runtime check that NARROWS, not casts
#   one-off line you cannot fix              -> # type: ignore[error-code]   (NEVER bare)
#   third-party lib without stubs            -> ignore_missing_imports for that module ONLY
#   "we're at 1000 errors, where to start?"  -> disallow_untyped_defs first; that ONE flag finds the most bugs
#
# Anti-pattern: bare '# type: ignore'. It silences EVERY error on the line --
# including ones introduced later by a refactor that you'd want to know about.
# Always 'type: ignore[specific-code]', and turn on warn_unused_ignores so the
# checker complains when the suppression stops being needed.
```

## Decision Rule

```text
greenfield project                       -> mypy strict + pyright in editor from day 1
legacy import, gradual typing            -> per-module override with explicit owner+date
ORM / Pydantic / dataclass-heavy         -> install matching mypy plugin
silencing a real bug (cast / Any)        -> add a runtime check that NARROWS, not casts
one-off line you cannot fix              -> # type: ignore[error-code]   (NEVER bare)
third-party lib without stubs            -> ignore_missing_imports for that module ONLY
"we're at 1000 errors, where to start?"  -> disallow_untyped_defs first; that ONE flag finds the most bugs
```

## Anti-Pattern

> [!warning] Anti-pattern
> bare '# type: ignore'. It silences EVERY error on the line --
> including ones introduced later by a refactor that you'd want to know about.
> Always 'type: ignore[specific-code]', and turn on warn_unused_ignores so the
> checker complains when the suppression stops being needed.

## Tips

- Start with mypy (basic), then enable strict per-module — trying to type an entire codebase at once is overwhelming.
- Always use error codes with type: ignore: # type: ignore[assignment] instead of bare # type: ignore.
- TYPE_CHECKING block solves circular imports — import only for type hints, not runtime.
- reveal_type() is your best debugging tool — use it to see what mypy infers, then remove before committing.

## Common Mistake

> [!warning] Adding # type: ignore without error codes to silence mypy — bare ignores suppress ALL errors on that line, including real bugs you'd want to catch. Always specify: # type: ignore[specific-error].

## Shorthand (Junior → Senior)

**Junior:**
```python
# mypy.ini
[mypy]
python_version = 3.12
disallow_untyped_defs = True
warn_return_any = True
```

**Senior:**
```python
# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
```

## See Also

- [[Sections/typing/mypy/_Index|Type Hints & mypy → mypy Configuration & Patterns]]
- [[Sections/typing/_Index|Type Hints & mypy index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "apis"
section: "http-stdlib"
id: "os-environ"
title: "os.environ"
category: "Standard Library"
subtitle: "os.getenv() for optional, os.environ[] for required"
signature_short: "os.getenv(\"KEY\", \"default\") | os.environ[\"KEY\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "os.environ"
  - "os-environ"
tags:
  - "python"
  - "python/apis"
  - "python/apis/http-stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# os.environ

> os.getenv() for optional, os.environ[] for required

## Overview

Environment variables are the standard place for configuration and secrets in production (12-factor app pattern). os.environ["KEY"] raises KeyError if missing (use for required vars). os.getenv("KEY", default) returns the default if absent.

## Signature

```python
os.getenv("KEY", "default") | os.environ["KEY"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - getenv with default for optional, [] indexing for required
# STRENGTHS - Smallest valid env-var read
# WEAKNESSES- No type coercion; no .env loading
#
import os

port    = int(os.getenv("PORT", "8000"))      # optional, default 8000
db_url  = os.environ["DATABASE_URL"]          # required — KeyError if missing
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - .env for local dev, typed coercion helpers, fail-fast on missing
# STRENGTHS - The shape every CLI / service script lands on
# WEAKNESSES- Manual coercion; pydantic-settings entry handles this better
#
import os
from dotenv import load_dotenv

# Local dev only — load .env from cwd (do NOT call in production)
load_dotenv()                                  # safe no-op if no .env exists

def env_required(key: str) -> str:
    v = os.environ.get(key)
    if not v:
        raise RuntimeError(f"required env var missing: {key}")
    return v

def env_bool(key: str, default: bool = False) -> bool:
    raw = os.getenv(key)
    if raw is None: return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}

DATABASE_URL = env_required("DATABASE_URL")
DEBUG        = env_bool("DEBUG", default=False)
PORT         = int(os.getenv("PORT", "8000"))
ORIGINS      = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

# Test override — set BEFORE importing the module under test
# os.environ["DATABASE_URL"] = "sqlite:///:memory:"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Centralize config behind one boundary, fail at import, prefer pydantic-settings
# STRENGTHS - Patterns that prevent secrets in stack traces and config drift
# WEAKNESSES- N/A
#
import os
from functools import lru_cache
from typing import Iterable

# 1) ONE config module — code never reads os.environ directly. Fakes are trivial.
class _Config:
    DATABASE_URL: str
    SECRET_KEY:   str
    DEBUG:        bool
    PORT:         int
    ENVIRONMENT:  str

def _require(key: str, *, allowed: Iterable[str] | None = None) -> str:
    v = os.environ.get(key)
    if not v:
        raise RuntimeError(f"missing required env var: {key}")
    if allowed and v not in allowed:
        raise RuntimeError(f"{key} must be one of {sorted(allowed)}; got {v!r}")
    return v

@lru_cache
def get_config() -> _Config:
    cfg = _Config()
    cfg.DATABASE_URL = _require("DATABASE_URL")
    cfg.SECRET_KEY   = _require("SECRET_KEY")
    cfg.ENVIRONMENT  = _require("ENVIRONMENT", allowed={"dev", "staging", "prod"})
    cfg.DEBUG        = os.getenv("DEBUG", "false").lower() in {"1", "true"}
    cfg.PORT         = int(os.getenv("PORT", "8000"))
    return cfg

# 2) NEVER print the whole environment — secrets end up in logs/incidents
SECRET_PREFIXES = ("DATABASE_", "SECRET_", "AWS_", "STRIPE_", "TOKEN")
def safe_env_dump() -> dict[str, str]:
    return {
        k: ("***" if any(k.startswith(p) for p in SECRET_PREFIXES) else v)
        for k, v in os.environ.items()
    }

# 3) Prefer pydantic-settings for typed config — see the pydantic-settings entry.
#    Reach for raw os.environ only when you can't add the dependency.

# Decision rule:
#   single optional var, simple type        -> os.getenv("X", "default")
#   required var that should fail-loud       -> os.environ["X"] or _require("X")
#   typed config object, many fields          -> pydantic-settings BaseSettings
#   need .env in dev only                       -> python-dotenv, called BEHIND a guard
#   container / serverless                      -> ignore .env; rely on platform env vars
#   secrets                                      -> SecretStr (pydantic) or KMS / Vault
#
# Anti-pattern: spreading os.environ.get("X") across 50 files
#   Renaming a var becomes a grep-and-replace; defaults disagree across modules;
#   tests can't override consistently. Centralize config in one module.
```

## Decision Rule

```text
single optional var, simple type        -> os.getenv("X", "default")
required var that should fail-loud       -> os.environ["X"] or _require("X")
typed config object, many fields          -> pydantic-settings BaseSettings
need .env in dev only                       -> python-dotenv, called BEHIND a guard
container / serverless                      -> ignore .env; rely on platform env vars
secrets                                      -> SecretStr (pydantic) or KMS / Vault
```

## Anti-Pattern

> [!warning] Anti-pattern
> spreading os.environ.get("X") across 50 files
>   Renaming a var becomes a grep-and-replace; defaults disagree across modules;
>   tests can't override consistently. Centralize config in one module.

## Tips

- Add `.env` to `.gitignore` immediately — never commit credentials
- `os.environ["KEY"]` raises `KeyError` on missing — use for required vars so the app fails loudly
- `os.getenv("KEY")` returns `None` on missing — check explicitly or provide a default
- For typed config, use `Pydantic BaseSettings` instead of raw `os.getenv` calls

## Common Mistake

> [!warning] Hardcoding credentials: `db = connect("password123")`. Use env vars — one accidental commit and credentials are compromised.

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

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/apis/http-stdlib/_Index|APIs & Frameworks → HTTP & Standard Library]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

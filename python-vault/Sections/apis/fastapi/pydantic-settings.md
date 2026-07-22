---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "pydantic-settings"
title: "Pydantic BaseSettings"
category: "FastAPI"
subtitle: "12-factor app config — reads from env vars automatically"
signature_short: "class Settings(BaseSettings): db_url: str"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pydantic BaseSettings"
  - "pydantic-settings"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# Pydantic BaseSettings

> 12-factor app config — reads from env vars automatically

## Overview

BaseSettings (from pydantic-settings) reads configuration from environment variables automatically. Field names map to env var names. Use @lru_cache to create a singleton — settings are loaded once and reused.

## Signature

```python
class Settings(BaseSettings): db_url: str
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Settings class, env vars become typed attributes
# STRENGTHS - Smallest valid 12-factor config
# WEAKNESSES- No .env, no nested config, no validation
#
# pip install pydantic-settings
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str                    # required — must be in env
    debug:        bool = False           # default if missing

# Reads from env: DATABASE_URL, DEBUG (case-insensitive)
settings = Settings()
print(settings.database_url, settings.debug)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - .env file + lru_cache singleton + FastAPI Depends
# STRENGTHS - The standard production-shaped pattern
# WEAKNESSES- No SecretStr; no nested settings; no env-prefix
#
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi import Depends, FastAPI

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",                  # ignore unrelated env vars
    )

    database_url: str                    # required
    secret_key:   str                    # required
    debug:        bool = False
    port:         int  = 8000
    cors_origins: list[str] = ["http://localhost:3000"]

# .env (NEVER commit to git)
#   DATABASE_URL=postgresql://user:pass@localhost/db
#   SECRET_KEY=supersecret
#   CORS_ORIGINS=["https://app.example.com"]

@lru_cache
def get_settings() -> Settings:
    return Settings()                    # cached after first call

app = FastAPI()

@app.get("/info")
def info(s: Settings = Depends(get_settings)):
    return {"debug": s.debug, "port": s.port}      # NEVER return secret_key
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - SecretStr, nested settings, env_prefix per environment, override at test time
# STRENGTHS - The patterns that prevent secret leaks and per-env config drift
# WEAKNESSES- N/A
#
from functools import lru_cache
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

# 1) SecretStr — repr() and logs show '**********', accessor needs .get_secret_value()
class DBSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DB_", env_file=".env")
    host:     str
    port:     int = 5432
    user:     str
    password: SecretStr                  # NOT str
    name:     str

class RedisSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="REDIS_", env_file=".env")
    url: str

# 2) Nested settings — compose; each subgroup has its own env prefix
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    env:    str = "dev"
    db:     DBSettings    = DBSettings()
    redis:  RedisSettings = RedisSettings()

    def database_url(self) -> str:
        return (f"postgresql://{self.db.user}:{self.db.password.get_secret_value()}"
                f"@{self.db.host}:{self.db.port}/{self.db.name}")

@lru_cache
def get_settings() -> Settings:
    return Settings()

# 3) Per-environment files — pick at startup via env var
#    DJANGO_ENV=staging python -m uvicorn ...
import os
env_file = f".env.{os.getenv('APP_ENV', 'dev')}"
class EnvAwareSettings(Settings):
    model_config = SettingsConfigDict(env_file=env_file, extra="ignore")

# 4) Test override — clear the lru_cache and inject a fake
def override_for_tests(**overrides):
    get_settings.cache_clear()
    # In real tests:  app.dependency_overrides[get_settings] = lambda: Settings(**overrides)

# Decision rule:
#   anything sensitive (passwords, tokens) -> SecretStr; never plain str
#   grouped config (db, redis, smtp)        -> nested BaseSettings with env_prefix
#   per-env config                            -> .env.dev / .env.prod, pick via APP_ENV
#   serverless / no .env file                  -> ignore env_file, rely on platform env vars
#   FastAPI handler needs settings             -> Depends(get_settings) (cached lru)
#   testing                                    -> dependency_overrides + cache_clear
#
# Anti-pattern: print(settings) showing the password
#   Plain str fields are repr'd verbatim — and end up in stack traces, logs, and
#   error reports. SecretStr renders as '**********' and is opt-in to read.
```

## Decision Rule

```text
anything sensitive (passwords, tokens) -> SecretStr; never plain str
grouped config (db, redis, smtp)        -> nested BaseSettings with env_prefix
per-env config                            -> .env.dev / .env.prod, pick via APP_ENV
serverless / no .env file                  -> ignore env_file, rely on platform env vars
FastAPI handler needs settings             -> Depends(get_settings) (cached lru)
testing                                    -> dependency_overrides + cache_clear
```

## Anti-Pattern

> [!warning] Anti-pattern
> print(settings) showing the password
>   Plain str fields are repr'd verbatim — and end up in stack traces, logs, and
>   error reports. SecretStr renders as '**********' and is opt-in to read.

## Tips

- Add `.env` to `.gitignore` immediately — never commit credentials to version control
- `@lru_cache` on `get_settings()` creates a singleton — settings are loaded only once
- `BaseSettings` validates and casts env vars — `PORT="8000"` automatically becomes `int`
- Install separately: `pip install pydantic-settings`
- Type sensitive fields as `SecretStr` (never plain `str`) — they render as `**********` in logs and stack traces and require explicit `.get_secret_value()` to read

## Common Mistake

> [!warning] Hardcoding credentials in source code. Use env vars — one accidental `git push` and credentials are public forever.

## Shorthand (Junior → Senior)

**Junior:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache
class Settings(BaseSettings):
# Reads DATABASE_URL from env automatically:
```

**Senior:**
```python
return {"debug": s.debug, "port": s.port}
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]

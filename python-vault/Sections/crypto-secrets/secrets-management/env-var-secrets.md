---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "secrets-management"
id: "env-var-secrets"
title: "Environment-variable secrets — typed loading and validation"
category: "Secrets Management"
subtitle: "os.environ, python-dotenv (dev), pydantic-settings BaseSettings, .env.example, .env.local override, fail-fast validation, k8s Secret -> env var"
signature_short: "class Settings(BaseSettings): db_url: PostgresDsn; jwt_key: SecretStr   # validates at startup"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Environment-variable secrets — typed loading and validation"
  - "env-var-secrets"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/secrets-management"
  - "category/secrets-management"
  - "tier/tiered"
---

# Environment-variable secrets — typed loading and validation

> os.environ, python-dotenv (dev), pydantic-settings BaseSettings, .env.example, .env.local override, fail-fast validation, k8s Secret -> env var

## Overview

12-factor apps load secrets from environment variables. The application doesn't care WHERE the variable came from — orchestrator (k8s Secret, ECS task definition, Docker `--env-file`), CI runner, Vault Agent injector. The application's job is: read at startup, validate types, fail fast on missing/malformed values, never log them, never check `.env` into git. `pydantic-settings` (formerly `pydantic.BaseSettings`) is the canonical library — typed parsing, automatic env-var loading, `SecretStr` type that masks itself in repr/logs. The three examples solve the SAME concrete task — load a database URL, JWT signing key, and feature flags into the app at startup; fail fast if anything is missing — at three depths: `os.environ` direct → `python-dotenv` for dev + `pydantic-settings` typed validation → production layered settings (`.env`, `.env.local`, `.env.{ENV}`) + SecretStr + fail-fast hooks + dev-vs-prod modeling.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load DATABASE_URL and JWT_SIGNING_KEY from env vars at startup; raise immediately if missing.
- **Junior** — SAME — but use a .env file in development, validate types via pydantic-settings, fail at startup with a clear error message listing every missing var.
- **Senior** — SAME — production: per-environment layered .env files, secrets injected by orchestrator (k8s Secret / Vault Agent), startup self-test that validates DB + Redis connectivity, scrub-from-logs guard.

## Signature

```python
class Settings(BaseSettings): db_url: PostgresDsn; jwt_key: SecretStr   # validates at startup
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load DATABASE_URL and JWT_SIGNING_KEY from env vars at
#             startup; raise immediately if missing.
# APPROACH  - os.environ[...] inside a settings module; the KeyError
#             at import time is loud enough to catch.
# STRENGTHS - Stdlib only; no extra dependency.
# WEAKNESSES- No type validation; values are strings; no per-env
#             override convention.
import os

# Settings module loaded once at import; missing var = boot fails.
DATABASE_URL    = os.environ["DATABASE_URL"]
JWT_SIGNING_KEY = os.environ["JWT_SIGNING_KEY"]
LOG_LEVEL       = os.environ.get("LOG_LEVEL", "info")
DEBUG           = os.environ.get("DEBUG", "0") == "1"

# Use:
print(DATABASE_URL)                                    # "postgresql://..."

# Common gotchas:
#  - os.environ.get("X", "default") returns the DEFAULT only if missing,
#    NOT if empty-string. Empty string is "set". Validate explicitly.
#  - All values are strings — DEBUG="0" is truthy. Always parse.
#  - At import-time crash: traceback shows the missing var; deploy fails fast.

# Setting them — for development:
#   $ export DATABASE_URL="postgresql://..."
#   $ python -m myapp
# In Docker: -e DATABASE_URL=...
# In docker-compose.yml: environment: { DATABASE_URL: ... }
# In Kubernetes: env: [{name: DATABASE_URL, valueFrom: {secretKeyRef: {...}}}]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use a .env file in development, validate
#             types via pydantic-settings, fail at startup with a
#             clear error message listing every missing var.
# APPROACH  - .env file loaded for dev; pydantic-settings BaseSettings
#             reads env vars + .env, parses types, validates; SecretStr
#             masks values from logs.
# STRENGTHS- Type-safe (PostgresDsn validates the URL format,
#             not just presence); SecretStr prevents accidental
#             logging; one error message lists every missing var.
# WEAKNESSES- Extra dependencies (pydantic + pydantic-settings); for
#             a 50-line script, plain os.environ is enough.
# pip install pydantic-settings python-dotenv
from pydantic import PostgresDsn, SecretStr, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",                              # loads from CWD/.env
        env_file_encoding="utf-8",
        extra="ignore",                                # don't crash on unrelated env vars
    )

    # Typed fields. PostgresDsn validates the URL format.
    database_url: PostgresDsn
    jwt_signing_key: SecretStr                         # masked in repr/log
    redis_url: str = "redis://localhost:6379/0"        # default value

    log_level: str = "INFO"
    debug: bool = False                                # parses "1"/"true"/"yes" -> True

    # API keys you load from the same env namespace.
    sentry_dsn: SecretStr | None = None

# Load once; raise ValidationError listing every problem.
try:
    settings = Settings()
except ValidationError as e:
    # ValidationError lists ALL missing/invalid fields, not just first.
    print("Configuration invalid:")
    for err in e.errors():
        print(f"  {err['loc'][0]}: {err['msg']}")
    raise SystemExit(1)

# Access:
print(settings.database_url)                           # "postgresql://..."
print(settings.jwt_signing_key)                        # SecretStr(b'**********')
print(settings.jwt_signing_key.get_secret_value())     # the actual string

# .env file — committed as a TEMPLATE, not the real values.
# .env.example (committed):
#   DATABASE_URL=postgresql://user:pass@localhost/dev
#   JWT_SIGNING_KEY=replace-me
#   LOG_LEVEL=DEBUG
#   DEBUG=1
#
# .env (gitignored — real secrets):
#   DATABASE_URL=postgresql://app:redacted@db.local/prod
#   JWT_SIGNING_KEY=eyJhbGciOiJIUzI1NiI...
#
# .gitignore MUST include:
#   .env
#   .env.local
#   .env.*.local

# Pre-commit hook to catch leaks: detect-secrets, gitleaks, trufflehog.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: per-environment layered .env files,
#             secrets injected by orchestrator (k8s Secret / Vault
#             Agent), startup self-test that validates DB + Redis
#             connectivity, scrub-from-logs guard.
# APPROACH  - Layered config: .env -> .env.{ENV} -> os.environ
#             (highest precedence). SecretStr everywhere. Startup
#             health-check uses each secret to verify it works.
# STRENGTHS - Same code path in dev / staging / prod; different
#             layers fill it in; misconfig caught before serving
#             traffic; secrets never reach stdout.
# WEAKNESSES- Layered .env files require discipline (knowing which
#             file is which). Document in the README.
import os, logging, sys
from pydantic import PostgresDsn, RedisDsn, SecretStr, Field, ValidationError, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

log = logging.getLogger(__name__)

ENV = os.environ.get("ENV", "dev")

class Settings(BaseSettings):
    """
    Loading order (lowest precedence first):
      1. .env                     - committed defaults
      2. .env.local               - dev local overrides (gitignored)
      3. .env.{ENV}               - environment-specific (committed for staging/prod, w/ no secrets)
      4. .env.{ENV}.local         - env-specific local overrides (gitignored)
      5. os.environ               - injected by orchestrator (highest)
    """
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", f".env.{ENV}", f".env.{ENV}.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: str = "dev"
    debug: bool = False

    # Required services.
    database_url:   PostgresDsn
    redis_url:      RedisDsn
    sentry_dsn:     AnyHttpUrl | None = None

    # Crypto keys (SecretStr scrubs from repr / dict() / dump).
    jwt_signing_key:    SecretStr
    fernet_key_current: SecretStr
    fernet_key_retired: list[SecretStr] = Field(default_factory=list)
    password_pepper:    SecretStr

    # Feature flags.
    enable_billing: bool = False
    rate_limit_per_minute: int = 60

# 1) Load + validate; abort process on error.
def load_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as e:
        # Compact, readable error report.
        print("CONFIGURATION ERROR:", file=sys.stderr)
        for err in e.errors():
            field = ".".join(str(p) for p in err["loc"])
            print(f"  {field}: {err['msg']}", file=sys.stderr)
        print("Set the env vars above (or add to .env). Aborting.", file=sys.stderr)
        sys.exit(2)

# 2) Startup self-test — verify each secret WORKS, not just present.
def self_test(settings: Settings) -> None:
    failures: list[str] = []

    # DB.
    try:
        from sqlalchemy import create_engine
        engine = create_engine(str(settings.database_url))
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
    except Exception as e:
        failures.append(f"database_url: {e}")

    # Redis.
    try:
        import redis
        r = redis.Redis.from_url(str(settings.redis_url))
        r.ping()
    except Exception as e:
        failures.append(f"redis_url: {e}")

    # Fernet key — must decrypt with itself.
    try:
        from cryptography.fernet import Fernet
        f = Fernet(settings.fernet_key_current.get_secret_value().encode())
        f.decrypt(f.encrypt(b"x"))
    except Exception as e:
        failures.append(f"fernet_key_current: {e}")

    if failures:
        print("STARTUP HEALTH CHECK FAILED:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        sys.exit(3)
    log.info("startup_health_check_ok")

# 3) Scrub from logs — never let SecretStr escape into a log message.
SECRET_KEYS = {"password", "token", "key", "secret", "dsn", "pepper", "authorization"}

class SecretRedactor(logging.Filter):
    """Logging filter that redacts SecretStr values in record.args/extra."""
    def filter(self, record: logging.LogRecord) -> bool:
        # Walk record.__dict__ and replace any SecretStr or string-like
        # value whose KEY suggests a secret.
        for k, v in list(record.__dict__.items()):
            if isinstance(v, SecretStr):
                record.__dict__[k] = "***"
            elif any(s in k.lower() for s in SECRET_KEYS) and isinstance(v, str):
                record.__dict__[k] = "***"
        return True

logging.getLogger().addFilter(SecretRedactor())

# 4) Tie it all together at process startup.
def main():
    settings = load_settings()
    self_test(settings)
    # Now serve traffic with confidence — every secret is present + working.
    print(f"started in env={settings.env}, debug={settings.debug}")

# main()

# Decision rule:
#   12-factor app                          -> env vars; never config files in source
#   dev workflow                            -> .env file + python-dotenv; .env.example committed
#   typed config + fail-fast               -> pydantic-settings BaseSettings
#   secret in logs / errors                 -> SecretStr (Pydantic) — masks repr automatically
#   per-environment layering                -> .env -> .env.local -> .env.{ENV}
#   never commit secrets                    -> .gitignore .env*; pre-commit gitleaks/detect-secrets
#   k8s deployment                          -> Secret -> env (envFrom: secretRef)
#   AWS ECS                                 -> task definition secrets pulled from Secrets Manager
#   AWS Lambda                              -> Lambda env vars (KMS-encrypted at rest)
#   Vault                                   -> Vault Agent injector writes to file or env
#   secret rotation while running           -> see secrets-vault entry (file-watch / poll)
#   verify secret WORKS at startup          -> self_test() that uses each one before serving
#   .env files in production                -> NO; orchestrator injects env directly
#
# Anti-pattern: committing a .env file with real secrets to git. Even
# if you delete it later, git history retains it forever (rotate
# everything that ever touched git history). Always .gitignore
# .env / .env.local; commit .env.example with placeholder values; use
# pre-commit hooks (gitleaks, detect-secrets) to catch slip-ups.
```

## Decision Rule

```text
12-factor app                          -> env vars; never config files in source
dev workflow                            -> .env file + python-dotenv; .env.example committed
typed config + fail-fast               -> pydantic-settings BaseSettings
secret in logs / errors                 -> SecretStr (Pydantic) — masks repr automatically
per-environment layering                -> .env -> .env.local -> .env.{ENV}
never commit secrets                    -> .gitignore .env*; pre-commit gitleaks/detect-secrets
k8s deployment                          -> Secret -> env (envFrom: secretRef)
AWS ECS                                 -> task definition secrets pulled from Secrets Manager
AWS Lambda                              -> Lambda env vars (KMS-encrypted at rest)
Vault                                   -> Vault Agent injector writes to file or env
secret rotation while running           -> see secrets-vault entry (file-watch / poll)
verify secret WORKS at startup          -> self_test() that uses each one before serving
.env files in production                -> NO; orchestrator injects env directly
```

## Anti-Pattern

> [!warning] Anti-pattern
> committing a .env file with real secrets to git. Even
> if you delete it later, git history retains it forever (rotate
> everything that ever touched git history). Always .gitignore
> .env / .env.local; commit .env.example with placeholder values; use
> pre-commit hooks (gitleaks, detect-secrets) to catch slip-ups.

## Tips

- Use `pydantic-settings.BaseSettings` for type-safe env-var loading. `database_url: PostgresDsn` validates the URL format at startup; missing or malformed = ValidationError that lists every problem.
- `SecretStr` masks itself in `repr()` and serialization — the value never leaks to logs or `dict()`. Use it for every credential, key, and token.
- `.env.example` (committed) shows the variable NAMES; `.env` (gitignored) holds the real values. New developers copy example→.env and fill in.
- Add `.env`, `.env.local`, `.env.*.local` to `.gitignore`. Pair with a pre-commit hook (gitleaks, detect-secrets, trufflehog) so accidental commits fail before they hit git.
- In production, do NOT use `.env` files — the orchestrator (k8s Secret, ECS task definition, Vault Agent) should inject env vars directly. Layered .env files are for dev convenience.
- Implement a startup self-test that USES each secret to verify it works (DB connect, decrypt with the Fernet key, ping Redis). Catches "secret is set but wrong" before traffic arrives.

## Common Mistake

> [!warning] Committing a `.env` file with real secrets to git. Even if you delete it in a later commit, git history retains it forever — anyone who ever clones the repo can recover the secret. ROTATE every credential that ever touched git history. Always `.gitignore` .env files, commit `.env.example` with placeholders, and run gitleaks/detect-secrets in pre-commit.

## Shorthand (Junior → Senior)

**Junior:**
```python
# .env committed to git — rotate everything that ever touched it
$ git add .env
$ git commit -m "add config"   # secrets now in history forever
```

**Senior:**
```python
# .env.example committed; .env gitignored
$ cp .env.example .env && edit .env
$ echo ".env" >> .gitignore
$ pre-commit install                     # gitleaks/detect-secrets
```

## See Also

- [[Sections/crypto-secrets/secrets-management/secrets-vault|Secrets manager — Vault / AWS / GCP with auto-rotation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/key-rotation|Key rotation — dual-acceptance, kid prefix, batch re-encryption (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/_Index|Crypto & Secrets → Secrets Management — env vars, Vault / KMS, key rotation]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

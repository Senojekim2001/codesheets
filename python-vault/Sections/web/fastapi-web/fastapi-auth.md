---
type: "entry"
domain: "python"
file: "web"
section: "fastapi-web"
id: "fastapi-auth"
title: "OAuth2PasswordBearer, JWT"
category: "FastAPI"
subtitle: "Token-based auth, JWT validation, dependency-based security"
signature_short: "OAuth2PasswordBearer  |  @app.post(\"/token\")  |  Depends()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OAuth2PasswordBearer, JWT"
  - "fastapi-auth"
tags:
  - "python"
  - "python/web"
  - "python/web/fastapi-web"
  - "category/fastapi"
  - "tier/tiered"
---

# OAuth2PasswordBearer, JWT

> Token-based auth, JWT validation, dependency-based security

## Overview

FastAPI provides built-in OAuth2 and JWT support. Use `OAuth2PasswordBearer` to define token locations, create a `/token` endpoint to issue JWTs, and use `Depends()` to validate tokens on protected routes.

## Signature

```python
OAuth2PasswordBearer  |  @app.post("/token")  |  Depends()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Bearer token in a header, validated by a dependency
# STRENGTHS - Smallest demonstration of Depends + OAuth2PasswordBearer
# WEAKNESSES- Hardcoded token; no real signing or password store
#
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    if token != "secret":
        raise HTTPException(status_code=401, detail="invalid token")
    return {"name": "alice"}

@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Real /token endpoint with bcrypt + JWT, dependency-validated routes
# STRENGTHS - The standard FastAPI auth flow you'll meet in tutorials and PRs
# WEAKNESSES- Symmetric HS256, no refresh tokens, no scope-based authorization
#
import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

app = FastAPI()
SECRET_KEY = os.environ["JWT_SECRET"]              # NEVER hardcode
ALGORITHM  = "HS256"
oauth2     = OAuth2PasswordBearer(tokenUrl="token")
pwd        = CryptContext(schemes=["bcrypt"], deprecated="auto")

users = {"alice": {"username": "alice", "hashed_password": pwd.hash("secret123")}}

def authenticate(username: str, password: str):
    user = users.get(username)
    if not user or not pwd.verify(password, user["hashed_password"]):
        return None
    return user

def make_token(sub: str, ttl_minutes: int = 60) -> str:
    return jwt.encode(
        {"sub": sub, "exp": datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)},
        SECRET_KEY, algorithm=ALGORITHM,
    )

def current_user(token: str = Depends(oauth2)):
    creds_err = HTTPException(status_code=401, detail="invalid token",
                              headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise creds_err
    user = users.get(username) if username else None
    if not user:
        raise creds_err
    return user

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate(form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    return {"access_token": make_token(user["username"]), "token_type": "bearer"}

@app.get("/me")
def me(user: dict = Depends(current_user)):
    return {"name": user["username"]}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Scope-based authorization, RS256, refresh tokens, defense-in-depth
# STRENGTHS - The shape production auth actually takes; explains every choice
# WEAKNESSES- N/A
#
import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import jwt, JWTError
from passlib.context import CryptContext

app = FastAPI()
PUB_KEY  = os.environ["JWT_PUB"]                    # asymmetric: clients verify, only auth signs
PRIV_KEY = os.environ["JWT_PRIV"]
ALG      = "RS256"

# 1) Scopes describe permissions; OAuth2PasswordBearer wires them into OpenAPI.
oauth2 = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"users:read": "Read user profiles", "users:write": "Create/update users"},
)

pwd = CryptContext(schemes=["argon2"], deprecated="auto")   # argon2 > bcrypt for new code

def make_token(sub: str, scopes: list[str], ttl: timedelta) -> str:
    return jwt.encode(
        {"sub": sub, "scopes": scopes,
         "exp": datetime.now(timezone.utc) + ttl,
         "iat": datetime.now(timezone.utc)},
        PRIV_KEY, algorithm=ALG,
    )

# 2) Validate scopes alongside the token — single dependency per route.
def require(scopes: SecurityScopes, token: str = Depends(oauth2)) -> dict:
    auth = "Bearer" if not scopes.scopes else f'Bearer scope="{scopes.scope_str}"'
    err = HTTPException(401, "not authorized", headers={"WWW-Authenticate": auth})
    try:
        payload = jwt.decode(token, PUB_KEY, algorithms=[ALG])
    except JWTError:
        raise err
    if not set(scopes.scopes).issubset(payload.get("scopes", [])):
        raise HTTPException(403, "missing scope", headers={"WWW-Authenticate": auth})
    return payload

# 3) Issue short access + long refresh; rotate on every refresh
@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # ... password check elided ...
    return {
        "access_token":  make_token(form.username, form.scopes, timedelta(minutes=15)),
        "refresh_token": make_token(form.username, ["refresh"], timedelta(days=14)),
        "token_type": "bearer",
    }

@app.get("/users/{uid}")
def read_user(uid: int, claims = Security(require, scopes=["users:read"])):
    return {"id": uid, "by": claims["sub"]}

@app.post("/users")
def create_user(claims = Security(require, scopes=["users:write"])):
    return {"created": True, "by": claims["sub"]}

# Decision rule:
#   single small service                  -> HS256 with one shared secret is fine
#   multiple services verify same token   -> RS256/ES256 (asymmetric) — share PUB only
#   browser SPA                            -> short access (5-15 min) + refresh in HttpOnly cookie
#   long-lived API keys                    -> separate tokens with no exp; rotate on rotation
#   permissions per endpoint               -> Security(require, scopes=[...])
#
# Anti-pattern: bcrypt(plain).verify() over the wire timing-leak
#   Always go through pwd.verify(...). And never compare token strings with ==;
#   verify the SIGNATURE — string equality is meaningless once an attacker forges JWTs.
```

## Decision Rule

```text
single small service                  -> HS256 with one shared secret is fine
multiple services verify same token   -> RS256/ES256 (asymmetric) — share PUB only
browser SPA                            -> short access (5-15 min) + refresh in HttpOnly cookie
long-lived API keys                    -> separate tokens with no exp; rotate on rotation
permissions per endpoint               -> Security(require, scopes=[...])
```

## Anti-Pattern

> [!warning] Anti-pattern
> bcrypt(plain).verify() over the wire timing-leak
>   Always go through pwd.verify(...). And never compare token strings with ==;
>   verify the SIGNATURE — string equality is meaningless once an attacker forges JWTs.

## Tips

- Never hardcode secrets; use environment variables.
- `Depends()` enables FastAPI to inject authenticated users.
- Use `python-jose` for JWT encoding/decoding, `passlib` for password hashing.
- Single small service: HS256 with one shared secret is fine. The moment multiple services verify the same token, switch to RS256/ES256 (asymmetric) and share only the public key
- Browser SPAs: short access token (5-15 min) + refresh token in an `HttpOnly` cookie; verify the JWT signature, never compare token strings with `==`

## Common Mistake

> [!warning] Storing plaintext passwords; always hash with bcrypt or Argon2.

## Shorthand (Junior → Senior)

**Junior:**
```python
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401)
    user = db.get_user(username)
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/protected")
async def protected(user: dict = Depends(get_current_user)):
    return user
```

**Senior:**
```python
@app.get("/protected")
async def protected(user: dict = Depends(get_current_user)):
    return user
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/web/fastapi-web/_Index|Web (Flask, Django) → FastAPI]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

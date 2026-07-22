---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "tokens"
id: "session-tokens"
title: "Session tokens — opaque vs JWT, cookie attributes, revocation"
category: "Tokens"
subtitle: "secrets.token_urlsafe + Redis store, set-cookie HttpOnly Secure SameSite Strict, __Host- prefix, sliding expiration, CSRF, session-binding, opaque vs JWT decision"
signature_short: "token = secrets.token_urlsafe(32); r.setex(f\"sess:{sha256(token)}\", ttl, user_id); set-cookie: __Host-session=token; HttpOnly; Secure; SameSite=Lax"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Session tokens — opaque vs JWT, cookie attributes, revocation"
  - "session-tokens"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/tokens"
  - "category/tokens"
  - "tier/tiered"
---

# Session tokens — opaque vs JWT, cookie attributes, revocation

> secrets.token_urlsafe + Redis store, set-cookie HttpOnly Secure SameSite Strict, __Host- prefix, sliding expiration, CSRF, session-binding, opaque vs JWT decision

## Overview

A session token is the standard "you're logged in" credential between your service and the user's browser. Two implementations: OPAQUE (random string; lookup state in Redis/DB; trivially revocable) or JWT (stateless; no DB lookup; revocation harder). The discipline is the SAME for either: get the cookie attributes right, defend against CSRF, expire on idle, bind to context. The three examples solve the SAME concrete task — issue a session token after login; verify it on every request; revoke on logout — at three depths: opaque token + Redis hash + secure cookie attributes → cookie hardening (`__Host-` prefix, SameSite, double-submit CSRF) + sliding expiration + idle timeout → production: session binding (IP/user-agent/device), step-up auth, revoke-on-password-change, OWASP ASVS-aligned, when JWT is the right answer instead.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — On login, issue a session token; verify it on each request; revoke on logout.
- **Junior** — SAME — but harden cookies (__Host- prefix, SameSite Strict where possible), defend against CSRF for sites that need SameSite=Lax, sliding expiration on activity.
- **Senior** — SAME — production: session binding (IP / device / user-agent), step-up auth for sensitive operations, revoke on password change / suspicion, structured idle-vs-absolute timeouts.

## Signature

```python
token = secrets.token_urlsafe(32); r.setex(f"sess:{sha256(token)}", ttl, user_id); set-cookie: __Host-session=token; HttpOnly; Secure; SameSite=Lax
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - On login, issue a session token; verify it on each
#             request; revoke on logout.
# APPROACH  - Random opaque token; SHA-256 the token; Redis stores
#             hash -> {user_id, expires_at}. Cookie carries the raw
#             token; server hashes + looks up.
# STRENGTHS - Trivially revocable (delete the Redis key); no signing
#             keys to manage; DB leak yields hashes only.
# WEAKNESSES- Cookie attributes are minimal — junior tier hardens them.
import os, secrets, hashlib, time
import redis
from fastapi import FastAPI, Request, Response, HTTPException

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

SESSION_TTL = 3600 * 24 * 7                          # 7 days

def _hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()

def login(user_id: int, response: Response) -> str:
    token = secrets.token_urlsafe(32)
    r.setex(f"sess:{_hash(token)}", SESSION_TTL, str(user_id))
    response.set_cookie(
        key="session",
        value=token,
        max_age=SESSION_TTL,
        httponly=True,                                 # JS can't read
        secure=True,                                    # HTTPS only
        samesite="lax",
    )
    return token

def current_user(request: Request) -> int:
    token = request.cookies.get("session")
    if not token:
        raise HTTPException(401)
    user_id_str = r.get(f"sess:{_hash(token)}")
    if not user_id_str:
        raise HTTPException(401)
    return int(user_id_str)

def logout(request: Request, response: Response):
    token = request.cookies.get("session")
    if token:
        r.delete(f"sess:{_hash(token)}")              # immediate revocation
    response.delete_cookie("session")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but harden cookies (__Host- prefix, SameSite Strict
#             where possible), defend against CSRF for sites that need
#             SameSite=Lax, sliding expiration on activity.
# APPROACH  - __Host- prefix forces Secure + path=/ + no Domain.
#             For cross-origin form posts (rare with SPAs), pair Lax
#             cookies with a CSRF token (double-submit pattern).
# STRENGTHS- Modern cookie hygiene; SameSite catches most CSRF for free;
#             sliding TTL keeps active users logged in without forever-
#             valid tokens.
# WEAKNESSES- __Host- prefix is HTTPS-only; you need a proper domain
#             setup. Not a constraint in production but a footgun in dev.
import os, secrets, hashlib, time
import redis
from fastapi import FastAPI, Request, Response, HTTPException

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

SESSION_TTL          = 3600 * 24 * 7                  # 7 days absolute
SESSION_IDLE_TIMEOUT = 3600 * 4                       # 4 hours idle

COOKIE_NAME = "__Host-session"                        # __Host- prefix; HTTPS-only, no Domain, path=/
CSRF_COOKIE = "__Host-csrf"

def _hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()

def login(user_id: int, response: Response) -> str:
    token = secrets.token_urlsafe(32)
    csrf  = secrets.token_urlsafe(32)
    now = int(time.time())
    # Store: user_id : last_seen
    r.setex(f"sess:{_hash(token)}", SESSION_TTL, f"{user_id}:{now}")
    # Session cookie — HttpOnly so JS can't read.
    response.set_cookie(
        key=COOKIE_NAME, value=token,
        max_age=SESSION_TTL,
        httponly=True, secure=True, samesite="lax",
        path="/",
    )
    # CSRF cookie — readable by JS so the SPA can echo it as a header
    # (double-submit pattern). NOT HttpOnly.
    response.set_cookie(
        key=CSRF_COOKIE, value=csrf,
        max_age=SESSION_TTL,
        httponly=False, secure=True, samesite="lax",
        path="/",
    )
    r.setex(f"csrf:{_hash(token)}", SESSION_TTL, csrf)
    return token

def get_session(request: Request, response: Response) -> int:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(401, "no session")
    val = r.get(f"sess:{_hash(token)}")
    if not val:
        raise HTTPException(401, "expired")
    user_id_str, last_seen_str = val.split(":")
    last_seen = int(last_seen_str)
    now = int(time.time())
    if now - last_seen > SESSION_IDLE_TIMEOUT:
        r.delete(f"sess:{_hash(token)}")
        raise HTTPException(401, "idle timeout")
    # Sliding TTL — extend on activity.
    r.setex(f"sess:{_hash(token)}", SESSION_TTL, f"{user_id_str}:{now}")
    return int(user_id_str)

def require_csrf(request: Request) -> None:
    """Call from any state-changing endpoint. Verifies double-submit."""
    token = request.cookies.get(COOKIE_NAME)
    cookie_csrf = request.cookies.get(CSRF_COOKIE)
    header_csrf = request.headers.get("X-CSRF-Token")
    if not token or not cookie_csrf or not header_csrf:
        raise HTTPException(403, "missing CSRF")
    expected = r.get(f"csrf:{_hash(token)}")
    if not expected:
        raise HTTPException(403, "no csrf record")
    # Double-submit: header MUST equal cookie value AND record.
    import hmac
    if not (hmac.compare_digest(cookie_csrf, header_csrf) and
            hmac.compare_digest(cookie_csrf, expected)):
        raise HTTPException(403, "csrf mismatch")

# Cookie attribute reference:
#   HttpOnly             - JS can't read; XSS can't steal the cookie
#   Secure               - HTTPS only (browsers reject on plain HTTP)
#   SameSite=Strict      - never sent on cross-site requests; safest
#   SameSite=Lax         - sent on top-level GET cross-site (logins from email)
#   SameSite=None+Secure - cross-site (third-party cookies); rare, audit
#   __Host- prefix       - implies Secure + Path=/ + no Domain attr
#   __Secure- prefix     - implies Secure (less strict than __Host-)
#   max-age              - in seconds; pair with the session-store TTL
#   path=/               - usually correct; restricts to subpaths only if needed
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: session binding (IP / device / user-agent),
#             step-up auth for sensitive operations, revoke on password
#             change / suspicion, structured idle-vs-absolute timeouts.
# APPROACH  - On login record (UA, IP-prefix, device-id); on each
#             request compare and revoke on mismatch (configurable
#             tightness); a "last_password_change" timestamp invalidates
#             all sessions issued before it.
# STRENGTHS - Session theft (cookie copied to attacker laptop) detected
#             via UA/IP shift; password change cuts every existing
#             session; step-up auth re-verifies for sensitive ops.
# WEAKNESSES- IP-binding is too tight for mobile users (changing networks);
#             prefer prefix or device-id binding; balance security vs
#             user friction.
import os, secrets, hashlib, time, json
import redis
from dataclasses import dataclass
from fastapi import FastAPI, Request, Response, HTTPException

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

SESSION_TTL          = 3600 * 24 * 7
SESSION_IDLE_TIMEOUT = 3600 * 4
STEP_UP_VALIDITY     = 300                            # 5 min for step-up

COOKIE_NAME = "__Host-session"

def _hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()

@dataclass
class SessionRecord:
    user_id:           int
    last_seen:         int
    created_at:        int
    user_agent_hash:   str
    ip_prefix:         str                            # /24 for IPv4, /48 for IPv6
    device_id:         str | None
    step_up_at:        int | None
    password_version:  int                             # match user.password_version

def _ip_prefix(ip: str) -> str:
    if ":" in ip:                                     # IPv6 — /48 prefix
        return ":".join(ip.split(":")[:3])
    return ".".join(ip.split(".")[:3])                # IPv4 — /24 prefix

def _ua_hash(ua: str) -> str:
    return hashlib.sha256(ua.encode()).hexdigest()[:16]

def login(user_id: int, request: Request, response: Response, *, password_version: int) -> str:
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    rec = SessionRecord(
        user_id=user_id,
        last_seen=now, created_at=now,
        user_agent_hash=_ua_hash(request.headers.get("user-agent", "")),
        ip_prefix=_ip_prefix(request.client.host or ""),
        device_id=request.cookies.get("device-id"),
        step_up_at=now,
        password_version=password_version,
    )
    r.setex(f"sess:{_hash(token)}", SESSION_TTL, json.dumps(rec.__dict__))
    # Track sessions per user for "logout everywhere".
    r.sadd(f"user-sessions:{user_id}", _hash(token))
    response.set_cookie(
        key=COOKIE_NAME, value=token,
        max_age=SESSION_TTL,
        httponly=True, secure=True, samesite="lax", path="/",
    )
    return token

def get_session(request: Request, response: Response) -> SessionRecord:
    token = request.cookies.get(COOKIE_NAME)
    if not token: raise HTTPException(401)
    raw = r.get(f"sess:{_hash(token)}")
    if not raw: raise HTTPException(401, "expired")
    rec = SessionRecord(**json.loads(raw))
    now = int(time.time())

    # Idle timeout.
    if now - rec.last_seen > SESSION_IDLE_TIMEOUT:
        r.delete(f"sess:{_hash(token)}")
        raise HTTPException(401, "idle")

    # Session-binding checks — UA shift is suspicious; revoke.
    expected_ua = _ua_hash(request.headers.get("user-agent", ""))
    if rec.user_agent_hash != expected_ua:
        r.delete(f"sess:{_hash(token)}")
        raise HTTPException(401, "ua mismatch (session theft suspected)")

    # IP prefix shift — log + extend; hard-revoke is too brittle for mobile.
    expected_prefix = _ip_prefix(request.client.host or "")
    if rec.ip_prefix != expected_prefix:
        log_unusual_login(rec.user_id, expected_prefix)

    # Password change since session was issued -> revoke.
    if rec.password_version != current_password_version(rec.user_id):
        r.delete(f"sess:{_hash(token)}")
        raise HTTPException(401, "password changed")

    # Sliding TTL.
    rec.last_seen = now
    r.setex(f"sess:{_hash(token)}", SESSION_TTL, json.dumps(rec.__dict__))
    return rec

def require_step_up(request: Request) -> None:
    rec = get_session(request, Response())
    now = int(time.time())
    if not rec.step_up_at or now - rec.step_up_at > STEP_UP_VALIDITY:
        raise HTTPException(403, "step-up required")

def revoke_all_sessions(user_id: int) -> int:
    """Logout everywhere — e.g., on password change."""
    members = r.smembers(f"user-sessions:{user_id}")
    if not members: return 0
    pipe = r.pipeline(transaction=False)
    for h in members:
        pipe.delete(f"sess:{h}")
    pipe.delete(f"user-sessions:{user_id}")
    pipe.execute()
    return len(members)

# Helper placeholders.
def log_unusual_login(uid: int, prefix: str): pass
def current_password_version(uid: int) -> int: return 1

# Decision rule:
#   single-service auth                  -> opaque session token (Redis-backed)
#   multi-service auth                   -> JWT or OAuth (jwt-python entry)
#   need fast revocation                 -> opaque (delete Redis key)
#   need scopes / claims interop         -> JWT (with scopes claim)
#   short-access + long-refresh          -> JWT access + opaque refresh (jwt-python)
#   "log in with X" provider             -> OAuth Authorization Code (oauth2-flow)
#   cookie attributes for browser auth   -> __Host-prefix, HttpOnly, Secure, SameSite=Lax
#   API tokens for programmatic clients  -> bearer token in Authorization header (no cookie)
#   sensitive operation                  -> step-up auth: re-verify password / 2FA recently
#   password changed                     -> revoke all sessions; bump user.password_version
#   suspicious activity                  -> revoke specific session; force re-login
#   cross-site cookie (3rd-party iframe) -> SameSite=None + Secure; audit carefully
#   want CSRF on top of SameSite         -> double-submit token (header+cookie compared)
#   regulatory / OWASP ASVS              -> opaque + bound to UA/device/IP-prefix
#
# Anti-pattern: session cookies without __Host-/Secure or with
# SameSite=None and no Secure. SameSite=None requires Secure; modern
# browsers reject the cookie otherwise. Without HttpOnly, XSS can
# steal the cookie via document.cookie. Without Secure, the cookie
# rides plain HTTP and a network observer captures it. The right
# defaults are __Host- prefix + HttpOnly + Secure + SameSite=Lax;
# only relax for documented reasons.
```

## Decision Rule

```text
single-service auth                  -> opaque session token (Redis-backed)
multi-service auth                   -> JWT or OAuth (jwt-python entry)
need fast revocation                 -> opaque (delete Redis key)
need scopes / claims interop         -> JWT (with scopes claim)
short-access + long-refresh          -> JWT access + opaque refresh (jwt-python)
"log in with X" provider             -> OAuth Authorization Code (oauth2-flow)
cookie attributes for browser auth   -> __Host-prefix, HttpOnly, Secure, SameSite=Lax
API tokens for programmatic clients  -> bearer token in Authorization header (no cookie)
sensitive operation                  -> step-up auth: re-verify password / 2FA recently
password changed                     -> revoke all sessions; bump user.password_version
suspicious activity                  -> revoke specific session; force re-login
cross-site cookie (3rd-party iframe) -> SameSite=None + Secure; audit carefully
want CSRF on top of SameSite         -> double-submit token (header+cookie compared)
regulatory / OWASP ASVS              -> opaque + bound to UA/device/IP-prefix
```

## Anti-Pattern

> [!warning] Anti-pattern
> session cookies without __Host-/Secure or with
> SameSite=None and no Secure. SameSite=None requires Secure; modern
> browsers reject the cookie otherwise. Without HttpOnly, XSS can
> steal the cookie via document.cookie. Without Secure, the cookie
> rides plain HTTP and a network observer captures it. The right
> defaults are __Host- prefix + HttpOnly + Secure + SameSite=Lax;
> only relax for documented reasons.

## Tips

- For browser auth, opaque tokens (random + Redis lookup) are usually the right choice — trivially revocable, no signing-key management. Switch to JWT only when you have multi-service auth needs.
- Cookie attributes that matter, in order: `HttpOnly` (XSS can't read), `Secure` (HTTPS only), `SameSite=Lax` (CSRF defense), `__Host-` prefix (forces Secure + path=/ + no Domain). Set ALL of them.
- Use `SameSite=Lax` as the default. `Strict` breaks "click email link to login" and similar; `None` requires `Secure` and is for legitimate cross-site cases (third-party widgets) only.
- Sliding expiration (`last_seen` updated on activity) + absolute TTL gives the right UX: active users stay logged in; abandoned sessions expire. Pair with idle timeout for sensitive accounts.
- On password change, revoke ALL the user's sessions. Track `user_sessions:{id}` as a SET in Redis; on revocation, delete every member.
- Step-up authentication (re-verify password / 2FA before sensitive ops) is the OWASP-recommended way to handle "the user's session is valid but they shouldn't do THIS without re-authenticating".

## Common Mistake

> [!warning] Session cookies missing `__Host-`/`Secure` or `HttpOnly`. `SameSite=None` requires `Secure`; modern browsers reject the cookie otherwise. Without `HttpOnly`, XSS can steal the cookie via `document.cookie`. Without `Secure`, the cookie rides plain HTTP and a network observer captures it. The right defaults are `__Host-` prefix + `HttpOnly` + `Secure` + `SameSite=Lax`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Insecure defaults — XSS reads it; HTTP exposes it
response.set_cookie("session", token)
```

**Senior:**
```python
# Modern hardened defaults
response.set_cookie("__Host-session", token,
    httponly=True, secure=True, samesite="lax", path="/")
```

## See Also

- [[Sections/crypto-secrets/tokens/jwt-python|PyJWT — issue and verify JSON Web Tokens (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/oauth2-flow|OAuth 2.0 — Authorization Code flow with PKCE (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/_Index|Crypto & Secrets → Tokens — JWT, OAuth 2.0, sessions]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

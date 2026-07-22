---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "tokens"
id: "jwt-python"
title: "PyJWT — issue and verify JSON Web Tokens"
category: "Tokens"
subtitle: "jwt.encode / decode, alg HS256 / RS256 / EdDSA, claims (exp/iat/nbf/iss/aud), kid for key rotation, algorithms list (alg=none footgun), refresh tokens"
signature_short: "token = jwt.encode({\"sub\": uid, \"exp\": now+900}, key, algorithm=\"EdDSA\", headers={\"kid\": \"v3\"})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PyJWT — issue and verify JSON Web Tokens"
  - "jwt-python"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/tokens"
  - "category/tokens"
  - "tier/tiered"
---

# PyJWT — issue and verify JSON Web Tokens

> jwt.encode / decode, alg HS256 / RS256 / EdDSA, claims (exp/iat/nbf/iss/aud), kid for key rotation, algorithms list (alg=none footgun), refresh tokens

## Overview

A JWT is a signed JSON payload: `header.payload.signature`. Anyone with the verification key (the public key for asymmetric algs) can verify the signature and read the claims. Versus opaque session tokens (next entry): JWT scales horizontally (no DB lookup per request), interoperates across services (RFC 7519), but is HARD TO REVOKE — once issued, a JWT is valid until `exp`. The right choice for short-lived access tokens (5-15 min) paired with revocable refresh tokens. The three examples solve the SAME concrete task — issue a JWT access token after login, verify it on every API call, rotate signing keys without breaking existing tokens — at three depths: HS256 with shared key → asymmetric EdDSA + claims (exp/iss/aud) + `kid` rotation → production with JWKS endpoint, refresh-token rotation, narrow revocation list, short-access/long-refresh split.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Issue a JWT after login; verify it on every API call.
- **Junior** — SAME — but use asymmetric EdDSA so verifiers can't sign, include exp/iss/aud claims, support key rotation via kid.
- **Senior** — SAME — production: JWKS endpoint at /.well-known/jwks.json; short-lived access (15 min) + long-lived opaque refresh tokens (DB-backed, revocable); narrow revocation list for "session-killed" cases; rotation orchestration.

## Signature

```python
token = jwt.encode({"sub": uid, "exp": now+900}, key, algorithm="EdDSA", headers={"kid": "v3"})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Issue a JWT after login; verify it on every API call.
# APPROACH  - HS256 (HMAC-SHA256 with a shared secret); jwt.encode
#             on issue; jwt.decode on verify.
# STRENGTHS - Smallest correct JWT; one library; one secret.
# WEAKNESSES- HS256 means anyone who can verify can also SIGN — fine
#             for one service, wrong for multi-service. Use RS256 /
#             EdDSA when verifiers shouldn't have signing power.

# pip install pyjwt
import jwt
import time

SECRET = "replace-with-a-strong-random-string"

def issue_token(user_id: int) -> str:
    payload = {
        "sub": user_id,                              # subject (user id)
        "iat": int(time.time()),                     # issued at
        "exp": int(time.time()) + 900,               # 15 min expiry
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])
        # algorithms= MUST be a list of allowed algs.
        # Without it, "alg":"none" tokens validate. The cardinal sin.
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Use:
tok = issue_token(user_id=42)
print(tok[:32])                                       # eyJhbGciOiJIUzI1NiIs...
print(verify_token(tok))                              # {'sub': 42, 'iat': ..., 'exp': ...}

# Common claims (RFC 7519):
#   sub  - subject (the user id)
#   iss  - issuer (your service URL)
#   aud  - audience (which API the token is for)
#   iat  - issued-at timestamp
#   exp  - expiration timestamp
#   nbf  - not-before (token not valid before this time)
#   jti  - JWT ID (unique identifier; useful for revocation list)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use asymmetric EdDSA so verifiers can't sign,
#             include exp/iss/aud claims, support key rotation via kid.
# APPROACH  - Generate Ed25519 keypair (see rsa-ed25519 entry);
#             jwt.encode with algorithm="EdDSA" + headers={"kid": ...};
#             keep a registry mapping kid -> public key for verify.
# STRENGTHS- Verifying services hold only the public key; private key
#             stays on the issuer; rotation is publishing a new public
#             key alongside the old one for a transition window.
# WEAKNESSES- Slightly more setup; you need to distribute public keys
#             (JWKS endpoint — senior tier).
import os, time, jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives import serialization

# 1) Load private key (from secrets manager) and public-key registry.
def load_private(pem: bytes) -> Ed25519PrivateKey:
    return serialization.load_pem_private_key(pem, password=None)

def load_public(pem: bytes) -> Ed25519PublicKey:
    return serialization.load_pem_public_key(pem)

# In real code these come from your secrets manager + JWKS doc.
PRIVATE_KEY = load_private(os.environ["JWT_PRIVATE_PEM"].encode())
PUBLIC_KEYS = {                                      # kid -> public key
    "v3": load_public(os.environ["JWT_PUBLIC_V3_PEM"].encode()),
    "v2": load_public(os.environ["JWT_PUBLIC_V2_PEM"].encode()),  # retired
}
CURRENT_KID = "v3"

ISSUER = "https://api.example.com"
AUDIENCE = "https://api.example.com/v1"

def issue_access_token(user_id: int, *, scopes: list[str]) -> str:
    payload = {
        "sub":    str(user_id),
        "iss":    ISSUER,
        "aud":    AUDIENCE,
        "iat":    int(time.time()),
        "nbf":    int(time.time()),
        "exp":    int(time.time()) + 900,            # 15 min
        "scopes": scopes,
    }
    return jwt.encode(
        payload, PRIVATE_KEY, algorithm="EdDSA",
        headers={"kid": CURRENT_KID},
    )

def verify_access_token(token: str) -> dict | None:
    try:
        # Look at the unverified header to find the kid.
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        public = PUBLIC_KEYS.get(kid)
        if public is None:
            return None
        return jwt.decode(
            token, public,
            algorithms=["EdDSA"],                     # MUST list — never trust header alg
            issuer=ISSUER,
            audience=AUDIENCE,
            options={"require": ["sub", "iss", "aud", "exp"]},
        )
    except jwt.InvalidTokenError:
        return None

# Use:
tok = issue_access_token(user_id=42, scopes=["read:widgets"])
print(verify_access_token(tok))

# Common JWT footguns this code avoids:
#   - "alg":"none" attack: 'algorithms=["EdDSA"]' (not [] or None) blocks it
#   - Algorithm confusion: HS256-with-public-key bug — using a fixed
#     algorithm list per kid avoids this
#   - Missing aud/iss validation: setting issuer= and audience= in decode
#     forces them to be checked
#   - Missing exp: 'options={"require": ["exp"]}' rejects tokens without exp
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: JWKS endpoint at /.well-known/jwks.json;
#             short-lived access (15 min) + long-lived opaque refresh
#             tokens (DB-backed, revocable); narrow revocation list for
#             "session-killed" cases; rotation orchestration.
# APPROACH  - Access tokens are JWT (stateless, fast); refresh tokens
#             are opaque random strings stored hashed in DB. Logout
#             revokes the refresh token AND adds the access token's
#             jti to a short-TTL deny list.
# STRENGTHS - Most requests verify entirely in-process (JWT signature);
#             rare revocation cases hit the deny list; refresh-token
#             flow gives effective revocation within 15 min.
# WEAKNESSES- Two token types; refresh-token rotation must be careful
#             not to leave families of tokens valid (replay defense).
import os, time, secrets, hashlib, jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives import serialization
import redis

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

# 1) JWKS endpoint — verifiers fetch public keys here.
#    See rsa-ed25519 entry for the JWKSHandler class.
JWKS_URL = "https://api.example.com/.well-known/jwks.json"
ISSUER   = "https://api.example.com"
AUDIENCE = "https://api.example.com/v1"

# 2) Refresh tokens — opaque, DB-backed, single-use (rotated on each refresh).
def issue_refresh_token(user_id: int, *, family_id: str | None = None) -> tuple[str, str]:
    """Returns (raw_token, family_id). Raw goes to client; hash to DB."""
    raw = secrets.token_urlsafe(32)
    h = hashlib.sha256(raw.encode()).hexdigest()
    fam = family_id or secrets.token_hex(8)
    # Store: { user_id, family_id, expires_at, used }
    r.setex(f"refresh:{h}", 60 * 60 * 24 * 30,        # 30 days
            f"{user_id}:{fam}:0")                      # 0 = unused
    return (raw, fam)

def consume_refresh_token(raw: str) -> tuple[int, str] | None:
    """Returns (user_id, new_family_id) on success.
    Refresh-token rotation: previous token is invalidated; replay detection
    is by checking the 'used' bit — second use of a refreshed token means
    compromise; revoke the whole family."""
    h = hashlib.sha256(raw.encode()).hexdigest()
    val = r.get(f"refresh:{h}")
    if val is None:
        return None
    user_id_str, family_id, used = val.split(":")
    if used == "1":
        # REPLAY — revoke the whole family.
        revoke_family(family_id)
        return None
    # Mark used, issue a NEW refresh in the same family.
    r.setex(f"refresh:{h}", 60 * 60, f"{user_id_str}:{family_id}:1")  # short TTL after use
    return (int(user_id_str), family_id)

def revoke_family(family_id: str) -> None:
    """Mark every refresh token in this family revoked. In practice you'd
    track family -> token-hashes to enable bulk revocation; here, a sentinel."""
    r.setex(f"family:revoked:{family_id}", 60 * 60 * 24 * 30, "1")

# 3) Access-token deny list — bounded by access-token TTL (~15 min).
def deny_access_token(jti: str, *, ttl_s: int = 900) -> None:
    r.setex(f"jwt:denied:{jti}", ttl_s, "1")

def is_access_token_denied(jti: str) -> bool:
    return r.exists(f"jwt:denied:{jti}") > 0

# 4) Issue access token with jti for the deny-list path.
import boto3
kms = boto3.client("kms")
JWT_KEY_ARN = os.environ["JWT_KMS_KEY_ARN"]            # KMS-managed signing key

def issue_access_token(user_id: int, *, scopes: list[str]) -> str:
    payload = {
        "sub":    str(user_id),
        "iss":    ISSUER,
        "aud":    AUDIENCE,
        "iat":    int(time.time()),
        "exp":    int(time.time()) + 900,
        "jti":    secrets.token_urlsafe(16),          # for deny-list lookup
        "scopes": scopes,
    }
    # PyJWT does NOT speak KMS directly; in real code use python-jose or
    # sign the payload manually via kms.sign(). For brevity, here we use
    # an in-memory key.
    private_pem = os.environ["JWT_PRIVATE_PEM"]
    sk = serialization.load_pem_private_key(private_pem.encode(), password=None)
    return jwt.encode(payload, sk, algorithm="EdDSA", headers={"kid": "v3"})

# 5) Verify with deny-list check.
def verify_access(token: str) -> dict | None:
    try:
        # Use cached JWKS in real code; for brevity, env public key.
        public_pem = os.environ["JWT_PUBLIC_V3_PEM"]
        pk = serialization.load_pem_public_key(public_pem.encode())
        claims = jwt.decode(
            token, pk, algorithms=["EdDSA"],
            issuer=ISSUER, audience=AUDIENCE,
            options={"require": ["sub", "exp", "jti"]},
        )
        if is_access_token_denied(claims["jti"]):
            return None
        return claims
    except jwt.InvalidTokenError:
        return None

# 6) Login flow ties it together.
def login(user_id: int, scopes: list[str]) -> dict:
    access = issue_access_token(user_id, scopes=scopes)
    refresh, family = issue_refresh_token(user_id)
    return {"access_token": access, "refresh_token": refresh,
            "token_type": "Bearer", "expires_in": 900}

def refresh(refresh_token: str) -> dict | None:
    result = consume_refresh_token(refresh_token)
    if result is None:
        return None
    user_id, family = result
    new_access = issue_access_token(user_id, scopes=["read:widgets"])
    new_refresh, _ = issue_refresh_token(user_id, family_id=family)
    return {"access_token": new_access, "refresh_token": new_refresh,
            "token_type": "Bearer", "expires_in": 900}

def logout(access_token_jti: str, refresh_token: str) -> None:
    deny_access_token(access_token_jti)               # bounded by access TTL
    h = hashlib.sha256(refresh_token.encode()).hexdigest()
    r.delete(f"refresh:{h}")

# Decision rule:
#   stateless inter-service auth          -> JWT EdDSA + JWKS
#   single-service auth                    -> opaque session token (next entry); simpler
#   need fast revocation                  -> NOT JWT alone; pair with deny list (small TTL)
#   need scopes / claims interop          -> JWT (or OAuth 2.0 access tokens)
#   short-lived access + revocable        -> JWT access (15 min) + opaque refresh (30 days)
#   alg=HS256                              -> only single-service; verifier == signer
#   alg=RS256/EdDSA                       -> multi-service; verifier holds public key only
#   alg=none                              -> NEVER; remove the lib if it allows it (PyJWT requires algorithms=)
#   refresh token replay                  -> family-based revocation: any reuse revokes whole family
#   key rotation                          -> kid header + JWKS multi-key endpoint
#   need to revoke immediately            -> opaque sessions (next entry); JWT can only "deny by jti"
#
# Anti-pattern: jwt.decode without algorithms= or with algorithms=["none"].
# The "alg":"none" footgun: a token forged with header {"alg":"none"} and
# no signature passes verification if the library accepts "none". PyJWT
# requires algorithms= as a list and rejects "none" by default — DO NOT
# pass algorithms=None or [] or include "none". Pin to the SINGLE
# algorithm you use; if your kid registry uses different algs per key,
# look up the alg by kid first and pass that single string.
```

## Decision Rule

```text
stateless inter-service auth          -> JWT EdDSA + JWKS
single-service auth                    -> opaque session token (next entry); simpler
need fast revocation                  -> NOT JWT alone; pair with deny list (small TTL)
need scopes / claims interop          -> JWT (or OAuth 2.0 access tokens)
short-lived access + revocable        -> JWT access (15 min) + opaque refresh (30 days)
alg=HS256                              -> only single-service; verifier == signer
alg=RS256/EdDSA                       -> multi-service; verifier holds public key only
alg=none                              -> NEVER; remove the lib if it allows it (PyJWT requires algorithms=)
refresh token replay                  -> family-based revocation: any reuse revokes whole family
key rotation                          -> kid header + JWKS multi-key endpoint
need to revoke immediately            -> opaque sessions (next entry); JWT can only "deny by jti"
```

## Anti-Pattern

> [!warning] Anti-pattern
> jwt.decode without algorithms= or with algorithms=["none"].
> The "alg":"none" footgun: a token forged with header {"alg":"none"} and
> no signature passes verification if the library accepts "none". PyJWT
> requires algorithms= as a list and rejects "none" by default — DO NOT
> pass algorithms=None or [] or include "none". Pin to the SINGLE
> algorithm you use; if your kid registry uses different algs per key,
> look up the alg by kid first and pass that single string.

## Tips

- NEVER call `jwt.decode(token, key)` without `algorithms=`. The list MUST be a single allowed algorithm — the "alg=none" historical footgun comes from libraries that accept any algorithm including "none".
- Use asymmetric algorithms (EdDSA, RS256) for multi-service auth — verifiers hold only the public key, can't sign new tokens. HS256 (shared secret) is acceptable only when the issuer and verifier are the same service.
- Always set `exp` (expiry) and validate it. Always set `iss` and `aud` and validate them. Without these, a token leaked from one audience can be replayed to another.
- Use `kid` (key id) in the JWT header for rotation. Verifiers look up the public key by `kid` from their JWKS document; new keys can be added without breaking old tokens.
- JWT can't truly revoke without state — pair short-lived access tokens (5-15 min) with opaque refresh tokens (DB-backed, revocable). The deny list works for the access tokens but is bounded by their TTL.
- For refresh-token rotation, use a "family id" so any replay (a token used twice) revokes the entire family. Defends against stolen refresh tokens.

## Common Mistake

> [!warning] Calling `jwt.decode(token, key)` without `algorithms=`, or passing `algorithms=None` / `[]`. The "alg":"none" attack: a token forged with `{"alg":"none"}` header and no signature passes verification if the library accepts "none". PyJWT requires `algorithms=` and rejects "none" by default — pin to the SINGLE algorithm you actually use.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Missing algorithms= — historical "alg=none" footgun
claims = jwt.decode(token, key)
```

**Senior:**
```python
# Pin to the single allowed algorithm
claims = jwt.decode(token, key, algorithms=["EdDSA"],
                    issuer=ISSUER, audience=AUDIENCE)
```

## See Also

- [[Sections/crypto-secrets/tokens/oauth2-flow|OAuth 2.0 — Authorization Code flow with PKCE (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/session-tokens|Session tokens — opaque vs JWT, cookie attributes, revocation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/_Index|Crypto & Secrets → Tokens — JWT, OAuth 2.0, sessions]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

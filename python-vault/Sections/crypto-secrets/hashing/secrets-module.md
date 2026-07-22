---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "hashing"
id: "secrets-module"
title: "secrets — cryptographically-secure tokens and constants"
category: "Hashing"
subtitle: "secrets.token_bytes / token_urlsafe / token_hex, secrets.compare_digest, secrets.choice / randbelow, never random for security, store hashed tokens"
signature_short: "token = secrets.token_urlsafe(32); hashed = hashlib.sha256(token.encode()).hexdigest()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "secrets — cryptographically-secure tokens and constants"
  - "secrets-module"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/hashing"
  - "category/hashing"
  - "tier/tiered"
---

# secrets — cryptographically-secure tokens and constants

> secrets.token_bytes / token_urlsafe / token_hex, secrets.compare_digest, secrets.choice / randbelow, never random for security, store hashed tokens

## Overview

The `secrets` module (Python 3.6+) is the stdlib answer to "I need a cryptographically secure random value". It wraps `os.urandom` (the OS's CSPRNG) with friendly APIs: `token_bytes(n)`, `token_urlsafe(n)`, `token_hex(n)`, plus `choice()` and `randbelow()` for selection without bias. Critical: for security purposes, NEVER use `random` (Mersenne Twister; predictable from output). Tokens themselves should be stored HASHED in the database (so a DB leak doesn't reveal active tokens); the user receives the raw token, the DB stores the SHA-256. The three examples solve the SAME concrete task — generate a password-reset token; verify it without timing leaks; expire and revoke — at three depths: literal `token_urlsafe(32)` → store the hash + expiry + single-use → HMAC-signed stateless tokens via `itsdangerous` + revocation lists + format conventions.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Generate a password-reset token; the user clicks a link containing it; we verify it on the next request.
- **Junior** — SAME — but store the HASH of the token (not the token itself), set expiry, single-use semantics, constant-time comparison on the hash.
- **Senior** — SAME — production: HMAC-signed STATELESS tokens (no DB row per token), structured payload (user_id + expiry), key rotation via "kid" prefix, revocation list for compromised tokens.

## Signature

```python
token = secrets.token_urlsafe(32); hashed = hashlib.sha256(token.encode()).hexdigest()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Generate a password-reset token; the user clicks a link
#             containing it; we verify it on the next request.
# APPROACH  - secrets.token_urlsafe(32) returns a 43-char URL-safe
#             base64 string; store and compare via compare_digest.
# STRENGTHS - secrets module wraps os.urandom (CSPRNG); 256 bits of
#             entropy is more than enough for a token.
# WEAKNESSES- Storing the raw token in DB means a DB leak gives an
#             attacker active session tokens; junior tier stores the
#             hash instead.
import secrets

# Generate.
def make_reset_token() -> str:
    return secrets.token_urlsafe(32)                  # 32 bytes = 256 bits = ~43 chars

# Use.
token = make_reset_token()
print(token)                                           # e.g. "k3y7DqL...8X4Q"
print(len(token))                                      # 43

# Verify (intro tier — flawed; junior fixes it).
def verify_token(stored: str, presented: str) -> bool:
    return secrets.compare_digest(stored, presented)   # constant-time compare

# token_bytes for binary contexts; token_hex for hex strings.
secrets.token_bytes(32)                                # b'\xab...'  32 bytes
secrets.token_hex(32)                                  # "ab..." 64-char hex string

# Random selection without bias.
secrets.choice(["alice", "bob", "carol"])              # uniform random
secrets.randbelow(1000)                                # 0 <= n < 1000, unbiased

# NEVER use random for security:
import random
# random.choice(...)                                   # PREDICTABLE — Mersenne Twister
# After ~600 outputs, the entire RNG state can be recovered.

# What "secure" means for tokens:
#  - 128 bits of entropy (16 random bytes) is fine for short-lived tokens.
#  - 256 bits (32 bytes) is generous; the default for token_urlsafe.
#  - Anything < 64 bits is brute-forceable.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but store the HASH of the token (not the token
#             itself), set expiry, single-use semantics, constant-time
#             comparison on the hash.
# APPROACH  - Generate raw token; SHA-256 the token; store the hash
#             with TTL + used-flag; URL contains raw token; verify by
#             hashing again and comparing.
# STRENGTHS - DB leak doesn\'t reveal active tokens (attacker sees
#             only hashes; can\'t brute-force a 256-bit token).
#             Single-use means a leaked token can\'t be replayed.
# WEAKNESSES- Stateful — needs a DB row per token. Senior tier shows
#             stateless HMAC-signed tokens for some use cases.
import secrets, hashlib, time

def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()

# Persistence layer (sketch — use your real DB).
class ResetTokenStore:
    def __init__(self):
        self._tokens: dict[str, dict] = {}             # token_hash -> {user_id, expires_at, used}

    def issue(self, user_id: int, *, ttl_s: int = 3600) -> str:
        raw = secrets.token_urlsafe(32)
        h = hash_token(raw)
        self._tokens[h] = {
            "user_id": user_id,
            "expires_at": time.time() + ttl_s,
            "used": False,
        }
        return raw                                     # the user gets the raw token
        # In email: f"Click here: https://app.example.com/reset?token={raw}"

    def consume(self, raw: str) -> int | None:
        """Returns user_id on success, None otherwise. Marks used."""
        h = hash_token(raw)
        rec = self._tokens.get(h)
        if rec is None:                                # token doesn't exist
            return None
        if rec["used"]:                                # already consumed
            return None
        if time.time() > rec["expires_at"]:           # expired
            del self._tokens[h]
            return None
        rec["used"] = True                             # single-use
        return rec["user_id"]

# Usage flow:
#   1. User submits "forgot password" with their email.
#   2. token = store.issue(user.id, ttl_s=3600)
#   3. send_email(user.email, f"Reset link: https://app/reset?t={token}")
#   4. User clicks; handler receives token from query string.
#   5. user_id = store.consume(token)
#   6. If user_id is not None, render the password-reset form.
#
# Security properties we get:
#   - Raw token never persisted -> DB leak yields hashes only
#   - Single-use -> link can\'t be replayed
#   - Expiry -> stale links can\'t be exploited months later
#   - Constant-time -> dict lookup by hash; no timing attack on token

# Constant-time comparison even for fixed-length strings.
import hmac
def safe_match(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())

# Common gotcha: don't reveal which step failed.
# A reset endpoint should respond identically whether:
#   - the email isn't registered
#   - the token doesn't exist
#   - the token is expired
# Otherwise attackers can enumerate users / valid tokens.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: HMAC-signed STATELESS tokens
#             (no DB row per token), structured payload (user_id +
#             expiry), key rotation via "kid" prefix, revocation
#             list for compromised tokens.
# APPROACH  - itsdangerous.URLSafeTimedSerializer signs a payload
#             with HMAC; verification runs locally with no DB lookup.
#             Trade-off: revocation requires a "denied" list (small
#             vs the unbounded set of issued tokens).
# STRENGTHS - Scales: 1M tokens issued = 0 DB rows; only revoked
#             tokens consume storage. Self-contained: the token IS
#             the proof.
# WEAKNESSES- Revocation needs a list (cap with TTL); key compromise
#             requires rotating the signing key (and a grace period).
import os, time, hmac, hashlib
import itsdangerous
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from typing import Optional

# Secret key — rotate periodically; load from secrets manager.
CURRENT_KEY = os.environ["TOKEN_SIGNING_KEY"]
RETIRED_KEYS: list[str] = os.environ.get("TOKEN_RETIRED_KEYS", "").split(",")
RETIRED_KEYS = [k for k in RETIRED_KEYS if k]

# Multiple serializers — one per key, for verification of old tokens.
def _serializer(key: str) -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(secret_key=key, salt="password-reset")

CURRENT_SER = _serializer(CURRENT_KEY)
ALL_SERS = [CURRENT_SER] + [_serializer(k) for k in RETIRED_KEYS]

# Revocation list — bounded by TTL of issued tokens.
REVOKED: dict[str, float] = {}                         # token_hash -> expires_at

def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

# 1) Issue: payload is just user_id; itsdangerous adds timestamp + HMAC.
def issue_reset_token(user_id: int) -> str:
    return CURRENT_SER.dumps(user_id)
    # Returned token: <base64-payload>.<base64-timestamp>.<base64-hmac>

# 2) Verify: check signature (any accepted key), check expiry, check
#    revocation list.
def verify_reset_token(token: str, *, max_age_s: int = 3600) -> Optional[int]:
    if _token_hash(token) in REVOKED:
        return None
    for ser in ALL_SERS:
        try:
            user_id = ser.loads(token, max_age=max_age_s)
            return int(user_id)
        except SignatureExpired:
            return None
        except BadSignature:
            continue                                   # try next key (rotation)
    return None

# 3) Revoke (e.g. on logout, password change).
def revoke_token(token: str) -> None:
    """Add to revocation list; auto-removed after TTL."""
    REVOKED[_token_hash(token)] = time.time() + 3600

def gc_revocation_list() -> None:
    """Run periodically; remove expired entries."""
    now = time.time()
    for h, exp in list(REVOKED.items()):
        if exp < now:
            del REVOKED[h]

# 4) Combined: structured payload with version + kid (key rotation).
def issue_with_kid(user_id: int, *, kid: str = "v3") -> str:
    payload = {"sub": user_id, "kid": kid}
    return CURRENT_SER.dumps(payload)

# 5) Token-format conventions — pick ONE per use case.
#
#   Format         Bytes  Use case
#   token_bytes    raw    Binary contexts (don't put in URL)
#   token_hex      2x     Old-school; works in URL but uglier
#   token_urlsafe  4/3    Modern URL/cookie tokens; ~43 chars for 32 bytes
#   itsdangerous   +sig   HMAC-signed; payload + timestamp + signature
#   JWT            +sig   Like itsdangerous but with JSON payload + alg negotiation
#                         — see jwt-python entry; usually overkill for password resets
#
# itsdangerous is the right level for password reset; JWT for auth tokens
# that need claims interoperability across services.

# Decision rule:
#   need a non-guessable string          -> secrets.token_urlsafe(32)
#   binary contexts                       -> secrets.token_bytes(N)
#   pre-share to a user via URL          -> token_urlsafe + DB-stored hash + TTL
#   1M tokens at scale                    -> stateless HMAC-signed (itsdangerous)
#   need claims (issuer, audience, scopes) -> JWT (see jwt-python entry)
#   need to revoke at any time            -> stateful (DB row); OR revocation list for stateless
#   compare two tokens                    -> hmac.compare_digest, NEVER ==
#   need <128 bits of entropy             -> NO; use 128+ always for tokens
#   single-use semantics                   -> store + mark consumed; or token-includes-nonce
#   key rotation                          -> kid in payload OR multi-serializer verify
#   want to use random module             -> NO; only secrets / os.urandom for security
#
# Anti-pattern: using uuid.uuid4() as a security token. UUID4 is 122
# bits of randomness in a 36-char string — fine entropy, but the
# format is recognizable AND it's easy to start using uuid1 (which
# leaks MAC + timestamp) by accident. secrets.token_urlsafe(16) is
# 128 bits in 22 chars and unambiguously cryptographic. uuid is for
# IDs (database rows, request IDs); secrets is for tokens (anything
# the user mustn't guess).
```

## Decision Rule

```text
need a non-guessable string          -> secrets.token_urlsafe(32)
binary contexts                       -> secrets.token_bytes(N)
pre-share to a user via URL          -> token_urlsafe + DB-stored hash + TTL
1M tokens at scale                    -> stateless HMAC-signed (itsdangerous)
need claims (issuer, audience, scopes) -> JWT (see jwt-python entry)
need to revoke at any time            -> stateful (DB row); OR revocation list for stateless
compare two tokens                    -> hmac.compare_digest, NEVER ==
need <128 bits of entropy             -> NO; use 128+ always for tokens
single-use semantics                   -> store + mark consumed; or token-includes-nonce
key rotation                          -> kid in payload OR multi-serializer verify
want to use random module             -> NO; only secrets / os.urandom for security
```

## Anti-Pattern

> [!warning] Anti-pattern
> using uuid.uuid4() as a security token. UUID4 is 122
> bits of randomness in a 36-char string — fine entropy, but the
> format is recognizable AND it's easy to start using uuid1 (which
> leaks MAC + timestamp) by accident. secrets.token_urlsafe(16) is
> 128 bits in 22 chars and unambiguously cryptographic. uuid is for
> IDs (database rows, request IDs); secrets is for tokens (anything
> the user mustn't guess).

## Tips

- `secrets.token_urlsafe(32)` is the right default for any URL/cookie token: 256 bits of entropy in 43 URL-safe characters. For shorter contexts, 16 bytes (128 bits) is still cryptographically strong.
- Always store the HASH of a token, not the raw token. A DB leak gives the attacker only hashes; they can't brute-force a 256-bit token. The user receives the raw token; the DB stores `sha256(token)`.
- NEVER use `random` for security purposes. `random` uses Mersenne Twister, whose state can be reconstructed from ~600 consecutive outputs. `secrets` uses `os.urandom` (the OS CSPRNG).
- For password-reset tokens, set: SHORT TTL (1 hour), single-use (mark consumed), constant-time match (`compare_digest`), and identical responses for "user not found" vs "token expired" (don't enable enumeration).
- `itsdangerous` (Pallets project) is the right level for stateless HMAC-signed tokens — simpler than JWT, no algorithm negotiation footgun, ideal for password reset / email confirmation links.
- UUID is for IDs (database rows, request IDs). `secrets.token_urlsafe` is for tokens. `uuid4` is fine entropy but not unambiguously cryptographic; `uuid1` leaks MAC + timestamp.

## Common Mistake

> [!warning] Using `uuid.uuid4()` as a security token. UUID4 is 122 bits of randomness — fine entropy — but the format is recognizable as a UUID, AND the typo `uuid1()` (which leaks the MAC address and timestamp) is one character away. `secrets.token_urlsafe(16)` is 128 bits in 22 unambiguously-cryptographic characters. UUID for IDs (DB rows, request IDs); `secrets` for tokens (anything the user mustn't guess).

## Shorthand (Junior → Senior)

**Junior:**
```python
# UUID4 — fine entropy, but format-confusable with uuid1 (insecure)
import uuid
token = str(uuid.uuid4())
```

**Senior:**
```python
# secrets.token_urlsafe — 256 bits, unambiguously cryptographic
import secrets
token = secrets.token_urlsafe(32)
```

## See Also

- [[Sections/crypto-secrets/hashing/hashlib-modern|hashlib & hmac — content hashing and message authentication (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/password-hashing|argon2 / bcrypt — store and verify passwords correctly (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/_Index|Crypto & Secrets → Hashing & MAC — hashlib, password hashing, secrets]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

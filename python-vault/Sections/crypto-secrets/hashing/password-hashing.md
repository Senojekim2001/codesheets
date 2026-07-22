---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "hashing"
id: "password-hashing"
title: "argon2 / bcrypt — store and verify passwords correctly"
category: "Hashing"
subtitle: "argon2-cffi PasswordHasher, hash + verify, parameters (time/memory/parallelism), needs_rehash, bcrypt for compat, dual-hash migration, pepper"
signature_short: "ph = PasswordHasher(); h = ph.hash(pw); ph.verify(h, pw); ph.check_needs_rehash(h)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "argon2 / bcrypt — store and verify passwords correctly"
  - "password-hashing"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/hashing"
  - "category/hashing"
  - "tier/tiered"
---

# argon2 / bcrypt — store and verify passwords correctly

> argon2-cffi PasswordHasher, hash + verify, parameters (time/memory/parallelism), needs_rehash, bcrypt for compat, dual-hash migration, pepper

## Overview

Password hashing needs slow, memory-hard, salted-by-default algorithms — generic hashes (SHA-256, even MD5) crack at billions of attempts/second on modern GPUs. Argon2 (Password Hashing Competition winner, 2015) is the current default for new code; `argon2-cffi` is the canonical Python implementation. bcrypt remains acceptable for legacy systems and Django's default. NEVER write your own; NEVER use SHA-* for passwords; NEVER store plaintext. The three examples solve the SAME concrete task — store a user's password securely, verify it on login, upgrade to stronger parameters without forcing password resets — at three depths: argon2 hash + verify → tuned parameters + `needs_rehash()` upgrade flow + bcrypt for legacy → production with pepper, login rate limiting, dual-hash migration from bcrypt to argon2, timing-attack avoidance.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Hash a password for storage; verify it on login.
- **Junior** — SAME — but tune parameters for your hardware, detect when a stored hash needs an upgrade, support bcrypt for legacy users.
- **Senior** — SAME — production: pepper, rate-limited login, atomic dual-hash migration from bcrypt to argon2, timing-attack defense (constant-time response regardless of whether the user exists).

## Signature

```python
ph = PasswordHasher(); h = ph.hash(pw); ph.verify(h, pw); ph.check_needs_rehash(h)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Hash a password for storage; verify it on login.
# APPROACH  - argon2-cffi PasswordHasher with default parameters.
#             .hash() returns a string with embedded params + salt.
#             .verify() raises on mismatch; returns None on success.
# STRENGTHS - Defaults are safe; salt + algorithm baked into the hash;
#             upgrades work because each hash carries its own params.
# WEAKNESSES- Don't roll your own; don't use SHA family. See junior
#             tier for tuning + bcrypt compatibility.

# pip install argon2-cffi
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()                                  # default params (~50ms / hash on a laptop)

# Storing a new password.
def store_password(plain: str) -> str:
    return ph.hash(plain)
    # Returns something like:
    # $argon2id$v=19$m=65536,t=3,p=4$<base64-salt>$<base64-hash>

# Verifying on login.
def check_password(stored_hash: str, plain: str) -> bool:
    try:
        ph.verify(stored_hash, plain)
        return True
    except VerifyMismatchError:
        return False

# Use:
db_hash = store_password("hunter2")
print(db_hash[:32])                                    # $argon2id$v=19$m=65536,t=3,p=4
print(check_password(db_hash, "hunter2"))              # True
print(check_password(db_hash, "wrong"))                # False

# Argon2 has THREE variants:
#   argon2id  - hybrid; default; resistant to side-channels AND GPU attacks (USE THIS)
#   argon2i   - resists side-channels; weaker against GPU
#   argon2d   - resists GPU; weak against side-channels
# argon2-cffi defaults to argon2id — leave it.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tune parameters for your hardware, detect
#             when a stored hash needs an upgrade, support bcrypt for
#             legacy users.
# APPROACH  - Tune time_cost / memory_cost so each hash takes ~250ms;
#             check_needs_rehash() on every successful login; if so,
#             rehash and update DB. bcrypt for legacy systems via
#             passlib (which understands many algorithms).
# STRENGTHS- Future-proof: hashes carry their own params, so increasing
#             work factor over years requires no migration script —
#             logins automatically upgrade themselves.
# WEAKNESSES- Tuning takes some experimentation; too high blocks login
#             at peak traffic, too low weakens against future attackers.
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHash

# Tune: aim for 100-500ms per hash on YOUR production hardware.
# These are roughly the OWASP 2023 recommendations.
ph = PasswordHasher(
    time_cost=3,                                      # iterations
    memory_cost=65536,                                # 64 MiB
    parallelism=4,                                    # threads
    hash_len=32,                                      # output length
    salt_len=16,                                      # 128-bit random salt
)

# Hash + verify with auto-upgrade.
def store_password(plain: str) -> str:
    return ph.hash(plain)

def check_password_and_maybe_upgrade(stored_hash: str, plain: str) -> tuple[bool, str | None]:
    """
    Returns (ok, new_hash_or_None).
    If new_hash_or_None is set, save it to DB — params have been upgraded.
    """
    try:
        ph.verify(stored_hash, plain)
    except VerifyMismatchError:
        return (False, None)
    except InvalidHash:
        # Stored hash is in some other format (bcrypt? legacy?).
        return (False, None)
    if ph.check_needs_rehash(stored_hash):
        return (True, ph.hash(plain))                 # rehash with current params
    return (True, None)

# In your login handler.
# row = db.fetch_user_by_email(email)
# ok, new_hash = check_password_and_maybe_upgrade(row.password_hash, submitted_password)
# if ok:
#     if new_hash:
#         db.update_user_password_hash(row.id, new_hash)   # transparent upgrade
#     start_session(row)

# Bcrypt support — for migrating from a legacy bcrypt-based service.
# pip install bcrypt
import bcrypt

def is_bcrypt_hash(h: str) -> bool:
    return h.startswith("$2a$") or h.startswith("$2b$") or h.startswith("$2y$")

def check_bcrypt(stored_hash: str, plain: str) -> bool:
    return bcrypt.checkpw(plain.encode(), stored_hash.encode())

# Combined: support either format on read; always write argon2.
def authenticate(stored_hash: str, plain: str) -> tuple[bool, str | None]:
    if is_bcrypt_hash(stored_hash):
        if check_bcrypt(stored_hash, plain):
            return (True, ph.hash(plain))             # upgrade to argon2 on success
        return (False, None)
    return check_password_and_maybe_upgrade(stored_hash, plain)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: pepper, rate-limited login, atomic
#             dual-hash migration from bcrypt to argon2, timing-attack
#             defense (constant-time response regardless of whether
#             the user exists).
# APPROACH  - HMAC the password with a server-side pepper before
#             argon2; rate-limit by IP and account; on every successful
#             login, transparently upgrade old hashes; deliberately
#             waste time on missing-account so timing doesn't reveal
#             enumeration.
# STRENGTHS - Pepper means a DB leak alone doesn't give attackers a
#             crackable hash list (they also need the application
#             secret); rate limiting bounds online attacks; constant-
#             time response prevents account-enumeration.
# WEAKNESSES- Pepper rotation is a multi-step operation (you can't
#             change the pepper without re-hashing everything); store
#             it in your secrets manager (see secrets-vault entry).
import os, time, hmac, hashlib, logging
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHash
import bcrypt

log = logging.getLogger(__name__)

# 1) Pepper — a server-side secret added to every password before hashing.
#    Stored in a secrets manager (NOT the DB). A DB-only leak yields
#    hashes that need both the leaked DB AND the leaked pepper to crack.
PEPPER = os.environ["PASSWORD_PEPPER"].encode()        # at least 32 random bytes

ph = PasswordHasher(
    time_cost=3, memory_cost=65536, parallelism=4,
    hash_len=32, salt_len=16,
)

def _peppered(plain: str) -> bytes:
    """HMAC-SHA256(pepper, password) — constant-length input to argon2."""
    return hmac.new(PEPPER, plain.encode(), hashlib.sha256).digest()

def hash_password(plain: str) -> str:
    return ph.hash(_peppered(plain))

def is_bcrypt(h: str) -> bool:
    return h.startswith("$2a$") or h.startswith("$2b$") or h.startswith("$2y$")

# 2) Verify with dual-hash support + transparent upgrade.
def verify_password(stored_hash: str, plain: str) -> tuple[bool, str | None]:
    """Returns (ok, new_hash_to_persist_or_None)."""
    peppered = _peppered(plain)
    try:
        if is_bcrypt(stored_hash):
            # Legacy bcrypt — was the password hashed without pepper?
            # Try with-pepper first (new code); fall back to without (legacy).
            try:
                ok = bcrypt.checkpw(peppered, stored_hash.encode())
            except ValueError:
                ok = bcrypt.checkpw(plain.encode(), stored_hash.encode())
            if ok:
                return (True, hash_password(plain))   # upgrade to peppered argon2
            return (False, None)
        ph.verify(stored_hash, peppered)
    except (VerifyMismatchError, InvalidHash):
        return (False, None)
    if ph.check_needs_rehash(stored_hash):
        return (True, hash_password(plain))
    return (True, None)

# 3) Constant-time login response — defeats account enumeration timing.
DUMMY_HASH = ph.hash(_peppered("never-matches-anyone"))

def authenticate(email: str, plain: str, *, db, ip: str) -> dict | None:
    """
    Returns a session dict on success; None on failure.
    Takes ~250ms regardless of whether the email exists or the password matched
    (otherwise an attacker can enumerate registered emails by timing).
    """
    # Rate-limit before doing expensive work.
    if not _rate_limit_check(ip, email):
        time.sleep(0.25)                              # constant time even when rate-limited
        return None

    row = db.fetch_user_by_email(email)
    if row is None:
        # Compute a hash anyway so timing matches the success path.
        try: ph.verify(DUMMY_HASH, _peppered(plain))
        except VerifyMismatchError: pass
        return None

    ok, new_hash = verify_password(row.password_hash, plain)
    if not ok:
        return None

    if new_hash:
        db.update_password_hash(row.id, new_hash)     # transparent upgrade
        log.info("password_hash_upgraded", extra={"user_id": row.id})

    return {"user_id": row.id, "email": row.email}

def _rate_limit_check(ip: str, email: str) -> bool:
    """Return False if too many recent attempts. (Use Redis token bucket
    in production.) Per-IP and per-email."""
    return True                                        # placeholder

# 4) Pepper rotation playbook (commented).
# Pepper rotation is operationally heavy: you can't simply replace it
# without invalidating every password hash. Two strategies:
#  (a) Stop-the-world: force a password reset for every user (rare).
#  (b) Rolling: add a "pepper version" prefix to the hash, e.g.
#      "v2:{argon2_hash}". Verify path tries the current pepper first;
#      if hash starts with "v1:", strip it and try the old pepper. On
#      success, re-hash with the new pepper as "v2:...". After the
#      window passes, force-reset any "v1:" leftovers.

# Decision rule:
#   new code, password storage           -> argon2 (argon2-cffi); USE argon2id variant
#   legacy / Django default              -> bcrypt (still acceptable; Django uses it)
#   shared lib must support both          -> passlib CryptContext schemes=['argon2','bcrypt']
#   server-side pepper                    -> HMAC-SHA256(pepper, password) before argon2
#   tune parameters                       -> aim for 100-500ms per hash on prod hardware
#   parameters need upgrade               -> ph.check_needs_rehash on every login -> rehash
#   prevent account enumeration          -> verify against DUMMY_HASH on missing account
#   prevent online brute force           -> rate-limit per IP and per account
#   compare hashes / passwords           -> NEVER ==; argon2 + bcrypt verify use compare_digest internally
#   migrate from another scheme         -> dual-verify path; rehash to current scheme on success
#   remember me / persistent login       -> separate token; do NOT re-hash the password
#
# Anti-pattern: using SHA-* (or anything from hashlib) for password
# storage. Generic hashes are designed to be FAST — that's the
# property attackers want too. A modern GPU computes ~10 billion
# SHA-256 hashes per second; a typical 8-character password cracks in
# under an hour. Argon2 takes ~250ms per attempt by design — a 1000×
# slowdown that makes brute force economically infeasible.
```

## Decision Rule

```text
new code, password storage           -> argon2 (argon2-cffi); USE argon2id variant
legacy / Django default              -> bcrypt (still acceptable; Django uses it)
shared lib must support both          -> passlib CryptContext schemes=['argon2','bcrypt']
server-side pepper                    -> HMAC-SHA256(pepper, password) before argon2
tune parameters                       -> aim for 100-500ms per hash on prod hardware
parameters need upgrade               -> ph.check_needs_rehash on every login -> rehash
prevent account enumeration          -> verify against DUMMY_HASH on missing account
prevent online brute force           -> rate-limit per IP and per account
compare hashes / passwords           -> NEVER ==; argon2 + bcrypt verify use compare_digest internally
migrate from another scheme         -> dual-verify path; rehash to current scheme on success
remember me / persistent login       -> separate token; do NOT re-hash the password
```

## Anti-Pattern

> [!warning] Anti-pattern
> using SHA-* (or anything from hashlib) for password
> storage. Generic hashes are designed to be FAST — that's the
> property attackers want too. A modern GPU computes ~10 billion
> SHA-256 hashes per second; a typical 8-character password cracks in
> under an hour. Argon2 takes ~250ms per attempt by design — a 1000×
> slowdown that makes brute force economically infeasible.

## Tips

- argon2id (the default in argon2-cffi) is the right variant — hybrid argon2i + argon2d, resistant to both side-channel and GPU attacks. Don't change it without strong reason.
- Tune parameters so each hash takes 100-500ms on your production hardware. Too low = brute-forceable; too high = login becomes a DOS vector. OWASP's 2023 recs: t=3, m=64MB, p=4 is a reasonable starting point.
- `ph.check_needs_rehash(stored_hash)` returns True if the stored hash uses weaker parameters than your current config. Rehash on every successful login to transparently upgrade the corpus over time.
- Pepper (HMAC the password with a server-side secret before argon2) is the second line of defense. A DB-only leak yields hashes that need both the leaked DB AND the leaked pepper to crack. Store the pepper in your secrets manager (see secrets-vault entry).
- For account enumeration defense, verify against a DUMMY_HASH when the email doesn't exist. Without this, timing reveals which emails are registered.
- Bcrypt has a hard limit of 72 bytes input; long passwords are silently truncated. Argon2 has no such limit. If you must use bcrypt, pre-hash with SHA-256 first to bypass the truncation.

## Common Mistake

> [!warning] Using SHA-* (or anything from `hashlib`) for password storage. Generic hashes are designed to be FAST — exactly the property attackers want. Modern GPUs compute ~10 billion SHA-256 hashes/second; an 8-character password cracks in under an hour. Argon2 takes ~250ms per attempt by design — a 1000× slowdown that makes brute force economically infeasible.

## Shorthand (Junior → Senior)

**Junior:**
```python
# SHA-256 — 10 billion attempts/sec on a GPU
db.password_hash = hashlib.sha256(password.encode()).hexdigest()
```

**Senior:**
```python
# argon2id — ~250ms per attempt; 1000x slowdown vs SHA
ph = PasswordHasher()
db.password_hash = ph.hash(password)
```

## See Also

- [[Sections/crypto-secrets/hashing/hashlib-modern|hashlib & hmac — content hashing and message authentication (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/secrets-module|secrets — cryptographically-secure tokens and constants (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/_Index|Crypto & Secrets → Hashing & MAC — hashlib, password hashing, secrets]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

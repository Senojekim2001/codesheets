---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "crypto"
id: "fernet-symmetric"
title: "Fernet — high-level symmetric encryption with rotation"
category: "Symmetric Crypto"
subtitle: "Fernet.generate_key, Fernet.encrypt / decrypt, MultiFernet for rotation, ttl on decrypt, base64 tokens, when Fernet is wrong"
signature_short: "token = Fernet(key).encrypt(plaintext); plaintext = Fernet(key).decrypt(token, ttl=86400)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Fernet — high-level symmetric encryption with rotation"
  - "fernet-symmetric"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/crypto"
  - "category/symmetric-crypto"
  - "tier/tiered"
---

# Fernet — high-level symmetric encryption with rotation

> Fernet.generate_key, Fernet.encrypt / decrypt, MultiFernet for rotation, ttl on decrypt, base64 tokens, when Fernet is wrong

## Overview

`cryptography.fernet.Fernet` is the "boring, just-works" symmetric encryption API: AES-128-CBC + HMAC-SHA256 in a base64-encoded token, with a built-in timestamp and an optional TTL on decrypt. The output is URL-safe and self-contained (algorithm + IV + ciphertext + MAC + timestamp all in one blob). Versus rolling your own AES: no padding bugs, no MAC-then-encrypt vs encrypt-then-MAC choice to mess up, no associated-data API to forget. Versus AES-GCM (next entry): no associated data; per-message HMAC overhead. The three examples solve the SAME concrete task — encrypt a sensitive DB field at rest, decrypt on read, rotate the encryption key without re-encrypting everything in one shot — at three depths: literal `Fernet.encrypt/decrypt` → `MultiFernet` for rotation + TTL on decrypt → production with key from secrets manager, batch-rotation script, kid prefix for explicit version tracking.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Encrypt a sensitive DB field (e.g., a user's recovery phone number) at rest; decrypt on read.
- **Junior** — SAME — but rotate the encryption key periodically. Old data stays decryptable until re-encrypted; new data always uses the current key.
- **Senior** — SAME — production: keys from a secrets manager (Vault / AWS / GCP); explicit kid prefix for tracking which key encrypted what; batch-rotation orchestration with progress + abort safety; alerting on retired-key usage.

## Signature

```python
token = Fernet(key).encrypt(plaintext); plaintext = Fernet(key).decrypt(token, ttl=86400)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Encrypt a sensitive DB field (e.g., a user's recovery
#             phone number) at rest; decrypt on read.
# APPROACH  - Fernet.generate_key() once at setup; encrypt/decrypt
#             on every write/read.
# STRENGTHS - Smallest correct symmetric encryption; URL-safe base64
#             output; key generation, IV handling, MAC all built in.
# WEAKNESSES- Single key; rotation requires MultiFernet (junior tier).

# pip install cryptography
from cryptography.fernet import Fernet

# Generate a key ONCE; store securely (secrets manager, NOT in code).
# key = Fernet.generate_key()
# print(key)  # b'gAAAAAB...'   # save this somewhere safe
KEY = b"gAAAAABm-replace-with-your-real-32-byte-base64-key="

f = Fernet(KEY)

def encrypt_field(plain: str) -> bytes:
    return f.encrypt(plain.encode("utf-8"))

def decrypt_field(token: bytes) -> str:
    return f.decrypt(token).decode("utf-8")

# Use:
encrypted = encrypt_field("+1-555-0100")
print(encrypted)                                       # b'gAAAAABm...'
print(decrypt_field(encrypted))                        # '+1-555-0100'

# What's in the token (you don't usually need to know):
#   version (1 byte) | timestamp (8 bytes) | IV (16 bytes) | ciphertext | HMAC (32 bytes)
# All base64url-encoded.

# Common mistakes this avoids:
#  - Hardcoded IV (Fernet generates a fresh random IV per encrypt)
#  - MAC-then-encrypt vs encrypt-then-MAC ordering bugs
#  - Forgetting to authenticate (Fernet always MACs)
#  - Padding oracle attacks (HMAC catches tampering before decryption)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but rotate the encryption key periodically.
#             Old data stays decryptable until re-encrypted; new data
#             always uses the current key.
# APPROACH  - MultiFernet([new_key, old_key]). encrypt() always uses
#             the FIRST key; decrypt() tries each key until one works.
#             A migration script re-encrypts old data over time.
# STRENGTHS- Zero-downtime rotation; no need to re-encrypt the whole
#             corpus before adding the new key.
# WEAKNESSES- Decrypt cost rises slightly with each retired key
#             (tries each in sequence); retire keys after migrating.
import os, time
from cryptography.fernet import Fernet, MultiFernet, InvalidToken

# Load keys — newest first; retired keys at the end.
CURRENT_KEY = os.environ["FERNET_KEY_CURRENT"].encode()
RETIRED_KEYS = [k.encode() for k in os.environ.get("FERNET_KEY_RETIRED", "").split(",") if k]

mf = MultiFernet([Fernet(CURRENT_KEY), *(Fernet(k) for k in RETIRED_KEYS)])

def encrypt(plain: bytes) -> bytes:
    return mf.encrypt(plain)                          # uses CURRENT_KEY

def decrypt(token: bytes, *, max_age_s: int | None = None) -> bytes:
    if max_age_s is None:
        return mf.decrypt(token)
    return mf.decrypt(token, ttl=max_age_s)           # raises InvalidToken if older

# 1) TTL on decrypt — useful for short-lived encrypted blobs
#    (password-reset payloads, session tokens, signed URLs).
def issue_signed_blob(payload: bytes) -> bytes:
    return encrypt(payload)

def consume_signed_blob(token: bytes, *, max_age_s: int = 3600) -> bytes:
    try:
        return decrypt(token, max_age_s=max_age_s)
    except InvalidToken:
        raise ValueError("token expired or tampered")

# 2) Re-encryption migration — slowly upgrade rows to the current key.
def rotate_one(token: bytes) -> bytes:
    """Decrypt with any key; re-encrypt with current. Use in a
    background batch job iterating DB rows."""
    return mf.rotate(token)                           # built-in rotate helper

# Background script (sketch):
def migrate_one_thousand(db) -> int:
    rows = db.fetch_old_encrypted_rows(limit=1000)
    n = 0
    for row in rows:
        new_token = rotate_one(row.encrypted_payload)
        db.update_encrypted_payload(row.id, new_token)
        n += 1
    return n

# Decryption helper that tells you WHICH key was used (for diagnostics).
def decrypt_with_diagnostic(token: bytes) -> tuple[bytes, int]:
    """Returns (plaintext, key_index). 0 = current; 1+ = retired."""
    keys = [Fernet(CURRENT_KEY), *(Fernet(k) for k in RETIRED_KEYS)]
    for i, k in enumerate(keys):
        try:
            return (k.decrypt(token), i)
        except InvalidToken:
            continue
    raise InvalidToken("no key matched")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: keys from a secrets manager (Vault /
#             AWS / GCP); explicit kid prefix for tracking which key
#             encrypted what; batch-rotation orchestration with
#             progress + abort safety; alerting on retired-key usage.
# APPROACH  - kid header byte before the Fernet token disambiguates
#             which key was used WITHOUT trying each in sequence.
#             Rotation is a job: scan, re-encrypt, persist, repeat.
#             Metrics surface "retired key still in use" so we know
#             when it's safe to delete the old key.
# STRENGTHS - Constant-time decrypt regardless of key history;
#             observable rotation; deletable retired keys after audit.
# WEAKNESSES- Custom token wrapper means you can't use Fernet's
#             plain decrypt directly. Some teams prefer to skip the
#             kid wrapper and live with MultiFernet's sequential try.
import os, time, logging
from cryptography.fernet import Fernet, InvalidToken
from prometheus_client import Counter, Histogram

log = logging.getLogger(__name__)

# 1) Key registry — one Fernet per kid; load from secrets manager.
KEYS: dict[str, Fernet] = {
    "v3": Fernet(os.environ["FERNET_V3"]),             # current — what we encrypt with
    "v2": Fernet(os.environ["FERNET_V2"]),             # retired — still able to decrypt
    "v1": Fernet(os.environ["FERNET_V1"]),             # retired
}
CURRENT_KID = "v3"

DECRYPT_BY_KID = Counter("crypto_decrypt_by_kid_total", "Decrypts by key id", ["kid"])
ROTATE_DURATION = Histogram("crypto_rotate_seconds", "Rotation duration")

# 2) Token format: <kid>:<fernet_token>. The kid prefix is plaintext;
#    Fernet's body is still authenticated.
def encrypt(plain: bytes) -> bytes:
    f = KEYS[CURRENT_KID]
    body = f.encrypt(plain)
    return f"{CURRENT_KID}:".encode() + body

def decrypt(token: bytes) -> bytes:
    try:
        kid_bytes, body = token.split(b":", 1)
    except ValueError:
        # No kid prefix — assume legacy; try every key.
        for kid, f in KEYS.items():
            try:
                pt = f.decrypt(token)
                DECRYPT_BY_KID.labels(kid=f"{kid}-legacy").inc()
                return pt
            except InvalidToken:
                continue
        raise InvalidToken("no matching key")
    kid = kid_bytes.decode()
    f = KEYS.get(kid)
    if f is None:
        raise InvalidToken(f"unknown kid: {kid}")
    DECRYPT_BY_KID.labels(kid=kid).inc()
    return f.decrypt(body)

# 3) Re-encrypt: decrypt with whatever, encrypt with current.
def rotate_one(token: bytes) -> tuple[bytes, str]:
    """Returns (new_token, source_kid)."""
    try:
        kid_bytes, body = token.split(b":", 1)
        source_kid = kid_bytes.decode()
    except ValueError:
        source_kid = "legacy"
    plain = decrypt(token)
    return (encrypt(plain), source_kid)

# 4) Batch rotation job — abort-safe, observable.
def rotate_batch(db, *, limit: int = 1000) -> dict:
    """Rotate up to LIMIT old-key rows. Idempotent; safe to re-run
    after a crash."""
    started = time.monotonic()
    rotated = 0
    rows = db.fetch_rows_needing_rotation(current_kid=CURRENT_KID, limit=limit)
    with ROTATE_DURATION.time():
        for row in rows:
            try:
                new_token, source_kid = rotate_one(row.encrypted_payload)
                db.update_encrypted_payload(row.id, new_token, current_kid=CURRENT_KID)
                rotated += 1
            except Exception as e:
                log.error("rotate_failed", extra={"row_id": row.id, "err": str(e)})
                # Don't abort batch on one failure; continue.
    elapsed = time.monotonic() - started
    log.info("rotate_batch_done", extra={"rotated": rotated, "elapsed_s": elapsed})
    return {"rotated": rotated, "elapsed_s": elapsed}

# 5) Operational query: how many rows still use a retired kid?
def rotation_progress(db) -> dict[str, int]:
    """{'v3': N_current, 'v2': N_retired, 'v1': N_retired}."""
    return db.count_rows_by_encryption_kid()

# 6) Alert: retired key STILL in use after grace period -> ops escalates.
#    Prometheus rule:
#    - alert: RetiredEncryptionKeyInUse
#      expr: rate(crypto_decrypt_by_kid_total{kid!="v3"}[1h]) > 0
#      for: 30m
#      labels: { severity: ticket }

# Decision rule:
#   "encrypt this DB column"            -> Fernet (or AES-GCM if you need AAD)
#   need authentication of plaintext   -> Fernet always authenticates (HMAC built-in)
#   need TTL on the ciphertext          -> Fernet ttl= on decrypt
#   key rotation                        -> MultiFernet (sequential try) OR kid prefix (constant time)
#   audit: which key encrypted this    -> kid prefix; MultiFernet doesn't tell you
#   secrets manager integration         -> load Fernet keys at startup; cache; rotate at config reload
#   need associated data                -> NOT Fernet — use AES-GCM (next entry)
#   streaming large file               -> NOT Fernet — chunked AES-GCM-SIV
#   need raw AES with custom mode       -> hazmat layer; you almost never do
#   shipping to a JS client            -> Fernet libs exist in JS; or use AES-GCM-SIV
#   regulated env, FIPS                -> verify cryptography backend; AES-CBC+HMAC is FIPS-OK
#
# Anti-pattern: hardcoding the Fernet key in source. The whole point
# is that the key is the secret; checking it into git makes encryption
# meaningless against anyone with read-access to the repo (now or
# future). Load from a secrets manager (env var loaded from Vault /
# AWS Secrets Manager / GCP Secret Manager). Rotate any key that ever
# touched git history.
```

## Decision Rule

```text
"encrypt this DB column"            -> Fernet (or AES-GCM if you need AAD)
need authentication of plaintext   -> Fernet always authenticates (HMAC built-in)
need TTL on the ciphertext          -> Fernet ttl= on decrypt
key rotation                        -> MultiFernet (sequential try) OR kid prefix (constant time)
audit: which key encrypted this    -> kid prefix; MultiFernet doesn't tell you
secrets manager integration         -> load Fernet keys at startup; cache; rotate at config reload
need associated data                -> NOT Fernet — use AES-GCM (next entry)
streaming large file               -> NOT Fernet — chunked AES-GCM-SIV
need raw AES with custom mode       -> hazmat layer; you almost never do
shipping to a JS client            -> Fernet libs exist in JS; or use AES-GCM-SIV
regulated env, FIPS                -> verify cryptography backend; AES-CBC+HMAC is FIPS-OK
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding the Fernet key in source. The whole point
> is that the key is the secret; checking it into git makes encryption
> meaningless against anyone with read-access to the repo (now or
> future). Load from a secrets manager (env var loaded from Vault /
> AWS Secrets Manager / GCP Secret Manager). Rotate any key that ever
> touched git history.

## Tips

- Fernet keys are 32 bytes URL-safe-base64. Generate ONCE with `Fernet.generate_key()`; store in a secrets manager; never check into source.
- `MultiFernet([new, old])` is the rotation primitive. New encryptions use the first key; decryption tries each in sequence. Pair with a background re-encryption job to retire old keys.
- `Fernet.decrypt(token, ttl=N)` returns `InvalidToken` if the token is older than N seconds — the cleanest way to time-bound short-lived ciphertexts (signed URLs, password-reset payloads).
- For "which key encrypted this?", prefix the token with a `kid:` byte — `f"v3:{token}"`. Constant-time decrypt regardless of key history, vs MultiFernet's try-each-in-sequence.
- Fernet authenticates the ciphertext but NOT any associated context (e.g., the user_id this token belongs to). If you need to bind ciphertext to context, use AES-GCM with associated data (next entry).
- For streaming a large file, Fernet is the wrong choice — it loads the whole plaintext + ciphertext in memory. Use chunked AES-GCM-SIV instead.

## Common Mistake

> [!warning] Hardcoding the Fernet key in source. The key IS the secret; checking it into git makes encryption meaningless against anyone with read-access to the repo (now or in the future via git history). Load from a secrets manager; rotate any key that ever touched git history.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Key in source — git history exposes it forever
KEY = b"gAAAAABm-stored-in-the-repo="
f = Fernet(KEY)
```

**Senior:**
```python
# Key from secrets manager; rotated on schedule
KEY = os.environ["FERNET_KEY_CURRENT"].encode()
f = Fernet(KEY)
```

## See Also

- [[Sections/crypto-secrets/crypto/aes-gcm-aead|AES-GCM — authenticated encryption with associated data (Crypto & Secrets)]]
- [[Sections/crypto-secrets/crypto/_Index|Crypto & Secrets → Crypto Primitives — Fernet, AES-GCM, Ed25519]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

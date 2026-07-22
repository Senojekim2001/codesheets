---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "secrets-management"
id: "key-rotation"
title: "Key rotation — dual-acceptance, kid prefix, batch re-encryption"
category: "Secrets Management"
subtitle: "dual-acceptance window, kid prefix on stored ciphertext, batch re-encryption job, rotation phases (prepare/dual/switch/retire), emergency rotation runbook"
signature_short: "phase 1: add new key; phase 2: encrypt with new, decrypt with both; phase 3: re-encrypt old; phase 4: retire old"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Key rotation — dual-acceptance, kid prefix, batch re-encryption"
  - "key-rotation"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/secrets-management"
  - "category/secrets-management"
  - "tier/tiered"
---

# Key rotation — dual-acceptance, kid prefix, batch re-encryption

> dual-acceptance window, kid prefix on stored ciphertext, batch re-encryption job, rotation phases (prepare/dual/switch/retire), emergency rotation runbook

## Overview

Rotation is the operational discipline that makes "we leaked the key" survivable. The principle is DUAL-ACCEPTANCE: during the rotation window, the system accepts both the old and new keys; it encrypts/signs only with the new. After old data is re-encrypted (or old tokens have expired), the old key is retired. The orchestration is four phases — Prepare (new key generated), Dual (both keys accepted; new key signs/encrypts), Switch (begin background re-encryption), Retire (old key removed after all data migrated and outstanding tokens expired). The three examples solve the SAME concrete task — rotate a Fernet key used to encrypt a DB column without downtime — at three depths: manual MultiFernet rotation → kid-prefixed ciphertext + background batch job + progress observability → production runbook with phases, automation hooks, emergency rotation when a key is compromised.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Rotate the Fernet key used to encrypt a DB column.
- **Junior** — SAME — but track WHICH key encrypted each row via a kid prefix; metrics surface "rows still on old key"; background job rotates with bounded concurrency.
- **Senior** — SAME — production: documented 4-phase runbook, automation via scheduled tasks, special handling for password-pepper rotation, emergency runbook for "key shipped to git".

## Signature

```python
phase 1: add new key; phase 2: encrypt with new, decrypt with both; phase 3: re-encrypt old; phase 4: retire old
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Rotate the Fernet key used to encrypt a DB column.
# APPROACH  - Add the new key alongside the old; MultiFernet decrypts
#             with either, encrypts with the first. Eventually re-
#             encrypt all rows, then drop the old key.
# STRENGTHS - Built-in to cryptography library; correct semantics in
#             one line.
# WEAKNESSES- All-or-nothing: you don\'t know progress without scanning;
#             can\'t tell which rows are still on the old key.
#             Junior tier adds explicit kid tracking.
import os
from cryptography.fernet import Fernet, MultiFernet

NEW_KEY = os.environ["FERNET_KEY_NEW"].encode()
OLD_KEY = os.environ["FERNET_KEY_OLD"].encode()

# Order matters: encrypt() uses keys[0]; decrypt() tries each in order.
mf = MultiFernet([Fernet(NEW_KEY), Fernet(OLD_KEY)])

def encrypt(plain: bytes) -> bytes:
    return mf.encrypt(plain)                          # always uses NEW_KEY

def decrypt(token: bytes) -> bytes:
    return mf.decrypt(token)                          # tries NEW first, then OLD

# Re-encrypt one row at a time.
def rotate_row(token: bytes) -> bytes:
    return mf.rotate(token)                           # decrypts with whichever key, re-encrypts with NEW

# Batch script (sketch):
def batch_rotate(db, *, limit: int = 1000) -> int:
    rows = db.fetch_rows(limit=limit)
    n = 0
    for row in rows:
        new_token = rotate_row(row.encrypted_payload)
        db.update_payload(row.id, new_token)
        n += 1
    return n

# Run nightly until 0 rows remain to rotate.
# Then deploy code that drops OLD_KEY from MultiFernet.

# Phases (in order):
#   1) Prepare:    generate NEW_KEY, store in secrets manager
#   2) Dual:       deploy with MultiFernet([NEW, OLD]); encrypts NEW, decrypts both
#   3) Switch:     run batch_rotate nightly; metric: rows-on-old-key
#   4) Retire:     deploy with [NEW] only; delete OLD from secrets manager
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but track WHICH key encrypted each row via a kid
#             prefix; metrics surface "rows still on old key";
#             background job rotates with bounded concurrency.
# APPROACH  - Token format: "<kid>:<fernet_token>". Constant-time
#             decrypt by kid lookup. Batch job queries for rows where
#             stored_kid != CURRENT_KID; counters track progress.
# STRENGTHS- Zero-downtime; observable progress; new rows always use
#             the current key; can target rotation queries efficiently.
# WEAKNESSES- Custom token wrapper means you can't use Fernet's plain
#             decrypt directly. The price for observability.
import os, time, logging
from cryptography.fernet import Fernet, InvalidToken
from prometheus_client import Counter, Gauge

log = logging.getLogger(__name__)

# kid -> Fernet (load all current+retired keys from secrets manager).
KEYS: dict[str, Fernet] = {
    "v3": Fernet(os.environ["FERNET_V3"]),             # current
    "v2": Fernet(os.environ["FERNET_V2"]),             # retired (still decrypts)
    "v1": Fernet(os.environ["FERNET_V1"]),             # retired
}
CURRENT_KID = "v3"

ROWS_ROTATED   = Counter("crypto_rotation_rotated_total", "Rows re-encrypted")
ROWS_FAILED    = Counter("crypto_rotation_failed_total",  "Rotation failures")
ROWS_REMAINING = Gauge("crypto_rotation_remaining",       "Rows still on old kid", ["kid"])
DECRYPTS_BY_KID = Counter("crypto_decrypts_by_kid_total", "Decrypts by kid", ["kid"])

# 1) Token format: kid prefix.
def encrypt(plain: bytes) -> bytes:
    body = KEYS[CURRENT_KID].encrypt(plain)
    return f"{CURRENT_KID}:".encode() + body

def decrypt(token: bytes) -> bytes:
    kid_bytes, body = token.split(b":", 1)
    kid = kid_bytes.decode()
    f = KEYS.get(kid)
    if f is None:
        raise InvalidToken(f"unknown kid: {kid}")
    DECRYPTS_BY_KID.labels(kid=kid).inc()
    return f.decrypt(body)

# 2) Re-encrypt: read with whatever, write with current.
def rotate_one(token: bytes) -> tuple[bytes, str]:
    """Returns (new_token, source_kid). Idempotent: rotating an already-
    current row yields a fresh ciphertext but with the same kid."""
    kid_bytes, body = token.split(b":", 1)
    source_kid = kid_bytes.decode()
    plain = decrypt(token)
    return (encrypt(plain), source_kid)

# 3) Batch rotation job — abort-safe, observable.
def rotate_batch(db, *, limit: int = 1000) -> dict:
    """Queries for rows NOT on CURRENT_KID; rotates limit at a time."""
    rows = db.fetch_rows_not_on_kid(current_kid=CURRENT_KID, limit=limit)
    rotated = 0
    for row in rows:
        try:
            new_token, source_kid = rotate_one(row.encrypted_payload)
            db.update_payload(row.id, new_token, current_kid=CURRENT_KID)
            ROWS_ROTATED.inc()
            rotated += 1
        except Exception as e:
            ROWS_FAILED.inc()
            log.error("rotation_failed", extra={"row_id": row.id, "err": str(e)})

    # Update the remaining gauge per kid.
    for kid in KEYS:
        if kid == CURRENT_KID: continue
        ROWS_REMAINING.labels(kid=kid).set(db.count_rows_on_kid(kid))
    return {"rotated": rotated}

# 4) Operational query: alert when retired key is STILL in use.
#    Prometheus alert rule:
#    - alert: RetiredKeyStillUsed
#      expr: rate(crypto_decrypts_by_kid_total{kid!="v3"}[1h]) > 0
#      for: 1h
#      labels: { severity: ticket }
#      annotations: { summary: "key {{ $labels.kid }} is retired but still being used" }
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: documented 4-phase runbook, automation
#             via scheduled tasks, special handling for password-pepper
#             rotation, emergency runbook for "key shipped to git".
# APPROACH  - The runbook IS the deliverable; the code automates it.
#             Phases are days/weeks apart in normal rotation, hours
#             during emergency. Pepper has a special version-prefix
#             format because each password is hashed (can't decrypt-and-
#             re-encrypt; only verify-and-re-hash on next login).
# STRENGTHS - Repeatable, calm rotation; survivable emergency response;
#             every step has a verification + rollback.
# WEAKNESSES- The runbook only matters if someone READS IT during an
#             incident — keep it short and current.
import os, time, logging, hmac, hashlib
from argon2 import PasswordHasher
from cryptography.fernet import Fernet
import boto3

log = logging.getLogger(__name__)

# === RUNBOOK: NORMAL FERNET KEY ROTATION ==============================
#
# Cadence: every 90 days (regulatory) or 365 days (best practice).
# Total wall-clock: 7-30 days depending on data volume.
#
# Phase 1: PREPARE (Day 1)
#   - Generate new key:   new = Fernet.generate_key()
#   - Store in secrets manager as FERNET_V4 (new); FERNET_V3 stays as current.
#   - Update rotation orchestration code: KEYS now contains v4 (new), v3, v2.
#   - Deploy with CURRENT_KID still = "v3" (nothing changes for users yet).
#   - Verify: monitor Prometheus crypto_decrypts_by_kid_total — should
#     show v3 dominant, v4 unused.
#
# Phase 2: DUAL ACCEPT + SWITCH ENCRYPTION (Day 2)
#   - Change CURRENT_KID = "v4". Deploy.
#   - New writes use v4. Reads still decrypt v3 + v4.
#   - Verify: crypto_decrypts_by_kid_total{kid="v4"} starts climbing.
#
# Phase 3: BACKGROUND RE-ENCRYPTION (Day 3 - Day N)
#   - Run rotate_batch on a schedule until count_rows_on_kid("v3") == 0.
#   - Estimate: 1M rows / 100 rows-per-second = ~3h job time;
#     spread over a few nights to keep DB load bounded.
#   - Verify nightly: ROWS_REMAINING gauge trending toward 0.
#
# Phase 4: RETIRE (Day N+7 — wait a week after Phase 3 for stragglers)
#   - Verify: count_rows_on_kid("v3") == 0 AND
#             rate(crypto_decrypts_by_kid_total{kid="v3"}[24h]) == 0.
#   - Deploy with v3 removed from KEYS.
#   - Delete FERNET_V3 from secrets manager.
#   - Done.

# === EMERGENCY RUNBOOK: KEY COMPROMISE =================================
#
# Triggers: key in git history, accidental log of decrypted secret,
# vault audit shows unauthorized access, ex-employee had key.
#
# 1) Generate new key NOW. Add as FERNET_V4 in secrets manager.
# 2) Deploy with CURRENT_KID = v4 IMMEDIATELY (skip the "calm" wait).
# 3) Run rotate_batch with HIGHER concurrency than usual; finish in
#    hours, not days. Monitor DB load.
# 4) When ROWS_REMAINING == 0, retire v3.
# 5) AUDIT: identify what was encrypted under the compromised key
#    and assume it's leaked. Rotate any ENCRYPTED secrets too
#    (passwords, API keys stored in encrypted columns).
# 6) Report per your incident response policy.

# === CODE: rotation orchestration scheduler ============================
def schedule_nightly_rotation(db) -> None:
    """Run from cron / k8s CronJob: every night at 02:00, rotate up to
    100k rows. Idempotent — abort safe; restart picks up where it left off."""
    started = time.monotonic()
    rotated_total = 0
    BATCH = 1000
    while True:
        result = rotate_batch(db, limit=BATCH)
        rotated_total += result["rotated"]
        if result["rotated"] < BATCH:
            break                                     # done; no more rows on old keys
        if rotated_total >= 100_000:
            break                                     # nightly budget
        if time.monotonic() - started > 3600:
            break                                     # 1 hour wall-clock cap
    log.info("nightly_rotation_complete", extra={"rotated_total": rotated_total})

# === SPECIAL CASE: PASSWORD PEPPER ROTATION ============================
#
# Pepper rotation is HARDER than encryption-key rotation because passwords
# are HASHED, not encrypted — you can't decrypt-and-re-hash. The migration
# happens incrementally: on each login, if the stored hash uses the old
# pepper, re-hash with the new pepper after successful verify.
#
# Hash format: "v{N}:{argon2_hash}". The version prefix tells verify
# which pepper to use.

PEPPER_V2 = os.environ["PASSWORD_PEPPER_V2"].encode()  # current
PEPPER_V1 = os.environ["PASSWORD_PEPPER_V1"].encode()  # retired

def _peppered(plain: str, version: int) -> bytes:
    pepper = {1: PEPPER_V1, 2: PEPPER_V2}[version]
    return hmac.new(pepper, plain.encode(), hashlib.sha256).digest()

ph = PasswordHasher()

def hash_password(plain: str) -> str:
    """Always hash with the CURRENT pepper version."""
    return f"v2:{ph.hash(_peppered(plain, version=2))}"

def verify_password(stored_hash: str, plain: str) -> tuple[bool, str | None]:
    """Returns (ok, new_hash_or_None). On successful verify with old
    pepper, returns a fresh hash with the new pepper — caller updates DB."""
    try:
        version_str, body = stored_hash.split(":", 1)
        version = int(version_str.lstrip("v"))
    except Exception:
        return (False, None)
    try:
        ph.verify(body, _peppered(plain, version=version))
    except Exception:
        return (False, None)
    if version != 2:                                   # rotate to v2 on success
        return (True, hash_password(plain))
    if ph.check_needs_rehash(body):
        return (True, hash_password(plain))
    return (True, None)

# Pepper migration completes naturally as users log in. After ~6 months,
# query for users still on v1; force a password reset email to the
# stragglers. Then retire PEPPER_V1.

# Decision rule:
#   normal scheduled rotation             -> 4-phase runbook over days/weeks
#   key compromise / emergency             -> same runbook, hours not weeks; audit what leaked
#   key shipped to git                     -> rotate IMMEDIATELY; assume leaked; rewrite git history
#   Fernet / AES-GCM key                   -> dual-accept + kid prefix + batch re-encrypt
#   JWT signing key                        -> dual-accept; old jwts still verify until exp
#   password pepper                        -> version prefix on hash; rotate on next login
#   secrets-manager value rotation         -> manager handles; app refreshes (secrets-vault entry)
#   key has TTL in cipher (Fernet ttl=)   -> rotation easier; old data ages out
#   need to know "is rotation done?"      -> Prometheus gauge of rows-still-on-old-key
#   too-aggressive rotation harming DB     -> bound batch size + nightly window
#   automation                              -> scheduled batch job; alert on stalls
#
# Anti-pattern: rotating in a single deploy that drops the old key.
# The deploy ships with CURRENT_KEY = new; old ciphertext can no longer
# decrypt; users see errors; you scramble to roll back. ALWAYS dual-
# accept first (deploy keeps both keys); switch encryption next; let
# data drain to the new key; THEN retire. The four phases exist for
# a reason — every shortcut has a corresponding outage.
```

## Decision Rule

```text
normal scheduled rotation             -> 4-phase runbook over days/weeks
key compromise / emergency             -> same runbook, hours not weeks; audit what leaked
key shipped to git                     -> rotate IMMEDIATELY; assume leaked; rewrite git history
Fernet / AES-GCM key                   -> dual-accept + kid prefix + batch re-encrypt
JWT signing key                        -> dual-accept; old jwts still verify until exp
password pepper                        -> version prefix on hash; rotate on next login
secrets-manager value rotation         -> manager handles; app refreshes (secrets-vault entry)
key has TTL in cipher (Fernet ttl=)   -> rotation easier; old data ages out
need to know "is rotation done?"      -> Prometheus gauge of rows-still-on-old-key
too-aggressive rotation harming DB     -> bound batch size + nightly window
automation                              -> scheduled batch job; alert on stalls
```

## Anti-Pattern

> [!warning] Anti-pattern
> rotating in a single deploy that drops the old key.
> The deploy ships with CURRENT_KEY = new; old ciphertext can no longer
> decrypt; users see errors; you scramble to roll back. ALWAYS dual-
> accept first (deploy keeps both keys); switch encryption next; let
> data drain to the new key; THEN retire. The four phases exist for
> a reason — every shortcut has a corresponding outage.

## Tips

- Rotation is FOUR phases — Prepare (new key generated), Dual (both accepted, new used), Switch (re-encryption job), Retire (old removed). Skipping a phase causes outages; document the runbook.
- kid prefix on stored ciphertext (`v3:gAAA...`) makes rotation observable. You can query "rows not on current kid" and `crypto_decrypts_by_kid_total` shows when it's safe to retire an old key.
- For Fernet, `MultiFernet` does the dual-accept work in one line. Encrypts with the first key, decrypts with any. The order in the list IS the rotation policy.
- Password pepper rotation is special — passwords are hashed (one-way), so you can't decrypt-and-re-hash. Use a version prefix on the stored hash; re-hash with the new pepper on successful verify. Migration completes as users log in.
- For emergency rotation (key in git, leaked credentials), the four phases compress from weeks to hours — but DON'T skip dual-accept. Outage in an emergency is much worse than a slow rotation.
- Set up a Prometheus alert on `crypto_decrypts_by_kid_total{kid != current}` for too long after Phase 4. A retired key still being used means you missed rows OR there's a stale deploy somewhere.

## Common Mistake

> [!warning] Rotating in a single deploy that drops the old key. The deploy ships with `CURRENT_KEY = new`; old ciphertext can no longer decrypt; every read errors; you scramble to roll back. ALWAYS dual-accept first (deploy with both keys; encrypt with new, decrypt with either); switch encryption next; let data drain via background re-encryption; THEN retire. The four phases exist for a reason.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Single-deploy "swap the key" — every existing ciphertext fails decrypt
KEYS = [Fernet(NEW_KEY)]   # OLD_KEY removed from config
# DB has 1M rows encrypted with OLD_KEY → all reads now error
```

**Senior:**
```python
# Phase 2: dual accept; new encryption; old still decrypts
KEYS = {"v4": Fernet(NEW), "v3": Fernet(OLD)}
CURRENT_KID = "v4"
# Then Phase 3: batch_rotate over weeks; Phase 4: drop v3.
```

## See Also

- [[Sections/crypto-secrets/secrets-management/env-var-secrets|Environment-variable secrets — typed loading and validation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/secrets-vault|Secrets manager — Vault / AWS / GCP with auto-rotation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/_Index|Crypto & Secrets → Secrets Management — env vars, Vault / KMS, key rotation]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

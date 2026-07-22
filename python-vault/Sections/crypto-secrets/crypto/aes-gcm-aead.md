---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "crypto"
id: "aes-gcm-aead"
title: "AES-GCM — authenticated encryption with associated data"
category: "Symmetric Crypto"
subtitle: "AESGCM, AESGCMSIV (nonce-misuse-resistant), ChaCha20Poly1305, 12-byte nonce, never-reuse rule, associated data, envelope encryption"
signature_short: "aead.encrypt(nonce_12, plaintext, associated_data); aead.decrypt(nonce_12, ct, associated_data)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "AES-GCM — authenticated encryption with associated data"
  - "aes-gcm-aead"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/crypto"
  - "category/symmetric-crypto"
  - "tier/tiered"
---

# AES-GCM — authenticated encryption with associated data

> AESGCM, AESGCMSIV (nonce-misuse-resistant), ChaCha20Poly1305, 12-byte nonce, never-reuse rule, associated data, envelope encryption

## Overview

AES-GCM (and its misuse-resistant variant AES-GCM-SIV) is the right primitive when you need: associated data (binds ciphertext to context), streaming (Fernet loads everything in memory), or ChaCha20-Poly1305 alternative (faster on hardware without AES-NI — most ARM mobile). The hard part is NONCE DISCIPLINE: AES-GCM is catastrophically broken if you ever reuse a (key, nonce) pair — the keystream XORs to plaintext. AES-GCM-SIV (RFC 8452) tolerates nonce reuse; for new code where you can't guarantee uniqueness, prefer it. The three examples solve the SAME concrete task — encrypt a message and bind it to its message_id (so a swapped ID fails to decrypt) — at three depths: random 12-byte nonce + AESGCM → key derivation via HKDF + AES-GCM-SIV (nonce-misuse-resistant) → production envelope encryption (data key per message; KEK encrypts data keys; integrates with KMS).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Encrypt a message; bind it to its message_id so swapping IDs at rest invalidates decryption.
- **Junior** — SAME — but use AES-GCM-SIV (RFC 8452) which is safe even if a nonce gets reused; derive the key from a passphrase via HKDF.
- **Senior** — SAME — production: envelope encryption (per-message data keys encrypted under a KEK; KEK lives in KMS), streaming encryption for large files, hardware-backed keys for high-value data.

## Signature

```python
aead.encrypt(nonce_12, plaintext, associated_data); aead.decrypt(nonce_12, ct, associated_data)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Encrypt a message; bind it to its message_id so swapping
#             IDs at rest invalidates decryption.
# APPROACH  - AES-GCM with a random 12-byte nonce per message.
#             associated_data parameter binds context (message_id)
#             without storing it in the ciphertext.
# STRENGTHS - Compact (16-byte tag vs Fernet's 73 bytes overhead),
#             associated-data binding, hardware-accelerated.
# WEAKNESSES- Manual nonce management; reuse a (key, nonce) pair and
#             the cipher breaks catastrophically. Senior tier shows
#             AES-GCM-SIV which tolerates nonce reuse.
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

KEY = AESGCM.generate_key(bit_length=256)             # 32 bytes
aead = AESGCM(KEY)

def encrypt_message(plaintext: bytes, *, message_id: bytes) -> tuple[bytes, bytes]:
    """Returns (nonce, ciphertext_with_tag)."""
    nonce = os.urandom(12)                            # 12 bytes; MUST be unique per (key, nonce)
    ct = aead.encrypt(nonce, plaintext, associated_data=message_id)
    return (nonce, ct)

def decrypt_message(nonce: bytes, ct: bytes, *, message_id: bytes) -> bytes:
    return aead.decrypt(nonce, ct, associated_data=message_id)
    # Raises InvalidTag if the ciphertext was tampered OR the
    # associated_data doesn't match what was used to encrypt.

# Use:
nonce, ct = encrypt_message(b"the order is paid", message_id=b"msg-42")
print(decrypt_message(nonce, ct, message_id=b"msg-42"))    # b'the order is paid'

# Tampering with the message_id breaks decryption — that's the WHOLE point.
try:
    decrypt_message(nonce, ct, message_id=b"msg-99")       # InvalidTag
except Exception as e:
    print(f"swapped ID rejected: {type(e).__name__}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use AES-GCM-SIV (RFC 8452) which is safe
#             even if a nonce gets reused; derive the key from a
#             passphrase via HKDF.
# APPROACH  - AESGCMSIV instead of AESGCM; HKDF derives the key from
#             a high-entropy "master secret" + a context label.
# STRENGTHS- Nonce reuse is non-catastrophic (worst case: equal
#             plaintexts produce equal ciphertexts — a leak, not
#             total break). HKDF lets ONE master secret protect
#             many independent uses without the AES-GCM nonce
#             coordination problem.
# WEAKNESSES- Slightly slower than AES-GCM (typically ~2×); not
#             hardware-accelerated everywhere. Worth it for nonce
#             safety in most contexts.
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCMSIV
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

# 1) Derive a context-specific key from a master secret.
def derive_key(master_secret: bytes, *, context: bytes, salt: bytes | None = None) -> bytes:
    """One master secret -> many independent keys via HKDF."""
    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        info=context,                                  # binds the derived key to a context
    ).derive(master_secret)

# 2) Use AES-GCM-SIV — safe under nonce reuse.
MASTER = os.environ["MASTER_SECRET"].encode()         # 32+ bytes from secrets manager

# Context-specific keys: one per use case so they don't share a key.
USER_PII_KEY  = derive_key(MASTER, context=b"user-pii-v1")
SESSION_KEY   = derive_key(MASTER, context=b"session-token-v1")

aead_user_pii = AESGCMSIV(USER_PII_KEY)
aead_sessions  = AESGCMSIV(SESSION_KEY)

def encrypt_pii(plaintext: bytes, *, user_id: int) -> tuple[bytes, bytes]:
    nonce = os.urandom(12)
    ct = aead_user_pii.encrypt(nonce, plaintext, associated_data=str(user_id).encode())
    return (nonce, ct)

def decrypt_pii(nonce: bytes, ct: bytes, *, user_id: int) -> bytes:
    return aead_user_pii.decrypt(nonce, ct, associated_data=str(user_id).encode())

# 3) When AES-NI isn't available (some ARM, some embedded) — ChaCha20-Poly1305.
#    Same shape, often faster on those platforms.
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

def make_chacha_aead() -> ChaCha20Poly1305:
    key = ChaCha20Poly1305.generate_key()
    return ChaCha20Poly1305(key)

# Same API as AES-GCM:
#   chacha = ChaCha20Poly1305(key)
#   ct = chacha.encrypt(nonce, plaintext, associated_data)
#   pt = chacha.decrypt(nonce, ct, associated_data)

# 4) Counter-based nonces — when you NEED to guarantee uniqueness.
#    For a single-writer use case (e.g. one process owns a key), a
#    counter is more reliable than random for high-volume.
class CounterNonce:
    """12-byte nonce: 4 bytes of process_id || 8 bytes of monotonic counter."""
    def __init__(self, process_id: int):
        self._pid_bytes = process_id.to_bytes(4, "big")
        self._counter = 0
        import threading
        self._lock = threading.Lock()

    def next(self) -> bytes:
        with self._lock:
            self._counter += 1
            return self._pid_bytes + self._counter.to_bytes(8, "big")

# Use only when you control all writers and have non-overlapping process_ids.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: envelope encryption (per-message data
#             keys encrypted under a KEK; KEK lives in KMS), streaming
#             encryption for large files, hardware-backed keys for
#             high-value data.
# APPROACH  - Generate a fresh data key per message; encrypt the data
#             with the data key; encrypt the data key under the KEK
#             (which never leaves KMS); store the encrypted data key
#             alongside the ciphertext. Streaming via chunked AEAD
#             with a counter-derived nonce per chunk.
# STRENGTHS - One KEK protects unlimited messages; per-message keys
#             mean even if one message leaks, the others stay safe;
#             KMS audit trail; envelope works with HSM / cloud KMS.
# WEAKNESSES- More moving parts; KMS API call per encrypt (add a
#             local data-key cache for hot paths); chunked streaming
#             needs careful nonce derivation.
import os, hmac, struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCMSIV, ChaCha20Poly1305
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
import boto3

# 1) KMS as the KEK — per-message data keys are encrypted by KMS.
kms = boto3.client("kms")
KEK_ARN = os.environ["KMS_KEK_ARN"]                    # arn:aws:kms:region:acct:key/UUID

def encrypt_with_envelope(plaintext: bytes, *, context: dict[str, str]) -> dict:
    """Returns {'data_key_ct': ..., 'nonce': ..., 'ciphertext': ...}.
    KMS generates a fresh AES-256 data key + returns plaintext + KMS-encrypted form."""
    resp = kms.generate_data_key(
        KeyId=KEK_ARN,
        KeySpec="AES_256",
        EncryptionContext=context,                     # binds to context; KMS verifies on decrypt
    )
    plaintext_data_key = resp["Plaintext"]             # 32 bytes; use immediately, never store
    encrypted_data_key = resp["CiphertextBlob"]        # opaque; safe to store

    aead = AESGCMSIV(plaintext_data_key)
    nonce = os.urandom(12)
    ct = aead.encrypt(nonce, plaintext, associated_data=str(context).encode())
    # ZEROIZE plaintext_data_key — Python doesn't expose explicit zeroing,
    # but ensure the variable is reassigned/dereferenced ASAP.
    plaintext_data_key = None
    return {"data_key_ct": encrypted_data_key, "nonce": nonce, "ciphertext": ct}

def decrypt_with_envelope(envelope: dict, *, context: dict[str, str]) -> bytes:
    resp = kms.decrypt(
        CiphertextBlob=envelope["data_key_ct"],
        EncryptionContext=context,                     # KMS rejects if context mismatches
    )
    plaintext_data_key = resp["Plaintext"]
    aead = AESGCMSIV(plaintext_data_key)
    pt = aead.decrypt(envelope["nonce"], envelope["ciphertext"], associated_data=str(context).encode())
    plaintext_data_key = None
    return pt

# 2) Streaming encryption — chunked AEAD with per-chunk nonces.
#    Each chunk gets a unique counter-derived nonce; final chunk is
#    flagged in associated data so truncation attacks fail.
CHUNK_SIZE = 1 << 16                                   # 64 KiB

def stream_encrypt(in_path: str, out_path: str, key: bytes) -> None:
    aead = ChaCha20Poly1305(key)                       # fast on non-AES-NI hardware
    with open(in_path, "rb") as fin, open(out_path, "wb") as fout:
        # Random 8-byte nonce prefix; counter is 4 bytes.
        nonce_prefix = os.urandom(8)
        fout.write(nonce_prefix)
        counter = 0
        while True:
            chunk = fin.read(CHUNK_SIZE)
            is_last = len(chunk) < CHUNK_SIZE          # may be 0 on exact-multiple
            nonce = nonce_prefix + counter.to_bytes(4, "big")
            aad = b"final" if is_last else b"chunk"
            ct = aead.encrypt(nonce, chunk, associated_data=aad)
            # Write length-prefixed chunks so decrypt can bound reads.
            fout.write(struct.pack(">I", len(ct)))
            fout.write(ct)
            counter += 1
            if is_last:
                break

def stream_decrypt(in_path: str, out_path: str, key: bytes) -> None:
    aead = ChaCha20Poly1305(key)
    with open(in_path, "rb") as fin, open(out_path, "wb") as fout:
        nonce_prefix = fin.read(8)
        counter = 0
        while True:
            len_buf = fin.read(4)
            if not len_buf: break
            (clen,) = struct.unpack(">I", len_buf)
            ct = fin.read(clen)
            if len(ct) != clen:
                raise ValueError("truncated stream")
            nonce = nonce_prefix + counter.to_bytes(4, "big")
            # Decrypt with both AAD candidates; the right one decrypts.
            try:
                pt = aead.decrypt(nonce, ct, associated_data=b"chunk")
                is_last = False
            except Exception:
                pt = aead.decrypt(nonce, ct, associated_data=b"final")
                is_last = True
            fout.write(pt)
            counter += 1
            if is_last:
                break

# Decision rule:
#   simple "encrypt this DB column"      -> Fernet (previous entry)
#   need associated data binding         -> AES-GCM (or AES-GCM-SIV — preferred)
#   nonce uniqueness can't be guaranteed -> AES-GCM-SIV (nonce-misuse-resistant)
#   non-AES-NI hardware (some ARM)       -> ChaCha20-Poly1305
#   one master secret, many uses         -> HKDF derive context-specific keys
#   high-volume, single-writer            -> counter-based nonce (12 byte)
#   high-volume, many writers            -> AES-GCM-SIV with random nonces (collision OK)
#   files / streams                       -> chunked AEAD with per-chunk nonces + final-marker AAD
#   need KMS / HSM integration            -> envelope encryption (data key per message; KMS for KEK)
#   regulated environment                -> AES-GCM is FIPS-approved; AES-GCM-SIV is standardized but check
#   client-side AND server-side          -> ChaCha20-Poly1305 (Tink, libsodium have it everywhere)
#
# Anti-pattern: random 12-byte nonce with AES-GCM at high volume.
# Birthday-collision math: ~2^32 messages with the same key gives a
# ~50% chance of nonce reuse. At a billion messages per key, you've
# almost certainly reused; AES-GCM under nonce reuse is catastrophic
# (XOR of two plaintexts leaks). Either: rotate the key well before
# 2^32 encryptions, OR use AES-GCM-SIV which is safe under reuse,
# OR use a counter-based nonce with strict accounting.
```

## Decision Rule

```text
simple "encrypt this DB column"      -> Fernet (previous entry)
need associated data binding         -> AES-GCM (or AES-GCM-SIV — preferred)
nonce uniqueness can't be guaranteed -> AES-GCM-SIV (nonce-misuse-resistant)
non-AES-NI hardware (some ARM)       -> ChaCha20-Poly1305
one master secret, many uses         -> HKDF derive context-specific keys
high-volume, single-writer            -> counter-based nonce (12 byte)
high-volume, many writers            -> AES-GCM-SIV with random nonces (collision OK)
files / streams                       -> chunked AEAD with per-chunk nonces + final-marker AAD
need KMS / HSM integration            -> envelope encryption (data key per message; KMS for KEK)
regulated environment                -> AES-GCM is FIPS-approved; AES-GCM-SIV is standardized but check
client-side AND server-side          -> ChaCha20-Poly1305 (Tink, libsodium have it everywhere)
```

## Anti-Pattern

> [!warning] Anti-pattern
> random 12-byte nonce with AES-GCM at high volume.
> Birthday-collision math: ~2^32 messages with the same key gives a
> ~50% chance of nonce reuse. At a billion messages per key, you've
> almost certainly reused; AES-GCM under nonce reuse is catastrophic
> (XOR of two plaintexts leaks). Either: rotate the key well before
> 2^32 encryptions, OR use AES-GCM-SIV which is safe under reuse,
> OR use a counter-based nonce with strict accounting.

## Tips

- AES-GCM is the right primitive when you need ASSOCIATED DATA (binding the ciphertext to context like a message ID). Fernet doesn't support AAD — use AES-GCM if you need it.
- AES-GCM nonces MUST be unique per (key, nonce) pair. Reuse is catastrophic — the keystream XORs to plaintext. For new code where you can't guarantee uniqueness, prefer AES-GCM-SIV (RFC 8452) which is misuse-resistant.
- `HKDF` derives multiple independent keys from one master secret. Use a different `info=` (context label) per use case so a leak in one context doesn't compromise the others.
- For non-x86 hardware (mobile ARM, embedded), `ChaCha20Poly1305` is often faster than AES-GCM — software implementations of AES are slow without AES-NI hardware acceleration.
- For envelope encryption (production pattern): KMS generates a fresh data key per message; encrypt the data with the data key; encrypt the data key under the KMS-managed KEK; store both. The data key never persists.
- For streaming, chunk the data and use a counter-derived nonce per chunk. Pair with a "final marker" in associated data so truncation attacks (cutting the stream early) fail decryption.

## Common Mistake

> [!warning] Random 12-byte nonces with plain AES-GCM at high volume. Birthday math: ~2^32 messages per key gives ~50% chance of nonce collision. AES-GCM under nonce reuse leaks the XOR of plaintexts — a complete break. Either (a) rotate keys well before 2^32 encryptions, (b) use AES-GCM-SIV which is safe under reuse, or (c) use a strict counter-based nonce.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Random nonce + plain AES-GCM — collision risk at scale
nonce = os.urandom(12)
ct = AESGCM(key).encrypt(nonce, pt, aad)
```

**Senior:**
```python
# AES-GCM-SIV — nonce reuse is non-catastrophic
nonce = os.urandom(12)
ct = AESGCMSIV(key).encrypt(nonce, pt, aad)
```

## See Also

- [[Sections/crypto-secrets/crypto/fernet-symmetric|Fernet — high-level symmetric encryption with rotation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/crypto/_Index|Crypto & Secrets → Crypto Primitives — Fernet, AES-GCM, Ed25519]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

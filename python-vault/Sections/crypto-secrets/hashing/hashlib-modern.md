---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "hashing"
id: "hashlib-modern"
title: "hashlib & hmac — content hashing and message authentication"
category: "Hashing"
subtitle: "hashlib.sha256, hashlib.blake2b, hashlib.file_digest, hmac.new, hmac.compare_digest, BLAKE3 (3rd-party), constant-time comparison"
signature_short: "h = hashlib.sha256(); h.update(chunk); h.hexdigest()   # OR: hmac.new(key, msg, \"sha256\").digest()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "hashlib & hmac — content hashing and message authentication"
  - "hashlib-modern"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/hashing"
  - "category/hashing"
  - "tier/tiered"
---

# hashlib & hmac — content hashing and message authentication

> hashlib.sha256, hashlib.blake2b, hashlib.file_digest, hmac.new, hmac.compare_digest, BLAKE3 (3rd-party), constant-time comparison

## Overview

Hash functions are fingerprints — same input always produces the same fixed-size output, but the output is computationally hard to reverse. Stdlib `hashlib` ships SHA-2 family (SHA-256/SHA-512), SHA-3, BLAKE2 (BLAKE2b/BLAKE2s — faster than SHA), and (deprecated for security) MD5/SHA-1. The third-party `blake3` is faster yet on big data. For "did this message come from someone with the shared key?", use HMAC (`hmac.new(key, msg, "sha256")`) and ALWAYS compare with `hmac.compare_digest` (constant-time). The three examples solve the SAME concrete task — compute a content-addressable hash for a file (dedup/integrity) AND a HMAC tag to authenticate a message — at three depths: literal `sha256(data)` → streaming via `file_digest()` + algorithm choice rationale + HMAC compare → BLAKE3 for big data + key derivation via scrypt + constant-time comparison + when MD5 is still OK.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Compute a content hash for a file (dedup / integrity); compute a HMAC tag to authenticate a message.
- **Junior** — SAME — but stream large files (no full-file read), pick the right algorithm for the use case, store HMAC tags alongside messages safely.
- **Senior** — SAME — production: BLAKE3 for big-file content hashing (parallel, ~10× faster than SHA-256 on huge inputs); key-derivation via scrypt for HMAC keys derived from passwords; constant-time comparison everywhere; FIPS mode notes.

## Signature

```python
h = hashlib.sha256(); h.update(chunk); h.hexdigest()   # OR: hmac.new(key, msg, "sha256").digest()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Compute a content hash for a file (dedup / integrity);
#             compute a HMAC tag to authenticate a message.
# APPROACH  - hashlib.sha256(bytes).hexdigest() for content hash;
#             hmac.new(key, msg, "sha256").hexdigest() for the tag.
# STRENGTHS - Stdlib only; well-known algorithm; the right answer for
#             content-addressable storage and basic message authentication.
# WEAKNESSES- Reads file into memory (junior tier streams);
#             hexdigest comparison should use compare_digest (constant-time).
import hashlib, hmac

# Content hash of a file (whole file in memory).
def content_hash(path: str) -> str:
    data = open(path, "rb").read()
    return hashlib.sha256(data).hexdigest()

# HMAC tag — "this message came from someone with the shared key".
SHARED_KEY = b"replace-with-your-secret"

def sign_message(msg: bytes) -> bytes:
    return hmac.new(SHARED_KEY, msg, "sha256").digest()

def verify_message(msg: bytes, tag: bytes) -> bool:
    expected = hmac.new(SHARED_KEY, msg, "sha256").digest()
    return hmac.compare_digest(expected, tag)         # constant-time; never == on tags

# Use:
print(content_hash(__file__)[:16])                    # e.g. "a3b4c5d6e7f80123"
tag = sign_message(b"the order is paid")
print(verify_message(b"the order is paid", tag))      # True
print(verify_message(b"the order is paid", b"x"))     # False (no timing leak)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but stream large files (no full-file read), pick
#             the right algorithm for the use case, store HMAC tags
#             alongside messages safely.
# APPROACH  - hashlib.file_digest() (3.11+) streams; algorithm choice
#             follows: sha256 for portability, blake2b for speed,
#             sha3_256 for SHA-2 hedging.
# STRENGTHS- Constant-memory hashing of any file size; explicit choice
#             of algorithm per use case; constant-time compare on every
#             tag check.
# WEAKNESSES- file_digest is 3.11+; for older Pythons, the manual
#             chunked-update pattern still works.
import hashlib, hmac

# 1) Stream-friendly file hash (3.11+).
def content_hash_streaming(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()

# Older Python (< 3.11): manual chunks.
def content_hash_manual(path: str, *, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(chunk), b""):
            h.update(block)
    return h.hexdigest()

# 2) Algorithm choice — what to use when.
#
#   sha256        - default for content-addressable storage, signatures,
#                   git objects. Universal; available everywhere.
#   sha512        - same, but 64-bit operations are faster on 64-bit CPUs
#                   despite the longer digest. Worth using for big inputs.
#   blake2b       - faster than SHA-2 (~3× on big data); strong; in stdlib.
#                   Picks when speed matters and SHA-2 isn't required by spec.
#   sha3_256      - hedge against SHA-2 surprises; slightly slower; same
#                   security level. Use if a spec requires it.
#   md5, sha1     - BROKEN for security; OK for "fingerprint a string for
#                   a cache key" where attackers can't manipulate input.
#   blake3        - external (pip install blake3); fastest of all, parallel
#                   on big files. Use for huge files (videos, archives).

def fast_content_hash(path: str) -> str:
    """BLAKE2b — ~3× faster than SHA-256 on large files."""
    with open(path, "rb") as f:
        return hashlib.file_digest(f, "blake2b").hexdigest()

# 3) HMAC for message authentication. The tag is sent ALONG WITH the
#    message; recipient computes their own tag and compares.
SHARED_KEY = b"replace-with-your-secret"

def sign_message(msg: bytes) -> bytes:
    return hmac.new(SHARED_KEY, msg, "sha256").digest()  # 32 bytes

def verify_message(msg: bytes, tag: bytes) -> bool:
    expected = hmac.new(SHARED_KEY, msg, "sha256").digest()
    return hmac.compare_digest(expected, tag)             # constant-time

# 4) HMAC use case: webhook signatures.
def verify_github_webhook(payload: bytes, header_sig: str, secret: bytes) -> bool:
    """GitHub sends X-Hub-Signature-256: sha256=<hex>"""
    if not header_sig.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(secret, payload, "sha256").hexdigest()
    return hmac.compare_digest(expected, header_sig)

# Test it.
print(content_hash_streaming(__file__)[:16])
sig = "sha256=" + hmac.new(SHARED_KEY, b"hello", "sha256").hexdigest()
assert verify_github_webhook(b"hello", sig, SHARED_KEY)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: BLAKE3 for big-file content hashing
#             (parallel, ~10× faster than SHA-256 on huge inputs);
#             key-derivation via scrypt for HMAC keys derived from
#             passwords; constant-time comparison everywhere; FIPS mode
#             notes.
# APPROACH  - blake3 package for huge files; hashlib.scrypt to derive
#             a key from a passphrase + salt; HMAC over the derived key.
# STRENGTHS- Performance scales with cores on big files; HMAC keys
#             aren't password-strength (they're derived); FIPS-approved
#             options documented for regulated environments.
# WEAKNESSES- BLAKE3 is third-party; scrypt parameters need tuning per
#             threat model; FIPS mode disables some algorithms.
import hashlib, hmac, secrets, os
from pathlib import Path

# 1) BLAKE3 — fastest hash for big files (parallel internally).
#    pip install blake3
try:
    import blake3
    HAS_BLAKE3 = True
except ImportError:
    HAS_BLAKE3 = False

def content_hash_huge(path: str) -> str:
    """Use BLAKE3 if available; fall back to BLAKE2b."""
    if HAS_BLAKE3:
        h = blake3.blake3()
        with open(path, "rb") as f:
            for block in iter(lambda: f.read(1 << 20), b""):
                h.update(block)
        return h.hexdigest()
    return hashlib.file_digest(open(path, "rb"), "blake2b").hexdigest()

# 2) Key derivation — derive a long-lived MAC key from a passphrase.
#    scrypt parameters: n=2**14 cost ~1 second on a modern laptop.
def derive_mac_key(passphrase: bytes, salt: bytes, *, n: int = 1 << 14, r: int = 8, p: int = 1) -> bytes:
    """Memory-hard KDF; resistant to GPU attacks. Returns a 32-byte key."""
    return hashlib.scrypt(
        password=passphrase,
        salt=salt,
        n=n, r=r, p=p,
        dklen=32,
    )

# 3) Production webhook verification with key rotation support.
import hmac as hmac_mod

class WebhookVerifier:
    """Verifies HMAC signatures with multiple accepted keys (rotation)."""
    def __init__(self, *, current_key: bytes, retired_keys: list[bytes] = None):
        self._keys = [current_key] + (retired_keys or [])

    def verify(self, payload: bytes, header_sig: str, *, prefix: str = "sha256=") -> bool:
        if not header_sig.startswith(prefix):
            return False
        sig_hex = header_sig[len(prefix):]
        for key in self._keys:
            expected = hmac_mod.new(key, payload, "sha256").hexdigest()
            if hmac_mod.compare_digest(expected, sig_hex):
                return True
        return False

# 4) Constant-time comparison even on hex-decoded bytes.
def safe_eq(a: bytes | str, b: bytes | str) -> bool:
    """Always use compare_digest, never ==. == leaks length and content
    via short-circuit timing."""
    if isinstance(a, str): a = a.encode()
    if isinstance(b, str): b = b.encode()
    return hmac_mod.compare_digest(a, b)

# 5) Decision rule for when each algorithm is right.

# Decision rule:
#   content addressing (git, S3 etag)    -> sha256 — universal, well-supported
#   speed-critical, big files              -> blake3 (3rd-party) > blake2b > sha512
#   webhook / API signatures               -> hmac.new(key, msg, "sha256")
#   constant-time compare                  -> hmac.compare_digest — NEVER ==
#   password hashing                        -> argon2 (see password-hashing entry); NEVER hashlib
#   key derivation from passphrase         -> hashlib.scrypt (memory-hard); or argon2 KDF
#   key derivation from random key          -> HKDF from cryptography.hazmat.primitives.kdf
#   regulated env (FIPS 140-2)             -> sha2 family only; blake2/3 not FIPS-approved
#   non-security cache key                  -> md5/sha1 OK if attacker can't influence input
#   streaming a file                        -> hashlib.file_digest (3.11+) or chunked .update
#   compare two file hashes                 -> hexdigest() == hexdigest() OK (no key involved)
#   compare a tag against a remote claim   -> compare_digest — every time
#
# Anti-pattern: comparing HMAC tags or password hashes with == or
# string equality. Python's == short-circuits at the first differing
# byte; an attacker measuring timing can guess the tag byte-by-byte.
# ALWAYS use hmac.compare_digest — it iterates the full length even on
# mismatch. The leak is real and exploitable on networks where you
# control the request rate (LAN, same-region cloud).
```

## Decision Rule

```text
content addressing (git, S3 etag)    -> sha256 — universal, well-supported
speed-critical, big files              -> blake3 (3rd-party) > blake2b > sha512
webhook / API signatures               -> hmac.new(key, msg, "sha256")
constant-time compare                  -> hmac.compare_digest — NEVER ==
password hashing                        -> argon2 (see password-hashing entry); NEVER hashlib
key derivation from passphrase         -> hashlib.scrypt (memory-hard); or argon2 KDF
key derivation from random key          -> HKDF from cryptography.hazmat.primitives.kdf
regulated env (FIPS 140-2)             -> sha2 family only; blake2/3 not FIPS-approved
non-security cache key                  -> md5/sha1 OK if attacker can't influence input
streaming a file                        -> hashlib.file_digest (3.11+) or chunked .update
compare two file hashes                 -> hexdigest() == hexdigest() OK (no key involved)
compare a tag against a remote claim   -> compare_digest — every time
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing HMAC tags or password hashes with == or
> string equality. Python's == short-circuits at the first differing
> byte; an attacker measuring timing can guess the tag byte-by-byte.
> ALWAYS use hmac.compare_digest — it iterates the full length even on
> mismatch. The leak is real and exploitable on networks where you
> control the request rate (LAN, same-region cloud).

## Tips

- For content-addressable storage / file integrity, SHA-256 is the universal default. BLAKE2b is ~3× faster if performance matters; BLAKE3 (third-party) is faster still on big inputs.
- `hashlib.file_digest(file, "sha256")` (Python 3.11+) is the cleanest streaming hash — no manual chunking. For older Pythons, use a `for block in iter(lambda: f.read(1<<20), b"")` loop.
- NEVER use `==` to compare HMAC tags, password hashes, or session tokens. Use `hmac.compare_digest(a, b)` — it iterates the full length even on mismatch (constant-time). `==` short-circuits at the first differing byte and leaks bytes via timing.
- MD5 and SHA-1 are broken for security — but they're fine for "non-security cache key from non-attacker-controllable input". Don't bother avoiding them in those contexts.
- For passwords, use argon2 (`argon2-cffi`); for key derivation from passphrases, use `hashlib.scrypt`. NEVER use raw SHA-256 for password storage — it's not memory-hard.
- Webhook signatures are the canonical HMAC use case. The provider sends `X-Hub-Signature-256: sha256=<hex>`; you reconstruct from the request body and shared secret; compare with `compare_digest`.

## Common Mistake

> [!warning] Comparing HMAC tags with `==`. Python's string/bytes `==` short-circuits at the first differing byte, leaking timing information that lets an attacker guess the correct tag byte-by-byte over the network. ALWAYS use `hmac.compare_digest(a, b)` — it iterates the full length even on mismatch. The leak is real and exploitable.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Timing leak — attacker can guess the tag byte-by-byte
if computed_tag == claimed_tag:
    return True
```

**Senior:**
```python
# Constant-time — no information leak
if hmac.compare_digest(computed_tag, claimed_tag):
    return True
```

## See Also

- [[Sections/crypto-secrets/hashing/password-hashing|argon2 / bcrypt — store and verify passwords correctly (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/secrets-module|secrets — cryptographically-secure tokens and constants (Crypto & Secrets)]]
- [[Sections/crypto-secrets/hashing/_Index|Crypto & Secrets → Hashing & MAC — hashlib, password hashing, secrets]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

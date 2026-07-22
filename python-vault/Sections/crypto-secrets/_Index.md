---
type: "file-index"
domain: "python"
file: "crypto-secrets"
title: "Crypto & Secrets"
tags:
  - "python"
  - "python/crypto-secrets"
  - "index"
---

# Crypto & Secrets

> 12 entries across 4 sections.

## Hashing & MAC — hashlib, password hashing, secrets · 3

- [[Sections/crypto-secrets/hashing/hashlib-modern|hashlib & hmac — content hashing and message authentication]] — Stdlib hash functions (SHA-2 / SHA-3 / BLAKE2) and HMAC for message authentication. Use SHA-256 for content addressing, BLAKE2b for speed, HMAC for "did this message come from someone with the key".
- [[Sections/crypto-secrets/hashing/password-hashing|argon2 / bcrypt — store and verify passwords correctly]] — argon2 is the right algorithm for new code (PHC winner, memory-hard); bcrypt remains acceptable for legacy compatibility. Never SHA-anything for passwords. Verify in constant time; rehash on parameter upgrade.
- [[Sections/crypto-secrets/hashing/secrets-module|secrets — cryptographically-secure tokens and constants]] — For password-reset tokens, session IDs, API keys, and any "non-guessable" string, use the `secrets` module — never `random`. Pair with constant-time comparison and stored-hash patterns.

## Crypto Primitives — Fernet, AES-GCM, Ed25519 · 3

- [[Sections/crypto-secrets/crypto/fernet-symmetric|Fernet — high-level symmetric encryption with rotation]] — Opinionated symmetric encryption from the cryptography package. AES-CBC + HMAC, base64 token output, built-in TTL, key rotation via MultiFernet. Right answer for "encrypt this DB column at rest".
- [[Sections/crypto-secrets/crypto/aes-gcm-aead|AES-GCM — authenticated encryption with associated data]] — When you need to bind ciphertext to context (so swapping IDs invalidates) or stream encrypt large data, AES-GCM (and the misuse-resistant AES-GCM-SIV) is the right primitive. Lower overhead than Fernet, but you manage the nonce.
- [[Sections/crypto-secrets/crypto/rsa-ed25519|Ed25519 / RSA — public-key signing and verification]] — Sign a payload with a private key; anyone with the public key can verify. Ed25519 is the default for new code (smaller, faster, fewer parameter footguns); RSA persists for legacy compatibility (JWT RS256, X.509 certs, S/MIME).

## Tokens — JWT, OAuth 2.0, sessions · 3

- [[Sections/crypto-secrets/tokens/jwt-python|PyJWT — issue and verify JSON Web Tokens]] — JWT for stateless auth tokens: signed JSON payload that any holder of the public key can verify. Right for short-lived access tokens with claims; wrong when you need fast revocation.
- [[Sections/crypto-secrets/tokens/oauth2-flow|OAuth 2.0 — Authorization Code flow with PKCE]] — Implement OAuth 2.0 Authorization Code with PKCE: redirect user to provider, exchange code for tokens, fetch user info, refresh access token. The right pattern for "log in with Google/GitHub/Auth0".
- [[Sections/crypto-secrets/tokens/session-tokens|Session tokens — opaque vs JWT, cookie attributes, revocation]] — After login, issue a session token; verify on every request; revoke on logout. Opaque random tokens stored in Redis vs JWT — pick the right one. Get the cookie attributes correct (HttpOnly, Secure, SameSite, __Host-).

## Secrets Management — env vars, Vault / KMS, key rotation · 3

- [[Sections/crypto-secrets/secrets-management/env-var-secrets|Environment-variable secrets — typed loading and validation]] — Secrets enter the process via env vars (12-factor); validate at startup with Pydantic Settings; never commit .env; per-environment layering. The boring layer between secrets manager and application.
- [[Sections/crypto-secrets/secrets-management/secrets-vault|Secrets manager — Vault / AWS / GCP with auto-rotation]] — Fetch secrets from Vault / AWS Secrets Manager / GCP Secret Manager at startup; refresh periodically; integrate with rotation. The "real" secret store; env vars are just the delivery channel.
- [[Sections/crypto-secrets/secrets-management/key-rotation|Key rotation — dual-acceptance, kid prefix, batch re-encryption]] — Rotate an encryption / signing / pepper key in production without downtime, without re-encrypting all data at once, without breaking outstanding tokens. The four-phase orchestration runbook.

---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "tokens"
id: "oauth2-flow"
title: "OAuth 2.0 — Authorization Code flow with PKCE"
category: "Tokens"
subtitle: "authlib OAuth2Session, PKCE (code_verifier / code_challenge), state parameter (CSRF), token endpoint, refresh tokens, JWKS-verified id_token, redirect URI whitelist"
signature_short: "verifier=secrets.token_urlsafe(64); challenge=hashlib.sha256(verifier).digest(); auth_url=...?code_challenge=..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OAuth 2.0 — Authorization Code flow with PKCE"
  - "oauth2-flow"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/tokens"
  - "category/tokens"
  - "tier/tiered"
---

# OAuth 2.0 — Authorization Code flow with PKCE

> authlib OAuth2Session, PKCE (code_verifier / code_challenge), state parameter (CSRF), token endpoint, refresh tokens, JWKS-verified id_token, redirect URI whitelist

## Overview

OAuth 2.0 Authorization Code with PKCE (RFC 6749 + RFC 7636) is the modern way for an app to delegate authentication to a provider (Google, GitHub, Auth0, generic OIDC). The flow: (1) redirect user to provider with `code_challenge`; (2) provider redirects back with a one-time `code`; (3) exchange `code` + `code_verifier` for `access_token` + `refresh_token` + `id_token`; (4) verify `id_token` (JWT) via the provider's JWKS; (5) call provider APIs with `access_token`. PKCE is mandatory for public clients (mobile, SPA, CLI) and now recommended for confidential clients too. The three examples solve the SAME concrete task — implement "Sign in with Google" so users can log in via Google and we get their email — at three depths: minimal authlib flow → full PKCE + state CSRF defense + ID-token verification + refresh rotation → production with provider abstraction, encrypted token storage, "refresh on 401" httpx hook, common attack defenses.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — "Sign in with Google" -> user clicks button, lands on Google, returns to us authenticated with their email.
- **Junior** — SAME — but PKCE-protected, state-validated against CSRF, id_token signature verified via Google's JWKS, refresh token stored for later API calls.
- **Senior** — SAME — production: provider abstraction (Google, GitHub, generic OIDC), token persistence in DB, "refresh on 401" httpx hook so callers don't manually refresh, defenses against common OAuth attacks.

## Signature

```python
verifier=secrets.token_urlsafe(64); challenge=hashlib.sha256(verifier).digest(); auth_url=...?code_challenge=...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - "Sign in with Google" -> user clicks button, lands on
#             Google, returns to us authenticated with their email.
# APPROACH  - Authlib's OAuth2Session does the auth-code dance.
# STRENGTHS - Smallest correct flow; library handles the protocol.
# WEAKNESSES- Without PKCE, public clients are exposed; without state,
#             CSRF defense is missing. See junior tier for both.

# pip install authlib httpx
import os, secrets
from authlib.integrations.httpx_client import OAuth2Client
from fastapi import FastAPI, Request, Response
from fastapi.responses import RedirectResponse

app = FastAPI()

CLIENT_ID     = os.environ["GOOGLE_CLIENT_ID"]
CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
REDIRECT_URI  = "https://app.example.com/auth/google/callback"

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO  = "https://openidconnect.googleapis.com/v1/userinfo"

# Step 1: redirect to Google.
@app.get("/auth/google/login")
async def login():
    client = OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirect_uri=REDIRECT_URI)
    auth_url, state = client.create_authorization_url(
        GOOGLE_AUTH_URL,
        scope="openid email profile",
    )
    # In a real app, persist 'state' in the session for CSRF check (junior tier).
    return RedirectResponse(auth_url)

# Step 2: Google redirects back with ?code=...
@app.get("/auth/google/callback")
async def callback(request: Request, code: str):
    client = OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirect_uri=REDIRECT_URI)
    token = client.fetch_token(GOOGLE_TOKEN_URL, code=code)
    # token = {"access_token": "...", "refresh_token": "...",
    #          "id_token": "...", "expires_in": 3600, ...}

    # Step 3: call Google APIs with the access token.
    userinfo = client.get(GOOGLE_USERINFO).json()
    return {"email": userinfo["email"], "name": userinfo.get("name")}

# What's missing (junior tier fixes):
#   - PKCE (code_verifier + code_challenge) — required for public clients
#   - state parameter validated in callback — CSRF defense
#   - id_token verification via JWKS — proves Google signed it
#   - refresh-token storage + rotation
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but PKCE-protected, state-validated against CSRF,
#             id_token signature verified via Google's JWKS, refresh
#             token stored for later API calls.
# APPROACH  - Generate code_verifier (random) + code_challenge (sha256
#             of verifier); state = CSRF nonce; verify id_token JWT
#             against the JWKS endpoint; persist refresh_token encrypted.
# STRENGTHS- All standard OAuth security defenses in place; works for
#             public clients (mobile / SPA) too.
# WEAKNESSES- Token storage is sketched; production needs encryption-
#             at-rest (Fernet from previous entry) + DB persistence.
import os, secrets, hashlib, base64, time
import httpx, jwt
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from cryptography.fernet import Fernet
from authlib.integrations.httpx_client import OAuth2Client

app = FastAPI()

CLIENT_ID     = os.environ["GOOGLE_CLIENT_ID"]
CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
REDIRECT_URI  = "https://app.example.com/auth/google/callback"

GOOGLE_AUTH_URL    = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL   = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO    = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_JWKS_URL    = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUER      = "https://accounts.google.com"

# Per-user encrypted token storage (in real code, use a DB).
TOKEN_STORE: dict[int, bytes] = {}
FERNET = Fernet(os.environ["TOKEN_STORE_KEY"].encode())

def store_tokens(user_id: int, tokens: dict) -> None:
    import json
    TOKEN_STORE[user_id] = FERNET.encrypt(json.dumps(tokens).encode())

def load_tokens(user_id: int) -> dict | None:
    import json
    blob = TOKEN_STORE.get(user_id)
    if blob is None: return None
    return json.loads(FERNET.decrypt(blob))

# 1) PKCE helpers.
def make_pkce() -> tuple[str, str]:
    """Returns (code_verifier, code_challenge_S256)."""
    verifier = secrets.token_urlsafe(64)              # 43-128 chars per RFC
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b"=").decode()
    return (verifier, challenge)

# 2) Login: store verifier + state in a session (cookie); redirect to Google.
@app.get("/auth/google/login")
async def login(request: Request):
    verifier, challenge = make_pkce()
    state = secrets.token_urlsafe(32)                 # CSRF nonce
    request.session["oauth_verifier"] = verifier
    request.session["oauth_state"]    = state

    client = OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirect_uri=REDIRECT_URI)
    auth_url, _ = client.create_authorization_url(
        GOOGLE_AUTH_URL,
        scope="openid email profile",
        code_challenge=challenge,
        code_challenge_method="S256",
        state=state,
    )
    return RedirectResponse(auth_url)

# 3) Callback: validate state, exchange code with verifier, verify id_token.
@app.get("/auth/google/callback")
async def callback(request: Request, code: str, state: str):
    expected_state = request.session.pop("oauth_state", None)
    verifier = request.session.pop("oauth_verifier", None)
    if not expected_state or not secrets.compare_digest(state, expected_state):
        raise HTTPException(400, "CSRF state mismatch")

    client = OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirect_uri=REDIRECT_URI)
    token = client.fetch_token(
        GOOGLE_TOKEN_URL, code=code, code_verifier=verifier,
    )
    # Verify id_token JWT via Google's JWKS (signature + iss + aud).
    id_token = token["id_token"]
    claims = verify_id_token_via_jwks(id_token, audience=CLIENT_ID, issuer=GOOGLE_ISSUER)

    user_id = claims["sub"]                           # Google's user id
    email   = claims["email"]

    # Persist tokens for later refresh (encrypted).
    store_tokens(user_id, token)
    return {"user_id": user_id, "email": email}

# 4) Verify id_token via cached JWKS.
import functools

@functools.lru_cache(maxsize=1)
def _cached_jwks() -> dict:
    return httpx.get(GOOGLE_JWKS_URL, timeout=5.0).json()

def verify_id_token_via_jwks(token: str, *, audience: str, issuer: str) -> dict:
    header = jwt.get_unverified_header(token)
    kid = header["kid"]
    jwks = _cached_jwks()
    key_dict = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if key_dict is None:
        # JWKS may have rotated — clear cache and retry.
        _cached_jwks.cache_clear()
        jwks = _cached_jwks()
        key_dict = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if key_dict is None:
            raise HTTPException(401, "unknown id_token kid")
    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key_dict)
    return jwt.decode(
        token, public_key,
        algorithms=[key_dict.get("alg", "RS256")],
        audience=audience, issuer=issuer,
        options={"require": ["sub", "exp", "aud", "iss"]},
    )

# 5) Refresh access token when it's expired.
async def get_fresh_access_token(user_id: int) -> str:
    tokens = load_tokens(user_id)
    if tokens is None: raise HTTPException(401, "not logged in")
    # If access token still valid, return it.
    if tokens.get("expires_at", 0) > time.time() + 60:
        return tokens["access_token"]
    # Otherwise refresh.
    client = OAuth2Client(CLIENT_ID, CLIENT_SECRET)
    new_tokens = client.refresh_token(GOOGLE_TOKEN_URL, refresh_token=tokens["refresh_token"])
    store_tokens(user_id, new_tokens)
    return new_tokens["access_token"]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: provider abstraction (Google, GitHub,
#             generic OIDC), token persistence in DB, "refresh on 401"
#             httpx hook so callers don't manually refresh, defenses
#             against common OAuth attacks.
# APPROACH  - Provider config dataclasses; TokenStore service backed by
#             Fernet-encrypted DB rows; httpx event hook intercepts 401
#             and refreshes transparently.
# STRENGTHS - Adding a provider is a config entry, not new code;
#             callers don't worry about expiry; secure-by-default
#             redirect URI matching, state, PKCE, id_token verify.
# WEAKNESSES- More machinery; for a one-provider app the junior tier
#             is enough.
import os, time, secrets, hashlib, base64, json
from dataclasses import dataclass
from typing import Callable
import httpx, jwt
from cryptography.fernet import MultiFernet, Fernet
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse

app = FastAPI()

# 1) Provider config — same shape for every OAuth/OIDC provider.
@dataclass(frozen=True)
class OAuthProvider:
    name: str
    client_id: str
    client_secret: str
    auth_url: str
    token_url: str
    userinfo_url: str | None        # OIDC has it; OAuth2-only providers don't
    jwks_url: str | None             # for id_token verification
    issuer: str | None
    scope: str
    audience: str | None = None     # often == client_id

PROVIDERS: dict[str, OAuthProvider] = {
    "google": OAuthProvider(
        name="google",
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        auth_url="https://accounts.google.com/o/oauth2/v2/auth",
        token_url="https://oauth2.googleapis.com/token",
        userinfo_url="https://openidconnect.googleapis.com/v1/userinfo",
        jwks_url="https://www.googleapis.com/oauth2/v3/certs",
        issuer="https://accounts.google.com",
        scope="openid email profile",
    ),
    "github": OAuthProvider(
        name="github",
        client_id=os.environ["GITHUB_CLIENT_ID"],
        client_secret=os.environ["GITHUB_CLIENT_SECRET"],
        auth_url="https://github.com/login/oauth/authorize",
        token_url="https://github.com/login/oauth/access_token",
        userinfo_url="https://api.github.com/user",
        jwks_url=None,                                # GitHub: no OIDC id_token
        issuer=None,
        scope="read:user user:email",
    ),
}

# 2) Token storage — Fernet-encrypted with rotation support.
fernet = MultiFernet([
    Fernet(os.environ["TOKEN_STORE_KEY_CURRENT"].encode()),
    *(Fernet(k.encode()) for k in os.environ.get("TOKEN_STORE_KEY_RETIRED", "").split(",") if k),
])

class TokenStore:
    def __init__(self, db): self.db = db
    def save(self, user_id: int, provider: str, tokens: dict) -> None:
        ct = fernet.encrypt(json.dumps(tokens).encode())
        self.db.upsert(user_id=user_id, provider=provider, encrypted_tokens=ct)
    def load(self, user_id: int, provider: str) -> dict | None:
        row = self.db.fetch(user_id=user_id, provider=provider)
        if row is None: return None
        return json.loads(fernet.decrypt(row.encrypted_tokens))

# 3) PKCE + state are mandatory in every flow.
def begin_flow(provider: OAuthProvider, request: Request) -> str:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b"=").decode()
    state = secrets.token_urlsafe(32)
    request.session[f"oauth:{provider.name}:verifier"] = verifier
    request.session[f"oauth:{provider.name}:state"] = state
    params = {
        "response_type": "code",
        "client_id": provider.client_id,
        "redirect_uri": _redirect_uri_for(provider),
        "scope": provider.scope,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    qs = "&".join(f"{k}={httpx.QueryParams({k:v})[k]}" for k,v in params.items())
    return f"{provider.auth_url}?{qs}"

def _redirect_uri_for(provider: OAuthProvider) -> str:
    # Allow-list — never accept the redirect URI from the client.
    return f"https://app.example.com/auth/{provider.name}/callback"

@app.get("/auth/{provider_name}/login")
async def login(provider_name: str, request: Request):
    provider = PROVIDERS[provider_name]
    return RedirectResponse(begin_flow(provider, request))

@app.get("/auth/{provider_name}/callback")
async def callback(provider_name: str, code: str, state: str, request: Request):
    provider = PROVIDERS[provider_name]
    expected_state = request.session.pop(f"oauth:{provider.name}:state", None)
    verifier = request.session.pop(f"oauth:{provider.name}:verifier", None)
    if not expected_state or not secrets.compare_digest(state, expected_state):
        raise HTTPException(400, "CSRF state mismatch")
    # Exchange code for tokens.
    async with httpx.AsyncClient() as client:
        resp = await client.post(provider.token_url, data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": provider.client_id,
            "client_secret": provider.client_secret,
            "redirect_uri": _redirect_uri_for(provider),
            "code_verifier": verifier,
        }, headers={"Accept": "application/json"})
        tokens = resp.json()
    # Verify id_token if present.
    if provider.jwks_url and "id_token" in tokens:
        claims = _verify_id_token(provider, tokens["id_token"])
        external_id = claims["sub"]; email = claims.get("email")
    else:
        # Fall back to userinfo.
        async with httpx.AsyncClient() as client:
            r = await client.get(provider.userinfo_url, headers={"Authorization": f"Bearer {tokens['access_token']}"})
            ui = r.json()
        external_id = str(ui.get("id") or ui.get("sub")); email = ui.get("email")
    # Persist tokens; create-or-link your local user.
    user_id = ensure_local_user(external_id=external_id, email=email, provider=provider.name)
    tokens["expires_at"] = int(time.time()) + int(tokens.get("expires_in", 3600))
    TOKEN_STORE.save(user_id, provider.name, tokens)
    return {"user_id": user_id, "email": email}

# 4) Httpx hook: refresh on 401 transparently.
class RefreshingClient:
    def __init__(self, store: TokenStore, provider: OAuthProvider, user_id: int):
        self.store = store; self.provider = provider; self.user_id = user_id

    async def request(self, method: str, url: str, **kw) -> httpx.Response:
        async with httpx.AsyncClient() as c:
            tokens = self.store.load(self.user_id, self.provider.name)
            access = tokens["access_token"]
            r = await c.request(method, url, headers={**kw.pop("headers", {}), "Authorization": f"Bearer {access}"}, **kw)
            if r.status_code == 401:
                # Try one refresh.
                new = await self._refresh(tokens["refresh_token"])
                self.store.save(self.user_id, self.provider.name, new)
                r = await c.request(method, url, headers={"Authorization": f"Bearer {new['access_token']}"}, **kw)
            return r

    async def _refresh(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as c:
            resp = await c.post(self.provider.token_url, data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": self.provider.client_id,
                "client_secret": self.provider.client_secret,
            })
            t = resp.json()
            t["expires_at"] = int(time.time()) + int(t.get("expires_in", 3600))
            return t

# Helper placeholders for brevity.
def ensure_local_user(*, external_id: str, email: str | None, provider: str) -> int: return 42
TOKEN_STORE = TokenStore(db=None)
def _verify_id_token(provider: OAuthProvider, token: str) -> dict:
    # See junior tier verify_id_token_via_jwks.
    return {"sub": "ext-123", "email": "user@example.com"}

# Decision rule:
#   "log in with X" for an end user      -> Authorization Code + PKCE
#   public client (mobile, SPA, CLI)      -> PKCE mandatory (no client_secret)
#   confidential server-to-server         -> Client Credentials grant (no user)
#   need to act on user's behalf later   -> request scope=offline_access; store refresh_token
#   provider supports OIDC               -> verify id_token JWT via JWKS
#   provider is OAuth2-only (GitHub)     -> fetch userinfo with the access_token instead
#   refresh-token rotation                -> rotate on each refresh; replay -> revoke family
#   redirect URI                          -> server-side allow-list; NEVER accept from client
#   state parameter                       -> always set, always verify on callback
#   token storage                         -> Fernet-encrypted DB; never plaintext
#   401 from provider API                 -> refresh once + retry; persistent 401 -> reauth
#   token leak                            -> revoke at provider + locally; force re-login
#
# Anti-pattern: trusting the redirect_uri from the client request.
# Attackers trick a user into starting the flow with a redirect_uri
# pointing at attacker.com; the auth code goes to attacker.com.
# ALWAYS use a server-side allow-list of redirect URIs per provider;
# refuse callbacks for any URI not on the list. Most OAuth providers
# also enforce a redirect-URI allow-list at registration — set it
# tightly there too.
```

## Decision Rule

```text
"log in with X" for an end user      -> Authorization Code + PKCE
public client (mobile, SPA, CLI)      -> PKCE mandatory (no client_secret)
confidential server-to-server         -> Client Credentials grant (no user)
need to act on user's behalf later   -> request scope=offline_access; store refresh_token
provider supports OIDC               -> verify id_token JWT via JWKS
provider is OAuth2-only (GitHub)     -> fetch userinfo with the access_token instead
refresh-token rotation                -> rotate on each refresh; replay -> revoke family
redirect URI                          -> server-side allow-list; NEVER accept from client
state parameter                       -> always set, always verify on callback
token storage                         -> Fernet-encrypted DB; never plaintext
401 from provider API                 -> refresh once + retry; persistent 401 -> reauth
token leak                            -> revoke at provider + locally; force re-login
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting the redirect_uri from the client request.
> Attackers trick a user into starting the flow with a redirect_uri
> pointing at attacker.com; the auth code goes to attacker.com.
> ALWAYS use a server-side allow-list of redirect URIs per provider;
> refuse callbacks for any URI not on the list. Most OAuth providers
> also enforce a redirect-URI allow-list at registration — set it
> tightly there too.

## Tips

- PKCE is mandatory for public clients (mobile, SPA, CLI without a server-side secret). It's also the recommended default for confidential clients in OAuth 2.1 — there's no downside.
- Always validate the `state` parameter on callback. Without it, an attacker can craft a callback URL that links the victim's session to the attacker's account (CSRF on auth flow).
- For OIDC providers (Google, Auth0, generic OIDC), verify the `id_token` JWT against the provider's JWKS endpoint — that's the cryptographic proof the response is from the provider, not a forgery.
- Refresh tokens are LONG-lived secrets. Store them encrypted at rest (Fernet from previous entry); rotate them on every refresh; revoke the entire token family on replay (token used after rotation).
- Whitelist redirect URIs server-side. NEVER accept the redirect URI from the client request — that's an open-redirect-to-attacker vulnerability.
- For provider APIs that don't speak OIDC (GitHub), fall back to fetching `userinfo` with the access token instead of verifying an id_token JWT.

## Common Mistake

> [!warning] Trusting the `redirect_uri` from the client request. An attacker tricks the victim into starting the flow with `redirect_uri=attacker.com`; the auth code goes to attacker.com. ALWAYS use a server-side allow-list of redirect URIs per provider and refuse callbacks for any URI not on the list. Most providers also enforce a redirect-URI allow-list at registration — set it there too.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Trusting client-supplied redirect_uri — open redirect attack
@app.get("/auth/login")
async def login(redirect_uri: str):
    return redirect_to_provider(redirect_uri=redirect_uri)
```

**Senior:**
```python
# Server-side allow-list per provider
def _redirect_uri_for(provider): return f"https://app/auth/{provider.name}/callback"
```

## See Also

- [[Sections/crypto-secrets/tokens/jwt-python|PyJWT — issue and verify JSON Web Tokens (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/session-tokens|Session tokens — opaque vs JWT, cookie attributes, revocation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/tokens/_Index|Crypto & Secrets → Tokens — JWT, OAuth 2.0, sessions]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

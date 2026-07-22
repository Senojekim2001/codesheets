---
type: "entry"
domain: "python"
file: "data-apps"
section: "deployment-auth"
id: "streamlit-multipage-auth"
title: "Streamlit multipage + auth — pages/ folder, role-based access"
category: "Deployment"
subtitle: "pages/ directory auto-discovery, st.switch_page, streamlit-authenticator, reverse-proxy auth (oauth2-proxy), role-based access, query params for deep links"
signature_short: "pages/01_dashboard.py    # auto-registered
pages/02_admin.py        # auto-registered
st.switch_page(\"pages/admin.py\")  # programmatic nav"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Streamlit multipage + auth — pages/ folder, role-based access"
  - "streamlit-multipage-auth"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/deployment-auth"
  - "category/deployment"
  - "tier/tiered"
---

# Streamlit multipage + auth — pages/ folder, role-based access

> pages/ directory auto-discovery, st.switch_page, streamlit-authenticator, reverse-proxy auth (oauth2-proxy), role-based access, query params for deep links

## Overview

Streamlit auto-discovers `.py` files in `pages/` and renders them as separate pages with sidebar nav. Auth has two paths: (a) `streamlit-authenticator` for self-contained login (hashed creds in YAML, basic but works); (b) a reverse proxy (oauth2-proxy, Cloudflare Access, AWS ALB OIDC) that authenticates BEFORE traffic reaches Streamlit — Streamlit reads `X-Forwarded-User` headers. The reverse-proxy approach is the only sane path for SSO. Per-page RBAC: check the user's role at the top of each page, `st.stop()` if denied. The three examples solve the SAME concrete task — multi-page app with login, admin-only pages, deep links — at three depths: pages/ + streamlit-authenticator → reverse-proxy auth + RBAC + query-param deep links → production with OIDC, programmatic page nav, session-bound state.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Multi-page app with simple password gate. Project structure: app.py pages/01_dashboard.py pages/02_users.py
- **Junior** — SAME — but with streamlit-authenticator (hashed creds); role-based access; deep link via query params. pip install streamlit-authenticator pyyaml
- **Senior** — SAME — production: reverse-proxy OIDC auth, programmatic page navigation, RBAC, session-bound state with backend persistence. Architecture: User -> oauth2-proxy (Google/Okta OIDC) -> Streamlit oauth2-proxy adds X-Forwarded-User, X-Forwarded-Email, X-Forwarded-Groups

## Signature

```python
pages/01_dashboard.py    # auto-registered
pages/02_admin.py        # auto-registered
st.switch_page("pages/admin.py")  # programmatic nav
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Multi-page app with simple password gate.
# Project structure:
#   app.py
#   pages/01_dashboard.py
#   pages/02_users.py

# === app.py (the home page) ===
import streamlit as st

st.title("Sales Hub")

if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

if not st.session_state["authenticated"]:
    pw = st.text_input("Password", type="password")
    if st.button("Login"):
        if pw == "secret":                             # IN PRODUCTION: hash + compare
            st.session_state["authenticated"] = True
            st.rerun()
    st.stop()

st.success("Welcome! Use the sidebar to navigate.")

# pages/01_dashboard.py:
#   import streamlit as st
#   if not st.session_state.get("authenticated"): st.error("Login first"); st.stop()
#   st.title("Dashboard")

# pages/02_users.py:
#   ... (similar guard)

# Run:
#   $ streamlit run app.py
# Sidebar shows: app, dashboard, users.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with streamlit-authenticator (hashed creds);
#             role-based access; deep link via query params.
# pip install streamlit-authenticator pyyaml
import streamlit as st
import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader

# === credentials.yaml (gitignored) ===
# credentials:
#   usernames:
#     alice:
#       email: alice@example.com
#       name: Alice Anderson
#       password: $2b$12$...  # bcrypt hash; generate via stauth.Hasher
#       roles: [user, admin]
#     bob:
#       email: bob@example.com
#       name: Bob Brown
#       password: $2b$12$...
#       roles: [user]
# cookie:
#   name: streamlit_auth
#   key: random-secret-from-env
#   expiry_days: 30

with open("credentials.yaml") as f:
    cfg = yaml.load(f, Loader=SafeLoader)

authenticator = stauth.Authenticate(
    credentials=cfg["credentials"],
    cookie_name=cfg["cookie"]["name"],
    cookie_key=cfg["cookie"]["key"],
    cookie_expiry_days=cfg["cookie"]["expiry_days"],
)

# === app.py ===
st.title("Sales Hub")
authenticator.login(location="sidebar")

if st.session_state.get("authentication_status") is None:
    st.warning("Please log in")
    st.stop()
elif st.session_state["authentication_status"] is False:
    st.error("Username/password incorrect")
    st.stop()

# Logged in.
authenticator.logout(location="sidebar")
user_roles = cfg["credentials"]["usernames"][st.session_state["username"]]["roles"]
st.session_state["roles"] = user_roles
st.success(f"Welcome, {st.session_state['name']}")

# === pages/02_admin.py ===
# import streamlit as st
# if "admin" not in st.session_state.get("roles", []):
#     st.error("Admins only")
#     st.stop()
# st.title("Admin")
# # ... admin content

# === Deep-link deletion via query param ===
qp = st.query_params
default_user_id = qp.get("user_id")
if default_user_id:
    st.write(f"Selected user: {default_user_id}")
    # Auto-load that user's data...

# Generate a hash for a new user:
# >>> stauth.Hasher.hash("hunter2")
# '$2b$12$...'
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: reverse-proxy OIDC auth, programmatic
#             page navigation, RBAC, session-bound state with backend
#             persistence.
# Architecture:
#   User -> oauth2-proxy (Google/Okta OIDC) -> Streamlit
#   oauth2-proxy adds X-Forwarded-User, X-Forwarded-Email, X-Forwarded-Groups
import streamlit as st

# === Read user from reverse-proxy headers ===
def get_current_user() -> dict | None:
    """Read auth context from reverse-proxy headers.
    Streamlit doesn't expose request headers directly; use st.context.headers (1.36+)."""
    headers = st.context.headers if hasattr(st, "context") else {}
    user = headers.get("X-Forwarded-User") or headers.get("Cf-Access-Authenticated-User-Email")
    if not user:
        return None
    groups = (headers.get("X-Forwarded-Groups") or "").split(",")
    return {"email": user, "groups": [g.strip() for g in groups if g.strip()]}

# === RBAC helpers ===
def require_role(*roles: str):
    user = get_current_user()
    if user is None:
        st.error("Not authenticated. Refresh to log in.")
        st.stop()
    if not any(r in user["groups"] for r in roles):
        st.error(f"Permission denied. Required: {' or '.join(roles)}")
        st.stop()
    return user

def require_login():
    user = get_current_user()
    if user is None:
        st.error("Not authenticated.")
        st.stop()
    return user

# === app.py (home / nav) ===
def home():
    user = require_login()
    st.title("Sales Hub")
    st.write(f"Logged in as **{user['email']}**")
    st.write(f"Groups: {', '.join(user['groups'])}")

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("Dashboard", use_container_width=True):
            st.switch_page("pages/01_dashboard.py")
    with col2:
        if "viewer" in user["groups"] or "admin" in user["groups"]:
            if st.button("Reports", use_container_width=True):
                st.switch_page("pages/02_reports.py")
    with col3:
        if "admin" in user["groups"]:
            if st.button("Admin", use_container_width=True):
                st.switch_page("pages/03_admin.py")

home()

# === pages/03_admin.py ===
# import streamlit as st
# from auth import require_role
# user = require_role("admin")
# st.title("Admin")
#
# # Hide pages from sidebar based on role:
# # In .streamlit/config.toml:
# # [client]
# # showSidebarNavigation = false       # hide auto sidebar; render manually
#
# # Then in app.py, render only the pages the user can access.

# === oauth2-proxy config snippet ===
# # config.cfg
# provider = "oidc"
# oidc_issuer_url = "https://accounts.google.com"
# client_id = "..."
# client_secret = "..."
# email_domains = ["example.com"]
# upstreams = ["http://streamlit:8501/"]
# pass_authorization_header = true
# set_xauthrequest = true
# set_authorization_header = true
# # Forward groups from OIDC claim to Streamlit:
# scope = "openid email profile groups"
# pass_user_headers = true

# Decision rule:
#   small internal tool, 1-5 users        -> streamlit-authenticator (YAML creds)
#   SSO required (Google, Okta, AAD)     -> reverse-proxy OIDC (oauth2-proxy / ALB)
#   public-facing                          -> NOT Streamlit; build a real app
#   per-page access control                -> require_role() at top of each page
#   programmatic navigation                -> st.switch_page("pages/X.py")
#   query-param deep linking               -> st.query_params (read + write)
#   hide pages from sidebar                -> showSidebarNavigation=false; manual nav
#   session state across pages             -> st.session_state (per-tab); DB for cross-tab
#   mobile-friendly                          -> Streamlit's default layout; mobile-OK
#   audit log                               -> log get_current_user() at sensitive ops
#   logout                                   -> reverse-proxy /oauth2/sign_out endpoint
#   role changes mid-session                 -> re-read from headers each pageview;
#                                                no caching of group membership
#
# Anti-pattern: trusting a user-controlled cookie / query param for
# auth state. "?role=admin" can't be trusted; X-Forwarded-User from a
# DIRECT request can't be trusted (anyone can set it). Only trust
# reverse-proxy headers when Streamlit is bound to a non-public
# interface (loopback or private subnet) AND the proxy is the only
# ingress. Otherwise users can curl --header "X-Forwarded-User: admin"
# and bypass the proxy.
```

## Decision Rule

```text
small internal tool, 1-5 users        -> streamlit-authenticator (YAML creds)
SSO required (Google, Okta, AAD)     -> reverse-proxy OIDC (oauth2-proxy / ALB)
public-facing                          -> NOT Streamlit; build a real app
per-page access control                -> require_role() at top of each page
programmatic navigation                -> st.switch_page("pages/X.py")
query-param deep linking               -> st.query_params (read + write)
hide pages from sidebar                -> showSidebarNavigation=false; manual nav
session state across pages             -> st.session_state (per-tab); DB for cross-tab
mobile-friendly                          -> Streamlit's default layout; mobile-OK
audit log                               -> log get_current_user() at sensitive ops
logout                                   -> reverse-proxy /oauth2/sign_out endpoint
role changes mid-session                 -> re-read from headers each pageview;
                                             no caching of group membership
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting a user-controlled cookie / query param for
> auth state. "?role=admin" can't be trusted; X-Forwarded-User from a
> DIRECT request can't be trusted (anyone can set it). Only trust
> reverse-proxy headers when Streamlit is bound to a non-public
> interface (loopback or private subnet) AND the proxy is the only
> ingress. Otherwise users can curl --header "X-Forwarded-User: admin"
> and bypass the proxy.

## Tips

- Streamlit auto-discovers files in `pages/` (3.0+). Number prefix (`01_`, `02_`) controls sidebar order; the prefix is hidden from display.
- For SSO, use a reverse proxy (oauth2-proxy, Cloudflare Access, AWS ALB OIDC). It authenticates BEFORE Streamlit; passes user info via `X-Forwarded-User` headers.
- `st.context.headers` (Streamlit 1.36+) gives you request headers — required for reading auth headers from the proxy.
- CRITICAL: bind Streamlit to a non-public interface (loopback or private subnet) when relying on proxy auth. A public Streamlit + proxy-only-set headers = trivial bypass via `curl --header`.
- `st.switch_page("pages/X.py")` is programmatic page navigation — useful after a successful action ("created order; switching to Order Detail page").
- For per-page RBAC, write a `require_role("admin")` helper that calls `st.stop()` on denial. Put it at the top of every protected page.

## Common Mistake

> [!warning] Trusting a user-controlled cookie or query param for auth state. `?role=admin` is set by the user; `X-Forwarded-User` from a DIRECT request is too. Only trust proxy headers when Streamlit is bound to a non-public interface AND the proxy is the only ingress. Otherwise `curl -H "X-Forwarded-User: admin"` bypasses everything.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Streamlit on 0.0.0.0:8501 — anyone can spoof headers
$ streamlit run app.py --server.address 0.0.0.0
```

**Senior:**
```python
# Streamlit on 127.0.0.1; proxy is the only path in
$ streamlit run app.py --server.address 127.0.0.1
# nginx/oauth2-proxy in front, public traffic comes through it only
```

## See Also

- [[Sections/web/web-deployment/gunicorn|gunicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/uvicorn|uvicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient (Web (Flask, Django))]]
- [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions (Data Apps)]]
- [[Sections/data-apps/deployment-auth/_Index|Data Apps → Deployment & Auth — multipage, sticky sessions, behind nginx]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]

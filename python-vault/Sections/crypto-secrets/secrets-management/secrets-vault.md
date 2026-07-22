---
type: "entry"
domain: "python"
file: "crypto-secrets"
section: "secrets-management"
id: "secrets-vault"
title: "Secrets manager — Vault / AWS / GCP with auto-rotation"
category: "Secrets Management"
subtitle: "boto3 secretsmanager, hvac for Vault, Vault Agent injector, dynamic DB credentials, IAM-instance-profile auth, rotation hooks, secret-zero problem"
signature_short: "secret = sm.get_secret_value(SecretId=\"prod/db/main\")[\"SecretString\"]   # JSON-encoded"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Secrets manager — Vault / AWS / GCP with auto-rotation"
  - "secrets-vault"
tags:
  - "python"
  - "python/crypto-secrets"
  - "python/crypto-secrets/secrets-management"
  - "category/secrets-management"
  - "tier/tiered"
---

# Secrets manager — Vault / AWS / GCP with auto-rotation

> boto3 secretsmanager, hvac for Vault, Vault Agent injector, dynamic DB credentials, IAM-instance-profile auth, rotation hooks, secret-zero problem

## Overview

Real production secrets live in a SECRETS MANAGER (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Doppler), not in env vars or files. The application authenticates to the manager via the orchestrator's identity (k8s service account, AWS IAM instance profile, GCP workload identity) — solving the "secret zero" problem (the credential needed to fetch other credentials). Secrets can be STATIC (rotated on a schedule by the manager) or DYNAMIC (Vault generates short-lived DB credentials on demand). The three examples solve the SAME concrete task — load the database password from AWS Secrets Manager at startup; refresh when it rotates; use IAM auth with no static credentials in the app — at three depths: one-shot fetch at startup → polled refresh + cached secrets → production: Vault Agent file-watch hot-reload + dynamic DB credentials with lease renewal + secret-zero via instance profile.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Fetch DATABASE_URL from AWS Secrets Manager at startup.
- **Junior** — SAME — but periodically refresh the secret so a rotation at the manager takes effect without restarting the app.
- **Senior** — SAME — production: Vault Agent injector writes secrets to a file watched by the app; SQLAlchemy creator-callable reads the latest credentials per connection; dynamic DB credentials with lease renewal; instance-profile auth solves secret-zero.

## Signature

```python
secret = sm.get_secret_value(SecretId="prod/db/main")["SecretString"]   # JSON-encoded
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Fetch DATABASE_URL from AWS Secrets Manager at startup.
# APPROACH  - boto3 secretsmanager.get_secret_value once; parse JSON;
#             use as if it came from env. IAM auth via instance profile
#             — no AWS credentials in code or env.
# STRENGTHS - Secret never lives in env or .env file; rotated by AWS
#             on a schedule; audit log of every fetch.
# WEAKNESSES- No refresh — if the secret rotates, the app uses the old
#             value until restart. Junior tier polls.

# pip install boto3
import json, boto3

sm = boto3.client("secretsmanager")                   # uses IAM role / instance profile

def get_db_secret() -> dict:
    """Returns {'username': ..., 'password': ..., 'host': ..., 'port': ...}."""
    resp = sm.get_secret_value(SecretId="prod/myapp/database")
    return json.loads(resp["SecretString"])

def database_url() -> str:
    s = get_db_secret()
    return f"postgresql://{s['username']}:{s['password']}@{s['host']}:{s['port']}/{s['dbname']}"

# Use at startup:
DB_URL = database_url()
# engine = create_engine(DB_URL)

# IAM permissions needed (attach to instance profile / k8s service account):
# {
#   "Effect": "Allow",
#   "Action": ["secretsmanager:GetSecretValue"],
#   "Resource": "arn:aws:secretsmanager:us-east-1:ACCT:secret:prod/myapp/*"
# }

# Vault equivalent (HashiCorp):
# import hvac
# client = hvac.Client(url="https://vault.internal:8200")
# client.auth.kubernetes.login(role="myapp", jwt=open("/var/run/secrets/kubernetes.io/serviceaccount/token").read())
# secret = client.secrets.kv.v2.read_secret_version(path="myapp/database")["data"]["data"]

# GCP equivalent (Secret Manager):
# from google.cloud import secretmanager
# client = secretmanager.SecretManagerServiceClient()
# resp = client.access_secret_version(name="projects/PROJ/secrets/db-password/versions/latest")
# password = resp.payload.data.decode()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but periodically refresh the secret so a rotation
#             at the manager takes effect without restarting the app.
# APPROACH  - Background thread polls every 5 min; updates a cached
#             value protected by a Lock; engine connection pool
#             gets the new password on its next checkout.
# STRENGTHS- Survives the manager's rotation; SQLAlchemy's pool
#             pre-ping picks up the new credentials.
# WEAKNESSES- Polling is inefficient; senior tier shows file-watch
#             via Vault Agent for instant updates.
import json, threading, time, logging
import boto3

log = logging.getLogger(__name__)
sm = boto3.client("secretsmanager")

class SecretCache:
    """Periodically refreshing cache for one secret."""
    def __init__(self, secret_id: str, *, refresh_s: int = 300):
        self.secret_id = secret_id
        self.refresh_s = refresh_s
        self._lock = threading.Lock()
        self._value: dict = {}
        self._fetched_at: float = 0.0
        self.refresh()                                # initial fetch (blocks startup)
        threading.Thread(target=self._loop, daemon=True, name="secret-refresh").start()

    def get(self) -> dict:
        with self._lock:
            return dict(self._value)                  # copy; immutable to caller

    def refresh(self) -> None:
        try:
            resp = sm.get_secret_value(SecretId=self.secret_id)
            new = json.loads(resp["SecretString"])
            with self._lock:
                if new != self._value:
                    log.info("secret_rotated", extra={"secret_id": self.secret_id})
                self._value = new
                self._fetched_at = time.monotonic()
        except Exception as e:
            log.error("secret_refresh_failed", extra={"secret_id": self.secret_id, "err": str(e)})
            # Keep using the previous value — don't overwrite on error.

    def _loop(self) -> None:
        while True:
            time.sleep(self.refresh_s)
            self.refresh()

DB_SECRET = SecretCache("prod/myapp/database")

# SQLAlchemy: get the URL from the cache when needed.
def make_engine():
    s = DB_SECRET.get()
    url = f"postgresql://{s['username']}:{s['password']}@{s['host']}:{s['port']}/{s['dbname']}"
    from sqlalchemy import create_engine
    return create_engine(url, pool_pre_ping=True, pool_recycle=300)

# Vault dynamic credentials — better than rotation: each role gets a
# fresh username/password with a short lease that auto-renews.
import hvac

def vault_dynamic_db_creds() -> dict:
    """Vault generates a NEW DB user with a 1-hour lease; renew before expiry."""
    client = hvac.Client(url="https://vault.internal:8200")
    # Auth via Kubernetes service account.
    client.auth.kubernetes.login(
        role="myapp",
        jwt=open("/var/run/secrets/kubernetes.io/serviceaccount/token").read(),
    )
    resp = client.secrets.database.generate_credentials(name="myapp-readwrite")
    # resp = {"data": {"username": "v-app-...", "password": "..."},
    #         "lease_id": "...", "lease_duration": 3600}
    return resp

# Lease renewal — call before lease_duration expires (typically half-way).
def renew_lease(client: hvac.Client, lease_id: str) -> None:
    client.sys.renew_lease(lease_id=lease_id, increment=3600)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: Vault Agent injector writes secrets to
#             a file watched by the app; SQLAlchemy creator-callable
#             reads the latest credentials per connection; dynamic
#             DB credentials with lease renewal; instance-profile auth
#             solves secret-zero.
# APPROACH  - Vault Agent runs as a sidecar; templates secrets to
#             /vault/secrets/db.json on a schedule; app uses
#             watchdog to react. SQLAlchemy creator= callable means
#             new connections always use the latest password.
# STRENGTHS - Hot-reload: rotation in Vault propagates to the running
#             app within seconds; existing connections drain naturally;
#             no static credentials anywhere in the system.
# WEAKNESSES- More moving parts (Agent sidecar, file watcher, creator
#             callable); for simple use cases the polling junior tier
#             is enough.
import json, os, threading, time, logging
from pathlib import Path
import psycopg2
from sqlalchemy import create_engine
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

log = logging.getLogger(__name__)

SECRETS_FILE = Path("/vault/secrets/db.json")          # written by Vault Agent template

# 1) Lock-protected secret cache, hot-reloaded from disk.
class FileWatchedSecret:
    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()
        self._value: dict = {}
        self.reload()

        observer = Observer()
        observer.schedule(self._Handler(self), str(path.parent), recursive=False)
        observer.daemon = True
        observer.start()

    def get(self) -> dict:
        with self._lock:
            return dict(self._value)

    def reload(self) -> None:
        try:
            new = json.loads(self.path.read_text())
            with self._lock:
                if new != self._value:
                    log.info("secret_reloaded_from_file", extra={"path": str(self.path)})
                self._value = new
        except Exception as e:
            log.error("secret_reload_failed", extra={"err": str(e)})

    class _Handler(FileSystemEventHandler):
        def __init__(self, parent: "FileWatchedSecret"): self.parent = parent
        def on_modified(self, ev):
            if Path(ev.src_path) == self.parent.path:
                self.parent.reload()
        def on_created(self, ev):
            if Path(ev.src_path) == self.parent.path:
                self.parent.reload()

DB_SECRET = FileWatchedSecret(SECRETS_FILE)

# 2) SQLAlchemy creator= — every NEW connection picks up the latest creds.
def _connect():
    s = DB_SECRET.get()
    return psycopg2.connect(
        user=s["username"],
        password=s["password"],
        host=s["host"], port=int(s["port"]),
        dbname=s["dbname"],
    )

engine = create_engine(
    "postgresql+psycopg2://",                          # URL is shape-only; creator= overrides
    creator=_connect,
    pool_pre_ping=True,                                # validate before use; reconnect with fresh creds
    pool_recycle=300,                                  # recycle every 5 min so credentials don't stale
)

# 3) Vault Agent config (filesystem) — runs as a sidecar in k8s pod.
#
# /etc/vault-agent/config.hcl on the agent container:
#   vault { address = "https://vault.internal:8200" }
#   auto_auth {
#     method "kubernetes" {
#       config = { role = "myapp" }
#     }
#     sink "file" {
#       config = { path = "/var/run/secrets/vault-token" }
#     }
#   }
#   template {
#     source      = "/etc/vault-agent/db.json.tmpl"
#     destination = "/vault/secrets/db.json"
#     perms       = "0640"
#   }
#
# /etc/vault-agent/db.json.tmpl:
#   {{- with secret "database/creds/myapp-readwrite" -}}
#   {
#     "username": "{{ .Data.username }}",
#     "password": "{{ .Data.password }}",
#     "host": "db.internal",
#     "port": 5432,
#     "dbname": "myapp"
#   }
#   {{- end -}}
#
# Vault Agent renews the lease automatically; on rotation, the file is
# rewritten; our watchdog reloads; pool_recycle picks up fresh creds.

# 4) Solving secret-zero: how does the agent (or app) AUTHENTICATE to Vault?
#    - k8s service account JWT -> Vault's k8s auth method validates with the
#      cluster's TokenReview API. No static credentials.
#    - AWS instance profile -> Vault's aws auth method validates the IAM
#      identity via STS GetCallerIdentity. No static credentials.
#    - GCP workload identity -> Vault's gcp auth method validates a JWT
#      signed by the workload identity pool. No static credentials.
#    The pattern: orchestrator vouches for the workload identity; Vault
#    issues the workload-specific token; tokens fetch the actual secrets.

# 5) Pre-shutdown: revoke the lease so Vault doesn't keep credentials valid.
import signal, atexit

def revoke_lease_on_exit():
    try:
        # In real code, hold onto lease_id from the secret payload.
        # client.sys.revoke_lease(lease_id=...)
        pass
    except Exception as e:
        log.warning("lease_revoke_failed: %s", e)

atexit.register(revoke_lease_on_exit)
signal.signal(signal.SIGTERM, lambda *_: (revoke_lease_on_exit(), os._exit(0)))

# Decision rule:
#   real secrets need to live somewhere   -> Vault / AWS Secrets Manager / GCP SM
#   delivered to the app as env var       -> orchestrator-injected; never .env in prod
#   need rotation                          -> manager rotates; app refreshes (poll OR file watch)
#   want short-lived credentials          -> Vault dynamic secrets (database/creds/...)
#   secret-zero problem                    -> orchestrator identity (k8s SA / IAM / WI)
#   hot reload without restart             -> Vault Agent file watch + watchdog + creator= callable
#   stateless serverless (Lambda)          -> KMS-encrypted env vars OR Secrets Manager fetch (cached)
#   GitOps / Argo CD                       -> SealedSecrets / SOPS / external-secrets-operator
#   shared by many services                -> Vault path namespacing (auth/{team}/myapp)
#   audit "who fetched this secret"        -> all three managers log fetches; Vault is most detailed
#   key rotation in the app                -> see key-rotation entry; this is for the secret SOURCE
#
# Anti-pattern: caching a fetched secret indefinitely with no refresh.
# Even with Vault rotation in place, if the app fetches once at startup
# and never again, rotation at the manager has zero effect on the running
# app — and rotated credentials are typically retired (the OLD password
# stops working). Either: poll periodically, watch the file (Vault Agent),
# or use a short-lived dynamic secret that the app must renew.
```

## Decision Rule

```text
real secrets need to live somewhere   -> Vault / AWS Secrets Manager / GCP SM
delivered to the app as env var       -> orchestrator-injected; never .env in prod
need rotation                          -> manager rotates; app refreshes (poll OR file watch)
want short-lived credentials          -> Vault dynamic secrets (database/creds/...)
secret-zero problem                    -> orchestrator identity (k8s SA / IAM / WI)
hot reload without restart             -> Vault Agent file watch + watchdog + creator= callable
stateless serverless (Lambda)          -> KMS-encrypted env vars OR Secrets Manager fetch (cached)
GitOps / Argo CD                       -> SealedSecrets / SOPS / external-secrets-operator
shared by many services                -> Vault path namespacing (auth/{team}/myapp)
audit "who fetched this secret"        -> all three managers log fetches; Vault is most detailed
key rotation in the app                -> see key-rotation entry; this is for the secret SOURCE
```

## Anti-Pattern

> [!warning] Anti-pattern
> caching a fetched secret indefinitely with no refresh.
> Even with Vault rotation in place, if the app fetches once at startup
> and never again, rotation at the manager has zero effect on the running
> app — and rotated credentials are typically retired (the OLD password
> stops working). Either: poll periodically, watch the file (Vault Agent),
> or use a short-lived dynamic secret that the app must renew.

## Tips

- AWS Secrets Manager + IAM instance profile (or k8s service account via IRSA) is the lowest-friction path on AWS. The app gets its IAM identity from EC2/EKS metadata; no static AWS credentials anywhere.
- For Vault, the Vault Agent injector is the production pattern: a sidecar fetches secrets, writes them to a file, renews leases automatically. The app only needs to read the file; no Vault client code.
- Vault's DYNAMIC secrets (`database/creds/...`) are strictly better than rotation: each pod gets a fresh DB user with a short-lived password. Compromise of one pod doesn't leak credentials others use.
- For SQLAlchemy with rotating credentials, use `create_engine(URL, creator=callable)` — the callable is invoked for every new connection, so each connection picks up the latest password from your secret cache.
- Secret-zero (the credential needed to fetch other credentials) is solved by orchestrator identity: k8s service account JWT for Kubernetes auth, instance profile for AWS, workload identity for GCP. Never store a long-lived "Vault token" in env.
- Always set up lease renewal AND graceful revocation on shutdown. SIGTERM handler that revokes the lease prevents leaked credentials from outliving the pod.

## Common Mistake

> [!warning] Caching a fetched secret indefinitely without refresh. Even with Vault rotation in place, an app that fetches once at startup and never again sees zero benefit from rotation — and rotated credentials are typically retired (the old password stops working). Either poll periodically, watch the secret file (Vault Agent), or use short-lived dynamic secrets that must be renewed.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Fetch once at startup; never refresh; rotation breaks the app
SECRET = sm.get_secret_value(SecretId="...")["SecretString"]
```

**Senior:**
```python
# Refresh in background; new connections see new password
DB_SECRET = SecretCache("prod/myapp/database", refresh_s=300)
engine = create_engine(URL, creator=lambda: connect(**DB_SECRET.get()))
```

## See Also

- [[Sections/crypto-secrets/secrets-management/env-var-secrets|Environment-variable secrets — typed loading and validation (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/key-rotation|Key rotation — dual-acceptance, kid prefix, batch re-encryption (Crypto & Secrets)]]
- [[Sections/crypto-secrets/secrets-management/_Index|Crypto & Secrets → Secrets Management — env vars, Vault / KMS, key rotation]]
- [[Sections/crypto-secrets/_Index|Crypto & Secrets index]]
- [[_Index|Vault index]]

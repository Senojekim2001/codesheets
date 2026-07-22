---
type: "entry"
domain: "python"
file: "notebooks"
section: "production"
id: "jupyterhub-deployment"
title: "JupyterHub — multi-user notebook server with auth, resources"
category: "Production"
subtitle: "JupyterHub config, KubeSpawner, OAuth (GitHub/Google/OIDC), resource limits, profile_list, persistent storage, image curation"
signature_short: "jupyterhub --config /etc/jupyterhub_config.py"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "JupyterHub — multi-user notebook server with auth, resources"
  - "jupyterhub-deployment"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/production"
  - "category/production"
  - "tier/tiered"
---

# JupyterHub — multi-user notebook server with auth, resources

> JupyterHub config, KubeSpawner, OAuth (GitHub/Google/OIDC), resource limits, profile_list, persistent storage, image curation

## Overview

JupyterHub is the "many-users-one-Jupyter" deployment: each user logs in (OAuth), gets their own kernel (in a process, container, or k8s pod), with their own home directory persisted across sessions. Spawners: `LocalProcessSpawner` (one host, multiple users — small teams); `DockerSpawner` (container per user); `KubeSpawner` (pod per user, the standard for any team >5). The three examples solve the SAME concrete task — deploy JupyterHub for a team of 20 — at three depths: LocalProcessSpawner + dummy auth → DockerSpawner + GitHub OAuth → KubeSpawner + GPU profiles + persistent volumes.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Run JupyterHub for a small team on one server. pip install jupyterhub npm install -g configurable-http-proxy jupyterhub --generate-config
- **Junior** — SAME — but isolate users via Docker; auth via GitHub OAuth. pip install jupyterhub dockerspawner oauthenticator
- **Senior** — SAME — production: KubeSpawner with GPU profiles, OIDC, persistent volumes, autoscaling. pip install jupyterhub kubespawner oauthenticator

## Signature

```python
jupyterhub --config /etc/jupyterhub_config.py
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Run JupyterHub for a small team on one server.
# pip install jupyterhub
# npm install -g configurable-http-proxy
# jupyterhub --generate-config

# === jupyterhub_config.py ===
# c = get_config()
#
# # Listen on all interfaces.
# c.JupyterHub.bind_url = "http://0.0.0.0:8000"
#
# # Use system PAM (Linux user accounts) for auth.
# c.JupyterHub.authenticator_class = "pam"
# c.PAMAuthenticator.create_system_users = False
#
# # Each user gets their own subprocess.
# c.JupyterHub.spawner_class = "jupyterhub.spawner.LocalProcessSpawner"
#
# # Default kernel image.
# c.Spawner.notebook_dir = "~/notebooks"
# c.Spawner.default_url = "/lab"                       # open JupyterLab by default

# Run:
#   $ sudo jupyterhub
# Open http://localhost:8000; log in with a Linux account.

# This works for ~5-20 users on a single beefy server. Beyond that,
# move to DockerSpawner or KubeSpawner.

# === Idle culling — kill inactive servers ===
# c.JupyterHub.services = [
#     {
#         "name": "idle-culler",
#         "admin": True,
#         "command": [
#             "python", "-m", "jupyterhub_idle_culler",
#             "--timeout=3600", "--cull-every=600",
#         ],
#     },
# ]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but isolate users via Docker; auth via GitHub OAuth.
# pip install jupyterhub dockerspawner oauthenticator

# === jupyterhub_config.py ===
# c = get_config()
#
# # GitHub OAuth.
# c.JupyterHub.authenticator_class = "oauthenticator.GitHubOAuthenticator"
# c.GitHubOAuthenticator.client_id = "..."
# c.GitHubOAuthenticator.client_secret = "..."
# c.GitHubOAuthenticator.oauth_callback_url = "https://hub.example.com/hub/oauth_callback"
# c.GitHubOAuthenticator.allowed_organizations = ["myorg"]
# # Optional team restriction:
# c.GitHubOAuthenticator.allowed_teams = ["myorg:data-science"]
#
# # Docker container per user.
# c.JupyterHub.spawner_class = "dockerspawner.DockerSpawner"
# c.DockerSpawner.image = "jupyter/datascience-notebook:python-3.12"
# c.DockerSpawner.network_name = "jupyterhub-net"
# c.DockerSpawner.notebook_dir = "/home/jovyan/work"
#
# # Per-user persistent volume (named volume).
# c.DockerSpawner.volumes = {
#     "jupyterhub-user-{username}": "/home/jovyan/work",
# }
#
# # Resource limits.
# c.DockerSpawner.mem_limit = "4G"
# c.DockerSpawner.cpu_limit = 2
#
# # Idle timeout.
# c.Spawner.timeout = 60                                 # spawn timeout
# c.Spawner.http_timeout = 120                           # request timeout

# === docker-compose.yml ===
# version: '3'
# services:
#   hub:
#     build: .
#     image: jupyterhub:custom
#     container_name: jupyterhub
#     networks: [jupyterhub-net]
#     volumes:
#       - "/var/run/docker.sock:/var/run/docker.sock:rw"
#       - "./data:/data"
#     ports: ["8000:8000"]
#     environment:
#       - DOCKER_NETWORK_NAME=jupyterhub-net
# networks:
#   jupyterhub-net:
#     name: jupyterhub-net

# === Custom user image ===
# Dockerfile.user
# FROM jupyter/datascience-notebook:python-3.12
# USER root
# RUN apt-get update && apt-get install -y --no-install-recommends git \
#     && rm -rf /var/lib/apt/lists/*
# USER ${NB_UID}
# COPY --chown=${NB_UID}:${NB_GID} requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: KubeSpawner with GPU profiles, OIDC,
#             persistent volumes, autoscaling.
# pip install jupyterhub kubespawner oauthenticator

# === jupyterhub_config.py ===
# c = get_config()
#
# # OIDC auth (Okta / Auth0 / Google Workspace).
# c.JupyterHub.authenticator_class = "oauthenticator.generic.GenericOAuthenticator"
# c.GenericOAuthenticator.client_id = os.environ["OIDC_CLIENT_ID"]
# c.GenericOAuthenticator.client_secret = os.environ["OIDC_CLIENT_SECRET"]
# c.GenericOAuthenticator.token_url = "https://accounts.example.com/oauth2/token"
# c.GenericOAuthenticator.userdata_url = "https://accounts.example.com/oauth2/userinfo"
# c.GenericOAuthenticator.username_claim = "email"
# c.GenericOAuthenticator.scope = ["openid", "email", "profile", "groups"]
#
# # KubeSpawner: each user gets a pod.
# c.JupyterHub.spawner_class = "kubespawner.KubeSpawner"
# c.KubeSpawner.image = "myorg/jupyter-base:1.4.2"
# c.KubeSpawner.cpu_limit = 4
# c.KubeSpawner.mem_limit = "8G"
# c.KubeSpawner.cmd = ["jupyter", "labhub"]
#
# # Persistent volume per user (PVC).
# c.KubeSpawner.pvc_name_template = "claim-{username}"
# c.KubeSpawner.storage_pvc_ensure = True
# c.KubeSpawner.storage_capacity = "10Gi"
# c.KubeSpawner.volumes = [
#     {"name": "home", "persistentVolumeClaim": {"claimName": "claim-{username}"}},
# ]
# c.KubeSpawner.volume_mounts = [
#     {"name": "home", "mountPath": "/home/jovyan/work"},
# ]
#
# # Profile picker on spawn — user chooses CPU vs GPU.
# c.KubeSpawner.profile_list = [
#     {
#         "display_name": "Standard (4 CPU, 8 GB)",
#         "default": True,
#         "kubespawner_override": {
#             "image": "myorg/jupyter-base:1.4.2",
#             "cpu_limit": 4,
#             "mem_limit": "8G",
#         },
#     },
#     {
#         "display_name": "Large (16 CPU, 32 GB)",
#         "kubespawner_override": {
#             "image": "myorg/jupyter-base:1.4.2",
#             "cpu_limit": 16,
#             "mem_limit": "32G",
#         },
#     },
#     {
#         "display_name": "GPU T4 (1 GPU, 8 CPU, 32 GB)",
#         "kubespawner_override": {
#             "image": "myorg/jupyter-gpu:1.4.2",
#             "cpu_limit": 8,
#             "mem_limit": "32G",
#             "extra_resource_limits": {"nvidia.com/gpu": 1},
#             "node_selector": {"cloud.google.com/gke-accelerator": "nvidia-tesla-t4"},
#         },
#     },
# ]
#
# # Idle culling.
# c.JupyterHub.services = [{
#     "name": "idle-culler", "admin": True,
#     "command": ["python", "-m", "jupyterhub_idle_culler",
#                  "--timeout=7200", "--cull-every=600"],
# }]
#
# # Cluster-autoscale-friendly: configure HPA on JupyterHub deployment;
# # cluster autoscaler grows nodes for spawned pods.

# === Helm chart ===
# Use the official Zero to JupyterHub on Kubernetes (Z2JH) helm chart;
# captures all of the above plus more.
# $ helm repo add jupyterhub https://hub.jupyter.org/helm-chart/
# $ helm install hub jupyterhub/jupyterhub --version 4.0.0 -f values.yaml

# values.yaml (excerpt):
#   hub:
#     config:
#       GenericOAuthenticator:
#         client_id: "..."
#         token_url: "..."
#       JupyterHub:
#         authenticator_class: generic-oauth
#   singleuser:
#     image:
#       name: myorg/jupyter-base
#       tag: "1.4.2"
#     storage:
#       capacity: 10Gi
#     profileList:
#       - display_name: "Standard"
#         default: true
#         kubespawner_override:
#           cpu_limit: 4
#           mem_limit: 8G

# Decision rule:
#   1-5 users, one machine                 -> LocalProcessSpawner
#   5-50 users, isolation needed            -> DockerSpawner
#   any team on k8s                          -> KubeSpawner
#   GPU access                                -> profile_list with GPU node selector
#   per-user persistent storage              -> PVC per user (KubeSpawner)
#   shared datasets                            -> read-only volume mounted on all spawns
#   need full Z2JH features                   -> use the official Helm chart
#   simple LDAP                                 -> ldapauthenticator
#   GitHub-only org                             -> GitHubOAuthenticator
#   multi-tenant SaaS                          -> NOT JupyterHub; build your own
#   want managed service                       -> Vertex AI Workbench, SageMaker, Hex, Deepnote
#   need to scale to 1000+ users               -> z2jh on big k8s; or managed service
#   read-only shared notebooks                 -> nbgallery; voila
#
# Anti-pattern: running JupyterHub with PAM auth on a public-facing
# server. PAM = system Linux users; everyone you give a notebook to
# has shell access to the host. Use OAuth (GitHub, OIDC) and Docker/
# KubeSpawner for proper isolation.
```

## Decision Rule

```text
1-5 users, one machine                 -> LocalProcessSpawner
5-50 users, isolation needed            -> DockerSpawner
any team on k8s                          -> KubeSpawner
GPU access                                -> profile_list with GPU node selector
per-user persistent storage              -> PVC per user (KubeSpawner)
shared datasets                            -> read-only volume mounted on all spawns
need full Z2JH features                   -> use the official Helm chart
simple LDAP                                 -> ldapauthenticator
GitHub-only org                             -> GitHubOAuthenticator
multi-tenant SaaS                          -> NOT JupyterHub; build your own
want managed service                       -> Vertex AI Workbench, SageMaker, Hex, Deepnote
need to scale to 1000+ users               -> z2jh on big k8s; or managed service
read-only shared notebooks                 -> nbgallery; voila
```

## Anti-Pattern

> [!warning] Anti-pattern
> running JupyterHub with PAM auth on a public-facing
> server. PAM = system Linux users; everyone you give a notebook to
> has shell access to the host. Use OAuth (GitHub, OIDC) and Docker/
> KubeSpawner for proper isolation.

## Tips

- For >5 users, ALWAYS use container isolation (DockerSpawner or KubeSpawner). LocalProcessSpawner gives users full host access — fine for solo, dangerous for teams.
- OAuth via OIDC (Okta, Auth0, Google) is the production auth choice. GitHub auth is fine for engineering teams; PAM (Linux users) is dev-only.
- `profile_list` lets users pick resource size at spawn — Standard / Large / GPU. KubeSpawner reads the choice and configures the pod accordingly.
- Persistent per-user storage via PVC (`pvc_name_template = "claim-{username}"`). Without it, users lose their files on every container restart.
- Always run idle-culler — kills servers idle for N seconds. Without it, abandoned sessions hold resources forever.
- Use the official Z2JH Helm chart (Zero to JupyterHub) for k8s deployments. Captures all best practices; well-tested by the community.

## Common Mistake

> [!warning] Running JupyterHub with PAM auth on a public-facing server. PAM = system Linux users; users you grant notebook access to also have shell on the host. Use OAuth (GitHub/Google/OIDC) and DockerSpawner or KubeSpawner so users are isolated to a container, not the host.

## Shorthand (Junior → Senior)

**Junior:**
```python
# PAM + LocalProcessSpawner — users have host shell access
c.JupyterHub.authenticator_class = "pam"
c.JupyterHub.spawner_class = "LocalProcessSpawner"
```

**Senior:**
```python
# OAuth + KubeSpawner — proper isolation
c.JupyterHub.authenticator_class = "oauthenticator.generic.GenericOAuthenticator"
c.JupyterHub.spawner_class = "kubespawner.KubeSpawner"
c.KubeSpawner.profile_list = [{"display_name": "...", "kubespawner_override": {...}}]
```

## See Also

- [[Sections/notebooks/production/notebook-ci-testing|Notebook CI testing — nbval, pytest-notebook, papermill assertions (Notebooks)]]
- [[Sections/notebooks/production/notebook-anti-patterns|Notebook anti-patterns — when to graduate to .py (Notebooks)]]
- [[Sections/notebooks/production/_Index|Notebooks → Production — CI testing, JupyterHub, anti-patterns]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

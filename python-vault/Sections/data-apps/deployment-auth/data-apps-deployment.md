---
type: "entry"
domain: "python"
file: "data-apps"
section: "deployment-auth"
id: "data-apps-deployment"
title: "Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions"
category: "Deployment"
subtitle: "streamlit run + websockets, gunicorn for Dash, nginx reverse proxy, sticky sessions / session affinity, k8s sessionAffinity, HF Spaces, performance limits"
signature_short: "streamlit run app.py --server.port 8501 --server.address 127.0.0.1
# nginx: proxy_pass + WebSocket upgrade headers"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions"
  - "data-apps-deployment"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/deployment-auth"
  - "category/deployment"
  - "tier/tiered"
---

# Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions

> streamlit run + websockets, gunicorn for Dash, nginx reverse proxy, sticky sessions / session affinity, k8s sessionAffinity, HF Spaces, performance limits

## Overview

Each framework has different deployment characteristics: **Streamlit** is per-session stateful — `st.session_state` lives in the server process, so all of one user's requests must hit the SAME replica (sticky sessions). **Dash** is mostly stateless (state in `dcc.Store` browser-side or callback args) — scales horizontally by default. **Gradio** uses WebSockets for the queue — needs WebSocket-aware proxy. The three examples solve the SAME concrete task — deploy a Streamlit app behind nginx, scale to multiple replicas, survive restarts — at three depths: single instance behind nginx → sticky sessions via nginx `ip_hash` → k8s with `sessionAffinity: ClientIP`, deployment knobs, when to leave Streamlit.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Deploy Streamlit behind nginx for one replica. Dockerfile (cross-references containerization sheet): FROM python:3.12-slim WORKDIR /app COPY requirements.txt . RUN pip install --no-cache-dir -r requirements.txt COPY . . EXPOSE 8501 CMD ["streamlit", "run", "app.py", \ "--server.port", "8501", \ "--server.address", "0.0.0.0", \ "--server.headless", "true"]
- **Junior** — SAME — but multiple replicas with sticky sessions. Streamlit: each replica has its own st.session_state; without sticky sessions, request 1 hits replica A, request 2 hits replica B, B has no state, app appears to "reset" mid-interaction.
- **Senior** — SAME — production: k8s deployment, sessionAffinity, health probes, autoscaling, when Streamlit hits its limits.

## Signature

```python
streamlit run app.py --server.port 8501 --server.address 127.0.0.1
# nginx: proxy_pass + WebSocket upgrade headers
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Deploy Streamlit behind nginx for one replica.
# Dockerfile (cross-references containerization sheet):
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# EXPOSE 8501
# CMD ["streamlit", "run", "app.py", \
#      "--server.port", "8501", \
#      "--server.address", "0.0.0.0", \
#      "--server.headless", "true"]

# === nginx config (single replica) ===
# server {
#     listen 80;
#     server_name myapp.example.com;
#
#     location / {
#         proxy_pass http://streamlit:8501;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#
#         # WebSocket upgrade (REQUIRED for Streamlit; the UI uses WS).
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection "upgrade";
#
#         # Long-lived WebSocket connections.
#         proxy_read_timeout 86400;
#         proxy_send_timeout 86400;
#     }
# }

# Same for Dash (port 8050) and Gradio (port 7860).

# Common gotcha: forgetting WebSocket upgrade headers. Streamlit
# loads but every interaction freezes — the UI uses WebSockets for
# state sync, falls back to long polling badly without proper proxy.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but multiple replicas with sticky sessions.
# Streamlit: each replica has its own st.session_state; without
# sticky sessions, request 1 hits replica A, request 2 hits replica B,
# B has no state, app appears to "reset" mid-interaction.

# === nginx config: ip_hash for stickiness ===
# upstream streamlit_backend {
#     ip_hash;                          # all requests from same IP -> same replica
#     server streamlit-1:8501;
#     server streamlit-2:8501;
#     server streamlit-3:8501;
# }
#
# server {
#     listen 80;
#     server_name myapp.example.com;
#
#     location / {
#         proxy_pass http://streamlit_backend;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection "upgrade";
#         proxy_read_timeout 86400;
#     }
# }

# === Cookie-based stickiness (better than IP) ===
# Better: use 'sticky cookie' (nginx Plus, or HAProxy). IP-based hashing
# breaks behind corp proxies (everyone shares an IP).
# In nginx Plus:
# upstream streamlit_backend {
#     sticky cookie srv_id expires=1h domain=.example.com path=/;
#     server streamlit-1:8501;
#     ...
# }

# === Dash — mostly stateless ===
# Dash callbacks receive state via Inputs/State. No per-replica state
# unless you mutate globals (which you shouldn't). Just round-robin:
# upstream dash_backend {
#     server dash-1:8050;
#     server dash-2:8050;
#     server dash-3:8050;
# }
# (no ip_hash)

# === Gradio — queue requires sticky ===
# Gradio's queue is per-process; sticky sessions needed:
# upstream gradio_backend {
#     ip_hash;
#     server gradio-1:7860;
#     server gradio-2:7860;
# }
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: k8s deployment, sessionAffinity,
#             health probes, autoscaling, when Streamlit hits its limits.

# === Streamlit Deployment + Service (k8s) ===
# apiVersion: apps/v1
# kind: Deployment
# metadata: { name: streamlit, namespace: tools }
# spec:
#   replicas: 3
#   selector:
#     matchLabels: { app: streamlit }
#   template:
#     metadata: { labels: { app: streamlit } }
#     spec:
#       containers:
#         - name: streamlit
#           image: ghcr.io/myorg/myapp:1.4.2
#           ports: [{ containerPort: 8501 }]
#           env:
#             - name: STREAMLIT_SERVER_PORT
#               value: "8501"
#             - name: STREAMLIT_SERVER_ADDRESS
#               value: "0.0.0.0"
#             - name: STREAMLIT_SERVER_ENABLE_CORS
#               value: "false"
#             - name: STREAMLIT_BROWSER_GATHER_USAGE_STATS
#               value: "false"
#           livenessProbe:
#             httpGet: { path: /_stcore/health, port: 8501 }
#             periodSeconds: 30
#             timeoutSeconds: 5
#           readinessProbe:
#             httpGet: { path: /_stcore/health, port: 8501 }
#             periodSeconds: 5
#             failureThreshold: 1
#           resources:
#             requests: { cpu: 200m, memory: 512Mi }
#             limits:   { cpu: 1000m, memory: 1Gi }
# ---
# # Service with sessionAffinity for sticky sessions
# apiVersion: v1
# kind: Service
# metadata: { name: streamlit, namespace: tools }
# spec:
#   type: ClusterIP
#   selector: { app: streamlit }
#   ports:
#     - { port: 80, targetPort: 8501, protocol: TCP }
#   sessionAffinity: ClientIP
#   sessionAffinityConfig:
#     clientIP:
#       timeoutSeconds: 10800              # 3 hours

# === Ingress with WebSocket support ===
# apiVersion: networking.k8s.io/v1
# kind: Ingress
# metadata:
#   name: streamlit
#   namespace: tools
#   annotations:
#     nginx.ingress.kubernetes.io/proxy-read-timeout: "86400"
#     nginx.ingress.kubernetes.io/proxy-send-timeout: "86400"
#     nginx.ingress.kubernetes.io/ssl-redirect: "true"
# spec:
#   tls:
#     - hosts: [tools.example.com]
#       secretName: tools-tls
#   rules:
#     - host: tools.example.com
#       http:
#         paths:
#           - path: /
#             pathType: Prefix
#             backend:
#               service: { name: streamlit, port: { number: 80 } }

# === Autoscaling (HPA) ===
# Streamlit's per-session state limits autoscaling — scaling DOWN
# evicts active sessions. Use long pre-stop sleep + careful autoscale.
# apiVersion: autoscaling/v2
# kind: HorizontalPodAutoscaler
# metadata: { name: streamlit }
# spec:
#   scaleTargetRef:
#     apiVersion: apps/v1
#     kind: Deployment
#     name: streamlit
#   minReplicas: 2
#   maxReplicas: 10
#   metrics:
#     - type: Resource
#       resource:
#         name: cpu
#         target: { type: Utilization, averageUtilization: 70 }
#   behavior:
#     scaleDown:
#       stabilizationWindowSeconds: 600    # 10 min before scaling down
#       policies:
#         - type: Pods
#           value: 1
#           periodSeconds: 300

# Decision rule:
#   Streamlit                              -> sessionAffinity: ClientIP; can't load-balance freely
#   Dash                                    -> stateless; round-robin works
#   Gradio                                   -> sessionAffinity: ClientIP for queue
#   need WebSockets through proxy           -> proxy_set_header Upgrade/Connection
#   long-lived connections                   -> proxy_read_timeout 86400 (1 day)
#   autoscaling                              -> Streamlit hostile to scale-down; long stabilization
#   shared session state across replicas    -> NOT Streamlit; shared backend (Redis/DB)
#   public app with thousands of users      -> consider real frontend; Streamlit ~100s of concurrent
#   many ephemeral sessions                  -> add slow scale-down to preserve active users
#   GPU-bound (Gradio)                        -> request gpu in resources; small replica count
#   per-environment configs                   -> envFrom: configMapRef + secretRef
#   logging                                   -> stdout JSON; same as containerization sheet
#   tracing                                   -> install OTel SDK; auto-instrument FastAPI if mounted
#   Streamlit Cloud                           -> free tier; managed; limited (1GB RAM, no GPU)
#   Hugging Face Spaces                       -> free Gradio hosting; GPU paid
#   Hard scale ceiling                         -> Streamlit ~100 concurrent / replica;
#                                                 above that, switch to a real frontend
#
# Anti-pattern: deploying Streamlit at scale (1000+ concurrent users)
# without considering its single-process stateful model. Streamlit was
# designed for "internal tool, 10-50 users" — not as a public app
# framework. At scale it becomes flaky: per-session state in process
# memory, sticky sessions complicate everything, autoscale-down drops
# user sessions, websocket connections accumulate. If you need that
# scale, build a real frontend (React/Svelte) backed by FastAPI.
```

## Decision Rule

```text
Streamlit                              -> sessionAffinity: ClientIP; can't load-balance freely
Dash                                    -> stateless; round-robin works
Gradio                                   -> sessionAffinity: ClientIP for queue
need WebSockets through proxy           -> proxy_set_header Upgrade/Connection
long-lived connections                   -> proxy_read_timeout 86400 (1 day)
autoscaling                              -> Streamlit hostile to scale-down; long stabilization
shared session state across replicas    -> NOT Streamlit; shared backend (Redis/DB)
public app with thousands of users      -> consider real frontend; Streamlit ~100s of concurrent
many ephemeral sessions                  -> add slow scale-down to preserve active users
GPU-bound (Gradio)                        -> request gpu in resources; small replica count
per-environment configs                   -> envFrom: configMapRef + secretRef
logging                                   -> stdout JSON; same as containerization sheet
tracing                                   -> install OTel SDK; auto-instrument FastAPI if mounted
Streamlit Cloud                           -> free tier; managed; limited (1GB RAM, no GPU)
Hugging Face Spaces                       -> free Gradio hosting; GPU paid
Hard scale ceiling                         -> Streamlit ~100 concurrent / replica;
                                              above that, switch to a real frontend
```

## Anti-Pattern

> [!warning] Anti-pattern
> deploying Streamlit at scale (1000+ concurrent users)
> without considering its single-process stateful model. Streamlit was
> designed for "internal tool, 10-50 users" — not as a public app
> framework. At scale it becomes flaky: per-session state in process
> memory, sticky sessions complicate everything, autoscale-down drops
> user sessions, websocket connections accumulate. If you need that
> scale, build a real frontend (React/Svelte) backed by FastAPI.

## Tips

- Streamlit's `st.session_state` lives in the server process — sticky sessions are MANDATORY for multi-replica deployments. nginx `ip_hash` or k8s `sessionAffinity: ClientIP`.
- WebSocket upgrade headers (`Upgrade`, `Connection`) are required for Streamlit AND Gradio. Without them, the UI loads but interactions freeze.
- Streamlit's health endpoint is `/_stcore/health` (Streamlit 1.27+). Use it for k8s liveness/readiness probes.
- Dash is mostly stateless — round-robin works fine. State lives in `dcc.Store` (browser) or callback args. Don't introduce sticky sessions unless your callbacks mutate globals (anti-pattern).
- Streamlit + autoscaling is hostile — scaling down evicts active sessions. Use long `stabilizationWindowSeconds` (10+ min) and prefer scale-up-only.
- For >100 concurrent Streamlit users per replica, performance degrades. That's the rough ceiling per process; horizontal scaling helps but adds sticky-session complexity. At thousands of users, build a real frontend.

## Common Mistake

> [!warning] Deploying Streamlit at scale (1000+ concurrent users) without recognizing its model. Streamlit was designed for "internal tool, 10-50 users" — not as a public app framework. At scale: per-session state in process memory, sticky sessions complicate everything, autoscale-down drops user sessions, websocket connections accumulate. For that scale, build a real frontend (React/Svelte) backed by FastAPI.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Streamlit + 100s of concurrent users + autoscaling
# = sessions getting dropped, sticky sessions imbalance, ws leaks
```

**Senior:**
```python
# Real public scale: Streamlit is wrong tool
# Build React/Svelte + FastAPI; keep Streamlit for internal tools
```

## See Also

- [[Sections/web/web-deployment/gunicorn|gunicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/uvicorn|uvicorn (Web (Flask, Django))]]
- [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient (Web (Flask, Django))]]
- [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access (Data Apps)]]
- [[Sections/data-apps/deployment-auth/_Index|Data Apps → Deployment & Auth — multipage, sticky sessions, behind nginx]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]

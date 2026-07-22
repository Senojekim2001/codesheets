---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-middleware"
title: "@app.before_request, @app.after_request"
category: "Flask"
subtitle: "Request/response hooks, error handlers"
signature_short: "@app.before_request  |  @app.after_request  |  @app.errorhandler()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@app.before_request, @app.after_request"
  - "flask-middleware"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# @app.before_request, @app.after_request

> Request/response hooks, error handlers

## Overview

Flask provides lifecycle hooks to intercept and modify requests and responses. Use `@app.before_request` to run logic before each request (e.g., authentication), `@app.after_request` to modify responses, and `@app.errorhandler()` to handle exceptions globally.

## Signature

```python
@app.before_request  |  @app.after_request  |  @app.errorhandler()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One before_request hook + one error handler
# STRENGTHS - Smallest demonstration of the request lifecycle
# WEAKNESSES- No teardown, no after_request, no app-context awareness
#
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.before_request
def log_request():
    print(f"--> {request.method} {request.path}")

@app.errorhandler(404)
def not_found(e):
    return jsonify(error="not_found"), 404

@app.route("/")
def index():
    return jsonify(ok=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - before/after/teardown hooks plus a typed error handler
# STRENGTHS - Covers the full request lifecycle Flask actually exposes
# WEAKNESSES- Header manipulation by hand; no Talisman/CSRF
#
import time
from flask import Flask, request, jsonify, g
app = Flask(__name__)

@app.before_request
def start_timer():
    g.t0 = time.perf_counter()                  # g is per-request scratch space
    if request.path.startswith("/api/") and not request.headers.get("Authorization"):
        return jsonify(error="unauthorized"), 401   # short-circuits the request

@app.after_request
def add_metrics(response):
    response.headers["X-Response-Time"] = f"{(time.perf_counter() - g.t0)*1000:.1f}ms"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response                              # MUST return the response

@app.teardown_request
def cleanup(exc):                                # runs even on exceptions
    pass                                         # close DB sessions, release locks

@app.errorhandler(Exception)
def all_errors(e):
    code = getattr(e, "code", 500)
    return jsonify(error=type(e).__name__, message=str(e)), code

@app.get("/api/data")
def data():
    return jsonify(value=42)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - WSGI-level middleware, structured logging, security headers, CSRF/CORS
# STRENGTHS - The hardening real Flask APIs ship with
# WEAKNESSES- N/A
#
import time, uuid, logging
from flask import Flask, request, jsonify, g

app = Flask(__name__)
log = logging.getLogger("app")

# 1) WSGI middleware — runs OUTSIDE Flask's request context.
#    Use this for things like ProxyFix (X-Forwarded-For) and request size limits.
from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# 2) Per-request correlation ID for log tracing
@app.before_request
def assign_request_id():
    g.request_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex
    g.t0 = time.perf_counter()

@app.after_request
def attach_metadata(resp):
    resp.headers["X-Request-Id"] = g.request_id
    # Security headers — turn these on by default
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    log.info("req",
             extra={"rid": g.request_id, "path": request.path,
                    "ms": (time.perf_counter() - g.t0) * 1000,
                    "status": resp.status_code})
    return resp

# 3) Stable error contract — never let a 500 leak a stack trace as JSON
from werkzeug.exceptions import HTTPException
@app.errorhandler(HTTPException)
def http_err(e):
    return jsonify(error=e.name, message=e.description, request_id=g.get("request_id")), e.code

@app.errorhandler(Exception)
def unhandled(e):
    log.exception("unhandled", extra={"rid": g.get("request_id")})
    return jsonify(error="internal_server_error", request_id=g.get("request_id")), 500

# Decision rule:
#   request-scoped state                  -> flask.g (cleared per request)
#   long-lived background task            -> NEVER use g — pass explicit args
#   load-balancer-side concerns           -> WSGI middleware (ProxyFix, etc.)
#   per-blueprint cross-cutting concern   -> blueprint.before_request, not app.before_request
#   security headers                      -> use Flask-Talisman in real apps
#
# Anti-pattern: returning None from after_request
#   The decorator REQUIRES the response object back. Returning None or a tuple
#   silently 500s the next request. Always: return response.
```

## Decision Rule

```text
request-scoped state                  -> flask.g (cleared per request)
long-lived background task            -> NEVER use g — pass explicit args
load-balancer-side concerns           -> WSGI middleware (ProxyFix, etc.)
per-blueprint cross-cutting concern   -> blueprint.before_request, not app.before_request
security headers                      -> use Flask-Talisman in real apps
```

## Anti-Pattern

> [!warning] Anti-pattern
> returning None from after_request
>   The decorator REQUIRES the response object back. Returning None or a tuple
>   silently 500s the next request. Always: return response.

## Tips

- Use `@app.before_request` for cross-cutting concerns: auth, logging, rate-limiting.
- `@app.after_request` receives the response object; always return it.
- Error handlers catch exceptions and return appropriate responses.

## Common Mistake

> [!warning] Defining middleware after routes; register hooks early in app initialization.

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.before_request
def authenticate():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "Not found"}), 404
```

**Senior:**
```python
@app.before_request
def auth():
    if not request.headers.get("Authorization"): abort(401)

@app.after_request
def cors(r):
    r.headers["Access-Control-Allow-Origin"] = "*"; return r
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

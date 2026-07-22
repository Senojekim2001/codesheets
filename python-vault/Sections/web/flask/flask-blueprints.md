---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-blueprints"
title: "Blueprint()"
category: "Flask"
subtitle: "Modular app structure, route grouping"
signature_short: "bp = Blueprint(\"name\", __name__, url_prefix=\"/api\")  |  app.register_blueprint(bp)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Blueprint()"
  - "flask-blueprints"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# Blueprint()

> Modular app structure, route grouping

## Overview

Blueprints allow you to organize related routes into separate modules. Define routes on a Blueprint object, then register it with the main app. Use `url_prefix` to group routes under a common path (e.g., `/api/users`).

## Signature

```python
bp = Blueprint("name", __name__, url_prefix="/api")  |  app.register_blueprint(bp)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Blueprint, register on the app
# STRENGTHS - Smallest demonstration of routes-without-app
# WEAKNESSES- Single file, no per-blueprint config
#
from flask import Flask, Blueprint, jsonify

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.get("/")
def list_users():
    return jsonify([{"id": 1, "name": "Alice"}])

app = Flask(__name__)
app.register_blueprint(users_bp)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two blueprints in their own modules, registered in the app factory
# STRENGTHS - The shape every real Flask app converges on
# WEAKNESSES- No error handlers, no per-blueprint before_request hooks
#
# app/users.py
from flask import Blueprint, jsonify
users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.get("/")
def list_users():
    return jsonify([{"id": 1, "name": "Alice"}])

@users_bp.get("/<int:user_id>")
def get_user(user_id):
    return jsonify(id=user_id, name="Alice")

# app/posts.py
posts_bp = Blueprint("posts", __name__, url_prefix="/posts")

@posts_bp.get("/")
def list_posts():
    return jsonify([{"id": 1, "title": "First"}])

# app/__init__.py
from flask import Flask
def create_app():
    app = Flask(__name__)
    app.register_blueprint(users_bp)
    app.register_blueprint(posts_bp)
    return app
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Versioned blueprints, blueprint-scoped errors, url_for("bp.view")
# STRENGTHS - The patterns that make blueprints actually pay off at scale
# WEAKNESSES- N/A
#
from flask import Blueprint, Flask, jsonify, url_for, abort

# 1) API versioning — register the same blueprint set under /v1, /v2 prefixes
def make_users_bp(version: str) -> Blueprint:
    bp = Blueprint(f"users_{version}", __name__, url_prefix=f"/{version}/users")

    @bp.get("/<int:user_id>")
    def get_user(user_id):
        if user_id <= 0: abort(404)
        # url_for is namespaced: "users_v1.get_user" or "users_v2.get_user"
        return jsonify(id=user_id, self=url_for(f"users_{version}.get_user", user_id=user_id))

    @bp.errorhandler(404)                          # only 404s within THIS blueprint
    def user_not_found(e):
        return jsonify(error="user_not_found"), 404

    return bp

# 2) Cross-blueprint reverse URLs always use the "blueprint.view" form
#    url_for("posts.list_posts") — never just "list_posts"

# 3) Per-blueprint hooks — auth on /admin without affecting public routes
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.before_request
def require_admin():
    if not is_admin_user():
        abort(403)

def create_app():
    app = Flask(__name__)
    app.register_blueprint(make_users_bp("v1"))
    app.register_blueprint(make_users_bp("v2"))
    app.register_blueprint(admin_bp)
    return app

# Decision rule:
#   < 5 routes total                   -> skip blueprints, keep it flat
#   feature-grouped routes              -> one blueprint per feature module
#   API versioning                       -> blueprint factory, prefix per version
#   shared auth on a path tree           -> blueprint + before_request
#
# Anti-pattern: importing the app inside blueprint modules
#   Creates circular imports the moment you split files. Keep blueprint modules
#   pure (Blueprint + routes only) and register them inside create_app().

def is_admin_user(): return False
```

## Decision Rule

```text
< 5 routes total                   -> skip blueprints, keep it flat
feature-grouped routes              -> one blueprint per feature module
API versioning                       -> blueprint factory, prefix per version
shared auth on a path tree           -> blueprint + before_request
```

## Anti-Pattern

> [!warning] Anti-pattern
> importing the app inside blueprint modules
>   Creates circular imports the moment you split files. Keep blueprint modules
>   pure (Blueprint + routes only) and register them inside create_app().

## Tips

- Use `url_prefix` to avoid repeating path prefixes in every route.
- Store Blueprints in separate modules (e.g., `routes/users.py`) for clean organization.
- Register blueprints before running the app.

## Common Mistake

> [!warning] Defining all routes in a single file as the app grows—use Blueprints to scale.

## Shorthand (Junior → Senior)

**Junior:**
```python
# routes/users.py
from flask import Blueprint
users = Blueprint("users", __name__)

@users.route("/list")
def list_users():
    return {"users": []}

# main.py
from flask import Flask
from routes.users import users
app = Flask(__name__)
app.register_blueprint(users, url_prefix="/api/users")
```

**Senior:**
```python
users = Blueprint("users", __name__, url_prefix="/api/users")
@users.route("/")
def list_users(): return {"users": []}

app.register_blueprint(users)
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-jinja2|render_template() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-app"
title: "Flask()"
category: "Flask"
subtitle: "App factory, routes, and development server"
signature_short: "app = Flask(__name__)  |  @app.route(\"/path\")  |  app.run()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Flask()"
  - "flask-app"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# Flask()

> App factory, routes, and development server

## Overview

Flask is a lightweight micro-framework for building web applications. The Flask class serves as the central application object, handling routes, configuration, and request/response cycles. Use the `@app.route()` decorator to bind URL paths to view functions.

## Signature

```python
app = Flask(__name__)  |  @app.route("/path")  |  app.run()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Module-level Flask app with one route, dev server
# STRENGTHS - The "Hello world" everyone copies — works in 5 lines
# WEAKNESSES- No config, no factory, no production server
#
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello, World!"

if __name__ == "__main__":
    app.run(debug=True)        # dev server only — never run this in prod
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multi-route app with config, JSON responses, environment-based debug
# STRENGTHS - The shape a real small app takes before it grows blueprints
# WEAKNESSES- Still module-global app — no factory, no testing seam
#
import os
from flask import Flask, jsonify

app = Flask(__name__)
app.config.update(
    DEBUG=os.getenv("FLASK_ENV") == "development",
    JSON_SORT_KEYS=False,
)

@app.route("/")
def index():
    return jsonify(message="Hello, World!")

@app.route("/health")
def health():
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - App factory pattern with config classes, ready for tests + Gunicorn
# STRENGTHS - Test isolation, multi-env config, clean blueprint registration seam
# WEAKNESSES- More files; overkill for a 1-route prototype
#
# config.py
class Config:
    JSON_SORT_KEYS = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
class DevConfig(Config):    DEBUG = True
class ProdConfig(Config):   DEBUG = False
class TestConfig(Config):   TESTING = True

# app/__init__.py
from flask import Flask

def create_app(config_object="config.ProdConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Register blueprints (defined in app/users.py, app/posts.py, ...)
    from .users import users_bp
    app.register_blueprint(users_bp, url_prefix="/users")

    # Health endpoint pinned to the factory
    @app.get("/health")
    def health():
        return {"status": "ok"}, 200

    return app

# wsgi.py — what Gunicorn imports in production
# from app import create_app
# app = create_app("config.ProdConfig")
#   $ gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# Decision rule:
#   < 50 LOC, single file demo         -> module-level Flask(__name__)
#   real app, even if small            -> create_app() factory
#   tests need isolated config         -> factory takes config_object
#   plugins (SQLAlchemy, Login, ...)   -> instantiate at module scope, init_app() in factory
#
# Anti-pattern: app.run(debug=True) in production
#   Werkzeug's dev server is single-threaded and ships an interactive debugger
#   over the network. Always wrap with Gunicorn / uwsgi behind a reverse proxy.
```

## Decision Rule

```text
< 50 LOC, single file demo         -> module-level Flask(__name__)
real app, even if small            -> create_app() factory
tests need isolated config         -> factory takes config_object
plugins (SQLAlchemy, Login, ...)   -> instantiate at module scope, init_app() in factory
```

## Anti-Pattern

> [!warning] Anti-pattern
> app.run(debug=True) in production
>   Werkzeug's dev server is single-threaded and ships an interactive debugger
>   over the network. Always wrap with Gunicorn / uwsgi behind a reverse proxy.

## Tips

- Use `debug=True` only in development; it auto-reloads on code changes.
- `__name__` parameter allows Flask to find templates and static files relative to the module.
- Specify `host="0.0.0.0"` to accept external connections; default is localhost only.

## Common Mistake

> [!warning] Running `app.run(debug=True)` in production—use Gunicorn or Waitress instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    response = "Hello"
    status_code = 200
    return response, status_code

app.run(debug=True)
```

**Senior:**
```python
from flask import Flask
app = Flask(__name__)
app.route("/")(lambda: "Hello")
app.run(debug=True)
```

## See Also

- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-jinja2|render_template() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

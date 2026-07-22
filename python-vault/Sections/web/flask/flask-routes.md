---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-routes"
title: "@app.route()"
category: "Flask"
subtitle: "URL patterns, dynamic segments, HTTP verbs"
signature_short: "@app.route(\"/path/<type:param>\", methods=[\"GET\", \"POST\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@app.route()"
  - "flask-routes"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# @app.route()

> URL patterns, dynamic segments, HTTP verbs

## Overview

Flask routes map URL patterns to view functions. Use angle brackets `<param>` for dynamic segments, type converters like `<int:id>` for validation, and `methods=` to handle specific HTTP verbs. Query strings are accessed via `request.args`.

## Signature

```python
@app.route("/path/<type:param>", methods=["GET", "POST"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One static route, one dynamic route with a typed segment
# STRENGTHS - Clearest demo of <int:user_id> auto-coercion
# WEAKNESSES- No methods, no query params, no response shaping
#
from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    return "Home"

@app.route("/users/<int:user_id>")          # user_id arrives as int, not str
def get_user(user_id):
    return f"User {user_id}"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Type converters, query strings, and method-specific routes
# STRENGTHS - The 80% case: GET with params, POST with body, typed args
# WEAKNESSES- No url_for, no per-method decorators (@app.get/@app.post)
#
from flask import Flask, request, jsonify
app = Flask(__name__)

# Type converters: int / float / path / uuid
@app.route("/users/<int:user_id>")
def get_user(user_id):                          # int already
    return jsonify(id=user_id)

@app.route("/files/<path:filepath>")            # 'path:' allows slashes
def get_file(filepath):
    return jsonify(path=filepath)

# Query string with safe defaults and type coercion
@app.route("/search")
def search():
    q     = request.args.get("q", "", type=str)
    limit = request.args.get("limit", 10, type=int)     # never crash on bad input
    return jsonify(q=q, limit=limit)

# Method-specific routing
@app.route("/items", methods=["GET", "POST"])
def items():
    if request.method == "POST":
        return jsonify(created=request.json), 201
    return jsonify(items=[])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Modern @app.get/@app.post, custom converters, url_for, error handling
# STRENGTHS - Verb-specific decorators, reverse-routing, validated path segments
# WEAKNESSES- N/A
#
from flask import Flask, request, jsonify, url_for, abort
from werkzeug.routing import BaseConverter
app = Flask(__name__)

# 1) Verb-specific decorators (Flask 2.x). Cleaner than methods=[...]
@app.get("/users/<int:user_id>")
def get_user(user_id):
    if user_id <= 0:
        abort(404)                              # raises HTTPException, never returns
    return jsonify(id=user_id, url=url_for("get_user", user_id=user_id))

@app.post("/users")
def create_user():
    payload = request.get_json(silent=True) or {}
    return jsonify(created=payload), 201

# 2) Custom URL converter — validate segments at routing time, not in the view
class SlugConverter(BaseConverter):
    regex = r"[a-z0-9-]{3,64}"                  # only valid slugs ever match the route
app.url_map.converters["slug"] = SlugConverter

@app.get("/posts/<slug:slug>")
def get_post(slug):
    return jsonify(slug=slug)

# 3) Trailing slash discipline: define one canonical form per route.
#    /users/  -> /users/<id>  AND  /users -> 308 redirect to /users/  (Flask default)
#    For APIs, standardize on NO trailing slash and set strict_slashes=False.

# Decision rule:
#   simple GET + POST                  -> @app.get / @app.post (verb decorators)
#   shared logic across verbs           -> single @app.route with methods=[...]
#   path needs validation                -> custom converter (regex), not in-view checks
#   need to build URLs back              -> url_for("view_name", **kwargs) — never f-strings
#
# Anti-pattern: hand-coding URLs in templates / responses
#   "/users/" + str(uid) breaks the moment you mount the app under a prefix or
#   move a route. Always url_for(); it respects blueprints and reverse-routing.
```

## Decision Rule

```text
simple GET + POST                  -> @app.get / @app.post (verb decorators)
shared logic across verbs           -> single @app.route with methods=[...]
path needs validation                -> custom converter (regex), not in-view checks
need to build URLs back              -> url_for("view_name", **kwargs) — never f-strings
```

## Anti-Pattern

> [!warning] Anti-pattern
> hand-coding URLs in templates / responses
>   "/users/" + str(uid) breaks the moment you mount the app under a prefix or
>   move a route. Always url_for(); it respects blueprints and reverse-routing.

## Tips

- Type converters: `<int:id>`, `<float:price>`, `<path:filepath>` automatically cast and validate.
- Query strings: `request.args.get("key", default_value, type=int)` is safe and type-aware.
- Use `methods=["GET", "POST"]` to handle multiple HTTP verbs in one function.

## Common Mistake

> [!warning] Forgetting to include `methods=["POST"]` and receiving 405 Method Not Allowed.

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.route("/users/<user_id>")
def user_detail(user_id):
    user_id_int = int(user_id)
    user = get_user_from_db(user_id_int)
    return str(user)
```

**Senior:**
```python
@app.route("/users/<int:user_id>")
def user_detail(user_id):
    return get_user_from_db(user_id)
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-jinja2|render_template() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

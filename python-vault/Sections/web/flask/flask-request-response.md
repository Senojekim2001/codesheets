---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-request-response"
title: "request, jsonify()"
category: "Flask"
subtitle: "JSON payloads, form data, response objects"
signature_short: "request.json  |  request.form  |  jsonify(data)  |  make_response()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "request, jsonify()"
  - "flask-request-response"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# request, jsonify()

> JSON payloads, form data, response objects

## Overview

The `request` object provides access to incoming request data. Use `request.json` for JSON payloads, `request.form` for form-encoded data, and `request.files` for uploads. The `jsonify()` helper builds JSON responses with correct Content-Type. Return tuples `(data, status_code, headers)` for custom responses.

## Signature

```python
request.json  |  request.form  |  jsonify(data)  |  make_response()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Read JSON body, return JSON body
# STRENGTHS - Smallest valid POST handler with jsonify
# WEAKNESSES- No validation, no error path, no status codes beyond default
#
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.post("/api/echo")
def echo():
    data = request.json                  # {} if Content-Type is application/json
    return jsonify(received=data)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - JSON, form, and file payloads — three input shapes you'll meet
# STRENGTHS - Covers the body types Flask actually parses differently
# WEAKNESSES- No schema validation library; manual checks
#
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.post("/api/users")                          # JSON body
def create_user():
    data = request.get_json(silent=True) or {}
    if not data.get("email"):
        return jsonify(error="email required"), 400
    return jsonify(id=1, **data), 201

@app.post("/api/login")                          # HTML form (urlencoded / multipart)
def login():
    user = request.form.get("username")
    pw   = request.form.get("password")
    return jsonify(authenticated=bool(user and pw))

@app.post("/api/upload")                         # multipart file upload
def upload():
    f = request.files.get("file")
    if not f:
        return jsonify(error="no file"), 400
    return jsonify(filename=f.filename, size=len(f.read())), 201
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Schema validation, error contracts, content-type guards, streaming responses
# STRENGTHS - The hardening that keeps a JSON API safe in production
# WEAKNESSES- N/A
#
from flask import Flask, request, jsonify, Response, abort, stream_with_context
from pydantic import BaseModel, EmailStr, ValidationError
import json

app = Flask(__name__)

# 1) Schema validation — never trust request.json shape
class UserIn(BaseModel):
    email: EmailStr
    name: str
    age: int | None = None

@app.post("/api/users")
def create_user():
    if not request.is_json:                       # don't try to parse form data as JSON
        abort(415, description="application/json required")
    try:
        payload = UserIn.model_validate(request.get_json())
    except ValidationError as e:
        return jsonify(error="validation_failed", details=e.errors()), 422
    # ... persist payload.model_dump() ...
    return jsonify(id=1, **payload.model_dump()), 201

# 2) Stable error contract — every error has the same shape
@app.errorhandler(404)
def not_found(e):
    return jsonify(error="not_found", message=str(e.description)), 404

@app.errorhandler(415)
def unsupported(e):
    return jsonify(error="unsupported_media_type", message=str(e.description)), 415

# 3) Streaming for large responses — don't materialize the whole list in memory
@app.get("/api/export")
def export():
    def rows():
        yield "["
        for i, item in enumerate(query_all_rows()):    # generator from your DB
            if i: yield ","
            yield json.dumps(item)
        yield "]"
    return Response(stream_with_context(rows()),
                    mimetype="application/json")

# Decision rule:
#   small public API                    -> pydantic / marshmallow validation, every endpoint
#   internal service, trusted callers   -> manual .get() with type coercion is acceptable
#   binary uploads > 10 MB              -> stream from request.stream, never .read() all
#   responses > 10 MB                   -> Response(generator, ...) + stream_with_context
#
# Anti-pattern: returning {"error": e.errors()} with 200 OK
#   Clients can't tell success from failure. Always pair an error body with the
#   correct 4xx / 5xx status code, and keep the JSON shape stable across endpoints.

def query_all_rows():
    return iter([])
```

## Decision Rule

```text
small public API                    -> pydantic / marshmallow validation, every endpoint
internal service, trusted callers   -> manual .get() with type coercion is acceptable
binary uploads > 10 MB              -> stream from request.stream, never .read() all
responses > 10 MB                   -> Response(generator, ...) + stream_with_context
```

## Anti-Pattern

> [!warning] Anti-pattern
> returning {"error": e.errors()} with 200 OK
>   Clients can't tell success from failure. Always pair an error body with the
>   correct 4xx / 5xx status code, and keep the JSON shape stable across endpoints.

## Tips

- `request.json` is None if Content-Type is not `application/json`; use `request.get_json(force=True)` to override.
- `jsonify()` automatically sets `Content-Type: application/json` and handles serialization.
- Always check if request data exists before accessing; use `.get()` with defaults.

## Common Mistake

> [!warning] Returning a dict directly without `jsonify()` when API clients expect proper JSON headers.

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.route("/users", methods=["POST"])
def create_user():
    payload = request.json
    user_name = payload["name"]
    user_email = payload["email"]
    new_user = db.insert(user_name, user_email)
    response = {"id": new_user.id, "name": new_user.name}
    response_obj = jsonify(response)
    response_obj.status_code = 201
    return response_obj
```

**Senior:**
```python
@app.route("/users", methods=["POST"])
def create_user():
    user = db.insert(**request.json)
    return jsonify(user.to_dict()), 201
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-jinja2|render_template() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

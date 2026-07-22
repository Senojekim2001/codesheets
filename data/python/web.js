export const meta = {
  "id": "web",
  "label": "Web (Flask, Django)",
  "title": "Python Web Frameworks",
  "icon": "🐍",
  "description": "Flask, FastAPI, Django, and deployment patterns for web applications.",
  "tags": [
    "python",
    "web",
    "frameworks",
    "apis",
    "deployment"
  ]
}

export const sections = [

  // ── Section 1: Flask ─────────────────────────────────────────
  {
    id: "flask",
    title: "Flask",
    entries: [
      {
        id: "flask-app",
        fn: "Flask()",
        desc: "Create and configure a Flask application with basic routing and development server.",
        category: "Flask",
        subtitle: "App factory, routes, and development server",
        signature: "app = Flask(__name__)  |  @app.route(\"/path\")  |  app.run()",
        descLong: "Flask is a lightweight micro-framework for building web applications. The Flask class serves as the central application object, handling routes, configuration, and request/response cycles. Use the `@app.route()` decorator to bind URL paths to view functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Flask() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask\napp = Flask(__name__)\n@app.route(\"/\")\ndef index():\n    return \"Hello, World!\"\nif __name__ == \"__main__\":\n    app.run(debug=True)        # dev server only — never run this in prod"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Flask() — common patterns you'll see in production.\n# APPROACH  - Combine Flask() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport os\nfrom flask import Flask, jsonify\napp = Flask(__name__)\napp.config.update(\n    DEBUG=os.getenv(\"FLASK_ENV\") == \"development\",\n    JSON_SORT_KEYS=False,\n)\n@app.route(\"/\")\ndef index():\n    return jsonify(message=\"Hello, World!\")\n@app.route(\"/health\")\ndef health():\n    return jsonify(status=\"ok\"), 200\nif __name__ == \"__main__\":\n    app.run(host=\"0.0.0.0\", port=int(os.getenv(\"PORT\", 5000)))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Flask() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# config.py\nclass Config:\n    JSON_SORT_KEYS = False\n    SQLALCHEMY_TRACK_MODIFICATIONS = False\nclass DevConfig(Config):    DEBUG = True\nclass ProdConfig(Config):   DEBUG = False\nclass TestConfig(Config):   TESTING = True\n# app/__init__.py\nfrom flask import Flask\ndef create_app(config_object=\"config.ProdConfig\"):\n    app = Flask(__name__)\n    app.config.from_object(config_object)\n    # Register blueprints (defined in app/users.py, app/posts.py, ...)\n    from .users import users_bp\n    app.register_blueprint(users_bp, url_prefix=\"/users\")\n    # Health endpoint pinned to the factory\n    @app.get(\"/health\")\n    def health():\n        return {\"status\": \"ok\"}, 200\n    return app\n# wsgi.py — what Gunicorn imports in production\n# from app import create_app\n# app = create_app(\"config.ProdConfig\")\n#   $ gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app\n# Decision rule:\n#   < 50 LOC, single file demo         -> module-level Flask(__name__)\n#   real app, even if small            -> create_app() factory\n#   tests need isolated config         -> factory takes config_object\n#   plugins (SQLAlchemy, Login, ...)   -> instantiate at module scope, init_app() in factory\n#\n# Anti-pattern: app.run(debug=True) in production\n#   Werkzeug's dev server is single-threaded and ships an interactive debugger\n#   over the network. Always wrap with Gunicorn / uwsgi behind a reverse proxy."
                  }
        ],
        tips: [
                  "Use `debug=True` only in development; it auto-reloads on code changes.",
                  "`__name__` parameter allows Flask to find templates and static files relative to the module.",
                  "Specify `host=\"0.0.0.0\"` to accept external connections; default is localhost only."
        ],
        mistake: "Running `app.run(debug=True)` in production—use Gunicorn or Waitress instead.",
        shorthand: {
          verbose: "from flask import Flask\n\napp = Flask(__name__)\n\n@app.route(\"/\")\ndef home():\n    response = \"Hello\"\n    status_code = 200\n    return response, status_code\n\napp.run(debug=True)",
          concise: "from flask import Flask\napp = Flask(__name__)\napp.route(\"/\")(lambda: \"Hello\")\napp.run(debug=True)",
        },
      },
      {
        id: "flask-routes",
        fn: "@app.route()",
        desc: "Define URL routes with path parameters, query strings, and HTTP methods.",
        category: "Flask",
        subtitle: "URL patterns, dynamic segments, HTTP verbs",
        signature: "@app.route(\"/path/<type:param>\", methods=[\"GET\", \"POST\"])",
        descLong: "Flask routes map URL patterns to view functions. Use angle brackets `<param>` for dynamic segments, type converters like `<int:id>` for validation, and `methods=` to handle specific HTTP verbs. Query strings are accessed via `request.args`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @app.route() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask\napp = Flask(__name__)\n@app.route(\"/\")\ndef index():\n    return \"Home\"\n@app.route(\"/users/<int:user_id>\")          # user_id arrives as int, not str\ndef get_user(user_id):\n    return f\"User {user_id}\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @app.route() — common patterns you'll see in production.\n# APPROACH  - Combine @app.route() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\n# Type converters: int / float / path / uuid\n@app.route(\"/users/<int:user_id>\")\ndef get_user(user_id):                          # int already\n    return jsonify(id=user_id)\n@app.route(\"/files/<path:filepath>\")            # 'path:' allows slashes\ndef get_file(filepath):\n    return jsonify(path=filepath)\n# Query string with safe defaults and type coercion\n@app.route(\"/search\")\ndef search():\n    q     = request.args.get(\"q\", \"\", type=str)\n    limit = request.args.get(\"limit\", 10, type=int)     # never crash on bad input\n    return jsonify(q=q, limit=limit)\n# Method-specific routing\n@app.route(\"/items\", methods=[\"GET\", \"POST\"])\ndef items():\n    if request.method == \"POST\":\n        return jsonify(created=request.json), 201\n    return jsonify(items=[])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @app.route() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom flask import Flask, request, jsonify, url_for, abort\nfrom werkzeug.routing import BaseConverter\napp = Flask(__name__)\n# 1) Verb-specific decorators (Flask 2.x). Cleaner than methods=[...]\n@app.get(\"/users/<int:user_id>\")\ndef get_user(user_id):\n    if user_id <= 0:\n        abort(404)                              # raises HTTPException, never returns\n    return jsonify(id=user_id, url=url_for(\"get_user\", user_id=user_id))\n@app.post(\"/users\")\ndef create_user():\n    payload = request.get_json(silent=True) or {}\n    return jsonify(created=payload), 201\n# 2) Custom URL converter — validate segments at routing time, not in the view\nclass SlugConverter(BaseConverter):\n    regex = r\"[a-z0-9-]{3,64}\"                  # only valid slugs ever match the route\napp.url_map.converters[\"slug\"] = SlugConverter\n@app.get(\"/posts/<slug:slug>\")\ndef get_post(slug):\n    return jsonify(slug=slug)\n# 3) Trailing slash discipline: define one canonical form per route.\n#    /users/  -> /users/<id>  AND  /users -> 308 redirect to /users/  (Flask default)\n#    For APIs, standardize on NO trailing slash and set strict_slashes=False.\n# Decision rule:\n#   simple GET + POST                  -> @app.get / @app.post (verb decorators)\n#   shared logic across verbs           -> single @app.route with methods=[...]\n#   path needs validation                -> custom converter (regex), not in-view checks\n#   need to build URLs back              -> url_for(\"view_name\", **kwargs) — never f-strings\n#\n# Anti-pattern: hand-coding URLs in templates / responses\n#   \"/users/\" + str(uid) breaks the moment you mount the app under a prefix or\n#   move a route. Always url_for(); it respects blueprints and reverse-routing."
                  }
        ],
        tips: [
                  "Type converters: `<int:id>`, `<float:price>`, `<path:filepath>` automatically cast and validate.",
                  "Query strings: `request.args.get(\"key\", default_value, type=int)` is safe and type-aware.",
                  "Use `methods=[\"GET\", \"POST\"]` to handle multiple HTTP verbs in one function."
        ],
        mistake: "Forgetting to include `methods=[\"POST\"]` and receiving 405 Method Not Allowed.",
        shorthand: {
          verbose: "@app.route(\"/users/<user_id>\")\ndef user_detail(user_id):\n    user_id_int = int(user_id)\n    user = get_user_from_db(user_id_int)\n    return str(user)",
          concise: "@app.route(\"/users/<int:user_id>\")\ndef user_detail(user_id):\n    return get_user_from_db(user_id)",
        },
      },
      {
        id: "flask-request-response",
        fn: "request, jsonify()",
        desc: "Access request data (JSON, form) and build responses with proper headers and status codes.",
        category: "Flask",
        subtitle: "JSON payloads, form data, response objects",
        signature: "request.json  |  request.form  |  jsonify(data)  |  make_response()",
        descLong: "The `request` object provides access to incoming request data. Use `request.json` for JSON payloads, `request.form` for form-encoded data, and `request.files` for uploads. The `jsonify()` helper builds JSON responses with correct Content-Type. Return tuples `(data, status_code, headers)` for custom responses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of request, jsonify() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\n@app.post(\"/api/echo\")\ndef echo():\n    data = request.json                  # {} if Content-Type is application/json\n    return jsonify(received=data)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of request, jsonify() — common patterns you'll see in production.\n# APPROACH  - Combine request, jsonify() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\n@app.post(\"/api/users\")                          # JSON body\ndef create_user():\n    data = request.get_json(silent=True) or {}\n    if not data.get(\"email\"):\n        return jsonify(error=\"email required\"), 400\n    return jsonify(id=1, **data), 201\n@app.post(\"/api/login\")                          # HTML form (urlencoded / multipart)\ndef login():\n    user = request.form.get(\"username\")\n    pw   = request.form.get(\"password\")\n    return jsonify(authenticated=bool(user and pw))\n@app.post(\"/api/upload\")                         # multipart file upload\ndef upload():\n    f = request.files.get(\"file\")\n    if not f:\n        return jsonify(error=\"no file\"), 400\n    return jsonify(filename=f.filename, size=len(f.read())), 201"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of request, jsonify() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom flask import Flask, request, jsonify, Response, abort, stream_with_context\nfrom pydantic import BaseModel, EmailStr, ValidationError\nimport json\napp = Flask(__name__)\n# 1) Schema validation — never trust request.json shape\nclass UserIn(BaseModel):\n    email: EmailStr\n    name: str\n    age: int | None = None\n@app.post(\"/api/users\")\ndef create_user():\n    if not request.is_json:                       # don't try to parse form data as JSON\n        abort(415, description=\"application/json required\")\n    try:\n        payload = UserIn.model_validate(request.get_json())\n    except ValidationError as e:\n        return jsonify(error=\"validation_failed\", details=e.errors()), 422\n    # ... persist payload.model_dump() ...\n    return jsonify(id=1, **payload.model_dump()), 201\n# 2) Stable error contract — every error has the same shape\n@app.errorhandler(404)\ndef not_found(e):\n    return jsonify(error=\"not_found\", message=str(e.description)), 404\n@app.errorhandler(415)\ndef unsupported(e):\n    return jsonify(error=\"unsupported_media_type\", message=str(e.description)), 415\n# 3) Streaming for large responses — don't materialize the whole list in memory\n@app.get(\"/api/export\")\ndef export():\n    def rows():\n        yield \"[\"\n        for i, item in enumerate(query_all_rows()):    # generator from your DB\n            if i: yield \",\"\n            yield json.dumps(item)\n        yield \"]\"\n    return Response(stream_with_context(rows()),\n                    mimetype=\"application/json\")\n# Decision rule:\n#   small public API                    -> pydantic / marshmallow validation, every endpoint\n#   internal service, trusted callers   -> manual .get() with type coercion is acceptable\n#   binary uploads > 10 MB              -> stream from request.stream, never .read() all\n#   responses > 10 MB                   -> Response(generator, ...) + stream_with_context\n#\n# Anti-pattern: returning {\"error\": e.errors()} with 200 OK\n#   Clients can't tell success from failure. Always pair an error body with the\n#   correct 4xx / 5xx status code, and keep the JSON shape stable across endpoints.\ndef query_all_rows():\n    return iter([])"
                  }
        ],
        tips: [
                  "`request.json` is None if Content-Type is not `application/json`; use `request.get_json(force=True)` to override.",
                  "`jsonify()` automatically sets `Content-Type: application/json` and handles serialization.",
                  "Always check if request data exists before accessing; use `.get()` with defaults."
        ],
        mistake: "Returning a dict directly without `jsonify()` when API clients expect proper JSON headers.",
        shorthand: {
          verbose: "@app.route(\"/users\", methods=[\"POST\"])\ndef create_user():\n    payload = request.json\n    user_name = payload[\"name\"]\n    user_email = payload[\"email\"]\n    new_user = db.insert(user_name, user_email)\n    response = {\"id\": new_user.id, \"name\": new_user.name}\n    response_obj = jsonify(response)\n    response_obj.status_code = 201\n    return response_obj",
          concise: "@app.route(\"/users\", methods=[\"POST\"])\ndef create_user():\n    user = db.insert(**request.json)\n    return jsonify(user.to_dict()), 201",
        },
      },
      {
        id: "flask-blueprints",
        fn: "Blueprint()",
        desc: "Organize routes into reusable modules with Blueprints for larger applications.",
        category: "Flask",
        subtitle: "Modular app structure, route grouping",
        signature: "bp = Blueprint(\"name\", __name__, url_prefix=\"/api\")  |  app.register_blueprint(bp)",
        descLong: "Blueprints allow you to organize related routes into separate modules. Define routes on a Blueprint object, then register it with the main app. Use `url_prefix` to group routes under a common path (e.g., `/api/users`).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Blueprint() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask, Blueprint, jsonify\nusers_bp = Blueprint(\"users\", __name__, url_prefix=\"/users\")\n@users_bp.get(\"/\")\ndef list_users():\n    return jsonify([{\"id\": 1, \"name\": \"Alice\"}])\napp = Flask(__name__)\napp.register_blueprint(users_bp)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Blueprint() — common patterns you'll see in production.\n# APPROACH  - Combine Blueprint() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# app/users.py\nfrom flask import Blueprint, jsonify\nusers_bp = Blueprint(\"users\", __name__, url_prefix=\"/users\")\n@users_bp.get(\"/\")\ndef list_users():\n    return jsonify([{\"id\": 1, \"name\": \"Alice\"}])\n@users_bp.get(\"/<int:user_id>\")\ndef get_user(user_id):\n    return jsonify(id=user_id, name=\"Alice\")\n# app/posts.py\nposts_bp = Blueprint(\"posts\", __name__, url_prefix=\"/posts\")\n@posts_bp.get(\"/\")\ndef list_posts():\n    return jsonify([{\"id\": 1, \"title\": \"First\"}])\n# app/__init__.py\nfrom flask import Flask\ndef create_app():\n    app = Flask(__name__)\n    app.register_blueprint(users_bp)\n    app.register_blueprint(posts_bp)\n    return app"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Blueprint() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom flask import Blueprint, Flask, jsonify, url_for, abort\n# 1) API versioning — register the same blueprint set under /v1, /v2 prefixes\ndef make_users_bp(version: str) -> Blueprint:\n    bp = Blueprint(f\"users_{version}\", __name__, url_prefix=f\"/{version}/users\")\n    @bp.get(\"/<int:user_id>\")\n    def get_user(user_id):\n        if user_id <= 0: abort(404)\n        # url_for is namespaced: \"users_v1.get_user\" or \"users_v2.get_user\"\n        return jsonify(id=user_id, self=url_for(f\"users_{version}.get_user\", user_id=user_id))\n    @bp.errorhandler(404)                          # only 404s within THIS blueprint\n    def user_not_found(e):\n        return jsonify(error=\"user_not_found\"), 404\n    return bp\n# 2) Cross-blueprint reverse URLs always use the \"blueprint.view\" form\n#    url_for(\"posts.list_posts\") — never just \"list_posts\"\n# 3) Per-blueprint hooks — auth on /admin without affecting public routes\nadmin_bp = Blueprint(\"admin\", __name__, url_prefix=\"/admin\")\n@admin_bp.before_request\ndef require_admin():\n    if not is_admin_user():\n        abort(403)\ndef create_app():\n    app = Flask(__name__)\n    app.register_blueprint(make_users_bp(\"v1\"))\n    app.register_blueprint(make_users_bp(\"v2\"))\n    app.register_blueprint(admin_bp)\n    return app\n# Decision rule:\n#   < 5 routes total                   -> skip blueprints, keep it flat\n#   feature-grouped routes              -> one blueprint per feature module\n#   API versioning                       -> blueprint factory, prefix per version\n#   shared auth on a path tree           -> blueprint + before_request\n#\n# Anti-pattern: importing the app inside blueprint modules\n#   Creates circular imports the moment you split files. Keep blueprint modules\n#   pure (Blueprint + routes only) and register them inside create_app().\ndef is_admin_user(): return False"
                  }
        ],
        tips: [
                  "Use `url_prefix` to avoid repeating path prefixes in every route.",
                  "Store Blueprints in separate modules (e.g., `routes/users.py`) for clean organization.",
                  "Register blueprints before running the app."
        ],
        mistake: "Defining all routes in a single file as the app grows—use Blueprints to scale.",
        shorthand: {
          verbose: "# routes/users.py\nfrom flask import Blueprint\nusers = Blueprint(\"users\", __name__)\n\n@users.route(\"/list\")\ndef list_users():\n    return {\"users\": []}\n\n# main.py\nfrom flask import Flask\nfrom routes.users import users\napp = Flask(__name__)\napp.register_blueprint(users, url_prefix=\"/api/users\")",
          concise: "users = Blueprint(\"users\", __name__, url_prefix=\"/api/users\")\n@users.route(\"/\")\ndef list_users(): return {\"users\": []}\n\napp.register_blueprint(users)",
        },
      },
      {
        id: "flask-jinja2",
        fn: "render_template()",
        desc: "Render HTML templates with Jinja2 templating engine and template variables.",
        category: "Flask",
        subtitle: "Template rendering, variables, loops, conditionals",
        signature: "render_template(\"template.html\", var=value)  |  {{ var }}  |  {% for item in items %}",
        descLong: "Flask integrates Jinja2 for server-side HTML rendering. Use `render_template()` to load and populate templates with variables. Templates are stored in a `templates/` directory and support variables, loops, conditionals, filters, and inheritance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of render_template() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask, render_template\napp = Flask(__name__)\n@app.route(\"/\")\ndef index():\n    return render_template(\"index.html\", title=\"Home\", user=\"Alice\")\n# templates/index.html\n# <h1>{{ title }}</h1>\n# <p>Welcome, {{ user }}!</p>"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of render_template() — common patterns you'll see in production.\n# APPROACH  - Combine render_template() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# templates/base.html\n# <!doctype html>\n# <html><head><title>{% block title %}Site{% endblock %}</title></head>\n# <body>{% block content %}{% endblock %}</body></html>\n# templates/users.html\n# {% extends \"base.html\" %}\n# {% block title %}Users{% endblock %}\n# {% block content %}\n#   <ul>\n#   {% for u in users %}\n#     <li>{{ u.name | upper }} ({{ u.email }})</li>     {# filter chain #}\n#   {% else %}\n#     <li>No users yet</li>                              {# for-else: empty case #}\n#   {% endfor %}\n#   </ul>\n#   {% if current_user %}\n#     <p>Hi, {{ current_user }}.</p>\n#   {% endif %}\n# {% endblock %}\nfrom flask import Flask, render_template\napp = Flask(__name__)\n@app.route(\"/users\")\ndef users():\n    return render_template(\n        \"users.html\",\n        users=[{\"name\": \"Alice\", \"email\": \"a@x.com\"},\n               {\"name\": \"Bob\",   \"email\": \"b@x.com\"}],\n        current_user=\"Mike\",\n    )"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of render_template() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom flask import Flask, render_template, render_template_string, abort\nfrom markupsafe import Markup, escape\napp = Flask(__name__)\n# 1) Autoescape is ON for .html / .htm / .xml templates BY DEFAULT.\n#    {{ user_input }} is safe; html.unsafe stays escaped.\n#    Use Markup(\"...\") only when you've sanitized the string yourself.\n@app.template_filter(\"safe_link\")\ndef safe_link(url, label):                       # custom filter usable in templates\n    return Markup(f'<a href=\"{escape(url)}\">{escape(label)}</a>')\n# 2) NEVER call render_template_string with user input as the template body\n@app.get(\"/render-bad/<text>\")\ndef bad(text):\n    # SECURITY: Server-Side Template Injection — attacker controls Jinja syntax.\n    return render_template_string(f\"<p>{text}</p>\")     # DO NOT DO THIS\n@app.get(\"/render-good/<text>\")\ndef good(text):\n    # Treat user input as DATA, not template. Pass via context.\n    return render_template_string(\"<p>{{ msg }}</p>\", msg=text)\n# 3) Context processors — inject variables into EVERY template (e.g., current user)\n@app.context_processor\ndef inject_globals():\n    return {\"site_name\": \"Acme\", \"current_user\": getattr_user_from_request()}\n# 4) 404 friendly page; reuse the base layout\n@app.errorhandler(404)\ndef not_found(e):\n    return render_template(\"404.html\"), 404\n# Decision rule:\n#   server-rendered pages              -> render_template (autoescape on by default)\n#   tiny inline snippet                 -> render_template_string with CONTEXT vars\n#   JSON API only                        -> skip Jinja entirely; jsonify(...)\n#   marketing site / docs                -> static site generator, not Flask\n#   reusable HTML fragments              -> {% include %} or {% macro %} in Jinja\n#\n# Anti-pattern: turning off autoescape \"to make my HTML render\"\n#   Means you stopped escaping ALL user input. The fix is to wrap the trusted\n#   string with Markup(...) on the way in, never to disable autoescape globally.\ndef getattr_user_from_request(): return None"
                  }
        ],
        tips: [
                  "Jinja2 variables: `{{ variable }}` for output, `{{ variable | upper }}` for filters.",
                  "Control structures: `{% if condition %}...{% endif %}`, `{% for item in items %}...{% endfor %}`.",
                  "Template inheritance: `{% extends \"base.html\" %}` for DRY layouts."
        ],
        mistake: "Forgetting to create a `templates/` folder in the app directory.",
        shorthand: {
          verbose: "@app.route(\"/profile/<name>\")\ndef profile(name):\n    user_data = {\"name\": name, \"joined\": \"2023\"}\n    html = render_template(\"profile.html\")\n    html = html.replace(\"{{ name }}\", user_data[\"name\"])\n    html = html.replace(\"{{ joined }}\", user_data[\"joined\"])\n    return html",
          concise: "@app.route(\"/profile/<name>\")\ndef profile(name):\n    return render_template(\"profile.html\", name=name, joined=\"2023\")",
        },
      },
      {
        id: "flask-sqlalchemy",
        fn: "SQLAlchemy()",
        desc: "Use Flask-SQLAlchemy for ORM-based database models and queries.",
        category: "Flask",
        subtitle: "Database models, relationships, CRUD operations",
        signature: "db = SQLAlchemy(app)  |  db.session.add()  |  db.session.query()",
        descLong: "Flask-SQLAlchemy provides an ORM layer on top of SQLAlchemy. Define models as classes, use `db.session` to manage transactions, and leverage query methods for CRUD. Supports relationships between models.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SQLAlchemy() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask\nfrom flask_sqlalchemy import SQLAlchemy\napp = Flask(__name__)\napp.config[\"SQLALCHEMY_DATABASE_URI\"] = \"sqlite:///app.db\"\ndb = SQLAlchemy(app)\nclass User(db.Model):\n    id   = db.Column(db.Integer, primary_key=True)\n    name = db.Column(db.String(80), nullable=False)\nwith app.app_context():\n    db.create_all()\n    db.session.add(User(name=\"Alice\"))\n    db.session.commit()\n    print(User.query.all())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SQLAlchemy() — common patterns you'll see in production.\n# APPROACH  - Combine SQLAlchemy() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom flask import Flask, abort, jsonify\nfrom flask_sqlalchemy import SQLAlchemy\nfrom sqlalchemy.exc import IntegrityError\napp = Flask(__name__)\napp.config[\"SQLALCHEMY_DATABASE_URI\"] = \"sqlite:///app.db\"\ndb = SQLAlchemy(app)\nclass User(db.Model):\n    id    = db.Column(db.Integer, primary_key=True)\n    email = db.Column(db.String(120), unique=True, nullable=False)\n    posts = db.relationship(\"Post\", back_populates=\"author\", cascade=\"all, delete-orphan\")\nclass Post(db.Model):\n    id      = db.Column(db.Integer, primary_key=True)\n    title   = db.Column(db.String(120), nullable=False)\n    user_id = db.Column(db.ForeignKey(\"user.id\"), nullable=False)\n    author  = db.relationship(\"User\", back_populates=\"posts\")\n@app.post(\"/users\")\ndef create_user():\n    u = User(email=\"alice@example.com\")\n    db.session.add(u)\n    try:\n        db.session.commit()\n    except IntegrityError:\n        db.session.rollback()                # ALWAYS rollback on failure\n        abort(409, description=\"email taken\")\n    return jsonify(id=u.id), 201\n@app.get(\"/users/<int:uid>\")\ndef get_user(uid):\n    u = db.session.get(User, uid) or abort(404)\n    return jsonify(id=u.id, email=u.email, post_count=len(u.posts))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SQLAlchemy() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom flask import Flask\nfrom flask_sqlalchemy import SQLAlchemy\nfrom sqlalchemy.orm import joinedload, selectinload\ndb = SQLAlchemy()                                     # init_app() in factory\nclass User(db.Model):\n    id    = db.Column(db.Integer, primary_key=True)\n    email = db.Column(db.String(120), unique=True, nullable=False, index=True)\n    posts = db.relationship(\"Post\", back_populates=\"author\", lazy=\"raise\")  # forces explicit loads\nclass Post(db.Model):\n    id      = db.Column(db.Integer, primary_key=True)\n    title   = db.Column(db.String(120), nullable=False)\n    user_id = db.Column(db.ForeignKey(\"user.id\"), nullable=False, index=True)\n    author  = db.relationship(\"User\", back_populates=\"posts\")\n# 1) Prevent N+1 with explicit loaders.\n#    BAD:  for u in User.query.all(): u.posts          # 1 + N queries\n#    GOOD: User.query.options(selectinload(User.posts)).all()\ndef list_users_with_posts():\n    return (db.session\n              .query(User)\n              .options(selectinload(User.posts))      # one extra IN(...) query, not N\n              .all())\n# 2) Pagination (always cap large lists)\ndef page_users(page=1, per=50):\n    return User.query.paginate(page=page, per_page=per, max_per_page=200)\n# 3) Migrations live in Alembic, not create_all()\n#       $ flask db init\n#       $ flask db migrate -m \"add User.email index\"\n#       $ flask db upgrade\n# 4) Connection pool tuning for production (Postgres / MySQL)\n#    SQLALCHEMY_ENGINE_OPTIONS = {\n#        \"pool_size\": 10, \"max_overflow\": 20,\n#        \"pool_pre_ping\": True,                       # detect stale conns\n#        \"pool_recycle\": 280,                          # < server timeout\n#    }\n# Decision rule:\n#   prototype, single user             -> create_all() and SQLite\n#   real app                            -> Alembic migrations from day 1\n#   list endpoint with relations        -> selectinload / joinedload, never lazy default\n#   one-to-one or filtered relation     -> joinedload (single SQL JOIN)\n#   one-to-many or many-to-many         -> selectinload (separate IN query, scales)\n#\n# Anti-pattern: catching IntegrityError without rollback\n#   The session is poisoned and every later commit fails. ALWAYS:\n#       try:    db.session.commit()\n#       except: db.session.rollback(); raise"
                  }
        ],
        tips: [
                  "Define a `__repr__()` method on models for easier debugging.",
                  "Use `lazy=True` (default) for relationships; load related objects on access.",
                  "Always commit after add/update/delete: `db.session.commit()`.",
                  "When `IntegrityError` (or any commit error) fires, call `db.session.rollback()` in the except branch — otherwise the session is poisoned and every later commit fails",
                  "Avoid the lazy-load default in list endpoints: use `selectinload` (one-to-many / many-to-many, separate IN query) or `joinedload` (one-to-one / filtered, single SQL JOIN) to kill N+1",
                  "Adopt Alembic migrations on day 1 of a real app — `db.create_all()` does not handle column changes safely"
        ],
        mistake: "Forgetting to call `db.session.commit()` after creating or modifying records.",
        shorthand: {
          verbose: "user = User()\nuser.name = \"Alice\"\nuser.email = \"alice@example.com\"\ndb.session.add(user)\ndb.session.flush()\ndb.session.commit()\nusers = db.session.query(User).filter(User.name == \"Alice\").all()",
          concise: "db.session.add(User(name=\"Alice\", email=\"alice@example.com\"))\ndb.session.commit()\nusers = User.query.filter_by(name=\"Alice\").all()",
        },
      },
      {
        id: "flask-middleware",
        fn: "@app.before_request, @app.after_request",
        desc: "Intercept requests and responses with hooks, and handle errors globally.",
        category: "Flask",
        subtitle: "Request/response hooks, error handlers",
        signature: "@app.before_request  |  @app.after_request  |  @app.errorhandler()",
        descLong: "Flask provides lifecycle hooks to intercept and modify requests and responses. Use `@app.before_request` to run logic before each request (e.g., authentication), `@app.after_request` to modify responses, and `@app.errorhandler()` to handle exceptions globally.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @app.before_request, @app.after_request — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\n@app.before_request\ndef log_request():\n    print(f\"--> {request.method} {request.path}\")\n@app.errorhandler(404)\ndef not_found(e):\n    return jsonify(error=\"not_found\"), 404\n@app.route(\"/\")\ndef index():\n    return jsonify(ok=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @app.before_request, @app.after_request — common patterns you'll see in production.\n# APPROACH  - Combine @app.before_request, @app.after_request with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport time\nfrom flask import Flask, request, jsonify, g\napp = Flask(__name__)\n@app.before_request\ndef start_timer():\n    g.t0 = time.perf_counter()                  # g is per-request scratch space\n    if request.path.startswith(\"/api/\") and not request.headers.get(\"Authorization\"):\n        return jsonify(error=\"unauthorized\"), 401   # short-circuits the request\n@app.after_request\ndef add_metrics(response):\n    response.headers[\"X-Response-Time\"] = f\"{(time.perf_counter() - g.t0)*1000:.1f}ms\"\n    response.headers[\"Access-Control-Allow-Origin\"] = \"*\"\n    return response                              # MUST return the response\n@app.teardown_request\ndef cleanup(exc):                                # runs even on exceptions\n    pass                                         # close DB sessions, release locks\n@app.errorhandler(Exception)\ndef all_errors(e):\n    code = getattr(e, \"code\", 500)\n    return jsonify(error=type(e).__name__, message=str(e)), code\n@app.get(\"/api/data\")\ndef data():\n    return jsonify(value=42)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @app.before_request, @app.after_request — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport time, uuid, logging\nfrom flask import Flask, request, jsonify, g\napp = Flask(__name__)\nlog = logging.getLogger(\"app\")\n# 1) WSGI middleware — runs OUTSIDE Flask's request context.\n#    Use this for things like ProxyFix (X-Forwarded-For) and request size limits.\nfrom werkzeug.middleware.proxy_fix import ProxyFix\napp.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)\n# 2) Per-request correlation ID for log tracing\n@app.before_request\ndef assign_request_id():\n    g.request_id = request.headers.get(\"X-Request-Id\") or uuid.uuid4().hex\n    g.t0 = time.perf_counter()\n@app.after_request\ndef attach_metadata(resp):\n    resp.headers[\"X-Request-Id\"] = g.request_id\n    # Security headers — turn these on by default\n    resp.headers[\"X-Content-Type-Options\"] = \"nosniff\"\n    resp.headers[\"Strict-Transport-Security\"] = \"max-age=31536000; includeSubDomains\"\n    resp.headers[\"Referrer-Policy\"] = \"strict-origin-when-cross-origin\"\n    log.info(\"req\",\n             extra={\"rid\": g.request_id, \"path\": request.path,\n                    \"ms\": (time.perf_counter() - g.t0) * 1000,\n                    \"status\": resp.status_code})\n    return resp\n# 3) Stable error contract — never let a 500 leak a stack trace as JSON\nfrom werkzeug.exceptions import HTTPException\n@app.errorhandler(HTTPException)\ndef http_err(e):\n    return jsonify(error=e.name, message=e.description, request_id=g.get(\"request_id\")), e.code\n@app.errorhandler(Exception)\ndef unhandled(e):\n    log.exception(\"unhandled\", extra={\"rid\": g.get(\"request_id\")})\n    return jsonify(error=\"internal_server_error\", request_id=g.get(\"request_id\")), 500\n# Decision rule:\n#   request-scoped state                  -> flask.g (cleared per request)\n#   long-lived background task            -> NEVER use g — pass explicit args\n#   load-balancer-side concerns           -> WSGI middleware (ProxyFix, etc.)\n#   per-blueprint cross-cutting concern   -> blueprint.before_request, not app.before_request\n#   security headers                      -> use Flask-Talisman in real apps\n#\n# Anti-pattern: returning None from after_request\n#   The decorator REQUIRES the response object back. Returning None or a tuple\n#   silently 500s the next request. Always: return response."
                  }
        ],
        tips: [
                  "Use `@app.before_request` for cross-cutting concerns: auth, logging, rate-limiting.",
                  "`@app.after_request` receives the response object; always return it.",
                  "Error handlers catch exceptions and return appropriate responses."
        ],
        mistake: "Defining middleware after routes; register hooks early in app initialization.",
        shorthand: {
          verbose: "@app.before_request\ndef authenticate():\n    token = request.headers.get(\"Authorization\")\n    if not token:\n        return jsonify({\"error\": \"Unauthorized\"}), 401\n\n@app.after_request\ndef add_cors(response):\n    response.headers[\"Access-Control-Allow-Origin\"] = \"*\"\n    return response\n\n@app.errorhandler(404)\ndef handle_404(e):\n    return jsonify({\"error\": \"Not found\"}), 404",
          concise: "@app.before_request\ndef auth():\n    if not request.headers.get(\"Authorization\"): abort(401)\n\n@app.after_request\ndef cors(r):\n    r.headers[\"Access-Control-Allow-Origin\"] = \"*\"; return r",
        },
      },
    ],
  },

  // ── Section 2: FastAPI ─────────────────────────────────────────
  {
    id: "fastapi-web",
    title: "FastAPI",
    entries: [
      {
        id: "fastapi-middleware",
        fn: "@app.middleware, CORSMiddleware",
        desc: "Add middleware for CORS, custom processing, and request/response interception.",
        category: "FastAPI",
        subtitle: "CORS configuration, custom middleware, logging",
        signature: "@app.middleware(\"http\")  |  app.add_middleware(CORSMiddleware)",
        descLong: "FastAPI middleware intercepts requests and responses in a Starlette-compatible way. Use `CORSMiddleware` for cross-origin access, or create custom middleware with `@app.middleware(\"http\")` to log, modify headers, or validate requests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @app.middleware, CORSMiddleware — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\napp = FastAPI()\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"http://localhost:5173\"],   # be explicit even in dev\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)\n@app.get(\"/\")\nasync def root():\n    return {\"message\": \"Hello\"}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @app.middleware, CORSMiddleware — common patterns you'll see in production.\n# APPROACH  - Combine @app.middleware, CORSMiddleware with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport time\nfrom fastapi import FastAPI, Request\nfrom fastapi.middleware.cors import CORSMiddleware\napp = FastAPI()\n# CORS — pin specific origins in real apps\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"https://app.example.com\"],\n    allow_methods=[\"GET\", \"POST\", \"PUT\", \"DELETE\"],\n    allow_headers=[\"Authorization\", \"Content-Type\"],\n)\n@app.middleware(\"http\")\nasync def add_timing(request: Request, call_next):\n    t0 = time.perf_counter()\n    response = await call_next(request)            # MUST await; never block the loop\n    response.headers[\"X-Process-Time\"] = f\"{(time.perf_counter()-t0)*1000:.1f}ms\"\n    return response\n@app.get(\"/\")\nasync def root():\n    return {\"ok\": True}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @app.middleware, CORSMiddleware — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os, time, uuid, logging\nfrom fastapi import FastAPI, Request\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom fastapi.middleware.gzip import GZipMiddleware\nfrom fastapi.middleware.trustedhost import TrustedHostMiddleware\nfrom starlette.middleware.base import BaseHTTPMiddleware\nlog = logging.getLogger(\"app\")\napp = FastAPI()\n# 1) Order matters — middleware runs in REVERSE registration order on the response.\n#    Add the outer-most concerns FIRST so they wrap everything below.\napp.add_middleware(TrustedHostMiddleware,\n                   allowed_hosts=[\"api.example.com\", \"*.example.com\"])\napp.add_middleware(GZipMiddleware, minimum_size=500)\napp.add_middleware(CORSMiddleware,\n                   allow_origins=os.getenv(\"CORS_ORIGINS\", \"\").split(\",\") or [],\n                   allow_credentials=True,\n                   allow_methods=[\"GET\", \"POST\", \"PUT\", \"DELETE\"],\n                   allow_headers=[\"Authorization\", \"Content-Type\"])\n# 2) Class-based middleware is easier to test and parameterize than @app.middleware\nclass RequestContext(BaseHTTPMiddleware):\n    async def dispatch(self, request: Request, call_next):\n        rid = request.headers.get(\"x-request-id\") or uuid.uuid4().hex\n        request.state.request_id = rid\n        t0 = time.perf_counter()\n        try:\n            response = await call_next(request)\n        except Exception:\n            log.exception(\"unhandled\", extra={\"rid\": rid, \"path\": request.url.path})\n            raise\n        response.headers[\"X-Request-Id\"] = rid\n        log.info(\"req\", extra={\"rid\": rid, \"path\": request.url.path,\n                               \"status\": response.status_code,\n                               \"ms\": (time.perf_counter()-t0)*1000})\n        return response\napp.add_middleware(RequestContext)\n# Decision rule:\n#   browser frontend hits the API         -> CORSMiddleware, pin origins explicitly\n#   behind a load balancer / proxy        -> TrustedHostMiddleware + ProxyHeadersMiddleware\n#   responses > 500 bytes                 -> GZipMiddleware\n#   per-request correlation               -> class-based middleware writing to request.state\n#   auth / rate limit                      -> dependencies, NOT middleware (better DI surface)\n#\n# Anti-pattern: allow_origins=[\"*\"] WITH allow_credentials=True\n#   The browser refuses to send cookies; auth silently breaks. Either pin origins\n#   OR drop credentials — never both wide open at once."
                  }
        ],
        tips: [
                  "Set `allow_origins=[\"https://example.com\"]` to restrict CORS in production.",
                  "Custom middleware must be async and call `call_next(request)` to continue.",
                  "Middleware order matters; add them before route definitions.",
                  "Auth and rate limiting belong in `Depends()` dependencies, not middleware — better DI surface, per-route opt-in, and trivial to mock in tests",
                  "Behind a load balancer / proxy add `TrustedHostMiddleware` + `ProxyHeadersMiddleware`; for responses >500 bytes add `GZipMiddleware`"
        ],
        mistake: "Using `allow_origins=[\"*\"]` with `allow_credentials=True` (security risk).",
        shorthand: {
          verbose: "from fastapi.middleware.cors import CORSMiddleware\ncors_config = {\n    \"allow_origins\": [\"https://example.com\"],\n    \"allow_credentials\": True,\n    \"allow_methods\": [\"GET\", \"POST\"],\n    \"allow_headers\": [\"*\"],\n}\napp.add_middleware(CORSMiddleware, **cors_config)",
          concise: "app.add_middleware(CORSMiddleware, allow_origins=[\"https://example.com\"], allow_credentials=True)",
        },
      },
      {
        id: "fastapi-background-tasks",
        fn: "BackgroundTasks",
        desc: "Run tasks asynchronously after returning a response to the client.",
        category: "FastAPI",
        subtitle: "Fire-and-forget operations, post-response tasks",
        signature: "BackgroundTasks  |  background_tasks.add_task(func, *args)",
        descLong: "Use `BackgroundTasks` to offload work that doesn't need to complete before responding. Add tasks with `background_tasks.add_task()`, and FastAPI will execute them after sending the response. Useful for emails, logging, cleanup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of BackgroundTasks — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI, BackgroundTasks\napp = FastAPI()\ndef write_log(message: str):\n    with open(\"audit.log\", \"a\") as f:\n        f.write(message + \"\\n\")\n@app.post(\"/notify\")\nasync def notify(email: str, bg: BackgroundTasks):\n    bg.add_task(write_log, f\"notified {email}\")\n    return {\"queued\": True}                    # response goes out IMMEDIATELY"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of BackgroundTasks — common patterns you'll see in production.\n# APPROACH  - Combine BackgroundTasks with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport logging, asyncio\nfrom fastapi import FastAPI, BackgroundTasks\nlog = logging.getLogger(\"app\")\napp = FastAPI()\n# Sync task — runs in the threadpool so it doesn't block the event loop\ndef send_email(addr: str, body: str):\n    try:\n        # smtplib.SMTP(...).send_message(...)\n        log.info(\"email sent to %s\", addr)\n    except Exception:\n        log.exception(\"email failed for %s\", addr)   # NEVER raise — caller is gone\n# Async task — awaited inline on the event loop\nasync def push_metric(name: str, value: float):\n    await asyncio.sleep(0.01)                       # pretend network call\n    log.info(\"metric %s=%s\", name, value)\n@app.post(\"/signup\")\nasync def signup(email: str, bg: BackgroundTasks):\n    bg.add_task(send_email, email, \"Welcome!\")\n    bg.add_task(push_metric, \"signup\", 1.0)\n    return {\"status\": \"ok\"}                         # all tasks fire after this"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of BackgroundTasks — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport logging\nfrom fastapi import FastAPI, BackgroundTasks\nlog = logging.getLogger(\"app\")\napp = FastAPI()\n# 1) BackgroundTasks runs IN THE SAME PROCESS, AFTER the response.\n#    If the worker dies / restarts / crashes — your task vanishes.\n#    Use it ONLY for tasks where loss is acceptable (audit logs, metrics, cache warm).\n# 2) For anything that MUST happen, enqueue to Celery / RQ / Arq instead.\ndef enqueue_email(addr: str, body: str):\n    # Celery example — synchronous in the request handler, durable in the broker.\n    # send_email_task.delay(addr=addr, body=body)\n    pass\n@app.post(\"/order\")\nasync def place_order(item_id: int, bg: BackgroundTasks):\n    order_id = persist_order(item_id)            # MUST happen before responding\n    enqueue_email(\"ops@example.com\", f\"new order {order_id}\")  # MUST not be lost -> queue\n    bg.add_task(log_metric, \"order_placed\", 1)   # OK to lose -> BackgroundTasks\n    return {\"order_id\": order_id}\n# 3) Always wrap background work in a logging boundary.\n#    Errors raised inside a task are NOT visible to the client and not retried.\ndef safe(task):\n    def wrapped(*a, **kw):\n        try:\n            return task(*a, **kw)\n        except Exception:\n            log.exception(\"background task %s failed\", task.__name__)\n    return wrapped\n# Decision rule:\n#   loss-tolerant, fast, < 1s              -> BackgroundTasks\n#   must run, must survive a crash          -> Celery / RQ / Arq with a Redis/RabbitMQ broker\n#   periodic / scheduled                    -> Celery beat or APScheduler\n#   long-running (> 5s, blocks workers)     -> queue + dedicated worker pool\n#   needs retries with backoff              -> queue, never BackgroundTasks\n#\n# Anti-pattern: doing the email send inline before returning\n#   The user waits 2-5 seconds; SMTP timeouts cascade into 504s. Either move it\n#   to BackgroundTasks (loss-tolerant) or to a real queue (durable).\ndef persist_order(_): return 42\ndef log_metric(*_): pass"
                  }
        ],
        tips: [
                  "Background tasks run sequentially; use a task queue (Celery) for parallelism.",
                  "The client gets a response immediately; slow tasks don't block.",
                  "Tasks run in the same process; errors won't reach the client."
        ],
        mistake: "Using BackgroundTasks for critical work; use Celery or Redis queue for reliability.",
        shorthand: {
          verbose: "@app.post(\"/send\")\nasync def send_email_endpoint(email: str, background_tasks: BackgroundTasks):\n    def send_task(email_addr):\n        time.sleep(1)\n        print(f\"Sent to {email_addr}\")\n    background_tasks.add_task(send_task, email)\n    return {\"status\": \"sent\"}",
          concise: "@app.post(\"/send\")\nasync def send(email: str, bg: BackgroundTasks):\n    bg.add_task(send_email, email)\n    return {\"status\": \"sent\"}",
        },
      },
      {
        id: "fastapi-websockets",
        fn: "@app.websocket()",
        desc: "Handle WebSocket connections for real-time bidirectional communication.",
        category: "FastAPI",
        subtitle: "WebSocket endpoint, client connections, messaging",
        signature: "@app.websocket(\"/ws\")  |  await websocket.accept()  |  await websocket.send_json()",
        descLong: "WebSocket endpoints enable real-time communication between client and server. Use `@app.websocket()` to define an endpoint, `await websocket.accept()` to establish the connection, and `await websocket.receive_text()/send_json()` for messaging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @app.websocket() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI, WebSocket\napp = FastAPI()\n@app.websocket(\"/ws\")\nasync def echo(ws: WebSocket):\n    await ws.accept()                          # always first\n    while True:\n        msg = await ws.receive_text()\n        await ws.send_text(f\"echo: {msg}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @app.websocket() — common patterns you'll see in production.\n# APPROACH  - Combine @app.websocket() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom fastapi import FastAPI, WebSocket, WebSocketDisconnect\napp = FastAPI()\n@app.websocket(\"/chat\")\nasync def chat(ws: WebSocket, user: str = \"anon\"):    # query params work in WS too\n    await ws.accept()\n    try:\n        await ws.send_json({\"system\": f\"hi {user}\"})\n        while True:\n            data = await ws.receive_json()             # {\"text\": \"...\"}\n            await ws.send_json({\"user\": user, \"text\": data[\"text\"]})\n    except WebSocketDisconnect:\n        # Client closed the socket. NEVER call ws.close() again here.\n        print(f\"{user} disconnected\")\n    except Exception:\n        # Any other error: close with a code so the client knows why.\n        await ws.close(code=1011)\n        raise"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @app.websocket() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom typing import Set\nfrom fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status\nimport asyncio\napp = FastAPI()\nclass ConnectionManager:\n    def __init__(self):\n        self.active: Set[WebSocket] = set()\n        self._lock = asyncio.Lock()\n    async def connect(self, ws: WebSocket):\n        await ws.accept()\n        async with self._lock:\n            self.active.add(ws)\n    async def disconnect(self, ws: WebSocket):\n        async with self._lock:\n            self.active.discard(ws)\n    async def broadcast(self, payload: dict):\n        # Snapshot to avoid mutation during iteration\n        async with self._lock:\n            sockets = list(self.active)\n        # send_json is per-socket; gather with return_exceptions so one bad\n        # client doesn't poison the whole broadcast\n        await asyncio.gather(*(ws.send_json(payload) for ws in sockets),\n                             return_exceptions=True)\nmanager = ConnectionManager()\n# 1) Auth on the WebSocket handshake — close with a code if it fails.\n#    Browsers can't read the body of a 401 over WS; close codes are the signal.\ndef authenticate(token: str | None) -> str | None:\n    return \"alice\" if token == \"secret\" else None\n@app.websocket(\"/ws\")\nasync def ws_endpoint(ws: WebSocket, token: str | None = Query(default=None)):\n    user = authenticate(token)\n    if not user:\n        await ws.close(code=status.WS_1008_POLICY_VIOLATION)\n        return\n    await manager.connect(ws)\n    try:\n        await manager.broadcast({\"system\": f\"{user} joined\"})\n        while True:\n            msg = await ws.receive_json()\n            await manager.broadcast({\"user\": user, \"text\": msg.get(\"text\", \"\")})\n    except WebSocketDisconnect:\n        pass\n    finally:\n        await manager.disconnect(ws)\n        await manager.broadcast({\"system\": f\"{user} left\"})\n# Decision rule:\n#   one-off echo / debug                   -> intro shape, no error wrapping\n#   single-client live updates              -> junior shape with WebSocketDisconnect\n#   N clients seeing the same stream        -> ConnectionManager + broadcast\n#   need cross-process pub/sub              -> Redis pub/sub or NATS — not in-memory set\n#   browsers behind proxies                  -> ping/pong every 30s (proxy idle timeouts)\n#\n# Anti-pattern: try/except Exception that swallows WebSocketDisconnect\n#   You'll keep the dead socket in the manager forever. Catch WebSocketDisconnect\n#   FIRST and unregister; only then catch Exception for the unexpected."
                  }
        ],
        tips: [
                  "Always wrap WebSocket handling in try/except to catch disconnections.",
                  "Use `receive_json()` and `send_json()` for structured data.",
                  "Call `await websocket.accept()` before sending/receiving.",
                  "Catch `WebSocketDisconnect` FIRST and unregister the socket — a bare `except Exception` swallows it and leaves dead sockets in your ConnectionManager forever",
                  "Cross-process broadcast belongs in Redis pub/sub or NATS — an in-memory `set` only works in single-process dev mode"
        ],
        mistake: "Forgetting to await async WebSocket methods (accept, send, receive).",
        shorthand: {
          verbose: "@app.websocket(\"/ws\")\nasync def ws(websocket: WebSocket):\n    await websocket.accept()\n    while True:\n        try:\n            message = await websocket.receive_text()\n            response = f\"Echo: {message}\"\n            await websocket.send_text(response)\n        except:\n            break",
          concise: "@app.websocket(\"/ws\")\nasync def ws(ws: WebSocket):\n    await ws.accept()\n    async for msg in ws.iter_text(): await ws.send_text(f\"Echo: {msg}\")",
        },
      },
      {
        id: "fastapi-auth",
        fn: "OAuth2PasswordBearer, JWT",
        desc: "Implement OAuth2 and JWT-based authentication with dependency injection.",
        category: "FastAPI",
        subtitle: "Token-based auth, JWT validation, dependency-based security",
        signature: "OAuth2PasswordBearer  |  @app.post(\"/token\")  |  Depends()",
        descLong: "FastAPI provides built-in OAuth2 and JWT support. Use `OAuth2PasswordBearer` to define token locations, create a `/token` endpoint to issue JWTs, and use `Depends()` to validate tokens on protected routes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of OAuth2PasswordBearer, JWT — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI, Depends, HTTPException\nfrom fastapi.security import OAuth2PasswordBearer\napp = FastAPI()\noauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"token\")\ndef get_current_user(token: str = Depends(oauth2_scheme)):\n    if token != \"secret\":\n        raise HTTPException(status_code=401, detail=\"invalid token\")\n    return {\"name\": \"alice\"}\n@app.get(\"/me\")\ndef me(user: dict = Depends(get_current_user)):\n    return user"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of OAuth2PasswordBearer, JWT — common patterns you'll see in production.\n# APPROACH  - Combine OAuth2PasswordBearer, JWT with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport os\nfrom datetime import datetime, timedelta, timezone\nfrom fastapi import FastAPI, Depends, HTTPException\nfrom fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm\nfrom jose import JWTError, jwt\nfrom passlib.context import CryptContext\napp = FastAPI()\nSECRET_KEY = os.environ[\"JWT_SECRET\"]              # NEVER hardcode\nALGORITHM  = \"HS256\"\noauth2     = OAuth2PasswordBearer(tokenUrl=\"token\")\npwd        = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")\nusers = {\"alice\": {\"username\": \"alice\", \"hashed_password\": pwd.hash(\"secret123\")}}\ndef authenticate(username: str, password: str):\n    user = users.get(username)\n    if not user or not pwd.verify(password, user[\"hashed_password\"]):\n        return None\n    return user\ndef make_token(sub: str, ttl_minutes: int = 60) -> str:\n    return jwt.encode(\n        {\"sub\": sub, \"exp\": datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)},\n        SECRET_KEY, algorithm=ALGORITHM,\n    )\ndef current_user(token: str = Depends(oauth2)):\n    creds_err = HTTPException(status_code=401, detail=\"invalid token\",\n                              headers={\"WWW-Authenticate\": \"Bearer\"})\n    try:\n        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])\n        username = payload.get(\"sub\")\n    except JWTError:\n        raise creds_err\n    user = users.get(username) if username else None\n    if not user:\n        raise creds_err\n    return user\n@app.post(\"/token\")\ndef login(form: OAuth2PasswordRequestForm = Depends()):\n    user = authenticate(form.username, form.password)\n    if not user:\n        raise HTTPException(status_code=401, detail=\"invalid credentials\")\n    return {\"access_token\": make_token(user[\"username\"]), \"token_type\": \"bearer\"}\n@app.get(\"/me\")\ndef me(user: dict = Depends(current_user)):\n    return {\"name\": user[\"username\"]}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of OAuth2PasswordBearer, JWT — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nfrom datetime import datetime, timedelta, timezone\nfrom fastapi import FastAPI, Depends, HTTPException, Security\nfrom fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes\nfrom jose import jwt, JWTError\nfrom passlib.context import CryptContext\napp = FastAPI()\nPUB_KEY  = os.environ[\"JWT_PUB\"]                    # asymmetric: clients verify, only auth signs\nPRIV_KEY = os.environ[\"JWT_PRIV\"]\nALG      = \"RS256\"\n# 1) Scopes describe permissions; OAuth2PasswordBearer wires them into OpenAPI.\noauth2 = OAuth2PasswordBearer(\n    tokenUrl=\"token\",\n    scopes={\"users:read\": \"Read user profiles\", \"users:write\": \"Create/update users\"},\n)\npwd = CryptContext(schemes=[\"argon2\"], deprecated=\"auto\")   # argon2 > bcrypt for new code\ndef make_token(sub: str, scopes: list[str], ttl: timedelta) -> str:\n    return jwt.encode(\n        {\"sub\": sub, \"scopes\": scopes,\n         \"exp\": datetime.now(timezone.utc) + ttl,\n         \"iat\": datetime.now(timezone.utc)},\n        PRIV_KEY, algorithm=ALG,\n    )\n# 2) Validate scopes alongside the token — single dependency per route.\ndef require(scopes: SecurityScopes, token: str = Depends(oauth2)) -> dict:\n    auth = \"Bearer\" if not scopes.scopes else f'Bearer scope=\"{scopes.scope_str}\"'\n    err = HTTPException(401, \"not authorized\", headers={\"WWW-Authenticate\": auth})\n    try:\n        payload = jwt.decode(token, PUB_KEY, algorithms=[ALG])\n    except JWTError:\n        raise err\n    if not set(scopes.scopes).issubset(payload.get(\"scopes\", [])):\n        raise HTTPException(403, \"missing scope\", headers={\"WWW-Authenticate\": auth})\n    return payload\n# 3) Issue short access + long refresh; rotate on every refresh\n@app.post(\"/token\")\ndef login(form: OAuth2PasswordRequestForm = Depends()):\n    # ... password check elided ...\n    return {\n        \"access_token\":  make_token(form.username, form.scopes, timedelta(minutes=15)),\n        \"refresh_token\": make_token(form.username, [\"refresh\"], timedelta(days=14)),\n        \"token_type\": \"bearer\",\n    }\n@app.get(\"/users/{uid}\")\ndef read_user(uid: int, claims = Security(require, scopes=[\"users:read\"])):\n    return {\"id\": uid, \"by\": claims[\"sub\"]}\n@app.post(\"/users\")\ndef create_user(claims = Security(require, scopes=[\"users:write\"])):\n    return {\"created\": True, \"by\": claims[\"sub\"]}\n# Decision rule:\n#   single small service                  -> HS256 with one shared secret is fine\n#   multiple services verify same token   -> RS256/ES256 (asymmetric) — share PUB only\n#   browser SPA                            -> short access (5-15 min) + refresh in HttpOnly cookie\n#   long-lived API keys                    -> separate tokens with no exp; rotate on rotation\n#   permissions per endpoint               -> Security(require, scopes=[...])\n#\n# Anti-pattern: bcrypt(plain).verify() over the wire timing-leak\n#   Always go through pwd.verify(...). And never compare token strings with ==;\n#   verify the SIGNATURE — string equality is meaningless once an attacker forges JWTs."
                  }
        ],
        tips: [
                  "Never hardcode secrets; use environment variables.",
                  "`Depends()` enables FastAPI to inject authenticated users.",
                  "Use `python-jose` for JWT encoding/decoding, `passlib` for password hashing.",
                  "Single small service: HS256 with one shared secret is fine. The moment multiple services verify the same token, switch to RS256/ES256 (asymmetric) and share only the public key",
                  "Browser SPAs: short access token (5-15 min) + refresh token in an `HttpOnly` cookie; verify the JWT signature, never compare token strings with `==`"
        ],
        mistake: "Storing plaintext passwords; always hash with bcrypt or Argon2.",
        shorthand: {
          verbose: "def get_current_user(token: str = Depends(oauth2_scheme)):\n    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])\n    username = payload.get(\"sub\")\n    if not username:\n        raise HTTPException(status_code=401)\n    user = db.get_user(username)\n    if not user:\n        raise HTTPException(status_code=401)\n    return user\n\n@app.get(\"/protected\")\nasync def protected(user: dict = Depends(get_current_user)):\n    return user",
          concise: "@app.get(\"/protected\")\nasync def protected(user: dict = Depends(get_current_user)):\n    return user",
        },
      },
      {
        id: "fastapi-testing",
        fn: "TestClient",
        desc: "Test FastAPI endpoints using TestClient from httpx.",
        category: "FastAPI",
        subtitle: "Unit testing, endpoint validation, mocking",
        signature: "from fastapi.testclient import TestClient  |  client.get(url)  |  assert response.status_code",
        descLong: "FastAPI provides `TestClient` for synchronous testing of endpoints. It wraps `httpx.Client` and simulates HTTP requests without running a server. Use it in pytest to validate routes, status codes, and response bodies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of TestClient — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI\nfrom fastapi.testclient import TestClient\napp = FastAPI()\n@app.get(\"/\")\ndef read_root():\n    return {\"message\": \"Hello\"}\nclient = TestClient(app)\ndef test_root():\n    r = client.get(\"/\")\n    assert r.status_code == 200\n    assert r.json() == {\"message\": \"Hello\"}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of TestClient — common patterns you'll see in production.\n# APPROACH  - Combine TestClient with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\nfrom fastapi import FastAPI, HTTPException\nfrom fastapi.testclient import TestClient\nfrom pydantic import BaseModel\napp = FastAPI()\nclass Item(BaseModel):\n    name: str\n    price: float\n@app.post(\"/items\", status_code=201)\ndef create(item: Item):\n    if item.price <= 0:\n        raise HTTPException(status_code=422, detail=\"price must be positive\")\n    return {\"id\": 1, **item.model_dump()}\n@pytest.fixture\ndef client():\n    with TestClient(app) as c:        # context manager runs lifespan startup/shutdown\n        yield c\ndef test_create_item_ok(client):\n    r = client.post(\"/items\", json={\"name\": \"Widget\", \"price\": 9.99})\n    assert r.status_code == 201\n    assert r.json()[\"id\"] == 1\ndef test_create_item_invalid(client):\n    r = client.post(\"/items\", json={\"name\": \"Widget\", \"price\": -1})\n    assert r.status_code == 422\n    assert \"positive\" in r.json()[\"detail\"]\ndef test_query_params(client):\n    r = client.get(\"/items\", params={\"limit\": 5})\n    # 404 expected — we didn't define GET /items, just verifying param plumbing\n    assert r.status_code == 404"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of TestClient — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport pytest, asyncio\nfrom fastapi import FastAPI, Depends\nfrom fastapi.testclient import TestClient\nfrom httpx import AsyncClient\napp = FastAPI()\n# 1) A dependency that talks to \"the real database\"\ndef get_db():\n    raise NotImplementedError(\"override in tests\")\n@app.get(\"/users/{uid}\")\ndef get_user(uid: int, db = Depends(get_db)):\n    return db.fetch(uid)\n# 2) Override the dependency with an in-memory fake — no monkeypatching imports\nclass FakeDB:\n    def fetch(self, uid): return {\"id\": uid, \"name\": \"alice\"}\n@pytest.fixture\ndef client():\n    app.dependency_overrides[get_db] = lambda: FakeDB()\n    with TestClient(app) as c:\n        yield c\n    app.dependency_overrides.clear()              # ALWAYS reset between tests\ndef test_get_user(client):\n    assert client.get(\"/users/7\").json() == {\"id\": 7, \"name\": \"alice\"}\n# 3) Async tests for genuine async behavior — TestClient is sync.\n#    Use httpx.AsyncClient with the ASGI transport for end-to-end async testing.\n@pytest.mark.asyncio\nasync def test_async_path():\n    from httpx import ASGITransport\n    transport = ASGITransport(app=app)\n    async with AsyncClient(transport=transport, base_url=\"http://test\") as ac:\n        r = await ac.get(\"/users/1\")\n    assert r.status_code == 200\n# 4) Database isolation — each test gets a transaction that's rolled back at the end\n@pytest.fixture\ndef db_session():\n    # session = TestingSessionLocal()\n    # transaction = session.begin_nested()\n    # try:    yield session\n    # finally:\n    #     transaction.rollback()\n    #     session.close()\n    yield \"fake-session\"\n# Decision rule:\n#   sync route, simple                 -> TestClient + pytest fixtures\n#   async-only behavior to verify       -> httpx.AsyncClient + ASGITransport\n#   DB-touching tests                    -> per-test transaction; rollback in fixture\n#   external HTTP calls                  -> respx (httpx) or vcrpy to record/replay\n#   parametrized data scenarios          -> @pytest.mark.parametrize, not for-loops\n#\n# Anti-pattern: monkeypatching the global db engine\n#   Tests leak into each other; ordering matters; flakes appear. Use\n#   app.dependency_overrides — it's per-app, scoped, and trivially reversible."
                  }
        ],
        tips: [
                  "TestClient is synchronous; use it in pytest with regular functions.",
                  "Pass query params as kwargs: `client.get(\"/path\", params={\"key\": \"value\"})`.",
                  "Use `client.post(url, json={...})` for JSON bodies."
        ],
        mistake: "Using async TestClient for synchronous testing; TestClient handles async routes.",
        shorthand: {
          verbose: "client = TestClient(app)\nresponse = client.get(\"/items/1\")\nassert response.status_code == 200\ndata = response.json()\nassert data[\"item_id\"] == 1",
          concise: "client = TestClient(app)\nassert client.get(\"/items/1\").status_code == 200\nassert client.get(\"/items/1\").json()[\"item_id\"] == 1",
        },
      },
    ],
  },

  // ── Section 3: Django ─────────────────────────────────────────
  {
    id: "django",
    title: "Django",
    entries: [
      {
        id: "django-setup",
        fn: "django-admin startproject",
        desc: "Create a Django project structure, configure settings, and define URL routing.",
        category: "Django",
        subtitle: "Project initialization, settings, url configuration",
        signature: "django-admin startproject myproject  |  python manage.py runserver",
        descLong: "A Django project contains apps, each with models, views, and templates. Use `django-admin startproject` to scaffold the project, then `python manage.py startapp` to create apps. Configure databases, installed apps, and middleware in `settings.py`, and map URLs in `urls.py`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of django-admin startproject — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# $ django-admin startproject myproject\n# $ python manage.py startapp myapp\n# myproject/settings.py (minimal additions)\nINSTALLED_APPS = [\n    \"django.contrib.admin\",\n    \"django.contrib.auth\",\n    \"django.contrib.contenttypes\",\n    \"django.contrib.sessions\",\n    \"django.contrib.messages\",\n    \"django.contrib.staticfiles\",\n    \"myapp\",                            # don't forget this\n]\n# myproject/urls.py\nfrom django.contrib import admin\nfrom django.urls import path\nfrom myapp import views\nurlpatterns = [\n    path(\"admin/\", admin.site.urls),\n    path(\"\", views.index, name=\"index\"),\n]\n# $ python manage.py migrate\n# $ python manage.py runserver"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of django-admin startproject — common patterns you'll see in production.\n# APPROACH  - Combine django-admin startproject with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# myproject/settings.py\nimport os\nfrom pathlib import Path\nBASE_DIR = Path(__file__).resolve().parent.parent\nSECRET_KEY = os.environ[\"DJANGO_SECRET_KEY\"]            # NEVER hardcode\nDEBUG = os.getenv(\"DJANGO_DEBUG\") == \"1\"\nALLOWED_HOSTS = os.getenv(\"DJANGO_ALLOWED_HOSTS\", \"\").split(\",\")\nINSTALLED_APPS = [\n    \"django.contrib.admin\", \"django.contrib.auth\", \"django.contrib.contenttypes\",\n    \"django.contrib.sessions\", \"django.contrib.messages\", \"django.contrib.staticfiles\",\n    \"myapp\",\n]\nDATABASES = {\n    \"default\": {\n        \"ENGINE\":   \"django.db.backends.postgresql\",\n        \"NAME\":     os.environ[\"DB_NAME\"],\n        \"USER\":     os.environ[\"DB_USER\"],\n        \"PASSWORD\": os.environ[\"DB_PASSWORD\"],\n        \"HOST\":     os.getenv(\"DB_HOST\", \"localhost\"),\n        \"PORT\":     os.getenv(\"DB_PORT\", \"5432\"),\n        \"CONN_MAX_AGE\": 60,                            # reuse connections\n    }\n}\n# myproject/urls.py\nfrom django.urls import path, include\nurlpatterns = [\n    path(\"admin/\", admin.site.urls),\n    path(\"api/\", include(\"myapp.urls\")),               # delegate to per-app routing\n]\n# myapp/urls.py\nfrom django.urls import path\nfrom . import views\napp_name = \"myapp\"                                     # namespacing for {% url %}\nurlpatterns = [\n    path(\"\",            views.index,    name=\"index\"),\n    path(\"posts/<int:pk>/\", views.post, name=\"post\"),\n]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of django-admin startproject — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# myproject/settings/base.py\nimport environ\nfrom pathlib import Path\nBASE_DIR = Path(__file__).resolve().parent.parent.parent\nenv = environ.Env()\nenviron.Env.read_env(BASE_DIR / \".env\")               # loads from .env in dev only\nSECRET_KEY  = env(\"DJANGO_SECRET_KEY\")\nDEBUG       = False                                    # default off; dev.py overrides\nDATABASES   = {\"default\": env.db(\"DATABASE_URL\")}     # parses postgres://user:pw@host/db\nINSTALLED_APPS = [...]\nMIDDLEWARE  = [\n    \"django.middleware.security.SecurityMiddleware\",\n    \"django.contrib.sessions.middleware.SessionMiddleware\",\n    \"django.middleware.common.CommonMiddleware\",\n    \"django.middleware.csrf.CsrfViewMiddleware\",\n    \"django.contrib.auth.middleware.AuthenticationMiddleware\",\n    \"django.contrib.messages.middleware.MessageMiddleware\",\n    \"django.middleware.clickjacking.XFrameOptionsMiddleware\",\n]\n# myproject/settings/prod.py\nfrom .base import *\nALLOWED_HOSTS = env.list(\"DJANGO_ALLOWED_HOSTS\")\nSECURE_SSL_REDIRECT       = True\nSESSION_COOKIE_SECURE     = True\nCSRF_COOKIE_SECURE        = True\nSECURE_HSTS_SECONDS       = 31_536_000\nSECURE_HSTS_INCLUDE_SUBDOMAINS = True\nSECURE_PROXY_SSL_HEADER   = (\"HTTP_X_FORWARDED_PROTO\", \"https\")  # behind a TLS LB\n# myproject/settings/dev.py\nfrom .base import *\nDEBUG = True\nALLOWED_HOSTS = [\"*\"]\nINSTALLED_APPS += [\"django_extensions\"]\n# Decision rule:\n#   single settings.py                   -> only for tutorials / throwaway demos\n#   real app                              -> split base/dev/prod, pick via DJANGO_SETTINGS_MODULE\n#   secrets                               -> django-environ + .env (dev), real env vars (prod)\n#   db connection cost dominating         -> CONN_MAX_AGE=60 OR connection pooler (PgBouncer)\n#   serving static / media at scale        -> WhiteNoise (static), S3 (media); not Django's runserver\n#\n# Anti-pattern: DEBUG = True in production\n#   Stack traces leak source code, ALLOWED_HOSTS is bypassed, SECRET_KEY exposure\n#   becomes catastrophic. Always set DEBUG via env, default to False in base.py."
                  }
        ],
        tips: [
                  "Always run migrations after changing models: `python manage.py migrate`.",
                  "Create a superuser for admin access: `python manage.py createsuperuser`.",
                  "Use environment variables for secrets; never hardcode them in settings.py."
        ],
        mistake: "Forgetting to add your app to `INSTALLED_APPS` after creating it.",
        shorthand: {
          verbose: "# Create project\ndjango-admin startproject config .\n\n# Create app\npython manage.py startapp accounts\n\n# Add to settings.py INSTALLED_APPS\n# \"accounts\"\n\n# Create tables\npython manage.py migrate\n\n# Run server\npython manage.py runserver",
          concise: "django-admin startproject config . && python manage.py startapp accounts && python manage.py runserver",
        },
      },
      {
        id: "django-models",
        fn: "models.Model",
        desc: "Define database models with fields, relationships, and metadata.",
        category: "Django",
        subtitle: "Model fields, relationships, Meta options, __str__",
        signature: "class Model(models.Model):  |  models.CharField  |  models.ForeignKey  |  class Meta",
        descLong: "Django models map Python classes to database tables. Define fields with types like `CharField`, `IntegerField`, `DateTimeField`. Use `ForeignKey` for relationships, and the `Meta` class for options like ordering and permissions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of models.Model — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom django.db import models\nclass Author(models.Model):\n    name       = models.CharField(max_length=100)\n    email      = models.EmailField(unique=True)\n    created_at = models.DateTimeField(auto_now_add=True)\n    def __str__(self):\n        return self.name\n# $ python manage.py makemigrations\n# $ python manage.py migrate"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of models.Model — common patterns you'll see in production.\n# APPROACH  - Combine models.Model with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django.db import models\nfrom django.utils import timezone\nclass Author(models.Model):\n    name       = models.CharField(max_length=100)\n    email      = models.EmailField(unique=True)\n    created_at = models.DateTimeField(auto_now_add=True)\n    class Meta:\n        ordering = [\"-created_at\"]                  # default order in queries\n    def __str__(self):\n        return self.name\nclass Post(models.Model):\n    title          = models.CharField(max_length=200)\n    content        = models.TextField()\n    # CASCADE: deleting an author deletes their posts.\n    # PROTECT:  refuse the delete if posts exist (use for accounting / audit).\n    # SET_NULL: keep posts, set author=None (requires null=True).\n    author         = models.ForeignKey(Author, on_delete=models.CASCADE,\n                                       related_name=\"posts\")\n    published_date = models.DateTimeField(default=timezone.now)\n    is_published   = models.BooleanField(default=False)\n    class Meta:\n        ordering = [\"-published_date\"]\n        indexes  = [\n            models.Index(fields=[\"author\", \"-published_date\"]),   # supports the common query\n        ]\n    def __str__(self):\n        return self.title"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of models.Model — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django.db import models\nfrom django.db.models import Q, F\nfrom django.utils import timezone\n# 1) Abstract base for audit fields — every model inherits created/updated/deleted_at\nclass TimestampedModel(models.Model):\n    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n    deleted_at = models.DateTimeField(null=True, blank=True)   # soft delete\n    class Meta:\n        abstract = True                              # not its own table\n# 2) Enum-style choices via a TextChoices class — no magic strings\nclass PostStatus(models.TextChoices):\n    DRAFT     = \"draft\",     \"Draft\"\n    PUBLISHED = \"published\", \"Published\"\n    ARCHIVED  = \"archived\",  \"Archived\"\n# 3) Custom manager + queryset — encapsulate the \"alive + published\" rule\nclass PostQuerySet(models.QuerySet):\n    def alive(self):     return self.filter(deleted_at__isnull=True)\n    def published(self): return self.alive().filter(status=PostStatus.PUBLISHED)\nclass PostManager(models.Manager.from_queryset(PostQuerySet)):\n    pass\nclass Post(TimestampedModel):\n    title    = models.CharField(max_length=200)\n    slug     = models.SlugField(max_length=220, unique=True)\n    content  = models.TextField()\n    status   = models.CharField(max_length=16, choices=PostStatus.choices,\n                                default=PostStatus.DRAFT)\n    author   = models.ForeignKey(\"Author\", on_delete=models.PROTECT,\n                                 related_name=\"posts\")\n    published_at = models.DateTimeField(null=True, blank=True)\n    objects = PostManager()\n    class Meta:\n        ordering = [\"-published_at\", \"-created_at\"]\n        indexes  = [\n            models.Index(fields=[\"status\", \"-published_at\"]),\n        ]\n        constraints = [\n            # A published post MUST have a publish timestamp — enforced at the DB\n            models.CheckConstraint(\n                check=Q(status=\"draft\") | Q(published_at__isnull=False),\n                name=\"post_published_requires_timestamp\",\n            ),\n            # Per-author title uniqueness enforced once, at the schema level\n            models.UniqueConstraint(fields=[\"author\", \"title\"], name=\"unique_post_per_author\"),\n        ]\n    def soft_delete(self):\n        self.deleted_at = timezone.now()\n        self.save(update_fields=[\"deleted_at\"])\n# Decision rule:\n#   bool / status field with > 2 states     -> TextChoices, never raw strings\n#   \"should never happen at DB level\"        -> CheckConstraint / UniqueConstraint, not just clean()\n#   reverse-cascade actually wanted          -> on_delete=CASCADE (forum posts on user delete)\n#   reverse-cascade is dangerous              -> on_delete=PROTECT (orders, audit logs)\n#   shared timestamps / soft delete           -> abstract base model + custom manager\n#   filter that's used everywhere             -> custom QuerySet method, not repeated .filter() calls\n#\n# Anti-pattern: enforcing invariants only in clean() / forms\n#   Bulk updates, raw SQL, and migrations bypass model.clean(). Constraints in\n#   Meta.constraints run at the DATABASE level — they can't be skipped."
                  }
        ],
        tips: [
                  "`auto_now_add=True` sets the timestamp when the record is created; `auto_now=True` updates on every save.",
                  "Use `related_name` on ForeignKey to access reverse relationships: `author.posts.all()`.",
                  "Always define `__str__()` for meaningful object representation in admin and shell."
        ],
        mistake: "Using `on_delete=models.PROTECT` without handling orphaned records.",
        shorthand: {
          verbose: "class User(models.Model):\n    username = models.CharField(max_length=50)\n    email = models.EmailField()\n    created = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return self.username\n\nclass Post(models.Model):\n    title = models.CharField(max_length=200)\n    author_id = models.ForeignKey(User, on_delete=models.CASCADE)\n    created = models.DateTimeField(auto_now_add=True)",
          concise: "class User(models.Model):\n    username = models.CharField(max_length=50)\n    email = models.EmailField()\n\n    def __str__(self): return self.username\n\nclass Post(models.Model):\n    title = models.CharField(max_length=200)\n    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name=\"posts\")",
        },
      },
      {
        id: "django-orm",
        fn: "QuerySet methods",
        desc: "Query the database using Django ORM methods like filter, exclude, select_related.",
        category: "Django",
        subtitle: "QuerySet API, filtering, optimization",
        signature: "Model.objects.filter()  |  .exclude()  |  .select_related()  |  .prefetch_related()",
        descLong: "Django ORM provides a chainable QuerySet API. Use `filter()` for conditions, `exclude()` for negation, `select_related()` for foreign keys (JOIN), and `prefetch_related()` for reverse relations. All queries are lazy; they execute when evaluated.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of QuerySet methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nposts        = Post.objects.all()\npublished    = Post.objects.filter(is_published=True)\nnot_drafts   = Post.objects.exclude(is_published=False)\nsingle_post  = Post.objects.get(pk=1)               # raises if 0 or >1"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of QuerySet methods — common patterns you'll see in production.\n# APPROACH  - Combine QuerySet methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django.db.models import Q, Count\n# Field lookups: __gte, __icontains, __in, __isnull\nrecent = Post.objects.filter(\n    is_published=True,\n    published_date__gte=\"2024-01-01\",\n    title__icontains=\"python\",\n)\n# OR / negation with Q\nflagged = Post.objects.filter(Q(author__name=\"Alice\") | Q(author__name=\"Bob\"))\n# Avoid the N+1 trap on ForeignKey access\nfor p in Post.objects.select_related(\"author\"):\n    p.author.name                                   # one JOIN, not N follow-up queries\n# Aggregation per row\nauthors = Author.objects.annotate(num_posts=Count(\"posts\"))\nfor a in authors:\n    print(a.name, a.num_posts)\n# Pagination via slicing — translates to LIMIT/OFFSET\npage = Post.objects.all()[20:30]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of QuerySet methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django.db import transaction\nfrom django.db.models import F, Q, Count, Sum, Prefetch\n# 1) select_related = SQL JOIN — for ForeignKey / OneToOne (single object).\n#    prefetch_related = separate IN(...) query — for ManyToMany / reverse FK (many objects).\nposts = (Post.objects\n            .select_related(\"author\")              # 1 query, 1 JOIN\n            .prefetch_related(\n                Prefetch(\"comments\",                # custom prefetch with its own filter\n                         queryset=Comment.objects.filter(is_spam=False)\n                                                 .select_related(\"user\"))\n            ))\n# 2) F-expressions — update on the DB side, race-free, no read-modify-write\nPost.objects.filter(pk=1).update(view_count=F(\"view_count\") + 1)\n# 3) only() / defer() — fetch only the columns you actually need on hot paths\nids_titles = Post.objects.only(\"id\", \"title\")          # SELECT id, title\njust_ids   = Post.objects.values_list(\"id\", flat=True) # iterator of ids\n# 4) Bulk operations — orders of magnitude faster than per-row loops\nPost.objects.bulk_create([Post(title=t) for t in [\"A\", \"B\", \"C\"]], batch_size=500)\nPost.objects.filter(status=\"draft\").update(status=\"archived\")     # one UPDATE\n# 5) Transactional reads + writes — the \"compute then save\" anti-pattern fix\n@transaction.atomic\ndef transfer(from_id, to_id, amount):\n    # select_for_update locks the rows until the transaction commits\n    a = Account.objects.select_for_update().get(pk=from_id)\n    b = Account.objects.select_for_update().get(pk=to_id)\n    a.balance = F(\"balance\") - amount; a.save(update_fields=[\"balance\"])\n    b.balance = F(\"balance\") + amount; b.save(update_fields=[\"balance\"])\n# 6) Use .explain() to read the plan when something is slow\nprint(Post.objects.filter(author__name=\"Alice\").explain())\n# Decision rule:\n#   ForeignKey / OneToOne                  -> select_related (JOIN)\n#   ManyToMany / reverse FK                -> prefetch_related (separate IN query)\n#   listing 1000+ rows                      -> .iterator() to avoid loading all into memory\n#   counter increment / atomic delta        -> F(\"col\") + n inside .update()\n#   conditional bulk write                   -> .update() / .bulk_update(), not loop + save()\n#   need to lock rows                        -> select_for_update inside transaction.atomic\n#\n# Anti-pattern: read-modify-write counters\n#   p = Post.objects.get(pk=1); p.view_count += 1; p.save()\n#   Two concurrent requests both read 5, write 6 — one increment lost.\n#   Use F(\"view_count\") + 1 inside an .update() call.\nclass Comment: pass\nclass Account: pass"
                  }
        ],
        tips: [
                  "Use `select_related()` for foreign keys; use `prefetch_related()` for reverse relations.",
                  "Always check `query.explain()` to see the SQL and optimize N+1 problems.",
                  "QuerySets are lazy; don't execute until necessary (iteration, `.get()`, `.count()`).",
                  "For atomic counter updates use `F(\"col\") + 1` inside `.update()` — read-modify-write (`.get(); obj.x += 1; .save()`) loses concurrent increments",
                  "Bulk writes: prefer `.update()` / `.bulk_update()` over a loop of `save()`; row locks need `select_for_update()` inside `transaction.atomic`"
        ],
        mistake: "Looping over QuerySets without using `select_related()` causes N+1 queries.",
        shorthand: {
          verbose: "posts = Post.objects.all()\nposts = posts.filter(is_published=True)\nposts = posts.select_related(\"author\")\nfor post in posts:\n    print(post.author.name)",
          concise: "posts = Post.objects.filter(is_published=True).select_related(\"author\")",
        },
      },
      {
        id: "django-views",
        fn: "Function-based views",
        desc: "Create views as functions that handle requests and return responses.",
        category: "Django",
        subtitle: "Request/response handling, redirects, context",
        signature: "def view(request):  |  return HttpResponse()  |  return render()  |  return redirect()",
        descLong: "Function-based views (FBVs) are Python functions that accept a request object and return a response. Use `render()` for template rendering with context, `redirect()` for redirection, and decorators like `@login_required` for access control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Function-based views — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom django.shortcuts import render\nfrom .models import Post\ndef index(request):\n    posts = Post.objects.filter(is_published=True)\n    return render(request, \"posts/index.html\", {\"posts\": posts})"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Function-based views — common patterns you'll see in production.\n# APPROACH  - Combine Function-based views with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django.http import JsonResponse\nfrom django.shortcuts import render, redirect, get_object_or_404\nfrom django.views.decorators.http import require_http_methods\nfrom django.contrib.auth.decorators import login_required\nfrom .models import Post\n@require_http_methods([\"GET\", \"POST\"])                  # 405 on anything else\ndef post_detail(request, pk):\n    post = get_object_or_404(Post, pk=pk)               # raises Http404 cleanly\n    if request.method == \"POST\":\n        post.is_published = not post.is_published\n        post.save(update_fields=[\"is_published\"])       # only touch what changed\n        return redirect(\"post_detail\", pk=post.pk)      # PRG pattern: never re-submit\n    return render(request, \"posts/detail.html\", {\"post\": post})\n@login_required                                         # redirects to LOGIN_URL\ndef create_post(request):\n    if request.method == \"POST\":\n        post = Post.objects.create(\n            title=request.POST.get(\"title\", \"\"),\n            content=request.POST.get(\"content\", \"\"),\n            author=request.user,\n        )\n        return redirect(\"post_detail\", pk=post.pk)\n    return render(request, \"posts/create.html\")\ndef api_posts(request):\n    data = list(Post.objects.values(\"id\", \"title\", \"author__name\"))\n    return JsonResponse({\"posts\": data})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Function-based views — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django.db import transaction\nfrom django.http import HttpResponseForbidden, JsonResponse, Http404\nfrom django.shortcuts import get_object_or_404, redirect, render\nfrom django.views.decorators.http import require_http_methods, require_POST\nfrom django.contrib.auth.decorators import login_required, permission_required\nfrom django.contrib import messages\nfrom .models import Post\n# 1) Decorators stack BOTTOM UP. login_required runs FIRST (closest to def).\n@require_POST\n@login_required\n@permission_required(\"posts.change_post\", raise_exception=True)\ndef publish(request, pk):\n    # select_for_update locks the row until the transaction commits — no race\n    with transaction.atomic():\n        post = get_object_or_404(\n            Post.objects.select_for_update(), pk=pk\n        )\n        # 2) Object-level authorization — has the role, but is this THIS user's post?\n        if post.author_id != request.user.id and not request.user.is_staff:\n            return HttpResponseForbidden(\"not your post\")\n        post.status = \"published\"\n        post.published_at = timezone.now()\n        post.save(update_fields=[\"status\", \"published_at\"])\n    messages.success(request, \"Post published.\")        # one-shot flash messages\n    return redirect(\"post_detail\", pk=post.pk)          # POST -> Redirect -> GET (PRG)\n# 3) JSON endpoints: stable error contract, never raw exceptions to the wire\n@require_http_methods([\"GET\"])\ndef api_post(request, pk):\n    try:\n        post = Post.objects.values(\"id\", \"title\", \"author__name\").get(pk=pk)\n    except Post.DoesNotExist:\n        return JsonResponse({\"error\": \"not_found\"}, status=404)\n    return JsonResponse(post)\n# Decision rule:\n#   pure read view                       -> FBV with @require_GET, no transaction\n#   write view                            -> @require_POST + @transaction.atomic + PRG redirect\n#   read-modify-write on a row            -> select_for_update inside the transaction\n#   form-heavy CRUD                       -> upgrade to a CBV (CreateView/UpdateView)\n#   JSON API > 5 endpoints                -> upgrade to Django REST Framework\n#\n# Anti-pattern: writing on GET\n#   def upvote(request, pk):\n#       post.likes += 1; post.save()\n#   Browser prefetchers, link previewers, and bots all hit GET. You'll see \"ghost\"\n#   upvotes. Writes go behind POST + CSRF, always.\nfrom django.utils import timezone"
                  }
        ],
        tips: [
                  "Use `get_object_or_404()` to raise 404 if object not found.",
                  "`@login_required` redirects unauthenticated users to login.",
                  "Always check `request.method` to handle GET vs POST differently."
        ],
        mistake: "Mixing business logic with view code; move to models or services.",
        shorthand: {
          verbose: "def list_posts(request):\n    posts = Post.objects.filter(is_published=True)\n    context = {\"posts\": posts}\n    return render(request, \"posts/list.html\", context)\n\ndef single_post(request, pk):\n    post = Post.objects.get(id=pk)\n    return render(request, \"posts/detail.html\", {\"post\": post})",
          concise: "def list_posts(request):\n    return render(request, \"posts/list.html\", {\"posts\": Post.objects.filter(is_published=True)})\n\ndef single_post(request, pk):\n    return render(request, \"posts/detail.html\", {\"post\": get_object_or_404(Post, id=pk)})",
        },
      },
      {
        id: "django-class-based-views",
        fn: "ListView, DetailView, CreateView",
        desc: "Use class-based views for common patterns like listing, detail, create, update.",
        category: "Django",
        subtitle: "Generic CBVs, model mapping, context",
        signature: "ListView  |  DetailView  |  CreateView  |  UpdateView  |  DeleteView",
        descLong: "Class-based views (CBVs) provide reusable patterns for CRUD operations. Django includes generic views like `ListView` (list objects), `DetailView` (show one), `CreateView` (form + create), `UpdateView` (form + update), and `DeleteView` (delete with confirmation).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ListView, DetailView, CreateView — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom django.views.generic import ListView, DetailView\nfrom .models import Post\nclass PostListView(ListView):\n    model = Post\n    template_name = \"posts/post_list.html\"\nclass PostDetailView(DetailView):\n    model = Post\n    template_name = \"posts/post_detail.html\"\n# urls.py\n# path(\"\",                PostListView.as_view(),   name=\"post_list\"),\n# path(\"<int:pk>/\",       PostDetailView.as_view(), name=\"post_detail\"),"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ListView, DetailView, CreateView — common patterns you'll see in production.\n# APPROACH  - Combine ListView, DetailView, CreateView with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django.contrib.auth.mixins import LoginRequiredMixin\nfrom django.urls import reverse_lazy\nfrom django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView\nfrom .models import Post\nclass PostListView(ListView):\n    model = Post\n    template_name = \"posts/post_list.html\"\n    context_object_name = \"posts\"\n    paginate_by = 10                                 # Django paginates for free\n    def get_queryset(self):                          # narrow + order\n        return (Post.objects\n                    .filter(is_published=True)\n                    .select_related(\"author\")        # avoid N+1 in the template\n                    .order_by(\"-published_date\"))\nclass PostDetailView(DetailView):\n    model = Post\n    template_name = \"posts/post_detail.html\"\nclass PostCreateView(LoginRequiredMixin, CreateView):\n    model = Post\n    fields = [\"title\", \"content\"]\n    success_url = reverse_lazy(\"post_list\")\n    def form_valid(self, form):\n        form.instance.author = self.request.user     # inject author from request\n        return super().form_valid(form)\nclass PostUpdateView(LoginRequiredMixin, UpdateView):\n    model = Post\n    fields = [\"title\", \"content\", \"is_published\"]\n    success_url = reverse_lazy(\"post_list\")\nclass PostDeleteView(LoginRequiredMixin, DeleteView):\n    model = Post\n    success_url = reverse_lazy(\"post_list\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ListView, DetailView, CreateView — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin\nfrom django.urls import reverse_lazy\nfrom django.views.generic import UpdateView, DeleteView, ListView\nfrom django.views.generic.edit import FormView\nfrom .models import Post\n# 1) Mixin for object-level authorization — reused by Update/Delete\nclass AuthorOnlyMixin(LoginRequiredMixin, UserPassesTestMixin):\n    def test_func(self):\n        # self.get_object() returns the model instance from the URL pk/slug\n        return self.get_object().author_id == self.request.user.id\nclass PostUpdateView(AuthorOnlyMixin, UpdateView):\n    model = Post\n    fields = [\"title\", \"content\", \"is_published\"]\n    success_url = reverse_lazy(\"post_list\")\n    def form_valid(self, form):\n        # Save with update_fields so we don't overwrite columns we never edited\n        form.instance.updated_by = self.request.user\n        return super().form_valid(form)\nclass PostDeleteView(AuthorOnlyMixin, DeleteView):\n    model = Post\n    success_url = reverse_lazy(\"post_list\")\n# 2) Custom queryset + extra context — common pattern for filter UIs\nclass PublishedPostList(ListView):\n    template_name = \"posts/post_list.html\"\n    paginate_by   = 25\n    def get_queryset(self):\n        qs = Post.objects.filter(is_published=True).select_related(\"author\")\n        if (q := self.request.GET.get(\"q\")):\n            qs = qs.filter(title__icontains=q)\n        return qs\n    def get_context_data(self, **kw):\n        ctx = super().get_context_data(**kw)\n        ctx[\"q\"] = self.request.GET.get(\"q\", \"\")     # keep the query in the template\n        return ctx\n# 3) FormView for non-model forms (contact, search, password reset workflows)\nclass ContactFormView(FormView):\n    template_name = \"contact.html\"\n    form_class    = ContactForm                      # defined in forms.py\n    success_url   = reverse_lazy(\"contact_thanks\")\n    def form_valid(self, form):\n        send_email(form.cleaned_data)                # business action\n        return super().form_valid(form)\n# Decision rule:\n#   pure CRUD on a model               -> generic CBVs (List/Detail/Create/Update/Delete)\n#   non-model form                       -> FormView (handles GET shape + POST submit)\n#   one custom action on a row           -> FBV with @require_POST (lighter than CBV)\n#   shared auth / permission rule         -> mixin, applied to multiple CBVs\n#   complex multi-step flow                -> django-formtools wizard, not nested CBVs\n#\n# Anti-pattern: subclassing UpdateView and rewriting get/post in full\n#   You've thrown away every advantage. If you need that much control, drop to a\n#   FBV — it's clearer than fighting the CBV machinery.\nclass ContactForm: pass\ndef send_email(_): pass"
                  }
        ],
        tips: [
                  "Use `LoginRequiredMixin` to protect views; redirect unauthenticated users.",
                  "`paginate_by` enables automatic pagination on ListView.",
                  "Override `get_queryset()` to customize filtering."
        ],
        mistake: "Overriding `get_success_url()` when `success_url` is simpler.",
        shorthand: {
          verbose: "class PostListView(ListView):\n    model = Post\n    template_name = \"posts/list.html\"\n    context_object_name = \"posts\"\n    paginate_by = 10\n\nclass PostDetailView(DetailView):\n    model = Post\n    template_name = \"posts/detail.html\"\n    context_object_name = \"post\"",
          concise: "class PostListView(ListView):\n    model = Post\n    paginate_by = 10\n\nclass PostDetailView(DetailView):\n    model = Post",
        },
      },
      {
        id: "django-forms",
        fn: "forms.Form, forms.ModelForm",
        desc: "Build and validate forms with Django forms for data validation and rendering.",
        category: "Django",
        subtitle: "Form fields, validation, cleaned_data, ModelForm",
        signature: "class Form(forms.Form):  |  form.is_valid()  |  form.cleaned_data  |  ModelForm",
        descLong: "Django forms handle rendering, validation, and CSRF protection. Inherit from `forms.Form` for custom forms, or `forms.ModelForm` to auto-generate from models. Validate with `form.is_valid()`, and access cleaned data with `form.cleaned_data`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of forms.Form, forms.ModelForm — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom django import forms\nfrom django.shortcuts import render, redirect\nclass ContactForm(forms.Form):\n    name    = forms.CharField(max_length=100)\n    email   = forms.EmailField()\n    message = forms.CharField(widget=forms.Textarea)\ndef contact(request):\n    form = ContactForm(request.POST or None)\n    if request.method == \"POST\" and form.is_valid():\n        # form.cleaned_data is a dict of validated, type-coerced values\n        return redirect(\"contact_thanks\")\n    return render(request, \"contact.html\", {\"form\": form})\n# templates/contact.html\n# <form method=\"post\">{% csrf_token %}{{ form.as_p }}<button>Send</button></form>"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of forms.Form, forms.ModelForm — common patterns you'll see in production.\n# APPROACH  - Combine forms.Form, forms.ModelForm with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django import forms\nfrom .models import Post\nclass PostForm(forms.ModelForm):\n    class Meta:\n        model   = Post\n        fields  = [\"title\", \"content\", \"is_published\"]\n        widgets = {\n            \"content\": forms.Textarea(attrs={\"rows\": 6, \"class\": \"prose\"}),\n        }\n        labels = {\"title\": \"Post title\"}\n    # 1) Per-field cleaner — runs after the field's built-in validators\n    def clean_title(self):\n        title = self.cleaned_data[\"title\"].strip()\n        if len(title) < 5:\n            raise forms.ValidationError(\"Title must be at least 5 characters.\")\n        return title\n    # 2) Cross-field validation — runs after every clean_<f>\n    def clean(self):\n        cleaned = super().clean()\n        if cleaned.get(\"is_published\") and len(cleaned.get(\"content\", \"\")) < 50:\n            self.add_error(\"content\", \"Published posts need at least 50 characters.\")\n        return cleaned\n# View pattern (use form.save(commit=False) when you need to inject extra fields)\ndef create_post(request):\n    form = PostForm(request.POST or None)\n    if form.is_valid():\n        post = form.save(commit=False)\n        post.author = request.user\n        post.save()\n        return redirect(\"post_detail\", pk=post.pk)\n    return render(request, \"posts/form.html\", {\"form\": form})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of forms.Form, forms.ModelForm — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django import forms\nfrom django.forms import inlineformset_factory\nfrom django.core.exceptions import ValidationError\nfrom .models import Post, Tag, Attachment\n# 1) NEVER trust the request — fields-only is mandatory on ModelForm.\n#    Without 'fields' or 'exclude' Django refuses to build the form (since 1.6+).\nclass PostForm(forms.ModelForm):\n    class Meta:\n        model  = Post\n        fields = [\"title\", \"content\", \"is_published\"]    # <-- explicit allowlist\n# 2) File / image uploads — content-type spoofing is trivial, validate magic bytes\nALLOWED_IMG = {\"image/png\", \"image/jpeg\", \"image/webp\"}\nMAX_BYTES   = 5 * 1024 * 1024\nclass AttachmentForm(forms.ModelForm):\n    class Meta:\n        model  = Attachment\n        fields = [\"file\"]\n    def clean_file(self):\n        f = self.cleaned_data[\"file\"]\n        if f.size > MAX_BYTES:\n            raise ValidationError(\"File too large.\")\n        if f.content_type not in ALLOWED_IMG:\n            raise ValidationError(\"Unsupported file type.\")\n        return f\n# 3) Inline formset for \"post + many tags on one screen\"\nTagFormSet = inlineformset_factory(\n    parent_model=Post, model=Tag, fields=[\"name\"],\n    extra=1, can_delete=True, max_num=20,           # cap to prevent abuse\n)\ndef edit_post_with_tags(request, pk):\n    post = Post.objects.get(pk=pk)\n    if request.method == \"POST\":\n        form     = PostForm(request.POST, instance=post)\n        formset  = TagFormSet(request.POST, instance=post)\n        if form.is_valid() and formset.is_valid():\n            form.save()\n            formset.save()                          # creates / updates / deletes in one go\n            return redirect(\"post_detail\", pk=post.pk)\n    else:\n        form     = PostForm(instance=post)\n        formset  = TagFormSet(instance=post)\n    return render(request, \"posts/edit.html\", {\"form\": form, \"formset\": formset})\n# 4) ALWAYS render forms inside a {% csrf_token %} block. Without it, Django\n#    rejects the POST with 403 — that's a feature.\n# Decision rule:\n#   one form, model-backed              -> ModelForm\n#   form not tied to a model            -> forms.Form\n#   parent + N children on one page     -> inlineformset_factory\n#   per-field rule                       -> clean_<field>\n#   cross-field rule                     -> clean()\n#   server-side trust boundary           -> Meta.fields = explicit allowlist (NEVER __all__)\n#\n# Anti-pattern: Meta.fields = \"__all__\" on a model with sensitive fields\n#   (is_admin, balance, role, password_hash). A user POSTs them with values you\n#   never intended to expose. Always allowlist with a fixed fields tuple."
                  }
        ],
        tips: [
                  "Always include `{% csrf_token %}` in POST forms.",
                  "Use `form.cleaned_data` after `is_valid()` to access validated data.",
                  "Override `clean_<field>()` for field-specific validation.",
                  "On a `ModelForm` always allowlist `Meta.fields` with an explicit tuple — `Meta.fields = \"__all__\"` lets a user POST `is_admin`, `role`, `password_hash`, and other sensitive fields you never intended to expose",
                  "Cross-field rules go in `clean()`; per-field rules go in `clean_<field>()` — both run only after `is_valid()`"
        ],
        mistake: "Accessing `request.POST` directly without form validation.",
        shorthand: {
          verbose: "class ContactForm(forms.Form):\n    name = forms.CharField(max_length=100, required=True)\n    email = forms.EmailField(required=True)\n    message = forms.CharField(widget=forms.Textarea, required=True)\n\n    def clean(self):\n        cleaned_data = super().clean()\n        return cleaned_data",
          concise: "class ContactForm(forms.Form):\n    name = forms.CharField(max_length=100)\n    email = forms.EmailField()\n    message = forms.CharField(widget=forms.Textarea)",
        },
      },
      {
        id: "django-admin",
        fn: "admin.site.register, ModelAdmin",
        desc: "Register models in Django admin and customize the admin interface.",
        category: "Django",
        subtitle: "Admin registration, list display, search, filtering",
        signature: "admin.site.register(Model)  |  class ModelAdmin(admin.ModelAdmin)",
        descLong: "Django's admin interface provides CRUD for models. Register models with `admin.site.register()`, and customize with `ModelAdmin` options like `list_display`, `search_fields`, `list_filter`, and `fieldsets`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of admin.site.register, ModelAdmin — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom django.contrib import admin\nfrom .models import Author, Post\nadmin.site.register(Author)\nadmin.site.register(Post)\n# $ python manage.py createsuperuser\n# $ python manage.py runserver\n# Browse to /admin/"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of admin.site.register, ModelAdmin — common patterns you'll see in production.\n# APPROACH  - Combine admin.site.register, ModelAdmin with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom django.contrib import admin\nfrom .models import Post, Author\n@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n    list_display   = (\"title\", \"author\", \"published_date\", \"is_published\")\n    list_filter    = (\"is_published\", \"published_date\")\n    search_fields  = (\"title\", \"author__name\", \"content\")          # __ traverses FK\n    list_select_related = (\"author\",)                              # avoids N+1 in list view\n    readonly_fields = (\"created_at\",)\n    fieldsets = (\n        (\"Content\",  {\"fields\": (\"title\", \"content\")}),\n        (\"Metadata\", {\"fields\": (\"author\", \"is_published\", \"published_date\", \"created_at\"),\n                      \"classes\": (\"collapse\",)}),\n    )\n@admin.register(Author)\nclass AuthorAdmin(admin.ModelAdmin):\n    list_display  = (\"name\", \"email\")\n    search_fields = (\"name\", \"email\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of admin.site.register, ModelAdmin — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom django.contrib import admin, messages\nfrom django.db.models import Count\nfrom .models import Author, Post, Comment\n# 1) Inline editing — edit Comments directly on the Post change page\nclass CommentInline(admin.TabularInline):\n    model           = Comment\n    extra           = 0                                # don't show 3 empty rows\n    raw_id_fields   = (\"user\",)                        # FK with millions of rows? -> raw_id\n    autocomplete_fields = (\"user\",)                    # autocomplete needs search_fields on UserAdmin\n    show_change_link = True\n# 2) Bulk action: mark selected posts as published in one SQL UPDATE\n@admin.action(description=\"Publish selected posts\")\ndef publish_posts(modeladmin, request, queryset):\n    n = queryset.update(is_published=True)             # bulk update — no per-row save()\n    messages.success(request, f\"Published {n} posts.\")\n# 3) Custom column from an annotated query — keeps the list view fast\n@admin.register(Author)\nclass AuthorAdmin(admin.ModelAdmin):\n    list_display    = (\"name\", \"email\", \"post_count\")\n    search_fields   = (\"name\", \"email\")                 # required by autocomplete_fields above\n    def get_queryset(self, request):\n        return super().get_queryset(request).annotate(_post_count=Count(\"posts\"))\n    @admin.display(ordering=\"_post_count\", description=\"Posts\")\n    def post_count(self, obj):\n        return obj._post_count\n# 4) Save-time hooks + per-user filtering\n@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n    list_display   = (\"title\", \"author\", \"is_published\")\n    list_filter    = (\"is_published\",)\n    search_fields  = (\"title\",)\n    inlines        = (CommentInline,)\n    actions        = (publish_posts,)\n    list_select_related = (\"author\",)\n    def save_model(self, request, obj, form, change):\n        if not change:                                  # only on first save\n            obj.author = request.user\n        super().save_model(request, obj, form, change)\n    def get_queryset(self, request):\n        qs = super().get_queryset(request)\n        # Non-superusers only see their own posts\n        return qs if request.user.is_superuser else qs.filter(author=request.user)\n    def has_delete_permission(self, request, obj=None):\n        # Authors can't delete published posts; superusers can\n        if obj and obj.is_published and not request.user.is_superuser:\n            return False\n        return super().has_delete_permission(request, obj)\n# Decision rule:\n#   < 5 fields, no relations           -> admin.site.register(Model) is enough\n#   any list view used daily            -> list_display + list_filter + search_fields\n#   parent/child editing                 -> TabularInline / StackedInline\n#   FK to a huge table                   -> raw_id_fields or autocomplete_fields\n#   one-shot status flip on N rows       -> @admin.action with .update()\n#   per-user data isolation              -> override get_queryset(request)\n#\n# Anti-pattern: looping with .save() in a custom action\n#   for obj in queryset: obj.is_published = True; obj.save()\n#   Triggers N save signals + N round-trips. Use queryset.update(...) — one SQL."
                  }
        ],
        tips: [
                  "Use `@admin.register()` decorator as shorthand for `admin.site.register()`.",
                  "`list_display` controls which fields show in the list view.",
                  "`search_fields` enables admin search; prefix with `^` (starts with) or `=` (exact)."
        ],
        mistake: "Not registering models, leaving them inaccessible in admin.",
        shorthand: {
          verbose: "admin.site.register(Post, PostAdmin)\n\nclass PostAdmin(admin.ModelAdmin):\n    list_display = [\"title\", \"author\", \"published_date\"]\n    list_filter = [\"is_published\"]\n    search_fields = [\"title\"]",
          concise: "@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n    list_display = [\"title\", \"author\", \"published_date\"]\n    list_filter = [\"is_published\"]\n    search_fields = [\"title\"]",
        },
      },
      {
        id: "django-rest-framework",
        fn: "Serializer, APIView, ModelViewSet",
        desc: "Build REST APIs with Django REST Framework using serializers and viewsets.",
        category: "Django",
        subtitle: "Serialization, API views, routers, permissions",
        signature: "Serializer  |  APIView  |  ModelViewSet  |  DefaultRouter",
        descLong: "Django REST Framework (DRF) simplifies building REST APIs. Use `Serializer` to convert models to JSON, `APIView` for custom endpoints, and `ModelViewSet` for automatic CRUD. Register viewsets with `DefaultRouter` for URL generation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Serializer, APIView, ModelViewSet — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom rest_framework import serializers, viewsets, routers\nfrom .models import Post\nclass PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model  = Post\n        fields = [\"id\", \"title\", \"content\"]\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset         = Post.objects.all()\n    serializer_class = PostSerializer\n# urls.py\nrouter = routers.DefaultRouter()\nrouter.register(r\"posts\", PostViewSet)\n# urlpatterns = [path(\"api/\", include(router.urls))]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Serializer, APIView, ModelViewSet — common patterns you'll see in production.\n# APPROACH  - Combine Serializer, APIView, ModelViewSet with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom rest_framework import serializers, viewsets, permissions\nfrom rest_framework.decorators import action\nfrom rest_framework.response import Response\nfrom .models import Post, Author\nclass AuthorSerializer(serializers.ModelSerializer):\n    class Meta:\n        model  = Author\n        fields = [\"id\", \"name\", \"email\"]\nclass PostSerializer(serializers.ModelSerializer):\n    author = AuthorSerializer(read_only=True)            # nested read; write via author_id\n    author_id = serializers.PrimaryKeyRelatedField(\n        queryset=Author.objects.all(), source=\"author\", write_only=True\n    )\n    class Meta:\n        model  = Post\n        fields = [\"id\", \"title\", \"content\", \"author\", \"author_id\",\n                  \"published_date\", \"is_published\"]\nclass PostViewSet(viewsets.ModelViewSet):\n    serializer_class   = PostSerializer\n    permission_classes = [permissions.IsAuthenticatedOrReadOnly]\n    def get_queryset(self):\n        # Anonymous users only see published; authenticated see all\n        qs = Post.objects.select_related(\"author\")\n        if not self.request.user.is_authenticated:\n            qs = qs.filter(is_published=True)\n        return qs\n    @action(detail=True, methods=[\"post\"])               # POST /posts/<pk>/publish/\n    def publish(self, request, pk=None):\n        post = self.get_object()\n        post.is_published = True\n        post.save(update_fields=[\"is_published\"])\n        return Response({\"status\": \"published\"})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Serializer, APIView, ModelViewSet — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom rest_framework import serializers, viewsets, permissions, filters\nfrom rest_framework.throttling import UserRateThrottle\nfrom rest_framework.pagination import PageNumberPagination\nfrom rest_framework.exceptions import ValidationError\nfrom django_filters.rest_framework import DjangoFilterBackend\nfrom .models import Post\n# 1) Validation lives on the serializer — never on the view\nclass PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model  = Post\n        fields = [\"id\", \"title\", \"content\", \"is_published\"]\n        read_only_fields = (\"id\",)\n    def validate_title(self, value):\n        if len(value.strip()) < 5:\n            raise ValidationError(\"Title must be at least 5 characters.\")\n        return value\n    def validate(self, attrs):                          # cross-field\n        if attrs.get(\"is_published\") and len(attrs.get(\"content\", \"\")) < 50:\n            raise ValidationError(\"Published posts need at least 50 characters of content.\")\n        return attrs\n# 2) Object-level permission — table-level grant + row-level ownership check\nclass IsOwnerOrReadOnly(permissions.BasePermission):\n    def has_object_permission(self, request, view, obj):\n        if request.method in permissions.SAFE_METHODS:\n            return True\n        return obj.author_id == request.user.id\n# 3) Throttling per user (guards POST/PATCH from abuse)\nclass WriteThrottle(UserRateThrottle):\n    rate = \"60/min\"\n# 4) Pagination + filtering + ordering — DRF wires these for free\nclass StandardPagination(PageNumberPagination):\n    page_size = 25\n    max_page_size = 200\nclass PostViewSet(viewsets.ModelViewSet):\n    serializer_class   = PostSerializer\n    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]\n    throttle_classes   = [WriteThrottle]\n    pagination_class   = StandardPagination\n    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]\n    filterset_fields   = [\"is_published\", \"author\"]\n    search_fields      = [\"title\", \"content\"]\n    ordering_fields    = [\"published_date\", \"title\"]\n    ordering           = [\"-published_date\"]            # default\n    def get_queryset(self):\n        return Post.objects.select_related(\"author\")\n    def perform_create(self, serializer):                # inject server-side fields\n        serializer.save(author=self.request.user)\n# Decision rule:\n#   simple CRUD on a model              -> ModelViewSet + ModelSerializer\n#   custom verb on a row                 -> @action(detail=True)\n#   list-wide custom action              -> @action(detail=False)\n#   trust boundary on writes             -> validation in serializer.validate*\n#   row-level ownership                  -> custom BasePermission with has_object_permission\n#   complex query with joins             -> override get_queryset; .select_related/.prefetch_related\n#\n# Anti-pattern: putting validation in the view's create() method\n#   The same rule needs to fire on PATCH, custom actions, and bulk endpoints.\n#   Validation goes on the serializer; the view just routes."
                  }
        ],
        tips: [
                  "`ModelViewSet` auto-generates list, create, retrieve, update, delete actions.",
                  "Use `@action()` decorator for custom endpoints.",
                  "`read_only=True` on fields that should not be modified.",
                  "Put validation in `serializer.validate_*` / `validate()` — not in the view's `create()` — so the same rule fires on PATCH, custom @actions, and bulk endpoints",
                  "Row-level ownership belongs in a custom `BasePermission` with `has_object_permission`, not as inline `if obj.user == request.user` in the view"
        ],
        mistake: "Not defining `Meta.fields` on serializers; always specify what to serialize.",
        shorthand: {
          verbose: "class PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Post\n        fields = [\"id\", \"title\", \"content\", \"author\"]\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer",
          concise: "class PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Post\n        fields = \"__all__\"\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer",
        },
      },
    ],
  },

  // ── Section 4: WSGI/ASGI & Deployment ─────────────────────────────────────────
  {
    id: "web-deployment",
    title: "WSGI/ASGI & Deployment",
    entries: [
      {
        id: "gunicorn",
        fn: "gunicorn",
        desc: "Deploy WSGI applications (Flask, Django) with Gunicorn worker processes.",
        category: "Deployment",
        subtitle: "Worker management, binding, reloading",
        signature: "gunicorn app:app  |  gunicorn -w 4 -b 0.0.0.0:8000",
        descLong: "Gunicorn is a WSGI HTTP server that runs Python web applications in production. Specify the number of workers, binding address, and other options. Load balancing across workers handles concurrent requests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of gunicorn — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# app.py\n# from flask import Flask\n# app = Flask(__name__)\n# $ pip install gunicorn\n# $ gunicorn app:app                              # 1 worker, port 8000\n# $ gunicorn -w 4 -b 0.0.0.0:8000 app:app         # 4 workers, all interfaces"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of gunicorn — common patterns you'll see in production.\n# APPROACH  - Combine gunicorn with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# gunicorn_config.py\nimport multiprocessing\nbind         = \"0.0.0.0:8000\"\nworkers      = multiprocessing.cpu_count() * 2 + 1   # CPU-bound rule of thumb\ntimeout      = 30                                    # kill a worker stuck this long\ngraceful_timeout = 30                                # finish in-flight requests on reload\nkeepalive    = 5\naccesslog    = \"-\"                                   # stdout — container friendly\nerrorlog     = \"-\"\nloglevel     = \"info\"\npreload_app  = True                                  # parent imports app; workers fork it (less RAM)\n# $ gunicorn -c gunicorn_config.py app:app\n# Django\n# $ gunicorn -c gunicorn_config.py myproject.wsgi:application"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of gunicorn — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# gunicorn_config.py\nimport multiprocessing, os\n# 1) Worker class — match your workload\n#    sync (default)  -> CPU-bound, simple Flask/Django views\n#    gthread          -> moderate I/O, threads share interpreter (--threads 4)\n#    gevent / eventlet -> high-concurrency I/O (greenlet-based)\n#    uvicorn.workers.UvicornWorker -> ASGI app under Gunicorn\nworker_class = os.getenv(\"GUNICORN_WORKER\", \"gthread\")\nthreads      = int(os.getenv(\"GUNICORN_THREADS\", 4))\n# 2) Worker count: respect container CPU limit, not the host's\ndef cpu_count() -> int:\n    try:                                             # cgroups v2 quota\n        with open(\"/sys/fs/cgroup/cpu.max\") as f:\n            quota, period = f.read().split()\n        if quota != \"max\":\n            return max(1, int(int(quota) / int(period)))\n    except Exception:\n        pass\n    return multiprocessing.cpu_count()\nbind         = \"0.0.0.0:8000\"\nworkers      = int(os.getenv(\"WEB_CONCURRENCY\", cpu_count() * 2 + 1))\ntimeout      = 30\ngraceful_timeout = 30\nkeepalive    = 5\n# 3) Behind a load balancer with TLS termination -> trust the X-Forwarded-* headers.\n#    For Flask/Starlette: use ProxyFix in app code. For Gunicorn-only:\nforwarded_allow_ips = \"*\"                            # only use behind a TRUSTED proxy\n# 4) Probes\n#    Liveness  -> hit /healthz on a route that returns fast\n#    Readiness -> route that checks DB + cache; fail until ready\n# 5) Recycle workers to bound memory leaks from third-party libs\nmax_requests        = 1000\nmax_requests_jitter = 50\n# Decision rule:\n#   sync, CPU-bound (pandas, ML)        -> sync workers, CPU+1 count\n#   I/O-bound, mostly DB                -> gthread, --threads 4-8, fewer workers\n#   high-concurrency websockets / SSE   -> gevent or move to Uvicorn (ASGI)\n#   ASGI app (FastAPI / Starlette)      -> Uvicorn directly, OR gunicorn -k uvicorn.workers.UvicornWorker\n#   memory leaks accumulating           -> max_requests with jitter\n#\n# Anti-pattern: gunicorn --reload in production\n#   File-watcher restart adds latency, fights graceful shutdown, and is a\n#   debugging-only feature. Reload is a deploy concern, not a server flag."
                  }
        ],
        tips: [
                  "Set `workers = cpu_count * 2 + 1` for CPU-bound tasks; reduce for I/O tasks.",
                  "Use `--timeout` to prevent slow requests from hanging (default 30s).",
                  "Log to stdout (`-`) for container-friendly logging."
        ],
        mistake: "Running with `workers=1` in production; use multiple workers for concurrency.",
        shorthand: {
          verbose: "# gunicorn_config.py\nbind = \"0.0.0.0:8000\"\nworkers = 4\ntimeout = 30\naccesslog = \"-\"\n\n# Run\ngunicorn -c gunicorn_config.py app:app",
          concise: "gunicorn -w 4 -b 0.0.0.0:8000 --timeout 30 app:app",
        },
      },
      {
        id: "uvicorn",
        fn: "uvicorn",
        desc: "Deploy ASGI applications (FastAPI, Starlette) with Uvicorn server.",
        category: "Deployment",
        subtitle: "Async server, worker processes, reloading",
        signature: "uvicorn app:app  |  uvicorn -w 4 -h 0.0.0.0 -p 8000",
        descLong: "Uvicorn is an ASGI HTTP server for async Python frameworks. It handles async/await routes natively. Configure workers for production, and use `--reload` during development.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of uvicorn — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# app.py\n# from fastapi import FastAPI\n# app = FastAPI()\n# $ pip install \"uvicorn[standard]\"\n# $ uvicorn app:app --reload                       # dev: auto-reloads on file change"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of uvicorn — common patterns you'll see in production.\n# APPROACH  - Combine uvicorn with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# CLI (preferred for prod)\n# $ uvicorn app:app \\\n#       --host 0.0.0.0 --port 8000 \\\n#       --workers 4 \\\n#       --timeout-keep-alive 5 \\\n#       --log-level info \\\n#       --proxy-headers --forwarded-allow-ips=\"*\"   # behind a load balancer\n# Programmatic (only for dev / debugging — multi-worker via CLI is the norm)\nimport uvicorn\nif __name__ == \"__main__\":\n    uvicorn.run(\n        \"app:app\",\n        host=\"0.0.0.0\",\n        port=8000,\n        reload=False,                                # NEVER True in prod\n        log_level=\"info\",\n    )"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of uvicorn — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) The conventional production stack:\n#       Gunicorn (process supervisor + graceful reload)\n#         └── Uvicorn workers (ASGI runtime)\n#                └── FastAPI app\n#\n#    $ gunicorn app:app \\\n#         -k uvicorn.workers.UvicornWorker \\\n#         -w 4 -b 0.0.0.0:8000 \\\n#         --timeout 30 --graceful-timeout 30 \\\n#         --max-requests 1000 --max-requests-jitter 50 \\\n#         --access-logfile - --error-logfile -\n#\n#    Why: Uvicorn alone restarts hard. Gunicorn supervises workers, drains\n#    connections on reload, and handles SIGHUP / SIGTERM cleanly.\n# 2) Behind a TLS-terminating proxy (nginx, ELB, Cloudflare):\n#       --proxy-headers makes Uvicorn trust X-Forwarded-Proto / X-Forwarded-For\n#       --forwarded-allow-ips=\"<lb-cidrs>\"  — pin to your load balancer\n#    Skip this if Uvicorn faces the public internet directly (it shouldn't).\n# 3) HTTP parser choice:\n#       h11        -> default, pure Python, fine for most loads\n#       httptools  -> C-backed, slightly faster (uvicorn[standard] picks this)\n#    Always install uvicorn[standard] in production; it pulls httptools + uvloop.\n# 4) Worker count for ASGI is NOT the same heuristic as WSGI. Async I/O lets one\n#    worker handle thousands of in-flight requests. Start with 2-4, scale on\n#    measured CPU saturation, not 2*CPU+1 (that rule is for sync workers).\n# Decision rule:\n#   FastAPI / Starlette / async         -> Uvicorn (with httptools + uvloop)\n#   need supervisor + graceful reload    -> Gunicorn -k UvicornWorker\n#   websockets / long-lived connections   -> Uvicorn directly (Gunicorn timeouts hurt)\n#   single-binary deploy                  -> Hypercorn or Granian as alternatives\n#   Windows host                           -> Uvicorn directly; Gunicorn doesn't run on Win\n#\n# Anti-pattern: --workers + --reload together\n#   Reload mode forks a single watcher; --workers is silently ignored. The\n#   server you end up with is single-process. Pick one or the other."
                  }
        ],
        tips: [
                  "Use `--reload` only in development; it watches for file changes.",
                  "Set `workers` for production; defaults to 1.",
                  "`--timeout-keep-alive` controls idle connection timeout."
        ],
        mistake: "Using `--reload` in production (performance impact).",
        shorthand: {
          verbose: "# Development\nuvicorn app:app --reload\n\n# Production\nuvicorn app:app --workers 4 --host 0.0.0.0 --port 8000",
          concise: "uvicorn app:app --reload  # dev\nuvicorn app:app -w 4 -h 0.0.0.0 -p 8000  # prod",
        },
      },
      {
        id: "httpx-client",
        fn: "httpx.AsyncClient",
        desc: "Make asynchronous HTTP requests with httpx for API calls in async apps.",
        category: "Deployment",
        subtitle: "Async HTTP client, request/response, streaming",
        signature: "async with httpx.AsyncClient() as client:  |  await client.get(url)  |  await client.post()",
        descLong: "httpx is a modern HTTP client with both sync and async APIs. Use `AsyncClient` in async contexts for non-blocking I/O. It supports all HTTP methods, timeouts, authentication, and streaming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of httpx.AsyncClient — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport asyncio\nimport httpx\nasync def main():\n    async with httpx.AsyncClient() as client:\n        r = await client.get(\"https://httpbin.org/get\")\n        r.raise_for_status()                       # raise on 4xx/5xx\n        print(r.json())\nasyncio.run(main())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of httpx.AsyncClient — common patterns you'll see in production.\n# APPROACH  - Combine httpx.AsyncClient with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nimport httpx\nTIMEOUT = httpx.Timeout(connect=5.0, read=10.0, write=5.0, pool=5.0)\nasync def fetch_one(client: httpx.AsyncClient, url: str):\n    r = await client.get(url, timeout=TIMEOUT)\n    r.raise_for_status()\n    return r.json()\nasync def fan_out(urls: list[str]):\n    async with httpx.AsyncClient() as client:\n        # gather runs the coroutines concurrently — total time ~ slowest, not sum\n        return await asyncio.gather(*(fetch_one(client, u) for u in urls))\nasync def post_payload():\n    async with httpx.AsyncClient(timeout=TIMEOUT) as client:\n        r = await client.post(\"https://httpbin.org/post\",\n                              json={\"key\": \"value\"},\n                              headers={\"Authorization\": \"Bearer ...\"})\n        return r.status_code\nasync def stream_to_disk(url: str, path: str):\n    async with httpx.AsyncClient() as client:\n        async with client.stream(\"GET\", url) as r:\n            with open(path, \"wb\") as f:\n                async for chunk in r.aiter_bytes():\n                    f.write(chunk)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of httpx.AsyncClient — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio, httpx\nfrom contextlib import asynccontextmanager\nfrom fastapi import FastAPI, Request\n# 1) ONE client per process — shares its connection pool across all requests.\n#    Creating a new AsyncClient per call burns ~30ms on TLS handshake every time.\nLIMITS  = httpx.Limits(max_connections=100, max_keepalive_connections=20)\nTIMEOUT = httpx.Timeout(10.0, connect=5.0)\n# 2) Built-in retry transport — exponential backoff on connect/read errors.\n#    For status-code retries (502/503/504), wrap in your own loop.\nTRANSPORT = httpx.AsyncHTTPTransport(retries=3)\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    app.state.http = httpx.AsyncClient(\n        base_url=\"https://api.upstream.com\",\n        timeout=TIMEOUT,\n        limits=LIMITS,\n        transport=TRANSPORT,\n        headers={\"User-Agent\": \"myservice/1.0\"},\n        http2=True,                              # multiplex over fewer TCP conns\n    )\n    try:\n        yield\n    finally:\n        await app.state.http.aclose()            # MUST close on shutdown\napp = FastAPI(lifespan=lifespan)\n# 3) Use the shared client; never instantiate AsyncClient inside a handler\n@app.get(\"/fetch/{key}\")\nasync def fetch(key: str, request: Request):\n    client: httpx.AsyncClient = request.app.state.http\n    r = await client.get(f\"/items/{key}\")\n    if r.status_code == 404:\n        return {\"item\": None}\n    r.raise_for_status()\n    return r.json()\n# 4) Status-code retry with backoff (httpx doesn't ship one for 5xx)\nasync def get_with_5xx_retry(client, url, attempts=3):\n    delay = 0.5\n    for i in range(attempts):\n        try:\n            r = await client.get(url)\n            if r.status_code < 500:\n                return r\n        except httpx.RequestError:\n            if i == attempts - 1: raise\n        await asyncio.sleep(delay)\n        delay *= 2\n    return r\n# Decision rule:\n#   one-off script, < 10 calls            -> async with httpx.AsyncClient(): ...\n#   service that calls other services      -> ONE long-lived client at app startup\n#   sync code path / Django view           -> httpx.Client (sync) — don't mix loops\n#   need recording for tests                -> respx (httpx) for mocking, vcrpy for replay\n#   gRPC / streaming-heavy                  -> grpc.aio or httpx.AsyncClient with stream()\n#\n# Anti-pattern: forgetting client.aclose()\n#   Connections leak; the OS file-descriptor table fills; new connects start\n#   timing out under load. Use lifespan or async with — never bare instantiation."
                  }
        ],
        tips: [
                  "Always use `async with` to ensure connections are closed.",
                  "Set `timeout=` to prevent hanging on slow APIs.",
                  "Reuse `AsyncClient` connections within the same context for efficiency."
        ],
        mistake: "Creating a new AsyncClient for each request (inefficient).",
        shorthand: {
          verbose: "async def get_data(url: str):\n    client = httpx.AsyncClient()\n    try:\n        response = await client.get(url)\n        return response.json()\n    finally:\n        await client.aclose()",
          concise: "async def get_data(url: str):\n    async with httpx.AsyncClient() as client:\n        return (await client.get(url)).json()",
        },
      },
    ],
  },
]

export default { meta, sections }

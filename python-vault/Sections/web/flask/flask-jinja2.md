---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-jinja2"
title: "render_template()"
category: "Flask"
subtitle: "Template rendering, variables, loops, conditionals"
signature_short: "render_template(\"template.html\", var=value)  |  {{ var }}  |  {% for item in items %}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "render_template()"
  - "flask-jinja2"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# render_template()

> Template rendering, variables, loops, conditionals

## Overview

Flask integrates Jinja2 for server-side HTML rendering. Use `render_template()` to load and populate templates with variables. Templates are stored in a `templates/` directory and support variables, loops, conditionals, filters, and inheritance.

## Signature

```python
render_template("template.html", var=value)  |  {{ var }}  |  {% for item in items %}
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Render one template with two variables
# STRENGTHS - Smallest path from view function to HTML page
# WEAKNESSES- No layout inheritance, no filters, no escaping discussion
#
from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", title="Home", user="Alice")

# templates/index.html
# <h1>{{ title }}</h1>
# <p>Welcome, {{ user }}!</p>
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Loops, conditionals, filters, and template inheritance
# STRENGTHS - The four Jinja features that compose 90% of real templates
# WEAKNESSES- No custom filters, no macros, no autoescape gotchas
#
# templates/base.html
# <!doctype html>
# <html><head><title>{% block title %}Site{% endblock %}</title></head>
# <body>{% block content %}{% endblock %}</body></html>

# templates/users.html
# {% extends "base.html" %}
# {% block title %}Users{% endblock %}
# {% block content %}
#   <ul>
#   {% for u in users %}
#     <li>{{ u.name | upper }} ({{ u.email }})</li>     {# filter chain #}
#   {% else %}
#     <li>No users yet</li>                              {# for-else: empty case #}
#   {% endfor %}
#   </ul>
#   {% if current_user %}
#     <p>Hi, {{ current_user }}.</p>
#   {% endif %}
# {% endblock %}

from flask import Flask, render_template
app = Flask(__name__)

@app.route("/users")
def users():
    return render_template(
        "users.html",
        users=[{"name": "Alice", "email": "a@x.com"},
               {"name": "Bob",   "email": "b@x.com"}],
        current_user="Mike",
    )
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Autoescape, custom filters, render_template_string traps, context processors
# STRENGTHS - Captures the security and DRY rules templating actually demands
# WEAKNESSES- N/A
#
from flask import Flask, render_template, render_template_string, abort
from markupsafe import Markup, escape
app = Flask(__name__)

# 1) Autoescape is ON for .html / .htm / .xml templates BY DEFAULT.
#    {{ user_input }} is safe; html.unsafe stays escaped.
#    Use Markup("...") only when you've sanitized the string yourself.
@app.template_filter("safe_link")
def safe_link(url, label):                       # custom filter usable in templates
    return Markup(f'<a href="{escape(url)}">{escape(label)}</a>')

# 2) NEVER call render_template_string with user input as the template body
@app.get("/render-bad/<text>")
def bad(text):
    # SECURITY: Server-Side Template Injection — attacker controls Jinja syntax.
    return render_template_string(f"<p>{text}</p>")     # DO NOT DO THIS

@app.get("/render-good/<text>")
def good(text):
    # Treat user input as DATA, not template. Pass via context.
    return render_template_string("<p>{{ msg }}</p>", msg=text)

# 3) Context processors — inject variables into EVERY template (e.g., current user)
@app.context_processor
def inject_globals():
    return {"site_name": "Acme", "current_user": getattr_user_from_request()}

# 4) 404 friendly page; reuse the base layout
@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404

# Decision rule:
#   server-rendered pages              -> render_template (autoescape on by default)
#   tiny inline snippet                 -> render_template_string with CONTEXT vars
#   JSON API only                        -> skip Jinja entirely; jsonify(...)
#   marketing site / docs                -> static site generator, not Flask
#   reusable HTML fragments              -> {% include %} or {% macro %} in Jinja
#
# Anti-pattern: turning off autoescape "to make my HTML render"
#   Means you stopped escaping ALL user input. The fix is to wrap the trusted
#   string with Markup(...) on the way in, never to disable autoescape globally.

def getattr_user_from_request(): return None
```

## Decision Rule

```text
server-rendered pages              -> render_template (autoescape on by default)
tiny inline snippet                 -> render_template_string with CONTEXT vars
JSON API only                        -> skip Jinja entirely; jsonify(...)
marketing site / docs                -> static site generator, not Flask
reusable HTML fragments              -> {% include %} or {% macro %} in Jinja
```

## Anti-Pattern

> [!warning] Anti-pattern
> turning off autoescape "to make my HTML render"
>   Means you stopped escaping ALL user input. The fix is to wrap the trusted
>   string with Markup(...) on the way in, never to disable autoescape globally.

## Tips

- Jinja2 variables: `{{ variable }}` for output, `{{ variable | upper }}` for filters.
- Control structures: `{% if condition %}...{% endif %}`, `{% for item in items %}...{% endfor %}`.
- Template inheritance: `{% extends "base.html" %}` for DRY layouts.

## Common Mistake

> [!warning] Forgetting to create a `templates/` folder in the app directory.

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.route("/profile/<name>")
def profile(name):
    user_data = {"name": name, "joined": "2023"}
    html = render_template("profile.html")
    html = html.replace("{{ name }}", user_data["name"])
    html = html.replace("{{ joined }}", user_data["joined"])
    return html
```

**Senior:**
```python
@app.route("/profile/<name>")
def profile(name):
    return render_template("profile.html", name=name, joined="2023")
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

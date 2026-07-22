---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-setup"
title: "django-admin startproject"
category: "Django"
subtitle: "Project initialization, settings, url configuration"
signature_short: "django-admin startproject myproject  |  python manage.py runserver"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "django-admin startproject"
  - "django-setup"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# django-admin startproject

> Project initialization, settings, url configuration

## Overview

A Django project contains apps, each with models, views, and templates. Use `django-admin startproject` to scaffold the project, then `python manage.py startapp` to create apps. Configure databases, installed apps, and middleware in `settings.py`, and map URLs in `urls.py`.

## Signature

```python
django-admin startproject myproject  |  python manage.py runserver
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Scaffold a project, register an app, wire one URL
# STRENGTHS - Smallest path from zero to a running Django server
# WEAKNESSES- SQLite, hardcoded debug settings — not production
#
# $ django-admin startproject myproject
# $ python manage.py startapp myapp

# myproject/settings.py (minimal additions)
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "myapp",                            # don't forget this
]

# myproject/urls.py
from django.contrib import admin
from django.urls import path
from myapp import views
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
]

# $ python manage.py migrate
# $ python manage.py runserver
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Per-app urls.py with include(), env-driven DB config, env-aware DEBUG
# STRENGTHS - The shape every Django app converges on past hello-world
# WEAKNESSES- Single settings file; no per-environment splits yet
#
# myproject/settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]            # NEVER hardcode
DEBUG = os.getenv("DJANGO_DEBUG") == "1"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "myapp",
]

DATABASES = {
    "default": {
        "ENGINE":   "django.db.backends.postgresql",
        "NAME":     os.environ["DB_NAME"],
        "USER":     os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST":     os.getenv("DB_HOST", "localhost"),
        "PORT":     os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": 60,                            # reuse connections
    }
}

# myproject/urls.py
from django.urls import path, include
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("myapp.urls")),               # delegate to per-app routing
]

# myapp/urls.py
from django.urls import path
from . import views
app_name = "myapp"                                     # namespacing for {% url %}
urlpatterns = [
    path("",            views.index,    name="index"),
    path("posts/<int:pk>/", views.post, name="post"),
]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Split settings, django-environ, security headers, ASGI-ready layout
# STRENGTHS - The settings shape that survives staging, prod, and CI together
# WEAKNESSES- N/A
#
# myproject/settings/base.py
import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")               # loads from .env in dev only

SECRET_KEY  = env("DJANGO_SECRET_KEY")
DEBUG       = False                                    # default off; dev.py overrides
DATABASES   = {"default": env.db("DATABASE_URL")}     # parses postgres://user:pw@host/db
INSTALLED_APPS = [...]
MIDDLEWARE  = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# myproject/settings/prod.py
from .base import *
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")
SECURE_SSL_REDIRECT       = True
SESSION_COOKIE_SECURE     = True
CSRF_COOKIE_SECURE        = True
SECURE_HSTS_SECONDS       = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_PROXY_SSL_HEADER   = ("HTTP_X_FORWARDED_PROTO", "https")  # behind a TLS LB

# myproject/settings/dev.py
from .base import *
DEBUG = True
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS += ["django_extensions"]

# Decision rule:
#   single settings.py                   -> only for tutorials / throwaway demos
#   real app                              -> split base/dev/prod, pick via DJANGO_SETTINGS_MODULE
#   secrets                               -> django-environ + .env (dev), real env vars (prod)
#   db connection cost dominating         -> CONN_MAX_AGE=60 OR connection pooler (PgBouncer)
#   serving static / media at scale        -> WhiteNoise (static), S3 (media); not Django's runserver
#
# Anti-pattern: DEBUG = True in production
#   Stack traces leak source code, ALLOWED_HOSTS is bypassed, SECRET_KEY exposure
#   becomes catastrophic. Always set DEBUG via env, default to False in base.py.
```

## Decision Rule

```text
single settings.py                   -> only for tutorials / throwaway demos
real app                              -> split base/dev/prod, pick via DJANGO_SETTINGS_MODULE
secrets                               -> django-environ + .env (dev), real env vars (prod)
db connection cost dominating         -> CONN_MAX_AGE=60 OR connection pooler (PgBouncer)
serving static / media at scale        -> WhiteNoise (static), S3 (media); not Django's runserver
```

## Anti-Pattern

> [!warning] Anti-pattern
> DEBUG = True in production
>   Stack traces leak source code, ALLOWED_HOSTS is bypassed, SECRET_KEY exposure
>   becomes catastrophic. Always set DEBUG via env, default to False in base.py.

## Tips

- Always run migrations after changing models: `python manage.py migrate`.
- Create a superuser for admin access: `python manage.py createsuperuser`.
- Use environment variables for secrets; never hardcode them in settings.py.

## Common Mistake

> [!warning] Forgetting to add your app to `INSTALLED_APPS` after creating it.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Create project
django-admin startproject config .

# Create app
python manage.py startapp accounts

# Add to settings.py INSTALLED_APPS
# "accounts"

# Create tables
python manage.py migrate

# Run server
python manage.py runserver
```

**Senior:**
```python
django-admin startproject config . && python manage.py startapp accounts && python manage.py runserver
```

## See Also

- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

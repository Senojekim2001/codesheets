---
type: "file-index"
domain: "python"
file: "web"
title: "Web (Flask, Django)"
tags:
  - "python"
  - "python/web"
  - "index"
---

# Web (Flask, Django)

> 23 entries across 4 sections.

## Flask · 7

- [[Sections/web/flask/flask-app|Flask()]] — Create and configure a Flask application with basic routing and development server.
- [[Sections/web/flask/flask-routes|@app.route()]] — Define URL routes with path parameters, query strings, and HTTP methods.
- [[Sections/web/flask/flask-request-response|request, jsonify()]] — Access request data (JSON, form) and build responses with proper headers and status codes.
- [[Sections/web/flask/flask-blueprints|Blueprint()]] — Organize routes into reusable modules with Blueprints for larger applications.
- [[Sections/web/flask/flask-jinja2|render_template()]] — Render HTML templates with Jinja2 templating engine and template variables.
- [[Sections/web/flask/flask-sqlalchemy|SQLAlchemy()]] — Use Flask-SQLAlchemy for ORM-based database models and queries.
- [[Sections/web/flask/flask-middleware|@app.before_request, @app.after_request]] — Intercept requests and responses with hooks, and handle errors globally.

## FastAPI · 5

- [[Sections/web/fastapi-web/fastapi-middleware|@app.middleware, CORSMiddleware]] — Add middleware for CORS, custom processing, and request/response interception.
- [[Sections/web/fastapi-web/fastapi-background-tasks|BackgroundTasks]] — Run tasks asynchronously after returning a response to the client.
- [[Sections/web/fastapi-web/fastapi-websockets|@app.websocket()]] — Handle WebSocket connections for real-time bidirectional communication.
- [[Sections/web/fastapi-web/fastapi-auth|OAuth2PasswordBearer, JWT]] — Implement OAuth2 and JWT-based authentication with dependency injection.
- [[Sections/web/fastapi-web/fastapi-testing|TestClient]] — Test FastAPI endpoints using TestClient from httpx.

## Django · 8

- [[Sections/web/django/django-setup|django-admin startproject]] — Create a Django project structure, configure settings, and define URL routing.
- [[Sections/web/django/django-models|models.Model]] — Define database models with fields, relationships, and metadata.
- [[Sections/web/django/django-orm|QuerySet methods]] — Query the database using Django ORM methods like filter, exclude, select_related.
- [[Sections/web/django/django-views|Function-based views]] — Create views as functions that handle requests and return responses.
- [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView]] — Use class-based views for common patterns like listing, detail, create, update.
- [[Sections/web/django/django-forms|forms.Form, forms.ModelForm]] — Build and validate forms with Django forms for data validation and rendering.
- [[Sections/web/django/django-admin|admin.site.register, ModelAdmin]] — Register models in Django admin and customize the admin interface.
- [[Sections/web/django/django-rest-framework|Serializer, APIView, ModelViewSet]] — Build REST APIs with Django REST Framework using serializers and viewsets.

## WSGI/ASGI & Deployment · 3

- [[Sections/web/web-deployment/gunicorn|gunicorn]] — Deploy WSGI applications (Flask, Django) with Gunicorn worker processes.
- [[Sections/web/web-deployment/uvicorn|uvicorn]] — Deploy ASGI applications (FastAPI, Starlette) with Uvicorn server.
- [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient]] — Make asynchronous HTTP requests with httpx for API calls in async apps.

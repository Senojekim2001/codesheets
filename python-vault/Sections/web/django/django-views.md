---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-views"
title: "Function-based views"
category: "Django"
subtitle: "Request/response handling, redirects, context"
signature_short: "def view(request):  |  return HttpResponse()  |  return render()  |  return redirect()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Function-based views"
  - "django-views"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# Function-based views

> Request/response handling, redirects, context

## Overview

Function-based views (FBVs) are Python functions that accept a request object and return a response. Use `render()` for template rendering with context, `redirect()` for redirection, and decorators like `@login_required` for access control.

## Signature

```python
def view(request):  |  return HttpResponse()  |  return render()  |  return redirect()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One view function: query, render template, return response
# STRENGTHS - Smallest valid Django view
# WEAKNESSES- No 404 handling, no method guards, no auth
#
from django.shortcuts import render
from .models import Post

def index(request):
    posts = Post.objects.filter(is_published=True)
    return render(request, "posts/index.html", {"posts": posts})
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - GET vs POST, get_object_or_404, redirects, login_required, JSON endpoint
# STRENGTHS - The four shapes you'll use over and over in real views
# WEAKNESSES- Form parsing is manual; no Django Forms / DRF serializers
#
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Post

@require_http_methods(["GET", "POST"])                  # 405 on anything else
def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)               # raises Http404 cleanly
    if request.method == "POST":
        post.is_published = not post.is_published
        post.save(update_fields=["is_published"])       # only touch what changed
        return redirect("post_detail", pk=post.pk)      # PRG pattern: never re-submit
    return render(request, "posts/detail.html", {"post": post})

@login_required                                         # redirects to LOGIN_URL
def create_post(request):
    if request.method == "POST":
        post = Post.objects.create(
            title=request.POST.get("title", ""),
            content=request.POST.get("content", ""),
            author=request.user,
        )
        return redirect("post_detail", pk=post.pk)
    return render(request, "posts/create.html")

def api_posts(request):
    data = list(Post.objects.values("id", "title", "author__name"))
    return JsonResponse({"posts": data})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - PRG, transactions, permission checks, structured errors, decorator stacking
# STRENGTHS - The view-layer rules that prevent silent data corruption and security bugs
# WEAKNESSES- N/A
#
from django.db import transaction
from django.http import HttpResponseForbidden, JsonResponse, Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages
from .models import Post

# 1) Decorators stack BOTTOM UP. login_required runs FIRST (closest to def).
@require_POST
@login_required
@permission_required("posts.change_post", raise_exception=True)
def publish(request, pk):
    # select_for_update locks the row until the transaction commits — no race
    with transaction.atomic():
        post = get_object_or_404(
            Post.objects.select_for_update(), pk=pk
        )
        # 2) Object-level authorization — has the role, but is this THIS user's post?
        if post.author_id != request.user.id and not request.user.is_staff:
            return HttpResponseForbidden("not your post")

        post.status = "published"
        post.published_at = timezone.now()
        post.save(update_fields=["status", "published_at"])

    messages.success(request, "Post published.")        # one-shot flash messages
    return redirect("post_detail", pk=post.pk)          # POST -> Redirect -> GET (PRG)

# 3) JSON endpoints: stable error contract, never raw exceptions to the wire
@require_http_methods(["GET"])
def api_post(request, pk):
    try:
        post = Post.objects.values("id", "title", "author__name").get(pk=pk)
    except Post.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    return JsonResponse(post)

# Decision rule:
#   pure read view                       -> FBV with @require_GET, no transaction
#   write view                            -> @require_POST + @transaction.atomic + PRG redirect
#   read-modify-write on a row            -> select_for_update inside the transaction
#   form-heavy CRUD                       -> upgrade to a CBV (CreateView/UpdateView)
#   JSON API > 5 endpoints                -> upgrade to Django REST Framework
#
# Anti-pattern: writing on GET
#   def upvote(request, pk):
#       post.likes += 1; post.save()
#   Browser prefetchers, link previewers, and bots all hit GET. You'll see "ghost"
#   upvotes. Writes go behind POST + CSRF, always.

from django.utils import timezone
```

## Decision Rule

```text
pure read view                       -> FBV with @require_GET, no transaction
write view                            -> @require_POST + @transaction.atomic + PRG redirect
read-modify-write on a row            -> select_for_update inside the transaction
form-heavy CRUD                       -> upgrade to a CBV (CreateView/UpdateView)
JSON API > 5 endpoints                -> upgrade to Django REST Framework
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing on GET
>   def upvote(request, pk):
>       post.likes += 1; post.save()
>   Browser prefetchers, link previewers, and bots all hit GET. You'll see "ghost"
>   upvotes. Writes go behind POST + CSRF, always.

## Tips

- Use `get_object_or_404()` to raise 404 if object not found.
- `@login_required` redirects unauthenticated users to login.
- Always check `request.method` to handle GET vs POST differently.

## Common Mistake

> [!warning] Mixing business logic with view code; move to models or services.

## Shorthand (Junior → Senior)

**Junior:**
```python
def list_posts(request):
    posts = Post.objects.filter(is_published=True)
    context = {"posts": posts}
    return render(request, "posts/list.html", context)

def single_post(request, pk):
    post = Post.objects.get(id=pk)
    return render(request, "posts/detail.html", {"post": post})
```

**Senior:**
```python
def list_posts(request):
    return render(request, "posts/list.html", {"posts": Post.objects.filter(is_published=True)})

def single_post(request, pk):
    return render(request, "posts/detail.html", {"post": get_object_or_404(Post, id=pk)})
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

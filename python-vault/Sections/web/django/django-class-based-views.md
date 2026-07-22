---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-class-based-views"
title: "ListView, DetailView, CreateView"
category: "Django"
subtitle: "Generic CBVs, model mapping, context"
signature_short: "ListView  |  DetailView  |  CreateView  |  UpdateView  |  DeleteView"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ListView, DetailView, CreateView"
  - "django-class-based-views"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# ListView, DetailView, CreateView

> Generic CBVs, model mapping, context

## Overview

Class-based views (CBVs) provide reusable patterns for CRUD operations. Django includes generic views like `ListView` (list objects), `DetailView` (show one), `CreateView` (form + create), `UpdateView` (form + update), and `DeleteView` (delete with confirmation).

## Signature

```python
ListView  |  DetailView  |  CreateView  |  UpdateView  |  DeleteView
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ListView and DetailView with model + template name
# STRENGTHS - Two routes, zero view-method code
# WEAKNESSES- Default queryset, no pagination, no auth
#
from django.views.generic import ListView, DetailView
from .models import Post

class PostListView(ListView):
    model = Post
    template_name = "posts/post_list.html"

class PostDetailView(DetailView):
    model = Post
    template_name = "posts/post_detail.html"

# urls.py
# path("",                PostListView.as_view(),   name="post_list"),
# path("<int:pk>/",       PostDetailView.as_view(), name="post_detail"),
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Full CRUD with mixins, custom queryset, form_valid hook
# STRENGTHS - The five generic CBVs that cover most admin-style apps
# WEAKNESSES- Per-object permissions still manual; no UserPassesTest yet
#
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Post

class PostListView(ListView):
    model = Post
    template_name = "posts/post_list.html"
    context_object_name = "posts"
    paginate_by = 10                                 # Django paginates for free

    def get_queryset(self):                          # narrow + order
        return (Post.objects
                    .filter(is_published=True)
                    .select_related("author")        # avoid N+1 in the template
                    .order_by("-published_date"))

class PostDetailView(DetailView):
    model = Post
    template_name = "posts/post_detail.html"

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ["title", "content"]
    success_url = reverse_lazy("post_list")

    def form_valid(self, form):
        form.instance.author = self.request.user     # inject author from request
        return super().form_valid(form)

class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    fields = ["title", "content", "is_published"]
    success_url = reverse_lazy("post_list")

class PostDeleteView(LoginRequiredMixin, DeleteView):
    model = Post
    success_url = reverse_lazy("post_list")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - UserPassesTest, FormView, DRY mixins, get_context_data, dispatch hooks
# STRENGTHS - The CBV idioms that beat both FBVs and copy-pasted boilerplate
# WEAKNESSES- N/A
#
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import UpdateView, DeleteView, ListView
from django.views.generic.edit import FormView
from .models import Post

# 1) Mixin for object-level authorization — reused by Update/Delete
class AuthorOnlyMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        # self.get_object() returns the model instance from the URL pk/slug
        return self.get_object().author_id == self.request.user.id

class PostUpdateView(AuthorOnlyMixin, UpdateView):
    model = Post
    fields = ["title", "content", "is_published"]
    success_url = reverse_lazy("post_list")

    def form_valid(self, form):
        # Save with update_fields so we don't overwrite columns we never edited
        form.instance.updated_by = self.request.user
        return super().form_valid(form)

class PostDeleteView(AuthorOnlyMixin, DeleteView):
    model = Post
    success_url = reverse_lazy("post_list")

# 2) Custom queryset + extra context — common pattern for filter UIs
class PublishedPostList(ListView):
    template_name = "posts/post_list.html"
    paginate_by   = 25

    def get_queryset(self):
        qs = Post.objects.filter(is_published=True).select_related("author")
        if (q := self.request.GET.get("q")):
            qs = qs.filter(title__icontains=q)
        return qs

    def get_context_data(self, **kw):
        ctx = super().get_context_data(**kw)
        ctx["q"] = self.request.GET.get("q", "")     # keep the query in the template
        return ctx

# 3) FormView for non-model forms (contact, search, password reset workflows)
class ContactFormView(FormView):
    template_name = "contact.html"
    form_class    = ContactForm                      # defined in forms.py
    success_url   = reverse_lazy("contact_thanks")

    def form_valid(self, form):
        send_email(form.cleaned_data)                # business action
        return super().form_valid(form)

# Decision rule:
#   pure CRUD on a model               -> generic CBVs (List/Detail/Create/Update/Delete)
#   non-model form                       -> FormView (handles GET shape + POST submit)
#   one custom action on a row           -> FBV with @require_POST (lighter than CBV)
#   shared auth / permission rule         -> mixin, applied to multiple CBVs
#   complex multi-step flow                -> django-formtools wizard, not nested CBVs
#
# Anti-pattern: subclassing UpdateView and rewriting get/post in full
#   You've thrown away every advantage. If you need that much control, drop to a
#   FBV — it's clearer than fighting the CBV machinery.

class ContactForm: pass
def send_email(_): pass
```

## Decision Rule

```text
pure CRUD on a model               -> generic CBVs (List/Detail/Create/Update/Delete)
non-model form                       -> FormView (handles GET shape + POST submit)
one custom action on a row           -> FBV with @require_POST (lighter than CBV)
shared auth / permission rule         -> mixin, applied to multiple CBVs
complex multi-step flow                -> django-formtools wizard, not nested CBVs
```

## Anti-Pattern

> [!warning] Anti-pattern
> subclassing UpdateView and rewriting get/post in full
>   You've thrown away every advantage. If you need that much control, drop to a
>   FBV — it's clearer than fighting the CBV machinery.

## Tips

- Use `LoginRequiredMixin` to protect views; redirect unauthenticated users.
- `paginate_by` enables automatic pagination on ListView.
- Override `get_queryset()` to customize filtering.

## Common Mistake

> [!warning] Overriding `get_success_url()` when `success_url` is simpler.

## Shorthand (Junior → Senior)

**Junior:**
```python
class PostListView(ListView):
    model = Post
    template_name = "posts/list.html"
    context_object_name = "posts"
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
    template_name = "posts/detail.html"
    context_object_name = "post"
```

**Senior:**
```python
class PostListView(ListView):
    model = Post
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

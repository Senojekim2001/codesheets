---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-admin"
title: "admin.site.register, ModelAdmin"
category: "Django"
subtitle: "Admin registration, list display, search, filtering"
signature_short: "admin.site.register(Model)  |  class ModelAdmin(admin.ModelAdmin)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "admin.site.register, ModelAdmin"
  - "django-admin"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# admin.site.register, ModelAdmin

> Admin registration, list display, search, filtering

## Overview

Django's admin interface provides CRUD for models. Register models with `admin.site.register()`, and customize with `ModelAdmin` options like `list_display`, `search_fields`, `list_filter`, and `fieldsets`.

## Signature

```python
admin.site.register(Model)  |  class ModelAdmin(admin.ModelAdmin)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One-liner registration to expose a model in the admin
# STRENGTHS - Smallest path to a working CRUD UI
# WEAKNESSES- Default fields, no filters, no search
#
from django.contrib import admin
from .models import Author, Post

admin.site.register(Author)
admin.site.register(Post)

# $ python manage.py createsuperuser
# $ python manage.py runserver
# Browse to /admin/
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - @admin.register, list_display, list_filter, search_fields, fieldsets
# STRENGTHS - The four knobs that turn the admin into a usable list view
# WEAKNESSES- No actions, no inline editing, no annotated columns
#
from django.contrib import admin
from .models import Post, Author

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display   = ("title", "author", "published_date", "is_published")
    list_filter    = ("is_published", "published_date")
    search_fields  = ("title", "author__name", "content")          # __ traverses FK
    list_select_related = ("author",)                              # avoids N+1 in list view
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Content",  {"fields": ("title", "content")}),
        ("Metadata", {"fields": ("author", "is_published", "published_date", "created_at"),
                      "classes": ("collapse",)}),
    )

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display  = ("name", "email")
    search_fields = ("name", "email")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Inlines, custom actions, annotated counts, raw_id, security guards
# STRENGTHS - The patterns that make the admin a real ops tool, not a toy
# WEAKNESSES- N/A
#
from django.contrib import admin, messages
from django.db.models import Count
from .models import Author, Post, Comment

# 1) Inline editing — edit Comments directly on the Post change page
class CommentInline(admin.TabularInline):
    model           = Comment
    extra           = 0                                # don't show 3 empty rows
    raw_id_fields   = ("user",)                        # FK with millions of rows? -> raw_id
    autocomplete_fields = ("user",)                    # autocomplete needs search_fields on UserAdmin
    show_change_link = True

# 2) Bulk action: mark selected posts as published in one SQL UPDATE
@admin.action(description="Publish selected posts")
def publish_posts(modeladmin, request, queryset):
    n = queryset.update(is_published=True)             # bulk update — no per-row save()
    messages.success(request, f"Published {n} posts.")

# 3) Custom column from an annotated query — keeps the list view fast
@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display    = ("name", "email", "post_count")
    search_fields   = ("name", "email")                 # required by autocomplete_fields above

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_post_count=Count("posts"))

    @admin.display(ordering="_post_count", description="Posts")
    def post_count(self, obj):
        return obj._post_count

# 4) Save-time hooks + per-user filtering
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display   = ("title", "author", "is_published")
    list_filter    = ("is_published",)
    search_fields  = ("title",)
    inlines        = (CommentInline,)
    actions        = (publish_posts,)
    list_select_related = ("author",)

    def save_model(self, request, obj, form, change):
        if not change:                                  # only on first save
            obj.author = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Non-superusers only see their own posts
        return qs if request.user.is_superuser else qs.filter(author=request.user)

    def has_delete_permission(self, request, obj=None):
        # Authors can't delete published posts; superusers can
        if obj and obj.is_published and not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)

# Decision rule:
#   < 5 fields, no relations           -> admin.site.register(Model) is enough
#   any list view used daily            -> list_display + list_filter + search_fields
#   parent/child editing                 -> TabularInline / StackedInline
#   FK to a huge table                   -> raw_id_fields or autocomplete_fields
#   one-shot status flip on N rows       -> @admin.action with .update()
#   per-user data isolation              -> override get_queryset(request)
#
# Anti-pattern: looping with .save() in a custom action
#   for obj in queryset: obj.is_published = True; obj.save()
#   Triggers N save signals + N round-trips. Use queryset.update(...) — one SQL.
```

## Decision Rule

```text
< 5 fields, no relations           -> admin.site.register(Model) is enough
any list view used daily            -> list_display + list_filter + search_fields
parent/child editing                 -> TabularInline / StackedInline
FK to a huge table                   -> raw_id_fields or autocomplete_fields
one-shot status flip on N rows       -> @admin.action with .update()
per-user data isolation              -> override get_queryset(request)
```

## Anti-Pattern

> [!warning] Anti-pattern
> looping with .save() in a custom action
>   for obj in queryset: obj.is_published = True; obj.save()
>   Triggers N save signals + N round-trips. Use queryset.update(...) — one SQL.

## Tips

- Use `@admin.register()` decorator as shorthand for `admin.site.register()`.
- `list_display` controls which fields show in the list view.
- `search_fields` enables admin search; prefix with `^` (starts with) or `=` (exact).

## Common Mistake

> [!warning] Not registering models, leaving them inaccessible in admin.

## Shorthand (Junior → Senior)

**Junior:**
```python
admin.site.register(Post, PostAdmin)

class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "published_date"]
    list_filter = ["is_published"]
    search_fields = ["title"]
```

**Senior:**
```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "published_date"]
    list_filter = ["is_published"]
    search_fields = ["title"]
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

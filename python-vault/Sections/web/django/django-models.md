---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-models"
title: "models.Model"
category: "Django"
subtitle: "Model fields, relationships, Meta options, __str__"
signature_short: "class Model(models.Model):  |  models.CharField  |  models.ForeignKey  |  class Meta"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "models.Model"
  - "django-models"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# models.Model

> Model fields, relationships, Meta options, __str__

## Overview

Django models map Python classes to database tables. Define fields with types like `CharField`, `IntegerField`, `DateTimeField`. Use `ForeignKey` for relationships, and the `Meta` class for options like ordering and permissions.

## Signature

```python
class Model(models.Model):  |  models.CharField  |  models.ForeignKey  |  class Meta
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Single model with a few common field types and __str__
# STRENGTHS - Smallest valid model that migrates and renders in admin
# WEAKNESSES- No relationships, no indexes, no constraints
#
from django.db import models

class Author(models.Model):
    name       = models.CharField(max_length=100)
    email      = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# $ python manage.py makemigrations
# $ python manage.py migrate
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two related models, Meta options, indexes, related_name
# STRENGTHS - Real relational shape, deliberate on_delete and ordering choices
# WEAKNESSES- No constraints (UniqueConstraint, CheckConstraint), no custom managers
#
from django.db import models
from django.utils import timezone

class Author(models.Model):
    name       = models.CharField(max_length=100)
    email      = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]                  # default order in queries

    def __str__(self):
        return self.name

class Post(models.Model):
    title          = models.CharField(max_length=200)
    content        = models.TextField()
    # CASCADE: deleting an author deletes their posts.
    # PROTECT:  refuse the delete if posts exist (use for accounting / audit).
    # SET_NULL: keep posts, set author=None (requires null=True).
    author         = models.ForeignKey(Author, on_delete=models.CASCADE,
                                       related_name="posts")
    published_date = models.DateTimeField(default=timezone.now)
    is_published   = models.BooleanField(default=False)

    class Meta:
        ordering = ["-published_date"]
        indexes  = [
            models.Index(fields=["author", "-published_date"]),   # supports the common query
        ]

    def __str__(self):
        return self.title
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Constraints, custom managers, abstract base, soft delete, choices class
# STRENGTHS - The shape that scales: enforced invariants, reusable querysets, audit fields
# WEAKNESSES- N/A
#
from django.db import models
from django.db.models import Q, F
from django.utils import timezone

# 1) Abstract base for audit fields — every model inherits created/updated/deleted_at
class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)   # soft delete

    class Meta:
        abstract = True                              # not its own table

# 2) Enum-style choices via a TextChoices class — no magic strings
class PostStatus(models.TextChoices):
    DRAFT     = "draft",     "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED  = "archived",  "Archived"

# 3) Custom manager + queryset — encapsulate the "alive + published" rule
class PostQuerySet(models.QuerySet):
    def alive(self):     return self.filter(deleted_at__isnull=True)
    def published(self): return self.alive().filter(status=PostStatus.PUBLISHED)

class PostManager(models.Manager.from_queryset(PostQuerySet)):
    pass

class Post(TimestampedModel):
    title    = models.CharField(max_length=200)
    slug     = models.SlugField(max_length=220, unique=True)
    content  = models.TextField()
    status   = models.CharField(max_length=16, choices=PostStatus.choices,
                                default=PostStatus.DRAFT)
    author   = models.ForeignKey("Author", on_delete=models.PROTECT,
                                 related_name="posts")
    published_at = models.DateTimeField(null=True, blank=True)

    objects = PostManager()

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes  = [
            models.Index(fields=["status", "-published_at"]),
        ]
        constraints = [
            # A published post MUST have a publish timestamp — enforced at the DB
            models.CheckConstraint(
                check=Q(status="draft") | Q(published_at__isnull=False),
                name="post_published_requires_timestamp",
            ),
            # Per-author title uniqueness enforced once, at the schema level
            models.UniqueConstraint(fields=["author", "title"], name="unique_post_per_author"),
        ]

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])

# Decision rule:
#   bool / status field with > 2 states     -> TextChoices, never raw strings
#   "should never happen at DB level"        -> CheckConstraint / UniqueConstraint, not just clean()
#   reverse-cascade actually wanted          -> on_delete=CASCADE (forum posts on user delete)
#   reverse-cascade is dangerous              -> on_delete=PROTECT (orders, audit logs)
#   shared timestamps / soft delete           -> abstract base model + custom manager
#   filter that's used everywhere             -> custom QuerySet method, not repeated .filter() calls
#
# Anti-pattern: enforcing invariants only in clean() / forms
#   Bulk updates, raw SQL, and migrations bypass model.clean(). Constraints in
#   Meta.constraints run at the DATABASE level — they can't be skipped.
```

## Decision Rule

```text
bool / status field with > 2 states     -> TextChoices, never raw strings
"should never happen at DB level"        -> CheckConstraint / UniqueConstraint, not just clean()
reverse-cascade actually wanted          -> on_delete=CASCADE (forum posts on user delete)
reverse-cascade is dangerous              -> on_delete=PROTECT (orders, audit logs)
shared timestamps / soft delete           -> abstract base model + custom manager
filter that's used everywhere             -> custom QuerySet method, not repeated .filter() calls
```

## Anti-Pattern

> [!warning] Anti-pattern
> enforcing invariants only in clean() / forms
>   Bulk updates, raw SQL, and migrations bypass model.clean(). Constraints in
>   Meta.constraints run at the DATABASE level — they can't be skipped.

## Tips

- `auto_now_add=True` sets the timestamp when the record is created; `auto_now=True` updates on every save.
- Use `related_name` on ForeignKey to access reverse relationships: `author.posts.all()`.
- Always define `__str__()` for meaningful object representation in admin and shell.

## Common Mistake

> [!warning] Using `on_delete=models.PROTECT` without handling orphaned records.

## Shorthand (Junior → Senior)

**Junior:**
```python
class User(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Post(models.Model):
    title = models.CharField(max_length=200)
    author_id = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
```

**Senior:**
```python
class User(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField()

    def __str__(self): return self.username

class Post(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

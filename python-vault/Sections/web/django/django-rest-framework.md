---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-rest-framework"
title: "Serializer, APIView, ModelViewSet"
category: "Django"
subtitle: "Serialization, API views, routers, permissions"
signature_short: "Serializer  |  APIView  |  ModelViewSet  |  DefaultRouter"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Serializer, APIView, ModelViewSet"
  - "django-rest-framework"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# Serializer, APIView, ModelViewSet

> Serialization, API views, routers, permissions

## Overview

Django REST Framework (DRF) simplifies building REST APIs. Use `Serializer` to convert models to JSON, `APIView` for custom endpoints, and `ModelViewSet` for automatic CRUD. Register viewsets with `DefaultRouter` for URL generation.

## Signature

```python
Serializer  |  APIView  |  ModelViewSet  |  DefaultRouter
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One ModelSerializer + ModelViewSet + DefaultRouter
# STRENGTHS - The full CRUD API in 15 lines
# WEAKNESSES- No auth, no permissions, no pagination
#
from rest_framework import serializers, viewsets, routers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Post
        fields = ["id", "title", "content"]

class PostViewSet(viewsets.ModelViewSet):
    queryset         = Post.objects.all()
    serializer_class = PostSerializer

# urls.py
router = routers.DefaultRouter()
router.register(r"posts", PostViewSet)
# urlpatterns = [path("api/", include(router.urls))]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Nested serializer, custom action, queryset narrowing, permissions
# STRENGTHS - The four DRF features you'll touch on every project
# WEAKNESSES- No filtering backend, no throttling
#
from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Author

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Author
        fields = ["id", "name", "email"]

class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)            # nested read; write via author_id
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), source="author", write_only=True
    )

    class Meta:
        model  = Post
        fields = ["id", "title", "content", "author", "author_id",
                  "published_date", "is_published"]

class PostViewSet(viewsets.ModelViewSet):
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Anonymous users only see published; authenticated see all
        qs = Post.objects.select_related("author")
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_published=True)
        return qs

    @action(detail=True, methods=["post"])               # POST /posts/<pk>/publish/
    def publish(self, request, pk=None):
        post = self.get_object()
        post.is_published = True
        post.save(update_fields=["is_published"])
        return Response({"status": "published"})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Object-level perms, validation, throttling, filtering, pagination, nested writes
# STRENGTHS - The hardening that keeps a DRF API safe and predictable under real load
# WEAKNESSES- N/A
#
from rest_framework import serializers, viewsets, permissions, filters
from rest_framework.throttling import UserRateThrottle
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post

# 1) Validation lives on the serializer — never on the view
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Post
        fields = ["id", "title", "content", "is_published"]
        read_only_fields = ("id",)

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise ValidationError("Title must be at least 5 characters.")
        return value

    def validate(self, attrs):                          # cross-field
        if attrs.get("is_published") and len(attrs.get("content", "")) < 50:
            raise ValidationError("Published posts need at least 50 characters of content.")
        return attrs

# 2) Object-level permission — table-level grant + row-level ownership check
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id

# 3) Throttling per user (guards POST/PATCH from abuse)
class WriteThrottle(UserRateThrottle):
    rate = "60/min"

# 4) Pagination + filtering + ordering — DRF wires these for free
class StandardPagination(PageNumberPagination):
    page_size = 25
    max_page_size = 200

class PostViewSet(viewsets.ModelViewSet):
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    throttle_classes   = [WriteThrottle]
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["is_published", "author"]
    search_fields      = ["title", "content"]
    ordering_fields    = ["published_date", "title"]
    ordering           = ["-published_date"]            # default

    def get_queryset(self):
        return Post.objects.select_related("author")

    def perform_create(self, serializer):                # inject server-side fields
        serializer.save(author=self.request.user)

# Decision rule:
#   simple CRUD on a model              -> ModelViewSet + ModelSerializer
#   custom verb on a row                 -> @action(detail=True)
#   list-wide custom action              -> @action(detail=False)
#   trust boundary on writes             -> validation in serializer.validate*
#   row-level ownership                  -> custom BasePermission with has_object_permission
#   complex query with joins             -> override get_queryset; .select_related/.prefetch_related
#
# Anti-pattern: putting validation in the view's create() method
#   The same rule needs to fire on PATCH, custom actions, and bulk endpoints.
#   Validation goes on the serializer; the view just routes.
```

## Decision Rule

```text
simple CRUD on a model              -> ModelViewSet + ModelSerializer
custom verb on a row                 -> @action(detail=True)
list-wide custom action              -> @action(detail=False)
trust boundary on writes             -> validation in serializer.validate*
row-level ownership                  -> custom BasePermission with has_object_permission
complex query with joins             -> override get_queryset; .select_related/.prefetch_related
```

## Anti-Pattern

> [!warning] Anti-pattern
> putting validation in the view's create() method
>   The same rule needs to fire on PATCH, custom actions, and bulk endpoints.
>   Validation goes on the serializer; the view just routes.

## Tips

- `ModelViewSet` auto-generates list, create, retrieve, update, delete actions.
- Use `@action()` decorator for custom endpoints.
- `read_only=True` on fields that should not be modified.
- Put validation in `serializer.validate_*` / `validate()` — not in the view's `create()` — so the same rule fires on PATCH, custom @actions, and bulk endpoints
- Row-level ownership belongs in a custom `BasePermission` with `has_object_permission`, not as inline `if obj.user == request.user` in the view

## Common Mistake

> [!warning] Not defining `Meta.fields` on serializers; always specify what to serialize.

## Shorthand (Junior → Senior)

**Junior:**
```python
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "content", "author"]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

**Senior:**
```python
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = "__all__"

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

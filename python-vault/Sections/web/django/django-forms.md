---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-forms"
title: "forms.Form, forms.ModelForm"
category: "Django"
subtitle: "Form fields, validation, cleaned_data, ModelForm"
signature_short: "class Form(forms.Form):  |  form.is_valid()  |  form.cleaned_data  |  ModelForm"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "forms.Form, forms.ModelForm"
  - "django-forms"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# forms.Form, forms.ModelForm

> Form fields, validation, cleaned_data, ModelForm

## Overview

Django forms handle rendering, validation, and CSRF protection. Inherit from `forms.Form` for custom forms, or `forms.ModelForm` to auto-generate from models. Validate with `form.is_valid()`, and access cleaned data with `form.cleaned_data`.

## Signature

```python
class Form(forms.Form):  |  form.is_valid()  |  form.cleaned_data  |  ModelForm
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Plain Form with three fields, validate in the view
# STRENGTHS - Smallest valid Django form round-trip
# WEAKNESSES- No custom validation, no widgets, no ModelForm
#
from django import forms
from django.shortcuts import render, redirect

class ContactForm(forms.Form):
    name    = forms.CharField(max_length=100)
    email   = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)

def contact(request):
    form = ContactForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        # form.cleaned_data is a dict of validated, type-coerced values
        return redirect("contact_thanks")
    return render(request, "contact.html", {"form": form})

# templates/contact.html
# <form method="post">{% csrf_token %}{{ form.as_p }}<button>Send</button></form>
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - ModelForm, per-field clean_<f>, cross-field clean(), widget tweaks
# STRENGTHS - The three layers of validation Django gives you, all in use
# WEAKNESSES- No formsets, no inline forms, no JS-side validation
#
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model   = Post
        fields  = ["title", "content", "is_published"]
        widgets = {
            "content": forms.Textarea(attrs={"rows": 6, "class": "prose"}),
        }
        labels = {"title": "Post title"}

    # 1) Per-field cleaner — runs after the field's built-in validators
    def clean_title(self):
        title = self.cleaned_data["title"].strip()
        if len(title) < 5:
            raise forms.ValidationError("Title must be at least 5 characters.")
        return title

    # 2) Cross-field validation — runs after every clean_<f>
    def clean(self):
        cleaned = super().clean()
        if cleaned.get("is_published") and len(cleaned.get("content", "")) < 50:
            self.add_error("content", "Published posts need at least 50 characters.")
        return cleaned

# View pattern (use form.save(commit=False) when you need to inject extra fields)
def create_post(request):
    form = PostForm(request.POST or None)
    if form.is_valid():
        post = form.save(commit=False)
        post.author = request.user
        post.save()
        return redirect("post_detail", pk=post.pk)
    return render(request, "posts/form.html", {"form": form})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Formsets, server-side trust, file uploads, security gotchas
# STRENGTHS - The hardening forms need to ship in front of real users
# WEAKNESSES- N/A
#
from django import forms
from django.forms import inlineformset_factory
from django.core.exceptions import ValidationError
from .models import Post, Tag, Attachment

# 1) NEVER trust the request — fields-only is mandatory on ModelForm.
#    Without 'fields' or 'exclude' Django refuses to build the form (since 1.6+).
class PostForm(forms.ModelForm):
    class Meta:
        model  = Post
        fields = ["title", "content", "is_published"]    # <-- explicit allowlist

# 2) File / image uploads — content-type spoofing is trivial, validate magic bytes
ALLOWED_IMG = {"image/png", "image/jpeg", "image/webp"}
MAX_BYTES   = 5 * 1024 * 1024

class AttachmentForm(forms.ModelForm):
    class Meta:
        model  = Attachment
        fields = ["file"]

    def clean_file(self):
        f = self.cleaned_data["file"]
        if f.size > MAX_BYTES:
            raise ValidationError("File too large.")
        if f.content_type not in ALLOWED_IMG:
            raise ValidationError("Unsupported file type.")
        return f

# 3) Inline formset for "post + many tags on one screen"
TagFormSet = inlineformset_factory(
    parent_model=Post, model=Tag, fields=["name"],
    extra=1, can_delete=True, max_num=20,           # cap to prevent abuse
)

def edit_post_with_tags(request, pk):
    post = Post.objects.get(pk=pk)
    if request.method == "POST":
        form     = PostForm(request.POST, instance=post)
        formset  = TagFormSet(request.POST, instance=post)
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()                          # creates / updates / deletes in one go
            return redirect("post_detail", pk=post.pk)
    else:
        form     = PostForm(instance=post)
        formset  = TagFormSet(instance=post)
    return render(request, "posts/edit.html", {"form": form, "formset": formset})

# 4) ALWAYS render forms inside a {% csrf_token %} block. Without it, Django
#    rejects the POST with 403 — that's a feature.

# Decision rule:
#   one form, model-backed              -> ModelForm
#   form not tied to a model            -> forms.Form
#   parent + N children on one page     -> inlineformset_factory
#   per-field rule                       -> clean_<field>
#   cross-field rule                     -> clean()
#   server-side trust boundary           -> Meta.fields = explicit allowlist (NEVER __all__)
#
# Anti-pattern: Meta.fields = "__all__" on a model with sensitive fields
#   (is_admin, balance, role, password_hash). A user POSTs them with values you
#   never intended to expose. Always allowlist with a fixed fields tuple.
```

## Decision Rule

```text
one form, model-backed              -> ModelForm
form not tied to a model            -> forms.Form
parent + N children on one page     -> inlineformset_factory
per-field rule                       -> clean_<field>
cross-field rule                     -> clean()
server-side trust boundary           -> Meta.fields = explicit allowlist (NEVER __all__)
```

## Anti-Pattern

> [!warning] Anti-pattern
> Meta.fields = "__all__" on a model with sensitive fields
>   (is_admin, balance, role, password_hash). A user POSTs them with values you
>   never intended to expose. Always allowlist with a fixed fields tuple.

## Tips

- Always include `{% csrf_token %}` in POST forms.
- Use `form.cleaned_data` after `is_valid()` to access validated data.
- Override `clean_<field>()` for field-specific validation.
- On a `ModelForm` always allowlist `Meta.fields` with an explicit tuple — `Meta.fields = "__all__"` lets a user POST `is_admin`, `role`, `password_hash`, and other sensitive fields you never intended to expose
- Cross-field rules go in `clean()`; per-field rules go in `clean_<field>()` — both run only after `is_valid()`

## Common Mistake

> [!warning] Accessing `request.POST` directly without form validation.

## Shorthand (Junior → Senior)

**Junior:**
```python
class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data
```

**Senior:**
```python
class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-orm|QuerySet methods (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "web"
section: "django"
id: "django-orm"
title: "QuerySet methods"
category: "Django"
subtitle: "QuerySet API, filtering, optimization"
signature_short: "Model.objects.filter()  |  .exclude()  |  .select_related()  |  .prefetch_related()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QuerySet methods"
  - "django-orm"
tags:
  - "python"
  - "python/web"
  - "python/web/django"
  - "category/django"
  - "tier/tiered"
---

# QuerySet methods

> QuerySet API, filtering, optimization

## Overview

Django ORM provides a chainable QuerySet API. Use `filter()` for conditions, `exclude()` for negation, `select_related()` for foreign keys (JOIN), and `prefetch_related()` for reverse relations. All queries are lazy; they execute when evaluated.

## Signature

```python
Model.objects.filter()  |  .exclude()  |  .select_related()  |  .prefetch_related()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The four queries you'll write daily: filter, exclude, get, all
# STRENGTHS - Smallest demonstration of the QuerySet API
# WEAKNESSES- No relations, no laziness discussion
#
posts        = Post.objects.all()
published    = Post.objects.filter(is_published=True)
not_drafts   = Post.objects.exclude(is_published=False)
single_post  = Post.objects.get(pk=1)               # raises if 0 or >1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Field lookups, Q for OR, slicing, aggregation, select_related
# STRENGTHS - Covers the chainable patterns 80% of views use
# WEAKNESSES- No raw SQL, no window functions, no annotate(F(...)) tricks
#
from django.db.models import Q, Count

# Field lookups: __gte, __icontains, __in, __isnull
recent = Post.objects.filter(
    is_published=True,
    published_date__gte="2024-01-01",
    title__icontains="python",
)

# OR / negation with Q
flagged = Post.objects.filter(Q(author__name="Alice") | Q(author__name="Bob"))

# Avoid the N+1 trap on ForeignKey access
for p in Post.objects.select_related("author"):
    p.author.name                                   # one JOIN, not N follow-up queries

# Aggregation per row
authors = Author.objects.annotate(num_posts=Count("posts"))
for a in authors:
    print(a.name, a.num_posts)

# Pagination via slicing — translates to LIMIT/OFFSET
page = Post.objects.all()[20:30]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - select_related vs prefetch_related, F-expressions, atomic updates, only/values
# STRENGTHS - The exact rules that turn a slow Django app into a fast one
# WEAKNESSES- N/A
#
from django.db import transaction
from django.db.models import F, Q, Count, Sum, Prefetch

# 1) select_related = SQL JOIN — for ForeignKey / OneToOne (single object).
#    prefetch_related = separate IN(...) query — for ManyToMany / reverse FK (many objects).
posts = (Post.objects
            .select_related("author")              # 1 query, 1 JOIN
            .prefetch_related(
                Prefetch("comments",                # custom prefetch with its own filter
                         queryset=Comment.objects.filter(is_spam=False)
                                                 .select_related("user"))
            ))

# 2) F-expressions — update on the DB side, race-free, no read-modify-write
Post.objects.filter(pk=1).update(view_count=F("view_count") + 1)

# 3) only() / defer() — fetch only the columns you actually need on hot paths
ids_titles = Post.objects.only("id", "title")          # SELECT id, title
just_ids   = Post.objects.values_list("id", flat=True) # iterator of ids

# 4) Bulk operations — orders of magnitude faster than per-row loops
Post.objects.bulk_create([Post(title=t) for t in ["A", "B", "C"]], batch_size=500)
Post.objects.filter(status="draft").update(status="archived")     # one UPDATE

# 5) Transactional reads + writes — the "compute then save" anti-pattern fix
@transaction.atomic
def transfer(from_id, to_id, amount):
    # select_for_update locks the rows until the transaction commits
    a = Account.objects.select_for_update().get(pk=from_id)
    b = Account.objects.select_for_update().get(pk=to_id)
    a.balance = F("balance") - amount; a.save(update_fields=["balance"])
    b.balance = F("balance") + amount; b.save(update_fields=["balance"])

# 6) Use .explain() to read the plan when something is slow
print(Post.objects.filter(author__name="Alice").explain())

# Decision rule:
#   ForeignKey / OneToOne                  -> select_related (JOIN)
#   ManyToMany / reverse FK                -> prefetch_related (separate IN query)
#   listing 1000+ rows                      -> .iterator() to avoid loading all into memory
#   counter increment / atomic delta        -> F("col") + n inside .update()
#   conditional bulk write                   -> .update() / .bulk_update(), not loop + save()
#   need to lock rows                        -> select_for_update inside transaction.atomic
#
# Anti-pattern: read-modify-write counters
#   p = Post.objects.get(pk=1); p.view_count += 1; p.save()
#   Two concurrent requests both read 5, write 6 — one increment lost.
#   Use F("view_count") + 1 inside an .update() call.

class Comment: pass
class Account: pass
```

## Decision Rule

```text
ForeignKey / OneToOne                  -> select_related (JOIN)
ManyToMany / reverse FK                -> prefetch_related (separate IN query)
listing 1000+ rows                      -> .iterator() to avoid loading all into memory
counter increment / atomic delta        -> F("col") + n inside .update()
conditional bulk write                   -> .update() / .bulk_update(), not loop + save()
need to lock rows                        -> select_for_update inside transaction.atomic
```

## Anti-Pattern

> [!warning] Anti-pattern
> read-modify-write counters
>   p = Post.objects.get(pk=1); p.view_count += 1; p.save()
>   Two concurrent requests both read 5, write 6 — one increment lost.
>   Use F("view_count") + 1 inside an .update() call.

## Tips

- Use `select_related()` for foreign keys; use `prefetch_related()` for reverse relations.
- Always check `query.explain()` to see the SQL and optimize N+1 problems.
- QuerySets are lazy; don't execute until necessary (iteration, `.get()`, `.count()`).
- For atomic counter updates use `F("col") + 1` inside `.update()` — read-modify-write (`.get(); obj.x += 1; .save()`) loses concurrent increments
- Bulk writes: prefer `.update()` / `.bulk_update()` over a loop of `save()`; row locks need `select_for_update()` inside `transaction.atomic`

## Common Mistake

> [!warning] Looping over QuerySets without using `select_related()` causes N+1 queries.

## Shorthand (Junior → Senior)

**Junior:**
```python
posts = Post.objects.all()
posts = posts.filter(is_published=True)
posts = posts.select_related("author")
for post in posts:
    print(post.author.name)
```

**Senior:**
```python
posts = Post.objects.filter(is_published=True).select_related("author")
```

## See Also

- [[Sections/web/django/django-setup|django-admin startproject (Web (Flask, Django))]]
- [[Sections/web/django/django-models|models.Model (Web (Flask, Django))]]
- [[Sections/web/django/django-views|Function-based views (Web (Flask, Django))]]
- [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView (Web (Flask, Django))]]
- [[Sections/web/django/_Index|Web (Flask, Django) → Django]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

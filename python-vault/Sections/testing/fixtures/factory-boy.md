---
type: "entry"
domain: "python"
file: "testing"
section: "fixtures"
id: "factory-boy"
title: "Factory Boy"
category: "Fixtures"
subtitle: "factory_boy creates realistic model instances with sensible defaults"
signature_short: "class UserFactory(factory.Factory): name = factory.Faker(\"name\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Factory Boy"
  - "factory-boy"
tags:
  - "python"
  - "python/testing"
  - "python/testing/fixtures"
  - "category/fixtures"
  - "tier/tiered"
---

# Factory Boy

> factory_boy creates realistic model instances with sensible defaults

## Overview

Factory Boy creates test data factories — classes that generate model instances with sensible defaults. Faker generates realistic data. SQLAlchemy factories integrate with the session. Much cleaner than manually constructing dicts or objects in every test.

## Signature

```python
class UserFactory(factory.Factory): name = factory.Faker("name")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Factory class, override only what each test cares about
# STRENGTHS - The smallest valid factory: model + a couple of fields
# WEAKNESSES- No relationships, no sequences, no DB integration
#
import factory
from factory import Faker

class User:
    def __init__(self, name, email):  self.name, self.email = name, email

class UserFactory(factory.Factory):
    class Meta:
        model = User
    name  = Faker("name")           # "John Smith"
    email = Faker("email")          # "john.smith@example.com"

# In tests
def test_email_lowercased():
    user = UserFactory(email="ALICE@X.COM")     # override only what matters
    assert normalize_email(user.email) == "alice@x.com"
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Sequences for uniqueness, LazyAttribute for derived fields, SubFactory for FKs
# STRENGTHS - The four building blocks that compose into rich test data
# WEAKNESSES- No SQLAlchemy session integration yet
#
import factory
from factory import Faker, SubFactory, LazyAttribute, Sequence

class UserFactory(factory.Factory):
    class Meta:
        model = User
    # Sequence — guarantees uniqueness across calls
    username = Sequence(lambda n: f"user_{n:04d}")

    # LazyAttribute — compute from OTHER fields on this instance
    name  = Faker("name")
    email = LazyAttribute(lambda o: f"{o.name.lower().replace(' ', '.')}@test.com")

class Post:
    def __init__(self, title, author): self.title, self.author = title, author

class PostFactory(factory.Factory):
    class Meta:
        model = Post
    title  = Faker("sentence", nb_words=5)
    author = SubFactory(UserFactory)            # creates a User automatically

# Build many at once
users = UserFactory.build_batch(5)              # list of 5 unrelated Users
post  = PostFactory()                            # author auto-created via SubFactory
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - SQLAlchemy session wiring, RelatedFactory, traits, post-generation hooks
# STRENGTHS - The patterns for realistic, persisted, related test data
# WEAKNESSES- N/A
#
import factory
from factory import Faker, SubFactory, RelatedFactory, Trait, post_generation
from factory.alchemy import SQLAlchemyModelFactory

# 1) SQLAlchemy factory — wire the session via a pytest fixture
def make_factories(session):
    class _UserFactory(SQLAlchemyModelFactory):
        class Meta:
            model              = User
            sqlalchemy_session = session
            sqlalchemy_session_persistence = "commit"   # or "flush"
        username = factory.Sequence(lambda n: f"u{n}")
        email    = Faker("email")

        # 2) Traits — named bundles of overrides; compose them per test
        class Params:
            admin = Trait(role="admin", is_staff=True)
            unverified = Trait(verified_at=None, role="pending")

    class _PostFactory(SQLAlchemyModelFactory):
        class Meta:
            model = Post
            sqlalchemy_session = session
        title  = Faker("sentence")
        author = SubFactory(_UserFactory)

        # 3) RelatedFactory — create a related object AFTER self exists (one-to-many)
        first_comment = RelatedFactory(
            "tests.factories.CommentFactory", factory_related_name="post",
        )

        # 4) Post-generation hook — accept extra kwargs, do work after build
        @post_generation
        def tags(self, create, extracted, **kwargs):
            if not create:
                return
            for name in (extracted or []):
                self.tags.append(Tag(name=name))

    return _UserFactory, _PostFactory

# Usage in a test
def test_post_with_admin_author(db):
    UserFactory, PostFactory = make_factories(db)
    post = PostFactory(author__admin=True,                   # trait via dunder
                       tags=["python", "testing"])           # post-generation kwarg
    assert post.author.role == "admin"
    assert {t.name for t in post.tags} == {"python", "testing"}

# Decision rule:
#   simple object construction              -> factory.Factory + Faker
#   field derived from another field         -> LazyAttribute
#   needs to be unique (DB constraint)       -> factory.Sequence
#   FK to another model                       -> SubFactory
#   related child rows (one-to-many)          -> RelatedFactory
#   "this user but as an admin"               -> Trait under Params
#   custom post-create logic                   -> @post_generation
#
# Anti-pattern: dictionaries hand-rolled in every test
#   {"username": "alice", "email": "alice@x.com", "role": "user", "verified": True, ...}
#   When the model gains a new required field, every test breaks. Centralize
#   defaults in a factory; tests only specify what they care about.

class User: pass
class Post: pass
class Tag:
    def __init__(self, name=None): self.name = name
```

## Decision Rule

```text
simple object construction              -> factory.Factory + Faker
field derived from another field         -> LazyAttribute
needs to be unique (DB constraint)       -> factory.Sequence
FK to another model                       -> SubFactory
related child rows (one-to-many)          -> RelatedFactory
"this user but as an admin"               -> Trait under Params
custom post-create logic                   -> @post_generation
```

## Anti-Pattern

> [!warning] Anti-pattern
> dictionaries hand-rolled in every test
>   {"username": "alice", "email": "alice@x.com", "role": "user", "verified": True, ...}
>   When the model gains a new required field, every test breaks. Centralize
>   defaults in a factory; tests only specify what they care about.

## Tips

- Factories give you sane defaults — only override what matters for each specific test
- LazyAttribute computes a value from other fields: `email = LazyAttribute(lambda o: f"{o.name}@test.com")`
- SubFactory creates related objects automatically — no need to create dependencies by hand
- factory.Sequence guarantees unique values — essential for fields with unique constraints

## Common Mistake

> [!warning] Creating test data manually in each test: `{"name": "test", "email": "test@test.com", ...}`. When models change, every test breaks. Factories centralize test data construction.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/testing/fixtures/fixture-basic|@pytest.fixture (Testing with pytest)]]
- [[Sections/testing/fixtures/fixture-scope|Fixture scope (Testing with pytest)]]
- [[Sections/testing/fixtures/conftest|conftest.py (Testing with pytest)]]
- [[Sections/testing/fixtures/integration-tests|Integration test patterns (Testing with pytest)]]
- [[Sections/testing/fixtures/_Index|Testing with pytest → Fixtures]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]

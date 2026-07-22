---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-relationships"
title: "relationship() — Eager vs Lazy Loading"
category: "ORM Queries"
subtitle: "relationship, back_populates, lazy=, joinedload, selectinload, raiseload, contains_eager"
signature_short: "posts: Mapped[list[\"Post\"]] = relationship(back_populates=\"author\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "relationship() — Eager vs Lazy Loading"
  - "sqlalchemy-relationships"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-queries"
  - "tier/tiered"
---

# relationship() — Eager vs Lazy Loading

> relationship, back_populates, lazy=, joinedload, selectinload, raiseload, contains_eager

## Overview

relationship() declares an association between two mapped classes. Loader strategies decide WHEN the related rows are fetched: lazy (one extra query per access — N+1 risk), joinedload (one query, JOIN), selectinload (two queries with WHERE id IN). The default is lazy="select", which is rarely what you want for any list traversal.

## Signature

```python
posts: Mapped[list["Post"]] = relationship(back_populates="author")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - relationship() + back_populates on both sides; use Mapped[list[X]] for collections.
# STRENGTHS - Two-way navigation: post.author and user.posts both work.
# WEAKNESSES- Default lazy load fires N+1 queries when iterating user.posts in a loop.
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey

class User(Base):
    __tablename__ = "users"
    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str]
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id:        Mapped[int] = mapped_column(primary_key=True)
    title:     Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author:    Mapped["User"] = relationship(back_populates="posts")

# Use:
user = session.scalars(select(User)).first()
print(user.posts)                                # fires SELECT on first access
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Eager-load with .options(selectinload(...)) when you know you'll iterate the relationship.
# STRENGTHS - Avoids N+1 queries; one round-trip per relationship instead of N.
# WEAKNESSES- Eager-loading what you don't use is also wasteful; only eager-load what you'll touch.
from sqlalchemy.orm import selectinload, joinedload

with Session() as session:
    # ANTI-PATTERN — N+1 queries
    users = session.scalars(select(User)).all()
    for u in users:
        print(u.name, len(u.posts))               # one SELECT per user!

    # FIX 1: selectinload — issues 2 queries total (users, posts WHERE author_id IN [...])
    users = session.scalars(
        select(User).options(selectinload(User.posts))
    ).all()
    for u in users:
        print(u.name, len(u.posts))               # no extra queries

    # FIX 2: joinedload — single query with LEFT JOIN
    users = session.scalars(
        select(User).options(joinedload(User.posts))
    ).unique().all()                              # JOIN duplicates; .unique() dedupes

    # When loading nested relationships, chain options.
    users = session.scalars(
        select(User).options(
            selectinload(User.posts).selectinload(Post.comments)
        )
    ).all()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lazy="raise" by default, eager-load explicitly per query; joinedload for *-to-one, selectinload for *-to-many; contains_eager when you JOIN manually.
# STRENGTHS - "Loud" lazy loading — accidental N+1 raises in tests instead of silently destroying production performance.
# WEAKNESSES- Forces every code path to declare its loader strategy; libraries that expect default lazy will break.
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship,
    joinedload, selectinload, raiseload, contains_eager,
)
from sqlalchemy import select, ForeignKey

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str]
    # lazy="raise" -- accessing user.posts without explicit eager-load raises
    posts: Mapped[list["Post"]] = relationship(
        back_populates="author",
        lazy="raise",
    )

class Post(Base):
    __tablename__ = "posts"
    id:        Mapped[int] = mapped_column(primary_key=True)
    title:     Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author:    Mapped["User"] = relationship(back_populates="posts", lazy="raise")

# Now, every query MUST opt-in to relationship loading.
with Session() as session:
    # 1) Read users + their post titles -- two queries via selectinload.
    users = session.scalars(
        select(User).options(selectinload(User.posts))
    ).all()

    # 2) Read posts with their author -- joinedload (joining to a single row).
    posts = session.scalars(
        select(Post).options(joinedload(Post.author))
    ).all()

    # 3) "Posts by users in dept X" -- manual JOIN, then contains_eager.
    posts = session.scalars(
        select(Post)
          .join(Post.author)
          .where(User.dept == "eng")
          .options(contains_eager(Post.author))     # tells SQLA "the JOIN already loaded it"
    ).all()

    # 4) Mark unused relations as raiseload to catch accidental access.
    safe = session.scalars(
        select(User)
          .options(selectinload(User.posts), raiseload(User.audit_log))
    ).all()                                          # safe[0].audit_log -> raises

# Decision rule:
#   relationship to a single row             -> joinedload (one query, LEFT JOIN)
#   relationship to many rows                -> selectinload (two queries; better than JOIN's row blow-up)
#   already JOINed manually                  -> contains_eager (don't load again)
#   relationship rarely needed               -> default lazy + use selectinload only when accessed
#   want N+1 to fail loudly                  -> lazy="raise" by default + opt-in eager
#   "deep" eager (parent.child.grandchild)   -> chain selectinload(...).selectinload(...)
#   one-off "I really want a 1+N+M query"    -> lazy="select" with explicit comment
#   bulk update / delete                     -> bypass ORM; use update() / delete() at Core level
#
# Anti-pattern: relying on default lazy loading, then iterating relationships in
# a loop. Each iteration fires a SELECT. 1 user + 100 posts + 500 comments =
# 601 queries. Tests pass (small data); production crawls. Eager-load
# explicitly OR use lazy="raise" so the bug surfaces in tests.
```

## Decision Rule

```text
relationship to a single row             -> joinedload (one query, LEFT JOIN)
relationship to many rows                -> selectinload (two queries; better than JOIN's row blow-up)
already JOINed manually                  -> contains_eager (don't load again)
relationship rarely needed               -> default lazy + use selectinload only when accessed
want N+1 to fail loudly                  -> lazy="raise" by default + opt-in eager
"deep" eager (parent.child.grandchild)   -> chain selectinload(...).selectinload(...)
one-off "I really want a 1+N+M query"    -> lazy="select" with explicit comment
bulk update / delete                     -> bypass ORM; use update() / delete() at Core level
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on default lazy loading, then iterating relationships in
> a loop. Each iteration fires a SELECT. 1 user + 100 posts + 500 comments =
> 601 queries. Tests pass (small data); production crawls. Eager-load
> explicitly OR use lazy="raise" so the bug surfaces in tests.

## Tips

- `selectinload` is the right default for *-to-many relationships — it fires one extra query (`WHERE parent_id IN (...)`) regardless of how many parents.
- `joinedload` is the right default for *-to-one (e.g., post.author) — one round-trip via LEFT JOIN.
- `lazy="raise"` on relationships in your models forces every query to declare its loader strategy. Best defense against drive-by N+1 bugs.
- `contains_eager()` is for when you JOINed manually — it tells the ORM not to issue a *second* fetch for the same data.
- Bulk updates that touch a relationship column should bypass the ORM (`update(User).where(...).values(...)` at Core level) — the ORM doesn't propagate cascades for bulk ops anyway.

## Common Mistake

> [!warning] Iterating over a relationship inside a loop without eager-loading. Each access fires a fresh SELECT; what looks like one operation is actually N. Test data hides this; production traffic exposes it. Either `.options(selectinload(...))` explicitly or set `lazy="raise"` so the N+1 fails loudly.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Default lazy — N+1 trap
users = session.scalars(select(User)).all()
for u in users:
    print(u.posts)                              # 1 SELECT per user
```

**Senior:**
```python
# Eager-loaded — 2 queries total
users = session.scalars(
    select(User).options(selectinload(User.posts))
).all()
for u in users:
    print(u.posts)
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-select|select() — Modern Query API (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-loading-strategies|Loading Strategies — joinedload, selectinload, raiseload, contains_eager (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

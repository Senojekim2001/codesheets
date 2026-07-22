---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-loading-strategies"
title: "Loading Strategies — joinedload, selectinload, raiseload, contains_eager"
category: "ORM Queries"
subtitle: "lazy=, joinedload, selectinload, subqueryload, raiseload, noload, contains_eager, with_polymorphic, wildcard \"*\""
signature_short: "select(User).options(selectinload(User.posts).joinedload(Post.author))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Loading Strategies — joinedload, selectinload, raiseload, contains_eager"
  - "sqlalchemy-loading-strategies"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-queries"
  - "tier/tiered"
---

# Loading Strategies — joinedload, selectinload, raiseload, contains_eager

> lazy=, joinedload, selectinload, subqueryload, raiseload, noload, contains_eager, with_polymorphic, wildcard "*"

## Overview

Loader strategies decide WHEN related rows are fetched. Class-level (`relationship(lazy=...)`) sets the default; query-level (`.options(...)`) overrides per query. Picking wrong is the #1 cause of slow ORM code: lazy default fires N+1 queries, joinedload on a *-to-many relationship multiplies row counts, and selectinload on a single-row relation wastes a round-trip.

## Signature

```python
select(User).options(selectinload(User.posts).joinedload(Post.author))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - .options(joinedload) for *-to-one, .options(selectinload) for *-to-many.
# STRENGTHS - One line eliminates N+1 queries.
# WEAKNESSES- Default lazy load is silent — your tests pass, production crawls.
from sqlalchemy.orm import joinedload, selectinload

# *-to-one — JOIN the parent into the child query (1 query total).
posts = session.scalars(
    select(Post).options(joinedload(Post.author))
).all()

# *-to-many — separate IN query for the children (2 queries total).
users = session.scalars(
    select(User).options(selectinload(User.posts))
).all()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Chain options for nested relationships; combine joinedload + selectinload by relationship type; .unique() after joinedload on collections.
# STRENGTHS - One trip to the DB for objects + grandchildren; no N+1 anywhere in the chain.
# WEAKNESSES- joinedload on a collection multiplies rows (Cartesian-ish); add .unique() to dedupe — better, switch to selectinload.
from sqlalchemy.orm import joinedload, selectinload

# Chained eager-load: User -> posts -> comments
users = session.scalars(
    select(User).options(
        selectinload(User.posts).selectinload(Post.comments)
    )
).all()
for u in users:
    for p in u.posts:
        for c in p.comments:
            ...                                    # zero extra queries

# Mixed: joinedload for the single author, selectinload for the comments list
posts = session.scalars(
    select(Post).options(
        joinedload(Post.author),                   # 1-to-1: fold into JOIN
        selectinload(Post.comments),                # 1-to-many: separate query
    )
).all()

# joinedload on a collection — needs .unique() because JOIN duplicates parents
authors_with_posts = session.scalars(
    select(User).options(joinedload(User.posts))
).unique().all()                                   # without .unique(): repeated User rows

# Wildcard: eager-load EVERY relationship one level deep (rarely a good idea)
all_loaded = session.scalars(
    select(Post).options(joinedload("*"))
).unique().all()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lazy="raise" by default; opt-in eager per query; contains_eager for manual JOINs; with_polymorphic for inheritance trees; raiseload + noload for safety nets.
# STRENGTHS - N+1 fails LOUDLY in tests; eager-load policy is explicit at every call site.
# WEAKNESSES- lazy="raise" breaks templates/serializers that walk relationships; pre-eager-load BEFORE the data crosses the request boundary.
from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.orm import (
    joinedload, selectinload, raiseload, noload,
    contains_eager, with_polymorphic, defer, undefer, load_only,
)

# 1) Manual JOIN + contains_eager — the JOIN already loaded the data, don't issue another fetch.
recent_authors = session.scalars(
    select(User)
        .join(User.posts)
        .where(Post.published_at >= last_week)
        .options(contains_eager(User.posts))
).unique().all()

# 2) Polymorphic loading — single query covers all subclasses.
employee_types = with_polymorphic(Employee, [Manager, Engineer])
all_staff = session.scalars(
    select(employee_types)
).all()

# 3) load_only — fetch a SUBSET of columns; useful for list views over wide tables.
users_summary = session.scalars(
    select(User).options(
        load_only(User.id, User.name, User.email),
        raiseload("*"),                            # accessing other cols/relations raises
    )
).all()

# 4) defer / undefer — for huge text/blob columns you usually skip.
small_post = session.scalars(
    select(Post).options(defer(Post.body))         # don't load Post.body unless accessed
).all()

# 5) Per-class default policy — make N+1 impossible to introduce silently.
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list[Post]] = relationship(back_populates="author", lazy="raise")
    audit_log: Mapped[list[AuditEntry]] = relationship(lazy="raise")

# Now every query that touches user.posts MUST opt into a loader strategy
# OR the lazy="raise" trips at access time. Tests catch the regression.

# Decision rule:
#   *-to-one (post.author)                   -> joinedload  (one query, no row blow-up)
#   *-to-many small N (user.posts, < ~100)   -> selectinload (one IN query, no Cartesian)
#   *-to-many large N or already JOINed       -> contains_eager + custom JOIN
#   nested relationships                      -> chain selectinload(...).selectinload(...)
#   polymorphic inheritance                   -> with_polymorphic([Sub1, Sub2])
#   need only some columns                    -> load_only + raiseload("*")
#   never want this column unless asked       -> defer(col) class-level, undefer(col) per query
#   accidentally accessed                     -> raiseload(rel) — fail in dev, find in test
#   you serialize after session close         -> eager-load EVERYTHING you'll touch BEFORE session.close()
#
# Anti-pattern: joinedload on a *-to-many relationship without .unique(). The
# JOIN multiplies parent rows by the number of children; you get duplicate
# User objects in your result list. Either .unique() to dedupe or switch to
# selectinload (which avoids the Cartesian product entirely).
```

## Decision Rule

```text
*-to-one (post.author)                   -> joinedload  (one query, no row blow-up)
*-to-many small N (user.posts, < ~100)   -> selectinload (one IN query, no Cartesian)
*-to-many large N or already JOINed       -> contains_eager + custom JOIN
nested relationships                      -> chain selectinload(...).selectinload(...)
polymorphic inheritance                   -> with_polymorphic([Sub1, Sub2])
need only some columns                    -> load_only + raiseload("*")
never want this column unless asked       -> defer(col) class-level, undefer(col) per query
accidentally accessed                     -> raiseload(rel) — fail in dev, find in test
you serialize after session close         -> eager-load EVERYTHING you'll touch BEFORE session.close()
```

## Anti-Pattern

> [!warning] Anti-pattern
> joinedload on a *-to-many relationship without .unique(). The
> JOIN multiplies parent rows by the number of children; you get duplicate
> User objects in your result list. Either .unique() to dedupe or switch to
> selectinload (which avoids the Cartesian product entirely).

## Tips

- `selectinload` is the modern preferred default for *-to-many — it issues one extra query (`WHERE parent_id IN (...)`) regardless of result size, with no row blow-up.
- After `joinedload` on a collection, always `.unique()` to dedupe the parent rows — or swap for `selectinload` and skip the dedup entirely.
- `raiseload("*")` is the safety net: combine with `load_only(specific_cols)` to forbid every other access. Tests catch surprise loads before they ship.
- Class-level `lazy="raise"` is the strongest policy — once set, every query has to declare its loader strategy. Adopt it on a fresh codebase; retrofitting is painful.
- `contains_eager` is the fix for "I JOINed manually but the ORM is firing a SECOND query for the same data". One call to switch off the duplicate fetch.

## Common Mistake

> [!warning] Setting `lazy="joined"` at the class level. Every query for the parent now JOINs the children, multiplying row counts even when callers only wanted the parent. Use `lazy="select"` (default) or `lazy="raise"` at class level; opt into `joinedload`/`selectinload` per query via `.options()`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Class-level eager loading — too aggressive
class User(Base):
    posts = relationship("Post", lazy="joined")     # ALWAYS JOINs

# Now even "give me one user" loads all their posts.
```

**Senior:**
```python
# Class-level loud lazy + per-query opt-in
class User(Base):
    posts = relationship("Post", lazy="raise")

# Eager only when you need it
users = session.scalars(
    select(User).options(selectinload(User.posts))
).all()
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-select|select() — Modern Query API (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-relationships|relationship() — Eager vs Lazy Loading (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

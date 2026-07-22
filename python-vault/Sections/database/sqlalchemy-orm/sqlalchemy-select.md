---
type: "entry"
domain: "python"
file: "database"
section: "sqlalchemy-orm"
id: "sqlalchemy-select"
title: "select() — Modern Query API"
category: "ORM Queries"
subtitle: "select, where, order_by, scalars, execute, Result.scalars, Result.first, .one, .one_or_none"
signature_short: "session.scalars(select(User).where(User.email == email))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "select() — Modern Query API"
  - "sqlalchemy-select"
tags:
  - "python"
  - "python/database"
  - "python/database/sqlalchemy-orm"
  - "category/orm-queries"
  - "tier/tiered"
---

# select() — Modern Query API

> select, where, order_by, scalars, execute, Result.scalars, Result.first, .one, .one_or_none

## Overview

SQLAlchemy 2.0 unified ORM and Core under one select() function. Build a Select object with .where(), .order_by(), .join(), then execute via session.scalars() (returns model objects) or session.execute() (returns rows). The legacy session.query() syntax still works but is in maintenance mode — new code uses select().

## Signature

```python
session.scalars(select(User).where(User.email == email))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - select(Model) + .where(); execute via session.scalars().
# STRENGTHS - Type-aware, composable, future-proof.
# WEAKNESSES- Legacy session.query() examples are still everywhere online; ignore them.
from sqlalchemy import select

with Session() as session:
    # All users.
    users = session.scalars(select(User)).all()

    # One specific user.
    alice = session.scalars(
        select(User).where(User.email == "alice@example.com")
    ).one_or_none()

    # First match (or None).
    first_admin = session.scalars(
        select(User).where(User.role == "admin").order_by(User.id)
    ).first()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Compose filters, joins, and aggregates; use scalars() for objects, execute() for rows/columns.
# STRENGTHS - Same query API for ORM objects and ad-hoc projections; clean composition.
# WEAKNESSES- .all() materializes results into a list — for huge result sets, use .yield_per() or .stream_scalars() instead.
from sqlalchemy import select, func, and_, or_

with Session() as session:
    # Filter + order + limit.
    recent = session.scalars(
        select(User)
        .where(User.created_at >= last_week)
        .order_by(User.created_at.desc())
        .limit(50)
    ).all()

    # Join with relationship.
    posts_with_authors = session.scalars(
        select(Post)
        .join(Post.author)
        .where(User.email == "alice@example.com")
    ).all()

    # Projection — return tuples of columns, NOT model objects.
    rows = session.execute(
        select(User.id, User.name, func.count(Post.id).label("post_count"))
        .join(Post, isouter=True)
        .group_by(User.id)
        .having(func.count(Post.id) > 0)
    ).all()
    for user_id, name, count in rows:
        print(name, count)

    # Composite filter.
    active_admins = session.scalars(
        select(User).where(
            and_(User.role == "admin", User.deleted_at.is_(None))
        )
    ).all()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - .yield_per for streaming; .with_for_update for row locks; subqueries via aliased(); .options() for loader strategies; window functions.
# STRENGTHS - Memory-bounded streaming; explicit lock semantics; tunable loader strategies; full SQL power without dropping to text.
# WEAKNESSES- Power features assume you understand the SQL they generate — turn on echo=True until you do.
from sqlalchemy import select, func, text, exists
from sqlalchemy.orm import aliased, joinedload, selectinload

with Session() as session:
    # 1) Streaming — process millions of rows without loading them all.
    for user in session.scalars(
        select(User).order_by(User.id).execution_options(yield_per=1000)
    ):
        process(user)                                # one batch at a time

    # 2) Row-level locks — for "select then update" patterns under contention.
    job = session.scalars(
        select(Job)
          .where(Job.status == "pending")
          .order_by(Job.id)
          .limit(1)
          .with_for_update(skip_locked=True)         # Postgres: skip rows other workers locked
    ).one_or_none()

    # 3) Self-joins via aliased.
    Manager = aliased(User)
    pairs = session.execute(
        select(User.name, Manager.name)
          .join(Manager, User.manager_id == Manager.id)
    ).all()

    # 4) EXISTS — "users who have at least one published post".
    has_post = (
        select(Post.id)
          .where(Post.author_id == User.id, Post.published.is_(True))
          .correlate(User)
    )
    authors = session.scalars(
        select(User).where(exists(has_post))
    ).all()

    # 5) Window function — rank posts within each author by views.
    from sqlalchemy import over
    ranked = session.execute(
        select(
            Post.title,
            Post.author_id,
            over(func.rank(),
                 partition_by=Post.author_id,
                 order_by=Post.views.desc()
            ).label("rank_in_author"),
        )
    ).all()

    # 6) CTE — recursive or just for clarity.
    top_posts = (
        select(Post.author_id, func.max(Post.views).label("max_views"))
          .group_by(Post.author_id)
          .cte("top_posts")
    )
    leaders = session.execute(
        select(User.name, top_posts.c.max_views)
          .join(top_posts, top_posts.c.author_id == User.id)
    ).all()

# Decision rule:
#   need ORM objects                       -> session.scalars(select(Model))
#   need columns / aggregates              -> session.execute(select(col1, col2)) -> tuples
#   single result, must exist              -> .one()  (raises if 0 or >1 — failure-loud)
#   single result, may not exist            -> .one_or_none()
#   any-or-none, no count check             -> .first()
#   "first match" of an ordered query        -> .first() with ORDER BY (else nondeterministic)
#   stream millions of rows                  -> .execution_options(yield_per=N) — bounded memory
#   "lock and process one row" worker        -> .with_for_update(skip_locked=True) on Postgres
#   correlated EXISTS / NOT EXISTS           -> exists(subquery.correlate(Outer)) — correlated efficiently
#   window functions / per-group ranking     -> over(func.row_number(), partition_by=...)
#   recursive walks                          -> .cte("name", recursive=True)
#
# Anti-pattern: session.query(...).all() and then filtering in Python. Pulls
# the entire table into memory just to discard 99% of it. Push the WHERE
# into the SQL — the database is faster at filtering than your loop.
```

## Decision Rule

```text
need ORM objects                       -> session.scalars(select(Model))
need columns / aggregates              -> session.execute(select(col1, col2)) -> tuples
single result, must exist              -> .one()  (raises if 0 or >1 — failure-loud)
single result, may not exist            -> .one_or_none()
any-or-none, no count check             -> .first()
"first match" of an ordered query        -> .first() with ORDER BY (else nondeterministic)
stream millions of rows                  -> .execution_options(yield_per=N) — bounded memory
"lock and process one row" worker        -> .with_for_update(skip_locked=True) on Postgres
correlated EXISTS / NOT EXISTS           -> exists(subquery.correlate(Outer)) — correlated efficiently
window functions / per-group ranking     -> over(func.row_number(), partition_by=...)
recursive walks                          -> .cte("name", recursive=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> session.query(...).all() and then filtering in Python. Pulls
> the entire table into memory just to discard 99% of it. Push the WHERE
> into the SQL — the database is faster at filtering than your loop.

## Tips

- `.scalars()` returns ORM objects; `.execute()` returns Rows (tuples). Pick by what you actually need.
- Use `.one_or_none()` over `.first()` when "more than one match" indicates a bug — it raises MultipleResultsFound and surfaces the issue.
- `.with_for_update(skip_locked=True)` on Postgres makes worker queues trivial: each worker grabs the next unlocked row, no coordination needed.
- For paginated APIs, prefer keyset pagination (`WHERE id > last_id ORDER BY id LIMIT 50`) over OFFSET — keyset is O(1), OFFSET is O(N).
- `yield_per()` requires care with relationships — eagerly-loaded relations may break batching. Use `selectinload()` for child collections; it issues one extra query per batch.

## Common Mistake

> [!warning] Calling `.all()` on a query, then filtering or counting in Python. The database can do both in a single index scan; the round trip + memory cost of materializing into a list is wasted. Push WHERE clauses, joins, and aggregations into the query.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Legacy session.query() — still works, but in maintenance mode
users = session.query(User).filter(User.email == email).all()
first = session.query(User).filter_by(role="admin").first()
```

**Senior:**
```python
# Modern 2.0 select()
users = session.scalars(select(User).where(User.email == email)).all()
first = session.scalars(select(User).where(User.role == "admin")).first()
```

## See Also

- [[Sections/database/sqlalchemy-orm/sqlalchemy-relationships|relationship() — Eager vs Lazy Loading (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/sqlalchemy-loading-strategies|Loading Strategies — joinedload, selectinload, raiseload, contains_eager (Databases & SQLAlchemy)]]
- [[Sections/database/sqlalchemy-orm/_Index|Databases & SQLAlchemy → SQLAlchemy 2.0 — ORM]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

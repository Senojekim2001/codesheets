---
type: "entry"
domain: "python"
file: "database"
section: "patterns"
id: "n-plus-one"
title: "N+1 queries — diagnose and fix with eager loading"
category: "Performance"
subtitle: "lazy=select default, selectinload, joinedload, contains_eager, lazy=\"raise\", echo=\"debug\", sqlalchemy events"
signature_short: "select(User).options(selectinload(User.posts))   # one extra query, not one per User"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "N+1 queries — diagnose and fix with eager loading"
  - "n-plus-one"
tags:
  - "python"
  - "python/database"
  - "python/database/patterns"
  - "category/performance"
  - "tier/tiered"
---

# N+1 queries — diagnose and fix with eager loading

> lazy=select default, selectinload, joinedload, contains_eager, lazy="raise", echo="debug", sqlalchemy events

## Overview

The N+1 query problem: you fetch N rows from the parent table, then iterate a relationship that hasn't been loaded — SQLAlchemy emits one SELECT per row to lazy-load it. 100 users × 1 query each = 100 round-trips that could be 1. The fix is one of three loader strategies; the prevention is `lazy="raise"` on the relationship so iteration without an explicit load fails loudly. The three examples solve the SAME task — show 50 users with each one's post titles — at three depths: naive lazy iteration → `selectinload` → loader strategy chosen by relationship cardinality, with `lazy="raise"` defaults.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show 50 users with each user's post titles.
- **Junior** — SAME — but eager-load posts so it's 2 queries, not 51.
- **Senior** — SAME at production: choose loader by cardinality; default relationships to lazy="raise" so accidental N+1 fails loud instead of slowing the request silently.

## Signature

```python
select(User).options(selectinload(User.posts))   # one extra query, not one per User
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show 50 users with each user's post titles.
# APPROACH  - Iterate users; access user.posts (lazy default); SQLAlchemy
#             emits one SELECT per access. Works, slow.
# STRENGTHS - Simplest code; obvious to read.
# WEAKNESSES- 50 users + 1 query for users + 50 lazy-load queries = 51 RTs.
#             At 100 users that's ~100ms of pure round-trips on localhost,
#             ~1.5s over a managed-DB hop.
from sqlalchemy import select
from sqlalchemy.orm import Session
from myapp.models import User

def show_users_with_posts(session: Session) -> list[dict]:
    users = session.execute(
        select(User).limit(50)
    ).scalars().all()                                # 1 query

    return [
        {
            "name": u.name,
            "post_titles": [p.title for p in u.posts],   # 1 query per user
        }
        for u in users
    ]

# Enable echo to see the queries fly:
# engine = create_engine(URL, echo="debug")
# -> 1 SELECT users... + 50 SELECT posts WHERE user_id = ?
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but eager-load posts so it's 2 queries, not 51.
# APPROACH  - selectinload: 1 SELECT users + 1 SELECT posts WHERE user_id IN (...)
# STRENGTHS - Trivial fix; correct for *-to-many relationships.
# WEAKNESSES- Easy to forget on the next relationship; the bug returns.
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from myapp.models import User

def show_users_with_posts(session: Session) -> list[dict]:
    users = session.execute(
        select(User)
        .options(selectinload(User.posts))            # eager-load with IN(...)
        .limit(50)
    ).scalars().all()
    # Total queries: 2 (users + posts).
    return [
        {"name": u.name, "post_titles": [p.title for p in u.posts]}
        for u in users
    ]

# Diagnostic: log SQL for the duration of the request.
import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME at production: choose loader by cardinality; default
#             relationships to lazy="raise" so accidental N+1 fails loud
#             instead of slowing the request silently.
# APPROACH  - lazy="raise" on EVERY relationship; opt-in eager per query;
#             joinedload for *-to-one (User.address); selectinload for
#             *-to-many (User.posts); contains_eager for hand-rolled JOINs.
# STRENGTHS - N+1 cannot ship; missing eager-load = test failure;
#             query count grows linearly with relationships, not rows.
# WEAKNESSES- Every new query needs an explicit .options(); slightly more
#             ceremony for the safety guarantee.
from sqlalchemy import select, event
from sqlalchemy.orm import (
    Session, DeclarativeBase, Mapped, mapped_column, relationship,
    selectinload, joinedload, contains_eager,
)
from sqlalchemy.exc import InvalidRequestError

class Base(DeclarativeBase): ...

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    # Default to lazy="raise" — accidental access raises InvalidRequestError.
    posts: Mapped[list["Post"]] = relationship(
        back_populates="user", lazy="raise",
    )
    address: Mapped["Address | None"] = relationship(
        back_populates="user", lazy="raise",
    )

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(...)
    title: Mapped[str]
    user: Mapped[User] = relationship(back_populates="posts", lazy="raise")

class Address(Base):
    __tablename__ = "addresses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(...)
    line1: Mapped[str]
    user: Mapped[User] = relationship(back_populates="address", lazy="raise")

# 1) Cardinality-aware loaders.
def show_users_overview(session: Session) -> list[dict]:
    rows = session.execute(
        select(User)
        .options(
            joinedload(User.address),                     # *-to-one  -> JOIN, one query
            selectinload(User.posts),                     # *-to-many -> IN(...), one extra query
        )
        .limit(50)
    ).unique().scalars().all()                            # unique() needed when joinedload + collections
    return [
        {
            "name": u.name,
            "city": u.address.line1 if u.address else None,
            "post_titles": [p.title for p in u.posts],
        }
        for u in rows
    ]

# 2) contains_eager — when you've already JOINed manually for filtering.
def users_with_recent_posts(session: Session) -> list[User]:
    q = (
        select(User).join(Post)
        .where(Post.created_at > "2026-01-01")
        .options(contains_eager(User.posts))              # tell ORM 'posts is in the row'
    )
    return list(session.execute(q).unique().scalars().all())

# 3) Query-count guard for tests — assert "this handler does <= 3 queries".
def query_count_listener(session: Session, count: list[int]):
    @event.listens_for(session.bind, "before_cursor_execute")
    def _on(_conn, _cursor, _stmt, _params, _ctx, _exec):
        count[0] += 1

# Decision rule:
#   *-to-one (User.address)          -> joinedload — one row per parent, JOIN is cheap
#   *-to-many (User.posts)           -> selectinload — IN(...) avoids row-multiplication
#   already JOINed for WHERE         -> contains_eager — don't re-JOIN
#   "give me everything for this row" -> joinedload all *-to-one + selectinload all *-to-many
#   default for new relationships    -> lazy="raise" — N+1 becomes a test failure, not slow prod
#   bulk export of all rows          -> .yield_per(1000) + selectinload — bounded memory
#   query you ALWAYS need eager      -> set lazy="selectin" on the relationship; opt-OUT not opt-in
#
# Anti-pattern: lazy="select" (the default) + iterating a collection in a
# template/loop. The N+1 is invisible until it hits 50× scale, when latency
# spikes and your DB CPU climbs without a clear cause. Default to
# lazy="raise" on every relationship; let CI fail when you forget the option.
```

## Decision Rule

```text
*-to-one (User.address)          -> joinedload — one row per parent, JOIN is cheap
*-to-many (User.posts)           -> selectinload — IN(...) avoids row-multiplication
already JOINed for WHERE         -> contains_eager — don't re-JOIN
"give me everything for this row" -> joinedload all *-to-one + selectinload all *-to-many
default for new relationships    -> lazy="raise" — N+1 becomes a test failure, not slow prod
bulk export of all rows          -> .yield_per(1000) + selectinload — bounded memory
query you ALWAYS need eager      -> set lazy="selectin" on the relationship; opt-OUT not opt-in
```

## Anti-Pattern

> [!warning] Anti-pattern
> lazy="select" (the default) + iterating a collection in a
> template/loop. The N+1 is invisible until it hits 50× scale, when latency
> spikes and your DB CPU climbs without a clear cause. Default to
> lazy="raise" on every relationship; let CI fail when you forget the option.

## Tips

- The default `lazy="select"` is the single biggest perf footgun in SQLAlchemy. Switch to `lazy="raise"` on every relationship and let CI catch missing eager-loads.
- Match the loader to the cardinality: `joinedload` for *-to-one (cheap JOIN), `selectinload` for *-to-many (one extra IN-query, no row explosion).
- Use `contains_eager` when you've already JOINed for filtering. Without it, the ORM re-JOINs to load the relationship and you query the same data twice.
- `echo="debug"` on `create_engine` shows every query with parameters — the fastest way to count round-trips. Turn it off before deploying.
- For tests, attach a `before_cursor_execute` event listener and assert `count <= N`. The test is small and catches regressions immediately.
- `.unique()` is required after `joinedload` of a collection (otherwise the JOIN duplicates parent rows). `selectinload` doesn't need it.

## Common Mistake

> [!warning] Leaving relationships at the default `lazy="select"` and trusting code review to catch N+1. The bug is invisible at small scale (1 user, 1 query) and ships easily; under real traffic it shows up as DB-CPU saturation with no clear culprit. Set `lazy="raise"` as the default; opt into eager loading per-query via `.options(...)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Default lazy="select" + loop = N+1
for user in users:                  # 1 query
    print(len(user.posts))          # 1 query each — N+1
```

**Senior:**
```python
# lazy="raise" + explicit loader = bounded query count
users = session.execute(
    select(User).options(selectinload(User.posts))
).scalars().all()                   # 2 queries total
```

## See Also

- [[Sections/pandas/io/dtype-opt|dtype optimization (Pandas)]]
- [[Sections/pandas/io/pd-eval|pd.eval() (Pandas)]]
- [[Sections/numpy/operations/np-einsum|np.einsum() (NumPy)]]
- [[Sections/database/patterns/_Index|Databases & SQLAlchemy → Database Patterns — Architecture & Concurrency]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]

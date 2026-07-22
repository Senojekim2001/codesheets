---
type: "entry"
domain: "python"
file: "web"
section: "flask"
id: "flask-sqlalchemy"
title: "SQLAlchemy()"
category: "Flask"
subtitle: "Database models, relationships, CRUD operations"
signature_short: "db = SQLAlchemy(app)  |  db.session.add()  |  db.session.query()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SQLAlchemy()"
  - "flask-sqlalchemy"
tags:
  - "python"
  - "python/web"
  - "python/web/flask"
  - "category/flask"
  - "tier/tiered"
---

# SQLAlchemy()

> Database models, relationships, CRUD operations

## Overview

Flask-SQLAlchemy provides an ORM layer on top of SQLAlchemy. Define models as classes, use `db.session` to manage transactions, and leverage query methods for CRUD. Supports relationships between models.

## Signature

```python
db = SQLAlchemy(app)  |  db.session.add()  |  db.session.query()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One model, one row insert, one query
# STRENGTHS - The full ORM round-trip in 12 lines
# WEAKNESSES- No relationships, no migrations, no error handling
#
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db = SQLAlchemy(app)

class User(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

with app.app_context():
    db.create_all()
    db.session.add(User(name="Alice"))
    db.session.commit()
    print(User.query.all())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Two related models, CRUD with commit + rollback
# STRENGTHS - Real relationships, get_or_404, transactional safety
# WEAKNESSES- No migrations (Alembic); plain create_all
#
from flask import Flask, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db = SQLAlchemy(app)

class User(db.Model):
    id    = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    posts = db.relationship("Post", back_populates="author", cascade="all, delete-orphan")

class Post(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    title   = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.ForeignKey("user.id"), nullable=False)
    author  = db.relationship("User", back_populates="posts")

@app.post("/users")
def create_user():
    u = User(email="alice@example.com")
    db.session.add(u)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()                # ALWAYS rollback on failure
        abort(409, description="email taken")
    return jsonify(id=u.id), 201

@app.get("/users/<int:uid>")
def get_user(uid):
    u = db.session.get(User, uid) or abort(404)
    return jsonify(id=u.id, email=u.email, post_count=len(u.posts))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Eager loading, scoped sessions, Alembic migrations, N+1 prevention
# STRENGTHS - The patterns that keep an ORM-backed app fast in production
# WEAKNESSES- N/A
#
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload, selectinload

db = SQLAlchemy()                                     # init_app() in factory

class User(db.Model):
    id    = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    posts = db.relationship("Post", back_populates="author", lazy="raise")  # forces explicit loads

class Post(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    title   = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.ForeignKey("user.id"), nullable=False, index=True)
    author  = db.relationship("User", back_populates="posts")

# 1) Prevent N+1 with explicit loaders.
#    BAD:  for u in User.query.all(): u.posts          # 1 + N queries
#    GOOD: User.query.options(selectinload(User.posts)).all()
def list_users_with_posts():
    return (db.session
              .query(User)
              .options(selectinload(User.posts))      # one extra IN(...) query, not N
              .all())

# 2) Pagination (always cap large lists)
def page_users(page=1, per=50):
    return User.query.paginate(page=page, per_page=per, max_per_page=200)

# 3) Migrations live in Alembic, not create_all()
#       $ flask db init
#       $ flask db migrate -m "add User.email index"
#       $ flask db upgrade

# 4) Connection pool tuning for production (Postgres / MySQL)
#    SQLALCHEMY_ENGINE_OPTIONS = {
#        "pool_size": 10, "max_overflow": 20,
#        "pool_pre_ping": True,                       # detect stale conns
#        "pool_recycle": 280,                          # < server timeout
#    }

# Decision rule:
#   prototype, single user             -> create_all() and SQLite
#   real app                            -> Alembic migrations from day 1
#   list endpoint with relations        -> selectinload / joinedload, never lazy default
#   one-to-one or filtered relation     -> joinedload (single SQL JOIN)
#   one-to-many or many-to-many         -> selectinload (separate IN query, scales)
#
# Anti-pattern: catching IntegrityError without rollback
#   The session is poisoned and every later commit fails. ALWAYS:
#       try:    db.session.commit()
#       except: db.session.rollback(); raise
```

## Decision Rule

```text
prototype, single user             -> create_all() and SQLite
real app                            -> Alembic migrations from day 1
list endpoint with relations        -> selectinload / joinedload, never lazy default
one-to-one or filtered relation     -> joinedload (single SQL JOIN)
one-to-many or many-to-many         -> selectinload (separate IN query, scales)
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching IntegrityError without rollback
>   The session is poisoned and every later commit fails. ALWAYS:
>       try:    db.session.commit()
>       except: db.session.rollback(); raise

## Tips

- Define a `__repr__()` method on models for easier debugging.
- Use `lazy=True` (default) for relationships; load related objects on access.
- Always commit after add/update/delete: `db.session.commit()`.
- When `IntegrityError` (or any commit error) fires, call `db.session.rollback()` in the except branch — otherwise the session is poisoned and every later commit fails
- Avoid the lazy-load default in list endpoints: use `selectinload` (one-to-many / many-to-many, separate IN query) or `joinedload` (one-to-one / filtered, single SQL JOIN) to kill N+1
- Adopt Alembic migrations on day 1 of a real app — `db.create_all()` does not handle column changes safely

## Common Mistake

> [!warning] Forgetting to call `db.session.commit()` after creating or modifying records.

## Shorthand (Junior → Senior)

**Junior:**
```python
user = User()
user.name = "Alice"
user.email = "alice@example.com"
db.session.add(user)
db.session.flush()
db.session.commit()
users = db.session.query(User).filter(User.name == "Alice").all()
```

**Senior:**
```python
db.session.add(User(name="Alice", email="alice@example.com"))
db.session.commit()
users = User.query.filter_by(name="Alice").all()
```

## See Also

- [[Sections/web/flask/flask-app|Flask() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-routes|@app.route() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-request-response|request, jsonify() (Web (Flask, Django))]]
- [[Sections/web/flask/flask-blueprints|Blueprint() (Web (Flask, Django))]]
- [[Sections/web/flask/_Index|Web (Flask, Django) → Flask]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]

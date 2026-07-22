---
type: "entry"
domain: "python"
file: "documentation"
section: "patterns"
id: "docstring-styles"
title: "Docstring styles — Google, NumPy, RST, type-aware"
category: "Patterns"
subtitle: "Google style, NumPy style, RST/Sphinx style, napoleon, mkdocstrings, type hints over :type: tags, examples sections, raises"
signature_short: "def fn(x: int) -> str:
    \"\"\"Short summary.

    Args:
        x: description.

    Returns:
        description.
    \"\"\""
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Docstring styles — Google, NumPy, RST, type-aware"
  - "docstring-styles"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Docstring styles — Google, NumPy, RST, type-aware

> Google style, NumPy style, RST/Sphinx style, napoleon, mkdocstrings, type hints over :type: tags, examples sections, raises

## Overview

Three docstring styles in the wild: **Google** (most human-readable; `Args:`, `Returns:`, `Raises:` sections), **NumPy** (popular in scientific Python; rST-style with `Parameters\n----------`), **RST/Sphinx** (verbose; `:param x:` per arg). All three parse with the `napoleon` Sphinx extension or `mkdocstrings`. With modern type hints, the `:type:` annotations are redundant — leave types in the function signature, describe the parameter's semantics in the docstring. The three examples solve the SAME concrete task — document a `fetch_user` function with parameters, return value, exceptions, and example — at three depths: minimal Google → fully-formatted Google with examples → NumPy and RST equivalents + tooling integration.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Document fetch_user with Google-style docstring.
- **Junior** — SAME — but with full structure: Examples, Notes, See Also.
- **Senior** — SAME — production: linting, validation, examples that stay in sync (doctests).

## Signature

```python
def fn(x: int) -> str:
    """Short summary.

    Args:
        x: description.

    Returns:
        description.
    """
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Document fetch_user with Google-style docstring.
def fetch_user(user_id: int, *, include_orders: bool = False) -> dict:
    """Fetch a user by ID.

    Args:
        user_id: The user's database ID.
        include_orders: Eager-load orders if True.

    Returns:
        A dict with the user's profile data.

    Raises:
        UserNotFound: If no user has that ID.
    """
    ...

# Why Google over RST:
# Google:                          RST equivalent (verbose):
# Args:                             :param user_id: ...
#     user_id: ...                  :type user_id: int
#     include_orders: ...           :param include_orders: ...
# Returns:                          :type include_orders: bool
#     A dict ...                    :returns: ...
# Raises:                            :rtype: dict
#     UserNotFound: ...              :raises UserNotFound: ...
#
# Google is ~30% fewer characters and reads as prose. Type info is in
# the function signature; no need to repeat it as :type: tags.

# Both autodoc-friendly when napoleon extension is enabled (Sphinx)
# or mkdocstrings is configured (MkDocs).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with full structure: Examples, Notes, See Also.

def fetch_user(
    user_id: int,
    *,
    include_orders: bool = False,
    timeout: float = 10.0,
) -> dict:
    """Fetch a user by ID, with optional order eager-loading.

    Performs a single SELECT against the users table; if include_orders
    is True, JOINs with orders. Raises if the user doesn't exist
    (does NOT return None — see :func:`find_user` for the optional variant).

    Args:
        user_id: The user's database ID. Must be positive.
        include_orders: If True, eagerly load the user's orders into
            the returned dict. Adds one JOIN; ~2x slower.
        timeout: Maximum seconds to wait for the database. Default 10.

    Returns:
        A dict with keys:

        - `id` (int): The user's database ID.
        - `email` (str): Primary email.
        - `created_at` (datetime): Account creation timestamp.
        - `orders` (list[dict]): Present only if include_orders=True.

    Raises:
        UserNotFound: If user_id doesn't match any row.
        DatabaseTimeout: If the query exceeds the timeout.
        ValueError: If user_id is not positive.

    Example:
        Basic usage::

            >>> user = fetch_user(42)
            >>> user["email"]
            'alice@example.com'

        With orders::

            >>> user = fetch_user(42, include_orders=True)
            >>> len(user["orders"])
            5

    See Also:
        :func:`find_user`: Returns None on miss instead of raising.
        :func:`fetch_users_batch`: Batch fetch by IDs.

    Note:
        This function is async-unsafe; use `afetch_user` in async code.
    """
    if user_id <= 0:
        raise ValueError("user_id must be positive")
    ...

# === NumPy style equivalent (popular in scientific Python) ===
def numpy_style(x: int, y: float = 1.0) -> float:
    """Compute x + y.

    Parameters
    ----------
    x : int
        Description of x.
    y : float, optional
        Description of y. Default is 1.0.

    Returns
    -------
    float
        Description of the return value.

    Raises
    ------
    ValueError
        If x is negative.

    See Also
    --------
    other_function : Brief related function.

    Notes
    -----
    Longer notes section.

    Examples
    --------
    >>> numpy_style(5)
    6.0
    """
    return x + y

# === RST/Sphinx style (rare for new code) ===
def rst_style(x: int, y: float = 1.0) -> float:
    """Compute x + y.

    :param x: Description of x.
    :param y: Description of y. Default 1.0.
    :returns: Description of return.
    :raises ValueError: If x is negative.
    """
    return x + y
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: linting, validation, examples that
#             stay in sync (doctests).

# === Linters / formatters ===
# Pydocstyle (deprecated; use ruff) checks docstring formatting.
# pydocstyle      OR
# ruff (recommended) — covers it via D rules:
#
# pyproject.toml
# [tool.ruff.lint]
# select = ["E", "F", "I", "D"]                          # D = docstring rules
# [tool.ruff.lint.pydocstyle]
# convention = "google"                                   # or "numpy" or "pep257"
#
# # ruff D rules:
# # D100  Missing docstring in public module
# # D101  Missing docstring in public class
# # D102  Missing docstring in public method
# # D103  Missing docstring in public function
# # D200  One-line docstring should fit on one line
# # D204  1 blank line required after class docstring
# # ... etc.

# === Don't use :type: when you have type hints ===
# BAD (legacy):
def add_legacy(a, b):
    """Add two numbers.

    :param a: First number.
    :type a: int
    :param b: Second number.
    :type b: int
    :returns: Sum.
    :rtype: int
    """
    return a + b

# GOOD (modern):
def add(a: int, b: int) -> int:
    """Add two numbers.

    Args:
        a: First number.
        b: Second number.

    Returns:
        Sum of a and b.
    """
    return a + b
# Type info lives in the signature; sphinx-autodoc-typehints +
# mkdocstrings render them in the description automatically.

# === Class docstrings ===
class UserService:
    """Service for fetching and updating users.

    Attributes:
        db: Database connection.
        cache: Optional Redis cache.

    Example:
        >>> svc = UserService(db=engine)
        >>> svc.fetch(42)
        User(id=42, email='alice@example.com')
    """

    def __init__(self, db, cache=None):
        """Initialize the service.

        Args:
            db: SQLAlchemy engine or session.
            cache: Optional Redis instance for read-through caching.
        """
        self.db = db
        self.cache = cache

# Note: with napoleon's include_init_with_doc, you can put __init__
# docs in the class docstring instead of a separate __init__ docstring.

# === Module docstrings ===
# top of myproject/users.py:
"""User management.

This module provides the User model, UserService for CRUD,
and helpers for password hashing.

Example:
    Basic usage::

        from myproject.users import UserService
        svc = UserService(db=engine)
        user = svc.fetch(42)

Note:
    All operations require an active database connection.
"""

# Decision rule:
#   new project                              -> Google style
#   scientific Python                          -> NumPy style (matches numpy/scipy/pandas)
#   existing project with one style            -> match it; consistency wins
#   already using rST                           -> RST/Sphinx style
#   type info                                    -> use type hints; skip :type:
#   examples                                      -> doctest-friendly format
#   private (_underscore) / dunder              -> can skip; ruff D rules optional
#   docstring style enforcement                  -> ruff with [tool.ruff.lint.pydocstyle]
#   docstring rendering                          -> napoleon (Sphinx) OR mkdocstrings (MkDocs)
#   docstring testing                            -> doctest module + pytest --doctest-modules
#
# Anti-pattern: writing docstrings as :param: / :type: tags when you
# already have type hints. The types are stated twice (signature +
# docstring); they drift; renderers like mkdocstrings handle type
# hints natively. Use Google/NumPy style for prose; let type hints
# stay in the signature.
```

## Decision Rule

```text
new project                              -> Google style
scientific Python                          -> NumPy style (matches numpy/scipy/pandas)
existing project with one style            -> match it; consistency wins
already using rST                           -> RST/Sphinx style
type info                                    -> use type hints; skip :type:
examples                                      -> doctest-friendly format
private (_underscore) / dunder              -> can skip; ruff D rules optional
docstring style enforcement                  -> ruff with [tool.ruff.lint.pydocstyle]
docstring rendering                          -> napoleon (Sphinx) OR mkdocstrings (MkDocs)
docstring testing                            -> doctest module + pytest --doctest-modules
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing docstrings as :param: / :type: tags when you
> already have type hints. The types are stated twice (signature +
> docstring); they drift; renderers like mkdocstrings handle type
> hints natively. Use Google/NumPy style for prose; let type hints
> stay in the signature.

## Tips

- Pick **Google style** for new projects — most human-readable, well-supported by `napoleon` (Sphinx) and `mkdocstrings` (MkDocs).
- NumPy style is the convention in scientific Python — matches numpy/scipy/pandas. Pick if your project lives in that ecosystem.
- NEVER use `:type:` tags when you have type hints. The types are in the signature; repeating them in the docstring just creates drift.
- Use `ruff` with `[tool.ruff.lint.pydocstyle] convention = "google"` to lint docstring style. Replaces the older `pydocstyle` tool.
- `Example:` sections in Google/NumPy format with `>>>` syntax are doctest-runnable — pair with `pytest --doctest-modules` to verify they stay accurate.
- For class docstrings, put `__init__` parameter docs in the CLASS docstring (not in `__init__`) when napoleon's `include_init_with_doc = True`.

## Common Mistake

> [!warning] Using `:param x:` / `:type x:` RST tags in docstrings while ALSO using type hints. The types are stated twice (function signature AND docstring); they drift; type-hint-aware renderers (mkdocstrings, sphinx-autodoc-typehints) handle types natively. Use Google/NumPy style for prose; let type hints stay in the signature.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Types stated twice; drift inevitable
def fetch(uid: int) -> dict:
    """Fetch a user.

    :param uid: ID.
    :type uid: int
    :returns: dict.
    :rtype: dict
    """
```

**Senior:**
```python
# Types in signature only; docstring is prose
def fetch(uid: int) -> dict:
    """Fetch a user.

    Args:
        uid: The user's ID.

    Returns:
        The user dict.
    """
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/documentation/patterns/_Index|Documentation → Documentation Patterns — docstrings, doctest, mkdocs vs sphinx]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

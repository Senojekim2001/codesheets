---
type: "entry"
domain: "python"
file: "documentation"
section: "patterns"
id: "doctest-examples"
title: "Doctest — examples that stay in sync with code"
category: "Patterns"
subtitle: "doctest module, pytest --doctest-modules, doctest_namespace fixture, sybil for richer testing, ELLIPSIS / NORMALIZE_WHITESPACE flags"
signature_short: "$ pytest --doctest-modules src/   # runs every >>> example in every docstring"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Doctest — examples that stay in sync with code"
  - "doctest-examples"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Doctest — examples that stay in sync with code

> doctest module, pytest --doctest-modules, doctest_namespace fixture, sybil for richer testing, ELLIPSIS / NORMALIZE_WHITESPACE flags

## Overview

Doctests are example code in docstrings using `>>>` prompts; the `doctest` stdlib module runs them and verifies output matches. Pair with `pytest --doctest-modules` to run them as part of the regular test suite. Three benefits: examples can't lie (CI fails if they break); examples are runnable (users can copy-paste and verify); examples become unit tests for free. The three examples solve the SAME concrete task — write executable examples for a `fetch_user` function — at three depths: basic doctest → ELLIPSIS / namespace fixture for complex output → sybil for full testing of code blocks in `.md` / `.rst` files.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Make the example in fetch_user's docstring executable.
- **Junior** — SAME — but with ELLIPSIS / NORMALIZE_WHITESPACE for flexible matching, fixtures for setup.
- **Senior** — SAME — production: sybil for testing code in .md docs, skip-if conditions, integration with mkdocs/sphinx.

## Signature

```python
$ pytest --doctest-modules src/   # runs every >>> example in every docstring
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Make the example in fetch_user's docstring executable.
def add(a: int, b: int) -> int:
    """Add two numbers.

    Args:
        a: First.
        b: Second.

    Returns:
        Sum.

    Example:
        >>> add(1, 2)
        3
        >>> add(-5, 5)
        0
        >>> add(100, 200)
        300
    """
    return a + b

# Run via stdlib:
# $ python -m doctest module.py -v
#
# Or via pytest (recommended):
# $ pip install pytest
# $ pytest --doctest-modules src/

# pytest finds every docstring with >>> blocks and runs them.
# If the function's behavior changes, the doctest output won't
# match — CI fails immediately.

# Common gotchas:
# 1. Whitespace matters by default
#    >>> "hello"
#    'hello'             # exact match required
#
# 2. Object reprs aren't always stable
#    >>> User(id=42)
#    <User object at 0x7f8b...>     # address changes; use ELLIPSIS
#
# 3. Set / dict ordering
#    >>> {1, 2, 3}
#    {1, 2, 3}                       # but Python doesn't guarantee order < 3.7
#
# Junior tier handles these.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with ELLIPSIS / NORMALIZE_WHITESPACE for
#             flexible matching, fixtures for setup.

def fetch_user(user_id: int) -> dict:
    """Fetch a user by ID.

    Args:
        user_id: The user's ID.

    Returns:
        dict with the user's profile.

    Example:
        >>> user = fetch_user(42)
        >>> user["id"]
        42
        >>> user["email"]   # doctest: +ELLIPSIS
        '...@example.com'
        >>> "created_at" in user
        True

        For multi-line output, use NORMALIZE_WHITESPACE:

        >>> # doctest: +NORMALIZE_WHITESPACE
        >>> import json
        >>> print(json.dumps({"a": 1, "b": 2}, indent=2))
        {
          "a": 1,
          "b": 2
        }
    """
    return {"id": user_id, "email": f"u{user_id}@example.com",
            "created_at": "2024-12-01T10:00:00Z"}

# === Doctest directives ===
# +ELLIPSIS:           '...' matches any substring
# +NORMALIZE_WHITESPACE: collapse all whitespace
# +SKIP:               skip this line (useful for env-dependent stuff)
# +IGNORE_EXCEPTION_DETAIL: traceback message can vary

# Set defaults for the WHOLE project in pytest config:
# pyproject.toml
# [tool.pytest.ini_options]
# doctest_optionflags = "NORMALIZE_WHITESPACE ELLIPSIS"
# addopts = "--doctest-modules --doctest-glob='*.md'"

# === pytest fixture: doctest_namespace ===
# Inject objects into doctest scope.
# conftest.py:
# import pytest
#
# @pytest.fixture(autouse=True)
# def add_imports(doctest_namespace):
#     import pandas as pd
#     doctest_namespace["pd"] = pd
#     doctest_namespace["sample_df"] = pd.DataFrame({"x": [1, 2, 3]})
#
# Now any docstring can use 'pd' or 'sample_df' without an import:
# def transform(df):
#     """Transform a DataFrame.
#
#     Example:
#         >>> transform(sample_df)
#            x
#         0  1
#         1  2
#         2  3
#     """
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: sybil for testing code in .md docs,
#             skip-if conditions, integration with mkdocs/sphinx.

# === sybil — test code blocks in any documentation file ===
# pip install sybil
#
# conftest.py:
# from sybil import Sybil
# from sybil.parsers.markdown import PythonCodeBlockParser, SkipParser
#
# pytest_collect_file = Sybil(
#     parsers=[PythonCodeBlockParser(), SkipParser()],
#     patterns=["*.md", "*.rst"],
# ).pytest()
#
# Now `pytest` runs every ```python code block in your .md docs.
# Cross-references with running examples in mkdocs!

# === Markdown with executable examples ===
# docs/quickstart.md:
#
# ## Quickstart
#
# Install via pip:
#
# ```python
# import myproject
# user = myproject.fetch_user(42)
# assert user["id"] == 42
# ```
#
# This block runs when pytest is invoked.

# === Skip examples that need network / DB ===
# In a docstring:
# >>> import requests   # doctest: +SKIP
# >>> requests.get("https://api.example.com")   # doctest: +SKIP

# In sybil-tested .md:
# <!-- skip: requires network -->
# ```python
# import requests
# requests.get(...)
# ```

# === Run doctests as part of CI ===
# .github/workflows/test.yml
# - name: Run doctests
#   run: pytest --doctest-modules src/ docs/

# Decision rule:
#   simple example in docstring          -> stdlib doctest with >>>
#   exact output matters                  -> default doctest behavior
#   output varies (timestamps, IDs)        -> +ELLIPSIS or use placeholders
#   complex multi-line output              -> +NORMALIZE_WHITESPACE
#   needs setup data                        -> doctest_namespace fixture in conftest.py
#   needs DB/network                         -> +SKIP; or pytest-vcr for replay
#   examples in .md / .rst docs              -> sybil for cross-format testing
#   want ALL docs tested                      -> pytest --doctest-modules + sybil
#   examples in mkdocs / sphinx              -> sybil + mkdocs build verifies both
#   too rigid for some examples              -> // doctest: +SKIP for env-dependent
#   pandas DataFrame output                   -> use repr explicitly; can be brittle
#                                                consider asserting just .shape and dtypes
#
# Anti-pattern: docstring examples that don't run as doctests. They
# look authoritative ("here's how to use it") but drift silently —
# the function changes, the example doesn't, users copy-paste broken
# code. EITHER make the >>> blocks doctest-runnable AND run them in
# CI, OR explicitly mark them as illustrative-only with a comment.
```

## Decision Rule

```text
simple example in docstring          -> stdlib doctest with >>>
exact output matters                  -> default doctest behavior
output varies (timestamps, IDs)        -> +ELLIPSIS or use placeholders
complex multi-line output              -> +NORMALIZE_WHITESPACE
needs setup data                        -> doctest_namespace fixture in conftest.py
needs DB/network                         -> +SKIP; or pytest-vcr for replay
examples in .md / .rst docs              -> sybil for cross-format testing
want ALL docs tested                      -> pytest --doctest-modules + sybil
examples in mkdocs / sphinx              -> sybil + mkdocs build verifies both
too rigid for some examples              -> // doctest: +SKIP for env-dependent
pandas DataFrame output                   -> use repr explicitly; can be brittle
                                             consider asserting just .shape and dtypes
```

## Anti-Pattern

> [!warning] Anti-pattern
> docstring examples that don't run as doctests. They
> look authoritative ("here's how to use it") but drift silently —
> the function changes, the example doesn't, users copy-paste broken
> code. EITHER make the >>> blocks doctest-runnable AND run them in
> CI, OR explicitly mark them as illustrative-only with a comment.

## Tips

- `pytest --doctest-modules src/` runs every `>>>` block in every docstring under `src/`. Add to CI; examples can't lie.
- Set `doctest_optionflags = "NORMALIZE_WHITESPACE ELLIPSIS"` in pyproject.toml — sane defaults for most examples.
- `# doctest: +SKIP` skips an example without removing it (useful for examples that need network/DB and can't run in CI).
- Use `doctest_namespace` fixture in `conftest.py` to inject common imports / sample data into all doctests. No `>>> import pandas as pd` boilerplate per docstring.
- **sybil** extends this to `.md` and `.rst` files — test code blocks in your docs site so they stay accurate.
- For DataFrame output, prefer asserting `df.shape` and `df.dtypes` over the full repr — repr changes break doctests on minor pandas updates.

## Common Mistake

> [!warning] Writing docstring examples that LOOK like doctests but aren't actually run. They drift silently — the function changes, the example doesn't, users copy-paste broken code. Either make the `>>>` blocks doctest-runnable AND run them in CI, OR explicitly comment them as "illustrative only".

## Shorthand (Junior → Senior)

**Junior:**
```python
# Examples never tested; can drift forever
def fetch(uid):
    """Fetch a user.

    Example:
        >>> fetch(42)["email"]
        'alice@example.com'   # was true 2 years ago
    """
```

**Senior:**
```python
# Examples in CI; can't lie
$ pytest --doctest-modules src/
# CI fails on the day the example breaks.
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/documentation/patterns/_Index|Documentation → Documentation Patterns — docstrings, doctest, mkdocs vs sphinx]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

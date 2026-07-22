---
type: "entry"
domain: "python"
file: "documentation"
section: "sphinx"
id: "sphinx-autodoc"
title: "Sphinx autodoc — generate API docs from docstrings"
category: "Sphinx"
subtitle: "sphinx.ext.autodoc, automodule / autoclass / autofunction, autosummary, sphinx-autodoc-typehints, napoleon for Google/NumPy, autodoc_default_options"
signature_short: ".. automodule:: myproject.users
   :members:
   :undoc-members:
   :show-inheritance:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sphinx autodoc — generate API docs from docstrings"
  - "sphinx-autodoc"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/sphinx"
  - "category/sphinx"
  - "tier/tiered"
---

# Sphinx autodoc — generate API docs from docstrings

> sphinx.ext.autodoc, automodule / autoclass / autofunction, autosummary, sphinx-autodoc-typehints, napoleon for Google/NumPy, autodoc_default_options

## Overview

Sphinx's autodoc is more mature than any alternative — `automodule`, `autoclass`, `autofunction` directives walk Python objects and render their docstrings. `autosummary` generates a table-of-contents page plus stub files for each item. Combined with `napoleon` (Google/NumPy docstring parsing) and `sphinx-autodoc-typehints` (type hints in signatures), you get rich API documentation that auto-updates when code changes. The three examples solve the SAME concrete task — generate API documentation for a Python module — at three depths: `automodule` directive → autosummary + napoleon + custom options → production with intersphinx, type-hint rendering, and gen-files for fully automated reference.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Generate API docs for myproject.users. Add to conf.py: extensions = ["sphinx.ext.autodoc"]
- **Junior** — SAME — but Google-style docstrings + autosummary (one page per object) + type hints. pip install sphinx-autodoc-typehints
- **Senior** — SAME — production: intersphinx cross-refs, custom autodoc skip rules, fully automated module discovery.

## Signature

```python
.. automodule:: myproject.users
   :members:
   :undoc-members:
   :show-inheritance:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Generate API docs for myproject.users.
# Add to conf.py:
# extensions = ["sphinx.ext.autodoc"]

# Create docs/api/users.rst:
# Users
# =====
#
# .. automodule:: myproject.users
#    :members:
#    :undoc-members:
#    :show-inheritance:

# Build:
# $ make html
# /api/users.html now has every public class/function from
# myproject.users with their docstrings rendered.

# === Directives ===
# .. automodule:: myproject              # whole module
#    :members:                            # include all public
#    :undoc-members:                       # include those without docstrings
#    :show-inheritance:                    # show base classes
#    :inherited-members:                   # include inherited
#    :exclude-members: __init__            # skip these
#
# .. autoclass:: myproject.User            # one class
#    :members:
#
# .. autofunction:: myproject.helpers.foo  # one function

# === Caveat: docstrings must be RST or parsed via napoleon ===
# Default: docstrings are interpreted as RST. So:
#   def add(a, b):
#       """Add two numbers.
#
#       :param a: first number.
#       :param b: second number.
#       :returns: sum.
#       """
# Verbose. Junior tier adds napoleon for Google/NumPy styles.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but Google-style docstrings + autosummary
#             (one page per object) + type hints.
# pip install sphinx-autodoc-typehints

# === conf.py ===
# extensions = [
#     "sphinx.ext.autodoc",
#     "sphinx.ext.autosummary",
#     "sphinx.ext.napoleon",
#     "sphinx_autodoc_typehints",
# ]
#
# autosummary_generate = True                            # generate stub .rst files
# autodoc_default_options = {
#     "members": True,
#     "undoc-members": False,
#     "show-inheritance": True,
#     "member-order": "bysource",                        # source order, not alphabetical
# }
# autodoc_typehints = "description"                      # type hints in description
# autodoc_typehints_description_target = "documented"
#
# # Napoleon: parse Google + NumPy docstrings
# napoleon_google_docstring = True
# napoleon_numpy_docstring = True
# napoleon_include_init_with_doc = True
# napoleon_use_param = True                              # use :param: style
# napoleon_use_rtype = True

# === Google-style docstring ===
# def fetch_user(user_id: int, *, include_orders: bool = False) -> dict:
#     """Fetch a user by ID.
#
#     Args:
#         user_id: The user's ID.
#         include_orders: Whether to eager-load orders.
#
#     Returns:
#         A dict with the user's profile and optional orders.
#
#     Raises:
#         UserNotFound: If no user has that ID.
#
#     Example:
#         >>> fetch_user(42)
#         {"id": 42, "name": "Alice"}
#     """

# === autosummary: one page per object ===
# docs/api/index.rst
# API Reference
# =============
#
# .. autosummary::
#    :toctree: generated/
#    :recursive:
#
#    myproject.users
#    myproject.orders
#    myproject.helpers
#
# Sphinx generates docs/api/generated/myproject.users.rst (etc.)
# automatically with full automodule directives.

# === Hide private members ===
# autodoc_default_options["exclude-members"] = "__weakref__,_internal_*"

# === Type-hint rendering ===
# Without sphinx_autodoc_typehints: type hints stay in the signature
# line (cluttered). With it: type hints render in the parameter
# description (cleaner).
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: intersphinx cross-refs, custom autodoc
#             skip rules, fully automated module discovery.

# === conf.py: production autodoc setup ===
# extensions = [
#     "sphinx.ext.autodoc",
#     "sphinx.ext.autosummary",
#     "sphinx.ext.napoleon",
#     "sphinx.ext.intersphinx",
#     "sphinx.ext.viewcode",
#     "sphinx_autodoc_typehints",
#     "sphinx_copybutton",
# ]
#
# # Generate stubs automatically.
# autosummary_generate = True
# autosummary_imported_members = True                    # include imports if their __module__ matches
#
# # Default options applied to every directive.
# autodoc_default_options = {
#     "members": True,
#     "show-inheritance": True,
#     "member-order": "bysource",
#     "exclude-members": "__weakref__,__init_subclass__",
# }
# autodoc_typehints = "description"
# autodoc_typehints_format = "short"
# autodoc_class_signature = "separated"                  # class sig on its own line
# autodoc_preserve_defaults = True                       # keep "abc" not 'abc'
#
# # === Custom skip: don't document _private members or test fixtures ===
# def skip_private(app, what, name, obj, skip, options):
#     if name.startswith("_") and not name.startswith("__"):
#         return True
#     if name.startswith("test_"):
#         return True
#     return skip
#
# def setup(app):
#     app.connect("autodoc-skip-member", skip_private)
#
# # === Intersphinx: cross-link to other projects ===
# intersphinx_mapping = {
#     "python":  ("https://docs.python.org/3", None),
#     "pandas":  ("https://pandas.pydata.org/docs", None),
#     "numpy":   ("https://numpy.org/doc/stable", None),
#     "fastapi": ("https://fastapi.tiangolo.com", None),
# }
# # Now in docstrings:
# #   "See :class:`pandas.DataFrame` for details."
# # auto-links to the pandas docs.
#
# # === Type-hint rendering ===
# typehints_defaults = "comma"                            # show =default in description
# typehints_use_rtype = True
#
# # === Fail on warnings (catches broken refs) ===
# nitpicky = True
# nitpick_ignore_regex = [
#     (r"py:class", r"T|^typing\..*"),                  # ignore TypeVars and typing.X
# ]

# === docs/api/index.rst (auto-driven) ===
# API Reference
# =============
#
# .. autosummary::
#    :toctree: generated
#    :template: module.rst
#    :recursive:
#
#    myproject

# === Custom autosummary template (docs/_templates/module.rst) ===
# {{ fullname | escape | underline }}
#
# .. automodule:: {{ fullname }}
#
#    {% block functions %}
#    {% if functions %}
#    .. rubric:: Functions
#
#    .. autosummary::
#    {% for item in functions %}
#       {{ item }}
#    {%- endfor %}
#    {% endif %}
#    {% endblock %}
#
#    {% block classes %}
#    {% if classes %}
#    .. rubric:: Classes
#
#    .. autosummary::
#       :toctree:
#    {% for item in classes %}
#       {{ item }}
#    {%- endfor %}
#    {% endif %}
#    {% endblock %}

# Decision rule:
#   single module reference                  -> .. automodule:: x.y :members:
#   one class                                  -> .. autoclass:: x.y.Class
#   one function                               -> .. autofunction:: x.y.func
#   recursive auto-discovery                   -> autosummary :recursive:
#   Google docstrings                           -> napoleon extension
#   NumPy docstrings                            -> napoleon (same extension)
#   type hints in description                   -> sphinx_autodoc_typehints
#   skip private                                  -> autodoc_default_options "exclude-members"
#   custom skip rules                             -> connect autodoc-skip-member event
#   cross-link to stdlib / pandas                -> intersphinx_mapping
#   warnings as errors                            -> nitpicky = True (with regex ignores)
#   speed up build                                  -> autodoc_typehints = "none" (skip type hints)
#   document inherited methods                     -> :inherited-members:
#   override per-page                              -> directive options
#   want it FULLY automatic                        -> autosummary :recursive: + custom template
#
# Anti-pattern: hand-writing API docs while also using autodoc. Two
# sources, both maintained, both drift. Pick autodoc OR hand-write,
# not both. autodoc + good docstrings is the right answer for any
# project of size — single source of truth, always in sync.
```

## Decision Rule

```text
single module reference                  -> .. automodule:: x.y :members:
one class                                  -> .. autoclass:: x.y.Class
one function                               -> .. autofunction:: x.y.func
recursive auto-discovery                   -> autosummary :recursive:
Google docstrings                           -> napoleon extension
NumPy docstrings                            -> napoleon (same extension)
type hints in description                   -> sphinx_autodoc_typehints
skip private                                  -> autodoc_default_options "exclude-members"
custom skip rules                             -> connect autodoc-skip-member event
cross-link to stdlib / pandas                -> intersphinx_mapping
warnings as errors                            -> nitpicky = True (with regex ignores)
speed up build                                  -> autodoc_typehints = "none" (skip type hints)
document inherited methods                     -> :inherited-members:
override per-page                              -> directive options
want it FULLY automatic                        -> autosummary :recursive: + custom template
```

## Anti-Pattern

> [!warning] Anti-pattern
> hand-writing API docs while also using autodoc. Two
> sources, both maintained, both drift. Pick autodoc OR hand-write,
> not both. autodoc + good docstrings is the right answer for any
> project of size — single source of truth, always in sync.

## Tips

- `napoleon` extension parses Google/NumPy-style docstrings — much more readable than raw RST.
- `autosummary` with `:recursive:` walks your package tree and generates one .rst stub per module — fully automated reference.
- `sphinx_autodoc_typehints` with `autodoc_typehints = "description"` renders type hints in the parameter description, not the signature line.
- `intersphinx_mapping` links your docstrings to other projects — `:class:`pandas.DataFrame`` becomes a clickable link.
- Connect `autodoc-skip-member` for custom skip rules — exclude `_private`, exclude `test_*`, exclude framework noise.
- `nitpicky = True` makes Sphinx fail on missing references. Use `nitpick_ignore_regex` for unavoidable false positives (TypeVars, etc.).

## Common Mistake

> [!warning] Maintaining hand-written API docs alongside autodoc-generated ones. Two sources, both drift, readers find both, trust the wrong one. Pick ONE: hand-write (small projects, narrative docs) OR autodoc (any project of size). For Python projects, autodoc + good docstrings wins.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Hand-written reference next to autodoc — drift inevitable
docs/api/users.rst:
  Users module
  ============
  .. automodule:: myproject.users
docs/manual/users.rst:
  Users guide
  ===========
  Args: id, email, ...   # transcribed; updates lag
```

**Senior:**
```python
# autodoc only — single source of truth
.. automodule:: myproject.users
   :members:
   :show-inheritance:
```

## See Also

- [[Sections/documentation/sphinx/sphinx-basics|Sphinx basics — quickstart, conf.py, RST + Markdown (Documentation)]]
- [[Sections/documentation/sphinx/sphinx-extensions|Sphinx extensions — diagrams, notebooks, design components (Documentation)]]
- [[Sections/documentation/sphinx/_Index|Documentation → Sphinx — autodoc-strong, RST-historical]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

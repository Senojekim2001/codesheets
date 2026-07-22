---
type: "entry"
domain: "python"
file: "documentation"
section: "mkdocs"
id: "mkdocs-mkdocstrings"
title: "mkdocstrings — auto-generated API reference from docstrings"
category: "MkDocs"
subtitle: "mkdocstrings[python], ::: directive, options (show_source, members, filters), Google / NumPy docstring styles, type-hint integration"
signature_short: "# In docs/api/users.md:
::: myproject.users.User
    options:
      members: [name, save, find_by_email]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mkdocstrings — auto-generated API reference from docstrings"
  - "mkdocs-mkdocstrings"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/mkdocs"
  - "category/mkdocs"
  - "tier/tiered"
---

# mkdocstrings — auto-generated API reference from docstrings

> mkdocstrings[python], ::: directive, options (show_source, members, filters), Google / NumPy docstring styles, type-hint integration

## Overview

`mkdocstrings` is the killer feature that makes MkDocs a real alternative to Sphinx. Pointing `::: my.module` in a Markdown file generates a styled section with classes, methods, type-hint-aware signatures, and rendered docstrings. Pair with Google-style docstrings (most human-readable) and `mkdocs-material` for nice output. The three examples solve the SAME concrete task — generate API reference for a `User` class — at three depths: basic `:::` directive → filtered options + type hints → production with cross-references, custom templates, and live-updating from Python source.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Render API docs for the User class from its docstrings. pip install "mkdocstrings[python]"
- **Junior** — SAME — but filter to specific members, set heading levels, customize options.
- **Senior** — SAME — production: custom templates, cross-references via mkdocs-autorefs, gen-files for fully-automated API pages.

## Signature

```python
# In docs/api/users.md:
::: myproject.users.User
    options:
      members: [name, save, find_by_email]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Render API docs for the User class from its docstrings.
# pip install "mkdocstrings[python]"

# === mkdocs.yml ===
# plugins:
#   - search
#   - mkdocstrings:
#       handlers:
#         python:
#           options:
#             docstring_style: google     # or "numpy" or "sphinx"
#             show_source: true

# === Python source: src/myproject/users.py ===
class User:
    """A user account.

    Attributes:
        id: Unique identifier.
        email: Primary email.
        is_active: Whether the user is active.
    """
    def __init__(self, email: str):
        self.email = email

    def save(self) -> "User":
        """Save the user to the database.

        Returns:
            The saved user.

        Raises:
            ValidationError: If email is invalid.
        """
        return self

# === docs/api/users.md ===
# # Users API
#
# ::: myproject.users.User
#
# That's it. mkdocstrings introspects the module, reads docstrings,
# renders a formatted section with class signature, attributes,
# methods, and the docstring prose.

# Build:
# $ mkdocs serve
# Visit /api/users/ — see the auto-generated reference.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but filter to specific members, set heading levels,
#             customize options.

# === Per-directive options ===
# docs/api/users.md
# # Users API
#
# ## User class
#
# ::: myproject.users.User
#     options:
#       show_root_heading: false           # don't render the "User" heading; we did
#       show_source: true                   # link to source on GitHub
#       members:                            # render only these
#         - save
#         - find_by_email
#         - delete
#       inherited_members: false
#       show_signature_annotations: true    # show type hints in signature
#       separate_signature: true             # signature on its own line
#       merge_init_into_class: true          # merge __init__ params into class docs
#       docstring_section_style: table       # render Args/Returns as table

# === Filters: include/exclude members ===
# ::: myproject.users
#     options:
#       filters:
#         - "!^_"                            # hide everything starting with _
#         - "!^test_"                        # hide test_*
#         - "save"                            # but always include 'save'

# === Cross-references in Markdown ===
# Standard MkDocs links work:
#   [User class][myproject.users.User]
#   See [find_by_email()][myproject.users.User.find_by_email]
# These resolve to the auto-generated anchors.

# === Snippet style: ::: with custom heading ===
# # Authentication
#
# ## Sign-up flow
#
# A new user is created via [`User`][myproject.users.User]. After
# validation, call [`save()`][myproject.users.User.save].
#
# ::: myproject.users.User
#     options:
#       show_bases: true
#       show_signature: true

# === pyproject.toml: where mkdocstrings finds your code ===
# Default: searches sys.path. For src-layout projects:
# # mkdocs.yml
# plugins:
#   - mkdocstrings:
#       handlers:
#         python:
#           paths: [src]                    # add src/ to import path

# === Docstring styles ===
# Google (most human-readable):
#   def fn(x: int) -> str:
#       """Short summary.
#
#       Longer description over multiple lines.
#
#       Args:
#           x: The input value.
#
#       Returns:
#           The string form of x.
#
#       Raises:
#           ValueError: If x < 0.
#       """
#
# NumPy (popular in scientific Python):
#   def fn(x):
#       """Short summary.
#
#       Parameters
#       ----------
#       x : int
#           The input value.
#
#       Returns
#       -------
#       str
#           The string form of x.
#       """
#
# RST/Sphinx (verbose; rarely chosen for new code):
#   def fn(x):
#       """Short summary.
#
#       :param x: The input value.
#       :type x: int
#       :returns: The string form of x.
#       :rtype: str
#       """

# Pick Google for new projects; mkdocstrings + Google is the smoothest combo.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: custom templates, cross-references via
#             mkdocs-autorefs, gen-files for fully-automated API pages.

# === mkdocs.yml (full mkdocstrings config) ===
# plugins:
#   - search
#   - autorefs                               # cross-refs by name across whole site
#   - gen-files:                             # generate doc files dynamically
#       scripts:
#         - scripts/gen_api_pages.py
#   - literate-nav:                          # use a SUMMARY.md for nav
#       nav_file: SUMMARY.md
#   - mkdocstrings:
#       default_handler: python
#       handlers:
#         python:
#           paths: [src]
#           import:                          # follow imports across packages
#             - https://docs.python.org/3/objects.inv
#             - https://pandas.pydata.org/docs/objects.inv
#           options:
#             docstring_style: google
#             docstring_options:
#               ignore_init_summary: true
#               returns_named_value: false
#             show_source: true
#             show_root_heading: true
#             show_root_full_path: false
#             show_object_full_path: false
#             show_category_heading: true
#             show_signature_annotations: true
#             separate_signature: true
#             merge_init_into_class: true
#             docstring_section_style: spacy
#             members_order: source
#             filters: ["!^_"]
#             group_by_category: true
#             show_symbol_type_heading: true
#             show_symbol_type_toc: true

# === scripts/gen_api_pages.py — auto-generate API pages from src/ ===
# """Run by mkdocs-gen-files plugin at build time."""
# from pathlib import Path
# import mkdocs_gen_files
#
# nav = mkdocs_gen_files.Nav()
#
# for path in sorted(Path("src").rglob("*.py")):
#     module_path = path.relative_to("src").with_suffix("")
#     doc_path = path.relative_to("src").with_suffix(".md")
#     full_doc_path = Path("api") / doc_path
#     parts = list(module_path.parts)
#
#     if parts[-1] == "__init__":
#         parts = parts[:-1]
#         doc_path = doc_path.with_name("index.md")
#         full_doc_path = full_doc_path.with_name("index.md")
#     elif parts[-1] == "__main__":
#         continue
#
#     nav[parts] = doc_path.as_posix()
#
#     with mkdocs_gen_files.open(full_doc_path, "w") as fd:
#         identifier = ".".join(parts)
#         print(f"::: {identifier}", file=fd)
#
#     mkdocs_gen_files.set_edit_path(full_doc_path, path)
#
# with mkdocs_gen_files.open("api/SUMMARY.md", "w") as nav_file:
#     nav_file.writelines(nav.build_literate_nav())

# Now adding a new module to src/ AUTOMATICALLY appears in the docs.

# Decision rule:
#   simple module reference                 -> ::: module.path
#   class with custom heading                -> ::: with options.show_root_heading
#   filter members                            -> options.members or options.filters
#   nested heading levels                     -> heading_level option
#   cross-refs across pages                   -> mkdocs-autorefs plugin
#   auto-generate page per module             -> mkdocs-gen-files + script
#   versioned API docs                         -> mike + per-version mkdocstrings
#   external Python objects                    -> objects.inv inventories (Sphinx-style intersphinx)
#   docstrings include code samples            -> mkdocstrings renders fenced code blocks fine
#   docstring tests                              -> doctest module + sybil/pytest
#
# Anti-pattern: writing API documentation by hand alongside docstrings.
# Two sources, both maintained, both drift. mkdocstrings + good
# docstrings means the docs ARE the docstrings — single source of truth,
# always in sync with code.
```

## Decision Rule

```text
simple module reference                 -> ::: module.path
class with custom heading                -> ::: with options.show_root_heading
filter members                            -> options.members or options.filters
nested heading levels                     -> heading_level option
cross-refs across pages                   -> mkdocs-autorefs plugin
auto-generate page per module             -> mkdocs-gen-files + script
versioned API docs                         -> mike + per-version mkdocstrings
external Python objects                    -> objects.inv inventories (Sphinx-style intersphinx)
docstrings include code samples            -> mkdocstrings renders fenced code blocks fine
docstring tests                              -> doctest module + sybil/pytest
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing API documentation by hand alongside docstrings.
> Two sources, both maintained, both drift. mkdocstrings + good
> docstrings means the docs ARE the docstrings — single source of truth,
> always in sync with code.

## Tips

- Pick Google-style docstrings for new projects — most human-readable AND well-supported by mkdocstrings.
- `paths: [src]` in the mkdocstrings handler is essential for src-layout projects; without it, your modules aren't importable.
- `merge_init_into_class: true` shows `__init__` parameters as part of the class signature — cleaner output for classes used as constructors.
- Use `mkdocs-autorefs` for cross-page references by name — `[User][myproject.users.User]` works without manual anchor management.
- For fully auto-generated API pages (one .md per module), use `mkdocs-gen-files` + a script that walks `src/` and writes `:::` directives.
- `intersphinx`-style cross-refs work via `import:` URLs to `objects.inv` — link to Python stdlib, pandas, numpy etc. with auto-generated anchors.

## Common Mistake

> [!warning] Hand-writing API docs alongside docstrings. The two drift; readers find both and trust the wrong one; updating means editing two places. Use `mkdocstrings` so docstrings ARE the docs — single source of truth, always in sync with code.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Hand-write API docs separate from docstrings — drift inevitable
docs/api/users.md:
  ## User
  Args:
    email: ...   # transcribed from docstring; updates lag
```

**Senior:**
```python
# mkdocstrings renders from docstrings — always in sync
docs/api/users.md:
  ::: myproject.users.User
```

## See Also

- [[Sections/documentation/mkdocs/mkdocs-basics|MkDocs basics — config, serve, mkdocs-material (Documentation)]]
- [[Sections/documentation/mkdocs/mkdocs-deployment|MkDocs deployment — gh-pages, ReadTheDocs, custom domain (Documentation)]]
- [[Sections/documentation/mkdocs/_Index|Documentation → MkDocs — Markdown-driven docs sites]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

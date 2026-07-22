---
type: "entry"
domain: "python"
file: "documentation"
section: "sphinx"
id: "sphinx-basics"
title: "Sphinx basics — quickstart, conf.py, RST + Markdown"
category: "Sphinx"
subtitle: "sphinx-quickstart, conf.py, .rst vs .md (myst-parser), sphinx-build, html_theme, intersphinx, ReadTheDocs default"
signature_short: "sphinx-quickstart docs && cd docs && make html"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sphinx basics — quickstart, conf.py, RST + Markdown"
  - "sphinx-basics"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/sphinx"
  - "category/sphinx"
  - "tier/tiered"
---

# Sphinx basics — quickstart, conf.py, RST + Markdown

> sphinx-quickstart, conf.py, .rst vs .md (myst-parser), sphinx-build, html_theme, intersphinx, ReadTheDocs default

## Overview

Sphinx is the longest-running Python docs generator — predates MkDocs by a decade. RST (reStructuredText) is the native markup; Markdown is supported via `myst-parser`. Sphinx's strengths: world-class autodoc (`sphinx.ext.autodoc`), intersphinx for cross-project links, mature theme ecosystem (Furo, RTD, Book), PDF/epub output, multi-language support. Default for Python stdlib, NumPy, SciPy, Django. Choose Sphinx when: you need RST, multi-format output (HTML + PDF + epub), tight integration with ReadTheDocs paid features, or you're writing technical documentation that benefits from RST's structure. The three examples solve the SAME concrete task — set up Sphinx for a Python package — at three depths: quickstart with default theme → Furo + myst-parser + custom config → full ReadTheDocs setup with extensions.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Set up Sphinx for a Python project. pip install sphinx
- **Junior** — SAME — but with Furo theme + Markdown via myst-parser. pip install sphinx furo myst-parser
- **Senior** — SAME — production: ReadTheDocs config, multi-version, custom theme, link check, build matrix.

## Signature

```python
sphinx-quickstart docs && cd docs && make html
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Set up Sphinx for a Python project.
# pip install sphinx

# $ sphinx-quickstart docs
#   ... interactive prompts ...
#   project name: My Project
#   author: Me
#   release: 0.1
#   language: en
# Creates:
#   docs/
#     conf.py
#     index.rst
#     Makefile
#     make.bat
#     _build/
#     _static/
#     _templates/

# === docs/index.rst ===
# Welcome to My Project
# ======================
#
# .. toctree::
#    :maxdepth: 2
#    :caption: Contents:
#
#    getting-started
#    api/index
#
# Indices and tables
# ==================
#
# * :ref:`genindex`
# * :ref:`modindex`
# * :ref:`search`

# === Build HTML ===
# $ cd docs && make html
# Output in docs/_build/html/

# Open docs/_build/html/index.html in a browser.

# === RST cheat sheet ===
# Heading 1
# =========
#
# Heading 2
# ---------
#
# Heading 3
# ~~~~~~~~~
#
# **bold**
# *italic*
# ``code``
#
# - bullet 1
# - bullet 2
#
# 1. numbered 1
# 2. numbered 2
#
# .. note::
#
#    A note callout.
#
# .. code-block:: python
#
#    def hello():
#        print("hi")
#
# Cross-reference: :ref:`anchor-name`
# Link: `text <https://example.com>`_

# Default theme is alabaster (basic). Junior tier upgrades.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with Furo theme + Markdown via myst-parser.
# pip install sphinx furo myst-parser

# === docs/conf.py ===
# # Configuration file for Sphinx documentation.
#
# project = "My Project"
# copyright = "2026, Me"
# author = "Me"
# release = "0.1.0"
#
# extensions = [
#     "sphinx.ext.autodoc",                      # auto-generate from docstrings
#     "sphinx.ext.napoleon",                      # Google/NumPy-style docstrings
#     "sphinx.ext.intersphinx",                   # cross-project links
#     "sphinx.ext.viewcode",                      # link to source
#     "sphinx.ext.todo",                          # .. todo:: directive
#     "myst_parser",                              # Markdown support
#     "sphinx_copybutton",                        # copy-code buttons
# ]
#
# templates_path = ["_templates"]
# exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]
#
# # === Source files: both .rst and .md ===
# source_suffix = {
#     ".rst": "restructuredtext",
#     ".md":  "markdown",
# }
#
# # === Theme: Furo (modern, clean) ===
# html_theme = "furo"
# html_static_path = ["_static"]
# html_title = "My Project"
# html_theme_options = {
#     "sidebar_hide_name": True,
#     "navigation_with_keys": True,
#     "source_repository": "https://github.com/myorg/myproject/",
#     "source_branch": "main",
#     "source_directory": "docs/",
# }
#
# # === Autodoc settings ===
# autodoc_default_options = {
#     "members": True,
#     "undoc-members": False,
#     "show-inheritance": True,
# }
# autodoc_typehints = "description"               # show type hints in description
# autodoc_typehints_format = "short"
#
# # === Napoleon: parse Google/NumPy docstrings ===
# napoleon_google_docstring = True
# napoleon_numpy_docstring = True
# napoleon_include_init_with_doc = False
# napoleon_include_private_with_doc = False
#
# # === Intersphinx: link to other projects' docs ===
# intersphinx_mapping = {
#     "python": ("https://docs.python.org/3", None),
#     "pandas": ("https://pandas.pydata.org/docs", None),
#     "numpy":  ("https://numpy.org/doc/stable", None),
# }
#
# # === MyST: enable extensions ===
# myst_enable_extensions = [
#     "colon_fence",                              # ::: blocks
#     "deflist",                                   # definition lists
#     "tasklist",                                  # - [x] task lists
#     "linkify",                                   # auto-link URLs
# ]

# === Markdown source: docs/getting-started.md ===
# # Getting Started
#
# Install via pip:
#
# ```bash
# pip install myproject
# ```
#
# :::{note}
# Requires Python 3.10+
# :::

# Build:
# $ make html
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: ReadTheDocs config, multi-version,
#             custom theme, link check, build matrix.

# === .readthedocs.yaml ===
# version: 2
# build:
#   os: ubuntu-22.04
#   tools:
#     python: "3.12"
#   jobs:
#     post_create_environment:
#       - pip install -e .[docs]
# sphinx:
#   configuration: docs/conf.py
#   fail_on_warning: true
# python:
#   install:
#     - method: pip
#       path: .
#       extra_requirements: [docs]
# formats:
#   - htmlzip
#   - pdf
#   - epub

# === pyproject.toml: docs extras ===
# [project.optional-dependencies]
# docs = [
#   "sphinx>=7",
#   "furo",
#   "myst-parser",
#   "sphinx-copybutton",
#   "sphinx-design",                              # tabs, grids, cards
#   "sphinx-tabs",
#   "sphinxcontrib-mermaid",                      # mermaid diagrams
#   "sphinx-autobuild",                           # auto-rebuild on file changes
#   "sphinx-autodoc-typehints",                   # better type-hint rendering
# ]

# === Local dev: auto-rebuild on changes ===
# $ pip install sphinx-autobuild
# $ sphinx-autobuild docs docs/_build/html
# Opens browser, rebuilds on file save (like mkdocs serve).

# === Multi-version on RTD ===
# RTD admin → Versions → Activate per branch/tag.
# Each version builds at PROJECT.readthedocs.io/en/VERSION/.
# Default version is configurable; latest = "stable".

# === conf.py extras for production ===
# # Doctest integration:
# extensions += ["sphinx.ext.doctest"]
# # Run with: $ make doctest
#
# # Coverage check:
# extensions += ["sphinx.ext.coverage"]
# # Run with: $ make coverage; identifies undocumented members.
#
# # GitHub edit links:
# html_context = {
#     "display_github": True,
#     "github_user": "myorg",
#     "github_repo": "myproject",
#     "github_version": "main",
#     "conf_py_path": "/docs/",
# }
#
# # Build with full path tracking (catches stale anchors):
# nitpicky = True                                  # warn on missing references
# nitpick_ignore = [("py:class", "T")]              # but ignore these

# === Link checker ===
# $ make linkcheck
# Reports broken external links.

# === GitHub Actions: build + RTD trigger ===
# .github/workflows/docs.yml
# name: Docs
# on:
#   push:
#     branches: [main]
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-python@v5
#         with: { python-version: "3.12" }
#       - run: |
#           pip install -e .[docs]
#           cd docs && make html SPHINXOPTS="-W"   # -W = warnings as errors
#           make linkcheck

# Decision rule:
#   default Python theme                    -> Furo (modern) or sphinx-book-theme
#   classic ReadTheDocs                       -> sphinx-rtd-theme
#   need RST                                   -> Sphinx (always)
#   need Markdown                              -> myst-parser (works in Sphinx)
#   need PDF / epub                             -> Sphinx (built-in)
#   API docs from docstrings                   -> sphinx.ext.autodoc + napoleon
#   cross-project references                    -> intersphinx
#   docstring style                              -> Google or NumPy via Napoleon
#   want hot reload                              -> sphinx-autobuild
#   complex Markdown features                    -> myst-parser + extensions
#   diagrams                                      -> sphinxcontrib-mermaid; or rst-include images
#   need notebooks in docs                        -> myst-nb (executes notebooks at build)
#   tabbed content                                 -> sphinx-design or sphinx-tabs
#
# Anti-pattern: starting Sphinx with default conf.py + alabaster theme
# and never updating. Default theme looks dated; users assume the
# project itself is dated. Pick Furo (or sphinx-rtd-theme for that
# classic Python feel) on day one.
```

## Decision Rule

```text
default Python theme                    -> Furo (modern) or sphinx-book-theme
classic ReadTheDocs                       -> sphinx-rtd-theme
need RST                                   -> Sphinx (always)
need Markdown                              -> myst-parser (works in Sphinx)
need PDF / epub                             -> Sphinx (built-in)
API docs from docstrings                   -> sphinx.ext.autodoc + napoleon
cross-project references                    -> intersphinx
docstring style                              -> Google or NumPy via Napoleon
want hot reload                              -> sphinx-autobuild
complex Markdown features                    -> myst-parser + extensions
diagrams                                      -> sphinxcontrib-mermaid; or rst-include images
need notebooks in docs                        -> myst-nb (executes notebooks at build)
tabbed content                                 -> sphinx-design or sphinx-tabs
```

## Anti-Pattern

> [!warning] Anti-pattern
> starting Sphinx with default conf.py + alabaster theme
> and never updating. Default theme looks dated; users assume the
> project itself is dated. Pick Furo (or sphinx-rtd-theme for that
> classic Python feel) on day one.

## Tips

- For modern Sphinx output, use the **Furo** theme — clean, dark mode, mobile-friendly. Default `alabaster` looks dated.
- Use **myst-parser** so you can write docs in Markdown OR RST in the same project. RST for autodoc, Markdown for prose.
- **Napoleon** (`sphinx.ext.napoleon`) lets you write Google/NumPy-style docstrings instead of RST-style — much more readable.
- **sphinx-autobuild** gives you `mkdocs serve`-style hot-reload: `sphinx-autobuild docs docs/_build/html` watches files and rebuilds.
- **ReadTheDocs** is the default Python docs host — free for OSS, builds on every push, multi-version dropdown built in.
- `make html SPHINXOPTS="-W"` treats warnings as errors — critical for CI to catch broken refs and missing files.

## Common Mistake

> [!warning] Starting Sphinx with the default `alabaster` theme and never upgrading. The default looks like a decade-old project; users assume the docs (and project) are abandoned. Pick a modern theme on day one — Furo for new projects, `sphinx-rtd-theme` for the familiar Python feel.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Default Sphinx — looks like 2010
# conf.py
html_theme = "alabaster"
```

**Senior:**
```python
# Modern — Furo or sphinx-rtd-theme
# conf.py
html_theme = "furo"
# OR
html_theme = "sphinx_rtd_theme"
```

## See Also

- [[Sections/documentation/sphinx/sphinx-autodoc|Sphinx autodoc — generate API docs from docstrings (Documentation)]]
- [[Sections/documentation/sphinx/sphinx-extensions|Sphinx extensions — diagrams, notebooks, design components (Documentation)]]
- [[Sections/documentation/sphinx/_Index|Documentation → Sphinx — autodoc-strong, RST-historical]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

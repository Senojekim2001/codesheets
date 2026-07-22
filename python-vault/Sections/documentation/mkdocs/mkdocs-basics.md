---
type: "entry"
domain: "python"
file: "documentation"
section: "mkdocs"
id: "mkdocs-basics"
title: "MkDocs basics — config, serve, mkdocs-material"
category: "MkDocs"
subtitle: "mkdocs new, mkdocs.yml, mkdocs serve, nav structure, mkdocs-material features (search, palette, code copy)"
signature_short: "pip install mkdocs mkdocs-material; mkdocs new myproject; mkdocs serve"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MkDocs basics — config, serve, mkdocs-material"
  - "mkdocs-basics"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/mkdocs"
  - "category/mkdocs"
  - "tier/tiered"
---

# MkDocs basics — config, serve, mkdocs-material

> mkdocs new, mkdocs.yml, mkdocs serve, nav structure, mkdocs-material features (search, palette, code copy)

## Overview

MkDocs takes Markdown files and renders a docs site — fast, simple, hot-reload during dev. The default theme is plain; almost every modern project uses `mkdocs-material` (Material for MkDocs) which adds search, dark mode, code copy buttons, admonitions, and dozens of plugins. The three examples solve the SAME concrete task — set up a docs site with home + reference pages — at three depths: minimal `mkdocs new` → mkdocs-material with search + palette + nav → production with custom domain, plugins, and CI deployment.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Stand up a docs site with home + getting-started + API. pip install mkdocs
- **Junior** — SAME — but with mkdocs-material theme: search, dark mode, code copy, admonitions. pip install mkdocs-material
- **Senior** — SAME — production: custom domain, plugins, versioning, link checking, edit-on-github.

## Signature

```python
pip install mkdocs mkdocs-material; mkdocs new myproject; mkdocs serve
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Stand up a docs site with home + getting-started + API.
# pip install mkdocs

# Create scaffold:
#   $ mkdocs new myproject
#   $ cd myproject
# Creates:
#   myproject/
#     mkdocs.yml
#     docs/
#       index.md         <- home page

# Add more pages — just create .md files under docs/:
#   docs/getting-started.md
#   docs/api/users.md

# === mkdocs.yml ===
# site_name: My Project
# nav:
#   - Home: index.md
#   - Getting Started: getting-started.md
#   - API:
#       - Users: api/users.md
#       - Orders: api/orders.md

# Run dev server with hot reload:
#   $ mkdocs serve
# Opens http://localhost:8000 — edits to .md auto-refresh in browser.

# Build static site:
#   $ mkdocs build         # output in site/
# Serve site/ from any static host (S3, Netlify, GitHub Pages).

# Default theme is bare-bones. Junior tier upgrades to mkdocs-material.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with mkdocs-material theme: search, dark mode,
#             code copy, admonitions.
# pip install mkdocs-material

# === mkdocs.yml ===
# site_name: My Project
# site_url: https://docs.example.com
# repo_url: https://github.com/myorg/myproject
# repo_name: myorg/myproject
#
# theme:
#   name: material
#   logo: assets/logo.svg
#   favicon: assets/favicon.png
#   palette:
#     - scheme: default
#       primary: indigo
#       accent: indigo
#       toggle: { icon: material/brightness-7, name: Switch to dark }
#     - scheme: slate
#       primary: indigo
#       accent: indigo
#       toggle: { icon: material/brightness-4, name: Switch to light }
#   features:
#     - navigation.tabs               # top-level tabs
#     - navigation.sections           # group nav by section
#     - navigation.expand              # auto-expand sections
#     - navigation.top                 # back-to-top button
#     - search.suggest                 # search auto-suggest
#     - search.highlight               # highlight matched terms
#     - content.code.copy              # copy button on code blocks
#     - content.code.annotate          # numbered annotations
#     - content.tabs.link              # cross-tab linking
#
# markdown_extensions:
#   - admonition                       # !!! note ... callouts
#   - pymdownx.details                 # collapsible sections
#   - pymdownx.superfences             # nested code blocks
#   - pymdownx.tabbed:                 # tabbed content
#       alternate_style: true
#   - pymdownx.highlight:              # syntax highlighting
#       anchor_linenums: true
#   - pymdownx.inlinehilite
#   - pymdownx.snippets                # include other files
#   - tables
#   - footnotes
#   - toc:
#       permalink: true                # add # link next to headings

# === Markdown features unlocked ===
# !!! note "Optional title"
#     This renders as a callout box.
#
# !!! warning
#     Common pitfall here.
#
# === "Tab 1"
#     Content of tab 1
#
# === "Tab 2"
#     Content of tab 2
#
# # code block with line numbers + highlight specific lines:
# ```python hl_lines="2 3" linenums="1"
# def hello():
#     print("highlighted")
#     return 42
# ```

# Run:
#   $ mkdocs serve
# Material design, search, dark mode all work.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: custom domain, plugins, versioning,
#             link checking, edit-on-github.

# === mkdocs.yml (production) ===
# site_name: My Project
# site_url: https://docs.example.com
# site_description: Production-grade documentation for My Project.
# site_author: My Team
#
# repo_url: https://github.com/myorg/myproject
# edit_uri: edit/main/docs/                            # "Edit on GitHub" link
#
# theme:
#   name: material
#   custom_dir: overrides                              # override theme templates
#   features:
#     - navigation.tabs
#     - navigation.sections
#     - navigation.indexes                              # section index pages
#     - navigation.tracking                             # update URL on scroll
#     - navigation.footer                               # prev/next at footer
#     - search.suggest
#     - search.highlight
#     - search.share                                    # share URL with search query
#     - content.code.copy
#     - content.code.annotate
#     - content.tabs.link
#     - content.tooltips
#     - content.action.edit                             # edit-this-page button
#
# extra:
#   social:
#     - icon: fontawesome/brands/github
#       link: https://github.com/myorg/myproject
#     - icon: fontawesome/brands/python
#       link: https://pypi.org/project/myproject/
#   version:
#     provider: mike                                    # multi-version dropdown
#
# plugins:
#   - search
#   - mkdocstrings:                                     # auto-generated API docs
#       default_handler: python
#       handlers:
#         python:
#           options:
#             show_root_heading: true
#             show_source: true
#             docstring_style: google
#   - git-revision-date-localized:                       # "Last updated: ..." per page
#       enable_creation_date: true
#   - minify:                                             # minify HTML output
#       minify_html: true
#   - redirects:                                          # 301 old URLs to new
#       redirect_maps:
#         "old/path.md": "new/path.md"

# === Multi-version docs via 'mike' ===
# pip install mike
# $ mike deploy --push --update-aliases 1.4 latest
# $ mike set-default --push latest
# Now docs.example.com/1.4/ AND /latest/ both serve; switcher in UI.

# === GitHub Actions deployment ===
# .github/workflows/docs.yml
# name: docs
# on:
#   push:
#     branches: [main]
# permissions:
#   contents: write
# jobs:
#   deploy:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#         with: { fetch-depth: 0 }
#       - uses: actions/setup-python@v5
#         with: { python-version: "3.12" }
#       - run: pip install mkdocs-material mkdocstrings[python] mkdocs-git-revision-date-localized-plugin
#       - run: mkdocs gh-deploy --force

# === Link checker in CI ===
# pip install linkchecker
# $ mkdocs build && linkchecker site/

# === Custom CSS / JS overrides ===
# overrides/main.html (extends material theme)
# {% extends "base.html" %}
# {% block extrahead %}
#   <link rel="stylesheet" href="{{ 'assets/extra.css' | url }}">
# {% endblock %}

# Decision rule:
#   Markdown source                       -> MkDocs
#   need autodoc from docstrings           -> MkDocs + mkdocstrings (Python plugin)
#   technical reference (API)               -> mkdocstrings handles it
#   need RST                                  -> Sphinx (next entries)
#   need versioned docs                       -> mike plugin for MkDocs
#   need PDF export                            -> Sphinx is better for that
#   internal team docs                         -> MkDocs; ship to internal hosting
#   public OSS project                         -> ReadTheDocs (Sphinx) OR mkdocs gh-deploy
#   docstring style                            -> Google (most readable; mkdocstrings supports)
#   want full text search                      -> built-in client-side; or Algolia DocSearch for big sites
#   custom theme                               -> overrides/ dir extends material
#   plugins (typer, draw.io, mermaid)          -> all available; check pypi
#
# Anti-pattern: maintaining docs in two places (README.md + docs/).
# README drifts; docs site shows stale info; users find both and
# trust the wrong one. Make the docs site the source of truth; let
# README link to it for setup-only.
```

## Decision Rule

```text
Markdown source                       -> MkDocs
need autodoc from docstrings           -> MkDocs + mkdocstrings (Python plugin)
technical reference (API)               -> mkdocstrings handles it
need RST                                  -> Sphinx (next entries)
need versioned docs                       -> mike plugin for MkDocs
need PDF export                            -> Sphinx is better for that
internal team docs                         -> MkDocs; ship to internal hosting
public OSS project                         -> ReadTheDocs (Sphinx) OR mkdocs gh-deploy
docstring style                            -> Google (most readable; mkdocstrings supports)
want full text search                      -> built-in client-side; or Algolia DocSearch for big sites
custom theme                               -> overrides/ dir extends material
plugins (typer, draw.io, mermaid)          -> all available; check pypi
```

## Anti-Pattern

> [!warning] Anti-pattern
> maintaining docs in two places (README.md + docs/).
> README drifts; docs site shows stale info; users find both and
> trust the wrong one. Make the docs site the source of truth; let
> README link to it for setup-only.

## Tips

- `mkdocs-material` is the de-facto theme — search, dark mode, copy buttons, admonitions all work out of the box.
- Use `navigation.tabs` for top-level tabs (multi-section sites) and `navigation.indexes` to make a section's landing page act as the index.
- For "Edit on GitHub" links, set `repo_url` and `edit_uri: edit/main/docs/`. Material adds the button automatically.
- `mkdocstrings` plugin auto-generates API reference from docstrings — point at a module, get formatted docs. Works with Google / NumPy / Sphinx styles.
- For multi-version docs, use the `mike` tool — deploys each version to a separate path; UI switcher; one site for all versions.
- Run `linkchecker site/` in CI to catch broken links — invaluable for docs that grow over time.

## Common Mistake

> [!warning] Maintaining the same content in both README.md and the docs site. README drifts; docs site shows stale info; users find both and trust the wrong one. Pick one source of truth (usually the docs site) and have README link to it for installation/quickstart only.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Two sources, both maintained, both drift
README.md: "see installation steps below" (out of date)
docs/install.md: "see installation steps" (newer)
```

**Senior:**
```python
# Single source: docs/. README points to it.
README.md: "Full docs: https://docs.example.com"
# docs/install.md is the only place install is documented.
```

## See Also

- [[Sections/documentation/mkdocs/mkdocs-mkdocstrings|mkdocstrings — auto-generated API reference from docstrings (Documentation)]]
- [[Sections/documentation/mkdocs/mkdocs-deployment|MkDocs deployment — gh-pages, ReadTheDocs, custom domain (Documentation)]]
- [[Sections/documentation/mkdocs/_Index|Documentation → MkDocs — Markdown-driven docs sites]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

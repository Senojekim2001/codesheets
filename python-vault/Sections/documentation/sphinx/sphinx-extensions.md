---
type: "entry"
domain: "python"
file: "documentation"
section: "sphinx"
id: "sphinx-extensions"
title: "Sphinx extensions — diagrams, notebooks, design components"
category: "Sphinx"
subtitle: "sphinx-design (tabs, grids, cards), sphinxcontrib-mermaid, myst-nb (executable notebooks), sphinx-copybutton, sphinx-tabs, breathe (C++)"
signature_short: "extensions = [\"sphinx_design\", \"myst_nb\", \"sphinxcontrib.mermaid\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Sphinx extensions — diagrams, notebooks, design components"
  - "sphinx-extensions"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/sphinx"
  - "category/sphinx"
  - "tier/tiered"
---

# Sphinx extensions — diagrams, notebooks, design components

> sphinx-design (tabs, grids, cards), sphinxcontrib-mermaid, myst-nb (executable notebooks), sphinx-copybutton, sphinx-tabs, breathe (C++)

## Overview

Sphinx's extensions ecosystem covers nearly every doc-tooling need: `sphinx-design` (tabs, grids, cards), `myst-nb` (executable Jupyter notebooks AS doc pages), `sphinxcontrib-mermaid` (mermaid diagrams), `sphinx-copybutton` (one-click code copy), `sphinx-gallery` (auto-generated example pages from .py files). The three examples solve the SAME concrete task — add interactive tabbed content + a flowchart + an executable example notebook to the docs — at three depths: sphinx-tabs basic → sphinx-design (modern) + mermaid → myst-nb running notebooks at build time + auto-generated gallery.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Add tabbed code samples (Python vs JS). pip install sphinx-tabs
- **Junior** — SAME — sphinx-design (modern, more components) + mermaid. pip install sphinx-design sphinxcontrib-mermaid
- **Senior** — SAME — production: executable notebooks via myst-nb, auto-generated gallery from .py example files. pip install myst-nb sphinx-gallery

## Signature

```python
extensions = ["sphinx_design", "myst_nb", "sphinxcontrib.mermaid"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Add tabbed code samples (Python vs JS).
# pip install sphinx-tabs

# === conf.py ===
# extensions = ["sphinx_tabs.tabs"]

# === In a .rst page ===
# .. tabs::
#
#    .. tab:: Python
#
#       .. code-block:: python
#
#          import requests
#          requests.get("https://example.com")
#
#    .. tab:: JavaScript
#
#       .. code-block:: javascript
#
#          fetch("https://example.com")

# === Or in Markdown (myst-parser + sphinx-tabs) ===
# ```{tabs}
# .. tab:: Python
#
#    ```python
#    requests.get(...)
#    ```
# .. tab:: JavaScript
#
#    ```javascript
#    fetch(...)
#    ```
# ```

# Build:
# $ make html
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sphinx-design (modern, more components) + mermaid.
# pip install sphinx-design sphinxcontrib-mermaid

# === conf.py ===
# extensions = [
#     "sphinx_design",
#     "sphinxcontrib.mermaid",
#     "myst_parser",
# ]
#
# myst_enable_extensions = ["colon_fence"]

# === Tabs (Markdown) ===
# :::{tab-set}
# :::{tab-item} Python
# ```python
# import requests
# requests.get("https://example.com")
# ```
# :::
# :::{tab-item} JavaScript
# ```javascript
# fetch("https://example.com")
# ```
# :::
# :::

# === Cards / grids ===
# :::{grid} 2
# :::{grid-item-card} Quick Start
# :link: getting-started
# :link-type: doc
# Get up and running in 5 minutes.
# :::
# :::{grid-item-card} API Reference
# :link: api/index
# :link-type: doc
# Full API documentation.
# :::
# :::

# === Mermaid diagram ===
# ```{mermaid}
# graph LR
#   A[User] -->|1. login| B[Auth Service]
#   B -->|2. token| A
#   A -->|3. call API| C[API Server]
#   C -->|4. validate| B
# ```

# === Admonitions / dropdowns ===
# :::{dropdown} Click to expand
# :icon: info
# Hidden details here.
# :::
#
# :::{warning}
# Don't do this in production.
# :::

# === Buttons ===
# :::{button-link} https://github.com/myorg/myproject
# :color: primary
# View on GitHub
# :::

# === Code reference / copy button ===
# pip install sphinx-copybutton
# # conf.py extensions += ["sphinx_copybutton"]
# # Now every code block has a copy icon.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: executable notebooks via myst-nb,
#             auto-generated gallery from .py example files.
# pip install myst-nb sphinx-gallery

# === conf.py ===
# extensions = [
#     "myst_nb",                             # replaces myst_parser; supports .md AND .ipynb
#     "sphinx_design",
#     "sphinxcontrib.mermaid",
#     "sphinx_copybutton",
#     "sphinx_gallery.gen_gallery",
#     "sphinx.ext.autodoc",
#     "sphinx.ext.napoleon",
# ]
#
# # === myst-nb config ===
# nb_execution_mode = "auto"                 # "auto" | "force" | "off" | "cache"
# nb_execution_timeout = 60                  # seconds per cell
# nb_execution_excludepatterns = ["broken_*"]
# nb_merge_streams = True                    # combine stdout/stderr per cell
#
# # === sphinx-gallery: auto-generate examples gallery from .py files ===
# sphinx_gallery_conf = {
#     "examples_dirs": ["../examples"],      # source: examples/*.py
#     "gallery_dirs": ["gallery"],           # output: docs/gallery/*.rst
#     "filename_pattern": r"plot_",
#     "ignore_pattern": r"__init__\.py",
#     "show_signature": False,
#     "thumbnail_size": (400, 280),
# }

# === An executable notebook page ===
# docs/tutorials/quickstart.md (or .ipynb):
#
# # Quickstart
#
# Let's compute basic statistics:
#
# ```{code-cell} ipython3
# import pandas as pd
# import numpy as np
#
# df = pd.DataFrame({"a": np.random.rand(100), "b": np.random.rand(100)})
# df.describe()
# ```
#
# Now plot:
#
# ```{code-cell} ipython3
# df.plot.scatter("a", "b");
# ```
#
# myst-nb executes these cells at build time and embeds outputs.
# Cache by default; re-runs only on source change.

# === Examples gallery (sphinx-gallery) ===
# Project structure:
#   examples/
#     plot_basic.py        <- becomes docs/gallery/plot_basic.html
#     plot_advanced.py
#
# examples/plot_basic.py:
# """
# Basic example
# =============
#
# This example shows the simplest usage.
# """
# import myproject
# import matplotlib.pyplot as plt
#
# # %%
# # First, do this:
# x = myproject.compute(...)
#
# # %%
# # Then plot:
# plt.plot(x)
# plt.show()
#
# Build generates a gallery page with rendered output, downloadable
# .py and .ipynb versions.

# Decision rule:
#   tabbed content                          -> sphinx-design tab-set OR sphinx-tabs
#   diagrams                                  -> sphinxcontrib-mermaid (most common)
#                                                 sphinx-gallery (matplotlib gallery)
#                                                 graphviz (sphinx.ext.graphviz)
#   executable notebook                       -> myst-nb (replaces myst_parser)
#   examples directory                          -> sphinx-gallery
#   "edit on GitHub"                           -> html_context with github fields
#   download buttons                            -> sphinx-design button-link
#   copy code                                    -> sphinx-copybutton
#   API stub generation                          -> sphinx.ext.autosummary :recursive:
#   architecture decision records (ADRs)         -> myst-parser; just write Markdown
#   blog-style                                    -> ablog extension; tags + RSS
#   redirects                                      -> sphinx_reredirects extension
#   versioning                                     -> readthedocs activates per-branch/tag
#   typing-aware doc                                -> sphinx_autodoc_typehints
#   intersphinx                                     -> sphinx.ext.intersphinx
#
# Anti-pattern: installing 20 sphinx extensions just because they
# exist. Each adds build time, maintenance burden, and learning curve.
# Start minimal (autodoc + napoleon + myst-parser); add only when you
# have a documented need (tabs in 5+ pages = add sphinx-design).
```

## Decision Rule

```text
tabbed content                          -> sphinx-design tab-set OR sphinx-tabs
diagrams                                  -> sphinxcontrib-mermaid (most common)
                                              sphinx-gallery (matplotlib gallery)
                                              graphviz (sphinx.ext.graphviz)
executable notebook                       -> myst-nb (replaces myst_parser)
examples directory                          -> sphinx-gallery
"edit on GitHub"                           -> html_context with github fields
download buttons                            -> sphinx-design button-link
copy code                                    -> sphinx-copybutton
API stub generation                          -> sphinx.ext.autosummary :recursive:
architecture decision records (ADRs)         -> myst-parser; just write Markdown
blog-style                                    -> ablog extension; tags + RSS
redirects                                      -> sphinx_reredirects extension
versioning                                     -> readthedocs activates per-branch/tag
typing-aware doc                                -> sphinx_autodoc_typehints
intersphinx                                     -> sphinx.ext.intersphinx
```

## Anti-Pattern

> [!warning] Anti-pattern
> installing 20 sphinx extensions just because they
> exist. Each adds build time, maintenance burden, and learning curve.
> Start minimal (autodoc + napoleon + myst-parser); add only when you
> have a documented need (tabs in 5+ pages = add sphinx-design).

## Tips

- **sphinx-design** is the modern replacement for sphinx-tabs — provides tabs, cards, grids, dropdowns, buttons. One extension covers most layout needs.
- **myst-nb** replaces `myst-parser` and adds support for executing `.md` and `.ipynb` files at build time. Outputs are cached; only re-runs on source change.
- **sphinxcontrib-mermaid** renders mermaid diagrams inline — one extension for flowcharts, sequence diagrams, ER diagrams.
- **sphinx-gallery** auto-generates a gallery page from `.py` files in an `examples/` directory — each becomes a styled example with rendered plots and downloadable scripts.
- **sphinx-copybutton** adds copy-to-clipboard buttons on code blocks — one of the highest-leverage extensions; one line of conf.
- Don't install every extension that exists. Each adds build time and maintenance. Start with autodoc + napoleon + myst-parser; add others only when you hit a need.

## Common Mistake

> [!warning] Installing 20 Sphinx extensions because they look useful. Each adds build time, version-pinning maintenance, and learning curve. Start minimal: autodoc + napoleon + myst-parser. Add `sphinx-design`, `myst-nb`, etc. only when 5+ pages would benefit.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Kitchen sink — slow build, dependency hell
extensions = ["sphinx_design", "sphinx_tabs", "sphinx_copybutton",
              "sphinxcontrib.mermaid", "sphinxcontrib.plantuml",
              "sphinx_gallery.gen_gallery", "myst_nb", "ablog", ...]
```

**Senior:**
```python
# Minimal start
extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon",
              "myst_parser"]
# Add others when you have 5+ pages that need them.
```

## See Also

- [[Sections/documentation/sphinx/sphinx-basics|Sphinx basics — quickstart, conf.py, RST + Markdown (Documentation)]]
- [[Sections/documentation/sphinx/sphinx-autodoc|Sphinx autodoc — generate API docs from docstrings (Documentation)]]
- [[Sections/documentation/sphinx/_Index|Documentation → Sphinx — autodoc-strong, RST-historical]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

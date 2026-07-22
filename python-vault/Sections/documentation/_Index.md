---
type: "file-index"
domain: "python"
file: "documentation"
title: "Documentation"
tags:
  - "python"
  - "python/documentation"
  - "index"
---

# Documentation

> 9 entries across 3 sections.

## MkDocs — Markdown-driven docs sites · 3

- [[Sections/documentation/mkdocs/mkdocs-basics|MkDocs basics — config, serve, mkdocs-material]] — Build a docs site from Markdown files. `mkdocs new` scaffolds; `mkdocs serve` is hot-reload; `mkdocs-material` is the de-facto theme. The fastest "make a docs site" setup in Python.
- [[Sections/documentation/mkdocs/mkdocs-mkdocstrings|mkdocstrings — auto-generated API reference from docstrings]] — `mkdocstrings` reads docstrings + type hints from your Python modules and generates formatted API reference pages. Pair with Google-style docstrings; the result is on par with Sphinx autodoc.
- [[Sections/documentation/mkdocs/mkdocs-deployment|MkDocs deployment — gh-pages, ReadTheDocs, custom domain]] — Build + deploy a docs site: `mkdocs gh-deploy` for GitHub Pages, GitHub Actions for clean CI deploys, ReadTheDocs for fully managed hosting, custom domain via DNS.

## Sphinx — autodoc-strong, RST-historical · 3

- [[Sections/documentation/sphinx/sphinx-basics|Sphinx basics — quickstart, conf.py, RST + Markdown]] — Sphinx is the original Python docs generator. RST is the native syntax; Markdown via `myst-parser`. Modern themes (Furo, sphinx-rtd-theme, sphinx-book-theme) make Sphinx output competitive with MkDocs Material.
- [[Sections/documentation/sphinx/sphinx-autodoc|Sphinx autodoc — generate API docs from docstrings]] — `sphinx.ext.autodoc` introspects modules and renders docstrings. `autosummary` generates one stub page per object. The `:autoclass:` and `:automodule:` directives are the workhorses; `sphinx-autodoc-typehints` makes type hints render properly.
- [[Sections/documentation/sphinx/sphinx-extensions|Sphinx extensions — diagrams, notebooks, design components]] — The Sphinx ecosystem: `sphinx-design` for tabs/grids, `sphinxcontrib-mermaid` for diagrams, `myst-nb` to execute notebooks at build, `sphinx-copybutton` for code copy. Compose for rich docs.

## Documentation Patterns — docstrings, doctest, mkdocs vs sphinx · 3

- [[Sections/documentation/patterns/docstring-styles|Docstring styles — Google, NumPy, RST, type-aware]] — Three styles dominate: Google (most readable), NumPy (scientific Python convention), RST (Sphinx-native, verbose). Pick one per project; all parse via `napoleon`/`mkdocstrings`. Type hints replace `:type:` annotations.
- [[Sections/documentation/patterns/doctest-examples|Doctest — examples that stay in sync with code]] — `>>> example` blocks in docstrings are runnable. `pytest --doctest-modules` runs them in CI; if the code changes and the example breaks, CI fails. Documentation that can't lie about how the code works.
- [[Sections/documentation/patterns/mkdocs-vs-sphinx|MkDocs vs Sphinx — when each wins]] — MkDocs: Markdown-native, fast setup, modern themes via mkdocs-material, mkdocstrings for autodoc. Sphinx: RST-historical, mature autodoc, multi-format output (HTML+PDF+epub), the Python stdlib choice. The decision matrix that drives the choice.

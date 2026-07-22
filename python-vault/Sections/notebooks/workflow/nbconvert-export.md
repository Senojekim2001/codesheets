---
type: "entry"
domain: "python"
file: "notebooks"
section: "workflow"
id: "nbconvert-export"
title: "nbconvert — export notebooks to HTML, PDF, slides"
category: "Workflow"
subtitle: "jupyter nbconvert --to html / pdf / markdown / slides, --no-input, custom templates, Voila for live apps, mkdocs-jupyter for docs"
signature_short: "jupyter nbconvert --to html --no-input notebook.ipynb"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nbconvert — export notebooks to HTML, PDF, slides"
  - "nbconvert-export"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/workflow"
  - "category/workflow"
  - "tier/tiered"
---

# nbconvert — export notebooks to HTML, PDF, slides

> jupyter nbconvert --to html / pdf / markdown / slides, --no-input, custom templates, Voila for live apps, mkdocs-jupyter for docs

## Overview

`jupyter nbconvert` converts `.ipynb` to many formats — HTML (most common), PDF (via LaTeX), Markdown, RevealJS slides. `--no-input` hides code cells; `--template` customizes output. For LIVE notebooks (interactive widgets) use Voila — renders as a web app. The three examples solve the SAME concrete task — share a notebook with non-developers — at three depths: HTML export → custom template + slide deck → Voila + mkdocs-jupyter for docs.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Share a notebook with non-developers as HTML.
- **Junior** — SAME — but custom template, embedded resources, slides.
- **Senior** — SAME — production: Voila for interactive web app, mkdocs-jupyter for docs site.

## Signature

```python
jupyter nbconvert --to html --no-input notebook.ipynb
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Share a notebook with non-developers as HTML.

# Basic HTML export — includes code + outputs.
# $ jupyter nbconvert --to html report.ipynb
#   produces report.html

# Hide code cells; show only outputs (Markdown, plots, tables):
# $ jupyter nbconvert --to html --no-input report.ipynb

# Other formats:
# $ jupyter nbconvert --to markdown report.ipynb       # report.md
# $ jupyter nbconvert --to pdf      report.ipynb       # needs xelatex / TeX
# $ jupyter nbconvert --to slides   report.ipynb       # RevealJS slide deck
# $ jupyter nbconvert --to script   report.ipynb       # report.py (just the code)

# Programmatically:
import subprocess
subprocess.run([
    "jupyter", "nbconvert",
    "--to", "html", "--no-input",
    "--output-dir", "out",
    "report.ipynb",
])

# Or via Python API:
from nbconvert import HTMLExporter
import nbformat

nb = nbformat.read("report.ipynb", as_version=4)
exporter = HTMLExporter(template_name="lab", exclude_input=True)
body, resources = exporter.from_notebook_node(nb)
with open("report.html", "w") as f:
    f.write(body)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but custom template, embedded resources, slides.

# === HTML with custom template ===
# Built-in templates:
#   classic      - default, simple
#   lab          - JupyterLab styling (modern)
#   reveal       - reveal.js slides
#   webpdf       - PDF via headless Chrome (no LaTeX needed)
#
# $ jupyter nbconvert --to html --template lab report.ipynb

# === Slides ===
# 1. Tag cells with "Slide Type" via View → Cell Toolbar → Slideshow:
#    - Slide        : new slide
#    - Sub-slide    : sub-slide (down arrow)
#    - Fragment     : reveal piece-by-piece
#    - Skip         : exclude
#    - Notes        : speaker notes
# 2. Convert:
#    $ jupyter nbconvert --to slides report.ipynb \
#        --SlidesExporter.reveal_theme=simple \
#        --SlidesExporter.reveal_scroll=true
# 3. Open report.slides.html or serve with reveal.js.

# === PDF without LaTeX (use headless Chrome) ===
# pip install nbconvert[webpdf] playwright
# python -m playwright install chromium
# $ jupyter nbconvert --to webpdf --no-input report.ipynb
#   Cleaner than LaTeX-PDF for non-mathy reports.

# === Custom Jinja template ===
# $ jupyter nbconvert --to html \
#     --template-path=./templates \
#     --template my_template \
#     report.ipynb
#
# templates/my_template/conf.json:
#   { "base_template": "lab", "mimetypes": { "text/html": true } }
# templates/my_template/index.html.j2:
#   {%- extends 'lab/index.html.j2' -%}
#   {%- block body_header -%}
#   <header>Internal — {{ resources.metadata.name }}</header>
#   {%- endblock body_header -%}

# === Tag cells to exclude from output ===
# Tag with "remove_cell" to drop entirely; "remove_input" to hide code;
# "remove_output" to hide output.
# $ jupyter nbconvert --to html \
#     --TagRemovePreprocessor.remove_cell_tags=remove_cell \
#     --TagRemovePreprocessor.remove_input_tags=remove_input \
#     report.ipynb

# === Embed images / data files ===
# nbconvert --to html-with-resources writes a directory with assets.
# nbconvert --to html (default) inlines small assets as base64.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: Voila for interactive web app,
#             mkdocs-jupyter for docs site.

# === Voila: notebook as live web app ===
# pip install voila
# $ voila notebook.ipynb
# Opens browser at http://localhost:8866 — strips code cells, shows
# only widgets and outputs. Each visitor gets a fresh kernel.

# Customize:
# $ voila --template=material report.ipynb
# $ voila --no-browser --port=8866 --Voila.tornado_settings='{"trust_xheaders": True}' \
#         --base_url=/voila/ report.ipynb

# Docker deploy:
# FROM jupyter/scipy-notebook
# RUN pip install voila
# COPY report.ipynb /app/
# WORKDIR /app
# EXPOSE 8866
# CMD ["voila", "--no-browser", "--port=8866", "--Voila.ip=0.0.0.0", "report.ipynb"]

# === mkdocs-jupyter for docs ===
# pip install mkdocs mkdocs-material mkdocs-jupyter
# mkdocs.yml:
#   nav:
#     - Home: index.md
#     - Tutorials:
#       - notebooks/tutorial1.ipynb
#       - notebooks/tutorial2.ipynb
#   plugins:
#     - mkdocs-jupyter:
#         execute: false           # use existing outputs (faster)
#         include_source: true     # include the .ipynb in the site
#         theme: dark
# $ mkdocs serve

# === GitHub Actions: build + deploy on push ===
# .github/workflows/docs.yml
# - name: Build site
#   run: |
#     pip install mkdocs mkdocs-material mkdocs-jupyter jupytext
#     mkdocs build
# - name: Deploy
#   uses: peaceiris/actions-gh-pages@v3
#   with:
#     publish_dir: ./site

# Decision rule:
#   one-off share with stakeholders        -> nbconvert --to html --no-input
#   slide deck                              -> nbconvert --to slides + reveal
#   PDF for archival                          -> --to webpdf (no LaTeX)
#   docs site / tutorial                     -> mkdocs-jupyter
#   live interactive demo                    -> Voila (renders widgets)
#   email a static report                     -> --to html with embedded assets
#   ML model card                              -> nbconvert --to html; check into git
#   company-branded report                    -> custom Jinja template
#   exclude scratch cells                      -> tag "remove_cell"; nbconvert preprocessor
#   need to schedule + email                   -> papermill + nbconvert + sendgrid
#   need to publish to confluence/wiki        -> --to markdown; paste/import
#
# Anti-pattern: shipping a notebook .ipynb directly to non-developers
# and asking them to "open it in Jupyter". They don't have Jupyter
# installed; opening on GitHub shows raw outputs but no interactivity;
# attaching to email leaves stale outputs forever. ALWAYS export to
# HTML (static reports), PDF (formal docs), or Voila (live) before
# sharing.
```

## Decision Rule

```text
one-off share with stakeholders        -> nbconvert --to html --no-input
slide deck                              -> nbconvert --to slides + reveal
PDF for archival                          -> --to webpdf (no LaTeX)
docs site / tutorial                     -> mkdocs-jupyter
live interactive demo                    -> Voila (renders widgets)
email a static report                     -> --to html with embedded assets
ML model card                              -> nbconvert --to html; check into git
company-branded report                    -> custom Jinja template
exclude scratch cells                      -> tag "remove_cell"; nbconvert preprocessor
need to schedule + email                   -> papermill + nbconvert + sendgrid
need to publish to confluence/wiki        -> --to markdown; paste/import
```

## Anti-Pattern

> [!warning] Anti-pattern
> shipping a notebook .ipynb directly to non-developers
> and asking them to "open it in Jupyter". They don't have Jupyter
> installed; opening on GitHub shows raw outputs but no interactivity;
> attaching to email leaves stale outputs forever. ALWAYS export to
> HTML (static reports), PDF (formal docs), or Voila (live) before
> sharing.

## Tips

- `--no-input` hides code cells — turns a development notebook into a clean stakeholder-friendly report.
- Use `--to webpdf` for PDFs (needs `playwright`). Cleaner than `--to pdf` (LaTeX) for non-mathematical content; doesn't require a TeX install.
- Tag cells with `remove_cell`, `remove_input`, or `remove_output` to control export. Useful for hiding scratch cells / debugging while keeping the analysis cell.
- `Voila` renders a notebook as a live web app — strips code, runs widgets. The non-developer-friendly way to share interactive analyses.
- `mkdocs-jupyter` plugin lets you embed notebooks in a docs site. Set `execute: false` to use cached outputs (faster); `execute: true` for always-fresh.
- For corporate-branded reports, build a custom Jinja template extending `lab/index.html.j2` — adds header/footer/CSS to all exports.

## Common Mistake

> [!warning] Emailing a notebook `.ipynb` file to non-developers. They don't have Jupyter; GitHub view shows stale outputs without interactivity; the `.ipynb` is huge with embedded base64. Export to HTML (static), PDF (formal), or Voila (live) before sharing.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Email the .ipynb — recipient can't open it
$ email -a notebook.ipynb stakeholder@example.com
```

**Senior:**
```python
# Export first, then share the HTML
$ jupyter nbconvert --to html --no-input notebook.ipynb
$ email -a notebook.html stakeholder@example.com
```

## See Also

- [[Sections/ml/preprocessing/pipeline|Pipeline (Machine Learning)]]
- [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution (Notebooks)]]
- [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs (Notebooks)]]
- [[Sections/notebooks/workflow/_Index|Notebooks → Workflow — papermill, jupytext, nbconvert]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]

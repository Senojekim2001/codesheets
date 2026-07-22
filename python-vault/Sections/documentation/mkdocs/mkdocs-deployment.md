---
type: "entry"
domain: "python"
file: "documentation"
section: "mkdocs"
id: "mkdocs-deployment"
title: "MkDocs deployment — gh-pages, ReadTheDocs, custom domain"
category: "MkDocs"
subtitle: "mkdocs gh-deploy, GitHub Actions deploy job, ReadTheDocs config (.readthedocs.yaml), CNAME for custom domain, mike for versioning"
signature_short: "mkdocs gh-deploy --force   # builds and pushes site/ to gh-pages branch"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MkDocs deployment — gh-pages, ReadTheDocs, custom domain"
  - "mkdocs-deployment"
tags:
  - "python"
  - "python/documentation"
  - "python/documentation/mkdocs"
  - "category/mkdocs"
  - "tier/tiered"
---

# MkDocs deployment — gh-pages, ReadTheDocs, custom domain

> mkdocs gh-deploy, GitHub Actions deploy job, ReadTheDocs config (.readthedocs.yaml), CNAME for custom domain, mike for versioning

## Overview

MkDocs builds a static site (`mkdocs build` → `site/`); deployment is just hosting that directory. The common paths: (a) `mkdocs gh-deploy` pushes to a `gh-pages` branch and GitHub Pages serves it; (b) GitHub Actions builds on every push to main, deploys to gh-pages; (c) ReadTheDocs builds your repo on push and hosts at `*.readthedocs.io`. Custom domain works on any of them via a CNAME. The three examples solve the SAME concrete task — deploy the docs site so readers can visit it — at three depths: `mkdocs gh-deploy` once → GitHub Actions on push → multi-version via mike + ReadTheDocs config.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Deploy docs to GitHub Pages.
- **Junior** — SAME — but auto-deploy on push to main via GitHub Actions.
- **Senior** — SAME — production: multi-version docs with mike, custom domain, search analytics, deploy preview for PRs.

## Signature

```python
mkdocs gh-deploy --force   # builds and pushes site/ to gh-pages branch
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Deploy docs to GitHub Pages.

# Manual deploy (one-off):
#   $ mkdocs gh-deploy --force
# This:
#   1. Runs 'mkdocs build' to produce site/
#   2. Force-pushes site/ to the 'gh-pages' branch
#   3. GitHub Pages serves it at https://USER.github.io/REPO/

# Settings → Pages → Source = "Deploy from a branch", Branch = gh-pages.

# Caveats:
#   - Manual; nothing automatic. Junior tier adds CI.
#   - User has to remember to run before pushing changes.
#   - --force overwrites without merging.

# Custom domain:
# Create docs/CNAME (a file with one line):
#   docs.example.com
# After 'mkdocs gh-deploy', add CNAME record at your DNS provider:
#   CNAME docs -> USER.github.io

# === Verify the deploy ===
#   $ git log gh-pages --oneline -5
#   $ curl -I https://docs.example.com/
#   HTTP/2 200
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but auto-deploy on push to main via GitHub Actions.

# === .github/workflows/docs.yml ===
# name: Deploy Docs
# on:
#   push:
#     branches: [main]
#   pull_request:
#     branches: [main]
# permissions:
#   contents: write                                 # write to gh-pages
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#         with:
#           fetch-depth: 0                          # mike needs full history
#       - uses: actions/setup-python@v5
#         with: { python-version: "3.12" }
#       - name: Install
#         run: |
#           pip install mkdocs-material \
#                       mkdocstrings[python] \
#                       mkdocs-git-revision-date-localized-plugin \
#                       mkdocs-minify-plugin
#       - name: Build
#         run: mkdocs build --strict           # --strict fails on warnings
#       - name: Link check
#         run: |
#           pip install linkchecker
#           linkchecker site/
#         continue-on-error: true              # report but don't fail
#       - name: Deploy
#         if: github.ref == 'refs/heads/main'
#         run: mkdocs gh-deploy --force --clean

# Each push to main builds + deploys; PRs build only (catches errors).

# === ReadTheDocs alternative ===
# .readthedocs.yaml (in repo root):
# version: 2
# build:
#   os: ubuntu-22.04
#   tools: { python: "3.12" }
# mkdocs:
#   configuration: mkdocs.yml
# python:
#   install:
#     - method: pip
#       path: .
#       extra_requirements: [docs]
# # Optional: build PDFs / multi-format
# formats: [pdf, htmlzip]

# Connect repo at readthedocs.org → New Project → import from GitHub.
# Free tier: builds on push, hosts at PROJECT.readthedocs.io.
# Paid tier: custom domain, advertising-free, search analytics.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: multi-version docs with mike, custom
#             domain, search analytics, deploy preview for PRs.

# === Multi-version with mike ===
# pip install mike
#
# mkdocs.yml:
# extra:
#   version:
#     provider: mike
#     default: stable

# Deploy a version (manual):
# $ mike deploy --push --update-aliases 1.4.2 stable
# $ mike set-default --push stable
#
# Now:
#   docs.example.com/         -> redirects to /stable/
#   docs.example.com/stable/   -> 1.4.2
#   docs.example.com/1.4.2/    -> 1.4.2
#   docs.example.com/1.3/      -> previous version
# Version dropdown appears in the Material theme.

# === GitHub Actions: deploy version on tag ===
# .github/workflows/docs-versioned.yml
# name: Deploy Versioned Docs
# on:
#   push:
#     branches: [main]
#     tags: ['v*']
# permissions:
#   contents: write
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#         with: { fetch-depth: 0 }
#       - uses: actions/setup-python@v5
#         with: { python-version: "3.12" }
#       - run: pip install mkdocs-material mkdocstrings[python] mike
#       - name: Configure git
#         run: |
#           git config user.name github-actions
#           git config user.email github-actions@github.com
#       - name: Deploy dev (main branch)
#         if: github.ref == 'refs/heads/main'
#         run: mike deploy --push dev
#       - name: Deploy version (on tag)
#         if: startsWith(github.ref, 'refs/tags/v')
#         run: |
#           VERSION=${GITHUB_REF_NAME#v}
#           MAJOR_MINOR=$(echo $VERSION | cut -d. -f1-2)
#           mike deploy --push --update-aliases $VERSION $MAJOR_MINOR stable
#           mike set-default --push stable

# === Deploy previews for PRs (Cloudflare Pages / Netlify) ===
# Cloudflare Pages auto-deploys every PR to a unique URL.
# Connect repo → builds with: pip install ... && mkdocs build → site/
# Each PR gets pr-N.docs.example.com.pages.dev preview link.

# === Search via Algolia DocSearch (large sites) ===
# Apply at docsearch.algolia.com (free for OSS).
# Replace mkdocs-material default search:
# extra:
#   docsearch:
#     api_key: YOUR_KEY
#     index_name: YOUR_INDEX
#     app_id: YOUR_APP_ID

# === SEO / structured data ===
# extra:
#   social:
#     - icon: ...
# Material auto-generates Open Graph + Twitter Card meta tags.

# Decision rule:
#   personal project / OSS                  -> GitHub Pages via mkdocs gh-deploy
#   org / monorepo                            -> GitHub Actions deploy job
#   need build matrix (multiple Python)       -> ReadTheDocs (free tier)
#   need PDF / epub                            -> ReadTheDocs (formats: [pdf])
#   need multi-version docs                    -> mike + GitHub Actions
#   PR previews                                 -> Cloudflare Pages or Netlify
#   custom domain                                -> docs/CNAME + DNS
#   private docs                                  -> ReadTheDocs paid tier; or self-host (S3 + CloudFront)
#   sub-second search at scale                   -> Algolia DocSearch (free for OSS)
#   need analytics                                -> Material has gtag.id; or Plausible / Fathom
#   want to track 'edit on github' clicks        -> Material has built-in tracking
#
# Anti-pattern: building docs locally and committing site/ to git.
# Doubles repo size; merge conflicts on every doc edit; out-of-sync
# with source. ALWAYS build in CI; deploy site/ to gh-pages or a
# static host. Keep site/ in .gitignore.
```

## Decision Rule

```text
personal project / OSS                  -> GitHub Pages via mkdocs gh-deploy
org / monorepo                            -> GitHub Actions deploy job
need build matrix (multiple Python)       -> ReadTheDocs (free tier)
need PDF / epub                            -> ReadTheDocs (formats: [pdf])
need multi-version docs                    -> mike + GitHub Actions
PR previews                                 -> Cloudflare Pages or Netlify
custom domain                                -> docs/CNAME + DNS
private docs                                  -> ReadTheDocs paid tier; or self-host (S3 + CloudFront)
sub-second search at scale                   -> Algolia DocSearch (free for OSS)
need analytics                                -> Material has gtag.id; or Plausible / Fathom
want to track 'edit on github' clicks        -> Material has built-in tracking
```

## Anti-Pattern

> [!warning] Anti-pattern
> building docs locally and committing site/ to git.
> Doubles repo size; merge conflicts on every doc edit; out-of-sync
> with source. ALWAYS build in CI; deploy site/ to gh-pages or a
> static host. Keep site/ in .gitignore.

## Tips

- `mkdocs gh-deploy --force` is the one-command deploy — builds locally, force-pushes to `gh-pages`, GitHub Pages serves. Good for solo work.
- For team workflows, GitHub Actions on push to main is the standard — every change triggers build + deploy; PRs build but don't deploy.
- `mkdocs build --strict` fails on any warning (broken link, missing nav entry). Use in CI to catch errors before deploy.
- `mike` for multi-version docs — deploys each version to its own path, adds a switcher dropdown. Pair with tag-triggered CI.
- For PR preview deploys, Cloudflare Pages or Netlify auto-deploy each PR to a unique URL. Comment-bots post the link.
- Algolia DocSearch is free for OSS projects; gives sub-second search across the site. Apply at docsearch.algolia.com.

## Common Mistake

> [!warning] Building docs locally and committing the `site/` directory to git. Doubles repo size; merge conflicts on every doc edit; gets out-of-sync with the source Markdown. Always build in CI; deploy `site/` to GitHub Pages or a static host. `.gitignore` the `site/` directory.

## Shorthand (Junior → Senior)

**Junior:**
```python
# site/ committed to repo
$ mkdocs build && git add site/ && git push
# Repo doubles in size; site/ drifts from docs/
```

**Senior:**
```python
# CI builds + deploys; site/ never in git
.gitignore: site/
.github/workflows/docs.yml: mkdocs gh-deploy --force
```

## See Also

- [[Sections/documentation/mkdocs/mkdocs-basics|MkDocs basics — config, serve, mkdocs-material (Documentation)]]
- [[Sections/documentation/mkdocs/mkdocs-mkdocstrings|mkdocstrings — auto-generated API reference from docstrings (Documentation)]]
- [[Sections/documentation/mkdocs/_Index|Documentation → MkDocs — Markdown-driven docs sites]]
- [[Sections/documentation/_Index|Documentation index]]
- [[_Index|Vault index]]

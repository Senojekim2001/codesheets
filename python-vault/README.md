# Python Vault

Auto-generated Obsidian vault for the Python codesheets.

- **753** entries
- **47** files (sheets)
- **753** entries with three-tier examples (intro / junior / senior)
- **753** decision-rule blocks
- **753** anti-pattern callouts

## Companion guides

- **`RAG.md`** — set this vault up as a RAG knowledge base for local AI (AnythingLLM, Smart Connections, or a custom sentence-transformers + ChromaDB + Ollama pipeline)
- **`_Index.md`** — master index linking every file
- **`MOC/`** — Decision Rules and Anti-Patterns aggregated for high-value retrieval

## Open in Obsidian

1. Obsidian → `Open another vault` → `Open folder as vault`
2. Pick this folder (`python-vault/`)

## Using it like the website's cheat sheet

The website pattern is *click a row → modal pops up with full detail*. The vault follows the same shape:

| Website | Obsidian equivalent |
|---|---|
| Sheet page (e.g. `/python/typing`) | `Sections/typing/_Index.md` |
| Cheat-sheet row (`fn` + `desc`) | A wikilink line in the index |
| Click row → modal pops | Click wikilink → entry note opens |
| Modal content | Entry note body |

To get the **modal popup feel** in Obsidian, three options (best to most native):

1. **Hover preview** (built-in, default): hold `Cmd/Ctrl` and hover over any wikilink → a popup shows the entry's content without leaving the index. This is the closest match to the website's modal.
2. **Open in side pane**: `Cmd/Ctrl + click` opens the entry in a side pane while keeping the index visible.
3. **Hover Editor plugin** (community): turns hover previews into draggable, pinnable mini-windows — the most modal-like experience.

For navigation parallel to the modal's prev/next:
- `Cmd/Ctrl + O` → quick switcher (search by entry title or alias)
- Graph view → see entries connected by their `See Also` and `category` cross-links

## Layout

```
python-vault/
├── _Index.md                              # Master index
├── Sections/
│   └── {file}/                             # e.g. pandas, numpy, typing
│       ├── _Index.md                       # File overview + entries grouped by section
│       └── {section}/                       # e.g. io, indexing, type-narrowing
│           ├── _Index.md                   # Section overview
│           └── {entry}.md                   # One note per entry
├── MOC/
│   ├── _Index.md
│   ├── Decision Rules.md                   # Every entry's "Decision rule:" block, grouped
│   ├── Anti-Patterns.md                    # Every entry's "Anti-pattern:" callout
│   ├── By Category.md
│   └── Tier Coverage.md
└── README.md (this file)
```

## Per-entry note layout

Each entry has YAML frontmatter for RAG filtering and Dataview queries, then sections in this order (mirrors the website):

1. Title + subtitle blockquote
2. `## Overview` — descLong
3. `## Signature` — fenced `python` block
4. `## Example — Intro (Entry-Level)`
5. `## Example — Junior (Intermediate)`
6. `## Example — Senior (Production)`
7. `## Decision Rule` — extracted from the senior tier's "Decision rule:" comment block
8. `## Anti-Pattern` — extracted from the senior tier's "Anti-pattern:" comment block
9. `## Tips` — bullet list
10. `## Common Mistake` — `> [!warning]` callout
11. `## Shorthand (Junior → Senior)` — when the legacy `shorthand` field is present
12. `## See Also` — sibling category entries + section / file / vault indexes

## Frontmatter schema

```yaml
type: entry
domain: python
file: pandas               # which sheet this came from
section: io                 # which section in the sheet
id: dataframe-constructor   # stable entry id
title: pd.DataFrame()       # display name
category: Constructor
subtitle: ...
signature_short: pd.DataFrame(data, ...)
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - DataFrame constructor
tags:
  - python
  - python/pandas
  - python/pandas/io
  - category/constructor
  - tier/tiered
```

## RAG ingestion notes

- Each `## SectionHeader` is a stable boundary — chunk on `##`.
- "Decision Rule" and "Anti-Pattern" are top-level sections so a chunker hits them as discrete chunks (these are the densest knowledge cards).
- Tags are hierarchical (`python/pandas/io`); easy to filter retrieval to a domain or sheet.
- `signature_short` in frontmatter is one line — useful as a tooltip preview.
- The `MOC/Decision Rules.md` and `MOC/Anti-Patterns.md` files concentrate the senior tier's most distilled knowledge for high-value retrieval.

---

*Regenerate with: `node scripts/build-python-vault.mjs`*

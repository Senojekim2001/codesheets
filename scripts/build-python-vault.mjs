/**
 * build-python-vault.mjs
 *
 * Generates a Python-only Obsidian vault from data/python/*.js.
 * Mirrors the website's structure (per-section indexes, per-file indexes, master).
 * Optimized for RAG (rich frontmatter, semantic stable headings, decision-rule extraction)
 * and instruction (progressive intro/junior/senior tiers, cross-links, MOCs).
 *
 * Usage:  node scripts/build-python-vault.mjs
 * Output: <repo>/python-vault/
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const VAULT = path.join(ROOT, 'python-vault')
const DATA_DIR = path.join(ROOT, 'data', 'python')

/* ───────── helpers ───────── */

function sanitize(s) {
  return String(s).replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, ' ').trim()
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wikilink(target, label) {
  return label ? `[[${target}|${label}]]` : `[[${target}]]`
}

function yamlValue(v) {
  if (Array.isArray(v)) return null // handled separately
  if (v === null || v === undefined) return '""'
  if (typeof v === 'boolean' || typeof v === 'number') return String(v)
  // wrap strings in quotes; escape internal quotes
  const s = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${s}"`
}

function frontmatter(obj) {
  const lines = ['---']
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) {
      if (v.length === 0) continue
      lines.push(`${k}:`)
      for (const item of v) lines.push(`  - ${yamlValue(item)}`)
    } else {
      lines.push(`${k}: ${yamlValue(v)}`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

/**
 * Extract a "Decision rule:" or "Anti-pattern:" comment block from senior-tier code.
 * Returns the block as plain text (with comment markers stripped) or null.
 */
function extractBlock(code, heading) {
  if (!code) return null
  const lines = code.split('\n')
  // Match either "# Heading:" alone OR "# Heading: <text on same line>"
  const re = new RegExp(`^#\\s*${heading.replace(/[\s-]+/g, '[\\s-]*')}:\\s*(.*)$`, 'i')
  let start = -1
  let inlineRest = ''
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re)
    if (m) {
      start = i
      inlineRest = (m[1] || '').trim()
      break
    }
  }
  if (start < 0) return null

  const out = []
  if (inlineRest) out.push(inlineRest)

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    // Stop at non-comment line
    if (!line.startsWith('#')) {
      if (line.trim() === '' && out.length) { out.push(''); continue }
      break
    }
    // Stop at the next labelled heading
    if (/^#\s*(Decision rule|Anti-pattern|Anti pattern):/i.test(line)) break
    out.push(line.replace(/^#\s?/, ''))
  }
  // Drop leading/trailing blank lines without touching internal whitespace,
  // then strip the longest common leading whitespace so the fenced output
  // doesn't have one shifted line.
  while (out.length && out[0].trim() === '') out.shift()
  while (out.length && out[out.length - 1].trim() === '') out.pop()
  if (!out.length) return null
  const indents = out
    .filter(l => l.trim() !== '')
    .map(l => l.match(/^[ \t]*/)[0].length)
  const common = indents.length ? Math.min(...indents) : 0
  const stripped = out.map(l => l.length >= common ? l.slice(common) : l)
  return stripped.join('\n') || null
}

function getTierCode(entry, tier) {
  if (Array.isArray(entry?.examples)) {
    const ex = entry.examples.find(e => e.tier === tier)
    return ex?.code || ''
  }
  return ''
}

/**
 * Extract the `# TASK - ...` line from a tier's code. Folds continuation
 * lines (indented `# ...` lines that follow until the next labelled
 * banner — APPROACH / STRENGTHS / WEAKNESSES / === banner / non-comment).
 * Only present in entries authored under the same-task principle.
 */
function extractTaskLine(code) {
  if (!code) return null
  const lines = code.split('\n')
  const re = /^#\s*TASK\s+-\s*(.*)$/
  let start = -1, first = ''
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re)
    if (m) { start = i; first = m[1]; break }
  }
  if (start < 0) return null
  const parts = [first.trim()]
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i]
    if (!l.startsWith('#')) break
    // Next labelled banner line (APPROACH, STRENGTHS, WEAKNESSES, etc).
    if (/^#\s*[A-Z][A-Z-]+\s*[-=]/.test(l)) break
    // === ENTRY-LEVEL etc divider.
    if (/^#\s*=+/.test(l)) break
    parts.push(l.replace(/^#\s+/, '').trim())
  }
  return parts.filter(Boolean).join(' ').trim() || null
}

/* ───────── per-entry markdown ───────── */

function entryNote({ entry, sheet, section, allByCategory }) {
  const sheetId = sheet.id
  const sectionId = sanitize(section.id)
  const entryId = sanitize(entry.id)

  const senior = getTierCode(entry, 'senior')
  const decisionRule = extractBlock(senior, 'Decision rule')
  const antiPattern  = extractBlock(senior, 'Anti-pattern') ||
                       extractBlock(senior, 'Anti pattern')

  // RAG-friendly tag set: hierarchical
  const tags = [
    'python',
    `python/${sheetId}`,
    `python/${sheetId}/${slug(section.id)}`,
  ]
  if (entry.category) tags.push(`category/${slug(entry.category)}`)
  if (Array.isArray(entry.examples) && entry.examples.length) tags.push('tier/tiered')

  // Aliases for synonym retrieval
  const aliases = [
    entry.fn,
    ...(entry.fn && entry.fn !== entry.id ? [entry.id] : []),
  ].filter(Boolean)

  const fm = frontmatter({
    type: 'entry',
    domain: 'python',
    file: sheetId,
    section: section.id,
    id: entry.id,
    title: entry.fn,
    category: entry.category,
    subtitle: entry.subtitle,
    signature_short: entry.signature,
    has_decision_rule: Boolean(decisionRule),
    has_anti_pattern: Boolean(antiPattern),
    tier_count: Array.isArray(entry.examples) ? entry.examples.length : 0,
    aliases,
    tags,
  })

  const out = []

  // Title + subtitle blockquote
  out.push(`# ${entry.fn}`)
  if (entry.subtitle) {
    out.push('')
    out.push(`> ${entry.subtitle}`)
  }

  // Overview
  if (entry.descLong) {
    out.push('')
    out.push('## Overview')
    out.push('')
    out.push(entry.descLong)
  }

  // Task — same-task contract surfaced as a single-chunk RAG card.
  // Only rendered when EVERY tier carries a `# TASK -` line; older entries
  // pre-dating the same-task principle skip this section gracefully.
  if (Array.isArray(entry.examples) && entry.examples.length >= 2) {
    const tasksByTier = entry.examples.map(ex => ({
      tier: ex.tier,
      task: extractTaskLine(ex.code),
    }))
    if (tasksByTier.every(t => t.task)) {
      const label = { intro: 'Intro', junior: 'Junior', senior: 'Senior' }
      out.push('')
      out.push('## Task')
      out.push('')
      out.push('All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:')
      out.push('')
      for (const t of tasksByTier) {
        out.push(`- **${label[t.tier] || t.tier}** — ${t.task}`)
      }
    }
  }

  // Signature
  if (entry.signature) {
    out.push('')
    out.push('## Signature')
    out.push('')
    out.push('```python')
    out.push(entry.signature)
    out.push('```')
  }

  // Tiered examples (each as its own section so RAG chunks cleanly)
  if (Array.isArray(entry.examples) && entry.examples.length) {
    const labels = {
      intro:  'Example — Intro (Entry-Level)',
      junior: 'Example — Junior (Intermediate)',
      senior: 'Example — Senior (Production)',
    }
    for (const ex of entry.examples) {
      const heading = labels[ex.tier] || `Example — ${ex.tier}`
      out.push('')
      out.push(`## ${heading}`)
      out.push('')
      out.push('```python')
      out.push(ex.code.trimEnd())
      out.push('```')
    }
  } else if (entry.code) {
    out.push('')
    out.push('## Example')
    out.push('')
    out.push('```python')
    out.push(entry.code.trimEnd())
    out.push('```')
  }

  // Promoted: Decision Rule (prime RAG chunk).
  // Fenced as `text` so the `key -> value` tables preserve their alignment.
  if (decisionRule) {
    out.push('')
    out.push('## Decision Rule')
    out.push('')
    out.push('```text')
    out.push(decisionRule)
    out.push('```')
  }

  // Promoted: Anti-Pattern (prime RAG chunk)
  if (antiPattern) {
    out.push('')
    out.push('## Anti-Pattern')
    out.push('')
    out.push(`> [!warning] Anti-pattern`)
    out.push(antiPattern.split('\n').map(l => `> ${l}`).join('\n'))
  }

  // Tips
  if (Array.isArray(entry.tips) && entry.tips.length) {
    out.push('')
    out.push('## Tips')
    out.push('')
    for (const t of entry.tips) out.push(`- ${t}`)
  }

  // Common Mistake
  if (entry.mistake) {
    out.push('')
    out.push('## Common Mistake')
    out.push('')
    out.push(`> [!warning] ${entry.mistake}`)
  }

  // Shorthand (Junior → Senior; legacy field)
  if (entry.shorthand && entry.shorthand.verbose && entry.shorthand.concise) {
    out.push('')
    out.push('## Shorthand (Junior → Senior)')
    out.push('')
    out.push('**Junior:**')
    out.push('```python')
    out.push(entry.shorthand.verbose.trimEnd())
    out.push('```')
    out.push('')
    out.push('**Senior:**')
    out.push('```python')
    out.push(entry.shorthand.concise.trimEnd())
    out.push('```')
  }

  // See Also (siblings in the same category, then section/file/vault)
  out.push('')
  out.push('## See Also')
  out.push('')
  // Sibling category links (~3 max)
  if (entry.category && allByCategory.has(entry.category)) {
    const siblings = allByCategory.get(entry.category)
      .filter(s => s.entry.id !== entry.id)
      .slice(0, 4)
    for (const s of siblings) {
      const tgt = `Sections/${s.sheet.id}/${sanitize(s.section.id)}/${sanitize(s.entry.id)}`
      out.push(`- ${wikilink(tgt, `${s.entry.fn} (${s.sheet.label})`)}`)
    }
  }
  out.push(`- ${wikilink(`Sections/${sheetId}/${sectionId}/_Index`, `${sheet.label} → ${section.title}`)}`)
  out.push(`- ${wikilink(`Sections/${sheetId}/_Index`, `${sheet.label} index`)}`)
  out.push(`- ${wikilink('_Index', 'Vault index')}`)

  // YouTube (legacy)
  if (entry.ytId) {
    out.push('')
    out.push('## Video Tutorial')
    out.push('')
    out.push(`[Watch: ${entry.ytTitle || entry.fn}](https://youtube.com/watch?v=${entry.ytId})`)
  }

  return fm + '\n\n' + out.join('\n') + '\n'
}

/* ───────── section index ───────── */

function sectionIndex({ sheet, section }) {
  const fm = frontmatter({
    type: 'section-index',
    domain: 'python',
    file: sheet.id,
    section: section.id,
    title: section.title || section.id,
    tags: ['python', `python/${sheet.id}`, `python/${sheet.id}/${slug(section.id)}`, 'index'],
  })

  const out = []
  out.push(`# ${sheet.label} → ${section.title || section.id}`)
  out.push('')
  out.push('## Entries')
  out.push('')
  for (const e of section.entries) {
    const tgt = `Sections/${sheet.id}/${sanitize(section.id)}/${sanitize(e.id)}`
    const tail = e.desc ? ` — ${e.desc}` : (e.subtitle ? ` — ${e.subtitle}` : '')
    out.push(`- ${wikilink(tgt, e.fn)}${tail}`)
  }
  out.push('')
  out.push('---')
  out.push(`*${section.entries.length} entries · ${wikilink(`Sections/${sheet.id}/_Index`, `${sheet.label} index`)} · ${wikilink('_Index', 'Vault index')}*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

/* ───────── file index ───────── */

function fileIndex({ sheet, sections }) {
  const total = sections.reduce((n, s) => n + (s.entries?.length || 0), 0)
  const fm = frontmatter({
    type: 'file-index',
    domain: 'python',
    file: sheet.id,
    title: sheet.label,
    tags: ['python', `python/${sheet.id}`, 'index'],
  })

  const out = []
  out.push(`# ${sheet.label}`)
  out.push('')
  out.push(`> ${total} entries across ${sections.length} sections`)
  out.push('')
  for (const s of sections) {
    const sectionTgt = `Sections/${sheet.id}/${sanitize(s.id)}/_Index`
    out.push(`## ${wikilink(sectionTgt, s.title || s.id)}`)
    out.push('')
    for (const e of s.entries || []) {
      const tgt = `Sections/${sheet.id}/${sanitize(s.id)}/${sanitize(e.id)}`
      const tail = e.desc ? ` — ${e.desc}` : (e.subtitle ? ` — ${e.subtitle}` : '')
      out.push(`- ${wikilink(tgt, e.fn)}${tail}`)
    }
    out.push('')
  }
  out.push('---')
  out.push(`*${total} entries · ${wikilink('_Index', 'Vault index')}*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

/* ───────── master index ───────── */

function masterIndex({ filesData, totals }) {
  const fm = frontmatter({
    type: 'vault-index',
    domain: 'python',
    title: 'Python Vault — Master Index',
    tags: ['python', 'index', 'master'],
  })

  const out = []
  out.push('# Python Vault — Master Index')
  out.push('')
  out.push(`> ${totals.entries} entries across ${totals.files} files. Generated from data/python/*.js — three-tier examples (intro/junior/senior), decision rules, anti-patterns, and cross-links optimized for RAG retrieval.`)
  out.push('')
  out.push('## Files')
  out.push('')
  for (const fd of filesData) {
    const tgt = `Sections/${fd.sheet.id}/_Index`
    const cnt = fd.sections.reduce((n, s) => n + (s.entries?.length || 0), 0)
    out.push(`- ${wikilink(tgt, fd.sheet.label)} — ${cnt} entries`)
  }
  out.push('')
  out.push('## Maps of Content')
  out.push('')
  out.push(`- ${wikilink('MOC/Decision Rules', 'Decision Rules')} — every entry\'s "Decision rule" promoted (prime RAG retrieval)`)
  out.push(`- ${wikilink('MOC/Anti-Patterns', 'Anti-Patterns')} — every entry\'s "Anti-pattern" callout`)
  out.push(`- ${wikilink('MOC/By Category', 'By Category')} — entries grouped by their category field`)
  out.push(`- ${wikilink('MOC/Tier Coverage', 'Tier Coverage')} — entries by tier completeness`)
  out.push('')
  out.push('## Setup Guides')
  out.push('')
  out.push(`- ${wikilink('README', 'Vault overview')} — layout, frontmatter schema, regeneration`)
  out.push(`- ${wikilink('RAG', 'RAG setup for local AI')} — three paths (AnythingLLM / Smart Connections / custom), full Python pipeline, filtered retrieval recipes`)
  out.push('')
  out.push('## How to Use')
  out.push('')
  out.push('- Open in Obsidian. Graph view shows cross-links between entries, sections, and MOCs.')
  out.push('- Use the file/section indexes for browsing; use Decision Rules / Anti-Patterns MOCs for retrieval.')
  out.push('- Each entry has YAML frontmatter: `domain`, `file`, `section`, `id`, `category`, `tags`, `aliases`, `signature_short`. Useful for Dataview queries and RAG filtering.')
  out.push('')
  out.push('---')
  out.push(`*Generated: ${new Date().toISOString().split('T')[0]} · ${totals.entries} entries · ${totals.files} files*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

/* ───────── MOCs ───────── */

function decisionRulesMOC({ items }) {
  const fm = frontmatter({
    type: 'moc',
    title: 'Decision Rules',
    tags: ['python', 'moc', 'decision-rules', 'rag'],
  })
  const out = []
  out.push('# Decision Rules')
  out.push('')
  out.push('> Each entry\'s "Decision rule:" block — the dense knowledge that picks one tool over another. Optimized for RAG retrieval; each card here is a self-contained chunk.')
  out.push('')
  // Group by file
  const byFile = new Map()
  for (const it of items) {
    if (!byFile.has(it.sheet.id)) byFile.set(it.sheet.id, [])
    byFile.get(it.sheet.id).push(it)
  }
  for (const [fileId, list] of byFile) {
    const sheet = list[0].sheet
    out.push(`## ${sheet.label}`)
    out.push('')
    for (const { entry, sheet: sh, section, decisionRule } of list) {
      const tgt = `Sections/${sh.id}/${sanitize(section.id)}/${sanitize(entry.id)}`
      out.push(`### ${wikilink(tgt, entry.fn)}`)
      out.push('')
      out.push('```text')
      out.push(decisionRule)
      out.push('```')
      out.push('')
    }
  }
  out.push('---')
  out.push(`*${items.length} decision rules · ${wikilink('_Index', 'Vault index')}*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

function antiPatternsMOC({ items }) {
  const fm = frontmatter({
    type: 'moc',
    title: 'Anti-Patterns',
    tags: ['python', 'moc', 'anti-patterns', 'rag'],
  })
  const out = []
  out.push('# Anti-Patterns')
  out.push('')
  out.push('> Each entry\'s "Anti-pattern:" callout — the specific bug the senior tier warns against.')
  out.push('')
  const byFile = new Map()
  for (const it of items) {
    if (!byFile.has(it.sheet.id)) byFile.set(it.sheet.id, [])
    byFile.get(it.sheet.id).push(it)
  }
  for (const [fileId, list] of byFile) {
    const sheet = list[0].sheet
    out.push(`## ${sheet.label}`)
    out.push('')
    for (const { entry, sheet: sh, section, antiPattern } of list) {
      const tgt = `Sections/${sh.id}/${sanitize(section.id)}/${sanitize(entry.id)}`
      out.push(`### ${wikilink(tgt, entry.fn)}`)
      out.push('')
      out.push(`> [!warning] ${antiPattern.split('\n')[0]}`)
      const rest = antiPattern.split('\n').slice(1).join('\n').trim()
      if (rest) out.push(rest)
      out.push('')
    }
  }
  out.push('---')
  out.push(`*${items.length} anti-patterns · ${wikilink('_Index', 'Vault index')}*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

function categoryMOC({ allEntries }) {
  const fm = frontmatter({
    type: 'moc',
    title: 'By Category',
    tags: ['python', 'moc', 'category'],
  })
  const out = []
  out.push('# By Category')
  out.push('')
  out.push('> Every entry that declares a `category:` field, grouped.')
  out.push('')
  const byCat = new Map()
  for (const it of allEntries) {
    const cat = it.entry.category || '(uncategorized)'
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat).push(it)
  }
  const categories = [...byCat.keys()].sort()
  for (const cat of categories) {
    out.push(`## ${cat}`)
    out.push('')
    for (const it of byCat.get(cat)) {
      const tgt = `Sections/${it.sheet.id}/${sanitize(it.section.id)}/${sanitize(it.entry.id)}`
      out.push(`- ${wikilink(tgt, `${it.entry.fn} — ${it.sheet.label}`)}`)
    }
    out.push('')
  }
  return fm + '\n\n' + out.join('\n') + '\n'
}

function tierCoverageMOC({ allEntries }) {
  const fm = frontmatter({
    type: 'moc',
    title: 'Tier Coverage',
    tags: ['python', 'moc', 'tiers'],
  })
  const out = []
  out.push('# Tier Coverage')
  out.push('')
  out.push('> Inventory by tier completeness. Three-tier entries get full progressive disclosure.')
  out.push('')
  let three = 0, legacy = 0
  for (const it of allEntries) {
    if (Array.isArray(it.entry.examples) && it.entry.examples.length === 3) three++
    else legacy++
  }
  out.push(`- **${three}** entries with three tiers (intro / junior / senior)`)
  out.push(`- **${legacy}** entries with legacy single example`)
  out.push('')
  out.push('## Three-tier entries by file')
  out.push('')
  const byFile = new Map()
  for (const it of allEntries) {
    if (!Array.isArray(it.entry.examples) || it.entry.examples.length !== 3) continue
    if (!byFile.has(it.sheet.id)) byFile.set(it.sheet.id, [])
    byFile.get(it.sheet.id).push(it)
  }
  for (const [fileId, list] of byFile) {
    const sheet = list[0].sheet
    out.push(`### ${sheet.label} (${list.length})`)
    out.push('')
    for (const it of list) {
      const tgt = `Sections/${it.sheet.id}/${sanitize(it.section.id)}/${sanitize(it.entry.id)}`
      out.push(`- ${wikilink(tgt, it.entry.fn)}`)
    }
    out.push('')
  }
  return fm + '\n\n' + out.join('\n') + '\n'
}

function mocIndex() {
  const fm = frontmatter({
    type: 'moc-index',
    title: 'Maps of Content',
    tags: ['python', 'moc', 'index'],
  })
  const out = []
  out.push('# Maps of Content')
  out.push('')
  out.push(`- ${wikilink('MOC/Decision Rules', 'Decision Rules')}`)
  out.push(`- ${wikilink('MOC/Anti-Patterns', 'Anti-Patterns')}`)
  out.push(`- ${wikilink('MOC/By Category', 'By Category')}`)
  out.push(`- ${wikilink('MOC/Tier Coverage', 'Tier Coverage')}`)
  out.push('')
  out.push(`*${wikilink('_Index', 'Vault index')}*`)
  return fm + '\n\n' + out.join('\n') + '\n'
}

/* ───────── README ───────── */

function readme(totals) {
  return `# Python Vault

Auto-generated Obsidian vault for the Python codesheets.

- **${totals.entries}** entries
- **${totals.files}** files (sheets)
- **${totals.threeTier}** entries with three-tier examples (intro / junior / senior)
- **${totals.decisionRules}** decision-rule blocks
- **${totals.antiPatterns}** anti-pattern callouts

## Companion guides

- **\`RAG.md\`** — set this vault up as a RAG knowledge base for local AI (AnythingLLM, Smart Connections, or a custom sentence-transformers + ChromaDB + Ollama pipeline)
- **\`_Index.md\`** — master index linking every file
- **\`MOC/\`** — Decision Rules and Anti-Patterns aggregated for high-value retrieval

## Open in Obsidian

1. Obsidian → \`Open another vault\` → \`Open folder as vault\`
2. Pick this folder (\`python-vault/\`)

## Using it like the website's cheat sheet

The website pattern is *click a row → modal pops up with full detail*. The vault follows the same shape:

| Website | Obsidian equivalent |
|---|---|
| Sheet page (e.g. \`/python/typing\`) | \`Sections/typing/_Index.md\` |
| Cheat-sheet row (\`fn\` + \`desc\`) | A wikilink line in the index |
| Click row → modal pops | Click wikilink → entry note opens |
| Modal content | Entry note body |

To get the **modal popup feel** in Obsidian, three options (best to most native):

1. **Hover preview** (built-in, default): hold \`Cmd/Ctrl\` and hover over any wikilink → a popup shows the entry's content without leaving the index. This is the closest match to the website's modal.
2. **Open in side pane**: \`Cmd/Ctrl + click\` opens the entry in a side pane while keeping the index visible.
3. **Hover Editor plugin** (community): turns hover previews into draggable, pinnable mini-windows — the most modal-like experience.

For navigation parallel to the modal's prev/next:
- \`Cmd/Ctrl + O\` → quick switcher (search by entry title or alias)
- Graph view → see entries connected by their \`See Also\` and \`category\` cross-links

## Layout

\`\`\`
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
\`\`\`

## Per-entry note layout

Each entry has YAML frontmatter for RAG filtering and Dataview queries, then sections in this order (mirrors the website):

1. Title + subtitle blockquote
2. \`## Overview\` — descLong
3. \`## Signature\` — fenced \`python\` block
4. \`## Example — Intro (Entry-Level)\`
5. \`## Example — Junior (Intermediate)\`
6. \`## Example — Senior (Production)\`
7. \`## Decision Rule\` — extracted from the senior tier's "Decision rule:" comment block
8. \`## Anti-Pattern\` — extracted from the senior tier's "Anti-pattern:" comment block
9. \`## Tips\` — bullet list
10. \`## Common Mistake\` — \`> [!warning]\` callout
11. \`## Shorthand (Junior → Senior)\` — when the legacy \`shorthand\` field is present
12. \`## See Also\` — sibling category entries + section / file / vault indexes

## Frontmatter schema

\`\`\`yaml
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
\`\`\`

## RAG ingestion notes

- Each \`## SectionHeader\` is a stable boundary — chunk on \`##\`.
- "Decision Rule" and "Anti-Pattern" are top-level sections so a chunker hits them as discrete chunks (these are the densest knowledge cards).
- Tags are hierarchical (\`python/pandas/io\`); easy to filter retrieval to a domain or sheet.
- \`signature_short\` in frontmatter is one line — useful as a tooltip preview.
- The \`MOC/Decision Rules.md\` and \`MOC/Anti-Patterns.md\` files concentrate the senior tier's most distilled knowledge for high-value retrieval.

---

*Regenerate with: \`node scripts/build-python-vault.mjs\`*
`
}

/* ───────── main ───────── */

async function main() {
  console.log('Building Python Obsidian vault...')

  // Load catalog (skip the 'master' aggregate sheet)
  const { catalog } = await import(path.join(ROOT, 'data', 'catalog.js'))
  const py = catalog.find(d => d.id === 'python')
  if (!py) throw new Error('python domain not in catalog')
  const sheets = py.sheets.filter(s => s.id !== 'master')

  // Ensure vault dirs exist (don't rm — Obsidian may have files open)
  await fs.mkdir(VAULT, { recursive: true })
  await fs.mkdir(path.join(VAULT, 'Sections'), { recursive: true })
  await fs.mkdir(path.join(VAULT, 'MOC'), { recursive: true })

  // Collect everything first (need cross-references for "See Also")
  const filesData = []
  const allEntries = []
  for (const sheet of sheets) {
    const data = await import(path.join(DATA_DIR, `${sheet.id}.js`))
    filesData.push({ sheet, sections: data.sections })
    for (const section of data.sections) {
      for (const entry of section.entries || []) {
        allEntries.push({ sheet, section, entry })
      }
    }
  }

  // Build a category index for sibling links
  const allByCategory = new Map()
  for (const it of allEntries) {
    if (!it.entry.category) continue
    if (!allByCategory.has(it.entry.category)) allByCategory.set(it.entry.category, [])
    allByCategory.get(it.entry.category).push(it)
  }

  // Decision rules / anti-patterns aggregation
  const drItems = []
  const apItems = []
  for (const it of allEntries) {
    const senior = getTierCode(it.entry, 'senior')
    if (!senior) continue
    const dr = extractBlock(senior, 'Decision rule')
    const ap = extractBlock(senior, 'Anti-pattern') || extractBlock(senior, 'Anti pattern')
    if (dr) drItems.push({ ...it, decisionRule: dr })
    if (ap) apItems.push({ ...it, antiPattern: ap })
  }

  // Write per-entry notes + per-section + per-file indexes
  let written = 0
  for (const fd of filesData) {
    const fileSheetDir = path.join(VAULT, 'Sections', fd.sheet.id)
    await fs.mkdir(fileSheetDir, { recursive: true })
    for (const section of fd.sections) {
      const sectionDir = path.join(fileSheetDir, sanitize(section.id))
      await fs.mkdir(sectionDir, { recursive: true })
      for (const entry of section.entries || []) {
        const md = entryNote({ entry, sheet: fd.sheet, section, allByCategory })
        await fs.writeFile(path.join(sectionDir, `${sanitize(entry.id)}.md`), md)
        written++
      }
      await fs.writeFile(
        path.join(sectionDir, '_Index.md'),
        sectionIndex({ sheet: fd.sheet, section })
      )
    }
    await fs.writeFile(
      path.join(fileSheetDir, '_Index.md'),
      fileIndex({ sheet: fd.sheet, sections: fd.sections })
    )
  }

  // Master index + MOCs
  const totals = {
    entries: allEntries.length,
    files: filesData.length,
    threeTier: allEntries.filter(it => Array.isArray(it.entry.examples) && it.entry.examples.length === 3).length,
    decisionRules: drItems.length,
    antiPatterns: apItems.length,
  }
  await fs.writeFile(path.join(VAULT, '_Index.md'), masterIndex({ filesData, totals }))
  await fs.writeFile(path.join(VAULT, 'MOC', '_Index.md'), mocIndex())
  await fs.writeFile(path.join(VAULT, 'MOC', 'Decision Rules.md'), decisionRulesMOC({ items: drItems }))
  await fs.writeFile(path.join(VAULT, 'MOC', 'Anti-Patterns.md'), antiPatternsMOC({ items: apItems }))
  await fs.writeFile(path.join(VAULT, 'MOC', 'By Category.md'), categoryMOC({ allEntries }))
  await fs.writeFile(path.join(VAULT, 'MOC', 'Tier Coverage.md'), tierCoverageMOC({ allEntries }))
  await fs.writeFile(path.join(VAULT, 'README.md'), readme(totals))

  console.log(`✓ Wrote ${written} entry notes`)
  console.log(`  ${totals.threeTier} three-tier · ${totals.entries - totals.threeTier} legacy`)
  console.log(`  ${totals.decisionRules} decision rules · ${totals.antiPatterns} anti-patterns`)
  console.log(`  Output: ${VAULT}`)
}

main().catch(e => { console.error(e); process.exit(1) })

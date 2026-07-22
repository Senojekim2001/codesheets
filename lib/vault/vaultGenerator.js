/**
 * vaultGenerator.js
 * Master generator for the CodeSheets Premium Obsidian Vault.
 *
 * Produces a complete .zip containing:
 *   Domains/{domain}/{entry}.md     — Every entry as a linked note
 *   Domains/{domain}/_Index.md      — Domain index (MOC)
 *   MOC/{concept}.md                — Cross-domain Maps of Content
 *   MOC/_Index.md                   — MOC master index
 *   Learning Paths/{path}.md        — Guided learning sequences
 *   Learning Paths/_Index.md        — LP master index
 *   Prompts/{domain}/{template}.md  — AI prompt templates
 *   Prompts/_Index.md               — Prompts master index
 *   Templates/Daily Review.md       — Daily review template
 *   Templates/Weekly Review.md      — Weekly review template
 *   Study System.md                 — How-to-use guide
 *   README.md                       — Vault overview
 *
 * Usage (client-side):
 *   import { generatePremiumVault } from './vaultGenerator'
 *   const blob = await generatePremiumVault(allSheetData)
 *   downloadBlob(blob, 'codesheets-vault.zip')
 */

import { curatedLinks, autoDetectConcepts, getCuratedLinks, getIntraDomainLinks } from './crosslinks.js'
import { learningPaths } from './learningPaths.js'
import { promptTemplates, getTemplatesForDomain, templateToMarkdown } from './promptTemplates.js'
import { dailyReviewTemplate, weeklyReviewTemplate, studySystemNote } from './dailyReview.js'

/* ── Transaction ID ──────────────────────────────────────────────────── */

/**
 * Generate a cryptographically random UUID v4.
 * Works in browser (crypto.randomUUID or crypto.getRandomValues fallback)
 * and Node.js (crypto module).
 */
function generateTransactionId() {
  // Browser with modern API
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Browser fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40  // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80  // variant 1
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
    return [
      hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16),
      hex.slice(16, 20), hex.slice(20, 32),
    ].join('-')
  }
  // Node.js fallback
  const { randomUUID } = require('crypto')
  return randomUUID()
}

/** AWS tracking endpoint — update this to your real endpoint */
const TRACKING_BASE_URL = 'https://api.codesheets.dev/vault/activate'

/* ── Helpers ─────────────────────────────────────────────────────────── */

const LANG_MAP = {
  python: 'python', javascript: 'javascript', typescript: 'typescript',
  sql: 'sql', go: 'go', r: 'r', excel: 'vba', react: 'jsx',
  nextjs: 'jsx', nodejs: 'javascript', stats: 'python',
}

function codeLang(domain) {
  return LANG_MAP[domain] || domain
}

function sanitize(str) {
  return str.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, ' ').trim()
}

function wikilink(path, label) {
  return label ? `[[${path}|${label}]]` : `[[${path}]]`
}

function frontmatter(obj) {
  const lines = ['---']
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`)
      v.forEach(item => lines.push(`  - "${item}"`))
    } else {
      lines.push(`${k}: ${JSON.stringify(v)}`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

function formatTips(tips) {
  if (!tips || tips.length === 0) return ''
  return tips.map(t => `- ${t}`).join('\n')
}

/* ── Entry Note Generator ────────────────────────────────────────────── */

function entryToNote(entry, domainId, domainLabel, domainIcon) {
  const entryPath = `${domainId}/${entry.id}`
  const lang = codeLang(domainId)

  // Gather cross-links
  const curated = getCuratedLinks(entryPath)
  const autoConcepts = autoDetectConcepts(entry)

  // Frontmatter
  const fm = frontmatter({
    type: 'entry',
    domain: domainId,
    id: entry.id,
    category: entry.category || '',
    tags: [domainId, ...(entry.category ? [entry.category.toLowerCase().replace(/\s+/g, '-')] : []), ...autoConcepts],
  })

  // Body sections
  const sections = []

  // Title
  sections.push(`# ${domainIcon} ${entry.fn}`)
  sections.push('')

  // Subtitle + description
  if (entry.subtitle) sections.push(`> ${entry.subtitle}`)
  sections.push('')
  sections.push(entry.descLong || entry.desc || '')
  sections.push('')

  // Signature
  if (entry.signature) {
    sections.push('## Signature')
    sections.push(`\`\`\`${lang}\n${entry.signature}\n\`\`\``)
    sections.push('')
  }

  // Code example
  if (entry.code) {
    sections.push('## Code Example')
    sections.push(`\`\`\`${lang}\n${entry.code}\n\`\`\``)
    sections.push('')
  }

  // Shorthand comparison
  if (entry.shorthand) {
    sections.push('## ⚡ Shorthand')
    sections.push('> Junior → Senior · readable & idiomatic, not just shorter')
    sections.push('')
    sections.push('**Junior:**')
    sections.push(`\`\`\`${lang}\n${entry.shorthand.verbose}\n\`\`\``)
    sections.push('**Senior:**')
    sections.push(`\`\`\`${lang}\n${entry.shorthand.concise}\n\`\`\``)
    sections.push('')
  }

  // Tips
  if (entry.tips && entry.tips.length > 0) {
    sections.push('## Pro Tips')
    sections.push(formatTips(entry.tips))
    sections.push('')
  }

  // Common mistake
  if (entry.mistake) {
    sections.push('## Common Mistake')
    sections.push(`> [!warning] ${entry.mistake}`)
    sections.push('')
  }

  // Intra-domain deep-dive links (same language)
  const intraDomain = getIntraDomainLinks(domainId, entry.id)
  const intraIds = new Set(intraDomain.flatMap(g => g.entries))
  if (intraDomain.length > 0) {
    sections.push('## Deep Dive (This Domain)')
    for (const group of intraDomain) {
      sections.push(`**${group.concept}:**`)
      const links = group.entries.map(eId => {
        const notePath = `Domains/${domainId}/${sanitize(eId)}`
        return wikilink(notePath, eId)
      })
      sections.push(links.join(' · '))
      sections.push('')
    }
  }

  // Cross-domain links — filter out same-domain entries already shown above
  if (curated.length > 0) {
    const dedupedGroups = curated.map(group => ({
      concept: group.concept,
      entries: group.entries.filter(target => {
        const [tDomain, tId] = target.split('/')
        return !(tDomain === domainId && intraIds.has(tId))
      }),
    })).filter(group => group.entries.length > 0)

    if (dedupedGroups.length > 0) {
      sections.push('## See Also (Cross-Domain)')
      for (const group of dedupedGroups) {
        sections.push(`### ${group.concept}`)
        for (const target of group.entries) {
          const [tDomain, tId] = target.split('/')
          const notePath = `Domains/${tDomain}/${sanitize(tId)}`
          sections.push(`- ${wikilink(notePath, `${tDomain}/${tId}`)}`)
        }
        sections.push('')
      }
    }
  }

  // Auto-detected concept tags
  if (autoConcepts.length > 0) {
    sections.push('## Related Concepts')
    sections.push(autoConcepts.map(c => `[[MOC/${sanitize(c)}|${c}]]`).join(' · '))
    sections.push('')
  }

  // YouTube link
  if (entry.ytId) {
    sections.push('## Video Tutorial')
    sections.push(`[Watch: ${entry.ytTitle || entry.fn}](https://youtube.com/watch?v=${entry.ytId})`)
    sections.push('')
  }

  // Footer
  sections.push('---')
  sections.push(`*${wikilink(`Domains/${domainId}/_Index`, domainLabel + ' Index')} · [[Study System]] · [codesheets.dev](https://codesheets.dev/${domainId})*`)

  return fm + '\n\n' + sections.join('\n')
}

/* ── Domain Index (MOC per domain) ───────────────────────────────────── */

function domainIndexNote(domainId, domainLabel, domainIcon, sections) {
  const fm = frontmatter({
    type: 'domain-index',
    domain: domainId,
  })

  const body = [`# ${domainIcon} ${domainLabel} — Complete Index`, '']

  let totalEntries = 0
  for (const section of sections) {
    body.push(`## ${section.title}`)
    if (section.entries) {
      for (const entry of section.entries) {
        const notePath = `Domains/${domainId}/${sanitize(entry.id)}`
        body.push(`- ${wikilink(notePath, entry.fn)} — ${entry.desc || ''}`)
        totalEntries++
      }
    }
    body.push('')
  }

  body.push('---')
  body.push(`> ${totalEntries} entries · [[Study System]] · [[Maps of Content Index|MOC]] · [codesheets.dev](https://codesheets.dev/${domainId})`)

  return fm + '\n\n' + body.join('\n')
}

/* ── Maps of Content ─────────────────────────────────────────────────── */

function mocNote(concept, entries) {
  const fm = frontmatter({
    type: 'moc',
    concept: concept,
  })

  const body = [`# ${concept}`, '']
  body.push(`> This concept appears across multiple domains. Understanding each implementation deepens your grasp of the pattern.`)
  body.push('')

  // Group entries by domain
  const byDomain = {}
  for (const entryPath of entries) {
    const [domain] = entryPath.split('/')
    if (!byDomain[domain]) byDomain[domain] = []
    byDomain[domain].push(entryPath)
  }

  for (const [domain, paths] of Object.entries(byDomain)) {
    body.push(`### ${domain}`)
    for (const path of paths) {
      const [d, id] = path.split('/')
      const notePath = `Domains/${d}/${sanitize(id)}`
      body.push(`- ${wikilink(notePath, path)}`)
    }
    body.push('')
  }

  body.push('---')
  body.push(`*[[Maps of Content Index]] · [[Study System]]*`)

  return fm + '\n\n' + body.join('\n')
}

function mocIndexNote(concepts) {
  const fm = frontmatter({ type: 'moc-index' })
  const body = ['# Maps of Content', '']
  body.push('> Cross-domain concept maps showing how the same patterns appear in different languages and tools.')
  body.push('')

  // Group by category
  const categories = {
    'Data Manipulation': ['Filtering Data', 'Sorting', 'Grouping & Aggregation', 'Joining / Merging Data', 'String Manipulation', 'Date & Time', 'Map / Transform'],
    'Control Flow & Patterns': ['Error Handling', 'Async / Concurrency', 'Iteration Patterns', 'Pattern Matching / Switch'],
    'Functions & Modules': ['Lambda / Anonymous Functions', 'Closures', 'Module Systems'],
    'Data Structures': ['Hash Maps / Dictionaries', 'Arrays / Lists / Slices', 'Stacks & Queues'],
    'OOP & Types': ['Classes / Structs', 'Interfaces & Protocols', 'Type Systems'],
    'Testing': ['Unit Testing', 'Mocking'],
    'ML & Statistics': ['Linear Regression', 'Classification', 'Model Evaluation', 'Clustering', 'Neural Networks'],
    'Data Visualization': ['Bar Charts', 'Scatter Plots', 'Histograms & Distributions'],
    'Web & APIs': ['HTTP Requests', 'REST API Design', 'Authentication'],
    'Frontend': ['Component State', 'Side Effects', 'Routing'],
    'Database': ['CRUD Operations', 'Indexes & Performance', 'Transactions'],
  }

  for (const [cat, conceptNames] of Object.entries(categories)) {
    body.push(`## ${cat}`)
    for (const name of conceptNames) {
      if (concepts.includes(name)) {
        body.push(`- [[MOC/${sanitize(name)}|${name}]]`)
      }
    }
    body.push('')
  }

  // Any uncategorized
  const allCategorized = Object.values(categories).flat()
  const uncategorized = concepts.filter(c => !allCategorized.includes(c))
  if (uncategorized.length > 0) {
    body.push('## Other Concepts')
    for (const name of uncategorized) {
      body.push(`- [[MOC/${sanitize(name)}|${name}]]`)
    }
    body.push('')
  }

  body.push('---')
  body.push('*[[Study System]]*')

  return fm + '\n\n' + body.join('\n')
}

/* ── Learning Path Notes ─────────────────────────────────────────────── */

function learningPathNote(path, domainIcon) {
  const fm = frontmatter({
    type: 'learning-path',
    domain: path.id.split('-')[0],
    level: path.level,
  })

  const levelEmoji = { beginner: '🟢', intermediate: '🟡', advanced: '🔴' }
  const emoji = levelEmoji[path.level] || '⚪'

  const body = [`# ${domainIcon} ${path.title}`, '']
  body.push(`**Level:** ${emoji} ${path.level.charAt(0).toUpperCase() + path.level.slice(1)}`)
  body.push('')
  body.push(`> ${path.description}`)
  body.push('')
  body.push('## Steps')
  body.push('')

  path.steps.forEach((step, i) => {
    const [domain, id] = step.entry.split('/')
    const notePath = `Domains/${domain}/${sanitize(id)}`
    body.push(`${i + 1}. ${wikilink(notePath, step.entry)} — *${step.note}*`)
  })

  body.push('')
  body.push('## Progress Tracker')
  body.push('')
  path.steps.forEach((step, i) => {
    body.push(`- [ ] Step ${i + 1}: ${step.note}`)
  })

  body.push('')
  body.push('---')
  body.push(`*[[Learning Paths Index]] · [[Study System]]*`)

  return fm + '\n\n' + body.join('\n')
}

function learningPathsIndexNote(allPaths) {
  const fm = frontmatter({ type: 'learning-paths-index' })
  const body = ['# Learning Paths', '']
  body.push('> Curated sequences that build knowledge in the right order. Pick your domain and level.')
  body.push('')

  for (const [domainId, paths] of Object.entries(allPaths)) {
    body.push(`## ${domainId.charAt(0).toUpperCase() + domainId.slice(1)}`)
    for (const path of paths) {
      const levelEmoji = { beginner: '🟢', intermediate: '🟡', advanced: '🔴' }
      const emoji = levelEmoji[path.level] || '⚪'
      body.push(`- ${emoji} [[Learning Paths/${sanitize(path.title)}|${path.title}]] — ${path.description}`)
    }
    body.push('')
  }

  body.push('---')
  body.push('*[[Study System]]*')

  return fm + '\n\n' + body.join('\n')
}

/* ── Prompt Template Notes ───────────────────────────────────────────── */

function promptIndexNote(domains) {
  const fm = frontmatter({ type: 'prompts-index' })
  const body = ['# Prompt Templates', '']
  body.push('> Use these with ChatGPT, Claude, or Copilot to practice concepts and get personalized help.')
  body.push('')

  body.push('## Universal Templates')
  for (const tpl of promptTemplates.universal || []) {
    body.push(`- [[Prompts/universal/${sanitize(tpl.id)}|${tpl.title}]]`)
  }
  body.push('')

  for (const domainId of domains) {
    const domainTemplates = promptTemplates[domainId]
    if (domainTemplates && domainTemplates.length > 0) {
      body.push(`## ${domainId.charAt(0).toUpperCase() + domainId.slice(1)}`)
      for (const tpl of domainTemplates) {
        body.push(`- [[Prompts/${domainId}/${sanitize(tpl.id)}|${tpl.title}]]`)
      }
      body.push('')
    }
  }

  body.push('---')
  body.push('*[[Study System]]*')

  return fm + '\n\n' + body.join('\n')
}

/* ── README ──────────────────────────────────────────────────────────── */

function readmeNote(totalEntries, domainCount, txId) {
  const activateUrl = `${TRACKING_BASE_URL}?txid=${txId}&action=activate`
  return `# CodeSheets Premium Vault

> **${totalEntries} interactive code references** across **${domainCount} domains** with cross-domain links, learning paths, AI prompt templates, and a spaced repetition study system.

## Activate Your Vault

[Click here to activate your vault](${activateUrl}) and unlock future updates.

| | |
|---|---|
| **Transaction ID** | \`${txId}\` |
| **Generated** | ${new Date().toISOString().split('T')[0]} |
| **Entries** | ${totalEntries} |
| **Domains** | ${domainCount} |

## Quick Start

1. Open this folder as an Obsidian vault
2. Read the [[Study System]] note for full instructions
3. Pick a [[Learning Paths Index|Learning Path]] to begin
4. Use [[Daily Review Template|Daily Review]] to build retention

## What's Inside

| Folder | Contents |
|--------|----------|
| \`Domains/\` | ${totalEntries} entry notes organized by language/tool |
| \`MOC/\` | Maps of Content — same concept across languages |
| \`Learning Paths/\` | Guided beginner → advanced sequences |
| \`Prompts/\` | AI prompt templates for practice |
| \`Templates/\` | Daily & weekly review templates |

## Recommended Plugins

- **Dataview** — query entries by tag, domain, or status
- **Templater** — automate daily review creation
- **Random Note** — shuffle through entries for review
- **Graph Analysis** — visualize concept connections

---

*Built with love at [codesheets.dev](https://codesheets.dev)*
*© ${new Date().getFullYear()} CodeSheets*
`
}

/* ── MAIN GENERATOR ──────────────────────────────────────────────────── */

/**
 * Generate the complete premium Obsidian vault.
 *
 * @param {Object} allData — Map of domainId → { meta, sections, icon, label, color }
 *   Each domain has sections[].entries[] with the standard 8-field schema.
 * @returns {Promise<Blob>} — ZIP file blob
 */
export async function generatePremiumVault(allData) {
  // Load JSZip
  let JSZip
  try {
    JSZip = (await import('jszip')).default
  } catch {
    // CDN fallback
    if (typeof window !== 'undefined' && window.JSZip) {
      JSZip = window.JSZip
    } else if (typeof window !== 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
      JSZip = window.JSZip
    } else {
      throw new Error('JSZip not available')
    }
  }

  const zip = new JSZip()
  const domainIds = Object.keys(allData)
  let totalEntries = 0

  // Generate unique transaction ID for this vault
  const txId = generateTransactionId()

  // ── 1. Domain entry notes ──────────────────────────────────────────
  for (const [domainId, domainData] of Object.entries(allData)) {
    const { sections, icon, label } = domainData
    const domainFolder = zip.folder(`Domains/${domainId}`)

    for (const section of sections) {
      if (!section.entries) continue
      for (const entry of section.entries) {
        const note = entryToNote(entry, domainId, label, icon)
        domainFolder.file(`${sanitize(entry.id)}.md`, note)
        totalEntries++
      }
    }

    // Domain index
    domainFolder.file('_Index.md', domainIndexNote(domainId, label, icon, sections))
  }

  // ── 2. Maps of Content ─────────────────────────────────────────────
  const mocFolder = zip.folder('MOC')
  const conceptNames = curatedLinks.map(l => l.concept)

  for (const link of curatedLinks) {
    mocFolder.file(`${sanitize(link.concept)}.md`, mocNote(link.concept, link.entries))
  }
  mocFolder.file('_Index.md', mocIndexNote(conceptNames))

  // ── 3. Learning Paths ──────────────────────────────────────────────
  const lpFolder = zip.folder('Learning Paths')
  const domainIcons = Object.fromEntries(
    Object.entries(allData).map(([id, d]) => [id, d.icon])
  )

  for (const [domainId, paths] of Object.entries(learningPaths)) {
    const icon = domainIcons[domainId] || '📘'
    for (const path of paths) {
      lpFolder.file(`${sanitize(path.title)}.md`, learningPathNote(path, icon))
    }
  }
  lpFolder.file('_Index.md', learningPathsIndexNote(learningPaths))

  // ── 4. Prompt Templates ────────────────────────────────────────────
  const promptFolder = zip.folder('Prompts')

  // Universal
  const uniFolder = promptFolder.folder('universal')
  for (const tpl of promptTemplates.universal || []) {
    uniFolder.file(`${sanitize(tpl.id)}.md`, templateToMarkdown(tpl, 'universal'))
  }

  // Per-domain
  for (const domainId of domainIds) {
    const templates = promptTemplates[domainId]
    if (templates && templates.length > 0) {
      const dFolder = promptFolder.folder(domainId)
      for (const tpl of templates) {
        dFolder.file(`${sanitize(tpl.id)}.md`, templateToMarkdown(tpl, domainId))
      }
    }
  }

  promptFolder.file('_Index.md', promptIndexNote(domainIds))

  // ── 5. Templates ───────────────────────────────────────────────────
  const tplFolder = zip.folder('Templates')
  tplFolder.file('Daily Review.md', dailyReviewTemplate())
  tplFolder.file('Weekly Review.md', weeklyReviewTemplate())

  // ── 6. Root notes ──────────────────────────────────────────────────
  const domainList = Object.entries(allData).map(([id, d]) => ({
    label: d.label,
    icon: d.icon,
    entryCount: d.sections.reduce((sum, s) => sum + (s.entries ? s.entries.length : 0), 0),
  }))

  const systemNote = studySystemNote(domainList)
    .replace('{{totalEntries}}', String(totalEntries))
    .replace('{{domainCount}}', String(domainIds.length))

  zip.file('Study System.md', systemNote)
  zip.file('README.md', readmeNote(totalEntries, domainIds.length, txId))

  // ── 7. Vault manifest (machine-readable tracking) ─────────────────
  const manifest = {
    version: '1.0.0',
    product: 'codesheets-premium-vault',
    txId,
    generatedAt: new Date().toISOString(),
    entries: totalEntries,
    domains: domainIds.length,
    domainList: domainIds,
    trackingUrl: `${TRACKING_BASE_URL}?txid=${txId}`,
  }
  zip.file('.vault-manifest.json', JSON.stringify(manifest, null, 2))

  // ── Generate ZIP ───────────────────────────────────────────────────
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return { blob, txId, totalEntries, manifest }
}

/**
 * Convenience: load all domain data from the data/ directory.
 * For use with dynamic imports in the browser.
 */
export async function loadAllDomainData(catalog) {
  const allData = {}

  for (const domain of catalog) {
    // Skip master sheets — we want individual sheets combined
    const sheets = domain.sheets.filter(s => s.id !== 'master')

    // If there's only a master (like sql), use that
    const sheetsToLoad = sheets.length > 0 ? sheets : domain.sheets

    const combinedSections = []

    for (const sheet of sheetsToLoad) {
      try {
        const mod = await import(`../../data/${domain.id}/${sheet.id}.js`)
        const data = mod.default || { sections: mod.sections || [] }
        if (data.sections) {
          combinedSections.push(...data.sections.filter(s => s && s.entries))
        }
      } catch (e) {
        console.warn(`Could not load ${domain.id}/${sheet.id}:`, e.message)
      }
    }

    allData[domain.id] = {
      sections: combinedSections,
      icon: domain.icon,
      label: domain.label,
      color: domain.color,
    }
  }

  return allData
}

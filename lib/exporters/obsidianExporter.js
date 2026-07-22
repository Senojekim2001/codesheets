/**
 * obsidianExporter.js
 * Generates an Obsidian vault as a .zip archive.
 *
 * Vault structure:
 *   {domain}-{sheet}/
 *     ├── index.md            (overview with section links)
 *     ├── sections/
 *     │   ├── {section-id}.md (section with wikilinks to entries)
 *     │   └── ...
 *     └── entries/
 *         ├── {entry-id}.md   (full entry with frontmatter + backlinks)
 *         └── ...
 *
 * Uses JSZip loaded from CDN at export time.
 */

import { detectLanguage, loadScript, CDN } from './fileHelper'
import { frontmatter, entryToMarkdown, wikilink } from './markdownHelper'

/* ── vault generators ──────────────────────────────────────────── */

function generateIndex(sheetData, domain, sheetId, domainLabel, sheetLabel) {
  const sections = sheetData.sections || []
  const totalEntries = sections.reduce((sum, s) => sum + (s.entries?.length || 0), 0)

  const lines = []
  lines.push(frontmatter({
    domain,
    sheet: sheetId,
    type: 'index',
    entries: String(totalEntries),
    tags: [domain, sheetId],
  }))
  lines.push('')
  lines.push(`# ${domainLabel} — ${sheetLabel}`)
  lines.push('')
  lines.push(`> ${sections.length} sections · ${totalEntries} entries`)
  lines.push(`> Generated from [CodeSheets](https://codesheets.dev/${domain}/${sheetId})`)
  lines.push('')
  lines.push('## Sections')
  lines.push('')

  for (const sec of sections) {
    const count = sec.entries?.length || 0
    lines.push(`- ${wikilink('sections/' + sec.id, sec.title)} (${count} entries)`)
  }

  lines.push('')
  lines.push('---')
  lines.push(`*Last generated: ${new Date().toLocaleDateString()}*`)

  return lines.join('\n')
}

function generateSectionFile(section, domain, lang) {
  const entries = section.entries || []
  const lines = []

  lines.push(frontmatter({
    section: section.id,
    title: section.title,
    entries: String(entries.length),
    type: 'section',
    tags: [domain, 'section'],
  }))
  lines.push('')
  lines.push(`# ${section.title}`)
  lines.push('')

  for (const entry of entries) {
    lines.push(`### ${wikilink('entries/' + entry.id, entry.fn)}`)
    lines.push(`${entry.desc}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`Back to ${wikilink('index', 'Index')}`)

  return lines.join('\n')
}

function generateEntryFile(entry, section, domain, lang) {
  const lines = []

  lines.push(frontmatter({
    id: entry.id,
    fn: entry.fn,
    category: entry.category || '',
    section: section.id,
    type: 'entry',
    tags: [domain, entry.category || '', section.id].filter(Boolean),
  }))
  lines.push('')
  lines.push(entryToMarkdown(entry, domain, lang))
  lines.push('')
  lines.push('---')
  lines.push(`Section: ${wikilink('sections/' + section.id, section.title)} · ${wikilink('index', 'Index')}`)

  return lines.join('\n')
}

/* ── main export ───────────────────────────────────────────────── */

/**
 * Generate an Obsidian vault .zip Blob from sheet data.
 * Lazy-loads JSZip from CDN on first call.
 */
export async function generateObsidianVaultZip(sheetData, domain, sheetId, domainLabel, sheetLabel) {
  // Lazy load JSZip
  let JSZip
  try {
    JSZip = (await import('jszip')).default
  } catch {
    await loadScript(CDN.jszip)
    JSZip = window.JSZip
  }

  const zip = new JSZip()
  const lang = detectLanguage(domain)
  const root = `${domain}-${sheetId}`
  const sections = sheetData.sections || []

  // index.md
  zip.file(`${root}/index.md`, generateIndex(sheetData, domain, sheetId, domainLabel, sheetLabel))

  // sections + entries
  for (const section of sections) {
    zip.file(`${root}/sections/${section.id}.md`, generateSectionFile(section, domain, lang))

    for (const entry of (section.entries || [])) {
      zip.file(`${root}/entries/${entry.id}.md`, generateEntryFile(entry, section, domain, lang))
    }
  }

  return zip.generateAsync({ type: 'blob' })
}

/**
 * notebookExporter.js
 * Generates a Jupyter .ipynb notebook from sheet data.
 * Zero external dependencies — .ipynb is just JSON.
 *
 * Structure:
 *   - Title markdown cell (sheet name, domain, entry count)
 *   - For each section:
 *     - Section heading (markdown)
 *     - For each entry:
 *       - Markdown cell: fn, category, descLong, signature, tips, mistake
 *       - Code cell: the entry's code example (runnable)
 */

import { jupyterKernel, detectLanguage } from './fileHelper'

/* ── cell builders ─────────────────────────────────────────────── */

function mdCell(source) {
  return {
    cell_type: 'markdown',
    metadata: {},
    source: Array.isArray(source) ? source : source.split('\n').map((l, i, a) => i < a.length - 1 ? l + '\n' : l),
  }
}

function codeCell(source, lang) {
  // For SQL, wrap in a magic comment so users know to use %%sql or sqlite3
  let prefix = ''
  if (lang === 'sql') {
    prefix = '# To run SQL in Jupyter, use: pip install ipython-sql\n# Then: %load_ext sql\n# Then: %%sql\n\n'
  } else if (lang === 'excel') {
    prefix = '# Excel formulas shown as reference — try them in Excel/Google Sheets\n\n'
  }

  const lines = (prefix + source).split('\n').map((l, i, a) => i < a.length - 1 ? l + '\n' : l)

  return {
    cell_type: 'code',
    metadata: {},
    source: lines,
    execution_count: null,
    outputs: [],
  }
}

/* ── entry → cells ─────────────────────────────────────────────── */

function entryToCells(entry, lang) {
  const cells = []

  // Markdown cell: description
  const md = []
  md.push(`### ${entry.fn}\n`)
  const meta = []
  if (entry.category) meta.push(`**${entry.category}**`)
  if (entry.subtitle) meta.push(`*${entry.subtitle}*`)
  if (meta.length) md.push(meta.join(' — ') + '\n')
  md.push('\n')

  if (entry.descLong) {
    md.push(entry.descLong + '\n')
    md.push('\n')
  }

  if (entry.signature) {
    md.push('**Signature:**\n')
    md.push('```\n')
    md.push(entry.signature + '\n')
    md.push('```\n')
    md.push('\n')
  }

  if (entry.tips && entry.tips.length) {
    md.push('**Tips:**\n')
    entry.tips.forEach(t => md.push(`- ${t}\n`))
    md.push('\n')
  }

  if (entry.mistake) {
    md.push(`> **Common Mistake:** ${entry.mistake}\n`)
    md.push('\n')
  }

  if (entry.ytId) {
    md.push(`[Watch tutorial: ${entry.ytTitle || entry.fn}](https://youtu.be/${entry.ytId})\n`)
  }

  cells.push(mdCell(md.join('')))

  // Code cell: the example code
  if (entry.code) {
    cells.push(codeCell(entry.code, lang))
  }

  return cells
}

/* ── main export ───────────────────────────────────────────────── */

/**
 * Generate a Jupyter notebook Blob from sheet data.
 * @param {Object} sheetData - { meta, sections: [{ id, title, entries }] }
 * @param {string} domain    - e.g. 'python'
 * @param {string} sheetId   - e.g. 'core'
 * @param {string} domainLabel - e.g. 'Python'
 * @param {string} sheetLabel  - e.g. 'Core Syntax & Built-ins'
 * @returns {Blob}
 */
export function generateJupyterNotebookBlob(sheetData, domain, sheetId, domainLabel, sheetLabel) {
  const lang = detectLanguage(domain)
  const kernel = jupyterKernel(domain)
  const sections = sheetData.sections || []
  const totalEntries = sections.reduce((sum, s) => sum + (s.entries?.length || 0), 0)

  const cells = []

  // ── Title cell ──
  cells.push(mdCell([
    `# ${domainLabel} — ${sheetLabel}\n`,
    '\n',
    `> Interactive reference notebook generated from [CodeSheets](https://codesheets.dev/${domain}/${sheetId})\n`,
    `> ${sections.length} sections · ${totalEntries} entries\n`,
    '\n',
    '---\n',
  ].join('')))

  // ── Sections ──
  for (const section of sections) {
    // Section heading
    cells.push(mdCell(`## ${section.title}\n`))

    // Entries
    for (const entry of (section.entries || [])) {
      cells.push(...entryToCells(entry, lang))
    }
  }

  // ── Build notebook JSON ──
  const notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        name: kernel.name,
        display_name: kernel.display_name,
        language: kernel.language,
      },
      language_info: {
        name: kernel.language,
      },
      codesheets: {
        domain,
        sheet: sheetId,
        entries: totalEntries,
        generated: new Date().toISOString(),
      },
    },
    cells,
  }

  const json = JSON.stringify(notebook, null, 1)
  return new Blob([json], { type: 'application/x-ipynb+json' })
}

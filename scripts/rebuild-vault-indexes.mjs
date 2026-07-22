#!/usr/bin/env node
/**
 * Rebuild all vault _Index.md files from the canonical data/python/*.js sources.
 * Produces clean standard markdown (no embedded HTML) so it works in both
 * Reading View and Live Preview, styled by a single CSS snippet.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data', 'python')
const VAULT = path.join(ROOT, 'python-vault')
const SECTIONS_DIR = path.join(VAULT, 'Sections')

// Map sheet id -> vault folder name (must match existing Sections/* folders)
const SHEETS = [
  { sheet: 'core',              folder: 'core',              title: 'Core Syntax & Built-ins' },
  { sheet: 'pandas',            folder: 'pandas',            title: 'Pandas' },
  { sheet: 'numpy',             folder: 'numpy',             title: 'NumPy' },
  { sheet: 'seaborn',           folder: 'seaborn',           title: 'Seaborn' },
  { sheet: 'matplotlib',        folder: 'matplotlib',        title: 'Matplotlib' },
  { sheet: 'oop',               folder: 'oop',               title: 'Object-Oriented Python' },
  { sheet: 'dsa',               folder: 'dsa',               title: 'Data Structures & Algos' },
  { sheet: 'apis',              folder: 'apis',              title: 'APIs & Frameworks' },
  { sheet: 'testing',           folder: 'testing',           title: 'Testing with pytest' },
  { sheet: 'ml',                folder: 'ml',                title: 'Machine Learning' },
  { sheet: 'deeplearning',      folder: 'deeplearning',      title: 'Deep Learning' },
  { sheet: 'stats',             folder: 'stats',             title: 'Statistics & Probability' },
  { sheet: 'advanced',          folder: 'advanced',          title: 'Advanced Python' },
  { sheet: 'concurrency',       folder: 'concurrency',       title: 'Concurrency & Parallelism' },
  { sheet: 'llm-ai',            folder: 'llm-ai',            title: 'LLMs & AI Engineering' },
  { sheet: 'data-engineering',  folder: 'data-engineering',  title: 'Data Engineering' },
  { sheet: 'typing',            folder: 'typing',            title: 'Type Hints & mypy' },
  { sheet: 'packaging',         folder: 'packaging',         title: 'Packaging, CLI & Tooling' },
  { sheet: 'cli',               folder: 'cli',               title: 'CLI Tools' },
  { sheet: 'filesystem',        folder: 'filesystem',        title: 'Filesystem & Paths' },
  { sheet: 'regex',             folder: 'regex',             title: 'Regular Expressions' },
  { sheet: 'web',               folder: 'web',               title: 'Web (Flask, Django)' },
  { sheet: 'database',          folder: 'database',          title: 'Databases & SQLAlchemy' },
  { sheet: 'debugging-profiling', folder: 'debugging-profiling', title: 'Debugging & Profiling' },
  { sheet: 'observability',     folder: 'observability',     title: 'Observability' },
  { sheet: 'caching',           folder: 'caching',           title: 'Caching' },
  { sheet: 'crypto-secrets',    folder: 'crypto-secrets',    title: 'Crypto & Secrets' },
  { sheet: 'containerization',  folder: 'containerization',  title: 'Containerization' },
  { sheet: 'messaging-queues',  folder: 'messaging-queues',  title: 'Messaging & Queues' },
  { sheet: 'data-apps',         folder: 'data-apps',         title: 'Data Apps' },
  { sheet: 'nlp-classical',     folder: 'nlp-classical',     title: 'Classical NLP' },
  { sheet: 'image-processing',  folder: 'image-processing',  title: 'Image Processing' },
  { sheet: 'notebooks',         folder: 'notebooks',         title: 'Notebooks' },
  { sheet: 'documentation',     folder: 'documentation',     title: 'Documentation' },
  { sheet: 'regex',             folder: 'regex',             title: 'Regular Expressions', skip: true }, // dedup
  { sheet: 'gui-tkinter',       folder: 'gui-tkinter',       title: 'Tkinter' },
  { sheet: 'gui-pyqt',          folder: 'gui-pyqt',          title: 'PyQt / PySide' },
  { sheet: 'audio-dsp',         folder: 'audio-dsp',         title: 'Audio & DSP' },
  { sheet: 'geospatial',        folder: 'geospatial',        title: 'Geospatial' },
  { sheet: 'quantum',           folder: 'quantum',           title: 'Quantum' },
  { sheet: 'web3-blockchain',   folder: 'web3-blockchain',   title: 'Web3 / Blockchain' },
  { sheet: 'bioinformatics',    folder: 'bioinformatics',    title: 'Bioinformatics' },
  { sheet: 'astropy-scientific',folder: 'astropy-scientific',title: 'Astropy & Scientific' },
  { sheet: 'gamedev-pygame',    folder: 'gamedev-pygame',    title: 'Game Dev (pygame)' },
  { sheet: 'embedded-micropython', folder: 'embedded-micropython', title: 'MicroPython / Embedded' },
  { sheet: 'mqtt-iot',          folder: 'mqtt-iot',          title: 'MQTT / IoT' },
  { sheet: 'network-protocols', folder: 'network-protocols', title: 'Network Protocols' },
  { sheet: 'cv-opencv',         folder: 'cv-opencv',         title: 'OpenCV (cv2)' },
]

// Slugify an entry id/name to a safe filename segment
const slug = (s) => s.toString()
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')

async function loadSheet(sheet) {
  const file = path.join(DATA_DIR, `${sheet}.js`)
  try {
    await fs.access(file)
  } catch {
    return null
  }
  const mod = await import(pathToFileURL(file).href)
  return mod.default ?? { meta: mod.meta, sections: mod.sections }
}

function firstLine(s) {
  if (!s) return ''
  return String(s).split('\n')[0].trim()
}

async function writeSectionIndex({ folder, title, sheet, data }) {
  const secDir = path.join(SECTIONS_DIR, folder)
  try { await fs.mkdir(secDir, { recursive: true }) } catch {}

  const totalEntries = (data.sections || []).reduce((n, s) => n + (s.entries?.length || 0), 0)

  const lines = []
  lines.push('---')
  lines.push('type: "file-index"')
  lines.push('domain: "python"')
  lines.push(`file: "${sheet}"`)
  lines.push(`title: "${title}"`)
  lines.push('tags:')
  lines.push('  - "python"')
  lines.push(`  - "python/${sheet}"`)
  lines.push('  - "index"')
  lines.push('---')
  lines.push('')
  lines.push(`# ${title}`)
  lines.push('')
  lines.push(`> ${totalEntries} entries across ${data.sections?.length || 0} sections.`)
  lines.push('')

  for (const sec of (data.sections || [])) {
    const count = sec.entries?.length || 0
    // Standard markdown H2 for section header with count suffix
    lines.push(`## ${sec.title} · ${count}`)
    lines.push('')
    for (const e of (sec.entries || [])) {
      const name = e.fn || e.name || e.id
      const desc = firstLine(e.desc || e.subtitle || '')
      // Obsidian wiki-link format pointing to the section folder
      const entrySlug = slug(e.id || name)
      lines.push(`- [[Sections/${folder}/${sec.id}/${entrySlug}|${name}]] — ${desc}`)
    }
    lines.push('')
  }

  const out = lines.join('\n')
  await fs.writeFile(path.join(secDir, '_Index.md'), out, 'utf8')
  return totalEntries
}

async function writeMasterIndex(summary) {
  const total = summary.reduce((n, r) => n + r.count, 0)
  const lines = []
  lines.push('---')
  lines.push('type: "vault-index"')
  lines.push('domain: "python"')
  lines.push('title: "Python Vault — Master Index"')
  lines.push('tags:')
  lines.push('  - "python"')
  lines.push('  - "index"')
  lines.push('  - "master"')
  lines.push('---')
  lines.push('')
  lines.push('# Python Vault — Master Index')
  lines.push('')
  lines.push(`> ${total} entries across ${summary.length} files. Three-tier examples (intro/junior/senior), decision rules, anti-patterns, and cross-links optimized for RAG retrieval.`)
  lines.push('')
  lines.push(`## Files · ${summary.length}`)
  lines.push('')
  for (const r of summary) {
    lines.push(`- [[Sections/${r.folder}/_Index|${r.title}]] — ${r.count} entries`)
  }
  lines.push('')
  await fs.writeFile(path.join(VAULT, '_Index.md'), lines.join('\n'), 'utf8')
}

async function main() {
  const seen = new Set()
  const summary = []
  for (const spec of SHEETS) {
    if (spec.skip) continue
    if (seen.has(spec.folder)) continue
    seen.add(spec.folder)
    const data = await loadSheet(spec.sheet)
    if (!data) {
      console.log(`skip  ${spec.sheet} (no data file)`)
      continue
    }
    const count = await writeSectionIndex({ folder: spec.folder, title: spec.title, sheet: spec.sheet, data })
    summary.push({ folder: spec.folder, title: spec.title, count })
    console.log(`wrote ${spec.folder} (${count} entries)`)
  }
  summary.sort((a, b) => b.count - a.count)
  await writeMasterIndex(summary)
  console.log(`\nMaster index written. Total files: ${summary.length}`)
}

main().catch((e) => { console.error(e); process.exit(1) })

/**
 * Pre-build script: generates per-sheet JSON files in public/data/{domain}/{sheet}.json
 * These are fetched on-demand by the client when a user opens a snippet.
 * This keeps heavy data (examples, tips, mistake, shorthand, descLong) out of
 * the SSG pageProps / _next/data payloads.
 *
 * Run automatically via "prebuild" npm script.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { catalog, getAllSheetPaths, getSheet } from '../data/catalog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const publicDataDir = join(projectRoot, 'public', 'data')

let count = 0

for (const { params: { domain: domainId, sheet: sheetId } } of getAllSheetPaths()) {
  const match = getSheet(domainId, sheetId)
  if (!match) continue

  let sheetData
  try {
    const mod = await import(`../data/${domainId}/${sheetId}.js`)
    sheetData = mod.default || { meta: mod.meta, sections: mod.sections || [] }
  } catch {
    continue
  }

  const outDir = join(publicDataDir, domainId)
  mkdirSync(outDir, { recursive: true })

  const outFile = join(outDir, `${sheetId}.json`)
  writeFileSync(outFile, JSON.stringify(sheetData))
  count++
}

console.log(`✓ Generated ${count} sheet JSON files in public/data/`)

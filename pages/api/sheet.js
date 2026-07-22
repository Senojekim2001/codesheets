import { getSheet } from '../../data/catalog'

/**
 * API route: /api/sheet?domain=python&sheet=core
 * Returns the full sheet JSON server-side — never exposed in _next/data or pageProps.
 */
export default async function handler(req, res) {
  const { domain, sheet } = req.query

  if (!domain || !sheet) {
    return res.status(400).json({ error: 'Missing domain or sheet parameter' })
  }

  const match = getSheet(domain, sheet)
  if (!match) {
    return res.status(404).json({ error: 'Sheet not found' })
  }

  try {
    const mod = await import(`../../data/${domain}/${sheet}.js`)
    const sheetData = mod.default || { meta: mod.meta, sections: mod.sections || [] }
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json(sheetData)
  } catch {
    return res.status(404).json({ error: 'Sheet data file not found' })
  }
}

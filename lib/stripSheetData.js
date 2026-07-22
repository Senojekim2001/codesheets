/**
 * Strips heavy fields from sheet entries for the lightweight index.
 * The full data is fetched on-demand from /data/{domain}/{sheet}.json
 * when a user opens a specific snippet.
 *
 * Removed fields: examples, tips, mistake, shorthand, descLong, signature, code, ytId, ytTitle
 * Kept fields: id, fn, desc, category, subtitle
 */
export function stripSnippetDataForIndex(sheetData) {
  const sections = (sheetData.sections || []).map(section => ({
    id: section.id,
    title: section.title,
    entries: (section.entries || []).map(entry => ({
      id: entry.id,
      fn: entry.fn,
      desc: entry.desc,
      category: entry.category,
      subtitle: entry.subtitle,
    })),
  }))

  return {
    meta: sheetData.meta,
    sections,
  }
}

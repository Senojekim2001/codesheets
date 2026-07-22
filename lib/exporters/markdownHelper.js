/**
 * markdownHelper.js
 * Shared markdown generation utilities for Obsidian & other MD-based exports.
 */

/** Escape characters that would break markdown rendering */
export function escapeMd(str) {
  if (!str) return ''
  return str
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Format tips array as markdown bullet list */
export function formatTips(tips) {
  if (!tips || !tips.length) return ''
  return tips.map(t => `- ${t}`).join('\n')
}

/** Create an Obsidian-style wikilink */
export function wikilink(id, label) {
  return label ? `[[${id}|${label}]]` : `[[${id}]]`
}

/** Generate YAML frontmatter block */
export function frontmatter(obj) {
  const lines = Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v)) {
      return `${k}:\n${v.map(i => `  - "${String(i).replace(/"/g, '\\"')}"`).join('\n')}`
    }
    return `${k}: "${String(v).replace(/"/g, '\\"')}"`
  })
  return `---\n${lines.join('\n')}\n---`
}

/**
 * Convert a single entry into a full markdown document.
 * Used by both Obsidian and standalone .md exports.
 */
export function entryToMarkdown(entry, domain, lang) {
  const parts = []

  // Title
  parts.push(`# ${entry.fn}`)
  parts.push('')

  // Meta line
  const meta = []
  if (entry.category) meta.push(`**Category:** ${entry.category}`)
  if (entry.subtitle) meta.push(`*${entry.subtitle}*`)
  if (meta.length) parts.push(meta.join(' | '))
  parts.push('')

  // Description
  if (entry.descLong) {
    parts.push(entry.descLong)
    parts.push('')
  }

  // Signature
  if (entry.signature) {
    parts.push('## Signature')
    parts.push('```' + lang)
    parts.push(entry.signature)
    parts.push('```')
    parts.push('')
  }

  // Code
  if (entry.code) {
    parts.push('## Code Example')
    parts.push('```' + lang)
    parts.push(entry.code)
    parts.push('```')
    parts.push('')
  }

  // Tips
  if (entry.tips && entry.tips.length) {
    parts.push('## Pro Tips')
    parts.push(formatTips(entry.tips))
    parts.push('')
  }

  // Mistake
  if (entry.mistake) {
    parts.push('## Common Mistake')
    parts.push(`> ${entry.mistake}`)
    parts.push('')
  }

  // Video
  if (entry.ytId) {
    parts.push('## Video')
    parts.push(`[${entry.ytTitle || 'Tutorial Video'}](https://youtu.be/${entry.ytId})`)
    parts.push('')
  }

  return parts.join('\n')
}

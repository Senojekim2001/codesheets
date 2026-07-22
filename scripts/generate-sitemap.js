/**
 * scripts/generate-sitemap.js
 * Run after `next build` to generate sitemap.xml for SEO.
 * Add to package.json: "postbuild": "node scripts/generate-sitemap.js"
 */

const fs = require('fs')
const { catalog } = require('../data/catalog')

const BASE_URL = 'https://codesheets.dev'

const urls = [
  { loc: BASE_URL, priority: '1.0', changefreq: 'weekly' },
  ...catalog.flatMap(domain =>
    domain.sheets.map(sheet => ({
      loc: `${BASE_URL}/${domain.id}/${sheet.id}`,
      priority: sheet.entryCount > 0 ? '0.9' : '0.5',
      changefreq: 'weekly',
    }))
  ),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

fs.writeFileSync('./out/sitemap.xml', sitemap)
console.log(`✓ sitemap.xml — ${urls.length} URLs`)

// Also write robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`

fs.writeFileSync('./out/robots.txt', robots)
console.log('✓ robots.txt')

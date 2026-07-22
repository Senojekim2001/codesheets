import Link from 'next/link'
import SEOHead from '../../components/SEOHead'
import SheetGrid from '../../components/SheetGrid'
import ExportBar from '../../components/ExportBar'
import { catalog, getAllSheetPaths, getSheet } from '../../data/catalog'

/**
 * Pre-renders every sheet at build time.
 * Google gets real HTML — no blank iframes, no client-only rendering.
 */
export async function getStaticPaths() {
  return {
    paths: getAllSheetPaths(),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { domain: domainId, sheet: sheetId } = params
  const match = getSheet(domainId, sheetId)
  if (!match) return { notFound: true }

  // Dynamically import the data file for this sheet
  let sheetData = null
  try {
    const mod = await import(`../../data/${domainId}/${sheetId}.js`)
    sheetData = mod.default || { meta: mod.meta, sections: mod.sections || [] }
  } catch {
    // Sheet data file doesn't exist yet — render empty placeholder
    sheetData = { sections: [] }
  }

  const { domain, sheet } = match

  // Auto-generate SEO description from first 5 entries
  const allEntries = (sheetData.sections || []).flatMap(s => s.entries || [])
  const autoDesc = allEntries.slice(0, 5)
    .map(e => `${e.fn}: ${e.desc}`)
    .join('. ')
  const description = autoDesc
    ? `${sheet.label} cheat sheet for ${domain.label}. Covers ${autoDesc}`
    : `Interactive ${sheet.label} cheat sheet for ${domain.label} — with code examples, pro tips, and video tutorials.`

  return {
    props: {
      domainData: {
        id: domain.id,
        label: domain.label,
        icon: domain.icon,
        color: domain.color,
        sheets: domain.sheets,
      },
      sheetMeta: {
        id: sheet.id,
        label: sheet.label,
      },
      sheetData,
      seo: {
        title: `${sheet.label} — ${domain.label} Cheat Sheet`,
        description,
        canonical: `https://codesheets.dev/${domainId}/${sheetId}`,
      },
    },
  }
}

export default function SheetPage({ domainData, sheetMeta, sheetData, seo }) {
  const sections = sheetData?.sections || []
  const isEmpty = sections.length === 0

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        domain={domainData.id}
      />

      <div className="sheet-page" data-domain={domainData.id}>
        {/* Sheet picker sub-nav */}
        <nav className="sheet-nav" aria-label="Sheets">
          {domainData.sheets.map(s => (
            <Link
              key={s.id}
              href={`/${domainData.id}/${s.id}`}
              className={`sheet-nav-item ${s.id === sheetMeta.id ? 'active' : ''}`}
            >
              {s.id === sheetMeta.id ? `▸ ${s.label}` : s.label}
            </Link>
          ))}
        </nav>

        {!isEmpty && (
          <ExportBar
            domain={domainData.id}
            sheetId={sheetMeta.id}
            sheetData={sheetData}
            domainLabel={domainData.label}
            sheetLabel={sheetMeta.label}
          />
        )}

        {isEmpty ? (
          <ComingSoon domain={domainData} sheet={sheetMeta} />
        ) : (
          <SheetGrid sections={sections} domain={domainData.id} />
        )}
      </div>
    </>
  )
}

function ComingSoon({ domain, sheet }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      gap: 16,
      padding: 40,
    }}>
      <div style={{ fontSize: 48 }}>{domain.icon}</div>
      <h2 style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 32,
        fontWeight: 800,
        color: domain.color,
        letterSpacing: '-0.02em',
      }}>
        {sheet.label}
      </h2>
      <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        // coming soon — check back shortly
      </p>
    </div>
  )
}

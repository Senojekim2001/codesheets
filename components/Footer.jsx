import { catalog } from '../data/catalog'

export default function Footer() {
  const totalEntries = catalog.reduce(
    (sum, d) => sum + d.sheets.reduce((s, sh) => s + (sh.entryCount || 0), 0),
    0
  )
  const totalSheets = catalog.reduce((sum, d) => sum + d.sheets.length, 0)

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Code<em>Sheets</em></span>
          <span className="footer-stat">
            {catalog.length} domains · {totalSheets} sheets · {totalEntries.toLocaleString()} entries
          </span>
        </div>
        <div className="footer-links">
          <span className="footer-hint">
            Press <kbd>/</kbd> to search · Click any entry for a deep dive
          </span>
        </div>
      </div>
    </footer>
  )
}

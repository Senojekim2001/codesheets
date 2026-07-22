import { useState } from 'react'

/**
 * ExportBar — Row of download buttons for PDF, Obsidian, Jupyter, Excel.
 * All generation is client-side. Libraries are lazy-loaded on first click.
 */

const FORMATS = [
  { id: 'pdf',      icon: '\u{1F4C4}', label: 'PDF',      title: 'Download styled PDF reference' },
  { id: 'obsidian', icon: '\u{1F9E0}', label: 'Obsidian',  title: 'Export as Obsidian vault (.zip)' },
  { id: 'jupyter',  icon: '\u{1F4D3}', label: 'Jupyter',   title: 'Download runnable notebook (.ipynb)' },
  { id: 'excel',    icon: '\u{1F4CA}', label: 'Excel',     title: 'Download interactive workbook (.xlsx)' },
]

export default function ExportBar({ domain, sheetId, domainLabel, sheetLabel }) {
  const [active, setActive] = useState(null)   // which format is generating
  const [error, setError]   = useState(null)

  const handleExport = async (formatId) => {
    if (active) return // prevent double-click
    setActive(formatId)
    setError(null)

    try {
      // Fetch full sheet data on-demand (not baked into pageProps)
      const res = await fetch(`/data/${domain}/${sheetId}.json`)
      const sheetData = await res.json()

      // Lazy-import the specific exporter + helper
      const { downloadBlob } = await import('../lib/exporters/fileHelper')

      let blob, filename

      switch (formatId) {
        case 'pdf': {
          const { generatePDFBlob } = await import('../lib/exporters/pdfExporter')
          blob = await generatePDFBlob(sheetData, domain, sheetId, domainLabel, sheetLabel)
          filename = `${domain}-${sheetId}.pdf`
          break
        }
        case 'obsidian': {
          const { generateObsidianVaultZip } = await import('../lib/exporters/obsidianExporter')
          blob = await generateObsidianVaultZip(sheetData, domain, sheetId, domainLabel, sheetLabel)
          filename = `${domain}-${sheetId}-obsidian-vault.zip`
          break
        }
        case 'jupyter': {
          const { generateJupyterNotebookBlob } = await import('../lib/exporters/notebookExporter')
          blob = generateJupyterNotebookBlob(sheetData, domain, sheetId, domainLabel, sheetLabel)
          filename = `${domain}-${sheetId}.ipynb`
          break
        }
        case 'excel': {
          const { generateExcelWorkbookBlob } = await import('../lib/exporters/excelExporter')
          blob = await generateExcelWorkbookBlob(sheetData, domain, sheetId, domainLabel, sheetLabel)
          filename = `${domain}-${sheetId}.xlsx`
          break
        }
      }

      if (blob) downloadBlob(blob, filename)
    } catch (err) {
      console.error(`Export failed (${formatId}):`, err)
      setError(`Export failed — ${err.message}`)
    } finally {
      setActive(null)
    }
  }

  return (
    <div className="export-bar">
      <span className="export-bar-label">Export:</span>
      <div className="export-bar-btns">
        {FORMATS.map(fmt => (
          <button
            key={fmt.id}
            className={`export-btn ${active === fmt.id ? 'exporting' : ''}`}
            onClick={() => handleExport(fmt.id)}
            disabled={!!active}
            title={fmt.title}
          >
            <span className="export-btn-icon">
              {active === fmt.id ? '\u23F3' : fmt.icon}
            </span>
            <span className="export-btn-label">{fmt.label}</span>
          </button>
        ))}
      </div>
      {error && <div className="export-bar-error">{error}</div>}
    </div>
  )
}

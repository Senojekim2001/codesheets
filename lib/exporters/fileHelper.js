/**
 * fileHelper.js
 * Browser-safe file download & shared utilities for all exporters.
 */

/** Trigger a browser download from a Blob */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Map domain id → code language string */
export function detectLanguage(domain) {
  const map = {
    python: 'python',
    sql: 'sql',
    excel: 'excel',
    stats: 'r',
    r: 'r',
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'jsx',
    nextjs: 'jsx',
    nodejs: 'javascript',
    go: 'go',
  }
  return map[domain] || 'text'
}

/** Map domain → Jupyter kernel spec */
export function jupyterKernel(domain) {
  const kernels = {
    python:     { name: 'python3',    display_name: 'Python 3',    language: 'python' },
    sql:        { name: 'python3',    display_name: 'Python 3',    language: 'python' },
    r:          { name: 'ir',         display_name: 'R',           language: 'R' },
    stats:      { name: 'python3',    display_name: 'Python 3',    language: 'python' },
    javascript: { name: 'javascript', display_name: 'JavaScript',  language: 'javascript' },
    typescript: { name: 'typescript', display_name: 'TypeScript',  language: 'typescript' },
    react:      { name: 'javascript', display_name: 'JavaScript',  language: 'javascript' },
    nextjs:     { name: 'javascript', display_name: 'JavaScript',  language: 'javascript' },
    nodejs:     { name: 'javascript', display_name: 'Node.js',     language: 'javascript' },
    go:         { name: 'gophernotes', display_name: 'Go',         language: 'go' },
    excel:      { name: 'python3',    display_name: 'Python 3',    language: 'python' },
  }
  return kernels[domain] || kernels.python
}

/** Sanitize a string for use as a filename */
export function sanitizeFilename(str) {
  return str
    .replace(/[^a-z0-9\-_ ]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

/** Flatten all entries from a sheetData object */
export function flatEntries(sheetData) {
  return (sheetData.sections || []).flatMap(s => s.entries || [])
}

/**
 * Dynamically load a script from CDN (returns a promise).
 * Used to lazy-load jspdf, html2canvas, jszip, exceljs at export time
 * when they are not installed via npm.
 */
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existing = document.querySelector(`script[src="${url}"]`)
    if (existing) { resolve(); return }

    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = () => reject(new Error(`Failed to load ${url}`))
    document.head.appendChild(script)
  })
}

/** CDN URLs for lazy-loaded libraries */
export const CDN = {
  jspdf:       'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
  html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  jszip:       'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  exceljs:     'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
}

/**
 * pdfExporter.js
 * Generates a styled PDF reference document from sheet data.
 *
 * Uses jsPDF for programmatic PDF generation (no html2canvas needed).
 * Lazy-loads from CDN if not installed via npm.
 *
 * Layout:
 *   Page 1: Cover (domain icon + title + stats)
 *   Page 2: Table of Contents
 *   Page 3+: Entries grouped by section
 */

import { detectLanguage, loadScript, CDN, flatEntries } from './fileHelper'

/* ── colors & fonts ────────────────────────────────────────────── */

const COLORS = {
  bg:       [18, 18, 24],       // dark background
  surface:  [26, 26, 36],       // card surface
  border:   [50, 50, 65],       // subtle borders
  text:     [230, 230, 240],    // primary text
  dim:      [140, 140, 160],    // secondary text
  accent:   [0, 200, 200],      // cyan accent
  code:     [13, 13, 18],       // code block bg
  warn:     [255, 180, 50],     // warning/mistake
  green:    [80, 200, 120],     // tips
}

const DOMAIN_COLORS = {
  python:     [245, 196, 0],
  sql:        [232, 160, 32],
  excel:      [29, 122, 69],
  stats:      [168, 85, 247],
  r:          [33, 102, 172],
  javascript: [247, 223, 30],
  typescript: [49, 120, 198],
  react:      [97, 218, 251],
  nextjs:     [180, 180, 180],
  nodejs:     [104, 160, 99],
  go:         [0, 173, 216],
}

/* ── helpers ───────────────────────────────────────────────────── */

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

/** Word-wrap text to fit a given width. Returns array of lines. */
function wrapText(doc, text, maxWidth) {
  if (!text) return ['']
  return doc.splitTextToSize(text, maxWidth)
}

/* ── page builders ─────────────────────────────────────────────── */

function drawPageBg(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, w, h, 'F')
}

function drawFooter(doc, pageNum) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.dim)
  doc.text(`codesheets.dev`, 14, h - 8)
  doc.text(`${pageNum}`, w - 14, h - 8, { align: 'right' })
}

function drawCover(doc, domain, sheetId, domainLabel, sheetLabel, totalSections, totalEntries) {
  drawPageBg(doc)
  const w = doc.internal.pageSize.getWidth()
  const mid = w / 2

  const accentColor = DOMAIN_COLORS[domain] || COLORS.accent

  // Title
  doc.setFontSize(36)
  doc.setTextColor(...accentColor)
  doc.text(domainLabel, mid, 80, { align: 'center' })

  // Subtitle
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.text)
  doc.text(sheetLabel, mid, 95, { align: 'center' })

  // Divider
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(0.5)
  doc.line(mid - 40, 105, mid + 40, 105)

  // Stats
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.dim)
  doc.text(`${totalSections} sections  ·  ${totalEntries} entries`, mid, 118, { align: 'center' })

  // Brand
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.dim)
  doc.text('Generated from CodeSheets', mid, 135, { align: 'center' })
  doc.text(`codesheets.dev/${domain}/${sheetId}`, mid, 142, { align: 'center' })

  // Date
  doc.setFontSize(8)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), mid, 155, { align: 'center' })
}

function drawTOC(doc, sections) {
  doc.addPage()
  drawPageBg(doc)

  const accentColor = COLORS.accent
  let y = 20

  doc.setFontSize(18)
  doc.setTextColor(...accentColor)
  doc.text('Table of Contents', 14, y)
  y += 12

  doc.setFontSize(10)
  let entryIdx = 0
  for (const section of sections) {
    const count = section.entries?.length || 0
    doc.setTextColor(...COLORS.text)
    doc.text(`${section.title}`, 14, y)
    doc.setTextColor(...COLORS.dim)
    doc.text(`${count} entries`, 170, y, { align: 'right' })

    y += 5
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.1)
    doc.line(14, y, 196, y)
    y += 5

    if (y > 270) {
      doc.addPage()
      drawPageBg(doc)
      y = 20
    }
  }

  return doc.internal.getNumberOfPages()
}

function drawEntry(doc, entry, y, maxY, domain, accentColor) {
  const w = doc.internal.pageSize.getWidth()
  const contentWidth = w - 28

  // Check if we need a new page
  if (y > maxY - 40) {
    doc.addPage()
    drawPageBg(doc)
    y = 20
  }

  // fn + category badge
  doc.setFontSize(11)
  doc.setTextColor(...accentColor)
  doc.text(entry.fn, 14, y)

  if (entry.category) {
    const fnWidth = doc.getTextWidth(entry.fn)
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.dim)
    doc.text(entry.category, 14 + fnWidth + 4, y)
  }
  y += 3

  // subtitle
  if (entry.subtitle) {
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.dim)
    doc.text(truncate(entry.subtitle, 100), 14, y + 3)
    y += 6
  }

  // descLong
  if (entry.descLong) {
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    const lines = wrapText(doc, entry.descLong, contentWidth)
    for (const line of lines) {
      y += 4
      if (y > maxY) { doc.addPage(); drawPageBg(doc); y = 20 }
      doc.text(line, 14, y)
    }
    y += 2
  }

  // signature
  if (entry.signature) {
    y += 3
    if (y > maxY - 10) { doc.addPage(); drawPageBg(doc); y = 20 }
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.dim)
    doc.text('Signature:', 14, y)
    y += 4
    doc.setFont('courier', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.accent)
    const sigLines = wrapText(doc, entry.signature, contentWidth)
    for (const line of sigLines) {
      if (y > maxY) { doc.addPage(); drawPageBg(doc); y = 20 }
      doc.text(line, 16, y)
      y += 3.5
    }
    doc.setFont('helvetica', 'normal')
    y += 1
  }

  // code block
  if (entry.code) {
    y += 2
    if (y > maxY - 15) { doc.addPage(); drawPageBg(doc); y = 20 }
    doc.setFont('courier', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(180, 220, 255)
    const codeLines = entry.code.split('\n').slice(0, 30) // cap at 30 lines
    const blockHeight = codeLines.length * 3.2 + 4

    // code background
    doc.setFillColor(...COLORS.code)
    doc.roundedRect(14, y - 2, contentWidth, Math.min(blockHeight, maxY - y + 5), 1.5, 1.5, 'F')

    y += 2
    for (const line of codeLines) {
      if (y > maxY) { doc.addPage(); drawPageBg(doc); y = 20 }
      doc.text(truncate(line, 120), 16, y)
      y += 3.2
    }
    if (entry.code.split('\n').length > 30) {
      doc.setTextColor(...COLORS.dim)
      doc.text('... (truncated)', 16, y)
      y += 3.2
    }
    doc.setFont('helvetica', 'normal')
    y += 2
  }

  // tips
  if (entry.tips && entry.tips.length) {
    y += 2
    if (y > maxY - 10) { doc.addPage(); drawPageBg(doc); y = 20 }
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.green)
    doc.text('Tips:', 14, y)
    y += 4
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(7)
    for (const tip of entry.tips) {
      const tipLines = wrapText(doc, `• ${tip}`, contentWidth - 4)
      for (const line of tipLines) {
        if (y > maxY) { doc.addPage(); drawPageBg(doc); y = 20 }
        doc.text(line, 16, y)
        y += 3.5
      }
    }
    y += 1
  }

  // mistake
  if (entry.mistake) {
    y += 2
    if (y > maxY - 10) { doc.addPage(); drawPageBg(doc); y = 20 }
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.warn)
    doc.text('Common Mistake:', 14, y)
    y += 4
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.text)
    const mLines = wrapText(doc, entry.mistake, contentWidth - 4)
    for (const line of mLines) {
      if (y > maxY) { doc.addPage(); drawPageBg(doc); y = 20 }
      doc.text(line, 16, y)
      y += 3.5
    }
    y += 1
  }

  // divider
  y += 4
  if (y < maxY) {
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.1)
    doc.line(14, y, w - 14, y)
    y += 6
  }

  return y
}

/* ── main export ───────────────────────────────────────────────── */

export async function generatePDFBlob(sheetData, domain, sheetId, domainLabel, sheetLabel) {
  // Lazy load jsPDF
  let jsPDF
  try {
    jsPDF = (await import('jspdf')).jsPDF
  } catch {
    await loadScript(CDN.jspdf)
    jsPDF = window.jspdf.jsPDF
  }

  const sections = sheetData.sections || []
  const totalEntries = sections.reduce((sum, s) => sum + (s.entries?.length || 0), 0)
  const accentColor = DOMAIN_COLORS[domain] || COLORS.accent

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const maxY = doc.internal.pageSize.getHeight() - 14

  // Page 1: Cover
  drawCover(doc, domain, sheetId, domainLabel, sheetLabel, sections.length, totalEntries)

  // Page 2: TOC
  drawTOC(doc, sections)

  // Pages 3+: Entries
  let pageNum = doc.internal.getNumberOfPages()

  for (const section of sections) {
    // Section header on new page
    doc.addPage()
    drawPageBg(doc)
    pageNum++
    let y = 20

    doc.setFontSize(16)
    doc.setTextColor(...accentColor)
    doc.text(section.title, 14, y)
    y += 4
    doc.setDrawColor(...accentColor)
    doc.setLineWidth(0.3)
    doc.line(14, y, 80, y)
    y += 10

    // Draw entries
    for (const entry of (section.entries || [])) {
      y = drawEntry(doc, entry, y, maxY, domain, accentColor)
    }
  }

  // Add footers to all pages (skip cover)
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, i)
  }

  return doc.output('blob')
}

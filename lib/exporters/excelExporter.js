/**
 * excelExporter.js
 * Generates an interactive Excel workbook from sheet data.
 *
 * For ALL domains: creates a styled Reference sheet + Practice sheet.
 * For the EXCEL domain specifically: embeds live formulas users can edit.
 *
 * Uses ExcelJS loaded from CDN if not installed via npm.
 *
 * Workbook structure:
 *   Sheet 1: "Reference" — All entries in a styled table (frozen header, filters)
 *   Sheet 2: "Practice"  — Sample data with formula skeletons to complete
 *   Sheet 3+: "Deep Dive: {fn}" — For Excel domain complex entries
 */

import { loadScript, CDN, detectLanguage } from './fileHelper'

/* ── theme ─────────────────────────────────────────────────────── */

const THEME = {
  headerBg:   'FF1A1A24',
  headerFg:   'FFE6E6F0',
  rowOdd:     'FF121218',
  rowEven:    'FF1E1E2A',
  border:     'FF32324A',
  accent:     'FF00C8C8',
  codeBg:     'FF0D0D12',
  textLight:  'FFE6E6F0',
  textDim:    'FF8C8CA0',
  green:      'FF50C878',
  warn:       'FFFFB432',
}

const DOMAIN_ACCENT = {
  python: 'FFF5C400', sql: 'FFE8A020', excel: 'FF1D7A45', stats: 'FFA855F7',
  r: 'FF2166AC', javascript: 'FFF7DF1E', typescript: 'FF3178C6', react: 'FF61DAFB',
  nextjs: 'FFB4B4B4', nodejs: 'FF68A063', go: 'FF00ADD8',
}

/* ── helpers ───────────────────────────────────────────────────── */

function applyHeaderStyle(row, accentHex) {
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentHex || THEME.headerBg } }
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.alignment = { vertical: 'middle', wrapText: true }
    cell.border = {
      bottom: { style: 'thin', color: { argb: THEME.border } },
    }
  })
  row.height = 28
}

function applyRowStyle(row, isEven) {
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? THEME.rowEven : THEME.rowOdd } }
    cell.font = { name: 'Calibri', size: 10, color: { argb: THEME.textLight } }
    cell.alignment = { vertical: 'top', wrapText: true }
    cell.border = {
      bottom: { style: 'hair', color: { argb: THEME.border } },
    }
  })
}

function applyCodeStyle(cell) {
  cell.font = { name: 'Consolas', size: 9, color: { argb: THEME.accent } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.codeBg } }
}

/* ── Sheet 1: Reference ────────────────────────────────────────── */

function buildReferenceSheet(wb, sheetData, domain, accentHex) {
  const ws = wb.addWorksheet('Reference', {
    properties: { tabColor: { argb: accentHex } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  // Columns
  ws.columns = [
    { header: '#',         key: 'num',       width: 5  },
    { header: 'Section',   key: 'section',   width: 22 },
    { header: 'Function',  key: 'fn',        width: 28 },
    { header: 'Category',  key: 'category',  width: 16 },
    { header: 'Description', key: 'desc',    width: 40 },
    { header: 'Signature', key: 'signature', width: 40 },
    { header: 'Tips',      key: 'tips',      width: 50 },
    { header: 'Mistake',   key: 'mistake',   width: 40 },
  ]

  // Header row
  applyHeaderStyle(ws.getRow(1), accentHex)

  // Data rows
  let idx = 0
  for (const section of (sheetData.sections || [])) {
    for (const entry of (section.entries || [])) {
      idx++
      const row = ws.addRow({
        num: idx,
        section: section.title,
        fn: entry.fn,
        category: entry.category || '',
        desc: entry.descLong || entry.desc || '',
        signature: entry.signature || '',
        tips: (entry.tips || []).map((t, i) => `${i + 1}. ${t}`).join('\n'),
        mistake: entry.mistake || '',
      })
      applyRowStyle(row, idx % 2 === 0)

      // Style signature as code
      const sigCell = row.getCell('signature')
      applyCodeStyle(sigCell)
    }
  }

  // Auto-filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: idx + 1, column: 8 },
  }

  return ws
}

/* ── Sheet 2: Practice ─────────────────────────────────────────── */

function buildPracticeSheet(wb, sheetData, domain, accentHex) {
  const ws = wb.addWorksheet('Practice', {
    properties: { tabColor: { argb: THEME.green } },
  })

  if (domain === 'excel') {
    return buildExcelPracticeSheet(ws, sheetData, accentHex)
  }

  // Generic practice sheet for non-Excel domains
  ws.columns = [
    { header: 'Function',     key: 'fn',         width: 25 },
    { header: 'Your Notes',   key: 'notes',      width: 50 },
    { header: 'Try It Here',  key: 'tryit',      width: 50 },
    { header: 'Rating (1-5)', key: 'confidence',  width: 14 },
  ]

  applyHeaderStyle(ws.getRow(1), accentHex)

  // Instructions row
  const instrRow = ws.addRow({
    fn: 'INSTRUCTIONS:',
    notes: 'Write your own notes and observations for each function.',
    tryit: 'Paste code snippets or formulas here to experiment.',
    confidence: 'Rate 1-5',
  })
  instrRow.eachCell(cell => {
    cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: THEME.textDim } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.rowOdd } }
  })

  let idx = 1
  for (const section of (sheetData.sections || [])) {
    // Section header row
    const secRow = ws.addRow({ fn: `── ${section.title} ──` })
    secRow.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: accentHex } }
    secRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.headerBg } }

    for (const entry of (section.entries || [])) {
      idx++
      const row = ws.addRow({
        fn: entry.fn,
        notes: '',
        tryit: '',
        confidence: '',
      })
      applyRowStyle(row, idx % 2 === 0)
    }
  }

  return ws
}

/* ── Excel-domain-specific practice sheet with live formulas ──── */

function buildExcelPracticeSheet(ws, sheetData, accentHex) {
  // Title
  ws.mergeCells('A1:H1')
  const titleCell = ws.getCell('A1')
  titleCell.value = 'Excel Practice Workbook — Try each formula on the sample data below'
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentHex } }
  titleCell.alignment = { horizontal: 'center' }
  ws.getRow(1).height = 32

  // ── SAMPLE DATA TABLE ──
  ws.getCell('A3').value = 'SAMPLE DATA — Employee Sales Records'
  ws.getCell('A3').font = { bold: true, size: 11, color: { argb: accentHex } }

  const headers = ['ID', 'Name', 'Department', 'Region', 'Sales Q1', 'Sales Q2', 'Sales Q3', 'Sales Q4', 'Hire Date', 'Active']
  const dataRow = ws.getRow(4)
  headers.forEach((h, i) => { dataRow.getCell(i + 1).value = h })
  applyHeaderStyle(dataRow, accentHex)
  ws.columns = headers.map(h => ({ width: h.length < 8 ? 12 : 16 }))
  ws.getColumn(2).width = 18
  ws.getColumn(3).width = 16
  ws.getColumn(9).width = 14

  const sampleData = [
    [1, 'Alice Chen',     'Engineering', 'West',  42000, 38500, 51000, 47200, '2021-03-15', true],
    [2, 'Bob Martinez',   'Sales',       'East',  65000, 72000, 58000, 81000, '2019-08-22', true],
    [3, 'Carol White',    'Marketing',   'West',  31000, 33500, 35000, 29800, '2022-01-10', true],
    [4, 'David Kim',      'Engineering', 'North', 48000, 45000, 52000, 55000, '2020-06-01', true],
    [5, 'Eva Johnson',    'Sales',       'East',  71000, 68000, 75000, 82000, '2018-11-30', true],
    [6, 'Frank Brown',    'Marketing',   'South', 28000, 30000, 32000, 34000, '2023-04-20', true],
    [7, 'Grace Lee',      'Engineering', 'West',  55000, 58000, 53000, 61000, '2019-02-14', false],
    [8, 'Henry Wilson',   'Sales',       'North', 43000, 47000, 41000, 50000, '2021-09-05', true],
    [9, 'Iris Davis',     'Engineering', 'South', 39000, 42000, 44000, 46000, '2022-07-18', true],
    [10, 'Jack Taylor',   'Marketing',   'East',  25000, 28000, 27000, 31000, '2023-01-08', true],
  ]

  sampleData.forEach((row, i) => {
    const r = ws.addRow(row)
    // Format hire date column
    r.getCell(9).numFmt = 'yyyy-mm-dd'
    applyRowStyle(r, i % 2 === 0)
  })

  // ── FORMULA PRACTICE AREAS ──
  let y = 17

  // Section: Basic Aggregates
  ws.getCell(`A${y}`).value = 'PRACTICE: Aggregation Formulas'
  ws.getCell(`A${y}`).font = { bold: true, size: 12, color: { argb: accentHex } }
  y += 1

  const exercises = [
    { label: 'Total Sales (all quarters, all employees)', hint: 'Use SUM on E5:H14', formula: '=SUM(E5:H14)' },
    { label: 'Average Q1 Sales',                         hint: 'Use AVERAGE on E5:E14', formula: '=AVERAGE(E5:E14)' },
    { label: 'Max single-quarter sales',                  hint: 'Use MAX on E5:H14', formula: '=MAX(E5:H14)' },
    { label: 'Count of active employees',                 hint: 'Use COUNTIF on J5:J14', formula: '=COUNTIF(J5:J14,TRUE)' },
    { label: 'Sum of Sales Q1 for Engineering only',      hint: 'Use SUMIF', formula: '=SUMIF(C5:C14,"Engineering",E5:E14)' },
    { label: 'Average Q2 Sales for East region',          hint: 'Use AVERAGEIF', formula: '=AVERAGEIF(D5:D14,"East",F5:F14)' },
  ]

  // Headers
  const exHeaders = ['Exercise', 'Hint', 'Your Formula →', 'Answer']
  const exHeaderRow = ws.getRow(y)
  exHeaders.forEach((h, i) => { exHeaderRow.getCell(i + 1).value = h })
  applyHeaderStyle(exHeaderRow, THEME.green)
  y++

  exercises.forEach((ex, i) => {
    const row = ws.getRow(y + i)
    row.getCell(1).value = ex.label
    row.getCell(2).value = ex.hint
    row.getCell(3).value = '' // User fills this in
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2A3A' } }
    row.getCell(3).border = { bottom: { style: 'thin', color: { argb: THEME.accent } }, left: { style: 'thin', color: { argb: THEME.accent } }, right: { style: 'thin', color: { argb: THEME.accent } }, top: { style: 'thin', color: { argb: THEME.accent } } }
    row.getCell(3).font = { name: 'Consolas', size: 10, color: { argb: THEME.accent } }
    // Hidden answer
    row.getCell(4).value = { formula: ex.formula.replace(/^=/, '') }
    row.getCell(4).font = { color: { argb: THEME.textDim }, size: 9 }
    applyRowStyle(row, i % 2 === 0)
  })
  y += exercises.length + 2

  // Section: Lookup Formulas
  ws.getCell(`A${y}`).value = 'PRACTICE: Lookup Formulas'
  ws.getCell(`A${y}`).font = { bold: true, size: 12, color: { argb: accentHex } }
  y++

  const lookupExercises = [
    { label: 'Find Bob Martinez\'s Department', hint: 'VLOOKUP or XLOOKUP on name', formula: '=VLOOKUP("Bob Martinez",B5:C14,2,FALSE)' },
    { label: 'Find Q3 Sales for employee ID 7', hint: 'INDEX/MATCH on ID column', formula: '=INDEX(G5:G14,MATCH(7,A5:A14,0))' },
    { label: 'Find the name of the top Q4 seller', hint: 'INDEX/MATCH with MAX', formula: '=INDEX(B5:B14,MATCH(MAX(H5:H14),H5:H14,0))' },
  ]

  const lkHeaderRow = ws.getRow(y)
  exHeaders.forEach((h, i) => { lkHeaderRow.getCell(i + 1).value = h })
  applyHeaderStyle(lkHeaderRow, THEME.green)
  y++

  lookupExercises.forEach((ex, i) => {
    const row = ws.getRow(y + i)
    row.getCell(1).value = ex.label
    row.getCell(2).value = ex.hint
    row.getCell(3).value = ''
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2A3A' } }
    row.getCell(3).border = { bottom: { style: 'thin', color: { argb: THEME.accent } }, left: { style: 'thin', color: { argb: THEME.accent } }, right: { style: 'thin', color: { argb: THEME.accent } }, top: { style: 'thin', color: { argb: THEME.accent } } }
    row.getCell(3).font = { name: 'Consolas', size: 10, color: { argb: THEME.accent } }
    row.getCell(4).value = { formula: ex.formula.replace(/^=/, '') }
    row.getCell(4).font = { color: { argb: THEME.textDim }, size: 9 }
    applyRowStyle(row, i % 2 === 0)
  })
  y += lookupExercises.length + 2

  // Section: Conditional & Text
  ws.getCell(`A${y}`).value = 'PRACTICE: Conditional & Text Formulas'
  ws.getCell(`A${y}`).font = { bold: true, size: 12, color: { argb: accentHex } }
  y++

  const condExercises = [
    { label: 'Label Q4 Sales: >50000 = "High", else "Standard"', hint: 'Use IF on H5', formula: '=IF(H5>50000,"High","Standard")' },
    { label: 'Extract first name from "Alice Chen"',              hint: 'Use LEFT + FIND', formula: '=LEFT(B5,FIND(" ",B5)-1)' },
    { label: 'Concatenate Name + Department',                     hint: 'Use TEXTJOIN or &', formula: '=B5&" ("&C5&")"' },
    { label: 'Count employees hired in 2021',                     hint: 'Use COUNTIFS with dates', formula: '=COUNTIFS(I5:I14,">="&DATE(2021,1,1),I5:I14,"<"&DATE(2022,1,1))' },
  ]

  const cdHeaderRow = ws.getRow(y)
  exHeaders.forEach((h, i) => { cdHeaderRow.getCell(i + 1).value = h })
  applyHeaderStyle(cdHeaderRow, THEME.green)
  y++

  condExercises.forEach((ex, i) => {
    const row = ws.getRow(y + i)
    row.getCell(1).value = ex.label
    row.getCell(2).value = ex.hint
    row.getCell(3).value = ''
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2A3A' } }
    row.getCell(3).border = { bottom: { style: 'thin', color: { argb: THEME.accent } }, left: { style: 'thin', color: { argb: THEME.accent } }, right: { style: 'thin', color: { argb: THEME.accent } }, top: { style: 'thin', color: { argb: THEME.accent } } }
    row.getCell(3).font = { name: 'Consolas', size: 10, color: { argb: THEME.accent } }
    row.getCell(4).value = { formula: ex.formula.replace(/^=/, '') }
    row.getCell(4).font = { color: { argb: THEME.textDim }, size: 9 }
    applyRowStyle(row, i % 2 === 0)
  })

  return ws
}

/* ── main export ───────────────────────────────────────────────── */

export async function generateExcelWorkbookBlob(sheetData, domain, sheetId, domainLabel, sheetLabel) {
  // Lazy load ExcelJS
  let ExcelJS
  try {
    ExcelJS = await import('exceljs')
  } catch {
    await loadScript(CDN.exceljs)
    ExcelJS = window.ExcelJS
  }

  const accentHex = DOMAIN_ACCENT[domain] || THEME.accent
  const wb = new ExcelJS.Workbook()

  wb.creator = 'CodeSheets'
  wb.created = new Date()
  wb.modified = new Date()
  wb.properties = {
    title: `${domainLabel} — ${sheetLabel}`,
    subject: `CodeSheets reference for ${domainLabel}`,
    company: 'CodeSheets',
  }

  // Sheet 1: Reference
  buildReferenceSheet(wb, sheetData, domain, accentHex)

  // Sheet 2: Practice
  buildPracticeSheet(wb, sheetData, domain, accentHex)

  // Generate blob
  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

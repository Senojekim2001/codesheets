export const meta = {
  "id": "excel-advanced",
  "label": "Advanced Excel",
  "icon": "📊",
  "description": "Advanced Excel: Power Query, VBA macros, dynamic charts, data validation, and pivot table patterns."
}

export const sections = [

  // ── Section 1: Power Query (M Language) ─────────────────────────────────────────
  {
    id: "power-query",
    title: "Power Query (M Language)",
    entries: [
      {
        id: "power-query-basics",
        fn: "Power Query — Import & Transform Data",
        desc: "Import data from files, databases, and APIs, then clean and transform with a repeatable pipeline.",
        category: "Power Query",
        subtitle: "Get & Transform, M language, applied steps",
        signature: "Data → Get Data → Transform Data  |  = Table.SelectRows(source, condition)",
        descLong: "Power Query (Get & Transform) is Excel's ETL tool. It imports data from CSVs, databases, APIs, folders, and web pages, then applies transformations as recorded steps. Steps are written in M language and can be edited manually. The query refreshes on demand — change the source data and click Refresh. Power Query handles millions of rows efficiently by folding operations to the source when possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Import & Transform Data — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Power Query M Language Examples ─────────────────"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Import & Transform Data — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Import & Transform Data with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Import CSV and clean\nlet\n    Source = Csv.Document(File.Contents(\"C:\\data\\sales.csv\"),\n        [Delimiter=\",\", Encoding=65001, QuoteStyle=QuoteStyle.None]),\n    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),\n    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders,\n        {{\"Date\", type date}, {\"Amount\", type number}, {\"Region\", type text}}),\n    FilteredRows = Table.SelectRows(ChangedTypes,\n        each [Amount] > 0 and [Date] >= #date(2024, 1, 1)),\n    AddedColumn = Table.AddColumn(FilteredRows, \"Quarter\",\n        each \"Q\" & Text.From(Date.QuarterOfYear([Date]))),\n    GroupedRows = Table.Group(AddedColumn, {\"Region\", \"Quarter\"},\n        {{\"Total\", each List.Sum([Amount]), type number},\n         {\"Count\", each Table.RowCount(_), Int64.Type}})\nin\n    GroupedRows"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Import & Transform Data — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Import from folder (combine multiple CSVs),let,    Source = Folder.Files(\"C:\\data\\monthly_reports\"),,    FilteredCSV = Table.SelectRows(Source, each [Extension] = \".csv\"),,    AddContent = Table.AddColumn(FilteredCSV, \"Data\",,        each Csv.Document([Content], [Delimiter=\",\"])),,    Expanded = Table.ExpandTableColumn(AddContent, \"Data\",,        {\"Date\", \"Sales\", \"Region\"}),,    Cleaned = Table.SelectColumns(Expanded, {\"Date\", \"Sales\", \"Region\"}),in,    Cleaned,\n\n// Unpivot columns (wide → long),let,    Source = Excel.CurrentWorkbook(){[Name=\"SalesTable\"]}[Content],,    Unpivoted = Table.UnpivotOtherColumns(Source,,        {\"Product\"}, \"Month\", \"Revenue\"),in,    Unpivoted,\n\n// Merge queries (VLOOKUP alternative),let,    Sales = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    Products = Excel.CurrentWorkbook(){[Name=\"Products\"]}[Content],,    Merged = Table.NestedJoin(Sales, {\"ProductID\"},,        Products, {\"ID\"}, \"ProductInfo\", JoinKind.LeftOuter),,    Expanded = Table.ExpandTableColumn(Merged, \"ProductInfo\",,        {\"Name\", \"Category\"}),in,    Expanded"
                  }
        ],
        tips: [
                  "Power Query replaces manual VLOOKUP/INDEX-MATCH chains — it's repeatable, auditable, and handles millions of rows.",
                  "Use \"Combine Files from Folder\" to automatically merge monthly CSVs or Excel files into one table.",
                  "Table.UnpivotOtherColumns is the Power Query equivalent of pivot_longer — essential for tidy data.",
                  "Right-click any step → \"View Native Query\" to see if the query folds to SQL — much faster when it does."
        ],
        mistake: "Loading huge datasets to the worksheet — Power Query can hold millions of rows but Excel sheets max at 1M. Use \"Load To → Connection Only\" and use pivot tables or Power Pivot for analysis.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData → Get Data → ... → Close & Load\n// Result: entire table in worksheet\n// More explicit but longer",
          concise: "Close & Load To → Connection Only; use pivot tables for analysis; avoid >1M rows in cells",
        },
      },
      {
        id: "power-query-advanced",
        fn: "Power Query — Advanced Transformations",
        desc: "Custom functions, conditional columns, error handling, and parameterized queries in M language.",
        category: "Power Query",
        subtitle: "Custom functions, try/otherwise, List.Generate, Table.Pivot",
        signature: "(param) => expression  |  try expr otherwise default",
        descLong: "M language supports custom functions for reusable transformations, try/otherwise for error handling, List.Generate for loops, and Table.Pivot/Unpivot for reshaping. Parameters make queries dynamic (e.g., date range from a cell). Custom functions can be invoked per row with Table.AddColumn. These patterns handle complex ETL scenarios that the UI can't express.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Advanced Transformations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Custom function — reusable transformation\nlet\n    CleanText = (input as text) as text =>\n        let\n            trimmed = Text.Trim(input),\n            lower = Text.Lower(trimmed),\n            cleaned = Text.Replace(lower, \"  \", \" \")\n        in\n            cleaned\nin\n    CleanText"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Advanced Transformations — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Advanced Transformations with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Apply function to each row\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"RawData\"]}[Content],\n    Cleaned = Table.TransformColumns(Source,\n        {{\"Name\", CleanText}, {\"Email\", Text.Lower}})\nin\n    Cleaned"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Advanced Transformations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Conditional column,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    AddTier = Table.AddColumn(Source, \"Tier\", each,        if [Revenue] >= 100000 then \"Enterprise\",        else if [Revenue] >= 10000 then \"Business\",        else \"Starter\", type text),in,    AddTier,\n\n// Error handling — try/otherwise,let,    Source = Excel.CurrentWorkbook(){[Name=\"Data\"]}[Content],,    SafeParse = Table.AddColumn(Source, \"ParsedDate\", each,        try Date.FromText([DateString]) otherwise null, type date),,    SafeDivide = Table.AddColumn(Source, \"Ratio\", each,        try [Revenue] / [Costs] otherwise 0, type number),in,    SafeDivide,\n\n// Parameterized query (date from cell),let,    StartDate = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content]{0}[StartDate],,    EndDate = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content]{0}[EndDate],,    Source = Sql.Database(\"server\", \"db\",,        [Query=\"SELECT * FROM sales WHERE date BETWEEN '\",            & Date.ToText(StartDate, \"yyyy-MM-dd\") & \"' AND '\",            & Date.ToText(EndDate, \"yyyy-MM-dd\") & \"'\"]),in,    Source,\n\n// List.Generate — create sequences,let,    Dates = List.Generate(,        () => #date(2024, 1, 1),,        each _ <= #date(2024, 12, 31),,        each Date.AddDays(_, 1),    ),,    DateTable = Table.FromList(Dates, Splitter.SplitByNothing(),,        {\"Date\"}, null, ExtraValues.Error),,    Typed = Table.TransformColumnTypes(DateTable, {{\"Date\", type date}}),in,    Typed"
                  }
        ],
        tips: [
                  "Custom M functions make transformations reusable — define once, apply to any column or query.",
                  "try/otherwise prevents one bad row from breaking the entire query — use liberally for data imports.",
                  "List.Generate creates sequences without a source table — perfect for calendar/date dimension tables.",
                  "Parameterize queries with named ranges — users change dates in a cell, query refreshes automatically."
        ],
        mistake: "Writing complex M code when the UI handles it — use the ribbon for common transforms (Remove Columns, Change Type, Split Column) and only hand-edit M for advanced logic.",
        shorthand: {
          verbose: "// Manual / verbose approach\n= Table.RemoveColumns(source, {\"col1\", \"col2\"})\n= Table.TransformColumnTypes(...)\n// More explicit but longer",
          concise: "UI ribbon for common transforms; hand-edit M only for advanced: try/otherwise, custom functions, List.Generate",
        },
      },
    ],
  },

  // ── Section 2: VBA Macros ─────────────────────────────────────────
  {
    id: "vba-macros",
    title: "VBA Macros",
    entries: [
      {
        id: "vba-essentials",
        fn: "VBA Essentials — Subs, Functions & Objects",
        desc: "Automate Excel with Visual Basic — macros, custom functions, and the Excel object model.",
        category: "VBA",
        subtitle: "Sub, Function, Range, Cells, Worksheets, Workbooks",
        signature: "Sub MacroName()  |  Function UDF(arg As Type) As Type  |  Range(\"A1\").Value",
        descLong: "VBA (Visual Basic for Applications) automates any Excel operation. Subs are macros that perform actions. Functions return values and can be used as worksheet formulas (UDFs). The object model: Application → Workbook → Worksheet → Range. Use With blocks for cleaner code. Record Macro to learn object names, then clean up the generated code. Always use Option Explicit to catch typos.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA Essentials — Subs, Functions & Objects — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Always start with this ──────────────────────────\nOption Explicit  ' Force variable declaration (catches typos)\n\n' ── Sub (macro) — performs actions ──────────────────\nSub FormatReport()\n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets(\"Report\")\n\n    ' Clear and format header row\n    With ws.Range(\"A1:F1\")\n        .Value = Array(\"Date\", \"Region\", \"Product\", \"Units\", \"Revenue\", \"Margin\")\n        .Font.Bold = True\n        .Interior.Color = RGB(0, 70, 130)\n        .Font.Color = RGB(255, 255, 255)\n        .Columns.AutoFit\n    End With\n\n    ' Find last row with data\n    Dim lastRow As Long\n    lastRow = ws.Cells(ws.Rows.Count, \"A\").End(xlUp).Row\n\n    ' Apply number formatting\n    ws.Range(\"E2:E\" & lastRow).NumberFormat = \"$#,##0.00\"\n    ws.Range(\"F2:F\" & lastRow).NumberFormat = \"0.0%\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA Essentials — Subs, Functions & Objects — common patterns you'll see in production.\n' APPROACH  - Combine VBA Essentials — Subs, Functions & Objects with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' Conditional formatting via VBA\n    Dim rng As Range\n    Set rng = ws.Range(\"F2:F\" & lastRow)\n    rng.FormatConditions.Delete\n    rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlLess, Formula1:=\"0.1\"\n    rng.FormatConditions(1).Interior.Color = RGB(255, 200, 200)\n\n    MsgBox \"Report formatted! \" & (lastRow - 1) & \" rows.\", vbInformation\nEnd Sub\n\n' ── Function (UDF) — returns a value ────────────────\nFunction WeightedAvg(values As Range, weights As Range) As Double\n    Dim i As Long\n    Dim sumProduct As Double, sumWeights As Double\n\n    For i = 1 To values.Cells.Count\n        sumProduct = sumProduct + values.Cells(i).Value * weights.Cells(i).Value\n        sumWeights = sumWeights + weights.Cells(i).Value\n    Next i\n\n    If sumWeights = 0 Then\n        WeightedAvg = 0\n    Else\n        WeightedAvg = sumProduct / sumWeights\n    End If\nEnd Function\n' Use in cell: =WeightedAvg(B2:B10, C2:C10)"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA Essentials — Subs, Functions & Objects — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Loop through worksheets ─────────────────────────\nSub SummarizeAllSheets()\n    Dim ws As Worksheet\n    Dim summary As Worksheet\n    Set summary = ThisWorkbook.Sheets(\"Summary\")\n    Dim row As Long: row = 2\n\n    For Each ws In ThisWorkbook.Worksheets\n        If ws.Name <> \"Summary\" Then\n            summary.Cells(row, 1).Value = ws.Name\n            summary.Cells(row, 2).Value = Application.WorksheetFunction.Sum(ws.Range(\"E:E\"))\n            row = row + 1\n        End If\n    Next ws\nEnd Sub"
                  }
        ],
        tips: [
                  "Option Explicit is essential — without it, Dim revenuee = revenue creates a new zero variable silently.",
                  "Use With blocks to avoid repeating object references — cleaner code and slightly faster execution.",
                  "Cells(row, col) is better than Range(\"A1\") in loops — you can use variables for row and column.",
                  "Turn off screen updating for speed: Application.ScreenUpdating = False (set True when done)."
        ],
        mistake: "Selecting and activating cells in VBA (Range(\"A1\").Select, Selection.Value = ...) — this is slow and fragile. Directly set Range(\"A1\").Value = ... without selecting. Recorded macros always do this wrong.",
        shorthand: {
          verbose: "Range(\"A1\").Select\nSelection.Value = data\n' Slow!",
          concise: "Range(\"A1\").Value = data; Cells(row, col) in loops; With blocks to avoid repetition",
        },
      },
      {
        id: "vba-patterns",
        fn: "VBA Patterns — Error Handling & Performance",
        desc: "Robust error handling, performance optimization, and common automation patterns.",
        category: "VBA",
        subtitle: "On Error, ScreenUpdating, arrays, UserForms",
        signature: "On Error GoTo ErrHandler  |  Application.ScreenUpdating = False",
        descLong: "Production VBA needs error handling (On Error GoTo), performance optimization (disable ScreenUpdating, Calculation, Events), and efficient data access (read ranges into arrays). Common patterns: process all files in a folder, generate PDF reports, send emails via Outlook, and build UserForms for data entry. These patterns transform VBA from \"record and play\" to reliable automation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA Patterns — Error Handling & Performance — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Performance optimization pattern ─────────────────\nSub FastProcess()\n    ' Turn off visual updates and recalculation\n    Application.ScreenUpdating = False\n    Application.Calculation = xlCalculationManual\n    Application.EnableEvents = False\n\n    On Error GoTo ErrHandler\n\n    ' === Your code here ===\n\n    ' Read range into array (MUCH faster than cell-by-cell)\n    Dim data As Variant\n    data = Range(\"A1:F10000\").Value  ' 2D array, 1-based\n\n    Dim i As Long\n    For i = 1 To UBound(data, 1)\n        ' Process in memory (fast)\n        If data(i, 3) > 100 Then\n            data(i, 6) = data(i, 3) * data(i, 4)  ' calculate in array\n        End If\n    Next i\n\n    ' Write array back to sheet in one operation\n    Range(\"A1:F10000\").Value = data"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA Patterns — Error Handling & Performance — common patterns you'll see in production.\n' APPROACH  - Combine VBA Patterns — Error Handling & Performance with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nCleanup:\n    Application.ScreenUpdating = True\n    Application.Calculation = xlCalculationAutomatic\n    Application.EnableEvents = True\n    Exit Sub\n\nErrHandler:\n    MsgBox \"Error \" & Err.Number & \": \" & Err.Description, vbCritical\n    Resume Cleanup\nEnd Sub\n\n' ── Process all files in a folder ───────────────────\nSub ProcessFolder()\n    Dim folderPath As String\n    folderPath = \"C:\\Reports\\Monthly\\\"\n\n    Dim fileName As String\n    fileName = Dir(folderPath & \"*.xlsx\")\n\n    Do While fileName <> \"\"\n        Dim wb As Workbook\n        Set wb = Workbooks.Open(folderPath & fileName, ReadOnly:=True)\n\n        ' Extract data from each file\n        Dim total As Double\n        total = Application.WorksheetFunction.Sum(wb.Sheets(1).Range(\"D:D\"))\n        ThisWorkbook.Sheets(\"Summary\").Cells(Rows.Count, 1).End(xlUp).Offset(1, 0).Value = fileName\n        ThisWorkbook.Sheets(\"Summary\").Cells(Rows.Count, 1).End(xlUp).Offset(0, 1).Value = total"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA Patterns — Error Handling & Performance — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nwb.Close SaveChanges:=False\n        fileName = Dir()  ' next file\n    Loop\nEnd Sub\n\n' ── Export each sheet as PDF ────────────────────────\nSub ExportPDFs()\n    Dim ws As Worksheet\n    For Each ws In ThisWorkbook.Worksheets\n        If ws.Name <> \"Summary\" Then\n            ws.ExportAsFixedFormat _\n                Type:=xlTypePDF, _\n                Filename:=\"C:\\Output\\\" & ws.Name & \".pdf\", _\n                Quality:=xlQualityStandard\n        End If\n    Next ws\n    MsgBox \"All PDFs exported!\", vbInformation\nEnd Sub"
                  }
        ],
        tips: [
                  "Always read ranges into arrays for loops — cell-by-cell access is 100-1000x slower than array operations.",
                  "The Cleanup pattern (On Error GoTo ErrHandler → Resume Cleanup) ensures settings are always restored.",
                  "Dir() loops are the standard pattern for processing all files — first call returns first match, subsequent calls return next.",
                  "ExportAsFixedFormat creates PDFs without any PDF software — built into Excel."
        ],
        mistake: "Not disabling ScreenUpdating for bulk operations — the screen redraws on every cell change, making a 1-second operation take 60+ seconds. Always disable it in loops.",
        shorthand: {
          verbose: "For i = 1 To 10000\n  Cells(i, 1).Value = data(i)\nNext\n' Takes 60+ seconds",
          concise: "Application.ScreenUpdating = False; Application.Calculation = xlCalculationManual; restore after loop",
        },
      },
    ],
  },

  // ── Section 3: Charts & Data Validation ─────────────────────────────────────────
  {
    id: "charts-validation",
    title: "Charts & Data Validation",
    entries: [
      {
        id: "dynamic-charts",
        fn: "Dynamic Charts with Named Ranges & Tables",
        desc: "Create charts that automatically resize and update when data changes — using Tables, OFFSET, or spill ranges.",
        category: "Charts",
        subtitle: "Excel Tables, dynamic named ranges, OFFSET, sparklines",
        signature: "OFFSET(start, 0, 0, COUNTA(col), 1)  |  Table1[Column]  |  SEQUENCE()",
        descLong: "Dynamic charts automatically include new data without manual range adjustments. Three approaches: (1) Excel Tables (Ctrl+T) — charts on Tables auto-expand. (2) OFFSET named ranges — dynamic formulas that grow. (3) Spill ranges (dynamic arrays) — modern approach with SORT, FILTER, UNIQUE. Combo charts mix chart types (bar + line). Sparklines provide in-cell mini-charts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Charts with Named Ranges & Tables — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n=== Dynamic Chart Methods ===\n\nMETHOD 1: Excel Table (simplest, recommended)\n1. Select data → Ctrl+T → Create Table\n2. Insert chart using the Table\n3. New rows added to the Table automatically appear in the chart\n\nMETHOD 2: OFFSET Named Range (legacy but powerful)\nDefine named range \"SalesData\":\n  =OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A), 1)\nDefine \"SalesValues\":\n  =OFFSET(Sheet1!$B$1, 0, 0, COUNTA(Sheet1!$A:$A), 1)\nChart source: =Sheet1!SalesData, =Sheet1!SalesValues\n\nMETHOD 3: Dynamic Arrays (modern)\n  =SORT(FILTER(Table1, Table1[Year]=2024), 2, -1)\n  Chart this spill range — updates automatically\n\n=== Useful Chart Formulas ==="
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Charts with Named Ranges & Tables — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Charts with Named Ranges & Tables with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Dynamic chart title from cell\n  Click chart title → type =Sheet1!$A$1 in formula bar"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Charts with Named Ranges & Tables — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Conditional series color (in VBA),  For Each pt In ActiveChart.SeriesCollection(1).Points,      If pt.DataLabel.Text > targetValue Then,          pt.Interior.Color = RGB(0, 176, 80)   ' green,      Else,          pt.Interior.Color = RGB(255, 0, 0)     ' red,      End If,  Next pt,\n\n-- Sparklines (in-cell mini charts),  Select cell → Insert → Sparklines → Line/Column/Win-Loss,  Data Range: A1:L1 (12 months of data),  Sparkline shows trend in a single cell,\n\n-- Combo chart (bar + line on same chart),  1. Select data with two series,  2. Insert → Combo Chart,  3. Set Revenue as Clustered Column,  4. Set Growth% as Line on Secondary Axis,,=== Dashboard Layout Tips ===,  - Use slicers connected to pivot charts for interactivity,  - INDIRECT() + data validation dropdown for dynamic chart source,  - Camera tool (Add to QAT) for live-linked chart snapshots"
                  }
        ],
        tips: [
                  "Excel Tables (Ctrl+T) are the easiest way to make charts dynamic — always convert data to Tables first.",
                  "Link chart titles to cells (=Sheet1!A1) — update the cell and the chart title changes automatically.",
                  "Combo charts (bar + line) on two axes are the best way to show metrics with different scales together.",
                  "Sparklines in cells next to data provide at-a-glance trends without taking space for full charts."
        ],
        mistake: "Charting raw data ranges (A1:B50) instead of Tables — when you add row 51, the chart doesn't update. Tables auto-expand, and chart references update automatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nInsert Chart on A1:B50\nAdd row 51 → chart doesn't expand\n// More explicit but longer",
          concise: "Ctrl+T to convert to Table; chart auto-expands; link titles: =Sheet1!A1; combo for dual-axis metrics",
        },
      },
      {
        id: "data-validation-forms",
        fn: "Data Validation & Form Controls",
        desc: "Restrict cell inputs with dropdowns, date ranges, custom formulas, and interactive form controls.",
        category: "Data Entry",
        subtitle: "Dropdown lists, custom validation, dependent dropdowns, form controls",
        signature: "Data → Data Validation → List/Custom  |  =INDIRECT(A1)",
        descLong: "Data Validation restricts what users can enter in cells. List validation creates dropdown menus. Custom validation uses any formula that returns TRUE/FALSE. Dependent (cascading) dropdowns use INDIRECT() to change options based on a prior selection. Form controls (buttons, checkboxes, sliders) add interactivity without VBA. Named ranges make validation rules maintainable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Data Validation & Form Controls — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n=== Data Validation Types ===\n\nDROPDOWN LIST (most common):\n  Data → Validation → List\n  Source: =\"High,Medium,Low\"         (inline)\n  Source: =$F$1:$F$10                (range)\n  Source: =OFFSET(Lists!$A$1,0,0,COUNTA(Lists!$A:$A),1)  (dynamic)\n\nDEPENDENT DROPDOWN (cascading):\n  Cell A1: Country dropdown (US, UK, DE)\n  Cell B1: City dropdown that changes based on A1\n  1. Name ranges: \"US\" = US cities, \"UK\" = UK cities, \"DE\" = DE cities\n  2. B1 validation → List → Source: =INDIRECT(A1)\n  When A1 = \"US\", B1 shows US cities\n\nCUSTOM VALIDATION FORMULAS:\n  -- No duplicates allowed:\n     =COUNTIF($A:$A, A1) <= 1"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Data Validation & Form Controls — common patterns you'll see in production.\n// APPROACH  - Combine Data Validation & Form Controls with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Must be a business email:\n     =AND(ISNUMBER(FIND(\"@\", A1)), NOT(ISNUMBER(FIND(\"gmail\", A1))))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Data Validation & Form Controls — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Date must be a weekday:,     =WEEKDAY(A1, 2) <= 5,\n\n  -- Value must be a multiple of 5:,     =MOD(A1, 5) = 0,\n\n  -- Text must be exactly 10 characters:,     =LEN(A1) = 10,,INPUT MESSAGE & ERROR ALERT:,  Data Validation → Input Message tab:,    Title: \"Enter Revenue\",    Message: \"Enter the quarterly revenue in USD (no symbols)\",  Error Alert tab:,    Style: Stop/Warning/Information,    Title: \"Invalid Entry\",    Message: \"Revenue must be a positive number\",,FORM CONTROLS (no VBA needed):,  Developer → Insert → Form Controls,  - Checkbox: linked to cell (TRUE/FALSE),  - Scroll Bar: linked to cell (number),  - Combo Box: linked to cell (selection index),  - Button: assign a macro,,=== Protect the Sheet ===,  Review → Protect Sheet,  Allow users to: Select unlocked cells only,  Lock formula cells, unlock input cells,  Password-protect to prevent accidental changes"
                  }
        ],
        tips: [
                  "INDIRECT() in validation sources enables cascading dropdowns — cell A1 picks the named range for B1's options.",
                  "Custom validation with COUNTIF($A:$A, A1)<=1 prevents duplicate entries — simple and effective.",
                  "Input Messages appear when cells are selected — use them as inline help text for data entry forms.",
                  "Lock formula cells and protect the sheet — users can only type in unlocked (input) cells."
        ],
        mistake: "Using Data Validation without an error message — users get a generic \"this value doesn't match\" error. Custom error messages explain what's expected: \"Enter a date between Jan-Dec 2024\".",
        shorthand: {
          verbose: "// Manual / verbose approach\nData → Validation → List/Custom\n(no error message configured)\n// More explicit but longer",
          concise: "Error Alert tab: custom Title + Message; Dependent: =INDIRECT(A1) for cascading lists; Lock formulas + Protect Sheet",
        },
      },
      {
        id: "array-formulas-modern",
        fn: "Modern Array Formulas — SEQUENCE, UNIQUE, SORT, FILTER",
        desc: "Use dynamic array formulas to generate, filter, and sort data without helper columns.",
        category: "Array Formulas",
        subtitle: "SEQUENCE, UNIQUE, SORT, SORTBY, FILTER, spill ranges, # operator",
        signature: "=SEQUENCE(10, 3)  |  =UNIQUE(range)  |  =SORT(range, 2, -1)  |  =FILTER(range, criteria)",
        descLong: "SEQUENCE generates numbers, arrays. UNIQUE removes duplicates. SORT sorts by column ascending/descending. SORTBY sorts by another column. FILTER returns rows matching criteria (replaces complex IFS formulas). All spill into multiple cells automatically. Modern Excel (365, 2021+) only.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modern Array Formulas — SEQUENCE, UNIQUE, SORT, FILTER — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── SEQUENCE generates numbers/arrays ──────────────\n=SEQUENCE(10)           ' 1 to 10 (vertical)\n=SEQUENCE(10, 1)        ' same, explicit\n=SEQUENCE(5, 3)         ' 5 rows × 3 columns, 1-15\n=SEQUENCE(5, 3, 100)    ' start at 100\n=SEQUENCE(5, 3, 100, 2) ' start at 100, step by 2\n\n' Create range labels:\n={\"Jan\",\"Feb\",\"Mar\",\"Apr\"}  ' inline array\n\n' ── UNIQUE removes duplicates ──────────────────────\n=UNIQUE(A1:A100)                ' unique values (first occurrence)\n=UNIQUE(A1:A100, FALSE, FALSE)  ' unique rows\n=UNIQUE(A1:B100, TRUE, FALSE)   ' unique values per column\n\n' ── SORT sorts a range ───────────────────────────\n=SORT(A1:C100)              ' sort by first column ascending\n=SORT(A1:C100, 2)           ' sort by column 2 (B)\n=SORT(A1:C100, 2, -1)       ' sort by column 2 descending\n=SORT(A1:C100, 3, -1, FALSE) ' sort by column 3, stable sort"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modern Array Formulas — SEQUENCE, UNIQUE, SORT, FILTER — common patterns you'll see in production.\n// APPROACH  - Combine Modern Array Formulas — SEQUENCE, UNIQUE, SORT, FILTER with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── SORTBY sorts by another column ─────────────────\n=SORTBY(A1:C100, B1:B100)      ' sort A:C by values in B\n=SORTBY(A1:C100, B1:B100, -1)  ' descending\n\n' ── FILTER keeps rows matching criteria ──────────\n=FILTER(A1:C100, B1:B100 > 1000)\n    ' Keep rows where column B > 1000\n\n=FILTER(A1:C100, (B1:B100 > 1000) * (C1:C100 = \"West\"))\n    ' Multiple conditions: AND (use *)\n\n=FILTER(A1:C100, (B1:B100 > 1000) + (C1:C100 = \"East\"))\n    ' Multiple conditions: OR (use +)\n\n=FILTER(A1:C100, (D1:D100 <> \"\"))\n    ' Keep non-blank rows"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modern Array Formulas — SEQUENCE, UNIQUE, SORT, FILTER — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Combine filters: FILTER + SORT + UNIQUE ───────\n=SORT(UNIQUE(FILTER(A:C, B:B > 1000)), 2, -1)\n    ' Unique high-value rows, sorted by amount descending\n\n' ── FILTER with header (use CHOOSECOLS to remove header) ─\n=FILTER(\n    CHOOSECOLS(A1:C100, 1, 2, 3),  ' keep columns A, B, C\n    B2:B100 > 1000\n)"
                  }
        ],
        tips: [
                  "SEQUENCE is perfect for generating test data, numbered lists, or array indices.",
                  "UNIQUE shows first occurrence by default — use for deduplication.",
                  "SORT is ascending (1), SORTBY adds complex sorting logic.",
                  "FILTER replaces complex nested IFs — much more readable.",
                  "Combine FILTER + SORT + UNIQUE for powerful data transformations in one formula."
        ],
        mistake: "Not using FILTER when you need conditional data — creates helper columns or complex IFs. FILTER simplifies this dramatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nComplex IF-THEN-ELSE nested formulas; helper columns for sorting/filtering\n// More explicit but longer",
          concise: "FILTER(range, criteria) for conditions; SORT(range, col, -1) for descending; UNIQUE for dedup; SEQUENCE for arrays",
        },
      },
      {
        id: "lambda-functions",
        fn: "LAMBDA & Helper Functions — Reusable Custom Logic",
        desc: "Define custom functions with LAMBDA; combine with MAP, REDUCE, SCAN for powerful operations.",
        category: "Advanced Functions",
        subtitle: "LAMBDA, MAP, REDUCE, SCAN, MAKEARRAY, function composition",
        signature: "=LAMBDA(x, x * 2)  |  =MAP(array, LAMBDA(x, x * 2))  |  =REDUCE(initial, array, LAMBDA(acc, x, ...))",
        descLong: "LAMBDA defines anonymous functions. MAP applies a function to each element. REDUCE accumulates values (like a fold). SCAN is like REDUCE but returns intermediate results. MAKEARRAY creates arrays via a formula. These enable functional programming patterns in Excel.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LAMBDA & Helper Functions — Reusable Custom Logic — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── LAMBDA: simple doubling function ────────────────\n=LAMBDA(x, x * 2)(5)       ' returns 10\n=LAMBDA(x, x * 2)(A1:A10)  ' doubles each cell\n\n' ── Store LAMBDA in named range for reuse ──────────\n' Name Manager: \"DoubleIt\" = LAMBDA(x, x * 2)\n' Use: =DoubleIt(A1:A10)\n\n' ── MAP applies function to each row ────────────────\n=MAP(A1:A10, LAMBDA(x, x * 2))\n    ' Double each value\n\n=MAP(A1:C10, LAMBDA(x, IF(x > 100, x * 0.9, x)))\n    ' Apply discount (10% off) if > 100\n\n' ── REDUCE accumulates values ───────────────────────\n=REDUCE(0, A1:A10, LAMBDA(acc, x, acc + x))\n    ' Sum: accumulate starting at 0, add each value"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LAMBDA & Helper Functions — Reusable Custom Logic — common patterns you'll see in production.\n// APPROACH  - Combine LAMBDA & Helper Functions — Reusable Custom Logic with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n=REDUCE(1, A1:A10, LAMBDA(acc, x, acc * x))\n    ' Product: starting at 1, multiply each\n\n' ── SCAN shows intermediate results ─────────────────\n=SCAN(0, A1:A10, LAMBDA(acc, x, acc + x))\n    ' Running total: shows cumulative sum for each row\n\n' ── MAKEARRAY builds arrays via formula ────────────\n=MAKEARRAY(5, 5, LAMBDA(row, col, row * col))\n    ' 5×5 multiplication table\n\n=MAKEARRAY(10, 1, LAMBDA(row, col, SEQUENCE(10)))\n    ' Column of 1-10\n\n' ── Complex example: REDUCE + MAP ──────────────────\n=REDUCE(0, MAP(A1:A100, LAMBDA(x, IF(x > 1000, x, 0))), LAMBDA(acc, x, acc + x))\n    ' Sum of values > 1000 (Map filters, Reduce sums)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LAMBDA & Helper Functions — Reusable Custom Logic — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Custom weighted average with LAMBDA ────────────\n' Named range: \"WeightedAvg\" = LAMBDA(values, weights, SUMPRODUCT(values, weights) / SUM(weights))\n' Use: =WeightedAvg(A1:A10, B1:B10)\n\n' ── Factorial with REDUCE ───────────────────────────\n' Named range: \"Factorial\" = LAMBDA(n, REDUCE(1, SEQUENCE(n), LAMBDA(acc, x, acc * x)))\n' Use: =Factorial(5)  ' returns 120"
                  }
        ],
        tips: [
                  "LAMBDA is powerful but modern Excel only (365). Combine with MAP/REDUCE for functional programming.",
                  "Store LAMBDA functions in named ranges — makes them reusable across sheets.",
                  "MAP applies function element-by-element; REDUCE accumulates into a single value.",
                  "SCAN like REDUCE but shows intermediate results — useful for running totals, cumulative calculations."
        ],
        mistake: "Not combining LAMBDA with MAP/REDUCE — using nested IFs for complex logic. LAMBDA + MAP is cleaner and more maintainable.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=IF(A1>100, A1*0.9, A1)+IF(A2>100, A2*0.9, A2)+...\n// More explicit but longer",
          concise: "=MAP(A:A, LAMBDA(x, IF(x>100, x*0.9, x)))",
        },
      },
      {
        id: "let-function",
        fn: "LET Function — Naming Intermediate Values",
        desc: "Use LET to name intermediate calculations — cleaner, faster formulas.",
        category: "Advanced Functions",
        subtitle: "LET, named calculations, breaking complex formulas",
        signature: "=LET(name, value, ..., expression)",
        descLong: "LET assigns names to intermediate values, making formulas readable and avoiding recalculation. Each value is computed once. LET is available in modern Excel (Office 365, Excel 2021+).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LET Function — Naming Intermediate Values — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Simple LET example ──────────────────────────────\n=LET(\n    price, A1,\n    qty, B1,\n    total, price * qty,\n    total\n)\n    ' Returns price × qty without repeating the calculation\n\n' ── LET with conditions ────────────────────────────\n=LET(\n    revenue, SUM(C:C),\n    costs, SUM(D:D),\n    profit, revenue - costs,\n    percent, IF(revenue = 0, 0, profit / revenue),\n    ROUND(percent, 2)\n)\n    ' Calculate profit margin, safely handle zero division"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LET Function — Naming Intermediate Values — common patterns you'll see in production.\n// APPROACH  - Combine LET Function — Naming Intermediate Values with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Complex multi-step formula using LET ──────────\n=LET(\n    data, A1:C100,\n    filtered, FILTER(data, B2:B100 > 1000),\n    sorted, SORT(filtered, 2, -1),\n    count, ROWS(sorted),\n    IF(count = 0, \"No matches\", sorted)\n)\n    ' Filter, sort, count in one readable formula\n\n' ── LET with array operations ──────────────────────\n=LET(\n    values, A1:A100,\n    average, AVERAGE(values),\n    stdev, STDEV(values),\n    lower, average - 2 * stdev,\n    upper, average + 2 * stdev,\n    FILTER(values, (values >= lower) * (values <= upper))\n)\n    ' Find values within 2 standard deviations (outlier removal)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LET Function — Naming Intermediate Values — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Reusing names multiple times ────────────────────\n=LET(\n    rate, 0.1,\n    base, 100,\n    year1, base * (1 + rate),\n    year2, year1 * (1 + rate),\n    year3, year2 * (1 + rate),\n    {base, year1, year2, year3}\n)\n    ' Compound growth calculation, reusing rate each year"
                  }
        ],
        tips: [
                  "LET names intermediate values — improves readability and avoids recalculation.",
                  "Each name is calculated once — more efficient than repeating complex FILTER/SORT formulas.",
                  "LET works with arrays — use for multi-step transformations.",
                  "Names in LET are case-insensitive but readable names make formulas self-documenting."
        ],
        mistake: "Complex nested formulas without LET — hard to read and maintain. Break into named steps with LET.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=FILTER(A:C, B:B>1000) + SORT(FILTER(A:C, B:B>1000), 2, -1)\n(repeated FILTER formula)\n// More explicit but longer",
          concise: "=LET(filtered, FILTER(...), sorted, SORT(filtered, 2, -1), sorted)",
        },
      },
      {
        id: "dynamic-arrays",
        fn: "Dynamic Arrays — Spill Ranges & # Operator",
        desc: "Understand spill ranges, use # operator for explicit references, and manage array conflicts.",
        category: "Advanced Functions",
        subtitle: "spill ranges, #, @, implicit intersection, array conflicts",
        signature: "=FILTER(A:C, B:B>100)  →  spills to multiple cells  |  A1#",
        descLong: "Spill ranges: when an array formula exceeds one cell, it spills into adjacent cells automatically. # operator references the entire spill range. @ is implicit intersection (reverses spill, references single cell). Spill conflicts occur when a spill meets data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Arrays — Spill Ranges & # Operator — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── FILTER spills automatically ─────────────────────\n=FILTER(A1:C100, B1:B100 > 1000)\n    ' Spills into A1:C__ (as many rows as match)\n    ' No Ctrl+Shift+Enter needed!\n\n' ── Reference spill range with # ────────────────────\nA1: =FILTER(Data, Data[Amount] > 1000)\nB1: =SUM(A1#)  ' Sum entire spill range A1\n    ' The # means \"the entire range this formula spilled to\"\n\n' ── Use @ for single cell (implicit intersection) ──\nA1: =SORT(FILTER(Data, Data[Region] = B1), 2, -1)\nB1: =A1@  ' Returns only the first row of the spill range\n           ' @ reverses the spill, gives single value"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Arrays — Spill Ranges & # Operator — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Arrays — Spill Ranges & # Operator with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Spill conflict: what if adjacent cells have data? ──\nA1: =FILTER(Data, Data[Amount] > 1000)\n    ' If A1:A1000 has data, spill fails: \"Spill range is blocked\"\n\n' Solutions:\n' 1. Put formula somewhere with empty adjacent cells\n' 2. Use explicit range: =FILTER(CHOOSECOLS(...), criteria)\n' 3. Delete adjacent data to make room\n\n' ── Force spill to specific range ────────────────────\n' Select A1:C100 first, then enter formula with Ctrl+Shift+Enter\n' (In newer Excel, just type formula and it auto-spills)\n\n' ── Stack multiple spills vertically ────────────────\nA1: =FILTER(Data1, Data1[Status] = \"Active\")\nA50: =FILTER(Data2, Data2[Status] = \"Active\")\n    ' Position formulas far apart to avoid conflicts"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Arrays — Spill Ranges & # Operator — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Reference spilled data in another sheet ────────\nSheet2!A1: =FILTER(Sheet1!A:C, Sheet1!B:B > 1000)\nSheet2!B1: =SUM(A1#)  ' Sum the spilled range from A1\n           ' # works across sheets\n\n' ── Troubleshooting spill conflicts ────────────────\n' #SPILL! error = adjacent cells block the spill\n' Clear the blocking cells or move the formula"
                  }
        ],
        tips: [
                  "Spill is automatic in modern Excel — array formulas no longer need Ctrl+Shift+Enter.",
                  "# operator explicitly references the entire spill range — essential for referencing filtered/sorted data.",
                  "@ implicit intersection reverses spill — use when you need a single value from a spilled range.",
                  "Spill conflicts (#SPILL!) happen when spill meets data — move formula or clear blocking cells."
        ],
        mistake: "Not understanding # operator — trying to reference spilled data without it leads to only the first cell being used.",
        shorthand: {
          verbose: "=FILTER(...) spills\nThen reference with =SUM(A1:A1000)\n(wrong: might miss rows)",
          concise: "=FILTER(...) spills auto; reference with A1# for full range; @ to reverse spill to single cell",
        },
      },
      {
        id: "power-pivot-dax",
        fn: "Power Pivot & DAX Basics",
        desc: "Build data models with multiple tables, create measures and calculated columns with DAX.",
        category: "Power Pivot",
        subtitle: "Data model, relationships, CALCULATE, measures, SUMX, RELATED",
        signature: "CALCULATE(expr, filter)  |  SUMX(table, expr)  |  =SUM(Sales[Amount])",
        descLong: "Power Pivot is Excel's data modeling layer. Add multiple tables to a data model, create relationships (like SQL JOINs). DAX formulas work on the model. Measures are dynamic calculations (like pivot table values). Calculated columns add data to tables. CALCULATE changes filter context, SUMX iterates rows, RELATED follows relationships.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Pivot & DAX Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Adding tables to Power Pivot ────────────────────\n' Step 1: Data → Table or named range\n' Step 2: Power Pivot → Manage → Add to Data Model\n' Step 3: Create Diagram View to see relationships\n\n' ── Create relationship between tables ──────────────\n' Power Pivot → Diagram View\n' Drag OrderID from Orders to CustomerID in Customers\n' Creates one-to-many relationship\n\n' ── Measures (calculations, similar to pivot values) ─\n' Power Pivot → New Measure\n' Name: Total Revenue\n' Formula: =SUM(Sales[Amount])\n\n' Name: Order Count\n' Formula: =COUNTA(Orders[OrderID])\n\n' Name: Average Order Value\n' Formula: =AVERAGE(Orders[Amount])\n\n' ── Calculated Columns (add data to tables) ────────\n' Power Pivot → New Column in Sales table\n' Name: Profit Margin\n' Formula: =[Amount] - [Cost]\n' This adds a column to the table\n\n' ── CALCULATE with filter context ──────────────────\n' Year 2024 Revenue Only:\n' =CALCULATE(\n'     [Total Revenue],\n'     YEAR(Orders[Date]) = 2024\n' )"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Pivot & DAX Basics — common patterns you'll see in production.\n// APPROACH  - Combine Power Pivot & DAX Basics with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' Revenue in West region:\n' =CALCULATE(\n'     [Total Revenue],\n'     Geography[Region] = \"West\"\n' )\n\n' ── SUMX iterates table rows ───────────────────────\n' Profit (with explicit iteration):\n' =SUMX(Sales, Sales[Amount] - Sales[Cost])\n\n' Commission by tier:\n' =SUMX(\n'     Sales,\n'     IF(Sales[Amount] > 10000, Sales[Amount] * 0.1, Sales[Amount] * 0.05)\n' )\n\n' ── RELATED follows relationship ──────────────────\n' In a calculated column in Orders:\n' CustomerName = RELATED(Customers[Name])\n' Looks up customer name from Customers table\n\n' ── Time intelligence ──────────────────────────────\n' Year-to-date (YTD) revenue:\n' =CALCULATE(\n'     [Total Revenue],\n'     DATESYTD(Calendar[Date])\n' )"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Pivot & DAX Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Previous year same period:\n' =CALCULATE(\n'     [Total Revenue],\n'     SAMEPERIODLASTYEAR(Calendar[Date])\n' )\n\n' Year-over-year growth:\n' =DIVIDE(\n'     [Total Revenue] - CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(Calendar[Date])),\n'     CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(Calendar[Date]))\n' )\n\n' ── Top N products by revenue ────────────────────\n' =CALCULATE(\n'     [Total Revenue],\n'     TOPN(10, ALL(Products[Name]), [Total Revenue])\n' )"
                  }
        ],
        tips: [
                  "Power Pivot handles millions of rows — use it for large datasets instead of pivot tables.",
                  "CALCULATE changes filter context — essential for conditional aggregations.",
                  "Measures are calculated once and used multiple times — more efficient than formulas in cells.",
                  "RELATED must follow a relationship — use to look up values from related tables.",
                  "Time intelligence (DATESYTD, SAMEPERIODLASTYEAR) requires a Calendar dimension table."
        ],
        mistake: "Using SUMIFS formulas in Power Pivot instead of CALCULATE + relationships — defeats the purpose of the data model.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUMIFS(Sales, Date>=DATE(2024,1,1), Date<=TODAY())\n(static, no relationship)\n// More explicit but longer",
          concise: "Power Pivot + relationships; =CALCULATE([Measure], filter); DAX time intelligence (DATESYTD, SAMEPERIODLASTYEAR)",
        },
      },
      {
        id: "data-validation-advanced",
        fn: "Advanced Data Validation with Formulas & Dropdown Dependencies",
        desc: "Build cascading dropdowns with INDIRECT, custom validation, and dependent lists.",
        category: "Data Validation",
        subtitle: "INDIRECT for cascading, custom formulas, validation lists, error messages",
        signature: "Validation → List → =INDIRECT(A1)  |  Custom → AND(condition1, condition2)",
        descLong: "INDIRECT in validation sources enables cascading dropdowns. Custom validation uses any formula returning TRUE/FALSE. Validation lists can be dynamic ranges or named lists. Error alerts guide users.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Data Validation with Formulas & Dropdown Dependencies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Cascading dropdown: Country → State → City ───\n' Step 1: Create named ranges for each country\n' Name Manager:\n'   US = {\"California\", \"Texas\", \"New York\"}\n'   UK = {\"London\", \"Manchester\", \"Edinburgh\"}\n'   DE = {\"Berlin\", \"Munich\", \"Frankfurt\"}\n\n' Step 2: Country dropdown in A1\n'   Data → Validation → List\n'   Source: = {\"US\", \"UK\", \"DE\"}\n\n' Step 3: State dropdown in B1 (depends on A1)\n'   Data → Validation → List\n'   Source: = INDIRECT(A1)\n'   (A1 contains \"US\", so B1 shows US states)\n\n' Step 4: City dropdown in C1 (depends on B1)\n'   Data → Validation → List\n'   Source: = INDIRECT(B1 & \"_\" & A1)\n'   (e.g., \"California_US\" is a named range of CA cities)\n\n' ── Dynamic list that expands with data ──────────\n' Name Manager: ProductList =\n'   = OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A)-1, 1)\n' (Counts non-empty cells, creates dynamic range)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Data Validation with Formulas & Dropdown Dependencies — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Data Validation with Formulas & Dropdown Dependencies with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' Data Validation → List → Source: = ProductList\n' Add a product to the list, validation dropdown includes it automatically\n\n' ── Custom validation: no duplicates ────────────\n' Data → Validation → Custom\n' Formula: = COUNTIF($A:$A, A1) <= 1\n' Error Alert: \"Duplicate value not allowed\"\n\n' ── Custom validation: email address format ────\n' Formula: = AND(ISNUMBER(FIND(\"@\", A1)), LEN(A1) > 5)\n' Error Alert: \"Enter a valid email address\"\n\n' ── Custom validation: date range ─────────────\n' Data must be between Jan 1 and Dec 31, 2024\n' Formula: = AND(A1 >= DATE(2024,1,1), A1 <= DATE(2024,12,31))\n\n' ── Custom validation: text length ──────────────\n' Product code must be exactly 5 characters\n' Formula: = LEN(A1) = 5\n\n' ── Custom validation: unique in column ────────\n' No duplicate entries in a column\n' Formula: = COUNTIF($A$2:$A$100, A2) = 1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Data Validation with Formulas & Dropdown Dependencies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Input message & error alert ──────────────────\n' Data Validation → Input Message:\n'   Title: \"Product Code\"\n'   Message: \"Enter a 5-character product code (e.g., AB123)\"\n\n' Error Alert tab:\n'   Style: Stop (blocks invalid entry)\n'   Title: \"Invalid Code\"\n'   Message: \"Product code must be exactly 5 letters/numbers\"\n\n' ── Protect sheet with unlocked validation cells ──\n' Format → Cells → Protection tab → Uncheck \"Locked\"\n' (for data entry cells only)\n\n' Review → Protect Sheet\n' ☐ Select locked cells\n' ☑ Select unlocked cells\n' (Users can only type in unlocked cells)"
                  }
        ],
        tips: [
                  "INDIRECT enables cascading dropdowns — pair with carefully named ranges for each category.",
                  "Custom validation formulas = TRUE for valid, FALSE for invalid.",
                  "Dynamic named ranges with OFFSET expand automatically — validation dropdowns grow with data.",
                  "Input Message tab explains what to enter — shows when user selects the cell.",
                  "Protect sheet to enforce data entry — locked cells for formulas, unlocked for user input."
        ],
        mistake: "Static validation lists instead of INDIRECT — adding a country requires manually editing the validation rule.",
        shorthand: {
          verbose: "Create named range for each country\nValidation list: USA, UK, DE\nFor each state, manually create another list",
          concise: "INDIRECT(A1) in validation source for cascading; dynamic named ranges with OFFSET; custom formulas for business logic",
        },
      },
      {
        id: "conditional-formatting-advanced",
        fn: "Conditional Formatting Advanced — Formula Rules & Icon Sets",
        desc: "Apply formatting with formulas, use data bars and icon sets, manage complex rules.",
        category: "Conditional Formatting",
        subtitle: "formula-based rules, data bars, icon sets, color scales, multi-rule logic",
        signature: "Conditional Formatting → New Rule → Formula → =AND(A1>0, B1>100)",
        descLong: "Formula-based conditional formatting applies rules based on custom logic. Data bars show values as bars (like mini charts). Icon sets display symbols (arrows, traffic lights). Color scales show gradients. Rules can reference other cells and use any formula returning TRUE/FALSE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conditional Formatting Advanced — Formula Rules & Icon Sets — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Formula-based conditional formatting ──────────\n' Highlight rows where Amount > 1000:\n' Home → Conditional Formatting → New Rule\n' Format Only Cells That Contain → Formula Is\n' = $B2 > 1000\n' Format: Light Green fill\n\n' ── Multi-condition rule with AND ─────────────────\n' Highlight revenue > 10000 AND region = \"West\"\n' Formula: = AND($B2 > 10000, $D2 = \"West\")\n\n' ── Highlight entire row if condition is true ────\n' If order status is \"Pending\", highlight row red\n' Apply to: A1:F100\n' Formula: = $E1 = \"Pending\"\n' ($ locks column, relative row allows rule to apply to all rows)\n\n' ── Highlight based on another column ────────────\n' Highlight sales if > target\n' Apply to: Sales column (D2:D100)\n' Formula: = D2 > VLOOKUP(C2, Targets, 2, 0)\n' (Compares each sale to its target)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conditional Formatting Advanced — Formula Rules & Icon Sets — common patterns you'll see in production.\n// APPROACH  - Combine Conditional Formatting Advanced — Formula Rules & Icon Sets with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Data bars: show values as bars ─────────────────\n' Select range: B2:B100\n' Home → Conditional Formatting → Data Bars → Blue\n' Each cell shows a bar proportional to its value\n\n' ── Icon sets: show symbols ───────────────────────\n' Select range: C2:C100\n' Home → Conditional Formatting → Icon Sets\n' Options: Traffic Light (red/yellow/green), arrows, etc.\n' Excel auto-assigns icons based on value ranges\n\n' ── Color scale: gradient from low to high ───────\n' Select range: E2:E100\n' Home → Conditional Formatting → Color Scales\n' Green (low) → Yellow (medium) → Red (high)\n\n' ── Remove formatting based on formula ─────────────\n' Cells that do NOT meet criteria:\n' Formula: = NOT(condition)\n' Example: = NOT($B2 > 1000)  ' Format if NOT > 1000"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conditional Formatting Advanced — Formula Rules & Icon Sets — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Clear conditional formatting ──────────────────\n' Select range\n' Home → Conditional Formatting → Clear Rules\n' From Selected Cells / From Entire Sheet\n\n' ── Manage multiple rules (priority matters) ──────\n' Home → Conditional Formatting → Manage Rules\n' Rules are evaluated top to bottom\n' Check \"Stop if true\" to stop evaluating at first match"
                  }
        ],
        tips: [
                  "Use $ for locked references in formulas — $B2 allows row to change, $B$2 locks both.",
                  "Formula-based rules are more powerful than standard conditional formatting — use them for complex logic.",
                  "Data bars for quick visual comparison of values.",
                  "Icon sets for status indicators (traffic lights, arrows).",
                  "Color scales show gradients — useful for heatmaps.",
                  "Manage Rules dialog shows all active rules and priority order."
        ],
        mistake: "Creating too many overlapping rules — hard to debug. Use Manage Rules to see and simplify.",
        shorthand: {
          verbose: "// Manual / verbose approach\nHome → Conditional Formatting → Highlight Cell Rules → Greater Than\n(limited to one condition)\n// More explicit but longer",
          concise: "Formula Is for complex rules; Data Bars/Icon Sets for visual indicators; Manage Rules for priority",
        },
      },
      {
        id: "named-ranges-tables",
        fn: "Named Ranges & Structured References",
        desc: "Use named ranges for readable formulas and dynamic references. Structured references in Tables.",
        category: "Organization",
        subtitle: "named ranges, OFFSET, dynamic ranges, Table[Column], structured references",
        signature: "Name Manager → \"SalesTotal\" = Sheet1!$B$2:$B$100  |  =SUM(SalesTable[Amount])",
        descLong: "Named ranges make formulas self-documenting: =SUM(MonthlySales) vs =SUM(B2:B13). Structured references in Tables (TableName[ColumnName]) auto-expand with new data. Dynamic named ranges with OFFSET grow automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Named Ranges & Structured References — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Create named range (static) ──────────────────\n' Formulas → Name Manager → New\n' Name: MonthlyRevenue\n' Refers to: Sheet1!$C$2:$C$13\n' (Now use =SUM(MonthlyRevenue) in formulas)\n\n' ── Create dynamic named range (OFFSET) ──────────\n' Name: SalesData\n' Refers to: = OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A), 1)\n' (Starts at A1, includes all non-empty rows)\n\n' ── Use named range in formula ──────────────────\n' =SUM(MonthlyRevenue)\n' =AVERAGE(MonthlyRevenue)\n' =IF(SalesTotal > Target, \"Good\", \"Needs Work\")\n\n' ── Structured references in Excel Tables ────────\n' Step 1: Select data → Ctrl+T → Create Table\n' Step 2: Name the table \"SalesTable\" (in Table Design tab)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Named Ranges & Structured References — common patterns you'll see in production.\n// APPROACH  - Combine Named Ranges & Structured References with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Use structured references ───────────────────\n' Sum a column:\n' = SUM(SalesTable[Amount])\n\n' Reference current row:\n' = SalesTable[@Amount]\n\n' Multiple columns (similar to INDEX):\n' = SalesTable[[Region]:[Amount]]\n\n' With criteria (SUMIF equivalent):\n' = SUMIFS(SalesTable[Revenue], SalesTable[Region], \"West\")\n\n' ── Named range with formula reference ──────────\n' In a list or dropdown:\n' =INDIRECT(\"List_\" & A1)\n' Where A1 = \"US\" → looks up named range \"List_US\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Named Ranges & Structured References — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Absolute vs relative in named ranges ───────\n' Absolute: Sheet1!$A$1:$B$100 (fixed)\n' Relative: Sheet1!A1:B100 (expands)\n' Dynamic: OFFSET(Sheet1!$A$1, ...) (smart expansion)\n\n' ── Delete/edit named range ─────────────────────\n' Formulas → Name Manager\n' Select name → Edit or Delete\n' Warning: Formulas still using deleted names show #NAME?\n\n' ── INDIRECT for dynamic named ranges ──────────\n' Create separate ranges: \"2023_Sales\", \"2024_Sales\", \"2025_Sales\"\n' Then: =SUM(INDIRECT(A1 & \"_Sales\"))\n' Where A1 = \"2024\" → sums 2024_Sales"
                  }
        ],
        tips: [
                  "Named ranges make formulas readable: =SUM(Revenue) vs =SUM(B2:B1000).",
                  "Structured references (Table[Column]) auto-expand — no manual range updates.",
                  "Dynamic named ranges (OFFSET, COUNTA) grow with data — perfect for growing datasets.",
                  "INDIRECT + named ranges enable flexible, user-friendly spreadsheets.",
                  "Name Manager (Formulas → Name Manager) is where you create, edit, delete named ranges."
        ],
        mistake: "Using hardcoded ranges (B2:B1000) instead of named ranges — when data grows to 1001 rows, formula breaks.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUM(B2:B1000) then add row 1001 → formula breaks\n// More explicit but longer",
          concise: "Named ranges: =SUM(MonthlyRevenue); Tables: =SUM(Table[Col]) auto-expands; OFFSET for dynamic growth",
        },
      },
      {
        id: "external-data-connections",
        fn: "External Data Connections — Web Services, Power Query, Refresh",
        desc: "Pull data from web services, SQL databases, and refresh automatically.",
        category: "Data Integration",
        subtitle: "WEBSERVICE, Power Query connections, refresh settings, API calls",
        signature: "=WEBSERVICE(url)  |  =FILTERXML(xml, xpath)  |  Data → From Web",
        descLong: "WEBSERVICE fetches data from URLs (JSON, XML). FILTERXML parses XML. Power Query creates reusable data connections. Refresh settings automate updates. Useful for live data: currency rates, stock prices, weather, API data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of External Data Connections — Web Services, Power Query, Refresh — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── WEBSERVICE: fetch from URL ──────────────────\n' Get JSON data from an API\n' = WEBSERVICE(\"https://api.example.com/data?key=value\")\n' Returns JSON text (need to parse with FILTERXML or JSON functions)\n\n' ── Example: currency conversion ────────────────\n' = WEBSERVICE(\"https://api.exchangerate-api.com/v4/latest/USD\")\n' Returns JSON with exchange rates\n\n' ── FILTERXML: parse XML/JSON ──────────────────\n' = FILTERXML(xml_text, xpath_expression)\n\n' Example: extract value from XML\n' = FILTERXML(WEBSERVICE(url), \"//price\")\n\n' Extract JSON value (if formatted as XML)\n' = FILTERXML(WEBSERVICE(url), \"//rate[@currency='EUR']\")\n\n' ── Power Query for API connections ────────────────\n' Data → Get Data → From Web\n' Enter URL: https://api.example.com/v1/data\n' Power Query loads and transforms response\n' Refresh on demand or on schedule"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of External Data Connections — Web Services, Power Query, Refresh — common patterns you'll see in production.\n// APPROACH  - Combine External Data Connections — Web Services, Power Query, Refresh with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Example: load CSV from URL ──────────────────\n' Data → Get Data → From Web\n' URL: https://example.com/data.csv\n' Power Query automatically treats as CSV\n' Refresh when source updates\n\n' ── SQL Server connection ───────────────────────\n' Data → Get Data → From Database → SQL Server\n' Server: myserver.database.windows.net\n' Database: MyDB\n' Query: SELECT * FROM Sales WHERE Year = 2024\n\n' ── Automatic refresh settings ──────────────────\n' Data → Queries & Connections\n' Right-click query → Properties\n' Refresh tab:\n'   ☐ Refresh data when opening file\n'   ☐ Enable background refresh\n'   ☐ Schedule refresh: Every [30] minutes"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of External Data Connections — Web Services, Power Query, Refresh — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Manage connection credentials ───────────────\n' Data → Edit Queries → Editor\n' Data Source Settings:\n'   - Use Windows authentication (SSO)\n'   - Store password securely\n'   - Prompt each time\n\n' ── Combine multiple web sources ────────────────\n' Load weather, stock prices, currency rates\n' Create queries for each source\n' Combine in Power Query or Power Pivot\n' Create dashboard that auto-updates"
                  }
        ],
        tips: [
                  "WEBSERVICE requires JSON/XML parsing — use FILTERXML or JSON functions.",
                  "Power Query is easier for complex APIs — handles authentication, transformation, refresh.",
                  "Schedule refresh for off-peak hours — reduces server load.",
                  "Use parameters for dynamic queries — users change date/region, query refreshes.",
                  "Cache external data when possible — frequent API calls slow down workbooks."
        ],
        mistake: "Hardcoding API keys in formulas — security risk. Use parameters or secure storage.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=WEBSERVICE(api_url)\nManual parsing of JSON response\n// More explicit but longer",
          concise: "Power Query for complex APIs; WEBSERVICE + FILTERXML for simple calls; schedule refresh; use parameters for dynamic queries",
        },
      },
    ],
  },

  // ── Section 4: Modern Functions (2024) ─────────────────────────────────────────
  {
    id: "modern-functions",
    title: "Modern Functions (2024)",
    entries: [
      {
        id: "groupby",
        fn: "GROUPBY — group and aggregate without pivot tables",
        desc: "GROUPBY is Excel's 2024 function that groups data by one or more columns and applies aggregations — like a SQL GROUP BY in a single formula.",
        category: "Dynamic Arrays",
        subtitle: "GROUPBY, aggregation, group by, SQL-style, pivot alternative, dynamic array, 2024 function",
        signature: "=GROUPBY(row_fields, values, function, [field_headers], [total_depth], [sort_order], [filter_array])",
        descLong: "GROUPBY is one of Excel's newest functions (2024) that creates grouped aggregations in a single formula. It takes row fields (columns to group by), values (columns to aggregate), a function (SUM, COUNT, AVERAGE, etc.), and optional parameters for headers, totals, sorting, and filtering. The result spills dynamically like other dynamic array functions. Key advantages over PivotTables: (1) Formula-driven — updates automatically when source data changes. (2) No need to refresh. (3) Works in any cell. (4) Can be nested in other formulas. Limitations: (1) Requires Excel 365 beta channel. (2) Limited aggregation functions (SUM, COUNT, AVERAGE, MEDIAN, MAX, MIN, etc.). (3) No drag-and-drop field arrangement. Use GROUPBY for quick aggregations in dashboards and reports where a full PivotTable is overkill.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Group sales by category and show total revenue\n// APPROACH  - Use GROUPBY with category column and SUM\n// STRENGTHS - Single formula; auto-updates; no pivot table needed\n// WEAKNESSES- Requires Excel 365 beta; limited to preset aggregations\n\n=GROUPBY(A2:A100, D2:D100, SUM, 3)\n// A2:A100 = category column (row fields)\n// D2:D100 = revenue column (values)\n// SUM = aggregation function\n// 3 = show headers and totals\n\n// Result spills into adjacent cells:\n// Category    | Revenue\n// Electronics | $45,000\n// Clothing    | $23,000\n// Total       | $68,000",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Group by multiple fields with sorting and filtering\n// APPROACH  - Use GROUPBY with multiple row fields and sort/filter options\n// STRENGTHS - Multi-level grouping; sorted output; filtered data\n// WEAKNESSES- Syntax gets complex with many arguments\n\n=GROUPBY(\n  A2:B100,           // row_fields: Category AND Region (two columns)\n  D2:D100,           // values: Revenue\n  SUM,               // function\n  3,                 // field_headers: show both headers and grand total\n  2,                 // total_depth: show grand total + subtotals\n  -2,                // sort_order: descending by 2nd field (Revenue)\n  C2:C100=\"Active\"   // filter_array: only Active status rows\n)\n\n// Result:\n// Category    | Region | Revenue\n// Electronics | East   | $25,000\n// Electronics | West   | $20,000\n// Electronics | Total  | $45,000\n// Clothing    | East   | $13,000\n// Clothing    | West   | $10,000\n// Clothing    | Total  | $23,000\n// Grand Total |        | $68,000\n\n// Multiple aggregations using HSTACK\n=GROUPBY(\n  A2:A100,\n  HSTACK(D2:D100, E2:E100),  // Revenue AND Quantity side by side\n  SUM,\n  3\n)",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a dynamic reporting dashboard with GROUPBY + formula-driven parameters\n// APPROACH  - Combine GROUPBY with dropdown selectors and LAMBDA for reusable reports\n// STRENGTHS - Fully interactive; parameterized; reusable across datasets\n// WEAKNESSES- Complex; requires Excel 365 beta; large datasets may be slow\n\n// Step 1: Create a LAMBDA for reusable grouped reports\n=LAMBDA(data, group_cols, value_col, agg_func, filter_col, filter_val,\n  GROUPBY(\n    CHOOSECOLS(data, group_cols),\n    CHOOSECOLS(data, value_col),\n    agg_func,\n    3,  // headers + totals\n    2,  // grand total + subtotals\n    -2, // sort by values descending\n    IF(filter_val=\"All\", TRUE, CHOOSECOLS(data, filter_col)=filter_val)\n  )\n)\n\n// Save as named function: GroupReport\n\n// Step 2: Dashboard with dropdown selectors\n// G1: Category dropdown (All, Electronics, Clothing, ...)\n// G2: Aggregation dropdown (SUM, COUNT, AVERAGE)\n\n=GroupReport(\n  Table1[#All],           // full table with headers\n  {1,2},                  // group by columns 1 and 2\n  4,                      // value column 4\n  XLOOKUP(G2,{\"SUM\",\"COUNT\",\"AVERAGE\"},{SUM,COUNT,AVERAGE}),\n  3,                      // filter column 3\n  G1                      // filter value from dropdown\n)\n\n// Step 3: Compare GROUPBY vs PIVOTBY for 2D analysis\n// GROUPBY: 1D grouping (rows only)\n=GROUPBY(A2:A100, D2:D100, SUM, 3)\n\n// PIVOTBY: 2D grouping (rows + columns) — like a PivotTable\n=PIVOTBY(\n  A2:A100,    // row_fields: Category\n  B2:B100,    // col_fields: Region\n  D2:D100,    // values: Revenue\n  SUM,        // function\n  3           // headers\n)\n// PIVOTBY creates a cross-tab:\n// Category    | East  | West  | Total\n// Electronics | $25k  | $20k  | $45k\n// Clothing    | $13k  | $10k  | $23k\n// Total       | $38k  | $30k  | $68k",
          },
        ],
        tips: [
          "GROUPBY is a 2024 function — requires Excel 365 beta/insider channel.",
          "Use 3 for field_headers to show both column headers and grand total.",
          "Sort order: positive = ascending, negative = descending, number = which column to sort by.",
          "Filter array: pass a boolean array (TRUE/FALSE) to filter rows before grouping.",
          "For 2D cross-tabs (rows + columns), use PIVOTBY instead of GROUPBY.",
        ],
        mistake: "Passing column numbers instead of ranges to GROUPBY — it requires actual cell ranges (A2:A100), not column indices. Use CHOOSECOLS if you need to select by index.",
        shorthand: {
          verbose: "// GROUPBY: group and aggregate\n=GROUPBY(A2:A100, D2:D100, SUM, 3)\n// Multiple fields + filter\n=GROUPBY(A2:B100, D2:D100, SUM, 3, 2, -2, C2:C100=\"Active\")\n// PIVOTBY: 2D cross-tab\n=PIVOTBY(A2:A100, B2:B100, D2:D100, SUM, 3)",
          concise: "// Quick GROUPBY\n=GROUPBY(A:A, D:D, SUM, 3)",
        },
      },
      {
        id: "pivotby",
        fn: "PIVOTBY — 2D pivot table in a single formula",
        desc: "PIVOTBY creates a 2D cross-tabulation (rows × columns) with aggregations — a formula-driven PivotTable that spills dynamically.",
        category: "Dynamic Arrays",
        subtitle: "PIVOTBY, cross-tab, pivot table, 2D grouping, row fields, column fields, dynamic array, 2024 function",
        signature: "=PIVOTBY(row_fields, col_fields, values, function, [field_headers], [total_depth], [sort_order], [filter_array])",
        descLong: "PIVOTBY is Excel's 2024 function that creates a 2D pivot table in a single formula. It groups data by row fields AND column fields simultaneously, applying an aggregation function to the values. The result is a cross-tabulation that spills dynamically. Key features: (1) Row fields — columns to group on rows (like PivotTable rows). (2) Column fields — columns to group on columns (like PivotTable columns). (3) Values — the column to aggregate. (4) Function — SUM, COUNT, AVERAGE, etc. (5) Optional headers, totals, sorting, filtering. PIVOTBY is the formula equivalent of a PivotTable — use it when you need a dynamic cross-tab that updates automatically without manual refresh.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Create a sales cross-tab: categories × regions\n// APPROACH  - Use PIVOTBY with row and column fields\n// STRENGTHS - Dynamic; auto-updates; no pivot table refresh needed\n// WEAKNESSES- Requires Excel 365 beta; less flexible than PivotTables\n\n=PIVOTBY(A2:A100, B2:B100, D2:D100, SUM, 3)\n// A2:A100 = row fields (Category)\n// B2:B100 = col fields (Region)\n// D2:D100 = values (Revenue)\n// SUM = aggregation\n// 3 = show headers and totals\n\n// Result:\n// Category    | East  | West  | Total\n// Electronics | $25k  | $20k  | $45k\n// Clothing    | $13k  | $10k  | $23k\n// Total       | $38k  | $30k  | $68k",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Create a monthly sales pivot with sorting and percentage of total\n// APPROACH  - PIVOTBY with date grouping and custom sorting\n// STRENGTHS - Dynamic date grouping; sorted output\n// WEAKNESSES- Date grouping requires TEXT() preprocessing for month names\n\n// Group by month name (rows) and product (columns)\n=PIVOTBY(\n  TEXT(C2:C100, \"mmm\"),     // row: month extracted from dates\n  A2:A100,                   // col: product names\n  D2:D100,                   // values: revenue\n  SUM,                       // function\n  3,                         // headers + totals\n  2,                         // grand total + subtotals\n  1                          // sort by first column (month order)\n)\n\n// Percentage of total: wrap in calculations\n=LET(\n  pivot, PIVOTBY(A2:A100, B2:B100, D2:D100, SUM, 3),\n  total, TAKE(TAKE(pivot, -1), -1),\n  pivot / total\n)\n// Shows each cell as % of grand total",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a dynamic sales analytics dashboard with PIVOTBY + GROUPBY\n// APPROACH  - Combine PIVOTBY for cross-tabs, GROUPBY for 1D summaries, LET for calculations\n// STRENGTHS - Full dashboard in formulas; no VBA; no pivot tables\n// WEAKNESSES- Large datasets may be slow; requires Excel 365 beta\n\n// Main cross-tab: Category × Month\n=LET(\n  data, Table1[#All],\n  cats, CHOOSECOLS(data, 1),\n  months, TEXT(CHOOSECOLS(data, 3), \"mmm\"),\n  revenue, CHOOSECOLS(data, 4),\n  PIVOTBY(cats, months, revenue, SUM, 3, 2, -4)\n)\n\n// Side summary: top 5 categories by revenue\n=LET(\n  grouped, GROUPBY(\n    CHOOSECOLS(Table1, 1),\n    CHOOSECOLS(Table1, 4),\n    SUM, 1, 0, -2\n  ),\n  TAKE(grouped, 6)  // top 5 + header\n)\n\n// Trend analysis: month-over-month growth\n=LET(\n  monthly, GROUPBY(\n    TEXT(CHOOSECOLS(Table1, 3), \"mmm\"),\n    CHOOSECOLS(Table1, 4),\n    SUM, 1, 0, 1\n  ),\n  vals, DROP(CHOOSECOLS(monthly, 2), 1),\n  prev, DROP(vals, 1),\n  curr, DROP(vals, -1),\n  HSTACK(\n    DROP(CHOOSECOLS(monthly, 1), 2),\n  vals,\n    HSTACK(prev, (curr - prev) / prev)\n  )\n)",
          },
        ],
        tips: [
          "PIVOTBY creates a 2D cross-tab — use GROUPBY for 1D (rows only) grouping.",
          "For date grouping, wrap dates in TEXT() to extract month/quarter names.",
          "Sort order: positive = ascending, negative = descending, number = column index.",
          "PIVOTBY auto-updates when source data changes — no manual refresh like PivotTables.",
          "Combine with LET to avoid recalculating the same PIVOTBY result multiple times.",
        ],
        mistake: "Using PIVOTBY when you need calculated fields or custom aggregations — PIVOTBY only supports preset functions (SUM, COUNT, AVERAGE, etc.). Use a PivotTable for calculated fields.",
        shorthand: {
          verbose: "// PIVOTBY: 2D cross-tab\n=PIVOTBY(A2:A100, B2:B100, D2:D100, SUM, 3)\n// With sorting and totals\n=PIVOTBY(A:A, B:B, D:D, SUM, 3, 2, -4)\n// Month grouping\n=PIVOTBY(TEXT(C:C,\"mmm\"), A:A, D:D, SUM, 3)",
          concise: "// Quick PIVOTBY\n=PIVOTBY(A:A, B:B, D:D, SUM, 3)",
        },
      },
    ],
  },

  // ── Section 5: Power Pivot Advanced ─────────────────────────────────────────
  {
    id: "power-pivot-advanced",
    title: "Power Pivot Advanced",
    entries: [
      {
        id: "pp-relationships-measures",
        fn: "Power Pivot — relationships, measures, and DAX model",
        desc: "Power Pivot enables multi-table data models with relationships, calculated columns, and DAX measures — Excel's built-in BI engine for large datasets.",
        category: "Power Pivot",
        subtitle: "Power Pivot, data model, relationships, measures, DAX, calculated columns, star schema, CALCULATE, time intelligence",
        signature: "Measure = CALCULATE(SUM(table[column]), FILTER(table, table[column] = value))",
        descLong: "Power Pivot is Excel's in-memory BI engine that handles millions of rows across multiple related tables. Key features: (1) Relationships — connect tables via key columns (star schema). (2) DAX measures — dynamic calculations that respond to filter context. (3) Calculated columns — computed columns stored in the model. (4) Time intelligence — YTD, MTD, YoY comparisons. (5) KPIs — track measures against targets. Power Pivot overcomes Excel's 1M row limit and enables complex multi-table analysis without VLOOKUPs. The data model is shared with PivotTables, PivotCharts, and CUBE functions. DAX (Data Analysis Expressions) is the formula language — more powerful than Excel formulas due to filter context and evaluation context.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Create a basic data model with two related tables\n// APPROACH  - Load tables to data model, create relationship, write DAX measure\n// STRENGTHS - Handles millions of rows; no VLOOKUP needed; auto-propagates filters\n// WEAKNESSES- DAX learning curve; requires Power Pivot add-in (Excel 2016+)\n\n// Step 1: Load tables to Data Model (Power Pivot > Add to Data Model)\n// Sales table: [OrderID, ProductID, Amount, Date]\n// Products table: [ProductID, ProductName, Category, Price]\n\n// Step 2: Create relationship (Diagram View)\n// Products[ProductID] 1:N Sales[ProductID]\n\n// Step 3: Create DAX measures (Power Pivot > Calculations > Measures)\nTotal Sales = SUM(Sales[Amount])\n\nAvg Order Value = DIVIDE(SUM(Sales[Amount]), COUNTROWS(Sales), 0)\n\nSales by Category =\nCALCULATE(\n  SUM(Sales[Amount]),\n  VALUES(Products[Category])\n)\n\n// Step 4: Use in PivotTable — drag Category to Rows, [Total Sales] to Values\n// Filter context automatically propagates through the relationship",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Build a star schema with time intelligence measures\n// APPROACH  - Create date table, relationships, and YTD/YoY DAX measures\n// STRENGTHS - Full BI model; time-based analysis; filter propagation\n// WEAKNESSES- Requires proper date table; DAX can be complex\n\n// Step 1: Create a Date table in Power Pivot\nDate =\nADDCOLUMNS(\n  CALENDAR(DATE(2023,1,1), DATE(2024,12,31)),\n  \"Year\", YEAR([Date]),\n  \"Month\", FORMAT([Date], \"mmm\"),\n  \"MonthNum\", MONTH([Date]),\n  \"Quarter\", \"Q\" & CEILING(MONTH([Date])/3, 1),\n  \"YearMonth\", FORMAT([Date], \"YYYY-MM\"),\n  \"IsCurrentMonth\", IF(MONTH([Date])=MONTH(TODAY()), 1, 0)\n)\n\n// Step 2: Relationships (Diagram View)\n// Date[Date] 1:N Sales[Date]\n// Products[ProductID] 1:N Sales[ProductID]\n// Customers[CustomerID] 1:N Sales[CustomerID]\n\n// Step 3: Time intelligence measures\nSales YTD =\nTOTALYTD(SUM(Sales[Amount]), Date[Date])\n\nSales MTD =\nTOTALMTD(SUM(Sales[Amount]), Date[Date])\n\nSales YoY =\nVAR CurrentYear = SUM(Sales[Amount])\nVAR PrevYear = CALCULATE(SUM(Sales[Amount]), DATEADD(Date[Date], -1, YEAR))\nRETURN DIVIDE(CurrentYear - PrevYear, PrevYear, 0)\n\n// Step 4: Calculated columns (stored in model, computed at refresh)\nSales[ProfitMargin] =\nDIVIDE(Sales[Amount] - RELATED(Products[Cost]), Sales[Amount], 0)\n\nSales[OrderSize] =\nSWITCH(\n  TRUE(),\n  Sales[Amount] < 100, \"Small\",\n  Sales[Amount] < 1000, \"Medium\",\n  Sales[Amount] < 10000, \"Large\",\n  \"Enterprise\"\n)\n\n// Step 5: KPI — track sales against target\nTarget Sales = 1000000  // base measure\nSales KPI = KPI(\n  [Total Sales],\n  [Target Sales],\n  \"Goal\", 1,\n  \"Status\", -1  // red if below, green if above\n)",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a production-grade financial reporting model\n// APPROACH  - Multi-table star schema with advanced DAX patterns\n// STRENGTHS - Enterprise-grade; handles complex calculations; fast on millions of rows\n// WEAKNESSES- Requires DAX expertise; model design is critical\n\n// Step 1: Star schema (Diagram View)\n// Fact: Sales (OrderID, ProductKey, CustomerKey, DateKey, Amount, Quantity)\n// Dim: Products, Customers, Date, Geography, SalesRep\n\n// Step 2: Advanced DAX measures\n\n// Rolling 12-month average\nRolling 12M Avg =\nVAR EndDate = MAX(Date[Date])\nVAR StartDate = EDATE(EndDate, -12)\nRETURN\nCALCULATE(\n  AVERAGE(Sales[Amount]),\n  DATESBETWEEN(Date[Date], StartDate, EndDate)\n)\n\n// Pareto analysis: cumulative % of total\nCumulative % =\nVAR CurrentAmount = SUM(Sales[Amount])\nVAR AllAmount = CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Products))\nVAR CumulativeAmount =\n  CALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n      ALLSELECTED(Products),\n      SUM(Sales[Amount]) >= CurrentAmount\n    )\n  )\nRETURN DIVIDE(CumulativeAmount, AllAmount, 0)\n\n// Dynamic measure: switch based on user selection\nSelected Measure =\nSWITCH(\n  SELECTEDVALUE(MeasureSelector[MeasureName]),\n  \"Revenue\", [Total Sales],\n  \"Quantity\", SUM(Sales[Quantity]),\n  \"Profit\", [Total Profit],\n  \"Margin %\", [Profit Margin %],\n  [Total Sales]  // default\n)\n\n// Same Store Sales: only stores active in both periods\nSame Store Sales =\nVAR CurrentStores =\n  CALCULATETABLE(\n    VALUES(Sales[StoreID]),\n    Sales[Date] >= DATE(2024, 1, 1)\n  )\nVAR PrevStores =\n  CALCULATETABLE(\n    VALUES(Sales[StoreID]),\n    Sales[Date] >= DATE(2023, 1, 1) &&\n    Sales[Date] < DATE(2024, 1, 1)\n  )\nRETURN\nCALCULATE(\n  SUM(Sales[Amount]),\n  INTERSECT(CurrentStores, PrevStores)\n)\n\n// Step 3: Use CUBE functions to pull data into cells\n// In a worksheet cell:\n=CUBEVALUE(\"ThisWorkbookDataModel\", \"[Measures].[Total Sales]\",\n  \"[Products].[Category].&[Electronics]\",\n  \"[Date].[Year].&[2024]\")\n\n// Step 4: Optimize model\n// - Set column data types correctly (INT, not STRING for keys)\n// - Hide key columns from client tools\n// - Mark Date table as date table (Table > Mark as Date Table)\n// - Use SUMMARIZECOLUMNS in DAX queries for better performance",
          },
        ],
        tips: [
          "Always create a dedicated Date table — don't use Sales[Date] directly for time intelligence.",
          "Mark the Date table: Table > Design > Mark as Date Table — enables time intelligence functions.",
          "Use RELATED() to pull columns from dimension tables into fact tables (like VLOOKUP but faster).",
          "Measures are dynamic (calculated at query time); calculated columns are static (computed at refresh).",
          "Use CUBEVALUE/CUBEMEMBER functions to pull Power Pivot data into specific worksheet cells.",
        ],
        mistake: "Creating calculated columns when measures would suffice — calculated columns consume memory and are computed at refresh time. Measures are computed at query time and don't use storage. Use measures for aggregations.",
        shorthand: {
          verbose: "// Power Pivot DAX measures\nTotal Sales = SUM(Sales[Amount])\nSales YTD = TOTALYTD(SUM(Sales[Amount]), Date[Date])\nSales YoY = VAR c=SUM(Sales[Amount]) VAR p=CALCULATE(SUM(Sales[Amount]),DATEADD(Date[Date],-1,YEAR)) RETURN DIVIDE(c-p,p,0)\n// Calculated column\nProfit = Sales[Amount] - RELATED(Products[Cost])",
          concise: "// Quick DAX measure\nTotal = SUM(t[col])\nYTD = TOTALYTD(SUM(t[c]),Date[Date])",
        },
      },
    ],
  },

  // ── Section 6: Advanced Charts & Visualization ─────────────────────────────────────────
  {
    id: "advanced-charts",
    title: "Advanced Charts & Visualization",
    entries: [
      {
        id: "advanced-chart-types",
        fn: "Advanced Chart Types — waterfall, treemap, sunburst, histogram",
        desc: "Excel supports specialized chart types for financial analysis, hierarchical data, and statistical distributions beyond basic bar/line charts.",
        category: "Charts",
        subtitle: "waterfall, treemap, sunburst, histogram, box plot, funnel, combo, chart types, data visualization",
        signature: "Insert > Chart > [All Charts tab] > [select chart type]",
        descLong: "Excel offers many specialized chart types beyond basic bar/line/pie: (1) Waterfall — shows how initial value is affected by positive/negative changes (financial analysis). (2) Treemap — hierarchical data as nested rectangles (category → subcategory proportions). (3) Sunburst — hierarchical data as concentric rings (multi-level hierarchy). (4) Histogram — frequency distribution with automatic binning. (5) Box & Whisker — statistical distribution (quartiles, outliers). (6) Funnel — pipeline/stage progression. (7) Combo — combine two chart types (e.g., bars + line on secondary axis). (8) Map — geographic data on a filled map. These charts help communicate complex data patterns that basic charts can't. Available in Excel 2016+ (some require 365).",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Create a waterfall chart for profit bridge analysis\n// APPROACH  - Organize data, insert waterfall chart\n// STRENGTHS - Shows contribution of each component to total\n// WEAKNESSES- Requires Excel 2016+; limited customization\n\n// Data layout:\n// Category      | Amount\n// Starting Profit | 100000\n// Revenue Growth  |  50000\n// Cost Reduction  |  20000\n// New Expenses    | -15000\n// Tax Increase    | -10000\n// Final Profit    | 145000\n\n// Insert > Chart > All Charts > Waterfall\n// Result: shows how each item adds/subtracts from starting value\n// Green bars = positive, red bars = negative, total bars anchored\n\n// Set Final Profit as total: right-click bar > Set as Total\n// Set Starting Profit as total: right-click bar > Set as Total\n// This anchors the start and end bars to the axis",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Create hierarchical visualizations with treemap and sunburst\n// APPROACH  - Organize hierarchical data, use treemap or sunburst chart\n// STRENGTHS - Shows proportions at multiple hierarchy levels\n// WEAKNESSES- Limited to 2-3 hierarchy levels for readability\n\n// Data layout for treemap/sunburst:\n// Region  | Country  | Product  | Revenue\n// North   | USA      | Electronics | $500k\n// North   | USA      | Clothing    | $200k\n// North   | Canada   | Electronics | $150k\n// South   | Brazil   | Electronics | $100k\n// South   | Brazil   | Clothing    | $80k\n\n// Treemap: Insert > Chart > Treemap\n// Shows nested rectangles: Region > Country > Product\n// Rectangle size = revenue. Color = region.\n\n// Sunburst: Insert > Chart > Sunburst\n// Shows concentric rings: Region (inner) > Country > Product (outer)\n// Arc length = revenue proportion.\n\n// Histogram: Insert > Chart > Histogram\n// Data: single column of numeric values\n// Excel auto-bins the data and shows frequency distribution\n// Customize bins: right-click X-axis > Format Axis > Bin Width\n\n// Box & Whisker: Insert > Chart > Box & Whisker\n// Data: category column + numeric column\n// Shows: median, Q1, Q3, whiskers (min/max), outliers (dots)\n// Great for comparing distributions across categories",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a dynamic dashboard with multiple specialized charts\n// APPROACH  - Combo chart + funnel + map with formula-driven data\n// STRENGTHS - Professional dashboard; multiple chart types; interactive\n// WEAKNESSES- Complex setup; requires careful data organization\n\n// 1. Combo chart: Revenue (bars) + Margin % (line on secondary axis)\n// Data: Month | Revenue | Margin%\n// Insert > Chart > Combo > Clustered Column - Line on secondary axis\n// Check 'Secondary Axis' for Margin% series\n// Custom format: bars = blue, line = red with markers\n\n// 2. Funnel chart: Sales pipeline\n// Data: Stage | Count\n// Leads     | 1000\n// Qualified | 600\n// Demo      | 300\n// Proposal  | 150\n// Won       | 50\n// Insert > Chart > Funnel (Excel 2019+)\n\n// 3. Map chart: Revenue by state\n// Data: State | Revenue\n// TX | $500k\n// CA | $800k\n// NY | $600k\n// Insert > Chart > Map (requires Excel 365 or geographic data types)\n// Color intensity = revenue value\n\n// 4. Dynamic chart data with named ranges\n// Create named range that expands with data:\n// SalesData = OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A), 2)\n// Use in chart's Select Data: =Sheet1!SalesData\n// Chart auto-expands when new rows are added\n\n// 5. Chart template for reuse\n// Format chart perfectly > Right-click > Save as Template\n// Apply to new data: Insert > Chart > All Charts > Templates\n\n// 6. VBA to create chart programmatically\n// Sub CreateWaterfall()\n//   Dim ws As Worksheet, cht As Chart\n//   Set ws = ActiveSheet\n//   Set cht = ws.Shapes.AddChart2(, xlWaterfall, 100, 100, 400, 300).Chart\n//   cht.SetSourceData ws.Range(\"A1:B6\")\n//   cht.HasTitle = True\n//   cht.ChartTitle.Text = \"Profit Bridge\"\n// End Sub",
          },
        ],
        tips: [
          "Waterfall charts require Excel 2016+ — set 'Set as Total' on start/end bars to anchor them.",
          "Treemap shows 2-3 hierarchy levels; sunburst handles more but gets hard to read beyond 4 levels.",
          "Histogram auto-bins data — customize bin width via Format Axis for better granularity.",
          "Combo charts: use secondary axis for series with different scales (e.g., revenue $ vs margin %).",
          "Save formatted charts as templates (.crtx) for consistent styling across reports.",
        ],
        mistake: "Using a pie chart for more than 5 categories — pie charts become unreadable with many slices. Use a treemap or bar chart instead for multi-category comparisons.",
        shorthand: {
          verbose: "// Advanced chart types\n// Waterfall: Insert > Chart > Waterfall (financial bridge analysis)\n// Treemap: Insert > Chart > Treemap (hierarchical proportions)\n// Sunburst: Insert > Chart > Sunburst (multi-level hierarchy)\n// Histogram: Insert > Chart > Histogram (frequency distribution)\n// Combo: Insert > Chart > Combo (bars + line on secondary axis)\n// Map: Insert > Chart > Map (geographic data)\n// Funnel: Insert > Chart > Funnel (pipeline stages)",
          concise: "// Quick charts\n// Waterfall: financial bridge\n// Treemap: hierarchy as rectangles\n// Histogram: frequency distribution\n// Combo: two chart types, secondary axis",
        },
      },
    ],
  },

  // ── Section 7: Security, Protection & Collaboration ─────────────────────────────────────────
  {
    id: "security-collaboration",
    title: "Security, Protection & Collaboration",
    entries: [
      {
        id: "security-protection",
        fn: "Worksheet Protection & Security — lock cells, hide formulas, encrypt",
        desc: "Excel security features include cell locking, worksheet/workbook protection, formula hiding, password encryption, and collaboration controls.",
        category: "Security",
        subtitle: "protection, lock cells, hide formulas, password, encrypt, read-only, sheet protection, workbook protection, co-authoring",
        signature: "Review > Protect Sheet / Protect Workbook / Allow Edit Ranges",
        descLong: "Excel provides multiple layers of protection: (1) Cell locking — by default all cells are locked, but locking only takes effect when sheet protection is enabled. (2) Worksheet protection — prevents structural changes (insert/delete rows, format cells). (3) Workbook protection — prevents adding/deleting/reordering sheets. (4) Formula hiding — hide formulas in locked cells. (5) Allow Edit Ranges — specific ranges editable by certain users. (6) Password encryption — File > Info > Protect Workbook > Encrypt with Password. (7) Read-only mode — prevent all edits. (8) Co-authoring — real-time collaboration via OneDrive/SharePoint. Important: Excel passwords are not cryptographically strong — use Information Rights Management (IRM) for enterprise-grade protection.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Lock formula cells but allow input in data cells\n// APPROACH  - Unlock input cells, enable sheet protection\n// STRENGTHS - Prevents accidental formula deletion; allows data entry\n// WEAKNESSES- Password can be bypassed; not enterprise-grade security\n\n// Step 1: Select input cells (e.g., B2:B10) that users should edit\n// Step 2: Format Cells > Protection > Uncheck 'Locked'\n// Step 3: Review > Protect Sheet\n//   - Check: Select unlocked cells, Select locked cells\n//   - Uncheck: Format cells, Insert rows, Delete rows\n//   - Enter password (optional)\n// Step 4: Now users can edit B2:B10 but cannot modify formulas elsewhere\n\n// Hide formulas in protected cells:\n// Format Cells > Protection > Check 'Hidden'\n// Then enable sheet protection — formulas won't show in formula bar",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Set up role-based editing with Allow Edit Ranges\n// APPROACH  - Define editable ranges with password protection per range\n// STRENGTHS - Different teams edit different sections; controlled access\n// WEAKNESSES- Range passwords are separate from sheet password\n\n// Step 1: Review > Allow Edit Ranges\n// Step 2: New > Title: 'Sales Input', Range: $B$2:$B$100, Password: 'sales123'\n// Step 3: New > Title: 'Marketing Input', Range: $D$2:$D$50, Password: 'mkt456'\n// Step 4: Protect Sheet (enables the range permissions)\n\n// Now:\n// - Sales team enters 'sales123' to edit B2:B100\n// - Marketing team enters 'mkt456' to edit D2:D50\n// - All other cells are read-only\n\n// Workbook-level protection:\n// Review > Protect Workbook > Structure\n// Prevents: adding/deleting/hiding/moving worksheets\n// Does NOT prevent cell editing (that's sheet protection)\n\n// Read-only recommendation:\n// File > Info > Protect Workbook > Always Open Read-Only\n// Users see a prompt to open read-only or edit\n\n// Mark as Final (makes file read-only):\n// File > Info > Protect Workbook > Mark as Final",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a secure financial model with multi-layer protection\n// APPROACH  - VBA-driven protection + formula hiding + audit trail + IRM\n// STRENGTHS - Enterprise-grade; automated; audit trail\n// WEAKNESSES- VBA passwords are easily cracked; use IRM for true security\n\n// VBA: Auto-protect sheet on open, unlock specific cells\nPrivate Sub Workbook_Open()\n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets(\"Financial Model\")\n    \n    ' Unlock input cells\n    ws.Range(\"B2:B10,D2:D10\").Locked = False\n    \n    ' Hide formulas in calculation cells\n    ws.Range(\"E2:E100\").FormulaHidden = True\n    \n    ' Protect sheet with password\n    ws.Protect Password:=\"f!n@nci@l2024\", _\n        DrawingObjects:=True, _\n        Contents:=True, _\n        Scenarios:=True, _\n        AllowFormattingCells:=False, _\n        AllowInsertingRows:=False, _\n        AllowDeletingRows:=False, _\n        AllowSorting:=True, _\n        AllowFiltering:=True\n    \n    ' Protect workbook structure\n    ThisWorkbook.Protect Password:=\"struct2024\", Structure:=True\n    \n    ' Log access\n    Dim logWs As Worksheet\n    Set logWs = ThisWorkbook.Sheets(\"AccessLog\")\n    logWs.Unprotect Password:=\"log2024\"\n    logWs.Range(\"A\" & logWs.Rows.Count).End(xlUp).Offset(1).Value = _\n        Environ(\"USERNAME\") & \" | \" & Now()\n    logWs.Protect Password:=\"log2024\"\nEnd Sub\n\n// VBA: Macro to temporarily unprotect for admin edits\nSub AdminUnlock()\n    Dim pwd As String\n    pwd = InputBox(\"Enter admin password:\", \"Admin Access\")\n    If pwd = \"admin2024\" Then\n        ActiveSheet.Unprotect Password:=\"f!n@nci@l2024\"\n        MsgBox \"Sheet unlocked for editing. Re-protect when done.\", vbInformation\n    Else\n        MsgBox \"Incorrect password.\", vbExclamation\n    End If\nEnd Sub\n\n// Enterprise: Use Information Rights Management (IRM)\n// File > Info > Protect Workbook > Restrict Permission\n// Requires: Azure Information Protection (AIP) or Microsoft Purview\n// Features: expire document, prevent print, prevent copy, track access\n\n// Collaboration: Co-authoring via OneDrive/SharePoint\n// Save to OneDrive > Share > enter emails > Can Edit/Can View\n// Real-time co-editing: multiple users edit simultaneously\n// Version history: File > Info > Version History > restore previous versions",
          },
        ],
        tips: [
          "All cells are 'Locked' by default — but locking only works when sheet protection is enabled.",
          "Use 'Allow Edit Ranges' for role-based editing — different passwords for different cell ranges.",
          "Check 'Hidden' in Format Cells > Protection to hide formulas in the formula bar (requires sheet protection).",
          "Excel passwords are NOT cryptographically secure — use IRM (Azure Information Protection) for enterprise security.",
          "Co-authoring requires OneDrive/SharePoint — save to shared location and use Share button.",
        ],
        mistake: "Protecting the sheet without first unlocking input cells — users can't enter any data. Always unlock input cells (Format Cells > Protection > uncheck Locked) before enabling protection.",
        shorthand: {
          verbose: "// Protection steps\n// 1. Unlock input cells: Format Cells > Protection > uncheck Locked\n// 2. Hide formulas: Format Cells > Protection > check Hidden\n// 3. Protect sheet: Review > Protect Sheet > set password\n// 4. Allow Edit Ranges: Review > Allow Edit Ranges for role-based access\n// 5. Encrypt: File > Info > Protect Workbook > Encrypt with Password",
          concise: "// Quick protect\n// Unlock input cells > Review > Protect Sheet > password",
        },
      },
    ],
  },

  // ── Section 8: Power Query M Advanced ─────────────────────────────────────────
  {
    id: "pq-m-advanced",
    title: "Power Query M Advanced",
    entries: [
      {
        id: "pq-custom-functions",
        fn: "Power Query M — custom functions and error handling",
        desc: "Write reusable custom functions in M language with proper error handling, parameter validation, and complex transformations.",
        category: "Power Query",
        subtitle: "M language, custom function, let expression, try/otherwise, error handling, parameter, Table.TransformColumns",
        signature: "let fnName = (param1 as type, param2 as type) => let ... in result in fnName",
        descLong: "Power Query M supports user-defined functions for reusable transformations. M functions use the 'let .. in' pattern: define steps in 'let', return the final expression in 'in'. Key features: (1) Parameter typing — optional type annotations (as text, as number). (2) Error handling — try .. otherwise pattern for graceful failures. (3) Recursive functions — functions can call themselves with @ prefix. (4) Higher-order functions — pass functions as arguments (Table.TransformColumns, List.Transform). (5) Record and list manipulation — work with structured M types. Custom functions are essential for: reusable data cleaning logic, API pagination handling, custom date calculations, and complex conditional transformations that built-in functions can't handle.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Create a reusable function to clean phone numbers\n// APPROACH  - Define M function with parameter, use Text.Clean and Text.Trim\n// STRENGTHS - Reusable across queries; consistent transformations\n// WEAKNESSES- M syntax is unfamiliar; limited debugging\n\n// In Power Query > Advanced Editor:\nlet\n    CleanPhone = (raw as text) as text =>\n    let\n        // Remove all non-numeric characters\n        digits = Text.Select(raw, {\"0\"..\"9\"}),\n        // Format as (XXX) XXX-XXXX if 10 digits\n        formatted = if Text.Length(digits) = 10\n                    then \"(\" & Text.Start(digits, 3) & \") \" & Text.Middle(digits, 3, 3) & \"-\" & Text.End(digits, 4)\n                    else if Text.Length(digits) = 11 and Text.Start(digits, 1) = \"1\"\n                    then \"(\" & Text.Middle(digits, 1, 3) & \") \" & Text.Middle(digits, 4, 3) & \"-\" & Text.End(digits, 4)\n                    else raw\n    in\n        formatted\nin\n    CleanPhone\n\n// Usage in another query:\n// = Table.TransformColumns(Source, {\"Phone\", CleanPhone})",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Build a function with error handling and parameter validation\n// APPROACH  - Use try/otherwise for graceful error handling\n// STRENGTHS - Robust; handles bad data; returns fallback values\n// WEAKNESSES- Error messages may be swallowed by try/otherwise\n\nlet\n    SafeDivide = (numerator as nullable number, denominator as nullable number, optional fallback as nullable number) as nullable number =>\n    let\n        defaultFallback = if fallback = null then 0 else fallback,\n        result = try\n            if numerator = null or denominator = null or denominator = 0\n            then defaultFallback\n            else numerator / denominator\n        otherwise defaultFallback\n    in\n        result,\n\n    // Function to parse JSON column safely\n    SafeParseJSON = (jsonText as text) as record =>\n    let\n        parsed = try Json.Document(jsonText) otherwise null,\n        result = if parsed = null then [error = \"Invalid JSON\", raw = jsonText] else parsed\n    in\n        result,\n\n    // Function to get fiscal quarter from date\n    FiscalQuarter = (date as date, fiscalYearStart as number) as text =>\n    let\n        month = Date.Month(date),\n        adjustedMonth = if month >= fiscalYearStart then month - fiscalYearStart + 1 else 12 - fiscalYearStart + month + 1,\n        quarter = Number.RoundUp(adjustedMonth / 3),\n        fiscalYear = if month >= fiscalYearStart then Date.Year(date) + 1 else Date.Year(date)\n    in\n        \"FY\" & Text.From(fiscalYear) & \" Q\" & Text.From(quarter)\nin\n    SafeDivide\n\n// Usage:\n// = Table.AddColumn(Source, \"Ratio\", each SafeDivide([Numerator], [Denominator], 0))\n// = Table.AddColumn(Source, \"FiscalQ\", each FiscalQuarter([Date], 4))  // FY starts in April",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a recursive API pagination function with retry logic\n// APPROACH  - Recursive M function that fetches pages until no more data\n// STRENGTHS - Handles any API with pagination; retry on failure; production-grade\n// WEAKNESSES- Complex; requires understanding of recursion in M\n\nlet\n    FetchAllPages = (baseUrl as text, pageSize as number, optional maxRetries as number) as table =>\n    let\n        retries = if maxRetries = null then 3 else maxRetries,\n\n        // Single page fetch with retry\n        FetchPage = (page as number, attempt as number) as record =>\n            let\n                url = baseUrl & \"?page=\" & Text.From(page) & \"&size=\" & Text.From(pageSize),\n                response = try\n                    let\n                        src = Json.Document(Web.Contents(url, [Timeout = #duration(0,0,0,30)])),\n                        data = src[data],\n                        hasMore = src[has_more]?\n                    in\n                        [data = data, hasMore = hasMore, error = null]\n                otherwise\n                    if attempt < retries\n                    then @FetchPage(page, attempt + 1)  // retry\n                    else [data = {}, hasMore = false, error = \"Failed after \" & Text.From(retries) & \" attempts\"]\n            in\n                response,\n\n        // Recursive: fetch all pages\n        FetchAll = (page as number, acc as list) as list =>\n            let\n                result = FetchPage(page, 0),\n                newAcc = acc & result[data],\n                next = if result[hasMore] = true and result[error] = null\n                       then @FetchAll(page + 1, newAcc)\n                       else newAcc\n            in\n                next,\n\n        // Start fetching from page 1\n        allRecords = FetchAll(1, {}),\n        // Convert list of records to table\n        table = Table.FromRecords(allRecords)\n    in\n        table,\n\n    // Function to validate data quality\n    ValidateData = (table as table, rules as list) as table =>\n    let\n        // rules: list of [Column, Rule, Message]\n        // Rule is a function (value) => true/false\n        results = List.Transform(rules, (rule) =>\n            let\n                col = rule[Column],\n                check = rule[Rule],\n                msg = rule[Message],\n                violations = Table.SelectRows(table, each not check(Record.Field(_, col))),\n                flagged = Table.AddColumn(violations, \"Validation_Error\", each msg, type text)\n            in\n                flagged\n        ),\n        combined = Table.Combine(results)\n    in\n        combined\nin\n    FetchAllPages\n\n// Usage:\n// = FetchAllPages(\"https://api.example.com/users\", 100, 3)\n// = ValidateData(Source, {\n//     [Column=\"Email\", Rule=(v)=> v <> null and Text.Contains(v, \"@\"), Message=\"Invalid email\"],\n//     [Column=\"Age\", Rule=(v)=> v >= 0 and v <= 150, Message=\"Age out of range\"]\n//   })",
          },
        ],
        tips: [
          "M functions use (params) => let .. in .. syntax — the 'let' defines steps, 'in' returns the result.",
          "Use try .. otherwise for error handling — try returns a record with [HasError, Value, Message].",
          "Recursive functions must use @ prefix: @FunctionName(params) to reference themselves.",
          "Type annotations (as text, as number) are optional but help with IDE autocomplete and validation.",
          "Test functions in Power Query by invoking them: Home > Invoke Custom Function.",
        ],
        mistake: "Using if/else for error handling instead of try/otherwise — if/else will throw an error if the condition itself fails. Use try expression otherwise fallback for true error safety.",
        shorthand: {
          verbose: "// M custom function\nlet fn = (x as number) as number => let result = x * 2 in result in fn\n// With error handling\nlet safeFn = (x) => try x / 0 otherwise null in safeFn\n// Recursive: use @ prefix\nlet rec = (n) => if n <= 0 then 0 else n + @rec(n - 1) in rec",
          concise: "// Quick M function\nlet f = (x) => let r = x*2 in r in f",
        },
      },
    ],
  },

  // ── Section 9: VBA Database & ADO ─────────────────────────────────────────
  {
    id: "vba-database",
    title: "VBA Database & ADO",
    entries: [
      {
        id: "vba-ado-connections",
        fn: "VBA ADO — connect to SQL databases and execute queries",
        desc: "Use ADO (ActiveX Data Objects) in VBA to connect Excel to external databases (SQL Server, Oracle, MySQL), execute queries, and import results.",
        category: "VBA",
        subtitle: "ADO, ADODB, connection string, SQL Server, recordset, command, parameterized query, OLEDB, ODBC, database",
        signature: "Dim conn As New ADODB.Connection: conn.Open connectionString",
        descLong: "ADO (ActiveX Data Objects) is VBA's primary method for connecting to external databases. Key objects: (1) Connection — establishes database connection via OLEDB or ODBC. (2) Command — executes SQL with parameterized queries. (3) Recordset — holds query results, iterable row by row. (4) Parameters — prevents SQL injection in parameterized queries. Common use cases: pulling data from SQL Server into Excel, writing Excel data to a database, executing stored procedures, and building Excel-based frontends for databases. Requires adding reference: Tools > References > Microsoft ActiveX Data Objects 6.1 Library. Connection strings vary by database: SQL Server (Provider=SQLOLEDB or MSOLEDBSQL), Oracle (Provider=OraOLEDB.Oracle), MySQL (Provider=MSDASQL with ODBC DSN).",
        examples: [
          {
            tier: "intro",
            code: "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Connect to SQL Server and pull data into a worksheet\n' APPROACH  - Use ADODB.Connection and Recordset\n' STRENGTHS - Direct database access; no Power Query needed\n' WEAKNESSES- Requires VBA reference; slower than Power Query for large datasets\n\n' Tools > References > Microsoft ActiveX Data Objects 6.1 Library\n\nSub PullFromSQLServer()\n    Dim conn As New ADODB.Connection\n    Dim rs As New ADODB.Recordset\n    Dim connStr As String\n    Dim sql As String\n\n    ' Connection string (Windows Authentication)\n    connStr = \"Provider=MSOLEDBSQL;Server=MY_SERVER;Database=SalesDB;Trusted_Connection=yes;\"\n\n    ' SQL query\n    sql = \"SELECT * FROM Customers WHERE Country = 'USA'\"\n\n    ' Open connection and execute\n    conn.Open connStr\n    rs.Open sql, conn, adOpenStatic, adLockReadOnly\n\n    ' Write headers\n    Dim i As Integer\n    For i = 1 To rs.Fields.Count\n        Cells(1, i).Value = rs.Fields(i - 1).Name\n    Next i\n\n    ' Write data\n    Range(\"A2\").CopyFromRecordset rs\n\n    ' Cleanup\n    rs.Close\n    conn.Close\n    Set rs = Nothing\n    Set conn = Nothing\n\n    MsgBox \"Data imported successfully\", vbInformation\nEnd Sub",
          },
          {
            tier: "junior",
            code: "' === JUNIOR EXAMPLE ===\n' TASK      - Execute parameterized queries to prevent SQL injection\n' APPROACH  - Use ADODB.Command with Parameters\n' STRENGTHS - Prevents SQL injection; reusable; type-safe\n' WEAKNESSES- More verbose than inline SQL\n\nSub ExecuteParameterizedQuery()\n    Dim conn As New ADODB.Connection\n    Dim cmd As New ADODB.Command\n    Dim rs As ADODB.Recordset\n\n    conn.Open \"Provider=MSOLEDBSQL;Server=MY_SERVER;Database=SalesDB;Trusted_Connection=yes;\"\n\n    ' Use command with parameters\n    Set cmd.ActiveConnection = conn\n    cmd.CommandText = \"SELECT * FROM Orders WHERE CustomerID = ? AND OrderDate >= ?\"\n    cmd.CommandType = adCmdText\n\n    ' Add parameters (prevents SQL injection)\n    cmd.Parameters.Append cmd.CreateParameter(\"CustomerID\", adInteger, adParamInput, , Range(\"B1\").Value)\n    cmd.Parameters.Append cmd.CreateParameter(\"OrderDate\", adDate, adParamInput, , Range(\"B2\").Value)\n\n    ' Execute\n    Set rs = cmd.Execute\n\n    ' Write results\n    Range(\"A5\").CopyFromRecordset rs\n\n    ' Cleanup\n    rs.Close\n    conn.Close\n    Set cmd = Nothing\n    Set conn = Nothing\nEnd Sub\n\n' Execute stored procedure with output parameter\nSub ExecuteStoredProcedure()\n    Dim conn As New ADODB.Connection\n    Dim cmd As New ADODB.Command\n\n    conn.Open \"Provider=MSOLEDBSQL;Server=MY_SERVER;Database=SalesDB;Trusted_Connection=yes;\"\n\n    Set cmd.ActiveConnection = conn\n    cmd.CommandText = \"sp_GetSalesSummary\"\n    cmd.CommandType = adCmdStoredProc\n\n    ' Input parameter\n    cmd.Parameters.Append cmd.CreateParameter(\"@Year\", adInteger, adParamInput, , 2024)\n    ' Output parameter\n    cmd.Parameters.Append cmd.CreateParameter(\"@TotalSales\", adCurrency, adParamOutput, 8)\n\n    cmd.Execute\n\n    ' Read output parameter\n    Range(\"A1\").Value = \"Total Sales: \" & cmd.Parameters(\"@TotalSales\").Value\n\n    conn.Close\n    Set cmd = Nothing\n    Set conn = Nothing\nEnd Sub",
          },
          {
            tier: "senior",
            code: "' === SENIOR EXAMPLE ===\n' TASK      - Build a reusable database access class with error handling\n' APPROACH  - Class module with connection management, query execution, transactions\n' STRENGTHS - Reusable; production-grade; transaction support; error handling\n' WEAKNESSES- Complex; requires class module setup\n\n' Class module: clsDatabase\n' ---\nPrivate m_conn As ADODB.Connection\nPrivate m_connStr As String\n\n' Constructor\nPublic Sub Initialize(connString As String)\n    m_connStr = connString\nEnd Sub\n\n' Open connection\nPublic Sub Connect()\n    On Error GoTo ErrHandler\n    If m_conn Is Nothing Then Set m_conn = New ADODB.Connection\n    If m_conn.State = adStateClosed Then\n        m_conn.Open m_connStr\n        m_conn.CommandTimeout = 30\n    End If\n    Exit Sub\nErrHandler:\n    Err.Raise vbObjectError + 1, \"clsDatabase.Connect\", _\n        \"Failed to connect: \" & Err.Description\nEnd Sub\n\n' Execute query, return recordset\nPublic Function Query(sql As String) As ADODB.Recordset\n    On Error GoTo ErrHandler\n    Me.Connect\n    Dim rs As New ADODB.Recordset\n    rs.Open sql, m_conn, adOpenStatic, adLockReadOnly\n    Set Query = rs\n    Exit Function\nErrHandler:\n    Err.Raise vbObjectError + 2, \"clsDatabase.Query\", _\n        \"Query failed: \" & Err.Description & vbCrLf & \"SQL: \" & sql\nEnd Function\n\n' Execute parameterized query\nPublic Function QueryParams(sql As String, ParamArray params() As Variant) As ADODB.Recordset\n    Me.Connect\n    Dim cmd As New ADODB.Command\n    Set cmd.ActiveConnection = m_conn\n    cmd.CommandText = sql\n    cmd.CommandType = adCmdText\n\n    Dim i As Integer\n    For i = LBound(params) To UBound(params)\n        cmd.Parameters.Append cmd.CreateParameter(\"p\" & i, adVariant, adParamInput, , params(i))\n    Next i\n\n    Set QueryParams = cmd.Execute\nEnd Function\n\n' Execute non-query (INSERT/UPDATE/DELETE)\nPublic Function Execute(sql As String) As Long\n    On Error GoTo ErrHandler\n    Me.Connect\n    Dim affected As Long\n    m_conn.Execute sql, affected\n    Execute = affected\n    Exit Function\nErrHandler:\n    Err.Raise vbObjectError + 3, \"clsDatabase.Execute\", _\n        \"Execute failed: \" & Err.Description\nEnd Function\n\n' Transaction support\nPublic Sub BeginTransaction(): m_conn.BeginTrans: End Sub\nPublic Sub CommitTransaction(): m_conn.CommitTrans: End Sub\nPublic Sub RollbackTransaction(): m_conn.RollbackTrans: End Sub\n\n' Close\nPublic Sub Close()\n    If Not m_conn Is Nothing Then\n        If m_conn.State = adStateOpen Then m_conn.Close\n    End If\nEnd Sub\n\n' --- Usage in a module ---\nSub DemoDatabaseClass()\n    Dim db As New clsDatabase\n    db.Initialize \"Provider=MSOLEDBSQL;Server=SQL01;Database=Sales;Trusted_Connection=yes;\"\n\n    On Error GoTo Cleanup\n\n    ' Query with parameters\n    Dim rs As ADODB.Recordset\n    Set rs = db.QueryParams( _\n        \"SELECT * FROM Orders WHERE Amount > ? AND Status = ?\", 1000, \"Pending\")\n    Sheet1.Range(\"A2\").CopyFromRecordset rs\n\n    ' Transaction: insert multiple records\n    db.BeginTransaction\n    db.Execute \"INSERT INTO AuditLog (Action, User) VALUES ('Update', '\" & Environ(\"USERNAME\") & \"')\"\n    db.Execute \"UPDATE Orders SET Status = 'Processed' WHERE OrderDate < '2024-01-01'\"\n    db.CommitTransaction\n\nCleanup:\n    db.Close\n    If Err.Number <> 0 Then MsgBox \"Error: \" & Err.Description, vbCritical\nEnd Sub",
          },
        ],
        tips: [
          "Add reference: Tools > References > Microsoft ActiveX Data Objects 6.1 Library.",
          "Always use parameterized queries (ADODB.Command) — never concatenate user input into SQL strings.",
          "Use CopyFromRecordset to bulk-write data to a range — much faster than looping row by row.",
          "Connection strings: SQL Server = MSOLEDBSQL, Oracle = OraOLEDB.Oracle, MySQL = MSDASQL + ODBC DSN.",
          "Close connections and set objects to Nothing — VBA doesn't garbage collect COM objects automatically.",
        ],
        mistake: "Concatenating user input directly into SQL strings — this enables SQL injection. Always use ADODB.Command with CreateParameter for user-supplied values.",
        shorthand: {
          verbose: "' VBA ADO: connect and query\nDim c As New ADODB.Connection, r As ADODB.Recordset\nc.Open \"Provider=MSOLEDBSQL;Server=S;Database=D;Trusted_Connection=yes;\"\nSet r = c.Execute(\"SELECT * FROM t\")\nRange(\"A2\").CopyFromRecordset r\nr.Close: c.Close",
          concise: "' Quick ADO\nDim c As New ADODB.Connection: c.Open connStr: Range(\"A2\").CopyFromRecordset c.Execute(\"SELECT * FROM t\"): c.Close",
        },
      },
    ],
  },

  // ── Section 10: Excel Data Types & Formula Auditing ─────────────────────────────────────────
  {
    id: "data-types-auditing",
    title: "Excel Data Types & Formula Auditing",
    entries: [
      {
        id: "excel-data-types",
        fn: "Linked Data Types — Stocks, Geography, and Organizations",
        desc: "Excel's linked data types (Stocks, Geography) pull rich structured data from Microsoft's cloud — company info, stock prices, city demographics — directly into cells.",
        category: "Data",
        subtitle: "linked data type, Stocks, Geography, Organizations, rich data, DATAFIELD, field extraction, auto-refresh",
        signature: "Type text in cell > Data > Stocks / Geography > click card icon to extract fields",
        descLong: "Excel's linked data types convert plain text into structured, queryable data objects connected to Microsoft's cloud knowledge base. Available types: (1) Stocks — type a ticker symbol (AAPL) or company name, convert to Stock data type, extract fields like Price, Market Cap, P/E Ratio, Sector. (2) Geography — type a country/state/city, convert to Geography data type, extract fields like Population, Area, Capital, GDP. (3) Organizations (Microsoft 365) — company data from LinkedIn. Key features: (1) Auto-refresh — data updates from the cloud. (2) Field extraction — click the card icon or use =cell.FIELD() to pull specific attributes. (3) Data cards — hover to see all available fields in a popup. (4) Formula access — use FIELDVALUE() or dot notation (A1.Price). Requires Excel 365 or Excel 2019+.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Get live stock prices for a portfolio\n// APPROACH  - Type tickers, convert to Stock data type, extract Price field\n// STRENGTHS - Live data; no manual lookup; auto-refreshable\n// WEAKNESSES- Requires Excel 365; internet connection needed\n\n// Step 1: Enter ticker symbols in A1:A5\n// AAPL\n// MSFT\n// GOOGL\n// AMZN\n// TSLA\n\n// Step 2: Select A1:A5 > Data > Stocks\n// Cells now show a small building icon (linked data type)\n\n// Step 3: Click the icon in A1 > select Price\n// Or use formula:\n=A1.Price          // Returns current stock price\n\n// Step 4: Extract multiple fields\n// B1: =A1.Price\n// C1: =A1.[Market Cap]\n// D1: =A1.[P/E Ratio]\n// E1: =A1.Sector\n// F1: =A1.[52 Week High]\n\n// Step 5: Refresh data: Data > Refresh All\n// Stock prices update from Microsoft's cloud",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Build a geographic dashboard with population and area data\n// APPROACH  - Convert city names to Geography data type, extract fields\n// STRENGTHS - Rich demographic data; auto-refresh; no manual research\n// WEAKNESSES- Not all cities are recognized; data may be delayed\n\n// Step 1: Enter cities in A1:A10\n// New York\n// Los Angeles\n// Chicago\n// Houston\n// Phoenix\n\n// Step 2: Select A1:A10 > Data > Geography\n\n// Step 3: Extract fields\n// B1: =A1.Population\n// C1: =A1.Area           // square miles\n// D1: =A1.[Population]/A1.Area  // population density\n// E1: =A1.[Time Zone]\n// F1: =A1.[Mayor]\n\n// Step 4: Create a summary table\n// Use GROUPBY on the geography data:\n=GROUPBY(A1:A10, B1:B10, SUM, 3)\n// Shows total population across all cities\n\n// Step 5: Conditional formatting on population\n// Select B1:B10 > Conditional Formatting > Data Bars\n// Visual comparison of city populations",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a stock portfolio tracker with live data and calculations\n// APPROACH  - Stock data type + dynamic arrays + LAMBDA for portfolio metrics\n// STRENGTHS - Live data; auto-calculating; professional-grade\n// WEAKNESSES- Requires Excel 365; data has 15-min delay\n\n// Portfolio table (A1:E10):\n// Symbol | Shares | BuyPrice |         |         \n// AAPL   | 100    | $150     |         |\n// MSFT   | 50     | $300     |         |\n// ...\n\n// Step 1: Convert symbols to Stock data type\n// Select A2:A10 > Data > Stocks\n\n// Step 2: Extract live price and calculate P&L\n// E2: =A2.Price * B2                           // Current Value\n// F2: =E2 - (C2 * B2)                          // P&L ($)\n// G2: =F2 / (C2 * B2)                          // P&L (%)\n\n// Step 3: Portfolio summary with dynamic arrays\n// Total Value: =SUM(E2:E10)\n// Total P&L:   =SUM(F2:F10)\n// Best Performer: =INDEX(A2:A10, MATCH(MAX(G2:G10), G2:G10, 0))\n// Worst Performer: =INDEX(A2:A10, MATCH(MIN(G2:G10), G2:G10, 0))\n\n// Step 4: Sector allocation with GROUPBY\n=GROUPBY(\n  CHOOSECOLS(A2:A10, 1).Sector,  // extract sector from stock type\n  E2:E10,                         // current values\n  SUM, 3, 0, -2                   // sorted by value descending\n)\n\n// Step 5: LAMBDA for portfolio metrics\n=LAMBDA(symbols, shares, buyPrices,\n  LET(\n    prices, symbols.Price,\n    values, prices * shares,\n    cost, buyPrices * shares,\n    pnl, values - cost,\n    totalValue, SUM(values),\n    totalPnL, SUM(pnl),\n    totalReturn, totalPnL / SUM(cost),\n    HSTACK(\n      \"Total Value\", totalValue,\n      \"Total P&L\", totalPnL,\n      \"Return %\", totalReturn\n    )\n  )\n)\n// Save as: PortfolioSummary\n// Usage: =PortfolioSummary(A2:A10, B2:B10, C2:C10)\n\n// Step 6: Auto-refresh with VBA\n// Sub RefreshStockData()\n//   ThisWorkbook.RefreshAll\n//   Application.OnTime Now + TimeValue(\"00:15:00\"), \"RefreshStockData\"\n// End Sub",
          },
        ],
        tips: [
          "Stock data has a 15-minute delay — not suitable for real-time trading.",
          "Use dot notation (A1.Price) or FIELDVALUE(A1, \"Price\") to extract fields from linked data types.",
          "Not all entities are recognized — try alternative names (e.g., 'United States' vs 'USA').",
          "Refresh data with Data > Refresh All or Ctrl+Alt+F5 to get latest values.",
          "Geography data includes population, area, time zone, and more — great for demographic analysis.",
        ],
        mistake: "Expecting real-time stock prices from the Stocks data type — data is delayed by 15 minutes. Use a real-time API (e.g., via Power Query) for live trading data.",
        shorthand: {
          verbose: "// Linked data types\n// Stocks: type ticker > Data > Stocks > =A1.Price, =A1.[Market Cap]\n// Geography: type city > Data > Geography > =A1.Population, =A1.Area\n// Refresh: Data > Refresh All (Ctrl+Alt+F5)",
          concise: "// Quick data types\n// Stocks: Data > Stocks > =A1.Price\n// Geography: Data > Geography > =A1.Population",
        },
      },
      {
        id: "formula-auditing",
        fn: "Formula Auditing — trace errors, precedents, and dependents",
        desc: "Excel's formula auditing tools help debug complex spreadsheets by tracing precedents (cells feeding into a formula), dependents (cells using a formula), and error sources.",
        category: "Tools",
        subtitle: "formula auditing, trace precedents, trace dependents, error checking, evaluate formula, watch window, circular reference",
        signature: "Formulas > Trace Precedents / Trace Dependents / Error Checking / Evaluate Formula",
        descLong: "Formula auditing is essential for debugging complex Excel models. Key tools: (1) Trace Precedents — draws arrows showing which cells feed into the selected formula. (2) Trace Dependents — shows which cells depend on the selected cell. (3) Remove Arrows — clears all tracing arrows. (4) Error Checking — finds and explains errors in the worksheet (#DIV/0!, #N/A, #REF!, etc.). (5) Evaluate Formula — step through a formula calculation one operation at a time. (6) Watch Window — monitor cell values from anywhere in the workbook. (7) Show Formulas — toggle between displaying formulas and results (Ctrl+`). These tools are critical for: debugging broken models, understanding inherited spreadsheets, finding circular references, and verifying formula correctness.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Debug a #DIV/0! error in a formula\n// APPROACH  - Use Trace Precedents and Error Checking\n// STRENGTHS - Visual arrows show data flow; identifies root cause\n// WEAKNESSES- Arrows can be confusing in very large sheets\n\n// Cell D10 shows #DIV/0!\n// Formula: =B10/C10\n\n// Step 1: Select D10 > Formulas > Error Checking\n// Excel explains: 'The formula or function used is dividing by zero or empty cells.'\n\n// Step 2: Select D10 > Formulas > Trace Precedents\n// Blue arrows appear from B10 and C10 to D10\n// C10 is empty or 0 — that's the cause\n\n// Step 3: Fix with IFERROR\n// =IFERROR(B10/C10, 0) or =IF(C10=0, 0, B10/C10)\n\n// Step 4: Remove arrows: Formulas > Remove Arrows\n\n// Show all formulas: Ctrl + ` (backtick)\n// Toggle back to results: Ctrl + ` again",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Audit a complex financial model for broken links\n// APPROACH  - Use Trace Dependents, Watch Window, and Evaluate Formula\n// STRENGTHS - Step-by-step debugging; monitors cells across sheets\n// WEAKNESSES- Manual process; large models take time\n\n// Step 1: Find all errors in the sheet\n// Formulas > Error Checking > Error Checking (dialog)\n// Shows first error with explanation and options:\n// - Help on this error\n// - Show Calculation Steps (Evaluate Formula)\n// - Ignore Error\n// - Edit in Formula Bar\n// Click 'Next' to cycle through all errors\n\n// Step 2: Trace dependents of a key input cell\n// Select B1 (Revenue assumption) > Formulas > Trace Dependents\n// Arrows show all cells that use B1 — across sheets if needed\n// Double-click arrow to navigate to dependent on another sheet\n\n// Step 3: Watch Window for monitoring key cells\n// Formulas > Watch Window > Add Watch\n// Add cells: B1 (Revenue), D10 (Profit), G5 (Margin %)\n// Watch Window shows: Book, Sheet, Name, Cell, Value, Formula\n// Floats on top — monitor while navigating other sheets\n\n// Step 4: Evaluate Formula step-by-step\n// Select complex formula cell > Formulas > Evaluate Formula\n// Click 'Evaluate' to step through each operation:\n// =IF(SUM(B2:B10)>1000, VLOOKUP(C2,D:E,2,FALSE), 0)\n// Step 1: SUM(B2:B10) → 1500\n// Step 2: 1500 > 1000 → TRUE\n// Step 3: VLOOKUP(C2,D:E,2,FALSE) → \"Premium\"\n// Step 4: IF(TRUE, \"Premium\", 0) → \"Premium\"\n\n// Step 5: Find circular references\n// Status bar shows 'Circular References: C5'\n// Formulas > Error Checking > Circular References\n// Fix: remove the self-referencing formula",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a comprehensive audit toolkit for inherited spreadsheets\n// APPROACH  - VBA macros for automated auditing + manual verification\n// STRENGTHS - Automated; thorough; documents findings\n// WEAKNESSES- Requires VBA; large models take time to audit\n\n' VBA: Find all errors and broken links\nSub AuditWorkbook()\n    Dim ws As Worksheet, cell As Range\n    Dim errorCount As Long, linkCount As Long\n    Dim reportWs As Worksheet\n\n    ' Create report sheet\n    Set reportWs = ThisWorkbook.Sheets.Add\n    reportWs.Name = \"Audit_Report_\" & Format(Now, \"yyyymmdd_hhmmss\")\n    reportWs.Range(\"A1:D1\") = Array(\"Sheet\", \"Cell\", \"Formula\", \"Issue\")\n\n    ' Check each sheet\n    For Each ws In ThisWorkbook.Worksheets\n        If ws.Name <> reportWs.Name Then\n            ' Find errors\n            For Each cell In ws.UsedRange\n                If IsError(cell.Value) Then\n                    errorCount = errorCount + 1\n                    reportWs.Cells(errorCount + 1, 1) = ws.Name\n                    reportWs.Cells(errorCount + 1, 2) = cell.Address\n                    reportWs.Cells(errorCount + 1, 3) = \"'\" & cell.Formula\n                    reportWs.Cells(errorCount + 1, 4) = \"Error: \" & cell.Text\n                End If\n\n                ' Find external links\n                If InStr(cell.Formula, \"[\") > 0 Or InStr(cell.Formula, \"'\") > 0 Then\n                    If InStr(cell.Formula, ThisWorkbook.Name) = 0 Then\n                        linkCount = linkCount + 1\n                        r = errorCount + linkCount + 1\n                        reportWs.Cells(r, 1) = ws.Name\n                        reportWs.Cells(r, 2) = cell.Address\n                        reportWs.Cells(r, 3) = \"'\" & cell.Formula\n                        reportWs.Cells(r, 4) = \"External link\"\n                    End If\n                End If\n            Next cell\n        End If\n    Next ws\n\n    ' Summary\n    reportWs.Range(\"A1:D1\").Font.Bold = True\n    reportWs.Columns.AutoFit\n    MsgBox \"Audit complete: \" & errorCount & \" errors, \" & linkCount & \" external links found\", vbInformation\nEnd Sub\n\n' VBA: List all named ranges and their references\nSub ListNamedRanges()\n    Dim nm As Name, ws As Worksheet\n    Set ws = ThisWorkbook.Sheets.Add\n    ws.Name = \"NamedRanges\"\n    ws.Range(\"A1:C1\") = Array(\"Name\", \"RefersTo\", \"Scope\")\n    ws.Range(\"A1:C1\").Font.Bold = True\n\n    Dim i As Integer: i = 1\n    For Each nm In ThisWorkbook.Names\n        i = i + 1\n        ws.Cells(i, 1) = nm.Name\n        ws.Cells(i, 2) = \"'\" & nm.RefersTo\n        ws.Cells(i, 3) = IIf(InStr(nm.Name, \"!\") > 0, \"Worksheet\", \"Workbook\")\n    Next nm\n    ws.Columns.AutoFit\nEnd Sub\n\n' VBA: Check for hardcoded numbers in formulas (potential issues)\nSub FindHardcodedValues()\n    Dim ws As Worksheet, cell As Range, r As Long\n    Set ws = ThisWorkbook.Sheets.Add\n    ws.Name = \"HardcodedValues\"\n    ws.Range(\"A1:C1\") = Array(\"Sheet\", \"Cell\", \"Formula\")\n    ws.Range(\"A1:C1\").Font.Bold = True\n    r = 1\n\n    For Each ws In ThisWorkbook.Worksheets\n        If ws.Name <> \"HardcodedValues\" Then\n            For Each cell In ws.UsedRange\n                If cell.HasFormula Then\n                    ' Check for hardcoded numbers (not 0, 1, 100)\n                    If InStr(cell.Formula, \"+123\") > 0 Or _\n                       InStr(cell.Formula, \"*12\") > 0 Or _\n                       InStr(cell.Formula, \"/1000\") > 0 Then\n                        r = r + 1\n                        ws.Cells(r, 1) = ws.Name\n                        ws.Cells(r, 2) = cell.Address\n                        ws.Cells(r, 3) = \"'\" & cell.Formula\n                    End If\n                End If\n            Next cell\n        End If\n    Next ws\n    ws.Columns.AutoFit\nEnd Sub",
          },
        ],
        tips: [
          "Use Ctrl+` (backtick) to toggle between showing formulas and results — quick overview of all formulas.",
          "Trace Precedents draws blue arrows for normal references, red arrows for error sources.",
          "Double-click a tracing arrow to jump to the precedent/dependent cell, even on another sheet.",
          "Watch Window is invaluable for monitoring key cells while navigating large workbooks.",
          "Evaluate Formula (Alt+T+U+E) steps through calculations one operation at a time — best for complex nested formulas.",
        ],
        mistake: "Ignoring circular reference warnings — circular references cause incorrect calculations and can crash Excel. Always resolve them: Formulas > Error Checking > Circular References.",
        shorthand: {
          verbose: "// Formula auditing\n// Trace Precedents: Formulas > Trace Precedents (blue arrows show source cells)\n// Trace Dependents: Formulas > Trace Dependents (arrows show using cells)\n// Evaluate: Formulas > Evaluate Formula (step through calculation)\n// Watch: Formulas > Watch Window (monitor cells across sheets)\n// Show formulas: Ctrl + ` (backtick)\n// Error check: Formulas > Error Checking",
          concise: "// Quick audit\n// Ctrl+` = show formulas\n// Formulas > Trace Precedents > find source of errors",
        },
      },
    ],
  },

  // ── Section 11: PivotTable Advanced & Custom Formats ─────────────────────────────────────────
  {
    id: "pivot-formats",
    title: "PivotTable Advanced & Custom Formats",
    entries: [
      {
        id: "pivot-grouping-calc-items",
        fn: "PivotTable Grouping & Calculated Items — advanced analysis",
        desc: "PivotTable grouping (date/numeric ranges), calculated fields, and calculated items enable custom aggregations and derived dimensions without modifying source data.",
        category: "PivotTables",
        subtitle: "PivotTable, grouping, date grouping, numeric bins, calculated field, calculated item, GETPIVOTDATA, custom aggregation",
        signature: "PivotTable Analyze > Group Field / Fields, Items & Sets > Calculated Field",
        descLong: "PivotTable advanced features extend analysis beyond basic drag-and-drop: (1) Date grouping — group dates by year, quarter, month, or custom date ranges without helper columns. (2) Numeric grouping — bin numeric values into ranges (0-100, 101-200, etc.). (3) Calculated fields — create new fields using arithmetic on existing fields (e.g., Profit = Revenue - Cost). (4) Calculated items — create new items within a field (e.g., 'North Region' = North East + North West). (5) Custom sets — define reusable groupings of items. (6) GETPIVOTDATA — extract specific values from a PivotTable via formula. These features avoid modifying source data and update dynamically when the PivotTable refreshes. Key limitations: calculated fields can't reference cell ranges or use most Excel functions; calculated items can't be used in grouped fields.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Group sales dates by quarter and year in a PivotTable\n// APPROACH  - Right-click date field > Group > select Year and Quarter\n// STRENGTHS - No helper columns needed; auto-updates\n// WEAKNESSES- Grouping is fixed; can't use calculated items on grouped fields\n\n// Step 1: Create PivotTable from Sales data\n//   Rows: Date\n//   Values: Sum of Amount\n\n// Step 2: Right-click any date in Row labels > Group\n// Step 3: Select: Years, Quarters (deselect Months)\n// Step 4: Click OK\n\n// Result:\n// 2024\n//   Q1  | $45,000\n//   Q2  | $52,000\n//   Q3  | $38,000\n//   Q4  | $61,000\n// 2024 Total | $196,000\n\n// Numeric grouping: right-click numeric field > Group\n// Starting at: 0, Ending at: 1000, By: 100\n// Creates bins: 0-100, 100-200, 200-300, ...",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Create calculated fields and calculated items for custom analysis\n// APPROACH  - Use PivotTable Analyze > Fields, Items & Sets\n// STRENGTHS - Custom calculations within PivotTable; dynamic\n// WEAKNESSES- Limited to basic arithmetic; no cell references\n\n// Calculated Field: Profit Margin\n// PivotTable Analyze > Fields, Items & Sets > Calculated Field\n// Name: Profit Margin\n// Formula: = (Revenue - Cost) / Revenue\n// (Use field names from the field list, not cell references)\n\n// Calculated Item: Premium Products\n// Select Product field in PivotTable > Analyze > Fields, Items & Sets > Calculated Item\n// Name: Premium Products\n// Formula: = 'Product A' + 'Product B' + 'Product C'\n\n// Now PivotTable shows:\n// Product       | Revenue | Profit Margin\n// Product A     | $50,000 | 35%\n// Product B     | $30,000 | 42%\n// Product C     | $20,000 | 38%\n// Premium Products | $100,000 | 37%\n// Other Products   | $45,000 | 28%\n// Grand Total      | $145,000 | 33%\n\n// GETPIVOTDATA: extract specific values\n// =GETPIVOTDATA(\"Revenue\", $A$3, \"Product\", \"Product A\", \"Year\", 2024)\n// Returns: 50000 (Revenue for Product A in 2024)\n\n// Disable GETPIVOTDATA auto-generation:\n// PivotTable Analyze > Options > Generate GetPivotData (uncheck)",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a dynamic KPI dashboard with PivotTable + GETPIVOTDATA + charts\n// APPROACH  - Multiple PivotTables + GETPIVOTDATA formulas + dynamic charts\n// STRENGTHS - Production-grade; auto-updating; no VBA needed\n// WEAKNESSES- Many PivotTables can slow large workbooks\n\n// Step 1: Create multiple PivotTables from same source\n// PT1: Sales by Region × Product (matrix view)\n// PT2: Sales by Month (trend view)\n// PT3: Top 10 Customers (ranking view)\n// PT4: Sales by SalesRep with calculated field for Commission\n\n// Step 2: Calculated field for commission\n// = Revenue * 0.05  (5% commission rate)\n\n// Step 3: KPI cells using GETPIVOTDATA\n// B2: Total Revenue\n//   =GETPIVOTDATA(\"Revenue\", PT1!$A$3)\n// B3: Target Revenue\n//   =500000  (hardcoded target)\n// B4: Achievement %\n//   =B2/B3\n// B5: Status\n//   =IF(B4>=1, \"On Track\", IF(B4>=0.9, \"At Risk\", \"Behind\"))\n\n// Step 6: Dynamic chart from PivotTable\n// Insert PivotChart from PT2 (Sales by Month)\n// Chart auto-updates when PivotTable refreshes\n// Add trendline: Chart Design > Add Chart Element > Trendline > Linear\n\n// Step 7: VBA to refresh all and update dashboard\nSub RefreshDashboard()\n    Dim pt As PivotTable\n    ' Refresh all PivotTables\n    For Each ws In ThisWorkbook.Worksheets\n        For Each pt In ws.PivotTables\n            pt.RefreshTable\n        Next pt\n    Next ws\n    ' Refresh all data connections\n    ThisWorkbook.RefreshAll\n    ' Update timestamp\n    Sheets(\"Dashboard\").Range(\"Last_Updated\").Value = Now()\nEnd Sub\n\n// Step 8: Report Filter with slicer connection\n// Insert Slicer on Region field > Report Connections\n// Connect slicer to all 4 PivotTables\n// Clicking a region updates all PivotTables simultaneously",
          },
        ],
        tips: [
          "Date grouping: right-click date > Group > select Year, Quarter, Month — no helper columns needed.",
          "Calculated fields use field names, not cell references: =Revenue - Cost, not =B2-C2.",
          "Calculated items can't be used in grouped fields — group first or calculate items, not both.",
          "GETPIVOTDATA is auto-generated when referencing PivotTable cells — disable in Options if unwanted.",
          "Connect slicers to multiple PivotTables via Report Connections for synchronized filtering.",
        ],
        mistake: "Creating a calculated field that divides by a sum (e.g., =SUM(Revenue)/SUM(Cost)) — calculated fields compute per-row first, then aggregate. Use =Revenue/Cost for per-row ratio, or create a measure in Power Pivot for correct aggregate ratios.",
        shorthand: {
          verbose: "// PivotTable advanced\n// Group dates: right-click date > Group > Year, Quarter\n// Calculated field: Analyze > Fields, Items & Sets > Calculated Field: =Revenue-Cost\n// Calculated item: Analyze > Fields, Items & Sets > Calculated Item: ='Item A'+'Item B'\n// GETPIVOTDATA: =GETPIVOTDATA(\"Revenue\", $A$3, \"Product\", \"A\")",
          concise: "// Quick pivot advanced\n// Group: right-click > Group\n// Calc field: Analyze > Calculated Field: =Rev-Cost",
        },
      },
      {
        id: "custom-number-formats",
        fn: "Custom Number Formats — precision formatting and conditional display",
        desc: "Custom number formats control how numbers display without changing underlying values — including conditional colors, text labels, thousands separators, and special formats.",
        category: "Formatting",
        subtitle: "custom format, number format, conditional color, thousands, millions, text label, positive negative zero, format codes",
        signature: "Format Cells > Number > Custom: [>=1000]#,##0,\"K\";[<0]Red;0.00",
        descLong: "Custom number formats use semicolons to define up to four sections: positive;negative;zero;text. Each section uses format codes: # (digit placeholder), 0 (always show), , (thousands separator), . (decimal), % (percentage), [color] (conditional color), [condition] (custom conditions), @ (text placeholder). Key patterns: (1) Thousands/millions: #,##0,\"K\" or #,##0,,\"M\". (2) Conditional colors: [Red][<0]#,##0;[Blue][>=1000]#,##0;[Green]0. (3) Text labels: #,##0\" units\" or $#,##0\" USD\". (4) Phone numbers: (000) 000-0000. (5) Date/time: yyyy-mm-dd hh:mm:ss. (6) Leading zeros: 000000 (6-digit ID). Custom formats change display only — the underlying value is unchanged for calculations.",
        examples: [
          {
            tier: "intro",
            code: "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Format numbers with thousands/millions suffixes\n// APPROACH  - Use custom number format with comma placeholders\n// STRENGTHS - Compact display; underlying value preserved\n// WEAKNESSES- Custom formats can be confusing to read\n\n// Format: #,##0,\"K\"\n// 1234    → 1K\n// 12345   → 12K\n// 1234567 → 1,235K\n\n// Format: #,##0,,\"M\"\n// 1234567    → 0M\n// 12345678   → 12M\n// 1234567890 → 1,235M\n\n// Format: $#,##0.00\" USD\"\n// 1234.5 → $1,234.50 USD\n\n// Format: 000000\n// 123 → 000123  (leading zeros, 6-digit ID)\n\n// Format: (000) 000-0000\n// 5551234567 → (555) 123-4567  (phone number)\n\n// Apply: Format Cells (Ctrl+1) > Number > Custom > type format code",
          },
          {
            tier: "junior",
            code: "// === JUNIOR EXAMPLE ===\n// TASK      - Create conditional formats with colors and text labels\n// APPROACH  - Use 4-section format: positive;negative;zero;text\n// STRENGTHS - Color-coded; no conditional formatting needed; display only\n// STRENGTHS - Color-coded; no conditional formatting needed; display only\n// WEAKNESSES- Limited to 2 conditions + default; colors are fixed set\n\n// Positive green, negative red, zero dash\n// Format: [Green]#,##0;[Red]-#,##0;\"—\"\n// 1234  → 1,234 (green)\n// -500  → -500 (red)\n// 0     → — (dash)\n\n// Conditional: values >= 1000 in blue, < 1000 in black\n// Format: [Blue][>=1000]#,##0;[Black][<1000]#,##0\n// 1500 → 1,500 (blue)\n// 800  → 800 (black)\n\n// Percentage with text\n// Format: 0.0%\" complete\"\n// 0.85 → 85.0% complete\n\n// Currency with negative in parentheses (accounting style)\n// Format: $#,##0.00_);($#,##0.00)\n// 1234.5  → $1,234.50\n// -1234.5 → ($1,234.50)\n\n// Date with day name\n// Format: ddd, mmm dd, yyyy\n// 45200 → Mon, Jan 01, 2024\n\n// Time with AM/PM\n// Format: h:mm AM/PM\n// 0.5 → 12:00 PM",
          },
          {
            tier: "senior",
            code: "// === SENIOR EXAMPLE ===\n// TASK      - Build a financial reporting format system with VBA\n// APPROACH  - VBA to apply custom formats based on cell context\n// STRENGTHS - Automated; consistent; handles complex format logic\n// WEAKNESSES- Requires VBA; format codes are hard to maintain\n\n' VBA: Apply standard financial formats\nSub ApplyFinancialFormats()\n    Dim ws As Worksheet\n    Set ws = ActiveSheet\n\n    ' Revenue: $#,##0\"K\" (thousands)\n    ws.Range(\"Revenue\").NumberFormat = \"$#,##0,\"\"K\"\"\"\n\n    ' Margin: 0.0% with conditional color\n    ws.Range(\"Margin\").NumberFormat = _\n        \"[Green][>=0.3]0.0%;[Yellow][>=0.1]0.0%;[Red]0.0%\"\n\n    ' Growth: +0.0%;-0.0% with arrow symbols\n    ws.Range(\"Growth\").NumberFormat = _\n        \"[Green]+0.0%\"\"↑\"\";[Red]-0.0%\"\"↓\"\";0.0%\"\"→\"\"\"\n\n    ' Large numbers: auto-scale K/M/B\n    ws.Range(\"LargeValues\").NumberFormat = _\n        \"[>=1000000000]#,##0.0,,,\"\"B\"\";[>=1000000]#,##0.0,,\"\"M\"\";#,##0.0,\"\"K\"\"\"\n\n    ' Date: ISO format with time\n    ws.Range(\"Timestamps\").NumberFormat = \"yyyy-mm-dd hh:mm:ss\"\n\n    ' Account IDs: leading zeros\n    ws.Range(\"AccountIDs\").NumberFormat = \"00000000\"\n\n    ' Boolean as Yes/No\n    ws.Range(\"Flags\").NumberFormat = \"[=1]\"\"Yes\"\";[=0]\"\"No\"\";\"\"N/A\"\"\"\n\n    ' Null/zero handling\n    ws.Range(\"NullableAmounts\").NumberFormat = _\n        \"$#,##0.00;[Red]($#,##0.00);\"\"N/A\"\";\"\"N/A\"\"\"\nEnd Sub\n\n' VBA: Create a format reference sheet\nSub CreateFormatReference()\n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets.Add\n    ws.Name = \"Format_Reference\"\n    ws.Range(\"A1:C1\") = Array(\"Format Code\", \"Example Input\", \"Display Output\")\n    ws.Range(\"A1:C1\").Font.Bold = True\n\n    Dim formats As Variant\n    formats = Array( _\n        Array(\"#,##0\", 1234567, \"1,234,567\"), _\n        Array(\"#,##0,\"\"K\"\"\", 1234567, \"1,235K\"), _\n        Array(\"#,##0,,\"\"M\"\"\", 1234567, \"1M\"), _\n        Array(\"$#,##0.00\", 1234.5, \"$1,234.50\"), _\n        Array(\"0.00%\", 0.1234, \"12.34%\"), _\n        Array(\"[Red]-#,##0;[Blue]#,##0\", -1234, \"-1,234 (red)\"), _\n        Array(\"000000\", 123, \"000123\"), _\n        Array(\"(000) 000-0000\", 5551234567, \"(555) 123-4567\"), _\n        Array(\"ddd, mmm dd, yyyy\", 45200, \"Mon, Jan 01, 2024\"))\n\n    Dim i As Integer\n    For i = LBound(formats) To UBound(formats)\n        ws.Cells(i + 2, 1).Value = formats(i)(0)\n        ws.Cells(i + 2, 2).Value = formats(i)(1)\n        ws.Cells(i + 2, 2).NumberFormat = formats(i)(0)\n        ws.Cells(i + 2, 3).Value = formats(i)(2)\n    Next i\n    ws.Columns.AutoFit\nEnd Sub",
          },
        ],
        tips: [
          "Custom formats have 4 sections: positive;negative;zero;text — separated by semicolons.",
          "Comma in format = divide by 1000: #,##0, shows thousands. Two commas = millions.",
          "Available colors: [Black], [White], [Red], [Green], [Blue], [Yellow], [Cyan], [Magenta].",
          "Custom formats change display only — the underlying value is preserved for calculations.",
          "Use [condition] syntax for custom thresholds: [>=1000] applies format only when value >= 1000.",
        ],
        mistake: "Using custom format to round numbers for display then expecting calculations to use the rounded value — custom formats only change display, not the underlying value. Use ROUND() function if you need calculations to use rounded values.",
        shorthand: {
          verbose: "// Custom number formats\n// Thousands: #,##0,\"K\" → 1234 displays as 1K\n// Millions: #,##0,,\"M\" → 1234567 displays as 1M\n// Conditional: [Green][>=1000]#,##0;[Red][<1000]#,##0\n// Currency: $#,##0.00\" USD\"\n// Phone: (000) 000-0000\n// Accounting: $#,##0.00_);($#,##0.00)",
          concise: "// Quick formats\n// K: #,##0,\"K\"\n// M: #,##0,,\"M\"\n// Color: [Red]-#,##0;[Blue]#,##0",
        },
      },
    ],
  },

]

export default { meta, sections }

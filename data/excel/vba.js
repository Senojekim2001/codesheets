export const meta = {
  "id": "vba",
  "label": "VBA, Tables & What-If",
  "icon": "📊",
  "description": "VBA macros, Excel tables (structured references), data validation, named ranges, what-if analysis, and sparklines."
}

export const sections = [

  // ── Section 1: VBA Macros & Automation ─────────────────────────────────────────
  {
    id: "vba-macros",
    title: "VBA Macros & Automation",
    entries: [
      {
        id: "vba-fundamentals",
        fn: "VBA — Subs, Functions, Objects & Common Patterns",
        desc: "Write VBA macros: Sub/Function procedures, Range/Worksheet objects, loops, error handling, and UserForms.",
        category: "VBA",
        subtitle: "Sub, Function, Range, Cells, Worksheets, For Each, With, On Error, MsgBox",
        signature: "Sub MyMacro()  |  Function CalcTax(amount As Double) As Double  |  Range(\"A1:B10\")  |  On Error GoTo",
        descLong: "VBA (Visual Basic for Applications) automates Excel tasks. Sub procedures perform actions; Functions return values and can be used in formulas. The object model: Application > Workbook > Worksheet > Range/Cells. Use Range(\"A1\") or Cells(1,1) to reference cells. For Each loops iterate collections. With blocks reduce repetition. On Error handles runtime errors. Record Macro captures actions as VBA code — a great starting point. Store macros in Personal.xlsb for availability across all workbooks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Subs, Functions, Objects & Common Patterns — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Sub procedure — performs actions ──────────────────\nSub FormatReport()\n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets(\"Sales\")\n    \n    ' Apply formatting to header row\n    With ws.Range(\"A1:F1\")\n        .Font.Bold = True\n        .Font.Size = 12\n        .Interior.Color = RGB(0, 70, 130)\n        .Font.Color = RGB(255, 255, 255)\n        .HorizontalAlignment = xlCenter\n    End With\n    \n    ' Auto-fit columns\n    ws.Columns(\"A:F\").AutoFit\n    \n    ' Add borders to data range\n    Dim lastRow As Long\n    lastRow = ws.Cells(ws.Rows.Count, \"A\").End(xlUp).Row\n    \n    With ws.Range(\"A1:F\" & lastRow).Borders\n        .LineStyle = xlContinuous\n        .Weight = xlThin\n    End With\n    \n    ' Conditional: highlight negative values\n    Dim cell As Range\n    For Each cell In ws.Range(\"E2:E\" & lastRow)\n        If cell.Value < 0 Then\n            cell.Interior.Color = RGB(255, 200, 200)\n            cell.Font.Color = RGB(200, 0, 0)\n        End If\n    Next cell"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Subs, Functions, Objects & Common Patterns — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Subs, Functions, Objects & Common Patterns with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nMsgBox \"Report formatted! \" & (lastRow - 1) & \" rows processed.\", vbInformation\nEnd Sub\n\n' ── Function — returns value, usable in formulas ─────\nFunction CalcCommission(sales As Double, tier As String) As Double\n    Select Case UCase(tier)\n        Case \"GOLD\":   CalcCommission = sales * 0.1\n        Case \"SILVER\": CalcCommission = sales * 0.07\n        Case \"BRONZE\": CalcCommission = sales * 0.05\n        Case Else:     CalcCommission = sales * 0.03\n    End Select\nEnd Function\n' Use in cell: =CalcCommission(B2, C2)\n\n' ── Error handling pattern ───────────────────────────\nSub SafeImport()\n    On Error GoTo ErrorHandler\n    \n    Application.ScreenUpdating = False  ' speed up\n    Application.Calculation = xlCalculationManual\n    \n    ' ... import logic ...\n    Dim wb As Workbook\n    Set wb = Workbooks.Open(\"C:\\data\\import.xlsx\")\n    wb.Sheets(1).Range(\"A1:Z1000\").Copy _\n        Destination:=ThisWorkbook.Sheets(\"Import\").Range(\"A1\")\n    wb.Close SaveChanges:=False\n    \nCleanUp:\n    Application.ScreenUpdating = True\n    Application.Calculation = xlCalculationAutomatic\n    Exit Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Subs, Functions, Objects & Common Patterns — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nErrorHandler:\n    MsgBox \"Error \" & Err.Number & \": \" & Err.Description, vbCritical\n    Resume CleanUp\nEnd Sub\n\n' ── Loop through worksheets ──────────────────────────\nSub SummarizeAllSheets()\n    Dim ws As Worksheet\n    Dim summary As Worksheet\n    Set summary = ThisWorkbook.Sheets(\"Summary\")\n    Dim row As Long: row = 2\n    \n    For Each ws In ThisWorkbook.Worksheets\n        If ws.Name <> \"Summary\" Then\n            summary.Cells(row, 1).Value = ws.Name\n            summary.Cells(row, 2).Value = _\n                Application.WorksheetFunction.Sum(ws.Range(\"D:D\"))\n            row = row + 1\n        End If\n    Next ws\nEnd Sub"
                  }
        ],
        tips: [
                  "Application.ScreenUpdating = False before bulk operations speeds up macros 10-100x — always re-enable in cleanup.",
                  "Use With blocks to avoid repeating object references: With Range(\"A1\") / .Font.Bold = True / .Value = \"X\" / End With.",
                  "Record Macro captures your actions as VBA — use it to learn the object model, then clean up the generated code.",
                  "Store utility macros in Personal.xlsb (File > Options > Trust Center) to make them available in all workbooks."
        ],
        mistake: "Selecting cells before operating on them (Range(\"A1\").Select / Selection.Font.Bold = True) — this is slow and fragile. Operate on Range objects directly: Range(\"A1\").Font.Bold = True.",
        shorthand: {
          verbose: "Range(\"A1\").Select\nSelection.Font.Bold = True\n' Slow",
          concise: "Range(\"A1\").Font.Bold = True directly; With blocks; Application.ScreenUpdating = False for speed",
        },
      },
    ],
  },

  // ── Section 2: Tables, Validation & What-If Analysis ─────────────────────────────────────────
  {
    id: "tables-whatif",
    title: "Tables, Validation & What-If Analysis",
    entries: [
      {
        id: "tables-validation",
        fn: "Excel Tables, Data Validation & What-If Analysis",
        desc: "Structured tables with auto-expanding references, data validation dropdowns, named ranges, Goal Seek, Scenario Manager, and sparklines.",
        category: "Features",
        subtitle: "Table[], structured references, INDIRECT, Data Validation, Named Ranges, Goal Seek, Scenarios, Sparklines",
        signature: "Table1[Column]  |  =SUM(Table1[Revenue])  |  Data > What-If > Goal Seek  |  SPARKLINE",
        descLong: "Excel Tables (Ctrl+T) convert ranges to structured tables with auto-expanding formulas, structured references (Table1[Column]), automatic formatting, and built-in filtering. Data Validation creates dropdown lists, restricts input to ranges/dates/numbers, and shows input messages. Named Ranges make formulas readable: =SUM(MonthlySales) instead of =SUM(B2:B13). What-If tools: Goal Seek finds input values for a target result; Scenario Manager compares multiple assumption sets; Data Tables show sensitivity analysis. Sparklines are mini-charts inside cells.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Excel Tables, Data Validation & What-If Analysis — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Excel Tables (structured references) ──────────────\n' Select data range -> Ctrl+T -> Create Table\n' Table name: SalesData (set in Table Design tab)\n\n' Structured references in formulas:\n' =SUM(SalesData[Revenue])          ' sum entire column\n' =AVERAGE(SalesData[Revenue])      ' average entire column\n' =SalesData[@Revenue]              ' current row's Revenue (in calculated column)\n' =SalesData[@Revenue] * SalesData[@Tax Rate]   ' row-level calc\n' =SUMIFS(SalesData[Revenue], SalesData[Region], \"West\")\n\n' Tables auto-expand: new rows automatically include in formulas\n' Total Row: Table Design > check \"Total Row\" for auto-aggregation\n\n' ── Data Validation ──────────────────────────────────\n' Dropdown list from range:\n' Data > Validation > Allow: List > Source: =RegionList\n' Or direct values: Source: North,South,East,West\n\n' VBA: Add validation programmatically\nSub AddDropdown()\n    With Range(\"C2:C100\").Validation\n        .Delete\n        .Add Type:=xlValidateList, _\n             Formula1:=\"High,Medium,Low\"\n        .InputTitle = \"Priority\"\n        .InputMessage = \"Select priority level\"\n        .ErrorTitle = \"Invalid\"\n        .ErrorMessage = \"Please select from the list\"\n    End With\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Excel Tables, Data Validation & What-If Analysis — common patterns you'll see in production.\n// APPROACH  - Combine Excel Tables, Data Validation & What-If Analysis with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' Dependent dropdowns (cascading):\n' State dropdown -> City dropdown changes based on state\n' Use INDIRECT: Validation Source: =INDIRECT(A2)\n' Where A2 contains \"California\" and named range \"California\" has CA cities\n\n' ── Named Ranges ─────────────────────────────────────\n' Formulas > Name Manager > New\n' TaxRate = Sheet1!$B$1\n' MonthlySales = Sheet1!$C$2:$C$13\n' =SUM(MonthlySales) * (1 + TaxRate)   ' readable formulas\n\n' Dynamic named range (expands with data):\n' =OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A), 1)\n\n' ── What-If: Goal Seek ───────────────────────────────\n' Data > What-If Analysis > Goal Seek\n' \"Set cell B10 (profit) to value 50000\n'  by changing cell B3 (price)\"\n' Goal Seek finds the price that yields $50,000 profit\n\n' VBA Goal Seek:\nSub FindBreakEvenPrice()\n    Range(\"B10\").GoalSeek Goal:=50000, ChangingCell:=Range(\"B3\")\nEnd Sub\n\n' ── What-If: Scenario Manager ────────────────────────\n' Data > What-If Analysis > Scenario Manager\n' Create scenarios: \"Best Case\", \"Worst Case\", \"Most Likely\"\n' Each scenario sets different values for input cells\n' Summary report compares all scenarios side by side"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Excel Tables, Data Validation & What-If Analysis — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Sparklines (mini charts in cells) ────────────────\n' Insert > Sparklines > Line/Column/Win-Loss\n' Data Range: B2:M2 (12 months of data)\n' Location Range: N2 (where sparkline appears)\n\n' VBA: Create sparklines\nSub AddSparklines()\n    Dim sg As SparklineGroup\n    Range(\"N2:N10\").SparklineGroups.ClearGroups\n    Set sg = Range(\"N2:N10\").SparklineGroups.Add( _\n        Type:=xlSparkLine, _\n        SourceData:=\"B2:M10\")\n    With sg\n        .SeriesColor.Color = RGB(0, 100, 180)\n        .Points.Highpoint.Visible = True\n        .Points.Highpoint.Color.Color = RGB(0, 180, 0)\n        .Points.Lowpoint.Visible = True\n        .Points.Lowpoint.Color.Color = RGB(220, 0, 0)\n    End With\nEnd Sub"
                  }
        ],
        tips: [
                  "Excel Tables auto-expand formulas to new rows — this alone prevents most \"forgot to update the range\" errors.",
                  "Structured references like SalesData[Revenue] are self-documenting — much clearer than $D$2:$D$1000.",
                  "Goal Seek is reverse calculation: \"what input gives me this output?\" — invaluable for pricing, break-even, and loan analysis.",
                  "Sparklines show 12 months of trends in a single cell — add them next to KPI tables for at-a-glance insight."
        ],
        mistake: "Using raw cell references (B2:B1000) instead of table structured references — raw references break when rows are added/removed. Table references auto-adjust and are self-documenting.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUM(B2:B1000)\nAdd row 1001 → broken\n// More explicit but longer",
          concise: "=SUM(SalesTable[Amount]) auto-expands; Ctrl+T to convert to Table; Goal Seek for reverse calculations",
        },
      },
      {
        id: "vba-variables",
        fn: "VBA — Variables, Data Types & Option Explicit",
        desc: "Declare variables with specific types, understand scope, and use Option Explicit to catch errors.",
        category: "VBA",
        subtitle: "Dim, As Integer/String/Long/Variant, Option Explicit, scope",
        signature: "Option Explicit  |  Dim x As Integer  |  Dim arr() As String",
        descLong: "Always start with Option Explicit to force variable declaration — catches typos and prevents bugs. Dim declares variables with a type. Common types: String (text), Integer (small numbers), Long (large numbers), Double (decimals), Boolean (True/False), Variant (any type, slower). Scope: variables declared in a Sub are local; module-level (top of module) are available to all Subs in that module.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Variables, Data Types & Option Explicit — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Always start with Option Explicit ────────────────\nOption Explicit\n\n' ── Variable declaration with types ──────────────────\nSub DataTypes()\n    Dim name As String\n    name = \"Alice\"\n\n    Dim age As Integer        ' small whole numbers (< 32K)\n    age = 28\n\n    Dim salary As Double      ' decimal numbers\n    salary = 75000.50\n\n    Dim isActive As Boolean   ' True or False\n    isActive = True\n\n    Dim birthDate As Date     ' date values\n    birthDate = #1/15/1996#   ' M/D/YYYY format\n\n    Dim count As Long         ' large whole numbers (> 2B)\n    count = 1000000000\n\n    Dim flexible As Variant   ' can hold any type (slower)\n    flexible = \"text\"\n    flexible = 123\n    flexible = #3/1/2024#"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Variables, Data Types & Option Explicit — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Variables, Data Types & Option Explicit with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' String concatenation\n    Dim fullInfo As String\n    fullInfo = name & \" is \" & age & \" years old\"\n    MsgBox fullInfo\nEnd Sub\n\n' ── Module-level variable (accessible to all Subs) ────\nDim GlobalCounter As Long   ' top of module, outside any Sub\n\nSub Increment()\n    GlobalCounter = GlobalCounter + 1\n    MsgBox \"Count: \" & GlobalCounter\nEnd Sub\n\n' ── Array declarations ──────────────────────────────\nSub Arrays()\n    ' Fixed-size array\n    Dim scores(10) As Integer     ' 11 elements: 0-10\n    scores(0) = 95\n    scores(1) = 87\n\n    ' Dynamic array (size unknown)\n    Dim names() As String\n    ReDim names(5)                ' set size to 6 elements\n    names(0) = \"Alice\""
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Variables, Data Types & Option Explicit — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ReDim Preserve keeps existing data\n    ReDim Preserve names(10)      ' expand from 6 to 11, keep existing values\n\n    ' 2D array\n    Dim grid(3, 3) As Integer\n    grid(0, 0) = 1\n    grid(1, 1) = 5\n\n    ' Array from worksheet range\n    Dim data As Variant\n    data = Range(\"A1:C10\").Value  ' 2D array\nEnd Sub\n\n' ── Implicit type conversion (not recommended) ───────\nSub ImplicitConversion()\n    ' Without Option Explicit, this would create a new variable\n    ' With Option Explicit, it errors (typo caught!)\n    ' Dim revenuee As Long\n    ' revenue = 1000  ' ERROR: revenuee not defined\nEnd Sub"
                  }
        ],
        tips: [
                  "Always use Option Explicit — it catches typos and prevents silent bugs. Dim typo = new variable (bad).",
                  "Integer (-32K to +32K), Long (billions) — use Long for any calculation with potential > 32K.",
                  "String for text, Double for decimals, Long for counts/IDs.",
                  "Variant is flexible but slower — only use when type varies, otherwise declare the specific type.",
                  "Module-level variables (top of module) are shared across all Subs — use sparingly to avoid surprises."
        ],
        mistake: "Forgetting Option Explicit — typos create new variables silently: Dim count=1; count += 5; countt = 10 creates a new counttt (undefined variable bug).",
        shorthand: {
          verbose: "Sub TestVariables()\n    x = 10        ' Variant, slow\n    y = \"text\"    ' Also Variant\nEnd Sub",
          concise: "Option Explicit; Dim x As Long, y As String; Integer (<32K), Long (>32K), Double (decimals), String, Boolean, Date",
        },
      },
      {
        id: "vba-control-flow",
        fn: "VBA — Control Flow: If/Then/Else, Select Case, Loops",
        desc: "Control program flow with conditionals and loops — If, Select Case, For, For Each, Do While/Until.",
        category: "VBA",
        subtitle: "If/Then/Else, Select Case, For/Next, For Each, Do While/Until",
        signature: "If x > 10 Then ... Else ... End If  |  For i = 1 To n ... Next",
        descLong: "If/Then executes code conditionally. ElseIf chains multiple conditions. Select Case is cleaner than nested ifs. For loops iterate a fixed number of times. For Each loops over collections (worksheets, ranges). Do While/Until loops until a condition is met.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Control Flow: If/Then/Else, Select Case, Loops — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── If/Then/Else conditional ────────────────────────\nSub CheckScore(score As Integer)\n    If score >= 90 Then\n        MsgBox \"Grade: A\"\n    ElseIf score >= 80 Then\n        MsgBox \"Grade: B\"\n    ElseIf score >= 70 Then\n        MsgBox \"Grade: C\"\n    Else\n        MsgBox \"Grade: F\"\n    End If\nEnd Sub\n\n' ── Select Case (cleaner than nested If) ────────────\nSub CheckGrade(grade As String)\n    Select Case UCase(grade)\n        Case \"A\"\n            MsgBox \"Excellent!\"\n        Case \"B\", \"C\"\n            MsgBox \"Good\"\n        Case Else\n            MsgBox \"Needs improvement\"\n    End Select\nEnd Sub\n\n' ── For loop (fixed iteration count) ────────────────\nSub SumRange()\n    Dim sum As Long\n    Dim i As Integer\n\n    ' i goes from 1 to 10\n    For i = 1 To 10\n        sum = sum + Cells(i, 1).Value\n    Next i\n\n    MsgBox \"Sum: \" & sum\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Control Flow: If/Then/Else, Select Case, Loops — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Control Flow: If/Then/Else, Select Case, Loops with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── For loop with Step ──────────────────────────────\nSub LoopByTens()\n    Dim i As Integer\n\n    For i = 0 To 100 Step 10  ' i = 0, 10, 20, ..., 100\n        Debug.Print i\n    Next i\nEnd Sub\n\n' ── For Each loop (over collection) ─────────────────\nSub LoopWorksheets()\n    Dim ws As Worksheet\n\n    For Each ws In ThisWorkbook.Worksheets\n        Debug.Print ws.Name\n        ws.Cells(1, 1).Value = \"Header\"\n    Next ws\nEnd Sub\n\n' ── For Each over range (rows) ──────────────────────\nSub ProcessRows()\n    Dim cell As Range\n    Dim lastRow As Long\n\n    lastRow = Cells(Rows.Count, \"A\").End(xlUp).Row\n\n    For Each cell In Range(\"A1:A\" & lastRow)\n        If cell.Value > 100 Then\n            cell.Interior.Color = RGB(255, 200, 200)  ' highlight\n        End If\n    Next cell\nEnd Sub\n\n' ── Do While (loop while condition is true) ────────\nSub CountDown()\n    Dim count As Integer\n    count = 10"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Control Flow: If/Then/Else, Select Case, Loops — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDo While count > 0\n        Debug.Print count\n        count = count - 1\n    Loop\n\n    Debug.Print \"Liftoff!\"\nEnd Sub\n\n' ── Do Until (loop until condition becomes true) ───\nSub ProcessFile()\n    Dim fileName As String\n    fileName = Dir(\"C:\\data\\*.csv\")\n\n    Do Until fileName = \"\"\n        MsgBox \"Processing: \" & fileName\n        fileName = Dir()  ' next file\n    Loop\nEnd Sub\n\n' ── Exit loop early (Exit For / Exit Do) ───────────\nSub FindValue()\n    Dim i As Integer\n\n    For i = 1 To 1000\n        If Cells(i, 1).Value = \"Target\" Then\n            MsgBox \"Found at row \" & i\n            Exit For  ' exit the loop\n        End If\n    Next i\nEnd Sub"
                  }
        ],
        tips: [
                  "For i = 1 To n with Next i — for fixed iteration count.",
                  "For Each cell In range — simpler and faster for ranges.",
                  "Select Case for multiple options — cleaner than nested If.",
                  "Do While/Until for loops with unknown count (file processing, searching).",
                  "Exit For/Exit Do to break out of loops early."
        ],
        mistake: "Using For i = 1 To 1000 with early exit when you should use Do While — bounds the loop unnecessarily.",
        shorthand: {
          verbose: "For i = 1 To n\n    If condition Then ... End If\nNext",
          concise: "For/Next for count; For Each for collections; Select Case for multiple options; Do While/Until for unknown count",
        },
      },
      {
        id: "vba-workbook-worksheet",
        fn: "VBA — Workbook & Worksheet Operations",
        desc: "Open/close workbooks, switch sheets, access worksheet properties and data.",
        category: "VBA",
        subtitle: "Workbooks.Open, ActiveWorkbook, Sheets(), Range(), selection",
        signature: "Workbooks.Open(\"path.xlsx\")  |  ThisWorkbook.Sheets(\"Name\")  |  Range(\"A1:B10\")",
        descLong: "Workbooks.Open loads a file from disk. ActiveWorkbook/ActiveSheet refer to the current active sheet. ThisWorkbook is the workbook containing the macro. Sheets(index or name) accesses sheets. Cells and Range reference worksheet cells. Always use Worksheet objects instead of Select/ActiveSheet when possible — it's faster.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Workbook & Worksheet Operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Open and close workbooks ────────────────────────\nSub OpenFile()\n    Dim wb As Workbook\n\n    ' Open workbook\n    Set wb = Workbooks.Open(\"C:\\data\\sales.xlsx\", ReadOnly:=False)\n\n    ' Do something with the workbook\n    MsgBox \"Opened: \" & wb.Name\n\n    ' Close without saving\n    wb.Close SaveChanges:=False\nEnd Sub\n\n' ── Access sheets by name or index ──────────────────\nSub AccessSheets()\n    Dim ws As Worksheet\n\n    ' By name\n    Set ws = ThisWorkbook.Sheets(\"Sales\")\n    ws.Cells(1, 1).Value = \"Hello\"\n\n    ' By index (1-based)\n    Set ws = ThisWorkbook.Sheets(2)\n    ws.Cells(1, 1).Value = \"Sheet 2\"\n\n    ' Activate sheet (for selection operations)\n    ThisWorkbook.Sheets(\"Summary\").Activate\nEnd Sub\n\n' ── Work with ActiveSheet (current sheet) ──────────\nSub FormatActiveSheet()\n    ' Assumes user has selected the sheet to format\n    ActiveSheet.Range(\"A1:A10\").Font.Bold = True\n    ActiveSheet.Columns(\"A:D\").AutoFit\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Workbook & Worksheet Operations — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Workbook & Worksheet Operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Create new sheet ────────────────────────────────\nSub CreateSheet()\n    Dim newSheet As Worksheet\n\n    Set newSheet = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))\n    newSheet.Name = \"NewData\"\n    newSheet.Cells(1, 1).Value = \"Header\"\nEnd Sub\n\n' ── Delete sheet ────────────────────────────────────\nSub DeleteSheet()\n    On Error Resume Next\n    ThisWorkbook.Sheets(\"OldData\").Delete\n    On Error GoTo 0\nEnd Sub\n\n' ── Copy data between sheets ────────────────────────\nSub CopyBetweenSheets()\n    Dim sourceSheet As Worksheet\n    Dim targetSheet As Worksheet\n\n    Set sourceSheet = ThisWorkbook.Sheets(\"Source\")\n    Set targetSheet = ThisWorkbook.Sheets(\"Target\")\n\n    ' Copy range\n    sourceSheet.Range(\"A1:D100\").Copy\n    targetSheet.Range(\"A1\").PasteSpecial Paste:=xlPasteValues\n\n    Application.CutCopyMode = False  ' clear clipboard\nEnd Sub\n\n' ── Find last row/column with data ──────────────────\nSub FindLastCell()\n    Dim ws As Worksheet\n    Dim lastRow As Long\n    Dim lastCol As Long"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Workbook & Worksheet Operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSet ws = ThisWorkbook.Sheets(\"Data\")\n\n    ' Last row in column A\n    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row\n\n    ' Last column in row 1\n    lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column\n\n    MsgBox \"Data range: A1:\" & Cells(lastRow, lastCol).Address\nEnd Sub\n\n' ── Check if sheet exists ───────────────────────────\nFunction SheetExists(sheetName As String) As Boolean\n    Dim ws As Worksheet\n    On Error Resume Next\n    Set ws = ThisWorkbook.Sheets(sheetName)\n    SheetExists = Not (ws Is Nothing)\nEnd Function\n\n' ── Loop through all sheets ─────────────────────────\nSub LoopAllSheets()\n    Dim ws As Worksheet\n\n    For Each ws In ThisWorkbook.Worksheets\n        MsgBox \"Processing: \" & ws.Name\n        ' Do something with each sheet\n        ws.Rows(1).Delete  ' delete first row in each sheet\n    Next ws\nEnd Sub"
                  }
        ],
        tips: [
                  "ThisWorkbook for the workbook containing the macro (relative). Workbooks(\"name\") for other workbooks (absolute).",
                  "Always use Worksheet variables instead of ActiveSheet when possible — faster and more reliable.",
                  "Find last row: Cells(Rows.Count, \"A\").End(xlUp).Row — adapts to any data size.",
                  "SheetExists before deleting — avoid errors if sheet doesn't exist."
        ],
        mistake: "Using Select/ActiveSheet instead of Worksheet variables — slow and breaks if user switches sheets. Use: Set ws = ThisWorkbook.Sheets(\"Name\"); ws.Range(...)",
        shorthand: {
          verbose: "// Manual / verbose approach\nSheets(\"Name\").Activate\nActiveSheet.Range(\"A1\").Value = \"X\"\n// More explicit but longer",
          concise: "Set ws = ThisWorkbook.Sheets(\"Name\"); ws.Range(\"A1\").Value directly; find last row with Cells(Rows.Count,col).End(xlUp).Row",
        },
      },
      {
        id: "vba-range-cells",
        fn: "VBA — Range & Cell Operations",
        desc: "Reference cells and ranges, read/write values, formulas, and properties.",
        category: "VBA",
        subtitle: "Range(), Cells(), .Value, .Formula, .Address, selecting ranges",
        signature: "Range(\"A1\").Value = data  |  Cells(row, col)  |  Range(\"A1:B10\").Formula = \"=...\"",
        descLong: "Range(\"A1\") uses absolute references (A1 notation). Cells(row, col) uses numeric indices (1-based). .Value gets/sets cell content. .Formula sets formulas. .Address returns the cell address as text. Avoid Select; operate directly on Range/Cells objects. Use Offset/Resize for relative references.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Range & Cell Operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Basic range and cell reference ──────────────────\nSub RangeBasics()\n    ' Reference by address\n    Range(\"A1\").Value = \"Hello\"\n    Range(\"A1:B10\").Font.Bold = True\n\n    ' Reference by row/column index (1-based)\n    Cells(1, 1).Value = \"Hello\"        ' A1\n    Cells(1, 2).Value = \"World\"        ' B1\n    Cells(2, 1).Value = \"Goodbye\"      ' A2\n\n    ' Both work interchangeably\n    Range(\"A1\").Value = Cells(1, 1).Value\nEnd Sub\n\n' ── Set and get cell values ────────────────────────\nSub ReadWriteValues()\n    Dim value As Variant\n\n    ' Write value\n    Range(\"A1\").Value = 100\n    Range(\"A2\").Value = \"Text\"\n    Range(\"A3\").Value = #3/15/2024#\n\n    ' Read value\n    value = Range(\"A1\").Value\n    MsgBox \"A1 contains: \" & value\n\n    ' Work with arrays (faster for bulk operations)\n    Dim data As Variant\n    data = Range(\"A1:C10\").Value   ' 2D array\n    MsgBox data(1, 1)              ' A1 value\nEnd Sub\n\n' ── Set formulas ────────────────────────────────────\nSub SetFormulas()\n    ' R1C1 notation\n    Range(\"D1\").Formula = \"=A1+B1+C1\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Range & Cell Operations — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Range & Cell Operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' Copy formula down\n    Range(\"D2:D100\").Formula = Range(\"D1\").Formula\n\n    ' Array formula (Ctrl+Shift+Enter)\n    Range(\"E1:E100\").FormulaArray = \"=A1:A100+B1:B100\"\nend Sub\n\n' ── Reference cells dynamically with Offset ────────\nSub DynamicReference()\n    Dim startCell As Range\n\n    Set startCell = Range(\"A1\")\n\n    ' Get cell 5 rows down, 2 columns right\n    Dim targetCell As Range\n    Set targetCell = startCell.Offset(5, 2)  ' C6\n    targetCell.Value = \"Five rows, two columns over\"\n\n    ' Resize to 10x10 range\n    Dim bigRange As Range\n    Set bigRange = startCell.Resize(10, 10)\n    bigRange.Interior.Color = RGB(200, 200, 255)\nEnd Sub\n\n' ── Get cell address as string ──────────────────────\nSub CellAddress()\n    Dim addr As String\n\n    addr = Range(\"A1\").Address          ' $A$1 (absolute)\n    addr = Range(\"A1\").Address(False)   ' A1 (relative)\n\n    MsgBox addr\n\n    ' Use address in formulas\n    Range(\"E1\").Formula = \"=SUM(\" & Range(\"A1:A10\").Address & \")\"\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Range & Cell Operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Loop through range cells ────────────────────────\nSub LoopCells()\n    Dim cell As Range\n    Dim total As Double\n\n    ' For Each loop (simpler)\n    For Each cell In Range(\"A1:A100\")\n        If IsNumeric(cell.Value) Then\n            total = total + cell.Value\n        End If\n    Next cell\n\n    MsgBox \"Total: \" & total\nEnd Sub\n\n' ── Working with single row/column ──────────────────\nSub RowColumnOps()\n    ' Entire column\n    Columns(\"A:A\").Font.Bold = True\n    Columns(\"B:D\").Delete\n\n    ' Entire row\n    Rows(1).Font.Bold = True\n    Rows(2:10).Delete\n\n    ' Specific row range\n    Range(\"A1:F1\").Interior.Color = RGB(200, 150, 100)\nend Sub"
                  }
        ],
        tips: [
                  "Avoid Select; operate on Range directly: Range(\"A1\").Value instead of Range(\"A1\").Select; Selection.Value.",
                  "Cells(row, col) better in loops where row/col come from variables.",
                  "Array assignment (data = Range(...).Value) is 100x faster than cell-by-cell access.",
                  "Offset(rows, cols) for relative references; Resize(rows, cols) to expand a range."
        ],
        mistake: "Selecting cells before operating: Range(\"A1\").Select; Selection.Bold = True (slow). Direct: Range(\"A1\").Font.Bold = True.",
        shorthand: {
          verbose: "Range(\"A1\").Select\nSelection.Value = \"X\"\nSelection.Font.Bold = True",
          concise: "Range(\"A1\").Value = \"X\"; Range(\"A1\").Font.Bold = True; use Offset(rows,cols) for relative refs",
        },
      },
      {
        id: "vba-debug-print",
        fn: "VBA — Debug.Print & the Immediate Window",
        desc: "Inspect values at runtime by writing to the VBA Immediate Window — the primary debugging tool.",
        category: "VBA",
        subtitle: "Debug.Print, Immediate Window (Ctrl+G), MsgBox, ? shorthand",
        signature: "Debug.Print value  |  Debug.Print \"label: \" & value  |  MsgBox value",
        descLong: "Debug.Print writes output to the Immediate Window in the VBA Editor (VBE) — open it with Ctrl+G or View → Immediate Window. Output only appears while code is running or paused in the debugger; it does not affect the spreadsheet. MsgBox is the dialog alternative — it pauses execution until dismissed. The Immediate Window also accepts ? as a shorthand for Print to evaluate expressions interactively.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Debug.Print & the Immediate Window — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Open Immediate Window: VBE → View → Immediate Window (Ctrl+G) ──\n\n' ── Debug.Print — write to Immediate Window ─────────────\nSub DebugExample()\n    Dim ws As Worksheet\n    Dim i As Long\n    Dim total As Double\n\n    ' Print simple values:\n    Debug.Print \"Starting loop...\"\n    Debug.Print \"Sheet count: \" & ThisWorkbook.Sheets.Count\n\n    ' Print variable values (label & value pattern):\n    total = 0\n    For i = 1 To 5\n        total = total + Cells(i, 1).Value\n        Debug.Print \"Row \" & i & \": \" & Cells(i, 1).Value & \"  running total: \" & total\n    Next i\n\n    Debug.Print \"Final total: \" & total\n    Debug.Print \"Done at \" & Now()\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Debug.Print & the Immediate Window — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Debug.Print & the Immediate Window with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Print multiple values on one line ────────────────────\nSub MultiValueDebug()\n    Dim ws As Worksheet\n    For Each ws In ThisWorkbook.Worksheets\n        Debug.Print ws.Name & vbTab & ws.UsedRange.Rows.Count & \" rows\"\n    Next ws\nEnd Sub\n\n' ── Debug.Assert — break on false condition ───────────────\n' Pauses execution in the debugger if condition is False:\nDebug.Assert total > 0          ' breaks here if total = 0\nDebug.Assert Not IsEmpty(Range(\"A1\"))\n\n' ── MsgBox — dialog output (pauses execution) ─────────────\nSub MsgBoxExample()\n    Dim result As Long\n    result = Application.WorksheetFunction.Sum(Range(\"A1:A10\"))\n\n    MsgBox \"Sum = \" & result                         ' simple message\n    MsgBox \"Sum = \" & result, vbInformation, \"Result\"  ' with icon & title"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Debug.Print & the Immediate Window — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' MsgBox with Yes/No for conditional debugging:\n    If MsgBox(\"Continue?\", vbYesNo) = vbNo Then Exit Sub\nEnd Sub\n\n' ── Immediate Window interactive use ─────────────────────\n' While paused (or after a run), type directly in the window:\n'   ? ActiveSheet.Name          → \"Sheet1\"\n'   ? Range(\"A1\").Value         → 42\n'   ? ThisWorkbook.Path         → \"C:Users...\"\n'   ActiveSheet.Range(\"A1\") = 99    → set a value live\n'   Call MySub                      → run a Sub immediately"
                  }
        ],
        tips: [
                  "Debug.Print never affects the spreadsheet or user — safe to leave in code during development.",
                  "Use vbTab between values to get column-aligned output in the Immediate Window: Debug.Print name & vbTab & value.",
                  "Debug.Assert is underused — it breaks execution in the debugger when a condition is False, like a breakpoint with a condition built in.",
                  "Clear the Immediate Window: click in it, Ctrl+A, Delete — useful when re-running a Sub to see only the latest output."
        ],
        mistake: "Leaving MsgBox calls in production macros — MsgBox pauses the macro and requires user interaction, breaking automated/batch runs. Use Debug.Print for development, then strip it out. For production logging, write to a dedicated log sheet or a text file instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nMsgBox \"Value is: \" & myVar   ' blocks execution, requires click\n// More explicit but longer",
          concise: "Debug.Print \"Value is: \" & myVar  ' non-blocking, Immediate Window only",
        },
      },
      {
        id: "vba-error-handling",
        fn: "VBA — Error Handling with On Error",
        desc: "Handle runtime errors gracefully with On Error GoTo, On Error Resume Next, and Err object.",
        category: "VBA",
        subtitle: "On Error GoTo, Err.Number, Err.Description, Resume",
        signature: "On Error GoTo ErrHandler  |  Err.Number  |  Resume CleanUp",
        descLong: "On Error GoTo jumps to a label when an error occurs. Err.Number and Err.Description hold error details. Resume continues execution (at a label or next line). Resume Next skips the error and continues. Always provide a cleanup section (Resume CleanUp) to restore state (ScreenUpdating, Calculation, open files).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Error Handling with On Error — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── On Error GoTo with cleanup ──────────────────────\nSub SafeOperation()\n    On Error GoTo ErrorHandler\n\n    ' Disable updates for speed\n    Application.ScreenUpdating = False\n    Application.Calculation = xlCalculationManual\n\n    ' Code that might error\n    Dim result As Double\n    result = Range(\"A1\").Value / Range(\"A2\").Value\n\n    MsgBox \"Result: \" & result\n\nCleanUp:\n    Application.ScreenUpdating = True\n    Application.Calculation = xlCalculationAutomatic\n    Exit Sub\n\nErrorHandler:\n    MsgBox \"Error \" & Err.Number & \": \" & Err.Description, vbCritical\n    Resume CleanUp\nEnd Sub\n\n' ── On Error Resume Next (skip error, continue) ────\nSub SkipErrors()\n    ' Open file; if it doesn't exist, skip error\n    On Error Resume Next\n\n    Workbooks.Open \"C:\\data\\optional_file.xlsx\"\n\n    ' Turn error handling back on\n    On Error GoTo 0\n\n    ' This runs whether file opened or not\n    MsgBox \"Done\"\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Error Handling with On Error — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Error Handling with On Error with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Check error and decide action ───────────────────\nSub ConditionalErrorHandling()\n    On Error GoTo ErrorHandler\n\n    Dim value As Double\n    value = Range(\"A1\").Value / Range(\"A2\").Value\n\n    MsgBox \"Result: \" & value\n    Exit Sub\n\nErrorHandler:\n    If Err.Number = 11 Then\n        MsgBox \"Division by zero in A2\"\n    ElseIf Err.Number = 13 Then\n        MsgBox \"Type mismatch: not a number\"\n    Else\n        MsgBox \"Unexpected error: \" & Err.Description\n    End If\nEnd Sub\n\n' ── Error handling for file operations ────────────\nSub SafeFileOperation()\n    On Error GoTo ErrorHandler\n\n    Dim wb As Workbook\n\n    Set wb = Workbooks.Open(\"C:\\data\\sales.xlsx\", ReadOnly:=True)\n\n    ' Process workbook\n    MsgBox \"Processing: \" & wb.Name\n\nCleanUp:\n    If Not wb Is Nothing Then\n        wb.Close SaveChanges:=False\n    End If\n    Exit Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Error Handling with On Error — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nErrorHandler:\n    Select Case Err.Number\n        Case 1004\n            MsgBox \"File not found or is corrupted\"\n        Case Else\n            MsgBox \"Error: \" & Err.Description\n    End Select\n    Resume CleanUp\nEnd Sub\n\n' ── Nested error handling ───────────────────────────\nSub NestedErrors()\n    On Error GoTo OuterError\n\n    Dim x As Double\n    x = 10\n\n    On Error GoTo InnerError\n    x = x / 0  ' inner error handler catches this\n    MsgBox \"After inner error: \" & x\n    Exit Sub\n\nInnerError:\n    x = 1  ' default value\n    On Error GoTo OuterError  ' switch back\n    Resume Next\n\nOuterError:\n    MsgBox \"Outer error handler: \" & Err.Description\nEnd Sub"
                  }
        ],
        tips: [
                  "Always use the CleanUp pattern: ErrorHandler → Resume CleanUp ensures state is restored.",
                  "Err.Number and Err.Description contain error details — use them to decide action.",
                  "On Error Resume Next skips errors but is risky — use sparingly, then \"On Error GoTo 0\" to re-enable.",
                  "Common errors: 11 (division by zero), 13 (type mismatch), 1004 (range error), 1005 (workbook open)."
        ],
        mistake: "No error handling in production code — unexpected input causes cryptic error messages. Always On Error GoTo with cleanup.",
        shorthand: {
          verbose: "Sub NoErrorHandling()\n    result = Range(\"A1\") / Range(\"A2\")\nEnd Sub",
          concise: "On Error GoTo ErrorHandler; ... CleanUp: restore state; ErrorHandler: handle with Err.Number/Description",
        },
      },
      {
        id: "vba-file-operations",
        fn: "VBA — File System Operations",
        desc: "Open/read/write files, iterate files in a folder, copy/delete files.",
        category: "VBA",
        subtitle: "Open For Input/Output, Dir(), FileCopy, DeleteFile, FileSystemObject",
        signature: "Open \"path\" For Input As #1  |  Dir(\"*.xlsx\")  |  FileCopy source, target",
        descLong: "Open opens text files for read (Input) or write (Output/Append). Dir() lists files in a folder (loop pattern). FileSystemObject (FSO) provides object-oriented file operations. FileCopy, Kill (delete), and GetAttr (properties) for file manipulation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — File System Operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Read text file line by line ─────────────────────\nSub ReadTextFile()\n    Dim filePath As String\n    Dim fileNumber As Integer\n    Dim line As String\n\n    filePath = \"C:\\data\\data.txt\"\n    fileNumber = FreeFile()  ' get next available file number\n\n    Open filePath For Input As #fileNumber\n\n    Do While Not EOF(fileNumber)\n        Line Input #fileNumber, line\n        Debug.Print line      ' output to Immediate window\n        ' Process line...\n    Loop\n\n    Close #fileNumber\nEnd Sub\n\n' ── Write to text file ──────────────────────────────\nSub WriteTextFile()\n    Dim filePath As String\n    Dim fileNumber As Integer\n\n    filePath = \"C:\\output\\results.txt\"\n    fileNumber = FreeFile()\n\n    Open filePath For Output As #fileNumber\n\n    Print #fileNumber, \"Header\"\n    Print #fileNumber, \"Data line 1\"\n    Print #fileNumber, \"Data line 2\"\n\n    Close #fileNumber\n    MsgBox \"File written: \" & filePath\nEnd Sub\n\n' ── Append to existing file ─────────────────────────\nSub AppendToFile()\n    Dim fileNumber As Integer\n    fileNumber = FreeFile()\n\n    Open \"C:\\output\\log.txt\" For Append As #fileNumber\n    Print #fileNumber, Format(Now(), \"YYYY-MM-DD HH:MM:SS\") & \" - Process started\"\n    Close #fileNumber\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — File System Operations — common patterns you'll see in production.\n' APPROACH  - Combine VBA — File System Operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Loop through all files in folder ────────────────\nSub ProcessFolder()\n    Dim folderPath As String\n    Dim fileName As String\n\n    folderPath = \"C:\\data\\monthly\\\"\n    fileName = Dir(folderPath & \"*.csv\")\n\n    Do While fileName <> \"\"\n        Debug.Print \"Processing: \" & fileName\n        ' Process each file...\n        fileName = Dir()  ' next file\n    Loop\n\n    If Dir() = \"\" Then\n        MsgBox \"All files processed\"\n    End If\nEnd Sub\n\n' ── Copy file ───────────────────────────────────────\nSub CopyFile()\n    Dim source As String\n    Dim target As String\n\n    source = \"C:\\data\\original.xlsx\"\n    target = \"C:\\backup\\original_copy.xlsx\"\n\n    If Dir(source) <> \"\" Then\n        FileCopy source, target\n        MsgBox \"File copied: \" & target\n    Else\n        MsgBox \"Source file not found\"\n    End If\nEnd Sub\n\n' ── Delete file ─────────────────────────────────────\nSub DeleteFile()\n    Dim filePath As String\n    filePath = \"C:\\temp\\old_file.txt\"\n\n    If Dir(filePath) <> \"\" Then\n        Kill filePath\n        MsgBox \"File deleted\"\n    Else\n        MsgBox \"File not found\"\n    End If\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — File System Operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── FileSystemObject (more powerful) ────────────────\nSub FileSystemObjectDemo()\n    Dim fso As Object\n    Dim folder As Object\n    Dim file As Object\n\n    Set fso = CreateObject(\"Scripting.FileSystemObject\")\n    Set folder = fso.GetFolder(\"C:\\data\")\n\n    ' Loop through files\n    For Each file In folder.Files\n        If LCase(fso.GetExtensionName(file.Name)) = \"csv\" Then\n            Debug.Print file.Name & \" - \" & file.Size & \" bytes\"\n        End If\n    Next file\n\n    ' Create folder\n    If Not fso.FolderExists(\"C:\\backup\") Then\n        fso.CreateFolder \"C:\\backup\"\n    End If\nEnd Sub\n\n' ── Get file properties ─────────────────────────────\nSub FileProperties()\n    Dim filePath As String\n    Dim fso As Object\n    Dim file As Object\n\n    filePath = \"C:\\data\\sales.xlsx\"\n    Set fso = CreateObject(\"Scripting.FileSystemObject\")\n    Set file = fso.GetFile(filePath)\n\n    MsgBox \"File: \" & file.Name & vbCrLf & _\n           \"Size: \" & file.Size & \" bytes\" & vbCrLf & _\n           \"Created: \" & file.DateCreated & vbCrLf & _\n           \"Modified: \" & file.DateLastModified\nEnd Sub"
                  }
        ],
        tips: [
                  "FreeFile() returns the next available file number — use it in Open statements.",
                  "Dir(\"*.xlsx\") without path searches current folder. Dir() subsequent calls return next file.",
                  "Always check Dir() <> \"\" before operating on a file — file might not exist.",
                  "FileSystemObject (FSO) is object-oriented and more powerful — use for complex file operations.",
                  "Kill function is permanent — no recycle bin. Confirm before deleting."
        ],
        mistake: "Hardcoding file numbers (Open \"file\" As #1) instead of FreeFile() — causes conflicts if multiple files open.",
        shorthand: {
          verbose: "Open \"C:\\file.txt\" For Input As #1\nDo While Not EOF(1)\n  Line Input #1, line\nLoop\nClose #1",
          concise: "FreeFile() for file number; Dir(\"*.csv\") for looping files; FileCopy/Kill for file ops; FSO for folder/properties",
        },
      },
      {
        id: "vba-arrays",
        fn: "VBA — Working with Arrays",
        desc: "Declare fixed/dynamic arrays, read range to array, process in-memory, write back.",
        category: "VBA",
        subtitle: "Dim arr(), ReDim, UBound/LBound, reading ranges, 2D arrays",
        signature: "Dim arr() As Type  |  ReDim arr(100)  |  arr = Range(...).Value",
        descLong: "Dynamic arrays are declared without size (Dim arr()), then sized with ReDim. ReDim Preserve keeps existing data when resizing. Reading a range into an array is 100x faster than cell-by-cell access. Arrays are 1-based in VBA. Use UBound/LBound to get array bounds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Working with Arrays — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Fixed-size array ────────────────────────────────\nSub FixedArray()\n    Dim scores(10) As Integer    ' 11 elements: 0-10\n    scores(0) = 95\n    scores(1) = 87\n    scores(2) = 92\n\n    Dim i As Integer\n    For i = 0 To 10\n        Debug.Print \"Score \" & i & \": \" & scores(i)\n    Next i\nEnd Sub\n\n' ── Dynamic array (size unknown) ────────────────────\nSub DynamicArray()\n    Dim names() As String\n\n    ReDim names(5)     ' set size to 6 elements\n    names(0) = \"Alice\"\n    names(1) = \"Bob\"\n\n    ' Expand array, keep existing data\n    ReDim Preserve names(10)\n    names(6) = \"Charlie\"\n\n    ' Expand again\n    ReDim Preserve names(20)\nEnd Sub\n\n' ── 2D array (table of data) ────────────────────────\nSub TwoDArray()\n    Dim grid(3, 2) As Integer    ' 4 rows × 3 columns\n\n    grid(0, 0) = 1\n    grid(0, 1) = 2\n    grid(1, 0) = 10\n    grid(1, 1) = 20\n\n    ' Loop through grid\n    Dim i As Integer, j As Integer\n    For i = 0 To UBound(grid, 1)      ' rows\n        For j = 0 To UBound(grid, 2)  ' columns\n            Debug.Print grid(i, j)\n        Next j\n    Next i\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Working with Arrays — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Working with Arrays with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Read range into array (FAST) ────────────────────\nSub RangeToArray()\n    Dim data As Variant\n\n    ' Read entire range into 2D array (1-based)\n    data = Range(\"A1:C100\").Value\n\n    ' Access array elements\n    Debug.Print data(1, 1)   ' A1\n    Debug.Print data(1, 2)   ' B1\n    Debug.Print data(50, 3)  ' C50\n\n    ' Loop and process\n    Dim i As Long, j As Integer\n    For i = 1 To UBound(data, 1)\n        For j = 1 To UBound(data, 2)\n            data(i, j) = data(i, j) * 2  ' double values\n        Next j\n    Next i\n\n    ' Write array back to sheet\n    Range(\"D1:F100\").Value = data\nEnd Sub\n\n' ── Write array back to range ───────────────────────\nSub ArrayToRange()\n    Dim values(1 To 10) As Double\n    Dim i As Integer\n\n    ' Fill array with values\n    For i = 1 To 10\n        values(i) = i * 10\n    Next i\n\n    ' Write to sheet in one operation\n    Range(\"A1:A10\").Value = Application.Transpose(values)\nEnd Sub\n\n' ── Multidimensional array processing ───────────────\nSub ProcessArray()\n    Dim salesData As Variant"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Working with Arrays — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Read sales data: Region, Product, Amount\n    salesData = Range(\"A1:C1000\").Value\n\n    Dim region As String, product As String, amount As Double\n\n    ' Process in memory (fast)\n    Dim i As Long\n    For i = 1 To UBound(salesData, 1)\n        region = salesData(i, 1)\n        product = salesData(i, 2)\n        amount = salesData(i, 3)\n\n        If amount > 10000 Then\n            salesData(i, 4) = \"High\"  ' add flag column\n        End If\n    Next i\n\n    ' Write back entire array\n    Range(\"A1:D1000\").Value = salesData\nEnd Sub\n\n' ── Array functions (Transpose, etc.) ───────────────\nSub ArrayFunctions()\n    Dim arr As Variant\n    Dim transposed As Variant\n\n    arr = Range(\"A1:C10\").Value      ' 10 rows × 3 columns\n    transposed = Application.Transpose(arr)  ' 3 rows × 10 columns\n\n    ' Use ReDim to change size as needed\n    Dim newArr() As Variant\n    ReDim newArr(1 To 5)\nEnd Sub"
                  }
        ],
        tips: [
                  "Reading range to array then processing in-memory is 100-1000x faster than cell-by-cell access.",
                  "Always use ReDim Preserve when expanding arrays to keep existing data.",
                  "UBound(arr, 1) for rows, UBound(arr, 2) for columns in 2D arrays.",
                  "Application.Transpose converts row arrays to columns (for writing single values as column)."
        ],
        mistake: "Processing cells one at a time in a loop when you should read the entire range into an array, process, then write back.",
        shorthand: {
          verbose: "For i = 1 To 10000\n    Cells(i, 1).Value = Cells(i, 1).Value * 2\nNext",
          concise: "data = Range(...).Value; process in loop; Range(...).Value = data (one write operation)",
        },
      },
      {
        id: "vba-formatting",
        fn: "VBA — Cell Formatting",
        desc: "Format cells: fonts, colors, number formats, borders, conditional formatting.",
        category: "VBA",
        subtitle: ".Font, .Interior, .NumberFormat, .Borders, conditional formatting",
        signature: "Range().Font.Bold = True  |  Range().Interior.Color = RGB(255,0,0)  |  .NumberFormat = \"$#,##0.00\"",
        descLong: "Font properties: Bold, Italic, Size, Color, Name. Interior (background) color. NumberFormat controls display format (currency, percent, date). Borders control outline. RGB(r, g, b) creates colors (0-255 each). Conditional formatting via VBA is powerful but complex.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of VBA — Cell Formatting — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Font formatting ────────────────────────────────\nSub FormatFont()\n    With Range(\"A1\")\n        .Value = \"Bold Header\"\n        .Font.Bold = True\n        .Font.Size = 14\n        .Font.Color = RGB(0, 0, 255)  ' blue\n        .Font.Italic = True\n        .Font.Name = \"Calibri\"\n    End With\nEnd Sub\n\n' ── Background color (Interior) ─────────────────────\nSub ColorCells()\n    ' Light blue background\n    Range(\"A1:F1\").Interior.Color = RGB(200, 220, 255)\n\n    ' Conditional highlight\n    Dim cell As Range\n    For Each cell In Range(\"A1:A100\")\n        If cell.Value > 1000 Then\n            cell.Interior.Color = RGB(144, 238, 144)  ' light green\n        End If\n    Next cell\nEnd Sub\n\n' ── Number formatting ──────────────────────────────\nSub NumberFormats()\n    Range(\"B1:B100\").NumberFormat = \"$#,##0.00\"      ' currency\n    Range(\"C1:C100\").NumberFormat = \"0.00%\"          ' percentage\n    Range(\"D1:D100\").NumberFormat = \"YYYY-MM-DD\"     ' date\n    Range(\"E1:E100\").NumberFormat = \"#,##0\"          ' thousands separator\n    Range(\"F1:F100\").NumberFormat = \"0.00E+00\"       ' scientific\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of VBA — Cell Formatting — common patterns you'll see in production.\n' APPROACH  - Combine VBA — Cell Formatting with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Borders and alignment ───────────────────────────\nSub FormatBorders()\n    With Range(\"A1:F10\").Borders\n        .LineStyle = xlContinuous\n        .Weight = xlThin\n        .ColorIndex = xlAutomatic\n    End With\n\n    ' Alignment\n    Range(\"A1:F1\").HorizontalAlignment = xlCenter\n    Range(\"A1:F1\").VerticalAlignment = xlVCenter\n    Range(\"A1:A100\").HorizontalAlignment = xlLeft\nEnd Sub\n\n' ── Conditional formatting via VBA ─────────────────\nSub ConditionalFormat()\n    Dim rng As Range\n    Set rng = Range(\"A1:A100\")\n\n    ' Clear existing rules\n    rng.FormatConditions.Delete\n\n    ' Red if < 100\n    rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlLess, Formula1:=\"100\"\n    rng.FormatConditions(1).Interior.Color = RGB(255, 200, 200)\n    rng.FormatConditions(1).Font.Color = RGB(200, 0, 0)"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of VBA — Cell Formatting — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Green if > 500\n    rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlGreater, Formula1:=\"500\"\n    rng.FormatConditions(2).Interior.Color = RGB(200, 255, 200)\n    rng.FormatConditions(2).Font.Color = RGB(0, 150, 0)\nEnd Sub\n\n' ── Column width and row height ─────────────────────\nSub AdjustDimensions()\n    Range(\"A:A\").ColumnWidth = 25\n    Range(\"B:D\").ColumnWidth = 15\n\n    Range(\"1:1\").RowHeight = 30  ' header row\n    Range(\"2:100\").RowHeight = 20\n\n    ' Auto-fit columns\n    Columns(\"A:F\").AutoFit\nEnd Sub"
                  }
        ],
        tips: [
                  "Use With blocks to apply multiple properties efficiently.",
                  "RGB(r, g, b) with values 0-255 for any color.",
                  "NumberFormat strings: \"$\" for currency, \"%\" for percent, \"0.00\" for decimals.",
                  "Conditional formatting rules: xlCellValue, xlFormula, xlColorScale, xlDatabar."
        ],
        mistake: "Applying formatting to individual cells in a loop — slow. Apply to entire range at once: Range(\"A1:A100\").Font.Bold = True.",
        shorthand: {
          verbose: "For i = 1 To 100\n    Cells(i, 1).Font.Bold = True\nNext",
          concise: "Range(\"A1:A100\").Font.Bold = True; With blocks; Interior.Color = RGB(r,g,b); NumberFormat strings",
        },
      },
    ],
  },
]

export default { meta, sections }

export const meta = {
  "id": "powerquery",
  "label": "Power Query & Pivot Tables",
  "icon": "🔀",
  "description": "Excel Power Query (M language), Power Pivot, pivot tables, data modeling, and ETL patterns."
}

export const sections = [

  // ── Section 1: Power Query (Get & Transform) ─────────────────────────────────────────
  {
    id: "power-query",
    title: "Power Query (Get & Transform)",
    entries: [
      {
        id: "power-query-basics",
        fn: "Power Query — Import, Clean & Transform Data",
        desc: "Import data from files, databases, and APIs, then clean and reshape it with the M language and the visual editor.",
        category: "Power Query",
        subtitle: "Get Data, M language, steps, merge, append, unpivot, data types",
        signature: "let Source = ..., Step = transform(Source) in Step  |  Table.SelectRows  |  Table.AddColumn",
        descLong: "Power Query (Get & Transform) is Excel/Power BI's ETL engine. It connects to 100+ data sources (files, databases, APIs, web pages), then applies a sequence of transformation steps recorded in the M language. Steps are lazy (executed on refresh, not immediately). The visual editor generates M code automatically, but you can edit it directly for advanced transforms. Key operations: filter rows, remove/rename columns, merge (join) tables, append (union) tables, unpivot, group by, and add calculated columns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Import, Clean & Transform Data — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Power Query M language basics ────────────────────\n// Each query is a let...in expression\nlet\n    // Step 1: Connect to data source\n    Source = Excel.CurrentWorkbook(){[Name=\"SalesTable\"]}[Content],"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Import, Clean & Transform Data — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Import, Clean & Transform Data with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Step 2: Promote first row to headers\n    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Import, Clean & Transform Data — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Step 3: Set data types,    Typed = Table.TransformColumnTypes(Headers, {,        {\"Date\", type date},,        {\"Amount\", type number},,        {\"Product\", type text},,        {\"Region\", type text},    }),,\n\n    // Step 4: Filter rows,    Filtered = Table.SelectRows(Typed, each,        [Date] >= #date(2024, 1, 1) and,        [Amount] > 0,    ),,\n\n    // Step 5: Add calculated column,    WithProfit = Table.AddColumn(Filtered, \"Profit\",,        each [Amount] * 0.3, type number),,\n\n    // Step 6: Group and aggregate,    Grouped = Table.Group(WithProfit, {\"Region\", \"Product\"}, {,        {\"TotalSales\", each List.Sum([Amount]), type number},,        {\"AvgSale\",    each List.Average([Amount]), type number},,        {\"Count\",      each Table.RowCount(_), Int64.Type},    }),,\n\n    // Step 7: Sort,    Sorted = Table.Sort(Grouped, {{\"TotalSales\", Order.Descending}}),in,    Sorted,\n\n// ── Common data source connections ──────────────────,// CSV file:,//   Csv.Document(File.Contents(\"C:\\data\\sales.csv\"),,//     [Delimiter=\",\", Encoding=65001, QuoteStyle=QuoteStyle.None]),//,// SQL Server:,//   Sql.Database(\"server\", \"database\",,//     [Query=\"SELECT * FROM sales WHERE year = 2024\"]),//,// Web/API:,//   Json.Document(Web.Contents(\"https://api.example.com/data\")),//,// Folder (combine multiple files):,//   Folder.Files(\"C:\\data\\monthly\"),\n\n// ── Text transformations ────────────────────────────,// Table.TransformColumns(t, {,//   {\"Name\", Text.Proper},        — Title Case,//   {\"Email\", Text.Lower},        — lowercase,//   {\"Code\", Text.Trim}           — remove whitespace,// }),\n\n// ── Merge (JOIN) two tables ─────────────────────────,// Table.NestedJoin(,//   Orders, {\"CustomerID\"},       — left table + key,//   Customers, {\"ID\"},            — right table + key,//   \"CustomerData\",               — new column name,//   JoinKind.LeftOuter            — join type,// ),// Then: Table.ExpandTableColumn to flatten,\n\n// ── Unpivot (wide → long) ──────────────────────────,// Table.UnpivotOtherColumns(t,,//   {\"Product\"},                  — columns to keep,//   \"Month\",                      — attribute column,//   \"Sales\"                       — value column,// ),// Turns: Product | Jan | Feb | Mar,// Into:  Product | Month | Sales"
                  }
        ],
        tips: [
                  "Every step in Power Query is recorded — you can go back, reorder, or modify any step without redoing later ones.",
                  "Table.Group with multiple aggregations replaces complex SUMIFS/COUNTIFS formulas — group by any columns and aggregate with Sum, Average, Min, Max, Count.",
                  "Merge (NestedJoin) + ExpandTableColumn = VLOOKUP replacement that handles multiple matches and is much faster on large datasets.",
                  "Unpivot converts wide data (months as columns) to long format — essential for proper pivot table and chart analysis."
        ],
        mistake: "Cleaning data manually in Excel cells instead of Power Query — manual changes are lost when data refreshes. Power Query steps are repeatable: refresh the data source and all transformations re-apply automatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData → Refresh\nManual changes lost!\n// More explicit but longer",
          concise: "do all cleaning in Power Query steps; Table.SelectRows(), Table.TransformColumnTypes(), Table.Group(); refresh applies all steps",
        },
      },
      {
        id: "pivot-tables",
        fn: "Pivot Tables & Power Pivot — Dynamic Analysis",
        desc: "Summarize and analyze data with pivot tables, calculated fields, slicers, timelines, and Power Pivot DAX measures.",
        category: "Pivot Tables",
        subtitle: "PivotTable, calculated field, slicer, timeline, Power Pivot, DAX",
        signature: "Insert → PivotTable  |  =GETPIVOTDATA()  |  Calculated Field  |  DAX measures",
        descLong: "Pivot tables dynamically summarize, group, and cross-tabulate data by dragging fields into Rows, Columns, Values, and Filters areas. Calculated fields add custom formulas within the pivot. Slicers and timelines provide interactive visual filters. Power Pivot extends pivot tables with a data model: relate multiple tables, create DAX measures (calculated columns and measures), and handle millions of rows. Together, these transform raw data into interactive dashboards without formulas or VBA.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pivot Tables & Power Pivot — Dynamic Analysis — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Pivot Table field layout ─────────────────────────\n// ROWS:     Category, Product        (group by these)\n// COLUMNS:  Quarter                  (cross-tabulate)\n// VALUES:   Sum of Revenue           (aggregate)\n//           Count of Orders\n//           Average Order Value\n// FILTERS:  Region                   (filter entire pivot)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pivot Tables & Power Pivot — Dynamic Analysis — common patterns you'll see in production.\n// APPROACH  - Combine Pivot Tables & Power Pivot — Dynamic Analysis with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Calculated Fields (in pivot) ────────────────────\n// PivotTable Analyze → Fields, Items & Sets → Calculated Field\n//\n// Profit Margin:  = Revenue - Cost\n// Markup %:       = (Revenue - Cost) / Cost\n// Revenue Per Unit: = Revenue / Quantity"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pivot Tables & Power Pivot — Dynamic Analysis — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Useful PivotTable settings ──────────────────────,// Right-click value → Value Field Settings:,//   Show Values As → % of Grand Total,//   Show Values As → % of Parent Row,//   Show Values As → Running Total,//   Show Values As → Difference From (previous month),//   Show Values As → Rank Smallest to Largest,\n\n// ── GETPIVOTDATA — reference pivot values in cells ──,// =GETPIVOTDATA(\"Revenue\", $A$3, \"Region\", \"West\", \"Year\", 2024),// Returns the Revenue value where Region=West and Year=2024,\n\n// ── Slicers & Timelines ─────────────────────────────,// Insert → Slicer: visual filter buttons for any field,// Insert → Timeline: date-specific filter (months/quarters/years),// Connect slicers to multiple pivots:,//   Right-click slicer → Report Connections → check all pivots,\n\n// ── Power Pivot (Data Model) ────────────────────────,// Power Pivot → Manage → Add tables to data model,// Create relationships between tables (like SQL JOINs),// Diagram View to visualize table relationships,\n\n// ── DAX Measures (Power Pivot) ──────────────────────,// Total Revenue:,//   =SUM(Sales[Revenue]),//,// YTD Revenue (year-to-date running total):,//   =TOTALYTD(SUM(Sales[Revenue]), Calendar[Date]),//,// Previous Year Revenue:,//   =CALCULATE(SUM(Sales[Revenue]), SAMEPERIODLASTYEAR(Calendar[Date])),//,// YoY Growth %:,//   =DIVIDE(,//     [Total Revenue] - [Previous Year Revenue],,//     [Previous Year Revenue],//   ),//,// Moving Average (3 months):,//   =AVERAGEX(,//     DATESINPERIOD(Calendar[Date], LASTDATE(Calendar[Date]), -3, MONTH),,//     [Total Revenue],//   ),//,// Distinct Count (unique customers):,//   =DISTINCTCOUNT(Sales[CustomerID]),//,// Top N Filter:,//   =CALCULATE(,//     [Total Revenue],,//     TOPN(10, ALL(Products[Name]), [Total Revenue]),//   ),\n\n// ── Common DAX patterns ─────────────────────────────,// CALCULATE — change filter context,// FILTER — row-level filter within CALCULATE,// ALL — remove filters (for % of total calculations),// RELATED — follow relationship to get value from related table,// RANKX — rank rows by a measure"
                  }
        ],
        tips: [
                  "\"Show Values As → % of Grand Total\" instantly shows contribution analysis — which products/regions drive the most revenue.",
                  "Connect one slicer to multiple pivot tables — clicking a filter updates all connected pivots simultaneously for interactive dashboards.",
                  "Power Pivot DAX measures like TOTALYTD and SAMEPERIODLASTYEAR handle time intelligence that would require complex formulas otherwise.",
                  "Group dates in pivot tables: right-click a date → Group → select Months, Quarters, Years to auto-create time hierarchies."
        ],
        mistake: "Creating separate summary tables with SUMIFS formulas instead of using a pivot table — pivot tables are dynamic, refreshable, and can be rearranged instantly. SUMIFS formulas are static and must be rewritten for each view.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUMIFS($C:$C, $A:$A, \"Product\", $B:$B, \"Region\")\n// Must rewrite for each combination\n// More explicit but longer",
          concise: "Insert Pivot Table; drag fields to Rows/Columns/Values; % of Grand Total for analysis; slicers for filtering",
        },
      },
      {
        id: "power-query-filtering",
        fn: "Power Query — Filtering & Column Selection",
        desc: "Filter rows with conditions, select/remove columns, and handle missing values.",
        category: "Power Query",
        subtitle: "Table.SelectRows, Table.SelectColumns, Table.RemoveColumns, filtering logic",
        signature: "Table.SelectRows(t, each [column] > value)  |  Table.SelectColumns(t, {\"A\", \"B\"})",
        descLong: "SelectRows filters rows based on a condition applied to each row. SelectColumns picks specific columns by name. RemoveColumns removes unwanted columns. Filtering logic uses each [column] syntax for row-by-row evaluation. Common patterns: date ranges, numeric thresholds, text matching, null handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Filtering & Column Selection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Filter rows by condition ─────────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n    // Keep only rows where Amount > 1000\n    Filtered = Table.SelectRows(Source, each [Amount] > 1000)\nin\n    Filtered"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Filtering & Column Selection — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Filtering & Column Selection with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Multiple filter conditions (AND) ──────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n    Filtered = Table.SelectRows(Source, each\n        [Amount] > 1000 and\n        [Region] = \"West\" and\n        [Date] >= #date(2024, 1, 1)\n    )\nin\n    Filtered"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Filtering & Column Selection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Filter with OR logic ────────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    Filtered = Table.SelectRows(Source, each,        [Product] = \"Widget\" or,        [Product] = \"Gadget\" or,        [Product] = \"Doohickey\",    ),in,    Filtered,\n\n// ── Filter: remove nulls/blanks ──────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    Filtered = Table.SelectRows(Source, each [Notes] <> null and [Notes] <> \"\"),in,    Filtered,\n\n// ── Select specific columns only ─────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    Selected = Table.SelectColumns(Source, {\"Date\", \"Product\", \"Amount\", \"Region\"}),in,    Selected,\n\n// ── Remove unwanted columns ─────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,    Removed = Table.RemoveColumns(Source, {\"InternalID\", \"Debug\", \"Temp\"}),in,    Removed"
                  }
        ],
        tips: [
                  "SelectRows with each [col] evaluates the condition on every row — perfect for date ranges, numeric comparisons, text matching.",
                  "Combine AND/OR logic: each [Amount] > 1000 and ([Region] = \"West\" or [Region] = \"South\").",
                  "SelectColumns is safer than RemoveColumns — explicitly list needed columns to avoid breaking on schema changes.",
                  "Filter nulls: each [col] <> null and [col] <> \"\" removes both missing values and blank strings."
        ],
        mistake: "Using SelectRows twice instead of combining conditions: SelectRows(..., A) → SelectRows(..., B) — inefficient and harder to read. Combine with and/or in one SelectRows.",
        shorthand: {
          verbose: "// Manual / verbose approach\nTable.SelectRows(..., each [Amount] > 1000)\nTable.SelectRows(..., each [Region] = \"West\")\n// More explicit but longer",
          concise: "combine in one: each [Amount] > 1000 and [Region] = \"West\"; SelectColumns lists needed; RemoveColumns for unwanted",
        },
      },
      {
        id: "power-query-merging",
        fn: "Power Query — Merging Queries (Joins)",
        desc: "Join (merge) multiple queries together using various join types.",
        category: "Power Query",
        subtitle: "Table.NestedJoin, JoinKind, ExpandTableColumn, inner/outer/left/right",
        signature: "Table.NestedJoin(left, {key}, right, {key}, \"name\", JoinKind.LeftOuter)",
        descLong: "NestedJoin merges two tables on common keys (like SQL JOIN). Join kinds: Inner (matching rows only), LeftOuter (all left rows, matching right), RightOuter (all right rows, matching left), FullOuter (all rows). Result is nested; use ExpandTableColumn to flatten. This replaces VLOOKUP — handles multiple matches, cleaner logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Merging Queries (Joins) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Left outer join (VLOOKUP equivalent) ──────────────\nlet\n    Orders = Excel.CurrentWorkbook(){[Name=\"Orders\"]}[Content],\n    Customers = Excel.CurrentWorkbook(){[Name=\"Customers\"]}[Content],\n\n    Merged = Table.NestedJoin(\n        Orders, {\"CustomerID\"},\n        Customers, {\"ID\"},\n        \"CustomerData\",\n        JoinKind.LeftOuter\n    ),"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Merging Queries (Joins) — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Merging Queries (Joins) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Flatten the nested table\n    Expanded = Table.ExpandTableColumn(\n        Merged, \"CustomerData\",\n        {\"Name\", \"Email\", \"Country\"},\n        {\"CustomerName\", \"CustomerEmail\", \"CustomerCountry\"}\n    )\nin\n    Expanded"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Merging Queries (Joins) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Inner join (matching rows only) ──────────────────,let,    Orders = Excel.CurrentWorkbook(){[Name=\"Orders\"]}[Content],,    Products = Excel.CurrentWorkbook(){[Name=\"Products\"]}[Content],,,    Merged = Table.NestedJoin(,        Orders, {\"ProductID\"},,        Products, {\"ID\"},,        \"ProductInfo\",,        JoinKind.Inner  // only rows with matching products,    ),,,    Expanded = Table.ExpandTableColumn(,        Merged, \"ProductInfo\",,        {\"Name\", \"Category\", \"Price\"},,        {\"ProductName\", \"ProductCategory\", \"UnitPrice\"},    ),in,    Expanded,\n\n// ── Multi-column join (composite key) ────────────────,let,    Source1 = Sql.Database(\"server\", \"db\", [Query=\"SELECT Year, Month, Region, Sales FROM sales\"]),,    Source2 = Sql.Database(\"server\", \"db\", [Query=\"SELECT Year, Month, Region, Budget FROM budget\"]),,,    Merged = Table.NestedJoin(,        Source1, {\"Year\", \"Month\", \"Region\"},,        Source2, {\"Year\", \"Month\", \"Region\"},,        \"BudgetData\",,        JoinKind.LeftOuter,    ),,,    Expanded = Table.ExpandTableColumn(,        Merged, \"BudgetData\",,        {\"Budget\"},,        {\"Budget\"},    ),,,    WithVariance = Table.AddColumn(Expanded, \"Variance\",,        each [Sales] - [Budget], type number),in,    WithVariance"
                  }
        ],
        tips: [
                  "NestedJoin creates a nested column — you must ExpandTableColumn to flatten it and use the joined data.",
                  "Join kinds: Left/Right for \"all X + matching Y\"; Inner for \"only matching\"; Full for \"all rows from both\".",
                  "Multi-column keys are supported: merge on {Year, Month, Region} for composite lookups.",
                  "NestedJoin handles multiple matches gracefully — if a customer has 3 orders, you get 3 rows (one per order)."
        ],
        mistake: "Forgetting to ExpandTableColumn after NestedJoin — the joined data is nested and unusable. Always expand to flatten.",
        shorthand: {
          verbose: "// Manual / verbose approach\nTable.NestedJoin(...) result: nested table not flattened\n// More explicit but longer",
          concise: "NestedJoin + ExpandTableColumn to flatten; JoinKind.LeftOuter for VLOOKUP behavior; multi-column keys with {col1, col2}",
        },
      },
      {
        id: "power-query-appending",
        fn: "Power Query — Appending Queries (Union/Stack)",
        desc: "Combine rows from multiple queries vertically (append/union).",
        category: "Power Query",
        subtitle: "Table.Combine, appending multiple sources, union all",
        signature: "Table.Combine({Query1, Query2, Query3})",
        descLong: "Combine stacks tables vertically (union/append in SQL terms). Table.Combine takes a list of tables and concatenates all rows. All tables must have compatible columns (same names and order, or let Power Query auto-match by column name). Perfect for combining monthly files into one annual dataset.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Appending Queries (Union/Stack) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Append two queries ──────────────────────────────\nlet\n    Jan = Excel.CurrentWorkbook(){[Name=\"Jan_Sales\"]}[Content],\n    Feb = Excel.CurrentWorkbook(){[Name=\"Feb_Sales\"]}[Content],\n\n    Combined = Table.Combine({Jan, Feb})\nin\n    Combined"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Appending Queries (Union/Stack) — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Appending Queries (Union/Stack) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Append multiple queries from a folder ────────────\nlet\n    FolderContents = Folder.Files(\"C:\\data\\monthly\"),\n    CsvFiles = Table.SelectRows(FolderContents, each [Extension] = \".csv\"),\n\n    LoadAndCombine = Table.AddColumn(CsvFiles, \"Data\",\n        each Csv.Document([Content], [Delimiter=\",\"])),\n\n    ExpandedData = Table.ExpandTableColumn(\n        LoadAndCombine, \"Data\",\n        Table.ColumnNames(Table.FirstN(CsvFiles, 1))\n    ),\n\n    CleanedColumns = Table.SelectColumns(ExpandedData, {\"Date\", \"Product\", \"Sales\", \"Region\"})\nin\n    CleanedColumns"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Appending Queries (Union/Stack) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Append with column mapping (different column names) ──,let,    Table1 = Excel.CurrentWorkbook(){[Name=\"OldFormat\"]}[Content],,    Table2 = Excel.CurrentWorkbook(){[Name=\"NewFormat\"]}[Content],,\n\n    // Rename Table1 columns to match Table2,    Renamed = Table.RenameColumns(Table1, {,        {\"SaleDate\", \"Date\"},,        {\"Item\", \"Product\"},,        {\"Value\", \"Amount\"},    }),,,    Combined = Table.Combine({Renamed, Table2}),in,    Combined"
                  }
        ],
        tips: [
                  "Table.Combine is the easiest way to union multiple tables — just pass a list {t1, t2, t3}.",
                  "Combine files from a folder: use Folder.Files, filter for .csv, load each with Csv.Document, then Combine.",
                  "Column names must match — Power Query auto-matches by name, not position. Rename mismatched columns first.",
                  "Append is faster than merge — use Combine for union, NestedJoin for joins."
        ],
        mistake: "Tables with different column names or counts — Combine will create separate columns and fill with nulls. Always standardize columns before Combine: rename or select same columns in same order.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLoad each CSV separately, then manually paste into one table\n// More explicit but longer",
          concise: "Folder.Files → filter .csv → Csv.Document → Table.Combine({list}) for vertical stacking",
        },
      },
      {
        id: "power-query-grouping",
        fn: "Power Query — Grouping & Aggregation",
        desc: "Group by columns and aggregate with Sum, Average, Count, Min, Max, etc.",
        category: "Power Query",
        subtitle: "Table.Group, aggregation operations, List functions",
        signature: "Table.Group(t, {\"Col\"}, {{\"Agg\", each List.Sum([Col]), type number}})",
        descLong: "Group creates subtotals across groups. Specify group-by columns and aggregation operations. Operations: Sum, Average, Min, Max, Count, RowCount, StandardDeviation, Median. Result is a compact summarized table. More powerful than pivot — you choose exact operations and naming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Grouping & Aggregation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Simple group and sum ────────────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n\n    Grouped = Table.Group(Source, {\"Region\"},\n        {\n            {\"TotalSales\", each List.Sum([Amount]), type number},\n            {\"Count\", each Table.RowCount(_), Int64.Type}\n        }\n    )\nin\n    Grouped"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Grouping & Aggregation — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Grouping & Aggregation with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Group by multiple columns ───────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n\n    Grouped = Table.Group(Source, {\"Region\", \"Product\"},\n        {\n            {\"TotalSales\", each List.Sum([Amount]), type number},\n            {\"AvgSale\", each List.Average([Amount]), type number},\n            {\"MinSale\", each List.Min([Amount]), type number},\n            {\"MaxSale\", each List.Max([Amount]), type number},\n            {\"Count\", each Table.RowCount(_), Int64.Type}\n        }\n    ),\n\n    Sorted = Table.Sort(Grouped, {{\"TotalSales\", Order.Descending}})\nin\n    Sorted"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Grouping & Aggregation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Group with text aggregation (list values) ──────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Orders\"]}[Content],,,    Grouped = Table.Group(Source, {\"CustomerID\"},,        {,            {\"Customer\", each List.First([CustomerName]), type text},,            {\"OrderIDs\", each Text.Combine([OrderID], \", \"), type text},,            {\"TotalAmount\", each List.Sum([Amount]), type number},,            {\"OrderCount\", each Table.RowCount(_), Int64.Type},        },    ),in,    Grouped"
                  }
        ],
        tips: [
                  "List.Sum, List.Average, List.Min, List.Max aggregate column values in each group.",
                  "Table.RowCount(_) counts rows in each group — use for frequency counts.",
                  "Group by multiple columns for cross-tabulation (Region × Product).",
                  "Sort after grouping to show top groups first: Table.Sort(Grouped, {{\"TotalSales\", Order.Descending}})."
        ],
        mistake: "Using aggregate functions without Table.Group — just selecting a column loses row-level detail. Group to intentionally summarize.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual pivot table or SUMIFS for every combination\n// More explicit but longer",
          concise: "Table.Group({cols}, {{op, each List.Sum([col])}}); sort by aggregate descending",
        },
      },
      {
        id: "power-query-pivoting",
        fn: "Power Query — Pivoting & Unpivoting Data",
        desc: "Transform wide data to long (unpivot) or long to wide (pivot) using M language.",
        category: "Power Query",
        subtitle: "Table.Pivot, Table.Unpivot, reshaping, wide to long",
        signature: "Table.UnpivotOtherColumns(t, {\"A\"}, \"Month\", \"Sales\")  |  Table.Pivot(...)",
        descLong: "Unpivot converts wide data (months as columns) to long format (rows). Pivot does the reverse. Unpivot is more common — data from spreadsheets is often wide, but analytics requires long format. Specify which columns to keep and name the attribute/value columns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Pivoting & Unpivoting Data — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Unpivot (wide to long) ─────────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"WideSales\"]}[Content],\n    // Input: Product | Jan | Feb | Mar | Apr | ...\n    // Output: Product | Month | Sales\n\n    Unpivoted = Table.UnpivotOtherColumns(Source,\n        {\"Product\"},          // keep these columns\n        \"Month\",              // attribute column name\n        \"Sales\"               // value column name\n    )\nin\n    Unpivoted"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Pivoting & Unpivoting Data — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Pivoting & Unpivoting Data with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Unpivot specific columns ────────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n    // Input: ProductID | Product | Q1 | Q2 | Q3 | Q4\n\n    Unpivoted = Table.Unpivot(Source,\n        {\"Q1\", \"Q2\", \"Q3\", \"Q4\"},  // columns to unpivot\n        \"Quarter\",                 // attribute name\n        \"Revenue\"                  // value name\n    )\nin\n    Unpivoted"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Pivoting & Unpivoting Data — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Pivot (long to wide) ────────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"LongSales\"]}[Content],,    // Input: Date | Region | Sales,    // Output: Date | North | South | East | West,,    Pivoted = Table.Pivot(Source,,        List.Distinct(Source[Region]),  // all unique Region values → columns,        \"Region\",                         // column to pivot,        \"Sales\",                          // aggregation column,        List.Sum                          // aggregation function,    ),in,    Pivoted"
                  }
        ],
        tips: [
                  "UnpivotOtherColumns is the most common — it pivots all non-specified columns into a single attribute/value pair.",
                  "Unpivoted data is easier for charts, pivot tables, and analytics — long format is the standard in data science.",
                  "Pivot requires specifying the exact values to pivot to (regions, months) — use List.Distinct to find them.",
                  "Aggregation function in Pivot: List.Sum, List.Average, List.First, or custom functions."
        ],
        mistake: "Loading wide data directly into a pivot table — it works but is inefficient. Unpivot in Power Query first, then use the long data for pivots and charts.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLoad Product | Jan | Feb | Mar as-is\n// More explicit but longer",
          concise: "UnpivotOtherColumns({Product}, Month, Sales); long format for all analysis",
        },
      },
      {
        id: "power-query-custom-columns",
        fn: "Power Query — Custom Columns & Conditional Logic",
        desc: "Add calculated columns with if-then-else, text, and date operations.",
        category: "Power Query",
        subtitle: "Table.AddColumn, if...then...else, conditional columns",
        signature: "Table.AddColumn(t, \"NewCol\", each if [col]>100 then \"High\" else \"Low\")",
        descLong: "AddColumn creates new columns using expressions. Conditional columns use if-then-else for logic. Expressions can reference any column via [ColumnName] syntax. Operations: arithmetic, text (concatenation, UPPER, LOWER, TRIM), dates, type conversions. Every row is evaluated independently.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Custom Columns & Conditional Logic — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Simple calculated column ────────────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n\n    WithMargin = Table.AddColumn(Source, \"Profit\",\n        each [Revenue] - [Cost], type number)\nin\n    WithMargin"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Custom Columns & Conditional Logic — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Custom Columns & Conditional Logic with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Conditional column (if-then-else) ───────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],\n\n    WithTier = Table.AddColumn(Source, \"Tier\",\n        each if [Revenue] >= 100000 then \"Enterprise\"\n             else if [Revenue] >= 10000 then \"Business\"\n             else \"Starter\", type text)\nin\n    WithTier"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Custom Columns & Conditional Logic — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Text concatenation ──────────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Customers\"]}[Content],,,    WithFullName = Table.AddColumn(Source, \"FullName\",,        each [FirstName] & \" \" & [LastName], type text),,,    WithEmail = Table.AddColumn(WithFullName, \"Email\",,        each Text.Lower([FirstName] & \".\" & [LastName] & \"@company.com\"), type text),in,    WithEmail,\n\n// ── Date operations ─────────────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Orders\"]}[Content],,,    WithMonth = Table.AddColumn(Source, \"Month\",,        each Date.ToText([OrderDate], \"YYYY-MM\"), type text),,,    WithQuarter = Table.AddColumn(WithMonth, \"Quarter\",,        each \"Q\" & Text.From(Date.QuarterOfYear([OrderDate])), type text),,,    WithDayOfWeek = Table.AddColumn(WithQuarter, \"DayName\",,        each Date.DayOfWeekName([OrderDate]), type text),in,    WithDayOfWeek,\n\n// ── Logic with AND/OR ───────────────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,,    WithFlag = Table.AddColumn(Source, \"HighValue\",,        each if [Revenue] > 50000 and [Quantity] >= 100 then TRUE else FALSE, type logical),in,    WithFlag"
                  }
        ],
        tips: [
                  "Use [ColumnName] to reference any column in the current row — case-sensitive in M language.",
                  "Nested if-then-else for multiple conditions: if A then X else if B then Y else Z.",
                  "Text.Lower, Text.Upper, Text.Proper for case conversion; Text.Trim for whitespace removal.",
                  "Date functions: Date.ToText, Date.DayOfWeekName, Date.QuarterOfYear for extracting date parts."
        ],
        mistake: "Using complex nested ifs without a default — if all conditions are false, result is null. Always end with \"else default\".",
        shorthand: {
          verbose: "// Manual / verbose approach\nif [col] >= 100000 then \"Enterprise\" else if [col] >= 10000 then \"Business\" else \"Starter\"\n// More explicit but longer",
          concise: "Table.AddColumn(t, \"Tier\", each if..then..else, type); use Text.Lower/Upper; Date.ToText for formatting",
        },
      },
      {
        id: "power-query-data-types",
        fn: "Power Query — Data Type Transformations",
        desc: "Convert and transform column data types, parse dates, and handle type mismatches.",
        category: "Power Query",
        subtitle: "Table.TransformColumnTypes, type conversions, date parsing",
        signature: "Table.TransformColumnTypes(t, {{\"Col\", type text}, {\"Date\", type date}})",
        descLong: "TransformColumnTypes converts columns to specific types (text, number, date, logical, etc.). Applying types early prevents errors. Date parsing can be tricky — specify the exact format (e.g., \"YYYY-MM-DD\"). Type mismatch causes errors; use try/otherwise to handle gracefully.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Data Type Transformations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Set data types on import ────────────────────────\nlet\n    Source = Csv.Document(File.Contents(\"C:\\data\\sales.csv\"),\n        [Delimiter=\",\", Encoding=65001]),\n\n    PromotedHeaders = Table.PromoteHeaders(Source),\n\n    TypedColumns = Table.TransformColumnTypes(PromotedHeaders, {\n        {\"Date\", type date},\n        {\"ProductID\", Int64.Type},\n        {\"Quantity\", Int64.Type},\n        {\"UnitPrice\", type number},\n        {\"Region\", type text},\n        {\"SalesPersonID\", Int64.Type}\n    })\nin\n    TypedColumns"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Data Type Transformations — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Data Type Transformations with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Parse date with custom format ───────────────────\nlet\n    Source = Excel.CurrentWorkbook(){[Name=\"Orders\"]}[Content],"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Data Type Transformations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Input date: \"01-Jan-2024\",    DateColumn = Table.TransformColumns(Source,,        {{\"OrderDate\", (col) => Date.FromText(col, \"DD-MMM-YYYY\"), type date}},    ),in,    DateColumn,\n\n// ── Conditional type conversion ──────────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Mixed\"]}[Content],,,    SafeConvert = Table.AddColumn(Source, \"NumericValue\",,        each try Number.FromText([Amount]) otherwise null, type number),,,    TypedColumns = Table.TransformColumnTypes(SafeConvert,,        {{\"NumericValue\", type number}},    ),in,    TypedColumns,\n\n// ── Text to date/number conversions ──────────────────,let,    Source = Excel.CurrentWorkbook(){[Name=\"Data\"]}[Content],,,    AsNumbers = Table.TransformColumns(Source, {,        {\"Price\", Number.FromText},,        {\"Discount\", Number.FromText},    }),,,    AsDates = Table.TransformColumns(AsNumbers, {,        {\"StartDate\", Date.FromText},,        {\"EndDate\", Date.FromText},    }),in,    AsDates"
                  }
        ],
        tips: [
                  "Apply types immediately after loading — prevents cascading errors downstream.",
                  "Date.FromText(col, \"format\") for custom date formats; use \"YYYY-MM-DD\" for ISO standard.",
                  "try Number.FromText otherwise null handles invalid numbers gracefully — returns null instead of error.",
                  "Int64.Type for integers, type number for decimals, type text for all strings."
        ],
        mistake: "Forgetting to type imported CSV — all columns default to text, causing calculation errors. Always TransformColumnTypes after import.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLoad CSV → all text → manual conversions\n// More explicit but longer",
          concise: "TransformColumnTypes after import; Date.FromText with format; try/otherwise for safe conversion",
        },
      },
      {
        id: "power-query-folder-loading",
        fn: "Power Query — Loading & Combining Files from Folder",
        desc: "Automatically load and combine multiple CSV, Excel, or text files from a folder.",
        category: "Power Query",
        subtitle: "Folder.Files, combining multiple files, batch import",
        signature: "Folder.Files(\"C:\\path\") → filter by extension → load each → combine",
        descLong: "Folder.Files lists all files in a directory. Filter by extension (.csv, .xlsx), load each with the appropriate function (Csv.Document, Excel.Workbook), expand the data column, and Combine. This is the standard pattern for ingesting monthly reports or multiple data sources into a single dataset.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Loading & Combining Files from Folder — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Combine all CSVs from a folder ──────────────────\nlet\n    FolderPath = \"C:\\data\\monthly_reports\",\n\n    Source = Folder.Files(FolderPath),\n    FilteredFiles = Table.SelectRows(Source, each [Extension] = \".csv\"),\n\n    AddFileContent = Table.AddColumn(FilteredFiles, \"Content\",\n        each Csv.Document([Content], [Delimiter=\",\", Encoding=65001])),\n\n    ExpandContent = Table.ExpandTableColumn(AddFileContent, \"Content\",\n        {\"Date\", \"Product\", \"Sales\", \"Region\"}, {\"Date\", \"Product\", \"Sales\", \"Region\"}),\n\n    FinalColumns = Table.SelectColumns(ExpandContent, {\"Date\", \"Product\", \"Sales\", \"Region\"})\nin\n    FinalColumns"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Loading & Combining Files from Folder — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Loading & Combining Files from Folder with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Combine Excel files from folder ──────────────────\nlet\n    FolderPath = \"C:\\reports\\regional\",\n\n    Source = Folder.Files(FolderPath),\n    FilteredFiles = Table.SelectRows(Source, each [Extension] = \".xlsx\"),\n\n    AddData = Table.AddColumn(FilteredFiles, \"Data\",\n        each Excel.Workbook([Content]){0}[Data]),  // first sheet, named \"Data\"\n\n    Combined = Table.Combine(AddData[Data])\nin\n    Combined"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Loading & Combining Files from Folder — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Load with file name as a column (for tracking) ──,let,    FolderPath = \"C:\\data\\monthly\",,,    Source = Folder.Files(FolderPath),,    FilteredFiles = Table.SelectRows(Source, each [Extension] = \".csv\"),,,    LoadAndTag = Table.AddColumn(FilteredFiles, \"Data\",,        each Csv.Document([Content], [Delimiter=\",\"])),,,    Expanded = Table.ExpandTableColumn(LoadAndTag, \"Data\",,        {\"Date\", \"Sales\", \"Region\"}),,\n\n    // Keep file name for traceability,    WithSource = Table.SelectColumns(Expanded, {\"Name\", \"Date\", \"Sales\", \"Region\"}),,    Renamed = Table.RenameColumns(WithSource, {{\"Name\", \"SourceFile\"}}),in,    Renamed"
                  }
        ],
        tips: [
                  "Folder.Files is the gateway function — it lists all files with metadata (name, size, date modified).",
                  "Filter by [Extension] = \".csv\" or \".xlsx\" to select the right file type.",
                  "ExpandTableColumn after AddColumn to flatten the loaded data into columns.",
                  "Keep the source file name for traceability — useful for debugging and data lineage."
        ],
        mistake: "Hardcoding individual file names instead of using Folder.Files — adding one new file requires code changes. Folder.Files auto-discovers all files.",
        shorthand: {
          verbose: "// Manual / verbose approach\nOpen each CSV file manually, copy data, paste into Excel\n// More explicit but longer",
          concise: "Folder.Files → filter .csv → Csv.Document → ExpandTableColumn → Combine",
        },
      },
      {
        id: "power-query-parameters",
        fn: "Power Query — Parameters & Dynamic Data Sources",
        desc: "Create parameters to make queries dynamic — users change a value, query refreshes with new data.",
        category: "Power Query",
        subtitle: "Parameters, parameterized queries, dynamic source cells",
        signature: "Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content]{0}[ParameterName]",
        descLong: "Parameters are named values that make queries dynamic. Define a parameter table in Excel (e.g., StartDate, EndDate, Region), reference it in your query. When the user updates the parameter cell, refresh the query — it uses the new value. Perfect for: date range filters, region selection, year-to-date analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Parameters & Dynamic Data Sources — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Parameter table in Excel ────────────────────────\n// Sheet: Parameters\n// A1: StartDate    B1: 2024-01-01\n// A2: EndDate      B2: 2024-12-31\n// A3: Region       B3: West"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Parameters & Dynamic Data Sources — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Parameters & Dynamic Data Sources with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Query using parameters ──────────────────────────\nlet\n    // Read parameter values from Excel\n    ParamTable = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content],\n    StartDate = ParamTable{0}[StartDate],\n    EndDate = ParamTable{0}[EndDate],\n    TargetRegion = ParamTable{0}[Region],"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Parameters & Dynamic Data Sources — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Use parameters in the query,    Source = Sql.Database(\"server\", \"database\",,        [Query = \"SELECT * FROM sales WHERE \" &,                 \"Date >= '\" & Date.ToText(StartDate, \"yyyy-MM-dd\") & \"' AND \" &,                 \"Date <= '\" & Date.ToText(EndDate, \"yyyy-MM-dd\") & \"' AND \" &,                 \"Region = '\" & TargetRegion & \"'\"]),,,    Filtered = Table.SelectRows(Source, each,        [Date] >= StartDate and [Date] <= EndDate and [Region] = TargetRegion),in,    Filtered,\n\n// ── Dynamic list parameter (dropdown in Excel) ──────,// Sheet: Parameters,// A1: SelectedYear    B1: 2024 (or use Data Validation dropdown),,let,    ParamTable = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content],,    SelectedYear = ParamTable{0}[SelectedYear],,,    Source = Excel.CurrentWorkbook(){[Name=\"Sales\"]}[Content],,,    Filtered = Table.SelectRows(Source, each,        Date.Year([Date]) = SelectedYear),in,    Filtered,\n\n// ── Multiple parameters for cascading filters ───────,let,    Params = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content],,    Country = Params{0}[Country],,    State = Params{1}[State],,    City = Params{2}[City],,,    Source = Sql.Database(\"server\", \"db\", [Query=\"SELECT * FROM addresses\"]),,,    Filtered = Table.SelectRows(Source, each,        [Country] = Country and [State] = State and [City] = City),in,    Filtered"
                  }
        ],
        tips: [
                  "Use a dedicated Parameters sheet for all dynamic inputs — easy for users to change without editing M code.",
                  "Data Validation dropdown on parameter cells — users select from a list rather than free-typing.",
                  "Combine parameter values into SQL WHERE clauses for filtered queries — faster than loading all data and filtering in M.",
                  "Multiple parameters enable cascading: select Country → State options change → select State → City options change."
        ],
        mistake: "Hardcoding date ranges or filter values — changing them requires editing M code. Use parameter tables so non-technical users can adjust.",
        shorthand: {
          verbose: "// Manual / verbose approach\nQuery: Select * WHERE Date >= 2024-01-01 AND Region = \"West\"\n(need to edit code for different dates/regions)\n// More explicit but longer",
          concise: "Parameters sheet with StartDate, EndDate, Region cells; reference via {0}[ParameterName] in query",
        },
      },
      {
        id: "power-query-refresh",
        fn: "Power Query — Refresh & Connection Settings",
        desc: "Configure automatic refresh schedules, update data sources, and manage connection credentials.",
        category: "Power Query",
        subtitle: "refresh settings, background refresh, credentials, data source properties",
        signature: "Data → Queries & Connections → properties → set refresh interval",
        descLong: "Queries can refresh on demand or on a schedule. Background refresh allows work to continue while data loads. Connection properties let you change data source paths. Credentials can be stored in Excel or entered per session. Scheduled refresh in Excel Online or Power BI automates data updates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query — Refresh & Connection Settings — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Refresh options (via UI, applies to all queries) ──\nData → Queries & Connections\nRight-click query → Properties\nRefresh tab:\n  ☐ Enable background refresh\n  ☐ Refresh data when opening file\n  [Schedule refresh:] [✓] Every [15] minutes"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query — Refresh & Connection Settings — common patterns you'll see in production.\n// APPROACH  - Combine Power Query — Refresh & Connection Settings with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Programmatic refresh via VBA ────────────────────\nSub RefreshAllQueries()\n    ThisWorkbook.Connections(\"Query - Sales\").Refresh\n    ThisWorkbook.Connections(\"Query - Customers\").Refresh\n    MsgBox \"All queries refreshed!\", vbInformation\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query — Refresh & Connection Settings — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Change data source path (for portable workbooks) ──,' SQL Server connection with dynamic server name:,let,    ServerName = Excel.CurrentWorkbook(){[Name=\"Parameters\"]}[Content]{0}[Server],,    DatabaseName = \"Sales2024\",,,    Source = Sql.Database(ServerName, DatabaseName,,        [Query=\"SELECT * FROM transactions\"]),in,    Source,\n\n// ── Credentials and authentication ───────────────────,' Power Query remembers credentials per query,' Edit → Query Options → Data Source Settings:,'   - Store credentials securely,'   - Use Windows authentication (Single Sign-On),'   - Prompt for credentials on refresh (less secure),\n\n// ── Handle refresh errors gracefully ──────────────────,Sub SafeRefresh(),    On Error GoTo ErrorHandler,,    Application.ScreenUpdating = False,    ThisWorkbook.Connections(\"Query - Sales\").Refresh,,    MsgBox \"Refresh successful!\", vbInformation,    Exit Sub,,ErrorHandler:,    MsgBox \"Refresh failed: \" & Err.Description, vbCritical,End Sub"
                  }
        ],
        tips: [
                  "Enable background refresh so users can keep working — data loads without freezing the workbook.",
                  "Schedule refresh for off-peak hours — reduces server load and improves user experience.",
                  "Use Windows Authentication (SSO) for SQL Server — avoids storing passwords in Excel.",
                  "Store data sources in parameter tables — makes workbooks portable (just change the server/database name)."
        ],
        mistake: "Hardcoding server/database names in connection strings — moving the workbook to a different environment requires rewriting queries. Use parameter tables.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData → Queries & Connections → manually select each query → Properties → set refresh\n// More explicit but longer",
          concise: "Enable background refresh; schedule for off-peak; use parameters for dynamic server names; VBA: Connections(\"Query\").Refresh",
        },
      },
    ],
  },
]

export default { meta, sections }

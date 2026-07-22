export const meta = {
  "title": "DAX — Power BI",
  "domain": "dax",
  "sheet": "core",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Core Functions ─────────────────────────────────────────
  {
    id: "core-functions",
    title: "Core Functions",
    entries: [
      {
        id: "calculate",
        fn: "CALCULATE",
        desc: "Evaluate an expression in a modified filter context — the most important DAX function.",
        category: "Core",
        subtitle: "Modify the filter context for any measure",
        signature: "CALCULATE(expression, filter1, filter2, ...)",
        descLong: "CALCULATE is the engine of DAX. It evaluates an expression after replacing or extending the current filter context with the filters you supply. Every other advanced DAX pattern builds on CALCULATE. Filters can be table filters, boolean conditions, or modifier functions like ALL().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CALCULATE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nTotal Sales = SUM(Sales[Amount])\n// Sales for Electronics only — ignores the slicer on Category\nElectronics Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    Sales[Category] = \"Electronics\"\n)\n// → Returns Electronics total regardless of what category filter is active"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CALCULATE — common patterns you'll see in production.\n-- APPROACH  - Combine CALCULATE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSales 2024 Electronics =\nCALCULATE(\n    SUM(Sales[Amount]),\n    Sales[Category] = \"Electronics\",\n    YEAR(Sales[Date]) = 2024\n)\n% of Total Sales =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALL(Sales[Category]))\n)\n// → Numerator respects category filter; denominator ignores it"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CALCULATE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSales Top Regions =\nCALCULATE(\n    SUM(Sales[Amount]),\n    KEEPFILTERS(Sales[Region] IN {\"North\", \"West\"})\n)\nWeighted Score =\nSUMX(\n    Products,\n    CALCULATE(SUM(Sales[Amount])) * Products[Weight]\n)\n// → Each row's filter context isolates that product's sales automatically"
                  }
        ],
        tips: [
                  "CALCULATE is the only function that can modify filter context — everything else just reads it",
                  "Multiple filter arguments are AND conditions — use CALCULATETABLE for OR logic",
                  "`CALCULATE(expr)` with no filters still performs context transition — useful inside iterators"
        ],
        mistake: "Writing `CALCULATE(SUM(Sales[Amount]), Sales[Category] = \"Electronics\" || Sales[Category] = \"Clothing\")` — OR conditions in CALCULATE filters don't work this way. Use `Sales[Category] IN {\"Electronics\", \"Clothing\"}` instead.",
        shorthand: {
          verbose: "// Verbose: multiple nested CALCULATE calls\nTotal Sales =\nCALCULATE(\n    CALCULATE(\n        SUM(Sales[Amount]),\n        Sales[Category] = \"Electronics\"\n    ),\n    YEAR(Sales[Date]) = 2024\n)",
          concise: "// Concise: stack filters in one CALCULATE\nElectronics 2024 = CALCULATE(SUM(Sales[Amount]), Sales[Category]=\"Electronics\", YEAR(Sales[Date])=2024)",
        },
      },
      {
        id: "filter",
        fn: "FILTER",
        desc: "Return a filtered table — used inside CALCULATE or as input to other functions.",
        category: "Core",
        subtitle: "Table-returning function for complex filter logic",
        signature: "FILTER(table, condition)",
        descLong: "FILTER iterates over every row of a table and returns only rows where the condition is TRUE. It returns a table, so it's used as input to CALCULATE, SUMX, or other table functions — not directly in a measure on its own. Use it when boolean filter syntax in CALCULATE isn't powerful enough.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FILTER — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nHigh Value Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(Sales, Sales[Amount] > 1000)\n)\n// → Sums only orders over $1000"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FILTER — common patterns you'll see in production.\n-- APPROACH  - Combine FILTER with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nHigh Margin Products =\nCALCULATE(\n    COUNTROWS(Products),\n    FILTER(\n        Products,\n        Products[Price] - Products[Cost] > 50\n    )\n)\nPremium Customer Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        Customers,\n        Customers[Tier] = \"Premium\"\n    )\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FILTER — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Slow:\nCALCULATE(SUM(Sales[Amount]), FILTER(Sales, Sales[Category] = \"Electronics\"))\n// Fast:\nCALCULATE(SUM(Sales[Amount]), Sales[Category] = \"Electronics\")\nTop Products Revenue =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Products),\n        [Product Revenue] > [Average Product Revenue]\n    )\n)\n// → NOTE: ALL() needed to escape current filter context on Products"
                  }
        ],
        tips: [
                  "Prefer boolean filter shorthand over FILTER when possible — the engine optimizes it better",
                  "FILTER always takes a full table scan — on large tables this can be slow",
                  "Use `ALL(table)` inside FILTER to escape the current filter context before filtering"
        ],
        mistake: "Using FILTER when a simple boolean condition would work. `FILTER(Sales, Sales[Year] = 2024)` is slower than `Sales[Year] = 2024` as a direct CALCULATE argument.",
        shorthand: {
          verbose: "// Verbose: FILTER with explicit table reference\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(Sales, Sales[Amount] > 1000)\n)",
          concise: "// Concise: boolean filter shorthand\nCALCULATE(SUM(Sales[Amount]), Sales[Amount] > 1000)",
        },
      },
      {
        id: "all",
        fn: "ALL / ALLEXCEPT",
        desc: "Remove filters from columns or tables — essential for totals, ratios, and benchmarks.",
        category: "Core",
        subtitle: "Clear filter context to calculate across all data",
        signature: "ALL(table | column) | ALLEXCEPT(table, keep_col1, ...)",
        descLong: "ALL() removes filters from a table or specific columns, letting you calculate across the full dataset regardless of slicers or visual filters. ALLEXCEPT() removes all filters except the columns you specify. Both are almost always used inside CALCULATE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ALL / ALLEXCEPT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nGrand Total Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    ALL(Sales)\n)\n// → Always returns the total for all sales, ignoring any slicers"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ALL / ALLEXCEPT — common patterns you'll see in production.\n-- APPROACH  - Combine ALL / ALLEXCEPT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n% of Category Sales =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALL(Sales[Product]))\n)\n// → Numerator = current product; denominator = all products in category\nRegional Share =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALLEXCEPT(Sales, Sales[Region]))\n)\n// → Denominator = total for that region, across all products"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ALL / ALLEXCEPT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n//      ALL(Sales[Category]) only removes the Category filter\n% of Grand Total =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALL(Sales))   // removes ALL filters\n)\n% of Region Total =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALL(Sales[Product], Sales[Category]))\n    // removes Product+Category filters but keeps Region\n)\n// the user's slicer selections — useful for % of visible total\n% of Slicer Selection =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Sales[Product]))\n)"
                  }
        ],
        tips: [
                  "`ALL(table)` removes all filters on that table; `ALL(table[col])` only removes filters on that column",
                  "`ALLSELECTED()` respects slicer context — use it for \"% of what the user selected\"",
                  "ALL functions only work inside CALCULATE — they are filter modifiers, not standalone measures"
        ],
        mistake: "Using `ALL(Sales)` when you only want to clear one column filter. This clears every filter on the Sales table including date, region, etc. Use `ALL(Sales[Product])` to be precise.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: ALL on entire table\nCALCULATE(SUM(Sales[Amount]), ALL(Sales))\n// More explicit but longer",
          concise: "// Concise: ALL on specific column for % of total\nDIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALL(Sales[Category])))",
        },
      },
      {
        id: "related",
        fn: "RELATED / RELATEDTABLE",
        desc: "Follow a relationship to fetch a value from a related table.",
        category: "Core",
        subtitle: "Navigate table relationships in row context",
        signature: "RELATED(column) | RELATEDTABLE(table)",
        descLong: "RELATED() fetches a single value from the \"one\" side of a relationship when you are in row context on the \"many\" side. RELATEDTABLE() returns all rows from the related table matching the current row. Both require an active relationship between the tables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RELATED / RELATEDTABLE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// In Sales table, create a calculated column:\nProduct Name = RELATED(Products[Name])\n// → Each Sales row now shows the product name from the Products table"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RELATED / RELATEDTABLE — common patterns you'll see in production.\n-- APPROACH  - Combine RELATED / RELATEDTABLE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nCategory = RELATED(Products[Category])\nMargin = Sales[Revenue] - RELATED(Products[Cost])\n// → Each row: sales revenue minus the product's cost from Products table\n// In Products table, count how many sales each product has\nSales Count = COUNTROWS(RELATEDTABLE(Sales))\n// → For each product row, returns number of Sales rows linked to it"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RELATED / RELATEDTABLE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nAvg Order Value per Product =\nAVERAGEX(\n    Products,\n    DIVIDE(\n        SUMX(RELATEDTABLE(Sales), Sales[Amount]),\n        COUNTROWS(RELATEDTABLE(Sales))\n    )\n)\n// For the reverse direction, use RELATEDTABLE\nSales by Ship Date =\nCALCULATE(\n    SUM(Sales[Amount]),\n    USERELATIONSHIP(Sales[ShipDate], Calendar[Date])\n)"
                  }
        ],
        tips: [
                  "RELATED works in row context (calculated columns, iterators) — not directly in measures",
                  "RELATEDTABLE is the reverse: from the \"one\" side, get all related rows from the \"many\" side",
                  "For inactive relationships, use `USERELATIONSHIP()` inside `CALCULATE()`"
        ],
        mistake: "Using RELATED in a measure without an iterator. Measures have no row context — wrap in SUMX, AVERAGEX, or another iterator to give RELATED a row to work with.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: lookup via RELATED in a calculated column\nSales[Category] = RELATED(Products[Category])\n// More explicit but longer",
          concise: "// Concise: use RELATED in measure via CALCULATE\nCat Sales = CALCULATE(SUM(Sales[Amount]), Products[Category]=\"Electronics\")",
        },
      },
      {
        id: "if-switch",
        fn: "IF / SWITCH",
        desc: "Conditional logic — IF for binary, SWITCH for multiple branches.",
        category: "Core",
        subtitle: "IF(cond, true, false) | SWITCH(expr, val1, result1, ...)",
        signature: "IF(condition, true_result, false_result) | SWITCH(expression, val, result, ..., else)",
        descLong: "IF() handles true/false branching. SWITCH() is cleaner for multiple conditions — it evaluates an expression against a list of values. SWITCH(TRUE(), ...) is the DAX pattern for complex multi-condition logic, similar to if/elif chains.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of IF / SWITCH — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nPerformance =\nIF(\n    SUM(Sales[Amount]) >= 10000,\n    \"On Target\",\n    \"Below Target\"\n)\n// → \"On Target\" if total sales >= 10000, else \"Below Target\""
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of IF / SWITCH — common patterns you'll see in production.\n-- APPROACH  - Combine IF / SWITCH with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nRegion Label =\nSWITCH(\n    Sales[Region],\n    \"N\", \"North\",\n    \"S\", \"South\",\n    \"E\", \"East\",\n    \"W\", \"West\",\n    \"Unknown\"    // else / default\n)\nSales Tier =\nSWITCH(\n    TRUE(),\n    SUM(Sales[Amount]) >= 50000, \"Platinum\",\n    SUM(Sales[Amount]) >= 20000, \"Gold\",\n    SUM(Sales[Amount]) >= 5000,  \"Silver\",\n    \"Bronze\"\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of IF / SWITCH — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Assumes a \"Metric\" disconnected table with values: Sales, Profit, Qty\nSelected Metric =\nSWITCH(\n    SELECTEDVALUE(Metric[Name], \"Sales\"),\n    \"Sales\",  [Total Sales],\n    \"Profit\", [Total Profit],\n    \"Qty\",    [Total Quantity],\n    [Total Sales]    // default\n)\n// Both branches may be evaluated — avoid heavy calculations in false branch\n// Use VAR to pre-compute expensive values used in multiple branches\nOptimized IF =\nVAR SalesTotal = SUM(Sales[Amount])\nRETURN\nIF(SalesTotal > 0, SalesTotal * 1.1, 0)"
                  }
        ],
        tips: [
                  "`SWITCH(TRUE(), ...)` is the cleanest way to write multi-branch range conditions — avoid deeply nested IFs",
                  "DAX does not guarantee short-circuit evaluation — both IF branches may compute",
                  "Use `VAR` to pre-calculate expensive expressions used in multiple IF/SWITCH branches"
        ],
        mistake: "Nesting IF statements 4–5 levels deep. Use `SWITCH(TRUE(), cond1, result1, cond2, result2, ...)` instead — it's readable and maintainable.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: nested IF for multiple conditions\nStatus = IF(Sales[Amount]>1000,\"High\",IF(Sales[Amount]>500,\"Med\",\"Low\"))\n// More explicit but longer",
          concise: "// Concise: SWITCH for readability\nStatus = SWITCH(TRUE(), Sales[Amount]>1000,\"High\", Sales[Amount]>500,\"Med\", \"Low\")",
        },
      },
      {
        id: "divide",
        fn: "DIVIDE",
        desc: "Safe division that handles divide-by-zero without an error.",
        category: "Core",
        subtitle: "Always use DIVIDE instead of / for business metrics",
        signature: "DIVIDE(numerator, denominator, alternate_result)",
        descLong: "DIVIDE() returns the alternate_result (default BLANK()) when the denominator is zero or BLANK, instead of throwing an error. Using the / operator raises an error on division by zero. DIVIDE is the standard for all business ratios and percentages in Power BI.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DIVIDE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nProfit Margin % =\nDIVIDE(\n    SUM(Sales[Profit]),\n    SUM(Sales[Revenue])\n)\n// → Returns BLANK (shows as empty) if Revenue is 0, not an error"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DIVIDE — common patterns you'll see in production.\n-- APPROACH  - Combine DIVIDE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nConversion Rate =\nDIVIDE(\n    [Total Conversions],\n    [Total Visitors],\n    0    // return 0 instead of BLANK when no visitors\n)\nYoY Growth % =\nDIVIDE(\n    [Sales This Year] - [Sales Last Year],\n    [Sales Last Year],\n    BLANK()    // explicit BLANK — shows nothing in visual when no prior year\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DIVIDE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Use DIVIDE for all user-facing metrics:\nAvg Order Value = DIVIDE(SUM(Sales[Amount]), COUNTROWS(Sales))\n// Use 0 as alternate only when 0 is a meaningful result, not just a fallback\nEfficient Margin =\nVAR Revenue = SUM(Sales[Revenue])\nVAR Cost    = SUM(Sales[Cost])\nRETURN\nDIVIDE(Revenue - Cost, Revenue)\n// → Revenue computed once, reused in numerator and denominator"
                  }
        ],
        tips: [
                  "Always use `DIVIDE()` instead of `/` in DAX — divide-by-zero errors break visuals silently",
                  "The third argument defaults to `BLANK()` — use `0` only when zero is semantically meaningful",
                  "BLANK in Power BI visuals usually displays as empty cell — this is generally preferable to 0 for missing data"
        ],
        mistake: "Using `/` operator and getting \"Calculation error\" in visuals when a filter returns no data. Replace every `a / b` with `DIVIDE(a, b)` as a habit.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: IFERROR + DIVIDE guard\nPct = IFERROR(SUM(Sales[A])/SUM(Sales[B]), 0)\n// More explicit but longer",
          concise: "// Concise: DIVIDE handles divide-by-zero\nPct = DIVIDE(SUM(Sales[A]), SUM(Sales[B]), 0)",
        },
      },
      {
        id: "selectedvalue",
        fn: "SELECTEDVALUE / VALUES",
        desc: "Read what a slicer or filter has selected — essential for dynamic measures.",
        category: "Core",
        subtitle: "Get the current filter selection for dynamic logic",
        signature: "SELECTEDVALUE(column, alternate) | VALUES(column)",
        descLong: "SELECTEDVALUE() returns the single selected value from a column in the current filter context, or the alternate result if multiple values are selected. VALUES() returns a table of distinct values still visible after filtering. Both are key for parameter-driven and dynamic measures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SELECTEDVALUE / VALUES — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSelected Year =\nSELECTEDVALUE(\n    Calendar[Year],\n    \"All Years\"    // shown when multiple years selected\n)\n// → \"2024\" when user picks 2024 in a slicer, \"All Years\" otherwise"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SELECTEDVALUE / VALUES — common patterns you'll see in production.\n-- APPROACH  - Combine SELECTEDVALUE / VALUES with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Assumes a \"Scenario\" table with values: Optimistic, Base, Pessimistic\nForecast =\nSWITCH(\n    SELECTEDVALUE(Scenario[Name], \"Base\"),\n    \"Optimistic\",   [Revenue] * 1.15,\n    \"Base\",         [Revenue],\n    \"Pessimistic\",  [Revenue] * 0.85\n)\nVisible Regions =\nCONCATENATEX(\n    VALUES(Sales[Region]),\n    Sales[Region],\n    \", \"\n)\n// → \"North, East\" when those regions are filtered in"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SELECTEDVALUE / VALUES — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDynamic Title =\nIF(\n    HASONEVALUE(Calendar[Year]),\n    \"Sales for \" & SELECTEDVALUE(Calendar[Year]),\n    \"Sales — All Years\"\n)\nTop Category Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    TOPN(1, VALUES(Sales[Category]), [Total Sales])\n)\n// → Sales for whichever category ranks #1 in the current filter context"
                  }
        ],
        tips: [
                  "Always provide an alternate result in `SELECTEDVALUE()` — it handles the multi-selection case cleanly",
                  "`HASONEVALUE(col)` is a clean boolean check before reading a single value",
                  "`VALUES()` includes BLANK if the column has blanks — use `DISTINCT()` to exclude them"
        ],
        mistake: "Using `SELECTEDVALUE()` without an alternate and then being surprised when a multi-select slicer breaks the measure. Always pass a sensible default as the second argument.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: HASONEVALUE + VALUES to get selected value\nSelYear = IF(HASONEVALUE(Calendar[Year]), VALUES(Calendar[Year]), \"All\")\n// More explicit but longer",
          concise: "// Concise: SELECTEDVALUE does both\nSelYear = SELECTEDVALUE(Calendar[Year], \"All\")",
        },
      },
    ],
  },

  // ── Section 2: Aggregations ─────────────────────────────────────────
  {
    id: "aggregations",
    title: "Aggregations",
    entries: [
      {
        id: "basic-agg",
        fn: "SUM / COUNT / AVERAGE",
        desc: "Core aggregation functions — operate over a column in the current filter context.",
        category: "Aggregation",
        subtitle: "SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTROWS",
        signature: "SUM(column) | AVERAGE(column) | COUNT(column) | COUNTROWS(table)",
        descLong: "Basic aggregation functions collapse a column to a single value respecting the current filter context. COUNT counts numeric values; COUNTA counts non-blank values of any type; COUNTROWS counts rows in a table. These are the building blocks for every measure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUM / COUNT / AVERAGE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nTotal Sales   = SUM(Sales[Amount])\nAvg Order     = AVERAGE(Sales[Amount])\nMax Sale      = MAX(Sales[Amount])\nMin Sale      = MIN(Sales[Amount])\n// COUNT vs COUNTA vs COUNTROWS\nNum Numeric   = COUNT(Sales[Amount])      // counts numeric values only\nNum Non-Blank = COUNTA(Sales[OrderID])    // counts any non-blank\nNum Rows      = COUNTROWS(Sales)          // counts all rows in table"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUM / COUNT / AVERAGE — common patterns you'll see in production.\n-- APPROACH  - Combine SUM / COUNT / AVERAGE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nUnique Customers = DISTINCTCOUNT(Sales[CustomerID])\nLarge Orders =\nCALCULATE(\n    COUNTROWS(Sales),\n    Sales[Amount] > AVERAGE(Sales[Amount])\n)\nCustomers with Sales =\nCOUNTROWS(\n    FILTER(Customers, COUNTROWS(RELATEDTABLE(Sales)) > 0)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUM / COUNT / AVERAGE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSales vs Budget =\nVAR Actual = SUM(Sales[Amount])\nVAR Budget = SUM(Budget[Amount])\nRETURN\nDIVIDE(Actual - Budget, Budget)\n// Slow pattern (calculated column + SUM):\n//   Margin column = Sales[Revenue] - Sales[Cost]\n//   Total Margin  = SUM(Sales[Margin])\n// Better (measure only, no stored column):\nTotal Margin = SUMX(Sales, Sales[Revenue] - Sales[Cost])"
                  }
        ],
        tips: [
                  "`COUNTROWS(table)` is more reliable than `COUNT(column)` — it counts rows, not values",
                  "`DISTINCTCOUNT()` is expensive on large columns — use only when uniqueness matters",
                  "Prefer `SUMX` over a calculated column + SUM when the calculation is row-level"
        ],
        mistake: "Using `COUNT(Sales[OrderID])` expecting row count. COUNT only counts numeric values — use `COUNTA(Sales[OrderID])` or `COUNTROWS(Sales)` for text/all rows.",
        shorthand: {
          verbose: "// Verbose: separate measures for each aggregation\nTotalQty = SUM(Sales[Qty])\nAvgPrice = AVERAGE(Sales[Price])\nMinDate = MIN(Sales[Date])",
          concise: "// Concise: single measure with variable\nStats = VAR a=SUM(Sales[Qty]) RETURN a",
        },
      },
      {
        id: "sumx",
        fn: "SUMX",
        desc: "Iterate over a table row by row, evaluate an expression, then sum the results.",
        category: "Aggregation",
        subtitle: "Row-level calculation then aggregation — the X iterator pattern",
        signature: "SUMX(table, expression)",
        descLong: "SUMX iterates over every row in a table, evaluates the expression in the row context of each row, then sums all results. This is how you do row-level calculations (like Revenue × Discount) inside a measure. All X functions (AVERAGEX, MAXX, MINX, RANKX) follow the same pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUMX — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nTotal Revenue =\nSUMX(\n    Sales,\n    Sales[Price] * Sales[Quantity]\n)\n// → Same as a calculated column Revenue = Price*Qty, then SUM — but no stored column"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUMX — common patterns you'll see in production.\n-- APPROACH  - Combine SUMX with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nTotal Profit =\nSUMX(\n    Sales,\n    Sales[Revenue] - RELATED(Products[Cost])\n)\nAvg Margin % =\nAVERAGEX(\n    Sales,\n    DIVIDE(Sales[Revenue] - RELATED(Products[Cost]), Sales[Revenue])\n)\n// → Average margin per order, not margin of totals (which would be different)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUMX — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nHigh Value Profit =\nSUMX(\n    FILTER(Sales, Sales[Amount] > 1000),\n    Sales[Amount] - RELATED(Products[Cost])\n)\n//       + SUM is faster. Use SUMX for measures, calculated columns for\n//       frequently-aggregated row expressions in large models.\nBest Order = MAXX(Sales, Sales[Quantity] * Sales[Price])"
                  }
        ],
        tips: [
                  "SUMX(table, expr) = iterate every row → evaluate expr in row context → sum results",
                  "Use SUMX when the calculation is per-row (like price × qty) and you need the total",
                  "AVERAGEX gives average of row expressions — different from DIVIDE(SUM, COUNT) when rows vary"
        ],
        mistake: "Confusing `SUMX(Sales, Sales[Amount])` with `SUM(Sales[Amount])` — they return the same number but SUMX is slower. Use SUM when summing a single column; use SUMX only when you need a row-level expression.",
        shorthand: {
          verbose: "// Verbose: calculated column then SUM\nSales[LineTotal] = Sales[Qty] * Sales[Price]\nTotalRevenue = SUM(Sales[LineTotal])",
          concise: "// Concise: SUMX in one measure\nTotalRevenue = SUMX(Sales, Sales[Qty] * Sales[Price])",
        },
      },
      {
        id: "rankx",
        fn: "RANKX",
        desc: "Rank items within a table based on a measure — dynamic ranking in any context.",
        category: "Aggregation",
        subtitle: "RANKX(all_table, measure) for relative position",
        signature: "RANKX(table, expression, value, order, ties)",
        descLong: "RANKX iterates over a table to compute the expression for each row, then ranks the current context value against those results. Almost always used with ALL() to rank across all items regardless of the current filter. Order: ASC = 1 is smallest; DESC = 1 is largest (default).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RANKX — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nProduct Rank =\nRANKX(\n    ALL(Products[Name]),     // rank against all products\n    [Total Sales]            // the measure to rank by\n)\n// → In a table visual, each product row shows its sales rank"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RANKX — common patterns you'll see in production.\n-- APPROACH  - Combine RANKX with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nRank Ascending =\nRANKX(\n    ALL(Products[Name]),\n    [Total Sales],\n    ,          // value: blank = use current context\n    ASC        // lowest value gets rank 1\n)\nRank in Category =\nRANKX(\n    ALLEXCEPT(Products, Products[Category]),\n    [Total Sales]\n)\n// → Rank 1 per category, not across all products"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RANKX — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nTop 5 Products Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Products[Name]),\n        RANKX(ALL(Products[Name]), [Total Sales]) <= 5\n    )\n)\nDense Rank =\nRANKX(\n    ALL(Products[Name]),\n    [Total Sales],\n    ,\n    DESC,\n    Dense    // ties share same rank, next rank is sequential\n)\n// Skip (default) = ties share rank, next rank skips (1,2,2,4)"
                  }
        ],
        tips: [
                  "Always use `ALL(table)` or `ALL(column)` in RANKX to rank across all items, not just filtered ones",
                  "RANKX is computed per row in the visual — it can be slow on large tables",
                  "Use `Dense` ties handling for cleaner UX; `Skip` is mathematically traditional"
        ],
        mistake: "Using `RANKX(Products, [Total Sales])` without ALL(). Without ALL, every row ranks as 1 because it's ranking against only itself in the current filter context.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: RANKX with ALL for global ranking\nRank = RANKX(ALL(Products), SUM(Sales[Amount]))\n// More explicit but longer",
          concise: "// Concise: RANKX with ALLSELECTED for visual-scoped ranking\nRank = RANKX(ALLSELECTED(Products), [Total Sales])",
        },
      },
      {
        id: "distinctcount",
        fn: "DISTINCTCOUNT / COUNTROWS",
        desc: "Count unique values or table rows — the two most common counting patterns.",
        category: "Aggregation",
        subtitle: "DISTINCTCOUNT for unique values, COUNTROWS for row counts",
        signature: "DISTINCTCOUNT(column) | COUNTROWS(table | FILTER(...))",
        descLong: "DISTINCTCOUNT counts the number of distinct non-blank values in a column — use it for unique customers, products sold, etc. COUNTROWS counts rows in a table or filtered table — use it instead of COUNT for row-level counting. Both respect the current filter context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DISTINCTCOUNT / COUNTROWS — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nUnique Customers = DISTINCTCOUNT(Sales[CustomerID])\nOrder Count = COUNTROWS(Sales)\n// → Different from DISTINCTCOUNT — counts every order including duplicates"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DISTINCTCOUNT / COUNTROWS — common patterns you'll see in production.\n-- APPROACH  - Combine DISTINCTCOUNT / COUNTROWS with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nPremium Customers =\nCALCULATE(\n    DISTINCTCOUNT(Sales[CustomerID]),\n    Sales[Amount] > 500\n)\n// → Unique customers with at least one order over $500\nLarge Orders =\nCOUNTROWS(\n    FILTER(Sales, Sales[Amount] > 1000)\n)\n// → Number of orders above $1000 in current filter context"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DISTINCTCOUNT / COUNTROWS — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nRetained Customers =\nVAR LastYear =\n    CALCULATETABLE(\n        VALUES(Sales[CustomerID]),\n        DATEADD(Calendar[Date], -1, YEAR)\n    )\nVAR ThisYear = VALUES(Sales[CustomerID])\nRETURN\nCOUNTROWS(INTERSECT(ThisYear, LastYear))\nClean Distinct Count =\nCOUNTROWS(\n    FILTER(VALUES(Sales[CustomerID]), NOT ISBLANK(Sales[CustomerID]))\n)"
                  }
        ],
        tips: [
                  "`COUNTROWS(Sales)` is faster and more reliable than `COUNT(Sales[AnyColumn])`",
                  "`DISTINCTCOUNT()` includes BLANK as a distinct value — filter it out if needed",
                  "For customer/entity counting, `DISTINCTCOUNT()` on ID is the standard pattern"
        ],
        mistake: "Using `COUNT(Sales[CustomerID])` to count distinct customers. COUNT counts occurrences (non-blank), not unique values — use `DISTINCTCOUNT()` for uniqueness.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: DISTINCT + COUNTROWS\nCustCount = COUNTROWS(DISTINCT(Sales[CustomerID]))\n// More explicit but longer",
          concise: "// Concise: DISTINCTCOUNT\nCustCount = DISTINCTCOUNT(Sales[CustomerID])",
        },
      },
    ],
  },

  // ── Section 3: Time Intelligence ─────────────────────────────────────────
  {
    id: "time-intelligence",
    title: "Time Intelligence",
    entries: [
      {
        id: "totalytd",
        fn: "TOTALYTD / TOTALQTD / TOTALMTD",
        desc: "Cumulative totals from the start of the year, quarter, or month to the current date.",
        category: "Time Intelligence",
        subtitle: "Running totals within a time period",
        signature: "TOTALYTD(expression, dates, [filter], [year_end_date])",
        descLong: "TOTALYTD, TOTALQTD, and TOTALMTD are convenience wrappers around CALCULATE + DATESYTD/DATESQTD/DATESMTD. They accumulate a measure from the start of the period through the current date in context. Requires a date table with a continuous date range.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of TOTALYTD / TOTALQTD / TOTALMTD — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSales YTD =\nTOTALYTD(\n    SUM(Sales[Amount]),\n    Calendar[Date]\n)\n// → Jan = Jan sales; Feb = Jan+Feb; Mar = Jan+Feb+Mar; etc."
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of TOTALYTD / TOTALQTD / TOTALMTD — common patterns you'll see in production.\n-- APPROACH  - Combine TOTALYTD / TOTALQTD / TOTALMTD with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSales QTD = TOTALQTD(SUM(Sales[Amount]), Calendar[Date])\nSales MTD = TOTALMTD(SUM(Sales[Amount]), Calendar[Date])\nFiscal YTD =\nTOTALYTD(\n    SUM(Sales[Amount]),\n    Calendar[Date],\n    ,              // no additional filter\n    \"06/30\"        // fiscal year end date\n)\n// → Resets accumulation on July 1 each year"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of TOTALYTD / TOTALQTD / TOTALMTD — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSales YTD Net =\nTOTALYTD(\n    SUM(Sales[Amount]),\n    Calendar[Date],\n    Sales[Type] = \"Sale\"    // optional filter argument\n)\nCustom YTD =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATESYTD(Calendar[Date], \"06/30\")    // fiscal year\n)\n// Mark your Calendar table as Date Table: Table Tools → Mark as Date Table"
                  }
        ],
        tips: [
                  "You must mark your Calendar table as a Date Table for time intelligence functions to work",
                  "The date table must have no gaps — every date from start to end of range must exist",
                  "For fiscal years, use the \"MM/DD\" year-end argument — e.g., \"06/30\" for June fiscal year"
        ],
        mistake: "Using time intelligence functions without a proper Date table marked in the model. They will appear to work but produce wrong results. Always create a Calendar table and mark it as a Date Table.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: manual YTD with FILTER and SAMEPERIODLASTYEAR\nYTD = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Calendar), Calendar[Year]=MAX(Calendar[Year]) && Calendar[Date]<=MAX(Calendar[Date])))\n// More explicit but longer",
          concise: "// Concise: TOTALYTD\nYTD = TOTALYTD(SUM(Sales[Amount]), Calendar[Date])",
        },
      },
      {
        id: "sameperiodlastyear",
        fn: "SAMEPERIODLASTYEAR",
        desc: "Return the same date range from the prior year — the foundation of YoY comparison.",
        category: "Time Intelligence",
        subtitle: "Prior year parallel period for year-over-year analysis",
        signature: "SAMEPERIODLASTYEAR(dates)",
        descLong: "SAMEPERIODLASTYEAR shifts the current date context back exactly one year, returning the equivalent period. Use it inside CALCULATE to get prior year values. Combine with current period measures to compute year-over-year growth.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SAMEPERIODLASTYEAR — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSales LY =\nCALCULATE(\n    SUM(Sales[Amount]),\n    SAMEPERIODLASTYEAR(Calendar[Date])\n)\n// → In a monthly chart, Jan 2024 shows Jan 2023 value, Feb 2024 shows Feb 2023, etc."
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SAMEPERIODLASTYEAR — common patterns you'll see in production.\n-- APPROACH  - Combine SAMEPERIODLASTYEAR with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nYoY Growth =\n[Total Sales] - [Sales LY]\nYoY Growth % =\nDIVIDE(\n    [Total Sales] - [Sales LY],\n    [Sales LY]\n)\n// If user filters to Q1 2024, Sales LY returns Q1 2023 automatically"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SAMEPERIODLASTYEAR — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSales LY Safe =\nVAR PriorYear =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        SAMEPERIODLASTYEAR(Calendar[Date])\n    )\nRETURN\nIF(ISBLANK(PriorYear), BLANK(), PriorYear)\nSales Prior Quarter =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -1, QUARTER)\n)\nSales 30 Days Ago =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -30, DAY)\n)"
                  }
        ],
        tips: [
                  "SAMEPERIODLASTYEAR is equivalent to `DATEADD(dates, -1, YEAR)` — use whichever reads clearer",
                  "Both functions require a continuous, gap-free Date table",
                  "If prior year data doesn't exist, the measure returns BLANK — handle this in visuals or with IF(ISBLANK())"
        ],
        mistake: "Calculating YoY % as `DIVIDE([Sales LY], [Total Sales]) - 1`. The numerator should be the *change*: `DIVIDE([Total Sales] - [Sales LY], [Sales LY])`.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: DATEADD with -1 year\nPriorYear = CALCULATE(SUM(Sales[Amount]), DATEADD(Calendar[Date], -1, YEAR))\n// More explicit but longer",
          concise: "// Concise: SAMEPERIODLASTYEAR\nPriorYear = CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Calendar[Date]))",
        },
      },
      {
        id: "dateadd",
        fn: "DATEADD",
        desc: "Shift a date range by a specified number of intervals — flexible period comparison.",
        category: "Time Intelligence",
        subtitle: "Offset date context by days, months, quarters, or years",
        signature: "DATEADD(dates, number_of_intervals, interval)",
        descLong: "DATEADD shifts the dates in the current filter context by a specified interval — backward (negative) or forward (positive). More flexible than SAMEPERIODLASTYEAR because you can shift by any amount in any interval unit (DAY, MONTH, QUARTER, YEAR).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DATEADD — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSales Prior Month =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -1, MONTH)\n)\nSales Prior Year =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -1, YEAR)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DATEADD — common patterns you'll see in production.\n-- APPROACH  - Combine DATEADD with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nMoM Growth % =\nDIVIDE(\n    [Total Sales] - [Sales Prior Month],\n    [Sales Prior Month]\n)\nSales 3M Ago =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -3, MONTH)\n)\nForecast Baseline =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATEADD(Calendar[Date], -1, YEAR)\n) * 1.05    // 5% growth assumption"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DATEADD — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nRolling 3M Avg =\nCALCULATE(\n    AVERAGE(Sales[Amount]),\n    DATESINPERIOD(\n        Calendar[Date],\n        LASTDATE(Calendar[Date]),    // end at current context date\n        -3,\n        MONTH\n    )\n)\nMAT Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    DATESINPERIOD(\n        Calendar[Date],\n        LASTDATE(Calendar[Date]),\n        -12,\n        MONTH\n    )\n)\n// More flexible than DATEADD for rolling windows"
                  }
        ],
        tips: [
                  "Negative number_of_intervals shifts backward (prior period); positive shifts forward",
                  "DATESINPERIOD is better for rolling windows (last N days/months) than DATEADD",
                  "All date functions require a marked Date table with continuous date range"
        ],
        mistake: "Using DATEADD to build a rolling window. `DATEADD(dates, -3, MONTH)` shifts the entire range back 3 months — it doesn't create a 3-month window. Use `DATESINPERIOD()` for rolling windows.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: CALCULATE with parallel period\nPriorMonth = CALCULATE(SUM(Sales[Amount]), PARALLELPERIOD(Calendar[Date], -1, MONTH))\n// More explicit but longer",
          concise: "// Concise: DATEADD\nPriorMonth = CALCULATE(SUM(Sales[Amount]), DATEADD(Calendar[Date], -1, MONTH))",
        },
      },
    ],
  },

  // ── Section 4: Advanced Patterns ─────────────────────────────────────────
  {
    id: "advanced-patterns",
    title: "Advanced Patterns",
    entries: [
      {
        id: "var-return",
        fn: "VAR / RETURN",
        desc: "Store intermediate results in named variables — cleaner, faster, and debuggable.",
        category: "Advanced",
        subtitle: "DAX variables — define once, reuse, avoid double calculation",
        signature: "VAR name = expression  RETURN result",
        descLong: "VAR defines a named constant within a measure or calculated column. Variables are evaluated once at the point of definition, then reused — unlike expressions which recalculate each time they appear. This improves both readability and performance. RETURN follows all VAR declarations and specifies the final result.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of VAR / RETURN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nProfit Margin % =\nVAR Revenue = SUM(Sales[Revenue])\nVAR Cost    = SUM(Sales[Cost])\nRETURN\nDIVIDE(Revenue - Cost, Revenue)\n// → Revenue computed once, used twice — cleaner than nested expressions"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of VAR / RETURN — common patterns you'll see in production.\n-- APPROACH  - Combine VAR / RETURN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nYoY Growth % =\nVAR SalesThisYear = SUM(Sales[Amount])\nVAR SalesLastYear =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        SAMEPERIODLASTYEAR(Calendar[Date])\n    )\nVAR Growth = SalesThisYear - SalesLastYear\nRETURN\n// During debugging, try: RETURN SalesLastYear  ← inspect intermediate\nDIVIDE(Growth, SalesLastYear)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of VAR / RETURN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Useful for comparing current context to a baseline\nSales vs Avg =\nVAR CurrentSales = SUM(Sales[Amount])\nVAR OverallAvg =\n    CALCULATE(\n        AVERAGE(Sales[Amount]),\n        ALL(Sales[Category])    // captured here, not at RETURN\n    )\nRETURN\nDIVIDE(CurrentSales - OverallAvg, OverallAvg)\nConditional Measure =\nVAR HasData = COUNTROWS(Sales) > 0\nRETURN\nIF(\n    HasData,\n    SUMX(Sales, Sales[Price] * Sales[Qty] * RELATED(Products[Discount])),\n    BLANK()\n)\n// → Expensive SUMX only runs when there's data"
                  }
        ],
        tips: [
                  "Variables are immutable constants — they cannot be reassigned or updated",
                  "VAR captures the filter context at the point of definition — important when context changes inside expressions",
                  "Use VAR to debug: temporarily change RETURN to the variable name you want to inspect"
        ],
        mistake: "Writing the same sub-expression twice in a measure instead of storing it in a VAR. Every repeated expression is computed twice — VAR makes it compute once and reuse.",
        shorthand: {
          verbose: "// Verbose: repeat expression multiple times\nMargin = SUM(Sales[Amount]) - SUM(Sales[Cost])\nMarginPct = DIVIDE(SUM(Sales[Amount]) - SUM(Sales[Cost]), SUM(Sales[Amount]))",
          concise: "// Concise: VAR to store and reuse\nMarginPct = VAR m=SUM(Sales[Amount])-SUM(Sales[Cost]) RETURN DIVIDE(m, SUM(Sales[Amount]))",
        },
      },
      {
        id: "context-transition",
        fn: "Context Transition",
        desc: "CALCULATE converts row context to filter context — the hardest DAX concept to master.",
        category: "Advanced",
        subtitle: "How row context becomes filter context inside iterators",
        signature: "CALCULATE() inside SUMX/FILTER triggers context transition",
        descLong: "In DAX there are two kinds of context: filter context (set by visuals/slicers/CALCULATE) and row context (set by iterators like SUMX, or calculated columns). Context transition happens automatically when CALCULATE is called inside a row context — it converts the current row into an equivalent filter context. This is subtle but essential for correct measures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Context Transition — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Each row of Products \"knows\" which product it is\n// This works in a calculated column because of row context:\nProduct Sales = SUM(RELATEDTABLE(Sales)[Amount])  // wrong — can't SUM like this\n// Correct — use CALCULATE to trigger context transition:\nProduct Sales = CALCULATE(SUM(Sales[Amount]))\n// → CALCULATE converts \"currently iterating ProductID=5\" into a filter"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Context Transition — common patterns you'll see in production.\n-- APPROACH  - Combine Context Transition with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Without context transition this would sum ALL sales for every row:\nWrong =\nSUMX(\n    Products,\n    SUM(Sales[Amount])    // no context transition — sums all sales every row!\n)\n// Correct — CALCULATE triggers transition so each row filters its own sales:\nCorrect =\nSUMX(\n    Products,\n    CALCULATE(SUM(Sales[Amount]))\n    // → \"ProductID = current row\" becomes a filter, isolating each product's sales\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Context Transition — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// This calculated column correctly shows each product's sales:\nProduct Sales Column = [Total Sales Measure]\n// → [Total Sales Measure] uses CALCULATE implicitly — context transition happens\n// Context transition creates a filter for EVERY column in the current row\n// If Products has 10 columns, all 10 become filter conditions\nPct of Total in Iterator =\nSUMX(\n    Products,\n    VAR ProductSales = CALCULATE(SUM(Sales[Amount]))\n    VAR TotalSales   = CALCULATE(SUM(Sales[Amount]), ALL(Products))\n    RETURN DIVIDE(ProductSales, TotalSales)\n)"
                  }
        ],
        tips: [
                  "Context transition only happens when CALCULATE is called (explicitly or implicitly via a measure reference)",
                  "Referencing a measure inside an iterator automatically triggers context transition — measures always wrap in CALCULATE",
                  "Context transition converts ALL columns of the current row into filter conditions — can cause unexpected filtering"
        ],
        mistake: "Using `SUM()` directly inside `SUMX()` expecting it to filter per row. Without CALCULATE, SUM sees the outer filter context unchanged. Wrap in CALCULATE or reference a measure.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: calculated column with implicit context\nSales[ProductTotal] = CALCULATE(SUM(Sales[Amount]))\n// More explicit but longer",
          concise: "// Concise: explicit context transition with CALCULATE in iterator\nProductTotal = SUMX(Products, CALCULATE(SUM(Sales[Amount])))",
        },
      },
      {
        id: "percentage-of-total",
        fn: "Percentage of Total",
        desc: "Calculate what share each item contributes to the whole — a fundamental reporting pattern.",
        category: "Advanced",
        subtitle: "DIVIDE + ALL() for share of total calculations",
        signature: "DIVIDE([Measure], CALCULATE([Measure], ALL(table[column])))",
        descLong: "The percentage-of-total pattern uses ALL() inside CALCULATE to compute a denominator that ignores the current filter, while the numerator respects it. There are several variants depending on what \"total\" means — grand total, category total, or user-selected total.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Percentage of Total — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n% of Grand Total =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALL(Sales))\n)\n// → In a table: Electronics row shows 42%, Clothing shows 31%, etc."
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Percentage of Total — common patterns you'll see in production.\n-- APPROACH  - Combine Percentage of Total with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n% of Category =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(\n        SUM(Sales[Amount]),\n        ALLEXCEPT(Sales, Sales[Category])\n    )\n)\n% of Slicer Total =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Sales[Product]))\n)\n// → Denominator = total for products the user has selected, not all products"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Percentage of Total — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n% of Total Robust =\nVAR CurrentSales = SUM(Sales[Amount])\nVAR GrandTotal =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        REMOVEFILTERS(Sales[Product], Sales[Category])\n    )\nRETURN\nIF(\n    ISINSCOPE(Sales[Product]),     // only show % at product level rows\n    DIVIDE(CurrentSales, GrandTotal),\n    BLANK()\n)\n// Use it to apply different logic at different levels of a matrix"
                  }
        ],
        tips: [
                  "`ALL(Sales)` clears all filters on the table; `ALL(Sales[Product])` only clears the Product filter",
                  "`ALLSELECTED()` respects slicer context — use for \"% of what user selected\"",
                  "`ISINSCOPE()` lets you apply different formulas at different matrix hierarchy levels"
        ],
        mistake: "Using `ALL(Sales)` in a category-level report — this gives % of grand total when you wanted % of category. Use `ALLEXCEPT(Sales, Sales[Category])` to keep the category filter active.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: separate numerator and denominator measures\nPct = DIVIDE(CALCULATE(SUM(Sales[Amount]), Products[Category]=\"A\"), CALCULATE(SUM(Sales[Amount]), ALL(Products)))\n// More explicit but longer",
          concise: "// Concise: ALLSELECTED for visual-level % of total\nPct = DIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Products)))",
        },
      },
      {
        id: "running-total",
        fn: "Running Total",
        desc: "Cumulative sum from the beginning of a range through each point — the running total pattern.",
        category: "Advanced",
        subtitle: "CALCULATE + FILTER + MAX(Date) for custom running totals",
        signature: "CALCULATE([Measure], FILTER(ALL(Dates), Dates[Date] <= MAX(Dates[Date])))",
        descLong: "The running total pattern accumulates a measure from a fixed starting point through each date in context. TOTALYTD is a shortcut for year-based running totals. For custom ranges (fiscal periods, rolling windows, all-time running totals), build the pattern with CALCULATE and FILTER.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Running Total — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nCumulative Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Calendar[Date]),\n        Calendar[Date] <= MAX(Calendar[Date])\n    )\n)\n// → Each date shows the sum of all sales up to and including that date"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Running Total — common patterns you'll see in production.\n-- APPROACH  - Combine Running Total with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSales YTD = TOTALYTD(SUM(Sales[Amount]), Calendar[Date])\nSales YTD Manual =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Calendar),\n        Calendar[Year] = MAX(Calendar[Year]) &&\n        Calendar[Date] <= MAX(Calendar[Date])\n    )\n)\n// → Resets to zero at the start of each year"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Running Total — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nRunning from Launch =\nVAR LastDate = MAX(Calendar[Date])\nVAR LaunchDate = MIN(Sales[Date])    // or a fixed date from a config table\nRETURN\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Calendar[Date]),\n        Calendar[Date] >= LaunchDate &&\n        Calendar[Date] <= LastDate\n    )\n)\nRunning Avg =\nVAR LastDate = MAX(Calendar[Date])\nRETURN\nCALCULATE(\n    AVERAGEX(\n        VALUES(Calendar[Date]),\n        [Daily Sales]\n    ),\n    FILTER(ALL(Calendar[Date]), Calendar[Date] <= LastDate)\n)"
                  }
        ],
        tips: [
                  "`TOTALYTD` is cleaner for calendar-year YTD; build the FILTER pattern for non-standard periods",
                  "`MAX(Calendar[Date])` inside FILTER gives you the \"current\" date from the visual context",
                  "Running totals with FILTER can be slow on large date ranges — consider pre-aggregating at month/week level"
        ],
        mistake: "Forgetting `ALL(Calendar[Date])` in the FILTER. Without ALL, you're filtering an already-filtered date set — the running total won't accumulate correctly across period boundaries.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: FILTER with date comparison\nRunningTotal = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Calendar), Calendar[Date] <= MAX(Calendar[Date])))\n// More explicit but longer",
          concise: "// Concise: use DATESYTD or cumulative pattern\nRunningTotal = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Sales), Sales[Date] <= MAX(Sales[Date])))",
        },
      },
    ],
  },

  // ── Section 5: Text Functions ─────────────────────────────────────────
  {
    id: "text-functions",
    title: "Text Functions",
    entries: [
      {
        id: "left-right-mid",
        fn: "LEFT / RIGHT / MID",
        desc: "Extract substrings from the start, end, or middle of a text value.",
        category: "Text",
        subtitle: "Substring extraction — position-based character slicing",
        signature: "LEFT(text, num_chars) | RIGHT(text, num_chars) | MID(text, start, num_chars)",
        descLong: "LEFT extracts from the beginning, RIGHT from the end, MID from any position. All are 1-indexed — the first character is position 1. Combine with FIND or SEARCH to extract dynamic substrings when you don't know the length in advance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LEFT / RIGHT / MID — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nLEFT(\"PROD-2024-XL\", 4)    // → \"PROD\"\nRIGHT(\"PROD-2024-XL\", 2)   // → \"XL\"\nMID(\"PROD-2024-XL\", 6, 4)  // → \"2024\"  (start=6, take 4 chars)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LEFT / RIGHT / MID — common patterns you'll see in production.\n-- APPROACH  - Combine LEFT / RIGHT / MID with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nYear Code =\nLEFT(Products[Code], 4)\nSuffix =\nMID(Products[Code], 6, LEN(Products[Code]) - 5)\n// → For \"PROD-XL-BLUE\": MID starts at 6, takes remaining chars → \"XL-BLUE\""
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LEFT / RIGHT / MID — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nCategory =\nVAR DashPos = FIND(\"-\", Products[Code], 1, 0)\nRETURN\nIF(\n    DashPos > 0,\n    LEFT(Products[Code], DashPos - 1),\n    Products[Code]    // no dash found — return whole value\n)\nVAR First  = FIND(\"-\", Products[Code])\nVAR Second = FIND(\"-\", Products[Code], First + 1)\nRETURN MID(Products[Code], First + 1, Second - First - 1)\n// → \"2024\""
                  }
        ],
        tips: [
                  "MID is 1-indexed — position 1 is the first character, not 0",
                  "Combine with `LEN()` to extract \"everything after position N\": `MID(text, N, LEN(text))`",
                  "Use `FIND()` to locate a delimiter dynamically before extracting with LEFT/MID/RIGHT"
        ],
        mistake: "Hard-coding the length in MID when the text varies. `MID(code, 6, 4)` breaks if codes have different formats. Use FIND to locate delimiters and compute lengths dynamically.",
        shorthand: {
          verbose: "// Verbose: separate LEFT/RIGHT/MID calls\nPfx = LEFT(Product[Code], 4)\nSfx = RIGHT(Product[Code], 2)\nMid = MID(Product[Code], 5, 4)",
          concise: "// Concise: PATHITEM with delimiter split\nPart = PATHITEM(SUBSTITUTE(Product[Code], \"-\", \"|\"), 2, 1)",
        },
      },
      {
        id: "len-trim-case",
        fn: "LEN / TRIM / UPPER / LOWER",
        desc: "Measure string length and clean up whitespace and casing.",
        category: "Text",
        subtitle: "String cleaning — the first step in any text data quality fix",
        signature: "LEN(text) | TRIM(text) | UPPER(text) | LOWER(text) | PROPER(text)",
        descLong: "LEN returns the number of characters. TRIM removes leading and trailing spaces and collapses internal multiple spaces to one — essential for cleaning imported data. UPPER, LOWER, and PROPER normalize casing for consistent comparisons and display.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LEN / TRIM / UPPER / LOWER — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nLEN(\"  Hello  \")        // → 9  (includes spaces)\nLEN(TRIM(\"  Hello  \"))  // → 5  (trimmed first)\nTRIM(\"  Hello   World  \")  // → \"Hello World\"  (collapses internal spaces too)\nUPPER(\"hello world\")   // → \"HELLO WORLD\"\nLOWER(\"HELLO WORLD\")   // → \"hello world\"\nPROPER(\"hello world\")  // → \"Hello World\"  (title case)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LEN / TRIM / UPPER / LOWER — common patterns you'll see in production.\n-- APPROACH  - Combine LEN / TRIM / UPPER / LOWER with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nClean Name =\nPROPER(TRIM(Customers[Name]))\n// → \" alice  smith \" → \"Alice Smith\"\nNames Match =\nIF(\n    LOWER(TRIM(Table1[Name])) = LOWER(TRIM(Table2[Name])),\n    \"Match\",\n    \"No Match\"\n)\nIs Valid Name =\nIF(LEN(TRIM(Customers[Name])) >= 2, \"Valid\", \"Check\")"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LEN / TRIM / UPPER / LOWER — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDirty Name Count =\nCOUNTROWS(\n    FILTER(\n        Customers,\n        LEN(Customers[Name]) <> LEN(TRIM(Customers[Name]))\n    )\n)\n// → Count rows where trimming would change the value — data quality flag\nClean Special =\nSUBSTITUTE(\n    SUBSTITUTE(Customers[Name], UNICHAR(160), \" \"),  // replace &nbsp;\n    UNICHAR(9), \" \"    // replace tab characters\n)"
                  }
        ],
        tips: [
                  "TRIM removes leading/trailing spaces AND collapses multiple internal spaces to one",
                  "TRIM only removes ASCII space (char 32) — use SUBSTITUTE + UNICHAR(160) for non-breaking spaces from web data",
                  "PROPER capitalizes after spaces and punctuation — good for names, but can mangle acronyms like \"USA\" → \"Usa\""
        ],
        mistake: "Comparing text values without TRIM and LOWER. `\"Alice\" = \" alice\"` is FALSE in DAX. Always normalize before comparing: `LOWER(TRIM(a)) = LOWER(TRIM(b))`.",
        shorthand: {
          verbose: "// Verbose: separate functions for each operation\nClean = TRIM(UPPER(Product[Name]))\nLen = LEN(TRIM(Product[Name]))",
          concise: "// Concise: chained in one expression\nClean = TRIM(UPPER(Product[Name]))",
        },
      },
      {
        id: "concatenate",
        fn: "CONCATENATE / CONCATENATEX / &",
        desc: "Join text values together — single values or aggregated across rows.",
        category: "Text",
        subtitle: "& for two values, CONCATENATEX to join a whole column",
        signature: "text1 & text2 | CONCATENATE(text1, text2) | CONCATENATEX(table, expr, delimiter)",
        descLong: "The & operator is the clearest way to join two text values. CONCATENATE() does the same but only accepts two arguments. CONCATENATEX is the powerful iterator version — it iterates a table, evaluates an expression per row, then joins all results with a delimiter. Use CONCATENATEX for building lists in measures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CONCATENATE / CONCATENATEX / & — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nFull Name = Employees[FirstName] & \" \" & Employees[LastName]\n// → \"Alice Smith\"\n// CONCATENATE only takes 2 args — you have to nest:\nCONCATENATE(CONCATENATE(Employees[First], \" \"), Employees[Last])"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CONCATENATE / CONCATENATEX / & — common patterns you'll see in production.\n-- APPROACH  - Combine CONCATENATE / CONCATENATEX / & with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSales Label =\n\"Total: \" & FORMAT(SUM(Sales[Amount]), \"$#,##0\")\n// → \"Total: $1,234,567\"\nProduct List =\nCONCATENATEX(\n    VALUES(Products[Name]),\n    Products[Name],\n    \", \"\n)\n// → \"Laptop, Monitor, Keyboard\"  (respects current filter context)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CONCATENATE / CONCATENATEX / & — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nTop 3 Products =\nCONCATENATEX(\n    TOPN(3, VALUES(Products[Name]), [Total Sales], DESC),\n    Products[Name],\n    \" | \",\n    Products[Name], ASC    // sort the joined output alphabetically\n)\nActive Regions =\nVAR RegionList =\n    CONCATENATEX(\n        VALUES(Geography[Region]),\n        Geography[Region],\n        \" & \"\n    )\nRETURN\nIF(\n    HASONEVALUE(Geography[Region]),\n    \"Sales — \" & SELECTEDVALUE(Geography[Region]),\n    \"Sales — \" & RegionList\n)"
                  }
        ],
        tips: [
                  "Use `&` instead of CONCATENATE — it's shorter and supports any number of values",
                  "CONCATENATEX respects the current filter context — what you see in the visual is what gets joined",
                  "CONCATENATEX has an optional 4th and 5th argument for sort column and sort order"
        ],
        mistake: "Concatenating a number directly: `\"Sales: \" & SUM(Sales[Amount])` — DAX auto-converts but without formatting. Use `FORMAT()` first: `\"Sales: \" & FORMAT([Total Sales], \"$#,##0\")`.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: CONCATENATE function\nFullName = CONCATENATE(Customers[FirstName], CONCATENATE(\" \", Customers[LastName]))\n// More explicit but longer",
          concise: "// Concise: & operator\nFullName = Customers[FirstName] & \" \" & Customers[LastName]",
        },
      },
      {
        id: "substitute-replace",
        fn: "SUBSTITUTE / REPLACE",
        desc: "Replace text by content (SUBSTITUTE) or by position (REPLACE).",
        category: "Text",
        subtitle: "SUBSTITUTE finds and replaces a string; REPLACE replaces by position",
        signature: "SUBSTITUTE(text, old, new, instance) | REPLACE(text, start, num_chars, new)",
        descLong: "SUBSTITUTE replaces all occurrences of a specific string — like find-and-replace. The optional 4th argument targets a specific occurrence only. REPLACE replaces characters at a fixed position regardless of content — useful for fixed-width formats.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUBSTITUTE / REPLACE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSUBSTITUTE(\"PROD-2024-XL\", \"-\", \"\")    // → \"PROD2024XL\"\nSUBSTITUTE(\"Q1 2024 Report\", \"2024\", \"2025\")  // → \"Q1 2025 Report\""
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUBSTITUTE / REPLACE — common patterns you'll see in production.\n-- APPROACH  - Combine SUBSTITUTE / REPLACE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSUBSTITUTE(\"AA-BB-CC\", \"-\", \"/\", 1)   // → \"AA/BB-CC\"  (first dash only)\nSUBSTITUTE(\"AA-BB-CC\", \"-\", \"/\", 2)   // → \"AA-BB/CC\"  (second dash only)\nClean Phone =\nSUBSTITUTE(\n    SUBSTITUTE(\n        SUBSTITUTE(Customers[Phone], \"-\", \"\"),\n        \"(\", \"\"),\n    \")\", \"\")\n// → \"(555) 123-4567\" → \"5551234567\""
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUBSTITUTE / REPLACE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nREPLACE(\"PROD-XX-2024\", 6, 2, \"XL\")  // → \"PROD-XL-2024\"\n// start=6, replace 2 chars with \"XL\"\nMasked Account =\nVAR Full = Customers[AccountNumber]\nVAR Len  = LEN(Full)\nRETURN\nREPLACE(Full, 1, Len - 4, REPT(\"*\", Len - 4))\n// → \"12345678\" → \"****5678\"\n// Use LOWER/UPPER on both sides for case-insensitive replacement"
                  }
        ],
        tips: [
                  "SUBSTITUTE is case-sensitive — normalize with LOWER/UPPER if you need case-insensitive replacement",
                  "Chain SUBSTITUTE calls to remove multiple characters: `SUBSTITUTE(SUBSTITUTE(text, \"-\", \"\"), \" \", \"\")`",
                  "REPT(text, n) repeats a string n times — useful for building mask characters"
        ],
        mistake: "Expecting SUBSTITUTE to do regex-style matching. It only matches exact literal strings. For pattern-based replacement you'd need Power Query (M language) or a calculated workaround.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: REPLACE with position and length\nClean = REPLACE(Product[Code], 5, 1, \"\")\n// More explicit but longer",
          concise: "// Concise: SUBSTITUTE by value\nClean = SUBSTITUTE(Product[Code], \"-\", \"\")",
        },
      },
      {
        id: "search-find",
        fn: "SEARCH / FIND",
        desc: "Locate the position of a substring within text — SEARCH is case-insensitive, FIND is not.",
        category: "Text",
        subtitle: "Returns position (1-indexed) or error/blank if not found",
        signature: "SEARCH(find_text, within, start, not_found) | FIND(find_text, within, start)",
        descLong: "SEARCH and FIND both return the position (1-indexed) of a substring. SEARCH is case-insensitive and supports wildcards (* and ?). FIND is case-sensitive and literal. The 4th argument of SEARCH lets you specify a value to return when nothing is found — use this instead of IFERROR for cleaner formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SEARCH / FIND — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSEARCH(\"-\", \"PROD-2024\", 1, 0)    // → 5  (position of first \"-\")\nSEARCH(\"prod\", \"PROD-2024\", 1, 0) // → 1  (case-insensitive match)\nFIND(\"prod\", \"PROD-2024\")         // → error  (FIND is case-sensitive)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SEARCH / FIND — common patterns you'll see in production.\n-- APPROACH  - Combine SEARCH / FIND with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nHas Discount =\nIF(\n    SEARCH(\"DISC\", Products[Code], 1, 0) > 0,\n    \"Discounted\",\n    \"Regular\"\n)\n// → 0 = not found (our safe default); >0 = found at that position\nCategory =\nVAR DashPos = SEARCH(\"-\", Products[Code], 1, 0)\nRETURN\nIF(DashPos > 0, LEFT(Products[Code], DashPos - 1), Products[Code])"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SEARCH / FIND — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nHas Size Code =\nISNUMBER(SEARCH(\"*-[SML]*\", Products[Code]))\n//      and FALSE if SEARCH returned an error (no match)\nVAR First  = FIND(\"-\", Products[Code], 1)\nVAR Second = FIND(\"-\", Products[Code], First + 1)\nRETURN MID(Products[Code], First + 1, Second - First - 1)\n// → Extracts middle segment between 1st and 2nd dash"
                  }
        ],
        tips: [
                  "Use SEARCH over FIND by default — case-insensitive behavior is almost always what you want",
                  "Always pass a safe `not_found` value (like 0) as the 4th argument to SEARCH — avoids IFERROR wrappers",
                  "ISNUMBER(SEARCH(...)) is the cleanest \"contains\" check in DAX"
        ],
        mistake: "Using FIND expecting case-insensitive matching. `FIND(\"prod\", \"PROD-2024\")` returns an error. Use SEARCH for case-insensitive lookups.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: SEARCH with error handling\nPos = IFERROR(SEARCH(\"-\", Product[Code]), 0)\n// More explicit but longer",
          concise: "// Concise: SEARCH with default\nPos = SEARCH(\"-\", Product[Code], 1, 0)",
        },
      },
      {
        id: "format",
        fn: "FORMAT",
        desc: "Convert a value to formatted text using a format string — numbers, dates, and custom patterns.",
        category: "Text",
        subtitle: "FORMAT(value, format_string) — mirrors Excel custom formats",
        signature: "FORMAT(value, format_string)",
        descLong: "FORMAT converts any value to a text string using a format pattern identical to Excel custom number and date formats. Use it to build labels, titles, and tooltips. Remember: FORMAT always returns text — the result cannot be used for further math.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FORMAT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nFORMAT(1234567.89, \"$#,##0.00\")    // → \"$1,234,567.89\"\nFORMAT(0.9253, \"0.0%\")             // → \"92.5%\"\nFORMAT(42, \"00000\")                // → \"00042\"  (zero-padded)\nFORMAT(1234567, \"#,##0\")           // → \"1,234,567\""
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FORMAT — common patterns you'll see in production.\n-- APPROACH  - Combine FORMAT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nFORMAT(TODAY(), \"MMMM DD, YYYY\")   // → \"April 15, 2024\"\nFORMAT(TODAY(), \"MMM-YY\")          // → \"Apr-24\"\nFORMAT(TODAY(), \"YYYY-MM-DD\")      // → \"2024-04-15\"\nFORMAT(TODAY(), \"DDD\")             // → \"Mon\"\nSales Label =\n\"Revenue: \" & FORMAT([Total Sales], \"$#,##0\") &\n\" (\" & FORMAT([YoY Growth %], \"+0.0%;-0.0%;0.0%\") & \" YoY)\""
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FORMAT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSigned Format =\nFORMAT([Net Profit], \"$#,##0;($#,##0);—\")\n// → Positive: $1,234  |  Negative: ($567)  |  Zero: —\nFORMAT(1234567, \"Currency\")        // uses report locale\nFORMAT(TODAY(), \"Long Date\")       // → \"Monday, April 15, 2024\"\nFORMAT(TODAY(), \"Short Date\")      // → \"4/15/2024\"\n// Store the number in a VAR before formatting if you need both\nVAR Sales = SUM(Sales[Amount])\nRETURN \"Sales: \" & FORMAT(Sales, \"$#,##0\") & \" vs budget: \" & FORMAT(Sales / [Budget], \"0%\")"
                  }
        ],
        tips: [
                  "FORMAT always returns text — never use it as an input to SUM, CALCULATE, or other math functions",
                  "The three-section format `pos;neg;zero` pattern gives professional positive/negative/zero display",
                  "Named formats like \"Currency\", \"Long Date\" adapt to the report locale — good for multi-region reports"
        ],
        mistake: "Filtering or calculating on a FORMAT result. `CALCULATE([Measure], FORMAT(Sales[Date], \"YYYY\") = \"2024\")` will fail — use `YEAR(Sales[Date]) = 2024` instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: custom format string with FORMAT\nDisplay = FORMAT(SUM(Sales[Amount]), \"$#,##0.00\")\n// More explicit but longer",
          concise: "// Concise: built-in format names\nDisplay = FORMAT(SUM(Sales[Amount]), \"Currency\")",
        },
      },
      {
        id: "value-text-convert",
        fn: "VALUE / TEXT / FIXED",
        desc: "Convert between text and numeric types — essential for cleaning imported data.",
        category: "Text",
        subtitle: "VALUE converts text to number; TEXT converts number to text",
        signature: "VALUE(text) | TEXT(value, format) | FIXED(number, decimals, no_comma)",
        descLong: "Imported data often has numbers stored as text or dates stored as strings. VALUE() parses a text string as a number. TEXT() converts a number to a formatted string (similar to FORMAT but with slightly different syntax). FIXED() rounds and formats to a set number of decimal places.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of VALUE / TEXT / FIXED — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nVALUE(\"1234\")        // → 1234\nVALUE(\"$1,234.56\")   // → 1234.56  (handles common formats)\nVALUE(\"1.5%\")        // → 0.015\nTEXT(1234.56, \"0.00\")       // → \"1234.56\"\nTEXT(0.1525, \"0.0%\")        // → \"15.3%\""
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of VALUE / TEXT / FIXED — common patterns you'll see in production.\n-- APPROACH  - Combine VALUE / TEXT / FIXED with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// In a calculated column when the source always gives numbers as text:\nAmount Numeric =\nVALUE(SUBSTITUTE(Sales[AmountText], \",\", \"\"))\n// → \"$1,234\" → strip comma → VALUE → 1234\nDate Parsed =\nDATE(\n    VALUE(LEFT(Sales[DateText], 4)),   // year\n    VALUE(MID(Sales[DateText], 6, 2)), // month\n    VALUE(RIGHT(Sales[DateText], 2))   // day\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of VALUE / TEXT / FIXED — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSafe Value =\nVAR Raw = TRIM(Sales[ImportedAmount])\nVAR Cleaned = SUBSTITUTE(SUBSTITUTE(Raw, \"$\", \"\"), \",\", \"\")\nRETURN\nIFERROR(VALUE(Cleaned), BLANK())\n// → Returns BLANK for rows that truly can't be parsed\nFIXED(1234.5678, 2, FALSE)  // → \"1,234.57\"  (2 decimals, with comma)\nFIXED(1234.5678, 2, TRUE)   // → \"1234.57\"   (no comma separator)\n// Use VALUE in DAX only for one-off calculated column fixes"
                  }
        ],
        tips: [
                  "VALUE can parse numbers with currency symbols and commas — but it's locale-sensitive",
                  "Prefer fixing type issues in Power Query at load time rather than with VALUE in DAX calculated columns",
                  "Always wrap VALUE in IFERROR or check with ISNUMBER first when data quality is uncertain"
        ],
        mistake: "Assuming VALUE works on all number formats. `VALUE(\"1.234,56\")` (European format) may fail in an EN-US report. Normalize with SUBSTITUTE before calling VALUE.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: VALUE with error handling\nNum = IFERROR(VALUE(Sales[TextAmt]), 0)\n// More explicit but longer",
          concise: "// Concise: VALUE with implicit conversion\nNum = VALUE(Sales[TextAmt])",
        },
      },
    ],
  },

  // ── Section 6: Date & Calendar ─────────────────────────────────────────
  {
    id: "date-calendar",
    title: "Date & Calendar",
    entries: [
      {
        id: "date-parts",
        fn: "YEAR / MONTH / DAY / WEEKDAY",
        desc: "Extract individual components from a date value.",
        category: "Date",
        subtitle: "Decompose dates into year, month, day, quarter, week",
        signature: "YEAR(date) | MONTH(date) | DAY(date) | WEEKDAY(date, mode) | WEEKNUM(date)",
        descLong: "Date part functions extract components from a date column — essential for calculated columns that label rows by period, and for filtering logic. WEEKDAY returns a number 1-7; the mode argument controls which day is 1 (Sunday=1 or Monday=1). Use these to build a Calendar table if you don't have one.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of YEAR / MONTH / DAY / WEEKDAY — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nYEAR(Sales[Date])      // → 2024\nMONTH(Sales[Date])     // → 4   (April)\nDAY(Sales[Date])       // → 15\nQUARTER(Sales[Date])   // → 2   (Q2)\nWEEKDAY(Sales[Date])   // → 2   (Monday, default: Sunday=1)\nWEEKNUM(Sales[Date])   // → 16  (week number of year)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of YEAR / MONTH / DAY / WEEKDAY — common patterns you'll see in production.\n-- APPROACH  - Combine YEAR / MONTH / DAY / WEEKDAY with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nMonth Name  = FORMAT(Calendar[Date], \"MMMM\")       // → \"April\"\nMonth Short = FORMAT(Calendar[Date], \"MMM\")         // → \"Apr\"\nMonth Num   = MONTH(Calendar[Date])                 // → 4\nYear Num    = YEAR(Calendar[Date])                  // → 2024\nQuarter     = \"Q\" & QUARTER(Calendar[Date])         // → \"Q2\"\nYear Month  = FORMAT(Calendar[Date], \"YYYY-MM\")     // → \"2024-04\"  (sort-friendly)\nIs Weekend  = WEEKDAY(Calendar[Date], 2) >= 6       // → TRUE for Sat/Sun"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of YEAR / MONTH / DAY / WEEKDAY — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nFiscal Year =\nIF(\n    MONTH(Calendar[Date]) >= 7,\n    YEAR(Calendar[Date]) + 1,\n    YEAR(Calendar[Date])\n)\n// → Dec 2024 → FY2025; Jun 2024 → FY2024\nFiscal Quarter =\nVAR FMonth = MOD(MONTH(Calendar[Date]) - 7 + 12, 12) + 1\nRETURN\n\"FQ\" & CEILING(FMonth / 3, 1)\nISO Week = WEEKNUM(Calendar[Date], 21)  // 21 = ISO 8601 standard"
                  }
        ],
        tips: [
                  "WEEKDAY mode 2 = Monday is 1, Sunday is 7 — most business-friendly for Mon-Fri workweek logic",
                  "Store `YYYY-MM` format as a calculated column for correct sort order on month axes",
                  "Build fiscal period columns in your Calendar table so they're available across all measures"
        ],
        mistake: "Sorting \"Month Name\" alphabetically (April, August, ...) instead of by month number. Always create a \"Month Number\" column and sort the month name column by it in Power BI.",
        shorthand: {
          verbose: "// Verbose: separate YEAR/MONTH/DAY\nYr = YEAR(Sales[Date])\nMo = MONTH(Sales[Date])\nDy = DAY(Sales[Date])",
          concise: "// Concise: FORMAT for display\nYrMo = FORMAT(Sales[Date], \"YYYY-MM\")",
        },
      },
      {
        id: "today-now-date",
        fn: "TODAY / NOW / DATE / TIME",
        desc: "Get the current date/time or construct a date from parts.",
        category: "Date",
        subtitle: "Dynamic current date and date construction",
        signature: "TODAY() | NOW() | DATE(year, month, day) | TIME(hour, min, sec)",
        descLong: "TODAY() returns today's date with no time component; NOW() includes the current time. DATE() constructs a date from year, month, and day integers — useful for dynamic date calculations. Note: TODAY() and NOW() recalculate every time the report refreshes, making them great for \"days since\" or \"days until\" measures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of TODAY / NOW / DATE / TIME — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nTODAY()              // → current date (no time component)\nNOW()                // → current date and time\nDATE(2024, 4, 15)    // → April 15, 2024\nDATE(2024, 13, 1)    // → January 1, 2025  (month overflow handled)\nDATE(2024, 1, 0)     // → December 31, 2023  (day 0 = last day of prior month)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of TODAY / NOW / DATE / TIME — common patterns you'll see in production.\n-- APPROACH  - Combine TODAY / NOW / DATE / TIME with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nDays Since Launch =\nDATEDIFF(Products[LaunchDate], TODAY(), DAY)\nDays Until Due =\nDATEDIFF(TODAY(), Projects[DueDate], DAY)\nMonth Start = DATE(YEAR(TODAY()), MONTH(TODAY()), 1)\nMonth End   = EOMONTH(TODAY(), 0)    // last day of current month"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of TODAY / NOW / DATE / TIME — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nLast 30 Days Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Calendar[Date]),\n        Calendar[Date] >= TODAY() - 30 &&\n        Calendar[Date] <= TODAY()\n    )\n)\nFiscal Year Start =\nVAR FYStartMonth = 7    // July\nRETURN\nIF(\n    MONTH(TODAY()) >= FYStartMonth,\n    DATE(YEAR(TODAY()), FYStartMonth, 1),\n    DATE(YEAR(TODAY()) - 1, FYStartMonth, 1)\n)\n// Avoid using it in calculated columns — it will be baked in at refresh time"
                  }
        ],
        tips: [
                  "TODAY() in a measure recalculates every refresh — great for \"live\" metrics",
                  "TODAY() in a calculated column is fixed at the last refresh — usually not what you want",
                  "DATE() handles month/day overflow gracefully: DATE(2024,13,1) = Jan 1, 2025"
        ],
        mistake: "Using TODAY() in a calculated column expecting it to update dynamically. Calculated columns are computed at refresh — TODAY() gets baked in. Use it in measures for live date calculations.",
        shorthand: {
          verbose: "// Verbose: TODAY for date, NOW for datetime\nToday = TODAY()\nNow = NOW()",
          concise: "// Concise: NOW for both (includes time)\nTimestamp = NOW()",
        },
      },
      {
        id: "datediff",
        fn: "DATEDIFF",
        desc: "Calculate the difference between two dates in a specified interval.",
        category: "Date",
        subtitle: "Date arithmetic — age, tenure, days open, lead time",
        signature: "DATEDIFF(start_date, end_date, interval)",
        descLong: "DATEDIFF returns the count of interval boundaries crossed between two dates. Interval options: SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR. Note: DATEDIFF(Jan 31, Feb 1, MONTH) = 1 because one month boundary was crossed — this can be surprising for short periods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DATEDIFF — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nAccount Age =\nDATEDIFF(Customers[JoinDate], TODAY(), DAY)\nTenure Years =\nDATEDIFF(Employees[HireDate], TODAY(), YEAR)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DATEDIFF — common patterns you'll see in production.\n-- APPROACH  - Combine DATEDIFF with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nFulfillment Days =\nDATEDIFF(Orders[OrderDate], Orders[ShipDate], DAY)\nAge Bucket =\nVAR AgeDays = DATEDIFF(Customers[JoinDate], TODAY(), DAY)\nRETURN\nSWITCH(\n    TRUE(),\n    AgeDays < 30,   \"New (< 30 days)\",\n    AgeDays < 365,  \"Active (< 1 year)\",\n    AgeDays < 1095, \"Established (1-3 years)\",\n    \"Veteran (3+ years)\"\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DATEDIFF — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// For exact fractional months:\nExact Months =\nDATEDIFF(Start, End, DAY) / 30.44    // approximate\n// OR for whole months only:\nWhole Months =\nDATEDIFF(Start, End, MONTH)\nWorking Days =\nCALCULATE(\n    COUNTROWS(Calendar),\n    FILTER(\n        Calendar,\n        Calendar[Date] > Orders[OrderDate] &&\n        Calendar[Date] <= Orders[ShipDate] &&\n        Calendar[IsWorkday] = TRUE()\n    )\n)\n// → Requires a Calendar table with an IsWorkday boolean column"
                  }
        ],
        tips: [
                  "DATEDIFF counts interval *boundaries crossed* — not full intervals elapsed",
                  "For business day counting, build a Calendar table with an `IsWorkday` column and COUNTROWS with FILTER",
                  "DATEDIFF with YEAR gives \"whole years elapsed\" — useful for age and exact tenure in years"
        ],
        mistake: "Expecting DATEDIFF(Jan 31, Feb 1, MONTH) = 0. It returns 1 because one month boundary (Jan→Feb) was crossed, even though only 1 day elapsed.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: manual date math\nAge = INT((TODAY() - Customers[SignupDate]) / 365)\n// More explicit but longer",
          concise: "// Concise: DATEDIFF\nAge = DATEDIFF(Customers[SignupDate], TODAY(), DAY)",
        },
      },
      {
        id: "eomonth-calendar",
        fn: "EOMONTH / CALENDAR / CALENDARAUTO",
        desc: "End of month date and auto-generating a complete Date table.",
        category: "Date",
        subtitle: "EOMONTH for period boundaries; CALENDAR to build your date table",
        signature: "EOMONTH(date, months) | CALENDAR(start, end) | CALENDARAUTO(fiscal_month_end)",
        descLong: "EOMONTH returns the last day of a month, offset by a number of months. CALENDAR generates a single-column table of dates between two dates — the foundation for creating a Date table. CALENDARAUTO scans all date columns in the model and automatically builds the right date range.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EOMONTH / CALENDAR / CALENDARAUTO — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nEOMONTH(TODAY(), 0)     // → last day of this month\nEOMONTH(TODAY(), 1)     // → last day of next month\nEOMONTH(TODAY(), -1)    // → last day of last month\nDATE(YEAR(TODAY()), MONTH(TODAY()) + 1, 1)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EOMONTH / CALENDAR / CALENDARAUTO — common patterns you'll see in production.\n-- APPROACH  - Combine EOMONTH / CALENDAR / CALENDARAUTO with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Create this as a calculated table in your model:\nCalendar =\nADDCOLUMNS(\n    CALENDAR(DATE(2020, 1, 1), DATE(2030, 12, 31)),\n    \"Year\",        YEAR([Date]),\n    \"Month\",       MONTH([Date]),\n    \"Month Name\",  FORMAT([Date], \"MMMM\"),\n    \"Quarter\",     \"Q\" & QUARTER([Date]),\n    \"Week\",        WEEKNUM([Date], 2),\n    \"Is Weekend\",  WEEKDAY([Date], 2) >= 6\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EOMONTH / CALENDAR / CALENDARAUTO — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nCalendar = CALENDARAUTO()    // uses all date columns in model\nCalendar = CALENDARAUTO(6)   // fiscal year ends in June (month 6)\nCalendar =\nVAR FYStartMonth = 7   // July\nRETURN\nADDCOLUMNS(\n    CALENDARAUTO(6),\n    \"Year\",         YEAR([Date]),\n    \"Month Num\",    MONTH([Date]),\n    \"Month Name\",   FORMAT([Date], \"MMM\"),\n    \"Quarter\",      \"Q\" & QUARTER([Date]),\n    \"Fiscal Year\",  IF(MONTH([Date]) >= FYStartMonth, YEAR([Date])+1, YEAR([Date])),\n    \"Fiscal Qtr\",   \"FQ\" & CEILING(MOD(MONTH([Date]) - FYStartMonth + 12, 12) / 3 + 1, 1),\n    \"Is Weekend\",   WEEKDAY([Date], 2) >= 6,\n    \"Is Holiday\",   FALSE()    // populate via Power Query merge with holidays table\n)\n// NOTE: Mark this table as Date Table in Table Tools after creating it"
                  }
        ],
        tips: [
                  "Always mark your Calendar table as a Date Table — required for time intelligence functions",
                  "CALENDARAUTO is convenient but may include dates from dimension tables — verify the range it picks",
                  "Add `Is Weekend`, `Is Holiday`, `Fiscal Year` columns to your Calendar table once — reuse everywhere"
        ],
        mistake: "Not marking the Calendar table as a Date Table. Time intelligence functions (TOTALYTD, SAMEPERIODLASTYEAR, etc.) silently produce wrong results without this step.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: DATE with YEAR/MONTH and day=0 trick\nEOM = DATE(YEAR(Sales[Date]), MONTH(Sales[Date]) + 1, 0)\n// More explicit but longer",
          concise: "// Concise: EOMONTH\nEOM = EOMONTH(Sales[Date], 0)",
        },
      },
      {
        id: "opening-closing-balance",
        fn: "OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR",
        desc: "Get the value of a measure at the start or end of a time period.",
        category: "Date",
        subtitle: "Period-boundary snapshots — inventory, balance sheet, headcount",
        signature: "OPENINGBALANCEYEAR(expr, dates) | CLOSINGBALANCEYEAR(expr, dates) | PARALLELPERIOD(dates, n, interval)",
        descLong: "Opening and closing balance functions return the value of a measure at the very first or last date of a period. Essential for stock/inventory reporting, financial balance sheets, and headcount tracking where you want a point-in-time snapshot rather than a sum. PARALLELPERIOD returns the complete equivalent period shifted by N intervals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nOpening Stock =\nOPENINGBALANCEYEAR(SUM(Inventory[Units]), Calendar[Date])\nClosing Stock =\nCLOSINGBALANCEYEAR(SUM(Inventory[Units]), Calendar[Date])"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR — common patterns you'll see in production.\n-- APPROACH  - Combine OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nOpening Balance QTD =\nOPENINGBALANCEQUARTER(SUM(Accounts[Balance]), Calendar[Date])\nClosing Balance MTD =\nCLOSINGBALANCEMONTH(SUM(Accounts[Balance]), Calendar[Date])\nLast Year Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    PARALLELPERIOD(Calendar[Date], -1, YEAR)\n)\n// → If current filter is Q2 2024, returns ALL of Q2 2023"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// SAMEPERIODLASTYEAR: returns exact same dates shifted 1 year back\n// PARALLELPERIOD: returns FULL period shifted N intervals\n// In a report filtered to January 1-15, 2024:\nSAMEPERIODLASTYEAR → Jan 1-15, 2023    (same 15 days)\nPARALLELPERIOD(-1, YEAR) → ALL of Jan 2023  (full month)\nOpening Fiscal Balance =\nOPENINGBALANCEYEAR(\n    SUM(Accounts[Balance]),\n    Calendar[Date],\n    \"06/30\"    // fiscal year ends June 30\n)\n// Both require the last non-blank value approach for sparse data:\nLast Non-Blank Balance =\nCALCULATE(\n    LASTNONBLANKVALUE(Calendar[Date], SUM(Accounts[Balance])),\n    DATESYTD(Calendar[Date])\n)"
                  }
        ],
        tips: [
                  "Opening balance = closing balance of the previous period — you can derive one from the other",
                  "PARALLELPERIOD returns the FULL period shifted; SAMEPERIODLASTYEAR returns the SAME sub-period",
                  "For sparse data (not every date has a value), use LASTNONBLANKVALUE for point-in-time snapshots"
        ],
        mistake: "Using CLOSINGBALANCEYEAR on a flow measure like revenue. Closing balance gives the value ON the last date — for flows (sales, expenses), use TOTALYTD instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: CALCULATE with DATEADD for opening\nOpening = CALCULATE(SUM(Inventory[Qty]), DATEADD(Calendar[Date], -1, YEAR))\n// More explicit but longer",
          concise: "// Concise: OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR\nOpening = OPENINGBALANCEYEAR(SUM(Inventory[Qty]), Calendar[Date])",
        },
      },
    ],
  },

  // ── Section 7: Table Functions ─────────────────────────────────────────
  {
    id: "table-functions",
    title: "Table Functions",
    entries: [
      {
        id: "summarize",
        fn: "SUMMARIZE",
        desc: "Group a table by columns and optionally add aggregation columns — virtual pivot table.",
        category: "Table Functions",
        subtitle: "SUMMARIZE(table, group_cols...) + ADDCOLUMNS for aggregations",
        signature: "SUMMARIZE(table, col1, col2, ...) | with ADDCOLUMNS for measures",
        descLong: "SUMMARIZE returns a table grouped by the specified columns, containing one row per unique combination. Best practice: use SUMMARIZE for grouping only, then wrap with ADDCOLUMNS to add measure columns — adding measures directly in SUMMARIZE can produce incorrect results due to context issues.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUMMARIZE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSUMMARIZE(\n    Sales,\n    Sales[Category],\n    YEAR(Sales[Date])\n)\n// → One row per Category + Year combination, no duplicates"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUMMARIZE — common patterns you'll see in production.\n-- APPROACH  - Combine SUMMARIZE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nCategory Summary =\nADDCOLUMNS(\n    SUMMARIZE(Sales, Sales[Category]),\n    \"Total Sales\",   [Total Sales],\n    \"Order Count\",   COUNTROWS(RELATEDTABLE(Sales)),\n    \"Avg Order\",     AVERAGE(Sales[Amount])\n)\nTop Category =\nMAXX(\n    ADDCOLUMNS(SUMMARIZE(Sales, Sales[Category]), \"Sales\", [Total Sales]),\n    [Sales]\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUMMARIZE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSUMMARIZECOLUMNS(\n    Sales[Category],          // group by\n    YEAR(Sales[Date]),        // group by\n    FILTER(ALL(Sales), YEAR(Sales[Date]) = 2024),  // filter\n    \"Total Sales\", SUM(Sales[Amount]),\n    \"Order Count\", COUNTROWS(Sales)\n)\n// SUMMARIZE keeps all group combinations even with no data\n// Use SUMMARIZECOLUMNS in new DAX code — SUMMARIZE for compatibility"
                  }
        ],
        tips: [
                  "Never add measure columns directly inside SUMMARIZE — use ADDCOLUMNS wrapper instead",
                  "SUMMARIZECOLUMNS is the modern replacement — faster and cleaner for new code",
                  "SUMMARIZE preserves all group combinations; SUMMARIZECOLUMNS removes groups with no data"
        ],
        mistake: "Adding aggregations inside SUMMARIZE: `SUMMARIZE(Sales, Sales[Category], \"Total\", SUM(Sales[Amount]))`. The SUM may evaluate in wrong context. Use ADDCOLUMNS(SUMMARIZE(...), \"Total\", [Measure]) instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: SUMMARIZE with columns\nSummary = SUMMARIZE(Sales, Sales[Category], Sales[Year], \"Total\", SUM(Sales[Amount]))\n// More explicit but longer",
          concise: "// Concise: ADDCOLUMNS + SUMMARIZECOLUMNS\nSummary = SUMMARIZECOLUMNS(Sales[Category], Sales[Year], \"Total\", SUM(Sales[Amount]))",
        },
      },
      {
        id: "addcolumns-selectcolumns",
        fn: "ADDCOLUMNS / SELECTCOLUMNS",
        desc: "Add computed columns to a table or project a subset of columns — virtual table shaping.",
        category: "Table Functions",
        subtitle: "Build virtual tables with exactly the columns you need",
        signature: "ADDCOLUMNS(table, name, expr, ...) | SELECTCOLUMNS(table, name, expr, ...)",
        descLong: "ADDCOLUMNS takes a table and adds new computed columns to it, returning all original columns plus the new ones. SELECTCOLUMNS returns only the columns you specify — useful for projecting a clean virtual table. Both return table values, used as inputs to other functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ADDCOLUMNS / SELECTCOLUMNS — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nADDCOLUMNS(\n    Products,\n    \"Profit\", Products[Price] - Products[Cost],\n    \"Margin %\", DIVIDE(Products[Price] - Products[Cost], Products[Price])\n)\n// → Products table + 2 new columns, used in further calculations"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ADDCOLUMNS / SELECTCOLUMNS — common patterns you'll see in production.\n-- APPROACH  - Combine ADDCOLUMNS / SELECTCOLUMNS with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nSlim Products =\nSELECTCOLUMNS(\n    Products,\n    \"ID\",   Products[ProductID],\n    \"Name\", Products[Name],\n    \"Cost\", Products[Cost]\n)\nRenamed =\nSELECTCOLUMNS(\n    Sales,\n    \"OrderID\",  Sales[TransactionID],   // rename column\n    \"Amount\",   Sales[SalesAmount]\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ADDCOLUMNS / SELECTCOLUMNS — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nProduct Performance =\nADDCOLUMNS(\n    SUMMARIZE(Sales, Sales[ProductID]),\n    \"Product\",       RELATED(Products[Name]),\n    \"Total Sales\",   CALCULATE(SUM(Sales[Amount])),\n    \"Units Sold\",    CALCULATE(SUM(Sales[Quantity])),\n    \"Avg Price\",     CALCULATE(AVERAGE(Sales[UnitPrice])),\n    \"Rank\",          RANKX(ALL(Products[ProductID]), [Total Sales])\n)\n// GENERATE(table1, table2_expr) where table2_expr uses row context from table1\nExpanded =\nGENERATE(\n    Products,\n    ROW(\"Category\", RELATED(Categories[Name]))\n)"
                  }
        ],
        tips: [
                  "ADDCOLUMNS keeps all original columns; SELECTCOLUMNS keeps only what you list",
                  "Use SELECTCOLUMNS to reduce memory footprint when only a few columns are needed downstream",
                  "Column expressions in ADDCOLUMNS/SELECTCOLUMNS run in row context — use CALCULATE for measures"
        ],
        mistake: "Using ADDCOLUMNS when you need SELECTCOLUMNS. If the original table has 20 columns and you only need 3, ADDCOLUMNS returns all 23 — use SELECTCOLUMNS to return only 3.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: ADDCOLUMNS with full expression\nResult = ADDCOLUMNS(VALUES(Products), \"Revenue\", CALCULATE(SUM(Sales[Amount])))\n// More explicit but longer",
          concise: "// Concise: SELECTCOLUMNS for projection\nResult = SELECTCOLUMNS(Sales, \"Cat\", Sales[Category], \"Amt\", Sales[Amount])",
        },
      },
      {
        id: "calculatetable",
        fn: "CALCULATETABLE",
        desc: "Return a filtered table — the table-returning version of CALCULATE.",
        category: "Table Functions",
        subtitle: "CALCULATE returns a scalar; CALCULATETABLE returns a filtered table",
        signature: "CALCULATETABLE(table_expression, filter1, filter2, ...)",
        descLong: "CALCULATETABLE modifies the filter context and returns a table — exactly like CALCULATE but for table-valued expressions. Use it when you need a filtered version of a table to pass to another table function like COUNTROWS, SUMX, or TOPN.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CALCULATETABLE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nHigh Value Orders =\nCALCULATETABLE(\n    Sales,\n    Sales[Amount] > 1000\n)\n// → Returns only Sales rows where Amount > 1000 as a table"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CALCULATETABLE — common patterns you'll see in production.\n-- APPROACH  - Combine CALCULATETABLE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nLarge Order Count =\nCOUNTROWS(\n    CALCULATETABLE(Sales, Sales[Amount] > 1000)\n)\n// → Equivalent to CALCULATE(COUNTROWS(Sales), Sales[Amount] > 1000)\nRetained =\nVAR PriorCustomers =\n    CALCULATETABLE(\n        VALUES(Sales[CustomerID]),\n        DATEADD(Calendar[Date], -1, YEAR)\n    )\nRETURN\nCOUNTROWS(INTERSECT(VALUES(Sales[CustomerID]), PriorCustomers))"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CALCULATETABLE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nPremium Sales =\nSUMX(\n    CALCULATETABLE(\n        Sales,\n        Sales[Tier] = \"Premium\",\n        Sales[Status] = \"Completed\"\n    ),\n    Sales[Amount] * (1 - Sales[Discount])\n)\nAll Products with Sales =\nCALCULATETABLE(\n    ADDCOLUMNS(\n        ALL(Products),\n        \"Sales\", [Total Sales]\n    ),\n    ALL()    // remove all filters from context\n)"
                  }
        ],
        tips: [
                  "CALCULATETABLE is to tables what CALCULATE is to scalars — same filter modifier rules apply",
                  "Use CALCULATETABLE when you need a filtered table as input to SUMX, COUNTROWS, TOPN, etc.",
                  "FILTER() also returns a table but iterates row by row — CALCULATETABLE uses engine optimization"
        ],
        mistake: "Using FILTER when CALCULATETABLE would be faster. For simple equality/column filters, CALCULATETABLE can use indexed lookups; FILTER always does a full table scan.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: FILTER + CALCULATE pattern\nTable = FILTER(ALL(Sales), CALCULATE(SUM(Sales[Amount])) > 1000)\n// More explicit but longer",
          concise: "// Concise: CALCULATETABLE\nTable = CALCULATETABLE(Sales, Sales[Amount] > 1000)",
        },
      },
      {
        id: "topn",
        fn: "TOPN",
        desc: "Return the top N rows of a table based on a ranking expression.",
        category: "Table Functions",
        subtitle: "Get the N highest or lowest rows — feeds into SUMX, COUNTROWS, etc.",
        signature: "TOPN(n, table, order_by_expression, order)",
        descLong: "TOPN returns a table containing the top N rows ranked by the order_by expression. Use it inside CALCULATE, SUMX, or COUNTROWS to work with the top-N subset. Ties are handled by including all tied rows — TOPN(3) with a tie at rank 3 may return 4 rows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of TOPN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nTOPN(5, Products, [Total Sales], DESC)\n// → Returns a table of 5 rows (the top 5 products)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of TOPN — common patterns you'll see in production.\n-- APPROACH  - Combine TOPN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nTop 10 Revenue =\nCALCULATE(\n    SUM(Sales[Amount]),\n    TOPN(10, ALL(Customers), [Total Customer Sales], DESC)\n)\nTop 5 Margin =\nSUMX(\n    TOPN(5, Products, [Total Sales], DESC),\n    [Total Sales] - [Total Cost]\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of TOPN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nTop N + Others =\nVAR N = SELECTEDVALUE(TopNParam[Value], 5)\nVAR TopProducts =\n    TOPN(N, ALL(Products[Name]), [Total Sales], DESC)\nVAR IsTopN =\n    Products[Name] IN SELECTCOLUMNS(TopProducts, \"Name\", Products[Name])\nRETURN\nIF(IsTopN, [Total Sales], BLANK())\n// In a visual, add a separate \"Others\" measure:\nOthers Sales =\nVAR TopProducts = TOPN(5, ALL(Products[Name]), [Total Sales], DESC)\nRETURN\nCALCULATE(\n    SUM(Sales[Amount]),\n    EXCEPT(ALL(Products[Name]), TopProducts)\n)"
                  }
        ],
        tips: [
                  "TOPN can return more than N rows if there are ties at the boundary — account for this in visuals",
                  "Use TOPN with ALL() to rank across all products, not just those in current filter context",
                  "The Top N + Others pattern is very common in executive dashboards — learn it by heart"
        ],
        mistake: "Using TOPN inside a visual expecting it to slice the visual. TOPN is a table function for use inside measures — to slice a visual to top N, use visual-level filters or a RANKX-based measure.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: RANKX + FILTER for top N\nTop5 = FILTER(VALUES(Products), RANKX(ALL(Products), [Sales]) <= 5)\n// More explicit but longer",
          concise: "// Concise: TOPN\nTop5 = TOPN(5, VALUES(Products), [Sales], DESC)",
        },
      },
      {
        id: "union-intersect-except",
        fn: "UNION / INTERSECT / EXCEPT",
        desc: "Set operations on tables — combine, overlap, or subtract tables.",
        category: "Table Functions",
        subtitle: "Table set algebra for advanced filtering and cohort analysis",
        signature: "UNION(table1, table2) | INTERSECT(left, right) | EXCEPT(left, right)",
        descLong: "UNION combines two tables vertically (like SQL UNION ALL — keeps duplicates). INTERSECT returns rows from the left table that also exist in the right table. EXCEPT returns rows from the left table that do NOT exist in the right table. All three require matching column structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of UNION / INTERSECT / EXCEPT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nAll VIP IDs =\nUNION(\n    VALUES(PremiumCustomers[CustomerID]),\n    VALUES(EnterpriseCustomers[CustomerID])\n)\n// → All IDs from both tables combined (duplicates kept)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of UNION / INTERSECT / EXCEPT — common patterns you'll see in production.\n-- APPROACH  - Combine UNION / INTERSECT / EXCEPT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nRetained Customers =\nVAR ThisYear =\n    CALCULATETABLE(VALUES(Sales[CustomerID]), YEAR(Sales[Date]) = 2024)\nVAR LastYear =\n    CALCULATETABLE(VALUES(Sales[CustomerID]), YEAR(Sales[Date]) = 2023)\nRETURN\nCOUNTROWS(INTERSECT(ThisYear, LastYear))\nChurned =\nCOUNTROWS(EXCEPT(LastYear, ThisYear))"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of UNION / INTERSECT / EXCEPT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nNew Customers =\nVAR This  = CALCULATETABLE(VALUES(Sales[CustomerID]), YEAR(Sales[Date]) = 2024)\nVAR Prior = CALCULATETABLE(VALUES(Sales[CustomerID]), YEAR(Sales[Date]) = 2023)\nRETURN COUNTROWS(EXCEPT(This, Prior))   // bought this year, not last year\nReturning Customers =\nCOUNTROWS(INTERSECT(This, Prior))       // bought in both years\nLost Customers =\nCOUNTROWS(EXCEPT(Prior, This))          // bought last year, not this year\nDistinct Combined =\nDISTINCT(UNION(Table1, Table2))\nIs Premium =\nProducts[ID] IN VALUES(PremiumProducts[ID])   // cleaner than INTERSECT"
                  }
        ],
        tips: [
                  "UNION keeps duplicates (like SQL UNION ALL) — wrap with DISTINCT() to remove them",
                  "INTERSECT and EXCEPT compare entire rows — all columns must match for a row to qualify",
                  "The `IN` operator is cleaner than INTERSECT for simple membership checks in filter conditions"
        ],
        mistake: "Expecting UNION to deduplicate like SQL UNION. DAX UNION keeps all rows including duplicates. Always wrap with DISTINCT() if you need unique rows.",
        shorthand: {
          verbose: "// Verbose: separate table variables then combine\nVAR a=FILTER(Customers, Customers[Tier]=\"A\")\nVAR b=FILTER(Customers, Customers[Tier]=\"B\")\nRETURN UNION(a, b)",
          concise: "// Concise: inline UNION\nCombined = UNION(FILTER(Customers, Customers[Tier]=\"A\"), FILTER(Customers, Customers[Tier]=\"B\"))",
        },
      },
    ],
  },

  // ── Section 8: Information, Math & Modifiers ─────────────────────────────────────────
  {
    id: "info-math-modifiers",
    title: "Information, Math & Modifiers",
    entries: [
      {
        id: "isblank-iferror",
        fn: "ISBLANK / IFERROR / IF / COALESCE",
        desc: "Handle missing, blank, and error values gracefully.",
        category: "Information",
        subtitle: "Defensive DAX — never let blanks or errors break a visual",
        signature: "ISBLANK(value) | IFERROR(value, alt) | COALESCE(val1, val2, ...)",
        descLong: "BLANK is DAX's null — it propagates through calculations and displays as empty in visuals. ISBLANK() tests for it. IFERROR() catches any calculation error and returns an alternate. COALESCE() (DAX 2020+) returns the first non-blank value from a list — cleaner than nested IF/ISBLANK chains.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ISBLANK / IFERROR / IF / COALESCE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSales Display =\nIF(ISBLANK([Total Sales]), 0, [Total Sales])\nSafe Division =\nIFERROR(SUM(Sales[Amount]) / SUM(Sales[Quantity]), 0)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ISBLANK / IFERROR / IF / COALESCE — common patterns you'll see in production.\n-- APPROACH  - Combine ISBLANK / IFERROR / IF / COALESCE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nDisplay Value =\nCOALESCE([Actual Sales], [Forecast Sales], [Budget Sales], 0)\n// → Returns first non-blank: Actual, then Forecast, then Budget, then 0\nLabel =\nIF(\n    ISBLANK([Total Sales]),\n    \"No Data\",\n    FORMAT([Total Sales], \"$#,##0\")\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ISBLANK / IFERROR / IF / COALESCE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// BLANK: does not plot on line charts (gap), excluded from averages\n// 0: plots as zero, included in averages\n// Use BLANK intentionally for missing periods:\nSales or Blank =\nIF(COUNTROWS(Sales) = 0, BLANK(), SUM(Sales[Amount]))\nSafe Rank =\nIFERROR(\n    RANKX(ALL(Products), [Total Sales]),\n    BLANK()\n)\nSafe % =\nVAR Denom = [Total Budget]\nRETURN\nIF(\n    ISBLANK(Denom) || Denom = 0,\n    BLANK(),\n    DIVIDE([Total Sales], Denom)\n)"
                  }
        ],
        tips: [
                  "BLANK and 0 behave differently in visuals — BLANK creates gaps in line charts; 0 plots as zero",
                  "COALESCE is cleaner than `IF(ISBLANK(a), IF(ISBLANK(b), c, b), a)` — use it in DAX 2020+",
                  "Use IFERROR sparingly — it hides real errors. Fix the root cause when possible; use IFERROR for unavoidable edge cases"
        ],
        mistake: "Using `IF([Total Sales] = BLANK(), ...)`. Comparing to BLANK() with `=` doesn't work reliably. Use `ISBLANK([Total Sales])` instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: IF(ISBLANK(...)) pattern\nResult = IF(ISBLANK(Sales[Discount]), 0, Sales[Discount])\n// More explicit but longer",
          concise: "// Concise: COALESCE\nResult = COALESCE(Sales[Discount], 0)",
        },
      },
      {
        id: "isfiltered-hasonefilter",
        fn: "ISFILTERED / ISCROSSFILTERED / HASONEFILTER",
        desc: "Detect the current filter state — write measures that behave differently by context.",
        category: "Information",
        subtitle: "Inspect the filter context to write adaptive measures",
        signature: "ISFILTERED(col) | ISCROSSFILTERED(col) | HASONEFILTER(col) | ISINSCOPE(col)",
        descLong: "These functions let a measure inspect its own filter context. ISFILTERED is TRUE when a column has a direct filter. ISCROSSFILTERED is TRUE when a column is filtered via a relationship. HASONEFILTER is TRUE when exactly one value is selected. ISINSCOPE is TRUE when a column is the innermost grouping level in a matrix.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ISFILTERED / ISCROSSFILTERED / HASONEFILTER — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nContext Label =\nIF(\n    ISFILTERED(Sales[Category]),\n    \"Filtered by Category\",\n    \"All Categories\"\n)\nSingle Product Sales =\nIF(HASONEFILTER(Products[Name]), [Total Sales], BLANK())"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ISFILTERED / ISCROSSFILTERED / HASONEFILTER — common patterns you'll see in production.\n-- APPROACH  - Combine ISFILTERED / ISCROSSFILTERED / HASONEFILTER with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nReport Title =\nIF(\n    HASONEVALUE(Calendar[Year]),\n    \"Sales — \" & SELECTEDVALUE(Calendar[Year]),\n    \"Sales — All Years\"\n)\n% of Total =\nIF(\n    ISINSCOPE(Products[Name]),\n    DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products))),\n    BLANK()    // hide % at category/total rows\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ISFILTERED / ISCROSSFILTERED / HASONEFILTER — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nAdaptive Measure =\nSWITCH(\n    TRUE(),\n    ISINSCOPE(Products[Name]),     [Unit Sales],       // product level\n    ISINSCOPE(Products[Category]), [Category Sales],   // category level\n    [Grand Total Sales]                                 // total level\n)\nHas Customer Filter =\nISCROSSFILTERED(Sales[CustomerID])\n// → TRUE when a Customers slicer is active, even with no direct filter on Sales\n// HASONEFILTER: exactly 1 filter VALUE applied to column\n// HASONEVALUE: exactly 1 distinct value visible after all filters\n// They differ when a filter selects multiple values"
                  }
        ],
        tips: [
                  "ISINSCOPE is the cleanest way to show different measures at different matrix hierarchy levels",
                  "ISCROSSFILTERED detects indirect filtering through relationships — useful for debugging unexpected filter behavior",
                  "HASONEVALUE is usually what you want over HASONEFILTER — it checks what's visible, not how many filters were applied"
        ],
        mistake: "Using HASONEFILTER expecting it to mean \"one item selected\". If the user selects one category that contains 10 products, HASONEFILTER(Products[Name]) = FALSE. Use HASONEVALUE to check distinct visible values.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: HASONEFILTER + VALUES\nLabel = IF(HASONEFILTER(Calendar[Year]), VALUES(Calendar[Year]), \"All Years\")\n// More explicit but longer",
          concise: "// Concise: SELECTEDVALUE\nLabel = SELECTEDVALUE(Calendar[Year], \"All Years\")",
        },
      },
      {
        id: "round-math",
        fn: "ROUND / ABS / INT / MOD / POWER",
        desc: "Core mathematical operations — rounding, absolute value, integer math, modulo.",
        category: "Math",
        subtitle: "Numeric manipulation functions for calculated columns and measures",
        signature: "ROUND(n, decimals) | ABS(n) | INT(n) | MOD(n, divisor) | POWER(n, exp)",
        descLong: "DAX includes a complete set of mathematical functions. ROUND rounds to N decimal places (negative N rounds to tens, hundreds). ROUNDUP always rounds away from zero; ROUNDDOWN always rounds toward zero. INT truncates to integer. MOD returns the remainder after division.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROUND / ABS / INT / MOD / POWER — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nROUND(3.14159, 2)     // → 3.14   (standard rounding)\nROUNDUP(3.141, 2)     // → 3.15   (always up)\nROUNDDOWN(3.149, 2)   // → 3.14   (always down — truncates)\nINT(3.9)              // → 3      (truncates, not rounds)\nINT(-3.1)             // → -4     (toward negative infinity)\nABS(-42)              // → 42\nMOD(17, 5)            // → 2      (17 ÷ 5 remainder)\nPOWER(2, 10)          // → 1024"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROUND / ABS / INT / MOD / POWER — common patterns you'll see in production.\n-- APPROACH  - Combine ROUND / ABS / INT / MOD / POWER with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nTotal Rounded =\nROUND(SUM(Sales[Amount]), 0)\nROUND(1234.56, -2)    // → 1200\nCEILING(3.1, 1)       // → 4    (round up to nearest 1)\nFLOOR(3.9, 1)         // → 3    (round down to nearest 1)\nCEILING(18, 5)        // → 20   (round up to nearest 5)\nFLOOR(18, 5)          // → 15   (round down to nearest 5)\nFiscal Month =\nMOD(MONTH(Sales[Date]) - 7 + 12, 12) + 1\n// → Converts calendar month to fiscal month (FY starts July)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROUND / ABS / INT / MOD / POWER — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSQRT(SUM(Sales[VarianceSquared]))   // → std deviation step\nLOG(1000, 10)                       // → 3     (log base 10)\nLOG(8, 2)                           // → 3     (log base 2)\nEXP(1)                              // → 2.718 (e^1)\nCAGR =\nPOWER(\n    DIVIDE([End Value], [Start Value]),\n    DIVIDE(1, [Years])\n) - 1\n// ROUND(2.5) = 3, ROUND(3.5) = 4  — consistent behavior\n// Excel ROUND behaves identically"
                  }
        ],
        tips: [
                  "ROUND with negative decimals: `ROUND(1234, -2)` = 1200 (round to nearest hundred)",
                  "CEILING and FLOOR take a significance argument — `CEILING(18, 5)` = 20 (next multiple of 5)",
                  "INT truncates toward negative infinity: INT(-3.1) = -4, not -3. Use ROUNDDOWN for truncation toward zero."
        ],
        mistake: "Using INT() expecting it to round. INT(3.9) = 3, INT(-3.9) = -4. For rounding, use ROUND(). For truncation toward zero, use ROUNDDOWN(n, 0).",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: ROUND with explicit digits\nRounded = ROUND(Sales[Amount], 2)\n// More explicit but longer",
          concise: "// Concise: MROUND for multiples of 5\nRounded = MROUND(Sales[Amount], 5)",
        },
      },
      {
        id: "median-percentile",
        fn: "MEDIAN / PERCENTILE / STDEV",
        desc: "Statistical aggregations beyond average — distribution and spread measures.",
        category: "Math",
        subtitle: "Distribution statistics for data analysis reports",
        signature: "MEDIAN(col) | MEDIANX(table, expr) | PERCENTILE.INC(col, k) | STDEV.P(col)",
        descLong: "DAX provides statistical functions for analyzing distributions. MEDIAN returns the 50th percentile. PERCENTILE.INC interpolates between values; PERCENTILE.EXC excludes the endpoints. STDEV.P assumes the data is the full population; STDEV.S assumes it's a sample (uses n-1 denominator).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of MEDIAN / PERCENTILE / STDEV — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nMedian Order  = MEDIAN(Sales[Amount])\nP25 Order     = PERCENTILE.INC(Sales[Amount], 0.25)   // 25th percentile\nP75 Order     = PERCENTILE.INC(Sales[Amount], 0.75)   // 75th percentile\nP90 Order     = PERCENTILE.INC(Sales[Amount], 0.90)   // 90th percentile"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of MEDIAN / PERCENTILE / STDEV — common patterns you'll see in production.\n-- APPROACH  - Combine MEDIAN / PERCENTILE / STDEV with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nIQR =\nPERCENTILE.INC(Sales[Amount], 0.75) -\nPERCENTILE.INC(Sales[Amount], 0.25)\nSales Std Dev = STDEV.P(Sales[Amount])   // population std dev\nSales Std Dev = STDEV.S(Sales[Amount])   // sample std dev\nMedian Margin % =\nMEDIANX(\n    Sales,\n    DIVIDE(Sales[Revenue] - RELATED(Products[Cost]), Sales[Revenue])\n)\n// → Median per-order margin, not margin of totals"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of MEDIAN / PERCENTILE / STDEV — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nZ Score =\nDIVIDE(\n    Sales[Amount] - AVERAGE(Sales[Amount]),\n    STDEV.P(Sales[Amount])\n)\n// → Calculated column: how many std devs each order is from mean\nOutlier Count =\nVAR Q1  = PERCENTILE.INC(Sales[Amount], 0.25)\nVAR Q3  = PERCENTILE.INC(Sales[Amount], 0.75)\nVAR IQR = Q3 - Q1\nRETURN\nCOUNTROWS(\n    FILTER(Sales, Sales[Amount] < Q1 - 1.5 * IQR ||\n                  Sales[Amount] > Q3 + 1.5 * IQR)\n)\n// STDEV.P: divide by n   — use when data IS the population\n// STDEV.S: divide by n-1 — use when data is a SAMPLE of a larger population"
                  }
        ],
        tips: [
                  "Use MEDIANX when the median should be of a row-level expression, not a stored column",
                  "PERCENTILE.INC includes endpoints (0 and 1 are valid); PERCENTILE.EXC excludes them",
                  "STDEV.S (sample) is more common in business analysis — use STDEV.P only for full population data"
        ],
        mistake: "Using AVERAGE as a proxy for MEDIAN. Average is skewed by outliers; median is robust. For sales, order values, or salaries, MEDIAN usually tells a more meaningful story.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: PERCENTILE.INC with explicit k\nP90 = PERCENTILE.INC(Sales[Amount], 0.9)\n// More explicit but longer",
          concise: "// Concise: PERCENTILEX.INC for measure context\nP90 = PERCENTILEX.INC(Sales, Sales[Amount], 0.9)",
        },
      },
      {
        id: "removefilters-userelationship",
        fn: "REMOVEFILTERS / KEEPFILTERS / USERELATIONSHIP",
        desc: "Advanced CALCULATE modifiers — fine-grained control over filter context.",
        category: "Modifiers",
        subtitle: "Control exactly how filters are applied, removed, or redirected",
        signature: "REMOVEFILTERS(table | col) | KEEPFILTERS(filter) | USERELATIONSHIP(col1, col2)",
        descLong: "CALCULATE filter modifiers change how filters are applied before evaluating an expression. REMOVEFILTERS is the modern name for ALL() as a modifier. KEEPFILTERS intersects rather than replaces the existing filter. USERELATIONSHIP activates an inactive relationship for one calculation. CROSSFILTER controls the direction of relationship filtering.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of REMOVEFILTERS / KEEPFILTERS / USERELATIONSHIP — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nGrand Total =\nCALCULATE(\n    SUM(Sales[Amount]),\n    REMOVEFILTERS(Sales)    // remove all filters on Sales table\n)\nTotal Across Products =\nCALCULATE(\n    SUM(Sales[Amount]),\n    REMOVEFILTERS(Sales[Product])\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of REMOVEFILTERS / KEEPFILTERS / USERELATIONSHIP — common patterns you'll see in production.\n-- APPROACH  - Combine REMOVEFILTERS / KEEPFILTERS / USERELATIONSHIP with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nNorth Sales Only =\nCALCULATE(\n    SUM(Sales[Amount]),\n    KEEPFILTERS(Sales[Region] = \"North\")\n)\n// → If user has Region filtered to \"North\" and \"East\":\n//   Without KEEPFILTERS: returns North sales regardless of slicer\n//   With KEEPFILTERS: returns North sales only when North is in the slicer\nShip Date Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    USERELATIONSHIP(Sales[ShipDate], Calendar[Date])\n)\n// → Uses ShipDate→Calendar relationship instead of OrderDate→Calendar"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of REMOVEFILTERS / KEEPFILTERS / USERELATIONSHIP — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Default: one-to-many filters from \"one\" side to \"many\" side only\n// CROSSFILTER can enable bidirectional or disable filtering\n// Enable bidirectional for one calculation only:\nProducts with Sales =\nCALCULATE(\n    COUNTROWS(Products),\n    CROSSFILTER(Sales[ProductID], Products[ProductID], Both)\n)\n// Disable filtering across a relationship:\nCALCULATE(\n    SUM(Sales[Amount]),\n    CROSSFILTER(Sales[CustomerID], Customers[CustomerID], None)\n)\nOrders Shipped in Period =\nCALCULATE(\n    COUNT(Sales[OrderID]),\n    USERELATIONSHIP(Sales[ShipDate], Calendar[Date]),\n    DATESYTD(Calendar[Date])\n)\n// NOTE: USERELATIONSHIP must reference columns from tables with a relationship"
                  }
        ],
        tips: [
                  "REMOVEFILTERS is the modern, explicit version of ALL() used as a CALCULATE modifier — prefer it in new code",
                  "KEEPFILTERS prevents CALCULATE from overriding the user's slicer selection — use it for \"within current selection\" measures",
                  "You can combine USERELATIONSHIP with time intelligence functions — very useful for multi-date-column models"
        ],
        mistake: "Using CROSSFILTER(col1, col2, Both) globally in the model when you only need it for one measure. Set the relationship to bidirectional in the model only if ALL measures should use it — otherwise use CROSSFILTER inside CALCULATE.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: ALL to remove filters then re-apply\nAllSales = CALCULATE(SUM(Sales[Amount]), ALL(Sales[Category]))\n// More explicit but longer",
          concise: "// Concise: REMOVEFILTERS for clarity + USERELATIONSHIP for inactive\nOnlineSales = CALCULATE(SUM(Sales[Amount]), USERELATIONSHIP(Sales[OrderDate], Calendar[Date]))",
        },
      },
      {
        id: "earlier",
        fn: "EARLIER / EARLIEST",
        desc: "Access outer row context values from within a nested row context — legacy but important.",
        category: "Information",
        subtitle: "Self-referencing calculated columns — ranking and running totals without measures",
        signature: "EARLIER(column, n) | EARLIEST(column)",
        descLong: "EARLIER accesses the row context from one level up in nested iteration — essentially letting a calculated column refer to its own row's value while being filtered. Introduced before VAR existed, it's now mostly replaceable with VAR. Still important to understand when reading legacy DAX code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EARLIER / EARLIEST — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nPrice Rank =\nCOUNTROWS(\n    FILTER(\n        Products,\n        Products[Price] >= EARLIER(Products[Price])\n    )\n)\n// → For each product row: count how many products have Price >= this row's Price"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EARLIER / EARLIEST — common patterns you'll see in production.\n-- APPROACH  - Combine EARLIER / EARLIEST with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nRunning Total =\nSUMX(\n    FILTER(\n        Sales,\n        Sales[Date] <= EARLIER(Sales[Date])\n    ),\n    Sales[Amount]\n)\n// → For each Sales row: sum all amounts where Date <= this row's Date\n// WHY: EARLIER captures the \"outer\" Date value while FILTER iterates all rows"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EARLIER / EARLIEST — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// VAR is cleaner and more readable than EARLIER\n// Old EARLIER pattern:\nPrice Rank Old =\nCOUNTROWS(FILTER(Products, Products[Price] >= EARLIER(Products[Price])))\n// Modern VAR equivalent:\nPrice Rank New =\nVAR CurrentPrice = Products[Price]\nRETURN\nCOUNTROWS(FILTER(Products, Products[Price] >= CurrentPrice))\n// Used when you have an iterator inside an iterator inside a calculated column\n// NOTE: Avoid deeply nested row contexts — VAR makes this cleaner and avoids EARLIEST entirely"
                  }
        ],
        tips: [
                  "EARLIER is mostly replaced by VAR in modern DAX — always prefer VAR for readability",
                  "You'll encounter EARLIER in legacy code and community examples — understand it to debug, use VAR to write",
                  "EARLIEST goes two levels up in nested context — if you need it, VAR is a clearer solution"
        ],
        mistake: "Using EARLIER when VAR is available. `VAR CurrentPrice = Products[Price]` captures the same value as EARLIER(Products[Price]) but is far more readable and debuggable.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Verbose: EARLIER for nested row context\nRank = COUNTROWS(FILTER(Products, Products[Price] > EARLIER(Products[Price])))\n// More explicit but longer",
          concise: "// Concise: VAR replaces EARLIER\nRank = VAR cp=Products[Price] RETURN COUNTROWS(FILTER(Products, Products[Price] > cp))",
        },
      },
    ],
  },

  // ── Section 9: Advanced CALCULATE & Filter Modifiers ─────────────────────────────────────────
  {
    id: "advanced-calculate",
    title: "Advanced CALCULATE & Filter Modifiers",
    entries: [
      {
        id: "allselected",
        fn: "ALLSELECTED / ALLNOBLANKROW",
        desc: "ALLSELECTED removes filters from the query but keeps filters from outside the query (slicers). ALLNOBLANKROW returns all rows ignoring the blank row from referential integrity violations.",
        category: "Modifiers",
        subtitle: "ALLSELECTED, ALLNOBLANKROW, query context vs filter context, shadow filter context",
        signature: "ALLSELECTED(<table>[, <column>...]) or ALLNOBLANKROW(<table>[, <column>...])",
        descLong: "ALLSELECTED is one of the most misunderstood DAX functions. It removes filters created by the visual/query (e.g. rows in a matrix) but retains filters applied externally (slicers, page-level filters). This makes it ideal for calculating percentages of a filtered total. Internally, ALLSELECTED restores a 'shadow filter context' — the filter context that existed before the visual applied its own grouping. ALLNOBLANKROW returns all rows from a dimension table, ignoring the blank row that DAX automatically adds when referential integrity is violated (i.e. fact rows with no matching dimension). Use ALLNOBLANKROW for data quality checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ALLSELECTED / ALLNOBLANKROW — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n% of Category Total =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Sales[Category]))\n)\n// If slicer selects [Electronics, Clothing] and matrix shows rows:\n//   Electronics: 500 / (500+300) = 62.5%\n//   Clothing:    300 / (500+300) = 37.5%\n// ALL() would ignore the slicer → denominator = all categories\n// ALLSELECTED() respects the slicer → denominator = selected categories only"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ALLSELECTED / ALLNOBLANKROW — common patterns you'll see in production.\n-- APPROACH  - Combine ALLSELECTED / ALLNOBLANKROW with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nRank in Selected Categories =\nVAR CurrentSales = SUM(Sales[Amount])\nVAR VisibleSales =\n    CALCULATETABLE(\n        VALUES(Sales[Category]),\n        ALLSELECTED(Sales[Category])\n    )\nVAR Ranked =\n    RANKX(\n        VisibleSales,\n        CALCULATE(SUM(Sales[Amount]))\n    )\nRETURN Ranked\n// ALLNOBLANKROW: detect orphaned fact rows\nOrphaned Sales Count =\nCALCULATE(\n    COUNTROWS(Sales),\n    ALLNOBLANKROW(Product)\n) - COUNTROWS(Sales)\n// If > 0, some Sales rows have no matching Product → data quality issue"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ALLSELECTED / ALLNOBLANKROW — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Dynamic denominator: respects page filters, ignores visual grouping\nDynamic % of Total =\nVAR CurrentVal = SUM(Sales[Amount])\nVAR Denominator =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        ALLSELECTED()\n    )\nVAR Result = DIVIDE(CurrentVal, Denominator)\nRETURN Result\n// Detect context level for conditional formatting\nContext Level =\nSWITCH(\n    TRUE(),\n    ISFILTERED(Sales[Product]), \"Product\",\n    ISFILTERED(Sales[Category]), \"Category\",\n    ISFILTERED(Sales[Region]), \"Region\",\n    \"All\"\n)\n// ALLSELECTED with multiple columns: preserve some, remove others\n% within Region =\nDIVIDE(\n    SUM(Sales[Amount]),\n    CALCULATE(\n        SUM(Sales[Amount]),\n        ALLSELECTED(Sales[Product]),\n        ALLSELECTED(Sales[Category])\n    )\n)\n// Removes Product and Category grouping but keeps Region filter from slicer"
                  }
        ],
        tips: [
                  "ALLSELECTED respects slicer/page filters but ignores visual grouping — use for % of filtered total.",
                  "ALL() ignores ALL filters (slicers + visual) — use for true grand total regardless of selections.",
                  "ALLNOBLANKROW is useful for data quality checks — detects orphaned fact rows.",
                  "ALLSELECTED() with no arguments restores the entire shadow filter context — powerful but subtle.",
                  "ALLSELECTED can behave unexpectedly when the same column appears in both slicer and visual — test thoroughly."
        ],
        mistake: "Using ALLSELECTED inside a measure that's used in a card visual — there's no visual grouping to remove, so ALLSELECTED behaves like ALL and ignores slicer filters. Use ALL() or REMOVEFILTERS() explicitly in card visuals.",
        shorthand: {
          verbose: "// ALLSELECTED: % of filtered total\n% of Selected = DIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Sales[Category])))\n// ALLNOBLANKROW: data quality\nOrphans = CALCULATE(COUNTROWS(Sales), ALLNOBLANKROW(Product)) - COUNTROWS(Sales)",
          concise: "// Quick ALLSELECTED\n% Sel = DIVIDE(SUM(t[v]), CALCULATE(SUM(t[v]), ALLSELECTED(t[c])))",
        },
      },
      {
        id: "treatas",
        fn: "TREATAS — virtual relationship between tables",
        desc: "TREATAS applies a filter from one table to another without a physical relationship. It's the DAX equivalent of a virtual join — essential for disconnected tables and many-to-many patterns.",
        category: "Modifiers",
        subtitle: "TREATAS, virtual relationship, disconnected table, many-to-many, VALUES bridge",
        signature: "TREATAS(<table_expression>, <column1>[, <column2>...])",
        descLong: "TREATAS takes a table expression and applies its values as filters to the specified columns. This creates a 'virtual relationship' — no physical relationship is needed in the data model. Common use cases: (1) Disconnected parameter tables where a slicer on the disconnected table needs to filter a fact table. (2) Many-to-many relationships where a bridge table would be needed. (3) Applying a filter from a calculated table to a physical table. TREATAS is more efficient than FILTER with CONTAINS because it uses the storage engine for the filter application. It's the recommended pattern over INTERSECT for virtual relationships.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of TREATAS — virtual relationship between tables — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Setup: Disconnected table 'YearSlicer' with a Year column, no relationship to Sales\n// Slicer on YearSlicer[Year] → needs to filter Sales[OrderYear]\nSales for Selected Year =\nCALCULATE(\n    SUM(Sales[Amount]),\n    TREATAS(\n        VALUES(YearSlicer[Year]),\n        Sales[OrderYear]\n    )\n)\n// VALUES(YearSlicer[Year]) returns the selected years from the slicer\n// TREATAS applies those values as a filter on Sales[OrderYear]\n// No relationship needed in the data model"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of TREATAS — virtual relationship between tables — common patterns you'll see in production.\n-- APPROACH  - Combine TREATAS — virtual relationship between tables with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Disconnected table: Scenario[Multiplier] = {0.5, 1.0, 1.5, 2.0}\n// Slicer on Scenario[Multiplier] → adjusts forecast\nAdjusted Forecast =\nVAR Multiplier = SELECTEDVALUE(Scenario[Multiplier], 1)\nRETURN\nCALCULATE(\n    SUM(Sales[Amount]) * Multiplier,\n    TREATAS(\n        VALUES(Sales[ProductKey]),\n        Forecast[ProductKey]\n    )\n)\n// Many-to-many: filter Product through a bridge of Categories\n// Products ← ProductCategory → Categories (many-to-many)\nSales by Selected Category =\nCALCULATE(\n    SUM(Sales[Amount]),\n    TREATAS(\n        VALUES(CategoryBridge[ProductKey]),\n        Sales[ProductKey]\n    )\n)\n// CategoryBridge is filtered by Category slicer → TREATAS bridges to Sales"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of TREATAS — virtual relationship between tables — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Security table: UserSecurity[UserName] → UserSecurity[Region]\n// No relationship to Sales — use TREATAS in RLS expression\n// RLS expression on Sales table:\nTREATAS(\n    SELECTCOLUMNS(\n        FILTER(UserSecurity, UserSecurity[UserName] = USERPRINCIPALNAME()),\n        \"Region\", UserSecurity[Region]\n    ),\n    Sales[Region]\n)\n// Multi-column virtual relationship: composite key\nSales by Composite Key =\nCALCULATE(\n    SUM(Sales[Amount]),\n    TREATAS(\n        SELECTCOLUMNS(\n            FILTER(TargetTable, TargetTable[Active] = TRUE()),\n            \"Col1\", TargetTable[Key1],\n            \"Col2\", TargetTable[Key2]\n        ),\n        Sales[Key1],\n        Sales[Key2]\n    )\n)\n// TREATAS with multiple columns creates a composite virtual relationship"
                  }
        ],
        tips: [
                  "TREATAS is more efficient than FILTER + CONTAINS for virtual relationships — it uses the storage engine directly.",
                  "Use VALUES() as the first argument to pass the current slicer selection as a filter.",
                  "TREATAS supports multiple columns for composite key virtual relationships.",
                  "For dynamic RLS with mapping tables, TREATAS is the recommended pattern over physical relationships.",
                  "If the source table is empty (no selection), TREATAS applies no filter — the measure returns the unfiltered total."
        ],
        mistake: "Using TREATAS with a table that has duplicate values in the target column — TREATAS applies each row as a filter, so duplicates cause redundant filtering and potential performance issues. Use DISTINCT or VALUES on the source table first.",
        shorthand: {
          verbose: "// TREATAS: disconnected slicer filters fact table\nSales Selected = CALCULATE(SUM(Sales[Amount]), TREATAS(VALUES(YearSlicer[Year]), Sales[OrderYear]))\n// Multi-column composite key\nCALCULATE(SUM(Sales[Amt]), TREATAS(VALUES(Bridge[K1], Bridge[K2]), Sales[K1], Sales[K2]))",
          concise: "// Quick TREATAS\nCALCULATE(SUM(t[v]), TREATAS(VALUES(s[c]), t[c]))",
        },
      },
      {
        id: "crossfilter",
        fn: "CROSSFILTER — control filter direction in CALCULATE",
        desc: "CROSSFILTER modifies the cross-filter direction of a relationship for the duration of a CALCULATE. Supports None, OneWay, Both, and OneWay_LeftFiltersRight directions.",
        category: "Modifiers",
        subtitle: "CROSSFILTER, None, OneWay, Both, bidirectional filtering, relationship direction override",
        signature: "CROSSFILTER(<leftColumnName>, <rightColumnName>, <direction>)",
        descLong: "CROSSFILTER is a CALCULATE modifier that temporarily changes the filter direction of an existing relationship. Directions: None (disables filtering), OneWay (default — left filters right), Both (bidirectional), OneWay_LeftFiltersRight (explicit one-way). It's essential for scenarios where you need bidirectional filtering temporarily without permanently changing the model (which can cause ambiguity). Common use case: a Sales → Product → Category chain where you need Category to filter Sales through Product, but the model has one-way relationships. CROSSFILTER('Both') temporarily enables bidirectional filtering for that calculation only.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CROSSFILTER — control filter direction in CALCULATE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Model: Sales → Product (one-way: Product filters Sales)\n// Need: Sales filter to propagate back to Product\nProducts with Sales =\nCALCULATE(\n    DISTINCTCOUNT(Product[ProductKey]),\n    CROSSFILTER(Sales[ProductKey], Product[ProductKey], Both)\n)\n// Without CROSSFILTER: returns all products (Sales doesn't filter Product)\n// With CROSSFILTER Both: returns only products that have matching sales rows"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CROSSFILTER — control filter direction in CALCULATE — common patterns you'll see in production.\n-- APPROACH  - Combine CROSSFILTER — control filter direction in CALCULATE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Model: Date → Sales (one-way: Date filters Sales)\n// Need: Total sales regardless of date selection (but keep other filters)\nAll-Time Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    CROSSFILTER(Date[DateKey], Sales[DateKey], None)\n)\n// Date slicer is ignored, but Category/Region slicers still apply\n// Compare: ALL(Date) removes filters on Date but keeps the relationship\n// CROSSFILTER(None) disables the relationship entirely\n// Bidirectional for a specific chain: Sales → Product → Category\nSales by Category (bidirectional) =\nCALCULATE(\n    SUM(Sales[Amount]),\n    CROSSFILTER(Sales[ProductKey], Product[ProductKey], Both),\n    CROSSFILTER(Product[CategoryKey], Category[CategoryKey], Both)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CROSSFILTER — control filter direction in CALCULATE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Model: Customer → Sales ← Product → Category ← Store\n// Default: all one-way relationships\n// Need: Store selection → filter Sales (through Product → Store chain)\nSales for Selected Store =\nCALCULATE(\n    SUM(Sales[Amount]),\n    CROSSFILTER(Store[StoreKey], Product[StoreKey], Both),\n    CROSSFILTER(Product[ProductKey], Sales[ProductKey], Both)\n)\n// Store → Product (Both): Store filters Product\n// Product → Sales (Both): Product filters Sales (already one-way, Both enables reverse)\n// Net: Store selection → Product → Sales\n// Measure to detect if bidirectional is needed\nNeeds Bidirectional =\nVAR OneWayResult = CALCULATE(SUM(Sales[Amount]))\nVAR BothResult =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        CROSSFILTER(Product[ProductKey], Sales[ProductKey], Both)\n    )\nRETURN\n    IF(OneWayResult = BothResult, \"One-way sufficient\", \"Bidirectional needed\")\n// Performance: Both direction forces a full scan of both tables — use sparingly\n// Prefer TREATAS or physical relationship changes for permanent needs"
                  }
        ],
        tips: [
                  "CROSSFILTER is scoped to the CALCULATE — the model's relationship direction is unchanged.",
                  "Use CROSSFILTER(Both) sparingly — bidirectional filtering can cause ambiguity and performance issues.",
                  "CROSSFILTER(None) is useful for 'all-time' calculations that should ignore a specific relationship.",
                  "You can chain multiple CROSSFILTER calls in one CALCULATE to control multiple relationships.",
                  "CROSSFILTER requires the columns to be part of an existing relationship — it can't create new ones."
        ],
        mistake: "Setting bidirectional filtering permanently in the model instead of using CROSSFILTER(Both) in a single measure — bidirectional relationships cause filter ambiguity warnings and can break other measures. Use CROSSFILTER for scoped bidirectional needs.",
        shorthand: {
          verbose: "// CROSSFILTER: temporary bidirectional filtering\nProducts w/Sales = CALCULATE(DISTINCTCOUNT(Product[Key]), CROSSFILTER(Sales[Key], Product[Key], Both))\n// CROSSFILTER: disable relationship\nAllTime = CALCULATE(SUM(Sales[Amt]), CROSSFILTER(Date[Key], Sales[Key], None))",
          concise: "// Quick CROSSFILTER\nCALCULATE(SUM(t[v]), CROSSFILTER(t1[k], t2[k], Both))",
        },
      },
    ],
  },

  // ── Section 10: Advanced Table Functions ─────────────────────────────────────────
  {
    id: "advanced-table-functions",
    title: "Advanced Table Functions",
    entries: [
      {
        id: "summarizecolumns",
        fn: "SUMMARIZECOLUMNS — grouped aggregation with auto-exists",
        desc: "SUMMARIZECOLUMNS is the modern replacement for SUMMARIZE. It groups by columns and aggregates in a single call, with better performance and automatic handling of blank rows.",
        category: "Table Functions",
        subtitle: "SUMMARIZECOLUMNS, grouping, auto-exists, rollup, ignore, SUMMARIZE replacement",
        signature: "SUMMARIZECOLUMNS(<groupBy_column1>..., [<name>, <expression>]...)",
        descLong: "SUMMARIZECOLUMNS was introduced to fix the issues with SUMMARIZE (which had unpredictable behavior when mixing grouping and aggregation). Key advantages: (1) Auto-exists — automatically removes combinations that don't exist in the data (no blank rows). (2) Better performance — optimized for the storage engine. (3) Cleaner syntax — groupBy columns and named expressions are clearly separated. (4) Optional ROLLUPADDISSUBTOTAL for subtotals. (5) IGNORE modifier to skip columns that would produce blank results. SUMMARIZECOLUMNS is the default function used by Power BI visuals to query the model. However, it cannot be used inside a measure that has a filter context transition (CALCULATE) — use SUMMARIZE + ADDCOLUMNS instead in those cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUMMARIZECOLUMNS — grouped aggregation with auto-exists — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSales by Category and Year =\nSUMMARIZECOLUMNS(\n    Product[Category],\n    Date[Year],\n    \"Total Sales\", SUM(Sales[Amount]),\n    \"Order Count\", COUNTROWS(Sales)\n)\n// Returns a table:\n//   Electronics | 2023 | 50000 | 120\n//   Electronics | 2024 | 65000 | 150\n//   Clothing    | 2023 | 30000 | 80\n// (no blank rows for non-existent combinations)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUMMARIZECOLUMNS — grouped aggregation with auto-exists — common patterns you'll see in production.\n-- APPROACH  - Combine SUMMARIZECOLUMNS — grouped aggregation with auto-exists with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// With subtotals at the Category level\nSales with Subtotals =\nSUMMARIZECOLUMNS(\n    ROLLUPADDISSUBTOTAL(Product[Category], \"IsCategorySubtotal\", Date[Year], \"IsYearSubtotal\"),\n    \"Total Sales\", SUM(Sales[Amount])\n)\n// Returns rows with IsCategorySubtotal=TRUE for category-level subtotals\n// and IsYearSubtotal=TRUE for year-level subtotals\n// IGNORE: skip a groupBy column if it produces blank results\nSales by Region (ignore blank cities) =\nSUMMARIZECOLUMNS(\n    Geography[Region],\n    IGNORE(Geography[City]),\n    \"Sales\", SUM(Sales[Amount])\n)\n// If some regions have no city data, the city column is ignored for those rows\n// instead of showing blank"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUMMARIZECOLUMNS — grouped aggregation with auto-exists — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Dynamic grouping based on a disconnected slicer\nDynamic Grouping Table =\nVAR GroupCol =\n    SWITCH(\n        SELECTEDVALUE(GroupLevel[Level]),\n        \"Category\", Product[Category],\n        \"Product\", Product[ProductName],\n        Product[Category]  // default\n    )\nRETURN\n    SUMMARIZECOLUMNS(\n        GroupCol,\n        \"Total Sales\", SUM(Sales[Amount]),\n        \"Rank\", RANKX(ALLSELECTED(GroupCol), CALCULATE(SUM(Sales[Amount])))\n    )\n// Note: This works as a calculated table or in a DAX query,\n// but NOT inside a measure with CALCULATE context transition.\n// For measures, use SUMMARIZE + ADDCOLUMNS instead:\nSales Summary (measure-safe) =\nADDCOLUMNS(\n    SUMMARIZE(Sales, Product[Category]),\n    \"Total Sales\", CALCULATE(SUM(Sales[Amount])),\n    \"Rank\", RANKX(ALL(Product[Category]), CALCULATE(SUM(Sales[Amount])))\n)\n// Performance: SUMMARIZECOLUMNS is 2-5x faster than SUMMARIZE+ADDCOLUMNS\n// for the same grouping, but only outside of CALCULATE context transitions."
                  }
        ],
        tips: [
                  "SUMMARIZECOLUMNS is the preferred grouping function — use it for calculated tables and DAX queries.",
                  "Auto-exists automatically removes non-existent combinations — no blank rows like SUMMARIZE produces.",
                  "Cannot be used inside a measure with CALCULATE context transition — use SUMMARIZE + ADDCOLUMNS instead.",
                  "Use ROLLUPADDISSUBTOTAL for subtotal rows; check the IsSubtotal flag in your visuals.",
                  "IGNORE(column) skips a groupBy column when it would produce blank results — useful for sparse hierarchies."
        ],
        mistake: "Using SUMMARIZECOLUMNS inside a CALCULATE that triggers context transition (e.g. in a measure called from a visual with row context) — it returns blank or errors. Use SUMMARIZE + ADDCOLUMNS pattern instead, which is context-transition safe.",
        shorthand: {
          verbose: "// SUMMARIZECOLUMNS: grouped aggregation\nResult = SUMMARIZECOLUMNS(Product[Category], Date[Year], \"Sales\", SUM(Sales[Amount]))\n// With subtotals\nSUMMARIZECOLUMNS(ROLLUPADDISSUBTOTAL(Product[Category], \"IsSub\"), \"Sales\", SUM(Sales[Amount]))",
          concise: "// Quick SUMMARIZECOLUMNS\nSUMMARIZECOLUMNS(t[c1], t[c2], \"v\", SUM(t[x]))",
        },
      },
      {
        id: "generate",
        fn: "GENERATE / GENERATEALL — cross-join and iterate table expressions",
        desc: "GENERATE iterates a table and evaluates a second table expression for each row, returning the union of all results. GENERATEALL keeps rows where the second expression returns blank.",
        category: "Table Functions",
        subtitle: "GENERATE, GENERATEALL, cross-join, iteration, table-valued expression, CARTESIAN",
        signature: "GENERATE(<table1>, <table2_expression>) or GENERATEALL(<table1>, <table2_expression>)",
        descLong: "GENERATE is DAX's equivalent of a cross-join with a correlated subquery. For each row in table1, it evaluates table2_expression (which can reference columns from table1) and returns the union of all results. This is powerful for building complex tables: e.g. generating a date×product matrix, creating parameterized scenarios, or iterating over groupings. GENERATEALL is identical but keeps rows from table1 where table2_expression returns blank (GENERATE drops them). Use GENERATE when you need a Cartesian product or correlated table expansion. For simple cross-joins, CROSSJOIN is clearer but less flexible (no correlation). GENERATE is also used internally by SUMMARIZECOLUMNS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GENERATE / GENERATEALL — cross-join and iterate table expressions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nDate x Product Matrix =\nGENERATE(\n    VALUES(Date[Date]),\n    VALUES(Product[ProductName])\n)\n// Returns every combination of date and product name\n// Equivalent to CROSSJOIN(VALUES(Date[Date]), VALUES(Product[ProductName]))\n// But GENERATE allows the second table to reference columns from the first\n// With aggregation: sales for each date×product combination\nDate x Product Sales =\nGENERATE(\n    VALUES(Date[Date]),\n    ADDCOLUMNS(\n        VALUES(Product[ProductName]),\n        \"Sales\", CALCULATE(SUM(Sales[Amount]))\n    )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GENERATE / GENERATEALL — cross-join and iterate table expressions — common patterns you'll see in production.\n-- APPROACH  - Combine GENERATE / GENERATEALL — cross-join and iterate table expressions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nScenario Analysis =\nGENERATE(\n    Scenario,  // table with columns: ScenarioName, GrowthRate, DiscountRate\n    ROW(\n        \"Scenario\", Scenario[ScenarioName],\n        \"Projected Revenue\", [Base Revenue] * (1 + Scenario[GrowthRate]),\n        \"Discounted\", [Base Revenue] * (1 + Scenario[GrowthRate]) * (1 - Scenario[DiscountRate])\n    )\n)\n// Each scenario row produces a calculated row with projected values\n// GENERATEALL: keep dates with no sales (show as blank instead of dropping)\nDate x Product Sales (keep blanks) =\nGENERATEALL(\n    VALUES(Date[Date]),\n    ADDCOLUMNS(\n        VALUES(Product[ProductName]),\n        \"Sales\", CALCULATE(SUM(Sales[Amount]))\n    )\n)\n// GENERATE would drop dates where no products have sales\n// GENERATEALL keeps them with blank Sales"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GENERATE / GENERATEALL — cross-join and iterate table expressions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nTop N Products + Others =\nVAR TopN = 5\nVAR TopProducts =\n    TOPN(\n        TopN,\n        VALUES(Product[ProductName]),\n        CALCULATE(SUM(Sales[Amount]))\n    )\nVAR OthersRow =\n    ROW(\"ProductName\", \"Others\", \"Sales\",\n        CALCULATE(\n            SUM(Sales[Amount]),\n            NOT(Product[ProductName] IN TopProducts)\n        )\n    )\nVAR TopRows =\n    GENERATE(\n        TopProducts,\n        ROW(\"ProductName\", Product[ProductName], \"Sales\", CALCULATE(SUM(Sales[Amount])))\n    )\nRETURN\n    UNION(TopRows, OthersRow)\n// GENERATE with correlated filter: for each category, get top 3 products\nTop 3 per Category =\nGENERATE(\n    VALUES(Product[Category]),\n    TOPN(\n        3,\n        CALCULATETABLE(VALUES(Product[ProductName])),\n        CALCULATE(SUM(Sales[Amount]))\n    )\n)\n// For each category, evaluates TOPN in the context of that category\n// Returns a table of Category × ProductName with top 3 per category"
                  }
        ],
        tips: [
                  "GENERATE is a correlated cross-join — the second table can reference columns from the first.",
                  "Use GENERATEALL when you need to keep rows from table1 even if table2 is blank (LEFT JOIN semantics).",
                  "For simple non-correlated cross-joins, CROSSJOIN is clearer and slightly faster.",
                  "GENERATE is used internally by SUMMARIZECOLUMNS — understanding it helps debug query plans.",
                  "Watch result set size: GENERATE over large tables can produce millions of rows."
        ],
        mistake: "Using CROSSJOIN when a correlated expansion is needed — CROSSJOIN can't reference columns from the first table in the second table expression. Use GENERATE for correlated table generation.",
        shorthand: {
          verbose: "// GENERATE: correlated cross-join with aggregation\nResult = GENERATE(VALUES(Date[Date]), ADDCOLUMNS(VALUES(Product[Name]), \"Sales\", CALCULATE(SUM(Sales[Amount]))))\n// GENERATEALL: keep blanks\nGENERATEALL(VALUES(Date[Date]), ADDCOLUMNS(VALUES(Product[Name]), \"Sales\", CALCULATE(SUM(Sales[Amount]))))",
          concise: "// Quick GENERATE\nGENERATE(VALUES(t1[c]), ADDCOLUMNS(VALUES(t2[c]), \"v\", CALCULATE(SUM(t2[x]))))",
        },
      },
    ],
  },

  // ── Section 11: Parent-Child Hierarchies ─────────────────────────────────────────
  {
    id: "parent-child",
    title: "Parent-Child Hierarchies",
    entries: [
      {
        id: "path-functions",
        fn: "PATH / PATHITEM / PATHLENGTH / PATHCONTAINS — parent-child hierarchies",
        desc: "PATH functions flatten parent-child hierarchies (org charts, bill of materials, category trees) into a delimited path string for level-by-level analysis.",
        category: "Hierarchies",
        subtitle: "PATH, PATHITEM, PATHLENGTH, PATHCONTAINS, PATHITEMREVERSE, hierarchy levels, flattened path",
        signature: "PATH(<childColumn>, <parentColumn>) → '1|3|7|12' (pipe-delimited from root to leaf)",
        descLong: "Parent-child hierarchies are common in organizational data (employee→manager), product categories (subcategory→category), and bill-of-materials (component→assembly). DAX PATH functions convert these recursive structures into a flat, pipe-delimited path string. PATH(child, parent) returns the full path from root to the current node. PATHITEM(path, position) extracts a specific level. PATHLENGTH(path) returns the depth. PATHCONTAINS(path, value) checks if a node is in the path. PATHITEMREVERSE extracts from the leaf backward. These functions enable: level-by-level aggregation, depth-based filtering, ancestor/descendant lookups, and hierarchy flattening for reporting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PATH / PATHITEM / PATHLENGTH / PATHCONTAINS — parent-child hierarchies — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Employee table: EmployeeKey, EmployeeName, ParentEmployeeKey\n// Calculated columns:\nPath = PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey])\n// For employee 7 whose manager is 3, whose manager is 1 (CEO):\n// Path = \"1|3|7\"\nDepth = PATHLENGTH(Employee[Path])\n// CEO: Depth = 1, VP: Depth = 2, Manager: Depth = 3, IC: Depth = 4\nLevel 1 Name =\nLOOKUPVALUE(\n    Employee[EmployeeName],\n    Employee[EmployeeKey],\n    PATHITEM(Employee[Path], 1, INTEGER)\n)\n// Level 1 = root (CEO name)\n// Level 2 = VP name\n// Level 3 = Director name"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PATH / PATHITEM / PATHLENGTH / PATHCONTAINS — parent-child hierarchies — common patterns you'll see in production.\n-- APPROACH  - Combine PATH / PATHITEM / PATHLENGTH / PATHCONTAINS — parent-child hierarchies with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// Sales rolled up to each manager (including indirect reports)\nSales for Manager's Org =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        Employee,\n        PATHCONTAINS(Employee[Path], SELECTEDVALUE(Employee[EmployeeKey]))\n    )\n)\n// If employee 3 is selected, returns sales for employee 3 + all descendants\n// PATHCONTAINS checks if the selected employee key appears in anyone's path\n// Direct reports only (depth = selected + 1)\nDirect Reports Sales =\nVAR SelectedKey = SELECTEDVALUE(Employee[EmployeeKey])\nVAR SelectedDepth = SELECTEDVALUE(Employee[Depth])\nRETURN\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        Employee,\n        Employee[Depth] = SelectedDepth + 1 &&\n        PATHCONTAINS(Employee[Path], SelectedKey)\n    )\n)\n// Only employees one level below the selected manager"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PATH / PATHITEM / PATHLENGTH / PATHCONTAINS — parent-child hierarchies — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Ancestor lookup: get the Nth ancestor of the current node\nNth Ancestor Name =\nVAR N = SELECTEDVALUE(AncestorLevel[Level], 1)\nVAR AncestorKey = PATHITEM(Employee[Path], N, INTEGER)\nRETURN\nLOOKUPVALUE(Employee[EmployeeName], Employee[EmployeeKey], AncestorKey)\n// Descendant count at each level\nDescendants at Level =\nVAR SelectedKey = SELECTEDVALUE(Employee[EmployeeKey])\nVAR SelectedDepth = SELECTEDVALUE(Employee[Depth])\nRETURN\nCALCULATE(\n    COUNTROWS(Employee),\n    FILTER(\n        ALL(Employee),\n        PATHCONTAINS(Employee[Path], SelectedKey) &&\n        Employee[Depth] > SelectedDepth\n    )\n)\n// Build a flattened hierarchy table for reporting\nFlattened Hierarchy =\nADDCOLUMNS(\n    Employee,\n    \"Path\", PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey]),\n    \"Depth\", PATHLENGTH(PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey])),\n    \"Level1\", LOOKUPVALUE(Employee[EmployeeName], Employee[EmployeeKey],\n        PATHITEM(PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey]), 1, INTEGER)),\n    \"Level2\", LOOKUPVALUE(Employee[EmployeeName], Employee[EmployeeKey],\n        PATHITEM(PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey]), 2, INTEGER)),\n    \"Level3\", LOOKUPVALUE(Employee[EmployeeName], Employee[EmployeeKey],\n        PATHITEM(PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey]), 3, INTEGER)),\n    \"IsLeaf\", PATHITEMREVERSE(PATH(Employee[EmployeeKey], Employee[ParentEmployeeKey]), 1, INTEGER)\n        = Employee[EmployeeKey]\n)\n// Org-wide sales by hierarchy level (dynamic)\nSales by Hierarchy Level =\nVAR SelectedLevel = SELECTEDVALUE(HierarchyLevel[Level], 1)\nRETURN\nSUMMARIZECOLUMNS(\n    VALUES(Employee[Level1]),  // dynamic: swap based on SelectedLevel\n    \"Total Sales\", SUM(Sales[Amount])\n)"
                  }
        ],
        tips: [
                  "PATH(child, parent) returns a pipe-delimited string from root to leaf — store as a calculated column.",
                  "PATHITEM(path, N, INTEGER) extracts the Nth level key — use LOOKUPVALUE to get the name.",
                  "PATHCONTAINS(path, key) checks if a node is an ancestor — use for org-wide rollups.",
                  "PATHITEMREVERSE counts from the leaf backward — position 1 is always the current node.",
                  "PATH functions only work in calculated columns or queries — not inside measures with context transition."
        ],
        mistake: "Using PATH functions inside a measure — PATH requires row context on the table, which measures don't have. Always create PATH as a calculated column on the dimension table, then reference the column in measures.",
        shorthand: {
          verbose: "// PATH: flatten hierarchy\nPath = PATH(Emp[Key], Emp[ParentKey])\nDepth = PATHLENGTH(Emp[Path])\nLevel2 = LOOKUPVALUE(Emp[Name], Emp[Key], PATHITEM(Emp[Path], 2, INTEGER))\n// Rollup: sales for entire org under selected manager\nCALCULATE(SUM(Sales[Amt]), FILTER(Emp, PATHCONTAINS(Emp[Path], SELECTEDVALUE(Emp[Key]))))",
          concise: "// Quick PATH\nPath = PATH(t[k], t[pk]); Depth = PATHLENGTH(t[Path])",
        },
      },
    ],
  },

  // ── Section 12: DAX Query Syntax ─────────────────────────────────────────
  {
    id: "dax-query",
    title: "DAX Query Syntax",
    entries: [
      {
        id: "evaluate",
        fn: "EVALUATE / DEFINE / ORDER BY — DAX query syntax",
        desc: "DAX queries use EVALUATE to return a table, DEFINE to declare local measures or variables, and ORDER BY for sorting. Used in DAX Studio, SSMS, and Power BI's performance analyzer.",
        category: "Query",
        subtitle: "EVALUATE, DEFINE MEASURE, DEFINE VAR, ORDER BY, START AT, SUMMARIZECOLUMNS query, DAX Studio",
        signature: "EVALUATE <table_expression> [ORDER BY <column> [ASC|DESC]] [START AT <value>]",
        descLong: "DAX query syntax is the language used by client tools (Power BI, Excel, SSRS) to retrieve data from a tabular model. EVALUATE is the core statement — it returns a table. DEFINE allows declaring local measures, variables, or tables scoped to the query. ORDER BY sorts the result. START AT provides offset-based pagination. Unlike SQL, DAX queries always return a table (no scalar queries). Common patterns: SUMMARIZECOLUMNS for grouped queries, FILTER for filtered scans, TOPN for limited results. DAX Studio is the primary tool for writing and testing DAX queries — it shows the query plan, server timings, and storage engine queries. Understanding DAX query syntax is essential for performance tuning and debugging Power BI visual queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EVALUATE / DEFINE / ORDER BY — DAX query syntax — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Return all rows from Sales (top 10)\nEVALUATE\nTOPN(10, Sales)\n// Return specific columns\nEVALUATE\nSELECTCOLUMNS(\n    TOPN(10, Sales),\n    \"Order ID\", Sales[OrderID],\n    \"Amount\", Sales[Amount],\n    \"Date\", Sales[OrderDate]\n)\n// With sorting\nEVALUATE\nTOPN(10, Sales)\nORDER BY Sales[Amount] DESC\n// Filtered query\nEVALUATE\nFILTER(Sales, Sales[Amount] > 1000)\nORDER BY Sales[Amount] DESC"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EVALUATE / DEFINE / ORDER BY — DAX query syntax — common patterns you'll see in production.\n-- APPROACH  - Combine EVALUATE / DEFINE / ORDER BY — DAX query syntax with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nDEFINE\n    MEASURE Sales[Total Revenue] = SUM(Sales[Amount])\n    MEASURE Sales[Order Count] = COUNTROWS(Sales)\n    MEASURE Sales[Avg Order] = DIVIDE([Total Revenue], [Order Count])\nEVALUATE\nSUMMARIZECOLUMNS(\n    Product[Category],\n    \"Revenue\", [Total Revenue],\n    \"Orders\", [Order Count],\n    \"Avg Order\", [Avg Order]\n)\nORDER BY [Revenue] DESC\n// With filter in the query\nDEFINE\n    MEASURE Sales[Total Revenue] = SUM(Sales[Amount])\nEVALUATE\nSUMMARIZECOLUMNS(\n    Product[Category],\n    Date[Year],\n    FILTER(ALL(Product[Category]), Product[Category] = \"Electronics\" || Product[Category] = \"Clothing\"),\n    \"Revenue\", [Total Revenue]\n)\nORDER BY Date[Year] DESC, Product[Category] ASC"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EVALUATE / DEFINE / ORDER BY — DAX query syntax — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDEFINE\n    VAR PageNumber = 2\n    VAR PageSize = 20\n    VAR SortColumn = \"Revenue\"\n    MEASURE Sales[Revenue] = SUM(Sales[Amount])\n    MEASURE Sales[Prev Year Revenue] =\n        CALCULATE([Revenue], SAMEPERIODLASTYEAR(Date[Date]))\n    MEASURE Sales[YoY Growth %] =\n        DIVIDE([Revenue] - [Prev Year Revenue], [Prev Year Revenue])\nEVALUATE\nSUMMARIZECOLUMNS(\n    Product[Category],\n    Product[ProductName],\n    \"Revenue\", [Revenue],\n    \"Prev Year\", [Prev Year Revenue],\n    \"YoY %\", [YoY Growth %]\n)\nORDER BY [Revenue] DESC\nSTART AT PageNumber * PageSize  // offset for pagination\n// Query to debug a specific visual's DAX\n// (copy from Power BI Performance Analyzer > Copy DAX query)\nDEFINE\n    VAR __DS0Filter =\n        FILTER(\n            KEEPFILTERS(VALUES(Product[Category])),\n            Product[Category] = \"Electronics\"\n        )\nEVALUATE\nSUMMARIZECOLUMNS(\n    ROLLUPADDISSUBTOTAL(\n        'Date'[Year], \"IsYearSubtotal\",\n        'Date'[Month], \"IsMonthSubtotal\"\n    ),\n    __DS0Filter,\n    \"Sales\", SUM(Sales[Amount])\n)\nORDER BY [IsYearSubtotal], [IsMonthSubtotal], 'Date'[Year], 'Date'[Month]"
                  }
        ],
        tips: [
                  "EVALUATE is mandatory — every DAX query must have exactly one EVALUATE statement.",
                  "DEFINE MEASURE creates a local measure for the query — useful for testing without modifying the model.",
                  "ORDER BY must reference a column or measure in the EVALUATE output — can't sort by an expression.",
                  "START AT provides offset-based pagination — combine with TOPN for page-based pagination.",
                  "Copy DAX queries from Power BI Performance Analyzer to debug and optimize visual queries in DAX Studio."
        ],
        mistake: "Using EVALUATE with a scalar expression — DAX queries must return a table. Wrap scalar expressions in ROW(): EVALUATE ROW(\"Result\", SUM(Sales[Amount])).",
        shorthand: {
          verbose: "// DAX query with local measures and grouping\nDEFINE MEASURE Sales[Rev] = SUM(Sales[Amount])\nEVALUATE SUMMARIZECOLUMNS(Product[Category], \"Revenue\", [Rev]) ORDER BY [Rev] DESC",
          concise: "// Quick DAX query\nEVALUATE TOPN(10, Sales) ORDER BY Sales[Amount] DESC",
        },
      },
    ],
  },

  // ── Section 13: Performance Tuning & Optimization ─────────────────────────────────────────
  {
    id: "performance-tuning",
    title: "Performance Tuning & Optimization",
    entries: [
      {
        id: "dax-studio-performance",
        fn: "DAX Studio & Server Timings — diagnose and optimize DAX performance",
        desc: "DAX Studio is the essential tool for DAX performance tuning. Server Timings shows storage engine vs formula engine breakdown, query plan, and SE/FE CPU time.",
        category: "Performance",
        subtitle: "DAX Studio, Server Timings, storage engine, formula engine, SE queries, FE callbacks, query plan, materialization",
        signature: "Run query in DAX Studio → View Server Timings → Analyze SE vs FE time → Optimize bottleneck",
        descLong: "DAX performance tuning centers on understanding the two engines: the Storage Engine (SE) reads data from VertiPaq (compressed columnar store) — fast, multi-threaded, cached. The Formula Engine (FE) handles complex logic (iterators, complex filters, string manipulation) — single-threaded per query, not cached. The golden rule: push as much work as possible to the SE. Key metrics from Server Timings: Total Time, SE Time (storage engine), FE Time (formula engine), SE Queries (number of SE scans), SE CPU Time (parallelism indicator). If FE >> SE, the measure needs simplification. If SE Queries is high, the measure has too many EVALUATE/callbacks. Common optimizations: replace FILTER with boolean filters in CALCULATE, avoid nested iterators, use variables to prevent re-evaluation, materialize large tables as calculated tables, and reduce cardinality of filter columns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DAX Studio & Server Timings — diagnose and optimize DAX performance — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Step 1: Open DAX Studio, connect to Power BI / SSAS model\n// Step 2: Write a query and run with Server Timings enabled (F5)\nEVALUATE\nSUMMARIZECOLUMNS(\n    Product[Category],\n    \"Sales\", SUM(Sales[Amount])\n)\n// Step 3: Check Server Timings output:\n// SE Time:     15 ms   (storage engine — fast)\n// FE Time:     120 ms  (formula engine — slow!)\n// Total Time:  135 ms\n// SE Queries:  1\n// SE CPU Time: 45 ms   (3x total → good parallelism)\n// Diagnosis: FE >> SE → formula engine is the bottleneck\n// The measure is likely using an iterator or complex FILTER\n// Good pattern (SE-friendly): boolean filter in CALCULATE\nFast Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    Product[Category] = \"Electronics\"  // SE handles this\n)\n// Bad pattern (FE-heavy): FILTER with iterator\nSlow Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(ALL(Product[Category]), Product[Category] = \"Electronics\")\n)\n// FILTER forces FE evaluation — much slower for the same result"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DAX Studio & Server Timings — diagnose and optimize DAX performance — common patterns you'll see in production.\n-- APPROACH  - Combine DAX Studio & Server Timings — diagnose and optimize DAX performance with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// BEFORE: Slow measure (FE-heavy, multiple SE queries)\nSlow YoY Growth =\nVAR CurrentSales =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        FILTER(ALL(Date[Date]), Date[Year] = YEAR(TODAY()))\n    )\nVAR PrevSales =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        FILTER(ALL(Date[Date]), Date[Year] = YEAR(TODAY()) - 1)\n    )\nRETURN DIVIDE(CurrentSales - PrevSales, PrevSales)\n// Server Timings: SE=20ms, FE=350ms, SE Queries=4 → SLOW\n// AFTER: Optimized (SE-friendly, fewer queries)\nFast YoY Growth =\nVAR CurrentYear = YEAR(TODAY())  // evaluate once, not per row\nVAR CurrentSales =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        Date[Year] = CurrentYear  // boolean filter → SE\n    )\nVAR PrevSales =\n    CALCULATE(\n        SUM(Sales[Amount]),\n        Date[Year] = CurrentYear - 1  // boolean filter → SE\n    )\nRETURN DIVIDE(CurrentSales - PrevSales, PrevSales)\n// Server Timings: SE=18ms, FE=5ms, SE Queries=2 → 20x faster\n// Key changes:\n// 1. FILTER(ALL(Date[Date]), ...) → boolean filter Date[Year] = value (SE)\n// 2. YEAR(TODAY()) computed once in VAR (no re-evaluation)\n// 3. Fewer SE queries (2 vs 4) — each query has overhead"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DAX Studio & Server Timings — diagnose and optimize DAX performance — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Audit checklist (run each in DAX Studio with Server Timings):\n// 1. SE vs FE ratio: target SE > 80% of total time\n//    If FE > 50%, look for: FILTER iterators, IF/SWITCH in measures,\n//    string manipulation, complex CALCULATE conditions\n// 2. SE Queries count: target ≤ 2-3 per visual\n//    High count indicates: multiple CALCULATE in one measure,\n//    context transition overhead, or time intelligence functions\n// 3. SE CPU vs SE Time: CPU should be > 2x time (good parallelism)\n//    If CPU ≈ Time, the SE is single-threaded → check for\n//    non-foldable filter expressions\n// 4. Materialization: check if large table expressions are\n//    being materialized in FE memory\n// Example: measure with high SE queries\n// BEFORE: 8 SE queries (one per CALCULATE in the SWITCH)\nComplex Measure =\nSWITCH(\n    SELECTEDVALUE(ReportType[Type]),\n    \"YTD\", TOTALYTD(SUM(Sales[Amount]), Date[Date]),\n    \"MTD\", TOTALMTD(SUM(Sales[Amount]), Date[Date]),\n    \"QTD\", TOTALQTD(SUM(Sales[Amount]), Date[Date]),\n    \"Prev Year\", CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Date[Date])),\n    SUM(Sales[Amount])\n)\n// AFTER: 2 SE queries (pre-compute base measure)\nOptimized Measure =\nVAR BaseSales = SUM(Sales[Amount])  // SE: 1 query\nVAR ReportType = SELECTEDVALUE(ReportType[Type], \"Default\")\nVAR Result =\n    SWITCH(\n        ReportType,\n        \"YTD\", TOTALYTD(BaseSales, Date[Date]),\n        \"MTD\", TOTALMTD(BaseSales, Date[Date]),\n        \"QTD\", TOTALQTD(BaseSales, Date[Date]),\n        \"Prev Year\", CALCULATE(BaseSales, SAMEPERIODLASTYEAR(Date[Date])),\n        BaseSales\n    )\nRETURN Result\n// SE queries reduced from 8 to 2-3 (BaseSales computed once)\n// 5. DAX Studio Query Plan: check for CallbackDataID\n//    CallbackDataID = FE is reading data that SE couldn't provide\n//    → indicates non-foldable expression; simplify the filter\n// 6. VertiPaq Analyzer: check column cardinality and encoding\n//    High cardinality columns use Hash encoding (more memory)\n    Low cardinality columns use Value encoding (less memory)\n    Reduce cardinality: split datetime into Date + Time columns"
                  }
        ],
        tips: [
                  "Target SE > 80% of total time — if FE dominates, simplify the measure with boolean filters and variables.",
                  "Boolean filters (col = value) in CALCULATE are SE-friendly; FILTER(table, expr) forces FE evaluation.",
                  "Variables (VAR) prevent re-evaluation — compute expensive expressions once and reuse.",
                  "High SE Queries count means too many storage engine scans — consolidate CALCULATE calls.",
                  "Use DAX Studio's Query Plan to find CallbackDataID — indicates FE is reading data SE should handle."
        ],
        mistake: "Using FILTER(ALL(Table), Table[Column] = value) instead of a simple boolean filter Table[Column] = value in CALCULATE — the FILTER version forces formula engine evaluation and is 10-100x slower for the same result. Only use FILTER when you need complex multi-column conditions.",
        shorthand: {
          verbose: "// Performance optimization: boolean filter + variables\nVAR y = YEAR(TODAY())\nCALCULATE(SUM(Sales[Amount]), Date[Year] = y)  // SE-friendly\n// Avoid: FILTER(ALL(Date[Date]), Date[Year] = YEAR(TODAY()))  // FE-heavy",
          concise: "// Quick perf: boolean over FILTER\nCALCULATE(SUM(t[v]), t[c] = val)  // not FILTER(ALL(t), t[c]=val)",
        },
      },
    ],
  },

  // ── Section 14: Custom & Fiscal Calendars ─────────────────────────────────────────
  {
    id: "custom-calendars",
    title: "Custom & Fiscal Calendars",
    entries: [
      {
        id: "fiscal-calendar",
        fn: "Fiscal Calendars — 4-4-5, custom year start, fiscal YTD",
        desc: "Standard time intelligence functions assume a calendar year. Fiscal calendars (4-4-5, 445, custom start months) require custom date tables and manual YTD/QTD/MTD logic.",
        category: "Time Intelligence",
        subtitle: "4-4-5 calendar, fiscal year, custom YTD, fiscal quarter, SAMEPERIODLASTYEAR alternative, week-based year",
        signature: "CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Date), Date[FiscalYear] = MAX(Date[FiscalYear])))",
        descLong: "Built-in DAX time intelligence (TOTALYTD, SAMEPERIODLASTYEAR) assumes a Jan-Dec calendar year. Many businesses use fiscal calendars: 4-4-5 (retail), 4-4-4, 13-period, or custom start months (e.g. July 1). For these, you need a custom Date table with fiscal columns (FiscalYear, FiscalQuarter, FiscalMonth, FiscalDayOfYear) and manual time intelligence logic. The key pattern: replace TOTALYTD with CALCULATE + FILTER on the fiscal columns. For 4-4-5 calendars, weeks are the base unit — FiscalWeek, FiscalPeriod, and FiscalYear columns drive all calculations. The custom Date table must be marked as a date table in Power BI, and the relationship to the fact table must use the date column.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Fiscal Calendars — 4-4-5, custom year start, fiscal YTD — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// Date table columns: Date, FiscalYear, FiscalQuarter, FiscalMonth, FiscalDayOfYear\n// FiscalYear starts July 1: July 1 2023 → FiscalYear = 2024\nFiscal YTD Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Date),\n        Date[FiscalYear] = MAX(Date[FiscalYear]) &&\n        Date[FiscalDayOfYear] <= MAX(Date[FiscalDayOfYear])\n    )\n)\n// Equivalent to TOTALYTD but for fiscal year\n// FiscalDayOfYear: July 1 = 1, June 30 = 365/366\n// Fiscal quarter-to-date\nFiscal QTD Sales =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Date),\n        Date[FiscalYear] = MAX(Date[FiscalYear]) &&\n        Date[FiscalQuarter] = MAX(Date[FiscalQuarter]) &&\n        Date[Date] <= MAX(Date[Date])\n    )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Fiscal Calendars — 4-4-5, custom year start, fiscal YTD — common patterns you'll see in production.\n-- APPROACH  - Combine Fiscal Calendars — 4-4-5, custom year start, fiscal YTD with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// 4-4-5 Date table columns:\n//   Date, FiscalYear, FiscalPeriod (1-4), FiscalWeek (1-52),\n//   FiscalQuarter (1-4), WeekOfYear, DayOfWeek\n// 4-4-5 YTD\nFiscal YTD (4-4-5) =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Date),\n        Date[FiscalYear] = MAX(Date[FiscalYear]) &&\n        Date[FiscalWeek] <= MAX(Date[FiscalWeek])\n    )\n)\n// Same period last fiscal year (4-4-5)\nFiscal Prev Year Same Period =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Date),\n        Date[FiscalYear] = MAX(Date[FiscalYear]) - 1 &&\n        Date[FiscalWeek] <= MAX(Date[FiscalWeek])\n    )\n)\n// Fiscal YoY growth\nFiscal YoY % =\nDIVIDE(\n    [Fiscal YTD (4-4-5)] - [Fiscal Prev Year Same Period],\n    [Fiscal Prev Year Same Period]\n)\n// 4-4-5 rolling 13 weeks\nRolling 13 Weeks =\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(\n        ALL(Date),\n        Date[FiscalYear] * 100 + Date[FiscalWeek] <=\n            MAX(Date[FiscalYear]) * 100 + MAX(Date[FiscalWeek]) &&\n        Date[FiscalYear] * 100 + Date[FiscalWeek] >\n            MAX(Date[FiscalYear]) * 100 + MAX(Date[FiscalWeek]) - 13\n    )\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Fiscal Calendars — 4-4-5, custom year start, fiscal YTD — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Build fiscal date table (4-4-5 calendar)\nFiscalCalendar =\nVAR StartDate = DATE(2020, 1, 1)  // or fiscal year start\nVAR EndDate = DATE(2025, 12, 31)\nVAR BaseCalendar =\n    ADDCOLUMNS(\n        CALENDAR(StartDate, EndDate),\n        \"DayOfWeek\", WEEKDAY([Date], 2),  // Mon=1, Sun=7\n        \"WeekOfYear\", WEEKNUM([Date], 2),  // ISO week\n        \"CalendarYear\", YEAR([Date]),\n        \"CalendarMonth\", MONTH([Date]),\n        \"CalendarQuarter\", \"Q\" & CEILING(MONTH([Date]) / 3)\n    )\n// Add fiscal columns (4-4-5 starting first Monday of February)\nVAR FiscalCalendar =\n    ADDCOLUMNS(\n        BaseCalendar,\n        \"FiscalYear\",\n            VAR FYStart = DATE(YEAR([Date]) - IF(MONTH([Date]) < 2, 1, 0), 2, 1)\n            RETURN YEAR(FYStart) + 1,\n        \"FiscalWeek\",\n            VAR FYStart = DATE(YEAR([Date]) - IF(MONTH([Date]) < 2, 1, 0), 2, 1)\n            RETURN DATEDIFF(FYStart, [Date], DAY) / 7 + 1,\n        \"FiscalPeriod\",\n            VAR Week = DATEDIFF(\n                DATE(YEAR([Date]) - IF(MONTH([Date]) < 2, 1, 0), 2, 1),\n                [Date], DAY) / 7 + 1\n            RETURN SWITCH(TRUE(),\n                Week <= 4, 1, Week <= 8, 2, Week <= 13, 3, Week <= 17, 4,\n                Week <= 21, 5, Week <= 26, 6, Week <= 30, 7, Week <= 34, 8,\n                Week <= 39, 9, Week <= 43, 10, Week <= 47, 11, 12),\n        \"FiscalQuarter\", CEILING(\n            (DATEDIFF(DATE(YEAR([Date]) - IF(MONTH([Date]) < 2, 1, 0), 2, 1),\n                [Date], DAY) / 7 + 1) / 13.0, 1),\n        \"FiscalDayOfYear\", DATEDIFF(\n            DATE(YEAR([Date]) - IF(MONTH([Date]) < 2, 1, 0), 2, 1), [Date], DAY) + 1\n    )\nRETURN FiscalCalendar\n// Reusable fiscal time intelligence measure\nFiscal Time Intelligence =\nVAR Period = SELECTEDVALUE(PeriodType[Type], \"YTD\")\nVAR CurrentYear = MAX(Date[FiscalYear])\nVAR CurrentWeek = MAX(Date[FiscalWeek])\nVAR CurrentPeriod = MAX(Date[FiscalPeriod])\nRETURN\nSWITCH(\n    Period,\n    \"YTD\", CALCULATE(SUM(Sales[Amount]),\n        FILTER(ALL(Date), Date[FiscalYear] = CurrentYear && Date[FiscalWeek] <= CurrentWeek)),\n    \"QTD\", CALCULATE(SUM(Sales[Amount]),\n        FILTER(ALL(Date), Date[FiscalYear] = CurrentYear &&\n            Date[FiscalQuarter] = MAX(Date[FiscalQuarter]) && Date[FiscalWeek] <= CurrentWeek)),\n    \"MTD\", CALCULATE(SUM(Sales[Amount]),\n        FILTER(ALL(Date), Date[FiscalYear] = CurrentYear &&\n            Date[FiscalPeriod] = CurrentPeriod && Date[FiscalWeek] <= CurrentWeek)),\n    \"Prev Year\", CALCULATE(SUM(Sales[Amount]),\n        FILTER(ALL(Date), Date[FiscalYear] = CurrentYear - 1 && Date[FiscalWeek] <= CurrentWeek)),\n    SUM(Sales[Amount])\n)"
                  }
        ],
        tips: [
                  "Built-in TOTALYTD/MOTALQTD assume calendar year — use CALCULATE + FILTER for fiscal calendars.",
                  "4-4-5 calendars have 364 days (52 weeks × 7) — day 365/366 falls outside the fiscal year and needs special handling.",
                  "Mark the custom Date table as a date table in Power BI: Table Tools > Mark as Date Table > select Date column.",
                  "Use FiscalWeek as the base unit for 4-4-5 comparisons — it's consistent across years unlike calendar months.",
                  "Create a FiscalDayOfYear column (1-364) for YTD calculations — analogous to DAYOFYEAR but starting from fiscal year start."
        ],
        mistake: "Using SAMEPERIODLASTYEAR with a fiscal calendar — it shifts by 365 days, not by fiscal year. For 4-4-5 calendars, this misaligns weeks. Use FILTER(ALL(Date), Date[FiscalYear] = CurrentYear - 1 && Date[FiscalWeek] <= CurrentWeek) instead.",
        shorthand: {
          verbose: "// Fiscal YTD (custom start month)\nFiscalYTD = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Date), Date[FiscalYear]=MAX(Date[FiscalYear]) && Date[FiscalDayOfYear]<=MAX(Date[FiscalDayOfYear])))\n// 4-4-5 same period last year\nFiscalPrevYr = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Date), Date[FiscalYear]=MAX(Date[FiscalYear])-1 && Date[FiscalWeek]<=MAX(Date[FiscalWeek])))",
          concise: "// Quick fiscal YTD\nCALCULATE(SUM(t[v]), FILTER(ALL(d), d[FY]=MAX(d[FY]) && d[FDoy]<=MAX(d[FDoy])))",
        },
      },
    ],
  },

  // ── Section 15: Calculation Groups & Field Parameters ─────────────────────────────────────────
  {
    id: "calculation-groups",
    title: "Calculation Groups & Field Parameters",
    entries: [
      {
        id: "calculation-groups",
        fn: "Calculation Groups — apply transformations to all measures",
        desc: "Calculation Groups (created in Tabular Editor) apply a calculation item (YTD, YoY%, etc.) to any measure in the model. Eliminates the need to create N×M variants of every measure.",
        category: "Advanced",
        subtitle: "Calculation Group, Calculation Item, SELECTEDMEASURE, Tabular Editor, time intelligence on demand, measure transformation",
        signature: "Calculation Item = CALCULATE(SELECTEDMEASURE(), <time_intelligence_filter>)",
        descLong: "Calculation Groups are a powerful feature created in Tabular Editor (not in Power BI Desktop directly). A Calculation Group is a table with Calculation Items — each item is a DAX expression that transforms the current measure via SELECTEDMEASURE(). When a user selects a calculation item in a slicer, every measure in the visual is automatically transformed. This eliminates the 'measure explosion' problem: instead of creating Sales YTD, Sales Prev Year, Sales YoY% for every measure (N measures × M calculations = N×M measures), you create one calculation group with M items that applies to all N measures. Common use cases: time intelligence on demand (YTD/QTD/MTD/Prev Year/YoY%), currency conversion, and dynamic measure formatting. Calculation Groups are created in Tabular Editor and deployed to the model.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Calculation Groups — apply transformations to all measures — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// In Tabular Editor:\n// 1. Right-click Tables → New Calculation Group\n// 2. Name: \"Time Intelligence\"\n// 3. Add Calculation Items:\n// Item: YTD\nCALCULATE(\n    SELECTEDMEASURE(),\n    DATESYTD(Date[Date])\n)\n// Item: QTD\nCALCULATE(\n    SELECTEDMEASURE(),\n    DATESQTD(Date[Date])\n)\n// Item: MTD\nCALCULATE(\n    SELECTEDMEASURE(),\n    DATESMTD(Date[Date])\n)\n// Item: Previous Year\nCALCULATE(\n    SELECTEDMEASURE(),\n    SAMEPERIODLASTYEAR(Date[Date])\n)\n// Item: YoY %\nDIVIDE(\n    SELECTEDMEASURE() - CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date])),\n    CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date]))\n)\n// Usage in Power BI:\n// Add Time Intelligence column as a slicer\n// Select \"YTD\" → all measures in the visual show YTD values\n// No need to create [Sales YTD], [Profit YTD], [Orders YTD] separately"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Calculation Groups — apply transformations to all measures — common patterns you'll see in production.\n-- APPROACH  - Combine Calculation Groups — apply transformations to all measures with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n// In Tabular Editor, set Format String Expression for each item:\n// YTD format: show with thousand separator\n\"#,##0\"\n// YoY % format: show as percentage\n\"0.0%\"\n// Previous Year: show with currency\n\"$#,##0\"\n// Calculation item with BLANK handling\n// Item: YoY % (safe)\nVAR Current = SELECTEDMEASURE()\nVAR PrevYear = CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date]))\nRETURN\nIF(\n    ISBLANK(PrevYear) || PrevYear = 0,\n    BLANK(),  // don't show infinity or error\n    DIVIDE(Current - PrevYear, PrevYear)\n)\n// Dynamic calculation item: only apply to measures containing \"Sales\"\n// (use Ordinal = 0 for default/no transformation)\nIF(\n    CONTAINSSTRING(SELECTEDMEASURENAME(), \"Sales\"),\n    CALCULATE(SELECTEDMEASURE(), DATESYTD(Date[Date])),\n    SELECTEDMEASURE()  // pass through for non-Sales measures\n)\n// Calculation group precedence (when multiple groups exist)\n// Set Calculation Group Precedence in Tabular Editor:\n// Time Intelligence = 1 (applied first)\n// Currency Conversion = 2 (applied second)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Calculation Groups — apply transformations to all measures — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Model: Sales (in USD) → CurrencyBridge → CurrencyRate (USD to target)\n// Currency slicer on Currency[CurrencyCode]\n// Calculation Group: \"Currency Conversion\"\n// Calculation Item: \"Convert\"\nVAR SelectedCurrency = SELECTEDVALUE(Currency[CurrencyCode], \"USD\")\nVAR MeasureValue = SELECTEDMEASURE()\nRETURN\nIF(\n    SelectedCurrency = \"USD\",\n    MeasureValue,  // no conversion needed\n    CALCULATE(\n        MeasureValue * MAX(CurrencyRate[Rate]),\n        FILTER(\n            CurrencyRate,\n            CurrencyRate[CurrencyCode] = SelectedCurrency &&\n            CurrencyRate[Date] = MAX(Date[Date])\n        )\n    )\n)\n// Format string expression for currency\nVAR SelectedCurrency = SELECTEDVALUE(Currency[CurrencyCode], \"USD\")\nRETURN\nSWITCH(\n    SelectedCurrency,\n    \"USD\", \"$#,##0\",\n    \"EUR\", \"€#,##0\",\n    \"GBP\", \"£#,##0\",\n    \"JPY\", \"¥#,##0\",\n    \"#,##0\"\n)\n// Field Parameters (Power BI Desktop native feature)\n// Create a field parameter to let users switch between dimensions:\n// Modeling → New Parameter → Fields\n// Select: Product[Category], Product[ProductName], Customer[Region], Date[Year]\n// Name: \"Grouping Dimension\"\n// Power BI generates a table with DAX:\nGrouping Dimension =\n{\n    (\"Category\", NAMEOF('Product'[Category]), 0),\n    (\"Product\", NAMEOF('Product'[ProductName]), 1),\n    (\"Region\", NAMEOF('Customer'[Region]), 2),\n    (\"Year\", NAMEOF('Date'[Year]), 3)\n}\n// Use in a visual: add Grouping Dimension to axis + slicer\n// User selects \"Region\" → visual groups by Customer[Region]\n// User selects \"Year\" → visual groups by Date[Year]\n// No need for SWITCH logic in measures — field parameter handles it"
                  }
        ],
        tips: [
                  "Calculation Groups are created in Tabular Editor (free or commercial) — not editable in Power BI Desktop directly.",
                  "SELECTEDMEASURE() returns the measure currently being evaluated — the calculation item transforms it.",
                  "Set Calculation Group Precedence when using multiple groups — lower precedence number is applied first.",
                  "Field Parameters (native Power BI feature) let users switch dimensions without calculation groups.",
                  "Use Format String Expression to dynamically format each calculation item (e.g. percentage for YoY%)."
        ],
        mistake: "Creating separate YTD/QTD/PrevYear measures for every base measure (Sales YTD, Profit YTD, Orders YTD, Sales QTD, Profit QTD...) — this is 'measure explosion'. Use a Calculation Group instead: one group with N items applies to all M measures, replacing N×M measures with N+M objects.",
        shorthand: {
          verbose: "// Calculation Group items (Tabular Editor)\nYTD = CALCULATE(SELECTEDMEASURE(), DATESYTD(Date[Date]))\nPrevYear = CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date]))\nYoY% = DIVIDE(SELECTEDMEASURE() - CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date])), CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Date[Date])))",
          concise: "// Quick calc group\nYTD = CALCULATE(SELECTEDMEASURE(), DATESYTD(Date[Date]))",
        },
      },
    ],
  },
]

export default { meta, sections }

export const meta = {
  "title": "Excel & VBA Complete Reference",
  "domain": "excel",
  "sheet": "core",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Lookup & Dynamic Arrays ─────────────────────────────────────────
  {
    id: "lookup-dynamic",
    title: "Lookup & Dynamic Arrays",
    entries: [
      {
        id: "xlookup",
        fn: "XLOOKUP",
        desc: "Modern replacement for VLOOKUP — searches any direction.",
        category: "Lookup",
        subtitle: "Search a range and return a matching result",
        signature: "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])",
        descLong: "XLOOKUP is the definitive modern lookup function (Excel 2021 / M365). It replaces VLOOKUP, HLOOKUP, and INDEX/MATCH for most use cases. It searches left OR right, returns multiple columns, handles missing values natively, and supports wildcard and approximate matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of XLOOKUP — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A          | B      | C          | D                              |\n|------------|--------|------------|--------------------------------|\n| EmpID      | Name   | Dept       | Formula                        |\n| E001       | Alice  | Finance    |                                |\n| E002       | Bob    | IT         |                                |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of XLOOKUP — common patterns you'll see in production.\n// APPROACH  - Combine XLOOKUP with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| E003       | Carol  | Finance    |                                |\n|            |        |            |                                |\n| Find Name: | E002   |            | =XLOOKUP(B6,A2:A4,B2:B4,\"Not Found\") |\n| Result:    | Bob    |            |                                |\n|            |        |            |                                |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of XLOOKUP — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Find Dept  | E003   |            | =XLOOKUP(B9,A2:A4,C2:C4,\"?\")  |\n| Result:    | Finance|            |                                |\n|            |        |            |                                |\n| Wildcard:  | Al*    |            | =XLOOKUP(B12,B2:B4,A2:A4,,2)  |\n| Result:    | E001   |            | match_mode=2 enables wildcards |"
                  }
        ],
        tips: [
                  "**if_not_found** replaces the need for IFERROR wrapping — use `\"Not Found\"` or `0`",
                  "**match_mode**: 0=exact (default), -1=next smaller, 1=next larger, 2=wildcard",
                  "**search_mode**: 1=first-to-last, -1=last-to-first, 2=binary asc, -2=binary desc",
                  "Return an entire row/column by making return_array multi-column — spills automatically",
                  "Can replace INDEX/MATCH: `=XLOOKUP(val, col, row)` for 2-way lookup"
        ],
        mistake: "Using VLOOKUP when the lookup column is to the RIGHT of the return column. XLOOKUP handles this natively — no column number gymnastics needed.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse VLOOKUP with hardcoded column index number; if columns are inserted, formulas break. Wrap in IFERROR for missing values.\n// More explicit but longer",
          concise: "=XLOOKUP(lookup_value, lookup_array, return_array, \"Not Found\")",
        },
      },
      {
        id: "index-match",
        fn: "INDEX / MATCH",
        desc: "Two-function combo for flexible 2-way lookups.",
        category: "Lookup",
        subtitle: "Find a value at the intersection of a matched row and column",
        signature: "=INDEX(return_range, MATCH(row_val, row_range, 0), MATCH(col_val, col_range, 0))",
        descLong: "INDEX returns a value at a given row/column position. MATCH returns the position of a value in a range. Together they form the most powerful lookup pattern in Excel — searching any direction, returning any column, and enabling 2-way (row + column) lookups. Still preferred over XLOOKUP in complex array formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of INDEX / MATCH — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A        | B     | C     | D     | E                                    |\n|----------|-------|-------|-------|--------------------------------------|\n|          | Q1    | Q2    | Q3    |                                      |\n| Alice    | 1200  | 1450  | 1800  |                                      |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of INDEX / MATCH — common patterns you'll see in production.\n// APPROACH  - Combine INDEX / MATCH with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Bob      | 980   | 1100  | 1300  |                                      |\n| Carol    | 1500  | 1600  | 1750  |                                      |\n|          |       |       |       |                                      |\n| Person:  | Bob   |       |       |                                      |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of INDEX / MATCH — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Quarter: | Q2    |       |       |                                      |\n| Result:  | 1100  |       |       | =INDEX(B2:D4,MATCH(B8,A2:A4,0),      |\n|          |       |       |       |         MATCH(B9,B1:D1,0))           |"
                  }
        ],
        tips: [
                  "MATCH 3rd argument: **0**=exact, **1**=less than (sorted asc), **-1**=greater than (sorted desc)",
                  "Wrap in IFERROR for missing values: `=IFERROR(INDEX(...)`, \"Not found\")`",
                  "INDEX with entire column: `=INDEX(A:A, MATCH(val, B:B, 0))` finds leftward values",
                  "Use INDEX to return a range reference for use inside other functions like SUM"
        ],
        mistake: "Using MATCH with 0 (exact) on an unsorted list but with 1 or -1 — those require sorted data and give wrong answers on unsorted ranges.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse VLOOKUP (only looks right, requires lookup column leftmost); column index is hardcoded and fragile.\n// More explicit but longer",
          concise: "=INDEX(return_range, MATCH(row_val, row_range, 0), MATCH(col_val, col_range, 0))",
        },
      },
      {
        id: "vlookup",
        fn: "VLOOKUP",
        desc: "Classic vertical lookup — still widely used in legacy workbooks.",
        category: "Lookup",
        subtitle: "Look up a value in the leftmost column and return from same row",
        signature: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
        descLong: "VLOOKUP searches the leftmost column of a table and returns a value from a specified column in the same row. range_lookup=FALSE (or 0) for exact match. The lookup column MUST be the leftmost — use XLOOKUP or INDEX/MATCH when it is not.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of VLOOKUP — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      | D                              |\n|--------|---------|--------|--------------------------------|\n| ID     | Product | Price  |                                |\n| P001   | Widget  | 9.99   |                                |\n| P002   | Gadget  | 24.99  |                                |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of VLOOKUP — common patterns you'll see in production.\n// APPROACH  - Combine VLOOKUP with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| P003   | Doohick | 4.99   |                                |\n|        |         |        |                                |\n| Lookup:| P002    |        | =VLOOKUP(B6,A2:C4,2,FALSE)     |\n| Name:  | Gadget  |        | col 2 = Product                |\n|        |         |        |                                |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of VLOOKUP — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Price: |         |        | =VLOOKUP(B6,A2:C4,3,FALSE)     |\n| Result:| 24.99   |        | col 3 = Price                  |\n|        |         |        |                                |\n| Safe:  |         |        | =IFERROR(VLOOKUP(B6,A2:C4,2,0),|\n|        |         |        |  \"Not Found\")                  |"
                  }
        ],
        tips: [
                  "**Always use FALSE** (or 0) as 4th argument unless you specifically need approximate match on sorted data",
                  "Col_index is a fixed number — if columns are inserted, formulas break. Use MATCH to make it dynamic",
                  "VLOOKUP only looks RIGHT — lookup column must be leftmost. Use XLOOKUP/INDEX-MATCH otherwise",
                  "Lock the table array: `$A$2:$C$100` so it doesn't shift when copied"
        ],
        mistake: "Omitting the 4th argument (range_lookup). It defaults to TRUE (approximate), which returns wrong results on unsorted data. Always explicitly use FALSE for exact match.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse VLOOKUP with column index hardcoded; if columns are inserted, formulas break. Lookup column must be leftmost.\n// More explicit but longer",
          concise: "=VLOOKUP(lookup_value, table_array, 2, FALSE)",
        },
      },
      {
        id: "sumifs",
        fn: "SUMIFS",
        desc: "Sum values matching multiple criteria.",
        category: "Aggregate",
        subtitle: "Conditional sum with one or more criteria ranges",
        signature: "=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)",
        descLong: "SUMIFS sums values in sum_range where all criteria are met. It handles multiple conditions simultaneously. All ranges must be the same size. Criteria can be numbers, text, wildcards, or comparison operators as strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SUMIFS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      | D      | E                                   |\n|--------|---------|--------|--------|-------------------------------------|\n| Region | Product | Rep    | Sales  |                                     |\n| East   | Widget  | Alice  | 1200   |                                     |\n| West   | Gadget  | Bob    | 980    |                                     |\n| East   | Gadget  | Alice  | 1450   |                                     |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SUMIFS — common patterns you'll see in production.\n// APPROACH  - Combine SUMIFS with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| West   | Widget  | Carol  | 1100   |                                     |\n| East   | Widget  | Bob    | 800    |                                     |\n|        |         |        |        |                                     |\n| East total:         |        | =SUMIFS(D2:D6,A2:A6,\"East\")         |\n| Result:             | 3450   |                                     |\n|        |         |        |        |                                     |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SUMIFS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| East + Widget:      |        | =SUMIFS(D2:D6,A2:A6,\"East\",         |\n|                     |        |          B2:B6,\"Widget\")            |\n| Result:             | 2000   |                                     |\n|        |         |        |        |                                     |\n| Over 1000:          |        | =SUMIFS(D2:D6,D2:D6,\">1000\")        |"
                  }
        ],
        tips: [
                  "Criteria with operators must be in quotes: `\">1000\"`, `\"<>\"&A1`",
                  "Wildcards work: `\"East*\"` matches East, Eastern; `\"*widget*\"` case-insensitive",
                  "Combine with cell reference: `\">\"&B1` — more flexible than hardcoded values",
                  "COUNTIFS and AVERAGEIFS follow the same pattern — swap the function name"
        ],
        mistake: "Putting the sum_range LAST like SUMIF (single-condition). SUMIFS puts sum_range FIRST. Easy to mix up when switching between them.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested SUMIFs or separate SUMIF formulas for each condition, then add results together.\n// More explicit but longer",
          concise: "=SUMIFS(D2:D6, A2:A6, \"East\", B2:B6, \"Widget\")",
        },
      },
      {
        id: "countifs",
        fn: "COUNTIFS / AVERAGEIFS",
        desc: "Count or average rows matching multiple criteria.",
        category: "Aggregate",
        subtitle: "Conditional count and average across multiple conditions",
        signature: "=COUNTIFS(range1, criteria1, [range2, criteria2]...)\n=AVERAGEIFS(avg_range, range1, criteria1, ...)",
        descLong: "COUNTIFS counts rows where all criteria match. AVERAGEIFS averages values where all criteria match. Both follow the same multi-criteria pattern as SUMIFS. Useful for dashboards, KPI tracking, and data validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of COUNTIFS / AVERAGEIFS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      | D                                     |\n|--------|---------|--------|---------------------------------------|\n| Dept   | Status  | Score  |                                       |\n| IT     | Active  | 88     |                                       |\n| HR     | Active  | 72     |                                       |\n| IT     | Leave   | 91     |                                       |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of COUNTIFS / AVERAGEIFS — common patterns you'll see in production.\n// APPROACH  - Combine COUNTIFS / AVERAGEIFS with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| IT     | Active  | 85     |                                       |\n| HR     | Active  | 68     |                                       |\n|        |         |        |                                       |\n| IT Active count:    |        | =COUNTIFS(A2:A6,\"IT\",B2:B6,\"Active\") |\n| Result:             | 2      |                                       |\n|        |         |        |                                       |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of COUNTIFS / AVERAGEIFS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| IT avg score:       |        | =AVERAGEIFS(C2:C6,A2:A6,\"IT\")        |\n| Result:             | 88     |                                       |\n|        |         |        |                                       |\n| Score >= 80:        |        | =COUNTIFS(C2:C6,\">=80\")              |\n| Result:             | 3      |                                       |"
                  }
        ],
        tips: [
                  "COUNTIFS with one range/criteria is equivalent to COUNTIF but more future-proof",
                  "Date criteria: `\">\"&DATE(2024,1,1)` counts dates after Jan 1 2024",
                  "Count unique values: `=SUMPRODUCT(1/COUNTIF(A2:A6,A2:A6))` — classic trick",
                  "Use `\"<>\"` as criteria to count non-blank cells"
        ],
        mistake: "Using AVERAGE + IF as an array formula when AVERAGEIFS is available. AVERAGEIFS is cleaner and doesn't need Ctrl+Shift+Enter.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested IF with COUNTIF or loop through each condition separately with multiple COUNTIF calls.\n// More explicit but longer",
          concise: "=COUNTIFS(A2:A6, \"IT\", B2:B6, \"Active\")",
        },
      },
      {
        id: "filter",
        fn: "FILTER",
        desc: "Return rows from a range that meet a condition — spills automatically.",
        category: "Dynamic Array",
        subtitle: "Extract matching rows without helper columns or VBA",
        signature: "=FILTER(array, include, [if_empty])",
        descLong: "FILTER returns all rows where the include condition is TRUE. It spills results into as many rows as needed. Combine with SORT, UNIQUE, or other dynamic array functions to build powerful reports without PivotTables or VBA.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of FILTER — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      | D                                  |\n|--------|---------|--------|------------------------------------||\n| Name   | Dept    | Salary |                                    |\n| Alice  | IT      | 85000  |                                    |\n| Bob    | HR      | 62000  |                                    |\n| Carol  | IT      | 92000  |                                    |\n| Dave   | Finance | 78000  |                                    |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of FILTER — common patterns you'll see in production.\n// APPROACH  - Combine FILTER with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Eve    | IT      | 71000  |                                    |\n|        |         |        |                                    |\n| IT employees (spills):              |                                    |\n| =FILTER(A2:C6, B2:B6=\"IT\", \"None\") |                                    |\n| Alice  | IT      | 85000  | ← spills 3 rows automatically      |\n| Carol  | IT      | 92000  |                                    |\n| Eve    | IT      | 71000  |                                    |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of FILTER — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|        |         |        |                                    |\n| Multiple conditions:                |                                    |\n| =FILTER(A2:C6,(B2:B6=\"IT\")*(C2:C6>80000),\"None\") |\n| Alice  | IT      | 85000  |                                    |\n| Carol  | IT      | 92000  |                                    |"
                  }
        ],
        tips: [
                  "Use `*` for AND conditions: `(B2:B6=\"IT\")*(C2:C6>80000)`",
                  "Use `+` for OR conditions: `(B2:B6=\"IT\")+(B2:B6=\"HR\")`",
                  "Wrap with SORT: `=SORT(FILTER(...), 3, -1)` to sort results by column 3 descending",
                  "Reference spill with `#`: `=COUNTA(A10#)` counts rows in spill range starting at A10"
        ],
        mistake: "Hard-coding the filter value instead of referencing a cell. Use =FILTER(A2:C6, B2:B6=E1) where E1 contains the dept — then the filter updates as E1 changes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested IF array formulas, SMALL/IF combinations, or helper columns to filter rows manually.\n// More explicit but longer",
          concise: "=FILTER(A2:D100, (B2:B100=\"Active\")*(C2:C100>500))",
        },
      },
      {
        id: "unique",
        fn: "UNIQUE",
        desc: "Return a list of unique values from a range.",
        category: "Dynamic Array",
        subtitle: "Extract distinct values — spills automatically",
        signature: "=UNIQUE(array, [by_col], [exactly_once])",
        descLong: "UNIQUE returns distinct values from a range. By default returns values that appear at least once (deduplication). Set exactly_once=TRUE to return only values that appear exactly once. Works on rows or columns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of UNIQUE — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A       | B                         | C                              |\n|---------|---------------------------|--------------------------------|\n| Dept    | Unique Depts              | Exactly Once                   |\n| IT      | =UNIQUE(A2:A8)            | =UNIQUE(A2:A8,,TRUE)           |\n| HR      | IT   ← spills             | Finance ← appears only once    |\n| IT      | HR                        |                                |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of UNIQUE — common patterns you'll see in production.\n// APPROACH  - Combine UNIQUE with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Finance | Finance                   |                                |\n| HR      |                           |                                |\n| IT      |                           |                                |\n| HR      |                           |                                |\n|         |                           |                                |\n| Unique combo (2 cols):              |                                |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of UNIQUE — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| =UNIQUE(A2:B8)    ← unique pairs   |                                |\n|         |                           |                                |\n| Dynamic dropdown source:            |                                |\n| Use =UNIQUE(A2:A100) as named range |                                |\n| in Data Validation list source      |                                |"
                  }
        ],
        tips: [
                  "Combine with SORT: `=SORT(UNIQUE(A2:A100))` for a sorted unique list",
                  "Use as dropdown source: name the spill range and reference it in Data Validation",
                  "UNIQUE on multiple columns returns unique row combinations",
                  "**by_col=TRUE** finds unique columns instead of unique rows"
        ],
        mistake: "Not sorting the result. UNIQUE preserves original order — wrap with SORT for alphabetical unique lists used in dropdowns.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse COUNTIF with ROW helper column to identify first occurrence, then filter duplicates with IF array formula.\n// More explicit but longer",
          concise: "=UNIQUE(A2:A100)",
        },
      },
      {
        id: "sort-sortby",
        fn: "SORT / SORTBY",
        desc: "Sort a range dynamically — results spill.",
        category: "Dynamic Array",
        subtitle: "Sort by one or more columns without disturbing source data",
        signature: "=SORT(array, [sort_index], [sort_order], [by_col])\n=SORTBY(array, by_array1, [order1], ...)",
        descLong: "SORT sorts an array by a specified column. SORTBY sorts by a separate array not in the source — useful for sorting by a column you don't want to return. Both spill results and update automatically when source data changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SORT / SORTBY — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B      | C      | D                                  |\n|--------|--------|--------|------------------------------------||\n| Name   | Dept   | Salary |                                    |\n| Bob    | HR     | 62000  |                                    |\n| Alice  | IT     | 85000  |                                    |\n| Carol  | IT     | 92000  |                                    |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SORT / SORTBY — common patterns you'll see in production.\n// APPROACH  - Combine SORT / SORTBY with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Dave   | Finance| 78000  |                                    |\n|        |        |        |                                    |\n| Sort by salary desc:                |                                    |\n| =SORT(A2:C5, 3, -1)                 |                                    |\n| Carol  | IT     | 92000  | ← spills sorted                    |\n| Alice  | IT     | 85000  |                                    |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SORT / SORTBY — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Dave   | Finance| 78000  |                                    |\n| Bob    | HR     | 62000  |                                    |\n|        |        |        |                                    |\n| SORTBY — sort names by salary:      |                                    |\n| =SORTBY(A2:A5, C2:C5, -1)          |                                    |\n| Carol  |        |        | ← names only, sorted by salary     |"
                  }
        ],
        tips: [
                  "sort_order: **1** = ascending (default), **-1** = descending",
                  "SORTBY supports multiple sort keys: `=SORTBY(arr, col1, 1, col2, -1)`",
                  "Chain with FILTER: `=SORT(FILTER(A2:C10, B2:B10=\"IT\"), 3, -1)`",
                  "by_col=TRUE sorts columns instead of rows — useful for transposing sorted tables"
        ],
        mistake: "Sorting the source data directly with SORT output. The spill IS the sorted view — leave source data untouched and reference the spill range.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual sorting in UI, or use helper columns with rank/index and then sort by those columns.\n// More explicit but longer",
          concise: "=SORT(A2:D100, 2, -1)",
        },
      },
      {
        id: "sequence",
        fn: "SEQUENCE",
        desc: "Generate a sequence of numbers in rows and columns.",
        category: "Dynamic Array",
        subtitle: "Create numeric sequences and grids automatically",
        signature: "=SEQUENCE(rows, [cols], [start], [step])",
        descLong: "SEQUENCE generates an array of sequential numbers. It can fill a single column, a single row, or a 2D grid. Commonly used to create row numbers, date series, and as the backbone of other dynamic array formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SEQUENCE — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Formula                      | Result (spills)                  |\n|------------------------------|----------------------------------|\n| =SEQUENCE(5)                 | 1,2,3,4,5 (column)               |\n| =SEQUENCE(1,5)               | 1,2,3,4,5 (row)                  |\n| =SEQUENCE(3,3)               | 1 2 3 / 4 5 6 / 7 8 9 (grid)    |\n| =SEQUENCE(5,1,0,10)          | 0,10,20,30,40                    |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SEQUENCE — common patterns you'll see in production.\n// APPROACH  - Combine SEQUENCE with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| =SEQUENCE(5,1,100,-5)        | 100,95,90,85,80                  |\n|                              |                                  |\n| Row numbers for a table:     |                                  |\n| =SEQUENCE(COUNTA(A2:A100))   | 1,2,3... auto-adjusts            |\n|                              |                                  |\n| Date series (30 days):       |                                  |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SEQUENCE — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| =DATE(2024,1,1)+SEQUENCE(30)-1 | Jan 1 through Jan 30           |\n|                              |                                  |\n| Month calendar grid:         |                                  |\n| =DATE(2024,1,1)+SEQUENCE(6,7,0) | 6-row 7-col calendar grid    |"
                  }
        ],
        tips: [
                  "Combine with TEXT: `=TEXT(DATE(2024,1,1)+SEQUENCE(12,1,0,30), \"MMM\")` for month names",
                  "Use SEQUENCE inside CHOOSECOLS/CHOOSEROWS for dynamic column selection",
                  "SEQUENCE(ROWS(A:A)) creates a column of row numbers matching any table",
                  "Negative step creates countdown sequences"
        ],
        mistake: "Hardcoding the row count. Use =SEQUENCE(COUNTA(A2:A1000)) so the sequence auto-expands as data grows.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse ROW()-offset formulas like =ROW()-1 repeated down, or hardcode each number manually.\n// More explicit but longer",
          concise: "=SEQUENCE(10, 3, 1, 1)",
        },
      },
      {
        id: "let-lambda",
        fn: "LET / LAMBDA",
        desc: "Define named variables in a formula or create reusable custom functions.",
        category: "Dynamic Array",
        subtitle: "Name intermediate values and build custom functions",
        signature: "=LET(name1, val1, [name2, val2], ...result)\n=LAMBDA([param1,...], formula)",
        descLong: "LET assigns names to intermediate calculations within a formula — making complex formulas readable and avoiding repeated computation. LAMBDA creates reusable custom functions without VBA that can be named and called like built-ins.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LET / LAMBDA — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| LET — readable complex formula:                           |\n|-----------------------------------------------------------|\n| Without LET:                                              |\n| =SUMPRODUCT((B2:B10=\"IT\")*(C2:C10-AVERAGE(C2:C10))^2)    |\n|                                                           |\n| With LET:                                                 |\n| =LET(                                                     |\n|   dept,    B2:B10,                                        |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LET / LAMBDA — common patterns you'll see in production.\n// APPROACH  - Combine LET / LAMBDA with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n|   salary,  C2:C10,                                        |\n|   avg,     AVERAGE(salary),                               |\n|   SUMPRODUCT((dept=\"IT\")*(salary-avg)^2)                  |\n| )                                                         |\n|                                                           |\n| LAMBDA — custom TaxCalc function (defined in Name Manager)|\n| Name: TaxCalc                                             |\n| Refers to: =LAMBDA(income, rate,                          |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LET / LAMBDA — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|              IF(income>50000, income*rate, income*rate*0.8)|\n|            )                                              |\n|                                                           |\n| Usage in cell:                                            |\n| =TaxCalc(85000, 0.22)   → 18700                           |\n| =TaxCalc(40000, 0.12)   → 3840 (80% rate under $50k)     |"
                  }
        ],
        tips: [
                  "LET names are local to the formula — they don't conflict with cell names or ranges",
                  "Define LAMBDA in Name Manager (Ctrl+F3) to make it available like a built-in function",
                  "Recursive LAMBDA: use MAP, REDUCE, SCAN for iterative operations",
                  "LET dramatically speeds up formulas that reuse the same expensive calculation multiple times"
        ],
        mistake: "Defining LAMBDA directly in a cell without naming it. It works but can't be reused. Always name LAMBDAs in Name Manager for reusability.",
        shorthand: {
          verbose: "// Manual / verbose approach\nRepeat the same long formula multiple times inline, or use multiple cells as intermediate calculations.\n// More explicit but longer",
          concise: "=LET(x, A2*1.2, y, x+100, y)",
        },
      },
    ],
  },

  // ── Section 2: Text & Date Functions ─────────────────────────────────────────
  {
    id: "text-date",
    title: "Text & Date Functions",
    entries: [
      {
        id: "textjoin-concat",
        fn: "TEXTJOIN / CONCAT",
        desc: "Join text with a delimiter — handles arrays and ignores blanks.",
        category: "Text",
        subtitle: "Combine multiple text values with a separator",
        signature: "=TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)\n=CONCAT(text1, [text2], ...)",
        descLong: "TEXTJOIN joins text values with a specified delimiter and can skip empty cells. CONCAT is like CONCATENATE but accepts ranges. Both available in Excel 2019+. For older: use & operator or CONCATENATE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TEXTJOIN / CONCAT — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A       | B       | C       | D                                |\n|---------|---------|---------|----------------------------------|\n| First   | Middle  | Last    | Full Name                        |\n| Alice   | Marie   | Smith   | =TEXTJOIN(\" \",TRUE,A2:C2)        |\n| Bob     |         | Jones   | =TEXTJOIN(\" \",TRUE,A3:C3)        |\n| Result row 2: Alice Marie Smith   |                                  |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TEXTJOIN / CONCAT — common patterns you'll see in production.\n// APPROACH  - Combine TEXTJOIN / CONCAT with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Result row 3: Bob Jones (blank skipped) |                            |\n|         |         |         |                                  |\n| CSV list from column:             |                                  |\n| =TEXTJOIN(\", \",TRUE,A2:A10)       | Alice, Bob, Carol, ...           |\n|         |         |         |                                  |\n| CONCAT (no delimiter):            |                                  |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TEXTJOIN / CONCAT — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| =CONCAT(A2,\" \",B2,\" \",C2)        | Alice Marie Smith                |\n|         |         |         |                                  |\n| With FILTER (M365):               |                                  |\n| =TEXTJOIN(\", \",TRUE,                                             |\n|   FILTER(A2:A10, B2:B10=\"IT\"))    | Alice, Carol, Eve (IT only)      |"
                  }
        ],
        tips: [
                  "ignore_empty=TRUE skips blanks — essential when middle names or optional fields are empty",
                  "Combine with FILTER to join values that meet a condition",
                  "Use `CHAR(10)` as delimiter with Wrap Text enabled to create multi-line cell content",
                  "CONCAT replaced CONCATENATE — use CONCAT in new formulas"
        ],
        mistake: "Using & to join a range: `=A1&A2&A3...` breaks when rows are added. Use =TEXTJOIN(\", \",TRUE, A1:A100) instead — it handles any size range.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse & operator to concatenate: =A1&\" \"&B1&\" \"&C1; use CONCATENATE() for many cells.\n// More explicit but longer",
          concise: "=TEXTJOIN(\", \", TRUE, A1:A5)",
        },
      },
      {
        id: "text-extraction",
        fn: "LEFT / RIGHT / MID",
        desc: "Extract characters from start, end, or middle of a string.",
        category: "Text",
        subtitle: "Slice substrings by position",
        signature: "=LEFT(text, num_chars)\n=RIGHT(text, num_chars)\n=MID(text, start_num, num_chars)",
        descLong: "LEFT extracts from the beginning, RIGHT from the end, MID from any position. Combine with FIND or LEN to dynamically calculate positions rather than hardcoding lengths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LEFT / RIGHT / MID — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A                  | Formula                          | Result   |\n|--------------------|----------------------------------|----------|\n| PROD-001-Widget    | =LEFT(A2,4)                      | PROD     |\n| PROD-001-Widget    | =RIGHT(A2,6)                     | Widget   |\n| PROD-001-Widget    | =MID(A2,6,3)                     | 001      |\n|                    |                                  |          |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LEFT / RIGHT / MID — common patterns you'll see in production.\n// APPROACH  - Combine LEFT / RIGHT / MID with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Dynamic extraction:                                            |\n| alice@company.com  | =LEFT(A6,FIND(\"@\",A6)-1)         | alice    |\n| alice@company.com  | =MID(A6,FIND(\"@\",A6)+1,         |          |\n|                    |      LEN(A6)-FIND(\"@\",A6))       | company.com |\n|                    |                                  |          |\n| Extract after last dash:                                       |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LEFT / RIGHT / MID — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| DEPT-SUB-CODE      | =RIGHT(A9,                       |          |\n|                    |   LEN(A9)-FIND(\"*\",             |          |\n|                    |   SUBSTITUTE(A9,\"-\",\"*\",         |          |\n|                    |   LEN(A9)-LEN(SUBSTITUTE(A9,\"-\",\"\")))) | CODE |"
                  }
        ],
        tips: [
                  "Use FIND (case-sensitive) or SEARCH (case-insensitive) to locate delimiters dynamically",
                  "Extract after last delimiter: replace all but last with SUBSTITUTE trick shown above",
                  "In M365 use TEXTSPLIT instead — cleaner for delimiter-based splitting",
                  "Combine with VALUE() to convert extracted numbers from text to numeric"
        ],
        mistake: "Hardcoding character counts: =LEFT(A1, 5). If the format changes, all formulas break. Use FIND to calculate position dynamically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse LEFT, RIGHT, MID with FIND to manually locate and extract text; use helper columns for complex extraction.\n// More explicit but longer",
          concise: "=TEXTSPLIT(A1, \" \")",
        },
      },
      {
        id: "textsplit",
        fn: "TEXTSPLIT",
        desc: "Split text into rows or columns by delimiter — M365 only.",
        category: "Text",
        subtitle: "Explode delimited text into a spilled array",
        signature: "=TEXTSPLIT(text, [col_delimiter], [row_delimiter], [ignore_empty], [pad_with])",
        descLong: "TEXTSPLIT splits text by a delimiter and spills results across columns (col_delimiter) or down rows (row_delimiter). The M365 replacement for Text-to-Columns wizard and complex MID/FIND formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TEXTSPLIT — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A                        | Formula                         |\n|--------------------------|---------------------------------|\n| Alice,Bob,Carol,Dave     | =TEXTSPLIT(A2,\",\")              |\n| Result: Alice | Bob | Carol | Dave  (spills across cols)  |\n|                          |                                 |\n| Split to rows:           |                                 |\n| Alice,Bob,Carol          | =TEXTSPLIT(A4,,\",\")             |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TEXTSPLIT — common patterns you'll see in production.\n// APPROACH  - Combine TEXTSPLIT with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Result: Alice            | (spills down rows)              |\n|         Bob              |                                 |\n|         Carol            |                                 |\n|                          |                                 |\n| Split 2D (CSV style):    |                                 |\n| A,B;C,D;E,F              | =TEXTSPLIT(A7,\",\",\";\")          |\n| Result: A | B            | row 1                           |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TEXTSPLIT — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|         C | D            | row 2                           |\n|         E | F            | row 3                           |\n|                          |                                 |\n| Multiple delimiters:     |                                 |\n| A-B,C/D                  | =TEXTSPLIT(A10,{\"-\",\",\",\"/\"})   |"
                  }
        ],
        tips: [
                  "Use `{\"delim1\",\"delim2\"}` array for multiple delimiters",
                  "ignore_empty=TRUE removes empty tokens from double-delimiters",
                  "Combine with TRIM: `=TRIM(TEXTSPLIT(...))` to clean whitespace from each token",
                  "For Excel pre-M365, replicate with MID/FIND or use Power Query Text.Split"
        ],
        mistake: "Using TEXTSPLIT in workbooks shared with Excel 2019 or older users — it will show #NAME? error. Use Text-to-Columns or a MID/FIND formula for compatibility.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested TRIM, MID, FIND, and SUBSTITUTE to split text manually into separate columns/rows.\n// More explicit but longer",
          concise: "=TEXTSPLIT(A1, \"|\")",
        },
      },
      {
        id: "text-format",
        fn: "TEXT / VALUE / TRIM / CLEAN",
        desc: "Format numbers as text, convert text to numbers, clean whitespace.",
        category: "Text",
        subtitle: "Format, convert, and sanitize text values",
        signature: "=TEXT(value, format_text)\n=VALUE(text)\n=TRIM(text)\n=CLEAN(text)",
        descLong: "TEXT converts a number to formatted text using Excel number format codes. VALUE converts text that looks like a number back to a real number. TRIM removes extra spaces. CLEAN removes non-printable characters (common in data imports).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TEXT / VALUE / TRIM / CLEAN — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Value/Formula                   | Result                          |\n|---------------------------------|---------------------------------|\n| =TEXT(1234567.89, \"$#,##0.00\")  | $1,234,567.89                   |\n| =TEXT(44927, \"DD-MMM-YYYY\")     | 15-Jan-2023                     |\n| =TEXT(0.856, \"0.0%\")            | 85.6%                           |\n| =TEXT(9.5, \"0.0 \\\"hrs\\\"\")       | 9.5 hrs                         |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TEXT / VALUE / TRIM / CLEAN — common patterns you'll see in production.\n// APPROACH  - Combine TEXT / VALUE / TRIM / CLEAN with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n|                                 |                                 |\n| VALUE conversion:               |                                 |\n| \" 1,234 \" (text)                | =VALUE(TRIM(A6))  → 1234        |\n| \"$45.00\" (text)                 | =VALUE(SUBSTITUTE(A7,\"$\",\"\"))   |\n|                                 |                                 |\n| TRIM and CLEAN:                 |                                 |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TEXT / VALUE / TRIM / CLEAN — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| \"  hello   world  \"             | =TRIM(A9)  → \"hello world\"      |\n| Data with CHAR(10) line breaks  | =CLEAN(A10) removes them        |\n|                                 |                                 |\n| Combined cleanup:               |                                 |\n| =TRIM(CLEAN(SUBSTITUTE(A11,CHAR(160),\" \")))  ← handles &nbsp; |"
                  }
        ],
        tips: [
                  "TRIM only removes ASCII space (CHAR(32)) — use SUBSTITUTE for CHAR(160) non-breaking spaces from web imports",
                  "TEXT result is text — cannot sum it. Use for display/concatenation only",
                  "Common format codes: `\"YYYY-MM-DD\"`, `\"#,##0\"`, `\"0.00%\"`, `\"hh:mm:ss\"`",
                  "CLEAN removes CHAR(1) through CHAR(31) — catches most import junk characters"
        ],
        mistake: "Summing TEXT() results. =TEXT(A1, \"$#,##0.00\") returns text, not a number. Use custom number formatting on the cell instead if you need to sum.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse UPPER, LOWER, PROPER, SUBSTITUTE manually chained together for complex text transformations.\n// More explicit but longer",
          concise: "=PROPER(TRIM(SUBSTITUTE(A1, \"  \", \" \")))",
        },
      },
      {
        id: "date-functions",
        fn: "DATE / YEAR / MONTH / DAY",
        desc: "Construct and decompose dates.",
        category: "Date/Time",
        subtitle: "Build dates from parts and extract components",
        signature: "=DATE(year, month, day)\n=YEAR(date) / MONTH(date) / DAY(date)",
        descLong: "DATE constructs a date serial number from year, month, day components. YEAR/MONTH/DAY extract those components back. Excel stores dates as integers (Jan 1, 1900 = 1) — this enables date arithmetic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DATE / YEAR / MONTH / DAY — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Formula                          | Result         | Notes                |\n|----------------------------------|----------------|----------------------|\n| =DATE(2024, 3, 15)               | 15-Mar-2024    | Build a date         |\n| =DATE(2024, 13, 1)               | 01-Jan-2025    | Month overflow works |\n| =DATE(2024, 1, 0)                | 31-Dec-2023    | Day 0 = last of prev |\n| =YEAR(TODAY())                   | 2024           | Current year         |\n| =MONTH(\"15-Mar-2024\")            | 3              |                      |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DATE / YEAR / MONTH / DAY — common patterns you'll see in production.\n// APPROACH  - Combine DATE / YEAR / MONTH / DAY with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| =DAY(TODAY())                    | 15             |                      |\n|                                  |                |                      |\n| Date arithmetic:                 |                |                      |\n| =TODAY()+30                      | 30 days from now             |\n| =DATE(2024,12,31)-TODAY()        | Days until year end          |\n| =EOMONTH(TODAY(),0)              | Last day of current month    |\n| =EOMONTH(TODAY(),1)              | Last day of next month       |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DATE / YEAR / MONTH / DAY — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|                                  |                |                      |\n| First day of month:              |                |                      |\n| =DATE(YEAR(A1),MONTH(A1),1)      | First of same month as A1    |\n| First of next month:             |                |                      |\n| =EOMONTH(A1,0)+1                 | First of next month          |"
                  }
        ],
        tips: [
                  "DATE(yr, month+n, day) automatically rolls over — DATE(2024,13,1) = Jan 2025",
                  "EOMONTH(date, 0) = last day of month; EOMONTH(date, -1)+1 = first of month",
                  "Store dates as real dates, not text — text dates cause sorting and calculation failures",
                  "TODAY() is volatile — recalculates every time the workbook calculates"
        ],
        mistake: "Entering dates as text (\"15/03/2024\") instead of real dates. They look the same but won't sort, calculate, or filter correctly. Use Data > Text to Columns to convert.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse DATE() with concatenation, hardcode year/month/day; use DATEVALUE() for parsing text to dates.\n// More explicit but longer",
          concise: "=DATE(YEAR(A1), MONTH(A1), DAY(A1))",
        },
      },
      {
        id: "workday-networkdays",
        fn: "WORKDAY / NETWORKDAYS",
        desc: "Calculate business days, skipping weekends and holidays.",
        category: "Date/Time",
        subtitle: "Business day arithmetic with holiday support",
        signature: "=WORKDAY(start_date, days, [holidays])\n=NETWORKDAYS(start_date, end_date, [holidays])",
        descLong: "WORKDAY returns a date n working days from a start date, skipping weekends and optional holidays. NETWORKDAYS counts working days between two dates. The .INTL variants support non-Saturday/Sunday weekends.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WORKDAY / NETWORKDAYS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A             | B          | C                                    |\n|---------------|------------|--------------------------------------|\n| Start Date    | 01-Jan-2024|                                      |\n| Holidays      | 15-Jan-2024| (MLK Day)                            |\n|               | 19-Feb-2024| (Presidents Day)                     |\n|               |            |                                      |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WORKDAY / NETWORKDAYS — common patterns you'll see in production.\n// APPROACH  - Combine WORKDAY / NETWORKDAYS with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| 10 biz days after start:            |                                      |\n| =WORKDAY(B1, 10, B2:B3)             | 15-Jan-2024 skipped → 16-Jan-2024    |\n|               |            |                                      |\n| Deadline 30 biz days out:           |                                      |\n| =WORKDAY(TODAY(), 30, Holidays)     | Date 30 biz days from today          |\n|               |            |                                      |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WORKDAY / NETWORKDAYS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Count biz days in a month:          |                                      |\n| =NETWORKDAYS(DATE(2024,1,1),        |                                      |\n|              DATE(2024,1,31),B2:B3) | 22 (Jan 2024 minus MLK Day)          |\n|               |            |                                      |\n| Middle East weekend (Fri-Sat):      |                                      |\n| =WORKDAY.INTL(B1, 10, 7)           | weekend=7 means Fri+Sat              |"
                  }
        ],
        tips: [
                  "Put holidays in a named range (e.g., `Holidays`) for reuse across multiple formulas",
                  "WORKDAY.INTL weekend codes: 1=Sat-Sun, 7=Fri-Sat, 11=Sunday only, etc.",
                  "NETWORKDAYS.INTL supports the same weekend codes",
                  "To get the last working day of a month: `=WORKDAY(EOMONTH(A1,0)+1,-1,holidays)`"
        ],
        mistake: "Forgetting the holidays argument and wondering why WORKDAY returns holiday dates as valid. Build a holiday table and always pass it.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse DATE arithmetic with manual weekday checking using WEEKDAY(); manually count business days.\n// More explicit but longer",
          concise: "=WORKDAY(A1, 5) or =NETWORKDAYS(A1, B1)",
        },
      },
      {
        id: "datedif-yearfrac",
        fn: "DATEDIF / YEARFRAC",
        desc: "Calculate exact differences between dates in days, months, or years.",
        category: "Date/Time",
        subtitle: "Age calculations and elapsed time between dates",
        signature: "=DATEDIF(start_date, end_date, unit)\n=YEARFRAC(start_date, end_date, [basis])",
        descLong: "DATEDIF (undocumented but fully supported) calculates exact date differences in various units. YEARFRAC returns the fraction of a year between two dates — essential for prorated calculations, interest, and age.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DATEDIF / YEARFRAC — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A           | B           | C                             |\n|-------------|-------------|-------------------------------|\n| Born:       | 15-Jun-1990 |                               |\n| Today:      | =TODAY()    |                               |\n|             |             |                               |\n| Age in years:             | =DATEDIF(B1,B2,\"Y\")           |\n| Result:                   | 33                            |\n|             |             |                               |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DATEDIF / YEARFRAC — common patterns you'll see in production.\n// APPROACH  - Combine DATEDIF / YEARFRAC with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| Age Y M D format:         |                               |\n| =DATEDIF(B1,B2,\"Y\")&\" yrs \"                              |\n| &DATEDIF(B1,B2,\"YM\")&\" mo \"                              |\n| &DATEDIF(B1,B2,\"MD\")&\" days\"                             |\n| Result: 33 yrs 6 mo 12 days                              |\n|             |             |                               |\n| DATEDIF units:            |                               |\n| \"Y\"  = complete years     |                               |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DATEDIF / YEARFRAC — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| \"M\"  = complete months    |                               |\n| \"D\"  = total days         |                               |\n| \"YM\" = months after last yr                              |\n| \"MD\" = days after last month                             |\n|             |             |                               |\n| Prorated salary (YEARFRAC):                              |\n| =85000 * YEARFRAC(B1, B2, 1)  ← actual/actual basis     |"
                  }
        ],
        tips: [
                  "DATEDIF is undocumented — no IntelliSense, but fully supported since Excel 97",
                  "\"YM\" gives months ignoring years — for displaying ages as \"X years Y months\"",
                  "YEARFRAC basis: 0=US 30/360, 1=actual/actual, 3=actual/365",
                  "Alternative age: `=INT(YEARFRAC(birth, TODAY(), 1))` for whole years"
        ],
        mistake: "Using =YEAR(TODAY())-YEAR(birthdate) for age — this gives wrong results for birthdays not yet passed this year. Use DATEDIF(birth, TODAY(), \"Y\") instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse DATE subtraction and manual conversion: (B1-A1)/365 for years; DATEDIF() for precise intervals.\n// More explicit but longer",
          concise: "=DATEDIF(A1, B1, \"Y\")",
        },
      },
    ],
  },

  // ── Section 3: Logic, Math & Named Ranges ─────────────────────────────────────────
  {
    id: "logic-math-named",
    title: "Logic, Math & Named Ranges",
    entries: [
      {
        id: "ifs-switch",
        fn: "IFS / SWITCH",
        desc: "Multi-condition branching without nested IFs.",
        category: "Logical",
        subtitle: "Test multiple conditions cleanly",
        signature: "=IFS(test1, value1, [test2, value2], ...)\n=SWITCH(expression, val1, result1, [val2, result2], ..., [default])",
        descLong: "IFS tests multiple conditions in order and returns the value for the first TRUE condition. SWITCH matches an expression against a list of values and returns the corresponding result. Both replace deeply nested IF statements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of IFS / SWITCH — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Score | Grade (nested IF — ugly):                               |\n|-------|----------------------------------------------------------|\n|  92   | =IF(A2>=90,\"A\",IF(A2>=80,\"B\",IF(A2>=70,\"C\",            |\n|       |   IF(A2>=60,\"D\",\"F\"))))                                 |\n|       |                                                         |\n| Score | Grade (IFS — clean):                                    |\n|  92   | =IFS(A5>=90,\"A\",A5>=80,\"B\",A5>=70,\"C\",                 |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of IFS / SWITCH — common patterns you'll see in production.\n// APPROACH  - Combine IFS / SWITCH with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n|       |      A5>=60,\"D\",TRUE,\"F\")                               |\n| Result: A                                                 |\n|       |                                                         |\n| SWITCH — exact match (like lookup table):                 |\n| Day#  | Day Name                                                |\n|  3    | =SWITCH(A9,                                             |\n|       |   1,\"Monday\",2,\"Tuesday\",3,\"Wednesday\",               |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of IFS / SWITCH — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|       |   4,\"Thursday\",5,\"Friday\",\"Weekend\")                   |\n| Result: Wednesday                                         |\n|       |                                                         |\n| SWITCH with calculation:                                  |\n| \"USD\" | =SWITCH(A12,\"USD\",1,\"EUR\",1.08,\"GBP\",1.27,\"JPY\",0.0067)|"
                  }
        ],
        tips: [
                  "IFS evaluates conditions in order — put most common conditions first for performance",
                  "IFS last condition `TRUE, default_value` acts as the else clause",
                  "SWITCH is faster than IFS for exact value matching — use it for code/category lookups",
                  "SWITCH default (last arg with no value pair) is the else — omit to get #N/A if no match"
        ],
        mistake: "Nesting more than 3 IFs. IFS and SWITCH are far more readable. Excel limits nested IFs to 64 — but readability breaks down after 3.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested IF: =IF(A1=\"a\",1,IF(A1=\"b\",2,IF(A1=\"c\",3,0)))\n// More explicit but longer",
          concise: "=SWITCH(A1, \"a\", 1, \"b\", 2, \"c\", 3, 0)",
        },
      },
      {
        id: "iferror-ifna",
        fn: "IFERROR / IFNA / IF",
        desc: "Handle errors and build conditional logic.",
        category: "Logical",
        subtitle: "Trap errors and control formula flow",
        signature: "=IFERROR(value, value_if_error)\n=IFNA(value, value_if_na)\n=IF(logical_test, value_if_true, value_if_false)",
        descLong: "IFERROR catches any error and returns an alternative. IFNA catches only #N/A errors — preferred for lookups so real errors (like #REF!) are not silently hidden. IF is the fundamental conditional — pair with AND/OR for compound tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of IFERROR / IFNA / IF — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Formula                                  | Result          |\n|------------------------------------------|-----------------|\n| =IFERROR(1/0, \"Error!\")                  | Error!          |\n| =IFERROR(VLOOKUP(\"X\",A:B,2,0),\"Missing\") | Missing         |\n| =IFNA(XLOOKUP(\"X\",A:A,B:B), \"Not found\") | Not found       |\n|                                          |                 |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of IFERROR / IFNA / IF — common patterns you'll see in production.\n// APPROACH  - Combine IFERROR / IFNA / IF with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| IF with AND:                             |                 |\n| =IF(AND(A2>18, B2=\"Active\"), \"Eligible\", \"No\")          |\n|                                          |                 |\n| IF with OR:                              |                 |\n| =IF(OR(A2=\"Admin\",A2=\"Manager\"),\"Full\",\"Limited\")       |\n|                                          |                 |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of IFERROR / IFNA / IF — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Nested IF for null handling:             |                 |\n| =IF(A2=\"\",\"\",IF(A2>100,\"High\",\"Low\"))                   |\n|                                          |                 |\n| IFERROR vs IFNA:                         |                 |\n| =IFERROR(XLOOKUP(...), 0) ← hides ALL errors (risky)    |\n| =IFNA(XLOOKUP(...), 0)    ← only hides #N/A (safer)     |"
                  }
        ],
        tips: [
                  "Prefer IFNA over IFERROR for lookups — IFERROR silently hides formula mistakes",
                  "Empty string test: `IF(A1=\"\", ...)` — don't use `IF(A1=0, ...)` for blank cells",
                  "Chain IFERRORs to try multiple lookups: `=IFERROR(XLOOKUP(...table1), IFERROR(XLOOKUP(...table2), \"None\"))`",
                  "AND/OR accept up to 255 conditions — but IFS is often cleaner for many conditions"
        ],
        mistake: "Using IFERROR to hide errors in complex models. A formula error usually means a data problem. Use IFNA for lookup misses; leave real errors visible.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse IF(ISERROR()) or IF(ISNA()) to wrap and handle errors with nested IF statements.\n// More explicit but longer",
          concise: "=IFERROR(VLOOKUP(A1,B:C,2,0), \"Not found\")",
        },
      },
      {
        id: "aggregate-subtotal",
        fn: "AGGREGATE / SUBTOTAL",
        desc: "Calculate while ignoring hidden rows and errors.",
        category: "Math",
        subtitle: "Aggregations that respect filters and ignore errors",
        signature: "=AGGREGATE(function_num, options, array)\n=SUBTOTAL(function_num, ref1, ...)",
        descLong: "SUBTOTAL ignores other SUBTOTAL cells (no double-counting) and can ignore hidden rows. AGGREGATE extends this with more functions and the ability to ignore errors. Both are essential for filtered list calculations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AGGREGATE / SUBTOTAL — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Function nums for AGGREGATE:          |                     |\n|---------------------------------------|---------------------|\n| 1=AVERAGE  2=COUNT   3=COUNTA        |                     |\n| 4=MAX      5=MIN     6=PRODUCT       |                     |\n| 9=SUM      14=LARGE  15=SMALL        |                     |\n|                                       |                     |\n| Options for AGGREGATE:                |                     |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AGGREGATE / SUBTOTAL — common patterns you'll see in production.\n// APPROACH  - Combine AGGREGATE / SUBTOTAL with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| 0=default  1=ignore hidden            |                     |\n| 2=ignore errors  5=ignore hidden+err  |                     |\n|                                       |                     |\n| Sum visible rows only (after filter): |                     |\n| =AGGREGATE(9, 5, C2:C100)             | Sum ignoring hidden |\n| =SUBTOTAL(9, C2:C100)                 | Same (simpler)      |\n|                                       |                     |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AGGREGATE / SUBTOTAL — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Max ignoring errors:                  |                     |\n| =AGGREGATE(4, 6, C2:C100)             | Max, skip errors    |\n|                                       |                     |\n| 2nd largest value:                    |                     |\n| =AGGREGATE(14, 6, C2:C100, 2)         | 2nd largest         |\n| Compare: =LARGE(C2:C100, 2)           | Breaks on errors    |"
                  }
        ],
        tips: [
                  "SUBTOTAL in a totals row auto-excludes other SUBTOTAL cells — no double-counting",
                  "AGGREGATE option 5 (ignore hidden + errors) is the safest general choice",
                  "Use AGGREGATE(14,6,range,1) for MAX ignoring errors instead of MAX(IF(...))",
                  "SUBTOTAL function 9 = SUM, 109 = SUM ignoring hidden rows (add 100 to ignore hidden)"
        ],
        mistake: "Using SUM in a filtered list total row — it counts hidden rows. Use SUBTOTAL(9,...) or AGGREGATE(9,5,...) for totals that respect filters.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse SUM with helper columns to exclude filtered rows; manually count visible cells with COUNTIF.\n// More explicit but longer",
          concise: "=AGGREGATE(9, 5, D2:D100) or =SUBTOTAL(109, D2:D100)",
        },
      },
      {
        id: "statistical",
        fn: "PERCENTILE / RANK / STDEV",
        desc: "Statistical analysis functions for data sets.",
        category: "Statistics",
        subtitle: "Percentiles, ranking, and standard deviation",
        signature: "=PERCENTILE.INC(array, k)\n=RANK.EQ(number, ref, [order])\n=STDEV.S(number1, ...)",
        descLong: "Modern Excel uses .S (sample) and .P (population) variants for statistical functions and .INC/.EXC for percentile/quartile (inclusive vs exclusive of 0 and 1). Use the named variants in all new work.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PERCENTILE / RANK / STDEV — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Scores: 45,62,71,78,82,88,91,95     |                           |\n|--------------------------------------|---------------------------|\n| =PERCENTILE.INC(A2:A9, 0.75)         | 75th percentile = 89.25   |\n| =PERCENTILE.INC(A2:A9, 0.5)          | Median = 80               |\n| =QUARTILE.INC(A2:A9, 1)              | Q1 (25th pct) = 68.25     |\n|                                      |                           |"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PERCENTILE / RANK / STDEV — common patterns you'll see in production.\n// APPROACH  - Combine PERCENTILE / RANK / STDEV with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n| =RANK.EQ(88, A2:A9, 0)               | Rank 3 (descending)       |\n| =RANK.EQ(88, A2:A9, 1)               | Rank 6 (ascending)        |\n|                                      |                           |\n| =STDEV.S(A2:A9)                      | Sample std dev = 17.7     |\n| =STDEV.P(A2:A9)                      | Population std dev = 16.6 |\n| =VAR.S(A2:A9)                        | Sample variance           |"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PERCENTILE / RANK / STDEV — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|                                      |                           |\n| =AVERAGE(A2:A9)                      | Mean = 76.5               |\n| =MEDIAN(A2:A9)                       | Median = 80               |\n| =MODE.SNGL(A2:A9)                    | Most frequent value       |\n| =SKEW(A2:A9)                         | Distribution skewness     |"
                  }
        ],
        tips: [
                  "Use STDEV.**S** for samples (most common), STDEV.**P** for entire populations",
                  "PERCENTILE.INC(arr, 0.5) = MEDIAN — both give the same result",
                  "RANK.EQ gives tied ranks the same number; RANK.AVG averages tied positions",
                  "For conditional statistics use AVERAGEIFS, MINIFS, MAXIFS (2019+)"
        ],
        mistake: "Using the old STDEV, RANK, PERCENTILE functions (without .S/.EQ/.INC). They still work but are deprecated — use the named variants in new workbooks.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse SUMPRODUCT for weighted average; SQRT, POWER, EXP manually for statistical calculations.\n// More explicit but longer",
          concise: "=STDEV(A1:A100) or =CORREL(A1:A100, B1:B100)",
        },
      },
      {
        id: "named-ranges",
        fn: "Named Ranges",
        desc: "Name cells and ranges to use plain English in formulas.",
        category: "Names",
        subtitle: "Replace cryptic addresses with readable names",
        signature: "Ctrl+F3 → New  |  =Name  |  =SUM(SalesData)",
        descLong: "Named ranges let you refer to cells by a descriptive name instead of an address. They make formulas readable, survive row/column insertions, and can be scoped to a sheet or workbook. Dynamic named ranges expand automatically with data. Essential for building maintainable workbooks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Named Ranges — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n╔══════════════════════════════════════════════════════╗\n║  Name Manager  (Ctrl + F3)                           ║\n╠══════════════════╦═══════════════╦════════════════════╣\n║  Name            ║  Refers To    ║  Scope             ║\n╠══════════════════╬═══════════════╬════════════════════╣\n║  TaxRate         ║  =0.22        ║  Workbook          ║\n║  SalesData       ║  =Data!$A$2:  ║  Workbook          ║\n║                  ║   $D$500      ║                    ║\n║  DeptList        ║  =OFFSET(     ║  Workbook          ║\n║                  ║   Lists!$A$1, ║  (dynamic)         ║\n║                  ║   1,0,        ║                    ║\n║                  ║   COUNTA(...))║                    ║\n╚══════════════════╩═══════════════╩════════════════════╝"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Named Ranges — common patterns you'll see in production.\n// APPROACH  - Combine Named Ranges with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Using named ranges in formulas ──────────────────────\n=SalesData                    ← reference entire range\n=SUM(SalesData)               ← sum named range\n=XLOOKUP(E2, EmpIDs, Names)   ← readable XLOOKUP\n=Revenue * TaxRate            ← constant in formula"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Named Ranges — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Dynamic named range (auto-expands) ──────────────────,Refers to: =OFFSET(Data!$A$1,1,0,COUNTA(Data!$A:$A)-1,4),── or M365: use Table column reference instead ─────────"
                  }
        ],
        tips: [
                  "Press **F3** in any formula to paste a name — shows all available names",
                  "Scope a name to a sheet: `Sheet1!MyRange` — same name can exist on multiple sheets",
                  "Prefer Excel Tables over dynamic OFFSET names — Tables auto-expand and are more stable",
                  "Use `Ctrl+F3` to see, edit, and delete all names — clean up stale names regularly"
        ],
        mistake: "Creating workbook-scoped names when you meant sheet-scoped. If two sheets need a 'Totals' name for different ranges, scope each to its sheet — otherwise the second definition overwrites the first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse absolute references like $A$1:$A$100 instead of named ranges; repeat ranges in each formula.\n// More explicit but longer",
          concise: "=SUM(Sales_Data) where Sales_Data is a defined named range",
        },
      },
      {
        id: "data-validation",
        fn: "Data Validation",
        desc: "Restrict cell input to lists, numbers, dates, or custom rules.",
        category: "Validation",
        subtitle: "Create dropdowns and enforce data integrity",
        signature: "Data → Data Validation → Settings tab",
        descLong: "Data Validation restricts what users can enter in a cell — dropdowns, number ranges, date ranges, text length, or any custom formula. Dynamic dropdowns powered by OFFSET or Table references update automatically. Cascading dropdowns use INDIRECT for dependent lists.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Data Validation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n╔═══════════════════════════════════════════════════════╗\n║  Data Validation Setup Examples                       ║\n╠════════════════════╦══════════════════════════════════╣\n║  Type              ║  Settings                        ║\n╠════════════════════╬══════════════════════════════════╣\n║  List (dropdown)   ║  Source: IT,HR,Finance,Ops       ║\n║  List (range)      ║  Source: =$F$2:$F$10             ║\n║  List (Table col)  ║  Source: =DeptTable[Dept]        ║\n║  List (dynamic)    ║  Source: =OFFSET($F$1,1,0,       ║\n║                    ║           COUNTA($F:$F)-1)       ║\n║  Whole number      ║  Between 1 and 100               ║\n║  Decimal           ║  Greater than 0                  ║\n║  Date              ║  Between 1/1/24 and 12/31/24     ║\n║  Text length       ║  Equal to 5 (e.g. ZIP codes)     ║\n║  Custom formula    ║  =COUNTIF($A:$A,A2)=1 (no dups)  ║\n╚════════════════════╩══════════════════════════════════╝"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Data Validation — common patterns you'll see in production.\n// APPROACH  - Combine Data Validation with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Cascading dropdown (Dept → Employee) ────────────────\nSheet has named ranges: IT, HR, Finance (each = employee list)\nCell B2 has Dept dropdown\nCell C2 formula: =INDIRECT(B2)   ← looks up named range by dept name"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Data Validation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── No-duplicate validation ─────────────────────────────,Custom formula: =COUNTIF($A:$A,A2)=1,Applied to: $A$2:$A$1000,Error alert: \"This value already exists!\""
                  }
        ],
        tips: [
                  "Use a Table column as the dropdown source — it auto-expands as you add items",
                  "**INDIRECT(B2)** as source enables cascading dropdowns — B2 holds the parent category name which matches a named range",
                  "Circle invalid data: Data → Data Validation → Circle Invalid Data — highlights cells that violate rules",
                  "In-cell dropdown shows automatically; Input Message tab adds a tooltip on cell selection"
        ],
        mistake: "Using a static comma-separated list as dropdown source. It doesn't update when options change. Use a Table column or named range — then the dropdown updates automatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual list entry in cells; use helper sheet to maintain dropdown options; no formula-based validation.\n// More explicit but longer",
          concise: "Data > Validation > List > =INDIRECT(\"Product_List\")",
        },
      },
      {
        id: "conditional-formatting",
        fn: "Conditional Formatting (VBA)",
        desc: "Apply and manage conditional formatting rules via VBA.",
        category: "Formatting",
        subtitle: "Programmatically set rules, color scales, and icon sets",
        signature: "range.FormatConditions.Add Type:=xlCellValue",
        descLong: "Conditional formatting highlights cells based on rules. VBA can add, modify, and clear CF rules programmatically — essential for reports that regenerate data and need fresh formatting each run. Supports cell value, formula, color scales, data bars, and icon sets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conditional Formatting (VBA) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nDim ws As Worksheet\nSet ws = Sheet1\nDim rng As Range\nSet rng = ws.Range(\"C2:C100\")\n\n' ── Clear existing CF rules first ────────────────\nrng.FormatConditions.Delete\n\n' ── Highlight cells > threshold ──────────────────\nWith rng.FormatConditions.Add( _\n        Type:=xlCellValue, _\n        Operator:=xlGreater, _\n        Formula1:=\"100000\")\n    .Interior.Color = RGB(198, 224, 180)  ' green\n    .Font.Bold = True\nEnd With"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conditional Formatting (VBA) — common patterns you'll see in production.\n// APPROACH  - Combine Conditional Formatting (VBA) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Formula-based rule (entire row highlight) ─────\nSet rng = ws.Range(\"A2:E100\")\nWith rng.FormatConditions.Add( _\n        Type:=xlExpression, _\n        Formula1:=\"=$D2=\"\"Active\"\"\")\n    .Interior.Color = RGB(255, 255, 200)  ' yellow\nEnd With\n\n' ── Color scale (3-color) ─────────────────────────\nSet rng = ws.Range(\"C2:C100\")\nWith rng.FormatConditions.AddColorScale(ColorScaleType:=3)\n    .ColorScaleCriteria(1).FormatColor.Color = RGB(248,105,107) ' red\n    .ColorScaleCriteria(2).FormatColor.Color = RGB(255,235,132) ' yellow\n    .ColorScaleCriteria(3).FormatColor.Color = RGB(99, 190, 123) ' green\nEnd With"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conditional Formatting (VBA) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Data bars ─────────────────────────────────────\nWith rng.FormatConditions.AddDatabar\n    .BarColor.Color = RGB(68, 114, 196)\n    .ShowValue = True\nEnd With\n\n' ── Icon sets ─────────────────────────────────────\nWith rng.FormatConditions.AddIconSetCondition\n    .IconSet = ActiveWorkbook.IconSets(xl3Arrows)\nEnd With"
                  }
        ],
        tips: [
                  "Always `.FormatConditions.Delete` before re-adding rules — rules stack up on every run",
                  "Formula-based CF: formula must evaluate to TRUE/FALSE and use **absolute column, relative row** (`=$D2=\"Active\"`)",
                  "CF rules have priority — first rule wins. Check/adjust order in CF Manager (Home > Conditional Formatting > Manage Rules)",
                  "Color scales, data bars, and icon sets are added via separate `.Add*` methods"
        ],
        mistake: "Using xlExpression formulas without anchoring the column. `=D2=\"Active\"` shifts with the range — use `=$D2=\"Active\"` so the condition always checks column D regardless of which column in the range is being formatted.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse helper column with formulas, then apply formatting manually based on that column.\n// More explicit but longer",
          concise: "Home > Conditional Formatting > Formula Is > =A1>1000",
        },
      },
    ],
  },

  // ── Section 4: Advanced Formulas ─────────────────────────────────────────
  {
    id: "advanced-formulas",
    title: "Advanced Formulas",
    entries: [
      {
        id: "array-formulas",
        fn: "Array Formulas & SUMPRODUCT",
        desc: "Perform multi-condition math and array operations in a single formula.",
        category: "Arrays",
        subtitle: "Operate on entire arrays without helper columns",
        signature: "=SUMPRODUCT(array1 * array2)\n{=SUM(IF(...))} Ctrl+Shift+Enter",
        descLong: "Array formulas operate on ranges element-by-element. SUMPRODUCT multiplies arrays and sums the results — the workhorse for multi-condition aggregations without helper columns. In M365, most array operations spill automatically. Legacy CSE formulas (Ctrl+Shift+Enter) are less needed now.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array Formulas & SUMPRODUCT — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── SUMPRODUCT patterns ──────────────────────────────────\n\n│ A      │ B    │ C      │ D                              │\n│ Region │ Prod │ Sales  │ Formula                        │\n│ East   │ A    │ 1200   │                                │\n│ West   │ B    │  980   │                                │\n│ East   │ A    │ 1450   │                                │\n│ West   │ A    │ 1100   │                                │\n\nCondition sum (East + Product A):\n=SUMPRODUCT((A2:A5=\"East\")*(B2:B5=\"A\")*C2:C5)\nResult: 2650   (1200 + 1450)\n\nCount matching rows:\n=SUMPRODUCT((A2:A5=\"East\")*(B2:B5=\"A\"))\nResult: 2\n\nWeighted average:\n=SUMPRODUCT(C2:C5, D2:D5) / SUM(D2:D5)\n\nCount unique values:\n=SUMPRODUCT(1/COUNTIF(A2:A100,A2:A100))\n\nRunning total (array version):\n=SUMPRODUCT((ROW(A$2:A2)<=ROW())*C$2:C$100)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array Formulas & SUMPRODUCT — common patterns you'll see in production.\n// APPROACH  - Combine Array Formulas & SUMPRODUCT with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Legacy CSE (still works, less needed in M365) ────────\n{=SUM(IF(A2:A5=\"East\",C2:C5,0))}  Ctrl+Shift+Enter"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array Formulas & SUMPRODUCT — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── M365 equivalent (no CSE needed): ────────────────────\n=SUM(IF(A2:A5=\"East\",C2:C5,0))    plain Enter works"
                  }
        ],
        tips: [
                  "SUMPRODUCT `*` = AND condition; `+` then `>0` = OR condition",
                  "In M365, most array formulas work without Ctrl+Shift+Enter — just press Enter",
                  "Legacy `{...}` curly braces around a formula mean it was entered as CSE array formula",
                  "`SUMPRODUCT(1/COUNTIF(range,range))` is the classic unique count formula"
        ],
        mistake: "Using CSE array formulas in M365 when plain FILTER/UNIQUE/dynamic arrays exist. CSE formulas are harder to maintain and slower. Use the newer dynamic functions instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse helper columns to break down array operations into step-by-step formulas.\n// More explicit but longer",
          concise: "=SUM(IF(A2:A10>5, B2:B10, 0)) [Ctrl+Shift+Enter]",
        },
      },
      {
        id: "xmatch-choosecols",
        fn: "XMATCH / CHOOSECOLS / CHOOSEROWS",
        desc: "Modern position-finding and column/row selection functions.",
        category: "Lookup",
        subtitle: "Precise index finding and dynamic column selection",
        signature: "=XMATCH(lookup, array, [match_mode], [search_mode])\n=CHOOSECOLS(array, col1, [col2]...)\n=CHOOSEROWS(array, row1, [row2]...)",
        descLong: "XMATCH returns the relative position of a value — the modern MATCH replacement. CHOOSECOLS returns specific columns from an array by index. CHOOSEROWS returns specific rows. Together these enable flexible column reordering and dynamic table assembly without helper formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of XMATCH / CHOOSECOLS / CHOOSEROWS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── XMATCH ───────────────────────────────────────────────\n│ A     │ B     │ C     │ D     │ E    │\n│       │ Q1    │ Q2    │ Q3    │ Q4   │\n│ Alice │  900  │ 1200  │  980  │ 1450 │\n│ Bob   │  750  │  880  │ 1100  │  920 │\n\nColumn position of \"Q3\":\n=XMATCH(\"Q3\", B1:E1)       → 3\n\nRow position of \"Bob\":\n=XMATCH(\"Bob\", A2:A3)      → 2\n\nUse with INDEX for 2-way lookup:\n=INDEX(B2:E3,\n  XMATCH(\"Bob\", A2:A3),\n  XMATCH(\"Q3\", B1:E1))     → 1100"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of XMATCH / CHOOSECOLS / CHOOSEROWS — common patterns you'll see in production.\n// APPROACH  - Combine XMATCH / CHOOSECOLS / CHOOSEROWS with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── CHOOSECOLS ───────────────────────────────────────────\nData: A1:E10 (Name, Dept, Salary, Start, Status)\n\nReturn only Name + Salary:\n=CHOOSECOLS(A1:E10, 1, 3)  ← col 1 and col 3\n\nReverse column order:\n=CHOOSECOLS(A1:E10, 5,4,3,2,1)\n\nDynamic column selection using XMATCH:\n=CHOOSECOLS(A1:E10,\n  XMATCH({\"Name\",\"Salary\"}, A1:E1))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of XMATCH / CHOOSECOLS / CHOOSEROWS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── CHOOSEROWS ───────────────────────────────────────────,Return rows 1, 3, 5 from a table:,=CHOOSEROWS(A1:E10, 1,3,5),,Return last row:,=CHOOSEROWS(A1:E10, ROWS(A1:E10))"
                  }
        ],
        tips: [
                  "XMATCH supports `match_mode` 2 (wildcard) and `search_mode` -1 (search from last) — more powerful than MATCH",
                  "CHOOSECOLS with negative indices counts from the end: -1 = last column",
                  "Combine CHOOSECOLS + FILTER + SORT for fully dynamic report views",
                  "XMATCH returns #N/A if not found — wrap with IFERROR or IFNA"
        ],
        mistake: "Still using MATCH for new formulas. XMATCH is strictly better — it has the same syntax plus extra match_mode and search_mode options.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse MATCH combined with INDEX to find positions; manually select columns with multiple VLOOKUP calls.\n// More explicit but longer",
          concise: "=XMATCH(A1, B:B) or =CHOOSECOLS(A1:F10, 1, 3)",
        },
      },
      {
        id: "hstack-vstack-tocol",
        fn: "HSTACK / VSTACK / TOCOL / TOROW",
        desc: "Stack and reshape arrays horizontally, vertically, or into single lines.",
        category: "Dynamic Array",
        subtitle: "Combine and reshape arrays without copy-paste",
        signature: "=HSTACK(arr1, arr2, ...)\n=VSTACK(arr1, arr2, ...)\n=TOCOL(array, [ignore], [scan_by_col])",
        descLong: "M365 array reshaping functions: HSTACK stacks arrays side by side. VSTACK stacks arrays on top of each other. TOCOL flattens a 2D array into a single column. TOROW flattens into a row. WRAPROWS/WRAPCOLS reshape a 1D array into a 2D grid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HSTACK / VSTACK / TOCOL / TOROW — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── VSTACK — combine tables vertically ──────────────────\nJan data in A1:C4, Feb data in E1:G4\n\n=VSTACK(A1:C4, E1:G4)   ← stacks Jan on top of Feb\n\nCombine 3 sheets' data:\n=VSTACK(Jan!A2:C100, Feb!A2:C100, Mar!A2:C100)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HSTACK / VSTACK / TOCOL / TOROW — common patterns you'll see in production.\n// APPROACH  - Combine HSTACK / VSTACK / TOCOL / TOROW with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── HSTACK — combine tables side by side ────────────────\nEmployee list + their scores from another table:\n=HSTACK(A2:B10, D2:D10)  ← names + dept + scores"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HSTACK / VSTACK / TOCOL / TOROW — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── TOCOL — flatten 2D to single column ─────────────────,Monthly grid (rows=products, cols=months) to single list:,│ A    │ B    │ C    │ D    │,│      │ Jan  │ Feb  │ Mar  │,│ Wdgt │  100 │  120 │  130 │,│ Gdgt │   80 │   95 │  110 │,,=TOCOL(B2:D3)       → 100,120,130,80,95,110 (row by row),=TOCOL(B2:D3,,TRUE) → 100,80,120,95,130,110 (col by col),,Ignore blanks and errors:,=TOCOL(A1:D10, 3)   ← ignore=3 skips blanks AND errors,\n\n── WRAPROWS — reshape 1D list into grid ─────────────────,=WRAPROWS(A1:A12, 3)  ← 12 items → 4 rows × 3 cols"
                  }
        ],
        tips: [
                  "VSTACK is perfect for combining data from multiple sheets without Power Query",
                  "TOCOL ignore values: 0=keep all, 1=ignore blanks, 2=ignore errors, 3=ignore both",
                  "HSTACK/VSTACK pad with #N/A if arrays have unequal dimensions — wrap with IFERROR to clean",
                  "WRAPROWS/WRAPCOLS are useful for creating calendar grids from a date sequence"
        ],
        mistake: "Manually copying and pasting data from multiple sheets to combine them. Use VSTACK — the combined view updates automatically when source data changes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManually arrange data across worksheets or use copy/paste to stack ranges; use INDEX for horizontal stacking.\n// More explicit but longer",
          concise: "=HSTACK(A1:B10, D1:E10) or =VSTACK(A1:B10, A12:B20)",
        },
      },
      {
        id: "byrow-bycol-map",
        fn: "BYROW / BYCOL / MAP / REDUCE",
        desc: "Apply a LAMBDA function to each row, column, or element of an array.",
        category: "Dynamic Array",
        subtitle: "Higher-order array functions with custom LAMBDA logic",
        signature: "=BYROW(array, LAMBDA(row, formula))\n=MAP(array, LAMBDA(x, formula))",
        descLong: "M365 higher-order functions apply a LAMBDA to each row (BYROW), each column (BYCOL), each element (MAP), or accumulate across elements (REDUCE/SCAN). They replace complex nested array formulas with readable, testable logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of BYROW / BYCOL / MAP / REDUCE — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── MAP — transform each element ────────────────────────\n│ A     │  B                                  │\n│ Score │  Grade                              │\n│  92   │  =MAP(A2:A10,                       │\n│  78   │     LAMBDA(s,                       │\n│  85   │       IFS(s>=90,\"A\",s>=80,\"B\",      │\n│  61   │           s>=70,\"C\",TRUE,\"F\")))     │\n│       │  → A, C, B, F, ... (spills)         │"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of BYROW / BYCOL / MAP / REDUCE — common patterns you'll see in production.\n// APPROACH  - Combine BYROW / BYCOL / MAP / REDUCE with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── BYROW — aggregate each row ──────────────────────────\nData: 5 rows × 4 quarters of sales\n\n=BYROW(B2:E6,\n  LAMBDA(row, SUM(row)))   ← row total for each person\nResult spills 5 values (one per row)\n\nRow max:\n=BYROW(B2:E6, LAMBDA(r, MAX(r)))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of BYROW / BYCOL / MAP / REDUCE — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── BYCOL — aggregate each column ───────────────────────,=BYCOL(B2:E6,,  LAMBDA(col, AVERAGE(col)))  ← avg per quarter,Result spills 4 values (one per column),\n\n── REDUCE — accumulate ──────────────────────────────────,Running product:,=REDUCE(1, A2:A6,,  LAMBDA(acc, val, acc * val)),\n\n── SCAN — running accumulation ──────────────────────────,Running total:,=SCAN(0, C2:C10,,  LAMBDA(acc, val, acc + val))"
                  }
        ],
        tips: [
                  "MAP is the array equivalent of applying a formula to every row — no helper column needed",
                  "BYROW/BYCOL are faster and cleaner than MMULT tricks for row/column aggregations",
                  "REDUCE returns a single value (like fold/reduce in programming); SCAN returns the intermediate values",
                  "Combine with LAMBDA named functions for complex reusable logic"
        ],
        mistake: "Using a helper column to apply a per-row transformation. MAP(array, LAMBDA(x, formula)) replaces the entire helper column with a single spilling formula.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse nested IF/SUMIF for each row/column; lambda functions require manual definition in VBA or helper cells.\n// More explicit but longer",
          concise: "=BYROW(A1:C10, LAMBDA(row, SUM(row)))",
        },
      },
      {
        id: "indirect-offset",
        fn: "INDIRECT / OFFSET",
        desc: "Build dynamic range references from text strings and offsets.",
        category: "Reference",
        subtitle: "Construct cell references programmatically inside formulas",
        signature: "=INDIRECT(ref_text, [a1_style])\n=OFFSET(reference, rows, cols, [height], [width])",
        descLong: "INDIRECT converts a text string into a live cell reference — enabling dynamic sheet references and cascading dropdowns. OFFSET returns a range shifted from a base reference — used for dynamic named ranges and rolling window calculations. Both are volatile (recalculate on every change).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of INDIRECT / OFFSET — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── INDIRECT — dynamic sheet reference ──────────────────\n│ A         │ B                                │\n│ SheetName │ Total                            │\n│ January   │ =INDIRECT(A2&\"!B10\")             │\n│ February  │ =INDIRECT(A3&\"!B10\")             │\n│           │ ← pulls B10 from each sheet      │\n\nReference named range by variable:\nCell E1 = \"SalesData\"  (name of a named range)\n=INDIRECT(E1)          ← reference changes as E1 changes\n\nCascading dropdown:\nParent dropdown (B2) = \"IT\"\nChild source: =INDIRECT(B2)  ← references named range \"IT\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of INDIRECT / OFFSET — common patterns you'll see in production.\n// APPROACH  - Combine INDIRECT / OFFSET with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── OFFSET — rolling window / dynamic range ─────────────\nLast 3 months average (C column, 1000 rows):\n=AVERAGE(OFFSET(C1, COUNTA(C:C)-3, 0, 3, 1))\n\nDynamic named range definition:\nName: SalesData\nRefers to: =OFFSET(Data!$A$1, 1, 0,\n              COUNTA(Data!$A:$A)-1, 4)\n\n2D block offset:\n=SUM(OFFSET(A1, 2, 1, 5, 3))  ← 5r×3c block starting at C3"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of INDIRECT / OFFSET — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Avoid INDIRECT where possible ───────────────────────,Prefer: =Jan!B10  (direct reference, not volatile),Use INDIRECT only when the sheet name must be dynamic"
                  }
        ],
        tips: [
                  "Both INDIRECT and OFFSET are **volatile** — they recalculate on every worksheet change, slowing large workbooks",
                  "Prefer Table structured references and XLOOKUP over OFFSET/INDIRECT when possible",
                  "INDIRECT with R1C1 style: `=INDIRECT(\"R2C3\", FALSE)` = cell C2",
                  "OFFSET height/width args make it return a multi-cell range — useful for AVERAGE of last N rows"
        ],
        mistake: "Using INDIRECT to reference sheets without realizing it's volatile. In workbooks with thousands of cells, volatile functions cause severe slowdowns. Use direct references where possible.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse hardcoded cell references; manually update ranges when structure changes.\n// More explicit but longer",
          concise: "=INDIRECT(\"A\"&ROW()) or =OFFSET(A1, 2, 1)",
        },
      },
      {
        id: "financial-formulas",
        fn: "Financial Functions",
        desc: "NPV, IRR, PMT, FV, PV — built-in financial calculations.",
        category: "Financial",
        subtitle: "Loan payments, investment returns, and time value of money",
        signature: "=PMT(rate, nper, pv)\n=NPV(rate, value1, ...)\n=IRR(values, [guess])",
        descLong: "Excel's financial functions cover loan amortization (PMT/IPMT/PPMT), future/present value (FV/PV), net present value (NPV), internal rate of return (IRR), and depreciation (SLN/DB/DDB). All follow consistent conventions: rate per period, nper=number of periods, pv=present value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Financial Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Loan Payment Calculator ──────────────────────────────\n│ A                │ B            │ C                    │\n│ Loan Amount      │  $250,000    │                      │\n│ Annual Rate      │    6.5%      │                      │\n│ Term (years)     │      30      │                      │\n│ Payments/yr      │      12      │                      │\n│                  │              │                      │\n│ Monthly Payment  │ =PMT(B2/B4,  │ → -$1,580.17         │\n│                  │   B3*B4,-B1) │ (negative=outflow)   │\n│ Total Paid       │ =ABS(B6)*    │ → $568,860           │\n│                  │   B3*B4      │                      │\n│ Total Interest   │ =B7-B1       │ → $318,860           │"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Financial Functions — common patterns you'll see in production.\n// APPROACH  - Combine Financial Functions with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Interest/Principal split each period ────────────────\nPeriod 1 Interest:  =IPMT(6.5%/12, 1, 360, -250000)\nPeriod 1 Principal: =PPMT(6.5%/12, 1, 360, -250000)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Financial Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── NPV & IRR ────────────────────────────────────────────,Year 0: -$100,000 (initial investment, in A1),Year 1-5: $30,000 each (in A2:A6),,=NPV(10%, A2:A6) + A1    ← +A1 because year 0 is now,                            (NPV assumes end-of-period),=IRR(A1:A6)               ← rate where NPV = 0,\n\n── Future Value ─────────────────────────────────────────,$500/mo, 7% annual, 20 years:,=FV(7%/12, 240, -500)    → $262,481"
                  }
        ],
        tips: [
                  "PMT returns negative because it's a cash outflow — use `ABS()` or negate PV to get positive",
                  "NPV assumes cash flows at END of each period — add period 0 investment separately",
                  "XNPV/XIRR handle irregular cash flow dates — more accurate for real-world scenarios",
                  "RATE function finds the interest rate given payment, nper, and PV"
        ],
        mistake: "Using NPV(rate, A1:A5) where A1 is the initial investment. NPV treats A1 as period 1. Period 0 must be added outside: =NPV(rate, A2:A5) + A1.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual payment calculations using /12 for monthly rates; hardcoded periods for loan amortization.\n// More explicit but longer",
          concise: "=PMT(rate, nper, pv) or =NPV(rate, value1, [value2])",
        },
      },
      {
        id: "address-row-col",
        fn: "ADDRESS / ROW / COLUMN / ROWS / COLUMNS",
        desc: "Build cell addresses and get positional information about ranges.",
        category: "Reference",
        subtitle: "Dynamic address building and range dimension functions",
        signature: "=ADDRESS(row_num, col_num, [abs_num], [a1])\n=ROW([reference]) | =COLUMN([reference])",
        descLong: "ROW/COLUMN return the row or column number of a cell. ROWS/COLUMNS return the count of rows or columns in a range. ADDRESS builds a cell reference string from row/column numbers. Together these enable dynamic range construction and self-referential formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ADDRESS / ROW / COLUMN / ROWS / COLUMNS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Basic usage ──────────────────────────────────────────\n=ROW()           → current row number\n=ROW(A5)         → 5\n=COLUMN(C1)      → 3\n=ROWS(A1:A10)    → 10  (count of rows)\n=COLUMNS(A1:E1)  → 5   (count of columns)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ADDRESS / ROW / COLUMN / ROWS / COLUMNS — common patterns you'll see in production.\n// APPROACH  - Combine ADDRESS / ROW / COLUMN / ROWS / COLUMNS with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── ADDRESS — build reference strings ────────────────────\n=ADDRESS(2, 3)           → \"$C$2\"  (abs, A1 style)\n=ADDRESS(2, 3, 4)        → \"C2\"    (relative)\n=ADDRESS(2, 3, 1, FALSE) → \"R2C3\" (R1C1 style)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ADDRESS / ROW / COLUMN / ROWS / COLUMNS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Dynamic range reference ──────────────────────────────,Last cell in column A:,=INDIRECT(ADDRESS(COUNTA(A:A), 1)),,Ref to cell N rows above current:,=INDIRECT(ADDRESS(ROW()-3, COLUMN())),\n\n── ROWS trick for auto-numbering ────────────────────────,│ A              │ B     │,│ =ROWS($A$2:A2) │ Data  │  → 1,│ =ROWS($A$2:A3) │ Data  │  → 2,│ =ROWS($A$2:A4) │ Data  │  → 3,── Expands as formula is copied down ──────────────────,\n\n── Column letter from number ────────────────────────────,=SUBSTITUTE(ADDRESS(1, 5, 4), \"1\", \"\")   → \"E\",=LEFT(ADDRESS(1, MATCH(\"Salary\",A1:Z1,0),4),,      LEN(ADDRESS(1,MATCH(\"Salary\",A1:Z1,0),4))-1)"
                  }
        ],
        tips: [
                  "ROW()-ROW($A$1) gives a 0-based sequence — add 1 for 1-based row numbers",
                  "Use `=ROWS($A$2:A2)` instead of typing 1,2,3 — auto-increments when copied down",
                  "ADDRESS abs_num: 1=$A$1, 2=A$1, 3=$A1, 4=A1 (relative)",
                  "Combine ROW with LARGE/SMALL for dynamic top-N analysis"
        ],
        mistake: "Using ROW() to number rows in a static list. If rows are deleted, ROW() still returns the sheet row number, not the list position. Use =ROWS($A$2:A2) for stable sequential numbering.",
        shorthand: {
          verbose: "// Manual / verbose approach\nUse hardcoded cell references like A1, B2; manually concatenate to build addresses.\n// More explicit but longer",
          concise: "=ADDRESS(ROW(), COLUMN()) or =COLUMN(A1)",
        },
      },
    ],
  },

  // ── Section 5: Formatting, Tables & Tools ─────────────────────────────────────────
  {
    id: "formatting-tables",
    title: "Formatting, Tables & Tools",
    entries: [
      {
        id: "vba-formatting",
        fn: "Cell Formatting in VBA",
        desc: "Apply colors, borders, fonts, and number formats programmatically.",
        category: "Formatting",
        subtitle: "Format cells with Interior, Font, Borders, NumberFormat",
        signature: "range.Interior.Color = RGB(r,g,b)\nrange.Font.Bold = True\nrange.NumberFormat = \"format\"",
        descLong: "VBA can apply any cell formatting programmatically. Use RGB() for custom colors or Excel color constants (vbRed, etc.). NumberFormat uses the same format strings as cell formatting in the UI.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Cell Formatting in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nDim ws As Worksheet\nSet ws = Sheet1\nDim rng As Range\nSet rng = ws.Range(\"A1:E1\")\n\n' ── Background color ─────────────────────────────\nrng.Interior.Color = RGB(68, 114, 196)  ' blue\nrng.Interior.Color = vbYellow\nrng.Interior.ColorIndex = xlNone  ' clear background\n\n' ── Font ─────────────────────────────────────────\nrng.Font.Bold = True\nrng.Font.Size = 12\nrng.Font.Name = \"Calibri\"\nrng.Font.Color = RGB(255, 255, 255)  ' white text\nrng.Font.Italic = True\nrng.Font.Underline = xlUnderlineStyleSingle"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Cell Formatting in VBA — common patterns you'll see in production.\n' APPROACH  - Combine Cell Formatting in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Borders ──────────────────────────────────────\nWith rng.Borders\n    .LineStyle = xlContinuous\n    .Weight = xlThin\n    .Color = RGB(100, 100, 100)\nEnd With\n' Bottom border only:\nrng.Borders(xlEdgeBottom).LineStyle = xlContinuous\nrng.Borders(xlEdgeBottom).Weight = xlMedium\n\n' ── Number formats ───────────────────────────────\nws.Range(\"C2:C100\").NumberFormat = \"$#,##0.00\"\nws.Range(\"D2:D100\").NumberFormat = \"0.0%\"\nws.Range(\"E2:E100\").NumberFormat = \"DD-MMM-YYYY\"\nws.Range(\"F2:F100\").NumberFormat = \"#,##0\""
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Cell Formatting in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Alignment ────────────────────────────────────\nrng.HorizontalAlignment = xlCenter\nrng.VerticalAlignment = xlVAlignMiddle\nrng.WrapText = True\nrng.IndentLevel = 1\n\n' ── Column width / row height ────────────────────\nws.Columns(\"A:E\").AutoFit\nws.Rows(\"1:1\").RowHeight = 30"
                  }
        ],
        tips: [
                  "Use `RGB(r, g, b)` for precise colors — Excel color constants are limited",
                  "Record a macro while formatting manually to get exact VBA syntax for any format",
                  "`.Interior.ColorIndex = xlNone` clears background; `.ColorIndex = 0` is also white",
                  "NumberFormat strings use the same codes as Format Cells dialog (Ctrl+1)"
        ],
        mistake: "Using ColorIndex numbers like ColorIndex = 3. These map to the theme palette and change with themes. Use RGB() for consistent colors regardless of theme.",
        shorthand: {
          verbose: "rng.Interior.Color = RGB(68, 114, 196)\nrng.Font.Bold = True\nrng.Font.Size = 12\nrng.Font.Color = vbWhite\nrng.NumberFormat = \"$#,##0.00\"",
          concise: "With rng.Interior : .Color = RGB(68, 114, 196) : End With\nWith rng.Font : .Bold = True : .Size = 12 : .Color = vbWhite : End With\nrng.NumberFormat = \"$#,##0.00\"",
        },
      },
      {
        id: "vba-charts",
        fn: "Charts via VBA",
        desc: "Create, modify, and export charts programmatically.",
        category: "Charts",
        subtitle: "Add and configure charts without touching the UI",
        signature: "ws.Charts.Add\nws.Shapes.AddChart2(-1, xlColumnClustered)",
        descLong: "VBA can create and fully configure charts: type, data source, title, axis labels, series colors, and position. Useful for automated reporting where charts are generated fresh each run.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Charts via VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Create chart on current sheet ───────────────\nDim ws As Worksheet\nSet ws = Sheet1\n\nDim chartObj As ChartObject\nSet chartObj = ws.ChartObjects.Add( _\n    Left:=100, Top:=50, _\n    Width:=400, Height:=250)\n\nWith chartObj.Chart\n    ' Set data source\n    .SetSourceData ws.Range(\"A1:B10\")\n    \n    ' Chart type\n    .ChartType = xlColumnClustered\n    ' Other types: xlLine, xlPie, xlBarClustered,\n    '              xlAreaStacked, xlXYScatter"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Charts via VBA — common patterns you'll see in production.\n' APPROACH  - Combine Charts via VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' Title\n    .HasTitle = True\n    .ChartTitle.Text = \"Monthly Sales\"\n    \n    ' Axis labels\n    .Axes(xlCategory).HasTitle = True\n    .Axes(xlCategory).AxisTitle.Text = \"Month\"\n    .Axes(xlValue).HasTitle = True\n    .Axes(xlValue).AxisTitle.Text = \"Sales ($)\"\n    \n    ' Series color\n    .SeriesCollection(1).Interior.Color = RGB(68, 114, 196)\n    \n    ' Remove legend if single series\n    .HasLegend = False"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Charts via VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Remove gridlines\n    .Axes(xlValue).MajorGridlines.Delete\nEnd With\n\n' ── Export chart as image ─────────────────────────\nchartObj.Chart.Export \"C:\\Output\\chart.png\"\n\n' ── Delete all charts ─────────────────────────────\nDim co As ChartObject\nFor Each co In ws.ChartObjects\n    co.Delete\nNext co"
                  }
        ],
        tips: [
                  "Record a macro while creating a chart manually — it generates all the VBA you need",
                  "`.Export` supports PNG, JPG, GIF — use for automated report image generation",
                  "ChartObjects is the container on a worksheet; .Chart is the actual chart inside",
                  "Use `xlSheet` chart type to create a chart on its own sheet: `ws.Charts.Add`"
        ],
        mistake: "Trying to set chart properties before setting the data source. Set SetSourceData first — many properties (like series count) depend on having data loaded.",
        shorthand: {
          verbose: "Dim chartObj As ChartObject\nSet chartObj = ws.ChartObjects.Add(Left:=100, Top:=50, Width:=400, Height:=250)\nWith chartObj.Chart\n    .SetSourceData ws.Range(\"A1:B10\")\n    .ChartType = xlColumnClustered\n    .HasTitle = True\n    .ChartTitle.Text = \"Sales\"\nEnd With",
          concise: "With ws.ChartObjects.Add(100, 50, 400, 250).Chart\n    .SetSourceData ws.Range(\"A1:B10\") : .ChartType = xlColumnClustered\n    .HasTitle = True : .ChartTitle.Text = \"Sales\"\nEnd With",
        },
      },
      {
        id: "excel-tables-vba",
        fn: "Excel Tables (ListObjects) in VBA",
        desc: "Work with structured Table objects programmatically.",
        category: "Tables",
        subtitle: "Reference and manipulate Excel Tables via ListObject",
        signature: "ws.ListObjects(\"TableName\")\nlo.ListRows.Add\nlo.DataBodyRange",
        descLong: "Excel Tables (Insert > Table) are ListObject objects in VBA. They have named columns, auto-expanding ranges, and structured references. Always use Tables instead of plain ranges for data that grows — they auto-expand formulas and references.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Excel Tables (ListObjects) in VBA — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Reference a table ────────────────────────────\nDim lo As ListObject\nSet lo = Sheet1.ListObjects(\"SalesTable\")\n\n' ── Useful properties ────────────────────────────\nlo.Name                  ' \"SalesTable\"\nlo.Range                 ' entire table including headers\nlo.DataBodyRange         ' data only (no header)\nlo.HeaderRowRange        ' header row\nlo.ListRows.Count        ' number of data rows\nlo.ListColumns.Count     ' number of columns\n\n' ── Reference a column ───────────────────────────\nDim col As ListColumn\nSet col = lo.ListColumns(\"Amount\")\ncol.DataBodyRange.Value  ' all values in Amount column"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Excel Tables (ListObjects) in VBA — common patterns you'll see in production.\n// APPROACH  - Combine Excel Tables (ListObjects) in VBA with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Add a row ────────────────────────────────────\nDim newRow As ListRow\nSet newRow = lo.ListRows.Add\nnewRow.Range(1, 1).Value = \"E004\"\nnewRow.Range(1, 2).Value = \"Dave\"\nnewRow.Range(1, 3).Value = 75000\n\n' ── Delete a row ─────────────────────────────────\nlo.ListRows(3).Delete\n\n' ── Filter table ─────────────────────────────────\nlo.Range.AutoFilter Field:=2, Criteria1:=\"IT\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Excel Tables (ListObjects) in VBA — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Create a table from range ─────────────────────\nDim newTable As ListObject\nSet newTable = ws.ListObjects.Add( _\n    SourceType:=xlSrcRange, _\n    Source:=ws.Range(\"A1:D10\"), _\n    XlListObjectHasHeaders:=xlYes)\nnewTable.Name = \"EmployeeTable\"\nnewTable.TableStyle = \"TableStyleMedium9\""
                  }
        ],
        tips: [
                  "Structured references work in VBA: `lo.ListColumns(\"Amount\").DataBodyRange`",
                  "Tables auto-expand when you add rows with `ListRows.Add` — no need to resize formulas",
                  "Use `lo.DataBodyRange.ClearContents` to clear data while keeping the table structure",
                  "Reference columns by name not number — column names are stable even if reordered"
        ],
        mistake: "Referencing table columns by index number (lo.ListColumns(3)). If columns are reordered, index 3 is now different. Use name: lo.ListColumns(\"Amount\").",
        shorthand: {
          verbose: "Dim lo As ListObject\nSet lo = Sheet1.ListObjects(\"SalesTable\")\nDim newRow As ListRow\nSet newRow = lo.ListRows.Add\nnewRow.Range(1, 1).Value = \"E004\"\nnewRow.Range(1, 2).Value = \"Dave\"",
          concise: "With Sheet1.ListObjects(\"SalesTable\").ListRows.Add.Range\n    .Cells(1, 1) = \"E004\" : .Cells(1, 2) = \"Dave\"\nEnd With",
        },
      },
      {
        id: "vba-pivottable",
        fn: "PivotTables in VBA",
        desc: "Create and refresh PivotTables programmatically.",
        category: "PivotTable",
        subtitle: "Build and configure PivotTables without the UI",
        signature: "wb.PivotCaches.Create\npt.PivotFields(\"Field\").Orientation = xlRowField",
        descLong: "VBA can create PivotTables from scratch or modify existing ones. The workflow: create a PivotCache from the data source, then create a PivotTable from that cache, then add fields. Most commonly used to auto-refresh or auto-configure pivots in reports.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of PivotTables in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Refresh all PivotTables ──────────────────────\nDim pt As PivotTable\nFor Each pt In Sheet2.PivotTables\n    pt.RefreshTable\nNext pt\nThisWorkbook.RefreshAll  ' refresh everything including PQ\n\n' ── Create PivotTable from scratch ───────────────\nDim pc As PivotCache\nSet pc = ThisWorkbook.PivotCaches.Create( _\n    SourceType:=xlDatabase, _\n    SourceData:=Sheet1.ListObjects(\"SalesTable\").Range)\n\nDim ptSheet As Worksheet\nSet ptSheet = ThisWorkbook.Sheets.Add\nptSheet.Name = \"PivotReport\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of PivotTables in VBA — common patterns you'll see in production.\n' APPROACH  - Combine PivotTables in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nSet pt = pc.CreatePivotTable( _\n    TableDestination:=ptSheet.Range(\"A3\"), _\n    TableName:=\"SalesPivot\")\n\n' ── Add fields ───────────────────────────────────\nWith pt\n    ' Row fields\n    .PivotFields(\"Region\").Orientation = xlRowField\n    .PivotFields(\"Region\").Position = 1\n    \n    ' Column fields\n    .PivotFields(\"Quarter\").Orientation = xlColumnField\n    \n    ' Value fields\n    With .PivotFields(\"Amount\")\n        .Orientation = xlDataField\n        .Function = xlSum\n        .NumberFormat = \"$#,##0\"\n        .Name = \"Total Sales\"\n    End With"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of PivotTables in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Filter field\n    .PivotFields(\"Product\").Orientation = xlPageField\nEnd With\n\n' ── Filter a field ───────────────────────────────\npt.PivotFields(\"Region\").CurrentPage = \"East\""
                  }
        ],
        tips: [
                  "Always set `SourceData` to a Table or named range — avoid hard-coded cell addresses",
                  "After refreshing data, call `pt.RefreshTable` to update the pivot",
                  "Use `pt.TableStyle2 = \"PivotStyleMedium9\"` to apply consistent pivot formatting",
                  "Set `pt.ManualUpdate = True` before adding multiple fields, then `False` to update once"
        ],
        mistake: "Not setting ManualUpdate = True before adding multiple fields. Each field addition triggers a recalculation. Adding 10 fields causes 10 recalcs — set ManualUpdate = True first, then False at the end.",
        shorthand: {
          verbose: "Dim pc As PivotCache\nSet pc = ThisWorkbook.PivotCaches.Create(SourceType:=xlDatabase, SourceData:=Sheet1.Range(\"A1:D100\"))\nDim pt As PivotTable\nSet pt = pc.CreatePivotTable(TableDestination:=Sheet2.Range(\"A3\"), TableName:=\"Pivot1\")\npt.PivotFields(\"Region\").Orientation = xlRowField",
          concise: "With ThisWorkbook.PivotCaches.Create(xlDatabase, Sheet1.Range(\"A1:D100\")).CreatePivotTable(Sheet2.Range(\"A3\"))\n    .ManualUpdate = True\n    .PivotFields(\"Region\").Orientation = xlRowField\n    .PivotFields(\"Amount\").Orientation = xlDataField\n    .ManualUpdate = False\nEnd With",
        },
      },
      {
        id: "pq-basics",
        fn: "Power Query Basics",
        desc: "Load, transform, and refresh data without VBA using Power Query.",
        category: "Power Query",
        subtitle: "ETL tool built into Excel — transform data with the M language",
        signature: "Data > Get Data > From... → Power Query Editor",
        descLong: "Power Query is Excel's built-in ETL (Extract, Transform, Load) tool. It connects to almost any data source, transforms data through a GUI, and generates M language code behind the scenes. Refreshable — re-run with one click as data changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Power Query Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Basic M query structure ──────────────────────\nlet\n    // Step 1: Connect to source\n    Source = Excel.Workbook(\n        File.Contents(\"C:\\Data\\Sales.xlsx\"),\n        null, true\n    ),"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Power Query Basics — common patterns you'll see in production.\n// APPROACH  - Combine Power Query Basics with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Step 2: Navigate to sheet\n    Sales_Sheet = Source{[Item=\"Sales\",Kind=\"Sheet\"]}[Data],"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Power Query Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Step 3: Promote headers,    Headers = Table.PromoteHeaders(Sales_Sheet,,                  [PromoteAllScalars=true]),,    \n\n    // Step 4: Change types,    TypedTable = Table.TransformColumnTypes(Headers, {,        {\"Date\", type date},,        {\"Amount\", type number},,        {\"Region\", type text},    }),,    \n\n    // Step 5: Filter rows,    Filtered = Table.SelectRows(TypedTable,,        each [Region] = \"East\" and [Amount] > 1000),,    \n\n    // Step 6: Add calculated column,    WithTax = Table.AddColumn(Filtered, \"WithTax\",,        each [Amount] * 1.1, type number),,    \n\n    // Step 7: Group and aggregate,    Grouped = Table.Group(WithTax, {\"Region\"}, {,        {\"TotalSales\", each List.Sum([Amount]), type number},,        {\"RowCount\", each Table.RowCount(_), Int64.Type},    }),in,    Grouped"
                  }
        ],
        tips: [
                  "Each step in the `let` block is a named transformation — click any step in Applied Steps to see its result",
                  "Right-click Applied Steps to rename them — clear names make debugging much easier",
                  "Use **Refresh All** (Data > Refresh All) to re-run all queries at once",
                  "M is case-sensitive: `Table.SelectRows` not `table.selectrows`"
        ],
        mistake: "Manually editing M code before understanding the step structure. Use the GUI first — it generates correct M. Edit M only for things the GUI can't do.",
        shorthand: {
          verbose: "let\n    Source = Excel.Workbook(File.Contents(\"C:\\Sales.xlsx\"), null, true),\n    Sheet = Source{[Item=\"Sales\"]}[Data],\n    Headers = Table.PromoteHeaders(Sheet),\n    Typed = Table.TransformColumnTypes(Headers, {{\"Amount\", type number}}),\n    Filtered = Table.SelectRows(Typed, each [Amount] > 1000)\nin\n    Filtered",
          concise: "let\n    Source = Excel.Workbook(File.Contents(\"C:\\Sales.xlsx\"), null, true){[Item=\"Sales\"]}[Data],\n    Typed = Table.PromoteHeaders(Source)\n            |> Table.TransformColumnTypes(_, {{\"Amount\", type number}})\nin\n    Table.SelectRows(Typed, each [Amount] > 1000)",
        },
      },
      {
        id: "pq-common-transforms",
        fn: "Common PQ Transforms",
        desc: "Most-used Power Query transformations: filter, merge, pivot, unpivot.",
        category: "Power Query",
        subtitle: "Filter rows, join tables, reshape data, add columns",
        signature: "Table.SelectRows | Table.Join | Table.Pivot | Table.Unpivot",
        descLong: "Power Query's most powerful transforms include merging tables (like SQL JOINs), pivoting/unpivoting to reshape data, and adding custom columns with M expressions. All accessible via the GUI but expressible in M for automation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Common PQ Transforms — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Filter rows ──────────────────────────────────\nTable.SelectRows(Source, each [Dept] = \"IT\")\nTable.SelectRows(Source, each [Amount] > 1000\n                         and [Status] = \"Active\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Common PQ Transforms — common patterns you'll see in production.\n// APPROACH  - Combine Common PQ Transforms with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// ── Remove / keep columns ────────────────────────\nTable.RemoveColumns(Source, {\"TempCol\",\"Notes\"})\nTable.SelectColumns(Source, {\"Name\",\"Dept\",\"Salary\"})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Common PQ Transforms — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// ── Rename columns ────────────────────────────────,Table.RenameColumns(Source, {,    {\"OldName\", \"NewName\"},,    {\"emp_id\", \"EmployeeID\"},}),\n\n// ── Add custom column ─────────────────────────────,Table.AddColumn(Source, \"FullName\",,    each [FirstName] & \" \" & [LastName], type text),,Table.AddColumn(Source, \"Bonus\",,    each if [Score] >= 90 then [Salary]*0.15,         else [Salary]*0.05, type number),\n\n// ── Merge (JOIN) tables ───────────────────────────,Table.NestedJoin(,    Employees, {\"DeptID\"},     // left table, left key,    Departments, {\"ID\"},       // right table, right key,    \"DeptData\",                // new column name,    JoinKind.LeftOuter         // join type,),// Then expand: Table.ExpandTableColumn(...),\n\n// ── Unpivot (wide → long) ─────────────────────────,Table.Unpivot(Source,,    {\"Q1\",\"Q2\",\"Q3\",\"Q4\"},   // columns to unpivot,    \"Quarter\", \"Sales\"         // new col names,),\n\n// ── Group By ──────────────────────────────────────,Table.Group(Source, {\"Region\"}, {,    {\"Total\", each List.Sum([Sales]), type number},})"
                  }
        ],
        tips: [
                  "Merge = JOIN: LeftOuter, RightOuter, FullOuter, Inner, LeftAnti, RightAnti",
                  "Unpivot is the most powerful reshape — converts wide pivoted data to analysis-ready long format",
                  "Custom columns use `each` keyword — `[ColumnName]` references current row's value",
                  "Use `Table.Buffer()` to cache a frequently-referenced table and speed up joins"
        ],
        mistake: "Merging before filtering. Always filter tables to only needed rows/columns BEFORE merging — it dramatically improves performance on large datasets.",
        shorthand: {
          verbose: "let\n    Source = ...,\n    Merged = Table.NestedJoin(Source, {\"ID\"}, Other, {\"ID\"}, \"Other\"),\n    Expanded = Table.ExpandTableColumn(Merged, \"Other\", {\"Name\"}),\n    Filtered = Table.SelectRows(Expanded, each [Status] = \"Active\")\nin\n    Filtered",
          concise: "let\n    Filtered = Table.SelectRows(Source, each [Status] = \"Active\"),\n    Merged = Table.NestedJoin(Filtered, {\"ID\"}, Other, {\"ID\"}, \"Other\")\nin\n    Table.ExpandTableColumn(Merged, \"Other\", {\"Name\"})",
        },
      },
      {
        id: "flash-fill-text-to-cols",
        fn: "Flash Fill / Text to Columns / Remove Duplicates",
        desc: "Built-in data cleaning tools in Excel 2021/M365.",
        category: "Data Tools",
        subtitle: "Pattern-based fill, splitting, and deduplication",
        signature: "Ctrl+E (Flash Fill)\nData → Text to Columns\nData → Remove Duplicates",
        descLong: "Flash Fill detects patterns in adjacent data and fills automatically — great for parsing names, phone numbers, and codes. Text to Columns splits delimited or fixed-width data. Remove Duplicates deduplicates rows based on selected columns. All also accessible via VBA.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Flash Fill / Text to Columns / Remove Duplicates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Flash Fill (Ctrl+E) ──────────────────────────────────\n│ A (source)         │ B (Flash Fill result) │\n│ Alice Smith        │ Alice         ← type first example │\n│ Bob Jones          │ Bob           ← Ctrl+E fills rest  │\n│ Carol Williams     │ Carol                             │\n\nOther Flash Fill patterns:\n│ A               │ B (typed) │ B (Flash Filled)  │\n│ (555) 867-5309  │ 5558675309│ ← strips formatting│\n│ alice@corp.com  │ alice     │ ← extracts username│\n│ 2024-01-15      │ Jan-2024  │ ← reformats date  │"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Flash Fill / Text to Columns / Remove Duplicates — common patterns you'll see in production.\n// APPROACH  - Combine Flash Fill / Text to Columns / Remove Duplicates with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Text to Columns (VBA) ────────────────────────────────\nws.Range(\"A2:A100\").TextToColumns _\n    Destination:=ws.Range(\"A2\"), _\n    DataType:=xlDelimited, _\n    Comma:=True, _\n    FieldInfo:=Array(Array(1, xlTextFormat), _\n                     Array(2, xlGeneralFormat))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Flash Fill / Text to Columns / Remove Duplicates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Remove Duplicates (VBA) ──────────────────────────────,' Remove dupes based on columns 1 and 2:,ws.Range(\"A1:E100\").RemoveDuplicates _,    Columns:=Array(1, 2), _,    Header:=xlYes,\n\n── Go To Special (Ctrl+G → Special) ─────────────────────,VBA equivalent — select all blank cells:,ws.UsedRange.SpecialCells(xlCellTypeBlanks).Select,,Select all formulas:,ws.UsedRange.SpecialCells(xlCellTypeFormulas).Select,,Select visible cells only (after filter):,ws.UsedRange.SpecialCells(xlCellTypeVisible).Copy"
                  }
        ],
        tips: [
                  "Flash Fill works when the pattern is clear from the first 1-2 examples — type carefully",
                  "Flash Fill is NOT dynamic — it fills fixed values. If source data changes, re-run Ctrl+E",
                  "Text to Columns permanently splits source column — backup or use TEXTSPLIT() formula instead",
                  "SpecialCells is extremely useful in VBA — xlCellTypeVisible, xlBlanks, xlFormulas, xlConstants"
        ],
        mistake: "Using Flash Fill thinking results update automatically when source changes. Flash Fill outputs static values — it's a one-time operation, not a formula. Use TEXTSPLIT or LEFT/MID formulas for dynamic splitting.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManually type examples and let Flash Fill detect pattern, or use Data > Text to Columns wizard.\n// More explicit but longer",
          concise: "Sheet > Fill > Flash Fill or Data > Text to Columns",
        },
      },
      {
        id: "what-if-analysis",
        fn: "What-If Analysis (Goal Seek / Solver / Scenarios)",
        desc: "Find inputs that produce desired outputs and model scenarios.",
        category: "Analysis",
        subtitle: "Goal Seek, Solver, Scenario Manager, Data Tables",
        signature: "Data → What-If Analysis →\nGoal Seek | Scenario Manager | Data Table",
        descLong: "Goal Seek finds an input value that produces a target result. Solver handles complex multi-variable optimization with constraints. Scenario Manager saves and compares named sets of input values. Data Tables show how changing 1 or 2 inputs affects a formula output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of What-If Analysis (Goal Seek / Solver / Scenarios) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Goal Seek (VBA) ───────────────────────────────────────\n' Find what interest rate gives $1,500 payment:\n' Cell B2 = PMT formula, target = -1500\nws.Range(\"B2\").GoalSeek _\n    Goal:=-1500, _\n    ChangingCell:=ws.Range(\"B1\")  ' interest rate cell\n\n' GUI: Data → What-If Analysis → Goal Seek\n' Set cell: B2 (the formula)\n' To value: -1500\n' By changing: B1 (the input)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of What-If Analysis (Goal Seek / Solver / Scenarios) — common patterns you'll see in production.\n// APPROACH  - Combine What-If Analysis (Goal Seek / Solver / Scenarios) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Solver (VBA) ──────────────────────────────────────────\n' Requires Solver Add-in reference (Tools → References)\nSolverReset\nSolverOk SetCell:=\"$B$12\", MaxMinVal:=1, _ ' 1=max\n    ValueOf:=0, ByChange:=\"$B$2:$B$8\"\nSolverAdd CellRef:=\"$B$9\", Relation:=1, _  ' <=\n    FormulaText:=\"$B$13\"\nSolverSolve UserFinish:=True"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of What-If Analysis (Goal Seek / Solver / Scenarios) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Data Table (1-variable) ───────────────────────────────,│        │ B          │  C (formula header) │,│ Rate   │ Payment    │                     │,│ 5%     │ [formula]  │  header = B2 (PMT)  │,│ 5.5%   │            │  col input = rates  │,│ 6%     │            │  row input = none   │,│ 6.5%   │            │                     │,│        │            │                     │,Select B2:C6 → Data → What-If → Data Table,Column input cell: rate cell (B1),\n\n── Scenario Manager (VBA) ───────────────────────────────,ws.Scenarios.Add \"Optimistic\", _,    ChangingCells:=ws.Range(\"B1:B3\"), _,    Values:=Array(0.05, 500000, 30),ws.Scenarios.Add \"Pessimistic\", _,    ChangingCells:=ws.Range(\"B1:B3\"), _,    Values:=Array(0.08, 400000, 20)"
                  }
        ],
        tips: [
                  "Goal Seek only works with one changing cell — use Solver for multi-variable optimization",
                  "Data Tables recalculate on every workbook change (they're volatile) — can slow large models",
                  "Scenario Manager summary creates a formatted report sheet — great for presentations",
                  "Solver requires the Solver Add-in: File → Options → Add-ins → Manage Excel Add-ins → Solver"
        ],
        mistake: "Using Goal Seek when Solver is needed. Goal Seek changes only ONE cell. If you need to optimize across multiple inputs or have constraints, you need Solver.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManually change values and observe results; create multiple worksheet copies for different scenarios.\n// More explicit but longer",
          concise: "Data > What-If Analysis > Data Table or Goal Seek",
        },
      },
      {
        id: "excel-shortcuts",
        fn: "Essential Excel Shortcuts",
        desc: "The most important keyboard shortcuts for power users.",
        category: "Productivity",
        subtitle: "Navigation, selection, formatting, and formula shortcuts",
        signature: "Ctrl+Shift+L | Ctrl+T | Ctrl+1 | Alt+= | F4",
        descLong: "Mastering Excel keyboard shortcuts dramatically increases productivity. These are the highest-ROI shortcuts across navigation, selection, formatting, formulas, and data management in Excel 2021/M365.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Essential Excel Shortcuts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Navigation ────────────────────────────────────────────\nCtrl+End          Last used cell in sheet\nCtrl+Home         Cell A1\nCtrl+Arrow        Jump to edge of data block\nCtrl+PgDn/PgUp    Next / previous sheet\nCtrl+F            Find\nCtrl+H            Find & Replace"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Essential Excel Shortcuts — common patterns you'll see in production.\n// APPROACH  - Combine Essential Excel Shortcuts with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Selection ─────────────────────────────────────────────\nCtrl+Shift+End    Select to last used cell\nCtrl+Shift+Arrow  Extend selection to edge of data\nCtrl+A            Select all (twice for whole sheet)\nCtrl+Space        Select entire column\nShift+Space       Select entire row"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Essential Excel Shortcuts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Formulas ──────────────────────────────────────────────,F2                Edit cell / toggle edit mode,F4                Toggle absolute/relative reference ($),Alt+=             AutoSum,Ctrl+`            Toggle formula view,Ctrl+[            Go to formula precedents,Ctrl+Shift+Enter  CSE array formula (legacy),Ctrl+F3           Name Manager,F3                Paste Name in formula,\n\n── Formatting ────────────────────────────────────────────,Ctrl+1            Format Cells dialog,Ctrl+B/I/U        Bold / Italic / Underline,Alt+H+H           Cell background color,Alt+H+FC          Font color,Ctrl+Shift+$      Currency format,Ctrl+Shift+%      Percentage format,Ctrl+Shift+#      Date format,\n\n── Data ──────────────────────────────────────────────────,Ctrl+T            Create Table,Ctrl+Shift+L      Toggle AutoFilter,Alt+D+F+F         Advanced Filter (legacy),Ctrl+E            Flash Fill,Alt+A+M           Remove Duplicates"
                  }
        ],
        tips: [
                  "**F4** is your most-used formula shortcut — toggles $A$1 → $A1 → A$1 → A1 cycling",
                  "**Ctrl+`** (backtick) shows all formulas at once — essential for auditing a workbook",
                  "**Ctrl+[** jumps to precedent cells — trace where formula inputs come from",
                  "Alt key sequences spell out the ribbon path — Alt+H+O+I = AutoFit columns (Home → Format → AutoFit)"
        ],
        mistake: "Manually typing $ signs in formulas for absolute references. Press F4 while the cursor is on a cell reference inside the formula bar to cycle through all four reference types instantly.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCtrl+Home (go home), Ctrl+End (go end), Ctrl+Left/Right (navigate), Ctrl+Shift+End (select all), Ctrl+1 (format), F2 (edit), Ctrl+` (formula view), Ctrl+H (find & replace)\n// More explicit but longer",
          concise: "Ctrl+End | Ctrl+Home | Ctrl+Shift+End | F4 (toggle $) | Ctrl+` (toggle formula view) | Alt+= (AutoSum) | Ctrl+T (table) | Ctrl+Shift+L (filter)",
        },
      },
      {
        id: "spill-range-reference",
        fn: "Spill Range Operator (#)",
        desc: "Reference an entire spill range dynamically with the # operator.",
        category: "Dynamic Array",
        subtitle: "Reference and work with spilled array results",
        signature: "=A1#  (references entire spill from A1)\n=COUNTA(A1#)\n=SUM(A1#)",
        descLong: "When a dynamic array formula spills results, the # operator references the entire spill range from its anchor cell — even as the spill grows or shrinks. This makes downstream formulas self-adjusting when data changes. Essential when chaining dynamic array functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Spill Range Operator (#) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n── Spill range setup ────────────────────────────────────\nA1: =UNIQUE(Data!B:B)    ← spills unique depts downward\nA2: IT                   │ These cells are\nA3: HR                   │ controlled by the\nA4: Finance              │ spill formula in A1\nA5: Operations           │"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Spill Range Operator (#) — common patterns you'll see in production.\n// APPROACH  - Combine Spill Range Operator (#) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n── Reference the entire spill ──────────────────────────\n=COUNTA(A1#)             → 4  (count all spill items)\n=SUM(A1#)                → numeric spills only\n=SORT(A1#)               → sort the spill results\n=VSTACK(A1#, E1#)        → combine two spills"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Spill Range Operator (#) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n── Chain dynamic functions ──────────────────────────────,A1: =FILTER(Data, Data[Dept]=\"IT\"),G1: =SORT(A1#, 3, -1)            ← sort filtered results,M1: =CHOOSECOLS(G1#, 1, 2, 5)   ← pick cols from sorted,\n\n── Spill with XLOOKUP ───────────────────────────────────,A1: =UNIQUE(Orders[CustomerID])  ← unique customer IDs,B1: =XLOOKUP(A1#,                ← lookup each one,       Customers[ID],            ← lookup array,       Customers[Name])          ← return array,── Both A1# and B1 spill together ──────────────────────,\n\n── Check for spill error ────────────────────────────────,=IF(ISERROR(A1#), \"Spill blocked!\", A1#),\n\n── #SPILL! error causes ─────────────────────────────────,── Cells in the spill range are not empty,── Fix: clear the cells below/right of the formula"
                  }
        ],
        tips: [
                  "The # operator is dynamic — as the spill grows (more data), A1# automatically includes new rows",
                  "#SPILL! error means something is in the way of the spill — clear cells in the output area",
                  "Use A1# as a Table's data source for a self-updating named range alternative",
                  "Entire spill can be used in SUMPRODUCT, COUNTIF, XLOOKUP — anywhere a range is accepted"
        ],
        mistake: "Hard-coding the range reference instead of using #. If UNIQUE(A:A) spills 5 items today and 8 tomorrow, =SUM(B1:B5) misses the new rows. Use =SUM(B1#) instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUM(B1:B100) (hardcoded range); if more data, formula breaks or misses new rows. Must manually update range.\n// More explicit but longer",
          concise: "A1: =UNIQUE(Data[Dept])\nB1: =XLOOKUP(A1#, ...) (uses # to auto-reference all spill)",
        },
      },
      {
        id: "office-scripts",
        fn: "Office Scripts (M365 Web)",
        desc: "TypeScript-based automation for Excel on the web — shareable and Teams-integrated.",
        category: "Automation",
        subtitle: "Modern alternative to VBA for cloud and Power Automate workflows",
        signature: "function main(workbook: ExcelScript.Workbook) { }",
        descLong: "Office Scripts is Microsoft's modern automation for Excel on the web (M365). Written in TypeScript, they run in any browser, integrate natively with Power Automate, and can be shared across an organization. They are the future of Excel automation alongside VBA for desktop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Office Scripts (M365 Web) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n// ── Basic Office Script structure ────────────────\nfunction main(workbook: ExcelScript.Workbook) {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Office Scripts (M365 Web) — common patterns you'll see in production.\n// APPROACH  - Combine Office Scripts (M365 Web) with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n// Get worksheet\n  const sheet = workbook.getActiveWorksheet();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Office Scripts (M365 Web) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n// Read a value,  const val = sheet.getRange(\"B2\").getValue();,  console.log(`B2 value: ${val}`);,\n\n  // Write values,  sheet.getRange(\"A1\").setValue(\"Hello from Scripts!\");,\n\n  // Get used range,  const usedRange = sheet.getUsedRange();,  const values = usedRange.getValues(); // 2D array,\n\n  // Loop and process,  for (let i = 0; i < values.length; i++) {,    if (values[i][1] === \"IT\") {,      sheet.getRange(`C${i+1}`).setValue(\"Tech Dept\");,    },  },\n\n  // Format a range,  const header = sheet.getRange(\"A1:E1\");,  header.getFormat().getFill().setColor(\"#4472C4\");,  header.getFormat().getFont().setBold(true);,  header.getFormat().getFont().setColor(\"#FFFFFF\");,\n\n  // Create a table,  const table = sheet.addTable(usedRange, true);,  table.setName(\"DataTable\");,},\n\n// ── Power Automate integration ────────────────────,// Scripts can accept parameters and return values:,function main(,  workbook: ExcelScript.Workbook,,  reportDate: string,      // passed from Power Automate,  threshold: number,): string {                // return value back to Flow,  // ... process ...,  return \"Report generated for \" + reportDate;,}"
                  }
        ],
        tips: [
                  "Office Scripts record actions like a macro recorder but output TypeScript — great learning tool",
                  "Scripts can be called from Power Automate flows — enabling scheduled or trigger-based automation",
                  "Scripts run in the browser without needing Excel desktop installed",
                  "TypeScript catch: `getValues()` returns `(string | number | boolean)[][]` — use type assertions carefully"
        ],
        mistake: "Trying to use VBA code directly in Office Scripts. They are completely different languages. Office Scripts use Excel's JavaScript object model (ExcelScript namespace), not VBA's COM objects.",
        shorthand: {
          verbose: "function main(workbook: ExcelScript.Workbook) {\n  const sheet = workbook.getActiveWorksheet();\n  const val = sheet.getRange(\"B2\").getValue();\n  console.log(val);\n  const values = sheet.getUsedRange().getValues();\n  for (let i = 0; i < values.length; i++) {\n    sheet.getRange(`C${i+1}`).setValue(values[i][0]);\n  }\n}",
          concise: "async function main(workbook: ExcelScript.Workbook) {\n  const sheet = workbook.getActiveWorksheet();\n  const values = sheet.getUsedRange().getValues();\n  values.forEach((row, i) => sheet.getRange(`C${i+1}`).setValue(row[0]));\n}",
        },
      },
    ],
  },

  // ── Section 6: VBA Fundamentals ─────────────────────────────────────────
  {
    id: "vba-fundamentals-core",
    title: "VBA Fundamentals",
    entries: [
      {
        id: "vba-sub-function",
        fn: "Sub / Function",
        desc: "Define procedures and reusable functions in VBA.",
        category: "VBA Core",
        subtitle: "The building blocks of all VBA code",
        signature: "Sub ProcName([params])\n  ' code\nEnd Sub\n\nFunction FuncName([params]) As ReturnType\n  FuncName = result\nEnd Function",
        descLong: "Sub procedures perform actions and cannot return values. Functions return a value and can be called from worksheet cells (UDFs). Both can accept parameters. Use Private to restrict scope to the current module.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Sub / Function — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Basic Sub ──────────────────────────────────\nSub HelloWorld()\n    MsgBox \"Hello, World!\"\nEnd Sub\n\n' ── Sub with parameters ─────────────────────────\nSub FormatRange(ws As Worksheet, rng As Range, _\n                color As Long)\n    rng.Interior.Color = color\n    rng.Font.Bold = True\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Sub / Function — common patterns you'll see in production.\n' APPROACH  - Combine Sub / Function with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' Call it:\nCall FormatRange(ActiveSheet, Range(\"A1:D10\"), vbYellow)\n\n' ── Function (UDF) ───────────────────────────────\nFunction TaxAmount(income As Double, _\n                   rate As Double) As Double\n    If income > 50000 Then\n        TaxAmount = income * rate\n    Else\n        TaxAmount = income * rate * 0.8\n    End If\nEnd Function"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Sub / Function — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Use in worksheet cell:\n' =TaxAmount(A2, 0.22)\n\n' ── Private Sub (module scope only) ─────────────\nPrivate Sub Helper()\n    ' Cannot be called from other modules\nEnd Sub"
                  }
        ],
        tips: [
                  "Functions called from worksheets (UDFs) cannot modify cells — only return values",
                  "Use `Option Explicit` at top of every module to force variable declaration",
                  "ByRef (default) passes variables by reference — changes affect caller. ByVal passes a copy",
                  "Press F5 to run a Sub, F8 to step through line by line"
        ],
        mistake: "Forgetting `Option Explicit`. Without it, a typo in a variable name creates a new variable silently set to 0/empty — extremely hard to debug.",
        shorthand: {
          verbose: "Sub MyMacro()\n  MsgBox \"Hello\"\nEnd Sub\n\nFunction Calculate(x As Double) As Double\n  Calculate = x * 2\nEnd Function",
          concise: "Sub MyMacro() : MsgBox \"Hello\" : End Sub\nFunction Calculate(x As Double) As Double : Calculate = x * 2 : End Function",
        },
      },
      {
        id: "vba-variables",
        fn: "Variables & Data Types",
        desc: "Declare and use VBA variables with proper types.",
        category: "VBA Core",
        subtitle: "Dim, data types, constants, and scope",
        signature: "Dim varName As DataType\nConst CONST_NAME As Type = value",
        descLong: "VBA is optionally typed. Always declare variables with Dim and specify data types for performance and safety. Variant accepts anything but is slow. Use Long instead of Integer (avoids overflow), Double for decimals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Variables & Data Types — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nOption Explicit  ' Always include this!\n\n' ── Data Types ───────────────────────────────────\nDim i As Long           ' Integer (use Long not Integer)\nDim name As String      ' Text\nDim price As Double     ' Decimal number\nDim isActive As Boolean ' True/False\nDim startDate As Date   ' Date/time\nDim ws As Worksheet     ' Object reference\nDim rng As Range        ' Range object\nDim v As Variant        ' Any type (slow, avoid)"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Variables & Data Types — common patterns you'll see in production.\n' APPROACH  - Combine Variables & Data Types with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Constants ────────────────────────────────────\nConst TAX_RATE As Double = 0.22\nConst MAX_ROWS As Long = 100000\nConst APP_NAME As String = \"MyApp\"\n\n' ── Scope ────────────────────────────────────────\n' Inside Sub/Function: local scope\n' Module level (before any Sub): module scope\n' Global module with Public: project scope\n\nPublic gUserName As String  ' Available everywhere"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Variables & Data Types — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Multiple declaration ──────────────────────────\nDim x As Long, y As Long, z As Long\n\n' ── String operations ─────────────────────────────\nDim s As String\ns = \"Hello\" & \" \" & \"World\"  ' Concatenation\nDebug.Print Len(s)            ' 11\nDebug.Print UCase(s)          ' HELLO WORLD\nDebug.Print Left(s, 5)        ' Hello"
                  }
        ],
        tips: [
                  "Use **Long** not Integer — Integer overflows at 32,767. Long holds up to ~2 billion",
                  "**Variant** is 16 bytes; specific types are 2-8 bytes — matters in large loops",
                  "Module-level variables persist between calls in the same session; local variables reset",
                  "Use `Const` for magic numbers — `Const TAX = 0.22` not just `0.22` scattered in code"
        ],
        mistake: "Declaring `Dim x, y, z As Long` thinking all are Long. Only z is Long — x and y are Variant. Declare each on its own line or: `Dim x As Long, y As Long, z As Long`.",
        shorthand: {
          verbose: "Dim i As Long\nDim name As String\nDim price As Double\nDim isActive As Boolean\nDim ws As Worksheet",
          concise: "Dim i As Long, name As String, price As Double, isActive As Boolean\nDim ws As Worksheet",
        },
      },
      {
        id: "vba-loops",
        fn: "Loops (For / Do / For Each)",
        desc: "Repeat code with counter loops, condition loops, and collection iteration.",
        category: "VBA Core",
        subtitle: "For...Next, Do While, For Each...Next",
        signature: "For i = 1 To n [Step s]\nDo While condition\nFor Each item In collection",
        descLong: "VBA has three main loop types: For...Next (counted iteration), Do While/Until (condition-based), and For Each (collection iteration). For Each is always preferred for iterating collections like Worksheets, Ranges, and arrays.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Loops (For / Do / For Each) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── For...Next ───────────────────────────────────\nDim i As Long\nFor i = 1 To 10\n    Cells(i, 1).Value = i * 2\nNext i\n\n' Step and reverse\nFor i = 10 To 1 Step -1\n    Debug.Print i\nNext i\n\n' ── Do While ─────────────────────────────────────\nDim lastRow As Long\nlastRow = 1\nDo While Cells(lastRow, 1).Value <> \"\"\n    lastRow = lastRow + 1\nLoop"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Loops (For / Do / For Each) — common patterns you'll see in production.\n' APPROACH  - Combine Loops (For / Do / For Each) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Do Until ─────────────────────────────────────\nDo Until IsEmpty(Cells(lastRow, 1))\n    lastRow = lastRow + 1\nLoop\n\n' ── For Each — best for collections ──────────────\nDim ws As Worksheet\nFor Each ws In ThisWorkbook.Worksheets\n    ws.Cells(1,1).Value = ws.Name\nNext ws\n\nDim cell As Range\nFor Each cell In Range(\"A1:A100\")\n    If cell.Value > 100 Then\n        cell.Interior.Color = vbRed\n    End If\nNext cell"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Loops (For / Do / For Each) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Exit early ───────────────────────────────────\nFor i = 1 To 1000\n    If Cells(i,1).Value = \"STOP\" Then Exit For\nNext i"
                  }
        ],
        tips: [
                  "**For Each** is faster than indexed For loop for Range and collection iteration",
                  "Never delete rows in a forward For loop — rows shift and items are skipped. Loop backwards: `For i = lastRow To 1 Step -1`",
                  "Exit For / Exit Do breaks the loop early — use instead of complex conditions",
                  "Avoid `Do While True` infinite loops — always ensure the condition will eventually be False"
        ],
        mistake: "Deleting rows in a forward For i loop. Row 5 becomes row 4 after deletion, so the loop skips it. Always loop backwards when deleting: For i = lastRow To 1 Step -1.",
        shorthand: {
          verbose: "For i = 1 To 10\n    Cells(i, 1).Value = i * 2\nNext i\n\nDim cell As Range\nFor Each cell In Range(\"A1:A100\")\n    cell.Interior.Color = vbRed\nNext cell",
          concise: "For i = 1 To 10 : Cells(i, 1).Value = i * 2 : Next i\nFor Each cell In Range(\"A1:A100\") : cell.Interior.Color = vbRed : Next cell",
        },
      },
      {
        id: "vba-conditionals",
        fn: "If / Select Case",
        desc: "Conditional branching in VBA.",
        category: "VBA Core",
        subtitle: "Control flow with conditions and pattern matching",
        signature: "If condition Then ... ElseIf ... Else ... End If\nSelect Case expression\n  Case value: ...\nEnd Select",
        descLong: "VBA If/ElseIf/Else works like most languages. Select Case is the cleaner alternative for multiple exact comparisons against a single expression, equivalent to Excel's SWITCH function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of If / Select Case — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── If / ElseIf / Else ───────────────────────────\nDim score As Long\nscore = 85\n\nIf score >= 90 Then\n    grade = \"A\"\nElseIf score >= 80 Then\n    grade = \"B\"\nElseIf score >= 70 Then\n    grade = \"C\"\nElse\n    grade = \"F\"\nEnd If\n\n' ── Single-line If (simple cases) ────────────────\nIf IsEmpty(ActiveCell) Then Exit Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of If / Select Case — common patterns you'll see in production.\n' APPROACH  - Combine If / Select Case with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Select Case ──────────────────────────────────\nSelect Case score\n    Case 90 To 100\n        grade = \"A\"\n    Case 80 To 89\n        grade = \"B\"\n    Case 70 To 79\n        grade = \"C\"\n    Case Is < 70\n        grade = \"F\"\nEnd Select\n\n' ── Multiple values in one Case ──────────────────\nSelect Case dept\n    Case \"IT\", \"Engineering\", \"DevOps\"\n        access = \"Full\"\n    Case \"HR\", \"Finance\"\n        access = \"Restricted\"\n    Case Else\n        access = \"None\"\nEnd Select"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of If / Select Case — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Boolean logic ────────────────────────────────\nIf age >= 18 And status = \"Active\" Then\n    ' Both must be true\nEnd If\n\nIf dept = \"IT\" Or dept = \"Admin\" Then\n    ' Either can be true\nEnd If"
                  }
        ],
        tips: [
                  "Select Case is cleaner than ElseIf chains when testing one variable against many values",
                  "`Case Is > 100` uses comparison operators; `Case 1 To 10` tests ranges",
                  "Multiple values: `Case \"IT\", \"HR\", \"Finance\"` — comma-separated",
                  "Short-circuit: `If Not IsNothing(obj) And obj.Value > 0` — VBA evaluates both; wrap in nested Ifs to be safe"
        ],
        mistake: "Using `If x = True` instead of `If x`. Redundant and harder to read. `If IsActive` is identical to `If IsActive = True`.",
        shorthand: {
          verbose: "If score >= 90 Then\n    grade = \"A\"\nElseIf score >= 80 Then\n    grade = \"B\"\nElseIf score >= 70 Then\n    grade = \"C\"\nElse\n    grade = \"F\"\nEnd If",
          concise: "Select Case score\n    Case 90 To 100 : grade = \"A\"\n    Case 80 To 89 : grade = \"B\"\n    Case 70 To 79 : grade = \"C\"\n    Case Else : grade = \"F\"\nEnd Select",
        },
      },
      {
        id: "vba-range-reference",
        fn: "Range / Cells / Rows / Columns",
        desc: "Reference cells, rows, and columns in VBA.",
        category: "VBA Range",
        subtitle: "All the ways to reference cells programmatically",
        signature: "Range(\"A1\") | Range(\"A1:B10\")\nCells(row, col)\nRows(n) | Columns(n)",
        descLong: "Range uses A1-style addresses. Cells(row, col) uses numeric indices — much better for dynamic loops. Always qualify ranges with a worksheet reference to avoid acting on the wrong sheet. Rows and Columns return entire row/column objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Range / Cells / Rows / Columns — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Always qualify with worksheet! ──────────────\nDim ws As Worksheet\nSet ws = ThisWorkbook.Sheets(\"Data\")\n\n' ── Range — address style ────────────────────────\nws.Range(\"A1\").Value = \"Hello\"\nws.Range(\"A1:D10\").ClearContents\nws.Range(\"A1:A\" & lastRow).Select\n\n' ── Cells — numeric (best for loops) ────────────\nws.Cells(1, 1).Value = \"Row1Col1\"   ' A1\nws.Cells(1, 2).Value = \"Row1Col2\"   ' B1"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Range / Cells / Rows / Columns — common patterns you'll see in production.\n' APPROACH  - Combine Range / Cells / Rows / Columns with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nDim r As Long, c As Long\nFor r = 1 To 10\n    For c = 1 To 5\n        ws.Cells(r, c).Value = r * c\n    Next c\nNext r\n\n' ── Mix Range and Cells ──────────────────────────\nws.Range(ws.Cells(1,1), ws.Cells(10,4)).Interior.Color = vbYellow\n\n' ── Offset and Resize ────────────────────────────\nRange(\"A1\").Offset(1, 0)         ' one row down\nRange(\"A1\").Offset(0, 1)         ' one column right\nRange(\"A1\").Resize(10, 3)        ' expand to 10r x 3c\nRange(\"A1\").Offset(1,0).Resize(5,2) ' dynamic block"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Range / Cells / Rows / Columns — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Entire row/column ────────────────────────────\nws.Rows(1).Delete\nws.Columns(\"B\").Insert Shift:=xlToRight\nws.Rows(\"2:5\").Interior.Color = vbCyan"
                  }
        ],
        tips: [
                  "**Always** qualify: `ws.Range(\"A1\")` not just `Range(\"A1\")` — bare Range uses ActiveSheet",
                  "Use `Cells(r, c)` in loops — it's cleaner and handles dynamic column numbers",
                  "`Range(ws.Cells(r1,c1), ws.Cells(r2,c2))` is the safest way to build a dynamic range",
                  "`.CurrentRegion` returns the contiguous block around a cell — like Ctrl+Shift+*"
        ],
        mistake: "Using bare Range(\"A1\") inside a loop that changes sheets. Always qualify: ws.Range(\"A1\"). Bare Range uses whatever sheet happens to be active.",
        shorthand: {
          verbose: "ws.Range(\"A1\").Value = \"Hello\"\nws.Range(\"A1:D10\").ClearContents\nDim r As Long, c As Long\nFor r = 1 To 10\n    For c = 1 To 5\n        ws.Cells(r, c).Value = r * c\n    Next c\nNext r",
          concise: "ws.Range(\"A1\").Value = \"Hello\"\nFor r = 1 To 10\n    For c = 1 To 5 : ws.Cells(r, c).Value = r * c : Next c\nNext r",
        },
      },
      {
        id: "vba-find-lastrow",
        fn: "Find Last Row / LastCell",
        desc: "Dynamically find the last used row or column.",
        category: "VBA Range",
        subtitle: "Reliably detect the extent of your data",
        signature: "ws.Cells(ws.Rows.Count, col).End(xlUp).Row\nws.UsedRange.Rows.Count",
        descLong: "Finding the last row is one of the most common VBA tasks. The End(xlUp) method is most reliable for a specific column. UsedRange can be unreliable after deletions. Find is the most robust for sparse data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Find Last Row / LastCell — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── End(xlUp) — most common, column-specific ─────\nDim lastRow As Long\nlastRow = ws.Cells(ws.Rows.Count, \"A\").End(xlUp).Row\n\n' Explanation: start at A1048576 (very last row),\n' press Ctrl+Up — stops at last filled cell in col A\n\n' ── Last column ───────────────────────────────────\nDim lastCol As Long\nlastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Find Last Row / LastCell — common patterns you'll see in production.\n' APPROACH  - Combine Find Last Row / LastCell with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Dynamic range from row 2 to last ─────────────\nDim dataRange As Range\nSet dataRange = ws.Range(\"A2:A\" & lastRow)\n\n' ── Multi-column dynamic range ────────────────────\nSet dataRange = ws.Range(ws.Cells(2,1), ws.Cells(lastRow, lastCol))\n\n' ── Find method (most robust) ─────────────────────\nDim lastCell As Range\nSet lastCell = ws.Cells.Find(\"*\", SearchOrder:=xlByRows, _\n                             SearchDirection:=xlPrevious)\nIf Not lastCell Is Nothing Then\n    lastRow = lastCell.Row\nEnd If"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Find Last Row / LastCell — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Avoid: UsedRange can be stale after deletions ─\n' lastRow = ws.UsedRange.Rows.Count  ← unreliable!"
                  }
        ],
        tips: [
                  "Column `\"A\"` in `Cells(Rows.Count, \"A\")` is cleaner than column number 1",
                  "If col A might have gaps, use the column with the most complete data",
                  "Find with `\"*\"` finds the last cell with ANY content — most reliable for sparse data",
                  "After deleting rows/columns, UsedRange.Rows.Count may still report the old size"
        ],
        mistake: "Using `ws.UsedRange.Rows.Count` for last row after deletions. Excel doesn't always reset UsedRange immediately. Use End(xlUp) or Find instead.",
        shorthand: {
          verbose: "Dim lastRow As Long\nlastRow = ws.UsedRange.Rows.Count  ' unreliable after deletions\nDim dataRange As Range\nSet dataRange = ws.Range(\"A2:A\" & lastRow)",
          concise: "lastRow = ws.Cells(ws.Rows.Count, \"A\").End(xlUp).Row\nSet dataRange = ws.Range(\"A2:A\" & lastRow)",
        },
      },
      {
        id: "vba-copy-paste",
        fn: "Copy / PasteSpecial / Value assignment",
        desc: "Copy ranges, paste special, and transfer values efficiently.",
        category: "VBA Range",
        subtitle: "Move and duplicate data between ranges",
        signature: "range.Copy destination\nrange.PasteSpecial xlPasteValues\ndestRange.Value = srcRange.Value",
        descLong: "There are three ways to copy data in VBA: Copy/Paste (copies everything including formatting), PasteSpecial (values, formats, or formulas only), and direct Value assignment (fastest — bypasses clipboard entirely).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Copy / PasteSpecial / Value assignment — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Direct value copy — FASTEST, no clipboard ────\nws2.Range(\"A1:D100\").Value = ws1.Range(\"A1:D100\").Value\n\n' ── Copy with formatting ──────────────────────────\nws1.Range(\"A1:D100\").Copy ws2.Range(\"A1\")\n\n' ── PasteSpecial — values only ───────────────────\nws1.Range(\"A1:D100\").Copy\nws2.Range(\"A1\").PasteSpecial xlPasteValues\nApplication.CutCopyMode = False  ' clear clipboard border"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Copy / PasteSpecial / Value assignment — common patterns you'll see in production.\n' APPROACH  - Combine Copy / PasteSpecial / Value assignment with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── PasteSpecial options ─────────────────────────\n' xlPasteValues         - values only (no formulas)\n' xlPasteFormats        - formats only\n' xlPasteFormulas       - formulas only\n' xlPasteColumnWidths   - column widths\n' xlPasteAll            - everything\n\n' ── Copy entire sheet ─────────────────────────────\nws1.Copy After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Copy / PasteSpecial / Value assignment — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Move/Cut ──────────────────────────────────────\nws1.Range(\"A1:A10\").Cut ws2.Range(\"A1\")\n\n' ── AutoFill formula down ─────────────────────────\nWith ws.Range(\"B2\")\n    .Formula = \"=A2*1.1\"\n    .AutoFill Destination:=ws.Range(\"B2:B\" & lastRow)\nEnd With"
                  }
        ],
        tips: [
                  "**Direct value assignment** `dest.Value = src.Value` is 10x faster than Copy/Paste for large ranges",
                  "Always clear clipboard after PasteSpecial: `Application.CutCopyMode = False`",
                  "Copying formulas with relative references adjusts them automatically — same as manual copy",
                  "Use `.Value2` instead of `.Value` for pure numbers — avoids date/currency conversion overhead"
        ],
        mistake: "Selecting cells before copying: `Range(\"A1\").Select: Selection.Copy`. Never use Select/Activate in VBA — it's slow and fragile. Work with objects directly.",
        shorthand: {
          verbose: "ws1.Range(\"A1:D100\").Copy\nws2.Range(\"A1\").PasteSpecial xlPasteValues\nApplication.CutCopyMode = False",
          concise: "ws2.Range(\"A1:D100\").Value = ws1.Range(\"A1:D100\").Value",
        },
      },
      {
        id: "vba-sort-filter",
        fn: "Sort / AutoFilter in VBA",
        desc: "Sort ranges and apply/manipulate AutoFilters programmatically.",
        category: "VBA Range",
        subtitle: "Programmatic sorting and filtering",
        signature: "ws.Sort.SortFields.Add Key:=range\nws.Range.AutoFilter Field:=n, Criteria1:=\"val\"",
        descLong: "VBA can sort using the Sort object (modern, recommended) or the older Range.Sort method. AutoFilter applies standard Excel filters programmatically — useful for filtering before processing or exporting visible rows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Sort / AutoFilter in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Modern Sort (Excel 2007+) ────────────────────\nWith ws.Sort\n    .SortFields.Clear\n    .SortFields.Add Key:=ws.Range(\"C2:C100\"), _\n                    SortOn:=xlSortOnValues, _\n                    Order:=xlDescending\n    .SortFields.Add Key:=ws.Range(\"A2:A100\"), _\n                    Order:=xlAscending  ' secondary\n    .SetRange ws.Range(\"A1:E100\")\n    .Header = xlYes\n    .Apply\nEnd With"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Sort / AutoFilter in VBA — common patterns you'll see in production.\n' APPROACH  - Combine Sort / AutoFilter in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Legacy Range.Sort (simpler for one key) ───────\nws.Range(\"A1:E100\").Sort _\n    Key1:=ws.Range(\"C1\"), Order1:=xlDescending, _\n    Header:=xlYes\n\n' ── AutoFilter ───────────────────────────────────\n' Apply filter\nws.Range(\"A1\").AutoFilter Field:=2, Criteria1:=\"IT\"\n\n' Multiple criteria\nws.Range(\"A1\").AutoFilter Field:=3, _\n    Criteria1:=\">=80000\", Operator:=xlAnd, _\n    Criteria2:=\"<=120000\""
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Sort / AutoFilter in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Clear filter on one field\nws.Range(\"A1\").AutoFilter Field:=2\n\n' Turn off AutoFilter entirely\nIf ws.AutoFilterMode Then ws.AutoFilterMode = False\n\n' Copy visible (filtered) rows only\nws.UsedRange.SpecialCells(xlCellTypeVisible).Copy ws2.Range(\"A1\")"
                  }
        ],
        tips: [
                  "Always clear SortFields before adding new ones: `.SortFields.Clear`",
                  "`SpecialCells(xlCellTypeVisible)` after AutoFilter copies only visible rows",
                  "Check if AutoFilter is on: `ws.AutoFilterMode` before toggling",
                  "Turn off screen updating during long filter/sort operations: `Application.ScreenUpdating = False`"
        ],
        mistake: "Not clearing SortFields before adding new ones. Previous sort fields stack up and apply in unexpected orders. Always call .SortFields.Clear first.",
        shorthand: {
          verbose: "With ws.Sort\n    .SortFields.Clear\n    .SortFields.Add Key:=ws.Range(\"C2:C100\"), Order:=xlDescending\n    .SetRange ws.Range(\"A1:E100\")\n    .Header = xlYes\n    .Apply\nEnd With",
          concise: "With ws.Sort : .SortFields.Clear : .SortFields.Add Key:=ws.Range(\"C2:C100\"), Order:=xlDescending : .SetRange ws.Range(\"A1:E100\") : .Header = xlYes : .Apply : End With",
        },
      },
    ],
  },

  // ── Section 7: VBA Workbook & Error Handling ─────────────────────────────────────────
  {
    id: "vba-workbook-errors",
    title: "VBA Workbook & Error Handling",
    entries: [
      {
        id: "vba-workbook-ops",
        fn: "Workbook operations",
        desc: "Open, save, close, and create workbooks in VBA.",
        category: "VBA Workbook",
        subtitle: "Manage workbook lifecycle programmatically",
        signature: "Workbooks.Open(filename)\nwb.Save | wb.SaveAs\nwb.Close SaveChanges:=True",
        descLong: "VBA can open, save, and close workbooks programmatically. Use ThisWorkbook to reference the workbook containing the code. Use ActiveWorkbook only when you explicitly want the focused workbook. Always assign to a variable when opening.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Workbook operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Open a workbook ──────────────────────────────\nDim wb As Workbook\nSet wb = Workbooks.Open(\"C:\\Data\\Report.xlsx\")\n\n' Open read-only\nSet wb = Workbooks.Open(\"C:\\Data\\Report.xlsx\", ReadOnly:=True)\n\n' ── Create new ───────────────────────────────────\nSet wb = Workbooks.Add\n\n' ── Save operations ──────────────────────────────\nThisWorkbook.Save                              ' Save in place\nThisWorkbook.SaveAs \"C:\\Output\\Report.xlsx\"\nwb.SaveAs Filename:=\"C:\\Out.xlsx\", _\n          FileFormat:=xlOpenXMLWorkbook       ' .xlsx\nwb.SaveAs Filename:=\"C:\\Out.xlsm\", _\n          FileFormat:=xlOpenXMLWorkbookMacroEnabled  ' .xlsm"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Workbook operations — common patterns you'll see in production.\n' APPROACH  - Combine Workbook operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Check if workbook is open ────────────────────\nFunction IsWorkbookOpen(name As String) As Boolean\n    Dim wb As Workbook\n    On Error Resume Next\n    Set wb = Workbooks(name)\n    On Error GoTo 0\n    IsWorkbookOpen = Not wb Is Nothing\nEnd Function\n\n' ── Close ────────────────────────────────────────\nwb.Close SaveChanges:=True\nwb.Close SaveChanges:=False  ' discard changes"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Workbook operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Loop all open workbooks ───────────────────────\nDim w As Workbook\nFor Each w In Workbooks\n    Debug.Print w.Name\nNext w"
                  }
        ],
        tips: [
                  "Always use `ThisWorkbook` (the code's workbook) not `ActiveWorkbook` in production code",
                  "Assign opened workbooks to a variable: `Set wb = Workbooks.Open(...)` — don't rely on ActiveWorkbook",
                  "Use FileFormat constants, not numeric values: `xlOpenXMLWorkbook` = xlsx, `xlCSV` = csv",
                  "Suppress Save dialog: `wb.Close SaveChanges:=False` or set `Application.DisplayAlerts = False`"
        ],
        mistake: "Using ActiveWorkbook.Save in a macro that might run while another workbook is focused. Always use ThisWorkbook or a specific workbook variable.",
        shorthand: {
          verbose: "Dim wb As Workbook\nSet wb = Workbooks.Open(\"C:\\Data\\Report.xlsx\")\nwb.Save\nwb.Close SaveChanges:=True",
          concise: "Set wb = Workbooks.Open(\"C:\\Data\\Report.xlsx\") : wb.SaveAs \"C:\\Out.xlsx\" : wb.Close",
        },
      },
      {
        id: "vba-worksheet-ops",
        fn: "Worksheet operations",
        desc: "Add, delete, rename, hide, and navigate worksheets.",
        category: "VBA Worksheet",
        subtitle: "Create and manage worksheet objects",
        signature: "Worksheets.Add\nws.Name = \"NewName\"\nws.Visible = xlSheetHidden",
        descLong: "Worksheets are the primary container for data. Always reference them by codename or Sheets() index to be safe. The codename (VBAProject pane, not the tab name) is immune to user renaming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Worksheet operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Reference a sheet ───────────────────────────\nDim ws As Worksheet\nSet ws = ThisWorkbook.Sheets(\"DataSheet\")     ' by tab name\nSet ws = ThisWorkbook.Sheets(1)               ' by index\nSet ws = Sheet1  ' by CodeName — immune to renaming!\n\n' ── Add sheet ────────────────────────────────────\nSet ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))\nws.Name = \"NewReport\"\n\n' ── Check if sheet exists ────────────────────────\nFunction SheetExists(name As String) As Boolean\n    Dim ws As Worksheet\n    On Error Resume Next\n    Set ws = ThisWorkbook.Sheets(name)\n    On Error GoTo 0\n    SheetExists = Not ws Is Nothing\nEnd Function"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Worksheet operations — common patterns you'll see in production.\n' APPROACH  - Combine Worksheet operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Delete sheet safely ──────────────────────────\nApplication.DisplayAlerts = False\nIf SheetExists(\"OldReport\") Then _\n    ThisWorkbook.Sheets(\"OldReport\").Delete\nApplication.DisplayAlerts = True"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Worksheet operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Visibility ───────────────────────────────────\nws.Visible = xlSheetHidden       ' hidden (user can unhide)\nws.Visible = xlSheetVeryHidden   ' hidden (VBA only)\nws.Visible = xlSheetVisible\n\n' ── Clear, copy, move ────────────────────────────\nws.Cells.Clear              ' clear everything\nws.Cells.ClearContents      ' values only\nws.Copy After:=Sheets(Sheets.Count)  ' duplicate"
                  }
        ],
        tips: [
                  "Use **CodeName** (e.g., `Sheet1`) not tab name — tab names change, CodeNames don't",
                  "`xlSheetVeryHidden` cannot be unhidden by users — only via VBA or Name Box",
                  "Always check `SheetExists()` before adding a sheet with a specific name",
                  "Set DisplayAlerts = False before deleting sheets, then reset to True immediately after"
        ],
        mistake: "Referencing sheets by index number: Sheets(3). If sheets are reordered or deleted, index 3 is now a different sheet. Use tab name or CodeName.",
        shorthand: {
          verbose: "Dim ws As Worksheet\nSet ws = ThisWorkbook.Sheets(1)\nws.Name = \"NewReport\"\nThisWorkbook.Sheets.Add After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)",
          concise: "Set ws = Sheet1  ' use CodeName, immune to renaming\nws.Visible = xlSheetHidden\nThisWorkbook.Sheets.Add",
        },
      },
      {
        id: "vba-events",
        fn: "Worksheet & Workbook Events",
        desc: "Run code automatically when cells change, sheets activate, or workbooks open.",
        category: "VBA Events",
        subtitle: "Event-driven VBA triggered by user actions",
        signature: "Private Sub Worksheet_Change(ByVal Target As Range)\nPrivate Sub Workbook_Open()",
        descLong: "VBA events run automatically in response to user or application actions. Worksheet events go in the sheet's code module. Workbook events go in ThisWorkbook. Always check Target and disable events to prevent infinite loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Worksheet & Workbook Events — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── In Sheet1 code module ────────────────────────\nPrivate Sub Worksheet_Change(ByVal Target As Range)\n    ' Check if the changed cell is in column A\n    If Target.Column <> 1 Then Exit Sub\n    ' Prevent event loop!\n    Application.EnableEvents = False\n    Target.Offset(0, 1).Value = Now()  ' timestamp\n    Application.EnableEvents = True\nEnd Sub\n\n' ── Validate input on change ─────────────────────\nPrivate Sub Worksheet_Change(ByVal Target As Range)\n    If Intersect(Target, Range(\"B2:B100\")) Is Nothing Then Exit Sub\n    If Target.Value < 0 Then\n        MsgBox \"Value must be positive!\"\n        Application.EnableEvents = False\n        Target.ClearContents\n        Application.EnableEvents = True\n    End If\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Worksheet & Workbook Events — common patterns you'll see in production.\n' APPROACH  - Combine Worksheet & Workbook Events with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── SelectionChange ──────────────────────────────\nPrivate Sub Worksheet_SelectionChange(ByVal Target As Range)\n    ' Highlight entire row\n    Cells.Interior.ColorIndex = xlNone\n    Target.EntireRow.Interior.Color = RGB(255, 255, 200)\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Worksheet & Workbook Events — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── In ThisWorkbook module ───────────────────────\nPrivate Sub Workbook_Open()\n    MsgBox \"Welcome, \" & Environ(\"USERNAME\")\n    Sheets(\"Dashboard\").Activate\nEnd Sub\n\nPrivate Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)\n    ' Force save to specific location\n    If Not ThisWorkbook.Path = \"C:\\Approved\" Then\n        MsgBox \"Please save to C:\\Approved\"\n        Cancel = True\n    End If\nEnd Sub"
                  }
        ],
        tips: [
                  "**Always** wrap event handlers with `Application.EnableEvents = False/True` when modifying cells — prevents recursion",
                  "Use `Intersect(Target, Range(\"A:A\")) Is Nothing` to check if changed cell is in a specific range",
                  "Workbook_Open runs on open; Workbook_BeforeClose runs before close (can cancel)",
                  "Worksheet_Calculate fires after recalculation — avoid heavy code here, it runs constantly"
        ],
        mistake: "Modifying cells in Worksheet_Change without disabling events. The modification triggers another Change event, causing infinite recursion and a crash. Always disable events first.",
        shorthand: {
          verbose: "Private Sub Worksheet_Change(ByVal Target As Range)\n    Target.Offset(0, 1).Value = Now()\nEnd Sub",
          concise: "Private Sub Worksheet_Change(ByVal Target As Range)\n    Application.EnableEvents = False\n    Target.Offset(0, 1).Value = Now()\n    Application.EnableEvents = True\nEnd Sub",
        },
      },
      {
        id: "vba-msgbox-inputbox",
        fn: "MsgBox / InputBox",
        desc: "Show messages and get user input with built-in dialogs.",
        category: "VBA UI",
        subtitle: "Quick user interaction without building a UserForm",
        signature: "MsgBox(prompt, [buttons], [title])\nInputBox(prompt, [title], [default])",
        descLong: "MsgBox shows a dialog with a message and optional buttons, returning which button was clicked. InputBox collects a text string from the user. Application.InputBox is more powerful — it can accept ranges, numbers, or other types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of MsgBox / InputBox — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── MsgBox — simple message ──────────────────────\nMsgBox \"Process complete!\"\nMsgBox \"Error occurred\", vbCritical, \"Error\"\n\n' ── MsgBox with buttons ──────────────────────────\nDim response As Integer\nresponse = MsgBox(\"Delete all data?\", _\n                  vbYesNo + vbQuestion, \"Confirm\")\nIf response = vbYes Then\n    ws.Cells.ClearContents\nEnd If\n\n' Button constants: vbOKOnly vbOKCancel vbYesNo\n'                  vbYesNoCancel vbRetryCancel\n' Icon constants:  vbInformation vbQuestion\n'                  vbExclamation vbCritical"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of MsgBox / InputBox — common patterns you'll see in production.\n' APPROACH  - Combine MsgBox / InputBox with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── InputBox — text input ────────────────────────\nDim userName As String\nuserName = InputBox(\"Enter your name:\", \"Setup\", \"John\")\nIf userName = \"\" Then Exit Sub  ' user cancelled\n\n' ── Application.InputBox — type-safe ─────────────\n' Type: 1=number, 2=text, 8=range, 64=array\nDim targetRange As Range\nSet targetRange = Application.InputBox( _\n    \"Select the data range:\", \"Input\", Type:=8)\n\nDim numValue As Double\nnumValue = Application.InputBox( _\n    \"Enter a number:\", Type:=1)"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of MsgBox / InputBox — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── File dialog ──────────────────────────────────\nDim fd As FileDialog\nSet fd = Application.FileDialog(msoFileDialogFilePicker)\nfd.Title = \"Select a file\"\nfd.Filters.Add \"Excel\", \"*.xlsx;*.xlsm\"\nIf fd.Show = -1 Then\n    Debug.Print fd.SelectedItems(1)\nEnd If"
                  }
        ],
        tips: [
                  "Use `Application.InputBox(Type:=8)` to let users click a range — returns a Range object",
                  "Check for empty string after InputBox — user pressing Cancel also returns empty string",
                  "vbYesNo returns vbYes (6) or vbNo (7) — use constants not numbers for readability",
                  "For complex input, build a UserForm instead — InputBox is limited to one value"
        ],
        mistake: "Not checking if InputBox returned empty string (user cancelled). Proceeding with an empty value causes downstream errors. Always `If val = \"\" Then Exit Sub`.",
        shorthand: {
          verbose: "MsgBox \"Error occurred\", vbCritical, \"Error\"\nDim response As Integer\nresponse = MsgBox(\"Delete?\", vbYesNo + vbQuestion, \"Confirm\")\nIf response = vbYes Then : ws.Cells.Clear : End If\nDim name As String : name = InputBox(\"Name:\", \"Setup\", \"John\")",
          concise: "If MsgBox(\"Delete?\", vbYesNo + vbQuestion) = vbYes Then ws.Cells.Clear\nDim name As String : name = InputBox(\"Name:\", \"Setup\")\nIf name = \"\" Then Exit Sub",
        },
      },
      {
        id: "vba-userform",
        fn: "UserForms",
        desc: "Build custom dialog boxes with controls.",
        category: "VBA UI",
        subtitle: "Design rich input forms with labels, textboxes, buttons, and comboboxes",
        signature: "UserForm1.Show\nUnload UserForm1",
        descLong: "UserForms are custom dialog boxes built in the VBA IDE. Add controls from the toolbox (TextBox, ComboBox, ListBox, CheckBox, OptionButton, CommandButton). Access control values via their Name property. Show modal (default) or modeless.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of UserForms — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Show / Hide / Unload ────────────────────────\nUserForm1.Show          ' modal — pauses code\nUserForm1.Show vbModeless  ' non-modal — code continues\nUserForm1.Hide          ' hide but keep in memory\nUnload UserForm1        ' destroy and free memory\n\n' ── In UserForm code module ───────────────────────\nPrivate Sub UserForm_Initialize()\n    ' Populate ComboBox on open\n    With Me.cmbDept\n        .AddItem \"IT\"\n        .AddItem \"HR\"\n        .AddItem \"Finance\"\n        .Value = \"IT\"  ' default selection\n    End With\n    Me.txtName.SetFocus\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of UserForms — common patterns you'll see in production.\n' APPROACH  - Combine UserForms with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nPrivate Sub btnSubmit_Click()\n    ' Validate\n    If Me.txtName.Value = \"\" Then\n        MsgBox \"Name is required!\", vbExclamation\n        Exit Sub\n    End If\n    ' Write to sheet\n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets(\"Data\")\n    Dim nextRow As Long\n    nextRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1\n    ws.Cells(nextRow, 1).Value = Me.txtName.Value\n    ws.Cells(nextRow, 2).Value = Me.cmbDept.Value\n    ws.Cells(nextRow, 3).Value = Me.chkActive.Value\n    Unload Me\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of UserForms — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nPrivate Sub btnCancel_Click()\n    Unload Me\nEnd Sub"
                  }
        ],
        tips: [
                  "Name controls meaningfully: `txtName`, `cmbDept`, `btnSubmit` — the `Me.` prefix gives IntelliSense",
                  "Use `UserForm_Initialize` (not `UserForm_Activate`) for one-time setup code",
                  "`Me` inside a UserForm refers to the form itself — cleaner than using the form name",
                  "Set Tab Order in View > Tab Order so users can navigate with Tab key logically"
        ],
        mistake: "Using UserForm_Activate for initialization code. Activate fires every time the form is shown (including after Hide/Show cycles). Use Initialize for one-time setup.",
        shorthand: {
          verbose: "Private Sub UserForm_Initialize()\n    With Me.cmbDept\n        .AddItem \"IT\" : .AddItem \"HR\" : .Value = \"IT\"\n    End With\nEnd Sub\nPrivate Sub btnSubmit_Click()\n    If Me.txtName.Value = \"\" Then Exit Sub\n    ws.Cells(r, 1).Value = Me.txtName.Value\nEnd Sub",
          concise: "Private Sub UserForm_Initialize()\n    Me.cmbDept.List = Array(\"IT\", \"HR\") : Me.cmbDept.Value = \"IT\"\nEnd Sub\nPrivate Sub btnSubmit_Click()\n    If Me.txtName.Value = \"\" Then Exit Sub\n    ws.Cells(r, 1).Value = Me.txtName.Value : Unload Me\nEnd Sub",
        },
      },
      {
        id: "vba-error-handling",
        fn: "On Error / Error Handling",
        desc: "Trap and handle runtime errors gracefully.",
        category: "VBA Errors",
        subtitle: "Structured error handling with On Error and Err object",
        signature: "On Error GoTo ErrorHandler\nOn Error Resume Next\nOn Error GoTo 0",
        descLong: "VBA error handling uses On Error statements. On Error GoTo label redirects execution to an error handler. On Error Resume Next suppresses errors (use carefully and briefly). The Err object contains error details. Always resume normal flow in clean-up.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of On Error / Error Handling — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Standard error handling pattern ─────────────\nSub ProcessData()\n    On Error GoTo ErrorHandler\n    \n    Dim ws As Worksheet\n    Set ws = ThisWorkbook.Sheets(\"Data\")\n    ' ... main code ...\n    ws.Range(\"A1\").Value = 100 / 0  ' causes error\n    \n    CleanUp:  ' always runs\n        Application.ScreenUpdating = True\n        Application.EnableEvents = True\n        Application.Calculation = xlCalculationAutomatic\n        Exit Sub  ' important! prevents running ErrorHandler\n    \n    ErrorHandler:\n        MsgBox \"Error \" & Err.Number & \": \" & Err.Description, _\n               vbCritical, \"Error in ProcessData\"\n        Resume CleanUp  ' go to cleanup\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of On Error / Error Handling — common patterns you'll see in production.\n' APPROACH  - Combine On Error / Error Handling with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── On Error Resume Next (brief, scoped use) ──────\n' Check if sheet exists:\nDim ws As Worksheet\nOn Error Resume Next\nSet ws = ThisWorkbook.Sheets(\"Missing\")\nOn Error GoTo 0  ' ALWAYS reset after Resume Next!\nIf ws Is Nothing Then\n    MsgBox \"Sheet not found\"\n    Exit Sub\nEnd If\n\n' ── Error constants ───────────────────────────────\n' Err.Number: 11=Division by zero, 9=Subscript out of range\n'             13=Type mismatch, 1004=Application-defined"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of On Error / Error Handling — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Re-raise error ────────────────────────────────\nOn Error GoTo handler\n' ...\nhandler:\n    If Err.Number = 1004 Then\n        ' Handle specific error\n    Else\n        Err.Raise Err.Number  ' re-raise unhandled errors\n    End If"
                  }
        ],
        tips: [
                  "**Always reset** after `On Error Resume Next` with `On Error GoTo 0`",
                  "The CleanUp section should reset Application settings — ScreenUpdating, EnableEvents, Calculation",
                  "Use `Err.Number` to handle specific errors differently",
                  "Log errors to a sheet or file for production macros: write Err.Number, Description, Now()"
        ],
        mistake: "Using On Error Resume Next for an entire Sub. This silently suppresses ALL errors — bugs become invisible. Use it only for specific known-fallible lines, then reset immediately.",
        shorthand: {
          verbose: "On Error GoTo ErrorHandler\n' ... code ...\nCleanUp:\n    Application.ScreenUpdating = True\n    Exit Sub\nErrorHandler:\n    MsgBox \"Error \" & Err.Number & \": \" & Err.Description\n    Resume CleanUp",
          concise: "On Error GoTo EH\n' ... code ...\nExit Sub\nEH: MsgBox Err.Description : Resume Next",
        },
      },
      {
        id: "vba-performance",
        fn: "Performance Optimization",
        desc: "Speed up VBA macros with Application settings and efficient patterns.",
        category: "VBA Performance",
        subtitle: "Make slow macros run fast",
        signature: "Application.ScreenUpdating = False\nApplication.Calculation = xlCalculationManual",
        descLong: "VBA macros can be dramatically sped up by disabling screen updates, auto-calculation, and events. The biggest performance gains come from avoiding cell-by-cell loops and using array reads/writes instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Performance Optimization — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Standard performance wrapper ─────────────────\nSub FastMacro()\n    Application.ScreenUpdating = False\n    Application.Calculation = xlCalculationManual\n    Application.EnableEvents = False\n    Application.DisplayStatusBar = False\n    \n    ' ... your code here ...\n    \n    Application.ScreenUpdating = True\n    Application.Calculation = xlCalculationAutomatic\n    Application.EnableEvents = True\n    Application.DisplayStatusBar = True\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Performance Optimization — common patterns you'll see in production.\n' APPROACH  - Combine Performance Optimization with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Slow: cell-by-cell loop ───────────────────────\nDim i As Long\nFor i = 1 To 10000\n    Cells(i, 1).Value = i * 2   ' 10,000 cell hits!\nNext i\n\n' ── Fast: array read/write (100x faster) ──────────\nDim arr() As Variant\nReDim arr(1 To 10000, 1 To 1)\nFor i = 1 To 10000\n    arr(i, 1) = i * 2           ' work in memory\nNext i\nRange(\"A1:A10000\").Value = arr  ' ONE write to sheet"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Performance Optimization — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Read range to array ───────────────────────────\nDim data As Variant\ndata = ws.Range(\"A1:D10000\").Value  ' ONE read\nFor i = 1 To UBound(data, 1)       ' process in RAM\n    data(i, 3) = data(i, 1) * data(i, 2)\nNext i\nws.Range(\"A1:D10000\").Value = data  ' ONE write back\n\n' ── Avoid Select/Activate ────────────────────────\n' Slow:  Range(\"A1\").Select: Selection.Copy\n' Fast:  Range(\"A1\").Copy Range(\"B1\")"
                  }
        ],
        tips: [
                  "**Array read/write** is the #1 performance technique — read entire range to Variant array, process, write back",
                  "Avoid `.Select`, `.Activate`, and `Selection` — they force screen redraws and are slow",
                  "Use `With ws ... End With` to avoid repeated object resolution",
                  "Status bar updates cost time: `Application.DisplayStatusBar = False` in tight loops"
        ],
        mistake: "Forgetting to reset Application settings after the macro. If it crashes mid-run, calculation stays manual and events stay off — the workbook appears broken. Use error handling to always reset.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFor i = 1 To 10000 : Cells(i, 1).Value = i * 2 : Next i\n// More explicit but longer",
          concise: "Dim arr As Variant : arr = Range(\"A1:A10000\").Value\nFor i = 1 To 10000 : arr(i, 1) = i * 2 : Next i\nRange(\"A1:A10000\").Value = arr",
        },
      },
      {
        id: "vba-arrays",
        fn: "Arrays in VBA",
        desc: "Declare, populate, and use static and dynamic arrays.",
        category: "VBA Arrays",
        subtitle: "High-performance data storage in memory",
        signature: "Dim arr(1 To n) As Type\nReDim arr(1 To n)\nDim v As Variant: v = Range.Value",
        descLong: "VBA arrays are the key to fast data processing. Static arrays have fixed size. Dynamic arrays use ReDim (and ReDim Preserve to keep data). Variant arrays from Range.Value are 2D and the fastest way to bulk process sheet data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Arrays in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Static array ─────────────────────────────────\nDim months(1 To 12) As String\nmonths(1) = \"January\"\nmonths(12) = \"December\"\n\n' ── Dynamic array ────────────────────────────────\nDim scores() As Double  ' declared but unallocated\nReDim scores(1 To 100)  ' allocate\nscores(1) = 95.5\n\n' Resize preserving data:\nReDim Preserve scores(1 To 200)\n\n' ── 2D array ─────────────────────────────────────\nDim grid(1 To 10, 1 To 5) As Variant\ngrid(1, 1) = \"Alice\"\ngrid(1, 2) = 85000"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Arrays in VBA — common patterns you'll see in production.\n' APPROACH  - Combine Arrays in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Range to Variant array (fastest) ─────────────\nDim data As Variant\ndata = Sheet1.Range(\"A1:D100\").Value\n' data is now a 2D array (1-based)\n' data(1,1) = A1, data(1,2) = B1, etc.\n\n' Process in memory\nDim i As Long\nFor i = 1 To UBound(data, 1)  ' UBound rows\n    If data(i, 2) = \"IT\" Then\n        data(i, 3) = data(i, 3) * 1.1  ' 10% raise\n    End If\nNext i\nSheet1.Range(\"A1:D100\").Value = data  ' write back"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Arrays in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Array functions ───────────────────────────────\nUBound(arr)          ' last index (upper bound)\nLBound(arr)          ' first index (lower bound)\nUBound(arr, 1)       ' rows (dimension 1)\nUBound(arr, 2)       ' cols (dimension 2)\nIsArray(arr)         ' check if variable is array\nErase arr            ' clear and free memory"
                  }
        ],
        tips: [
                  "Range.Value always returns a 1-based 2D Variant array — `arr(row, col)`",
                  "ReDim Preserve only works on the LAST dimension of multi-dimensional arrays",
                  "Use `Erase arr` to free memory for large arrays when done",
                  "Join/Split work on 1D string arrays: `Join(arr, \",\")` and `Split(str, \",\")`"
        ],
        mistake: "Using ReDim Preserve on a 2D array's first dimension. VBA only allows preserving the last dimension. Restructure or use a Collection/Dictionary instead.",
        shorthand: {
          verbose: "Dim months(1 To 12) As String\nmonths(1) = \"January\"\nmonths(2) = \"February\"\nDim scores() As Double\nReDim scores(1 To 100)\nscores(1) = 95.5",
          concise: "Dim months() As String : months = Split(\"January,February,...\", \",\")\nDim data As Variant : data = Range(\"A1:D100\").Value\nFor i = 1 To UBound(data, 1) : data(i, 3) = data(i, 1) * data(i, 2) : Next i",
        },
      },
    ],
  },

  // ── Section 8: VBA Advanced & Automation ─────────────────────────────────────────
  {
    id: "vba-advanced-automation",
    title: "VBA Advanced & Automation",
    entries: [
      {
        id: "vba-dictionary",
        fn: "Dictionary (Scripting.Dictionary)",
        desc: "Key-value store for fast lookups and grouping in VBA.",
        category: "VBA Advanced",
        subtitle: "Hash map for O(1) lookups and aggregation",
        signature: "Dim d As Object\nSet d = CreateObject(\"Scripting.Dictionary\")",
        descLong: "The Scripting.Dictionary is VBA's hash map — it stores key-value pairs with O(1) average lookup. Far faster than looping through ranges for deduplication, grouping, and frequency counting. Requires early binding or CreateObject.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Dictionary (Scripting.Dictionary) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Create Dictionary ─────────────────────────────\n' Late binding (no reference needed):\nDim d As Object\nSet d = CreateObject(\"Scripting.Dictionary\")\nd.CompareMode = vbTextCompare  ' case-insensitive keys\n\n' Early binding (add ref: Tools > References > Scripting):\n' Dim d As New Scripting.Dictionary\n\n' ── Basic operations ──────────────────────────────\nd(\"Alice\") = 95             ' add or update\nd.Add \"Bob\", 87             ' add only (error if exists)\nd.Exists(\"Alice\")           ' True\nd.Keys                      ' array of all keys\nd.Items                     ' array of all values\nd.Count                     ' number of entries\nd.Remove \"Bob\"              ' remove one\nd.RemoveAll                 ' clear all"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Dictionary (Scripting.Dictionary) — common patterns you'll see in production.\n' APPROACH  - Combine Dictionary (Scripting.Dictionary) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Count frequencies (word count pattern) ────────\nDim ws As Worksheet\nSet ws = Sheet1\nDim freq As Object\nSet freq = CreateObject(\"Scripting.Dictionary\")\n\nDim cell As Range\nFor Each cell In ws.Range(\"A2:A1000\")\n    If cell.Value <> \"\" Then\n        Dim key As String\n        key = cell.Value\n        If freq.Exists(key) Then\n            freq(key) = freq(key) + 1\n        Else\n            freq(key) = 1\n        End If\n    End If\nNext cell"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Dictionary (Scripting.Dictionary) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Write results to sheet ────────────────────────\nDim i As Long, k As Variant\ni = 1\nFor Each k In freq.Keys\n    ws.Cells(i, 5).Value = k\n    ws.Cells(i, 6).Value = freq(k)\n    i = i + 1\nNext k"
                  }
        ],
        tips: [
                  "Set `d.CompareMode = vbTextCompare` for case-insensitive keys — do this before adding any items",
                  "Dictionary is much faster than nested loops for deduplication on large datasets",
                  "Store arrays as values for multi-field grouping: `d(key) = Array(sum, count, max)`",
                  "Use `d.Keys` and `d.Items` to bulk-read all keys/values into arrays"
        ],
        mistake: "Using d.Add when a key might already exist — it raises a runtime error. Use `If d.Exists(key) Then d(key) = ... Else d.Add key, ...` or just `d(key) = ...` which upserts.",
        shorthand: {
          verbose: "Dim d As Object : Set d = CreateObject(\"Scripting.Dictionary\")\nDim i As Long\nFor i = 1 To 1000\n    Dim key As String : key = ws.Cells(i, 1).Value\n    If d.Exists(key) Then\n        d(key) = d(key) + 1\n    Else\n        d.Add key, 1\n    End If\nNext i",
          concise: "Dim d As Object : Set d = CreateObject(\"Scripting.Dictionary\")\nFor i = 1 To 1000\n    Dim key As String : key = ws.Cells(i, 1).Value\n    If d.Exists(key) Then d(key) = d(key) + 1 Else d(key) = 1\nNext i",
        },
      },
      {
        id: "vba-regex",
        fn: "RegEx in VBA",
        desc: "Pattern matching and text extraction with regular expressions.",
        category: "VBA Advanced",
        subtitle: "Validate, extract, and replace text with regex patterns",
        signature: "Set rx = CreateObject(\"VBScript.RegExp\")\nrx.Pattern = \"pattern\"",
        descLong: "VBA can use regular expressions via the VBScript.RegExp object. Supports standard regex syntax for test (match/no match), replace, and extract. Requires either late binding (CreateObject) or adding the VBScript library reference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of RegEx in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Setup ────────────────────────────────────────\nDim rx As Object\nSet rx = CreateObject(\"VBScript.RegExp\")\nrx.Global = True        ' find all matches\nrx.IgnoreCase = True    ' case insensitive\n\n' ── Test if pattern matches ───────────────────────\nrx.Pattern = \"^\\d{5}(-\\d{4})?$\"  ' US ZIP code\nDebug.Print rx.Test(\"12345\")       ' True\nDebug.Print rx.Test(\"1234\")        ' False\n\n' ── Validate email ───────────────────────────────\nrx.Pattern = \"^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$\"\nDebug.Print rx.Test(\"user@company.com\")  ' True"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of RegEx in VBA — common patterns you'll see in production.\n' APPROACH  - Combine RegEx in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Replace ──────────────────────────────────────\nrx.Pattern = \"\\s+\"         ' one or more spaces\nDim cleaned As String\ncleaned = rx.Replace(\"Hello   World\", \" \")  ' \"Hello World\"\n\n' ── Extract matches ──────────────────────────────\nrx.Pattern = \"\\b\\d+\\.\\d{2}\\b\"  ' decimal numbers\nDim matches As Object\nSet matches = rx.Execute(\"Price: $19.99, Tax: $1.60\")\nDim m As Object\nFor Each m In matches\n    Debug.Print m.Value   ' 19.99, then 1.60\nNext m"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of RegEx in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Capture groups ───────────────────────────────\nrx.Pattern = \"(\\d{4})-(\\d{2})-(\\d{2})\"  ' YYYY-MM-DD\nSet matches = rx.Execute(\"Date: 2024-03-15\")\nIf matches.Count > 0 Then\n    Debug.Print matches(0).SubMatches(0)  ' 2024\n    Debug.Print matches(0).SubMatches(1)  ' 03\n    Debug.Print matches(0).SubMatches(2)  ' 15\nEnd If"
                  }
        ],
        tips: [
                  "Set `rx.Global = True` to find ALL matches — default finds only the first",
                  "Test() returns True/False — use for validation before processing",
                  "SubMatches(n) accesses capture groups `(...)` — 0-indexed",
                  "VBScript regex doesn't support lookbehind — use workarounds with capture groups"
        ],
        mistake: "Forgetting rx.Global = True when you expect multiple matches. Execute() returns all matches in a collection only when Global is True.",
        shorthand: {
          verbose: "Dim rx As Object : Set rx = CreateObject(\"VBScript.RegExp\")\nrx.Pattern = \"\\d{5}\"\nrx.Global = True\nSet matches = rx.Execute(text)\nFor Each m In matches : Debug.Print m.Value : Next m",
          concise: "Dim rx As Object : Set rx = CreateObject(\"VBScript.RegExp\")\nWith rx : .Pattern = \"\\d{5}\" : .Global = True : End With\nFor Each m In rx.Execute(text) : Debug.Print m.Value : Next m",
        },
      },
      {
        id: "vba-file-system",
        fn: "File System Operations",
        desc: "Read, write, and manage files and folders with VBA.",
        category: "VBA Advanced",
        subtitle: "FSO and native VBA for file and folder operations",
        signature: "Set fso = CreateObject(\"Scripting.FileSystemObject\")\nOpen filepath For Output As #1",
        descLong: "VBA can interact with the file system via the FileSystemObject (FSO) for modern operations, or native VBA Open/Close/Print statements for simple text I/O. FSO is more powerful and object-oriented.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of File System Operations — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── FileSystemObject ─────────────────────────────\nDim fso As Object\nSet fso = CreateObject(\"Scripting.FileSystemObject\")\n\n' Check existence\nfso.FileExists(\"C:\\data\\file.txt\")    ' True/False\nfso.FolderExists(\"C:\\data\\\")          ' True/False\n\n' Create folder\nIf Not fso.FolderExists(\"C:\\Output\") Then\n    fso.CreateFolder \"C:\\Output\"\nEnd If\n\n' Copy / Move / Delete\nfso.CopyFile \"C:\\src\\file.txt\", \"C:\\dst\\file.txt\"\nfso.MoveFile \"C:\\old.txt\", \"C:\\new.txt\"\nfso.DeleteFile \"C:\\temp.txt\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of File System Operations — common patterns you'll see in production.\n' APPROACH  - Combine File System Operations with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Write text file ──────────────────────────────\nDim ts As Object\nSet ts = fso.CreateTextFile(\"C:\\Output\\log.txt\", True)\nts.WriteLine \"Report generated: \" & Now()\nts.WriteLine \"Rows processed: \" & rowCount\nts.Close\n\n' ── Read text file ───────────────────────────────\nSet ts = fso.OpenTextFile(\"C:\\data\\config.txt\")\nDim line As String\nDo While Not ts.AtEndOfStream\n    line = ts.ReadLine\n    Debug.Print line\nLoop\nts.Close"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of File System Operations — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Loop files in folder ─────────────────────────\nDim folder As Object, f As Object\nSet folder = fso.GetFolder(\"C:\\Reports\")\nFor Each f In folder.Files\n    If Right(f.Name, 5) = \".xlsx\" Then\n        Debug.Print f.Path\n    End If\nNext f"
                  }
        ],
        tips: [
                  "FSO is late-bound via CreateObject — no library reference needed",
                  "Always close TextStream objects: `ts.Close` — file remains locked otherwise",
                  "Use `Dir()` for simple existence checks: `If Dir(\"C:\\file.txt\") <> \"\" Then`",
                  "Loop all Excel files in a folder and open/process each: combine FSO folder loop with Workbooks.Open"
        ],
        mistake: "Not closing text streams after writing. The file remains locked and subsequent operations (like opening it in Excel) fail until the VBA project resets.",
        shorthand: {
          verbose: "Dim fso As Object : Set fso = CreateObject(\"Scripting.FileSystemObject\")\nDim ts As Object : Set ts = fso.CreateTextFile(\"C:\\log.txt\")\nts.WriteLine \"Header\"\nts.WriteLine \"Data\"\nts.Close",
          concise: "With CreateObject(\"Scripting.FileSystemObject\").CreateTextFile(\"C:\\log.txt\")\n    .WriteLine \"Header\" : .WriteLine \"Data\" : .Close\nEnd With",
        },
      },
      {
        id: "vba-strings",
        fn: "String Functions in VBA",
        desc: "Manipulate text with VBA's built-in string functions.",
        category: "VBA Strings",
        subtitle: "Len, Mid, Left, Right, InStr, Replace, Split, Join",
        signature: "Len(s) | Mid(s,start,len) | InStr(s,find) | Replace(s,old,new)",
        descLong: "VBA has a rich set of string manipulation functions that mirror Excel's text functions but work on VBA strings directly. These are essential for parsing file paths, cleaning imported data, and building dynamic SQL or file names.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of String Functions in VBA — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nDim s As String\ns = \"  Hello, World!  \"\n\n' ── Basic operations ─────────────────────────────\nLen(s)              ' 18 (includes spaces)\nLTrim(s)            ' \"Hello, World!  \"\nRTrim(s)            ' \"  Hello, World!\"\nTrim(s)             ' \"Hello, World!\"\nUCase(s)            ' \"  HELLO, WORLD!  \"\nLCase(s)            ' \"  hello, world!  \"\n\n' ── Substring ────────────────────────────────────\nDim clean As String\nclean = Trim(s)     ' \"Hello, World!\"\nLeft(clean, 5)      ' \"Hello\"\nRight(clean, 6)     ' \"orld!\"\nMid(clean, 8, 5)    ' \"World\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of String Functions in VBA — common patterns you'll see in production.\n' APPROACH  - Combine String Functions in VBA with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Search ───────────────────────────────────────\nInStr(clean, \",\")         ' 6 (1-based position)\nInStr(1, clean, \"o\")      ' 5 (first \"o\")\nInStr(6, clean, \"o\")      ' 9 (\"o\" after pos 6)\nInStrRev(clean, \"o\")      ' 9 (last \"o\")\n\n' ── Replace ──────────────────────────────────────\nReplace(clean, \",\", \"\")   ' \"Hello World!\"\nReplace(clean, \"World\", \"Excel\") ' \"Hello, Excel!\"\n\n' ── Split and Join ───────────────────────────────\nDim parts() As String\nparts = Split(\"Alice,Bob,Carol\", \",\")\n' parts(0)=\"Alice\", parts(1)=\"Bob\", parts(2)=\"Carol\""
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of String Functions in VBA — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDim rejoined As String\nrejoined = Join(parts, \" | \")  ' \"Alice | Bob | Carol\"\n\n' ── Type conversion ──────────────────────────────\nCStr(123)           ' number to string: \"123\"\nCLng(\"456\")         ' string to Long: 456\nCDbl(\"3.14\")        ' string to Double: 3.14\nCDate(\"15-Jan-2024\") ' string to Date\nIsNumeric(\"123\")    ' True\nIsDate(\"15-Jan-2024\") ' True"
                  }
        ],
        tips: [
                  "InStr returns 0 if not found — use `If InStr(s, sub) > 0 Then` to check existence",
                  "Like operator with wildcards: `If s Like \"*@*.com\"` for pattern matching (simpler than InStr for simple patterns)",
                  "Use `Split` on CSV strings to get an array — then loop with UBound(arr)+1 for count",
                  "String concatenation: `&` operator — never `+` (+ causes errors on non-strings)"
        ],
        mistake: "Using `+` for string concatenation. `\"Hello\" + 123` errors. `\"Hello\" & 123` = \"Hello123\". Always use `&` for strings.",
        shorthand: {
          verbose: "Dim s As String : s = \"  Hello, World!  \"\nDim clean As String : clean = Trim(s)\nDim pos As Long : pos = InStr(clean, \",\")\nDim result As String : result = Left(clean, pos - 1)",
          concise: "Dim s As String : s = Trim(\"  Hello, World!  \")\nDim parts() As String : parts = Split(s, \",\")\nDim result As String : result = Trim(parts(0)) & Trim(parts(1))",
        },
      },
      {
        id: "vba-type-conversion",
        fn: "Type Checking & Conversion",
        desc: "Check and convert data types safely in VBA.",
        category: "VBA Types",
        subtitle: "IsNumeric, IsDate, TypeName, conversion functions",
        signature: "IsNumeric(val) | TypeName(var) | CInt, CLng, CDbl, CStr, CDate",
        descLong: "Type-safe VBA code explicitly checks and converts data types. IsNumeric/IsDate guard against conversion errors. TypeName identifies what type a variable holds. The C* conversion functions (CInt, CLng, CDbl, CStr, CDate) convert between types with proper overflow checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Type Checking & Conversion — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Type checking ────────────────────────────────\nDim v As Variant\nv = \"123\"\n\nIsNumeric(v)     ' True — can be converted to number\nIsDate(v)        ' False\nIsArray(v)       ' False\nIsNull(v)        ' False\nIsEmpty(v)       ' False (empty = never assigned)\nIsError(v)       ' False\nIsMissing(v)     ' for Optional params — was it passed?\n\nTypeName(v)       ' \"String\"\nTypeName(123)     ' \"Integer\"\nTypeName(Now())   ' \"Date\"\nTypeName(Range(\"A1\")) ' \"Range\""
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Type Checking & Conversion — common patterns you'll see in production.\n' APPROACH  - Combine Type Checking & Conversion with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Safe conversion pattern ───────────────────────\nFunction SafeToLong(val As Variant) As Long\n    If IsNumeric(val) Then\n        SafeToLong = CLng(val)\n    Else\n        SafeToLong = 0  ' default\n    End If\nEnd Function\n\n' ── Conversion functions ──────────────────────────\nCBool(1)          ' True\nCByte(200)        ' 200 (0-255)\nCInt(3.7)         ' 4  (rounds, not truncates!)\nCLng(3.7)         ' 4  (prefer over CInt)\nCDbl(\"3.14\")      ' 3.14\nCStr(Date)        ' \"15/01/2024\"\nCDate(\"Jan 15\")   ' #1/15/2024#\nCCur(3.14159)     ' 3.1416 (4 decimal places)\nInt(3.9)          ' 3  (truncates toward neg infinity)\nFix(3.9)          ' 3  (truncates toward zero)\nFix(-3.9)         ' -3 (vs Int(-3.9) = -4)"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Type Checking & Conversion — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Null and Empty handling ───────────────────────\nIf IsEmpty(ws.Cells(1,1).Value) Then\n    Debug.Print \"Cell is truly empty\"\nEnd If\n' Empty = never assigned; Null = database null\n' Cell.Value = \"\" is not empty or null — it's a zero-length string"
                  }
        ],
        tips: [
                  "CInt rounds (banker's rounding) — use CLng for integers to avoid unexpected rounding",
                  "Int() and Fix() differ for negatives: Int(-3.1)=-4, Fix(-3.1)=-3",
                  "Prefer `If IsNumeric(v) Then CDbl(v)` over wrapping conversions in On Error Resume Next",
                  "TypeName is useful for debugging — print it to Immediate Window to inspect any variable"
        ],
        mistake: "Using CInt() when CLng() is safer. CInt overflows at 32,767. CLng handles up to 2,147,483,647. Use CLng for any number that might be large.",
        shorthand: {
          verbose: "On Error Resume Next\nDim num As Long : num = CLng(v)\nOn Error GoTo 0\nIf num = 0 Then ' error handling",
          concise: "If IsNumeric(v) Then num = CLng(v) Else num = 0",
        },
      },
      {
        id: "vba-collection",
        fn: "Collection",
        desc: "VBA's built-in ordered list — like an array with add/remove.",
        category: "VBA Collections",
        subtitle: "Dynamic list with key-based and index-based access",
        signature: "Dim col As New Collection\ncol.Add item, [key]\ncol.Remove index_or_key",
        descLong: "The Collection object is VBA's built-in dynamic list. It stores any data type, supports optional string keys for lookup, and auto-sizes. Simpler than Dictionary for ordered lists without key lookups. Less efficient than arrays for bulk operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Collection — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Create and populate ──────────────────────────\nDim col As New Collection\n\n' Add without key (index only)\ncol.Add \"Alice\"\ncol.Add \"Bob\"\ncol.Add \"Carol\"\n\n' Add with key (enables key lookup)\ncol.Add \"alice@co.com\", \"Alice\"   ' key=\"Alice\"\ncol.Add \"bob@co.com\",   \"Bob\"\n\n' ── Access ───────────────────────────────────────\ncol(1)          ' \"Alice\" — 1-based index!\ncol(\"Alice\")    ' \"alice@co.com\" — by key\ncol.Count       ' 2"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Collection — common patterns you'll see in production.\n' APPROACH  - Combine Collection with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Remove ───────────────────────────────────────\ncol.Remove 1       ' remove by index\ncol.Remove \"Bob\"   ' remove by key\n\n' ── Loop ─────────────────────────────────────────\nDim item As Variant\nFor Each item In col\n    Debug.Print item\nNext item\n\n' ── Check if key exists (no .Exists method!) ──────\nFunction ColKeyExists(col As Collection, _\n                      key As String) As Boolean\n    On Error Resume Next\n    Dim v As Variant\n    v = col(key)\n    ColKeyExists = (Err.Number = 0)\n    On Error GoTo 0\nEnd Function"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Collection — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Collect unique values ─────────────────────────\nDim uniqueVals As New Collection\nDim cell As Range\nFor Each cell In ws.Range(\"A2:A100\")\n    If Not ColKeyExists(uniqueVals, CStr(cell.Value)) Then\n        uniqueVals.Add cell.Value, CStr(cell.Value)\n    End If\nNext cell"
                  }
        ],
        tips: [
                  "Collections are **1-based** (not 0-based like arrays) — col(1) is the first item",
                  "No .Exists method — use the On Error trick shown above to check key existence",
                  "Use **Dictionary** instead when you need: faster lookups, .Exists, .Keys array, or numeric keys",
                  "Collections are great for building unique lists — add with key = value, catch errors to skip duplicates"
        ],
        mistake: "Using col(0) expecting the first item. Collections are 1-based — col(1) is first. This is a common off-by-one error for developers coming from zero-indexed languages.",
        shorthand: {
          verbose: "Dim col As New Collection\ncol.Add \"Alice\" : col.Add \"Bob\" : col.Add \"Carol\"\nDim item As Variant\nFor Each item In col : Debug.Print item : Next item",
          concise: "Dim col As New Collection\nFor Each cell In ws.Range(\"A:A\") : col.Add cell.Value, CStr(cell.Value) : Next cell",
        },
      },
      {
        id: "vba-class-modules",
        fn: "Class Modules",
        desc: "Build custom objects with properties and methods in VBA.",
        category: "VBA OOP",
        subtitle: "Object-oriented VBA with encapsulation",
        signature: "' In Class Module named \"CEmployee\":\nPublic Property Get Name() As String",
        descLong: "Class modules let you build custom objects in VBA — with private data, public properties (Get/Let/Set), and methods. They make complex VBA more maintainable by encapsulating logic. Each instance is a separate object with its own data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Class Modules — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ══ CLASS MODULE: CEmployee ══════════════════════\nOption Explicit\n\n' Private backing variables\nPrivate mName    As String\nPrivate mSalary  As Double\nPrivate mDept    As String\n\n' Property Get — read\nPublic Property Get Name() As String\n    Name = mName\nEnd Property\n\n' Property Let — write\nPublic Property Let Name(val As String)\n    If Len(Trim(val)) = 0 Then\n        Err.Raise 5, , \"Name cannot be blank\"\n    End If\n    mName = Trim(val)\nEnd Property"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Class Modules — common patterns you'll see in production.\n' APPROACH  - Combine Class Modules with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nPublic Property Get Salary() As Double\n    Salary = mSalary\nEnd Property\nPublic Property Let Salary(val As Double)\n    If val < 0 Then Err.Raise 5, , \"Salary must be >= 0\"\n    mSalary = val\nEnd Property\n\n' Method\nPublic Function AnnualBonus(rate As Double) As Double\n    AnnualBonus = mSalary * rate\nEnd Function\n\n' Initialize event\nPrivate Sub Class_Initialize()\n    mSalary = 0\n    mDept = \"Unassigned\"\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Class Modules — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ══ USAGE IN STANDARD MODULE ═════════════════════\nSub TestEmployee()\n    Dim emp As New CEmployee\n    emp.Name = \"Alice\"\n    emp.Salary = 85000\n    MsgBox emp.AnnualBonus(0.15)  ' 12750\nEnd Sub"
                  }
        ],
        tips: [
                  "Class_Initialize fires when object is created — set default values here",
                  "Class_Terminate fires when object goes out of scope — use for cleanup (close connections, etc.)",
                  "Use `Property Set` (not Let) for object-type properties",
                  "Store a collection of class instances: `Dim employees As New Collection` then add CEmployee objects"
        ],
        mistake: "Using Public variables in a class instead of Property Get/Let. Public variables skip validation. Always use Property Let to validate incoming data before setting private backing variables.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPublic mName As String\nPublic mSalary As Double\n// More explicit but longer",
          concise: "Private mName As String\nPublic Property Let Name(val As String) : mName = Trim(val) : End Property",
        },
      },
      {
        id: "vba-with-statement",
        fn: "With / Set / Object References",
        desc: "Efficiently work with objects using With blocks and object variables.",
        category: "VBA Objects",
        subtitle: "Reduce object resolution overhead with With and Set",
        signature: "With object\n  .Property = val\nEnd With\nSet objVar = object",
        descLong: "The With statement executes multiple operations on the same object without repeating its name — improving readability and performance. Set assigns object references (non-object assignments use plain =). Understanding reference vs. value assignment is fundamental to VBA objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of With / Set / Object References — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Without With (repetitive) ────────────────────\nws.Range(\"A1\").Font.Bold = True\nws.Range(\"A1\").Font.Size = 14\nws.Range(\"A1\").Font.Color = RGB(255,255,255)\nws.Range(\"A1\").Interior.Color = RGB(68,114,196)\nws.Range(\"A1\").HorizontalAlignment = xlCenter\n\n' ── With block (clean + faster) ──────────────────\nWith ws.Range(\"A1\")\n    .Font.Bold = True\n    .Font.Size = 14\n    .Font.Color = RGB(255, 255, 255)\n    .Interior.Color = RGB(68, 114, 196)\n    .HorizontalAlignment = xlCenter\nEnd With"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of With / Set / Object References — common patterns you'll see in production.\n' APPROACH  - Combine With / Set / Object References with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Nested With ───────────────────────────────────\nWith ThisWorkbook.Sheets(\"Report\")\n    .Range(\"A1\").Value = \"Title\"\n    With .Range(\"A1\").Font\n        .Bold = True\n        .Size = 16\n    End With\n    .Columns(\"A:D\").AutoFit\nEnd With\n\n' ── Set vs = ──────────────────────────────────────\nDim ws As Worksheet\nSet ws = ThisWorkbook.Sheets(\"Data\")  ' objects: Set\n\nDim val As Long\nval = 42                               ' non-objects: ="
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of With / Set / Object References — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Nothing — release object references ──────────\nSet ws = Nothing\nSet wb = Nothing  ' good practice for large objects\n\n' ── Object reference pitfall ──────────────────────\nDim r1 As Range, r2 As Range\nSet r1 = ws.Range(\"A1\")\nSet r2 = r1             ' r2 points to SAME object\nr2.Value = \"Changed\"    ' r1.Value also = \"Changed\"!\n' (This is reference semantics — both point to same Range)"
                  }
        ],
        tips: [
                  "With blocks improve performance by resolving the object path once, not on every property access",
                  "Forgetting `Set` with objects gives \"Object variable not set\" error — one of the most common VBA errors",
                  "Use `Set obj = Nothing` to explicitly release large objects and free memory",
                  "Object variables hold references, not copies — changing through one variable affects all references"
        ],
        mistake: "Writing `ws = ThisWorkbook.Sheets(\"Data\")` without Set. This tries to assign the default property of the Sheet object to ws, not the object itself — causes type mismatch error.",
        shorthand: {
          verbose: "ws.Range(\"A1\").Font.Bold = True\nws.Range(\"A1\").Font.Size = 14\nws.Range(\"A1\").Interior.Color = RGB(68,114,196)",
          concise: "With ws.Range(\"A1\")\n    .Font.Bold = True : .Font.Size = 14\n    .Interior.Color = RGB(68, 114, 196)\nEnd With",
        },
      },
      {
        id: "vba-shell-environ",
        fn: "Shell / Environ / SendKeys",
        desc: "Run external programs, read environment variables, send keystrokes.",
        category: "VBA System",
        subtitle: "Interact with Windows OS from VBA",
        signature: "Shell \"program args\", vbNormalFocus\nEnviron(\"VARIABLE\")\nSendKeys \"keys\"",
        descLong: "Shell launches external applications. Environ reads Windows environment variables (USERNAME, COMPUTERNAME, APPDATA etc.). SendKeys sends keystrokes to the active application. ShellAndWait (custom) runs Shell synchronously. Use with caution — these are OS-dependent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Shell / Environ / SendKeys — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Shell — launch program ────────────────────────\nShell \"notepad.exe\", vbNormalFocus\nShell \"C:\\Program Files\\App\\app.exe\", vbHide\n\n' Open a file with its default app\nShell \"explorer.exe \"\"C:\\Reports\\output.xlsx\"\"\"\n\n' Run CMD command (hidden)\nShell \"cmd /c del C:\\Temp\\*.tmp\", vbHide\n\n' ── Shell and Wait (synchronous) ─────────────────\nFunction ShellAndWait(cmd As String) As Long\n    Dim pid As Long\n    pid = Shell(cmd, vbHide)\n    Dim wsh As Object\n    Set wsh = CreateObject(\"WScript.Shell\")\n    Dim proc As Object\n    Set proc = wsh.Exec(cmd)\n    Do While proc.Status = 0\n        DoEvents\n    Loop\n    ShellAndWait = proc.ExitCode\nEnd Function"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Shell / Environ / SendKeys — common patterns you'll see in production.\n' APPROACH  - Combine Shell / Environ / SendKeys with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Environ — environment variables ──────────────\nDebug.Print Environ(\"USERNAME\")       ' logged-in user\nDebug.Print Environ(\"COMPUTERNAME\")   ' machine name\nDebug.Print Environ(\"APPDATA\")        ' AppData path"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Shell / Environ / SendKeys — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nDebug.Print Environ(\"USERPROFILE\")    ' C:\\Users\\name\nDebug.Print Environ(\"TEMP\")           ' temp folder\n\n' Use in file paths:\nDim outputPath As String\noutputPath = Environ(\"USERPROFILE\") & \"\\Desktop\\Report.xlsx\"\nThisWorkbook.SaveAs outputPath\n\n' ── SendKeys — use sparingly ─────────────────────\nAppActivate \"Notepad\"  ' bring Notepad to front\nSendKeys \"Hello World{ENTER}\", True\nSendKeys \"%{F4}\"  ' Alt+F4\n' True = wait for keys to be processed"
                  }
        ],
        tips: [
                  "Shell is asynchronous — code continues immediately. For wait behavior, use WScript.Shell.Run(cmd, 0, True)",
                  "Environ(\"USERNAME\") is great for personalizing reports and logging who ran a macro",
                  "Avoid SendKeys for production code — it's fragile and focus-dependent. Use application-specific object models instead",
                  "Use `ThisWorkbook.Path` for the workbook's folder — more reliable than hardcoded paths"
        ],
        mistake: "Using SendKeys to automate other applications. If focus changes (user clicks elsewhere), keystrokes go to the wrong window. Use COM automation (CreateObject) for Office apps instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSendKeys \"Hello{ENTER}\", True\n// More explicit but longer",
          concise: "Shell \"cmd /c \" & \"notepad.exe\", vbHide\nDim user As String : user = Environ(\"USERNAME\")",
        },
      },
      {
        id: "vba-http-json",
        fn: "HTTP Requests & JSON (VBA)",
        desc: "Call REST APIs and parse JSON responses from VBA.",
        category: "VBA Web",
        subtitle: "Pull live data from APIs without Power Query",
        signature: "CreateObject(\"MSXML2.XMLHTTP60\")\nCreateObject(\"Scripting.Dictionary\")",
        descLong: "VBA can make HTTP requests using MSXML2.XMLHTTP or WinHttp.WinHttpRequest. JSON parsing requires either a custom parser or the ScriptControl (32-bit only). For production M365 use, Power Query or Office Scripts are better — but VBA HTTP is useful for quick integrations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of HTTP Requests & JSON (VBA) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Simple GET request ────────────────────────────\nFunction HTTPGet(url As String) As String\n    Dim http As Object\n    Set http = CreateObject(\"MSXML2.XMLHTTP60\")\n    http.Open \"GET\", url, False  ' False = synchronous\n    http.setRequestHeader \"Content-Type\", \"application/json\"\n    http.Send\n    If http.Status = 200 Then\n        HTTPGet = http.responseText\n    Else\n        HTTPGet = \"ERROR: \" & http.Status\n    End If\nEnd Function\n\n' ── POST request with JSON body ───────────────────\nFunction HTTPPost(url As String, body As String) As String\n    Dim http As Object\n    Set http = CreateObject(\"MSXML2.XMLHTTP60\")\n    http.Open \"POST\", url, False\n    http.setRequestHeader \"Content-Type\", \"application/json\"\n    http.setRequestHeader \"Authorization\", \"Bearer \" & API_KEY\n    http.Send body\n    HTTPPost = http.responseText\nEnd Function"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of HTTP Requests & JSON (VBA) — common patterns you'll see in production.\n' APPROACH  - Combine HTTP Requests & JSON (VBA) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Basic JSON value extraction (without library) ─\nFunction ExtractJSONValue(json As String, _\n                          key As String) As String\n    ' Simple key:value extraction — not full parser!\n    Dim pattern As String\n    pattern = \"\"\"\" & key & \"\"\"\"\n    Dim pos As Long\n    pos = InStr(json, pattern)\n    If pos = 0 Then Exit Function\n    pos = InStr(pos, json, \":\")\n    Dim valStart As Long\n    valStart = InStr(pos, json, \"\"\"\")\n    Dim valEnd As Long\n    valEnd = InStr(valStart + 1, json, \"\"\"\")\n    ExtractJSONValue = Mid(json, valStart+1, valEnd-valStart-1)\nEnd Function"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of HTTP Requests & JSON (VBA) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Usage: pull exchange rates ────────────────────\nSub GetExchangeRate()\n    Dim json As String\n    json = HTTPGet(\"https://api.exchangerate.host/latest?base=USD\")\n    Dim rate As String\n    rate = ExtractJSONValue(json, \"EUR\")\n    ws.Range(\"B1\").Value = CDbl(rate)\nEnd Sub"
                  }
        ],
        tips: [
                  "MSXML2.XMLHTTP60 is synchronous with False parameter — code waits for response",
                  "For proper JSON parsing in VBA, use the open-source VBA-JSON library (GitHub: VBA-tools/VBA-JSON)",
                  "WinHttp.WinHttpRequest.5.1 supports HTTPS better in some environments than XMLHTTP",
                  "For M365, consider Office Scripts (TypeScript) instead — they have native fetch() support"
        ],
        mistake: "Parsing JSON with string manipulation (InStr/Mid) on complex nested JSON. Use a proper JSON parser library for anything beyond simple flat key-value responses.",
        shorthand: {
          verbose: "Dim http As Object : Set http = CreateObject(\"MSXML2.XMLHTTP60\")\nhttp.Open \"GET\", url, False\nhttp.setRequestHeader \"Content-Type\", \"application/json\"\nhttp.Send\nDim json As String : json = http.responseText",
          concise: "With CreateObject(\"MSXML2.XMLHTTP60\")\n    .Open \"GET\", url, False : .Send\n    json = .responseText\nEnd With",
        },
      },
      {
        id: "vba-outlook-word",
        fn: "Automate Outlook & Word from Excel",
        desc: "Send emails, create Word docs, and automate other Office apps via VBA.",
        category: "VBA Automation",
        subtitle: "COM automation across Office applications",
        signature: "CreateObject(\"Outlook.Application\")\nCreateObject(\"Word.Application\")",
        descLong: "Excel VBA can automate other Office applications via COM (Component Object Model). Send Outlook emails with attachments, create and format Word documents, and interact with any COM-enabled application. Use early binding (Add Reference) for IntelliSense in development, late binding for deployment.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Automate Outlook & Word from Excel — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Send Outlook email ────────────────────────────\nSub SendReportEmail()\n    Dim olApp As Object\n    Set olApp = CreateObject(\"Outlook.Application\")\n    \n    Dim mail As Object\n    Set mail = olApp.CreateItem(0)  ' 0 = olMailItem\n    \n    With mail\n        .To = \"manager@company.com\"\n        .CC = \"team@company.com\"\n        .Subject = \"Weekly Report - \" & Format(Date, \"DD-MMM-YYYY\")\n        .Body = \"Please find attached this week's report.\"\n        ' HTML body:\n        .HTMLBody = \"<h2>Weekly Report</h2><p>See attached.</p>\"\n        ' Attach current workbook:\n        .Attachments.Add ThisWorkbook.FullName\n        .Send  ' or .Display to preview first\n    End With"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Automate Outlook & Word from Excel — common patterns you'll see in production.\n' APPROACH  - Combine Automate Outlook & Word from Excel with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\nSet mail = Nothing\n    Set olApp = Nothing\nEnd Sub\n\n' ── Create Word document ──────────────────────────\nSub ExportToWord()\n    Dim wdApp As Object\n    Set wdApp = CreateObject(\"Word.Application\")\n    wdApp.Visible = True\n    \n    Dim doc As Object\n    Set doc = wdApp.Documents.Add\n    \n    ' Add content\n    With doc.Content\n        .InsertAfter \"Monthly Sales Report\" & vbCrLf\n        .InsertAfter \"Generated: \" & Now() & vbCrLf\n    End With"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Automate Outlook & Word from Excel — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' Format heading\n    doc.Paragraphs(1).Range.Style = \"Heading 1\"\n    \n    ' Save\n    doc.SaveAs2 \"C:\\Output\\Report.docx\"\n    doc.Close\n    wdApp.Quit\n    \n    Set doc = Nothing\n    Set wdApp = Nothing\nEnd Sub"
                  }
        ],
        tips: [
                  "Use `.Display` instead of `.Send` during testing — lets you preview before sending",
                  "Late binding (CreateObject) works without library references — required for distributing to other machines",
                  "Set Outlook visibility: `olApp.Visible = True` for debugging, False for background automation",
                  "Check if Outlook is already running: `GetObject(, \"Outlook.Application\")` vs CreateObject"
        ],
        mistake: "Not setting object references to Nothing after automation. Leaving Outlook or Word references open keeps the application running in the background, consuming memory.",
        shorthand: {
          verbose: "Dim olApp As Object : Set olApp = CreateObject(\"Outlook.Application\")\nDim mail As Object : Set mail = olApp.CreateItem(0)\nWith mail : .To = \"user@co.com\" : .Subject = \"Report\" : .Send : End With\nSet mail = Nothing : Set olApp = Nothing",
          concise: "With CreateObject(\"Outlook.Application\").CreateItem(0)\n    .To = \"user@co.com\" : .Subject = \"Report\" : .Send\nEnd With",
        },
      },
      {
        id: "vba-ribbon-shortcut",
        fn: "Custom Ribbon & Keyboard Shortcuts",
        desc: "Add macros to the ribbon, Quick Access Toolbar, and keyboard shortcuts.",
        category: "VBA UI",
        subtitle: "Make macros easily accessible to users",
        signature: "Alt+F8 → Macros\nFile → Options → Customize Ribbon\nApplication.OnKey",
        descLong: "Macros can be triggered from the ribbon (via XML customization), Quick Access Toolbar, keyboard shortcuts (Application.OnKey), or worksheet buttons. For simple deployment, QAT buttons and keyboard shortcuts are easiest. Full ribbon customization requires RibbonX XML in the workbook file.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Custom Ribbon & Keyboard Shortcuts — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n' ── Keyboard shortcuts via Application.OnKey ─────\n' Assign in Workbook_Open, remove in Workbook_BeforeClose\n\nPrivate Sub Workbook_Open()\n    Application.OnKey \"^+r\", \"RunReport\"     ' Ctrl+Shift+R\n    Application.OnKey \"^+e\", \"ExportData\"    ' Ctrl+Shift+E\n    Application.OnKey \"{F9}\", \"RefreshAll\"   ' F9 key\nEnd Sub\n\nPrivate Sub Workbook_BeforeClose(Cancel As Boolean)\n    ' ALWAYS remove shortcuts on close\n    Application.OnKey \"^+r\"  ' empty string restores default\n    Application.OnKey \"^+e\"\n    Application.OnKey \"{F9}\"\nEnd Sub"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Custom Ribbon & Keyboard Shortcuts — common patterns you'll see in production.\n' APPROACH  - Combine Custom Ribbon & Keyboard Shortcuts with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n' ── Button on worksheet ───────────────────────────\n' Insert → Shapes → draw shape → right-click → Assign Macro\n' Or via VBA:\nSub AddButton()\n    Dim btn As Shape\n    Set btn = ws.Shapes.AddShape( _\n        msoShapeRoundedRectangle, 10, 10, 120, 35)\n    btn.Name = \"btnRunReport\"\n    btn.TextFrame.Characters.Text = \"Run Report\"\n    btn.OnAction = \"RunReport\"  ' macro to call\n    With btn.Fill\n        .ForeColor.RGB = RGB(68, 114, 196)\n    End With\nEnd Sub"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Custom Ribbon & Keyboard Shortcuts — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n' ── Protect sheet but allow button clicks ─────────\nws.Protect Password:=\"pass\", _\n    DrawingObjects:=False,  ' allow shape interaction\n    Contents:=True,\n    Scenarios:=True\n\n' ── RibbonX quick reference (in workbook XML) ─────\n' customUI14.xml snippet:\n' <button id=\"btnReport\" label=\"Run Report\"\n'   imageMso=\"TableInsert\" onAction=\"RunReport\"/>"
                  }
        ],
        tips: [
                  "Always remove OnKey assignments in Workbook_BeforeClose — shortcuts persist in Excel session after workbook closes",
                  "OnKey key codes: `\"{F1}\"` through `\"{F12}\"`, `\"^\"` = Ctrl, `\"+\"` = Shift, `\"%\"` = Alt",
                  "For ribbon customization, use the free Custom UI Editor tool to edit RibbonX XML",
                  "QAT (Quick Access Toolbar): File → Options → Quick Access Toolbar → Macros → Add"
        ],
        mistake: "Not removing OnKey shortcuts in Workbook_BeforeClose. The shortcut stays active in Excel even after the workbook closes — Ctrl+Shift+R will call a macro that no longer exists, causing errors.",
        shorthand: {
          verbose: "Private Sub Workbook_Open()\n    Application.OnKey \"^+r\", \"RunReport\"\nEnd Sub\nPrivate Sub Workbook_BeforeClose(Cancel As Boolean)\n    Application.OnKey \"^+r\"  ' remove\nEnd Sub",
          concise: "Private Sub Workbook_Open() : Application.OnKey \"^+r\", \"RunReport\" : End Sub\nPrivate Sub Workbook_BeforeClose(Cancel As Boolean) : Application.OnKey \"^+r\" : End Sub",
        },
      },
      {
        id: "choose-cols-rows",
        fn: "CHOOSECOLS / CHOOSEROWS",
        desc: "Select specific columns or rows from a range by index.",
        category: "Dynamic Array",
        subtitle: "Extract non-adjacent columns or reorder columns dynamically",
        signature: "=CHOOSECOLS(array, col_num1, [col_num2], ...)\n=CHOOSEROWS(array, row_num1, [row_num2], ...)",
        descLong: "CHOOSECOLS returns specified columns from an array; CHOOSEROWS returns specified rows. Both are useful for reordering, hiding columns from reports, or extracting subsets without rearranging source data. Can reference negative indices (e.g., -1 = last column).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of CHOOSECOLS / CHOOSEROWS — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      | D          |\n|--------|---------|--------|------------|\n| Name   | Dept    | Salary | StartDate  |\n| Alice  | IT      | 85000  | 2022-01-15 |\n| Bob    | HR      | 62000  | 2023-06-01 |\n| Carol  | IT      | 92000  | 2021-03-20 |\n|        |         |        |            |\n| Get cols 1 and 3 (Name and Salary):     |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of CHOOSECOLS / CHOOSEROWS — common patterns you'll see in production.\n' APPROACH  - Combine CHOOSECOLS / CHOOSEROWS with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| =CHOOSECOLS(A1:D3, 1, 3)                |\n| Name   | Salary |                       |\n| Alice  | 85000  |                       |\n| Bob    | 62000  |                       |\n| Carol  | 92000  |                       |\n|        |         |        |            |\n| Reverse column order:                   |\n| =CHOOSECOLS(A1:D3, 4, 3, 2, 1)         |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of CHOOSECOLS / CHOOSEROWS — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| StartDate | Salary | Dept | Name       |\n|        |         |        |            |\n| Last column only (negative index):      |\n| =CHOOSECOLS(A1:D3, -1)                 |\n| StartDate |                            |\n| 2022-01-15|                            |\n| 2023-06-01|                            |\n| 2021-03-20|                            |"
                  }
        ],
        tips: [
                  "Negative indices: -1=last, -2=second-to-last. Useful in formulas to adapt to changing data width",
                  "Combine with FILTER: =CHOOSECOLS(FILTER(A:D, B:B=\"IT\"), 1, 3) extracts name and salary for IT only",
                  "Use SEQUENCE: =CHOOSECOLS(A1:Z100, SEQUENCE(1, 3, 2)) picks columns 2, 3, 4",
                  "Works with spill ranges: =CHOOSECOLS(A1:C5#, 1, 3) extracts cols 1 and 3 from a spill"
        ],
        mistake: "Hardcoding column positions when data structure may change. Use SEQUENCE with CHOOSECOLS to make it dynamic: =CHOOSECOLS(data, SEQUENCE(1, n_cols, 1))",
        shorthand: {
          verbose: "// Manual / verbose approach\n=CHOOSECOLS(A1:D5, 1, 3)\n// More explicit but longer",
          concise: "=CHOOSECOLS(data, SEQUENCE(1, 2, 1, 2))",
        },
      },
      {
        id: "take-drop",
        fn: "TAKE / DROP",
        desc: "Extract or remove first/last N rows or columns.",
        category: "Dynamic Array",
        subtitle: "Slice ranges without hardcoding boundaries",
        signature: "=TAKE(array, rows, [cols])\n=DROP(array, rows, [cols])",
        descLong: "TAKE returns the first N rows and/or columns. DROP removes the first N rows and/or columns. Both support negative indices to count from the end. Useful for extracting headers, removing headers, taking top N results, or excluding trailing rows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of TAKE / DROP — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C      |\n|--------|---------|--------|\n| Name   | Dept    | Salary |\n| Alice  | IT      | 85000  |\n| Bob    | HR      | 62000  |\n| Carol  | IT      | 92000  |\n| Dave   | Finance | 78000  |\n|        |         |        |\n| First 2 data rows (skip header):    |\n| =TAKE(A2:C5, 2)                     |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of TAKE / DROP — common patterns you'll see in production.\n' APPROACH  - Combine TAKE / DROP with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| Alice  | IT      | 85000  |\n| Bob    | HR      | 62000  |\n|        |         |        |\n| Last 2 rows:                        |\n| =TAKE(A1:C5, -2)                    |\n| Carol  | IT      | 92000  |\n| Dave   | Finance | 78000  |\n|        |         |        |\n| All rows, first 2 cols:             |\n| =TAKE(A1:C5, , 2)                   |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of TAKE / DROP — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Name   | Dept    |        |\n| Alice  | IT      |        |\n| Bob    | HR      |        |\n|        |         |        |\n| Remove header row:                  |\n| =DROP(A1:C5, 1)                     |\n| Alice  | IT      | 85000  |\n| Bob    | HR      | 62000  |\n| Carol  | IT      | 92000  |"
                  }
        ],
        tips: [
                  "Negative rows/cols: TAKE(A1:Z100, -5) returns last 5 rows; DROP(A1:Z100, -2) removes last 2",
                  "Combine with ROWS: =TAKE(data, ROWS(data)-1) removes last row dynamically",
                  "Use in dashboards: =SORT(TAKE(FILTER(A:D, B:B=\"Active\"), 10)) shows top 10 active records",
                  "DROP(data, 1, ) removes first column; DROP(data, , 1) removes first row"
        ],
        mistake: "Using OFFSET or INDEX/MATCH for simple slicing. TAKE and DROP are cleaner and automatic — they adapt as data grows.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=TAKE(A1:C5, 2)\n// More explicit but longer",
          concise: "=TAKE(data, -5) to get last 5 rows",
        },
      },
      {
        id: "hstack-vstack-tocol",
        fn: "HSTACK / VSTACK / TOCOL / TOROW",
        desc: "Concatenate ranges horizontally, vertically, or reshape into columns/rows.",
        category: "Dynamic Array",
        subtitle: "Combine and reshape ranges without helper columns",
        signature: "=HSTACK(array1, [array2], ...)\n=VSTACK(array1, [array2], ...)\n=TOCOL(array, [ignore], [scan_by_col])\n=TOROW(array, [ignore], [scan_by_col])",
        descLong: "HSTACK merges ranges side-by-side (column-wise). VSTACK merges ranges top-to-bottom (row-wise). TOCOL reshapes a 2D array into a single column; TOROW reshapes into a single row. All return spills and are dynamic — perfect for building unified dashboards from multiple data sources.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of HSTACK / VSTACK / TOCOL / TOROW — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Left Table    | Right Table   | Merged (HSTACK)        |\n|---------------|---------------|------------------------|\n| Name | Dept  | Team | Region | Name | Dept | Team | Region |\n| Alice| IT    | A1   | North  | Alice| IT   | A1   | North  |\n| Bob  | HR    | H2   | South  | Bob  | HR   | H2   | South  |\n|               |               |                        |\n| =HSTACK(A1:B3, D1:E3) produces merged table         |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of HSTACK / VSTACK / TOCOL / TOROW — common patterns you'll see in production.\n' APPROACH  - Combine HSTACK / VSTACK / TOCOL / TOROW with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|                                                     |\n| Stack ranges vertically:                            |\n| =VSTACK(Range1, Range2, Range3)                    |\n| All rows from Range1, then Range2, then Range3    |\n|                                                     |\n| TOCOL example:                                      |\n| Input: [[A,B],[C,D]]                               |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of HSTACK / VSTACK / TOCOL / TOROW — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| =TOCOL(input)  → A,B,C,D (column)                  |\n|                                                     |\n| TOROW example:                                      |\n| Input: [[A],[B],[C]]                               |\n| =TOROW(input)  → A,B,C (row)                       |"
                  }
        ],
        tips: [
                  "HSTACK requires equal row counts but different column counts. VSTACK requires equal column counts",
                  "Ignore parameter: TOCOL(data, 0) includes blanks; TOCOL(data, 1) skips blanks",
                  "scan_by_col: TOCOL(data,,TRUE) reads across rows first, then down (column-major order)",
                  "Chain operations: =SORT(VSTACK(Sales2023, Sales2024), 1) sorts combined data by first column"
        ],
        mistake: "Manually copy-pasting data from multiple sheets. Use VSTACK or HSTACK with sheet references: =VSTACK(Sheet1!A:D, Sheet2!A:D, Sheet3!A:D)",
        shorthand: {
          verbose: "// Manual / verbose approach\n=HSTACK(A1:D5, E1:H5)\n// More explicit but longer",
          concise: "=VSTACK(Sheet1!A:D, Sheet2!A:D)",
        },
      },
      {
        id: "data-table-what-if",
        fn: "Data Table (What-If Analysis)",
        desc: "Create a sensitivity table to test multiple input scenarios.",
        category: "Analysis",
        subtitle: "Two-way or one-way data tables for scenario modeling",
        signature: "Data → What-If Analysis → Data Table (Ribbon)\nRow input cell: [cell reference]\nColumn input cell: [cell reference]",
        descLong: "Data Tables are Excel's native tool for sensitivity analysis. Set up a formula once, then create a table with variable inputs (one-way or two-way). Excel recalculates the formula for each combination and displays results in a grid. More flexible and efficient than manually entering values and copying formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Data Table (What-If Analysis) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Loan Amount | Interest | 10%    | 12%    | 14%    | 16%    |\n|-------------|----------|--------|--------|--------|--------|\n| $100,000    |          | $10,000| $12,000| $14,000| $16,000|\n| $150,000    |          | $15,000| $18,000| $21,000| $24,000|\n| $200,000    |          | $20,000| $24,000| $28,000| $32,000|"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Data Table (What-If Analysis) — common patterns you'll see in production.\n' APPROACH  - Combine Data Table (What-If Analysis) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|             |          |        |        |        |        |\n| Setup:                                                      |\n| 1. Create base formula: =LoanAmt * InterestRate            |\n| 2. Create input table with row headers (loan amts)         |\n| 3. and column headers (rates) surrounding the formula     |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Data Table (What-If Analysis) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| 4. Select Data > What-If Analysis > Data Table            |\n| 5. Row input cell: (cell with interest rate variable)     |\n|    Column input cell: (cell with loan amount variable)    |\n| 6. Excel fills in all values automatically               |"
                  }
        ],
        tips: [
                  "One-way table: Only use Row input cell OR Column input cell (not both)",
                  "Two-way table: Populate both Row input cell and Column input cell for matrix of scenarios",
                  "Formula location: Place formula in top-left corner of the data range before creating table",
                  "Data Tables recalculate automatically when inputs change — useful for live dashboards"
        ],
        mistake: "Placing the formula in the wrong cell or trying to use relative references. Formula must be in the top-left corner of the table range, and input cells must be absolute references.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData > What-If > Data Table\n// More explicit but longer",
          concise: "Data > What-If > Data Table (two-way sensitivity)",
        },
      },
      {
        id: "goal-seek",
        fn: "Goal Seek",
        desc: "Find input value needed to reach a target output.",
        category: "Analysis",
        subtitle: "Reverse-solve formulas to find required input values",
        signature: "Data → What-If Analysis → Goal Seek (Ribbon)\nSet cell: [formula cell]\nTo value: [target result]\nBy changing cell: [input cell]",
        descLong: "Goal Seek solves for an input value that produces a desired output. Give it a formula cell, target value, and variable input cell, and Excel finds the input needed. Perfect for 'what if I need $50k profit?' scenarios where you work backward from the goal.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Goal Seek — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Scenario: What loan amount is needed for $50,000 payment? |\n|----------------------------------------------------------|\n|                                                          |\n| Formula cell (C1): =LoanAmount * 0.15                  |\n| Result: =C1 (shows calculated payment)                 |\n|                                                          |\n| Goal Seek steps:                                         |\n| 1. Data → What-If Analysis → Goal Seek                 |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Goal Seek — common patterns you'll see in production.\n' APPROACH  - Combine Goal Seek with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| 2. Set cell: C2 (the result cell with =C1)             |\n| 3. To value: 50000 (desired payment)                   |\n| 4. By changing cell: B1 (LoanAmount)                   |\n| 5. Click OK                                             |\n|                                                          |\n| Result:                                                  |\n| B1 (LoanAmount) changes to $333,333.33 automatically    |\n| C1 now equals $50,000                                   |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Goal Seek — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|                                                          |\n| Real-world example:                                      |\n| \"What sales revenue do we need to reach $100k profit?\"  |\n| Set cell: ProfitCell                                    |\n| To value: 100000                                         |\n| By changing cell: SalesRevenueCell                      |"
                  }
        ],
        tips: [
                  "Goal Seek solves ONE input for ONE output. Use Solver for multiple constraints",
                  "Set cell must contain a formula; By changing cell must be referenced in that formula",
                  "Goal Seek uses iterative calculation — it may not find a solution if none exists",
                  "Test sensitivity: Run Goal Seek multiple times with different target values to see ranges"
        ],
        mistake: "Using Goal Seek with circular references or when the formula doesn't directly reference the input cell. Ensure the formula chain is clear: input → formula → result.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData > What-If > Goal Seek\n// More explicit but longer",
          concise: "Goal Seek: Set cell B2 to 100 by changing B1",
        },
      },
      {
        id: "solver-basics",
        fn: "Solver",
        desc: "Optimize an outcome by changing multiple inputs subject to constraints.",
        category: "Analysis",
        subtitle: "Advanced optimization: maximize/minimize with multiple variables and rules",
        signature: "Data → Solver (Ribbon)\nSet Objective: [formula cell]\nTo: Max / Min / Value\nBy Changing: [variable cells]\nSubject to Constraints: [rules]",
        descLong: "Solver is Excel's advanced optimization engine. Unlike Goal Seek (one input), Solver changes multiple variables to maximize or minimize an outcome while respecting constraints (e.g., 'profit>0', 'inventory<=1000'). Used in supply chain, portfolio optimization, scheduling, and resource allocation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Solver — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Scenario: Maximize profit subject to budget and warehouse space |\n|---------------------------------------------------------------|\n|                                                               |\n| Variables:                                                   |\n| B2: Units of Product A                                       |\n| B3: Units of Product B                                       |\n|                                                               |\n| Objective formula (C2):                                       |\n| =(B2 * $50 + B3 * $75) - TotalCost                           |\n| (Revenue minus cost equals profit)                            |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Solver — common patterns you'll see in production.\n' APPROACH  - Combine Solver with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|                                                               |\n| Constraints:                                                  |\n| B2 * 2 + B3 * 3 <= 500  (warehouse space: 500 sqft)         |\n| B2 * 10 + B3 * 15 <= 5000  (budget: $5000)                  |\n| B2 >= 0, B3 >= 0  (non-negative units)                       |\n|                                                               |\n| Solver setup:                                                |\n| 1. Set Objective: C2                                         |\n| 2. To: Max                                                   |\n| 3. By Changing: B2:B3                                        |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Solver — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| 4. Add Constraints:                                          |\n|    - B2*2+B3*3 <= 500                                        |\n|    - B2*10+B3*15 <= 5000                                     |\n|    - B2 >= 0, B3 >= 0                                        |\n| 5. Choose GRG Nonlinear or Simplex LP engine                 |\n| 6. Click Solve                                               |\n|                                                               |\n| Result: B2 and B3 auto-populate with optimal units          |"
                  }
        ],
        tips: [
                  "Linear problems (straight-line relationships): Use Simplex LP engine for faster, exact results",
                  "Nonlinear problems (curves, exponents): Use GRG Nonlinear, then verify by running multiple times",
                  "Constraint syntax: <=, >=, =, int (integer), bin (binary). Use cell ranges for grouped constraints",
                  "Solver often finds local optima, not global. Provide good initial guesses in B2:B3 before running"
        ],
        mistake: "Not defining initial values in the variable cells. Solver starts from current values — if B2 and B3 are zero, it may fail to find solutions. Enter plausible starting guesses first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nData > Solver (multi-variable optimization)\n// More explicit but longer",
          concise: "Maximize profit by varying price & quantity with constraints",
        },
      },
      {
        id: "sparklines",
        fn: "Sparklines",
        desc: "Embed tiny charts directly in cells for quick visual trends.",
        category: "Charts",
        subtitle: "Micro-charts showing data patterns at a glance",
        signature: "Insert → Sparklines (Ribbon)\nData Range: [values]\nLocation Range: [where to place sparklines]",
        descLong: "Sparklines are mini charts (line, column, or win/loss) that fit inside a single cell. They show trends, patterns, and outliers without taking up space. Perfect for dashboards where you want visual indicators alongside data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Sparklines — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Month | Revenue | Trend           |\n|-------|---------|─────────────────|\n| Jan   | 50000   | ▁▂▃▄▅▄▃▂ (line)  |\n| Feb   | 55000   | ▄▆▄▂▅▇▅▃ (column)|\n| Mar   | 60000   |                 |\n| Apr   | 58000   |                 |\n| May   | 65000   |                 |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Sparklines — common patterns you'll see in production.\n' APPROACH  - Combine Sparklines with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| Jun   | 70000   |                 |\n|       |         |                 |\n| Sparkline setup:                 |\n| 1. Select column C (Location)    |\n| 2. Insert → Sparklines           |\n| 3. Data Range: B2:B7             |\n| 4. Choose Line, Column, or Win/Loss |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Sparklines — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| 5. OK                             |\n|       |         |                 |\n| Win/Loss example (actual/target):|\n| Jan: target=$50k, actual=$48k ▼  |\n| Feb: target=$55k, actual=$60k ▲  |\n| Mar: target=$60k, actual=$58k ▼  |"
                  }
        ],
        tips: [
                  "Right-click sparklines to customize: axis scaling, color by point (high/low), marker visibility",
                  "Use Marker High/Low: Sparklines auto-highlight peaks and troughs for quick identification",
                  "Sparklines are NOT interactive like charts — they're static visual summaries",
                  "Group sparklines: Select all cells with sparklines, then use Sparklines Design ribbon to edit all at once"
        ],
        mistake: "Embedding too much complexity in sparklines. Keep data ranges small (5–50 points). For complex analysis, use a proper chart instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nInsert > Sparklines (line, column, win/loss)\n// More explicit but longer",
          concise: "Mini trend chart in a cell: =SPARKLINE(data)",
        },
      },
      {
        id: "structured-references",
        fn: "Structured References (Table Names)",
        desc: "Reference table columns by name instead of cell ranges for clarity.",
        category: "Data",
        subtitle: "Self-documenting formulas using table structure",
        signature: "[TableName][[#Headers],[ColumnName]]\n[TableName][@ColumnName] (current row)\n[TableName][#Data] (data rows only)",
        descLong: "When you define an Excel Table (Format as Table), each column gets a name. Reference columns by name (e.g., Sales[Amount]) instead of ranges (B2:B100). Formulas auto-expand as table grows and are self-documenting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Structured References (Table Names) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Employees Table (defined as Excel Table \"Employees\") |         |\n|---------------------------------------------------|─────────|\n| Name  | Department | Salary | IsActive |        |         |\n| Alice | IT         | 85000  | 1        |        |         |\n| Bob   | HR         | 62000  | 1        |        |         |\n| Carol | IT         | 92000  | 1        |        |         |\n| Dave  | Finance    | 78000  | 0        |        |         |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Structured References (Table Names) — common patterns you'll see in production.\n' APPROACH  - Combine Structured References (Table Names) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|       |            |        |          |        |         |\n| Formula with structured references:              |         |\n| =SUM(Employees[Salary])  (sum all salary)       |         |\n| =AVERAGE(Employees[Salary])  (avg salary)       |         |\n| =SUMIF(Employees[IsActive], 1, Employees[Salary]) (active only) |\n|       |            |        |          |        |         |\n| Current row reference (@):                       |         |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Structured References (Table Names) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| In a row formula: =Employees[@Salary] * 1.1     |\n| Returns THAT ROW's salary × 1.1                 |\n|       |            |        |          |        |         |\n| Headers-only reference:                          |         |\n| =SUM(Employees[#Headers])  (sums header row)    |\n| =SUM(Employees[#Data])  (sums data only, no header) |\n| =COUNTA(Employees[#All])  (count everything)    |"
                  }
        ],
        tips: [
                  "Define table: Select data > Home → Format as Table. Excel auto-detects headers and data",
                  "Table names appear in Name Manager. Rename tables: Design > Table Name",
                  "Structured references auto-expand: Add a row to the table, formula automatically includes it",
                  "Mix with FILTER/SORT: =SORT(FILTER(Employees, Employees[IsActive]=1), Employees[Salary], -1)"
        ],
        mistake: "Defining a table but still using hard-coded ranges like B2:B100. Switch to structured references to avoid updating formulas as data grows.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=SUM(B2:B100)\n// More explicit but longer",
          concise: "=SUM(Table1[Salary])",
        },
      },
      {
        id: "named-ranges-advanced",
        fn: "Named Ranges (Advanced)",
        desc: "Create reusable named ranges with dynamic sizing for formulas.",
        category: "Data",
        subtitle: "Dynamic and scoped named ranges for flexible references",
        signature: "Formulas → Name Manager (Ribbon)\nName: [unique name]\nScope: Workbook | Sheet\nRefers to: [cell range or formula]",
        descLong: "Named ranges make formulas readable (e.g., =SUM(AnnualSales) instead of =SUM(B2:B13)). Advanced: use OFFSET or INDIRECT to create dynamic ranges that adapt to data. Scope named ranges to specific sheets to avoid name conflicts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Named Ranges (Advanced) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Simple named range: Refers to → $B$2:$B$100 (SalesData)  |\n|──────────────────────────────────────────────────────────|\n| Formula: =SUM(SalesData)                                 |\n|          (instead of =SUM(B2:B100))                      |\n|                                                          |\n| Dynamic range with OFFSET:                               |\n| Name: DynSales                                           |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Named Ranges (Advanced) — common patterns you'll see in production.\n' APPROACH  - Combine Named Ranges (Advanced) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| Refers to: =OFFSET($B$2, 0, 0, COUNTA($B$2:$B$1000), 1) |\n| Automatically adjusts to data size                       |\n| Formula: =SUM(DynSales) grows as data is added          |\n|                                                          |\n| Dynamic range with INDEX:                                |\n| Name: ThisYearSales                                      |\n| Refers to: =INDEX($B:$B, YEAR($A:$A)=YEAR(TODAY()))     |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Named Ranges (Advanced) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| (returns sales where year matches current year)         |\n|                                                          |\n| Sheet-scoped named range:                                |\n| Scope: Dashboard (not Workbook)                         |\n| Multiple sheets can have same name 'Period' without conflict |\n| Reference: Dashboard!Period or just Period (if on Dashboard) |"
                  }
        ],
        tips: [
                  "Use COUNTA to auto-expand: =OFFSET(start, 0, 0, COUNTA(start_range), 1) counts non-blank cells",
                  "Named ranges work in Data Validation dropdowns: List source = SalesTeamNames",
                  "Sheet-scoped names: prefix with sheet name when referencing from another sheet: Dashboard.Period",
                  "Combine with formulas: =INDIRECT('Sheet'&A1&'!Sales') dynamically selects ranges by sheet name"
        ],
        mistake: "Using absolute references ($A$1) in named range formulas that should expand. Use COUNTA, ROWS, or other dynamic functions to allow growth.",
        shorthand: {
          verbose: "// Manual / verbose approach\nDefine Name: =Sheet1!$A$1:$A$100\n// More explicit but longer",
          concise: "Define Name: =OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A))",
        },
      },
      {
        id: "dynamic-charts",
        fn: "Dynamic Charts",
        desc: "Create charts that adapt as data ranges change.",
        category: "Charts",
        subtitle: "Charts that automatically expand or adjust with data",
        signature: "Chart Data Range: =[TableName] or\n=OFFSET($A$1,0,0,COUNTA($A:$A),COUNTA($1:$1))",
        descLong: "By default, chart data ranges are static — add rows and the chart doesn't include them. Use Excel Tables (auto-expanding) or dynamic OFFSET/INDEX formulas as chart sources. Charts then resize automatically as data grows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Dynamic Charts — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Method 1: Use Excel Table (easiest)          |\n|────────────────────────────────────────────|\n| 1. Select data range                        |\n| 2. Home → Format as Table (e.g., \"Sales\")  |\n| 3. Insert → Chart                          |\n| 4. Chart data source auto-uses table        |\n| 5. Add rows to table → chart auto-expands  |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Dynamic Charts — common patterns you'll see in production.\n' APPROACH  - Combine Dynamic Charts with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|                                             |\n| Method 2: Dynamic OFFSET formula           |\n| 1. Create source range:                     |\n|    =OFFSET($A$1,0,0,COUNTA($A:$A),COUNTA($1:$1)) |\n| 2. Name this range \"DynData\"                |\n| 3. Right-click chart → Select Data         |\n| 4. Data Range = DynData                     |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Dynamic Charts — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| 5. Chart now adapts to data size           |\n|                                             |\n| Method 3: Index-based dynamic range         |\n| Name: ChartData                             |\n| Refers to: =INDEX($A:$D,0,0)               |\n| (Selects all of columns A:D)               |"
                  }
        ],
        tips: [
                  "Easiest method: Use Excel Tables (Format as Table). Charts reference tables by default",
                  "OFFSET formula: =OFFSET(top_left, rows_offset, cols_offset, height, width)",
                  "COUNTA counts non-blank cells in a column/row — use for auto-height and auto-width",
                  "Test dynamic charts: Add rows to source data and verify chart updates without manual resizing"
        ],
        mistake: "Manually adjusting chart data ranges each time data grows. Use Excel Tables or OFFSET formulas so charts are truly self-updating.",
        shorthand: {
          verbose: "// Manual / verbose approach\nChart > Select Data > Edit range A1:D100\n// More explicit but longer",
          concise: "Chart > Select Data > Use Table reference: SalesTable[All]",
        },
      },
      {
        id: "pivot-advanced-fields",
        fn: "Pivot Tables (Advanced: Calculated Fields)",
        desc: "Create custom calculations within pivot table values area.",
        category: "Pivot",
        subtitle: "Define formulas for new calculated fields and items",
        signature: "PivotTable Tools → Analyze → Fields, Items, & Sets → Calculated Field\nName: [formula name]\nFormula: [expression using field references]",
        descLong: "Calculated Fields are custom formulas within a pivot table. Create new value columns based on existing fields (e.g., Revenue - Cost = Profit). Calculated Items let you group field items into new categories (e.g., combine 'East' and 'West' into 'Total').",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Pivot Tables (Advanced: Calculated Fields) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Sales Pivot Table                               |\n|─────────────────────────────────────────────────|\n|                                                 |\n| Row Labels    | Revenue | Cost | Profit*        |\n| Product A     | 50000   | 30000|               |\n| Product B     | 75000   | 40000|               |\n| Product C     | 65000   | 35000|               |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Pivot Tables (Advanced: Calculated Fields) — common patterns you'll see in production.\n' APPROACH  - Combine Pivot Tables (Advanced: Calculated Fields) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|               |         |      |                |\n| * Profit is a Calculated Field                 |\n| Formula: ='Revenue' - 'Cost'                   |\n|                                                 |\n| Calculated Item example:                        |\n| Region: North, South, Total*                   |\n| * Total is calculated item:                     |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Pivot Tables (Advanced: Calculated Fields) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Formula: ='North' + 'South'                    |\n| (sums those items automatically in pivot)      |\n|                                                 |\n| Another example: % of Total                     |\n| Calculated Field: ='Revenue' / SUM('Revenue')*100 |\n| Shows each product as % of total revenue       |"
                  }
        ],
        tips: [
                  "Calculated Fields appear in the Values area like normal fields — drag, sort, and filter them",
                  "Use single quotes around field names: ='Revenue'-'Cost', not =Revenue-Cost",
                  "Calculated Items can reference other calculated items: ='West Div' + 'West Support'",
                  "Avoid circular references: a calculated field can't reference itself"
        ],
        mistake: "Trying to use IF or complex logic in calculated fields. Use simple arithmetic. For complex logic, add a helper column to source data instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPivotTable > Analyze > Fields > Calculated Field\n// More explicit but longer",
          concise: "Add calculated field: Profit = Sales - Cost (simple math only)",
        },
      },
      {
        id: "pivot-slicers",
        fn: "Pivot Table Slicers",
        desc: "Add interactive filter buttons for pivot tables and ranges.",
        category: "Pivot",
        subtitle: "Synchronized filtering across multiple pivots",
        signature: "PivotTable Tools → Analyze → Insert Slicer (Ribbon)\nSelect fields to add as slicers\nOptional: Connect slicer to multiple pivots",
        descLong: "Slicers are visual filter controls — click button to filter. Better than dropdown filters because they show which values are selected. Connect one slicer to multiple pivots to synchronize filtering across dashboards.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Pivot Table Slicers — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Dashboard with Slicers                        |\n|─────────────────────────────────────────────|\n|                                              |\n| [Q1] [Q2] [Q3] [Q4]  (Quarter slicer)       |\n| [North] [South] [East] [West]  (Region)     |\n|                                              |\n| Pivot 1: Revenue by Product                 |\n| Product A | 25000 (filtered to Q1, North)   |\n| Product B | 18000                           |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Pivot Table Slicers — common patterns you'll see in production.\n' APPROACH  - Combine Pivot Table Slicers with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| Product C | 22000                           |\n|                                              |\n| Pivot 2: Profit by Department               |\n| IT | 12000  (same slicer filters applied)   |\n| HR | 8000                                    |\n| Finance | 15000                             |\n|                                              |\n| When user clicks Q2 and South:              |\n| Both pivots update instantly                |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Pivot Table Slicers — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n|                                              |\n| Setup:                                       |\n| 1. Right-click pivot → Insert Slicer        |\n| 2. Check fields (e.g., Quarter, Region)     |\n| 3. Slicer buttons appear on sheet           |\n| 4. To sync to 2nd pivot: Right-click slicer |\n|    → Report Connections → select 2nd pivot |"
                  }
        ],
        tips: [
                  "Slicers auto-update linked pivots — click a button, all connected pivots filter instantly",
                  "Horizontal slicers save space; multi-column slicers organize large field lists",
                  "Slicer size/position: drag edges to resize, click to select button style from ribbon",
                  "Clear filters: Press Ctrl on slicer or right-click → Clear Filter"
        ],
        mistake: "Creating separate slicers for the same field on different pivots. Create one slicer and connect it to all pivots (Report Connections) instead — ensures consistent filtering.",
        shorthand: {
          verbose: "// Manual / verbose approach\nInsert slicer for Region independently on each pivot\n// More explicit but longer",
          concise: "Insert Slicer > Region > Report Connections > Select all pivots",
        },
      },
      {
        id: "conditional-formatting-rules",
        fn: "Conditional Formatting (Rules & Formulas)",
        desc: "Apply colors and styles based on complex conditions.",
        category: "Data",
        subtitle: "Advanced color scales, data bars, and custom formula rules",
        signature: "Home → Conditional Formatting → New Rule\nRule Type: Formula Is / Color Scale / Data Bar\nFormula: [custom condition]",
        descLong: "Go beyond simple highlight rules. Use formulas (e.g., =A1>AVERAGE($A$1:$A$100)) for custom conditions, color scales for gradients, and data bars for visual comparisons. Rules automatically reference the correct row when copied.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Conditional Formatting (Rules & Formulas) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| A      | B       | C          | D                          |\n|--------|---------|-----------|────────────────────────────|\n| Name   | Salary  | Bonus % | Status                     |\n| Alice  | 85000   | 15% | ████████  (green data bar)  |\n| Bob    | 62000   | 8%  | ████      (orange)          |\n| Carol  | 92000   | 18% | ██████████ (green)         |\n| Dave   | 78000   | 5%  | ██        (red, <5%)        |\n|        |         |    |                             |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Conditional Formatting (Rules & Formulas) — common patterns you'll see in production.\n' APPROACH  - Combine Conditional Formatting (Rules & Formulas) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| Rule 1: Color scale (Salary column)                  |\n| Lowest = Red, Middle = Yellow, Highest = Green      |\n| Formula: (Conditional Formatting auto-scales values) |\n|        |         |    |                             |\n| Rule 2: Data bars (Bonus % column)                  |\n| Length of bar = % value                             |\n| 18% → full bar, 5% → tiny bar                       |\n|        |         |    |                             |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Conditional Formatting (Rules & Formulas) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Rule 3: Custom formula                              |\n| Formula: =B2>AVERAGE($B$2:$B$5)                     |\n| Highlights salaries above average (Alice, Carol)    |\n|        |         |    |                             |\n| Rule 4: Icon set                                     |\n| Formula: =AND(B2>75000, C2>10%)                     |\n| Shows ✓ for high earners with high bonus %         |"
                  }
        ],
        tips: [
                  "Formula rules use relative refs (A1) in first cell, then auto-adjust per row — intuitive and flexible",
                  "Color Scales: assign 3 values (low/mid/high) and Excel gradients between them automatically",
                  "Data bars: right-click rule → Edit Rule to customize bar color, direction (left-to-right/right-to-left)",
                  "Icon Sets: green/yellow/red circles or up/down arrows — use for KPIs and status at a glance"
        ],
        mistake: "Applying multiple overlapping rules that conflict. Order matters — rules apply top-to-bottom. Delete or reorder rules if they interfere.",
        shorthand: {
          verbose: "// Manual / verbose approach\nHome > Conditional Formatting > Highlight Cell Rules\n// More explicit but longer",
          concise: "Home > Conditional Formatting > New Rule > Formula > =B2>100",
        },
      },
      {
        id: "power-query-basics",
        fn: "Power Query Basics",
        desc: "Extract, transform, and load (ETL) data from multiple sources.",
        category: "Data",
        subtitle: "Clean messy data and combine tables without formulas",
        signature: "Data → Get Data → From [File/Database/Web/CSV/etc]\nTransform Data (Power Query Editor)\nClose & Load",
        descLong: "Power Query is Excel's built-in ETL engine. Connect to files, databases, and web APIs, then filter, split columns, unpivot, merge tables — all in a GUI. No formulas needed. Refresh queries when source data updates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Power Query Basics — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Typical Power Query workflow:                        |\n|───────────────────────────────────────────────────|\n| 1. Data → Get Data → From CSV                      |\n|    (select messy_sales_data.csv)                  |\n|                                                   |\n| 2. Power Query Editor opens:                       |\n|    Original Data:                                  |\n|    Date      | Amount   | Category                |\n|    3/16/2026 | $1,250.50| Office Supplies        |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Power Query Basics — common patterns you'll see in production.\n' APPROACH  - Combine Power Query Basics with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|    03-16-26  | 2,300.25 | Office Supplies        |\n|    2026-03-16| 980      | OFFICE SUPPLIES        |\n|                                                   |\n| 3. Transformations in editor:                      |\n|    - Split Date column (format standardize)       |\n|    - Replace $ and reformat Amount as number      |\n|    - Lowercase Category                           |\n|    - Remove duplicates                            |\n|                                                   |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Power Query Basics — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| 4. Cleaned data result:                            |\n|    Date      | Amount | Category          |\n|    2026-03-16| 1250.50| office supplies   |\n|    2026-03-16| 2300.25| office supplies   |\n|    2026-03-16| 980    | office supplies   |\n|                                                   |\n| 5. Close & Load → Results load to Excel          |\n| 6. Data → Refresh All (re-runs transformations   |\n|    if source data changes)                       |"
                  }
        ],
        tips: [
                  "Pivot/Unpivot: Power Query handles these elegantly — no TRANSPOSE or helper columns needed",
                  "Merge Queries: Join two tables on a key column — equivalent to INDEX/MATCH or VLOOKUP but more powerful",
                  "Add columns: Use 'Add Column' tab to create new columns via formula; keeps source clean",
                  "Delete columns: Right-click → Delete rather than hiding — cleaner output"
        ],
        mistake: "Editing data directly in Excel instead of in Power Query. Keep source messy, transform in Power Query — then source updates automatically refresh the cleaned data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nEdit cells > Format > Functions\n// More explicit but longer",
          concise: "Data > Get Data > Power Query > Transform > Refresh All",
        },
      },
      {
        id: "office-scripts-vba-replacement",
        fn: "Office Scripts (Automation)",
        desc: "Automate Excel tasks with TypeScript (cloud) or VBA (desktop).",
        category: "Automation",
        subtitle: "Script repetitive tasks: data entry, formatting, reporting",
        signature: "Automate → New Script (Excel for Web)\nEdit script in TypeScript\nRun or schedule via Power Automate",
        descLong: "Office Scripts (Excel Web) or VBA (Excel Desktop) automate repetitive work. Write scripts to populate templates, generate reports, validate data, send emails. Office Scripts integrate with Power Automate for scheduled/triggered automation; VBA is a traditional alternative.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Office Scripts (Automation) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Office Script (TypeScript) example:                        |\n|──────────────────────────────────────────────────────────|\n|                                                          |\n| function main(workbook: ExcelScript.Workbook) {         |\n|   let sheet = workbook.getActiveWorksheet();            |\n|                                                          |\n|   // Get data range                                      |\n|   let data = sheet.getRange(\"A1:D100\");                |\n|   let values = data.getValues();                         |\n|                                                          |\n|   // Filter and format                                   |\n|   values.forEach((row, i) => {                          |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Office Scripts (Automation) — common patterns you'll see in production.\n' APPROACH  - Combine Office Scripts (Automation) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n|     if (row[1] === \"IT\") {  // if Dept = IT            |\n|       sheet.getRange(i+1, 1).getFormat().setFont(\"bold\")|\n|     }                                                    |\n|   });                                                     |\n|                                                          |\n|   // Add summary row                                     |\n|   let lastRow = values.length + 1;                       |\n|   sheet.getRange(lastRow, 1).setValue(\"Total\");         |\n|   sheet.getRange(lastRow, 2).setFormula(\"=SUM(B2:B\"+lastRow+\")\"); |\n| }                                                        |\n|                                                          |\n| VBA equivalent (Excel Desktop):                         |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Office Scripts (Automation) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| Sub FormatITEmployees()                                 |\n|   Dim sheet As Worksheet                                |\n|   Set sheet = ActiveWorkbook.Sheets(1)                  |\n|   Dim lastRow As Long                                   |\n|   lastRow = sheet.Cells(Rows.Count, 1).End(xlUp).Row   |\n|   For i = 2 To lastRow                                  |\n|     If sheet.Cells(i, 2) = \"IT\" Then                   |\n|       sheet.Cells(i, 1).Font.Bold = True               |\n|     End If                                              |\n|   Next i                                                 |\n| End Sub                                                  |"
                  }
        ],
        tips: [
                  "Office Scripts (Web): TypeScript-based, cloud-native, integrates with Power Automate easily",
                  "VBA (Desktop): Legacy but powerful — access file system, COM objects, older integrations",
                  "Schedule scripts: Use Power Automate to run scripts on a schedule (daily, weekly)",
                  "Record actions: Automate → Record to auto-generate script from manual steps"
        ],
        mistake: "Writing scripts that hardcode row numbers. Use COUNTA or dynamic ranges so scripts adapt to data size.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst lastRow = 100; for (let i = 0; i < 100; i++)\n// More explicit but longer",
          concise: "const usedRange = sheet.getUsedRange(); const lastRow = usedRange.getRowCount();",
        },
      },
      {
        id: "text-extraction-functions",
        fn: "Text Extraction (FIND, SEARCH, MID, EXTRACT)",
        desc: "Extract substrings, find positions, and parse text patterns.",
        category: "Text",
        subtitle: "Advanced text parsing beyond basic MID",
        signature: "=FIND(find_text, within_text, [start_num]) → exact position\n=SEARCH(find_text, within_text, [start_num]) → case-insensitive\n=MID(text, start_num, num_chars) → extract substring",
        descLong: "FIND and SEARCH locate substring positions (FIND is case-sensitive, SEARCH is not). MID extracts characters from that position. Combine with other text functions to parse complex strings, emails, URLs, product codes, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "' === ENTRY-LEVEL EXAMPLE ===\n' TASK      - Basic usage of Text Extraction (FIND, SEARCH, MID, EXTRACT) — understand the core syntax and behavior.\n' APPROACH  - Simple example with minimal clauses; no edge cases.\n' STRENGTHS - Clear, readable; shows the fundamental pattern.\n' WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n| Text | Goal                     | Formula                        |\n|───---|──────────────────────────────────────────────────|\n| alice.johnson@acme.com | Extract name before @ | =LEFT(A1,FIND(\"@\",A1)-1) |\n|                        | Result: alice.johnson  |                            |\n|                        |                        |                            |"
                  },
                  {
                            "tier": "junior",
                            "code": "' === JUNIOR EXAMPLE ===\n' TASK      - Real-world usage of Text Extraction (FIND, SEARCH, MID, EXTRACT) — common patterns you'll see in production.\n' APPROACH  - Combine Text Extraction (FIND, SEARCH, MID, EXTRACT) with related clauses; handle common edge cases.\n' STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n' WEAKNESSES- May need optimization for large datasets or complex joins.\n| ABC-2024-001 | Extract year (2024)     | =MID(A1,FIND(\"-\",A1)+1,4) |\n|                        | Result: 2024           |                            |\n|                        |                        |                            |\n| \"The price is $99.99\" | Extract price ($99.99) | =MID(A1,FIND(\"$\",A1),6)   |\n|                        |                        |                            |"
                  },
                  {
                            "tier": "senior",
                            "code": "' === SENIOR EXAMPLE ===\n' TASK      - Advanced usage of Text Extraction (FIND, SEARCH, MID, EXTRACT) — performance, edge cases, and expert patterns.\n' APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n' STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n' WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n| \"Product ABC (Blue)\"   | Extract color in parens| =MID(A1,FIND(\"(\",A1)+1,FIND(\")\",A1)-FIND(\"(\",A1)-1) |\n|                        | Result: Blue           |                            |\n|                        |                        |                            |\n| Error handling:        | Safely extract if found| =IFERROR(MID(A1,FIND(\"@\",A1)+1,FIND(\".\",A1,FIND(\"@\",A1))-FIND(\"@\",A1)-1),\"No domain\") |\n|                        | Extract email domain   |                            |"
                  }
        ],
        tips: [
                  "SEARCH is usually safer than FIND — it ignores case (\"@\" finds both \"@\" and \"@\")",
                  "Nested FIND: find position of one char, then find next char after it. Useful for parsing delimited data",
                  "IFERROR wrapper prevents #VALUE errors if substring not found",
                  "TEXTSPLIT (modern): Splits strings by delimiter — cleaner than MID/FIND chains for some tasks"
        ],
        mistake: "Hard-coding character positions. Use FIND and nested formulas to locate delimiters dynamically, so the formula works if data format changes.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=MID(A1, 1, 5)  (hardcoded positions)\n// More explicit but longer",
          concise: "=MID(A1, FIND(\"-\", A1)+1, FIND(\"-\", A1, FIND(\"-\", A1)+1)-FIND(\"-\", A1)-1)",
        },
      },
    ],
  },
]

export default { meta, sections }

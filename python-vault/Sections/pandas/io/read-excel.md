---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "read-excel"
title: "pd.read_excel()"
category: "I/O"
subtitle: "Reads .xlsx and .xls — specify sheet_name= for multi-sheet files"
signature_short: "pd.read_excel(path, sheet_name=0, dtype=None, usecols=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.read_excel()"
  - "read-excel"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.read_excel()

> Reads .xlsx and .xls — specify sheet_name= for multi-sheet files

## Overview

read_excel() reads Excel files. sheet_name= can be a name, index, or None (returns all sheets as a dict). Requires openpyxl for .xlsx files. Use ExcelWriter to write multiple sheets.

## Signature

```python
pd.read_excel(path, sheet_name=0, dtype=None, usecols=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest read: hand a path, get back the first sheet.
# STRENGTHS - one line solves "I have an xlsx, get me the data"; the
#             return is a normal DataFrame.
# WEAKNESSES- silently picks sheet 0 even if the file has many; uses
#             default dtypes; no usecols / parse_dates filtering.
#
import pandas as pd

df = pd.read_excel("data.xlsx")            # implicitly sheet_name=0
df.head()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - pick a sheet by name, scope columns with usecols, control
#             types, and write multiple sheets via ExcelWriter. This is
#             the call shape you want in repeatable scripts.
# STRENGTHS - covers the daily Excel workflow including multi-sheet
#             output; explicit sheet_name prevents the "wrong sheet"
#             bug when files grow.
# WEAKNESSES- still loads everything into memory; openpyxl is slow for
#             very large workbooks — that's the senior tier's concern.
#
import pandas as pd

# Read a specific sheet with type controls
df = pd.read_excel(
    "data.xlsx",
    sheet_name  = "Sales",
    usecols     = ["date", "amount", "region"],
    dtype       = {"amount": "float64"},
    parse_dates = ["date"],
    skiprows    = 1,
)

# Write back — multi-sheet via ExcelWriter
with pd.ExcelWriter("out.xlsx") as w:
    df.to_excel(w, sheet_name="Data", index=False)
    df.groupby("region")["amount"].sum().to_excel(w, sheet_name="Summary")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - probe sheet names first (sheet_name=None returns a dict),
#             load all sheets in one round-trip when needed, and prefer
#             a CSV/Parquet conversion step for very large workbooks
#             since openpyxl is single-threaded and slow.
# STRENGTHS - safe against schema drift across sheets; fastest path
#             when a vendor delivers a 50-sheet workbook; converting
#             once to Parquet pays back on every subsequent read.
# WEAKNESSES- "convert to Parquet" assumes you control downstream
#             consumers; sheet_name=None loads everything which can
#             still OOM on huge workbooks — process per-sheet if so.
#
import pandas as pd

# 1. Discover sheet names first
all_sheets = pd.read_excel("data.xlsx", sheet_name=None)   # dict[name -> df]
list(all_sheets.keys())            # ['Sales', 'Summary', 'Costs', ...]

# 2. Stack same-shape sheets into one frame for analysis
combined = pd.concat(
    [df.assign(_sheet=name) for name, df in all_sheets.items()],
    ignore_index=True,
)

# 3. Big workbooks: convert once, query many times
# for name, df in all_sheets.items():
#     df.to_parquet(f"cache/{name}.parquet")

# 4. Streaming-style read for one giant sheet (openpyxl read_only mode)
# import openpyxl
# wb = openpyxl.load_workbook("huge.xlsx", read_only=True, data_only=True)
# rows = wb["Sales"].iter_rows(values_only=True)   # iterator — bounded memory

# Sanity rule: if the workbook is >100MB or appears in a daily pipeline,
# convert it to Parquet (or CSV) once and read THAT going forward.

# Decision rule:
#   Single sheet, defaults                     -> pd.read_excel(path)
#   Pick a specific sheet                       -> sheet_name="Q4" (or index)
#   ALL sheets at once                          -> sheet_name=None -> dict[name, DataFrame]
#   Skip the title rows                         -> header=N or skiprows=N
#   Performance matters / cross-platform        -> openpyxl explicit; calamine for >5x speed
#   Output back to Excel                        -> df.to_excel(..., engine="openpyxl")
#   Multiple frames -> one workbook             -> pd.ExcelWriter(path) + multiple to_excel calls
#   Truly large data                            -> stop using Excel; switch to parquet/csv
#
# Anti-pattern: read_excel for files > 50 MB or in a hot path
#   openpyxl parses the entire XML zip into memory; expect 5-10x file size in
#   RAM and seconds-per-file. For ETL, convert once to parquet then never touch
#   the .xlsx again. If you must, try engine="calamine" (Rust-fast).
```

## Decision Rule

```text
Single sheet, defaults                     -> pd.read_excel(path)
Pick a specific sheet                       -> sheet_name="Q4" (or index)
ALL sheets at once                          -> sheet_name=None -> dict[name, DataFrame]
Skip the title rows                         -> header=N or skiprows=N
Performance matters / cross-platform        -> openpyxl explicit; calamine for >5x speed
Output back to Excel                        -> df.to_excel(..., engine="openpyxl")
Multiple frames -> one workbook             -> pd.ExcelWriter(path) + multiple to_excel calls
Truly large data                            -> stop using Excel; switch to parquet/csv
```

## Anti-Pattern

> [!warning] Anti-pattern
> read_excel for files > 50 MB or in a hot path
>   openpyxl parses the entire XML zip into memory; expect 5-10x file size in
>   RAM and seconds-per-file. For ETL, convert once to parquet then never touch
>   the .xlsx again. If you must, try engine="calamine" (Rust-fast).

## Tips

- `sheet_name=None` reads ALL sheets and returns a dict — useful for unknown sheet names
- Install openpyxl: `pip install openpyxl` — required for .xlsx files
- `pd.ExcelWriter` context manager writes multiple sheets to one file
- For large Excel files, consider exporting to CSV first — read_csv is much faster

## Common Mistake

> [!warning] Using `sheet_name=0` assuming it is the right sheet when the file has multiple sheets. Print `pd.read_excel(path, sheet_name=None).keys()` to see sheet names first.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df = pd.read_excel('data.xlsx')
df = pd.read_excel('data.xlsx', sheet_name='Sales')
df = pd.read_excel('data.xlsx', sheet_name=0)      # first sheet
```

**Senior:**
```python
df2.to_excel(w, sheet_name='Summary', index=False)
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

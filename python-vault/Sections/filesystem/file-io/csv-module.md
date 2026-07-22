---
type: "entry"
domain: "python"
file: "filesystem"
section: "file-io"
id: "csv-module"
title: "csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()"
category: "Structured Data"
subtitle: "CSV file handling"
signature_short: "csv.reader(file), csv.writer(file), csv.DictReader(file), csv.DictWriter(file, fieldnames)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()"
  - "csv-module"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/file-io"
  - "category/structured-data"
  - "tier/tiered"
---

# csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()

> CSV file handling

## Overview

csv.reader/writer handle lists; DictReader/DictWriter handle dictionaries. DictReader auto-parses headers; DictWriter requires fieldnames parameter.

## Signature

```python
csv.reader(file), csv.writer(file), csv.DictReader(file), csv.DictWriter(file, fieldnames)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - DictReader + DictWriter; named columns over indices
# STRENGTHS - The cleanest API; cleaner than reader/writer with positional rows
# WEAKNESSES- No quoting, no dialect tuning
#
import csv

# Write
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["name", "age"])
    w.writeheader()
    w.writerows([{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}])

# Read
with open("out.csv", "r", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row)                                # {'name': 'Alice', 'age': '30'}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - newline="" and encoding always; quoting; type coercion at the boundary
# STRENGTHS - The four flags that prevent the most common CSV bugs
# WEAKNESSES- No streaming for huge files
#
import csv

# 1) newline="" is MANDATORY — without it, blank rows on Windows
#    encoding="utf-8" — without it, Windows / Excel writes funky bytes
#    encoding="utf-8-sig" reads Excel exports cleanly (strips BOM)
with open("excel_export.csv", "r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

# 2) Type coercion — DictReader gives you STRINGS; convert at the boundary
def parse_row(r):
    return {"name": r["name"],
            "age":  int(r["age"]),
            "active": r["active"].lower() in {"true", "1", "yes"}}

# 3) Quoting — the four policies
#    QUOTE_MINIMAL    quote only when needed (default)
#    QUOTE_ALL         quote every field
#    QUOTE_NONNUMERIC  quote non-numerics; READS as float
#    QUOTE_NONE       never quote (must escape delimiter manually)
with open("strict.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, quoting=csv.QUOTE_ALL)
    w.writerow(["a", "b,c", 'with "quote"'])

# 4) Custom delimiter (TSV)
with open("data.tsv", "r", encoding="utf-8", newline="") as f:
    for row in csv.reader(f, delimiter="\t"):
        print(row)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Streaming, dialects, csv vs pandas vs polars, error handling
# STRENGTHS - The decision rules + the bugs that bite at scale
# WEAKNESSES- N/A
#
import csv
import io

# 1) STREAMING — never list() a million-row CSV
def find_errors(path: str):
    with open(path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):              # one row at a time
            if row.get("status") == "ERROR":
                yield row

# 2) Sniff the DIALECT when you don't control the source
def smart_read(path: str):
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample)
        except csv.Error:
            dialect = csv.excel
        for row in csv.DictReader(f, dialect=dialect):
            yield row

# 3) DEFAULT escapechar — CSV quotes embedded quotes by DOUBLING them ("" inside "")
#    quotechar='"' is the default; escapechar=None means "use doubling, not backslash"
with open("hard.csv", "w", encoding="utf-8", newline="") as f:
    csv.writer(f).writerow(['contains a "quote"'])  # written as: "contains a ""quote"""

# 4) When the csv module ISN'T enough
#    - speed on big files                        -> pandas.read_csv / polars.read_csv (Rust + multi-threaded)
#    - schema-typed reads                          -> pandas with dtype= or pyarrow.csv
#    - JSON-shaped fields, embedded newlines       -> use a dedicated parser, not csv
#    - excel formulas / multiple sheets            -> openpyxl / xlrd / pandas read_excel

# 5) Error-tolerant reads — don't crash on bad rows; log and continue
def lenient(path: str):
    with open(path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 2):       # 2 = first data row (after header)
            try:
                yield {"id": int(row["id"]), "name": row["name"].strip()}
            except (KeyError, ValueError) as e:
                print(f"row {i}: {e}; row={row}")

# 6) UTF-8 BOMs — Excel and some Windows tools emit them
#    Read with encoding="utf-8-sig" — strips the BOM transparently.
#    Write with encoding="utf-8" (no BOM) for normal cross-platform use.

# Decision rule:
#   small CSV, simple                       -> csv.DictReader / DictWriter
#   Excel-exported CSV                       -> encoding="utf-8-sig", newline=""
#   millions of rows                          -> stream with a generator, never list()
#   need types / fast reads                   -> pandas.read_csv or polars.read_csv
#   unknown delimiter / quoting              -> csv.Sniffer().sniff(sample)
#   tab-separated                              -> csv.reader(f, delimiter="\t")
#
# Anti-pattern: open(csv_path) without newline=""
#   On Windows the writer doubles "\r" -> blank rows between every record;
#   the reader joins newlines wrong inside quoted fields. ALWAYS newline="".
```

## Decision Rule

```text
small CSV, simple                       -> csv.DictReader / DictWriter
Excel-exported CSV                       -> encoding="utf-8-sig", newline=""
millions of rows                          -> stream with a generator, never list()
need types / fast reads                   -> pandas.read_csv or polars.read_csv
unknown delimiter / quoting              -> csv.Sniffer().sniff(sample)
tab-separated                              -> csv.reader(f, delimiter="\t")
```

## Anti-Pattern

> [!warning] Anti-pattern
> open(csv_path) without newline=""
>   On Windows the writer doubles "\r" -> blank rows between every record;
>   the reader joins newlines wrong inside quoted fields. ALWAYS newline="".

## Tips

- Always use newline="" when opening CSV files to avoid extra blank lines on Windows
- DictReader returns strings; convert types (int, float) manually if needed
- DictWriter requires fieldnames; restkey/extrasaction control behavior

## Common Mistake

> [!warning] Opening CSV files without newline="" causes extra blank rows on Windows

## Shorthand (Junior → Senior)

**Junior:**
```python
import csv
with open('data.csv', 'r') as f:
    for row in csv.reader(f):
        name, age = row[0], row[1]
```

**Senior:**
```python
import csv
with open('data.csv', 'r') as f:
    for row in csv.DictReader(f):
        name, age = row['name'], row['age']
```

## See Also

- [[Sections/filesystem/file-io/json-module-fs|json.load(), json.dump(), json.loads(), json.dumps(), indent= (Filesystem & Paths)]]
- [[Sections/filesystem/file-io/_Index|Filesystem & Paths → File I/O — Reading & Writing]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "read-csv"
title: "pd.read_csv()"
category: "I/O"
subtitle: "The workhorse loader — always specify dtype= and usecols="
signature_short: "pd.read_csv(path, dtype=None, usecols=[], parse_dates=[], nrows=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.read_csv()"
  - "read-csv"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.read_csv()

> The workhorse loader — always specify dtype= and usecols=

## Overview

read_csv() is the most-used pandas function. Always specify usecols= to avoid loading unneeded columns, dtype= to prevent silent type inference, and parse_dates= for datetime columns. For files larger than memory, use chunksize=.

## Signature

```python
pd.read_csv(path, dtype=None, usecols=[], parse_dates=[], nrows=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one line: hand read_csv a path. Pandas guesses everything
#             else (header, separator, types).
# STRENGTHS - lets you see data immediately; perfect for one-off scripts
#             and notebook exploration.
# WEAKNESSES- silent type inference scans the whole file; column you
#             expect to be int may come back as object on one machine
#             and int64 on another. No control over memory or columns.
#
import pandas as pd

df = pd.read_csv("data.csv")
df.head()
df.dtypes               # always inspect — see what pandas inferred
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: usecols (don't load junk), dtype
#             (don't trust inference), parse_dates, index_col, na_values.
#             Round-trip with to_csv.
# STRENGTHS - this is the call shape you should be writing in real
#             ETL code; loading only what you need is the cheapest
#             memory win.
# WEAKNESSES- still loads the file into memory in one shot; for
#             out-of-RAM files you need chunksize (senior tier) or
#             switch to Parquet.
#
import pandas as pd

df = pd.read_csv(
    "data.csv",
    usecols     = ["id", "date", "amount"],
    dtype       = {"id": "Int64", "amount": "float64"},   # explicit
    parse_dates = ["date"],
    index_col   = "id",
    na_values   = ["", "NULL", "N/A", "-"],
    encoding    = "utf-8",
)

# Quick sanity check
df.dtypes              # confirm types match expectation
df.shape, df.isna().sum()

# Round-trip
df.to_csv("out.csv", index=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production loader: chunked iteration for files larger
#             than RAM, aggregate inside the loop (don't accumulate
#             chunks), pyarrow engine for speed, and the standing
#             advice — switch to Parquet for any intermediate file.
# STRENGTHS - bounded memory regardless of file size; ~2-5x faster
#             with engine="pyarrow"; aggregation pattern scales to
#             multi-GB CSVs without blowing the heap.
# WEAKNESSES- chunked logic is awkward to debug (state spread across
#             iterations); pyarrow engine has slightly different
#             error messages and edge cases vs the C engine; the real
#             answer for big data is "stop using CSV".
#
import pandas as pd

# 1. Chunked aggregation — process and reduce per chunk
running = []
for chunk in pd.read_csv(
    "huge.csv",
    chunksize   = 100_000,
    usecols     = ["region", "amount"],
    dtype       = {"region": "category", "amount": "float32"},
    engine      = "pyarrow",        # 2-5x faster than the default C engine
):
    running.append(chunk.groupby("region", observed=True)["amount"].sum())

totals = pd.concat(running).groupby(level=0).sum()

# 2. Sniff the schema with nrows= before committing to a full load
sniff = pd.read_csv("huge.csv", nrows=1000)
sniff.dtypes              # decide dtype= overrides for the real load

# 3. Wrong format for the job — switch to Parquet whenever possible
# df.to_parquet("data.parquet")     # write once
# pd.read_parquet("data.parquet", columns=["region", "amount"])  # column-selective

# Decision rule:
#   < 100 MB, ad-hoc                           -> pd.read_csv(path) (defaults are fine)
#   Big file, only need some columns           -> usecols=[...] (skips parsing other cols)
#   Tight memory                                -> dtype={...} + chunksize=N
#   Mixed/dirty data                            -> on_bad_lines='skip', engine='python'
#   Speed > flexibility                         -> engine='pyarrow' (~3-10x faster on wide data)
#   Need full datetime control                  -> parse_dates=[...] + date_format=...
#   File too big for one machine                -> dask.read_csv or polars.read_csv_batched
#   Need to preserve types exactly              -> use parquet, not CSV
#
# Anti-pattern: pd.read_csv("big.csv") with default dtype inference on production data
#   pandas walks the file once just to GUESS dtypes (every column starts as object,
#   then narrows). Pin dtype={"id": "int32", "city": "category"} up front: skips
#   the inference pass AND keeps memory predictable. Combine with usecols= so you
#   don't pay for columns you'll drop anyway.
```

## Decision Rule

```text
< 100 MB, ad-hoc                           -> pd.read_csv(path) (defaults are fine)
Big file, only need some columns           -> usecols=[...] (skips parsing other cols)
Tight memory                                -> dtype={...} + chunksize=N
Mixed/dirty data                            -> on_bad_lines='skip', engine='python'
Speed > flexibility                         -> engine='pyarrow' (~3-10x faster on wide data)
Need full datetime control                  -> parse_dates=[...] + date_format=...
File too big for one machine                -> dask.read_csv or polars.read_csv_batched
Need to preserve types exactly              -> use parquet, not CSV
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.read_csv("big.csv") with default dtype inference on production data
>   pandas walks the file once just to GUESS dtypes (every column starts as object,
>   then narrows). Pin dtype={"id": "int32", "city": "category"} up front: skips
>   the inference pass AND keeps memory predictable. Combine with usecols= so you
>   don't pay for columns you'll drop anyway.

## Tips

- Always `usecols=` on wide CSVs — loading 100 columns when you need 5 wastes memory
- `parse_dates=["col"]` parses a specific column; `parse_dates=True` only parses the index
- `dtype={"id": "Int64"}` uses nullable integer — handles NaN without converting to float
- Parquet is 10x faster to read than CSV — use it for all intermediate storage

## Common Mistake

> [!warning] Not specifying `dtype=` on load. Pandas guesses types by scanning rows — it may read numeric IDs as int64 on your machine but object on another. Be explicit.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df = pd.read_csv('data.csv')
# then manually set types:
df['date'] = pd.to_datetime(df['date'])
df['amount'] = df['amount'].astype(float)
df = df.dropna(subset=['id'])
```

**Senior:**
```python
df = pd.read_csv('data.csv',
    parse_dates=['date'],
    dtype={'amount': float},
    na_values=['N/A', ''],
    index_col='id')
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

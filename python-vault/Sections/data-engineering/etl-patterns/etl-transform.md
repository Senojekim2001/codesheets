---
type: "entry"
domain: "python"
file: "data-engineering"
section: "etl-patterns"
id: "etl-transform"
title: "ETL: Transform — Cleaning & Standardizing Data"
category: "ETL"
subtitle: "drop_duplicates, astype/cast, fillna, string normalization, regex, outlier handling"
signature_short: "df.drop_duplicates()  |  df.astype()  |  df.fillna()  |  df.str.upper()  |  df.clip()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ETL: Transform — Cleaning & Standardizing Data"
  - "etl-transform"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/etl-patterns"
  - "category/etl"
  - "tier/tiered"
---

# ETL: Transform — Cleaning & Standardizing Data

> drop_duplicates, astype/cast, fillna, string normalization, regex, outlier handling

## Overview

Transformation cleans and standardizes data. Deduplication removes exact duplicates (drop_duplicates) and fuzzy duplicates. Type casting ensures columns have correct types (int, float, date). Null handling: drop nulls, fillna with mean/mode/forward-fill, or create indicators. Normalization: uppercase/lowercase strings, trim whitespace, parse dates. Outlier handling: clip extreme values, remove statistical outliers.

## Signature

```python
df.drop_duplicates()  |  df.astype()  |  df.fillna()  |  df.str.upper()  |  df.clip()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - drop_duplicates + dropna + a couple of type casts
# STRENGTHS - The four-line cleanup that handles "obvious" data problems
# WEAKNESSES- No string normalization, no outlier handling, no docs
#
import pandas as pd

df = pd.read_csv("raw.csv")

clean = (df
    .drop_duplicates(subset=["order_id"])
    .dropna(subset=["order_id", "customer_id"])
    .astype({"customer_id": "int", "amount": "float"}))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - errors='coerce' for safe parsing, normalize strings, clip outliers
# STRENGTHS - The eight-step pipeline that handles real-world dirty data
# WEAKNESSES- No logging of what was dropped; no schema enforcement
#
import pandas as pd

df = pd.DataFrame({
    "order_id":    ["A1", "A1", "A2", None, "A3"],
    "customer_id": ["1", "1.0", "2", "3", "invalid"],
    "amount":      [99.99, 99.99, 150.50, -10, 5000],
    "region":      ["us", "US", "eu ", "APAC", "apac"],
    "date":        ["2024-01-01", "2024-01-01", "2024/02/15", "2024-03-01", "invalid"],
})

clean = (df
    # 1) Dedup THEN dropna so we count duplicates correctly
    .drop_duplicates(subset=["order_id"])
    .dropna(subset=["order_id"])

    # 2) Safe type casting — invalid values become NaN, then drop them
    .assign(
        customer_id=lambda d: pd.to_numeric(d["customer_id"], errors="coerce"),
        date=lambda d:        pd.to_datetime(d["date"],        errors="coerce"),
    )
    .dropna(subset=["customer_id", "date"])
    .astype({"customer_id": "int"})

    # 3) Normalize strings — strip BEFORE upper/lower
    .assign(region=lambda d: d["region"].str.strip().str.upper())

    # 4) Allowlist enum values
    .query("region in ['US', 'EU', 'APAC']")

    # 5) Clip outliers; fillna for any remaining numeric gaps
    .assign(amount=lambda d: d["amount"].clip(lower=0, upper=10_000))
)
print(f"kept {len(clean)} of {len(df)} rows")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Idempotent functions, logged drops, schema enforcement, fuzzy dedup
# STRENGTHS - The patterns that turn ad-hoc cleanup into a re-runnable pipeline
# WEAKNESSES- N/A
#
import logging
import pandas as pd
import pandera as pa
from pandera.typing import DataFrame, Series

log = logging.getLogger("etl.transform")

# 1) Each transform is a PURE function — easy to test, retry, compose
def dedup(df: pd.DataFrame, key: str) -> pd.DataFrame:
    before = len(df)
    out    = df.drop_duplicates(subset=[key], keep="last")     # keep newest if appended chronologically
    log.info("dedup: dropped %d / %d", before - len(out), before)
    return out

def coerce_types(df: pd.DataFrame) -> pd.DataFrame:
    out = df.assign(
        customer_id=pd.to_numeric(df["customer_id"], errors="coerce").astype("Int64"),
        amount=     pd.to_numeric(df["amount"],      errors="coerce"),
        order_date= pd.to_datetime(df["order_date"], errors="coerce", utc=True),
    )
    bad = out[["customer_id", "amount", "order_date"]].isna().any(axis=1).sum()
    if bad:
        log.warning("coerce: %d rows had unparseable values", bad)
    return out.dropna(subset=["customer_id", "amount", "order_date"])

def normalize_strings(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        region=df["region"].str.strip().str.upper(),
        email= df.get("email", pd.Series(dtype=str)).str.strip().str.lower(),
    )

def clip_outliers(df: pd.DataFrame, *, max_amount: float = 10_000) -> pd.DataFrame:
    n = (df["amount"] > max_amount).sum()
    if n:
        log.warning("clip: clipped %d amounts > %s", n, max_amount)
    return df.assign(amount=df["amount"].clip(lower=0, upper=max_amount))

# 2) Schema contract — fail loud if downstream invariants regress
class CleanSales(pa.DataFrameModel):
    order_id:    Series[str]
    customer_id: Series[int]   = pa.Field(gt=0)
    amount:      Series[float] = pa.Field(ge=0, le=10_000)
    region:      Series[str]   = pa.Field(isin=["US", "EU", "APAC"])
    order_date:  Series[pa.DateTime]
    class Config:
        coerce = True
        strict = True

# 3) Composition — predictable order of operations
@pa.check_types
def transform(df: pd.DataFrame) -> DataFrame[CleanSales]:
    return (df
            .pipe(dedup, key="order_id")
            .pipe(coerce_types)
            .pipe(normalize_strings)
            .pipe(lambda d: d[d["region"].isin(["US", "EU", "APAC"])])
            .pipe(clip_outliers))

# 4) Fuzzy dedup — same logical record under different formatting
def fuzzy_dedup_emails(df: pd.DataFrame) -> pd.DataFrame:
    norm = (df["email"]
              .str.lower()
              .str.replace(r"\+.*@", "@", regex=True))                # drop gmail "+tag"
    return df.assign(_email_norm=norm).drop_duplicates(subset=["_email_norm"]).drop(columns="_email_norm")

# Decision rule:
#   simple bad rows                         -> dropna / drop_duplicates
#   parseable but maybe broken values        -> errors='coerce' + dropna
#   string fields                              -> strip THEN upper/lower; do both
#   enum-style columns                          -> isin allowlist; never raw == comparisons
#   numeric outliers                            -> clip; or remove if domain-meaningless
#   schema must not regress                     -> Pandera @check_types contract
#   re-running the pipeline                      -> idempotent transforms; pure functions
#
# Anti-pattern: dropping NaNs without logging
#   The pipeline runs, the warehouse is "clean", and nobody knows that 30%
#   of yesterday's source rows were silently discarded. ALWAYS log counts
#   before / after; alert on the diff.
```

## Decision Rule

```text
simple bad rows                         -> dropna / drop_duplicates
parseable but maybe broken values        -> errors='coerce' + dropna
string fields                              -> strip THEN upper/lower; do both
enum-style columns                          -> isin allowlist; never raw == comparisons
numeric outliers                            -> clip; or remove if domain-meaningless
schema must not regress                     -> Pandera @check_types contract
re-running the pipeline                      -> idempotent transforms; pure functions
```

## Anti-Pattern

> [!warning] Anti-pattern
> dropping NaNs without logging
>   The pipeline runs, the warehouse is "clean", and nobody knows that 30%
>   of yesterday's source rows were silently discarded. ALWAYS log counts
>   before / after; alert on the diff.

## Tips

- Validate data counts at each step — e.g., after dedup, after type casting, after filtering. Catch issues early.
- Use errors="coerce" in pd.to_numeric() and pd.to_datetime() — converts invalid values to NaN instead of failing.
- Log what you removed (nulls, duplicates, outliers) — helps debug data quality issues later.
- Test transformations on a sample before running on full data — catch logic errors cheaply.

## Common Mistake

> [!warning] Not documenting what you cleaned — downstream users don't know data was deduplicated or nulls were filled, causing analysis errors.

## Shorthand (Junior → Senior)

**Junior:**
```python
df = df.drop_duplicates()
df = df.dropna(subset=["key_col"])
df["col"] = pd.to_numeric(df["col"], errors="coerce")
df = df[df["col"].notna()]
```

**Senior:**
```python
df.drop_duplicates().dropna(subset=["key_col"])
```

## See Also

- [[Sections/data-engineering/etl-patterns/etl-extract|ETL: Extract — Reading from Multiple Sources (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/etl-load|ETL: Load — Writing to Warehouse & Cloud (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/_Index|Data Engineering → ETL & Pipeline Patterns]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]

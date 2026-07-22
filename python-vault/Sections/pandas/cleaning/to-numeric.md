---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "to-numeric"
title: "pd.to_numeric()"
category: "Cleaning"
subtitle: "Safe numeric conversion — errors=\"coerce\" turns failures into NaN"
signature_short: "pd.to_numeric(series, errors=\"coerce\", downcast=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.to_numeric()"
  - "to-numeric"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# pd.to_numeric()

> Safe numeric conversion — errors="coerce" turns failures into NaN

## Overview

pd.to_numeric() converts a Series to numeric dtype. errors="coerce" turns any non-numeric value into NaN instead of raising — essential for messy real-world data. downcast= picks the smallest valid numeric type.

## Signature

```python
pd.to_numeric(series, errors="coerce", downcast=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one column, errors="coerce". Bad values become NaN
#             instead of crashing.
# STRENGTHS - the safe default for messy real-world data; one option
#             flag eliminates the most common conversion crash.
# WEAKNESSES- silently turns bad data into NaN — you should always
#             follow up with a "what failed?" check (junior tier).
#
import pandas as pd

df["price"] = pd.to_numeric(df["price"], errors="coerce")
# "$12.50" -> NaN
# "12.50"  -> 12.5
# "12"     -> 12.0
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: errors= flag spectrum, downcast
#             for memory wins, and the post-coerce audit ("which
#             original values became NaN?"). Apply across many
#             columns when an entire frame is suspect.
# STRENGTHS - covers what to_numeric actually looks like in a real
#             clean-up pipeline; the audit step is what separates
#             a careful conversion from a destructive one.
# WEAKNESSES- still loses information about why each value failed;
#             senior tier captures a "raw vs cleaned" diff for audit.
#
import pandas as pd

# errors= spectrum
df["price"] = pd.to_numeric(df["price"], errors="raise")    # ValueError
df["price"] = pd.to_numeric(df["price"], errors="coerce")   # NaN on fail
df["price"] = pd.to_numeric(df["price"], errors="ignore")   # leaves str

# downcast — pick the smallest valid numeric dtype
df["count"] = pd.to_numeric(df["count"], downcast="integer")  # int8/16/32
df["ratio"] = pd.to_numeric(df["ratio"], downcast="float")    # float32

# Post-coerce audit — what original values became NaN?
raw = df["price"]   # before
df["price_clean"] = pd.to_numeric(raw, errors="coerce")
failed = df.loc[df["price_clean"].isna() & raw.notna(), "price"]
failed.value_counts().head()

# Apply across an entire frame
numeric_df = df.apply(pd.to_numeric, errors="coerce")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade numeric cleanup: pre-clean common
#             garbage (currency symbols, thousand separators, percent
#             signs) before to_numeric, persist a parse-failure audit
#             alongside the cleaned column, and pick nullable Int64 /
#             Float64 to keep semantics in the presence of NaN.
# STRENGTHS - higher conversion rate (fewer rows lost to "$"); audit
#             column lets QA reproduce upstream mistakes; nullable
#             dtypes prevent silent int->float coercion.
# WEAKNESSES- regex pre-cleaning is locale-dependent (comma decimal
#             separators, currency placement); audit columns double
#             the column count for cleaned fields; nullable dtypes
#             can break older downstream code.
#
import pandas as pd

# 1. Pre-clean common formatting before parsing
def to_money(s: pd.Series) -> pd.Series:
    cleaned = (s.astype("string")
                 .str.replace(r"[^\d.\-]", "", regex=True)   # drop $ , %
                 .str.strip())
    return pd.to_numeric(cleaned, errors="coerce")

df["price"] = to_money(df["price"])

# 2. Audit column — keep the original alongside the cleaned value
df["price_raw"]    = df["price_raw"].astype("string")
df["price"]        = pd.to_numeric(df["price_raw"], errors="coerce")
df["price_failed"] = df["price"].isna() & df["price_raw"].notna()
audit = df.loc[df["price_failed"], ["price_raw"]].value_counts()
# audit.to_csv("audit/price_failures.csv")

# 3. Nullable Int64 — preserves "is missing" without int->float promotion
df["count"] = pd.to_numeric(df["count_raw"], errors="coerce").astype("Int64")

# 4. Locale-aware parsing — explicit parser when comma is the decimal mark
def to_eu_decimal(s: pd.Series) -> pd.Series:
    return pd.to_numeric(
        s.astype("string").str.replace(".", "", regex=False)   # thousands
                          .str.replace(",", ".", regex=False), # decimal
        errors="coerce",
    )

# Decision rule:
#   Clean string-numeric column                 -> pd.to_numeric(s)
#   Some values are dirt ("N/A", "")              -> errors="coerce" -> NaN
#   Need to keep bad rows visible                  -> errors="ignore" (returns object on failure)
#   Memory-tight                                  -> downcast="integer" / "float" / "unsigned"
#   Booleans coming as "True"/"False" strings     -> .map({"True":1,"False":0}) first
#   Currency / locale strings ("$1,234.56")        -> .str.replace(...) before to_numeric
#   Only some rows numeric                          -> coerce + later .dropna() / fillna
#   Repeated calls in a loop                        -> vectorize once on the whole column
#
# Anti-pattern: pd.to_numeric(s) without errors= on dirty data
#   Default errors="raise" blows up on the first bad row, mid-pipeline. Either
#   pre-clean the strings, or use errors="coerce" to convert bad rows to NaN
#   and report them downstream — visible bad data beats a silent crash.
```

## Decision Rule

```text
Clean string-numeric column                 -> pd.to_numeric(s)
Some values are dirt ("N/A", "")              -> errors="coerce" -> NaN
Need to keep bad rows visible                  -> errors="ignore" (returns object on failure)
Memory-tight                                  -> downcast="integer" / "float" / "unsigned"
Booleans coming as "True"/"False" strings     -> .map({"True":1,"False":0}) first
Currency / locale strings ("$1,234.56")        -> .str.replace(...) before to_numeric
Only some rows numeric                          -> coerce + later .dropna() / fillna
Repeated calls in a loop                        -> vectorize once on the whole column
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.to_numeric(s) without errors= on dirty data
>   Default errors="raise" blows up on the first bad row, mid-pipeline. Either
>   pre-clean the strings, or use errors="coerce" to convert bad rows to NaN
>   and report them downstream — visible bad data beats a silent crash.

## Tips

- `errors="coerce"` is the default choice for messy CSVs — bad values become NaN instead of crashing
- After coercing, check what failed: rows where the new column is NaN but the original was not
- `downcast="integer"` saves significant memory on integer columns with small ranges
- Use `pd.to_numeric` over `astype(float)` when data quality is unknown

## Common Mistake

> [!warning] Using `astype(float)` on a column with string values like "$12.50". It raises ValueError. Use `pd.to_numeric(errors="coerce")` and then clean the NaN values afterward.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

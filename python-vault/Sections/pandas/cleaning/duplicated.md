---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "duplicated"
title: ".duplicated() / .drop_duplicates()"
category: "Cleaning"
subtitle: "Detect duplicates with .duplicated(), remove with .drop_duplicates()"
signature_short: "df.duplicated(subset=None, keep=\"first\") | df.drop_duplicates()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".duplicated() / .drop_duplicates()"
  - "duplicated"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .duplicated() / .drop_duplicates()

> Detect duplicates with .duplicated(), remove with .drop_duplicates()

## Overview

duplicated() returns a boolean Series — True for rows that are duplicates. drop_duplicates() removes them. Both support subset= to check only specific columns, and keep= to control which occurrence to retain.

## Signature

```python
df.duplicated(subset=None, keep="first") | df.drop_duplicates()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - count duplicates, then drop them. Default behavior
#             ("first occurrence kept") is usually what you want for
#             a quick clean.
# STRENGTHS - two-line dedupe; the count step prevents "did I lose
#             half my data?" surprises.
# WEAKNESSES- "duplicated on all columns" is rarely the right
#             definition; subset= is what you actually need. Junior
#             tier covers it.
#
import pandas as pd

df.duplicated().sum()        # how many duplicate rows?
df = df.drop_duplicates()    # keep the first occurrence of each
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: subset= for key-based dedupe,
#             keep= to control which occurrence wins, keep=False to
#             surface ALL duplicate rows (including the first), and
#             reset_index after dedupe to avoid gappy indices.
# STRENGTHS - matches how dedupe shows up in real ETL: dedupe by
#             business key, not by entire row; keep=False is the
#             move when you need to investigate WHY there are dupes.
# WEAKNESSES- doesn't address near-duplicates (same data, different
#             whitespace / casing) — those need a normalize step
#             before dedupe (senior tier).
#
import pandas as pd

# Count and inspect
df.duplicated().sum()
df.duplicated(subset=["id"]).sum()             # by business key
df[df.duplicated(keep=False)].sort_values("id")  # show ALL occurrences

# Drop with explicit key + keep policy
df = df.drop_duplicates(subset=["email"])             # one row per email
df = df.drop_duplicates(subset=["name", "date"])      # composite key

# After deduplication, reset the index — otherwise it has gaps
df = df.drop_duplicates(subset=["id"]).reset_index(drop=True)

# keep= options
# 'first' (default)  - keep first occurrence
# 'last'             - keep last occurrence
# False              - drop ALL duplicates (including the first)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - normalize before deduplicating (case, whitespace,
#             unicode), break ties on a sort column so "keep latest"
#             is correct, and persist a duplicate-rate metric for
#             ongoing data quality monitoring.
# STRENGTHS - catches near-duplicates that exact-match misses; sort-
#             then-drop_duplicates is the canonical "keep most recent"
#             pattern; tracking duplicate rate over time surfaces
#             upstream issues quickly.
# WEAKNESSES- normalization rules are domain-specific (do you fold
#             accents? lowercase emails? trim middle initials?);
#             sort+dedupe only works when you have a usable tie-break
#             column; metrics need a place to land (a database, a
#             dashboard).
#
import pandas as pd

# 1. Normalize before dedupe — exact-match misses near-duplicates
def normalize_key(s: pd.Series) -> pd.Series:
    return (s.astype("string")
             .str.strip()
             .str.lower()
             .str.normalize("NFKC"))

df["email_key"] = normalize_key(df["email"])
df = df.drop_duplicates(subset=["email_key"]).drop(columns="email_key")

# 2. Keep the LATEST per key — sort first, then drop_duplicates(keep="last")
df = (df.sort_values("updated_at")
        .drop_duplicates(subset=["customer_id"], keep="last")
        .reset_index(drop=True))

# 3. For fuzzy / typo-level dedupe, exact match isn't enough — reach
#    for the dedupe library, recordlinkage, or a simple Levenshtein pass.

# 4. Track the duplicate rate over time — a sudden spike is the
#    earliest signal of an upstream pipeline regression
def dup_rate(df: pd.DataFrame, subset: list[str]) -> float:
    return df.duplicated(subset=subset).mean()

# log_metric("dedupe.dup_rate", dup_rate(df, ["customer_id", "date"]))

# Decision rule:
#   Boolean mask of dups                        -> df.duplicated()
#   Keep first occurrence (default)              -> keep="first"
#   Keep last                                    -> keep="last"
#   Mark ALL dups (no "kept") flag                -> keep=False
#   Dedupe the frame                             -> df.drop_duplicates()
#   Subset of columns                             -> subset=["a","b"]
#   Count of dups                                -> df.duplicated().sum()
#   Need group sizes per duplicate                -> df.groupby(cols).size().loc[lambda s: s>1]
#
# Anti-pattern: drop_duplicates() without subset= when only some columns define identity
#   "Same user, same event, different timestamp" should NOT be deduped if you
#   intended uniqueness on (user_id, event). Always pass subset=[...] to spell
#   out what defines a duplicate; otherwise you're at the mercy of every column.
```

## Decision Rule

```text
Boolean mask of dups                        -> df.duplicated()
Keep first occurrence (default)              -> keep="first"
Keep last                                    -> keep="last"
Mark ALL dups (no "kept") flag                -> keep=False
Dedupe the frame                             -> df.drop_duplicates()
Subset of columns                             -> subset=["a","b"]
Count of dups                                -> df.duplicated().sum()
Need group sizes per duplicate                -> df.groupby(cols).size().loc[lambda s: s>1]
```

## Anti-Pattern

> [!warning] Anti-pattern
> drop_duplicates() without subset= when only some columns define identity
>   "Same user, same event, different timestamp" should NOT be deduped if you
>   intended uniqueness on (user_id, event). Always pass subset=[...] to spell
>   out what defines a duplicate; otherwise you're at the mercy of every column.

## Tips

- `df[df.duplicated(keep=False)]` shows ALL rows involved in duplicates — including the first occurrence
- `subset=` is critical — often you want to dedupe on a key column, not all columns combined
- Always `reset_index(drop=True)` after `drop_duplicates()` — the original index has gaps otherwise
- For fuzzy/near-duplicate detection, look at the `dedupe` library

## Common Mistake

> [!warning] `drop_duplicates()` without `subset=` requires ALL columns to match. A row with the same ID but different timestamp is NOT a duplicate. Always specify the key columns.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/astype|.astype() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

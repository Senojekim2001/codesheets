---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "dropna"
title: ".dropna()"
category: "Cleaning"
subtitle: "Drop with subset=, how=, and thresh= for surgical removal"
signature_short: "df.dropna(subset=[], how=\"any\", thresh=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".dropna()"
  - "dropna"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .dropna()

> Drop with subset=, how=, and thresh= for surgical removal

## Overview

dropna() removes rows (or columns) with NaN. subset= limits to specific columns. thresh= keeps rows with at least N non-NaN values. Always check how many rows you lose before committing.

## Signature

```python
df.dropna(subset=[], how="any", thresh=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - count nulls first, then drop. Always reassign the result.
# STRENGTHS - reinforces the most important habit: KNOW what you're
#             dropping before you drop it.
# WEAKNESSES- bare dropna() drops any row with any null — which is
#             usually the WRONG default for a real dataset.
#
import pandas as pd

df.isna().any(axis=1).sum()        # how many rows have ANY null?
df = df.dropna()                   # remove them (reassign — returns a copy)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: subset= for surgical drops on
#             specific columns, how="all" to remove only fully-empty
#             rows, thresh= to keep rows with at least N non-null
#             values, axis=1 to drop COLUMNS instead.
# STRENGTHS - this is what dropna actually looks like in real code —
#             targeted, not blanket. Keeps your row count honest.
# WEAKNESSES- doesn't surface the "you just dropped 80% of your data"
#             scenario that bare dropna() causes; senior tier adds
#             the safety check.
#
import pandas as pd

# Surgical drop — only on the columns that matter
df = df.dropna(subset=["id", "amount"])      # require id AND amount

# Drop only rows that are completely empty
df = df.dropna(how="all")

# Keep rows with enough complete data
df = df.dropna(thresh=4)                     # require >= 4 non-null values

# Drop COLUMNS that are mostly null
df = df.dropna(axis=1, thresh=int(len(df) * 0.5))   # cols with >=50% non-null

# Always reassign — dropna returns a new frame by default
df = df.dropna(subset=["id"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production dropna: assert how many rows you'll lose
#             before dropping, log the drop reason for audit, and
#             prefer fillna over dropna whenever the row carries
#             usable signal. Treat "drop" as an explicit decision,
#             never a default.
# STRENGTHS - prevents silent catastrophic data loss; named drops
#             are auditable; "fillna over dropna" preserves sample
#             size for ML.
# WEAKNESSES- adds ceremony to what could be a one-liner; the loss
#             threshold is domain-specific (1% may be fine, 10% may
#             not be); fillna can introduce bias of its own.
#
import pandas as pd
import logging

log = logging.getLogger(__name__)

def safe_dropna(df: pd.DataFrame, subset: list[str],
                max_loss_pct: float = 5.0) -> pd.DataFrame:
    before = len(df)
    out = df.dropna(subset=subset).reset_index(drop=True)
    lost = (before - len(out)) / before * 100
    if lost > max_loss_pct:
        raise ValueError(
            f"dropna(subset={subset}) would drop {lost:.1f}% of rows "
            f"(max {max_loss_pct}%); investigate upstream nulls first"
        )
    log.info("dropna(subset=%s) removed %d rows (%.2f%%)",
             subset, before - len(out), lost)
    return out

df = safe_dropna(df, subset=["id", "amount"])

# Anti-pattern in production:
#   df = df.dropna()                # blanket drop — silently nukes data
# Better:
#   df = df.dropna(subset=key_cols) # explicit, auditable
#   OR
#   df = df.fillna({"amount": 0})   # if 0 is semantically valid

# When dropna IS the right call:
#   - id-shaped columns where missingness means "row is invalid"
#   - small (<1%) tail of incomplete rows in a large frame
# When it ISN'T:
#   - majority of rows have at least one null somewhere -> use thresh=
#     or fillna instead

# Decision rule:
#   Drop rows with ANY null                     -> df.dropna() (default how="any")
#   Drop rows where ALL are null                  -> how="all"
#   Drop based on specific columns                 -> subset=["col1","col2"]
#   Threshold (need at least N non-null)           -> thresh=N
#   Drop columns with too many nulls              -> axis=1 + thresh
#   Filter without modifying                       -> df[df.col.notna()] (single col, faster)
#   Imputation might be better                    -> .fillna or sklearn SimpleImputer
#   Time series with gaps                          -> .ffill/.bfill or interpolation, not drop
#
# Anti-pattern: dropna() before joining when nulls are meaningful
#   Throwing away rows because col_X is null can hide systematic missingness
#   (sensor offline, opt-out users). dropna() is destructive — first chart the
#   missingness pattern (df.isna().mean()) and decide if drop, fill, or flag
#   ("missing as a category") is right.
```

## Decision Rule

```text
Drop rows with ANY null                     -> df.dropna() (default how="any")
Drop rows where ALL are null                  -> how="all"
Drop based on specific columns                 -> subset=["col1","col2"]
Threshold (need at least N non-null)           -> thresh=N
Drop columns with too many nulls              -> axis=1 + thresh
Filter without modifying                       -> df[df.col.notna()] (single col, faster)
Imputation might be better                    -> .fillna or sklearn SimpleImputer
Time series with gaps                          -> .ffill/.bfill or interpolation, not drop
```

## Anti-Pattern

> [!warning] Anti-pattern
> dropna() before joining when nulls are meaningful
>   Throwing away rows because col_X is null can hide systematic missingness
>   (sensor offline, opt-out users). dropna() is destructive — first chart the
>   missingness pattern (df.isna().mean()) and decide if drop, fill, or flag
>   ("missing as a category") is right.

## Tips

- Always `df.isna().sum()` first — know what you are losing before you drop
- `subset=["col"]` only drops rows where that specific column is null — much more surgical than plain `dropna()`
- `thresh=n` is useful when you want to keep rows with *mostly* complete data
- `dropna()` returns a new DataFrame by default — always reassign the result

## Common Mistake

> [!warning] Calling `df.dropna()` without subset= or thresh=. If any column has nulls, every row with that null is dropped — often 80%+ of your data.

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
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/astype|.astype() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

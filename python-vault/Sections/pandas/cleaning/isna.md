---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "isna"
title: ".isna()"
category: "Cleaning"
subtitle: "Quantify nulls before deciding how to handle them"
signature_short: "df.isna() | df.isna().sum() | df[df[\"col\"].isna()]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".isna()"
  - "isna"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .isna()

> Quantify nulls before deciding how to handle them

## Overview

isna() returns True for NaN/NaT/None values. Always quantify missing data before deciding how to handle it — blindly dropping rows with any NaN can silently destroy most of a dataset.

## Signature

```python
df.isna() | df.isna().sum() | df[df["col"].isna()]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call: isna().sum() per column. The first thing to
#             do on any new DataFrame.
# STRENGTHS - smallest possible diagnostic — turns "any nulls?" into
#             a one-liner.
# WEAKNESSES- doesn't show percentages, row-level masks, or the
#             empty-string trap.
#
import pandas as pd

df.isna().sum()
# id        0
# date    150
# amount    0
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday isna idioms: per-column proportions, row-
#             level "any null" / "all null" masks, column selection
#             by null presence, and notna for the inverse.
# STRENGTHS - covers the main patterns you'll write before any
#             dropna/fillna decision; the "always count first" habit
#             prevents catastrophic data loss.
# WEAKNESSES- doesn't catch empty-string nulls or NaT-vs-NaN
#             differences in mixed-dtype frames — senior tier.
#
import pandas as pd

df.isna().sum()                         # per column
df.isna().mean().mul(100).round(1)      # percentage per column
df.isna().sum().sum()                   # grand total

df[df["date"].isna()]                   # rows where one col is null
df[df.isna().any(axis=1)]               # rows with ANY null
df[df.isna().all(axis=1)]               # rows that are all-null

df.loc[:, df.isna().any()]              # columns that have any null

df[df["date"].notna()]                  # inverse mask
df[df.notna().all(axis=1)]              # rows with no nulls at all
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production null audit: catch empty-string and whitespace
#             nulls (isna misses them), summarize per-column null
#             rates with rolling baselines, and treat "missingness
#             pattern" as a feature in itself.
# STRENGTHS - prevents silent data loss; baselines catch upstream
#             schema regressions; missingness-as-signal sometimes
#             improves model performance.
# WEAKNESSES- replace(regex=) is slow on huge object columns; baseline
#             checks add ops surface; treating missingness as a
#             feature can leak label-related signal if not careful.
#
import pandas as pd
import numpy as np

# 1. Catch the empty-string / whitespace null trap before isna()
df = df.replace(r"^\s*$", pd.NA, regex=True)

# 2. Comprehensive null report
report = pd.DataFrame({
    "null_count": df.isna().sum(),
    "null_pct":   df.isna().mean().mul(100).round(2),
    "dtype":      df.dtypes.astype(str),
}).sort_values("null_pct", ascending=False)

# 3. Drift check against a baseline (CI / pipeline test)
baseline = pd.read_parquet("schema/null_pct_baseline.parquet")["null_pct"]
delta    = (report["null_pct"] - baseline.reindex(report.index).fillna(0))
flagged  = delta[delta.abs() > 5.0]      # >5pp drift in null rate

# 4. Missingness as signal — sometimes the FACT that a value is missing
#    correlates with the target variable
df["had_email"] = df["email"].notna()    # candidate feature for ML

# 5. NaN vs NaT vs None vs NA in mixed dtypes
#    isna() handles all four uniformly — but downstream serialization
#    (to_json, to_sql) may differ. Pin types BEFORE writing out.

# Decision rule:
#   Element-wise null check                     -> df.isna() (alias .isnull())
#   Per-column null count                         -> df.isna().sum()
#   Drop rows with any null                       -> df.dropna()
#   Filter to rows WITH null in a column          -> df[df.col.isna()]
#   Filter to non-null                            -> df[df.col.notna()]
#   Coverage % per column                         -> 1 - df.isna().mean()
#   Treat empty-string as null too                 -> .replace("", np.nan).isna()
#   Inf as null                                   -> df.replace([np.inf, -np.inf], np.nan).isna()
#
# Anti-pattern: comparing to NaN with == -> df[df.col == np.nan]
#   NaN != NaN by IEEE rules, so the mask is all False. You silently get an
#   empty DataFrame and "no nulls" — even when half the column is NaN. Always
#   use .isna() / .notna(); never compare with == np.nan.
```

## Decision Rule

```text
Element-wise null check                     -> df.isna() (alias .isnull())
Per-column null count                         -> df.isna().sum()
Drop rows with any null                       -> df.dropna()
Filter to rows WITH null in a column          -> df[df.col.isna()]
Filter to non-null                            -> df[df.col.notna()]
Coverage % per column                         -> 1 - df.isna().mean()
Treat empty-string as null too                 -> .replace("", np.nan).isna()
Inf as null                                   -> df.replace([np.inf, -np.inf], np.nan).isna()
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing to NaN with == -> df[df.col == np.nan]
>   NaN != NaN by IEEE rules, so the mask is all False. You silently get an
>   empty DataFrame and "no nulls" — even when half the column is NaN. Always
>   use .isna() / .notna(); never compare with == np.nan.

## Tips

- Run `df.isna().sum()` before any `dropna()` — you may be about to drop most of your data
- `df.isna().mean()` gives proportions — multiply by 100 for percentages
- `df.notna()` is cleaner than `~df.isna()` for readability
- Empty strings `""` are NOT nulls — use `df.replace(r"^\s*$", pd.NA, regex=True)` to convert them

## Common Mistake

> [!warning] Assuming `df.isna()` catches empty strings. `""` and `"  "` are valid strings, not NaN. Check with `(df == "").sum()` as well.

## Shorthand (Junior → Senior)

**Junior:**
```python
from typing import Optional, Union, List, Dict, Callable, Tuple, Any
df.isna().sum()
df.isna().mean().mul(100).round(1)
df.isna().sum().sum()
```

**Senior:**
```python
df.notna().all(axis=1)         # rows with no nulls at all
```

## See Also

- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/astype|.astype() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

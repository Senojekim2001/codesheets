---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "nunique"
title: ".nunique()"
category: "Inspection"
subtitle: "Cardinality check — essential before type conversion"
signature_short: "df.nunique() | df[\"col\"].nunique()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".nunique()"
  - "nunique"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .nunique()

> Cardinality check — essential before type conversion

## Overview

nunique() counts distinct values per column. Essential before deciding which columns to convert to the category dtype (low cardinality = good candidate). Also useful for spotting ID columns (nunique == len(df)) and constant columns (nunique == 1).

## Signature

```python
df.nunique() | df["col"].nunique()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call: nunique() per column. Reads like a table of
#             cardinalities you can scan top-down.
# STRENGTHS - the fastest "shape of the data" diagnostic — IDs jump
#             out (count = N), constants jump out (count = 1).
# WEAKNESSES- raw counts hide the ratio that actually matters
#             (uniqueness fraction); doesn't separate IDs from real
#             high-cardinality columns.
#
import pandas as pd

df.nunique()
# name     1000      <- ID-shaped (every row unique)
# city       47      <- good category candidate
# status      3      <- definitely category
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday cardinality idioms: ratio of uniques to
#             rows for category candidates, single-column drill-downs
#             with unique() and value_counts(), and dropna=False to
#             see whether NaN is silently inflating cardinality.
# STRENGTHS - turns nunique from a number into a decision: which
#             columns to category-encode, which look like IDs, which
#             look like constants.
# WEAKNESSES- the 50% threshold is a heuristic — string content matters
#             too (high-cardinality long strings as category cost MORE
#             memory than object). Senior tier handles that.
#
import pandas as pd

# Cardinality ratio — lower is "more category-shaped"
ratio = df.nunique() / len(df)
ratio.sort_values()                     # smallest = best category candidates

# Auto-pick category candidates with a 50% threshold
cat_cols = ratio[ratio < 0.5].index
df[cat_cols] = df[cat_cols].astype("category")

# Single column drill-down
df["city"].nunique()                    # integer count
df["city"].unique()                     # the actual distinct values
df["city"].value_counts(dropna=False)   # count per value, NaN included

# Per-row uniqueness (rare but occasionally useful)
df.nunique(axis=1)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - convert nunique into a memory-aware decision: only
#             category-encode columns where the average string is short
#             enough that the dictionary saves more than it costs;
#             flag IDs explicitly so they don't leak into models or
#             aggregations; spot drift by tracking nunique over time.
# STRENGTHS - prevents the "I categorized everything and used MORE
#             memory" footgun; ID flagging documents intent for the
#             next reader; cardinality drift is a great early signal
#             of upstream schema changes.
# WEAKNESSES- average-length is a heuristic; pyarrow string dtype
#             has changed the calculus (often beats category for
#             high-cardinality strings now); drift checks add ops cost.
#
import pandas as pd

# 1. Category-vs-object decision based on memory, not just cardinality
def category_candidates(df: pd.DataFrame, ratio_max: float = 0.5,
                        avg_len_min: float = 4.0) -> list[str]:
    out = []
    for c in df.select_dtypes("object").columns:
        if df[c].nunique() / len(df) > ratio_max:
            continue
        avg_len = df[c].dropna().astype(str).str.len().mean()
        if avg_len >= avg_len_min:           # short strings rarely worth it
            out.append(c)
    return out

cat_cols = category_candidates(df)
df[cat_cols] = df[cat_cols].astype("category")

# 2. Flag ID-shaped columns — exclude from features, joins-only
ids = df.nunique()[df.nunique() == len(df)].index.tolist()
constants = df.nunique()[df.nunique() == 1].index.tolist()       # drop these

# 3. Cardinality drift detector — compare today's frame to a baseline
baseline = pd.read_parquet("schema/baseline_nunique.parquet")["nunique"]
today    = df.nunique()
delta    = (today - baseline.reindex(today.index).fillna(0)) / baseline
flagged  = delta[delta.abs() > 0.2]              # >20% drift -> investigate

# Decision rule:
#   Count distinct values in a column           -> s.nunique()
#   Count distinct PER COLUMN                    -> df.nunique() (returns a Series)
#   Include NaN as a value                        -> dropna=False
#   Per-group distinct count                      -> df.groupby(g)[col].nunique()
#   Need the actual distinct values               -> s.unique() (no count)
#   Cardinality ratio                             -> s.nunique() / len(s) (1.0 = unique key)
#   Very large data                               -> approximate via HyperLogLog (datasketch)
#   Want unique combinations across columns       -> df[[a,b]].drop_duplicates().shape[0]
#
# Anti-pattern: len(set(s)) instead of s.nunique() on big Series
#   Materializing a Python set forces every value through Python — orders of
#   magnitude slower than nunique() (which uses pandas-native hashing) and
#   doesn't honor dropna semantics. Always nunique() for cardinality counts.
```

## Decision Rule

```text
Count distinct values in a column           -> s.nunique()
Count distinct PER COLUMN                    -> df.nunique() (returns a Series)
Include NaN as a value                        -> dropna=False
Per-group distinct count                      -> df.groupby(g)[col].nunique()
Need the actual distinct values               -> s.unique() (no count)
Cardinality ratio                             -> s.nunique() / len(s) (1.0 = unique key)
Very large data                               -> approximate via HyperLogLog (datasketch)
Want unique combinations across columns       -> df[[a,b]].drop_duplicates().shape[0]
```

## Anti-Pattern

> [!warning] Anti-pattern
> len(set(s)) instead of s.nunique() on big Series
>   Materializing a Python set forces every value through Python — orders of
>   magnitude slower than nunique() (which uses pandas-native hashing) and
>   doesn't honor dropna semantics. Always nunique() for cardinality counts.

## Tips

- Columns where `nunique / len(df) < 0.5` are good `"category"` dtype candidates — saves memory
- Columns where `nunique == len(df)` are probably IDs — flag them before aggregation
- Columns where `nunique == 1` are constant — drop them before modeling
- Combine with `value_counts()` to see both count AND distribution

## Common Mistake

> [!warning] Converting all `object` columns to `"category"` without checking cardinality first. High-cardinality strings (names, emails, free text) as `category` actually use MORE memory than `object`.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.nunique()
df.nunique() / len(df)
cat_cols = df.nunique()[df.nunique() / len(df) < 0.5].index
df[cat_cols] = df[cat_cols].astype('category')
```

**Senior:**
```python
df['city'].nunique(dropna=False)
```

## See Also

- [[Sections/pandas/inspection/info|.info() (Pandas)]]
- [[Sections/pandas/inspection/describe|.describe() (Pandas)]]
- [[Sections/pandas/inspection/value-counts|.value_counts() (Pandas)]]
- [[Sections/pandas/inspection/head-tail|.head() / .tail() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "isin"
title: ".isin()"
category: "Selection"
subtitle: "Membership filter — cleaner than chained == comparisons"
signature_short: "df[df[\"col\"].isin([val1, val2, val3])]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".isin()"
  - "isin"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/selection"
  - "tier/tiered"
---

# .isin()

> Membership filter — cleaner than chained == comparisons

## Overview

.isin() checks each element against a list, set, or Series of values and returns a boolean mask. Much cleaner than multiple `==` conditions chained with `|`. Also works with ~isin() for exclusion.

## Signature

```python
df[df["col"].isin([val1, val2, val3])]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ask "is this column's value one of these?" with a list.
#             Filter with the resulting boolean mask.
# STRENGTHS - shortest possible alternative to OR-chains; reads as
#             "city in cities".
# WEAKNESSES- doesn't yet show exclusion (~), set-based lookups, or
#             cross-DataFrame membership checks.
#
import pandas as pd

cities = ["NYC", "LA", "SF"]
df[df["city"].isin(cities)]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - day-to-day patterns: ~ for exclusion, set-typed lookups
#             for speed on big lists, cross-frame "is this row's id in
#             that frame's id column?" filtering, and combining isin
#             masks with & for compound conditions.
# STRENGTHS - covers ~95% of real isin use; the cross-frame pattern is
#             how you express "inner-join membership" without a join.
# WEAKNESSES- doesn't surface the NaN trap (NaN is never == NaN, so
#             isin treats it as not-a-member) — that's senior-tier.
#
import pandas as pd

cities = ["NYC", "LA", "SF"]

df[df["city"].isin(cities)]                      # include
df[~df["city"].isin(["Chicago", "Houston"])]     # exclude

# Set-typed lookup (O(1) per row vs O(N) for list)
valid = {"A", "B", "C"}
df[df["status"].isin(valid)]

# Membership against another DataFrame
df[df["id"].isin(other_df["id"])]

# Combine isin masks with & / |
df[df["city"].isin(cities) & df["status"].isin(["active", "pending"])]

# Flag column instead of filter
df["is_target_city"] = df["city"].isin(cities)

# isin on the index
df[df.index.isin([1, 5, 10])]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production isin: handle NaN explicitly (isin treats it
#             as not-a-member), use Index.isin for huge label lookups
#             (skips the to-array detour), and compare against
#             merge/.query() — picking the right tool for each shape.
# STRENGTHS - the NaN-aware filter is correct; Index.isin is the
#             fastest membership check on large key sets; knowing when
#             merge beats isin saves performance on big joins.
# WEAKNESSES- merge with indicator= reads more code than isin for
#             simple cases; very large value sets still cost O(N) to
#             build the lookup; some edge cases (categoricals with
#             missing categories) require .cat.add_categories first.
#
import pandas as pd
import numpy as np

# 1. NaN trap: NaN is never "in" anything — handle it explicitly
df["city_norm"] = df["city"].fillna("__MISSING__")
mask = df["city_norm"].isin(["NYC", "LA", "__MISSING__"])
df[mask]                                  # NaN rows kept by intent

# 2. Index.isin — best path for huge index lookups
keep_ids = pd.Index(other_df["id"].unique())
df[df["id"].isin(keep_ids)]               # uses hash table internally

# 3. When isin is the wrong tool — large two-key join
# Worse:
#   df[df["id"].isin(other["id"]) & df["region"].isin(other["region"])]
# Better — actual join with indicator=:
joined = df.merge(other_df[["id", "region"]],
                  on=["id", "region"],
                  how="left",
                  indicator=True)
matched = joined[joined["_merge"] == "both"].drop(columns="_merge")

# 4. Categorical edge case — value not in declared categories
# df["status"].isin(["archived"]) is False until "archived" is a category:
# df["status"] = df["status"].cat.add_categories(["archived"])

# Decision rule:
#   Filter to a known set of values             -> df[df.col.isin([...])]
#   Negate (NOT IN)                              -> df[~df.col.isin([...])]
#   Set is large (10k+ values)                   -> still fine; isin uses a hash set
#   Cross-column "in"                            -> df.isin({"col1": [...], "col2": [...]})
#   Filter to another DataFrame's column         -> df[df.col.isin(other.col)]
#   Need fuzzy match                              -> NOT isin; use .str.contains or regex
#   Performance vs equality chain                  -> isin beats (col==a) | (col==b) | ...
#   Need to keep order or counts                   -> isin returns a mask; pair with sort/groupby
#
# Anti-pattern: chaining many ORed equality checks instead of isin
#   df[(df.col == "a") | (df.col == "b") | (df.col == "c") | ...] is O(N*K)
#   in Python attribute access. df[df.col.isin(["a","b","c",...])] is O(N) with
#   a hash-set lookup. The readability and speed both improve.
```

## Decision Rule

```text
Filter to a known set of values             -> df[df.col.isin([...])]
Negate (NOT IN)                              -> df[~df.col.isin([...])]
Set is large (10k+ values)                   -> still fine; isin uses a hash set
Cross-column "in"                            -> df.isin({"col1": [...], "col2": [...]})
Filter to another DataFrame's column         -> df[df.col.isin(other.col)]
Need fuzzy match                              -> NOT isin; use .str.contains or regex
Performance vs equality chain                  -> isin beats (col==a) | (col==b) | ...
Need to keep order or counts                   -> isin returns a mask; pair with sort/groupby
```

## Anti-Pattern

> [!warning] Anti-pattern
> chaining many ORed equality checks instead of isin
>   df[(df.col == "a") | (df.col == "b") | (df.col == "c") | ...] is O(N*K)
>   in Python attribute access. df[df.col.isin(["a","b","c",...])] is O(N) with
>   a hash-set lookup. The readability and speed both improve.

## Tips

- `isin()` with a `set` is faster than with a `list` for large value collections — O(1) vs O(n) lookup
- `~df["col"].isin(vals)` is the clean exclusion pattern
- `df["col"].isin(other_df["col"])` filters to rows that exist in another DataFrame
- Combine with `.query()`: `df.query("city in @cities")` — equivalent and often more readable

## Common Mistake

> [!warning] Using `== None` or `== np.nan` inside isin. NaN is never equal to anything including itself. Use `df["col"].isna()` separately to check for nulls.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/pandas/selection/loc|.loc[] (Pandas)]]
- [[Sections/pandas/selection/iloc|.iloc[] (Pandas)]]
- [[Sections/pandas/selection/query|.query() (Pandas)]]
- [[Sections/pandas/selection/between|.between() (Pandas)]]
- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

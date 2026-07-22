---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "nlargest-nsmallest"
title: ".nlargest() / .nsmallest()"
category: "Transform"
subtitle: "Faster than sort + head for getting the top or bottom N rows"
signature_short: "df.nlargest(n, \"col\") | df.nsmallest(n, \"col\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".nlargest() / .nsmallest()"
  - "nlargest-nsmallest"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .nlargest() / .nsmallest()

> Faster than sort + head for getting the top or bottom N rows

## Overview

nlargest() and nsmallest() return the top or bottom N rows by a column value. They use a heap internally — O(n log k) instead of O(n log n) for a full sort. Significantly faster than sort_values().head() when k is small relative to n.

## Signature

```python
df.nlargest(n, "col") | df.nsmallest(n, "col")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - top N or bottom N rows by a column. One call. Reads
#             like English.
# STRENGTHS - the right tool for "top 10 by salary"; faster than
#             sort + head and clearer at the call site.
# WEAKNESSES- doesn't yet show keep= (what happens with ties) or
#             per-group top-N — those are the everyday extensions.
#
import pandas as pd

df.nlargest(10, "salary")              # top 10 highest
df.nsmallest(5,  "score")              # bottom 5 lowest
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: keep= for tie behavior, multi-
#             column tiebreakers, the Series form, and per-group
#             top-N via groupby + apply.
# STRENGTHS - covers nlargest in real analytical code: "top 3 per
#             dept", "top 10 with bonus as tiebreaker", "first vs
#             all ties".
# WEAKNESSES- groupby + apply(nlargest) is correct but slow on big
#             frames; senior tier shows the rank-based alternative.
#
import pandas as pd

# Tiebreakers via list of columns
df.nlargest(10, ["salary", "bonus"])

# Tie behavior — first/last/all
df.nlargest(5, "score", keep="first")     # default
df.nlargest(5, "score", keep="last")
df.nlargest(5, "score", keep="all")       # may return > 5 rows on ties

# Series form
df["salary"].nlargest(5)
df["salary"].nsmallest(3)

# Per-group top-N
top3 = (df.groupby("dept", group_keys=False)
          .apply(lambda g: g.nlargest(3, "salary"))
          .reset_index(drop=True))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production top-N: prefer rank() filtering for per-
#             group top-N (vectorized, no apply), pick rank methods
#             intentionally (dense vs min vs first), and reach for
#             nlargest only when N is small AND there's no group key.
# STRENGTHS - rank-based top-N is 5-50x faster than groupby+apply
#             on big frames; explicit method= chooses the tie
#             semantics; the decision rule (heap vs rank) makes the
#             code review obvious.
# WEAKNESSES- rank-based top-N requires an extra column briefly;
#             ranking ties differently from nlargest's keep= can
#             surprise readers; on tiny groups the speedup over
#             apply is negligible.
#
import pandas as pd

# 1. Per-group top-N without apply — vectorized via rank()
df["rank"] = (df.groupby("dept")["salary"]
                .rank(method="dense", ascending=False))
top_per_dept = (df[df["rank"] <= 3]
                  .sort_values(["dept", "rank"])
                  .reset_index(drop=True))
df = df.drop(columns="rank")              # cleanup

# 2. Rank methods — choose the tie semantics deliberately
#    method="first"   - ties get unique ranks by row order        (1,2,3,4)
#    method="min"     - ties share the lowest rank, gaps after    (1,1,3,4)
#    method="dense"   - ties share the rank, no gaps              (1,1,2,3)
#    method="average" - ties share the mean rank                  (1,1.5,2,3)

# 3. Heap (nlargest) vs full sort — when each is the right call
#    nlargest(N, col)            -> O(n log N) — best for small N, no groups
#    sort_values(col).head(N)    -> O(n log n) — when you need full ordering
#    rank() + filter + sort      -> best for per-group top-N at scale

# 4. Anti-pattern: a Python loop per group. groupby(...)+apply or
#    rank-based filtering is always faster and keeps the result
#    pandas-native (no list-of-frames glue).

# Decision rule:
#   Top N by a column                           -> df.nlargest(N, "score")
#   Bottom N                                     -> df.nsmallest(N, "score")
#   Tie behaviour: keep all                       -> keep="all"
#   Tie behaviour: pick last                      -> keep="last"
#   Multi-key tiebreak                             -> df.nlargest(N, ["score","ts"])
#   Want sort + head equivalent                    -> nlargest is faster (O(n log k))
#   Need full ranking                              -> .rank() then filter
#   Group-wise top N                               -> df.groupby(g).apply(lambda x: x.nlargest(N, c))
#
# Anti-pattern: df.sort_values(col, ascending=False).head(N) for tiny N on huge data
#   sort_values is O(n log n) over the WHOLE frame; nlargest(N, col) is O(n log N)
#   via a heap. For N=10 on a 10M-row frame, that's a 6x speedup. Same correctness,
#   better algorithm.
```

## Decision Rule

```text
Top N by a column                           -> df.nlargest(N, "score")
Bottom N                                     -> df.nsmallest(N, "score")
Tie behaviour: keep all                       -> keep="all"
Tie behaviour: pick last                      -> keep="last"
Multi-key tiebreak                             -> df.nlargest(N, ["score","ts"])
Want sort + head equivalent                    -> nlargest is faster (O(n log k))
Need full ranking                              -> .rank() then filter
Group-wise top N                               -> df.groupby(g).apply(lambda x: x.nlargest(N, c))
```

## Anti-Pattern

> [!warning] Anti-pattern
> df.sort_values(col, ascending=False).head(N) for tiny N on huge data
>   sort_values is O(n log n) over the WHOLE frame; nlargest(N, col) is O(n log N)
>   via a heap. For N=10 on a 10M-row frame, that's a 6x speedup. Same correctness,
>   better algorithm.

## Tips

- `nlargest(n, col)` is significantly faster than `sort_values(col).head(n)` for large DataFrames
- `keep="all"` returns all tied rows — result may have more than n rows
- Works on both DataFrame and Series — `df["col"].nlargest(5)` returns a Series
- For per-group top-N, use `groupby().apply(lambda g: g.nlargest(n, col))`

## Common Mistake

> [!warning] Using `sort_values("col", ascending=False).head(n)` when you just need the top N rows. Use `nlargest(n, "col")` — same result, much faster on large DataFrames.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.nlargest(10, 'salary')
df.nsmallest(5, 'score')
df.nlargest(10, ['salary', 'bonus'])
```

**Senior:**
```python
df.groupby('dept').apply(lambda g: g.nlargest(3, 'salary'))
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

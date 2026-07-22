---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "multiindex"
title: "MultiIndex"
category: "MultiIndex"
subtitle: "Multi-level indexing for panel data, pivot results, and groupby output"
signature_short: "df.set_index([\"col1\",\"col2\"]) | pd.MultiIndex.from_tuples()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MultiIndex"
  - "multiindex"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/multiindex"
  - "tier/tiered"
---

# MultiIndex

> Multi-level indexing for panel data, pivot results, and groupby output

## Overview

A MultiIndex allows multiple levels of labels on rows or columns. Created automatically by groupby + agg, pivot_table, and set_index with a list. Most useful for panel data (same entity measured over time) and hierarchical grouping.

## Signature

```python
df.set_index(["col1","col2"]) | pd.MultiIndex.from_tuples()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest way to get a MultiIndex: set_index with a
#             list of column names. Look at it; reset back to flat.
# STRENGTHS - reveals that MultiIndex is just "more than one column
#             promoted to the index"; the round-trip with reset_index
#             takes the mystery out.
# WEAKNESSES- doesn't yet show construction from tuples / product, the
#             tuple-key gotcha, or pd.IndexSlice — those are how you
#             use a MultiIndex once you have one.
#
import pandas as pd

# Promote two columns into a hierarchical index
df = df.set_index(["year", "month"])

df.head()
df.index.names                    # ['year', 'month']
df.reset_index()                  # back to a flat frame
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - construct via tuples / product, access with the right
#             tuple keys, slice across levels with slice(None) and
#             flatten MultiIndex columns produced by groupby/pivot.
# STRENGTHS - covers the day-to-day MultiIndex moves: build, look up,
#             slice, flatten. Most pandas users will only need this
#             tier 90% of the time.
# WEAKNESSES- slice(None) is ugly enough that most people prefer
#             pd.IndexSlice — that's the senior tier.
#
import pandas as pd

# Build from tuples
idx = pd.MultiIndex.from_tuples(
    [("2024", "Jan"), ("2024", "Feb"), ("2025", "Jan")],
    names=["year", "month"],
)

# Build the cartesian product of two label sets
idx = pd.MultiIndex.from_product(
    [["2023", "2024"], ["Q1", "Q2", "Q3", "Q4"]],
    names=["year", "quarter"],
)

# Access — TUPLE keys for multi-level row, NOT comma-separated
df.loc["2024"]                          # all rows where level 0 == "2024"
df.loc[("2024", "Jan")]                 # specific (year, month)
df.loc[("2024", "Jan"), "sales"]        # plus a column

# Slice across levels with slice(None)
df.loc["2024":"2025"]                   # range on first level
df.loc[(slice(None), "Q1"), :]          # all years, Q1 only

# Flatten MultiIndex columns produced by groupby + agg or pivot_table
df.columns = ["_".join(map(str, c)) for c in df.columns]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production MultiIndex: pd.IndexSlice for readable cross-
#             section slicing, .xs() to drop a level cleanly, ensure
#             the index is sorted (perf + correctness), and remember
#             that groupby(as_index=False) often skips the MultiIndex
#             entirely.
# STRENGTHS - IndexSlice replaces slice(None) gymnastics; .xs is the
#             one-liner for "all rows at level=this label"; sorted
#             index makes range slices both fast and correctness-safe;
#             as_index=False is the lightweight escape hatch.
# WEAKNESSES- IndexSlice still requires noting axis= for column
#             slicing; .xs(drop_level=False) is needed when you want
#             to keep the level; very deep MultiIndex (3+ levels)
#             becomes hard to read regardless.
#
import pandas as pd

idx = pd.IndexSlice

# Sort the index — required for range slicing and ~10x faster lookups
df = df.sort_index()

# 1. IndexSlice — readable replacement for slice(None) chains
df.loc[idx["2024", "Q1":"Q3"], :]                 # year 2024, Q1..Q3
df.loc[idx[:, "Q1"], ["sales", "units"]]          # Q1 only, two columns

# 2. Cross-section with .xs — drop a level on the way out
df.xs("Q1", level="quarter")                      # all years, Q1
df.xs("Q1", level="quarter", drop_level=False)    # keep the level

# 3. Avoid MultiIndex entirely when you don't need it
flat = df.reset_index()
flat = (df.reset_index()
          .groupby(["year", "quarter"], as_index=False)
          .agg(sales=("sales", "sum")))

# 4. Anti-pattern — comma instead of tuple
# Wrong:  df.loc["2024", "Jan"]   <- interpreted as row="2024", col="Jan"
# Right:  df.loc[("2024", "Jan")]
# (using IndexSlice avoids this trap entirely)

# Decision rule:
#   Time series + entity panel                  -> MultiIndex on (date, entity)
#   Pivot result                                 -> usually returns MultiIndex columns
#   Hierarchical groups (region/country/city)    -> MultiIndex captures hierarchy explicitly
#   Slice all of one level                       -> df.loc[("US", slice(None)), :]
#   Slice on inner level                          -> use pd.IndexSlice: df.loc[idx[:, "X"], :]
#   Want to flatten                              -> df.reset_index() or columns=df.columns.to_flat_index()
#   Want to sort for fast slicing                 -> df.sort_index() (CRITICAL for perf)
#   Multi-key joins                              -> set both sides' MultiIndex, then df.join
#
# Anti-pattern: slicing a MultiIndex without sorting it first
#   Unsorted MultiIndex raises PerformanceWarning AND falls back to O(n) scans.
#   Always df = df.sort_index() right after any operation that disturbs the
#   index order (concat, append, certain merges). Check with df.index.is_monotonic_increasing.
```

## Decision Rule

```text
Time series + entity panel                  -> MultiIndex on (date, entity)
Pivot result                                 -> usually returns MultiIndex columns
Hierarchical groups (region/country/city)    -> MultiIndex captures hierarchy explicitly
Slice all of one level                       -> df.loc[("US", slice(None)), :]
Slice on inner level                          -> use pd.IndexSlice: df.loc[idx[:, "X"], :]
Want to flatten                              -> df.reset_index() or columns=df.columns.to_flat_index()
Want to sort for fast slicing                 -> df.sort_index() (CRITICAL for perf)
Multi-key joins                              -> set both sides' MultiIndex, then df.join
```

## Anti-Pattern

> [!warning] Anti-pattern
> slicing a MultiIndex without sorting it first
>   Unsorted MultiIndex raises PerformanceWarning AND falls back to O(n) scans.
>   Always df = df.sort_index() right after any operation that disturbs the
>   index order (concat, append, certain merges). Check with df.index.is_monotonic_increasing.

## Tips

- `df.loc["2024"]` selects all rows where the first index level is "2024"
- Flatten MultiIndex columns after aggregation: `df.columns = ["_".join(c) for c in df.columns]`
- `pd.IndexSlice` makes complex MultiIndex slicing more readable: `idx = pd.IndexSlice; df.loc[idx["2024", "Q1":"Q3"], :]`
- Most MultiIndex confusion comes from groupby — use `as_index=False` to avoid it when you do not need it

## Common Mistake

> [!warning] Trying to access a MultiIndex row with `df.loc["2024", "Jan"]`. This is interpreted as row="2024", col="Jan". Use `df.loc[("2024", "Jan")]` (tuple) for a MultiIndex row.

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

- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

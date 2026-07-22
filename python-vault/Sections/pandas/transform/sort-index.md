---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "sort-index"
title: ".sort_index()"
category: "Transform"
subtitle: "Sort by index labels — essential after concat or groupby"
signature_short: "df.sort_index(axis=0, ascending=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".sort_index()"
  - "sort-index"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .sort_index()

> Sort by index labels — essential after concat or groupby

## Overview

sort_index() sorts by the row index (axis=0) or column index (axis=1). Commonly needed after pd.concat() which may produce an unsorted index, or after groupby operations that return groups in arbitrary order.

## Signature

```python
df.sort_index(axis=0, ascending=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sort by the row index. Use it whenever the index has
#             meaning (date, label) and the rows are out of order.
# STRENGTHS - one call, applies whether the index is integer,
#             string, or datetime.
# WEAKNESSES- doesn't yet differentiate sort_index from sort_values
#             — junior tier surfaces when each is right.
#
import pandas as pd

df = df.sort_index()                       # ascending by index
df = df.sort_index(ascending=False)        # descending
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday cases: alphabetical column ordering,
#             post-concat fix, MultiIndex level sort, and the
#             monotonicity check that confirms whether range slicing
#             is safe.
# STRENGTHS - covers the patterns where sort_index is the RIGHT
#             tool: cleaning up after concat or set_index, ordering
#             columns predictably, ensuring slice safety.
# WEAKNESSES- doesn't surface the "sorted index unlocks fast lookups"
#             angle or the binary-search performance benefit —
#             senior tier.
#
import pandas as pd

# Alphabetical column order — useful for diff-friendly output
df = df.sort_index(axis=1)

# After concat, indexes are interleaved — sort to restore order
combined = pd.concat([df1, df2]).sort_index()

# After set_index — required for any range slicing
ts = df.set_index("date").sort_index()

# MultiIndex — sort by a specific level
ts.sort_index(level="year")
ts.sort_index(level=["year", "month"])

# Verify before relying on order
ts.index.is_monotonic_increasing             # True/False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - sort_index is a performance tool too: a sorted
#             DatetimeIndex makes .loc[range] use binary search
#             (O(log n) instead of O(n)), and resample/asfreq
#             require monotonic time. Combine with reindex when
#             you need a regular grid.
# STRENGTHS - speeds up slicing on large time-series frames;
#             prevents the silent-wrong-output trap when resample
#             is called on an unsorted index; reindex fills missing
#             timestamps explicitly rather than guessing.
# WEAKNESSES- sorting a 100M-row index is expensive — do it once
#             at load time; reindex requires picking a freq that
#             matches the data; mixed monotonic / non-monotonic
#             segments can hide if you only check the head/tail.
#
import pandas as pd

# 1. Sort once at load time — every subsequent .loc range slice is fast
ts = (pd.read_parquet("events.parquet")
        .set_index("ts")
        .sort_index())                            # one-time O(n log n)

ts.loc["2024-03-01":"2024-03-08"]                 # binary search now

# 2. resample / rolling / asfreq REQUIRE a monotonic index
assert ts.index.is_monotonic_increasing
ts["amount"].resample("D").sum()

# 3. Fill in a regular grid — reindex against a generated date range
full_idx = pd.date_range(ts.index.min(), ts.index.max(), freq="h")
hourly = ts.reindex(full_idx)                     # NaN for missing hours
hourly["amount"] = hourly["amount"].fillna(0)

# 4. After concat, choose between sort_index and ignore_index based on
#    whether the index has meaning
combined = pd.concat([a, b], ignore_index=True)   # discard old index
ordered  = pd.concat([a, b]).sort_index()         # keep + sort

# 5. Anti-pattern: relying on insertion order without sort_index().
#    pd.concat preserves each frame's index — the result is rarely
#    monotonic, and downstream slice/resample silently misbehaves.

# Decision rule:
#   Sort by index (default)                     -> df.sort_index()
#   Multi-index, sort by level                    -> level=0 / level="date"
#   Sort columns alphabetically                  -> axis=1
#   Required before MultiIndex slicing            -> df.sort_index() unblocks slice perf
#   Descending                                    -> ascending=False
#   After concat                                   -> sort_index() to restore order
#   Time-series resample/rolling                   -> requires monotonic index; sort first
#   Want to sort by a value, not the index        -> use .sort_values, NOT .sort_index
#
# Anti-pattern: rolling/resample on a non-monotonic datetime index
#   pandas raises or returns garbage when the index isn't monotonic_increasing.
#   After any concat / append / merge that disturbs index order, sort_index()
#   before time-aware operations. Check with df.index.is_monotonic_increasing.
```

## Decision Rule

```text
Sort by index (default)                     -> df.sort_index()
Multi-index, sort by level                    -> level=0 / level="date"
Sort columns alphabetically                  -> axis=1
Required before MultiIndex slicing            -> df.sort_index() unblocks slice perf
Descending                                    -> ascending=False
After concat                                   -> sort_index() to restore order
Time-series resample/rolling                   -> requires monotonic index; sort first
Want to sort by a value, not the index        -> use .sort_values, NOT .sort_index
```

## Anti-Pattern

> [!warning] Anti-pattern
> rolling/resample on a non-monotonic datetime index
>   pandas raises or returns garbage when the index isn't monotonic_increasing.
>   After any concat / append / merge that disturbs index order, sort_index()
>   before time-aware operations. Check with df.index.is_monotonic_increasing.

## Tips

- Always sort the index after `pd.concat()` — it preserves original indexes which may be out of order
- `sort_index(axis=1)` alphabetically sorts column names — useful for consistent column ordering
- A sorted index enables binary search for faster `.loc[]` lookups on large DataFrames
- `reset_index(drop=True)` creates a clean 0-based integer index — use when the old index has no meaning

## Common Mistake

> [!warning] Calling `sort_values("col")` when you actually want `sort_index()`. After setting a date column as the index, use `sort_index()` — not `sort_values("date")`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.sort_index()                      # ascending (default)
df.sort_index(ascending=False)       # descending
df.sort_index(axis=1)
```

**Senior:**
```python
df.index.is_monotonic_decreasing
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

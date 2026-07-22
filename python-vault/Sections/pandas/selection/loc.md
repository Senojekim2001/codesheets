---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "loc"
title: ".loc[]"
category: "Selection"
subtitle: "Label-based indexing — inclusive slices, boolean masks, setting values"
signature_short: "df.loc[row_labels, col_labels]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".loc[]"
  - "loc"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/selection"
  - "tier/tiered"
---

# .loc[]

> Label-based indexing — inclusive slices, boolean masks, setting values

## Overview

loc[] selects by label — index values for rows, column names for columns. Slices are inclusive on both ends. Accepts scalars, lists, slices, and boolean arrays. The correct way to set values conditionally.

## Signature

```python
df.loc[row_labels, col_labels]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basics only: pick rows by label, pick a single cell.
#             Show that loc takes [rows, cols] in one bracket pair.
# STRENGTHS - reveals the API in three lines without slicing or boolean
#             masks getting in the way.
# WEAKNESSES- doesn't yet show inclusive slicing (the loc surprise),
#             boolean masks, or conditional assignment — the things
#             you'll do daily.
#
import pandas as pd

df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]}, index=["x", "y", "z"])

df.loc["x"]            # whole row "x" as a Series
df.loc["x", "A"]       # scalar — 1
df.loc[:, "A"]         # whole column A
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday loc surface: inclusive slicing, multi-row /
#             multi-col selection, boolean masks (with &/|/~), and
#             conditional assignment via df.loc[mask, col] = value.
# STRENGTHS - this is the call shape that prevents the SettingWithCopy
#             warning and most chained-indexing bugs.
# WEAKNESSES- doesn't cover IndexSlice / MultiIndex slicing or .at for
#             scalar-fast access — those are the senior tier.
#
import pandas as pd

df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]}, index=["x", "y", "z"])

# Slicing — INCLUSIVE on both ends with loc
df.loc["x":"y", "A"]                  # rows "x" and "y", column A

# Multi-row / multi-col
df.loc[["x", "z"], ["A", "B"]]

# Boolean masks — & | ~  (never Python and/or/not on Series)
df.loc[df["A"] > 1]
df.loc[(df["A"] > 1) & (df["B"] < 6)]
df.loc[(df["A"] == 1) | (df["A"] == 3)]
df.loc[~(df["A"] == 2)]

# Conditional assignment — single call, no chained indexing
df.loc[df["A"] > 2, "B"] = 0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-shape loc: .at for scalar-fast reads/writes,
#             pd.IndexSlice for readable MultiIndex slicing, and the
#             "always use loc for write" rule that avoids the
#             SettingWithCopyWarning entirely.
# STRENGTHS - .at is ~100x faster than .loc for a single cell; IndexSlice
#             is the only sane way to slice MultiIndex without ugly
#             slice() literals; the loc-only-for-writes rule eliminates
#             a whole class of "did this actually update the frame?"
#             bugs.
# WEAKNESSES- .at requires both labels to exist (no slicing, no masks);
#             IndexSlice is verbose for simple cases; loc-for-writes
#             can still surprise when the underlying frame is itself a
#             view (use .copy() at the boundary if in doubt).
#
import pandas as pd

df = pd.DataFrame(
    {"A": [1, 2, 3], "B": [4, 5, 6]},
    index=["x", "y", "z"],
)

# 1. .at — fast scalar access (read AND write)
df.at["x", "A"]                      # read
df.at["x", "A"] = 99                 # write — no copy ambiguity

# 2. MultiIndex slicing with IndexSlice
mi = df.set_index(["A", "B"], append=True)            # toy example
idx = pd.IndexSlice
# all outer labels, A in 1..2, all columns
# mi.loc[idx[:, 1:2, :], :]

# 3. Conditional update — always one loc call, never chained
mask = (df["A"] > 1) & (df["B"] < 6)
df.loc[mask, ["A", "B"]] = [0, 0]

# 4. Defend against view ambiguity at the boundary
def update_low_a(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()                   # explicit owned frame
    df.loc[df["A"] < 3, "A"] = 0
    return df

# Anti-patterns to avoid:
#   df["A"][df["A"] > 1] = 0          # chained indexing — may write to a copy
#   df.loc[df.A > 1].B = 0            # chained loc + attribute — same trap

# Decision rule:
#   Lookup by LABEL (any axis)                  -> df.loc[row_label, col_label]
#   Boolean filter on rows                       -> df.loc[mask, cols]
#   Set values on a subset                        -> df.loc[mask, col] = value (avoids SettingWithCopyWarning)
#   Range of LABELS (inclusive both ends!)        -> df.loc["2024-01":"2024-03"]
#   Position-based lookup                         -> use .iloc, NOT .loc
#   Multi-index slicing                           -> pd.IndexSlice or .loc[(a, b), :]
#   Need to chain assignments                     -> use .loc once with 2D access, not df[col][mask] = ...
#   Set with a callable (idiomatic chaining)     -> df.loc[lambda d: d.x > 0, "y"] = ...
#
# Anti-pattern: chained indexing for assignment -> df[mask][col] = value
#   pandas can't tell whether df[mask] is a view or a copy; the assignment may
#   silently fail (SettingWithCopyWarning). Always use the SINGLE 2D access
#   pattern: df.loc[mask, col] = value. Same for df.loc[mask][col] = ... — it's
#   still chained. The 2D indexer is the only safe form.
```

## Decision Rule

```text
Lookup by LABEL (any axis)                  -> df.loc[row_label, col_label]
Boolean filter on rows                       -> df.loc[mask, cols]
Set values on a subset                        -> df.loc[mask, col] = value (avoids SettingWithCopyWarning)
Range of LABELS (inclusive both ends!)        -> df.loc["2024-01":"2024-03"]
Position-based lookup                         -> use .iloc, NOT .loc
Multi-index slicing                           -> pd.IndexSlice or .loc[(a, b), :]
Need to chain assignments                     -> use .loc once with 2D access, not df[col][mask] = ...
Set with a callable (idiomatic chaining)     -> df.loc[lambda d: d.x > 0, "y"] = ...
```

## Anti-Pattern

> [!warning] Anti-pattern
> chained indexing for assignment -> df[mask][col] = value
>   pandas can't tell whether df[mask] is a view or a copy; the assignment may
>   silently fail (SettingWithCopyWarning). Always use the SINGLE 2D access
>   pattern: df.loc[mask, col] = value. Same for df.loc[mask][col] = ... — it's
>   still chained. The 2D indexer is the only safe form.

## Tips

- `loc[]` slices are **inclusive** on both ends — `"x":"z"` includes `"z"`
- Always use `df.loc[condition, "col"] = value` for conditional assignment — not chained indexing
- `.at["row", "col"]` is ~100x faster than `.loc` for a single scalar value
- Use `&` `|` `~` for boolean masks — never Python `and` `or` `not` on Series
- In functions that mutate, take an explicit `df = df.copy()` at the boundary — pandas 2.x copy-on-write is not yet the universal default and silent view writes still trip teams

## Common Mistake

> [!warning] `df["col"][condition] = value` (chained assignment) may silently modify a copy. Always use `df.loc[condition, "col"] = value`.

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

- [[Sections/pandas/selection/iloc|.iloc[] (Pandas)]]
- [[Sections/pandas/selection/query|.query() (Pandas)]]
- [[Sections/pandas/selection/isin|.isin() (Pandas)]]
- [[Sections/pandas/selection/between|.between() (Pandas)]]
- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "iloc"
title: ".iloc[]"
category: "Selection"
subtitle: "Position-based indexing — exclusive end, negative indexing"
signature_short: "df.iloc[row_pos, col_pos]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".iloc[]"
  - "iloc"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/selection"
  - "tier/tiered"
---

# .iloc[]

> Position-based indexing — exclusive end, negative indexing

## Overview

iloc[] selects by integer position (0-based). Slices are exclusive at the end — like Python ranges. Use iloc[] only when you explicitly need positional access, not when you want labels.

## Signature

```python
df.iloc[row_pos, col_pos]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - first row, last row, single cell. Position-only.
# STRENGTHS - smallest possible introduction; makes the contrast with
#             label-based loc immediately visible.
# WEAKNESSES- doesn't yet show slicing (where iloc differs from loc),
#             negative indexing, or the "prefer loc in production" rule.
#
import pandas as pd

df.iloc[0]              # first row
df.iloc[-1]             # last row
df.iloc[0, 1]           # cell at row 0, col 1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the iloc surface you actually use: EXCLUSIVE-end slicing,
#             negative indices, list selection, every-Nth-row stride.
#             Show that iloc[:5] == head(5) and iloc[-5:] == tail(5).
# STRENGTHS - the slicing rule (exclusive end) is the #1 reason iloc
#             feels different from loc; making it explicit prevents a
#             whole class of off-by-one bugs.
# WEAKNESSES- still position-based — fragile in pipelines that add or
#             remove rows. Senior tier covers when to prefer loc and
#             when iloc is actually the right call.
#
import pandas as pd

df.iloc[[0, 2]]                # rows 0 and 2
df.iloc[0:2]                   # rows 0 and 1 — END IS EXCLUSIVE
df.iloc[:, 0]                  # all rows, column 0
df.iloc[1:3, 0:2]              # rows 1-2, cols 0-1

df.iloc[-3:-1]                 # third-to-last and second-to-last
df.iloc[:, -1]                 # last column

df.iloc[:5]                    # same as df.head(5)
df.iloc[-5:]                   # same as df.tail(5)
df.iloc[::2]                   # every other row (stride)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - knowing when iloc is right and when it isn't: use it for
#             genuinely positional ops (random sampling, every-Nth row,
#             drop-the-last-N-rows), use .iat for scalar-fast access,
#             reach back to loc for label-based work.
# STRENGTHS - codifies the "iloc when position is the meaning" rule;
#             .iat avoids the slow indexing path; loc-vs-iloc is one
#             of the cleanest separations in pandas once internalized.
# WEAKNESSES- iloc breaks silently when upstream code reorders or
#             filters rows; some teams ban iloc entirely outside of
#             head/tail-style helpers. Pick a convention and stick to it.
#
import pandas as pd

df = pd.DataFrame({"A": [1, 2, 3, 4, 5], "B": list("vwxyz")})

# 1. .iat — fast scalar access by integer position
df.iat[0, 1]                   # 'v'
df.iat[0, 1] = "V"             # write

# 2. Genuinely positional patterns — iloc is the RIGHT tool here
last_n = df.iloc[-3:]                          # last 3 regardless of index
every_other = df.iloc[::2]                     # stride
random_pos = df.iloc[df.sample(2).index]       # back to loc via labels

# 3. Anti-pattern — iloc to identify business rows
# Wrong: df.iloc[0]            -- "the first row" is a position, not a meaning
# Right: df.loc[df["id"] == "first_business_id"]
#        or: df.sort_values("date").iloc[0]   -- still positional, but only
#                                                after an explicit sort

# 4. The slice rule, side by side
# loc  -> ENDPOINTS INCLUSIVE      df.loc["x":"z"]   includes "z"
# iloc -> END EXCLUSIVE            df.iloc[0:3]      stops at index 2

# Decision rule:
#   Lookup by INTEGER position                  -> df.iloc[i, j]
#   Range of POSITIONS (exclusive end)           -> df.iloc[0:10, :]   (rows 0-9)
#   Last row / column                             -> df.iloc[-1, :] / df.iloc[:, -1]
#   Don't care about the index labels             -> .iloc is index-agnostic
#   Random row sampling by position               -> df.iloc[np.random.choice(len(df), 100)]
#   Need labels                                   -> use .loc, NOT .iloc
#   Need to mix positions and labels              -> not supported; pick one (or chain reset_index())
#   Common bug source                              -> after a sort/filter, integer positions move
#
# Anti-pattern: using iloc for "the row I just appended" without resetting index
#   df.iloc[len(df)-1] only equals "the last appended row" if the index is
#   contiguous 0..n-1. After filtering, sorting, or merging, that's not true.
#   Either use .loc with an explicit label, or reset_index(drop=True) right
#   before the iloc call to guarantee positional == numeric label.
```

## Decision Rule

```text
Lookup by INTEGER position                  -> df.iloc[i, j]
Range of POSITIONS (exclusive end)           -> df.iloc[0:10, :]   (rows 0-9)
Last row / column                             -> df.iloc[-1, :] / df.iloc[:, -1]
Don't care about the index labels             -> .iloc is index-agnostic
Random row sampling by position               -> df.iloc[np.random.choice(len(df), 100)]
Need labels                                   -> use .loc, NOT .iloc
Need to mix positions and labels              -> not supported; pick one (or chain reset_index())
Common bug source                              -> after a sort/filter, integer positions move
```

## Anti-Pattern

> [!warning] Anti-pattern
> using iloc for "the row I just appended" without resetting index
>   df.iloc[len(df)-1] only equals "the last appended row" if the index is
>   contiguous 0..n-1. After filtering, sorting, or merging, that's not true.
>   Either use .loc with an explicit label, or reset_index(drop=True) right
>   before the iloc call to guarantee positional == numeric label.

## Tips

- `iloc[]` end is **exclusive** — `iloc[0:2]` gives rows 0 and 1, not 2
- Use `.iat[row, col]` for fast single-value access by position
- Prefer `loc[]` in production code — positional access breaks when rows are added/removed
- `df.iloc[:, :5]` selects the first 5 columns — useful when you do not know column names

## Common Mistake

> [!warning] Mixing up loc and iloc slicing rules. `loc["a":"c"]` includes "c"; `iloc[0:3]` excludes position 3. The slice end behavior is opposite.

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
- [[Sections/pandas/selection/query|.query() (Pandas)]]
- [[Sections/pandas/selection/isin|.isin() (Pandas)]]
- [[Sections/pandas/selection/between|.between() (Pandas)]]
- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "head-tail"
title: ".head() / .tail()"
category: "Inspection"
subtitle: "Quick preview — default is 5 rows"
signature_short: "df.head(n=5) | df.tail(n=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".head() / .tail()"
  - "head-tail"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .head() / .tail()

> Quick preview — default is 5 rows

## Overview

head() and tail() return the first or last n rows. The default is 5. Essential for quickly previewing data after loading or transformation. Use in combination with .info() and .describe() for initial exploration.

## Signature

```python
df.head(n=5) | df.tail(n=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - default head() and tail() give the first/last 5 rows.
#             Pass a number for a different count.
# STRENGTHS - smallest possible data preview; the muscle-memory call
#             after every read_csv.
# WEAKNESSES- only shows the edges of the data — middle rows are
#             where data quality issues actually hide.
#
import pandas as pd

df.head()              # first 5 rows
df.head(10)            # first 10
df.tail()              # last 5
df.tail(3)             # last 3
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the canonical "I just loaded this" sequence: shape ->
#             head -> info -> describe. Use tail(10) to catch trailing
#             totals/metadata rows that sneak into CSV exports.
# STRENGTHS - codifies the post-load checklist in 4 lines; tail(10)
#             is the quietly-saved-me-many-times move.
# WEAKNESSES- still sees only the edges. For real data quality checks,
#             sample() is better (covered in the next entry).
#
import pandas as pd

df = pd.read_csv("data.csv")

# Standard post-load sequence
print(df.shape)        # how big is it?
df.head()              # what does it look like?
df.info()              # what are the types?
df.describe()          # what are the numeric stats?

# Trailing-junk check — many CSV exports stick totals on the last rows
df.tail(10)

# head/tail are sugar over iloc
df.head(5)             # same as df.iloc[:5]
df.tail(5)             # same as df.iloc[-5:]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production previews: full-width display in notebooks,
#             explicit n=N defaults, and head/tail combined to bracket
#             a sorted result. Treat head/tail as exploration only —
#             never as a sampling strategy in real analysis.
# STRENGTHS - readable output for wide frames in notebooks; bracketed
#             previews are a fast way to confirm a sort/aggregate did
#             what you expected; "no head() in production" is a real
#             code-review rule.
# WEAKNESSES- pd.option_context is global state for that block; some
#             notebook front-ends still truncate beyond a column count
#             regardless. df.sample() is the right tool for QA.
#
import pandas as pd

# 1. Notebook display: show all columns of a wide frame for one cell
with pd.option_context(
    "display.max_columns", None,
    "display.max_colwidth", 60,
    "display.width", 200,
):
    print(df.head())

# 2. Bracket a sorted result — first AND last few are usually what you want
top_bottom = pd.concat([
    df.sort_values("amount", ascending=False).head(3),
    df.sort_values("amount", ascending=False).tail(3),
])

# 3. Anti-pattern in production:
#    "if df.head(1)['status'].item() == 'OK': ..."
#    A single-row check on UNSORTED data is order-dependent — fragile.
#    Use boolean conditions across the whole frame instead.

# 4. For data-quality spot-checks reach for sample(), not head()
df.sample(20, random_state=0)

# Decision rule:
#   Quick peek at the start                     -> df.head() (default 5)
#   Peek at the end                              -> df.tail()
#   Sampling instead of edges                    -> df.sample(n=10) (random middle rows)
#   Need a quick row by id                        -> df.loc[id]; head/tail is positional
#   Verify after sort                             -> df.sort_values(...).head(N)
#   Inspecting a Series                           -> s.head() / s.tail()
#   Slicing a chunk                               -> df.iloc[a:b] (more explicit than head)
#   Wide DataFrame, want columns too              -> df.head().T to flip orientation
#
# Anti-pattern: using df.head() as a sanity check on UNSORTED time-series data
#   The first 5 rows are file-order, not chronological order. Always sort
#   (df.sort_values("ts").head()) before drawing conclusions about "the start"
#   of a series. Same for "tail looks fine" — you're checking insertion order,
#   not what's actually most recent.
```

## Decision Rule

```text
Quick peek at the start                     -> df.head() (default 5)
Peek at the end                              -> df.tail()
Sampling instead of edges                    -> df.sample(n=10) (random middle rows)
Need a quick row by id                        -> df.loc[id]; head/tail is positional
Verify after sort                             -> df.sort_values(...).head(N)
Inspecting a Series                           -> s.head() / s.tail()
Slicing a chunk                               -> df.iloc[a:b] (more explicit than head)
Wide DataFrame, want columns too              -> df.head().T to flip orientation
```

## Anti-Pattern

> [!warning] Anti-pattern
> using df.head() as a sanity check on UNSORTED time-series data
>   The first 5 rows are file-order, not chronological order. Always sort
>   (df.sort_values("ts").head()) before drawing conclusions about "the start"
>   of a series. Same for "tail looks fine" — you're checking insertion order,
>   not what's actually most recent.

## Tips

- Always `df.head()` immediately after loading — confirms the file parsed correctly
- `df.tail(10)` catches trailing metadata rows that sometimes appear in CSV exports
- `df.head(1)` is a clean way to see column names and sample values together
- In Jupyter, `df` alone renders a nice table — but `df.head()` is more explicit about intent

## Common Mistake

> [!warning] Using `print(df)` to inspect large DataFrames. It prints all rows and truncates in unreadable ways. Use `df.head()` for a clean preview.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.head()           # first 5 rows (default)
df.head(10)         # first 10 rows
df.head(1)          # just the first row
```

**Senior:**
```python
df.tail(5)          # same as df.iloc[-5:]
```

## See Also

- [[Sections/pandas/inspection/info|.info() (Pandas)]]
- [[Sections/pandas/inspection/describe|.describe() (Pandas)]]
- [[Sections/pandas/inspection/value-counts|.value_counts() (Pandas)]]
- [[Sections/pandas/inspection/sample|.sample() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

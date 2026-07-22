---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "groupby"
title: ".groupby()"
category: "Transform"
subtitle: "Foundation for .agg(), .transform(), and .filter()"
signature_short: "df.groupby(\"col\") | df.groupby([\"col1\",\"col2\"])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".groupby()"
  - "groupby"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .groupby()

> Foundation for .agg(), .transform(), and .filter()

## Overview

groupby() splits a DataFrame into groups — it returns a GroupBy object. Chain with agg(), transform(), or filter() to compute summaries, add group stats back, or keep/drop entire groups.

## Signature

```python
df.groupby("col") | df.groupby(["col1","col2"])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest split-apply-combine: groupby one column,
#             pick another, take the mean.
# STRENGTHS - shows the whole pattern in two lines: split by
#             category, summarize a numeric column.
# WEAKNESSES- doesn't yet show the options that make groupby fast
#             on real data (observed=, as_index=, sort=) — those
#             are everyday performance levers.
#
import pandas as pd

df.groupby("dept")["salary"].mean()
# dept
# Eng    92500
# HR     62500
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: multi-column grouping,
#             observed=True for categorical speed, as_index=False
#             for flat output, .size()/.ngroups for sanity checks.
#             Note that the GroupBy object itself is lazy.
# STRENGTHS - covers what groupby actually looks like in real code.
#             observed=True is the single most useful flag — without
#             it, categorical groupby creates a row for every
#             unused combination.
# WEAKNESSES- doesn't yet address the apply vs agg vs transform
#             decision tree, or the "groupby + apply is the slow
#             path" rule — that's where the next two entries (and
#             the senior tier here) live.
#
import pandas as pd

# Multi-column grouping
df.groupby(["dept", "level"])["salary"].mean()

# Categorical speedup — skip empty combinations
df.groupby("dept", observed=True)["salary"].mean()

# Flat output — keep dept as a column instead of the index
df.groupby("dept", as_index=False)["salary"].mean()

# Preserve insertion order (otherwise groups are alphabetical)
df.groupby("dept", sort=False)["salary"].mean()

# Sanity checks
df.groupby("dept").size()                # rows per group
df.groupby("dept").ngroups               # number of distinct groups
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production groupby decisions: pick agg vs transform
#             vs filter vs apply on purpose; reach for groupby on
#             a categorical (with observed=True) for big speedups;
#             know the "split, materialize, iterate" anti-pattern
#             that destroys performance.
# STRENGTHS - the four GroupBy verbs cover 95% of analytics needs
#             without an apply in sight; categorical+observed is
#             how big-data groupby stays fast in pandas; the
#             decision rule is the actual review checklist.
# WEAKNESSES- groupby().filter() materializes the input twice on
#             huge frames; categorical alignment across files is
#             its own problem (see the categorical entry); apply
#             remains the right tool for genuinely irregular
#             per-group logic — just rarely.
#
import pandas as pd

# 1. Pick the right verb on purpose
g = df.groupby(["region", "dept"], observed=True)

# agg       - one row per group, named columns
g.agg(avg_salary=("salary", "mean"), n=("id", "count"))

# transform - same shape as input, broadcast group stats back
df["dept_avg"] = g["salary"].transform("mean")

# filter    - keep or drop ENTIRE groups by predicate
big_groups = g.filter(lambda gr: len(gr) >= 50)

# apply     - last resort, when no built-in shape fits
top_per_group = g.apply(
    lambda gr: gr.nlargest(3, "salary"),
    include_groups=False,
).reset_index(drop=True)

# 2. Categorical + observed=True for big speedups
df["region"] = df["region"].astype("category")
df.groupby("region", observed=True)["amount"].sum()
# observed=True is critical with categorical -> avoids one row per
# unused category combination

# 3. Anti-pattern: split, materialize, iterate
# Wrong:
#   for name, group in df.groupby("dept"):
#       results.append(group["salary"].mean())
# Right:
#   df.groupby("dept", observed=True)["salary"].mean()
# Iterating per-group in Python is ~100x slower than vectorized agg.

# Decision rule:
#   Aggregate per group                         -> df.groupby(g).agg({"a":"mean","b":"sum"})
#   Single-column reduction                       -> df.groupby(g)["x"].sum()
#   Add a column based on group                    -> df.groupby(g)["x"].transform("mean")
#   Multi-key                                    -> groupby(["a","b"])
#   Don't mutate index                             -> as_index=False (keeps grouping cols as columns)
#   Iteration                                    -> for k, sub in df.groupby(g): ... (slow; rare)
#   Time-based bucket                             -> df.groupby(pd.Grouper(freq="D"))
#   Polars/duckdb at scale                         -> 5-50x faster on big data; same mental model
#
# Anti-pattern: looping over groups in Python with iterrows / for-each
#   for k, sub in df.groupby(g): out.append(sub.x.mean()) — you've reinvented
#   .agg("mean") with 100x more Python overhead. Use df.groupby(g).x.mean()
#   directly; iterate only when each group needs a custom non-vectorizable fn.
```

## Decision Rule

```text
Aggregate per group                         -> df.groupby(g).agg({"a":"mean","b":"sum"})
Single-column reduction                       -> df.groupby(g)["x"].sum()
Add a column based on group                    -> df.groupby(g)["x"].transform("mean")
Multi-key                                    -> groupby(["a","b"])
Don't mutate index                             -> as_index=False (keeps grouping cols as columns)
Iteration                                    -> for k, sub in df.groupby(g): ... (slow; rare)
Time-based bucket                             -> df.groupby(pd.Grouper(freq="D"))
Polars/duckdb at scale                         -> 5-50x faster on big data; same mental model
```

## Anti-Pattern

> [!warning] Anti-pattern
> looping over groups in Python with iterrows / for-each
>   for k, sub in df.groupby(g): out.append(sub.x.mean()) — you've reinvented
>   .agg("mean") with 100x more Python overhead. Use df.groupby(g).x.mean()
>   directly; iterate only when each group needs a custom non-vectorizable fn.

## Tips

- `observed=True` skips empty category combinations — big speedup with categorical columns
- `as_index=False` returns a flat DataFrame instead of a grouped index — cleaner for display
- Never loop with `for name, group in df.groupby(...)` for aggregation — use `.agg()` instead
- GroupBy is lazy — no work is done until you call `.agg()`, `.transform()`, etc.

## Common Mistake

> [!warning] Looping over `df.groupby("dept")` to compute per-group statistics. Always use `.agg()` instead — it is vectorized and orders of magnitude faster.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
g = df.groupby('dept')
g['salary'].mean()           # mean salary per dept
df.groupby(['dept', 'level'])['salary'].mean()
```

**Senior:**
```python
df.groupby('dept').ngroups      # number of distinct groups
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

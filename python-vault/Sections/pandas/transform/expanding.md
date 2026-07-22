---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "expanding"
title: ".expanding()"
category: "Transform"
subtitle: "Cumulative stats — grows from the start of the Series"
signature_short: "df[\"col\"].expanding(min_periods=1).mean()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".expanding()"
  - "expanding"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .expanding()

> Cumulative stats — grows from the start of the Series

## Overview

expanding() computes statistics using all data from the beginning up to and including the current row. The window size grows with each row. expanding().sum() is equivalent to .cumsum().

## Signature

```python
df["col"].expanding(min_periods=1).mean()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - cumulative running statistic: every row sees all
#             rows from the start up to itself.
# STRENGTHS - simplest "running total / running mean" — the
#             expanding window grows with every row.
# WEAKNESSES- doesn't yet show min_periods, the cumXxx shortcuts
#             that are usually faster, or group-aware expanding.
#
import pandas as pd

df = df.sort_values("date")
df["cum_sales"] = df["sales"].expanding().sum()           # running total
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday expanding patterns: cumulative sum /
#             max / mean / std, min_periods to skip the warm-up,
#             and the cumXxx shortcuts that are faster for
#             specific stats.
# STRENGTHS - the cum* methods (cumsum, cummax, cumprod) are the
#             fast paths for the most common expanding stats;
#             expanding() shines when you need MEAN/STD/custom.
# WEAKNESSES- doesn't address group-aware expanding (cum* across
#             products would leak) or feature-leakage via the
#             "current row included" default — senior tier.
#
import pandas as pd

df = df.sort_values("date")

# Standard cumulative stats
df["cum_sum"]   = df["sales"].expanding(min_periods=1).sum()
df["cum_mean"]  = df["sales"].expanding(min_periods=1).mean()
df["cum_std"]   = df["sales"].expanding(min_periods=2).std()
df["cum_max"]   = df["sales"].expanding(min_periods=1).max()

# Faster shortcuts for the simple ones
df["running_total"] = df["sales"].cumsum()
df["running_max"]   = df["sales"].cummax()
df["running_prod"]  = df["sales"].cumprod()

# A useful diagnostic: today vs running average
df["vs_cum_avg"]    = df["sales"] - df["sales"].expanding().mean()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production expanding: group-aware (every product
#             tracks its own cumulative state), closed="left" or
#             a manual shift to make ML features safe (no peeking
#             at the current row), and a "use cumXxx unless you
#             need a non-builtin stat" rule.
# STRENGTHS - per-group cumsum is the canonical "running total
#             per customer/product"; closed="left" is the only
#             safe default for any ML feature derived from past
#             observations; cum* hits the fast path.
# WEAKNESSES- per-group cumsum requires sort+groupby discipline;
#             closed="left" is supported on rolling but not on
#             expanding — for expanding you have to shift(1)
#             explicitly; mixing groupby with expanding can be
#             slow on huge frames.
#
import pandas as pd

# 1. Group-aware running stats — never leak across product boundaries
df = df.sort_values(["product", "date"])
df["cum_sales"] = df.groupby("product", observed=True)["sales"].cumsum()
df["cum_max"]   = df.groupby("product", observed=True)["sales"].cummax()

# 2. Group-aware EXPANDING (when you need mean/std and not just sum)
df["cum_mean"] = (df.groupby("product", observed=True)["sales"]
                    .transform(lambda s: s.expanding(min_periods=1).mean()))

# 3. Anti-leakage for ML features — shift BEFORE the running stat
df = df.sort_values("date")
df["lagged_cum_mean"] = df["sales"].shift(1).expanding().mean()
# Now every row sees only rows that came strictly before it.

# Decision rule:
#   running sum/max/min/prod    -> cumsum / cummax / cummin / cumprod
#   running mean/std/custom     -> expanding(min_periods=...).mean() etc
#   per-group running stats     -> groupby(...).cumsum() / .transform(expanding)
#   ML feature (no leakage)     -> shift(1) THEN expanding/cum
#   fixed-width window          -> rolling(n) instead of expanding

# Anti-pattern: using expanding() on a non-monotonic time index
#   Expanding windows are inherently order-dependent — sort_index() FIRST so
#   "all data up to now" actually means "all data with timestamp <= now".
#   Same warning as rolling on time series.
```

## Decision Rule

```text
running sum/max/min/prod    -> cumsum / cummax / cummin / cumprod
running mean/std/custom     -> expanding(min_periods=...).mean() etc
per-group running stats     -> groupby(...).cumsum() / .transform(expanding)
ML feature (no leakage)     -> shift(1) THEN expanding/cum
fixed-width window          -> rolling(n) instead of expanding
```

## Anti-Pattern

> [!warning] Anti-pattern
> using expanding() on a non-monotonic time index
>   Expanding windows are inherently order-dependent — sort_index() FIRST so
>   "all data up to now" actually means "all data with timestamp <= now".
>   Same warning as rolling on time series.

## Tips

- `cumsum()`, `cummax()`, `cummin()`, `cumprod()` are faster shortcuts for common expanding stats
- Group-aware expanding via `df.groupby("g")["v"].transform(lambda x: x.expanding().mean())`
- `expanding(min_periods=n)` waits until n observations before producing values
- expanding().std() uses ddof=1 (sample std) by default — use ddof=0 for population std
- For ML features, `shift(1)` BEFORE expanding/cum — otherwise the current row leaks into its own running stat

## Common Mistake

> [!warning] Using `expanding()` when you want a fixed-size window. expanding() grows — its window includes everything from the start. Use `rolling(n)` for a fixed n-period window.

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

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]

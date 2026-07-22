---
type: "entry"
domain: "python"
file: "numpy"
section: "operations"
id: "np-nan"
title: "np.nan handling"
category: "Operations"
subtitle: "np.isnan() to detect, np.nan_to_num() to replace, nan* functions to ignore"
signature_short: "np.isnan(a) | np.nanmean(a) | np.nan_to_num(a, nan=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.nan handling"
  - "np-nan"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/operations"
  - "category/operations"
  - "tier/tiered"
---

# np.nan handling

> np.isnan() to detect, np.nan_to_num() to replace, nan* functions to ignore

## Overview

NaN (Not a Number) is the floating-point sentinel for missing values. NaN propagates through arithmetic — any operation with NaN returns NaN. Use np.isnan() to detect, np.nan_to_num() to replace, and nan-prefixed aggregation functions (nanmean, nansum, etc.) to ignore NaN.

## Signature

```python
np.isnan(a) | np.nanmean(a) | np.nan_to_num(a, nan=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - detect NaN with np.isnan; never compare with
#             == (NaN != NaN by IEEE rule).
# STRENGTHS - the cardinal NaN rule in two lines.
# WEAKNESSES- doesn't yet show NaN-safe aggregations or the
#             isfinite/isinf companions.
#
import numpy as np

a = np.array([1.0, 2.0, np.nan, 4.0, np.nan])

np.isnan(a)              # [F F T F T]
np.isnan(a).sum()        # 2

# WRONG — NaN comparisons are always False
# a == np.nan            # all False, even where NaN exists
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday NaN toolkit: nan-prefixed
#             aggregations to ignore NaN, np.nan_to_num to
#             replace, boolean masks to drop, and isfinite
#             vs isnan vs isinf for the full numerical-
#             pathology picture.
# STRENGTHS - covers what NaN handling looks like in real
#             numeric code; the isfinite check is the safest
#             "numbers only" filter.
# WEAKNESSES- doesn't address NaN propagation in matrix
#             products or the "convert to NaN before ops"
#             pattern — senior tier.
#
import numpy as np

a = np.array([1.0, 2.0, np.nan, 4.0, np.nan])

# NaN propagates — plain aggregations return NaN
a.sum()                  # nan
a.mean()                 # nan

# NaN-safe aggregations — ignore NaN entries
np.nansum(a)             # 7.0
np.nanmean(a)            # 2.333...
np.nanstd(a); np.nanmax(a); np.nanmin(a)
np.nanpercentile(a, 75)

# Replace NaN (and optionally inf)
np.nan_to_num(a, nan=0.0)
np.nan_to_num(a, nan=0.0, posinf=1e10, neginf=-1e10)

# Drop NaN via mask
a[~np.isnan(a)]          # [1., 2., 4.]
a[np.isfinite(a)]        # same, AND drops inf

# isfinite vs isnan vs isinf
b = np.array([1, np.nan, np.inf, -np.inf])
np.isnan(b);   np.isinf(b);   np.isfinite(b)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production NaN: explicit policy at function
#             boundaries (drop, fill, propagate, raise);
#             convert sentinel values (-999, "") to NaN
#             before numeric ops; use np.errstate to silence
#             "invalid value" warnings only where you've
#             already handled them.
# STRENGTHS - explicit policy makes data quality decisions
#             auditable; sentinel-conversion is a single-pass
#             clean-up; np.errstate keeps logs honest.
# WEAKNESSES- np.errstate is a context manager (easy to
#             forget); per-function policy adds boilerplate;
#             converting "" -> NaN requires the column to be
#             float dtype already.
#
import numpy as np

# 1. Convert sentinel values to NaN before numeric ops
raw = np.array([1.0, -999.0, 3.0, -999.0])
clean = np.where(raw == -999, np.nan, raw)

# 2. Explicit per-function policy
def safe_mean(x: np.ndarray, *, policy: str = "ignore") -> float:
    if policy == "ignore":
        return float(np.nanmean(x))
    if policy == "drop":
        return float(np.mean(x[~np.isnan(x)]))
    if policy == "raise":
        if np.isnan(x).any():
            raise ValueError("input contains NaN")
        return float(np.mean(x))
    raise ValueError(policy)

# 3. Silence the "invalid value" warning ONLY where handled
with np.errstate(invalid="ignore"):
    log_safe = np.where(a > 0, np.log(a), -np.inf)

# 4. Watch matrix products — NaN propagates entire rows/cols
A = np.array([[1.0, np.nan], [3.0, 4.0]])
A @ np.array([1.0, 1.0])             # any NaN in a row -> NaN in the output

# Anti-pattern: comparing with == np.nan
#   a[a == np.nan]                   # always empty
# Right: a[np.isnan(a)]
#
# Decision rule:
#   detect NaN positions                         -> np.isnan(a)
#   detect any non-finite (NaN, +inf, -inf)      -> ~np.isfinite(a)
#   aggregate while ignoring NaN                 -> np.nansum / np.nanmean / np.nanstd
#   replace NaN with a fill value                -> np.nan_to_num(a, nan=0)
#   drop NaN entries                             -> a[~np.isnan(a)] or a[np.isfinite(a)]
#   sentinel value (e.g. -999) -> NaN            -> np.where(a == -999, np.nan, a)
#   want to fail loudly on NaN input             -> if np.isnan(a).any(): raise
#   want to suppress numpy invalid warnings      -> with np.errstate(invalid="ignore"):
```

## Decision Rule

```text
detect NaN positions                         -> np.isnan(a)
detect any non-finite (NaN, +inf, -inf)      -> ~np.isfinite(a)
aggregate while ignoring NaN                 -> np.nansum / np.nanmean / np.nanstd
replace NaN with a fill value                -> np.nan_to_num(a, nan=0)
drop NaN entries                             -> a[~np.isnan(a)] or a[np.isfinite(a)]
sentinel value (e.g. -999) -> NaN            -> np.where(a == -999, np.nan, a)
want to fail loudly on NaN input             -> if np.isnan(a).any(): raise
want to suppress numpy invalid warnings      -> with np.errstate(invalid="ignore"):
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing with == np.nan
>   a[a == np.nan]                   # always empty
> Right: a[np.isnan(a)]

## Tips

- NaN comparisons always return False — `np.nan == np.nan` is False. Use `np.isnan()` to check
- `np.nanmean()` etc. silently ignore NaN — always check with `np.isnan().sum()` first to know how many were dropped
- `np.isfinite(a)` is stricter than `~np.isnan(a)` — it also excludes `inf` and `-inf`
- `np.nan_to_num(a)` replaces NaN with 0, inf with a large number — useful before feeding to ML models

## Common Mistake

> [!warning] Checking `a == np.nan` to find NaN values. This always returns False because NaN is not equal to anything, including itself. Use `np.isnan(a)` instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
a = np.array([1.0, 2.0, np.nan, 4.0, np.nan])
np.isnan(a)             # [F, F, T, F, T]
np.isnan(a).sum()       # 2 — count of NaN
```

**Senior:**
```python
np.isfinite(b)          # [T, F, F, F]
```

## See Also

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations (NumPy)]]
- [[Sections/numpy/operations/np-clip|np.clip() (NumPy)]]
- [[Sections/numpy/operations/broadcasting|Broadcasting (NumPy)]]
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid() (NumPy)]]
- [[Sections/numpy/operations/_Index|NumPy → Operations, Math & Performance]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]

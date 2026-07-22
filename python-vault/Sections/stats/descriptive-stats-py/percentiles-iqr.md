---
type: "entry"
domain: "python"
file: "stats"
section: "descriptive-stats-py"
id: "percentiles-iqr"
title: "np.percentile, IQR, boxplot"
category: "Distribution Position"
subtitle: "Quartiles and percentile-based summaries"
signature_short: "np.percentile(data, q), iqr = q75 - q25"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.percentile, IQR, boxplot"
  - "percentiles-iqr"
tags:
  - "python"
  - "python/stats"
  - "python/stats/descriptive-stats-py"
  - "category/distribution-position"
  - "tier/tiered"
---

# np.percentile, IQR, boxplot

> Quartiles and percentile-based summaries

## Overview

Partition data into equal-probability regions. IQR (Interquartile Range) captures central 50%; outliers identified as values beyond 1.5*IQR from quartiles.

## Signature

```python
np.percentile(data, q), iqr = q75 - q25
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The three quartiles in one np.percentile call
# STRENGTHS - Smallest demonstration; vectorized, no loop
# WEAKNESSES- No outlier rule, no IQR derivation
#
import numpy as np

data = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])

q1, q2, q3 = np.percentile(data, [25, 50, 75])    # one call returns all three
print(f"Q1={q1}  median={q2}  Q3={q3}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - IQR + Tukey 1.5×IQR outlier rule + pandas summary
# STRENGTHS - The full five-number-summary plus the canonical outlier definition
# WEAKNESSES- Doesn't cover interpolation modes or weighted percentiles
#
import numpy as np
import pandas as pd

data = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])

q1, q3 = np.percentile(data, [25, 75])
iqr = q3 - q1
lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr     # Tukey fences

print(f"IQR={iqr}  fences=[{lower}, {upper}]")
print(f"outliers: {data[(data < lower) | (data > upper)]}")

# pandas .describe() bundles count + mean + std + 5-number summary
print(pd.Series(data).describe())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Interpolation modes, weighted percentiles, robust outlier flags
# STRENGTHS - The detail that matters when percentiles drive business rules
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

data = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])

# 1) Interpolation method matters when n is small or values aren't unique
# numpy >= 1.22: use the 'method' kw (replaces deprecated 'interpolation')
for m in ("linear", "nearest", "lower", "higher", "midpoint"):
    print(f"{m:>10}: Q3 = {np.percentile(data, 75, method=m)}")
#   linear  -> default; "fractional" position between values
#   lower / higher -> always pick a real data point (good for billing thresholds)
#   nearest -> rounded; deterministic for plotting

# 2) Robust outlier rule: median + k * MAD (less sensitive to heavy tails than IQR)
def mad_outliers(x, k=3.0):
    med = np.median(x)
    mad = stats.median_abs_deviation(x, scale="normal")
    return x[np.abs(x - med) > k * mad]
print("MAD outliers:", mad_outliers(data))

# 3) Weighted percentiles — use np.quantile with weights via a sorted CDF trick
def weighted_quantile(values, weights, q):
    order = np.argsort(values)
    v, w  = values[order], weights[order]
    cum   = np.cumsum(w) - 0.5 * w                  # midpoint weighting
    cum  /= cum[-1]
    return np.interp(q, cum, v)

values  = np.array([10, 20, 30, 40, 50])
weights = np.array([1, 1, 5, 1, 1])                 # 30 dominates
print("weighted median:", weighted_quantile(values, weights, 0.5))

# Decision rule:
#   exploratory summary                -> np.percentile([25,50,75]) + Tukey fences
#   billing / SLA threshold              -> method='lower' or 'higher' (no half-points)
#   heavy-tailed / many outliers          -> MAD-based rule, not IQR
#   weighted samples (frequency, exposure) -> custom weighted_quantile, not np.percentile
#   need rolling percentiles               -> pandas .rolling().quantile()
#
# Anti-pattern: 1.5*IQR fences on small (n < 20) samples
#   With few observations the fences are wide and miss real outliers, OR they
#   flag everything if the data is bimodal. Use bootstrap CIs on the quartiles.
```

## Decision Rule

```text
exploratory summary                -> np.percentile([25,50,75]) + Tukey fences
billing / SLA threshold              -> method='lower' or 'higher' (no half-points)
heavy-tailed / many outliers          -> MAD-based rule, not IQR
weighted samples (frequency, exposure) -> custom weighted_quantile, not np.percentile
need rolling percentiles               -> pandas .rolling().quantile()
```

## Anti-Pattern

> [!warning] Anti-pattern
> 1.5*IQR fences on small (n < 20) samples
>   With few observations the fences are wide and miss real outliers, OR they
>   flag everything if the data is bimodal. Use bootstrap CIs on the quartiles.

## Tips

- IQR method: outliers are beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR
- Percentiles are more robust than mean/std for skewed distributions
- pd.describe() includes min, 25%, 50%, 75%, max, mean, std automatically

## Common Mistake

> [!warning] Using percentiles without context; always check full distribution visually too.

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

- [[Sections/stats/descriptive-stats-py/_Index|Statistics & Probability → Descriptive Statistics]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

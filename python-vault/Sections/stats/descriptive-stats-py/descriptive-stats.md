---
type: "entry"
domain: "python"
file: "stats"
section: "descriptive-stats-py"
id: "descriptive-stats"
title: "mean, median, mode, variance, std"
category: "Central Tendency"
subtitle: "Summarize data distribution with basic statistics"
signature_short: "scipy.stats.describe(), np.mean(), np.median(), scipy.stats.mode()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mean, median, mode, variance, std"
  - "descriptive-stats"
tags:
  - "python"
  - "python/stats"
  - "python/stats/descriptive-stats-py"
  - "category/central-tendency"
  - "tier/tiered"
---

# mean, median, mode, variance, std

> Summarize data distribution with basic statistics

## Overview

Compute fundamental summary statistics to understand data center and spread. scipy.stats.describe() provides all at once; individual functions offer flexibility.

## Signature

```python
scipy.stats.describe(), np.mean(), np.median(), scipy.stats.mode()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mean / median / std on a numpy array
# STRENGTHS - The four-line summary you'll write hundreds of times
# WEAKNESSES- No skew/kurtosis, no mode, no sample-vs-population distinction
#
import numpy as np

data = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])

print(f"mean:   {np.mean(data):.2f}")
print(f"median: {np.median(data):.2f}")
print(f"std:    {np.std(data, ddof=1):.2f}")    # ddof=1 -> sample std
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - scipy.stats.describe one-shot, plus the metrics it doesn't give you
# STRENGTHS - The five-number summary plus shape stats (skew, kurtosis)
# WEAKNESSES- Doesn't cover trimmed/winsorized stats or pandas .describe()
#
import numpy as np
from scipy import stats

data = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])

d = stats.describe(data)                          # nobs / minmax / mean / variance / skew / kurtosis
print(f"n: {d.nobs}, range: {d.minmax}")
print(f"mean: {d.mean:.2f}  variance: {d.variance:.2f}  std: {d.variance**0.5:.2f}")
print(f"skewness: {d.skewness:.2f}  kurtosis: {d.kurtosis:.2f}")

# describe() doesn't give median or mode — fetch separately
print(f"median: {np.median(data):.2f}")
print(f"mode:   {stats.mode(data, keepdims=False).mode}")

# Quick pandas alternative — wider summary
import pandas as pd
print(pd.Series(data).describe())                 # count, mean, std, min, 25/50/75%, max
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Robust summaries: medians, MAD, trimmed means, by-group describe
# STRENGTHS - The summaries that survive outliers and skewed distributions
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
from scipy import stats

data = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15, 200])  # one outlier

# 1) Robust center/spread — don't let one big value lie about the data
median = np.median(data)
mad    = stats.median_abs_deviation(data, scale="normal")   # robust std analog
trimmed_mean = stats.trim_mean(data, 0.1)         # drop top/bottom 10%
print(f"mean: {data.mean():.2f}   median: {median:.2f}")
print(f"std:  {data.std(ddof=1):.2f}   MAD:    {mad:.2f}")
print(f"trim_mean(10%): {trimmed_mean:.2f}")

# 2) Always inspect skew and kurtosis BEFORE picking a center
skew, kurt = stats.skew(data), stats.kurtosis(data, fisher=True)   # excess kurtosis
print(f"skew={skew:.2f}, excess_kurt={kurt:.2f}")
# |skew| > 1 -> highly skewed; report median, not mean.
# excess_kurt > 3 -> heavy tails; std understates extreme risk.

# 3) Group summaries on real data — describe() per group
df = pd.DataFrame({"group": list("AAABBBCCC"),
                   "value": [1, 2, 100, 4, 5, 6, 7, 8, 9]})
print(df.groupby("group")["value"].describe())

# Decision rule:
#   roughly symmetric, no outliers       -> mean + std
#   skewed or heavy-tailed                -> median + MAD or IQR
#   need both center AND robustness       -> trimmed mean (5-20% trim)
#   reporting to a stakeholder            -> mean AND median; let the gap tell the story
#   compare across scales                  -> coefficient of variation (std/mean)
#
# Anti-pattern: defaulting to ddof=0 on sample data
#   np.std(data) divides by N. For sample-based inference you want the unbiased
#   estimator (divide by N-1). Pass ddof=1 — or use pd.Series.std() (default ddof=1).
```

## Decision Rule

```text
roughly symmetric, no outliers       -> mean + std
skewed or heavy-tailed                -> median + MAD or IQR
need both center AND robustness       -> trimmed mean (5-20% trim)
reporting to a stakeholder            -> mean AND median; let the gap tell the story
compare across scales                  -> coefficient of variation (std/mean)
```

## Anti-Pattern

> [!warning] Anti-pattern
> defaulting to ddof=0 on sample data
>   np.std(data) divides by N. For sample-based inference you want the unbiased
>   estimator (divide by N-1). Pass ddof=1 — or use pd.Series.std() (default ddof=1).

## Tips

- Use ddof=1 for sample std (Bessel correction), ddof=0 for population
- scipy.stats.describe() is efficient for all descriptive stats at once
- Keep raw statistics separate from interpretation — context matters

## Common Mistake

> [!warning] Using ddof=0 (population) when computing sample statistics, underestimating variability.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import pandas as pd
from scipy import stats
data = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])
```

**Senior:**
```python
print(f'Range: {data.max() - data.min()}')
```

## See Also

- [[Sections/stats/descriptive-stats-py/_Index|Statistics & Probability → Descriptive Statistics]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

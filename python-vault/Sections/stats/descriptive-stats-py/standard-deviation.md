---
type: "entry"
domain: "python"
file: "stats"
section: "descriptive-stats-py"
id: "standard-deviation"
title: "std, var, sem, coefficient of variation"
category: "Dispersion"
subtitle: "Measure variability and uncertainty"
signature_short: "np.std(), np.var(), scipy.stats.sem(), cv = std / mean"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "std, var, sem, coefficient of variation"
  - "standard-deviation"
tags:
  - "python"
  - "python/stats"
  - "python/stats/descriptive-stats-py"
  - "category/dispersion"
  - "tier/tiered"
---

# std, var, sem, coefficient of variation

> Measure variability and uncertainty

## Overview

Measure data spread around the center. Standard error of mean (SEM) quantifies uncertainty in sample mean. Coefficient of variation enables comparison across scales.

## Signature

```python
np.std(), np.var(), scipy.stats.sem(), cv = std / mean
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - var and std with the right ddof for sample data
# STRENGTHS - Smallest demonstration of the spread metric pair
# WEAKNESSES- No SEM, no CV, no comparison across scales
#
import numpy as np

data = np.array([10, 12, 11, 13, 12, 11, 10])
print(f"variance: {np.var(data, ddof=1):.2f}")    # ddof=1 = sample
print(f"std dev:  {np.std(data, ddof=1):.2f}")    # std is sqrt(var)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - SEM for mean uncertainty, CV for cross-scale comparison
# STRENGTHS - Shows the THREE different "spread" numbers and what each is for
# WEAKNESSES- Doesn't cover bootstrap CIs or robust spread (MAD)
#
import numpy as np
from scipy import stats

low_scale  = np.array([10, 12, 11, 13, 12, 11, 10])
high_scale = np.array([100, 120, 110, 130, 120, 110, 100])

# std — spread of the DATA
# SEM — spread of the SAMPLE MEAN. Always SEM = std / sqrt(n).
# CV  — std normalized by mean; unitless, comparable across scales.
for label, x in [("low", low_scale), ("high", high_scale)]:
    std = np.std(x, ddof=1)
    sem = stats.sem(x)
    cv  = std / np.mean(x)
    print(f"{label:>4}: std={std:.2f}  SEM={sem:.3f}  CV={cv:.3f}")

# Notice: high-scale has 10x bigger std but the SAME CV — same *relative* variability.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When std lies: heavy tails, mixed populations, robust alternatives
# STRENGTHS - Captures the failure modes and what to swap in
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

# 1) Heavy-tailed data — std balloons; MAD stays stable
np.random.seed(0)
heavy = np.concatenate([np.random.normal(0, 1, 100), np.array([50])])
print(f"std:  {heavy.std(ddof=1):.2f}   MAD: {stats.median_abs_deviation(heavy, scale='normal'):.2f}")

# 2) Mixed populations — std describes a phantom average
mixed = np.concatenate([np.random.normal(0, 1, 50), np.random.normal(10, 1, 50)])
# A single std on this is meaningless; report grouped stats instead.

# 3) SEM for confidence — DON'T use std on a "mean ± X" plot
n  = len(heavy)
ci = stats.t.interval(0.95, df=n-1, loc=heavy.mean(), scale=stats.sem(heavy))
print(f"95% CI for mean: {ci}")                     # SEM-based, not std-based

# 4) Robust spread metrics
mad = stats.median_abs_deviation(heavy, scale="normal")   # ~= std for normal data
iqr = np.subtract(*np.percentile(heavy, [75, 25]))
print(f"MAD: {mad:.2f}   IQR: {iqr:.2f}")

# Decision rule:
#   normal-ish, no outliers              -> std + SEM (for CIs)
#   skewed or heavy-tailed                -> MAD or IQR; CIs via bootstrap
#   compare variability across SCALES     -> coefficient of variation (std/mean)
#   compare mean uncertainty               -> SEM, never std
#   one-shot summary for a paper/report   -> report n, mean, sd, AND median, IQR
#
# Anti-pattern: error bars labeled "std" on a sample mean
#   The reader infers the mean's uncertainty; you've shown them the data's
#   spread. Use SEM (or a 95% CI) for mean uncertainty.
```

## Decision Rule

```text
normal-ish, no outliers              -> std + SEM (for CIs)
skewed or heavy-tailed                -> MAD or IQR; CIs via bootstrap
compare variability across SCALES     -> coefficient of variation (std/mean)
compare mean uncertainty               -> SEM, never std
one-shot summary for a paper/report   -> report n, mean, sd, AND median, IQR
```

## Anti-Pattern

> [!warning] Anti-pattern
> error bars labeled "std" on a sample mean
>   The reader infers the mean's uncertainty; you've shown them the data's
>   spread. Use SEM (or a 95% CI) for mean uncertainty.

## Tips

- CV > std for comparing variability across datasets with different scales/units
- SEM decreases with larger sample size (sqrt(n) relationship)
- Variance is std^2; use std for same units as original data

## Common Mistake

> [!warning] Confusing std with SEM; SEM is std/sqrt(n), used for mean uncertainty.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
from scipy import stats
data1 = np.array([10, 12, 11, 13, 12, 11, 10])
data2 = np.array([100, 120, 110, 130, 120, 110, 100])
```

**Senior:**
```python
print(f'Coefficient of Variation (Data 2): {cv2:.4f}')
```

## See Also

- [[Sections/stats/descriptive-stats-py/_Index|Statistics & Probability → Descriptive Statistics]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

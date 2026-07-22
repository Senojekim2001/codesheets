---
type: "entry"
domain: "python"
file: "stats"
section: "descriptive-stats-py"
id: "correlation"
title: "pearsonr, spearmanr, kendalltau"
category: "Association"
subtitle: "Measure linear and rank-based relationships"
signature_short: "scipy.stats.pearsonr(x, y), spearmanr(x, y), kendalltau(x, y)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pearsonr, spearmanr, kendalltau"
  - "correlation"
tags:
  - "python"
  - "python/stats"
  - "python/stats/descriptive-stats-py"
  - "category/association"
  - "tier/tiered"
---

# pearsonr, spearmanr, kendalltau

> Measure linear and rank-based relationships

## Overview

Pearson measures linear association (-1 to 1). Spearman and Kendall use ranks, robust to outliers and nonlinearity. All return coefficient and p-value.

## Signature

```python
scipy.stats.pearsonr(x, y), spearmanr(x, y), kendalltau(x, y)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Pearson r between two arrays, with the p-value
# STRENGTHS - The one-liner you'll reach for first
# WEAKNESSES- No mention of when Pearson breaks (nonlinearity, outliers)
#
import numpy as np
from scipy import stats

x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = 2 * x + np.array([0.1, -0.2, 0.3, 0, 0.4, -0.1, 0.2, 0.5, -0.3, 0.1])

r, p = stats.pearsonr(x, y)
print(f"Pearson r = {r:.3f}, p = {p:.3g}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pearson vs Spearman vs Kendall, and an outlier sensitivity demo
# STRENGTHS - Shows the three coefficients side-by-side and WHY they differ
# WEAKNESSES- No discussion of the assumptions Pearson actually requires
#
import numpy as np
from scipy import stats

np.random.seed(0)
x = np.arange(1, 11)
y = 2 * x + np.random.normal(0, 1, 10)

# Make the last point a wild outlier
y_out = y.copy(); y_out[-1] = 100

print("                  clean      with outlier")
for name, fn in [("Pearson",   stats.pearsonr),
                 ("Spearman",  stats.spearmanr),
                 ("Kendall τ", stats.kendalltau)]:
    print(f"{name:>10}:  {fn(x, y).statistic:+.3f}     {fn(x, y_out).statistic:+.3f}")

# Pearson collapses; Spearman/Kendall barely move because they only care about ranks.
# That's the rule: rank-based correlations are robust to outliers and monotonic
# but-not-linear relationships.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pick the right coefficient, get a CI, never confuse r with causation
# STRENGTHS - The decision rules and the bootstrap CI most papers don't show
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

np.random.seed(0)
x = np.arange(1, 51)
y = 2 * x + np.random.normal(0, 4, 50)

# 1) scipy returns a result object — use .confidence_interval() for Pearson r
res = stats.pearsonr(x, y)
print(f"Pearson r = {res.statistic:.3f}, 95% CI = {res.confidence_interval(0.95)}")
print(f"p-value (H0: r=0) = {res.pvalue:.3g}")

# 2) Bootstrap CI for any correlation — works for Spearman / Kendall too
def boot_ci(x, y, fn=lambda a, b: stats.spearmanr(a, b).statistic, n=2000, alpha=0.05):
    rng = np.random.default_rng(0)
    n_obs = len(x)
    rs = np.empty(n)
    for i in range(n):
        idx = rng.integers(0, n_obs, n_obs)
        rs[i] = fn(x[idx], y[idx])
    return np.quantile(rs, [alpha / 2, 1 - alpha / 2])

print("Spearman 95% CI:", boot_ci(x, y))

# 3) Partial correlation — control for a confounder z
def partial_corr(x, y, z):
    # residualize x and y against z, then plain Pearson on the residuals
    rx = x - np.polyval(np.polyfit(z, x, 1), z)
    ry = y - np.polyval(np.polyfit(z, y, 1), z)
    return stats.pearsonr(rx, ry).statistic

# Decision rule:
#   linear, ratio/interval, normal-ish    -> Pearson
#   monotonic but nonlinear, ordinal      -> Spearman
#   small n, lots of ties, ordinal         -> Kendall τ (more conservative than Spearman)
#   any outliers / heavy tails             -> Spearman or Kendall, never Pearson
#   confounding suspected                  -> partial correlation, then re-test
#   need uncertainty                        -> CI on r (built-in for Pearson, bootstrap otherwise)
#
# Anti-pattern: reporting r without a scatterplot
#   Anscombe's quartet: four datasets, identical r, wildly different shapes (one
#   linear, one curved, one with an outlier driving the whole thing). Always plot.
```

## Decision Rule

```text
linear, ratio/interval, normal-ish    -> Pearson
monotonic but nonlinear, ordinal      -> Spearman
small n, lots of ties, ordinal         -> Kendall τ (more conservative than Spearman)
any outliers / heavy tails             -> Spearman or Kendall, never Pearson
confounding suspected                  -> partial correlation, then re-test
need uncertainty                        -> CI on r (built-in for Pearson, bootstrap otherwise)
```

## Anti-Pattern

> [!warning] Anti-pattern
> reporting r without a scatterplot
>   Anscombe's quartet: four datasets, identical r, wildly different shapes (one
>   linear, one curved, one with an outlier driving the whole thing). Always plot.

## Tips

- Pearson assumes linearity; use Spearman/Kendall for monotonic relationships
- Spearman/Kendall robust to outliers; preferred for non-normal data
- p-value < 0.05 typically indicates significant correlation

## Common Mistake

> [!warning] Using Pearson on monotonic but non-linear data; Spearman is more appropriate.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
from scipy import stats
np.random.seed(42)
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
```

**Senior:**
```python
print(f'Spearman r: {stats.spearmanr(x_clean, y_clean)[0]:.4f}')
```

## See Also

- [[Sections/stats/descriptive-stats-py/_Index|Statistics & Probability → Descriptive Statistics]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "stats"
section: "distributions-py"
id: "normal-distribution"
title: "scipy.stats.norm"
category: "Distribution Functions"
subtitle: "Gaussian bell curve operations"
signature_short: "scipy.stats.norm.pdf(x, loc, scale), norm.cdf(), norm.ppf(), norm.rvs()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.norm"
  - "normal-distribution"
tags:
  - "python"
  - "python/stats"
  - "python/stats/distributions-py"
  - "category/distribution-functions"
  - "tier/tiered"
---

# scipy.stats.norm

> Gaussian bell curve operations

## Overview

Normal distribution is fundamental to statistics. pdf: probability density, cdf: cumulative probability, ppf: inverse cdf, rvs: random samples, fit: estimate parameters.

## Signature

```python
scipy.stats.norm.pdf(x, loc, scale), norm.cdf(), norm.ppf(), norm.rvs()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One frozen normal; pdf, cdf, ppf, rvs
# STRENGTHS - The four scipy.stats methods you'll use 90% of the time
# WEAKNESSES- No fitting, no plotting, no parameter discussion
#
import numpy as np
from scipy import stats

n = stats.norm(loc=0, scale=1)                   # standard normal

print(f"pdf(0):    {n.pdf(0):.4f}")              # density at the mean
print(f"cdf(1.96): {n.cdf(1.96):.4f}")           # P(X <= 1.96) ≈ 0.975
print(f"ppf(.975): {n.ppf(0.975):.4f}")          # inverse CDF = 1.96
print(f"sample 5: {n.rvs(size=5).round(2)}")     # five random draws
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Probability of intervals, fit to data, frozen-vs-classmethod styles
# STRENGTHS - The full kit: tail probabilities, parameter estimation, two APIs
# WEAKNESSES- No goodness-of-fit testing
#
import numpy as np
from scipy import stats

# Two equivalent calling conventions
n = stats.norm(loc=100, scale=15)                # frozen distribution
print(stats.norm.cdf(115, loc=100, scale=15))    # classmethod with params
print(n.cdf(115))                                # frozen call — cleaner

# Probabilities over intervals
print(f"P(X > 130):     {1 - n.cdf(130):.4f}")
print(f"P(85 < X < 115): {n.cdf(115) - n.cdf(85):.4f}")

# Quantiles for confidence-interval lookups
print(f"68% interval: {n.interval(0.68)}")        # mean ± 1 SD
print(f"95% interval: {n.interval(0.95)}")        # mean ± 1.96 SD

# Fit normal parameters from data via MLE
data = np.array([99, 101, 105, 95, 110, 102, 98, 100, 104])
mu_hat, sigma_hat = stats.norm.fit(data)         # MLE: divides by N, not N-1
print(f"fitted mu={mu_hat:.2f}  sigma={sigma_hat:.2f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Numerical stability (sf, logsf), fit diagnostics, when normal is wrong
# STRENGTHS - The traps that bite at extreme tails and the diagnostics that catch them
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

n = stats.norm(loc=0, scale=1)

# 1) Tail probabilities: use sf (survival function = 1 - cdf), not 1 - cdf
#    1 - cdf(8) underflows to 0 in float64; sf(8) returns the right value.
print("1 - cdf(8):", 1 - n.cdf(8))               # 0.0  (lost precision)
print("sf(8):    ", n.sf(8))                     # 6.22e-16 (correct)
print("logsf(8): ", n.logsf(8))                  # -34.97 — useful for log-likelihoods

# 2) ALWAYS check fit before trusting probabilities from a fitted model
data = np.concatenate([np.random.default_rng(0).normal(0, 1, 95),
                       np.array([10, 11, -9, 8, -8])])    # 5% extreme tails
mu, sigma = stats.norm.fit(data)
ks_stat, ks_p = stats.kstest(data, "norm", args=(mu, sigma))
sw_stat, sw_p = stats.shapiro(data)
print(f"KS p={ks_p:.3g}   Shapiro p={sw_p:.3g}")
# Both p-values small -> the fit is bad. Don't quote tail probabilities from it.

# 3) Heavy tails? Use Student-t (one extra parameter, 'df') instead of normal.
df, loc, scale = stats.t.fit(data)
print(f"t-fit: df={df:.1f}  loc={loc:.2f}  scale={scale:.2f}")
# Smaller df -> heavier tails. df > ~30 -> essentially normal.

# Decision rule:
#   roughly bell-shaped, light tails       -> norm
#   bell-shaped but heavy tails / outliers  -> Student-t
#   bounded outcomes (0 to 1, percent)       -> beta
#   all-positive, skewed                      -> lognormal or gamma
#   counts                                     -> poisson / negbin (NOT normal)
#   tail probability < 1e-10                  -> sf / logsf, never 1 - cdf
#
# Anti-pattern: passing variance to scale=
#   scale is the STANDARD DEVIATION, not the variance. norm(loc=0, scale=4) is
#   a normal with std=4, not var=4. This is the most common scipy.stats bug.
```

## Decision Rule

```text
roughly bell-shaped, light tails       -> norm
bell-shaped but heavy tails / outliers  -> Student-t
bounded outcomes (0 to 1, percent)       -> beta
all-positive, skewed                      -> lognormal or gamma
counts                                     -> poisson / negbin (NOT normal)
tail probability < 1e-10                  -> sf / logsf, never 1 - cdf
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing variance to scale=
>   scale is the STANDARD DEVIATION, not the variance. norm(loc=0, scale=4) is
>   a normal with std=4, not var=4. This is the most common scipy.stats bug.

## Tips

- loc=mean, scale=std — don't confuse with variance
- ppf() is inverse of cdf(); use for critical values in hypothesis testing
- rvs(size=n) generates random samples; set random_state for reproducibility

## Common Mistake

> [!warning] Passing variance instead of std to scale parameter.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
mu, sigma = 0, 1
```

**Senior:**
```python
print(f'P(1 < X < 2): {prob_1to2:.4f}')
```

## See Also

- [[Sections/stats/distributions-py/_Index|Statistics & Probability → Probability Distributions]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "bootstrap"
title: "numpy bootstrap resampling"
category: "Resampling"
subtitle: "Sample with replacement for confidence intervals"
signature_short: "np.random.choice(data, size=n, replace=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "numpy bootstrap resampling"
  - "bootstrap"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/resampling"
  - "tier/tiered"
---

# numpy bootstrap resampling

> Sample with replacement for confidence intervals

## Overview

Sample original data with replacement. Repeat many times, compute statistic each time. Distribution of bootstrap statistics approximates sampling distribution.

## Signature

```python
np.random.choice(data, size=n, replace=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Hand-rolled bootstrap on the mean
# STRENGTHS - Shows the core idea: resample, recompute, take percentiles
# WEAKNESSES- Slow Python loop; no scipy.stats.bootstrap shortcut
#
import numpy as np

rng  = np.random.default_rng(0)
data = np.array([2.3, 1.8, 2.1, 2.5, 1.9, 2.2, 2.0, 2.4])

means = np.array([
    rng.choice(data, size=len(data), replace=True).mean()    # MUST replace=True
    for _ in range(10_000)
])
print(f"95% CI for mean: ({np.percentile(means, 2.5):.3f}, {np.percentile(means, 97.5):.3f})")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Vectorize the resampling, use scipy.stats.bootstrap, bootstrap any statistic
# STRENGTHS - 100x faster than a loop; one call covers CI methods
# WEAKNESSES- No BCa vs percentile vs basic discussion in depth
#
import numpy as np
from scipy import stats

rng  = np.random.default_rng(0)
data = np.array([2.3, 1.8, 2.1, 2.5, 1.9, 2.2, 2.0, 2.4])

# 1) Vectorized hand-rolled bootstrap — much faster than the loop above
n, B = len(data), 10_000
idx   = rng.integers(0, n, size=(B, n))
means = data[idx].mean(axis=1)
print(f"hand: 95% CI ({np.percentile(means, 2.5):.3f}, {np.percentile(means, 97.5):.3f})")

# 2) scipy.stats.bootstrap — does it for you, with multiple CI methods
res = stats.bootstrap((data,), np.mean,
                      confidence_level=0.95,
                      n_resamples=10_000,
                      method="BCa",
                      random_state=0)
print(f"BCa: 95% CI {res.confidence_interval}")

# 3) Bootstrap works for ANY statistic — median, std, regression slope, ratio
def slope(x, y):
    return np.polyfit(x, y, 1)[0]
x = np.arange(20)
y = 2 * x + rng.normal(0, 1, 20)
res_slope = stats.bootstrap((x, y), slope, paired=True,
                             confidence_level=0.95, n_resamples=5_000,
                             random_state=0)
print(f"slope 95% CI: {res_slope.confidence_interval}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Method matrix, bootstrap pitfalls, block bootstrap for time series
# STRENGTHS - Captures when bootstrap is right, when it lies, what to swap in
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)

# 1) Three CI methods — pick BCa unless you have a reason not to
data = rng.lognormal(0, 1, 50)                    # skewed test case
for method in ("percentile", "basic", "BCa"):
    ci = stats.bootstrap((data,), np.median,
                         confidence_level=0.95, n_resamples=10_000,
                         method=method, random_state=0).confidence_interval
    print(f"{method:>10}: ({ci.low:.3f}, {ci.high:.3f})")
# - percentile: simple but biased on skewed stats
# - basic:      pivot — correct location but worse coverage
# - BCa:        bias-corrected & accelerated; the right default for asymmetric stats

# 2) Bootstrap is INVALID for: extremes (max, min), heavy-tail tail probabilities,
#    statistics with infinite variance. Use EVT or parametric methods there.

# 3) Time series / autocorrelated data — IID bootstrap underestimates SEs.
#    Block bootstrap preserves serial structure.
def block_bootstrap_mean(x, block=10, B=2000, alpha=0.05, rng=rng):
    n = len(x)
    n_blocks = n // block
    means = np.empty(B)
    for i in range(B):
        starts   = rng.integers(0, n - block + 1, size=n_blocks)
        sample   = np.concatenate([x[s:s+block] for s in starts])
        means[i] = sample.mean()
    return np.quantile(means, [alpha/2, 1 - alpha/2])

ts = np.cumsum(rng.normal(0, 1, 200))             # autocorrelated series
print("block boot CI:", block_bootstrap_mean(ts, block=20))

# Decision rule:
#   any IID statistic, want a CI            -> stats.bootstrap, method='BCa'
#   tiny n with skew                         -> bootstrap is essential; n_resamples >= 10_000
#   regression slope CI / model statistic   -> bootstrap rows (paired=True)
#   time series                               -> block bootstrap, block ~ sqrt(n)
#   stratified design                          -> resample WITHIN strata
#   need a permutation test instead           -> stats.permutation_test (different goal)
#
# Anti-pattern: bootstrap on the maximum
#   The bootstrap distribution of max(X) is biased — a resample can never exceed
#   the original max. Use extreme-value theory (gumbel / GEV) for tail behavior.
```

## Decision Rule

```text
any IID statistic, want a CI            -> stats.bootstrap, method='BCa'
tiny n with skew                         -> bootstrap is essential; n_resamples >= 10_000
regression slope CI / model statistic   -> bootstrap rows (paired=True)
time series                               -> block bootstrap, block ~ sqrt(n)
stratified design                          -> resample WITHIN strata
need a permutation test instead           -> stats.permutation_test (different goal)
```

## Anti-Pattern

> [!warning] Anti-pattern
> bootstrap on the maximum
>   The bootstrap distribution of max(X) is biased — a resample can never exceed
>   the original max. Use extreme-value theory (gumbel / GEV) for tail behavior.

## Tips

- Replace=True essential for bootstrap; with replacement differs from original
- Number of bootstrap samples 10000 typical; more for smoother estimates
- Works for any statistic; very flexible, no distributional assumptions

## Common Mistake

> [!warning] Sampling without replacement; violates bootstrap principle.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    result.append(x * 2)
```

**Senior:**
```python
result = [x * 2 for x in items]
```

## See Also

- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

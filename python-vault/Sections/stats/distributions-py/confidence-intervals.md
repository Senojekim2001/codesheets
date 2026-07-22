---
type: "entry"
domain: "python"
file: "stats"
section: "distributions-py"
id: "confidence-intervals"
title: "scipy.stats.t.interval, bootstrap"
category: "Estimation"
subtitle: "Estimate population parameters with uncertainty bounds"
signature_short: "scipy.stats.t.interval(alpha, df, loc, scale), bootstrap resampling"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.t.interval, bootstrap"
  - "confidence-intervals"
tags:
  - "python"
  - "python/stats"
  - "python/stats/distributions-py"
  - "category/estimation"
  - "tier/tiered"
---

# scipy.stats.t.interval, bootstrap

> Estimate population parameters with uncertainty bounds

## Overview

Confidence intervals estimate range containing true parameter with specified probability. t-distribution used for small samples; bootstrap provides non-parametric CI.

## Signature

```python
scipy.stats.t.interval(alpha, df, loc, scale), bootstrap resampling
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 95% CI for the mean using stats.t.interval
# STRENGTHS - One call, correct for small samples
# WEAKNESSES- No bootstrap, no proportion CIs, no interpretation guard
#
import numpy as np
from scipy import stats

data = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])

mean = data.mean()
se   = stats.sem(data)
ci   = stats.t.interval(0.95, df=len(data) - 1, loc=mean, scale=se)
print(f"mean = {mean:.2f}, 95% CI = ({ci[0]:.2f}, {ci[1]:.2f})")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - t-CI vs scipy.stats.bootstrap; CI for a proportion
# STRENGTHS - The two CI tools and the proportion case people get wrong
# WEAKNESSES- No BCa correction discussion, no comparison of CI types
#
import numpy as np
from scipy import stats

# 1) t-distribution CI for the mean — assumes roughly normal data or n large
data = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])
ci_t = stats.t.interval(0.95, df=len(data) - 1,
                        loc=data.mean(), scale=stats.sem(data))
print("t   95% CI:", ci_t)

# 2) Bootstrap CI — non-parametric, works for any statistic
res = stats.bootstrap((data,), np.mean,
                      confidence_level=0.95,
                      n_resamples=10_000,
                      random_state=0)
print("boot 95% CI:", res.confidence_interval)

# 3) Proportion CI — DON'T use the normal approximation when p is near 0 or 1
#    Wilson interval is the modern default.
n_success, n_total = 12, 50
ci_wilson = stats.binomtest(k=n_success, n=n_total).proportion_ci(method="wilson")
print(f"prop  95% CI: ({ci_wilson.low:.3f}, {ci_wilson.high:.3f})")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Method matrix: when each CI is right, when it lies
# STRENGTHS - The patterns that prevent over-confident intervals in production
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)

# 1) Bootstrap CI — three flavors: percentile, basic, BCa (bias-corrected & accelerated).
#    BCa is the right default; it corrects for bias and skewness in the bootstrap dist.
data = rng.lognormal(0, 1, 30)                  # skewed: classic bootstrap test case
for method in ("percentile", "basic", "BCa"):
    ci = stats.bootstrap((data,), np.median,
                         confidence_level=0.95,
                         method=method,
                         n_resamples=10_000,
                         random_state=0).confidence_interval
    print(f"{method:>10}: ({ci.low:.2f}, {ci.high:.2f})")

# 2) Bootstrap is INVALID for some statistics — extremes (max, min), heavy-tail
#    parameters. Use parametric CIs or extreme-value theory there.

# 3) Pivotal CI for the variance (chi-squared)
def variance_ci(data, alpha=0.05):
    n  = len(data)
    s2 = data.var(ddof=1)
    lo = (n - 1) * s2 / stats.chi2.ppf(1 - alpha/2, df=n - 1)
    hi = (n - 1) * s2 / stats.chi2.ppf(alpha/2,   df=n - 1)
    return lo, hi
print("var 95% CI:", variance_ci(data))

# 4) Difference of means (Welch — unequal variances default; t-test's CI)
a, b = rng.normal(0, 1, 30), rng.normal(0.5, 1.5, 25)
ci = stats.ttest_ind(a, b, equal_var=False).confidence_interval(0.95)
print(f"mean diff 95% CI: ({ci.low:.2f}, {ci.high:.2f})")

# Decision rule:
#   mean of one sample, normal-ish      -> stats.t.interval
#   any statistic, no parametric assumption -> stats.bootstrap, method='BCa'
#   proportion / binary outcome           -> Wilson (binomtest.proportion_ci)
#   variance / std                         -> chi-squared pivotal
#   difference of means                    -> ttest_ind(...).confidence_interval()
#   small n AND skewed                     -> bootstrap BCa, n_resamples >= 10_000
#   extreme quantiles (95th, 99th)         -> EVT; bootstrap underestimates
#
# Anti-pattern: "the 95% CI contains the true value 95% of the time"
#   Wrong interpretation — that's a Bayesian credible interval. The frequentist
#   95% CI says: "if we repeated sampling many times, 95% of intervals computed
#   this way would contain the true value." For a single observed CI, it either
#   does or doesn't.
```

## Decision Rule

```text
mean of one sample, normal-ish      -> stats.t.interval
any statistic, no parametric assumption -> stats.bootstrap, method='BCa'
proportion / binary outcome           -> Wilson (binomtest.proportion_ci)
variance / std                         -> chi-squared pivotal
difference of means                    -> ttest_ind(...).confidence_interval()
small n AND skewed                     -> bootstrap BCa, n_resamples >= 10_000
extreme quantiles (95th, 99th)         -> EVT; bootstrap underestimates
```

## Anti-Pattern

> [!warning] Anti-pattern
> "the 95% CI contains the true value 95% of the time"
>   Wrong interpretation — that's a Bayesian credible interval. The frequentist
>   95% CI says: "if we repeated sampling many times, 95% of intervals computed
>   this way would contain the true value." For a single observed CI, it either
>   does or doesn't.

## Tips

- Use t-distribution for small samples (n < 30), z-distribution for large samples
- Bootstrap works without assuming normality; flexible and robust
- CI narrower with larger sample size; wider with higher confidence level

## Common Mistake

> [!warning] Using z-scores instead of t-scores for small samples; t accounts for uncertainty in estimating std.

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

- [[Sections/stats/distributions-py/_Index|Statistics & Probability → Probability Distributions]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

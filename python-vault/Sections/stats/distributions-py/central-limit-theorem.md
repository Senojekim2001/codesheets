---
type: "entry"
domain: "python"
file: "stats"
section: "distributions-py"
id: "central-limit-theorem"
title: "CLT simulation"
category: "Theory"
subtitle: "Distribution of sample means approaches normal"
signature_short: "Simulate repeated sampling; plot distribution of means"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "CLT simulation"
  - "central-limit-theorem"
tags:
  - "python"
  - "python/stats"
  - "python/stats/distributions-py"
  - "category/theory"
  - "tier/tiered"
---

# CLT simulation

> Distribution of sample means approaches normal

## Overview

CLT: regardless of population distribution, sample mean distribution approaches normal as n increases. Foundation of inference and hypothesis testing.

## Signature

```python
Simulate repeated sampling; plot distribution of means
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Sample from a non-normal population, average, watch the means clump
# STRENGTHS - Smallest demo of CLT in action
# WEAKNESSES- No comparison of n; no theoretical SE
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
population = stats.expon.rvs(scale=2, size=10_000, random_state=rng)   # right-skewed

# Take 1000 samples of size n=30 and average each one
sample_means = np.array([
    rng.choice(population, size=30).mean() for _ in range(1000)
])

print(f"population skew:    {stats.skew(population):+.2f}")    # ~ +2 (very skewed)
print(f"sample-means skew:  {stats.skew(sample_means):+.2f}")  # ~ 0 (symmetric)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Show convergence as n grows and verify SE = sigma/sqrt(n)
# STRENGTHS - Quantitative CLT: the rate (1/sqrt(n)) is the actual prize
# WEAKNESSES- No discussion of when CLT FAILS
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
population = stats.expon.rvs(scale=2, size=100_000, random_state=rng)
pop_std = population.std()

print(f"{'n':>5} | {'observed SE':>12} | {'sigma/sqrt(n)':>14} | {'skew':>6}")
for n in (5, 10, 30, 100, 500):
    means = np.array([rng.choice(population, size=n).mean() for _ in range(2000)])
    print(f"{n:>5} | {means.std():>12.3f} | {pop_std / np.sqrt(n):>14.3f} | "
          f"{stats.skew(means):>+6.2f}")

# Two takeaways:
#   - The observed SE matches sigma/sqrt(n) at every n.
#   - Skew falls toward 0 as n grows — that's the CLT.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When CLT fails: heavy tails, dependence, bounded support
# STRENGTHS - The cases where "n=30 is plenty" is wrong, and the diagnostics
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)

# 1) Heavy tails (Cauchy / Pareto with small alpha) — CLT NEVER converges
#    because the population variance is infinite.
def sample_means(pop_sampler, n, reps=2000):
    return np.array([pop_sampler(n).mean() for _ in range(reps)])

cauchy_means  = sample_means(lambda n: rng.standard_cauchy(n), n=1000)
print(f"Cauchy n=1000 means: skew={stats.skew(cauchy_means):.2f} "
      f"std={cauchy_means.std():.1f}")    # std doesn't shrink with n!

# 2) Strong serial correlation breaks CLT's independence assumption.
#    Solution: thin the series, or use a CLT for dependent data.

# 3) Bounded outcomes (proportions near 0 or 1) need n much larger than 30.
#    Rule of thumb: n*p > 10 AND n*(1-p) > 10 before the normal approx is OK.

# 4) Diagnostic: Shapiro-Wilk on the SAMPLE MEANS (not the data).
#    If p < 0.05 here, your CLT-based CI / t-test is suspect.
fast_clt   = sample_means(lambda n: rng.exponential(1, n), n=30)
print("Shapiro on means (exp, n=30):", stats.shapiro(fast_clt).pvalue)  # ~ ok

# Decision rule:
#   light-tailed, independent, n >= 30   -> classical CLT; t-test / z-test work
#   heavy-tailed (var infinite)            -> CLT fails; use medians + bootstrap
#   bounded (proportions, rates)            -> need n*p, n*(1-p) >= 10
#   strong autocorrelation (time series)    -> block bootstrap, NOT plain CLT
#   tiny n (< 10) even on normal data       -> exact tests (permutation, Fisher)
#
# Anti-pattern: assuming "n=30 is always enough"
#   The classic rule comes from Pearson-era pre-bootstrap days. With heavy tails
#   or strong skew you may need n in the hundreds before the means look normal.
#   Always check the means' distribution, not the data's.
```

## Decision Rule

```text
light-tailed, independent, n >= 30   -> classical CLT; t-test / z-test work
heavy-tailed (var infinite)            -> CLT fails; use medians + bootstrap
bounded (proportions, rates)            -> need n*p, n*(1-p) >= 10
strong autocorrelation (time series)    -> block bootstrap, NOT plain CLT
tiny n (< 10) even on normal data       -> exact tests (permutation, Fisher)
```

## Anti-Pattern

> [!warning] Anti-pattern
> assuming "n=30 is always enough"
>   The classic rule comes from Pearson-era pre-bootstrap days. With heavy tails
>   or strong skew you may need n in the hundreds before the means look normal.
>   Always check the means' distribution, not the data's.

## Tips

- CLT applies regardless of population shape; sample means converge to normal
- Larger sample size needed for non-normal populations to see effect
- SEM = population_std / sqrt(n); justifies z-tests and CIs

## Common Mistake

> [!warning] Confusing population normality requirement; CLT needs normal sample means, not population.

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

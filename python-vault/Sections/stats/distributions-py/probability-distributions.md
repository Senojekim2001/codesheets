---
type: "entry"
domain: "python"
file: "stats"
section: "distributions-py"
id: "probability-distributions"
title: "binomial, poisson, exponential, uniform"
category: "Distribution Families"
subtitle: "Binomial, Poisson, Exponential, Uniform"
signature_short: "scipy.stats.binom(), poisson(), expon(), uniform()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "binomial, poisson, exponential, uniform"
  - "probability-distributions"
tags:
  - "python"
  - "python/stats"
  - "python/stats/distributions-py"
  - "category/distribution-families"
  - "tier/tiered"
---

# binomial, poisson, exponential, uniform

> Binomial, Poisson, Exponential, Uniform

## Overview

Common distributions for modeling different phenomena. Binomial for count successes, Poisson for rare events, Exponential for waiting times, Uniform for equal probability.

## Signature

```python
scipy.stats.binom(), poisson(), expon(), uniform()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One example of each: binomial (discrete), exponential (continuous)
# STRENGTHS - Shows the pmf-vs-pdf split that confuses beginners
# WEAKNESSES- No relationships, no parameterization gotchas
#
from scipy import stats

# Discrete -> .pmf (probability MASS)
b = stats.binom(n=10, p=0.3)                     # 10 trials, 30% success rate
print(f"P(K=3) = {b.pmf(3):.3f}")                # exact count
print(f"P(K<=3) = {b.cdf(3):.3f}")               # cumulative

# Continuous -> .pdf (probability DENSITY)
e = stats.expon(scale=2)                          # mean = 2 (waiting time)
print(f"f(1)   = {e.pdf(1):.3f}")
print(f"P(X<=1) = {e.cdf(1):.3f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Four common families with the standard parameterization for each
# STRENGTHS - The lookup table you'll come back to: which to use, how to call it
# WEAKNESSES- No log-space evaluation, no fit
#
from scipy import stats

# DISCRETE
binom    = stats.binom(n=10, p=0.3)              # K successes out of n
poisson  = stats.poisson(mu=3)                   # mu = average rate
geom     = stats.geom(p=0.2)                     # # trials until first success
nbinom   = stats.nbinom(n=5, p=0.5)              # # failures before 5 successes

# CONTINUOUS
expon    = stats.expon(scale=2)                  # scale = 1/lambda (mean wait)
gamma    = stats.gamma(a=2, scale=2)             # shape a, scale; sum of exponentials
beta     = stats.beta(a=2, b=5)                  # bounded on [0, 1]
uniform  = stats.uniform(loc=0, scale=10)        # uniform on [loc, loc+scale]

# Pattern is the same for all of them
for name, d in [("binom", binom), ("poisson", poisson),
                ("expon", expon), ("beta", beta)]:
    if d.dist.name in ("binom", "poisson", "geom", "nbinom"):
        evaluator = d.pmf
    else:
        evaluator = d.pdf
    print(f"{name:>8}: mean={d.mean():.2f}  var={d.var():.2f}  f(at typical)={evaluator(d.mean()):.3f}")

# scipy parameterization gotcha:
# - expon takes scale = 1/lambda (NOT lambda)
# - uniform takes (loc, scale) where range is [loc, loc + scale], NOT [low, high]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Distribution selection by the data-generating process; log-space safety
# STRENGTHS - The mental model that beats googling "which distribution for X"
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

# 1) Always evaluate likelihoods in log-space — products of small numbers underflow
data = np.array([1.2, 0.8, 2.1, 0.5, 3.0])
ll_naive = np.prod(stats.expon(scale=1.5).pdf(data))      # works for n=5; explodes at n=1000
ll_safe  = stats.expon(scale=1.5).logpdf(data).sum()      # always stable
print(f"naive: {ll_naive:.3e}   logpdf sum: {ll_safe:.3f}")

# 2) Method-of-moments quick fits (good initialization for MLE)
def fit_gamma_moments(x):
    m, v = x.mean(), x.var(ddof=1)
    a = m * m / v                                          # shape
    scale = v / m                                          # scale
    return a, scale

# 3) Compound / mixture models — Poisson with overdispersion -> NegBinomial
counts = stats.nbinom.rvs(n=5, p=0.3, size=1000, random_state=0)
# Poisson assumes mean == var; if var > mean, fit nbinom instead.
print(f"mean={counts.mean():.2f}  var={counts.var():.2f}")

# Decision rule:
#   N independent yes/no trials, fixed N             -> Binomial
#   rare events in time/space, rate constant         -> Poisson
#   counts BUT var > mean (overdispersed)             -> NegBinomial
#   waiting time between Poisson events               -> Exponential
#   sum of k independent exponentials                  -> Gamma (shape=k)
#   rate / proportion bounded in [0,1]                 -> Beta
#   product of many small effects                      -> Lognormal
#   max of many samples                                  -> Gumbel / GEV
#   anything fits a Bell                                 -> Normal LAST, after the others fail
#
# Anti-pattern: defaulting to normal because "everything is normal eventually"
#   CLT applies to the SAMPLE MEAN, not the data. Income, file sizes, customer
#   lifetimes are skewed populations forever. Normal-on-counts gives negative
#   probabilities and broken CIs. Pick the family from the process, then verify.
```

## Decision Rule

```text
N independent yes/no trials, fixed N             -> Binomial
rare events in time/space, rate constant         -> Poisson
counts BUT var > mean (overdispersed)             -> NegBinomial
waiting time between Poisson events               -> Exponential
sum of k independent exponentials                  -> Gamma (shape=k)
rate / proportion bounded in [0,1]                 -> Beta
product of many small effects                      -> Lognormal
max of many samples                                  -> Gumbel / GEV
anything fits a Bell                                 -> Normal LAST, after the others fail
```

## Anti-Pattern

> [!warning] Anti-pattern
> defaulting to normal because "everything is normal eventually"
>   CLT applies to the SAMPLE MEAN, not the data. Income, file sizes, customer
>   lifetimes are skewed populations forever. Normal-on-counts gives negative
>   probabilities and broken CIs. Pick the family from the process, then verify.

## Tips

- Use pmf() for discrete, pdf() for continuous distributions
- Poisson is limit of Binomial as n→∞, p→0, np=λ
- Exponential is memoryless — P(X > s+t | X > s) = P(X > t)

## Common Mistake

> [!warning] Using pdf() instead of pmf() for discrete distributions (Binomial, Poisson).

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

- [[Sections/stats/distributions-py/_Index|Statistics & Probability → Probability Distributions]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

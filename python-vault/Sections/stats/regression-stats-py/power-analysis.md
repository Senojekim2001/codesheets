---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "power-analysis"
title: "statsmodels.stats.power functions"
category: "Study Design"
subtitle: "Plan sample size to detect effects"
signature_short: "statsmodels.stats.power.tt_solve_power(), tt_ind_solve_power()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "statsmodels.stats.power functions"
  - "power-analysis"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/study-design"
  - "tier/tiered"
---

# statsmodels.stats.power functions

> Plan sample size to detect effects

## Overview

Power: probability of detecting true effect. Use to plan studies: given effect size and power, calculate required sample size.

## Signature

```python
statsmodels.stats.power.tt_solve_power(), tt_ind_solve_power()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Power for a fixed n; sample size for a desired power
# STRENGTHS - The two questions every study planner asks
# WEAKNESSES- Two-sample t-test only; no proportion / ANOVA
#
from statsmodels.stats.power import tt_ind_solve_power

# Given d=0.5, alpha=0.05, what power do we have at n=30 per group?
power = tt_ind_solve_power(effect_size=0.5, nobs1=30, alpha=0.05, ratio=1.0)
print(f"power at n=30/group: {power:.2f}")

# What n do we need for 80% power at d=0.5?
n = tt_ind_solve_power(effect_size=0.5, alpha=0.05, power=0.80, ratio=1.0)
print(f"need n = {n:.0f} per group for 80% power")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Sample size for t-test, ANOVA, and proportions
# STRENGTHS - The three power-analysis families you'll meet most often
# WEAKNESSES- No simulation-based power yet
#
from statsmodels.stats.power import (
    tt_ind_solve_power, FTestAnovaPower,
    NormalIndPower,                                # for proportions via normal approx
)

# 1) Two independent groups, t-test (effect = Cohens d)
n_t = tt_ind_solve_power(effect_size=0.3, alpha=0.05, power=0.80, ratio=1.0)
print(f"t-test  n/group for d=0.3, power=0.80: {n_t:.0f}")

# 2) One-way ANOVA (effect = Cohens f, k groups)
anova = FTestAnovaPower()
n_a = anova.solve_power(effect_size=0.25, k_groups=3, alpha=0.05, power=0.80)
print(f"ANOVA   n/group for f=0.25, k=3, power=0.80: {n_a:.0f}")

# 3) Two-proportion test — convert to effect size 'h' first (Cohen's h)
import numpy as np
def h_from_props(p1, p2):
    return 2 * np.arcsin(np.sqrt(p1)) - 2 * np.arcsin(np.sqrt(p2))

h = h_from_props(0.10, 0.15)                     # 10% vs 15% conversion rate
n_p = NormalIndPower().solve_power(effect_size=abs(h), alpha=0.05, power=0.80)
print(f"prop    n/group for 10% vs 15%, power=0.80: {n_p:.0f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Sensitivity curves, simulation-based power, MDE for fixed n
# STRENGTHS - Captures the planning analyses that survive design review
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.power import tt_ind_solve_power

# 1) Sensitivity curve — required n vs effect size, fixed alpha and power
ds = np.linspace(0.1, 1.0, 19)
ns = [tt_ind_solve_power(effect_size=d, alpha=0.05, power=0.80) for d in ds]
print(pd.DataFrame({"d": ds.round(2), "n_per_group": np.round(ns).astype(int)}).head())

# 2) Minimum Detectable Effect (MDE) — given fixed n, what d can we detect with 80% power?
def mde(n, alpha=0.05, power=0.80):
    return tt_ind_solve_power(effect_size=None, nobs1=n, alpha=alpha, power=power)
print(f"MDE for n=50/group: d = {mde(50):.2f}")

# 3) Simulation-based power — when no closed form (e.g. nonparametric, mixed models)
def sim_power_rank(d, n, alpha=0.05, reps=2000, rng=np.random.default_rng(0)):
    hits = 0
    for _ in range(reps):
        a = rng.normal(0, 1, n)
        b = rng.normal(d, 1, n)
        if stats.mannwhitneyu(a, b).pvalue < alpha:
            hits += 1
    return hits / reps
print(f"Mann-Whitney power, d=0.5, n=30: {sim_power_rank(0.5, 30):.2f}")

# 4) The four-quadrant trade — fix THREE, solve for the FOURTH
#    (effect, n, alpha, power). Pre-register which two you fix.

# Decision rule:
#   prospective study planning           -> solve for n given (effect, alpha, power)
#   post-hoc on a small study             -> compute MDE; "we could only detect d > X"
#   nonparametric or mixed-effects        -> simulation power, not closed-form formulas
#   pilot study to estimate effect         -> use the LOWER bound of the d CI for planning
#   multi-arm trial                         -> ANOVA power; then plan post-hoc Tukey power separately
#
# Anti-pattern: post-hoc "observed power" reported alongside p > 0.05
#   Observed power is a deterministic function of the p-value — it adds no
#   information ("we didn't reject, so we had low power" is a tautology). Report
#   the MDE the study could have detected instead.
```

## Decision Rule

```text
prospective study planning           -> solve for n given (effect, alpha, power)
post-hoc on a small study             -> compute MDE; "we could only detect d > X"
nonparametric or mixed-effects        -> simulation power, not closed-form formulas
pilot study to estimate effect         -> use the LOWER bound of the d CI for planning
multi-arm trial                         -> ANOVA power; then plan post-hoc Tukey power separately
```

## Anti-Pattern

> [!warning] Anti-pattern
> post-hoc "observed power" reported alongside p > 0.05
>   Observed power is a deterministic function of the p-value — it adds no
>   information ("we didn't reject, so we had low power" is a tautology). Report
>   the MDE the study could have detected instead.

## Tips

- Higher power (0.80+) preferred; trade-off with sample size and cost
- Power depends on effect size, sample size, alpha, and alternative hypothesis
- Small studies underpowered; may miss real effects (Type II error)

## Common Mistake

> [!warning] Planning sample size without power analysis; risks underpowered studies.

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

- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

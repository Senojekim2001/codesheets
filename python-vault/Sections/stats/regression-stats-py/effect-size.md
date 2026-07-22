---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "effect-size"
title: "Cohen's d, eta-squared"
category: "Effect Sizes"
subtitle: "Practical significance vs. statistical significance"
signature_short: "d = (m1 - m2) / pooled_std, eta² = ss_between / ss_total"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cohen's d, eta-squared"
  - "effect-size"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/effect-sizes"
  - "tier/tiered"
---

# Cohen's d, eta-squared

> Practical significance vs. statistical significance

## Overview

Effect sizes quantify magnitude of differences independent of sample size. Essential complement to p-values. Cohen's d for means, eta² for ANOVA.

## Signature

```python
d = (m1 - m2) / pooled_std, eta² = ss_between / ss_total
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Cohens d for two groups: (m1 - m2) / pooled_sd
# STRENGTHS - The single number to report alongside any p-value
# WEAKNESSES- No CIs; no other effect-size families
#
import numpy as np

a = np.array([10, 12, 11, 13, 12, 11])
b = np.array([15, 17, 16, 18, 17, 16])

m1, m2 = a.mean(), b.mean()
s1, s2 = a.std(ddof=1), b.std(ddof=1)
n1, n2 = len(a), len(b)
sp = np.sqrt(((n1-1)*s1**2 + (n2-1)*s2**2) / (n1 + n2 - 2))   # pooled sd
d  = (m2 - m1) / sp
print(f"Cohen's d = {d:.2f}    (0.2 small / 0.5 medium / 0.8 large)")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Cohens d, Hedges g (small-n correction), eta^2 for ANOVA, r for correlation
# STRENGTHS - The four effect sizes that cover most stat reporting
# WEAKNESSES- No CIs on the effect sizes yet
#
import numpy as np

# 1) Cohens d / Hedges g (correction for small n)
def cohens_d(x, y):
    nx, ny = len(x), len(y)
    sp = np.sqrt(((nx-1)*x.var(ddof=1) + (ny-1)*y.var(ddof=1)) / (nx + ny - 2))
    return (x.mean() - y.mean()) / sp

def hedges_g(x, y):
    d = cohens_d(x, y)
    n = len(x) + len(y)
    correction = 1 - 3 / (4*n - 9)               # Hedges' bias correction
    return d * correction

a = np.array([10, 12, 11, 13, 12, 11])
b = np.array([15, 17, 16, 18, 17, 16])
print(f"d = {cohens_d(a, b):.2f}, g = {hedges_g(a, b):.2f}")

# 2) eta^2 — ANOVA effect size (variance explained by group)
groups = [a, b, np.array([20, 22, 21, 23, 22, 21])]
all_x  = np.concatenate(groups)
gm     = all_x.mean()
ss_between = sum(len(g) * (g.mean() - gm)**2 for g in groups)
ss_total   = ((all_x - gm)**2).sum()
print(f"eta^2 = {ss_between/ss_total:.3f}    (0.01 small / 0.06 medium / 0.14 large)")

# 3) Correlation r is itself an effect size
x = np.arange(20); y = 2*x + np.random.default_rng(0).normal(0, 1, 20)
r = np.corrcoef(x, y)[0, 1]
print(f"r = {r:+.3f}    r^2 = {r**2:.3f} (variance explained)")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Effect-size families, CIs on effects, omega^2 for unbiased ANOVA
# STRENGTHS - The reporting kit that satisfies modern review standards
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)

# 1) Bootstrap CI on Cohens d — the value people forget to attach
def cohens_d_arr(x, y):
    nx, ny = len(x), len(y)
    sp = np.sqrt(((nx-1)*x.var(ddof=1) + (ny-1)*y.var(ddof=1)) / (nx + ny - 2))
    return (x.mean() - y.mean()) / sp

a = rng.normal(0, 1, 50); b = rng.normal(0.4, 1, 50)
res = stats.bootstrap((a, b), cohens_d_arr,
                      vectorized=False, paired=False,
                      confidence_level=0.95, n_resamples=10_000,
                      method="BCa", random_state=0)
print(f"d = {cohens_d_arr(a, b):.2f}, 95% CI = ({res.confidence_interval.low:.2f}, "
      f"{res.confidence_interval.high:.2f})")

# 2) Omega^2 — less biased ANOVA effect size; unbiased even at small n
def omega_squared(*groups):
    all_x   = np.concatenate(groups)
    gm      = all_x.mean()
    ss_b    = sum(len(g) * (g.mean() - gm)**2 for g in groups)
    ss_w    = sum(((g - g.mean())**2).sum() for g in groups)
    df_b    = len(groups) - 1
    df_w    = len(all_x) - len(groups)
    ms_w    = ss_w / df_w
    ss_t    = ss_b + ss_w
    return (ss_b - df_b * ms_w) / (ss_t + ms_w)

# 3) Effect-size by design — pick the right metric
#    Means difference        -> Cohens d / Hedges g
#    ANOVA / 3+ groups        -> eta^2 (basic) or omega^2 (less biased)
#    Correlation               -> r (or r^2 for variance explained)
#    2x2 chi^2 / contingency  -> phi (= Cramers V for 2x2)
#    r x c chi^2                -> Cramers V
#    odds (logistic, 2x2)      -> odds ratio (with CI from sm logit)
#    rank-based / Mann-Whitney -> rank-biserial r
#
# Decision rule:
#   reporting any p-value            -> ALSO report effect size + 95% CI
#   small n (n < 30 per group)       -> Hedges g, not Cohens d (less biased)
#   ANOVA with unequal n               -> omega^2; eta^2 inflates with imbalance
#   noisy / heavy-tailed                 -> rank-based effect sizes (rank-biserial)
#
# Anti-pattern: declaring an effect "large" via the d=0.8 threshold without context
#   Cohens labels are field-relative. In medical trials d=0.2 can be lifesaving;
#   in physics d=2 might be a noise-level discrepancy. Always interpret in domain.
```

## Decision Rule

```text
reporting any p-value            -> ALSO report effect size + 95% CI
small n (n < 30 per group)       -> Hedges g, not Cohens d (less biased)
ANOVA with unequal n               -> omega^2; eta^2 inflates with imbalance
noisy / heavy-tailed                 -> rank-based effect sizes (rank-biserial)
```

## Anti-Pattern

> [!warning] Anti-pattern
> declaring an effect "large" via the d=0.8 threshold without context
>   Cohens labels are field-relative. In medical trials d=0.2 can be lifesaving;
>   in physics d=2 might be a noise-level discrepancy. Always interpret in domain.

## Tips

- Always report effect sizes alongside p-values
- Effect size interpretation context-dependent; consider domain importance
- Eta² and omega² both used; omega² less biased with unequal group sizes

## Common Mistake

> [!warning] Reporting only p-values without effect sizes; hides practical significance.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
from scipy import stats
group1 = np.array([10, 12, 11, 13, 12, 11])
group2 = np.array([15, 17, 16, 18, 17, 16])
```

**Senior:**
```python
print(f'  r-squared: {r_squared:.4f} (% variance explained)')
```

## See Also

- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

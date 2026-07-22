---
type: "entry"
domain: "python"
file: "stats"
section: "hypothesis-testing-py"
id: "t-test"
title: "ttest_1samp, ttest_ind, ttest_rel"
category: "Parametric Tests"
subtitle: "Test if means differ significantly"
signature_short: "scipy.stats.ttest_1samp(), ttest_ind(), ttest_rel()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ttest_1samp, ttest_ind, ttest_rel"
  - "t-test"
tags:
  - "python"
  - "python/stats"
  - "python/stats/hypothesis-testing-py"
  - "category/parametric-tests"
  - "tier/tiered"
---

# ttest_1samp, ttest_ind, ttest_rel

> Test if means differ significantly

## Overview

T-tests compare means. One-sample tests against constant; two-sample compares groups; paired tests related measurements. All return t-statistic and p-value.

## Signature

```python
scipy.stats.ttest_1samp(), ttest_ind(), ttest_rel()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One-sample t-test against a hypothesized mean
# STRENGTHS - Smallest valid hypothesis test in scipy
# WEAKNESSES- No two-sample, no paired, no effect size
#
import numpy as np
from scipy import stats

sample = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])

result = stats.ttest_1samp(sample, popmean=24)
print(f"t = {result.statistic:.3f}, p = {result.pvalue:.3f}")
print("reject H0 (mean = 24)?" , result.pvalue < 0.05)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - The three flavors: 1samp, ind (Welch), rel (paired)
# STRENGTHS - Picks the right test for each setup; checks variance assumption
# WEAKNESSES- No effect size (Cohen's d), no normality check
#
import numpy as np
from scipy import stats

# 1) One-sample: data vs a known/hypothesized value
sample = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])
print(stats.ttest_1samp(sample, popmean=24))

# 2) Two independent groups — Welch's t-test (default for unequal variances)
a = np.array([20, 22, 25, 24, 23])
b = np.array([28, 26, 29, 27, 30])
res = stats.ttest_ind(a, b, equal_var=False)             # equal_var=False -> Welch
print(f"two-sample: t={res.statistic:.3f}  p={res.pvalue:.4f}")
print(f"95% CI for mean diff: {res.confidence_interval(0.95)}")

# Quick check: were the variances close enough for Student's instead of Welch?
print("Levene p:", stats.levene(a, b).pvalue)            # > 0.05 -> equal-var OK

# 3) Paired (repeated measures: same subjects, two conditions)
before = np.array([20, 22, 25, 24, 23])
after  = np.array([22, 25, 28, 26, 26])
print(stats.ttest_rel(before, after))                    # tests mean(after-before) = 0
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Effect size, one-sided tests, normality diagnostics, robust alternatives
# STRENGTHS - The full reporting kit + decision rules for when t-test is wrong
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

a = np.array([20, 22, 25, 24, 23, 21, 22, 24])
b = np.array([28, 26, 29, 27, 30, 25, 28, 27])

# 1) Effect size — p-value tells you SIGNIFICANCE; Cohen's d tells you SIZE
def cohens_d(x, y):
    nx, ny = len(x), len(y)
    sp = np.sqrt(((nx - 1)*x.var(ddof=1) + (ny - 1)*y.var(ddof=1)) / (nx + ny - 2))
    return (x.mean() - y.mean()) / sp
d = cohens_d(a, b)
print(f"Cohen's d = {d:.2f}    (|d|: 0.2 small, 0.5 medium, 0.8 large)")

# 2) One-sided test — only when you have a directional hypothesis BEFORE seeing data
res = stats.ttest_ind(a, b, equal_var=False, alternative="less")    # H1: mean(a) < mean(b)
print(f"one-sided p = {res.pvalue:.4f}")

# 3) Diagnostics — t-test assumes near-normality (mostly matters at small n)
print("Shapiro a:", stats.shapiro(a).pvalue)
print("Shapiro b:", stats.shapiro(b).pvalue)

# 4) When normality fails AND n is small -> nonparametric / permutation
print("Mann-Whitney U:", stats.mannwhitneyu(a, b).pvalue)
perm = stats.permutation_test((a, b),
                              statistic=lambda x, y: x.mean() - y.mean(),
                              permutation_type="independent",
                              n_resamples=10_000, random_state=0)
print(f"permutation p = {perm.pvalue:.4f}")

# Decision rule:
#   one sample vs a number               -> ttest_1samp
#   two independent groups, equal var     -> ttest_ind(equal_var=True)
#   two independent groups (default)      -> ttest_ind(equal_var=False) — Welch
#   paired / repeated measures             -> ttest_rel
#   non-normal AND small n                  -> Mann-Whitney U or permutation_test
#   non-normal AND paired                   -> Wilcoxon signed-rank
#   directional hypothesis pre-registered   -> alternative="less"/"greater"
#
# Anti-pattern: reporting only the p-value
#   "p < 0.05" with n=100,000 routinely catches differences too small to matter.
#   Always report effect size (Cohen's d for means) and a CI on the difference.
```

## Decision Rule

```text
one sample vs a number               -> ttest_1samp
two independent groups, equal var     -> ttest_ind(equal_var=True)
two independent groups (default)      -> ttest_ind(equal_var=False) — Welch
paired / repeated measures             -> ttest_rel
non-normal AND small n                  -> Mann-Whitney U or permutation_test
non-normal AND paired                   -> Wilcoxon signed-rank
directional hypothesis pre-registered   -> alternative="less"/"greater"
```

## Anti-Pattern

> [!warning] Anti-pattern
> reporting only the p-value
>   "p < 0.05" with n=100,000 routinely catches differences too small to matter.
>   Always report effect size (Cohen's d for means) and a CI on the difference.

## Tips

- Use ttest_ind with equal_var=False for Welch test (unequal variances)
- Paired test uses differences; more powerful when data are correlated
- p < 0.05: typically reject null hypothesis (difference is significant)

## Common Mistake

> [!warning] Using independent t-test on paired data; paired test has more power.

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

- [[Sections/stats/hypothesis-testing-py/_Index|Statistics & Probability → Hypothesis Testing]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

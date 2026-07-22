---
type: "entry"
domain: "python"
file: "stats"
section: "hypothesis-testing-py"
id: "mann-whitney"
title: "scipy.stats.mannwhitneyu"
category: "Non-parametric Tests"
subtitle: "Compare medians without normality assumption"
signature_short: "scipy.stats.mannwhitneyu(group1, group2)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.mannwhitneyu"
  - "mann-whitney"
tags:
  - "python"
  - "python/stats"
  - "python/stats/hypothesis-testing-py"
  - "category/non-parametric-tests"
  - "tier/tiered"
---

# scipy.stats.mannwhitneyu

> Compare medians without normality assumption

## Overview

Non-parametric alternative to t-test. Works with ranks instead of raw values. Robust to outliers and doesn't assume normality. Tests if distributions differ.

## Signature

```python
scipy.stats.mannwhitneyu(group1, group2)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Mann-Whitney U on two unmatched groups
# STRENGTHS - One call, no normality assumption
# WEAKNESSES- No effect size; no comparison to t-test
#
import numpy as np
from scipy import stats

a = np.array([10, 12, 11, 13, 12, 11, 10, 12])
b = np.array([15, 17, 16, 18, 17, 16, 19])

res = stats.mannwhitneyu(a, b, alternative="two-sided")
print(f"U = {res.statistic:.1f}, p = {res.pvalue:.4f}")
print(f"medians: a={np.median(a):.1f}  b={np.median(b):.1f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Show the outlier-resistance vs t-test, plus rank-biserial effect size
# STRENGTHS - Demonstrates WHY you'd reach for Mann-Whitney over a t-test
# WEAKNESSES- Doesnt cover Wilcoxon (paired non-parametric)
#
import numpy as np
from scipy import stats

a = np.array([10, 12, 11, 13, 12, 11, 10, 12])
b = np.array([15, 17, 16, 18, 17, 16, 100])              # one wild outlier

print("t-test  p =", stats.ttest_ind(a, b, equal_var=False).pvalue)   # outlier sucks the mean
print("Mann-W  p =", stats.mannwhitneyu(a, b).pvalue)                  # ranks ignore the magnitude

# Rank-biserial correlation — Mann-Whitney's effect size
u   = stats.mannwhitneyu(a, b).statistic
n1, n2 = len(a), len(b)
r_rb = 1 - (2 * u) / (n1 * n2)                           # range [-1, 1]
print(f"rank-biserial r = {r_rb:+.3f}    (±0.1 small / 0.3 med / 0.5 large)")

# One-sided test — only with a directional hypothesis pre-registered
print("a > b? p =", stats.mannwhitneyu(a, b, alternative="greater").pvalue)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - The full nonparametric family + when each is right
# STRENGTHS - Picks the matching test for the design (paired / unpaired / 3+)
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)

# 1) Mann-Whitney is NOT exactly a "median test" — it tests stochastic dominance.
#    "Are values from A typically larger than values from B?" Distributions of
#    different shape can yield significant U even with the same median.
a = np.concatenate([rng.normal(0, 1, 50), [20, 21, 22]])    # heavy right tail
b = rng.normal(0, 3, 50)                                     # wider, same median
print("medians equal-ish:", np.median(a), np.median(b))
print("Mann-W p:", stats.mannwhitneyu(a, b).pvalue)          # may still be significant

# 2) Paired/dependent design -> Wilcoxon signed-rank
before = np.array([22, 25, 28, 24, 26, 27])
after  = np.array([20, 23, 27, 22, 25, 26])
print("Wilcoxon signed-rank p:", stats.wilcoxon(before, after).pvalue)

# 3) 3+ unmatched groups -> Kruskal-Wallis (nonparametric ANOVA)
g1 = rng.normal(0, 1, 20); g2 = rng.normal(0.5, 1, 20); g3 = rng.normal(1, 1, 20)
print("Kruskal-Wallis p:", stats.kruskal(g1, g2, g3).pvalue)

# 4) Permutation test — exact, no distributional assumption
perm = stats.permutation_test((a, b),
                              statistic=lambda x, y: np.median(x) - np.median(y),
                              permutation_type="independent",
                              n_resamples=10_000, random_state=0)
print(f"permutation p = {perm.pvalue:.4f}")

# Decision rule:
#   2 unmatched groups, non-normal       -> Mann-Whitney U
#   2 paired/repeated measurements       -> Wilcoxon signed-rank
#   3+ unmatched groups, non-normal       -> Kruskal-Wallis -> Dunns post-hoc
#   3+ paired (same subjects, k conditions) -> Friedman test
#   small n with ties / want exact          -> permutation_test
#   normal data, no outliers                 -> use the parametric test (t / ANOVA) for power
#
# Anti-pattern: choosing Mann-Whitney just to "be safe"
#   On clean normal data the t-test is more powerful — you'll fail to detect
#   real effects. Pick by the data's shape, not by anxiety about assumptions.
```

## Decision Rule

```text
2 unmatched groups, non-normal       -> Mann-Whitney U
2 paired/repeated measurements       -> Wilcoxon signed-rank
3+ unmatched groups, non-normal       -> Kruskal-Wallis -> Dunns post-hoc
3+ paired (same subjects, k conditions) -> Friedman test
small n with ties / want exact          -> permutation_test
normal data, no outliers                 -> use the parametric test (t / ANOVA) for power
```

## Anti-Pattern

> [!warning] Anti-pattern
> choosing Mann-Whitney just to "be safe"
>   On clean normal data the t-test is more powerful — you'll fail to detect
>   real effects. Pick by the data's shape, not by anxiety about assumptions.

## Tips

- Use when data non-normal, has outliers, or ordinal scale
- Tests if distributions differ; more general than just comparing means
- Less powerful than t-test on normal data, but safer with non-normal

## Common Mistake

> [!warning] Using Mann-Whitney on normal data when t-test available; loses power.

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

- [[Sections/stats/hypothesis-testing-py/anova-test|scipy.stats.f_oneway (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/chi-squared|scipy.stats.chi2_contingency (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/_Index|Statistics & Probability → Hypothesis Testing]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

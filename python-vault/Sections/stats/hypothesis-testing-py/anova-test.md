---
type: "entry"
domain: "python"
file: "stats"
section: "hypothesis-testing-py"
id: "anova-test"
title: "scipy.stats.f_oneway"
category: "Non-parametric Tests"
subtitle: "Compare means across 3+ groups"
signature_short: "scipy.stats.f_oneway(*groups)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.f_oneway"
  - "anova-test"
tags:
  - "python"
  - "python/stats"
  - "python/stats/hypothesis-testing-py"
  - "category/non-parametric-tests"
  - "tier/tiered"
---

# scipy.stats.f_oneway

> Compare means across 3+ groups

## Overview

ANOVA tests if means differ across multiple groups. Returns F-statistic and p-value. Follow up with post-hoc tests if significant.

## Signature

```python
scipy.stats.f_oneway(*groups)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One-way ANOVA on three groups
# STRENGTHS - Smallest valid 3-group test
# WEAKNESSES- No effect size, no post-hoc, no diagnostics
#
import numpy as np
from scipy import stats

a = np.array([10, 12, 11, 13, 12, 11])
b = np.array([15, 17, 16, 18, 17, 16])
c = np.array([20, 22, 21, 23, 22, 21])

f, p = stats.f_oneway(a, b, c)
print(f"F = {f:.2f}, p = {p:.4g}")
print("at least one group differs?" , p < 0.05)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - ANOVA with effect size and follow-up Tukey HSD
# STRENGTHS - The full pipeline: omnibus test -> effect size -> which pair differs
# WEAKNESSES- No assumption checking yet (normality / equal variance)
#
import numpy as np
from scipy import stats

a = np.array([10, 12, 11, 13, 12, 11])
b = np.array([15, 17, 16, 18, 17, 16])
c = np.array([20, 22, 21, 23, 22, 21])

# 1) Omnibus F-test
f_res = stats.f_oneway(a, b, c)
print(f"F = {f_res.statistic:.2f}, p = {f_res.pvalue:.4g}")

# 2) Effect size (eta-squared = SS_between / SS_total)
all_data   = np.concatenate([a, b, c])
grand_mean = all_data.mean()
ss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in (a, b, c))
ss_total   = ((all_data - grand_mean) ** 2).sum()
eta2       = ss_between / ss_total
print(f"eta^2 = {eta2:.3f}    (0.01 small / 0.06 medium / 0.14 large)")

# 3) ANOVA only says "something is different" — Tukey HSD says WHICH pairs
hsd = stats.tukey_hsd(a, b, c)            # scipy >= 1.8
print(hsd)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Assumption checks, Welch ANOVA, Kruskal-Wallis fallback, two-way ANOVA
# STRENGTHS - The decision tree for "compare more than two groups"
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
from scipy import stats

groups = [
    np.array([10, 12, 11, 13, 12, 11]),
    np.array([15, 17, 16, 18, 17, 16]),
    np.array([20, 22, 21, 23, 22, 21]),
]

# 1) Check assumptions BEFORE picking the test
print("Levene equal-var p:", stats.levene(*groups).pvalue)         # >0.05 -> equal var OK
for i, g in enumerate(groups):
    print(f"Shapiro group {i} p:", stats.shapiro(g).pvalue)         # >0.05 -> normal OK

# 2) Equal-variance OK + normal           -> classical f_oneway
#    Unequal variance, normal-ish          -> Welch's ANOVA
#    Non-normal at any group                -> Kruskal-Wallis
import pingouin as pg                                                # has Welch-ANOVA
welch = pg.welch_anova(dv="value", between="group",
                       data=pd.DataFrame({
                           "value": np.concatenate(groups),
                           "group": np.repeat(["A", "B", "C"], [len(g) for g in groups])}))
print(welch)

print("Kruskal-Wallis p:", stats.kruskal(*groups).pvalue)            # nonparametric

# 3) Two-way ANOVA — when you have TWO factors (e.g. drug AND dose)
import statsmodels.formula.api as smf
df = pd.DataFrame({
    "y": np.concatenate(groups),
    "drug": np.repeat(["X", "Y", "Z"], 6),
    "dose": np.tile([1, 2, 3], 6),
})
model = smf.ols("y ~ C(drug) + C(dose) + C(drug):C(dose)", data=df).fit()
print(model.summary().tables[1])

# Decision rule:
#   3+ groups, normal, equal var          -> stats.f_oneway -> Tukey HSD
#   3+ groups, normal, unequal var         -> Welch ANOVA -> Games-Howell post-hoc
#   3+ groups, non-normal / ordinal        -> stats.kruskal -> Dunn's test
#   2 factors / interaction                 -> two-way ANOVA via statsmodels
#   repeated measures (same subjects)       -> repeated-measures ANOVA (pingouin.rm_anova)
#
# Anti-pattern: running pairwise t-tests and ignoring multiple comparisons
#   3 groups -> 3 pairwise tests at alpha=0.05 -> family-wise error ~14%, not 5%.
#   Either use ANOVA + Tukey, or apply Bonferroni / Holm to the t-tests.
```

## Decision Rule

```text
3+ groups, normal, equal var          -> stats.f_oneway -> Tukey HSD
3+ groups, normal, unequal var         -> Welch ANOVA -> Games-Howell post-hoc
3+ groups, non-normal / ordinal        -> stats.kruskal -> Dunn's test
2 factors / interaction                 -> two-way ANOVA via statsmodels
repeated measures (same subjects)       -> repeated-measures ANOVA (pingouin.rm_anova)
```

## Anti-Pattern

> [!warning] Anti-pattern
> running pairwise t-tests and ignoring multiple comparisons
>   3 groups -> 3 pairwise tests at alpha=0.05 -> family-wise error ~14%, not 5%.
>   Either use ANOVA + Tukey, or apply Bonferroni / Holm to the t-tests.

## Tips

- Assumes normality and equal variances; use Levene test to check variances
- If p < 0.05, means differ; use Tukey or Bonferroni for pairwise comparisons
- Eta-squared = SS_between / SS_total; measures effect size

## Common Mistake

> [!warning] Running multiple t-tests instead of ANOVA; ANOVA controls Type I error rate.

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
print(f'\nManual F calculation: {f_manual:.4f}')
```

## See Also

- [[Sections/stats/hypothesis-testing-py/chi-squared|scipy.stats.chi2_contingency (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/mann-whitney|scipy.stats.mannwhitneyu (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/_Index|Statistics & Probability → Hypothesis Testing]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

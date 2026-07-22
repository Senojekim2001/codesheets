---
type: "entry"
domain: "python"
file: "stats"
section: "hypothesis-testing-py"
id: "chi-squared"
title: "scipy.stats.chi2_contingency"
category: "Non-parametric Tests"
subtitle: "Test association between categorical variables"
signature_short: "scipy.stats.chi2_contingency(contingency_table)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.chi2_contingency"
  - "chi-squared"
tags:
  - "python"
  - "python/stats"
  - "python/stats/hypothesis-testing-py"
  - "category/non-parametric-tests"
  - "tier/tiered"
---

# scipy.stats.chi2_contingency

> Test association between categorical variables

## Overview

Tests if two categorical variables are independent. Operates on contingency table (crosstab). Returns chi-squared stat, p-value, dof, expected frequencies.

## Signature

```python
scipy.stats.chi2_contingency(contingency_table)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chi2_contingency on a 2x3 table
# STRENGTHS - One call returns chi^2, p, dof, expected counts
# WEAKNESSES- No assumption check, no effect size
#
import numpy as np
from scipy import stats

table = np.array([[30, 50, 20],         # Product A
                  [15, 40, 45]])        # Product B

res = stats.chi2_contingency(table)
print(f"chi^2 = {res.statistic:.2f}  p = {res.pvalue:.4g}  dof = {res.dof}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Build contingency from a DataFrame, run chi^2, check assumptions, compute Cramers V
# STRENGTHS - Real shape: pd.crosstab -> chi2 -> effect size
# WEAKNESSES- No Fishers exact / G-test for sparse tables yet
#
import numpy as np
import pandas as pd
from scipy import stats

# Real-world: build a contingency table from raw rows
df = pd.DataFrame({
    "product":      np.repeat(list("ABC"), [80, 100, 100]),
    "satisfaction": (["Yes"]*60 + ["No"]*20) +     # Product A
                    (["Yes"]*55 + ["No"]*45) +     # Product B
                    (["Yes"]*55 + ["No"]*45),      # Product C
})
table = pd.crosstab(df["product"], df["satisfaction"])
print(table)

res = stats.chi2_contingency(table)
print(f"chi^2 = {res.statistic:.2f}  p = {res.pvalue:.4g}  dof = {res.dof}")

# Assumption: all expected counts >= 5 (otherwise switch to Fishers exact)
print("min expected:", res.expected_freq.min())

# Effect size — Cramers V (chi^2 normalized to [0, 1])
n       = table.values.sum()
min_dim = min(table.shape) - 1
cramers_v = np.sqrt(res.statistic / (n * min_dim))
print(f"Cramers V = {cramers_v:.3f}    (0.1 small / 0.3 medium / 0.5 large)")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Sparse-table fallbacks, residuals for "where", goodness-of-fit, McNemar
# STRENGTHS - The toolkit for telling WHICH cell is unusual, not just IF
# WEAKNESSES- N/A
#
import numpy as np
from scipy import stats

# 1) Sparse 2x2 -> Fishers exact (no asymptotic approximation)
table_2x2 = np.array([[8, 2],
                      [1, 9]])
odds, p = stats.fisher_exact(table_2x2, alternative="two-sided")
print(f"Fisher: odds_ratio={odds:.2f}, p={p:.4g}")

# 2) Larger sparse table -> G-test (likelihood-ratio chi^2)
table = np.array([[10, 0, 5], [2, 8, 3], [1, 1, 12]])
g, gp, _, _ = stats.chi2_contingency(table, lambda_="log-likelihood")
print(f"G-test: G={g:.2f}, p={gp:.4g}")

# 3) Standardized residuals — which cells deviate from independence?
res = stats.chi2_contingency(table)
exp = res.expected_freq
std_res = (table - exp) / np.sqrt(exp)
print("std residuals:\n", std_res.round(2))
# |residual| > 2 -> that cell drives the rejection.

# 4) Goodness-of-fit (one categorical variable vs expected proportions)
observed = np.array([22, 19, 30, 29])
expected_n = np.array([0.25] * 4) * observed.sum()
chi2, p = stats.chisquare(observed, f_exp=expected_n)
print(f"GOF chi^2 = {chi2:.2f}, p = {p:.4g}")

# 5) Paired/dependent design (pre/post on SAME subjects) -> McNemars test
#    chi-squared assumes independent rows; McNemar tests the off-diagonals.
mcnemar = np.array([[40, 10],     # before yes / after yes, before yes / after no
                    [25, 25]])
from statsmodels.stats.contingency_tables import mcnemar as sm_mcnemar
print("McNemar p:", sm_mcnemar(mcnemar, exact=False).pvalue)

# Decision rule:
#   2x2 with any expected count < 5      -> stats.fisher_exact
#   r x c with sparse cells               -> G-test (lambda_="log-likelihood")
#   r x c, expected counts >= 5           -> stats.chi2_contingency
#   one variable vs expected proportions  -> stats.chisquare (goodness of fit)
#   want to know WHICH cell is unusual    -> standardized residuals; flag |z| > 2
#   paired/repeated measurements           -> McNemar (or its k-variant: Cochran's Q)
#   ordinal categories                      -> Cochran-Armitage trend test
#
# Anti-pattern: chi^2 on a 2x2 with one cell < 5
#   The asymptotic distribution is wrong; p-values are unreliable. Switch to
#   Fishers exact, which works for any cell counts.
```

## Decision Rule

```text
2x2 with any expected count < 5      -> stats.fisher_exact
r x c with sparse cells               -> G-test (lambda_="log-likelihood")
r x c, expected counts >= 5           -> stats.chi2_contingency
one variable vs expected proportions  -> stats.chisquare (goodness of fit)
want to know WHICH cell is unusual    -> standardized residuals; flag |z| > 2
paired/repeated measurements           -> McNemar (or its k-variant: Cochran's Q)
ordinal categories                      -> Cochran-Armitage trend test
```

## Anti-Pattern

> [!warning] Anti-pattern
> chi^2 on a 2x2 with one cell < 5
>   The asymptotic distribution is wrong; p-values are unreliable. Switch to
>   Fishers exact, which works for any cell counts.

## Tips

- All expected frequencies must be >= 5; combine categories if violated
- Cramér's V measures effect size; 0.1=small, 0.3=medium, 0.5=large
- Tests independence, not causation; verify with domain knowledge

## Common Mistake

> [!warning] Using on data with expected frequencies < 5; violates test assumptions.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import pandas as pd
from scipy import stats
data = {
```

**Senior:**
```python
print(f'\nEffect size (Cramér's V): {cramers_v:.4f}')
```

## See Also

- [[Sections/stats/hypothesis-testing-py/anova-test|scipy.stats.f_oneway (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/mann-whitney|scipy.stats.mannwhitneyu (Statistics & Probability)]]
- [[Sections/stats/hypothesis-testing-py/_Index|Statistics & Probability → Hypothesis Testing]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

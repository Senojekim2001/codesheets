---
type: "entry"
domain: "python"
file: "stats"
section: "hypothesis-testing-py"
id: "multiple-testing"
title: "statsmodels.stats.multitest.multipletests"
category: "Error Control"
subtitle: "Control false positives with multiple comparisons"
signature_short: "statsmodels.stats.multitest.multipletests(pvals, method)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "statsmodels.stats.multitest.multipletests"
  - "multiple-testing"
tags:
  - "python"
  - "python/stats"
  - "python/stats/hypothesis-testing-py"
  - "category/error-control"
  - "tier/tiered"
---

# statsmodels.stats.multitest.multipletests

> Control false positives with multiple comparisons

## Overview

When running many tests, p-value threshold must be adjusted to control false positive rate. Bonferroni strict; Benjamini-Hochberg less conservative.

## Signature

```python
statsmodels.stats.multitest.multipletests(pvals, method)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Bonferroni-correct a list of p-values
# STRENGTHS - Smallest valid multiple-testing fix
# WEAKNESSES- No FDR; no comparison of methods
#
import numpy as np
from statsmodels.stats.multitest import multipletests

p = np.array([0.001, 0.012, 0.04, 0.06, 0.20])

reject, p_adj, _, _ = multipletests(p, alpha=0.05, method="bonferroni")
print("reject:", reject)        # bool array
print("adj p: ", p_adj.round(4))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Compare Bonferroni / Holm / Benjamini-Hochberg on the same p-values
# STRENGTHS - Side-by-side shows the power vs error-control tradeoff
# WEAKNESSES- No FWER vs FDR theory; no q-values
#
import numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests

# Simulate 20 tests; first 5 have a real effect of 2 SDs
rng = np.random.default_rng(0)
A = rng.normal(0,    1, size=(20, 30))
B = rng.normal(0,    1, size=(20, 30))
B[:5] += 2.0                                   # 5 true positives

p = np.array([stats.ttest_ind(a, b, equal_var=False).pvalue
              for a, b in zip(A, B)])

print(f"raw p < 0.05: {(p < 0.05).sum()} (with no correction this overstates)")

for method in ("bonferroni", "holm", "fdr_bh"):
    reject, p_adj, _, _ = multipletests(p, alpha=0.05, method=method)
    tp = reject[:5].sum()                       # caught true effects
    fp = reject[5:].sum()                       # false alarms
    print(f"{method:>11}: TP={tp}/5  FP={fp}/15")

# Bonferroni: most conservative (lowest power, lowest FP).
# Holm:       step-down; uniformly better than Bonferroni.
# BH (FDR):   highest power; expected ~5% of "discoveries" are false.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - FWER vs FDR, dependence-aware corrections, q-values, pre-registration
# STRENGTHS - The theory and tools that distinguish "lots of tests" from "p-hacking"
# WEAKNESSES- N/A
#
import numpy as np
from statsmodels.stats.multitest import multipletests

p_values = np.array([0.0001, 0.002, 0.01, 0.04, 0.04, 0.05, 0.10, 0.30])

# 1) FWER methods control P(any false positive) — strict, fewer discoveries.
#    holm is uniformly better than bonferroni; sidak is slightly tighter under independence.
for m in ("bonferroni", "holm", "hommel", "sidak"):
    reject, p_adj, _, _ = multipletests(p_values, alpha=0.05, method=m)
    print(f"{m:>11}: rejects {reject.sum()}")

# 2) FDR methods control E(false / discoveries) — more power, occasional false positives expected.
#    fdr_bh: assumes positive dependence (the safe default for genomic / NHST batteries)
#    fdr_by: the conservative variant valid under arbitrary dependence
for m in ("fdr_bh", "fdr_by"):
    reject, p_adj, _, _ = multipletests(p_values, alpha=0.05, method=m)
    print(f"{m:>11}: rejects {reject.sum()}")

# 3) When tests are highly correlated, Bonferroni is too conservative; permutation
#    methods (e.g., Westfall-Young maxT) preserve the correlation structure and
#    deliver much better power. statsmodels has multipletests but for correlated
#    designs you typically run a permutation-based maxT yourself.

# Decision rule:
#   exploratory hypothesis generation       -> fdr_bh (FDR), q < 0.05 - 0.10
#   confirmatory test, must avoid any FP    -> holm (FWER) — never bonferroni alone
#   genomics / many correlated tests         -> fdr_by, OR permutation maxT
#   pre-registered single primary test        -> NO correction; correct only the secondary tests
#   garden of forking paths (decided after seeing data) -> the only fix is pre-registration
#
# Anti-pattern: running the full battery, then "correcting only the significant ones"
#   That's not correction — that's selecting. Run the correction over EVERY p-value
#   you computed, including the boring ones, or your alpha is meaningless.
```

## Decision Rule

```text
exploratory hypothesis generation       -> fdr_bh (FDR), q < 0.05 - 0.10
confirmatory test, must avoid any FP    -> holm (FWER) — never bonferroni alone
genomics / many correlated tests         -> fdr_by, OR permutation maxT
pre-registered single primary test        -> NO correction; correct only the secondary tests
garden of forking paths (decided after seeing data) -> the only fix is pre-registration
```

## Anti-Pattern

> [!warning] Anti-pattern
> running the full battery, then "correcting only the significant ones"
>   That's not correction — that's selecting. Run the correction over EVERY p-value
>   you computed, including the boring ones, or your alpha is meaningless.

## Tips

- Bonferroni: use when controlling family-wise error rate; most conservative
- Benjamini-Hochberg: use when controlling false discovery rate; more power
- Always report number of tests conducted; supports reproducibility

## Common Mistake

> [!warning] Running many tests without adjustment; leads to false positives.

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

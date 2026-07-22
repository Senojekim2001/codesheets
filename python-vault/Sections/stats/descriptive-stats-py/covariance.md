---
type: "entry"
domain: "python"
file: "stats"
section: "descriptive-stats-py"
id: "covariance"
title: "np.cov, pandas .cov(), .corr()"
category: "Multivariate"
subtitle: "Joint variability across multiple variables"
signature_short: "np.cov(X.T), df.cov(), df.corr()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.cov, pandas .cov(), .corr()"
  - "covariance"
tags:
  - "python"
  - "python/stats"
  - "python/stats/descriptive-stats-py"
  - "category/multivariate"
  - "tier/tiered"
---

# np.cov, pandas .cov(), .corr()

> Joint variability across multiple variables

## Overview

Covariance measures joint variability; correlation is normalized covariance (-1 to 1). Matrices reveal all pairwise relationships in dataset.

## Signature

```python
np.cov(X.T), df.cov(), df.corr()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Pandas .cov() and .corr() on a small DataFrame
# STRENGTHS - Smallest demo of pairwise covariance/correlation matrices
# WEAKNESSES- No interpretation, no axis-orientation gotcha
#
import pandas as pd

df = pd.DataFrame({
    "age":          [25, 30, 35, 40, 45, 50],
    "income":       [40_000, 50_000, 60_000, 75_000, 85_000, 95_000],
    "hours_worked": [35, 40, 45, 50, 45, 40],
})

print(df.cov())                                  # covariance matrix
print(df.corr())                                 # correlation matrix (-1..1)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pandas vs numpy interfaces; the .T trap; non-Pearson correlations
# STRENGTHS - The two interfaces side by side and the orientation rule
# WEAKNESSES- No PSD/conditioning discussion, no robust covariance
#
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "age":    [25, 30, 35, 40, 45, 50],
    "income": [40_000, 50_000, 60_000, 75_000, 85_000, 95_000],
    "hours":  [35, 40, 45, 50, 45, 40],
})

# 1) numpy: rows = variables, columns = observations. ALWAYS transpose a (n, k) frame.
cov_np = np.cov(df.values.T)                     # shape (3, 3)
print(cov_np)

# 2) pandas just does the right thing — and can switch correlation kind
print(df.corr(method="pearson"))                 # default
print(df.corr(method="spearman"))                # rank-based, robust to outliers

# 3) Convert covariance -> correlation by hand
std = df.std(ddof=1).values
corr_from_cov = df.cov().values / np.outer(std, std)
print(np.allclose(corr_from_cov, df.corr().values))   # True
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Robust covariance, conditioning, missing data, scaling for finance/ML
# STRENGTHS - The patterns that keep covariance matrices usable in real pipelines
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 4))
X[0, :] = 50                                          # one outlier row contaminates everything

# 1) Robust covariance — empirical covariance is destroyed by one outlier
from sklearn.covariance import MinCovDet
robust = MinCovDet(random_state=0).fit(X)
print("empirical det:", np.linalg.det(np.cov(X.T)))
print("robust   det:", np.linalg.det(robust.covariance_))

# 2) Sample-too-small / collinear -> matrix is singular or near-singular.
#    Shrinkage pulls cov toward a diagonal target, fixing conditioning.
from sklearn.covariance import LedoitWolf
shrunk = LedoitWolf().fit(X).covariance_

# 3) Missing data — pairwise vs listwise has very different bias profiles
df = pd.DataFrame(X)
df.iloc[0, 0] = np.nan
print(df.cov())                                       # pandas: pairwise by default
print(df.dropna().cov())                              # listwise: drops rows with any NaN

# 4) For correlations on ranks (robust + monotonic) use spearman or kendall
print(df.corr(method="spearman").round(2))

# Decision rule:
#   exploratory data analysis             -> df.cov() / df.corr() and inspect
#   features for ML / linear models        -> standardize first; cov of standardized = corr
#   outliers suspected                      -> MinCovDet (robust) or Spearman corr
#   high-dim, small n (cov is singular)     -> Ledoit-Wolf shrinkage
#   portfolio / risk modeling                -> exponentially weighted cov, not equal-weight
#   missing data                              -> understand pairwise (more bias) vs listwise (less data)
#
# Anti-pattern: feeding a non-PSD covariance matrix to a Gaussian / Mahalanobis
#   Pairwise-deletion or correlation-from-pieces can produce a matrix that ISN'T
#   positive semi-definite. Check eigenvalues; use shrinkage if they go negative.
```

## Decision Rule

```text
exploratory data analysis             -> df.cov() / df.corr() and inspect
features for ML / linear models        -> standardize first; cov of standardized = corr
outliers suspected                      -> MinCovDet (robust) or Spearman corr
high-dim, small n (cov is singular)     -> Ledoit-Wolf shrinkage
portfolio / risk modeling                -> exponentially weighted cov, not equal-weight
missing data                              -> understand pairwise (more bias) vs listwise (less data)
```

## Anti-Pattern

> [!warning] Anti-pattern
> feeding a non-PSD covariance matrix to a Gaussian / Mahalanobis
>   Pairwise-deletion or correlation-from-pieces can produce a matrix that ISN'T
>   positive semi-definite. Check eigenvalues; use shrinkage if they go negative.

## Tips

- Use .T with np.cov() — rows must be variables, columns observations
- Correlation standardizes covariance to [-1, 1] for easier interpretation
- Covariance values depend on scale of variables; hard to interpret directly

## Common Mistake

> [!warning] Forgetting .T in np.cov(X.T); without it, treats each column as variable.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import pandas as pd
data = {
'age': [25, 30, 35, 40, 45, 50],
```

**Senior:**
```python
print(f'Correlation(age, income): {corr_manual:.4f}')
```

## See Also

- [[Sections/stats/descriptive-stats-py/_Index|Statistics & Probability → Descriptive Statistics]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

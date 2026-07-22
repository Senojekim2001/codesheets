---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "lasso_regression"
title: "Lasso"
category: "Linear Models"
subtitle: "Regularized with L1 penalty"
signature_short: "Lasso(alpha=0.1, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Lasso"
  - "lasso_regression"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/linear-models"
  - "tier/tiered"
---

# Lasso

> Regularized with L1 penalty

## Overview

Adds L1 penalty to coefficients, performing automatic feature selection by forcing some coefficients to exactly zero.

## Signature

```python
Lasso(alpha=0.1, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Lasso = linear regression + L1 penalty.
#             Forces some coefficients to exactly 0
#             (feature selection).
# STRENGTHS - automatic feature selection inside the
#             model.
# WEAKNESSES- doesn't yet show scaling or LassoCV.
#
from sklearn.linear_model import Lasso

reg = Lasso(alpha=0.1)
reg.fit(X_train, y_train)
print((reg.coef_ != 0).sum(), "features selected")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Lasso surface: scale FIRST,
#             use LassoCV to pick alpha, examine which
#             features were zeroed out as the
#             interpretable feature-selection story.
# STRENGTHS - LassoCV is the cleanest way to set alpha;
#             the "which features survived?" output is
#             the main reason to use Lasso.
# WEAKNESSES- doesn't address ElasticNet for correlated
#             features or post-Lasso refit — senior tier.
#
import numpy as np
from sklearn.linear_model import LassoCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("lasso", LassoCV(
        alphas=np.logspace(-4, 1, 50),
        cv=5,
        random_state=42,
        max_iter=10_000,
    )),
])
pipe.fit(X_train, y_train)
lasso = pipe.named_steps["lasso"]

print(f"alpha:  {lasso.alpha_:.5f}")
selected = [name for name, c in zip(feature_names, lasso.coef_) if c != 0]
print(f"selected ({len(selected)}): {selected}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production Lasso: when features are
#             correlated, Lasso arbitrarily picks one
#             and zeros the rest — switch to ElasticNet
#             for stable selection. Optionally refit
#             OLS on the selected features ("relaxed
#             Lasso") for unbiased coefficients.
# STRENGTHS - ElasticNet stabilizes selection across
#             correlated groups; relaxed Lasso fixes
#             the shrinkage bias on selected features.
# WEAKNESSES- ElasticNet adds an extra hyperparameter;
#             refit-on-selected is slightly more code
#             than a single estimator.
#
import numpy as np
from sklearn.linear_model import LassoCV, ElasticNetCV, LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# 1. ElasticNet for stable selection under correlation
en = Pipeline([
    ("scale", StandardScaler()),
    ("en", ElasticNetCV(
        l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0],
        alphas=np.logspace(-4, 1, 30),
        cv=5, random_state=42, max_iter=10_000,
    )),
])
en.fit(X_train, y_train)

# 2. Relaxed Lasso — refit OLS on the selected features
lasso = LassoCV(cv=5, random_state=42, max_iter=10_000).fit(X_train, y_train)
mask = lasso.coef_ != 0
relaxed = LinearRegression().fit(X_train[:, mask], y_train)

# Decision rule:
#   feature selection inline                        -> Lasso
#   features correlated, want stable selection      -> ElasticNet
#   need unbiased coefficients on selected features -> relaxed Lasso
#   no selection needed, just shrinkage             -> Ridge
#   tune alpha via CV                               -> LassoCV / ElasticNetCV
#   slow convergence                                -> raise max_iter to 10000+
#
# Anti-pattern: treating Lasso's nonzero coefficients as a stable feature ranking
#   With correlated predictors Lasso picks one almost at random and zeros
#   the rest; rerunning on a resample gives a different "selected set".
#   Use ElasticNet (or stability selection) when you need a reliable
#   feature list, and never compare coefficient magnitudes on unscaled X.
```

## Decision Rule

```text
feature selection inline                        -> Lasso
features correlated, want stable selection      -> ElasticNet
need unbiased coefficients on selected features -> relaxed Lasso
no selection needed, just shrinkage             -> Ridge
tune alpha via CV                               -> LassoCV / ElasticNetCV
slow convergence                                -> raise max_iter to 10000+
```

## Anti-Pattern

> [!warning] Anti-pattern
> treating Lasso's nonzero coefficients as a stable feature ranking
>   With correlated predictors Lasso picks one almost at random and zeros
>   the rest; rerunning on a resample gives a different "selected set".
>   Use ElasticNet (or stability selection) when you need a reliable
>   feature list, and never compare coefficient magnitudes on unscaled X.

## Tips

- Lasso performs feature selection; some coefficients become exactly zero
- Higher alpha increases sparsity; tune via cross-validation
- Use for interpretability; identifies most important features automatically

## Common Mistake

> [!warning] Using Lasso without scaling; affects which features are penalized.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.linear_model import Lasso
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
```

**Senior:**
```python
print(f'Non-zero coefficients: {np.sum(model.coef_ != 0)}')
```

## See Also

- [[Sections/ml/classification/logistic_regression|LogisticRegression (Machine Learning)]]
- [[Sections/ml/regression/linear_regression|LinearRegression (Machine Learning)]]
- [[Sections/ml/regression/ridge_regression|Ridge (Machine Learning)]]
- [[Sections/ml/regression/elasticnet_regression|ElasticNet (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]

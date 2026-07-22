---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "ridge_regression"
title: "Ridge"
category: "Linear Models"
subtitle: "Regularized with L2 penalty"
signature_short: "Ridge(alpha=1.0, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Ridge"
  - "ridge_regression"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/linear-models"
  - "tier/tiered"
---

# Ridge

> Regularized with L2 penalty

## Overview

Adds L2 penalty to coefficients reducing their magnitude, mitigating multicollinearity effects and preventing overfitting with shrinkage regularization.

## Signature

```python
Ridge(alpha=1.0, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Ridge = linear regression + L2 penalty.
#             alpha controls strength.
# STRENGTHS - shrinks coefficients, helps with
#             multicollinearity; the safe regularized
#             baseline.
# WEAKNESSES- doesn't yet show scaling or alpha tuning
#             via RidgeCV.
#
from sklearn.linear_model import Ridge

reg = Ridge(alpha=1.0)
reg.fit(X_train, y_train)
reg.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Ridge surface: scale FIRST
#             (penalty is scale-sensitive), tune alpha
#             with RidgeCV (built-in cross-validation),
#             interpret shrunk coefficients.
# STRENGTHS - RidgeCV is dramatically faster than
#             GridSearchCV for alpha tuning; scaling +
#             Ridge is the standard linear-regression
#             upgrade.
# WEAKNESSES- doesn't address Lasso/ElasticNet or
#             feature selection — separate entries.
#
from sklearn.linear_model import RidgeCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Pipeline + RidgeCV — alpha tuned automatically
import numpy as np
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("ridge", RidgeCV(
        alphas=np.logspace(-3, 3, 13),       # 0.001 to 1000
        cv=5,
    )),
])
pipe.fit(X_train, y_train)
print(f"alpha: {pipe.named_steps['ridge'].alpha_}")
print(f"R^2:   {pipe.score(X_test, y_test):.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production Ridge: kernel="rbf" Ridge for
#             non-linear data via KernelRidge, polynomial
#             features for interaction terms, prefer
#             Ridge over plain LinearRegression as the
#             default — it never hurts and often helps.
# STRENGTHS - KernelRidge brings non-linear capacity
#             without the SVR cost; polynomial Ridge is
#             the cleanest way to get interaction terms
#             with regularization.
# WEAKNESSES- KernelRidge is O(n^2) — slow at scale;
#             polynomial features explode column count.
#
from sklearn.linear_model import Ridge, RidgeCV
from sklearn.kernel_ridge import KernelRidge
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import Pipeline
import numpy as np

# 1. Polynomial Ridge — captures non-linear / interaction terms
poly_pipe = Pipeline([
    ("poly",  PolynomialFeatures(degree=2, interaction_only=False)),
    ("scale", StandardScaler()),
    ("ridge", RidgeCV(alphas=np.logspace(-2, 4, 13), cv=5)),
])

# 2. KernelRidge — non-linear, no manual feature engineering
kr = KernelRidge(alpha=1.0, kernel="rbf", gamma=0.1)

# Default rule:
#   "should I use LinearRegression or Ridge?"
#     -> Ridge with small alpha. It's strictly better when in doubt.
#
#   need feature selection                   -> Lasso
#   non-linear via polynomial features        -> Ridge + PolynomialFeatures
#   non-linear via kernels                    -> KernelRidge
#   need both reg AND selection               -> ElasticNet
#
# Decision rule:
#   default linear regressor          -> Ridge (alpha tuned by RidgeCV)
#   need feature selection             -> Lasso
#   correlated features + selection    -> ElasticNet
#   non-linear via polynomial          -> PolynomialFeatures + Ridge
#   non-linear, small N                -> KernelRidge(kernel="rbf")
#   noisy data, many features          -> raise alpha (more shrinkage)
#   alpha grid                         -> RidgeCV(alphas=np.logspace(-2,4,13))
#
# Anti-pattern: tuning alpha by hand on the test set
#   Sweeping alpha and picking the value that gives best test R^2 is just
#   manual data leakage; the held-out score is now optimistically biased.
#   Use RidgeCV (built-in efficient leave-one-out path) or a Pipeline +
#   GridSearchCV. Also: never run Ridge on unscaled features — large-scale
#   columns absorb most of the penalty and the regularization is uneven.
```

## Decision Rule

```text
default linear regressor          -> Ridge (alpha tuned by RidgeCV)
need feature selection             -> Lasso
correlated features + selection    -> ElasticNet
non-linear via polynomial          -> PolynomialFeatures + Ridge
non-linear, small N                -> KernelRidge(kernel="rbf")
noisy data, many features          -> raise alpha (more shrinkage)
alpha grid                         -> RidgeCV(alphas=np.logspace(-2,4,13))
```

## Anti-Pattern

> [!warning] Anti-pattern
> tuning alpha by hand on the test set
>   Sweeping alpha and picking the value that gives best test R^2 is just
>   manual data leakage; the held-out score is now optimistically biased.
>   Use RidgeCV (built-in efficient leave-one-out path) or a Pipeline +
>   GridSearchCV. Also: never run Ridge on unscaled features — large-scale
>   columns absorb most of the penalty and the regularization is uneven.

## Tips

- Higher alpha increases regularization strength; tune via cross-validation
- All coefficients are shrunk proportionally; none forced to zero
- Better than LinearRegression when multicollinearity is present

## Common Mistake

> [!warning] Not scaling features before Ridge; affects regularization penalty magnitude.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
```

**Senior:**
```python
print(f'Sum of squared coefficients: {(model.coef_**2).sum():.3f}')
```

## See Also

- [[Sections/ml/classification/logistic_regression|LogisticRegression (Machine Learning)]]
- [[Sections/ml/regression/linear_regression|LinearRegression (Machine Learning)]]
- [[Sections/ml/regression/lasso_regression|Lasso (Machine Learning)]]
- [[Sections/ml/regression/elasticnet_regression|ElasticNet (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]

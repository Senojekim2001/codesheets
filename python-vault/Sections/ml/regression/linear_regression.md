---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "linear_regression"
title: "LinearRegression"
category: "Linear Models"
subtitle: "Least squares fitting"
signature_short: "LinearRegression().fit(X_train, y_train)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "LinearRegression"
  - "linear_regression"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/linear-models"
  - "tier/tiered"
---

# LinearRegression

> Least squares fitting

## Overview

Fits a linear relationship between features and target by minimizing sum of squared residuals, providing interpretable coefficients and baseline comparisons.

## Signature

```python
LinearRegression().fit(X_train, y_train)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fit, predict, score with R^2.
# STRENGTHS - the universal regression baseline.
# WEAKNESSES- doesn't yet show MSE/RMSE/MAE or coef
#             interpretation.
#
from sklearn.linear_model import LinearRegression

reg = LinearRegression()
reg.fit(X_train, y_train)
reg.score(X_test, y_test)              # R^2
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday regression metrics: MSE,
#             RMSE, MAE; interpret coefficients;
#             check residuals; cross-validation.
# STRENGTHS - the four-metric panel + residual check
#             is the standard regression diagnostic.
# WEAKNESSES- doesn't address regularization (Ridge/
#             Lasso), heteroscedasticity, or robust
#             alternatives — senior tier.
#
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import cross_val_score

reg = LinearRegression().fit(X_train, y_train)
y_pred = reg.predict(X_test)

mse  = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
mae  = mean_absolute_error(y_test, y_pred)
r2   = r2_score(y_test, y_pred)

# Coefficient interpretation: change in y per unit change in x_i
for name, c in zip(feature_names, reg.coef_):
    print(f"{name:20s} {c:+.3f}")

# Cross-validated R^2
cv = cross_val_score(reg, X, y, cv=5, scoring="r2")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production linear regression: scale
#             features (matters for regularization,
#             optional otherwise), check residuals for
#             heteroscedasticity, use HuberRegressor for
#             outlier-heavy data, statsmodels for full
#             inference (p-values, CIs).
# STRENGTHS - residual-vs-fitted is the standard
#             diagnostic; HuberRegressor is the easiest
#             outlier defense; statsmodels gives the
#             stats sklearn omits.
# WEAKNESSES- statsmodels is a separate dep; Huber
#             tunes one extra parameter (epsilon).
#
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, HuberRegressor
import statsmodels.api as sm

# 1. Residual diagnostic
reg = LinearRegression().fit(X_train, y_train)
resid = y_train - reg.predict(X_train)
plt.scatter(reg.predict(X_train), resid, alpha=0.4)
plt.axhline(0, color="black", linewidth=0.5)
# Look for: random scatter (good), curved pattern (non-linear),
# fan shape (heteroscedasticity).

# 2. Robust regression — outlier-resistant
robust = HuberRegressor(epsilon=1.35).fit(X_train, y_train)

# 3. statsmodels for inference (p-values, CIs)
X_const = sm.add_constant(X_train)
ols = sm.OLS(y_train, X_const).fit()
print(ols.summary())          # coef, std err, t, p-value, [95% CI]

# Decision rule:
#   linear baseline                   -> LinearRegression
#   multicollinearity                 -> Ridge
#   feature selection inline          -> Lasso
#   outliers in y                     -> HuberRegressor / RANSAC
#   need p-values / CIs               -> statsmodels.OLS
#   non-linear pattern in residuals   -> add polynomial / move to GBM
#   wildly different feature scales   -> scale features before regularizing
#
# Anti-pattern: reading coefficient magnitudes as "feature importance"
#   On unscaled features the coefficient size reflects unit choice, not
#   importance — kilometers vs millimeters flips ranking. Always scale
#   first if you plan to compare coefficients, or use partial dependence
#   / permutation importance. Also: R^2 on training data hides overfit.
```

## Decision Rule

```text
linear baseline                   -> LinearRegression
multicollinearity                 -> Ridge
feature selection inline          -> Lasso
outliers in y                     -> HuberRegressor / RANSAC
need p-values / CIs               -> statsmodels.OLS
non-linear pattern in residuals   -> add polynomial / move to GBM
wildly different feature scales   -> scale features before regularizing
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading coefficient magnitudes as "feature importance"
>   On unscaled features the coefficient size reflects unit choice, not
>   importance — kilometers vs millimeters flips ranking. Always scale
>   first if you plan to compare coefficients, or use partial dependence
>   / permutation importance. Also: R^2 on training data hides overfit.

## Tips

- Interpret coefficients as change in y per unit change in each feature
- Check for multicollinearity among features using correlation matrix
- Use for baseline comparisons; more complex models should exceed this performance

## Common Mistake

> [!warning] Not checking linear assumptions; LinearRegression requires approximately linear relationship.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
```

**Senior:**
```python
print(f'Intercept: {model.intercept_:.3f}')
```

## See Also

- [[Sections/ml/classification/logistic_regression|LogisticRegression (Machine Learning)]]
- [[Sections/ml/regression/ridge_regression|Ridge (Machine Learning)]]
- [[Sections/ml/regression/lasso_regression|Lasso (Machine Learning)]]
- [[Sections/ml/regression/elasticnet_regression|ElasticNet (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]

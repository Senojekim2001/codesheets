---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "simple-linear-regression"
title: "scipy.stats.linregress"
category: "Linear Models"
subtitle: "Fit line y = a + bx with p-values and CI"
signature_short: "scipy.stats.linregress(x, y)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scipy.stats.linregress"
  - "simple-linear-regression"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/linear-models"
  - "tier/tiered"
---

# scipy.stats.linregress

> Fit line y = a + bx with p-values and CI

## Overview

Fits y = intercept + slope*x. Returns slope, intercept, r-value, p-value, std error. Fast and simple for 1 predictor with full inference.

## Signature

```python
scipy.stats.linregress(x, y)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Fit y = a + bx with linregress; print slope, intercept, R^2, p
# STRENGTHS - Smallest valid OLS line + inference in one call
# WEAKNESSES- No residual diagnostics, no CI for slope
#
import numpy as np
from scipy import stats

x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = np.array([2.1, 4.0, 6.2, 7.9, 10.0, 11.7, 13.9, 16.1, 17.8, 20.5])

r = stats.linregress(x, y)
print(f"slope={r.slope:.3f}  intercept={r.intercept:.3f}")
print(f"R^2={r.rvalue**2:.3f}  p={r.pvalue:.3g}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Add residual checks, CI for slope, predictions
# STRENGTHS - The minimum due-diligence kit before trusting a regression line
# WEAKNESSES- No homoscedasticity / leverage diagnostics yet
#
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
x = np.linspace(0, 10, 30)
y = 2.5 * x + rng.normal(0, 2, len(x))

r = stats.linregress(x, y)
print(f"slope={r.slope:.3f} (SE={r.stderr:.3f})  intercept={r.intercept:.3f}")
print(f"R^2={r.rvalue**2:.3f}  p={r.pvalue:.3g}")

# 95% CI for slope using the t-distribution
df = len(x) - 2
t_crit = stats.t.ppf(0.975, df)
print(f"slope 95% CI: ({r.slope - t_crit*r.stderr:.3f}, {r.slope + t_crit*r.stderr:.3f})")

# Residual sanity checks
y_hat   = r.intercept + r.slope * x
res     = y - y_hat
print(f"residual mean: {res.mean():.3f} (should be ~0)")
print(f"Shapiro on residuals p: {stats.shapiro(res).pvalue:.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Diagnostics, leverage, robust regression for outliers, statsmodels for inference
# STRENGTHS - The full diagnostic kit + when to abandon OLS for robust methods
# WEAKNESSES- N/A
#
import numpy as np
import statsmodels.api as sm
from scipy import stats

rng = np.random.default_rng(0)
x = np.linspace(0, 10, 50)
y = 2.5 * x + rng.normal(0, 2, len(x))
y[-1] = 50                                          # one influential outlier

# 1) statsmodels gives a richer summary than scipy.linregress
X     = sm.add_constant(x)
model = sm.OLS(y, X).fit()
print(model.summary().tables[1])                    # coef table

# 2) Diagnostics that catch most regression bugs
infl = model.get_influence()
leverage = infl.hat_matrix_diag                     # > 2*p/n -> high leverage
cooks_d  = infl.cooks_distance[0]                   # > 4/n -> influential point
print(f"max leverage: {leverage.max():.3f}")
print(f"max Cook's D: {cooks_d.max():.3f}")

# Residual vs fitted homoscedasticity test (Breusch-Pagan)
from statsmodels.stats.diagnostic import het_breuschpagan
bp = het_breuschpagan(model.resid, X)
print(f"Breusch-Pagan p: {bp[1]:.3f}    (small -> heteroscedastic)")

# 3) Robust regression — downweights outliers automatically
robust = sm.RLM(y, X, M=sm.robust.norms.HuberT()).fit()
print(f"OLS    slope: {model.params[1]:.3f}")
print(f"Robust slope: {robust.params[1]:.3f}")      # ~ true slope (2.5)

# 4) Heteroscedasticity-consistent SEs (use when BP rejects)
hc3_model = sm.OLS(y, X).fit(cov_type="HC3")        # White / sandwich SEs

# Decision rule:
#   1 predictor, quick look                -> scipy.stats.linregress
#   need full inference + diagnostics      -> statsmodels OLS
#   outliers / heavy tails                  -> RLM (robust regression)
#   heteroscedasticity (BP rejects)         -> OLS with cov_type="HC3"
#   correlated errors (time series)         -> GLS or Newey-West SEs
#   nonlinear true relationship              -> add polynomial terms or use GAM
#
# Anti-pattern: reporting R^2 without checking residuals
#   R^2 = 0.95 with a curved residual plot is hiding a model misspecification.
#   ALWAYS plot residuals vs fitted; the plot tells you what R^2 cant.
```

## Decision Rule

```text
1 predictor, quick look                -> scipy.stats.linregress
need full inference + diagnostics      -> statsmodels OLS
outliers / heavy tails                  -> RLM (robust regression)
heteroscedasticity (BP rejects)         -> OLS with cov_type="HC3"
correlated errors (time series)         -> GLS or Newey-West SEs
nonlinear true relationship              -> add polynomial terms or use GAM
```

## Anti-Pattern

> [!warning] Anti-pattern
> reporting R^2 without checking residuals
>   R^2 = 0.95 with a curved residual plot is hiding a model misspecification.
>   ALWAYS plot residuals vs fitted; the plot tells you what R^2 cant.

## Tips

- scipy.stats.linregress efficient for single predictor
- R-squared measures goodness of fit; 0-1 scale
- Check residual normality and homoscedasticity with plots

## Common Mistake

> [!warning] Not checking assumptions (normality, homoscedasticity, independence).

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

- [[Sections/ml/classification/logistic_regression|LogisticRegression (Machine Learning)]]
- [[Sections/ml/regression/linear_regression|LinearRegression (Machine Learning)]]
- [[Sections/ml/regression/ridge_regression|Ridge (Machine Learning)]]
- [[Sections/ml/regression/lasso_regression|Lasso (Machine Learning)]]
- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]

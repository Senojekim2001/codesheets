---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "multiple-regression"
title: "statsmodels.formula.api.ols"
category: "Linear Models"
subtitle: "Fit y ~ x1 + x2 + ... with inference"
signature_short: "statsmodels.formula.api.ols(\"y ~ x1 + x2\").fit()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "statsmodels.formula.api.ols"
  - "multiple-regression"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/linear-models"
  - "tier/tiered"
---

# statsmodels.formula.api.ols

> Fit y ~ x1 + x2 + ... with inference

## Overview

statsmodels provides R-like formula API. Returns comprehensive summary: coefficients, p-values, confidence intervals, model statistics (R², F-test, AIC).

## Signature

```python
statsmodels.formula.api.ols("y ~ x1 + x2").fit()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - statsmodels formula API: ols("y ~ x1 + x2"), .fit(), .summary()
# STRENGTHS - Smallest valid multi-predictor regression
# WEAKNESSES- No interaction, no diagnostics, no prediction CIs
#
import pandas as pd
import statsmodels.formula.api as smf

df = pd.DataFrame({
    "age":        [25, 30, 35, 40, 45, 50, 55, 60],
    "experience": [ 1,  3,  6,  9, 12, 18, 22, 28],
    "salary":     [50, 60, 72, 85, 95, 115, 130, 150],
})

model = smf.ols("salary ~ age + experience", data=df).fit()
print(model.summary().tables[1])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Interactions, categoricals, prediction with CI, model comparison
# STRENGTHS - The four formula features you actually need on real data
# WEAKNESSES- No multicollinearity / VIF check yet
#
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

rng = np.random.default_rng(0)
n = 200
df = pd.DataFrame({
    "age":        rng.uniform(20, 60, n),
    "experience": rng.uniform(0, 30, n),
    "dept":       rng.choice(["eng", "sales", "ops"], n),
})
df["salary"] = (30 + 0.5*df["age"] + 2.0*df["experience"]
                + (df["dept"] == "eng") * 20.0
                + rng.normal(0, 5, n))

# 1) Categorical predictor — C() makes the dummy coding explicit
m1 = smf.ols("salary ~ age + experience + C(dept)", data=df).fit()

# 2) Interaction — does the slope on experience differ across depts?
m2 = smf.ols("salary ~ age + experience * C(dept)", data=df).fit()
print("R^2:    ", m1.rsquared.round(3), "vs", m2.rsquared.round(3))
print("adjR^2: ", m1.rsquared_adj.round(3), "vs", m2.rsquared_adj.round(3))
print("AIC:    ", round(m1.aic, 1), "vs", round(m2.aic, 1))   # lower is better

# 3) Predictions with CIs
new = pd.DataFrame({"age": [30, 40], "experience": [5, 15], "dept": ["eng", "sales"]})
pred = m2.get_prediction(new).summary_frame(alpha=0.05)
print(pred[["mean", "mean_ci_lower", "mean_ci_upper"]])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - VIF for multicollinearity, robust SEs, model selection by AIC, holdout R^2
# STRENGTHS - The discipline that turns a "good R^2" into a defensible model
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.outliers_influence import variance_inflation_factor

rng = np.random.default_rng(0)
n = 300
df = pd.DataFrame({
    "x1": rng.normal(0, 1, n),
    "x2": rng.normal(0, 1, n),
})
df["x3"] = df["x1"] * 0.95 + rng.normal(0, 0.1, n)        # near-duplicate of x1
df["y"]  = 2*df["x1"] + 3*df["x2"] + rng.normal(0, 1, n)

# 1) Multicollinearity — VIF > 10 means the SE of that coef is hugely inflated
X = sm.add_constant(df[["x1", "x2", "x3"]])
for i, name in enumerate(X.columns):
    print(f"VIF[{name:>5}] = {variance_inflation_factor(X.values, i):.1f}")
# x1 and x3 will both have huge VIFs -> drop one or use ridge regression

# 2) Robust covariance — heteroscedasticity-consistent (HC3) SEs
model = smf.ols("y ~ x1 + x2", data=df).fit(cov_type="HC3")
print(model.summary().tables[1])

# 3) Model selection by AIC — penalizes adding predictors
def aic_table(formulas, data):
    rows = [(f, smf.ols(f, data=data).fit().aic) for f in formulas]
    return pd.DataFrame(rows, columns=["formula", "AIC"]).sort_values("AIC")
print(aic_table([
    "y ~ x1",
    "y ~ x1 + x2",
    "y ~ x1 + x2 + x3",
    "y ~ x1 * x2",
], df))

# 4) Out-of-sample R^2 — the only number that matters for prediction claims
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression
cv = cross_val_score(LinearRegression(), df[["x1","x2"]], df["y"], cv=5, scoring="r2")
print(f"CV R^2: mean={cv.mean():.3f}  std={cv.std():.3f}")

# Decision rule:
#   inference focus (which coef matters)   -> statsmodels OLS, report CIs
#   prediction focus                          -> sklearn + cross-val R^2 / MAE
#   collinear predictors (VIF > 10)            -> drop one, OR Ridge / Lasso (sklearn)
#   heteroscedasticity                          -> cov_type="HC3" or "HAC" for time series
#   nested model comparison                     -> ANOVA F-test (anova_lm) on the two fits
#   non-nested model comparison                 -> AIC (or BIC if you prefer parsimony)
#
# Anti-pattern: comparing R^2 across models with different N
#   Dropping rows for missing data shrinks N; R^2 is not comparable across
#   different sample sizes. Filter the data ONCE, fit all candidates on the
#   same sample, then compare.
```

## Decision Rule

```text
inference focus (which coef matters)   -> statsmodels OLS, report CIs
prediction focus                          -> sklearn + cross-val R^2 / MAE
collinear predictors (VIF > 10)            -> drop one, OR Ridge / Lasso (sklearn)
heteroscedasticity                          -> cov_type="HC3" or "HAC" for time series
nested model comparison                     -> ANOVA F-test (anova_lm) on the two fits
non-nested model comparison                 -> AIC (or BIC if you prefer parsimony)
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing R^2 across models with different N
>   Dropping rows for missing data shrinks N; R^2 is not comparable across
>   different sample sizes. Filter the data ONCE, fit all candidates on the
>   same sample, then compare.

## Tips

- Use R-like formula syntax: "y ~ x1 + x2" or "y ~ x1 + x2 + x1:x2"
- Adjusted R² penalizes additional predictors; use for model comparison
- F-test overall model significance; t-tests individual coefficients

## Common Mistake

> [!warning] Including correlated predictors (multicollinearity); check VIF.

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

---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "logistic-regression-stats"
title: "statsmodels.formula.api.logit"
category: "Linear Models"
subtitle: "Probabilistic binary outcome model"
signature_short: "statsmodels.formula.api.logit(\"y ~ x1 + x2\").fit()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "statsmodels.formula.api.logit"
  - "logistic-regression-stats"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/linear-models"
  - "tier/tiered"
---

# statsmodels.formula.api.logit

> Probabilistic binary outcome model

## Overview

Models P(y=1) using logistic function. Returns probabilities, coefficients as log-odds, odds ratios. Full inference: p-values, confidence intervals.

## Signature

```python
statsmodels.formula.api.logit("y ~ x1 + x2").fit()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - smf.logit for binary outcomes; print coefficients
# STRENGTHS - The minimum-shape logistic-regression call
# WEAKNESSES- No odds-ratio interpretation, no probability predictions
#
import pandas as pd
import statsmodels.formula.api as smf

df = pd.DataFrame({
    "age":       [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    "purchased": [0,  0,  0,  1,  0,  1,  1,  1,  1,  1],
})

model = smf.logit("purchased ~ age", data=df).fit(disp=False)
print(model.summary().tables[1])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multiple predictors, odds ratios, predicted probabilities, threshold pick
# STRENGTHS - The full read: log-odds -> odds ratio -> probability -> class
# WEAKNESSES- No calibration, no class-imbalance discussion
#
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from scipy.special import expit

rng = np.random.default_rng(0)
n = 500
df = pd.DataFrame({"age":   rng.uniform(20, 70, n),
                   "score": rng.uniform(0, 100, n)})
prob = expit(-3 + 0.05*df["age"] + 0.03*df["score"])
df["purchased"] = (rng.random(n) < prob).astype(int)

model = smf.logit("purchased ~ age + score", data=df).fit(disp=False)
print(model.summary().tables[1])

# Odds ratio = exp(coef). "A 1-unit increase in age multiplies the odds by..."
print("odds ratios:")
print(np.exp(model.params).round(3))

# Predict probabilities for new rows
new = pd.DataFrame({"age": [30, 50, 65], "score": [40, 70, 90]})
probs = model.predict(new)
print("predicted P(purchase):", probs.round(3).values)

# Threshold to a class label — 0.5 is rarely optimal in production
print("predicted class:", (probs > 0.5).astype(int).values)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Class imbalance, calibration, threshold tuning, separation, robust SEs
# STRENGTHS - The hardening that makes logistic regression actually deployable
# WEAKNESSES- N/A
#
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from scipy.special import expit
from sklearn.metrics import roc_auc_score, brier_score_loss
from sklearn.calibration import calibration_curve

rng = np.random.default_rng(0)
n = 5000
df = pd.DataFrame({
    "x1": rng.normal(0, 1, n),
    "x2": rng.normal(0, 1, n),
})
# Severe imbalance — only ~5% positives
df["y"] = (rng.random(n) < expit(-3 + 1.5*df["x1"] + 0.5*df["x2"])).astype(int)
print("base rate:", df["y"].mean().round(3))

# 1) Logistic regression on imbalanced data still works for ESTIMATION (no class
#    weighting needed for inference). It only matters for class predictions.
model = smf.logit("y ~ x1 + x2", data=df).fit(disp=False)

# 2) AUC + Brier — never lean on accuracy when the base rate is far from 50%
p_hat = model.predict(df)
print(f"AUC:   {roc_auc_score(df['y'], p_hat):.3f}")
print(f"Brier: {brier_score_loss(df['y'], p_hat):.3f}")

# 3) Calibration — are predicted 30% events actually happening 30% of the time?
fp, mp = calibration_curve(df["y"], p_hat, n_bins=10)
print("calibration (frac_pos vs mean_pred):")
for f, m in zip(fp, mp):
    print(f"  {m:.2f} -> {f:.2f}")

# 4) Threshold by business cost, not 0.5
def best_threshold(y, p, fp_cost=1.0, fn_cost=5.0):
    ts = np.linspace(0.01, 0.99, 99)
    losses = [(t, (((p >= t) & (y == 0)).sum()) * fp_cost
                 + (((p <  t) & (y == 1)).sum()) * fn_cost) for t in ts]
    return min(losses, key=lambda x: x[1])
print("optimal threshold:", best_threshold(df["y"].values, p_hat.values))

# 5) Quasi-separation diagnostic: huge coefs + huge SEs -> perfect predictor exists
#    Fix: penalized logistic regression (sklearn LogisticRegression(penalty='l2'))
#    or Firth's correction (statsmodels has it via 'penalty' in newer versions).

# Decision rule:
#   inference (which feature matters)         -> statsmodels logit, report CIs and ORs
#   prediction (production scoring)             -> sklearn LogisticRegression with regularization
#   class imbalance for INFERENCE                -> no weighting; check calibration
#   class imbalance for CLASSIFICATION            -> tune threshold via business cost
#   probabilities feed business decisions         -> calibrate with isotonic / Platt
#   complete separation (huge coefs, infinite OR) -> regularize (L2) or Firth
#
# Anti-pattern: judging logistic regression by accuracy on imbalanced data
#   95% accuracy with 5% base rate is reachable by predicting "no" for everyone.
#   Use AUC or Brier; if you must report accuracy, also report base-rate baseline.
```

## Decision Rule

```text
inference (which feature matters)         -> statsmodels logit, report CIs and ORs
prediction (production scoring)             -> sklearn LogisticRegression with regularization
class imbalance for INFERENCE                -> no weighting; check calibration
class imbalance for CLASSIFICATION            -> tune threshold via business cost
probabilities feed business decisions         -> calibrate with isotonic / Platt
complete separation (huge coefs, infinite OR) -> regularize (L2) or Firth
```

## Anti-Pattern

> [!warning] Anti-pattern
> judging logistic regression by accuracy on imbalanced data
>   95% accuracy with 5% base rate is reachable by predicting "no" for everyone.
>   Use AUC or Brier; if you must report accuracy, also report base-rate baseline.

## Tips

- Odds ratio > 1: higher x increases odds; < 1: decreases odds
- Predicted values are probabilities [0, 1]; threshold at 0.5 for classification
- Check goodness-of-fit with Hosmer-Lemeshow test

## Common Mistake

> [!warning] Interpreting logistic coefficients as linear effects; use odds ratios.

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
